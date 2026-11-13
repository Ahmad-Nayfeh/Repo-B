// Application service: state signals + actions. All incoming events pass signature verification.
import { batch, signal } from '@preact/signals';
import {
  b64url, deriveRoomKeys, fromB64url, newIdentity, randomBytes, randomId, signEvent, verifyBatch,
  type Identity, type RoomKeys,
} from '../crypto/crypto';
import { digits, lang } from '../i18n';
import { derive } from '../model/derive';
import type { DebateEvent, DebateState, Move, NodeMeta } from '../model/types';
import * as db from '../store/db';
import type { DebateRecord, Settings, SyncMode } from '../store/db';
import {
  isPlainExport, makeBackupText, makeIdentityLink, makeJoinLink, makeUpdatePayload, openPayload,
  parseBackupText, updateLink, type ParsedLink, type PlainExport,
} from '../sync/links';

export interface Loaded {
  record: DebateRecord;
  events: DebateEvent[];
  state: DebateState;
  keys: RoomKeys;
  me: string | null; // my personId if I have an identity that is a participant
}

export const settings = signal<Settings>({ lang: 'ar', digits: 'arab', hideTitles: false, hintsSeen: [] });
export const debates = signal<Array<{ record: DebateRecord; state: DebateState }>>([]);
export const current = signal<Loaded | null>(null);
export const toast = signal<string | null>(null);

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function showToast(msg: string) {
  toast.value = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = null), 3500);
}

// listeners (sync engine subscribes to local changes)
type Listener = (debateId: string, added: DebateEvent[]) => void;
const listeners = new Set<Listener>();
export const onLocalEvents = (l: Listener) => { listeners.add(l); return () => listeners.delete(l); };

let clock = 0;
const now = () => (clock = Math.max(Date.now(), clock + 1));

// ---- settings -----------------------------------------------------------------------------
export async function loadSettings() {
  const s = await db.getSettings();
  batch(() => { settings.value = s; lang.value = s.lang; digits.value = s.digits; });
}
export async function saveSettings(patch: Partial<Settings>) {
  const s = { ...settings.value, ...patch };
  await db.putSettings(s);
  batch(() => { settings.value = s; lang.value = s.lang; digits.value = s.digits; });
}

// ---- loading ------------------------------------------------------------------------------
export async function refreshList() {
  const recs = await db.listDebates();
  const out = [];
  for (const r of recs) out.push({ record: r, state: derive(r.id, await db.getEvents(r.id)) });
  out.sort((a, b) => b.record.updatedAt - a.record.updatedAt);
  debates.value = out;
}

const keyCache = new Map<string, Promise<RoomKeys>>();
function keysFor(r: DebateRecord): Promise<RoomKeys> {
  let k = keyCache.get(r.id);
  if (!k) { k = deriveRoomKeys(fromB64url(r.secret)); keyCache.set(r.id, k); }
  return k;
}

export async function openDebate(id: string, markSeen = true): Promise<Loaded | null> {
  const record = await db.getDebate(id);
  if (!record) { current.value = null; return null; }
  if (markSeen && (!current.value || current.value.record.id !== id)) {
    record.prevSeenAt = record.lastSeenAt;
    record.lastSeenAt = Date.now();
    await db.putDebate(record);
  }
  return reload(record);
}

async function reload(record: DebateRecord): Promise<Loaded> {
  const events = await db.getEvents(record.id);
  const state = derive(record.id, events);
  const me = record.identity && state.people.has(record.identity.personId) ? record.identity.personId : null;
  const l: Loaded = { record, events, state, keys: await keysFor(record), me };
  current.value = l;
  return l;
}

async function persistAndReload(record: DebateRecord, added: DebateEvent[], local: boolean) {
  if (added.length) record.updatedAt = Date.now();
  await db.putDebate(record);
  if (!current.value || current.value.record.id === record.id) await reload(record);
  await refreshList();
  if (local && added.length) for (const l of listeners) l(record.id, added);
}

// ---- ingest (any source) ------------------------------------------------------------------
/** Verifies and stores events; returns the number of new events. */
export async function ingest(debateId: string, incoming: DebateEvent[], local = false): Promise<number> {
  const record = await db.getDebate(debateId);
  if (!record) return 0;
  const existing = await db.getEvents(debateId);
  const pubs = new Map<string, string>();
  for (const e of existing) if (e.type === 'person.join') pubs.set(e.authorId, e.pub);
  const valid = await verifyBatch(incoming.filter((e) => e && e.debateId === debateId && e.v === 1), pubs);
  const added = await db.addEvents(valid);
  if (added.length || local) await persistAndReload(record, added, local);
  return added.length;
}

