# STATUS

> First file any session reads. Kept current at all times.

**Current phase:** Phase 4 — build. Core loop done and tested; next: QC/QA department passes, then Phase 5.
**Last updated:** 2026-11-13

## What exists
- Research (Phase 1, passed independent review): `research/` — 6 topic notes, `SYNTHESIS.md`, `REVIEW-synthesis.md`, `SOURCES.md` (217 sources).
- Organisation (Phase 2): `docs/org/` — 7 department charters with measurable gates.
- Design (Phase 3, passed independent review): `docs/design/PRD.md` v1.1, `ARCHITECTURE.md` v1.1, `REVIEW-design.md`.
- App (Phase 4): TypeScript + Preact static PWA in `src/`.
  - Model: munazara move set, single validity matrix, computed statuses and **symmetric** obligations (owes / your move), dead/moot rules.
  - Every event signed (ECDSA P-256, personId bound to key hash); E2E encryption (AES-GCM, key only in link fragment).
  - Manual sync (update links without key, encrypted `.txt` backup, paste box); relay mailbox sync (Nostr, lazy-loaded, per-device keys).
  - Screens: home, new debate, join, status (waiting on you / new since / participants / standpoints / search), tree focus view with breadcrumb and filters, context reply composer, terms (debate definitions + 13-entry sourced library), sync & backup, about/privacy, guide. Arabic default, English available.
  - Offline via generated service worker.

## Tested (evidence)
- Unit (Vitest, 41 tests): validity matrix, all review fixtures (D2–D10, D27), symmetry, determinism under 50 shuffles, crypto, impersonation rejection, links, backup, IndexedDB, i18n parity and no-verdict wording.
- E2E (Playwright, Pixel 7 profile, Arabic locale, 5 tests): two-person core loop over manual links (no foreign requests, no CSP violations, no errors); symmetric counts; relay sync through 2 local mock relays (relays hold ciphertext only); offline read+write; 300-point debate on 4× CPU throttle: status 478 ms, LCP 440 ms, focus steps ≤ 126 ms (local server).
- Budgets: first-load JS 40 KiB gzip (budget 150); fonts 125 KiB (budget 200).
- CI on GitHub: green (run 6 on commit 89b2496).

## Not done / known problems
- **GitHub Pages is not enabled yet** → deploy job fails with "Ensure GitHub Pages has been enabled". One click by Ahmad: `docs/NEEDS-AHMAD.md` §1.
- Real-device checks (WhatsApp → iPhone, long links) not possible here: `NEEDS-AHMAD.md` §2.
- Public-relay behaviour is only smoke-tested (TECH-54); retention is not guaranteed.
- Not yet run: accessibility scan, independent QA/final review, README with screenshots, ROADMAP.

## Next
1. QC pass: accessibility scan (axe), traceability table, CSP check in all tests.
2. QA pass: independent fresh-context review of the running app against brief §1.
3. Docs: README (ar/en) with screenshots, ROADMAP, PRIVACY, FORMAT.
