# Existing Tools for Structured Debate and Argument Mapping

Research date: 2026-11-13. Scope: tools a product team should know before building a free, Arabic-first, mobile-first, private-by-default site for structured debates among small groups of friends. Each entry covers the core model, strengths, failures, user complaints, business model or fate, and mobile access. Claims are cited inline as [TOOL-NN]. Anything I could not confirm from a primary page is marked "(unverified)".

Method note: several primary pages could not be fetched (MetaFilter, Medium, and Taylor & Francis returned 403; the Reasoninglab comparison page returned 500; the MindMup tutorial returned 404). Where I rely only on a search-engine snippet of a page, I say so.

---

## 1. Kialo and Kialo Edu

**Core model.** Each debate has a thesis at the root with Pro and Con columns under it. Every claim must support or weaken its parent, which produces a recursive pro/con tree. Registered users rate each claim's *impact* on its parent, and claims are sorted by average rating. Claims are limited to under 500 characters and can link to sources. Large debates are shown as a "sunburst" diagram. Other features include a per-claim discussion tab, a chat box, a "Perspectives" view of how supporters and opponents rated claims, and a Guided Voting wizard [TOOL-01]. Kialo Edu is the classroom version: discussions are private and limited to invited students, there is an anonymous mode with animal avatars, students can join by link with only a name ("Instant Access"), and it integrates with Moodle, Blackboard, and Google Classroom. Kialo Edu's guidance says claims should be no more than two sentences [TOOL-06].

**Scale and history.** Founder Errikos Pitsos. The public site launched in August 2017. Kialo claimed more than 18,000 public debates and over 720,000 claims as of July 2023 [TOOL-01]. Moderation is mostly self-managed by invited users. Owners and admins can rearrange the tree, which an HBS analysis calls "one of the more controversial features with users" [TOOL-03].

**Strengths.**
- One point per claim. Kialo Edu's own pitch is that each point gets its own claim "so ideas don't get lost in long, rambling posts" (search snippet of a Kialo Edu page) [TOOL-06]. This is exactly the WhatsApp voice-note problem this product targets.
- In a Johns Hopkins usability study, first-time instructors found the argument map itself intuitive and easy to navigate. They valued the topology view as a quick way to see who is engaged and how arguments connect [TOOL-07].
- Private, invite-only discussions and link-based joining without an account already exist in Kialo Edu [TOOL-06]. Those are table stakes for a private-by-default product.
- Duplicate handling: editors can mark a claim as a duplicate, and a "Possible duplicate claims" list is shown while a user types. Kialo says this list is not exhaustive (search snippet of support pages) [TOOL-08].

**Failures and complaints.**
- *Importance is hard to see and voting adds little signal.* An EA Forum user (Dec 2022) wrote that "Kialo specifically makes it hard to figure out which arguments are important," that "the amount of objections is overwhelming in some cases, while other arguments are missing," and that it is "a terribly unreliable resource" for understanding an argument. The same user said the platforms "do a poor job of attracting eyeballs" and that "we already have existing traditional forms that achieve much of the benefit" [TOOL-02].
- *Pro/con framing is too binary.* On Hacker News (2019), one user said they abandoned Kialo because "pro/con trees don't map well to reality". Another noted that "one man's con can often be another man's pro" [TOOL-10]. In the Johns Hopkins study, a writing-program administrator called the Pros/Cons labels reductive and combative, and other participants suggested softer labels such as "yes, and" / "no, but" and "contribution" instead of "claim" (paraphrased; the report asks that direct quotes not be republished without permission) [TOOL-07]. Researchers cited on Wikipedia say users can mainly agree or disagree with the thesis, with little room for middle-ground positions [TOOL-01].
- *Unfamiliar vocabulary.* Participants who knew forums ("post", "reply") were confused by "thesis" and "claim" during setup, and the in-context help popups were what got them through [TOOL-07].
- *No evidence check.* A Tildes user (2018) said Kialo is "not very concerned with sourcing their claims with evidence" and lacks "a real mechanism for the better argument to take hold" [TOOL-04]. A philosophy critique (Hanna, summarizing Steichmann, 2020) lists "Garbage-In, Garbage-Out", the inability to "distinguish adequate evidence from false evidence", and the "Backfire Effect" among eight worries [TOOL-05].
- *Admin power.* Commenters on the HBS piece worried about admin bias in where claims are placed [TOOL-03]. Wikipedia's criticism section notes that moderators' framing choices shape which arguments appear [TOOL-01].
- *Print and export.* One HN user's team used Kialo in meetings, but managers preferred traditional notes because "argument trees don't allow for nice print outs" [TOOL-10].

**Business model.** It is ad-free and does not sell data. A 2018 report said the plan was to sell to organizations, while 2023 terms describe the site as non-revenue-generating [TOOL-01]. A Google Workspace listing (search snippet) describes Kialo as "a nonprofit and entirely funded by a private philanthropic foundation" [TOOL-45]. That conflicts with Wikipedia's "for-profit company" wording, so treat the legal status as unverified. Kialo Edu says it is "completely free and always will be" [TOOL-06].

