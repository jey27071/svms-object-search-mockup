const { chromium } = require('/usr/local/lib/node_modules/@playwright/cli/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file:///Users/jey27071/svms-object-search-mockup/index.html?t=' + Date.now(), { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  await page.click('[data-mode="text"]'); await page.fill('#qText', '흰색 옷'); await page.click('#btnSearchGo'); await page.waitForTimeout(800);
  const dir = process.argv[2];
  const B = s => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return { b: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], rad: cs.borderRadius, border: cs.borderTopWidth, hidden: e.hidden }; }, s);
  const snap = async tag => {
    const o = {}; for (const s of ['#sidePanel', '#sidePanel .side-head', '.content-col > .tabbar', '#results', '#preview', '#btnHistory', '#btnTabAdd']) o[s] = await B(s);
    o.tabs = await page.evaluate(() => [...document.querySelectorAll('#tabs .tab')].map(t => { const r = t.getBoundingClientRect(); return [t.className, Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height), getComputedStyle(t, '::after').display]; }));
    console.log(tag, JSON.stringify(o));
    await page.screenshot({ path: `${dir}/hh_${tag}.png` });
  };
  await snap('home_nopv');
  // 카드 선택 → 원본 영상 패널
  await page.click('#resultsBody [data-id]'); await page.waitForTimeout(700);
  await snap('home_pv');
  // 상세 열었다가 돌아오기 → 탭 생성
  await page.dblclick('#resultsBody [data-id]'); await page.waitForTimeout(1000);
  for (let i = 0; i < 3; i++) { const c = page.locator('#clipsBody [data-pick]:not(:checked)').first(); if (await c.count()) await c.click({ force: true }); await page.waitForTimeout(200); }
  await page.click('#clipsGo'); await page.waitForTimeout(2000);
  await page.evaluate(() => { const t = document.querySelector('#tabs .tab-search'); if (t) t.click(); }); await page.waitForTimeout(800);
  await page.evaluate(() => { const t = document.querySelector('#toast'); if (t) t.hidden = true; });
  await snap('home_tab');
  // 접기
  await page.evaluate(() => setCollapsed(true)); await page.waitForTimeout(700);
  await snap('home_fold');
  await page.evaluate(() => setCollapsed(false)); await page.waitForTimeout(500);
  // 상세 화면은 영향 없는지
  await page.evaluate(() => { const t = document.querySelector('#tabs .tab:not(.tab-search)'); if (t) t.click(); }); await page.waitForTimeout(1200);
  await snap('detail');
  console.log('ERRS', JSON.stringify(errs));
  await browser.close();
})();
