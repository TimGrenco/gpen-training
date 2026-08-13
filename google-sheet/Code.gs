/* =============================================================================
   G PEN TRAINING → GOOGLE SHEET
   Google Apps Script, bound to the tracking spreadsheet.

   WHAT IT DOES
     doPost(e)        receives every event the portal reports and writes/updates
                      one row per certification.
     syncRedemptions() runs hourly, asks the reward API which codes have been
                      redeemed on gpen.com, and updates the Redeemed column.
     setup()          run once by hand: creates the sheets, headers and trigger.

   THE ROW IS KEYED ON certId, NOT ON ARRIVAL ORDER.
   Events for one certification arrive separately and out of order — the course
   pass reports immediately, the discount code a second or two later after a round
   trip to Shopify, and boot() re-sends anything earned while the webhook was empty.
   So this UPSERTS: the first event to mention a certId creates the row, later ones
   fill in the blanks. Appending instead would give one rep three partial rows for
   the same course and make "who completed what" unreadable.

   WHY THE SHEET NEVER TALKS TO SHOPIFY.
   Reading redemptions needs the Shopify Admin token. Putting it here would mean a
   second copy of that token living in a spreadsheet that gets shared with the
   team. syncRedemptions() calls the reward API instead, which holds the token and
   will only answer "used or not" — nothing it could leak.

   PRIVACY. Every row is a named retail employee: name, work email, store, and the
   fact that they attested to being 21+. Treat this sheet as personal data. Share
   it with the people who need it, not with a link, and delete rows when a rep asks.
   ========================================================================== */

/* ---- configuration ------------------------------------------------------- */
// Script properties, set in setup() or under Project Settings → Script properties.
// They are NOT in this file, because this file lives in a repo.
//   REWARD_API   https://your-project.vercel.app   (no trailing slash, no path)
//   SYNC_SECRET  the same value as SYNC_SECRET in Vercel
//   POST_TOKEN   optional; if set, the portal's URL must carry ?token=<value>
var SHEET_NAME = "Completions";
var LOG_NAME = "Raw log";

/* The columns, in order. Adding one here and re-running setup() extends the sheet
   without disturbing existing rows — writes look columns up by header name, never
   by index, so a reordered or hand-inserted column cannot silently shift data
   into the wrong place. That has bitten this pattern before. */
var COLUMNS = [
  "First seen",        // when this certification first reported
  "Name",
  "Email",
  "Store",
  "21+ attested",      // the signup checkbox
  "Attested at",
  "Event",             // course | trio | elite | master | sweepstakes_entry
  "Product",
  "Course",            // slug, stable across languages
  "Score",
  "Passed on",         // the date shown on the rep's certificate
  "Certificate ID",
  "Discount code",
  "Discount tier",
  "Redeemed",          // Used | Not yet | Expired unused | Code not found
  "Times used",
  "Code expires",
  "Redemption checked",
  "Last event",        // when this row was last touched by an incoming event
];

function props_() { return PropertiesService.getScriptProperties(); }
function prop_(k) { return String(props_().getProperty(k) || "").trim(); }

/* ---- sheet helpers ------------------------------------------------------- */
function sheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (headers) {
    var have = sh.getLastColumn() ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
    var missing = headers.filter(function (h) { return have.indexOf(h) === -1; });
    if (missing.length) {
      // Append only what is absent, so a column someone added by hand survives.
      sh.getRange(1, have.length + 1, 1, missing.length).setValues([missing]);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, sh.getLastColumn()).setFontWeight("bold");
    }
  }
  return sh;
}

function headerMap_(sh) {
  var row = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var map = {};
  row.forEach(function (h, i) { if (h) map[String(h)] = i + 1; }); // 1-based column
  return map;
}

