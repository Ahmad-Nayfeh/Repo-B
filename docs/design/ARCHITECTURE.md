# ARCHITECTURE — مناظرة

Status: v1 design, Phase 3. Owner: Engineering + Privacy & Security (with the lead).
Evidence: `research/tech-feasibility.md` (TECH), `research/SYNTHESIS.md` §6 (SYN).

---

## 1. Overview

A static, client-only TypeScript PWA on GitHub Pages. No server of ours. Each device holds the complete debate as an **encrypted-at-rest-optional, append-only event log** in IndexedDB. Devices exchange events through pluggable **transports**: a manual link/file transport (always available), a public-Nostr-relay mailbox (opt-in at creation/join), and later an optional backend adapter.

```
┌──────────────── UI (Preact) ────────────────┐
│ screens · i18n (ar/en) · RTL · components   │
└───────────────┬─────────────────────────────┘
                │ derived state (pure functions)
┌───────────────▼─────────────────────────────┐
│ model/  events → debate state → statuses,   │
│         obligations, commitments, glossary  │
└───────────────┬─────────────────────────────┘
┌───────────────▼─────────────────────────────┐
│ store/  EventLog (union merge, LWW edits)   │
│         IndexedDB persistence               │
└───────────────┬─────────────────────────────┘
┌───────────────▼─────────────────────────────┐
│ sync/   Transport interface                 │
│   ├ ManualTransport (update link / file)    │
│   ├ NostrTransport (encrypted mailbox)      │
│   └ BackendTransport (adapter, later)       │
│ crypto/ HKDF, AES-GCM, per-device keys      │
└─────────────────────────────────────────────┘
```

**Stack:** Vite + TypeScript (strict) + Preact + @preact/signals. Tests: Vitest (unit, property) + Playwright (e2e). Small, audited crypto deps only: `@noble/curves` (Schnorr/secp256k1 for Nostr signing) and `@noble/hashes`. No CRDT library (TECH §1.3, D-004). No UI kit, no CDN, no analytics.

## 2. Event model

All state derives from immutable events:

```ts
type EventBase = {
  id: string;          // 128-bit random, base64url
  debateId: string;
  authorId: string;    // personId
  at: number;          // hybrid logical clock (ms * 1000 + counter)
  v: 1;
};
type DebateEvent =
  | EventBase & { type: 'debate.create'; title: string; lang: 'ar'|'en' }
  | EventBase & { type: 'person.join'; name: string }
  | EventBase & { type: 'person.rename'; name: string }
  | EventBase & { type: 'node.add'; node: { id: string; parentId: string|null; move: Move; text: string; meta?: NodeMeta } }
  | EventBase & { type: 'node.edit'; nodeId: string; text: string }
  | EventBase & { type: 'node.retype'; nodeId: string; move: Move; meta?: NodeMeta }
  | EventBase & { type: 'debate.retitle'; title: string };
```

- **Merge** = set union by `id` (grow-only set): commutative, associative, idempotent (property-tested).
- **Edits/retypes/renames/retitle**: last-writer-wins by `(at, id)`; only the node's author (or the debate creator for retitle) is honoured — others' edit events are ignored by the reducer (they cannot exist through the UI; this guards malformed input).
- **Validity:** the reducer ignores events that violate the PRD validation table (e.g. wrong author for an answer) rather than crashing; ignored events are counted in diagnostics.
- **Ordering in the UI** by `(at, id)`; two devices with the same event set render identically.
- **Orphans:** a node whose parent is unknown (not yet synced) is held and shown under «نقاط بانتظار المزامنة» until the parent arrives.

Derived state (`model/derive.ts`, pure): node tree, per-node status (PRD §3.4), obligations (PRD §3.5), commitments (§3.6), glossary terms, counts, "new since last visit".

## 3. Storage

