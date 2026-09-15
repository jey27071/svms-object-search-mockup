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
  await page.click('#clipsGo'); await page.waitForTimeout(2200);
  const dir = process.argv[2];
  const hide = () => page.evaluate(() => { const t = document.querySelector('#toast'); if (t) t.hidden = true; });
  const R = () => page.evaluate(() => {
    const B = e => { if (!e || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    const q = s => document.querySelector(s);
    const nav = [...document.querySelectorAll('#dtMapSec .zone-nav .zn-btn, #dtMapSec .zp-nav button')].map(b => [b.className, b.disabled, B(b), (b.querySelector('.i') || {}).className, b.querySelector('.i') ? getComputedStyle(b.querySelector('.i')).width : null]);
    return { secCls: q('#dtMapSec').className, bldg: B(q('#dtBldg')), bldgPos: getComputedStyle(q('#dtBldg')).position, nav: B(q('#dtMapSec .zone-nav')), navBtns: nav, right: B(q('#dtMapSec .mc-right')),
      panes: [...document.querySelectorAll('#dtMapSec .map-panes > .dt-map, #dtMapSec .zone-pane')].map(p => [p.id || p.className.slice(0, 30), B(p)]),
      stages: [...document.querySelectorAll('#dtMapSec .flat-stage, #dtMapSec .zone-map, #dtMapSec .zp-stage')].map(s => [s.className.slice(0, 30), B(s)]), zone: DT.zone, zone2: DT.zone2 };
  });
  await page.click('#mapLay [data-ml="2"]'); await page.waitForTimeout(1500); await hide();
  await page.screenshot({ path: dir + '/dual_a.png', clip: { x: 1296, y: 60, width: 624, height: 980 } });
  console.log('DUAL', JSON.stringify(await R()));
  await page.click('#dtBldg .select-btn'); await page.waitForTimeout(300);
  await page.evaluate(() => { const it = [...document.querySelectorAll('#dtBldg .select-menu [data-v]')].find(d => (d.dataset.zone || '').includes('외부')); if (it) it.click(); });
  await page.waitForTimeout(1500); await hide();
  await page.screenshot({ path: dir + '/dual_out.png', clip: { x: 1296, y: 60, width: 624, height: 980 } });
  console.log('DUAL_OUT', JSON.stringify(await R()));
  console.log('ERRS', JSON.stringify(errs));
  await browser.close();
})();
