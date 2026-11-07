// 플레이어(엘프) (담당: player) — CONTRACT player/player.js
// 이동(가속·코요테·점프 버퍼·가변 점프·대쉬), 검(베기·거대한 검), 활 발사 호출,
// 피격·위험 지형·lastSafe, E 상호작용(열쇠·하트·철문·출구).
// 광차 타기/내리기는 cart.js가 맡는다 (updateCart가 먼저 돌고, 탑승 중이면 위치를 맞춰 준다).

// ───── 수치 (SPEC 4·5) ─────
(function (G) {
'use strict';

// 상수 데이터는 미리 꺼내 둔다 (먼저 로드되는 파일)
const S = G.S;
const TS = G.config.TS;
const VH = G.config.VH;
const FULL_CHARGE = G.config.FULL_CHARGE;
const PHYS = G.config.PHYS;
const SAFE = G.tiledefs.SAFE;

const INV_HURT = 70;        // 피격 무적
const KNOCK_X = 2.6;        // 피격 넉백 가로
const KNOCK_Y = -3.4;       // 피격 넉백 세로
const SHAKE_HURT = 7;
const FREEZE_HURT = 4;      // 히트스톱
const CHARGE_SLOW = 15;     // 이 프레임을 넘게 차지하면 감속
const CHARGE_MUL = 0.55;
const KNOCK_LOCK = 12;      // 피격 직후 조작이 먹지 않는 프레임 (inv > 70-12)
const JUMP_CUT = -2.2;      // W를 떼면 상승 속도를 여기까지 줄임 (가변 점프)
const WATER_DEPTH = 6;      // 발이 이만큼 잠기면 피해

const SLASH_T = 14, SLASH_ON = [5, 12], SLASH_REACH = 22, SLASH_DMG = 1, SLASH_KNOCK = 2.6;
const GIANT_T = 22, GIANT_ON = [8, 18], GIANT_REACH = 52, GIANT_UP = 26, GIANT_DMG = 3, GIANT_KNOCK = 4;
const SHAKE_GIANT = 8;

/** 베기로 부서지는 칸 / 거대한 검으로 부서지는 칸 */
const BREAK_SLASH = new Set(['B']);
const BREAK_GIANT = new Set(['B', 'R', 'T', 'b']);

/** 새 플레이어를 만들어 S.player에 넣는다. x,y는 히트박스 왼쪽 위(px). */
function resetPlayer(x, y) {
  S.player = {
    x, y, w: 10, h: 14, vx: 0, vy: 0, face: 1, onGround: false,
    hp: 5, maxHp: 5, coins: 0, keys: 0,
    inv: 0,
    coyote: 0, jumpBuf: 0,
    dash: 0, dashCD: 0, airDash: false,
    slash: 0, slashCD: 0,
    giant: 0,
    charge: 0,
    shootCD: 0, hitSet: new Set(),
    riding: false, dismountT: 0,
    anim: 'idle', t: 0,
  };
  return S.player;
}

// ───── 피해 ─────

/** hp가 0 이하가 되면 게임 오버 */
function checkDeath(p) {
  if (p.hp <= 0) {
    p.hp = 0;
    S.mode = 'over';
  }
}

/** 적 등에게 맞음. srcX = 피해 근원의 가로 중심(px) — 반대쪽으로 넉백 */
function hurtPlayer(srcX) {
  const p = S.player;
  if (!p || p.inv > 0 || p.hp <= 0 || S.mode !== 'play') return;
  p.hp--;
  p.inv = INV_HURT;
  S.shake = Math.max(S.shake, SHAKE_HURT);
  S.freeze = FREEZE_HURT;
  G.audio.sfx('hurt');
  G.particles.puff(p.x + p.w / 2, p.y + p.h / 2, 8, '#ff5a5a', 1.4);
  // 광차 탑승 중에는 넉백 없이 피해만 (가시 구덩이로 떨어지지 않게)
  if (!p.riding) {
    const dir = (p.x + p.w / 2) < srcX ? -1 : 1;
    p.vx = dir * KNOCK_X;
    p.vy = KNOCK_Y;
    p.onGround = false;
    p.dash = 0;
  }
  checkDeath(p);
}

/** 가시·물·낙사: 체력 1 감소 후 lastSafe에서 부활 */
function hazardHit() {
  const p = S.player;
  if (!p || p.hp <= 0 || S.mode !== 'play') return;
  p.hp--;
  G.audio.sfx('hurt');
  S.shake = Math.max(S.shake, SHAKE_HURT);
  checkDeath(p);
  if (p.hp <= 0) return;
  p.x = S.lastSafe.x;
  p.y = S.lastSafe.y;
  p.vx = 0; p.vy = 0;
  p.dash = 0;
  p.riding = false;
  p.inv = INV_HURT;
  p.onGround = false;
  G.particles.puff(p.x + p.w / 2, p.y + p.h / 2, 10, '#fff6c8', 1);
}

// ───── 이동 ─────

function updateMove(p) {
  const locked = p.inv > INV_HURT - KNOCK_LOCK; // 피격 직후 넉백 동안 조작 잠금
  const dirIn = (G.input.K.d ? 1 : 0) - (G.input.K.a ? 1 : 0);

  if (p.onGround) { p.coyote = PHYS.coyote; p.airDash = false; }
  else if (p.coyote > 0) p.coyote--;

  if (G.input.P.w) p.jumpBuf = PHYS.jumpBuf;
  else if (p.jumpBuf > 0) p.jumpBuf--;

  // 대쉬 시작
  if (G.input.P.q && p.dashCD <= 0 && p.dash <= 0 && !locked && (p.onGround || !p.airDash)) {
    if (dirIn) p.face = dirIn;
    if (!p.onGround) p.airDash = true;
    p.dash = PHYS.dashT;
    p.dashCD = PHYS.dashCD;
    p.inv = Math.max(p.inv, PHYS.dashT);
    G.audio.sfx('dash');
    G.particles.puff(p.x + p.w / 2, p.y + p.h - 2, 5, '#cfd8e0', 0.8, 0, 14);
  }

  if (p.dash > 0) {
    p.dash--;
    p.vx = p.face * PHYS.dashSpeed;
    p.vy = 0;
    if (p.t % 2 === 0) {
      G.particles.addParticle({ x: p.x + p.w / 2, y: p.y + p.h / 2 + (Math.random() * 6 - 3), vx: -p.face * 0.3, vy: 0, g: 0, life: 10, max: 10, col: '#9fe0ff', size: 1 });
    }
  } else {
    // 가로 가속
    if (!locked) {
      if (dirIn) p.face = dirIn;
      let target = dirIn * PHYS.speed;
      if (p.charge > CHARGE_SLOW) target *= CHARGE_MUL;
      const acc = p.onGround ? PHYS.accGround : PHYS.accAir;
      if (p.vx < target) p.vx = Math.min(target, p.vx + acc);
      else if (p.vx > target) p.vx = Math.max(target, p.vx - acc);
    }
    // 점프 (버퍼 + 코요테)
    if (p.jumpBuf > 0 && p.coyote > 0 && !locked) {
      p.vy = PHYS.jump;
      p.jumpBuf = 0;
      p.coyote = 0;
      p.onGround = false;
      G.audio.sfx('jump');
      G.particles.puff(p.x + p.w / 2, p.y + p.h, 4, '#cdbb98', 0.6, 0.02, 12);
    }
    // 가변 점프: W를 떼면 낮게
    if (!G.input.K.w && p.vy < JUMP_CUT) p.vy = JUMP_CUT;
    p.vy = Math.min(p.vy + PHYS.gravity, PHYS.maxFall);
  }

  const wasAir = !p.onGround;
  const fallV = p.vy;
  const r = G.physics.moveBody(p, p.vx, p.vy);
  if (r.hitX) p.vx = 0;
  if (r.hitY) p.vy = 0;
  p.onGround = r.ground;
  if (p.onGround && wasAir && fallV > 3) G.particles.puff(p.x + p.w / 2, p.y + p.h, 4, '#cdbb98', 0.6, 0.02, 10);
}

// ───── 위험 지형 · lastSafe ─────

function updateHazards(p) {
  // 낙사
  if (p.y > VH) { hazardHit(); return; }

  const x0 = Math.floor(p.x / TS), x1 = Math.floor((p.x + p.w - 0.01) / TS);
  const y0 = Math.floor(p.y / TS), y1 = Math.floor((p.y + p.h - 0.01) / TS);

  // 가시: 칸의 아래쪽 절반만 판정
  const body = { x: p.x, y: p.y, w: p.w, h: p.h };
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (G.physics.cell(tx, ty) === '^' && G.physics.overlap(body, { x: tx * TS, y: ty * TS + TS / 2, w: TS, h: TS / 2 })) {
        G.particles.puff(p.x + p.w / 2, p.y + p.h, 6, '#d8d8e0', 1);
        hazardHit();
        return;
      }
    }
  }

  // 물: 발이 6px 이상 잠기면
  const wy = Math.floor((p.y + p.h - WATER_DEPTH) / TS);
  for (let tx = x0; tx <= x1; tx++) {
    if (G.physics.cell(tx, wy) === 'w') {
      G.particles.puff(p.x + p.w / 2, wy * TS + 2, 12, '#7cc8ff', 1.6, 0.08, 22);
      G.audio.sfx('splash');
      hazardHit();
      return;
    }
  }

  // lastSafe: 양발 아래 칸이 모두 SAFE일 때만 저장 (얼음·상자 위는 저장 안 함)
  if (p.onGround) {
    const fy = Math.floor((p.y + p.h + 1) / TS);
    if (SAFE.has(G.physics.cell(x0, fy)) && SAFE.has(G.physics.cell(x1, fy))) {
      S.lastSafe.x = p.x;
      S.lastSafe.y = p.y;
    }
  }
}

