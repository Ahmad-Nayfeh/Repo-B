# PRD — مناظرة (Munāẓara): a structured debate site

Status: v1 design, Phase 3. Owner departments: Product & UX + Argumentation & Domain (with the lead).
Evidence base: `research/SYNTHESIS.md` (cited as SYN §n). Decisions: `docs/DECISIONS.md`.

---

## 1. Goal and non-goals

**Goal.** Two or more people who already know each other hold a long, asynchronous debate that stays **clear** (structure and terms visible), **fair** (the tool never judges, obligations are symmetric) and **complete** (no point silently lost; always clear who owes what).

**Non-goals (v1).** Public debates, discovery, voting or scores, moderation tools for strangers, classrooms, voice recording, AI features, accounts.

## 2. User scenarios

### S1 — Ahmad and Khalid continue a months-long debate (primary)
Ahmad and his old roommate (call him Khalid) have argued for months on WhatsApp voice notes about whether reason alone can establish God's existence.
1. Ahmad opens the site on his phone, taps **«مناظرة جديدة»**, writes the title («هل يستقلّ العقل بإثبات وجود الله؟») and **his standpoint** as a claim («العقل يستقلّ بإثبات وجود الصانع»). He enters his display name.
2. He chooses the sync mode (SYN §6): **«مزامنة مشفّرة عبر خوادم عامة»** or **«يدوي فقط»**. The screen says in one sentence what each sends where.
3. He taps **«مشاركة الرابط»**; the phone's share sheet opens; he sends the link to Khalid on WhatsApp.
4. Khalid opens the link. He sees the title, Ahmad's standpoint, and a short sentence explaining the page. He enters his name and is invited to **state his own standpoint** (or choose «أنا مُستشكِل فقط — لا أتبنّى دعوى مقابلة», "I am only questioning").
5. Khalid taps Ahmad's claim and chooses **«ما دليلك؟»** (ask for proof). Ahmad's header now shows **«عليك الرد: ١»**.
6. Days later Ahmad opens the app from his home screen. The top of the debate shows: **«عليك الرد في نقطة واحدة · ينتظر خالد: ٠»**. He taps it, lands on Khalid's challenge, and replies with **«دليلي»** (a reason). Khalid's header now shows **«دورك: ١»** (your move): accept, challenge further, or close.
7. Over weeks the tree grows to hundreds of points. Each opens the app to their **«بانتظاري»** (waiting on me) list, not to the whole tree.
8. They disagree on what «العقل» means. Khalid taps **«عرّف المصطلح»** and adds a definition; Ahmad marks it **«أوافق على التعريف»** or objects («غير جامع»). Every later occurrence of «العقل» in the debate is underlined and opens the agreed definition.
9. A sub-branch bottoms out in different first principles. Both mark it **«نتفق على أننا مختلفون هنا»** (agreed to disagree). It closes and leaves the open counts.

### S2 — Cold link recipient (onboarding)
Someone receives a link with no context. Within one screen they must understand: what this is (a debate between X and Y about Z), what is waiting for them, and how to reply. No tutorial carousel (SYN §5). First reply asks only for a name.

### S3 — Same person, second device
Ahmad opens the same link on his laptop. The app asks «من أنت في هذه المناظرة؟» and lists existing participants plus «مشارك جديد». He picks himself. (v1 identity is self-declared; see ARCHITECTURE §7.)

### S4 — Three participants
A third friend joins. Obligations stay per author: a challenge is owed by the author of its target; "your move" goes to the author of an answered challenge. Nothing in the model assumes exactly two people.

### S5 — No relays (manual mode or relays down)
Ahmad taps **«أرسل تحديثاً»** (send update). The app produces a link (or a file if large) containing what Khalid may not have. Khalid opens it; the app merges and shows "3 new points".

### S6 — Backup and ownership
Either participant can export the whole debate as a JSON file and as a readable Markdown outline, and import a JSON file to restore or merge.

## 3. The debate model

### 3.1 Concepts
- **Debate**: title, created time, participants, a set of nodes, glossary, settings.
- **Participant**: `personId` (random), display name. Has a colour from a fixed palette (decoration only).
- **Node**: one move by one author. Fields: `id`, `parentId` (null only for root standpoints), `authorId`, `move`, `text`, optional `meta` (e.g. witness type, counter-proof form, fallacy question tag, qualifier), `createdAt`.
- **Everything is a reply tree.** A node's parent is exactly what it replies to (SYN §1.1). Statuses and obligations are **computed** from the tree; they are never stored.
- Author may **edit** their node's text and **re-type** its move (post first, classify later — D-008). Edits keep history.

### 3.2 Move catalogue

