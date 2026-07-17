/* =============================================================================
   G PEN TRAINING PORTAL — CONFIG  (edit me first!)
   -----------------------------------------------------------------------------
   Everything a non-developer needs to tweak lives here: the discount codes,
   the pass mark, contact email, and where the "shop now" button points.

   >>> DISCOUNT CODES <<<
   For now these are GENERIC codes that everyone who certifies can use. To change
   a code, just edit the `code` / `label` / `note` strings below.

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

  /* >>> "TALK TO OUR TEAM" CONTACT BAND <<<
     The customer-service block at the very bottom of every page. Edit the
     phone/email/hours here — the tel: and mailto: links build from these. */
  support: {
    phone: "+1 833-691-3224",
    email: "help@gpen.com",
    hours: "Mon–Fri · 10:00 AM – 6:00 PM EST",
  },

  // Master certification = finish every course in data.js (all 5 are "core").
  // Set to a list of slugs to require only some; null = require them all.
  coreCourses: null,

  /* The reward ladder climbs with the number of products you certify on:
       1 course -> 25%   2 courses -> 30%   4 courses -> 35%   all 5 -> 40%
     (The tier keys below — course / trio / master / secret — are just the
      internal names the code uses to look up each discount; the course-count
      thresholds live in rewardsSection() in app.js.) */
  discount: {
    // Unlocked after passing ANY single course quiz. 25% off.
    course: {
      code: "GPENPRO25",
      label: "25% off your next order at gpen.com",
      note: "Use this code at checkout on gpen.com to buy and test the product you just got certified on.",
    },
    // Unlocked at 2 certified products. 30% off.
    trio: {
      code: "GPENHOLO30",
      label: "30% off your next order at gpen.com",
      note: "Two products deep. You know the lineup better than most of the floor — here's a bigger cut.",
    },
    // Unlocked at 4 certified products. 35% off.
    master: {
      code: "GPENELITE35",
      label: "35% off your entire order at gpen.com",
      note: "Four products certified. One more and you unlock the full 40%.",
    },
    // Unlocked once ALL 5 courses are complete — the whole lineup. 40% off.
    // (The free-G-Pen DRAW is presented separately in the sweepstakes panel, which
    // only appears once a reporting webhook is configured — see the sweepstakes block.)
    secret: {
      code: "CERTIFIEDG40",
      label: "40% off your entire order at gpen.com",
      note: "You certified on the whole lineup — the top reward in the program. Put it toward your own device: the reps who sell the most are the ones who carry one.",
    },
    // OPTIONAL: give a specific product its own course code. Keyed by course slug.
    // e.g. perCourse: { "dash-ii": { code: "DASH2PRO", label: "...", note: "..." } }
    perCourse: {},
  },

  /* >>> FREE-G-PEN SWEEPSTAKES <<<
     Certify on all 5 products and you're auto-entered to win a free G Pen (and
     you still get the 40% code no matter what). It's a SWEEPSTAKES, not a raffle
     (no purchase, equal odds). Entries log via the reporting webhook below — no
     server needed. Draw is run off-platform by the client. Edit freely.
       enabled  : master switch for the whole feature
       cadence  : how often you draw (shown in copy + rules)
       prize    : what they win (shown in copy)
       rulesUrl : the static Official Rules page (rules.html ships with the site) */
  sweepstakes: {
    enabled: true,
    cadence: "monthly",
    prize: "a free G Pen",
    rulesUrl: "rules.html",
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
  var d = window.TRAINING_CONFIG.discount;
  if (type === "secret") return Object.assign({ type: "secret" }, d.secret);
  if (type === "master") return Object.assign({ type: "master" }, d.master);
  if (type === "trio") return Object.assign({ type: "trio" }, d.trio);
  var perCourse = (ctx && ctx.courseSlug && d.perCourse[ctx.courseSlug]) || d.course;
  return Object.assign({ type: "course" }, perCourse);
};

/* -----------------------------------------------------------------------------
   COMPLETION REPORTING — the single, isolated send point.
   Called on every certification with an event object:
     { type:"course"|"master", name, email, store, product, score, certId, date }
   Fire-and-forget POST (mode:"no-cors") so it never blocks the UI and needs no
   CORS setup on the receiver. To change destinations, only edit reporting.url
   in the config above (or swap this body). See REPORTING.md.
   --------------------------------------------------------------------------- */
window.reportCompletion = function (event) {
  var cfg = (window.TRAINING_CONFIG && window.TRAINING_CONFIG.reporting) || {};
  if (!cfg.url) return; // reporting disabled — no-op
  try {
    fetch(cfg.url, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(Object.assign({ sentAt: new Date().toISOString() }, event)),
    });
  } catch (e) { /* best-effort; progress is also stored on-device */ }
};
