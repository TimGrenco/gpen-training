# Completion reporting — superseded

**The scripts that used to be in this file have been deleted, deliberately.** They were
written before `google-sheet/Code.gs` existed and following them destroyed a working
system in five separate ways. A launch-readiness audit called this the most dangerous file
in the repo, and `config.js` used to point people here twice.

## Where reporting actually lives

- **The receiver:** [`google-sheet/Code.gs`](../google-sheet/Code.gs)
- **How to set it up:** [`google-sheet/README.md`](../google-sheet/README.md)
- **The send point:** `reportCompletion` in `assets/js/config.js` — one function, one place
- **Day-2 operations:** [`RUNBOOK.md`](RUNBOOK.md), including the Apps Script redeploy trap

## Why the old scripts were removed rather than corrected

Recorded so nobody reconstructs them from memory or from an older checkout:

1. **They replied with plain text `"ok"`.** The client now requires a 200 whose body parses
   as JSON with `ok: true`. Plain text fails to parse, so the event is never marked
   delivered — and it is **replayed on every single page load, forever**.
2. **They wrote raw values with `appendRow` and no `safe_()` guard**, re-opening the Google
   Sheets formula-injection hole that `Code.gs` closes. A rep name beginning `=` becomes a
   live formula in a sheet holding staff emails and live discount codes.
3. **No `LockService` lock**, so two simultaneous certifications could interleave.
4. **`appendRow` instead of upsert-on-certificate-ID**, so one rep produced several rows
   that could never be reconciled with their discount code.
5. **A different column layout entirely**, and no handling of the `code_issued` event —
   the one carrying the discount code.

They also claimed the portal posts `mode: "no-cors"` and cannot read the response. That
was true once, was a bug, and was fixed: `reportCompletion` reads and parses the body.

## The one thing worth salvaging

The sweepstakes winner logic — count full-lineup certifications, pick every Nth — was only
ever described here, and **it has never been implemented in `Code.gs`.** So if anyone ever
sets `sweepstakes.rulesUrl` in `config.js`, the promotion publishes with no counter and no
winner selection behind it. That work has to be written on top of `Code.gs`'s existing
`doPost` / `upsert_` / `safe_` before the sweepstakes can go live, and `config.js` used to
imply this file was the source of truth for `everyNth` and `rotation`. It is not — nothing
reads them.
