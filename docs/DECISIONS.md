# Decision log

Each entry: date, decision, reasoning, alternatives rejected, how to reverse.

## D-001 · 2026-11-13 · Work on branch `claude/new-session-1cdurq`
- **Decision:** The session is configured to push only to `claude/new-session-1cdurq`. All work goes there. The repo had no commits, so this branch is the first history.
- **Reasoning:** Session constraint. Merging to `main` / enabling Pages may need owner action; see `NEEDS-AHMAD.md` if so.
- **Reverse:** merge the branch into `main`.

## D-002 · 2026-11-13 · Repository facts that shape deployment
- Checked via GitHub search API: repo `Ahmad-Nayfeh/Repo-B` is **public**, `has_pages: false`, default branch is `claude/new-session-1cdurq` (the only branch).
- Public repo ⇒ GitHub Pages is available on the free plan. Source code and docs are public; **debate content never lives in the repo**, so this does not affect privacy.
- Deployment plan is decided in Phase 4 (try enabling Pages through the Actions workflow; fallback = exact clicks in `NEEDS-AHMAD.md`).

## D-003 · 2026-11-13 · Core model = munazara move set, adapted for friends (pending design)
- **Decision:** The debate model is built on آداب البحث والمناظرة: roles per thesis (المعلِّل / السائل), typed challenge moves (منع، نقض، معارضة، طلب تصحيح النقل، استفسار), a respondent reply catalogue, and "who owes a reply" computed from the burden rule.
- **Evidence:** `research/munazara.md` §1–3, §7; convergence with pragma-dialectics and commitment-store dialogue theory (`research/argumentation-theory.md` §5–6).
- **Adaptations:** async multi-branch play; soft reframing instead of hard blocks (الغصب، المكابرة); extra "agreed to disagree" state.
- **Rejected:** a generic pro/con tree (Kialo-style) — tracks structure but not obligation (`existing-tools.md` §15); full formal Toulmin/Walton schemes as mandatory input — too much cognitive load (`argumentation-theory.md` §1, §8).
- **Reverse:** the model is data; move types can be added/renamed without migrating storage.

## D-004 · 2026-11-13 · Storage = local-first encrypted event log; Nostr relays as mailbox; manual link/file fallback
- **Evidence:** `research/tech-feasibility.md` §1–4, §9. P2P cannot serve async use; keyless JSON stores are dead or keyed; Nostr relays are the only zero-account store-and-forward that worked in tests.
- **Rejected:** CRDT libraries (unneeded; Automerge too heavy); P2P-only; keyless JSON stores; Supabase/Appwrite (inactivity pausing); InstantDB (shutting down).
- **Risk accepted:** no retention guarantee → every device keeps the full log and republishes; backup file prompts; home-screen install encouraged.
- **Reverse:** transports sit behind one interface; a backend adapter can replace relays.

## D-005 · 2026-11-13 · Voice: text-only in v1, guidance for phone dictation
- **Evidence:** `research/voice.md`. No free, private, in-browser Arabic speech-to-text is usable on mid-range phones today.
- **Rejected:** Web Speech API (sends audio to Google/Apple on phones); in-browser Whisper (weak Arabic accuracy at phone-sized models, large downloads).
- **Reverse:** a future opt-in on-device transcription tool, with explicit consent.

## D-006 · 2026-11-13 · Obligations are symmetric: "owes a reply" and "your move" (changes D-003)
- **What changed:** "who owes a reply" is no longer the classical claimant-only burden alone. Both people's standpoints are recorded at the start (mixed dispute), and the app shows two equally prominent signals for both people: *owes a reply* (burden) and *your move* (your challenge was answered).
- **Evidence:** independent review finding F1 (`research/REVIEW-synthesis.md`): a claimant-only count silently favours whoever frames his side as doubt — a hidden verdict that breaks the "never judge" rule.
- **Rejected:** classical one-directional burden as the only signal.