**Mobile.** There is no native app (Wikipedia, as of 2021) [TOOL-01]. Kialo Edu supports Safari on iPhone/iPad and Chrome on Android [TOOL-09]. The JHU reviewers rated mobile design "Strong" and found the mobile view arguably better laid out than the desktop one. Offline use was rated "Limited" [TOOL-07]. I found no evidence of Arabic interface support or RTL layout (unverified either way). The Kialo Edu advantages page showed only English in its language selector when fetched [TOOL-06].

**Takeaway for us.** Kialo has the right atom (one point per node, typed relation to its parent) and proves that private, link-joined discussions work. But it is built for many-to-many deliberation with moderators. It has no turn-taking, no notion of "who owes a reply", and its pro/con vocabulary reads as combative to some users.

---

## 2. Argdown

**Core model.** Argdown is a plain-text, Markdown-inspired syntax for argument maps. Statements are written as `[Title]: text` and arguments as `<Title>: text`. Relations are indented lines under a parent, prefixed with `+` (support), `-` (attack), `_` (undercut), or `><` (contradiction, strict mode), with `<`/`>` giving direction. Deeper indentation nests the tree. Arguments can carry numbered premise-conclusion structures, `(1) … (2) … ----- (3) …`. The syntax also supports tags (`#tag`, `#(multi word)`), inline or block YAML data `{key: value}`, a `===` frontmatter block, headings, and `//` comments [TOOL-11]. Tooling includes a VS Code extension with live map preview, a CLI, and the `@argdown/core` npm parser. `argdown-map` fenced blocks inside Markdown render as images (search snippet) [TOOL-12].

Minimal example (from the syntax rules above):

```argdown
[Claim]: We should meet weekly.
    + <Momentum>: Regular meetings keep the project moving.
    - <Cost>: Weekly meetings eat two hours.
        - <Async>: Most updates can be async.
```

**Strengths.** The format is human-readable, diffable, and versionable, and its relation vocabulary (support, attack, undercut) is richer than pro/con. Its JSON export is documented [TOOL-11]. HN commenters called it "excellent" as an implementation of pro/con trees [TOOL-10].

**Weaknesses.** It is a power-user, desktop-and-editor workflow, not a conversation tool. It has no notion of authorship, turns, timestamps, or obligations, unless those are added as YAML. The syntax page does not address RTL or bidirectional text (unverified whether Arabic renders correctly in its map exports).

**Import/export verdict.** Argdown is a reasonable export format: statements, arguments, and support/attack/undercut map cleanly onto a claim → support/objection/reply tree. Per-node metadata such as author, date, and status (answered, conceded) fits in YAML. It is a poor *primary* format for mobile users. Recommend export (and maybe import) only, with a round-trip test on Arabic text.

---

## 3. Arguman (Argüman)

**Core model.** Open-source (AGPL, Python/Django) collaborative argument mapping, started in 2014 and largely built by developers in Turkey, with a Turkish subdomain. Instead of pro/con, premises attach with three conjunctions: "because", "but", and "however". Users can flag fallacies [TOOL-13][TOOL-14].

**Strengths.** The conjunction-based relations read like natural language, which may translate better than "pro/con" into Arabic (for example لأن / لكن / إلا أن). The fallacy flag is a lightweight way to critique reasoning. The code is public [TOOL-14].

**Failures and complaints.** A 2015 LessWrong thread called it "mostly GIGO" for consensus-building because the community isn't pre-selected. It described the most-commented debate (on global warming) as "a colossal waste of time" and said the layout "encourages deploying Fully General Counter Arguments", with no way to check whether underlying information is accurate [TOOL-16].

**Why it died.** Wikipedia says "It is down as of 2023" and gives no reason [TOOL-13]. I found no founder postmortem. When fetched on 2026-11-13, arguman.org loaded a Turkish feed of recent arguments with a "still in development" footer, alongside unrelated spam ads for domain sales and follower purchases [TOOL-15]. It is unclear whether this is the original operator or a re-host (unverified). The GitHub repo is public, but the fetch did not show a last-commit date [TOOL-14]. Reasons for decline are unverified. The pattern is consistent with an open public site that attracted low-quality, drive-by debate and spam.

**Mobile.** Wikipedia mentions a mobile version [TOOL-13].

---

## 4. Truthmapping

**Core model.** Truthmapping (c. 2005) had users post an argument as explicit premises leading to a conclusion. Others attached critiques to specific premises or inferences, and the author could post rebuttals. Contemporary commenters describe it as "a tree of claims and supporting claims" with a syllogism-like philosophy [TOOL-18]. A MetaFilter thread from July 2005 discussed it (search snippet only; the page returned 403) [TOOL-20]. Further details of its critique/rebuttal mechanics, such as whether rebuttals were limited to the author or whether it was paid, are unverified.

**Why it matters.** It was one of the few tools that tied an obligation to a structure: a critique targets a named premise, and the author is expected to rebut it. That is close to "who owes a reply".

