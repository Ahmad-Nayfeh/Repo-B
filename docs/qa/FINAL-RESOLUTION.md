# Final review — resolution log

Review: `FINAL-REVIEW.md` — verdict *ship with caveats*, no Critical findings.

| ID | Severity | Resolution |
|---|---|---|
| F1 second question on the same point hidden | Important | Waiting card shows «وسؤال/اعتراض آخر على النقطة نفسها: n». |
| F2 STATUS stale; green deploy could read as "live" | Important | STATUS rewritten; NEEDS-AHMAD warns that a green run is not a live site; the CI failure was a test race, fixed. |
| F3 stance target hidden when a comment is added | Minor | Stances always show «على: …», plus the comment. |
| F4 numbers drifted / machine-dependent | Minor | README/STATUS: ≈ 42 KiB; speed figures labelled machine-dependent. |
| F5 toast covers first card; "0 new items" | Minor | Toast at the bottom, smaller, non-blocking; not shown for 0. |
| F6 Arabic README implied encryption at rest | Minor | Wording fixed in both languages. |
| F7 challenge badges look like errors | Minor | Neutral accent outline; red reserved for «عليك الرد». |
| F8 manual updates grow, no receipt | Minor | ROADMAP #5. |
