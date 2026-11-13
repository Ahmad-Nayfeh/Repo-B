# Argumentation Theory for the Debate Data Model and Rules

Research note for an Arabic-first, mobile-first site where two people (or a small group) hold structured debates that today happen as WhatsApp voice notes. This note covers the theory behind the **data model** (node and link types, statuses) and the **rules** (fair play, who owes a reply, concessions, closure).

Conventions: citations are `[ARG-NN]` and are listed under **Sources**. "(unverified)" marks a detail I could not confirm in a primary source during this research. Sentences labelled "Interpretation" are my own design inferences, not claims made by the sources.

---

## 1. Toulmin model

### Key findings
- Stephen Toulmin's *The Uses of Argument* (1958; updated Cambridge edition 2003) argued that real arguments are not well captured by formal deductive logic. It became a founding text for informal logic, and it has had wide influence in rhetoric, speech communication, critical-thinking teaching and computer science [ARG-01][ARG-02].
- The "Toulmin layout" adds **warrant, backing and rebuttal** to the bare premise-to-conclusion model [ARG-03]. In the usual reading of the book:
  - **Claim**: the conclusion.
  - **Data / grounds**: the facts offered for it.
  - **Warrant**: the general licence for moving from data to claim. Wikipedia's argument-map article describes it as "the reasons behind the inference" [ARG-04].
  - **Backing**: support for the warrant. It is field-dependent, so legal, scientific and theological backings differ [ARG-03].
  - **Qualifier**: a modal such as "probably" or "presumably".
  - **Rebuttal**: the conditions of exception under which the warrant does not apply.
- **What it adds.** It makes the hidden inferential step (the warrant) explicit. It also builds in defeasibility: Verheij calls the rebuttal element the main departure from standard logic [ARG-03].
- **Known limits.**
  1. Toulmin gave no evaluation criterion comparable to validity. Verheij calls this a gap that Toulmin "did not discuss at all", and he adds a dialectical evaluation with three statuses: justified, unevaluated and defeated [ARG-03].
  2. Scholars disagree on what a warrant is and how to identify it. Teaching literature reports that warrants are so hard for students to find that teachers often skip them [ARG-05].
  3. The layout describes **one arguer's single argument**. It has no notion of turns, of who said what, or of rebuttals of rebuttals; a commentary on Verheij notes that his treatment covers only a first level of defeat [ARG-03].
  Interpretation: the layout is a micro-structure for a single node, not a model of a two-person debate.

### Implications for the product
- Use Toulmin **inside a node, optionally**. Let an argument carry an optional "because (grounds)" field, an optional "assumed rule (warrant)" field and a qualifier picker (certainly / probably / possibly). Never require users to fill in a warrant, because even trained students struggle with it [ARG-05].
- Make "**challenge the hidden assumption**" a first-class move. An opponent who attacks the warrant rather than the data should be able to pin it as an explicit, attackable node. This also maps onto pragma-dialectics' unexpressed-premise rule (§5).
- Keep the qualifier visible. "Probably" and "certainly" set different burdens, and stating them stops a disagreement from turning into a strawman of a stronger claim than the one actually made.
- The model for the whole debate must come from dialogue theory (§5–6), not from Toulmin.

---

## 2. IBIS (Kunz & Rittel; gIBIS; Compendium)

### Key findings
- IBIS (Issue-Based Information System) was introduced by Werner Kunz and Horst Rittel in a 1970 Berkeley working paper, "Issues as elements of information systems". It was meant for coordinating and planning political decisions on "wicked problems" [ARG-06].
- **Node types**: *issues* (questions), *positions* (candidate answers) and *arguments* (pro or con a position).
- **Link grammar**: issues can attach to any node; positions attach only to issues; arguments attach to positions, not to questions [ARG-06]. New issues can appear at any point.
- **gIBIS** (Conklin & Begeman, *ACM TOIS* 6(4):303–331, 1988) was a graphical hypertext implementation for team design deliberation [ARG-07]. The authors reported early on that "the IBIS method is still incomplete", while the match between tool and method was good [ARG-07].
- **Lessons from long-term use.** A 2003 retrospective, "15 years on from gIBIS", asks why many hypertext design-rationale systems *failed to be adopted*. It traces the failure to the need for "hypertext literacy" and proposes **Compendium**, used with a human facilitator ("dialogue mapping"), as the answer to those learning and adoption problems [ARG-08]. Dialogue mapping is described as non-directive: a facilitator maps the conversation live on a shared screen, and practitioners report less redundancy and digression [ARG-06].

### Implications for the product
- IBIS's main lesson is to **separate the question from the answers**. Debates about faith often stall because people argue past each other on different questions ("Does God exist?" versus "Is belief rational without proof?" versus "Is reason authoritative?"). An explicit **Question/Issue** node type lets the parties agree which question a sub-thread is about.
- A small, fixed **link grammar** (what may attach to what) keeps the map readable. Interpretation: the grammar should be enforced softly, with suggestions rather than errors.
- The adoption lesson is serious. Structured-argument tools fail when users must formalise as they speak. Since users will often dictate voice notes, the product should let them **post first and classify later**, with a "needs mapping" queue that either party (or an assistant feature) can sort. This digital stand-in for a facilitator is the product's equivalent of dialogue mapping [ARG-08].

---

## 3. Walton's argumentation schemes and critical questions

