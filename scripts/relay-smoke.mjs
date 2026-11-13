// Relay smoke test: publishes ONE dummy kind-4333 event with a throwaway key and tries to read it back.
// Usage: node scripts/relay-smoke.mjs wss://relay1 wss://relay2 ...   (never send real debate data)
import { schnorr } from '@noble/curves/secp256k1.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import WebSocket from 'ws';
const sk = schnorr.utils.randomSecretKey(); const pk = bytesToHex(schnorr.getPublicKey(sk));
const tag = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
const ev = { pubkey: pk, created_at: Math.floor(Date.now()/1000), kind: 4333, tags: [['t', tag]], content: 'dummy-test-' + Math.random().toString(36).slice(2) };
const ser = JSON.stringify([0, ev.pubkey, ev.created_at, ev.kind, ev.tags, ev.content]);
ev.id = bytesToHex(sha256(new TextEncoder().encode(ser)));
ev.sig = bytesToHex(schnorr.sign(hexToBytes(ev.id), sk));
const relays = process.argv.slice(2);
const one = (url) => new Promise((res) => {
  const out = { url, ok: null, readback: false, err: null };
  let ws; const t = setTimeout(() => { try{ws.close()}catch{}; res(out); }, 12000);
  try { ws = new WebSocket(url); } catch (e) { out.err = String(e); clearTimeout(t); return res(out); }
  ws.on('error', (e) => { out.err = String(e.message||e); });
  ws.on('open', () => ws.send(JSON.stringify(['EVENT', ev])));
  ws.on('message', (m) => { const d = JSON.parse(m.toString());
    if (d[0] === 'OK') { out.ok = d[2] + (d[3] ? ' ' + d[3] : ''); setTimeout(()=>ws.send(JSON.stringify(['REQ', 's', { kinds: [4333], '#t': [tag] }])), 1500); }
    if (d[0] === 'EVENT' && d[2]?.id === ev.id) { out.readback = true; clearTimeout(t); ws.close(); res(out); }
    if (d[0] === 'EOSE') { clearTimeout(t); ws.close(); res(out); }
    if (d[0] === 'NOTICE' || d[0]==='CLOSED') out.err = (out.err||'') + ' ' + JSON.stringify(d).slice(0,120);
  });
});
for (const r of relays) console.log(JSON.stringify(await one(r)));
