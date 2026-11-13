# PRD — مناظرة (Munāẓara): a structured debate site

Version 1.1 (revised after the independent design review, `REVIEW-design.md`; resolution log in §11).
Owners: Product & UX + Argumentation & Domain (with the lead). Evidence: `research/SYNTHESIS.md` (SYN §n). Decisions: `docs/DECISIONS.md`.

---

## 1. Goal and non-goals

**Goal.** Two or more people who already know each other hold a long, asynchronous debate that stays **clear** (structure and terms visible), **fair** (the tool never judges; obligations are symmetric and cannot be inflated) and **complete** (no point silently lost; always clear what is waiting on whom).

**Non-goals (v1).** Public debates, discovery, voting or scores, moderation of strangers, classrooms, voice recording, AI features, accounts, push notifications.

## 2. User scenarios

### S1 — Ahmad and Khalid continue a months-long debate (primary)
1. Ahmad taps **«مناظرة جديدة»**, writes the title («هل يستقلّ العقل بإثبات وجود الله؟»), **his standpoint** («العقل يستقلّ بإثبات وجود الصانع») and his display name.
2. He picks a sync mode on one clear screen (D-007): **«مزامنة مشفّرة عبر خوادم عامة»** (relays see timing and IP, never content) or **«يدوي فقط»**.
3. **«شارك رابط الدعوة»** opens the phone's share sheet; he sends it to Khalid on WhatsApp.
4. Khalid opens it and sees one screen: who is debating what, Ahmad's standpoint, a one-line explanation. He enters his name and states **his own standpoint**, or chooses «لا أتبنّى دعوى مقابلة؛ أسأل وأعترض فقط» with the note «سؤالك عن الدليل مشروع، وأي اعتراض تذكر له سبباً هو دعوى يمكن أن يُطلب دليلها».
5. Khalid taps Ahmad's claim → **«ردّ»** → chooses «ما دليلك؟» → sends. Then **«أبلغه»** shares a short WhatsApp message (no link secret).
6. Ahmad opens the app: **«بانتظارك: ١»**. One tap lands on the challenge; «ردّ» is pre-set to «أجيب بدليل». After he answers, Khalid sees **«دورك: ١»** — accept the answer, challenge it, or propose to agree to disagree.
7. Weeks later the tree has hundreds of points; each person lands on **«بانتظارك»** and **«جديد منذ زيارتك»**, not the whole tree. Search finds "where did he say X".
8. They disagree about «العقل». Khalid adds a **definition** («تعريف»). Ahmad accepts it («أوافق على التعريف») or objects. The debate's term list shows agreed and disputed terms.
9. A branch bottoms out in different first principles: one proposes «نتفق على الاختلاف هنا»; the other accepts; the branch closes.

### S2 — Cold link recipient
One screen explains what this is, what waits for them, and how to reply. No tutorial carousel. A name is asked at the first action.

### S3 — Same person, second device
On his phone Ahmad taps **«استخدم هويتي على جهاز آخر»** and sends himself the transfer link. Opening it on the laptop (after the invite link) makes the laptop sign as Ahmad. Without it, the laptop can only join as a new participant (shown as «أحمد ٢»). This prevents anyone with the debate link from writing as Ahmad (§7).

### S4 — Three participants
Obligations stay per author and per challenge. "Accepted" requires every **active** other participant (anyone who has written at least one point) to accept; a person who only opened the link never blocks anything.

### S5 — Manual sync / relays down / iPhone installed app
Ahmad taps **«أرسل تحديثاً»**: the app makes an update link (only the debate id and encrypted new points — **no key**), or an encrypted `.txt` file if large. Khalid opens it, or **pastes it in the app's «الصق رابطاً» box** — required on iPhone, where the home-screen app does not share storage with Safari and WhatsApp links always open in Safari.

### S6 — Backup and ownership
**«نسخة احتياطية»** saves an encrypted `.txt` file (default, safe in Drive/WhatsApp); a plain JSON export exists behind a warning. Import merges.

## 3. The debate model

### 3.1 Concepts
- **Debate**: id, title, participants, nodes, settings.
- **Participant**: `personId`, display name, public key (signing). **Active** = has authored ≥ 1 node.
- **Node**: one move by one author: `id`, `parentId` (null only for standpoints), `authorId`, `move`, `text`, optional `meta` (`witness` for refute; `origin: 'citation'` for a quoted text the author does not personally commit to; `ref` for see-also), `at`.
- **Reply tree.** A node's parent is exactly what it replies to. Statuses and obligations are **computed** from the node set (deterministic: the same events give the same result on every device).
- **Edit:** author only; if anyone else replied before the edit, the node shows «عُدّل بعد الرد» and earlier versions are viewable (D7).
- **Re-type:** author only, and only while no one else has replied to the node; otherwise the re-type is ignored (deterministic; D2).
- **Validity** of a new node is checked against its parent's **original** move and authorship. Invalid events are ignored and counted in diagnostics; **valid nodes are never dropped later** (D2).

