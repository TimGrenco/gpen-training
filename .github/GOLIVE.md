# Go live: rewards + tracking sheet

Everything in the portal is built and tested. Four steps remain, and they all need
credentials that only you can supply — a Shopify app, a Vercel login, and a Google
account. Do them in this order; each one is checkable before you move on.

Total time: about 25 minutes.

Once it is live, [`RUNBOOK.md`](RUNBOOK.md) covers running it: killing code issuance in
a hurry, revoking one rep's code (deactivate — deleting it re-mints itself), triaging
"my code doesn't work", the Apps Script redeploy trap, and what adding a seventh course
quietly does to everyone's 40% tier.

Until the last step the reward panel renders nothing — deliberately. A rep who sees
no code files a support ticket; a rep who sees a code that fails at the till loses a
sale and stops trusting the portal.

---

## Step 1 — Create the Shopify app (5 min)

> **The old route is closed.** Creating a custom app from the store admin
> (Settings → Apps and sales channels → Develop apps) stopped being possible on
> **1 January 2026**. Existing admin-created apps still work; new ones must come from
> the **Dev Dashboard**. If you find a guide pointing at the admin, it predates that.
>
> This matters for more than where you click. An admin custom app simply *handed* you
> a permanent `shpat_` token, because it assumed you had no app server. A Dev Dashboard
> app is an OAuth app: it gives you a client ID and secret and expects your app to
> complete a handshake to receive a token. We have no app server on purpose — the
> reward endpoint is a stateless function — so step 3 runs that handshake once, by
> hand, purely to get the token.

At <https://dev.shopify.com/dashboard>, for the Grenco Science organisation:

1. **Apps → Create app**. Under *Start from Dev Dashboard*, name it `Training rewards`
   → **Create**. (Ignore the Shopify CLI option — it scaffolds a whole app project. Our
   endpoint is already written.)
2. On the version form:
   - **App URL**: `https://training.gpen.com`
   - **Uncheck** *Embed app in Shopify admin* — this app has no UI, and leaving it
     checked makes Shopify iframe that URL inside the admin.
   - **Scopes**: `write_discounts,read_discounts` — exactly two, comma-separated.
     Nothing else. This app never needs to see an order, a customer or a product, and
     both were confirmed sufficient against the live API.
   - **Check** *Use legacy install flow*, and set **Redirect URLs** to
     `https://YOUR-PROJECT.vercel.app/api/oauth-callback` once you know the Vercel URL
     from step 2. The "legacy" flow is the authorisation-code grant, which is what a
     non-embedded server-side app uses; the modern managed install assumes an embedded
     UI that can do a token exchange, and we have no UI.
   - Leave POS, app proxy and optional scopes alone. **Release**.
3. There is **no distribution step**. Shopify's docs describe choosing one under
   *App distribution* in the Partner Dashboard; the Dev Dashboard has no such page.
   The app's **Overview** simply has an **Installs** card with an *Install app* button,
   and that is the whole mechanism.

   **Do not press that button.** It runs Shopify's own install flow, which sends its
   own `state` parameter — and our callback verifies a `state` that `/api/install`
   generates, so it would refuse the result. Correctly: the check is doing its job.
   Step 3 uses `/api/install` instead, which is the same handshake with a `state` we
   can verify.

⚠️ **Do not create an "App automation token"** on the Settings page, tempting as the
name is. That authenticates the Shopify CLI to deploy app config; it cannot read store
data at all, and it expires in 1–6 months. The token we need comes from step 3.

---

## Step 2 — Deploy the endpoint first (10 min)

The install callback has to be live *before* you install the app, so Vercel comes
before the handshake.

```bash
cd /Users/timothycotter-patenaude/Documents/Codex/gpen-training && npx vercel --cwd reward-api
```

Note the URL it prints. Then set these in **Settings → Environment Variables**:

| Name | Value |
|---|---|
| `SHOPIFY_SHOP` | `grencoscience.myshopify.com` |
| `SHOPIFY_API_KEY` | the app's **Client ID** |
| `SHOPIFY_API_SECRET` | the app's **Secret** |
| `OAUTH_STATE_SECRET` | `openssl rand -hex 32` |
| `CODE_SALT` | `openssl rand -hex 32` — a different one |
| `SYNC_SECRET` | `openssl rand -hex 32` — a third |
| `ALLOWED_ORIGINS` | `https://training.gpen.com` |

Redeploy so they take effect:

```bash
cd /Users/timothycotter-patenaude/Documents/Codex/gpen-training && npx vercel --prod --cwd reward-api
```

Now go back and set the app's **Redirect URL** to
`https://YOUR-PROJECT.vercel.app/api/oauth-callback` and release that version.

⚠️ `CODE_SALT` makes each code's suffix unguessable. **Changing it later changes every
future code**, so set it once. Codes already issued keep working — they live in Shopify.

---

## Step 3 — Run the handshake once, get the token (2 min)

Open this in a browser — **not** the *Install app* button in the Dev Dashboard, for
the reason in step 1:

```
https://YOUR-PROJECT.vercel.app/api/install
```

It redirects you to Shopify, which asks you to approve **exactly** `write_discounts`
and `read_discounts` — read that screen; it is the audit. Approve, and the callback
prints the permanent Admin API access token.

The token is *offline*: it does not expire and is not tied to your login, which is what
a background function minting codes at 2am needs.

1. Paste it into Vercel as `SHOPIFY_ADMIN_TOKEN`.
2. Confirm the granted scopes on that page read `write_discounts,read_discounts` and
   nothing more.

### Then clean up — this part is not optional

