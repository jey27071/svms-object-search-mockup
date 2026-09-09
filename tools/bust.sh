#!/bin/zsh
# 배포 전 에셋 캐시 버스터 갱신 — 브라우저가 옛 파일을 쓰지 않게 한다
cd "$(dirname "$0")/.."
V=$(date +%Y%m%d%H%M)
python3 - "$V" <<'PY'
import pathlib, sys, re
v = sys.argv[1]
p = pathlib.Path('index.html'); s = p.read_text(encoding='utf-8')
s = re.sub(r'(assets/(?:css|js)/[\w.-]+)(\?v=\d+)?', lambda m: f'{m.group(1)}?v={v}', s)
p.write_text(s, encoding='utf-8')

# 이미지도 함께 — JS 가 만드는 경로라 IMG_V 상수를 갱신한다
d = pathlib.Path('assets/js/data.js'); t = d.read_text(encoding='utf-8')
t2 = re.sub(r"const IMG_V = '\d+';", f"const IMG_V = '{v}';", t)
if t2 != t: d.write_text(t2, encoding='utf-8')

# 마크업에 직접 박힌 이미지 경로도
h = pathlib.Path('index.html'); u = h.read_text(encoding='utf-8')
u2 = re.sub(r'(assets/img/[\w.-]+\.(?:png|jpg|svg))(\?v=\d+)?', lambda m: f'{m.group(1)}?v={v}', u)
if u2 != u: h.write_text(u2, encoding='utf-8')
# app.js 안에 직접 박힌 이미지 경로도
a = pathlib.Path('assets/js/app.js'); j = a.read_text(encoding='utf-8')
j2 = re.sub(r'(assets/img/[\w.-]+\.(?:png|jpg|svg))(\?v=\d+)?', lambda m: f'{m.group(1)}?v={v}', j)
if j2 != j: a.write_text(j2, encoding='utf-8')

print('cache-bust', v)
PY
