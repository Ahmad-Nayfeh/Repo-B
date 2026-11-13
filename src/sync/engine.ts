// Sync orchestration. The Nostr client is imported lazily (kept out of the first-load bundle).
import { signal } from '@preact/signals';
import { b64url, deriveRoomKeys, fromB64url, openJSON, sealJSON } from '../crypto/crypto';
import type { DebateEvent } from '../model/types';
import * as db from '../store/db';
import { ingest, onLocalEvents } from '../app/service';

/** Fixed default relays (re-tested with kind 4333 on 2026-11-13, research TECH-54). */
export const DEFAULT_RELAYS = [
  'wss://relay.primal.net', 'wss://relay.damus.io', 'wss://offchain.pub',
  'wss://nostr.oxtr.dev', 'wss://relay.nostr.net', 'wss://relay.snort.social',
];
const BATCH_BYTES = 40_000;

function relays(): string[] {
  // test hook: e2e tests point the app at a local mock relay; never set in production
  try { const v = localStorage.getItem('munazara.testRelays'); if (v) return JSON.parse(v) as string[]; } catch { /* ignore */ }
  return DEFAULT_RELAYS;
}

export const relayStatus = signal<Record<string, Array<{ url: string; state: 'wait' | 'ok' | 'down' }>>>({});
export const lastSync = signal<Record<string, number>>({});
const running = new Map<string, Promise<void>>();

export function initSync() {
  onLocalEvents((debateId) => { void syncNow(debateId); });
}

export function syncNow(debateId: string): Promise<void> {
  const r = running.get(debateId);
  if (r) return r.then(() => syncNow(debateId));
  const p = syncDebate(debateId).finally(() => running.delete(debateId));
  running.set(debateId, p);
  return p;
}

async function syncDebate(debateId: string) {
  const rec = await db.getDebate(debateId);
  if (!rec || rec.syncMode !== 'relay' || !navigator.onLine) return;
  const nostr = await import('./nostr');
  const { encKey, roomTag } = await deriveRoomKeys(fromB64url(rec.secret));
  if (!rec.nostrSk) { rec.nostrSk = nostr.newSecretKey(); await db.putDebate(rec); }

  // outgoing: my own events not yet acknowledged by ≥ 2 relays
  const events = await db.getEvents(debateId);
  const published = new Set(rec.relayPublished ?? []);
  const mine = rec.identity ? events.filter((e) => e.authorId === rec.identity!.personId && !published.has(e.id)) : [];
  const batches: DebateEvent[][] = [];
  let cur: DebateEvent[] = [], size = 0;
  for (const e of mine) {
    const s = JSON.stringify(e).length;
    if (cur.length && size + s > BATCH_BYTES) { batches.push(cur); cur = []; size = 0; }
    cur.push(e); size += s;
  }
  if (cur.length) batches.push(cur);
  const outgoing: import('./nostr').NostrEvent[] = [];
  const batchOf = new Map<string, DebateEvent[]>();
  for (const b of batches) {
    const ev = nostr.makeEvent(rec.nostrSk, b64url(await sealJSON(encKey, b)), roomTag);
    outgoing.push(ev); batchOf.set(ev.id, b);
  }

  const urls = relays();
  relayStatus.value = { ...relayStatus.value, [debateId]: urls.map((url) => ({ url, state: 'wait' as const })) };
  const results = await Promise.all(urls.map(async (url) => {
    const res = await nostr.syncRelay(url, roomTag, outgoing);
    relayStatus.value = { ...relayStatus.value, [debateId]: (relayStatus.value[debateId] ?? []).map((x) => x.url === url ? { url, state: res.ok ? 'ok' : 'down' } : x) };
    return res;
  }));

  // incoming
  const seen = new Set<string>();
  const incoming: DebateEvent[] = [];
  for (const r of results) for (const c of r.contents) {
    if (seen.has(c)) continue; seen.add(c);
    try { const arr = await openJSON<DebateEvent[]>(encKey, fromB64url(c)); if (Array.isArray(arr)) incoming.push(...arr); } catch { /* not ours / corrupt */ }
  }
  if (incoming.length) await ingest(debateId, incoming);

  // acknowledgements
  const ackCount = new Map<string, number>();
  for (const r of results) for (const id of r.acked) ackCount.set(id, (ackCount.get(id) ?? 0) + 1);
  const fresh = await db.getDebate(debateId);
  if (fresh) {
    const pub = new Set(fresh.relayPublished ?? []);
    const need = Math.min(2, urls.length);
    for (const [id, n] of ackCount) if (n >= need) for (const e of batchOf.get(id) ?? []) pub.add(e.id);
    fresh.relayPublished = [...pub];
    await db.putDebate(fresh);
  }
  lastSync.value = { ...lastSync.value, [debateId]: Date.now() };
}
