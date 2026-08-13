/* =============================================================================
   G PEN TRAINING PORTAL — CONFIG  (edit me first!)
   -----------------------------------------------------------------------------
   Everything a non-developer needs to tweak lives here: the discount codes,
   contact email, and where the "shop now" button points. (The per-course pass
   mark lives with the course content in data.js, as `passPct`.)

   >>> DISCOUNT CODES — READ THIS BEFORE RAISING ANY REDEMPTION LIMIT <<<
   These are GENERIC shared codes. This file is served publicly at
   /assets/js/config.js, so ANYONE can read every code without opening a course,
   passing a quiz, or working in retail at all. The quiz is NOT a gate — it never
   was. What actually protects these is the Shopify side: a total-redemption cap,
   one-use-per-customer, a hard expiry, and a minimum-purchase floor on the top
   tier. Set those before you promote the program, and size the cap to expected
   partner headcount — the cap IS the kill switch, because without it a leaked
   40%-off sitewide code can only be stopped by a redeploy.

   Also avoid encoding the tier in the code name: from one legitimately earned
   GPENPRO25 anyone can guess GPENELITE35. Use non-guessable suffixes instead
   (e.g. GPU-25-7K2MX4).

   LATER (unique per-person codes via the Shopify Admin API): you do NOT need to
   touch anything else in the app. Replace the body of `issueRewardCode()` at the
   bottom of this file with an API call that returns { code, label, note }. That
   single function is the ONLY place a code is minted — everything upstream just
   calls it and displays whatever it returns.
   ========================================================================== */
