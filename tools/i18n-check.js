/* =============================================================================
   LOCALE VALIDATOR — node tools/i18n-check.js <lang>      (es | de | fr | it | pt)
   Run it after ANY copy change. It is the only thing that can tell you a locale
   went stale, because a missing key does not break the page — it silently falls
   back to English, which looks fine and is wrong.

   It reports:
     missing   a string the app asks for that the locale does not have
     stale     a string in the locale the app no longer asks for
     errors    a {placeholder} or HTML tag that changed between en and the locale,
               a price that changed, a forbidden override (quiz / product name /
               msrp / family / media), or a keyFacts array that changed length
     warnings  a value identical to its English key, or a description/highlights
               array with a different number of items than the English one

   Keys are collected from THREE places, because not every string is a literal in
   app.js: t()/tx()/tf() literals, the LINEUP_GROUPS titles, the per-course
   upsellFrom values in data.js, and the discount label/note/terms plus footerNote
   in config.js.
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const app = fs.readFileSync(path.join(ROOT, "assets/js/app.js"), "utf8");

// every t()/tx()/tf()/tfx() literal, plus the LINEUP_GROUPS title/sub values
global.window = {};
require(path.join(ROOT, "assets/js/data.js"));
const COURSES_FOR_KEYS = window.GPEN_COURSES;

const keys = new Set();
for (const m of app.matchAll(/\bt(?:x|f|fx)?\(\s*"((?:[^"\\]|\\.)*)"/g)) {
  keys.add(m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
}
for (const m of app.matchAll(/(?:title|sub): "([^"]+)"/g)) keys.add(m[1]);
// Fallback literals inside a lookup: tx(CFG.footerNote || "for authorized …").
// Without this the fallback reads as a stale key when config supplies a value.
for (const m of app.matchAll(/\bt(?:x|f|fx)?\([^)"]*\|\|\s*"((?:[^"\\]|\\.)*)"/g)) {
  // `tx(h.upsellFrom || "")` is an empty-string guard, not a translatable string.
  if (m[1]) keys.add(m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
}
// tx(h.upsellFrom) and t(r.label/note/terms) pass VARIABLES, so those literals live
// in data.js and config.js rather than in app.js. Collect them from the source.
COURSES_FOR_KEYS.forEach((c) => { if (c.howToSell && c.howToSell.upsellFrom) keys.add(c.howToSell.upsellFrom); });
global.window = {};
require(path.join(ROOT, "assets/js/config.js"));
const CFG = window.TRAINING_CONFIG || {};
// The reward endpoint echoes label/note/terms back to the browser and app.js runs
// each through t(), so they are required strings even though no literal appears in
// app.js. config.rewards holds the canonical copy for exactly this reason.
const RW = CFG.rewards || {};
["terms", "note"].forEach((k) => { if (RW[k]) keys.add(RW[k]); });
Object.values(RW.tiers || {}).forEach((tr) => { if (tr && tr.label) keys.add(tr.label); });
if (CFG.footerNote) keys.add(CFG.footerNote);

const toks = (s) => (String(s).match(/\{[a-zA-Z]+\}/g) || []).sort().join(",");
const tags = (s) => (String(s).match(/<\/?[a-z]+>/g) || []).sort().join(",");

const EN_COURSES = {};
COURSES_FOR_KEYS.forEach((c) => (EN_COURSES[c.slug] = c));

const lang = process.argv[2];
global.window = {};
require(path.join(ROOT, "assets/data/i18n/" + lang + ".js"));
const B = window.GPEN_I18N;

const errs = [], warns = [];
if (B.lang !== lang) errs.push(`bundle.lang is "${B.lang}", expected "${lang}"`);

const have = Object.keys(B.strings);
const missing = [...keys].filter((k) => !B.strings[k]);
const extra = have.filter((k) => !keys.has(k));

// placeholder + tag parity, and untranslated leftovers
have.forEach((k) => {
  const v = B.strings[k];
  if (toks(k) !== toks(v)) errs.push(`placeholder mismatch\n    en: ${k}\n    ${lang}: ${v}`);
  if (tags(k) !== tags(v)) errs.push(`HTML tag mismatch\n    en: ${k}\n    ${lang}: ${v}`);
  if (v === k && /[a-z] [a-z]/.test(k) && k !== "Cloud 9 Smoke Shop" && k !== "MSRP") {
    warns.push(`identical to English: ${k}`);
  }
});

// forbidden translations in the course overrides
const NEVER = ["quiz", "slug", "name", "msrp", "accent", "cover", "heroImg", "videos", "gallery", "pairsWith", "passPct"];
Object.keys(B.courses || {}).forEach((slug) => {
  if (!EN_COURSES[slug]) { errs.push(`unknown course slug: ${slug}`); return; }
  const o = B.courses[slug];
  NEVER.forEach((k) => { if (k in o) errs.push(`${slug}: must not override "${k}"`); });
  // arrays must keep their length so nothing silently disappears
  ["highlights", "description"].forEach((k) => {
    if (o[k] && EN_COURSES[slug][k] && o[k].length !== EN_COURSES[slug][k].length) {
      warns.push(`${slug}.${k}: ${o[k].length} items vs ${EN_COURSES[slug][k].length} in English`);
    }
  });
  if (o.howToSell) {
    NEVER.forEach((k) => { if (k in o.howToSell) errs.push(`${slug}.howToSell: must not override "${k}"`); });
    const enKF = EN_COURSES[slug].howToSell.keyFacts || [];
    if (o.howToSell.keyFacts && o.howToSell.keyFacts.length !== enKF.length) {
      errs.push(`${slug}.howToSell.keyFacts: ${o.howToSell.keyFacts.length} items vs ${enKF.length} in English`);
    }
    // prices must survive verbatim
    [["vital", 0], ["aov", 0], ["whichClose", 0]].forEach(([f]) => {
      const en = EN_COURSES[slug].howToSell[f], tr = o.howToSell[f];
      if (!en || !tr) return;
      const ep = (en.match(/\$\d+\.\d\d/g) || []).sort().join(",");
      const tp = (tr.match(/\$\d+\.\d\d/g) || []).sort().join(",");
      if (ep !== tp) errs.push(`${slug}.howToSell.${f}: prices changed (${ep} -> ${tp})`);
    });
  }
});

console.log(`\n=== ${lang} ===`);
console.log(`keys required: ${keys.size}   present: ${have.length}   missing: ${missing.length}   stale: ${extra.length}`);
if (missing.length) console.log("MISSING:\n  " + missing.join("\n  "));
if (extra.length) console.log("STALE (no longer used by app.js):\n  " + extra.join("\n  "));
console.log(`courses translated: ${Object.keys(B.courses || {}).length} / ${COURSES_FOR_KEYS.length}`);
if (errs.length) { console.log("ERRORS:"); errs.forEach((e) => console.log("  ✗ " + e)); }
if (warns.length) { console.log("WARNINGS:"); warns.forEach((w) => console.log("  ! " + w)); }
if (!errs.length && !missing.length) console.log("PASS");
process.exit(errs.length || missing.length ? 1 : 0);
