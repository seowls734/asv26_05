// 키보드·마우스·터치 입력 (담당: core) — CONTRACT core/input.js
// 키는 e.code 기준(한글 입력 상태에서도 작동).
// K: 누르고 있는 동안 true.  P: 이번 step에 처음 눌림 (main이 step을 실제로 돌린 뒤에만 clearPressed).

(function (G) {
'use strict';

// 상수 데이터는 미리 꺼내 둔다 (먼저 로드되는 파일)
const S = G.S;
const VW = G.config.VW;
const VH = G.config.VH;

/** 누르고 있는 키: a, d, w, q, e, atk */
const K = { a: false, d: false, w: false, q: false, e: false, atk: false };

/**
 * 이번 step에 눌림.
 *  a d w q e atk : 누른 순간
 *  atkUp         : 공격(좌클릭·검 버튼)을 뗀 순간
 *  shoot         : 활 발사 각도(rad) 또는 false
 *  f             : 속성 순환,  num: 숫자 1~6 직접 선택(0이면 없음)
 *  r, m          : 다시 시작 / 소리 토글
 *  any           : 아무 키·클릭·탭 (오버레이 진행용)
 */
const P = {};

/** 활 조준 상태 (터치로 끌 때만 active) */
const aim = { active: false, dragged: false, ang: 0 };

let lastTouch = false;
/** 마지막 입력이 터치였는지 */
function isTouch() { return lastTouch; }

/** 이번 step 눌림 플래그를 모두 지운다 */
function clearPressed() {
  P.a = P.d = P.w = P.q = P.e = P.atk = false;
  P.atkUp = false;
  P.shoot = false;
  P.f = false;
  P.num = 0;
  P.r = P.m = false;
  P.any = false;
}
clearPressed();

// e.code → 게임 키
const KEYMAP = {
  KeyA: 'a', ArrowLeft: 'a',
  KeyD: 'd', ArrowRight: 'd',
  KeyW: 'w', ArrowUp: 'w', Space: 'w',
  KeyQ: 'q', ShiftLeft: 'q',
  KeyE: 'e',
};
// 브라우저 기본 동작(스크롤 등)을 막을 키
const BLOCK = new Set(['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);

/** 사용자 입력이 있을 때만 오디오를 켠다(첫 입력에서 생성, 이후엔 일시정지 해제만) */
function wake() {
  G.audio.audioInit();
}

function press(k) {
  if (!K[k]) P[k] = true;
  K[k] = true;
}
function release(k) {
  if (k === 'atk' && K.atk) P.atkUp = true;
  K[k] = false;
}

/** 플레이어 중심에서 본 정면 각도 */
function faceAng() {
  return S.player && S.player.face < 0 ? Math.PI : 0;
}

/** 화면 좌표(client) → 플레이어 중심 기준 각도 */
function mouseAng(cx, cy) {
  const cv = document.getElementById('game');
  const p = S.player;
  if (!cv || !p) return faceAng();
  const r = cv.getBoundingClientRect();
  if (!r.width || !r.height) return faceAng();
  const wx = (cx - r.left) / r.width * VW + S.cam;
  const wy = (cy - r.top) / r.height * VH;
  return Math.atan2(wy - (p.y + p.h / 2), wx - (p.x + p.w / 2));
}

function releaseAll() {
  for (const k in K) release(k);
  aim.active = false;
  aim.dragged = false;
}

let inited = false;
function initInput() {
  if (inited) return;
  inited = true;

  // ── 키보드 ──
  addEventListener('keydown', (e) => {
    lastTouch = false;
    wake();
    if (BLOCK.has(e.code)) e.preventDefault();
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = KEYMAP[e.code];
    if (k) { if (!e.repeat) press(k); else K[k] = true; }
    if (e.repeat) return;
    P.any = true;
    if (e.code === 'KeyF') P.f = true;
    else if (e.code === 'KeyR') P.r = true;
    else if (e.code === 'KeyM') P.m = true;
    else {
      const m = /^(?:Digit|Numpad)([1-6])$/.exec(e.code);
      if (m) P.num = +m[1];
    }
  });
  addEventListener('keyup', (e) => {
    const k = KEYMAP[e.code];
    if (k) {
      // 같은 게임 키에 묶인 다른 키가 아직 눌려 있을 수 있지만 단순하게 뗌 처리
      release(k);
    }
  });
  addEventListener('blur', releaseAll);
  document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });

  // ── 마우스 ──
  addEventListener('contextmenu', (e) => e.preventDefault());
  addEventListener('pointerdown', (e) => {
    // 모든 포인터: 오디오 깨우기 + 오버레이 진행
    wake();
    P.any = true;
    if (e.target && e.target.closest && e.target.closest('#touch')) return; // 버튼 쪽에서 처리
    if (e.pointerType !== 'mouse') { lastTouch = true; return; }
    lastTouch = false;
    // 게임 화면(캔버스) 위에서만 공격·활
    if (!e.target || e.target.id !== 'game') return;
    e.preventDefault();
    if (e.button === 0) press('atk');
    else if (e.button === 2) P.shoot = mouseAng(e.clientX, e.clientY);
  });
  addEventListener('pointerup', (e) => {
    if (e.pointerType === 'mouse' && e.button === 0) release('atk');
  });

  // ── 터치 버튼 ──
  initTouch();
}

const BTNKEY = { left: 'a', right: 'd', jump: 'w', dash: 'q', e: 'e', atk: 'atk' };
const DRAG_MIN = 14;

function initTouch() {
  const root = document.getElementById('touch');
  if (!root) return;
  root.addEventListener('contextmenu', (e) => e.preventDefault());
  root.querySelectorAll('button[data-btn]').forEach((b) => {
    const name = b.dataset.btn;
    let pid = null;       // 이 버튼을 누른 포인터
    let sx = 0, sy = 0;   // 활: 누른 위치

    const down = (e) => {
      e.preventDefault();
      lastTouch = true;
      wake();
      P.any = true;
      if (pid !== null) return;
      pid = e.pointerId;
      try { b.setPointerCapture(e.pointerId); } catch (_) { /* 무시 */ }
      b.classList.add('on');
      if (name === 'elem') P.f = true;
      else if (name === 'bow') {
        sx = e.clientX; sy = e.clientY;
        aim.active = true;
        aim.dragged = false;
        aim.ang = faceAng();
      } else if (BTNKEY[name]) press(BTNKEY[name]);
    };
    const move = (e) => {
      if (name !== 'bow' || e.pointerId !== pid) return;
      e.preventDefault();
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.hypot(dx, dy) >= DRAG_MIN) {
        aim.dragged = true;
        aim.ang = Math.atan2(dy, dx);
      }
    };
    const up = (e) => {
      if (e.pointerId !== pid) return;
      e.preventDefault();
      pid = null;
      b.classList.remove('on');
      if (name === 'bow') {
        // 취소(pointercancel)면 쏘지 않는다. 끌지 않고 떼면 정면.
        if (e.type === 'pointerup') P.shoot = aim.dragged ? aim.ang : faceAng();
        aim.active = false;
        aim.dragged = false;
      } else if (BTNKEY[name]) release(BTNKEY[name]);
    };
    b.addEventListener('pointerdown', down);
    b.addEventListener('pointermove', move);
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
    b.addEventListener('lostpointercapture', (e) => { if (e.pointerId === pid) up({ ...e, type: 'pointercancel', pointerId: e.pointerId, preventDefault() {} }); });
  });
}

// ───────── 공개 ─────────
G.input = { K, P, aim, isTouch, clearPressed, initInput };
})(window.G = window.G || {});
