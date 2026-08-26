/* ============================================================
   SVMS 대상 검색 — Working Mockup
   ============================================================ */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
/* GUI 카드 표기 : 2026-06-30 14:52 (초 제거) */
const fmtT  = t => t.replace(/:\d{2}$/, '');
const fmtTS = t => t.replace(' ', ' ');
const simCls = v => v >= 90 ? 'hi' : v >= 80 ? 'mid' : 'low';
const colorHex = k => (COLORS.find(c => c.k === k) || {}).hex || '#666';

/* 아이콘 — Figma export SVG를 CSS mask로 렌더 (.i / .i-*), 나머지는 기존 인라인 유지 */
const ICON = {
  caret: '<i class="i i-16 i-chevron i-down caret"></i>',
  more:  '<i class="i i-more"></i>',
  x:     '<i class="i i-12 i-close"></i>',
  xs:    '<i class="i i-12 i-close"></i>',
  remove:'<i class="i i-16 i-remove"></i>',
  star:  '<i class="i i-16 i-bookmark"></i>',
  bmark: '<i class="i i-16 i-bookmark"></i>',
  check: '<i class="i i-16 i-check"></i>',
  cal:   '<svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="11" rx="1" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" stroke-width="1.2"/></svg>',
  clock: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M8 4.6V8l2.4 1.4" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>',
  play:  '<svg viewBox="0 0 16 16" style="width:14px;height:14px"><path d="M5 3.2l8 4.8-8 4.8z" fill="#fff"/></svg>',
  pin:   '<svg viewBox="0 0 16 16" style="width:12px;height:12px"><path d="M9.5 1.5l5 5-2 .5-3 3-.5 3-5-5 3-3 .5-2z" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M4 12l-2.5 2.5" stroke="currentColor" stroke-width="1.2"/></svg>',
  trash: '<svg viewBox="0 0 16 16" style="width:12px;height:12px"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.7 9h5.6l.7-9" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>'
};

/* ===================== 상태 ===================== */
const S = {
  mode: 'text', aiMode: false, aiStage: 'idle',
  textOpt: '자연어', q: '',
  sim: 80, allResults: false,
  cams: [], top: [], bottom: [],
  period: '당일', dFrom: '2025-06-05', tFrom: '00:00', dTo: '2025-06-05', tTo: '00:00',
  searched: false, sort: '유사도순', grouped: false,
  openGroups: new Set(),
  results: [], selected: null, preview: [], compare: [],
  bookmarks: new Set(),
  persons: PERSONS.slice(), selPersons: [], personSort: '등록일순', personQ: '',
  algos: [],
  uploaded: null, extracted: [], extSel: [],
  tabs: [{ id: 'search', title: '검색홈', fixed: true }], activeTab: 'search',
  recent: AI_RECENT.map(r => ({ ...r }))
};

/* ===================== 유틸 ===================== */
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 1900);
}
function openModal(id) { $('#overlay').hidden = false; $(id).hidden = false; }
function closeModal(id) {
  $(id).hidden = true;
  if (!$$('.modal').some(m => !m.hidden)) $('#overlay').hidden = true;
}
function closeAllModals() { $$('.modal').forEach(m => m.hidden = true); $('#overlay').hidden = true; }
function alertBox({ title, desc, ok = '삭제', danger = true, onOk }) {
  $('#alTitle').textContent = title; $('#alDesc').innerHTML = desc;
  const b = $('#alOk'); b.textContent = ok; b.className = danger ? 'btn-danger' : 'btn-primary';
  b.onclick = () => { closeModal('#mdAlert'); onOk && onOk(); };
  openModal('#mdAlert');
}

/* ===================== 탭 ===================== */
function renderTabs() {
  const box = $('#tabs'); box.innerHTML = '';
  S.tabs.forEach(t => {
    const n = el('div', 'tab' + (t.id === S.activeTab ? ' on' : ''));
    /* GUI(GNB Tab/2depth) : 모든 탭에 닫기 ✕ (hover·활성 시 노출). 검색홈(고정)은 닫아도 유지 */
    n.innerHTML = `<span>${t.title}</span><button class="x">${ICON.xs}</button>`;
    n.onclick = e => {
      if (e.target.closest('.x')) {
        if (t.fixed) { S.activeTab = t.id; }      /* 검색홈은 닫히지 않음 */
        else {
          S.tabs = S.tabs.filter(x => x.id !== t.id);
          if (S.activeTab === t.id) S.activeTab = 'search';
        }
      } else S.activeTab = t.id;
      renderTabs(); syncPanels();
    };
    box.appendChild(n);
  });
}
function newTab(title, obj, extra) {
  const id = 't' + Date.now() + Math.floor(Math.random() * 100);
  S.tabs.push({ id, title, obj, ...(extra || {}) }); S.activeTab = id; renderTabs(); syncPanels();
}

/* 탭에 따른 화면 전환 */
function syncPanels() {
  const isSearch = S.activeTab === 'search';
  const t = S.tabs.find(x => x.id === S.activeTab);
  const isCmp = !isSearch && !!t && t.kind === 'compare';
  const isDetail = !isSearch && !!t && !!t.obj && !isCmp;
  $('#detail').hidden = !(isDetail || isCmp);
  $('#dtMain').hidden = !isDetail;
  $('#cmpMain').hidden = !isCmp;
  $('#results').hidden = isDetail || isCmp;
  $('#preview').hidden = !isSearch;
  $('#sidePanel').hidden = !isSearch || S.aiMode || S._collapsed;
  $('#aiPanel').hidden = !isSearch || !S.aiMode || S._collapsed;
  $('#collapsedRail').hidden = !isSearch || !S._collapsed;
  $('#cmpTabs').hidden = !isCmp;
  $('#dtObjMulti').hidden = !isCmp;
  $('#dtObjSingle').hidden = isCmp;
  $('#dtNearSel').hidden = !isCmp;
  if (isCmp) renderCmpView(t);
  else if (isDetail) renderDetail(t);
  else renderResults();
}

/* ===================== 필터 UI ===================== */
const FILTER_DEF = {
  text:   ['sim', 'cam', 'color', 'period'],
  image:  ['sim', 'cam', 'period'],
  person: ['cam', 'period'],
  algo:   ['cam', 'color', 'period'],
  car:    ['cam', 'color', 'cartype', 'period'],
  aim:    []
};

function filterEnabled() {
  if (S.mode === 'text')   return S.q.trim().length > 0;
  if (S.mode === 'image')  return S.extSel.length > 0;
  if (S.mode === 'person') return S.selPersons.length > 0;
  if (S.mode === 'algo')   return S.algos.length > 0;
  if (S.mode === 'car')    return (S.carQ || '').trim().length > 0;
  return false;
}

function accBlock(key, title, bodyHTML, open) {
  return `<div class="acc${open ? ' open' : ''}" data-acc="${key}">
    <button class="acc-head">${title}${ICON.caret}</button>
    <div class="acc-body">${bodyHTML}</div>
  </div>`;
}

function buildFilters(mode) {
  const on = filterEnabled();
  const parts = [];
  for (const f of FILTER_DEF[mode]) {
    if (f === 'sim') parts.push(accBlock('sim', '유사도', `
      <div class="slider-row">
        <div class="slider-top"><span>대상유사도</span><b id="fSimVal">${S.sim}%</b></div>
        <input type="range" class="slider" id="fSim" min="0" max="100" value="${S.sim}">
      </div>
      <label class="check sm"><input type="checkbox" id="fAll" ${S.allResults ? 'checked' : ''}><i></i>모든 결과 출력</label>`, on));

    if (f === 'cam') parts.push(accBlock('cam', '위치', `
      <div class="cam-list">
        <label class="check sm"><input type="checkbox" data-cam="__all" ${S.cams.length === 0 ? 'checked' : ''}><i></i>전체</label>
        ${CAMERAS.map(c => `<label class="check sm sub"><input type="checkbox" data-cam="${c}" ${S.cams.includes(c) ? 'checked' : ''}><i></i>${c}</label>`).join('')}
      </div>`, on));

    if (f === 'color') parts.push(accBlock('color', '색상', `
      <div class="color-label">상의</div>
      <div class="color-row">${COLORS.map(c => `<span class="sw${S.top.includes(c.k) ? ' on' : ''}" data-part="top" data-c="${c.k}" style="background:${c.hex}" title="${c.label}"></span>`).join('')}</div>
      <div class="color-label">하의</div>
      <div class="color-row">${COLORS.map(c => `<span class="sw${S.bottom.includes(c.k) ? ' on' : ''}" data-part="bottom" data-c="${c.k}" style="background:${c.hex}" title="${c.label}"></span>`).join('')}</div>`, on));

    if (f === 'cartype') parts.push(accBlock('cartype', '차종',
      `<div class="chipset">${CAR_TYPES.map(t =>
        `<button class="mn-chip${(S.carTypes || []).includes(t) ? ' on' : ''}" data-cartype="${t}">${t}</button>`).join('')}</div>`, on));

    if (f === 'period') parts.push(accBlock('period', '기간', `
      ${['당일', '최근 3일', '최근 7일', '날짜 지정'].map(p =>
        `<label class="radio sm"><input type="radio" name="fp" data-p="${p}" ${S.period === p ? 'checked' : ''}><i></i>${p}</label>`).join('')}
      <div class="date-wrap" ${S.period === '날짜 지정' ? '' : 'hidden'}>
        <div class="date-row"><span class="lb">시작</span>
          <span class="date-fld">${ICON.cal}<input type="date" id="dFrom" value="${S.dFrom}"></span>
          <span class="date-fld">${ICON.clock}<input type="time" id="tFrom" value="${S.tFrom}"></span></div>
        <div class="date-row"><span class="lb">종료</span>
          <span class="date-fld">${ICON.cal}<input type="date" id="dTo" value="${S.dTo}"></span>
          <span class="date-fld">${ICON.clock}<input type="time" id="tTo" value="${S.tTo}"></span></div>
      </div>`, on));
  }
  const box = $(`.filters[data-filters="${mode}"]`);
  box.innerHTML = parts.join('');
  if (!on) $$('.acc', box).forEach(a => { a.classList.add('disabled'); a.classList.remove('open'); $('.acc-head', a).disabled = true; });
  bindFilters(box);
}

function bindFilters(box) {
  $$('.acc-head', box).forEach(h => h.onclick = () => h.parentElement.classList.toggle('open'));

  const sim = $('#fSim', box);
  if (sim) {
    sim.oninput = () => { S.sim = +sim.value; $('#fSimVal', box).textContent = S.sim + '%'; if (S.allResults) { S.allResults = false; $('#fAll', box).checked = false; } runSearch(true); };
    $('#fAll', box).onchange = e => { S.allResults = e.target.checked; if (S.allResults) { S.sim = 0; sim.value = 0; $('#fSimVal', box).textContent = '0%'; } runSearch(true); };
  }
  $$('[data-cam]', box).forEach(cb => cb.onchange = () => {
    const v = cb.dataset.cam;
    if (v === '__all') { S.cams = []; }
    else { S.cams = cb.checked ? [...S.cams, v] : S.cams.filter(x => x !== v); }
    buildFilters(S.mode); runSearch(true);
  });
  $$('.sw', box).forEach(s => s.onclick = () => {
    const p = s.dataset.part, c = s.dataset.c;
    S[p] = S[p].includes(c) ? S[p].filter(x => x !== c) : [...S[p], c];
    s.classList.toggle('on'); runSearch(true);
  });
  $$('[name=fp]', box).forEach(r => r.onchange = () => {
    S.period = r.dataset.p;
    const w = $('.date-wrap', box); if (w) w.hidden = S.period !== '날짜 지정';
    runSearch(true);
  });
  ['dFrom', 'tFrom', 'dTo', 'tTo'].forEach(id => { const n = $('#' + id, box); if (n) n.onchange = () => { S[id] = n.value; runSearch(true); }; });
}

/* ===================== 검색 실행 ===================== */
function matchFilters(o) {
  if (o.sim < S.sim) return false;
  if (S.cams.length && !S.cams.includes(o.cam)) return false;
  if (FILTER_DEF[S.mode].includes('color')) {
    if (S.top.length && !S.top.includes(o.top)) return false;
    if (S.bottom.length && !S.bottom.includes(o.bottom)) return false;
  }
  return true;
}

function runSearch(keep) {
  if (!filterEnabled()) { S.searched = false; S.results = []; render(); return; }
  S.searched = true;
  let base = OBJECTS;
  if (S.mode === 'person') base = OBJECTS.filter(o => o.group === 'c1' || o.group === 'c2');
  if (S.mode === 'algo')   base = OBJECTS.filter(o => ['etc', 'c1'].includes(o.group));
  if (S.mode === 'car')    base = OBJECTS.filter(o => ['etc', 'c2'].includes(o.group));
  S.results = base.filter(matchFilters);
  sortResults();
  if (!keep) { S.preview = []; S.compare = []; S.selected = null; }
  render();
}

function sortResults() {
  const c = { '유사도순': (a, b) => b.sim - a.sim, '최신순': (a, b) => b.t.localeCompare(a.t), '위치순': (a, b) => a.cam.localeCompare(b.cam) };
  S.results.sort(c[S.sort]);
}

/* ===================== 결과 렌더 ===================== */
function cardHTML(o, opt = {}) {
  const bm = S.bookmarks.has(o.id);
  return `<div class="card${S.selected === o.id ? ' on' : ''}" data-id="${o.id}">
    <div class="thumb">
      <img src="${o.img}" alt="">
      <span class="sim ${simCls(o.sim)}">${o.sim}%</span>
      ${opt.compare ? `<label class="cmp check sm${S.compare.includes(o.id) ? ' on' : ''}"><input type="checkbox" data-cmp="${o.id}" ${S.compare.includes(o.id) ? 'checked' : ''}><i></i>경로 비교</label>` : ''}
      ${bm ? `<span class="bm">${ICON.star}</span>` : ''}
    </div>
    <div class="meta">
      <div><div class="loc">${o.cam}</div><div class="tm">${fmtT(o.t)}</div></div>
      <button class="more" data-more="${o.id}">${ICON.more}</button>
    </div>
  </div>`;
}

function renderResults() {
  const body = $('#resultsBody');

  if (S.activeTab !== 'search') {
    const t = S.tabs.find(x => x.id === S.activeTab);
    body.innerHTML = `<div class="empty" style="flex-direction:column;gap:10px">
      <div style="font-size:15px;color:#8ea0b0">${t ? t.title : ''}</div>
      <div style="font-size:12px;color:#5a6875">상세/경로 비교 화면은 UI사양서에 정의되어 있지 않아<br>탭 생성까지만 구현되어 있습니다.</div></div>`;
    $('#resCount').textContent = '검색 결과 (-)';
    return;
  }

  $('#resCount').textContent = `검색 결과 (${(S.aiMode && S.aiStage === 'done' ? AI_RESULT.length : S.results.length)}건)`;

  /* AI 모드 */
  if (S.aiMode) {
    if (S.aiStage === 'idle')    { body.innerHTML = `<div class="empty">${EMPTY_TEXT.ai}</div>`; return; }
    if (S.aiStage === 'loading') { body.innerHTML = `<div class="empty wait">${EMPTY_TEXT.aiWait}</div>`; return; }
    body.innerHTML = `<div class="grid">${AI_RESULT.map(o => cardHTML(o)).join('')}</div>`;
    bindCards(body); return;
  }

  if (!S.searched) { body.innerHTML = `<div class="empty">${EMPTY_TEXT[S.mode]}</div>`; return; }
  if (!S.results.length) { body.innerHTML = `<div class="empty">${EMPTY_TEXT.none}</div>`; return; }

  if (!S.grouped) {
    body.innerHTML = `<div class="grid">${S.results.map(o => cardHTML(o)).join('')}</div>`;
    bindCards(body); return;
  }

  /* ---- 유사 대상별 보기 (B안: 대표 카드 압축) ---- */
  const byG = k => S.results.filter(o => o.group === k);
  let html = '<div class="rep-row">';
  ['c1', 'c2'].forEach(k => {
    const list = byG(k); if (!list.length) return;
    const g = GROUPS.find(x => x.key === k);
    html += `<div class="rep" data-g="${k}">
      <div class="rep-head" data-toggle="${k}">${ICON.caret}<span>${g.label}</span><span class="n">${list.length}건 유사</span></div>
      ${cardHTML(list[0], { compare: true })}
    </div>`;
  });
  html += '</div>';

  /* 펼쳐진 그룹의 상세 리스트 */
  ['c1', 'c2'].forEach(k => {
    if (!S.openGroups.has(k)) return;
    const list = byG(k); if (!list.length) return;
    const g = GROUPS.find(x => x.key === k);
    const avg = Math.round(list.reduce((a, b) => a + b.sim, 0) / list.length);
    html += `<div class="group" data-group="${k}">
      <div class="group-head">
        <span class="g-name">유사 대상 (${list.length}건)</span>
        <span class="g-avg">평균유사도 ${avg}%</span>
        <span class="g-count">${g.name}</span>
        <div class="right"><button class="btn-edit" data-edit="${k}">편집</button></div>
      </div>
      <div class="group-body"><div class="grid">${list.map(o => cardHTML(o, { compare: true })).join('')}</div></div>
    </div>`;
  });

  const etc = byG('etc');
  if (etc.length) {
    const open = S.openGroups.has('etc');
    html += `<div class="group${open ? '' : ' closed'}" data-group="etc">
      <div class="group-sep"></div>
      <div class="group-head" style="margin-top:14px">
        <span class="caret" data-toggle="etc">${ICON.caret}</span>
        <span class="g-name">기타 유사 대상</span><span class="g-count">(${etc.length}건)</span>
      </div>
      <div class="group-body"><div class="grid">${etc.map(o => cardHTML(o, { compare: true })).join('')}</div></div>
    </div>`;
  }
  body.innerHTML = html;
  bindCards(body);
  $$('[data-toggle]', body).forEach(n => n.onclick = e => {
    e.stopPropagation();
    const k = n.dataset.toggle;
    S.openGroups.has(k) ? S.openGroups.delete(k) : S.openGroups.add(k);
    renderResults();
  });
  $$('[data-edit]', body).forEach(n => n.onclick = e => { e.stopPropagation(); openEdit(n.dataset.edit); });
}

function bindCards(root) {
  $$('.card', root).forEach(c => {
    const id = c.dataset.id;
    let clickT = null;
    c.onclick = e => {
      if (e.target.closest('[data-more]')) { openCtx(e, id); return; }
      if (e.target.closest('.cmp')) return;
      clearTimeout(clickT);
      clickT = setTimeout(() => selectCard(id), 190);
    };
    c.ondblclick = e => {
      if (e.target.closest('.cmp') || e.target.closest('[data-more]')) return;
      clearTimeout(clickT);
      const o = findObj(id);
      const g = GROUPS.find(x => x.key === o.group);
      /* 유사 대상별 보기의 대표 카드 → 대상 그룹 상세 / 그 외 → 단일 대상 상세 */
      const isRep = !!c.closest('.rep');
      DT.clip = 0; DT.removed = new Set(); DT.edit = false; DT.area = null; DT.tracks = false; DT.tools = ['obj'];
      if (isRep) newTab(`${GROUP_CLIPS[0].cam} > ${(g && g.label) || '대상'}`, o, { kind: 'group' });
      else newTab(`${o.cam} > ${(g && g.label) || '대상'}`, o);
    };
  });
  $$('[data-cmp]', root).forEach(cb => cb.onchange = e => {
    e.stopPropagation();
    const id = cb.dataset.cmp;
    if (cb.checked) { if (S.compare.length >= 4) { cb.checked = false; toast('경로 비교는 최대 4개까지 선택할 수 있습니다.'); return; } S.compare.push(id); }
    else S.compare = S.compare.filter(x => x !== id);
    renderCompare(); renderResults();
  });
}

const findObj = id => OBJECTS.find(o => o.id === id) || AI_RESULT.find(o => o.id === id);

function selectCard(id) {
  S.selected = id;
  const o = findObj(id);
  S.preview = [{ ...o, uid: id + '_' + S.preview.length }, ...S.preview.filter(p => p.id !== id)].slice(0, 6);
  renderResults(); renderPreview();
}

/* ===================== 컨텍스트 메뉴 ===================== */
function openCtx(e, id) {
  e.stopPropagation();
  const m = $('#ctxMenu'); m.hidden = false;
  m.innerHTML = `<div data-act="bookmark">북마크</div><div data-act="watch">관심인물 등록</div><div data-act="case">사건 등록</div><div data-act="report">오대상 신고</div>`;
  const r = e.target.getBoundingClientRect();
  m.style.left = Math.min(r.left, innerWidth - 150) + 'px';
  m.style.top = (r.bottom + 4) + 'px';
  m.dataset.id = id;
  $$('div', m).forEach(d => d.onclick = () => {
    const act = d.dataset.act;
    m.hidden = true;
    if (act === 'bookmark') { S.bookmarks.has(id) ? S.bookmarks.delete(id) : S.bookmarks.add(id); toast(S.bookmarks.has(id) ? '북마크에 추가했습니다.' : '북마크에서 해제했습니다.'); }
    else if (act === 'watch') { DT._tab = { obj: findObj(id), label: '인물 A' }; openWatch(); }
    else if (act === 'case')  { DT._tab = { obj: findObj(id), label: '인물 A' }; openCase(); }
    else toast('오대상로 신고했습니다.');
    renderResults();
  });
}
document.addEventListener('click', e => { if (!e.target.closest('#ctxMenu') && !e.target.closest('[data-more]')) $('#ctxMenu').hidden = true; });

/* ===================== 칩 ===================== */
function renderChips() {
  const box = $('#chips'); box.innerHTML = '';
  const chips = [];
  if (S.cams.length) chips.push({ k: 'cam', label: `카메라 ${S.cams.length}` });
  if (S.top.length || S.bottom.length) chips.push({ k: 'color', label: `색상 ${S.top.length + S.bottom.length}` });
  if (S.period !== '당일') chips.push({ k: 'period', label: S.period });
  if (S.allResults) chips.push({ k: 'all', label: '모든 결과 출력' });
  if (!S.searched) return;
  chips.forEach(c => {
    const n = el('span', 'chip', `${c.label}<button>${ICON.remove}</button>`);
    n.querySelector('button').onclick = () => {
      if (c.k === 'cam') S.cams = [];
      if (c.k === 'color') { S.top = []; S.bottom = []; }
      if (c.k === 'period') S.period = '당일';
      if (c.k === 'all') { S.allResults = false; S.sim = 80; }
      buildFilters(S.mode); runSearch(true);
    };
    box.appendChild(n);
  });
}

/* ===================== 원본 영상 ===================== */
function renderPreview() {
  const box = $('#previewList'); box.innerHTML = '';
  if (!S.preview.length) { box.innerHTML = `<div class="pv-empty">대상 카드를 선택하면<br>원본 영상을 미리 볼 수 있습니다.</div>`; return; }
  S.preview.forEach((p, i) => {
    if (i === 0) {
      const bm = S.bookmarks.has(p.id);
      const n = el('div', 'pv', `
        <div class="pv-video">
          <img src="${p.img}" alt="">
          <div class="bbox" style="left:32%;top:18%;width:26%;height:56%"></div>
          <div class="play">${ICON.play}</div>
          <button class="x" data-close-pv="${p.uid}">${ICON.x}</button>
        </div>
        <div class="pv-info">
          <div class="pv-title"><span>${p.cam}</span><span class="bk${bm ? ' on' : ''}" data-bk="${p.id}">${ICON.bmark}</span></div>
          <dl class="pv-meta">
            <div><dt>대상 정보</dt><dd>${p.type} ${p.group === 'c1' ? 'A' : p.group === 'c2' ? 'B' : ''}</dd></div>
            <div><dt>이벤트</dt><dd>${p.group === 'etc' || !p.group ? '-' : '이동/계수'}</dd></div>
            <div><dt>이벤트 시간</dt><dd>${fmtTS(p.t)}</dd></div>
          </dl>
        </div>`);
      box.appendChild(n);
    } else {
      const n = el('div', 'pv mini', `
        <div class="th"><img src="${p.img}" alt=""></div>
        <div style="flex:1;min-width:0"><div class="nm">${p.cam}</div><div class="tm">${fmtT(p.t)}</div></div>
        <button class="btn-icon" data-close-pv="${p.uid}">${ICON.x}</button>`);
      n.onclick = e => { if (e.target.closest('[data-close-pv]')) return; selectCard(p.id); };
      box.appendChild(n);
    }
  });
  $$('[data-close-pv]', box).forEach(b => b.onclick = e => {
    e.stopPropagation();
    S.preview = S.preview.filter(p => p.uid !== b.dataset.closePv);
    renderPreview();
  });
  $$('[data-bk]', box).forEach(b => b.onclick = e => {
    e.stopPropagation(); const id = b.dataset.bk;
    S.bookmarks.has(id) ? S.bookmarks.delete(id) : S.bookmarks.add(id);
    renderPreview(); renderResults();
  });
}

/* ===================== 경로 비교 ===================== */
function renderCompare() {
  const bar = $('#compareBar');
  if (!S.compare.length) { bar.hidden = true; return; }
  bar.hidden = false;
  $('#cbList').innerHTML = S.compare.map((id, i) => {
    const o = findObj(id);
    return `<div class="cb-item"><div class="th"><img src="${o.img}"></div>
      <div class="cap">유사 대상 후보 ${i + 1}</div><button class="x" data-rm="${id}">✕</button></div>`;
  }).join('');
  const go = $('#cbGo');
  go.textContent = `경로 비교(${S.compare.length}/4)`;
  go.disabled = S.compare.length < 2;
  $$('[data-rm]', bar).forEach(b => b.onclick = () => { S.compare = S.compare.filter(x => x !== b.dataset.rm); renderCompare(); renderResults(); });
}
$('#cbCancel').onclick = () => { S.compare = []; renderCompare(); renderResults(); };
$('#cbGo').onclick = () => { const ids = S.compare.slice(); S.compare = []; renderCompare(); renderResults(); openCompareTab(ids); };

/* ===================== 모드 전환 ===================== */
$$('#modeRail button').forEach(b => b.onclick = () => {
  $$('#modeRail button').forEach(x => x.classList.remove('on')); b.classList.add('on');
  S.mode = b.dataset.mode;
  $$('.mode-panel').forEach(p => p.classList.toggle('on', p.dataset.panel === S.mode));
  buildFilters(S.mode);
  runSearch(false);
});

/* ---- 텍스트 검색 ---- */
const qText = $('#qText');
qText.addEventListener('input', () => {
  S.q = qText.value;
  $('#qTextClear').hidden = !S.q.length;
  buildFilters('text'); render();
});
qText.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (S.q.trim()) runSearch(false); }
});
$('#qTextClear').onclick = () => { qText.value = ''; S.q = ''; $('#qTextClear').hidden = true; buildFilters('text'); runSearch(false); };

/* select 컴포넌트 */
function bindSelect(id, onChange) {
  const s = $(id);
  $('.select-btn', s).onclick = e => { e.stopPropagation(); $$('.select').forEach(x => x !== s && x.classList.remove('open')); s.classList.toggle('open'); };
  $$('.select-menu div', s).forEach(d => d.onclick = () => {
    s.dataset.value = d.dataset.v;
    $('.select-btn', s).childNodes[0].nodeValue = d.dataset.v;
    $$('.select-menu div', s).forEach(x => x.classList.toggle('on', x === d));
    s.classList.remove('open'); onChange && onChange(d.dataset.v);
  });
}
document.addEventListener('click', () => $$('.select').forEach(s => s.classList.remove('open')));

bindSelect('#textOptSelect', v => { S.textOpt = v; buildFilters('text'); runSearch(false); });
bindSelect('#sortSelect', v => { S.sort = v; sortResults(); renderResults(); });
bindSelect('#personSort', v => { S.personSort = v; renderPersonGrid(); });

/* ---- 유사 대상별 보기 ---- */
$('#groupToggle').onchange = e => {
  S.grouped = e.target.checked;
  if (S.grouped && !S.openGroups.size) S.openGroups.add('etc');
  renderResults();
};

/* ===================== 이미지 검색 ===================== */
$('#dropzone').onclick = () => $('#fileImage').click();
$('#btnPickImage').onclick = e => { e.stopPropagation(); $('#fileImage').click(); };
$('#fileImage').onchange = e => { const f = e.target.files[0]; if (f) loadImage(URL.createObjectURL(f)); };
['dragover', 'dragleave', 'drop'].forEach(ev => $('#dropzone').addEventListener(ev, e => {
  e.preventDefault();
  $('#dropzone').classList.toggle('drag', ev === 'dragover');
  if (ev === 'drop' && e.dataTransfer.files[0]) loadImage(URL.createObjectURL(e.dataTransfer.files[0]));
}));

function loadImage(url) {
  S.uploaded = url;
  $('#mdImagePreview').src = url;
  $('#ieGrid').innerHTML = '<div class="ie-loading">대상 추출 중</div>';
  $('#bboxLayer').innerHTML = '';
  $$('#ieFilter button').forEach(b => b.disabled = true);
  $('#btnReextract').disabled = $('#btnRepick').disabled = true;
  $('#imgCancel').disabled = $('#imgSearch').disabled = true;
  S.extracted = []; S.extSel = [];
  openModal('#mdImage');
  setTimeout(finishExtract, 1500);
}

function finishExtract() {
  S.extracted = EXTRACTED.slice();
  $('#btnReextract').disabled = $('#btnRepick').disabled = false;
  $('#imgCancel').disabled = false;
  $$('#ieFilter button').forEach(b => b.disabled = false);
  $('#bboxLayer').innerHTML = S.extracted.map(x =>
    `<div class="bbox ${x.type}" style="left:${x.box.x}%;top:${x.box.y}%;width:${x.box.w}%;height:${x.box.h}%"><span>${x.type === 'face' ? '얼굴' : '대상'}</span></div>`).join('');
  renderExtractGrid('all');
}

