# Organisation

Departments were chosen **after** Phase 1, from what the research showed this product needs (see `docs/DECISIONS.md` D-010).
Each department is a **gate**: its work is "done" only when its quality gate passes with evidence (test output, review file, measurement).
Departments run as subagents with their charter as instructions, or as explicit review passes by the lead. Work never grades itself: every gate's evidence is produced or checked by someone other than the author.

| Department | Charter | Core question it answers |
|---|---|---|
| Argumentation & Domain | `argumentation.md` | Is the debate model faithful to munazara and argumentation theory, and fair to both sides? |
| Product & UX | `product-ux.md` | Can two friends run a months-long debate on a phone without getting lost? |
| Arabic Language & Localisation | `arabic-l10n.md` | Is it genuinely Arabic-first (RTL, typography, wording), with good English? |
| Engineering | `engineering.md` | Does it work, offline, on mid-range phones, and stay deployable? |
| Privacy & Security | `privacy-security.md` | Does debate content stay private, and does the app say exactly where data goes? |
| QC (Quality Control & Testing) | `qc.md` | Do outputs match the specs? (tests, budgets, a11y, conformance) |
| QA (Quality Assurance) & Release | `qa-release.md` | Does the shipped product actually serve the goal in the brief? |

**Not created, with reasons:** separate R&D (Phase 1 is done; ongoing research is the Argumentation and Engineering departments' job); separate Visual Design (merged into Product & UX — one artefact, one owner); separate Testing (part of QC: testing *is* the conformance evidence); separate Release (merged with QA — release is the moment QA signs off).

**Escalation rule:** a department that finds a Critical problem in another's output blocks the merge until resolved. Disagreements are settled by the lead, recorded in `docs/DECISIONS.md`.
