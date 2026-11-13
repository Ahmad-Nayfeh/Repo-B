// Share links and backup files (ARCHITECTURE §5, §9). Everything after '#' never reaches a server.
import { b64url, deriveRoomKeys, fromB64url, openJSON, sealJSON, type Identity } from '../crypto/crypto';
import type { DebateEvent } from '../model/types';

/** Max fragment payload we put into a link; larger → backup file (review: long WhatsApp links untested). */
export const LINK_PAYLOAD_LIMIT = 12_000;

export type ParsedLink =
  | { kind: 'join'; debateId: string; secret: Uint8Array; snapshot?: string }
  | { kind: 'update'; debateId: string; payload: string }
  | { kind: 'identity'; debateId: string; payload: string };

const ID_RE = /^[A-Za-z0-9_-]{8,64}$/;
const B64_RE = /^[A-Za-z0-9_-]+$/;

export function baseUrl(): string {
  const { origin, pathname } = globalThis.location;
  return origin + pathname;
}

/** Accepts a full URL, a '#/…' fragment, or text containing one (e.g. a pasted WhatsApp message). */
export function parseLink(input: string): ParsedLink | null {
  const m = input.match(/#\/([jui])\/([A-Za-z0-9_.-]+)/);
  if (!m) return null;
  const kind = m[1]!, parts = m[2]!.split('.');
  const debateId = parts[0] ?? '';
  if (!ID_RE.test(debateId)) return null;
  try {
    if (kind === 'j') {
      const secret = fromB64url(parts[1] ?? '');
      if (secret.length !== 32) return null;
      const snapshot = parts[2];
      if (snapshot !== undefined && !B64_RE.test(snapshot)) return null;
      return { kind: 'join', debateId, secret, snapshot };
    }
    const payload = parts[1] ?? '';
    if (!B64_RE.test(payload)) return null;
    return { kind: kind === 'u' ? 'update' : 'identity', debateId, payload };
  } catch { return null; }
}

export async function makeJoinLink(debateId: string, secret: Uint8Array, events: DebateEvent[]): Promise<{ url: string; includesSnapshot: boolean }> {
  const { encKey } = await deriveRoomKeys(secret);
  const snap = b64url(await sealJSON(encKey, events));
  const head = `${baseUrl()}#/j/${debateId}.${b64url(secret)}`;
  return snap.length <= LINK_PAYLOAD_LIMIT ? { url: `${head}.${snap}`, includesSnapshot: true } : { url: head, includesSnapshot: false };
}

/** Update link: debate id + encrypted events. Carries NO key (review D14). Null if too large. */
export async function makeUpdatePayload(encKey: CryptoKey, events: DebateEvent[]): Promise<string> {
  return b64url(await sealJSON(encKey, events));
}
export function updateLink(debateId: string, payload: string): string | null {
  return payload.length <= LINK_PAYLOAD_LIMIT ? `${baseUrl()}#/u/${debateId}.${payload}` : null;
}

export async function makeIdentityLink(debateId: string, encKey: CryptoKey, id: Identity): Promise<string> {
  return `${baseUrl()}#/i/${debateId}.${b64url(await sealJSON(encKey, id))}`;
}

export async function openPayload<T>(encKey: CryptoKey, payload: string): Promise<T> {
  return openJSON<T>(encKey, fromB64url(payload));
}

// ---- backup file (.txt so Android Web Share accepts it, review D17) ----------------------
const BACKUP_HEADER = 'MUNAZARA-BACKUP v1';

export async function makeBackupText(debateId: string, title: string, encKey: CryptoKey, events: DebateEvent[]): Promise<string> {
  const body = b64url(await sealJSON(encKey, { format: 'munazara-debate', version: 1, debate: { id: debateId, title }, events }));
  const lines = body.match(/.{1,76}/g) ?? [];
  return [`${BACKUP_HEADER} ${debateId}`, '', ...lines, ''].join('\n');
}

export function parseBackupText(text: string): { debateId: string; payload: string } | null {
  const lines = text.trim().split(/\r?\n/);
  const head = lines[0]?.trim() ?? '';
  if (!head.startsWith(BACKUP_HEADER)) return null;
  const debateId = head.slice(BACKUP_HEADER.length).trim();
  if (!ID_RE.test(debateId)) return null;
  const payload = lines.slice(1).join('').replace(/\s+/g, '');
  return B64_RE.test(payload) ? { debateId, payload } : null;
}

export interface PlainExport { format: 'munazara-debate'; version: 1; debate: { id: string; title: string }; events: DebateEvent[] }

export function isPlainExport(v: unknown): v is PlainExport {
  const o = v as PlainExport;
  return !!o && o.format === 'munazara-debate' && o.version === 1 && typeof o.debate?.id === 'string' && Array.isArray(o.events);
}
