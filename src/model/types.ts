// Core data types. See docs/design/PRD.md §3 and docs/design/ARCHITECTURE.md §2.

export const MOVES = [
  'claim', 'reason', 'counter', 'define',
  'clarify_q', 'ask_proof', 'object', 'refute', 'ask_source',
  'clarify', 'source', 'see_also', 'obvious',
  'concede', 'withdraw', 'agree_disagree', 'note',
] as const;
export type Move = (typeof MOVES)[number];

/** Moves that put a proposition on the table. */
export const ASSERTIONS: ReadonlySet<Move> = new Set(['claim', 'reason', 'counter', 'define', 'clarify', 'source', 'see_also', 'obvious']);
/** Challenge moves (create a burden on the target's author). `counter` is handled separately. */
export const CHALLENGES: ReadonlySet<Move> = new Set(['clarify_q', 'ask_proof', 'object', 'refute', 'ask_source']);
/** Moves that answer a challenge (by the target's author). */
export const ANSWERS: ReadonlySet<Move> = new Set(['reason', 'clarify', 'source', 'see_also', 'obvious']);
/** Stances record a participant's position; they can be undone with `withdraw`. */
export const STANCES: ReadonlySet<Move> = new Set(['concede', 'withdraw', 'agree_disagree']);

export type Witness = 'counterexample' | 'impossibility';

export interface NodeMeta {
  witness?: Witness;          // required for `refute`
  origin?: 'citation';        // quoted text the author does not personally commit to
  ref?: string;               // `see_also` target node id
}

interface EventBase {
  id: string;
  debateId: string;
  authorId: string;
  at: number;
  v: 1;
  sig?: string; // present on stored/transmitted events; verified on ingest
}

export type DebateEvent =
  | (EventBase & { type: 'debate.create'; title: string; lang: 'ar' | 'en' })
  | (EventBase & { type: 'person.join'; name: string; pub: string; questionerOnly?: boolean })
  | (EventBase & { type: 'person.rename'; name: string })
  | (EventBase & { type: 'node.add'; node: { id: string; parentId: string | null; move: Move; text: string; meta?: NodeMeta } })
  | (EventBase & { type: 'node.edit'; nodeId: string; text: string })
  | (EventBase & { type: 'node.retype'; nodeId: string; move: Move; meta?: NodeMeta })
  | (EventBase & { type: 'debate.retitle'; title: string });

export type EventType = DebateEvent['type'];

export interface Person {
  id: string;
  name: string;          // display name, disambiguated
  rawName: string;
  pub: string;
  joinedAt: number;
  joinOrder: number;
  questionerOnly: boolean;
  active: boolean;       // authored ≥ 1 node
}

export interface TextVersion { text: string; at: number }

export interface DNode {
  id: string;
  parentId: string | null;
  authorId: string;
  move: Move;             // current (after a valid retype)
  originalMove: Move;
  text: string;
  versions: TextVersion[]; // oldest first; last = current
  meta: NodeMeta;
  at: number;
  editedAfterReply: boolean;
  children: string[];     // ordered by (at, id)
  depth: number;
}

export type ChallengeState =
  | 'moot' | 'conceded' | 'agreed' | 'proposal' | 'open' | 'accepted' | 'challenged' | 'answered';

export type AssertionStatus = 'withdrawn' | 'conceded_by_author' | 'under_discussion' | 'accepted' | 'standing';

export interface ChallengeInfo {
  state: ChallengeState;
  challenger: string;     // X
  targetAuthor: string;   // Y
  targetId: string;
  /** Who must act next, and how. */
  owes?: string;          // Y owes a reply (state open)
  yourMove?: string;      // X (answered) or the non-proposer (proposal)
  latestAnswerId?: string;
}

export interface AssertionInfo {
  status: AssertionStatus;
  /** People whose action is awaited within open challenges on this node (for sub-labels). */
  awaiting: string[];
}

export interface Obligation {
  owes: string[];       // target node ids authored by the person with ≥1 open challenge
  yourMove: string[];   // challenge node ids where it is the person's move
}

export interface DebateState {
  id: string;
  title: string;
  createdBy: string | null;
  lang: 'ar' | 'en';
  people: Map<string, Person>;
  nodes: Map<string, DNode>;
  roots: string[];
  challenges: Map<string, ChallengeInfo>;   // keyed by challenge/counter node id
  assertions: Map<string, AssertionInfo>;   // keyed by assertion node id
  dead: Set<string>;                         // dead assertions and withdrawn stances/challenges
  obligations: Map<string, Obligation>;
  ignored: number;                           // invalid events ignored (diagnostics)
}