async function emit(record: DebateRecord, identity: Identity, partials: Array<Omit<DebateEvent, 'id' | 'debateId' | 'authorId' | 'at' | 'v' | 'sig'>>) {
  const signed: DebateEvent[] = [];
  for (const p of partials) {
    const e = { ...p, id: randomId(), debateId: record.id, authorId: identity.personId, at: now(), v: 1 } as DebateEvent;
    signed.push(await signEvent(e, identity));
  }
  const added = await db.addEvents(signed);
  await persistAndReload(record, added, true);
  return signed;
}

// ---- create / join --------------------------------------------------------------------------
export async function createDebate(o: { title: string; name: string; standpoint: string; syncMode: SyncMode }): Promise<string> {
  const id = randomId();
  const secret = randomBytes(32);
  const identity = await newIdentity();
  const t = Date.now();
  const record: DebateRecord = {
    id, title: o.title.trim(), secret: b64url(secret), identity, syncMode: o.syncMode,
    createdAt: t, updatedAt: t, lastSeenAt: t, prevSeenAt: t, bannerSeen: true,
  };
  await db.putDebate(record);
  await emit(record, identity, [
    { type: 'debate.create', title: o.title.trim(), lang: lang.value } as never,
    { type: 'person.join', name: o.name.trim(), pub: identity.pub } as never,
    { type: 'node.add', node: { id: randomId(), parentId: null, move: 'claim', text: o.standpoint.trim() } } as never,
  ]);
  void requestPersist();
  return id;
}

/** Opens an invite link: stores the debate (if new) and merges its snapshot. Returns debate id. */
export async function acceptJoinLink(p: Extract<ParsedLink, { kind: 'join' }>): Promise<string> {
  let record = await db.getDebate(p.debateId);
  const keys = await deriveRoomKeys(p.secret);
  let snapshot: DebateEvent[] = [];
  if (p.snapshot) {
    try { snapshot = await openPayload<DebateEvent[]>(keys.encKey, p.snapshot); } catch { snapshot = []; }
  }
  if (!record) {
    const t = Date.now();
    const title = (snapshot.find((e) => e.type === 'debate.create') as Extract<DebateEvent, { type: 'debate.create' }> | undefined)?.title ?? '';
    record = { id: p.debateId, title, secret: b64url(p.secret), syncMode: 'manual', createdAt: t, updatedAt: t, lastSeenAt: 0, prevSeenAt: 0 };
    await db.putDebate(record);
  }
  if (snapshot.length) await ingest(p.debateId, snapshot);
  await refreshList();
  return p.debateId;
}

export async function joinAs(debateId: string, o: { name: string; standpoint?: string; questionerOnly: boolean; syncMode?: SyncMode }) {
  const record = (await db.getDebate(debateId))!;
  const identity = await newIdentity();
  record.identity = identity;
  if (o.syncMode) record.syncMode = o.syncMode;
  record.bannerSeen = true;
  const partials: Array<never> = [{ type: 'person.join', name: o.name.trim(), pub: identity.pub, questionerOnly: o.questionerOnly } as never];
  if (o.standpoint?.trim()) partials.push({ type: 'node.add', node: { id: randomId(), parentId: null, move: 'claim', text: o.standpoint.trim() } } as never);
  await emit(record, identity, partials);
  void requestPersist();
}

// ---- moves ----------------------------------------------------------------------------------
export async function addMove(parentId: string | null, move: Move, text: string, meta?: NodeMeta): Promise<string> {
  const l = current.value!;
  const nodeId = randomId();
  const clean: NodeMeta | undefined = meta && Object.keys(meta).length ? meta : undefined;
  await emit(l.record, l.record.identity!, [{ type: 'node.add', node: { id: nodeId, parentId, move, text: text.trim(), meta: clean } } as never]);
  return nodeId;
}
export async function editNode(nodeId: string, text: string) {
  const l = current.value!;
  await emit(l.record, l.record.identity!, [{ type: 'node.edit', nodeId, text: text.trim() } as never]);
}
export async function markBannerSeen() {
  const l = current.value; if (!l || l.record.bannerSeen) return;
  l.record.bannerSeen = true; await db.putDebate(l.record);
}
export async function setSyncMode(mode: SyncMode) {
  const l = current.value!; l.record.syncMode = mode;
  await db.putDebate(l.record); await reload(l.record);
  for (const li of listeners) li(l.record.id, []);
}
export async function patchRecord(id: string, patch: Partial<DebateRecord>) {
  const r = await db.getDebate(id); if (!r) return;
  Object.assign(r, patch); await db.putDebate(r);
  if (current.value?.record.id === id) await reload(r);
}
export async function removeDebate(id: string) {
  await db.deleteDebate(id); keyCache.delete(id);
  if (current.value?.record.id === id) current.value = null;
  await refreshList();
}

