import { describe, expect, it } from 'vitest';
import { derive } from '../../src/model/derive';
import { B } from './builder';

const two = () => new B().join('A', 'أحمد').join('K', 'خالد');

describe('basic obligation flow', () => {
  it('ask_proof → A owes; answer → K your move; accept → closed', () => {
    const b = two().add('A', 'c1', null, 'claim').add('K', 'q1', 'c1', 'ask_proof');
    let s = b.state();
    expect(s.challenges.get('q1')!.state).toBe('open');
    expect(s.obligations.get('A')!.owes).toEqual(['c1']);
    expect(s.obligations.get('K')!.owes).toEqual([]);
    expect(s.assertions.get('c1')!.status).toBe('under_discussion');

    b.add('A', 'r1', 'q1', 'reason'); s = b.state();
    expect(s.challenges.get('q1')!.state).toBe('answered');
    expect(s.obligations.get('A')!.owes).toEqual([]);
    expect(s.obligations.get('K')!.yourMove).toEqual(['q1']);

    b.add('K', 'ok', 'r1', 'concede'); s = b.state();
    expect(s.challenges.get('q1')!.state).toBe('accepted');
    expect(s.obligations.get('K')!.yourMove).toEqual([]);
    expect(s.assertions.get('c1')!.status).toBe('standing');
  });

  it('challenging the answer moves the burden back, C itself carries none', () => {
    const s = two().add('A', 'c1', null, 'claim').add('K', 'q1', 'c1', 'ask_proof')
      .add('A', 'r1', 'q1', 'reason').add('K', 'o1', 'r1', 'object').state();
    expect(s.challenges.get('q1')!.state).toBe('challenged');
    expect(s.obligations.get('A')!.owes).toEqual(['r1']);
    expect(s.obligations.get('K')!.yourMove).toEqual([]);
  });

  it('a new answer re-arms "your move"; a note is not a reaction (D27)', () => {
    const s = two().add('A', 'c1', null, 'claim').add('K', 'q1', 'c1', 'ask_proof')
      .add('A', 'r1', 'q1', 'reason').add('K', 'n1', 'r1', 'note').state();
    expect(s.challenges.get('q1')!.state).toBe('answered');
    expect(s.obligations.get('K')!.yourMove).toEqual(['q1']);
  });

  it('if the answer dies (author conceded it), the challenge is open again', () => {
    const s = two().add('A', 'c1', null, 'claim').add('K', 'q1', 'c1', 'ask_proof')
      .add('A', 'r1', 'q1', 'reason').add('K', 'o1', 'r1', 'object').add('A', 'cc', 'o1', 'concede').state();
    expect(s.assertions.get('r1')!.status).toBe('conceded_by_author');
    expect(s.challenges.get('o1')!.state).toBe('conceded');
    expect(s.challenges.get('q1')!.state).toBe('open');
    expect(s.obligations.get('A')!.owes).toEqual(['c1']);
  });
});

