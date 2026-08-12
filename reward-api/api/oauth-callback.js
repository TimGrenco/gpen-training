/* =============================================================================
   ONE-TIME INSTALL — step 2 of 2. DELETE THIS FILE ONCE YOU HAVE THE TOKEN.

   GET /api/oauth-callback?code=...&hmac=...&shop=...&state=...
     -> shows the permanent Admin API access token, once, in your browser

   Shopify redirects here after you approve the app. This exchanges the one-time
   code for an offline access token and prints it for you to paste into Vercel as
   SHOPIFY_ADMIN_TOKEN. Nothing is stored — this file is a funnel, not a service.

   WHY IT VERIFIES EVERYTHING BEFORE TRUSTING THE REQUEST. This is a public URL
   that trades a query parameter for a credential. So: the HMAC proves Shopify sent
   it and nobody tampered with it, `state` proves we started the flow, and `shop` is
   checked against SHOPIFY_SHOP so a stranger cannot point our client secret at
   their own store and have us do the exchange for them.

   The token is shown in the page body on purpose. The alternative — logging it — puts
   a permanent store credential into Vercel's log retention, where it lives on after
   you have finished with it and is readable by anyone with log access.

   AFTER YOU HAVE THE TOKEN: delete this file and api/install.js, and remove
   SHOPIFY_API_KEY, SHOPIFY_API_SECRET and OAUTH_STATE_SECRET from Vercel. The
   reward endpoint needs none of them — only SHOPIFY_ADMIN_TOKEN. Leaving a live
   token-minting route deployed is the kind of thing that gets found later.
   ========================================================================== */
const crypto = require("crypto");

/* Shopify signs the query string. Rebuild it exactly as documented — every param
   except `hmac`, sorted, joined with & — then compare in constant time. */
function hmacValid(query, secret) {
  const { hmac, ...rest } = query;
  if (!hmac) return false;
  const message = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${Array.isArray(rest[k]) ? rest[k].join(",") : rest[k]}`)
    .join("&");
  const digest = crypto.createHmac("sha256", secret).update(message).digest("hex");
  const a = Buffer.from(digest, "utf8");
  const b = Buffer.from(String(hmac), "utf8");
  // timingSafeEqual throws on a length mismatch, which is itself a failed compare.
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function page(title, body) {
  return `<!doctype html><meta charset="utf-8"><title>${title}</title>` +
    `<body style="font:16px/1.6 system-ui,sans-serif;max-width:44rem;margin:3rem auto;padding:0 1rem">${body}</body>`;
}

module.exports = async function handler(req, res) {
  const shop = process.env.SHOPIFY_SHOP;
  const key = process.env.SHOPIFY_API_KEY;
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  const stateSecret = process.env.OAUTH_STATE_SECRET;

  const missing = ["SHOPIFY_SHOP", "SHOPIFY_API_KEY", "SHOPIFY_API_SECRET", "OAUTH_STATE_SECRET"]
    .filter((k) => !process.env[k]);
  if (missing.length) return res.status(500).send("Missing environment variables: " + missing.join(", "));

  const q = req.query || {};

  if (!hmacValid(q, apiSecret)) {
    return res.status(400).send(page("Rejected", "<h1>Rejected</h1><p>The HMAC did not verify, so this request did not come from Shopify (or was altered on the way). Nothing was exchanged.</p>"));
  }
  const expectedState = crypto.createHmac("sha256", stateSecret).update(shop + "|install").digest("hex").slice(0, 32);
  if (String(q.state || "") !== expectedState) {
    return res.status(400).send(page("Rejected", "<h1>Rejected</h1><p>The <code>state</code> parameter does not match one we issued. Start again at <code>/api/install</code>.</p>"));
  }
  if (String(q.shop || "").toLowerCase() !== String(shop).toLowerCase()) {
    return res.status(400).send(page("Rejected", `<h1>Rejected</h1><p>This flow is locked to <code>${shop}</code>, but the callback named <code>${String(q.shop || "")}</code>.</p>`));
  }
  if (!q.code) return res.status(400).send(page("Rejected", "<h1>Rejected</h1><p>No <code>code</code> to exchange.</p>"));

  try {
    const r = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id: key, client_secret: apiSecret, code: q.code }),
    });
    const data = await r.json();
    if (!r.ok || !data.access_token) {
      return res.status(502).send(page("Exchange failed",
        `<h1>Exchange failed</h1><p>Shopify returned ${r.status}.</p><pre>${JSON.stringify(data, null, 2).replace(/</g, "&lt;")}</pre>` +
        `<p>A code can only be exchanged once and expires quickly — if you reloaded this page, start again at <a href="/api/install">/api/install</a>.</p>`));
    }

    return res.status(200).send(page("Token", `
      <h1>Token issued</h1>
      <p>Paste this into Vercel as <code>SHOPIFY_ADMIN_TOKEN</code>, then redeploy:</p>
      <pre style="background:#f4f4f5;padding:1rem;border-radius:8px;overflow-x:auto;user-select:all">${String(data.access_token).replace(/</g, "&lt;")}</pre>
      <p>Granted scopes: <code>${String(data.scope || "").replace(/</g, "&lt;")}</code> — this should read
      <code>write_discounts,read_discounts</code> and nothing more.</p>
      <h2>Now clean up</h2>
      <ol>
        <li>Delete <code>api/install.js</code> and <code>api/oauth-callback.js</code>, then redeploy.</li>
        <li>Remove <code>SHOPIFY_API_KEY</code>, <code>SHOPIFY_API_SECRET</code> and
            <code>OAUTH_STATE_SECRET</code> from Vercel — the reward endpoint uses none of them.</li>
      </ol>
      <p>This token does not expire. It stays valid after the cleanup, and it is the
      only Shopify credential the portal needs from here on.</p>
      <p><strong>This page is shown once.</strong> Reloading it will fail, because the code
      behind it has already been spent.</p>
    `));
  } catch (err) {
    console.error("oauth exchange failed", err && err.message);
    return res.status(502).send(page("Exchange failed", "<h1>Exchange failed</h1><p>Could not reach Shopify. Try <a href='/api/install'>/api/install</a> again.</p>"));
  }
};
