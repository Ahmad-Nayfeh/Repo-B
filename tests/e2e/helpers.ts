import { expect, type Browser, type BrowserContext, type Page } from '@playwright/test';

export async function person(browser: Browser, opts: { bypassCSP?: boolean } = {}): Promise<{ ctx: BrowserContext; page: Page; foreign: string[]; cspViolations: string[]; errors: string[] }> {
  const ctx = await browser.newContext({ locale: 'ar-SA', permissions: ['clipboard-read', 'clipboard-write'], bypassCSP: opts.bypassCSP });
  // force the clipboard fallback for "share" so tests can read links
  await ctx.addInitScript(() => { Object.defineProperty(navigator, 'share', { value: undefined, configurable: true }); });
  await ctx.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => { (window as any).__csp = [...((window as any).__csp ?? []), `${e.violatedDirective} ${e.blockedURI}`]; });
  });
  const page = await ctx.newPage();
  const foreign: string[] = [], errors: string[] = [], cspViolations: string[] = [];
  page.on('request', (r) => { const u = new URL(r.url()); if (u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') foreign.push(r.url()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('websocket', (ws) => { const u = new URL(ws.url()); if (u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') foreign.push(ws.url()); });
  (page as any).__csp = async () => (await page.evaluate(() => (window as any).__csp ?? [])) as string[];
  return { ctx, page, foreign, cspViolations, errors };
}

export async function clipboardUrl(page: Page): Promise<string> {
  let text = '';
  await expect.poll(async () => (text = await page.evaluate(() => navigator.clipboard.readText())), { timeout: 10_000 }).toMatch(/https?:\/\//);
  return text.match(/https?:\/\/\S+/)![0];
}

export async function createDebate(page: Page, o: { title: string; name: string; claim: string; mode?: 'manual' | 'relay' }) {
  await page.goto('./');
  await page.getByRole('link', { name: 'مناظرة جديدة' }).click();
  await page.locator('#nt').fill(o.title);
  await page.locator('#nn').fill(o.name);
  await page.locator('#ns').fill(o.claim);
  await page.getByText(o.mode === 'relay' ? 'مزامنة مشفّرة عبر خوادم عامة' : 'يدوي فقط').click();
  await page.getByRole('button', { name: 'أنشئ المناظرة' }).click();
  await expect(page.getByRole('heading', { name: 'شارك رابط الدعوة' })).toBeVisible();
  await page.bringToFront();
  await page.getByRole('button', { name: 'شارك الرابط' }).click();
  return clipboardUrl(page);
}

export async function join(page: Page, url: string, o: { name: string; claim?: string; mode?: 'manual' | 'relay' }) {
  await page.goto(url);
  await expect(page.getByRole('heading', { name: 'دعوة إلى مناظرة' })).toBeVisible();
  await page.locator('#jn').fill(o.name);
  if (o.claim) await page.locator('#js').fill(o.claim);
  await page.getByText(o.mode === 'relay' ? 'مزامنة مشفّرة عبر خوادم عامة' : 'يدوي فقط').click();
  await page.getByRole('button', { name: 'ادخل المناظرة' }).click();
  await expect(page.getByRole('tab', { name: 'الحالة' })).toBeVisible();
}

/** Opens the tree, taps the card whose text contains `text`, opens the composer, picks `action`, writes, sends. */
export async function reply(page: Page, onText: string, action: string, text?: string) {
  await focusOn(page, onText);
  await page.locator('article.card.focused').getByRole('button', { name: 'ردّ' }).click();
  const sheet = page.locator('dialog.sheet[open]');
  await expect(sheet.getByRole('button', { name: /^(إرسال|تأكيد)$/ })).toBeVisible();
  const btn = sheet.getByRole('button', { name: action, exact: true });
  if ((await btn.count()) === 0) await sheet.getByRole('button', { name: /المزيد/ }).click();
  await sheet.getByRole('button', { name: action, exact: true }).click();
  if (text) await sheet.locator('#ctext').fill(text);
  await sheet.getByRole('button', { name: /^(إرسال|تأكيد)$/ }).click();
  await expect(sheet).toHaveCount(0);
}

export async function sendUpdate(page: Page): Promise<string> {
  await page.bringToFront();
  await page.evaluate(() => navigator.clipboard.writeText(''));
  await page.getByRole('button', { name: 'أرسل تحديثاً' }).first().click();
  return clipboardUrl(page);
}

/** Focuses the point whose text contains `text`, using the app's own search (works at any depth). */
export async function focusOn(page: Page, text: string) {
  await page.getByRole('tab', { name: 'الحالة' }).click();
  await page.locator('#search').fill(text);
  await page.locator('section a.fresh-item', { hasText: text }).last().click();
  await expect(page.locator('article.card.focused', { hasText: text })).toBeVisible();
}
