const { chromium } = require('/usr/local/lib/node_modules/@playwright/cli/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file:///Users/jey27071/svms-object-search-mockup/index.html?t=' + Date.now(), { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  await page.click('[data-mode="text"]'); await page.fill('#qText', '흰색 옷'); await page.click('#btnSearchGo'); await page.waitForTimeout(800);
  await page.dblclick('#resultsBody [data-id]'); await page.waitForTimeout(1000);
  for (let i = 0; i < 3; i++) { const c = page.locator('#clipsBody [data-pick]:not(:checked)').first(); if (await c.count()) await c.click({ force: true }); await page.waitForTimeout(200); }
  await page.click('#clipsGo'); await page.waitForTimeout(2200);
  const dir = process.argv[2];
  const hide = () => page.evaluate(() => { const t = document.querySelector('#toast'); if (t) t.hidden = true; });
  const measure = host => page.evaluate(host => {
    const B = e => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    const ths = [...document.querySelectorAll(host + ' .tl-th.edit')];
    const th = ths.sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0];
    if (!th) return null;
    const g = th.querySelector('.tl-grip.s'), ge = th.querySelector('.tl-grip.e'), gb = getComputedStyle(g, '::before');
    const bar = th.parentElement.querySelector('.tl-bar');
    return { n: ths.length, th: B(th), row: B(th.closest('.tl-row')), radius: getComputedStyle(th).borderRadius, film: B(th.querySelector('.tl-film')), gripS: B(g), gripE: B(ge), bar: [gb.width, gb.height, gb.backgroundColor, gb.display], topBarVis: bar && getComputedStyle(bar).visibility };
  }, host);
  // 단일 상세
  await hide(); await page.click('#dtTl [data-tlvedit]'); await page.waitForTimeout(700); await page.mouse.move(5, 1070);
  console.log('DT', JSON.stringify(await measure('#dtTl')));
  const tl1 = await page.locator('#dtTl').boundingBox();
  await page.screenshot({ path: dir + '/hdl_new_dt.png', clip: { x: tl1.x, y: tl1.y + 40, width: 800, height: 140 } });
  await page.click('#dtTl [data-tlvedit]').catch(() => {}); await page.waitForTimeout(500);
  // 드래그로 길이 조정 되는지 (손잡이 위치에서)
  // 경로 비교 4명
  await page.evaluate(() => { const idx = [0, 1, 2, 3]; const ids = idx.map(i => { const c = TL_TRACKS[i].clips[0] || {}; return (OBJECTS.find(x => x.cam === c.cam) || OBJECTS[0]).id; }); TL.show = new Set(idx); openCompareTab(ids, idx); });
  await page.waitForTimeout(2000); await hide();
  await page.click('#cmpTl [data-tlvedit]'); await page.waitForTimeout(700); await page.mouse.move(5, 1070);
  const m = await measure('#cmpTl'); console.log('CMP', JSON.stringify(m));
  const tl = await page.locator('#cmpTl').boundingBox();
  await page.screenshot({ path: dir + '/hdl_new_cmp.png', clip: { x: tl.x, y: tl.y, width: 800, height: Math.min(360, tl.height) } });
  // 끝 손잡이 끌기 → 저장 버튼 활성
  if (m) { const x = m.gripE[0] + 6, y = m.gripE[1] + m.gripE[3] / 2; await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x - 40, y, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(300); }
  console.log('AFTER_DRAG', JSON.stringify(await measure('#cmpTl')), 'saveEnabled', await page.evaluate(() => { const b = [...document.querySelectorAll('#cmpTl button')].find(x => x.textContent.trim() === '저장'); return b ? !b.disabled : null; }));
  console.log('ERRS', JSON.stringify(errs));
  await browser.close();
})();
