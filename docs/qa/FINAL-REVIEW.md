# Final independent review: Munazara (مناظرة)

**Reviewer:** independent final reviewer, starting with no prior context · **Date:** 2026-11-13 · **Commit reviewed:** `1ac2206`
**Method:** I built the site and served it with `vite preview` on :4176. Two Playwright contexts played Ahmad and Khalid at 390×844, locale ar-SA, both in manual sync mode, with sharing done through the clipboard fallback. They held a 15-move Arabic debate on «هل يستقلّ العقل بإثبات وجود الله؟». After that I tried edge cases, switched to English and dark mode, and served `dist/` under a `/Repo-B/` sub-path, as GitHub Pages would. I looked at every screenshot myself. I read the earlier reviews only after my own hands-on pass.

## Verdict: **ship, with the caveats listed below**

The core promise holds in real use. Every one of the 15 moves was attached to the point it answered, and «بانتظارك» showed the right person each time. The «عليك الرد» and «دورك» labels and the participant counts were symmetric and correct after every exchange. Silence closed nothing. Agree-to-disagree needed both people. The wording never names a winner. Arabic typography is good: IBM Plex Sans Arabic is self-hosted, the layout is RTL throughout, mixed Arabic and Latin text displays correctly, and there was no horizontal scroll at 390 px.

In manual mode the app made **0 requests to other hosts** and logged no console errors. The sub-path build loads its fonts and service worker, and its invite links include `/Repo-B/`.

None of my findings is Critical. One Important finding concerns the "who owes what" promise and is cheap to fix. One Important finding concerns the docs: they had gone stale because commits landed while this review was running.

## Findings

| ID | Severity | Evidence | Suggested fix |
|---|---|---|---|
| F1 | **Important** | **One card can hide several demands.** Khalid asked «ما دليلك؟» and then «ماذا تقصد؟» on Ahmad's claim. Ahmad's «بانتظارك (١)» showed a single card containing only the *first* question. Nothing said a second, different question was also waiting. The card is built in `Debate.tsx` `waitingItems()` from `first.text` only. The second question appeared only after tapping, in the focus view. Counting a point once is a deliberate anti-gish-gallop rule, but the card itself should not hide the content. Here it under-reports what Ahmad owes. | Keep counting per point. On the card, add «و{n} طلبات أخرى على النقطة نفسها», or list each demand's move label, for example «ما دليلك؟ · ماذا تقصد؟». |
| F2 | **Important** (docs) | **STATUS.md is stale.** Commits `76840a3` and `1ac2206` landed during this review. STATUS still says "deploy job fails with 'Ensure GitHub Pages has been enabled'", but the Pages workflow now *succeeds* without deploying and only emits a notice. STATUS also says "CI on GitHub: green (run 6 on commit 89b2496)", yet CI failed on `76840a3` and passed on `1ac2206`. The site URL returns 404, so it is not live, as the docs say. One more risk: a green "Deploy to GitHub Pages" run could make the owner think the site is live. | Update STATUS's "Not done" and CI lines. In NEEDS-AHMAD §1, add: "a green Deploy run does not mean the site is live until Pages is switched on; look for the notice". |
| F3 | Minor | **The Q5 fix only partly holds.** A concession, withdrawal or agree-to-disagree shows «على: …» (what it applies to) only when the stance has *no* text (`Debate.tsx:131` and `:314`). The composer offers a text box for these moves. In my run, Ahmad's proposal carried a comment, and Khalid's «جديد منذ زيارتك» showed «اتفاق على الاختلاف · يبدو أن خلافنا…» with no indication of which point it applied to. | Always show «على: …», and show the comment after it. |
| F4 | Minor | **Docs numbers are slightly off.** README and STATUS say first-load JS is "≈ 40 KiB gzip"; `npm run size` reports **42.2 KiB**. They give the 300-point performance as status 478 ms and LCP 440 ms; my run measured 630 ms and 552 ms. That is machine variance and still far inside budget. STATUS says "TRACEABILITY" without a path; the file is at `docs/qc/TRACEABILITY.md`. | Use "≈ 42 KiB". Add "(varies by machine)" to the performance figures. Give the path. |
| F5 | Minor | **Toast placement (Q12 fix only partly holds).** The «عناصر جديدة: n» toast does not block taps, but for 3.5 s it covers the first «بانتظارك» card, or the header of the focused card, which is exactly what the user needs to read after opening an update (shots 08, 12, 16). Re-opening the same link shows «عناصر جديدة: ٠». | Move the toast to the bottom safe area. Suppress it when n is 0, or use the wording «لا جديد في هذا الرابط». |
| F6 | Minor | **Ambiguous README wording.** README (Arabic) says «المناظرة على جهازك ومشفّرة طرفاً لطرف». This can be read as "encrypted on your device", but PRIVACY.md correctly says the data is unencrypted at rest. | «محفوظة على جهازك، وتنتقل مشفّرة طرفاً لطرف». |
| F7 | Minor | **Challenge colour.** Challenge move badges such as «ما دليلك؟» and «ماذا تقصد؟» use the same red as «عليك الرد». Asking for proof is a normal, legitimate move, and red suggests something went wrong. This is a small fairness signal. | Use a neutral or accent colour for challenge badges, and keep red for obligations. |
| F8 | Minor | **Update links grow with history.** Each update link carries the full history until it reaches 12,000 characters. Its length grew from 2.0 KB to 3.9 KB over 15 short moves. After that it switches to a 3-day delta, then to a file. Nothing confirms that the other person received an update. Points that have not arrived yet are counted as «عناصر لم تُعرض» (good), and a backup fixes any gap. This is acknowledged only indirectly, in NEEDS-AHMAD §2. | Add one line in ROADMAP (relay anti-entropy is listed; manual-mode receipts are not). |

