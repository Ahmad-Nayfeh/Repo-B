import { expect, test } from '@playwright/test';
import { clipboardUrl, createDebate, person, reply } from './helpers';

test('identity link lets the same person write from a second device', async ({ browser }) => {
  const phone = await person(browser), laptop = await person(browser);
  const invite = await createDebate(phone.page, { title: 'جهازان', name: 'أحمد', claim: 'دعوى من الهاتف' });
  phone.page.on('dialog', (d) => d.accept());
  await phone.page.bringToFront();
  await phone.page.evaluate(() => navigator.clipboard.writeText(''));
  await phone.page.getByRole('button', { name: 'استخدم هويتي على جهاز آخر' }).click();
  const idLink = await clipboardUrl(phone.page);
  expect(idLink).toContain('#/i/');

  // laptop: identity link before invite → refused politely
  await laptop.page.goto(idLink);
  await expect(laptop.page.getByText('افتح رابط الدعوة أولاً', { exact: false })).toBeVisible();
  // invite, then identity link
  await laptop.page.goto(invite);
  await expect(laptop.page.getByRole('heading', { name: 'دعوة إلى مناظرة' })).toBeVisible();
  await laptop.page.goto(idLink);
  await expect(laptop.page.getByText('أحمد (أنت)').first()).toBeVisible();
  // writes as Ahmad (own claim → default "add a reason")
  laptop.page.setDefaultTimeout(6000);
  try { await reply(laptop.page, 'دعوى من الهاتف', 'أضيف دليلاً', 'دليل مكتوب من الجهاز الثاني'); } catch (e) { await laptop.page.screenshot({ path: 'test-results/identity-fail.png' }); throw e; }
  await expect(laptop.page.locator('article.card.focused', { hasText: 'دليل مكتوب من الجهاز الثاني' })).toContainText('أحمد (أنت)');
  expect(laptop.errors).toEqual([]);
});
