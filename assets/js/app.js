/* =============================================================================
   G PEN TRAINING PORTAL — APP
   A small hash-routed SPA. No framework, no backend. Progress in localStorage.

   Routes: "/" home (state-aware hero + the product lineup, grouped by family)
           "/course/<slug>"  product course: key points, counter script, video, quiz
           "/certified"      the full-lineup master certificate
           "/about"          brand story
   There is no sign-up gate: everything is browsable, and name/email/store are
   collected just-in-time when a rep opts into a quiz.

   Two invariants worth knowing before editing (see also the memory notes):
   - LADDER (below) is the single source of every reward percentage, including
     the code actually issued on a pass. Never hardcode a percentage.
   - sendReport() is the ONE place that talks to the reporting webhook, and
     EARNED is tracked separately from REPORTED so anything earned before a
     webhook exists is backfilled later rather than lost.
   ========================================================================== */
(function () {
  "use strict";

  /* ---- tiny helpers ------------------------------------------------------ */
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var CFG = window.TRAINING_CONFIG;
  var COURSES = window.GPEN_COURSES || [];
  var app = $("#app");

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]; }); }
  function courseBySlug(slug) { return COURSES.filter(function (c) { return c.slug === slug; })[0]; }
  // The next product still to certify (skipping `afterSlug`) — drives the
  // "Next up →" hand-off so the journey always has a forward edge.
  function nextCourse(afterSlug) { return COURSES.filter(function (c) { return c.slug !== afterSlug && !coursePassed(c.slug); })[0] || null; }
  /* PREVIEW MODE: ?preview=draw renders the whole prize treatment for THIS visit
     only, so the team can review and screenshot it without publishing a promotion
     to every visitor. A banner makes the state obvious, and reporting stays off
     (see sendReport) so nobody is told they're entered when there is no pool. */
  var DRAW_PREVIEW = /[?&]preview=draw(&|$)/.test(location.search);
  /* The ONE place that knows about preview. Returning false (rather than
     short-circuiting further up) is load-bearing: the *Reported flags stay unset,
     so if a real rep arrives via a shared preview link nothing is lost — boot()'s
     backfill resends everything on their next normal load. Without this, the
     "master" event still fired in preview, and master is the event the winner
     counter actually reads, so a reviewer screenshotting the flow could advance
     the real queue — while the banner promised "no entries are recorded". */
  function sendReport(payload) {
    if (DRAW_PREVIEW) return false;
    return !!(window.reportCompletion && window.reportCompletion(payload));
  }
  /* The free-device prize needs FOUR things to render, and two of them are
     deliberate human gates: `live` (counsel has signed off) and `rulesUrl` (the
     cleared rules page is actually hosted). Pasting a reporting webhook — the one
     step the client is told to do — must never publish a prize promotion as a side
     effect. Until all four line up, the reward is simply the guaranteed discount;
     we never promise an entry that goes nowhere. */
  function drawLive() {
    var s = CFG.sweepstakes || {};
    if (DRAW_PREVIEW) return s.enabled !== false;   // review flow needs no rules URL
    // rulesUrl is a STRUCTURAL precondition, not just documentation: without it the
    // panel would publish a full eligibility/void-where-prohibited statement with no
    // Official Rules behind it. With `live` already true, reporting.url was the only
    // remaining gate — and pasting that webhook is the one step the client is told to
    // do. No config combination can now publish the promotion without a rules page.
    return s.enabled !== false && s.live === true && !!s.rulesUrl && !!((CFG.reporting || {}).url);
  }
  /* Prize copy, derived from config so every surface describes the SAME mechanic.
     "everyNth" is deterministic — every Nth full-lineup certification wins, and
     the device rotates with each winner. The browser cannot know a rep's position
     in that queue (it only knows about itself, and anything it did know could be
     faked by clearing site data), so we describe the rule and never claim a
     standing. The count and the winner are decided in the sheet — see REPORTING.md. */
  function prizeCopy() {
    var s = CFG.sweepstakes || {};
    var prize = s.prize || "a free G Pen";
    // An unrecognised mode must never silently republish the OTHER mechanic: the
    // Apps Script awards every Nth regardless, so falling through to "drawing"
    // would put terms in the fine print that fulfilment does not follow.
    var mode = String(s.mode || "everyNth").trim();
    if (mode !== "everyNth" && mode !== "drawing") {
      if (window.console) console.error('[gpen-training] config.sweepstakes.mode is "' + s.mode + '" — expected "everyNth" or "drawing". Falling back to "everyNth".');
      mode = "everyNth";
    }
    if (mode === "everyNth") {
      var n = s.everyNth || 20;
      return {
        mode: "everyNth",
        n: n,
        short: "every " + ordinal(n) + " specialist wins a free device",
        statusOn: "You're in line",
        headline: "You're in line for a free device.",
        rule: "Every " + ordinal(n) + " person to certify on the whole lineup wins a free G&nbsp;Pen device, and the device rotates with each winner.",
        fine: "No purchase necessary. Open to authorized G Pen retail staff (dispensary & smoke shop), 21+, US, void where prohibited. Every " + ordinal(n) + " full-lineup certification wins; winners are notified by email at the address on their certificate.",
      };
    }
    return {
      mode: "drawing",
      short: "a shot at " + prize,
      statusOn: "You're in the draw",
      headline: "You're entered to win " + prize + ".",
      rule: "Every fully-certified specialist is entered to win " + prize + ", drawn " + (s.cadence || "monthly") + ".",
      fine: "No purchase necessary. Open to authorized G Pen retail staff (dispensary & smoke shop), 21+, US, void where prohibited. Winners drawn " + (s.cadence || "monthly") + ".",
    };
  }
  function ordinal(n) {
    var s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
  function coreSlugs() { return CFG.coreCourses && CFG.coreCourses.length ? CFG.coreCourses : COURSES.map(function (c) { return c.slug; }); }
  function todayKey() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function niceDate() { return new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }); }
  // Grenco Science launched at the 2012 Cypress Hill Smoke Out. Every "years in
  // the business" figure derives from this so none of them can drift apart or
  // quietly go stale — the About h1 and its stat tile used to disagree by one.
  var FOUNDED = 2012;
  function brandYears() { return Math.max(1, new Date().getFullYear() - FOUNDED); }

  /* Product shots come from Shopify's CDN as ~1448px originals — the five landing
     covers alone were 1.1MB, which is a real cost on dispensary LTE. The CDN
     resizes on demand, so ask for roughly 2x the CSS box (crisp on retina, a
     fraction of the bytes): a cover drops ~310KB -> ~39KB.
     DISPLAY PATHS ONLY. The canvas exports (share card, saved card PNG) must keep
     the full-resolution source, so they call the raw URL, not this. Non-Shopify
     hosts are returned untouched — assets.gpen.com does not resize, and its
     lifestyle shots are already ~28KB. */
  function sized(url, cssPx) {
    if (!url || url.indexOf("cdn.shopify.com") < 0 || /[?&]width=/.test(url)) return url;
    return url + (url.indexOf("?") >= 0 ? "&" : "?") + "width=" + Math.round(cssPx * 2);
  }

  /* ---- persistence ------------------------------------------------------- */
  var K_ENROLL = "gpt.enrollment", K_STATE = "gpt.state";
  function getEnroll() { try { return JSON.parse(localStorage.getItem(K_ENROLL) || "null"); } catch (e) { return null; } }
  function setEnroll(v) { try { localStorage.setItem(K_ENROLL, JSON.stringify(v)); } catch (e) {} }
  function getState() {
    var d = { courses: {}, master: null, trio: null, log: [] };
    var s;
    try { s = Object.assign(d, JSON.parse(localStorage.getItem(K_STATE) || "{}")); } catch (e) { return d; }
    return s;
  }
  function setState(s) { try { localStorage.setItem(K_STATE, JSON.stringify(s)); } catch (e) {} }
  /* Structured event log — a future Sheet/Airtable webhook can POST these.
     Pass `st` when the caller is already holding a state object it will setState()
     itself. Without that, this function's own read-modify-write got clobbered:
     maybeReportTier and reportMaster both read `s`, call logEvent, then setState(s)
     at the end — writing back a state read BEFORE the log entry existed. The trio,
     elite and master events were therefore never in state.log at all, which is
     precisely the three rows that mark a reward tier for the reporting sheet. */
  function logEvent(type, data, st) {
    var s = st || getState(); s.log = s.log || [];
    s.log.push(Object.assign({ type: type, at: new Date().toISOString() }, data || {}));
    if (!st) setState(s);   // the caller owns the write when it handed us its state
    return s;
  }
  /* Replaces the old cardOwned(): it was an alias for exactly this pass check, kept
     only because the collectible layer wanted card-flavoured naming. */
  function coursePassed(slug) { var r = getState().courses[slug]; return !!(r && r.passed); }
  function completedCount() { var s = getState(); return COURSES.filter(function (c) { return s.courses[c.slug] && s.courses[c.slug].passed; }).length; }
  function isMasterEarned() { var s = getState(); return coreSlugs().every(function (sl) { return s.courses[sl] && s.courses[sl].passed; }); }

  /* ---- THE REWARD LADDER — one source of truth ---------------------------
     Certified-course count → discount tier. `key` is the config.discount key
     that issueRewardCode() mints. EVERYTHING that names a percentage — the
     ladder cards, the pre-quiz CTAs, and critically the code actually ISSUED
     on a pass — derives from this table. Before it existed the issuance sites
     hardcoded "course", so a rep finishing their fifth course was handed the
     25% code. Add a rung here and every surface follows. */
  var LADDER = [
    { at: 1, pct: 25, key: "course" },
    { at: 2, pct: 30, key: "trio" },
    { at: 4, pct: 35, key: "master" },
    { at: COURSES.length, pct: 40, key: "secret" },   // the whole lineup
  ];
  // Highest tier earned at `done` certified courses — null before the first pass.
  function tierAt(done) {
    var held = null;
    LADDER.forEach(function (x) { if (done >= x.at) held = x; });
    return held;
  }
  // The next rung still to climb — null once the ladder is topped out.
  function nextTier(done) { return LADDER.filter(function (x) { return x.at > done; })[0] || null; }
  // What a rep will hold after passing ONE more course — what pre-quiz CTAs promise.
  function tierIfOneMore(done) { return tierAt(done + 1) || tierAt(done); }
  // Only promise a percentage when one more pass ACTUALLY moves a rung. LADDER has
  // no rung at 3, so a rep with 2 certified was being told course 3 unlocks the
  // 30% they already hold. Returns null when nothing new is earned.
  function unlockPct(done) {
    var held = tierAt(done), next = tierIfOneMore(done);
    if (held && next && held.pct === next.pct) return null;
    return next ? next.pct : null;
  }
  // The tier key to mint for someone who has just certified their Nth course.
  function earnedTierKey() { var tier = tierAt(completedCount()); return tier ? tier.key : "course"; }
  // The best percentage on offer. COPY must call this rather than typing a number:
  // the issuance logic already reads LADDER, so a hardcoded "40% off" in a headline
  // is a promise that silently goes wrong the day someone retunes the top rung.
  function topPct() {
    return LADDER.reduce(function (best, x) { return x.pct > best ? x.pct : best; }, 0);
  }

  function pick(arr) { return arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : ""; }
  // Fisher–Yates — used to shuffle quiz question + choice order per attempt so a
  // retake isn't byte-identical (reps learn the material, not answer positions).
  function shuffle(arr) { var a = arr.slice(); for (var j = a.length - 1; j > 0; j--) { var k = Math.floor(Math.random() * (j + 1)); var tmp = a[j]; a[j] = a[k]; a[k] = tmp; } return a; }
  // The questions a rep missed, with the right answer + why — shown on the
  // results screen so every attempt teaches, on a pass AND a fail.
  function missedReviewHTML(c, order, answers) {
    if (!order || !answers) return "";
    var rows = order.map(function (qi, pos) {
      var q = c.quiz[qi];
      if (answers[pos] === q.answer) return "";
      return '<div class="qr-item">' +
        '<div class="qr-q">' + en(esc(q.q)) + "</div>" +
        '<div class="qr-a"><em>' + t("Answer") + "</em><span>" + en(esc(q.choices[q.answer])) + "</span></div>" +
        (q.why ? '<div class="qr-why">' + ic("spark") + "<span>" + en(esc(q.why)) + "</span></div>" : "") +
      "</div>";
    }).filter(Boolean);
    if (!rows.length) return "";
    return '<div class="qreview"><h4>' + ic("cap") + " " + tf("Worth another look &middot; {n} missed", { n: rows.length }) + "</h4>" + rows.join("") + "</div>";
  }


  /* Dialog semantics + focus management for our overlays: mark the container as
     a modal dialog, hide the background from assistive tech, pull focus into the
     dialog, trap Tab inside it, and return a release() that restores focus to the
     element that opened it. */
  function manageModalFocus(m, label) {
    var app = document.getElementById("app");
    // Without a name a screen reader announces only "dialog".
    if (label) m.setAttribute("aria-label", label);
    var trigger = document.activeElement;
    m.setAttribute("role", "dialog");
    m.setAttribute("aria-modal", "true");
    if (app) app.setAttribute("aria-hidden", "true");
    function focusables() {
      return [].slice.call(m.querySelectorAll('a[href],button:not([disabled]),iframe,input,select,textarea,[tabindex]:not([tabindex="-1"])'))
        .filter(function (el) { return el.tagName === "IFRAME" || el.offsetParent !== null; });
    }
    var first = m.querySelector(".modal-x") || focusables()[0] || m;
    setTimeout(function () { if (first && first.focus) first.focus(); }, 0);
    function onKey(ev) {
      if (ev.key !== "Tab") return;
      var f = focusables(); if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (ev.shiftKey && document.activeElement === a) { ev.preventDefault(); z.focus(); }
      else if (!ev.shiftKey && document.activeElement === z) { ev.preventDefault(); a.focus(); }
    }
    m.addEventListener("keydown", onKey);
    return function release() {
      if (app) app.removeAttribute("aria-hidden");
      // The trigger is often GONE by now. quizPass rewrites #quiz-zone before the
      // booster pack opens 550ms later, so the #q-next that opened the flow is
      // already detached — and focus()ing a detached node silently does nothing,
      // dumping a keyboard user at the top of the document, ~24 tab stops from the
      // reward code they just earned. Prefer the live trigger, else the results
      // block, else the page's main landmark.
      var target = (trigger && trigger.isConnected && trigger.focus) ? trigger
        : ($(".result") || document.getElementById("main"));
      if (target && target.focus) {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus();
      }
    };
  }

  /* Mid-funnel reward tiers, reported once each. Table-driven because the 4-course
     rung previously had no reporting at all — the middle of the funnel was dark.
     `elite` is deliberately not called "master": that type is the FULL-LINEUP event. */
  var REPORT_TIERS = [
    { flag: "trio", type: "trio", at: 2, label: "30% reward (2 courses)" },
    { flag: "elite", type: "elite", at: 4, label: "35% reward (4 courses)" },
  ];
  /* EARNED and REPORTED are tracked separately. If the earned stamp also gated the
     send, then anything earned while reporting.url was empty — i.e. every rep who
     certifies before the client pastes their webhook — would be stamped, never
     sent, and never resent, making the boot() backfill inert. So `flag` records
     that it was earned and `flag + "Reported"` records that it actually went. */
  function maybeReportTier() {
    var done = completedCount(), s = getState(), e = getEnroll() || {}, changed = false;
    REPORT_TIERS.forEach(function (tier) {
      if (done < tier.at) return;
      if (!s[tier.flag]) { s[tier.flag] = { at: new Date().toISOString() }; changed = true; logEvent(tier.flag, {}, s); }
      if (!s[tier.flag + "Reported"] &&
          sendReport({ type: tier.type, name: e.name, email: e.email, store: e.store, product: tier.label, score: 100, certId: "", date: niceDate() })) {
        s[tier.flag + "Reported"] = new Date().toISOString();
        changed = true;
      }
    });
    if (changed) setState(s);
  }
  /* The full-lineup event used to fire ONLY inside renderCertified(), so a rep who
     passed their fifth course and closed the tab was never recorded. Now called
     from quizPass; renderCertified just displays what this stamped. */
  function reportMaster() {
    if (!isMasterEarned()) return null;
    var s = getState(), e = getEnroll() || {}, changed = false;
    // Stamp the certificate once — this is what the cert page displays.
    if (!s.master) {
      var date = niceDate(), cid = certId((e.name || "") + "|G Pen Certified Specialist|" + date);
      s.master = { certId: cid, date: date, name: e.name };
      changed = true;
      logEvent("master", { certId: cid }, s);
    }
    var m = s.master;
    // Reporting is tracked separately from the stamp, and retried until it lands,
    // so certifications earned before the webhook existed are not lost. Reuses the
    // STORED certId/date so a late resend logs the certificate the rep is holding.
    if (!s.masterReported &&
        sendReport({ type: "master", name: e.name, email: e.email, store: e.store, product: "Full Lineup", score: 100, certId: m.certId, date: m.date })) {
      s.masterReported = new Date().toISOString(); changed = true;
    }
    // Full-lineup certification = one entry in the free-device prize. Never fires
    // in preview (no pool to enter), and stays pending so the rep is entered for
    // real the first time they load the page after the prize actually goes live.
    if (!s.masterEntryReported && drawLive() &&
        sendReport({ type: "sweepstakes_entry", name: e.name, email: e.email, store: e.store, product: "Free device prize", score: 100, certId: m.certId, date: m.date })) {
      s.masterEntryReported = new Date().toISOString(); changed = true;
    }
    if (changed) setState(s);
    return m;
  }
  /* Per-course events needed the same earned-vs-reported split as the tiers. They
     used to fire inline in quizPass behind `if (firstTime)` with the result
     discarded — so with no webhook yet (the shipping state) every course row was
     lost forever, and a later backfill would resurrect a rep's trio/elite/master
     rows with no course history behind them. Idempotent; safe to call anywhere. */
  function reportCourses() {
    var s = getState(), e = getEnroll() || {}, changed = false;
    COURSES.forEach(function (c) {
      var r = s.courses[c.slug];
      if (!r || !r.passed || r.reported) return;
      if (sendReport({ type: "course", name: r.name || e.name, email: e.email, store: e.store,
            product: "G Pen " + c.name, courseSlug: c.slug, score: r.score, certId: r.certId, date: r.date })) {
        r.reported = new Date().toISOString(); changed = true;
      }
    });
    if (changed) setState(s);
  }

  /* ---- icons (inline SVG) ------------------------------------------------ */
  var IC = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    cap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 2.5 3 6 3s6-2 6-3v-5"/></svg>',
    award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.5 13.5L17 22l-5-3-5 3 1.5-8.5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 118 0v3"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12l-8 8-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/></svg>',
    print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M6 14h12v8H6z"/></svg>',
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z"/></svg>',
    battery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="15" height="10" rx="2"/><path d="M20 10.5v3"/><path d="m9.5 9-2 3.2h2.8l-2 2.8"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 4 13C4 7 11 3 20 3c0 9-5 16-9 17z"/><path d="M9 15c2-3 5-5.5 8.5-6.5"/></svg>',
    drop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6.5 6.2 6.5 11a6.5 6.5 0 0 1-13 0C5.5 9.2 12 3 12 3z"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 11-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="3"/><circle cx="12" cy="10" r="3"/><path d="M8.5 20a3.5 3.5 0 017 0"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 21.4l1.4-6.8L2.2 9.9l6.9-.8z"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.4L19 9l-5.1 1.6L12 16l-1.9-5.4L5 9l5.1-1.6z"/><path d="M18.5 14l.9 2.4 2.6.8-2.6.8-.9 2.4-.9-2.4-2.6-.8 2.6-.8z"/><path d="M5 15l.7 1.9 2 .6-2 .6L5 20l-.7-1.9-2-.6 2-.6z"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 010 7"/><path d="M18.5 5.5a9 9 0 010 13"/></svg>',
    mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18Z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    caret: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  };
  function ic(n) { return '<span class="ic">' + (IC[n] || "") + "</span>"; }

  /* =========================================================================
     I18N — same language set + endonym pattern as assets.gpen.com.

     THE ENGLISH STRING IS THE KEY. t("Start the quiz") looks that exact sentence
     up in the loaded locale and returns the translation, or the English back if
     there is none. That choice is deliberate: with invented keys ("quiz.start")
     every locale file needs a matching key on both sides, and the failure mode is
     a page that renders "quiz.start" to a rep. Here the worst case is English,
     which is always readable, and a locale file is a plain English -> target map
     that a native speaker can review without reading any code.

     TWO FUNCTIONS, because HTML and attributes are not the same context:
       t(str)  for HTML. When a string falls back to English while the page is in
               another language it comes back wrapped in <span lang="en">, which is
               WCAG 3.1.2 (Language of Parts) - a screen reader switches voice for
               that run instead of reading English with Spanish phonetics.
       tx(str) for plain text: aria-labels, title, alt, document.title, toasts.
               Same lookup, never any markup.
     Neither escapes: callers pass literal UI copy, and esc() is applied to DATA.

     ONE locale file is loaded, by index.html, from localStorage BEFORE app.js runs
     (a <script> tag, not fetch, so the portal still works off a file:// copy on a
     laptop with no server). It sets window.GPEN_I18N.
     ====================================================================== */
  var LANGS = { en: "English", es: "Espa\u00f1ol", de: "Deutsch", fr: "Fran\u00e7ais", it: "Italiano", pt: "Portugu\u00eas" };
  var LANG_ORDER = ["en", "es", "de", "fr", "it", "pt"];
  var K_LANG = "gpt.lang";
  var I18N = window.GPEN_I18N && window.GPEN_I18N.strings ? window.GPEN_I18N.strings : null;
  var curLang = (function () {
    var l = null;
    try { l = localStorage.getItem(K_LANG); } catch (e) {}
    // The loaded bundle wins over the stored preference: if the two ever disagree
    // (a locale file missing from the deploy, a stale localStorage) the page has to
    // label itself as the language it is actually showing.
    if (window.GPEN_I18N && window.GPEN_I18N.lang) return window.GPEN_I18N.lang;
    return Object.prototype.hasOwnProperty.call(LANGS, l) ? l : "en";
  })();

  function t(str) {
    if (curLang === "en" || !I18N) return str;
    var hit = I18N[str];
    if (hit) return hit;
    return '<span lang="en">' + str + "</span>";
  }
  function tx(str) {
    if (curLang === "en" || !I18N) return str;
    return I18N[str] || str;
  }
  /* DATA text. Course content is translated by whole field in the locale file, not
     string by string, so t() cannot see it. dt() answers the same question t() does —
     "is this run of text actually in the page's language?" — for a course field:
     if the loaded locale did not override that field, the value is English and gets
     <span lang="en"> so a screen reader switches voice for it (WCAG 3.1.2). Callers
     pass ALREADY-ESCAPED text; dt only adds the wrapper. */
  /* Content that is deliberately English in EVERY locale — the quiz. Same WCAG
     3.1.2 job as dt(), but unconditional, because there is no version of the quiz
     in another language to fall back from. */
  function en(html) {
    if (curLang === "en" || !html) return html;
    return '<span lang="en">' + html + "</span>";
  }
  function dt(slug, field, html) {
    if (curLang === "en" || !html) return html;
    var done = I18N_DONE[slug];
    if (done && done[field] !== undefined) return html;
    return '<span lang="en">' + html + "</span>";
  }

  /* Interpolating form. The placeholders travel INSIDE the translated sentence, so
     a translator can move them: German puts the count late, Spanish early, and a
     concatenated "You have completed " + n + " of " + m would force English order
     on all of them. Values are substituted after lookup, so the key stays stable. */
  function tf(str, vals) {
    var out = t(str);
    Object.keys(vals).forEach(function (k) {
      out = out.split("{" + k + "}").join(String(vals[k]));
    });
    return out;
  }
  function tfx(str, vals) {
    var out = tx(str);
    Object.keys(vals).forEach(function (k) {
      out = out.split("{" + k + "}").join(String(vals[k]));
    });
    return out;
  }

  /* Course content is overridden wholesale rather than string-by-string: the locale
     file carries a `courses` map keyed by slug, and each key it names replaces the
     English one in COURSES before anything renders. Anything it does not name stays
     English - so a partial translation is a valid translation, not a broken page.

     QUIZ ITEMS ARE NEVER OVERRIDDEN, and the merge refuses them explicitly. A quiz
     item is a question, four choices and an integer index into those choices; a
     translator reordering or "improving" a distractor silently makes the keyed
     answer wrong, and a rep fails a quiz they answered correctly. Same reason
     `name`, `msrp` and the media keys are refused: product names, prices, photos
     and discount codes are identical in every language. */
  var I18N_NEVER = { quiz: 1, slug: 1, name: 1, msrp: 1, family: 1, accent: 1, cover: 1, heroImg: 1, videos: 1, gallery: 1, pairsWith: 1, productUrl: 1, faqUrl: 1, passPct: 1,
                     box: 1, pop: 1, perDisplay: 1 };
  // Objects whose keys merge rather than replace wholesale.
  var NESTED = { howToSell: 1, packaging: 1 };
  /* Which fields a locale actually replaced, per slug. dt() below reads this so a
     field the locale did not cover can be marked up as English instead of passing
     silently as Spanish text that happens to be in English. */
  var I18N_DONE = {};
  /* The About page's copy lives in GPEN_ABOUT, not in COURSES, so it gets the same
     treatment through a synthetic slug: a locale can carry an `about` object with any
     subset of those keys, and whatever it does not carry is marked as English by
     dt("__about__", …). No app.js change is needed to translate the About page — add
     the object to the locale file and it takes effect. */
  var I18N_ABOUT = "__about__";
  function applyAboutI18n() {
    var o = window.GPEN_I18N && window.GPEN_I18N.about;
    if (!o || !window.GPEN_ABOUT) return;
    I18N_DONE[I18N_ABOUT] = o;
    Object.keys(o).forEach(function (k) { window.GPEN_ABOUT[k] = o[k]; });
  }
  function applyCourseI18n() {
    var over = window.GPEN_I18N && window.GPEN_I18N.courses;
    if (!over) return;
    COURSES.forEach(function (c) {
      var o = over[c.slug]; if (!o) return;
      I18N_DONE[c.slug] = o;
      Object.keys(o).forEach(function (k) {
        if (I18N_NEVER[k]) return;
        // Nested objects MERGE key by key instead of replacing. A locale that
        // translates only packaging.inBox must not take the image URLs and the
        // per-display count with it, which a plain assignment would.
        if (NESTED[k] && c[k]) {
          Object.keys(o[k]).forEach(function (nk) {
            if (I18N_NEVER[nk]) return;
            c[k][nk] = o[k][nk];
          });
          return;
        }
        c[k] = o[k];
      });
    });
  }
  function langSelHTML() {
    return '<div class="langsel" id="lang-select">' +
      '<button type="button" class="langsel-btn" id="lang-btn" aria-haspopup="true" aria-expanded="false" aria-label="Language: ' + LANGS[curLang] + '">' +
        '<span class="langsel-globe" aria-hidden="true">' + IC.globe + "</span>" +
        '<span class="langsel-code" id="lang-btn-code">' + curLang.toUpperCase() + "</span>" +
        '<span class="langsel-caret" aria-hidden="true">' + IC.caret + "</span>" +
      "</button>" +
      '<div class="langsel-menu" id="lang-menu" role="menu" aria-label="Select language">' +
        LANG_ORDER.map(function (l) {
          var on = l === curLang;
          return '<button type="button" role="menuitemradio" aria-checked="' + (on ? "true" : "false") +
            '" class="langmenu-item' + (on ? " on" : "") + '" data-lang="' + l + '">' +
            '<span class="langmenu-code">' + l.toUpperCase() + "</span>" +
            '<span class="langmenu-name">' + LANGS[l] + "</span>" +
            (on ? '<span class="langmenu-tick">' + ic("check") + "</span>" : "") +
          "</button>";
        }).join("") +
      "</div>" +
    "</div>";
  }
  /* A full reload, not a re-render. Every string on the page goes through t() at
     render time, so switching in place would mean re-rendering the current route
     AND the header AND re-running its bindings — and index.html is what chooses
     which locale file to load, so the new bundle only exists after a fresh boot.
     Writing localStorage and reloading is one line and cannot leave half the page
     in the old language. */
  function setLang(l) {
    if (!Object.prototype.hasOwnProperty.call(LANGS, l)) return;
    if (l === curLang) return;
    try { localStorage.setItem(K_LANG, l); } catch (e) {}
    // Keep the hash: a rep switching language mid-course lands back on the same
    // product, not at the top of the home page.
    location.reload();
  }
  /* Machine translation, stated on every page in the language being read. The
     alternative is a rep trusting a translated product claim as if a person had
     checked it. Only the interface and the product reference are translated: quiz
     questions and the eligibility attestation stay in English on purpose, because a
     mistranslated answer choice fails a rep who answered correctly, and the
     attestation is a legal statement. */
  function i18nNoticeHTML() {
    if (curLang === "en") return "";
    return '<div class="mtnotice" role="note">' + ic("globe") +
      "<span>" + t("Machine translated and pending review. Quiz questions stay in English.") + "</span>" +
    "</div>";
  }
  function bindLangSel() {
    document.addEventListener("click", function (ev) {
      var wrap = $("#lang-select"); if (!wrap) return;
      var btn = ev.target.closest && ev.target.closest("#lang-btn");
      var item = ev.target.closest && ev.target.closest(".langmenu-item");
      if (btn) {
        var open = wrap.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        return;
      }
      if (item) {
        wrap.classList.remove("open");
        $("#lang-btn").setAttribute("aria-expanded", "false");
        setLang(item.getAttribute("data-lang"));
        return;
      }
      if (!ev.target.closest("#lang-select")) {   // click-away closes
        wrap.classList.remove("open");
        var b = $("#lang-btn"); if (b) b.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key !== "Escape") return;
      var wrap = $("#lang-select"); if (!wrap) return;
      wrap.classList.remove("open");
      var b = $("#lang-btn"); if (b) b.setAttribute("aria-expanded", "false");
    });
  }

  /* ---- toast ------------------------------------------------------------- */
  var toastT;
  function toast(msg) {
    var el = $("#toast"); if (!el) { el = document.createElement("div"); el.id = "toast"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite"); document.body.appendChild(el); }
    el.textContent = msg; el.classList.add("show"); clearTimeout(toastT);
    toastT = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }

  /* ---- header ------------------------------------------------------------ */
  /* Which nav item is current. Derived from the hash rather than route()'s
     pageKey because pageKey is assigned AFTER the render call that builds the
     header. Home IS the course list, so "/" and "/course/*" both mark Courses. */
  function navSection() {
    var parts = location.hash.replace(/^#/, "").split("/").filter(Boolean);
    if (parts[0] === "about") return "about";
    if (parts[0] === "certified") return "";       // a leaf page, nothing to mark
    return "courses";
  }
  function header() {
    var e = getEnroll(), here = navSection();
    function nav(key, href, label) {
      var on = key === here;
      return '<a class="hdr-navlink' + (on ? " on" : "") + '" href="' + href + '"' + (on ? ' aria-current="page"' : "") + ">" + label + "</a>";
    }
    /* header() opens <main> and footer() closes it. Every one of the five render
       functions is header() + …content… + footer(), so the landmark wraps the
       page content without touching all five — and the skip link gives keyboard
       users a way past a nav that re-renders on every route. */
    return '<a class="skip" href="#main">' + t("Skip to content") + "</a>" +
      (DRAW_PREVIEW
      ? '<div class="preview-bar">' + ic("spark") + " <b>Preview</b> — sweepstakes shown for review. Not live; no entries are recorded.</div>"
      : "") +
      // has-user tells the CSS the name/store block is competing for header room,
      // so the wordmark can yield before it truncates to "G PEN UNIVER…".
      '<header class="hdr' + (e ? " has-user" : "") + '">' +
      '<a class="hdr-brand" href="#/">' +
        '<img src="assets/img/gpen-g-black.png" class="hdr-logo light" alt="G Pen"/>' +
        '<span class="hdr-name">G Pen <em>University</em></span>' +
      "</a>" +
      // Courses / Binder / About lived only in the footer, below a nine-section
      // course page — effectively unreachable on a phone.
      '<nav class="hdr-nav" aria-label="Main">' +
        nav("courses", "#/", t("Products")) +
        nav("about", "#/about", t("About")) +
      "</nav>" +
      ((CFG.i18n && CFG.i18n.enabled) ? langSelHTML() : "") +
      // Not a link: it pointed at #/, same as the logo and the Courses tab.
      (e ? '<span class="hdr-user"><span class="hdr-u-name">' + esc(e.name) + '</span><span class="hdr-u-store">' + esc(e.store || "") + "</span></span>" : "") +
    "</header>" +
      i18nNoticeHTML() +
    '<main id="main" tabindex="-1">';
  }
  /* The skip link's href="#main" would otherwise be swallowed by the hash router
     \u2014 route() would read "main" as a page and re-render home. Intercept it and
     move focus directly. Delegated because the header re-renders every route. */
  function bindSkipLink() {
    document.addEventListener("click", function (ev) {
      var a = ev.target.closest && ev.target.closest("a.skip");
      if (!a) return;
      ev.preventDefault();
      var m = document.getElementById("main");
      if (m) { m.focus(); m.scrollIntoView({ behavior: "instant", block: "start" }); }
    });
  }
  // The footer "Reset my progress" control lives on every page \u2014 one delegated
  // listener (bound once in boot) so a rep can wipe and re-do the training anytime.
  function bindReset() {
    document.addEventListener("click", function (ev) {
      var btn = ev.target.closest && ev.target.closest("#reset");
      if (!btn) return;
      // Name whose work is about to be destroyed and how much of it — on a shared
      // tablet this button is the only handoff, and there is no undo or export.
      var who = getEnroll() || {}, cn = completedCount();
      if (confirm("This erases " + (who.name ? who.name + "'s" : "all") + " training on this device" +
          (cn ? ": " + cn + " course certificate" + (cn === 1 ? "" : "s") : "") +
          ".\n\nThis cannot be undone. Continue?")) {
        localStorage.removeItem(K_STATE); localStorage.removeItem(K_ENROLL);
        toast(tx("Progress cleared."));
        go("#/");
      }
    });
  }

  /* ======================= THE HOME MASTHEAD ================================
     Two states, and neither of them sells the training: mid-progress names the page
     and gets out of the way, and fully-complete hands over the code and the
     certificate. Nothing here writes to storage, so a first visit still collects
     nothing about anybody. Sentences stay under 20 words and carry no idiom, per
     the ASD-STE100 rules the copy is written to — which is also what makes them
     translate cleanly.
     ====================================================================== */
  /* Masthead only. The progress bar, the facts row, the Start/Resume button, the
     next-tier nudge and the six product pips all lived here and are gone: the pips
     duplicated the product cards immediately below them, the button pointed at the
     first of those same cards, and between them they pushed the actual lineup a
     full phone screen down the page. What is left names the page and gets out of
     the way. Per-product status still shows on each card, and the reward ladder
     still states the tiers, each in exactly one place now. */
  function heroHTML(done, total) {
    if (done >= total) return heroDoneHTML(total);
    var s = getState();
    var started = done > 0 || COURSES.some(function (c) { return s.courses[c.slug]; });
    return '<section class="hero hero-prog reveal">' +
      '<div class="hero-in">' +
        '<span class="hero-eyebrow">' + ic("cap") + " " + esc(CFG.programName || tx("Product training")) + "</span>" +
        '<h1 class="hero-h1">' + (started
            ? t("Continue your product training.")
            : t("Product training for retail staff.")) + "</h1>" +
      "</div>" +
    "</section>";
  }

  /* All products complete: hand over the code and the certificate, state it once. */
  function heroDoneHTML(total) {
    return '<section class="hero hero-done reveal">' +
      '<div class="hero-in">' +
        '<span class="hero-eyebrow">' + ic("award") + " " + tf("Training complete &middot; {total} of {total}", { total: total }) + "</span>" +
        '<h1 class="hero-h1">' + t("All products complete.") + "</h1>" +
        '<p class="hero-sub">' + t("Your discount code is below. Your certificate is on record.") + "</p>" +
        '<button class="code hero-code" id="hero-code" hidden><span>••••••</span><em>' + ic("tag") + " " + t("Copy code") + "</em></button>" +
        '<div class="hero-actions">' +
          '<a class="btn xl ghost" href="#/certified">' + t("View certificate") + " " + ic("arrow") + "</a>" +
        "</div>" +
      "</div>" +
    "</section>";
  }

  /* Mint the code the same way every other reward surface does. Stays hidden until
     a code actually comes back, so a misconfigured issuer shows nothing rather than
     an empty box promising a discount. issueRewardCode() is the only minting point
     (see config.js), so the day it becomes a Shopify Admin API call this follows. */
  function fillHeroCode() {
    var btn = $("#hero-code"); if (!btn) return;
    var e = getEnroll() || {};
    Promise.resolve(window.issueRewardCode("secret", { name: e.name, email: e.email, store: e.store }))
      .then(function (r) {
        if (!r || !r.code) return;
        $("span", btn).textContent = r.code;
        btn.hidden = false;
        btn.addEventListener("click", function () { copyCode(r.code); });
      }, function (err) { if (window.console) console.warn("[gpen-training] hero code could not be issued", err); });
  }

  /* ---- HOME (browse-first hub) ------------------------------------------- */
  function renderHome() {
    var done = completedCount(), total = COURSES.length;

    app.innerHTML = header() +
      heroHTML(done, total) +

      '<section class="hub reveal">' +
        '<div class="sec-h" id="courses"><h2>' + t("Products") + "</h2></div>" +
        '<p class="catalog-lede">' + t("Each product takes about five minutes. Complete them in any order.") + "</p>" +
        lineupHTML() +
      "</section>" +

      // The reward table only. The motivational band that used to sit here ("Get
      // certified. Carry one yourself.") and the mascot sign-off below it were the
      // two least professional blocks on the page and carried no product information.
      rewardsBlock(done) +
      footer();

    fillRewards();
    fillHeroCode();
    $$("[data-goto]").forEach(function (el) { el.addEventListener("click", function () { go("#/course/" + el.getAttribute("data-goto")); }); });
    $$("[data-scroll]").forEach(function (el) { el.addEventListener("click", function () { scrollToId(el.getAttribute("data-scroll")); }); });
    revealOnScroll();
  }

  /* The reward section. Its old headline ("Get certified. Carry one yourself." plus
     "Put a G Pen in your pocket and you're the rec.") was consumer marketing aimed at
     the employee rather than training information, so it is replaced by a plain
     statement of the mechanic. rewardsSection() renders the tiers. */
  function rewardsBlock(done) {
    return '<section class="loop reveal">' +
      '<div class="loop-head">' +
        "<h2>" + t("Discount codes") + "</h2>" +
        '<p class="loop-sub">' + t("Each completed product raises your discount at gpen.com. Codes are for completing training only.") + "</p>" +
      "</div>" +
      rewardsSection(done) +
    "</section>";
  }

  function scrollToId(id) { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }
  function lifestyleImgs() {
    if (window.GPEN_LIFESTYLE && window.GPEN_LIFESTYLE.length) return window.GPEN_LIFESTYLE.slice();
    var out = [];
    COURSES.forEach(function (c) { if (c.heroImg) out.push(c.heroImg); if (c.gallery && c.gallery[0]) out.push(c.gallery[0].url); });
    return out;
  }
  // A lifestyle shot of a specific product (matched by folder in the CDN path).
  function productLifeImg(slug, exclude) {
    // Slug -> asset-portal folder. A slug missing from this map used to fall through
    // to "any other product's photo", so the Grinder course illustrated itself with a
    // vaporizer. Returning "" instead makes lifestyleCinema render nothing, which is
    // the only honest outcome: no photo beats the wrong product's photo.
    var folder = ({
      "dash-ii": "dash-ii/", "dash-plus": "dash-plus/", "grinder": "slim-3-piece-grinder/",
      "melt-hot-knife": "melt/", "hydout": "hydout/", "510-original": "510-original/",
    })[slug] || "";
    if (!folder) return "";
    var all = window.GPEN_LIFESTYLE || [];
    return all.filter(function (u) { return u.indexOf(folder) >= 0 && u !== exclude; })[0] || "";
  }
  /* The three steps, stated plainly and up front. This is the first thing a
     budtender should read — it answers "what is this and how does it work". */

  /* A plain, readable course card — the home page lists COURSES, not cards.
     The trading card is the reward you get for finishing one. */
  /* The home lineup, sectioned by product family (mirrors the internal G Pen
     product portal): Dry Herb, 510 Batteries, Concentrate. Groups with no products
     drop out.

     Bucketing is on `family`, a stable key in data.js, NOT on a regex against
     `category`. It used to be /Dry Herb/i.test(c.category) — and `category` is
     DISPLAY copy, so the moment the Spanish locale rendered it as "Vaporizador de
     hierba seca" the Dry Herb and Concentrate panels matched nothing and four of the
     six products silently disappeared from the home page in every non-English
     language. The 510 panel survived only because "510" is a numeral. Never route
     logic through a translated string. */
  var LINEUP_GROUPS = [
    // Retitled from "Dry Herb Vaporizers" when the Grinder joined it: the panel
    // holds two vapes and an accessory, so the group name has to cover both.
    { key: "dryherb", title: "Dry Herb Accessories", sub: "Vaporizers and accessories for flower", icon: "leaf" },
    { key: "510", title: "510 Batteries", sub: "510-thread cartridge batteries", icon: "battery" },
    { key: "concentrate", title: "Concentrate", sub: "Tools for wax, rosin and other concentrates", icon: "drop" },
  ];
  function lineupHTML() {
    var panels = LINEUP_GROUPS.map(function (g) {
      var items = COURSES.filter(function (c) { return c.family === g.key; });
      if (!items.length) return "";
      // ≤2 products pair up two-across on desktop so a small family doesn't span an empty row.
      var narrow = items.length <= 2 ? " fam-narrow" : "";
      return '<section class="famgroup fam-' + g.key + narrow + '">' +
          '<div class="fam-head">' +
            '<span class="fam-ic" aria-hidden="true">' + ic(g.icon) + "</span>" +
            '<h3 class="fam-name">' + t(g.title) + "</h3>" +
            '<span class="fam-count">' + items.length + "</span>" +
            '<span class="fam-blurb">' + t(g.sub) + "</span>" +
          "</div>" +
          '<div class="fam-body"><div class="course-grid">' + items.map(courseCard).join("") + "</div></div>" +
        "</section>";
    }).join("");
    return '<div class="prodgroups">' + panels + "</div>";
  }
  function courseCard(c) {
    var st = getState(), rec = st.courses[c.slug], done = !!(rec && rec.passed);
    // Uniform card: family (eyebrow), name, what sets it apart, MSRP, cert status.
    return '<a class="cc' + (done ? " done" : "") + '" href="#/course/' + c.slug + '" style="--accent:' + c.accent + '">' +
      '<span class="cc-accent" aria-hidden="true"></span>' +
      '<span class="cc-media"><img src="' + esc(sized(c.cover, 244)) + '" alt="' + esc(c.name) + '" loading="lazy"/></span>' +
      '<span class="cc-body">' +
        "<h3>" + esc(c.name) + "</h3>" +
        '<span class="cc-cat">' + esc(c.category) + "</span>" +
        '<p class="cc-diff">' + esc(c.differentiator || c.tagline) + "</p>" +
        (c.msrp ? '<span class="cc-price">' + esc(c.msrp) + " <em>" + t("MSRP") + "</em></span>" : "") +
        '<span class="cc-foot">' +
          (done ? '<span class="cc-status on">' + ic("check") + " " + tf("Certified {score}%", { score: rec.score }) + "</span>"
                : '<span class="cc-status">' + t("Not yet certified") + "</span>") +
          '<span class="cc-go">' + (done ? t("Review") : t("Open")) + " " + esc(c.name) + " " + ic("arrow") + "</span>" +
        "</span>" +
      "</span>" +
    "</a>";
  }

  /* "Talk to our team" — a warm CS contact band above the footer on every page.
     For reps who want to go deeper on a product, or just say hi. Details live in
     CFG.support so they're editable in config.js. */
  function supportBand() {
    var s = CFG.support || {};
    var phone = s.phone || "";
    var email = s.email || CFG.contactEmail || "";
    var tel = "tel:" + phone.replace(/[^\d+]/g, "");
    return '<section class="cs-band reveal">' +
      '<div class="cs-inner">' +
        '<div class="cs-copy">' +
          '<span class="eyebrow cs-eyebrow">' + t("Questions about a product?") + "</span>" +
          "<h2>" + t("Talk to our team.") + "</h2>" +
          "<p>" + t("Our team knows the hardware. Call or email when a customer is at the counter with a device that will not work, when you need a specification you cannot remember, or when you want the correct answer before you say it out loud.") + "</p>" +
        "</div>" +
        '<div class="cs-actions">' +
          (phone ? '<a class="cs-btn cs-btn-primary" href="' + esc(tel) + '">' + ic("phone") + "<span>" + esc(phone) + "</span></a>" : "") +
          (email ? '<a class="cs-btn cs-btn-ghost" href="mailto:' + esc(email) + '">' + ic("mail") + "<span>" + esc(email) + "</span></a>" : "") +
          (s.hours ? '<p class="cs-hours">' + esc(s.hours) + "</p>" : "") +
        "</div>" +
      "</div>" +
    "</section>";
  }
  function footer() {
    // Once there's any progress or enrollment, always offer a way to wipe it and
    // re-do the training (also lets a shared/kiosk device hand off to the next rep).
    var hasProgress = !!getEnroll() || (getState().courses && Object.keys(getState().courses).length > 0);
    return "</main>" + supportBand() +
      '<footer class="foot"><img src="assets/img/gpen-g-black.png" class="foot-g light" alt=""/><img src="assets/img/gpen-g-white.png" class="foot-g dark" alt=""/>' +
      '<div class="foot-nav"><a href="#/">' + t("Products") + '</a><a href="#/about">' + t("About G Pen") + '</a><a href="' + esc(CFG.shopUrl) + '" target="_blank" rel="noopener">' + t("Shop gpen.com") + "</a></div>" +
      (hasProgress ? '<button class="foot-reset" id="reset" type="button">' + ic("refresh") + " " + t("Reset my progress and start over") + "</button>" : "") +
      "<p>" + esc(CFG.programName) + " · " + tx(CFG.footerNote || "for authorized G Pen retail partners.") +
        " " + t("Program and press:") + " <a href=\"mailto:" + esc(CFG.contactEmail) + "\">" + esc(CFG.contactEmail) + "</a>" +
        (CFG.privacyUrl ? ' · <a href="' + esc(CFG.privacyUrl) + '" target="_blank" rel="noopener">' + t("Privacy") + "</a>" : "") + "</p>" +
      '<p class="foot-motto">A Grenco Science joint · est. 2012 · <em>In Vapore Veritas</em></p>' +
      "</footer>";
  }

  function field(id, label, type, val, ph, ac) {
    return '<label class="field"><span>' + label + "</span>" +
      '<input id="f-' + id + '" type="' + type + '" value="' + esc(val || "") + '" placeholder="' + esc(ph) + '" autocomplete="' + ac + '" /></label>';
  }

  /* The reward ladder, shown as an "earn it" tracker on the home hub. Rungs come
     from LADDER (currently 1 -> 25%, 2 -> 30%, 4 -> 35%, the whole lineup -> 40%); the top
     rung also carries the free-device prize IF drawLive() — see prizeCopy(). */
  function rewardsSection(done) {
    var total = COURSES.length;                 // the full lineup
    var held = tierAt(done), up = nextTier(done);
    var top = LADDER[LADDER.length - 1];
    var head = !held ? t("Pass one course to unlock your first code")
      : (up ? tf("{pct}% off unlocked", { pct: held.pct }) + " — " + (up.pct === top.pct ? t("one more course for the top discount") : t("keep certifying"))
            : t("Full lineup certified. The top discount is unlocked."));
    // Plural as a whole sentence, not "course" + "s": Spanish, German, French and
    // Portuguese all inflect more than the noun, and Italian changes the article.
    function need(n) {
      var d = n - done;
      return d === 1 ? t("1 more course to unlock") : tf("{n} more courses to unlock", { n: d });
    }
    // Every rung but the last renders as a card; the top rung is the capstone.
    // The "N more courses to unlock" hint goes ONLY on the rung they are actually
    // climbing next. On every other rung it restates the requirement already in
    // rw-sub — at 0 done, "Pass any 1 course" and "1 more course to unlock" are the
    // same sentence twice, on all four cards, which is what a first-time rep saw.
    var rungs = LADDER.slice(0, -1).map(function (rung) {
      var got = done >= rung.at, isNext = !!up && up.at === rung.at;
      return rewardCard(rung.key, got, rung.pct + "% OFF",
        rung.at === 1 ? t("Pass any 1 course") : tf("Pass any {n} courses", { n: rung.at }),
        // ...and not at zero done, where "N more to unlock" is word-for-word the
        // requirement above it. The hint only earns its line once it is counting DOWN
        // from something. "Next up" plus the requirement is the whole story at zero.
        (isNext && done > 0) ? need(rung.at) : "",
        got ? t("Unlocked") : (isNext ? t("Next up") : t("Locked")));
    }).join("");
    return '<div class="sec-h"><h2>' + t("What you unlock") + "</h2><span>" + head + "</span></div>" +
      '<p class="rw-terms-head">' + t("Rewards are for completing training. They are not tied to sales, orders, or product recommendations.") + "</p>" +
      '<div class="rewards">' + rungs + "</div>" +
      grandCard(done >= total, done, total);
  }
  // The full-lineup capstone: a free-G-Pen draw entry + the guaranteed 40% code.
  function grandCard(unlocked, done, total) {
    var d = total - done;
    var draw = drawLive();
    // Same rule as the rungs: the countdown only earns its line once this IS the
    // next thing to reach. At 0 done it just repeated "Certify all N" above it.
    var up = nextTier(done), isNext = !!up && up.at === total;
    return '<div class="rw-card grand ' + (unlocked ? "on" : "off") + '">' +
      '<div class="rw-top"><span class="rw-ic">' + ic(unlocked ? "award" : "lock") + "</span>" +
        // Without a live prize there is no "grand prize" to promise — it's the top rung.
        '<span class="rw-status">' + (unlocked ? (draw ? prizeCopy().statusOn : t("Unlocked")) : (draw ? t("Grand prize") : t("Top discount"))) + "</span></div>" +
      '<div class="rw-big">' + (draw ? t("FREE G PEN") + " <em>+ " + topPct() + "%</em>" : topPct() + "% OFF") + "</div>" +
      '<div class="rw-sub">' + tf("Certify all {total}", { total: total }) + " &mdash; " + (draw ? prizeCopy().rule + " " + tf("{pct}% off is yours either way.", { pct: topPct() }) : t("your best code on gpen.com, plus the master certificate.")) + "</div>" +
      (unlocked
        ? '<button class="rw-code" data-rwcode="secret"><span class="rw-code-v">••••••</span><em>' + ic("tag") + " " + t("Tap to copy") + "</em></button>" +
          '<a class="rw-cert" href="#/certified">' + t("View master certificate") + " &rarr;</a>" +
          // grandCard bypasses rewardCard, so it needs its own terms line.
          rwTermsHTML("secret")
        : (isNext ? '<div class="rw-lock">' + ic("spark") + " " + (d === 1 ? t("1 more course to unlock") : tf("{n} more courses to unlock", { n: d })) + "</div>" : "")) +
    "</div>";
  }
  // "Whether it expires / stacks / is single-use" is the first thing a dispensary
  // partner asks — answer it wherever a code is shown, not just in the config.
  function rwTermsHTML(type) {
    var terms = ((CFG.discount || {})[type] || {}).terms;
    return terms ? '<p class="rw-terms">' + t(terms) + "</p>" : "";
  }
  /* Renders the CLIMBING rungs only. Its one caller maps LADDER.slice(0, -1), which
     drops the last rung — the only one keyed "secret" — so the capstone never comes
     through here; grandCard() draws that, with the master-certificate link and the
     gold treatment. The old isSecret branches in this function were therefore
     unreachable in every state. */
  function rewardCard(type, unlocked, big, sub, lockMsg, status) {
    if (unlocked) lockMsg = "";
    return '<div class="rw-card ' + (unlocked ? "on" : "off") + '">' +
      '<div class="rw-top"><span class="rw-ic">' + ic(unlocked ? "tag" : "lock") + '</span><span class="rw-status">' + (status || (unlocked ? t("Unlocked") : t("Locked"))) + "</span></div>" +
      '<div class="rw-big">' + big + "</div>" +
      '<div class="rw-sub">' + sub + "</div>" +
      (unlocked
        ? '<button class="rw-code" data-rwcode="' + type + '"><span class="rw-code-v">••••••</span><em>' + ic("tag") + " " + t("Tap to copy") + "</em></button>" +
          '<a class="rw-shop" href="' + esc(CFG.shopUrl) + '" target="_blank" rel="noopener">' + t("Shop gpen.com") + " " + ic("arrow") + "</a>" +
          rwTermsHTML(type)
        // No hint on a rung they are not climbing yet — the lock icon, the dimmed
        // .off treatment and the "Locked" status already carry it. An empty rw-lock
        // would render as a stray bullet icon with no text.
        : (lockMsg ? '<div class="rw-lock">' + ic("lock") + " " + lockMsg + "</div>" : "")) +
    "</div>";
  }
  function copyText(text, okMsg) {
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { toast(okMsg); }, function () { toast(text); });
    else toast(text);
  }
  function copyCode(code) { copyText(code, tfx("Code copied — {code}", { code: code })); }
  function fillRewards() {
    var e = getEnroll() || {};
    $$("[data-rwcode]").forEach(function (btn) {
      var type = btn.getAttribute("data-rwcode");
      Promise.resolve(window.issueRewardCode(type, { name: e.name, email: e.email, store: e.store })).then(function (r) {
        if (!r || !r.code) return;
        var v = btn.querySelector(".rw-code-v"); if (v) v.textContent = r.code;
        if (r.label) btn.setAttribute("title", r.label);
        btn.addEventListener("click", function () { copyCode(r.code); });
      });
    });
  }

  /* ---- COURSE ------------------------------------------------------------ */
  /* ======================= THE COURSE PAGE ==================================
     Four numbered sections above the fold, then everything else inside a native
     <details> reference block. The old page ran nine numbered sections plus a
     gallery, a full-bleed lifestyle band and a trivia card, which is a long scroll
     for someone standing behind a counter. The learning path is now: the three
     things to remember, how to offer it at checkout, one video, the quiz. Anything
     a rep needs only occasionally — full description, photos, specifications, use,
     cleaning, customer questions — is one tap away and out of the path.

     Native <details> is deliberate: it needs no JavaScript, it is keyboard and
     screen-reader accessible for free, and it is find-in-page friendly in modern
     browsers. bindFaq() and its custom aria bookkeeping are gone with it.
     ====================================================================== */
  function renderCourse(slug) {
    var c = courseBySlug(slug); if (!c) return go("#/");
    var s = getState(), rec = s.courses[c.slug], passed = !!(rec && rec.passed);
    setTitleDoc(c.name + " — Training");

    var hero = c.heroImg || c.cover;
    var descHTML = (Array.isArray(c.description) ? c.description : [c.description]).map(function (p) { return "<p>" + p + "</p>"; }).join("");
    var n = 0;
    function ref(title, body) {
      if (!body) return "";
      return '<details class="ref-item"><summary>' + title + "</summary><div class=\"ref-body\">" + body + "</div></details>";
    }
    app.innerHTML = header() +
      '<section class="course reveal">' +
        '<a class="back" href="#/">' + ic("back") + " " + t("All products") + "</a>" +
        '<div class="cx-hero' + (c.heroImg ? "" : " no-life") + '" style="--accent:' + c.accent + '">' +
          '<div class="cx-hero-media"><img src="' + esc(sized(hero, 760)) + '" alt="' + esc(c.name) + '" loading="eager"/></div>' +
          '<div class="cx-hero-body">' +
            '<span class="ch-eyebrow">' + ic("cap") + " " + t("Product training") + (passed ? ' · <b class="ch-done">' + ic("check") + " " + t("Complete") + "</b>" : "") + "</span>" +
            "<h1>" + esc(c.name) + "</h1>" +
            /* Name, then WHAT IT IS, then WHAT IT COSTS — in that order, at the top of
               the page. The price used to be the tail of a 13px grey chip reading
               "Dry Herb Vaporizer · $49.95 MSRP", which is the least legible place on
               the page for the one number a rep is asked for at a counter. It is now
               the largest thing in the hero after the product name. The plain-language
               line above it exists for the same reason: a rep who has never sold the
               category should not have to infer what the object is from a tagline. */
            (c.whatItIs ? '<p class="cx-what">' + dt(c.slug, "whatItIs", esc(c.whatItIs)) + "</p>" : "") +
            '<div class="cx-pricerow">' +
              (c.msrp ? '<span class="cx-price">' + esc(c.msrp) + '</span><span class="cx-price-l">' + t("MSRP") + "</span>" : "") +
              '<span class="cx-cat">' + esc(c.category) + "</span>" +
            "</div>" +
            '<div class="ch-meta">' + tf("{q} questions · {pct}% to pass · about {min} minutes", { q: c.quiz.length, pct: c.passPct, min: c.minutes }) + "</div>" +
          "</div>" +
        "</div>" +

        // What the rep will physically hold: the retail box, what is inside it, and
        // the POP display it arrives in. Unnumbered and directly under the hero,
        // because recognising the box is the first thing that happens on a shop
        // floor — before any feature, before any script.
        packagingHTML(c) +

        // 1. The facts to hold in your head. Three on most products; the layout takes
        //    any number, so a product that needs six is a data edit, not a code one.
        (c.howToSell && c.howToSell.keyFacts && c.howToSell.keyFacts.length
          ? secHead(++n, t("Key points")) + floorFactsHTML(c) : "") +

        // 2. What the product IS, in the words the storefront uses, plus the feature
        //    list. This was buried in the collapsed reference under "Full
        //    description", which meant a rep could reach the quiz having read three
        //    fragments and a sales script but never a description of the product.
        //    The deep specification table stays collapsed: a rep needs "5 voltage
        //    settings", not "zinc alloy, 3.94 x 0.5 x 0.25 in".
        (descHTML || (c.highlights && c.highlights.length)
          ? secHead(++n, t("About this product")) +
            '<div class="aboutprod">' +
              (descHTML ? '<div class="prose">' + descHTML + "</div>" : "") +
              (c.highlights && c.highlights.length
                ? '<ul class="hl-list">' + c.highlights.map(function (h) { return "<li>" + ic("check") + "<span>" + esc(h) + "</span></li>"; }).join("") + "</ul>"
                : "") +
            "</div>"
          : "") +

        // 3. The counter moment. This is the section the client asked to build the
        //    portal around, so it sits as high as it can while still following the
        //    facts and the description that make it make sense.
        (c.howToSell ? secHead(++n, t("At the counter")) + howToSellHTML(c) : "") +

        // 4. One video. The grid stays for products that have more than one, but the
        //    heading is singular-first because most have one or two.
        (c.videos && c.videos.length
        ? secHead(++n, c.videos.length > 1 ? t("Videos") : t("Video")) +
        '<div class="vid-grid">' + c.videos.map(function (v) {
          return '<button class="vid" data-yt="' + esc(v.youtube || "") + '" data-title="' + esc(v.title) + '">' +
            '<span class="vid-thumb"><img src="' + esc(v.thumb) + '" alt="" loading="lazy"/><span class="vid-play">' + ic("play") + "</span></span>" +
            '<span class="vid-title">' + esc(v.title) + "</span></button>";
        }).join("") + "</div>"
        : "") +

        // 5. The photos, expanded and directly under the videos. They were a collapsed
        //    row inside the reference block, which meant the default state of a product
        //    page showed a rep no picture of the product they are about to be tested on.
        (c.gallery && c.gallery.length
          ? secHead(++n, t("Photos")) + galleryHTML(c) : "") +

        // Reference material, collapsed. Deliberately BEFORE the quiz, not after: it
        //    is the last chance to look something up, and a rep who has just been
        //    told they missed four questions should find the specifications above the
        //    retake button rather than below a certificate they did not earn. It stays
        //    unnumbered — the numbers are the path through the training, and this is
        //    the shelf beside it.
        '<div class="refblock">' +
          '<h2 class="ref-h">' + t("Product reference") + "</h2>" +
          ref(t("Full specifications"), (c.specs && c.specs.length) ? specTableHTML(c.specs, c.slug) : "") +
          ref(t("How to use it"), (c.howToUse && c.howToUse.length) ? stepListHTML(c.howToUse, c.slug, "howToUse") : "") +
          ref(t("How to clean it"), (c.howToClean && c.howToClean.length) ? stepListHTML(c.howToClean, c.slug, "howToClean") : "") +
          ref(t("Common customer questions"), (c.faq && c.faq.length) ? faqHTML(c.faq, c.slug) : "") +
        "</div>" +


        // 6. The quiz, last on the page. Everything above it is what a rep needs to
        //    pass it, so nothing should follow it — including, on a pass, the
        //    certificate and the discount code that render into #quiz-zone.
        secHead(++n, passed ? t("Your certificate") : t("Quiz")) +
        '<div id="quiz-zone"></div>' +
      "</section>" +
      footer();

    bindVideos();
    bindZoom();
    renderQuizIntro(c);
    revealOnScroll();
  }

  function secHead(n, label) { return '<div class="sec-h big"><span class="sec-n">' + n + "</span><h2>" + label + "</h2></div>"; }
  /* The sales battlecard. A rep should be able to scan it in seconds and read
     the "say this" lines out loud verbatim. Fixed block order so muscle memory
     builds: trigger → 3 facts → talk track → which-one close → objections → AOV. */
  /* The facts a rep should be able to say without looking. Any number of them: three
     is the norm, but a product that needs five or six gets five or six by editing
     keyFacts in data.js and nothing else. The count rides along as a class so the grid
     can avoid an orphan on the last row — four items read as 2x2, not as 3+1. */
  function floorFactsHTML(c) {
    var facts = (c.howToSell && c.howToSell.keyFacts) || [];
    if (!facts.length) return "";
    // ff-c<N>, not ff-n<N>: .ff-n is already the number badge inside each card.
    return '<div class="floorfacts ff-c' + facts.length + '">' + facts.map(function (fact, i) {
      return '<div class="ff-card"><span class="ff-n" aria-hidden="true">' + (i + 1) + "</span><p>" + esc(fact) + "</p></div>";
    }).join("") + "</div>";
  }
  /* ONE example, then a disclosure. This section used to render everything at once —
     the trigger, the mistake, the script, two or three counter scenarios, the
     either/or close and three or four objection cards — roughly 350 words a rep had
     to scroll past to reach the quiz. The median retail associate gives training
     about eight minutes a MONTH, so a wall of scripts is a wall they skip.

     Visible now: who to offer it to, why it matters, and the one line to say. That
     is the whole job at a counter. Everything else is real and still here, behind
     one summary that says how much is in there — a rep working a slow Tuesday can
     open it, and a rep between customers is not punished for not.

     Deliberately outside the disclosure: the common mistake. It is the only block
     that exists to stop a rep saying something wrong, including the health-claim
     rule, and a compliance warning nobody opens is not a warning. */
  function howToSellHTML(c) {
    var h = c.howToSell; if (!h) return "";
    var sibs = (h.pairsWith || []).map(function (sl) {
      var sc = courseBySlug(sl);
      return sc ? '<a class="sell-sib" href="#/course/' + sl + '" style="--accent:' + sc.accent + '">' + esc(sc.name) + "</a>" : "";
    }).join("");
    var objs = (h.objections || []).map(function (o) {
      return '<div class="obj-card">' +
        '<div class="obj-says"><em>' + t("They say") + "</em><span>&ldquo;" + esc(o.says) + "&rdquo;</span></div>" +
        '<div class="obj-say"><em>' + t("You say") + "</em><span>" + esc(o.say) + "</span></div>" +
        (o.why ? '<div class="obj-why">' + ic("spark") + "<span>" + esc(o.why) + "</span></div>" : "") +
      "</div>";
    }).join("");
    // Counter scenarios: what you SEE in the basket → what you say.
    var sces = (h.scenarios || []).map(function (sc) {
      return '<div class="scn"><em>' + t("You see") + "</em>" +
        '<span class="scn-sees">' + esc(sc.sees) + "</span>" +
        '<span class="scn-say">&ldquo;' + esc(sc.say) + "&rdquo;</span></div>";
    }).join("");
    // What the summary promises, counted from what is actually in there.
    var extras = (h.scenarios || []).length + (h.objections || []).length + (h.whichClose ? 1 : 0);
    var more = (sces || objs || h.whichClose || h.aov)
      ? '<details class="sell-more">' +
          "<summary>" + ic("caret") +
            "<span>" + tf("More scripts and objections ({n})", { n: extras }) + "</span>" +
          "</summary>" +
          '<div class="sell-more-body">' +
            (sces ? '<div class="sell-scns"><h4>' + t("Counter scenarios") + "</h4>" + sces + "</div>" : "") +
            (h.whichClose ? '<div class="sell-close"><em>' + t("The either/or close") + "</em>&ldquo;" + esc(h.whichClose) + "&rdquo;</div>" : "") +
            (objs ? '<div class="sell-objs"><h4>' + t("When they hesitate") + "</h4>" + objs + "</div>" : "") +
            (h.aov ? '<p class="sell-aov">' + ic("tag") + "<span>" + esc(h.aov) + "</span></p>" : "") +
          "</div>" +
        "</details>"
      : "";
    return '<div class="sell2" style="--accent:' + (c.accent || "var(--gold-bright)") + '">' +
      '<div class="sell-pair">' +
        '<div class="sell-cue">' + ic("tag") + tf("Customer is buying <b>{what}</b>", { what: esc(tx(h.upsellFrom || "").toUpperCase()) }) + "</div>" +
        "<p>" + esc(h.vital) + "</p>" +
        (sibs ? '<div class="sell-sibs"><span>' + t("Pair with") + "</span>" + sibs + "</div>" : "") +
      "</div>" +
      (h.talkTrack && h.talkTrack.say ? '<blockquote class="sell-say"><em>' + t("Say this") + "</em>&ldquo;" + esc(h.talkTrack.say) + "&rdquo;</blockquote>" : "") +
      (h.trap ? '<p class="sell-trap">' + ic("spark") + "<span><b>" + t("Common mistake:") + "</b> " + esc(h.trap) + "</span></p>" : "") +
      more +
    "</div>";
  }
  /* PACKAGING. Two cards: the retail box with its contents, and the POP display it
     ships inside. Both thumbnails open full size, because a rep comparing the box in
     their hand to the box on screen needs to see the artwork, not a 140px crop.

     "What's in the box" earns its place next to the box photo rather than in the
     spec accordion: most of these devices no longer include a charging cable, and a
     customer who gets home without one comes back. The not-included items are styled
     as a distinct, harder line for the same reason — they are the ones that generate
     a return, so they must not read as part of the same list.

     A product with no `packaging` block renders nothing at all. That is the Grinder
     today; when its images are added to the asset portal, the only change needed is
     the data block in data.js. */
  function packagingHTML(c) {
    var p = c.packaging;
    if (!p || (!p.box && !p.pop)) return "";
    function card(img, label, body) {
      return '<div class="pk-card">' +
        '<button class="pk-shot" data-img="' + esc(img) + '" data-caption="' + esc(label) + '" aria-label="' +
          tfx("View {label} full size", { label: label }) + '">' +
          '<img src="' + esc(img) + '" alt="' + esc(label) + '" loading="lazy"/>' +
          '<span class="pk-zoom" aria-hidden="true">' + ic("search") + "</span>" +
        "</button>" +
        '<div class="pk-body"><h4>' + label + "</h4>" + body + "</div>" +
      "</div>";
    }
    // Included and not-included are one list with two states, not two lists: a rep
    // reads it top to bottom once, and the ✗ rows are the ones they must mention.
    var contents = "";
    if ((p.inBox && p.inBox.length) || (p.notIncluded && p.notIncluded.length)) {
      contents = '<ul class="pk-list">' +
        (p.inBox || []).map(function (i) {
          return '<li class="pk-in">' + ic("check") + "<span>" + dt(c.slug, "packaging", esc(i)) + "</span></li>";
        }).join("") +
        (p.notIncluded || []).map(function (i) {
          return '<li class="pk-out">' + ic("close") + "<span>" + dt(c.slug, "packaging", esc(i)) +
            ' <em>' + t("not included") + "</em></span></li>";
        }).join("") +
      "</ul>";
    }
    return '<section class="packaging">' +
      '<h2 class="pk-h">' + t("Packaging") + "</h2>" +
      // A product with no POP display (the Dash+) gets a one-column grid rather than
      // a two-column one with a hole in it, capped at the width the card would have
      // had in the pair so the photo is the same size on every product.
      '<div class="pk-grid' + (p.box && p.pop ? "" : " pk-one") + '">' +
        (p.box ? card(p.box, t("Retail box"), contents) : "") +
        (p.pop ? card(p.pop, t("Retail POP display"),
          '<p>' + (p.perDisplay
            ? tf("Ships in a retail-ready POP display, {n} units per display.", { n: p.perDisplay })
            : t("Ships in a retail-ready POP display.")) + "</p>") : "") +
      "</div>" +
    "</section>";
  }

  /* Full-size image overlay. Same teardown contract as openVideo(): the router calls
     __teardown on route change, so the document-level Escape listener cannot outlive
     the node it belongs to. */
  function openImage(src, caption) {
    var m = document.createElement("div"); m.className = "modal imgmodal";
    m.innerHTML = '<div class="modal-in"><button class="modal-x" aria-label="' + tx("Close") + '">×</button>' +
      '<img class="imgmodal-img" src="' + esc(src) + '" alt="' + esc(caption || "") + '"/>' +
      (caption ? '<div class="modal-t">' + esc(caption) + "</div>" : "") + "</div>";
    document.body.appendChild(m); document.body.classList.add("noscroll");
    var release = manageModalFocus(m, caption || tx("Image"));
    function close() { document.removeEventListener("keydown", onEsc); release(); m.remove(); document.body.classList.remove("noscroll"); }
    function onEsc(ev) { if (ev.key === "Escape") close(); }
    m.__teardown = close;
    m.addEventListener("click", function (ev) { if (ev.target === m || ev.target.closest(".modal-x")) close(); });
    document.addEventListener("keydown", onEsc);
  }
  // Both zoomable surfaces — packaging cards and the photo grid — share one binder.
  function bindZoom() {
    $$(".pk-shot, .ga-shot").forEach(function (b) {
      b.addEventListener("click", function () { openImage(b.getAttribute("data-img"), b.getAttribute("data-caption")); });
    });
  }

  /* Every photo is a button that opens the full-size image, and every photo shows the
     WHOLE product: this grid used to be object-fit:cover inside a 4/3 box (16/9 for
     the first, which spanned the row), so a tall product shot — which is most of
     them — had its top and bottom cut off. A rep looking at a cropped photo of a
     device they have never held cannot tell what it looks like, which is the only
     reason the photos are here. contain in a square box instead, and the featured
     first tile is gone: every shot is equal and every shot is complete. */
  function galleryHTML(c) {
    if (!c.gallery || !c.gallery.length) return "";
    return '<div class="gallery">' + c.gallery.map(function (g) {
      var cap = g.caption || c.name;
      return '<figure class="ga-item">' +
        '<button class="ga-shot" data-img="' + esc(sized(g.url, 1000)) + '" data-caption="' + esc(cap) + '" aria-label="' +
          tfx("View {label} full size", { label: cap }) + '">' +
          '<img src="' + esc(sized(g.url, 320)) + '" alt="' + esc(cap) + '" loading="lazy"/>' +
          '<span class="ga-zoom" aria-hidden="true">' + ic("search") + "</span>" +
        "</button>" +
        (g.caption ? '<figcaption>' + dt(c.slug, "gallery", esc(g.caption)) + "</figcaption>" : "") +
      "</figure>";
    }).join("") + "</div>";
  }
  function specTableHTML(specs, slug) {
    return '<div class="spectable">' + specs.map(function (sp) {
      return '<div class="spec-row"><span class="spec-k">' + dt(slug, "specs", esc(sp.label)) + '</span><span class="spec-v">' + dt(slug, "specs", sp.value) + "</span></div>";
    }).join("") + "</div>";
  }
  function stepListHTML(steps, slug, field) {
    return '<ol class="steps-list">' + steps.map(function (st, i) {
      return '<li><span class="sl-n">' + (i + 1) + "</span><span>" + dt(slug, field, st) + "</span></li>";
    }).join("") + "</ol>";
  }
  /* Native <details>, matching the reference block around it. The previous version
     emitted a <button aria-expanded> plus a max-height:0 panel and depended on
     bindFaq() to toggle both; that binding is gone, so keeping the old markup would
     have left every answer permanently unreachable. Disclosure now costs no JS and
     the aria state is the browser's job. */
  function faqHTML(faq, slug) {
    return '<div class="faq">' + faq.map(function (f) {
      return '<details class="faq-item"><summary class="faq-q"><span>' + dt(slug, "faq", esc(f.q)) + "</span></summary>" +
        '<div class="faq-a"><p>' + dt(slug, "faq", esc(f.a)) + "</p></div></details>";
    }).join("") + "</div>";
  }

  function bindVideos() {
    $$(".vid").forEach(function (b) {
      b.addEventListener("click", function () {
        var yt = b.getAttribute("data-yt"); if (!yt) { toast(tx("Video coming soon.")); return; }
        openVideo(yt, b.getAttribute("data-title"));
      });
    });
  }
  function openVideo(yt, title) {
    var m = document.createElement("div"); m.className = "modal";
    m.innerHTML = '<div class="modal-in"><button class="modal-x" aria-label="' + tx("Close") + '">×</button>' +
      '<div class="modal-frame"><iframe src="https://www.youtube.com/embed/' + esc(yt) + '?autoplay=1&rel=0" title="' + esc(title) + '" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe></div>' +
      '<div class="modal-t">' + esc(title) + "</div></div>";
    document.body.appendChild(m); document.body.classList.add("noscroll");
    var release = manageModalFocus(m, title ? tfx("Video: {title}", { title: title }) : tx("Video"));
    // Unbind on EVERY close path, not just Escape — otherwise each video opened
    // leaves a live keydown listener on document.
    function close() { document.removeEventListener("keydown", onEsc); release(); m.remove(); document.body.classList.remove("noscroll"); }
    function onEsc(ev) { if (ev.key === "Escape") close(); }
    // Router teardown hook — without it clearStrayOverlays() drops the node and leaves
    // this document-level Escape listener bound to a detached modal, once per open.
    m.__teardown = close;
    m.addEventListener("click", function (ev) { if (ev.target === m || ev.target.closest(".modal-x")) close(); });
    document.addEventListener("keydown", onEsc);
  }

  /* ---- QUIZ (stepped, one question at a time) ---------------------------- */
  // The certify section. Browsing the course is free; this is the ONLY place we
  // ask for name/email/store — just-in-time, when someone opts to get certified.
  function renderQuizIntro(c) {
    var rec = getState().courses[c.slug];
    if (rec && rec.passed) return showCertifiedState(c, rec);
    showCertifyForm(c);
  }
  function showCertifiedState(c, rec) {
    var zone = $("#quiz-zone"), e = getEnroll() || {};
    zone.innerHTML =
      '<div class="result pass"><div class="result-score">' + rec.score + "%<span>" + t("certified") + "</span></div>" +
        "<h3>" + ic("check") + " " + tf("You are a certified {product} Specialist", { product: esc(c.name) }) + "</h3>" +
        "<p>" + tf("Certificate earned {date}.", { date: esc(rec.date) }) + " " + t("Your certificate and discount code are below. Retake the quiz at any time to improve your score.") + "</p>" +
        '<button class="btn ghost" id="retake">' + ic("refresh") + " " + t("Retake quiz") + "</button>" +
      "</div>" +
      '<div id="cert-zone"></div><div id="reward-zone" class="reward-wrap"></div>';
    showCertificate(c, rec.name || e.name || "", rec.date, rec.score, rec.certId, $("#cert-zone"));
    // Mint the tier they actually hold, not the first rung (see LADDER).
    revealReward(earnedTierKey(), { courseSlug: c.slug, name: rec.name || e.name, email: e.email, store: e.store, certId: rec.certId }, $("#reward-zone"));
    $("#retake").addEventListener("click", function () { showCertifyForm(c); $("#quiz-zone").scrollIntoView({ behavior: "smooth", block: "start" }); });
  }
  function showCertifyForm(c) {
    var zone = $("#quiz-zone"), e = getEnroll() || {};
    // This is also the RETAKE entry point, where completedCount() cannot rise —
    // so no new rung is reachable and promising a percentage would be false.
    var owned = coursePassed(c.slug);
    var pct = owned ? null : unlockPct(completedCount());
    zone.innerHTML =
      '<div class="certify">' +
        '<div class="certify-badge">' + ic("award") + "</div>" +
        "<h3>" + (owned ? t("Retake the quiz") : (pct ? tf("Get certified and unlock {pct}% off", { pct: pct }) : t("Get certified"))) + "</h3>" +
        '<p class="lead">' + (owned
          ? tf("Retake the {n}-question quiz (score {pct}%+) to refresh your score on your <strong>{product}</strong> certificate. Your discount code is unchanged.", { n: c.quiz.length, pct: c.passPct, product: esc(c.name) })
          : tf("Score {pct}%+ on the {n}-question quiz to earn your <strong>{product}</strong> Product Specialist certificate and a gpen.com discount code. Spell your name the way you want it printed on the certificate.", { pct: c.passPct, n: c.quiz.length, product: esc(c.name) })) + "</p>" +
        '<div class="certify-form">' +
          field("name", t("Your full name"), "text", e.name, tx("Jane Budtender"), "name") +
          field("email", t("Email address"), "email", e.email, "you@store.com", "email") +
          field("store", t("Store name"), "text", e.store, tx("Cloud 9 Smoke Shop"), "organization") +
          // Never pre-checked: the attestation is per person, and on a shared
          // counter tablet an inherited tick would attest for someone else.
          /* NOT translated, in any locale. This is a legal statement a person is
             affirming about themselves, and a machine-translated version of it is
             not the statement counsel reviewed. It stays in English until a
             qualified translation is signed off per market. */
          '<label class="attest"><input type="checkbox" id="f-attest" />' +
            '<span lang="en">I confirm I am 21 or older and currently work as authorized retail staff at a licensed dispensary or smoke shop.</span></label>' +
          '<button class="btn xl full" id="start-quiz">' + t("Start the quiz") + " " + ic("arrow") + "</button>" +
          /* ONE unconditional disclosure, deliberately not branched on whether a
             webhook is configured yet. The old copy reassured reps that data
             "saves to this browser only" until a store "enables" reporting —
             wrong twice over: reporting is a single global setting G Pen
             controls, not a per-store one, and boot()'s backfill is RETROACTIVE,
             so anyone who certified under that reassurance would have had their
             details sent the moment a webhook was pasted, with no re-consent.
             Everyone now agrees to the same thing up front. */
          '<p class="form-fine"><b>' + t("Use your own phone.") + "</b> " + t("Progress and certificates save to this browser, so a shared tablet mixes staff together.") + " " +
            t("Your name, email and store are recorded so G Pen can credit the completion to your shop, and may be sent to G Pen for that purpose.") +
            (CFG.privacyUrl ? ' <a href="' + esc(CFG.privacyUrl) + '" target="_blank" rel="noopener">' + t("Privacy") + "</a>." : "") + "</p>" +
        "</div>" +
      "</div>";
    $("#start-quiz").addEventListener("click", function () {
      var name = $("#f-name").value.trim(), email = $("#f-email").value.trim(), store = $("#f-store").value.trim();
      if (!name) { toast(tx("Enter your name for the certificate.")); $("#f-name").focus(); return; }
      if (!email || email.indexOf("@") < 0) { toast(tx("Enter a valid email address.")); $("#f-email").focus(); return; }
      if (!store) { toast(tx("Enter your store name.")); $("#f-store").focus(); return; }
      if (!$("#f-attest").checked) { toast(tx("Confirm you are 21 or older and authorized retail staff.")); $("#f-attest").focus(); return; }
      var prev = getEnroll();
      /* Shared counter tablet: a second rep would otherwise inherit the first
         rep's passed courses and mint certificates on top of them. The form
         PREFILLS all three fields, so testing the name alone missed the most
         natural case — rep #2 changes only the email and store and leaves the
         prefilled name, and every certificate goes out under rep #1's name.
         Email counts as identity too. Prefill stays: this is also the retake
         path, and the same rep shouldn't retype their details every course. */
      function sameId(a, b) { return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase(); }
      var handover = !!prev && (!sameId(prev.name, name) || !sameId(prev.email, email));
      if (handover) {
        var n = completedCount();
        var who = (prev.name || tx("someone else")) + (sameId(prev.name, name) && prev.email ? " (" + prev.email + ")" : "");
        var lost = n === 0 ? "" : (n === 1 ? tx("1 course certificate") : tfx("{n} course certificates", { n: n }));
        if (!confirm(tfx("This device is signed in as {who}.", { who: who }) + "\n\n" +
            tfx("Continuing as {name} will clear the progress saved on this device{lost}. This cannot be undone.", { name: name, lost: lost ? ", " + tfx("including {lost}", { lost: lost }) : "" }) + "\n\n" +
            tfx("Continue as {name}?", { name: name }))) return;
        localStorage.removeItem(K_STATE);
      }
      setEnroll({ name: name, email: email, store: store, attest21: true, attestedAt: new Date().toISOString(), ts: (!handover && prev && prev.ts) || new Date().toISOString() });
      if (!prev || handover) logEvent("enroll", { name: name, email: email, store: store });
      runQuiz(c);
    });
  }
  function runQuiz(c) {
    var order = shuffle(c.quiz.map(function (_, i) { return i; }));
    var i = 0, answers = [], correctSoFar = 0, zone = $("#quiz-zone");
    step(true);
    zone.scrollIntoView({ behavior: "smooth", block: "start" });

    // `first` skips the re-scroll on question 1 (the line above already framed it).
    // Without this, answering renders the explainer + Next below the fold and the
    // NEXT question renders shorter than the last, leaving the rep scrolled past
    // it — a 13-question quiz became a scroll hunt in both directions on a phone.
    function step(first) {
      var q = c.quiz[order[i]];
      zone.innerHTML = '<div class="quiz">' +
        '<div class="quiz-bar"><div class="quiz-bar-fill" style="width:' + Math.round((i / c.quiz.length) * 100) + '%"></div></div>' +
        '<div class="quiz-count"><span class="qc-num">' + tf("Question {i} of {n}", { i: i + 1, n: c.quiz.length }) + "</span>" +
          '<span class="quiz-score">' + ic("check") + " " + tf("<b>{n}</b> correct", { n: correctSoFar }) + "</span></div>" +
        '<div class="quiz-q">' + en(esc(q.q)) + "</div>" +
        // Choices render in a shuffled order, but data-ci keeps each choice's
        // ORIGINAL index so the answer check (ci === q.answer) is unaffected.
        '<div class="quiz-choices">' + shuffle(q.choices.map(function (_, ci) { return ci; })).map(function (ci, pos) {
          return '<button class="choice" data-ci="' + ci + '"><span class="ch-key">' + String.fromCharCode(65 + pos) + "</span><span>" + en(esc(q.choices[ci])) + "</span></button>";
        }).join("") + "</div>" +
        '<div class="quiz-why" hidden></div>' +
        '<button class="btn xl next" id="q-next" hidden></button>' +
      "</div>";
      $$(".choice", zone).forEach(function (b) { b.addEventListener("click", function () { choose(parseInt(b.getAttribute("data-ci"), 10), q); }); });
      // "instant", not "auto": auto defers to CSS, and html{scroll-behavior:smooth}
      // would animate the jump to each new question — a long, sluggish glide on a
      // tall desktop page. Advancing a question should snap; only the explainer
      // reveal in choose() is worth animating.
      if (!first) zone.scrollIntoView({ behavior: "instant", block: "start" });
    }
    function choose(ci, q) {
      if (answers[i] != null) return;
      answers[i] = ci;
      var correct = ci === q.answer;
      if (correct) correctSoFar += 1;
      $$(".choice", zone).forEach(function (b) {
        var bci = parseInt(b.getAttribute("data-ci"), 10);
        b.disabled = true;
        // Right/wrong was carried by colour alone. Label it for anyone who can't
        // use colour, and for screen readers reading back the options.
        if (bci === q.answer) { b.classList.add("correct"); b.setAttribute("aria-label", b.textContent.trim() + " — " + tx("correct answer")); }
        else if (bci === ci) { b.classList.add("wrong"); b.setAttribute("aria-label", b.textContent.trim() + " — " + tx("your answer, incorrect")); }
      });
      var why = $(".quiz-why", zone); why.hidden = false;
      why.className = "quiz-why " + (correct ? "ok" : "no");
      // announced. role=status makes the explainer speak, and the fixed word in
      why.setAttribute("role", "status");
      why.setAttribute("aria-live", "polite");
      // Verdict then reason. The verdict is a fixed word, never a randomised line, so
      // a screen reader hears the same thing every time.
      why.innerHTML =
        '<span class="qw-text"><b class="qw-verdict">' + (correct ? t("Correct.") : t("Incorrect.")) + "</b> " +
        en(esc(q.why)) + "</span>";
      var n = $("#q-next", zone); n.hidden = false;
      n.innerHTML = (i + 1 < c.quiz.length ? t("Next question") + " " + ic("arrow") : t("See my results") + " " + ic("arrow"));
      // The explainer is the best teaching moment in the quiz and it renders
      // below the fold on a phone. block:"end" (plus scroll-margin-bottom) lands
      // the Next button fully on screen with the explainer above it — "nearest"
      // left the button clipped by a few pixels at the viewport edge.
      n.scrollIntoView({ behavior: "smooth", block: "end" });
      n.onclick = function () { i++; if (i < c.quiz.length) step(); else finish(); };
    }
    function finish() {
      // answers[] is indexed by STEP position; order[pos] is the question shown
      // there, so map through `order` (not data order) to score.
      var correct = 0; order.forEach(function (qi, pos) { if (answers[pos] === c.quiz[qi].answer) correct++; });
      var pct = Math.round((correct / c.quiz.length) * 100), passed = pct >= c.passPct;
      logEvent("quiz", { course: c.slug, score: pct, passed: passed });
      if (!passed) return quizFail(c, correct, pct, order, answers);
      quizPass(c, correct, pct, order, answers);
    }
  }
  function quizFail(c, correct, pct, order, answers) {
    var zone = $("#quiz-zone");
    // Record the attempt so home can offer to pick it back up — the progress hero
    // looks for a started-but-unpassed course, and before this nothing ever wrote
    // one, so the returning-rep affordance never appeared. completedCount() gates on
    // .passed, so this never counts as a certification —
    // and the guard makes sure a failed RETAKE can't wipe an earned certificate.
    var fs = getState();
    if (!fs.courses[c.slug] || !fs.courses[c.slug].passed) {
      fs.courses[c.slug] = { passed: false, attempted: new Date().toISOString(), score: pct };
      setState(fs);
    }
    var needCorrect = Math.ceil((c.passPct / 100) * c.quiz.length);
    var away = Math.max(1, needCorrect - correct);
    zone.innerHTML = '<div class="result fail" tabindex="-1" role="status" aria-live="polite">' +
      '<div class="result-score">' + pct + "%<span>" + tf("{correct} of {n} correct", { correct: correct, n: c.quiz.length }) + "</span></div>" +
      "<h3>" + t("Not passed") + "</h3><p>" +
        (away === 1
          ? tf("You needed {pct}% to pass and were 1 question short.", { pct: c.passPct })
          : tf("You needed {pct}% to pass and were {away} questions short.", { pct: c.passPct, away: away })) +
        " " + t("Review the answers below, then try again.") + "</p>" +
      '<button class="btn xl" id="retry">' + ic("refresh") + " " + t("Retake the quiz") + "</button>" +
    "</div>" +
    missedReviewHTML(c, order, answers);
    $("#retry").addEventListener("click", function () { runQuiz(c); });
    zone.scrollIntoView({ behavior: "smooth", block: "start" });
    // Scrolling is not a cue a screen reader receives. quizPass/quizFail replace
    // the whole zone with the verdict, score, certificate and reward code, so move
    // focus into it: without this the only announcement was silence.
    focusResult(zone);
  }
  /* Put focus on the verdict after a quiz ends. The result block replaces the whole
     quiz zone, and the only previous cue was zone.scrollIntoView — which a screen
     reader user never perceives, so they pressed for results and heard nothing: not
     the pass/fail, not the score, not that a code had been issued. Focusing the block
     announces it and also puts the keyboard caret at the reward instead of leaving it
     on a button that no longer exists. */
  function focusResult(zone) {
    var r = zone && $(".result", zone);
    if (r && r.focus) setTimeout(function () { r.focus(); }, 0);
  }
  function quizPass(c, correct, pct, order, answers) {
    // `|| {}` matters here more than anywhere: this was the ONE call site of ~18 that
    // dereferenced getEnroll() bare. setEnroll() deliberately swallows write failures,
    // so wherever localStorage.setItem throws (Safari "Block all cookies", a
    // partitioned webview, a full quota) the enrollment never persists and this read
    // returns null — and every OTHER read guards, so the app boots and plays the quiz
    // normally and then threw right here, on a PASS, before setState and before the
    // webhook. The rep answered everything and got no results screen, no certificate
    // and no code, with the page frozen on the last explainer. quizFail never touches
    // enrollment, so failing worked and passing was the thing that broke.
    var e = getEnroll() || {};
    var date = niceDate(), cid = certId((e.name || "") + "|" + c.name + "|" + date);
    var s = getState();
    var prev = s.courses[c.slug];
    var firstTime = !(prev && prev.passed);
    // Keep the higher score AND its certificate — a lower retake never downgrades
    // a rep who already certified (the certified screen invites retakes).
    var improved = !prev || !prev.passed || pct > (prev.score || 0);
    var rec = improved ? { passed: true, score: pct, certId: cid, date: date, name: e.name || "" } : prev;
    s.courses[c.slug] = rec;
    setState(s);
    // Courses first, so a late webhook receives them ahead of the tier rows they justify.
    reportCourses();
    maybeReportTier();   // 30% at 2 certified courses, 35% at 4
    reportMaster();      // record the full-lineup event here, not on a page they may never open
    logEvent("certified", { course: c.slug, certId: cid, score: pct });

    var master = isMasterEarned();
    var progNote = firstTime ? ""
      : (improved ? " " + t("This is your best score so far.")
                  : " " + tf("Your best score of {score}% remains on your certificate.", { score: rec.score }));
    var next = firstTime && !master ? nextCourse(c.slug) : null;
    var zone = $("#quiz-zone");
    zone.innerHTML = '<div class="result pass" tabindex="-1" role="status" aria-live="polite">' +
        '<div class="result-score">' + pct + "%<span>" + tf("{correct} of {n} correct", { correct: correct, n: c.quiz.length }) + "</span></div>" +
        "<h3>" + ic("check") + " " + t("Passed") + "</h3>" +
        "<p>" + tf("You are certified on the <strong>{product}</strong>.", { product: esc(c.name) }) + progNote + "</p>" +
      "</div>" +
      '<div id="cert-zone"></div>' +
      '<div id="reward-zone" class="reward-wrap"></div>' +
      missedReviewHTML(c, order, answers) +
      // The prose is wrapped in ONE span on purpose. .master-unlock is display:flex,
      // so without it every text run and every <strong> became its own flex item on a
      // single un-wrapped line — the banner for the biggest moment in the app rendered
      // as a row of squeezed one-word columns. Three items now: icon, text, arrow.
      (master ? '<a class="master-unlock" href="#/certified">' + ic("award") +
                  '<span class="mu-txt">' + tf("All products complete. Open your certificate and your <strong>{pct}% discount code</strong>.", { pct: topPct() }) + "</span>" + ic("arrow") + "</a>"
              : next ? '<a class="btn xl nextup-cta" href="#/course/' + next.slug + '">' + tf("Next product: {product}", { product: esc(next.name) }) + " " + ic("arrow") + "</a>" +
                       '<a class="linklike backdash" href="#/">' + t("Back to all products") + "</a>"
              : '<a class="btn ghost xl backdash" href="#/">' + t("Back to all products") + " " + ic("arrow") + "</a>");
    showCertificate(c, e.name, rec.date, rec.score, rec.certId, $("#cert-zone"));
    // State is already saved above, so completedCount() includes this pass —
    // mint the tier they now hold (5/5 must issue 40%, not the 25% first rung).
    revealReward(earnedTierKey(), { courseSlug: c.slug, name: e.name, email: e.email, store: e.store, certId: cid }, $("#reward-zone"));
    zone.scrollIntoView({ behavior: "smooth", block: "start" });
    // Scrolling is not a cue a screen reader receives. quizPass/quizFail replace
    // the whole zone with the verdict, score, certificate and reward code, so move
    // focus into it: without this the only announcement was silence.
    focusResult(zone);
  }

  /* ---- REWARD (isolated issuance) --------------------------------------- */
  function revealReward(type, ctx, box) {
    // new Promise (not Promise.resolve) so a SYNCHRONOUS throw inside
    // issueRewardCode lands in the chain instead of propagating out and aborting
    // the rest of the pass screen. Quiet on screen, loud in the console — a rep
    // who just passed should never see an error, but whoever edits config.js
    // is looking at the console.
    new Promise(function (res) { res(window.issueRewardCode(type, ctx)); }).then(function (r) {
      if (!r || !r.code) {
        if (window.console) console.warn("[gpen-training] no reward code returned for tier '" + type + "' — check TRAINING_CONFIG.discount");
        return;
      }
      box.innerHTML = '<div class="reward">' +
        '<div class="reward-ic">' + ic("tag") + "</div>" +
        // Name the rung so climbing a tier reads as an event, not a repeat.
        '<div class="reward-eyebrow">' + (type === "secret" ? t("Top discount unlocked. Full lineup certified.") : (type === "course" ? t("Reward unlocked") : t("New tier unlocked"))) + "</div>" +
        "<h3>" + t(r.label) + "</h3>" +
        '<button class="code" id="code-copy" title="' + tx("Copy code") + '"><span>' + esc(r.code) + "</span><em>" + t("Tap to copy") + "</em></button>" +
        "<p>" + (r.note ? t(r.note) : "") + "</p>" +
        '<a class="btn xl" href="' + esc(CFG.shopUrl) + '" target="_blank" rel="noopener">' + t("Shop gpen.com") + " " + ic("arrow") + "</a>" +
        '<p class="reward-terms">' + (r.terms ? esc(r.terms) + " " : "") + t("Earned by completing training. Not tied to sales, orders, or product recommendations.") + "</p>" +
      "</div>";
      // Was an inline re-implementation of copyText() that had already drifted from it:
      // it skipped sfx.play("copy") and toasted "Code copied!" instead of naming the
      // code, so the same action behaved differently depending on which surface it
      // was triggered from.
      $("#code-copy").addEventListener("click", function () {
        copyCode(r.code);
      });
    }).catch(function (err) {
      if (window.console) console.warn("[gpen-training] revealReward failed for tier '" + type + "'", err);
    });
  }

  /* ---- CERTIFICATE ------------------------------------------------------- */
  function certId(seed) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    var b = h.toString(36).toUpperCase(); while (b.length < 6) b = "0" + b;
    return "GP-" + b.slice(0, 3) + "-" + b.slice(3, 6);
  }
  function sealHTML(pct, label) {
    return '<div class="cert-seal" aria-hidden="true"><svg viewBox="0 0 132 132">' +
      '<defs><path id="seal-arc-' + pct + '" d="M66 66 m-49 0 a49 49 0 1 1 98 0"/></defs>' +
      '<circle class="cs-ring" cx="66" cy="66" r="62"/><circle class="cs-ring cs-ring2" cx="66" cy="66" r="50"/>' +
      '<text class="cs-arc"><textPath href="#seal-arc-' + pct + '" startOffset="50%">CERTIFIED · ' + esc(label) + "</textPath></text>" +
      '<text class="cs-star" x="66" y="46">★</text><text class="cs-score" x="66" y="76">' + (pct ? pct + "%" : "★") + "</text>" +
      '<text class="cs-sub" x="66" y="94">G PEN</text></svg></div>';
  }
  /* "Print certificate" used to spool the entire page: the old @media print rule
     hid four classes that no longer exist and none of the live ones, so the
     certificate came out buried in hero photos, spec tables and battlecards with
     the sticky CTA stamped on every sheet. Clone just the cert into a print sheet
     (the action buttons are a sibling, so they are excluded for free) and let the
     print stylesheet hide everything else. */
  var printT;   // pending print-sheet cleanup, so a second print can cancel it
  function printCert() {
    var card = $("#cert-card");
    if (!card) return;   // never bare-print: that promises a cert and prints a page
    var old = document.getElementById("print-sheet");
    if (old) old.remove();
    var sheet = document.createElement("div");
    sheet.id = "print-sheet";
    var clone = card.cloneNode(true);
    clone.removeAttribute("id");    // don't duplicate #cert-card in the DOM
    // ...and don't duplicate any id INSIDE it either. The seal's <defs> arc is
    // referenced by <textPath href="#…">, and a duplicated id resolves to the
    // FIRST match in document order — the original, which body.printing has just
    // hidden — so the ring text can drop out of the printed sheet.
    var seq = 0;
    Array.prototype.forEach.call(clone.querySelectorAll("[id]"), function (n) {
      var was = n.id, now = "pr" + (++seq) + "-" + was;
      n.id = now;
      Array.prototype.forEach.call(clone.querySelectorAll('[href="#' + was + '"]'), function (ref) {
        ref.setAttribute("href", "#" + now);
        if (ref.hasAttribute("xlink:href")) ref.setAttribute("xlink:href", "#" + now);
      });
    });
    sheet.appendChild(clone);
    document.body.appendChild(sheet);
    // The print blackout is gated on this class, NOT on the sheet existing —
    // otherwise Cmd/Ctrl+P (or Print to PDF) at any other moment hides every
    // child of <body> and prints an empty page.
    document.body.classList.add("printing");
    function cleanup() {
      var s = document.getElementById("print-sheet");
      if (s) s.remove();
      document.body.classList.remove("printing");
      window.removeEventListener("afterprint", cleanup);
      clearTimeout(printT);
    }
    window.addEventListener("afterprint", cleanup);
    window.print();
    // Belt and braces where afterprint never fires. Cancelled in cleanup() so a
    // second print inside the window can't tear down the new sheet mid-print.
    clearTimeout(printT);
    printT = setTimeout(cleanup, 1500);
  }
  function showCertificate(c, nm, date, pct, cid, box) {
    var product = "G Pen " + c.name;
    box.innerHTML =
      '<div class="cert" id="cert-card">' +
        '<div class="cert-inner">' +
          '<div class="cert-logo"><img src="assets/img/gpen-g-black.png" alt="G Pen"/></div>' +
          '<div class="cert-eyebrow">G Pen · ' + t("Product Specialist Program") + "</div>" +
          '<h3 class="cert-award">' + t("Certificate of Completion") + "</h3>" +
          '<div class="cert-presented">' + t("This certifies that") + "</div>" +
          '<div class="cert-name">' + esc(nm) + "</div>" +
          '<div class="cert-desc">' + t("has completed the Product Specialist training and demonstrated expert product knowledge of the") + "</div>" +
          '<div class="cert-product">' + esc(product) + "</div>" +
          sealHTML(pct, tx("PRODUCT SPECIALIST")) +
          '<div class="cert-foot">' +
            '<div class="cert-fcol"><span class="cert-fv">' + esc(date) + '</span><span class="cert-fl">' + t("Date Issued") + "</span></div>" +
            '<div class="cert-fcol"><span class="cert-fv cert-sig">Grenco Science</span><span class="cert-fl">' + t("Authorized By") + "</span></div>" +
            '<div class="cert-fcol"><span class="cert-fv">' + esc(cid) + '</span><span class="cert-fl">' + t("Certificate ID") + "</span></div>" +
          "</div>" +
        "</div>" +
      "</div>" +
      '<div class="cert-actions">' +
        '<button class="btn" id="cert-print">' + ic("print") + " " + t("Print certificate") + "</button>" +
        '<button class="btn ghost" id="cert-dl">' + ic("dl") + " " + t("Download image") + "</button>" +
        '<button class="btn gold" id="cert-ig">' + ic("share") + " " + t("Save story image") + "</button>" +
        '<button class="btn ghost" id="cert-mail">' + ic("mail") + " " + t("Email it") + "</button>" +
      "</div>";
    $("#cert-print").addEventListener("click", printCert);
    $("#cert-dl").addEventListener("click", function () { downloadCertificate(product, nm, date, pct, cid, "PRODUCT SPECIALIST"); });
    $("#cert-mail").addEventListener("click", function () {
      var e = getEnroll() || {};
      var body = "I completed the " + product + " Product Specialist training.\n\nName: " + nm + "\nStore: " + (e.store || "") + "\nEmail: " + (e.email || "") + "\nProduct: " + product + "\nScore: " + pct + "%\nDate: " + date + "\nCertificate ID: " + cid;
      window.location.href = "mailto:" + CFG.contactEmail + "?subject=" + encodeURIComponent(product + " — Product Specialist Certification") + "&body=" + encodeURIComponent(body);
    });
  }
  // Canvas → PNG download (light print-style certificate).
  var CERT_LOGO = new Image(); CERT_LOGO.src = "assets/img/gpen-g-black.png";
  function downloadCertificate(product, nm, date, pct, cid, seal) {
    var W = 1650, H = 1170, c = document.createElement("canvas"); c.width = W; c.height = H;
    var x = c.getContext("2d");
    var GOLD = "#B8892E", INK = "#15150F", CREAM = "#FBF9F2", MUTE = "#6E6E62", cx = W / 2;
    function ls(v) { try { x.letterSpacing = v; } catch (e) {} }
    x.fillStyle = CREAM; x.fillRect(0, 0, W, H);
    x.strokeStyle = INK; x.lineWidth = 6; x.strokeRect(46, 46, W - 92, H - 92);
    x.strokeStyle = GOLD; x.lineWidth = 2; x.strokeRect(64, 64, W - 128, H - 128);
    x.textAlign = "center"; x.textBaseline = "alphabetic";
    if (CERT_LOGO.complete && CERT_LOGO.naturalWidth) {
      var lw = 132, lh = Math.round(lw * (CERT_LOGO.naturalHeight / CERT_LOGO.naturalWidth));
      x.drawImage(CERT_LOGO, cx - lw / 2, 96, lw, lh);
    }
    ls("4px"); x.fillStyle = GOLD; x.font = "700 22px Archivo, Arial, sans-serif";
    x.fillText("G PEN · PRODUCT SPECIALIST PROGRAM", cx, 322); ls("0px");
    x.fillStyle = INK; x.font = "800 46px Archivo, Arial, sans-serif"; x.fillText("Certificate of Completion", cx, 388);
    x.fillStyle = MUTE; x.font = "400 24px Archivo, Arial, sans-serif"; x.fillText("This certifies that", cx, 462);
    x.fillStyle = INK; x.font = "800 78px Archivo, Arial, sans-serif"; x.fillText(nm, cx, 552);
    x.fillStyle = GOLD; x.fillRect(cx - 150, 582, 300, 3);
    x.fillStyle = MUTE; x.font = "400 23px Archivo, Arial, sans-serif";
    x.fillText("has successfully completed the Product Specialist training", cx, 648);
    x.fillText("and demonstrated expert product knowledge of the", cx, 682);
    x.fillStyle = INK; x.font = "800 46px Archivo, Arial, sans-serif"; x.fillText(product, cx, 748);
    var scy = 872, r = 70;
    x.strokeStyle = GOLD; x.lineWidth = 3; x.beginPath(); x.arc(cx, scy, r, 0, 7); x.stroke();
    x.lineWidth = 1.5; x.beginPath(); x.arc(cx, scy, r - 10, 0, 7); x.stroke();
    x.fillStyle = GOLD; x.font = "700 26px Archivo, Arial, sans-serif"; x.fillText("★", cx, scy - 16);
    x.fillStyle = INK; x.font = "800 34px Archivo, Arial, sans-serif"; x.fillText(pct ? pct + "%" : "★", cx, scy + 12);
    ls("2px"); x.fillStyle = GOLD; x.font = "700 12px Archivo, Arial, sans-serif"; x.fillText("G PEN", cx, scy + 38); ls("0px");
    var fy = 1035, cols = [[date, "DATE ISSUED"], ["Grenco Science", "AUTHORIZED BY"], [cid || "", "CERTIFICATE ID"]], xs = [cx - 400, cx, cx + 400];
    cols.forEach(function (col, i) {
      x.strokeStyle = GOLD; x.lineWidth = 1; x.beginPath(); x.moveTo(xs[i] - 120, fy - 34); x.lineTo(xs[i] + 120, fy - 34); x.stroke();
      x.fillStyle = INK; x.font = "700 24px Archivo, Arial, sans-serif"; x.fillText(col[0], xs[i], fy);
      ls("2px"); x.fillStyle = MUTE; x.font = "600 13px Archivo, Arial, sans-serif"; x.fillText(col[1], xs[i], fy + 28); ls("0px");
    });
    var fname = product.replace(/[^\w.-]+/g, "_") + "_Certificate.png";
    if (c.toBlob) c.toBlob(function (b) { var u = URL.createObjectURL(b); dl(u, fname); setTimeout(function () { URL.revokeObjectURL(u); }, 8000); }, "image/png");
    else dl(c.toDataURL("image/png"), fname);
  }
  function dl(href, name) { var a = document.createElement("a"); a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }

  // ---- Shareable IG story / reel image (1080×1920) --------------------------
  var CERT_LOGO_W = new Image(); CERT_LOGO_W.crossOrigin = "anonymous"; CERT_LOGO_W.src = "assets/img/gpen-g-white.png";

  /* The finish-line moment. Copy comes from prizeCopy() so it always matches the
     configured mechanic; the completion is logged via the webhook, which is also
     what counts positions and picks winners (see REPORTING.md). */
  function sweepsPanelHTML(e) {
    var p = prizeCopy();
    return '<div class="sweeps reveal">' +
      // The eyebrow used to append statusOn ("you're in line"), which the headline
      // right beneath it already says word for word; the body then opened by
      // restating the eyebrow. Three announcements of one fact. Eyebrow states the
      // achievement, headline delivers the prize news, body explains the mechanic.
      '<span class="sw-eyebrow">' + ic("spark") + " " + t("Full lineup certified") + "</span>" +
      '<h2 class="sw-h">' + p.headline + "</h2>" +
      '<p class="sw-body">' + p.rule + " " + t("We will email you if you are selected.") + " " + tf("Your <b>{pct}% off</b> code is available now, on every product in the lineup.", { pct: topPct() }) + "</p>" +
      '<div class="sw-actions">' +
        '<button class="btn xl sw-copy">' + ic("tag") + " " + tf("Copy your {pct}% code", { pct: topPct() }) + "</button>" +
        '<a class="btn xl ghost" href="' + esc(CFG.shopUrl) + '" target="_blank" rel="noopener">' + t("Shop gpen.com") + " " + ic("arrow") + "</a>" +
      "</div>" +
      // No rulesUrl fallback: the draft rules page is deliberately not deployed.
      '<p class="sw-fine">' + esc(prizeCopy().fine) + (CFG.sweepstakes && CFG.sweepstakes.rulesUrl ? " <a href=\"" + esc(CFG.sweepstakes.rulesUrl) + '" target="_blank" rel="noopener">Official Rules</a>.' : "") + "</p>" +
    "</div>";
  }

  /* ---- CERTIFIED (master) ------------------------------------------------ */
  function renderCertified() {
    if (!isMasterEarned()) return go("#/");
    var e = getEnroll() || { name: "", store: "", email: "" };
    // Display only — reportMaster() stamps + reports (idempotent) and quizPass
    // already called it, so arriving here late never double-reports.
    var m = reportMaster() || {};
    var cid = m.certId, date = m.date;

    app.innerHTML = header() +
      '<section class="course reveal">' +
        '<a class="back" href="#/">' + ic("back") + " " + t("All products") + "</a>" +
        '<div class="master-hero">' + ic("award") +
          "<h1>" + t("Full lineup certified") + "</h1>" +
          "<p>" + tf("{name}, you have completed every course in {program}. You are now a <strong>fully trained G Pen Product Specialist</strong>.", { name: esc(e.name.split(" ")[0]), program: esc(CFG.programName) }) + "</p>" +
        "</div>" +
        (drawLive() ? sweepsPanelHTML(e) : "") +
        '<div id="mcert"></div>' +
        '<div id="mreward" class="reward-wrap"></div>' +
      "</section>" + footer();

    // master certificate (no % — it's a program completion)
    var box = $("#mcert"), product = "Full Lineup";
    box.innerHTML =
      '<div class="cert master" id="cert-card"><div class="cert-inner">' +
        '<div class="cert-logo"><img src="assets/img/gpen-g-black.png" alt="G Pen"/></div>' +
        '<div class="cert-eyebrow">G Pen · ' + esc(CFG.programName) + "</div>" +
        '<h3 class="cert-award">' + t("Full Lineup Certified") + "</h3>" +
        '<div class="cert-presented">' + t("This certifies that") + "</div>" +
        '<div class="cert-name">' + esc(e.name) + "</div>" +
        '<div class="cert-desc">' + t("has completed every Product Specialist course and is recognized as a") + "</div>" +
        '<div class="cert-product">' + t("Fully Trained G Pen Product Specialist") + "</div>" +
        sealHTML(0, tx("PRODUCT SPECIALIST")) +
        '<div class="cert-foot">' +
          '<div class="cert-fcol"><span class="cert-fv">' + esc(date) + '</span><span class="cert-fl">' + t("Date Issued") + "</span></div>" +
          '<div class="cert-fcol"><span class="cert-fv cert-sig">Grenco Science</span><span class="cert-fl">' + t("Authorized By") + "</span></div>" +
          '<div class="cert-fcol"><span class="cert-fv">' + esc(cid) + '</span><span class="cert-fl">' + t("Certificate ID") + "</span></div>" +
        "</div>" +
      "</div></div>" +
      '<div class="cert-actions">' +
        '<button class="btn" id="cert-print">' + ic("print") + " " + t("Print certificate") + "</button>" +
        '<button class="btn ghost" id="cert-dl">' + ic("dl") + " " + t("Download image") + "</button>" +
        '<button class="btn gold" id="cert-ig">' + ic("share") + " " + t("Save story image") + "</button>" +
        '<button class="btn ghost" id="cert-mail">' + ic("mail") + " " + t("Email it") + "</button>" +
      "</div>";
    $("#cert-print").addEventListener("click", printCert);
    $("#cert-dl").addEventListener("click", function () { downloadCertificate("G Pen Product Specialist", e.name, date, 0, cid, "FULL LINEUP"); });
    $("#cert-mail").addEventListener("click", function () {
      var body = "I have completed the full G Pen Product Specialist training.\n\nName: " + e.name + "\nStore: " + (e.store || "") + "\nEmail: " + (e.email || "") + "\nDate: " + date + "\nCertificate ID: " + cid;
      window.location.href = "mailto:" + CFG.contactEmail + "?subject=" + encodeURIComponent("G Pen Product Specialist — full lineup certified") + "&body=" + encodeURIComponent(body);
    });
    // The full-lineup code is the 40% (CERTIFIEDG40), not the 4-course 35% — reconcile it here.
    revealReward("secret", { name: e.name, email: e.email, store: e.store, certId: cid }, $("#mreward"));
    var swc = $(".sw-copy");
    if (swc) swc.addEventListener("click", function () {
      Promise.resolve(window.issueRewardCode("secret", { name: e.name, email: e.email, store: e.store })).then(function (r) { if (r && r.code) copyCode(r.code); });
    });
    // Celebrate the achievement, not the page view. This fired on every visit and
    // every Back-navigation to the certificate, which cheapens it fast.
    if (!getState().masterCelebrated) {
      var cs = getState(); cs.masterCelebrated = new Date().toISOString(); setState(cs);
    }
    revealOnScroll();
  }

  /* ---- ABOUT G PEN ------------------------------------------------------- */
  function renderAbout() {
    var a = window.GPEN_ABOUT || {};
    var e = getEnroll();
    setTitleDoc(tx("About G Pen"));
    var founding = (Array.isArray(a.foundingStory) ? a.foundingStory : [a.foundingStory || ""]).map(function (p) { return "<p>" + dt(I18N_ABOUT, "foundingStory", esc(p)) + "</p>"; }).join("");
    app.innerHTML = header() +
      '<section class="about reveal">' +
        '<a class="back" href="#/">' + ic("back") + " " + t("Products") + "</a>" +
        '<div class="about-hero">' +
          '<img class="about-g" src="assets/img/gpen-g-white.png" alt="G Pen"/>' +
          '<span class="ch-eyebrow">' + ic("cap") + " " + t("About the brand") + "</span>" +
          // Derived, not hardcoded: this h1 said "15 years" while the stat tile
          // directly below it said "14+" — a contradiction on one screen. Both
          // now come from the founding year, so they cannot drift or go stale.
          "<h1>" + tf("{years} years of leading the culture.", { years: brandYears() }) + "</h1>" +
          "<p>" + dt(I18N_ABOUT, "intro", esc(a.intro || "")) + "</p>" +
        "</div>" +
        (a.stats ? '<div class="about-stats">' + a.stats.map(function (s) { return '<div class="astat"><strong>' + esc(s.number) + "</strong><span>" + dt(I18N_ABOUT, "stats", esc(s.label)) + "</span></div>"; }).join("") + "</div>" : "") +
        '<div class="about-block"><h2>' + t("Our story") + "</h2>" + founding + "</div>" +
        (a.milestones ? '<div class="about-block"><h2>' + t("Milestones") + '</h2><ol class="timeline">' + a.milestones.map(function (m) {
          return '<li><span class="tl-year">' + esc(m.year) + "</span><span class=\"tl-dot\"></span><p>" + dt(I18N_ABOUT, "milestones", esc(m.text)) + "</p></li>";
        }).join("") + "</ol></div>" : "") +
        (a.collaborations ? '<div class="about-block"><h2>' + t("Collaborations") + '</h2><p class="lead">' + t("G Pen has partnered with leading names in music and cannabis:") + '</p><div class="collabs">' +
          a.collaborations.map(function (c) { return '<span class="collab">' + esc(c) + "</span>"; }).join("") + "</div>" +
          "</div>" : "") +
        (a.globalReach ? '<div class="about-block glob"><h2>' + t("A global brand") + "</h2><p>" + dt(I18N_ABOUT, "globalReach", esc(a.globalReach)) + "</p></div>" : "") +
        (a.social ? '<div class="about-block"><h2>' + t("Follow G Pen") + "</h2>" +
          (a.socialPitch ? '<p class="lead">' + dt(I18N_ABOUT, "socialPitch", esc(a.socialPitch)) + "</p>" : "") +
          '<div class="social-grid">' + a.social.map(function (sc) {
            return '<a class="social-card" href="' + esc(sc.url) + '" target="_blank" rel="noopener">' +
              '<span class="soc-net">' + esc(sc.network) + "</span>" +
              (sc.stat ? '<span class="soc-stat">' + esc(sc.stat) + "</span>" : "") +
              '<span class="soc-label">' + esc(sc.label || "") + "</span>" +
              '<span class="soc-handle">' + esc(sc.handle) + " " + ic("arrow") + "</span>" +
            "</a>";
          }).join("") + "</div></div>" : "") +
        '<div class="about-close">' + ic("tag") + "<p>" + dt(I18N_ABOUT, "closing", esc(a.closing || "")) + "</p></div>" +
        '<a class="btn xl center-btn" href="#/">' + (e ? t("Back to my courses") : t("Browse products")) + " " + ic("arrow") + "</a>" +
      "</section>" + footer();
    revealOnScroll();
  }


  /* ---- reveal-on-scroll -------------------------------------------------- */
  function revealOnScroll() {
    var els = $$(".reveal");
    var reveal = function (e) { e.classList.add("in"); };
    var revealAll = function () { els.forEach(reveal); };
    if (!("IntersectionObserver" in window)) { revealAll(); return; }
    var io = new IntersectionObserver(function (ents, obs) {
      ents.forEach(function (en) { if (en.isIntersecting) { reveal(en.target); obs.unobserve(en.target); } });
    }, { threshold: 0.05, rootMargin: "0px 0px -4% 0px" });
    els.forEach(function (e) { io.observe(e); });
    // Content must NEVER stay hidden. If the tab is hidden/inactive the observer
    // may never fire, so reveal immediately; also reveal on the next visibility
    // change, plus a hard failsafe timeout. Active tabs still animate on scroll.
    if (document.hidden) revealAll();
    document.addEventListener("visibilitychange", function () { if (!document.hidden) revealAll(); }, { once: true });
    setTimeout(revealAll, 1600);
  }
  // Passing the program name itself produced "G Pen University · G Pen University"
  // on home and the master certificate.
  function setTitleDoc(t) { document.title = (t && t !== CFG.programName) ? t + " · " + CFG.programName : CFG.programName; }

  /* ---- router ------------------------------------------------------------ */
  function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }
  /* Modals live on <body>, not inside #app, so a re-render does not remove them.
     Any overlay still standing when the route changes has outlived its page —
     leaving it would strand the rep behind a full-viewport backdrop with scroll
     locked and #app aria-hidden. The per-modal close() handlers are still the
     primary path (they also clear Escape listeners and the pull auto-open timer);
     this is the guarantee that no future overlay can strand a live page. */
  /* Modals live on <body>, so route()'s re-render of #app leaves them mounted. Run
     each one's OWN close() where it published one: removing the node is not the same
     as closing the modal — close() is what cancels the pull's 4.6s auto-open timer and
     unbinds the document-level Escape listeners. Removing only the node left both
     alive, so navigating away from an open modal left its timer running
     over the next page 4.6s later, and every video/inspector open leaked a listener.
     Fall back to remove() for any overlay that never registered a teardown. */
  function clearStrayOverlays() {
    $$("body > .modal").forEach(function (el) {
      if (typeof el.__teardown === "function") { try { el.__teardown(); } catch (err) { el.remove(); } }
      else el.remove();
    });
    document.body.classList.remove("noscroll");
    if (app) app.removeAttribute("aria-hidden");
  }
  function route() {
    var h = location.hash.replace(/^#/, "") || "/";
    var parts = h.split("/").filter(Boolean); // e.g. ["course","dash-ii"]
    clearStrayOverlays();
    window.scrollTo(0, 0);
    setTitleDoc(CFG.programName);
    var pageKey = "home";
    if (parts[0] === "course" && parts[1]) { renderCourse(parts[1]); pageKey = "course:" + parts[1]; }
    else if (parts[0] === "certified") { renderCertified(); pageKey = ""; }
    else if (parts[0] === "about") { renderAbout(); pageKey = "about"; }
    else renderHome(); // "/", "/dashboard", "/enroll" and anything else → the hub
  }
  function boot() {
    app = $("#app"); // re-resolve in case the script loaded before #app parsed
    // Before the first render, and before any reporting reads a course name.
    applyCourseI18n();
    applyAboutI18n();
    document.documentElement.setAttribute("lang", curLang);
    // Backfill: someone who earned a tier before it existed still gets reported
    // once. Both calls no-op unless the tier is newly reached and unrecorded.
    // Backfill: anyone who earned a tier before it reported (or before a webhook
    // existed) gets recorded on their next visit. Both calls are idempotent.
    if (getEnroll()) { reportCourses(); maybeReportTier(); reportMaster(); }
    // A half-armed prize config should never be silent in either direction.
    (function () {
      var s = CFG.sweepstakes || {};
      if (s.enabled === false || s.live !== true) return;
      if (!s.rulesUrl) console.warn("[gpen-training] sweepstakes.live is true but rulesUrl is empty, so the prize promotion is NOT rendering. Host the counsel-cleared rules page and set sweepstakes.rulesUrl. Preview it meanwhile with ?preview=draw.");
      else if (!(CFG.reporting || {}).url) console.warn("[gpen-training] sweepstakes is armed but reporting.url is empty — there is no counter, so no winner can be selected. See REPORTING.md.");
    }());
    // LADDER.pct drives every percentage the site SAYS; TRAINING_CONFIG.discount
    // holds the code that percentage is actually redeemed with. Nothing links them,
    // so retuning a rung in one place and not the other makes the site promise a
    // discount the code does not give. Say so loudly at boot rather than let a rep
    // find out at checkout.
    (function () {
      var codes = CFG.discount || {};
      LADDER.forEach(function (rung) {
        var cfgTier = codes[rung.key];
        if (!cfgTier) return;
        // Both the code (GPENPRO25) and the label ("25% off ...") carry the number.
        var inCode = String(cfgTier.code || "").match(/(\d{2})\s*$/);
        var inLabel = String(cfgTier.label || "").match(/(\d{2})\s*%/);
        [["code", inCode], ["label", inLabel]].forEach(function (pair) {
          if (pair[1] && Number(pair[1][1]) !== rung.pct) {
            console.warn("[gpen-training] reward mismatch: LADDER says " + rung.pct + "% at " +
              rung.at + " course(s), but discount." + rung.key + "." + pair[0] + " says " +
              pair[1][1] + "% (" + (t.code || t.label) + "). The site will promise one number and issue another.");
          }
        });
      });
    }());
    // The form collects name, email, store and a 21+ attestation and says they
    // may be sent to G Pen. Shipping that with no privacy statement is the first
    // thing a dispensary compliance lead will flag, so make it impossible to miss.
    if (!CFG.privacyUrl) console.warn("[gpen-training] config.privacyUrl is empty — the certification form collects name/email/store and states the data may be sent to G Pen, but no privacy notice is linked anywhere. Host one and set privacyUrl before sharing this with partners.");
    if (!app) { return document.addEventListener("DOMContentLoaded", boot, { once: true }); }
    bindReset();
    bindSkipLink();
    bindLangSel();
    window.addEventListener("hashchange", route);
    route();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