Two tiers (D-008). Every move carries its classical name for the "learn more" sheet. **Assertions** put a proposition on the table; **challenges** create a burden on the target's author; **answers** discharge a burden; **stances** record a participant's commitment.

| Move id | Tier | Arabic label (button) | English | Class | Classical basis |
|---|---|---|---|---|---|
| `claim` | everyday | دعوى | Claim / standpoint | assertion | الدعوى; المعلِّل is its author [MUN §1] |
| `reason` | everyday | دليل | Reason / proof | assertion + answer | الدليل / التعليل [MUN §1] |
| `clarify_q` | everyday | ماذا تقصد؟ | What do you mean? | challenge | الاستفسار [MUN §2.2] |
| `ask_proof` | everyday | ما دليلك؟ | What is your proof? | challenge | المنع المجرد / طلب الدليل [MUN §2.3] |
| `object` | everyday | أعترض | I object (with a reason) | challenge | المنع مع السند (on a claim/premise) [MUN §2.3] |
| `clarify` | everyday | أوضّح مقصدي | I clarify what I meant | answer | تحرير المراد [MUN §3.1] |
| `concede` | everyday | أُسلّم | I concede / accept | stance | التسليم [MUN §3.2] |
| `withdraw` | everyday | أسحب كلامي | I withdraw my claim | stance | retraction [ARG §6] |
| `refute` | more | نقض | Refutation (with a witness) | challenge | النقض الإجمالي — requires `meta.witness` = `counterexample` (تخلّف) or `impossibility` (استلزام المحال) [MUN §2.4] |
| `counter` | more | معارضة | Counter-argument | assertion + challenge | المعارضة; its author becomes the claimant of the counter-claim (roles swap) [MUN §2.5] |
| `ask_source` | more | وثّق النقل | Show the source | challenge | طلب تصحيح النقل [MUN §2.7] |
| `source` | more | المصدر | Source given | answer | تصحيح النقل |
| `define` | more | تعريف | Definition of a term | assertion | التعريف [MUN §5] — also creates a glossary entry |
| `grant_arg` | more | أُسلّم جدلاً | I grant it for argument's sake | stance | التنزّل [MUN §3.2] |
| `granted_irrelevant` | more | مُسلَّم لكنه لا يلزم | Granted, but it doesn't follow | answer | القول بالموجب [MUN §3.2] |
| `agree_disagree` | more | نتفق على الاختلاف هنا | Agree to disagree here | stance | design adaptation (non-classical) [MUN §7.1] |
| `note` | more | ملاحظة | Note / quick question (no obligation) | neutral | Point-of-information analogue [ARG §7] |

Everyday menu has **at most 4 buttons visible at once** (chosen by context, below) plus «المزيد».

### 3.3 Who may make which move (validation table)

Let **T** be the target node, **A** = author of T, **O** = any other participant.

| Target T | O (others) may | A (author) may |
|---|---|---|
| `claim`, `counter` | ask_proof, clarify_q, object, ask_source*, counter, concede, grant_arg, note, define | reason, clarify, withdraw, note, define |
| `reason` | object, refute, ask_proof (for a premise), clarify_q, concede, grant_arg, note | reason (add more), clarify, withdraw, note |
| `clarify_q`, `ask_proof`, `object`, `refute`, `ask_source` (challenges) | (others than A and author-of-target: note) | — |
| challenge **C** on a node by **X**; the target's author **Y** answers under C | Y may: reason, clarify, source, granted_irrelevant, concede (= Y accepts the challenge), note | X (challenge author) may: withdraw (drop the challenge), note |
| `reason`/`clarify`/`source`/`granted_irrelevant` that answers C (author Y) | X may: concede (accept the answer), object / refute / ask_proof / clarify_q (challenge the answer), agree_disagree | Y: as for any reason |
| `define` | O: concede (agree), object (with type `not_inclusive` غير جامع / `not_exclusive` غير مانع / `circular` دور / `less_clear` أخفى) | clarify, withdraw |
| any node | either party may add `agree_disagree` on a challenge thread | |

\* `ask_source` is only offered when T has `meta.origin = 'citation'`. A citation the author **endorses** (`origin = 'citation_endorsed'`) is a claim and all moves apply (SYN §3, F13).

**Anti-ghaṣb reframing (soft).** If O chooses `counter` against a `claim` that has no `reason` yet, the app shows: «لم يقدّم صاحب الدعوى دليلاً بعد. الأنسب: اطلب الدليل، أو اعترض مع ذكر سببك، أو اطرح دعواك المقابلة كدعوى مستقلة.» with three buttons. The user may still proceed (D-003 adaptation). [MUN §2.6]

