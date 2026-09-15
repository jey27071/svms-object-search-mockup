# 확인 스크립트 (Playwright · 실제 Chromium)

화면을 고친 뒤 **눈대중이 아니라 수치·캡처로** 확인할 때 쓴다. 2026-09-14~15 세션에서 쓰던 것을 보관.

## 실행
```bash
cd ~/svms-object-search-mockup
mkdir -p /tmp/svms-qa
node tools/qa/<스크립트>.js /tmp/svms-qa     # 두 번째 인자 = 캡처 저장 폴더
```
- Playwright 경로는 스크립트 안에 고정: `/usr/local/lib/node_modules/@playwright/cli/node_modules/playwright`
- 페이지는 `file:///Users/jey27071/svms-object-search-mockup/index.html` 을 직접 연다(서버 불필요)
- 3D(다층 뷰)를 볼 때는 `chromium.launch({ args: ['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'] })`

## 표준 진입 흐름 (거의 모든 스크립트 공통)
`[data-mode=text]` 클릭 → `#qText` 에 `흰색 옷` → `#btnSearchGo` → `#resultsBody [data-id]` 더블클릭
→ `#clipsBody [data-pick]` 3개 체크 → `#clipsGo` → 상세 화면

경로 비교는 `openCompareTab(ids, idx)` 전에 **`TL.show = new Set(...)` 을 먼저** 넣어야 타임라인 행이 모두 나온다.

## 스크립트
| 파일 | 확인하는 것 |
|---|---|
| capdt.js | 상세 탭 3개 열고 탭별 스타일(글자색·굵기·여백·✕·구분선) |
| capgap2.js | 탭 바 ↔ 영상 ↔ 재생 바 ↔ 타임라인 틈(y72~1040) — 상세·멀티 뷰·경로 비교 |
| capwheel2.js | 영상 휠 확대/축소 — 단일·멀티 뷰 2/3/4·경로 비교 2/3/4·비교 멀티 뷰 |
| caphdl3.js | 클립 편집 손잡이(틀 두께·흰 막대 3×24)·끝 손잡이 끌기→저장 활성 |
| capmix.js | 검색 초기화 검색어 비움·외부 지도 주변 카메라(개수·미리보기·영상 조회)·두 칸 지도 버튼·두 번째 칸 카메라 |
| capalign2.js | 검색 홈 칩 줄↔결과 머리 줄 중심·선택 요약 칩 정렬·히스토리 버튼 위치(창 폭별) |
| cap3s.js | 동시 포착(PIP) 위치 — 멀티 뷰 3분할·경로 비교 2/3명(칸 하단·영상 아래) |
| caph3.js | 검색 홈 한 장 카드·탭 140×28·모서리 6 (패널 열림/접힘·원본 영상 유무·상세 영향 없음) |
| cap9.js | 경로 비교 2·3·4명 칸·호버 ⊗·비활성 칸 |
| capmapv.js / capdual.js | 맵 뷰 머리 줄·외부 구역·지도 두 칸 재현 |
| cap8.js / cap10c.js | 영상 위치 전환(분할 칸) / 이동경로 리스트·경로 비교 추가 팝업·3D 툴팁 |

## 자주 걸리는 함정
- 토스트가 캡처를 가린다 → `document.querySelector('#toast').hidden = true`
- 모달 뒤 `#overlay` 가 클릭을 막는다 → `closeModal('#mdXxx')` 후 `#overlay.hidden = true`
- `[data-tlvedit]` 는 화면에 2개(상세·비교) — `#dtTl [data-tlvedit]` / `#cmpTl [data-tlvedit]` 로 지정
- `locator('.acc-head .acc-sum')` 처럼 여러 개 잡히면 strict 오류 → `.first()`
