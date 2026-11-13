import { describe, expect, it } from 'vitest';
import { allowedMoves } from '../../src/model/rules';

const P = (o: Partial<Parameters<typeof allowedMoves>[0] & object> & { originalMove: any }) =>
  ({ id: 'p', authorId: 'A', meta: {}, ...o });

describe('validity matrix (PRD §3.3)', () => {
  it('root accepts only claims', () => expect(allowedMoves(null, 'A')).toEqual(['claim']));
  it('others challenge a claim; author supports it', () => {
    const c = P({ originalMove: 'claim' });
    expect(allowedMoves(c, 'B')).toEqual(expect.arrayContaining(['object', 'ask_proof', 'clarify_q', 'counter', 'concede']));
    expect(allowedMoves(c, 'B')).not.toContain('refute');       // refute only on a reason
    expect(allowedMoves(c, 'B')).not.toContain('ask_source');   // only on citations
    expect(allowedMoves(c, 'A')).toEqual(['reason', 'define', 'note', 'withdraw']);
    expect(allowedMoves(c, 'A')).not.toContain('object');       // no self-challenge
  });
  it('refute only on a reason; ask_source only on citations', () => {
    expect(allowedMoves(P({ originalMove: 'reason' }), 'B')).toContain('refute');
    expect(allowedMoves(P({ originalMove: 'claim', meta: { origin: 'citation' } }), 'B')).toContain('ask_source');
  });
  it('only the target author answers a challenge; challenger may withdraw', () => {
    const ch = P({ originalMove: 'ask_proof', authorId: 'B', targetAuthorId: 'A' });
    expect(allowedMoves(ch, 'A')).toEqual(expect.arrayContaining(['reason', 'clarify', 'source', 'see_also', 'obvious', 'concede', 'agree_disagree']));
    expect(allowedMoves(ch, 'B')).toEqual(['withdraw', 'agree_disagree', 'note']);
    expect(allowedMoves(ch, 'C')).toEqual(['note']);
  });
  it('stances: only the author may undo', () => {
    expect(allowedMoves(P({ originalMove: 'concede', authorId: 'B' }), 'B')).toEqual(['withdraw', 'note']);
    expect(allowedMoves(P({ originalMove: 'concede', authorId: 'B' }), 'A')).toEqual(['note']);
  });
});
