# آداب البحث والمناظرة — the classical discipline of disputation, and what it means for the product

Scope: what the classical Arabic-Islamic discipline of disputation (ʿilm ādāb al-baḥth wa-l-munāẓara) actually prescribes, which parts can become the core data model of a two-person debate site, and where a product for friends has to bend it.

**How to read this file.**
- Most of the technical detail comes from three Arabic textbooks that I read in full or in large part:
  - al-Shinqīṭī's *Ādāb al-baḥth wa-l-munāẓara* [MUN-01]. I read its whole disputation section, printed pp. 139–291.
  - The Azhari manual of Hārūn b. ʿAbd al-Rāziq [MUN-02].
  - A modern textbook titled *Risālat al-ādāb* [MUN-03].
- These are checked against Syamsuddin Arif's annotated translation of Ṭāşköprüzāde's treatise [MUN-04] and against the scholarly literature [MUN-05 … MUN-13].
- Page numbers for [MUN-01] are the printed pages of the edition hosted on Shamela.
- The classical treatises of al-Samarqandī, al-Ījī, Sājaqlīzāde, al-Juwaynī, al-Bājī and Ibn ʿAqīl were **not** read directly. Their roles are reported only through the scholarship cited.
- Anything marked **(proposal)** is my own design suggestion, not the tradition's.

---

## 0. What the discipline is (one paragraph)

