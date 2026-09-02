/* ============================================================
   SVMS 대상 검색 — Mock Data
   UI사양서_0807 (Search main_000 ~ 007) 기준
   ============================================================ */

const IMG = n => `assets/img/${n}.png`;

/* 카메라 — 사양서 필터 트리 9개소 */
const CAMERAS = [
  'B1 주차장', 'B1 입구', 'B1 엘리베이터', '1층 로비', '2층 통로',
  '3층 매장', '외부 CCTV'
];

/* 색상 팔레트 — Figma 원본 값 */
const COLORS = [
  { k: 'white',  hex: '#fefefe', label: '흰색' },
  { k: 'gray',   hex: '#e2e4e5', label: '회색' },
  { k: 'black',  hex: '#24262a', label: '검정' },
  { k: 'brown',  hex: '#af7500', label: '갈색' },
  { k: 'red',    hex: '#ff253d', label: '빨강' },
  { k: 'orange', hex: '#ffab00', label: '주황' },
  { k: 'yellow', hex: '#ffdf00', label: '노랑' },
  { k: 'blue',   hex: '#007cff', label: '파랑' },
  { k: 'green',  hex: '#00d665', label: '초록' },
  { k: 'purple', hex: '#b457ec', label: '보라' },
  { k: 'pink',   hex: '#ffdcdf', label: '분홍' }
];

/* 지능형 알고리즘 10종 */
const ALGOS = ['침입', '배회', '쓰러짐', '가상펜스', '지게차 감지', '흡연', '불법주차', '싸움', '위험구역 접근', '안전모 미착용'];

/* ---------------- 검색 결과 데이터셋 (텍스트/이미지/인물/지능형 공용) --------------- */
/* group: c1 = 유사 대상 후보 1, c2 = 후보 2, etc = 기타 유사 대상 */
const OBJECTS = [
  /* --- 유사 대상 후보 1 : 검정 상의 배송기사 (10건 / 평균 98%) --- */
  { id: 'o01', img: IMG('obj01'), sim: 98, cam: 'B1 주차장',     t: '2026-06-30 14:52:03', group: 'c1', type: '인물', sex: '남성', top: 'black', bottom: 'black' },
  { id: 'o02', img: IMG('obj12'), sim: 96, cam: '3층 매장',  t: '2026-06-30 14:48:11', group: 'c1', type: '인물', sex: '남성', top: 'black', bottom: 'black' },
  { id: 'o03', img: IMG('obj13'), sim: 95, cam: 'B1 엘리베이터', t: '2026-06-30 14:45:32', group: 'c1', type: '인물', sex: '남성', top: 'black', bottom: 'black' },
  { id: 'o04', img: IMG('obj14'), sim: 94, cam: 'B1 주차장',     t: '2026-06-30 14:41:07', group: 'c1', type: '인물', sex: '남성', top: 'black', bottom: 'black' },
  { id: 'o05', img: IMG('obj18'), sim: 92, cam: '2층 통로',      t: '2026-06-30 14:38:55', group: 'c1', type: '인물', sex: '남성', top: 'black', bottom: 'black' },
  { id: 'o06', img: IMG('obj20'), sim: 90, cam: 'B1 입구',       t: '2026-06-30 14:35:20', group: 'c1', type: '인물', sex: '남성', top: 'black', bottom: 'black' },
  { id: 'o07', img: IMG('obj23'), sim: 88, cam: '외부 CCTV',   t: '2026-06-30 14:31:46', group: 'c1', type: '인물', sex: '남성', top: 'black', bottom: 'black' },
  { id: 'o08', img: IMG('obj24'), sim: 86, cam: 'B1 주차장',     t: '2026-06-30 14:28:02', group: 'c1', type: '인물', sex: '남성', top: 'black', bottom: 'black' },
  { id: 'o09', img: IMG('obj25'), sim: 85, cam: '외부 CCTV',   t: '2026-06-30 14:24:18', group: 'c1', type: '인물', sex: '남성', top: 'black', bottom: 'black' },
  { id: 'o10', img: IMG('obj31'), sim: 84, cam: '3층 매장',  t: '2026-06-30 14:20:44', group: 'c1', type: '인물', sex: '남성', top: 'black', bottom: 'blue'  },

  /* --- 유사 대상 후보 2 : 흰색 상의 남성 (5건 / 평균 91%) --- */
  { id: 'o11', img: IMG('obj07'), sim: 94, cam: 'B1 주차장',     t: '2026-06-30 13:22:10', group: 'c2', type: '인물', sex: '여성', top: 'white', bottom: 'gray'  },
  { id: 'o12', img: IMG('obj09'), sim: 94, cam: 'B1 주차장',     t: '2026-06-30 13:19:37', group: 'c2', type: '인물', sex: '여성', top: 'white', bottom: 'gray'  },
  { id: 'o13', img: IMG('obj04'), sim: 93, cam: '1층 로비',      t: '2026-06-29 13:15:02', group: 'c2', type: '인물', sex: '여성', top: 'white', bottom: 'black' },
  { id: 'o14', img: IMG('obj05'), sim: 92, cam: '2층 통로',      t: '2026-06-29 13:11:48', group: 'c2', type: '인물', sex: '여성', top: 'white', bottom: 'black' },
  { id: 'o15', img: IMG('obj29'), sim: 82, cam: 'B1 엘리베이터', t: '2026-06-29 13:06:25', group: 'c2', type: '인물', sex: '여성', top: 'white', bottom: 'black' },

  /* --- 기타 유사 대상 (15건) --- */
  { id: 'o16', img: IMG('obj02'), sim: 93, cam: '외부 CCTV',   t: '2026-06-29 12:58:31', group: 'etc', type: '인물', sex: '여성', top: 'green',  bottom: 'black' },
  { id: 'o17', img: IMG('obj03'), sim: 90, cam: '외부 CCTV',   t: '2026-06-29 12:51:19', group: 'etc', type: '인물', sex: '남성', top: 'gray',   bottom: 'black' },
  { id: 'o18', img: IMG('obj06'), sim: 88, cam: '외부 CCTV',   t: '2026-06-29 12:44:07', group: 'etc', type: '인물', sex: '여성', top: 'green',  bottom: 'black' },
  { id: 'o19', img: IMG('obj08'), sim: 87, cam: 'B1 주차장',     t: '2026-06-29 12:38:52', group: 'etc', type: '인물', sex: '남성', top: 'blue',   bottom: 'blue'  },
  { id: 'o20', img: IMG('obj10'), sim: 86, cam: '3층 매장',  t: '2026-06-29 12:31:40', group: 'etc', type: '인물', sex: '여성', top: 'black',  bottom: 'black' },
  { id: 'o21', img: IMG('obj11'), sim: 85, cam: 'B1 입구',       t: '2026-06-29 12:25:14', group: 'etc', type: '인물', sex: '남성', top: 'blue',   bottom: 'blue'  },
  { id: 'o22', img: IMG('obj15'), sim: 84, cam: '2층 통로',      t: '2026-06-29 12:18:03', group: 'etc', type: '인물', sex: '여성', top: 'blue',   bottom: 'black' },
  { id: 'o23', img: IMG('obj16'), sim: 82, cam: '외부 CCTV',   t: '2026-06-29 12:09:47', group: 'etc', type: '인물', sex: '남성', top: 'green',  bottom: 'black' },
  { id: 'o24', img: IMG('obj17'), sim: 80, cam: '외부 CCTV',   t: '2026-06-29 12:02:35', group: 'etc', type: '인물', sex: '여성', top: 'green',  bottom: 'black' },
  { id: 'o25', img: IMG('obj19'), sim: 84, cam: '3층 매장',  t: '2026-06-28 11:55:22', group: 'etc', type: '인물', sex: '남성', top: 'gray',   bottom: 'black' },
  { id: 'o26', img: IMG('obj21'), sim: 83, cam: 'B1 주차장',     t: '2026-06-28 11:47:09', group: 'etc', type: '인물', sex: '여성', top: 'blue',   bottom: 'blue'  },
  { id: 'o27', img: IMG('obj22'), sim: 82, cam: '1층 로비',      t: '2026-06-28 11:39:56', group: 'etc', type: '인물', sex: '남성', top: 'brown',  bottom: 'black' },
  { id: 'o28', img: IMG('obj26'), sim: 81, cam: 'B1 엘리베이터', t: '2026-06-28 11:31:44', group: 'etc', type: '인물', sex: '여성', top: 'black',  bottom: 'black' },
  { id: 'o29', img: IMG('obj27'), sim: 80, cam: '외부 CCTV',   t: '2026-06-28 11:24:31', group: 'etc', type: '인물', sex: '남성', top: 'brown',  bottom: 'black' },
  { id: 'o30', img: IMG('obj28'), sim: 80, cam: 'B1 주차장',     t: '2026-06-28 11:16:18', group: 'etc', type: '인물', sex: '여성', top: 'black',  bottom: 'black' },

  /* --- 유사도 80% 미만 : 기본 검색에서는 제외, '모든 결과 출력' 시 노출 --- */
  { id: 'o31', img: IMG('obj30'), sim: 78, cam: 'B1 엘리베이터', t: '2026-06-28 10:58:04', group: 'etc', type: '인물', sex: '남성', top: 'black',  bottom: 'black' },
  { id: 'o32', img: IMG('ai03'),  sim: 75, cam: '1층 로비',      t: '2026-06-28 10:44:51', group: 'etc', type: '인물', sex: '여성', top: 'black',  bottom: 'black' },
  { id: 'o33', img: IMG('ai10'),  sim: 72, cam: '2층 통로',      t: '2026-06-28 10:31:38', group: 'etc', type: '인물', sex: '남성', top: 'black',  bottom: 'black' },
  { id: 'o34', img: IMG('ai11'),  sim: 68, cam: '외부 CCTV',   t: '2026-06-28 10:18:25', group: 'etc', type: '인물', sex: '여성', top: 'blue',   bottom: 'blue'  },
  { id: 'o35', img: IMG('ai13'),  sim: 60, cam: '외부 CCTV',   t: '2026-06-28 10:05:12', group: 'etc', type: '인물', sex: '남성', top: 'blue',   bottom: 'blue'  }
];

