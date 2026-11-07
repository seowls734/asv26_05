// 타일 충돌과 이동 (담당: core) — CONTRACT core/physics.js
(function (G) {
'use strict';

// 상수 데이터는 미리 꺼내 둔다 (먼저 로드되는 파일)
const S = G.S;
const TS = G.config.TS;
const ROWS = G.config.ROWS;
const SOLID = G.tiledefs.SOLID;
const ONEWAY = G.tiledefs.ONEWAY;

const EPS = 0.001;

/**
 * 타일 문자를 돌려준다.
 * 가로 범위 밖은 '#'(벽), 세로 범위 밖(위·아래)은 '.'(빈 칸 — 낙사는 y로 판정).
 */
function cell(tx, ty) {
  if (tx < 0 || tx >= S.W) return '#';
  if (ty < 0 || ty >= ROWS) return '.';
  const row = S.grid[ty];
  return (row && row[tx]) || '.';
}

/** 사방에서 막히는 칸인지 */
function solid(tx, ty) {
  return SOLID.has(cell(tx, ty));
}

/** 위에서만 밟히는 일방통행 칸인지 */
function oneway(tx, ty) {
  return ONEWAY.has(cell(tx, ty));
}

/** 두 사각형 {x,y,w,h}이 겹치는지 */
function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** 가로 이동 한 조각 (|dx| ≤ 8) — 막히면 true */
function stepX(b, dx) {
  if (!dx) return false;
  const nx = b.x + dx;
  const ty0 = Math.floor(b.y / TS), ty1 = Math.floor((b.y + b.h - EPS) / TS);
  if (dx > 0) {
    const tx = Math.floor((nx + b.w - EPS) / TS);
    for (let ty = ty0; ty <= ty1; ty++) {
      if (solid(tx, ty)) { b.x = tx * TS - b.w; return true; }
    }
  } else {
    const tx = Math.floor(nx / TS);
    for (let ty = ty0; ty <= ty1; ty++) {
      if (solid(tx, ty)) { b.x = (tx + 1) * TS; return true; }
    }
  }
  b.x = nx;
  return false;
}

/** 세로 이동 한 조각 (|dy| ≤ 8) — 'ground' | 'ceil' | null */
function stepY(b, dy) {
  if (!dy) return null;
  const ny = b.y + dy;
  const tx0 = Math.floor(b.x / TS), tx1 = Math.floor((b.x + b.w - EPS) / TS);
  if (dy > 0) {
    const prevBottom = b.y + b.h;
    const ty = Math.floor((ny + b.h - EPS) / TS);
    const top = ty * TS;
    for (let tx = tx0; tx <= tx1; tx++) {
      // 일방통행 발판: 직전에 발이 발판 윗면보다 위(같음 포함)였을 때만 막는다
      if (solid(tx, ty) || (!b.dropThrough && oneway(tx, ty) && prevBottom <= top + EPS)) {
        b.y = top - b.h;
        return 'ground';
      }
    }
  } else {
    const ty = Math.floor(ny / TS);
    for (let tx = tx0; tx <= tx1; tx++) {
      if (solid(tx, ty)) { b.y = (ty + 1) * TS; return 'ceil'; }
    }
  }
  b.y = ny;
  return null;
}

/** 발 바로 아래(1px)가 밟을 수 있는 칸인지 */
function standing(b) {
  const by = b.y + b.h;
  if (Math.abs(by - Math.round(by / TS) * TS) > 0.01) return false;
  const ty = Math.round(by / TS);
  const tx0 = Math.floor(b.x / TS), tx1 = Math.floor((b.x + b.w - EPS) / TS);
  for (let tx = tx0; tx <= tx1; tx++) {
    if (solid(tx, ty) || (!b.dropThrough && oneway(tx, ty))) return true;
  }
  return false;
}

/**
 * 몸체 b {x,y,w,h}를 (dx,dy)만큼 움직인다. 가로 먼저, 그다음 세로.
 * 8px 조각으로 나눠 터널링을 막는다. b.vx/vy는 건드리지 않는다.
 * b.dropThrough가 true면 일방통행 발판을 무시한다.
 * @returns {{hitX:boolean, ground:boolean, hitY:boolean}}
 *   hitX: 벽에 막힘, ground: 아래로 막힘(또는 dy=0이고 서 있음), hitY: 위·아래로 막힘
 */
function moveBody(b, dx, dy) {
  let hitX = false, ground = false, hitY = false;
  let n = Math.max(1, Math.ceil(Math.abs(dx) / 8));
  for (let i = 0; i < n && !hitX; i++) hitX = stepX(b, dx / n);
  n = Math.max(1, Math.ceil(Math.abs(dy) / 8));
  for (let i = 0; i < n; i++) {
    const r = stepY(b, dy / n);
    if (r) { hitY = true; ground = r === 'ground'; break; }
  }
  if (!dy) ground = standing(b);
  return { hitX, ground, hitY };
}

// ───────── 공개 ─────────
G.physics = { cell, solid, oneway, overlap, moveBody };
})(window.G = window.G || {});
