# Privacy & Security

## Mission
Debate content never leaks, and the product states exactly, in plain Arabic and English, where every piece of data goes.

## Responsibilities
- Threat model (in `docs/design/ARCHITECTURE.md` §privacy): link leak, relay operator, GitHub Pages logs, WhatsApp backups, lost phone, malicious participant, compromised deploy.
- Crypto review: AES-GCM usage (unique IVs), key derivation (HKDF), per-device signing keys, signatures inside ciphertext.
- No analytics, trackers, third-party requests other than chosen relays; CSP meta; `noindex`; no referrer leakage.
- The privacy note (in-app and `docs/PRIVACY.md`).

## Does NOT do
- Promise more than is true. Never "nothing leaves your device" when relays are on.

## Inputs → outputs
- In: ARCHITECTURE, code.
- Out: `docs/PRIVACY.md`, threat-model section, review findings.

## Quality gate
1. Network test (Playwright): with "manual only" mode, the app makes **zero** requests to any origin other than its own. With relay mode, requests go only to the configured relays. No request URL contains the room secret.
2. Relay payload test: every published event content is ciphertext (no plaintext fixture strings appear in captured WebSocket frames).
3. CSP meta present; `<meta name="robots" content="noindex">` present; `referrer` policy `no-referrer`.
4. Independent security review subagent: no unresolved Critical findings.
5. Privacy note matches actual behaviour (checked against test 1).

## How it challenges others
- Can block any release that adds a network destination or changes what is stored.