function renderExtractGrid(t) {
  const list = S.extracted.filter(x => t === 'all' || x.type === t);
  $('#ieCount').textContent = S.extracted.length;
  if (!list.length) { $('#ieGrid').innerHTML = `<div class="ie-loading" style="color:#6b7785">이미지에서 추출된 대상가 없습니다.<br>다시 추출하거나 다른 이미지를 선택해 주세요.</div>`; return; }
  $('#ieGrid').innerHTML = list.map(x =>
    `<div class="ext-item${S.extSel.includes(x.id) ? ' on' : ''}" data-x="${x.id}"><img src="${x.img}"><span class="tag">${x.type === 'face' ? '얼굴' : '대상'}</span></div>`).join('');
  $$('#ieGrid .ext-item').forEach(n => n.onclick = () => {
    const id = n.dataset.x;
    S.extSel = S.extSel.includes(id) ? S.extSel.filter(x => x !== id) : [...S.extSel, id];
    n.classList.toggle('on'); $('#imgSearch').disabled = !S.extSel.length;
  });
}
$$('#ieFilter button').forEach(b => b.onclick = () => {
  $$('#ieFilter button').forEach(x => x.classList.remove('on')); b.classList.add('on');
  renderExtractGrid(b.dataset.t);
});
$('#btnReextract').onclick = () => { $('#ieGrid').innerHTML = '<div class="ie-loading">대상 추출 중</div>'; $('#bboxLayer').innerHTML = ''; setTimeout(finishExtract, 1200); };
$('#btnRepick').onclick = () => $('#fileImage').click();
$('#imgCancel').onclick = () => closeModal('#mdImage');
$('#imgSearch').onclick = () => {
  closeModal('#mdImage');
  $('#dropzone').hidden = true; $('#uploadedWrap').hidden = false; $('#uploadedImg').src = S.uploaded;
  const acc = $('#extractedAcc'); acc.classList.add('open'); $('.acc-head', acc).disabled = false;
  renderSideExtract();
  buildFilters('image'); runSearch(false);
};
$('#uploadedClear').onclick = () => {
  S.uploaded = null; S.extracted = []; S.extSel = [];
  $('#dropzone').hidden = false; $('#uploadedWrap').hidden = true;
  const acc = $('#extractedAcc'); acc.classList.remove('open'); $('.acc-head', acc).disabled = true;
  $('#extGrid').innerHTML = ''; buildFilters('image'); runSearch(false);
};
$('#extractedAcc .acc-head').onclick = function () { if (!this.disabled) this.parentElement.classList.toggle('open'); };
$('#extAll').onchange = e => { S.extSel = e.target.checked ? S.extracted.map(x => x.id) : []; renderSideExtract(); buildFilters('image'); runSearch(true); };

function renderSideExtract() {
  $('#extGrid').innerHTML = S.extracted.map(x =>
    `<div class="ext-item${S.extSel.includes(x.id) ? ' on' : ''}" data-sx="${x.id}"><img src="${x.img}"><span class="tag">${x.type === 'face' ? '얼굴' : '대상'}</span></div>`).join('');
  $$('#extGrid .ext-item').forEach(n => n.onclick = () => {
    const id = n.dataset.sx;
    S.extSel = S.extSel.includes(id) ? S.extSel.filter(x => x !== id) : [...S.extSel, id];
    renderSideExtract(); buildFilters('image'); runSearch(true);
  });
}

/* ===================== 등록 인물 ===================== */
function renderPersonGrid() {
  const box = $('#personGrid');
  let list = S.persons.filter(p => !S.personQ || p.name.includes(S.personQ));
  list = S.personSort === '이름순' ? list.slice().sort((a, b) => a.name.localeCompare(b.name)) : list;
  $('#personCount').textContent = `등록된 인물 (${S.persons.length})`;
  const empty = !S.persons.length;
  $('#personEmpty').hidden = !empty; box.hidden = empty;
  $('#personAll').closest('.check').classList.toggle('disabled', empty);
  $('#personQuery').disabled = empty;
  if (empty) return;
  box.innerHTML = list.map(p => `<div class="pcard${S.selPersons.includes(p.id) ? ' on' : ''}" data-p="${p.id}">
    <div class="thumb"><img src="${p.imgs[0]}"></div><div class="nm">${p.name}</div><div class="ds">${p.desc}</div></div>`).join('');
  $$('.pcard', box).forEach(n => n.onclick = () => {
    const id = n.dataset.p;
    S.selPersons = S.selPersons.includes(id) ? S.selPersons.filter(x => x !== id) : [...S.selPersons, id];
    renderPersonGrid(); buildFilters('person'); runSearch(false);
  });
}
$('#personAll').onchange = e => { S.selPersons = e.target.checked ? S.persons.map(p => p.id) : []; renderPersonGrid(); buildFilters('person'); runSearch(false); };
$('#personQuery').oninput = e => { S.personQ = e.target.value; renderPersonGrid(); };
$('#btnNewPersonInline').onclick = () => { openPersonMgr(); pmNew(); };

/* ===================== 지능형 ===================== */
function renderAlgoGrid() {
  $('#algoGrid').innerHTML = ALGOS.map(a =>
    `<label class="check sm"><input type="checkbox" data-a="${a}" ${S.algos.includes(a) ? 'checked' : ''}><i></i>${a}</label>`).join('');
  $$('#algoGrid [data-a]').forEach(cb => cb.onchange = () => {
    const v = cb.dataset.a;
    S.algos = cb.checked ? [...S.algos, v] : S.algos.filter(x => x !== v);
    buildFilters('algo'); runSearch(false);
  });
}

/* ===================== 유사 대상 편집 팝업 ===================== */
let edState = null;
function openEdit(gk) {
  const list = S.results.filter(o => o.group === gk);
  const etc = S.results.filter(o => o.group === 'etc');
  edState = { gk, cand: list.map(o => o.id), etc: etc.map(o => o.id), selCand: list.map(o => o.id), selEtc: [] };
  $('#edTitle').textContent = '유사 대상 편집';
  $('#edDesc').textContent = 'AI 자동 그룹핑 결과를 편집할 수 있습니다.';
  $('#edBack').hidden = true;
  renderEdit(); openModal('#mdEdit');
}
function renderEdit() {
  const rep = findObj(edState.cand[0]);
  const g = GROUPS.find(x => x.key === edState.gk);
  const cell = (id, sel) => { const o = findObj(id); return `<div class="pick${sel.includes(id) ? ' on' : ''}" data-pick="${id}"><img src="${o.img}"></div>`; };
  $('#edBody').innerHTML = `<div class="ed-wrap">
    <div class="ed-rep">
      <img src="${rep.img}">
      <dl>
        <div><dt>대상명</dt><dd>${g.label}</dd></div>
        <div><dt>색상</dt><dd><i class="dot-sw" style="background:${colorHex(rep.top)}"></i><i class="dot-sw" style="background:${colorHex(rep.bottom)}"></i></dd></div>
        <div><dt>위치</dt><dd>${rep.cam}</dd></div>
        <div><dt>포착 일시</dt><dd>${rep.t}</dd></div>
      </dl>
    </div>
    <div>
      <div class="ed-total">총 ${edState.selCand.length + edState.selEtc.length}건 선택</div>
      <div class="ed-sec">
        <div class="ed-sec-head"><span class="panel-label">대상 후보</span>
          <span class="badge">${edState.selCand.length} / ${edState.cand.length}건</span></div>
        <div class="pick-grid" data-zone="cand">${edState.cand.map(id => cell(id, edState.selCand)).join('')}</div>
      </div>
      <div class="ed-sec">
        <div class="ed-sec-head"><span class="panel-label">기타 유사 대상</span>
          <span class="badge">${edState.selEtc.length} / ${edState.etc.length}건</span>
          <div style="margin-left:auto"><button class="btn-edit" id="edAdd">대상 추가</button></div></div>
        <div class="pick-grid" data-zone="etc">${edState.etc.map(id => cell(id, edState.selEtc)).join('')}</div>
      </div>
    </div>
  </div>`;
  $('#edFoot').innerHTML = `<button class="btn-ghost" data-close>취소</button><button class="btn-primary" id="edDone">완료</button>`;
  $$('[data-pick]', $('#edBody')).forEach(n => n.onclick = () => {
    const id = n.dataset.pick, zone = n.closest('[data-zone]').dataset.zone;
    const key = zone === 'cand' ? 'selCand' : 'selEtc';
    edState[key] = edState[key].includes(id) ? edState[key].filter(x => x !== id) : [...edState[key], id];
    renderEdit();
  });
  $('#edAdd').onclick = openObjectAdd;
  $('#edDone').onclick = () => { closeModal('#mdEdit'); toast('그룹 편집 내용을 반영했습니다.'); };
  $$('[data-close]', $('#mdEdit')).forEach(b => b.onclick = () => closeModal('#mdEdit'));
}

/* 대상 추가 팝업 */
let addState = { tab: '검색', q: '', sel: [] };
function openObjectAdd() {
  addState = { tab: '검색', q: '', sel: [] };
  $('#edTitle').textContent = '대상 추가';
  $('#edDesc').textContent = '유사 대상 그룹에 추가할 대상를 검색하거나 북마크에서 선택합니다.';
  $('#edBack').hidden = false;
  $('#edBack').onclick = () => { $('#edTitle').textContent = '유사 대상 편집'; $('#edDesc').textContent = 'AI 자동 그룹핑 결과를 편집할 수 있습니다.'; $('#edBack').hidden = true; renderEdit(); };
  renderObjectAdd();
}
function renderObjectAdd() {
  const pool = OBJECTS.filter(o => !edState.cand.includes(o.id) && !edState.etc.includes(o.id));
  const bm = OBJECTS.filter(o => S.bookmarks.has(o.id));
  const searched = addState.q.trim().length > 0;
  const list = addState.tab === '검색' ? (searched ? pool : []) : bm;

  $('#edBody').innerHTML = `
    <div class="seg" style="margin-bottom:14px">
      <button class="${addState.tab === '검색' ? 'on' : ''}" data-tab="검색">검색</button>
      <button class="${addState.tab === '북마크' ? 'on' : ''}" data-tab="북마크">북마크</button>
    </div>
    ${addState.tab === '검색' ? `
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <div class="textarea-wrap" style="flex:1">
          <input class="input" id="addQ" style="width:100%;height:30px" placeholder="검색어를 입력해 주세요." value="${addState.q}">
        </div>
        <span class="chip">위치 전체</span><span class="chip">기간 당일</span>
      </div>` : ''}
    <div style="font-size:12px;color:var(--muted);margin-bottom:9px">총 ${list.length}건</div>
    <div class="pick-grid">${list.length ? list.map(o =>
      `<div class="pick${addState.sel.includes(o.id) ? ' on' : ''}" data-add="${o.id}"><img src="${o.img}"></div>`).join('')
      : `<div class="ie-loading" style="grid-column:1/-1;color:#6b7785">${addState.tab === '검색' ? '검색어를 입력해 주세요.' : '북마크한 대상가 없습니다.'}</div>`}</div>`;

  $('#edFoot').innerHTML = `<button class="btn-ghost" id="addBack">뒤로</button><button class="btn-primary" id="addGo" ${addState.sel.length ? '' : 'disabled'}>추가</button>`;
  $$('[data-tab]', $('#edBody')).forEach(b => b.onclick = () => { addState.tab = b.dataset.tab; renderObjectAdd(); });
  const q = $('#addQ'); if (q) q.oninput = e => { addState.q = e.target.value; renderObjectAdd(); $('#addQ').focus(); };
  $$('[data-add]', $('#edBody')).forEach(n => n.onclick = () => {
    const id = n.dataset.add;
    addState.sel = addState.sel.includes(id) ? addState.sel.filter(x => x !== id) : [...addState.sel, id];
    renderObjectAdd();
  });
  $('#addBack').onclick = $('#edBack').onclick;
  $('#addGo').onclick = () => {
    edState.etc = [...edState.etc, ...addState.sel];
    edState.selEtc = [...edState.selEtc, ...addState.sel];
    $('#edTitle').textContent = '유사 대상 편집'; $('#edDesc').textContent = 'AI 자동 그룹핑 결과를 편집할 수 있습니다.';
    $('#edBack').hidden = true; renderEdit(); toast(`${addState.sel.length}건을 기타 유사 대상에 추가했습니다.`);
  };
}

/* ===================== 인물 관리 팝업 ===================== */
let pmView = 'list', pmSel = [], pmTarget = null, pmForm = null, pmQuery = '';
$('#btnPersonMgr').onclick = () => openPersonMgr();
function openPersonMgr() { pmView = 'list'; pmSel = []; renderPM(); openModal('#mdPerson'); }

function renderPM() {
  const head = { list: ['인물 관리', '대상 검색에 사용할 인물을 등록 · 관리할 수 있습니다.'], new: ['새 인물 등록', '대상 검색에 사용할 인물 이미지와 정보를 등록합니다.'], detail: ['인물 상세', ''], edit: ['인물 수정', ''] }[pmView];
  $('#pmTitle').textContent = head[0]; $('#pmDesc').textContent = head[1]; $('#pmDesc').hidden = !head[1];
  $('#pmBack').hidden = pmView === 'list';
  $('#pmBack').onclick = () => {
    if (pmView === 'new' && pmForm && (pmForm.name || pmForm.imgs.length)) {
      alertBox({ title: '등록을 취소하시겠습니까?', desc: '작성한 내용은 저장되지 않습니다.', ok: '확인', danger: false, onOk: () => { pmView = 'list'; renderPM(); } });
    } else { pmView = pmView === 'edit' ? 'detail' : 'list'; renderPM(); }
  };

  if (pmView === 'list') {
    $('#pmBody').innerHTML = `
      <div class="pm-tools">
        <span class="panel-label">등록된 인물 <em>(${S.persons.length})</em></span>
        <button class="btn-primary sm" id="pmNew">새 인물 등록</button>
        <div class="sp">
          <input class="input" id="pmQ" placeholder="이름 검색" value="${pmQuery}">
          <label class="check sm"><input type="checkbox" id="pmAll"><i></i>전체 선택</label>
          <div class="select xs"><button class="select-btn">등록일순${ICON.caret}</button></div>
          <button class="btn-ghost sm" id="pmDel" ${pmSel.length ? '' : 'disabled'}>선택 삭제</button>
        </div>
      </div>
      ${S.persons.length ? `<div class="pm-grid">${S.persons.filter(p => !pmQuery || p.name.includes(pmQuery)).map(p => `
        <div class="pm-card" data-pm="${p.id}">
          <label class="check cb" onclick="event.stopPropagation()"><input type="checkbox" data-sel="${p.id}" ${pmSel.includes(p.id) ? 'checked' : ''}><i></i></label>
          <span class="imgn">이미지 ${p.imgs.length}</span>
          <div class="th"><img src="${p.imgs[0]}"></div>
          <div class="bd"><div class="nm">${p.name}</div><div class="gu">${p.guid}</div><div class="ds">${p.desc}</div><div class="rg">${p.reg}</div></div>
        </div>`).join('')}</div>`
      : `<div class="empty-inline">등록된 인물이 없습니다.<br>대상 검색에 사용할 인물을 등록해 주세요.</div>`}`;
    $('#pmFoot').innerHTML = `<button class="btn-ghost" data-close>취소</button><button class="btn-primary" id="pmOk">완료</button>`;
    $('#pmNew').onclick = pmNew;
    $$('[data-sel]').forEach(cb => cb.onchange = () => {
      const id = cb.dataset.sel;
      pmSel = cb.checked ? [...pmSel, id] : pmSel.filter(x => x !== id);
      $('#pmDel').disabled = !pmSel.length;
    });
    $('#pmAll').onchange = e => { pmSel = e.target.checked ? S.persons.map(p => p.id) : []; renderPM(); };
    $('#pmDel').onclick = () => alertBox({
      title: '선택한 인물을 삭제하시겠습니까?', desc: `${pmSel.length}명의 인물 데이터가 삭제됩니다.`,
      onOk: () => { S.persons = S.persons.filter(p => !pmSel.includes(p.id)); S.selPersons = S.selPersons.filter(id => !pmSel.includes(id)); pmSel = []; renderPM(); renderPersonGrid(); runSearch(false); }
    });
    $$('.pm-card').forEach(c => c.onclick = e => { if (e.target.closest('.cb')) return; pmTarget = S.persons.find(p => p.id === c.dataset.pm); pmView = 'detail'; renderPM(); });
  }

  if (pmView === 'new' || pmView === 'edit') {
    if (pmView === 'new' && !pmForm) pmForm = { name: '', desc: '', imgs: [] };
    if (pmView === 'edit') pmForm = { name: pmTarget.name, desc: pmTarget.desc, imgs: pmTarget.imgs.slice() };
    const f = pmForm;
    $('#pmBody').innerHTML = `<div class="pm-new">
      <div>
        <div class="form-row"><label>이미지 <i>*</i> <span style="float:right;font-family:var(--mono)">${f.imgs.length}/10</span></label></div>
        ${f.imgs.length ? `<div class="up-list">
          ${f.imgs.map((im, i) => `<div class="up-card"><img src="${im}">${i === 0 ? '<span class="rep-chip">대표</span>' : ''}<span class="ty-chip">얼굴</span>${i === 0 ? '' : `<button class="x" data-rmimg="${i}">✕</button>`}</div>`).join('')}
          ${f.imgs.length < 10 ? '<div class="up-add" id="upAdd">+</div>' : ''}
        </div>`
        : `<div class="dropzone" id="upDrop">
            <svg viewBox="0 0 24 24" class="up-ic"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
            <p class="dz-main">이미지를 드래그하거나 클릭하여 업로드</p>
            <p class="dz-sub">JPG, PNG 지원 · 최대 10MB · 최대 10개 등록</p></div>`}
      </div>
      <div>
        <div class="form-row"><label>이름 <i>*</i></label><input id="pfName" placeholder="이름" value="${f.name}"></div>
        <div class="form-row"><label>GUID</label><input disabled value="${pmView === 'edit' ? pmTarget.guid : (f.imgs.length ? 'PSN-20260811-00' + (S.persons.length + 1) : '')}" placeholder="이미지 등록 시 자동 생성됩니다."></div>
        <div class="form-row"><label>설명</label><textarea id="pfDesc" placeholder="인물 설명">${f.desc}</textarea></div>
      </div>
    </div>`;
    const canSave = f.name.trim() && f.imgs.length;
    $('#pmFoot').innerHTML = `<button class="btn-ghost" id="pfCancel">취소</button><button class="btn-primary" id="pfSave" ${canSave ? '' : 'disabled'}>${pmView === 'edit' ? '완료' : '등록'}</button>`;
    const addImg = () => { f.imgs.push([IMG_POOL[f.imgs.length % IMG_POOL.length]]); f.imgs = f.imgs.flat(); renderPM(); };
    if ($('#upDrop')) $('#upDrop').onclick = addImg;
    if ($('#upAdd')) $('#upAdd').onclick = addImg;
    $$('[data-rmimg]').forEach(b => b.onclick = () => alertBox({
      title: '이미지를 삭제하시겠습니까?', desc: '선택한 이미지가 삭제됩니다.', ok: '확인', danger: false,
      onOk: () => { f.imgs.splice(+b.dataset.rmimg, 1); renderPM(); }
    }));
    $('#pfName').oninput = e => { f.name = e.target.value; $('#pfSave').disabled = !(f.name.trim() && f.imgs.length); };
    $('#pfDesc').oninput = e => f.desc = e.target.value;
    $('#pfCancel').onclick = $('#pmBack').onclick;
    $('#pfSave').onclick = () => {
      if (pmView === 'edit') { Object.assign(pmTarget, { name: f.name, desc: f.desc, imgs: f.imgs }); pmView = 'detail'; }
      else {
        const p = { id: 'p' + Date.now(), name: f.name, desc: f.desc, imgs: f.imgs, guid: 'PSN-20260811-00' + (S.persons.length + 1), reg: '2026-08-11 09:00' };
        S.persons.push(p); pmTarget = p; pmForm = null; pmView = 'detail';
      }
      renderPM(); renderPersonGrid();
    };
  }

  if (pmView === 'detail') {
    const p = pmTarget;
    $('#pmBody').innerHTML = `<div class="pm-new">
      <div><div class="form-row"><label>이미지 (${p.imgs.length})</label></div>
        <div class="up-list">${p.imgs.map((im, i) => `<div class="up-card"><img src="${im}">${i === 0 ? '<span class="rep-chip">대표</span>' : ''}</div>`).join('')}</div></div>
      <div>
        <div class="form-row"><label>이름</label><input disabled value="${p.name}"></div>
        <div class="form-row"><label>GUID</label><input disabled value="${p.guid}"></div>
        <div class="form-row"><label>설명</label><textarea disabled>${p.desc}</textarea></div>
        <div class="form-row"><label>등록 일시</label><input disabled value="${p.reg}"></div>
      </div></div>`;
    $('#pmFoot').innerHTML = `<button class="btn-ghost" id="pdDel">삭제</button><button class="btn-primary" id="pdEdit">수정</button>`;
    $('#pdEdit').onclick = () => { pmView = 'edit'; renderPM(); };
    $('#pdDel').onclick = () => alertBox({
      title: '인물을 삭제하시겠습니까?', desc: `${p.name} 님의 등록 정보가 삭제됩니다.`,
      onOk: () => { S.persons = S.persons.filter(x => x.id !== p.id); S.selPersons = S.selPersons.filter(id => id !== p.id); pmView = 'list'; renderPM(); renderPersonGrid(); runSearch(false); }
    });
  }
  $$('[data-close]', $('#mdPerson')).forEach(b => b.onclick = () => closeModal('#mdPerson'));
  const ok = $('#pmOk'); if (ok) ok.onclick = () => { closeModal('#mdPerson'); renderPersonGrid(); };
  const q = $('#pmQ'); if (q) q.oninput = e => { pmQuery = e.target.value; renderPM(); $('#pmQ').focus(); };
}
const IMG_POOL = ['assets/img/ai01.png', 'assets/img/ai02.png', 'assets/img/ai05.png', 'assets/img/ai06.png', 'assets/img/ai09.png'];
function pmNew() { pmForm = { name: '', desc: '', imgs: [] }; pmView = 'new'; renderPM(); }

$('#btnTabAdd').onclick = () => { S.activeTab = 'search'; renderTabs(); syncPanels(); toast('검색홈 탭으로 이동합니다. (새 탭은 카드 더블클릭으로 생성됩니다)'); };

/* ===================== 히스토리 ===================== */
$('#btnHistory').onclick = () => {
  $('#historyBody').innerHTML = HISTORY.map(d => `
    <div class="hs-day"><div class="hs-date">${d.date}</div>
      ${d.items.map((it, i) => `<div class="hs-item" data-hs="${d.date}-${i}">
        <div class="hs-main">
          ${it.sub.length ? `<span style="color:var(--muted)">${ICON.caret}</span>` : '<span style="width:10px"></span>'}
          <span class="hs-q">${it.q}</span>
          ${it.ai ? '<span class="hs-ai">AI</span>' : ''}
          <span class="hs-n">${it.n}건</span>
          <button class="btn-icon" title="북마크">${ICON.bmark}</button>
        </div>
        ${it.sub.length ? `<div class="hs-sub">${it.sub.map(s => `<div><span style="flex:1">${s.q}</span><span class="hs-n">${s.n}건</span></div>`).join('')}</div>` : ''}
      </div>`).join('')}
    </div>`).join('');
  $$('#historyBody .hs-main').forEach(m => m.onclick = () => m.parentElement.classList.toggle('open'));
  openModal('#mdHistory');
};

/* ===================== AI 에이전트 ===================== */
function renderChat(state) {
  const c = $('#chat');
  if (state === 'idle') {
    c.innerHTML = `<div class="chat-hello">무엇을 도와드릴까요?</div>
      <div class="sugg">${AI_SUGGESTIONS.map(s => `<button data-s="${s}">${s}</button>`).join('')}</div>`;
  }
  $$('[data-s]', c).forEach(b => b.onclick = () => sendAI(b.dataset.s));
  c.scrollTop = c.scrollHeight;
}
function sendAI(text) {
  const c = $('#chat');
  if (S.aiStage === 'idle') c.innerHTML = '';
  c.appendChild(el('div', 'bubble-user', text));
  const t = el('div', 'bubble-ai', `<div class="typing">답변 생성 중<i></i><i></i><i></i></div>`);
  c.appendChild(t); c.scrollTop = c.scrollHeight;
  S.aiStage = 'loading'; $('#aiInput').disabled = true; renderResults();
  setTimeout(() => {
    t.innerHTML = `${AI_ANSWER.head}<ul>${AI_ANSWER.items.map(i => `<li>${i}</li>`).join('')}</ul>
      <div class="sugg-title">추천 질문</div>
      <div class="sugg">${AI_ANSWER.follow.map(s => `<button data-s="${s}">${s}</button>`).join('')}</div>`;
    $$('[data-s]', t).forEach(b => b.onclick = () => sendAI(b.dataset.s));
    S.aiStage = 'done'; $('#aiInput').disabled = false; renderResults(); c.scrollTop = c.scrollHeight;
  }, 1600);
}
$('#aiInput').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const v = e.target.value.trim(); if (v) { e.target.value = ''; sendAI(v); } }
});
$('#btnAI').onclick = () => setAI(!S.aiMode);
$('#btnAiClose').onclick = () => setAI(false);
function setAI(on) {
  S.aiMode = on;
  $('#btnAI').classList.toggle('on', on);
  $('#sidePanel').hidden = on || S._collapsed;
  $('#aiPanel').hidden = !on || S._collapsed;
  $('#aiRecent').hidden = true;
  if (on) { S.aiStage = 'idle'; renderChat('idle'); }
  renderResults();
}
$('#btnAiMore').onclick = e => { e.stopPropagation(); $('#aiMoreMenu').hidden = !$('#aiMoreMenu').hidden; };
document.addEventListener('click', () => $('#aiMoreMenu').hidden = true);
$$('#aiMoreMenu b').forEach(b => b.onclick = e => {
  e.stopPropagation(); $('#aiMoreMenu').hidden = true;
  if (b.dataset.act === 'new') { S.aiStage = 'idle'; renderChat('idle'); renderResults(); toast('새 채팅을 시작합니다. 이전 대화는 최근 채팅에 저장되었습니다.'); }
  else { renderRecent(); $('#aiRecent').hidden = false; }
});
$('#btnRecentClose').onclick = () => $('#aiRecent').hidden = true;
function renderRecent() {
  const list = [...S.recent].sort((a, b) => (b.pinned - a.pinned) || b.date.localeCompare(a.date));
  $('#recentList').innerHTML = list.map(r => `<div class="rc${r.pinned ? ' pinned' : ''}" data-r="${r.id}">
    <div class="t">${r.title}</div><div class="d">${r.date}</div>
    <div class="acts"><button class="btn-icon pin" data-pin="${r.id}">${ICON.pin}</button><button class="btn-icon" data-del="${r.id}">${ICON.trash}</button></div>
  </div>`).join('');
  $$('[data-pin]').forEach(b => b.onclick = e => { e.stopPropagation(); const r = S.recent.find(x => x.id === b.dataset.pin); r.pinned = !r.pinned; renderRecent(); });
  $$('[data-del]').forEach(b => b.onclick = e => {
    e.stopPropagation();
    alertBox({ title: '대화를 삭제하시겠습니까?', desc: '선택한 대화 내용이 삭제됩니다.', onOk: () => { S.recent = S.recent.filter(x => x.id !== b.dataset.del); renderRecent(); } });
  });
  $$('#recentList .rc').forEach(n => n.onclick = () => { $('#aiRecent').hidden = true; sendAI(S.recent.find(r => r.id === n.dataset.r).title); });
}

/* ===================== 접기 / 분리 ===================== */
S._collapsed = false;
function setCollapsed(v) {
  S._collapsed = v;
  $('#collapsedRail').hidden = !v;
  $('#sidePanel').hidden = v || S.aiMode;
  $('#aiPanel').hidden = v || !S.aiMode;
}
$('#btnCollapse').onclick = () => setCollapsed(true);
$('#btnAiCollapse').onclick = () => setCollapsed(true);
$('#btnExpand').onclick = () => setCollapsed(false);

function makeDetachable(panelSel, btnSel, headSel) {
  const p = $(panelSel), b = $(btnSel), h = $(headSel);
  b.onclick = () => {
    p.classList.toggle('detached');
    b.title = p.classList.contains('detached') ? '복원' : '분리';
    if (!p.classList.contains('detached')) { p.style.left = p.style.top = ''; }
  };
  let drag = null;
  h.addEventListener('mousedown', e => {
    if (!p.classList.contains('detached') || e.target.closest('button')) return;
    const r = p.getBoundingClientRect(); drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!drag) return;
    p.style.left = Math.max(0, Math.min(innerWidth - p.offsetWidth, e.clientX - drag.dx)) + 'px';
    p.style.top = Math.max(0, Math.min(innerHeight - 60, e.clientY - drag.dy)) + 'px';
  });
  document.addEventListener('mouseup', () => drag = null);
}
makeDetachable('#sidePanel', '#btnDetach', '#sideHead');
makeDetachable('#aiPanel', '#btnAiDetach', '#aiHead');

/* ===================== 공통 렌더 ===================== */
function render() {
  const on = S.searched && !S.aiMode;
  $('#sortSelect').classList.toggle('disabled', !on);
  $('#groupToggle').disabled = !on;
  $('#groupToggleWrap').classList.toggle('disabled', !on);
  if (!on) { S.grouped = false; $('#groupToggle').checked = false; }
  renderChips(); renderResults(); renderPreview(); renderCompare();
}

$$('[data-close]').forEach(b => b.onclick = () => closeAllModals());
$('#alCancel').onclick = () => closeModal('#mdAlert');
$('#overlay').onclick = () => { };
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllModals(); });

/* ============================================================
   단일 대상 상세 (상세화면 WF_0805)
   ============================================================ */
const DT = {
  clip: 0, map: 'floor', tools: ['obj'], bookmarks: new Set(), nearQ: '',
  area: null,        /* {mode:'shape'|'line', rect|line, drawing} — 영역 검색 */
  tracks: false,     /* 대상별 동선 패널 */
  mapTools: [],      /* 맵뷰어 도구 : cctv | path */
  edit: false,       /* 탐지 이력(타임라인) 수정 모드 */
  clips: [], removed: new Set()
};
const CMP = { objs: [], tab: '전체', openLane: null, near: '전체' };

