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
               msrp / family / media), or a keyFacts array that changed length.
               EVERY string in the courses tree is swept for this, at any depth
               and inside arrays, and reported as slug + field path — not just
               the three howToSell fields the targeted checks below cover.
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

/* Tag names only, normalised. Matches attributes (<span lang="en">), uppercase
   (<STRONG>) and self-closing (<br/>), so a translator cannot smuggle a tag past
   the checker by writing it in a form the old bare-lowercase regex could not see. */
const TAG_RE = /<(\/?)([A-Za-z][A-Za-z0-9]*)\b[^>]*?(\/?)>/g;
const tagList = (s) => {
  const out = [];
  let m;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(String(s)))) {
    const name = m[2].toLowerCase();
    out.push(m[1] ? "/" + name : m[3] ? name + "/" : name);
  }
  return out;
};
const tags = (s) => tagList(s).sort().join(",");
// "<strong>a</strong>" is balanced; "<strong>a" and "</strong>a<strong>" are not.
const tagsBalanced = (s) => {
  const stack = [];
  for (const t of tagList(s)) {
    if (t.endsWith("/")) continue; // self-closing / void
    if (t.startsWith("/")) { if (stack.pop() !== t.slice(1)) return false; }
    else stack.push(t);
  }
  return stack.length === 0;
};

/* ---- number / price parity -------------------------------------------------
   Every locale here writes numbers its own way, so a raw string compare is
   useless: es/de/it/pt use "0,4" for 0.4 and "1.100" for 1,100, fr writes
   "1 100" with a space. canonNum() folds all of those to one canonical value so
   only a REAL change of quantity shows up as a difference. */
const NUM_RE = /\d(?:[\d.,]*\d)?/g;
const canonNum = (raw) => {
  // ".100" / ",100" is a thousands group; a shorter tail is a decimal mark.
  const s = raw.replace(/([.,])(\d{3})(?!\d)/g, "$2").replace(",", ".");
  const n = parseFloat(s);
  return Number.isNaN(n) ? raw : String(n);
};
/* fr's space-separated groups ("1 100 mAh") would otherwise read as two numbers.
   Only join across a space when the joined value is one English already claims —
   that way "1 100" folds to 1100, but "$12.95 510" never becomes 5510, and a
   corrupted "1 200" finds no English 1200 to hide behind and stays a mismatch. */
const nums = (s, allowed) => {
  let str = String(s);
  if (allowed) {
    str = str.replace(/(\d)[\s   ](\d{3})(?!\d)/g, (m, a, b) =>
      allowed.has(canonNum(a + b)) ? a + b : m);
  }
  return (str.match(NUM_RE) || []).map(canonNum);
};
const bag = (list) => { const m = new Map(); list.forEach((v) => m.set(v, (m.get(v) || 0) + 1)); return m; };
// entries of `a` that `b` cannot account for
const minus = (a, b) => {
  const left = new Map(b);
  const out = [];
  a.forEach((n, v) => {
    const take = Math.min(n, left.get(v) || 0);
    left.set(v, (left.get(v) || 0) - take);
    for (let i = 0; i < n - take; i++) out.push(v);
  });
  return out;
};
/* Known-good divergences, confirmed across all five bundles. Anything outside
   these stays an error — they are deliberately narrow so a real edit cannot
   dress itself up as one of them. */
// de writes small counts as words ("dreiteilig" for "3-piece"), so a small
// integer may vanish. Only a DROP is forgiven; an unexplained new number is not.
const isSpelledOut = (v) => /^\d+$/.test(v) && +v >= 1 && +v <= 12;
// Some taglines name the 510 format and some don't; both readings are approved.
const isTaglineFivetenArtifact = (v, field) => v === "510" && /(^|\.)tagline$/.test(field);

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

