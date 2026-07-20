/* =============================================================================
   G PEN TRAINING PORTAL — APP
   A small hash-routed SPA. No framework, no backend. Progress in localStorage.

   Routes: "/" home (masthead + the product lineup, grouped by family)
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
  var pendingCelebrate = false; // set when a new cert is earned → ring pulses on next home view
  var stickyHandler = null;     // scroll handler for the course "get certified" nudge

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]; }); }
  function courseBySlug(slug) { return COURSES.filter(function (c) { return c.slug === slug; })[0]; }
  // The next product still to certify (skipping `afterSlug`) — drives the
  // "Next up →" hand-off so the journey always has a forward edge.
  function nextCourse(afterSlug) { return COURSES.filter(function (c) { return c.slug !== afterSlug && !cardOwned(c.slug); })[0] || null; }
  // The free-G-Pen draw needs THREE things, and `live` is a deliberate manual gate:
  // pasting a reporting webhook must never publish a prize promotion as a side
  // effect. So the draw shows only when it's enabled, explicitly switched live by
  // a human (after counsel clears the rules page), AND there's an entry pool to log
  // into. Until then the reward is simply the guaranteed discount — we never
  // promise an entry that goes nowhere.
  // PREVIEW MODE: ?preview=draw renders the whole sweepstakes treatment for THIS
  // visit only, so the team can review and screenshot it without publishing a
  // prize promotion to every visitor. A banner makes the state obvious, and entry
  // reporting stays off (see reportMaster) so nobody is told they're entered when
  // there is no entry pool. Share the link; it changes nothing for anyone else.
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
    var d = { courses: {}, streak: { count: 0, last: null }, master: null, trio: null, fresh: {}, log: [] };
    var s;
    try { s = Object.assign(d, JSON.parse(localStorage.getItem(K_STATE) || "{}")); } catch (e) { return d; }
    if (!s.fresh) s.fresh = {};
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

  /* =========================================================================
     THE COLLECTION — trading cards
     Every course is a card you pull by passing its quiz at 80%+. Collect all
     five to reveal the gold Certified G — the 6th card and the program's top reward.
     ====================================================================== */
  var CARDS = window.GPEN_CARDS || {};
  var ELEMENTS = window.GPEN_ELEMENTS || {};
  var RARITY = window.GPEN_RARITY || {};
  var SET = window.GPEN_SET || { name: "Base Set", total: 6, illus: "" };
  var SECRET_CARD = window.GPEN_SECRET_CARD || null;

  function cardOwned(slug) { var r = getState().courses[slug]; return !!(r && r.passed); }
  // A card you've pulled but not yet seen in the binder wears a "NEW!" sticker.
  function isFresh(key) { return !!getState().fresh[key]; }
  function markFresh(key) { var s = getState(); s.fresh[key] = true; setState(s); }
  function clearFresh() {
    var s = getState();
    if (!Object.keys(s.fresh).length) return;
    s.fresh = {}; setState(s);
    $$(".tcg-new").forEach(function (n) { n.remove(); });
    $$(".is-new").forEach(function (n) { n.classList.remove("is-new"); });
  }
  function newSticker() { return '<span class="tcg-new">New!</span>'; }
  function cardScore(slug) { var r = getState().courses[slug]; return r && r.passed ? r.score : 0; }
  function baseSetOwned() { return COURSES.filter(function (c) { return cardOwned(c.slug); }).length; }
  // The 6th card, the gold Certified G, appears once the whole lineup is certified.
  function secretCardState() { return isMasterEarned() ? "gold" : "locked"; }
  function totalCards() { return COURSES.length + 1; }
  function ownedCards() { return baseSetOwned() + (secretCardState() !== "locked" ? 1 : 0); }

  function energyDots(el, n) {
    var e = ELEMENTS[el] || {}; var out = "";
    for (var i = 0; i < (n || 1); i++) out += '<i class="mv-e">' + (e.emoji || "●") + "</i>";
    return out;
  }
  function movesHTML(el, moves) {
    return (moves || []).map(function (m) {
      return '<span class="tcg-move">' +
        '<span class="mv-cost">' + energyDots(el, m.cost) + "</span>" +
        '<span class="mv-body"><b>' + esc(m.name) + "</b><em>" + esc(m.text) + "</em></span>" +
        '<span class="mv-dmg">' + esc(m.dmg || "") + "</span>" +
      "</span>";
    }).join("");
  }
  function statsRowHTML(rows) {
    return '<span class="tcg-stats">' + (rows || []).map(function (r) {
      return "<span><em>" + esc(r.k) + "</em><b>" + esc(r.v) + "</b></span>";
    }).join("") + "</span>";
  }
  function rarityHTML(key) {
    var r = RARITY[key] || RARITY.common || { sym: "●", label: "Common" };
    return '<i class="tcg-rar" title="' + esc(r.label) + '">' + r.sym + "</i>";
  }

  /* A product card. `mini` drops the moves/flavor for the binder grid. */
  function tcgCard(c, mini) {
    var cd = CARDS[c.slug]; if (!cd) return "";
    var el = ELEMENTS[cd.element] || {};
    var owned = cardOwned(c.slug), score = cardScore(c.slug), perfect = score === 100;
    var cls = ["tcg", "r-" + cd.rarity, "e-" + cd.element];
    if (owned) cls.push("owned");
    if (perfect) cls.push("perfect");
    if (mini) cls.push("mini");
    if (c.featured && !owned) cls.push("featured");
    var fresh = owned && isFresh(c.slug);
    if (fresh) cls.push("is-new");
    return '<a class="' + cls.join(" ") + '" href="#/course/' + c.slug + '" style="--accent:' + c.accent + ';--tint:' + (el.tint || "#888") + '"' +
      ' data-card="' + esc(c.slug) + '" aria-label="' + esc(c.name) + (owned ? " — collected" : " — not yet collected") + '">' +
      (fresh ? newSticker() : "") +
      '<span class="tcg-inner">' +
        '<span class="tcg-shine" aria-hidden="true"></span>' +
        '<span class="tcg-head">' +
          '<span class="tcg-stage">Basic · ' + esc(cd.code) + " · ~" + c.minutes + " min</span>" +
          '<span class="tcg-name-row">' +
            '<b class="tcg-name">' + esc(c.name) + "</b>" +
            '<span class="tcg-hp"><em>' + esc(cd.powerUnit) + "</em><b>" + esc(cd.power) + '</b><i class="tcg-el" title="' + esc(el.label || "") + '">' + (el.emoji || "") + "</i></span>" +
          "</span>" +
        "</span>" +
        '<span class="tcg-art">' +
          '<img src="' + esc(sized(c.cover, 220)) + '" alt="" loading="lazy"/>' +
          (owned ? '<i class="spk a">\u2726</i><i class="spk b">\u2726</i>' : "") +
          (owned
            ? '<span class="tcg-stamp">' + ic("check") + " Certified " + score + "%</span>"
            : (c.featured ? '<span class="tcg-featured">' + ic("star") + " " + esc(c.featured) + "</span>" : "")) +
          (perfect ? '<span class="tcg-perfect">' + ic("star") + " PERFECT</span>" : "") +
        "</span>" +
        '<span class="tcg-typebar"><em>' + esc(c.category) + "</em><b>" + esc(c.msrp) + "</b></span>" +
        (mini ? "" :
          '<span class="tcg-moves">' + movesHTML(cd.element, cd.moves) + "</span>" +
          statsRowHTML(cd.statsRow) +
          '<span class="tcg-flavor">' + esc(c.tagline) + "</span>") +
        '<span class="tcg-foot">' +
          '<span class="tcg-set">' + esc(SET.name) + " · " + esc(SET.illus) + "</span>" +
          '<span class="tcg-no">' + cd.no + "/" + SET.total + " " + rarityHTML(cd.rarity) + "</span>" +
        "</span>" +
        (mini ? "" : '<span class="tcg-cta"><em>' + (owned
            ? ic("check") + " " + (tierAt(completedCount()) || LADDER[0]).pct + "% off earned"
            : ic("tag") + (unlockPct(completedCount()) ? " Pass → " + unlockPct(completedCount()) + "% off" : " Pass → certify")) + "</em><b>" + (owned ? "Review " : "Start ") + ic("arrow") + "</b></span>") +
      "</span>" +
    "</a>";
  }

  /* The 6th card. Locked shows a card BACK — you see the slot, not the card. */
  function secretCardHTML(mini) {
    if (!SECRET_CARD) return "";
    var st = secretCardState(), e = getEnroll();
    var sc = SECRET_CARD, el = ELEMENTS[sc.element] || {};
    var need = COURSES.length - baseSetOwned();

    if (st === "locked") {
      return '<div class="tcg back' + (mini ? " mini" : "") + '" data-card="secret" aria-label="Certified G — locked">' +
        '<span class="tcg-inner">' +
          '<span class="tcg-shine" aria-hidden="true"></span>' +
          '<span class="back-art">' +
            '<img src="assets/img/gpen-g-white.png" alt=""/>' +
            '<span class="back-q">?</span>' +
          "</span>" +
          '<span class="back-name">Secret Rare</span>' +
          '<span class="back-msg">' + ic("lock") + " Collect all " + COURSES.length + " Base Set cards to reveal" +
            (need ? " — <b>" + need + " to go</b>" : "") + "</span>" +
          '<span class="tcg-foot"><span class="tcg-set">' + esc(SET.name) + "</span>" +
            '<span class="tcg-no">' + sc.no + "/" + SET.total + " " + rarityHTML("secret") + "</span></span>" +
        "</span>" +
      "</div>";
    }

    var gold = st === "gold";
    var freshS = isFresh("secret");
    return '<a class="tcg secret ' + st + (mini ? " mini" : "") + (freshS ? " is-new" : "") + '" href="#/certified" data-card="secret" aria-label="Certified G — collected">' +
      (freshS ? newSticker() : "") +
      '<span class="tcg-inner">' +
        '<span class="tcg-shine" aria-hidden="true"></span>' +
        '<span class="tcg-head">' +
          '<span class="tcg-stage">' + (gold ? "Gold Foil" : "Holo") + " · " + esc(sc.code) + "</span>" +
          '<span class="tcg-name-row"><b class="tcg-name">' + esc(sc.name) + "</b>" +
            '<span class="tcg-hp"><b>' + sc.power + '</b><i class="tcg-el">' + (el.emoji || "") + "</i></span></span>" +
        "</span>" +
        '<span class="tcg-art">' +
          '<img src="assets/img/gpen-g-white.png" alt=""/>' +
          '<i class="spk a">\u2726</i><i class="spk b">\u2726</i>' +
          '<span class="tcg-stamp">' + ic("award") + (gold ? " GOLD FOIL" : " HOLO") + "</span>" +
        "</span>" +
        '<span class="tcg-typebar"><em>' + esc(e ? e.name : "Product Specialist") + "</em><b>40% OFF</b></span>" +
        (mini ? "" :
          '<span class="tcg-moves">' + movesHTML("gold", sc.moves) + "</span>" +
          statsRowHTML([{ k: "Lineup", v: baseSetOwned() + "/" + COURSES.length }, { k: "Reward", v: "40% off" }, { k: "Rank", v: "👑" }]) +
          '<span class="tcg-flavor">' + esc(sc.flavor) + "</span>") +
        '<span class="tcg-foot"><span class="tcg-set">' + esc(SET.name) + " · " + esc(SET.illus) + "</span>" +
          '<span class="tcg-no">' + sc.no + "/" + SET.total + " " + rarityHTML("secret") + "</span></span>" +
        (mini ? "" : '<span class="tcg-cta"><em>' + ic("spark") + " Gold — " + LADDER[LADDER.length - 1].pct + "% off gpen.com</em><b>View " + ic("arrow") + "</b></span>") +
      "</span>" +
    "</a>";
  }

  // Pulling a card mid-page must update whatever counters are already on screen.
  function refreshCounters() {
    var pips = $$(".hdr-binder .pip");
    COURSES.forEach(function (c, i) { if (pips[i] && cardOwned(c.slug)) pips[i].classList.add("on"); });
    var link = $(".hdr-binder");
    if (link) link.setAttribute("aria-label", completedCount() + " of " + COURSES.length + " products certified — open your card binder");
    var word = $(".hdr-binder .hb-word b");
    if (word) word.textContent = completedCount();
  }

  /* Tiny 16-slot progress strip: 5 product + 10 trainer + 1 secret. */

  /* Holo tilt: the card leans toward the pointer and the shine follows it.
     Pointer-only and motion-safe — touch and reduced-motion get a flat card. */
  function bindCardTilt() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    $$(".tcg").forEach(function (card) {
      card.addEventListener("pointermove", function (ev) {
        var r = card.getBoundingClientRect();
        var px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height;
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        card.style.setProperty("--rx", ((0.5 - py) * 9).toFixed(2) + "deg");
        card.style.setProperty("--ry", ((px - 0.5) * 11).toFixed(2) + "deg");
      });
      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--mx", "50%"); card.style.setProperty("--my", "50%");
      });
    });
  }

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
    return '<div class="qreview"><h4>' + ic("cap") + " Worth another look &middot; " + rows.length + " to review</h4>" + rows.join("") + "</div>";
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

  // Bump the header binder counter after a card lands in it.
  function pulseBinder() {
    var chip = $(".hdr-binder"); if (!chip) return;
    chip.classList.remove("pop"); void chip.offsetWidth; chip.classList.add("pop");
  }
  // Fly a clone of the card up into the header binder chip, then run `done`.
  function flyToBinder(cardEl, done) {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var chip = $(".hdr-binder");
    if (!cardEl || !chip || reduced) { pulseBinder(); done(); return; }
    var cr = cardEl.getBoundingClientRect(), tr = chip.getBoundingClientRect();
    var clone = cardEl.cloneNode(true);
    clone.classList.add("fly-clone");
    clone.style.cssText = "position:fixed;left:" + cr.left + "px;top:" + cr.top + "px;width:" + cr.width +
      "px;height:" + cr.height + "px;margin:0;z-index:200;pointer-events:none;" +
      "transition:transform .7s cubic-bezier(.5,0,.25,1), opacity .7s ease;";
    document.body.appendChild(clone);
    var dx = (tr.left + tr.width / 2) - (cr.left + cr.width / 2);
    var dy = (tr.top + tr.height / 2) - (cr.top + cr.height / 2);
    var modal = cardEl.closest(".pull-modal"); if (modal) modal.classList.add("fading");
    requestAnimationFrame(function () {
      clone.style.transform = "translate(" + dx + "px," + dy + "px) scale(.05) rotate(-14deg)";
      clone.style.opacity = "0.15";
    });
    setTimeout(function () { clone.remove(); pulseBinder(); sfx.play("tick"); done(); }, 640);
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
      if (trigger && trigger.focus) trigger.focus();
    };
  }

  /* The card-pull moment. Used when you certify (product card) and when you
     solve a trivia egg (trainer card). The card flips in out of a foil pack. */
  function showPull(kicker, cardHTML, footNote, saveSlug) {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var m = document.createElement("div");
    m.className = "modal pull-modal";

    var revealHTML =
      '<div class="pull-reveal"' + (reduced ? "" : " hidden") + '>' +
        '<div class="pull-kicker">' + ic("spark") + " " + esc(kicker) + "</div>" +
        '<div class="pull-card">' + cardHTML + "</div>" +
        (footNote ? '<div class="pull-note">' + footNote + "</div>" : "") +
        '<div class="pull-actions">' +
          (saveSlug ? '<button class="btn xl ghost-dark pull-save">' + ic("dl") + " Save card</button>" : "") +
          '<button class="btn xl pull-ok">Add to binder ' + ic("arrow") + "</button>" +
        "</div>" +
      "</div>";

    // The booster pack: a foil wrapper you tear open. Skipped for reduced-motion.
    var packHTML = reduced ? "" :
      '<button class="pull-pack" aria-label="Rip open your booster pack">' +
        '<span class="pk-glow"></span>' +
        '<span class="pk-main">' +
          '<span class="pk-eyebrow">G Pen University</span>' +
          '<span class="pk-logo"><img src="assets/img/gpen-g-white.png" alt=""/></span>' +
          '<span class="pk-set">Base Set · Booster</span>' +
        "</span>" +
        '<span class="pk-top"></span>' +
        '<span class="pk-hint">' + ic("spark") + " Tap to rip it open</span>" +
      "</button>";

    m.innerHTML = '<div class="pull-in">' +
      '<button class="modal-x" aria-label="Close">×</button>' +
      '<div class="pull-stage">' + packHTML + revealHTML + "</div>" +
    "</div>";
    document.body.appendChild(m); document.body.classList.add("noscroll");
    var release = manageModalFocus(m, kicker || "You pulled a card");

    var autoT;   // declared up here so close() can cancel the auto-open
    // close() tears down EVERYTHING: the old version only unbound the Escape
    // handler if Escape was actually pressed, so closing via the X or the
    // backdrop leaked a document listener per pull — and left the 4.6s auto-open
    // running, firing confetti and a sound into a dismissed modal.
    function close() {
      clearTimeout(autoT);
      document.removeEventListener("keydown", onEsc);
      release(); m.remove(); document.body.classList.remove("noscroll");
    }
    function onEsc(ev) { if (ev.key === "Escape") close(); }
    var save = $(".pull-save", m);
    if (save) save.addEventListener("click", function (ev) { ev.stopPropagation(); saveCardImage(saveSlug); });
    // "Add to binder" flies the card up into the header binder chip.
    var ok = $(".pull-ok", m);
    if (ok) ok.addEventListener("click", function (ev) {
      ev.stopPropagation();
      flyToBinder($(".pull-card > *", m), close);
    });
    m.addEventListener("click", function (ev) {
      if (ev.target === m || ev.target.closest(".modal-x")) close();
    });
    document.addEventListener("keydown", onEsc);

    var pack = $(".pull-pack", m), reveal = $(".pull-reveal", m);
    if (!pack) { sfx.play("pull"); confetti(); return; } // reduced-motion: card is already showing

    var opened = false;
    function open() {
      if (opened) return; opened = true;
      clearTimeout(autoT);
      pack.classList.add("ripping");
      sfx.play("pull");
      confetti();
      // let the tear play, then swap the pack for the card
      setTimeout(function () { if (pack.parentNode) pack.remove(); reveal.hidden = false; }, 560);
    }
    pack.addEventListener("click", function (ev) { ev.stopPropagation(); open(); });
    autoT = setTimeout(open, 4600); // safety: open it for them if they just stare
  }

  // The 30% tier fires once, the first time a second card lands in the binder.
  /* Mid-funnel reward tiers, reported once each. Table-driven because the 4-course
     rung previously had no reporting at all — the middle of the funnel was dark.
     `elite` is deliberately not called "master": that type is the all-5 event. */
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
    var done = baseSetOwned(), s = getState(), e = getEnroll() || {}, changed = false;
    REPORT_TIERS.forEach(function (t) {
      if (done < t.at) return;
      if (!s[t.flag]) { s[t.flag] = { at: new Date().toISOString() }; changed = true; logEvent(t.flag, {}); }
      if (!s[t.flag + "Reported"] &&
          sendReport({ type: t.type, name: e.name, email: e.email, store: e.store, product: t.label, score: 100, certId: "", date: niceDate() })) {
        s[t.flag + "Reported"] = new Date().toISOString();
        changed = true;
      }
    });
    if (changed) setState(s);
  }
  /* The all-5 event used to fire ONLY inside renderCertified(), so a rep who
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
      logEvent("master", { certId: cid });
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
  // Tap the Dean: he hoots, changes his face, and publishes a numbered "Field
  // Note" — a fun cannabis / G Pen history fact — below his byline in the masthead.
  function bindHeroMascot() {
    var hero = $(".mast-og"); if (!hero) return;
    var dean = hero.closest(".mast-dean"), bubble = $("#og-fact");
    var n = 0, last = -1;
    hero.addEventListener("click", function () {
      sfx.play("hoot");
      hero.innerHTML = mascotSVG(pick(["hyped", "think", "proud", "chill"]));
      hero.classList.remove("pop"); void hero.offsetWidth; hero.classList.add("pop");
      if (dean) dean.classList.add("tapped");   // hide the "tap the Dean" nudge once discovered
      if (bubble && FACTS.length) {
        var i; do { i = Math.floor(Math.random() * FACTS.length); } while (FACTS.length > 1 && i === last);
        last = i; n++;
        var f = FACTS[i], num = ("0" + n).slice(-2);
        bubble.innerHTML = '<span class="ogf-eyebrow">Field note Nº ' + num + "</span>" +
          '<span class="ogf-emoji" aria-hidden="true">' + esc(f.emoji || "🦉") + "</span>" +
          '<span class="ogf-text">' + esc(f.text) + "</span>";
        bubble.classList.add("show");
        bubble.classList.remove("pop"); void bubble.offsetWidth; bubble.classList.add("pop");
      }
    });
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
    if (done === 0) return "Get certified on the whole G&nbsp;Pen shelf.";
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
      '<div class="sec-h"><h2>The floor drill</h2><span>What do you hand them?</span></div>' +
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
    if (parts[0] === "collection") return "collection";
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
        nav("collection", "#/collection", '<span class="nl-the">The </span>Binder') +
        nav("about", "#/about", "About") +
      "</nav>" +
      // The language selector only offers English today; picking anything else
      // just toasts "coming soon", so it stays hidden until a locale file exists.
      ((CFG.i18n && CFG.i18n.enabled) ? langSelHTML() : "") +
      '<button class="hdr-sound" id="sound-toggle" title="' + (sfx.isOn() ? "Sound on" : "Sound off") + '" aria-label="Toggle sound" aria-pressed="' + (sfx.isOn() ? "true" : "false") + '">' + ic(sfx.isOn() ? "sound" : "mute") + "</button>" +
      binderPips() +
      // Not a link: it pointed at #/, same as the logo and the Courses tab.
      (e ? '<span class="hdr-user"><span class="hdr-u-name">' + esc(e.name) + '</span><span class="hdr-u-store">' + esc(e.store || "") + "</span></span>" : "") +
    "</header>" +
    '<main id="main" tabindex="-1">';
  }
  /* Five pips, one per product — always five, never a number. A stranger reads
     "there are five of these and I have two" instantly; "3/16" means nothing. */
  function binderPips() {
    var pips = COURSES.map(function (c) {
      return '<i class="pip' + (cardOwned(c.slug) ? " on" : "") + '"></i>';
    }).join("");
    return '<a class="hdr-binder" href="#/collection" aria-label="' + completedCount() + " of " + COURSES.length + ' products certified — open your card binder">' +
      '<span class="pips" aria-hidden="true">' + pips + "</span>" +
      '<span class="hb-word"><b>' + completedCount() + "</b>/" + COURSES.length + "</span>" +
    "</a>";
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

  /* ---- HOME (browse-first hub) ------------------------------------------- */
  function renderHome() {
    var e = getEnroll(), done = completedCount(), total = COURSES.length;
    var master = isMasterEarned();

    app.innerHTML = header() +
      // ---- The masthead. Professor O.G. is the SPEAKER: his speech bubble holds
      // the h1 (his voice, state-aware) on a light paper surface. Tap him → hoot +
      // a numbered "Field Note" fact. The dark moment moves down to the reward + sign-off.
      '<section class="mast reveal">' +
        '<div class="mast-inner">' +
          '<div class="mast-lead">' +
            '<span class="mast-kicker">G Pen University &middot; Certification for budtenders &amp; smoke-shop reps</span>' +
            '<div class="mast-say"><h1 class="mast-h1">' + ogGreetingLine(done, total) + "</h1></div>" +
            '<div class="mast-dean">' +
              '<button class="mast-og" type="button" aria-label="Tap the Dean for a field note">' + mascotSVG("chill") + "</button>" +
              '<div class="mast-plate">' +
                '<span class="og-badge">' + esc(MASCOT.name || "Professor O.G.") + "</span>" +
                '<span class="mast-role">' + esc(MASCOT.title || "Dean of G Pen University") + "</span>" +
                '<span class="og-poke">' + ic("spark") + " Tap the Dean for a field note</span>" +
              "</div>" +
            "</div>" +
          "</div>" +
          '<div class="mast-aside">' +
            '<p class="mast-deck">Free training on all five G&nbsp;Pen products. Pass the quizzes, unlock up to <b>40% off</b> gpen.com' + (drawLive() ? ' &mdash; and ' + prizeCopy().short : "") + ".</p>" +
            '<ul class="mast-stats"><li>5 products</li><li>No sign-up</li><li class="gold">up to 40% off' + (drawLive() ? " + a free device" : "") + "</li></ul>" +
            '<div class="og-fact" id="og-fact" role="status" aria-live="polite"></div>' +
            '<button class="btn mt" type="button" data-scroll="courses">Show me the shelf ' + ic("arrow") + "</button>" +
          "</div>" +
        "</div>" +
      "</section>" +

      '<section class="hub reveal">' +
        resumeStrip() +
        '<div class="sec-h" id="courses"><h2>Learn the G Pen Lineup</h2></div>' +
        '<p class="catalog-lede">Take training courses on all of our current products.</p>' +
        lineupHTML() +
      "</section>" +

      // A single refined lifestyle moment — the gear in real hands, so the scale
      // and the vibe land before the reward story. Not a marquee; one editorial shot.
      lifestyleCinema((window.GPEN_LIFESTYLE || [])[0], "The G Pen life", "This is the gear, in real hands.", "See how it sits in a palm — then get one in yours.", "home") +
      floorDrill() +
      theLoop(done, master) +
      '<section class="signoff reveal"><div class="signoff-inner">' + ogSays("proud", "That&rsquo;s the syllabus. You can&rsquo;t sell what you&rsquo;ve never held &mdash; now go run the floor.") + "</div></section>" +
      footer();

    fillRewards();
    $$("[data-goto]").forEach(function (el) { el.addEventListener("click", function () { go("#/course/" + el.getAttribute("data-goto")); }); });
    $$("[data-scroll]").forEach(function (el) { el.addEventListener("click", function () { scrollToId(el.getAttribute("data-scroll")); }); });
    // (footer "Reset my progress" is bound globally in boot via bindReset — works on every page)
    // Just certified a course? Land home with a little celebration (the masthead
    // redesign dropped the old progress ring, so this is now the payoff moment).
    if (pendingCelebrate) { pendingCelebrate = false; sfx.play("pass"); setTimeout(confetti, 350); }
    revealOnScroll();
  }

  /* Only for someone mid-course. Someone with passes but nothing in flight doesn't
     need a nag — their state is the header pips and the binder. */
  function resumeStrip() {
    var s = getState();
    var open = COURSES.filter(function (c) {
      var r = s.courses[c.slug];
      return r && !r.passed;   // started, not passed
    })[0];
    if (!open) return "";
    return '<a class="resume" href="#/course/' + open.slug + '" style="--accent:' + open.accent + '">' +
      '<span class="rs-txt"><b>Back for more.</b> ' + esc(open.name) + " is still open.</span>" +
      '<span class="rs-go">Pick it up ' + ic("arrow") + "</span>" +
    "</a>";
  }

  /* The Loop — the incentive story, told exactly once, below the shelf.
     Merges what used to be the reward ladder AND the binder teaser. */
  /* The reward story, told ONCE. The collection is already signalled by the
     header pips and the ladder, so the loop drops its 4 step-cards and binder for
     a single 3-beat rail: learn → pass → get paid. */
  function theLoop(done, master) {
    return '<section class="loop reveal">' +
      '<div class="loop-head">' +
        "<h2>Get certified. Get it cheap. Carry it yourself.</h2>" +
        '<p class="loop-sub">Customers trust the staff who actually use it. Put a G&nbsp;Pen in your pocket and you&rsquo;re the rec.</p>' +
      "</div>" +
      '<div class="loop-rail">' +
        '<span class="lr-beat"><i>1</i>Learn it</span>' +
        '<span class="lr-arw">' + ic("arrow") + "</span>" +
        '<span class="lr-beat"><i>2</i>Pass the quiz</span>' +
        '<span class="lr-arw">' + ic("arrow") + "</span>" +
        '<span class="lr-beat gold"><i>%</i>Up to 40% off gpen.com</span>' +
      "</div>" +
      rewardsSection(done, master) +
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
    var folder = ({ "dash-ii": "dash-ii/", "dash-plus": "dash-plus/", "melt-hot-knife": "melt/", "hydout": "hydout/", "510-original": "510-original/" })[slug] || "";
    var all = window.GPEN_LIFESTYLE || [];
    var match = all.filter(function (u) { return folder && u.indexOf(folder) >= 0 && u !== exclude; })[0];
    return match || all.filter(function (u) { return u !== exclude; })[0] || "";
  }
  /* The three steps, stated plainly and up front. This is the first thing a
     budtender should read — it answers "what is this and how does it work". */

  /* A plain, readable course card — the home page lists COURSES, not cards.
     The trading card is the reward you get for finishing one. */
  /* The home lineup, sectioned by product family (mirrors the internal G Pen
     product portal): 510 Batteries, Dry Herb Vaporizers, Concentrate. `match`
     buckets each course by its data.js category; groups with no products drop out. */
  var LINEUP_GROUPS = [
    { key: "dryherb", title: "Dry Herb Vaporizers", sub: "Portable dry-herb devices", icon: "leaf", match: function (c) { return /Dry Herb/i.test(c.category); } },
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
          "<p>Want to go deeper on a device, talk through a customer question, or just say hi? Our customer-service crew has been here since day one and loves talking all things cannabis and vaporizers. Call or email anytime — we love hearing from the people on the floor.</p>" +
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
      '<div class="foot-nav"><a href="#/">Courses</a><a href="#/collection">The Binder</a><a href="#/about">About G Pen</a><a href="' + esc(CFG.shopUrl) + '" target="_blank" rel="noopener">Shop gpen.com</a></div>' +
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

  /* The reward ladder, shown as an "earn it" tracker on the home hub:
       1 course -> 25%   2 -> 30%   4 -> 35%   all 5 -> 40% + free-G Pen draw entry */
  function rewardsSection(done, master) {
    var total = COURSES.length;                 // 5 = the full lineup
    var held = tierAt(done), up = nextTier(done);
    var top = LADDER[LADDER.length - 1];
    var head = !held ? "Pass your first course to start earning"
      : (up ? held.pct + "% off unlocked — " + (up.pct === top.pct ? "one more tier for the top reward" : "keep certifying")
            : "Full lineup certified — the top reward is yours 👑");
    function need(n) { var d = n - done; return d + " more course" + (d === 1 ? "" : "s") + " to unlock"; }
    // Every rung but the last renders as a card; the top rung is the capstone.
    var rungs = LADDER.slice(0, -1).map(function (t) {
      return rewardCard(t.key, done >= t.at, t.pct + "% OFF",
        t.at === 1 ? "Pass any 1 course" : "Certify on any " + t.at + " products", need(t.at));
    }).join("");
    return '<div class="sec-h"><h2>The reward ladder</h2><span>' + head + "</span></div>" +
      '<p class="rw-terms-head">Rewards are for completing training. They are not tied to sales, orders, or product recommendations.</p>' +
      '<div class="rewards">' + rungs + "</div>" +
      grandCard(done >= total, done, total);
  }
  // The all-5 capstone: a free-G-Pen draw entry + the guaranteed 40% code.
  function grandCard(unlocked, done, total) {
    var d = total - done;
    var draw = drawLive();
    return '<div class="rw-card grand ' + (unlocked ? "on" : "off") + '">' +
      '<div class="rw-top"><span class="rw-ic">' + ic(unlocked ? "award" : "lock") + "</span>" +
        // Without a live prize there is no "grand prize" to promise — it's the top rung.
        '<span class="rw-status">' + (unlocked ? (draw ? prizeCopy().statusOn : "Unlocked") : (draw ? "Grand prize" : "Top reward")) + "</span></div>" +
      '<div class="rw-big">' + (draw ? "FREE G PEN <em>+ 40%</em>" : "40% OFF") + "</div>" +
      '<div class="rw-sub">Certify all ' + total + " &mdash; " + (draw ? prizeCopy().rule + " 40% off is yours either way." : "the whole lineup unlocks 40% off gpen.com.") + "</div>" +
      (unlocked
        ? '<button class="rw-code" data-rwcode="secret"><span class="rw-code-v">••••••</span><em>' + ic("tag") + " Tap to copy</em></button>" +
          '<a class="rw-cert" href="#/certified">View master certificate &rarr;</a>' +
          // grandCard bypasses rewardCard, so it needs its own terms line.
          rwTermsHTML("secret")
        : '<div class="rw-lock">' + ic("spark") + " " + d + " more course" + (d === 1 ? "" : "s") + " to unlock</div>") +
    "</div>";
  }
  // "Whether it expires / stacks / is single-use" is the first thing a dispensary
  // partner asks — answer it wherever a code is shown, not just in the config.
  function rwTermsHTML(type) {
    var t = ((CFG.discount || {})[type] || {}).terms;
    return t ? '<p class="rw-terms">' + esc(t) + "</p>" : "";
  }
  function rewardCard(type, unlocked, big, sub, lockMsg) {
    var isSecret = type === "secret";
    if (unlocked) lockMsg = "";
    return '<div class="rw-card ' + (unlocked ? "on" : "off") + (isSecret ? " secret" : "") + '">' +
      '<div class="rw-top"><span class="rw-ic">' + ic(unlocked ? (isSecret ? "spark" : "tag") : "lock") + '</span><span class="rw-status">' + (unlocked ? "Unlocked" : "Locked") + "</span></div>" +
      '<div class="rw-big">' + big + "</div>" +
      '<div class="rw-sub">' + sub + "</div>" +
      (unlocked
        ? '<button class="rw-code" data-rwcode="' + type + '"><span class="rw-code-v">••••••</span><em>' + ic("tag") + " Tap to copy</em></button>" +
          '<a class="rw-shop" href="' + esc(CFG.shopUrl) + '" target="_blank" rel="noopener">Shop gpen.com ' + ic("arrow") + "</a>" +
          // The master certificate needs all 5 courses — it belongs on the 40% (all-lineup) card.
          (isSecret ? '<a class="rw-cert" href="#/certified">View master certificate →</a>' : "") +
          rwTermsHTML(type)
        : '<div class="rw-lock">' + ic(isSecret ? "spark" : "lock") + " " + lockMsg + "</div>") +
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
            '<div class="ch-meta">' + c.videos.length + " videos · " + c.quiz.length + "-question quiz · pass " + c.passPct + "% · ~" + c.minutes + " min</div>" +
          "</div>" +
        "</div>" +

        // SELLING LEADS. The battlecard is the only floor-usable asset here and it
        // used to sit below ~8 minutes of video, a gallery, an 11-row spec table,
        // cleaning steps and an FAQ. Moving it up also makes it the advance
        // organizer these courses lacked, and puts the memorable floor facts ahead
        // of the spec dump instead of after it.
        (c.howToSell && c.howToSell.keyFacts && c.howToSell.keyFacts.length
          ? secHead(++n, "Three things to remember") + floorFactsHTML(c) : "") +

        (c.howToSell ? secHead(++n, "How to sell it") + howToSellHTML(c) : "") +

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
        lifestyleCinema(productLifeImg(c.slug, c.heroImg), "In the wild", "The " + c.name + " out in the world.") +

        (c.howToUse && c.howToUse.length ? secHead(++n, "How to use it") + stepListHTML(c.howToUse) : "") +
        (c.howToClean && c.howToClean.length ? secHead(++n, "How to clean & care") + stepListHTML(c.howToClean) : "") +
        (c.specs && c.specs.length ? secHead(++n, "Tech specs") + specTableHTML(c.specs) : "") +
        (c.faq && c.faq.length ? secHead(++n, "FAQ") + faqHTML(c.faq) : "") +
        factCard() +

        secHead(++n, "Get certified") +
        ogSays("think", ogLine("quizIntro")) +
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
      (sces ? '<div class="sell-scns"><h4>On the floor &mdash; real situations</h4>' + sces + "</div>" : "") +
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
    var owned = cardOwned(c.slug);
    var pct = owned ? null : unlockPct(completedCount());
    zone.innerHTML =
      '<div class="certify">' +
        '<div class="certify-badge">' + ic("award") + "</div>" +
        "<h3>" + (owned ? "Retake the quiz" : "Get certified" + (pct ? " &amp; unlock " + pct + "% off" : "")) + "</h3>" +
        '<p class="lead">' + (owned
          ? "Retake the " + c.quiz.length + "-question quiz (score " + c.passPct + "%+) to refresh your score on your <strong>" + esc(c.name) + "</strong> certificate. Your discount code is unchanged."
          : "Ready? Pass the " + c.quiz.length + "-question quiz (score " + c.passPct + "%+) to earn your <strong>" + esc(c.name) + "</strong> Product Specialist certificate and a gpen.com discount code. Enter your details so we can put your name on the certificate.") + "</p>" +
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
    // Record the attempt so home can offer to pick it back up. resumeStrip() has
    // always looked for a started-but-unpassed course, but nothing ever wrote
    // one, so the returning-rep affordance never appeared. completedCount() and
    // cardOwned() both gate on .passed, so this never counts as a certification —
    // and the guard makes sure a failed RETAKE can't wipe an earned certificate.
    var fs = getState();
    if (!fs.courses[c.slug] || !fs.courses[c.slug].passed) {
      fs.courses[c.slug] = { passed: false, attempted: new Date().toISOString(), score: pct };
      setState(fs);
    }
    var needCorrect = Math.ceil((c.passPct / 100) * c.quiz.length);
    var away = Math.max(1, needCorrect - correct);
    zone.innerHTML = '<div class="result fail">' +
      gradeHTML(pct, points) +
      '<div class="result-score">' + pct + '%<span>' + correct + "/" + c.quiz.length + "</span></div>" +
      "<h3>" + esc(quip("fail")) + "</h3><p>So close &mdash; you were <b>" + away + "</b> question" + (away === 1 ? "" : "s") + " from the " + c.passPct + "% you need. Look over the ones below and run it back.</p>" +
      '<button class="btn xl" id="retry">' + ic("refresh") + " Retry quiz</button>" +
    "</div>" +
    missedReviewHTML(c, order, answers);
    $("#retry").addEventListener("click", function () { runQuiz(c); });
    zone.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function quizPass(c, correct, pct, points, order, answers) {
    var e = getEnroll();
    var date = niceDate(), cid = certId(e.name + "|" + c.name + "|" + date);
    var s = getState();
    var prev = s.courses[c.slug];
    var firstTime = !(prev && prev.passed);
    // Keep the higher score AND its certificate — a lower retake never downgrades
    // a rep who already certified (the certified screen invites retakes).
    var improved = !prev || !prev.passed || pct > (prev.score || 0);
    var rec = improved ? { passed: true, score: pct, certId: cid, date: date, name: e.name } : prev;
    s.courses[c.slug] = rec;
    setState(s);
    if (firstTime) {
      pendingCelebrate = true; // ring pulses + confetti next time they hit home
      markFresh(c.slug);
      if (isMasterEarned()) markFresh("secret"); // that pull revealed the secret rare
    }
    // Courses first, so a late webhook receives them ahead of the tier rows they justify.
    reportCourses();
    maybeReportTier();   // 30% at 2 certified courses, 35% at 4
    reportMaster();      // record the all-5 event here, not on a page they may never open
    refreshCounters();
    var streak = touchStreak();
    logEvent("certified", { course: c.slug, certId: cid, score: pct });
    sfx.play("pass");

    var master = isMasterEarned();
    if (firstTime) {
      var left = COURSES.length - baseSetOwned();
      var note = master
        ? "<b>Base Set complete.</b> The Certified G secret rare is yours."
        : "<b>" + left + "</b> more card" + (left === 1 ? "" : "s") + " to complete the " + esc(SET.name) + ".";
      if (pct === 100) note = "<b>★ Perfect score.</b> " + note;
      // Prof. O.G. hypes the pull
      note = '<span class="og-say">' + ogMini(pct === 100 ? "proud" : "hyped") +
        "<em>&ldquo;" + (pct === 100 ? ogLine("perfect") : ogLine("pull")) + "&rdquo;</em></span>" + note;
      // let the pass banner paint before the pack opens
      setTimeout(function () { showPull("You pulled a card!", tcgCard(c), note, c.slug); }, 550);
    } else {
      confetti();
    }
    var progNote = firstTime ? ""
      : (improved ? " <b>New personal best!</b>" : " Your best score of <b>" + rec.score + "%</b> stays on your certificate.");
    var next = firstTime && !master ? nextCourse(c.slug) : null;
    var zone = $("#quiz-zone");
    zone.innerHTML = '<div class="result pass">' +
        gradeHTML(pct, points) +
        '<div class="result-score">' + pct + '%<span>' + correct + "/" + c.quiz.length + "</span></div>" +
        "<h3>" + ic("check") + " " + esc(quip("pass")) + "</h3><p>You're now a certified <strong>" + esc(c.name) + "</strong> Product Specialist." + progNote + "</p>" +
      "</div>" +
      '<div id="cert-zone"></div>' +
      '<div id="reward-zone" class="reward-wrap"></div>' +
      missedReviewHTML(c, order, answers) +
      (master ? '<a class="master-unlock" href="#/certified">' + ic("award") + " Full lineup certified — you pulled the <strong>Certified G</strong>! Your certificate, <strong>40% off</strong>" + (drawLive() ? " &amp; your shot at a free device" : "") + " " + ic("arrow") + "</a>"
              : next ? '<a class="btn xl nextup-cta" href="#/course/' + next.slug + '">Next up: ' + esc(next.name) + " " + ic("arrow") + "</a>" +
                       '<a class="linklike backdash" href="#/">or back to all courses</a>'
              : '<a class="btn ghost xl backdash" href="#/">Back to all courses ' + ic("arrow") + "</a>");
    showCertificate(c, e.name, rec.date, rec.score, rec.certId, $("#cert-zone"));
    // State is already saved above, so completedCount() includes this pass —
    // mint the tier they now hold (5/5 must issue 40%, not the 25% first rung).
    revealReward(earnedTierKey(), { courseSlug: c.slug, name: e.name, email: e.email, store: e.store, certId: cid }, $("#reward-zone"));
    zone.scrollIntoView({ behavior: "smooth", block: "start" });
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
      $("#code-copy").addEventListener("click", function () {
        var t = r.code;
        if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { toast("Code copied!"); }, function () { toast(t); });
        else toast(t);
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

  /* =========================================================================
     SAVE A CARD AS AN IMAGE
     Renders the trading card to a 1080x1500 canvas so it can be posted. The
     product photos come from the Shopify CDN, which is CORS-clean, so the
     canvas stays untainted and toBlob() works.
     ====================================================================== */
  function cardImageSpec(slug) {
    if (slug === "secret") {
      var st = secretCardState(); if (st === "locked") return null;
      var sc = SECRET_CARD, en = getEnroll();
      return {
        gold: true, name: sc.name, stage: (st === "gold" ? "Gold Foil" : "Holo") + " · " + sc.code,
        power: sc.power, powerUnit: "", el: ELEMENTS.gold,
        typeLeft: en ? en.name : "Product Specialist", typeRight: "40% OFF",
        moves: sc.moves, stats: [{ k: "Lineup", v: baseSetOwned() + "/" + COURSES.length }, { k: "Reward", v: "40% off" }, { k: "Rank", v: "Certified G" }],
        flavor: sc.flavor, no: sc.no, rarity: "secret", img: "assets/img/gpen-g-white.png", tint: "#c8952f", accent: "#FEC870",
      };
    }
    var c = courseBySlug(slug), cd = CARDS[slug];
    if (!c || !cd || !cardOwned(slug)) return null;
    var el = ELEMENTS[cd.element] || {};
    return {
      gold: false, name: c.name, stage: "Basic · " + cd.code, power: cd.power, powerUnit: cd.powerUnit, el: el,
      typeLeft: c.category, typeRight: c.msrp, moves: cd.moves, stats: cd.statsRow, flavor: c.tagline,
      no: cd.no, rarity: cd.rarity, img: c.cover, tint: el.tint || "#888", accent: c.accent,
      score: cardScore(slug),
    };
  }
  function saveCardImage(slug) {
    var spec = cardImageSpec(slug);
    if (!spec) return toast("Collect that card first.");
    toast("Building your card…");
    var img = new Image(); img.crossOrigin = "anonymous";
    var done = false, go2 = function (i) { if (done) return; done = true; paintCard(spec, i); };
    img.onload = function () { go2(img); };
    img.onerror = function () { go2(null); };
    img.src = spec.img;
    setTimeout(function () { go2(img.complete && img.naturalWidth ? img : null); }, 2600);
  }
  function paintCard(sp, art) {
    var W = 1080, H = 1440, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    var x = cv.getContext("2d");
    var GOLD = "#FEC870", GOLD2 = "#C8952F", INK = "#111", STONE = "#6e6e66", PAPER = "#ffffff";
    var dark = sp.gold;
    function ls(v) { try { x.letterSpacing = v; } catch (e) {} }

    // foil border
    var fg = x.createLinearGradient(0, 0, W, H);
    if (dark) { fg.addColorStop(0, "#8a6b28"); fg.addColorStop(.25, "#f7e2a4"); fg.addColorStop(.5, "#c8952f"); fg.addColorStop(.75, "#fff3cf"); fg.addColorStop(1, "#8a6b28"); }
    else { fg.addColorStop(0, "#f2c75a"); fg.addColorStop(.3, "#d9a63c"); fg.addColorStop(.55, "#f7e2a4"); fg.addColorStop(.8, "#c8952f"); fg.addColorStop(1, "#f2c75a"); }
    x.fillStyle = fg; roundRectPath(x, 0, 0, W, H, 46); x.fill();

    // card face
    var P = 30, IX = P, IY = P, IW = W - P * 2, IH = H - P * 2;
    if (dark) { var dg = x.createLinearGradient(0, IY, 0, IY + IH); dg.addColorStop(0, "#2a2110"); dg.addColorStop(1, "#15100a"); x.fillStyle = dg; }
    else x.fillStyle = PAPER;
    roundRectPath(x, IX, IY, IW, IH, 26); x.fill();

    var L = IX + 34, R = IX + IW - 34, y = IY + 62;
    var fgTxt = dark ? "#f6ecd4" : INK, subTxt = dark ? "#b39a63" : STONE;

    // header
    x.textAlign = "left"; x.textBaseline = "alphabetic";
    ls("3px"); x.font = '800 20px Archivo, sans-serif'; x.fillStyle = subTxt;
    x.fillText(sp.stage.toUpperCase(), L, y); ls("0px");
    y += 58;
    x.font = '900 62px Archivo, sans-serif'; x.fillStyle = fgTxt;
    x.fillText(sp.name, L, y);
    x.textAlign = "right";
    var elTxt = sp.el && sp.el.emoji ? sp.el.emoji : "";
    x.font = '900 44px Archivo, sans-serif';
    var pw = x.measureText(sp.power).width;
    x.font = '400 40px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
    x.fillText(elTxt, R, y);
    var emW = x.measureText(elTxt).width + 14;
    x.font = '900 44px Archivo, sans-serif'; x.fillStyle = fgTxt;
    x.fillText(sp.power, R - emW, y);
    if (sp.powerUnit) {
      x.font = '800 22px Archivo, sans-serif'; x.fillStyle = subTxt;
      x.fillText(sp.powerUnit, R - emW - pw - 10, y);
    }
    x.textAlign = "left"; // header drew right-aligned; everything below is left-aligned
    y += 30;

    // art window
    var AW = R - L, AH = 545;
    var ag = x.createLinearGradient(L, y, R, y + AH);
    if (dark) { ag.addColorStop(0, "#4a3a17"); ag.addColorStop(1, "#14100a"); }
    else { ag.addColorStop(0, mix(sp.tint, "#ffffff", .84)); ag.addColorStop(1, mix(sp.accent, "#ffffff", .74)); }
    x.save(); roundRectPath(x, L, y, AW, AH, 14); x.clip();
    x.fillStyle = ag; x.fillRect(L, y, AW, AH);
    // owned cards are foiled; the product then prints clean on top
    if (sp.score || dark) drawFoil(x, L + AW / 2, y + AH / 2, Math.max(AW, AH), dark);
    if (art) {
      var pad = dark ? 96 : 34;
      var maxW = AW - pad * 2, maxH = AH - pad * 2;
      var sc = Math.min(maxW / art.naturalWidth, maxH / art.naturalHeight);
      var dw = art.naturalWidth * sc, dh = art.naturalHeight * sc;
      x.drawImage(art, L + (AW - dw) / 2, y + (AH - dh) / 2, dw, dh);
    }
    x.restore();
    x.strokeStyle = dark ? "rgba(200,149,47,.5)" : "rgba(0,0,0,.12)"; x.lineWidth = 6;
    roundRectPath(x, L, y, AW, AH, 14); x.stroke();
    // certified stamp
    if (sp.score) {
      x.fillStyle = INK; roundRectPath(x, L + 20, y + 20, 268, 54, 27); x.fill();
      x.fillStyle = GOLD; x.font = '900 22px Archivo, sans-serif'; x.textAlign = "center"; ls("2px");
      x.fillText("CERTIFIED " + sp.score + "%", L + 154, y + 55); ls("0px");
      if (sp.score === 100) {
        var pg = x.createLinearGradient(R - 240, 0, R - 20, 0); pg.addColorStop(0, "#f7e2a4"); pg.addColorStop(1, "#c8952f");
        x.fillStyle = pg; roundRectPath(x, R - 216, y + 20, 196, 54, 27); x.fill();
        x.fillStyle = "#3a2a05"; x.font = '900 22px Archivo, sans-serif'; ls("2px");
        x.fillText("★ PERFECT", R - 118, y + 55); ls("0px");
      }
      x.textAlign = "left";
    }
    y += AH + 28;

    // type bar
    x.fillStyle = dark ? "rgba(200,149,47,.16)" : mix(sp.tint, "#faf9f5", .88);
    roundRectPath(x, L, y, AW, 62, 8); x.fill();
    x.fillStyle = sp.tint; x.fillRect(L, y + 4, 8, 54);
    x.font = '800 24px Archivo, sans-serif'; x.fillStyle = dark ? GOLD : INK; ls("1px");
    x.fillText(sp.typeLeft.toUpperCase(), L + 26, y + 41); ls("0px");
    x.textAlign = "right"; x.font = '900 28px Archivo, sans-serif';
    x.fillText(sp.typeRight, R - 22, y + 42); x.textAlign = "left";
    y += 62 + 34;

    // moves
    (sp.moves || []).forEach(function (m) {
      var dots = "";
      for (var i = 0; i < (m.cost || 1); i++) dots += (sp.el && sp.el.emoji ? sp.el.emoji : "●");
      x.font = '400 26px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
      x.fillText(dots, L, y + 4);
      var tx = L + 30 + (m.cost || 1) * 30;
      x.font = '900 32px Archivo, sans-serif'; x.fillStyle = fgTxt;
      x.fillText(m.name, tx, y + 4);
      if (m.dmg) { x.textAlign = "right"; x.font = '900 32px Archivo, sans-serif'; x.fillText(m.dmg, R, y + 4); x.textAlign = "left"; }
      y += 34;
      x.font = '400 23px Archivo, sans-serif'; x.fillStyle = subTxt;
      y = wrapLeft(x, m.text, tx, y + 6, R - tx - 90, 31) + 40;
    });

    // stats strip
    x.strokeStyle = dark ? "rgba(200,149,47,.3)" : "rgba(0,0,0,.1)"; x.lineWidth = 2;
    x.beginPath(); x.moveTo(L, y); x.lineTo(R, y); x.stroke();
    var cw = AW / (sp.stats.length || 1);
    x.textAlign = "center";
    (sp.stats || []).forEach(function (st, i) {
      var cxp = L + cw * i + cw / 2;
      ls("2px"); x.font = '800 19px Archivo, sans-serif'; x.fillStyle = subTxt;
      x.fillText(st.k.toUpperCase(), cxp, y + 34); ls("0px");
      x.font = '900 28px Archivo, sans-serif'; x.fillStyle = fgTxt;
      x.fillText(st.v, cxp, y + 68);
    });
    x.textAlign = "left";
    y += 88;
    x.beginPath(); x.moveTo(L, y); x.lineTo(R, y); x.stroke();
    y += 44;

    // flavor
    x.font = 'italic 400 24px Archivo, sans-serif'; x.fillStyle = subTxt;
    y = wrapLeft(x, sp.flavor, L, y, AW - 20, 33);

    // footer band
    var fy = IY + IH - 46;
    ls("2px"); x.font = '800 19px Archivo, sans-serif'; x.fillStyle = subTxt;
    x.fillText("TRAINING.GPEN.COM · #CERTIFIEDG", L, fy);
    x.textAlign = "right"; x.fillStyle = dark ? GOLD : (sp.rarity === "common" ? subTxt : GOLD2);
    var sym = (RARITY[sp.rarity] || {}).sym || "●";
    x.fillText(sp.no + "/" + SET.total + "  " + sym, R, fy);
    ls("0px"); x.textAlign = "left";

    var fname = "gpen-card-" + sp.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".png";
    if (cv.toBlob) cv.toBlob(function (b) {
      if (!b) { toast("Couldn't export image"); return; }
      dl(URL.createObjectURL(b), fname); toast("Card saved! 🃏");
    }, "image/png");
    else { dl(cv.toDataURL("image/png"), fname); toast("Card saved! 🃏"); }
  }
  /* Starburst foil for the exported card, so the PNG matches what's on screen:
     a rainbow (or gold) wash, then thin white rays radiating from the centre. */
  function drawFoil(ctx, cx, cy, r, dark) {
    ctx.save();
    if (ctx.createConicGradient) {
      var cg = ctx.createConicGradient(Math.PI * 7 / 6, cx, cy);
      var stops = dark
        ? ["rgba(255,214,0,.34)", "rgba(255,166,60,.34)", "rgba(255,244,200,.34)", "rgba(200,149,47,.34)", "rgba(255,214,0,.34)"]
        : ["rgba(255,0,128,.26)", "rgba(255,214,0,.26)", "rgba(0,255,196,.26)", "rgba(0,153,255,.26)", "rgba(190,0,255,.26)", "rgba(255,0,128,.26)"];
      stops.forEach(function (c, i) { cg.addColorStop(i / (stops.length - 1), c); });
      ctx.fillStyle = cg; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    // rays
    ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
    ctx.fillStyle = dark ? "rgba(255,232,170,.16)" : "rgba(255,255,255,.55)";
    var n = 72;
    for (var i = 0; i < n; i++) {
      var a0 = (i / n) * Math.PI * 2, a1 = a0 + (Math.PI * 2 / n) * 0.34;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, a0, a1); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  // left-aligned word wrap; returns the y of the last line drawn
  function wrapLeft(ctx, text, x0, y0, max, lh) {
    var words = String(text).split(" "), line = "", lines = [];
    for (var i = 0; i < words.length; i++) {
      var t = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(t).width > max && line) { lines.push(line); line = words[i]; } else line = t;
    }
    if (line) lines.push(line);
    lines.forEach(function (ln, i) { ctx.fillText(ln, x0, y0 + i * lh); });
    return y0 + (lines.length - 1) * lh;
  }
  // blend two hex colours (t = how much of `b`)
  function mix(a, b, t) {
    function h(c) { c = c.replace("#", ""); if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2]; return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)]; }
    var A = h(a), B = h(b);
    return "rgb(" + A.map(function (v, i) { return Math.round(v + (B[i] - v) * t); }).join(",") + ")";
  }

  /* The finish-line moment. Copy comes from prizeCopy() so it always matches the
     configured mechanic; the completion is logged via the webhook, which is also
     what counts positions and picks winners (see REPORTING.md). */
  function sweepsPanelHTML(e) {
    var p = prizeCopy();
    return '<div class="sweeps reveal">' +
      '<span class="sw-eyebrow">' + ic("spark") + " Full lineup certified &mdash; " + esc(p.statusOn.toLowerCase()) + "</span>" +
      '<h2 class="sw-h">' + p.headline + " 🦉</h2>" +
      '<p class="sw-body">That&rsquo;s the whole shelf, certified. ' + p.rule + " We&rsquo;ll email you if it&rsquo;s you. Either way your <b>40% off</b> is live today &mdash; grab one, put it in your pocket, and let &ldquo;this is the one I use&rdquo; close the sale.</p>" +
      '<div class="sw-actions">' +
        '<button class="btn xl sw-copy">' + ic("tag") + " Copy your 40% code</button>" +
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
        '<div class="tcg-grid single">' + secretCardHTML() + "</div>" +
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
    $("#cert-ig").addEventListener("click", function () { drawShareCard({ kind: "master", name: e.name, cid: cid }); });
    $("#cert-mail").addEventListener("click", function () {
      var body = "I'm now a G Pen Certified Specialist!\n\nName: " + e.name + "\nStore: " + (e.store || "") + "\nEmail: " + (e.email || "") + "\nDate: " + date + "\nCertificate ID: " + cid;
      window.location.href = "mailto:" + CFG.contactEmail + "?subject=" + encodeURIComponent("G Pen Certified Specialist") + "&body=" + encodeURIComponent(body);
    });
    // The all-5 code is the 40% (CERTIFIEDG40), not the 4-course 35% — reconcile it here.
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

  /* A proper university seal: ring text, est. date, motto. */
  // Drifting vapor wisps for a hero background — it's a vaporizer site, after all.
  function vaporHTML(n) {
    var out = "";
    for (var i = 0; i < (n || 5); i++) {
      var size = 90 + Math.round(Math.random() * 90);
      var left = Math.round(Math.random() * 100);
      var dur = 9 + Math.round(Math.random() * 9);
      var delay = -Math.round(Math.random() * dur);
      out += '<span class="vap" style="left:' + left + "%;width:" + size + "px;height:" + size +
        "px;animation-duration:" + dur + "s;animation-delay:" + delay + 's"></span>';
    }
    return '<div class="vapor" aria-hidden="true">' + out + "</div>";
  }
  // The Grenco University seal. Ids are made unique \u2014 the crest appears more than
  // once per page and duplicate <defs> ids make later copies reuse the first path.
  function crestSVG(cls) {
    var u = "cr" + (crestSVG.n = (crestSVG.n || 0) + 1);
    return '<svg class="crest ' + (cls || "") + '" viewBox="0 0 120 120" aria-hidden="true">' +
      "<defs>" +
        '<path id="' + u + 't" d="M16,60 A44,44 0 0 1 104,60" fill="none"/>' +
        '<path id="' + u + 'b" d="M19,60 A41,41 0 0 0 101,60" fill="none"/>' +
      "</defs>" +
      '<circle cx="60" cy="60" r="58" class="cr-ring"/>' +
      '<circle cx="60" cy="60" r="49" class="cr-ring thin"/>' +
      '<circle cx="60" cy="60" r="34" class="cr-disc"/>' +
      '<text class="cr-t"><textPath href="#' + u + 't" startOffset="50%" text-anchor="middle">GRENCO UNIVERSITY</textPath></text>' +
      '<text class="cr-t sm"><textPath href="#' + u + 'b" startOffset="50%" text-anchor="middle">IN VAPORE VERITAS</textPath></text>' +
      '<text class="cr-star" x="14" y="64">\u2726</text><text class="cr-star" x="100" y="64">\u2726</text>' +
      '<text class="cr-est" x="60" y="54" text-anchor="middle">EST.</text>' +
      '<text class="cr-yr" x="60" y="74" text-anchor="middle">2012</text>' +
    "</svg>";
  }

  /* ---- THE BINDER (card collection) -------------------------------------- */
  // Wrap a card in a translucent plastic sleeve pocket (the binder page slot).
  function pocket(inner, filled) {
    return '<div class="pocket' + (filled ? " filled" : "") + '">' + inner + "</div>";
  }
  function renderCollection() {
    setTitleDoc("The Binder");
    var e = getEnroll();
    var st = secretCardState();
    var owned = ownedCards(), total = totalCards();
    var pct = Math.round((owned / total) * 100);
    var a = window.GPEN_ABOUT || {};

    app.innerHTML = header() +
      '<section class="binder reveal">' +
        '<a class="back" href="#/">' + ic("back") + " All courses</a>" +
        '<div class="bn-hero">' +
          vaporHTML(5) +
          crestSVG("big") +
          '<span class="ch-eyebrow">' + ic("cap") + " The Collection</span>" +
          "<h1>The Binder</h1>" +
          "<p>" + (e ? esc(e.name) + "&rsquo;s collection" : "Your collection") + " &mdash; admire your holos and fill every empty slot.</p>" +
          '<div class="bn-meter"><div class="bn-meter-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="bn-count"><b>' + owned + "</b> of " + total + " cards &middot; " + pct + "% complete</div>" +
        "</div>" +

        ogSays(owned === total ? "proud" : "chill", ogLine(owned === total ? "binderFull" : "binder")) +
        // One clean page: the 5 product cards + the gold Certified G as the 6th.
        '<div class="tcg-grid pockets binder-grid">' +
          COURSES.map(function (c) { return pocket(tcgCard(c), cardOwned(c.slug)); }).join("") +
          pocket(secretCardHTML(), st !== "locked") +
        "</div>" +

        '<div class="bn-share">' +
          "<h3>" + ic("share") + " Show off the collection</h3>" +
          "<p>Post it, tag <b>@gpen</b>, and let the rest of the floor know who&rsquo;s stacking cards.</p>" +
          '<div class="bn-share-row">' +
            (rarestOwned() ? '<button class="btn xl" id="savecard">' + ic("dl") + " Save my best card</button>" : "") +
            '<button class="btn xl ghost" id="brag">' + ic("share") + " Copy my brag</button>" +
            (a.social && a.social[0] ? '<a class="btn xl ghost" href="' + esc(a.social[0].url) + '" target="_blank" rel="noopener">Follow ' + esc(a.social[0].handle) + " " + ic("arrow") + "</a>" : "") +
          "</div>" +
        "</div>" +
        factCard() +
      "</section>" + footer();

    var brag = $("#brag");
    if (brag) brag.addEventListener("click", function () { copyText(bragText(), "Brag copied — go post it \uD83C\uDCCF"); });
    var sv = $("#savecard");
    if (sv) sv.addEventListener("click", function () { saveCardImage(rarestOwned()); });
    bindCardInspect();
    // They've now seen the new cards in the binder — retire the stickers, but
    // leave them on screen long enough to be noticed.
    if (Object.keys(getState().fresh).length) setTimeout(clearFresh, 4500);
    revealOnScroll();
  }
  /* =========================================================================
     CARD INSPECTOR — pull a card out of the sleeve and really look at it.
     Big, holographic, tilts with your pointer/finger, and flips to the back.
     ====================================================================== */
  function cardBackHTML() {
    return '<div class="tcg cardback"><span class="tcg-inner">' +
      '<span class="cb-art"><img src="assets/img/gpen-g-white.png" alt=""/></span>' +
      '<span class="cb-name">G Pen University</span>' +
      '<span class="cb-sub">' + esc(SET.name) + " · Product Specialist Program</span>" +
    "</span></div>";
  }
  function openCardInspector(slug) {
    var isSecret = slug === "secret";
    var c = isSecret ? null : courseBySlug(slug);
    if (!isSecret && !c) return;
    var cd = isSecret ? SECRET_CARD : CARDS[slug];
    var name = isSecret ? (SECRET_CARD && SECRET_CARD.name) || "Certified G" : c.name;
    var rar = (RARITY[cd && cd.rarity] || {}).label || "";
    var no = cd ? cd.no + "/" + SET.total : "";

    var m = document.createElement("div");
    m.className = "modal insp-modal";
    m.innerHTML = '<div class="insp-in">' +
      '<button class="modal-x" aria-label="Close">×</button>' +
      '<div class="insp-stage">' +
        '<div class="insp-card" id="insp-card">' +
          '<div class="insp-face front">' + (isSecret ? secretCardHTML() : tcgCard(c)) + "</div>" +
          '<div class="insp-face back">' + cardBackHTML() + "</div>" +
        "</div>" +
      "</div>" +
      '<div class="insp-meta"><b>' + esc(name) + "</b><span>" + esc(no) + (rar ? " · " + esc(rar) : "") + "</span></div>" +
      '<div class="insp-actions">' +
        '<button class="btn ghost-dark insp-flip">' + ic("refresh") + " Flip</button>" +
        '<button class="btn ghost-dark insp-save">' + ic("dl") + " Save</button>" +
        (isSecret ? '<a class="btn" href="#/certified">View certificate ' + ic("arrow") + "</a>"
                  : '<a class="btn" href="#/course/' + esc(slug) + '">Review course ' + ic("arrow") + "</a>") +
      "</div>" +
    "</div>";
    document.body.appendChild(m); document.body.classList.add("noscroll");
    sfx.play("whoosh");

    // the card inside is a link — neutralise it so clicking just inspects
    var inner = $(".insp-face.front .tcg", m);
    if (inner) { inner.removeAttribute("href"); inner.style.cursor = "default"; }

    var card = $("#insp-card", m), stage = $(".insp-stage", m);
    var flipped = false;
    // This was the only overlay without dialog semantics or a focus trap, and its
    // Escape handler leaked unless Escape was the thing that closed it.
    var release = manageModalFocus(m, "Card: " + name);
    function close() { document.removeEventListener("keydown", onEsc); release(); m.remove(); document.body.classList.remove("noscroll"); }
    function onEsc(ev) { if (ev.key === "Escape") close(); }
    $(".modal-x", m).addEventListener("click", close);
    m.addEventListener("click", function (ev) { if (ev.target === m) close(); });
    document.addEventListener("keydown", onEsc);
    $(".insp-flip", m).addEventListener("click", function () {
      flipped = !flipped;
      card.style.setProperty("--flip", flipped ? "180deg" : "0deg");
      sfx.play("flip");
      // swap the faces while the card is edge-on (mid-turn)
      setTimeout(function () { card.classList.toggle("show-back", flipped); }, 230);
    });
    $(".insp-save", m).addEventListener("click", function () { saveCardImage(slug); });

    // tilt + holo follow the pointer (and finger)
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function track(px, py) {
      if (reduced) return;
      card.style.setProperty("--rx", ((0.5 - py) * 22).toFixed(2) + "deg");
      card.style.setProperty("--ry", ((px - 0.5) * 26).toFixed(2) + "deg");
      var t = $(".insp-face.front .tcg", m);
      if (t) { t.style.setProperty("--mx", (px * 100).toFixed(1) + "%"); t.style.setProperty("--my", (py * 100).toFixed(1) + "%"); }
    }
    function fromEvent(ev) {
      var r = stage.getBoundingClientRect();
      var pt = ev.touches ? ev.touches[0] : ev;
      track((pt.clientX - r.left) / r.width, (pt.clientY - r.top) / r.height);
    }
    stage.addEventListener("pointermove", fromEvent);
    stage.addEventListener("touchmove", function (ev) { ev.preventDefault(); fromEvent(ev); }, { passive: false });
    stage.addEventListener("pointerleave", function () {
      card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg");
    });
  }
  // In the binder, a card you OWN opens the inspector instead of navigating away.
  function bindCardInspect() {
    $$(".pocket .tcg[data-card]").forEach(function (el) {
      var slug = el.getAttribute("data-card");
      var owned = slug === "secret" ? secretCardState() !== "locked" : cardOwned(slug);
      if (!owned) return; // not earned yet — let the link take them to the course
      el.addEventListener("click", function (ev) {
        ev.preventDefault();
        // preventDefault can leave activeElement on <body>, so manageModalFocus
        // would capture nothing and drop focus on close. Focus the card first.
        if (el.focus) el.focus();
        openCardInspector(slug);
      });
    });
  }

  // The best card they hold: the secret rare if revealed, else the rarest product card.
  function rarestOwned() {
    if (secretCardState() !== "locked") return "secret";
    var order = { rare: 3, uncommon: 2, common: 1 };
    var best = null, bestScore = 0;
    COURSES.forEach(function (c) {
      if (!cardOwned(c.slug)) return;
      var r = (CARDS[c.slug] || {}).rarity;
      var sc = (order[r] || 0) * 1000 + cardScore(c.slug);
      if (sc > bestScore) { bestScore = sc; best = c.slug; }
    });
    return best;
  }
  // The line they paste into a story or a group chat.
  function bragText() {
    var e = getEnroll();
    var names = COURSES.filter(function (c) { return cardOwned(c.slug); }).map(function (c) { return c.name; });
    var st = secretCardState();
    var lead = st === "gold" ? "I pulled the GOLD Certified G card \uD83D\uDC51"
      : st === "holo" ? "I completed the Base Set and pulled Certified G \u2728"
      : names.length ? "I\u2019m " + ownedCards() + "/" + totalCards() + " cards into G Pen University \uD83C\uDCCF"
      : "I\u2019m collecting cards at G Pen University \uD83C\uDCCF";
    return lead +
      (names.length ? "\nCertified on: " + names.join(", ") : "") +
      (e && e.store ? "\n" + e.store : "") +
      "\n#CertifiedG \u00B7 training.gpen.com";
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
  function route() {
    var h = location.hash.replace(/^#/, "") || "/";
    var parts = h.split("/").filter(Boolean); // e.g. ["course","dash-ii"]
    window.scrollTo(0, 0);
    setTitleDoc(CFG.programName);
    var pageKey = "home";
    if (parts[0] === "course" && parts[1]) { renderCourse(parts[1]); pageKey = "course:" + parts[1]; }
    else if (parts[0] === "certified") { renderCertified(); pageKey = ""; }
    else if (parts[0] === "collection") { renderCollection(); pageKey = "collection"; }
    else if (parts[0] === "about") { renderAbout(); pageKey = "about"; }
    else renderHome(); // "/", "/dashboard", "/enroll" and anything else → the hub
    // Safety net: guarantee every view's reveal animation is initialized (and
    // its visibility failsafe armed) even if a render function forgets to call it.
    revealOnScroll();
    bindFacts();
    bindLogoFun();
    bindCardTilt();
    bindMascot();
    bindHeroMascot();
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
