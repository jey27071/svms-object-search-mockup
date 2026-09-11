/* ============================================================
   다층 뷰(3D) — 층별 도면을 실제 3D 로 쌓아 마우스로 360° 돌려 본다
   시안 5184:100653 '지도 다층뷰' · 사양 PTS_DTL_MAP_000_1 (1) 다층 뷰 모드
   - 대상이 실제 포착된 층만 쌓고, 층 태그는 각 층 우측에 둔다
   - 같은 층·같은 구역 이동은 실선, 층간·외부 이동은 점선
   - 지점 번호는 DOM 으로 얹는다 → 기존 커서 연동(syncMapToCursor)·
     라벨 배치(hideOverlappedLabels)·지점 클릭 이동(bindMapSeek)을 그대로 쓴다
   - 안내 방식은 시안의 세 가지 제안을 설정에서 고른다
     1 호버 시 툴팁(3초 후 사라짐) / 2 중앙 하단 상시 안내 / 3 우측 하단 3D 조작 버튼
   ============================================================ */
const M3D = (() => {
  const HAS = typeof THREE !== 'undefined';
  let ok = null;
  const supported = () => {
    if (ok !== null) return ok;
    try {
      const c = document.createElement('canvas');
      ok = HAS && !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch (e) { ok = false; }
    return ok;
  };

  /* 도면 비율(763x801)에 맞춘 층 크기 */
  const W = 6, D = 6 * 801 / 763, GAP = 4.6, SLAB = 0.07;
  /* 기본 시점 : 시안처럼 층이 겹치지 않고 위아래로 나뉘어 보이는 높이·거리 */
  const HOME = { az: -0.6, el: 0.72, dist: 27 };
  const view = { ...HOME };

  let host = null, renderer = null, scene = null, camera = null, root = null, ov = null;
  let tip = null, hint = null, btn3d = null;
  let raf = 0, key = '', pts = [], tags = [], center = null, tops = [];
  /* 가림 판정용 : 도면의 투명(건물 밖) 부분은 가리지 않는다 */
  let alphaData = null, aw = 0, ah = 0;
  const alphaAt = (u, v) => {
    if (!alphaData) return 255;
    const x = Math.min(aw - 1, Math.max(0, Math.floor(u * aw)));
    const y = Math.min(ah - 1, Math.max(0, Math.floor((1 - v) * ah)));
    return alphaData[(y * aw + x) * 4 + 3];
  };
  const ray = HAS ? new THREE.Raycaster() : null;
  let rotateOn = true, tipT = 0, drag = null;
  const stat = { down: 0, move: 0, up: 0, frames: 0 };

  const variant = () => String((typeof S !== 'undefined' && S.m3dHint) || '1');
  const cssColor = s => {
    const t = document.createElement('i'); t.style.color = s; document.body.appendChild(t);
    const c = getComputedStyle(t).color; t.remove(); return c || 'rgb(48,112,216)';
  };

  /* ── 막대(선) : WebGL 선은 굵기가 1px 로 고정이라 원기둥으로 그린다 ── */
  function rod(a, b, r, mat) {
    const d = new THREE.Vector3().subVectors(b, a), len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10, 1, true), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    return [m];
  }
  function dashRod(a, b, r, mat) {
    const d = new THREE.Vector3().subVectors(b, a), len = d.length();
    const n = Math.max(3, Math.round(len / 0.2)), out = [];
    for (let i = 0; i < n; i += 2) {
      const p = a.clone().addScaledVector(d, i / n), q = a.clone().addScaledVector(d, Math.min(1, (i + 1) / n));
      out.push(...rod(p, q, r, mat));
    }
    return out;
  }

  function ensure(h) {
    if (renderer && host === h) return;
    host = h; host.innerHTML = '';
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setClearColor(0xe8e9ec, 1);
    renderer.domElement.className = 'm3g-cv';
    host.appendChild(renderer.domElement);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, 1, 0.1, 400);
    center = new THREE.Vector3();

    ov = document.createElement('div'); ov.className = 'm3g-ov'; host.appendChild(ov);
    tip = document.createElement('div'); tip.className = 'm3g-tip';
    tip.textContent = '마우스를 드래그하여 360° 로 회전할 수 있습니다.'; tip.hidden = true;
    hint = document.createElement('div'); hint.className = 'm3g-hint'; hint.textContent = '드래그하여 360° 로 보기';
    btn3d = document.createElement('button'); btn3d.className = 'm3g-3d'; btn3d.type = 'button';
    btn3d.title = '3D 조작'; btn3d.setAttribute('aria-label', '3D 조작');
    btn3d.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7.5 4.2v9.6L12 21l-7.5-4.2V7.2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M4.5 7.2L12 11.4l7.5-4.2M12 11.4V21" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
    btn3d.onclick = e => { e.stopPropagation(); rotateOn = !rotateOn; applyVariant(); };
    host.append(tip, hint, btn3d);

    bindControls();
    if ('ResizeObserver' in window) new ResizeObserver(() => request()).observe(host);
  }

  function build(paths) {
    const p = paths && paths[0]; if (!p) return;
    const k = p.slot + JSON.stringify(p.pts.map(t => [t.n, t.cam, t.x, t.y]));
    if (k === key) return;
    key = k;
    if (root) scene.remove(root);
    root = new THREE.Group(); scene.add(root);

    /* 포착된 층만 — 위층이 위로 */
    const has = new Set(p.pts.map(t => m3FloorOf(t.cam)));
    const order = M3_FLOORS.filter(f => has.has(f.key));
    const yOf = {};
    order.forEach((f, i) => { yOf[f.key] = (order.length - 1 - i) * GAP; });
    center.set(0, (order.length - 1) * GAP / 2, 0);

    const src = typeof FLOOR_TEX !== 'undefined' ? FLOOR_TEX : 'assets/img/floor.png';
    const tex = new THREE.TextureLoader().load(src, img => {
      try {   /* 가림 판정에 쓸 알파를 한 번 떠 둔다 */
        const c = document.createElement('canvas'); aw = c.width = img.width; ah = c.height = img.height;
        const g = c.getContext('2d'); g.drawImage(img, 0, 0); alphaData = g.getImageData(0, 0, aw, ah).data;
      } catch (_) { alphaData = null; }
      request();
    });
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const topMat = new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide });
    const rimMat = new THREE.MeshBasicMaterial({ map: tex, color: 0x9ea1a9, alphaTest: 0.5, side: THREE.DoubleSide });
    const plane = new THREE.PlaneGeometry(W, D);
    tops = [];
    order.forEach(f => {
      const topM = new THREE.Mesh(plane, topMat);
      topM.rotation.x = -Math.PI / 2; topM.position.y = yOf[f.key] + SLAB / 2;
      topM.userData.floor = f.key;
      /* 같은 윤곽을 조금 아래에 어둡게 한 겹 — 층판 두께처럼 보인다 */
      const rim = new THREE.Mesh(plane, rimMat);
      rim.rotation.x = -Math.PI / 2; rim.position.y = yOf[f.key] - SLAB / 2;
      root.add(rim, topM);
      tops.push(topM);
    });
    const col = cssColor(slotColor(p.slot));
    const solidMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(col) });
    const dashMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(col) });
    const lift = SLAB / 2 + 0.04;
    const pos = t => new THREE.Vector3((t.x / 100 - 0.5) * W, yOf[m3FloorOf(t.cam)] + lift, (t.y / 100 - 0.5) * D);
    const seq = p.pts.slice().sort((a, b) => a.n - b.n);
    for (let i = 1; i < seq.length; i++) {
      const a = seq[i - 1], b = seq[i];
      const same = m3FloorOf(a.cam) === m3FloorOf(b.cam) && /외부/.test(a.cam) === /외부/.test(b.cam);
      root.add(...(same ? rod : dashRod)(pos(a), pos(b), same ? 0.055 : 0.045, same ? solidMat : dashMat));
    }

    ov.innerHTML =
      seq.map(t => `<span class="map-wp" data-pt="gl-${t.n}" data-cam="${t.cam}" data-hh="${t.hh}"
          data-x="${t.x}" data-y="${t.y}" title="${t.cam} · 이 지점으로 이동"
          style="background:${slotColor(p.slot)}">${t.n}</span>`).join('') +
      order.map(f => `<span class="m3g-tag">${f.label}</span>`).join('');
    const kids = [...ov.children];
    pts = seq.map((t, i) => ({ v: pos(t), el: kids[i], floor: m3FloorOf(t.cam) }));
    tags = order.map((f, i) => ({ y: yOf[f.key] + SLAB / 2, el: kids[seq.length + i] }));
    pts.forEach(q => q.el.addEventListener('pointerdown', e => e.stopPropagation()));
    if (typeof bindMapSeek === 'function') bindMapSeek();
  }

  function place() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return false;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = w + 'px'; renderer.domElement.style.height = h + 'px';
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const { az, el, dist } = view;
    camera.position.set(
      center.x + dist * Math.cos(el) * Math.sin(az),
      center.y + dist * Math.sin(el),
      center.z + dist * Math.cos(el) * Math.cos(az));
    camera.lookAt(center);
    renderer.render(scene, camera);

    const pr = v => { const q = v.clone().project(camera); return [(q.x + 1) / 2 * w, (1 - q.y) / 2 * h, q.z]; };
    pts.forEach(q => {
      const [x, y, z] = pr(q.v);
      q.el.style.left = x + 'px'; q.el.style.top = y + 'px';
      q.el.style.visibility = z < 1 ? '' : 'hidden';
      /* 위층 판에 가려진 지점은 흐리게 — DOM 배지는 늘 위에 그려져 가림이 안 보였다 */
      const dir = q.v.clone().sub(camera.position), far = dir.length();
      ray.set(camera.position, dir.normalize()); ray.far = far - 0.05;
      const hit = ray.intersectObjects(tops, false)
        .find(h => h.object.userData.floor !== q.floor && (!h.uv || alphaAt(h.uv.x, h.uv.y) > 128));
      q.el.classList.toggle('occ', !!hit);
    });
    /* 층 태그 : 층 윗면 네 모서리 중 화면에서 가장 오른쪽 */
    tags.forEach(t => {
      const cs = [[-W / 2, -D / 2], [W / 2, -D / 2], [W / 2, D / 2], [-W / 2, D / 2]]
        .map(([x, z]) => pr(new THREE.Vector3(x, t.y, z)));
      const r = cs.reduce((m, c) => (c[0] > m[0] ? c : m));
      t.el.style.left = Math.min(r[0], w - 6) + 'px'; t.el.style.top = r[1] + 'px';
    });
    return true;
  }

  function frame() {
    raf = 0; stat.frames++;
    if (!host || host.hidden || !place()) return;
    if (typeof hideOverlappedLabels === 'function') hideOverlappedLabels(host);
    if (typeof syncMapToCursor === 'function') syncMapToCursor();
  }
  /* 렌더 예약 — 보통은 다음 프레임에 그리지만, 프레임이 멈춘 환경(일부 웹뷰·헤드리스)에서도
     드래그가 반영되도록 짧은 타이머로 한 번 더 보장한다. 먼저 온 쪽만 그린다. */
  let rafT = 0;
  function request() {
    if (raf) return;
    raf = requestAnimationFrame(frame);
    clearTimeout(rafT);
    rafT = setTimeout(() => { if (raf) { cancelAnimationFrame(raf); frame(); } }, 48);
  }

  function showTip(e) {
    if (variant() !== '1' || !tip) return;
    tip.hidden = false; tip.classList.remove('out'); moveTip(e);
    clearTimeout(tipT);
    tipT = setTimeout(() => { tip.classList.add('out'); setTimeout(() => { tip.hidden = true; }, 220); }, 3000);
  }
  function moveTip(e) {
    if (!tip || tip.hidden || !host) return;
    const b = host.getBoundingClientRect();
    tip.style.left = Math.min(e.clientX - b.left + 14, b.width - 176) + 'px';
    tip.style.top = (e.clientY - b.top + 18) + 'px';
  }
  function hideTip() { clearTimeout(tipT); if (tip) tip.hidden = true; }

  function bindControls() {
    host.addEventListener('pointerdown', e => {
      stat.down++;
      if (e.button !== 0 || !rotateOn) return;
      if (e.target.closest('.map-wp, .m3g-3d, .m3-sp')) return;
      drag = { x: e.clientX, y: e.clientY, az: view.az, el: view.el };
      try { host.setPointerCapture(e.pointerId); } catch (_) {}
      host.classList.add('grabbing'); hideTip();
    });
    host.addEventListener('pointermove', e => {
      stat.move++;
      moveTip(e);
      if (!drag) return;
      view.az = drag.az - (e.clientX - drag.x) * 0.008;
      view.el = Math.max(0.12, Math.min(1.48, drag.el + (e.clientY - drag.y) * 0.006));
      request();
    });
    const end = () => { stat.up++; if (!drag) return; drag = null; host.classList.remove('grabbing'); };
    host.addEventListener('pointerup', end);
    host.addEventListener('pointercancel', end);
    host.addEventListener('wheel', e => { e.preventDefault(); zoom(e.deltaY > 0 ? 1 : -1); }, { passive: false });
    host.addEventListener('dblclick', e => { if (!e.target.closest('.map-wp')) reset(); });
    host.addEventListener('mouseenter', showTip);
    host.addEventListener('mouseleave', hideTip);
  }

  let lastV = null;
  function applyVariant() {
    if (!host) return;
    const v = variant();
    /* 안내 방식이 바뀌면 회전 가능 상태를 새로 정한다 —
       3(3D 버튼)은 버튼을 눌러야 회전된다(사양 : 클릭 시 grabbing) */
    if (v !== lastV) { rotateOn = v !== '3'; lastV = v; }
    host.dataset.hint = v;
    host.classList.toggle('can-rotate', rotateOn);
    if (hint) hint.hidden = v !== '2';
    if (btn3d) { btn3d.hidden = v !== '3'; btn3d.classList.toggle('on', rotateOn); }
    if (v !== '1') hideTip();
  }

  function zoom(d) {
    view.dist = Math.max(9, Math.min(44, view.dist * (d > 0 ? 1.12 : 1 / 1.12)));
    request();
  }
  function reset() { Object.assign(view, HOME); request(); }

  function show(h, paths) {
    if (!supported() || !h) return false;
    ensure(h);
    build(paths);
    applyVariant();
    request();
    return true;
  }
  function hide() { if (raf) { cancelAnimationFrame(raf); raf = 0; } hideTip(); }

  /* 점검용 — 시점·회전 가능 여부·이벤트 수신 횟수 */
  const state = () => ({ ...view, rotateOn, dragging: !!drag, ...stat, variant: variant() });
  return { supported, show, hide, zoom, reset, request, applyVariant, state };
})();
