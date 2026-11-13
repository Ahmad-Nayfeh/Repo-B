# QA review: hands-on, two-person test

Reviewer: independent QA pass with no prior context. I did not read docs/ or research/ before testing. I read the PRD afterwards only to check whether behaviour was intended.
Build tested: `npx vite build` of the working tree at test time (HEAD 3baa4f5 plus uncommitted changes that were present then). Served with `vite preview --port 4174`.
Method: Playwright Chromium. Two separate browser contexts ("أحمد" = A and "سامي" = B), Pixel 7 viewport (412px) and 390x844, locale ar-SA, deviceScaleFactor 1. Sync mode was **manual** (update links copied from the clipboard and opened in the other context). Scripts are in the session scratchpad (`qa/core.js`, `p2.js`, `p3.js`, `p4.js`).

## Verdict

**Mostly yes. Two friends could realistically start using it tonight**, and it is a large improvement over a WhatsApp voice-note thread. These parts work end to end on a phone with no console errors, no crashes and no horizontal overflow at 390px:
- creating a debate
- the invite
- joining
- 20+ varied moves in Arabic and English
- manual update links
- edit history
- undoing a stance
- English and dark mode

The "who owes what" model works well for simple chains. The "بانتظارك" list with «عليك الرد» / «دورك» chips is clear.

It **does not yet fully meet "always clear who owes what, counts never mislead"**:
- **The most consequential move, a concession, can be invisible.** If one side concedes the other's main claim, the claim stays «قيد النقاش» and the old obligations under it stay live (Q1).
- **The counters disagree with each other.** «عليك الرد: ١» is shown while four open demands sit on you (Q3).
- **A branch can stall with nobody's move.** After a refutation is answered and that answer is accepted, the original objection stays «أُجيب، والجواب محلّ نقاش» indefinitely (Q2).
- **The «جديد منذ زيارتك» feed is weak.** It never resets when you arrive through an update link, which is the main path in manual mode. Its concession and agree-to-disagree items say only «تسليم» / «تسليم», with no hint of what was conceded (Q4, Q5).

I saw no wording that delivers a verdict on who is right. The labels describe procedural state, not truth.

## Findings

| ID | Sev | Scenario | Observed (evidence) | Why it matters | Suggested fix |
|---|---|---|---|---|---|
| Q1 | **Critical** | 2/4: concession | **Steps:** after the 20-move exchange, B opens A's root claim and taps «أقبل هذा» then «تأكيد», then sends the update to A.<br>**What A sees:** the root stays «قيد النقاش» on both the status and tree tabs. The feed shows only «تسليم / تسليم · سامي». Participants still show B «عليه الرد ١ · دوره ١», including B's pending «دورك» on a clarification *under the claim he just accepted*.<br>**Shots:** `shots/60-A-after-B-conceded-root.png`, `shots/42-B-concede-composer.png`.<br>**Cause:** derive.ts assertion status is `under_discussion` whenever any child challenge is open/answered/challenged, including the conceder's own earlier challenges (PRD D4). | The decisive event of a debate is hidden, and the old obligations keep nagging both people. This fails "clear and complete". | Once X concedes N, mark X's own live challenges under N as moot/closed, or show «قبله سامي» next to «قيد النقاش». Make the concession prominent in the feed and on the status page. |
| Q2 | Important | 2: obligations | **Chain:** B objects «مقدمة العالم حادث» → A answers («التسلسل…») → B refutes with a witness → A answers the refutation → B «أقبل الجواب».<br>**Result:** the objection shows «أُجيب، والجواب محلّ نقاش» indefinitely. Nobody has it in «بانتظارك», and the counts list it under «أُجيب». The refutation still counts as a live "reaction" (derive.ts `reaction` lookup), so B never gets «دورك» to accept or continue on the objection. | The branch stalls silently and nobody is prompted. This contradicts "always clear who owes a reply". | When every reaction challenge on the latest answer is closed (accepted/conceded/moot/agreed), return the parent challenge to "answered — X's move". |
| Q3 | Important | 2: counters/gaming | **Spam:** B posts «ما دليلك؟» 4 times on A's root. A then sees «بانتظارك (١)», «عليك الرد: ١», but the counts row says «نقاط مفتوحة ٥» (`shots/50-A-after-spam.png`). Obligations are grouped per target, so the counts contradict each other.<br>**Trivial answer:** A answers one demand with the text "." and it is accepted as an answer; the obligation flips to B («دوره» 1→3).<br>**Other counters:** "مفتوح تحتها" in the tree counts answered items as open, while the status row separates open and answered. | Counters mislead. Either side can flip the burden with an empty "answer", and repeated identical demands carry no warning. | Show the real number of demands (or "1 point, 4 demands"). Require a minimum substantive length (for example 3 or more letters, not just punctuation) for answers. Warn on a duplicate «ما دليلك؟» by the same person on the same target. Use one definition of "open" everywhere. |
| Q4 | Important | 2: «جديد منذ زيارتك» | In manual mode, opening an update link never advances "last seen". The list keeps showing old items such as «سامي · منذ ١ دقيقة» across every exchange, up to the 6-item cap (`shots/s19-B-status.png`).<br>**Cause:** `acceptUpdatePayload → ingest → reload` sets `current`, so `openDebate` skips `markSeen` (service.ts). | "New" stops meaning new on the main manual path. Over months this section becomes noise. | Mark seen after a link import too. Compare the local *received* time of each event, not the author's timestamp. |
| Q5 | Important | 2/4: feed context | In the feed, a concession, withdrawal or agree-to-disagree appears as label plus label: «تسليم / تسليم», «سحب / سحب», «اتفاق على الاختلاف» twice. It never says *what* was conceded or withdrawn (`shots/46-A-sees-concede-undo.png`, `shots/70-en-status.png`). | The receiver cannot tell whether a minor definition or the whole standpoint was accepted. | Render the item as «سامي سلّم بـ: ‹excerpt of target›», and do the same for withdrawals and agree-to-disagree. |
| Q6 | Minor | 1: join in manual mode | After B joins in manual mode, he lands on the status page with no prompt to send an update. A has no idea B joined until B's first move travels (`shots/11-B-after-join.png`). | Cold-start friction. B might wait for A while A waits for B. | After joining in manual mode, show the «أرسل تحديثاً» bar ("let him know you joined"). |
| Q7 | Minor | 3: tree root | At the top level the two root claims sit under the group heading «أجوبة» ("Answers") (`shots/30-A-tree-root.png`, `shots/80-dark-tree.png`). | Wrong label on the first tree screen. | Use «الدعاوى» or no heading for roots (`groupOf` with no focus). |
| Q8 | Minor | 5: English mode bidi | Mixed Arabic names inside English strings break apart: «1 · سامي min ago», «(you) أحمد», «:(you)», «waiting for سامي's reply» (`shots/70-en-status.png`). Arabic paragraphs ending in English show «.proof» at the wrong end in both locales. | Garbled metadata in English mode. Users will mix scripts often. | Wrap names in `<bdi>`. Use `unicode-bidi: plaintext` on user text paragraphs. |
| Q9 | Minor | 3: navigation | Closed sub-branches collapse into «نقاط مغلقة: ١», so a path to a deep node is hidden until you expand it. The top-bar back arrow in a deep node goes to Home, not up one level. Search exists only at the bottom of the status tab, not in the tree tab. Breadcrumb, browser back and search-to-focus all work, and depth 7 was reachable (`shots/40-nav-deep.png`, `shots/31-A-deep-focus.png`). | Finding your way is workable but takes extra taps. | Add a search entry on the tree tab, and make the top-bar back go up one level inside the tree. |
| Q10 | Minor | 2: accidental concede | «أقبل هذا» is the second chip, right next to the default «أعترض», on the opponent's *root standpoint*. One tap followed by «تأكيد» concedes the whole standpoint, with no extra wording such as "you accept his whole claim" (`shots/42-B-concede-composer.png`). Undo via «أتراجع عن موقفي هذا» works, and the undone concession stays in history. | Easy to mis-tap on mobile. Recoverable, but the other side already saw it. | Add a confirm sentence quoting the target when conceding a root or standpoint. |
| Q11 | Minor | 2: wording | A brand-new claim nobody has looked at yet shows «لا اعتراض عليه» ("no objection to it"). | It could read as "uncontested, so it stands". | «لم يُعترض عليه بعد». |
| Q12 | Minor | UI | The toast («نُسخ», «عناصر جديدة») covers content, including the «أضف دعوى» button, for a few seconds (`shots/30-A-tree-root.png`). | Cosmetic. | Place the toast above the bottom safe area, or use a smaller toast. |

