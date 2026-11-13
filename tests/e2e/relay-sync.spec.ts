import { expect, test } from '@playwright/test';
import { createDebate, join, person, reply } from './helpers';
import { startMockRelay } from './mock-relay';

test('relay mode: replies arrive automatically through an encrypted mailbox (mock relay)', async ({ browser }) => {
  const r1 = await startMockRelay(), r2 = await startMockRelay();
  // CSP is bypassed only so the page may reach the local mock relay instead of public relays
  const A = await person(browser, { bypassCSP: true }), K = await person(browser, { bypassCSP: true });
  for (const p of [A, K]) await p.ctx.addInitScript((urls) => localStorage.setItem('munazara.testRelays', JSON.stringify(urls)), [r1.url, r2.url]);

  const SECRET_TEXT = 'نصّ-سري-للاختبار-٧٣٩';
  const invite = await createDebate(A.page, { title: 'اختبار المزامنة', name: 'أحمد', claim: `دعوى أولى ${SECRET_TEXT}`, mode: 'relay' });
  await join(K.page, invite, { name: 'خالد', mode: 'relay' });
  await reply(K.page, 'دعوى أولى', 'ما دليلك؟', 'ما الدليل؟');

  // Ahmad just opens the debate: no link exchanged — the challenge arrives via the relays
  await A.page.bringToFront();
  await A.page.getByRole('tab', { name: 'المزامنة' }).click();
  await A.page.getByRole('button', { name: 'زامن الآن' }).click();
  await A.page.getByRole('tab', { name: 'الحالة' }).click();
  await expect(A.page.locator('.wait-item.owe')).toHaveCount(1, { timeout: 15_000 });

  // relays hold only ciphertext: no plaintext, tag is not the debate id
  const dump = JSON.stringify([...r1.events, ...r2.events]);
  expect(r1.events.length).toBeGreaterThan(0);
  expect(dump).not.toContain(SECRET_TEXT);
  expect(dump).not.toContain('ما الدليل');
  expect(dump).not.toContain('أحمد');
  // per-device Nostr keys: Ahmad's and Khalid's batches are signed by different pubkeys
  expect(new Set(r1.events.map((e) => e.pubkey)).size).toBeGreaterThanOrEqual(2);

  // only localhost was contacted
  for (const p of [A, K]) { expect(p.foreign).toEqual([]); expect(p.errors).toEqual([]); }
  await r1.close(); await r2.close();
});