const SLOT = k => CMP_SLOTS.find(s => s.k === k) || CMP_SLOTS[0];
const slotColor = k => SLOT(k).color;

const ICON2 = {
  person: '<svg viewBox="0 0 16 16" class="ic"><circle cx="8" cy="5.4" r="2.4" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M3.4 13.4c0-2.6 2.1-3.9 4.6-3.9s4.6 1.3 4.6 3.9" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>',
  cam:    '<svg viewBox="0 0 16 16" class="ic"><rect x="1.6" y="4.4" width="8.8" height="7.2" rx="1" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M10.8 7.6l3.6-2.2v5.2l-3.6-2.2z" fill="currentColor"/></svg>',
  cctv:   '<svg viewBox="0 0 16 16" class="ic"><path d="M2.2 5.4l9.6-2.6 1.2 4.4-9.6 2.6z" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M5 9.5l1 4" stroke="currentColor" stroke-width="1.2"/></svg>',
  reset:  '<svg viewBox="0 0 16 16" class="ic"><path d="M3 8a5 5 0 105-5" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M8 .8v4.4L5 3z" fill="currentColor"/></svg>',
  chev:   '<svg viewBox="0 0 16 16" class="ic ch" style="width:11px;height:11px"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.4" fill="none"/></svg>',
  ext:    '<svg viewBox="0 0 16 16" class="ic"><path d="M9 2h5v5M14 2L8 8M12 9.5V13a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h3.5" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>',
  shield: '<svg viewBox="0 0 16 16" class="ic"><path d="M8 1.6l5 1.8v4.2c0 3.2-2.2 5.6-5 6.8-2.8-1.2-5-3.6-5-6.8V3.4z" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M5.6 8l1.7 1.7L10.6 6" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>'
};

function rulerHTML(opt = {}) {
  let h = '';
  for (let i = 0; i <= 48; i++) {
    const p = i / 48 * 100, maj = i % 4 === 0;
    h += `<span class="tick${maj ? ' maj' : ''}" style="left:${p}%"></span>`;
    if (maj) h += `<span class="lb" style="left:${p}%">${String(i / 2).padStart(2, '0')}</span>`;
  }
  if (opt.range) h += `<span class="range" style="left:${opt.range[0]}%;width:${opt.range[1]}%"></span>`;
  if (opt.head != null) h += `<span class="head" style="left:${opt.head}%"></span>`;
  return h;
}
function renderRuler() {
  const r = $('#dtRuler'); if (r.dataset.done) return;
  r.innerHTML = rulerHTML({ range: [31, 9], head: 36 }); r.dataset.done = '1';
}

/* 재생 컨트롤 바 — 상세 / 비교 / 영상 조회 / 북마크 공용 */
const _cb = (t, p, extra = '') => `<button class="btn-icon" title="${t}" ${extra}><svg viewBox="0 0 16 16" class="ic">${p}</svg></button>`;
function playCtrlHTML() {
  const b = _cb;
  return `${b('처음', '<path d="M4 3v10M13 3L6 8l7 5z" fill="currentColor"/>')}
    ${b('10초 뒤로', '<path d="M8 3.5a5 5 0 105 5" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M8 1.2v4.6L5 3.5z" fill="currentColor"/>')}
    ${b('배속 뒤로', '<path d="M8 3v10L2 8zM14 3v10L8 8z" fill="currentColor"/>')}
    ${b('재생', '<path d="M4 2.5l9 5.5-9 5.5z" fill="currentColor"/>')}
    ${b('일시정지', '<path d="M4.5 3h2.5v10H4.5zM9 3h2.5v10H9z" fill="currentColor"/>')}
    ${b('배속 앞으로', '<path d="M8 3v10l6-5zM2 3v10l6-5z" fill="currentColor"/>')}
    ${b('10초 앞으로', '<path d="M8 3.5a5 5 0 11-5 5" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M8 1.2v4.6L11 3.5z" fill="currentColor"/>')}
    ${b('끝', '<path d="M12 3v10M3 3l7 5-7 5z" fill="currentColor"/>')}
    ${b('음량', '<path d="M3 6h2.5L9 3v10L5.5 10H3z" fill="currentColor"/><path d="M11 6a3 3 0 010 4" stroke="currentColor" stroke-width="1.2" fill="none"/>')}`;
}
function ctrlHTML(opt = {}) {
  const b = _cb;
  const center = `<div class="grp c">${playCtrlHTML()}</div>`;
  const left = `<div class="grp l">
    ${b('영역 검색 — 도형', '<path d="M2 5V2h3M14 5V2h-3M2 11v3h3M14 11v3h-3" stroke="currentColor" stroke-width="1.3" fill="none"/>')}
    ${b('영역 검색 — 선', '<path d="M2 14L14 2M4 11l2 2M7 8l2 2M10 5l2 2" stroke="currentColor" stroke-width="1.3" fill="none"/>')}
  </div>`;
  const right = `<div class="grp r" style="opacity:${opt.dimRight ? '.4' : '1'}">
    ${b('대상 표시', '<circle cx="6" cy="6" r="2.6" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M2 14c0-2.4 1.8-3.6 4-3.6M11 8.5l3 3M14 8.5l-3 3" stroke="currentColor" stroke-width="1.2" fill="none"/>')}
    ${b('이동 경로', '<path d="M3 13c0-4 4-2 4-5S11 3 13 4" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="3" cy="13" r="1.4" fill="currentColor"/><circle cx="13" cy="4" r="1.4" fill="currentColor"/>')}
    ${b('히트맵', '<path d="M8 1.5s3.5 3 3.5 6a3.5 3.5 0 11-7 0c0-3 3.5-6 3.5-6z" stroke="currentColor" stroke-width="1.2" fill="none"/>')}
    <button class="btn-icon on" title="마스킹"><svg viewBox="0 0 16 16" class="ic"><rect x="3" y="3" width="10" height="10" rx="1.5" fill="currentColor"/></svg></button>
    ${b('멀티뷰', '<rect x="2" y="2" width="5.4" height="5.4" rx=".8" fill="currentColor"/><rect x="8.6" y="2" width="5.4" height="5.4" rx=".8" fill="currentColor"/><rect x="2" y="8.6" width="5.4" height="5.4" rx=".8" fill="currentColor"/><rect x="8.6" y="8.6" width="5.4" height="5.4" rx=".8" fill="currentColor"/>')}
    ${b('설정', '<circle cx="8" cy="8" r="2.2" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M8 1.6l.9 1.7 1.9-.3.5 1.85 1.75.83-.85 1.72.85 1.72-1.75.83-.5 1.85-1.9-.3L8 14.4l-.9-1.7-1.9.3-.5-1.85-1.75-.83.85-1.72-.85-1.72 1.75-.83.5-1.85 1.9.3z" stroke="currentColor" stroke-width="1" fill="none"/>')}
    ${b('전체보기', '<path d="M6 2H2v4M10 14h4v-4M2 10v4h4M14 6V2h-4" stroke="currentColor" stroke-width="1.3" fill="none"/>', 'data-vwfull')}
  </div>`;
  return left + center + right;
}

function renderDetail(tab) {
  const o = tab.obj;
  const isGroup = tab.kind === 'group';
  const g = GROUPS.find(x => x.key === o.group) || { label: '대상 A' };
  const label = tab.label || g.label || '대상 A';
  const peers = OBJECTS.filter(x => x.group === o.group);

  /* 클립 — 단일 4건 / 그룹 6건 */
  DT.clips = isGroup
    ? GROUP_CLIPS.filter(c => !DT.removed.has(c.id))
    : [o, ...peers.filter(x => x.id !== o.id)].slice(0, 4).map((c, i) => ({ ...c, n: [4, 2, 3, 1][i] || 1 }));
  if (DT.clip >= DT.clips.length) DT.clip = 0;
  const cur = DT.clips[DT.clip] || o;

  $('#dtCam').textContent = isGroup ? cur.cam : o.cam;
  $('#dtCamCaret').hidden = !isGroup;
  $('#dtRange').textContent = `${o.t.slice(0, 10)} 오전 00:52:03 ~ 02:10:11`;
  $('#dtObjImg').src = o.img;
  $('#dtObjName').textContent = label;
  $('#dtObjSim').textContent = `${o.sim}% 유사`;
  $('#dtObjTime').textContent = o.t;
  $('#dtObjEvent').textContent = tab.event || (o.group === 'etc' ? '-' : '이동/계수');
  $('#dtSwTop').style.background = colorHex(o.top);
  $('#dtSwBot').style.background = colorHex(o.bottom);
  $$('#dtVideo .dt-box i')[0].textContent = label;

  /* 그룹 상세 : 통합 건수 배지 + 대상 추가 버튼 */
  let unify = $('#dtObjUnify');
  if (isGroup && !unify) {
    unify = el('span', 'badge sub', `${DT.clips.length}건 통합`);
    unify.id = 'dtObjUnify';
    $('#dtObjName').after(unify);
  } else if (unify) { unify.hidden = !isGroup; unify.textContent = `${DT.clips.length}건 통합`; }
  $('#dtObjAdd').hidden = !isGroup;

  renderRuler();
  renderTracks(); renderCctvPins(); renderArea(); renderMulti(); applyTools();

  /* 그룹 상세 : 번호 세그먼트 행 */
  const segRow = $('#dtSegRow');
  segRow.hidden = !isGroup;
  if (isGroup) {
    segRow.innerHTML = HIST_LANES.A.slice(0, DT.clips.length).map((s, i) =>
      `<span class="seg${i === DT.clip ? ' on' : ''}" data-seg="${i}" style="left:${s.x}%;width:${s.w}%">${s.n}</span>`).join('');
    $$('#dtSegRow .seg').forEach(n => {
      n.onclick = () => { DT.clip = +n.dataset.seg; renderDetail(tab); };
      n.onmouseenter = () => showSegPeek(n, DT.clips[+n.dataset.seg]);
      n.onmouseleave = hideSegPeek;
    });
  }

  /* 클립 스트립 */
  $('#dtClips').innerHTML = DT.clips.map((c, i) => `
    <div class="dt-clip${i === DT.clip ? ' on' : ''}" data-clip="${i}">
      <img src="${c.img}" alt="">
      ${DT.edit
        ? `<button class="del" data-rmclip="${c.id}">${ICON.trash}</button>`
        : `<span class="bk${DT.bookmarks.has(c.id) ? ' on' : ''}" data-clipbk="${c.id}">${ICON.bmark}</span>`}
      <span class="cap"><span class="n">${isGroup ? (i + 1) + ' ' : ''}${c.cam}</span><span class="n" style="margin-left:auto">${ICON.play}${c.n || 1}</span></span>
    </div>`).join('')
    + (DT.edit ? `<div class="dt-clip-add" id="dtClipAdd"><b>+</b>추가</div>` : '');

  $$('#dtClips .dt-clip').forEach(n => n.onclick = e => {
    if (e.target.closest('[data-clipbk]') || e.target.closest('[data-rmclip]')) return;
    DT.clip = +n.dataset.clip;
    $('#dtVideoImg').src = DT.clips[DT.clip].img;
    renderDetail(tab);
  });
  $$('#dtClips [data-rmclip]').forEach(b => b.onclick = e => {
    e.stopPropagation();
    DT.removed.add(b.dataset.rmclip); renderDetail(tab);
  });
  const add = $('#dtClipAdd');
  if (add) add.onclick = () => openClipAdd(tab);
  $$('#dtClips [data-clipbk]').forEach(b => b.onclick = e => {
    e.stopPropagation(); const id = b.dataset.clipbk;
    DT.bookmarks.has(id) ? DT.bookmarks.delete(id) : DT.bookmarks.add(id);
    renderDetail(tab);
  });

  /* 편집(타임라인 수정) 상태 — WF 'B안 : 팝업'과 병행되는 인라인 편집 */
  $('#dtHistBtns').innerHTML = DT.edit
    ? `<button class="btn-ghost sm" id="dtEditCancel">취소</button><button class="btn-primary sm" id="dtEditSave">저장</button>`
    : `<button class="btn-ghost sm" id="dtEdit">편집</button>`;
  bindHistEdit(tab);
  $('#dtCase').disabled = DT.edit;
  $('#dtObjAdd').disabled = DT.edit;

  /* 맵뷰어 */
  renderMapLayers(isGroup ? MOVE_PATHS.slice(0, 1) : null, isGroup ? cur.cam : o.cam);

  /* 주변 대상 */
  renderNear(tab);
  DT._tab = tab;
}

/* ---- 탐지 이력 세그먼트 hover 미리보기 ---- */
function showSegPeek(node, clip) {
  if (!clip) return;
  hideSegPeek();
  const row = node.parentElement;
  const tip = el('span', 'seg-tip', clip.t || '08:24:12');
  tip.style.left = (node.offsetLeft + node.offsetWidth / 2) + 'px';
  row.appendChild(tip);
  const peek = el('div', 'vid-peek', `<img src="${clip.img}" alt="">`);
  peek.style.left = Math.max(8, node.offsetLeft + node.offsetWidth / 2 - 85) + 'px';
  peek.style.bottom = '4px';
  $('#dtVideo').appendChild(peek);
  showSegPeek._n = [tip, peek];
}
function hideSegPeek() { (showSegPeek._n || []).forEach(n => n.remove()); showSegPeek._n = []; }

/* ---- 주변 대상 ---- */
function renderNear(tab) {
  const inArea = !!DT.area;
  let list = inArea ? (DT.area.done ? AREA_HITS : []) : NEAR_OBJECTS.slice(0, 2);
  if (tab && tab.kind === 'compare') list = NEAR_OBJECTS;
  if (DT.nearQ) list = list.filter(x => x.name.includes(DT.nearQ));
  $('#dtNearN').textContent = list.length;
  $('#dtNear').innerHTML = list.length ? list.map(x => `
    <div class="dt-near-card" data-near="${x.id}">
      <img src="${x.img}" alt="">
      <span class="bk${DT.bookmarks.has(x.id) ? ' on' : ''}" data-nearbk="${x.id}">${ICON.bmark}</span>
      <div class="bd"><div class="nm">${x.name}<span class="n">${x.n}건</span></div><div class="tm">${x.t}</div></div>
    </div>`).join('')
    : `<div class="empty-inline" style="grid-column:1/-1;padding:16px 6px">${inArea ? '영역을 지정하면 통과 대상가 표시됩니다.' : '주변 대상가 없습니다.'}</div>`;

  $$('#dtNear .dt-near-card').forEach(n => n.onclick = e => {
    if (e.target.closest('[data-nearbk]')) return;
    const x = [...NEAR_OBJECTS, ...AREA_HITS].find(v => v.id === n.dataset.near);
    openNearDetail(x);
  });
  $$('#dtNear [data-nearbk]').forEach(b => b.onclick = e => {
    e.stopPropagation(); const id = b.dataset.nearbk;
    DT.bookmarks.has(id) ? DT.bookmarks.delete(id) : DT.bookmarks.add(id);
    renderNear(DT._tab);
  });
}

/* 주변 대상 선택 → 새 탭으로 그 대상의 상세 진입 (WF '주변 대상 선택') */
function openNearDetail(x) {
  if (!x) return;
  const seed = { ...OBJECTS[0], id: 'near_' + x.id, img: x.img, cam: x.cam, sim: x.sim, top: x.top, bottom: x.bottom, group: 'etc' };
  DT.clip = 0; DT.removed = new Set(); DT.edit = false; DT.area = null; DT.tracks = false;
  newTab(`${x.cam} > ${x.name}`, seed, { label: x.name, event: x.event });
  $('#dtVideoImg').src = x.img;
}

/* ---- 영상 도구 상태 반영 ---- */
function applyTools() {
  const on = k => DT.tools.includes(k);
  $$('#dtTools [data-tool]').forEach(b => b.classList.toggle('on', on(b.dataset.tool)));
  $('#ovHeat').hidden = !on('heat');
  $('#ovPath').hidden = !on('path');
  $('#ovCctv').hidden = !on('cctv');
  $('#dtMulti').hidden = !on('multi');
  $('#btnTracks').hidden = !on('path') || on('multi');
  $('#btnTracks').classList.toggle('on', DT.tracks);
  $('#pnlTracks').hidden = !DT.tracks || !on('path') || on('multi');
  $$('#dtVideo>.dt-box').forEach(b => b.hidden = !on('obj') || on('multi'));
  $$('#dtVideo>.dt-box').forEach(b => b.classList.toggle('masked', on('mask')));
  $('#dtVhead').hidden = on('multi');
  $('#dtCtrl').classList.toggle('area-mode', !!DT.area);
  $$('#dtAreaTools [data-area]').forEach(b => b.classList.toggle('on', !!DT.area && DT.area.mode === b.dataset.area));
}

/* ---- 이동경로 오버레이 + 대상별 동선 패널 ---- */
/* 픽셀 좌표계 SVG로 그려 화살촉이 찌그러지지 않게 한다 */
function smoothPath(pts) {
  if (pts.length < 3) return `M${pts.map(p => p.join(',')).join(' L')}`;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q${pts[i][0]},${pts[i][1]} ${mx},${my}`;
  }
  const l = pts[pts.length - 1];
  d += ` Q${pts[pts.length - 1][0]},${pts[pts.length - 1][1]} ${l[0]},${l[1]}`;
  return d;
}
function renderTracks() {
  const v = $('#dtVideo');
  const W = v.clientWidth || 1360, H = v.clientHeight || 730;
  const px = p => [p[0] / 100 * W, p[1] / 100 * H];
  $('#ovPath').innerHTML = `<svg viewBox="0 0 ${W} ${H}">
    <defs>${PATH_LINES.map((p, i) =>
      `<marker id="ah${i}" markerWidth="4.6" markerHeight="4.6" refX="3.2" refY="2.3" orient="auto"><path d="M0,0 L4.6,2.3 L0,4.6 z" fill="${p.color}"/></marker>`).join('')}</defs>
    ${PATH_LINES.map((p, i) =>
      `<path d="${smoothPath(p.pts.map(px))}" stroke="${p.color}" stroke-width="2.6" marker-end="url(#ah${i})"/>`).join('')}
  </svg>`;

  const sex = $('#trackSel').dataset.value;
  const list = PATH_OBJECTS.filter(p => sex === '전체' || p.sex === sex);
  $('#trackList').innerHTML = list.length ? list.map(p => `
    <div class="flt-row" data-track="${p.id}">
      <img src="${p.img}" alt="">
      <div class="bd">
        <div class="t1">${ICON2.person}${p.sex}${ICON2.chev}</div>
        <div class="t2">${p.t}</div>
        <div class="t3"><span>상의<i style="background:${colorHex(p.top)}"></i></span><span>하의<i style="background:${colorHex(p.bottom)}"></i></span></div>
      </div>
    </div>`).join('') : `<div class="empty-inline" style="padding:14px 4px">해당 조건의 동선이 없습니다.</div>`;
  $$('#trackList [data-track]').forEach(n => n.onclick = () => {
    const p = PATH_OBJECTS.find(x => x.id === n.dataset.track);
    openNearDetail({ id: p.id, name: p.sex === '남성' ? '인물 D' : '인물 E', n: 4, img: p.img, t: p.t, cam: '1F 메인 복도', sim: 89, event: '이동/계수', top: p.top, bottom: p.bottom });
  });
}

/* ---- 영상 위 CCTV 마커 ---- */
function renderCctvPins() {
  $('#ovCctv').innerHTML = VIDEO_CCTV.map((c, i) =>
    `<span class="cctv-pin" data-vc="${i}" style="left:${c.x}%;top:${c.y}%">${ICON2.cctv}</span>`).join('');
  $$('#ovCctv .cctv-pin').forEach(n => {
    n.onmouseenter = () => {
      const c = VIDEO_CCTV[+n.dataset.vc];
      const pop = el('div', 'cctv-pop', `<img src="${c.img}" alt=""><span class="cap">${c.cam}</span>`);
      pop.style.left = `calc(${c.x}% + 14px)`; pop.style.top = `calc(${c.y}% + 10px)`;
      $('#ovCctv').appendChild(pop); n._pop = pop;
    };
    n.onmouseleave = () => { if (n._pop) { n._pop.remove(); n._pop = null; } };
    n.onclick = () => openVideoView(VIDEO_CCTV[+n.dataset.vc]);
  });
}

/* ---- 멀티뷰 (주변 카메라) ---- */
function renderMulti() {
  $('#dtMulti').innerHTML = MULTI_TILES.map((t, i) => `
    <div class="mv-tile" data-mv="${i}" style="border-left-color:${t.boxes[0] ? slotColor(t.boxes[0].slot) : 'transparent'}">
      <img src="${t.img}" alt="">
      <div class="mv-head">
        <span class="nm">${t.cam}${t.fixed ? '' : `<i class="i i-16 i-chevron i-down caret"></i>`}</span>
        <span class="tm">2026-06-29 오전 00:52:03 ~ 02:10:11</span>
      </div>
      ${t.boxes.map(b => `<div class="mv-box" style="left:${b.x}%;top:${b.y}%;width:${b.w}%;height:${b.h}%;border-color:${slotColor(b.slot)};background:${slotColor(b.slot)}14"><i style="background:${slotColor(b.slot)}">${b.label}</i></div>`).join('')}
    </div>`).join('');
  $$('#dtMulti .mv-tile').forEach(n => n.onclick = e => {
    const t = MULTI_TILES[+n.dataset.mv];
    if (e.target.closest('.nm') && !t.fixed) { openCamPicker(e, t, +n.dataset.mv); return; }
    openVideoView({ cam: t.cam, img: t.img });
  });
}
function openCamPicker(e, tile, idx) {
  e.stopPropagation();
  const m = $('#ctxMenu');
  m.innerHTML = CAMERAS.map(c => `<div data-cam="${c}">${c}</div>`).join('');
  const r = e.target.getBoundingClientRect();
  m.style.left = r.left + 'px'; m.style.top = (r.bottom + 4) + 'px'; m.hidden = false;
  $$('div', m).forEach(d => d.onclick = () => {
    MULTI_TILES[idx].cam = d.dataset.cam; m.hidden = true; m.innerHTML = CTX_DEFAULT; renderMulti();
  });
}

/* ---- 영역 검색 (도형 · 선) ---- */
function setAreaTool(mode) {
  if (DT.area && DT.area.mode === mode) { DT.area = null; }
  else DT.area = { mode, done: false, rect: null, line: null };
  renderArea(); applyTools(); renderNear(DT._tab);
}
function renderArea() {
  const box = $('#ovArea');
  box.hidden = !DT.area;
  if (!DT.area) { box.innerHTML = ''; return; }
  const a = DT.area;
  let h = '';
  if (a.mode === 'shape' && a.rect) {
    const [x, y, w, hh] = a.rect;
    h += `<div class="area-shape" style="left:${x}%;top:${y}%;width:${w}%;height:${hh}%">
      <span style="left:-5px;top:-5px"></span><span style="right:-5px;top:-5px"></span>
      <span style="left:-5px;bottom:-5px"></span><span style="right:-5px;bottom:-5px"></span></div>`;
    if (a.done) h += `<button class="area-end" style="left:${x + w - 12}%;top:calc(${y + hh}% + 8px)">${ICON2.reset}종료</button>`;
  }
  if (a.mode === 'line' && a.line) {
    const [x1, y1, x2, y2] = a.line;
    h += `<div class="area-line"><svg viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs><marker id="lah" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z" fill="#0099ff"/></marker></defs>
      <path d="M${x1},${y1} L${x2},${y2}" stroke="#0099ff" stroke-width="2.4" stroke-dasharray="5 4" fill="none" marker-end="url(#lah)" vector-effect="non-scaling-stroke"/></svg>
      <span style="position:absolute;left:${x1}%;top:${y1}%;transform:translate(-50%,-50%);width:13px;height:13px;border-radius:50%;background:#0099ff;border:2px solid #fff"></span>
      <span style="position:absolute;left:${x2}%;top:${y2}%;transform:translate(-50%,-50%);width:13px;height:13px;border-radius:50%;background:#0099ff;border:2px solid #fff"></span></div>`;
    if (a.done) h += `<button class="area-end" style="left:${(x1 + x2) / 2 + 4}%;top:${(y1 + y2) / 2 + 3}%">${ICON2.reset}종료</button>`;
  }
  if (!a.rect && !a.line) h += `<div style="position:absolute;left:50%;top:14px;transform:translateX(-50%);padding:4px 11px;border-radius:12px;background:rgba(10,16,26,.86);border:1px solid rgba(255,255,255,.16);font-size:11px">영상 위에 ${a.mode === 'shape' ? '드래그해 영역을' : '두 번 클릭해 기준선을'} 그려주세요</div>`;
  box.innerHTML = h;
  const end = $('.area-end', box);
  if (end) end.onclick = () => { DT.area = { mode: a.mode, done: false, rect: null, line: null }; renderArea(); renderNear(DT._tab); };
}
/* 영상 위 드로잉 */
(function bindAreaDraw() {
  const v = $('#dtVideo');
  const pct = e => { const r = v.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100]; };
  v.addEventListener('mousedown', e => {
    if (!DT.area || DT.area.done || DT.area.mode !== 'shape' || e.target.closest('.dt-ctrl') || e.target.closest('.btn-flt') || e.target.closest('.flt-panel')) return;
    e.preventDefault();
    const [sx, sy] = pct(e);
    const move = ev => { const [x, y] = pct(ev); DT.area.rect = [Math.min(sx, x), Math.min(sy, y), Math.abs(x - sx), Math.abs(y - sy)]; renderArea(); };
    const up = () => {
      document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up);
      if (DT.area && DT.area.rect && DT.area.rect[2] > 3 && DT.area.rect[3] > 3) { DT.area.done = true; renderArea(); renderNear(DT._tab); toast('지정한 영역을 통과한 대상를 조회했습니다.'); }
      else if (DT.area) { DT.area.rect = null; renderArea(); }
    };
    document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
  });
  v.addEventListener('click', e => {
    if (!DT.area || DT.area.done || DT.area.mode !== 'line' || e.target.closest('.dt-ctrl') || e.target.closest('.area-end') || e.target.closest('.btn-flt') || e.target.closest('.flt-panel')) return;
    const [x, y] = pct(e);
    if (!DT.area.line) { DT.area.line = [x, y, x, y]; renderArea(); }
    else {
      DT.area.line = [DT.area.line[0], DT.area.line[1], x, y];
      DT.area.done = true; renderArea(); renderNear(DT._tab); toast('기준선을 통과한 대상를 조회했습니다.');
    }
  });
  v.addEventListener('mousemove', e => {
    if (!DT.area || DT.area.done || DT.area.mode !== 'line' || !DT.area.line) return;
    const [x, y] = pct(e);
    DT.area.line = [DT.area.line[0], DT.area.line[1], x, y]; renderArea();
  });
})();

/* ---- 맵뷰어 레이어 (CCTV 콘 / 경로 / 마커) ---- */
function renderMapLayers(paths, camName) {
  const cctvOn = DT.mapTools.includes('cctv');
  $('#dtMapCones').hidden = !cctvOn;
  if (cctvOn) {
    $('#dtMapCones').innerHTML = MAP_CCTV.map((c, i) =>
      `<span class="map-cone" data-mc="${i}" style="left:${c.x}%;top:${c.y}%;rotate:${c.deg}deg"><i></i><b></b></span>`).join('');
    $$('#dtMapCones .map-cone').forEach(n => {
      n.onmouseenter = () => {
        const c = MAP_CCTV[+n.dataset.mc];
        const pop = el('div', 'cctv-pop', `<img src="${c.img}" alt=""><span class="cap">${c.cam}${ICON2.ext}</span>`);
        pop.style.left = `calc(${Math.min(c.x, 62)}% + 12px)`; pop.style.top = `calc(${c.y}% - 34px)`;
        $('#dtMapCones').appendChild(pop); n._pop = pop;
        pop.onclick = () => openVideoView(c);
      };
      n.onmouseleave = () => setTimeout(() => { if (n._pop && !n._pop.matches(':hover')) { n._pop.remove(); n._pop = null; } }, 260);
    });
  }
  const multi = paths && paths.length;
  $('#dtMarker').hidden = !!multi;
  if (!multi) { $('#dtMapPath').hidden = true; $('#dtMapWps').hidden = true; $('#dtMarker').querySelector('span').textContent = camName || '1F 메인 복도'; $('#dtLegend').innerHTML = `<i></i>출현 지점 <em>( 1개 )</em>`; return; }

  $('#dtMapPath').hidden = false; $('#dtMapWps').hidden = false;
  $('#dtMapPath').innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none">${paths.map(p =>
    `<path d="M${p.pts.map(t => `${t.x},${t.y}`).join(' L')}" stroke="${slotColor(p.slot)}" vector-effect="non-scaling-stroke"/>`).join('')}</svg>`;
  $('#dtMapWps').innerHTML = paths.map(p => p.pts.map(t =>
    `<span class="map-wp" title="${t.cam} · ${t.t}" style="left:${t.x}%;top:${t.y}%;background:${slotColor(p.slot)}">${t.n}</span>`).join('')).join('');
  $('#dtLegend').className = 'dt-legend' + (paths.length > 1 ? ' multi' : '');
  $('#dtLegend').innerHTML = paths.length > 1
    ? paths.map(p => `<span class="lg"><i style="background:${slotColor(p.slot)}"></i>${p.label} 출현 지점</span>`).join('')
    : `<i></i>출현 지점 <em>( ${paths[0].pts.length}개 )</em>`;
}