Checked and fine (no finding):
- **Repeated update link:** opening the same link twice gives «عناصر جديدة: ٠», with no duplicates.
- **Update link without the debate:** it shows a clear «هذا التحديث لمناظرة غير موجودة على هذا الجهاز. افتح رابط الدعوة أولاً.» (`shots/49-C-update-unknown.png`).
- **Update link size:** it grows about 150 characters per long move, reaching about 10.8k characters after 60 long moves against a 12k limit, so it lasts weeks before the file fallback kicks in.
- **Console:** no errors or warnings across all runs.
- **Layout:** no horizontal overflow on any page at 390px.

## What works well

- **Cold invite:** the join screen explains in one screen what this is. It names the friend, shows his claim, warns about private or WhatsApp in-app browsers, and offers a read-only option (`shots/10-B-invite-cold-fold.png`).
- **Composer:** it offers context-appropriate moves. The default is «أعترض» or «أجيب بدليل», and the labels follow the discipline: «نقض بشاهد» with a typed witness (تخلّف / استلزام المحال), معارضة, «أجبتُ عنه هنا ←», and agree-to-disagree as a proposal plus acceptance (`shots/20-composer-refute.png`).
- **«بانتظارك»:** red «عليك الرد» and blue «دورك» chips with excerpts, worked out correctly through 20 moves for both people (`shots/s19-B-status.png`).
- **Editing after a reply:** this is transparent («عُدّل بعد الرد», «النسخ السابقة (١)»; `shots/47-B-sees-edit.png`).
- **Terms tab:** an accepted definition shows as «متفق عليه» (`shots/61-terms.png`).
- **English mode:** no untranslated UI strings, and `dir` switches to ltr. Dark mode is coherent with good contrast (`shots/80-dark-*.png`, `shots/81-dark-composer.png`).
- **Neutral language:** the states are procedural («قيد النقاش», «قَبِله الطرف الآخر», «سلّم به صاحب النقطة», «اتفقا على الاختلاف»), and I saw nothing that scores or declares a winner.

## Screenshots (docs/qa/shots/)

01-home, 02-new, 10-B-invite-cold-fold, 11-B-after-join, 20-composer-refute, s19-B-status, 30-A-tree-root, 31-A-deep-focus, 40-nav-deep, 42-B-concede-composer, 46-A-sees-concede-undo, 47-B-sees-edit, 49-C-update-unknown, 50-A-after-spam, 60-A-after-B-conceded-root, 61-terms, 70-en-status, 71-en-focus, 80-dark-tree, 81-dark-composer.

Not tested: relay (Nostr) sync, debates with 3 or more people, iOS Safari, file backup import.