/* 그룹 메타 */
const GROUPS = [
  { key: 'c1',  name: '유사 대상 후보 1', label: '인물 A' },
  { key: 'c2',  name: '유사 대상 후보 2', label: '인물 B' },
  { key: 'etc', name: '기타 유사 대상',   label: null }
];

/* ---------------- 등록 인물 ---------------- */
const PERSONS = [
  { id: 'p1',  name: '김보안', guid: '909854931029', desc: '통합플랫폼 개발팀 · 사원증 미착용 이력', reg: '2026-06-12 09:12', imgs: [IMG('ai02'), IMG('ai06')] },
  { id: 'p2',  name: '이지훈', guid: '909854931030', desc: '통합플랫폼 개발팀 · 협력사 상주',       reg: '2026-06-12 10:40', imgs: [IMG('ai06')] },
  { id: 'p3',  name: '박수민', guid: '909854931031', desc: '운영팀 · 야간 출입 대상',               reg: '2026-06-13 14:02', imgs: [IMG('ai01')] },
  { id: 'p4',  name: '최영은', guid: '909854931032', desc: '고객지원팀 · 방문객 응대',             reg: '2026-06-15 11:25', imgs: [IMG('ai09')] },
  { id: 'p5',  name: '정한결', guid: '909854931033', desc: '시설팀 · B1 상시 출입',                reg: '2026-06-16 08:55', imgs: [IMG('ai05')] },
  { id: 'p6',  name: '한도윤', guid: '909854931034', desc: '보안팀 · 관제 근무자',                 reg: '2026-06-18 16:31', imgs: [IMG('ai07')] },
  { id: 'p7',  name: '오세라', guid: '909854931035', desc: '총무팀 · 방문 차량 등록 담당',          reg: '2026-06-20 13:47', imgs: [IMG('ai12')] },
  { id: 'p8',  name: '윤재호', guid: '909854931036', desc: '물류팀 · 배송 협력사',                 reg: '2026-06-22 09:03', imgs: [IMG('ai14')] },
  { id: 'p9',  name: '서민지', guid: '909854931037', desc: '개발팀 · 3층 매장 상주',           reg: '2026-06-24 17:19', imgs: [IMG('ai03')] },
  { id: 'p10', name: '강태윤', guid: '909854931038', desc: '외주 인력 · 임시 출입증',              reg: '2026-06-26 10:58', imgs: [IMG('ai11')] }
];

/* ---------------- 이미지 검색 : 자동 추출 대상 ---------------- */
const EXTRACTED = [
  { id: 'x1', img: IMG('obj01'), type: 'object', box: { x: 40, y: 26, w: 22, h: 52 } },
  { id: 'x2', img: IMG('obj12'), type: 'object', box: { x: 36, y: 58, w: 26, h: 30 } },
  { id: 'x3', img: IMG('ai02'),  type: 'face',   box: { x: 46, y: 21, w: 9,  h: 12 } },
  { id: 'x4', img: IMG('obj23'), type: 'object', box: { x: 34, y: 40, w: 15, h: 26 } },
  { id: 'x5', img: IMG('ai06'),  type: 'face',   box: { x: 56, y: 30, w: 8,  h: 11 } }
];

/* ---------------- AI 에이전트 ---------------- */
const AI_SUGGESTIONS = [
  '유모차를 동반한 보행자 최근 위치 확인',
  '최근 1시간 내 구역 내 쓰러짐 발생 건 검색',
  '로비에서 나간 후 주차장으로 이동한 인물 검색'
];

const AI_RESULT = [
  { id: 'a1', img: IMG('ai05'), sim: 94, cam: 'B1 주차장', t: '2026-06-30 14:02:11', type: '인물' },
  { id: 'a2', img: IMG('ai01'), sim: 90, cam: 'B1 주차장', t: '2026-06-30 14:05:37', type: '인물' },
  { id: 'a3', img: IMG('ai06'), sim: 85, cam: '1층 로비',  t: '2026-06-30 14:08:02', type: '인물' },
  { id: 'a4', img: IMG('ai09'), sim: 68, cam: 'B1 주차장', t: '2026-06-30 15:03:44', type: '인물' },
  { id: 'a5', img: IMG('ai12'), sim: 60, cam: 'B1 주차장', t: '2026-06-30 16:04:29', type: '인물' }
];

