# 핸드오프 — SVMS 대상 검색 HTML 워킹 목업

> 새 세션에서 이 문서 + 프로젝트 안의 `README.md` 두 개만 읽으면 바로 이어서 작업할 수 있다.
> 작성일 2026-08-25 · 이전 세션에서 Figma MCP 연동으로 작업했음.

---

## 📦 Git 저장소 (원본 위치)

| 항목 | 값 |
|---|---|
| 저장소 | **https://github.com/jey27071/svms-object-search-mockup** (Private) |
| 브랜치 | `main` |
| 클론 | `git clone https://github.com/jey27071/svms-object-search-mockup.git` |
| 로컬 경로(작업 PC · Windows) | `C:\Users\S-1\svms-object-search-mockup\` |
| 로컬 경로(맥북 · 2026-08-26~) | `~/svms-object-search-mockup` |

- `_shots/`(검증 캡처 82MB)와 `_backup_pre-gui/` 는 `.gitignore` 로 제외. 캡처는 언제든 재생성 가능
- **핸드오프 문서 2종은 저장소 안 `_handoff/` 에도 포함**되어 있다 → 클론하면 바로 읽을 수 있음
- ⚠️ **사내 프록시 주의(작업 PC 한정)** — `api.github.com` 차단(403)이라 `gh` CLI / REST API 사용 불가.
  `github.com` 으로의 git clone·push 는 정상. **저장소 생성 같은 API 작업은 브라우저로** 해야 한다.
  (OAuth device flow 도 502 로 막힘 → 인증은 **PAT를 remote URL에 넣어 푸시**하는 방식 사용)
- ✅ **맥북에서는 `gh` CLI 정상 동작.** 단 **clone 이 느리다(13MB에 10분 가까이)** —
  끊긴 게 아니니 타임아웃으로 죽이지 말고 백그라운드로 돌릴 것.

---

## 0. 30초 요약

- **위치**: 맥북 `~/svms-object-search-mockup` · 작업 PC `C:\Users\S-1\svms-object-search-mockup\`
- **실행**: `index.html` 을 브라우저로 그냥 열면 된다. **빌드·서버 불필요**(순수 HTML/CSS/JS, `file://` 로 동작)
- **정체**: 전자DS(에스원) 영상감시 고도화 과제의 **대상 검색 UI 워킹 목업**. 미팅에서 프로토타입 시연용
- **분량**: `index.html` ~37KB · `app.js` ~200KB(약 3,500줄) · `style.css` ~95KB · `data.js` ~38KB · 이미지 52장
- **가장 중요한 문서**: 프로젝트 안 **`README.md`** (구현 범위·딥링크 표·원본과 다르게 한 부분 전량 기재). 이 핸드오프는 그 위에 세션 연속성 정보를 더한 것

---

## 1. 폴더 구조

```
svms-object-search-mockup/
├─ index.html              앱 셸 + 워크스페이스 + 팝업 마크업
├─ README.md               ★ 구현 범위 · 딥링크 표 · 이탈 항목 · 함정 (최우선 참고)
├─ assets/
│  ├─ css/style.css        Figma 실추출 토큰(:root) + 전체 스타일
│  ├─ css/icons.css        아이콘(data URI mask). 생성기 build-icons.js
│  ├─ js/data.js           목업 데이터 (대상 35 / 인물 10 / 북마크 10 / 사건 4 / 맵 4 / 알림 6 / 관심인물 5 …)
│  ├─ js/app.js            전체 인터랙션 (상태 S, 탭, render, 딥링크 applyDemo/applyMenuDemo)
│  └─ img/                 Figma export 이미지 52장
├─ _spec/NEW-SCREENS-0824.md   신규 사양(북마크·사건관리·맵관리·알림·차량번호) 구현 지시서
├─ _shots/                 검증용 headless 캡처 (재생성 가능, 압축 시 제외해도 됨)
└─ _backup_pre-gui/        GUI 반영 전 백업
```

---

## 2. 구현 완료 범위