/* ---- incoming events ----------------------------------------------------- */
/*
  The portal posts with mode:"no-cors" and Content-Type text/plain, so the body is
  a JSON string in e.postData.contents. Nothing here may throw: a failed doPost is
  invisible to the rep (no-cors discards the response), so an exception would lose
  the event silently. Everything lands in the Raw log first, then is parsed — so
  even a payload this script does not understand is recoverable by hand.
*/
function doPost(e) {
  var raw = (e && e.postData && e.postData.contents) || "";
  var err = "";
  /* SERIALIZED. Apps Script serves simultaneous requests concurrently, and upsert_()
     picks a new row with getLastRow() + 1. boot()'s backfill fires every pending event
     in the same tick — for a rep with four courses that is four course events, two tier
     events and several code events, all arriving within milliseconds. Each handler read
     the same getLastRow() and wrote to the same row; last writer won and the rest were
     silently overwritten. The backfill, whose entire job is to guarantee nothing is
     lost, was the most likely place to lose rows — and invisibly, because the portal
     posts no-cors and never sees a response.

     30s is generous: each handler is a few range reads and writes. A caller that cannot
     get the lock in that time is told so, and the portal will replay it, because the
     event stays unstamped until delivery is confirmed. */
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (lockErr) {
    logRaw_(raw, "could not acquire lock: " + lockErr);
    return ok_({ ok: false, error: "busy" });
  }
  try {
    var gate = prop_("POST_TOKEN");
    if (gate && (!e.parameter || e.parameter.token !== gate)) {
      err = "rejected: bad or missing token";
    } else {
      var ev = JSON.parse(raw);
      if (ev && ev.type === "code_issued") writeCode_(ev);
      else writeCompletion_(ev);
    }
  } catch (ex) {
    err = String(ex);
  }
  finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
  // Logged exactly once, whatever happened — including a rejection, so a wrong
  // token shows up as a visible row rather than as silence.
  logRaw_(raw, err);
  return ok_(err ? { ok: false, error: err } : { ok: true });
}

function ok_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function logRaw_(raw, error) {
  try {
    var sh = sheet_(LOG_NAME, ["Received", "Body", "Error"]);
    sh.appendRow([new Date(), String(raw).slice(0, 4000), error || ""]);
  } catch (ignore) { /* the log must never be the reason an event is lost */ }
}

/* A certification's identity. certId is the real key — it is unique per pass and
   printed on the rep's certificate, so it is also what a rep can quote in a
   support email. The tier events (trio/elite) carry no certId, so they fall back
   to a synthetic key; without this they would all collide on one row per person. */
function rowKey_(ev) {
  if (ev.certId) return String(ev.certId);
  /* No certId — the ladder tiers (2 and 4 courses) are milestones, not quizzes, so
     they have none. Key them on the tier instead.

     A code_issued event must key on the TIER IT IS FOR, not on its own event name.
     Its own name would give `code_issued|email|` while the milestone row it belongs
     to is `trio|email|`, and the 30% and 35% codes would each sit on an orphan row
     with no name, store or date beside them — exactly the rows nobody could act on. */
  var kind = (ev.type === "code_issued") ? String(ev.tier || "") : String(ev.type || "");
  return [kind, String(ev.email || "").toLowerCase(), String(ev.courseSlug || "")].join("|");
}

function findRow_(sh, cols, key) {
  var n = sh.getLastRow();
  if (n < 2) return 0;
  var idCol = cols["Certificate ID"];
  var ids = sh.getRange(2, idCol, n - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === key) return i + 2;
  return 0;
}

/* Write only the fields this event actually carries. `fill` never overwrites a
   non-empty cell — a resent event must not blank a code that arrived later, and
   the backfill on boot() resends events whose payload is a subset of what the row
   already holds. `set` is for the fields that genuinely supersede. */
function upsert_(sh, cols, key, fill, set) {
  var row = findRow_(sh, cols, key);
  var fresh = !row;
  if (fresh) {
    row = Math.max(sh.getLastRow() + 1, 2);
    sh.getRange(row, cols["Certificate ID"]).setValue(key);
    if (cols["First seen"]) sh.getRange(row, cols["First seen"]).setValue(new Date());
  }
  Object.keys(fill || {}).forEach(function (h) {
    var c = cols[h];
    if (!c) return;
    var cell = sh.getRange(row, c);
    var cur = cell.getValue();
    if (cur === "" || cur === null) cell.setValue(fill[h]);
  });
  Object.keys(set || {}).forEach(function (h) {
    if (cols[h]) sh.getRange(row, cols[h]).setValue(set[h]);
  });
  if (cols["Last event"]) sh.getRange(row, cols["Last event"]).setValue(new Date());
  return row;
}

function writeCompletion_(ev) {
  var sh = sheet_(SHEET_NAME, COLUMNS);
  var cols = headerMap_(sh);
  upsert_(sh, cols, rowKey_(ev), {
    "Name": ev.name || "",
    "Email": String(ev.email || "").toLowerCase(),
    "Store": ev.store || "",
    "21+ attested": ev.attest21 ? "Yes" : "",
    "Attested at": ev.attestedAt || "",
    "Event": ev.type || "",
    "Product": ev.product || "",
    "Course": ev.courseSlug || "",
    "Score": (ev.score === 0 || ev.score) ? ev.score : "",
    "Passed on": ev.date || "",
  }, {});
}