const AI_ANSWER = {
  head: '오늘 (2026-06-30) 기준 로비에서 주차장으로 이동한 인물이 총 5명 확인되었습니다.',
  items: [
    '<b>[후보 1]</b> 14:02 / 남성 / 회색 상의, 검정 하의, 여행용 캐리어',
    '<b>[후보 2]</b> 14:05 / 여성 / 베이지색 상의, 숄더백',
    '<b>[후보 3]</b> 14:08 / 남성 / 검정 상의',
    '<b>[후보 4]</b> 15:03 / 여성 / 검정 상의, 대형 상자 소지',
    '<b>[후보 5]</b> 16:04 / 여성 / 검정 상의, 숄더백'
  ],
  follow: ['회색 상의에 캐리어 들고 있는 사람으로 좁혀줘.', '최근 1시간 내 이동한 사람으로 좁혀줘.']
};

const AI_RECENT = [
  { id: 'r1', title: '로비 → 주차장 이동 인물 추적', date: '2026-06-30', pinned: true },
  { id: 'r2', title: '검정 모자 배송기사 동선 확인',   date: '2026-06-29', pinned: false },
  { id: 'r3', title: 'B1 엘리베이터 배회 인물 조회',   date: '2026-06-27', pinned: false },
  { id: 'r4', title: '외부 CCTV 불법주차 차량 검색',   date: '2026-06-24', pinned: false },
  { id: 'r5', title: '3층 매장 안전모 미착용 이벤트',  date: '2026-06-18', pinned: false }
];

/* ---------------- 검색 히스토리 ---------------- */
const HISTORY = [
  {
    date: '2026-06-30', items: [
      { q: '검정색 모자를 쓴 배송기사', n: 30, sub: [
        { q: '↳ 인물 A 동일 대상 추적', n: 10 },
        { q: '↳ B1 엘리베이터 구간 재검색', n: 4 }
      ] },
      { q: '로비에서 나간 후 주차장으로 이동한 인물', n: 5, ai: true, sub: [] }
    ]
  },
  {
    date: '2026-06-28', items: [
      { q: '흰색 티셔츠 남성', n: 12, sub: [] },
      { q: '차량번호 12가 3456', n: 3, sub: [] }
    ]
  },
  {
    date: '2026-06-25', items: [
      { q: '지게차 감지 · 안전모 미착용', n: 8, sub: [] }
    ]
  }
];

/* ============================================================
   상세화면 WF_0805 — 화면 변형 · 팝업용 데이터
   섹션 3428:24575 (78 프레임) 근거
   ============================================================ */

/* 비교 슬롯 색상 — WF 대상 4개 화면의 A/B/C/D 배지 색 */
const CMP_SLOTS = [
  { k: 'A', label: '인물 A', color: '#0099ff' },
  { k: 'B', label: '인물 B', color: '#ff2ec4' },
  { k: 'C', label: '인물 C', color: '#ffab00' },
  { k: 'D', label: '인물 D', color: '#00d665' }
];

/* 영상 위 이동경로 오버레이 — 좌표는 % (마지막 점이 화살촉) */
const PATH_LINES = [
  { color: '#ff253d', pts: [[69, 27], [75, 24], [80, 25], [85, 29]] },
  { color: '#0099ff', pts: [[85, 31], [78, 44], [68, 62], [58, 80]] },
  { color: '#ffab00', pts: [[40, 80], [45, 63], [45, 50], [33, 41]] },
  { color: '#31c9f5', pts: [[22, 89], [30, 71], [34, 57], [31, 45]] }
];

/* 비교 화면 슬롯별 원본 프레임 (썸네일 크롭이 아닌 전체 화면) */
const SLOT_STILLS = [IMG('video'), IMG('cam3'), IMG('cam2'), IMG('cam4')];

/* 대상별 동선 패널 — 영상 우측 상단 버튼으로 열림 */
const PATH_OBJECTS = [
  { id: 'pt1', img: IMG('obj01'), sex: '남성', t: '2026-06-29 오후 14:52:03', top: 'black',  bottom: 'black' },
  { id: 'pt2', img: IMG('ai09'),  sex: '남성', t: '2026-06-29 오후 14:52:03', top: 'brown',  bottom: 'gray'  },
  { id: 'pt3', img: IMG('obj04'), sex: '남성', t: '2026-06-29 오후 14:52:03', top: 'black',  bottom: 'gray'  },
  { id: 'pt4', img: IMG('ai12'),  sex: '남성', t: '2026-06-29 오후 14:52:03', top: 'white',  bottom: 'black' }
];

/* 영상 위 CCTV 마커 (%) — hover 시 썸네일 popover */
const VIDEO_CCTV = [
  { x: 11.5, y: 15,   cam: '1F 메인 복도 강당 입구', img: IMG('cam2') },
  { x: 38.5, y: 11.5, cam: '1F 화장실 복도',         img: IMG('nb1')  },
  { x: 59.5, y: 15,   cam: '1F 메인 홀',             img: IMG('nb2')  },
  { x: 58.5, y: 75,   cam: '1F 출구 앞',             img: IMG('cam2') }
];

/* 맵뷰어 CCTV FOV 콘 (%) — deg = 콘이 향하는 방향 */
const MAP_CCTV = [
  { x: 22, y: 46, deg: 210, cam: '38-1F EV홀',    img: IMG('cam2') },
  { x: 31, y: 42, deg: 250, cam: '1F 메인 복도',  img: IMG('video') },
  { x: 44, y: 40, deg: 160, cam: '1F 화장실 복도', img: IMG('nb1') },
  { x: 55, y: 39, deg: 200, cam: '1F 메인 홀',    img: IMG('nb2') },
  { x: 66, y: 43, deg: 240, cam: '1F 출구 앞',    img: IMG('cam2') },
  { x: 78, y: 41, deg: 280, cam: '2F 통로',       img: IMG('video') },
  { x: 27, y: 62, deg: 320, cam: 'B1 창고 앞',    img: IMG('nb1') },
  { x: 40, y: 66, deg: 20,  cam: 'B1 엘리베이터',  img: IMG('nb2') },
  { x: 63, y: 64, deg: 60,  cam: 'B1 주차장',     img: IMG('cam2') },
  { x: 82, y: 60, deg: 120, cam: '외부 CCTV',   img: IMG('video') }
];

/* 멀티뷰 — 주변 카메라 2×2 타일 */
const MULTI_TILES = [
  { cam: '1F 메인 복도', img: IMG('video'), fixed: true, boxes: [
      { label: '인물 A', slot: 'A', x: 52, y: 14, w: 12, h: 52 },
      { label: '인물 B', slot: 'B', x: 53.5, y: 4, w: 5, h: 14 }] },
  { cam: '1F 화장실 복도', img: IMG('cam3'), boxes: [
      { label: '인물 B', slot: 'B', x: 56, y: 18, w: 16, h: 66 }] },
  { cam: '1F 메인 홀', img: IMG('cam2'), boxes: [
      { label: '인물 A', slot: 'A', x: 48, y: 22, w: 20, h: 70 },
      { label: '인물 B', slot: 'B', x: 24, y: 10, w: 14, h: 52 }] },
  { cam: '1F 출구 앞', img: IMG('cam4'), boxes: [
      { label: '인물 B', slot: 'B', x: 15, y: 12, w: 11, h: 46 }] }
];