### 검색 화면
- 검색 모드 6종 — **AI 검색 / 텍스트 / 이미지 / 차량번호 / 등록인물 / 지능형 알고리즘**
- **텍스트 검색 자동완성**(입력창 통합 드롭다운, 최근 검색 행 + ✕, 선택 시 자동 검색)
- 필터 전량(유사도 슬라이더·위치 9개소·색상 상/하의·기간·차종) — **검색 실행 후에만 노출**
- 필터 Chip 생성/해제, 정렬 3종, **유사 대상별 보기**(그룹) 펼침/접기, 유사 대상 편집 + 대상 추가
- 경로 비교 선택(최대 4), 카드 1클릭→원본영상 스택, 더블클릭→새 탭, `⋮` 메뉴
- 이미지 업로드(실제 파일)→추출 팝업→검색, **인물 관리 CRUD**, 검색 히스토리
- AI 에이전트 대화 시퀀스, 패널 접기/분리 후 드래그, 탭 추가·닫기

### 상세 화면 (상세화면 WF_0805 전량)
단일 대상 상세 / 히트맵 / 이동경로(+객체별 동선) / CCTV 마커 / 멀티뷰 2×2 / 맵뷰어-cctv(FOV) /
**영역 검색 도형·선(영상 위 실제 드래그·클릭 드로잉)** / 주변 대상 선택 / 대상 그룹 상세 / 타임라인 수정 /
경로 비교 2·4 / 팝업 7종(맵뷰어 전체보기 A·B, 영상 조회, 이동경로, 관심인물 등록, 대상 추가, 사건 등록, 영상 북마크)

### 신규 메뉴 화면 (2026-08-24, UI사양서 85장 확장분)
- **북마크** — 목록(2열 카드)·영상 상세·**편집(구간 재설정·메모)**·대상 상세
- **사건 관리** — 목록(상태 정렬)·상세(**AI 생성 보고서**·대상 정보·증거 영상·이동 경로)·**편집** + 대상/영상 추가 팝업
- **맵 관리** — 목록·상세·**새 맵 등록**·수정 + **카메라 배치 드래그앤드롭**(`+`/드래그, 핀 이동, 라벨 ✕ 삭제)
- **알림** — 일자별 그룹·미확인 하이라이트·상세 + **관심 인물 관리 팝업 3상태**
- **Alert 8종** 공통화

### 레이아웃 (2026-08-24~25, GNB/LNB 개선)
- **A타입**: 좌측 LNB(검색·북마크·사건관리·맵관리) + 모드 칩 6종 + 탭바 콘텐츠 상단
- **B타입**: `AI 검색` 전용 입력 + `일반 검색` 칩 5종 + 헤더 브레드크럼, 검색 후 진입 블록 접힘
- **윈도우 크롬 우측 `A안 | B안` 스위치로 전환** (localStorage 저장)
- AI 에이전트 = 우측 상단 버튼 → **레이어 오버레이**(콘텐츠 축소 없음, B안 동작)
- 탭 디자인 GUI 정합(200×28, radius 0, 활성 `#24252C`/비활성 `#1C1D23`, ✕ hover 노출)
- AI 그라디언트 `linear-gradient(90deg,#1690e8 30%,#c452ec 52%,#f52f67 70%,#f89303 90%)`
- **인물 관리 팝업 GUI 정합 재작성** — 목록 2열 카드, 등록/상세/수정, 이미지 배지 **대표·얼굴·대상**

---

## 3. 검수 방법 — 딥링크

`index.html#demo=XXX` 로 특정 상태를 바로 연다. **전체 표는 README 참고.** 자주 쓰는 것:

| 값 | 화면 |
|---|---|
| `result` | 텍스트 검색 결과 30건 |
| `group` / `groupopen` | 유사 대상별 보기 / 그룹 펼침 |
| `autocomplete` | 텍스트 검색 자동완성 |
| `laya` / `layb` / `lybresult` | 레이아웃 A안 / B안 / B안+검색후 |
| `aim` / `aifloat` | AI 검색 모드 / AI 오버레이 |
| `detail` `heatmap` `path` `multi` `area` `cmp2` | 상세화면 변형들 |
| `bookmarks` `case` `caseedit` `map` `mapnew2` `alarm` `watchmgr` | 신규 메뉴 화면 |
| `personmgr` `pmnew0` `pmnew` `pmdetail` | 인물 관리 4상태 |
| `carresult` | 차량번호 검색 결과 |

---

## 4. ★ 작업 함정 (실제로 다 밟았음)

