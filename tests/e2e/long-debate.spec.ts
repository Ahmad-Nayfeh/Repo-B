import { expect, test } from '@playwright/test';
import { bigDebate } from './fixture';
import { derive } from '../../src/model/derive';
import { person } from './helpers';

test('a 300-point debate stays fast and navigable on a throttled phone', async ({ browser }) => {
  const { record, events } = await bigDebate(300);
  const A = await person(browser);
  await A.page.goto('./');
  await A.page.waitForFunction(() => !!document.querySelector('.content'));
  await A.page.evaluate(async ({ record, events }) => {
    const db: IDBDatabase = await new Promise((res, rej) => { const r = indexedDB.open('munazara', 1); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    const tx = db.transaction(['debates', 'events'], 'readwrite');
    tx.objectStore('debates').put(record);
    for (const e of events) tx.objectStore('events').put(e);
    await new Promise((res) => { tx.oncomplete = res; });
  }, { record, events });

  const cdp = await A.ctx.newCDPSession(A.page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });

  const t0 = Date.now();
  await A.page.goto(`./#/d/${record.id}`);
  await A.page.reload();
  await expect(A.page.getByRole('heading', { name: /بانتظارك/ })).toBeVisible();
  const statusMs = Date.now() - t0;
  const lcp = await A.page.evaluate(() => new Promise<number>((res) => {
    new PerformanceObserver((l) => { const e = l.getEntries(); res(e[e.length - 1]!.startTime); }).observe({ type: 'largest-contentful-paint', buffered: true });
    setTimeout(() => res(-1), 3000);
  }));

  // obligations shown match the model, for both people
  const s = derive(record.id, events);
  const fmt = (n: number) => new Intl.NumberFormat('ar', { numberingSystem: 'arab' }).format(n);
  const people = [...s.people.values()].sort((a, b) => a.joinOrder - b.joinOrder);
  const obs = people.map((p) => s.obligations.get(p.id)!);
  expect(obs[0]!.owes.length + obs[0]!.yourMove.length + obs[1]!.owes.length + obs[1]!.yourMove.length).toBeGreaterThan(0);
  const mine = obs[0]!.owes.length + obs[0]!.yourMove.length;
  await expect(A.page.locator('.wait-item')).toHaveCount(Math.min(mine, 3));
  if (mine > 0) await expect(A.page.getByRole('heading', { name: /بانتظارك/ })).toContainText(fmt(mine));
  await expect(A.page.locator('.person').nth(0)).toContainText(`عليك الرد: ${fmt(obs[0]!.owes.length)} · دورك: ${fmt(obs[0]!.yourMove.length)}`);
  await expect(A.page.locator('.person').nth(1)).toContainText(`عليه الرد: ${fmt(obs[1]!.owes.length)} · دوره: ${fmt(obs[1]!.yourMove.length)}`);

  // tap into the tree and go deep
  let t1 = Date.now();
  await A.page.getByRole('tab', { name: 'الشجرة' }).click();
  await expect(A.page.locator('a.card').first()).toBeVisible();
  const treeMs = Date.now() - t1;
  const depthSteps: number[] = [];
  for (let i = 0; i < 6; i++) {
    const next = A.page.locator('a.card').first();
    if (!(await next.count())) break;
    const href = (await next.getAttribute('href'))!;
    const target = decodeURIComponent(href.split('/').pop()!);
    t1 = Date.now(); await next.click();
    await expect.poll(() => decodeURIComponent(A.page.url())).toContain(`/t/${target}`); // navigation finished
    await expect(A.page.locator('article.card.focused')).toBeVisible(); depthSteps.push(Date.now() - t1);
  }
  t1 = Date.now();
  await A.page.locator('article.card.focused').getByRole('button', { name: 'ردّ' }).click();
  await expect(A.page.locator('dialog.sheet[open]')).toBeVisible();
  const composerMs = Date.now() - t1;

  const report = { nodes: 300, events: events.length, statusMs, lcpMs: Math.round(lcp), treeMs, focusStepsMs: depthSteps, composerMs };
  console.log('PERF', JSON.stringify(report));
  test.info().annotations.push({ type: 'perf', description: JSON.stringify(report) });
  expect(lcp).toBeLessThan(2500);
  expect(Math.max(...depthSteps, treeMs, composerMs)).toBeLessThan(1000);
  expect(A.errors).toEqual([]);
});
