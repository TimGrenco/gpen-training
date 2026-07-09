/* =============================================================================
   G PEN TRAINING PORTAL — APP
   A small hash-routed SPA. No framework, no backend. Progress in localStorage.
   Views: Landing → Enroll → Dashboard → Course (Watch/Learn/Quiz) → Certificate
          → Reward code → (all courses) → Certified Specialist.
   ========================================================================== */
(function () {
  "use strict";

  /* ---- tiny helpers ------------------------------------------------------ */
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var CFG = window.TRAINING_CONFIG;
  var COURSES = window.GPEN_COURSES || [];
  var EGGS = window.GPEN_EGGS || [];
  var app = $("#app");
  var pendingCelebrate = false; // set when a new cert is earned → ring pulses on next home view
  var stickyHandler = null;     // scroll handler for the course "get certified" nudge

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]; }); }
  function courseBySlug(slug) { return COURSES.filter(function (c) { return c.slug === slug; })[0]; }
  function coreSlugs() { return CFG.coreCourses && CFG.coreCourses.length ? CFG.coreCourses : COURSES.map(function (c) { return c.slug; }); }
  function todayKey() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function niceDate() { return new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }); }

  /* ---- persistence ------------------------------------------------------- */
  var K_ENROLL = "gpt.enrollment", K_STATE = "gpt.state";
  function getEnroll() { try { return JSON.parse(localStorage.getItem(K_ENROLL) || "null"); } catch (e) { return null; } }
  function setEnroll(v) { try { localStorage.setItem(K_ENROLL, JSON.stringify(v)); } catch (e) {} }
  function getState() {
    var d = { courses: {}, badges: [], streak: { count: 0, last: null }, master: null, eggs: {}, secret: null, log: [] };
    var s;
    try { s = Object.assign(d, JSON.parse(localStorage.getItem(K_STATE) || "{}")); } catch (e) { return d; }
    if (!s.eggs) s.eggs = {};
    return s;
  }
  function setState(s) { try { localStorage.setItem(K_STATE, JSON.stringify(s)); } catch (e) {} }
  function logEvent(type, data) {
    // Structured event log — a future Sheet/Airtable webhook can POST these.
    var s = getState(); s.log = s.log || [];
    s.log.push(Object.assign({ type: type, at: new Date().toISOString() }, data || {}));
    setState(s);
  }
  function touchStreak() {
    var s = getState(), t = todayKey();
    if (s.streak.last === t) return s.streak.count;
    var y = new Date(); y.setDate(y.getDate() - 1);
    var yk = y.getFullYear() + "-" + (y.getMonth() + 1) + "-" + y.getDate();
    s.streak.count = (s.streak.last === yk) ? (s.streak.count + 1) : 1;
    s.streak.last = t; setState(s); return s.streak.count;
  }
  function completedCount() { var s = getState(); return COURSES.filter(function (c) { return s.courses[c.slug] && s.courses[c.slug].passed; }).length; }
  function isMasterEarned() { var s = getState(); return coreSlugs().every(function (sl) { return s.courses[sl] && s.courses[sl].passed; }); }

  /* ---- hidden trivia easter eggs ----------------------------------------- */
  function eggFor(pageKey) { return EGGS.filter(function (e) { return e.on === pageKey; })[0] || null; }
  function eggSolved(id) { return !!getState().eggs[id]; }
  function eggsSolvedCount() { var s = getState(); return EGGS.filter(function (e) { return s.eggs[e.id]; }).length; }
  function allEggsSolved() { return EGGS.length > 0 && eggsSolvedCount() === EGGS.length; }
  // The hidden 40% reward: every course certified (80%+ to pass) AND every egg found.
  function isSecretUnlocked() { return isMasterEarned() && allEggsSolved(); }

  function eggHTML(pageKey) {
    var egg = eggFor(pageKey); if (!egg) return "";
    var solved = eggSolved(egg.id);
    return '<div class="egg-row">' +
      '<button class="egg' + (solved ? " found" : "") + '" data-egg="' + esc(egg.id) + '" ' +
        'aria-label="' + (solved ? "Trivia solved" : "Hidden trivia") + '" title="' + (solved ? "Solved!" : "Psst… hidden trivia") + '">' +
        '<span class="egg-ic">' + ic(solved ? "check" : "spark") + "</span>" +
      "</button>" +
      '<span class="egg-hint">' + (solved ? "Secret found" : "Psst… tap me") + "</span>" +
    "</div>";
  }
  function bindEggs() {
    $$("[data-egg]").forEach(function (b) {
      b.addEventListener("click", function () {
        var egg = EGGS.filter(function (e) { return e.id === b.getAttribute("data-egg"); })[0];
        if (egg) openEgg(egg);
      });
    });
  }
  function openEgg(egg) {
    var solved = eggSolved(egg.id);
    var m = document.createElement("div"); m.className = "modal egg-modal";
    m.innerHTML = '<div class="modal-in egg-card">' +
      '<button class="modal-x" aria-label="Close">×</button>' +
      '<div class="egg-eyebrow">' + ic("spark") + " Hidden trivia · " + eggsSolvedCount() + " of " + EGGS.length + " found</div>" +
      '<h3 class="egg-q">' + esc(egg.q) + "</h3>" +
      (solved
        ? '<div class="egg-fact ok"><strong>' + ic("check") + " You already nailed this one.</strong> " + esc(egg.fact) + "</div>"
        : '<div class="egg-choices">' + egg.choices.map(function (ch, i) {
            return '<button class="choice" data-ci="' + i + '"><span class="ch-key">' + String.fromCharCode(65 + i) + "</span><span>" + esc(ch) + "</span></button>";
          }).join("") + "</div><div class=\"egg-fact\" hidden></div>") +
    "</div>";
    document.body.appendChild(m); document.body.classList.add("noscroll");
    function close() { m.remove(); document.body.classList.remove("noscroll"); }
    m.addEventListener("click", function (ev) { if (ev.target === m || ev.target.closest(".modal-x")) close(); });
    document.addEventListener("keydown", function esc2(ev) { if (ev.key === "Escape") { close(); document.removeEventListener("keydown", esc2); } });
    if (solved) return;

    $$(".choice", m).forEach(function (b) {
      b.addEventListener("click", function () {
        var ci = parseInt(b.getAttribute("data-ci"), 10);
        var right = ci === egg.answer;
        var fact = $(".egg-fact", m);
        if (!right) {
          b.classList.add("wrong"); b.disabled = true;
          fact.hidden = false; fact.className = "egg-fact no";
          fact.innerHTML = "<strong>Not quite — try again.</strong>";
          return;
        }
        $$(".choice", m).forEach(function (x, xi) { x.disabled = true; if (xi === egg.answer) x.classList.add("correct"); });
        fact.hidden = false; fact.className = "egg-fact ok";
        fact.innerHTML = "<strong>" + ic("check") + " Correct!</strong> " + esc(egg.fact);
        solveEgg(egg.id);
      });
    });
  }
  function solveEgg(id) {
    var s = getState();
    if (s.eggs[id]) return;
    s.eggs[id] = true; setState(s);
    logEvent("egg", { egg: id });
    confetti();
    var found = eggsSolvedCount();
    if (allEggsSolved() && !isMasterEarned()) toast("All " + EGGS.length + " secrets found! Certify on every course to unlock 40% off.");
    else if (isSecretUnlocked()) toast("Secret 40% reward unlocked! 🎉");
    else toast("Secret found — " + found + " of " + EGGS.length + " 🔎");
    // reflect the found state on the page without a full re-render
    $$('[data-egg="' + id + '"]').forEach(function (b) {
      b.classList.add("found");
      var h = b.parentElement && b.parentElement.querySelector(".egg-hint");
      if (h) h.textContent = "Secret found";
      var icn = b.querySelector(".egg-ic"); if (icn) icn.innerHTML = IC.check;
    });
    maybeReportSecret();
  }
  function maybeReportSecret() {
    if (!isSecretUnlocked()) return;
    var s = getState(); if (s.secret) return;
    var e = getEnroll() || {};
    s.secret = { at: new Date().toISOString() }; setState(s);
    logEvent("secret", {});
    if (window.reportCompletion) window.reportCompletion({ type: "secret", name: e.name, email: e.email, store: e.store, product: "Secret 40% reward", score: 100, certId: "", date: niceDate() });
  }

  /* ---- icons (inline SVG) ------------------------------------------------ */
  var IC = {
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
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
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 11-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="3"/><circle cx="12" cy="10" r="3"/><path d="M8.5 20a3.5 3.5 0 017 0"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 21.4l1.4-6.8L2.2 9.9l6.9-.8z"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.4L19 9l-5.1 1.6L12 16l-1.9-5.4L5 9l5.1-1.6z"/><path d="M18.5 14l.9 2.4 2.6.8-2.6.8-.9 2.4-.9-2.4-2.6-.8 2.6-.8z"/><path d="M5 15l.7 1.9 2 .6-2 .6L5 20l-.7-1.9-2-.6 2-.6z"/></svg>',
  };
  function ic(n) { return '<span class="ic">' + (IC[n] || "") + "</span>"; }

  /* ---- toast + confetti -------------------------------------------------- */
  var toastT;
  function toast(msg) {
    var t = $("#toast"); if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show"); clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }
  function confetti() {
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
  function header() {
    var e = getEnroll();
    return '<header class="hdr">' +
      '<a class="hdr-brand" href="#/">' +
        '<img src="assets/img/gpen-g-black.png" class="hdr-logo light" alt="G Pen"/>' +
        '<img src="assets/img/gpen-g-white.png" class="hdr-logo dark" alt="G Pen"/>' +
        '<span class="hdr-name">G Pen <em>University</em></span>' +
      "</a>" +
      (e ? '<a class="hdr-user" href="#/"><span class="hdr-u-name">' + esc(e.name) + '</span><span class="hdr-u-store">' + esc(e.store || "") + "</span></a>"
         : '<a class="hdr-cta" href="#/">Browse courses</a>') +
    "</header>";
  }

  /* ---- HOME (browse-first hub) ------------------------------------------- */
  function renderHome() {
    var e = getEnroll(), s = getState(), done = completedCount(), total = COURSES.length;
    var hasProgress = !!e || done > 0;
    var master = isMasterEarned();
    var pct = Math.round((done / total) * 100), streak = s.streak.count || 0;
    var R = 54, C = 2 * Math.PI * R, off = C * (1 - done / total);

    var progressBlock = hasProgress
      ? '<div class="dash-head">' +
          '<div class="dash-hi"><span class="dash-hello">' + (e ? "Welcome back," : "Your progress") + "</span><h1>" + esc(e ? e.name.split(" ")[0] : "Keep going") + "</h1>" + (e ? '<span class="dash-store">' + esc(e.store) + "</span>" : "") + "</div>" +
          '<div class="ring">' +
            '<svg viewBox="0 0 128 128"><circle class="ring-bg" cx="64" cy="64" r="' + R + '"/>' +
            '<circle class="ring-fg" cx="64" cy="64" r="' + R + '" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + C.toFixed(1) + '" data-off="' + off.toFixed(1) + '"/></svg>' +
            '<div class="ring-txt"><strong>' + done + "<span>/" + total + "</span></strong><em>certified</em></div>" +
          "</div>" +
        "</div>" +
        '<div class="stat-row">' +
          stat(done, "Courses passed", done, "") +
          stat(pct + "%", "Program complete", pct, "%") +
          stat('<span class="st-fire">' + (streak ? ic("fire") : "") + streak + "</span>", "Day streak") +
        "</div>" +
        '<div class="sec-h sub"><h2>Badge collection</h2><span>' + done + " of " + total + "</span></div>" +
        badgeRow()
      : "";

    var heroBg = (window.GPEN_LIFESTYLE || [])[2] || "";

    app.innerHTML = header() +
      '<section class="hero">' +
        (heroBg ? '<div class="hero-bg" style="background-image:url(\'' + esc(heroBg) + '\')"></div>' : "") +
        '<div class="hero-inner reveal">' +
          '<div class="hero-eyebrow">' + ic("cap") + " " + esc(CFG.programName) + "</div>" +
          "<h1>Become a <span class=\"gold\">Certified G</span>.</h1>" +
          "<p class=\"hero-sub\">Explore any product course — watch the how-to videos, learn the specs, get the talking points. Want the badge? Pass a quick quiz to unlock <strong>25% off</strong> gpen.com, or go full <strong>Certified G</strong> for <strong>35% off</strong>.</p>" +
          '<div class="hero-cta">' +
            '<button class="btn xl" id="browse-btn">Browse courses ' + ic("arrow") + "</button>" +
            '<a class="btn xl ghost-dark" href="#/about">About G Pen</a>' +
          "</div>" +
        "</div>" +
      "</section>" +
      lifestyleBand() +
      '<section class="hub reveal">' +
        progressBlock +
        '<div class="sec-h" id="courses"><h2>Product courses</h2><span>' + (hasProgress ? done + " of " + total + " certified" : "Tap a product — no sign-up needed") + "</span></div>" +
        '<div class="course-grid">' + COURSES.map(courseCard).join("") + "</div>" +
        rewardsSection(done, master) +
        eggHTML("home") +
        (hasProgress ? '<button class="linklike reset" id="reset">Reset my progress</button>' : "") +
      "</section>" +
      lifestyleBand(true) +
      '<section class="why">' +
        '<div class="why-grid">' +
          why(ic("play"), "Explore free", "Open any course and watch the how-to videos, browse specs, cleaning, and FAQs — no account required.") +
          why(ic("cap"), "Get certified", "When you're ready, pass an 80% quiz to earn a Product Specialist certificate for that device.") +
          why(ic("tag"), "Unlock discounts", "Each certification unlocks 25% off gpen.com — finish all " + total + " for 35% off and go full Certified G.") +
          why(ic("share"), "Show it off", "Download a printable certificate and a shareable IG story card for every product you master.") +
        "</div>" +
      "</section>" +
      footer();

    if (hasProgress) {
      requestAnimationFrame(function () { var r = $(".ring-fg"); if (r) r.style.strokeDashoffset = r.getAttribute("data-off"); });
      countUp();
      if (pendingCelebrate) {
        pendingCelebrate = false;
        var ring = $(".ring");
        if (ring) { ring.classList.add("celebrate"); confetti(); toast("Badge earned! 🎉"); setTimeout(function () { ring.classList.remove("celebrate"); }, 2400); }
      }
    }
    fillRewards();
    var bb = $("#browse-btn"); if (bb) bb.addEventListener("click", function () { scrollToId("courses"); });
    $$("[data-goto]").forEach(function (el) { el.addEventListener("click", function () { go("#/course/" + el.getAttribute("data-goto")); }); });
    var rst = $("#reset"); if (rst) rst.addEventListener("click", function () {
      if (confirm("Reset ALL your training progress and certificates on this device?")) { localStorage.removeItem(K_STATE); localStorage.removeItem(K_ENROLL); go("#/"); }
    });
    revealOnScroll();
  }
  function scrollToId(id) { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }
  function lifestyleImgs() {
    if (window.GPEN_LIFESTYLE && window.GPEN_LIFESTYLE.length) return window.GPEN_LIFESTYLE.slice();
    var out = [];
    COURSES.forEach(function (c) { if (c.heroImg) out.push(c.heroImg); if (c.gallery && c.gallery[0]) out.push(c.gallery[0].url); });
    return out;
  }
  function lifestyleBand(reverse) {
    var imgs = lifestyleImgs(); if (!imgs.length) return "";
    if (reverse) imgs = imgs.slice().reverse();
    var cells = imgs.concat(imgs).map(function (u) { return '<div class="life-cell"><img src="' + esc(u) + '" alt="" decoding="async"/></div>'; }).join("");
    return '<section class="life-band' + (reverse ? " rev" : "") + '"><div class="life-track">' + cells + "</div></section>";
  }
  function lifestyleGrid(n, start) {
    var imgs = lifestyleImgs().slice(start || 0, (start || 0) + (n || 6));
    if (!imgs.length) return "";
    return '<div class="life-grid">' + imgs.map(function (u) { return '<figure class="lg-cell"><img src="' + esc(u) + '" alt="" decoding="async"/></figure>'; }).join("") + "</div>";
  }
  function why(i, t, s) { return '<div class="why-card reveal"><span class="why-ic">' + i + "</span><h3>" + t + "</h3><p>" + s + "</p></div>"; }
  function step(n, t, s) { return '<li class="step reveal"><span class="step-n">' + n + "</span><div><h4>" + t + "</h4><p>" + s + "</p></div></li>"; }
  function footer() {
    return '<footer class="foot"><img src="assets/img/gpen-g-black.png" class="foot-g light" alt=""/><img src="assets/img/gpen-g-white.png" class="foot-g dark" alt=""/>' +
      '<div class="foot-nav"><a href="#/">Courses</a><a href="#/about">About G Pen</a><a href="' + esc(CFG.shopUrl) + '" target="_blank" rel="noopener">Shop gpen.com</a></div>' +
      "<p>" + esc(CFG.programName) + " · for authorized G Pen retail partners. Questions? <a href=\"mailto:" + esc(CFG.contactEmail) + "\">" + esc(CFG.contactEmail) + "</a></p></footer>";
  }

  function field(id, label, type, val, ph, ac) {
    return '<label class="field"><span>' + label + "</span>" +
      '<input id="f-' + id + '" type="' + type + '" value="' + esc(val || "") + '" placeholder="' + esc(ph) + '" autocomplete="' + ac + '" /></label>';
  }

  function stat(v, l, to, suf) {
    return '<div class="stat"><strong' + (to != null ? ' data-to="' + to + '" data-suffix="' + (suf || "") + '"' : "") + ">" + v + "</strong><span>" + l + "</span></div>";
  }
  function countUp() {
    $$(".stat strong[data-to]").forEach(function (el) {
      var to = parseInt(el.getAttribute("data-to"), 10) || 0, suf = el.getAttribute("data-suffix") || "";
      var setFinal = function () { el.textContent = to + suf; };
      // In hidden/inactive tabs rAF is paused — just show the real value.
      if (document.hidden || to <= 0) { setFinal(); return; }
      var start = null, dur = 850;
      requestAnimationFrame(function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        el.textContent = Math.round(p * to) + suf;
        if (p < 1) requestAnimationFrame(step);
      });
      // Failsafe: never leave a stat stuck mid-animation (wrong value).
      setTimeout(setFinal, 1200);
    });
  }
  // The three-tier discount reward, shown as an "earn it" tracker on the home hub.
  function rewardsSection(done, master) {
    var core = coreSlugs().length, left = core - done;
    var c25 = done >= 1, c35 = master;
    var secret = isSecretUnlocked();
    var eggsLeft = EGGS.length - eggsSolvedCount();
    var head = secret ? "Secret 40% reward unlocked 🎉"
      : (c35 ? "Top reward unlocked 🎉" : (c25 ? "25% off unlocked — keep going!" : "Pass one course to start earning"));
    var secretLock = eggsLeft > 0
      ? eggsLeft + " hidden secret" + (eggsLeft === 1 ? "" : "s") + " still out there…"
      : "All secrets found — certify on all " + core + " courses";
    return '<div class="sec-h"><h2>Your rewards</h2><span>' + head + "</span></div>" +
      '<div class="rewards">' +
        rewardCard("course", c25, "25% OFF", "gpen.com — for completing any course", "Complete any 1 course to unlock") +
        rewardCard("master", c35, "35% OFF", "gpen.com — for completing all " + core + " courses", left + " more course" + (left === 1 ? "" : "s") + " to unlock") +
        (EGGS.length ? rewardCard("secret", secret, "40% OFF", "The secret reward — certify on all " + core + " <em>and</em> find every hidden trivia egg", secretLock) : "") +
      "</div>";
  }
  function rewardCard(type, unlocked, big, sub, lockMsg) {
    var isSecret = type === "secret";
    return '<div class="rw-card ' + (unlocked ? "on" : "off") + (isSecret ? " secret" : "") + '">' +
      '<div class="rw-top"><span class="rw-ic">' + ic(unlocked ? (isSecret ? "spark" : "tag") : "lock") + '</span><span class="rw-status">' + (unlocked ? "Unlocked" : (isSecret ? "Secret" : "Locked")) + "</span></div>" +
      '<div class="rw-big">' + big + "</div>" +
      '<div class="rw-sub">' + sub + "</div>" +
      (unlocked
        ? '<button class="rw-code" data-rwcode="' + type + '"><span class="rw-code-v">••••••</span><em>' + ic("tag") + " Tap to copy</em></button>" +
          '<a class="rw-shop" href="' + esc(CFG.shopUrl) + '" target="_blank" rel="noopener">Shop gpen.com ' + ic("arrow") + "</a>" +
          (type === "master" ? '<a class="rw-cert" href="#/certified">View master certificate →</a>' : "")
        : '<div class="rw-lock">' + ic(isSecret ? "spark" : "lock") + " " + lockMsg + "</div>") +
    "</div>";
  }
  function copyCode(code) {
    if (navigator.clipboard) navigator.clipboard.writeText(code).then(function () { toast("Code copied — " + code); }, function () { toast(code); });
    else toast(code);
  }
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
  function courseCard(c) {
    var s = getState(), rec = s.courses[c.slug], done = rec && rec.passed;
    return '<a class="course-card' + (done ? " done" : "") + (c.featured ? " featured" : "") + '" href="#/course/' + c.slug + '" style="--accent:' + c.accent + '">' +
      '<div class="cc-media"><img src="' + esc(c.cover) + '" alt="' + esc(c.name) + '" loading="lazy"/>' +
        (done ? '<span class="cc-badge">' + ic("check") + " Certified</span>" : '<span class="cc-min">~' + c.minutes + " min</span>") +
        (c.featured && !done ? '<span class="cc-featured">' + ic("star") + " " + esc(c.featured) + "</span>" : "") +
      "</div>" +
      '<div class="cc-body">' +
        '<span class="cc-cat">' + esc(c.category) + "</span>" +
        "<h3>" + esc(c.name) + "</h3>" +
        "<p>" + esc(c.tagline) + "</p>" +
        '<div class="cc-reward' + (done ? " earned" : "") + '">' + ic(done ? "check" : "tag") + "<span>" + (done ? "25% off earned" : "Pass → 25% off") + "</span></div>" +
        '<div class="cc-foot"><span class="cc-price">' + esc(c.msrp) + "</span>" +
          '<span class="cc-go">' + (done ? "Review " : "Start ") + ic("arrow") + "</span></div>" +
      "</div>" +
    "</a>";
  }
  // Badge collection — one per product, lit once earned. A "collect them all" row.
  function badgeRow() {
    var s = getState();
    return '<div class="badges">' + COURSES.map(function (c) {
      var done = s.courses[c.slug] && s.courses[c.slug].passed;
      return '<a class="badge' + (done ? " earned" : "") + '" href="#/course/' + c.slug + '" title="' + esc(c.name) + (done ? " — certified" : "") + '">' +
        '<span class="badge-disc"><img src="' + esc(c.cover) + '" alt="' + esc(c.name) + '"/>' + (done ? '<span class="badge-chk">' + ic("check") + "</span>" : "") + "</span>" +
        '<span class="badge-name">' + esc(c.name) + "</span>" +
      "</a>";
    }).join("") + "</div>";
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
          '<div class="cx-hero-media"><img src="' + esc(hero) + '" alt="' + esc(c.name) + '" loading="eager"/></div>' +
          '<div class="cx-hero-body">' +
            '<span class="ch-eyebrow">' + ic("cap") + " Product Specialist Course" + (rec && rec.passed ? ' · <b class="ch-done">' + ic("check") + " Certified</b>" : "") + "</span>" +
            "<h1>" + esc(c.name) + "</h1>" +
            '<span class="cx-cat">' + esc(c.category) + " · " + esc(c.msrp) + "</span>" +
            "<p>" + esc(c.tagline) + "</p>" +
            '<div class="ch-meta">' + c.videos.length + " videos · " + c.quiz.length + "-question quiz · pass " + c.passPct + "% · ~" + c.minutes + " min</div>" +
          "</div>" +
        "</div>" +

        secHead(++n, "Watch & learn") +
        '<div class="vid-grid">' + c.videos.map(function (v) {
          return '<button class="vid" data-yt="' + esc(v.youtube || "") + '" data-title="' + esc(v.title) + '">' +
            '<span class="vid-thumb"><img src="' + esc(v.thumb) + '" alt="" loading="lazy"/><span class="vid-play">' + ic("play") + "</span></span>" +
            '<span class="vid-title">' + esc(v.title) + "</span></button>";
        }).join("") + "</div>" +

        secHead(++n, "Get to know it") +
        '<div class="prose">' + descHTML + "</div>" +
        (c.highlights && c.highlights.length ? '<ul class="hl-list">' + c.highlights.map(function (h) { return "<li>" + ic("check") + "<span>" + esc(h) + "</span></li>"; }).join("") + "</ul>" : "") +
        galleryHTML(c) +

        (c.specs && c.specs.length ? secHead(++n, "Tech specs") + specTableHTML(c.specs) : "") +
        (c.howToUse && c.howToUse.length ? secHead(++n, "How to use it") + stepListHTML(c.howToUse) : "") +
        (c.howToClean && c.howToClean.length ? secHead(++n, "How to clean & care") + stepListHTML(c.howToClean) : "") +
        (c.faq && c.faq.length ? secHead(++n, "FAQ") + faqHTML(c.faq) : "") +

        (c.sell && c.sell.length ? '<div class="sell"><h3>' + ic("tag") + " How to sell it</h3><ul>" + c.sell.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" : "") +
        eggHTML("course:" + c.slug) +

        secHead(++n, "Get certified") +
        '<div id="quiz-zone"></div>' +
      "</section>" +
      (rec && rec.passed ? "" : '<button class="sticky-cta" id="sticky-cta">' + ic("cap") + " Get certified · <b>25% off</b></button>") +
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
  function galleryHTML(c) {
    if (!c.gallery || !c.gallery.length) return "";
    return '<div class="gallery">' + c.gallery.map(function (g) {
      return '<figure class="ga-item"><img src="' + esc(g.url) + '" alt="' + esc(g.caption || c.name) + '" loading="lazy"/>' +
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
      return '<div class="faq-item"><button class="faq-q" data-faq="' + i + '"><span>' + esc(f.q) + '</span><span class="faq-caret">+</span></button>' +
        '<div class="faq-a"><p>' + esc(f.a) + "</p></div></div>";
    }).join("") + "</div>";
  }
  function bindFaq() {
    $$(".faq-q").forEach(function (b) {
      b.addEventListener("click", function () { b.closest(".faq-item").classList.toggle("open"); });
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
    function close() { m.remove(); document.body.classList.remove("noscroll"); }
    m.addEventListener("click", function (ev) { if (ev.target === m || ev.target.closest(".modal-x")) close(); });
    document.addEventListener("keydown", function esc(ev) { if (ev.key === "Escape") { close(); document.removeEventListener("keydown", esc); } });
  }
  function bindModules() {
    $$(".mod").forEach(function (mod) {
      $(".mod-h", mod).addEventListener("click", function (ev) {
        if (ev.target.closest(".mod-read")) return;
        mod.classList.toggle("open");
      });
    });
    $$(".mod-read").forEach(function (b) {
      b.addEventListener("click", function (ev) {
        ev.stopPropagation();
        var mod = b.closest(".mod"); mod.classList.add("read"); mod.classList.remove("open");
        b.innerHTML = ic("check") + " Read";
        // reveal next
        var next = mod.nextElementSibling; if (next && next.classList.contains("mod")) next.classList.add("open");
      });
    });
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
    revealReward("course", { courseSlug: c.slug, name: rec.name || e.name, email: e.email, store: e.store, certId: rec.certId }, $("#reward-zone"));
    $("#retake").addEventListener("click", function () { showCertifyForm(c); $("#quiz-zone").scrollIntoView({ behavior: "smooth", block: "start" }); });
  }
  function showCertifyForm(c) {
    var zone = $("#quiz-zone"), e = getEnroll() || {};
    zone.innerHTML =
      '<div class="certify">' +
        '<div class="certify-badge">' + ic("award") + "</div>" +
        "<h3>Get certified &amp; unlock 25% off</h3>" +
        '<p class="lead">Ready? Pass the ' + c.quiz.length + "-question quiz (score " + c.passPct + "%+) to earn your <strong>" + esc(c.name) + "</strong> Product Specialist certificate and a gpen.com discount code. Enter your details so we can put your name on the certificate.</p>" +
        '<div class="certify-form">' +
          field("name", "Your full name", "text", e.name, "Jane Budtender", "name") +
          field("email", "Email address", "email", e.email, "you@store.com", "email") +
          field("store", "Store / shop name", "text", e.store, "Cloud 9 Smoke Shop", "organization") +
          '<button class="btn xl full" id="start-quiz">Start the quiz ' + ic("arrow") + "</button>" +
          '<p class="form-fine">No account needed — this only personalizes your certificate and stays on your device.</p>' +
        "</div>" +
      "</div>";
    $("#start-quiz").addEventListener("click", function () {
      var name = $("#f-name").value.trim(), email = $("#f-email").value.trim(), store = $("#f-store").value.trim();
      if (!name) { toast("Enter your name for the certificate"); $("#f-name").focus(); return; }
      if (!email || email.indexOf("@") < 0) { toast("Enter a valid email"); $("#f-email").focus(); return; }
      if (!store) { toast("Enter your store name"); $("#f-store").focus(); return; }
      var prev = getEnroll();
      setEnroll({ name: name, email: email, store: store, ts: (prev && prev.ts) || new Date().toISOString() });
      if (!prev) logEvent("enroll", { name: name, email: email, store: store });
      runQuiz(c);
    });
  }
  function runQuiz(c) {
    var order = c.quiz.map(function (_, i) { return i; });
    var i = 0, answers = [], streak = 0, zone = $("#quiz-zone");
    step();
    zone.scrollIntoView({ behavior: "smooth", block: "start" });

    function step() {
      var q = c.quiz[order[i]];
      zone.innerHTML = '<div class="quiz">' +
        '<div class="quiz-bar"><div class="quiz-bar-fill" style="width:' + Math.round((i / c.quiz.length) * 100) + '%"></div></div>' +
        '<div class="quiz-count">Question ' + (i + 1) + " of " + c.quiz.length +
          (streak >= 2 ? '<span class="quiz-streak">' + ic("fire") + " " + streak + " in a row</span>" : "") + "</div>" +
        '<div class="quiz-q">' + esc(q.q) + "</div>" +
        '<div class="quiz-choices">' + q.choices.map(function (ch, ci) {
          return '<button class="choice" data-ci="' + ci + '"><span class="ch-key">' + String.fromCharCode(65 + ci) + "</span><span>" + esc(ch) + "</span></button>";
        }).join("") + "</div>" +
        '<div class="quiz-why" hidden></div>' +
        '<button class="btn xl next" id="q-next" hidden></button>' +
      "</div>";
      $$(".choice", zone).forEach(function (b) { b.addEventListener("click", function () { choose(parseInt(b.getAttribute("data-ci"), 10), q); }); });
    }
    function choose(ci, q) {
      if (answers[i] != null) return;
      answers[i] = ci;
      var correct = ci === q.answer;
      streak = correct ? streak + 1 : 0;
      $$(".choice", zone).forEach(function (b, bi) {
        b.disabled = true;
        if (bi === q.answer) b.classList.add("correct");
        else if (bi === ci) b.classList.add("wrong");
      });
      var why = $(".quiz-why", zone); why.hidden = false;
      why.className = "quiz-why " + (correct ? "ok" : "no");
      why.innerHTML = "<strong>" + (correct ? ic("check") + " Correct" : "Not quite") + "</strong> " +
        (correct && streak >= 3 ? '<span class="streak-pop">' + ic("fire") + " " + streak + " in a row!</span> " : "") + esc(q.why);
      var n = $("#q-next", zone); n.hidden = false;
      n.innerHTML = (i + 1 < c.quiz.length ? "Next question " + ic("arrow") : "See my results " + ic("arrow"));
      n.onclick = function () { i++; if (i < c.quiz.length) step(); else finish(); };
    }
    function finish() {
      var correct = 0; c.quiz.forEach(function (q, qi) { if (answers[qi] === q.answer) correct++; });
      var pct = Math.round((correct / c.quiz.length) * 100), passed = pct >= c.passPct;
      logEvent("quiz", { course: c.slug, score: pct, passed: passed });
      if (!passed) return quizFail(c, correct, pct);
      quizPass(c, correct, pct);
    }
  }
  function quizFail(c, correct, pct) {
    var zone = $("#quiz-zone");
    zone.innerHTML = '<div class="result fail">' +
      '<div class="result-score">' + pct + '%<span>' + correct + "/" + c.quiz.length + "</span></div>" +
      "<h3>So close!</h3><p>You need " + c.passPct + "% to certify. Review the lessons above and give it another shot — you've got this.</p>" +
      '<button class="btn xl" id="retry">' + ic("refresh") + " Retry quiz</button>" +
    "</div>";
    $("#retry").addEventListener("click", function () { runQuiz(c); });
    zone.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function quizPass(c, correct, pct) {
    var e = getEnroll();
    var date = niceDate(), cid = certId(e.name + "|" + c.name + "|" + date);
    var s = getState(); var firstTime = !(s.courses[c.slug] && s.courses[c.slug].passed);
    s.courses[c.slug] = { passed: true, score: pct, certId: cid, date: date, name: e.name };
    if (s.badges.indexOf(c.slug) < 0) s.badges.push(c.slug);
    setState(s);
    if (firstTime) {
      pendingCelebrate = true; // ring pulses + confetti next time they hit home
      if (window.reportCompletion) window.reportCompletion({ type: "course", name: e.name, email: e.email, store: e.store, product: "G Pen " + c.name, courseSlug: c.slug, score: pct, certId: cid, date: date });
    }
    maybeReportSecret(); // finishing the last course can complete the secret too
    var streak = touchStreak();
    logEvent("certified", { course: c.slug, certId: cid, score: pct });
    confetti();

    var master = isMasterEarned();
    var zone = $("#quiz-zone");
    zone.innerHTML = '<div class="result pass">' +
        '<div class="result-score">' + pct + '%<span>' + correct + "/" + c.quiz.length + "</span></div>" +
        "<h3>" + ic("check") + " You passed!</h3><p>You're now a certified <strong>" + esc(c.name) + "</strong> Product Specialist" + (firstTime ? "" : " (progress refreshed)") + ".</p>" +
      "</div>" +
      '<div id="cert-zone"></div>' +
      '<div id="reward-zone" class="reward-wrap"></div>' +
      (master ? '<a class="master-unlock" href="#/certified">' + ic("award") + " You've finished every course — you're now <strong>Certified G</strong>! Get your certificate & 35% off " + ic("arrow") + "</a>"
              : '<a class="btn ghost xl backdash" href="#/">Back to all courses ' + ic("arrow") + "</a>");
    showCertificate(c, e.name, date, pct, cid, $("#cert-zone"));
    revealReward("course", { courseSlug: c.slug, name: e.name, email: e.email, store: e.store, certId: cid }, $("#reward-zone"));
    zone.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---- REWARD (isolated issuance) --------------------------------------- */
  function revealReward(type, ctx, box) {
    Promise.resolve(window.issueRewardCode(type, ctx)).then(function (r) {
      if (!r || !r.code) return;
      box.innerHTML = '<div class="reward">' +
        '<div class="reward-ic">' + ic("tag") + "</div>" +
        '<div class="reward-eyebrow">' + (type === "master" ? "Specialist reward unlocked" : "Reward unlocked") + "</div>" +
        "<h3>" + esc(r.label) + "</h3>" +
        '<button class="code" id="code-copy" title="Copy code"><span>' + esc(r.code) + '</span><em>Tap to copy</em></button>' +
        "<p>" + esc(r.note || "") + "</p>" +
        '<a class="btn xl" href="' + esc(CFG.shopUrl) + '" target="_blank" rel="noopener">Shop gpen.com ' + ic("arrow") + "</a>" +
      "</div>";
      $("#code-copy").addEventListener("click", function () {
        var t = r.code;
        if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { toast("Code copied!"); }, function () { toast(t); });
        else toast(t);
      });
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
    $("#cert-print").addEventListener("click", function () { window.print(); });
    $("#cert-dl").addEventListener("click", function () { downloadCertificate(product, nm, date, pct, cid, "PRODUCT SPECIALIST"); });
    $("#cert-ig").addEventListener("click", function () { drawShareCard({ kind: "course", name: nm, product: c.name, score: pct, date: date, cid: cid, cover: c.cover }); });
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
  function roundRectPath(ctx, x0, y0, w, h, r) { ctx.beginPath(); ctx.moveTo(x0 + r, y0); ctx.arcTo(x0 + w, y0, x0 + w, y0 + h, r); ctx.arcTo(x0 + w, y0 + h, x0, y0 + h, r); ctx.arcTo(x0, y0 + h, x0, y0, r); ctx.arcTo(x0, y0, x0 + w, y0, r); ctx.closePath(); }
  function drawShareCard(opts) {
    toast("Building your share image…");
    var done = false, finish = function (cover) { if (done) return; done = true; renderShare(opts, cover); };
    if (opts.cover) {
      var img = new Image(); img.crossOrigin = "anonymous";
      img.onload = function () { finish(img); };
      img.onerror = function () { finish(null); };
      img.src = opts.cover;
      setTimeout(function () { finish(img.complete && img.naturalWidth ? img : null); }, 2600);
    } else finish(null);
  }
  function renderShare(opts, cover) {
    var W = 1080, H = 1920, c = document.createElement("canvas"); c.width = W; c.height = H;
    var x = c.getContext("2d"), cx = W / 2, GOLD = "#FEC870", GOLD2 = "#C8952F", master = opts.kind === "master";
    function ls(v) { try { x.letterSpacing = v; } catch (e) {} }
    function wrap(text, y, max, lh, font, fill) {
      x.font = font; x.fillStyle = fill;
      var words = String(text).split(" "), line = "", lines = [];
      for (var i = 0; i < words.length; i++) { var t = line ? line + " " + words[i] : words[i]; if (x.measureText(t).width > max && line) { lines.push(line); line = words[i]; } else line = t; }
      if (line) lines.push(line);
      lines.forEach(function (ln, i) { x.fillText(ln, cx, y + i * lh); });
      return y + (lines.length - 1) * lh;
    }
    var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#17140d"); g.addColorStop(0.5, "#0d0d0b"); g.addColorStop(1, "#080808");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    var rg = x.createRadialGradient(W * 0.75, H * 0.12, 0, W * 0.75, H * 0.12, W * 1.15);
    rg.addColorStop(0, "rgba(254,200,112,0.30)"); rg.addColorStop(1, "rgba(254,200,112,0)");
    x.fillStyle = rg; x.fillRect(0, 0, W, H);
    x.strokeStyle = "rgba(254,200,112,0.45)"; x.lineWidth = 5; roundRectPath(x, 44, 44, W - 88, H - 88, 30); x.stroke();
    x.textAlign = "center"; x.textBaseline = "alphabetic";
    if (CERT_LOGO_W.complete && CERT_LOGO_W.naturalWidth) { var lw = 150, lh2 = Math.round(lw * (CERT_LOGO_W.naturalHeight / CERT_LOGO_W.naturalWidth)); x.drawImage(CERT_LOGO_W, cx - lw / 2, 150, lw, lh2); }
    ls("8px"); x.fillStyle = GOLD; x.font = "800 30px Archivo, Arial, sans-serif"; x.fillText("G PEN UNIVERSITY", cx, 366); ls("0px");
    x.fillStyle = "#fff"; x.font = "900 " + (master ? "128px" : "150px") + " Archivo, Arial, sans-serif"; x.fillText(master ? "CERTIFIED G" : "CERTIFIED", cx, 540);
    var cy = 800;
    if (cover) {
      x.fillStyle = "rgba(255,255,255,0.06)"; x.beginPath(); x.arc(cx, cy, 215, 0, 7); x.fill();
      x.strokeStyle = "rgba(254,200,112,0.35)"; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, 215, 0, 7); x.stroke();
      var iw = 380, ih = 380, ar = cover.naturalWidth / cover.naturalHeight; if (ar > 1) ih = iw / ar; else iw = ih * ar;
      x.drawImage(cover, cx - iw / 2, cy - ih / 2, iw, ih);
    } else {
      x.strokeStyle = GOLD; x.lineWidth = 6; x.beginPath(); x.arc(cx, cy, 165, 0, 7); x.stroke();
      x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, 145, 0, 7); x.stroke();
      x.fillStyle = GOLD; x.font = "900 130px Archivo, Arial, sans-serif"; x.fillText("★", cx, cy + 46);
    }
    ls("2px"); x.fillStyle = GOLD; x.font = "800 40px Archivo, Arial, sans-serif"; x.fillText(master ? "FULLY TRAINED PRODUCT SPECIALIST" : "PRODUCT SPECIALIST", cx, 1110); ls("0px");
    wrap(opts.name, 1250, W - 200, 96, "800 92px Archivo, Arial, sans-serif", "#fff");
    x.fillStyle = "#b9b8b0"; x.font = "400 36px Archivo, Arial, sans-serif"; x.fillText(master ? "is a fully trained specialist in" : "is now certified on the", cx, 1420);
    wrap(master ? "the entire G Pen lineup" : ("G Pen " + opts.product), 1510, W - 180, 82, "800 76px Archivo, Arial, sans-serif", GOLD);
    x.fillStyle = "#fff"; x.font = "700 46px Archivo, Arial, sans-serif"; x.fillText("Ask me about G Pen", cx, 1710);
    ls("2px"); x.fillStyle = GOLD2; x.font = "600 28px Archivo, Arial, sans-serif"; x.fillText("gpen.com" + (opts.cid ? ("   ·   " + opts.cid) : ""), cx, 1815); ls("0px");
    var fname = (master ? "G_Pen_Certified_G" : (opts.product.replace(/[^\w.-]+/g, "_") + "_Certified")) + "_IG_Story.png";
    try {
      if (c.toBlob) c.toBlob(function (b) { if (!b) { toast("Couldn't export image"); return; } var u = URL.createObjectURL(b); dl(u, fname); setTimeout(function () { URL.revokeObjectURL(u); }, 8000); toast("Saved! Share it to your story 🎉"); }, "image/png");
      else { dl(c.toDataURL("image/png"), fname); toast("Saved!"); }
    } catch (e) { toast("Image export was blocked"); }
  }

  /* ---- CERTIFIED (master) ------------------------------------------------ */
  function renderCertified() {
    if (!isMasterEarned()) return go("#/");
    var e = getEnroll() || { name: "", store: "", email: "" };
    var s = getState();
    // master cert date = latest course date; id from name + program
    var date = niceDate(), cid = certId(e.name + "|G Pen Certified Specialist|" + date);
    if (!s.master) {
      s.master = { certId: cid, date: date, name: e.name }; setState(s); logEvent("master", { certId: cid });
      if (window.reportCompletion) window.reportCompletion({ type: "master", name: e.name, email: e.email, store: e.store, product: "Certified G", score: 100, certId: cid, date: date });
    }
    else { cid = s.master.certId; date = s.master.date; }

    app.innerHTML = header() +
      '<section class="course reveal">' +
        '<a class="back" href="#/">' + ic("back") + " All courses</a>" +
        '<div class="master-hero">' + ic("award") +
          "<h1>You're Certified G</h1>" +
          "<p>Congratulations, " + esc(e.name.split(" ")[0]) + " — you've completed every course in " + esc(CFG.programName) + " and are officially a <strong>fully trained G Pen Product Specialist</strong>. You know the whole lineup cold.</p>" +
        "</div>" +
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
    $("#cert-print").addEventListener("click", function () { window.print(); });
    $("#cert-dl").addEventListener("click", function () { downloadCertificate("G Pen Certified Specialist", e.name, date, 0, cid, "CERTIFIED G"); });
    $("#cert-ig").addEventListener("click", function () { drawShareCard({ kind: "master", name: e.name, cid: cid }); });
    $("#cert-mail").addEventListener("click", function () {
      var body = "I'm now a G Pen Certified Specialist!\n\nName: " + e.name + "\nStore: " + (e.store || "") + "\nEmail: " + (e.email || "") + "\nDate: " + date + "\nCertificate ID: " + cid;
      window.location.href = "mailto:" + CFG.contactEmail + "?subject=" + encodeURIComponent("G Pen Certified Specialist") + "&body=" + encodeURIComponent(body);
    });
    revealReward("master", { name: e.name, email: e.email, store: e.store, certId: cid }, $("#mreward"));
    confetti();
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
        '<a class="back" href="#/' + (e ? "dashboard" : "") + '">' + ic("back") + " " + (e ? "Dashboard" : "Home") + "</a>" +
        '<div class="about-hero">' +
          '<img class="about-g" src="assets/img/gpen-g-white.png" alt="G Pen"/>' +
          '<span class="ch-eyebrow">' + ic("cap") + " About the brand</span>" +
          "<h1>15 years of leading the culture.</h1>" +
          "<p>" + esc(a.intro || "") + "</p>" +
        "</div>" +
        (a.stats ? '<div class="about-stats">' + a.stats.map(function (s) { return '<div class="astat"><strong>' + s.number + "</strong><span>" + esc(s.label) + "</span></div>"; }).join("") + "</div>" : "") +
        lifestyleGrid(6, 0) +
        '<div class="about-block"><h2>Our story</h2>' + founding + "</div>" +
        (a.milestones ? '<div class="about-block"><h2>Milestones</h2><ol class="timeline">' + a.milestones.map(function (m) {
          return '<li><span class="tl-year">' + esc(m.year) + "</span><span class=\"tl-dot\"></span><p>" + esc(m.text) + "</p></li>";
        }).join("") + "</ol></div>" : "") +
        (a.collaborations ? '<div class="about-block"><h2>Iconic collaborations</h2><p class="lead">G Pen has partnered with some of the biggest names in music and cannabis:</p><div class="collabs">' +
          a.collaborations.map(function (c) { return '<span class="collab">' + esc(c) + "</span>"; }).join("") + "</div></div>" : "") +
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
        eggHTML("about") +
        '<div class="about-close">' + ic("tag") + "<p>" + esc(a.closing || "") + "</p></div>" +
        '<a class="btn xl center-btn" href="#/">' + (e ? "Back to my courses" : "Browse courses") + " " + ic("arrow") + "</a>" +
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
  function setTitleDoc(t) { document.title = t + " · " + CFG.programName; }

  /* ---- router ------------------------------------------------------------ */
  function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }
  function route() {
    var h = location.hash.replace(/^#/, "") || "/";
    var parts = h.split("/").filter(Boolean); // e.g. ["course","dash-ii"]
    window.scrollTo(0, 0);
    setTitleDoc(CFG.programName);
    if (parts[0] === "course" && parts[1]) renderCourse(parts[1]);
    else if (parts[0] === "certified") renderCertified();
    else if (parts[0] === "about") renderAbout();
    else renderHome(); // "/", "/dashboard", "/enroll" and anything else → the hub
    // Safety net: guarantee every view's reveal animation is initialized (and
    // its visibility failsafe armed) even if a render function forgets to call it.
    revealOnScroll();
    bindEggs();
  }
  function boot() {
    app = $("#app"); // re-resolve in case the script loaded before #app parsed
    if (!app) { return document.addEventListener("DOMContentLoaded", boot, { once: true }); }
    window.addEventListener("hashchange", route);
    route();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
