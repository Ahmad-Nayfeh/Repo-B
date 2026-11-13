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