**Complaints.** LessWrong (2009): "The Truthmapping site encourages people to chop their arguments up into lots of little pieces." Splitting A→B→C into A→B and B′→C can hide the fact that B and B′ differ. The format "invites a kind of cargo cult logic". Its claim to make "*all* assumptions explicit" was seen as overclaiming, and its "emphasis on debate and persuasiveness, grates" [TOOL-18]. A 2010 commenter called it poor "for quite a number of reasons" without listing them [TOOL-17].

**Fate.** On 2026-11-13, truthmapping.com redirected to a HugeDomains domain-for-sale page [TOOL-19]. No shutdown announcement was found, so the date and reasons are unverified.

---

## 5. Rationale, bCisive, Reasoning Lab, Austhink

**Core model.** These are box-and-arrow argument-mapping tools from Tim van Gelder's group in Melbourne. Reason!Able was superseded by Rationale, built for teaching critical thinking, and bCisive, built for business decisions and consultants, with a Minto Pyramid partnership (search snippets) [TOOL-22]. The method distinguishes reasons, objections, and rebuttals ("an objection to an objection"). It requires co-premises: every reason or objection "must be aimed at some specific claim". An inference objection, which says the premises may be true "but the contention doesn't follow", is mapped as an objection to a previously hidden co-premise [TOOL-21].

**Strengths.** This is the most rigorous pedagogy of the group. Its explicit rules (for example, the "Rabbit" and "Holding Hands" rules) are worth borrowing as gentle hints, such as "Which part of their claim does this objection attack?" [TOOL-21].

**Failures.** These are single-author, desktop-era tools. A 2010 user said Rationale was "unfortunately limited to Windows" and that bCisive Online "seems to provide little more than a fancy mindmapping tool" [TOOL-17]. Software rights reportedly passed to Kritisch Denken BV in 2011 (search snippet, unverified) [TOOL-22]. They are not designed for live multi-party or mobile use (current mobile support unverified).

## 6. MindMup Argument Visualization

MindMup offers "Argument Visualization" as one of three map types. It lays out a main claim, supporting reasons, and objections top-down, and added a "High Impact" theme in 2020 to make maps more inclusive (search snippets of MindMup help/blog) [TOOL-23]. Older guides say you enter the mode via View → Start Argument Visualization or argument.mindmup.com (unverified for the current UI). Its strength is that it is free, quick, and works with Google Drive. Its weakness is that it is a diagramming tool with no authorship model, no notion of a reply being owed, and a canvas layout that is awkward on phones (inferred from the canvas layout, not tested).

---

## 7. DebateGraph

**Core model.** DebateGraph is a web-based collaborative idea-visualization tool focused on public-policy deliberation. It was co-founded in March 2008 by Peter Baldwin (former Australian minister) and David Price. Users included the White House, the UK FCO, CNN's Amanpour, and *The Independent*. Content is licensed CC BY-SA 3.0 [TOOL-24].

**Strengths and failures.** It had elite institutional uptake and an open license. A 2010 user said it was close to their goal but "still doesn't actually do anything with numbers" [TOOL-17]. On 2026-11-13, debategraph.org returned only a bare page titled "Entry page" with no content [TOOL-25], so it is apparently dormant (unverified). The Wikipedia node-type details (issue, position, argument) are unverified.

---

## 8. Debate Map (debatemap.app)

Debate Map is open source (MIT), with a Rust backend and TypeScript client. It breaks arguments into single-sentence nodes: gray "claims", and green/red "arguments" that support or oppose them, with rating, tagging, and belief-tree comparison [TOOL-26]. Development has been partially supported by The Society Library (search snippet) [TOOL-26]. The repo shows 2,666 commits and 183 open issues, and some docs are marked outdated [TOOL-26]. Its strength is that it separates *claim* from *argument* (a grouped set of premises), which avoids Truthmapping's chopping problem. Its weakness is that it is aimed at crowd-sourced canonical maps, not private conversations. Its mobile usability is unverified.

## 9. Society Library and Canonical Debate Lab

The **Society Library** is a 501(c)(3) that extracts claims and evidence from media into curated maps of polarizing issues, increasingly with AI models. A 2024 Show HN post describes graphs of "debated claims in context" (search snippets) [TOOL-37]. The **Canonical Debate Lab** proposed one canonical, de-duplicated graph of claims and arguments shared across debates. Its founder's post says de-duplication is a core feature, and that how updates would work had not been fully resolved (search snippet; Medium returned 403) [TOOL-38]. Both are expert-curated, public-knowledge projects. They are relevant as a cautionary note: de-duplication and canonicalization are the hardest problems at scale, and they are mostly irrelevant for a two-person private debate.

---

## 10. Deliberation platforms: Deliberatorium, Consider.it, Pol.is, Loomio, Climate CoLab