/* 맵뷰어 지도/층별 */
$$('#dtMapSeg button').forEach(b => b.onclick = () => {
  $$('#dtMapSeg button').forEach(x => x.classList.toggle('on', x === b));
  DT.map = b.dataset.m;
  $('#dtMapImg').src = DT.map === 'map' ? 'assets/img/map.png' : 'assets/img/floor.png';
  $('#dtFloor').hidden = DT.map === 'map';
});
/* 맵뷰어 도구 */
$$('#dtMapTools [data-map]').forEach(b => b.onclick = () => {
  const k = b.dataset.map;
  if (k === 'full') { openMapView(); return; }
  if (k === 'path') { toggleMovePath(b); return; }
  DT.mapTools = DT.mapTools.includes(k) ? DT.mapTools.filter(x => x !== k) : [...DT.mapTools, k];
  b.classList.toggle('on', DT.mapTools.includes(k));
  if (DT._tab) renderDetail(DT._tab);
});
/* 영상 도구 토글 */
$$('#dtTools [data-tool]').forEach(b => b.onclick = () => {
  const k = b.dataset.tool;
  DT.tools = DT.tools.includes(k) ? DT.tools.filter(x => x !== k) : [...DT.tools, k];
  if (k === 'path' && DT.tools.includes('path')) DT.tracks = true;
  applyTools();
});
$$('#dtAreaTools [data-area]').forEach(b => b.onclick = () => setAreaTool(b.dataset.area));
$('#btnTracks').onclick = () => { DT.tracks = !DT.tracks; applyTools(); };
$('#pnlTracksX').onclick = () => { DT.tracks = false; applyTools(); };
bindSelect('#trackSel', () => renderTracks());
bindSelect('#dtViewSel', v => {
  if (v === 'Multi View' || v === '주변 카메라') { if (!DT.tools.includes('multi')) DT.tools.push('multi'); }
  else DT.tools = DT.tools.filter(x => x !== 'multi');
  if (v === '맵뷰어' && !DT.mapTools.includes('cctv')) { DT.mapTools.push('cctv'); if (DT._tab) renderDetail(DT._tab); }
  applyTools();
});
bindSelect('#dtNearSel', v => { CMP.near = v; renderNear(DT._tab); });
$('#dtNearQ').oninput = e => { DT.nearQ = e.target.value; renderNear(DT._tab); };
$('#dtFull').onclick = () => openVideoView();
$('#dtPlay').onclick = () => toast('영상 재생은 정지 이미지로 대체되어 있습니다.');
$('#dtObjAdd').onclick = () => openObjAdd('group');
$('#dtObjMore').onclick = e => openObjMenu(e);
$('#dtCam').parentElement.onclick = () => {
  if (!DT._tab || DT._tab.kind !== 'group') return;
  DT.clip = (DT.clip + 1) % DT.clips.length;
  $('#dtVideoImg').src = DT.clips[DT.clip].img;
  renderDetail(DT._tab);
};

/* 탐지 이력 편집 — 인라인(취소/저장) + 팝업(B안) 병행 */
function bindHistEdit(tab) {
  const e1 = $('#dtEdit');
  if (e1) e1.onclick = () => { DT.edit = true; renderDetail(tab); };
  const c = $('#dtEditCancel'), s = $('#dtEditSave');
  if (c) c.onclick = () => { DT.edit = false; DT.removed = new Set(); renderDetail(tab); };
  if (s) s.onclick = () => { DT.edit = false; renderDetail(tab); toast(`탐지 이력 ${DT.clips.length}건으로 저장했습니다.`); };
}

/* 클립 추가 — WF 'B안 : 팝업 노출 (기존 대상 편집과 통일)' 채택
   (A안 = 우측 패널 드래그 앤 드랍. 사양서 21·26장표 선례를 따라 B안으로 통일) */
function openClipAdd(tab) {
  const pool = GROUP_CLIPS.filter(c => DT.removed.has(c.id));
  const extra = OBJECTS.filter(o => o.group === (tab.obj.group || 'c1')).slice(0, 6)
    .map(o => ({ id: 'x_' + o.id, img: o.img, cam: o.cam, n: 2 }));
  const cand = [...pool, ...extra];
  const sel = new Set();
  $('#edTitle').textContent = '탐지 이력 클립 추가';
  $('#edDesc').textContent = '이 대상의 탐지 이력에 추가할 클립을 선택해 주세요.';
  $('#edBack').hidden = true;
  const draw = () => {
    $('#edBody').innerHTML = `
      <div class="ed-total">총 ${sel.size}건 선택</div>
      <div class="pick-grid">${cand.length ? cand.map(c =>
        `<div class="pick${sel.has(c.id) ? ' on' : ''}" data-dt="${c.id}"><img src="${c.img}"></div>`).join('')
        : `<div class="ie-loading" style="grid-column:1/-1;color:#6b7785">추가할 수 있는 클립이 없습니다.</div>`}</div>`;
    $('#edFoot').innerHTML = `<button class="btn-ghost" id="dtEdCancel">취소</button><button class="btn-primary" id="dtEdOk" ${sel.size ? '' : 'disabled'}>추가</button>`;
    $$('[data-dt]', $('#edBody')).forEach(n => n.onclick = () => { const id = n.dataset.dt; sel.has(id) ? sel.delete(id) : sel.add(id); draw(); });
    $('#dtEdCancel').onclick = () => closeModal('#mdEdit');
    $('#dtEdOk').onclick = () => {
      sel.forEach(id => DT.removed.delete(id));
      closeModal('#mdEdit'); renderDetail(tab); toast(`${sel.size}건을 탐지 이력에 추가했습니다.`);
    };
  };
  draw(); openModal('#mdEdit');
}

/* ============================================================
   경로 비교 화면 (WF 비교 : 대상 2개 / 4개)
   ============================================================ */
function openCompareTab(ids) {
  const objs = ids.slice(0, 4).map((id, i) => {
    const o = findObj(id);
    return { ...o, slot: CMP_SLOTS[i].k, label: CMP_SLOTS[i].label };
  });
  CMP.objs = objs; CMP.tab = '전체'; CMP.openLane = null;
  const first = objs[0];
  newTab(`경로 비교 > ${first ? first.cam : ''}`, first, { kind: 'compare' });
}

/* 타일을 16:9로 유지하며 스테이지에 맞춘다 (n2 = 1×2, n4 = 2×2) */
function fitCmpGrid() {
  const stage = $('#cmpMain .cmp-stage'), grid = $('#cmpGrid');
  if (!stage || !grid || $('#cmpMain').hidden) return;
  const cols = 2, rows = CMP.objs.length <= 2 ? 1 : 2;
  const ar = (16 / 9) * cols / rows;
  const availW = stage.clientWidth - 4, availH = stage.clientHeight - 40;
  let w = availW, hh = w / ar;
  if (hh > availH) { hh = availH; w = hh * ar; }
  grid.style.width = Math.round(w) + 'px'; grid.style.height = Math.round(hh) + 'px';
}
addEventListener('resize', () => { fitCmpGrid(); if (DT._tab && DT.tools.includes('path')) renderTracks(); });

function renderCmpView(tab) {
  const objs = CMP.objs;
  const slots = objs.length <= 2 ? 2 : 4;
  const grid = $('#cmpGrid');
  grid.className = 'cmp-grid ' + (slots === 2 ? 'n2' : 'n4');

  /* ---- 영상 타일 ---- */
  let h = '';
  for (let i = 0; i < slots; i++) {
    const s = CMP_SLOTS[i], o = objs[i];
    if (o) {
      h += `<div class="cmp-tile" data-tile="${i}">
        <img src="${SLOT_STILLS[i] || o.img}" alt="">
        <div class="cmp-head">
          <span class="cmp-badge" style="background:${s.color}">${s.k}</span>
          <span class="slotn">${i + 1}</span>
          <span class="nm">${o.cam}<i class="i i-16 i-chevron i-down caret"></i></span>
          <span class="tm">2026-06-29 오전 00:52:03 ~ 02:10:11</span>
          ${i === 0 ? '' : `<button class="btn-icon x" data-rmslot="${i}">${ICON.x}</button>`}
        </div>
        <div class="cmp-box" style="left:52%;top:14%;width:12%;height:52%;border-color:${s.color};background:${s.color}12"><i style="background:${s.color}">${s.label}</i></div>
      </div>`;
    } else {
      h += `<div class="cmp-tile empty" data-empty="${i}">
        <div class="cmp-head">
          <span class="cmp-badge" style="background:${s.color}">${s.k}</span>
          <span class="slotn">-</span>
          <span class="nm">-<i class="i i-16 i-chevron i-down caret"></i></span>
          <button class="btn-icon x" data-clrslot="${i}">${ICON.x}</button>
        </div>
      </div>`;
    }
  }
  grid.innerHTML = h;
  $('#cmpCtrl').innerHTML = ctrlHTML({ dimRight: true });
  fitCmpGrid();
  $$('#cmpGrid [data-rmslot]').forEach(b => b.onclick = e => {
    e.stopPropagation();
    CMP.objs = CMP.objs.filter((_, i) => i !== +b.dataset.rmslot).map((o, i) => ({ ...o, slot: CMP_SLOTS[i].k, label: CMP_SLOTS[i].label }));
    renderCmpView(tab);
  });
  $$('#cmpGrid [data-empty]').forEach(n => n.onclick = () => openObjAdd('compare'));
  $$('#cmpGrid [data-clrslot]').forEach(b => b.onclick = e => e.stopPropagation());
  $$('#cmpGrid .cmp-tile:not(.empty)').forEach(n => n.onclick = e => {
    if (e.target.closest('[data-rmslot]')) return;
    const o = CMP.objs[+n.dataset.tile];
    openVideoView({ cam: o.cam, img: n.querySelector('img').src, label: o.label, slot: o.slot });
  });

  /* ---- 멀티 레인 탐지 이력 ---- */
  $('#cmpRuler').innerHTML = rulerHTML({ head: 5 });
  $('#cmpLanes').innerHTML = objs.map(o => {
    const lane = HIST_LANES[o.slot] || [];
    return `<div class="dt-lane${CMP.openLane === o.slot ? ' open' : ''}" data-lane="${o.slot}">
      <span class="lb">${ICON.caret}${o.label}</span>
      <span class="track">${lane.map(s =>
        `<span class="seg" data-lseg="${o.slot}:${s.n}" style="left:${s.x}%;width:${s.w}%;background:${slotColor(o.slot)}${CMP.openLane === o.slot ? '' : 'b0'}">${s.n}</span>`).join('')}</span>
    </div>`;
  }).join('');
  $$('#cmpLanes .lb').forEach(n => n.onclick = () => {
    const k = n.parentElement.dataset.lane;
    CMP.openLane = CMP.openLane === k ? null : k;
    renderCmpView(tab);
  });

  /* 레인 펼침 → 클립 스트립 */
  const openObj = objs.find(o => o.slot === CMP.openLane);
  if (openObj) {
    const pts = (MOVE_PATHS.find(p => p.slot === openObj.slot) || MOVE_PATHS[0]).pts;
    $('#cmpClips').hidden = false;
    $('#cmpClips').innerHTML = pts.map((p, i) => `
      <div class="dt-clip${i === 0 ? ' on' : ''}" data-cclip="${i}" style="${i === 0 ? `border-color:${slotColor(openObj.slot)}` : ''}">
        <img src="${p.img}" alt="">
        ${i === 0 ? `<span class="bk on">${ICON.bmark}</span>` : ''}
        <span class="cap"><span class="n">${p.n} ${i === 0 ? p.cam : ''}</span>${i === 0 ? `<span class="n" style="margin-left:auto">${ICON.play}4</span>` : ''}</span>
      </div>`).join('');
    $$('#cmpClips .dt-clip').forEach(n => n.onclick = () => {
      $$('#cmpClips .dt-clip').forEach(x => { x.classList.remove('on'); x.style.borderColor = ''; });
      n.classList.add('on'); n.style.borderColor = slotColor(openObj.slot);
    });
  } else { $('#cmpClips').hidden = true; $('#cmpClips').innerHTML = ''; }
  $('#cmpHistBtns').innerHTML = `<button class="btn-ghost sm" id="cmpEditBtn">편집</button>`;
  $('#cmpEditBtn').onclick = () => toast('비교 화면의 탐지 이력 편집은 대상별 상세에서 수행합니다.');

  /* ---- 우측 패널 : 대상 탭 + 카드 목록 ---- */
  $('#dtObjAdd').hidden = false; $('#dtObjAdd').disabled = objs.length >= 4;
  $('#cmpTabs').innerHTML = `<button class="${CMP.tab === '전체' ? 'on' : ''}" data-ct="전체">전체</button>` +
    objs.map((o, i) => `<button class="${CMP.tab === o.label ? 'on' : ''}" data-ct="${o.label}">${o.label}${i === 0 ? '' : `<span class="x" data-cx="${i}">${ICON.xs}</span>`}</button>`).join('');
  $$('#cmpTabs [data-ct]').forEach(b => b.onclick = e => {
    if (e.target.closest('[data-cx]')) {
      const i = +e.target.closest('[data-cx]').dataset.cx;
      CMP.objs = CMP.objs.filter((_, k) => k !== i).map((o, k) => ({ ...o, slot: CMP_SLOTS[k].k, label: CMP_SLOTS[k].label }));
      CMP.tab = '전체'; renderCmpView(tab); return;
    }
    CMP.tab = b.dataset.ct; renderCmpView(tab);
  });

  const shown = CMP.tab === '전체' ? objs : objs.filter(o => o.label === CMP.tab);
  $('#dtObjMulti').innerHTML = shown.map(o => {
    const pts = (MOVE_PATHS.find(p => p.slot === o.slot) || MOVE_PATHS[0]).pts;
    return `<div class="dt-obj cmp-obj">
      <div class="dt-obj-th"><img src="${o.img}" alt=""></div>
      <div class="dt-obj-bd">
        <div class="dt-obj-top">
          ${ICON2.person}<b>${o.label}</b>
          <span class="badge sub">${pts.length}건 통합</span>
          <span class="badge">${o.sim}% 유사</span>
          <button class="btn-icon" data-objmenu="${o.slot}" style="margin-left:auto">${ICON.more}</button>
        </div>
        <dl class="dt-obj-meta">
          <div><dt>이벤트 시간</dt><dd>${o.t}</dd></div>
          <div><dt>이벤트</dt><dd>${o.group === 'etc' ? '-' : '이동/계수'}</dd></div>
          <div><dt>색상</dt><dd class="sw-row"><span>상의<i class="dot-sw" style="background:${colorHex(o.top)}"></i></span><span>하의<i class="dot-sw" style="background:${colorHex(o.bottom)}"></i></span></dd></div>
        </dl>
      </div>
    </div>`;
  }).join('');
  $$('#dtObjMulti [data-objmenu]').forEach(b => b.onclick = e => openObjMenu(e, b.dataset.objmenu));

  /* ---- 맵뷰어 : 다중 경로 ---- */
  const paths = objs.map(o => MOVE_PATHS.find(p => p.slot === o.slot)).filter(Boolean);
  $('#dtFloor').innerHTML = `1층 <svg viewBox="0 0 10 6" style="width:8px;height:5px;margin-left:3px"><path d="M1 1l4 4 4-4" stroke="currentColor" fill="none" stroke-width="1.3"/></svg>`;
  renderMapLayers(paths, objs[0] && objs[0].cam);

  /* ---- 주변 대상 ---- */
  renderNear(tab);
  DT._tab = tab;
}

/* 대상 카드 ⋮ 메뉴 — 관심인물 등록 / 북마크 / 사건 등록 */
const CTX_DEFAULT = `<div data-act="bookmark">북마크</div><div data-act="report">오대상 신고</div>`;
function openObjMenu(e, slot) {
  e.stopPropagation();
  const m = $('#ctxMenu');
  m.innerHTML = `<div data-act="watch">관심인물 등록</div><div data-act="vbookmark">영상 북마크</div><div data-act="case">사건 등록</div><div data-act="report">오대상 신고</div>`;
  const r = e.target.getBoundingClientRect();
  m.style.left = Math.min(r.left - 110, innerWidth - 160) + 'px';
  m.style.top = (r.bottom + 4) + 'px';
  m.hidden = false;
  $$('div', m).forEach(d => d.onclick = () => {
    m.hidden = true; m.innerHTML = CTX_DEFAULT;
    if (d.dataset.act === 'watch') openWatch();
    else if (d.dataset.act === 'vbookmark') openBookmark();
    else if (d.dataset.act === 'case') openCase();
    else toast('오대상로 신고했습니다.');
  });
}

/* ============================================================
   팝업 ① 맵뷰어 전체보기 (A안 리스트형 / B안 썸네일형)
   ============================================================ */
let mvwPlan = 'b', mvwSel = 0;
function openMapView() {
  renderMapView(); openModal('#mdMapView');
}
function mvwPaths() {
  if (DT._tab && DT._tab.kind === 'compare') return CMP.objs.map(o => MOVE_PATHS.find(p => p.slot === o.slot)).filter(Boolean);
  return MOVE_PATHS.slice(0, 1);
}
function renderMapView() {
  const paths = mvwPaths();
  const mapImg = DT.map === 'map' ? 'assets/img/map.png' : 'assets/img/floor.png';
  const seg = `<div class="seg"><button class="${DT.map === 'map' ? 'on' : ''}" data-mm="map">지도</button><button class="${DT.map === 'map' ? '' : 'on'}" data-mm="floor">층별</button></div>`;
  const tools = `<div class="tools">
      <button class="btn-icon${DT.mapTools.includes('cctv') ? ' on' : ''}" data-mvt="cctv" title="CCTV 표시"><svg viewBox="0 0 16 16" class="ic"><path d="M2.5 6l5-3.2 6 2.6-1 6.4-6.6 1.4z" stroke="currentColor" stroke-width="1.2" fill="none"/></svg></button>
      <span class="sepv"></span>
      <button class="btn-icon" data-mvt="path" title="이동경로"><svg viewBox="0 0 16 16" class="ic"><path d="M4 14V6a2 2 0 012-2h4a2 2 0 002-2" stroke="currentColor" stroke-width="1.3" fill="none"/></svg></button>
    </div>`;
  const conesHTML = DT.mapTools.includes('cctv') ? MAP_CCTV.map((c, i) =>
    `<span class="map-cone" data-mvc="${i}" style="left:${c.x}%;top:${c.y}%;rotate:${c.deg}deg"><i></i><b></b></span>`).join('') : '';
  const pathSvg = `<div class="map-path"><svg viewBox="0 0 100 100" preserveAspectRatio="none">${paths.map(p =>
    `<path d="M${p.pts.map(t => `${t.x},${t.y}`).join(' L')}" stroke="${slotColor(p.slot)}" vector-effect="non-scaling-stroke"/>`).join('')}</svg></div>`;
  const wps = paths.map(p => p.pts.map(t =>
    `<span class="map-wp" data-mvw="${p.slot}:${t.n}" style="left:${t.x}%;top:${t.y}%;background:${slotColor(p.slot)}">${t.n}</span>`).join('')).join('');
  const peek = (() => {
    const p = paths[0], t = p && p.pts[Math.min(mvwSel, p.pts.length - 1)];
    if (!t) return '';
    return `<div class="cctv-pop" style="left:${Math.max(4, t.x - 14)}%;top:${Math.max(4, t.y - 30)}%">
      ${paths.map(q => `<img src="${(q.pts[Math.min(mvwSel, q.pts.length - 1)] || q.pts[0]).img}" alt="">`).join('')}
      <span class="cap">${t.cam}</span></div>`;
  })();
  const mapPane = `<div class="mvw-map">
      <img src="${mapImg}" alt="">${pathSvg}${conesHTML}${wps}${peek}${seg}${tools}
      <div class="dt-zoom"><button>+</button><button>−</button></div>
    </div>`;

  if (mvwPlan === 'a') {
    /* A안 : 시간축 정렬 리스트 */
    const axis = [0, 2, 4, 8, 10, 12, 14, 16, 18, 20, 22, 24];
    $('#mvwBody').innerHTML = `<div class="mvw">${mapPane}
      <div class="mvw-side">
        <b>이동경로</b>
        <div class="mvw-heads">${paths.map(p => `<span><i style="background:${slotColor(p.slot)}"></i>${p.label.replace(' ', '')}</span>`).join('')}</div>
        <div class="mvw-time">
          <div class="mvw-axis">${axis.map((v, i) => `<span style="top:${i / (axis.length - 1) * 96 + 2}%">${String(v).padStart(2, '0')}</span>`).join('')}</div>
          ${paths.map(p => `<div class="mvw-col">${p.pts.map(t =>
            `<div class="mvw-wp${t.n === mvwSel + 1 ? ' on' : ''}" data-mvl="${p.slot}:${t.n}" style="top:${t.hh / 24 * 94 + 1}%">
              <span class="n">${t.n}</span><div><div class="nm">${t.cam}</div><div class="mt">${t.t}·${t.code}</div></div></div>`).join('')}</div>`).join('')}
        </div>
      </div></div>`;
  } else {
    /* B안 : 하단 영상 썸네일 스트립 */
    const p0 = paths[0];
    $('#mvwBody').innerHTML = `<div class="mvw b">${mapPane}
      <div class="mvw-strip">
        <b>이동경로<em>( 출현 지점 ${p0.pts.length}개 )</em></b>
        <div class="mvw-cards">${p0.pts.map((t, i) => `
          <div class="mvw-card${i === mvwSel ? ' on' : ''}" data-mvs="${i}">
            <img src="${t.img}" alt="">
            <span class="n" style="background:${slotColor(p0.slot)}">${t.n}</span>
            <div class="bd"><div class="nm">${t.cam}</div><div class="tm">2026-06-30 14:52:03</div>
              <button class="go" data-mvgo="${i}">${ICON2.ext}</button></div>
          </div>`).join('')}</div>
      </div></div>`;
  }

  /* 바인딩 */
  $$('#mvwBody [data-mm]').forEach(b => b.onclick = () => {
    DT.map = b.dataset.mm;
    $('#dtMapImg').src = DT.map === 'map' ? 'assets/img/map.png' : 'assets/img/floor.png';
    $('#dtFloor').hidden = DT.map === 'map';
    renderMapView();
  });
  $$('#mvwBody [data-mvt]').forEach(b => b.onclick = () => {
    const k = b.dataset.mvt;
    if (k === 'path') { toast('이동경로 표시는 항상 켜져 있습니다.'); return; }
    DT.mapTools = DT.mapTools.includes(k) ? DT.mapTools.filter(x => x !== k) : [...DT.mapTools, k];
    renderMapView();
  });
  $$('#mvwBody [data-mvs]').forEach(n => n.onclick = () => { mvwSel = +n.dataset.mvs; renderMapView(); });
  $$('#mvwBody [data-mvl]').forEach(n => n.onclick = () => { mvwSel = +n.dataset.mvl.split(':')[1] - 1; renderMapView(); });
  $$('#mvwBody [data-mvw]').forEach(n => n.onclick = () => { mvwSel = +n.dataset.mvw.split(':')[1] - 1; renderMapView(); });
  $$('#mvwBody [data-mvgo]').forEach(b => b.onclick = e => {
    e.stopPropagation();
    const p0 = mvwPaths()[0], t = p0.pts[+b.dataset.mvgo];
    openVideoView({ cam: t.cam, img: t.img });
  });
  $$('#mvwBody .map-cone').forEach(n => n.onclick = () => openVideoView(MAP_CCTV[+n.dataset.mvc]));
}
$$('#mvwPlan button').forEach(b => b.onclick = () => {
  $$('#mvwPlan button').forEach(x => x.classList.toggle('on', x === b));
  mvwPlan = b.dataset.p; renderMapView();
});

/* 맵뷰어 '이동경로' 플로팅 패널 */
function toggleMovePath(anchor) {
  const p = $('#pnlMovePath');
  if (!p.hidden) { p.hidden = true; return; }
  const paths = mvwPaths();
  $('#movePathBody').innerHTML = `
    <div class="mvw-heads">${paths.map(x => `<span><i style="background:${slotColor(x.slot)}"></i>${x.label}</span>`).join('')}</div>
    <div style="display:flex;gap:8px;max-height:290px;overflow-y:auto">
      ${paths.map(x => `<div style="flex:1;display:flex;flex-direction:column;gap:5px">${x.pts.map(t => `
        <div class="mvw-wp" data-mp="${t.cam}" style="position:relative">
          <span class="n">${t.n}</span><div><div class="nm">${t.cam}</div><div class="mt">${t.t}·${t.code}</div></div>
        </div>`).join('')}</div>`).join('')}
    </div>`;
  const r = anchor.getBoundingClientRect();
  p.style.left = Math.min(r.left - 200, innerWidth - 280) + 'px';
  p.style.top = (r.bottom + 6) + 'px';
  p.hidden = false;
  $('#movePathBody').querySelectorAll('[data-mp]').forEach((n, i) => n.onclick = () => {
    n.parentElement.querySelectorAll('.mvw-wp').forEach(x => x.classList.remove('on'));
    n.classList.add('on');
  });
  const f = $('#movePathBody [data-mp]'); if (f) f.classList.add('on');
}
$('#pnlMovePathX').onclick = () => $('#pnlMovePath').hidden = true;

/* ============================================================
   팝업 ② 영상 조회 (전체보기)
   ============================================================ */
function openVideoView(src) {
  const o = (DT._tab && DT._tab.obj) || OBJECTS[0];
  const cam = (src && src.cam) || o.cam;
  const img = (src && src.img) || $('#dtVideoImg').src;
  const label = (src && src.label) || (DT._tab && DT._tab.label) || '인물 A';
  const color = slotColor((src && src.slot) || 'A');
  $('#vwBody').innerHTML = `<div class="vw">
    <div class="vw-stage">
      <img src="${img}" alt="">
      <div class="vw-head">
        <span class="nm">${cam}<i class="i i-16 i-chevron i-down caret"></i></span>
        <span class="tm">2026-06-29 오전 00:52:03 ~ 02:10:11</span>
      </div>
      <div class="cmp-box" style="left:53%;top:12%;width:13%;height:56%;border-color:${color};background:${color}12"><i style="background:${color}">${label}</i></div>
    </div>
    <div class="vw-foot">
      <div class="dt-ruler" style="margin-bottom:6px">${rulerHTML({ head: 2 })}</div>
      <div class="dt-seg-row">${HIST_LANES.A.map(s =>
        `<span class="seg${s.n === 1 ? ' on' : ''}" style="left:${s.x}%;width:${s.w}%">${s.n}</span>`).join('')}</div>
      <div class="dt-ctrl" style="position:static;background:none;padding:0">${ctrlHTML()}</div>
    </div>
  </div>`;
  openModal('#mdVideo');
}

/* ============================================================
   팝업 ③ 관심인물 등록
   ============================================================ */
let watchForm = null;
function openWatch() {
  const o = (DT._tab && DT._tab.obj) || OBJECTS[0];
  watchForm = { imgs: [o.img, ...WATCH_IMGS.filter(i => i !== o.img)].slice(0, 6), sel: 0, name: '', term: WATCH_TERMS[0], cls: WATCH_CLASSES[0], reason: '', alarm: '상시 사용' };
  renderWatch(); openModal('#mdWatch');
}
function renderWatch() {
  const f = watchForm;
  $('#watchBody').innerHTML = `
    <div class="fm-row">
      <span class="fm-lb">대표 이미지 <em style="font-style:normal;color:var(--muted);font-family:var(--mono)">( ${f.sel + 1} / ${f.imgs.length} )</em></span>
      <div class="wp-strip">${f.imgs.map((im, i) =>
        `<div class="wp-thumb${i === f.sel ? ' on' : ''}" data-wi="${i}"><img src="${im}" alt=""></div>`).join('')}</div>
    </div>
    <div class="fm-grid">
      <div><span class="fm-lb">식별명<i>*</i></span><input class="fm-in" id="wfName" placeholder="식별명" value="${f.name}"></div>
      <div><span class="fm-lb">유효기간</span>
        <div class="select" id="wfTerm" data-value="${f.term}">
          <button class="select-btn" style="width:100%;height:30px;justify-content:space-between">${f.term}${ICON.caret}</button>
          <div class="select-menu" style="width:100%">${WATCH_TERMS.map(t => `<div data-v="${t}"${t === f.term ? ' class="on"' : ''}>${t}</div>`).join('')}</div>
        </div></div>
    </div>
    <div class="fm-row" style="margin-top:15px"><span class="fm-lb">분류</span>
      <div class="pill-row">${WATCH_CLASSES.map(c => `<button class="pill${c === f.cls ? ' on' : ''}" data-wc="${c}">${c}</button>`).join('')}</div>
    </div>
    <div class="fm-row"><span class="fm-lb">등록 사유<i>*</i></span><input class="fm-in" id="wfReason" placeholder="등록 사유" value="${f.reason}"></div>
    <div class="fm-row"><span class="fm-lb">실시간 알림</span>
      <div class="radio-row">${['상시 사용', '미사용', '스케줄 설정'].map(a =>
        `<label class="radio"><input type="radio" name="wfal" data-wa="${a}" ${f.alarm === a ? 'checked' : ''}><i></i>${a}</label>`).join('')}</div>
      ${f.alarm === '스케줄 설정' ? `<div style="display:flex;gap:8px;margin-top:10px">
        <span class="cs-dt">${ICON.clock}<input type="time" value="18:00"></span>
        <span style="align-self:center;color:var(--muted)">~</span>
        <span class="cs-dt">${ICON.clock}<input type="time" value="09:00"></span></div>` : ''}
    </div>`;
  const ok = f.name.trim() && f.reason.trim();
  $('#watchFoot').innerHTML = `<button class="btn-ghost" data-close>취소</button><button class="btn-primary" id="wfOk" ${ok ? '' : 'disabled'}>완료</button>`;
  $$('#watchBody [data-wi]').forEach(n => n.onclick = () => { f.sel = +n.dataset.wi; renderWatch(); });
  $$('#watchBody [data-wc]').forEach(b => b.onclick = () => { f.cls = b.dataset.wc; renderWatch(); });
  $$('#watchBody [data-wa]').forEach(r => r.onchange = () => { f.alarm = r.dataset.wa; renderWatch(); });
  bindSelect('#wfTerm', v => { f.term = v; });
  $('#wfName').oninput = e => { f.name = e.target.value; $('#wfOk').disabled = !(f.name.trim() && f.reason.trim()); };
  $('#wfReason').oninput = e => { f.reason = e.target.value; $('#wfOk').disabled = !(f.name.trim() && f.reason.trim()); };
  $$('#mdWatch [data-close]').forEach(b => b.onclick = () => closeModal('#mdWatch'));
  $('#wfOk').onclick = () => { closeModal('#mdWatch'); toast(`관심인물 '${f.name}' (${f.cls}) 등록했습니다. · 유효기간 ${f.term}`); };
}

/* ============================================================
   팝업 ④ 비교 대상 추가
   ============================================================ */
