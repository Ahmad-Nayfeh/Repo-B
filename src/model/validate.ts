// Strict shape validation for every event that enters the app from outside (security review S2, S6, S7).
// Pure and synchronous; async checks (signatures, content-addressed ids, creator binding) live in crypto.ts.
import { MOVES, type DebateEvent, type Move } from './types';

const ID_STRICT = /^[A-Za-z0-9_-]{16,64}$/;
const ID_LOOSE = /^[A-Za-z0-9_-]{1,64}$/;
const B64 = /^[A-Za-z0-9_-]{1,512}$/;
const MOVE_SET = new Set<string>(MOVES);
export const LIMITS = { text: 5000, name: 40, title: 200, eventsPerBatch: 20_000 } as const;

const str = (v: unknown, max: number, min = 0): v is string => typeof v === 'string' && v.length >= min && v.length <= max;
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const own = (o: Record<string, unknown>, k: string) => Object.prototype.hasOwnProperty.call(o, k);

/** True iff `v` is a well-formed DebateEvent (any extra or prototype keys are rejected). */
export function isWellFormedEvent(v: unknown, strict = true): v is DebateEvent {
  const ID = strict ? ID_STRICT : ID_LOOSE;
  if (!isObj(v) || Object.getPrototypeOf(v) !== Object.prototype) return false;
  if (!str(v.id, 64) || !ID.test(v.id)) return false;
  if (!str(v.debateId, 64) || !ID.test(v.debateId)) return false;
  if (!str(v.authorId, 64) || !ID.test(v.authorId)) return false;
  if (typeof v.at !== 'number' || !Number.isFinite(v.at) || v.at < 0 || v.at > 4e12) return false;
  if (v.v !== 1) return false;
  if (own(v, 'sig') && (!str(v.sig, 200) || !B64.test(v.sig))) return false;
  const allow = (keys: string[]) => Object.keys(v).every((k) => ['id', 'debateId', 'authorId', 'at', 'v', 'sig', 'type', ...keys].includes(k));
  switch (v.type) {
    case 'debate.create':
      return allow(['title', 'lang', 'salt']) && str(v.title, LIMITS.title) && (v.lang === 'ar' || v.lang === 'en') && (strict ? str(v.salt, 64, 8) && B64.test(v.salt as string) : (!own(v, 'salt') || str(v.salt, 64)));
    case 'debate.retitle':
      return allow(['title']) && str(v.title, LIMITS.title, 1);
    case 'person.join':
      return allow(['name', 'pub', 'questionerOnly']) && str(v.name, LIMITS.name, 1) && str(v.pub, 120, strict ? 80 : 1) && B64.test(v.pub as string)
        && (!own(v, 'questionerOnly') || typeof v.questionerOnly === 'boolean');
    case 'person.rename':
      return allow(['name']) && str(v.name, LIMITS.name, 1);
    case 'node.edit':
      return allow(['nodeId', 'text']) && str(v.nodeId, 64) && ID.test(v.nodeId as string) && str(v.text, LIMITS.text, 1);
    case 'node.retype':
      return allow(['nodeId', 'move', 'meta']) && str(v.nodeId, 64) && ID.test(v.nodeId as string) && MOVE_SET.has(v.move as string) && (!own(v, 'meta') || isMeta(v.meta, ID));
    case 'node.add': {
      if (!allow(['node']) || !isObj(v.node)) return false;
      const n = v.node;
      if (!Object.keys(n).every((k) => ['id', 'parentId', 'move', 'text', 'meta'].includes(k))) return false;
      return str(n.id, 64) && ID.test(n.id as string) && (!strict || n.id === v.id)
        && (n.parentId === null || (str(n.parentId, 64) && ID.test(n.parentId as string)))
        && MOVE_SET.has(n.move as string) && str(n.text, LIMITS.text)
        && (!own(n, 'meta') || n.meta === undefined || isMeta(n.meta, ID));
    }
    default:
      return false;
  }
}

function isMeta(m: unknown, ID: RegExp): boolean {
  if (!isObj(m)) return false;
  if (!Object.keys(m).every((k) => ['witness', 'origin', 'ref'].includes(k))) return false;
  if (own(m, 'witness') && m.witness !== 'counterexample' && m.witness !== 'impossibility') return false;
  if (own(m, 'origin') && m.origin !== 'citation') return false;
  if (own(m, 'ref') && !(str(m.ref, 64) && ID.test(m.ref as string))) return false;
  return true;
}

export const isMove = (m: unknown): m is Move => typeof m === 'string' && MOVE_SET.has(m);
