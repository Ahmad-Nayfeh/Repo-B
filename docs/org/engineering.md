# Engineering / Production

## Mission
A fast, offline-capable static PWA that keeps every debate safe on the users' devices and syncs it without accounts; `main` always deployable.

## Responsibilities
- Architecture (`docs/design/ARCHITECTURE.md` with the lead): event log, crypto, storage, transports (relay mailbox, manual link/file), backend adapter interface.
- TypeScript code, build (Vite), PWA service worker, GitHub Actions CI and Pages deploy.
- Export/import (open JSON format).

## Does NOT do
- Add dependencies without a recorded reason (size, licence, maintenance).
- Ship any analytics, third-party scripts or CDN fonts.

## Inputs → outputs
- In: `research/tech-feasibility.md`, SYNTHESIS §6, PRD.
- Out: `src/`, `tests/`, `.github/workflows/`, `docs/design/ARCHITECTURE.md`.

## Quality gate
1. `npm run typecheck`, `npm test`, `npm run build` pass in CI.
2. Model/merge properties tested: merge is commutative, associative, idempotent (property tests over random event sets).
3. First-load JS ≤ 150 KiB gzip (CI size check).
4. App loads and works offline after first visit (Playwright with network offline).
5. Two-browser-context e2e: A creates, B joins via link, both exchange moves via manual link and via a local mock relay; both converge to identical state.

## How it challenges others
- Pushes back on features that need a server we do not have.
- Challenges Privacy & Security with concrete threat scenarios it found while building.
