# Technical feasibility: storage and sync for a zero-account, private, asynchronous debate site

Checked on 2026-11-13. Every fact below either has a citation `[TECH-NN]` or is marked "(unverified)". Some citations point to our own small experiments, which were run from a cloud sandbox on 2026-11-13 using dummy strings only. Those results describe one moment from one network location, and they say so.

## 0. Summary

- **Do we need a CRDT?** No, not for an append-mostly tree where each node has a single author. The better model is an **immutable event log**: union-merge the events, then apply deterministic last-writer-wins (LWW) to the few mutable fields. It needs no library, takes a few hundred lines of TypeScript, and maps directly onto any relay or backend. Yjs (about 29 KB gzipped) stays an option if we later add co-editing of the same text.
- **Pure P2P (WebRTC) cannot carry an asynchronous debate.** Peers only sync while both are online at the same moment. Several of the "free public" signalling servers have also disappeared. Two examples: y-webrtc's default `signaling.yjs.dev` is a dangling DNS record, and its two Heroku servers return "No such app". The well-known Open Relay TURN hostname now resolves to a non-routable address. [TECH-01][TECH-52]
- **The best zero-account store-and-forward channel available today is Nostr public relays.** Each debate event goes to 4–6 relays as an end-to-end encrypted blob. Our test publish succeeded on damus, primal and snort and read back on primal and snort. However, relays have no retention guarantee. One relay returned no events older than a year, one returned 503, and one silently ignored a new key. [TECH-21]
- **Keyless JSON stores are not viable anymore.** jsonblob returned 403 to the API, kvdb now requires an email and expires keys after 7 days on the free tier, and extendsclass requires an API key. [TECH-22][TECH-24]
- **Link-encoded state works as a fallback but not as the main channel.** A deflated, encrypted debate of about 100 nodes × 60 words is roughly 14,000 URL characters. [TECH-47]
- **Recommendation.** Local-first IndexedDB event log, E2E encrypted with an AES-GCM key kept in the URL fragment. Sync, in order of preference: (1) a Nostr relay "mailbox", (2) opportunistic WebRTC via Trystero when both are online, (3) a manual "send update link / file" over WhatsApp, (4) later, an optional owner-run backend adapter, with Cloudflare Durable Objects as the best free option. **Biggest risk:** no zero-account channel guarantees storage for months. The design must therefore treat relays as a transport, never as the database. Every client keeps the full log and republishes it.

---

## 1. CRDTs vs. a simple event log

### 1.1 Yjs
- Version 13.6.33 on npm, last modified 2026-09-23 (npm registry, checked 2026-11-13). It is actively maintained.
- Bundle size measured by us with esbuild (minified ESM, whole namespace imported): **93.5 KB raw / 28.7 KB gzip**. [TECH-46]
- Persistence: `y-indexeddb` stores the document in IndexedDB. Content is "loaded from the local browser database" the next time the document opens, and there are `synced`, `clearData()` and `destroy()` hooks. [TECH-45] Its latest npm version is 9.0.12, last modified 2023-11. It is stable but rarely updated.
- Updates are binary (`Uint8Array`) and can be encrypted as opaque blobs and sent through any channel. Yjs's strength is concurrent editing of sequences and text, which this product hardly needs.

### 1.2 Automerge (v3)
- Automerge 3.0 shipped in July 2025. It cut memory use by more than 10× and kept the Automerge 2 file format. The API is "nearly fully backward compatible", with the breaking changes mostly in text handling. [TECH-44]
- Bundle size: `@automerge/automerge` 3.5.0 depends on a **3.6 MB WebAssembly module, 1.14 MB gzipped**. The default entry, bundled with the WASM inlined, came to **4.9 MB raw / 1.65 MB gzip**. The `slim` entry is 15 KB gzip of JS plus the WASM, which must be loaded separately. [TECH-46] That is heavy for a mobile-first PWA on a slow connection.

### 1.3 Is a CRDT needed at all?
The data model is a tree of argument nodes. Each node is created once by one author and edits are rare. That structure is already conflict-free:

- **Node creation:** every node gets a random 128-bit ID and a parent ID. Merging two replicas is a set union of events. Union is commutative, associative and idempotent, which makes it a trivial CRDT (a grow-only set). No library is needed.
- **Edits, retractions, status flags, debate title:** each is its own immutable `edit` event `{target, field, value, hlc, author}`. The current value is the edit with the highest `(hybrid-logical-clock, authorId)` pair, which is a deterministic LWW register. Only a node's author may edit it, so true conflicts can only happen between one person's own two devices.
- **Deletion:** a tombstone event. A tombstoned node is hidden but its children stay reachable, so the tree never breaks.
- **Ordering in the UI:** sort by HLC. Two replicas holding the same set of events always render the same view.

This design suits our transports: each event becomes one small encrypted message, deduplicated by ID. Sync reduces to "send me event IDs I don't have" (a set difference), and a cursor or `since` timestamp makes that cheap on relays.

**Verdict:** use a custom event log of roughly 300–500 lines of TypeScript. Reconsider Yjs (not Automerge, because of size) only if we later add real-time co-editing of a shared text such as a jointly written summary.

---

## 2. Peer-to-peer (WebRTC) with free public signalling

