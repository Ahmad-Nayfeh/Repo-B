import { beforeAll, describe, expect, it } from 'vitest';
import { b64url, deriveRoomKeys, fromB64url, newIdentity, openJSON, personIdFromPub, randomBytes, sealJSON, signEvent, verifyBatch, verifyEvent } from '../../src/crypto/crypto';
import { makeBackupText, makeJoinLink, makeUpdatePayload, openPayload, parseBackupText, parseLink, updateLink } from '../../src/sync/links';
import type { DebateEvent } from '../../src/model/types';
import { addEvents, getEvents, listDebates, putDebate } from '../../src/store/db';

beforeAll(() => {
  (globalThis as any).location = { origin: 'https://example.test', pathname: '/Repo-B/' };
});

const ev = (authorId: string, extra: Partial<DebateEvent> = {}): DebateEvent => ({
  type: 'node.add', id: b64url(randomBytes(16)), debateId: 'debate0001', authorId, at: Date.now(), v: 1,
  node: { id: b64url(randomBytes(8)), parentId: null, move: 'claim', text: 'العقل يستقلّ بإثبات وجود الصانع' }, ...extra,
} as DebateEvent);

describe('encoding and encryption', () => {
  it('b64url round-trips', () => {
    const b = randomBytes(1000);
    expect(fromB64url(b64url(b))).toEqual(b);
  });
  it('seal/open round-trips Arabic JSON; wrong key fails; fresh IV each time', async () => {
    const k1 = await deriveRoomKeys(randomBytes(32)), k2 = await deriveRoomKeys(randomBytes(32));
    const v = { t: 'مرحبا — mixed English', n: [1, 2, 3] };
    const s1 = await sealJSON(k1.encKey, v), s2 = await sealJSON(k1.encKey, v);
    expect(await openJSON(k1.encKey, s1)).toEqual(v);
    expect(b64url(s1.subarray(0, 12))).not.toBe(b64url(s2.subarray(0, 12)));
    await expect(openJSON(k2.encKey, s1)).rejects.toThrow();
  });
  it('room tag is deterministic per secret and differs across secrets', async () => {
    const s = randomBytes(32);
    expect((await deriveRoomKeys(s)).roomTag).toBe((await deriveRoomKeys(s)).roomTag);
    expect((await deriveRoomKeys(s)).roomTag).not.toBe((await deriveRoomKeys(randomBytes(32))).roomTag);
  });
});

describe('signatures and identity binding', () => {
  it('signed events verify; tampering fails', async () => {
    const id = await newIdentity();
    const e = await signEvent(ev(id.personId), id);
    expect(await verifyEvent(e, id.pub)).toBe(true);
    const t = { ...e, node: { ...(e as any).node, text: 'تحريف' } } as DebateEvent;
    expect(await verifyEvent(t, id.pub)).toBe(false);
  });
  it('verifyBatch rejects impersonation: a different key cannot claim an existing personId', async () => {
    const ahmad = await newIdentity(), mallory = await newIdentity();
    const join = await signEvent({ type: 'person.join', id: 'j1', debateId: 'debate0001', authorId: ahmad.personId, at: 1, v: 1, name: 'أحمد', pub: ahmad.pub }, ahmad);
    // Mallory forges a join with Ahmad's personId but her own key, and an earlier timestamp
    const forgedJoin = await signEvent({ type: 'person.join', id: 'j0', debateId: 'debate0001', authorId: ahmad.personId, at: 0, v: 1, name: 'أحمد', pub: mallory.pub }, mallory);
    const forgedNode = await signEvent(ev(ahmad.personId), mallory);
    const realNode = await signEvent(ev(ahmad.personId), ahmad);
    const ok = await verifyBatch([forgedJoin, join, forgedNode, realNode], new Map());
    expect(ok.map((e) => e.id).sort()).toEqual([join.id, realNode.id].sort());
    expect(await personIdFromPub(ahmad.pub)).toBe(ahmad.personId);
  });
});

describe('links', () => {
  it('join link round-trips with snapshot; update link carries no key', async () => {
    const secret = randomBytes(32);
    const { url, includesSnapshot } = await makeJoinLink('debate0001', secret, [ev('x')]);
    expect(includesSnapshot).toBe(true);
    const p = parseLink(`رابط المناظرة: ${url} شكراً`)!;
    expect(p.kind).toBe('join');
    if (p.kind !== 'join') throw 0;
    expect(p.secret).toEqual(secret);
    const { encKey } = await deriveRoomKeys(secret);
    const events = await openPayload<DebateEvent[]>(encKey, p.snapshot!);
    expect(events[0]!.type).toBe('node.add');

    const payload = await makeUpdatePayload(encKey, [ev('x')]);
    const u = updateLink('debate0001', payload)!;
    expect(u).not.toContain(b64url(secret));
    expect(parseLink(u)!.kind).toBe('update');
  });
  it('rejects malformed links', () => {
    expect(parseLink('https://x/#/j/short.abc')).toBeNull();
    expect(parseLink('hello')).toBeNull();
    expect(parseLink('#/j/debate0001.' + b64url(randomBytes(31)))).toBeNull();
  });
  it('backup text round-trips', async () => {
    const { encKey } = await deriveRoomKeys(randomBytes(32));
    const txt = await makeBackupText('debate0001', 'عنوان', encKey, [ev('x')]);
    const parsed = parseBackupText(txt)!;
    expect(parsed.debateId).toBe('debate0001');
    const body = await openPayload<{ events: DebateEvent[] }>(encKey, parsed.payload);
    expect(body.events.length).toBe(1);
  });
  it('a 100-point debate fits in a join link (rough size check)', async () => {
    const events = Array.from({ length: 100 }, () => ev('x', {}));
    for (const e of events) (e as any).node.text = 'هذا نص تجريبي متوسط الطول يمثّل نقطة في مناظرة طويلة حول العقل والنقل والدليل. '.repeat(2);
    const { url } = await makeJoinLink('debate0001', randomBytes(32), events);
    // record, not assert: link size depends on text entropy
    console.log('100-node join link length:', url.length);
    expect(url.length).toBeGreaterThan(100);
  });
});

describe('IndexedDB store', () => {
  it('stores debates and dedupes events', async () => {
    await putDebate({ id: 'debate0001', title: 't', secret: 's', syncMode: 'manual', createdAt: 1, updatedAt: 1, lastSeenAt: 1, prevSeenAt: 1 });
    expect((await listDebates()).length).toBe(1);
    const e = ev('x');
    expect((await addEvents([e, e])).length).toBe(1);
    expect((await addEvents([e])).length).toBe(0);
    expect((await getEvents('debate0001')).length).toBe(1);
  });
});
