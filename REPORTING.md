# Completion reporting — see who got certified, per store

> **Pasting a webhook URL turns on completion reporting and nothing else.**
> It does **not** start the free-G-Pen sweepstakes. That draw is behind a separate
> manual switch (`config.sweepstakes.live`) which must stay `false` until counsel
> has cleared the Official Rules page — the draft is at
> `.claude/drafts/rules.draft.html` and is deliberately not deployed.

The training site is static (no backend), so it reports certifications by sending
a small POST to a **webhook URL you control**. You paste that URL into
`assets/js/config.js` → `reporting.url`, and every time someone earns a
certificate the site sends:

```json
{
  "type": "course",              // see the table below
  //  "course"  first time a product card is pulled (any single course passed)
  //  "trio"    the 3rd product card is collected (30% tier)
  //  "master"  the full 5-card Base Set is collected (35% tier)
  //  "secret"  Base Set + every Trainer card, i.e. all 10 trivia eggs (40% gold tier)
  "name": "Jane Budtender",
  "email": "jane@store.com",
  "store": "Cloud 9 Smoke Shop",
  "product": "G Pen Dash II",    // or "Certified G" (master) / a tier label for trio+secret
  "score": 92,
  "certId": "GP-1G4-0TB",
  "date": "July 9, 2026",
  "sentAt": "2026-07-09T18:22:10.000Z"
}
```

No API keys live in the site — you only paste a webhook URL, so it's safe on a
public page. Pick **one** of the options below.

---

## Option A — Google Sheet (free, recommended)

1. Create a new Google Sheet. In the first row add headers:
   `Received | Type | Name | Email | Store | Product | Score | Cert ID | Date`
2. **Extensions → Apps Script**, delete the sample, and paste:

   ```javascript
   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
     var d = JSON.parse(e.postData.contents);
     sheet.appendRow([new Date(), d.type, d.name, d.email, d.store, d.product, d.score, d.certId, d.date]);
     return ContentService.createTextOutput("ok");
   }
   ```
3. **Deploy → New deployment → type: Web app.** Set **Execute as: Me** and
   **Who has access: Anyone**. Deploy and **copy the Web app URL**
   (looks like `https://script.google.com/macros/s/AKfyc.../exec`).
4. Paste that URL into `assets/js/config.js`:
   ```javascript
   reporting: { url: "https://script.google.com/macros/s/AKfyc.../exec" },
   ```
5. Commit + push. Done — each certification now appends a row to your Sheet.

> Note: the site sends the POST "fire-and-forget" (`mode: "no-cors"`), so it
> can't read the response — that's fine, the row still gets written. Test it by
> completing a course yourself and checking the Sheet.

---

## Option B — Zapier / Make (no-code, routes anywhere)

1. In **Zapier**, create a Zap with a **Webhooks by Zapier → Catch Hook**
   trigger (Make: a **Custom webhook**). Copy the webhook URL.
2. Add an action: **Google Sheets → Create Row**, **Airtable → Create Record**,
   Slack message, email — whatever you want. Map the fields from the payload
   above.
3. Paste the webhook URL into `reporting.url` in `config.js`, commit + push.

## Option C — Airtable

Airtable's REST API needs a secret key (don't put that in the site). Instead use
an **Airtable Automation → "When webhook received"** trigger to get a webhook
URL, then a **Create record** action — same as Option B. Paste that webhook URL
into `reporting.url`.

---

## Turning it off / privacy

- Leave `reporting.url` as `""` to disable — nothing is sent; progress still
  saves locally on each device.
- The payload includes the employee's name/email/store (that's the point — it's
  how you attribute training to a store). Make sure your team is OK collecting
  it and that your Sheet/Airtable is access-controlled.
- A full local event log is also kept in the browser under `localStorage`
  (`gpt.state.log`) as a backup.
