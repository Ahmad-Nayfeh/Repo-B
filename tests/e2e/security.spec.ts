import { expect, test } from '@playwright/test';
import { createDebate, person } from './helpers';

test('S1: a forged invite with a known debate id but another secret is refused', async ({ browser }) => {
  const A = await person(browser);
  const invite = await createDebate(A.page, { title: 'سري', name: 'أحمد', claim: 'دعوى أصلية' });
  const debateId = invite.split('#/j/')[1]!.split('.')[0]!;
  // attacker knows only the debate id (it appears in update links and backup headers)
  const forged = `./#/j/${debateId}.${'A'.repeat(43)}`;
  await A.page.goto(forged);
  await expect(A.page.getByText('لا يطابق المناظرة المحفوظة')).toBeVisible();
  await A.page.getByRole('link', { name: 'رجوع' }).click();
  await A.page.locator('.debate-item').first().click();
  await expect(A.page.getByText('دعوى أصلية').first()).toBeVisible();
  expect(A.errors).toEqual([]);
});