let oaState = null;
function openObjAdd(from) {
  oaState = { from, q: '', kind: '전체', spot: '출현 지점', sel: [], closed: new Set() };
  renderObjAdd(); openModal('#mdObjAdd');
}
function renderObjAdd() {
  const st = oaState;
  const max = st.from === 'compare' ? Math.max(0, 4 - CMP.objs.length) : 3;
  let list = CMP_POOL.filter(c => !st.q || c.name.includes(st.q) || c.cam.includes(st.q));
  const card = c => `<div class="oa-card${st.sel.includes(c.id) ? ' on' : ''}" data-oa="${c.id}">
      <img src="${c.img}" alt="">
      <div class="bd">
        <div class="t1">${ICON2.person}<b>${c.name}</b><span class="badge sub">${c.n}건 통합</span><span class="badge">${c.sim}% 유사</span></div>
        <div class="t2">${c.cam}</div><div class="t3">${c.t}</div>
      </div></div>`;

  /* 비교 화면에서 추가 = 출처별 그룹 / 기존 화면에서 추가 = 단일 목록 */
  let body;
  if (st.from === 'compare') {
    const groups = ['공통', ...CMP.objs.map(o => o.label)];
    body = groups.map(g => {
      const items = list.filter(c => c.src === g);
      if (!items.length) return '';
      const closed = st.closed.has(g);
      return `<div class="oa-group${closed ? ' closed' : ''}" data-oag="${g}">${ICON.caret}${g} (${items.length})</div>`
        + (closed ? '' : items.map(card).join(''));
    }).join('');
  } else body = list.map(card).join('');

  $('#oaBody').innerHTML = `
    <input class="fm-in" id="oaQ" placeholder="검색어를 입력해 주세요." value="${st.q}" style="margin-bottom:11px">
    <div class="oa-tools">
      <div class="select sm" id="oaKind" data-value="${st.kind}">
        <button class="select-btn" style="width:96px;justify-content:space-between">${st.kind}${ICON.caret}</button>
        <div class="select-menu">${['전체', '인물', '차량', '사물'].map(k => `<div data-v="${k}">${k}</div>`).join('')}</div>
      </div>
      <div class="select sm" id="oaSpot" data-value="${st.spot}">
        <button class="select-btn" style="width:104px;justify-content:space-between">${st.spot}${ICON.caret}</button>
        <div class="select-menu">${['출현 지점', ...CAMERAS.slice(0, 5)].map(k => `<div data-v="${k}">${k}</div>`).join('')}</div>
      </div>
    </div>
    <div class="oa-count">총 ${list.length}<span class="badge">${st.sel.length}/${max}</span></div>
    <div class="oa-list">${body || `<div class="ie-loading" style="grid-column:1/-1;color:#6b7785">조건에 맞는 대상가 없습니다.</div>`}</div>`;
  $('#oaFoot').innerHTML = `<button class="btn-ghost" data-close>취소</button><button class="btn-primary" id="oaOk" ${st.sel.length ? '' : 'disabled'}>추가</button>`;

  $('#oaQ').oninput = e => { st.q = e.target.value; renderObjAdd(); $('#oaQ').focus(); };
  bindSelect('#oaKind', v => { st.kind = v; });
  bindSelect('#oaSpot', v => { st.spot = v; });
  $$('#oaBody [data-oag]').forEach(n => n.onclick = () => {
    const g = n.dataset.oag; st.closed.has(g) ? st.closed.delete(g) : st.closed.add(g); renderObjAdd();
  });
  $$('#oaBody [data-oa]').forEach(n => n.onclick = () => {
    const id = n.dataset.oa;
    if (st.sel.includes(id)) st.sel = st.sel.filter(x => x !== id);
    else { if (st.sel.length >= max) { toast(`최대 ${max}건까지 선택할 수 있습니다.`); return; } st.sel.push(id); }
    renderObjAdd();
  });
  $$('#mdObjAdd [data-close]').forEach(b => b.onclick = () => closeModal('#mdObjAdd'));
  $('#oaOk').onclick = () => {
    closeModal('#mdObjAdd');
    if (st.from === 'group') { toast(`${st.sel.length}건을 대상 그룹에 추가했습니다.`); return; }
    st.sel.forEach(id => {
      const c = CMP_POOL.find(x => x.id === id);
      if (CMP.objs.length >= 4) return;
      const i = CMP.objs.length;
      CMP.objs.push({ id: c.id, img: c.img, cam: c.cam, t: c.t, sim: c.sim, group: 'etc', top: 'white', bottom: 'black', slot: CMP_SLOTS[i].k, label: CMP_SLOTS[i].label });
    });
    if (DT._tab && DT._tab.kind === 'compare') renderCmpView(DT._tab);
    else openCompareTab(CMP.objs.map(o => o.id));
    toast(`비교 대상 ${CMP.objs.length}건으로 갱신했습니다.`);
  };
}

/* ============================================================
   팝업 ⑤ 사건 등록
   ============================================================ */
let caseForm = null;
function openCase() {
  caseForm = { mode: 'new', name: '', state: CASE_STATES[0], kind: CASE_KINDS[0], from: '2026-06-29', tFrom: '08:00', to: '2026-06-29', tTo: '12:00', desc: '', q: '', filter: '전체', pick: null };
  renderCase(); openModal('#mdCase');
}
function renderCase() {
  const f = caseForm;
  const o = (DT._tab && DT._tab.obj) || OBJECTS[0];
  const label = (DT._tab && DT._tab.label) || '인물 A';
  const vids = DT.clips.length || 6;
  const objCard = `<div class="cs-obj">
      <img src="${o.img}" alt="">
      <div class="bd">
        <div class="ln">${ICON2.person}${label}</div>
        <div class="ln">${ICON2.cam}영상 ${vids}건</div>
        <button class="ed" id="csEditObj">수정</button>
      </div></div>`;

  const head = `<div class="cs-row"><span class="k">생성 방법</span><div class="v">
      <label class="radio"><input type="radio" name="csm" data-csm="new" ${f.mode === 'new' ? 'checked' : ''}><i></i>새 사건 등록</label>
      <label class="radio"><input type="radio" name="csm" data-csm="add" ${f.mode === 'add' ? 'checked' : ''}><i></i>기존 사건에 추가</label>
    </div></div>
    <div class="cs-row"><span class="k">${f.mode === 'new' ? '등록 대상' : '추가 대상'}</span><div class="v">${objCard}</div></div>`;

  if (f.mode === 'new') {
    $('#caseBody').innerHTML = head + `
      <div class="cs-row"><span class="k">사건명<i>*</i></span><div class="v"><input class="fm-in" id="csName" placeholder="사건명" value="${f.name}"></div></div>
      <div class="cs-row"><span class="k">상태</span><div class="v">
        <div class="select" id="csState" data-value="${f.state}" style="flex:1">
          <button class="select-btn" style="width:100%;height:32px;justify-content:space-between">${f.state}${ICON.caret}</button>
          <div class="select-menu" style="width:100%">${CASE_STATES.map(s => `<div data-v="${s}">${s}</div>`).join('')}</div></div>
        <span style="font-size:11px;color:#c7d2dc;padding:0 4px">분류</span>
        <div class="select" id="csKind" data-value="${f.kind}" style="flex:1">
          <button class="select-btn" style="width:100%;height:32px;justify-content:space-between">${f.kind}${ICON.caret}</button>
          <div class="select-menu" style="width:100%">${CASE_KINDS.map(s => `<div data-v="${s}">${s}</div>`).join('')}</div></div>
      </div></div>
      <div class="cs-row"><span class="k">사건 시작일시</span><div class="v">
        <span class="cs-dt">${ICON.cal}<input type="date" id="csFrom" value="${f.from}"></span>
        <span class="cs-dt">${ICON.clock}<input type="time" id="csTFrom" value="${f.tFrom}"></span></div></div>
      <div class="cs-row"><span class="k">사건 종료일시</span><div class="v">
        <span class="cs-dt">${ICON.cal}<input type="date" id="csTo" value="${f.to}"></span>
        <span class="cs-dt">${ICON.clock}<input type="time" id="csTTo" value="${f.tTo}"></span></div></div>
      <div class="cs-row"><span class="k">설명<i>*</i></span><div class="v"><input class="fm-in" id="csDesc" placeholder="사건 설명" value="${f.desc}"></div></div>`;
  } else {
    const list = CASES.filter(c => (!f.q || c.name.includes(f.q)) && (f.filter === '전체' || c.state === f.filter));
    $('#caseBody').innerHTML = head + `
      <div class="cs-row" style="border-bottom:0;padding-bottom:4px"><div class="v" style="margin-left:0">
        <div class="select" id="csFilter" data-value="${f.filter}" style="width:130px">
          <button class="select-btn" style="width:100%;height:32px;justify-content:space-between">${f.filter}${ICON.caret}</button>
          <div class="select-menu" style="width:100%">${['전체', ...CASE_STATES].map(s => `<div data-v="${s}">${s}</div>`).join('')}</div></div>
        <input class="fm-in" id="csQ" placeholder="사건명으로 검색하세요" value="${f.q}">
      </div></div>
      <div style="font-size:11px;color:var(--muted);margin:6px 0 2px">총 ${list.length}</div>
      <div class="cs-pick">${list.length ? list.map(c => `
        <div class="cs-item${f.pick === c.id ? ' on' : ''}" data-cs="${c.id}">
          <span class="radio" style="padding:0"><input type="radio" ${f.pick === c.id ? 'checked' : ''}><i></i></span>
          <div class="bd">
            <div class="t1"><b>${c.name}</b><span class="st ${c.state}">${c.state}</span></div>
            <div class="t2">${ICON2.person}대상 ${c.objs}<span>|</span>영상 ${c.vids}건<span>|</span><span class="dtx">${c.from} ~ ${c.to}</span></div>
          </div>
        </div>`).join('') : `<div class="empty-inline">조건에 맞는 사건이 없습니다.</div>`}</div>`;
  }

  const ok = f.mode === 'new' ? (f.name.trim() && f.desc.trim()) : !!f.pick;
  $('#caseFoot').innerHTML = `<button class="btn-ghost" data-close>취소</button><button class="btn-primary" id="csOk" ${ok ? '' : 'disabled'}>등록</button>`;
  $$('#caseBody [data-csm]').forEach(r => r.onchange = () => { f.mode = r.dataset.csm; renderCase(); });
  $$('#caseBody [data-cs]').forEach(n => n.onclick = () => { f.pick = n.dataset.cs; renderCase(); });
  const eo = $('#csEditObj'); if (eo) eo.onclick = () => toast('등록 대상 · 영상 범위는 탐지 이력 편집에서 조정합니다.');
  if (f.mode === 'new') {
    bindSelect('#csState', v => f.state = v); bindSelect('#csKind', v => f.kind = v);
    $('#csName').oninput = e => { f.name = e.target.value; renderCaseFoot(); };
    $('#csDesc').oninput = e => { f.desc = e.target.value; renderCaseFoot(); };
    ['csFrom', 'csTFrom', 'csTo', 'csTTo'].forEach((id, i) => {
      const key = ['from', 'tFrom', 'to', 'tTo'][i];
      $('#' + id).onchange = e => f[key] = e.target.value;
    });
  } else {
    bindSelect('#csFilter', v => { f.filter = v; renderCase(); });
    $('#csQ').oninput = e => { f.q = e.target.value; renderCase(); $('#csQ').focus(); };
  }
  $$('#mdCase [data-close]').forEach(b => b.onclick = () => closeModal('#mdCase'));
  $('#csOk').onclick = () => {
    closeModal('#mdCase');
    toast(f.mode === 'new' ? `사건 '${f.name}' 을 등록했습니다.` : `'${CASES.find(c => c.id === f.pick).name}' 사건에 대상를 추가했습니다.`);
  };
}
function renderCaseFoot() {
  const f = caseForm;
  $('#csOk').disabled = !(f.name.trim() && f.desc.trim());
}

/* ============================================================
   팝업 ⑥ 영상 북마크
   ============================================================ */
let bmForm = null;
function openBookmark() {
  const o = (DT._tab && DT._tab.obj) || OBJECTS[0];
  bmForm = { img: $('#dtVideoImg').src || o.img, place: '2층 로비/택배보관함', cam: 'cam 01-234', memo: '' };
  renderBookmark(); openModal('#mdBookmark');
}
function renderBookmark() {
  const f = bmForm;
  const hours = [11, 12, 13, 14, 15, 16, 17];
  $('#bmBody').innerHTML = `
    <div class="bm-vid">
      <img src="${f.img}" alt="">
      <span class="bm-hash">${ICON2.shield}원본 무결성 SHA-256 검증 완료</span>
      <div class="bm-bar">
        <div class="bm-ruler">
          ${hours.map((hh, i) => {
            const p = i / (hours.length - 1) * 96 + 2;
            return `<span class="lb" style="left:${p}%">${String(hh).padStart(2, '0')}:00</span><span class="tick maj" style="left:${p}%"></span>`
              + [1, 2, 3].map(k => `<span class="tick" style="left:${p + k * 4}%"></span>`).join('');
          }).join('')}
          <span class="sel" style="left:63%;width:9%"></span>
        </div>
        <div class="bm-ctrl">${playCtrlHTML()}</div>
      </div>
    </div>
    <div style="margin-top:14px">
      <div class="bm-field"><span class="k">장소</span><span class="v">${f.place}</span></div>
      <div class="bm-field"><span class="k">카메라명</span><span class="v">${f.cam}</span></div>
      <div class="bm-field"><span class="k">메모</span><span class="v"><input class="fm-in" id="bmMemo" placeholder="메모" value="${f.memo}"></span></div>
    </div>`;
  $('#bmFoot').innerHTML = `<button class="btn-ghost" data-close>취소</button><button class="btn-primary" id="bmOk">등록</button>`;
  $('#bmMemo').oninput = e => f.memo = e.target.value;
  $$('#mdBookmark [data-close]').forEach(b => b.onclick = () => closeModal('#mdBookmark'));
  $('#bmOk').onclick = () => { closeModal('#mdBookmark'); toast('현재 영상 구간을 북마크에 저장했습니다.'); };
}

/* 사건 등록 버튼 */
$('#dtCase').onclick = () => openCase();

/* ===================== 데모 딥링크 =====================
   #demo=result | group | groupopen | compare | ai | aidone | person | algo | image
   특정 상태의 화면을 바로 열기 위한 편의 기능 (검수·캡처용)          */
function applyDemo() {
  const m = (location.hash || '').match(/demo=([a-z0-9]+)/i);
  if (!m) return;
  const d = m[1];
  const setMode = k => { $$('#modeRail button').forEach(x => x.classList.toggle('on', x.dataset.mode === k)); S.mode = k; $$('.mode-panel').forEach(p => p.classList.toggle('on', p.dataset.panel === k)); };

  if (['result', 'group', 'groupopen', 'compare'].includes(d)) {
    S.q = '검정색 모자를 쓴 배송기사'; qText.value = S.q; $('#qTextClear').hidden = false;
    buildFilters('text'); runSearch(false);
    if (d !== 'result') { S.grouped = true; $('#groupToggle').checked = true; S.openGroups.add('etc'); }
    if (d === 'groupopen') S.openGroups.add('c1');
    if (d === 'compare') { S.openGroups.add('c1'); S.compare = ['o01', 'o11']; }
    selectCard('o01');
  }
  if (d === 'editmodal') {
    S.q = '검정색 모자를 쓴 배송기사'; qText.value = S.q; buildFilters('text'); runSearch(false);
    S.grouped = true; $('#groupToggle').checked = true; S.openGroups.add('c1'); renderResults(); openEdit('c1');
  }
  /* ---- 상세화면 WF : 단일 / 그룹 상세 · 화면 변형 ---- */
  const DETAIL_DEMOS = {
    detail: {}, heatmap: { tools: ['obj', 'heat'] },
    path: { tools: ['obj', 'path'] }, pathlist: { tools: ['obj', 'path'], tracks: true },
    cctv: { tools: ['obj', 'cctv'] }, multi: { tools: ['multi'] },
    mapcctv: { tools: ['obj'], mapTools: ['cctv'] },
    area: { tools: ['obj'], area: 'shape' }, areadone: { tools: ['obj'], area: 'shape', drawn: true },
    arealine: { tools: ['obj'], area: 'line' }, arealinedone: { tools: ['obj'], area: 'line', drawn: true },
    gdetail: { kind: 'group' }, gdetailtl: { kind: 'group', edit: true },
    gdetailmap: { kind: 'group', mapTools: ['cctv'] }
  };
  if (DETAIL_DEMOS[d]) {
    const c = DETAIL_DEMOS[d];
    S.q = '검정색 모자를 쓴 배송기사'; qText.value = S.q; buildFilters('text'); runSearch(false);
    DT.tools = c.tools || ['obj'];
    DT.tracks = !!c.tracks; DT.mapTools = c.mapTools || []; DT.edit = !!c.edit;
    if (c.area) DT.area = { mode: c.area, done: !!c.drawn, rect: c.drawn && c.area === 'shape' ? [21, 5, 28, 43] : null, line: c.area === 'line' ? (c.drawn ? [26, 55, 30, 41] : null) : null };
    $$('#dtMapTools [data-map]').forEach(b => b.classList.toggle('on', DT.mapTools.includes(b.dataset.map)));
    const o = OBJECTS[0];
    newTab(c.kind === 'group' ? `${GROUP_CLIPS[0].cam} > 인물 A` : `${o.cam} > 인물 A`, o, c.kind ? { kind: c.kind } : null);
  }
  /* ---- 경로 비교 ---- */
  if (d === 'cmp2' || d === 'cmp4' || d === 'cmpopen') {
    S.q = '검정색 모자를 쓴 배송기사'; qText.value = S.q; buildFilters('text'); runSearch(false);
    openCompareTab(d === 'cmp4' ? ['o01', 'o11', 'o16', 'o19'] : ['o01', 'o11']);
    if (d === 'cmpopen') { CMP.openLane = 'B'; renderCmpView(S.tabs[S.tabs.length - 1]); }
  }
  /* ---- 팝업 ---- */
  const POPUPS = {
    mapview: () => { mvwPlan = 'b'; openMapView(); },
    mapviewa: () => { mvwPlan = 'a'; $$('#mvwPlan button').forEach(x => x.classList.toggle('on', x.dataset.p === 'a')); openMapView(); },
    videoview: () => openVideoView(),
    watch: () => openWatch(),
    objadd: () => openObjAdd('detail'),
    objaddgrp: () => { CMP.objs = [{ ...OBJECTS[0], slot: 'A', label: '인물 A' }, { ...OBJECTS[10], slot: 'B', label: '인물 B' }]; openObjAdd('compare'); },
    casenew: () => openCase(),
    caseadd: () => { openCase(); caseForm.mode = 'add'; renderCase(); },
    vbookmark: () => openBookmark(),
    movepath: () => { DT.mapTools = []; toggleMovePath($('#dtMapTools [data-map=path]')); }
  };
  if (POPUPS[d]) {
    S.q = '검정색 모자를 쓴 배송기사'; qText.value = S.q; buildFilters('text'); runSearch(false);
    const o = OBJECTS[0];
    newTab(`${o.cam} > 인물 A`, o, d === 'movepath' ? { kind: 'group' } : null);
    setTimeout(POPUPS[d], 60);
  }
  if (d === 'personmgr') { switchMode('person'); renderPersonGrid(); openPersonMgr(); }
  if (d === 'history')   { $('#btnHistory').click(); }
  if (d === 'imagemodal'){ setMode('image'); buildFilters('image'); loadImage('assets/img/obj01.png'); }
  if (d === 'person') { setMode('person'); S.selPersons = ['p1', 'p3']; renderPersonGrid(); buildFilters('person'); runSearch(false); }
  if (d === 'algo')   { setMode('algo'); S.algos = ['침입', '배회']; renderAlgoGrid(); buildFilters('algo'); runSearch(false); }
  if (d === 'image')  { setMode('image'); buildFilters('image'); }
  if (d === 'ai' || d === 'aidone') {
    setAI(true);
    if (d === 'aidone') {
      S.aiStage = 'done';
      $('#chat').innerHTML = `<div class="bubble-user">${AI_SUGGESTIONS[2]}</div>
        <div class="bubble-ai">${AI_ANSWER.head}<ul>${AI_ANSWER.items.map(i => `<li>${i}</li>`).join('')}</ul>
        <div class="sugg-title">추천 질문</div>
        <div class="sugg">${AI_ANSWER.follow.map(s => `<button data-s="${s}">${s}</button>`).join('')}</div></div>`;
      $$('#chat [data-s]').forEach(b => b.onclick = () => sendAI(b.dataset.s));
      renderResults();
    }
  }
  render();
}

/* ============================================================
   GNB 아이콘 메뉴 + 메뉴 화면 (UI사양서_0807 확장분)
   검색 · 북마크 · 사건 관리 · 맵 관리 · 알림
   ============================================================ */
const GICON = {
  search:   '<svg viewBox="0 0 16 16" class="ic"><circle cx="7" cy="7" r="4.6" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M10.4 10.4L14 14" stroke="currentColor" stroke-width="1.3"/></svg>',
  bookmark: '<svg viewBox="0 0 16 16" class="ic"><path d="M4 2.2h8v11.6L8 10.6l-4 3.2z" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linejoin="round"/></svg>',
  cases:    '<svg viewBox="0 0 16 16" class="ic"><path d="M3.4 1.8h6l3.2 3.2v9.2H3.4z" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linejoin="round"/><path d="M9.2 1.9V5.2h3.3M5.6 8.4h4.8M5.6 11h4.8" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>',
  map:      '<svg viewBox="0 0 16 16" class="ic"><path d="M8 1.6c2.3 0 4.1 1.8 4.1 4.1 0 2.9-4.1 8.4-4.1 8.4S3.9 8.6 3.9 5.7C3.9 3.4 5.7 1.6 8 1.6z" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="8" cy="5.8" r="1.6" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>',
  alarm:    '<svg viewBox="0 0 16 16" class="ic"><path d="M8 2c2.2 0 3.6 1.6 3.6 3.7 0 2.6.9 3.6 1.3 4.1H3.1c.4-.5 1.3-1.5 1.3-4.1C4.4 3.6 5.8 2 8 2z" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linejoin="round"/><path d="M6.5 12.2a1.6 1.6 0 003 0" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>'
};
const GNB_ITEMS = [
  { k: '',         ic: 'search',   t: '검색' },
  { k: 'bookmark', ic: 'bookmark', t: '북마크' },
  { k: 'case',     ic: 'cases',    t: '사건 관리' },
  { k: 'map',      ic: 'map',      t: '맵 관리' },
  { k: 'alarm',    ic: 'alarm',    t: '알림' }
];
S.menu = null;

function renderMenuBar() {
  $('#mbRight').innerHTML = GNB_ITEMS.map(g =>
    `<button class="gnb-btn${(S.menu || '') === g.k ? ' on' : ''}" data-menu="${g.k}" title="${g.t}">${GICON[g.ic]}</button>`
  ).join('');
  $$('#mbRight [data-menu]').forEach(b => b.onclick = () => setMenu(b.dataset.menu || null));
}
function setMenu(k) {
  S.menu = k || null;
  renderMenuBar();
  $('#workspace').hidden = !!S.menu;
  $('#menuView').hidden = !S.menu;
  /* A타입 : 검색 패널은 '검색' 메뉴 전용 */
  const sp = $('#sidePanel'), ap = $('#aiPanel');
  if (sp) sp.hidden = !!S.menu;
  if (ap && S.menu) ap.hidden = true;
  $('.tabbar').classList.toggle('menu-on', !!S.menu);
  if (S.menu) renderMenu();
}
function renderMenu() {
  if (S.menu === 'bookmark') return renderBmView();
  if (S.menu === 'case') return renderCsView();
  if (S.menu === 'map') return renderMpView();
  if (S.menu === 'alarm') return renderAlView();
  const T = { case: '사건 관리', map: '맵 관리', alarm: '알림' }[S.menu] || '';
  $('#menuView').innerHTML =
    `<div class="mn-panel mn-list"><div class="mn-head"><h3>${T}</h3></div>
     <div class="mn-empty">${T} 화면은 다음 단계에서 구현됩니다.</div></div>`;
}

/* ============================================================
   북마크 (Bookmark_001_01 / _02)
   ============================================================ */
const BM = { filter: '전체', q: '', sel: null, removed: new Set(), edit: false, memo: '', range: null, dirty: false, rep: 0 };
const BM_HOURS = [11, 12, 13, 14, 15, 16, 17];

function bmList() {
  const q = BM.q.trim();
  return BOOKMARKS
    .filter(b => !BM.removed.has(b.id))
    .filter(b => BM.filter === '전체' || (BM.filter === '영상' ? b.kind === 'video' : b.kind === 'object'))
    .filter(b => !q || (b.target || '').includes(q) || (b.place || '').includes(q))
    .sort((a, b) => a.reg < b.reg ? 1 : -1);   /* 등록 일시 최신순 */
}
function bmCur() {
  const L = bmList();
  if (!L.length) return null;
  let c = L.find(b => b.id === BM.sel);
  if (!c) { c = L[0]; BM.sel = c.id; }         /* 최초 진입 시 최신 항목 자동 선택 */
  return c;
}
const BM_STAR = '<svg viewBox="0 0 16 16" class="ic"><path d="M4 2.2h8v11.6L8 10.6l-4 3.2z" fill="currentColor"/></svg>';

function bmRulerHTML(range, head) {
  let h = '';
  BM_HOURS.forEach((hh, i) => {
    const p = i / (BM_HOURS.length - 1) * 96 + 2;
    h += `<span class="lb" style="left:${p}%">${String(hh).padStart(2, '0')}:00</span><span class="tick maj" style="left:${p}%"></span>`;
    h += [1, 2, 3].map(k => `<span class="tick" style="left:${p + k * 4}%"></span>`).join('');
  });
  if (range) h += `<span class="sel" style="left:${range[0]}%;width:${range[1]}%"></span>`;
  if (head != null) h += `<span class="head" style="left:${head}%"></span>`;
  return h;
}

function renderBmView() {
  const L = bmList(), cur = bmCur();
  const chip = t => `<button class="mn-chip${BM.filter === t ? ' on' : ''}" data-bmf="${t}">${t}</button>`;

  const cards = L.map(b => {
    const on = cur && b.id === cur.id;
    if (b.kind === 'video') {
      return `<div class="bmk-card${on ? ' on' : ''}" data-bmk="${b.id}">
        <div class="bmk-thumb"><img src="${b.img}" alt=""><span class="bmk-dur">${b.dur}</span></div>
        <div class="bmk-meta">
          <div class="bmk-place">${b.place}</div>
          <div class="bmk-sub">${b.target}</div>
          <div class="bmk-time">${b.shot} ~<br>${b.shot.slice(0, 11)}${addMin(b.shot, 10)}</div>
        </div>
        <button class="bmk-star" data-bmdel="${b.id}" title="북마크 해제">${BM_STAR}</button>
      </div>`;
    }
    return `<div class="bmk-card obj${on ? ' on' : ''}" data-bmk="${b.id}">
      <div class="bmk-thumb"><img src="${b.img}" alt=""></div>
      <div class="bmk-meta">
        <div class="bmk-place">${b.target}</div>
        <div class="bmk-sub">${b.guid || '-'}</div>
        <div class="bmk-time">${b.first.slice(0, 16)}</div>
      </div>
      <button class="bmk-star" data-bmdel="${b.id}" title="북마크 해제">${BM_STAR}</button>
    </div>`;
  }).join('');

  $('#menuView').innerHTML = `
    <div class="mn-panel mn-list">
      <div class="mn-tools">
        <div class="mn-searchbox">
          <input class="fm-in" id="bmQ" placeholder="검색어를 입력해 주세요." value="${BM.q}">
          <span class="sic">${GICON.search}</span>
        </div>
        <div class="mn-chips">${['전체', '대상', '영상'].map(chip).join('')}</div>
        <div class="mn-count">총 <em>${L.length}</em></div>
      </div>
      <div class="mn-body">${L.length ? `<div class="bmk-grid">${cards}</div>`
        : `<div class="mn-empty">북마크한 항목이 없습니다.</div>`}</div>
    </div>
    <div class="mn-panel mn-detail">${cur ? bmDetailHTML(cur) : `<div class="mn-head"><h3>북마크 상세</h3></div><div class="mn-empty">선택된 북마크가 없습니다.</div>`}</div>`;

  /* --- 목록 이벤트 --- */
  const q = $('#bmQ');
  q.oninput = e => { BM.q = e.target.value; const s = e.target.selectionStart; renderBmView(); const n = $('#bmQ'); n.focus(); n.setSelectionRange(s, s); };
  $$('#menuView [data-bmf]').forEach(b => b.onclick = () => { BM.filter = b.dataset.bmf; BM.edit = false; renderBmView(); });
  $$('#menuView [data-bmk]').forEach(c => c.onclick = e => {
    if (e.target.closest('[data-bmdel]')) return;
    BM.sel = c.dataset.bmk; BM.edit = false; BM.dirty = false; BM.rep = 0; renderBmView();
  });
  $$('#menuView [data-bmdel]').forEach(b => b.onclick = e => {
    e.stopPropagation();
    BM.removed.add(b.dataset.bmdel);
    if (BM.sel === b.dataset.bmdel) BM.sel = null;
    renderBmView();
  });
  bindBmDetail(cur);
}

