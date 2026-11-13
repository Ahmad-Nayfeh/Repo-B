# ARCHITECTURE — مناظرة

Version 1.1 (revised after `REVIEW-design.md`; see PRD §11 for the resolution table). Owner: Engineering + Privacy & Security (with the lead).
Evidence: `research/tech-feasibility.md` (TECH), `research/SYNTHESIS.md` §6 (SYN).

---

## 1. Overview

A static, client-only TypeScript PWA on GitHub Pages. No server of ours. Each device holds the complete debate as an **append-only log of signed events** in IndexedDB. Devices exchange events through pluggable **transports**: a manual link/file transport (always available), a public-Nostr-relay mailbox (opt-in at creation/join), and later an optional backend adapter.

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
  at: number;          // author's clock, ms; monotonic per device (max(now, last+1))
  v: 1;
  sig: string;         // ECDSA P-256 / SHA-256 over the canonical JSON of the event without `sig`
};
type DebateEvent =
  | EventBase & { type: 'debate.create'; title: string; lang: 'ar'|'en' }
  | EventBase & { type: 'person.join'; name: string; pub: string /* raw P-256 public key, b64url */; standpoint?: boolean }
  | EventBase & { type: 'person.rename'; name: string }
  | EventBase & { type: 'node.add'; node: { id: string; parentId: string|null; move: Move; text: string; meta?: NodeMeta } }
  | EventBase & { type: 'node.edit'; nodeId: string; text: string }
  | EventBase & { type: 'node.retype'; nodeId: string; move: Move; meta?: NodeMeta }
  | EventBase & { type: 'debate.retitle'; title: string };
```

- **Merge** = set union by `id` (grow-only set): commutative, associative, idempotent (property-tested).
- **Signatures:** a `person.join` is self-signed with the key it declares; every later event by that `authorId` must verify against that key, else it is rejected on ingest (never stored). The first valid `person.join` for a personId wins (by `(at,id)`); later joins for the same id are ignored. Verification uses WebCrypto (no dependency).
- **Edits/retypes/renames/retitle**: last-writer-wins by `(at, id)` among the **author's own** events only (others' edits are ignored), so clock skew can only affect the author's own edits (review D21).
- **Validity** (PRD §3.3): a `node.add` is valid iff its parent exists and the move is allowed for the parent's **original** move and authorship. Invalid events are ignored and counted in diagnostics. Validity never depends on later events, so a valid node is never dropped (review D2). A `node.retype` is honoured only if no node by another author has that node as parent (deterministic over the final event set).
- **Ordering in the UI** by `(at, id)`; two devices with the same event set render identically.
- **Orphans:** a node whose parent is unknown (not yet synced) is held and shown under «نقاط بانتظار المزامنة» until the parent arrives.

Derived state (`model/derive.ts`, pure): node tree, per-challenge state and per-assertion status (PRD §3.4), obligations per participant, terms, counts, "new since last visit", search index.

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
- **Per-person signing key** (ECDSA P-256 via WebCrypto, non-extractable except for the explicit identity-transfer action). Signatures live inside the ciphertext, so relays learn nothing from them. Prevents a link holder from fabricating points under an existing participant's name (review D15; changes D-011).

## 5. URL and sharing model

- Base: `https://<owner>.github.io/Repo-B/` (hash routing; all routes after `#`).
- **Join link:** `#/j/<debateId>.<roomSecret b64url>[.<snapshot>]`
  - `snapshot` (optional) = deflate-raw + AES-GCM encrypted batch of all events, included when the result is ≤ 12,000 characters; otherwise omitted (then the receiver needs relays or an update file).
  - On open: store key + events locally, then **immediately replace the URL** with `#/d/<debateId>` (no secret in the address bar or in later history entries).
- **Update link:** `#/u/<debateId>.<payload>` — **no key** (review D14); the receiver must already hold the debate (else: «افتح رابط الدعوة أولاً»). Payload = events the sender believes the receiver may lack (since the sender's last manual export, or all events on request). Same size rule; larger → encrypted **`.txt`** file (Chromium's Web Share only accepts listed types such as `.txt`, review D17), shared or downloaded.
- **Identity link:** `#/i/<debateId>.<payload>` — the person's private key and id, encrypted with the debate key; shown with a warning ("send only to yourself").
- **Paste box:** every link type can be pasted into the app (home screen and debate sync sheet). Needed on iOS, where the installed home-screen app has storage separate from Safari and links from WhatsApp always open in Safari (review D1, firt.dev / WebKit bug 181849).
- **Internal routes:** `#/` home, `#/new`, `#/d/<id>` summary, `#/d/<id>/t/<nodeId>` focus, `#/d/<id>/g` glossary, `#/about`.
- The fragment is never sent in HTTP requests (TECH §6); WhatsApp previews are fetched by the sender's device without the fragment (review, checked). The URL rewrite is hygiene only: the secret stays in WhatsApp, possibly in synced browser history and "recently closed" lists (review D23).

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
- Event kind **4333** (regular range 1000–9999: relays "expected to store", TECH §3.1), `content` = base64 ciphertext of a batch (≤ 48 KB; fits `max_message_length` 131,072 of the strictest tested relay), tags `[["t", roomTag]]`, signed with a **per-device Nostr key** (secp256k1 Schnorr via `@noble/curves`).
- **Own re-test with kind 4333, 2026-11-13** (dummy content, throwaway key, one sandbox; added to SOURCES as TECH-54): accepted *and* read back by relay.primal.net, relay.snort.social, offchain.pub, nostr.oxtr.dev, relay.nostr.net; accepted but not read back from the sandbox by relay.damus.io; no response from nos.lol and nostr.mom; nostr.wine refused (403). relay.snort.social is an in-memory relay (review V5) — treated as a cache, not storage.
- **Default list (fixed in v1):** primal, damus, offchain.pub, nostr.oxtr.dev, relay.nostr.net, snort. Per-relay status shown. Editable list: ROADMAP.
- **Reading:** subscribe `{"kinds":[4333], "#t":[roomTag], "limit": 500}`, and page backwards with `until` while a page returns 500 (strfry `max_limit` is 500, review V5); never rely on `since` alone (review D21).
- **Writing:** publish the outbox to all relays; an event batch is "delivered" when ≥ 2 relays acknowledged `OK true`. Full anti-entropy republication of others' events: ROADMAP (v1 republishes only this device's own outbox).
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
- iOS: the home-screen app avoids the 7-day eviction (TECH §7) but has **separate storage from Safari** and links do not open in it (review D1). So the install hint explains: "after installing, open the app and paste the invite link inside it". «آخر نسخة احتياطية» shown in the sync sheet; a reminder after 14 days without backup.
- Private browsing / in-app browsers may wipe storage when closed; a warning is shown before the first write (review D25).