### 2.1 y-webrtc default signalling: effectively dead
The y-webrtc README still lists `wss://signaling.yjs.dev`, `wss://y-webrtc-signaling-eu.herokuapp.com` and `wss://y-webrtc-signaling-us.herokuapp.com` as defaults. [TECH-01] We checked them on 2026-11-13:
- `signaling.yjs.dev` CNAMEs to a `herokudns.com` hostname that has no A record. Our proxy could not open a tunnel to it. [TECH-52]
- Both Heroku hosts return HTTP 404 with the page title "No such app", meaning the Heroku apps no longer exist. [TECH-52]
- Community threads on discuss.yjs.dev report the public server as "probably down" and recommend self-hosting. Thread dates were not visible to us. [TECH-02]

**Conclusion:** y-webrtc does not work with zero setup today.

### 2.2 Trystero
- Trystero's default signalling now runs over **public Nostr relays** with "default redundancy: 5". Zero-config MQTT (4 public brokers) and BitTorrent tracker (3 trackers) strategies also exist. Supabase and Firebase strategies need your own project, and `ws-relay` is self-hosted. [TECH-05] IPFS is not listed in the current docs. [TECH-04][TECH-05]
- Brotli-compressed size of `joinRoom`: Nostr about 46.3 KB, torrent about 42.6 KB, MQTT about 122 KB. [TECH-05]
- SDP offers are AES-256-GCM encrypted before they reach any relay. A room `password` derives the key via PBKDF2-SHA256 (600,000 iterations), and peers verify keys against the DTLS fingerprint. [TECH-04]
- The docs warn that public relays share one `(appId, roomId)` namespace, so `appId` should be namespaced with a domain. [TECH-05]

### 2.3 PeerJS cloud
PeerJS still connects to "the free PeerJS Cloud server" by default and recommends self-hosting for production. The page publishes no limits or SLA. [TECH-48] `https://0.peerjs.com/peerjs/id` answered with a fresh ID on 2026-11-13. [TECH-24]

### 2.4 NAT traversal and TURN
- Trystero's own docs estimate that "roughly 10–15% of real-world internet connections", including "cellular carrier-grade NATs", block direct hole-punching. When that happens, WebRTC needs a TURN relay, and without one the room reports `peer-connect-failed`. [TECH-06] Vendor blogs give 8–25% depending on audience. These are self-reported and not specific to mobile. [TECH-51] We found **no rigorous, current, mobile-only measurement**, so any percentage for mobile carriers is (unverified).
- Tailscale's NAT traversal write-up explains why endpoint-dependent ("hard"/symmetric) NAT breaks traversal: "It only takes one of them in the whole path." When hole-punching fails, "you're stuck with relaying." [TECH-11]
- **Free TURN options:**
  - Metered's Open Relay page advertises 20 GB/month free but requires signing up for an API key. [TECH-07] The old static host `openrelay.metered.ca` now resolves (via Google DNS-over-HTTPS) to `192.0.2.1`, a reserved documentation address. The old shared, anonymous credentials therefore no longer work. [TECH-52]
  - Metered's standard free plan is reported at 500 MB/month. We saw this only in a search summary, so it is (unverified). [TECH-08]
  - Cloudflare Realtime TURN: "The first 1,000 GB each month is free", shared with the SFU, and it needs a Cloudflare account. [TECH-10][TECH-09]
  - Every real TURN option needs **an account, which breaks the zero-setup rule.** Credentials embedded in a public static site would also be scraped. Trystero itself advises minting short-lived credentials from a serverless function. [TECH-06]

### 2.5 The asynchrony problem
WebRTC moves data only while **both browsers are open at the same moment**, and on iOS a backgrounded tab is suspended. Here is a back-of-envelope estimate (our arithmetic, not a measurement). Suppose each participant opens the debate once a day for 5 minutes at an independent random time. The two sessions overlap with probability of about (5+5)/1440 ≈ **0.7% per day**, so most replies would wait for weeks. Even with three sessions each per day, the daily overlap chance stays in the single-digit percentages. If one side sits behind a hard NAT with no TURN, the overlap is also wasted.

**P2P is therefore only a bonus channel for the "sometimes concurrently" case. It cannot be the sync mechanism.** Asynchronous use needs a **store-and-forward** component: somewhere a message waits while the other person is offline.

---

## 3. Relay-based zero-account store-and-forward

### 3.1 Nostr public relays: the most promising option
**Protocol facts**
- Kinds 1000–9999 (plus 1, 2, 4–44) are **regular** events, which relays are "expected to store".
- Replaceable (10000–19999) and addressable (30000–39999) events keep only the latest version.
- Ephemeral events (20000–29999) "are not expected to be stored". [TECH-16]
- **Storage is an expectation, not a guarantee.** No standard retention period exists. Azzamo's free relay may "prune older or low-value events". nostr.wine sells a paid long-term "Cellar" relay and notes that some relays periodically purge old notes. Both points come from search summaries. [TECH-18][TECH-19]

**Size limits, from each relay's NIP-11 document, fetched 2026-11-13** [TECH-20]
- relay.damus.io: `max_message_length` 1,000,000
- relay.primal.net: `max_message_length` 1,000,000
- nos.lol: `max_message_length` 131,072
- In practice, a 200 KB event was accepted by damus and rejected by nos.lol and nostr.mom with "event too large". [TECH-21]

