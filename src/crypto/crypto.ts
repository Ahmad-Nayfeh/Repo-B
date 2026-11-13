// WebCrypto helpers (ARCHITECTURE §4). No third-party crypto here; Nostr signing lives in sync/nostr.ts.
import type { DebateEvent } from '../model/types';
import { isWellFormedEvent, LIMITS } from '../model/validate';

const enc = new TextEncoder();
const dec = new TextDecoder();
const subtle = () => globalThis.crypto.subtle;

// ---- encoding -----------------------------------------------------------------------
export function b64url(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function fromB64url(s: string): Uint8Array {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}
export const randomBytes = (n: number) => globalThis.crypto.getRandomValues(new Uint8Array(n));
export const randomId = () => b64url(randomBytes(16));

const buf = (u: Uint8Array): ArrayBuffer => u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength) as ArrayBuffer;

// ---- room keys ----------------------------------------------------------------------
export interface RoomKeys { encKey: CryptoKey; roomTag: string }

export async function deriveRoomKeys(roomSecret: Uint8Array): Promise<RoomKeys> {
  const base = await subtle().importKey('raw', buf(roomSecret), 'HKDF', false, ['deriveKey', 'deriveBits']);
  const salt = enc.encode('munazara');
  const encKey = await subtle().deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt, info: enc.encode('munazara/v1/enc') },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'],
  );
  const tagBits = await subtle().deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: enc.encode('munazara/v1/tag') }, base, 128);
  const roomTag = [...new Uint8Array(tagBits)].map((x) => x.toString(16).padStart(2, '0')).join('');
  return { encKey, roomTag };
}

// ---- compression --------------------------------------------------------------------
async function pipe(data: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Response(new Blob([buf(data)]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}
export const deflate = (d: Uint8Array) => pipe(d, new CompressionStream('deflate-raw'));
/** Max decompressed size accepted from any payload (security review S7). */
export const MAX_INFLATED = 32 * 1024 * 1024;
export async function inflate(d: Uint8Array, max = MAX_INFLATED): Promise<Uint8Array> {
  const reader = new Blob([buf(d)]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
  const chunks: Uint8Array[] = []; let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > max) { await reader.cancel(); throw new Error('payload_too_large'); }
    chunks.push(value);
  }
  const out = new Uint8Array(total); let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.length; }
  return out;
}

// ---- symmetric encryption -----------------------------------------------------------
/** Encrypts JSON-serialisable data: deflate → AES-GCM (fresh 96-bit IV) → iv||ct. */
export async function sealJSON(encKey: CryptoKey, value: unknown): Promise<Uint8Array> {
  const plain = await deflate(enc.encode(JSON.stringify(value)));
  const iv = randomBytes(12);
  const ct = new Uint8Array(await subtle().encrypt({ name: 'AES-GCM', iv: buf(iv) }, encKey, buf(plain)));
  const out = new Uint8Array(12 + ct.length);
  out.set(iv); out.set(ct, 12);
  return out;
}
export async function openJSON<T = unknown>(encKey: CryptoKey, sealed: Uint8Array): Promise<T> {
  if (sealed.length < 13) throw new Error('sealed_too_short');
  const iv = sealed.subarray(0, 12), ct = sealed.subarray(12);
  const plain = new Uint8Array(await subtle().decrypt({ name: 'AES-GCM', iv: buf(iv) }, encKey, buf(ct)));
  return JSON.parse(dec.decode(await inflate(plain))) as T;
}

// ---- per-person signing (ECDSA P-256) ----------------------------------------------
const ECDSA = { name: 'ECDSA', namedCurve: 'P-256' } as const;
const SIGN = { name: 'ECDSA', hash: 'SHA-256' } as const;

export interface Identity { personId: string; privateJwk: JsonWebKey; pub: string }

export async function newIdentity(): Promise<Identity> {
  const kp = await subtle().generateKey(ECDSA, true, ['sign', 'verify']) as CryptoKeyPair;
  const raw = new Uint8Array(await subtle().exportKey('raw', kp.publicKey));
  const privateJwk = await subtle().exportKey('jwk', kp.privateKey);
  const pub = b64url(raw);
  return { personId: await personIdFromPub(pub), privateJwk, pub };
}

/** personId is bound to the key: first 16 bytes of SHA-256(raw public key). Nobody can claim
 *  an existing participant's id with a different key. */
