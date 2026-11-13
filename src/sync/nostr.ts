// Minimal Nostr client for the encrypted mailbox (ARCHITECTURE §6.2). Lazy-loaded.
import { schnorr } from '@noble/curves/secp256k1.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';

export const KIND = 4333;

export interface NostrEvent { id: string; pubkey: string; created_at: number; kind: number; tags: string[][]; content: string; sig: string }

export function newSecretKey(): string { return bytesToHex(schnorr.utils.randomSecretKey()); }

export function makeEvent(skHex: string, content: string, tag: string): NostrEvent {
  const sk = hexToBytes(skHex);
  const pubkey = bytesToHex(schnorr.getPublicKey(sk));
  const created_at = Math.floor(Date.now() / 1000);
  const tags = [['t', tag]];
  const id = bytesToHex(sha256(new TextEncoder().encode(JSON.stringify([0, pubkey, created_at, KIND, tags, content]))));
  const sig = bytesToHex(schnorr.sign(hexToBytes(id), sk));
  return { id, pubkey, created_at, kind: KIND, tags, content, sig };
}

export type RelayState = 'wait' | 'ok' | 'down';

/**
 * One sync round with one relay: read all events for `tag` (paging back with `until`),
 * then publish `outgoing`. Resolves with the contents read and the ids the relay acknowledged.
 */
export function syncRelay(url: string, tag: string, outgoing: NostrEvent[], timeoutMs = 10_000): Promise<{ ok: boolean; contents: string[]; acked: Set<string> }> {
  return new Promise((resolve) => {
    const contents: string[] = [];
    const acked = new Set<string>();
    let ws: WebSocket;
    let settled = false, opened = false, pageCount = 0, pageSize = 0, oldest = Infinity;
    let pendingOk = 0;
    const finish = (ok: boolean) => {
      if (settled) return; settled = true; clearTimeout(timer);
      try { ws.close(); } catch { /* ignore */ }
      resolve({ ok, contents, acked });
    };
    const timer = setTimeout(() => finish(opened), timeoutMs);
    const req = (until?: number) => {
      pageCount++; pageSize = 0;
      const filter: Record<string, unknown> = { kinds: [KIND], '#t': [tag], limit: 500 };
      if (until !== undefined) filter.until = until;
      ws.send(JSON.stringify(['REQ', `m${pageCount}`, filter]));
    };
    const publishAll = () => {
      if (!outgoing.length) return finish(true);
      pendingOk = outgoing.length;
      for (const e of outgoing) ws.send(JSON.stringify(['EVENT', e]));
    };
    try { ws = new WebSocket(url); } catch { resolve({ ok: false, contents, acked }); return; }
    ws.onerror = () => finish(false);
    ws.onclose = () => finish(opened);
    ws.onopen = () => { opened = true; req(); };
    ws.onmessage = (m) => {
      let d: unknown[];
      try { d = JSON.parse(String(m.data)); } catch { return; }
      if (d[0] === 'EVENT') {
        const ev = d[2] as NostrEvent;
        if (ev && ev.kind === KIND && typeof ev.content === 'string' && ev.tags?.some((x) => x[0] === 't' && x[1] === tag)) {
          contents.push(ev.content); pageSize++; oldest = Math.min(oldest, ev.created_at);
        }
      } else if (d[0] === 'EOSE' || (d[0] === 'CLOSED' && String(d[1]).startsWith('m'))) {
        ws.send(JSON.stringify(['CLOSE', d[1]]));
        if (pageSize >= 500 && pageCount < 20 && Number.isFinite(oldest)) req(oldest);
        else publishAll();
      } else if (d[0] === 'OK') {
        if (d[2] === true) acked.add(String(d[1]));
        if (--pendingOk <= 0) finish(true);
      }
    };
  });
}
