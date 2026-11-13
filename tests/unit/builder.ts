import { derive } from '../../src/model/derive';
import type { DebateEvent, Move, NodeMeta } from '../../src/model/types';

export class B {
  events: DebateEvent[] = [];
  t = 1000;
  constructor(public debateId = 'd1') {
    this.events.push({ type: 'debate.create', id: 'e-create', debateId, authorId: 'A', at: this.t++, v: 1, title: 'T', lang: 'ar' });
  }
  join(id: string, name = id, questionerOnly = false) {
    this.events.push({ type: 'person.join', id: `e-join-${id}-${this.t}`, debateId: this.debateId, authorId: id, at: this.t++, v: 1, name, pub: 'k', questionerOnly });
    return this;
  }
  add(author: string, id: string, parent: string | null, move: Move, meta?: NodeMeta, text = `${move} by ${author}`) {
    this.events.push({ type: 'node.add', id: `e-${id}`, debateId: this.debateId, authorId: author, at: this.t++, v: 1, node: { id, parentId: parent, move, text, meta } });
    return this;
  }
  edit(author: string, nodeId: string, text: string) {
    this.events.push({ type: 'node.edit', id: `e-edit-${nodeId}-${this.t}`, debateId: this.debateId, authorId: author, at: this.t++, v: 1, nodeId, text });
    return this;
  }
  retype(author: string, nodeId: string, move: Move) {
    this.events.push({ type: 'node.retype', id: `e-rt-${nodeId}-${this.t}`, debateId: this.debateId, authorId: author, at: this.t++, v: 1, nodeId, move });
    return this;
  }
  state() { return derive(this.debateId, this.events); }
}