export async function personIdFromPub(pub: string): Promise<string> {
  const h = new Uint8Array(await subtle().digest('SHA-256', buf(fromB64url(pub))));
  return b64url(h.subarray(0, 16));
}

const privCache = new Map<string, Promise<CryptoKey>>();
function importPriv(jwk: JsonWebKey): Promise<CryptoKey> {
  const k = jwk.d ?? '';
  let p = privCache.get(k);
  if (!p) { p = subtle().importKey('jwk', jwk, ECDSA, false, ['sign']); privCache.set(k, p); }
  return p;
}
const pubCache = new Map<string, Promise<CryptoKey>>();
function importPub(pub: string): Promise<CryptoKey> {
  let p = pubCache.get(pub);
  if (!p) { p = subtle().importKey('raw', buf(fromB64url(pub)), ECDSA, false, ['verify']); pubCache.set(pub, p); }
  return p;
}

/** Canonical bytes of an event without its signature (stable key order). */
export function canonical(e: DebateEvent): Uint8Array {
  const { sig: _sig, ...rest } = e as DebateEvent & { sig?: string };
  return enc.encode(stableStringify(rest));
}
export function stableStringify(v: unknown): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v) ?? 'null';
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(',')}]`;
  const o = v as Record<string, unknown>;
  return `{${Object.keys(o).filter((k) => o[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${stableStringify(o[k])}`).join(',')}}`;
}

export async function signEvent<E extends DebateEvent>(e: E, id: Identity): Promise<E> {
  const key = await importPriv(id.privateJwk);
  const sig = new Uint8Array(await subtle().sign(SIGN, key, buf(canonical(e))));
  return { ...e, sig: b64url(sig) };
}
export async function verifyEvent(e: DebateEvent, pub: string): Promise<boolean> {
  if (!e.sig) return false;
  try {
    return await subtle().verify(SIGN, await importPub(pub), buf(fromB64url(e.sig)), buf(canonical(e)));
  } catch { return false; }
}

const sha = async (s: string) => new Uint8Array(await subtle().digest('SHA-256', buf(enc.encode(s))));

/** Content-addressed event id (security review S4): hash of the event without id, sig and node.id. */
export async function computeEventId(e: DebateEvent): Promise<string> {
  const { id: _i, sig: _s, ...rest } = e as DebateEvent & { sig?: string };
  const body: Record<string, unknown> = { ...rest };
  if (e.type === 'node.add') body.node = { ...e.node, id: undefined };
  return b64url((await sha(stableStringify(body))).subarray(0, 16));
}
/** A debate id is bound to its creator (security review S5): hash(creatorPersonId:salt). */
export async function debateIdFor(personId: string, salt: string): Promise<string> {
  return b64url((await sha(`munazara-debate:${personId}:${salt}`)).subarray(0, 16));
}

/**
 * Filters a batch to events whose signatures verify. `knownPubs` maps personId → pub for people
 * already accepted locally; joins in the batch are self-verified and then extend the map.
 */
export async function verifyBatch(events: DebateEvent[], knownPubs: Map<string, string>): Promise<DebateEvent[]> {
  const pubs = new Map(knownPubs);
  const out: DebateEvent[] = [];
  // shape + content-addressed id first; anything malformed is dropped, never thrown (S2, S6)
  const candidates: DebateEvent[] = [];
  for (const e of events.slice(0, LIMITS.eventsPerBatch)) {
    try {
      if (!isWellFormedEvent(e)) continue;
      if (e.id !== await computeEventId(e)) continue;
      if (e.type === 'debate.create' && e.debateId !== await debateIdFor(e.authorId, (e as { salt?: string }).salt ?? '')) continue;
      candidates.push(e);
    } catch { /* drop */ }
  }
  for (const e of candidates) {
    if (e.type !== 'person.join') continue;
    try {
      if (e.authorId !== await personIdFromPub(e.pub)) continue; // id must be bound to the key
      if (!(await verifyEvent(e, e.pub))) continue;
      if (!pubs.has(e.authorId)) pubs.set(e.authorId, e.pub);
      out.push(e);
    } catch { /* drop */ }
  }
  for (const e of candidates) {
    if (e.type === 'person.join') continue;
    try {
      const pub = pubs.get(e.authorId);
      if (pub && await verifyEvent(e, pub)) out.push(e);
    } catch { /* drop */ }
  }
  return out;
}
