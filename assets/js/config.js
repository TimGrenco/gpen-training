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
  programName: "G Pen University",
  shopUrl: "https://www.gpen.com",
  registerUrl: "https://www.gpen.com/register",
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
     Off until a real locale file exists. The picker's machinery (LANGS / setLang
     / bindLangSel in app.js) is intact — only the header control is hidden. With
     it on and no translations, four of five choices just toast "coming soon",
     which reads as an unfinished feature in the highest-status slot on the page.
     To ship a language: add assets/data/i18n/<lang>.js, then set enabled: true. */
  i18n: { enabled: false },

  // Master certification = finish every course in data.js (all 5 are "core").
  // Set to a list of slugs to require only some; null = require them all.
  coreCourses: null,

  /* The reward ladder climbs with the number of products you certify on:
       1 course -> 25%   2 courses -> 30%   4 courses -> 35%   all 5 -> 40%
     (The tier keys below — course / trio / master / secret — are just the
      internal names the code uses to look up each discount; the course-count
      thresholds live in the LADDER table near the top of app.js — add or move a rung
      there and the ladder cards, the pre-quiz CTAs and the code actually issued all
      follow.) */
  discount: {
    // Unlocked after passing ANY single course quiz. 25% off.
    course: {
      code: "GPENPRO25",
      label: "25% off your next order at gpen.com",
      note: "Use this code at checkout on gpen.com to buy and test the product you just got certified on.",
      terms: "One use per person. Not combinable with other offers. Use your highest unlocked code.",
    },
    // Unlocked at 2 certified products. 30% off.
    trio: {
      code: "GPENHOLO30",
      label: "30% off your next order at gpen.com",
      note: "Two products deep. You know the lineup better than most of the floor — here's a bigger cut.",
      terms: "One use per person. Not combinable with other offers. Use your highest unlocked code.",
    },
    // Unlocked at 4 certified products. 35% off.
    master: {
      code: "GPENELITE35",
      label: "35% off your entire order at gpen.com",
      note: "Four products certified. One more and you unlock the full 40%.",
      terms: "One use per person. Not combinable with other offers. Use your highest unlocked code.",
    },
    // Unlocked once ALL 5 courses are complete — the whole lineup. 40% off.
    // (The free-device prize is presented separately in the finish-line panel,
    // which needs sweepstakes.live AND sweepstakes.rulesUrl AND a reporting
    // webhook — a webhook alone does NOT start it. See the sweepstakes block.)
    secret: {
      code: "CERTIFIEDG40",
      label: "40% off your entire order at gpen.com",
      note: "You certified on the whole lineup — the top reward in the program. Put it toward your own device: the reps who know these products best are the ones who've actually used one.",
      terms: "One use per person. Not combinable with other offers. Use your highest unlocked code.",
    },
    // OPTIONAL: give a specific product its own course code. Keyed by course slug.
    // e.g. perCourse: { "dash-ii": { code: "DASH2PRO", label: "...", note: "..." } }
    perCourse: {},
  },

  /* >>> FREE-DEVICE PRIZE — every Nth full-lineup certification wins <<<
     Certify on all 5 products and you're in line for a free device (the 40% code
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
     is at .claude/drafts/rules.draft.html (deliberately not deployed — it still
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
    url: "",          // e.g. "https://script.google.com/macros/s/AKfyc.../exec"
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
window.issueRewardCode = function (type, ctx) {
  var d = (window.TRAINING_CONFIG && window.TRAINING_CONFIG.discount) || {};
  // Missing tier = loud in the console, never a silent empty reward box.
  function tier(key, obj) {
    if (!obj || !obj.code) {
      if (window.console) console.warn("[gpen-training] issueRewardCode: no code configured for tier '" + key + "' — check TRAINING_CONFIG.discount." + key);
    }
    return Object.assign({ type: key }, obj || {});
  }
  if (type === "secret") return tier("secret", d.secret);
  if (type === "master") return tier("master", d.master);
  if (type === "trio") return tier("trio", d.trio);
  // `|| {}` so deleting the obviously-empty perCourse object can't throw on every pass.
  var pc = d.perCourse || {};
  var perCourse = (ctx && ctx.courseSlug && pc[ctx.courseSlug]) || d.course;
  return tier("course", perCourse);
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
