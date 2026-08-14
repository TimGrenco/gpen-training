# Runbook — operating the portal after launch

[`GOLIVE.md`](GOLIVE.md) is for standing the thing up once. This is for the Tuesday
afternoon when a rep emails saying their code is dead, or when someone needs codes to
stop being issued in the next two minutes.

Every claim below was checked against the code as it stands, and the line references
are there so you can confirm rather than trust.

---

## Stop issuing codes, right now

Three levers. They differ mainly in **what a rep sees**, so pick by that.

### 1. Silent — reps see no reward at all (preferred)

In `assets/js/config.js`, blank the endpoint:

```js
rewards: { url: "" },
```

Commit and push. GitHub Pages redeploys in a minute or two.

`revealReward()` reads `rewards.url` into `pending` (app.js:1852) and **every** on-screen
branch — the "Issuing your code…" state and the "didn't come through" state — is gated
on it. Empty means the panel never renders. Reps still take the training, still get
certified, still land in the sheet. They simply are not offered a code, and nothing
looks broken.

This does not touch codes already issued. Those live in Shopify and keep working.

### 2. Hard — the endpoint refuses

In Vercel → Settings → Environment Variables, **delete `CODE_SALT`** and redeploy.
`api/reward.js:143` fails closed and returns 500 without contacting Shopify.

> Put back the **exact same value** when you re-enable. The salt is what derives each
> code's suffix, so a different salt means every future code changes and a rep who
> reloads their certificate sees a code that is not the one they wrote down. Save the
> old value somewhere before deleting it.

Reps who pass while this is off see the "Your code didn't come through / Try again"
card, because `rewards.url` is still set. That is the honest state, but it generates
support mail — which is why lever 1 is preferred for a planned pause.

### 3. Blunt — Vercel → Deployments → the current one → Disable, or delete the project.

Only if something is actively being abused.

---

## Revoke one rep's code

**Deactivate it. Do not delete it.**

Shopify admin → **Discounts** → search the code (they are titled
`Training 25% — course — dash-ii — rep@store.com`) → set it to inactive / expired.

Deleting looks tidier and is wrong. `api/reward.js:168` does lookup-then-create: it asks
Shopify `codeDiscountNodeByCode` first and only creates when nothing comes back. A
deleted discount is nothing coming back — so the next time that rep loads their
certificate page, the endpoint mints the identical code again and the revocation quietly
undoes itself. A deactivated discount still exists, so the lookup finds it, returns the
same code, and creates nothing. The code stays dead.

Same reasoning if you ever want to *reissue*: delete the discount and have the rep
reload. That is the only supported way to regenerate, and it is deliberate.

---

## "My discount code doesn't work"

Work down this list; it is ordered by how often each one is the answer.

1. **Is it typed right?** The alphabet deliberately excludes `I`, `L`, `O` and `U`, so
   a code read down a phone line should not contain them. If the rep says it has an O,
   it is a zero.
2. **Already used?** Every code is single-use. Shopify admin shows the redemption count.
   If it is 1, that is the answer.
3. **Expired?** Codes last 90 days from issue.
4. **Stacking?** They do not combine with other discounts. If the cart already has one,
   the new code is refused. This looks like "invalid code" at checkout.
5. **Right store?** They are issued on `grencoscience.myshopify.com` and work on
   gpen.com. They are not valid anywhere else.
6. **Not in Shopify at all?** Then it was never minted — the endpoint failed at issue
   time. Check the Vercel function logs for that timestamp. The rep can reload their
   certificate page to retry; the "Try again" button on the failure card does exactly
   that, and issuance is idempotent so retrying is always safe.

Reissuing is covered above: delete the discount, have them reload.

---

## Editing the Google Sheet script — the trap that gets everyone

Saving `Code.gs` in the Apps Script editor **does not change what the live URL runs.**
The `/exec` URL serves a *deployed version*, and your edit is sitting in the untracked
head revision. The portal keeps running the old code and you conclude your fix did not
work.

