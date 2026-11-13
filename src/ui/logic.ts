// UI-facing derivations: labels, tones, composer options (PRD §3.5), subtree counters.
import { type StringKey, t } from '../i18n';
import { allowedMoves, type ParentView } from '../model/rules';
import { ANSWERS, ASSERTIONS, CHALLENGES, type DNode, type DebateState, type Move, type NodeMeta } from '../model/types';

export type Tone = 'owe' | 'move' | 'open' | 'closed' | 'accepted' | 'neutral' | 'gone';

export function personName(s: DebateState, id: string | undefined, me: string | null): string {
  if (!id) return '?';
  const p = s.people.get(id);
  const n = p?.name ?? '?';
  return id === me ? `${n} (${t('common.you')})` : n;
}

export interface Chip { tone: Tone; text: string }

/** Status chip for a node, or null when nothing useful to say. */
export function nodeChip(s: DebateState, n: DNode, me: string | null): Chip | null {
  const ch = s.challenges.get(n.id);
  if (ch) {
    const name = personName(s, ch.owes ?? ch.yourMove, me);
    switch (ch.state) {
      case 'open': return { tone: ch.owes === me ? 'owe' : 'open', text: t('ch.open', { name }) };
      case 'answered': return { tone: ch.yourMove === me ? 'move' : 'open', text: t('ch.answered', { name }) };
      case 'proposal': return { tone: ch.yourMove === me ? 'move' : 'open', text: t('ch.proposal', { name }) };
      case 'challenged': return { tone: 'open', text: t('ch.challenged') };
      case 'accepted': return { tone: 'accepted', text: t('ch.accepted') };
      case 'conceded': return { tone: 'closed', text: t('ch.conceded') };
      case 'agreed': return { tone: 'closed', text: t('ch.agreed') };
      case 'moot': return { tone: 'gone', text: t('ch.moot') };
    }
  }
  const a = s.assertions.get(n.id);
  if (a) {
    switch (a.status) {
      case 'withdrawn': return { tone: 'gone', text: t('status.withdrawn') };
      case 'conceded_by_author': return { tone: 'gone', text: t('status.conceded_by_author') };
      case 'accepted': return { tone: 'accepted', text: t('status.accepted') };
      case 'standing': return { tone: 'neutral', text: t('status.standing') };
      case 'under_discussion': {
        const mine = me && a.awaiting.includes(me);
        return { tone: mine ? 'owe' : 'open', text: t('status.under_discussion') };
      }
    }
  }
  if (s.dead.has(n.id) && (n.move === 'concede' || n.move === 'agree_disagree' || n.move === 'withdraw')) return { tone: 'gone', text: t('stance.withdrawn') };
  return null;
}

export const moveLabel = (m: Move) => t(`move.${m}` as StringKey);

export function isClosedNode(s: DebateState, n: DNode): boolean {
  const ch = s.challenges.get(n.id);
  if (ch) return ['accepted', 'conceded', 'agreed', 'moot'].includes(ch.state);
  const a = s.assertions.get(n.id);
  if (a) return a.status === 'withdrawn' || a.status === 'conceded_by_author';
  return s.dead.has(n.id);
}

// ---- subtree counters (memoised per state object) --------------------------------------------
export interface Counters { open: Map<string, number>; mine: Map<string, number> }
const memo = new WeakMap<DebateState, Map<string | null, Counters>>();

export function counters(s: DebateState, me: string | null): Counters {
  let byMe = memo.get(s); if (!byMe) { byMe = new Map(); memo.set(s, byMe); }
  const hit = byMe.get(me); if (hit) return hit;
  const open = new Map<string, number>(), mine = new Map<string, number>();
  const visit = (id: string): [number, number] => {
    const n = s.nodes.get(id)!;
    const ch = s.challenges.get(id);
    let o = ch && ['open', 'answered', 'proposal'].includes(ch.state) ? 1 : 0;
    let m = ch && ((ch.state === 'open' && ch.owes === me) || ((ch.state === 'answered' || ch.state === 'proposal') && ch.yourMove === me)) ? 1 : 0;
    for (const c of n.children) { const [co, cm] = visit(c); o += co; m += cm; }
    open.set(id, o); mine.set(id, m);
    return [o, m];
  };
  for (const r of s.roots) visit(r);
  const res = { open, mine };
  byMe.set(me, res);
  return res;
}

// ---- composer options (PRD §3.5) ---------------------------------------------------------------
export interface Action { move: Move; label: StringKey; parentId: string | null; meta?: NodeMeta }
export interface ComposerOptions { primary: Action | null; chips: Action[]; more: Action[] }

