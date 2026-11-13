// CI budget: first-load JS ≤ 150 KiB gzip; first-view fonts ≤ 200 KB. (ARCHITECTURE §11)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
const html = readFileSync('dist/index.html', 'utf8');
const entry = [...html.matchAll(/<script[^>]+src="\.\/(assets\/[^"]+\.js)"/g)].map((m) => m[1]);
let js = 0;
const seen = new Set();
const walk = (f) => {
  if (seen.has(f)) return; seen.add(f);
  const src = readFileSync(`dist/${f}`, 'utf8');
  js += gzipSync(src).length;
  // static imports only (dynamic import() chunks are lazy and excluded)
  for (const m of src.matchAll(/\bimport\s*(?:[^'"()]*?from\s*)?["']\.\/([^"']+\.js)["']/g)) walk(`assets/${m[1]}`);
};
entry.forEach(walk);
const fonts = readdirSync('dist/fonts').filter((f) => f.endsWith('.woff2')).reduce((a, f) => a + statSync(`dist/fonts/${f}`).size, 0);
const kib = (n) => (n / 1024).toFixed(1);
console.log(`first-load JS (gzip): ${kib(js)} KiB over ${seen.size} file(s); fonts: ${kib(fonts)} KiB`);
let fail = false;
if (js > 150 * 1024) { console.error('FAIL: JS budget 150 KiB exceeded'); fail = true; }
if (fonts > 200 * 1000) { console.error('FAIL: font budget 200 KB exceeded'); fail = true; }
process.exit(fail ? 1 : 0);