**Our live test, 2026-11-13** [TECH-21]
Method: dummy events with a throwaway key, NIP-44-encrypted content, kinds 4444 (regular) and 30078 (addressable).

| Relay | Accepted publish | Read back by author | Has kind-1 events older than 1 y / 2 y |
|---|---|---|---|
| relay.damus.io | yes (OK) | **REQ timed out** | timed out |
| relay.primal.net | yes | yes | yes / yes |
| relay.snort.social | yes | yes | **no / no** (suggests pruning) |
| nos.lol | **no response** (new key ignored?) | n/a | yes / yes |
| nostr.mom | **no response** | n/a | yes / yes |
| relay.nostr.band | **HTTP 503** | — | — |

**Interpretation**
- Relays differ widely. Some silently drop events from unknown keys, presumably as an anti-spam measure; we could not see their policies.
- Damus would not answer REQs from our sandbox IP, which may be an IP-based restriction (unverified).
- At least one popular relay appears to keep about a year or less.
- Whether relay.nostr.band is permanently down could not be confirmed. A user post called it "dead for a while". [TECH-53]

**Encryption.** NIP-44 v2 uses secp256k1 ECDH, HKDF, ChaCha20 and HMAC-SHA256, and Cure53 audited it in December 2023. Its caveats: no forward secrecy, `created_at` and IP addresses are visible to relays, and padding hides size only partially. [TECH-17] For our case we don't need NIP-44's pubkey-to-pubkey model. We can encrypt with our own AES-GCM key from the URL fragment (section 6) and put plain ciphertext in `content`.

**What relays can see:** IP addresses, timing, event sizes, the signing pubkey, and any tags. Use a per-debate random signing key and a tag that is a hash of the room secret. The relay then learns "some key posted N blobs at times T", but not who posted them or what they say.

**Fit for months-long debates.** It works only if the design assumes relays forget:
1. Every client keeps the **full log locally** (IndexedDB).
2. Publish each event to **4–6 relays** and read from all of them.
3. On every open, a client **republishes any events it holds that a relay is missing** (anti-entropy). Data lost on one relay is repaired from the other participant's phone.
4. The real loss scenario: both phones lose local data (for example through iOS eviction, section 7) *and* every relay has pruned the events. The mitigations are manual export (section 4) and, later, the backend adapter.
5. **Retention is unverified for every relay. No relay promises months.**

Bundle cost: our minimal `nostr-tools` subset (`pure` + `nip44` + `pool`) is 26.5 KB gzip. [TECH-46] Using raw WebSockets plus `@noble` libraries would be smaller (unverified).

