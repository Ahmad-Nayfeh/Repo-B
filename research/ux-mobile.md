# UX & Mobile Design Patterns for a Long-Running Arabic-First Debate Tree

Scope: established UX research and design-system guidance relevant to an Arabic-first (RTL), mobile-first site where friends conduct structured debates (claim → supports / objections / replies / concessions) over months, with hundreds of points. Each section gives findings, then **Implications for the product** as concrete design rules. Citations are inline as [UX-NN]; the full list is in "Sources". Anything not confirmed from a primary page is marked "(unverified)".

---

## 1. Showing a large tree on a small screen

### Findings

**Navigation models.** There are four candidate patterns for a big argument tree:

- **Focus/drill-down** (one node at a time, with its parent above and its children below).
- **Indented outline** (Reddit/Hacker News-style nested threads).
- **Zoomable map / node-link diagram.**
- **Radial overview (sunburst).**

Kialo, the best-known structured-debate product, offers two "minimap" modes [UX-10]:

- **Tree Navigation** is the default. It highlights the path from the thesis to the selected claim and shows only the levels above the selected claim and the claims directly beneath it.
- **Sunburst Navigation** puts the thesis at the center with each level radiating outward, so *all* claims are visible. It has zoom/reset controls.

Kialo's own help page warns that the sunburst "can contain large amounts of information," which can confuse newer users. For that reason it recommends Tree Navigation for new users, because it limits the visible claims to those directly related to the selected claim [UX-10]. Kialo colour-codes pro claims green and con claims red [UX-10]. That works only if a second cue (position, label or icon) carries the same meaning (see §2).

Academic work on exploring Kialo-style arguments has looked at sunburst and icicle (space-filling) layouts as overviews [UX-11]. We saw only the listing; the paper's specific findings are unverified.

**Indentation breaks down on phones.** Wikimedia's long-running task on mobile talk pages documents the failure mode. Threads reach 8+ levels and indentation can consume half the screen width, which makes text unreadable [UX-12]. The proposals discussed there were:

- smaller fixed indentation (~0.5em)
- reduced indentation plus connecting lines (the iOS app approach)
- capping indentation at about 4–6 levels
- removing indentation entirely and linking sub-threads with a single line (the Android app approach)
- collapsible threads, which one participant judged the biggest single improvement

None of these was implemented in that rollout [UX-12]. Reddit's "continue this thread" link, which moves deep replies onto their own page, is the well-known industry precedent for a depth cap. This description comes from practitioner sources only (unverified).

**Accordions / collapsing.** NN/g finds accordions more appropriate on mobile than on desktop [UX-5]:

- Mobile users often stop scrolling before the end of long pages.
- Collapsing gives an overview of the page's structure.

The same research lists the costs [UX-5]:

- every click adds interaction cost
- hidden content is seen less, so headings must be informative

Its guidelines [UX-5]:

- Allow several sections to be open at once.
- Persist each section's state until the user changes it.
- Don't hide content that users need most of the time.

**Progressive disclosure.** NN/g recommends at most two levels of disclosure. Designs with three or more levels "usually have low usability because users get lost" [UX-7].

**Breadcrumbs on mobile.** NN/g [UX-6] says:

- avoid multi-line breadcrumb trails on mobile
- truncate to the immediate parent, or the last one or two levels
- keep tap targets large
- reflect the hierarchy, not browsing history
- leave the current page unlinked

**Touch targets.** Three standards apply:

- **WCAG 2.2 SC 2.5.8 (AA):** targets at least **24×24 CSS px**, unless spacing or other exceptions apply. SC 2.5.5 (Enhanced) uses **44×44 CSS px** [UX-1].
- **Google's Android accessibility guidance:** **48×48 dp** with **≥8 dp** spacing, about 9 mm physically. A small icon can get its full target from padding [UX-3].
- **Apple:** a 44×44 pt minimum hit target is widely reported, but Apple's page did not render for us (unverified from Apple directly) [UX-4].

NN/g's breadcrumb article puts it as tap targets of "at least 1 cm × 1 cm" [UX-6].

### Implications for the product

1. **Use focus navigation as the primary view, not an outline or a map.** One screen equals one "focused point". It shows:
   - a compact parent strip at the top: the immediate parent's text, truncated to 1–2 lines, tappable
   - the focused point in full
   - its children, grouped by type (supports / objections / replies / concessions)

   This mirrors Kialo's default Tree Navigation, which it recommends for newcomers [UX-10].
