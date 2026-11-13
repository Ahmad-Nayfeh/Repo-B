// The single validity matrix (PRD §3.3). Pure; depends only on the parent's ORIGINAL move,
// authorship and meta, so validity never changes after a node is accepted (review D2).
import { CHALLENGES, type Move, type NodeMeta } from './types';

export interface ParentView {
  id: string;
  authorId: string;
  originalMove: Move;
  meta: NodeMeta;
  /** For a challenge parent: the author of the node it targets (Y). */
  targetAuthorId?: string;
}

const ASSERTION_ROW: ReadonlySet<Move> = new Set(['claim', 'reason', 'define', 'clarify', 'source', 'obvious']);

/** Moves `actorId` may add as a reply to `parent` (null = a root standpoint). */
export function allowedMoves(parent: ParentView | null, actorId: string): Move[] {
  if (!parent) return ['claim'];
  const isAuthor = parent.authorId === actorId;
  const m = parent.originalMove;

  if (ASSERTION_ROW.has(m)) {
    if (isAuthor) return ['reason', 'define', 'note', 'withdraw'];
    const out: Move[] = ['object', 'ask_proof', 'clarify_q'];
    if (m === 'reason') out.push('refute');
    if (m === 'claim') out.push('counter');
    if (parent.meta.origin === 'citation') out.push('ask_source');
    out.push('concede', 'define', 'note');
    return out;
  }
  if (m === 'counter') {
    if (isAuthor) return ['reason', 'define', 'note', 'withdraw'];
    return ['object', 'ask_proof', 'clarify_q', 'refute', 'counter', 'concede', 'define', 'note'];
  }
  if (m === 'see_also') {
    if (isAuthor) return ['note', 'withdraw'];
    return ['object', 'ask_proof', 'clarify_q', 'concede', 'note'];
  }
  if (CHALLENGES.has(m)) {
    // parent is challenge C by X (= parent.authorId) on a node by Y (= targetAuthorId)
    if (actorId === parent.targetAuthorId) {
      return ['reason', 'clarify', 'source', 'see_also', 'obvious', 'concede', 'agree_disagree', 'note'];
    }
    if (isAuthor) return ['withdraw', 'agree_disagree', 'note'];
    return ['note'];
  }
  // stances and notes
  if (isAuthor) return ['withdraw', 'note'];
  return ['note'];
}

/** Extra per-move requirements beyond the matrix. Returns an error key or null. */
export function moveRequirementError(move: Move, meta: NodeMeta | undefined, text: string, nodeExists: (id: string) => boolean): string | null {
  const needsText = move !== 'concede' && move !== 'withdraw' && move !== 'agree_disagree';
  // at least two letters or digits, so '.' cannot discharge an obligation (QA review Q3)
  if (needsText && (text.match(/[\p{L}\p{N}]/gu)?.length ?? 0) < 2) return 'empty_text';
  if (text.length > 5000) return 'too_long';
  if (move === 'refute' && meta?.witness !== 'counterexample' && meta?.witness !== 'impossibility') return 'refute_needs_witness';
  if (move === 'see_also' && (!meta?.ref || !nodeExists(meta.ref))) return 'see_also_needs_ref';
  return null;
}

export function isValidChild(parent: ParentView | null, actorId: string, move: Move, meta: NodeMeta | undefined, text: string, nodeExists: (id: string) => boolean): boolean {
  if (!allowedMoves(parent, actorId).includes(move)) return false;
  return moveRequirementError(move, meta, text, nodeExists) === null;
}