### Key findings
- Walton, Reed and Macagno's *Argumentation Schemes* (Cambridge University Press, 2008) is the standard reference. It gives a compendium of **96 schemes**, each with a set of **critical questions (CQs)** that an opponent may raise [ARG-09][ARG-11].
- Example from SEP, the argument-from-authority scheme: *A is an authority in domain D; A says T; T is within D; therefore T*. Its six CQs are: How credible is A? Is A an authority in D? What did A assert that implies T? Is A trustworthy? Is T consistent with what other experts assert? Is A's assertion based on evidence? [ARG-09]
- **CQs and burden of proof.** The Carneades model (Gordon, Prakken & Walton, *Artificial Intelligence*, 2007) points out that critical questions differ in their effect on the burden of proof:
  - For some questions, "merely asking the question is enough to shift the burden of proof back" to the arguer. These are modelled as **assumptions**.
  - For others, "the party who raised the question also has the burden of answering it", so the challenger must bring evidence. These are modelled as **exceptions**.
  - **Ordinary premises** must always be supported once questioned. [ARG-10]
- The same paper names two competing theories: **shifting-burden** (asking a CQ alone makes the argument default until it is answered) and **backup-evidence** (the CQ must be backed by evidence first). It also raises the dialogical question of whether **silence implies consent** to a premise [ARG-10].
- Following Verheij, CQs play four roles: questioning a premise, pointing to an exception, setting conditions for proper use, or pointing to a counter-argument [ARG-10].
- **Criticism.** Lumer (*Informal Logic*, 2022) questions the epistemological basis of Walton's schemes [ARG-11] (details unverified; I saw only the abstract-level description).

### Implications for the product
- **Challenge menu.** When a user tags an argument with a scheme ("appeal to authority", "argument from analogy", "cause to effect", "from consequences", "from sign"), the opponent's reply button can offer that scheme's CQs as one-tap challenges, for example "Is this person an authority *in this field*?". This turns vague "I disagree" replies into precise ones.
- Label each CQ with its **burden type**:
  - "**Asks for an answer**" (assumption-type): asking puts the ball in the arguer's court.
  - "**Needs your evidence**" (exception-type): the challenger must attach a reason or source, or the challenge is shown as a *bare doubt* that creates no obligation.
  This answers the core "who owes a reply?" question in a principled way [ARG-10].
- Start with 6–10 schemes that are common in religious and philosophical debate, such as authority/testimony, analogy, cause to effect, consequences, sign, best explanation and popular opinion. Do not ship all 96.
- Make the "silence" policy explicit in the rules. For example: an unanswered challenge after N days is shown as *unanswered*, never as *conceded*. Silence ≠ consent unless the parties opt in.

---

## 4. Dung's abstract argumentation, labellings, bipolar frameworks

### Key findings
- Dung (1995, *Artificial Intelligence* 77(2):321–357) models a debate as a directed graph of **arguments** and **attacks** and defines which sets of arguments are acceptable [ARG-12][ARG-01]. Arguments form networks of attack and defence; an argument is *defended* if each of its attackers is itself attacked by an accepted argument.
- **Labellings** (Caminada 2006) give each argument one label: **in**, **out** or **undec**. In a reinstatement labelling, an argument is *in* iff all its attackers are *out*, and *out* iff at least one attacker is *in* [ARG-13].
  - The labelling with **maximal undec** (equivalently, minimal *in*) corresponds to the **grounded extension**, which is unique [ARG-13].
  - Labellings with **no undec** correspond to stable extensions [ARG-13].
  - Preferred and other semantics can give several competing labellings; Baroni, Caminada & Giacomin (2011) survey them [ARG-14].
- **Computability.** The grounded labelling can be computed by straightforward propagation: label unattacked arguments *in*, label everything they attack *out*, and repeat until nothing changes. Whatever remains is *undec*. (This is the standard least-fixed-point construction; the exact algorithm was not taken from a single source here.)
- **Mutual attack.** Where A attacks B and B attacks A, the grounded labelling marks both *undec* [ARG-13]. This is the normal state of a real two-person debate.
- **Bipolar frameworks** (Cayrol & Lagasquie-Schiex, ECSQARU 2005) add a **support** relation independent of attack and derive indirect ("supported" and "secondary") attacks from chains of support plus attack [ARG-15].
- **Empirical caution.**
  - Cramer & Guillaume (COMMA 2018) found that preferred and CF2 semantics predicted human judgements better than grounded [ARG-16].
  - A 2019 follow-up with more complex frameworks found grounded and CF2 to be the best predictors, with some participants using a simpler, grounded-like strategy [ARG-17].
  - In their pilot studies, attacks that Rahwan et al. intended as one-directional were perceived as one-directional by only **17% of students and 44% of formal-argumentation experts** [ARG-16]. **Even the direction of an attack is often contested.**

### Can grounded labelling compute debate status automatically? Dangers
- **Technically yes.** Given the map's attack edges, grounded labelling gives a cheap, deterministic and unique status for every node.
- **But it computes structure, not truth or strength.**
  1. Garbage in, garbage out: one weak or off-topic "attack" knocks a node *out* exactly as a decisive one does.
  2. Users will game it by posting many cheap objections.
  3. The direction and existence of attacks is itself disputed [ARG-16], so the graph encodes one party's view of the debate.
  4. Real debates are full of mutual attacks, so most important nodes end up *undec*. That is honest, but it is easily misread as "nobody is right".
  5. A banner saying "X is winning" would push the owner's friends to play to the algorithm and erode the cooperative, critical-discussion ideal (§5).
- The SEP warns more generally that formal and informal approaches answer different questions [ARG-01]. Interpretation: an attack graph has no notion of evidence weight, of qualifiers, or of concessions made for the sake of argument.