### 4-1. CSS 클래스 / 전역 식별자 충돌 — **가장 자주 터짐**
새 클래스를 추가하기 전 **반드시** `grep -nE '^\.클래스명' assets/css/style.css` 로 확인할 것.
| 충돌 | 증상 | 해결 |
|---|---|---|
| `.mv-head` (멀티뷰 타일, `position:absolute`) | 메뉴 화면 헤더가 창 최상단으로 튀어나감 | 메뉴 화면은 **`.mn-*`** 접두사 |
| `.rep` (유사 대상 대표 카드, `width:180px`) | AI 보고서 폭 붕괴 / 인물 썸네일 첫 칸만 크기 다름 | **`.csrep`**, **`.is-rep` / `.b-rep`** (같은 함정 **2회** 발생) |
| `CASES` / `CASE_KINDS` (사건 등록 팝업용 기존 존재) | `SyntaxError: already declared` | **`CASE_DB` / `CS_KINDS` / `CS_STATUS`** |

### 4-2. app.js 코드 삽입 위치
반드시 **`/* ===================== init ===================== */` 블록 앞**에 넣을 것.
뒤에 넣으면 init에서 참조하는 `const` 가 **TDZ 에러**로 죽는다(함수 선언은 호이스팅되지만 const는 아님).
실제 사례: `const AIM` 을 IIFE 뒤에 둬서 **스크립트 전체가 죽고 LNB가 렌더 안 됨**.

### 4-3. `.side-body` 는 가로 flex
구 아이콘 레일 구조라 `display:flex`(row). 세로로 쌓으려면 `flex-direction:column` 필요.
모르면 칩이 패널 본문을 밀어내 **본문이 사라진 것처럼** 보인다.

### 4-4. headless 캡처 (검증 필수)

**맥북**
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
  --window-size=1920,1041 \
  --screenshot=/Users/jey27071/svms-object-search-mockup/_shots/x.png \
  "file:///Users/jey27071/svms-object-search-mockup/index.html#demo=result"
```

**작업 PC (Windows)**
```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu \
  --window-size=1920,1080 \
  --screenshot=C:/Users/S-1/svms-object-search-mockup/_shots/x.png \
  "file:///C:/Users/S-1/svms-object-search-mockup/index.html#demo=result"
