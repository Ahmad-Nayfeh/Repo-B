import { describe, expect, it } from 'vitest';
import { ar } from '../../src/i18n/ar';
import { en } from '../../src/i18n/en';
import { MOVES } from '../../src/model/types';

describe('i18n', () => {
  it('ar and en have identical keys and no empty strings', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(ar).sort());
    for (const [k, v] of [...Object.entries(ar), ...Object.entries(en)]) expect(v.trim(), k).not.toBe('');
  });
  it('every move has a label in both languages', () => {
    for (const m of MOVES) { expect(ar).toHaveProperty(`move.${m}`); expect(en).toHaveProperty(`move.${m}`); }
  });
  it('no verdict language in status strings (fairness gate)', () => {
    const verdict = /(فاز|خسر|انتصر|هُزم|مُفحَم|أُلزم|صحيح|خاطئ|win|won|lost|loser|winner|correct|wrong|true|false)/i;
    for (const [k, v] of [...Object.entries(ar), ...Object.entries(en)]) {
      if (/^(status|ch|stance|debate\.(owes|move))/.test(k)) expect(v, k).not.toMatch(verdict);
    }
  });
});
