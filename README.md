# G Pen University — Product Specialist Training

A fun, mobile-first, gamified training + certification site for budtenders and
smoke-shop employees. Staff learn each G Pen product, pass a quiz, earn a
printable **Certificate of Completion**, and unlock a **gpen.com discount code**.

**Live:** https://training.gpen.com

## What it does

- **Browse-first, no sign-up gate.** Home → a product course → the quiz →
  certificate + discount code. Name/email/store are collected just-in-time, only
  when a rep opts into a quiz.
- One course per product, ordered to lead with selling: three things to
  remember → how to sell it → videos → the product itself → use → clean →
  specs → FAQ → quiz (score 80%+ to certify).
- **Certificates**: personalized Certificate of Completion with name, product,
  score, date, and a unique certificate ID. Printable + downloadable PNG.
- **Master certification**: finish all five to become a *G Pen Certified
  Specialist* and unlock the top reward tier.
- **Gamified**: a collectible card per product pulled from a foil booster pack,
  the Binder, an arcade-scored quiz, day streak, confetti.
- **Progress** persists in the browser (localStorage) **per device, not per
  person** — there are no accounts. A shared counter tablet prompts an explicit
  handover when a different rep starts, and clears the previous rep's progress.
  Reps should use their own phones.

No backend. Static HTML/CSS/vanilla JS, deployed on GitHub Pages.

## Files you'll actually edit

| File | What's in it |
|------|--------------|
| `assets/js/config.js` | **Discount codes**, pass mark, contact email, shop URL. Edit this first. |
| `assets/js/data.js` | Course content: product copy, videos, lessons, "how to sell it", and quiz questions. |
| `assets/css/styles.css` | Look & feel (black / white / gold, Archivo). |
| `assets/js/app.js` | App logic (routing, quiz, certificate, gamification). |

### Changing the discount codes

Open `assets/js/config.js` and edit the `discount.course` and `discount.master`
blocks (`code` / `label` / `note`). These are **generic codes everyone can use**
for now.

### Later: unique per-person codes (e.g. Shopify Admin API)

The app mints a code in exactly **one** place — `issueRewardCode(type, ctx)` at
the bottom of `config.js`. To switch to unique codes, replace that function's
body with an API call that returns `{ code, label, note }`; everything upstream
already awaits it. No other changes needed.

### Adding a course

Copy a `{ ... }` block in `assets/js/data.js`, change the fields (`slug`, `name`,
`videos`, `modules`, `quiz`, …), and it appears automatically. If you leave
`config.js` `coreCourses: null`, every course counts toward master certification.

## Data model (for future reporting)

Enrollment and completions are stored as structured objects in localStorage
(`gpt.enrollment`, `gpt.state` — including an event `log`). A lightweight
Google Sheet / Airtable webhook could POST these later without a rewrite.

## Local preview

Any static server works, e.g.:

```bash
cd gpen-training
python3 -m http.server 4753   # then open http://localhost:4753
```

## Deployment

GitHub Pages serves `main`. `CNAME` pins the custom domain `training.gpen.com`.
Add a DNS `CNAME` record: `training` → `<owner>.github.io`, then enable
**Enforce HTTPS** in the repo's Pages settings once the certificate issues.

**Push to `main` is the deploy.** `.github/workflows/stamp-version.yml` stamps
the commit SHA into `version.json` automatically. `index.html` fetches that at
runtime and loads the CSS/JS tagged with it, so a new build reaches open tabs
without a hard refresh (and never reloads mid-quiz). **Never hand-edit
`version.json`** — the workflow owns it.
