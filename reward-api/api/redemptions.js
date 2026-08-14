/* =============================================================================
   REDEMPTION LOOKUP — has this code been used on gpen.com yet?

   POST { codes: ["GPT-25-XXXXXX", ...] }   (up to 100)
     -> 200 { checkedAt, results: [ { code, found, used, usedCount, status, endsAt } ] }

   Called by the Google Sheet's hourly sync, not by the portal. It is read-only:
   read_discounts is the only scope it needs.

   WHY THE SHEET DOES NOT ASK SHOPIFY DIRECTLY. It would mean a second copy of the
   Admin token, in Apps Script, belonging to whoever owns the sheet. The token stays
   in one place; the sheet gets an answer it cannot misuse.

   `asyncUsageCount` is read from the CODE, not the discount. For these rewards the two
   are the same number — one discount holds one code — but reading the code's own count
   stays correct if that ever changes. Shopify updates it asynchronously, so a
   redemption can take a few minutes to appear. The sheet's column says "checked at" for
   exactly that reason: it reports what Shopify had, not what is true this instant.
   ========================================================================== */
const API_VERSION = "2026-07";
const MAX_CODES = 100;
const BATCH = 25; // aliases per GraphQL request, to stay well inside the cost limit

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  "https://training.gpen.com").split(",").map((s) => s.trim());

async function shopify(query, variables) {
  const shop = process.env.SHOPIFY_SHOP;
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!shop || !token) throw new Error("SHOPIFY_SHOP or SHOPIFY_ADMIN_TOKEN is not set");
  const res = await fetch(`https://${shop}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (!res.ok || body.errors) throw new Error("Shopify API error: " + JSON.stringify(body.errors || body).slice(0, 400));
  return body.data;
}

/* One request per batch, aliased r0..rN, rather than one request per code. */
function buildQuery(n) {
  const args = Array.from({ length: n }, (_, i) => `$c${i}: String!`).join(", ");
  const fields = Array.from({ length: n }, (_, i) => `
    r${i}: codeDiscountNodeByCode(code: $c${i}) {
      codeDiscount {
        ... on DiscountCodeBasic {
          status
          endsAt
          codes(first: 1) { nodes { code asyncUsageCount } }
        }
      }
    }`).join("");
  return `query Redemptions(${args}) {${fields}\n}`;
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || "";
  // Apps Script sends no Origin, so an absent one is allowed; a present one must match.
  // Vary is unconditional — see reward.js; a response whose content depends on Origin
  // must say so even when it declines to set Access-Control-Allow-Origin.
  res.setHeader("Vary", "Origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return res.status(403).json({ error: "origin not allowed" });

  /* A shared secret, because this one is called by a sheet rather than a browser, so
     there is no origin to check — an absent Origin is allowed above precisely so Apps
     Script can reach it.

     FAILS CLOSED. This was `if (secret && ...)`, which skipped the check whenever
     SYNC_SECRET was unset — an unconfigured deploy was an unauthenticated one. That is
     the wrong way round: the moment SHOPIFY_ADMIN_TOKEN is set and this variable is
     forgotten, anyone could ask whether any code had been redeemed, and enumerate
     codes while they were at it. Refusing to answer without a secret costs a clear
     error message; guessing wrong costs a public oracle. */
  const secret = process.env.SYNC_SECRET;
  if (!secret) {
    console.error("SYNC_SECRET is not set; refusing every request until it is");
    return res.status(500).json({ error: "SYNC_SECRET is not configured on the server" });
  }
  if (req.headers["x-sync-secret"] !== secret) return res.status(401).json({ error: "bad or missing x-sync-secret" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const codes = (body && Array.isArray(body.codes) ? body.codes : [])
    .map((c) => String(c || "").trim().toUpperCase())
    .filter(Boolean)
    .filter((c, i, a) => a.indexOf(c) === i)      // de-dupe: the sheet may list a code twice
    .slice(0, MAX_CODES);
  if (!codes.length) return res.status(400).json({ error: "codes[] required" });

  try {
    const results = [];
    for (let i = 0; i < codes.length; i += BATCH) {
      const slice = codes.slice(i, i + BATCH);
      const vars = {};
      slice.forEach((c, k) => { vars["c" + k] = c; });
      const data = await shopify(buildQuery(slice.length), vars);
      slice.forEach((code, k) => {
        const node = data["r" + k];
        const d = node && node.codeDiscount;
        if (!d) {
          // No such discount. Either it was deleted in the admin, or the code predates
          // the Shopify integration — the four shared codes the portal used to hand out
          // never existed in the store at all.
          results.push({ code, found: false, used: false, usedCount: 0, status: "NOT_FOUND", endsAt: null });
          return;
        }
        const rc = (d.codes && d.codes.nodes && d.codes.nodes[0]) || null;
        const usedCount = rc ? rc.asyncUsageCount : 0;
        results.push({ code, found: true, used: usedCount > 0, usedCount, status: d.status || "", endsAt: d.endsAt || null });
      });
    }
    return res.status(200).json({ checkedAt: new Date().toISOString(), results });
  } catch (err) {
    console.error("redemptions lookup failed", err);
    return res.status(502).json({ error: "could not read redemptions" });
  }
};