### Implications for the product
- Use labelling **only for "dialectical state"**, never for "who wins":
  - **standing (unchallenged)**: no pending attack.
  - **challenged, awaiting reply**: an attack with no reply.
  - **answered**: every attacker has been replied to.
  - **contested**: a mutual or unresolved cycle.
  In UI copy, call these "open" or "settled for now", not "true" or "false". Explain on the page that the status reflects **replies, not correctness**.
- Store **support** and **attack** as separate edge types (bipolar), and also store **edge subtype**: rebut (denies the conclusion), undercut (denies the inference) and undermine (denies a premise). These distinctions come from the defeasible-reasoning literature summarised in [ARG-10] (Pollock's undercutters).
- Let the *target* of an attack **dispute that it is an attack at all** ("this doesn't address my point"). This links to the standpoint and relevance rules (§5).
- Never show a single score for the whole debate. The headline view should be a list of **open obligations per person**.

---

## 5. Pragma-dialectics (van Eemeren & Grootendorst)

### Key findings
- Pragma-dialectics was developed from the late 1970s by Frans van Eemeren and Rob Grootendorst at the University of Amsterdam. It treats argumentation as a discourse activity aimed at "the reasonable resolution of a difference of opinion" [ARG-01][ARG-18].
- **Roles.** The **protagonist** advances and defends a standpoint; the **antagonist** casts doubt on it or opposes it. In a mixed dispute, each party is protagonist of their own standpoint.
- **Four stages** of a critical discussion [ARG-18]:
  1. **Confrontation**: the parties establish that they disagree.
  2. **Opening**: they agree to resolve it and fix the rules and the shared starting points (agreed premises).
  3. **Argumentation**: the protagonist defends; the antagonist raises doubts and objections.
  4. **Concluding**: they assess how far the difference has been resolved and in whose favour.
- **The ten rules ("ten commandments")** are a simplified version of a more technical set of 15 rules [ARG-18]. Wording follows van Eemeren, Grootendorst & Snoeck Henkemans (2002), pp. 182–183, as quoted in [ARG-18]. Wikipedia shows only the opening clause of rules 5, 6, 7, 9 and 10; the bracketed completions are the standard textbook wording as commonly quoted (unverified against the book itself).
  1. **Freedom rule**: Parties must not prevent each other from advancing standpoints or from casting doubt on standpoints.
  2. **Burden-of-proof rule**: A party that advances a standpoint is obliged to defend it if asked by the other party to do so.
  3. **Standpoint rule**: A party's attack on a standpoint must relate to the standpoint that has indeed been advanced by the other party.
  4. **Relevance rule**: A party may defend a standpoint only by advancing argumentation relating to that standpoint.
  5. **Unexpressed-premise rule**: A party may not deny a premise that he or she has left implicit [nor falsely attribute an unexpressed premise to the other party].
  6. **Starting-point rule**: A party may not falsely present a premise as an accepted starting point [nor deny a premise representing an accepted starting point].
  7. **Argument-scheme rule**: A party may not regard a standpoint as conclusively defended if the defence does not take place [by means of an appropriate argument scheme that is correctly applied].
  8. **Validity rule**: A party may only use arguments that are logically valid or capable of being made logically valid [by making unexpressed premises explicit].
  9. **Closure rule**: A failed defence of a standpoint must result in the party that put it forward retracting it [and a conclusive defence must result in the other party retracting its doubts].
  10. **Usage rule**: A party must not use formulations that are insufficiently clear or confusingly ambiguous [and must interpret the other party's formulations as carefully and accurately as possible].
- **Fallacies as rule violations.** On this view, every violation of a rule is a fallacy, which departs from Hamblin's "seems valid but isn't" definition [ARG-19][ARG-09]. Example: *evading the burden of proof* violates rule 2 [ARG-19]. Mapping familiar fallacies onto rules (interpretation, consistent with [ARG-19]):
  - Straw man violates rule 3.
  - Red herring and irrelevant argument violate rule 4.
  - Shifting the burden violates rule 2.
  - Equivocation violates rule 10.
- **Empirical support.** Van Eemeren, Garssen & Meuffels (2009) report that ordinary arguers' reasonableness judgements match the pragma-dialectical norms "to a rather large degree". Only four rules were tested, the participants were mostly students, and Zenker criticises the averaging of ordinal ratings and the study's unclear theoretical role [ARG-20].

### Implications for the product
- Publish a short, gentle **"Fair play" charter** of ten one-line rules in Arabic, phrased positively. Each rule can be invoked with a **"point of order"** flag that is shown to the other side as a request, not an accusation. For example:
  - Rule 3 → "That's not quite what I said". Opens a "restate my position" request.
  - Rule 5 → "You're relying on an unstated assumption". Asks the arguer to make the hidden premise explicit as a node.
  - Rule 10 → "Define this term". Creates a **Definition** node (see §9). This directly addresses "terms drift".
- Model the **opening stage** explicitly. When a debate is created, it records the **main standpoint(s)**, **who is protagonist of what** (both, in a mixed dispute), **agreed starting points** (shared premises and accepted sources, such as whether scripture counts as evidence for both parties), and **definitions of key terms**. Later "starting point" disputes (rule 6) can then be checked against this list.
- The **burden-of-proof rule** gives the core obligation logic: whoever *advanced* a standpoint owes a defence once the other side *asks*. The interface should always show, per node, **who owes the next move**.
- The **closure rule** suggests a **concluding stage**: either party can propose "let's close this branch". The outcome is one of: retracted by A, doubt withdrawn by B, or agreed to disagree (recorded as open). Nothing is ever auto-closed.

---

## 6. Formal dialogue systems and commitment stores

### Key findings
- **Hamblin's *Fallacies* (1970)** founded *formal dialectic*, "the study of formal systems for conducting dialogues". Its rules include syntactic rules for what may be said next and **commitment stores** that "keep track of the commitments made at each turn by each speaker". Fallacies such as begging the question and many questions are explained as violations of these rules [ARG-23][ARG-01].
- **Walton & Krabbe, *Commitment in Dialogue* (SUNY Press, 1995)** classify dialogue types: **persuasion, inquiry, information-seeking, negotiation, deliberation, eristic** [ARG-22]. Walton holds that some fallacies arise from illicit shifts between dialogue types [ARG-19].
- Walton & Krabbe distinguish kinds of commitment [ARG-21]:
  - **assertions**, which carry a dialectical obligation to defend if challenged;
  - **concessions**, which carry no burden of defence;
  - **dark-side commitments**, which are hidden or veiled commitments that participants bring to the dialogue, often unknowingly.
  Their Permissive Persuasion Dialogue (PPD) also has a **resolve** move for demanding resolution of inconsistent commitments, and **separate retraction moves** for assertions and for concessions [ARG-21].
- **Prakken's review (2006)** gives the standard **speech-act reply table** for persuasion dialogue [ARG-21]:

  | Move | Typical replies |
  |---|---|
  | claim φ | why φ; claim ¬φ; concede φ |
  | why φ | φ since S (give reasons); retract φ |
  | φ since S | why ψ (for a premise ψ in S); concede ψ; (counter-argument, in argument-based systems) |
  | question φ | claim φ; claim ¬φ; retract φ |
  | concede φ / retract φ | (no reply required) |

  Commitment update rules: *concede φ* adds φ to the speaker's commitments, and *retract φ* removes it [ARG-21].
- Prakken notes that strictly the only dialectical obligation is to make *a* legal move on one's turn. The loose sense ("defend or retract when challenged") is best systematised through the reply table. Some protocols let a challenge be ignored or postponed when an answer would be irrelevant [ARG-21].
- **Outcome.** In two-party pure persuasion, the proponent "wins" when the opponent concedes the main claim, and the opponent "wins" when the proponent retracts it [ARG-21]. Outcome is therefore defined by **participants' own commitments**, not by a third-party evaluation.
- **Protocol design choices** [ARG-21]:
  - *Unique-reply* versus *multiple-reply* (may a move get several answers?).
  - *Unique-move* versus *multiple-move* (several moves per turn?).
  - Coherence versus rationality enforcement. One school says protocols should only enforce dialogue coherence; another says they should also enforce agents' rationality.
  - Mackenzie's system without a reply structure allows unfocused dialogues [ARG-21]. This is an argument *for* explicit reply links.
- Enthymemes (incomplete arguments) are allowed in several systems, but moving one commits the speaker to the implicit "premises → conclusion" link [ARG-21]. This is the formal counterpart of pragma-dialectics' unexpressed-premise rule.

### Implications for the product
- **Data model = commitment stores + reply graph.** Each participant has a visible **commitment list** with three kinds of entry:
  - *Asserted*: my claims, which I must defend if asked.
  - *Conceded*: points I granted, which I don't have to defend.
  - *Retracted*: points I withdrew, kept in history and struck through.
  Use separate verbs for **"I concede"** and **"I withdraw my claim"**, because they differ [ARG-21].
- **Move types** should follow the reply table: *Claim*, *Ask why* (challenge), *Give reasons*, *Counter-claim*, *Concede*, *Withdraw*, *Ask a question/clarify*, *Define a term*. Every move must declare **what it replies to**, which fixes the "points get lost" problem.
- **"Who owes a reply" rule** (derived): a node creates an obligation for its author when the other party has made a *why* or *challenge* reply to it and the author has not yet given reasons, conceded or withdrawn. The interface shows a per-person **"Your turn on N points"** inbox. Bare-doubt versus evidence-backed challenges should follow §3.
- **Concede for the sake of argument.** Offer a distinct "assume for now" option (interpretation). It resembles conceding an argument's inference while keeping the right to challenge its premises [ARG-21].
- **Consistency check (gentle).** If A's commitments look contradictory, B can raise a **"resolve"** request (from Mackenzie/PPD [ARG-21]): "Earlier you granted X; now you claim not-X. Which stands?"
- **Dialogue-type label.** Allow a branch to be tagged *persuasion* (the default), *inquiry* ("let's both find out") or *information-seeking* ("I just want to understand your view"). Clarification questions should **not** create a burden of defence. Shifting silently between types is a recognised source of fallacies [ARG-19].
- Allow **multiple replies** but show them grouped, and allow **postponement** with a visible "deferred" status rather than leaving the point silently unanswered [ARG-21].

---

## 7. Competitive debate formats (useful bits only)

### Key findings (World Universities Debating Championships manual, British Parliamentary format) [ARG-24]
- **Points of Information (POIs)** are short (≤15-second) interjections from the opposing side during a speech, offered only outside the first and last "protected" minute. The speaker chooses whether to accept, and should accept at least one and ideally two. "POIs do not initiate a dialogue": after one is made, the questioner sits down. Repeatedly offering POIs ("barracking") is not allowed.
- **Engagement and clash.** Rebuttal is "any material that engages directly with arguments raised by the other side". **Unrebutted arguments stay standing**: "their unrebutted arguments are still as true in the context of the debate as they were when presented". Ignoring key arguments is a common reason for losing.
- **Burdens** "cannot be created simply by a team asserting that they exist". They come either from the motion itself or from the specific arguments a team chooses to make.
- **Judging** imagines an "ordinary intelligent voter" and warns judges against substituting their own analysis for the debaters'.

### Implications for the product
- **Point of Information equivalent**: a lightweight *quick question* that can be attached inline to the other person's latest message without taking a full turn. It is capped (for example, 2 open per turn) to prevent badgering, and it does not open a sub-debate unless promoted.
- **"Unanswered stays standing"** is a good public norm and supports the core feature: an unanswered argument should be visually prominent and should *not* fade with time.
- **Anti burden-inflation**: when someone says "you must prove X", the product asks them to link X to the standpoint or argument that creates that burden. Burdens can't just be asserted [ARG-24].

---

## 8. Empirical research on argument mapping and reasoning

### Key findings
- **Twardy (2004, *Teaching Philosophy* 27:2).** In a Monash course replicating Melbourne's approach and measuring pre/post gains on the California Critical Thinking Skills Test (CCTST), computer-assisted argument mapping produced gains "more than triple" those of other methods. A preprint reports an effect size of about **0.7 SD**, and an average of about **0.8** for van Gelder's own courses [ARG-25] (figures from search-result text of the preprint; the published version was not opened).
- **Alvarez Ortiz (2007)** was an unpublished Melbourne master's meta-analysis, "Does Philosophy Improve Critical Thinking Skills?".
  - Commonly summarised as finding gains of **~0.70 SD** for argument-mapping-based critical-thinking courses, about twice those of standard critical-thinking courses [ARG-04].
  - Secondary reports also cite **0.78 SD per semester** for philosophy courses with heavy argument-mapping practice, and about **0.26 SD per semester** for philosophy students against 0.12 for others (via Huber & Kuncel) [ARG-26].
  - Caveats [ARG-26]: unpublished; small samples (individual studies of roughly 26–77 participants, per a commenter); overlapping confidence intervals; no randomisation; the author herself suggested some differences may be noise. Several of these numbers come from blog reporting (unverified against the thesis).
- **Dwyer, Hogan & Stewart (2012, *Metacognition and Learning* 7(3):219–244).** 74 psychology undergraduates were assigned to an argument-mapping e-learning critical-thinking course or to a no-instruction control for 8 weeks and tested with the Halpern Critical Thinking Assessment. The training group improved more on overall critical thinking and on argument analysis. Motivation and need for cognition did not change [ARG-27]. (Effect sizes not verified here.)
- **Dwyer, Hogan & Stewart (2013, *Thinking Skills and Creativity* 8:11–24)** ran three experiments. Reading and building argument maps improved **immediate recall** of arguments compared with outlining, summarising or reading text [ARG-28]. An earlier 2010 study of about 400 undergraduates found map-readers did better on **memory but not comprehension** [ARG-28] (from search summary).
- **Cullen, Fan, van der Brugge & Elga (2018, *npj Science of Learning*).** In a quasi-experimental Princeton seminar (105 seminar students, 56 controls), students improved more on LSAT Logical Reasoning (**d = 0.71**), and blind-graded essays favoured them (**d = 0.87**) [ARG-29]. Limitations the authors state: no randomisation; a convenience control group; argument visualisation confounded with an intensive, interactive course; an essay subsample of only 15 vs 44 with a single grader. The paper also notes that earlier effects were "three times smaller with the LSAT" than with the CCTST, and that many earlier studies lacked control conditions [ARG-29].
- **Benchmark.** Abrami et al.'s 2008 meta-analysis of critical-thinking instruction (117 studies, 20,698 participants) found an average **g ≈ 0.34**, with high heterogeneity [ARG-30]. Argument-mapping figures should be read against this.
- **Limits and critiques.**
  - Many headline results come from the developers of Reason!/Rationale (van Gelder's Melbourne group) or close collaborators [ARG-31][ARG-25].
  - Samples are mostly university students.
  - Outcome measures are generic critical-thinking tests, and gains shrink on harder transfer measures such as the LSAT [ARG-29].
  - Building maps can raise cognitive load and needs substantial coaching (Nussbaum 2012, via [ARG-04]).
  - A 2025 scoping review still calls for more experimental validation [ARG-32].
  - I found **no study of argument mapping in informal, long-running peer debates** such as the target use case, and none with Arabic-speaking users.

### Implications for the product
- The evidence supports modest claims: maps help people **see and remember argument structure**, and argument-mapping-based teaching is associated with moderate-to-large critical-thinking gains in student samples. Do **not** market the product as "makes you think better". Present it as "keeps track of the debate".
- The cognitive-load finding favours **automatic structure from replies** (every message must say what it answers), not user-drawn maps. Offer both a map view and a simpler threaded "open points" view, and make the threaded view the default on mobile.
- Interpretation: if the team wants evidence, a small in-product study is possible. For example, compare the rate of unanswered points, or the time to resolve a branch, between WhatsApp-style threads and the structured mode.

---

## 9. Glossary: named fallacies and distinctions

Definitions are paraphrased from the cited sources. The IEP "Fallacies" entry (Dowden) [ARG-36] was down (database error) during this research, so I used SEP entries where possible.

| Term | Short definition | Source |
|---|---|---|
| **Fallacy (standard definition)** | Hamblin: an argument that seems valid but is not. Pragma-dialectics: any violation of a critical-discussion rule. | [ARG-19] |
| **Begging the question (petitio principii)** | The premise restates the conclusion, or assumes the very point in dispute without argument. | [ARG-19] |
| **Equivocation** | A term is used twice with different meanings, so the reasoning loses continuity (SEP's example is "the end of life"). Violates the usage rule. | [ARG-19] |
| **Straw man** | Distorting the opponent's view into an easier target and treating the original as refuted. Violates the standpoint rule. | [ARG-19] |
| **Ad hominem (abusive, circumstantial, tu quoque)** | Attacking the arguer rather than the argument. SEP notes these forms are *sometimes fallacious and sometimes fair*, for example when legitimately pointing out an inconsistency in the opponent's own commitments. | [ARG-19] |
| **Argument from ignorance (ad ignorantiam)** | Inferring that a claim is true because there is no evidence against it, or false because there is none for it. | [ARG-19] |
| **Evading / shifting the burden of proof** | Refusing to defend one's own standpoint, or demanding that the other side disprove it. Violates rule 2. | [ARG-19][ARG-18] |
| **Appeal to authority (ad verecundiam)** | A misapplied argument from expert opinion, for example when the source is not an expert in the relevant field. Check with the scheme's critical questions. | [ARG-19][ARG-09] |
| **Many / complex questions** | A question that presupposes something the other person has not granted. Hamblin explains it as a dialogue-rule violation. | [ARG-23][ARG-19] |
| **Slippery slope** | Listed by Walton among informal paralogisms (definition not given in the SEP text read). | [ARG-19] |
| **Genetic fallacy** | Judging a claim true or false by its origin rather than its justification. Example: rejecting chemistry because it grew out of alchemy. Not covered in SEP "Fallacies"; open-textbook source. | [ARG-37] |
| **Necessary vs sufficient condition** | B is *necessary* for A if A cannot hold without B; A is *sufficient* for B if A guarantees B. The standard theory treats these as converses, but SEP warns that natural language does not always respect this. | [ARG-33] |
| **Epistemic vs ontological claim** | Epistemology studies knowledge and justified belief, a "kind of cognitive success" (*how do we know / are we justified?*). Ontology, as a first approximation, studies *what exists*. Example: "God exists" is ontological; "belief in God is justified without proof" is epistemic. Conflating the two is a common drift in faith debates. | [ARG-35][ARG-34] |
| **Rebut / undercut / undermine** | Attack the conclusion / the inference link / a premise. Pollock-style undercutters break the premise–conclusion connection. | [ARG-10] |
| **Assertion vs concession vs retraction** | An assertion carries a burden to defend; a concession grants a point without that burden; a retraction withdraws a commitment. | [ARG-21] |
| **Burden of proof vs burden of production** | Carneades distinguishes the burden of *persuasion* from the burden of *producing evidence*; each can rest on a different party. | [ARG-10] |
| **Protagonist / antagonist** | The defender of a standpoint and the one who doubts or opposes it. | [ARG-18] |
| **Linked vs convergent premises** | Premises that work only together, versus independent reasons. Matters for the map, since attacking one linked premise defeats the whole group. | [ARG-09] |

### Implications for the product
- Ship a **bilingual glossary** (Arabic term + English/Latin name + one-line definition + source link). Let users attach a named fallacy to a challenge, but frame it as a **question** ("Is this an equivocation on 'reason'?"). SEP stresses that many "fallacies" are context-dependent and sometimes legitimate [ARG-19].
- Prefer **rule-based labels** (rules 1–10) over insult-like fallacy names when flagging. Pragma-dialectics provides this mapping [ARG-19].
- Add an **"epistemic or ontological?" tag** on claims. In debates about God's existence and the authority of reason, many cross-purpose exchanges come from mixing "X is the case" with "we can know or are justified in believing X".

---

## Summary of design recommendations (cross-cutting)
1. **Nodes**: Question/Issue, Claim (standpoint), Reason, Objection, Definition, Agreed Starting Point, Clarifying Question. Optional Toulmin fields: grounds, warrant, qualifier.
2. **Edges**: replies-to (mandatory), supports, attacks (subtype rebut/undercut/undermine), answers-question, defines-term.
3. **Commitments per person**: asserted / conceded / withdrawn / assumed-for-argument.
4. **Obligation engine**: derived from the reply table and burden rules. It shows "who owes what" and distinguishes "asks for answer" challenges from "needs your evidence" challenges.
5. **Status labels**: grounded-labelling-style statuses (open / answered / contested), explicitly *not* "winning/losing".
6. **Fair-play charter**: the ten pragma-dialectical rules, rewritten in Arabic as polite "point of order" requests.
7. **Closure**: only by the parties' own retraction, concession or "agree to disagree" record.

---

## Sources

**[ARG-01]** Argument and Argumentation — *Stanford Encyclopedia of Philosophy*, first published 2021 — https://plato.stanford.edu/entries/argument/ — Toulmin's influence; Dung's attack networks; Hamblin's dialectical revival; pragma-dialectics' aim of reasonable resolution.

**[ARG-02]** The Uses of Argument, updated edition (copyright page) — Stephen E. Toulmin, Cambridge University Press, 1958 / 2003 — https://assets.cambridge.org/97805218/27485/copyright/9780521827485_copyright.pdf — Bibliographic details of Toulmin's book.

**[ARG-03]** Evaluating Arguments Based on Toulmin's Scheme — Bart Verheij, *Argumentation* 19:347–371, 2005 — https://www.ai.rug.nl/~verheij/publications/toulmin2005.htm — Warrant/backing/rebuttal; the missing evaluation criterion; justified/unevaluated/defeated statuses; field-dependent backing.

**[ARG-04]** Argument map — Wikipedia, accessed 2026 — https://en.wikipedia.org/wiki/Argument_map — Secondary summary of Alvarez Ortiz (2007) (~0.70 SD); Nussbaum (2012) cognitive-load limitation; warrant gloss. Secondary source.

**[ARG-05]** Toulmin's Rhetorical Logic: What's the Warrant for Warrants? — Project MUSE article (seen in search results only) — https://muse.jhu.edu/article/233239 — Lack of agreement on what a warrant is; teachers skipping warrants (search snippet; not opened).

**[ARG-06]** Issue-based information system — Wikipedia, accessed 2026 — https://en.wikipedia.org/wiki/Issue-based_information_system — Kunz & Rittel 1970 origin; IBIS node types and link grammar; dialogue mapping; Compendium.

**[ARG-07]** gIBIS: a hypertext tool for exploratory policy discussion — Jeff Conklin & Michael L. Begeman, *ACM Trans. Inf. Syst.* 6(4):303–331, 1988 (dblp record) — https://dblp.org/rec/journals/tois/ConklinB88 — gIBIS design and the early finding that "the IBIS method is still incomplete" (abstract via search results).

**[ARG-08]** Facilitated hypertext for collective sensemaking: 15 years on from gIBIS — Conklin, Selvin, Buckingham Shum & Sierhuis, LAP'03, 2003 (Open University repository) — https://oro.open.ac.uk/28675 — Adoption failures of design-rationale tools; hypertext literacy; Compendium and facilitation (abstract-level).

**[ARG-09]** Informal Logic — *Stanford Encyclopedia of Philosophy*, first published 1996, revised 2026 — https://plato.stanford.edu/entries/logic-informal/ — Walton, Reed & Macagno's 96 schemes; authority scheme and its six critical questions; diagramming with linked/convergent premises; fallacies as rule violations in pragma-dialectics.

**[ARG-10]** The Carneades Model of Argument and Burden of Proof — Thomas F. Gordon, Henry Prakken & Douglas Walton, *Artificial Intelligence* 171, 2007 (author preprint) — https://tfgordon.github.io/publications/GordonPrakkenWalton2007b.pdf — Critical questions and burden shifting; assumptions vs exceptions vs ordinary premises; shifting-burden vs backup-evidence theories; silence and consent; Verheij's four roles of CQs; undercutters.

**[ARG-11]** An Epistemological Appraisal of Walton's Argument Schemes — Christoph Lumer, *Informal Logic*, 2022 — https://philarchive.org/rec/LUMAEA — Critique of the schemes approach; confirms Walton, Reed & Macagno 2008 as the standard exposition (search-result level).

**[ARG-12]** On the acceptability of arguments and its fundamental role in nonmonotonic reasoning, logic programming and n-person games — P. M. Dung, *Artificial Intelligence* 77(2):321–357, 1995 — https://doi.org/10.1016/0004-3702(94)00041-X — Abstract argumentation frameworks (bibliographic details via search results).

**[ARG-13]** On the Issue of Reinstatement in Argumentation — Martin Caminada, Utrecht technical report UU-CS-2006-023, 2006 (JELIA 2006) — https://ics-archive.science.uu.nl/research/techreps/repo/CS-2006/2006-023.pdf — in/out/undec labelling; maximal-undec = grounded; empty-undec = stable; grounded extension is unique.

**[ARG-14]** An introduction to argumentation semantics — P. Baroni, M. Caminada & M. Giacomin, *Knowledge Engineering Review* 26(4):365–410, 2011 — https://pietro-baroni.unibs.it/paperpages/RI-26.htm — Survey of grounded, preferred, stable and other semantics (abstract-level).

**[ARG-15]** On the Acceptability of Arguments in Bipolar Argumentation Frameworks — C. Cayrol & M.-C. Lagasquie-Schiex, ECSQARU 2005, LNCS 3571:378–389 — https://doi.org/10.1007/11518655_33 — Support plus attack; supported and secondary defeat (search-result level).

**[ARG-16]** Empirical Cognitive Study on Abstract Argumentation Semantics — Marcos Cramer & Mathieu Guillaume, COMMA 2018 — https://icr.uni.lu/mcramer/downloads/2018_COMMA_empirical.pdf — Preferred/CF2 predict humans better than grounded; low agreement on attack directionality (17% of students, 44% of experts).

**[ARG-17]** Technical report of "Empirical Study on Human Evaluation of Complex Argumentation Frameworks" — Marcos Cramer & Mathieu Guillaume, arXiv, 2019 — https://arxiv.org/abs/1902.10552 — Grounded and CF2 as best predictors for more complex frameworks (search-result level).

**[ARG-18]** Pragma-dialectics — Wikipedia, accessed 2026 — https://en.wikipedia.org/wiki/Pragma-dialectics — Ten rules (citing van Eemeren, Grootendorst & Snoeck Henkemans 2002, pp. 182–183), four stages, 15-rule origin. Secondary source; completions of rules 5–7, 9 and 10 unverified against the book.

**[ARG-19]** Fallacies — Hans V. Hansen, *Stanford Encyclopedia of Philosophy*, current revision — https://plato.stanford.edu/entries/fallacies/ — Hamblin's standard definition; pragma-dialectical and Walton views; definitions of begging the question, equivocation, straw man, ad hominem, ad ignorantiam; evading the burden of proof; Walton's sophisms and paralogisms.

**[ARG-20]** ISSA Proceedings 2010: Why Study the Overlap Between "Ought" and "Is" Anyways? — Frank Zenker, Rozenberg Quarterly, 2010 — https://rozenbergquarterly.com/issa-proceedings-2010-why-study-the-overlap-between-ought-and-is-anyways-on-empirically-investigating-the-conventional-validity-of-the-pragma-dialectical-discuss/?print=pdf — Summary and critique of van Eemeren, Garssen & Meuffels (2009) on the conventional validity of the rules.

**[ARG-21]** Formal systems for persuasion dialogue — Henry Prakken, *Knowledge Engineering Review* 21:163–188, 2006 (author copy) — https://webspace.science.uu.nl/~prakk101/pubs/dgreview.pdf — Speech-act reply table; commitment update on concede/retract; win conditions in pure persuasion; loose dialectical obligations; reply/move protocol choices; Walton & Krabbe's PPD with assertions, concessions and dark-side commitments; enthymemes.

**[ARG-22]** Commitment in Dialogue: Basic Concepts of Interpersonal Reasoning — Douglas Walton & Erik C. W. Krabbe, SUNY Press, 1995 (publisher listing) — https://www.schweitzer-online.de/en/buch/Walton/Commitment-Dialogue/9780791425862/A3597658/ — The book and its six dialogue types (search-result level).

**[ARG-23]** C. L. Hamblin, *Fallacies* (1970), summary page — David Hitchcock, McMaster University — https://humanities.mcmaster.ca/~hitchckd/hamblin.htm — Formal dialectic; commitment stores; fallacies as dialogue-rule violations.

**[ARG-24]** The World Universities Debating Championships Debating and Judging Manual — WUDC (copy hosted by SSMU Debating Union) — https://debatingunion.ssmu.ca/wp-content/uploads/2023/10/WUDC-Debating-and-Judging-Manual.pdf — Points of Information rules; rebuttal and engagement ("unrebutted arguments" stand); how burdens arise; the ordinary intelligent voter.

**[ARG-25]** Argument Maps Improve Critical Thinking — Charles R. Twardy, *Teaching Philosophy* 27:2, 2004 (preprint at CogPrints) — https://web-archive.southampton.ac.uk/cogprints.org/3008/ — CCTST gains more than triple other methods; ~0.7 SD effect size and ~0.8 for van Gelder's courses (search-result text; page not opened).

**[ARG-26]** Does Philosophy Improve Critical Thinking? — Daily Nous, 2015 — https://dailynous.com/2015/10/22/does-philosophy-improve-critical-thinking/ — Secondary reporting of Alvarez Ortiz (2007) figures (0.78 SD, 0.26 vs 0.12) and their caveats. Blog-level source.

**[ARG-27]** An evaluation of argument mapping as a method of enhancing critical thinking performance in e-learning environments — C. P. Dwyer, M. J. Hogan & I. Stewart, *Metacognition and Learning* 7(3):219–244, 2012 (University of Galway record) — https://research.universityofgalway.ie/en/publications/an-evaluation-of-argument-mapping-as-a-method-of-enhancing-critic-6/ — 74 students, 8-week course, HCTA gains vs control.

**[ARG-28]** An examination of the effects of argument mapping on students' memory and comprehension performance — C. P. Dwyer, M. J. Hogan & I. Stewart, *Thinking Skills and Creativity* 8:11–24, 2013 (University of Galway record) — https://research.universityofgalway.ie/en/publications/an-examination-of-the-effects-of-argument-mapping-on-students-mem-6/ — Recall benefits; the 2010 study's memory-but-not-comprehension result (search-result level).

**[ARG-29]** Improving analytical reasoning and argument understanding: a quasi-experimental field study of argument visualization — S. Cullen, J. Fan, E. van der Brugge & A. Elga, *npj Science of Learning* 3:21, 2018 — https://pmc.ncbi.nlm.nih.gov/articles/PMC6279835/ — d = 0.71 (LSAT), d = 0.87 (essays); stated limitations; smaller effects on the LSAT than the CCTST.

**[ARG-30]** Instructional Interventions Affecting Critical Thinking Skills and Dispositions: A Stage 1 Meta-Analysis — P. C. Abrami et al., *Review of Educational Research*, 2008 — https://journals.sagepub.com/doi/10.3102/0034654308326084 — 117 studies, 20,698 participants, average g ≈ 0.34 (search-result level).

**[ARG-31]** Using Argument Mapping to Improve Critical Thinking Skills — Tim van Gelder, in *The Palgrave Handbook of Critical Thinking in Higher Education*, 2015 — https://link.springer.com/chapter/10.1057/9781137378057_12 — The developer's own account of argument-mapping evidence (not opened; cited by [ARG-29] as reporting similar effect sizes).

**[ARG-32]** Charting the field: a review of argument visualization research for writing, learning, and reasoning — D. Chang, M. P.-C. Lin & G.-J. Hwang, *Frontiers in Education* 10, 2025 — https://public-pages-files-2025.frontiersin.org/journals/education/articles/10.3389/feduc.2025.1672105/text — Scoping review; calls for more experimental validation (abstract-level).

**[ARG-33]** Necessary and Sufficient Conditions — Andrew Brennan, *Stanford Encyclopedia of Philosophy*, 2003, revised 2022 — https://plato.stanford.edu/entries/necessary-sufficient/ — Definitions and caveats.

**[ARG-34]** Logic and Ontology — Thomas Hofweber, *Stanford Encyclopedia of Philosophy*, 2004, revised 2023 — https://plato.stanford.edu/entries/logic-ontology/ — Ontology as, to a first approximation, the study of what exists.

**[ARG-35]** Epistemology — *Stanford Encyclopedia of Philosophy*, 2005, revised 2024 — https://plato.stanford.edu/entries/epistemology/ — Epistemology as the study of kinds of cognitive success (knowledge, justification).

**[ARG-36]** Fallacies — Bradley Dowden, *Internet Encyclopedia of Philosophy* — https://iep.utm.edu/fallacy/ — Catalogue of 200+ named fallacies. The page returned a database error during research, so it is not used for any definition here; recommended for the glossary once it is back up (unverified).

**[ARG-37]** How to Think for Yourself, §2 "Fallacies of irrelevant and inadequate support" — open textbook (Pressbooks) — https://openwa.pressbooks.pub/howtothinkforyourself/chapter/%C2%A72-fallacies-of-irrelevant-and-inadequate-support/ — Definition and example of the genetic fallacy (search-result level).
