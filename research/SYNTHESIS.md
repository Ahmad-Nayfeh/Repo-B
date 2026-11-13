# Research synthesis

Written by the project lead after six parallel research passes (2026-11-13). Every factual claim cites a topic note and source ID; the full bibliography is in `SOURCES.md`. Statements labelled **(judgement)** are the lead's reasoning, not findings.

Topic notes: `argumentation-theory.md` (ARG), `munazara.md` (MUN), `existing-tools.md` (TOOL), `ux-mobile.md` (UX), `tech-feasibility.md` (TECH), `voice.md` (VOICE).

---

## 1. What makes structured debate actually work

The research converges on six mechanisms. None of them is "draw a map".

1. **Every move must say what it replies to.** In formal dialogue systems a move is only legal as a reply to an earlier move, and this is what keeps the exchange traceable (Prakken's reply table, Walton & Krabbe) [ARG-21]. The munazara procedure is the same: each function of the respondent is "built upon" a function of the questioner [MUN-02]. This one rule is what stops points from getting lost. *Product:* a reply always has a target; there is no free-floating message.

2. **The burden of proof belongs to whoever advanced the claim, and it is triggered by a challenge.** Pragma-dialectics' burden-of-proof rule (rule 2) [ARG-18][ARG-19] and the classical rule "الاستدلال منصب المعلل لا السائل" [MUN-02] say the same thing. This makes "who owes a reply" **computable**: an open challenge is owed a reply by the author of the node it targets [MUN §7.4, ARG §6]. No tool we reviewed tracks this per point [TOOL §15].

3. **Commitments are explicit and distinct.** Asserted, conceded and retracted are different states with different obligations; "I concede" and "I withdraw my claim" are different acts [ARG-21]. The tradition adds concession-for-argument's-sake (التنزّل) and "granted, but it does not matter" (القول بالموجب) [MUN-01, MUN-02].

4. **Disputes about words are settled before disputes about facts.** The classical procedure starts by examining wording (الاستفسار) [MUN-01]; pragma-dialectics' rule 10 (usage) and its opening stage fix terms and shared starting points [ARG-18][ARG-19]; Ibn Haldun University's ADAB protocol has a dedicated opening stage for definitions [MUN-13]. Term drift is one of Ahmad's named problems, and no reviewed tool has a shared glossary that claims can reference [TOOL §15].

5. **Branches must be able to close, and closure comes from the participants, not a judge.** In persuasion dialogue, outcomes follow from what the parties commit to [ARG-21]; the tradition names two terminal states, إلزام and إفحام [MUN-01, MUN-02]; Loomio's recorded outcome is one of the few tool-side examples of closure [TOOL-31]. Most argument maps never end [TOOL §14.10].

6. **Low formalisation cost.** Structured-argument tools fail when users must formalise while they speak [ARG §2, IBIS lessons]; argument mapping adds cognitive load [ARG §8]; Truthmapping's insistence on formal premises is part of why it stayed niche [TOOL-18]. **(judgement)** The structure must emerge from *choosing a reply button*, not from drawing.

What the evidence does **not** support: claims that the product "makes you reason better". Argument-mapping effect sizes (~0.7 SD) come mostly from student courses, often developer-linked, and none studies informal, long-running peer debate or Arabic speakers [ARG §8]. We present the product as "keeps the debate clear and complete", not as a thinking-skills intervention.

## 2. Why existing tools fail

From `existing-tools.md` §14–15:

- **They map structure but not obligation.** Kialo, Debate Map and Argdown show pro/con structure; Debate.org enforces turns only at the level of whole essays. Nobody shows "awaiting reply from X" per point [TOOL §15].
- **Tree bloat and lost importance.** Large Kialo trees overwhelm readers [TOOL-02]; Kialo's own help says its sunburst view confuses newcomers [UX §1].
- **Public spaces fill with spam and need moderators** (Arguman, Deliberatorium ≈5% moderators) [TOOL-15, TOOL-16, TOOL-27]. A private debate between friends avoids both.
- **Scores and votes reward winning over resolving** [TOOL-02, TOOL-36].
- **Vocabulary friction:** "thesis/claim" and "pro/con" confused first-time Kialo Edu users [TOOL-07].
- **Desktop/canvas-first** design; none was designed for one-thumb, RTL use [TOOL §14.9].
- **Fragile funding** killed or froze DebateGraph, Truthmapping, Debate.org and (in its original form) Arguman [TOOL §14.11]. **(judgement)** A static site with no server of ours has near-zero running cost, which is the only sustainable model under rule 3.
- **No Arabic-first structured-debate tool exists** that we could find [TOOL §13].

The strongest sceptical case is Scott Alexander's: real debates rarely decompose into clean maps, and two willing users is the hardest part [TOOL-44]. Our answer: the two users already exist (Ahmad and his friend), and the format must allow loose clarification, definition and "quick question" moves, not only syllogisms.

## 3. What the munazara tradition contributes

The classical discipline of آداب البحث والمناظرة is not decoration for this product; it supplies a better-specified core model than most Western tools use. From `munazara.md`:

| Contribution | Source | Product use |
|---|---|---|
| **Roles belong to a thesis, not a person.** Whoever claims is المعلِّل, the other is السائل; under المعارضة the roles swap. | [MUN-02] | Both friends make claims; each node knows its claimant and questioner. A two-sided debate is classical, not a compromise. |
| **A closed set of questioner moves**: المنع (deny a premise / ask for proof, bare or with سند), النقض (refute the whole proof, *with a witness*: counter-case or impossibility), المعارضة (counter-proof). | [MUN-01, MUN-02, MUN-15] | A small, typed challenge menu. |
| **Admissibility depends on the target.** An unsupported claim admits only a bare denial / request for proof; a citation admits only a request to authenticate it (طلب تصحيح النقل); a supported claim admits all three. | [MUN-01] | Reply buttons change with the target. |
| **الغصب**: arguing against a claim before its owner has argued for it is disallowed by most of the tradition because the talk drifts and "the exchange can never close". | [MUN-01, MUN-02] | Not blocked, but **reframed**: the app offers "deny with a reason" or "post it as your own new claim" (Hārūn's charitable reading [MUN-02]). |
| **A refutation without a witness is مكابرة.** | [MUN-01, MUN-03] | The refute move asks for its witness (counter-case or impossibility). |
| **A fixed catalogue of respondent replies**: prove; clarify what I meant (تحرير المراد); state my framework; "already granted / self-evident"; refute the sanad; concede; concede-but-irrelevant; concede for argument's sake. | [MUN-01, MUN-02, MUN-04] | Reply menu for the person who owes a reply. |
| **Two terminal states**: إلزام (the questioner has nothing left, because the proof bottoms out in necessary or granted premises) and إفحام (the claimant cannot answer). | [MUN-01, MUN-02] | Branch-level closure; a **shared-ground list (المسلّمات)** lets the app detect the ilzām-like state. |
| **Definition objections**: غير جامع, غير مانع, دور, أخفى — with the burden flipped onto the attacker. | [MUN-01] | A definition/term node type with its own objections — directly addresses term drift. |
| **An ethics charter** (al-Shinqīṭī's list): no padding, no ambiguous words, stay on topic, no mockery, seek truth "ولو على يد خصمه", don't answer before understanding, don't interrupt. | [MUN-01, MUN-03] | A short charter shown at the start, plus mechanics (clarify-before-reply, no scores). |

**Agreement with Western theory.** Pragma-dialectics' ten rules [ARG-18][ARG-19], Walton's critical questions and burden types [ARG-10], and commitment-store dialogue systems [ARG-21] arrive at the same burden rule, the same need for an opening stage, and the same distinction between bare doubt and evidence-backed challenge (Carneades: assumption vs exception critical questions [ARG-10]; munazara: bare منع vs منع مع السند [MUN-01]). **(judgement)** Two independent traditions converging on the same structure is good evidence that the structure is right.

**Where the tradition must be adapted for friends** [MUN §7.1]: asynchronous play with many open branches instead of strict turn order; soft warnings instead of hard blocks for ghaṣb and mukābara (friends disagree about what is "self-evident"); and an extra, non-classical branch state — **"agreed to disagree"** — for faith debates that bottom out in different first premises.

**Uncertainties.** Several classical texts (al-Samarqandī, al-Ījī, Sājaqlīzāde) were not read directly; the popular maxim «إن كنت ناقلاً فالصحة…» matches the doctrine but its exact wording was not found [MUN §2.7]. Product copy must not quote unverified wording.

## 4. The product opportunity

**(judgement, from the evidence above)** An Arabic-first, private, mobile-first tool for **long-running asynchronous debates between people who already know each other**, built on the munazara move set, whose headline view is **obligations, not structure**:

- "**عليك الرد في ٣ نقاط / ينتظر ردّ صاحبك في نقطتين**" (you owe 3 replies / your friend owes 2) as the first thing you see [ARG §6, MUN §7.4, UX §2, GitHub-review pattern UX].
- Unanswered points stay prominent and never fade with time (World Universities Debating norm [ARG-24]); silence is never counted as concession [ARG §3].
- Commitments, concessions and withdrawals are first-class and visible per person [ARG-21].
- A shared glossary of terms and named concepts/fallacies, with fallacy labels phrased as **questions**, not accusations [ARG §9, ARG-19].
- No scores, no votes, no "winner" — the tool structures, it never judges (brief rule 5; [TOOL §14.7]).

Who it is not for (scope boundary): public debates, classrooms with teachers, large-group deliberation. These are served (imperfectly) by Kialo, Loomio and Pol.is [TOOL §1, §10].

## 5. UX direction (summary of `ux-mobile.md`)

- **Focus view as the main navigation:** one point in focus, its parent as a single row, its children grouped by move type; at most ~2 nested levels inline; parent-only breadcrumb [UX §1]. Deep indentation fails on phones [UX §1, Wikimedia].
- **Status = icon + text label + colour**, never colour alone (WCAG 1.4.1) [UX §2].
- **"Waiting on me" inbox and filters** modelled on GitHub review conversations; resolved threads collapsed by default but recoverable [UX §2–3].
- **Glossary terms open a bottom sheet**, not a tooltip (tooltips fail on touch) [UX §4].
- **Cold link → debate summary, no tutorial carousel** (NN/g found no benefit), contextual one-time hints, name asked at first reply [UX §6].
- **RTL:** `dir="rtl"` on html, `dir="auto"` on user text, `<bdi>` around names/terms, logical CSS only, no letter-spacing on Arabic, `font-synthesis: none` [UX §7]. Fonts: free SIL-OFL Arabic fonts (shortlist Noto Sans Arabic, IBM Plex Sans Arabic, Readex Pro) [UX §7]. Digits: CLDR's `ar-SA` default is Arabic-Indic (confirmed locally against ICU 78 / CLDR 48), generic `ar` is Western; ship a setting.
- **Performance:** LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at p75; mid-range Android baseline; JS budget ~75–100 KiB compressed; `content-visibility: auto` before virtualisation [UX §8].
- Touch targets ≥ 44 px, aiming for 48 [UX §1].

## 6. Recommended technical approach under the constraints

The constraints (free, zero setup by Ahmad, private, static, asynchronous over months) rule out most options. From `tech-feasibility.md`:

**Rejected, with evidence**
- **P2P as the primary channel.** It only syncs when both phones are open at the same time (~0.7%/day overlap in a once-a-day usage model), y-webrtc's default signalling servers are gone, and the anonymous Open Relay TURN host is dead [TECH §2, TECH-52].
- **Keyless JSON stores** (jsonblob, kvdb, extendsclass) — blocked, expiring, or keyed [TECH-22, TECH-24].
- **Public MQTT / Gun relays** — no history or gone [TECH-25, TECH-52].
- **Automerge** — ~1.65 MB gzipped, too heavy for the mobile budget [TECH-46].
- **A CRDT at all** — the data is append-mostly with one author per node, so an immutable event log with union merge and last-writer-wins on a few fields is already conflict-free [TECH §1.3].
- **Supabase / Appwrite free tiers** as the later backend — they pause after ~7 days of inactivity, fatal for a debate that rests for weeks [TECH-28, TECH-35]. **InstantDB** is shutting down its cloud [TECH-33].

**Recommended**
1. **Local-first encrypted event log.** Every device keeps the full debate in IndexedDB; every replica is a full backup [TECH §9].
2. **End-to-end encryption, key in the URL fragment.** The fragment is never sent to any server (Excalidraw and PrivateBin pattern) [TECH-36, TECH-37]. AES-GCM via WebCrypto, available on all modern mobile browsers [TECH-38].
3. **Async transport: a "mailbox" on several public Nostr relays.** Encrypted events are published to ~5 relays, read from all of them, and republished by every client when a relay is missing them [TECH §3.1, §9]. Our test publishes succeeded on some relays and were ignored or refused by others [TECH-21].
4. **Manual fallback that always works:** "send update" as a link or a backup file over WhatsApp; the receiver merges by union [TECH §4].
5. **Optional live channel later:** WebRTC via Trystero when both are online [TECH §2.2].
6. **Optional backend adapter later:** Cloudflare Durable Objects first, Firebase Spark second; the adapter stores only ciphertext [TECH §5].

**Honest risks**
- **No zero-account channel guarantees storage for months.** No Nostr relay promises retention; one appears to keep about a year or less [TECH-21]. Data is lost only if *both* phones lose local data *and* every relay has pruned — so the app must push home-screen install, call `navigator.storage.persist()`, and prompt for backup files [TECH §7].
- **iOS Safari deletes script-writable storage after 7 days of Safari use without visiting the site**, unless the site is installed to the home screen [TECH-13].
- **Relays are third parties.** They see ciphertext, timing, size and IP addresses, never content [TECH-17]. This must be stated plainly in the privacy note, with an opt-out ("local only / manual sync") mode. **(judgement)** This is consistent with "no tracking" (relays receive nothing identifying beyond IP, and no analytics are run), but it is not "nothing leaves your phone", and the product must not claim that.
- **The link is the key.** Anyone the link is forwarded to can read and write [TECH §6]; per-participant signing keys inside the ciphertext can at least prevent impersonation.
- **GitHub Pages logs visitor IPs** [TECH-41]; the fragment (key) is never sent to GitHub. No custom headers, so noindex and CSP go in `<meta>` tags [TECH §8].
- **Long links in WhatsApp** are untested on real devices [TECH §4].

## 7. Voice

**Plain answer: free, private, in-browser Arabic speech-to-text that works on a mid-range phone does not exist today** [VOICE summary]:
- Web Speech API on phones sends audio to Google/Apple; Chrome's on-device mode is desktop-only and Arabic is not documented as on-device [VOICE §1].
- Private in-browser Whisper is weak for Arabic at phone-sized models (FLEURS Arabic WER: tiny 63%, base 49%, small 31%; downloads ~39/73/238 MB) [VOICE §2].
- Syncing audio without a server is impractical: blobs are too large for links, and relays rarely accept them [VOICE §4].

**v1:** text only, plus a short in-app guide on using the phone's own dictation (iOS lists Arabic for on-device dictation; WhatsApp's own transcripts are on-device per WhatsApp; Gboard may send audio to Google) [VOICE §5–6]. Later, optionally, an experimental on-device "transcribe a file" tool with an explicit consent and download-size screen [VOICE §6].

## 8. Gaps this research could not close

- **No user testing.** Arabic labels for moves, and whether friends will tolerate a typed move set, are untested. Mitigation: keep the everyday move set small and plain, with classical names shown as a secondary label; test with a scripted simulated debate.
- **Nostr relay retention and anti-spam behaviour** were measured once, from one sandbox [TECH-21]; must be monitored in the app (relay health screen).
- **WhatsApp long-link behaviour** and **iOS PWA behaviour** need real-device checks that this session cannot perform; recorded as known limits.
- **Moonshine's Arabic model licence** is unclear [VOICE §3]; irrelevant for v1.

## 9. Recommendation in one paragraph

Build an Arabic-first PWA whose core model is the munazara move set (claim, proof, clarify, deny/ask-for-proof, refute-with-witness, counter-proof, ask-for-source, definition, and the respondent's reply catalogue), with roles per thesis and a computed "who owes a reply" for every open challenge. The headline view is each person's obligations; the main navigation is a focus view, not a map; nothing is scored. Data lives encrypted on each device as an event log, syncs through an encrypted mailbox on several public Nostr relays, and always has a manual link/file fallback; a free backend adapter can be plugged in later. Voice is text-plus-dictation in v1, with honest privacy notes.
