const { chromium } = require('/usr/local/lib/node_modules/@playwright/cli/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const W of [1920]) {
    const page = await browser.newPage({ viewport: { width: W, height: 900 }, deviceScaleFactor: 2 });
    await page.goto('file:///Users/jey27071/svms-object-search-mockup/index.html?t=' + Date.now(), { waitUntil: 'load' });
    await page.waitForTimeout(1400);
    await page.click('[data-mode="text"]'); await page.fill('#qText', '어제 검은색 옷을 입은 택배 기사 찾아줘'); await page.click('#btnSearchGo'); await page.waitForTimeout(900);
    await page.click('#resultsBody [data-id]'); await page.waitForTimeout(600);
    const info = await page.evaluate(() => {
      const B = s => { const e = document.querySelector(s); if (!e || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom), Math.round(r.top + r.height / 2)]; };
      return { vw: innerWidth, docW: document.documentElement.scrollWidth, tabbar: B('.content-col > .tabbar'), hist: B('#btnHistory'), histLbl: B('#btnHistory span'), preview: B('#preview'), results: B('#results'), mainRow: B('#mainRow'), pvCard: (e => e && (r => [Math.round(r.left), Math.round(r.right)])(e.getBoundingClientRect()))(document.querySelector('#preview .pv-card, #preview .card, #preview > div > div, #preview > div')), chipBtn: B('#modeRail [data-mode="text"]'), rhLabel: B('.results-head .rh-label'), rhRight: B('.results-head .rh-right'),
        sum: B('.acc-head .acc-sum'), accX: B('.acc-head .acc-x'), accWarn: B('.acc-head .acc-warn'), accTitle: (h => h && [...h.childNodes].filter(n => n.nodeType === 1).map(n => [n.tagName + '.' + n.className, (r => [Math.round(r.left), Math.round(r.top), Math.round(r.height), Math.round(r.top + r.height / 2)])(n.getBoundingClientRect())]))(document.querySelector('.acc-head')),
        sumCss: (e => e && (cs => [cs.display, cs.alignItems, cs.height, cs.lineHeight, cs.padding, cs.fontSize, cs.gap, cs.border])(getComputedStyle(e)))(document.querySelector('.acc-head .acc-sum')),
        sumHtml: (e => e && e.outerHTML.slice(0, 260))(document.querySelector('.acc-head .acc-sum')) };
    });
    console.log('W' + W, JSON.stringify(info));
    if (W === 1920) {
      const s = await page.locator('.acc-head .acc-sum').first().boundingBox();
      if (s) await page.screenshot({ path: `${process.argv[2]}/al_sum.png`, clip: { x: s.x - 30, y: s.y - 10, width: s.width + 80, height: s.height + 20 } });
      await page.screenshot({ path: `${process.argv[2]}/al_top_1920.png`, clip: { x: 0, y: 34, width: 1920, height: 110 } });
    }
    if (W === 1440) await page.screenshot({ path: `${process.argv[2]}/al_top_1440.png`, clip: { x: 900, y: 34, width: 540, height: 110 } });
    await page.close();
  }
  await browser.close();
})();
