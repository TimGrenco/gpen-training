/* =============================================================================
   ONE-TIME INSTALL — step 1 of 2. DELETE THIS FILE ONCE YOU HAVE THE TOKEN.

   GET /api/install   ->  redirects you to Shopify to authorise the app

   WHY THIS EXISTS. Creating a custom app from the Shopify admin — the route that
   simply handed you a permanent shpat_ token — closed on 1 January 2026. Apps now
   come from the Dev Dashboard, which issues OAuth credentials (a client ID and
   secret) and expects the app to complete a handshake to receive a token.

   This endpoint and its callback ARE that handshake, run once, by hand, purely to
   obtain the offline token that the reward endpoint then uses forever. We are not
   building an app server: there is no session, no database, nothing stored. You
   open one URL, approve, and the callback shows you the token to paste into Vercel.

   `offline` access mode is the important part. An offline token does not expire and
   is not tied to a logged-in user, which is exactly right for a background function
   minting discounts at 2am with nobody at a keyboard.

   Requires SHOPIFY_API_KEY (the Dev Dashboard "Client ID") and OAUTH_STATE_SECRET.
   ========================================================================== */
const crypto = require("crypto");

module.exports = async function handler(req, res) {
  const shop = process.env.SHOPIFY_SHOP;
  const key = process.env.SHOPIFY_API_KEY;
  const secret = process.env.OAUTH_STATE_SECRET;

  const missing = ["SHOPIFY_SHOP", "SHOPIFY_API_KEY", "OAUTH_STATE_SECRET"].filter((k) => !process.env[k]);
  if (missing.length) {
    return res.status(500).send("Set these environment variables first: " + missing.join(", "));
  }
  if (!/^[a-z0-9-]+\.myshopify\.com$/i.test(shop)) {
    return res.status(500).send(`SHOPIFY_SHOP must be the admin domain, e.g. grencoscience.myshopify.com — got "${shop}"`);
  }

  /* The scopes the reward endpoint actually needs, and nothing else. Shopify shows
     these on the approval screen, so what you approve is what you audited. */
  const scopes = "write_discounts,read_discounts";

  /* state defeats CSRF on the callback: the callback recomputes this and refuses
     anything it did not issue. Derived rather than random so no store is needed —
     the callback can verify it statelessly. */
  const state = crypto.createHmac("sha256", secret).update(shop + "|install").digest("hex").slice(0, 32);

  const redirectUri = `https://${req.headers.host}/api/oauth-callback`;
  const url =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${encodeURIComponent(key)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}` +
    `&grant_options[]=`; // empty = offline access: a token that does not expire

  res.writeHead(302, { Location: url });
  res.end();
};
