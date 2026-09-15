/* 검색 홈 결과 머리 줄(정렬 줄) — 시안 5295:84026 대조용 수치·캡처
   실행: node tools/qa/capsort.js <저장폴더> */
const path = require('path');
const { open } = require('./_cdp');
const OUT = process.argv[2] || '.';
const FILE = 'file:///' + path.resolve(__dirname, '..', '..', 'index.html').replace(/\\/g, '/');

(async () => {
  const p = await open({ width: 1920, height: 1000, scale: 2 });
  await p.goto(FILE);
  await p.wait(1400);

  await p.click('[data-mode="text"]');
  await p.fill('#qText', '어제 검은색 옷을 입은 택배 기사 찾아줘');
  await p.click('#btnSearchGo');
  await p.wait(1000);

  const info = await p.eval(`
    const B = s => { const e=document.querySelector(s); if(!e||!e.getClientRects().length) return null;
      const r=e.getBoundingClientRect();
      return {x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)}; };
    const C = (s,props) => { const e=document.querySelector(s); if(!e) return null;
      const cs=getComputedStyle(e); const o={}; for(const k of props) o[k]=cs.getPropertyValue(k); return o; };
    return {
      label:   B('.results-head .rh-label'),
      labelTx: (document.querySelector('.results-head .rh-label')||{}).textContent,
      right:   B('.results-head .rh-right'),
      order:   [...document.querySelectorAll('.results-head .rh-right > *')].map(e=>e.className||e.id),
      sort:    B('#sortSelect .select-btn'),
      sortCss: C('#sortSelect .select-btn', ['height','width','border-radius','font-size','padding','background-color','border-color','color']),
      caret:   B('#sortSelect .select-btn .caret'),
      slider:  B('.results-head .size-slider'),
      sMin:    B('.size-slider .ss-min'), sMax: B('.size-slider .ss-max'),
      range:   B('#thumbSize'),
      seg:     B('#viewSeg'),
      segBtns: [...document.querySelectorAll('#viewSeg button')].map(b=>{
        const r=b.getBoundingClientRect(); const cs=getComputedStyle(b);
        return {txt:b.textContent.trim(), on:b.classList.contains('on'),
                w:Math.round(r.width), h:Math.round(r.height),
                bg:cs.backgroundColor, bd:cs.borderColor, color:cs.color, radius:cs.borderRadius};
      }),
      err: window.__err,
    };
  `);
  console.log(JSON.stringify(info, null, 1));

  const b = info.right;
  if (b) await p.shot(path.join(OUT, 'sort_right.png'), { x: b.x - 8, y: b.y - 8, width: b.w + 16, height: b.h + 16 });
  const h = await p.box('.results-head');
  if (h) await p.shot(path.join(OUT, 'sort_head.png'), { x: h.x, y: h.y - 4, width: h.width, height: h.height + 8 });

  console.log('페이지 오류:', await p.errors());
  await p.close();
})().catch(e => { console.error('실패:', e.message); process.exit(1); });
