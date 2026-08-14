/* =============================================================================
   RATE LIMITING for the reward endpoint.

   WHAT IT IS ACTUALLY DEFENDING AGAINST. The code string is a keyed hash of
   tier + email + courseSlug, so ONE email can only ever produce nine codes: six
   per-course plus three milestones. Asking again returns the same code and creates
   no second discount. So per-email limiting buys almost nothing — determinism
   already caps it.

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

/* The caller's address. Vercel sets x-forwarded-for; the FIRST entry is the client,
   the rest are proxies, and trusting the last would let a caller pin their own value.
   An unknown address collapses to one shared bucket rather than being waved through —
   if we cannot tell callers apart, they should share a limit, not escape it. */
function clientIp(req) {
  const xff = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return xff || String(req.headers["x-real-ip"] || "").trim() || "unknown";
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
    const [ipCount, allCount] = await Promise.all([
      bump("rw:ip:" + day + ":" + ip),
      bump("rw:all:" + day),
    ]);
    if (allCount > GLOBAL_PER_DAY) {
      console.error("[reward] GLOBAL daily cap hit (" + allCount + "/" + GLOBAL_PER_DAY + ") — refusing. If this is legitimate traffic, raise GLOBAL_PER_DAY.");
      return { ok: false, reason: "global", retryAfter: 3600 };
    }
    if (ipCount > PER_IP_PER_DAY) {
      console.warn("[reward] per-IP daily cap hit for " + ip + " (" + ipCount + "/" + PER_IP_PER_DAY + ")");
      return { ok: false, reason: "ip", retryAfter: 3600 };
    }
    return { ok: true };
  } catch (err) {
    // See the header: a limiter that is down must not become an outage of the reward.
    console.error("[reward] rate limiter unavailable, allowing this request:", err && err.message);
    return { ok: true, degraded: true };
  }
}

module.exports = { check, PER_IP_PER_DAY, GLOBAL_PER_DAY };