// ───── 검 · 활 ─────

/** 공격 판정 박스 */
function attackBox(p, giant) {
  if (giant) {
    return { x: p.face > 0 ? p.x + p.w : p.x - GIANT_REACH, y: p.y - GIANT_UP, w: GIANT_REACH, h: GIANT_UP + p.h };
  }
  return { x: p.face > 0 ? p.x + p.w : p.x - SLASH_REACH, y: p.y - 3, w: SLASH_REACH, h: p.h + 6 };
}

/** 판정 박스 안의 적 타격 + 타일 파괴 */
function applyHit(p, giant) {
  const box = attackBox(p, giant);
  const dmg = giant ? GIANT_DMG : SLASH_DMG;
  const kx = p.face * (giant ? GIANT_KNOCK : SLASH_KNOCK);
  for (const e of S.enemies) {
    if (e.dead || p.hitSet.has(e)) continue;
    if (G.physics.overlap(box, e)) {
      p.hitSet.add(e);
      G.enemies.meleeEnemy(e, dmg, kx);
    }
  }
  // 타일 파괴
  const breakable = giant ? BREAK_GIANT : BREAK_SLASH;
  const tx0 = Math.floor(box.x / TS), tx1 = Math.floor((box.x + box.w - 0.01) / TS);
  const ty0 = Math.max(0, Math.floor(box.y / TS)), ty1 = Math.floor((box.y + box.h - 0.01) / TS);
  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      const c = G.physics.cell(tx, ty);
      if (!breakable.has(c) || !S.grid[ty]) continue;
      S.grid[ty][tx] = '.';
      const cx = tx * TS + TS / 2, cy = ty * TS + TS / 2;
      if (c === 'B') {
        G.audio.sfx('crate');
        G.particles.puff(cx, cy, 10, '#a8743a', 1.6, 0.1, 26);
        if (Math.random() < 0.7) G.pickups.dropCoin(cx, cy);
      } else if (c === 'R') {
        G.audio.sfx('crate');
        G.particles.puff(cx, cy, 14, '#8a8478', 2, 0.12, 30);
      } else {
        // 가시덤불 · 불타는 덤불
        G.particles.puff(cx, cy, 8, c === 'b' ? '#ff7a2a' : '#4f7a3a', 1.4, 0.06, 22);
      }
    }
  }
}

