// 파티클 (담당: player) — CONTRACT player/particles.js
// particles[] 필드: { x, y, vx, vy, g, life, max, col, size }
//   life: 남은 프레임, max: 처음 수명(렌더러가 life/max로 투명도 계산), size: 1 또는 2(px)

(function (G) {
'use strict';

// 상수 데이터는 미리 꺼내 둔다 (먼저 로드되는 파일)
const S = G.S;

/** 파티클 최대 개수 (넘으면 오래된 것부터 버림) */
const MAX_PARTICLES = 500;

/**
 * 한 점에서 사방으로 파티클 n개를 뿌린다.
 * @param {number} x 중심 x(px)
 * @param {number} y 중심 y(px)
 * @param {number} n 개수
 * @param {string} col 색
 * @param {number} spd 최대 속도
 * @param {number} g 중력
 * @param {number} life 기본 수명(프레임)
 */
function puff(x, y, n, col, spd = 1.2, g = .05, life = 24) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = spd * (0.3 + Math.random() * 0.7);
    const l = Math.round(life * (0.6 + Math.random() * 0.6));
    addParticle({
      x, y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - spd * 0.3,
      g, life: l, max: l, col,
      size: Math.random() < 0.3 ? 2 : 1,
    });
  }
}

/** 파티클 하나 추가 (빠진 필드는 기본값으로 채움) */
function addParticle(p) {
  const life = p.life ?? 24;
  S.particles.push({
    x: p.x, y: p.y,
    vx: p.vx ?? 0, vy: p.vy ?? 0,
    g: p.g ?? 0,
    life, max: p.max ?? life,
    col: p.col ?? '#fff',
    size: p.size ?? 1,
  });
  if (S.particles.length > MAX_PARTICLES) S.particles.splice(0, S.particles.length - MAX_PARTICLES);
}

/** 매 step: 이동·중력·수명 감소, 수명이 다한 파티클 제거 */
function updateParticles() {
  const arr = S.particles;
  let j = 0;
  for (let i = 0; i < arr.length; i++) {
    const p = arr[i];
    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life > 0) arr[j++] = p;
  }
  arr.length = j;
}

// ───────── 공개 ─────────
G.particles = { puff, addParticle, updateParticles };
})(window.G = window.G || {});
