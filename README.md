# G Pen University — Product Specialist Training

A fun, mobile-first, gamified training + certification site for budtenders and
smoke-shop employees. Staff learn each G Pen product, pass a quiz, earn a
printable **Certificate of Completion**, and unlock a **gpen.com discount code**.

**Live:** https://training.gpen.com

## What it does

- **Landing → Enroll → Dashboard → Course → Quiz → Certificate → Discount code.**
- One interactive course per product: Watch (how-to videos), Learn (lessons +
  "how to sell it"), and a quiz (score 80%+ to certify).
- **Certificates**: personalized Certificate of Completion with name, product,
  score, date, and a unique certificate ID. Printable + downloadable PNG.
- **Master certification**: finish every core course to become a *G Pen
  Certified Specialist* and unlock a bigger reward.
- **Gamified**: progress ring, per-course badges, day streak, confetti.
- **Progress** persists in the browser (localStorage), keyed to the employee's
  name / email / store.

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