### 3.2 Moves (v1)

| Move | Arabic label(s) | Class | Classical basis |
|---|---|---|---|
| `claim` | دعوى | assertion | الدعوى; author = المعلِّل [MUN §1] |
| `reason` | دليل / أجيب بدليل | assertion (+answer) | الدليل [MUN §1] |
| `counter` | معارضة (دعوى مقابلة بدليلها) | assertion that also challenges its parent | المعارضة — roles swap [MUN §2.5] |
| `define` | تعريف | assertion | التعريف [MUN §5] |
| `clarify_q` | ماذا تقصد؟ | challenge | الاستفسار [MUN §2.2] |
| `ask_proof` | ما دليلك؟ | challenge | المنع المجرد / طلب الدليل [MUN §2.3] |
| `object` | أعترض (مع ذكر السبب) | challenge | المنع مع السند [MUN §2.3] |
| `refute` | نقض (بشاهد) | challenge; requires `meta.witness` ∈ {`counterexample` تخلّف, `impossibility` استلزام المحال} | النقض [MUN §2.4] |
| `ask_source` | وثّق النقل | challenge; only on nodes with `origin: 'citation'` | طلب تصحيح النقل [MUN §2.7] |
| `clarify` | أوضّح مقصدي | answer | تحرير المراد [MUN §3.1] |
| `source` | هذا المصدر | answer | تصحيح النقل |
| `see_also` | أجبتُ عنه هنا ← | answer; `meta.ref` = an existing node | design adaptation (anti-repetition, D5) |
| `obvious` | هذا مسلَّم سابقاً أو بديهي عندي | answer | "already granted / self-evident" reply [MUN §3.1] |
| `concede` | context labels — see §3.5 | stance | التسليم [MUN §3.2] |
| `withdraw` | أسحب | stance (on own node; also undoes own stance) | retraction [ARG §6] |
| `agree_disagree` | أقترح أن نتفق على الاختلاف هنا / أوافق | stance | design adaptation [MUN §7.1] |
| `note` | ملاحظة | neutral (no obligation, not a reaction) | point of information [ARG §7] |

Deferred (ROADMAP): `grant_arg` (التنزّل), `granted_irrelevant` (القول بالموجب), counter forms (قلب/مثل/غير), definition-objection subtypes, fallacy tags.

### 3.3 The single matrix: who may reply what (validity)

Notation: parent **P** with author **A**. "Other" = any participant ≠ A. Rows are the parent's move.

