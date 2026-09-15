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
  const hideToast = () => page.evaluate(() => { const t = document.querySelector('#toast'); if (t) t.hidden = true; });
  const measure = sel => page.evaluate(sel => {
    const B = e => { if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    return [...document.querySelectorAll(sel)].map(t => {
      const img = t.querySelector('img'); const p = t.querySelector('.pipc');
      let shown = null;   /* object-fit:contain 로 실제 그려진 영상 영역 */
      if (img && img.naturalWidth) { const r = img.getBoundingClientRect(), fit = getComputedStyle(img).objectFit, ar = img.naturalWidth / img.naturalHeight;
        if (fit === 'contain') { const w = Math.min(r.width, r.height * ar), h = w / ar; shown = [Math.round(r.left + (r.width - w) / 2), Math.round(r.top + (r.height - h) / 2), Math.round(w), Math.round(h)]; } else shown = B(img); }
      return { tile: B(t), vidBox: B(t.querySelector('.cmp-vid')), img: B(img), fit: img && getComputedStyle(img).objectFit, shown, pip: B(p), pipCol: p && p.classList.contains('col'), pipParent: p && (p.parentElement.className || p.parentElement.tagName) };
    });
  }, sel);
  // 1. 멀티 뷰 3분할 (기본 배치)
  await page.evaluate(() => { const go = document.querySelector('#dtViewSel .vm4-go'); if (go) go.click(); const o = document.querySelector('#dtViewSel [data-ms="3"]'); if (o) o.click(); });
  await page.waitForTimeout(1500); await page.mouse.click(5, 1070); await hideToast();
  console.log('MV3', JSON.stringify(await measure('#dtMulti .mv-tile')));
  await page.screenshot({ path: dir + '/s3_mv3.png', clip: { x: 0, y: 70, width: 1300, height: 760 } });
  await page.evaluate(() => document.querySelector('#dtTools .vm1').click()); await page.waitForTimeout(800);
  // 2. 경로 비교 3명
  await page.evaluate(() => { const idx = [0, 1, 2]; const ids = idx.map(i => { const c = TL_TRACKS[i].clips[0] || {}; return (OBJECTS.find(x => x.cam === c.cam) || OBJECTS[0]).id; }); TL.show = new Set(idx); openCompareTab(ids, idx); });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { const ts = TL_TRACKS.slice(0, 3).map(t => +tlTime(t.clips[0].from)); const t = Math.max(...ts) + 60000; TL.cursor = Math.min(1, Math.max(0, (t - TL.d0) / TL.span)); if (typeof cmpSyncHeads === 'function') cmpSyncHeads(); });
  await page.waitForTimeout(600); await hideToast();
  console.log('CMP3', JSON.stringify(await measure('#cmpGrid .cmp-tile')));
  // 펼친 상태도 측정
  await page.evaluate(() => document.querySelectorAll('#cmpGrid .pipc.col .pip-open').forEach(b => b.click()));
  await page.waitForTimeout(400);
  console.log('CMP3_OPEN', JSON.stringify(await measure('#cmpGrid .cmp-tile')));
  await page.screenshot({ path: dir + '/s3_cmp3.png', clip: { x: 0, y: 70, width: 1300, height: 640 } });
  await page.evaluate(() => { const idx = [0, 1]; const ids = idx.map(i => { const c = TL_TRACKS[i].clips[0] || {}; return (OBJECTS.find(x => x.cam === c.cam) || OBJECTS[0]).id; }); TL.show = new Set(idx); openCompareTab(ids, idx); });
  await page.waitForTimeout(1800);
  await page.evaluate(() => { const ts = TL_TRACKS.slice(0, 2).map(t => +tlTime(t.clips[0].from)); const t = Math.max(...ts) + 60000; TL.cursor = Math.min(1, Math.max(0, (t - TL.d0) / TL.span)); if (typeof cmpSyncHeads === 'function') cmpSyncHeads(); });
  await page.waitForTimeout(600); await hideToast();
  console.log('CMP2', JSON.stringify(await measure('#cmpGrid .cmp-tile')));
  await page.screenshot({ path: dir + '/s3_cmp2.png', clip: { x: 0, y: 70, width: 1300, height: 700 } });
  console.log('ERRS', JSON.stringify(errs));
  await browser.close();
})();
