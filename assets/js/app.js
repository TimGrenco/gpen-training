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
  var binderResize = null;      // resize handler that keeps the flip viewport fitted

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
    var d = { courses: {}, badges: [], streak: { count: 0, last: null }, master: null, eggs: {}, trio: null, secret: null, fresh: {}, log: [] };
    var s;
    try { s = Object.assign(d, JSON.parse(localStorage.getItem(K_STATE) || "{}")); } catch (e) { return d; }
    if (!s.eggs) s.eggs = {};
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

  /* =========================================================================
     THE COLLECTION — trading cards
     Every course is a card you pull by passing its quiz at 80%+. Every trivia
     egg is a Trainer card. Collect the 5-card Base Set to reveal the Certified
     G secret rare; find all 10 eggs to upgrade that card to full gold.
     ====================================================================== */
  var CARDS = window.GPEN_CARDS || {};
  var ELEMENTS = window.GPEN_ELEMENTS || {};
  var RARITY = window.GPEN_RARITY || {};
  var TRAINERS = window.GPEN_TRAINERS || [];
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
  function trainersOwned() { return eggsSolvedCount(); }
  // The 6th card appears once the Base Set is complete; it turns gold when every
  // Trainer card is in the binder too.
  function secretCardState() {
    if (!isMasterEarned()) return "locked";
    return allEggsSolved() ? "gold" : "holo";
  }
  function totalCards() { return COURSES.length + TRAINERS.length + 1; }
  function ownedCards() { return baseSetOwned() + trainersOwned() + (secretCardState() !== "locked" ? 1 : 0); }

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
          '<img src="' + esc(c.cover) + '" alt="" loading="lazy"/>' +
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
        (mini ? "" : '<span class="tcg-cta"><em>' + (owned ? ic("check") + " 25% off earned" : ic("tag") + " Pass → 25% off") + "</em><b>" + (owned ? "Review " : "Start ") + ic("arrow") + "</b></span>") +
      "</span>" +
    "</a>";
  }

  /* The 6th card. Locked shows a card BACK — you see the slot, not the card. */
  function secretCardHTML(mini) {
    if (!SECRET_CARD) return "";
    var st = secretCardState(), e = getEnroll();
    var sc = SECRET_CARD, el = ELEMENTS[sc.element] || {};
    var need = COURSES.length - baseSetOwned();
    var trLeft = TRAINERS.length - trainersOwned();

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
        '<span class="tcg-typebar"><em>' + esc(e ? e.name : "Product Specialist") + "</em><b>" + (gold ? "40% OFF" : "35% OFF") + "</b></span>" +
        (mini ? "" :
          '<span class="tcg-moves">' + movesHTML("gold", sc.moves) + "</span>" +
          statsRowHTML([{ k: "Base Set", v: baseSetOwned() + "/" + COURSES.length }, { k: "Trainers", v: trainersOwned() + "/" + TRAINERS.length }, { k: "Rank", v: "👑" }]) +
          '<span class="tcg-flavor">' + esc(sc.flavor) + "</span>") +
        '<span class="tcg-foot"><span class="tcg-set">' + esc(SET.name) + " · " + esc(SET.illus) + "</span>" +
          '<span class="tcg-no">' + sc.no + "/" + SET.total + " " + rarityHTML("secret") + "</span></span>" +
        (mini ? "" : '<span class="tcg-cta"><em>' + (gold ? ic("spark") + " Gold — 40% off" : ic("spark") + " Find all " + TRAINERS.length + " Trainers for gold" + (trLeft ? " (" + trLeft + " left)" : "")) + "</em><b>View " + ic("arrow") + "</b></span>") +
      "</span>" +
    "</a>";
  }

  /* Trainer / Energy cards — one per solved trivia egg. */
  function trainerCardHTML(t) {
    var egg = EGGS.filter(function (e) { return e.id === t.egg; })[0];
    var owned = eggSolved(t.egg);
    var fresh = owned && isFresh("t:" + t.egg);
    return '<div class="trn' + (owned ? " owned" : "") + (fresh ? " is-new" : "") + '" data-trainer="' + esc(t.egg) + '">' +
      (fresh ? newSticker() : "") +
      '<span class="trn-inner">' +
        '<span class="trn-shine" aria-hidden="true"></span>' +
        '<span class="trn-kind">' + esc(t.kind) + "</span>" +
        '<span class="trn-em">' + (owned ? (egg ? egg.emoji : "✨") : "?") + "</span>" +
        '<b class="trn-name">' + (owned ? esc(t.name) : "Undiscovered") + "</b>" +
        '<em class="trn-text">' + (owned ? esc(t.text) : esc(egg ? "Hidden somewhere on the " + eggPageLabel(egg) + " page" : "Keep looking…")) + "</em>" +
        '<span class="trn-foot">' + t.no + "/" + TRAINERS.length + "</span>" +
      "</span>" +
    "</div>";
  }
  function eggPageLabel(egg) {
    if (egg.on === "home") return "home";
    if (egg.on === "about") return "About G Pen";
    if (egg.on === "collection") return "binder";
    var c = courseBySlug((egg.on || "").replace("course:", ""));
    return c ? c.name : "course";
  }

  // Pulling a card mid-page must update the counters that are already on screen.
  function refreshCounters() {
    var chip = $(".hdr-binder b");
    if (chip) chip.textContent = ownedCards() + "/" + totalCards();
    var head = $(".col-strip .cs-head b");
    if (head) head.textContent = ownedCards() + " / " + totalCards() + " cards collected";
    var slots = $(".col-strip .cs-slots");
    if (slots) {
      var cs = $$(".cs-slot", slots);
      COURSES.forEach(function (c, i) { if (cs[i] && cardOwned(c.slug)) cs[i].classList.add("on"); });
      TRAINERS.forEach(function (t, i) {
        var el = cs[COURSES.length + i];
        if (el && eggSolved(t.egg)) el.classList.add("on");
      });
      var sec = cs[COURSES.length + TRAINERS.length];
      if (sec) sec.className = "cs-slot s " + secretCardState();
    }
  }

  /* Tiny 16-slot progress strip: 5 product + 10 trainer + 1 secret. */
  function collectionStrip() {
    var slots = COURSES.map(function (c) {
      return '<i class="cs-slot p' + (cardOwned(c.slug) ? " on" : "") + '" title="' + esc(c.name) + '"></i>';
    }).join("") +
    TRAINERS.map(function (t) {
      return '<i class="cs-slot t' + (eggSolved(t.egg) ? " on" : "") + '" title="Trainer — ' + esc(t.name) + '"></i>';
    }).join("") +
    '<i class="cs-slot s ' + secretCardState() + '" title="Certified G"></i>';
    return '<a class="col-strip" href="#/collection">' +
      '<span class="cs-head"><b>' + ownedCards() + " / " + totalCards() + " cards collected</b><em>Open the binder " + ic("arrow") + "</em></span>" +
      '<span class="cs-slots">' + slots + "</span>" +
    "</a>";
  }

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

  /* ---- fun layer: class ranks, quips, "did you know" ---------------------- */
  var RANKS = window.GPEN_RANKS || [];
  var FACTS = window.GPEN_FACTS || [];
  // Highest rank whose threshold you've cleared.
  function rankFor(done) {
    var r = RANKS[0] || null;
    RANKS.forEach(function (x) { if (done >= x.at) r = x; });
    return r;
  }
  function nextRank(done) { return RANKS.filter(function (x) { return x.at > done; })[0] || null; }
  function pick(arr) { return arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : ""; }
  function quip(kind) {
    var q = (window.GPEN_QUIPS || {})[kind];
    return pick(q) || (kind === "correct" ? "Correct!" : "Not quite.");
  }
  function rankChip(done) {
    var r = rankFor(done); if (!r) return "";
    var nx = nextRank(done);
    return '<div class="rank-chip"><span class="rank-em">' + r.emoji + "</span>" +
      '<span class="rank-txt"><b>' + esc(r.name) + "</b>" +
        "<em>" + esc(nx ? (nx.at - done) + " more to make " + nx.name : r.blurb) + "</em>" +
      "</span></div>";
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

    function close() { m.remove(); document.body.classList.remove("noscroll"); }
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
    document.addEventListener("keydown", function onEsc(ev) {
      if (ev.key === "Escape") { close(); document.removeEventListener("keydown", onEsc); }
    });

    var pack = $(".pull-pack", m), reveal = $(".pull-reveal", m);
    if (!pack) { sfx.play("pull"); confetti(); return; } // reduced-motion: card is already showing

    var opened = false, autoT;
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

  /* ---- hidden trivia easter eggs ----------------------------------------- */
  // A page may hide more than one egg, so eggs are looked up by (page, slot).
  function eggsFor(pageKey) { return EGGS.filter(function (e) { return e.on === pageKey; }); }
  function eggAt(pageKey, slot) {
    return eggsFor(pageKey).filter(function (e) { return (e.slot || "") === (slot || ""); })[0] || null;
  }
  function eggSolved(id) { return !!getState().eggs[id]; }
  function eggsSolvedCount() { var s = getState(); return EGGS.filter(function (e) { return s.eggs[e.id]; }).length; }
  function allEggsSolved() { return EGGS.length > 0 && eggsSolvedCount() === EGGS.length; }
  // The hidden 40% reward: every course certified (80%+ to pass) AND every egg found.
  function isSecretUnlocked() { return isMasterEarned() && allEggsSolved(); }

  // Each egg names the section it hides behind (`slot`) and the side it sits on
  // (`align`), so no two pages stash their secret in the same place.
  function eggHTML(pageKey, slot) {
    var egg = eggAt(pageKey, slot); if (!egg) return "";
    var solved = eggSolved(egg.id);
    var emoji = egg.emoji || "✨";
    var align = egg.align === "left" || egg.align === "right" ? egg.align : "center";
    return '<div class="egg-row ' + align + '">' +
      '<button class="egg' + (solved ? " found" : "") + '" data-egg="' + esc(egg.id) + '" ' +
        'aria-label="' + (solved ? "Trivia solved" : "Hidden trivia") + '" title="' + (solved ? "Solved!" : "Hidden trivia — tap me") + '">' +
        '<span class="egg-emoji">' + emoji + "</span>" +
        '<span class="egg-chk">' + ic("check") + "</span>" +
      "</button>" +
      '<span class="egg-hint">' + (solved ? "Secret found" : esc(egg.hint || "Psst… tap me")) + "</span>" +
    "</div>";
  }
  // Failsafe: a page missing the section an egg hides behind must not lose the
  // egg — the gold Certified G card requires that all of them stay findable.
  function ensureEgg(pageKey) {
    var host = $(".hub") || $(".course") || $(".about") || $(".binder"); if (!host) return;
    eggsFor(pageKey).forEach(function (egg) {
      if ($('[data-egg="' + egg.id + '"]')) return;
      var wrap = document.createElement("div");
      wrap.innerHTML = eggHTML(pageKey, egg.slot);
      if (wrap.firstChild) host.appendChild(wrap.firstChild);
    });
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
      '<div class="egg-eyebrow"><span class="egg-eyebrow-em">' + (egg.emoji || "✨") + "</span> Hidden trivia · " + eggsSolvedCount() + " of " + EGGS.length + " found</div>" +
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
          fact.innerHTML = "<strong>" + esc(quip("wrong")) + "</strong>";
          return;
        }
        $$(".choice", m).forEach(function (x, xi) { x.disabled = true; if (xi === egg.answer) x.classList.add("correct"); });
        fact.hidden = false; fact.className = "egg-fact ok";
        fact.innerHTML = "<strong>" + ic("check") + " " + esc(quip("correct")) + "</strong> " + esc(egg.fact);
        solveEgg(egg.id);
        // hand off to the card-pull moment once they've read the fact
        var t = trainerFor(egg.id);
        if (!t) confetti(); // egg with no Trainer card — still celebrate the find
        if (t) setTimeout(function () {
          if (!document.body.contains(m)) return;
          close();
          var left = TRAINERS.length - trainersOwned();
          showPull("Trainer card pulled!", trainerCardHTML(t),
            left ? "<b>" + left + "</b> Trainer card" + (left === 1 ? "" : "s") + " still hidden across the site."
                 : "<b>Every Trainer card found.</b> Your Certified G card is gold.");
        }, 2100);
      });
    });
  }
  function trainerFor(eggId) { return TRAINERS.filter(function (t) { return t.egg === eggId; })[0] || null; }
  function solveEgg(id) {
    var s = getState();
    if (s.eggs[id]) return;
    s.eggs[id] = true; setState(s);
    logEvent("egg", { egg: id });
    markFresh("t:" + id);
    if (isSecretUnlocked()) markFresh("secret"); // that egg turned the card gold
    var found = eggsSolvedCount();
    if (isSecretUnlocked()) { sfx.play("gold"); toast("Certified G went GOLD — 40% off unlocked! 👑"); }
    else if (allEggsSolved() && !isMasterEarned()) { sfx.play("egg"); toast("All " + EGGS.length + " Trainer cards! Collect the Base Set to go gold."); }
    else { sfx.play("egg"); toast("Trainer card " + found + " of " + EGGS.length + " 🃏"); }
    refreshCounters();
    // reflect the found state on the page without a full re-render
    $$('[data-egg="' + id + '"]').forEach(function (b) {
      b.classList.add("found");
      var h = b.parentElement && b.parentElement.querySelector(".egg-hint");
      if (h) h.textContent = "Secret found";
    });
    maybeReportSecret();
  }
  // The 30% tier fires once, the first time a third card lands in the binder.
  function maybeReportTier() {
    if (baseSetOwned() < 3) return;
    var s = getState(); if (s.trio) return;
    var e = getEnroll() || {};
    s.trio = { at: new Date().toISOString() }; setState(s);
    logEvent("trio", {});
    if (window.reportCompletion) window.reportCompletion({ type: "trio", name: e.name, email: e.email, store: e.store, product: "30% reward (3 cards)", score: 100, certId: "", date: niceDate() });
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
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 11-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="3"/><circle cx="12" cy="10" r="3"/><path d="M8.5 20a3.5 3.5 0 017 0"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 21.4l1.4-6.8L2.2 9.9l6.9-.8z"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.4L19 9l-5.1 1.6L12 16l-1.9-5.4L5 9l5.1-1.6z"/><path d="M18.5 14l.9 2.4 2.6.8-2.6.8-.9 2.4-.9-2.4-2.6-.8 2.6-.8z"/><path d="M5 15l.7 1.9 2 .6-2 .6L5 20l-.7-1.9-2-.6 2-.6z"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 010 7"/><path d="M18.5 5.5a9 9 0 010 13"/></svg>',
    mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>',
  };
  function ic(n) { return '<span class="ic">' + (IC[n] || "") + "</span>"; }

  /* =========================================================================
     PROFESSOR O.G. — the mascot. A tenured owl in a grad cap with a G Pen
     gold chain. Drawn as inline SVG so he recolours/scales anywhere.
     Moods: chill | hyped | think | proud | oops
     ====================================================================== */
  var MASCOT = window.GPEN_MASCOT || {};
  function mascotSVG(mood) {
    mood = mood || "chill";
    var closed = mood === "proud";
    var lid = ({ chill: 14, hyped: 0, think: 9, proud: 0, oops: 6 })[mood] || 0;
    var pupR = mood === "hyped" ? 12 : 10;
    var pupDX = mood === "think" ? 5 : 0;
    var brows = ({
      chill: ["M66 86 L104 80", "M154 86 L116 80"],
      hyped: ["M64 80 L104 74", "M156 80 L116 74"],
      think: ["M66 92 L104 76", "M154 82 L116 80"],
      proud: ["M66 86 L104 82", "M154 86 L116 82"],
      oops: ["M66 78 L104 88", "M154 78 L116 88"],
    })[mood] || ["M66 86 L104 80", "M154 86 L116 80"];
    var uid = "og" + mood + (mascotSVG.n = (mascotSVG.n || 0) + 1);

    function eye(cx) {
      if (closed) {
        return '<path d="M' + (cx - 19) + " 116 Q" + cx + " 98 " + (cx + 19) + ' 116" fill="none" stroke="#1f1f1f" stroke-width="6" stroke-linecap="round"/>';
      }
      var id = uid + "c" + cx;
      return '<clipPath id="' + id + '"><circle cx="' + cx + '" cy="110" r="24"/></clipPath>' +
        '<circle cx="' + cx + '" cy="110" r="24" fill="#ffffff"/>' +
        '<g clip-path="url(#' + id + ')">' +
          '<circle cx="' + (cx + pupDX) + '" cy="112" r="' + pupR + '" fill="#1a1a1a"/>' +
          '<circle cx="' + (cx + pupDX + 4) + '" cy="108" r="4" fill="#fff"/>' +
          (lid ? '<rect x="' + (cx - 26) + '" y="' + (86 - (14 - lid)) + '" width="52" height="' + lid + '" fill="#e2dccc"/>' : "") +
        "</g>" +
        '<circle cx="' + cx + '" cy="110" r="24" fill="none" stroke="#c8952f" stroke-width="3.5"/>';
    }

    return '<svg class="og-svg og-m-' + mood + '" viewBox="0 0 220 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M52 92 L34 52 L82 74 Z" fill="#2b2b2b"/><path d="M168 92 L186 52 L138 74 Z" fill="#2b2b2b"/>' +
      '<ellipse cx="110" cy="138" rx="72" ry="76" fill="#2b2b2b"/>' +
      '<path d="M40 132 Q24 172 48 206 Q42 164 56 134 Z" fill="#1e1e1e"/>' +
      '<path d="M180 132 Q196 172 172 206 Q178 164 164 134 Z" fill="#1e1e1e"/>' +
      '<ellipse cx="110" cy="110" rx="60" ry="48" fill="#f3efe3"/>' +
      '<g class="og-eyes">' + eye(86) + eye(134) + "</g>" +
      '<path d="' + brows[0] + '" stroke="#2b2b2b" stroke-width="6.5" stroke-linecap="round" fill="none"/>' +
      '<path d="' + brows[1] + '" stroke="#2b2b2b" stroke-width="6.5" stroke-linecap="round" fill="none"/>' +
      '<path d="M110 128 L100 144 L120 144 Z" fill="#FEC870"/>' +
      '<path d="M110 144 L105 151 L115 151 Z" fill="#c8952f"/>' +
      '<path d="M72 168 Q110 206 148 168" fill="none" stroke="#FEC870" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="110" cy="200" r="16" fill="#FEC870" stroke="#c8952f" stroke-width="2.5"/>' +
      '<text x="110" y="207" text-anchor="middle" font-size="20" font-weight="900" font-family="Archivo, system-ui, sans-serif" fill="#1a1a1a">G</text>' +
      '<g transform="translate(110,48) rotate(-9)">' +
        '<path d="M-32 0 L32 0 L32 12 Q0 25 -32 12 Z" fill="#151515"/>' +
        '<path d="M-58 -2 L0 -24 L58 -2 L0 20 Z" fill="#111"/>' +
        '<path d="M-58 -2 L0 -24 L58 -2 L0 20 Z" fill="none" stroke="#c8952f" stroke-width="1.5" opacity=".55"/>' +
        '<circle cx="0" cy="-2" r="4" fill="#c8952f"/>' +
        '<path d="M54 -1 Q66 16 62 32" stroke="#FEC870" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<path d="M62 32 l-5 13 M62 32 l0 14 M62 32 l5 13" stroke="#FEC870" stroke-width="3" stroke-linecap="round"/>' +
      "</g>" +
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
  // The big O.G. in the hero: tap him and he hoots + speaks through the sub-line.
  function bindHeroMascot() {
    var hero = $(".hero-og"); if (!hero) return;
    var say = $("#hero-say"), art = $(".hero-og-art", hero);
    var original = say ? say.innerHTML : "";
    hero.addEventListener("click", function () {
      sfx.play("hoot");
      if (art) art.innerHTML = mascotSVG(pick(["hyped", "think", "proud", "chill"]));
      if (say) { say.innerHTML = "&ldquo;" + ogLine("idle") + "&rdquo;"; say.classList.add("og-quote"); }
      hero.classList.remove("pop"); void hero.offsetWidth; hero.classList.add("pop");
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
    if (isSecretUnlocked() || isMasterEarned()) return ogSays("proud", ogLine("done"));
    if (done === 0) return ogSays("chill", ogLine("welcome"));
    if (done >= total - 1) return ogSays("hyped", ogLine("almost"));
    return ogSays("chill", ogLine("started"));
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
      egg: function () { tone(1046, 0, 0.18, "sine", 0.15); tone(1568, 0.1, 0.24, "sine", 0.13); },
      gold: function () { [659, 784, 988, 1319, 1568].forEach(function (f, i) { tone(f, i * 0.09, 0.3, "triangle", 0.16); }); },
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
      '<button class="hdr-sound" id="sound-toggle" title="' + (sfx.isOn() ? "Sound on" : "Sound off") + '" aria-label="Toggle sound">' + ic(sfx.isOn() ? "sound" : "mute") + "</button>" +
      '<a class="hdr-binder" href="#/collection" title="Your binder"><span class="hb-em">\uD83C\uDCCF</span><b>' + ownedCards() + "/" + totalCards() + "</b></a>" +
      (e ? '<a class="hdr-user" href="#/"><span class="hdr-u-name">' + esc(e.name) + '</span><span class="hdr-u-store">' + esc(e.store || "") + "</span></a>"
         : '<a class="hdr-cta" href="#/">Browse courses</a>') +
    "</header>";
  }
  // Sound toggle survives re-renders via a single delegated listener (bound in boot).
  function bindSoundToggle() {
    document.addEventListener("click", function (ev) {
      var btn = ev.target.closest && ev.target.closest("#sound-toggle");
      if (!btn) return;
      var nowOn = sfx.toggle();
      btn.innerHTML = ic(nowOn ? "sound" : "mute");
      btn.title = nowOn ? "Sound on" : "Sound off";
      toast(nowOn ? "\uD83D\uDD0A Sound on" : "\uD83D\uDD07 Sound off");
    });
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
          '<div class="dash-hi"><span class="dash-hello">' + (e ? "Welcome back," : "Your progress") + "</span><h1>" + esc(e ? e.name.split(" ")[0] : "Keep going") + "</h1>" + (e ? '<span class="dash-store">' + esc(e.store) + "</span>" : "") + rankChip(done) + "</div>" +
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
        collectionStrip()
      : "";

    app.innerHTML = header() +
      '<section class="hero">' +
        vaporHTML(6) +
        // Professor O.G. is the face of the landing page now — tap him for a line.
        '<button class="hero-og" type="button" aria-label="Tap Professor O.G.">' +
          '<span class="hero-og-glow" aria-hidden="true"></span>' +
          '<span class="hero-og-art">' + mascotSVG("chill") + "</span>" +
          '<span class="hero-og-tag">' + ic("spark") + " Tap the Prof</span>" +
        "</button>" +
        '<div class="hero-inner reveal">' +
          crestSVG("hero-crest") +
          '<div class="hero-eyebrow">' + ic("cap") + " " + esc(CFG.programName) + "</div>" +
          "<h1>Become a <span class=\"gold\">Certified G</span>.</h1>" +
          '<p class="hero-sub" id="hero-say">Free product training for G Pen retailers. Learn a product, pass a short quiz, and unlock <strong>25%</strong> to <strong>40% off</strong> gpen.com — plus a collectible card for your binder.</p>' +
          '<div class="hero-cta">' +
            '<button class="btn xl" id="browse-btn">Start training ' + ic("arrow") + "</button>" +
            '<a class="btn xl ghost-dark" href="#/about">About G Pen</a>' +
          "</div>" +
        "</div>" +
      "</section>" +
      howItWorks() +
      '<section class="hub reveal">' +
        progressBlock +
        nextUpBlock() +
        '<div class="sec-h" id="courses"><h2>The courses</h2><span>' + done + " of " + total + " certified</span></div>" +
        '<p class="catalog-lede">Five products, about ' + (COURSES[0] ? COURSES[0].minutes : 9) + '&ndash;10 minutes each. Take them in any order &mdash; each one you pass is a certification and a bigger discount.</p>' +
        '<div class="course-grid">' + COURSES.map(courseCard).join("") + "</div>" +
        eggHTML("home", "courses") +
        rewardsSection(done, master) +
        eggHTML("home", "rewards") +
        factCard() +
        (hasProgress ? '<button class="linklike reset" id="reset">Reset my progress</button>' : "") +
      "</section>" +
      binderTeaser() +
      lifestyleShowcase() +
      lifestyleCinema((window.GPEN_LIFESTYLE || [])[9] || "", "The G Pen life", "Learn it. Live it. Sell it.") +
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
  // A static editorial collage of real-people-using-product shots (masonry).
  function lifestyleMosaic(n, start) {
    var imgs = lifestyleImgs().slice(start || 0, (start || 0) + (n || 7));
    if (!imgs.length) return "";
    return '<div class="life-mosaic">' + imgs.map(function (u) {
      return '<figure class="lm-cell"><img src="' + esc(u) + '" alt="Real people using G Pen products" loading="lazy" decoding="async"/></figure>';
    }).join("") + "</div>";
  }
  // The "the lifestyle" showcase section that replaced the scrolling marquee.
  function lifestyleShowcase() {
    var m = lifestyleMosaic(8, 0); if (!m) return "";
    return '<section class="life-showcase compact reveal">' +
      '<div class="ls-head"><span class="ls-eyebrow">' + ic("spark") + " The lifestyle</span>" +
        "<h2>Real people. Real sessions.</h2>" +
        "<p>This is the world you&rsquo;re repping.</p></div>" +
      m +
    "</section>";
  }
  // A full-width cinematic lifestyle band used as a divider / on course pages.
  function lifestyleCinema(img, eyebrow, line) {
    if (!img) return "";
    return '<section class="life-cinema reveal" style="background-image:url(\'' + esc(img) + '\')">' +
      '<div class="lc-inner"><span class="lc-eyebrow">' + esc(eyebrow) + "</span><h2>" + esc(line) + "</h2></div>" +
    "</section>";
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
  function howItWorks() {
    var steps = [
      { n: 1, ic: "play", t: "Learn it", s: "Open any product course. Watch the how-to videos, read the specs, cleaning and FAQs. No sign-up, no cost." },
      { n: 2, ic: "cap", t: "Prove it", s: "When you're ready, take the quiz. Score " + (COURSES[0] ? COURSES[0].passPct : 80) + "% or better and you're a certified Product Specialist on that product." },
      { n: 3, ic: "tag", t: "Get paid", s: "Every course you pass unlocks a bigger discount at gpen.com — from <b>25%</b> up to <b>40% off</b> — plus a collectible card for your binder." },
    ];
    return '<section class="hiw reveal">' +
      '<div class="hiw-head"><span class="hiw-eyebrow">' + ic("spark") + " How it works</span>" +
        "<h2>Three steps. That&rsquo;s it.</h2></div>" +
      '<div class="hiw-grid">' + steps.map(function (s) {
        return '<div class="hiw-step">' +
          '<span class="hiw-n">' + s.n + "</span>" +
          '<span class="hiw-ic">' + ic(s.ic) + "</span>" +
          "<h3>" + esc(s.t) + "</h3><p>" + s.s + "</p>" +
        "</div>";
      }).join("") + "</div>" +
    "</section>";
  }

  /* A plain, readable course card — the home page lists COURSES, not cards.
     The trading card is the reward you get for finishing one. */
  function courseCard(c) {
    var s = getState(), rec = s.courses[c.slug], done = !!(rec && rec.passed);
    return '<a class="cc' + (done ? " done" : "") + (c.featured && !done ? " featured" : "") + '" href="#/course/' + c.slug + '">' +
      '<span class="cc-media">' +
        '<img src="' + esc(c.cover) + '" alt="' + esc(c.name) + '" loading="lazy"/>' +
        (done ? '<span class="cc-badge">' + ic("check") + " Certified " + rec.score + "%</span>"
              : (c.featured ? '<span class="cc-featured">' + ic("star") + " " + esc(c.featured) + "</span>" : "")) +
      "</span>" +
      '<span class="cc-body">' +
        '<span class="cc-cat">' + esc(c.category) + "</span>" +
        "<h3>" + esc(c.name) + "</h3>" +
        "<p>" + esc(c.tagline) + "</p>" +
        '<span class="cc-meta">' + c.videos.length + " videos · " + c.quiz.length + "-question quiz · ~" + c.minutes + " min</span>" +
        '<span class="cc-foot">' +
          '<span class="cc-reward' + (done ? " earned" : "") + '">' + ic(done ? "check" : "tag") +
            "<span>" + (done ? "25% off earned" : "Pass → 25% off") + "</span></span>" +
          '<span class="cc-go">' + (done ? "Review " : "Start ") + ic("arrow") + "</span>" +
        "</span>" +
      "</span>" +
    "</a>";
  }

  /* The binder, teased — cards stay face-down here on purpose. Pulling one is
     the surprise; the binder is where you go to actually look at them. */
  function binderTeaser() {
    var owned = baseSetOwned(), total = COURSES.length;
    var backs = "";
    for (var i = 0; i < 3; i++) backs += '<span class="bt-back"><img src="assets/img/gpen-g-white.png" alt=""/></span>';
    return '<section class="bt reveal">' +
      '<div class="bt-copy">' +
        '<span class="bt-eyebrow">' + ic("award") + " Your binder</span>" +
        "<h2>Pass a course, pull a card.</h2>" +
        "<p>Every course you finish drops a collectible card into your binder &mdash; you rip it out of a foil pack, holo and all. It&rsquo;s also the fastest cheat sheet you&rsquo;ll ever have: specs, key features and talking points for that product, on one card.</p>" +
        '<div class="bt-stat"><b>' + owned + "</b> of " + total + " product cards collected</div>" +
        '<a class="btn xl" href="#/collection">Open the binder ' + ic("arrow") + "</a>" +
      "</div>" +
      '<div class="bt-deck" aria-hidden="true">' + backs + "</div>" +
    "</section>";
  }
  function step(n, t, s) { return '<li class="step reveal"><span class="step-n">' + n + "</span><div><h4>" + t + "</h4><p>" + s + "</p></div></li>"; }
  function footer() {
    return '<footer class="foot"><img src="assets/img/gpen-g-black.png" class="foot-g light" alt=""/><img src="assets/img/gpen-g-white.png" class="foot-g dark" alt=""/>' +
      '<div class="foot-nav"><a href="#/">Courses</a><a href="#/collection">The Binder</a><a href="#/about">About G Pen</a><a href="' + esc(CFG.shopUrl) + '" target="_blank" rel="noopener">Shop gpen.com</a></div>' +
      "<p>" + esc(CFG.programName) + " · for authorized G Pen retail partners. Questions? <a href=\"mailto:" + esc(CFG.contactEmail) + "\">" + esc(CFG.contactEmail) + "</a></p>" +
      '<p class="foot-motto">A Grenco Science joint · est. 2012 · <em>In Vapore Veritas</em></p>' +
      "</footer>";
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
  /* The reward ladder climbs with the collection:
       1 card -> 25%   3 cards -> 30%   full Base Set -> 35%   + all Trainers -> 40% gold */
  // "Next up": the single clearest next step + how close the next reward is.
  // The engagement hook — always one tappable "just one more" away from a payoff.
  function nextUpBlock() {
    if (isSecretUnlocked()) {
      return '<a class="nextup done" href="#/collection">' +
        '<span class="nu-badge">' + ic("award") + " Certified G</span>" +
        '<span class="nu-main"><b>You collected everything. 👑</b><em>Every card, every Trainer, the gold foil — you&rsquo;re a fully loaded G.</em></span>' +
        '<span class="nu-cta">Open the binder ' + ic("arrow") + "</span></a>";
    }
    var done = completedCount(), total = COURSES.length;
    var headline, sub, ctaLabel, ctaHref;
    if (!isMasterEarned()) {
      var next = COURSES.filter(function (c) { return !cardOwned(c.slug); })[0] || COURSES[0];
      ctaHref = "#/course/" + next.slug;
      ctaLabel = (cardScore(next.slug) ? "Review " : "Start ") + next.name;
      if (done === 0) { headline = "Pull your first card"; sub = "Pass any course quiz to bag your first card and unlock 25% off gpen.com."; }
      else if (done < 3) { var t3 = 3 - done; headline = t3 + " more card" + (t3 === 1 ? "" : "s") + " to 30% off"; sub = "You&rsquo;re building the set — keep the combo rolling with " + esc(next.name) + "."; }
      else { var ts = total - done; headline = ts + " more to finish the Base Set"; sub = "Collect all " + total + " for 35% off and reveal the Certified G secret rare."; }
    } else {
      var left = TRAINERS.length - trainersOwned();
      headline = left + " Trainer card" + (left === 1 ? "" : "s") + " to go gold";
      sub = "You&rsquo;ve got the Base Set. Find the last hidden trivia across the site to flip Certified G to gold — 40% off.";
      ctaLabel = "Hunt in the binder"; ctaHref = "#/collection";
    }
    return '<a class="nextup" href="' + ctaHref + '">' +
      '<span class="nu-badge">' + ic("spark") + " Next up</span>" +
      '<span class="nu-main"><b>' + headline + "</b><em>" + sub + "</em></span>" +
      '<span class="nu-cta">' + esc(ctaLabel) + " " + ic("arrow") + "</span>" +
    "</a>";
  }
  function rewardsSection(done, master) {
    var core = coreSlugs().length;
    var trio = done >= 3, c25 = done >= 1, c35 = master;
    var secret = isSecretUnlocked();
    var trLeft = TRAINERS.length - trainersOwned();
    var head = secret ? "Gold Certified G unlocked 👑"
      : (c35 ? "Base Set complete — 35% off" : (trio ? "30% off unlocked — two cards to go" : (c25 ? "25% off unlocked — keep pulling cards" : "Pull your first card to start earning")));
    var secretLock = trLeft > 0
      ? trLeft + " Trainer card" + (trLeft === 1 ? "" : "s") + " still hidden…"
      : "All Trainers found — collect the Base Set";
    return '<div class="sec-h"><h2>The reward ladder</h2><span>' + head + "</span></div>" +
      '<div class="rewards">' +
        rewardCard("course", c25, "25% OFF", "Your first card — pass any single course", "Collect 1 card to unlock") +
        rewardCard("trio", trio, "30% OFF", "Three cards deep into the Base Set", (3 - done) + " more card" + (3 - done === 1 ? "" : "s") + " to unlock") +
        rewardCard("master", c35, "35% OFF", "The full " + core + "-card Base Set — pulls the <em>Certified G</em> secret rare", (core - done) + " more card" + (core - done === 1 ? "" : "s") + " to unlock") +
        (EGGS.length ? rewardCard("secret", secret, "40% OFF", "Certified G in <em>gold foil</em> — the Base Set <em>and</em> every Trainer card", secretLock) : "") +
      "</div>";
  }
  function rewardCard(type, unlocked, big, sub, lockMsg) {
    var isSecret = type === "secret";
    if (unlocked) lockMsg = "";
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
    // Only the slot this course's egg claims returns markup; the rest are no-ops.
    function egg(slot) { return eggHTML("course:" + c.slug, slot); }

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
        egg("videos") +

        secHead(++n, "Get to know it") +
        '<div class="prose">' + descHTML + "</div>" +
        (c.highlights && c.highlights.length ? '<ul class="hl-list">' + c.highlights.map(function (h) { return "<li>" + ic("check") + "<span>" + esc(h) + "</span></li>"; }).join("") + "</ul>" : "") +
        galleryHTML(c) +
        egg("overview") +
        lifestyleCinema(productLifeImg(c.slug, c.heroImg), "In the wild", "The " + c.name + " out in the world.") +

        (c.specs && c.specs.length ? secHead(++n, "Tech specs") + specTableHTML(c.specs) : "") +
        egg("specs") +
        (c.howToUse && c.howToUse.length ? secHead(++n, "How to use it") + stepListHTML(c.howToUse) : "") +
        egg("howto") +
        (c.howToClean && c.howToClean.length ? secHead(++n, "How to clean & care") + stepListHTML(c.howToClean) : "") +
        egg("clean") +
        (c.faq && c.faq.length ? secHead(++n, "FAQ") + faqHTML(c.faq) : "") +
        egg("faq") +

        (c.sell && c.sell.length ? '<div class="sell"><h3>' + ic("tag") + " How to sell it</h3><ul>" + c.sell.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" : "") +
        egg("sell") +
        factCard() +

        secHead(++n, "Get certified") +
        ogSays("think", ogLine("quizIntro")) +
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
    var i = 0, answers = [], streak = 0, points = 0, zone = $("#quiz-zone");
    step();
    zone.scrollIntoView({ behavior: "smooth", block: "start" });

    function step() {
      var q = c.quiz[order[i]];
      zone.innerHTML = '<div class="quiz">' +
        '<div class="quiz-bar"><div class="quiz-bar-fill" style="width:' + Math.round((i / c.quiz.length) * 100) + '%"></div></div>' +
        '<div class="quiz-count"><span class="qc-num">Question ' + (i + 1) + " of " + c.quiz.length + "</span>" +
          (streak >= 2 ? '<span class="quiz-streak">' + ic("fire") + " ×" + Math.min(streak, 5) + " combo</span>" : "") +
          '<span class="quiz-score">' + ic("spark") + ' <b id="qscore">' + points + "</b> pts</span></div>" +
        '<div class="quiz-q">' + esc(q.q) + "</div>" +
        '<div class="quiz-choices">' + q.choices.map(function (ch, ci) {
          return '<button class="choice" data-ci="' + ci + '"><span class="ch-key">' + String.fromCharCode(65 + ci) + "</span><span>" + esc(ch) + "</span></button>";
        }).join("") + "</div>" +
        '<div class="quiz-why" hidden></div>' +
        '<button class="btn xl next" id="q-next" hidden></button>' +
      "</div>";
      $$(".choice", zone).forEach(function (b) { b.addEventListener("click", function () { choose(parseInt(b.getAttribute("data-ci"), 10), q, b); }); });
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
      $$(".choice", zone).forEach(function (b, bi) {
        b.disabled = true;
        if (bi === q.answer) b.classList.add("correct");
        else if (bi === ci) b.classList.add("wrong");
      });
      var why = $(".quiz-why", zone); why.hidden = false;
      why.className = "quiz-why " + (correct ? "ok" : "no");
      // Professor O.G. reacts to every answer, then explains.
      why.innerHTML = ogMini(correct ? "hyped" : "oops") +
        '<span class="qw-text"><strong>' + (correct ? ic("check") + " " + ogLine("correct") : ogLine("wrong")) + "</strong> " +
        (correct && streak >= 3 ? '<span class="streak-pop">' + ic("fire") + " ×" + Math.min(streak, 5) + " combo!</span> " : "") + esc(q.why) + "</span>";
      var n = $("#q-next", zone); n.hidden = false;
      n.innerHTML = (i + 1 < c.quiz.length ? "Next question " + ic("arrow") : "See my results " + ic("arrow"));
      n.onclick = function () { i++; if (i < c.quiz.length) step(); else finish(); };
    }
    function finish() {
      var correct = 0; c.quiz.forEach(function (q, qi) { if (answers[qi] === q.answer) correct++; });
      var pct = Math.round((correct / c.quiz.length) * 100), passed = pct >= c.passPct;
      logEvent("quiz", { course: c.slug, score: pct, passed: passed });
      if (!passed) return quizFail(c, correct, pct, points);
      quizPass(c, correct, pct, points);
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
  function quizFail(c, correct, pct, points) {
    var zone = $("#quiz-zone");
    zone.innerHTML = '<div class="result fail">' +
      gradeHTML(pct, points) +
      '<div class="result-score">' + pct + '%<span>' + correct + "/" + c.quiz.length + "</span></div>" +
      "<h3>" + esc(quip("fail")) + "</h3><p>You need " + c.passPct + "% to certify. Review the lessons above and give it another shot — you've got this.</p>" +
      '<button class="btn xl" id="retry">' + ic("refresh") + " Retry quiz</button>" +
    "</div>";
    $("#retry").addEventListener("click", function () { runQuiz(c); });
    zone.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function quizPass(c, correct, pct, points) {
    var e = getEnroll();
    var date = niceDate(), cid = certId(e.name + "|" + c.name + "|" + date);
    var s = getState(); var firstTime = !(s.courses[c.slug] && s.courses[c.slug].passed);
    s.courses[c.slug] = { passed: true, score: pct, certId: cid, date: date, name: e.name };
    if (s.badges.indexOf(c.slug) < 0) s.badges.push(c.slug);
    setState(s);
    if (firstTime) {
      pendingCelebrate = true; // ring pulses + confetti next time they hit home
      markFresh(c.slug);
      if (isMasterEarned()) markFresh("secret"); // that pull revealed the secret rare
      if (window.reportCompletion) window.reportCompletion({ type: "course", name: e.name, email: e.email, store: e.store, product: "G Pen " + c.name, courseSlug: c.slug, score: pct, certId: cid, date: date });
    }
    maybeReportTier();   // a third card unlocks the 30% tier
    maybeReportSecret(); // finishing the last course can complete the secret too
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
    var zone = $("#quiz-zone");
    zone.innerHTML = '<div class="result pass">' +
        gradeHTML(pct, points) +
        '<div class="result-score">' + pct + '%<span>' + correct + "/" + c.quiz.length + "</span></div>" +
        "<h3>" + ic("check") + " " + esc(quip("pass")) + "</h3><p>You're now a certified <strong>" + esc(c.name) + "</strong> Product Specialist" + (firstTime ? "" : " (progress refreshed)") + ".</p>" +
      "</div>" +
      '<div id="cert-zone"></div>' +
      '<div id="reward-zone" class="reward-wrap"></div>' +
      (master ? '<a class="master-unlock" href="#/certified">' + ic("award") + " Base Set complete — you pulled the <strong>Certified G</strong> secret rare! Certificate & 35% off " + ic("arrow") + "</a>"
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
        typeLeft: en ? en.name : "Product Specialist", typeRight: st === "gold" ? "40% OFF" : "35% OFF",
        moves: sc.moves, stats: [{ k: "Base Set", v: baseSetOwned() + "/" + COURSES.length }, { k: "Trainers", v: trainersOwned() + "/" + TRAINERS.length }, { k: "Rank", v: "Certified G" }],
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
        ogSays("proud", ogLine("done")) +
        '<div class="tcg-grid single">' + secretCardHTML() + "</div>" +
        (allEggsSolved() ? "" : '<a class="master-nudge" href="#/collection">' + ic("spark") + " Your Certified G card is <b>holo</b>. Find the last " + (TRAINERS.length - trainersOwned()) + " Trainer card" + (TRAINERS.length - trainersOwned() === 1 ? "" : "s") + " to turn it <b>gold</b> and unlock 40% off " + ic("arrow") + "</a>") +
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
        lifestyleMosaic(7, 0) +
        '<div class="about-block"><h2>Our story</h2>' + founding + "</div>" +
        (a.milestones ? '<div class="about-block"><h2>Milestones</h2><ol class="timeline">' + a.milestones.map(function (m) {
          return '<li><span class="tl-year">' + esc(m.year) + "</span><span class=\"tl-dot\"></span><p>" + esc(m.text) + "</p></li>";
        }).join("") + "</ol></div>" : "") +
        (a.collaborations ? '<div class="about-block"><h2>Iconic collaborations</h2><p class="lead">G Pen has partnered with some of the biggest names in music and cannabis:</p><div class="collabs">' +
          a.collaborations.map(function (c) { return '<span class="collab">' + esc(c) + "</span>"; }).join("") + "</div>" +
          eggHTML("about", "collabs") + "</div>" : "") +
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
        eggHTML("about", "social") +
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
  // Binding rings are drawn as a tiled CSS background on .binder-rings so they
  // stay evenly spaced down the spine no matter how tall the pages get.
  function ringsHTML() { return ""; }
  function renderCollection() {
    setTitleDoc("The Binder");
    var e = getEnroll();
    var base = baseSetOwned(), tr = trainersOwned(), st = secretCardState();
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
          "<p>" + (e ? esc(e.name) + "&rsquo;s collection" : "Your collection") + " &mdash; flip through your sleeves, admire the holos, and hunt down every empty slot.</p>" +
          '<div class="bn-meter"><div class="bn-meter-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="bn-count"><b>' + owned + "</b> of " + total + " cards &middot; " + pct + "% complete</div>" +
        "</div>" +

        ogSays(owned === total ? "proud" : "chill", ogLine(owned === total ? "binderFull" : "binder")) +
        '<div class="binder-book">' +
          '<div class="binder-rings" aria-hidden="true">' + ringsHTML(6) + "</div>" +
          '<div class="binder-viewport">' +

            // Page 1 \u2014 the 6-card Base Set (5 products + the secret rare as 6/6)
            '<div class="sleeve-page active" data-page="0">' +
              '<div class="page-head"><span class="page-tab"><span class="tab-no">Page 1</span>' + esc(SET.name) + "</span>" +
                '<span class="page-status">' + (base + (st !== "locked" ? 1 : 0)) + " of 6 collected</span></div>" +
              '<div class="tcg-grid pockets">' +
                COURSES.map(function (c) { return pocket(tcgCard(c), cardOwned(c.slug)); }).join("") +
                pocket(secretCardHTML(), st !== "locked") +
              "</div>" +
            "</div>" +

            // Page 2 \u2014 Trainers & Energy (one per hidden egg)
            '<div class="sleeve-page" data-page="1">' +
              '<div class="page-head"><span class="page-tab"><span class="tab-no">Page 2</span>Trainers &amp; Energy</span>' +
                '<span class="page-status">' + tr + " of " + TRAINERS.length + " found</span></div>" +
              '<p class="catalog-lede">One card for every hidden trivia egg on the site. They&rsquo;re tucked in different places on every page &mdash; look for something that doesn&rsquo;t belong.</p>' +
              '<div class="trn-grid pockets">' +
                TRAINERS.map(function (t) { return pocket(trainerCardHTML(t), eggSolved(t.egg)); }).join("") +
              "</div>" +
              eggHTML("collection", "binder") +
            "</div>" +

          "</div>" +
          '<div class="binder-nav">' +
            '<button class="bn-arrow" data-flip="-1" aria-label="Previous page">' + ic("back") + "</button>" +
            '<div class="bn-dots"><button class="bn-dot active" data-page="0" aria-label="Base Set page"></button><button class="bn-dot" data-page="1" aria-label="Trainers page"></button></div>' +
            '<span class="bn-label">Page <b>1</b> / 2</span>' +
            '<button class="bn-arrow" data-flip="1" aria-label="Next page">' + ic("arrow") + "</button>" +
          "</div>" +
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
    bindBinderFlip();
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
    function close() { m.remove(); document.body.classList.remove("noscroll"); }
    $(".modal-x", m).addEventListener("click", close);
    m.addEventListener("click", function (ev) { if (ev.target === m) close(); });
    document.addEventListener("keydown", function onEsc(ev) {
      if (ev.key === "Escape") { close(); document.removeEventListener("keydown", onEsc); }
    });
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
      el.addEventListener("click", function (ev) { ev.preventDefault(); openCardInspector(slug); });
    });
  }

  /* Flip through the binder like real sleeve pages. Pages are absolutely stacked
     in a perspective viewport; the active one turns on its left-edge hinge. */
  function bindBinderFlip() {
    var book = $(".binder-book"); if (!book) return;
    var vp = $(".binder-viewport", book);
    var pages = $$(".sleeve-page", vp);
    if (!vp || pages.length < 2) return;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var cur = 0, flipping = false;

    function fit() { if (pages[cur]) vp.style.height = pages[cur].offsetHeight + "px"; }
    function setNav() {
      $$(".bn-dot", book).forEach(function (d, i) { d.classList.toggle("active", i === cur); });
      var lbl = $(".bn-label b", book); if (lbl) lbl.textContent = cur + 1;
      $$(".bn-arrow", book).forEach(function (arr) {
        var dir = parseInt(arr.getAttribute("data-flip"), 10);
        arr.disabled = (cur + dir < 0 || cur + dir >= pages.length);
      });
    }
    function go(target) {
      if (flipping || target === cur || target < 0 || target >= pages.length) return;
      var dir = target > cur ? 1 : -1, from = pages[cur], to = pages[target];
      flipping = true;
      vp.style.height = to.offsetHeight + "px"; // grow/shrink to the incoming page

      if (reduced) {
        from.classList.remove("active"); to.classList.add("active");
        cur = target; flipping = false; setNav(); fit(); return;
      }
      sfx.play("tick");
      if (dir === 1) {
        to.classList.add("under");            // reveal the next page beneath
        from.classList.add("turning-out");    // current page turns away to the left
      } else {
        from.classList.add("under");          // current page waits beneath
        to.classList.add("turning-in");       // previous page turns back onto the stack
      }
      setTimeout(function () {
        from.classList.remove("active", "turning-out", "under");
        to.classList.remove("under", "turning-in");
        to.classList.add("active");
        cur = target; flipping = false; setNav(); fit();
      }, 620);
    }

    $$(".bn-arrow", book).forEach(function (arr) {
      arr.addEventListener("click", function () { go(cur + parseInt(arr.getAttribute("data-flip"), 10)); });
    });
    $$(".bn-dot", book).forEach(function (d) {
      d.addEventListener("click", function () { go(parseInt(d.getAttribute("data-page"), 10)); });
    });
    document.addEventListener("keydown", function binderKey(ev) {
      if (!document.body.contains(book)) { document.removeEventListener("keydown", binderKey); return; }
      if (ev.key === "ArrowRight") go(cur + 1);
      else if (ev.key === "ArrowLeft") go(cur - 1);
    });

    fit(); setNav();
    setTimeout(fit, 350); // re-fit once images/fonts settle
    if (binderResize) window.removeEventListener("resize", binderResize);
    binderResize = function () { if (!flipping) fit(); };
    window.addEventListener("resize", binderResize, { passive: true });
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
  function setTitleDoc(t) { document.title = t + " · " + CFG.programName; }

  /* ---- router ------------------------------------------------------------ */
  function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }
  function route() {
    var h = location.hash.replace(/^#/, "") || "/";
    var parts = h.split("/").filter(Boolean); // e.g. ["course","dash-ii"]
    window.scrollTo(0, 0);
    setTitleDoc(CFG.programName);
    if (binderResize) { window.removeEventListener("resize", binderResize); binderResize = null; }
    var pageKey = "home";
    if (parts[0] === "course" && parts[1]) { renderCourse(parts[1]); pageKey = "course:" + parts[1]; }
    else if (parts[0] === "certified") { renderCertified(); pageKey = ""; }
    else if (parts[0] === "collection") { renderCollection(); pageKey = "collection"; }
    else if (parts[0] === "about") { renderAbout(); pageKey = "about"; }
    else renderHome(); // "/", "/dashboard", "/enroll" and anything else → the hub
    // Safety net: guarantee every view's reveal animation is initialized (and
    // its visibility failsafe armed) even if a render function forgets to call it.
    revealOnScroll();
    if (pageKey) ensureEgg(pageKey);
    bindEggs();
    bindFacts();
    bindLogoFun();
    bindCardTilt();
    bindMascot();
    bindHeroMascot();
  }
  function boot() {
    app = $("#app"); // re-resolve in case the script loaded before #app parsed
    // Backfill: someone who earned a tier before it existed still gets reported
    // once. Both calls no-op unless the tier is newly reached and unrecorded.
    if (getEnroll()) { maybeReportTier(); maybeReportSecret(); }
    if (!app) { return document.addEventListener("DOMContentLoaded", boot, { once: true }); }
    bindSoundToggle();
    window.addEventListener("hashchange", route);
    route();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
