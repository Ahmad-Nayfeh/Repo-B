# Roadmap

Priority order. Each item passes the same gates as v1 (tests, review, measured results). Reasons and sources: `docs/DECISIONS.md`, `docs/design/PRD.md` §10–11.

## Next (v1.1)
1. **Re-key / move to a new link** — the only way to "revoke" a leaked invite link.
2. **Relay anti-entropy** — every device republishes *all* events it holds (not only its own), so relays can be repaired from either phone.
3. **Editable relay list** in the sync screen, with health history.
4. **Deferred status** («مؤجل») for points you want to answer later without them looking ignored.
5. **Manual mode: smaller updates and receipts** — update links currently carry the whole history when it fits (they grow with the debate) and nothing confirms the other person received one; send deltas since the last *acknowledged* update and show "seen up to".
6. **Commitments & shared ground view** per participant (asserted / conceded / withdrawn; المسلّمات).

## Then
7. More classical moves: التنزّل (concede for argument's sake), القول بالموجب (granted, but it doesn't follow), counter-proof forms (قلب / مثل / غير), definition objections (غير جامع / غير مانع / دور / أخفى).
8. Fallacy tags on challenges, always phrased as questions.
9. Automatic underlining of agreed terms in text (Arabic-aware: ال، و، ف، ب، ل).
10. Markdown and Argdown export.
11. App passcode (encrypt data at rest on the device); room-tag rotation to reduce relay-side linkage.
12. Optional free backend adapter (Cloudflare Durable Objects) for guaranteed retention — setup guide for the owner.
13. Map view for desktop.

## Research / experiments
14. On-device transcription of WhatsApp voice notes (Whisper/Moonshine in the browser) — opt-in, with an explicit consent and download-size screen. Today Arabic accuracy at phone-sized models is too low (research/voice.md).
15. Live peer-to-peer channel when both people are online.