### 3.2 Public MQTT brokers
EMQX's public broker is for "Prototype, learn, and test", and the page warns: "All messages are visible to other users. Do not send sensitive data." [TECH-25] MQTT keeps at most one *retained* message per topic and nothing else, which is not a history. Persistence on the public broker isn't documented. Conclusion: **unsuitable for storage.** Usable only as WebRTC signalling (Trystero's MQTT strategy).

### 3.3 Gun.js public relays
Gun's docs still name `gun-manhattan` as a public relay. [TECH-26] On 2026-11-13, `gun-manhattan.herokuapp.com/gun` returned the Heroku page titled "No such app". [TECH-52] **Not usable with zero setup.**

### 3.4 Keyless JSON "pastebin" stores
Tested on 2026-11-13 with a dummy `{"dummy":"test"}` body. [TECH-24]

- **jsonblob.com:** `POST /api/jsonBlob` returned **HTTP 403** with an HTML page, possibly bot protection. A third-party doc says blobs not accessed for 75 days are removed. That is (unverified) and not in official docs. [TECH-23]
- **kvdb.io:** `POST /` returned 500 with "email required: set email=… when creating the bucket". The docs say keys **expire after 1 week by default**, longer TTLs need a paid plan, values are capped at 16 KB, and the rate limit is 1,000 req/IP/hour. [TECH-22] **Not viable.**
- **json.extendsclass.com:** `POST /bin` returned 401 `"Wrong API key"`. **Not keyless.** [TECH-24]
- **npoint.io:** the API path we tried returned 404 and the docs page was empty to our fetcher. Status is (unverified).

**Conclusion:** none of these is a dependable, keyless, months-long store. They are also single points of failure run by individuals. Do not build on them.

---

## 4. Link-encoded state (the WhatsApp-native fallback)

**Mechanism:** serialize the event log as JSON, compress it with `CompressionStream('deflate-raw')`, encrypt it with AES-GCM, base64url-encode it, and put it in `#…`. The fragment is never sent in HTTP requests. CompressionStream has been Baseline "widely available" since May 2023. [TECH-39] Which formats are supported was not shown on the page we fetched. `deflate-raw` and Safari 16.4 support are (unverified). `lz-string` is a 1.7 KB-gzip alternative. [TECH-46]

**How big is a debate?** We measured this ourselves with Node zlib level 9, AES-GCM and base64url. [TECH-47]

| Debate | JSON | Deflated | Fragment length |
|---|---|---|---|
| 30 nodes × 60 words (real English prose) | 14.9 KB | 5.3 KB | **~7,100 chars** |
| 100 nodes × 60 words | 41.9 KB | 10.6 KB | **~14,100 chars** |
| 200 nodes × 60 words | 89 KB | 25.8 KB | **~34,500 chars** |

Our prose corpus was small, so the larger rows may compress optimistically. A safe rule of thumb: **fragment ≈ 0.4–0.5 × raw text size**. lz-string came out about 35% larger than deflate+base64url. [TECH-47]

**Limits** (no authoritative documentation found; all from secondary sources, all unverified)
- Chrome is often quoted at about 2 MB, Safari at about 80,000 characters, and iOS Safari reportedly handled 50K+ hashes. [TECH-49]
- WhatsApp's message limit is quoted as 65,536 characters by third-party tools. [TECH-50] Whether WhatsApp keeps a 30,000-character URL clickable as one link has **not been tested** and must be tested on real iOS and Android devices before we rely on it.

**Workflow viability**
- "Send the updated link back each time" works for small debates of about 30–100 nodes. Each reply produces a new, ever-growing link.
- Problems: links get very long and ugly; stale links cause confusion (mitigated because the receiver merges by union, so an old link never destroys data); and anyone who sees the WhatsApp chat holds the full debate.
- A better variant: send **delta links** containing only the events the other side doesn't have yet, which stay at roughly 1–3K characters per reply. Combine this with a **file export/import** (`.debate` file shared through the Web Share API) for full backups.

**Verdict:** a solid **manual fallback and backup path**. It needs zero infrastructure, but it is not the primary sync.

---

## 5. Free-tier hosted backends (for a later adapter)

All of these require **someone** to create an account. That breaks "zero setup by the owner" today, but they fit the planned adapter.

| Option | Free limits (official pages, 2026-11-13) | Inactivity / risk | Card? | Notes |
|---|---|---|---|---|
| **Firebase Spark** | Firestore: 1 GiB stored, 50K reads / 20K writes / 20K deletes per day, 10 GiB egress/month. RTDB: 1 GB stored, 100 simultaneous connections, 10 GB/month download. Hosting: 10 GB, 360 MB/day. [TECH-27] | No inactivity pausing found | "No payment method needed" [TECH-27] | Anonymous auth limits not shown on pricing page (unverified). Google infrastructure; with E2E, Google sees only ciphertext and metadata. Setup roughly 15–30 min (unverified estimate). |
| **Supabase Free** | 500 MB database, 2 active projects, 5 GB egress, 50K MAU [TECH-28] | **Paused after 1 week of low activity**; restorable within a 1-year window [TECH-28][TECH-29] | not stated | Pausing is a real problem for a debate idle for weeks. |
| **Cloudflare Workers + Durable Objects (SQLite)** | Workers 100K req/day, 10 ms CPU/request [TECH-31]. DO on Free: 100K req/day, 13,000 GB-s/day, 5M rows read and 100K rows written per day, 5 GB stored; exceeding a limit makes operations fail, and counters reset 00:00 UTC [TECH-30]. KV: 100K reads, 1K writes/day, 1 GB [TECH-32] | No pausing found | not stated (unverified) | **Best fit.** A DO per debate is a natural ordered mailbox, with WebSocket support. Needs a Cloudflare account and `wrangler deploy` (~15 min, unverified estimate). |
| **Appwrite Cloud Free** | 2 projects [TECH-35] | **Paused after 7 days without Console activity; deleted after 90 days paused** (changelog Feb and Jun 2026) [TECH-35] | not stated | Poor fit. |
| **InstantDB** | — | **New Instant Cloud signups closed; all cloud apps shut down 31 Aug 2027** (team joined OpenAI, Aug 2026) [TECH-33] | — | **Excluded.** |
| **Convex Free** | 0.5 GB DB, 1 GB files, 1M function calls [TECH-34] | Pausing policy not found (unverified) | Third-party claim of card required (unverified) | Proprietary API, so lock-in. |
| **PocketBase on a free host** | — | Depends on host; most free container hosts sleep or cap hours (unverified, not researched in depth) | — | Most ops burden; not recommended. |

**Adapter recommendation:** Cloudflare Durable Objects first, Firebase RTDB/Firestore second. The adapter only stores opaque encrypted events, so the backend learns nothing except metadata.

---

## 6. End-to-end encryption with the key in the URL fragment

- **Precedents**
  - Excalidraw (2020): an AES-GCM key is generated with WebCrypto and placed after `#key=`. "Anything that's added after the `#` doesn't get sent to the server", and the server "would just store the encrypted blob". [TECH-36]
  - PrivateBin: 256-bit AES in the browser, "server has zero knowledge", and the key "is part of the URL". [TECH-37]
  - Bitwarden Send reportedly uses the same pattern (unverified; not checked).
- **Availability:** SubtleCrypto has been Baseline since September 2017 and requires a secure context (HTTPS), which GitHub Pages provides. MDN warns that the primitives are "very easy to misuse". [TECH-38]
- **Design for us**
  - Generate a 256-bit random `roomSecret` and put it in the link fragment.
  - Use HKDF to derive (a) an AES-256-GCM content key, (b) a deterministic Nostr signing key and room tag for relay addressing, and (c) a room ID for WebRTC.
  - Use a fresh 96-bit random IV per event; never reuse an IV with the same key. Excalidraw's zero-IV trick is only safe because each of its keys encrypts once. [TECH-36]
  - Optionally, each participant holds a personal ECDSA key and signs events *inside* the ciphertext, so authorship can't be forged by another link holder.
- **Inherent caveats**
  1. **The link is the key.** Anyone the link is forwarded to can read and write.
  2. The fragment lands in browser history and in WhatsApp chat backups.
  3. As PrivateBin warns, you must trust the JavaScript served. A compromised GitHub account could ship key-stealing code. [TECH-37] Mitigation: pinned, reviewed Actions deploys, plus visible build hashes.
  4. Relays still see metadata (IP, timing, size). [TECH-17]
  5. No forward secrecy.

---

## 7. Offline / PWA storage

- **iOS/Safari 7-day cap.** WebKit's tracking-prevention page says ITP deletes "all … script-writeable storage" (IndexedDB, LocalStorage, Service Worker caches, among others) after 7 days of Safari use without user interaction with the site. The page also says **home-screen web apps are exempt**: their first-party data is never removed under that rule and is "kept isolated from Safari". [TECH-13] MDN repeats the 7-day rule. [TECH-14]
- **Quotas (WebKit, Safari 17+).** An origin may use up to 60% of disk in a browser app. Eviction is least-recently-used by origin and may skip origins in persistent mode. `navigator.storage.persist()` is granted by heuristics, including whether the site is opened as a Home Screen Web App. [TECH-12]
- **persist().** Chrome grants or denies silently based on engagement, installation or bookmarking, and notifications, while Firefox prompts the user. Once granted, data isn't evicted under storage pressure. [TECH-15] Safari also auto-decides without prompting. [TECH-14] Whether `persist()` alone protects a non-installed site from the 7-day ITP rule is not stated, so it is (unverified).
- **Product implications**
  1. Strongly encourage **"Add to Home Screen"** on iOS.
  2. Call `persist()` after the first meaningful action.
  3. Remember that a participant who doesn't open the site for more than 7 days of Safari use may lose local data. The relay copy and the other participant's republish are the backstop.
  4. Offer a visible **"Back up debate (file)"** action.

---

## 8. GitHub Pages

- **Allowed use:** Pages is not for running an "online business" and "shouldn't be used for sensitive transactions like sending passwords or credit card numbers". [TECH-40] A non-commercial app that stores only ciphertext elsewhere appears compatible (our reading; not a legal opinion).
- **Limits:** site ≤ 1 GB, a soft 100 GB/month bandwidth limit, and a 10-minute deploy timeout. The 10 builds/hour soft limit doesn't apply to custom Actions workflows. [TECH-40]
- **Privacy:** "When a GitHub Pages site is visited, the visitor's IP address is logged and stored for security purposes", whether or not the visitor is signed in. [TECH-41] This must be disclosed in the privacy note. The fragment (the key) is never sent to GitHub.
- **Public by default:** private Pages publishing requires GitHub Enterprise Cloud. [TECH-42] The *app* is public, so the privacy comes from unguessable fragments, not from hidden pages.
- **noindex:** Pages can't set custom headers, so `X-Robots-Tag` is unavailable. That Pages doesn't support custom headers is widely known but was not found stated on the pages we fetched (unverified). Use `<meta name="robots" content="noindex">`, and **do not** block the page in robots.txt, or crawlers never see the noindex. Note that "Some search engines might interpret the noindex rule differently." [TECH-43] Debate content is never in a crawlable URL anyway, because it lives in the fragment or is encrypted.
- **No CSP headers either.** Use a `<meta http-equiv="Content-Security-Policy">` tag. A meta CSP cannot set `frame-ancestors` (unverified).

---

## 9. Recommendation

### 9.1 Architecture: "local-first encrypted event log, relays as mailbox"

```
 Phone A (PWA)                                  Phone B (PWA)
 ┌──────────────────────┐                      ┌──────────────────────┐
 │ UI (TS)              │                      │ UI (TS)              │
 │ EventLog (union+LWW) │                      │ EventLog             │
 │ IndexedDB (full log) │                      │ IndexedDB (full log) │
 │ Crypto: AES-GCM key  │◄── link #secret ───►│ same key             │
 └───┬──────┬──────┬────┘                      └────┬──────┬──────┬───┘
     │      │      └── manual: delta link / file via WhatsApp ──┘      │
     │      └──── WebRTC (Trystero/Nostr signalling) when both online ─┘
     └──── encrypted events ⇄ 4–6 public Nostr relays (store-and-forward) ⇄
```

1. **Source of truth:** each device's IndexedDB holds the complete event log. Every replica is a full backup.
2. **Primary async transport: the Nostr relay mailbox.**
   - Each event is AES-GCM ciphertext (≤ 64 KB, so nos.lol's 128 KB limit fits). It is published as a regular-kind event signed by the room-derived key and tagged with the room-tag hash.
   - Publish to 5 relays from a curated list, chosen from relays that accepted our test (damus, primal, snort), plus fallbacks.
   - On open, query `since` the last seen cursor and **republish missing events (anti-entropy)**.
   - Show per-relay health in a diagnostics screen.
3. **Opportunistic live transport:** Trystero (Nostr strategy) when both participants have the debate open. Without TURN, about 10–15% of pairs may fail to connect [TECH-06]. That's acceptable because the relay path still works.
4. **Manual fallback:** "Send update" produces a short **delta link**, or a full link or file. The receiver opens it and the app merges by union.
5. **Later: backend adapter** (Cloudflare DO first) as just another transport, enabled by an optional URL or config.

### 9.2 Ranked fallback chain
1. Nostr relay mailbox (automatic, async, zero-account).
2. WebRTC P2P (automatic, only when concurrent).
3. Delta/full link via WhatsApp or another messenger (manual, always works for small to medium debates).
4. File export/import via the Web Share API (manual, unlimited size).
5. Optional hosted backend adapter (owner opt-in, most reliable).

### 9.3 Risk list (honest)
| # | Risk | Likelihood | Mitigation |
|---|---|---|---|
| R1 | Public relays prune, rate-limit, reject unknown keys or shut down (seen: 503, silent ignore, no events older than a year on one relay) [TECH-21] | **High** over months | Multi-relay, anti-entropy republish, full local copies, user-editable relay list, export reminders, backend adapter |
| R2 | iOS evicts local data of non-installed sites after 7 days [TECH-13] | Medium | Push "Add to Home Screen"; `persist()`; restore from relays and peer |
| R3 | Both R1 and R2 at once → data loss | Low–medium | Periodic "backup file" nudge; adapter |
| R4 | Link leaks = full read/write access | Medium (WhatsApp forwards, chat backups) | Warn users; optional passphrase layer; per-author signatures |
| R5 | Relay operators see metadata (IP, timing, sizes) [TECH-17]; GitHub logs IPs [TECH-41] | Certain | Disclose clearly; random per-debate keys; padding |
| R6 | Malicious or compromised JS delivery breaks E2E [TECH-37] | Low | Locked-down Actions, reviewed deps, small dependency set |
| R7 | WebRTC fails behind carrier NAT without TURN [TECH-06] | ~10–15% of pairs (estimate) | Not needed for correctness; relays carry data |
| R8 | Relays treat our custom-kind events as spam | Medium (unverified) | Small events, low rate, per-relay health check, swap relays |
| R9 | Huge WhatsApp links break | Medium for >100 nodes (untested) | Delta links; file export |
| R10 | Nostr ecosystem trends (relay economics) | Unknown | Adapter interface keeps the transport replaceable |

### 9.4 Backend adapter interface (sketch)

```ts
/** Everything a transport sees is opaque ciphertext. */
export interface EncryptedEvent {
  id: string;            // random 128-bit, base64url; also dedup key
  room: string;          // HKDF(roomSecret, "room-tag") – not the secret
  ts: number;            // client HLC millis (coarse, for cursors only)
  ciphertext: Uint8Array; // AES-GCM(iv || ct), ≤ 64 KB
}

export interface SyncTransport {
  readonly name: string;                       // "nostr", "webrtc", "cf-do", ...
  readonly kind: 'store-and-forward' | 'live' | 'manual';
  connect(room: string, signal: AbortSignal): Promise<void>;
  /** Idempotent; may be called again for anti-entropy republish. */
  publish(events: EncryptedEvent[]): Promise<PublishResult[]>;
  /** Pull everything newer than cursor (opaque, per transport). */
  pull(room: string, cursor?: string): Promise<{ events: EncryptedEvent[]; cursor: string }>;
  /** Live push if the transport supports it. */
  subscribe?(room: string, onEvents: (e: EncryptedEvent[]) => void): () => void;
  /** Optional: IDs the remote already has, for cheap set-difference. */
  have?(room: string, ids: string[]): Promise<Set<string>>;
  health(): Promise<{ ok: boolean; detail: string }>;
}

export interface PublishResult { id: string; accepted: boolean; reason?: string }
```

The sync engine runs every enabled transport in parallel, merges by event-ID union into IndexedDB, and never depends on any single one. A Cloudflare DO implementation needs about four endpoints (`POST /room/:tag/events`, `GET /room/:tag/events?after=`, `GET /room/:tag/ws`, `GET /health`) and stores `(id, ts, blob)` rows in its SQLite.

---

## Sources

All accessed 2026-11-13 unless noted.

- **[TECH-01]** yjs/y-webrtc README — GitHub (Yjs) — https://github.com/yjs/y-webrtc — Lists default signalling servers `signaling.yjs.dev` and two herokuapp hosts; no TURN guidance beyond `peerOpts`.
- **[TECH-02]** "Is the public signaling server that ships by default with y-webrtc still working?" and "Is y-webrtc-signaling-eu.herokuapp.com down?" — discuss.yjs.dev, dates not seen — https://discuss.yjs.dev/t/is-the-public-signaling-server-that-ships-by-default-with-y-webrtc-still-working/1979 ; https://discuss.yjs.dev/t/https-y-webrtc-signaling-eu-herokuapp-com-seems-to-be-down-503-error/1370 — Community reports that public signalling is probably down; self-host advised (seen via search summary only).
- **[TECH-04]** dmotz/trystero README — GitHub — https://github.com/dmotz/trystero — Strategies list; AES-256-GCM-encrypted SDPs; PBKDF2 password; data doesn't touch relays after connecting.
- **[TECH-05]** Trystero "Signaling & Relays" — GitHub docs — https://raw.githubusercontent.com/dmotz/trystero/main/docs/signaling.md — Nostr default with redundancy 5; MQTT 4, torrent 3; bundle-size table; `appId` namespacing warning.
- **[TECH-06]** Trystero "NAT Traversal, TURN Servers & Troubleshooting" — GitHub docs — https://raw.githubusercontent.com/dmotz/trystero/main/docs/troubleshooting.md — "roughly 10–15%" of connections need TURN, including cellular CGNAT; TURN options; short-lived credentials advice.
- **[TECH-07]** Open Relay: Free WebRTC TURN Server — Metered — https://www.metered.ca/tools/openrelay/ — 20 GB/month free; sign-up and API key required.
- **[TECH-08]** Metered STUN/TURN page — Metered — https://metered.ca/stun-turn — Free plan "500 MB" TURN quota (seen only via search summary; unverified).
- **[TECH-09]** Cloudflare Realtime TURN — Cloudflare Docs — https://developers.cloudflare.com/realtime/turn/ — Priced at $0.05/GB outside the free allowance.
- **[TECH-10]** Cloudflare Realtime pricing — Cloudflare Docs — https://developers.cloudflare.com/realtime/pricing/ — "The first 1,000 GB each month is free", shared by SFU and TURN.
- **[TECH-11]** How NAT traversal works — Tailscale, 2020-08-21 — https://tailscale.com/blog/how-nat-traversal-works — Hard/endpoint-dependent NAT breaks traversal; relays as fallback.
- **[TECH-12]** Updates to Storage Policy — WebKit blog, 2023-08-10 — https://webkit.org/blog/14403/updates-to-storage-policy/ — Quotas, LRU eviction, `persist()` heuristics including Home Screen Web App.
- **[TECH-13]** Tracking Prevention in WebKit — WebKit — https://webkit.org/tracking-prevention/ — 7-day cap on script-writeable storage; home-screen web apps exempt.
- **[TECH-14]** Storage quotas and eviction criteria — MDN — https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria — Safari 7-day eviction; Safari and Chromium auto-decide `persist()`.
- **[TECH-15]** Persistent storage — web.dev — https://web.dev/articles/persistent-storage — Chrome heuristics, Firefox prompt, persisted data not evicted under pressure.
- **[TECH-16]** NIP-01 — nostr-protocol/nips, GitHub — https://github.com/nostr-protocol/nips/blob/master/01.md — Regular/replaceable/ephemeral/addressable kind ranges and storage expectations.
- **[TECH-17]** NIP-44 — nostr-protocol/nips, GitHub — https://github.com/nostr-protocol/nips/blob/master/44.md — v2 algorithms, Cure53 audit Dec 2023, no forward secrecy, metadata leakage.
- **[TECH-18]** Data retention — Azzamo docs — https://docs.azzamo.net/policies/data-retention — Free relay may prune older events (seen via search summary).
- **[TECH-19]** Cellar Relay Readme — nostr.wine docs — https://docs.nostr.wine/cellar — Paid long-term storage; some relays purge old notes (seen via search summary).
- **[TECH-20]** NIP-11 relay information documents — relay.damus.io, nos.lol, relay.primal.net, fetched 2026-11-13 via `Accept: application/nostr+json` — https://relay.damus.io ; https://nos.lol ; https://relay.primal.net — `max_message_length` 1,000,000 / 131,072 / 1,000,000.
- **[TECH-21]** Own experiment: Nostr publish and read-back with dummy NIP-44-encrypted events — this project, 2026-11-13 — n/a (local script with nostr-tools 2.26.0) — Acceptance, read-back, old-event presence and size-limit results in §3.1.
- **[TECH-22]** KVdb API docs — kvdb.io — https://kvdb.io/docs/api/ — 16 KB values, keys expire after 1 week by default, paid plan for longer, 1,000 req/IP/hour.
- **[TECH-23]** JSONBlob Core API — Qodex (third party) — https://developers.qodex.ai/flows-snippets/jsonblob-core-api — Claim that blobs unused for 75 days are removed (unverified).
- **[TECH-24]** Own experiment: HTTP probes of jsonblob, npoint, kvdb, extendsclass and PeerJS cloud — this project, 2026-11-13 — n/a — 403 / 404 / "email required" / "Wrong API key" / PeerJS ID returned.
- **[TECH-25]** Free Public MQTT 5 Broker — EMQX — https://www.emqx.com/en/mqtt/public-mqtt5-broker — For testing; "All messages are visible to other users."
- **[TECH-26]** GUN P2P networking docs — mintlify mirror of amark/gun — https://www.mintlify.com/amark/gun/examples/p2p-networking — gun-manhattan listed as public relay (seen via search summary).
- **[TECH-27]** Firebase pricing — Google — https://firebase.google.com/pricing — Spark limits for Firestore, RTDB and Hosting; "No payment method needed".
- **[TECH-28]** Supabase pricing — Supabase — https://supabase.com/pricing — 500 MB DB, 2 active projects, paused after 1 week of inactivity.
- **[TECH-29]** Project Pausing — Supabase Docs — https://supabase.com/docs/guides/platform/free-project-pausing — Inactivity definition, 1-year restore window.
- **[TECH-30]** Durable Objects pricing — Cloudflare Docs — https://developers.cloudflare.com/durable-objects/platform/pricing/ — SQLite DOs on Free plan: 100K req/day, 13,000 GB-s/day, 5M reads, 100K writes, 5 GB.
- **[TECH-31]** Workers limits — Cloudflare Docs — https://developers.cloudflare.com/workers/platform/limits/ — 100K requests/day, 10 ms CPU on Free.
- **[TECH-32]** KV limits — Cloudflare Docs — https://developers.cloudflare.com/kv/platform/limits/ — 100K reads/day, 1K writes/day, 1 GB on Free.
- **[TECH-33]** The Instant team joins OpenAI — InstantDB, Aug 2026 — https://instantdb.com/essays/instant_team_joins_openai (plus https://www.instantdb.com/pricing) — Signups closed; cloud apps shut down 31 Aug 2027.
- **[TECH-34]** Convex pricing — Convex — https://www.convex.dev/pricing — 0.5 GB DB, 1 GB files, 1M function calls on Free & Starter.
- **[TECH-35]** Appwrite changelog entries 2026-02-20 and 2026-06-29 — Appwrite — https://appwrite.io/changelog/entry/2026-02-20-1 ; https://appwrite.io/changelog/entry/2026-06-29 — Free projects paused after 7 days without activity and deleted after 90 days paused; 2 projects (seen via search summary).
- **[TECH-36]** End-to-End Encryption in the Browser — Excalidraw blog, 2020-03-21 — https://plus.excalidraw.com/blog/end-to-end-encryption — AES-GCM key in `#key=`; server stores only ciphertext.
- **[TECH-37]** PrivateBin README — GitHub — https://github.com/PrivateBin/PrivateBin — 256-bit AES in browser, key in URL, trust-the-JS caveats.
- **[TECH-38]** SubtleCrypto — MDN — https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto — Baseline since Sept 2017, secure context only, misuse warning.
- **[TECH-39]** CompressionStream — MDN — https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream — Baseline widely available since May 2023.
- **[TECH-40]** GitHub Pages limits — GitHub Docs — https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits — Prohibited uses, 1 GB, 100 GB/month soft bandwidth, deploy timeout.
- **[TECH-41]** About GitHub Pages — GitHub Docs — https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages — Visitor IP addresses logged and stored.
- **[TECH-42]** Changing the visibility of your GitHub Pages site — GitHub Docs — https://docs.github.com/en/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site — Private publishing requires Enterprise Cloud.
- **[TECH-43]** Block Search indexing with noindex — Google Search Central — https://developers.google.com/search/docs/crawling-indexing/block-indexing — Meta noindex behaviour; robots.txt caveat; other engines may differ.
- **[TECH-44]** Automerge 3.0 — automerge.org blog, July 2025 — https://automerge.org/blog/automerge-3/ — 10× memory reduction, same file format, mostly compatible API.
- **[TECH-45]** y-indexeddb — Yjs Docs — https://docs.yjs.dev/ecosystem/database-provider/y-indexeddb — IndexedDB persistence API.
- **[TECH-46]** Own measurement: esbuild bundles of yjs 13.6.33, @automerge/automerge 3.5.0, nostr-tools 2.26.0, lz-string 1.5.0 — this project, 2026-11-13 — n/a — Raw and gzip sizes quoted in §1 and §3.
- **[TECH-47]** Own measurement: deflate-raw + AES-GCM + base64url size of synthetic debates — this project, 2026-11-13 — n/a — Fragment sizes in §4.
- **[TECH-48]** PeerServer — PeerJS — https://peerjs.com/peerserver — Default free PeerJS Cloud server; self-host for production.
- **[TECH-49]** Secondary sources on URL length (e.g. "What is the maximum length of a URL in different browsers?") — Stack Overflow mirrors / blogs — https://www.geeksforgeeks.org/maximum-length-of-a-url-in-different-browsers ; https://kiwix.lema.org/stackoverflow.com_en_all_2023-11/questions/1571753/maximum-length-of-url-fragments-hash — Chrome ~2 MB, Safari ~80K, iOS hash 50K+ (all unverified).
- **[TECH-50]** WhatsApp Character Counter — typecount.com (third party) — https://typecount.com/tools/whatsapp-character-counter — 65,536-character message limit claim (unverified).
- **[TECH-51]** TURN usage estimates — CallSphere blog (2026) and Forasoft glossary — https://callsphere.ai/blog/vw3e-webrtc-nat-1to1-vs-port-restricted-ai-2026.md ; https://www.forasoft.com/learn/video-streaming/glossary/terms-streaming/turn — Vendor estimates of 8–25% of sessions needing TURN (unverified, vendor).
- **[TECH-52]** Own experiment: DNS and HTTP probes — this project, 2026-11-13 — via https://dns.google/resolve — `signaling.yjs.dev` CNAME to herokudns with no A record; `openrelay.metered.ca` → 192.0.2.1; y-webrtc Heroku hosts and gun-manhattan return "No such app".
- **[TECH-53]** Nostr user post on relay.nostr.band being "dead for a while" — nostr.lucianmarin.com (third-party Nostr viewer), date not seen — https://nostr.lucianmarin.com/post/c3e71657d9e160cf81f422e9e9572c263bf8273d43db66878008ef947cc5ea66 — Anecdotal; seen via search summary only.
