import { expect, test } from '@playwright/test';
import { createDebate, join, person, reply, sendUpdate } from './helpers';

test('two people run the core loop over manual links (Arabic, phone)', async ({ browser }) => {
  const A = await person(browser), K = await person(browser);

  const invite = await createDebate(A.page, {
    title: 'هل يستقلّ العقل بإثبات وجود الله؟', name: 'أحمد',
    claim: 'العقل يستقلّ بإثبات وجود الصانع، لأن كل حادث لا بد له من محدِث.',
  });
  expect(invite).toMatch(/#\/j\/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}\./);

  // Khalid joins with an opposing claim
  await join(K.page, invite, { name: 'خالد', claim: 'العقل وحده لا يكفي؛ لا بد من الوحي.' });
  // the secret must not stay in the address bar
  expect(K.page.url()).not.toContain('#/j/');
  await expect(K.page.getByText('العقل يستقلّ بإثبات وجود الصانع').first()).toBeVisible();

  // Khalid asks for proof on a premise-level claim of Ahmad
  await reply(K.page, 'العقل يستقلّ', 'ما دليلك؟', 'ما دليلك على أن كل حادث لا بد له من محدِث؟');
  await expect(K.page.getByText('بانتظار رد أحمد').first()).toBeVisible();
  const up1 = await sendUpdate(K.page);
  expect(up1).toContain('#/u/');
  expect(up1).not.toContain(invite.split('.')[1]!); // update links carry no key (review D14)

  // Ahmad receives it and sees he owes a reply
  await A.page.goto(up1);
  await expect(A.page.getByRole('heading', { name: /بانتظارك/ })).toBeVisible();
  await expect(A.page.locator('.wait-item.owe')).toHaveCount(1);
  await A.page.locator('.wait-item.owe').click();
  await A.page.locator('article.card.focused').getByRole('button', { name: 'ردّ' }).click();
  const sheet = A.page.locator('dialog.sheet[open]');
  await expect(sheet.getByRole('button', { name: 'أجيب بدليل' })).toHaveAttribute('aria-pressed', 'true'); // context default
  await sheet.locator('#ctext').fill('لأن الترجيح بلا مرجِّح محال.');
  await sheet.getByRole('button', { name: 'إرسال' }).click();
  const up2 = await sendUpdate(A.page);

  // Khalid now has "your move"; he accepts the answer
  await K.page.goto(up2);
  await K.page.getByRole('tab', { name: 'الحالة' }).click();
  await expect(K.page.locator('.wait-item.move')).toHaveCount(1);
  await K.page.locator('.wait-item.move').click();
  await K.page.locator('article.card.focused').getByRole('button', { name: 'ردّ' }).click();
  const ks = K.page.locator('dialog.sheet[open]');
  await ks.getByRole('button', { name: 'أقبل الجواب' }).click();
  await ks.getByRole('button', { name: 'تأكيد' }).click();
  await K.page.getByRole('tab', { name: 'الحالة' }).click();
  await expect(K.page.getByText('لا شيء ينتظرك الآن.')).toBeVisible();

  // manual mode: no request ever left localhost; no CSP violations; no errors
  for (const p of [A, K]) {
    expect(p.foreign).toEqual([]);
    expect(await (p.page as any).__csp()).toEqual([]);
    expect(p.errors).toEqual([]);
  }
});

test('Ahmad and Khalid see symmetric obligations after mirrored challenges', async ({ browser }) => {
  const A = await person(browser), K = await person(browser);
  const invite = await createDebate(A.page, { title: 'سؤال', name: 'أحمد', claim: 'دعوى أحمد الأولى' });
  await join(K.page, invite, { name: 'خالد', claim: 'دعوى خالد الأولى' });
  await reply(K.page, 'دعوى أحمد الأولى', 'ما دليلك؟', 'دليلك؟');
  await A.page.goto(await sendUpdate(K.page));
  await reply(A.page, 'دعوى خالد الأولى', 'ما دليلك؟', 'دليلك أنت؟');
  await A.page.getByRole('tab', { name: 'الحالة' }).click();
  const people = A.page.locator('.person');
  await expect(people.nth(0)).toContainText('عليك الرد: ١');
  await expect(people.nth(1)).toContainText('عليه الرد: ١');
});