/** 거대한 검의 초승달 픽셀 이펙트 */
function crescent(p) {
  const cx = p.x + p.w / 2, cy = p.y + p.h / 2 - 6;
  for (let i = 0; i <= 18; i++) {
    const a = -Math.PI / 2 + (i / 18) * Math.PI; // 위 → 앞 → 아래
    for (const rr of [30, 36, 42]) {
      if (rr === 42 && (i < 3 || i > 15)) continue; // 끝이 가는 초승달 모양
      G.particles.addParticle({
        x: cx + Math.cos(a) * rr * p.face, y: cy + Math.sin(a) * rr,
        vx: Math.cos(a) * 0.6 * p.face, vy: Math.sin(a) * 0.6,
        g: 0, life: 16, max: 16, col: rr === 36 ? '#ffffff' : '#bfe8ff', size: 2,
      });
    }
  }
}

function updateCombat(p) {
  if (p.slashCD > 0) p.slashCD--;
  if (p.shootCD > 0) p.shootCD--;

  // 좌클릭 누르는 순간: 베기
  if (G.input.P.atk && p.slashCD <= 0 && p.giant <= 0) {
    p.slash = SLASH_T;
    p.slashCD = PHYS.slashCD;
    p.hitSet.clear();
    G.audio.sfx('slash');
  }

  // 차지: 좌클릭 유지 프레임
  const released = G.input.P.atkUp || (!G.input.K.atk && p.charge > 0);
  if (G.input.K.atk && !released) {
    p.charge++;
    if (p.charge === FULL_CHARGE) {
      G.audio.sfx('charged');
      G.ui.toast('거대한 검 준비 완료! 떼서 휘두르세요', 1600, true);
    }
  } else if (released) {
    if (p.charge >= FULL_CHARGE) {
      p.giant = GIANT_T;
      p.slash = 0;
      p.hitSet.clear();
      S.shake = Math.max(S.shake, SHAKE_GIANT);
      G.audio.sfx('giant');
      crescent(p);
    }
    p.charge = 0;
  }

  // 판정 구간
  if (p.giant > 0) {
    if (p.giant <= GIANT_ON[1] && p.giant >= GIANT_ON[0]) applyHit(p, true);
    p.giant--;
  } else if (p.slash > 0) {
    if (p.slash <= SLASH_ON[1] && p.slash >= SLASH_ON[0]) applyHit(p, false);
    p.slash--;
  }

  // 활: 우클릭(또는 터치 활 버튼) 각도
  if (typeof G.input.P.shoot === 'number' && p.shootCD <= 0) {
    p.face = Math.cos(G.input.P.shoot) >= 0 ? 1 : -1;
    G.arrows.shoot(G.input.P.shoot);
    p.shootCD = PHYS.shootCD;
  }
}

