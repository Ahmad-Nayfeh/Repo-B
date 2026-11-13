# QA review — resolution log

Review: `QA-REVIEW.md` (independent, hands-on, two simulated people, 20+ moves, ar/en, dark mode). Each finding was re-checked against the model before fixing.

| ID | Severity | Resolution | Evidence |
|---|---|---|---|
| Q1 concession on a claim did not show | Critical | **Fixed.** A challenger's own challenges on a node lapse (moot) once they concede that node later; a later challenge still counts (D4). | unit "Q1" |
| Q2 branch stalled with nobody's move | Important | **Fixed.** Challenge states are recursive: if every challenge on the answer is closed without killing it, the move returns to the challenger; an agreed-to-disagree sub-challenge closes the parent. | unit "Q2" ×2 |
| Q3 counters disagree / gameable | Important | **Fixed.** Counts row labelled as questions & objections (per challenge) vs «عليك الرد» (per point); answers need ≥ 2 letters/digits; «قيد النقاش تحتها» replaces «مفتوح تحتها». | `rules.ts`, i18n |
| Q4 "new since" never reset via update link | Important | **Fixed.** Opening a debate always marks it seen. | `service.ts openDebate` |
| Q5 stance items lacked their target | Important | **Fixed.** Concessions, withdrawals and proposals show «على: …». | `Debate.tsx` |
| Q6 no prompt after joining (manual) | Minor | **Fixed.** Post-join bar «أخبِر صاحبك أنك انضممت». | `Join.tsx`, `Debate.tsx` |
| Q7 root claims under «أجوبة» | Minor | **Fixed.** Claims grouped under «دعاوى وأدلة وتعريفات». | `logic.ts` |
| Q8 names garble mixed-direction text | Minor | **Fixed.** Names wrapped in Unicode first-strong isolates; user paragraphs use `unicode-bidi: plaintext`. | `logic.ts`, CSS |
| Q9 navigation | Minor | **Fixed.** Search on the tree tab; top-bar back goes up one level inside the tree. | `Debate.tsx` |
| Q10 one-tap concession of a whole standpoint | Minor | **Fixed.** Explicit sentence quoting the standpoint before confirming. | `Composer.tsx` |
| Q11 «لا اعتراض عليه» reads as verdict | Minor | **Fixed.** «لم يُعترض عليه بعد». | i18n |
| Q12 toast covers content | Minor | **Fixed.** Toast moved below the tabs, non-blocking. | CSS |

Not covered by the QA pass (recorded honestly): real public-relay sync, 3+ people hands-on, iOS Safari, backup import UI. Relay sync and 3-person rules are covered by automated tests (mock relays; unit fixtures); iOS needs a real device (`NEEDS-AHMAD.md` §2).