## Hands-on observations (passed)
- **Who owes what:** after each of the 5 exchanges, the owe and move lists matched the tree on both phones. When a deep thread had an open demand, the claim chip said «قيد النقاش — بانتظار رد أحمد (أنت)». The «بانتظاري» filter also works in the tree.
- **Fairness:** the hint «أقبل هذا» on a root standpoint quotes that standpoint before you confirm. Agree-to-disagree is a proposal that passes the move to the other person, and closes only when both agree. «نقض بشاهد» is offered only on a reason (دليل), as the classical definition of naqd requires, and it refuses to send without a witness type («اختر نوع الشاهد للنقض.»). An empty or one-letter answer is refused. Status wording is neutral: «قَبِله الطرف الآخر», «لم يُعترض عليه بعد», «لم يعد قائماً».
- **Edge cases:** opening the same update twice is idempotent. A 5,000-character objection is stored and displayed fully in focus. Text mixing Arabic, Latin, numbers and parentheses displays correctly. English UI keeps Arabic names isolated, so «خالد (you)» displays correctly. Dark mode is legible.
- **Privacy:** the page has `noindex` and a strict meta CSP. Invite text contains no debate title. Manual mode made zero requests to other hosts.

## Earlier reviews: do their fixes hold?
Q1–Q4, Q6–Q11 and S1 (the forged invite, which has an e2e test) all hold in my run. **Q5 holds only partly (F3) and Q12 holds only partly (F5).**

## Honesty check
| Claim | Result |
|---|---|
| README image and link paths (icon, demo.gif/mp4, 6 screenshots, PRD, SYNTHESIS, org, DECISIONS, LICENSE) | All exist |
| "48 unit tests passing", "9 e2e passing" | Confirmed: 48/48, and 9 passed with 2 skipped. The 2 skipped are the screenshot and demo generators, not checks. |
| "Manual mode: 0 requests to other hosts" | Confirmed by the e2e test and by my own run |
| "No third-party fonts, scripts or trackers; noindex; strict CSP" | Confirmed in `index.html` and `dist/` |
| "Live site" | Not live (404), but the README flags it inline and NEEDS-AHMAD §1 explains how to switch it on |
| STATUS "deploy job fails" and "CI green run 6" | **Stale** (F2) |
| "≈ 40 KiB JS", performance figures | Slightly off (F4) |
| PRIVACY limits (unencrypted at rest, invite cannot be revoked, iOS 7-day eviction, relay metadata) | Honest and matches the code |

## Gap check against the goal
- **Voice:** the owner debates by WhatsApp voice notes today, and the app is text-only. ROADMAP §13 acknowledges this.
- **"Usable without setup by the owner":** this needs one click to switch on GitHub Pages. NEEDS-AHMAD acknowledges it.
- **"Two or more people":** this is supported. Three-participant rules are covered by unit tests only, with no e2e test. That is acceptable.

No unacknowledged gap is severe enough to block the release.

## Test results (run during this review, at commit `1ac2206`'s app code)
- `npx tsc --noEmit`: clean
- `npx vitest run`: **4 files, 48/48 passed**
- `npx playwright test --trace off`: **9 passed, 2 skipped** (media generators), in 11.5 s
- `npm run size`: first-load JS 42.2 KiB gzip; fonts 125.2 KiB

Scripts and screenshots are in the reviewer's scratchpad, not in the repo.