window.TRAINING_CONFIG = {
  brand: "G Pen",
  programName: "G Pen Training",
  shopUrl: "https://www.gpen.com",
  /* The home-page hero photograph: the POP-display program merchandised on a real
     shelf. Swap the file or point this at a new one to change it — set it to ""
     and the hero renders headline-only rather than breaking. */
  heroImage: "assets/img/hero-lineup-shelf.jpg",
  // Where "Email my certification" / support requests go.
  contactEmail: "pr@grencoscience.com",

  /* >>> LEGAL / ELIGIBILITY COPY (counsel can reword without touching app.js) <<<
     footerNote renders in the site footer on every page. privacyUrl is optional —
     leave "" and no privacy link is rendered; set it and it appears in the footer
     and under the certification form (where name / email / store are collected). */
  footerNote: "for authorized G Pen retail partners, 21+ — training and hardware education only. No cannabis, nicotine or e-liquid products are sold or shipped through this site.",
  privacyUrl: "",

  /* >>> "TALK TO OUR TEAM" CONTACT BAND <<<
     The customer-service block at the very bottom of every page. Edit the
     phone/email/hours here — the tel: and mailto: links build from these. */
  support: {
    phone: "+1 833-691-3224",
    email: "help@gpen.com",
    hours: "Mon–Fri · 10:00 AM – 6:00 PM EST",
  },

  /* >>> LANGUAGE SELECTOR <<<
     On. Live locales: es, de, fr, it, pt — one file each in assets/data/i18n/,
     loaded by index.html from localStorage BEFORE app.js runs.

     Adding a language is three edits and no code: write the locale file, add its
     code to LOCALES in index.html, and add it to LANGS + LANG_ORDER in app.js.
     Anything the file does not translate falls back to English, marked up as
     English, so a partial locale is publishable on day one.

     Set this to false to hide the picker entirely and serve English only. */
  i18n: { enabled: true },

  // Master certification = finish every course in data.js (all of them are "core").
  // Set to a list of slugs to require only some; null = require them all.
  coreCourses: null,

  /* The reward ladder climbs with the number of products you certify on:
       1 course -> 25%   2 courses -> 30%   4 courses -> 35%   whole lineup -> 40%
     (The tier keys below — course / trio / master / secret — are just the
      internal names the code uses to look up each discount; the course-count
      thresholds live in the LADDER table near the top of app.js — add or move a rung
      there and the ladder cards, the pre-quiz CTAs and the code actually issued all
      follow.) */
  /* >>> REWARDS — the tier table and where codes come from <<<

     THE FOUR STATIC CODES THAT USED TO LIVE HERE DID NOT EXIST IN SHOPIFY.
     GPENPRO25, GPENHOLO30, GPENELITE35 and CERTIFIEDG40 were checked against the
     live gpen.com store: none of them is a discount. Every rep who certified was
     handed a code that fails at the till. They are gone, and the percentages below
     are the only thing this file still asserts.

     `pct` is display only — the endpoint keeps its own copy of the tier table and
     mints from that, so a tampered browser cannot mint itself 90% off.

     Set rewards.url to the deployed endpoint (see reward-api/README.md). While it is
     empty the reward panel renders nothing at all, on purpose. */
  rewards: {
    /* Live. Verified against the real store: a code minted here appears in Shopify
       admin as ACTIVE, 25% off the whole order, usage limit 1, once per customer, no
       stacking — and asking twice returns the same code rather than creating a second
       discount. Deployed from reward-api/; see .github/GOLIVE.md. */
    url: "https://gpen-training-rewards.vercel.app/api/reward",
    // One terms line for every tier, shown wherever a code is. Single-use is enforced
    // by the endpoint (usageLimit 1 on a discount created for one person), so this
    // sentence describes what the store will actually do.
    terms: "One use per person. Not combinable with other offers. Expires 90 days after it is issued.",
    // The endpoint echoes this back with every code; it is here so the locale
    // validator can see it as a required string, since app.js runs it through t().
    note: "Enter this code at checkout on gpen.com. It applies to the whole order.",
    // Shown on the card next to the code. The percentage in each of these comes from
    // LADDER in app.js, which is the single source of truth for what a tier is worth.
    tiers: {
      course: { pct: 25, label: "25% off your next order at gpen.com" },
      trio:   { pct: 30, label: "30% off your next order at gpen.com" },
      master: { pct: 35, label: "35% off your entire order at gpen.com" },
      secret: { pct: 40, label: "40% off your entire order at gpen.com" },
    },
  },

  /* >>> FREE-DEVICE PRIZE — every Nth full-lineup certification wins <<<
     Certify on the whole lineup and you're in line for a free device (the 40% code
     is yours either way). Two modes:

       mode: "everyNth"  — every Nth person to certify on the whole lineup wins a
                           free device, and the device ROTATES with each winner
                           (winner 1 gets rotation[0], winner 2 gets rotation[1], …).
                           Deterministic and auditable: no drawing to administer,
                           no winner-selection dispute, and the sheet shows exactly
                           who won and why. This is the recommended mode.
       mode: "drawing"   — a periodic random draw (uses `cadence`).

     ⚠️ THE WINNER IS DECIDED IN YOUR SHEET, NOT IN THE BROWSER. A rep's browser
     only knows about itself — it cannot know whether it is completion #3 or #300,
     and anything it did know could be faked by clearing site data. The counting
     and selection live in the Apps Script that receives the webhook; REPORTING.md
     has the exact script, and it reads `everyNth` / `rotation` from here so this
     file stays the single source of truth. That is also why `live` alone does
     nothing without `reporting.url` — with no webhook there is no counter, so
     there is no way to run the promotion at all.

     ⚠️ `live: true` PUBLISHES A US PRIZE PROMOTION to whoever can reach the site.
     Have counsel clear the rules page first and host it at a real URL. The draft
     is kept OUTSIDE this repo, at ../gpen-training-legal/rules.draft.html, because
     GitHub Pages serves every committed file (.nojekyll is present) — it still
     has ~20 unfilled [bracketed] placeholders). Awarding a prize for completing
     five quizzes can count as consideration in around a dozen states without a
     genuine alternate method of entry, so the rules page is not optional.
     Reviewing before then: open the site with ?preview=draw.
       enabled  : master switch for the whole feature
       live     : the human "counsel has signed off" gate
       mode     : "everyNth" (recommended) or "drawing"
       everyNth : N — every Nth full-lineup certification wins (mode "everyNth")
       rotation : which device each successive winner gets, in order; loops
       cadence  : how often you draw (mode "drawing" only)
       rulesUrl : where the CLEARED Official Rules are hosted */
  sweepstakes: {
    enabled: true,
    live: true,
    mode: "everyNth",
    everyNth: 20,
    rotation: ["G Pen Dash II", "G Pen Dash+", "G Pen Melt Hot Knife", "G Pen Hydout", "G Pen 510 Original"],
    cadence: "monthly",
    prize: "a free G Pen",
    // ⚠️ THE LAST GATE. The promotion cannot render until this points at a LIVE,
    // counsel-cleared rules page — drawLive() requires it, so `live: true` above
    // and a pasted reporting webhook are NOT enough on their own. Leave it empty
    // and the site simply shows the guaranteed discount instead. Review the full
    // treatment any time with ?preview=draw.
    rulesUrl: "",
  },

  /* >>> COMPLETION REPORTING <<<
     Paste a webhook URL here to log every certification (who / which store /
     which product / score) to a Google Sheet, Airtable, or Zapier/Make.
     Leave "" to disable (nothing is sent; progress still saves on-device).
     Two-minute setup instructions are in REPORTING.md. No API keys live in
     this file — you only paste a webhook URL, so it's safe on a public site. */
  reporting: {
    /* The tracking sheet's Apps Script web app. Live and verified: posting a course
       event and its code_issued event returns {"ok":true} and upserts one row keyed on
       certId. See google-sheet/README.md.

       Posted fire-and-forget with mode:"no-cors", so the response is never read — which
       is why Apps Script's redirect-to-echo dance does not matter here. */
    url: "https://script.google.com/macros/s/AKfycbxWDedfr6SIknMT7TTt_VtyOjdos8avlcKlic1t-T0P44wY9sZFWYhLc_bQaZDuL8nv/exec",
  },
};

