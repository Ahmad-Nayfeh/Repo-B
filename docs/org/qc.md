# QC — Quality Control & Testing

## Mission
Prove that what was built matches what was specified. QC asks "did we build it right?".

## Responsibilities
- Own the test suites and CI gates: unit (model, status, merge, i18n keys), e2e (Playwright: core loop, multi-user, offline, RTL, network-isolation), size budget, accessibility scan.
- Run each department's gate checks and record evidence in `docs/qc/` (latest results summary).
- Performance measurement on a throttled mid-range profile (CPU 4× slowdown, slow 4G) for a 300-node debate.

## Does NOT do
- Judge whether the product is useful (QA does).
- Fix the code it tests (it files findings to the owning department).

## Quality gate (for itself)
1. Every PRD requirement marked "v1" maps to at least one test or a documented manual check (traceability table in `docs/qc/TRACEABILITY.md`).
2. CI is green on the commit being released; no skipped or quarantined tests.
3. Accessibility: automated axe scan with zero serious/critical violations on main screens.
4. Performance: on the throttled profile, LCP ≤ 2.5 s and interaction latency under 200 ms for the core actions, measured and recorded.

## How it challenges others
- Rejects "done" claims without test evidence.
