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

### 1. A Shopify app with two scopes

Creating a custom app from the store admin stopped being possible on **1 January 2026**.
New apps come from the [Dev Dashboard](https://dev.shopify.com/dashboard) instead —
older guides that point at *Settings → Apps and sales channels → Develop apps* predate
that change.

**Apps → Create app**, name it `Training rewards`, then:

- grant exactly two access scopes: `write_discounts` and `read_discounts`
- set distribution to **Custom distribution** for `grencoscience.myshopify.com`
  (one store, no Shopify review — the supported replacement for a single-store custom
  app; the choice is permanent)
- install it on the store, then run the one-time handshake in
  [`.github/GOLIVE.md`](../.github/GOLIVE.md) step 3 to obtain the Admin API access
  token — a Dev Dashboard app issues OAuth credentials rather than handing you a token,
  so `api/install.js` and `api/oauth-callback.js` exist to close that loop once and are
  deleted straight after

Two scopes, nothing else. This app never needs to see an order, a customer or a
product, and both were confirmed sufficient by validating the create mutation and the
redemption query against the live store.

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
| `SHOPIFY_SHOP` | `grencoscience.myshopify.com` (the admin domain, not gpen.com) |
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

## What actually protects this, and what does not

- **The percentages live here, not in the request.** The portal sends a tier name; this
  function looks the percentage up in its own table. A tampered browser cannot ask for
  90% off.
- **Origin is checked** — and it must be PRESENT, not merely allowed if supplied. The
  first version read `if (origin && ...)`, so a request omitting the header skipped the
  check entirely, which is the default for curl and every script. Be clear about what
  this buys, though: an Origin header is one extra curl flag. It stops drive-by and
  automated abuse, not a determined caller.
- **The code is a keyed hash of tier + email + course**, so nobody can derive someone
  else's code, and the same person asking twice gets the same one rather than a second
  discount.
- **One use, one person, 90 days.**

**What this does NOT do**, stated plainly because the section heading above overclaims
if left alone: the tier is chosen by the caller and the quiz is graded in the browser,
so the endpoint cannot verify that any training happened. Someone who reads the portal's
JavaScript can request a tier directly. Rate limiting makes that impractical at volume;
only server-side scoring closes it entirely.

Nor does it stop someone who is not a retail employee from taking the
training and getting a 25% code — the portal is deliberately open, with no password, so
reps never have to ask what it is. What it does stop is the old failure mode: one
shared code, screenshotted once, used forever by anyone. Each code is now tied to one
person, single-use, and expiring, and every issue is listed in Shopify admin with the
email it was issued to — so abuse is visible and revocable per code instead of
invisible and unlimited.

---

## Rate limiting

`lib/ratelimit.js` caps **40 mints per IP per day** and **500 globally per day**.

Why those two and not a per-email cap: the code is a keyed hash of tier + email +
course, so one email can only ever yield nine codes — six per-course and three
milestones — and asking again returns the same one. Determinism already caps per-email.

**That holds only because `courseSlug` is validated against the six real slugs.** It
used to be any non-empty string, and since it feeds the code seed, one address could
mint unlimited distinct 25% codes just by varying it — 1,000 arbitrary slugs produced
1,000 distinct codes. If that allowlist is ever removed, this section is wrong and a
per-email counter becomes necessary.
The exposure is volume across *many* emails, which is what these two limits target.

It **fails open**, unlike `CODE_SALT` and `SYNC_SECRET`, which fail closed. Those guard
correctness and secrecy; this guards volume. If the counter store is unreachable,
refusing would stop every rep collecting a code they earned — turning a third-party blip
into an outage of the whole point of the portal. It logs loudly and allows.

### Turning it on (3 clicks, free tier)

Vercel → **Storage** → **Create Database** → **Upstash for Redis** → link it to
`gpen-training-rewards`. That injects `KV_REST_API_URL` and `KV_REST_API_TOKEN`
automatically; nothing to copy. Redeploy.

Until you do, the endpoint mints without a ceiling and logs a warning on every call —
grep the function logs for `rate limiting is NOT active` to confirm which state you are
in.

### What it does and does not buy

It makes **bulk** abuse impractical. It does not stop one determined person obtaining
one code: the tier is still chosen by the caller, and the quiz is graded in the browser,
so the server cannot verify that any training happened. Closing that needs server-side
scoring — a rebuild, not a setting. The mitigations that remain are the ones already in
place: every code is single-use, expires in 90 days, and is titled in Shopify with the
email it was issued to, so abuse is visible and revocable per code.

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
- `api/install.js`, `api/oauth-callback.js` — **temporary.** They run the OAuth
  handshake once to obtain the Admin token, then get deleted. If they are still here
  after setup, setup is not finished.
- `vercel.json`, `package.json` — no build, Node 18+ for global `fetch`.