2. **Breadcrumb = parent only on mobile.** Show a single "↑ parent" row. Expose the full path through a "path" button that opens a list, so it never wraps across multiple lines [UX-6].
3. **Inline nesting is capped at 2 visible levels under the focused node.** Deeper branches show as a "N more replies →" row that drills in. Never indent more than ~2 steps on a phone. Use a thin connector line plus a type icon instead of deep indentation [UX-12].
4. **Offer an overview, but as a secondary "map" screen.** The overview is a compact, read-only outline (or optional sunburst) used for orientation and jumping. It is not the place where people write [UX-10, UX-11].
5. **Collapse state persists per user and per node**, and multiple branches can be open at once [UX-5].
6. **Limit disclosure depth to two levels:** "summary row → full point". Inside a point, put secondary actions (edit history, link, report) behind a single "⋯" menu [UX-7].
7. **Every tappable element has at least a 44×44 CSS px hit area** (aim for 48 px), with ≥8 px between adjacent targets. This exceeds WCAG 2.2 AA (24 px) and matches the AAA, Apple and Material sizes [UX-1, UX-3, UX-4]. Small status icons get padded hit areas.

---

## 2. Status communication: open / answered / conceded / withdrawn, and "whose turn"

### Findings

WCAG 1.4.1 (Level A) says colour must not be "the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element" [UX-2]. NN/g's icon research says "a text label must be present alongside an icon to clarify its meaning". Labels should be visible without interaction, not shown on hover, because hover doesn't work on touch [UX-15].

The strongest working analogue for "who owes a reply" is code review on GitHub:

- Review state is an explicit, queryable status. The search qualifiers include `review:none`, `review:approved`, `review:changes_requested` and `user-review-requested:@me`, the last matching "pull requests that you have directly been asked to review" [UX-14].
- Resolving a review conversation makes "the entire conversation … collapse and [be] marked as resolved". Only the PR author or someone with write access can resolve it [UX-13].

This yields a reusable model:

- an explicit status per thread
- an explicit requested party
- "@me" filters
- resolved items collapsed by default but recoverable

### Implications for the product

1. **Status = icon + text label + colour, always together.** Proposed statuses:
   - Open / awaiting reply
   - Answered
   - Conceded
   - Withdrawn
   - Disputed / needs clarification

   Each gets a distinct *shape*, a short Arabic label, and a colour as the third, redundant cue. Never use a coloured left/right border alone [UX-2, UX-15].
2. **Store "owed by" as a field, not an inference.** Every open point has `awaiting: <participant>`. Render it as a badge with the person's name, e.g. «بانتظار ردّ: أحمد» ("waiting for a reply from: Ahmed"). This is the debate equivalent of GitHub's "review requested" [UX-14].
3. **Personal inbox: "Waiting on me".** The home screen leads with a count and a list of points where `awaiting = me`, oldest first. Next to it is a "Waiting on others" list. This is the `user-review-requested:@me` pattern [UX-14].
4. **Unanswered points must stand out structurally, not just visually.**
   - Open children sort before answered ones within their group.
   - Each open point carries an "age" label, e.g. "مفتوحة منذ ١٢ يومًا" ("open for 12 days").
5. **Resolution collapses.** Conceded and withdrawn sub-threads collapse to a one-line summary, e.g. "✓ تنازل خالد — ٣ ردود مخفية" ("✓ Khalid conceded — 3 replies hidden"), with "show" to expand. Only the point's author (or both parties, per product rule) can mark it resolved, mirroring GitHub's permission rule [UX-13].
6. **Distinguish "unread" from "needs my reply."** Unread is a lightweight dot plus text for the screen reader. Needs-reply is the strong, labelled badge. Don't merge the two.

---

## 3. Readability at scale (hundreds of points)

### Findings

- **Collapse resolved threads.** GitHub's resolved-conversation pattern demonstrates this: finished discussion stays available but stops consuming attention [UX-13].
- **Filter by status and by person.** GitHub's review qualifiers show that status plus person filters are the core triage tools for large review queues [UX-14].
- **Collapse on mobile, with care.** NN/g supports collapsing on mobile for overview but warns that hidden content gets less attention. Headings and summaries must therefore carry the meaning [UX-5].
- **Keep the first level uncluttered.** NN/g's progressive-disclosure guidance says to put frequently needed options first and keep the first level free of confusing items [UX-7].
- **Long lists need technical support (§8):**
  - virtualisation renders only visible rows [UX-32]
  - `content-visibility: auto` lets the browser skip off-screen rendering while keeping content findable and in the accessibility tree [UX-33]

### Implications for the product

1. **Filter chips at the top of every list.** The default is **"Open"**. The other chips are:
   - "Waiting on me"
   - "Waiting on them"
   - "Conceded"
   - "All"

   Chips are single-select, sticky and labelled, never icon-only [UX-14, UX-15].
