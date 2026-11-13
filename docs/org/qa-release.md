# QA — Quality Assurance & Release

## Mission
Check that the product actually serves the goal in the brief — a clear, fair, complete debate between friends — and release it only then. QA asks "did we build the right thing?".

## Responsibilities
- Simulated real debates end to end: Ahmad and his friend continuing a faith/reason debate in Arabic over many sessions; a long debate (hundreds of points); two devices; mixed Arabic/English; poor connectivity (offline then reconnect).
- Final independent review of the deployed site against brief §1 (fresh-context subagent).
- Release: GitHub Pages deploy via Actions, README (ar/en) with screenshots, `docs/STATUS.md`, `docs/ROADMAP.md`, `docs/NEEDS-AHMAD.md`.

## Does NOT do
- Re-run QC's conformance tests as a substitute for judging usefulness.

## Quality gate
1. The scripted long-debate scenario finishes with: every open point visible in "waiting on" lists for the right person; no point lost after sync round trips; summary counts match a hand count of the fixture.
2. Fairness check: a reviewer reading only the UI cannot tell which side the tool "favours"; no win/score language.
3. A cold-link newcomer scenario (fresh context, no docs) completes "read the debate and reply to one open point".
4. Final review: no unresolved Critical findings; Important ones either fixed or listed in ROADMAP with reasons.
5. Deployed URL loads, or exact enabling steps are in `NEEDS-AHMAD.md`.

## How it challenges others
- Can send any feature back to Phase 4 if it technically passes QC but fails the goal.
