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
    return { sec: B(q('#dtMapSec')), ctl: B(q('#dtMapSec .map-ctl')), bldg: B(q('#dtBldg')), nav: B(q('#dtMapSec .zone-nav')), right: B(q('#dtMapSec .mc-right')), lay: B(q('#mapLay')), swap: B(q('#mapSwap')), map: B(q('#dtMap')), stage: B(q('#dtMap .flat-stage, #dtMap .zone-map')), tools: B(q('#dtMapTools')),
      toolBtns: [...document.querySelectorAll('#dtMapTools [data-map]')].map(b => [b.dataset.map, b.classList.contains('on'), B(b)]), cams: document.querySelectorAll('#dtMap .map-cone, #dtMap .cctv-pin, #dtMap .zm-cam, #dtMap [data-mapcam]').length, zone: DT.zone };
  });
  await hide(); await page.screenshot({ path: dir + '/mv_a1.png', clip: { x: 1296, y: 60, width: 624, height: 420 } });
  console.log('A동', JSON.stringify(await R()));
  // 외부 구역으로
  await page.click('#dtBldg .select-btn'); await page.waitForTimeout(300);
  const opts = await page.evaluate(() => [...document.querySelectorAll('#dtBldg .select-menu [data-v]')].map(d => d.dataset.v + '|' + (d.dataset.zone || '')));
  console.log('OPTS', JSON.stringify(opts));
  await page.evaluate(() => { const it = [...document.querySelectorAll('#dtBldg .select-menu [data-v]')].find(d => (d.dataset.zone || d.dataset.v).includes('외부')); if (it) it.click(); });
  await page.waitForTimeout(1500); await hide();
  await page.screenshot({ path: dir + '/mv_out.png', clip: { x: 1296, y: 60, width: 624, height: 420 } });
  console.log('외부', JSON.stringify(await R()));
  // 주변 카메라 버튼
  const camBtn = await page.$('#dtMapTools [data-map="camera"], #dtMapTools [data-map="cctv"], #dtMapTools [data-map="cam"]');
  if (camBtn) { await camBtn.click(); await page.waitForTimeout(1000); }
  await hide(); await page.screenshot({ path: dir + '/mv_out_cam.png', clip: { x: 1296, y: 60, width: 624, height: 980 } });
  console.log('외부+카메라', JSON.stringify(await R()));
  // A동으로 돌아가 카메라
  await page.click('#dtBldg .select-btn'); await page.waitForTimeout(300);
  await page.evaluate(() => { const it = [...document.querySelectorAll('#dtBldg .select-menu [data-v]')].find(d => !(d.dataset.zone || d.dataset.v).includes('외부')); if (it) it.click(); });
  await page.waitForTimeout(1500); await hide();
  await page.screenshot({ path: dir + '/mv_a_cam.png', clip: { x: 1296, y: 60, width: 624, height: 980 } });
  console.log('A동+카메라', JSON.stringify(await R()));
  console.log('ERRS', JSON.stringify(errs));
  await browser.close();
})();