/* -----------------------------------------------------------------------------
   REWARD ISSUANCE — the single, isolated hand-off point.
   Called as: issueRewardCode("course", { courseSlug, name, email, store, certId })
          or: issueRewardCode("trio" | "master" | "secret", { name, email, store })
   Returns (sync or Promise) an object: { code, label, note }.

   TO GO LIVE WITH UNIQUE CODES LATER: swap the body for something like —
     return fetch("/api/mint-code", { method:"POST", body: JSON.stringify(ctx) })
              .then(function (r) { return r.json(); });
   The rest of the app already awaits this, so no other change is needed.
   --------------------------------------------------------------------------- */
/* -----------------------------------------------------------------------------
   REWARD ISSUANCE — one code, one person, minted in Shopify.

   Returns a PROMISE of { type, code, label, note, terms } — every caller already
   awaits it, so this can go to the network.

   WHY A SERVER IS INVOLVED. Creating a Shopify discount needs an Admin API token,
   and a token in this file would be a token published on the internet. So the
   browser calls a small endpoint that holds the token and does the create. Set
   rewards.url in the config above; the endpoint lives in reward-api/ in this repo.

   ONE CODE PER PERSON PER TIER, AND ONLY ONE. Two things guarantee it:
     - This function caches what the endpoint returned, keyed by email + tier, so a
       reload, a Back button or a second visit to the certificate shows the SAME code
       and never asks for another. Without this, every page view of #/certified would
       mint a fresh discount in the store.
     - The endpoint itself derives the code deterministically from email + tier and
       looks it up before creating, so even a cache miss returns the same code rather
       than a duplicate.

   WHEN IT FAILS IT SHOWS NOTHING. A rep seeing no code is a support ticket; a rep
   seeing a code that fails at the till is a lost sale and a broken promise. Callers
   already render nothing when `code` is empty.
   --------------------------------------------------------------------------- */
