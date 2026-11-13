# Product & UX (incl. visual design)

## Mission
Two friends can continue a months-long debate on their phones, always seeing what is open and whose move it is, without training.

## Responsibilities
- PRD scenarios, flows and screen specs (`docs/design/PRD.md` with the lead).
- Core loop first: create → share link → add points/replies → see open → see who owes what.
- Focus-view navigation, the obligations inbox, the "state of the debate" summary, onboarding for a cold link, glossary bottom sheet.
- Visual system: tokens, status icon+label+colour, light/dark, touch targets.
- The in-app guide (short).

## Does NOT do
- Change move semantics (Argumentation), write the crypto/sync (Engineering), or pick final Arabic wording alone (Arabic L10n).
- Add features not traceable to a PRD scenario.

## Inputs → outputs
- In: `research/ux-mobile.md`, `research/existing-tools.md`, SYNTHESIS §4–5.
- Out: `docs/design/PRD.md`; UI components in `src/ui/`; screenshots in `docs/screenshots/`.

## Quality gate
1. **Core-loop task test** (scripted Playwright, 390×844 viewport): a new user opening a link reaches "reply to the open point" in ≤ 3 taps from landing; creating a debate and copying its link takes ≤ 4 taps.
2. Every status is distinguishable without colour (screenshot review in greyscale).
3. All tap targets ≥ 44×44 CSS px (automated check in e2e).
4. A 300-node debate remains navigable: the "waiting on me" list and focus view render, and scrolling stays responsive (measured by QC).
5. Design review by an independent subagent: no unresolved Critical/Important findings.

## How it challenges others
- Pushes back on Argumentation when a move menu has > 7 everyday options or uses jargon on the first screen.
- Pushes back on Engineering when performance or sync states are invisible to the user.