/* 이동경로 waypoint — 맵뷰어 경로 패널 / 전체보기 팝업 / 비교 화면 공용 */
const MOVE_PATHS = [
  { slot: 'A', label: '인물 A', pts: [
      { n: 1, cam: '1F 메인 복도',   t: '00:20', code: 'CAM-B01', x: 31, y: 46, hh: 0.4,  img: IMG('nb1')  },
      { n: 2, cam: 'B1 창고 앞',     t: '00:20', code: 'CAM-B01', x: 46, y: 33, hh: 2.6,  img: IMG('obj12') },
      { n: 3, cam: '3층 화장실',     t: '00:20', code: 'CAM-B01', x: 62, y: 26, hh: 9.4,  img: IMG('obj13') },
      { n: 4, cam: 'B1 엘리베이터',  t: '00:30', code: 'CAM-B02', x: 44, y: 44, hh: 11.6, img: IMG('obj18') },
      { n: 5, cam: '3F 주차장 출구', t: '00:40', code: 'CAM-B03', x: 33, y: 51, hh: 13.8, img: IMG('obj20') },
      { n: 6, cam: '외부 CCTV',    t: '00:50', code: 'CAM-EXT1', x: 21, y: 54, hh: 20.2, img: IMG('obj23') }] },
  { slot: 'B', label: '인물 B', pts: [
      { n: 1, cam: '1F 메인 복도',  t: '00:20', code: 'CAM-B01', x: 34, y: 46, hh: 0.4,  img: IMG('ai09') },
      { n: 2, cam: 'B1 창고 앞',    t: '00:22', code: 'CAM-B01', x: 55, y: 57, hh: 5.6,  img: IMG('ai12') },
      { n: 3, cam: '3층 화장실',    t: '00:35', code: 'CAM-B01', x: 18, y: 63, hh: 16.2, img: IMG('ai05') },
      { n: 4, cam: '3층 로비',      t: '00:35', code: 'CAM-B01', x: 12, y: 58, hh: 18.4, img: IMG('ai01') }] },
  { slot: 'C', label: '인물 C', pts: [
      { n: 1, cam: 'B1 엘리베이터', t: '00:24', code: 'CAM-B02', x: 40, y: 66, hh: 4.2,  img: IMG('obj07') },
      { n: 2, cam: 'B1 주차장',     t: '00:41', code: 'CAM-B04', x: 63, y: 64, hh: 8.8,  img: IMG('obj09') }] },
  { slot: 'D', label: '인물 D', pts: [
      { n: 1, cam: '2층 통로',      t: '01:02', code: 'CAM-C01', x: 72, y: 34, hh: 13.2, img: IMG('obj05') },
      { n: 2, cam: '3층 매장',  t: '01:15', code: 'CAM-C02', x: 84, y: 44, hh: 15.4, img: IMG('obj10') },
      { n: 3, cam: '외부 CCTV',   t: '01:28', code: 'CAM-EXT2', x: 88, y: 56, hh: 17.6, img: IMG('obj16') }] }
];

/* 그룹 상세 · 비교 화면 탐지 이력 세그먼트 (%) */
const HIST_LANES = {
  A: [{ n: 1, x: 0.5, w: 11 }, { n: 2, x: 32, w: 8 }, { n: 3, x: 53, w: 7 }, { n: 4, x: 78, w: 6 }, { n: 5, x: 89, w: 4 }, { n: 6, x: 94, w: 4 }],
  B: [{ n: 1, x: 4, w: 16 }, { n: 2, x: 21, w: 6 }, { n: 3, x: 40, w: 5 }, { n: 4, x: 46, w: 6 }],
  C: [{ n: 1, x: 16, w: 14 }, { n: 2, x: 31, w: 6 }],
  D: [{ n: 1, x: 57, w: 9 }, { n: 2, x: 68, w: 5 }, { n: 3, x: 75, w: 6 }]
};

/* 대상 그룹 상세 — 클립 6건 */
const GROUP_CLIPS = [
  { id: 'g1', img: IMG('video'),  cam: '1F 메인 복도',  n: 4, t: '08:24:12' },
  { id: 'g2', img: IMG('obj12'),  cam: 'B1 창고 앞',    n: 2, t: '09:12:40' },
  { id: 'g3', img: IMG('obj04'),  cam: '3층 화장실',    n: 3, t: '10:38:05' },
  { id: 'g4', img: IMG('obj18'),  cam: 'B1 엘리베이터', n: 1, t: '12:04:51' },
  { id: 'g5', img: IMG('obj25'),  cam: '3F 주차장 출구', n: 2, t: '17:20:33' },
  { id: 'g6', img: IMG('obj23'),  cam: '외부 CCTV',   n: 1, t: '21:47:19' }
];

/* 주변 대상 — 상세 우측 패널 */
const NEAR_OBJECTS = [
  { id: 'n1', name: '인물 B', slot: 'B', n: 7, img: IMG('nb1'), t: '2026-01-15 14:20', cam: 'B1 창고 앞',    sim: 92, event: '이동/계수', top: 'white', bottom: 'black' },
  { id: 'n2', name: '인물 C', slot: 'C', n: 7, img: IMG('nb2'), t: '2026-01-15 14:20', cam: 'B1 창고 앞',    sim: 98, event: '침입',      top: 'blue',  bottom: 'black' },
  { id: 'n3', name: '차량 A', slot: 'D', n: 3, img: IMG('cam2'), t: '2026-01-15 14:20', cam: 'B1 주차장',    sim: 90, event: '불법주차',  top: 'gray',  bottom: 'gray'  }
];

/* 영역 검색 결과 (도형·선을 그린 뒤 주변 대상로 노출) */
const AREA_HITS = [
  { id: 'a1', name: '인물 C', slot: 'C', n: 7, img: IMG('obj29'), t: '2026-01-15 14:20', cam: '1F 메인 복도', sim: 94, event: '이동/계수', top: 'white', bottom: 'black' },
  { id: 'a2', name: '인물 C', slot: 'C', n: 7, img: IMG('obj31'), t: '2026-01-15 14:20', cam: '1F 메인 복도', sim: 91, event: '이동/계수', top: 'white', bottom: 'black' }
];

/* 비교 대상 추가 팝업 — 후보 풀 10건 */
const CMP_POOL = [
  { id: 'c01', img: IMG('ai05'), name: '인물 C', n: 7, sim: 94, cam: 'B1 엘리베이터', t: '2026-06-30 14:52:03', src: '공통' },
  { id: 'c02', img: IMG('ai01'), name: '인물 C', n: 7, sim: 94, cam: 'B1 엘리베이터', t: '2026-06-30 14:52:03', src: '공통' },
  { id: 'c03', img: IMG('ai06'), name: '인물 C', n: 7, sim: 94, cam: 'B1 엘리베이터', t: '2026-06-30 14:52:03', src: '공통' },
  { id: 'c04', img: IMG('ai07'), name: '인물 C', n: 7, sim: 93, cam: '1F 메인 홀',    t: '2026-06-30 14:48:11', src: '인물 A' },
  { id: 'c05', img: IMG('ai02'), name: '인물 C', n: 7, sim: 92, cam: '3층 매장',  t: '2026-06-30 14:45:32', src: '인물 B' },
  { id: 'c06', img: IMG('ai03'), name: '인물 C', n: 7, sim: 91, cam: '2층 통로',      t: '2026-06-30 14:41:07', src: '인물 B' },
  { id: 'c07', img: IMG('ai10'), name: '인물 C', n: 7, sim: 90, cam: 'B1 입구',       t: '2026-06-30 14:38:55', src: '인물 B' },
  { id: 'c08', img: IMG('ai11'), name: '인물 C', n: 7, sim: 88, cam: '외부 CCTV',   t: '2026-06-30 14:35:20', src: '인물 B' },
  { id: 'c09', img: IMG('ai13'), name: '인물 C', n: 7, sim: 86, cam: 'B1 주차장',     t: '2026-06-30 14:31:46', src: '인물 B' },
  { id: 'c10', img: IMG('ai14'), name: '인물 C', n: 7, sim: 85, cam: '1층 로비',      t: '2026-06-30 14:28:02', src: '인물 B' }
];