var REWARD_CACHE_KEY = "gpt.rewards";

function readRewardCache() {
  try { return JSON.parse(localStorage.getItem(REWARD_CACHE_KEY) || "{}"); } catch (e) { return {}; }
}
function writeRewardCache(map) {
  try { localStorage.setItem(REWARD_CACHE_KEY, JSON.stringify(map)); } catch (e) {}
}

/* One place that shapes the code_issued event, used by both the first send and the
   replay, so the two can never drift into reporting different fields. */
function reportCode_(type, entry) {
  if (typeof window.reportCompletion !== "function") return false;
  var c = entry.ctx || {};
  return !!window.reportCompletion({
    type: "code_issued", tier: type, code: entry.code,
    email: c.email || "", name: c.name || "", store: c.store || "",
    courseSlug: c.courseSlug || "", certId: c.certId || "",
  });
}

/* Replay every cached code the sheet has not been told about. Called from boot().
   Cheap and idempotent: the receiver upserts on certId, so a code that arrives twice
   updates one row rather than adding one. Entries cached before this field existed
   have no ctx and cannot be replayed — they are stamped as sent so they do not retry
   forever on a load that can never succeed. */
window.reportPendingCodes = function () {
  var map = readRewardCache(), changed = false;
  Object.keys(map).forEach(function (k) {
    var entry = map[k];
    if (!entry || !entry.code || entry.reported) return;
    if (!entry.ctx) { entry.reported = "n/a"; changed = true; return; }
    if (reportCode_(entry.type || String(k).split("|")[0], entry)) {
      entry.reported = new Date().toISOString();
      changed = true;
    }
  });
  if (changed) writeRewardCache(map);
};

/* Wipe every cached code. Exported because app.js owns the two places a device changes
   hands — "Reset my progress" and the certify-form handover — but config.js owns the
   key, and a second copy of "gpt.rewards" in app.js would drift the first time either
   moved.

   This is not tidiness. The cache holds each code AND the ctx that produced it (email,
   name, store, certId), and every code surface — the done-hero, the ladder cards, an
   already-passed course page — resolves straight from it with no identity check. So the
   next person to pick up a shared counter tablet was shown the previous rep's live,
   single-use Shopify codes with a "Tap to copy" button. One tap burns a reward someone
   else earned. Both confirms also promised the data was erased, which it was not. */
window.clearRewardCache = function () {
  try { localStorage.removeItem(REWARD_CACHE_KEY); } catch (e) {}
};

