# Research synthesis

Written by the project lead after six parallel research passes (2026-11-13), then revised after an independent fresh-context review (`REVIEW-synthesis.md`, findings F1–F17; resolution log at the end of this file). Every factual claim cites a topic note and source ID; the full bibliography is in `SOURCES.md`. Statements labelled **(judgement)** are the lead's reasoning, not findings.

Topic notes: `argumentation-theory.md` (ARG), `munazara.md` (MUN), `existing-tools.md` (TOOL), `ux-mobile.md` (UX), `tech-feasibility.md` (TECH), `voice.md` (VOICE).

---

## 1. What makes structured debate actually work

The research converges on six mechanisms. None of them is "draw a map".

1. **Every move must say what it replies to.** In formal dialogue systems a move is only legal as a reply to an earlier move, and this is what keeps the exchange traceable (Prakken's reply table, Walton & Krabbe) [ARG-21]. The munazara procedure is the same: each function of the respondent is "built upon" a function of the questioner [MUN-02]. This one rule is what stops points from getting lost. *Product:* a reply always has a target; there is no free-floating message.

2. **The burden of proof belongs to whoever advanced the claim, and it is triggered by a challenge.** Pragma-dialectics' burden-of-proof rule (rule 2) [ARG-18][ARG-19] and the classical rule "الاستدلال منصب المعلل لا السائل" [MUN-02] say the same thing. This makes "who owes a reply" **computable**: an open challenge is owed a reply by the author of the node it targets [MUN §7.4, ARG §6]. No tool we reviewed tracks this per point [TOOL §15].

3. **Commitments are explicit and distinct.** Asserted, conceded and retracted are different states with different obligations; "I concede" and "I withdraw my claim" are different acts [ARG-21]. The tradition adds concession-for-argument's-sake (التنزّل) and "granted, but it does not matter" (القول بالموجب) [MUN-01, MUN-02].

4. **Disputes about words are settled before disputes about facts.** The classical procedure starts by examining wording (الاستفسار) [MUN-01]; pragma-dialectics' rule 10 (usage) and its opening stage fix terms and shared starting points [ARG-18][ARG-19]; Ibn Haldun University's ADAB protocol has a dedicated opening stage for definitions [MUN-13]. Term drift is one of Ahmad's named problems, and no reviewed tool has a shared glossary that claims can reference [TOOL §15].

5. **Branches must be able to close, and closure comes from the participants, not a judge.** In persuasion dialogue, outcomes follow from what the parties commit to [ARG-21]; the tradition names two terminal states, إلزام and إفحام [MUN-01, MUN-02]; Loomio's recorded outcome is one of the few tool-side examples of closure [TOOL-31]. Most argument maps never end [TOOL §14.10].

6. **Low formalisation cost.** Structured-argument tools fail when users must formalise while they speak [ARG §2, IBIS lessons]; argument mapping adds cognitive load [ARG §8]; Truthmapping's formal-premise format was criticised as encouraging "cargo-cult logic" [TOOL-18]. The argumentation note's advice is to **let people post first and classify later** [ARG §2]. **(judgement)** The structure must emerge from *choosing a reply button*, not from drawing.

What the evidence does **not** support: claims that the product "makes you reason better". Argument-mapping effect sizes (~0.7 SD) come mostly from student courses, often developer-linked, and none studies informal, long-running peer debate or Arabic speakers [ARG §8]. We present the product as "keeps the debate clear and complete", not as a thinking-skills intervention.

## 2. Why existing tools fail

From `existing-tools.md` §14–15:

- **They map structure but not obligation.** Kialo, Debate Map and Argdown show pro/con structure; Debate.org enforces turns only at the level of whole essays. Nobody shows "awaiting reply from X" per point [TOOL §15].
- **Tree bloat and lost importance.** Large Kialo trees overwhelm readers [TOOL-02]; Kialo's own help says its sunburst view confuses newcomers [UX §1].
- **Public spaces fill with spam and need moderators** (Arguman, Deliberatorium ≈5% moderators) [TOOL-15, TOOL-16, TOOL-27]. A private debate between friends avoids both.
- **Scores and votes reward winning over resolving** [TOOL-02, TOOL-36].
- **Vocabulary friction:** in a 13-educator study of Kialo Edu, first-time users were unclear on "thesis"/"claim", and "pro/con" was called reductive or combative [TOOL-07]. (The same study rated Kialo Edu's mobile experience "Strong" and its map intuitive [TOOL-07].)
- **Desktop/canvas-first heritage** in older tools (Rationale was Windows-only); even the mobile-capable ones were not designed for one-thumb, asynchronous, RTL use [TOOL §14.9].
- **Many are gone or dormant** — DebateGraph, Truthmapping, Debate.org and (in its original form) Arguman — with causes mostly unverified [TOOL §14.11]. **(judgement)** A static site with no server of ours has near-zero running cost, which is the only sustainable model under rule 3.
- **No Arabic-first structured-debate tool exists** that we could find [TOOL §13].

The strongest sceptical case is Scott Alexander's: real debates rarely decompose into clean maps, and two willing users is the hardest part [TOOL-44]. Our answer: the two users already exist (Ahmad and his friend), and the format must allow loose clarification, definition and "quick question" moves, not only syllogisms.

## 3. What the munazara tradition contributes

The classical discipline of آداب البحث والمناظرة is not decoration for this product; it supplies a better-specified core model than most Western tools use. From `munazara.md`:

| Contribution | Source | Product use |
|---|---|---|
| **Roles belong to a thesis, not a person.** Whoever claims is المعلِّل, the other is السائل; under المعارضة the roles swap. | [MUN-02] | Both friends make claims; each node knows its claimant and questioner. A two-sided debate is classical, not a compromise. |
| **A closed set of questioner moves**: المنع (deny a premise / ask for proof, bare or with سند), النقض (refute the whole proof, *with a witness*: counter-case or impossibility), المعارضة (counter-proof). | [MUN-01, MUN-02, MUN-15] | A small, typed challenge menu. |
| **Admissibility depends on the target.** An unsupported claim admits only a bare denial / request for proof; a citation by someone who does **not** commit to it (الناقل) admits only a request to authenticate it (طلب تصحيح النقل) — a citer who endorses the quote is a claimant and all moves apply; once a claim is supported, denials target its **premises**, refutation targets its **proof**, and counter-proof targets the claim (validation table in MUN §7.3). | [MUN-01] | Reply buttons change with the target. Nodes record `origin: own / citation-endorsed / citation-only`. |
| **الغصب**: arguing against a claim before its owner has argued for it is disallowed by most of the tradition because the talk drifts and "the exchange can never close". | [MUN-01, MUN-02] | Not blocked, but **reframed**: the app offers "deny with a reason" or "post it as your own new claim" (Hārūn's charitable reading [MUN-02]). |
| **A refutation without a witness is مكابرة.** | [MUN-01, MUN-03] | The refute move asks for its witness (counter-case or impossibility). |
| **A fixed catalogue of respondent replies**: prove; clarify what I meant (تحرير المراد); state my framework; "already granted / self-evident"; refute the sanad; concede; concede-but-irrelevant; concede for argument's sake. | [MUN-01, MUN-02, MUN-04] | Reply menu for the person who owes a reply. |
| **Two terminal states**: إلزام (the questioner has nothing left, because the proof bottoms out in necessary or granted premises) and إفحام (the claimant cannot answer). | [MUN-01, MUN-02] | Branch-level closure; a **shared-ground list (المسلّمات)** lets the app detect the ilzām-like state. |
| **Definition objections**: غير جامع, غير مانع, دور, أخفى — with the burden flipped onto the attacker. | [MUN-01] | A definition/term node type with its own objections — directly addresses term drift. |
| **An ethics charter** (al-Shinqīṭī's list): no padding, no ambiguous words, stay on topic, no mockery, seek truth "ولو على يد خصمه", don't answer before understanding, don't interrupt. | [MUN-01, MUN-03] | A short charter shown at the start, plus mechanics (clarify-before-reply, no scores). |

**Agreement with Western theory.** Pragma-dialectics' ten rules [ARG-18][ARG-19], Walton's critical questions and burden types [ARG-10], and commitment-store dialogue systems [ARG-21] arrive at the same burden rule, the same need for an opening stage, and the same distinction between bare doubt and evidence-backed challenge (Carneades: assumption vs exception critical questions [ARG-10]; munazara: bare منع vs منع مع السند [MUN-01]). **(judgement)** Both traditions descend partly from Aristotle's *Topics* [MUN-06; ARG §1], so this is not independent confirmation; it does show the structure has survived long, separate use in two scholarly cultures, which is good practical evidence that it is workable.

**Where the tradition must be adapted for friends** [MUN §7.1]: asynchronous play with many open branches instead of strict turn order; soft warnings instead of hard blocks for ghaṣb and mukābara (friends disagree about what is "self-evident"); and an extra, non-classical branch state — **"agreed to disagree"** — for faith debates that bottom out in different first premises.

**Uncertainties.** Several classical texts (al-Samarqandī, al-Ījī, Sājaqlīzāde) were not read directly; the popular maxim «إن كنت ناقلاً فالصحة…» matches the doctrine but its exact wording was not found [MUN §2.7]. Product copy must not quote unverified wording.

## 4. The product opportunity

**(judgement, from the evidence above)** An Arabic-first, private, mobile-first tool for **long-running asynchronous debates between people who already know each other**, built on the munazara move set, whose headline view is **obligations, not structure**:

- "**عليك الرد في ٣ نقاط / ينتظر ردّ صاحبك في نقطتين**" (you owe 3 replies / your friend owes 2) as the first thing you see [ARG §6, MUN §7.4, UX §2, GitHub-review pattern UX].
- **Symmetry is mandatory (from the independent review, finding F1).** The classical burden rule only ever obliges the *claimant*. If the app counted only that, the friend who frames his side as doubt would never appear to owe anything, and the headline counter would become a hidden verdict — breaking the "never judge" rule. Therefore:
  1. The **opening stage records both people's standpoints** as theses (a *mixed dispute* in pragma-dialectical terms [ARG-18]); in a faith debate each friend is the claimant (المعلِّل) of his own thesis and the questioner (السائل) of the other's [MUN-02].
  2. Two separate, equally prominent signals per person: **"owes a reply"** (a challenge to your claim is unanswered — a burden) and **"your move"** (your challenge was answered — accept it, challenge further, or close the branch — an invitation, not a burden). Both counts are shown for both people.
  3. A branch where the last move is a reply and the challenger has gone quiet is shown as "waiting for X to respond or close", so it never stalls invisibly. **(judgement)**
- **(judgement)** Unanswered points stay prominent and never fade with time (adapted from a within-round norm of the WUDC manual [ARG-24]); silence is never counted as concession (a design proposal in ARG §3, where Carneades leaves it open).
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
- **Performance:** LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at p75; mid-range Android baseline; `content-visibility: auto` before virtualisation [UX §8]. The ~75–100 KiB JS budget in UX §8 assumes a mostly-HTML site; this is a client-rendered app that must decrypt in the browser, and a minimal Nostr subset alone is ~26.5 KB gzip [TECH-46]. **(judgement)** Working budget: ≤ 150 KiB gzip JS for first load, measured in CI, with the sync code loaded after first render.
- Touch targets ≥ 44 px, aiming for 48 [UX §1].

## 6. Recommended technical approach under the constraints

The constraints (free, zero setup by Ahmad, private, static, asynchronous over months) rule out most options. "Zero setup" is met for *using* the site; *deploying* it may still need one owner click to enable GitHub Pages (see `docs/DECISIONS.md` D-002). From `tech-feasibility.md`:

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
3. **Async transport: a "mailbox" on several public Nostr relays, chosen explicitly by the user.** Encrypted events are published to several relays, read from all of them, and republished by every client when a relay is missing them [TECH §3.1, §9]. Changes after the independent review:
   - **Per-device signing keys, not one key derived from the link (review F2).** With one shared key, anyone holding the link could send a NIP-09 deletion or a NIP-62 "request to vanish", after which relays must delete everything from that key and refuse it again — permanently blocking republication. With a key per device, a deletion can only affect that device's own copies; every other device keeps republishing what it holds under its own key. Relays are addressed by a tag derived from the room secret.
   - **Evidence is thin (review F4).** In one test from one location, 3 of 6 relays accepted our events and only 2 returned them [TECH-21]; retention "about a year" is inferred from missing old events, and why relays ignored new keys (anti-spam) was not investigated. So: a larger default relay list, per-relay health shown in the app, a user-editable relay list, and the design must work even if most relays drop data.
   - **Consent, not a buried opt-out (review F3).** When creating or joining a debate, the user picks a sync mode on one clear screen: "sync via public relays (encrypted; relays see timing and IP, never content)" or "manual only (send updates by link/file)". Relay operators' terms of service were not reviewed; this is listed as a gap.
4. **Manual fallback that always works:** "send update" as a link or a backup file over WhatsApp; the receiver merges by union [TECH §4].
5. **Optional live channel later:** WebRTC via Trystero when both are online [TECH §2.2].
6. **Optional backend adapter later:** Cloudflare Durable Objects first, Firebase Spark second; the adapter stores only ciphertext [TECH §5].

**Honest risks**
- **No zero-account channel guarantees storage for months.** No Nostr relay promises retention; one appears to keep about a year or less [TECH-21]. Data is lost only if *both* phones lose local data *and* every relay has pruned — so the app must push home-screen install, call `navigator.storage.persist()`, and prompt for backup files [TECH §7].
- **iOS Safari deletes script-writable storage after 7 days of Safari use without user interaction (a tap or click) on the site**, unless the site is installed to the home screen [TECH-13]. For a debate that rests for weeks with an iPhone user who has not installed the app, local data may be gone; recovery then depends on the other person's device and on relays. **(judgement)** The app must show "last backed up" and prompt both install and backup.
- **Relays are third parties.** They see ciphertext, timing, size and IP addresses, never content [TECH-17]. **(judgement)** No analytics or trackers are used, but relay sync is *not* "nothing leaves your phone", and the product must never claim that; the sync-mode screen and the privacy note say exactly what each mode sends where.
- **The link is the key.** Anyone the link is forwarded to can read and write [TECH §6]. The link also sits in WhatsApp chats and in WhatsApp cloud backups, which are not end-to-end encrypted unless the user enables it (review F7). Per-participant signing keys inside the ciphertext prevent impersonation; there is **no revocation** without moving the debate to a new link (a re-key) — the design must offer that. WhatsApp link previews are fetched by the sender's phone and the fragment is never sent in HTTP requests, so previews do not leak the key (review, checked).
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
- **Dialect.** FLEURS is read Modern Standard Arabic; accuracy of phone dictation on Gulf or Levantine dialect is unknown, and the WhatsApp-Android Arabic transcript claim rests on a third-party source [VOICE §2, §5]. Moving from voice notes to text is a real behaviour change whose acceptability is untested.
- **Design questions the research did not answer (to be settled in the PRD/ARCHITECTURE, review §Gaps):** identity across one person's several devices; revocation and re-keying after a link leaks; debates with more than two people; Arabic screen-reader behaviour; self-moderation between friends (no admin role); an open export format (JSON, optionally Argdown); relay operators' terms of service.

## 9. Recommendation in one paragraph

Build an Arabic-first PWA whose core model is the munazara move set, **in two tiers**: a short everyday menu in plain Arabic (state a claim, give a reason, ask what you mean, ask for proof, object, concede, withdraw) where each button carries the classical move underneath, and the finer classical moves (refutation with witness, counter-proof by inversion, ask for source, definition objections, concede-for-argument's-sake, concede-but-irrelevant) one tap away under "more". A reply's type can be corrected later by its author, so people can post first and classify later [ARG §2]. Roles are per thesis, both people's standpoints are recorded at the start, and the app shows, symmetrically for both people, who owes a reply and whose move it is. The headline view is each person's obligations; the main navigation is a focus view, not a map; nothing is scored. Data lives encrypted on each device as an event log, syncs through an encrypted mailbox on several public Nostr relays, and always has a manual link/file fallback; a free backend adapter can be plugged in later. Voice is text-plus-dictation in v1, with honest privacy notes.

## 10. Review resolution log

Independent review: `REVIEW-synthesis.md`. Every finding was evaluated against the notes; none was rejected.

| Finding | Severity | Resolution |
|---|---|---|
| F1 one-sided "who owes" | Critical | §4: both standpoints recorded; symmetric "owes a reply" + "your move"; no invisible stalls. |
| F2 shared signing key enables NIP-09/NIP-62 wipe | Critical | §6: per-device signing keys; every device republishes under its own key. |
| F3 relays on by default, ToS unchecked | Important | §6: explicit sync-mode choice at create/join; ToS listed as gap (§8). |
| F4 thin relay evidence | Important | §6: stated plainly; larger editable relay list; health screen; design tolerates loss. |
| F5 durability overstated for iOS | Important | §6: corrected WebKit rule (interaction, not visit); "last backed up" + prompts. |
| F6 move-set contradiction; post-first dropped | Important | §9: two-tier move set; type correctable later. |
| F7 link leaks, revocation, devices, WhatsApp backups | Important | §6 risks + §8 design questions; re-key required in design. |
| F8 JS budget unrealistic | Important | §5: ≤150 KiB gzip working budget, measured in CI. |
| F9–F17 | Minor | Wording and qualifiers corrected in §1–§3, §4, §6, §8. |