/* 사건 등록 팝업 */
const CASE_STATES  = ['처리전', '진행중', '처리 완료'];
const CASE_KINDS   = ['도난', '침입', '기물파손', '분실물', '안전', '기타'];
const CASES = [
  { id: 'cs1', name: '배송 지연 문제',   state: '처리전', objs: 1, vids: 2, from: '2026-06-02 00:00:00', to: '2026-06-02 12:00:00' },
  { id: 'cs2', name: '택배 도난 의심',   state: '진행중', objs: 2, vids: 6, from: '2026-06-28 09:00:00', to: '2026-06-28 18:00:00' },
  { id: 'cs3', name: '주차장 기물 파손', state: '진행중', objs: 2, vids: 6, from: '2026-06-25 21:00:00', to: '2026-06-26 03:00:00' },
  { id: 'cs4', name: 'B1 무단 출입',     state: '처리완료', objs: 3, vids: 9, from: '2026-06-19 02:00:00', to: '2026-06-19 05:00:00' },
  { id: 'cs5', name: '3층 안전모 미착용', state: '보류',   objs: 1, vids: 4, from: '2026-06-18 13:00:00', to: '2026-06-18 17:00:00' }
];

/* 관심인물 등록 팝업 */
const WATCH_CLASSES = ['용의자', '침입자', '실종 · 보호대상', 'VIP', '기타'];
const WATCH_TERMS   = ['30일 (기본)', '7일', '90일', '180일', '무기한'];
const WATCH_IMGS    = [IMG('obj01'), IMG('obj12'), IMG('obj13'), IMG('obj18'), IMG('obj20'), IMG('obj23')];

/* ============================================================
   북마크 (UI사양서_0807 확장분 — Bookmark_001_01 / _02)
   kind: 'video' = 영상 북마크 / 'object' = 대상 북마크
   reg  = 북마크 등록 일시 (목록 정렬 기준, 최신순)
   range= 저장 구간 [left%, width%] — 타임라인 11:00~17:00 기준
   ============================================================ */
const BOOKMARKS = [
  { id: 'bm01', kind: 'video',  reg: '2026-07-01 09:12:40', obj: 'o05',
    img: IMG('video'), dur: '10초', place: '2층 통로',      target: '인물 A',
    cam: 'cam 01-234', shot: '2026-06-30 14:38:55', memo: '용의자 최초 포착 지점', range: [63, 9] },

  { id: 'bm02', kind: 'object', reg: '2026-06-30 18:44:02', obj: 'o01',
    img: IMG('obj01'), target: '인물 A', guid: '909854931029', first: '2026-06-30 14:20:44',
    top: 'black', bottom: 'black', imgs: [IMG('obj01'), IMG('obj12'), IMG('obj13'), IMG('obj14')] },

  { id: 'bm03', kind: 'video',  reg: '2026-06-30 18:20:15', obj: 'o03',
    img: IMG('cam3'), dur: '15초', place: 'B1 엘리베이터',  target: '인물 A',
    cam: 'cam 02-118', shot: '2026-06-30 14:45:32', memo: '엘리베이터 탑승 시점 확인', range: [46, 11] },

  { id: 'bm04', kind: 'video',  reg: '2026-06-30 17:55:31', obj: 'o01',
    img: IMG('cam2'), dur: '10초', place: 'B1 주차장',      target: '인물 A',
    cam: 'cam 03-091', shot: '2026-06-30 14:52:03', memo: '차량 접근 구간 확인', range: [70, 7] },

  { id: 'bm05', kind: 'object', reg: '2026-06-30 17:30:08', obj: 'o11',
    img: IMG('obj07'), target: '인물 B', guid: '', first: '2026-06-30 13:06:25',
    top: 'white', bottom: 'gray', imgs: [IMG('obj07'), IMG('obj09'), IMG('obj04')] },

  { id: 'bm06', kind: 'video',  reg: '2026-06-30 16:58:47', obj: 'o13',
    img: IMG('cam4'), dur: '20초', place: '1층 로비',       target: '인물 B',
    cam: 'cam 04-206', shot: '2026-06-30 13:15:02', memo: '동행자와 대화 구간', range: [24, 14] },

  { id: 'bm07', kind: 'video',  reg: '2026-06-30 16:22:19', obj: 'o16',
    img: IMG('nb1'), dur: '10초', place: '외부 CCTV',     target: '인물 C',
    cam: 'cam 07-402', shot: '2026-06-30 12:58:31', memo: '', range: [12, 10] },

  { id: 'bm08', kind: 'object', reg: '2026-06-30 15:47:53', obj: 'o16',
    img: IMG('obj23'), target: '인물 C', guid: '774210658833', first: '2026-06-30 12:44:07',
    top: 'green', bottom: 'black', imgs: [IMG('obj23'), IMG('obj02'), IMG('obj06'), IMG('obj17'), IMG('obj27')] },

  { id: 'bm09', kind: 'video',  reg: '2026-06-30 15:20:36', obj: 'o20',
    img: IMG('nb2'), dur: '25초', place: '3층 매장',    target: '인물 D',
    cam: 'cam 05-117', shot: '2026-06-30 12:31:40', memo: '매장 진입 직후 동선', range: [35, 13] },

  { id: 'bm10', kind: 'object', reg: '2026-06-30 15:05:22', obj: 'o19',
    img: IMG('ai05'), target: '인물 E', guid: '318902547116', first: '2026-06-30 12:38:52',
    top: 'blue', bottom: 'blue', imgs: [IMG('ai05'), IMG('ai01')] }
];

/* ---------------- 빈 상태 문구 (사양서) ---------------- */
const EMPTY_TEXT = {
  text:   '검색어를 입력해 주세요.',
  image:  '이미지를 업로드해 주세요.',
  person: '등록 인물을 선택해 주세요.',
  algo:   '지능형 알고리즘을 선택해 주세요.',
  none:   '일치하는 결과가 없습니다.',
  ai:     '대상을 검색해 주세요.',
  car:    '차량번호를 입력해 주세요.',
  aim:    '대상을 검색해 주세요.',
  aiWait: 'AI 검색 진행 중입니다.'
};

/* ============================================================
   사건 관리 (Case_001 / 002 / 003)
   status: 처리전 | 진행중 | 처리 완료   (정렬: 진행중 > 처리전 > 처리 완료)
   ============================================================ */
const CS_STATUS = ['처리전', '진행중', '처리 완료'];
const CS_KINDS  = ['도난', '침입', '배회', '폭행'];

