// Pure derivation: events → debate state (PRD §3.4). Deterministic: the same event SET gives
// the same state on every device, whatever the arrival order.
import { isValidChild, type ParentView } from './rules';
import { isWellFormedEvent } from './validate';
import {
  ANSWERS, ASSERTIONS, CHALLENGES,
  type AssertionInfo, type ChallengeInfo, type DNode, type DebateEvent, type DebateState,
  type Move, type Obligation, type Person,
} from './types';

export const cmp = (a: { at: number; id: string }, b: { at: number; id: string }) =>
  a.at - b.at || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

type AddEvent = Extract<DebateEvent, { type: 'node.add' }>;

export function derive(debateId: string, events: Iterable<DebateEvent>): DebateState {
  // malformed events are skipped, never thrown on (security review S2)
  const evs = [...events].filter((e) => isWellFormedEvent(e, false) && e.debateId === debateId).sort(cmp);
  const state: DebateState = {
    id: debateId, title: '', createdBy: null, lang: 'ar',
    people: new Map(), nodes: new Map(), roots: [],
    challenges: new Map(), assertions: new Map(), dead: new Set(),
    obligations: new Map(), ignored: 0,
  };

  // 1. debate + people ------------------------------------------------------------
  let titleAt = -Infinity;
  for (const e of evs) {
    if (e.type === 'debate.create' && state.createdBy === null) {
      state.createdBy = e.authorId; state.title = e.title; state.lang = e.lang; titleAt = e.at;
    } else if (e.type === 'person.join') {
      if (state.people.has(e.authorId)) { state.ignored++; continue; }
      const raw = e.name.trim().slice(0, 40) || '?';
      state.people.set(e.authorId, {
        id: e.authorId, rawName: raw, name: raw, pub: e.pub,
        joinedAt: e.at, joinOrder: state.people.size, questionerOnly: !!e.questionerOnly, active: false,
      });
    }
  }
  for (const e of evs) {
    if (e.type === 'debate.retitle' && e.authorId === state.createdBy && e.at >= titleAt) { state.title = e.title; titleAt = e.at; }
    if (e.type === 'person.rename') {
      const p = state.people.get(e.authorId);
      if (p) { p.rawName = e.name.trim().slice(0, 40) || p.rawName; p.name = p.rawName; }
    }
  }
  disambiguateNames(state.people);

  // 2. nodes, validated parent-first ------------------------------------------------
  const adds = new Map<string, AddEvent>();
  for (const e of evs) {
    if (e.type !== 'node.add') continue;
    if (adds.has(e.node.id) || !state.people.has(e.authorId)) { state.ignored++; continue; }
    adds.set(e.node.id, e);
  }
  const byParent = new Map<string | null, AddEvent[]>();
  for (const e of adds.values()) {
    const k = e.node.parentId;
    if (k !== null && !adds.has(k)) { state.ignored++; continue; } // orphan (parent not known yet)
    (byParent.get(k) ?? byParent.set(k, []).get(k)!).push(e);
  }
  const exists = (id: string) => adds.has(id);
  const parentView = (n: DNode): ParentView => ({
    id: n.id, authorId: n.authorId, originalMove: n.originalMove, meta: n.meta,
    targetAuthorId: n.parentId ? state.nodes.get(n.parentId)?.authorId : undefined,
  });
  const queue: Array<{ e: AddEvent; depth: number }> = (byParent.get(null) ?? []).sort(cmp).map((e) => ({ e, depth: 0 }));
  while (queue.length) {
    const { e, depth } = queue.shift()!;
    const parent = e.node.parentId ? state.nodes.get(e.node.parentId) : undefined;
    if (e.node.parentId && !parent) { state.ignored++; continue; }
    const pv = parent ? parentView(parent) : null;
    if (!isValidChild(pv, e.authorId, e.node.move, e.node.meta, e.node.text, exists)) { state.ignored++; continue; }
    const node: DNode = {
      id: e.node.id, parentId: e.node.parentId, authorId: e.authorId,
      move: e.node.move, originalMove: e.node.move, text: e.node.text,
      versions: [{ text: e.node.text, at: e.at }], meta: { ...(e.node.meta ?? {}) },
      at: e.at, editedAfterReply: false, children: [], depth,
    };
    state.nodes.set(node.id, node);
    if (parent) parent.children.push(node.id); else state.roots.push(node.id);
    state.people.get(e.authorId)!.active = true;
    for (const c of (byParent.get(node.id) ?? []).sort(cmp)) queue.push({ e: c, depth: depth + 1 });
  }
  for (const n of state.nodes.values()) n.children.sort((a, b) => cmp(state.nodes.get(a)!, state.nodes.get(b)!));

  // 3. edits and retypes (author's own events only; LWW by (at,id)) -------------------
  for (const e of evs) {
    if (e.type === 'node.edit') {
      const n = state.nodes.get(e.nodeId);
      if (!n || n.authorId !== e.authorId || e.text.trim() === '' || e.text.length > 5000) { state.ignored++; continue; }
      n.versions.push({ text: e.text, at: e.at });
      n.text = e.text;
      if (n.children.some((c) => { const ch = state.nodes.get(c)!; return ch.authorId !== n.authorId && ch.at < e.at; })) n.editedAfterReply = true;
    } else if (e.type === 'node.retype') {
      const n = state.nodes.get(e.nodeId);
      if (!n || n.authorId !== e.authorId) { state.ignored++; continue; }
      const repliedByOthers = n.children.some((c) => state.nodes.get(c)!.authorId !== n.authorId);
      const parent = n.parentId ? state.nodes.get(n.parentId)! : null;
      const ok = !repliedByOthers && isValidChild(parent ? parentView(parent) : null, n.authorId, e.move, e.meta ?? n.meta, n.text, exists);
      if (!ok) { state.ignored++; continue; }
      n.move = e.move; if (e.meta) n.meta = { ...e.meta };
    }
  }

  computeStatuses(state);
  return state;
}

