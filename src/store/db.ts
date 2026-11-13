// Thin IndexedDB wrapper (ARCHITECTURE §3). No dependency.
import type { Identity } from '../crypto/crypto';
import type { DebateEvent } from '../model/types';

export type SyncMode = 'manual' | 'relay';

export interface DebateRecord {
  id: string;
  title: string;
  secret: string;              // b64url room secret
  identity?: Identity;         // my signing identity in this debate
  syncMode: SyncMode;
  createdAt: number;
  updatedAt: number;           // last local change or received event
  lastSeenAt: number;          // when I last looked at the debate (for "new since")
  prevSeenAt: number;          // the lastSeenAt before the current visit
  lastBackupAt?: number;
  lastExportAt?: number;       // for manual delta updates
  bannerSeen?: boolean;
  nostrSk?: string;            // per-device Nostr signing key (hex), never derived from the link
  relayPublished?: string[];   // my event ids acknowledged by ≥ 2 relays
}

export interface Settings { lang: 'ar' | 'en'; digits: 'arab' | 'latn'; hideTitles: boolean; hintsSeen: string[] }

const DB_NAME = 'munazara';
const VERSION = 1;

let dbp: Promise<IDBDatabase> | null = null;
function db(): Promise<IDBDatabase> {
  if (!dbp) {
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, VERSION);
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains('debates')) d.createObjectStore('debates', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('events')) {
          const s = d.createObjectStore('events', { keyPath: ['debateId', 'id'] });
          s.createIndex('byDebate', 'debateId');
        }
        if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbp;
}

const p = <T>(r: IDBRequest<T>) => new Promise<T>((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const done = (tx: IDBTransaction) => new Promise<void>((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); });

export async function listDebates(): Promise<DebateRecord[]> {
  const d = await db();
  return p(d.transaction('debates').objectStore('debates').getAll() as IDBRequest<DebateRecord[]>);
}
export async function getDebate(id: string): Promise<DebateRecord | undefined> {
  const d = await db();
  return p(d.transaction('debates').objectStore('debates').get(id) as IDBRequest<DebateRecord | undefined>);
}
export async function putDebate(r: DebateRecord): Promise<void> {
  const d = await db(); const tx = d.transaction('debates', 'readwrite');
  tx.objectStore('debates').put(r); await done(tx);
}
export async function deleteDebate(id: string): Promise<void> {
  const d = await db(); const tx = d.transaction(['debates', 'events'], 'readwrite');
  tx.objectStore('debates').delete(id);
  const idx = tx.objectStore('events').index('byDebate');
  const keys = await p(idx.getAllKeys(IDBKeyRange.only(id)));
  for (const k of keys) tx.objectStore('events').delete(k);
  await done(tx);
}

export async function getEvents(debateId: string): Promise<DebateEvent[]> {
  const d = await db();
  return p(d.transaction('events').objectStore('events').index('byDebate').getAll(IDBKeyRange.only(debateId)) as IDBRequest<DebateEvent[]>);
}
/** Adds events not yet stored; returns the newly added ones. */
export async function addEvents(events: DebateEvent[]): Promise<DebateEvent[]> {
  if (!events.length) return [];
  const d = await db(); const tx = d.transaction('events', 'readwrite'); const st = tx.objectStore('events');
  const added: DebateEvent[] = [];
  for (const e of events) {
    const exists = await p(st.getKey([e.debateId, e.id]));
    if (exists === undefined) { st.put(e); added.push(e); }
  }
  await done(tx);
  return added;
}

export async function getSettings(): Promise<Settings> {
  const d = await db();
  const v = await p(d.transaction('kv').objectStore('kv').get('settings') as IDBRequest<Partial<Settings> | undefined>);
  return { lang: 'ar', digits: 'arab', hideTitles: false, hintsSeen: [], ...(v ?? {}) };
}
export async function putSettings(s: Settings): Promise<void> {
  const d = await db(); const tx = d.transaction('kv', 'readwrite');
  tx.objectStore('kv').put(s, 'settings'); await done(tx);
}