- IndexedDB database `munazara`, stores: `debates` (id, title, key material, my personId, sync settings, lastSeenAt, lastBackupAt), `events` (by debateId + id), `outbox` (per transport, events not yet acknowledged).
- A thin wrapper over the IndexedDB API (no dependency).
- After the first meaningful action: `navigator.storage.persist()` (TECH §7).
- **Data at rest on the device is not separately encrypted in v1** (the device is the user's own; adding a passphrase is on the ROADMAP). Stated in the privacy note.

## 4. Keys and crypto

- `roomSecret`: 32 random bytes, created with the debate. Lives in the share link fragment and in local IndexedDB.
- Derived with HKDF-SHA-256 (WebCrypto):
  - `encKey` (AES-256-GCM) — info `munazara/v1/enc`
  - `roomTag` (16 bytes, hex) — info `munazara/v1/tag` — the relay filter tag; reveals nothing about content.
- **Encryption:** every payload is `AES-GCM(encKey, iv=12 random bytes, plaintext=JSON batch of events)`. A fresh random IV per payload; never reused.
- **Per-device Nostr signing key** (secp256k1, random per device per debate; D-007). Never derived from the room secret, so no link holder can sign deletion or vanish requests for other devices' events (review F2).
- **Not in v1:** per-person signatures inside the ciphertext (impersonation protection). Anyone with the link can write as anyone; this matches the trust model ("the link is the key") and is disclosed. ROADMAP.

## 5. URL and sharing model

- Base: `https://<owner>.github.io/Repo-B/` (hash routing; all routes after `#`).
- **Join link:** `#/j/<debateId>.<roomSecret b64url>[.<snapshot>]`
  - `snapshot` (optional) = deflate-raw + AES-GCM encrypted batch of all events, included when the result is ≤ 12,000 characters; otherwise omitted (then the receiver needs relays or an update file).
  - On open: store key + events locally, then **immediately replace the URL** with `#/d/<debateId>` (no secret in the address bar or in later history entries).
- **Update link:** `#/u/<debateId>.<roomSecret>.<payload>` — events the sender believes the receiver may lack (all events since the sender's last manual export to that debate, or all events if the user chooses «كل المناظرة»). Same size rule; larger → `.munazara` file shared via the Web Share API (file) or downloaded.
- **Internal routes:** `#/` home, `#/new`, `#/d/<id>` summary, `#/d/<id>/t/<nodeId>` focus, `#/d/<id>/g` glossary, `#/about`.
- The fragment is never sent in HTTP requests (TECH §6); WhatsApp previews are fetched by the sender's device without the fragment (review, checked).

## 6. Sync transports

```ts
interface Transport {
  readonly kind: 'manual' | 'nostr' | 'backend';
  start(ctx: { debateId: string; encKey: CryptoKey; roomTag: string; onEvents(e: DebateEvent[]): void; }): Promise<void>;
  publish(events: DebateEvent[]): Promise<PublishResult>;   // idempotent
  health(): TransportHealth[];                              // per endpoint
  stop(): void;
}
```

### 6.1 ManualTransport (always on)
Produces update links/files (§5); consumes them via route or file import. Merge by union, so stale or repeated links are harmless.

### 6.2 NostrTransport (opt-in)
- Event kind **4333** (regular range 1000–9999: relays "expected to store", TECH §3.1), `content` = base64 ciphertext of a batch (≤ 48 KB), tags `[["t", roomTag]]`, signed with the device key.
- Relays: default list of ~6 (those that accepted test events in TECH-21 plus well-known general relays), **user-editable**; per-relay health shown.
- On open: subscribe `{"kinds":[4333], "#t":[roomTag], "since": lastSeen - 1 day}`; first open: no `since`.
- **Anti-entropy:** after the initial fetch, compute event IDs this device holds that were not seen from any relay; republish them in batches **under this device's own key** (so any device can restore the whole debate to the relays).
- Lazy-loaded module: not part of the first-load bundle.
- **Honest limits:** no retention guarantee; some relays drop unknown keys; metadata (IP, timing, size, tag) visible to relays. UI states this in the sync-mode chooser.

### 6.3 BackendTransport (adapter, later)
Same interface over a store-and-forward endpoint holding only ciphertext keyed by `roomTag`. First target: Cloudflare Worker + Durable Object (free tier); second: Firebase Spark. Setup guide in `docs/NEEDS-AHMAD.md` (optional item). Not built in v1 beyond the interface and a fake used in tests.

## 7. Identity

- `personId` random; stored per debate on the device. Display name per debate.
- New device (S3): «من أنت في هذه المناظرة؟» → choose an existing participant (self-declared) or new.
- Name changes are events (`person.rename`).

## 8. Offline and PWA

- Service worker (hand-written, small): precache app shell (HTML, JS, CSS, fonts, icons) with a versioned cache; network-first for nothing (there is no API). New version → "تحديث متاح" banner, reload on tap.
- Web App Manifest (ar, `dir: rtl`), icons, `display: standalone`.
- The app is fully usable offline: all reading and writing are local; outbox flushes when online.
- iOS: prompt to «أضف إلى الشاشة الرئيسية» after the first debate (TECH §7, the 7-day rule), and show «آخر نسخة احتياطية» in the sync sheet.

## 9. Export / import (ownership)

- **JSON** (`.munazara.json`): `{ "format": "munazara-debate", "version": 1, "debate": {id, title}, "events": [...] }` — plaintext, documented in `docs/FORMAT.md`. Import = merge.
- **Encrypted backup** (`.munazara`): the same JSON, AES-GCM with the room key — safe to store in cloud drives; restore needs the link.
- **Markdown outline** (readable): nested list with move labels and statuses.

## 10. Privacy model

**Where data lives**
| Data | Where | Who can read |
|---|---|---|
| Debate content (events) | Each participant's device (IndexedDB) | That device's user |
| Debate content in transit/at relays (relay mode) | Public Nostr relays chosen by the user | Only holders of the link key (ciphertext to relays) |
| Room secret | Share link fragment; device storage; WhatsApp chat (and its backups, unless the user enabled WhatsApp's end-to-end encrypted backup) | Anyone with the link |
| Site visit | GitHub Pages logs IP addresses for security (TECH-41) | GitHub |

**What the app never does:** analytics, trackers, third-party fonts/scripts/CDNs, sending the room secret in any request, server-side storage of plaintext.

**Controls:** `<meta name="robots" content="noindex, nofollow">`, `<meta name="referrer" content="no-referrer">`, CSP meta: `default-src 'self'; connect-src 'self' wss:; img-src 'self' data: blob:; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'` (the `wss:` allowance is needed for user-editable relays; in manual mode the app opens no sockets).

**Threat model (v1)**
| Threat | Mitigation | Residual risk |
|---|---|---|
| Link forwarded or leaked | Disclosed; ROADMAP: re-key to a new link | Holder can read and write |
| Relay operator | Ciphertext only; per-debate tag; per-device keys | Sees IP, timing, size |
| Malicious link holder deletes relay data | Per-device keys; every device republishes | Can add junk events (visible, attributable only by self-declared name) |
| Lost/evicted phone storage | Other device + relays + backup files; persist(); home-screen install | Loss if all copies gone |
| Compromised deploy (malicious JS) | Pinned Actions, no third-party scripts, reviewed workflow | Trust in GitHub account remains |
| Impersonation by a link holder | Disclosed | v1 has no signatures (ROADMAP) |

## 11. Build, CI, deploy

- `npm run build` → `dist/` (Vite, `base: './'`).
- GitHub Actions: `ci.yml` (typecheck, unit, build, e2e, size check) on every push; `pages.yml` deploys `dist/` with `actions/upload-pages-artifact` + `actions/deploy-pages` from the default branch, with `actions/configure-pages` `enablement: true` attempted. If Pages cannot be enabled by the workflow token, exact clicks go to `docs/NEEDS-AHMAD.md`.
- Budgets checked in CI: first-load JS ≤ 150 KiB gzip; fonts ≤ 200 KB first view.

## 12. Testing strategy (summary; QC owns details)
- Unit: reducer, validation, statuses, obligations (incl. symmetry fixture), merge properties, crypto round trip, link encode/decode, i18n key parity.
- E2E (Playwright, two browser contexts = two people): create → share → join via link → moves → update link back → convergence; offline; RTL rendering; 300-node fixture performance; network isolation (manual mode makes no foreign requests); relay mode against a **local mock relay** (a tiny Node WebSocket server implementing the needed subset of NIP-01) — no test touches public relays.