// ───── E 상호작용 ─────

function openDoor(tx, ty) {
  // 같은 열에서 이어진 D를 모두 연다 (2칸 높이)
  let y = ty;
  while (G.physics.cell(tx, y - 1) === 'D') y--;
  while (G.physics.cell(tx, y) === 'D') {
    S.grid[y][tx] = 'd';
    G.particles.puff(tx * TS + TS / 2, y * TS + TS / 2, 6, '#c8c0b0', 1);
    y++;
  }
}

function interact(p) {
  if (!G.input.P.e || p.riding) return;
  const cx = p.x + p.w / 2, cy = p.y + p.h / 2;

  // 1) 열쇠·하트 줍기 (중심 거리 18px 안)
  for (const it of S.items) {
    if (it.dead) continue;
    if (Math.hypot(it.x + 4 - cx, it.y + 4 - cy) <= 18) {
      it.dead = true;
      if (it.type === 'key') {
        p.keys++;
        G.ui.toast('열쇠를 얻었다', 1600);
      } else {
        p.hp = Math.min(p.maxHp, p.hp + 2);
        G.ui.toast('체력이 회복되었다', 1600);
      }
      G.audio.sfx('pick');
      G.particles.puff(it.x + 4, it.y + 4, 8, it.type === 'key' ? '#ffd84a' : '#ff6a7a', 1);
      return;
    }
  }

  const y0 = Math.floor(p.y / TS), y1 = Math.floor((p.y + p.h - 0.01) / TS);

  // 2) 철문: 몸 앞뒤로 맞닿은 칸
  const sides = [Math.floor((p.x - 4) / TS), Math.floor((p.x + p.w + 4) / TS)];
  for (const tx of sides) {
    for (let ty = y0; ty <= y1; ty++) {
      if (G.physics.cell(tx, ty) !== 'D') continue;
      if (p.keys > 0) {
        p.keys--;
        openDoor(tx, ty);
        G.audio.sfx('door');
        G.ui.toast('철문이 열렸다', 1600);
      } else {
        G.ui.toast('열쇠가 필요해요', 1600, true);
      }
      return;
    }
  }

  // 3) 출구: X 칸과 겹치면 다음 스테이지로
  const x0 = Math.floor(p.x / TS), x1 = Math.floor((p.x + p.w - 0.01) / TS);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (G.physics.cell(tx, ty) === 'X') {
        G.audio.sfx('door');
        S.mode = 'trans';
        return;
      }
    }
  }
}

// ───── 애니메이션 ─────

function updateAnim(p) {
  if (p.riding) p.anim = 'idle';
  else if (!p.onGround) p.anim = p.vy < 0 ? 'jump' : 'fall';
  else if (Math.abs(p.vx) > 0.3) p.anim = (Math.floor(p.t / 8) % 2) ? 'run2' : 'run1';
  else p.anim = 'idle';
}

/** 매 step (mode==='play'일 때만 main이 부름) */
function updatePlayer() {
  const p = S.player;
  if (!p) return;
  p.t++;
  if (p.inv > 0) p.inv--;
  if (p.dashCD > 0) p.dashCD--;
  if (p.dismountT > 0) p.dismountT--;

  if (p.riding) {
    // 탑승 중: 위치는 cart.js가 맞춤. 대쉬 불가, 검·활은 가능.
    p.dash = 0;
    p.onGround = true;
    p.coyote = 0;
    p.jumpBuf = 0;
    if (G.input.K.d && !G.input.K.a) p.face = 1;
    else if (G.input.K.a && !G.input.K.d) p.face = -1;
  } else {
    updateMove(p);
    updateHazards(p);
    if (S.mode !== 'play') return;
  }

  updateCombat(p);
  interact(p);
  updateAnim(p);
}

// ───────── 공개 ─────────
G.player = { resetPlayer, hurtPlayer, hazardHit, updatePlayer };
})(window.G = window.G || {});