window.issueRewardCode = function (type, ctx) {
  var CFG = window.TRAINING_CONFIG || {};
  var rw = CFG.rewards || {};
  var email = String((ctx && ctx.email) || "").trim().toLowerCase();
  // The per-course tier is unique per person PER COURSE, so the slug is part of its
  // identity — pass the Dash II and you get a different code than for the Hydout. The
  // milestone tiers (2, 4 and all products) are once per person, so they key on the
  // tier alone. The endpoint derives its code from these same parts.
  var slug = (type === "course" && ctx && ctx.courseSlug) ? String(ctx.courseSlug) : "";
  var cacheKey = type + "|" + email + (slug ? "|" + slug : "");

  // Already minted for this person and tier — hand back the identical code.
  var cached = readRewardCache()[cacheKey];
  if (cached && cached.code) return Promise.resolve(cached);

  if (!rw.url) {
    if (window.console) {
      console.warn("[gpen-training] rewards.url is empty, so no discount code can be issued. " +
        "Deploy reward-api/ and set TRAINING_CONFIG.rewards.url. Until then the reward panel renders nothing, " +
        "which is deliberate: handing a rep a code that does not exist in Shopify is worse than handing them none.");
    }
    return Promise.resolve(null);
  }
  if (!email) {
    if (window.console) console.warn("[gpen-training] issueRewardCode called without an email; a per-person code cannot be minted.");
    return Promise.resolve(null);
  }
  // A per-course code with no course is not a thing the store can issue, and a caller
  // asking for one has a bug. Refuse it here rather than mint something meaningless:
  // the endpoint rejects it too, so this only turns a confusing 400 into a clear
  // console line naming the caller's mistake.
  if (type === "course" && !slug) {
    if (window.console) console.warn("[gpen-training] issueRewardCode('course') needs ctx.courseSlug — the 25% reward is one code per product.");
    return Promise.resolve(null);
  }

  return fetch(rw.url, {
    method: "POST",
    // text/plain keeps this a CORS "simple request" — no preflight, which is what
    // lets a Google Apps Script endpoint work as a drop-in alternative to Vercel.
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      tier: type,
      email: email,
      name: (ctx && ctx.name) || "",
      store: (ctx && ctx.store) || "",
      certId: (ctx && ctx.certId) || "",
      courseSlug: (ctx && ctx.courseSlug) || "",
    }),
  })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || !data.code) {
        if (window.console) console.warn("[gpen-training] the reward endpoint returned no code for tier '" + type + "'", data);
        return null;
      }
      var out = { type: type, code: data.code, label: data.label || "", note: data.note || "", terms: data.terms || "" };
      /* Tell the sheet which code went to whom, as its own event. The course pass is
         reported the moment it happens; the code exists a second or two later, after a
         round trip to Shopify, so it cannot ride along on that row. The receiver
         matches on certId (falling back to email + course) and fills the Code column,
         which is what the hourly redemption sync then reads.

         EARNED vs REPORTED, the same split app.js uses for every other event. If
         rewards.url is live before reporting.url — the likely order, since the codes
         are the part reps notice — then these sends go nowhere, and unlike a course
         pass there is no state flag to replay from. So the cache carries the identity
         the resend needs and a `reported` stamp; reportPendingCodes() below replays
         anything unstamped on the next load. A code missing from the sheet is a row
         whose redemption status can never be filled in. */
      out.ctx = { email: email, name: (ctx && ctx.name) || "", store: (ctx && ctx.store) || "",
                  courseSlug: (ctx && ctx.courseSlug) || "", certId: (ctx && ctx.certId) || "" };
      out.reported = reportCode_(type, out) ? new Date().toISOString() : "";
      var map = readRewardCache(); map[cacheKey] = out; writeRewardCache(map);
      return out;
    })
    .catch(function (err) {
      if (window.console) console.warn("[gpen-training] the reward endpoint could not be reached; no code issued.", err);
      return null;
    });
};

/* -----------------------------------------------------------------------------
   COMPLETION REPORTING — the single, isolated send point.
   Called on every certification with an event object:
     { type:"course"|"master", name, email, store, product, score, certId, date }
   Fire-and-forget POST (mode:"no-cors") so it never blocks the UI and needs no
   CORS setup on the receiver. To change destinations, only edit reporting.url
   in the config above (or swap this body). See REPORTING.md.

   RETURNS true if the event was actually dispatched, false if reporting is off
   or the send threw. Callers use this to decide whether to mark an event as
   REPORTED — separately from marking it EARNED — so that anything earned while
   reporting.url was empty is still resent once a webhook exists.
   --------------------------------------------------------------------------- */
window.reportCompletion = function (event) {
  var cfg = (window.TRAINING_CONFIG && window.TRAINING_CONFIG.reporting) || {};
  if (!cfg.url) return false; // reporting disabled — nothing sent, so not reported
  try {
    fetch(cfg.url, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(Object.assign({ sentAt: new Date().toISOString() }, event)),
    });
    return true;
  } catch (e) { return false; /* best-effort; progress is also stored on-device */ }
};