## D-007 · 2026-11-13 · Per-device signing keys; explicit sync-mode consent (changes D-004)
- **What changed:** relay events are signed with per-device keys, not a key derived from the link; the user chooses "public relays (encrypted)" or "manual only" on a clear screen when creating/joining.
- **Evidence:** review findings F2 (a shared key lets any link holder trigger NIP-09/NIP-62 deletion of all relay copies), F3 (opt-out is not "clear about where data is stored").

## D-008 · 2026-11-13 · Two-tier move set, type correctable later (refines D-003)
- **What changed:** a short everyday menu in plain Arabic (classical move underneath), finer classical moves under "more"; a reply's author can re-type it later.
- **Evidence:** review F6; cognitive-load findings (`argumentation-theory.md` §2, §8); vocabulary friction in Kialo Edu study (`existing-tools.md`).

## D-009 · 2026-11-13 · Phase 1 exit passed
- Independent review found 2 Critical, 6 Important, 9 Minor issues; all resolved in `research/SYNTHESIS.md` §10. Six key sources were spot-checked by the reviewer and confirmed.

## D-010 · 2026-11-13 · Seven departments (Phase 2)
- **Decision:** Argumentation & Domain; Product & UX (incl. visual); Arabic Language & Localisation; Engineering; Privacy & Security; QC (incl. testing); QA & Release. Charters in `docs/org/`.
- **Reasoning:** each maps to a distinct failure mode found in research (model fidelity/fairness; mobile usability; Arabic-first; feasibility; privacy; conformance; usefulness).
- **Rejected:** separate R&D, Visual Design, Testing, Release departments (merged; see `docs/org/README.md`). Merging keeps gates real instead of theatrical for a one-lead team.

## D-011 · 2026-11-13 · Design choices in PRD/ARCHITECTURE (Phase 3)
- **Single reply tree; statuses and obligations computed, never stored.** Reason: one source of truth; merge stays a trivial set union. Rejected: stored status fields (conflicts across devices).
- **Key in link used once, then URL rewritten to `#/d/<id>`.** Reason: the secret should not sit in the address bar/history. Reversible.
- **v1 identity is self-declared per debate; no per-person signatures.** Reason: every link holder can already write (trust model = link); signatures add key-transfer UX across devices for little v1 gain. Disclosed in privacy note; ROADMAP item. Rejected for v1: per-person ECDSA keys with transfer links.
- **Preact + signals, no CRDT, @noble crypto only.** Reason: JS budget ≤ 150 KiB gzip (SYN §5). Rejected: React (size), Automerge (size), Yjs (unneeded).
- **Nostr transport lazy-loaded; tests use a local mock relay only.** Reason: first-load budget; tests must never write to public relays.

## D-012 · 2026-11-13 · Design revised after independent design review (Phase 3 exit)
- Review: `docs/design/REVIEW-design.md` — 4 Critical, 16 Important, 7 Minor findings + 5 web-checked assumptions. All resolved in PRD v1.1 / ARCHITECTURE v1.1 (table in PRD §11).
- **Biggest changes:** single validity+obligation matrix (PRD §3.3–3.4) with dead/moot rules and per-target counting; iOS paste-link path (installed PWA has separate storage); update links carry no key; encrypted `.txt` backup by default; **every event signed by a per-person key** (reverses the "no signatures in v1" part of D-011 — fabricated statements under a real name are a serious risk in faith debates); fixed relay list re-tested with kind 4333 (TECH-54).
- **Disagreed with reviewer (partly):** kept `refute` and `ask_source` in v1-should (cheap in the model, core munazara moves the owner values); kept the "only questioning" option with neutral wording (a pure sceptic is a legitimate position; "your move" keeps symmetry).
- **Cut to ROADMAP:** retype after replies, grant_arg, granted_irrelevant, counter forms, fallacy tags, auto-linking, commitments view, Markdown export, editable relays, full anti-entropy.

## D-013 · 2026-11-13 · Deploy from the working branch; Pages enablement is an owner click
- Default branch is `claude/new-session-1cdurq` (only branch). The Pages workflow deploys from it (and from `main` if it is created later). `configure-pages` enablement needs a non-default token, so the one-time setting is in `NEEDS-AHMAD.md` §1.
- No `main` branch created: the session may push only to its working branch. Reverse: create `main` from this branch and change the default branch.
