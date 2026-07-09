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

  // Master certification = finish every course in data.js (all 5 are "core").
  // Set to a list of slugs to require only some; null = require them all.
  coreCourses: null,

  discount: {
    // Shown after passing ANY single course quiz. 25% off.
    course: {
      code: "GPENPRO25",
      label: "25% off your next order at gpen.com",
      note: "Use this code at checkout on gpen.com to buy and test the product you just got certified on.",
    },
    // Shown once ALL courses are complete (G Pen Certified Specialist). 35% off.
    master: {
      code: "GPENELITE35",
      label: "35% off your entire order at gpen.com",
      note: "Your top specialist reward for completing every G Pen course — the biggest discount we offer through the program.",
    },
    // OPTIONAL: give a specific product its own course code. Keyed by course slug.
    // e.g. perCourse: { "dash-ii": { code: "DASH2PRO", label: "...", note: "..." } }
    perCourse: {},
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
          or: issueRewardCode("master", { name, email, store, certId })
   Returns (sync or Promise) an object: { code, label, note }.

   TO GO LIVE WITH UNIQUE CODES LATER: swap the body for something like —
     return fetch("/api/mint-code", { method:"POST", body: JSON.stringify(ctx) })
              .then(function (r) { return r.json(); });
   The rest of the app already awaits this, so no other change is needed.
   --------------------------------------------------------------------------- */
window.issueRewardCode = function (type, ctx) {
  var d = window.TRAINING_CONFIG.discount;
  if (type === "master") return Object.assign({ type: "master" }, d.master);
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
