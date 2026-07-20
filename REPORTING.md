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
  //  "course"            a course was passed (fires on each first-time pass)
  //  "trio"              2 courses certified — 30% tier
  //  "elite"             4 courses certified — 35% tier
  //  "master"            all 5 certified — "Certified G" (40% tier)
  //  "sweepstakes_entry" all 5 certified AND the draw is switched live
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

## Picking the free-device winners ("every 20th person")

**The winner is decided here, in the Sheet — never in the browser.** A rep's
browser only knows about itself: it has no idea whether it's completion #3 or
#300, and anything it *did* know could be faked by clearing site data. The Sheet
is the only place that sees every completion, in order, so that's where the
counting and the pick belong. It's also auditable — you can point at the row.

Replace the `doPost` above with this version. It appends the row as before, then
numbers each full-lineup completion and flags every Nth one as a winner, rotating
the device with each winner.

```javascript
// Keep these in sync with assets/js/config.js -> sweepstakes
var WIN_EVERY = 20;                                   // every 20th full-lineup cert wins
var ROTATION  = ["G Pen Dash II", "G Pen Dash+", "G Pen Melt Hot Knife",
                 "G Pen Hydout", "G Pen 510 Original"];
var NOTIFY    = "pr@grencoscience.com";               // who gets told about a winner

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var d = JSON.parse(e.postData.contents);
  sheet.appendRow([new Date(), d.type, d.name, d.email, d.store,
                   d.product, d.score, d.certId, d.date]);

  // Only full-lineup certifications ("master") are in the running.
  if (d.type !== "master") return ContentService.createTextOutput("ok");

  // How many people have now certified on the whole lineup?
  var types = sheet.getRange(2, 2, Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
  var position = types.filter(function (r) { return r[0] === "master"; }).length;

  var row = sheet.getLastRow();
  sheet.getRange(row, 10).setValue(position);          // col J: their position in line

  if (position % WIN_EVERY === 0) {
    var winnerIndex = position / WIN_EVERY;            // 1st winner, 2nd winner, …
    var prize = ROTATION[(winnerIndex - 1) % ROTATION.length];
    sheet.getRange(row, 11).setValue("WINNER — " + prize);   // col K
    MailApp.sendEmail(NOTIFY,
      "G Pen University winner #" + winnerIndex + " — " + prize,
      d.name + " (" + d.email + ", " + d.store + ") is full-lineup certification #" +
      position + " and wins: " + prize + "\n\nCert ID: " + d.certId);
  }
  return ContentService.createTextOutput("ok");
}
```

Add two more headers to the Sheet so those columns have names:
`… | Cert ID | Date | Position | Winner`

**How it plays out:** person 20 wins a Dash II, person 40 a Dash+, person 60 a
Melt, person 80 a Hydout, person 100 a 510 Original, person 120 back to a
Dash II, and so on. Change `WIN_EVERY` or reorder `ROTATION` any time — it takes
effect from the next completion, and past winners stay recorded in the Sheet.

Then mirror the same numbers in `assets/js/config.js` so the site's copy matches:

```javascript
sweepstakes: { enabled: true, live: true, mode: "everyNth", everyNth: 20,
               rotation: ["G Pen Dash II", "G Pen Dash+", ...] },
```

**Fulfilment is manual and that's deliberate** — you get the winner email, you
confirm they're real authorized retail staff, then you ship the device or send a
100%-off single-use code. Nothing is awarded automatically, so a bad actor
farming completions can't self-issue a free product.

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