```bash
cd /Users/timothycotter-patenaude/Documents/Codex/gpen-training && rm reward-api/api/install.js reward-api/api/oauth-callback.js && git add -A && git commit -m "Remove the one-time install routes" && git push
```

Then delete `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET` and `OAUTH_STATE_SECRET` from
Vercel and redeploy. The reward endpoint uses none of them — only `SHOPIFY_ADMIN_TOKEN`.

Leaving a live token-minting route deployed is the kind of thing that gets found later.
It is guarded (HMAC, state, and a shop lock), but a route that exists to hand out
credentials should not outlive its one job.

---

## Step 4 — The tracking sheet (5 min)

Full detail in [`google-sheet/README.md`](../google-sheet/README.md). In short:

1. New Google Sheet → **Extensions → Apps Script** → paste
   [`google-sheet/Code.gs`](../google-sheet/Code.gs).
2. **Project Settings → Script properties**: `REWARD_API` =
   `https://YOUR-PROJECT.vercel.app` (origin only, no path, no trailing slash), and
   `SYNC_SECRET` = the same value you put in Vercel.
3. Run the `setup` function once and authorise it. This creates the tabs, the headers
   and the hourly trigger.
4. **Deploy → New deployment → Web app**, *Execute as* **Me**, *Who has access*
   **Anyone**. Anyone is required: reps post from a browser with no Google login. The
   URL is the only thing protecting it, so treat it as a secret.
5. Paste the `/exec` URL into `reporting.url` in `config.js`, commit and push.

### Check it

```bash
curl -s -X POST 'https://script.google.com/macros/s/AKfyc.../exec' -H 'Content-Type: text/plain' -d '{"type":"course","name":"Test Rep","email":"test@example.com","store":"QA","product":"G Pen Dash II","courseSlug":"dash-ii","score":100,"certId":"TEST-1","date":"Aug 12, 2026","attest21":true}'
```

A row appears with `TEST-1`. Run it again — **it updates rather than duplicating**.
Delete the test row when you're done.

---

## Order matters, but nothing is lost if you get it wrong

If the sheet lands after reps have already certified, their completions **and their
discount codes** are re-sent on their next visit. The portal tracks earned separately
from reported for exactly this case. You will not lose the reps who trained early.

---

## What was already verified, so you don't have to

The whole chain was run end to end against a mock Shopify and a mock spreadsheet using
the real handler and `Code.gs` code:

- a rep certifying in the browser → a unique code minted → one sheet row carrying
  name, store, the 21+ attestation, score, certificate ID and the code;
- the same request twice → the same code, no duplicate discount;
- the code redeemed → the next sync flipping `Not yet` to `Used` with a count, an
  expiry and a checked-at time;
- a code already `Used` → never re-queried on later syncs.

Both Shopify operations were then run against the **live** gpen.com Admin API. The
redemption query read-only; the creation mutation for real, with a throwaway code that
was read back field by field and deleted. Shopify accepted every field with no errors
and stored them as intended: 25% off, whole order, one use, once per customer, no
stacking with other discounts, and `asyncUsageCount` present — the field the hourly
sync reads. So the GraphQL, the input shape and the required scopes are all confirmed
against the real store, not just the mock.

That test also caught one thing: a discount whose `startsAt` has not yet passed comes
back `SCHEDULED`, and a scheduled code is refused at checkout. The endpoint now
backdates `startsAt` by a minute so a code is unambiguously live the instant the rep
reads it off the screen.

---

## Before you hand the link to anyone — the security preflight

A review of the reward and reporting path found five holes; four are fixed in the code
and one is a setting only you can change. Do this one first.

- [ ] **Link Upstash.** Vercel → Storage → Create Database → Upstash for Redis → link it
      to the reward project, then redeploy. **Until this exists there is no ceiling at
      all**: `lib/ratelimit.js` returns "unlimited" when the KV variables are missing and
      only logs a warning, so nothing fails and nothing alerts. With it linked the
      exposure is bounded at 500 codes/day; without it, it is not bounded. Confirm which
      state you are in by grepping the function logs for `rate limiting is NOT active`.
- [ ] **Check `CODE_SALT` is genuinely random** — `openssl rand -hex 32`, not a memorable
      string. With two or three known (email, code) pairs a short salt can be recovered
      offline, and that would make every future code predictable.
- [ ] **Set `ALLOWED_ORIGINS`** explicitly to `https://training.gpen.com`. localhost is no
      longer in the default, but an unset variable should not be how you find that out.

Fixed in code, listed so you know it was done: Google Sheets formula injection (a name
beginning `=` was a live formula in a sheet holding staff emails and live codes),
unvalidated `courseSlug`, a free denial-of-service on the daily cap, and a spoofable
client-IP header.

**Understand the limit of all this.** The quiz is graded in the browser and the reward
tier is chosen by the caller, so the endpoint cannot verify that any training happened —
someone who reads the portal's own JavaScript can request a code directly. The mitigations
that remain are real but they are containment, not prevention: every code is single-use,
expires in 90 days, is titled in Shopify with the email it was issued to, and is
individually revocable. Closing it properly means grading the quiz server-side, which is
a rebuild rather than a setting. Worth deciding deliberately rather than discovering.

---

## Still open, separately

- **`privacyUrl` is empty.** The certification form tells reps their name, email and
  store may be sent to G Pen, but links no privacy notice. Host one and set
  `config.privacyUrl` before this goes to partners.
- **Grinder packaging images** — a `data.js` block is all that's needed when they land.
- **Sweepstakes** stays dark until counsel clears the rules page and `sweepstakes.rulesUrl`
  is set. Pasting a reporting webhook does not switch it on.
