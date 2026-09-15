/* ============================================================
   Windows 용 확인 헬퍼 — Playwright 없이 CDP 로 직접 붙는다.
   이 PC(2026-09-15)에는 Playwright 가 없고, 기존 tools/qa/*.js 는
   macOS 경로(/usr/local/..., /Users/jey27071/...)로 고정돼 있어 돌지 않는다.
   Node 24 내장 WebSocket + Chrome 의 원격 디버깅 포트만 쓴다.

   쓰는 법
     const { open } = require('./_cdp');
     const p = await open({ width: 1920, height: 1000, scale: 2 });
     await p.goto('file:///C:/Users/S-1/svms-object-search-mockup/index.html');
     await p.wait(1200);
     await p.click('[data-mode="text"]');
     const box = await p.box('.results-head .rh-right');
     await p.shot('out.png', box);
     await p.close();
   ============================================================ */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find(p => fs.existsSync(p));

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function open({ width = 1920, height = 1000, scale = 2, port = 9333, gl = false } = {}) {
  if (!CHROME) throw new Error('Chrome/Edge 를 찾지 못했다');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'svms-cdp-'));
  const args = [
    '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
    '--disable-extensions', '--allow-file-access-from-files', 'about:blank',
  ];
  /* 3D(다층 뷰)를 볼 때만 — headless 에선 swiftshader 가 있어야 캔버스가 뜬다 */
  if (gl) args.unshift('--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist');
  const proc = spawn(CHROME, args, { stdio: 'ignore' });

  let ver;
  for (let i = 0; i < 100; i++) {
    try { ver = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); break; }
    catch { await sleep(100); }
  }
  if (!ver) { proc.kill(); throw new Error('디버깅 포트가 열리지 않았다'); }

  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let id = 0;
  const waiting = new Map();
  const events = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && waiting.has(m.id)) {
      const { res, rej } = waiting.get(m.id); waiting.delete(m.id);
      m.error ? rej(new Error(m.error.message)) : res(m.result);
    } else if (m.method) events.push(m);
  };
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
    const msg = { id: ++id, method, params }; if (sessionId) msg.sessionId = sessionId;
    waiting.set(msg.id, { res, rej }); ws.send(JSON.stringify(msg));
  });

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);

  await S('Page.enable'); await S('Runtime.enable');
  await S('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: scale, mobile: false,
  });

  const evalJS = async (expr, awaitPromise = false) => {
    const r = await S('Runtime.evaluate', {
      expression: `(()=>{ ${expr} })()`, returnByValue: true, awaitPromise,
    });
    if (r.exceptionDetails) throw new Error('평가 오류: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
    return r.result.value;
  };

  /* 페이지에서 난 오류를 모아 둔다 — 보고할 때 "페이지 오류 없음" 근거 */
  const errors = [];
  await evalJS(`window.__err=[];addEventListener('error',e=>__err.push(String(e.message)));
                addEventListener('unhandledrejection',e=>__err.push('rejection: '+e.reason));`);

  return {
    async goto(url) {
      await S('Page.navigate', { url: url + (url.includes('?') ? '&' : '?') + 't=' + Date.now() });
      for (let i = 0; i < 200; i++) {
        if (events.some(e => e.method === 'Page.loadEventFired')) break;
        await sleep(50);
      }
      await evalJS(`window.__err=[];addEventListener('error',e=>__err.push(String(e.message)));
                    addEventListener('unhandledrejection',e=>__err.push('rejection: '+e.reason));`);
    },
    wait: sleep,
    eval: evalJS,
    /* 실제 마우스 이벤트가 필요한 경우가 드물어 기본은 DOM click 이다 */
    click: sel => evalJS(`const e=document.querySelector(${JSON.stringify(sel)});
                          if(!e) throw new Error('없는 요소: '+${JSON.stringify(sel)});
                          e.click(); return true;`),
    fill: (sel, v) => evalJS(`const e=document.querySelector(${JSON.stringify(sel)});
                              if(!e) throw new Error('없는 요소: '+${JSON.stringify(sel)});
                              e.value=${JSON.stringify(v)};
                              e.dispatchEvent(new Event('input',{bubbles:true}));
                              e.dispatchEvent(new Event('change',{bubbles:true})); return true;`),
    box: sel => evalJS(`const e=document.querySelector(${JSON.stringify(sel)});
                        if(!e||!e.getClientRects().length) return null;
                        const r=e.getBoundingClientRect();
                        return {x:Math.round(r.left),y:Math.round(r.top),
                                width:Math.round(r.width),height:Math.round(r.height),
                                right:Math.round(r.right),bottom:Math.round(r.bottom)};`),
    css: (sel, props) => evalJS(`const e=document.querySelector(${JSON.stringify(sel)});
                                 if(!e) return null; const cs=getComputedStyle(e); const o={};
                                 for(const p of ${JSON.stringify(props)}) o[p]=cs.getPropertyValue(p);
                                 return o;`),
    errors: () => evalJS('return window.__err||[]'),
    async shot(file, clip) {
      const p = { format: 'png', captureBeyondViewport: false };
      if (clip) p.clip = { x: clip.x, y: clip.y, width: clip.width, height: clip.height, scale: 1 };
      const { data } = await S('Page.captureScreenshot', p);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, Buffer.from(data, 'base64'));
      return file;
    },
    async close() { try { ws.close(); } catch {} proc.kill(); },
  };
}

module.exports = { open, CHROME };