al-Shinqīṭī defines munāẓara as "المحاورة في الكلام بين شخصين مختلفين يقصد كل واحد منهما تصحيح قوله وإبطال قول الآخر، مع رغبة كل منهما في ظهور الحق" (a verbal exchange between two disagreeing people, each aiming to establish his own statement and refute the other's, *while both desire that the truth become manifest*) [MUN-01, p. 139].

The subject matter of the discipline is not any particular doctrine. It is the "general researches" (الأبحاث الكلية): المناقضة (denial), النقض (refutation) and المعارضة (counter-proof). The discipline studies these moves "من حيث هي موجهة مقبولة، أو غير مقبولة", that is, whether each move is properly directed and admissible [MUN-01, p. 140; MUN-03].

That is why it works as a *procedural grammar* of argument rather than as a body of doctrine, and why it maps so naturally onto a move-typed data model.

On history:
- Western scholarship credits Shams al-Dīn al-Samarqandī with founding the genre. His *Risāla fī ādāb al-baḥth* drew more than 50 commentaries and glosses [MUN-05, Young's foreword]. His death date is given as 722/1322 in [MUN-05] and [MUN-08], but as 702/1302 in the Karabela abstract [MUN-11]. I did not resolve this.
- The Arabic textbooks instead name Rukn al-Dīn al-ʿAmīdī (d. 615/1218) as "أول من ميز هذا الفن عن غيره من العلوم" (the first to separate this art from the other sciences) [MUN-01, p. 207; MUN-03]. al-Shinqīṭī's name for him, "ركن الدين أبي حامد محمد بن محمد العميدي السمرقندي", seems to merge the two figures.
- Young's account ties the two together: al-ʿAmīdī's *Ṭarīqa* leads through Burhān al-Dīn al-Nasafī's *Fuṣūl* to al-Samarqandī, who "universalized" that method [MUN-05].

**Implications for the product**
- The tradition defines *moves and when they are admissible*, not *topics*. A move-typed argument tree is therefore a faithful rendering of it, not a loose metaphor.
- The stated purpose, ظهور الحق (the truth becoming manifest, through whichever party), can be the product's declared ethos. It gives a native, culturally resonant answer to "this is not about winning".

---

## 1. The roles and the burden of proof

### 1.1 Terms

| Arabic | Rendering | Definition in the sources |
|---|---|---|
| المعلِّل (also المدّعي، المستدل; Arif: المجيب) | respondent / claimant / proponent | "الذي نصب نفسه لإثبات الحكم الذي يدعيه", the one who has set himself up to prove the judgement he claims. He is called *muʿallil* "because he usually gives the ʿilla (reason) of the judgement and argues for it" [MUN-02, p. 15]. |
| السائل (also المعترض) | questioner / objector / antagonist | "الذي نصب نفسه لنفي الحكم الذي أثبته المعلل", the one who has set himself up to negate the claimant's judgement. He is called *sāʾil* "because he asks, i.e. demands that the claimant validate his speech" [MUN-02, p. 15]. |
| الناقل | reporter / citer | Someone who reports another's statement without committing to it [MUN-01, pp. 263–264]. |

Hārūn's notes add that the muʿallil "is also called مدعياً and مستدلاً" [MUN-02, p. 15 n.]. Arif notes that the term muʿallil comes from juristic dialectic, where it means the one who adduces the ʿilla of a ruling. He adds that the muʿallil is also called the proponent or the "respondent (mujīb)", and these names are used interchangeably [MUN-04, n. 43].

### 1.2 The burden structure

- **The claimant carries the burden of proof.** "فإن الاستدلال منصب المعلل لا السائل" (argumentation is the claimant's office, not the questioner's) [MUN-02, p. 26]. Arif states the consequence for Ṭāşköprüzāde: "Since the burden of proof rests on the claimant, his failure to prove his case in the debate will amount to his defeat" [MUN-04, p. 203].
- **The questioner's functions (وظائف) are three:** المنع، النقض، المعارضة [MUN-02, p. 21; MUN-01, pp. 203, 232–233]. al-Sīnāwunī quotes Ṭāşköprüzāde's didactic verse to the same effect: "ثلاثة لسائل مناقضه / والنقض ذو الإجمال والمعارضه" [MUN-15]. The claimant's functions are "built upon" the questioner's, meaning each one is a reply to one of them [MUN-02, p. 21].
- **Roles are tied to the thesis, not to the person.** "وإن كنت مدعيا وأقمت الدليل على مدعاك: فأنت معلل، وخصمك سائل" (if you made a claim and argued for it, you are the muʿallil and your opponent the sāʾil) [MUN-02, p. 21].
- **Roles flip during a counter-proof.** "وبالمعارضة يصير السائل معللا، فيصير المعلل سائلا … فإذا منع أو نقض فهو لم يزل سائلا، وإذا عارض رجع كل لأصله" (by a counter-proof the questioner becomes the claimant and the claimant becomes the questioner … if he then denies or refutes he remains questioner; if he counter-argues, each returns to his original role) [MUN-02, pp. 30–31; MUN-04, p. 202].
- **Naming is reversed for definitions and divisions.** Most authors call the one who attacks a definition مستدل (arguer) and its defender مانع (denier), "the reverse of the usual convention" [MUN-01, pp. 160, 192]. The reason given is that whoever claims a definition is defective must *prove* the defect, while the defender need only *deny* a premise of that proof.

**Implications for the product**
- Model roles **per thesis node**, not per debate. Whoever authored a claim is its muʿallil, and the other party is its sāʾil. In one debate both friends will hold both roles at once on different branches. The tradition itself supports this through the role swap under muʿāraḍa [MUN-02].
- "Who owes a reply" is derivable from the burden rule. Any open challenge (a denial, refutation or counter-proof) against a node is owed a reply **by the author of the targeted node**.
- Attacking a definition flips the burden: the attacker must give a reason. That is a good rule for "define your terms" disputes.

---

## 2. The moves and when each is permitted

### 2.1 What can be disputed at all

- **Single words (المفرد).** Words are not disputed. One may only ask for clarification (الاستفسار) if a word is obscure [MUN-01, p. 142].
- **Commands, questions and wishes (المركب الإنشائي).** These are not disputed either, unless they are quoted from someone else. In that case one may demand that the citation be authenticated [MUN-01, p. 142].
- **Declarative propositions (المركب الخبري التام = التصديق/القضية).** These are the proper object of dispute. Definitions and divisions are disputed "because they contain implicit complete declarative propositions" [MUN-01, pp. 143–145]. A definition implicitly claims to be essential, exclusive, comprehensive and free of circularity.

Propositions are then sorted by epistemic status [MUN-01, pp. 193–200]:

- **البديهي الجلي (manifestly self-evident).** Examples: "the whole is greater than the part", things known by the senses. This is **not open to dispute**, and disputing it is مكابرة [MUN-01, p. 199].
- **البديهي الخفي (non-obviously self-evident).** Examples: intuitive (حدسي) and mass-transmitted (متواتر) knowledge. This needs only a تنبيه, "مركب يُقصد به إزالة الخفاء لا الاستدلال" (an utterance meant to remove obscurity, not to prove) [MUN-01, p. 199].
- **النظري (requiring reasoning).** This needs a دليل (proof).

### 2.2 The ordered procedure (ترتيب المناظرة)

al-Shinqīṭī gives the sequence a questioner should follow on receiving a claim [MUN-01, pp. 260–262]. The same order appears for definitions [MUN-01, p. 181].

1. **Examine the wording.** If a term is ambiguous (إجمال) or obscure (غرابة), ask for clarification (الاستفسار). The burden is on the asker to show the ambiguity, which is enough to do by showing two possible meanings. The claimant then either denies that more than one meaning is possible (منع تعدد الاحتمال), for example by pointing to a contextual indicator, or argues that his intended meaning is the more apparent one (ترجيح).
2. **Is it a citation or a claim?** "هل هو ناقل لذلك التصديق عن غيره … أو هو آت به من تلقاء نفسه؟ … هل هو ملتزم صحتَه؟" (is he reporting it from someone else, or advancing it on his own account, and does he commit to its truth?) A reporter who does not commit can only be asked to authenticate the report (المطالبة بتصحيح النقل).
3. **Classify the claim.** If it is manifestly self-evident, concede it ("عليه تسليمُه والإذعانُ له"), because denying it is mukābara. If it is theoretical or non-obviously self-evident, check whether a proof or tanbīh was offered.
4. **Unsupported claim.** Only one move is available, the bare denial: "ليس للسائل إلا شيء واحد: وهو منع الدعوى … وطلب الدليل عليها أو التنبيه" (the questioner has only one move: to deny the claim and demand a proof or tanbīh).
5. **Supported claim.** Any of the three functions is available: المنع، النقض، المعارضة. The claimant must answer each one.
6. **The disputation ends** in إلزام or إفحام (§3.3).

### 2.3 المنع (denial; also المناقضة، النقض التفصيلي، المنع الحقيقي، الممانعة)

**Definition.** "طلب الدليل على مقدمة الدليل" (demanding proof of a premise of the proof) [MUN-02, p. 15].
- "Premise" includes the minor and major premises, the validity conditions of the syllogism (شروط الإنتاج), and the fit of the proof to the claim (التقريب) [MUN-02, p. 15].
- It is "أسلم وظائف السائل، وأبعدها عن شائبة الغصب" (the safest of the questioner's functions and the furthest from any taint of usurpation) [MUN-01, p. 203].
- Typical formula: «أمنع الصغرى» / «لا نسلم …» ("I deny the minor premise" / "we do not grant …") [MUN-01, pp. 201, 204].
- One may not "deny the proof itself", that is, demand a proof of a proof, because a proof yields a single proposition, not another proof [MUN-02, p. 27]. "Demanding a proof of the proof" is listed as a form of مكابرة [MUN-03].

**When the denial is bare and when it carries a sanad**
- **المنع المجرد (bare denial).** Always permitted against an unconceded, non-self-evident proposition. It is the *only* move against an unsupported claim [MUN-01, p. 201].
- **المنع مع السند (denial with a supporting ground).**
  - Permitted against a premise **after** the claimant has argued for it [MUN-01, p. 207].
  - Whether it is permitted against a not-yet-argued claim is disputed. Some allow it. al-Shinqīṭī holds that adding a sanad there "من أنواع الغصب" (is a kind of usurpation), since a sanad is an abbreviated argument [MUN-01, pp. 202, 206–207].
  - Hārūn draws the line by form. A denial with sanad does not explicitly *assert* that the premise is false. It withholds assent and gives a reason, possibly a mere possibility. Usurpation *asserts* falsity and argues for it "on the way of certainty" [MUN-02, p. 27].

**السند (also المستند، الشاهد).** "ما يذكره السامع معتقداً أنه يستلزم نقيض الدعوى" (what the objector cites, believing that it entails the contradictory of the denied proposition) [MUN-01, p. 208].

*Three forms* [MUN-01, pp. 208–213]:
- **اللمّي / الجوازي (the "why-not" or possibility ground).** Example: «لم لا يجوز أن يكون حجراً؟» ("why could it not be a stone?").
- **القطعي (the categorical ground).** Example: «كيف يكون حجراً وهو ناطق؟» ("how can it be a stone when it speaks?").
- **الحَلّي / الحل (the diagnostic ground).** It identifies *where and why* the claimant went wrong, typically a confusion of two things. Example: «إنما يصح ما ذكرت فيما لو كانت العروض لغير التجارة» ("what you said holds only for goods not held for trade").

*Six relations to the contradictory of the denied premise* [MUN-01, pp. 216–222], summarized in Hārūn [MUN-02, p. 25]:

| Sanad relative to the contradictory of the denied premise | Useful to the questioner? | Useful for the claimant to refute it? |
|---|---|---|
| identical to it (عين النقيض) | yes | yes |
| equivalent to it (المساوي) | yes | yes |
| more specific than it (الأخص مطلقاً) | yes | no |
| more general than it (الأعم مطلقاً) | no | yes |
| overlapping (أعم من وجه وأخص من وجه) | no | no |
| disjoint from it (المباين) | no | no |

Hārūn condenses this as: "ويجوز الاستناد بالمساوي والأخص دون الأعم، وينفع المعلل إبطال المساوي والأعم دون الأخص" (one may lean on an equivalent or more specific ground but not a more general one; the claimant gains by refuting an equivalent or more general ground but not a more specific one) [MUN-02, p. 25].

Arif's account of Ṭāşköprüzāde makes the practical point. The claimant should refute the objector's sanad "only if it can be shown to be logically equivalent (musāwī) to the denial of the original claim". Otherwise refuting it "leads nowhere", because the objector can say it was only one of several possible reasons [MUN-04, pp. 201–202].

### 2.4 النقض (refutation; also النقض الإجمالي)

**Definition.** "ادعاء السائل بطلانَ دليل المعلِّل مع إقامته الدليل على دعواه بطلانَه" (the questioner claims the claimant's proof is invalid and proves that claim) [MUN-01, p. 234].
- It targets the *proof as a whole* without having to say which premise fails ("ولا يلزم في النقض تعيين المقدمة التي منها الفساد", it is not required to name the faulty premise) [MUN-01, p. 235].
- That is the difference from the "detailed" naqḍ, which is the denial (منع).

**The required witness (الشاهد).** A naqḍ "لا يُقبل إلا مقترناً بشاهد" (is not accepted unless it comes with a witness), and there are two kinds [MUN-01, p. 234]:
- **تخلّف المدلول عن الدليل (the conclusion fails where the proof holds).** The same proof applies to a case where its conclusion is known to be false. Classical example: "the world is eternal because it is the effect of the Eternal" is refuted by daily events, which are effects of the Eternal yet not eternal [MUN-01, pp. 234–235].
- **استلزام المحال (the proof entails an impossibility).** Examples are vicious circularity (الدور السبقي) and infinite regress (التسلسل) [MUN-01, p. 236].

Hārūn and *Risālat al-ādāb* add that refuting a proof *without* a witness is مكابرة (obstinacy) and "is not heard" [MUN-02, pp. 29, 31; MUN-03].

**Sub-types** [MUN-01, pp. 237–241]:
- **النقض المشهور (the standard refutation).** The claimant's proof is restated exactly as given.
- **النقض المكسور (the broken refutation).** Some qualifier of the proof is dropped. If the dropped qualifier mattered, the refutation is "مردود غير مقبول" (rejected, inadmissible). al-Shinqīṭī's example drops "عدواناً" (wrongfully) from "intentional killing of an equal" and then cites the lawful killing of a murderer by the victim's heir as a counter-instance. If the dropped qualifier was idle, the refutation is acceptable.
- **النقض الشبيهي (quasi-refutation).** This targets the *claim* rather than the proof, by showing it violates a consensus (إجماع) or the claimant's own school (مذهب المعلل).

### 2.5 المعارضة (counter-proof)

**Definition.** "إقامة الخصم الدليلَ المنتجَ نقيضَ الدعوى … أو … ما يساوي نقيضها أو ما هو أخصُّ من نقيضها" (the opponent's proof of the contradictory of the claim, of something equivalent to it, or of something more specific than it) [MUN-01, p. 244].
- It **concedes** for the moment that the claimant has a proof, and sets a rival proof against it [MUN-04, p. 202].
- It may target the original claim (المعارضة في الدليل/في المدعى/في الحكم) or a premise that has itself been argued for (المعارضة في العلة/في المقدمة) [MUN-01, pp. 246–248].
- **Timing is the key constraint.** A counter-proof may be directed at a premise "إلا إذا كانت تلك المقدمة قد استُدل عليها" (only if that premise has already been argued for). Otherwise only denial applies, and countering it is usurpation [MUN-01, p. 248].

**Three forms, by comparison with the claimant's proof** [MUN-01, pp. 248–253; MUN-02, p. 30]:
- **بالقلب / على سبيل القلب (by inversion).** The *very same proof* is turned against the claimant: "دليلك هذا ينتج نقيض دعواك، فهو حجة عليك لا لك" (this proof of yours yields the contradictory of your claim, so it counts against you, not for you). This works because the two parties read the same evidence under different aspects (ملاحظة). Example: the verse «لا تدركه الأبصار» is cited by one party to deny the vision of God and by the other to establish its rational possibility.
- **بالمثل (by a like proof).** The same logical form with different content.
- **بالغير (by a different proof).** A different form, for example a hypothetical syllogism against a categorical one.

Since there are two targets and three forms, al-Shinqīṭī counts 2 × 3 = 6 kinds [MUN-01, p. 246].

### 2.6 Illegitimate or degenerate moves

- **الغصب (usurpation).** "كل ما صح للسائل أن يمنعه فإن استدلاله عليه من الغصب" (whatever the questioner may deny, his arguing against it is usurpation). Defined as "استدلال السائل على بطلان تصديق نظري لم يقم صاحبه عليه دليلاً" (the questioner arguing against a theoretical claim before its owner has argued for it) [MUN-01, p. 231].
  - *Status.* It is inadmissible according to "جماهير أهل هذا الفن" (the majority of the discipline's scholars). al-Shinqīṭī says Rukn al-Dīn al-ʿAmīdī and his followers allowed it [MUN-01, pp. 207, 231].
  - *Rationale.* "لو جاز غصب السائل منصب المعلل لجاز غصب المعلل منصب السائل، وهكذا، فيلزم البعد عن أصل الدعوى، وينتشر بينهما الكلام، فيفسد باب الإلزام والإفحام" (if the questioner could usurp the claimant's office, the claimant could usurp the questioner's, and so on; the talk would drift from the original claim and the exchange could never close) [MUN-02, p. 26].
  - *A charitable reading.* Hārūn reports that some accept a usurpation if the usurper says "I meant it as a denial with a sanad" [MUN-02, p. 26 n.]. This is a reframing route.
  - The ADAB project glosses ghaṣb as "counter arguing a not-yet-defended claim" [MUN-13].
- **المكابرة (obstinacy).** "المنازعة بين الخصمين لا لإظهار الصواب، بل لإظهار الفضل والغلبة" (dispute not to bring out the right answer but to show superiority and win) [MUN-01, p. 232]. Concrete forms:
  - denying a manifestly self-evident proposition;
  - denying a sound proof against which no flaw can be shown;
  - demanding a proof of a proof;
  - refuting without a witness [MUN-01, p. 232; MUN-03].
- **المعاندة (perverse dispute).** "المنازعة بين شخصين لا يفهم أحدهما كلام الآخر، وهو يعلم فساد كلامه" (a dispute in which one party does not understand the other and knows his own speech is unsound) [MUN-01, p. 272].
- **المجادلة (contentious dispute).** "المنازعة لا لإظهار الحق، بل لإلزام الخصم" (dispute not to bring out the truth but to corner the opponent). Some scholars distinguish a praiseworthy jadal "بالتي هي أحسن" (in the better way, Q 16:125) [MUN-01, pp. 272–273].
- **المصادرة (begging the question).** Making the conclusion one of the premises under different wording, e.g. "this is a lion, every lion is a *layth*, so this is a *layth*" [MUN-01, p. 272].
- **الجواب الجدلي (dialectical answer).** An answer the respondent himself believes to be false [MUN-01, p. 273].
- The ADAB project, citing Cevdet Paşa, adds two named vices that I could not check in a primary text:
  - **تحكّم (taḥakkum, "subjugation").** Insisting on a claim without offering a supporting argument.
  - **عجول (ʿujūl, "hastiness").** Counter-arguing a claim right from the start [MUN-13].

### 2.7 النقل (citation) and طلب تصحيح النقل (demand to authenticate it)

- **Definition.** النقل means reporting another's words with attribution [MUN-01, p. 263].
- **If the reporter commits to the reported view,** he is a مدّعٍ (claimant) and everything above applies.
- **If he does not commit,** then:
  - if the content is self-evident or conceded by the opponent, it must be accepted;
  - otherwise the only admissible move is "المطالبة بتصحيح النقل، بطريق يَثبُت بها صحةُ ذلك النقل" (demanding that the citation be authenticated by some means of verification) [MUN-01, p. 263].
- Hārūn: "فللخصم أن يطلب منك تصحيح النقل … فيلزمك حينئذ تصحيحه بإحضار الكتاب الذي نقلت عنه مثلاً" (your opponent may demand that you authenticate your citation, and you must then do so, for example by producing the book you quoted) [MUN-02, p. 20]. He adds that calling this a "denial" is only metaphorical, since a citation is not a premise [MUN-02, pp. 20–21].
- The scholars differ on whether demanding authentication is obligatory or merely recommended. Some say it is improper if the questioner already knows the citation is accurate [MUN-01, p. 264].
- **The popular maxim.** The brief asks about «إن كنت ناقلاً فالصحة، وإن كنت مدعياً فالدليل» ("if you are citing, [show] authenticity; if you are claiming, [show] proof"). It summarizes the doctrine above exactly. However, I did **not** find this exact wording in the texts I read, so its wording and provenance are (unverified).

### 2.8 التنبيه and تحرير المراد; a note on "تحرير محل النزاع"

- **التنبيه (pointer).** The proper support for a non-obviously self-evident claim. It is not a proof, and objecting to it is "of little use" according to al-Jurjānī as quoted by al-Shinqīṭī [MUN-01, pp. 199, 206].
- **تحرير المراد (clarifying what one meant).** The central *defensive* move. It recurs as a reply to denials and to objections against definitions (§3, §5) [MUN-01, pp. 182–186, 227–229].
- **تحرير محل النزاع (fixing the exact point of dispute).** A standard expression in uṣūl and khilāf writing. In the ādāb texts I read, however, the operative mechanisms are الاستفسار (step 1 of the procedure) and تحرير المراد, not a named move called "taḥrīr maḥall al-nizāʿ". Any claim that it is a formal ādāb move is therefore (unverified).
- **The ADAB project's opening stage.** Its modern protocol has a dedicated "Opening Stage" in which the proponent defines terms, the opponent asks for clarification, and both "jointly" present the resolution [MUN-13].

**Implications for the product (for §2 as a whole)**
- **Admissibility is a function of (target node type, target status, mover's role).** This is directly implementable as validation:
  - against an **unsupported claim**: only "Deny / ask for proof";
  - against a **supported claim**: Deny-a-premise, Refute, or Counter-prove;
  - against a **citation**: "Ask for source";
  - against a **self-evident or conceded** proposition: nothing (with a soft "this looks like mukābara" warning).
- **Ghaṣb prevention is a UX rule.** If the questioner tries to post a counter-argument against a claim that has no proof yet, the app should suggest turning it into "Deny, with a reason (sanad)", following Hārūn's charitable reframing, or into "Ask for proof".
- **A refutation must carry a witness.** Provide two required sub-fields: "counter-case where the conclusion fails" or "it leads to an impossibility (circularity or regress)". If the user quotes the claimant's argument, warn when qualifiers are dropped (النقض المكسور).
- **Keep the sanad optional and lightweight.** The respondent's default reply to any denial is simply to prove the premise. Do not force users to classify a sanad into six relations. At most, show a hint that refuting the opponent's reason only helps if it is their *only* reason.
- **"Ask for source" deserves its own move type.** Religious debates lean heavily on quoted hadith, scholars and books. The classical rule is clean: a non-committing citer owes *authentication*, not proof.

---

## 3. The respondent's replies, and how a disputation ends

### 3.1 Replies to a denial (الأجوبة عن المنع) [MUN-01, pp. 223–230; MUN-04, p. 208]

1. **Prove it.** Give a proof of the denied proposition, of something equivalent to it, or of something more specific. This answers both a bare denial and a denial with sanad.
2. **Refute the sanad (إبطال السند).** This works only against a denial that carries a sanad, and only usefully when the sanad is equivalent (§2.3).
3. **Clarify the meaning (تحرير المراد) of the claim or the premise.** For example: "by 'goods' I meant goods held for personal use, not trade goods" [MUN-01, pp. 227–228].
4. **Clarify the school or framework (تحرير المراد من المذهب العلمي).** For example: "I built this premise on Abū Ḥanīfa's position" [MUN-01, pp. 228–229].
5. **Point out that it is self-evident or already conceded.** Ṭāşköprüzāde allows the claimant to remind the questioner that the premise "is evidently true or has been conceded by the questioner himself" [MUN-04, pp. 200, 208].

**What is not a reply.** "لا ينفعه أن يمنع صحة ورود المنع … ولا الاشتغال بالاعتراض على عبارة المنع" (it does him no good to deny that the denial is admissible … or to busy himself with objecting to how the denial is worded). If he does this instead of a real reply, "فقد أُفحم" (he has been silenced) [MUN-01, pp. 229–230].

### 3.2 Replies to a refutation and to a counter-proof

- **To a naqḍ** [MUN-01, pp. 242–243; MUN-02, p. 29]:
  - deny that the proof is fully present in the counter-case (منع وجود تمام الدليل);
  - deny that the conclusion fails there (منع التخلف);
  - deny that an impossibility follows (منع الاستلزام);
  - deny that what follows is in fact impossible (منع كونه محالاً), e.g. arguing that the circularity is the benign "concomitant" kind (دور معي);
  - give a different proof. al-Shinqīṭī calls this "إفحام من وجه، وإظهار للصواب من وجه" (a defeat in one respect and a manifestation of the truth in another).
- **To a muʿāraḍa** [MUN-01, pp. 254–256]. Here the claimant takes the **questioner's** role against the counter-proof. He may:
  - deny an unproven premise of it;
  - refute it with a witness;
  - re-prove his own claim by a new argument. al-Shinqīṭī accepts this third option ("فضعيفان يغلبان قويًّا", two weak arguments can overcome a strong one), against "قوم" (some scholars) who rejected it as shifting from one argument to another.
- **Concessive replies** [MUN-02, p. 18; MUN-01, p. 188]:
  - **القول بالموجب (granting the point but denying it matters).** "سلمنا أن ذلك اللفظ غلط، ولكنه لا تتوقف عليه صحة التعريف" (granted, the word is wrong, but the definition's validity does not depend on it).
  - **المجاراة (going along with the claim).** Conceding a point while denying that it entails what the opponent says.
  - **التسليم / التنزّل (conceding for the sake of argument).** Examples: «لو سلمنا الصغرى لا نسلم الكبرى» ("even if we grant the minor premise, we do not grant the major"), or «ولو فرضنا كذا» ("and even supposing such-and-such").

### 3.3 The end of the disputation: إلزام and إفحام

al-Shinqīṭī: "لا بد في المناقشة أن تنتهي بعجز أحدهما عن دفع دليل الآخر، فإن كان العاجز هو السائل سمي ملزَماً، وسمي عجزُه إلزاماً، وإن كان العاجز هو المعلِّل سمي مفحَماً، وسمي عجزه إفحاماً" (every discussion must end with one party unable to repel the other's argument: if the questioner is the one unable, he is "compelled" and his failure is called *ilzām*; if the claimant is unable, he is "silenced" and his failure is called *ifḥām*) [MUN-01, p. 273; same in MUN-03].

- **إفحام (silencing).** "المعلل إذا عجز عن إقامة الحجة وسكت عن المناظرة" (the claimant cannot produce the argument and falls silent) [MUN-02, p. 31].
- **إلزام (compelling).** "إذا عجز السائل عن التعرض له بشيء من وظائفه، بأن ينتهي دليل المعلل إلى مقدمات ضرورية أو مسلمة عند الخصم" (the questioner cannot apply any of his functions, because the claimant's proof has bottomed out in necessary premises or premises the opponent has granted) [MUN-02, p. 31].
- Hārūn notes the outcomes are inevitable "إذ لا قدرة للمتناظرين على إقامة وظائفهما إلى غير النهاية" (since neither party can perform his functions without end). Ṭāşköprüzāde says the same [MUN-02, p. 31; MUN-04, p. 210].

The *Mawsūʿat al-mafāhīm* entry (signed Aḥmad al-Ṭayyib) adds the moral frame: a munāẓara aimed merely at إفحام الخصم "is forbidden", while one "لإظهار الحق أو لإلزام الخصم بالحق" (to bring out the truth or to bind the opponent to it) is legitimate [MUN-14].

**Implications for the product**
- **Turn the reply catalogue into a menu.** When a user must answer a denial, offer: "Prove it" (opens a new proof node), "Clarify what I meant", "It's agreed or obvious" (links to the shared-ground list), "Refute their reason", and "Concede". When answering a counter-proof, the app should switch the responder into *questioner* tools.
- **Build an explicit "shared ground" list (المسلّمات).** *Ilzām* is defined as the claimant's chain reaching premises that are necessary or *granted by the opponent*. A list of conceded propositions per debate lets the tree compute when a branch has bottomed out. **(proposal)**
- **Branch states.** Use outcome states like "the claimant could not support this" (ifḥām-like) and "the questioner had nothing left to object" (ilzām-like). Apply them *per branch*, not as a verdict on the whole debate or the person, and word them softly. **(proposal)** The tradition's own ethics (§4) says the point is the truth, "ولو على يد خصمه" (even if it comes through his opponent).
- **Model concession as a first-class reply.** Include the "for the sake of argument" variant (تنزّل), which keeps the point open while letting the debate move on.

---

## 4. The ethical rules (الآداب)

**al-Shinqīṭī's list** [MUN-01, pp. 274–275]. *Risālat al-ādāb* gives the first seven nearly verbatim [MUN-03]:

1. Avoid needless length, and avoid brevity that harms understanding (أن يتحرزا عن إطالة الكلام في غير فائدة، وعن اختصاره اختصاراً يخل بفهم المقصود).
2. Avoid obscure and ambiguous wording (غرابة الألفاظ وإجمالها).
3. Keep to the topic (أن يكون كلامهما ملائماً للموضوع).
4. Do not mock or ridicule the other (ألا يستهزئ أحدهما بالآخر ويسخر منه).
5. Each should aim at the truth becoming manifest, even through his opponent (أن يقصد كل منهما ظهور الحق، ولو على يد خصمه).
6. Do not address the other's words until you understand what he meant (ألا يتعرض أحدهما لكلام الآخر حتى يفهم مراده).
7. Wait until the other finishes, and do not interrupt (أن ينتظر كل واحد منهما صاحبه حتى يفرغ من كلامه).
8. Avoid disputing with someone of great awe and standing, lest awe paralyse your argument (أن يتجنب المناظرة مع من هو من أهل المهابة العظيمة والاحترام العظيم).
9. Do not regard your opponent as insignificant, lest you argue carelessly (ألا يحتسب خصمه حقيراً).

**Ṭāşköprüzāde's list, in Arif's translation** [MUN-04, p. 210]. Arif frames it as nine rules ("There are nine rules of conduct"):
- avoid terseness and long-windedness;
- avoid unfamiliar and ambiguous words, though asking for clarification is allowed;
- do not engage the opponent's words before understanding them, though asking for repetition is allowed;
- do not digress;
- refrain from laughing, raising the voice and the like;
- do not dispute with people of awe and respect;
- do not consider the opponent contemptible.

**Hārūn's list** [MUN-02, p. 32]. It is substantially the same, with additions:
- "وعن الضحك، ورفع الصوت، وإظهار الطيش والخفة، وتحريك اليد" (refrain from laughing, raising the voice, showing rashness and levity, and gesturing with the hands);
- a closing rule: "وليقف كل منهما عند ما حُدَّ له؛ حتى يظهر الحق" (let each stay within the bounds set for him, so that the truth may appear), i.e. keep to your role.

**The motive requirement** is built into the definition of munāẓara itself ("مع رغبة كل منهما في ظهور الحق", with both desiring that the truth appear) [MUN-01, p. 139]. A debate aimed only at silencing the opponent is condemned [MUN-14]. *Risālat al-ādāb* and Hārūn define مكابرة and مجادلة by their *motive* (to show superiority, or to corner the opponent), not by their logical form [MUN-02, p. 14 n.; MUN-03].

**Implications for the product**
- **Several ādāb are directly enforceable as product mechanics:**
  - one move per turn, which keeps answers short and prevents interruption;
  - a "clarify" button before any objection is allowed on a node;
  - a prompt, "Did you understand their point? Restate it", before a first objection. This operationalizes rule 6 **(proposal)**;
  - an off-topic flag (rule 3).
- **Voice messages need care.** Rule 1 suggests a soft length limit or a summary requirement per node. Rule 7 is naturally satisfied by asynchronous turns.
- **Some ādāb can only be invited, not enforced** (intent, no mockery, no contempt). Show them as a short covenant both parties accept when starting a debate, in the tradition's own words. **(proposal)**
- **Rule 8 matters socially.** A disputant awed by the other's standing argues badly. For friend groups where one person is a senior or a shaykh, an "equal footing" norm (both are just *sāʾil* and *muʿallil* here) is culturally grounded, not imported.

---

## 5. Defining terms first: definitions (التعريفات) and divisions (التقسيمات)

**Why definitions are disputable.** A definition implicitly claims that it is a definition by essentials (حدّ) rather than by accidentals, that it is **exclusive** (مانع) and **comprehensive** (جامع), and that it entails nothing impossible [MUN-01, pp. 143–144].

**Four objections to a real or nominal definition** [MUN-01, p. 179]:
1. **Not exclusive.** «ألا يكون التعريف مطرداً، أي مانعاً»: it admits things outside the defined term.
2. **Not comprehensive.** «ألا يكون منعكساً، أي جامعاً»: it leaves out some instances.
3. **Entails an impossibility.** «أن يستلزم المحال، كالدور السبقي» (e.g. vicious circularity).
4. **Not clearer than what it defines.** «ألا يكون أظهر وأوضح من المعرَّف».

Further objections address the definition's *quality* (حُسن) rather than its validity [MUN-01, pp. 180, 187–188]:
- a linguistic error;
- a metaphor without a contextual indicator;
- a homonym without a contextual indicator;
- an obscure word.

**Form of the objection.** The objection is cast as a syllogism: "هذا التعريف غير مانع، وكل تعريف كان كذلك فهو فاسد" (this definition is not exclusive, and every such definition is defective) [MUN-01, p. 180]. That is why the objector is called مستدل (arguer) here (§1).

**The defender's replies.** The main reply is تحرير المراد, of four kinds [MUN-01, pp. 182–186]:
1. **What the defined term means.** Example: "by 'animal' in the premise I meant the familiar kinds, not the crocodile".
2. **What a component of the definition means.** Example: "by 'thinking' I meant 'moving by will'".
3. **Which school's conditions apply.** Example: "I follow those who do not require exclusivity in a merely verbal definition".
4. **Which kind of definition it is.** Example: "it is verbal (لفظي), not real".

Other replies:
- to "not clearer": clarity is relative to the audience addressed (الظهور والخفاء نسبيان);
- to "circular": the two dependencies are in different respects (انفكاك الجهة), or the circle is the benign concomitant kind (دور معي) [MUN-01, pp. 186–187].

**Verbal definitions.** A merely verbal definition (e.g. "البُرّ is الحنطة", two names for wheat) is open only to *denial* and is answered by citing the lexicographers [MUN-02, p. 29].

**Divisions (التقسيم).** The same machinery applies. A division claims to be exhaustive (حاصر), that each part is more specific than the whole, and that the parts are mutually exclusive (متباينة). It is attacked as "not comprehensive", "not exclusive", or "parts overlap" [MUN-01, pp. 144, 160–161].

**Order of operations.** Before objecting to a definition, first check whether it is a citation and whether its terms are clear [MUN-01, p. 181].

**Implications for the product**
- **Add a "Definition" node type** (and optionally "Division"). Give it four one-tap objection templates: "includes things it shouldn't" (غير مانع), "leaves out cases" (غير جامع), "circular" (دور) and "unclearer than the word itself" (أخفى). Each template should require a counter-example or explanation, because the objector carries the burden.
- **Prompt for definitions in epistemology and theology debates.** Debates about faith, God's existence and the authority of reason usually turn on equivocal key terms (عقل، إيمان، دليل، يقين). The app could prompt "Define your key term?" when a new thesis is posted, and pin agreed definitions to the debate header as shared ground. **(proposal)**
- **Offer "I meant X" (تحرير المراد) as a reply that edits nothing.** It should attach a clarification to the original node, preserving history.

---

## 6. jadal, Aristotle's *Topics* and ādāb al-baḥth

**Three strands**, per the scholarship read:
1. **Theological jadal and juristic jadal/khilāf.** These are Islamic disputation practices with roots in the earliest legal and theological literature. Juristic jadal reached "full-system" treatises with al-Shīrāzī, al-Bājī, Ibn ʿAqīl, al-Juwaynī and others in the 5th/11th century [MUN-05, Young's foreword].
   - Miller's chapter on juristic dialectic is organized around the "Four Questions" (e.g. "What Is Your Evidence?").
   - It also covers the named objections: muṭālaba, manʿ/mumānaʿa, naqḍ, qalb, al-qawl bi-mūjib al-ʿilla ("limited acceptance"), fasād al-waḍʿ, farq, muʿāraḍa, "The Order of the Objections" and "The Signs of Defeat" [MUN-05, table of contents].
   - The uṣūl tradition lists the same family as قوادح العلة (objections that undermine the ratio legis): النقض، الكسر، القلب، القول بالموجب، فساد الوضع، فساد الاعتبار، الاستفسار، التقسيم، المنع، المعارضة [MUN-15, chapter list].
2. **Philosophical dialectic in Arabic.** Translations and expansions of Aristotle's *Topics* and *Sophistical Refutations* ran from an early translation attributed to Patriarch Timothy I to al-Fārābī and Ibn Sīnā [MUN-05, Young's foreword]. Young's *Dialectical Forge* compares "Aristotelian dialectic and early juridical jadal-theory", noting parallels and divergences [MUN-07, snippet].
3. **ādāb al-baḥth** (from the late 7th/13th century).
   - Young describes it as a "new, streamlined method of jadal/khilāf", flowing from al-Nīsābūrī's and al-ʿAmīdī's *Ṭarīqa*s to al-Nasafī's *Fuṣūl*, which "was eventually universalized by Shams al-Dīn al-Samarqandī … as the new genre of the ādāb al-baḥth" [MUN-05].
   - Miller's verdict, as summarized in the publisher's description: "While the theoretical underpinnings of the new system are Aristotelian, the terminology and order of debate place it firmly in the Islamic tradition of disputation". Al-Samarqandī combined the traditions "principally by his application of Aristotle's epistemology to the rules of debate" [MUN-06, snippet].
   - Belhaj: a discipline combining "principles from Aristotelian logic and Islamic law" [MUN-10].
   - Karabela: the discipline continued to develop after al-Samarqandī, *contra* Miller, and classical jadal was eventually displaced by a "largely linguistic" model of argumentation [MUN-11, snippet].
   - El-Rouayheb's chapter traces its Ottoman uptake [MUN-12, snippet].

**Why it was considered universal**
- **Its object is procedural, not doctrinal.** Denial, refutation and counter-proof are defined over *any* declarative proposition, definition or division (§0, §2.1) [MUN-01, pp. 140–145].
- **It rests on logic.** al-Shinqīṭī says that understanding the discipline "يتوقف … على فهم ما لا بد منه من فن المنطق" (requires the necessary minimum of logic), because denials and refutations target the syllogism's premises and its validity conditions [MUN-01, author's preface, p. 4]. He then *applies* the general moves back to the juristic قوادح, after noting that the jurists' analogy (قياس التمثيل) can be recast as a first-figure syllogism, with the ʿilla as middle term [MUN-01, p. 291 ff.].
- **It is used across disciplines.** Shinqīṭī applies it to grammar (objections to an "عبارة" for breaking a rule of Arabic, answered by citing a grammarian, a school, a dialect or a canonical reading) [MUN-01, pp. 265–271]. Young: dialectical teaching was "interdisciplinary and transdisciplinary", energizing "law, theology, philosophy, and grammar" [MUN-05].
- **Hārūn notes a terminological nuance.** "jadal" is sometimes reserved for the rules by which one can "protect a thesis and repel the opponent's speech, whether each is true or false". Its juristic branch is called ʿilm al-khilāf [MUN-02, p. 14 n.]. The ādāb discipline adds the truth-seeking motive and the role discipline.

**Implications for the product**
- **The product does not need to choose between "Islamic" and "Western" argument models.** The tradition is itself a synthesis of Aristotelian logic and Islamic juristic procedure. Its move set (premise denial, counter-instance refutation, counter-argument) lines up closely with contemporary argument-mapping (objection, undercutter, rebuttal). This mapping is my own comparison, not the tradition's.
- **Use Arabic terminology as the primary labels.** It gives culturally precise names: المنع، النقض، المعارضة، طلب تصحيح النقل. Provide plain-Arabic glosses for users who do not know the technical vocabulary (e.g. «اطلب الدليل»، «هات مثالاً يُبطل الدليل»، «دليل مقابل»). **(proposal)**
- **Domain-specific objection kits are an advanced feature.** The juristic qawādiḥ (فساد الاعتبار، القول بالموجب، الفرق …) could ship as optional packs for fiqh debates. They are not needed for v1. **(proposal)**

---

## 7. A concrete design mapping (entirely **(proposal)** except where cited)

### 7.1 Where the classical model is strict and where friends need flexibility

| Classical rule | Strictness | Product stance **(proposal)** |
|---|---|---|
| Two fixed roles per disputation, sāʾil and muʿallil [MUN-02, p. 15] | Strict, but roles swap under muʿāraḍa [MUN-02, pp. 30–31] | Roles are **per thesis node**. Both friends can post theses; each node's author is its muʿallil. |
| The questioner may not argue against an unproven claim (no ghaṣb) [MUN-01, p. 231] | Strict (majority view) | Do not block it; **reframe** it as "Deny with reason" (Hārūn's charitable reading [MUN-02, p. 26 n.]), or as a *new* thesis by the other party, which makes them muʿallil of it. |
| Strict turn order, one move at a time [MUN-13] | Strict in practice | Asynchronous: several open branches are allowed. Each branch has its own "who owes a reply". |
| A refutation needs a witness [MUN-01, p. 234] | Strict | Enforce a required "witness" field. |
| Self-evident propositions cannot be denied (mukābara) [MUN-01, p. 199] | Strict | Soft: let a user mark a premise "I think this is self-evident". If the other denies it, show a gentle note rather than blocking, since friends disagree about what is self-evident. |
| The end is ilzām or ifḥām [MUN-01, p. 273] | Strict, and the whole disputation ends | Branch-level states, plus an explicit "we agree to disagree here" state. The last is not classical. |
| Disputing someone you hold in awe is discouraged [MUN-01, p. 274] | Ethical advice | An equal-footing covenant; no reputation scores visible inside a debate. |

### 7.2 Node types

- **Thesis — دعوى (author = muʿallil)**
  - `kind`: claim | definition | division
  - `origin`: own | citation-committed | citation-only (النقل)
  - `status_hint`: self-evident? (author's flag)
  - `supported`: has a Proof child? (derived)
- **Proof — دليل/تعليل (author = the thesis author)**
  - `premises[]`: each premise is its own **Premise — مقدمة** node, addressable by objections
  - an optional "this is only a pointer (تنبيه)" flag
- **Challenge nodes (author = sāʾil of the target)**
  - **Clarify — استفسار.** Target: any node. Requires naming the ambiguous term.
  - **Deny — منع.** Target: an unsupported thesis, a premise, or a proof's fit to its conclusion (التقريب). Optional `sanad` with type possibility | categorical | diagnostic (لمي/جوازي | قطعي | حلّي).
  - **Refute — نقض.** Target: a proof. Required `witness`: counter-case (تخلف) | impossibility (استلزام المحال).
  - **Counter-prove — معارضة.** Target: a supported thesis, or a premise that has its own proof. `form`: same proof inverted (قلب) | same form (مثل) | different (غير). **Creates a new Thesis + Proof whose author is the challenger**, so the roles swap [MUN-02, p. 30].
  - **Ask-for-source — طلب تصحيح النقل.** Target: a citation-only thesis.
  - **Definition objection — غير جامع / غير مانع / دور / أخفى.** Target: a definition. Requires an example.
- **Reply nodes (author = owner of the challenged node)**
  - Prove (new Proof node)
  - Clarify-meaning (تحرير المراد)
  - Framework (تحرير المذهب)
  - Already-granted (link to shared ground)
  - Refute-sanad
  - Deny-witness (منع التخلف / منع الاستلزام)
  - Source-provided (link, book or page, or audio clip)
  - Concede (تسليم)
  - Concede-but-irrelevant (القول بالموجب)
  - For-argument's-sake (تنزّل), which keeps the node open
- **Shared ground — المسلّمات.** A per-debate list of propositions both parties have granted. Used to compute ilzām.

### 7.3 Allowed children per node (validation table)

| Target node | Allowed challenges (by the other party) | Allowed replies (by the author) |
|---|---|---|
| Thesis, unsupported, own | Clarify; Deny (bare). A sanad or counter-proof is reframed (anti-ghaṣb). | Prove; Clarify-meaning; Already-granted; Concede |
| Thesis, citation-only | Clarify; Ask-for-source | Source-provided; Commit (it becomes "own", then normal rules apply) |
| Thesis, supported | Clarify; Counter-prove | (attack its Proof or Premises instead) |
| Proof | Refute (witness required) | Deny-witness; Prove differently; Concede |
| Premise, unsupported | Clarify; Deny (bare or with sanad) | Prove; Refute-sanad (only if the sanad is equivalent; hint); Clarify-meaning; Framework; Already-granted; Concede; Concede-but-irrelevant |
| Premise, supported | Deny its sub-premises; Refute its sub-proof; Counter-prove (معارضة في العلة) | (as above, recursively) |
| Definition | Clarify; the four definition objections; Ask-for-source if cited | Clarify-meaning (4 kinds); "it's verbal / differently framed"; relative-clarity reply; Concede |
| Counter-proof thesis | Swaps roles: the original claimant now has Deny / Refute / Counter-prove | (as for a supported thesis) |

### 7.4 "Who owes a reply" and "unanswered" (derivation)

- **Owes a reply.** For every challenge node C with no reply child, the owner is `author(target(C))`. The debate header shows "You owe N replies / they owe M".
- **Unanswered.** A challenge older than X days with no reply. This is an *ifḥām-candidate* and should be shown neutrally, e.g. «لم يُجب بعد» ("not answered yet"), not «مُفحَم» ("silenced").
- **Branch closed by ilzām.** Every premise in a proof chain is either conceded, on the shared-ground list, or marked self-evident and not denied, and there is no open challenge. The questioner has nothing left to do.
- **Branch closed by ifḥām.** The author explicitly concedes, or chooses "I can't support this now".
- **Additional, non-classical state: "agreed to disagree".** Both parties mark the branch as resting on differing first premises. This is useful for faith debates, where the tree often bottoms out in different axioms.

### 7.5 Recommended opening ritual (adapted from ترتيب المناظرة and from ADAB's Opening Stage [MUN-01, pp. 260–262; MUN-13])

1. The proponent states the thesis and any key definitions.
2. The other party may only Clarify or object to definitions.
3. Both pin the agreed definitions and any shared ground.
4. The argumentation proper begins.
5. When a branch closes, each side may add a one-paragraph reflection: no new arguments, an honest meta-comment. This mirrors ADAB's Concluding Stage [MUN-13].

**Implications for the product (summary)**
- The classical model gives, almost ready-made:
  - a typed move set;
  - admissibility rules;
  - a burden rule that computes "who owes a reply";
  - two well-defined terminal states;
  - an ethics charter.
- The main adaptations for friends are:
  - roles per thesis rather than per debate;
  - reframing in place of hard blocks for ghaṣb and mukābara;
  - asynchronous multi-branch play;
  - an explicit "agreed to disagree" state, which the tradition does not have.

---

## Sources

**[MUN-01]** محمد الأمين الشنقيطي، *آداب البحث والمناظرة*، تحقيق سعود بن عبد العزيز العريفي — Dār ʿAṭāʾāt al-ʿIlm (Riyadh) / Dār Ibn Ḥazm (Beirut), 5th ed., 1441 AH (the first printing was Medina, 1388 AH, per the editor's preface) — https://shamela.ws/book/266 (disputation section: https://shamela.ws/book/266/143 onward) — definition and purpose; what is disputable; tasdīq types; the procedure; manʿ, sanad (3 forms, 6 relations); replies to manʿ; ghaṣb; mukābara; naqḍ and its kinds; muʿāraḍa and its forms; replies; naql; ʿibāra; muṣādara, muʿānada, mujādala; ilzām/ifḥām; nine ādāb; definitions and divisions; application to the uṣūl qawādiḥ — **read** (printed pp. 139–291, the author's preface p. 3–5, and the editor's preface).

**[MUN-02]** هارون بن عبد الرازق البنجاوي الأزهري (d. 1336/1917)، *فن آداب البحث والمناظرة* — modern edition hosted on Ṣayd al-Fawāʾid (edition and publisher details not verified) — https://saaid.org/book/21/15255.pdf — definitions of muʿallil and sāʾil; manʿ as "demand for proof of a premise"; sanad relations; ghaṣb and the rationale for banning it; role swap under muʿāraḍa; ilzām/ifḥām; mujārāt/tanazzul; seven ādāb — **read** (pp. 14–33).

**[MUN-03]** *رسالة الآداب* (an Arabic textbook on ādāb al-baḥth; the author is not named in the file, and attribution is unverified) — archive.org PDF — https://archive.org/download/resala_201506/resala.pdf — purpose (ilzām of the questioner, ifḥām of the claimant); founder attributed to Rukn al-Dīn al-ʿAmīdī; definitions of mukābara (including demanding a proof of a proof and naqḍ without a witness), muʿānada, mujādala, al-jawāb al-jadalī, istifsār; end of munāẓara; seven ādāb — **read** (selected sections).

**[MUN-04]** Syamsuddin Arif, "The Art of Debate in Islam: Textual Analysis and Translation of Ṭaşköprüzade's Ādāb al-Baḥth wa al-Munāẓarah" — *Afkar* 22(1), 2020, pp. 187–216 — https://ejournal.um.edu.my/index.php/afkar/article/view/24695 — the three strategies; sanad and when to refute it; ghaṣb as role-change; role swap under muʿāraḍa; replies; ilzām/ifḥām and the burden of proof; the ādāb list; the muʿallil term — **read** (analysis and translation, pp. 200–211).

**[MUN-05]** Larry Benjamin Miller, *Islamic Disputation Theory: The Uses & Rules of Argument in Medieval Islam* (with a foreword by Walter E. Young) — Springer, Logic, Argumentation & Reasoning 21, 2020 (Princeton PhD 1984) — https://content.e-bookshelf.de/media/reading/L-13782701-15a215e6b2.pdf (publisher sample) — Young's historical overview (jadal → khilāf → al-Samarqandī's universalization; *Topics* translations; commentary counts for al-Samarqandī, al-Ījī, Ṭāşköprüzāde, Sājaqlīzāde, al-Shinqīṭī); the table of contents of the juristic objections — **read** (front matter, foreword, preface and table of contents only; the body was not read).

**[MUN-06]** Publisher description of Miller, *Islamic Disputation Theory* — Springer, 2020 — https://www.springer.com/book/9783030450113 — "theoretical underpinnings … Aristotelian, the terminology and order of debate … Islamic"; al-Samarqandī applied Aristotle's epistemology to the rules of debate — **seen in search snippet only**.

**[MUN-07]** Walter Edward Young, *The Dialectical Forge: Juridical Disputation and the Evolution of Islamic Law* — Springer, Logic, Argumentation & Reasoning 9, 2017 — https://link.springer.com/978-3-319-79805-9 — compares Aristotelian dialectic with early juridical jadal-theory; dialectic as a formative dynamic of Islamic law — **seen in search snippet only**.

**[MUN-08]** Walter Edward Young, "On the Logical Machinery of Post-Classical Dialectic: The Kitāb ʿAyn al-Naẓar of Shams al-Dīn al-Samarqandī (d. 722/1322)" — *Methodos* 22, 2022, doi:10.4000/methodos.9053 — https://doaj.org/article/7a35a34d05f440c38efb28390ee8740f — al-Samarqandī's Risāla as the proximate origin of the genre; universalizing al-Nasafī's jadal/khilāf; death date 722/1322 — **seen in search snippet only** (the OpenEdition page blocked automated access).

**[MUN-09]** Walter Edward Young, "Al-Samarqandī's Third Masʾala: Juridical Dialectic Governed by the Ādāb al-Baḥth" — *Oriens* 46, 2018, pp. 62–128 — https://relbib.de/Record/1821437888/Description — the Risāla's closing problem-questions apply ādāb to a khilāf question — **seen in search snippet only**.

**[MUN-10]** Abdessamad Belhaj, "Ādāb al-baḥth wa-al-munāẓara: The Neglected Art of Disputation in Later Medieval Islam" — *Arabic Sciences and Philosophy* 26(2), 2016, pp. 291–307 — https://www.cambridge.org/core/journals/arabic-sciences-and-philosophy/article/abs/adab-albahth-waalmunazara-the-neglected-art-of-disputation-in-later-medieval-islam/332D116F597EE9A6EB3E1E05DAC62F79 — al-Samarqandī's general theory of discussion combining Aristotelian logic and Islamic law — **read** (abstract page only).

**[MUN-11]** Mehmet Karabela, *The Development of Dialectic and Argumentation Theory in Post-Classical Islamic Intellectual History* — PhD dissertation, McGill University, 2011 — https://philarchive.org/rec/KARTDO — continued development after al-Samarqandī; displacement of jadal by a linguistic model; death date 702/1302 — **seen in search snippet only** (the page blocked automated access).

**[MUN-12]** Khaled El-Rouayheb, *Islamic Intellectual History in the Seventeenth Century*, ch. 2 "A discourse of method: the evolution of adab al-bahth" — Cambridge University Press, 2015 — https://libcat.library.tamu.edu/Record/in00003583608/TOC — Ottoman development of the genre — **seen in search snippet only** (table of contents).

**[MUN-13]** Karim Sadek, Rahmi Oruç, Merve Aktar, Mehmet Ali Üzelgün, Önder Küçükural, *Towards a Munāẓara-Inspired Ethical Argumentation and Debate Model* (ADAB project white paper) — Munazara and Argumentation Ethics Research Center, Ibn Haldun University, ca. 2023 (date inferred from the January 2023 symposium it cites) — https://fs.ihu.edu.tr/siteler/munazara.ihu.edu.tr/647286e57bb12/files/white-paper-towards-a-muna-ara-inspired-ethical-argumentation-and-debate-model-pdf.pdf — move-based, strictly turn-taking procedure; argumentative vices (mukābara, taḥakkum, ghaṣb, ʿujūl, the last citing Cevdet Paşa); a modern three-stage protocol with role swap under counter-argument — **read**.

**[MUN-14]** أحمد الطيب، مدخل «أدب البحث والمناظرة» في *موسوعة المفاهيم الإسلامية العامة* — المجلس الأعلى للشؤون الإسلامية (Egypt) (publisher per the Shamela listing; unverified) — https://shamela.ws/book/433/16 — munāẓara for mere ifḥām is forbidden, while munāẓara for manifesting the truth is legitimate; list of terms; ādāb such as patience until the questioner finishes — **read** (via fetch summary).

**[MUN-15]** حسن السيناوني، *الأصل الجامع لإيضاح الدرر المنظومة في سلك جمع الجوامع*، ج3 ص50 — Shamela — https://shamela.ws/book/1469/320 — quotes Ṭāşköprüzāde's verse on the three functions of the questioner and ghaṣb as "usurping the arguer's office", which "المحققون" do not hear; chapter list of the uṣūl qawādiḥ — **read**.

**[MUN-16]** إمام الحرمين الجويني، *الكافية في الجدل* (ed. Fawqiyya Ḥusayn Maḥmūd) — cited indirectly in an Egyptian journal article — https://journals.ekb.eg/article_352320_979586aa2ad8c6c21abcad935388b027.pdf — al-Juwaynī's use of "mustadill" for both the one who sets up the proof and the one who asks about it — **seen in search snippet only** (not used for any claim above beyond §6's mention of al-Juwaynī among jadal authors, which rests on [MUN-05]).
