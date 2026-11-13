import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { createDebate, join, person, reply } from './helpers';

for (const scheme of ['light', 'dark'] as const) {
  test(`no serious/critical axe violations on main screens (${scheme})`, async ({ browser }) => {
    const A = await person(browser), K = await person(browser);
    await A.page.emulateMedia({ colorScheme: scheme }); await K.page.emulateMedia({ colorScheme: scheme });
    const scan = async (page: typeof A.page, label: string) => {
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const bad = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(bad.map((v) => `${label}: ${v.id} — ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
    };
    await A.page.goto('./'); await scan(A.page, 'home');
    const invite = await createDebate(A.page, { title: 'سؤال الاختبار', name: 'أحمد', claim: 'دعوى للاختبار' });
    await scan(A.page, 'sync');
    await join(K.page, invite, { name: 'خالد' });
    await scan(K.page, 'status');
    await reply(K.page, 'دعوى للاختبار', 'ما دليلك؟', 'دليلك؟');
    await scan(K.page, 'tree-focus');
    await K.page.locator('article.card.focused').getByRole('button', { name: 'ردّ' }).click();
    await scan(K.page, 'composer');
  });
}
