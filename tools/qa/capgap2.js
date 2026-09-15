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
  const R = () => page.evaluate(() => { const B = s => { const e = document.querySelector(s); if (!e || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    return { tabbar: B('.content-col > .tabbar'), video: B('#dtVideo'), ctrl: B('#dtCtrl'), tl: B('#dtTl'), cmpStage: B('.cmp-stage'), cmpCtrl: B('#cmpCtrl'), cmpTl: B('#cmpTl'), side: B('.dt-side'), multi: B('#dtMulti') }; });
  await hide(); await page.screenshot({ path: dir + '/gap2_dt.png' }); console.log('DT', JSON.stringify(await R()));
  await page.evaluate(() => { const go = document.querySelector('#dtViewSel .vm4-go'); if (go) go.click(); const o = document.querySelector('#dtViewSel [data-ms="4"]'); if (o) o.click(); });
  await page.waitForTimeout(1200); await page.mouse.click(5, 1070); await hide();
  await page.screenshot({ path: dir + '/gap2_mv.png' }); console.log('MV', JSON.stringify(await R()));
  await page.evaluate(() => document.querySelector('#dtTools .vm1').click()); await page.waitForTimeout(600);
  await page.evaluate(() => { const idx = [0, 1]; const ids = idx.map(i => { const c = TL_TRACKS[i].clips[0] || {}; return (OBJECTS.find(x => x.cam === c.cam) || OBJECTS[0]).id; }); TL.show = new Set(idx); openCompareTab(ids, idx); });
  await page.waitForTimeout(1800); await hide();
  await page.screenshot({ path: dir + '/gap2_cmp.png' }); console.log('CMP', JSON.stringify(await R()));
  console.log('ERRS', JSON.stringify(errs));
  await browser.close();
})();
