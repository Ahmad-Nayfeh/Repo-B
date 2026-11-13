import { expect, test } from '@playwright/test';
import { createDebate, person } from './helpers';

test('works offline after the first visit (read and write)', async ({ browser }) => {
  const A = await person(browser);
  await createDebate(A.page, { title: 'اختبار دون اتصال', name: 'أحمد', claim: 'دعوى للاختبار دون اتصال' });
  // wait until the service worker controls the page, then reload once to be fully cached
  await A.page.waitForFunction(() => navigator.serviceWorker?.ready.then(() => true), null, { timeout: 15_000 });
  await A.page.reload();
  await A.page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15_000 });

  await A.ctx.setOffline(true);
  await A.page.goto('./#/');
  await expect(A.page.getByText('اختبار دون اتصال')).toBeVisible();
  await A.page.getByText('اختبار دون اتصال').click();
  await A.page.getByRole('tab', { name: 'الشجرة' }).click();
  await A.page.getByRole('button', { name: 'أضف دعوى' }).click();
  const sheet = A.page.locator('dialog.sheet[open]');
  await sheet.locator('#ctext').fill('دعوى مكتوبة دون اتصال');
  await sheet.getByRole('button', { name: 'إرسال' }).click();
  await expect(A.page.getByText('دعوى مكتوبة دون اتصال').first()).toBeVisible();
  await A.ctx.setOffline(false);
});
