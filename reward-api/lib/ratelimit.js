/* =============================================================================
   RATE LIMITING for the reward endpoint.

   WHAT IT IS ACTUALLY DEFENDING AGAINST. The code string is a keyed hash of
   tier + email + courseSlug, so ONE email can only ever produce nine codes: six
   per-course plus three milestones. Asking again returns the same code and creates
   no second discount. So per-email limiting buys almost nothing — determinism
   already caps it.

   That claim was FALSE until reward.js started validating courseSlug against the real
   course list. The slug went into the seed unchecked, so one address could mint an
   unlimited number of distinct 25% codes simply by varying it — 1,000 arbitrary slugs
   produced 1,000 distinct codes. Worth recording, because the absence of a per-email
   cap is justified by the sentence above, and that sentence is only true while the
   allowlist in reward.js exists. If it is ever removed, this needs a per-email counter.

   The real exposure is VOLUME ACROSS MANY EMAILS: a script looping over throwaway
   addresses, each yielding a fresh single-use 40% code. That is what these two caps
   target — how many distinct mints one caller can drive, and how many the endpoint
   will perform in a day no matter who asks.

   FAILS OPEN, DELIBERATELY, and this is the opposite of the choice made for
   CODE_SALT and SYNC_SECRET. Those guard correctness and secrecy: without them the
   endpoint should refuse. This guards volume. If the counter store is unreachable,
   refusing would mean no rep anywhere can collect a code they earned — turning a
   third-party blip into an outage of the thing the portal exists to do. An
   unavailable limiter is a worse outcome than an unlimited one for the few minutes
   it lasts, so it logs loudly and allows.

   STORAGE. Upstash Redis over its REST API — no npm dependency, just fetch. Works
   with either the variables Vercel's KV integration injects or Upstash's own.
   Unconfigured means unlimited, with a warning on every call.
   ========================================================================== */

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

/* Tuned against what a real store looks like. Six courses plus three milestones is
   nine codes for one rep who does everything, and a shared shop iPad might serve a
   handful of staff behind one address on one day — 40 leaves generous headroom for
   that while making a loop over throwaway emails hit a wall almost immediately.
   The global cap is the backstop for a distributed attempt: the whole retail network
   certifying at once is nowhere near 500 new codes in a day. */
const PER_IP_PER_DAY = 40;
const GLOBAL_PER_DAY = 500;

function today() {
  return new Date().toISOString().slice(0, 10); // UTC day; a boundary is harmless here
}

/* INCR then EXPIRE, pipelined into one round trip. INCR returns the new value, so the
   first caller of the day sees 1 and sets the TTL — no separate "does the key exist"
   read, and no window where a key could live forever because a second step failed. */
async function bump(key) {
  const res = await fetch(URL_ + "/pipeline", {
    method: "POST",
    headers: { Authorization: "Bearer " + TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify([["INCR", key], ["EXPIRE", key, 172800]]), // 48h, so a day key always outlives its day
  });
  if (!res.ok) throw new Error("kv " + res.status);
  const out = await res.json();
  const n = out && out[0] && typeof out[0].result === "number" ? out[0].result : null;
  if (n === null) throw new Error("kv returned no count");
  return n;
}

/* Read without incrementing. Absent key -> 0. */
async function readCount(key) {
  const res = await fetch(URL_ + "/get/" + encodeURIComponent(key), {
    headers: { Authorization: "Bearer " + TOKEN },
  });
  if (!res.ok) throw new Error("kv " + res.status);
  const out = await res.json();
  const n = out && out.result != null ? parseInt(out.result, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

/* Spend a unit of GLOBAL budget. Called by reward.js only once it has established that
   the discount does not already exist and is about to be created — so re-requests,
   which are idempotent and mint nothing, cost nothing. Never throws: a limiter that is
   down must not turn into an outage of the reward (see the header). */
async function countMint() {
  if (!URL_ || !TOKEN) return;
  try { await bump("rw:all:" + today()); }
  catch (err) { console.error("[reward] could not record a mint against the global cap:", err && err.message); }
}

/* The caller's address. An unknown one collapses to a single shared bucket rather than
   being waved through — if we cannot tell callers apart, they should share a limit
   rather than escape it. Be clear about the ceiling either way: even an unforgeable
   address only makes 40/day-per-IP true, and a proxy pool rotates addresses for
   pennies. This bounds casual abuse, not a determined one. */
function clientIp(req) {
  /* Vercel sets x-vercel-forwarded-for and x-real-ip itself and a client cannot forge
     them. x-forwarded-for is the conventional chain header and IS client-settable, so
     preferring it meant a caller could potentially hand us a fresh address per request
     and reset their own per-IP budget at will. Trust the platform's headers first and
     fall back to the chain only if neither is present. */
  const vercel = String(req.headers["x-vercel-forwarded-for"] || "").split(",")[0].trim();
  if (vercel) return vercel;
  const real = String(req.headers["x-real-ip"] || "").trim();
  if (real) return real;
  return String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
}

/* Returns { ok } or { ok: false, reason, retryAfter }. Never throws. */
async function check(req) {
  if (!URL_ || !TOKEN) {
    console.warn(
      "[reward] rate limiting is NOT active: set KV_REST_API_URL and KV_REST_API_TOKEN " +
      "(Vercel → Storage → create a KV/Upstash store and link it to this project). " +
      "Until then the endpoint will mint without a ceiling."
    );
    return { ok: true, unlimited: true };
  }
  try {
    const day = today();
    const ip = clientIp(req);
    /* Per-IP first, and only bump the GLOBAL counter if that passes. Bumping both up
       front meant a caller already refused by the per-IP cap kept driving the global
       counter toward its ceiling — so one abusive address could lock out the entire
       retail network for the rest of the UTC day despite being individually capped at
       40. Refused requests should not spend everyone else's budget. */
    const ipCount = await bump("rw:ip:" + day + ":" + ip);
    if (ipCount > PER_IP_PER_DAY) {
      console.warn("[reward] per-IP daily cap hit for " + ip + " (" + ipCount + "/" + PER_IP_PER_DAY + ")");
      return { ok: false, reason: "ip", retryAfter: 3600 };
    }
    /* READ the global counter here; countMint() increments it, and only for a request
       that actually creates a discount.

       This used to increment on every request, before reward.js had even asked Shopify
       whether the code already existed. So repeating ONE request — same email, same
       tier, which is idempotent and creates nothing — 500 times exhausted the global
       budget for the whole UTC day. Every legitimate rep then got a 429 and, because
       the portal renders nothing when issuance fails, simply no code at all, while
       Shopify admin showed not a single discount to explain why. A denial of service
       that costs the attacker nothing and leaves no trace in the place you would look.

       Now an idempotent re-request costs one Shopify read and no global budget. */
    const allCount = await readCount("rw:all:" + day);
    if (allCount >= GLOBAL_PER_DAY) {
      console.error("[reward] GLOBAL daily cap hit (" + allCount + "/" + GLOBAL_PER_DAY + ") — refusing. If this is legitimate traffic, raise GLOBAL_PER_DAY.");
      return { ok: false, reason: "global", retryAfter: 3600 };
    }
    return { ok: true };
  } catch (err) {
    // See the header: a limiter that is down must not become an outage of the reward.
    console.error("[reward] rate limiter unavailable, allowing this request:", err && err.message);
    return { ok: true, degraded: true };
  }
}

module.exports = { check, countMint, PER_IP_PER_DAY, GLOBAL_PER_DAY };
