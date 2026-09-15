const { chromium } = require('/usr/local/lib/node_modules/@playwright/cli/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file:///Users/jey27071/svms-object-search-mockup/index.html?t=' + Date.now(), { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  await page.click('[data-mode="text"]'); await page.fill('#qText', '흰색 옷'); await page.click('#btnSearchGo'); await page.waitForTimeout(800);
  await page.dblclick('#resultsBody [data-id]'); await page.waitForTimeout(1000);
  for (let i = 0; i < 3; i++) { const c = page.locator('#clipsBody [data-pick]:not(:checked)').first(); if (await c.count()) await c.click({ force: true }); await page.waitForTimeout(200); }
  await page.click('#clipsGo'); await page.waitForTimeout(2500);
  const dir = process.argv[2];
  const hideToast = () => page.evaluate(() => { const t = document.querySelector('#toast'); if (t) t.hidden = true; });
  const R = () => page.evaluate(() => {
    const B = e => { if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    return { map: B(document.querySelector('#dtMapSec')), video: B(document.querySelector('#dtVideo')), panes: [...document.querySelectorAll('#dtMapSec .zp, #dtMapSec .zone-pane, #dtMapSec [class*="split"] > div')].slice(0, 4).map(B),
      tiles: [...document.querySelectorAll('#dtMulti .mv-tile')].map(B), body: document.body.className };
  });
  // 1. 자리 바꾸기 (한 화면 맵)
  await page.click('#mapSwap'); await page.waitForTimeout(1200); await hideToast();
  await page.screenshot({ path: dir + '/c8_swap1.png' });
  console.log('SWAP1', JSON.stringify(await R()));
  // 2. 맵 듀얼
  const two = page.locator('#mapLay [data-ml="2"]');
  if (await two.count()) { await two.click(); await page.waitForTimeout(1500); await hideToast(); }
  await page.screenshot({ path: dir + '/c8_swap_dual.png' });
  console.log('SWAPDUAL', JSON.stringify(await R()));
  // 3. 멀티 뷰 2 · 3 · 4 분할
  for (const n of ['2', '3', '4']) {
    await page.evaluate(n => {
      const go = document.querySelector('#dtViewSel .vm4-go'); if (go) go.click();
      const opt = document.querySelector(`#dtViewSel [data-ms="${n}"]`); if (opt) opt.click();
    }, n);
    await page.waitForTimeout(1500); await page.mouse.click(5, 1070); await hideToast();
    await page.screenshot({ path: dir + `/c8_mv${n}.png` });
    console.log('MV' + n, JSON.stringify(await R()));
  }
  const chk = await page.evaluate(() => {
    const B = e => { if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    const t = document.querySelector('#dtMulti .mv-tile');
    return { side: B(document.querySelector('.dt-side')), mapSec: B(document.querySelector('#dtMapSec')), obj: B(t && t.querySelector('.mv-obj')), objTxt: t && t.querySelector('.mv-obj').textContent,
      sw: t && [...t.querySelectorAll('.mv-sw .tb')].map(B), more: t && getComputedStyle(t.querySelector('.mv-more')).display, no: t && t.querySelector('.mv-no') && getComputedStyle(t.querySelector('.mv-no')).display,
      fit: t && getComputedStyle(t.querySelector(':scope > img')).objectFit };
  });
  await page.locator('#dtMulti .mv-tile').nth(1).locator('.mv-sw [data-vratio]').click(); await page.waitForTimeout(300);
  const ratio = await page.evaluate(() => { const p = document.querySelector('#vRatioPop'); return p && !p.hidden ? p.textContent : null; });
  await page.mouse.click(5, 1070);
  // 영상 한 칸으로 되돌려 머리말 칩
  await page.evaluate(() => { const b = document.querySelector('#dtViewSel .vm1, #dtTools .vm1, [data-view="1"]'); if (b) b.click(); });
  await page.waitForTimeout(900); await hideToast();
  await page.screenshot({ path: dir + '/c8_swap1b.png' });
  const vh = await page.evaluate(() => { const o = document.querySelector('#dtVhObj'); const r = o.getBoundingClientRect(); return { disp: getComputedStyle(o).display, txt: o.textContent, box: [Math.round(r.left), Math.round(r.top), Math.round(r.width)] }; });
  console.log('CHK', JSON.stringify({ chk, ratio, vh }));
  console.log('ERRS', JSON.stringify(errs));
  await browser.close();
})();