**Refutation needs a witness.** `refute` requires choosing a witness type and the text should state it. [MUN §2.4]

### 3.4 Status rules (computed)

**Challenge node C** (moves `clarify_q`, `ask_proof`, `object`, `refute`, `ask_source`, and `counter` as a challenge to its parent), author X, target T with author Y:

| State | Condition | Shown as | Obligation |
|---|---|---|---|
| **open** | no answer by Y under C; C not withdrawn; no concede by Y; not closed | «بانتظار رد Y» | **Y owes a reply** |
| **answered** | Y added an answer (reason/clarify/source/granted_irrelevant) under C, and X has not reacted to the latest answer | «أُجيب — دور X» | **X: your move** (accept, challenge the answer, or agree to disagree) |
| **challenged again** | X challenged Y's answer | (the new challenge is open) | Y owes on the new challenge |
| **accepted** | X conceded Y's answer (or used grant_arg) | «قُبل الجواب» | none |
| **conceded** | Y conceded under C | «سلّم Y بالاعتراض» | none; T is shown as *conceded by its author* |
| **withdrawn** | X withdrew C | «سُحب الاعتراض» | none |
| **agreed to disagree** | both X and Y added agree_disagree in C's thread | «اتفقا على الاختلاف» | none |

**Assertion node N** (claim, reason, counter, define), author A:
- **withdrawn** — A added `withdraw` → struck-through, «سحبه صاحبه».
- **conceded by author** — A conceded a challenge against N → «سلّم صاحبه بالاعتراض».
- **accepted by others** — every other participant conceded N (or granted it for argument: «مُسلَّم جدلاً») → «مُسلَّم».
- **under challenge** — has ≥ 1 open challenge → «عليه اعتراض مفتوح».
- **unsupported** — a `claim` with an `ask_proof` but no `reason` yet (subset of under challenge).
- **standing** — none of the above → «قائم» (means only "no open challenge", not "true").

**Precedence** when several apply: withdrawn > conceded by author > accepted > under challenge > standing.

**Nothing auto-closes with time.** An open challenge stays open; the UI shows its age («منذ ٥ أيام») (SYN §4). Silence is never a concession.

### 3.5 Obligations — symmetric (D-006)
For each participant P:
- **«عليك الرد» (you owe)** = open challenges whose target author is P.
- **«دورك» (your move)** = answered challenges whose author is P and which P has not reacted to.
- Both numbers are shown for **every** participant in the debate header, side by side, same visual weight. Example: «أحمد: عليه ٢ · دوره ١ — خالد: عليه ١ · دوره ٠».
- "Your move" is an invitation, not a debt: its colour and wording are softer than "you owe", but it is always visible.

### 3.6 Commitments (per participant)
Computed list, viewable per person (SYN §1.3):
- **Claims**: their claim/reason/counter nodes not withdrawn.
- **Concessions**: nodes of others they conceded (incl. «جدلاً» marked separately).
- **Withdrawn**: their withdrawn nodes (struck through).
- **Shared ground (المسلّمات)**: propositions conceded by all participants, plus agreed definitions.

## 4. How munazara maps onto the model

| Munazara | Model |
|---|---|
| المعلِّل / السائل | Per node: the node's author is its claimant; anyone else is its questioner. Both people hold both roles on different branches (MUN §1). |
| Opening: تحرير المصطلحات، تحديد الدعوى | Debate creation asks for each person's standpoint; `define` + glossary. |
| الاستفسار | `clarify_q` |
| المنع (مجرد / مع السند) | `ask_proof` / `object` |
| النقض (بشاهد) | `refute` with required witness |
| المعارضة (قلب/مثل/غير) | `counter` with optional `meta.form` |
| النقل وطلب تصحيحه | `meta.origin`, `ask_source`, `source` |
| أجوبة المعلل | `reason`, `clarify`, `source`, `granted_irrelevant`, `concede` |
| التنزّل | `grant_arg` |
| الإلزام | Branch where the claimant's reasons are all accepted/shared ground and nothing is open → shown softly as «لم يبقَ اعتراض» (no objection remains). Never labelled with the classical term in the main UI. |
| الإفحام | An open challenge simply stays «بانتظار رد» with its age. The classical term is **not** used in the UI (it reads as a verdict). |
| الغصب | Soft reframing prompt (§3.3). |
| المكابرة | Not detected or labelled by the app (it would be a judgement). The fair-play charter mentions it. |
| الآداب | Fair-play charter on the debate's info sheet; mechanics: clarify-before-reply is the first everyday button; no scores. |

## 5. Screens

