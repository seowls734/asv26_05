// 동전·열쇠·하트 (담당: player) — CONTRACT player/pickups.js
// coins[]: { x, y, vx, vy, t, dead, static? }  — 8×8 박스, x,y는 왼쪽 위
//   static:true = 맵에 놓인 동전(중력 없이 떠 있음). 떨어진 동전은 중력을 받고 바닥에 멈춘다.
// items[]: { type:'key'|'heart', x, y, t, dead } — 8×8 박스. 줍기는 player.js의 E 상호작용.
(function (G) {
'use strict';

// 상수 데이터는 미리 꺼내 둔다 (먼저 로드되는 파일)
const S = G.S;
const VH = G.config.VH;

const COIN_SIZE = 8;
/** 떨어진 동전을 바로 먹지 않도록 기다리는 프레임 */
const DROP_DELAY = 12;

/** 중심 (x,y)에서 동전 하나를 튀어나오게 한다 */
function dropCoin(x, y) {
  S.coins.push({
    x: x - COIN_SIZE / 2,
    y: y - COIN_SIZE / 2,
    vx: (Math.random() - 0.5) * 2,
    vy: -2.4 - Math.random(),
    t: 0,
    dead: false,
  });
}

/** 배열에서 dead인 항목을 제자리에서 지운다(참조 유지) */
function sweep(arr) {
  let j = 0;
  for (let i = 0; i < arr.length; i++) if (!arr[i].dead) arr[j++] = arr[i];
  arr.length = j;
}

/** 매 step: 떨어진 동전 물리, 동전 자동 획득, 아이템 애니메이션 */
function updatePickups() {
  const p = S.player;
  const pb = p ? { x: p.x, y: p.y, w: p.w, h: p.h } : null;

  for (const c of S.coins) {
    c.t++;
    // 떨어진 동전: 중력 + 타일 충돌. 바닥에 닿으면 멈춤.
    if (!c.static && (c.vx || c.vy)) {
      c.vy = Math.min(c.vy + 0.2, 5);
      const b = { x: c.x, y: c.y, w: COIN_SIZE, h: COIN_SIZE };
      const r = G.physics.moveBody(b, c.vx, c.vy);
      c.x = b.x; c.y = b.y;
      if (r.hitX) c.vx = -c.vx * 0.5;
      if (r.ground) { c.vx = 0; c.vy = 0; }
      else if (r.hitY) c.vy = 0;
      if (c.y > VH + 16) c.dead = true;
    }
    // 플레이어가 닿으면 획득
    if (pb && !c.dead && (c.static || c.t > DROP_DELAY) &&
        G.physics.overlap(pb, { x: c.x, y: c.y, w: COIN_SIZE, h: COIN_SIZE })) {
      c.dead = true;
      p.coins++;
      G.audio.sfx('coin');
      G.particles.puff(c.x + 4, c.y + 4, 6, '#ffd84a', 1, 0.03, 16);
    }
  }
  sweep(S.coins);

  for (const it of S.items) it.t++;
  sweep(S.items);
}

// ───────── 공개 ─────────
G.pickups = { dropCoin, updatePickups };
})(window.G = window.G || {});