2. **Each point has a one-line "headline".** The author writes it, or it defaults to the first sentence. Collapsed rows show headline + status badge + reply count + age. Because hidden content gets less attention, this headline is what makes collapsed trees scannable [UX-5].
3. **Resolved branches collapse by default.** The setting persists and can be toggled with "show resolved" [UX-13].
4. **Search covers point text, headline, glossary terms and participant names.** Results show the parent-path snippet so a hit is understandable out of context.
5. **Deduplication by linking, not copying.** When composing, offer "this looks like point #142 — link instead?" based on text similarity. A "same as #142" link renders as a compact reference card. Repeated points then share one status and one reply obligation. *This is a product recommendation; we found no published UX research specifically on argument deduplication.*
6. **Stable short IDs** (e.g. «#142») on every point, so friends can reference points in chat and across branches.

---

## 4. Glossary terms and named fallacies

### Findings

- **Tooltips fail on touch.** NN/g: tooltips "are not normally available on touchscreens" because they depend on hover. The recommended touch alternative is a *popup tip*, opened by tap and dismissed by tapping elsewhere, for short content [UX-8].
- **Bottom sheets suit longer content.** NN/g's five guidelines [UX-9]:
  - support system Back for dismissal
  - include a visible Close button
  - never stack sheets
  - don't replace page-to-page flows
  - use sheets only for short interactions, not "complex content"
- **Inline previews work.** Wikipedia's Page Previews A/B tests showed previews increased "the precision with which users select the pages they read" and broadened the number of distinct pages read. The disable rate was about 0.01%. The Android app's mobile version "led to a 20% increase in links clicked per page" [UX-18].
- **Term drift.** We found no established UX pattern or research on detecting term drift (one word used with shifting meaning). Treat this as a product invention.

### Implications for the product

1. **Linked terms are styled as text links with a distinct, non-colour cue** (dotted underline plus a small «؟» marker). Tap opens a **bottom sheet** containing:
   - the definition, max ~3 lines
   - who proposed it and whether both sides accepted it (status badge)
   - "used in N points"
   - "open full entry"

   Follow NN/g's rules: Close button, Back closes it, and never open a second sheet from a sheet. Links inside the sheet navigate to the full glossary page instead [UX-8, UX-9].
2. **Named fallacies use the same mechanism.** A fallacy tag on a point, e.g. «مغالطة رجل القش» (straw man fallacy), is a chip. Tapping it opens a sheet with a short definition, an example, and "dispute this tag".
3. **Glossary entries have status too:** agreed / proposed / contested. Contested terms are listed in the state-of-debate summary (§5).
4. **Wiki-style authoring.** Typing `[[` in the composer suggests terms and points (#IDs). This gives wiki-style linking without forcing markup on users.
5. **Lightweight drift support (product proposal):** keep a versioned definition. When a term's definition changes, flag points that linked the *old* version with "definition changed since this was written".

---

## 5. "State of the debate" summary

### Findings

There is no specific research on debate dashboards. Two pieces of research apply directly:

- NN/g's progressive-disclosure finding that the first screen signals what matters [UX-7].
- The GitHub review model of status counts plus "requested of me" [UX-14].

The empty-state guidance (§6) also applies when the summary has nothing to show: communicate status, teach, and offer the next action [UX-16].

### Implications for the product

The summary is the debate's landing screen. Top to bottom:

1. **"Your turn" banner.** "You owe N replies; oldest is 9 days old", with a button to the oldest one. If N = 0: "Nothing waiting on you. M points await {other}."
2. **Counts by status, as labelled numbers** (not a colour-only chart): Open · Answered · Conceded (by whom) · Withdrawn. Each number is a link into the filtered list [UX-2].
3. **Waiting on whom:** one row per participant with their open-obligation count and oldest age.
4. **Oldest unanswered (top 3–5).**
5. **Recently changed since your last visit:** new points, newly conceded points, edited definitions.
6. **Contested terms and disputed fallacy tags.**
7. **Main claim status line:** e.g. "Main claim: 14 supports, 11 objections; 6 objections still open." Use neutral wording; the product should not declare a winner.
8. **Keep it to one scroll on a phone.** Everything beyond these items sits behind "more" [UX-7].

---

## 6. Onboarding someone who receives a link cold

### Findings

NN/g tested 70 participants on four iOS apps with "deck-of-cards" tutorials [UX-17]:

- Task success: 91% with the tutorial vs 94% without (not significant).
- Perceived difficulty: tutorial readers found tasks *harder* (4.92 vs 5.49 on a 7-point ease scale, p = 0.047).
- Completion time: no significant speed-up.

NN/g recommends asking whether onboarding is needed at all, and preferring contextual help when it is [UX-17]. For empty states, NN/g recommends three things [UX-16]:

- communicate system status (never leave a blank area)
- provide in-context learning cues
- provide direct pathways to key tasks

### Implications for the product

1. **No tutorial carousel.** A cold link opens straight onto the debate's summary (§5), with a one-sentence explainer at the top: "This is a structured debate between A and B about: <main claim>." It dismisses permanently [UX-17].
2. **Identity = name only, asked at the moment of first contribution, not on arrival.** Reading needs no identity. When the visitor taps "reply", a sheet asks «ما اسمك؟» ("What's your name?") and explains the private-link model in one line. Store a device token. Offer a "continue on another device" link later. *This is a product recommendation; we found no research source specifically on name-only guest identity.*
3. **Contextual hints, once each:**
   - first time a status badge is seen: "this tells you who owes a reply"
   - first time the composer opens: "choose: support / objection / reply / concession"

   Dismissed hints never return [UX-17].
4. **Empty states teach and offer an action** [UX-16]:
   - A new debate with no points says "Start by writing the main claim" and gives a button.
   - An empty "Waiting on me" says "You're all caught up" and links to the other person's open items.
   - Show a loading indicator, not "No points", while data is loading.
5. **Point-type picker uses labelled icons** (support / objection / reply / concession, each with a one-line Arabic hint), not bare icons [UX-15].

---

## 7. Arabic / RTL

### 7.1 Direction and layout

**Findings**

- **Set direction in markup, once.** W3C i18n recommends `dir="rtl"` on the `<html>` element for RTL documents. Use `dir` on blocks only where their base direction differs. Do *not* "use CSS to apply base direction"; direction belongs in markup [UX-19].
- **`dir="auto"` for user-generated text.** Use it on forms and on text inserted at run time, so direction is detected from the first strong character. Add the `dirname` attribute to form fields so the direction is submitted with the data [UX-19].
- **Inline isolation.** Use `dir="auto"` on an element that tightly wraps the phrase. Where no element exists, wrap it in `<bdi>`, which behaves like `dir="auto"` and isolates its content from surrounding text [UX-20].
  - Control characters are only for places with no markup, such as `title` attributes. Use U+2068 FIRST STRONG ISOLATE there.
  - Avoid the old embedding controls (RLE/LRE/PDF) because they don't isolate.
  - `bdo` is not for normal use [UX-20].
- **CSS bidi values.** In CSS, `unicode-bidi: isolate` isolates an element from its siblings. `plaintext` computes direction from the element's own content, ignoring the parent [UX-22]. MDN notes the property is primarily for DTD designers and that authors "should not" override it; HTML `dir`/`<bdi>` is the preferred route [UX-22].
- **Use logical CSS properties** (`margin-inline-start`, `padding-block`, `inset-inline-end`, `text-align: start`) so one stylesheet serves RTL and LTR [UX-21]. W3C also advises `start`/`end` over `left`/`right` [UX-19].
- **Mirroring rules** (Wikimedia Codex) [UX-23]:
  - **Mirror:** navigation, buttons, sliders, toggles, pagination, text alignment, step-based progress, and icons with horizontal direction (previous/next arrows).
  - **Do not mirror:** time, phone numbers, URLs, e-mails, currency symbols, time-based progress, images, check marks, media play/pause icons, and charts whose meaning depends on orientation.
  - The question-mark icon needs an Arabic-specific glyph (؟).
- **Material Design.** Its bidirectionality guidance covers the same ground, but its pages did not render for us. Details are unverified from Material directly.

**Implications for the product**

1. Serve `<html lang="ar" dir="rtl">`. Every user-authored block (point body, headline, term, name) renders with `dir="auto"`. Every inline user value inside UI strings, e.g. "بانتظار ردّ: {name}" ("waiting for a reply from: {name}"), is wrapped in `<bdi>`. All composer `<textarea>`/`<input>` fields get `dir="auto"` and `dirname` [UX-19, UX-20].
2. **Ban physical CSS properties in the codebase** (`left`, `right`, `margin-left`, and similar), e.g. with a lint rule. Use only logical properties [UX-21].
3. **Mirror:**
   - tree connector lines (children hang from the start edge = right)
   - the "↑ parent" / drill-in chevrons
   - swipe directions
   - the back arrow
4. **Don't mirror:**
   - #IDs
   - URLs
   - quoted English text
   - timestamps
   - the check-mark "resolved" icon

   Use «؟» for any help icon [UX-23].
5. Mixed text such as an English quote or a fallacy's Latin name inside Arabic text gets its own `dir="ltr" lang="en"` span when the direction is known, and `<bdi>` when it is not [UX-20].

### 7.2 Numerals and dates

**Findings**

- **Digit families vary by region.** W3C's *Arabic & Persian Layout Requirements* (ALReq) lists three digit families. It states Arabic-Indic digits (٠١٢٣…) are used in "Eastern Arabic-speaking countries; e.g. Egypt, Saudi Arabia, Iraq", while Western Arab countries (Algeria, Morocco) use European digits. Decimal and thousands separators also vary [UX-24].
- **Browser default for `ar-SA`.** In a local test of `Intl.NumberFormat` (Node 22, ICU 78.3 / CLDR 48), `ar-SA` and `ar-EG` default to the `arab` numbering system: 1234567.89 → «١٬٢٣٤٬٥٦٧٫٨٩». Plain `ar` and `ar-AE` default to Latin digits. The `-u-nu-latn` extension forces Western digits. The default calendar for `ar-SA` was Gregorian [UX-34].
- **Everyday digit preference in Saudi Arabia.** Western digits are very common in Saudi digital products; this claim is unverified, as we found no authoritative usage survey.

**Implications for the product**

1. Format all numbers and dates through `Intl` with an explicit locale. Don't concatenate digits by hand.
2. **Default to Arabic-Indic digits for `ar-SA`, with a user setting "الأرقام: ١٢٣ / 123"** (digits: Arabic-Indic / Western) that applies `-u-nu-latn`. This respects ALReq and CLDR while accommodating the common Western-digit habit (unverified) [UX-24, UX-34].
3. Point IDs, counts and ages all use the same numbering system, so a screen never mixes digit families. Exception: user-typed text is shown as typed.
4. Show relative ages ("منذ ٣ أيام", "3 days ago") with an absolute date on tap. Use the Gregorian calendar by default; a Hijri option is a possible later setting.

### 7.3 Arabic typography

**Findings**

- **Letter-spacing breaks Arabic.** CSS Text Level 3 §7.2.1 says that if a user agent cannot expand cursive text without breaking connections, it "must not apply spacing between any pair of that script's typographic letter units". The spec's examples label evenly-spaced Arabic as "BAD … breaks cursive joins" [UX-25]. ALReq likewise: "Moving two joined characters closer to or further from each other creates undesirable results." Arabic stretching is done by kashida (elongating joins), not by tracking [UX-24].
- **Styling must keep joins.** ALReq notes that styling an individual letter must not break its joining [UX-24]. It does not cover italics; Arabic has no native italic tradition. Synthesised ("fake") bold/italic from a browser is a general typographic anti-pattern (unverified for Arabic specifically from a primary source).
- **Line height.** ALReq notes that Arabic ascenders and descenders "extend much further than those of the Latin script", so mixed-script lines need care. It gives no numeric line-height [UX-24].
- **Font size.** Practitioner guides commonly advise setting Arabic a couple of points larger than Latin and giving it ~10–15% more line-height. These are rules of thumb only (unverified; no authoritative numeric source found).
- **Legibility research.**
  - Nadine Chahine's 2012 Leiden dissertation *Reading Arabic: legibility studies for the Arabic script* used eye tracking (72 participants). It found that greater complexity in word formation (more elaborate, calligraphic letter combinations) reduces legibility, which favours simpler Naskh-derived text faces for reading speed. This is per the search abstract; full text not read [UX-28].
  - Readex Pro is an Arabic expansion of Lexend designed for legibility (Chahine and Jockin, commissioned by Google Fonts). Its readability benefit for Arabic is a design claim, not independently tested [UX-27].
- **Free fonts.** All of the following are on Google Fonts under the **SIL Open Font License (OFL)**, per the google/fonts repository metadata [UX-26]:

| Font | Category (Google Fonts) | Weights / axes | Designer(s) | Notes for this product |
|---|---|---|---|---|
| Noto Naskh Arabic | Serif (Naskh) | variable wght 400–700 | Google | Classic book-style Naskh; very good for long body text; limited weight range |
| Noto Sans Arabic | Sans | variable wght 100–900, wdth 62.5–100 | Google | Neutral UI face, wide weight range, width axis useful for tight mobile labels |
| IBM Plex Sans Arabic | Sans | 100–700 (7 statics) | Mike Abbink, Bold Monday, Khajag Apelian, Wael Morcos | Good UI/body pairing with Plex Latin; statics mean more files |
| Readex Pro | Sans | variable wght 160–700, HEXP 0–100 | Thomas Jockin, Nadine Chahine, Bonnie Shaver-Troup et al. | Designed for legibility (Lexend method); wider spacing [UX-27] |
| Amiri | Serif (Naskh) | 400, 700 | Khaled Hosny, Sebastian Kosch | Elegant classical Naskh; better for quotes/headings than dense UI |
| Tajawal | Sans | 200–900 (7 statics) | Boutros Fonts | Popular geometric UI sans; low-contrast |
| Cairo | Sans (also Display) | variable wght 200–1000, slnt −11–11 | Mohamed Gaber et al. | Popular UI face (style characterisation unverified); has slant axis (avoid for Arabic "italic") |
| Almarai | Sans | 300–800 | Boutros Fonts | Clean UI face, used widely in Gulf products (unverified) |
| Noto Kufi Arabic | Sans (Kufi) | variable wght 100–900 | Google | Headings/labels; Kufi likely less suited to long reading (unverified) |

**Implications for the product**

1. **Body font:** one legibility-oriented face. Candidates are Noto Sans Arabic, IBM Plex Sans Arabic or Readex Pro. Prefer a **variable** font so one file covers all weights. Use the same family for UI and body. An optional Naskh face (Noto Naskh Arabic / Amiri) can serve quoted material. Subset to Arabic + Basic Latin and self-host or preload (§8). All are OFL [UX-26].
2. **Never set `letter-spacing` on Arabic text.** Reset it to `normal` in Arabic contexts, including uppercase-style "label" tokens copied from Latin design systems [UX-25, UX-24].
3. **No synthetic styles:**
   - Set `font-synthesis: none`.
   - Load real bold weights.
   - Express emphasis with weight or colour plus a marker, not italics.
   - Don't use Cairo's slant axis as "italic" [UX-24].
4. **Starting metrics (to be tested on devices):**
   - body ≥ 17–18 px for Arabic, vs the common 16 px for Latin
   - line-height ~1.7–1.8
   - measure ~45–70 characters

   These numbers are heuristics (unverified); validate them with real users on a mid-range Android phone.
5. **Mixed-script lines.** Choose a family with a matched Latin (Plex, Noto, Readex all have one). This avoids vertical-metric clashes, which ALReq flags because Arabic extents exceed Latin [UX-24].
6. **Justification:** use `text-align: start`, not `justify`. Browser justification of Arabic usually widens spaces rather than using proper kashida (unverified per browser).

---

## 8. Mobile performance

### Findings

- **Core Web Vitals "good" thresholds,** measured at the **75th percentile** of page loads and segmented by mobile vs desktop [UX-29]:
  - **LCP ≤ 2.5 s**
  - **INP ≤ 200 ms**
  - **CLS ≤ 0.1**
- **INP bands.** 200–500 ms "needs improvement" and >500 ms is "poor". INP measures click/tap/keyboard latency until the next paint, across the whole visit [UX-30].
- **Baseline device and network.** Alex Russell's *Performance Inequality Gap 2024* [UX-31]:
  - recommends a baseline device at the 2020–21 global ASP (~$350–375), with the **Samsung Galaxy A51** as the stand-in
  - P75 network: **7.2 Mbps down / 1.4 Mbps up / 94 ms RTT**
  - P75 budgets for a 3-second target: ~**1.4 MiB total with ~75 KiB JS** for markup-centric sites, or ~**730 KiB total split 365/365** for JS-heavy SPAs
- **List virtualisation** renders only visible rows. It keeps the DOM small and scrolling smooth. Caveats [UX-32]:
  - blank flashes on fast scroll (mitigated by overscan)
  - variable-height items need measurement logic
  - measure first, virtualise only where needed
- **`content-visibility: auto`** skips rendering of off-screen sections; `contain-intrinsic-size` reserves their space so the scrollbar doesn't jump. web.dev reports 232 ms → 30 ms initial render in its example. Off-screen content remains searchable with find-in-page and stays in the accessibility tree [UX-33].

### Implications for the product

1. **Target device:** a Galaxy A51-class Android (or Nokia G100) on throttled ~7 Mbps / 94 ms RTT [UX-31]. Test on this every release.
2. **Budgets:** LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at P75 on mobile [UX-29, UX-30]. Ship server-rendered HTML with JS ≲ 100–150 KiB compressed for the reading view. Russell's markup-based budget is 75–100 KiB [UX-31]. The composer and map view load on demand.
3. **Fonts are the main LCP/CLS risk.**
   - Use one variable Arabic font, subset, preloaded, with `font-display: swap`.
   - Use size-matched fallback metrics to avoid layout shift.
4. **Focus navigation (§1) already bounds render size,** because one node plus its first two levels is rendered at a time. For long flat lists (inbox, search results, "all points"), use `content-visibility: auto` first because it preserves find-in-page and accessibility [UX-33]. Escalate to virtualisation only if measured INP or scroll jank requires it [UX-32].
5. **Reserve space** for badges, avatars and collapsed rows (fixed heights / `contain-intrinsic-size`) so status updates never shift layout (CLS).
6. **Taps must give feedback within one frame.** Optimistic UI for status changes keeps INP low [UX-30].

---

## Sources

**[UX-1]** Understanding SC 2.5.8: Target Size (Minimum) (WCAG 2.2) — W3C WAI, 2023 — https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html — 24×24 CSS px minimum (AA) and exceptions; references 44×44 CSS px for SC 2.5.5 Enhanced.

**[UX-2]** Understanding SC 1.4.1: Use of Color — W3C WAI, (WCAG 2.2 edition) — https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html — colour must not be the only means of conveying information.

**[UX-3]** Touch target size — Google, Android Accessibility Help, n.d. — https://support.google.com/accessibility/android/answer/7101858 — 48×48 dp targets, ≥8 dp spacing, ~9 mm; padding counts toward target. (Seen through search-result excerpts of Google's page.)

**[UX-4]** Human Interface Guidelines: Accessibility — Apple, n.d. — https://developer.apple.com/design/human-interface-guidelines/accessibility — 44×44 pt minimum hit target. (Page did not render for us; figure confirmed only through secondary sources, so unverified from Apple directly.)

**[UX-5]** Accordions Are Not Always the Answer for Complex Content on Desktops — Nielsen Norman Group, n.d. — https://www.nngroup.com/articles/accordions-complex-content/ — accordions more suitable on mobile; costs of hidden content; allow multiple open sections and persist state.

**[UX-6]** Breadcrumbs: 11 Design Guidelines for Desktop and Mobile — Nielsen Norman Group, n.d. — https://www.nngroup.com/articles/breadcrumbs/ — avoid multiline trails on mobile; truncate to parent; ≥1 cm tap targets; hierarchy not history.

**[UX-7]** Progressive Disclosure — Nielsen Norman Group, n.d. — https://www.nngroup.com/articles/progressive-disclosure/ — defer advanced options; more than two levels typically has low usability.

**[UX-8]** Tooltip Guidelines — Nielsen Norman Group, n.d. — https://www.nngroup.com/articles/tooltip-guidelines/ — tooltips unavailable on touchscreens; popup tips as touch alternative.

**[UX-9]** Bottom Sheets: Definition and UX Guidelines — Nielsen Norman Group, n.d. — https://www.nngroup.com/articles/bottom-sheet/ — five guidelines: Back dismisses, visible Close, no stacking, not for page-to-page flows, short interactions only.

**[UX-10]** About the Discussion Minimap — Kialo Edu Help Center, n.d. — https://support.kialo-edu.com/en/hc/argument-tree — Tree vs Sunburst navigation; sunburst confusing for newcomers; tree recommended for new users; pro/con colours.

**[UX-11]** Khartabil, Collins, Wells — Design and Evaluation of Visualization Techniques to Facilitate Argument Exploration — Eurographics Digital Library, 2021 — https://diglib.eg.org/items/70e0bf0c-a653-4e83-a5d0-71cbe19725e7/full — sunburst/icicle techniques for exploring argument trees. (Only listing/search excerpt seen; page returned 403; findings unverified.)

**[UX-12]** T116686: Very long discussions (horizontal axis) on talk pages become unreadable — Wikimedia Phabricator, 2015 (ongoing) — https://phabricator.wikimedia.org/T116686 — nesting depth unreadable on mobile; options: reduced indent, connecting lines, depth cap 4–6, no indent (Android), collapsible threads.

**[UX-13]** Commenting on a pull request — GitHub Docs, n.d. — https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/commenting-on-a-pull-request — resolving collapses the conversation and marks it resolved; who may resolve.

**[UX-14]** Searching issues and pull requests — GitHub Docs, n.d. — https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests — `review:none/approved/changes_requested`, `user-review-requested:@me` qualifiers ("who owes a review" model).

**[UX-15]** Icon Usability — Nielsen Norman Group, n.d. — https://www.nngroup.com/articles/icon-usability/ — icons need visible text labels; hover-revealed labels don't work on touch.

**[UX-16]** Designing Empty States in Complex Applications: 3 Guidelines — Nielsen Norman Group, n.d. — https://www.nngroup.com/articles/empty-state-interface-design/ — communicate status, provide learning cues, provide direct pathways.

**[UX-17]** Mobile-App Onboarding / Tutorials study ("Deck-of-cards tutorials") — Nielsen Norman Group, n.d. — https://www.nngroup.com/articles/mobile-tutorials/ — 70-participant test: no success/time benefit, tasks perceived harder (p = 0.047); prefer contextual help.

**[UX-18]** Page Previews — MediaWiki.org (Wikimedia Foundation), n.d. — https://www.mediawiki.org/wiki/Page_Previews — A/B results: more precise page selection, more distinct pages read, ~0.01% disable rate; Android preview +20% links clicked per page.

**[UX-19]** Structural markup and right-to-left text in HTML — W3C Internationalization, n.d. — https://www.w3.org/International/questions/qa-html-dir — `dir="rtl"` on `<html>`; `dir="auto"` and `dirname` for user content; don't set base direction with CSS; prefer start/end.

**[UX-20]** Inline markup and bidirectional text in HTML — W3C Internationalization, n.d. — https://www.w3.org/International/articles/inline-bidi-markup/ — `<bdi>` / `dir="auto"` isolation; FSI U+2068 where no markup; avoid RLE/LRE/PDF; `bdo` not for normal use.

**[UX-21]** CSS logical properties and values — MDN Web Docs, n.d. — https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values — inline/block logical properties and `text-align: start`.

**[UX-22]** unicode-bidi — MDN Web Docs, n.d. — https://developer.mozilla.org/en-US/docs/Web/CSS/unicode-bidi — `isolate` and `plaintext` semantics; authors should not normally override.

**[UX-23]** Bidirectionality — Wikimedia Codex design system, n.d. — https://doc.wikimedia.org/codex/latest/style-guide/bidirectionality.html — what to mirror / not mirror (icons, time, numbers, URLs, progress, media controls, question mark).

**[UX-24]** Arabic & Persian Layout Requirements (ALReq) — W3C Group Draft Note, 2 Oct 2025 — https://www.w3.org/TR/alreq/ — digit families and regional use (Arabic-Indic in Saudi Arabia/Egypt/Iraq); kashida justification; moving joined letters is harmful; Arabic vertical extents exceed Latin.

**[UX-25]** CSS Text Module Level 3, §7.2.1 Cursive Scripts — W3C, (current TR) — https://www.w3.org/TR/css-text-3/#cursive-tracking — UA must not apply letter-spacing that breaks cursive joins; even spacing of Arabic labelled "BAD".

**[UX-26]** google/fonts repository METADATA.pb for Noto Naskh Arabic, Noto Sans Arabic, IBM Plex Sans Arabic, Amiri, Readex Pro, Tajawal, Cairo, Almarai, Noto Kufi Arabic — Google Fonts (GitHub), retrieved 2026 — https://github.com/google/fonts/tree/main/ofl — license (OFL), designers, categories, weights/axes listed in §7.3 table.

**[UX-27]** Readex Pro: legibility in Arabic type design — Material Design blog (Google), 2023 — https://material.io/blog/readex-pro-legibility-arabic-type-design — Readex Pro as Arabic expansion of Lexend by Chahine & Jockin, commissioned by Google Fonts. (Seen through search excerpt.)

**[UX-28]** Chahine, N. — Reading Arabic: legibility studies for the Arabic script (PhD dissertation) — Leiden University, 2012 — https://scholarlypublications.universiteitleiden.nl/handle/1887/20022 — eye-tracking (72 participants); more complex word formation reduces legibility. (Search abstract only; full text not read.)

**[UX-29]** Web Vitals — web.dev (Google), n.d. — https://web.dev/articles/vitals — LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at 75th percentile, segmented by device.

**[UX-30]** Interaction to Next Paint (INP) — web.dev (Google), n.d. — https://web.dev/articles/inp — INP bands (≤200 / ≤500 / >500 ms) and what is measured.

**[UX-31]** Russell, A. — The Performance Inequality Gap, 2024 — infrequently.org, 2024 — https://infrequently.org/2024/01/performance-inequality-gap-2024/ — Galaxy A51 baseline; P75 7.2/1.4 Mbps, 94 ms RTT; page-weight and JS budgets.

**[UX-32]** Virtualize large lists with react-window — web.dev (Google), n.d. — https://web.dev/articles/virtualize-long-lists-react-window — windowing benefits and caveats.

**[UX-33]** content-visibility: the new CSS property that boosts your rendering performance — web.dev (Google), n.d. — https://web.dev/articles/content-visibility — skip off-screen rendering; `contain-intrinsic-size`; 232 ms → 30 ms example; find-in-page/accessibility preserved.

**[UX-34]** Local test: `Intl.NumberFormat` / `Intl.DateTimeFormat` default numbering system and calendar per Arabic locale — Node.js v22.23.4 (ICU 78.3, CLDR 48), run 2026-11-13 — no URL (own observation) — `ar-SA`/`ar-EG` default to Arabic-Indic digits; `ar`/`ar-AE`/`ar-MA` to Latin; `ar-SA` calendar Gregorian; `-u-nu-latn` forces Western digits.