function addMin(ts, m) {
  const t = ts.slice(11, 16).split(':').map(Number);
  const d = new Date(2026, 0, 1, t[0], t[1] + m);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function bmDetailHTML(b) {
  /* ---- 대상 북마크 상세 ---- */
  if (b.kind === 'object') {
    const rep = b.imgs[BM.rep] || b.img;
    return `<div class="mn-head">
        <h3>북마크 상세</h3>
        <div class="mn-head-btns">
          <button class="btn-ghost sm" data-bmact="orig">원본 보기</button>
          <button class="btn-primary sm" data-bmact="case">사건 등록</button>
        </div>
      </div>
      <div class="mn-body bmk-dt">
        <div class="panel-label" style="margin-bottom:8px">이미지 <em>${b.imgs.length}</em></div>
        <div class="bmk-imgs">
          <div class="csrep"><img src="${rep}" alt=""></div>
          <div class="thumbs">${b.imgs.map((s, i) =>
            `<img src="${s}" class="${i === BM.rep ? 'on' : ''}" data-bmrep="${i}" alt="">`).join('')}</div>
        </div>
        <div class="bm-field"><span class="k">대상</span><span class="v">${b.target}</span></div>
        <div class="bm-field"><span class="k">GUID</span><span class="v">${b.guid || '-'}</span></div>
        <div class="bm-field"><span class="k">최초 출현 일시</span><span class="v">${b.first}</span></div>
        <div class="bm-field"><span class="k">색상</span><span class="v">
          <span class="bmk-swatch">상의 <i style="background:${cssColor(b.top)}"></i></span>
          <span class="bmk-swatch" style="margin-left:14px">하의 <i style="background:${cssColor(b.bottom)}"></i></span>
        </span></div>
      </div>`;
  }

  /* ---- 영상 북마크 : 편집 모드 ---- */
  const range = BM.edit ? (BM.range || b.range) : b.range;
  if (BM.edit) {
    return `<div class="mn-head">
        <h3>북마크 편집</h3>
        <div class="mn-head-btns">
          <button class="btn-ghost sm" data-bmact="cancel">취소</button>
          <button class="btn-primary sm" data-bmact="done">완료</button>
        </div>
      </div>
      <div class="mn-body bmk-dt">
        <div class="bm-vid">
          <img src="${b.img}" alt="">
          <span class="bm-hash">${ICON2.shield}원본 무결성 SHA-256 검증 완료</span>
          <div class="bm-bar">
            <div class="bm-ruler bmk-tledit" id="bmTl">${bmRulerHTML(range, range[0] + range[1] / 2)}</div>
            <div class="bm-ctrl">${playCtrlHTML()}</div>
          </div>
        </div>
        <div style="margin-top:12px">
          <div class="bm-field"><span class="k">대상</span><span class="v">${b.target}</span></div>
          <div class="bm-field"><span class="k">위치</span><span class="v">${b.place}</span></div>
          <div class="bm-field"><span class="k">카메라명</span><span class="v">${b.cam}</span></div>
          <div class="bm-field"><span class="k">출현 일시</span><span class="v">${b.shot}</span></div>
          <div class="bm-field"><span class="k">메모</span><span class="v">
            <textarea class="fm-in bmk-memo" id="bmMemoEdit" placeholder="메모">${BM.memo}</textarea></span></div>
        </div>
        <p class="hint" style="margin-top:8px">타임라인을 클릭해 북마크 저장 구간을 재설정할 수 있습니다.</p>
      </div>`;
  }

  /* ---- 영상 북마크 : 상세(조회) ---- */
  return `<div class="mn-head">
      <h3>북마크 상세</h3>
      <div class="mn-head-btns">
        <button class="btn-ghost sm" data-bmact="orig">원본 보기</button>
        <button class="btn-ghost sm" data-bmact="edit">편집</button>
        <button class="btn-primary sm" data-bmact="case">사건 등록</button>
      </div>
    </div>
    <div class="mn-body bmk-dt">
      <div class="bm-vid">
        <img src="${b.img}" alt="">
        <span class="bm-hash">${ICON2.shield}원본 무결성 SHA-256 검증 완료</span>
        <div class="bm-bar">
          <div class="bm-ruler">${bmRulerHTML(b.range, b.range[0] + b.range[1] / 2)}</div>
          <div class="bm-ctrl">${playCtrlHTML()}</div>
        </div>
      </div>
      <div style="margin-top:12px">
        <div class="bm-field"><span class="k">대상</span><span class="v">${b.target}</span></div>
        <div class="bm-field"><span class="k">위치</span><span class="v">${b.place}</span></div>
        <div class="bm-field"><span class="k">카메라명</span><span class="v">${b.cam}</span></div>
        <div class="bm-field"><span class="k">출현 일시</span><span class="v">${b.shot} ~ ${b.shot.slice(0, 11)}${addMin(b.shot, 10)}</span></div>
        <div class="bm-field"><span class="k">메모</span><span class="v">${b.memo || '-'}</span></div>
      </div>
    </div>`;
}
function cssColor(k) {
  return ({ black: '#1b1b1f', white: '#e8e8ea', gray: '#8a8c96', blue: '#3070d8', green: '#3fbe7e', red: '#d84040' })[k] || '#55575f';
}

function bindBmDetail(b) {
  if (!b) return;
  $$('#menuView [data-bmrep]').forEach(t => t.onclick = () => { BM.rep = +t.dataset.bmrep; renderBmView(); });

  $$('#menuView [data-bmact]').forEach(btn => btn.onclick = () => {
    const a = btn.dataset.bmact;
    if (a === 'orig') {                       /* 원본 영상 상세화면 : 검색 메뉴 + 새 탭 */
      const o = OBJECTS.find(x => x.id === b.obj) || OBJECTS[0];
      setMenu(null);
      newTab(`${o.cam} > ${b.target}`, o);
      return;
    }
    if (a === 'case') { openCase(); return; }
    if (a === 'edit') { BM.edit = true; BM.memo = b.memo || ''; BM.range = b.range.slice(); BM.dirty = false; renderBmView(); return; }
    if (a === 'done') {
      b.memo = BM.memo; b.range = (BM.range || b.range).slice();
      BM.edit = false; BM.dirty = false; renderBmView(); return;
    }
    if (a === 'cancel') {
      if (!BM.dirty) { BM.edit = false; renderBmView(); return; }
      alertBox({
        title: '편집을 취소할까요?', desc: '변경한 내용은 저장되지 않습니다.',
        ok: '편집 취소', danger: true,
        onOk: () => { BM.edit = false; BM.dirty = false; renderBmView(); }
      });
    }
  });

  const memo = $('#bmMemoEdit');
  if (memo) memo.oninput = e => { BM.memo = e.target.value; BM.dirty = true; };

  const tl = $('#bmTl');
  if (tl) tl.onclick = e => {
    const r = tl.getBoundingClientRect();
    const w = (BM.range || b.range)[1];
    let left = (e.clientX - r.left) / r.width * 100 - w / 2;
    left = Math.max(2, Math.min(98 - w, left));
    BM.range = [Math.round(left), w]; BM.dirty = true; renderBmView();
  };
}

/* ---- 메뉴 화면 딥링크 ---- */
function applyMenuDemo() {
  const m = (location.hash || '').match(/demo=([a-z0-9]+)/i);
  if (!m) return;
  const d = m[1].toLowerCase();
  if (d === 'bookmarks') { setMenu('bookmark'); }
  if (d === 'bookmarkedit') { setMenu('bookmark'); const v = bmList().find(b => b.kind === 'video'); BM.sel = v.id; BM.edit = true; BM.memo = v.memo || ''; BM.range = v.range.slice(); renderBmView(); }
  if (d === 'bookmarkobj') { setMenu('bookmark'); const o = bmList().find(b => b.kind === 'object'); BM.sel = o.id; renderBmView(); }
  if (d === 'case') setMenu('case');
  if (d === 'map') setMenu('map');
  if (d === 'alarm') setMenu('alarm');
  if (d === 'mapnew')  { setMenu('map'); MP.mode = 'new';  MP.form = mpNewForm(null); renderMpView(); }
  if (d === 'mapnew2') { setMenu('map'); MP.mode = 'new';  MP.form = mpNewForm(MAPS[0]); MP.form.id = null; MP.form.name = 'B동 3F 도면'; MP.form.place = 'B동'; MP.form.cams = ZONES['B동'].slice(0,3).map((n,i) => ({ n, x: 26 + i*22, y: 30 + i*14 })); renderMpView(); }
  if (d === 'mapedit') { setMenu('map'); MP.mode = 'edit'; MP.form = mpNewForm(MAPS[0]); renderMpView(); }
  if (d === 'watchmgr')  { setMenu('alarm'); openWatchMgr(); }
  if (d === 'watchdt')   { setMenu('alarm'); openWatchMgr(); AL.wsel = WATCHES[0].id; AL.wv = 'detail'; renderWatchMgr(); }
  if (d === 'watchedit') { setMenu('alarm'); openWatchMgr(); AL.wsel = WATCHES[0].id; AL.wform = { ...WATCHES[0] }; AL.wv = 'edit'; renderWatchMgr(); }

  if (d === 'caseedit') { setMenu('case'); const c = csCur(); CS.mode = 'edit'; CS.form = csForm(c); renderCsView(); }
  if (d === 'caseaddt') { setMenu('case'); const c = csCur(); CS.mode = 'edit'; CS.form = csForm(c); renderCsView(); openCaseAdd('target'); }
  if (d === 'caseaddv') { setMenu('case'); const c = csCur(); CS.mode = 'edit'; CS.form = csForm(c); renderCsView(); openCaseAdd('video'); }

  /* 차량번호 검색 */
  if (d === 'pmnew')    { switchMode('person'); renderPersonGrid(); openPersonMgr(); pmForm={name:'김보안',desc:'VIP',imgs:S.persons[0].imgs.concat(S.persons[1].imgs,S.persons[2].imgs,S.persons[3].imgs,S.persons[4].imgs).slice(0,5),kinds:['face','face','face','obj','obj']}; pmView='new'; renderPM(); }
  if (d === 'pmnew0')   { switchMode('person'); renderPersonGrid(); openPersonMgr(); pmForm={name:'',desc:'',imgs:[],kinds:[]}; pmView='new'; renderPM(); }
  if (d === 'pmdetail') { switchMode('person'); renderPersonGrid(); openPersonMgr(); pmTarget=S.persons[0]; pmView='detail'; renderPM(); }
  if (d === 'autocomplete') { $('#qText').focus(); openAutocomplete(); }
  if (d === 'layb') setLayout('b');
  if (d === 'lybresult') { setLayout('b'); S.q='검정색 모자를 쓴 배송기사'; $('#qText').value=S.q; $('#qTextClear').hidden=false; runSearch(false); }
  if (d === 'laya') setLayout('a');
  if (d === 'aifloat') { toggleAiFloat(true); AIM.log=[{me:AI_SUGGESTIONS[2]}]; AIM.wait=true; renderAim(); }
  if (d === 'aim') {
    $$('#modeRail button').forEach(x => x.classList.toggle('on', x.dataset.mode === 'aim'));
    S.mode = 'aim';
    $$('.mode-panel').forEach(p => p.classList.toggle('on', p.dataset.panel === 'aim'));
    render();
  }
  if (d === 'carmode' || d === 'carresult') {
    $$('#modeRail button').forEach(x => x.classList.toggle('on', x.dataset.mode === 'car'));
    S.mode = 'car';
    $$('.mode-panel').forEach(p => p.classList.toggle('on', p.dataset.panel === 'car'));
    if (d === 'carresult') {
      S.carQ = '68오 8269'; $('#qCar').value = S.carQ; $('#qCarClear').hidden = false;
      S.carTypes = ['승용차'];
    }
    buildFilters('car'); renderCarRecent(); runSearch(false);
  }
}
/* ============================================================
   사건 관리 (Case_001 / Case_002)  — 조회
   ============================================================ */
const CS = { q: '', status: null, period: '당일', sel: null, acc: { rep: true, tg: true, ev: true, pth: true } };
const CS_ORDER = { '진행중': 0, '처리전': 1, '처리 완료': 2 };
const stClass = s => s === '진행중' ? 'st-ing' : s === '처리전' ? 'st-pre' : 'st-done';
const CS_COLORS = ['#3070d8', '#e0409a', '#e88038', '#3fbe7e'];

function csList() {
  const q = CS.q.trim();
  return CASE_DB
    .filter(c => !CS.status || c.status === CS.status)
    .filter(c => !q || c.name.includes(q))
    .sort((a, b) => (CS_ORDER[a.status] - CS_ORDER[b.status]) || (a.reg < b.reg ? 1 : -1));
}
function csCur() {
  const L = csList(); if (!L.length) return null;
  let c = L.find(x => x.id === CS.sel);
  if (!c) { c = L[0]; CS.sel = c.id; }
  return c;
}
function whoColor(c, who) {
  const i = c.targets.findIndex(t => t.name === who);
  return CS_COLORS[i < 0 ? 0 : i % CS_COLORS.length];
}

function renderCsView() {
  const L = csList(), cur = csCur();
  const cards = L.map(c => `
    <div class="cs-card${cur && c.id === cur.id ? ' on' : ''}" data-cs="${c.id}">
      <div class="nm">${c.name}<span class="st-chip ${stClass(c.status)}">${c.status}</span></div>
      <div class="sub">${c.reg}・대상 ${c.targets.length}・증거 ${c.videos.length}</div>
    </div>`).join('');

  $('#menuView').innerHTML = `
    <div class="mn-panel mn-narrow">
      <div class="mn-head"><h3>사건 목록</h3>
        <button class="btn-primary sm" id="csNew" ${CS.mode === 'edit' ? 'disabled' : ''}>사건 등록</button></div>
      <div class="mn-tools">
        <div class="mn-searchbox">
          <input class="fm-in" id="csQ" placeholder="검색어를 입력해 주세요." value="${CS.q}">
          <span class="sic">${GICON.search}</span>
        </div>
        <div class="mn-chips">
          <button class="mn-chip${CS.status ? '' : ' on'}" data-csf="">전체</button>
          ${CS_STATUS.map(s => `<button class="mn-chip${CS.status === s ? ' on' : ''}" data-csf="${s}">${s}</button>`).join('')}
        </div>
        <div class="mn-count">총 <em>${L.length}</em>개</div>
      </div>
      <div class="mn-body">${L.length ? cards : '<div class="mn-empty">등록한 사건이 없습니다.</div>'}</div>
    </div>
    <div class="mn-panel mn-list">${CS.mode === 'edit' && CS.form ? csEditHTML()
      : (cur ? csDetailHTML(cur) : '<div class="mn-head"><h3>사건 상세</h3></div><div class="mn-empty">선택된 사건이 없습니다.</div>')}</div>`;

  const q = $('#csQ');
  q.oninput = e => { CS.q = e.target.value; const s = e.target.selectionStart; renderCsView(); const n = $('#csQ'); n.focus(); n.setSelectionRange(s, s); };
  $$('#menuView [data-csf]').forEach(b => b.onclick = () => { CS.status = b.dataset.csf || null; renderCsView(); });
  $$('#menuView [data-cs]').forEach(c => c.onclick = () => { CS.sel = c.dataset.cs; renderCsView(); });
  $('#csNew').onclick = () => openCase();
  if (CS.mode === 'edit' && CS.form) bindCsEdit(); else bindCsDetail(cur);
}

function accHTML(k, icon, title, body, open) {
  return `<div class="acc${open ? ' open' : ''}" data-acc="${k}">
    <div class="acc-h">${icon}<span class="tt">${title}</span><span class="cv">${ICON2.chev}</span></div>
    <div class="acc-b">${body}</div></div>`;
}

function csDetailHTML(c) {
  const r = c.report;
  const rep = `<div class="csrep"><h4>${r.title}</h4><div class="meta">${r.meta}</div>
    ${r.sec.map(([h, p]) => `<section><h5>${h}</h5><p>${p}</p></section>`).join('')}</div>`;

  const tg = `<div class="tg-row">${c.targets.map(t => `
    <div class="tg-card">
      <img src="${t.img}" alt="">
      <div class="info">
        <div class="nm">${ICON2.person}${t.name}</div>
        <div class="tg-kv">출현 일시 <b>${t.at.slice(5)}</b></div>
        <div class="tg-kv">이벤트 <b>${t.ev}</b></div>
        <div class="tg-kv">색상
          <i style="width:9px;height:9px;border-radius:2px;display:inline-block;background:${cssColor(t.top)};border:1px solid var(--ln-border)"></i>
          <i style="width:9px;height:9px;border-radius:2px;display:inline-block;background:${cssColor(t.bottom)};border:1px solid var(--ln-border)"></i>
        </div>
      </div>
    </div>`).join('')}</div>`;

  const ev = c.videos.map((v, i) => `
    <div class="ev-card">
      <div class="th"><img src="${v.img}" alt="">
        ${v.ok ? `<span class="ev-hash">${ICON2.shield}SHA-256 검증 완료</span>` : ''}</div>
      <div class="info">
        <div class="pl">${v.place}</div>
        <div class="tg-kv">촬영 일시 <b>${v.at}</b></div>
        <div class="tg-kv">카메라명 <b>${v.cam}</b></div>
        <div class="tg-kv">관련 대상 <b>${v.rel}</b></div>
      </div>
      <button class="btn-ghost sm ev-btn" data-csvid="${i}">원본 영상 보기</button>
    </div>`).join('');

  const zones = [...new Set(c.path.map(p => p.place))];
  const pth = `<div style="display:flex;gap:10px">
      <div style="flex:1;min-width:0">
        <div class="pth-list">${c.path.slice().sort((a, b) => a.t < b.t ? -1 : 1).map(p => `
          <div class="pth-row"><span class="t">${p.t}</span>
            <span class="dot" style="background:${whoColor(c, p.who)}"></span>
            <span>${p.place}</span><span class="cm">${p.cam}</span></div>`).join('')}</div>
        <div class="legend">${c.targets.map((t, i) =>
          `<span><i style="background:${CS_COLORS[i % 4]}"></i>${t.name} 출현 지점</span>`).join('')}</div>
      </div>
      <div style="width:300px;flex:0 0 300px">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
          <span class="mn-count" style="padding:0">구역 <em>${zones[0] || '-'}</em> (${c.path.length}건)</span>
          <button class="btn-ghost sm" style="margin-left:auto" data-csmap>전체 보기</button>
        </div>
        <div style="position:relative;height:196px;border-radius:6px;overflow:hidden;background:var(--bg-1);border:1px solid var(--ln-subtle)">
          <img src="assets/img/map.png" style="width:100%;height:100%;object-fit:cover;opacity:.85" alt="">
          ${c.path.map((p, i) => {
            const x = 16 + (i * 23) % 68, y = 22 + (i * 17) % 54;
            return `<span style="position:absolute;left:${x}%;top:${y}%;width:9px;height:9px;border-radius:50%;
              background:${whoColor(c, p.who)};box-shadow:0 0 0 3px rgba(0,0,0,.45)"></span>`;
          }).join('')}
        </div>
      </div>
    </div>`;

  return `<div class="cs-dt-head">
      <div class="cs-title">
        <h2>${c.name}</h2><span class="st-chip ${stClass(c.status)}">${c.status}</span>
        <span class="dt">${c.reg}</span><span class="sp"></span>
        <button class="btn-ghost sm" data-csact="del">삭제</button>
        <button class="btn-ghost sm" data-csact="edit">편집</button>
        <button class="btn-primary sm" data-csact="export">내보내기</button>
      </div>
      <div class="cs-metaline"><span>${c.kind}</span><span class="mono">${c.from} ~ ${c.to}</span></div>
      <div class="cs-desc">${c.desc}</div>
    </div>
    <div class="mn-body" style="padding:0">
      ${accHTML('rep', '<i class="i-ai" style="width:13px;height:13px"></i>', 'AI 생성 보고서', rep, CS.acc.rep)}
      ${accHTML('tg', ICON2.person, `대상 정보 (${c.targets.length})`, tg, CS.acc.tg)}
      ${accHTML('ev', ICON2.cam, `증거 영상 (${c.videos.length})`, ev, CS.acc.ev)}
      ${accHTML('pth', ICON2.cctv, '이동 경로', pth, CS.acc.pth)}
    </div>`;
}

function bindCsDetail(c) {
  if (!c) return;
  $$('#menuView [data-acc]').forEach(a => {
    a.querySelector('.acc-h').onclick = () => { CS.acc[a.dataset.acc] = !CS.acc[a.dataset.acc]; renderCsView(); };
  });
  $$('#menuView [data-csvid]').forEach(b => b.onclick = () => openVideoView(c.videos[+b.dataset.csvid].img));
  const mp = $('#menuView [data-csmap]'); if (mp) mp.onclick = () => openMapView();
  $$('#menuView [data-csact]').forEach(b => b.onclick = () => {
    const a = b.dataset.csact;
    if (a === 'del') alertBox({
      title: '사건을 삭제할까요?', desc: `<b>${c.name}</b> 사건과 연계된 증거 목록이 함께 삭제됩니다.`,
      ok: '삭제', danger: true,
      onOk: () => { const i = CASE_DB.findIndex(x => x.id === c.id); CASE_DB.splice(i, 1); CS.sel = null; renderCsView(); }
    });
    if (a === 'edit') { CS.mode = 'edit'; CS.form = csForm(c); renderCsView(); }
    if (a === 'export') alertBox({
      title: '내보내기', desc: 'AI 생성 보고서와 증거 자료(대상 정보 · 영상 클립)를 ZIP으로 패키징합니다.',
      ok: '내보내기', danger: false
    });
  });
}
/* ============================================================
   맵 관리 (Map_001 조회 / Map_002 등록 / Map_003 수정)
   ============================================================ */
const MP = { sel: null, mode: 'view', form: null, drag: null };

function mpNewForm(src) {
  return src
    ? { id: src.id, name: src.name, place: src.place, img: src.img, cams: src.cams.map(c => ({ ...c })) }
    : { id: null, name: '', place: '', img: '', cams: [] };
}
function mpCur() {
  if (!MAPS.length) return null;
  let m = MAPS.find(x => x.id === MP.sel);
  if (!m) { m = MAPS[0]; MP.sel = m.id; }
  return m;
}
const mpValid = f => !!(f.name.trim() && f.place && f.img && f.cams.length);

function renderMpView() {
  const cur = MP.mode === 'view' ? mpCur() : null;
  const list = MAPS.slice().sort((a, b) => a.reg < b.reg ? 1 : -1);
  const cards = list.map(m => `
    <div class="mp-card${cur && m.id === cur.id ? ' on' : ''}" data-mp="${m.id}">
      <div class="nm">${m.name}</div><div class="sub">${m.place}・카메라 ${m.cams.length}</div>
    </div>`).join('');

  $('#menuView').innerHTML = `
    <div class="mn-panel mn-narrow">
      <div class="mn-head"><h3>맵 목록</h3>
        <button class="btn-primary sm" id="mpNew" ${MP.mode !== 'view' ? 'disabled' : ''}>맵 등록</button></div>
      <div class="mn-tools"><div class="mn-count">총 <em>${list.length}</em>개</div></div>
      <div class="mn-body">${list.length ? cards : '<div class="mn-empty">등록한 맵이 없습니다.</div>'}</div>
    </div>
    <div class="mn-panel mn-list">${MP.mode === 'view'
      ? (cur ? mpDetailHTML(cur) : '<div class="mn-head"><h3>맵 상세</h3></div><div class="mn-empty">등록한 맵이 없습니다.</div>')
      : mpFormHTML()}</div>`;

  $$('#menuView [data-mp]').forEach(c => c.onclick = () => { MP.mode = 'view'; MP.sel = c.dataset.mp; renderMpView(); });
  const nb = $('#mpNew'); if (nb) nb.onclick = () => { MP.mode = 'new'; MP.form = mpNewForm(null); renderMpView(); };
  MP.mode === 'view' ? bindMpDetail(cur) : bindMpForm();
}

function pinsHTML(cams, editable) {
  return cams.map((c, i) => `
    <div class="mp-pin" style="left:${c.x}%;top:${c.y}%" data-pin="${i}">
      <span class="dot">${ICON2.cam}</span>
      <span class="lb">${c.n}${editable ? '<span class="x" data-pinx="' + i + '">✕</span>' : ''}</span>
    </div>`).join('');
}

function mpDetailHTML(m) {
  return `<div class="mn-head"><h3>맵 상세</h3>
      <div class="mn-head-btns">
        <button class="btn-ghost sm" data-mpact="del">삭제</button>
        <button class="btn-ghost sm" data-mpact="edit">편집</button>
      </div></div>
    <div class="mn-body" style="display:flex;gap:12px">
      <div style="width:250px;flex:0 0 250px">
        <div class="fm-row"><span class="k">이름</span><span class="v">${m.name}</span></div>
        <div class="fm-row"><span class="k">위치</span><span class="v">${m.place}</span></div>
        <div class="panel-label" style="margin:12px 0 7px">카메라 <em>${m.cams.length}</em></div>
        ${m.cams.map(c => `<div class="mp-camrow">${ICON2.cam}${c.n}</div>`).join('')}
      </div>
      <div class="mp-stage" style="min-height:420px">
        <img src="${m.img}" alt="">${pinsHTML(m.cams, false)}
      </div>
    </div>`;
}

function mpFormHTML() {
  const f = MP.form, isEdit = MP.mode === 'edit';
  const zone = f.place ? (ZONES[f.place] || []) : [];
  const placed = n => f.cams.some(c => c.n === n);
  return `<div class="mn-head"><h3>${isEdit ? '맵 수정' : '새 맵 등록'}</h3>
      <div class="mn-head-btns">
        <button class="btn-ghost sm" data-mpact="cancel">취소</button>
        <button class="btn-primary sm" data-mpact="save" ${mpValid(f) ? '' : 'disabled'}>${isEdit ? '완료' : '등록'}</button>
      </div></div>
    <div class="mn-body" style="display:flex;gap:12px">
      <div style="width:250px;flex:0 0 250px">
        <div class="fm-row"><span class="k">이름<span class="req">*</span></span>
          <span class="v"><input class="fm-in" id="mpName" placeholder="맵 이름" value="${f.name}"></span></div>
        <div class="fm-row"><span class="k">위치<span class="req">*</span></span>
          <span class="v"><div class="chipset">${Object.keys(ZONES).map(z =>
            `<button class="mn-chip${f.place === z ? ' on' : ''}" data-mpz="${z}">${z}</button>`).join('')}</div></span></div>
        <div class="panel-label" style="margin:12px 0 7px">카메라<span class="req">*</span>
          ${f.place ? `<em>${f.cams.length}/${zone.length}</em>
            <button class="btn-ghost sm" style="margin-left:auto" data-mpact="reset" ${f.cams.length ? '' : 'disabled'}>초기화</button>` : ''}</div>
        ${f.place
          ? zone.map(n => `<div class="mp-camrow${placed(n) ? ' placed' : ''}" draggable="true" data-mpcam="${n}">
              ${ICON2.cam}${n}<button class="plus" data-mptoggle="${n}">${placed(n) ? '−' : '+'}</button></div>`).join('')
          : `<p class="hintline">위치를 선택하면 해당 위치의 카메라가 자동으로 표시됩니다.</p>`}
      </div>
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;align-items:center;gap:8px">
          <span class="panel-label" style="padding:0">이미지<span class="req">*</span></span>
          <button class="btn-ghost sm" style="margin-left:auto" data-mpact="repick" ${f.img ? '' : 'disabled'}>이미지 재선택</button>
        </div>
        ${f.img
          ? `<div class="mp-stage" id="mpStage" style="min-height:380px"><img src="${f.img}" alt="">${pinsHTML(f.cams, true)}</div>`
          : `<div class="mp-up" id="mpUp"><b>이미지를 드래그하거나 클릭하여 업로드</b>JPG, PNG 지원 · 최대 10MB
              <div style="margin-top:12px"><button class="btn-ghost sm" data-mpact="pick">이미지 선택</button></div></div>`}
        ${f.img ? `<p class="hintline">카메라 항목의 <b>+</b> 를 누르거나 도면으로 <b>드래그</b>해 배치하세요. 배치된 핀은 드래그로 위치를 옮기고, 라벨의 ✕ 로 삭제합니다.</p>` : ''}
      </div>
    </div>`;
}

function bindMpDetail(m) {
  if (!m) return;
  $$('#menuView [data-mpact]').forEach(b => b.onclick = () => {
    const a = b.dataset.mpact;
    if (a === 'edit') { MP.mode = 'edit'; MP.form = mpNewForm(m); renderMpView(); }
    if (a === 'del') alertBox({
      title: '맵을 삭제할까요?', desc: `<b>${m.name}</b> 과 배치된 카메라 정보가 함께 삭제됩니다.`, ok: '삭제', danger: true,
      onOk: () => { MAPS.splice(MAPS.findIndex(x => x.id === m.id), 1); MP.sel = null; renderMpView(); }
    });
  });
}

function bindMpForm() {
  const f = MP.form;
  const nm = $('#mpName');
  if (nm) nm.oninput = e => { f.name = e.target.value; const s = e.target.selectionStart; renderMpView(); const n = $('#mpName'); n.focus(); n.setSelectionRange(s, s); };
  $$('#menuView [data-mpz]').forEach(b => b.onclick = () => {
    if (f.place !== b.dataset.mpz) { f.place = b.dataset.mpz; f.cams = []; }
    renderMpView();
  });
  $$('#menuView [data-mptoggle]').forEach(b => b.onclick = e => {
    e.stopPropagation();
    const n = b.dataset.mptoggle, i = f.cams.findIndex(c => c.n === n);
    if (i >= 0) f.cams.splice(i, 1);
    else f.cams.push({ n, x: 20 + (f.cams.length * 13) % 60, y: 24 + (f.cams.length * 11) % 52 });
    renderMpView();
  });
  $$('#menuView [data-pinx]').forEach(x => x.onclick = e => {
    e.stopPropagation(); f.cams.splice(+x.dataset.pinx, 1); renderMpView();
  });

  /* 카메라 항목 → 도면 드래그 앤 드롭 배치 */
  $$('#menuView [data-mpcam]').forEach(r => r.ondragstart = e => e.dataTransfer.setData('text/plain', r.dataset.mpcam));
  const stage = $('#mpStage');
  if (stage) {
    stage.ondragover = e => e.preventDefault();
    stage.ondrop = e => {
      e.preventDefault();
      const n = e.dataTransfer.getData('text/plain'); if (!n) return;
      const r = stage.getBoundingClientRect();
      const x = Math.round((e.clientX - r.left) / r.width * 100), y = Math.round((e.clientY - r.top) / r.height * 100);
      const i = f.cams.findIndex(c => c.n === n);
      if (i >= 0) f.cams[i] = { n, x, y }; else f.cams.push({ n, x, y });
      renderMpView();
    };
    /* 배치된 핀 위치 변경 */
    $$('#menuView [data-pin]').forEach(p => {
      p.onmousedown = e => {
        if (e.target.closest('[data-pinx]')) return;
        const idx = +p.dataset.pin, r = stage.getBoundingClientRect();
        const move = ev => {
          f.cams[idx].x = Math.max(2, Math.min(98, Math.round((ev.clientX - r.left) / r.width * 100)));
          f.cams[idx].y = Math.max(4, Math.min(98, Math.round((ev.clientY - r.top) / r.height * 100)));
          p.style.left = f.cams[idx].x + '%'; p.style.top = f.cams[idx].y + '%';
        };
        const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
        document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
      };
    });
  }

  $$('#menuView [data-mpact]').forEach(b => b.onclick = () => {
    const a = b.dataset.mpact;
    if (a === 'pick' || a === 'repick') { f.img = IMG('map'); renderMpView(); }
    if (a === 'reset') { f.cams = []; renderMpView(); }
    if (a === 'save') {
      if (MP.mode === 'edit') {
        const m = MAPS.find(x => x.id === f.id);
        Object.assign(m, { name: f.name, place: f.place, img: f.img, cams: f.cams });
      } else {
        const id = 'm' + (Date.now() % 100000);
        MAPS.unshift({ id, name: f.name, place: f.place, img: f.img, cams: f.cams, reg: '2026-06-30 12:00:00' });
        MP.sel = id;
      }
      MP.mode = 'view'; renderMpView();
    }
    if (a === 'cancel') {
      const dirty = MP.mode === 'new' ? (f.name || f.place || f.img || f.cams.length) : true;
      if (!dirty) { MP.mode = 'view'; renderMpView(); return; }
      alertBox({
        title: MP.mode === 'new' ? '등록을 취소할까요?' : '편집을 취소할까요?',
        desc: '입력한 내용은 저장되지 않습니다.', ok: MP.mode === 'new' ? '등록 취소' : '편집 취소', danger: true,
        onOk: () => { MP.mode = 'view'; renderMpView(); }
      });
    }
  });
}

/* ============================================================
   알림 (Alarm_001) + 관심 인물 관리 팝업
   ============================================================ */
const AL = { sel: null, wv: 'list', wsel: null, wq: '', wsort: '등록일순', wpick: [], wrep: 0, wform: null };

function alCur() {
  if (!ALARMS.length) return null;
  let a = ALARMS.find(x => x.id === AL.sel);
  if (!a) { a = ALARMS[0]; AL.sel = a.id; a.read = true; }
  return a;
}
function renderAlView() {
  const cur = alCur();
  const days = [...new Set(ALARMS.map(a => a.date))].sort().reverse();
  const list = days.map(d => `<div class="al-date">${d}</div>` +
    ALARMS.filter(a => a.date === d).sort((x, y) => x.at < y.at ? 1 : -1).map(a => `
      <div class="al-card${cur && a.id === cur.id ? ' on' : ''}${a.read ? '' : ' unread'}" data-al="${a.id}">
        <img src="${a.img}" alt="">
        <div style="min-width:0;flex:1">
          <div class="tt">${a.title}<span class="st-chip st-ing">${a.cls}</span></div>
          <div class="who">${a.person}</div>
          <div class="lc">${a.place}・${a.cam}</div>
          <div class="lc">${a.at}</div>
        </div>
      </div>`).join('')).join('');

  $('#menuView').innerHTML = `
    <div class="mn-panel" style="width:420px;flex:0 0 420px">
      <div class="mn-head"><h3>알림 목록</h3>
        <button class="btn-ghost sm" id="alWatch">관심인물 관리</button></div>
      <div class="mn-body">${ALARMS.length ? list : '<div class="mn-empty">알림이 없습니다.</div>'}</div>
    </div>
    <div class="mn-panel mn-list">${cur ? `
      <div class="mn-head"><h3>알림 상세</h3>
        <div class="mn-head-btns">
          <button class="btn-ghost sm" data-alact="orig">원본 보기</button>
          <button class="btn-primary sm" data-alact="case">사건 등록</button>
        </div></div>
      <div class="mn-body">
        <div class="bm-vid"><img src="${cur.img}" alt="">
          <span class="bm-hash">${ICON2.shield}원본 무결성 SHA-256 검증 완료</span></div>
        <div style="margin-top:12px">
          <div class="bm-field"><span class="k">대상</span><span class="v">${cur.person} <span class="st-chip st-ing">${cur.cls}</span></span></div>
          <div class="bm-field"><span class="k">장소</span><span class="v">${cur.place}</span></div>
          <div class="bm-field"><span class="k">카메라명</span><span class="v">${cur.cam}</span></div>
          <div class="bm-field"><span class="k">출현 일시</span><span class="v">${cur.at}</span></div>
        </div>
      </div>` : '<div class="mn-head"><h3>알림 상세</h3></div><div class="mn-empty">선택된 알림이 없습니다.</div>'}</div>`;

  $$('#menuView [data-al]').forEach(c => c.onclick = () => {
    AL.sel = c.dataset.al;
    const a = ALARMS.find(x => x.id === AL.sel); if (a) a.read = true;
    renderAlView();
  });
  $('#alWatch').onclick = () => openWatchMgr();
  $$('#menuView [data-alact]').forEach(b => b.onclick = () => {
    if (b.dataset.alact === 'case') return openCase();
    const o = OBJECTS.find(x => x.id === cur.obj) || OBJECTS[0];
    setMenu(null); newTab(`${o.cam} > ${cur.person}`, o);
  });
}

/* ---- 관심 인물 관리 팝업 (목록 / 상세 / 수정) ---- */
function openWatchMgr() { AL.wv = 'list'; AL.wpick = []; renderWatchMgr(); openModal('#mdWatchMgr'); }

function renderWatchMgr() {
  const body = $('#wmBody'), foot = $('#wmFoot'), head = $('#wmHead');
  if (AL.wv === 'list') {
    const q = AL.wq.trim();
    const L = WATCHES.filter(w => !q || w.name.includes(q))
      .sort((a, b) => AL.wsort === '이름순' ? a.name.localeCompare(b.name) : (a.reg < b.reg ? 1 : -1));
    head.innerHTML = `<div><h3>관심 인물 관리</h3><p>알림 받을 인물을 등록 · 관리할 수 있습니다.</p></div>
      <button class="btn-icon md-x" data-close><svg viewBox="0 0 16 16" class="ic"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.3"/></svg></button>`;
    body.innerHTML = `
      <div class="mn-tools" style="padding:0 0 10px">
        <div class="panel-label">관심 인물 <em>${WATCHES.length}</em></div>
        <div class="mn-searchbox"><input class="fm-in" id="wmQ" placeholder="검색어를 입력해 주세요." value="${AL.wq}">
          <span class="sic">${GICON.search}</span></div>
      </div>
      <div class="wt-bar">
        <button class="btn-ghost sm" id="wmAll">전체 선택</button>
        <div class="chipset">${['등록일순', '이름순'].map(s =>
          `<button class="mn-chip${AL.wsort === s ? ' on' : ''}" data-wms="${s}">${s}</button>`).join('')}</div>
        <button class="btn-ghost sm" style="margin-left:auto" id="wmDel" ${AL.wpick.length ? '' : 'disabled'}>선택 삭제</button>
      </div>
      ${L.length ? L.map(w => `
        <div class="wt-row" data-wm="${w.id}">
          <input type="checkbox" class="cb" data-wmc="${w.id}" ${AL.wpick.includes(w.id) ? 'checked' : ''}>
          <span class="nm">${w.name}</span><span class="cl">${w.cls}</span>
          <span class="md">${w.mode === '스케줄 설정' ? '스케줄' : w.mode === '미사용' ? '미사용' : '상시 알림'}</span>
          <span class="rg">${w.reg}</span>
        </div>`).join('') : '<div class="mn-empty">등록된 관심 인물이 없습니다.</div>'}`;
    foot.innerHTML = '';
    const q2 = $('#wmQ');
    q2.oninput = e => { AL.wq = e.target.value; const s = e.target.selectionStart; renderWatchMgr(); const n = $('#wmQ'); n.focus(); n.setSelectionRange(s, s); };
    $$('#wmBody [data-wms]').forEach(b => b.onclick = () => { AL.wsort = b.dataset.wms; renderWatchMgr(); });
    $$('#wmBody [data-wmc]').forEach(c => c.onclick = e => {
      e.stopPropagation();
      const id = c.dataset.wmc;
      AL.wpick.includes(id) ? AL.wpick.splice(AL.wpick.indexOf(id), 1) : AL.wpick.push(id);
      renderWatchMgr();
    });
    $$('#wmBody [data-wm]').forEach(r => r.onclick = e => {
      if (e.target.closest('[data-wmc]')) return;
      AL.wsel = r.dataset.wm; AL.wrep = 0; AL.wv = 'detail'; renderWatchMgr();
    });
    $('#wmAll').onclick = () => { AL.wpick = AL.wpick.length === WATCHES.length ? [] : WATCHES.map(w => w.id); renderWatchMgr(); };
    $('#wmDel').onclick = () => alertBox({
      title: '인물을 삭제할까요?', desc: `선택한 <b>${AL.wpick.length}명</b>의 관심 인물이 삭제되며 알림이 중지됩니다.`,
      ok: '삭제', danger: true,
      onOk: () => { AL.wpick.forEach(id => WATCHES.splice(WATCHES.findIndex(w => w.id === id), 1)); AL.wpick = []; renderWatchMgr(); }
    });
    return;
  }

  const w = WATCHES.find(x => x.id === AL.wsel) || WATCHES[0];
  if (AL.wv === 'detail') {
    head.innerHTML = `<div style="display:flex;align-items:center;gap:8px">
        <button class="btn-icon" id="wmBack" title="뒤로"><svg viewBox="0 0 16 16" class="ic"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.4" fill="none"/></svg></button>
        <h3>관심 인물 상세</h3></div>
      <button class="btn-icon md-x" data-close><svg viewBox="0 0 16 16" class="ic"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.3"/></svg></button>`;
    body.innerHTML = `
      <div class="panel-label" style="margin-bottom:7px">이미지 <em>${w.imgs.length}</em></div>
      <div class="wt-imgs">${w.imgs.map((s, i) => `<img src="${s}" class="${i === AL.wrep ? 'on' : ''}" alt="">`).join('')}</div>
      <div class="bm-field"><span class="k">식별명</span><span class="v">${w.name}</span></div>
      <div class="bm-field"><span class="k">분류</span><span class="v">${w.cls}</span></div>
      <div class="bm-field"><span class="k">등록 사유</span><span class="v">${w.reason}</span></div>
      <div class="bm-field"><span class="k">실시간 알림</span><span class="v">${w.mode}</span></div>`;
    foot.innerHTML = `<button class="btn-ghost" id="wmDel1">삭제</button><button class="btn-primary" id="wmEdit">수정</button>`;
    $('#wmBack').onclick = () => { AL.wv = 'list'; renderWatchMgr(); };
    $('#wmEdit').onclick = () => { AL.wform = { ...w }; AL.wv = 'edit'; renderWatchMgr(); };
    $('#wmDel1').onclick = () => alertBox({
      title: '인물을 삭제할까요?', desc: `<b>${w.name}</b> 의 관심 인물 등록이 삭제되며 알림이 중지됩니다.`, ok: '삭제', danger: true,
      onOk: () => { WATCHES.splice(WATCHES.findIndex(x => x.id === w.id), 1); AL.wv = 'list'; renderWatchMgr(); }
    });
    return;
  }

  /* edit */
  const f = AL.wform;
  head.innerHTML = `<div style="display:flex;align-items:center;gap:8px">
      <button class="btn-icon" id="wmBack" title="뒤로"><svg viewBox="0 0 16 16" class="ic"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.4" fill="none"/></svg></button>
      <h3>관심 인물 수정</h3></div>
    <button class="btn-icon md-x" data-close><svg viewBox="0 0 16 16" class="ic"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.3"/></svg></button>`;
  body.innerHTML = `
    <div class="panel-label" style="margin-bottom:7px">이미지 <em>${w.imgs.length}</em></div>
    <div class="wt-imgs">${w.imgs.map((s, i) =>
      `<img src="${s}" class="${i === AL.wrep ? 'on' : ''}" data-wrep="${i}" alt="">`).join('')}</div>
    <div class="fm-row"><span class="k">식별명<span class="req">*</span></span>
      <span class="v"><input class="fm-in" id="wfName" value="${f.name}"></span></div>
    <div class="fm-row"><span class="k">분류</span><span class="v"><div class="chipset">${WATCH_CLS.map(c =>
      `<button class="mn-chip${f.cls === c ? ' on' : ''}" data-wfc="${c}">${c}</button>`).join('')}</div></span></div>
    <div class="fm-row"><span class="k">등록 사유<span class="req">*</span></span>
      <span class="v"><input class="fm-in" id="wfReason" value="${f.reason}"></span></div>
    <div class="fm-row"><span class="k">실시간 알림</span><span class="v"><div class="chipset">${ALARM_MODES.map(m =>
      `<button class="mn-chip${f.mode === m ? ' on' : ''}" data-wfm="${m}">${m}</button>`).join('')}</div></span></div>`;
  foot.innerHTML = `<button class="btn-ghost" id="wfCancel">취소</button><button class="btn-primary" id="wfOk">완료</button>`;
  const dirty = () => f.name !== w.name || f.cls !== w.cls || f.reason !== w.reason || f.mode !== w.mode;
  $$('#wmBody [data-wrep]').forEach(t => t.onclick = () => { AL.wrep = +t.dataset.wrep; renderWatchMgr(); });
  $('#wfName').oninput = e => f.name = e.target.value;
  $('#wfReason').oninput = e => f.reason = e.target.value;
  $$('#wmBody [data-wfc]').forEach(b => b.onclick = () => { f.cls = b.dataset.wfc; renderWatchMgr(); });
  $$('#wmBody [data-wfm]').forEach(b => b.onclick = () => { f.mode = b.dataset.wfm; renderWatchMgr(); });
  const back = () => {
    if (!dirty()) { AL.wv = 'detail'; renderWatchMgr(); return; }
    alertBox({
      title: '등록을 취소할까요?', desc: '변경한 내용은 저장되지 않습니다.', ok: '등록 취소', danger: true,
      onOk: () => { AL.wv = 'detail'; renderWatchMgr(); }
    });
  };
  $('#wmBack').onclick = back; $('#wfCancel').onclick = back;
  $('#wfOk').onclick = () => { Object.assign(w, { name: f.name, cls: f.cls, reason: f.reason, mode: f.mode }); AL.wv = 'detail'; renderWatchMgr(); };
}
/* ============================================================
   차량번호 검색 (Search main_002_1)
   ============================================================ */