1. **Home («مناظراتي»)** — list of debates stored on this device, each with: title, participants, «عليك ٢ · دورك ١», last activity. Button «مناظرة جديدة». Link to «عن الموقع والخصوصية».
2. **New debate** — title, my name, my standpoint (claim), optional opening note; sync mode choice; create → share sheet.
3. **Join (first open of a link)** — debate title, participants, standpoints, one-line explanation, name field (or pick existing participant), «أضف دعواك المقابلة (اختياري)».
4. **Debate — Summary tab («الحالة»)** (default landing view):
   - obligations per participant (symmetric);
   - «بانتظارك» list (open challenges you owe + your moves), oldest first;
   - counts: open / answered / accepted / conceded / withdrawn / agreed-to-disagree;
   - recently changed (since your last visit);
   - terms: agreed / disputed definitions;
   - standpoints of each participant.
5. **Debate — Tree tab («الشجرة»)** — focus view: the focused node card, its parent as one row above (tap to go up), its children grouped by class (أدلة / اعتراضات وأسئلة / أجوبة / مواقف). Each child card shows move label, author, status chip (icon + text + colour), first lines of text, and count of open items beneath it. Filters: «المفتوح فقط», «بانتظاري», «الكل». Resolved threads collapsed.
6. **Node actions** — bottom sheet with ≤ 4 context-relevant everyday buttons + «المزيد». Compose sheet: text area (`dir="auto"`), optional citation toggle, witness picker for refute.
7. **Glossary tab («المصطلحات»)** — debate terms (agreed / disputed) + built-in library of named concepts and fallacies (bilingual), each with definition and source. Tapping an underlined term anywhere opens its bottom sheet.
8. **Participant sheet** — commitments of that participant (§3.6).
9. **Sync & backup sheet** — mode, relay health per relay, «أرسل تحديثاً», export JSON / Markdown, import, last backup time, install-to-home-screen hint.
10. **About & privacy** — what is stored where, plain language, ar/en.

## 6. Glossary and named concepts
- **Debate terms** come from `define` nodes. A term is **agreed** when all participants conceded it; otherwise **disputed** (shows both definitions).
- **Auto-linking:** occurrences of a debate term (whole word, Arabic-aware: also matches with the definite article «ال» and common prefixes و/ف/ب/ل) in node text are underlined; tap opens the sheet.
- **Built-in library** (seed ~20 entries, bilingual, each sourced from `research/SOURCES.md`): e.g. genetic fallacy (مغالطة المنشأ), equivocation (الاشتراك اللفظي/المغالطة بالاشتراك), begging the question (المصادرة على المطلوب), straw man (رجل القش), burden shifting (نقل عبء الإثبات), epistemic vs ontological claim (دعوى معرفية/دعوى وجودية), necessary vs sufficient condition, circularity (الدور), infinite regress (التسلسل), self-evident (البديهي), and the munazara moves themselves.
- **Fallacy tags are questions.** On a challenge, the author may attach a library entry; it renders as «هل في هذا مغالطة المنشأ؟» never as an accusation (SYN §4).

## 7. Onboarding (cold link)
- Landing on a debate shows the Summary tab with a one-line banner: «هذه مناظرة بين أحمد وخالد حول: … — الردود مرتبة كشجرة، وكل نقطة مفتوحة تُظهر من عليه الرد.» Dismissible, shown once per device.
- First tap on any action asks for a name (or "I am X" if participants exist).
- Contextual hints (one-time): first time the action sheet opens, a single line explains everyday vs «المزيد».
- Empty states always offer the next action.
- Fair-play charter (≤ 7 short lines) reachable from the debate info, shown once at join.
- In-app guide: one page, ar/en, ≤ 400 words, includes "how to dictate with your phone keyboard" (D-005).

## 8. Language
- Interface: Arabic default (`dir="rtl"`), English selectable; choice saved per device. Interface language never changes debate content.
- Digits: Arabic-Indic in the Arabic interface by default; a setting for Western digits.

## 9. v1 scope (prioritised) and later

**v1 — core loop (must):** create, share link, join, claim/reason/clarify_q/ask_proof/object/clarify/concede/withdraw, focus view, status chips, symmetric obligations, summary tab, local persistence, manual sync (update link/file), export/import JSON, ar/en, PWA offline.
**v1 — should:** relay mailbox sync, the "more" moves, glossary (debate terms + built-in library), commitments sheet, Markdown export, edit/re-type with history.
**Later (ROADMAP):** live P2P, backend adapter implementations, signatures inside ciphertext, re-key / revocation flow, deferred status, search, map view, notifications, Argdown export, on-device transcription experiment.

## 10. Requirements traceability
Each "v1 must/should" item above gets an ID in `docs/qc/TRACEABILITY.md` mapped to tests (QC charter).
