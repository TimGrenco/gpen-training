/* =============================================================================
   G PEN TRAINING PORTAL — APP
   A small hash-routed SPA. No framework, no backend. Progress in localStorage.

   Routes: "/" home (state-aware hero + the product lineup, grouped by family)
           "/course/<slug>"  sell-first course page, ending in the quiz
           "/collection"     the Binder — the six collectible cards
           "/certified"      the all-five master certificate
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
  var stickyHandler = null;     // scroll handler for the course "get certified" nudge

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
    var d = { courses: {}, streak: { count: 0, last: null }, master: null, trio: null, log: [] };
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
  function touchStreak() {
    var s = getState(), t = todayKey();
    if (s.streak.last === t) return s.streak.count;
    var y = new Date(); y.setDate(y.getDate() - 1);
    var yk = y.getFullYear() + "-" + (y.getMonth() + 1) + "-" + y.getDate();
    s.streak.count = (s.streak.last === yk) ? (s.streak.count + 1) : 1;
    s.streak.last = t; setState(s); return s.streak.count;
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
    var t = null;
    LADDER.forEach(function (x) { if (done >= x.at) t = x; });
    return t;
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
  function earnedTierKey() { var t = tierAt(completedCount()); return t ? t.key : "course"; }
  // The best percentage on offer. COPY must call this rather than typing a number:
  // the issuance logic already reads LADDER, so a hardcoded "40% off" in a headline
  // is a promise that silently goes wrong the day someone retunes the top rung.
  function topPct() {
    return LADDER.reduce(function (best, x) { return x.pct > best ? x.pct : best; }, 0);
  }

  /* =========================================================================
     THE COLLECTION — trading cards
     Every course is a card you pull by passing its quiz at 80%+. Collect all
     five to reveal the gold Certified G — the 6th card and the program's top reward.
     ====================================================================== */

  /* ---- fun layer: quips, "did you know" ---------------------------------- */
  var FACTS = window.GPEN_FACTS || [];
  function pick(arr) { return arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : ""; }
  // Fisher–Yates — used to shuffle quiz question + choice order per attempt so a
  // retake isn't byte-identical (reps learn the material, not answer positions).
  function shuffle(arr) { var a = arr.slice(); for (var j = a.length - 1; j > 0; j--) { var k = Math.floor(Math.random() * (j + 1)); var t = a[j]; a[j] = a[k]; a[k] = t; } return a; }
  // The questions a rep missed, with the right answer + why — shown on the
  // results screen so every attempt teaches, on a pass AND a fail.
  function missedReviewHTML(c, order, answers) {
    if (!order || !answers) return "";
    var rows = order.map(function (qi, pos) {
      var q = c.quiz[qi];
      if (answers[pos] === q.answer) return "";
      return '<div class="qr-item">' +
        '<div class="qr-q">' + esc(q.q) + "</div>" +
        '<div class="qr-a"><em>Answer</em><span>' + esc(q.choices[q.answer]) + "</span></div>" +
        (q.why ? '<div class="qr-why">' + ic("spark") + "<span>" + esc(q.why) + "</span></div>" : "") +
      "</div>";
    }).filter(Boolean);
    if (!rows.length) return "";
    return '<div class="qreview"><h4>' + ic("cap") + " Worth another look &middot; " + rows.length + " missed</h4>" + rows.join("") + "</div>";
  }
  function quip(kind) {
    var q = (window.GPEN_QUIPS || {})[kind];
    return pick(q) || (kind === "correct" ? "Correct!" : "Not quite.");
  }
  // A rotating trivia card. No points, no quiz — just something to enjoy.
  function factCard() {
    if (!FACTS.length) return "";
    var f = pick(FACTS);
    return '<div class="fact-card reveal" data-fact>' +
      '<span class="fact-em">' + f.emoji + "</span>" +
      '<div class="fact-body"><span class="fact-k">Did you know?</span><p>' + esc(f.text) + "</p></div>" +
      '<button class="fact-more" type="button" aria-label="Another fact" title="Hit me with another">' + ic("refresh") + "</button>" +
    "</div>";
  }
  function bindFacts() {
    $$("[data-fact]").forEach(function (card) {
      var btn = $(".fact-more", card); if (!btn) return;
      btn.addEventListener("click", function () {
        var f = pick(FACTS);
        $(".fact-em", card).textContent = f.emoji;
        $(".fact-body p", card).textContent = f.text;
        card.classList.remove("flip"); void card.offsetWidth; card.classList.add("flip");
      });
    });
  }
  // Tap the footer G four times. Nothing to win — just a wink.
  function bindLogoFun() {
    var taps = 0, timer = null;
    $$(".foot-g").forEach(function (g) {
      g.style.cursor = "pointer";
      g.addEventListener("click", function () {
        taps++; clearTimeout(timer); timer = setTimeout(function () { taps = 0; }, 1400);
        if (taps >= 4) {
          taps = 0; confetti();
          toast("🌬️ Secret handshake accepted. Class dismissed.");
        }
      });
    });
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

  /* The card-pull moment: passing a course flips its collectible card out of a
     foil booster pack. Only reached from quizPass — the trivia-egg system that

  // The 30% tier fires once, the first time a second card lands in the binder.
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
    REPORT_TIERS.forEach(function (t) {
      if (done < t.at) return;
      if (!s[t.flag]) { s[t.flag] = { at: new Date().toISOString() }; changed = true; logEvent(t.flag, {}, s); }
      if (!s[t.flag + "Reported"] &&
          sendReport({ type: t.type, name: e.name, email: e.email, store: e.store, product: t.label, score: 100, certId: "", date: niceDate() })) {
        s[t.flag + "Reported"] = new Date().toISOString();
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
        sendReport({ type: "master", name: e.name, email: e.email, store: e.store, product: "Certified G", score: 100, certId: m.certId, date: m.date })) {
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
    fire: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 3-1 4-2 6-1 2 0 4 2 4 1 0 2-1 2-3 2 2 3 4 3 6a5 5 0 11-10 0c0-4 3-6 5-13z"/></svg>',
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
    caret: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  };
  function ic(n) { return '<span class="ic">' + (IC[n] || "") + "</span>"; }

  /* =========================================================================
     PROFESSOR O.G. — the mascot. A tenured owl in a black G Pen beanie with a
     gold chain and a G Pen logo pendant, and he is visibly baked. Drawn as
     inline SVG so he scales and reads on light, dark, and at 40px.
     Moods: chill (his default, heavy-lidded) | hyped | think | proud | oops
     ====================================================================== */
  var MASCOT = window.GPEN_MASCOT || {};
  function mascotSVG(mood) {
    mood = mood || "chill";
    var closed = mood === "proud";
    // "chill" is his default — and he is comfortably baked
    var lid = ({ chill: 22, hyped: 2, think: 14, proud: 0, oops: 8 })[mood] || 0;
    var pupR = mood === "hyped" ? 12 : 10;
    var pupDX = mood === "think" ? 5 : 0;
    // droopy, uneven lids do most of the heavy lifting on the stoned look
    var tilt = ({ chill: 7, hyped: 0, think: 4, proud: 0, oops: 2 })[mood] || 0;
    var brows = ({
      chill: ["M66 88 L104 83", "M154 88 L116 83"],
      hyped: ["M64 82 L104 76", "M156 82 L116 76"],
      think: ["M66 94 L104 78", "M154 84 L116 82"],
      proud: ["M66 88 L104 84", "M154 88 L116 84"],
      oops: ["M66 80 L104 90", "M154 80 L116 90"],
    })[mood] || ["M66 88 L104 83", "M154 88 L116 83"];
    var uid = "og" + mood + (mascotSVG.n = (mascotSVG.n || 0) + 1);

    function eye(cx) {
      if (closed) {
        return '<path d="M' + (cx - 19) + " 116 Q" + cx + " 98 " + (cx + 19) + ' 116" fill="none" stroke="#1f1f1f" stroke-width="6" stroke-linecap="round"/>';
      }
      var id = uid + "c" + cx;
      return '<clipPath id="' + id + '"><circle cx="' + cx + '" cy="110" r="24"/></clipPath>' +
        '<circle cx="' + cx + '" cy="110" r="24" fill="#ffffff"/>' +
        '<g clip-path="url(#' + id + ')">' +
          // warm, faintly bloodshot wash in the eye
          '<circle cx="' + cx + '" cy="118" r="24" fill="#f6dcd4" opacity=".55"/>' +
          '<circle cx="' + (cx + pupDX) + '" cy="116" r="' + pupR + '" fill="#1a1a1a"/>' +
          '<circle cx="' + (cx + pupDX + 4) + '" cy="112" r="4" fill="#fff"/>' +
          (lid ? '<rect x="' + (cx - 28) + '" y="' + (84 - (22 - lid)) + '" width="56" height="' + lid + '" fill="#e2dccc"' +
            (tilt ? ' transform="rotate(' + (cx < 110 ? tilt : -tilt) + " " + cx + " " + (84 + lid) + ')"' : "") + "/>" : "") +
        "</g>" +
        '<circle cx="' + cx + '" cy="110" r="24" fill="none" stroke="#c8952f" stroke-width="3.5"/>';
    }

    return '<svg class="og-svg og-m-' + mood + '" viewBox="0 0 220 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      // body + wings
      '<ellipse cx="110" cy="138" rx="72" ry="76" fill="#2b2b2b"/>' +
      '<path d="M40 132 Q24 172 48 206 Q42 164 56 134 Z" fill="#1e1e1e"/>' +
      '<path d="M180 132 Q196 172 172 206 Q178 164 164 134 Z" fill="#1e1e1e"/>' +
      // facial disc
      '<ellipse cx="110" cy="110" rx="60" ry="48" fill="#f3efe3"/>' +
      // eyes + brows
      '<g class="og-eyes">' + eye(86) + eye(134) + "</g>" +
      '<path d="' + brows[0] + '" stroke="#2b2b2b" stroke-width="6.5" stroke-linecap="round" fill="none"/>' +
      '<path d="' + brows[1] + '" stroke="#2b2b2b" stroke-width="6.5" stroke-linecap="round" fill="none"/>' +
      // beak
      '<path d="M110 128 L100 144 L120 144 Z" fill="#FEC870"/>' +
      '<path d="M110 144 L105 151 L115 151 Z" fill="#c8952f"/>' +
      // extremely relaxed cheeks
      '<ellipse cx="66" cy="136" rx="15" ry="8" fill="#e0725f" opacity=".32"/>' +
      '<ellipse cx="154" cy="136" rx="15" ry="8" fill="#e0725f" opacity=".32"/>' +
      // gold chain with a G Pen logo pendant
      '<path d="M72 166 Q110 204 148 166" fill="none" stroke="#FEC870" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="110" cy="198" r="18" fill="#FEC870" stroke="#c8952f" stroke-width="2.5"/>' +
      '<image href="assets/img/gpen-g-black.png" x="97" y="185" width="26" height="26" preserveAspectRatio="xMidYMid meet"/>' +
      // black G Pen beanie — snug dome + folded cuff, sits clear of the brows
      '<path d="M52 56 Q50 10 110 8 Q170 10 168 56 Z" fill="#1c1c1c"/>' +
      '<path d="M80 54 Q75 28 94 14" stroke="#2e2e2e" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M110 54 L110 9" stroke="#2e2e2e" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path d="M140 54 Q145 28 126 14" stroke="#2e2e2e" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<rect x="44" y="42" width="132" height="28" rx="14" fill="#111"/>' +
      '<rect x="44" y="42" width="132" height="28" rx="14" fill="none" stroke="#343434" stroke-width="1.5"/>' +
      '<path d="M62 47 L62 65 M78 47 L78 65 M94 47 L94 65 M142 47 L142 65 M158 47 L158 65" stroke="#2b2b2b" stroke-width="2" stroke-linecap="round"/>' +
      '<image href="assets/img/gpen-g-white.png" x="99" y="45" width="22" height="22" preserveAspectRatio="xMidYMid meet"/>' +
      // talons
      '<path d="M88 212 l0 11 M83 223 l10 0 M132 212 l0 11 M127 223 l10 0" stroke="#c8952f" stroke-width="4" stroke-linecap="round"/>' +
    "</svg>";
  }
  function ogLine(key) { return pick(MASCOT[key] || []) || ""; }
  // A small O.G. head used inline (quiz feedback, pull note).
  function ogMini(mood) { return '<span class="og-mini">' + mascotSVG(mood) + "</span>"; }
  // O.G. with a speech bubble — his "office hours" block on the hub.
  function ogSays(mood, line) {
    return '<button class="og-block reveal" type="button" aria-label="Tap Professor O.G. for a tip">' +
      '<span class="og-art">' + mascotSVG(mood) + "</span>" +
      '<div class="og-bubble">' +
        '<span class="og-name">' + esc(MASCOT.short || "Prof. O.G.") + '<em>' + esc(MASCOT.title || "") + "</em></span>" +
        "<p>" + line + "</p>" +
        '<span class="og-hint">' + ic("spark") + " Tap the Prof</span>" +
      "</div>" +
    "</button>";
  }
  // Tap him: he hoots, changes his face, and drops a fresh bit of wisdom.
  function bindMascot() {
    $$(".og-block").forEach(function (b) {
      b.addEventListener("click", function () {
        sfx.play("hoot");
        var art = $(".og-art", b), p = $(".og-bubble p", b);
        if (p) p.innerHTML = ogLine("idle");
        if (art) art.innerHTML = mascotSVG(pick(["hyped", "think", "chill", "proud"]));
        b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
      });
    });
  }
  // Which greeting he opens with, based on how far along they are.
  function ogGreeting() {
    var done = completedCount(), total = COURSES.length;
    if (isMasterEarned()) return ogSays("proud", ogLine("done"));
    if (done === 0) return ogSays("chill", ogLine("welcome"));
    if (done >= total - 1) return ogSays("hyped", ogLine("almost"));
    return ogSays("chill", ogLine("started"));
  }
  // The masthead headline IS the Dean's voice — same branch logic as ogGreeting,
  // but returns a plain string for the <h1>. State-0 gets a fixed mission line so
  // a first-time visitor's headline copy is stable; returning staff hear him.
  function ogGreetingLine(done, total) {
    if (isMasterEarned()) return ogLine("done");
    if (done === 0) return "Learn the gear. Get up to " + topPct() + "% off.";
    if (done >= total - 1) return ogLine("almost");
    return ogLine("started");
  }

  /* The Floor Drill — the loved battlecard's pairing reflex, on the home page.
     One question ("someone's buying…") → one answer (hand them X + the why +
     a link into that product's full battlecard). Reuses howToSell data only. */
  function floorDrill() {
    // Ordered list, not an object — numeric-like keys ("510") would otherwise sort first.
    var PAIR = [
      { key: "flower", cue: "🌿", label: "Flower", slug: "dash-ii" },
      { key: "cart", cue: "🛢", label: "510 cart", slug: "hydout" },
      { key: "dabs", cue: "🍯", label: "Dabs", slug: "melt-hot-knife" },
    ];
    var chips = PAIR.map(function (p) {
      return '<button class="fd-chip" type="button" data-pair="' + p.key + '"><span class="fd-cue">' + p.cue + "</span>" + p.label + "</button>";
    }).join("");
    return '<section class="floordrill reveal">' +
      // Title then the question then the chips. The section subtitle used to ask
      // "What do you hand them?" one line above "A customer walks up buying...",
      // which is the same question twice; the prompt belongs next to the buttons.
      '<div class="sec-h"><h2>The floor drill</h2></div>' +
      '<p class="fd-ask">A customer walks up buying&hellip;</p>' +
      '<div class="fd-chips">' + chips + "</div>" +
      '<div class="fd-answer" id="fd-answer" aria-live="polite"></div>' +
    "</section>";
  }
  function bindFloorDrill() {
    var PAIR = { flower: "dash-ii", cart: "hydout", dabs: "melt-hot-knife" };
    var out = $("#fd-answer"); if (!out) return;
    $$(".fd-chip").forEach(function (ch) {
      ch.addEventListener("click", function () {
        $$(".fd-chip").forEach(function (x) { x.classList.remove("on"); });
        ch.classList.add("on");
        var c = courseBySlug(PAIR[ch.getAttribute("data-pair")]); if (!c || !c.howToSell) return;
        out.innerHTML = '<div class="fd-card" style="--accent:' + c.accent + '">' +
          '<b class="fd-hand">Hand them the ' + esc(c.name) + "</b>" +
          '<p class="fd-why">' + esc(c.howToSell.vital) + "</p>" +
          '<a class="fd-more" href="#/course/' + c.slug + '">See the full battlecard ' + ic("arrow") + "</a>" +
        "</div>";
        out.classList.add("show");
      });
    });
  }

  /* =========================================================================
     LANGUAGE SELECTOR — same language set + endonym pattern as assets.gpen.com.
     PLACEHOLDER: the UI is real, but no translations exist yet, so picking a
     non-English language says so honestly instead of half-translating the page.
     To go live: add assets/data/i18n/<lang>.js and swap the body of setLang().
     ====================================================================== */
  var LANGS = { en: "English", es: "Espa\u00f1ol", de: "Deutsch", it: "Italiano", fr: "Fran\u00e7ais" };
  var LANG_ORDER = ["en", "es", "de", "it", "fr"];
  var curLang = "en";
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
            (l !== "en" ? '<span class="langmenu-soon">Soon</span>' : "") +
          "</button>";
        }).join("") +
      "</div>" +
    "</div>";
  }
  function setLang(l) {
    if (!Object.prototype.hasOwnProperty.call(LANGS, l)) return;
    if (l !== "en") { toast(LANGS[l] + " is coming soon \u2014 translations are on the way."); return; }
    curLang = l;
  }
  function bindLangSel() {
    document.addEventListener("click", function (ev) {
      var wrap = $("#lang-select"); if (!wrap) return;
      var btn = ev.target.closest && ev.target.closest("#lang-btn");
      var item = ev.target.closest && ev.target.closest(".langmenu-item");
      if (btn) {
        var open = wrap.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        sfx.play("tick");
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

  /* ---- sound fx (synthesized Web Audio; no asset files, gesture-triggered) - */
  var sfx = (function () {
    var KEY = "gpt.sound";
    var on = (function () { try { return localStorage.getItem(KEY) !== "off"; } catch (e) { return true; } })();
    var ctx = null;
    function ac() {
      if (ctx) return ctx;
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
      return ctx;
    }
    function tone(freq, start, dur, type, gain) {
      var c = ac(); if (!c) return;
      var o = c.createOscillator(), g = c.createGain();
      o.type = type || "sine"; o.frequency.value = freq;
      var t0 = c.currentTime + (start || 0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain || 0.18, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + (dur || 0.15));
      o.connect(g); g.connect(c.destination);
      o.start(t0); o.stop(t0 + (dur || 0.15) + 0.03);
    }
    function noise(start, dur, gain, hp) {
      var c = ac(); if (!c) return;
      var n = Math.max(1, Math.floor((dur || 0.2) * c.sampleRate));
      var buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      var s = c.createBufferSource(); s.buffer = buf;
      var f = c.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp || 1100;
      var g = c.createGain(); g.gain.value = gain || 0.14;
      s.connect(f); f.connect(g); g.connect(c.destination);
      s.start(c.currentTime + (start || 0));
    }
    var lib = {
      correct: function () { tone(660, 0, 0.12, "sine", 0.16); tone(880, 0.08, 0.14, "sine", 0.16); },
      wrong: function () { tone(196, 0, 0.2, "square", 0.12); tone(147, 0.06, 0.22, "square", 0.1); },
      combo: function () { [523, 659, 784, 1046].forEach(function (f, i) { tone(f, i * 0.055, 0.13, "triangle", 0.15); }); },
      pull: function () { noise(0, 0.26, 0.16, 900); [784, 1046, 1318].forEach(function (f, i) { tone(f, 0.14 + i * 0.05, 0.18, "sine", 0.15); }); },
      pass: function () { [523, 659, 784, 1046].forEach(function (f, i) { tone(f, i * 0.1, 0.24, "triangle", 0.17); }); },
      copy: function () { tone(880, 0, 0.05, "square", 0.09); tone(1320, 0.04, 0.05, "square", 0.07); },
      tick: function () { tone(660, 0, 0.04, "sine", 0.07); },
      // Prof. O.G.'s two-note hoot
      hoot: function () { tone(392, 0, 0.16, "sine", 0.13); tone(330, 0.17, 0.26, "sine", 0.12); },
      flip: function () { noise(0, 0.13, 0.11, 1600); },              // card / page turn
      whoosh: function () { noise(0, 0.3, 0.1, 500); tone(520, 0.04, 0.22, "sine", 0.08); },
    };
    return {
      play: function (name) {
        if (!on) return;
        var c = ac(); if (c && c.state === "suspended") { try { c.resume(); } catch (e) {} }
        var f = lib[name]; if (f) try { f(); } catch (e) {}
      },
      toggle: function () {
        on = !on; try { localStorage.setItem(KEY, on ? "on" : "off"); } catch (e) {}
        if (on) this.play("tick");
        return on;
      },
      isOn: function () { return on; },
    };
  })();

  /* ---- toast + confetti -------------------------------------------------- */
  var toastT;
  function toast(msg) {
    var t = $("#toast"); if (!t) { t = document.createElement("div"); t.id = "toast"; t.setAttribute("role", "status"); t.setAttribute("aria-live", "polite"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show"); clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }
  function confetti() {
    // The one animation in the app that ignored the OS setting: nine CSS
    // prefers-reduced-motion blocks plus JS guards in bindCardTilt, flyToBinder and
    // showPull all honour it, and then 140 particles ran full-viewport for 2.6s
    // anyway — showPull even calls this on the reduced-motion path, where it skips
    // the pack tear specifically to avoid motion.
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var c = document.createElement("canvas"); c.className = "confetti"; document.body.appendChild(c);
    var x = c.getContext("2d"), W, H;
    function size() { W = c.width = window.innerWidth; H = c.height = window.innerHeight; }
    size();
    var cols = ["#FEC870", "#D75D43", "#111111", "#FFFFFF", "#E8E8E1"], P = [];
    for (var i = 0; i < 140; i++) P.push({ x: Math.random() * W, y: -20 - Math.random() * H, r: 4 + Math.random() * 7, c: cols[i % cols.length], s: 2 + Math.random() * 4, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3 });
    var t0 = Date.now();
    (function frame() {
      x.clearRect(0, 0, W, H);
      P.forEach(function (p) {
        p.y += p.s; p.x += Math.sin((p.y + p.a) / 40) * 1.4; p.a += p.va;
        x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c;
        x.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.5); x.restore();
      });
      if (Date.now() - t0 < 2600) requestAnimationFrame(frame); else c.remove();
    })();
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
    return '<a class="skip" href="#main">Skip to content</a>' +
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
        nav("courses", "#/", "Courses") +
        nav("about", "#/about", "About") +
      "</nav>" +
      // The language selector only offers English today; picking anything else
      // just toasts "coming soon", so it stays hidden until a locale file exists.
      ((CFG.i18n && CFG.i18n.enabled) ? langSelHTML() : "") +
      '<button class="hdr-sound" id="sound-toggle" title="' + (sfx.isOn() ? "Sound on" : "Sound off") + '" aria-label="Toggle sound" aria-pressed="' + (sfx.isOn() ? "true" : "false") + '">' + ic(sfx.isOn() ? "sound" : "mute") + "</button>" +
      // Not a link: it pointed at #/, same as the logo and the Courses tab.
      (e ? '<span class="hdr-user"><span class="hdr-u-name">' + esc(e.name) + '</span><span class="hdr-u-store">' + esc(e.store || "") + "</span></span>" : "") +
    "</header>" +
    '<main id="main" tabindex="-1">';
  }
  // Sound toggle survives re-renders via a single delegated listener (bound in boot).
  function bindSoundToggle() {
    document.addEventListener("click", function (ev) {
      var btn = ev.target.closest && ev.target.closest("#sound-toggle");
      if (!btn) return;
      var nowOn = sfx.toggle();
      btn.innerHTML = ic(nowOn ? "sound" : "mute");
      btn.title = nowOn ? "Sound on" : "Sound off";
      btn.setAttribute("aria-pressed", nowOn ? "true" : "false");
      toast(nowOn ? "\uD83D\uDD0A Sound on" : "\uD83D\uDD07 Sound off");
    });
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
          (cn ? ": " + cn + " course certificate" + (cn === 1 ? "" : "s") + ", earned cards and streak" : "") +
          ".\n\nThis cannot be undone. Continue?")) {
        localStorage.removeItem(K_STATE); localStorage.removeItem(K_ENROLL);
        toast("Progress cleared \u2014 fresh start \uD83C\uDF31");
        go("#/");
      }
    });
  }

  /* ======================= THE HOME HERO ===================================
     The landing page used to be a brochure ABOUT the training: five sections of
     persuasion before a rep could touch anything. This is the training itself, in
     the first screen, and it shows whoever is looking their single most useful
     next action:
       nobody yet   -> a real question from the real bank. Answer it and you have
                       already started; the card then becomes an on-ramp into the
                       exact product that question was about.
       mid-progress -> where they left off, what is next, what it unlocks.
       fully done   -> their top code and their certificate.
     Nothing here writes to storage — the pop quiz is deliberately zero-commitment
     and pre-enrollment, so a first visit still collects nothing about anybody. */

  /* Questions worth meeting a stranger with: floor scenarios, not spec recall.
     The health-adjacent items are deliberately excluded — they are good training
     (the correct answer is to decline and redirect) but as a landing-page teaser
     they would read as the site raising the subject. */
  function heroPool() {
    var INCLUDE = /customer|shopper|walks up|holds up|regular/i;
    var EXCLUDE = /cough|lung|health|medical|anxiety|sleep|pain|nausea|doctor/i;
    var pool = [];
    COURSES.forEach(function (c) {
      (c.quiz || []).forEach(function (q) {
        if (!INCLUDE.test(q.q) || EXCLUDE.test(q.q)) return;
        if ((q.choices || []).some(function (ch) { return EXCLUDE.test(ch); })) return;
        pool.push({ q: q, course: c });
      });
    });
    return pool;
  }
  var heroQ = null;   // the question this visit is showing; kept for the answer handler

  function popQuizHTML() {
    var pool = heroPool();
    if (!pool.length) return "";                     // no eligible question: fall back
    heroQ = pool[Math.floor(Math.random() * pool.length)];
    var q = heroQ.q;
    // Shuffle display order but keep each choice's real index, exactly like the
    // real quiz does, so the answer key can never drift from what is on screen.
    var order = shuffle(q.choices.map(function (_, i) { return i; }));
    return '<section class="hero hero-quiz reveal">' +
      '<div class="hero-in">' +
        '<span class="hero-eyebrow">' + ic("cap") + " G Pen University &middot; Pop quiz</span>" +
        '<h1 class="hero-h1">Can you answer this?</h1>' +
        '<p class="hero-sub">One real question from the real training. Nothing saved, nothing to sign up for.</p>' +
        // The reward hook still has to live above the fold — it is the single
        // strongest reason a rep keeps going — but as one scannable line, not the
        // four separate retellings the old masthead had.
        '<ul class="hero-facts"><li>Free</li><li>' + COURSES.length + " courses</li><li class=\"gold\">Up to " + topPct() + "% off gpen.com</li></ul>" +
        '<div class="pq" id="pq">' +
          // The Dean asks it, from a HEADER row rather than beside the text. Sat next
          // to the question he took a third of the width, and the longest question in
          // the bank (181 chars) then ran to 11 lines in a 188px column at 320px.
          // He reacts to the answer — the only motion in the hero, and the reason a
          // wrong answer still feels like someone is on your side.
          '<div class="pq-ask">' +
            '<span class="pq-og" id="pq-og" aria-hidden="true">' + mascotSVG("think") + "</span>" +
            '<span class="pq-who">' + esc(MASCOT.name || "Professor O.G.") + " asks</span>" +
          "</div>" +
          '<div class="pq-q">' + esc(q.q) + "</div>" +
          '<div class="pq-choices">' +
            order.map(function (ci, pos) {
              return '<button class="pq-choice" type="button" data-ci="' + ci + '">' +
                '<span class="pq-key">' + String.fromCharCode(65 + pos) + "</span>" +
                "<span>" + esc(q.choices[ci]) + "</span></button>";
            }).join("") +
          "</div>" +
          '<div class="pq-out" id="pq-out" role="status" aria-live="polite"></div>' +
        "</div>" +
        '<button class="hero-skip" type="button" data-scroll="courses">Skip it &mdash; show me the courses ' + ic("arrow") + "</button>" +
      "</div>" +
    "</section>";
  }

  function bindPopQuiz() {
    var pq = $("#pq"); if (!pq || !heroQ) return;
    var q = heroQ.q, course = heroQ.course;
    $$(".pq-choice", pq).forEach(function (b) {
      b.addEventListener("click", function () {
        if (pq.classList.contains("done")) return;   // one shot; it is a taste, not a score
        pq.classList.add("done");
        var ci = parseInt(b.getAttribute("data-ci"), 10);
        var right = ci === q.answer;
        // aria-disabled, NOT disabled: disabling the button the rep just activated
        // removes it from the focus order, and the browser drops focus to <body> —
        // so their next Tab restarted at the skip link, a whole header away from the
        // CTA this interaction exists to offer. Re-answering is already blocked by
        // the pq.classList "done" guard at the top of this handler.
        $$(".pq-choice", pq).forEach(function (o) {
          var oci = parseInt(o.getAttribute("data-ci"), 10);
          o.setAttribute("aria-disabled", "true");
          if (oci === q.answer) o.classList.add("ok");
          else if (oci === ci) o.classList.add("no");
        });
        sfx.play(right ? "pass" : "tick");
        // Warm either way. Getting it wrong is the entire reason the site exists,
        // so it must never read as a rebuke on someone's first five seconds.
        // Icon + ONE span. .pq-verdict is display:flex, so leaving the prose loose
        // would make every text run and the <b> its own flex item and break the
        // sentence into columns — the same trap that broke .master-unlock.
        var head = right
          ? ic("check") + '<span class="pqv-txt"><b>Nailed it.</b> That is exactly the play.</span>'
          : ic("spark") + '<span class="pqv-txt"><b>That one catches a lot of people.</b> Here is the play:</span>';
        $("#pq-out", pq).innerHTML =
          '<div class="pq-verdict ' + (right ? "ok" : "no") + '">' + head + "</div>" +
          (right ? "" : '<div class="pq-answer"><em>The answer</em><span>' + esc(q.choices[q.answer]) + "</span></div>") +
          (q.why ? '<div class="pq-why">' + esc(q.why) + "</div>" : "") +
          '<div class="pq-next">' +
            '<a class="btn xl" href="#/course/' + course.slug + '">' +
              (right ? "Keep going" : "Learn this one") + " &mdash; " + esc(course.name) + " " + ic("arrow") + "</a>" +
            '<button class="linklike" type="button" data-scroll="courses">or pick a different product</button>' +
          "</div>";
        // Re-bind: the scroll link above is injected after renderHome wired the others.
        $$("[data-scroll]", pq).forEach(function (el) {
          el.addEventListener("click", function () { scrollToId(el.getAttribute("data-scroll")); });
        });
        // Swap the SVG inside a stable wrapper. Rewriting the <svg> tag itself would
        // give it two class attributes and the mood styling would silently stop.
        var og = $("#pq-og");
        // He starts on "think", so BOTH outcomes have to move him to something else
        // or the reaction reads as no reaction at all.
        if (og) { og.innerHTML = mascotSVG(right ? "proud" : "chill"); og.classList.add("pop"); }
        // Put the caret on the outcome that just appeared, the same way the real
        // quiz's result block does. Without this a keyboard rep is left on a button
        // that is now aria-disabled, with the verdict and CTA below them unread.
        var out = $("#pq-out", pq);
        if (out) { out.setAttribute("tabindex", "-1"); setTimeout(function () { out.focus(); }, 0); }
      });
    });
  }

  /* Returning rep: the hero IS the resume control. */
  function heroProgressHTML(done, total) {
    var s = getState();
    var open = COURSES.filter(function (c) { var r = s.courses[c.slug]; return r && !r.passed; })[0];
    var target = open || nextCourse(null);
    var pct = unlockPct(done);
    var pips = COURSES.map(function (c) {
      return '<a class="hp-pip' + (coursePassed(c.slug) ? " on" : "") + '" href="#/course/' + c.slug + '" title="' + esc(c.name) + '">' +
        (coursePassed(c.slug) ? ic("check") : "") + "<span>" + esc(c.name) + "</span></a>";
    }).join("");
    return '<section class="hero hero-prog reveal">' +
      '<div class="hero-in">' +
        '<span class="hero-eyebrow">' + ic("cap") + " Welcome back</span>" +
        '<h1 class="hero-h1">' + ogGreetingLine(done, total) + "</h1>" +
        '<div class="hp-bar" role="img" aria-label="' + done + " of " + total + ' courses certified"><i style="width:' + Math.round((done / total) * 100) + '%"></i></div>' +
        '<p class="hero-sub"><b>' + done + " of " + total + "</b> certified" +
          (pct ? ' &middot; one more unlocks <b class="gold">' + pct + "% off</b>" : "") + "</p>" +
        (target
          ? '<a class="btn xl hero-cta" href="#/course/' + target.slug + '">' +
              (open ? "Pick up where you left off" : "Start") + " &mdash; " + esc(target.name) + " " + ic("arrow") + "</a>"
          : "") +
        '<div class="hp-pips">' + pips + "</div>" +
      "</div>" +
    "</section>";
  }

  /* Fully certified: nothing left to sell them — hand over the goods.
     The code renders as an empty shell and is filled by fillHeroCode() through
     issueRewardCode(), which config.js documents as the ONLY place a code is
     minted. Reading TRAINING_CONFIG.discount.secret.code straight out of config
     here would work today and silently break the day the client swaps that
     function for the Shopify Admin API it is explicitly designed for: every other
     surface would show the rep's unique code and this one would still show the
     generic config string. */
  function heroDoneHTML(total) {
    return '<section class="hero hero-done reveal">' +
      '<div class="hero-in">' +
        '<span class="hero-eyebrow">' + ic("award") + " Certified G &middot; " + total + " of " + total + "</span>" +
        '<h1 class="hero-h1">' + ogGreetingLine(total, total) + "</h1>" +
        '<p class="hero-sub">Your top code is live on gpen.com.</p>' +
        '<button class="code hero-code" id="hero-code" hidden><span>••••••</span><em>' + ic("tag") + " Tap to copy</em></button>" +
        '<div class="hero-actions">' +
          '<a class="btn xl ghost" href="#/certified">View your certificate ' + ic("arrow") + "</a>" +
        "</div>" +
      "</div>" +
    "</section>";
  }

  /* Mint the certified hero's code the same way every other reward surface does.
     Stays hidden until a code actually comes back, so a misconfigured or failing
     issuer shows nothing rather than an empty dashed box promising a discount. */
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

  function heroHTML(done, total) {
    if (done >= total) return heroDoneHTML(total);
    var s = getState();
    var started = COURSES.some(function (c) { return s.courses[c.slug]; });
    if (done > 0 || started) return heroProgressHTML(done, total);
    return popQuizHTML() || heroProgressHTML(done, total);
  }

  /* ---- HOME (browse-first hub) ------------------------------------------- */
  function renderHome() {
    var e = getEnroll(), done = completedCount(), total = COURSES.length;

    app.innerHTML = header() +
      heroHTML(done, total) +

      // resumeStrip is gone from here: the progress hero above IS the resume control
      // now, and repeating it one section later was the same nudge twice.
      '<section class="hub reveal">' +
        '<div class="sec-h" id="courses"><h2>Learn the G Pen Lineup</h2></div>' +
        '<p class="catalog-lede">Take training courses on all of our current products.</p>' +
        lineupHTML() +
      "</section>" +

      // A single refined lifestyle moment — the gear in real hands, so the scale
      // and the vibe land before the reward story. Not a marquee; one editorial shot.
      lifestyleCinema((window.GPEN_LIFESTYLE || [])[0], "The G Pen life", "This is the gear, in real hands.", "Customers ask how it feels to hold. Know the answer.", "home") +
      floorDrill() +
      theLoop(done) +
      '<section class="signoff reveal"><div class="signoff-inner">' + ogSays("proud", "That&rsquo;s the whole lineup. You can&rsquo;t sell what you&rsquo;ve never held &mdash; now go run the floor.") + "</div></section>" +
      footer();

    fillRewards();
    bindPopQuiz();
    fillHeroCode();
    $$("[data-goto]").forEach(function (el) { el.addEventListener("click", function () { go("#/course/" + el.getAttribute("data-goto")); }); });
    $$("[data-scroll]").forEach(function (el) { el.addEventListener("click", function () { scrollToId(el.getAttribute("data-scroll")); }); });
    // (footer "Reset my progress" is bound globally in boot via bindReset — works on every page)
    revealOnScroll();
  }


  /* The Loop — the reward story, told exactly ONCE, below the product lineup.
     The collection is already signalled by the header pips and the ladder, so this
     is a single three-beat rail (learn → pass → discount) rather than the old
     step-cards plus binder teaser. Note the framing: the reward follows
     COMPLETING TRAINING, never selling. */
  function theLoop(done) {
    return '<section class="loop reveal">' +
      // The head is the MOTIVATION (why carry one yourself); the ladder below is the
      // MECHANIC. There used to be a numbered "Learn it -> Pass the quiz -> % off"
      // rail between them, which made this a third telling of the same three steps.
      // Deleted rather than reworded. (The masthead deck that used to carry the
      // first telling is gone too — the pop-quiz hero now demonstrates the mechanic
      // instead of describing it, and the ladder still gives the actual numbers.)
      '<div class="loop-head">' +
        "<h2>Get certified. Carry one yourself.</h2>" +
        '<p class="loop-sub">Customers trust the staff who actually use it. Put a G&nbsp;Pen in your pocket and you&rsquo;re the rec.</p>' +
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
  // A static editorial collage of real-people-using-product shots (masonry).
  function lifestyleMosaic(n, start) {
    var imgs = lifestyleImgs().slice(start || 0, (start || 0) + (n || 7));
    if (!imgs.length) return "";
    return '<div class="life-mosaic">' + imgs.map(function (u) {
      return '<figure class="lm-cell"><img src="' + esc(u) + '" alt="Real people using G Pen products" loading="lazy" decoding="async"/></figure>';
    }).join("") + "</div>";
  }
  // A full-width cinematic lifestyle band used as a divider / on course pages.
  function lifestyleCinema(img, eyebrow, line, sub, cls) {
    if (!img) return "";
    return '<section class="life-cinema reveal ' + (cls || "") + '" style="background-image:url(\'' + esc(img) + '\')">' +
      '<div class="lc-inner"><span class="lc-eyebrow">' + esc(eyebrow) + "</span><h2>" + esc(line) + "</h2>" +
      (sub ? '<p class="lc-sub">' + esc(sub) + "</p>" : "") +
    "</div></section>";
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
     product portal): 510 Batteries, Dry Herb Vaporizers, Concentrate. `match`
     buckets each course by its data.js category; groups with no products drop out. */
  var LINEUP_GROUPS = [
    // Retitled from "Dry Herb Vaporizers" when the Grinder joined it: the panel now
    // holds two vapes and an accessory, so the group name has to cover both. The
    // /Dry Herb/i match already picks up "Dry Herb Accessory" with no change.
    { key: "dryherb", title: "Dry Herb Accessories", sub: "Dry-herb vapes and the gear that feeds them", icon: "leaf", match: function (c) { return /Dry Herb/i.test(c.category); } },
    { key: "510", title: "510 Batteries", sub: "510-thread cartridge batteries", icon: "battery", match: function (c) { return /510/.test(c.category); } },
    { key: "concentrate", title: "Concentrate", sub: "Concentrate tools & accessories", icon: "drop", match: function (c) { return /Concentrate/i.test(c.category); } },
  ];
  function lineupHTML() {
    var panels = LINEUP_GROUPS.map(function (g) {
      var items = COURSES.filter(g.match);
      if (!items.length) return "";
      // ≤2 products pair up two-across on desktop so a small family doesn't span an empty row.
      var narrow = items.length <= 2 ? " fam-narrow" : "";
      return '<section class="famgroup fam-' + g.key + narrow + '">' +
          '<div class="fam-head">' +
            '<span class="fam-ic" aria-hidden="true">' + ic(g.icon) + "</span>" +
            '<h3 class="fam-name">' + esc(g.title) + "</h3>" +
            '<span class="fam-count">' + items.length + "</span>" +
            '<span class="fam-blurb">' + esc(g.sub) + "</span>" +
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
        (c.msrp ? '<span class="cc-price">' + esc(c.msrp) + ' <em>MSRP</em></span>' : "") +
        '<span class="cc-foot">' +
          (done ? '<span class="cc-status on">' + ic("check") + " Certified " + rec.score + "%</span>"
                : '<span class="cc-status">Not yet certified</span>') +
          '<span class="cc-go">' + (done ? "Review" : "Open") + " " + esc(c.name) + " " + ic("arrow") + "</span>" +
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
          '<span class="eyebrow cs-eyebrow">Questions about a product?</span>' +
          "<h2>Talk to our team.</h2>" +
          "<p>Our crew knows the hardware, not a script. Call or email when a customer&rsquo;s standing there with a device that won&rsquo;t hit, when you need a spec you can&rsquo;t remember, or when you want the straight answer before you say it out loud.</p>" +
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
      '<div class="foot-nav"><a href="#/">Products</a><a href="#/about">About G Pen</a><a href="' + esc(CFG.shopUrl) + '" target="_blank" rel="noopener">Shop gpen.com</a></div>' +
      (hasProgress ? '<button class="foot-reset" id="reset" type="button">' + ic("refresh") + " Reset my progress &amp; start over</button>" : "") +
      "<p>" + esc(CFG.programName) + " · " + esc(CFG.footerNote || "for authorized G Pen retail partners.") +
        " Program &amp; press: <a href=\"mailto:" + esc(CFG.contactEmail) + "\">" + esc(CFG.contactEmail) + "</a>" +
        (CFG.privacyUrl ? ' · <a href="' + esc(CFG.privacyUrl) + '" target="_blank" rel="noopener">Privacy</a>' : "") + "</p>" +
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
    var total = COURSES.length;                 // 5 = the full lineup
    var held = tierAt(done), up = nextTier(done);
    var top = LADDER[LADDER.length - 1];
    var head = !held ? "Pass one course to unlock your first code"
      : (up ? held.pct + "% off unlocked — " + (up.pct === top.pct ? "one more course for the top reward" : "keep certifying")
            : "Full lineup certified — the top reward is yours 👑");
    function need(n) { var d = n - done; return d + " more course" + (d === 1 ? "" : "s") + " to unlock"; }
    // Every rung but the last renders as a card; the top rung is the capstone.
    // The "N more courses to unlock" hint goes ONLY on the rung they are actually
    // climbing next. On every other rung it restates the requirement already in
    // rw-sub — at 0 done, "Pass any 1 course" and "1 more course to unlock" are the
    // same sentence twice, on all four cards, which is what a first-time rep saw.
    var rungs = LADDER.slice(0, -1).map(function (t) {
      var got = done >= t.at, isNext = !!up && up.at === t.at;
      return rewardCard(t.key, got, t.pct + "% OFF",
        t.at === 1 ? "Pass any 1 course" : "Pass any " + t.at + " courses",
        // ...and not at zero done, where "N more to unlock" is word-for-word the
        // requirement above it. The hint only earns its line once it is counting DOWN
        // from something. "Next up" plus the requirement is the whole story at zero.
        (isNext && done > 0) ? need(t.at) : "",
        got ? "Unlocked" : (isNext ? "Next up" : "Locked"));
    }).join("");
    return '<div class="sec-h"><h2>What you unlock</h2><span>' + head + "</span></div>" +
      '<p class="rw-terms-head">Rewards are for completing training. They are not tied to sales, orders, or product recommendations.</p>' +
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
        '<span class="rw-status">' + (unlocked ? (draw ? prizeCopy().statusOn : "Unlocked") : (draw ? "Grand prize" : "Top reward")) + "</span></div>" +
      '<div class="rw-big">' + (draw ? "FREE G PEN <em>+ " + topPct() + "%</em>" : topPct() + "% OFF") + "</div>" +
      '<div class="rw-sub">Certify all ' + total + " &mdash; " + (draw ? prizeCopy().rule + " " + topPct() + "% off is yours either way." : "your best code on gpen.com, plus the master certificate.") + "</div>" +
      (unlocked
        ? '<button class="rw-code" data-rwcode="secret"><span class="rw-code-v">••••••</span><em>' + ic("tag") + " Tap to copy</em></button>" +
          '<a class="rw-cert" href="#/certified">View master certificate &rarr;</a>' +
          // grandCard bypasses rewardCard, so it needs its own terms line.
          rwTermsHTML("secret")
        : (isNext ? '<div class="rw-lock">' + ic("spark") + " " + d + " more course" + (d === 1 ? "" : "s") + " to unlock</div>" : "")) +
    "</div>";
  }
  // "Whether it expires / stacks / is single-use" is the first thing a dispensary
  // partner asks — answer it wherever a code is shown, not just in the config.
  function rwTermsHTML(type) {
    var t = ((CFG.discount || {})[type] || {}).terms;
    return t ? '<p class="rw-terms">' + esc(t) + "</p>" : "";
  }
  /* Renders the CLIMBING rungs only. Its one caller maps LADDER.slice(0, -1), which
     drops the last rung — the only one keyed "secret" — so the capstone never comes
     through here; grandCard() draws that, with the master-certificate link and the
     gold treatment. The old isSecret branches in this function were therefore
     unreachable in every state. */
  function rewardCard(type, unlocked, big, sub, lockMsg, status) {
    if (unlocked) lockMsg = "";
    return '<div class="rw-card ' + (unlocked ? "on" : "off") + '">' +
      '<div class="rw-top"><span class="rw-ic">' + ic(unlocked ? "tag" : "lock") + '</span><span class="rw-status">' + esc(status || (unlocked ? "Unlocked" : "Locked")) + "</span></div>" +
      '<div class="rw-big">' + big + "</div>" +
      '<div class="rw-sub">' + sub + "</div>" +
      (unlocked
        ? '<button class="rw-code" data-rwcode="' + type + '"><span class="rw-code-v">••••••</span><em>' + ic("tag") + " Tap to copy</em></button>" +
          '<a class="rw-shop" href="' + esc(CFG.shopUrl) + '" target="_blank" rel="noopener">Shop gpen.com ' + ic("arrow") + "</a>" +
          rwTermsHTML(type)
        // No hint on a rung they are not climbing yet — the lock icon, the dimmed
        // .off treatment and the "Locked" status already carry it. An empty rw-lock
        // would render as a stray bullet icon with no text.
        : (lockMsg ? '<div class="rw-lock">' + ic("lock") + " " + lockMsg + "</div>" : "")) +
    "</div>";
  }
  function copyText(text, okMsg) {
    sfx.play("copy");
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { toast(okMsg); }, function () { toast(text); });
    else toast(text);
  }
  function copyCode(code) { copyText(code, "Code copied — " + code); }
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
  function renderCourse(slug) {
    var c = courseBySlug(slug); if (!c) return go("#/");
    var s = getState(), rec = s.courses[c.slug];
    setTitleDoc(c.name + " — Training");

    var hero = c.heroImg || c.cover;
    var descHTML = (Array.isArray(c.description) ? c.description : [c.description]).map(function (p) { return "<p>" + p + "</p>"; }).join("");
    var n = 0;
    app.innerHTML = header() +
      '<section class="course reveal">' +
        '<a class="back" href="#/">' + ic("back") + " All courses</a>" +
        '<div class="cx-hero' + (c.heroImg ? "" : " no-life") + '" style="--accent:' + c.accent + '">' +
          // Full-bleed banner, so ask for a wider source than the card thumbs.
          '<div class="cx-hero-media"><img src="' + esc(sized(hero, 760)) + '" alt="' + esc(c.name) + '" loading="eager"/></div>' +
          '<div class="cx-hero-body">' +
            '<span class="ch-eyebrow">' + ic("cap") + " Product Specialist Course" + (rec && rec.passed ? ' · <b class="ch-done">' + ic("check") + " Certified</b>" : "") + "</span>" +
            "<h1>" + esc(c.name) + "</h1>" +
            '<span class="cx-cat">' + esc(c.category) + " · " + esc(c.msrp) + "</span>" +
            "<p>" + esc(c.tagline) + "</p>" +
            // Accessory courses can legitimately have no video yet, so the count is
            // omitted rather than printed as "0 videos", and the array is never
            // dereferenced blind.
            '<div class="ch-meta">' + ((c.videos && c.videos.length) ? c.videos.length + " videos · " : "") + c.quiz.length + " questions · " + c.passPct + "% to pass · ~" + c.minutes + " min</div>" +
          "</div>" +
        "</div>" +

        // SELLING LEADS. The battlecard is the only floor-usable asset here and it
        // used to sit below ~8 minutes of video, a gallery, an 11-row spec table,
        // cleaning steps and an FAQ. Moving it up also makes it the advance
        // organizer these courses lacked, and puts the memorable floor facts ahead
        // of the spec dump instead of after it.
        (c.howToSell && c.howToSell.keyFacts && c.howToSell.keyFacts.length
          ? secHead(++n, "Know these three cold") + floorFactsHTML(c) : "") +

        (c.howToSell ? secHead(++n, "How to sell it") + howToSellHTML(c) : "") +

        (c.videos && c.videos.length
        ? secHead(++n, "Watch the tape") +
        '<div class="vid-grid">' + c.videos.map(function (v) {
          return '<button class="vid" data-yt="' + esc(v.youtube || "") + '" data-title="' + esc(v.title) + '">' +
            '<span class="vid-thumb"><img src="' + esc(v.thumb) + '" alt="" loading="lazy"/><span class="vid-play">' + ic("play") + "</span></span>" +
            '<span class="vid-title">' + esc(v.title) + "</span></button>";
        }).join("") + "</div>"
        : "") +

        secHead(++n, "What it is") +
        '<div class="prose">' + descHTML + "</div>" +
        (c.highlights && c.highlights.length ? '<ul class="hl-list">' + c.highlights.map(function (h) { return "<li>" + ic("check") + "<span>" + esc(h) + "</span></li>"; }).join("") + "</ul>" : "") +
        galleryHTML(c) +
        lifestyleCinema(productLifeImg(c.slug, c.heroImg), "In the wild", "The " + c.name + " out in the world.") +

        (c.howToUse && c.howToUse.length ? secHead(++n, "How to use it") + stepListHTML(c.howToUse) : "") +
        (c.howToClean && c.howToClean.length ? secHead(++n, "How to clean it") + stepListHTML(c.howToClean) : "") +
        (c.specs && c.specs.length ? secHead(++n, "Tech specs") + specTableHTML(c.specs) : "") +
        (c.faq && c.faq.length ? secHead(++n, "Questions you&rsquo;ll get") + faqHTML(c.faq) : "") +
        factCard() +

        // Heading and intro follow the same branch as the zone below them. They used
        // to be unconditional, so an already-certified course still headed this
        // section "Get certified" and had the Dean ask if you were ready for the quiz,
        // directly above your own certificate.
        secHead(++n, rec && rec.passed ? "Your certificate" : "Get certified") +
        (rec && rec.passed ? "" : ogSays("think", ogLine("quizIntro"))) +
        '<div id="quiz-zone"></div>' +
      "</section>" +
      // Promise the tier they'd actually hold after this course, not a flat 25%.
      (rec && rec.passed ? "" : '<button class="sticky-cta" id="sticky-cta">' + ic("cap") + " Get certified" + (unlockPct(completedCount()) ? " · <b>" + unlockPct(completedCount()) + "% off</b>" : "") + "</button>") +
      footer();

    bindVideos();
    bindFaq();
    renderQuizIntro(c);
    bindStickyCta();
    revealOnScroll();
  }
  function bindStickyCta() {
    if (stickyHandler) { window.removeEventListener("scroll", stickyHandler); stickyHandler = null; }
    var scta = $("#sticky-cta"); if (!scta) return;
    scta.addEventListener("click", function () { scrollToId("quiz-zone"); });
    var qz = $("#quiz-zone");
    // Scroll-based (reliable everywhere): show once past the hero, hide when the
    // certify section is on screen.
    stickyHandler = function () {
      var cta = $("#sticky-cta"); if (!cta) return;
      var qzTop = qz ? qz.getBoundingClientRect().top : 1e9;
      cta.classList.toggle("show", window.scrollY > 220 && qzTop > window.innerHeight - 100);
    };
    window.addEventListener("scroll", stickyHandler, { passive: true });
    stickyHandler();
    setTimeout(stickyHandler, 500);
  }
  function secHead(n, t) { return '<div class="sec-h big"><span class="sec-n">' + n + "</span><h2>" + t + "</h2></div>"; }
  /* The sales battlecard. A rep should be able to scan it in seconds and read
     the "say this" lines out loud verbatim. Fixed block order so muscle memory
     builds: trigger → 3 facts → talk track → which-one close → objections → AOV. */
  /* The three facts a rep should be able to say without looking. Same keyFacts
     the battlecard reuses as chips further down — the repetition is the point:
     this block is the advance organizer, the chips are the recall check. */
  function floorFactsHTML(c) {
    var facts = (c.howToSell && c.howToSell.keyFacts) || [];
    if (!facts.length) return "";
    return '<div class="floorfacts">' + facts.map(function (t, i) {
      return '<div class="ff-card"><span class="ff-n" aria-hidden="true">' + (i + 1) + "</span><p>" + esc(t) + "</p></div>";
    }).join("") + "</div>";
  }
  function howToSellHTML(c) {
    var h = c.howToSell; if (!h) return "";
    var facts = (h.keyFacts || []).map(function (f) {
      return '<span class="sell-fact">' + esc(f) + "</span>";
    }).join("");
    var sibs = (h.pairsWith || []).map(function (sl) {
      var sc = courseBySlug(sl);
      return sc ? '<a class="sell-sib" href="#/course/' + sl + '" style="--accent:' + sc.accent + '">' + esc(sc.name) + "</a>" : "";
    }).join("");
    var objs = (h.objections || []).map(function (o) {
      return '<div class="obj-card">' +
        '<div class="obj-says"><em>They say</em><span>&ldquo;' + esc(o.says) + '&rdquo;</span></div>' +
        '<div class="obj-say"><em>You say</em><span>' + esc(o.say) + "</span></div>" +
        (o.why ? '<div class="obj-why">' + ic("spark") + "<span>" + esc(o.why) + "</span></div>" : "") +
      "</div>";
    }).join("");
    // "On the floor" — real-world register scenarios: what you SEE → what you say.
    var sces = (h.scenarios || []).map(function (s) {
      return '<div class="scn"><em>You see</em>' +
        '<span class="scn-sees">' + esc(s.sees) + "</span>" +
        '<span class="scn-say">&ldquo;' + esc(s.say) + "&rdquo;</span></div>";
    }).join("");
    return '<div class="sell2" style="--accent:' + (c.accent || "var(--gold-bright)") + '">' +
      '<div class="sell-pair">' +
        '<div class="sell-cue"><span class="sell-cue-em">' + esc(h.cue || "") + "</span>When they're buying <b>" + esc((h.upsellFrom || "").toUpperCase()) + "</b> " + ic("arrow") + "</div>" +
        "<p>" + esc(h.vital) + "</p>" +
        (sibs ? '<div class="sell-sibs"><span>Pair with</span>' + sibs + "</div>" : "") +
      "</div>" +
      (h.trap ? '<p class="sell-trap">' + ic("spark") + "<span><b>The trap:</b> " + esc(h.trap) + "</span></p>" : "") +
      (facts ? '<div class="sell-facts">' + facts + "</div>" : "") +
      (h.talkTrack && h.talkTrack.say ? '<blockquote class="sell-say"><em>Say this</em>&ldquo;' + esc(h.talkTrack.say) + "&rdquo;</blockquote>" : "") +
      (sces ? '<div class="sell-scns"><h4>On the floor</h4>' + sces + "</div>" : "") +
      (h.whichClose ? '<div class="sell-close"><em>The &ldquo;which one&rdquo; close</em>&ldquo;' + esc(h.whichClose) + "&rdquo;</div>" : "") +
      (objs ? '<div class="sell-objs"><h4>When they hesitate</h4>' + objs + "</div>" : "") +
      (h.aov ? '<p class="sell-aov">' + ic("tag") + "<span>" + esc(h.aov) + "</span></p>" : "") +
    "</div>";
  }
  function galleryHTML(c) {
    if (!c.gallery || !c.gallery.length) return "";
    return '<div class="gallery">' + c.gallery.map(function (g) {
      return '<figure class="ga-item"><img src="' + esc(sized(g.url, 320)) + '" alt="' + esc(g.caption || c.name) + '" loading="lazy"/>' +
        (g.caption ? '<figcaption>' + esc(g.caption) + "</figcaption>" : "") + "</figure>";
    }).join("") + "</div>";
  }
  function specTableHTML(specs) {
    return '<div class="spectable">' + specs.map(function (sp) {
      return '<div class="spec-row"><span class="spec-k">' + esc(sp.label) + '</span><span class="spec-v">' + sp.value + "</span></div>";
    }).join("") + "</div>";
  }
  function stepListHTML(steps) {
    return '<ol class="steps-list">' + steps.map(function (st, i) {
      return '<li><span class="sl-n">' + (i + 1) + "</span><span>" + st + "</span></li>";
    }).join("") + "</ol>";
  }
  function faqHTML(faq) {
    return '<div class="faq">' + faq.map(function (f, i) {
      return '<div class="faq-item"><button class="faq-q" data-faq="' + i + '" aria-expanded="false" aria-controls="faq-a-' + i + '"><span>' + esc(f.q) + '</span><span class="faq-caret" aria-hidden="true">+</span></button>' +
        '<div class="faq-a" id="faq-a-' + i + '"><p>' + esc(f.a) + "</p></div></div>";
    }).join("") + "</div>";
  }
  function bindFaq() {
    $$(".faq-q").forEach(function (b) {
      b.addEventListener("click", function () {
        var open = b.closest(".faq-item").classList.toggle("open");
        b.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  function bindVideos() {
    $$(".vid").forEach(function (b) {
      b.addEventListener("click", function () {
        var yt = b.getAttribute("data-yt"); if (!yt) { toast("Video coming soon"); return; }
        openVideo(yt, b.getAttribute("data-title"));
      });
    });
  }
  function openVideo(yt, title) {
    var m = document.createElement("div"); m.className = "modal";
    m.innerHTML = '<div class="modal-in"><button class="modal-x" aria-label="Close">×</button>' +
      '<div class="modal-frame"><iframe src="https://www.youtube.com/embed/' + esc(yt) + '?autoplay=1&rel=0" title="' + esc(title) + '" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe></div>' +
      '<div class="modal-t">' + esc(title) + "</div></div>";
    document.body.appendChild(m); document.body.classList.add("noscroll");
    var release = manageModalFocus(m, title ? "Video: " + title : "Video");
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
      '<div class="result pass"><div class="result-score">' + rec.score + '%<span>certified</span></div>' +
        "<h3>" + ic("check") + " You're a certified " + esc(c.name) + " Specialist</h3>" +
        "<p>Certificate earned " + esc(rec.date) + ". Grab your certificate and discount code below — or retake the quiz to refresh your score.</p>" +
        '<button class="btn ghost" id="retake">' + ic("refresh") + " Retake quiz</button>" +
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
        "<h3>" + (owned ? "Retake the quiz" : "Get certified" + (pct ? " &amp; unlock " + pct + "% off" : "")) + "</h3>" +
        '<p class="lead">' + (owned
          ? "Retake the " + c.quiz.length + "-question quiz (score " + c.passPct + "%+) to refresh your score on your <strong>" + esc(c.name) + "</strong> certificate. Your discount code is unchanged."
          : "Score " + c.passPct + "%+ on the " + c.quiz.length + "-question quiz to earn your <strong>" + esc(c.name) + "</strong> Product Specialist certificate and a gpen.com discount code. Spell your name the way you want it printed on the certificate.") + "</p>" +
        '<div class="certify-form">' +
          field("name", "Your full name", "text", e.name, "Jane Budtender", "name") +
          field("email", "Email address", "email", e.email, "you@store.com", "email") +
          field("store", "Store / shop name", "text", e.store, "Cloud 9 Smoke Shop", "organization") +
          // Never pre-checked: the attestation is per person, and on a shared
          // counter tablet an inherited tick would attest for someone else.
          '<label class="attest"><input type="checkbox" id="f-attest" />' +
            "<span>I confirm I am 21 or older and currently work as authorized retail staff at a licensed dispensary or smoke shop.</span></label>" +
          '<button class="btn xl full" id="start-quiz">Start the quiz ' + ic("arrow") + "</button>" +
          /* ONE unconditional disclosure, deliberately not branched on whether a
             webhook is configured yet. The old copy reassured reps that data
             "saves to this browser only" until a store "enables" reporting —
             wrong twice over: reporting is a single global setting G Pen
             controls, not a per-store one, and boot()'s backfill is RETROACTIVE,
             so anyone who certified under that reassurance would have had their
             details sent the moment a webhook was pasted, with no re-consent.
             Everyone now agrees to the same thing up front. */
          '<p class="form-fine"><b>Use your own phone</b> — progress and certificates save to this browser, so a shared tablet mixes reps together. ' +
            "Your name, email and store are recorded so G&nbsp;Pen can credit the completion to your shop, and may be sent to G&nbsp;Pen for that purpose." +
            (CFG.privacyUrl ? ' <a href="' + esc(CFG.privacyUrl) + '" target="_blank" rel="noopener">Privacy</a>.' : "") + "</p>" +
        "</div>" +
      "</div>";
    $("#start-quiz").addEventListener("click", function () {
      var name = $("#f-name").value.trim(), email = $("#f-email").value.trim(), store = $("#f-store").value.trim();
      if (!name) { toast("Enter your name for the certificate"); $("#f-name").focus(); return; }
      if (!email || email.indexOf("@") < 0) { toast("Enter a valid email"); $("#f-email").focus(); return; }
      if (!store) { toast("Enter your store name"); $("#f-store").focus(); return; }
      if (!$("#f-attest").checked) { toast("Please confirm you're 21+ and retail staff"); $("#f-attest").focus(); return; }
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
        var who = (prev.name || "someone else") + (sameId(prev.name, name) && prev.email ? " (" + prev.email + ")" : "");
        if (!confirm("This device is signed in as " + who + ".\n\nContinuing as " + name + " will clear " + (prev.name || "their") + "'s progress on this device" +
            (n ? " — including " + n + " course certificate" + (n === 1 ? "" : "s") : "") + ". This can't be undone.\n\nContinue as " + name + "?")) return;
        localStorage.removeItem(K_STATE);
      }
      setEnroll({ name: name, email: email, store: store, attest21: true, attestedAt: new Date().toISOString(), ts: (!handover && prev && prev.ts) || new Date().toISOString() });
      if (!prev || handover) logEvent("enroll", { name: name, email: email, store: store });
      runQuiz(c);
    });
  }
  function runQuiz(c) {
    var order = shuffle(c.quiz.map(function (_, i) { return i; }));
    var i = 0, answers = [], streak = 0, points = 0, zone = $("#quiz-zone");
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
        '<div class="quiz-count"><span class="qc-num">Question ' + (i + 1) + " of " + c.quiz.length + "</span>" +
          (streak >= 2 ? '<span class="quiz-streak">' + ic("fire") + " ×" + Math.min(streak, 5) + " combo</span>" : "") +
          '<span class="quiz-score">' + ic("spark") + ' <b id="qscore">' + points + "</b> pts</span></div>" +
        '<div class="quiz-q">' + esc(q.q) + "</div>" +
        // Choices render in a shuffled order, but data-ci keeps each choice's
        // ORIGINAL index so the answer check (ci === q.answer) is unaffected.
        '<div class="quiz-choices">' + shuffle(q.choices.map(function (_, ci) { return ci; })).map(function (ci, pos) {
          return '<button class="choice" data-ci="' + ci + '"><span class="ch-key">' + String.fromCharCode(65 + pos) + "</span><span>" + esc(q.choices[ci]) + "</span></button>";
        }).join("") + "</div>" +
        '<div class="quiz-why" hidden></div>' +
        '<button class="btn xl next" id="q-next" hidden></button>' +
      "</div>";
      $$(".choice", zone).forEach(function (b) { b.addEventListener("click", function () { choose(parseInt(b.getAttribute("data-ci"), 10), q, b); }); });
      // "instant", not "auto": auto defers to CSS, and html{scroll-behavior:smooth}
      // would animate the jump to each new question — a long, sluggish glide on a
      // tall desktop page. Advancing a question should snap; only the explainer
      // reveal in choose() is worth animating.
      if (!first) zone.scrollIntoView({ behavior: "instant", block: "start" });
    }
    // A correct answer flings its points up from the tapped choice.
    function flyPoints(gain, mult, btn) {
      var quiz = $(".quiz", zone); if (!quiz) return;
      var qr = quiz.getBoundingClientRect(), br = btn.getBoundingClientRect();
      var fly = document.createElement("div");
      fly.className = "pt-fly";
      fly.innerHTML = "+" + gain + (mult > 1 ? '<em>×' + mult + "</em>" : "");
      fly.style.left = (br.left - qr.left + br.width / 2) + "px";
      fly.style.top = (br.top - qr.top + 6) + "px";
      quiz.appendChild(fly);
      setTimeout(function () { fly.remove(); }, 1100);
    }
    function bumpScore() {
      var el = $("#qscore", zone); if (!el) return;
      el.textContent = points; el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
    }
    function choose(ci, q, btn) {
      if (answers[i] != null) return;
      answers[i] = ci;
      var correct = ci === q.answer;
      if (correct) {
        streak += 1;
        var mult = Math.min(streak, 5), gain = 100 * mult;
        points += gain; flyPoints(gain, mult, btn); bumpScore();
        sfx.play(streak >= 3 ? "combo" : "correct");
      } else { streak = 0; sfx.play("wrong"); }
      $$(".choice", zone).forEach(function (b) {
        var bci = parseInt(b.getAttribute("data-ci"), 10);
        b.disabled = true;
        // Right/wrong was carried by colour alone. Label it for anyone who can't
        // use colour, and for screen readers reading back the options.
        if (bci === q.answer) { b.classList.add("correct"); b.setAttribute("aria-label", b.textContent.trim() + " — correct answer"); }
        else if (bci === ci) { b.classList.add("wrong"); b.setAttribute("aria-label", b.textContent.trim() + " — your answer, incorrect"); }
      });
      var why = $(".quiz-why", zone); why.hidden = false;
      why.className = "quiz-why " + (correct ? "ok" : "no");
      // The verdict was carried by colour and a RANDOMISED quip, and was never
      // announced. role=status makes the explainer speak, and the fixed word in
      // front of the quip means the verdict never depends on which line came up.
      why.setAttribute("role", "status");
      why.setAttribute("aria-live", "polite");
      // Professor O.G. reacts to every answer, then explains.
      why.innerHTML = ogMini(correct ? "hyped" : "oops") +
        '<span class="qw-text"><b class="qw-verdict">' + (correct ? "Correct." : "Incorrect.") + "</b> " +
        '<strong>' + (correct ? ic("check") + " " + ogLine("correct") : ogLine("wrong")) + "</strong> " +
        (correct && streak >= 3 ? '<span class="streak-pop">' + ic("fire") + " ×" + Math.min(streak, 5) + " combo!</span> " : "") + esc(q.why) + "</span>";
      var n = $("#q-next", zone); n.hidden = false;
      n.innerHTML = (i + 1 < c.quiz.length ? "Next question " + ic("arrow") : "See my results " + ic("arrow"));
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
      if (!passed) return quizFail(c, correct, pct, points, order, answers);
      quizPass(c, correct, pct, points, order, answers);
    }
  }
  // Letter grade for the results screen — a little arcade payoff.
  function gradeFor(pct) {
    if (pct >= 100) return { g: "A+", label: "Flawless victory" };
    if (pct >= 90) return { g: "A", label: "Certified genius" };
    if (pct >= 80) return { g: "B", label: "Solid work" };
    if (pct >= 70) return { g: "C", label: "So close" };
    if (pct >= 60) return { g: "D", label: "Almost there" };
    return { g: "F", label: "Run it back" };
  }
  function gradeHTML(pct, points) {
    var gr = gradeFor(pct);
    return '<div class="grade-card g-' + gr.g.charAt(0) + '">' +
      '<span class="grade-big">' + gr.g + "</span>" +
      '<span class="grade-meta"><b>' + esc(gr.label) + "</b>" +
        (points != null ? '<em>' + ic("spark") + " " + points.toLocaleString() + " pts</em>" : "") + "</span>" +
    "</div>";
  }
  function quizFail(c, correct, pct, points, order, answers) {
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
      '<div class="result-score">' + pct + '%<span>' + correct + " of " + c.quiz.length + " correct</span></div>" +
      "<h3>Not passed</h3><p>You needed " + c.passPct + "% to pass and were " + away + " question" + (away === 1 ? "" : "s") + " short. Review the answers below, then try again.</p>" +
      '<button class="btn xl" id="retry">' + ic("refresh") + " Retake the quiz</button>" +
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
  /* The floating "Get certified · N% off" CTA is rendered only when the course is not
     yet passed, but quizPass replaces just #quiz-zone — the button and its live scroll
     handler are outside it and survived. So the moment a rep certified, scrolling back
     up the course page still floated a CTA selling them a tier they now hold (or, at
     5/5, a 25% first rung they are years past). It belongs to the un-certified state,
     so retire it the instant that state ends. */
  function retireStickyCta() {
    if (stickyHandler) { window.removeEventListener("scroll", stickyHandler); stickyHandler = null; }
    var el = $("#sticky-cta"); if (el) el.remove();
  }
  function quizPass(c, correct, pct, points, order, answers) {
    retireStickyCta();
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
      : (improved ? " This is your best score so far."
                  : " Your best score of " + rec.score + "% remains on your certificate.");
    var next = firstTime && !master ? nextCourse(c.slug) : null;
    var zone = $("#quiz-zone");
    zone.innerHTML = '<div class="result pass" tabindex="-1" role="status" aria-live="polite">' +
        '<div class="result-score">' + pct + '%<span>' + correct + " of " + c.quiz.length + " correct</span></div>" +
        "<h3>" + ic("check") + " Passed</h3>" +
        "<p>You are certified on the <strong>" + esc(c.name) + "</strong>." + progNote + "</p>" +
      "</div>" +
      '<div id="cert-zone"></div>' +
      '<div id="reward-zone" class="reward-wrap"></div>' +
      missedReviewHTML(c, order, answers) +
      // The prose is wrapped in ONE span on purpose. .master-unlock is display:flex,
      // so without it every text run and every <strong> became its own flex item on a
      // single un-wrapped line — the banner for the biggest moment in the app rendered
      // as a row of squeezed one-word columns. Three items now: icon, text, arrow.
      (master ? '<a class="master-unlock" href="#/certified">' + ic("award") +
                  '<span class="mu-txt">All products complete. Open your certificate and your <strong>' + topPct() + "% discount code</strong>.</span>" + ic("arrow") + "</a>"
              : next ? '<a class="btn xl nextup-cta" href="#/course/' + next.slug + '">Next product: ' + esc(next.name) + " " + ic("arrow") + "</a>" +
                       '<a class="linklike backdash" href="#/">Back to all products</a>'
              : '<a class="btn ghost xl backdash" href="#/">Back to all products ' + ic("arrow") + "</a>");
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
        '<div class="reward-eyebrow">' + (type === "secret" ? "Top reward unlocked — full lineup" : (type === "course" ? "Reward unlocked" : "New tier unlocked")) + "</div>" +
        "<h3>" + esc(r.label) + "</h3>" +
        '<button class="code" id="code-copy" title="Copy code"><span>' + esc(r.code) + '</span><em>Tap to copy</em></button>' +
        "<p>" + esc(r.note || "") + "</p>" +
        '<a class="btn xl" href="' + esc(CFG.shopUrl) + '" target="_blank" rel="noopener">Shop gpen.com ' + ic("arrow") + "</a>" +
        '<p class="reward-terms">' + (r.terms ? esc(r.terms) + " " : "") + "Earned by completing training — not tied to sales, orders, or product recommendations.</p>" +
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
          '<div class="cert-eyebrow">G Pen · Product Specialist Program</div>' +
          '<h3 class="cert-award">Certificate of Completion</h3>' +
          '<div class="cert-presented">This certifies that</div>' +
          '<div class="cert-name">' + esc(nm) + "</div>" +
          '<div class="cert-desc">has successfully completed the Product Specialist training and demonstrated expert product knowledge of the</div>' +
          '<div class="cert-product">' + esc(product) + "</div>" +
          sealHTML(pct, "PRODUCT SPECIALIST") +
          '<div class="cert-foot">' +
            '<div class="cert-fcol"><span class="cert-fv">' + esc(date) + '</span><span class="cert-fl">Date Issued</span></div>' +
            '<div class="cert-fcol"><span class="cert-fv cert-sig">Grenco Science</span><span class="cert-fl">Authorized By</span></div>' +
            '<div class="cert-fcol"><span class="cert-fv">' + esc(cid) + '</span><span class="cert-fl">Certificate ID</span></div>' +
          "</div>" +
        "</div>" +
      "</div>" +
      '<div class="cert-actions">' +
        '<button class="btn" id="cert-print">' + ic("print") + " Print certificate</button>" +
        '<button class="btn ghost" id="cert-dl">' + ic("dl") + " Download image</button>" +
        '<button class="btn gold" id="cert-ig">' + ic("share") + " Save for IG story</button>" +
        '<button class="btn ghost" id="cert-mail">' + ic("mail") + " Email it</button>" +
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

  /* =========================================================================
     SAVE A CARD AS AN IMAGE
     Renders the trading card to a 1080x1500 canvas so it can be posted. The
     product photos come from the Shopify CDN, which is CORS-clean, so the
     canvas stays untainted and toBlob() works.


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
      '<span class="sw-eyebrow">' + ic("spark") + " Full lineup certified</span>" +
      '<h2 class="sw-h">' + p.headline + " 🦉</h2>" +
      '<p class="sw-body">' + p.rule + " We&rsquo;ll email you if it&rsquo;s you. Either way your <b>" + topPct() + "% off</b> is live today &mdash; grab one, put it in your pocket, and let &ldquo;this is the one I use&rdquo; close the sale.</p>" +
      '<div class="sw-actions">' +
        '<button class="btn xl sw-copy">' + ic("tag") + " Copy your " + topPct() + "% code</button>" +
        '<a class="btn xl ghost" href="' + esc(CFG.shopUrl) + '" target="_blank" rel="noopener">Shop &amp; test on gpen.com ' + ic("arrow") + "</a>" +
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
        '<a class="back" href="#/">' + ic("back") + " All courses</a>" +
        '<div class="master-hero">' + ic("award") +
          "<h1>You're Certified G</h1>" +
          "<p>Congratulations, " + esc(e.name.split(" ")[0]) + " — you've completed every course in " + esc(CFG.programName) + " and are officially a <strong>fully trained G Pen Product Specialist</strong>. You know the whole lineup cold.</p>" +
        "</div>" +
        ogSays("proud", ogLine("done")) +
        (drawLive() ? sweepsPanelHTML(e) : "") +
        '<div id="mcert"></div>' +
        '<div id="mreward" class="reward-wrap"></div>' +
      "</section>" + footer();

    // master certificate (no % — it's a program completion)
    var box = $("#mcert"), product = "Certified G";
    box.innerHTML =
      '<div class="cert master" id="cert-card"><div class="cert-inner">' +
        '<div class="cert-logo"><img src="assets/img/gpen-g-black.png" alt="G Pen"/></div>' +
        '<div class="cert-eyebrow">G Pen · ' + esc(CFG.programName) + "</div>" +
        '<h3 class="cert-award">Certified G</h3>' +
        '<div class="cert-presented">This certifies that</div>' +
        '<div class="cert-name">' + esc(e.name) + "</div>" +
        '<div class="cert-desc">has completed every Product Specialist course and is recognized as a</div>' +
        '<div class="cert-product">Fully Trained G Pen Product Specialist</div>' +
        sealHTML(0, "PRODUCT SPECIALIST") +
        '<div class="cert-foot">' +
          '<div class="cert-fcol"><span class="cert-fv">' + esc(date) + '</span><span class="cert-fl">Date Issued</span></div>' +
          '<div class="cert-fcol"><span class="cert-fv cert-sig">Grenco Science</span><span class="cert-fl">Authorized By</span></div>' +
          '<div class="cert-fcol"><span class="cert-fv">' + esc(cid) + '</span><span class="cert-fl">Certificate ID</span></div>' +
        "</div>" +
      "</div></div>" +
      '<div class="cert-actions">' +
        '<button class="btn" id="cert-print">' + ic("print") + " Print certificate</button>" +
        '<button class="btn ghost" id="cert-dl">' + ic("dl") + " Download image</button>" +
        '<button class="btn gold" id="cert-ig">' + ic("share") + " Save for IG story</button>" +
        '<button class="btn ghost" id="cert-mail">' + ic("mail") + " Email it</button>" +
      "</div>";
    $("#cert-print").addEventListener("click", printCert);
    $("#cert-dl").addEventListener("click", function () { downloadCertificate("G Pen Certified Specialist", e.name, date, 0, cid, "CERTIFIED G"); });
    $("#cert-mail").addEventListener("click", function () {
      var body = "I'm now a G Pen Certified Specialist!\n\nName: " + e.name + "\nStore: " + (e.store || "") + "\nEmail: " + (e.email || "") + "\nDate: " + date + "\nCertificate ID: " + cid;
      window.location.href = "mailto:" + CFG.contactEmail + "?subject=" + encodeURIComponent("G Pen Certified Specialist") + "&body=" + encodeURIComponent(body);
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
      confetti();
    }
    revealOnScroll();
  }

  /* ---- ABOUT G PEN ------------------------------------------------------- */
  function renderAbout() {
    var a = window.GPEN_ABOUT || {};
    var e = getEnroll();
    setTitleDoc("About G Pen");
    var founding = (Array.isArray(a.foundingStory) ? a.foundingStory : [a.foundingStory || ""]).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    app.innerHTML = header() +
      '<section class="about reveal">' +
        '<a class="back" href="#/">' + ic("back") + " Home</a>" +
        '<div class="about-hero">' +
          '<img class="about-g" src="assets/img/gpen-g-white.png" alt="G Pen"/>' +
          '<span class="ch-eyebrow">' + ic("cap") + " About the brand</span>" +
          // Derived, not hardcoded: this h1 said "15 years" while the stat tile
          // directly below it said "14+" — a contradiction on one screen. Both
          // now come from the founding year, so they cannot drift or go stale.
          "<h1>" + brandYears() + " years of leading the culture.</h1>" +
          "<p>" + esc(a.intro || "") + "</p>" +
        "</div>" +
        (a.stats ? '<div class="about-stats">' + a.stats.map(function (s) { return '<div class="astat"><strong>' + esc(s.number) + "</strong><span>" + esc(s.label) + "</span></div>"; }).join("") + "</div>" : "") +
        lifestyleMosaic(7, 0) +
        '<div class="about-block"><h2>Our story</h2>' + founding + "</div>" +
        (a.milestones ? '<div class="about-block"><h2>Milestones</h2><ol class="timeline">' + a.milestones.map(function (m) {
          return '<li><span class="tl-year">' + esc(m.year) + "</span><span class=\"tl-dot\"></span><p>" + esc(m.text) + "</p></li>";
        }).join("") + "</ol></div>" : "") +
        (a.collaborations ? '<div class="about-block"><h2>Iconic collaborations</h2><p class="lead">G Pen has partnered with some of the biggest names in music and cannabis:</p><div class="collabs">' +
          a.collaborations.map(function (c) { return '<span class="collab">' + esc(c) + "</span>"; }).join("") + "</div>" +
          "</div>" : "") +
        (a.globalReach ? '<div class="about-block glob"><h2>A global brand</h2><p>' + esc(a.globalReach) + "</p></div>" : "") +
        (a.social ? '<div class="about-block"><h2>Join the movement</h2>' +
          (a.socialPitch ? '<p class="lead">' + esc(a.socialPitch) + "</p>" : "") +
          '<div class="social-grid">' + a.social.map(function (sc) {
            return '<a class="social-card" href="' + esc(sc.url) + '" target="_blank" rel="noopener">' +
              '<span class="soc-net">' + esc(sc.network) + "</span>" +
              (sc.stat ? '<span class="soc-stat">' + esc(sc.stat) + "</span>" : "") +
              '<span class="soc-label">' + esc(sc.label || "") + "</span>" +
              '<span class="soc-handle">' + esc(sc.handle) + " " + ic("arrow") + "</span>" +
            "</a>";
          }).join("") + "</div></div>" : "") +
        factCard() +
        '<div class="about-close">' + ic("tag") + "<p>" + esc(a.closing || "") + "</p></div>" +
        '<a class="btn xl center-btn" href="#/">' + (e ? "Back to my courses" : "Browse courses") + " " + ic("arrow") + "</a>" +
      "</section>" + footer();
    revealOnScroll();
  }


  /* =========================================================================
     CARD INSPECTOR — pull a card out of the sleeve and really look at it.
     Big, holographic, tilts with your pointer/finger, and flips to the back.


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
     alive, so navigating away from a sealed booster pack fired confetti and a sound
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
    bindFacts();
    bindLogoFun();
    bindMascot();
    bindFloorDrill();
  }
  function boot() {
    app = $("#app"); // re-resolve in case the script loaded before #app parsed
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
        var t = codes[rung.key];
        if (!t) return;
        // Both the code (GPENPRO25) and the label ("25% off ...") carry the number.
        var inCode = String(t.code || "").match(/(\d{2})\s*$/);
        var inLabel = String(t.label || "").match(/(\d{2})\s*%/);
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
    bindSoundToggle();
    bindReset();
    bindSkipLink();
    bindLangSel();
    window.addEventListener("hashchange", route);
    route();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
