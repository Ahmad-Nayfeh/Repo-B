# STATUS

> First file any session reads. Kept current at all times.

**Current phase:** Phase 5 complete (final independent review: *ship with caveats*, all findings resolved). Next: loop to ROADMAP.
**Last updated:** 2026-11-13

## The one thing that needs Ahmad
**The site is not live yet.** GitHub Pages must be switched on once (Settings → Pages → Source: GitHub Actions) — 1 minute, steps in [`NEEDS-AHMAD.md`](NEEDS-AHMAD.md) §1. Until then the "Deploy to GitHub Pages" workflow builds and tests but **skips** the deploy (it shows green with a notice — a green run is not a live site). After switching it on, run the workflow once manually; the site appears at https://ahmad-nayfeh.github.io/Repo-B/.

## What exists
- **App** (`src/`): Arabic-first PWA for structured debates.
  - Munazara move set with one validity matrix; computed statuses; **symmetric obligations** («عليك الرد» / «دورك») for every participant; nothing closes by silence; no scores.
  - Screens: home, new debate, join, status (waiting on you, new since your visit, participants, standpoints, search), tree focus view (breadcrumb, filters, search, up-navigation), context reply composer, terms (+13-entry sourced library), sync & backup, about/privacy, guide. Arabic + English, light + dark.
  - Integrity & privacy: every event signed (ECDSA P-256; id bound to key); content-addressed ids; debate id bound to creator; strict validation of incoming data; AES-256-GCM end-to-end encryption with the key only in the invite link; no analytics/trackers/third-party requests.
  - Sync: manual (update links without the key; encrypted `.txt` backup; paste box for iPhone) or encrypted relay mailbox (public Nostr relays, per-device keys).
  - Offline after first visit (generated service worker).
- **Trail:** `research/` (6 notes, synthesis, review, 217 sources) · `docs/org/` (7 department charters) · `docs/design/` (PRD, ARCHITECTURE, design review) · `docs/qa/` (security, QA, final reviews + resolution logs) · `docs/qc/TRACEABILITY.md` · `docs/DECISIONS.md` (D-001…D-017).
- **README** (ar/en) with demo GIF/MP4 recorded from the real app, screenshots, diagrams.

## How it was tested (evidence)
- **Unit (Vitest): 48 passing** — validity matrix; design-review fixtures D2–D10, D27; QA fixtures Q1–Q2; symmetry; determinism over 50 shuffled orders; crypto; security regressions (impersonation, id squatting, creator binding, malformed events, decompression cap); links; backup; IndexedDB; i18n parity and no-verdict wording.
- **End-to-end (Playwright, Pixel 7 profile, Arabic): 9 passing** — two-person core loop over manual links (0 requests to other hosts, 0 CSP violations, 0 console errors); symmetric counts; relay sync through two local mock relays (relays hold ciphertext only); offline read+write; 300-point signed debate on 4× CPU throttle (status ≈ 0.5 s, LCP ≈ 0.4 s, local server — machine-dependent); axe accessibility (light + dark, 0 serious/critical); identity transfer to a second device; forged invite refused.
- **CI on GitHub:** typecheck, unit, string/RTL checks, build, size budget (≈ 42 KiB JS gzip / 150 budget), e2e. Green on the latest commits (one earlier run hit a test race, fixed: `long-debate.spec.ts` now waits for navigation).
- **Independent reviews (fresh-context agents):** research synthesis (17 findings) · design (27) · security (12: 2 Critical) · hands-on QA (12: 1 Critical) · final review (8, no Critical). All resolved or explicitly accepted with reasons — see the resolution logs.

## Not done / known limits
- Site not live until Pages is switched on (above).
- Real-device checks (WhatsApp → iPhone, long links on WhatsApp) need a phone: `NEEDS-AHMAD.md` §2.
- Public relays: smoke-tested once (TECH-54); no retention guarantee — every device keeps the full debate; back up.
- Data on the device is not encrypted at rest; a sent invite link cannot be revoked yet (re-key is ROADMAP #1).
- Voice: text only; use the phone keyboard's dictation (no free, private in-browser Arabic speech-to-text exists today — `research/voice.md`).

## Next
ROADMAP in order: re-key / new link → relay anti-entropy → editable relays → deferred status → smaller manual updates with receipts.