## 9. Export / import (ownership)

- **Encrypted backup (default)** `مناظرة-<title>.txt`: a header line `MUNAZARA-BACKUP v1 <debateId>` followed by base64url AES-GCM ciphertext of the JSON below, with the room key. Safe in Drive/WhatsApp; restore needs the invite link (or the room key) on that device.
- **Plain JSON** (`.json`, behind a warning): `{ "format": "munazara-debate", "version": 1, "debate": {id, title}, "events": [...] }` — documented in `docs/FORMAT.md`. Import = merge (signatures verified).
- Markdown/Argdown export: ROADMAP.

## 10. Privacy model

**Where data lives**
| Data | Where | Who can read |
|---|---|---|
| Debate content (events) | Each participant's device (IndexedDB) | That device's user |
| Debate content in transit/at relays (relay mode) | Public Nostr relays chosen by the user | Only holders of the link key (ciphertext to relays) |
| Room secret | Share link fragment; device storage; WhatsApp chat (and its backups, unless the user enabled WhatsApp's end-to-end encrypted backup) | Anyone with the link |
| Site visit | GitHub Pages logs IP addresses for security (TECH-41) | GitHub |

**What the app never does:** analytics, trackers, third-party fonts/scripts/CDNs, sending the room secret in any request, server-side storage of plaintext.

**Controls:** CSP meta **first in `<head>`** (it only governs content after it, review D22): `default-src 'self'; connect-src 'self' wss://relay.primal.net wss://relay.damus.io wss://offchain.pub wss://nostr.oxtr.dev wss://relay.nostr.net wss://relay.snort.social; img-src 'self' data: blob:; style-src 'self'; script-src 'self'; font-src 'self'; manifest-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'` (explicit relay hosts while the list is fixed). `<meta name="robots" content="noindex, nofollow">`, `<meta name="referrer" content="no-referrer">`. A meta CSP cannot set `frame-ancestors`, so a small frame-bust script runs first. No inline `style` attributes in static HTML. E2E asserts no `securitypolicyviolation` events. In manual mode the app opens no sockets.

**Threat model (v1)**
| Threat | Mitigation | Residual risk |
|---|---|---|
| Link forwarded or leaked | Disclosed; ROADMAP: re-key to a new link | Holder can read and write |
| Relay operator | Ciphertext only; per-debate tag; per-device keys | Sees IP, timing, size |
| Malicious link holder deletes relay data | Per-device keys; every device republishes | Can add junk events (visible, attributable only by self-declared name) |
| Lost/evicted phone storage | Other device + relays + backup files; persist(); home-screen install | Loss if all copies gone |
| Compromised deploy (malicious JS) | Pinned Actions, no third-party scripts, reviewed workflow | Trust in GitHub account remains |
| Impersonation by a link holder | Every event signed by its author's key; unverifiable events rejected | A link holder can join as a *new* participant; names are disambiguated |
| Device inspection (family, employer, authorities) — serious for faith debates | Disclosed plainly; «إخفاء العناوين» option; backups encrypted by default | Data at rest on the device is readable by whoever can unlock the phone; app passcode is ROADMAP |
| Relay-side linkage of a debate's activity over months (constant tag) | Disclosed | Rhythm, sizes, IPs linkable; tag rotation ROADMAP (review D24) |

## 11. Build, CI, deploy

- `npm run build` → `dist/` (Vite, `base: './'`).
- GitHub Actions: `ci.yml` (typecheck, unit, build, e2e, size check) on every push; `pages.yml` deploys `dist/` with `actions/upload-pages-artifact` + `actions/deploy-pages`. `configure-pages` `enablement` needs a token other than `GITHUB_TOKEN` (review V2), so the one-time "Source: GitHub Actions" setting is in `docs/NEEDS-AHMAD.md`.
- Budgets checked in CI: first-load JS ≤ 150 KiB gzip; fonts ≤ 200 KB first view.

## 12. Testing strategy (summary; QC owns details)
- Unit: reducer, validation, statuses, obligations (incl. symmetry fixture), merge properties, crypto round trip, link encode/decode, i18n key parity.
- E2E (Playwright, two browser contexts = two people): create → share → join via link → moves → update link back → convergence; offline; RTL rendering; 300-node fixture performance; network isolation (manual mode makes no foreign requests); relay mode against a **local mock relay** (a tiny Node WebSocket server implementing the needed subset of NIP-01) — no test touches public relays.
