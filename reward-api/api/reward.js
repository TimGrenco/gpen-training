/* =============================================================================
   REWARD ENDPOINT — mints one Shopify discount code per person, per course.

   POST { tier, email, name, store, certId, courseSlug }
     -> 200 { code, label, note, terms }
     -> 4xx/5xx { error }  (the portal shows no code at all when this happens)

   WHY THIS EXISTS. Creating a discount needs a Shopify Admin API token. A token in
   the browser is a token published on the internet, so the browser calls this and
   this holds the token.

   WHAT IT CREATES. One DiscountCodeBasic per code, with usageLimit 1. That detail
   matters: in Shopify, usageLimit belongs to the DISCOUNT, not to an individual code
   within it. Adding many codes to one shared discount would give them a shared
   allowance — the first redemption anywhere would burn it for everybody. One discount
   per code is what makes "one use per person" true.

   IDEMPOTENT BY CONSTRUCTION. The code string is a keyed hash of tier + email (+
   course slug for the per-course tier), so the same person asking twice computes the
   same code; the handler looks it up before creating and returns the existing one. No
   database, and a retry after a timeout cannot double-mint. The browser also caches
   what it received, so in practice this is asked once.

   THE PERCENTAGES ARE SERVER-SIDE ON PURPOSE. The request says which TIER, never how
   much. A tampered browser cannot ask for 90% off.
   ========================================================================== */
const crypto = require("crypto");
const ratelimit = require("../lib/ratelimit");

const API_VERSION = "2026-07";

/* The tier table. This is the authority — assets/js/config.js has a copy for display
   only, and app.js warns at boot if the two disagree. Keep them in step with LADDER. */
const TIERS = {
  course: { pct: 25, label: "25% off your next order at gpen.com" },
  trio:   { pct: 30, label: "30% off your next order at gpen.com" },
  master: { pct: 35, label: "35% off your entire order at gpen.com" },
  secret: { pct: 40, label: "40% off your entire order at gpen.com" },
};

const TERMS = "One use per person. Not combinable with other offers. Expires 90 days after it is issued.";
const VALID_DAYS = 90;

/* Only these origins may call this. A reward endpoint that answers "*" is a reward
   endpoint any page on the internet can mint against. */
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  "https://training.gpen.com,http://localhost:4753").split(",").map((s) => s.trim());

/* Crockford base32 minus the letters that get misread aloud or in a screenshot: no
   I, L, O, U. A rep reads this code down a phone line. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function shortHash(input, len) {
  const mac = crypto.createHmac("sha256", process.env.CODE_SALT || "").update(input).digest();
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[mac[i] % ALPHABET.length];
  return out;
}

/* GPT-25-K3M7QX — prefix, the percentage, then six characters that cannot be guessed
   from someone else's code. The old scheme was GPENPRO25 for everybody, which meant
   one screenshot was unlimited use for anyone. */
function codeFor({ tier, email, courseSlug }) {
  const pct = TIERS[tier].pct;
  const seed = [tier, email, tier === "course" ? courseSlug || "" : ""].join("|");
  return `GPT-${pct}-${shortHash(seed, 6)}`;
}

