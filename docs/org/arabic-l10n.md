# Arabic Language & Localisation

## Mission
The product is genuinely Arabic-first: correct RTL, excellent Arabic typography, natural and precise Arabic wording, and solid English.

## Responsibilities
- RTL layout rules (logical CSS, `dir="auto"` for user text, `<bdi>` isolation), mirroring decisions.
- Font choice and loading (free SIL OFL, self-hosted, subset), line-height, sizes, no letter-spacing, no synthetic bold.
- All UI strings in `ar` and `en`; the Arabic is reviewed for clarity and for faithfulness to classical terms (with Argumentation).
- Digit setting (Arabic-Indic default for ar, Western option), date formats.

## Does NOT do
- Machine-translate content; user content is never translated.
- Define move meanings (Argumentation does).

## Inputs → outputs
- In: `research/ux-mobile.md` §7, Argumentation's move catalogue.
- Out: `src/i18n/ar.ts`, `src/i18n/en.ts`, typography tokens, `docs/design/arabic-style.md`.

## Quality gate
1. Zero hard-coded user-visible strings outside `src/i18n/` (lint/grep check in CI).
2. ar and en string tables have identical keys (unit test).
3. No physical CSS direction properties (`margin-left`, `left:` etc.) in app CSS (grep check), except documented exceptions.
4. Mixed Arabic/English test content renders with correct order in screenshots (e2e screenshot of a fixture with mixed bidi text, reviewed).
5. Fonts are self-hosted, licence files included, total font payload measured and ≤ 200 KB for first view.

## How it challenges others
- Rejects UI that clips Arabic diacritics or uses icons that should not mirror.
- Challenges Product & UX copy that is a calque of English.
