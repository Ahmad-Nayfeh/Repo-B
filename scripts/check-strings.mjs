// Arabic L10n gate: (1) ar/en key parity, (2) no physical CSS direction properties,
// (3) no Arabic text literals in UI components outside i18n/content files.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
let fail = false;
const keys = (f) => [...readFileSync(f, 'utf8').matchAll(/^\s+'([a-zA-Z0-9_.]+)':/gm)].map((m) => m[1]).sort();
const ar = keys('src/i18n/ar.ts'), en = keys('src/i18n/en.ts');
const missing = ar.filter((k) => !en.includes(k)).concat(en.filter((k) => !ar.includes(k)));
if (missing.length) { console.error('i18n key mismatch:', missing); fail = true; }
const css = readFileSync('src/styles.css', 'utf8');
const phys = css.match(/(?:^|[;{\s])(margin|padding|border)-(left|right)\b|(?:^|[;{\s])(left|right)\s*:|text-align:\s*(left|right)|float:\s*(left|right)/gm);
if (phys) { console.error('physical direction CSS found:', phys); fail = true; }
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);
const allowed = ['src/i18n/', 'src/content/', 'src/ui/Static.tsx', 'src/app/service.ts'];
for (const f of walk('src').filter((f) => /\.(ts|tsx)$/.test(f) && !allowed.some((a) => f.startsWith(a)))) {
  const lines = readFileSync(f, 'utf8').split('\n');
  lines.forEach((l, i) => { if (/[؀-ۿ]/.test(l) && !l.trim().startsWith('//')) { console.error(`hard-coded Arabic in ${f}:${i + 1}: ${l.trim()}`); fail = true; } });
}
console.log(fail ? 'strings check FAILED' : `strings check ok (${ar.length} keys)`);
process.exit(fail ? 1 : 0);
