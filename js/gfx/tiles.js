// 타일 그리기 (담당: gfx) — renderer.js 안에서만 사용.
// 범례는 docs/SPEC.md 8번. 모든 타일은 fillRect 도트로 그린다.

(function (G) {
'use strict';

// 상수 데이터는 미리 꺼내 둔다 (먼저 로드되는 파일)
const TS = G.config.TS;
const VW = G.config.VW;
const ROWS = G.config.ROWS;

/** bg별 기본 팔레트 (levels의 pal 필드가 있으면 덮어씀) */
const DEF_PAL = {
  forest: { ground: '#5a3b26', groundDark: '#3e2818', top: '#3f9a3a', topLight: '#7fd35a' },
  ice: { ground: '#3a4a66', groundDark: '#27334a', top: '#cfeeff', topLight: '#ffffff' },
  cave: { ground: '#3b2a4a', groundDark: '#271b33', top: '#6a4f86', topLight: '#9a7fbf' },
};

/** 스테이지 팔레트 합치기 */
function getPal(lvl) {
  const base = DEF_PAL[lvl && lvl.bg] || DEF_PAL.forest;
  return Object.assign({}, base, (lvl && lvl.pal) || {});
}

/** 좌표 기반 고정 난수 0~1 (프레임마다 바뀌지 않는 무늬용) */
function hash(x, y, s = 0) {
  let n = (x * 374761393 + y * 668265263 + s * 2246822519) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}

function at(S, tx, ty) {
  if (ty < 0 || ty >= ROWS) return '.';
  if (tx < 0 || tx >= S.W) return '#';
  const row = S.grid[ty];
  return row ? row[tx] : '.';
}

/**
 * 보이는 범위의 모든 타일 그리기
 * @param {CanvasRenderingContext2D} ctx 카메라 변환 없는 화면 좌표 ctx
 * @param {object} S 공유 상태
 * @param {number} cam 카메라 x(정수 px)
 * @param {number} t 애니메이션 프레임
 */
function drawTiles(ctx, S, cam, t) {
  if (!S.grid || !S.grid.length) return;
  const pal = getPal(S.lvl);
  // 녹는 얼음(깜빡임) 조회표
  const melt = new Map();
  for (const f of S.fx) if (f.type === 'melt') melt.set(f.tx + ',' + f.ty, f.t);
  const tx0 = Math.max(0, Math.floor(cam / TS) - 1);
  const tx1 = Math.min(S.W - 1, Math.floor((cam + VW) / TS) + 1);
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      const ch = at(S, tx, ty);
      const x = tx * TS - cam, y = ty * TS;
      // 잎 발판·수관 아래에도 줄기를 이어 그림
      if ((ch === 'f' || ch === '.') && S.trunks && S.trunks.has(tx + ',' + ty)) trunk(ctx, x, y);
      if (ch === '.') continue;
      drawTile(ctx, S, ch, tx, ty, x, y, t, pal, melt);
    }
  }
  if (S.rail) drawRail(ctx, S, cam);
}

function drawTile(ctx, S, ch, tx, ty, x, y, t, pal, melt) {
  switch (ch) {
    case '#': ground(ctx, S, tx, ty, x, y, pal); break;
    case 'o': soil(ctx, S, tx, ty, x, y); break;
    case '=': plank(ctx, x, y); break;
    case 'f': leaf(ctx, tx, ty, x, y); break;
    case 'y': trunk(ctx, x, y); break;
    case 'c': canopy(ctx, tx, ty, x, y); break;
    case 'B': crate(ctx, x, y); break;
    case 'R': rock(ctx, tx, ty, x, y); break;
    case 'T': thorn(ctx, tx, ty, x, y); break;
    case 'b': burning(ctx, tx, ty, x, y, t); break;
    case 'w': water(ctx, S, tx, ty, x, y, t); break;
    case 'i': ice(ctx, tx, ty, x, y, t, melt.get(tx + ',' + ty)); break;
    case '^': spikes(ctx, x, y); break;
    case 'Z': generator(ctx, x, y, t, false); break;
    case 'z': generator(ctx, x, y, t, true); break;
    case 'G': barrier(ctx, tx, ty, x, y, t); break;
    case 'L': lantern(ctx, S, tx, ty, x, y, t); break;
    case 'D': door(ctx, S, tx, ty, x, y); break;
    case 'd': openDoor(ctx, S, tx, ty, x, y); break;
    case 'X': exitDoor(ctx, S, tx, ty, x, y, t); break;
    default: break;
  }
}