S.carQ = '';
S.carTypes = [];
S.carRecent = CAR_RECENT.slice();

function renderCarRecent() {
  const box = $('#carRecent'); if (!box) return;
  if (!S.carRecent.length) { box.innerHTML = ''; return; }
  box.innerHTML = `<div class="panel-label" style="margin:10px 0 6px">최근 검색</div>
    <div class="car-recent">${S.carRecent.map((v, i) => `
      <div class="car-rc" data-carrc="${i}"><span>${v}</span>
        <button class="x" data-carrx="${i}" title="삭제">✕</button></div>`).join('')}</div>`;
  $$('#carRecent [data-carrc]').forEach(r => r.onclick = e => {
    if (e.target.closest('[data-carrx]')) return;
    const v = S.carRecent[+r.dataset.carrc];
    S.carQ = v; $('#qCar').value = v; $('#qCarClear').hidden = false;
    buildFilters('car'); runSearch(false);          /* 선택 시 자동 검색 */
  });
  $$('#carRecent [data-carrx]').forEach(b => b.onclick = e => {
    e.stopPropagation(); S.carRecent.splice(+b.dataset.carrx, 1); renderCarRecent();
  });
}

(function initCar() {
  const t = $('#qCar'); if (!t) return;
  t.oninput = e => {
    S.carQ = e.target.value;
    $('#qCarClear').hidden = !S.carQ;
    buildFilters('car');
    if (!S.carQ.trim()) { S.searched = false; S.results = []; render(); }
  };
  t.onkeydown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const v = S.carQ.trim(); if (!v) return;
      S.carRecent = [v, ...S.carRecent.filter(x => x !== v)].slice(0, 7);
      renderCarRecent(); runSearch(false);
    }
  };
  $('#qCarClear').onclick = () => {
    S.carQ = ''; t.value = ''; $('#qCarClear').hidden = true;
    buildFilters('car'); S.searched = false; S.results = []; render();
  };
  renderCarRecent();
})();

/* 차종 칩 (buildFilters 재생성 시마다 재바인딩) */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-cartype]'); if (!b) return;
  const t = b.dataset.cartype;
  S.carTypes = S.carTypes.includes(t) ? S.carTypes.filter(x => x !== t) : [...S.carTypes, t];
  buildFilters('car'); runSearch(true);
});
/* ============================================================
   사건 관리 — 편집 (Case_003) + 대상/영상 추가 팝업
   ============================================================ */
CS.mode = 'view';
CS.form = null;
const CA = { kind: 'target', tab: null, pickT: [], pickV: [], q: '', open: {} };

function csForm(c) {
  return {
    id: c.id, name: c.name, status: c.status, kind: c.kind, from: c.from, to: c.to, desc: c.desc,
    targets: c.targets.map(t => ({ ...t })), videos: c.videos.map(v => ({ ...v }))
  };
}
const csDirty = () => {
  const f = CS.form, c = CASE_DB.find(x => x.id === f.id); if (!c) return true;
  return f.name !== c.name || f.status !== c.status || f.kind !== c.kind || f.desc !== c.desc
    || f.from !== c.from || f.to !== c.to
    || f.targets.length !== c.targets.length || f.videos.length !== c.videos.length;
};

function csEditHTML() {
  const f = CS.form;
  const chips = (arr, cur, attr) => `<div class="chipset">${arr.map(v =>
    `<button class="mn-chip${cur === v ? ' on' : ''}" data-${attr}="${v}">${v}</button>`).join('')}</div>`;

  const tg = `<div class="tg-row">${f.targets.map((t, i) => `
    <div class="tg-card" style="position:relative">
      <button class="bmk-star" style="color:var(--tx-tertiary)" data-cstx="${i}" title="제외">✕</button>
      <img src="${t.img}" alt="">
      <div class="info">
        <div class="nm">${ICON2.person}${t.name}</div>
        <div class="tg-kv">출현 일시 <b>${t.at.slice(5)}</b></div>
        <div class="tg-kv">이벤트 <b>${t.ev}</b></div>
      </div>
    </div>`).join('')}</div>`;

  const ev = f.videos.map((v, i) => `
    <div class="ev-card">
      <div class="th"><img src="${v.img}" alt="">${v.ok ? `<span class="ev-hash">${ICON2.shield}SHA-256 검증 완료</span>` : ''}</div>
      <div class="info">
        <div class="pl">${v.place}</div>
        <div class="tg-kv">촬영 일시 <b>${v.at}</b></div>
        <div class="tg-kv">카메라명 <b>${v.cam}</b></div>
        <div class="tg-kv">관련 대상 <b>${v.rel}</b></div>
      </div>
      <div style="margin-left:auto;align-self:flex-end;display:flex;gap:6px">
        <button class="btn-ghost sm" data-csvid="${i}">원본 영상 보기</button>
        <button class="btn-ghost sm" data-csvdel="${i}">삭제</button>
      </div>
    </div>`).join('');

  return `<div class="mn-head"><h3>사건 수정</h3>
      <div class="mn-head-btns">
        <button class="btn-ghost sm" data-csact="ecancel">취소</button>
        <button class="btn-primary sm" data-csact="save" ${f.name.trim() && f.desc.trim() ? '' : 'disabled'}>저장</button>
      </div></div>
    <div class="mn-body">
      <div class="fm-row"><span class="k">사건명<span class="req">*</span></span>
        <span class="v"><input class="fm-in" id="cfName" value="${f.name}"></span></div>
      <div class="fm-row"><span class="k">상태<span class="req">*</span></span><span class="v">${chips(CS_STATUS, f.status, 'csst')}</span></div>
      <div class="fm-row"><span class="k">분류<span class="req">*</span></span><span class="v">${chips(CS_KINDS, f.kind, 'cskd')}</span></div>
      <div class="fm-row"><span class="k">시작 일시<span class="req">*</span></span>
        <span class="v"><input class="fm-in" id="cfFrom" value="${f.from}"></span></div>
      <div class="fm-row"><span class="k">종료 일시<span class="req">*</span></span>
        <span class="v"><input class="fm-in" id="cfTo" value="${f.to}">
          <p class="hintline" id="cfWarn" ${f.to > f.from ? 'hidden' : ''}>종료 일시는 시작 일시 이후만 선택할 수 있습니다.</p></span></div>
      <div class="fm-row"><span class="k">설명<span class="req">*</span></span>
        <span class="v"><textarea class="fm-in bmk-memo" id="cfDesc">${f.desc}</textarea></span></div>

      <div class="acc open" style="margin-top:10px">
        <div class="acc-h">${ICON2.person}<span class="tt">대상 정보 (${f.targets.length}/4)</span>
          <button class="btn-ghost sm" style="margin-left:auto" data-csact="addT" ${f.targets.length >= 4 ? 'disabled' : ''}>대상 추가</button></div>
        <div class="acc-b">${f.targets.length ? tg : '<div class="mn-empty">추가된 대상이 없습니다.</div>'}</div>
      </div>
      <div class="acc open">
        <div class="acc-h">${ICON2.cam}<span class="tt">증거 영상 (${f.videos.length})</span>
          <button class="btn-ghost sm" style="margin-left:auto" data-csact="addV">영상 추가</button></div>
        <div class="acc-b">${f.videos.length ? ev : '<div class="mn-empty">등록된 증거 영상이 없습니다.</div>'}</div>
      </div>
      <div class="acc open">
        <div class="acc-h">${ICON2.cctv}<span class="tt">이동 경로</span></div>
        <div class="acc-b"><p class="hintline">추가한 대상과 영상 정보에 맞춰 경로가 자동으로 구성됩니다.</p></div>
      </div>
    </div>`;
}

function bindCsEdit() {
  const f = CS.form;
  const keep = (id, key) => {
    const el = $(id); if (!el) return;
    el.oninput = e => {
      f[key] = e.target.value; const s = e.target.selectionStart;
      renderCsView(); const n = $(id); if (n) { n.focus(); try { n.setSelectionRange(s, s); } catch (_) { } }
    };
  };
  keep('#cfName', 'name'); keep('#cfFrom', 'from'); keep('#cfTo', 'to'); keep('#cfDesc', 'desc');
  $$('#menuView [data-csst]').forEach(b => b.onclick = () => { f.status = b.dataset.csst; renderCsView(); });
  $$('#menuView [data-cskd]').forEach(b => b.onclick = () => { f.kind = b.dataset.cskd; renderCsView(); });
  $$('#menuView [data-cstx]').forEach(b => b.onclick = () => {
    const i = +b.dataset.cstx, t = f.targets[i];
    alertBox({
      title: '대상을 삭제할까요?', desc: `<b>${t.name}</b> 이 사건에서 제외됩니다.`, ok: '삭제', danger: true,
      onOk: () => { f.targets.splice(i, 1); renderCsView(); }
    });
  });
  $$('#menuView [data-csvdel]').forEach(b => b.onclick = () => {
    const i = +b.dataset.csvdel;
    alertBox({
      title: '영상을 삭제할까요?', desc: '증거 목록에서 해당 영상이 제외됩니다.', ok: '삭제', danger: true,
      onOk: () => { f.videos.splice(i, 1); renderCsView(); }
    });
  });
  $$('#menuView [data-csvid]').forEach(b => b.onclick = () => openVideoView(f.videos[+b.dataset.csvid].img));
  $$('#menuView [data-csact]').forEach(b => b.onclick = () => {
    const a = b.dataset.csact;
    if (a === 'addT') return openCaseAdd('target');
    if (a === 'addV') return openCaseAdd('video');
    if (a === 'save') {
      const c = CASE_DB.find(x => x.id === f.id);
      Object.assign(c, { name: f.name, status: f.status, kind: f.kind, from: f.from, to: f.to, desc: f.desc, targets: f.targets, videos: f.videos });
      CS.mode = 'view'; renderCsView(); return;
    }
    if (a === 'ecancel') {
      if (!csDirty()) { CS.mode = 'view'; renderCsView(); return; }
      alertBox({
        title: '편집을 취소할까요?', desc: '변경한 내용은 저장되지 않습니다.', ok: '편집 취소', danger: true,
        onOk: () => { CS.mode = 'view'; renderCsView(); }
      });
    }
  });
}

/* ---- 대상 추가 / 영상 추가 팝업 ---- */
function openCaseAdd(kind) {
  CA.kind = kind; CA.tab = kind === 'target' ? '검색' : '대상';
  CA.pickT = []; CA.pickV = []; CA.q = ''; CA.open = {};
  renderCaseAdd(); openModal('#mdCaseAdd');
}
function renderCaseAdd() {
  const head = $('#caHead'), body = $('#caBody'), foot = $('#caFoot');
  const isT = CA.kind === 'target';
  const tabs = isT ? ['검색', '북마크'] : ['대상', '북마크'];
  const picked = isT ? CA.pickT : CA.pickV;

  head.innerHTML = `<div><h3>${isT ? '대상 추가' : '영상 추가'}</h3>
      <p>${isT ? '사건과 연관된 대상을 추가하여 함께 관리할 수 있습니다.'
              : '추가된 대상 또는 북마크한 영상을 사건 증거 자료로 등록할 수 있습니다.'}</p></div>
    <button class="btn-icon md-x" id="caX"><svg viewBox="0 0 16 16" class="ic"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.3"/></svg></button>`;

  let inner = '';
  if (isT) {
    if (CA.tab === '검색') {
      const q = CA.q.trim();
      const pool = OBJECTS.filter(o => !CS.form.targets.some(t => t.obj === o.id));
      const L = q ? pool.slice(0, 8) : [];
      inner = `<div class="mn-searchbox" style="margin-bottom:10px">
          <input class="fm-in" id="caQ" placeholder="검색어를 입력해 주세요." value="${CA.q}">
          <span class="sic">${GICON.search}</span></div>
        <div class="mn-count" style="margin-bottom:8px">총 <em>${L.length}</em></div>
        ${L.length ? `<div class="bmk-grid">${L.map(o => `
          <div class="bmk-card obj${CA.pickT.includes(o.id) ? ' on' : ''}" data-capt="${o.id}">
            <div class="bmk-thumb"><img src="${o.img}" alt=""></div>
            <div class="bmk-meta"><div class="bmk-place">인물 ${o.id.slice(-2)}</div>
              <div class="bmk-sub">${o.cam}</div><div class="bmk-time">${o.t}</div></div>
          </div>`).join('')}</div>`
          : `<div class="mn-empty">검색어를 입력해 주세요.</div>`}`;
    } else {
      const L = BOOKMARKS.filter(b => b.kind === 'object' && !BM.removed.has(b.id));
      inner = L.length ? `<div class="bmk-grid">${L.map(b => `
          <div class="bmk-card obj${CA.pickT.includes(b.obj) ? ' on' : ''}" data-capt="${b.obj}">
            <div class="bmk-thumb"><img src="${b.img}" alt=""></div>
            <div class="bmk-meta"><div class="bmk-place">${b.target}</div>
              <div class="bmk-sub">${b.guid || '-'}</div><div class="bmk-time">${b.first.slice(0, 16)}</div></div>
          </div>`).join('')}</div>`
        : `<div class="mn-empty">북마크한 대상이 없습니다.</div>`;
    }
  } else {
    if (CA.tab === '대상') {
      inner = `<div class="mn-count" style="margin-bottom:8px">총 <em>${CA.pickV.length}</em>건 선택</div>` +
        CS.form.targets.map((t, gi) => {
          const clips = (CASE_DB.find(c => c.id === CS.form.id).videos.concat(
            BOOKMARKS.filter(b => b.kind === 'video').map(b => ({ img: b.img, place: b.place, at: b.shot, cam: b.cam, rel: b.target, ok: true }))
          )).slice(0, 6);
          const sel = clips.filter((_, i) => CA.pickV.includes(gi + '-' + i)).length;
          const open = CA.open[gi] !== false;
          return `<div class="acc${open ? ' open' : ''}">
            <div class="acc-h" data-cag="${gi}">${ICON2.person}
              <span class="tt">${t.name}<span style="color:var(--st-mid)">*</span> <em style="color:var(--tx-tertiary);font-style:normal;font-size:10.5px">${sel}/${clips.length}건</em></span>
              <span class="cv">${ICON2.chev}</span></div>
            <div class="acc-b">
              <p class="hintline">선택 시 인물이 대상 정보에 자동으로 추가됩니다.</p>
              ${clips.map((v, i) => `
                <label class="ev-card" style="cursor:pointer">
                  <input type="checkbox" class="cb" data-capv="${gi}-${i}" ${CA.pickV.includes(gi + '-' + i) ? 'checked' : ''} style="align-self:center">
                  <div class="th"><img src="${v.img}" alt=""></div>
                  <div class="info"><div class="pl">${v.place}</div>
                    <div class="tg-kv">일시 <b>${v.at}</b></div></div>
                </label>`).join('')}
            </div></div>`;
        }).join('');
    } else {
      const L = BOOKMARKS.filter(b => b.kind === 'video' && !BM.removed.has(b.id));
      inner = `<div class="mn-count" style="margin-bottom:8px">총 <em>${CA.pickV.length}</em>건 선택</div>` +
        (L.length ? L.map((b, i) => `
          <label class="ev-card" style="cursor:pointer">
            <input type="checkbox" class="cb" data-capv="bm-${i}" ${CA.pickV.includes('bm-' + i) ? 'checked' : ''} style="align-self:center">
            <div class="th"><img src="${b.img}" alt=""><span class="bmk-dur">${b.dur}</span></div>
            <div class="info"><div class="pl">${b.place}</div>
              <div class="tg-kv">일시 <b>${b.shot}</b></div>
              <div class="tg-kv">대상 <b>${b.target}</b></div></div>
          </label>`).join('') : '<div class="mn-empty">북마크한 영상이 없습니다.</div>');
    }
  }

  body.innerHTML = `<div class="mn-chips" style="margin-bottom:12px">${tabs.map(t =>
    `<button class="mn-chip${CA.tab === t ? ' on' : ''}" data-catab="${t}">${t}</button>`).join('')}</div>${inner}`;
  foot.innerHTML = `<button class="btn-ghost" id="caCancel">취소</button>
    <button class="btn-primary" id="caOk" ${picked.length ? '' : 'disabled'}>추가</button>`;

  $$('#caBody [data-catab]').forEach(b => b.onclick = () => { CA.tab = b.dataset.catab; renderCaseAdd(); });
  const q = $('#caQ');
  if (q) q.oninput = e => { CA.q = e.target.value; const s = e.target.selectionStart; renderCaseAdd(); const n = $('#caQ'); n.focus(); n.setSelectionRange(s, s); };
  $$('#caBody [data-capt]').forEach(c => c.onclick = () => {
    const id = c.dataset.capt;
    CA.pickT = CA.pickT.includes(id) ? CA.pickT.filter(x => x !== id) : [...CA.pickT, id];
    renderCaseAdd();
  });
  $$('#caBody [data-capv]').forEach(c => c.onclick = e => {
    e.stopPropagation();
    const k = c.dataset.capv;
    CA.pickV = CA.pickV.includes(k) ? CA.pickV.filter(x => x !== k) : [...CA.pickV, k];
    renderCaseAdd();
  });
  $$('#caBody [data-cag]').forEach(h => h.onclick = e => {
    if (e.target.closest('input')) return;
    const g = h.dataset.cag; CA.open[g] = CA.open[g] === false; renderCaseAdd();
  });

  const close = () => {
    if (!picked.length) { closeModal('#mdCaseAdd'); return; }
    alertBox({
      title: '등록을 취소할까요?', desc: '선택한 항목은 추가되지 않습니다.', ok: '등록 취소', danger: true,
      onOk: () => closeModal('#mdCaseAdd')
    });
  };
  $('#caX').onclick = close; $('#caCancel').onclick = close;
  $('#caOk').onclick = () => {
    if (isT) {
      CA.pickT.forEach(id => {
        const o = OBJECTS.find(x => x.id === id); if (!o || CS.form.targets.length >= 4) return;
        CS.form.targets.push({ obj: o.id, name: `인물 ${String.fromCharCode(65 + CS.form.targets.length)}`, img: o.img, at: o.t, ev: '-', top: 'black', bottom: 'black' });
      });
    } else {
      CA.pickV.forEach(() => {
        const b = BOOKMARKS.filter(x => x.kind === 'video')[CS.form.videos.length % 5] || BOOKMARKS[0];
        CS.form.videos.push({ img: b.img, place: b.place, at: b.shot, cam: b.cam, rel: b.target, ok: true });
      });
    }
    closeModal('#mdCaseAdd'); renderCsView();
  };
}
/* ============================================================
   A타입 : LNB · 모드 칩 · AI 검색 모드 · 최근 검색 (GNB/LNB 개선 260824)
   ============================================================ */