// ---- links, updates, backups ---------------------------------------------------------------
export async function inviteLink(): Promise<{ url: string; includesSnapshot: boolean }> {
  const l = current.value!;
  return makeJoinLink(l.record.id, fromB64url(l.record.secret), l.events);
}

/** Update link (no key) or, if too large, a backup-style file. */
export async function makeUpdate(): Promise<{ url?: string; file?: { name: string; text: string } }> {
  const l = current.value!;
  const all = l.events;
  let url = updateLink(l.record.id, await makeUpdatePayload(l.keys.encKey, all));
  if (!url && l.record.lastExportAt) {
    const since = l.record.lastExportAt - 3 * 86400_000; // margin for clock skew; union merge makes overlap harmless
    url = updateLink(l.record.id, await makeUpdatePayload(l.keys.encKey, all.filter((e) => e.at >= since)));
  }
  await patchRecord(l.record.id, { lastExportAt: Date.now() });
  if (url) return { url };
  return { file: await backupFile() };
}

export async function backupFile(): Promise<{ name: string; text: string }> {
  const l = current.value!;
  const text = await makeBackupText(l.record.id, l.state.title, l.keys.encKey, l.events);
  await patchRecord(l.record.id, { lastBackupAt: Date.now() });
  const safe = (l.state.title || 'debate').replace(/[\\/:*?"<>|#]+/g, ' ').slice(0, 40).trim();
  return { name: `مناظرة - ${safe}.txt`, text };
}

export function plainExport(): { name: string; text: string } {
  const l = current.value!;
  const body: PlainExport = { format: 'munazara-debate', version: 1, debate: { id: l.record.id, title: l.state.title }, events: l.events };
  return { name: `munazara-${l.record.id}.json`, text: JSON.stringify(body, null, 1) };
}

export async function acceptUpdatePayload(debateId: string, payload: string): Promise<number> {
  const record = await db.getDebate(debateId);
  if (!record) throw new Error('need_invite');
  const { encKey } = await keysFor(record);
  const events = await openPayload<DebateEvent[]>(encKey, payload);
  return ingest(debateId, Array.isArray(events) ? events : []);
}

export async function acceptIdentityPayload(debateId: string, payload: string): Promise<string> {
  const record = await db.getDebate(debateId);
  if (!record) throw new Error('need_invite');
  const { encKey } = await keysFor(record);
  const id = await openPayload<Identity>(encKey, payload);
  if (!id?.personId || !id.privateJwk || !id.pub) throw new Error('bad_identity');
  record.identity = id;
  await db.putDebate(record);
  const l = await openDebate(debateId, false);
  return l?.state.people.get(id.personId)?.name ?? '';
}

export async function identityLink(): Promise<string> {
  const l = current.value!;
  return makeIdentityLink(l.record.id, l.keys.encKey, l.record.identity!);
}

/** Imports an encrypted .txt backup or a plain JSON export. Returns { debateId, added }. */
export async function importFileText(text: string): Promise<{ debateId: string; added: number }> {
  const b = parseBackupText(text);
  if (b) return { debateId: b.debateId, added: await acceptBackupPayload(b.debateId, b.payload) };
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { throw new Error('unrecognised_file'); }
  if (!isPlainExport(parsed)) throw new Error('unrecognised_file');
  if (!(await db.getDebate(parsed.debate.id))) throw new Error('need_invite');
  return { debateId: parsed.debate.id, added: await ingest(parsed.debate.id, parsed.events) };
}
async function acceptBackupPayload(debateId: string, payload: string): Promise<number> {
  const record = await db.getDebate(debateId);
  if (!record) throw new Error('need_invite');
  const { encKey } = await keysFor(record);
  const body = await openPayload<PlainExport>(encKey, payload);
  return ingest(debateId, isPlainExport(body) ? body.events : []);
}

async function requestPersist() {
  try { if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist(); } catch { /* ignore */ }
}