const CASE_DB = [
  { id: 'c1', name: '택배 도난 의심', status: '진행중', reg: '2026-06-30', kind: '도난',
    from: '2026-06-30 08:00:00', to: '2026-06-30 12:00:00',
    desc: '택배 보관함에서 타인의 택배를 가져가는 인물 확인',
    no: 'CASE1',
    targets: [
      { obj: 'o01', name: '인물 A', img: IMG('obj01'), at: '2026-06-30 14:52:03', ev: '이동/계수', top: 'black',  bottom: 'black' },
      { obj: 'o11', name: '인물 B', img: IMG('obj07'), at: '2026-06-30 13:06:25', ev: '-',         top: 'white',  bottom: 'gray'  },
      { obj: 'o16', name: '인물 C', img: IMG('obj23'), at: '2026-06-30 12:44:07', ev: '배회',      top: 'green',  bottom: 'black' },
      { obj: 'o20', name: '인물 D', img: IMG('nb2'),   at: '2026-06-30 12:31:40', ev: '-',         top: 'blue',   bottom: 'blue'  }
    ],
    videos: [
      { img: IMG('cam2'), place: 'B1 주차장',     at: '2026-06-30 14:52:03', cam: 'CAM 104', rel: '인물 A, B', ok: true },
      { img: IMG('cam3'), place: 'B1 엘리베이터', at: '2026-06-30 14:45:32', cam: 'CAM 118', rel: '인물 A',    ok: true },
      { img: IMG('cam4'), place: '1층 로비',      at: '2026-06-30 13:15:02', cam: 'CAM 206', rel: '인물 B, C', ok: true }
    ],
    path: [
      { t: '14:08:12', place: '1층 로비',       cam: 'CAM 01', who: '인물 A' },
      { t: '14:10:05', place: 'B1 엘리베이터',  cam: 'CAM 03', who: '인물 A' },
      { t: '14:12:40', place: 'B1 주차장',      cam: 'CAM 07', who: '인물 A' },
      { t: '13:15:02', place: '1층 로비',       cam: 'CAM 206', who: '인물 B' }
    ],
    report: {
      title: 'B1 주차장 반입 의심 인물',
      meta: '사건번호 CASE1 · 상태 조사중 · 등록일 2026-06-30 · 증거 3건',
      sec: [
        ['1. 사건 개요', '대상(인물 A, 남성)이 2026-06-30 14:08:12에 1층 로비에서 최초 포착된 뒤, 14:12:40까지 B1 주차장으로 연속 이동한 정황이 확인됨.'],
        ['2. 이동 경로 (카메라 순)', '1. 14:08:12 1층 로비 (CAM 01)<br>2. 14:10:05 B1 엘리베이터 (CAM 03)<br>3. 14:12:40 B1 주차장 (CAM 07)'],
        ['3. 증거 자료', '총 3건의 영상 클립이 원본 출처·시각과 함께 첨부됨. 모든 클립은 원본 무결성 해시(SHA-256)로 검증되어 위·변조되지 않았음을 보장함.'],
        ['4. 조치 의견', '반입 물품 및 대상 신원 확인을 위한 추가 조사가 필요함.']
      ]
    }
  },
  { id: 'c2', name: '야간 배회 인물', status: '진행중', reg: '2026-06-29', kind: '배회',
    from: '2026-06-29 22:10:00', to: '2026-06-29 23:40:00',
    desc: '3층 매장 앞 통로를 반복 왕복하는 인물 확인',
    no: 'CASE2',
    targets: [
      { obj: 'o16', name: '인물 C', img: IMG('obj23'), at: '2026-06-29 22:41:07', ev: '배회', top: 'green', bottom: 'black' }
    ],
    videos: [
      { img: IMG('nb1'), place: '3층 매장', at: '2026-06-29 22:41:07', cam: 'CAM 117', rel: '인물 C', ok: true },
      { img: IMG('nb2'), place: '2층 통로',     at: '2026-06-29 22:58:31', cam: 'CAM 092', rel: '인물 C', ok: false }
    ],
    path: [
      { t: '22:41:07', place: '3층 매장', cam: 'CAM 117', who: '인물 C' },
      { t: '22:58:31', place: '2층 통로',     cam: 'CAM 092', who: '인물 C' }
    ],
    report: {
      title: '3층 매장 통로 반복 배회',
      meta: '사건번호 CASE2 · 상태 조사중 · 등록일 2026-06-29 · 증거 2건',
      sec: [
        ['1. 사건 개요', '대상(인물 C)이 22:41부터 23:10까지 3층 매장 통로를 4회 왕복한 정황이 확인됨.'],
        ['2. 이동 경로 (카메라 순)', '1. 22:41:07 3층 매장 (CAM 117)<br>2. 22:58:31 2층 통로 (CAM 092)'],
        ['3. 증거 자료', '총 2건의 영상 클립이 첨부됨. 1건은 무결성 검증에 실패해 검증 표기가 제외됨.'],
        ['4. 조치 의견', '폐점 시간 이후 출입 기록과 대조 확인이 필요함.']
      ]
    }
  },
  { id: 'c3', name: '출입구 침입 시도', status: '처리전', reg: '2026-06-28', kind: '침입',
    from: '2026-06-28 03:20:00', to: '2026-06-28 03:35:00',
    desc: '외부 출입구 잠금 장치 조작 시도 정황',
    no: 'CASE3',
    targets: [
      { obj: 'o19', name: '인물 E', img: IMG('ai05'), at: '2026-06-28 03:24:12', ev: '침입', top: 'blue', bottom: 'blue' }
    ],
    videos: [
      { img: IMG('video'), place: '외부 CCTV', at: '2026-06-28 03:24:12', cam: 'CAM 402', rel: '인물 E', ok: true }
    ],
    path: [{ t: '03:24:12', place: '외부 CCTV', cam: 'CAM 402', who: '인물 E' }],
    report: {
      title: '외부 출입구 침입 시도',
      meta: '사건번호 CASE3 · 상태 처리전 · 등록일 2026-06-28 · 증거 1건',
      sec: [
        ['1. 사건 개요', '03:24:12 외부 출입구에서 잠금 장치를 조작하는 행위가 탐지됨.'],
        ['2. 이동 경로 (카메라 순)', '1. 03:24:12 외부 CCTV (CAM 402)'],
        ['3. 증거 자료', '총 1건의 영상 클립이 원본 무결성 해시로 검증되어 첨부됨.'],
        ['4. 조치 의견', '경비 순찰 강화 및 잠금 장치 점검 필요.']
      ]
    }
  },
  { id: 'c4', name: '주차장 차량 접촉', status: '처리 완료', reg: '2026-06-25', kind: '도난',
    from: '2026-06-25 18:02:00', to: '2026-06-25 18:20:00',
    desc: 'B1 주차장 차량 접촉 후 미신고 이탈',
    no: 'CASE4',
    targets: [
      { obj: 'o05', name: '인물 A', img: IMG('obj12'), at: '2026-06-25 18:09:44', ev: '이동/계수', top: 'black', bottom: 'black' }
    ],
    videos: [
      { img: IMG('cam2'), place: 'B1 주차장', at: '2026-06-25 18:09:44', cam: 'CAM 104', rel: '인물 A', ok: true }
    ],
    path: [{ t: '18:09:44', place: 'B1 주차장', cam: 'CAM 104', who: '인물 A' }],
    report: {
      title: 'B1 주차장 차량 접촉',
      meta: '사건번호 CASE4 · 상태 처리 완료 · 등록일 2026-06-25 · 증거 1건',
      sec: [
        ['1. 사건 개요', '18:09:44 B1 주차장에서 차량 접촉 후 미신고 이탈 정황이 확인됨.'],
        ['2. 이동 경로 (카메라 순)', '1. 18:09:44 B1 주차장 (CAM 104)'],
        ['3. 증거 자료', '총 1건의 영상 클립이 검증 완료 상태로 첨부됨.'],
        ['4. 조치 의견', '차주 통보 및 보험 처리 완료. 추가 조치 불요.']
      ]
    }
  }
];

