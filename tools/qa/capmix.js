const { chromium } = require('/usr/local/lib/node_modules/@playwright/cli/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file:///Users/jey27071/svms-object-search-mockup/index.html?t=' + Date.now(), { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const dir = process.argv[2];
  // 4. 초기화 : 검색어 비움
  await page.click('[data-mode="text"]'); await page.fill('#qText', '흰색 옷'); await page.click('#btnSearchGo'); await page.waitForTimeout(800);
  await page.click('#btnSearchReset'); await page.waitForTimeout(500);
  console.log('RESET', JSON.stringify(await page.evaluate(() => ({ q: S.q, val: document.getElementById('qText').value, clear: document.getElementById('qTextClear').hidden }))));
  await page.fill('#qText', '흰색 옷'); await page.click('#btnSearchGo'); await page.waitForTimeout(800);
  await page.dblclick('#resultsBody [data-id]'); await page.waitForTimeout(1000);
  for (let i = 0; i < 3; i++) { const c = page.locator('#clipsBody [data-pick]:not(:checked)').first(); if (await c.count()) await c.click({ force: true }); await page.waitForTimeout(200); }
  await page.click('#clipsGo'); await page.waitForTimeout(2200);
  const hide = () => page.evaluate(() => { const t = document.querySelector('#toast'); if (t) t.hidden = true; });
  // 3. 외부 + 주변 카메라
  await page.click('#dtBldg .select-btn'); await page.waitForTimeout(300);
  await page.evaluate(() => { const it = [...document.querySelectorAll('#dtBldg .select-menu [data-v]')].find(d => (d.dataset.zone || '').includes('외부')); if (it) it.click(); });
  await page.waitForTimeout(1200);
  await page.click('#dtMapTools [data-map="cctv"]'); await page.waitForTimeout(1000); await hide();
  const cones = await page.evaluate(() => [...document.querySelectorAll('#dtMap > .zone-map .zm-cone')].map(n => { const r = n.getBoundingClientRect(); return [n.title, n.className.replace('map-cone zm-cone ', ''), Math.round(r.left), Math.round(r.top), Math.round(r.width), getComputedStyle(n).backgroundImage.slice(-20)]; }));
  console.log('CONES', JSON.stringify(cones));
  await page.screenshot({ path: dir + '/mix_out_cam.png', clip: { x: 1296, y: 60, width: 624, height: 700 } });
  if (cones.length) {
    const c = page.locator('#dtMap > .zone-map .zm-cone').first(); await c.hover(); await page.waitForTimeout(500);
    const pop = await page.evaluate(() => { const p = document.querySelector('#dtMap .zm-stage > .cctv-pop'); return p && { txt: p.textContent.trim(), h: Math.round(p.getBoundingClientRect().height), b: (r => [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)])(p.getBoundingClientRect()) }; });
    console.log('POP', JSON.stringify(pop));
    await page.screenshot({ path: dir + '/mix_out_pop.png', clip: { x: 1296, y: 60, width: 624, height: 700 } });
    await c.click({ force: true }); await page.waitForTimeout(800);
    console.log('VIEW', await page.evaluate(() => { const m = document.getElementById('mdVideo'); return m && !m.hidden ? (document.querySelector('#mdVideo h3') || {}).textContent + ' / ' + ((document.querySelector('#vwBody') || {}).textContent || '').trim().slice(0, 40) : 'closed'; }));
    await page.evaluate(() => { if (!document.getElementById('mdVideo').hidden) closeModal('#mdVideo'); document.getElementById('overlay').hidden = true; });
  }
  // 2. 지도 두 칸 : 머리 버튼
  await page.click('#mapLay [data-ml="2"]'); await page.waitForTimeout(1500); await hide();
  const nav = await page.evaluate(() => [...document.querySelectorAll('#dtMapSec .zone-nav .zn-btn, .zone-pane .zp-nav .zn-btn')].map(b => [b.disabled, getComputedStyle(b).backgroundColor, getComputedStyle(b).opacity]));
  console.log('NAV', JSON.stringify(nav), 'cones2', await page.evaluate(() => document.querySelectorAll('#dtMapSec .zm-cone').length));
  await page.screenshot({ path: dir + '/mix_dual.png', clip: { x: 1296, y: 60, width: 624, height: 980 } });
  const zp = page.locator('#dtMap2 .zp-cone').first();
  console.log('PANE2_CONES', await page.evaluate(() => document.querySelectorAll('#dtMap2 .zp-cone').length));
  if (await zp.count()) { await zp.hover(); await page.waitForTimeout(500);
    console.log('PANE2_POP', JSON.stringify(await page.evaluate(() => { const p = document.querySelector('#dtMap2 .zp-stage > .cctv-pop'); return p && (r => [Math.round(r.width), Math.round(r.height)])(p.getBoundingClientRect()); })));
    await page.screenshot({ path: dir + '/mix_pane2_pop.png', clip: { x: 1296, y: 560, width: 624, height: 480 } }); }
  console.log('ERRS', JSON.stringify(errs));
  await browser.close();
})();
