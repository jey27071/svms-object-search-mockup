const { chromium } = require('/usr/local/lib/node_modules/@playwright/cli/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file:///Users/jey27071/svms-object-search-mockup/index.html?t=' + Date.now(), { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  await page.click('[data-mode="text"]'); await page.fill('#qText', '흰색 옷'); await page.click('#btnSearchGo'); await page.waitForTimeout(800);
  const open = async k => {
    await page.evaluate(() => { const t = document.querySelector('#tabs .tab-search'); if (t) t.click(); }); await page.waitForTimeout(600);
    await page.locator('#resultsBody [data-id]').nth(k).dblclick(); await page.waitForTimeout(900);
    for (let i = 0; i < 3; i++) { const c = page.locator('#clipsBody [data-pick]:not(:checked)').first(); if (await c.count()) await c.click({ force: true }); await page.waitForTimeout(150); }
    await page.click('#clipsGo'); await page.waitForTimeout(1500);
  };
  await open(0); await open(1); await open(2);
  // 가운데 탭 활성
  await page.evaluate(() => { const ts = document.querySelectorAll('#tabs .tab:not(.tab-search)'); if (ts[1]) ts[1].click(); }); await page.waitForTimeout(1200);
  await page.evaluate(() => { const t = document.querySelector('#toast'); if (t) t.hidden = true; });
  await page.mouse.move(960, 600);
  const info = await page.evaluate(() => [...document.querySelectorAll('#tabs .tab')].map(t => {
    const r = t.getBoundingClientRect(), cs = getComputedStyle(t), a = getComputedStyle(t, '::after');
    const q = s => t.querySelector(s), st = (e, p) => e ? getComputedStyle(e)[p] : null;
    return { cls: t.className, b: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], pad: cs.padding, gap: cs.gap, bg: cs.backgroundColor, fw: cs.fontWeight,
      label: t.textContent.trim().slice(0, 24), nm: [st(q('.tt-n'), 'color'), st(q('.tt-n'), 'fontWeight')], cam: [st(q('.tt-c'), 'color'), st(q('.tt-c'), 'fontWeight')], span: [st(q(':scope > span'), 'color'), st(q(':scope > span'), 'fontWeight'), st(q(':scope > span'), 'fontSize')],
      x: q('.x') ? [st(q('.x'), 'opacity'), st(q('.x'), 'display')] : null, after: [a.display, a.backgroundColor] };
  }));
  info.forEach(t => console.log('TAB', JSON.stringify(t)));
  await page.screenshot({ path: process.argv[2] + '/dt3.png', clip: { x: 0, y: 34, width: 1920, height: 44 } });
  console.log('ERRS', JSON.stringify(errs));
  await browser.close();
})();
