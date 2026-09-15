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
  const hide = () => page.evaluate(() => { const t = document.querySelector('#toast'); if (t) t.hidden = true; });
  /* 칸 가운데에서 휠을 올리고, 그 지점의 요소 · 칸 안 메인 이미지의 확대 상태를 읽는다 */
  const probe = async (tag, tileSel) => {
    const boxes = await page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.getClientRects().length).map(e => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }), tileSel);
    const out = [];
    for (let i = 0; i < boxes.length; i++) {
      const [x, y] = boxes[i];
      const hit = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.id || e.tagName + '.' + String(e.className).slice(0, 30)) : null; }, [x, y]);
      await page.mouse.move(x, y); await page.mouse.wheel(0, -300); await page.waitForTimeout(250);
      const zin = await page.evaluate(([sel, i]) => { const t = [...document.querySelectorAll(sel)].filter(e => e.getClientRects().length)[i]; const img = t && (t.querySelector('.cmp-vid > img, :scope > img') || (t.id === 'dtVideo' ? document.getElementById('dtVideoImg') : null)); return img ? img.dataset.zlabel || null : null; }, [tileSel, i]);
      for (let k = 0; k < 5; k++) { await page.mouse.wheel(0, 300); await page.waitForTimeout(120); }
      const zout = await page.evaluate(([sel, i]) => { const t = [...document.querySelectorAll(sel)].filter(e => e.getClientRects().length)[i]; const img = t && (t.querySelector('.cmp-vid > img, :scope > img') || (t.id === 'dtVideo' ? document.getElementById('dtVideoImg') : null)); return img ? img.dataset.zlabel || null : null; }, [tileSel, i]);
      out.push({ i, zin, zout }); continue;
      const st = await page.evaluate(([sel, i]) => { const t = [...document.querySelectorAll(sel)].filter(e => e.getClientRects().length)[i]; const img = t && (t.querySelector('.cmp-vid > img, :scope > img') || (t.id === 'dtVideo' ? document.getElementById('dtVideoImg') : null));
        return img ? { z: img.dataset.zlabel || img.dataset.z || null, tf: img.style.transform || getComputedStyle(img).transform } : null; }, [tileSel, i]);
      out.push({ i, hit, st });
    }
    console.log(tag, JSON.stringify(out.map(o => [o.i, o.zin, o.zout])));
  };
  await hide(); await probe('SINGLE', '#dtVideo');
  /* 재생 바 위 휠은 확대 안 됨 */
  { const b = await page.locator('#dtCtrl').boundingBox(); await page.mouse.move(b.x + 200, b.y + 20); await page.mouse.wheel(0, -300); await page.waitForTimeout(200);
    console.log('CTRL_WHEEL', await page.evaluate(() => document.getElementById('dtVideoImg').dataset.zlabel || '1.0')); }
  for (const n of ['2', '3', '4']) {
    await page.evaluate(n => { const go = document.querySelector('#dtViewSel .vm4-go'); if (go) go.click(); const o = document.querySelector(`#dtViewSel [data-ms="${n}"]`); if (o) o.click(); }, n);
    await page.waitForTimeout(1200); await page.mouse.click(5, 1070); await hide();
    await probe('MV' + n, '#dtMulti .mv-tile');
  }
  await page.evaluate(() => document.querySelector('#dtTools .vm1').click()); await page.waitForTimeout(600);
  for (const n of [2, 3, 4]) {
    await page.evaluate(n => { const idx = [0, 1, 2, 3].slice(0, n); const ids = idx.map(i => { const c = TL_TRACKS[i].clips[0] || {}; return (OBJECTS.find(x => x.cam === c.cam) || OBJECTS[0]).id; }); TL.show = new Set(idx.map((_, k) => k)); openCompareTab(ids, idx); }, n);
    await page.waitForTimeout(1800); await hide();
    await page.evaluate(() => { const ts = TL_TRACKS.slice(0, 4).map(t => +tlTime(t.clips[0].from)); const t = Math.max(...ts) + 60000; TL.cursor = Math.min(1, Math.max(0, (t - TL.d0) / TL.span)); if (typeof cmpSyncHeads === 'function') cmpSyncHeads(); });
    await page.waitForTimeout(400);
    await probe('CMP' + n, '#cmpGrid .cmp-tile');
  }
  await page.evaluate(() => { const m = document.querySelector('#cmpCtrl .vm4-go'); if (m) m.click(); }); await page.waitForTimeout(1200); await page.mouse.click(5, 1070); await hide();
  await probe('CMP_MULTI', '.cmp-stage #dtMulti .mv-tile');
  await page.evaluate(() => { const b = document.querySelector('#cmpCtrl .vm1'); if (b) b.click(); }); await page.waitForTimeout(600);
  await page.evaluate(() => { const t = [...document.querySelectorAll('#tabs .tab:not(.tab-search)')][0]; if (t) t.click(); }); await page.waitForTimeout(1500);
  await page.evaluate(() => { CMP.objs = CMP.objs.slice(0, 1); }).catch(() => {});
  await page.click('#mapSwap').catch(() => {}); await page.waitForTimeout(1000); await hide();
  await probe('SWAP_SINGLE', '#dtVideo');
  console.log('ERRS', JSON.stringify(errs));
  await browser.close();
})();
