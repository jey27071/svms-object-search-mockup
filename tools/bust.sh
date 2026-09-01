#!/bin/zsh
# 배포 전 에셋 캐시 버스터 갱신 — 브라우저가 옛 파일을 쓰지 않게 한다
cd "$(dirname "$0")/.."
V=$(date +%Y%m%d%H%M)
python3 - "$V" <<'PY'
import pathlib, sys, re
v = sys.argv[1]
p = pathlib.Path('index.html'); s = p.read_text(encoding='utf-8')
s = re.sub(r'(assets/(?:css|js)/[\w.-]+)(\?v=\d+)?', lambda m: f'{m.group(1)}?v={v}', s)
p.write_text(s, encoding='utf-8'); print('cache-bust', v)
PY
