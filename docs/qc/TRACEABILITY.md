# Requirements → evidence (QC gate)

Every PRD §10 "must" and "should" item, mapped to the test or manual check that proves it. `U:` = unit test (`tests/unit/`), `E:` = end-to-end (`tests/e2e/`), `M:` = manual / scripted check.

| ID | Requirement (PRD) | Evidence | Status |
|---|---|---|---|
| R1 | Create debate with title, name, standpoint | E: core-loop `createDebate` | ✅ |
| R2 | Invite link; secret only in fragment; URL rewritten after open | E: core-loop (regex on link; `#/j/` gone after join) | ✅ |
| R3 | Join cold with name and optional own standpoint | E: core-loop `join` | ✅ |
| R4 | Everyday moves: claim, reason, clarify_q, ask_proof, object, clarify, concede, withdraw, note | U: rules.test, derive.test; E: core-loop (ask_proof, reason, concede) | ✅ |
| R5 | Status + obligation engine incl. review fixtures D2–D10, D27 | U: derive.test "review fixtures" (13 cases) | ✅ |
| R6 | Symmetric obligations (owes / your move for both) | U: "mirror-image moves"; E: core-loop test 2 (counts for both people) | ✅ |
| R7 | Ten challenges on one point count once (anti-spam) | U: "D5" | ✅ |
| R8 | Deterministic state regardless of arrival order | U: "determinism" (50 shuffles) | ✅ |
| R9 | Every event signed; impersonation rejected | U: crypto.test "verifyBatch rejects impersonation" | ✅ |
| R10 | Focus view, breadcrumb, filters, closed threads collapsed | E: long-debate (deep navigation), screenshots | ✅ |
| R11 | Status tab: waiting on you, new since, participants, standpoints, search | E: core-loop, long-debate (counts = model) | ✅ |
| R12 | Context reply flow with default move | E: core-loop (asserts «أجيب بدليل» pre-selected) | ✅ |
| R13 | «أبلغه» nudge without secret | M: code (`PostedBar` shares text only) | ✅ (manual) |
| R14 | Manual sync: update link without key; paste box; file fallback | E: core-loop (`#/u/`, no key in URL); U: links | ✅ |
| R15 | Encrypted backup + import | U: crypto.test "backup text round-trips" | ✅ (import UI: manual) |
| R16 | ar/en, identical keys, no hard-coded strings, logical CSS | U: i18n.test; CI `check:strings` | ✅ |
| R17 | Offline after first visit | E: offline.spec | ✅ |
| R18 | Relay mailbox (encrypted; per-device keys) | E: relay-sync.spec (mock relays: ciphertext only, ≥2 pubkeys) | ✅ |
| R19 | Moves counter, refute (witness), ask_source/source, see_also, obvious, define, agree_disagree | U: derive.test (counter, refute, agree_disagree), rules.test | ✅ (UI: QA pass) |
| R20 | Terms tab + sourced library | M: screenshots; library entries cite SOURCES IDs | ✅ (manual) |
| R21 | Identity transfer link | U: links (format); M: flow | ⚠️ e2e pending |
| R22 | Hide titles; plain JSON export behind warning | M: code + UI | ✅ (manual) |
| R23 | No foreign requests in manual mode; CSP no violations | E: core-loop (foreign = [], CSP = []) | ✅ |
| R24 | Accessibility: no serious/critical axe violations | E: a11y.spec (light + dark) | ✅ |
| R25 | 300-point debate responsive on throttled phone | E: long-debate (status 478 ms, LCP 440 ms, steps ≤ 126 ms) | ✅ |
| R26 | Budgets: JS ≤ 150 KiB gzip, fonts ≤ 200 KB | CI `size` (40 KiB / 125 KiB) | ✅ |
| R27 | No verdict wording in statuses | U: i18n.test "no verdict language" | ✅ |

Open: R21 needs an end-to-end test; real-device checks in `docs/NEEDS-AHMAD.md` §2.
