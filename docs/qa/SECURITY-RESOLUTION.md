# Security review — resolution log

Review: `SECURITY-REVIEW.md` (independent, fresh context). Each finding was re-checked against the code before fixing.

| ID | Severity | Resolution | Evidence |
|---|---|---|---|
| S1 invite with known id, other secret, injects events | Critical | **Fixed.** `acceptJoinLink` refuses a secret that differs from the stored one. Plain-JSON import removed (it accepted events for any debate id without the key); export remains. | e2e `security.spec.ts`; `service.ts` |
| S2 one malformed signed event blanks the app | Critical | **Fixed.** Strict shape validation at ingest (`model/validate.ts`); `derive` skips malformed events; `refreshList` / `reload` never throw. | unit: "malformed but signed events are dropped", "malformed events are skipped, never thrown on" |
| S3 identity link silently replaces identity | High | **Fixed.** personId must equal hash(pub); private key must sign verifiably for pub; a device whose identity has written points keeps it; otherwise the user confirms. | `service.ts acceptIdentityPayload`; e2e `identity.spec.ts` |
| S4 event-id squatting | Medium | **Fixed.** Event ids are content-addressed (SHA-256 of content without id/sig/node.id); node id = event id; mismatches rejected. | unit: "rejects squatted ids" |
| S5 backdating to take creator/title/name; hide "edited" | Medium | **Fixed.** debateId = hash(creator personId + salt), forged `debate.create` rejected; duplicate names all carry a key fingerprint (no first-come advantage); "edited" marker shown whenever text changed. Residual: "edited *after a reply*" still relies on author clocks. | unit: "debate.create is bound to its creator", "duplicate names are ALL marked" |
| S6 malformed pub key throws in ingest | Medium | **Fixed.** Shape validation + per-event try/catch in `verifyBatch`. | unit: "malformed but signed events are dropped" |
| S7 decompression bomb / oversized events | Medium | **Fixed.** Inflate capped at 32 MiB; field length limits; ≤ 20,000 events per batch. | unit: "decompression is capped" |
| S8 title in share text / file name | Low | **Fixed.** Share texts and backup file names carry no title. | i18n strings; `backupFile()` |
| S9 relays can fake acknowledgements | Low | **Accepted, documented.** Acks only decide what to re-send; every device keeps the full log, so a lying relay cannot cause loss on its own. Full anti-entropy is ROADMAP #2. | `docs/ROADMAP.md` |
| S10 relay mode preselected | Low | **Fixed.** Sync mode has no default; the user must choose. | `NewDebate.tsx`, `Join.tsx` |
| S11 "questioner only" not enforced | Low | **Accepted.** It is a declared stance, not a restriction; a questioner may later make claims (the tradition allows role changes, MUN §1). Label wording unchanged. | — |
| S12 actions pinned to tags | Low | **Fixed.** All actions pinned to commit SHAs. Pages deploys from the working branch because it is the repository's default branch (D-013). | `.github/workflows/*.yml` |
