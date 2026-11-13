# STATUS

> First file any session reads. Kept current at all times.

**Current phase:** Phase 5 — verify & release. Core product built; security and QA reviews resolved; final independent review next.
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
- Unit (Vitest, 48 tests, incl. security regressions S1–S7 and QA fixtures Q1–Q2): validity matrix, all review fixtures (D2–D10, D27), symmetry, determinism under 50 shuffles, crypto, impersonation rejection, links, backup, IndexedDB, i18n parity and no-verdict wording.
- E2E (Playwright, Pixel 7 profile, Arabic locale, 9 tests: + accessibility light/dark, identity transfer, forged-invite refusal): two-person core loop over manual links (no foreign requests, no CSP violations, no errors); symmetric counts; relay sync through 2 local mock relays (relays hold ciphertext only); offline read+write; 300-point debate on 4× CPU throttle: status 478 ms, LCP 440 ms, focus steps ≤ 126 ms (local server).
- Budgets: first-load JS 40 KiB gzip (budget 150); fonts 125 KiB (budget 200).
- CI on GitHub: green (run 6 on commit 89b2496).

## Not done / known problems
- **GitHub Pages is not enabled yet** → deploy job fails with "Ensure GitHub Pages has been enabled". One click by Ahmad: `docs/NEEDS-AHMAD.md` §1.
- Real-device checks (WhatsApp → iPhone, long links) not possible here: `NEEDS-AHMAD.md` §2.
- Public-relay behaviour is only smoke-tested (TECH-54); retention is not guaranteed.
- Independent security review (`docs/qa/SECURITY-REVIEW.md`): 2 Critical, 1 High, 4 Medium, 5 Low → resolved (`SECURITY-RESOLUTION.md`).
- Independent hands-on QA review (`docs/qa/QA-REVIEW.md`): 1 Critical, 4 Important, 7 Minor → resolved (`QA-RESOLUTION.md`).
- README (ar/en) with demo GIF/MP4, screenshots and diagrams; ROADMAP; PRIVACY; FORMAT; TRACEABILITY.

## Next
1. Final independent review of the built site against brief §1 (Phase 5 exit).
2. Then loop to ROADMAP items (re-key, relay anti-entropy, editable relays).