const R = (ctx, col, x, y, w, h) => { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); };

// ── 땅: 위가 비면 풀 덮인 윗면 ──
function ground(ctx, S, tx, ty, x, y, pal) {
  R(ctx, pal.ground, x, y, TS, TS);
  // 흙 알갱이 무늬
  for (let i = 0; i < 5; i++) {
    const px = Math.floor(hash(tx, ty, i) * 15), py = Math.floor(hash(tx, ty, i + 9) * 15);
    R(ctx, pal.groundDark, x + px, y + py, 2, 1);
  }
  if (hash(tx, ty, 77) < .3) R(ctx, pal.groundDark, x + 4 + Math.floor(hash(tx, ty, 78) * 8), y + 8 + Math.floor(hash(tx, ty, 79) * 5), 3, 2);
  const up = at(S, tx, ty - 1);
  if (up !== '#' && up !== 'o' && ty > 0) {
    // 풀 윗면 + 늘어진 잎
    R(ctx, pal.top, x, y, TS, 4);
    R(ctx, pal.topLight, x, y, TS, 1);
    for (let i = 0; i < TS; i += 2) {
      const d = Math.floor(hash(tx * 16 + i, ty, 3) * 4);
      if (d) R(ctx, pal.top, x + i, y + 4, 1, d);
    }
    // 위로 솟은 풀잎
    for (let i = 0; i < 3; i++) {
      const gx = Math.floor(hash(tx, ty, 30 + i) * 15);
      R(ctx, pal.topLight, x + gx, y - 1, 1, 1);
    }
  }
  // 왼쪽·오른쪽이 비었으면 테두리 어둡게
  if (at(S, tx - 1, ty) === '.') R(ctx, pal.groundDark, x, y, 1, TS);
  if (at(S, tx + 1, ty) === '.') R(ctx, pal.groundDark, x + TS - 1, y, 1, TS);
}

// ── 갈아놓은 흙 ──
function soil(ctx, S, tx, ty, x, y) {
  R(ctx, '#6b4426', x, y, TS, TS);
  for (let r = 3; r < TS; r += 4) {
    R(ctx, '#4a2c16', x, y + r, TS, 1);
    R(ctx, '#8a5a34', x, y + r - 1, TS, 1);
  }
  if (at(S, tx, ty - 1) === '.') {
    // 작은 싹 표시 (풀 화살을 쏘라는 힌트)
    R(ctx, '#8a5a34', x, y, TS, 1);
    R(ctx, '#5ac04a', x + 4, y - 2, 1, 2); R(ctx, '#5ac04a', x + 3, y - 3, 1, 1);
    R(ctx, '#5ac04a', x + 11, y - 2, 1, 2); R(ctx, '#5ac04a', x + 12, y - 3, 1, 1);
  }
}

// ── 나무 발판 (일방통행) ──
function plank(ctx, x, y) {
  R(ctx, '#9a6a3a', x, y, TS, 4);
  R(ctx, '#c08a50', x, y, TS, 1);
  R(ctx, '#5a3a1a', x, y + 4, TS, 1);
  R(ctx, '#3a2410', x + 3, y + 1, 1, 1); R(ctx, '#3a2410', x + 12, y + 1, 1, 1);
  R(ctx, '#6a4422', x + 2, y + 5, 2, 3); R(ctx, '#6a4422', x + 12, y + 5, 2, 3);
}

// ── 잎 발판 ──
function leaf(ctx, tx, ty, x, y) {
  R(ctx, '#2f8a3a', x, y + 1, TS, 5);
  R(ctx, '#4fc24a', x, y, TS, 2);
  R(ctx, '#8fe36a', x + 2, y, 3, 1); R(ctx, '#8fe36a', x + 9, y, 4, 1);
  for (let i = 0; i < TS; i += 3) {
    if (hash(tx * 7 + i, ty, 5) < .6) R(ctx, '#2f8a3a', x + i, y + 6, 2, 1 + Math.floor(hash(tx, i, 6) * 2));
  }
}

