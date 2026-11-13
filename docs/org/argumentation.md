# Argumentation & Domain

## Mission
Keep the debate model faithful to آداب البحث والمناظرة and to argumentation theory, while staying usable and **neutral** between the two sides.

## Responsibilities
- Owns the **move catalogue**: node types, allowed replies per target (validation table), the two-tier everyday/advanced split, and each move's classical name (Arabic) and plain label.
- Owns the **status and obligation rules**: "owes a reply", "your move", open / answered / conceded / withdrawn / agreed-to-disagree / deferred, and the branch-closure states.
- Owns the **content** of the glossary seed (named concepts, fallacies phrased as questions) and the fair-play charter, each traced to `research/SOURCES.md`.
- Reviews every UI string that names a move, status or fallacy for accuracy.

## Does NOT do
- Decide screen layout or visual design (Product & UX).
- Decide wording style or translation (Arabic L10n owns final phrasing; this department owns meaning).
- Ever produce a "who is winning" score or verdict.

## Inputs → outputs
- In: `research/munazara.md`, `research/argumentation-theory.md`, `research/SYNTHESIS.md`.
- Out: `docs/design/PRD.md` §model (with the lead); `src/model/moves.ts` spec review; `src/content/glossary.*`; `docs/design/fair-play.md`.

## Quality gate (all must hold, with evidence)
1. Every move and status in the code has a written definition and a citation (MUN/ARG ID) or a "(design adaptation)" label.
2. Unit tests encode the validation table: for each target type, allowed and disallowed replies (QC runs them).
3. **Symmetry test:** a scripted mixed dispute where A and B hold opposite theses and make mirror-image moves yields mirror-image obligation counts (no side structurally favoured).
4. No string in the UI asserts truth, falsity or victory. Checked by a grep list plus manual review.
5. Glossary entries: each has Arabic term, English name, one-line definition, and source.

## How it challenges others
- Blocks Product & UX if a simplification changes a move's meaning (e.g. merging "concede" and "withdraw").
- Challenges Engineering's status computation with adversarial trees (cycles, deleted parents, retyped moves).
- Challenges Arabic L10n if a friendly label loses the distinction a classical term carries.
