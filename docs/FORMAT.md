# Data format (v1)

Users own their debates. This is the format of exports and of everything the app stores.

## Plain JSON export (`.json`)
```json
{ "format": "munazara-debate", "version": 1, "debate": { "id": "…", "title": "…" }, "events": [ … ] }
```
Every event:
| field | meaning |
|---|---|
| `id` | random 128-bit id, base64url |
| `debateId` | the debate |
| `authorId` | personId = base64url(first 16 bytes of SHA-256(raw P-256 public key)) |
| `at` | author's clock, milliseconds |
| `v` | 1 |
| `type` | `debate.create`, `person.join`, `person.rename`, `node.add`, `node.edit`, `node.retype`, `debate.retitle` |
| `sig` | ECDSA P-256/SHA-256 over the canonical JSON of the event without `sig` (keys sorted, `undefined` omitted) |

`node.add` carries `node: { id, parentId, move, text, meta? }`; moves and their rules are in `docs/design/PRD.md` §3.2–3.4. Statuses and obligations are **not stored**; they are computed from the events (`src/model/derive.ts`).

## Encrypted backup (`.txt`)
```
MUNAZARA-BACKUP v1 <debateId>

<base64url lines>
```
The body is the plain JSON above, compressed (deflate-raw) and encrypted with AES-256-GCM (12-byte IV prefix) using the key derived from the debate's room secret (HKDF-SHA-256, salt `munazara`, info `munazara/v1/enc`). Restoring needs the invite link (which carries the room secret) on that device.

## Links
| link | content |
|---|---|
| `#/j/<debateId>.<roomSecret>[.<snapshot>]` | invite: the room secret (32 bytes, base64url) and optionally all events, encrypted |
| `#/u/<debateId>.<payload>` | update: encrypted events, **no key** |
| `#/i/<debateId>.<payload>` | identity: the person's signing key, encrypted — send only to yourself |
