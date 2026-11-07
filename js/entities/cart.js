// 광차 (담당: player) — CONTRACT player/cart.js
// 레일 위에서만 움직인다. 크기 22×12, 가속 .1, 최고 속도 2.4. (SPEC 10)
// main의 step 순서상 updateCart가 updatePlayer보다 먼저 돈다.
// 탑승 중에는 여기서 플레이어 위치를 광차 위로 맞추고, 타기/내리기에 E를 쓰면 P.e=false로 소비한다.
(function (G) {
'use strict';

// 상수 데이터는 미리 꺼내 둔다 (먼저 로드되는 파일)
const S = G.S;
const TS = G.config.TS;
const PHYS = G.config.PHYS;

const CART_W = 22, CART_H = 12;
const ACC = 0.1, MAX_SPEED = 2.4, FRICTION = 0.05;
const DISMOUNT_LOCK = 20;   // 내린 직후 자동 탑승 금지 프레임
const SIT = 6;              // 플레이어 발이 광차 윗면 아래로 들어가는 깊이
const HOP = -3;             // E로 내릴 때 위로 살짝 튀어오름
const REACH = 6;            // E로 탈 수 있는 여유 거리(px)

/** 지난 step의 플레이어 발 높이 (자동 탑승 판정용, 탑승 중이면 null) */
let prevFeet = null;

/** 레일 {row,x0,x1}(타일 단위)로 광차 객체를 만들어 반환한다. 바닥이 레일 윗면(row*16)에 닿는다. */
function makeCart(rail) {
  prevFeet = null;
  if (!rail) return null;
  return {
    x: rail.x0 * TS,
    y: rail.row * TS - CART_H,
    w: CART_W, h: CART_H,
    vx: 0,
    min: rail.x0 * TS,
    max: (rail.x1 + 1) * TS - CART_W,
  };
}

/** 플레이어를 광차 안(가로 가운데)으로 붙인다 */
function seat(p, c) {
  p.x = c.x + (c.w - p.w) / 2;
  p.y = c.y - p.h + SIT;
  p.vx = c.vx;
  p.vy = 0;
}

function mount(p, c) {
  p.riding = true;
  p.dash = 0;
  p.onGround = true;
  seat(p, c);
  G.audio.sfx('pick');
}

function dismount(p, vy) {
  p.riding = false;
  p.dismountT = DISMOUNT_LOCK;
  p.vy = vy;
  p.onGround = false;
  p.coyote = 0;
  p.jumpBuf = 0;
}

/** 매 step */
function updateCart() {
  const c = S.cart, p = S.player;
  if (!c || !p) return;

  if (p.riding) {
    // 운전: A/D로 가속
    const dir = (G.input.K.d ? 1 : 0) - (G.input.K.a ? 1 : 0);
    if (dir) c.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, c.vx + dir * ACC));
    else c.vx = Math.abs(c.vx) <= FRICTION ? 0 : c.vx - Math.sign(c.vx) * FRICTION;
  } else {
    // 빈 광차는 서서히 멈춤
    c.vx = Math.abs(c.vx) <= FRICTION ? 0 : c.vx - Math.sign(c.vx) * FRICTION;
  }

  // 레일 범위 안에서만 이동
  c.x += c.vx;
  if (c.x < c.min) { c.x = c.min; c.vx = 0; }
  if (c.x > c.max) { c.x = c.max; c.vx = 0; }
  if (Math.abs(c.vx) > 1.5 && S.frame % 6 === 0) {
    G.particles.puff(c.vx > 0 ? c.x + 2 : c.x + c.w - 2, c.y + c.h, 1, '#ffd27a', 0.6, 0.05, 10);
  }

  if (p.riding) {
    prevFeet = null;
    if (G.input.P.w) {
      // W: 뛰어내림
      dismount(p, PHYS.jump);
      G.input.P.w = false;
      G.audio.sfx('jump');
    } else if (G.input.P.e) {
      // E: 내림 (위로 살짝)
      dismount(p, HOP);
      G.input.P.e = false;
    } else {
      seat(p, c);
    }
    return;
  }

  // 타지 않은 상태
  const near = G.physics.overlap(p, { x: c.x - REACH, y: c.y - REACH, w: c.w + REACH * 2, h: c.h + REACH * 2 });
  if (G.input.P.e && near) {
    mount(p, c);
    G.input.P.e = false;
    return;
  }
  // 위에서 광차 안으로 떨어지면 자동 재탑승 (내린 직후 20f 제외)
  // 지난 step의 발 높이가 광차 윗면 근처 이상이었고, 이번에 그 아래로 내려왔으면 "위에서 떨어짐"으로 본다.
  // (한 프레임에 바닥까지 떨어져 vy가 0이 된 경우도 잡기 위해 vy 대신 발 높이 변화를 본다)
  const feet = p.y + p.h;
  const cx = p.x + p.w / 2;
  if (p.dismountT <= 0 && p.dash <= 0 && prevFeet !== null &&
      prevFeet <= c.y + 2 && feet > prevFeet && feet >= c.y &&
      cx > c.x && cx < c.x + c.w) {
    mount(p, c);
    G.particles.puff(cx, c.y, 4, '#cdbb98', 0.6, 0.02, 10);
  }
  prevFeet = p.riding ? null : feet;
}

// ───────── 공개 ─────────
G.cart = { makeCart, updateCart };
})(window.G = window.G || {});