export function parentView(s: DebateState, n: DNode): ParentView {
  return { id: n.id, authorId: n.authorId, originalMove: n.originalMove, meta: n.meta, targetAuthorId: n.parentId ? s.nodes.get(n.parentId)?.authorId : undefined };
}

export function composerOptions(s: DebateState, target: DNode | null, me: string): ComposerOptions {
  if (!target) return { primary: { move: 'claim', label: 'act.claim', parentId: null }, chips: [], more: [] };
  const allowed = new Set(allowedMoves(parentView(s, target), me));
  const A = (move: Move, label: StringKey, parentId: string | null = target.id): Action => ({ move, label, parentId });
  const keep = (xs: Action[]) => xs.filter((a) => a.parentId === target.id ? allowed.has(a.move) : true);
  const isMine = target.authorId === me;
  const parent = target.parentId ? s.nodes.get(target.parentId) : undefined;

  // a challenge node
  if (CHALLENGES.has(target.originalMove)) {
    const ch = s.challenges.get(target.id);
    const adLabel: StringKey = ch?.state === 'proposal' && ch.yourMove === me ? 'act.agree_disagree.accept' : 'act.agree_disagree.propose';
    if (parent && parent.authorId === me) {
      const primary = ch?.state === 'proposal' && ch.yourMove === me ? A('agree_disagree', adLabel) : A('reason', 'act.reason.answer');
      return {
        primary,
        chips: keep([A('clarify', 'act.clarify'), A('see_also', 'act.see_also'), A('concede', 'act.concede.challenge')]),
        more: keep([A('source', 'act.source'), A('obvious', 'act.obvious'), ...(primary.move === 'agree_disagree' ? [A('reason', 'act.reason.answer')] : [A('agree_disagree', adLabel)]), A('note', 'act.note')]),
      };
    }
    if (isMine) {
      const primary = ch?.state === 'proposal' && ch.yourMove === me ? A('agree_disagree', adLabel) : null;
      return { primary, chips: keep([A('withdraw', 'act.withdraw.challenge'), ...(primary ? [] : [A('agree_disagree', adLabel)]), A('note', 'act.note')]), more: [] };
    }
    return { primary: A('note', 'act.note'), chips: [], more: [] };
  }

  // stances and notes
  if (target.move === 'concede' || target.move === 'withdraw' || target.move === 'agree_disagree' || target.move === 'note') {
    return { primary: null, chips: keep([A('withdraw', 'act.withdraw.stance'), A('note', 'act.note')]), more: [] };
  }

  // assertions (incl. answers and counters)
  if (isMine) {
    return { primary: A('reason', 'act.reason.own'), chips: keep([A('define', 'act.define'), A('note', 'act.note'), A('withdraw', 'act.withdraw.own')]), more: [] };
  }
  const isAnswerToMyChallenge = !!parent && CHALLENGES.has(parent.originalMove) && parent.authorId === me && ANSWERS.has(target.originalMove);
  const concedeLabel: StringKey = isAnswerToMyChallenge ? 'act.concede.answer' : target.originalMove === 'define' ? 'act.concede.define' : 'act.concede.assertion';
  const more: Action[] = [A('refute', 'act.refute'), A('counter', 'act.counter'), A('ask_source', 'act.ask_source'), A('define', 'act.define'), A('note', 'act.note')];
  if (isAnswerToMyChallenge && parent) {
    const pch = s.challenges.get(parent.id);
    const adLabel: StringKey = pch?.state === 'proposal' && pch.yourMove === me ? 'act.agree_disagree.accept' : 'act.agree_disagree.propose';
    more.splice(2, 0, A('agree_disagree', adLabel, parent.id));
  }
  return {
    primary: A('object', 'act.object'),
    chips: keep([A('concede', concedeLabel), A('ask_proof', 'act.ask_proof'), A('clarify_q', 'act.clarify_q')]),
    more: keep(more),
  };
}

export const NEEDS_TEXT = (m: Move) => m !== 'concede' && m !== 'withdraw' && m !== 'agree_disagree';
export const CITABLE = (m: Move) => m === 'claim' || m === 'reason' || m === 'counter';

/** Groups for the focus view. */
export function groupOf(n: DNode, parent?: DNode): 'assert' | 'challenge' | 'answer' | 'stance' {
  if (CHALLENGES.has(n.move) || n.move === 'counter') return 'challenge';
  if (parent && CHALLENGES.has(parent.originalMove) && ANSWERS.has(n.move)) return 'answer';
  if (n.move === 'reason' || n.move === 'define') return 'assert';
  if (ASSERTIONS.has(n.move)) return 'answer';
  return 'stance';
}