To ship an edit **at the same URL**:

**Deploy → Manage deployments → the existing deployment → pencil/edit →
Version: New version → Deploy.**

Do **not** use *Deploy → New deployment* for an update. That mints a **different
`/exec` URL**, leaves the old one live and unchanged, and now you have two endpoints —
the portal still posting to the stale one. If you do it by accident, either point
`reporting.url` in `config.js` at the new URL and push, or archive the new deployment
and update the original.

After redeploying, confirm with a real POST rather than by eye — the check in
[`google-sheet/README.md`](../google-sheet/README.md) does this.

---

## Rotating the Shopify token

If `SHOPIFY_ADMIN_TOKEN` leaks, or someone with access leaves:

1. Shopify → the `Training rewards` app → uninstall it from the store. That kills the
   token immediately; anything holding it starts getting 401s.
2. Reinstall the app and run the handshake in [`GOLIVE.md`](GOLIVE.md) step 3 again to
   get a fresh token. Remember `api/install.js` and `api/oauth-callback.js` must be
   restored to run it, and **deleted again** afterwards.
3. Update `SHOPIFY_ADMIN_TOKEN` in Vercel and redeploy.

Codes already issued are unaffected — they are Shopify objects and do not depend on the
token that created them. Do not change `CODE_SALT` during this; it is unrelated, and
changing it changes every future code.

`SYNC_SECRET` rotates the same way but simpler: new value in Vercel, same new value in
the Apps Script property, redeploy both.

---

## Adding or removing a course

`data.js` is the lineup, but two things move with it and both are easy to miss.

**The top reward tier is `COURSES.length`** (app.js:218). The ladder is 1 → 25%,
2 → 30%, 4 → 35%, all → 40%. Add a seventh course and "all" silently becomes 7, so
every rep who had finished all six loses the 40% tier and the master certificate until
they take the new one. That may well be what you want — just know it happens the moment
you push, without warning, to people who were already finished.

The other rungs are fixed counts and do not move. Drop below 4 courses and the 35% and
40% rungs collide.

**Translations.** A new course needs its copy added to all five bundles in
`assets/data/i18n/`. Run the checker:

```bash
node tools/i18n-check.js fr
```

for each of `es de fr it pt`. It reports missing and stale keys and refuses to pass
until the course count matches. Quiz questions are intentionally never translated.

Removing a course does not remove certificates people already hold — those are in each
rep's own browser storage and in the sheet.

---

## Where to look when something is wrong

| Symptom | Look here |
|---|---|
| No code issued, rep saw the failure card | Vercel → the project → Logs, filtered to `/api/reward` |
| Codes stopped for everyone | Same logs. Grep `CODE_SALT is not configured` and `GLOBAL daily cap hit` |
| "rate limiting is NOT active" in the logs | Upstash is not linked. Codes still mint — uncapped. Fix when convenient |
| Nothing arriving in the sheet | Apps Script → Executions. If empty, the portal is posting to a stale `/exec` — see the redeploy trap above |
| Sheet rows appear but the code column is blank | The rep certified before the reward endpoint went live. It backfills on their next visit; nothing is lost |
| `Used`/`Not yet` column never updates | The hourly sync. Apps Script → Triggers, confirm it exists and is not failing |

Shopify updates redemption counts asynchronously, so a code used minutes ago can still
read `Not yet`. The sheet stamps a checked-at time next to the status for exactly this
reason — it reports what Shopify last said, not what is true this second.

---

## Rate limits

40 codes per IP per day, 500 per day across everyone (`reward-api/lib/ratelimit.js`).

It **fails open** on purpose: if Upstash is unreachable the endpoint keeps minting and
logs loudly, because a third-party blip should not stop reps collecting codes they
earned.

A whole store on one wifi connection shares an IP. If a large training session trips the
40, raise `PER_IP_PER_DAY` in that file and redeploy — the caps are constants, not
settings, and they were picked for normal use rather than a launch-day push.
