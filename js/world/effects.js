// 맵 기믹: 불·얼음·전기·나무·빛 (담당: elements) — CONTRACT elements/effects.js
// fx[] 형태는 js/state.js 주석 그대로 (렌더러·조명이 읽음):
//   { type:'melt', tx, ty, t }          t = 녹기까지 남은 프레임 (≤90이면 깜빡임)
//   { type:'burn', tx, ty, t, crate }   t = 사라지기까지 남은 프레임 (70→0)
//   { type:'light', x, y, r, t }        t = 남은 프레임 (480→0)
//   { type:'zap', tx, ty, t }           발전기 스파크 연출 (30→0)
// trees[]: { tx, ty, k, t }  ty = 줄기 맨 아래 칸(흙 바로 위), k = 다음에 쌓을 높이
(function (G) {
'use strict';

// 상수 데이터는 미리 꺼내 둔다 (먼저 로드되는 파일)
const S = G.S;
const TS = G.config.TS;
const ROWS = G.config.ROWS;

const ICE_T = 600;        // 얼음이 녹기까지
const BURN_T = 70;        // 불타는 칸이 사라지기까지
const BURN_SPREAD = 40;   // 점화 후 이 프레임에 상하좌우로 번짐
// 빛 화살이 남긴 빛(480f, 반경 60)은 arrows.js가 fx에 넣는다
const LIGHT_R = 60;       // 빛 반경 (끝날 때 줄이는 기준)
const ZAP_T = 30;
const GATE_RANGE = 18;    // 발전기 ±18열 안의 방벽이 사라짐
const TREE_EVERY = 4;     // 나무가 한 칸 자라는 간격
const TREE_MAX = 6;       // k = 0..6

/** grid에 직접 쓴다 (범위 밖은 무시) */
function setCell(tx, ty, ch) {
  if (ty < 0 || ty >= ROWS || tx < 0 || tx >= S.W) return;
  const row = S.grid[ty];
  if (row) row[tx] = ch;
}

const cx = (tx) => tx * TS + TS / 2;
const cy = (ty) => ty * TS + TS / 2;

function findFx(type, tx, ty) {
  return S.fx.find((f) => f.type === type && f.tx === tx && f.ty === ty);
}
function removeFx(f) {
  const i = S.fx.indexOf(f);
  if (i >= 0) S.fx.splice(i, 1);
}

// ───────── 불 ─────────

/** 가시덤불(T)·상자(B)에 불을 붙여 불타는 칸(b)으로 바꾼다 */
function ignite(tx, ty) {
  const c = G.physics.cell(tx, ty);
  if (c !== 'T' && c !== 'B') return;
  setCell(tx, ty, 'b');
  S.fx.push({ type: 'burn', tx, ty, t: BURN_T, crate: c === 'B' });
  G.particles.puff(cx(tx), cy(ty), 8, '#ff7a2a', 1.2, -.04, 22);
  G.audio.sfx('fire');
}

/** 불이 상하좌우로 번진다: 덤불·상자는 점화, 얼음은 녹임 */
function spreadFire(tx, ty) {
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const c = G.physics.cell(tx + dx, ty + dy);
    if (c === 'T' || c === 'B') ignite(tx + dx, ty + dy);
    else if (c === 'i') meltAt(tx + dx, ty + dy);
  }
}

// ───────── 얼음 ─────────

/**
 * 물을 얼린다: (tx,ty)가 속한 물줄기의 그 열 가장 위 줄에서 좌우 ±2칸을 얼음(i)으로.
 * 이미 언 칸은 녹는 시간을 다시 채운다.
 */
function freezeWater(tx, ty) {
  const isWet = (x, y) => { const c = G.physics.cell(x, y); return c === 'w' || c === 'i'; };
  if (!isWet(tx, ty)) return;
  let top = ty;
  while (top > 0 && isWet(tx, top - 1)) top--;
  let any = false;
  for (let x = tx - 2; x <= tx + 2; x++) {
    const c = G.physics.cell(x, top);
    if (c === 'w') {
      setCell(x, top, 'i');
      const old = findFx('melt', x, top);
      if (old) old.t = ICE_T;
      else S.fx.push({ type: 'melt', tx: x, ty: top, t: ICE_T });
      G.particles.puff(cx(x), top * TS + 2, 3, '#cff4ff', .8, .02, 18);
      any = true;
    } else if (c === 'i') {
      const f = findFx('melt', x, top);
      if (f) f.t = ICE_T;
      else S.fx.push({ type: 'melt', tx: x, ty: top, t: ICE_T });
      any = true;
    }
  }
  if (any) G.audio.sfx('freeze');
}

/** 얼음(i)을 녹여 물(w)로 되돌린다 */
function meltAt(tx, ty) {
  const f = findFx('melt', tx, ty);
  if (f) removeFx(f);
  if (G.physics.cell(tx, ty) !== 'i') return;
  setCell(tx, ty, 'w');
  G.particles.puff(cx(tx), ty * TS + 3, 5, '#8fe3ff', .9, .08, 20);
}

// ───────── 전기 ─────────

/** 발전기(Z)를 켠다: z로 바꾸고 ±18열 안의 전기 방벽(G)을 모두 없앤다 */
function power(tx, ty) {
  if (G.physics.cell(tx, ty) !== 'Z') return;
  setCell(tx, ty, 'z');
  S.fx.push({ type: 'zap', tx, ty, t: ZAP_T });
  G.particles.puff(cx(tx), cy(ty), 10, '#ffe14d', 1.8, 0, 20);
  G.audio.sfx('zap');
  let opened = 0;
  for (let y = 0; y < ROWS; y++) {
    for (let x = tx - GATE_RANGE; x <= tx + GATE_RANGE; x++) {
      if (G.physics.cell(x, y) === 'G') {
        setCell(x, y, '.');
        G.particles.puff(cx(x), cy(y), 3, '#ffe14d', 1.2, 0, 16);
        opened++;
      }
    }
  }
  if (opened) {
    S.shake = Math.max(S.shake, 4);
    G.ui.toast('방벽이 열렸다', 2000, true);
  }
}

// ───────── 나무 ─────────

/** 흙(o)에 풀 화살: 바로 위 칸이 '.'이면 나무가 자라기 시작한다 */
function growTree(tx, ty) {
  if (G.physics.cell(tx, ty) !== 'o') return;
  const base = ty - 1;
  if (base < 0 || G.physics.cell(tx, base) !== '.') return;
  if (S.trees.some((t) => t.tx === tx && t.ty === base)) return;
  S.trees.push({ tx, ty: base, k: 0, t: 0 });
  G.audio.sfx('grow');
}

/** 나무 한 칸을 쌓는다. 더 자랄 수 없으면 false */
function growStep(tr) {
  const { tx, k } = tr;
  const y = tr.ty - k;
  if (k > TREE_MAX || y < 0 || G.physics.cell(tx, y) !== '.') return false;
  if (k === TREE_MAX) {
    setCell(tx, y, 'c');                // 수관 (장식)
  } else if (k % 2 === 0) {
    setCell(tx, y, 'y');                // 줄기 (통과)
    S.trunks.add(tx + ',' + y);
  } else {
    // 잎 발판 3칸 (일방통행). 가운데 아래에도 줄기를 그리도록 trunks에 저장
    for (let x = tx - 1; x <= tx + 1; x++) if (G.physics.cell(x, y) === '.') setCell(x, y, 'f');
    S.trunks.add(tx + ',' + y);
  }
  G.particles.puff(cx(tx), cy(y), 4, '#6fdc5a', .8, .02, 18);
  tr.k++;
  return tr.k <= TREE_MAX;
}

// ───────── 빛 ─────────

/** 등불(L)을 영구 점등한다 */
function lightLantern(tx, ty) {
  const ln = S.lanterns.find((l) => l.tx === tx && l.ty === ty);
  if (!ln || ln.lit) return;
  ln.lit = true;
  G.particles.puff(cx(tx), ty * TS + 4, 10, '#fff6c8', 1.3, -.02, 26);
  G.audio.sfx('light');
}

// ───────── 매 step ─────────

function updateEffects() {
  const fx = S.fx;
  // 처리 중에 다른 fx가 추가·제거될 수 있으므로 사본을 돈다
  for (const f of fx.slice()) {
    if (!f) continue;
    let done = false;
    switch (f.type) {
      case 'melt':
        // 불에 녹았거나 부서져 이미 얼음이 아니면 바로 지운다
        if (G.physics.cell(f.tx, f.ty) !== 'i') { done = true; break; }
        if (--f.t <= 0) {
          setCell(f.tx, f.ty, 'w');
          G.particles.puff(cx(f.tx), f.ty * TS + 3, 5, '#8fe3ff', .9, .08, 20);
          done = true;
        }
        break;
      case 'burn': {
        // 거대한 검 등으로 이미 부서진 칸이면 번짐·동전 없이 바로 지운다
        if (G.physics.cell(f.tx, f.ty) !== 'b') { done = true; break; }
        f.t--;
        if (BURN_T - f.t === BURN_SPREAD) spreadFire(f.tx, f.ty);
        if (S.frame % 3 === 0) {
          G.particles.addParticle({
            x: f.tx * TS + 2 + Math.random() * (TS - 4), y: f.ty * TS + 4 + Math.random() * 8,
            vx: (Math.random() - .5) * .4, vy: -.4 - Math.random() * .6,
            g: -.01, life: 18, max: 18, col: Math.random() < .5 ? '#ff7a2a' : '#ffd04d', size: 1,
          });
        }
        if (f.t <= 0) {
          setCell(f.tx, f.ty, '.');
          G.particles.puff(cx(f.tx), cy(f.ty), 6, '#5a5048', .9, -.03, 26);
          if (f.crate && Math.random() < .7) G.pickups.dropCoin(cx(f.tx), cy(f.ty));
          done = true;
        }
        break;
      }
      case 'light':
        f.t--;
        if (f.t < 60) f.r = LIGHT_R * Math.max(0, f.t) / 60;  // 끝날 때 서서히 줄어듦
        if (f.t <= 0) done = true;
        break;
      case 'zap':
        if (S.frame % 2 === 0) {
          G.particles.addParticle({
            x: cx(f.tx) + (Math.random() - .5) * 12, y: cy(f.ty) + (Math.random() - .5) * 12,
            vx: (Math.random() - .5) * 1.6, vy: (Math.random() - .5) * 1.6,
            g: 0, life: 8, max: 8, col: '#ffe14d', size: 1,
          });
        }
        if (--f.t <= 0) done = true;
        break;
      default:
        if (typeof f.t === 'number' && --f.t <= 0) done = true;
    }
    if (done) removeFx(f);
  }

  // 나무: 4f마다 한 칸씩
  const trees = S.trees;
  for (let i = trees.length - 1; i >= 0; i--) {
    const tr = trees[i];
    if (tr.t++ % TREE_EVERY !== 0) continue;
    if (!growStep(tr)) trees.splice(i, 1);
  }
}

// ───────── 공개 ─────────
G.effects = { ignite, freezeWater, meltAt, power, growTree, lightLantern, updateEffects };
})(window.G = window.G || {});