**Deliberatorium / Collaboratorium (MIT CCI, Mark Klein).** This is an IBIS-style argument map (issues, ideas, pros and cons). New posts stay "pending" until a moderator certifies their placement. A 2007 field test with 220 students produced a map described as "remarkably comprehensive". Moderation cost is high: estimates are 5–10% of active users as moderators, later about 1 per 20 authors (search snippets of MIT Sloan Review and CSCW paper) [TOOL-27]. A 2023 comparison with a forum on an electoral-law reform found the map "perceived as less intuitive and fluid". Even so, engagement held up, and the map produced more interactions, fewer self-referential arguments, and a more respectful tone (abstract via search snippet) [TOOL-28]. *Lesson:* structure improves discourse quality but costs usability and needs someone to place nodes. In a two-person debate, the author must place their own node, so the UI has to make placement nearly effortless.

**Consider.it (Kriplean et al., CSCW 2012).** Each person builds a *personal* pro/con list and can adopt points others wrote. Stance is a slider "on a continuum of conviction, rather than a binary yes/no vote". The focus is "augmented personal deliberation, rather than direct discussion with others" [TOOL-29]. It was deployed as the Living Voters Guide on nine Washington ballot measures, and users often wrote positions that acknowledged both sides and adopted points from people who disagreed [TOOL-29]. The guide reportedly went dormant after about six years (search snippet, unverified) [TOOL-30]. *Lesson:* a stance slider and "adopt their point" (that is, concession) are powerful, low-friction signals.

**Pol.is.** Participants vote agree / disagree / pass on short statements and can add their own, but cannot reply to each other. Clustering (PCA and k-means) reveals opinion groups. It is used in Taiwan's vTaiwan process, which once crowd-sourced an agenda from more than 4,000 participants, and it now adds LLM summaries of clusters (search snippets) [TOOL-32]. A 2023 academic critique says the focus on votes rather than text, and the forced separation into opinion groups, limit it [TOOL-33]. *Lesson:* removing replies kills flame wars, but it also removes debate. Pol.is is the opposite of what two friends need.

**Loomio.** Threads plus formal proposals (agree / abstain / disagree / block, with reasons), polls, and recorded outcomes. Members can participate by email. It is open source and run by a worker-owned cooperative. It offers a free trial and then a subscription. Its language list includes Hebrew but not Arabic [TOOL-31]. *Lesson:* closure matters. Loomio's "outcome" record is something argument maps lack. A debate needs an end state ("agreed", "agree to disagree", "X conceded point 3").

**Climate CoLab (MIT).** Contest-based crowdsourcing with expert judges. It grew to about 120,000 members and was spun out to Wazoku/InnoCentive on 2022-08-09 [TOOL-34]. Older contest pages are read-only (search snippet) [TOOL-34]. *Lesson:* sustained engagement came from deadlines and judges, that is, from external obligation.

---

## 11. Debate.org, DebateArt and similar sites

**Debate.org** (founded 2007) ran one-on-one, round-based debates judged by readers. The Civic Tech Field Guide marks it "put to rest" [TOOL-35]. One low-quality page claims a shutdown date of June 5, 2022 (unverified). **DebateArt** continues the format: open challenges, a fixed number of rounds, and reader voting across multiple dimensions such as arguments, sources, spelling/grammar, and conduct (third-party and academic snippets; voting policy not retrieved) [TOOL-36]. *Strengths:* these are the only mainstream tools with **explicit turn-taking**, where each side must post its round, often under a deadline. *Failures:* they are public, competitive, and score-driven. Turns are monolithic essays rather than point-by-point trees, so dropped points are still easy to hide inside a long round, and the gamification (votes, ELO-like rankings) rewards performance over resolution.

**Parlia** (launched March 2020; founders Turi Munthe and J. Paul Neeley) is an "encyclopaedia of opinions" that catalogs positions with short polls. Its current status is unverified (search snippets) [TOOL-39]. It is not a debate tool between people.

**AI debate apps.** Search for Arabic "تطبيق مناظرة" mostly surfaced AI sparring apps such as Apol, which runs debates with AI personas, and Counter Arguments, which argues the opposite side (App Store snippets) [TOOL-43]. These target practice against a bot, not structured debate between friends.

---

## 12. General mind-mapping and whiteboards (Miro, MindMeister, Xmind)

Mind maps and argument maps are both node-and-link diagrams, but mind-map links are *associative* (these ideas relate) while argument-map links are *inferential* (this supports or opposes that) (Davies 2011, via search snippet) [TOOL-40]. For debate, general tools fail because:
- There are no typed relations (support, objection, reply, concession), so nothing can be computed. You cannot ask "which objections are unanswered?"
- There is no authorship or turn model, so nothing tracks who placed a node or whose move it is.
- Free-form canvases are hard to use on a phone, and HN users report node editors being "finicky" or slow [TOOL-10].
- Whiteboards are shared and editable by everyone, so an opponent could edit your claim. That is wrong for adversarial debate.

These tools are useful as brainstorming, not as the structure itself. (Product-specific claims about Miro, MindMeister, and Xmind were not separately researched and are inference.)

---

## 13. Arabic-language tools

I searched in Arabic for "منصة مناظرات", "خريطة الحجج", and "تطبيق مناظرة".

