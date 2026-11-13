import { beforeAll, describe, expect, it } from 'vitest';
import {
  b64url, computeEventId, debateIdFor, deflate, deriveRoomKeys, fromB64url, inflate, newIdentity, openJSON, personIdFromPub,
  randomBytes, randomId, sealJSON, signEvent, verifyBatch, verifyEvent, type Identity,
} from '../../src/crypto/crypto';
import { makeBackupText, makeJoinLink, makeUpdatePayload, openPayload, parseBackupText, parseLink, updateLink } from '../../src/sync/links';
import type { DebateEvent } from '../../src/model/types';
import { addEvents, getEvents, listDebates, putDebate } from '../../src/store/db';

beforeAll(() => { (globalThis as any).location = { origin: 'https://example.test', pathname: '/Repo-B/' }; });

const DEBATE = 'debate000000000001';
/** Builds a correctly formed, content-addressed, signed event. */
async function mk(id: Identity, partial: Record<string, unknown>, debateId = DEBATE): Promise<DebateEvent> {
  const e: any = { ...partial, id: '', debateId, authorId: id.personId, at: Date.now(), v: 1 };
  e.id = await computeEventId(e);
  if (e.type === 'node.add') e.node = { ...e.node, id: e.id };
  return signEvent(e, id);
}
const claim = (text = 'العقل يستقلّ بإثبات وجود الصانع') => ({ type: 'node.add', node: { id: '', parentId: null, move: 'claim', text } });
const join = (id: Identity, name = 'أحمد') => ({ type: 'person.join', name, pub: id.pub });

describe('encoding and encryption', () => {
  it('b64url round-trips', () => { const b = randomBytes(1000); expect(fromB64url(b64url(b))).toEqual(b); });
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
  it('decompression is capped (S7)', async () => {
    const bomb = await deflate(new Uint8Array(5 * 1024 * 1024));
    await expect(inflate(bomb, 1024 * 1024)).rejects.toThrow('payload_too_large');
  });
});

describe('signatures, identity binding, content addressing', () => {
  it('signed events verify; tampering fails', async () => {
    const id = await newIdentity();
    const e = await mk(id, claim());
    expect(await verifyEvent(e, id.pub)).toBe(true);
    expect(await verifyEvent({ ...e, node: { ...(e as any).node, text: 'تحريف' } } as DebateEvent, id.pub)).toBe(false);
  });
  it('rejects impersonation: a different key cannot claim an existing personId', async () => {
    const ahmad = await newIdentity(), mallory = await newIdentity();
    const j = await mk(ahmad, join(ahmad));
    const forgedJoin = await signEvent({ ...(await mk(mallory, join(mallory))), authorId: ahmad.personId } as DebateEvent, mallory);
    const forgedNode = await signEvent({ ...(await mk(mallory, claim('مزوّر'))), authorId: ahmad.personId } as DebateEvent, mallory);
    const real = await mk(ahmad, claim());
    const ok = await verifyBatch([forgedJoin, j, forgedNode, real], new Map());
    expect(ok.map((e) => e.id).sort()).toEqual([j.id, real.id].sort());
    expect(await personIdFromPub(ahmad.pub)).toBe(ahmad.personId);
  });
  it('rejects squatted ids: an event whose id is not the hash of its content (S4)', async () => {
    const a = await newIdentity();
    const j = await mk(a, join(a));
    const good = await mk(a, claim());
    const squat = await signEvent({ ...(await mk(a, claim('آخر'))), id: good.id, node: { id: good.id, parentId: null, move: 'claim', text: 'آخر' } } as DebateEvent, a);
    const ok = await verifyBatch([j, squat, good], new Map());
    expect(ok.map((e) => e.id).sort()).toEqual([j.id, good.id].sort());
  });
  it('debate.create is bound to its creator (S5)', async () => {
    const a = await newIdentity(), m = await newIdentity();
    const salt = randomId();
    const debateId = await debateIdFor(a.personId, salt);
    const real = await mk(a, { type: 'debate.create', title: 't', lang: 'ar', salt }, debateId);
    const fake = await mk(m, { type: 'debate.create', title: 'مختطف', lang: 'ar', salt }, debateId);
    const ok = await verifyBatch([await mk(a, join(a), debateId), await mk(m, join(m), debateId), real, fake], new Map());
    expect(ok.some((e) => e.id === real.id)).toBe(true);
    expect(ok.some((e) => e.id === fake.id)).toBe(false);
  });
  it('malformed but signed events are dropped, never thrown (S2, S6)', async () => {
    const a = await newIdentity();
    const j = await mk(a, join(a));
    const badName = await signEvent({ ...j, name: 123 } as any, a);
    const badPub = await signEvent({ ...(await mk(a, join(a))), pub: '!!!' } as any, a);
    const huge = await mk(a, claim('x'.repeat(6000)));
    const ok = await verifyBatch([badName, badPub, huge, j, null as any, 'x' as any], new Map());
    expect(ok.map((e) => e.id)).toEqual([j.id]);
  });
});

describe('links', () => {
  it('join link round-trips with snapshot; update link carries no key', async () => {
    const secret = randomBytes(32);
    const a = await newIdentity();
    const { url, includesSnapshot } = await makeJoinLink(DEBATE, secret, [await mk(a, claim())]);
    expect(includesSnapshot).toBe(true);
    const p = parseLink(`رابط المناظرة: ${url} شكراً`)!;
    if (p.kind !== 'join') throw new Error('kind');
    expect(p.secret).toEqual(secret);
    const { encKey } = await deriveRoomKeys(secret);
    expect((await openPayload<DebateEvent[]>(encKey, p.snapshot!))[0]!.type).toBe('node.add');
    const u = updateLink(DEBATE, await makeUpdatePayload(encKey, []))!;
    expect(u).not.toContain(b64url(secret));
    expect(parseLink(u)!.kind).toBe('update');
  });
  it('rejects malformed links', () => {
    expect(parseLink('https://x/#/j/short.abc')).toBeNull();
    expect(parseLink('hello')).toBeNull();
    expect(parseLink(`#/j/${DEBATE}.` + b64url(randomBytes(31)))).toBeNull();
  });
  it('backup text round-trips', async () => {
    const { encKey } = await deriveRoomKeys(randomBytes(32));
    const txt = await makeBackupText(DEBATE, 'عنوان', encKey, []);
    const parsed = parseBackupText(txt)!;
    expect(parsed.debateId).toBe(DEBATE);
    expect((await openPayload<{ events: DebateEvent[] }>(encKey, parsed.payload)).events).toEqual([]);
  });
});

describe('IndexedDB store', () => {
  it('stores debates and dedupes events', async () => {
    await putDebate({ id: DEBATE, title: 't', secret: 's', syncMode: 'manual', createdAt: 1, updatedAt: 1, lastSeenAt: 1, prevSeenAt: 1 });
    expect((await listDebates()).length).toBe(1);
    const e = await mk(await newIdentity(), claim());
    expect((await addEvents([e, e])).length).toBe(1);
    expect((await addEvents([e])).length).toBe(0);
    expect((await getEvents(DEBATE)).length).toBe(1);
  });
});
