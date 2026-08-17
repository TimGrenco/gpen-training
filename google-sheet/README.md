# The tracking sheet — who trained on what, and did they use their code

One Google Sheet, fed by the portal, showing every completed training and whether
the discount code that came with it has been redeemed on gpen.com.

One row per certification:

| Column | Comes from |
|---|---|
| First seen | when this certification first reported |
| Name / Email / Store | the signup form |
| 21+ attested / Attested at | the signup checkbox and its timestamp |
| Event | `course`, `trio`, `elite`, `master`, `sweepstakes_entry` |
| Product / Course | the product name, and its slug (stable across languages) |
| Score / Passed on / Certificate ID | the quiz result |
| Discount code / Discount tier | the code minted for that person and that course |
| **Redeemed** | **`Used` · `Not yet` · `Expired unused` · `Code not found`** |
| Times used / Code expires / Redemption checked | from Shopify, refreshed hourly |

`Redeemed` is the column the team actually wants. `Expired unused` is worth watching
separately from `Not yet`: it means a rep earned a reward and never spent it.

A second tab, **Raw log**, keeps every payload as it arrived, including ones that
failed to parse. Nothing is lost to a bug in this script.

---

## Setup, once

### 1. Deploy the reward API first

The sheet reads redemptions *through* `reward-api`, so that must be live. See
[`../reward-api/README.md`](../reward-api/README.md). Add one more environment
variable to that Vercel project while you are there:

| Name | Value |
|---|---|
| `SYNC_SECRET` | any long random string — `openssl rand -hex 32` |

That is what lets the sheet call `/api/redemptions`, which has no browser origin to
check.

### 2. Create the sheet and paste the script

1. New Google Sheet. Name it something like `G Pen Training — completions`.
2. **Extensions → Apps Script**.
3. Delete the stub `myFunction`, paste all of [`Code.gs`](Code.gs), save.

### 3. Script properties

In the Apps Script editor: **Project Settings (gear) → Script properties → Add**:

| Name | Value |
|---|---|
| `REWARD_API` | `https://your-project.vercel.app` — origin only, no path, no trailing slash |
| `SYNC_SECRET` | the same value you set in Vercel |
| `POST_TOKEN` | optional, see below |

These are properties rather than constants in the file because this file is in a
public-ish repo and `SYNC_SECRET` is a secret.

### 4. Run `setup` once

Pick `setup` from the function dropdown and press **Run**. Google will ask you to
authorise the script — it needs the spreadsheet and external-fetch permissions. This
creates both tabs, writes the headers, and installs the hourly trigger. It is safe to
re-run; it replaces its own trigger instead of stacking a second one.

### 5. Deploy as a Web App

**Deploy → New deployment → Web app**:

- **Execute as:** Me
- **Who has access:** **Anyone** — required, because the portal posts from a
  browser with no Google login. The URL is the only thing protecting it, so treat
  it as a secret, and set `POST_TOKEN` if you want a second lock.

Copy the `/exec` URL.

### 6. Point the portal at it

In `assets/js/config.js`:

```js
reporting: {
  url: "https://script.google.com/macros/s/AKfyc.../exec",
},
```

If you set `POST_TOKEN`, append it: `...../exec?token=YOUR_TOKEN`.

Commit and push. The next rep who certifies appears in the sheet within seconds.

---

## Checking it works

**A POST here does not answer directly — it answers `302` and puts the real body behind a
one-time redirect** at `script.googleusercontent.com/macros/echo`. `curl -L` does not
survive that hop; it reports Google's "Page Not Found — unable to open the file" page and
looks exactly like a broken deployment. It cost half an hour once. Capture the `Location`
and fetch it:

```bash
URL='https://script.google.com/macros/s/AKfyc.../exec'
BODY='{"type":"course","name":"Test Rep","email":"test@example.com","store":"QA","product":"G Pen Dash II","courseSlug":"dash-ii","score":100,"certId":"TEST-1","date":"Aug 12, 2026","attest21":true}'
LOC=$(curl -s -o /dev/null -D - -X POST "$URL" -H 'Content-Type: text/plain' -d "$BODY" | sed -n 's/^[Ll]ocation: *//p' | tr -d '\r')
curl -s "$LOC"
```

Prints `{"ok":true}`. The browser has no such trouble — `fetch` follows the redirect and
reads the body normally — so this is a quirk of checking by hand, not of the portal.

**Two independent things to confirm, and the first is not enough on its own:**

1. A row appears with `TEST-1` as its Certificate ID. Run it again: **the row updates
   rather than duplicating.** Without this, one rep's single course becomes three rows and
   "who completed what" stops being answerable.
2. Then POST a `code_issued` event for the *same* `certId` and re-send the course event
   after it. The discount code must still be there. Events arrive out of order in real
   use, and a re-sent event that blanks a field which arrived later is the failure mode
   that makes the sheet quietly wrong rather than obviously broken:

```bash
curl -s -o /dev/null -X POST "$URL" -H 'Content-Type: text/plain' \
  -d '{"type":"code_issued","certId":"TEST-1","email":"test@example.com","code":"TEST-CODE","tier":"course","courseSlug":"dash-ii"}'
```

Then run `syncRedemptions` by hand from the editor to confirm the Vercel leg works.
With no codes in the sheet yet it does nothing and returns quietly; with a code it
fills in `Redeemed`.

Delete the test row when you are done.

---

## How it behaves

**Rows are keyed on Certificate ID, and events arrive out of order.** A pass reports
immediately; its discount code exists a second or two later, after a round trip to
Shopify. Both write to the same row, in either order, and a re-sent event never blanks
a field that arrived later. This is why the sheet is readable at all.

**Codes already marked `Used` are not re-checked.** Redemption counts only go up, so
each hourly sync only asks about codes that are still open. A sheet with a thousand
rows still syncs in one or two requests.

**A failed sync throws** rather than writing a guess, so Google emails the script
owner. `Redeemed` keeps its previous value.

**Backfill.** Anything a rep earned while `reporting.url` was still empty is re-sent
on their next visit — including the discount code, which is replayed from the
browser's reward cache. So pasting the URL later does not lose the reps who trained
before it.

---

## Privacy

Every row is a named retail employee: name, work email, store, and their 21+
attestation. That is personal data.

- Share the sheet with named people, not with a link.
- The portal's privacy notice says data is used for training records and reward
  fulfilment. Do not repurpose it for marketing lists without saying so there first.
- Delete a rep's rows if they ask.
