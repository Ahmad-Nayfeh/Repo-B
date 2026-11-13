// Generates a large, valid, signed debate (random walk over the validity matrix).
import { b64url, newIdentity, randomBytes, randomId, signEvent, type Identity } from '../../src/crypto/crypto';
import { allowedMoves } from '../../src/model/rules';
import type { DebateEvent, Move } from '../../src/model/types';

const SENTENCES = [
  'كل حادث لا بد له من محدِث، والعالم حادث.', 'ما الدليل على أن السلسلة لا تمتد إلى ما لا نهاية؟',
  'الترجيح بلا مرجِّح محال عقلاً.', 'هذا ينقلب عليك: فالمحدِث نفسه يحتاج إلى محدِث.',
  'أقصد بالعقل هنا القوة المدركة للضروريات، لا مجموع المعارف المكتسبة.', 'This premise assumes the principle of sufficient reason.',
  'التسلسل في العلل الفاعلة محال لأنه يلزم منه عدم وجود شيء الآن.', 'لا أسلّم أن الإمكان يستلزم الحاجة إلى علة خارجية.',
  'هذا نقل عن الغزالي في «تهافت الفلاسفة»، فما موضعه؟', 'التمييز بين الدعوى المعرفية والدعوى الوجودية مهم هنا.',
];
const W: Partial<Record<Move, number>> = { reason: 5, object: 5, ask_proof: 4, clarify_q: 2, clarify: 2, concede: 0.3, note: 1, refute: 1, counter: 1, define: 1, obvious: 1, agree_disagree: 1 };

export async function bigDebate(nodeCount: number, seed = 1) {
  let s = seed; const rnd = () => ((s = (s * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
  const debateId = randomId();
  const A = await newIdentity(), K = await newIdentity();
  const ids = [A, K];
  let at = Date.now() - nodeCount * 60_000;
  const events: DebateEvent[] = [];
  const push = async (e: any, who: Identity) => events.push(await signEvent({ ...e, id: randomId(), debateId, authorId: who.personId, at: at += 60_000, v: 1 }, who));
  await push({ type: 'debate.create', title: 'هل يستقلّ العقل بإثبات وجود الله؟', lang: 'ar' }, A);
  await push({ type: 'person.join', name: 'أحمد', pub: A.pub }, A);
  await push({ type: 'person.join', name: 'خالد', pub: K.pub }, K);
  const nodes: Array<{ id: string; parentId: string | null; authorId: string; move: Move; meta: any }> = [];
  const addNode = async (who: Identity, parentId: string | null, move: Move, meta?: any) => {
    const id = randomId();
    const text = move === 'concede' || move === 'agree_disagree' ? '' : SENTENCES[Math.floor(rnd() * SENTENCES.length)]!;
    await push({ type: 'node.add', node: { id, parentId, move, text, meta } }, who);
    nodes.push({ id, parentId, authorId: who.personId, move, meta: meta ?? {} });
  };
  await addNode(A, null, 'claim'); await addNode(K, null, 'claim');
  while (nodes.length < nodeCount) {
    const p = nodes[Math.floor(rnd() * nodes.length)]!;
    const who = ids[Math.floor(rnd() * 2)]!;
    const parent = nodes.find((n) => n.id === p.parentId);
    const allowed = allowedMoves({ id: p.id, authorId: p.authorId, originalMove: p.move, meta: p.meta, targetAuthorId: parent?.authorId }, who.personId)
      .filter((m) => m !== 'withdraw' && m !== 'ask_source' && m !== 'see_also' && W[m]);
    // keep the two standpoints alive: no concession on a challenge that targets a root claim
    if (parent && parent.parentId === null) allowed.splice(0, allowed.length, ...allowed.filter((m) => m !== 'concede'));
    if (!allowed.length) continue;
    const total = allowed.reduce((a, m) => a + (W[m] ?? 0), 0);
    let r = rnd() * total, pick = allowed[0]!;
    for (const m of allowed) { r -= W[m] ?? 0; if (r <= 0) { pick = m; break; } }
    await addNode(who, p.id, pick, pick === 'refute' ? { witness: 'counterexample' } : undefined);
  }
  const record = { id: debateId, title: 'هل يستقلّ العقل بإثبات وجود الله؟', secret: b64url(randomBytes(32)), identity: A, syncMode: 'manual',
    createdAt: at, updatedAt: at, lastSeenAt: at - 3600_000 * 24, prevSeenAt: at - 3600_000 * 48, bannerSeen: true };
  return { record, events };
}