// ── 줄기 ──
function trunk(ctx, x, y) {
  R(ctx, '#6a4224', x + 5, y, 6, TS);
  R(ctx, '#8a5a34', x + 6, y, 1, TS);
  R(ctx, '#44281a', x + 10, y, 1, TS);
  R(ctx, '#44281a', x + 7, y + 5, 2, 1);
}

// ── 수관 ──
function canopy(ctx, tx, ty, x, y) {
  ctx.fillStyle = '#2f8a3a';
  ctx.beginPath(); ctx.arc(x + 8, y + 9, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4fc24a';
  ctx.beginPath(); ctx.arc(x + 6, y + 7, 6, 0, Math.PI * 2); ctx.fill();
  R(ctx, '#8fe36a', x + 4, y + 3, 3, 1);
  R(ctx, '#8fe36a', x + 3, y + 4, 1, 2);
}

// ── 나무 상자 ──
function crate(ctx, x, y) {
  R(ctx, '#3a2410', x, y, TS, TS);
  R(ctx, '#a8743c', x + 1, y + 1, TS - 2, TS - 2);
  R(ctx, '#7a4e24', x + 1, y + 5, TS - 2, 1); R(ctx, '#7a4e24', x + 1, y + 10, TS - 2, 1);
  // 대각선 보강목
  for (let i = 0; i < 12; i++) R(ctx, '#7a4e24', x + 2 + i, y + 2 + i, 1, 1);
  R(ctx, '#d09a5a', x + 1, y + 1, TS - 2, 1);
  R(ctx, '#5a3a1a', x + 2, y + 2, 1, 1); R(ctx, '#5a3a1a', x + 13, y + 2, 1, 1);
  R(ctx, '#5a3a1a', x + 2, y + 13, 1, 1); R(ctx, '#5a3a1a', x + 13, y + 13, 1, 1);
}

// ── 금 간 바위 ──
function rock(ctx, tx, ty, x, y) {
  R(ctx, '#2a2a30', x, y, TS, TS);
  R(ctx, '#7a7a86', x + 1, y + 1, TS - 2, TS - 2);
  R(ctx, '#9a9aa8', x + 1, y + 1, TS - 2, 2);
  R(ctx, '#5a5a66', x + 1, y + TS - 3, TS - 2, 2);
  // 금
  const c = '#26262c';
  const k = hash(tx, ty) < .5 ? 1 : -1;
  let cx = x + 8;
  for (let i = 2; i < 14; i++) {
    R(ctx, c, cx, y + i, 1, 1);
    if (i % 3 === 0) cx += k;
    if (i === 7) { R(ctx, c, cx - 1, y + i, 1, 1); R(ctx, c, cx - 2, y + i + 1, 1, 1); R(ctx, c, cx - 3, y + i + 2, 1, 1); }
  }
  R(ctx, c, x + 3, y + 4, 2, 1); R(ctx, c, x + 4, y + 5, 1, 1);
}

// ── 가시덤불 ──
function thorn(ctx, tx, ty, x, y) {
  R(ctx, '#2a3a1c', x + 1, y + 1, TS - 2, TS - 2);
  for (let i = 0; i < 9; i++) {
    const px = Math.floor(hash(tx, ty, i) * 14), py = Math.floor(hash(tx, ty, i + 20) * 14);
    R(ctx, '#4a6a2a', x + px, y + py, 3, 2);
  }
  // 가시
  for (let i = 0; i < 7; i++) {
    const px = 1 + Math.floor(hash(tx, ty, i + 40) * 13), py = 1 + Math.floor(hash(tx, ty, i + 50) * 13);
    R(ctx, '#c8b090', x + px, y + py, 1, 1);
    R(ctx, '#7a2a3a', x + px + 1, y + py, 1, 1);
  }
  R(ctx, '#c8b090', x, y + 3, 1, 1); R(ctx, '#c8b090', x + 15, y + 9, 1, 1);
  R(ctx, '#c8b090', x + 6, y, 1, 1); R(ctx, '#c8b090', x + 11, y + 15, 1, 1);
}

// ── 불타는 덤불 ──
function burning(ctx, tx, ty, x, y, t) {
  R(ctx, '#2a1a12', x + 1, y + 2, TS - 2, TS - 2);
  for (let i = 0; i < 6; i++) {
    const px = Math.floor(hash(tx, ty, i) * 14), py = 6 + Math.floor(hash(tx, ty, i + 20) * 9);
    R(ctx, (t >> 2) + i & 1 ? '#ff7a2a' : '#c43a1a', x + px, y + py, 2, 1);
  }
  // 흔들리는 불꽃
  for (let i = 0; i < 4; i++) {
    const fx = x + 1 + i * 4;
    const h = 6 + ((t * 3 + i * 17 + tx * 5) % 9);
    R(ctx, '#ff4a1a', fx, y + TS - h, 3, h);
    R(ctx, '#ffa02a', fx + 1, y + TS - h + 2, 2, h - 3);
    R(ctx, '#ffe27a', fx + 1, y + TS - Math.floor(h / 2), 1, Math.floor(h / 2) - 1);
  }
}

// ── 물 ──
function water(ctx, S, tx, ty, x, y, t) {
  const surface = at(S, tx, ty - 1) !== 'w';
  ctx.fillStyle = 'rgba(40,110,200,.72)';
  ctx.fillRect(x, y + (surface ? 3 : 0), TS, TS - (surface ? 3 : 0));
  R(ctx, 'rgba(20,60,140,.5)', x, y + 12, TS, 4);
  if (surface) {
    for (let i = 0; i < TS; i++) {
      const wy = Math.round(Math.sin((tx * TS + i) * .4 + t * .08) * 1.2);
      R(ctx, '#9fd8ff', x + i, y + 3 + wy, 1, 1);
    }
  }
  // 반짝임
  const s = (t >> 4) + tx * 3 + ty;
  if (s % 5 === 0) R(ctx, 'rgba(200,240,255,.7)', x + 4 + (tx * 5 % 7), y + 8, 2, 1);
}

// ── 얼음 (녹기 90f 전부터 깜빡임) ──
function ice(ctx, tx, ty, x, y, t, meltT) {
  const blink = meltT !== undefined && meltT <= 90 && ((t >> 2) & 1);
  R(ctx, blink ? '#5aa8e0' : '#8fd8f8', x, y, TS, TS);
  R(ctx, blink ? '#8fd0f0' : '#d8f6ff', x, y, TS, 2);
  R(ctx, '#5ab0e0', x, y + TS - 2, TS, 2);
  R(ctx, '#ffffff', x + 3, y + 4, 4, 1); R(ctx, '#ffffff', x + 3, y + 5, 1, 2);
  R(ctx, '#b8ecff', x + 10, y + 9, 3, 1);
  R(ctx, '#6ac0ec', x + TS - 1, y, 1, TS);
  if (meltT !== undefined && meltT <= 90) {
    // 녹는 물방울
    R(ctx, '#5ab0e0', x + (tx * 5 % 12) + 2, y + TS - 1 + ((t >> 3) & 1), 1, 2);
  }
}

// ── 가시 (아래쪽 절반) ──
function spikes(ctx, x, y) {
  R(ctx, '#3a3a44', x, y + TS - 2, TS, 2);
  for (let i = 0; i < 4; i++) {
    const sx = x + i * 4;
    for (let r = 0; r < 7; r++) {
      const w = Math.max(1, Math.floor((r + 1) / 2));
      const off = 2 - Math.floor(w / 2);
      R(ctx, r < 2 ? '#e8e8f0' : '#a8a8b8', sx + off, y + 8 + r, w, 1);
    }
    R(ctx, '#6a6a7a', sx + 2, y + 10, 1, 4);
  }
}

// ── 발전기 ──
function generator(ctx, x, y, t, on) {
  R(ctx, '#1e1e26', x + 1, y + 2, 14, 14);
  R(ctx, '#5a6070', x + 2, y + 3, 12, 12);
  R(ctx, '#7a8090', x + 2, y + 3, 12, 1);
  R(ctx, '#3a3e4a', x + 2, y + 13, 12, 2);
  // 코일 창
  R(ctx, '#14141a', x + 4, y + 5, 8, 6);
  if (on) {
    const c = (t >> 2) & 1 ? '#ffe14d' : '#fff6a8';
    R(ctx, c, x + 5, y + 6, 6, 4);
    R(ctx, '#ffffff', x + 7, y + 7, 2, 2);
    R(ctx, '#7aff6a', x + 12, y + 4, 1, 1); // 켜짐 표시등
  } else {
    R(ctx, '#4a4a2a', x + 5, y + 7, 6, 1);
    R(ctx, '#4a4a2a', x + 5, y + 9, 6, 1);
    R(ctx, '#ff3a3a', x + 12, y + 4, 1, 1); // 꺼짐 표시등
  }
  // 위쪽 단자
  R(ctx, '#a8a8b8', x + 4, y, 2, 2); R(ctx, '#a8a8b8', x + 10, y, 2, 2);
  if (on && (t >> 3) % 3 === 0) { R(ctx, '#ffe14d', x + 6, y - 1, 1, 1); R(ctx, '#ffe14d', x + 8, y - 2, 1, 1); }
}

// ── 전기 방벽 (애니메이션) ──
function barrier(ctx, tx, ty, x, y, t) {
  R(ctx, 'rgba(255,225,77,.12)', x + 3, y, 10, TS);
  R(ctx, '#3a3a44', x + 2, y, 1, TS); R(ctx, '#3a3a44', x + 13, y, 1, TS);
  // 지그재그 번개 두 줄
  for (let k = 0; k < 2; k++) {
    let px = x + 8;
    for (let i = 0; i < TS; i++) {
      const n = hash(i + ty * 16, (t >> 1) + k * 31, tx);
      px += n < .33 ? -1 : n > .66 ? 1 : 0;
      px = Math.max(x + 4, Math.min(x + 11, px));
      R(ctx, k ? '#8fe3ff' : '#ffe14d', px, y + i, 1, 1);
    }
  }
  if ((t + ty * 5) % 12 < 2) R(ctx, '#ffffff', x + 7, y + ((t * 3 + ty * 7) % 14), 2, 2);
}

// ── 등불 (통과) ──
function lantern(ctx, S, tx, ty, x, y, t) {
  const L = S.lanterns && S.lanterns.find(l => l.tx === tx && l.ty === ty);
  const lit = L ? L.lit : false;
  // 기둥
  R(ctx, '#3a2a1e', x + 7, y + 7, 2, 9);
  R(ctx, '#2a1e14', x + 5, y + 15, 6, 1);
  // 등 몸체 (윗부분)
  R(ctx, '#2a2a30', x + 4, y + 1, 8, 1);
  R(ctx, '#2a2a30', x + 4, y + 7, 8, 1);
  R(ctx, '#2a2a30', x + 4, y + 2, 1, 5); R(ctx, '#2a2a30', x + 11, y + 2, 1, 5);
  if (lit) {
    const fl = (t >> 3) & 1;
    R(ctx, '#ffd86a', x + 5, y + 2, 6, 5);
    R(ctx, fl ? '#fff6c8' : '#ffffff', x + 7, y + 3, 2, 3);
  } else {
    R(ctx, '#3a3a2a', x + 5, y + 2, 6, 5);
    R(ctx, '#5a5a3a', x + 7, y + 4, 2, 2);
  }
  R(ctx, '#2a2a30', x + 7, y, 2, 1);
}

// ── 잠긴 철문 (2칸) ──
function door(ctx, S, tx, ty, x, y) {
  const top = at(S, tx, ty - 1) !== 'D';
  R(ctx, '#2a2c34', x + 1, y, 14, TS);
  R(ctx, '#5a5e6c', x + 2, y + (top ? 1 : 0), 12, TS - (top ? 1 : 0));
  // 세로 보강대와 리벳
  R(ctx, '#3e424e', x + 5, y, 1, TS); R(ctx, '#3e424e', x + 10, y, 1, TS);
  R(ctx, '#8a8e9c', x + 3, y + 3, 1, 1); R(ctx, '#8a8e9c', x + 12, y + 3, 1, 1);
  R(ctx, '#8a8e9c', x + 3, y + 12, 1, 1); R(ctx, '#8a8e9c', x + 12, y + 12, 1, 1);
  if (top) R(ctx, '#7a7e8c', x + 2, y + 1, 12, 1);
  else {
    // 자물쇠
    R(ctx, '#c8a030', x + 6, y + 3, 4, 5);
    R(ctx, '#8a6a18', x + 7, y + 1, 2, 2);
    R(ctx, '#1a1a1a', x + 7, y + 5, 2, 2);
  }
}

function openDoor(ctx, S, tx, ty, x, y) {
  const top = at(S, tx, ty - 1) !== 'd';
  R(ctx, '#120e14', x + 2, y, 12, TS);
  R(ctx, '#3e424e', x + 1, y, 1, TS);
  R(ctx, '#3e424e', x + 14, y, 1, TS);
  if (top) R(ctx, '#3e424e', x + 1, y, 14, 2);
  // 위로 열린 문짝 끝
  if (top) R(ctx, '#5a5e6c', x + 2, y + 2, 12, 2);
}

// ── 출구 (2칸, 빛나는 아치) ──
function exitDoor(ctx, S, tx, ty, x, y, t) {
  const top = at(S, tx, ty - 1) !== 'X';
  const pulse = .55 + Math.sin(t * .08) * .2;
  ctx.fillStyle = `rgba(255,236,160,${pulse})`;
  if (top) {
    ctx.beginPath();
    ctx.moveTo(x + 2, y + TS);
    ctx.lineTo(x + 2, y + 8);
    ctx.arc(x + 8, y + 8, 6, Math.PI, 0);
    ctx.lineTo(x + 14, y + TS);
    ctx.fill();
  } else ctx.fillRect(x + 2, y, 12, TS);
  // 돌 테두리
  const st = '#8a7a6a';
  if (top) {
    for (let a = 0; a <= 8; a++) {
      const ang = Math.PI + a / 8 * Math.PI;
      R(ctx, st, Math.round(x + 8 + Math.cos(ang) * 7) - 1, Math.round(y + 8 + Math.sin(ang) * 7) - 1, 2, 2);
    }
    R(ctx, st, x, y + 8, 2, 8); R(ctx, st, x + 14, y + 8, 2, 8);
    R(ctx, '#ffe27a', x + 7, y, 2, 2);
  } else {
    R(ctx, st, x, y, 2, TS); R(ctx, st, x + 14, y, 2, TS);
  }
  // 반짝이는 입자
  const k = (t + tx * 7 + ty * 13) % 40;
  R(ctx, '#ffffff', x + 4 + (k * 7 % 8), y + TS - (k % 16), 1, 1);
}

// ── 광차 레일 (rail.row 윗면을 따라) ──
function drawRail(ctx, S, cam) {
  const { row, x0, x1 } = S.rail;
  const y = row * TS;
  const a = x0 * TS - cam, b = (x1 + 1) * TS - cam;
  if (b < 0 || a > VW) return;
  // 침목
  for (let px = x0 * TS; px < (x1 + 1) * TS; px += 6) {
    R(ctx, '#5a3a1e', px - cam, y - 2, 4, 2);
  }
  // 빈 칸 위를 지나면 받침 기둥
  for (let tx = x0; tx <= x1; tx++) {
    if (at(S, tx, row) !== '#' && tx % 3 === 0) {
      R(ctx, '#4a3018', tx * TS - cam + 6, y, 3, (ROWS - row) * TS);
      R(ctx, '#2a1a0c', tx * TS - cam + 8, y, 1, (ROWS - row) * TS);
    }
  }
  R(ctx, '#9aa0ae', a, y - 3, b - a, 1);
  R(ctx, '#5a5e6a', a, y - 2, b - a, 1);
}

// ───────── 공개 ─────────
G.tiles = { getPal, drawTiles };
})(window.G = window.G || {});
