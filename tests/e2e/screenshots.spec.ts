// Generates README screenshots. Run with: SHOTS=1 npx playwright test screenshots --trace off
import { expect, test } from '@playwright/test';
import { createDebate, join, person, reply, sendUpdate } from './helpers';

test.skip(!process.env.SHOTS, 'screenshots only on demand');

test('screenshots', async ({ browser }) => {
  const A = await person(browser), K = await person(browser);
  for (const p of [A, K]) await p.page.setViewportSize({ width: 390, height: 844 });
  const invite = await createDebate(A.page, { title: 'هل يستقلّ العقل بإثبات وجود الله؟', name: 'أحمد',
    claim: 'العقل يستقلّ بإثبات وجود الصانع: فكل حادث لا بد له من محدِث، والعالم حادث.' });
  await A.page.screenshot({ path: 'docs/screenshots/ar-invite.png' });
  await join(K.page, invite, { name: 'خالد', claim: 'العقل وحده لا يكفي لإثبات وجود الله؛ غايته الإمكان لا الوجوب.' });
  await reply(K.page, 'العقل يستقلّ', 'ما دليلك؟', 'ما دليلك على أن العالم حادث؟ هذه هي المقدمة محل النزاع.');
  await reply(K.page, 'العقل يستقلّ', 'ماذا تقصد؟', 'ماذا تقصد بـ«العقل» هنا: القوة المدركة للضروريات أم مجموع المعارف؟');
  await A.page.goto(await sendUpdate(K.page));
  await A.page.getByRole('tab', { name: 'الحالة' }).click();
  await A.page.screenshot({ path: 'docs/screenshots/ar-status.png' });
  await reply(A.page, 'ما دليلك على أن العالم حادث', 'أجيب بدليل', 'لأن العالم متغيّر، وكل متغيّر حادث؛ إذ التغيّر انتقال من حال إلى حال.');
  await reply(A.page, 'ماذا تقصد بـ«العقل»', 'أوضّح مقصدي', 'أقصد القوة المدركة للضروريات العقلية، كاستحالة اجتماع النقيضين.');
  await reply(A.page, 'العقل وحده لا يكفي', 'أعترض', 'الإمكان نفسه يستلزم مرجِّحاً، فالانتهاء إلى الإمكان وحده غير مسلّم.');
  await K.page.goto(await sendUpdate(A.page));
  await K.page.getByRole('tab', { name: 'الشجرة' }).click();
  await K.page.locator('a.card', { hasText: 'العقل يستقلّ' }).first().click();
  await expect(K.page.locator('article.card.focused')).toBeVisible();
  await K.page.screenshot({ path: 'docs/screenshots/ar-tree.png' });
  await K.page.locator('article.card.focused').getByRole('button', { name: 'ردّ' }).click();
  await K.page.waitForTimeout(300);
  await K.page.screenshot({ path: 'docs/screenshots/ar-composer.png' });
  await K.page.keyboard.press('Escape');
  await K.page.getByRole('tab', { name: 'الحالة' }).click();
  await K.page.screenshot({ path: 'docs/screenshots/ar-status-khalid.png' });
  await K.page.emulateMedia({ colorScheme: 'dark' });
  await K.page.screenshot({ path: 'docs/screenshots/ar-status-dark.png' });
  await K.page.emulateMedia({ colorScheme: 'light' });
  await K.page.goto('./#/');
  await K.page.getByRole('button', { name: 'English' }).click();
  await K.page.locator('.debate-item').first().click();
  await K.page.screenshot({ path: 'docs/screenshots/en-status.png' });
});
