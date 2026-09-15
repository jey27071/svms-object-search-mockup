/* ============================================================
   배포 전 에셋 캐시 버스터 갱신 — tools/bust.sh 와 같은 일을 한다.
   bust.sh 는 zsh + python3 에 기대는데 Windows PC 에는 둘 다 없어서
   Node 판을 함께 둔다. 실행: node tools/bust.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const d = new Date();
const p2 = n => String(n).padStart(2, '0');
const V = `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}${p2(d.getHours())}${p2(d.getMinutes())}`;

const edit = (rel, fn) => {
  const f = path.join(root, rel);
  const before = fs.readFileSync(f, 'utf8');
  const after = fn(before);
  if (after !== before) { fs.writeFileSync(f, after, 'utf8'); return true; }
  return false;
};

/* css · js */
edit('index.html', s => s.replace(/(assets\/(?:css|js)\/[\w.-]+)(\?v=\d+)?/g, (_, p) => `${p}?v=${V}`));
/* JS 가 만드는 이미지 경로 */
edit('assets/js/data.js', s => s.replace(/const IMG_V = '\d+';/, `const IMG_V = '${V}';`));
/* 마크업·app.js 에 직접 박힌 이미지 경로 */
edit('index.html', s => s.replace(/(assets\/(?:img|video)\/[\w.-]+\.(?:png|jpg|svg))(\?v=\d+)?/g, (_, p) => `${p}?v=${V}`));
edit('assets/js/app.js', s => s.replace(/(assets\/img\/[\w.-]+\.(?:png|jpg|svg))(\?v=\d+)?/g, (_, p) => `${p}?v=${V}`));

console.log('cache-bust', V);