describe('review fixtures', () => {
  it('D3: withdrawing a claim makes open challenges on it moot', () => {
    const s = two().add('A', 'c1', null, 'claim').add('K', 'q1', 'c1', 'ask_proof').add('K', 'q2', 'c1', 'object')
      .add('A', 'w', 'c1', 'withdraw').state();
    expect(s.assertions.get('c1')!.status).toBe('withdrawn');
    expect(s.challenges.get('q1')!.state).toBe('moot');
    expect(s.obligations.get('A')!.owes).toEqual([]);
  });

  it('D3: conceding one objection kills the claim and moots the other challenges and the subtree', () => {
    const s = two().add('A', 'c1', null, 'claim').add('A', 'r1', 'c1', 'reason')
      .add('K', 'q1', 'r1', 'ask_proof').add('K', 'o1', 'c1', 'object').add('A', 'cc', 'o1', 'concede').state();
    expect(s.assertions.get('c1')!.status).toBe('conceded_by_author');
    expect(s.dead.has('r1')).toBe(true);
    expect(s.challenges.get('q1')!.state).toBe('moot');
    expect(s.obligations.get('A')!.owes).toEqual([]);
  });

  it('D4: accepted then objected by the same person → under discussion', () => {
    const s = two().add('A', 'c1', null, 'claim').add('K', 'ok', 'c1', 'concede').add('K', 'o1', 'c1', 'object').state();
    expect(s.assertions.get('c1')!.status).toBe('under_discussion');
    expect(s.obligations.get('A')!.owes).toEqual(['c1']);
  });

  it('D5: ten challenges on one point count once', () => {
    const b = two().add('A', 'c1', null, 'claim');
    for (let i = 0; i < 10; i++) b.add('K', `q${i}`, 'c1', 'ask_proof');
    expect(b.state().obligations.get('A')!.owes).toEqual(['c1']);
  });

  it('D6: one-sided agree-to-disagree passes the move; accepting closes', () => {
    const b = two().add('A', 'c1', null, 'claim').add('K', 'q1', 'c1', 'object').add('A', 'ad1', 'q1', 'agree_disagree');
    let s = b.state();
    expect(s.challenges.get('q1')!.state).toBe('proposal');
    expect(s.obligations.get('A')!.owes).toEqual([]);
    expect(s.obligations.get('K')!.yourMove).toEqual(['q1']);
    b.add('K', 'ad2', 'q1', 'agree_disagree'); s = b.state();
    expect(s.challenges.get('q1')!.state).toBe('agreed');
    expect(s.obligations.get('K')!.yourMove).toEqual([]);
    expect(s.assertions.get('c1')!.status).toBe('standing');
  });

  it('D6: a substantive move by the other side declines the proposal', () => {
    const s = two().add('A', 'c1', null, 'claim').add('K', 'q1', 'c1', 'object').add('A', 'ad1', 'q1', 'agree_disagree')
      .add('K', 'w', 'ad1', 'note') // note does not decline
      .state();
    expect(s.challenges.get('q1')!.state).toBe('proposal');
    const s2 = two().add('A', 'c1', null, 'claim').add('K', 'q1', 'c1', 'object').add('K', 'ad1', 'q1', 'agree_disagree')
      .add('A', 'r1', 'q1', 'reason').state();
    expect(s2.challenges.get('q1')!.state).toBe('answered');
  });

  it('D9: a phantom participant (joined, never wrote) does not block "accepted"', () => {
    const s = two().join('Z', 'متطفل').add('A', 'c1', null, 'claim').add('K', 'ok', 'c1', 'concede').state();
    expect(s.assertions.get('c1')!.status).toBe('accepted');
    expect(s.people.get('Z')!.active).toBe(false);
  });

  it('three participants: accepted needs every active other', () => {
    const b = two().join('M', 'محمد').add('A', 'c1', null, 'claim').add('M', 'm1', null, 'claim').add('K', 'ok', 'c1', 'concede');
    expect(b.state().assertions.get('c1')!.status).toBe('standing');
    b.add('M', 'ok2', 'c1', 'concede');
    expect(b.state().assertions.get('c1')!.status).toBe('accepted');
  });

  it('three participants: a third person cannot answer for the target author', () => {
    const s = two().join('M').add('A', 'c1', null, 'claim').add('K', 'q1', 'c1', 'ask_proof').add('M', 'r1', 'q1', 'reason').state();
    expect(s.nodes.has('r1')).toBe(false);
    expect(s.ignored).toBe(1);
    expect(s.obligations.get('A')!.owes).toEqual(['c1']);
  });

  it('D10: concede can be undone by withdrawing the stance', () => {
    const b = two().add('A', 'c1', null, 'claim').add('K', 'o1', 'c1', 'object').add('A', 'cc', 'o1', 'concede');
    expect(b.state().assertions.get('c1')!.status).toBe('conceded_by_author');
    b.add('A', 'undo', 'cc', 'withdraw');
    const s = b.state();
    expect(s.assertions.get('c1')!.status).toBe('under_discussion');
    expect(s.obligations.get('A')!.owes).toEqual(['c1']);
  });

  it('D2: retype is ignored once someone else replied; replies are never dropped', () => {
    const s = two().add('A', 'c1', null, 'claim').add('K', 'q1', 'c1', 'ask_proof')
      .retype('K', 'q1', 'note').add('A', 'r1', 'q1', 'reason').retype('A', 'c1', 'claim').state();
    expect(s.nodes.get('q1')!.move).toBe('ask_proof'); // A replied after? the retype came first → honoured only without others' replies
    expect(s.nodes.has('r1')).toBe(true);
  });

  it('D2: retype before any reply is honoured', () => {
    const s = two().add('A', 'c1', null, 'claim').add('K', 'q1', 'c1', 'ask_proof').retype('K', 'q1', 'object').state();
    expect(s.nodes.get('q1')!.move).toBe('object');
  });

  it('D7: edit after a reply is flagged and keeps history', () => {
    const s = two().add('A', 'c1', null, 'claim').add('K', 'q1', 'c1', 'ask_proof').edit('A', 'c1', 'new text').edit('K', 'c1', 'hijack').state();
    const n = s.nodes.get('c1')!;
    expect(n.text).toBe('new text');
    expect(n.editedAfterReply).toBe(true);
    expect(n.versions.length).toBe(2);
  });

  it('counter: target author owes until he challenges or concedes the counter', () => {
    const b = two().add('A', 'c1', null, 'claim').add('K', 'k1', 'c1', 'counter');
    expect(b.state().obligations.get('A')!.owes).toEqual(['c1']);
    b.add('A', 'q', 'k1', 'ask_proof');
    const s = b.state();
    expect(s.obligations.get('A')!.owes).toEqual([]);
    expect(s.obligations.get('K')!.owes).toEqual(['k1']);
  });

  it('refute requires a witness; ask_source requires a citation', () => {
    const s = two().add('A', 'c1', null, 'claim').add('A', 'r1', 'c1', 'reason')
      .add('K', 'x1', 'r1', 'refute').add('K', 'x2', 'r1', 'refute', { witness: 'counterexample' })
      .add('K', 'x3', 'c1', 'ask_source').state();
    expect(s.nodes.has('x1')).toBe(false);
    expect(s.nodes.has('x2')).toBe(true);
    expect(s.nodes.has('x3')).toBe(false);
  });

  it('duplicate names are ALL marked with a key fingerprint (no first-come advantage)', () => {
    const s = new B().join('AAAAx', 'أحمد').join('BBBBy', 'أحمد').join('K', 'خالد').state();
    expect(s.people.get('AAAAx')!.name).toBe('أحمد ·AAAA');
    expect(s.people.get('BBBBy')!.name).toBe('أحمد ·BBBB');
    expect(s.people.get('K')!.name).toBe('خالد');
  });
  it('malformed events are skipped, never thrown on (S2)', () => {
    const b = two().add('A', 'c1', null, 'claim');
    b.events.push({ ...(b.events[1] as any), id: 'bad1', type: 'person.join', authorId: 'Z', name: 123 } as any);
    b.events.push({ type: 'node.add', id: 'bad2', debateId: 'd1', authorId: 'K', at: 5, v: 1, node: { id: 'x', parentId: 'c1', move: 'object', text: { evil: 1 } } } as any);
    b.events.push(null as any, 42 as any, { __proto__: { polluted: 1 } } as any);
    const s = b.state();
    expect(s.nodes.size).toBe(1);
    expect(s.people.has('Z')).toBe(false);
  });
});