/* ============================================================
   맵 관리 (Map_001 ~ 003)
   ZONES = 위치(구역)별 설치 카메라 — 위치 선택 시 자동 표시
   cams  = 맵에 배치된 카메라 [{n:이름, x:%, y:%}]
   ============================================================ */
const ZONES = {
  'A동': ['엘리베이터홀', '메인 입구', '출구', '기계실', '로비', '복도', '메인 회의실'],
  'B동': ['복도', '메인 회의실', '메인 입구', '계단실 입구', '탕비실', 'A구역 사무 공간', '창고'],
  'C동': ['1F 출입구', '주차 램프', '하역장', '외부 통로'],
  'D동': ['옥상 출입구', '기계실', '비상 계단']
};
const MAPS = [
  { id: 'm1', name: 'A동 지도', place: 'A동', reg: '2026-06-30 11:20:04', img: IMG('map'),
    cams: [{ n: '엘리베이터홀', x: 22, y: 30 }, { n: '메인 입구', x: 58, y: 22 }, { n: '출구', x: 74, y: 44 },
           { n: '기계실', x: 30, y: 66 }, { n: '로비', x: 48, y: 52 }, { n: '복도', x: 63, y: 68 },
           { n: '메인 회의실', x: 18, y: 48 }] },
  { id: 'm2', name: 'B동 지도', place: 'B동', reg: '2026-06-29 15:02:41', img: IMG('map'),
    cams: [{ n: '복도', x: 34, y: 28 }, { n: '메인 회의실', x: 62, y: 36 }, { n: '메인 입구', x: 24, y: 62 }] },
  { id: 'm3', name: 'C동 지하 도면', place: 'C동', reg: '2026-06-27 09:41:12', img: IMG('map'),
    cams: [{ n: '1F 출입구', x: 40, y: 34 }, { n: '주차 램프', x: 66, y: 58 }] },
  { id: 'm4', name: 'D동 옥상', place: 'D동', reg: '2026-06-24 17:33:50', img: IMG('map'),
    cams: [{ n: '옥상 출입구', x: 50, y: 40 }] }
];

/* ============================================================
   알림 (Alarm_001) + 관심 인물 (popup_01 / 02)
   ============================================================ */
const WATCH_CLS = ['용의자', '침입자', '실종・보호대상', 'VIP', '기타'];
const ALARM_MODES = ['상시 사용', '미사용', '스케줄 설정'];

const ALARMS = [
  { id: 'a1', date: '2026-06-30', at: '2026-06-30 14:52:03', title: '관심인물 포착', person: '김보안', cls: '용의자',
    place: '2층 통로', cam: 'cam 01-234', img: IMG('video'), obj: 'o01', read: false },
  { id: 'a2', date: '2026-06-30', at: '2026-06-30 13:15:02', title: '관심인물 포착', person: '이출입', cls: '침입자',
    place: '1층 로비', cam: 'cam 04-206', img: IMG('cam4'), obj: 'o13', read: false },
  { id: 'a3', date: '2026-06-30', at: '2026-06-30 11:02:44', title: '관심인물 포착', person: '박관심', cls: 'VIP',
    place: 'B1 입구', cam: 'cam 02-118', img: IMG('cam3'), obj: 'o03', read: true },
  { id: 'a4', date: '2026-06-29', at: '2026-06-29 22:41:07', title: '관심인물 포착', person: '김보안', cls: '용의자',
    place: '3층 매장', cam: 'cam 05-117', img: IMG('nb1'), obj: 'o20', read: true },
  { id: 'a5', date: '2026-06-29', at: '2026-06-29 18:09:44', title: '관심인물 포착', person: '최실종', cls: '실종・보호대상',
    place: 'B1 주차장', cam: 'cam 03-091', img: IMG('cam2'), obj: 'o05', read: true },
  { id: 'a6', date: '2026-06-28', at: '2026-06-28 03:24:12', title: '관심인물 포착', person: '이출입', cls: '침입자',
    place: '외부 CCTV', cam: 'cam 07-402', img: IMG('nb2'), obj: 'o19', read: true }
];

const WATCHES = [
  { id: 'w1', name: '김보안', cls: '용의자',        mode: '상시 사용', reg: '2026-06-28 09:12:03',
    reason: '택배 도난 용의자', imgs: [IMG('obj01'), IMG('obj12'), IMG('obj13'), IMG('obj18'), IMG('obj20')] },
  { id: 'w2', name: '이출입', cls: '침입자',        mode: '스케줄 설정', reg: '2026-06-27 14:40:55',
    reason: '야간 무단 출입 반복', imgs: [IMG('obj07'), IMG('obj09'), IMG('obj04')] },
  { id: 'w3', name: '박관심', cls: 'VIP',           mode: '상시 사용', reg: '2026-06-26 10:05:21',
    reason: '임원 동선 보호', imgs: [IMG('obj23'), IMG('obj02')] },
  { id: 'w4', name: '최실종', cls: '실종・보호대상', mode: '상시 사용', reg: '2026-06-25 16:22:38',
    reason: '보호대상 이탈 감지', imgs: [IMG('ai05')] },
  { id: 'w5', name: '정기타', cls: '기타',          mode: '미사용', reg: '2026-06-24 08:31:09',
    reason: '협력사 출입 확인', imgs: [IMG('obj27'), IMG('obj17')] }
];

/* ---- 차량번호 검색 (Search main_002_1) ---- */
const CAR_TYPES = ['승용차', '승합차', '화물차', '버스', '이륜차', '기타'];
const CAR_RECENT = ['12가 1245', '3345', '68오 8269', '서울 1', '21어 8746', '3456'];

/* ============================================================
   AI 대화 시나리오 — 질문 키워드에 따라 답변·결과 세트가 달라진다.
   목업 시연용 더미이며, 매칭에 실패하면 fallback 을 쓴다.
   ============================================================ */