| Parent P | Other may add | A may add |
|---|---|---|
| `claim`, `reason`, `define`, `clarify`, `source`, `obvious` (assertions & answers) | `clarify_q`, `ask_proof`, `object`, `refute`*, `ask_source`**, `counter`***, `concede`, `note` | `reason`, `note`, `withdraw`, `define` |
| `counter` | Other ≠ A: `clarify_q`, `ask_proof`, `object`, `refute`*, `concede`, `note` | `reason`, `note`, `withdraw` |
| challenge C ∈ {`clarify_q`,`ask_proof`,`object`,`refute`,`ask_source`} authored by X, targeting T authored by Y | **Y** (target's author): `reason`, `clarify`, `source`, `see_also`, `obvious`, `concede`, `agree_disagree`, `note`. **X**: `withdraw`, `agree_disagree`, `note`. Others: `note`. | (A = X; covered left) |
| `see_also` | X (owner of the challenge it answers): `concede`, `clarify_q`, `ask_proof`, `object`, `note` | `withdraw`, `note` |
| `concede`, `withdraw`, `agree_disagree`, `note` | `note` | `withdraw` (undo own stance), `note` |

\* `refute` only on `reason` (a proof).  \*\* `ask_source` only when P has `origin: 'citation'`.  \*\*\* `counter` only on `claim`/`counter`; if the target claim has no `reason` yet, the composer shows a gentle hint (anti-ghaṣb, MUN §2.6) suggesting «ما دليلك؟» or «أعترض» instead, but does not block.

`define` may be added by anyone anywhere an assertion may be added (its parent gives context); it is an assertion by its author.

### 3.4 Status and obligation rules

Definitions used below:
- An assertion N is **dead** if N is withdrawn by its author, or **conceded by its author** (its author posted `concede` under a challenge on N), or any assertion ancestor of N is dead. A **stance is live** unless its author withdrew it.
- A challenge is **moot** if it is withdrawn, its target is dead, or the challenge itself sits under a dead assertion. Moot challenges create **no obligation for anyone** (D3).
- An **answer** to challenge C = a child of C by Y with move ∈ {`reason`,`clarify`,`source`,`see_also`,`obvious`} that is not dead. The **latest answer** = the live answer with the greatest `(at, id)`.
- A **reaction** of X to answer N = a live child of N by X with move ∈ {`concede`, `clarify_q`, `ask_proof`, `object`, `refute`, `counter`} or a live `agree_disagree` by X in C. `note` is **not** a reaction (D27).

**Challenge C** (author X, target T, T's author Y), evaluated in this order:

| # | State | Condition | Obligation |
|---|---|---|---|
| 1 | moot | see above | none |
| 2 | conceded | Y has a live `concede` child of C (Y accepts the objection; T becomes *conceded by its author*) | none |
| 3 | agreed to disagree | both X and Y have a live `agree_disagree` in C | none |
| 4 | proposal pending | exactly one of X/Y has a live `agree_disagree` in C, and the other has posted nothing (non-note) in C's subtree after it | **the other one: "your move"** (accept, or continue — any substantive move declines it) |
| 5 | open | no live answer | **Y owes a reply** |
| 6 | accepted | X has a live `concede` on the latest answer | none |
| 7 | answered → challenged | X has a live challenge on the latest answer | none on C (the new challenge carries its own) |
| 8 | answered | otherwise | **X: "your move"** |

A new answer by Y re-arms state 8 for X. If Y's answer later dies (Y conceded it), C returns to "open".

**`counter` K** under target T (author X of K, Y = author of T): K is an assertion by X **and** a challenge on T. While Y has posted no live `clarify_q`/`ask_proof`/`object`/`refute`/`concede` under K, and K is not moot: **Y owes a reply** (state "open"). Once Y challenges K, obligations move to those challenges. If Y concedes K, T becomes *conceded by its author*.

**Assertion N** (author A), first matching:
1. **withdrawn** — «سحبه صاحبه» (grey, not struck out).
2. **conceded by its author** — «تراجع عنه صاحبه» (grey).
3. **under discussion** — has ≥ 1 non-moot challenge in states 4–8 → «قيد النقاش» with a sub-label: «بانتظار رد A» / «دور X».
4. **accepted** — every active participant other than A has a live `concede` directly on N → «قَبِله الطرف الآخر» / «قبله الجميع».
5. **standing** — «لا اعتراض عليه» (means only "no open challenge").

"Under discussion" outranks "accepted" (D4): a later objection by someone who accepted earlier shows up.

**Counting (D5).** For participant P:
- **«بانتظارك» (you owe)** = number of **distinct target nodes** authored by P that have ≥ 1 challenge in state "open" (incl. counters). Ten `ask_proof` on one claim count once.
- **«دورك» (your move)** = number of challenges by P in state "answered" + pending proposals waiting on P.
- The header shows **your own** two numbers prominently; others' numbers appear in the participants row in the same neutral style, unordered (by join order), never compared or highlighted.

**Nothing auto-closes with time.** Open items show their age («منذ ٥ أيام»). Silence is never a concession.

**Branch summary.** A subtree with no open/answered/pending items shows «لا نقاط مفتوحة في هذا الفرع» — same wording on every branch (D19). The classical terms الإلزام / الإفحام are **not** used as labels (they read as verdicts); the about sheet explains them.

### 3.5 Context reply flow (D10, D11)

Each node card has one primary button **«ردّ»**. It opens the composer with the move **pre-selected by context** and up to 3 alternative chips + «المزيد»:

| Context (I am…) | Default | Chips | Under «المزيد» |
|---|---|---|---|
| replying to someone else's assertion | أعترض | ما دليلك؟ · ماذا تقصد؟ · أقبل هذا (concede) | نقض (on a reason) · معارضة (on a claim) · وثّق النقل (citation) · تعريف · ملاحظة |
| the target's author, under a challenge to me | أجيب بدليل (reason) | أوضّح مقصدي · أجبتُ عنه هنا ← · أتراجع عن هذه النقطة (concede) | هذا المصدر · مسلَّم/بديهي · أقترح الاتفاق على الاختلاف · ملاحظة |
| the challenger, on an answer to my challenge | أعترض | أقبل الجواب (concede) · ما دليلك؟ · ماذا تقصد؟ | نقض · أقترح الاتفاق على الاختلاف · ملاحظة |
| on my own assertion | أضيف دليلاً | تعريف · ملاحظة · أسحب | — |
| on a pending proposal to me | أوافق على الاتفاق على الاختلاف | (or reply normally) | — |

`concede` always shows a context label so a wrong tap is unlikely, and every stance can be undone with «تراجع» (withdraw own stance).

**After sending:** a small bar offers **«أبلغه»** (share a short text, no secret) and, in manual mode, **«أرسل التحديث»**.

### 3.6 Per-participant view (v1-should)
Standpoint(s), points they accepted, points they withdrew or conceded. (Full "commitments/shared ground" view: ROADMAP.)

## 4. How munazara maps onto the model

| Munazara | Model |
|---|---|
| المعلِّل / السائل | Per node: author = claimant of that node; others = its questioners. Both people hold both roles (MUN §1). Burden → "you owe"; the questioner's turn after an answer → "your move" (symmetry, D-006). |
| Opening: الدعوى، تحرير المصطلحات | Creation asks each person's standpoint; `define` + term list. |
| الاستفسار / المنع المجرد / المنع مع السند | `clarify_q` / `ask_proof` / `object` |
| النقض بشاهد | `refute` + required witness type |
| المعارضة | `counter` (an assertion that challenges its parent; roles swap) |
| النقل وطلب تصحيحه | `origin: 'citation'`, `ask_source`, `source` |
| أجوبة المعلل | `reason`, `clarify`, `source`, `obvious`, `concede`, plus `see_also` |
| الغصب | gentle hint in the composer, never a block |
| الإلزام / الإفحام | not used as labels; neutral branch states only |
| المكابرة | not detected or labelled (would be a judgement); mentioned in the fair-play charter |
| الآداب | fair-play charter (≤ 7 lines) at join; mechanics: «ماذا تقصد؟» is always one tap away; no scores |

## 5. Screens

1. **Home «مناظراتي»** — debates on this device: title (or «مناظرة ١» if titles are hidden), participants, your two numbers, last activity. **«مناظرة جديدة»**, **«الصق رابطاً»** (invite/update/identity link), import backup. Settings: language, digits, hide titles.
2. **New debate** — title, name, standpoint, sync mode → create → share invite.
3. **Join** — title, participants and standpoints, one-line explanation, name, own standpoint (optional / «أسأل وأعترض فقط»), fair-play charter (collapsible). Private-browsing/in-app-browser warning before the first write (D25).
4. **Debate → «الحالة» (default)** in this order (D26): «بانتظارك» (top 3 + «عرض الكل»); «جديد منذ زيارتك»; participants row with their numbers; standpoints; small counts row; collapsed: terms, all items.
5. **Debate → «الشجرة»** — focus view: collapsed breadcrumb (standpoint … › parent), focused card, children grouped (أدلة وتعريفات / اعتراضات وأسئلة / أجوبة / مواقف وملاحظات), ordered open-first then recent. Filters: «المفتوح», «بانتظاري», «الكل». Closed threads collapsed. Search box (substring over node texts).
6. **Composer** — bottom sheet: move chip row, text area (`dir="auto"`), «نصّ منقول؟» toggle (sets `origin: 'citation'`), witness picker for `refute`, node picker for `see_also`.
7. **Terms «المصطلحات»** — debate definitions: agreed (all active others conceded) / disputed (shows competing definitions). v1-should: a small built-in library of named concepts and fallacies with sources.
8. **Sync & backup** — mode, relay status, «أرسل تحديثاً», «نسخة احتياطية (مشفّرة)», «تصدير JSON (غير مشفّر)» with warning, import, last backup time, install hint (with the iPhone separate-storage caveat), «استخدم هويتي على جهاز آخر».
9. **About & privacy** — plain-language, ar/en; what each mode sends where; what the app never does.

## 6. Glossary and named concepts
- **Debate terms** come from `define` nodes; agreed when every active other participant conceded the definition.
- **Built-in library (v1-should):** ~12 entries, bilingual, each sourced from `research/SOURCES.md` (e.g. مغالطة المنشأ genetic fallacy; المصادرة على المطلوب begging the question; الاشتراك اللفظي equivocation; رجل القش straw man; نقل عبء الإثبات burden shifting; دعوى معرفية/وجودية epistemic vs ontological claim; شرط لازم/كافٍ necessary vs sufficient; الدور circularity; التسلسل infinite regress; plus the munazara moves). Shown as reference; when cited in a node, phrased as a question.
- Auto-underlining of terms in text: ROADMAP.

## 7. Identity and integrity (D15, reverses part of D-011)
- Each participant has a signing key pair created on the device where they join; `person.join` carries the public key; **every event is signed**. Events for a personId that do not verify against that person's key are rejected.
- Second device: «استخدم هويتي على جهاز آخر» creates an identity link (encrypted with the debate key; contains the private key) with a clear warning: send it only to yourself.
- Duplicate display names are disambiguated deterministically («أحمد ٢»).
- Limits (disclosed): anyone with the debate link can still join as a *new* participant; the device holding the key must be trusted.

## 8. Onboarding
- Landing banner once per device: «مناظرة بين أحمد وخالد حول: … — كل نقطة مفتوحة تُظهر من ينتظر ردّه.»
- First action asks for a name / identity.
- First composer open: one line explaining the default move and «المزيد».
- Fair-play charter at join (collapsible), ≤ 7 lines, adapted from al-Shinqīṭī's ādāb [MUN §4].
- In-app guide (one page, ≤ 400 words, ar/en) incl. dictation tip (D-005) and iPhone install caveat.

## 9. Language
Arabic default (`dir="rtl"`), English selectable; digits Arabic-Indic by default in Arabic, setting for Western.

## 10. v1 scope

**Must (core loop, built and polished first):** create; invite link; join; moves `claim, reason, clarify_q, ask_proof, object, clarify, concede, withdraw, note`; status + obligation engine (§3.4) with fixtures; signed events; focus view + breadcrumb; «الحالة» summary; context reply flow; «أبلغه»; local persistence; manual sync (update link without key + paste box + encrypted `.txt` file); encrypted backup + import; ar/en; PWA offline.

**Should (next slices, same gates):** relay mailbox (fixed list of tested relays); `counter`, `refute`, `ask_source`/`source`, `see_also`, `obvious`, `define`, `agree_disagree`; terms tab; search; identity transfer; per-participant view; small named-concept library; hide titles; plain JSON export.

**Later (ROADMAP):** retype after replies; `grant_arg`, `granted_irrelevant`, counter forms, definition-objection types, fallacy tags; term auto-linking; commitments/shared-ground view; Markdown/Argdown export; editable relay list and anti-entropy republication; live P2P; backend adapter implementations; re-key/revocation; app passcode; room-tag rotation; on-device transcription experiment.

## 11. Design review resolution (REVIEW-design.md)

| ID | Resolution |
|---|---|
| D1 iOS storage split | S5, §5.1 «الصق رابطاً», install caveat, update links need no key; real-device test listed in NEEDS-AHMAD (cannot be done here). |
| D2 retype drops replies | §3.1: validity vs original move; retype ignored once others replied; nodes never dropped. |
| D3 obligations on dead points | §3.4 dead/moot. |
| D4 accepted hides objection | §3.4 precedence: under discussion > accepted. |
| D5 challenge spam / scoreboard | count per target node; `see_also` + `obvious` answers; neutral header (own numbers prominent, others neutral, unordered). |
| D6 agree-to-disagree deadlock | state 4 "proposal pending" passes the move. |
| D7 edits after reply | «عُدّل بعد الرد» + history. |
| D8 `counter` ambiguity | single matrix §3.3 + explicit `counter` rule §3.4. |
| D9 phantom participants | "active" participants only. |
| D10 «أُسلّم» ambiguity, no undo | context labels; withdraw undoes own stance. |
| D11 button selection | §3.5 context table; one move per node (mixed replies = several nodes). |
| D12 navigation at scale | breadcrumb, search (should), open-first ordering. |
| D13 stalls | «أبلغه» nudge after each reply. |
| D14 key in update links | update links carry no key. |
| D15 plaintext export, device inspection, fabrication | encrypted `.txt` default; hide titles (should); signed events (§7); threat model rows in ARCHITECTURE. |
| D16 relay facts | own re-test 2026-11-13 with kind 4333 (ARCHITECTURE §6.2); paging. |
| D17 file sharing type | `.txt` |
| D18 Pages enablement | NEEDS-AHMAD steps. |
| D19 verdict-like wording | neutral wording §3.4, grey not strike-through, option note in S1.4. |
| D20 scope | §10 cut/should/later. |
| D21 clock skew | LWW only among one author's own events; harm limited to self; noted. |
| D22 CSP details | ARCHITECTURE §10. |
| D23 URL rewrite is hygiene | privacy note wording. |
| D24 constant room tag | disclosed; rotation in ROADMAP. |
| D25 private/in-app browser | warning before first write. |
| D26 summary density | §5.4 order. |
| D27 "reaction" undefined | §3.4 definition. |