```
- `--screenshot` 경로는 **forward slash** (bash에서 백슬래시가 깨짐)
- **`--user-data-dir` 를 새로 만들면 첫 실행이 2분+ 걸려 타임아웃** → 옵션 아예 빼고 **1건씩** 실행
- 확대 확인은 `--force-device-scale-factor=2 --window-size=1400,300`
- 캡처 후 **반드시 Read로 열어 눈으로 확인**(레이아웃 깨짐·텍스트 잘림)

### 4-5. 값이 안 맞을 때는 추측 말고 측정
임시 probe를 app.js 끝에 붙여 `document.title` 에 `getBoundingClientRect`/`getComputedStyle` 결과를 넣고
`--dump-dom | grep -o "PROBE {.*}"` 로 읽는다. **AI 버튼 정렬 문제(`align-items:stretch`)와 `.rep` 충돌을 이 방법으로 잡았다.** 확인 후 probe 제거.

### 4-6. 셸 이스케이프
`node -e "..."` 안에서 `$$`, 백틱, `${}` 가 깨져 **엉뚱한 코드가 삽입된 적 있음**(`$$(...)` → `$(...)` 로 들어가 런타임 에러).
**여러 줄·특수문자 편집은 `node -e` 대신 Edit 도구를 쓸 것.**

---

## 5. 남은 작업

> 2026-08-26 갱신 — 모듈명 `동선 추적 검색` 변경 · **AI 유무 전환 스위치** 추가 ·
> GUI 실측 정합(레이아웃 골격/검색 패널) · 사양서 대조 반영 완료. 상세는 README 최상단 절 참고.

### 새로 생긴 항목
- **AI 에이전트 노출 3타입** — 시안 주석 기준 `A타입(우측 상단 팝업형)` /
  `B타입(레이어 오버레이, 콘텐츠 축소 없음)` / `C타입(AI 영역이 밀고 들어와 기존 영역 축소)`.
  현재 **B타입만** 구현. A·C 타입 미구현.
- 사양서 87장 중 **상세화면·팝업 장표 Description 전량 대조는 미완** (검색화면 위주로 반영함)

### 바로 구현 가능
1. **팝업 GUI 대조 잔여 3종** — `이미지 검색 팝업(002_2)`, `유사 대상 편집 팝업(005_5~7, 3프레임)`, `AI 에이전트(007_1~4)`
   → 인물 관리 팝업을 GUI 정합으로 재작성한 것과 같은 방식으로 진행
2. **B안 AI 에이전트 우측 상시 컬럼** — Btype 3번째 프레임처럼 오버레이가 아닌 상주 패널 버전
3. CCTV 영상이 정지 이미지로 대체되어 있음(의도)

### 사용자 결정 필요 (임의로 정하지 말 것)
| 항목 | 현재 | 필요한 결정 |
|---|---|---|
| 맵뷰어 전체보기 | A·B 둘 다 구현, 기본 B | 택안 |
| 영상 도구 아이콘 | WF 4개 vs 상태 5종 → CCTV·멀티뷰 분리해 6개 | 아이콘 정의 확정 |
| 관심인물 ↔ 등록인물 | 필드가 달라 별도 저장소 | 통합/분리 정책 |
| 위치 필터 | 9개소(사양서) / GUI는 7개소 | 기준 확정 |
| 0819 GUI 차분 | 레이아웃은 260824 A/B안이 대체 | 나머지 세부 반영 여부 |

---

## 6. 원본(Figma) 참조

> **맥북에서 Figma 읽는 법** — 공식 Figma MCP(`claude.ai Figma` 커넥터)를 쓴다.
> 인증이 풀려 있으면 대화형 세션에서 `/mcp` → `claude.ai Figma` → Authenticate.
> claude.ai 앱에서 커넥터를 붙인 것과 **Claude Code 인증은 별개**다.
> 로컬 `claude-in-figma` 플러그인 경로도 있으나, 서버가 포트 3055를 선점하는
> 다른 세션이 있으면 안 붙으니 주의.


| 용도 | 파일 / 섹션 |
|---|---|
| WF·UI사양서 | **`dUk79DU8nwk3afINPckgOI`** — 검색화면 WF `3183:61980` · 상세화면 WF `3428:24575` · **UI사양서 `3487:90267`(85장)** (page `[영상감시 솔루션 고도화]UI 사양서`) |
| GUI | **`Tnihi6lixRR47N4RSAwUbF`** (page `전자 DS 영상감시 솔루션 고도화 GUI`) — `대상검색_0819수정반영`(44프레임) · `대시보드 레이아웃 제안_260824`(Atype/Btype) |

⚠️ **GUI 파일 섹션은 편집 중이라 node-id가 수시로 바뀐다. 반드시 이름으로 찾을 것**
(실제로 작업 중 `4147:18405` → `4151:20270` 으로 변경돼 `null` 에러 발생)

**UI사양서 Description 추출법** — `findAll` 로는 인스턴스 내부 텍스트가 안 잡힘.
`use_figma` 로 **텍스트 노드를 수동 재귀 walk** 후 `absoluteBoundingBox` y,x 정렬.
장표 제목은 각 sheet의 `Title` 프레임에 `MENU Title or Location / <화면명> / … / Storyboard ID / <ID>` 형태로 있음.

---

## 7. 디자인 토큰 (style.css `:root`)

```
bg  0~3 : #0d0e12 / #131418 / #1c1d23 / #24252c
line    : #2e2f38 / #3e4049
text    : #ecedf0 / #b8babf / #8a8c96 / #55575f
primary : #3070d8
유사도  : High #3fbe7e · medium #e88038 · low #e8c048
AI grad : linear-gradient(90deg,#1690e8 30%,#c452ec 52%,#f52f67 70%,#f89303 90%)
font    : Pretendard (CDN) + Menlo(수치)
```
용어는 **`대상`** 체계 (대상 검색 / 유사 대상별 보기 / 대상 정보 / 대상유사도). `객체` 아님.

---

## 8. 새 세션 첫 프롬프트 예시

```
C:\Users\S-1\_handoff\SVMS-대상검색-목업-핸드오프.md 와
C:\Users\S-1\svms-object-search-mockup\README.md 를 읽고 이어서 진행해줘.
남은 작업 중 [유사 대상 편집 팝업 GUI 대조] 부터 해줘.
```

압축해서 옮길 때 `_shots/` 는 재생성 가능하므로 제외해도 된다(용량 대부분이 캡처 PNG).