const AI_DIALOGS = [
  {
    key: ['유모차', '보행자'],
    head: '오늘 (2026-06-30) 유모차를 동반한 보행자는 <b>3명</b> 확인되었습니다. 가장 최근 위치는 <b>1층 로비</b>입니다.',
    items: [
      '<b>[1]</b> 16:04 / 여성 / 베이지 상의 · 유모차 · <b>1층 로비</b> (최근)',
      '<b>[2]</b> 15:12 / 여성 / 검정 상의 · 유모차 · 3층 매장',
      '<b>[3]</b> 14:20 / 남성 / 회색 상의 · 유모차 · B1 엘리베이터'
    ],
    follow: ['1층 로비에서 이후 이동 경로를 보여줘.', '동행자가 있었는지 확인해줘.'],
    actions: ['경로 확인', '사건 등록'],
    res: ['a3', 'a2', 'a5']
  },
  {
    key: ['쓰러짐', '쓰러진', '1시간'],
    head: '최근 1시간 (15:10 ~ 16:10) 내 <b>쓰러짐</b> 이벤트는 <b>2건</b> 발생했습니다.',
    items: [
      '<b>[1]</b> 15:03 / B1 주차장 / 여성 / 대형 상자 소지 — 지능형 알고리즘 <b>쓰러짐</b> 감지',
      '<b>[2]</b> 16:04 / B1 주차장 / 여성 / 숄더백 — 지능형 알고리즘 <b>쓰러짐</b> 감지'
    ],
    follow: ['해당 구간 원본 영상을 보여줘.', '주변 카메라에서 같은 인물을 찾아줘.'],
    actions: ['원본 영상 보기', '사건 등록'],
    res: ['a4', 'a5']
  },
  {
    key: ['로비', '주차장'],
    head: '오늘 (2026-06-30) 기준 <b>로비에서 주차장으로 이동한 인물</b>이 총 <b>5명</b> 확인되었습니다.',
    items: [
      '<b>[후보 1]</b> 14:02 / 남성 / 회색 상의, 검정 하의, 여행용 캐리어',
      '<b>[후보 2]</b> 14:05 / 여성 / 베이지색 상의, 숄더백',
      '<b>[후보 3]</b> 14:08 / 남성 / 검정 상의',
      '<b>[후보 4]</b> 15:03 / 여성 / 검정 상의, 대형 상자 소지',
      '<b>[후보 5]</b> 16:04 / 여성 / 검정 상의, 숄더백'
    ],
    follow: ['회색 상의에 캐리어 들고 있는 사람으로 좁혀줘.', '최근 1시간 내 이동한 사람으로 좁혀줘.'],
    actions: ['유사 대상별 보기', '경로 비교'],
    res: ['a1', 'a2', 'a3', 'a4', 'a5']
  },
  {
    key: ['캐리어', '회색'],
    head: '<b>회색 상의 + 캐리어</b> 조건으로 좁힌 결과 <b>1명</b>이 남았습니다.',
    items: [
      '<b>[후보 1]</b> 14:02 / 남성 / 회색 상의, 검정 하의, 여행용 캐리어 · B1 주차장',
      '동일 인물이 <b>1층 로비 → B1 엘리베이터 → B1 주차장</b> 순으로 이동한 것으로 추정됩니다.'
    ],
    follow: ['이 인물의 이동 경로를 지도에서 보여줘.', '같은 시간대 동행자가 있었는지 확인해줘.'],
    actions: ['경로 확인', '관심 인물 등록'],
    res: ['a1']
  },
  {
    key: ['차량', '차량번호'],
    head: '오늘 B1 주차장 출입 차량 중 조건에 맞는 차량은 <b>2대</b>입니다.',
    items: [
      '<b>[1]</b> 14:11 / 승용차 / 12가 3456 · B1 입구 진입',
      '<b>[2]</b> 15:47 / 화물차 / 78나 9012 · B1 입구 진출'
    ],
    follow: ['12가 3456 차량의 이동 경로를 보여줘.', '동일 차량의 최근 7일 출입 이력을 알려줘.'],
    actions: ['원본 영상 보기', '사건 등록'],
    res: ['a1', 'a4']
  }
];

/* 키워드 매칭 실패 시 */
const AI_FALLBACK = {
  head: '질문하신 조건으로 <b>3건</b>을 찾았습니다. 조건을 더 좁히면 정확도를 높일 수 있습니다.',
  items: [
    '<b>[1]</b> 14:02 / B1 주차장 / 남성 / 회색 상의',
    '<b>[2]</b> 14:05 / B1 주차장 / 여성 / 베이지 상의',
    '<b>[3]</b> 14:08 / 1층 로비 / 남성 / 검정 상의'
  ],
  follow: ['시간대를 최근 1시간으로 좁혀줘.', '특정 위치의 결과만 보여줘.'],
  actions: ['유사 대상별 보기', '사건 등록'],
  res: ['a1', 'a2', 'a3']
};

/* ============================================================
   카메라 트리 — 실제 운영에서는 카메라가 수천 대라 평면 목록이 성립하지 않는다.
   건물 > 층 > 카메라 3단 폴더로 묶고, 접기·검색·부모 일괄선택으로 다룬다.
   말단 이름은 결과 데이터의 `cam` 값과 일치해야 필터가 걸린다.
   ============================================================ */
const CAM_TREE = [
  { name: '본관', groups: [
      { name: '지하 1층', cams: ['B1 주차장', 'B1 입구', 'B1 엘리베이터'] },
      { name: '1층',     cams: ['1층 로비'] },
      { name: '2층',     cams: ['2층 통로'] },
      { name: '3층',     cams: ['3층 매장'] }
    ] },
  { name: '외부', groups: [
      { name: '옥외', cams: ['외부 CCTV'] }
    ] }
];

/* ============================================================
   타임라인 트랙 (2026-09-01 개편)
   · 클립마다 절대 시각(from/to)을 갖는다 → 타임라인이 전체 구간을 그린다
   · 날짜가 바뀌는 지점이 보이도록 자정을 넘겨 배치했다
   · extra : 같은 장소에 카메라가 여러 대인 경우. 대표 하나만 타임라인에 표시하고
             나머지는 영상 영역의 PIP 로 재생한다
   ============================================================ */
const TL_TRACKS = [
  { slot: 'A', label: '인물 A', clips: [
    { n: 1, cam: '1F 메인 복도',  img: IMG('obj01'), from: '2026-06-29 22:14:05', to: '2026-06-29 22:31:40',
      extra: [{ cam: '1F 메인 복도(북)', img: IMG('cam2') }, { cam: '1F 메인 복도(남)', img: IMG('cam3') }] },
    { n: 2, cam: 'B1 엘리베이터', img: IMG('obj13'), from: '2026-06-29 23:02:11', to: '2026-06-29 23:15:02' },
    { n: 3, cam: 'B1 주차장',     img: IMG('obj02'), from: '2026-06-30 00:05:47', to: '2026-06-30 00:22:19',
      extra: [{ cam: 'B1 주차장(램프)', img: IMG('cam4') }] },
    { n: 4, cam: '외부 CCTV',     img: IMG('obj20'), from: '2026-06-30 01:31:08', to: '2026-06-30 01:44:52' }
  ] },
  { slot: 'B', label: '인물 B', clips: [
    { n: 1, cam: '1F 로비',       img: IMG('obj05'), from: '2026-06-29 22:40:00', to: '2026-06-29 22:58:30' },
    { n: 2, cam: '2F 통로',       img: IMG('obj08'), from: '2026-06-29 23:44:12', to: '2026-06-29 23:59:01' },
    { n: 3, cam: 'B1 입구',       img: IMG('obj11'), from: '2026-06-30 00:48:22', to: '2026-06-30 01:03:10' }
  ] },
  { slot: 'C', label: '인물 C', clips: [
    { n: 1, cam: '3F 매장',       img: IMG('obj16'), from: '2026-06-29 22:55:31', to: '2026-06-29 23:12:44' },
    { n: 2, cam: '1F 메인 복도',  img: IMG('obj18'), from: '2026-06-30 00:20:05', to: '2026-06-30 00:37:29',
      extra: [{ cam: '1F 메인 복도(북)', img: IMG('cam2') }] }
  ] },
  { slot: 'D', label: '인물 D', clips: [
    { n: 1, cam: 'B1 주차장',     img: IMG('obj24'), from: '2026-06-29 23:20:40', to: '2026-06-29 23:36:12' },
    { n: 2, cam: '외부 CCTV',     img: IMG('obj27'), from: '2026-06-30 01:10:33', to: '2026-06-30 01:26:00' },
    { n: 3, cam: '1F 로비',       img: IMG('obj30'), from: '2026-06-30 02:02:18', to: '2026-06-30 02:19:44' }
  ] }
];