/** People sharing a display name are ALL marked with a short key fingerprint, so nobody gains the
 *  plain name by joining first or backdating (security review S5). */
function disambiguateNames(people: Map<string, Person>) {
  const count = new Map<string, number>();
  for (const p of people.values()) count.set(p.rawName, (count.get(p.rawName) ?? 0) + 1);
  for (const p of people.values()) p.name = (count.get(p.rawName) ?? 0) > 1 ? `${p.rawName} ·${p.id.slice(0, 4)}` : p.rawName;
}

// ---------------------------------------------------------------------------------
function computeStatuses(s: DebateState) {
  const N = (id: string) => s.nodes.get(id)!;
  const kids = (n: DNode) => n.children.map(N);

  // withdrawn: the node's author has a live `withdraw` child under it (withdraws can be undone).
  const wMemo = new Map<string, boolean>();
  const isWithdrawn = (n: DNode): boolean => {
    const c = wMemo.get(n.id); if (c !== undefined) return c;
    wMemo.set(n.id, false); // tree, so no cycles; placeholder for safety
    const r = kids(n).some((k) => k.move === 'withdraw' && k.authorId === n.authorId && !isWithdrawn(k));
    wMemo.set(n.id, r); return r;
  };
  const live = (n: DNode) => !isWithdrawn(n);

  // conceded by its author: under a challenge/counter on N, N's author posted a live `concede`.
  const concededByAuthor = (n: DNode): boolean =>
    kids(n).some((c) => (CHALLENGES.has(c.move) || c.move === 'counter')
      && kids(c).some((k) => k.move === 'concede' && k.authorId === n.authorId && live(k)));

  // dead assertions: withdrawn, conceded by author, or a dead assertion ancestor.
  const deadMemo = new Map<string, boolean>();
  const isDeadAssertionChain = (n: DNode): boolean => {
    const c = deadMemo.get(n.id); if (c !== undefined) return c;
    let r = false;
    if (ASSERTIONS.has(n.move) && (isWithdrawn(n) || concededByAuthor(n))) r = true;
    else if (n.parentId) r = isDeadAssertionChain(N(n.parentId));
    deadMemo.set(n.id, r); return r;
  };
  for (const n of s.nodes.values()) {
    if (ASSERTIONS.has(n.move) ? isDeadAssertionChain(n) : (isWithdrawn(n) || (n.parentId ? isDeadAssertionChain(N(n.parentId)) : false))) s.dead.add(n.id);
  }
  const deadAssertion = (n: DNode) => ASSERTIONS.has(n.move) && isDeadAssertionChain(n);

  const subtreeHasSubstantiveBy = (root: DNode, personId: string, after: number): boolean => {
    const stack = [...kids(root)];
    while (stack.length) {
      const k = stack.pop()!;
      if (k.authorId === personId && k.move !== 'note' && k.at > after) return true;
      stack.push(...kids(k));
    }
    return false;
  };
  const latestBy = (arr: DNode[]) => arr.reduce<DNode | undefined>((m, x) => (!m || cmp(x, m) > 0 ? x : m), undefined);

  // challenges ----------------------------------------------------------------------
  for (const c of s.nodes.values()) {
    if (!c.parentId) continue;
    const t = N(c.parentId);
    const X = c.authorId, Y = t.authorId;
    if (c.move === 'counter') {
      // counter K: an assertion by X that also challenges T.
      let info: ChallengeInfo;
      if (kids(c).some((k) => k.authorId === Y && k.move === 'concede' && live(k))) info = { state: 'conceded', challenger: X, targetAuthor: Y, targetId: t.id };
      else if (isWithdrawn(c) || deadAssertion(t) || deadAssertion(c)) info = { state: 'moot', challenger: X, targetAuthor: Y, targetId: t.id };
      else if (kids(c).some((k) => k.authorId === Y && (CHALLENGES.has(k.move) || k.move === 'counter') && live(k))) info = { state: 'challenged', challenger: X, targetAuthor: Y, targetId: t.id };
      else info = { state: 'open', challenger: X, targetAuthor: Y, targetId: t.id, owes: Y };
      s.challenges.set(c.id, info);
      continue;
    }
    if (!CHALLENGES.has(c.move)) continue;
    const base = { challenger: X, targetAuthor: Y, targetId: t.id };
    const ck = kids(c);
    // a concession by Y is reported as such even though it also makes T dead
    if (ck.some((k) => k.authorId === Y && k.move === 'concede' && live(k))) { s.challenges.set(c.id, { state: 'conceded', ...base }); continue; }
    if (isWithdrawn(c) || deadAssertion(t)) { s.challenges.set(c.id, { state: 'moot', ...base }); continue; }
    const adX = latestBy(ck.filter((k) => k.authorId === X && k.move === 'agree_disagree' && live(k)));
    const adY = latestBy(ck.filter((k) => k.authorId === Y && k.move === 'agree_disagree' && live(k)));
    if (adX && adY) { s.challenges.set(c.id, { state: 'agreed', ...base }); continue; }
    const prop = adX ?? adY;
    if (prop) {
      const other = prop === adX ? Y : X;
      if (!subtreeHasSubstantiveBy(c, other, prop.at)) { s.challenges.set(c.id, { state: 'proposal', ...base, yourMove: other }); continue; }
    }
    const answers = ck.filter((k) => k.authorId === Y && ANSWERS.has(k.move) && !deadAssertion(k));
    const latest = latestBy(answers);
    if (!latest) { s.challenges.set(c.id, { state: 'open', ...base, owes: Y }); continue; }
    const reaction = latestBy(kids(latest).filter((k) => k.authorId === X && live(k) && (k.move === 'concede' || CHALLENGES.has(k.move) || k.move === 'counter')));
    if (reaction?.move === 'concede') s.challenges.set(c.id, { state: 'accepted', ...base, latestAnswerId: latest.id });
    else if (reaction) s.challenges.set(c.id, { state: 'challenged', ...base, latestAnswerId: latest.id });
    else s.challenges.set(c.id, { state: 'answered', ...base, yourMove: X, latestAnswerId: latest.id });
  }

  // assertions ----------------------------------------------------------------------
  const activeOthers = (authorId: string) => [...s.people.values()].filter((p) => p.active && p.id !== authorId).map((p) => p.id);
  for (const n of s.nodes.values()) {
    if (!ASSERTIONS.has(n.move)) continue;
    let info: AssertionInfo;
    if (isWithdrawn(n)) info = { status: 'withdrawn', awaiting: [] };
    else if (concededByAuthor(n)) info = { status: 'conceded_by_author', awaiting: [] };
    else {
      const openCh = kids(n).map((k) => s.challenges.get(k.id)).filter((ci): ci is ChallengeInfo => !!ci && ['open', 'answered', 'proposal', 'challenged'].includes(ci.state));
      if (openCh.length) {
        const awaiting = [...new Set(openCh.map((ci) => ci.owes ?? ci.yourMove).filter((x): x is string => !!x))];
        info = { status: 'under_discussion', awaiting };
      } else {
        const others = activeOthers(n.authorId);
        const accepted = others.length > 0 && others.every((o) => kids(n).some((k) => k.authorId === o && k.move === 'concede' && live(k)));
        info = { status: accepted ? 'accepted' : 'standing', awaiting: [] };
      }
    }
    s.assertions.set(n.id, info);
  }

  // obligations ---------------------------------------------------------------------
  for (const p of s.people.values()) s.obligations.set(p.id, { owes: [], yourMove: [] });
  const owesSets = new Map<string, Set<string>>();
  for (const [cid, ci] of s.challenges) {
    if (ci.state === 'open' && ci.owes) {
      const set = owesSets.get(ci.owes) ?? owesSets.set(ci.owes, new Set()).get(ci.owes)!;
      set.add(ci.targetId);
    }
    if ((ci.state === 'answered' || ci.state === 'proposal') && ci.yourMove) s.obligations.get(ci.yourMove)?.yourMove.push(cid);
  }
  for (const [pid, set] of owesSets) {
    const o = s.obligations.get(pid); if (o) o.owes = [...set];
  }
  for (const o of s.obligations.values()) {
    const byAt = (a: string, b: string) => cmp(N(a), N(b));
    o.owes.sort(byAt); o.yourMove.sort(byAt);
  }
}

/** Open challenge/counter ids on target T (used by UI to jump to "what is owed here"). */
export function openChallengesOn(s: DebateState, targetId: string): string[] {
  const t = s.nodes.get(targetId); if (!t) return [];
  return t.children.filter((c) => s.challenges.get(c)?.state === 'open');
}

export function obligationOf(s: DebateState, personId: string): Obligation {
  return s.obligations.get(personId) ?? { owes: [], yourMove: [] };
}

export function pathTo(s: DebateState, id: string): string[] {
  const out: string[] = [];
  let cur = s.nodes.get(id);
  while (cur) { out.unshift(cur.id); cur = cur.parentId ? s.nodes.get(cur.parentId) : undefined; }
  return out;
}

export type { Move };
