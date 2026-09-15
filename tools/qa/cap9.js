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
  const info = () => page.evaluate(() => {
    const B = e => { if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    const q = s => document.querySelector(s);
    return { stage: B(q('.cmp-stage')), grid: B(q('#cmpGrid')), ctrl: B(q('#cmpCtrl')), tl: B(q('#cmpTl')),
      tiles: [...document.querySelectorAll('#cmpGrid .cmp-tile')].map(t => ({ b: B(t), cls: t.className, head: (t.querySelector('.cmp-head') || {}).textContent && t.querySelector('.cmp-head').textContent.replace(/\s+/g, ' ').trim().slice(0, 60),
        img: B(t.querySelector('.cmp-vid img')), pip: B(t.querySelector('.pipc, .pip')) })),
      lanes: [...document.querySelectorAll('#cmpTl .tl-obj, #cmpTl .tl-row')].slice(0, 5).map(B) };
  });
  for (const n of [2, 3, 4]) {
    await page.evaluate(n => {
      const idx = [0, 1, 2, 3].slice(0, n);
      const ids = idx.map(i => { const c = TL_TRACKS[i].clips[0] || {}; return (OBJECTS.find(x => x.cam === c.cam) || OBJECTS[0]).id; });
      TL.show = new Set(idx.map((_, k) => k));
      openCompareTab(ids, idx);
    }, n);
    await page.waitForTimeout(2200); await hideToast();
    /* 커서를 모든 인물 영상이 있는 시각 근처로 */
    await page.evaluate(() => { const ts = TL_TRACKS.slice(0, 4).map(t => +tlTime(t.clips[0].from)); const t = Math.max(...ts) + 60000; if (TL.span) { TL.cursor = Math.min(1, Math.max(0, (t - TL.d0) / TL.span)); const h = document.querySelector('#cmpTl'); if (h && h._sync) h._sync(); if (typeof cmpSyncHeads === 'function') cmpSyncHeads(); } });
    await page.waitForTimeout(800);
    await page.screenshot({ path: dir + `/c9_${n}.png` });
    console.log('N' + n, JSON.stringify(await info()));
  }
  // 호버 : 타임라인 인물 칩에 마우스
  const chip = page.locator('#cmpTl .tl-obj').nth(2);
  if (await chip.count()) {
    const cb = await chip.boundingBox();
    await page.mouse.move(cb.x + cb.width - 10, cb.y + cb.height - 8); await page.waitForTimeout(500);
    const rm = await page.evaluate(() => { const r = document.querySelectorAll('#cmpTl .tl-obj')[2].querySelector('.rm'); if (!r) return null; const b = r.getBoundingClientRect(), c = r.closest('.tl-obj').getBoundingClientRect(); return { dx: Math.round(c.right - b.right), dy: Math.round(b.top - c.top), w: Math.round(b.width), op: getComputedStyle(r).opacity }; });
    console.log('RM', JSON.stringify(rm));
    await page.screenshot({ path: dir + '/c9_hover.png', clip: { x: cb.x - 10, y: cb.y - 80, width: 420, height: 240 } });
  }
  // 비활성 : 한 인물 끄기
  await page.evaluate(() => { const t = CMP.objs[2]; if (t) { TL.off.add(t.slot); const tab = S.tabs.find(x => x.id === S.activeTab); renderCmpView(tab); } });
  await page.waitForTimeout(1200); await page.mouse.move(5, 1070); await hideToast();
  await page.screenshot({ path: dir + '/c9_off.png' });
  console.log('OFF', JSON.stringify(await info()));
  console.log('ERRS', JSON.stringify(errs));
  await browser.close();
})();
