// 진입점: 고정 60fps 루프와 step 순서 (담당: core) — CONTRACT core/main.js
// step 순서: updateCart → updatePlayer → updateArrows → updateEnemies → updatePickups → updateEffects → updateParticles → 카메라
// 디버그 훅: window.__game = {S, loadLevel}, URL ?level=2 로 바로 시작
(function (G) {
'use strict';

// 상수 데이터는 미리 꺼내 둔다 (먼저 로드되는 파일)
const S = G.S;
const TS = G.config.TS;
const VW = G.config.VW;
const LEVELS = G.LEVELS;
const ELEM = G.ELEM;

const DT = 1000 / 60;      // 고정 타임스텝(ms)
const FADE_SPEED = 1 / 30; // 페이드 0→1에 0.5초
const INPUT_DELAY = 20;    // 오버레이가 뜬 직후 이 프레임 동안은 진행 입력 무시(연타 방지)
const CAM_LERP = 0.15;

let modeT = 0;             // 현재 mode에 머문 step 수
let lastMode = null;

// ───────── 오버레이 문구 ─────────
const HINT_GO = () => (G.input.isTouch() ? '화면을 탭해서' : '클릭하거나 아무 키나 눌러서');

function enterMode(m) {
  lastMode = m;
  modeT = 0;
  if (m === 'title') {
    G.ui.showOverlay('폐광의 기사',
      '엘프 기사가 여섯 속성의 화살로 버려진 광산을 지나갑니다.',
      `${HINT_GO()} 시작`);
  } else if (m === 'over') {
    G.audio.sfx('hurt');
    G.ui.showOverlay('쓰러졌다…',
      '체력이 모두 떨어졌어요. 이 스테이지를 처음부터 다시 시작합니다.',
      `${HINT_GO()} 다시 시작`);
  } else if (m === 'win') {
    const c = S.player ? S.player.coins : 0;
    G.audio.sfx('pick');
    G.ui.showOverlay('클리어!',
      `폐광을 빠져나왔어요. 모은 동전 ${c}개.`,
      `${HINT_GO()} 처음부터 다시`);
  } else if (m === 'play') {
    G.ui.hideOverlay();
  }
  // 'trans'는 오버레이 없이 페이드만
}

// ───────── 키 처리 (속성·R·M) ─────────
function selectElem(i) {
  const n = ELEM.length || 6;
  i = ((i % n) + n) % n;
  if (i === S.elem) return;
  S.elem = i;
  G.ui.setBadge(i);
  G.audio.sfx('swap');
}

function handleMute() {
  if (!G.input.P.m) return;
  const muted = G.audio.toggleMute();
  G.ui.toast(muted ? '소리 꺼짐' : '소리 켜짐', 1200, true);
}

// ───────── 힌트 ─────────
function checkHints() {
  const p = S.player, lv = S.lvl;
  if (!p || !lv || !lv.hints) return;
  const col = Math.floor((p.x + p.w / 2) / TS);
  for (const [c, key] of lv.hints) {
    if (col >= c && !S.hintsDone.has(key) && G.HINT[key]) {
      S.hintsDone.add(key);
      G.ui.toast(G.HINT[key](G.HINT.ctrlNames(G.input.isTouch())), 3400);
    }
  }
}

// ───────── 카메라 ─────────
function updateCamera(snap = false) {
  const p = S.player;
  if (!p) return;
  const maxCam = Math.max(0, S.W * TS - VW);
  const target = Math.max(0, Math.min(maxCam, p.x + p.w / 2 - VW / 2));
  S.cam = snap ? target : S.cam + (target - S.cam) * CAM_LERP;
  if (Math.abs(target - S.cam) < 0.05) S.cam = target;
  S.cam = Math.max(0, Math.min(maxCam, S.cam));
}

function decayShake() {
  if (S.shake > 0) {
    S.shake *= 0.85;
    if (S.shake < 0.3) S.shake = 0;
  }
}

// ───────── step (1/60초) ─────────
/** @returns {boolean} step이 실제로 돌았는지 (false면 P 플래그를 지우지 않는다) */
function step() {
  if (S.mode !== lastMode) enterMode(S.mode);
  modeT++;

  if (S.mode === 'play') {
    // 히트스톱: 게임을 멈추고 입력은 다음 step으로 넘긴다
    if (S.freeze > 0) {
      S.freeze--;
      decayShake();
      return false;
    }
    handleMute();
    if (G.input.P.r) {
      G.level.restartLevel();
      updateCamera(true);
      return true;
    }
    if (G.input.P.num) selectElem(G.input.P.num - 1);
    else if (G.input.P.f) selectElem(S.elem + 1);

    S.frame++;
    G.cart.updateCart();
    G.player.updatePlayer();
    G.arrows.updateArrows();
    G.enemies.updateEnemies();
    G.pickups.updatePickups();
    G.effects.updateEffects();
    G.particles.updateParticles();
    updateCamera();
    decayShake();
    if (S.fade > 0) S.fade = Math.max(0, S.fade - FADE_SPEED); // 새 스테이지 페이드 인
    if (S.mode === 'play') checkHints();
    return true;
  }

  if (S.mode === 'trans') {
    // 페이드 아웃 → 다음 스테이지(페이드 인은 play에서) 또는 win
    handleMute();
    G.particles.updateParticles();
    decayShake();
    S.fade = Math.min(1, S.fade + FADE_SPEED);
    if (S.fade >= 1) {
      const next = S.lvlIndex + 1;
      if (next < LEVELS.length) {
        G.level.loadLevel(next);
        updateCamera(true);
        S.mode = 'play';
      } else {
        S.fade = 0;
        S.mode = 'win';
      }
    }
    return true;
  }

  // title / over / win: 오버레이를 띄워 두고 입력을 받으면 진행
  handleMute();
  if (S.fade > 0) S.fade = Math.max(0, S.fade - FADE_SPEED);
  if (G.input.P.any && !G.input.P.m && modeT > INPUT_DELAY) {
    if (S.mode === 'over') G.level.restartLevel(true);
    else G.level.startGame();
    updateCamera(true);
  }
  return true;
}

// ───────── 루프 ─────────
let last = 0, acc = 0;
let lastErr = '';
/** 루프 안 에러: 콘솔에 남기고, 오버레이에 빨간 글씨로 보여준다 (같은 에러는 한 번만) */
function reportError(err) {
  console.error(err);
  const msg = (err && err.message) || String(err);
  if (msg !== lastErr && G.fatal) { lastErr = msg; G.fatal(msg); }
}
function frame(now) {
  if (!last) last = now;
  acc += Math.min(250, now - last); // 탭이 멈췄다 돌아와도 한꺼번에 너무 많이 돌지 않게
  last = now;
  while (acc >= DT) {
    acc -= DT;
    let ran = false;
    try { ran = step(); }
    catch (err) { reportError(err); ran = true; }
    if (ran) G.input.clearPressed();
  }
  try { G.renderer.draw(); } catch (err) { reportError(err); }
  requestAnimationFrame(frame);
}

// ───────── 시작 ─────────
function boot() {
  G.input.initInput();
  window.__game = { S, loadLevel: G.level.loadLevel };

  const q = new URLSearchParams(location.search).get('level');
  const n = parseInt(q, 10);
  if (n >= 1 && n <= LEVELS.length) {
    // 검수용: 해당 스테이지로 바로 시작
    G.level.startGame(n - 1);
    lastMode = 'play';
  } else {
    // 시작 화면 뒤에도 1-1 월드가 보이도록 미리 불러 둔다
    G.level.loadLevel(0);
    S.mode = 'title';
  }
  updateCamera(true);
  if (S.mode !== lastMode) enterMode(S.mode);
  requestAnimationFrame(frame);
}

// ───────── 공개 ─────────
G.main = { boot };
})(window.G = window.G || {});

// 모든 스크립트를 불러온 뒤 게임 시작
G.main.boot();
