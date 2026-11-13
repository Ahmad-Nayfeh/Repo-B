// Minimal NIP-01 relay for tests: stores events in memory, supports kinds / #t / limit / until.
import { WebSocketServer, type WebSocket } from 'ws';

export interface MockRelay { url: string; events: any[]; close(): Promise<void>; publishes: number }

export async function startMockRelay(port = 0): Promise<MockRelay> {
  const wss = new WebSocketServer({ port, host: '127.0.0.1' });
  await new Promise<void>((r) => wss.once('listening', () => r()));
  const events: any[] = [];
  const relay: MockRelay = {
    url: `ws://127.0.0.1:${(wss.address() as any).port}`, events, publishes: 0,
    close: () => new Promise((r) => { for (const c of wss.clients) c.terminate(); wss.close(() => r()); }),
  };
  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (raw) => {
      const msg = JSON.parse(String(raw));
      if (msg[0] === 'EVENT') {
        const ev = msg[1]; relay.publishes++;
        if (!events.some((e) => e.id === ev.id)) events.push(ev);
        ws.send(JSON.stringify(['OK', ev.id, true, '']));
      } else if (msg[0] === 'REQ') {
        const [, sub, f] = msg;
        let out = events.filter((e) => (!f.kinds || f.kinds.includes(e.kind))
          && (!f['#t'] || e.tags.some((t: string[]) => t[0] === 't' && f['#t'].includes(t[1])))
          && (f.until === undefined || e.created_at <= f.until));
        out = out.sort((a, b) => b.created_at - a.created_at).slice(0, f.limit ?? 500);
        for (const e of out) ws.send(JSON.stringify(['EVENT', sub, e]));
        ws.send(JSON.stringify(['EOSE', sub]));
      }
    });
  });
  return relay;
}
