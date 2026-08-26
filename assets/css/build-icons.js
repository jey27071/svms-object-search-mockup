/* ============================================================
   assets/icons/*.svg  →  assets/css/icons.css
   file:// 에서는 외부 SVG 를 CSS mask 로 쓸 수 없어(opaque origin) data URI 로 인라인한다.
   실행: node assets/css/build-icons.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

const iconDir = path.join(__dirname, '..', 'icons');
const outFile = path.join(__dirname, 'icons.css');

/* mask 로 쓰지 않는 아이콘 (그라디언트 컬러) */
const COLOR_ICONS = new Set(['ai']);
/* png 등 비-SVG */
const SKIP = /\.(png|jpg|jpeg)$/i;

/* url("...") 안에 넣으므로 괄호는 이스케이프하면 안 된다 —
   clip-path="url(#clip0)" 같은 내부 참조가 깨진다. */
const uri = svg =>
  'data:image/svg+xml,' +
  encodeURIComponent(svg.replace(/\r?\n/g, '').replace(/>\s+</g, '><'))
    .replace(/'/g, '%27')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')');

const files = fs.readdirSync(iconDir).filter(f => f.endsWith('.svg')).sort();

let css = `/* ============================================================
   아이콘 — Figma GUI(Tnihi6lixRR47N4RSAwUbF)에서 export 한 SVG
   ★ 자동 생성 파일. 직접 수정하지 말고 assets/css/build-icons.js 를 실행할 것.
   ============================================================ */
.i{
  display:inline-block;flex:0 0 auto;width:20px;height:20px;
  background-color:currentColor;
  -webkit-mask-position:center;mask-position:center;
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;
  -webkit-mask-size:contain;mask-size:contain;
}
.i-16{width:16px;height:16px}
.i-12{width:12px;height:12px}
.i-14{width:14px;height:14px}
.i-18{width:18px;height:18px}
.i-24{width:24px;height:24px}
.i-down{transform:rotate(90deg)}
.i-up{transform:rotate(-90deg)}
.i-left{transform:rotate(180deg)}

`;

let n = 0;
for (const f of files) {
  const name = path.basename(f, '.svg');
  if (COLOR_ICONS.has(name) || SKIP.test(f)) continue;
  const u = uri(fs.readFileSync(path.join(iconDir, f), 'utf8'));
  css += `.i-${name}{-webkit-mask-image:url("${u}");mask-image:url("${u}")}\n`;
  n++;
}

/* 컬러 아이콘은 mask 불가 → background 로 */
for (const name of COLOR_ICONS) {
  const p = path.join(iconDir, name + '.svg');
  if (!fs.existsSync(p)) continue;
  const u = uri(fs.readFileSync(p, 'utf8'));
  css += `\n/* 그라디언트 컬러 아이콘 : mask 불가 */\n`;
  css += `.i-${name}{display:inline-block;flex:0 0 auto;width:16px;height:16px;background:url("${u}") center/contain no-repeat}\n`;
  n++;
}

/* 별칭 — 마크업에서 쓰는 짧은 이름을 파일명에 연결.
   빠지면 mask 가 안 걸려 아이콘이 '단색 사각형'으로 보인다. */
const ALIAS = {
  hamburger: 'header-menu',   /* 윈도우 크롬 메뉴 버튼 = header_menu (3선) */
  winhome: 'header-home',     /* 윈도우 크롬 홈 버튼 = header_home (16px 아웃라인) */
  winmin: 'win-min',
  winmax: 'win-max',
  winclose: 'win-close',
  close: 'close-x',
  remove: 'chip-remove',
  chevrondown: 'chevron',
  trash: 'chip-remove'
};
css += `\n/* 별칭 */\n`;
for (const [alias, target] of Object.entries(ALIAS)) {
  const p = path.join(iconDir, target + '.svg');
  if (!fs.existsSync(p)) { console.warn('alias target missing:', target); continue; }
  const u = uri(fs.readFileSync(p, 'utf8'));
  css += `.i-${alias}{-webkit-mask-image:url("${u}");mask-image:url("${u}")}\n`;
}

fs.writeFileSync(outFile, css, 'utf8');
console.log(`wrote ${n} icons → ${outFile} (${(css.length / 1024).toFixed(1)} KB)`);