/* Deep parity sweep over the whole course override tree. The targeted checks
   above only ever looked at howToSell.vital/aov/whichClose, so prices and
   <strong> tags in talkTrack.say, trap, keyFacts[], description[], highlights[]
   and tagline were unguarded. This walks EVERY string at any depth, arrays
   included, against its English counterpart and names the exact field path so a
   failure is actionable. */
function walkCourse(tr, en, field, slug) {
  if (typeof tr === "string") {
    if (typeof en !== "string") return;
    const at = `${slug}${field}`;
    if (toks(tr) !== toks(en)) {
      errs.push(`${at}: placeholder mismatch\n    en: ${en}\n    ${lang}: ${tr}`);
    }
    if (tags(tr) !== tags(en)) {
      errs.push(`${at}: HTML tag mismatch (${tags(en) || "none"} -> ${tags(tr) || "none"})\n    en: ${en}\n    ${lang}: ${tr}`);
    } else if (!tagsBalanced(tr)) {
      errs.push(`${at}: unbalanced HTML tags\n    ${lang}: ${tr}`);
    }
    const enCash = (en.match(/\$/g) || []).length, trCash = (tr.match(/\$/g) || []).length;
    if (enCash !== trCash) {
      errs.push(`${at}: currency markers changed (${enCash} -> ${trCash})\n    en: ${en}\n    ${lang}: ${tr}`);
    }
    const enBag = bag(nums(en));
    const trBag = bag(nums(tr, new Set(nums(en))));
    const dropped = minus(enBag, trBag)
      .filter((v) => !isSpelledOut(v) && !isTaglineFivetenArtifact(v, field));
    const added = minus(trBag, enBag)
      .filter((v) => !isTaglineFivetenArtifact(v, field));
    if (dropped.length || added.length) {
      const how = [dropped.length ? `lost ${dropped.join(", ")}` : "", added.length ? `gained ${added.join(", ")}` : ""].filter(Boolean).join("; ");
      errs.push(`${at}: numbers changed (${how})\n    en: ${en}\n    ${lang}: ${tr}`);
    }
    return;
  }
  if (Array.isArray(tr)) {
    if (!Array.isArray(en)) return;
    tr.forEach((v, i) => walkCourse(v, en[i], `${field}[${i}]`, slug));
    return;
  }
  if (tr && typeof tr === "object" && en && typeof en === "object") {
    Object.keys(tr).forEach((k) => walkCourse(tr[k], en[k], `${field}.${k}`, slug));
  }
}
Object.keys(B.courses || {}).forEach((slug) => {
  if (EN_COURSES[slug]) walkCourse(B.courses[slug], EN_COURSES[slug], "", slug);
});

console.log(`\n=== ${lang} ===`);
console.log(`keys required: ${keys.size}   present: ${have.length}   missing: ${missing.length}   stale: ${extra.length}`);
if (missing.length) console.log("MISSING:\n  " + missing.join("\n  "));
if (extra.length) console.log("STALE (no longer used by app.js):\n  " + extra.join("\n  "));
const translatedCourses = Object.keys(B.courses || {});
console.log(`courses translated: ${translatedCourses.length} / ${COURSES_FOR_KEYS.length}`);
/* An untranslated course is an ERROR, not a note. RUNBOOK tells whoever adds a course to
   rely on this command to catch a bundle they forgot, and it did not: the count was
   printed and the exit code ignored it, so a locale missing a whole course still reported
   PASS and exited 0. Name the missing slugs, because "5 / 6" does not tell you which. */
COURSES_FOR_KEYS.forEach((c) => {
  if (!(B.courses || {})[c.slug]) errs.push(`course "${c.slug}" has no translation in this bundle`);
});
if (errs.length) { console.log("ERRORS:"); errs.forEach((e) => console.log("  ✗ " + e)); }
if (warns.length) { console.log("WARNINGS:"); warns.forEach((w) => console.log("  ! " + w)); }
if (!errs.length && !missing.length) console.log("PASS");
process.exit(errs.length || missing.length ? 1 : 0);