const LNB_ITEMS = [
  { k: '',         ic: 'search',   t: '검색' },
  { k: 'bookmark', ic: 'bookmark', t: '북마크' },
  { k: 'case',     ic: 'cases',    t: '사건관리' },
  { k: 'map',      ic: 'map',      t: '맵관리' }
];
function renderLnb() {
  const el = $('#lnb'); if (!el) return;
  el.innerHTML = LNB_ITEMS.map(g =>
    `<button data-menu="${g.k}" title="${g.t}" class="${(S.menu || '') === g.k ? 'on' : ''}">
       <span class="bx">${GICON[g.ic]}</span><span>${g.t}</span></button>`).join('');
  $$('#lnb [data-menu]').forEach(b => b.onclick = () => setMenu(b.dataset.menu || null));
}
/* 기존 renderMenuBar 호출부를 그대로 살리기 위해 별칭 */
renderMenuBar = renderLnb;

/* ---- 텍스트 모드 : 플레이스홀더 · 검색 버튼 · 최근 검색 ---- */
const TEXT_RECENT = [
  '어제 검은색 옷을 입은 택배 기사 찾아줘',
  '지하 주차장에서 빨간색 가방을 든 여자',
  '최근 3일 이내 침입 시도한 사람',
  '주차장 내 흡연한 사람',
  '최근 3일간 안전모 미착용한 인물'
];
S.textRecent = TEXT_RECENT.slice();

(function initTextA() {
  const ta = $('#qText'); if (!ta) return;
  ta.placeholder = '대상의 특징을 문장으로 입력해 보세요.\n(예: 흰색 옷을 입고 가방을 든 사람)';
  /* 입력창 안 검색 버튼 */
  const wrap = ta.parentElement;
  if (wrap && !wrap.querySelector('.ta-search')) {
    const b = document.createElement('button');
    b.className = 'ta-search'; b.title = '검색';
    b.innerHTML = GICON.search;
    b.onclick = () => { if (S.q.trim()) { pushTextRecent(S.q.trim()); runSearch(false); } };
    wrap.appendChild(b);
  }
  /* 자동완성(최근 검색) — 입력창과 같은 박스 안에 붙인다 */
  const box = document.createElement('div');
  box.id = 'textRecent';
  wrap.appendChild(box);
  renderTextRecent();
  ta.addEventListener('focus', openAutocomplete);
  ta.addEventListener('blur', () => setTimeout(closeAutocomplete, 160));
  ta.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const v = S.q.trim(); if (v) { pushTextRecent(v); runSearch(false); } }
  });
})();

function pushTextRecent(v) {
  S.textRecent = [v, ...S.textRecent.filter(x => x !== v)].slice(0, 7);
  renderTextRecent();
}
/* 자동완성 드롭다운 (Search main_001_2) — 입력창과 한 박스, 행 + ✕ */
function renderTextRecent() {
  const box = $('#textRecent'); if (!box) return;
  const wrap = box.closest('.textarea-wrap');
  if (!S.textRecent.length) { box.innerHTML = ''; if (wrap) wrap.classList.remove('ac-open'); return; }
  box.innerHTML = `<div class="lb">최근 검색</div>` + S.textRecent.map((v, i) =>
    `<div class="ac-row" data-trc="${i}"><span class="t">${v}</span>
       <button class="x" data-trx="${i}" title="삭제">✕</button></div>`).join('');
  $$('#textRecent [data-trc]').forEach(p => p.onclick = e => {
    if (e.target.closest('[data-trx]')) return;
    const v = S.textRecent[+p.dataset.trc];
    S.q = v; $('#qText').value = v; $('#qTextClear').hidden = false;
    closeAutocomplete();
    buildFilters('text'); runSearch(false);
  });
  $$('#textRecent [data-trx]').forEach(b => b.onclick = e => {
    e.stopPropagation(); S.textRecent.splice(+b.dataset.trx, 1); renderTextRecent();
  });
}
function openAutocomplete() {
  const w = $('#textRecent') && $('#textRecent').closest('.textarea-wrap');
  if (w && S.textRecent.length) w.classList.add('ac-open');
}
function closeAutocomplete() {
  const w = $('#textRecent') && $('#textRecent').closest('.textarea-wrap');
  if (w) w.classList.remove('ac-open');
}

/* ---- AI 검색을 모드 칩으로 통합 ---- */
const AIM = { log: [], wait: false };
(function initAimPanel() {
  const panels = $('#modePanels'); if (!panels) return;
  const sec = document.createElement('section');
  sec.className = 'mode-panel'; sec.dataset.panel = 'aim';
  sec.innerHTML = `<div class="aim-body">
      <div class="aim-scroll" id="aimScroll"></div>
      <div class="aim-input">
        <textarea id="aimQ" placeholder="검정색 상의를 입은 남성"></textarea>
        <div class="aim-row"><button class="plus" title="첨부">+</button>
          <button class="aim-send" id="aimSend" title="전송">↑</button></div>
      </div>
    </div>`;
  panels.appendChild(sec);
  renderAimPanel();
  $('#aimSend').onclick = () => {
    const v = ($('#aimQ').value || '').trim(); if (!v) return;
    AIM.log.push({ me: v }); $('#aimQ').value = '';
    renderAimPanel();
    setTimeout(() => { AIM.wait = false; sendAI(v); renderAimPanel(); }, 900);
    AIM.wait = true; renderAimPanel();
  };
})();

function renderAimPanel() {
  const el = $('#aimScroll'); if (!el) return;
  el.innerHTML = `<div class="aim-title"><i class="i-ai"></i>무엇을 도와드릴까요?</div>
    <div class="aim-sugg">${AI_SUGGESTIONS.map(s => `<button data-aims="${s}">${s}</button>`).join('')}</div>
    ${AIM.log.map(l => `<div class="aim-user">${l.me}</div>`).join('')}
    ${AIM.wait ? `<div class="aim-wait"><i class="i-ai" style="width:13px;height:13px"></i>답변 생성중...</div>` : ''}`;
  $$('#aimScroll [data-aims]').forEach(b => b.onclick = () => {
    AIM.log.push({ me: b.dataset.aims }); AIM.wait = true; renderAimPanel();
    setTimeout(() => { AIM.wait = false; sendAI(b.dataset.aims); renderAimPanel(); }, 900);
  });
}

const _buildFilters = buildFilters;

/* init */
renderLnb();
buildFilters('text');
/* ============================================================
   수정 3건 (260824)
   1) 필터는 '검색 이후'에만 표시
   2) AI 에이전트 = 우측 상단 버튼 → 레이어 오버레이 (B안 동작)
   3) AI 렌더를 패널/오버레이 공용으로
   ============================================================ */

/* ---- 1) 필터 : 검색 후에만 노출 ---- */
buildFilters = function (mode) {
  const box = document.querySelector(`.filters[data-filters="${mode}"]`);
  if (!S.searched) { if (box) box.innerHTML = ''; return; }
  const prev = filterEnabled;
  filterEnabled = () => true;
  try { _buildFilters(mode); } finally { filterEnabled = prev; }
};
const _runSearchA = runSearch;
runSearch = function (keep) { _runSearchA(keep); buildFilters(S.mode); renderTextRecent(); if (typeof applyLayout === 'function') applyLayout(); };

/* ---- 2) AI 에이전트 오버레이 (B안) ---- */
(function initAiFloat() {
  const d = document.createElement('div');
  d.className = 'ai-float'; d.id = 'aiFloat'; d.hidden = true;
  d.innerHTML = `<div class="afh">AI 에이전트
      <button class="x" id="afClose" title="닫기"><svg viewBox="0 0 16 16" class="ic" style="width:14px;height:14px"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.3"/></svg></button>
    </div>
    <div class="aim-body">
      <div class="aim-scroll"></div>
      <div class="aim-input">
        <textarea class="aim-q" placeholder="검정색 상의를 입은 남성"></textarea>
        <div class="aim-row"><button class="plus" title="첨부">+</button>
          <button class="aim-send" title="전송">↑</button></div>
      </div>
    </div>`;
  document.body.appendChild(d);
  $('#afClose').onclick = () => toggleAiFloat(false);
  const btn = $('#btnAI');
  if (btn) btn.onclick = () => toggleAiFloat($('#aiFloat').hidden);
  renderAim();
})();

function toggleAiFloat(open) {
  $('#aiFloat').hidden = !open;
  $('#btnAI').classList.toggle('on', !!open);
  if (open) renderAim();
}

/* ---- 3) AI 렌더 : 좌측 패널(A타입 칩) + 오버레이(B안) 공용 ---- */
renderAimPanel = renderAim;
function renderAim() {
  const html = `<div class="aim-title"><i class="i-ai"></i>무엇을 도와드릴까요?</div>
    <div class="aim-sugg">${AI_SUGGESTIONS.map(s => `<button data-aims="${s}">${s}</button>`).join('')}</div>
    ${AIM.log.map(l => `<div class="aim-user">${l.me}</div>`).join('')}
    ${AIM.wait ? `<div class="aim-wait"><i class="i-ai" style="width:13px;height:13px"></i>답변 생성중...</div>` : ''}`;
  $$('.aim-scroll').forEach(el => { el.innerHTML = html; el.scrollTop = el.scrollHeight; });
  $$('.aim-scroll [data-aims]').forEach(b => b.onclick = () => askAim(b.dataset.aims));
  $$('.aim-q').forEach(t => t.onkeydown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const v = t.value.trim(); if (v) { t.value = ''; askAim(v); } }
  });
  $$('.aim-send').forEach(b => b.onclick = () => {
    const t = b.closest('.aim-input').querySelector('.aim-q');
    const v = (t.value || '').trim(); if (!v) return; t.value = ''; askAim(v);
  });
}
function askAim(q) {
  AIM.log.push({ me: q }); AIM.wait = true; renderAim();
  setTimeout(() => { AIM.wait = false; try { sendAI(q); } catch (_) { } renderAim(); }, 900);
}

/* 초기 상태 : 필터 숨김 */
buildFilters('text');
/* ============================================================
   검색화면 레이아웃 시안 전환 (A / B) — 260825
   A : 모드 칩 6종(AI 검색 포함)  ·  B : AI 검색 전용 입력 + 일반 검색 칩 5종 + 헤더 브레드크럼
   ============================================================ */
S.layout = localStorage.getItem('svms_layout') || 'a';

const MODE_LABEL = { aim: 'AI 검색', text: '텍스트 검색', image: '이미지 검색', car: '차량번호 검색', person: '등록 인물 검색', algo: '지능형 알고리즘' };

/* 전환 스위치를 윈도우 크롬에 삽입 */
(function initLayoutSwitch() {
  const r = document.querySelector('.win-r'); if (!r) return;
  const sw = document.createElement('div');
  sw.className = 'layout-sw'; sw.id = 'layoutSw';
  sw.innerHTML = `<button data-lay="a">A안</button><button data-lay="b">B안</button>`;
  r.insertBefore(sw, r.firstChild);
  $$('#layoutSw [data-lay]').forEach(b => b.onclick = () => setLayout(b.dataset.lay));
})();

function setLayout(k) {
  S.layout = k;
  localStorage.setItem('svms_layout', k);
  $$('#layoutSw [data-lay]').forEach(b => b.classList.toggle('on', b.dataset.lay === k));
  document.body.classList.toggle('lay-b', k === 'b');
  applyLayout();
}

/* B 시안 전용 블록 생성/제거 */
function applyLayout() {
  const body = $('.side-body');
  const chips = $('#modeRail');
  let bwrap = $('#bIntro');

  /* --- 헤더 브레드크럼 --- */
  const head = $('#sideHead');
  let crumb = $('#sideCrumb');
  if (S.layout === 'b') {
    if (!crumb) {
      crumb = document.createElement('span');
      crumb.className = 'side-crumb'; crumb.id = 'sideCrumb';
      head.replaceChild(crumb, head.querySelector('.side-title'));
    }
    const m = S.mode || 'text';
    crumb.innerHTML = `검색<span class="sep">›</span>
      <span class="mchip">${MODE_LABEL[m] || '텍스트 검색'}
        <button class="x" id="crumbX" title="검색 유형 변경">✕</button></span>`;
    $('#crumbX').onclick = () => { S.bPick = true; applyLayout(); };
  } else if (crumb) {
    const t = document.createElement('span');
    t.className = 'side-title'; t.textContent = '검색';
    head.replaceChild(t, crumb);
  }

  /* --- 본문 : A=칩만 / B=AI박스+일반검색칩 --- */
  if (S.layout === 'b') {
    if (!bwrap) {
      bwrap = document.createElement('div');
      bwrap.className = 'bsec'; bwrap.id = 'bIntro';
      body.insertBefore(bwrap, chips);
    }
    bwrap.innerHTML = `
      <div class="lb">AI 검색</div>
      <div class="b-aibox" id="bAi">
        <span class="plus">+</span><span class="ph">무엇이든 물어보세요</span>
        <button class="go" title="AI 에이전트 열기"><i class="i-ai"></i></button>
      </div>
      <div class="lb" style="margin-top:16px">일반 검색</div>`;
    $('#bAi').onclick = () => toggleAiFloat(true);
    /* 일반 검색 칩에서 AI 검색 제외 */
    chips.classList.add('b-chips');
    $$('#modeRail button').forEach(b => { b.hidden = (b.dataset.mode === 'aim'); });
    if (S.mode === 'aim') switchMode('text');
  } else {
    if (bwrap) bwrap.remove();
    chips.classList.remove('b-chips');
    $$('#modeRail button').forEach(b => { b.hidden = false; });
  }
  /* B안 : 검색을 실행하면 진입 블록(AI 검색·일반 검색 칩)을 접고 조건+필터만 남긴다.
     헤더 브레드크럼의 ✕ 로 다시 검색 유형 선택 상태로 돌아간다. */
  const hideIntro = (S.layout === 'b' && !S.bPick && !!S.searched);
  chips.hidden = hideIntro;
  if (bwrap) bwrap.hidden = hideIntro;
}

/* 모드 전환 유틸 (칩 클릭과 동일 동작) */
function switchMode(k) {
  const b = document.querySelector(`#modeRail button[data-mode="${k}"]`);
  if (b) b.click(); else {
    $$('#modeRail button').forEach(x => x.classList.toggle('on', x.dataset.mode === k));
    S.mode = k;
    $$('.mode-panel').forEach(p => p.classList.toggle('on', p.dataset.panel === k));
  }
}

/* 모드가 바뀌면 브레드크럼 갱신 */
document.addEventListener('click', e => {
  if (!e.target.closest('#modeRail button')) return;
  S.bPick = false;
  setTimeout(() => { if (S.layout === 'b') applyLayout(); }, 0);
});

/* init */
setLayout(S.layout);
/* ============================================================
   인물 관리 팝업 — GUI 정합 재작성 (Search main_003_4 / 003_5)
   목록 / 새 인물 등록 / 인물 상세 / 인물 수정
   이미지 배지 : 대표(파랑) · 얼굴(초록) · 대상(퍼플)
   ============================================================ */
const PM_SORTS = ['등록일순', '이름순'];
let pmSort = '등록일순';

/* 업로드 이미지의 자동 분류(얼굴/대상). 데이터에 kinds 가 없으면 파생 */
function pmKinds(p) {
  if (p.kinds && p.kinds.length === p.imgs.length) return p.kinds;
  return p.imgs.map((_, i) => (i < 3 ? 'face' : 'obj'));
}
const PM_ICON_SEARCH = '<svg viewBox="0 0 16 16" class="ic"><circle cx="7" cy="7" r="4.6" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M10.4 10.4L14 14" stroke="currentColor" stroke-width="1.3"/></svg>';

renderPM = function () {
  const head = {
    list: ['인물 관리', '대상 검색에 사용할 인물을 등록 · 관리할 수 있습니다.'],
    new: ['인물 관리', '대상 검색에 사용할 인물을 등록 · 관리할 수 있습니다.'],
    detail: ['인물 관리', '대상 검색에 사용할 인물을 등록 · 관리할 수 있습니다.'],
    edit: ['인물 관리', '대상 검색에 사용할 인물을 등록 · 관리할 수 있습니다.']
  }[pmView];
  $('#pmTitle').textContent = head[0];
  $('#pmDesc').textContent = head[1]; $('#pmDesc').hidden = false;
  $('#pmBack').hidden = true;                   /* 서브헤더의 ← 로 대체 */

  const backTo = () => {
    if (pmView === 'new' && pmForm && (pmForm.name || pmForm.imgs.length)) {
      alertBox({ title: '등록을 취소할까요?', desc: '작성한 내용은 저장되지 않습니다.', ok: '등록 취소', danger: true,
        onOk: () => { pmForm = null; pmView = 'list'; renderPM(); } });
    } else { pmForm = null; pmView = (pmView === 'edit' ? 'detail' : 'list'); renderPM(); }
  };

  /* ---------------- 목록 ---------------- */
  if (pmView === 'list') {
    const L = S.persons
      .filter(p => !pmQuery || p.name.includes(pmQuery))
      .sort((a, b) => pmSort === '이름순' ? a.name.localeCompare(b.name) : (a.reg < b.reg ? 1 : -1));
    $('#pmBody').innerHTML = `
      <div class="pmg-tools">
        <div class="pmg-r1"><span class="lb">등록된 인물</span>
          <button class="btn-ghost sm" id="pmNew">새 인물 등록</button></div>
        <div class="pmg-search"><input class="fm-in" id="pmQ" placeholder="검색" value="${pmQuery}">
          <span class="sic">${PM_ICON_SEARCH}</span></div>
        <div class="pmg-r2">
          <label class="check sm"><input type="checkbox" id="pmAll" ${pmSel.length && pmSel.length === S.persons.length ? 'checked' : ''}><i></i>전체 선택</label>
          <span class="div">|</span>
          <button class="lk" id="pmDel" ${pmSel.length ? '' : 'disabled'}>선택 삭제</button>
          <div class="select xs sel" id="pmSortSel" data-value="${pmSort}">
            <button class="select-btn">${pmSort}${ICON.caret}</button>
            <div class="select-menu">${PM_SORTS.map(s => `<div data-v="${s}">${s}</div>`).join('')}</div>
          </div>
        </div>
      </div>
      ${L.length ? `<div class="pmg-grid">${L.map(p => `
        <div class="pmg-card${pmSel.includes(p.id) ? ' on' : ''}" data-pm="${p.id}">
          <div class="th"><img src="${p.imgs[0]}" alt=""></div>
          <div class="bd">
            <div class="nm">${p.name}</div>
            <div class="gu">${p.guid}</div>
            <div class="ds">${p.desc || '-'}</div>
            <div class="rg">${p.reg}</div>
          </div>
          <label class="check cb" onclick="event.stopPropagation()">
            <input type="checkbox" data-sel="${p.id}" ${pmSel.includes(p.id) ? 'checked' : ''}><i></i></label>
        </div>`).join('')}</div>`
      : `<div class="mn-empty">등록된 인물이 없습니다.<br>대상 검색에 사용할 인물을 등록해 주세요.</div>`}`;
    $('#pmFoot').innerHTML = `<button class="btn-ghost" data-close>취소</button><button class="btn-primary" id="pmOk">완료</button>`;

    $('#pmNew').onclick = () => { pmForm = { name: '', desc: '', imgs: [], kinds: [] }; pmView = 'new'; renderPM(); };
    const q = $('#pmQ');
    q.oninput = e => { pmQuery = e.target.value; const s = e.target.selectionStart; renderPM(); const n = $('#pmQ'); n.focus(); n.setSelectionRange(s, s); };
    $$('#pmBody [data-sel]').forEach(cb => cb.onchange = () => {
      const id = cb.dataset.sel;
      pmSel = cb.checked ? [...pmSel, id] : pmSel.filter(x => x !== id);
      renderPM();
    });
    $('#pmAll').onchange = e => { pmSel = e.target.checked ? S.persons.map(p => p.id) : []; renderPM(); };
    $('#pmDel').onclick = () => alertBox({
      title: '선택한 인물을 삭제할까요?', desc: `<b>${pmSel.length}명</b>의 인물 데이터가 삭제됩니다.`, ok: '삭제', danger: true,
      onOk: () => { S.persons = S.persons.filter(p => !pmSel.includes(p.id)); S.selPersons = S.selPersons.filter(id => !pmSel.includes(id)); pmSel = []; renderPM(); renderPersonGrid(); runSearch(false); }
    });
    $$('#pmBody [data-pm]').forEach(c => c.onclick = e => {
      if (e.target.closest('.cb')) return;
      pmTarget = S.persons.find(p => p.id === c.dataset.pm); pmView = 'detail'; renderPM();
    });
    const ss = $('#pmSortSel');
    if (ss) $$('#pmSortSel [data-v]').forEach(d => d.onclick = () => { pmSort = d.dataset.v; renderPM(); });
    return;
  }

  /* ---------------- 등록 / 수정 / 상세 ---------------- */
  const ro = pmView === 'detail';
  const src = ro ? pmTarget : (pmView === 'edit' ? pmTarget : null);
  if (pmView === 'edit' && (!pmForm || pmForm._id !== pmTarget.id))
    pmForm = { _id: pmTarget.id, name: pmTarget.name, desc: pmTarget.desc, imgs: pmTarget.imgs.slice(), kinds: pmKinds(pmTarget).slice() };
  if (pmView === 'new' && !pmForm) pmForm = { name: '', desc: '', imgs: [], kinds: [] };
  const f = ro ? { name: src.name, desc: src.desc, imgs: src.imgs, kinds: pmKinds(src) } : pmForm;
  const title = pmView === 'new' ? '새 인물 등록' : (pmView === 'edit' ? '인물 상세' : '인물 상세');
  const guid = ro || pmView === 'edit' ? pmTarget.guid : (f.imgs.length ? '9098549' + String(31029 + S.persons.length) : '');

  const imgsHTML = f.imgs.map((im, i) => `
    <div class="pmf-img${i === 0 ? ' is-rep' : ''}">
      <img src="${im}" alt="">
      <div class="pmf-badges">
        ${i === 0 ? '<span class="pmf-bd b-rep">대표</span>' : ''}
        <span class="pmf-bd ${f.kinds[i] === 'obj' ? 'obj' : 'face'}">${f.kinds[i] === 'obj' ? '대상' : '얼굴'}</span>
      </div>
      ${ro ? '' : `<button class="x" data-rmimg="${i}" title="삭제">✕</button>`}
    </div>`).join('');

  $('#pmBody').innerHTML = `
    <div class="side-crumb" style="margin-bottom:14px">
      <button class="btn-icon" id="pmBack2" title="뒤로"><svg viewBox="0 0 16 16" class="ic"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.4" fill="none"/></svg></button>
      <span style="font-size:12.5px;font-weight:600;color:var(--tx-primary)">${title}</span>
    </div>
    <div class="pmf-head">
      <span class="lb">이미지${f.imgs.length ? ` (${f.imgs.length}/10)` : ''}${ro ? '' : ' <i>*</i>'}</span>
      ${ro ? '' : `<button class="btn-ghost sm" id="pmAdd" ${f.imgs.length >= 10 ? 'disabled' : ''}>이미지 추가</button>`}
    </div>
    ${f.imgs.length
      ? `<div class="pmf-imgs">${imgsHTML}</div>`
      : `<div class="pmf-drop" id="pmDrop">
           <svg viewBox="0 0 24 24" class="up-ic"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
           <div class="m">이미지를 드래그하거나 클릭하여 업로드</div>
           <div class="s">JPG, PNG 지원 · 최대 10MB</div>
           <button class="btn-primary sm">이미지 선택</button>
         </div>`}
    <div class="pmf-row"><label>이름${ro ? '' : ' <i>*</i>'}</label>
      <input class="fm-in" id="pfName" placeholder="입력" value="${f.name}" ${ro ? 'disabled' : ''}></div>
    <div class="pmf-row"><label>GUID</label>
      <input class="fm-in" value="${guid}" placeholder="이미지 등록 시 자동 생성됩니다." disabled></div>
    <div class="pmf-row"><label>설명</label>
      <textarea class="fm-in" id="pfDesc" placeholder="인물 설명" ${ro ? 'disabled' : ''}>${f.desc || ''}</textarea></div>`;

  if (ro) {
    $('#pmFoot').innerHTML = `<button class="btn-ghost" id="pfEdit">수정</button><button class="btn-primary" id="pfDel">삭제</button>`;
    $('#pfEdit').onclick = () => { pmView = 'edit'; pmForm = null; renderPM(); };
    $('#pfDel').onclick = () => alertBox({
      title: '인물을 삭제할까요?', desc: `<b>${pmTarget.name}</b> 의 등록 정보가 삭제됩니다.`, ok: '삭제', danger: true,
      onOk: () => { S.persons = S.persons.filter(x => x.id !== pmTarget.id); S.selPersons = S.selPersons.filter(id => id !== pmTarget.id); pmView = 'list'; renderPM(); renderPersonGrid(); runSearch(false); }
    });
  } else {
    const canSave = f.name.trim() && f.imgs.length;
    $('#pmFoot').innerHTML = `<button class="btn-ghost" id="pfCancel">취소</button>
      <button class="btn-primary" id="pfSave" ${canSave ? '' : 'disabled'}>${pmView === 'edit' ? '완료' : '등록'}</button>`;
    const addImg = () => {
      const pool = (typeof IMG_POOL !== 'undefined' && IMG_POOL.length) ? IMG_POOL : S.persons.flatMap(p => p.imgs);
      f.imgs.push(pool[f.imgs.length % pool.length]);
      f.kinds.push(f.imgs.length <= 3 ? 'face' : 'obj');     /* 업로드 시 자동 분류 */
      renderPM();
    };
    if ($('#pmDrop')) $('#pmDrop').onclick = addImg;
    if ($('#pmAdd')) $('#pmAdd').onclick = addImg;
    $$('#pmBody [data-rmimg]').forEach(b => b.onclick = () => alertBox({
      title: '이미지를 삭제할까요?', desc: '선택한 이미지가 삭제됩니다.', ok: '삭제', danger: true,
      onOk: () => { const i = +b.dataset.rmimg; f.imgs.splice(i, 1); f.kinds.splice(i, 1); renderPM(); }
    }));
    $('#pfName').oninput = e => { f.name = e.target.value; $('#pfSave').disabled = !(f.name.trim() && f.imgs.length); };
    $('#pfDesc').oninput = e => f.desc = e.target.value;
    $('#pfCancel').onclick = backTo;
    $('#pfSave').onclick = () => {
      if (pmView === 'edit') { Object.assign(pmTarget, { name: f.name, desc: f.desc, imgs: f.imgs, kinds: f.kinds }); pmView = 'detail'; pmForm = null; }
      else {
        const p = { id: 'p' + Date.now(), name: f.name, desc: f.desc, imgs: f.imgs, kinds: f.kinds,
                    guid: '9098549' + String(31029 + S.persons.length), reg: '2026-08-25 09:00' };
        S.persons.push(p); pmTarget = p; pmForm = null; pmView = 'detail';
      }
      renderPM(); renderPersonGrid();
    };
  }
  $('#pmBack2').onclick = backTo;
};
/* ===================== init ===================== */
renderTabs();
buildFilters('text');
renderPersonGrid();
renderAlgoGrid();
render();
renderMenuBar();
applyDemo();
applyMenuDemo();
window.addEventListener('hashchange', () => location.reload());


