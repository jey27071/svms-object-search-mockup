const { chromium } = require('/usr/local/lib/node_modules/@playwright/cli/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file:///Users/jey27071/svms-object-search-mockup/index.html?t=' + Date.now(), { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  await page.click('[data-mode="text"]'); await page.fill('#qText', '흰색 옷'); await page.click('#btnSearchGo'); await page.waitForTimeout(800);
  await page.dblclick('#resultsBody [data-id]'); await page.waitForTimeout(1000);
  for (let i = 0; i < 3; i++) { const c = page.locator('#clipsBody [data-pick]:not(:checked)').first(); if (await c.count()) await c.click({ force: true }); await page.waitForTimeout(200); }
  await page.click('#clipsGo'); await page.waitForTimeout(2500);
  const dir = process.argv[2];
  const shot = async (sel, name) => { const b = await page.locator(sel).boundingBox(); if (b) await page.screenshot({ path: `${dir}/${name}.png`, clip: { x: b.x - 4, y: b.y - 4, width: b.width + 8, height: b.height + 8 } }); return b; };
  // 1. 이동경로 (단일)
  await page.click('#dtMapTools [data-map="path"]'); await page.waitForTimeout(600);
  const r1 = await shot('#pnlMovePath', 'c10c_route1');
  const sep = await page.evaluate(() => { const s = document.querySelector('#pnlMovePath .mpl-sep'); return s && { t: s.textContent, bg: getComputedStyle(s).backgroundColor, fs: getComputedStyle(s).fontSize }; });
  await page.evaluate(() => { document.querySelector('#pnlMovePath').hidden = true; });
  // 2. 경로 비교 2명 → 이동경로
  await page.evaluate(() => { const idx = [0, 1]; const ids = idx.map(i => { const c = TL_TRACKS[i].clips[0] || {}; return (OBJECTS.find(x => x.cam === c.cam) || OBJECTS[0]).id; }); TL.show = new Set([0, 1]); openCompareTab(ids, idx); });
  await page.waitForTimeout(2000);
  await page.click('#dtMapTools [data-map="path"]'); await page.waitForTimeout(600);
  const r2 = await shot('#pnlMovePath', 'c10c_route2');
  await page.evaluate(() => { document.querySelector('#pnlMovePath').hidden = true; });
  // 3. 경로 비교 추가 팝업
  await page.evaluate(() => openCompareAdd(TL_TRACKS, [0, 1])); await page.waitForTimeout(500);
  const ca = await shot('#mdCmpAdd', 'c10c_cadd');
  const caInfo = await page.evaluate(() => { const r = document.querySelector('#mdCmpAdd .ca-row'); const B = e => { const x = e.getBoundingClientRect(); return [Math.round(x.left), Math.round(x.top), Math.round(x.width), Math.round(x.height)]; };
    return { sub: document.querySelector('#mdCmpAdd .md-head p').textContent, row: B(r), img: B(r.querySelector('img')), ck: B(r.querySelector('.ck')), cnt: r.querySelector('.cnt').textContent, pin: B(r.querySelector('.cnt .i')) }; });
  await page.evaluate(() => { closeModal('#mdCmpAdd'); document.querySelector('#overlay').hidden = true; });
  // 4. 다층 뷰 : 툴팁 문구 · 3초 후 숨김 · 3D 버튼
  await page.click('#dtMapTools [data-map="layers"]'); await page.waitForTimeout(2500);
  const map = await page.locator('#dtMap').boundingBox();
  await page.mouse.move(map.x + 40, map.y + 60); await page.waitForTimeout(200);
  await page.mouse.move(map.x + map.width / 2, map.y + map.height / 2, { steps: 5 }); await page.waitForTimeout(700);
  const t0 = await page.evaluate(() => { const t = document.querySelector('.m3g-tip'); return t && { txt: t.textContent, hidden: t.hidden, bg: getComputedStyle(t).backgroundColor }; });
  const tipBox = await page.locator('.m3g-tip').boundingBox().catch(() => null);
  if (tipBox) await page.screenshot({ path: dir + '/c10c_tip.png', clip: { x: tipBox.x - 40, y: tipBox.y - 40, width: tipBox.width + 80, height: tipBox.height + 80 } });
  await page.waitForTimeout(3400);
  const t3 = await page.evaluate(() => { const t = document.querySelector('.m3g-tip'); return t && { hidden: t.hidden }; });
  await page.evaluate(() => { const b = document.querySelector('.m3g-3d'); if (b) b.hidden = false; });
  await page.waitForTimeout(300);
  const bb = await shot('.m3g-3d', 'c10c_3d');
  const imgOk = await page.evaluate(() => { const i = document.querySelector('.m3g-3d img'); return i && { w: i.naturalWidth, complete: i.complete }; });
  console.log('RESULT', JSON.stringify({ r1, sep, r2, ca, caInfo, t0, t3, bb, imgOk }));
  console.log('ERRS', JSON.stringify(errs));
  await browser.close();
})();