- **ناقشني (Naqeshny)**, launched April 2012 by five young founders, called itself "أول موقع عربي متخصص في الحوار" ("the first Arabic site specialized in dialogue"). It sorted users into color-coded opinion groups via sign-up questions, offered threaded comments with media, and chose monthly topics. It was ad-funded and planned mobile apps, as of a 2018 article [TOOL-41]. It is a forum, not an argument map, and its current status is unverified.
- **مناظرة (Munathara)** is an Arab initiative for televised and public debates across eleven countries, including coverage of Tunisian presidential debates (2019 article snippet) [TOOL-42]. It produces debate events, not a peer-to-peer tool.
- **"خريطة الحجج" returned nothing relevant.** Results were about GIS maps or course syllabi.
- AI sparring apps (Apol, Counter Arguments) appear in Arabic App Store listings [TOOL-43].

**Honest conclusion:** I found **no Arabic-first argument-mapping or structured-debate tool**, and no evidence that Kialo, Argdown, Loomio, or the others offer an Arabic interface with proper RTL tree layout. Loomio lists Hebrew but not Arabic [TOOL-31]. Kialo's Arabic support is unverified.

---

## 14. Cross-cutting failure patterns

1. **Cold start and two-sided recruitment.** Scott Alexander (Apr 2026): "The hardest problem for any social technology is getting users". He compares debate tools to dating apps, which need two willing, compatible users, and adds "Even *I* don't like arguing on the Internet" [TOOL-44]. The EA Forum user makes the same point about attracting eyeballs [TOOL-02]. *Implication:* our product has an advantage, because the friend group already exists on WhatsApp. Joining must be a single link with no account, as Kialo Edu's Instant Access does [TOOL-06].
2. **Real disagreements don't decompose cleanly.** Scott Alexander: "'Debate' almost never corresponds to mappable arguments". Disputes turn on weighing values, not on a false premise [TOOL-44]. HN: "pro/con trees don't map well to reality" [TOOL-10]. *Implication:* allow free-form "clarification" and "definition" nodes, plus a weighing or summary step. Do not force syllogisms (the Truthmapping lesson [TOOL-18]).
3. **Tree bloat and lost importance.** Large Kialo trees overwhelm readers and make it hard to tell which points matter [TOOL-02]. *Implication:* default to a focused "open threads" view, not the whole tree.
4. **Duplication and fragmentation.** This is a pain point everywhere, from Kialo's duplicate-marking tools [TOOL-08] to Canonical Debate's whole thesis [TOOL-38]. Chopping arguments into tiny pieces creates near-duplicates such as B and B′ [TOOL-18]. It matters less with 2–5 participants, but you still need "this is the same as #12" merging and "you're using X differently than I am" (term drift).
5. **Moderation and placement cost.** Deliberatorium needed roughly 5% of users as moderators [TOOL-27]. Kialo's admin rearrangement is contested [TOOL-03]. *Implication:* in a private debate, the author places their own node. The product should suggest placement ("Is this replying to Ahmed's objection #4?") rather than rely on a moderator.
6. **Open public spaces attract garbage.** Arguman's global-warming threads [TOOL-16] and its 2026 spam [TOOL-15], and Kialo's "is it okay to torture people?" front page [TOOL-04], show the risk. Private-by-default avoids most of this.
7. **Gamification distorts.** Debate.org and DebateArt reward winning votes [TOOL-36]. Kialo's impact voting adds "not much signal" [TOOL-02]. Combative framing alienates collaborative users [TOOL-07]. *Implication:* prefer resolution states (answered, conceded, agreed, parked) over scores.
8. **Vocabulary friction.** "Thesis", "claim", and "pro/con" confused or put off educators [TOOL-07]. Arabic labels must be tested with users. Conjunction-style relations ("because / but / however", as in Arguman [TOOL-13]) may feel more natural than logic jargon.
9. **Desktop- and canvas-first design.** Rationale was Windows-only [TOOL-17], and canvas editors are finicky [TOOL-10]. Kialo works in mobile browsers [TOOL-09], but no tool was designed for one-thumb, RTL, asynchronous use.
10. **Lack of closure.** Most maps never end. Loomio's recorded outcomes [TOOL-31] and Consider.it's stance slider [TOOL-29] are the exceptions.
11. **Fragile funding.** Truthmapping's domain is for sale [TOOL-19], DebateGraph is a bare page [TOOL-25], Debate.org is "put to rest" [TOOL-35], Arguman went down [TOOL-13], and Climate CoLab spun out [TOOL-34]. Free, ad-free survival needs very low operating cost or a sponsor (Kialo's philanthropic funding [TOOL-45]).

## 15. What no tool does well

