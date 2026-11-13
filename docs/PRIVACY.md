# Privacy — what the app does with your data

The same text is shown in the app under «عن الموقع والخصوصية» (About & privacy).

| Data | Where it lives | Who can read it |
|---|---|---|
| The debate (all points) | In your browser's storage on your device (IndexedDB), unencrypted at rest | Anyone who can unlock and inspect your device |
| Copies in transit, **relay mode only** | Public Nostr relays run by third parties (fixed list in `src/sync/engine.ts`) | Nobody without the invite link: AES-256-GCM ciphertext. Relays see timing, size, IP address and a per-debate tag, and can link one debate's activity together. No retention guarantee. |
| The room secret (key) | The invite link's fragment (`#…`), your device, and wherever you sent the link (WhatsApp chat and its backups) | Anyone who has the invite link |
| Your signing key | Your device; the identity link if you create one | You; anyone you send the identity link to |
| Your visit to the site | GitHub Pages logs visitor IP addresses for security | GitHub |

**The app never:** runs analytics or trackers, loads third-party fonts/scripts/CDNs, sends the part of the link after `#` to any server, stores plaintext on any server, or allows indexing (`noindex`).

**Manual mode** makes no network requests except loading the site itself (verified in the end-to-end tests: zero requests to other hosts).

**Integrity:** every point is signed by its author's key; event ids are content hashes; a debate id is bound to its creator; malformed or unverifiable data is dropped on arrival. Only the encrypted backup (`.txt`) can be imported — plain JSON is export-only.

**Limits we state plainly**
- A sent invite link cannot be revoked. Moving to a new link (re-key) is on the roadmap.
- Anyone with the invite link can join as a *new* participant. They cannot write as an existing participant: every point is signed with its author's key.
- Removing the secret from the address bar after opening a link is hygiene, not protection: the link remains in WhatsApp and may remain in synced browser history.
- iPhone: Safari may delete site data after 7 days without interaction unless the site is installed to the home screen; the installed app has storage separate from Safari.