/* The code arrives as its own event, after the pass. It matches the row the pass
   created via certId; if the pass has not landed yet (or the code is for a ladder
   tier, which has no certId), upsert_ creates the row and the pass fills it in
   later. Either order works, which is the point of keying on certId. */
function writeCode_(ev) {
  var sh = sheet_(SHEET_NAME, COLUMNS);
  var cols = headerMap_(sh);
  upsert_(sh, cols, rowKey_(ev), {
    "Name": ev.name || "",
    "Email": String(ev.email || "").toLowerCase(),
    "Store": ev.store || "",
    "Course": ev.courseSlug || "",
    "Discount code": ev.code || "",
    "Discount tier": ev.tier || "",
    "Redeemed": "Not yet",     // provisional until the first sync confirms it
  }, {});
}

/* ---- hourly redemption sync --------------------------------------------- */
/*
  Asks the reward API about every code in the sheet that is not already confirmed
  used. Codes already marked Used are skipped: asyncUsageCount only goes up, so
  re-checking them costs API budget to learn nothing. A code stays in the rotation
  until it is used or its discount expires.
*/
function syncRedemptions() {
  var base = prop_("REWARD_API");
  if (!base) throw new Error("Set the REWARD_API script property first (see README).");

  var sh = sheet_(SHEET_NAME, COLUMNS);
  var cols = headerMap_(sh);
  var n = sh.getLastRow();
  if (n < 2) return;

  var codeVals = sh.getRange(2, cols["Discount code"], n - 1, 1).getValues();
  var doneVals = sh.getRange(2, cols["Redeemed"], n - 1, 1).getValues();

  var rowsFor = {};   // code -> [sheet rows]  (one code can appear on >1 row)
  codeVals.forEach(function (r, i) {
    var code = String(r[0] || "").trim().toUpperCase();
    if (!code) return;
    if (String(doneVals[i][0]) === "Used") return;
    (rowsFor[code] = rowsFor[code] || []).push(i + 2);
  });

  var codes = Object.keys(rowsFor);
  if (!codes.length) return;

  var checked = new Date();
  // 100 per request is the endpoint's cap; chunk so a large sheet still syncs.
  for (var i = 0; i < codes.length; i += 100) {
    var chunk = codes.slice(i, i + 100);
    var res = UrlFetchApp.fetch(base.replace(/\/+$/, "") + "/api/redemptions", {
      method: "post",
      contentType: "application/json",
      headers: { "x-sync-secret": prop_("SYNC_SECRET") },
      payload: JSON.stringify({ codes: chunk }),
      muteHttpExceptions: true,
    });
    if (res.getResponseCode() !== 200) {
      throw new Error("redemptions lookup failed: " + res.getResponseCode() + " " + res.getContentText().slice(0, 300));
    }
    (JSON.parse(res.getContentText()).results || []).forEach(function (r) {
      (rowsFor[r.code] || []).forEach(function (row) {
        sh.getRange(row, cols["Redeemed"]).setValue(statusLabel_(r));
        sh.getRange(row, cols["Times used"]).setValue(r.usedCount || 0);
        if (r.endsAt) sh.getRange(row, cols["Code expires"]).setValue(new Date(r.endsAt));
        sh.getRange(row, cols["Redemption checked"]).setValue(checked);
      });
    });
  }
}

/* Four states, because "Not yet" would otherwise cover two very different things:
   a code the rep might still use, and one that ran out of time unused. The second
   is the number worth knowing — it means the reward was earned but the sale never
   happened. */
function statusLabel_(r) {
  if (!r.found) return "Code not found";
  if (r.used) return "Used";
  if (String(r.status).toUpperCase() === "EXPIRED") return "Expired unused";
  return "Not yet";
}

/* ---- one-time setup ----------------------------------------------------- */
/*
  Run this once from the Apps Script editor (select `setup`, press Run). It is safe
  to re-run: it adds only what is missing and replaces its own trigger rather than
  stacking a second one — the classic way this pattern ends up syncing four times
  an hour.
*/
function setup() {
  sheet_(SHEET_NAME, COLUMNS);
  sheet_(LOG_NAME, ["Received", "Body", "Error"]);

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "syncRedemptions") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("syncRedemptions").timeBased().everyHours(1).create();

  var missing = ["REWARD_API", "SYNC_SECRET"].filter(function (k) { return !prop_(k); });
  var msg = missing.length
    ? "Sheets and trigger ready. Still to set under Project Settings → Script properties: " + missing.join(", ")
    : "Sheets, trigger and properties all ready.";
  Logger.log(msg);
  return msg;
}
