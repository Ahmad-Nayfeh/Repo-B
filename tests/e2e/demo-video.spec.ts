// Records the README demo (two phones). Run with: DEMO=1 npx playwright test demo-video --trace off
import { expect, test, type Page } from '@playwright/test';
import { clipboardUrl } from './helpers';

test.skip(!process.env.DEMO, 'demo recording only on demand');
test.setTimeout(180_000);

const VIDEO_DIR = 'test-results/demo-video';
async function phone(browser: any, name: string) {
  const ctx = await browser.newContext({
    locale: 'ar-SA', viewport: { width: 390, height: 780 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
    permissions: ['clipboard-read', 'clipboard-write'], recordVideo: { dir: `${VIDEO_DIR}/${name}`, size: { width: 390, height: 780 } },
  });
  await ctx.addInitScript(() => { Object.defineProperty(navigator, 'share', { value: undefined, configurable: true }); });
  return { ctx, page: (await ctx.newPage()) as Page };
}
const pause = (p: Page, ms = 900) => p.waitForTimeout(ms);
const type = async (p: Page, sel: string, text: string) => { await p.locator(sel).click(); await p.locator(sel).pressSequentially(text, { delay: 18 }); };

test('demo', async ({ browser }) => {
  const A = await phone(browser, 'ahmad'), K = await phone(browser, 'khalid');
  await K.page.goto('./'); // Khalid idles on the home screen while Ahmad starts
  // --- Ahmad creates the debate
  await A.page.goto('./'); await pause(A.page, 1200);
  await A.page.getByRole('link', { name: 'مناظرة جديدة' }).click(); await pause(A.page, 500);
  await type(A.page, '#nt', 'هل يستقلّ العقل بإثبات وجود الله؟');
  await type(A.page, '#nn', 'أحمد');
  await type(A.page, '#ns', 'نعم: كل حادث لا بد له من محدِث، والعالم حادث.');
  await A.page.getByText('يدوي فقط').click(); await pause(A.page, 600);
  await A.page.getByRole('button', { name: 'أنشئ المناظرة' }).click(); await pause(A.page, 1200);
  await A.page.bringToFront(); await A.page.getByRole('button', { name: 'شارك الرابط' }).click();
  const invite = await clipboardUrl(A.page); await pause(A.page, 800);
  // --- Khalid joins
  await K.page.goto(invite); await pause(K.page, 1500);
  await type(K.page, '#jn', 'خالد');
  await type(K.page, '#js', 'لا: غاية العقل الإمكان لا الوجوب.');
  await K.page.getByText('يدوي فقط').click();
  await K.page.getByRole('button', { name: 'ادخل المناظرة' }).click(); await pause(K.page, 1200);
  // Khalid asks for proof
  await K.page.getByRole('tab', { name: 'الشجرة' }).click(); await pause(K.page, 700);
  await K.page.locator('a.card', { hasText: 'كل حادث' }).first().click(); await pause(K.page, 800);
  await K.page.locator('article.card.focused').getByRole('button', { name: 'ردّ' }).click(); await pause(K.page, 700);
  const ks = K.page.locator('dialog.sheet[open]');
  await ks.getByRole('button', { name: 'ما دليلك؟', exact: true }).click(); await pause(K.page, 500);
  await ks.locator('#ctext').pressSequentially('ما دليلك على أن العالم حادث؟', { delay: 18 });
  await ks.getByRole('button', { name: 'إرسال' }).click(); await pause(K.page, 1500);
  await K.page.bringToFront(); await K.page.evaluate(() => navigator.clipboard.writeText(''));
  await K.page.getByRole('button', { name: 'أرسل تحديثاً' }).first().click();
  const up1 = await clipboardUrl(K.page);
  // --- Ahmad receives: "waiting on you"
  await A.page.goto(up1); await pause(A.page, 2000);
  await A.page.locator('.wait-item.owe').click(); await pause(A.page, 900);
  await A.page.locator('article.card.focused').getByRole('button', { name: 'ردّ' }).click(); await pause(A.page, 900);
  const as = A.page.locator('dialog.sheet[open]');
  await as.locator('#ctext').pressSequentially('لأنه متغيّر، وكل متغيّر حادث.', { delay: 18 });
  await as.getByRole('button', { name: 'إرسال' }).click(); await pause(A.page, 1200);
  await A.page.bringToFront(); await A.page.evaluate(() => navigator.clipboard.writeText(''));
  await A.page.getByRole('button', { name: 'أرسل تحديثاً' }).first().click();
  const up2 = await clipboardUrl(A.page);
  // --- Khalid: "your move"
  await K.page.goto(up2); await K.page.getByRole('tab', { name: 'الحالة' }).click(); await pause(K.page, 2000);
  await K.page.locator('.wait-item.move').click(); await pause(K.page, 1200);
  await K.page.getByRole('tab', { name: 'الشجرة' }).click(); await pause(K.page, 300);
  await K.page.goBack(); await pause(K.page, 1500);
  await expect(K.page.locator('article.card.focused')).toBeVisible();
  await A.ctx.close(); await K.ctx.close();
});