- **A long-running, asynchronous debate between two (or a few) known people with explicit reply obligations.** No tool I found tracks *whose turn it is on each open point*. Debate.org-style rounds enforce turn-taking at the level of whole essays, and argument maps track structure but not obligation. The closest historical attempt, Truthmapping's critique-then-rebut loop, is gone [TOOL-18][TOOL-19]. A per-node "awaiting reply from X" state, with an "unanswered objections" inbox and nudges, appears to be genuinely unoccupied.
- **Concessions as first-class moves.** Consider.it lets you adopt an opponent's point [TOOL-29], but no debate tree records "I concede this" as a move that prunes or resolves a branch.
- **Term definitions and drift.** No tool reviewed has a shared glossary node that claims can reference, so you can flag "you're using 'freedom' differently than in #3". (Argdown's statement equivalence classes and references [TOOL-11] are the closest analogue.)
- **Voice-native input.** No tool reviewed lets users dictate or attach a voice note and turn it into structured nodes. Given the WhatsApp voice-note habit, this is a gap (inference; no tool claims it).
- **Arabic / RTL.** There is no Arabic-first structured-debate tool [§13], and RTL layout of trees and connectors is not documented by any tool reviewed.
- **Private-by-default for friends, not classrooms or the public.** Kialo Edu's privacy is framed around teachers and classes [TOOL-06]. Consumer-grade private debate between peers, with no moderator role, is unserved.

---

## Sources

- **[TOOL-01]** Kialo — Wikipedia, accessed 2026-11-13 — https://en.wikipedia.org/wiki/Kialo — Model (thesis, pro/con, impact voting, <500-char claims, sunburst), founding and launch, user numbers to 2023, business model, no mobile app as of 2021, criticisms.
- **[TOOL-02]** "I've toyed around with Kialo…" answer to "Why is argument mapping not more common in EA/rationality?" — EA Forum (GreaterWrong mirror), user DirectedEvolution, 24 Dec 2022 — https://ea.greaterwrong.com/posts/HmYfoKW6FuyFHmwcJ/why-is-argument-mapping-not-more-common-in-ea-rationality/answer/9FdPRr45LNtMWJipX — User complaints: importance unclear, overwhelming objections, low traffic, unreliable.
- **[TOOL-03]** Sam Wilde, "Can Kialo turn online shouting into enlightened debate?" — HBS Digital Initiative, 13 Nov 2018 — https://d3.harvard.edu/platform-rctom/submission/can-kialo-turn-online-shouting-into-enlightened-debate/index.html — Model, self-managed moderation, tree rearrangement controversy, admin-bias concerns.
- **[TOOL-04]** "What do you think of sites like kialo.com?" — Tildes, 3 Aug 2018 — https://tildes.net/~misc/4c5/what_do_you_think_of_sites_like_kialo_com — User criticism on evidence and quality; "torture" front-page topic.
- **[TOOL-05]** Robert Hanna, "What Can Philosophy Do for Humanity? 4: Meta-Kialo, a Critique of Kialo" — Against Professional Philosophy, 31 Jan 2020 — https://againstprofphil.org/2020/01/31/what-can-philosophy-do-for-humanity-4-meta-kialo-a-critique-of-kialo/ — "Eight worries" (GIGO, evidence, backfire effect, etc.).
- **[TOOL-06]** Kialo Edu "Advantages" — Kialo Edu, accessed 2026-11-13 — https://www.kialo-edu.com/advantages — Free forever, privacy, anonymous mode, claims of at most two sentences, LMS integrations, "no app required", English-only selector seen.
- **[TOOL-07]** Alan J. Reid & Steven M. Ross, "Kialo Edu Design Review and User Research" — Johns Hopkins CRRE, May 2023 — https://blog.kialo-edu.com/wp-content/uploads/sites/3/2023/07/Kialo-Edu-Design-Review-and-User-Research.pdf — 13-participant usability study: intuitive map, terminology confusion, pro/con seen as reductive or combative, mobile rated Strong, offline Limited. Paraphrased per the report's quoting restriction.
- **[TOOL-08]** "Avoiding Duplicate Claims" / "Marking a Claim for Review" — Kialo Edu Support, accessed via search snippet 2026-11-13 — https://support.kialo-edu.com/en/?p=545 and https://support.kialo-edu.com/en/hc/marking-a-claim-for-review/ — Duplicate marking needs Editor role; "Possible duplicate claims" list is not exhaustive.
- **[TOOL-09]** "Supported Devices, Browsers and Accessibility" — Kialo Edu Support, accessed 2026-11-13 — https://support.kialo-edu.com/hc/es/articles/4410104265101-Supported-Devices-Browsers-and-Accessibility — iPhone/iPad Safari, Android Chrome; WebSocket requirement.
- **[TOOL-10]** Hacker News discussion on Argdown — Hacker News, 19–22 Jul 2019 — https://news.ycombinator.com/item?id=20476888 — Praise for Argdown; Kialo abandonment ("pro/con trees don't map well to reality"), print-out problem, "one man's con…", finicky node editors.
- **[TOOL-11]** Argdown Syntax — argdown.org, accessed 2026-11-13 — https://argdown.org/syntax/ — Statements, arguments, PCS, relation symbols, tags, YAML, frontmatter, JSON export.
- **[TOOL-12]** "Using Argdown in Markdown" / Argdown repository — argdown.org & GitHub, accessed via search snippet 2026-11-13 — https://argdown.org/guide/using-argdown-in-markdown.html and https://github.com/argdown/argdown — VS Code extension, `argdown-map` code blocks, `@argdown/core` parser.
- **[TOOL-13]** Argüman — Wikipedia, accessed 2026-11-13 — https://en.wikipedia.org/wiki/Arg%C3%BCman — 2014, Turkey-built, AGPL, because/but/however premises, fallacy flags, mobile version, "down as of 2023".
- **[TOOL-14]** arguman/arguman.org repository — GitHub, accessed 2026-11-13 — https://github.com/arguman/arguman.org — Open-source code, Python/Django, Docker, 694 commits, conjunction-based premises.
- **[TOOL-15]** arguman.org homepage — fetched 2026-11-13 — https://arguman.org — Site loads a Turkish argument feed with "in development" footer plus unrelated spam ads.
- **[TOOL-16]** "[Link] arguman.org, an argument analysis platform" — LessWrong (GreaterWrong mirror), 19–20 Oct 2015 — https://www.greaterwrong.com/posts/GnBixKDnnMNkNYavM/link-arguman-org-an-argument-analysis-platform — "mostly GIGO", "Fully General Counter Arguments", no accuracy check.
- **[TOOL-17]** Morendil, "Debate tools: an experience report" (with comments) — LessWrong, 5 Feb 2010 — https://www.lesswrong.com/lw/1qq/debate_tools_an_experience_report — Argunet usability, bCisive "fancy mindmapping tool", Rationale Windows-only, DebateGraph no numbers, Truthmapping criticized.
- **[TOOL-18]** Johnicholas, "Software tools for community truth-seeking" (with comments) — LessWrong (GreaterWrong mirror), 10 Mar 2009 — https://www.greaterwrong.com/posts/MYXrsBzXNPqTNarqQ/software-tools-for-community-truth-seeking — Truthmapping as a claim tree; "chop their arguments up", "cargo cult logic", syllogism framing.
- **[TOOL-19]** truthmapping.com — fetched 2026-11-13 — https://truthmapping.com — 302 redirect to HugeDomains domain-sale page.
- **[TOOL-20]** "Truthmapping: The Ultimate Attempt to Rationalize Debate?" — MetaFilter, July 2005 (search snippet only; page returned 403) — https://metafilter.com/43730/Truthmapping-The-Ultimate-Attempt-to-Rationalize-Debate — Dates the site to 2005; user debate on premises.
- **[TOOL-21]** Rationale 2.0 Tutorial 5 (objections and rebuttals) — Reasoning Lab, undated, accessed 2026-11-13 — https://www.reasoninglab.com/rationale2.0/tutorials/Tutorial_5/print.htm — Premise vs inference objections, co-premises, rebuttals.
- **[TOOL-22]** Reasoning Lab "Which product is right for you?" and related history pages — Reasoning Lab / timvangelder.com, search snippets 2026-11-13 — https://reasoninglab.com/product-comparison-2 and https://timvangelder.com/category/austhink — Reason!Able → Rationale and bCisive; bCisive for consultants; 2011 sale to Kritisch Denken BV (unverified).
- **[TOOL-23]** MindMup Argument Visualization help and "High Impact" theme post — MindMup, 2020, search snippets 2026-11-13 — https://mindmup.com/help/features/argument-visualization-high-impact and https://discover.mindmup.com/tutorials/argument-visualization.html — Map types, claim/reasons/objections layout, 2020 inclusive theme.
- **[TOOL-24]** Debategraph — Wikipedia, accessed 2026-11-13 — https://en.wikipedia.org/wiki/Debategraph — Founding 2008, founders, institutional users, CC BY-SA 3.0.
- **[TOOL-25]** debategraph.org — fetched 2026-11-13 — https://debategraph.org — Returns only an "Entry page" title with no content.
- **[TOOL-26]** debate-map/app repository — GitHub, accessed 2026-11-13 — https://github.com/debate-map/app — MIT license, Rust/TypeScript, claim vs argument nodes, ratings, activity counts; Society Library support (search snippet).
- **[TOOL-27]** "A New Way to Collaborate" — MIT Sloan Management Review (search snippet), c. 2008, and Klein et al., "The MIT Collaboratorium" — https://sloanreview.mit.edu/article/a-new-way-to-collaborate and https://dspace.mit.edu/handle/1721.1/65362 — Moderator role, 5–10% moderator ratio, 220-student field test.
- **[TOOL-28]** Mark Klein, Paolo Spada, Lex Paulson, "From shouting matches to argument maps" — Routledge/Taylor & Francis, 2023 (abstract via search snippet; page returned 403) — https://www.taylorfrancis.com/chapters/oa-edit/10.4324/9781003215929-14/shouting-matches-argument-maps-mark-klein-paolo-spada-lex-paulson — Map less intuitive, but more interactions and a more respectful tone than a forum.
- **[TOOL-29]** Travis Kriplean et al., "Supporting Reflective Public Thought with ConsiderIt" — CSCW 2012, University of Washington — https://homes.cs.washington.edu/~borning/papers/kriplean-cscw2012.pdf — Personal pro/con lists, adopting others' points, conviction slider, no direct discussion, Living Voters Guide findings.
- **[TOOL-30]** John Gastil, "Can Voters Trust Each Other?" — APSA 2022 paper (search snippet) — https://bpb-us-e1.wpmucdn.com/sites.psu.edu/dist/4/147569/files/2022/09/Gastil-Can-Voters-Trust-Each-Other-APSA-2022.pdf — Living Voters Guide went dormant (unverified).
- **[TOOL-31]** "How Loomio works" — Loomio, accessed 2026-11-13 — https://www.loomio.com/how-it-works/ — Threads, proposals, outcomes, email participation, open source, language list (no Arabic).
- **[TOOL-32]** "vTaiwan's hybrid approach to digital deliberation with AI" — People Powered (search snippet), accessed 2026-11-13 — https://www.peoplepowered.org/news-content/digital-participation-case-study-taiwan — Pol.is agree/disagree/pass, no replies, clustering, 4,000-participant agenda, AI summaries.
- **[TOOL-33]** "Sorting a Public? Using quali-quantitative methods to interrogate the role of algorithms in digital democracy platforms" — University of Southampton, 2023 (search snippet) — https://eprints.soton.ac.uk/496942/1/Sorting_a_Public_2023_AAM.docx — Critique of vote-only data and forced opinion groups.
- **[TOOL-34]** "MIT Center for Collective Intelligence's Climate CoLab spins out and migrates to Wazoku's…InnoCentive" — MIT Sloan, 9 Aug 2022 — https://mitsloan.mit.edu/press/mit-center-collective-intelligences-climate-colab-spins-out-and-migrates-to-wazokus-global-challenge-community-innocentive — 120,000 members, spin-out; read-only contest pages (search snippet of climatecolab.org).
- **[TOOL-35]** Debate.org — Civic Tech Field Guide, accessed via search snippet 2026-11-13 — https://civictech.guide/projects/debateorg — Founded 2007; "put to rest".
- **[TOOL-36]** "Debatrix: Multi-dimensional Debate Judge…" — arXiv 2403.08010, 2024 (search snippet), plus third-party DebateArt descriptions — https://arxiv.org/html/2403.08010v3 — DebateArt debates have multi-dimensional voting results; rounds and reader voting.
- **[TOOL-37]** Society Library / Jamie Joyce — Show HN "Mapping policy issues with debate graphs" (2024) and speaker pages, search snippets — https://hn-4j22wtt20-svelte.vercel.app/item/41719328 and https://www.fwd50.com/speaker/jamie-joyce/ — 501(c)(3), claim-level debate graphs, AI-assisted mapping.
- **[TOOL-38]** "The Ongoing Debate" — Canonical Debate Lab founder, Medium (search snippet; page returned 403) — https://bigokro.medium.com/the-ongoing-debate-ebecf15f3f8a — De-duplication as core feature; update handling unresolved.
- **[TOOL-39]** Parlia — Wikipedia (search snippet), accessed 2026-11-13 — https://en.wikipedia.org/wiki/Parlia — Launched March 2020, founders, short-poll opinion encyclopedia.
- **[TOOL-40]** Martin Davies, "Concept mapping, mind mapping and argument mapping: what are the differences and do they matter?" — Higher Education, 2011 (search snippet) — https://philarchive.org/rec/DAVCMM — Associative vs argumentative relations.
- **[TOOL-41]** Alyaa Abou Shahba, "'ناقشني' منصة شبابية لتبادل الحوار الهادف" — IJNet, 30 Oct 2018 — https://ijnet.org/en/node/3498 — Arabic dialogue site, 2012, opinion-group colors, monthly topics, ad revenue.
- **[TOOL-42]** "منصة 'مناظرة'.. تجربة فريدة وفضاء رقمي للنقاش الإعلامي الحر" — IJNet, 22 Sep 2019 (search snippet) — https://ijnet.org/en/node/6825 — Munathara televised debates across 11 Arab countries.
- **[TOOL-43]** Apol and Counter Arguments App Store listings (Arabic storefront) — Apple, search snippets 2026-11-13 — https://apps.apple.com/us/app/apol-ai%EB%A1%9C-%EB%8D%94-%EB%98%91%EB%98%91%ED%95%98%EA%B2%8C-%ED%86%A0%EB%A1%A0/id6566170239?l=ar and https://apps.apple.com/qa/app/counter-arguments/id6743873639?l=ar — AI debate-practice apps, not peer debate.
- **[TOOL-44]** Scott Alexander, "Your Attempt To Solve Debate Will Not Work" — Astral Codex Ten, 28 Apr 2026 — https://www.astralcodexten.com/p/your-attempt-to-solve-debate-will — Debates don't decompose into maps; user acquisition is the hardest problem; dating-app analogy.
- **[TOOL-45]** Kialo add-on listing — Google Workspace Marketplace, search snippet 2026-11-13 — https://workspace.google.com/marketplace/app/debates_kialo/271471745322 — Self-description as nonprofit funded by a private philanthropic foundation.
