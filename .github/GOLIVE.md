# Go live: rewards + tracking sheet

Everything in the portal is built and tested. Three steps remain, and all three need
credentials that only you can supply — a Shopify Admin token, a Vercel login, and a
Google account. Do them in this order; each one is checkable before you move on.

Total time: about 20 minutes.

Until step 2 is done the reward panel renders nothing — deliberately. A rep who sees
no code files a support ticket; a rep who sees a code that fails at the till loses a
sale and stops trusting the portal.

---

## Step 1 — Shopify app + token (5–10 min)

> **The old route is closed.** Creating a custom app from the store admin
> (Settings → Apps and sales channels → Develop apps) stopped being possible on
> **1 January 2026**. Existing admin-created apps still work; new ones must come from
> the **Dev Dashboard**. If you find a guide pointing at the admin, it predates that.

Go to the Dev Dashboard for the Grenco Science organisation:
<https://dev.shopify.com/dashboard>

1. **Apps → Create app**. Under *Start from Dev Dashboard*, name it `Training rewards`
   → **Create**. (Ignore the Shopify CLI option — that scaffolds a whole app project,
   which we do not need. This endpoint is 170 lines and already written.)
2. Add the **access scopes**, exactly two:
   - `write_discounts` — to mint a code
   - `read_discounts` — for the hourly redemption sync

   Nothing else. This app never needs to see an order, a customer or a product, and
   the schema validator confirms these two are sufficient for both operations.
3. Set **distribution** to **Custom distribution**, targeting `grencoscience.myshopify.com`.
   Custom distribution means one store (or one Plus organisation's stores) and no
   Shopify review. It is the supported replacement for a single-store custom app.
   **This choice is permanent** — an app cannot be switched to public later.
4. **Install** it on the store via the generated install link.
5. Copy the **Admin API access token** (`shpat_…`) from the app's credentials.

Paste the token straight into Vercel in the next step. Don't put it in a doc, a Slack
message, or the repo — it is full write access to store discounts.

---

## Step 2 — Deploy the reward endpoint (10 min)

```bash
npx vercel --cwd reward-api
```

Log in when prompted, accept the defaults. Then in the Vercel project,
**Settings → Environment Variables**, add five:

| Name | Value |
|---|---|
| `SHOPIFY_SHOP` | `grencoscience.myshopify.com` — the admin domain, not gpen.com |
| `SHOPIFY_ADMIN_TOKEN` | the `shpat_…` token from step 1 |
| `CODE_SALT` | `openssl rand -hex 32` |
| `SYNC_SECRET` | `openssl rand -hex 32` (a different one) |
| `ALLOWED_ORIGINS` | `https://training.gpen.com` |

Redeploy so the variables take effect.

`CODE_SALT` is what makes each code's six-character suffix unguessable. **Changing it
changes every future code**, so set it once and leave it. Codes already issued keep
working — they live in Shopify independently of this function.

### Check it

```bash
curl -s -X POST https://YOUR-PROJECT.vercel.app/api/reward -H 'Origin: https://training.gpen.com' -H 'Content-Type: text/plain' -d '{"tier":"course","email":"you@grencoscience.com","courseSlug":"dash-ii"}'
```

You should get a `GPT-25-…` code back, and see it in **Shopify admin → Discounts**
titled `Training 25% — course — dash-ii — you@grencoscience.com`.

**Run it a second time.** The same code must come back with no second discount created.
That is the check worth repeating after any change here — without it, every page view
of a certificate would mint a new discount.

### Turn it on

In [`assets/js/config.js`](../assets/js/config.js):

```js
rewards: {
  url: "https://YOUR-PROJECT.vercel.app/api/reward",
```

Commit and push. Reps get real codes from that moment.

---

## Step 3 — The tracking sheet (5 min)

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

If step 3 lands after reps have already certified, their completions **and their
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

## Still open, separately

- **`privacyUrl` is empty.** The certification form tells reps their name, email and
  store may be sent to G Pen, but links no privacy notice. Host one and set
  `config.privacyUrl` before this goes to partners.
- **Grinder packaging images** — a `data.js` block is all that's needed when they land.
- **Sweepstakes** stays dark until counsel clears the rules page and `sweepstakes.rulesUrl`
  is set. Pasting a reporting webhook does not switch it on.
