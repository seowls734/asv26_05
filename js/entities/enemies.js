// 적: 슬라임·박쥐 (담당: elements) — CONTRACT elements/enemies.js
// 필드 형태는 js/state.js 주석 그대로:
//   { type, x, y, w, h, vx, vy, hp, dir, t, frozen, burn, stun, root, flash, dead }
// 내부용 필드: kb(넉백 가로 속도, 점점 줄어듦), oy(박쥐가 떠다니는 기준 높이)
(function (G) {
'use strict';

// 상수 데이터는 미리 꺼내 둔다 (먼저 로드되는 파일)
const S = G.S;
const TS = G.config.TS;
const ROWS = G.config.ROWS;
const PHYS = G.config.PHYS;

const SLIME = { w: 12, h: 8, hp: 3, speed: .45 };
const BAT = { w: 10, h: 6, hp: 2, chase: 120, cvx: .55, cvy: .28, yMin: 18, yMax: 150 };

/** 지속 피해(화상·전기) 간격 */
const DOT_EVERY = 60;

/**
 * 적 하나를 만들어 반환한다 (S.enemies에 넣는 일은 level.js가 한다).
 * @param {'slime'|'bat'} type
 * @param {number} x 타일 왼쪽 위 픽셀 x (tx*16)
 * @param {number} y 타일 왼쪽 위 픽셀 y (ty*16)
 */
function mkEnemy(type, x, y) {
  const d = type === 'bat' ? BAT : SLIME;
  const e = {
    type, w: d.w, h: d.h, x: 0, y: 0, vx: 0, vy: 0, hp: d.hp, dir: -1, t: 0,
    frozen: 0, burn: 0, stun: 0, root: 0, flash: 0, dead: false,
    kb: 0, oy: 0,
  };
  e.x = x + (TS - e.w) / 2;
  // 슬라임은 칸 바닥에 붙이고, 박쥐는 칸 중앙
  e.y = type === 'bat' ? y + (TS - e.h) / 2 : y + TS - e.h;
  e.oy = e.y;
  e.t = Math.floor(Math.random() * 120); // 박쥐끼리 사인파가 겹치지 않게
  return e;
}

/** 적 몸 색 (처치 파티클용) */
function bodyCol(e) { return e.type === 'bat' ? '#6b4a8a' : '#5fcf6a'; }

/** 적을 죽인다. coin=false면 동전을 떨어뜨리지 않는다(물·가시 사망). */
function kill(e, coin = true) {
  if (e.dead) return;
  e.dead = true;
  e.hp = 0;
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  G.particles.puff(cx, cy, 12, bodyCol(e), 1.6);
  G.audio.sfx('kill');
  if (coin && Math.random() < .6) G.pickups.dropCoin(cx, cy);
}

/**
 * 적에게 피해를 준다.
 * @param {object} e 적
 * @param {number} n 대미지
 * @param {number} kx 부호 있는 가로 넉백 속도 (0이면 넉백 없음)
 * @param {boolean} dot true면 화상·전기 지속 피해 (넉백·효과음 없음)
 * @returns {boolean} 이번 피해로 죽었으면 true
 */
function dmgEnemy(e, n, kx = 0, dot = false) {
  if (!e || e.dead) return false;
  e.hp -= n;
  e.flash = dot ? 5 : 8;
  if (!dot) {
    // 얼어 있거나 속박되면 밀리지 않는다
    if (kx && !e.frozen && !e.root) {
      e.kb = kx;
      if (e.type === 'slime') e.vy = Math.min(e.vy, -1.2);
      if (kx !== 0) e.dir = kx > 0 ? -1 : 1; // 맞은 쪽을 바라봄
    }
    G.audio.sfx('hit');
  }
  if (e.hp <= 0) { kill(e); return true; }
  return false;
}

/**
 * 검으로 친다. 얼어 있으면 대미지 +1, 얼음이 깨진다.
 * hitSet 검사는 player.js가 한다.
 * @returns {boolean} 이번 타격으로 죽었으면 true
 */
function meleeEnemy(e, n, kx = 0) {
  if (!e || e.dead) return false;
  if (e.frozen > 0) {
    n += 1;
    e.frozen = 0;
    G.particles.puff(e.x + e.w / 2, e.y + e.h / 2, 10, '#8fe3ff', 1.8, .1, 20);
    G.audio.sfx('freeze');
  }
  return dmgEnemy(e, n, kx, false);
}

/** 상태이상 타이머를 줄이고 지속 피해를 준다. 죽었으면 true */
function tickStatus(e) {
  if (e.flash > 0) e.flash--;
  if (e.frozen > 0) e.frozen--;
  if (e.root > 0) e.root--;
  if (e.burn > 0) {
    e.burn--;
    if (e.burn % DOT_EVERY === 0 && dmgEnemy(e, 1, 0, true)) return true;
  }
  if (e.stun > 0) {
    e.stun--;
    if (e.stun % DOT_EVERY === 0 && dmgEnemy(e, 1, 0, true)) return true;
  }
  return false;
}

function updateSlime(e) {
  const held = e.frozen > 0 || e.stun > 0 || e.root > 0;
  // 중력은 항상 받는다
  e.vy = Math.min(e.vy + PHYS.gravity, PHYS.maxFall);
  e.vx = held ? 0 : e.dir * SLIME.speed;
  const kb = e.frozen > 0 ? 0 : e.kb;
  const r = G.physics.moveBody(e, e.vx + kb, e.vy) || {};
  if (r.ground || r.hitY) e.vy = 0;
  e.kb *= .82;
  if (Math.abs(e.kb) < .05) e.kb = 0;

  if (!held && !e.kb) {
    if (r.hitX) {
      e.dir = -e.dir;
    } else if (r.ground) {
      // 낭떠러지 앞에서 돌아선다 (물·가시도 바닥이 아니므로 돌아섬)
      const fx = e.dir > 0 ? e.x + e.w + 1 : e.x - 1;
      const tx = Math.floor(fx / TS), ty = Math.floor((e.y + e.h + 1) / TS);
      if (!G.physics.solid(tx, ty) && !G.physics.oneway(tx, ty)) e.dir = -e.dir;
    }
  }

  // 물·가시에 빠지면 죽는다
  const c = G.physics.cell(Math.floor((e.x + e.w / 2) / TS), Math.floor((e.y + e.h - 1) / TS));
  if (c === 'w' || c === '^') {
    if (c === 'w') { G.particles.puff(e.x + e.w / 2, e.y + e.h, 8, '#7fb8ff', 1.4); G.audio.sfx('splash'); }
    kill(e, false);
    return;
  }
  if (e.y > ROWS * TS + TS) kill(e, false);
}

function updateBat(e) {
  const held = e.frozen > 0 || e.stun > 0 || e.root > 0;
  const p = S.player;
  if (held) {
    e.vx = 0; e.vy = 0;
  } else {
    let chasing = false;
    if (p && p.hp > 0) {
      const dx = (p.x + p.w / 2) - (e.x + e.w / 2);
      const dy = (p.y + p.h / 2) - (e.y + e.h / 2);
      if (dx * dx + dy * dy < BAT.chase * BAT.chase) {
        chasing = true;
        e.vx = Math.sign(dx) * BAT.cvx;
        e.vy = Math.abs(dy) > 2 ? Math.sign(dy) * BAT.cvy : 0;
        if (dx) e.dir = dx > 0 ? 1 : -1;
      }
    }
    if (!chasing) {
      // 사인파로 떠다니며 기준 높이로 천천히 돌아간다
      e.vx = e.dir * .3;
      const target = e.oy + Math.sin(e.t * .05) * 10;
      e.vy = Math.max(-.6, Math.min(.6, (target - e.y) * .08));
    }
  }
  const kb = e.frozen > 0 ? 0 : e.kb;
  const r = G.physics.moveBody(e, e.vx + kb, e.vy) || {};
  e.kb *= .85;
  if (Math.abs(e.kb) < .05) e.kb = 0;
  if (r.hitX && !held) e.dir = -e.dir;
  if (e.y < BAT.yMin) e.y = BAT.yMin;
  if (e.y > BAT.yMax) e.y = BAT.yMax;
}

/** 매 step: 상태이상 → 이동 → 플레이어 접촉 피해 → 죽은 적 제거 */
function updateEnemies() {
  const list = S.enemies;
  const p = S.player;
  for (const e of list) {
    if (e.dead) continue;
    e.t++;
    if (tickStatus(e)) continue;
    if (e.type === 'bat') updateBat(e); else updateSlime(e);
    if (e.dead) continue;
    // 접촉 피해 (빙결·스턴 중에는 없음)
    if (p && p.hp > 0 && !e.frozen && !e.stun && G.physics.overlap(e, p)) {
      G.player.hurtPlayer(e.x + e.w / 2);
    }
  }
  // 배열 참조는 유지한 채 죽은 적만 뺀다
  for (let i = list.length - 1; i >= 0; i--) if (list[i].dead) list.splice(i, 1);
}

// ───────── 공개 ─────────
G.enemies = { mkEnemy, dmgEnemy, meleeEnemy, updateEnemies };
})(window.G = window.G || {});