async function shopify(query, variables) {
  const shop = process.env.SHOPIFY_SHOP;             // grencoscience.myshopify.com
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!shop || !token) throw new Error("SHOPIFY_SHOP or SHOPIFY_ADMIN_TOKEN is not set");
  const res = await fetch(`https://${shop}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (!res.ok || body.errors) {
    throw new Error("Shopify API error: " + JSON.stringify(body.errors || body).slice(0, 500));
  }
  return body.data;
}

const LOOKUP = `
  query Lookup($code: String!) {
    codeDiscountNodeByCode(code: $code) {
      id
      codeDiscount { ... on DiscountCodeBasic { title status } }
    }
  }`;

/* `context: { all: ALL }` is the current field; customerSelection is deprecated.
   combinesWith is all false so a training reward cannot be stacked onto a sale. */
const CREATE = `
  mutation Create($input: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $input) {
      codeDiscountNode { id }
      userErrors { field message code }
    }
  }`;

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  /* Origin must be PRESENT and allowed. This was `if (origin && ...)`, which skipped
     the check whenever the header was absent — and absent is the default for curl, a
     script, or a bot. The allowlist only ever constrained real browsers, which are the
     one caller class that was never the threat, while the README claimed the endpoint
     was origin-checked.

     Be clear about what this does and does not buy: an Origin header is trivially
     spoofed with one curl flag, so this stops drive-by and automated abuse, not a
     determined attacker. The real exposure — that `tier` is caller-chosen with no
     server-verifiable proof of completion — is architectural and is written up in
     .github/GOLIVE.md. */
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).json({ error: "origin not allowed" });
  }

  let body = req.body;
  // The portal sends text/plain to stay a CORS simple request, so Vercel hands it
  // over unparsed. Accept either.
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body !== "object") return res.status(400).json({ error: "invalid body" });

  const tier = String(body.tier || "");
  const email = String(body.email || "").trim().toLowerCase();
  const courseSlug = String(body.courseSlug || "");

  /* Fail closed on a missing salt. `createHmac("sha256", process.env.CODE_SALT || "")`
     below would silently key the HMAC with the empty string, making every code a
     deterministic public function of tier+email+slug — and the derivation is readable
     in this file. An unconfigured deploy would hand out guessable codes rather than
     failing, which is the same fail-open shape already fixed in redemptions.js. */
  if (!process.env.CODE_SALT) {
    console.error("CODE_SALT is not set; refusing to mint guessable codes");
    return res.status(500).json({ error: "CODE_SALT is not configured on the server" });
  }
  if (!TIERS[tier]) return res.status(400).json({ error: "unknown tier" });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "invalid email" });
  // The per-course tier is unique per course, so it needs one.
  if (tier === "course" && !courseSlug) return res.status(400).json({ error: "courseSlug required for the course tier" });

  /* Checked after validation (a malformed request should not spend a caller's budget)
     and before Shopify (a refusal should cost no API calls and create nothing). The
     limiter fails open by design — see lib/ratelimit.js. */
  const rl = await ratelimit.check(req);
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter || 3600));
    return res.status(429).json({ error: "too many requests, try again later" });
  }

  const { pct, label } = TIERS[tier];
  const code = codeFor({ tier, email, courseSlug });
  const payload = { code, label, note: "Enter this code at checkout on gpen.com. It applies to the whole order.", terms: TERMS };

  try {
    // Already minted — hand back the same code rather than creating a second discount.
    const found = await shopify(LOOKUP, { code });
    if (found && found.codeDiscountNodeByCode) return res.status(200).json(payload);

    const now = new Date();
    const ends = new Date(now.getTime() + VALID_DAYS * 86400000);
    /* Backdated a minute, not stamped at "now". A discount whose startsAt has not yet
       passed comes back SCHEDULED rather than ACTIVE, and a SCHEDULED code is refused
       at checkout — which is the exact failure this whole design exists to avoid, since
       the rep is looking at the code on screen the same second it is created. Sitting a
       minute behind removes any dependence on Shopify's clock agreeing with ours to the
       millisecond. Confirmed against the live store: startsAt a minute ahead really does
       report SCHEDULED. It costs a minute of a 90-day life. */
    const starts = new Date(now.getTime() - 60000);
    const created = await shopify(CREATE, {
      input: {
        title: `Training ${pct}% — ${tier}${courseSlug ? " — " + courseSlug : ""} — ${email}`,
        code,
        startsAt: starts.toISOString(),
        endsAt: ends.toISOString(),
        usageLimit: 1,                 // the discount holds one code, so this is per person
        appliesOncePerCustomer: true,
        context: { all: "ALL" },
        customerGets: { value: { percentage: pct / 100 }, items: { all: true } },
        combinesWith: { productDiscounts: false, orderDiscounts: false, shippingDiscounts: false },
      },
    });

    const errs = created.discountCodeBasicCreate.userErrors || [];
    if (errs.length) {
      // A duplicate code means a concurrent request won the race — that is the
      // idempotent outcome, not a failure.
      if (errs.some((e) => String(e.code) === "TAKEN" || /already exists|taken/i.test(e.message || ""))) {
        return res.status(200).json(payload);
      }
      // Logged, not returned: raw Shopify userErrors describe store internals and the
      // caller can do nothing with them.
      console.error("discountCodeBasicCreate userErrors", errs);
      return res.status(502).json({ error: "shopify rejected the discount" });
    }
    return res.status(200).json(payload);
  } catch (err) {
    console.error("reward endpoint failed", err);
    return res.status(502).json({ error: "could not issue a code" });
  }
};