describe('fairness: symmetry', () => {
  it('mirror-image moves give mirror-image obligations', () => {
    const b = two()
      .add('A', 'a', null, 'claim').add('K', 'k', null, 'claim')
      .add('K', 'qa', 'a', 'ask_proof').add('A', 'qk', 'k', 'ask_proof')
      .add('A', 'ra', 'qa', 'reason').add('K', 'rk', 'qk', 'reason')
      .add('K', 'oa', 'ra', 'object').add('A', 'ok', 'rk', 'object');
    const s = b.state();
    const A = s.obligations.get('A')!, K = s.obligations.get('K')!;
    expect(A.owes.length).toBe(K.owes.length);
    expect(A.yourMove.length).toBe(K.yourMove.length);
  });
  it('a pure questioner still gets "your move" after answers', () => {
    const s = new B().join('A').join('K', 'K', true).add('A', 'a', null, 'claim').add('K', 'q', 'a', 'ask_proof').add('A', 'r', 'q', 'reason').state();
    expect(s.obligations.get('K')!.yourMove).toEqual(['q']);
  });
});

describe('determinism', () => {
  it('any arrival order gives the same state', () => {
    const b = two().add('A', 'c1', null, 'claim').add('K', 'q1', 'c1', 'ask_proof').add('A', 'r1', 'q1', 'reason')
      .add('K', 'o1', 'r1', 'object').add('A', 'cc', 'o1', 'concede').add('A', 'undo', 'cc', 'withdraw').add('K', 'k1', 'c1', 'counter');
    const ref = summary(b.state());
    for (let i = 0; i < 50; i++) {
      const shuffled = [...b.events].sort(() => Math.random() - 0.5);
      expect(summary(derive('d1', shuffled))).toEqual(ref);
    }
  });
});

function summary(s: ReturnType<B['state']>) {
  return JSON.stringify({
    ch: [...s.challenges].sort(), as: [...s.assertions].sort(),
    ob: [...s.obligations].sort(), nodes: [...s.nodes.keys()].sort(),
  });
}
