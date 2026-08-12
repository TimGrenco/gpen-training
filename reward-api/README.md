# Reward endpoint — one Shopify code per person, per course

This is the piece that turns the training portal's rewards into real, per-person
Shopify discount codes. It is a single serverless function. It exists because
creating a discount needs a Shopify Admin API token, and a token in the portal's
JavaScript would be a token published on the internet.

The portal calls it; it holds the token and does the create.

---

## What a rep gets

| Tier | Trigger | Code | Scope |
|---|---|---|---|
| 25% | passing any one product quiz | `GPT-25-XXXXXX` | **one per product** — certify on three products, get three different codes |
| 30% | 2 products certified | `GPT-30-XXXXXX` | once per person |
| 35% | 4 products certified | `GPT-35-XXXXXX` | once per person |
| 40% | all 6 certified | `GPT-40-XXXXXX` | once per person |

Every code is a **separate Shopify discount with `usageLimit: 1`**, so one code is
genuinely one use by one person. That detail is the whole point: in Shopify the usage
limit belongs to the *discount*, not to an individual code inside it, so putting many
codes on one shared discount would give them a shared allowance — the first redemption
anywhere would burn it for everyone. One discount per code is what makes the promise
true.

Codes expire 90 days after they are issued, don't stack with other discounts, and use
an alphabet with no `I`, `L`, `O` or `U` because reps read them down a phone line.

---

## Setup, once

### 1. A Shopify custom app with two scopes

In the Shopify admin: **Settings → Apps and sales channels → Develop apps → Create an
app**. Name it something like `Training rewards`.

Under **Configuration → Admin API integration**, grant exactly:

- `write_discounts`
- `read_discounts`

Nothing else. This app never needs to see an order, a customer or a product.

**Install** the app, then copy the **Admin API access token** (`shpat_…`). It is shown
once.

### 2. Deploy this folder to Vercel

```bash
npx vercel --cwd reward-api
```

Or in the Vercel dashboard: **New Project → import this repo → set Root Directory to
`reward-api`**. There is no build step and no dependencies.

### 3. Four environment variables

In the Vercel project, **Settings → Environment Variables**:

| Name | Value |
|---|---|
| `SHOPIFY_SHOP` | `gpen.myshopify.com` (the admin domain, not gpen.com) |
| `SHOPIFY_ADMIN_TOKEN` | the `shpat_…` token from step 1 |
| `CODE_SALT` | any long random string — `openssl rand -hex 32` |
| `ALLOWED_ORIGINS` | `https://training.gpen.com` |
| `SYNC_SECRET` | another long random string — only needed for the tracking sheet |

`CODE_SALT` is what makes the six-character suffix unguessable. **Changing it changes
every future code**, so set it once and leave it. Codes already issued keep working —
they exist in Shopify independently of this function.

### 4. Point the portal at it

In `assets/js/config.js`:

```js
rewards: {
  url: "https://your-project.vercel.app/api/reward",
```

Commit and push. Until that URL is set, the reward panel renders nothing at all — on
purpose. A rep who sees no code files a support ticket; a rep who sees a code that
fails at the till loses a sale and stops trusting the portal.

---

## Checking it works

```bash
curl -s -X POST https://your-project.vercel.app/api/reward \
  -H 'Origin: https://training.gpen.com' \
  -H 'Content-Type: text/plain' \
  -d '{"tier":"course","email":"you@grencoscience.com","courseSlug":"dash-ii"}'
```

You should get a `GPT-25-…` code back, and see the discount in **Shopify admin →
Discounts**, titled `Training 25% — course — dash-ii — you@grencoscience.com`.

Run the same command again: **the same code comes back and no second discount is
created.** That is the idempotency check, and it is the one worth repeating after any
change — without it, every page view of a certificate would mint a new discount.

---

## How it cannot be abused

- **The percentages live here, not in the request.** The portal sends a tier name; this
  function looks the percentage up in its own table. A tampered browser cannot ask for
  90% off.
- **Origin is checked.** Only `ALLOWED_ORIGINS` may call it.
- **The code is a keyed hash of tier + email + course**, so nobody can derive someone
  else's code, and the same person asking twice gets the same one rather than a second
  discount.
- **One use, one person, 90 days.**

What this does *not* do is stop someone who is not a retail employee from taking the
training and getting a 25% code — the portal is deliberately open, with no password, so
reps never have to ask what it is. What it does stop is the old failure mode: one
shared code, screenshotted once, used forever by anyone. Each code is now tied to one
person, single-use, and expiring, and every issue is listed in Shopify admin with the
email it was issued to — so abuse is visible and revocable per code instead of
invisible and unlimited.

---

---

## The second route: `/api/redemptions`

`api/redemptions.js` answers one question — has this code been used on gpen.com yet?
It is read-only (`read_discounts`), takes up to 100 codes at a time, and returns a
usage count per code.

It exists for the [tracking sheet](../google-sheet/README.md), which runs it hourly.
The sheet calls this rather than Shopify directly so the Admin token stays in exactly
one place instead of also living in a spreadsheet the whole team can open. Since the
caller is a script and has no browser origin to check, it is gated on the
`SYNC_SECRET` header instead.

```bash
curl -s -X POST https://your-project.vercel.app/api/redemptions \
  -H 'Content-Type: application/json' \
  -H 'x-sync-secret: YOUR_SYNC_SECRET' \
  -d '{"codes":["GPT-25-K3M7QX"]}'
```

Shopify updates redemption counts asynchronously, so a code used in the last few
minutes can still read as unused. That is why the sheet stamps a "checked at" time
next to the status — it reports what Shopify had, not what is true this second.

---

## Files

- `api/reward.js` — mints codes. Tier table, code derivation, lookup-then-create.
- `api/redemptions.js` — reads usage counts for the tracking sheet.
- `vercel.json`, `package.json` — no build, Node 18+ for global `fetch`.
