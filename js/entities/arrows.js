// 화살 (담당: elements) — CONTRACT elements/arrows.js
// 필드 형태는 js/state.js 주석 그대로: { x, y, vx, vy, elem:0..5, life, stuck, dead }
//   x, y = 화살촉 끝 위치. 꽂힌 뒤에도 vx, vy는 그대로 두어 렌더러가 각도를 그린다.
(function (G) {
'use strict';

// 상수 데이터는 미리 꺼내 둔다 (먼저 로드되는 파일)
const S = G.S;
const TS = G.config.TS;
const ROWS = G.config.ROWS;
const PHYS = G.config.PHYS;
const SOLID = G.tiledefs.SOLID;
const isGround = G.tiledefs.isGround;
const ELEM = G.ELEM;

const LIFE = 110;      // 날아가는 수명
const STUCK = 45;      // 벽에 꽂혀 있는 시간
const SUBSTEPS = 2;    // 한 프레임 충돌 검사 횟수
const HIT_PAD = 2;     // 적 히트박스 여유(px)

// 속성 인덱스
const NORMAL = 0, ICE = 1, FIRE = 2, ELEC = 3, GRASS = 4, LIGHT = 5;

/** 맞은 적에게 주는 상태이상 (프레임) */
const STATUS = {
  [ICE]: ['frozen', 120],
  [FIRE]: ['burn', 180],
  [ELEC]: ['stun', 180],
  [GRASS]: ['root', 300],
};

/**
 * 플레이어 중심에서 현재 속성(S.elem)의 화살을 쏜다. 쿨다운은 player.js가 확인한다.
 * @param {number} ang 라디안 (0 = 오른쪽, Math.atan2(dy, dx))
 */
function shoot(ang) {
  const p = S.player;
  if (!p) return;
  const c = Math.cos(ang), s = Math.sin(ang);
  S.arrows.push({
    x: p.x + p.w / 2 + c * 4,
    y: p.y + p.h / 2 - 2 + s * 4,
    vx: c * PHYS.arrowSpeed,
    vy: s * PHYS.arrowSpeed,
    elem: S.elem | 0,
    life: LIFE,
    stuck: 0,
    dead: false,
  });
  G.audio.sfx('bow');
}

/** 적에게 맞았을 때: 대미지 1 + 속성 효과 */
function hitEnemy(a, e) {
  const col = ELEM[a.elem] ? ELEM[a.elem].col : '#e8e2d0';
  const st = STATUS[a.elem];
  if (st && !e.dead) {
    e[st[0]] = st[1];
    if (a.elem === ICE) G.audio.sfx('freeze');
    else if (a.elem === FIRE) G.audio.sfx('fire');
    else if (a.elem === ELEC) G.audio.sfx('zap');
  }
  G.enemies.dmgEnemy(e, 1, Math.sign(a.vx) * 1.5, false);
  G.particles.puff(a.x, a.y, 6, col, 1.2);
  a.dead = true;
}

/** 벽(고체 칸)에 꽂혔을 때 칸 기믹 처리 */
function hitTile(a, tx, ty, c) {
  switch (a.elem) {
    case FIRE:
      if (c === 'T' || c === 'B') G.effects.ignite(tx, ty);
      else if (c === 'i') G.effects.meltAt(tx, ty);
      break;
    case ICE:
      if (c === 'i') G.effects.freezeWater(tx, ty); // 이미 언 호수면 얼음 시간을 다시 채움
      break;
    case ELEC:
      if (c === 'Z') G.effects.power(tx, ty);
      break;
    case GRASS:
      if (c === 'o') G.effects.growTree(tx, ty);
      else if (isGround(c) && !S.flags.grassHint) {
        S.flags.grassHint = true;
        G.ui.toast('풀 화살은 갈아놓은 흙(갈색 땅)에 쏴야 나무가 자라요', 2600);
      }
      break;
    case LIGHT: {
      // 벽에서 살짝 떨어진 곳에 빛을 남긴다
      const sp = Math.hypot(a.vx, a.vy) || 1;
      S.fx.push({ type: 'light', x: a.x - a.vx / sp * 3, y: a.y - a.vy / sp * 3, r: 60, t: 480 });
      G.audio.sfx('light');
      break;
    }
  }
}

/** 화살 하나를 한 서브스텝 움직이고 충돌을 본다 */
function substep(a) {
  a.x += a.vx / SUBSTEPS;
  a.y += a.vy / SUBSTEPS;

  // 맵 밖
  if (a.x < 0 || a.x >= S.W * TS || a.y > ROWS * TS) { a.dead = true; return; }

  // 적
  for (const e of S.enemies) {
    if (e.dead) continue;
    if (a.x >= e.x - HIT_PAD && a.x <= e.x + e.w + HIT_PAD &&
        a.y >= e.y - HIT_PAD && a.y <= e.y + e.h + HIT_PAD) {
      hitEnemy(a, e);
      return;
    }
  }

  if (a.y < 0) return; // 화면 위로 날아가는 중
  const tx = Math.floor(a.x / TS), ty = Math.floor(a.y / TS);
  const c = G.physics.cell(tx, ty);

  // 물: 얼음은 얼리고, 나머지는 물보라를 내고 사라진다
  if (c === 'w') {
    if (a.elem === ICE) {
      G.effects.freezeWater(tx, ty);
      G.particles.puff(a.x, a.y, 8, '#8fe3ff', 1.2);
    } else {
      G.particles.puff(a.x, a.y, 8, '#7fb8ff', 1.4, .12, 22);
      G.audio.sfx('splash');
    }
    a.dead = true;
    return;
  }

  // 등불 윗부분에 빛 화살 → 영구 점등
  if (c === 'L' && a.elem === LIGHT && a.y - ty * TS < TS / 2) {
    const ln = S.lanterns.find((l) => l.tx === tx && l.ty === ty);
    if (ln && !ln.lit) {
      G.effects.lightLantern(tx, ty);
      a.dead = true;
      return;
    }
  }

  // 고체 칸에 꽂힘
  if (SOLID.has(c)) {
    a.stuck = STUCK;
    G.particles.puff(a.x, a.y, 3, '#a89a80', .8);
    hitTile(a, tx, ty, c);
  }
}

/** 매 step: 비행(중력·서브스텝 충돌) · 꽂힘 타이머 · 꼬리 파티클 */
function updateArrows() {
  const list = S.arrows;
  for (const a of list) {
    if (a.dead) continue;
    if (a.stuck > 0) {
      if (--a.stuck <= 0) a.dead = true;
      continue;
    }
    if (--a.life <= 0) { a.dead = true; continue; }
    a.vy += PHYS.arrowGrav;
    for (let i = 0; i < SUBSTEPS && !a.dead && !a.stuck; i++) substep(a);

    // 속성 화살 꼬리 파티클
    if (!a.dead && !a.stuck && a.elem !== NORMAL && ELEM[a.elem]) {
      const sp = Math.hypot(a.vx, a.vy) || 1;
      G.particles.addParticle({
        x: a.x - a.vx / sp * 6 + (Math.random() - .5) * 2,
        y: a.y - a.vy / sp * 6 + (Math.random() - .5) * 2,
        vx: (Math.random() - .5) * .3,
        vy: (Math.random() - .5) * .3,
        g: 0, life: 14, max: 14, col: ELEM[a.elem].col, size: 1,
      });
    }
  }
  // 배열 참조는 유지한 채 끝난 화살만 뺀다
  for (let i = list.length - 1; i >= 0; i--) if (list[i].dead) list.splice(i, 1);
}

// ───────── 공개 ─────────
G.arrows = { shoot, updateArrows };
})(window.G = window.G || {});
