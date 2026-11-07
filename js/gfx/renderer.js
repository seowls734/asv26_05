// 화면 그리기 진입점 (담당: gfx) — CONTRACT gfx/renderer.js
// main.js가 rAF마다 step 뒤에 draw()를 인자 없이 한 번 부른다(모든 mode).
// 그리는 순서: 배경 → (흔들림 적용) 타일 → 효과 → 줍는 것 → 광차 → 적 → 플레이어 → 화살 → 파티클
//            → 어둠 조명 → 어둠 위 표시(박쥐 눈, [E], 차지 게이지, 조준 점선) → HUD → 페이드
(function (G) {
'use strict';

// 상수 데이터는 미리 꺼내 둔다 (먼저 로드되는 파일)
const S = G.S;
const TS = G.config.TS;
const VW = G.config.VW;
const VH = G.config.VH;
const FULL_CHARGE = G.config.FULL_CHARGE;
const PHYS = G.config.PHYS;
const ELEM = G.ELEM;
const PSPR = G.sprites.PSPR;
const SLASH = G.sprites.SLASH;
const GIANT = G.sprites.GIANT;
const BOW = G.sprites.BOW;
const SLIME = G.sprites.SLIME;
const SLIME_B = G.sprites.SLIME_B;
const BAT = G.sprites.BAT;
const BAT_B = G.sprites.BAT_B;
const COIN = G.sprites.COIN;
const COIN_B = G.sprites.COIN_B;
const KEY = G.sprites.KEY;
const HEART = G.sprites.HEART;
const HEART_E = G.sprites.HEART_E;

let cv = null, ctx = null;
/** 렌더러 자체 애니메이션 카운터 (일시정지·오버레이 중에도 증가) */
let tick = 0;
/** 대쉬 잔상 */
const trail = [];

const CHARGE_SHOW = 15;

function init() {
  cv = document.getElementById('game');
  if (!cv) return false;
  if (cv.width !== VW) cv.width = VW;
  if (cv.height !== VH) cv.height = VH;
  ctx = cv.getContext('2d');
  return true;
}

const R = (col, x, y, w, h) => { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); };
const elemCol = (i) => (ELEM[i] && ELEM[i].col) || '#e8e2d0';

/** 화면 그리기 */
function draw() {
  if (!ctx && !init()) return;
  tick++;
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  if (!S.lvl || !S.grid || !S.grid.length) {
    R('#07060c', 0, 0, VW, VH);
    drawFade();
    return;
  }

  const cam = Math.round(S.cam || 0);
  G.background.drawBackground(ctx, S.lvl.bg, cam, tick);

  // 화면 흔들림
  let sx = 0, sy = 0;
  if (S.shake > 0) {
    sx = Math.round((Math.random() * 2 - 1) * S.shake * .5);
    sy = Math.round((Math.random() * 2 - 1) * S.shake * .5);
  }
  ctx.save();
  ctx.translate(sx, sy);

  G.tiles.drawTiles(ctx, S, cam, tick);
  drawFx(cam);
  drawPickups(cam);
  drawCart(cam);
  for (const e of S.enemies) if (!e.dead) drawEnemy(e, cam);
  drawPlayer(cam);
  for (const a of S.arrows) if (!a.dead) drawArrow(a, cam);
  drawParticles(cam);

  if (S.lvl.dark) {
    // 어둠은 흔들림과 상관없이 화면 전체를 덮는다: translate 밖에서 그리고 광원 좌표에만 오프셋을 더함
    ctx.restore();
    G.lighting.drawLighting(ctx, S, cam, tick, sx, sy);
    ctx.save();
    ctx.translate(sx, sy);
    // 어둠 위에 박쥐의 빨간 눈
    for (const e of S.enemies) if (!e.dead && e.type === 'bat') batEyes(e, cam);
  }

  drawKeycap(cam);
  drawCharge(cam);
  drawAim(cam);
  ctx.restore();

  drawHUD();
  drawFade();
}

// ───────── 효과(fx) ─────────
function drawFx(cam) {
  for (const f of S.fx) {
    if (f.type === 'light' && !S.lvl.dark) {
      // 밝은 스테이지에서도 은은한 빛
      const x = f.x - cam, r = (f.r || 60) * .6;
      if (x < -r || x > VW + r) continue;
      const g = ctx.createRadialGradient(x, f.y, 0, x, f.y, r);
      g.addColorStop(0, 'rgba(255,246,200,.35)');
      g.addColorStop(1, 'rgba(255,246,200,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, f.y - r, r * 2, r * 2);
    } else if (f.type === 'light') {
      const x = f.x - cam;
      R('#fff6c8', Math.round(x) - 1, Math.round(f.y) - 1, 2, 2);
    } else if (f.type === 'zap') {
      // 발전기 스파크
      const cx = f.tx * TS + 8 - cam, cy = f.ty * TS + 8;
      for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2, d = 6 + Math.random() * 12;
        R(Math.random() < .5 ? '#ffe14d' : '#ffffff', Math.round(cx + Math.cos(a) * d), Math.round(cy + Math.sin(a) * d), 1, 1);
      }
      if (f.t % 6 < 3) bolt(cx, cy - 4, cx + (Math.random() * 16 - 8), cy - 18, '#fff6a8');
    } else if (f.type === 'burn') {
      // 불씨가 위로 튐
      if (Math.random() < .5) {
        const x = f.tx * TS - cam + Math.random() * 16, y = f.ty * TS - Math.random() * 8;
        R(Math.random() < .5 ? '#ffa02a' : '#ffe27a', Math.round(x), Math.round(y), 1, 1);
      }
    }
  }
  // 자라는 나무: 반짝이
  for (const tr of S.trees) {
    const x = tr.tx * TS + 8 - cam, y = (tr.ty - (tr.k || 0)) * TS + 8;
    for (let i = 0; i < 3; i++) {
      R('#b8ff9a', Math.round(x + Math.random() * 16 - 8), Math.round(y + Math.random() * 16 - 8), 1, 1);
    }
  }
}

/** 지그재그 번개 선 */
function bolt(x0, y0, x1, y1, col) {
  const n = 5;
  let px = x0, py = y0;
  for (let i = 1; i <= n; i++) {
    const nx = x0 + (x1 - x0) * i / n + (i < n ? Math.random() * 4 - 2 : 0);
    const ny = y0 + (y1 - y0) * i / n;
    line(px, py, nx, ny, col);
    px = nx; py = ny;
  }
}

/** 픽셀 직선 */
function line(x0, y0, x1, y1, col) {
  ctx.fillStyle = col;
  const d = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= d; i++) {
    ctx.fillRect(Math.round(x0 + (x1 - x0) * i / d), Math.round(y0 + (y1 - y0) * i / d), 1, 1);
  }
}

// ───────── 동전·아이템 ─────────
function drawPickups(cam) {
  for (const c of S.coins) {
    if (c.dead) continue;
    const x = Math.round(c.x - cam);
    if (x < -10 || x > VW + 10) continue;
    const bob = c.static ? Math.round(Math.sin(tick * .08 + c.x * .1) * 1.5) : 0;
    const spin = ((tick + Math.floor(c.x)) >> 3) % 4 === 2;
    // 떨어진 동전은 사라지기 직전 깜빡임은 pickups 쪽 수명이 없으므로 생략
    ctx.drawImage(spin ? COIN_B.r : COIN.r, x, Math.round(c.y) + bob);
  }
  for (const it of S.items) {
    if (it.dead) continue;
    const x = Math.round(it.x - cam);
    if (x < -12 || x > VW + 12) continue;
    const bob = Math.round(Math.sin(tick * .07 + it.x) * 2);
    const y = Math.round(it.y) + bob;
    // 반짝임 후광
    const hg = ctx.createRadialGradient(x + 4, y + 4, 0, x + 4, y + 4, 9);
    hg.addColorStop(0, it.type === 'key' ? 'rgba(255,216,74,.35)' : 'rgba(255,74,90,.35)');
    hg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = hg;
    ctx.fillRect(x - 5, y - 5, 18, 18);
    if (it.type === 'key') ctx.drawImage(KEY.r, x - 1, y + 1);
    else ctx.drawImage(HEART.r, x, y + 1);
    if ((tick + Math.floor(it.x)) % 50 < 4) R('#ffffff', x + 6, y, 1, 1);
  }
}

// ───────── 광차 ─────────
function drawCart(cam) {
  const c = S.cart;
  if (!c) return;
  const x = Math.round(c.x - cam), y = Math.round(c.y);
  if (x < -30 || x > VW + 30) return;
  // 탄 상태면 플레이어는 drawPlayer에서 먼저 그리고 광차 앞면을 나중에 덮는다
  if (S.player && S.player.riding) return;
  cartBody(x, y);
}

function cartBody(x, y) {
  const w = 22, h = 12;
  R('#1a1a20', x, y + 1, w, h - 4);
  R('#6a5040', x + 1, y + 2, w - 2, h - 6);
  R('#8a6a50', x + 1, y + 2, w - 2, 1);
  R('#4a3428', x + 1, y + 5, w - 2, 1);
  R('#9aa0ae', x, y, w, 2); // 테두리 쇠
  R('#3a3a44', x + 4, y + 2, 1, h - 6); R('#3a3a44', x + w - 5, y + 2, 1, h - 6);
  // 바퀴 (회전 표시)
  const rot = S.cart && Math.floor(S.cart.x / 3) & 1;
  for (const wx of [x + 3, x + w - 7]) {
    R('#22222a', wx, y + h - 4, 4, 4);
    R('#7a7e8c', wx + (rot ? 1 : 2), y + h - 3, 1, 1);
  }
}

// ───────── 적 ─────────
function drawEnemy(e, cam) {
  const x = Math.round(e.x - cam), y = Math.round(e.y);
  if (x < -20 || x > VW + 20) return;
  const left = e.dir < 0;
  let set;
  if (e.type === 'bat') set = ((e.t || 0) >> 3) & 1 ? BAT_B : BAT;
  else set = ((e.t || 0) >> 4) & 1 && !e.frozen && !e.root ? SLIME_B : SLIME;
  // 빙결 중에는 애니메이션 정지
  if (e.frozen > 0) set = e.type === 'bat' ? BAT : SLIME;

  let img = left ? set.l : set.r;
  if (e.flash > 0) img = left ? set.wl : set.wr;
  else if (e.frozen > 0) img = left ? set.icel : set.ice;
  else if (e.stun > 0 && (tick >> 2) & 1) img = left ? set.yell : set.yel;
  const ox = e.w ? Math.round((e.w - set.w) / 2) : 0, oy = e.h ? e.h - set.h : 0;
  ctx.drawImage(img, x + ox, y + oy);

  const w = e.w || set.w, h = e.h || set.h;
  // 빙결: 얼음 박스
  if (e.frozen > 0) {
    ctx.fillStyle = 'rgba(160,230,255,.35)';
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    R('#d8f6ff', x - 2, y - 2, w + 4, 1);
    R('#8fe3ff', x - 2, y + h + 1, w + 4, 1);
    R('#8fe3ff', x - 2, y - 2, 1, h + 4);
    R('#8fe3ff', x + w + 1, y - 2, 1, h + 4);
    R('#ffffff', x, y, 2, 1); R('#ffffff', x, y + 1, 1, 1);
    if (e.frozen < 30 && (tick >> 1) & 1) R('#ffffff', x + w - 1, y + h - 1, 1, 1);
  }
  // 스턴: 스파크
  if (e.stun > 0) {
    for (let i = 0; i < 2; i++) {
      const a = tick * .3 + i * Math.PI;
      R('#ffe14d', Math.round(x + w / 2 + Math.cos(a) * (w / 2 + 2)), Math.round(y - 2 + Math.sin(a) * 2), 1, 1);
    }
    if ((tick >> 2) & 1) R('#ffffff', x + Math.floor(Math.random() * w), y + Math.floor(Math.random() * h), 1, 1);
  }
  // 화상: 불꽃 파티클(장식)
  if (e.burn > 0) {
    for (let i = 0; i < 3; i++) {
      const fx = x + ((tick * 3 + i * 5) % w);
      const fy = y + h - 2 - ((tick * 2 + i * 7) % (h + 6));
      R(i === 0 ? '#ffe27a' : '#ff7a2a', fx, fy, 1, i === 1 ? 2 : 1);
    }
  }
  // 속박: 바닥 덩굴
  if (e.root > 0) {
    const by = y + h;
    for (let i = -2; i < w + 2; i++) {
      const vh = 2 + ((i * 7 + 3) % 4) + Math.round(Math.sin(tick * .1 + i) * .6);
      R(i & 1 ? '#3a9a3a' : '#6fdc5a', x + i, by - vh, 1, vh);
    }
    R('#6fdc5a', x - 1, by - 5, 2, 1); R('#6fdc5a', x + w - 1, by - 6, 2, 1);
    R('#ff8ac0', x + Math.floor(w / 2), by - 5, 1, 1); // 작은 꽃
  }
}

function batEyes(e, cam) {
  const x = Math.round(e.x - cam), y = Math.round(e.y);
  if (x < -12 || x > VW + 12) return;
  const set = BAT;
  const ox = e.w ? Math.round((e.w - set.w) / 2) : 0, oy = e.h ? e.h - set.h : 0;
  const left = e.dir < 0;
  const ex = left ? [5, 3] : [4, 6];
  ctx.fillStyle = 'rgba(255,40,40,.25)';
  ctx.fillRect(x + ox + 2, y + oy + 1, 6, 3);
  for (const c of ex) R('#ff3030', x + ox + c, y + oy + 2, 1, 1);
}

// ───────── 플레이어 ─────────
function drawPlayer(cam) {
  const p = S.player;
  if (!p) return;
  const set = PSPR[p.anim] || PSPR.idle;
  const left = p.face < 0;
  const px = Math.round(p.x - cam) - 1, py = Math.round(p.y) - 2;

  // 대쉬 잔상
  if (p.dash > 0) trail.push({ x: p.x, y: p.y, img: left ? set.wl : set.wr, life: 10 });
  for (let i = trail.length - 1; i >= 0; i--) {
    const t = trail[i];
    t.life--;
    if (t.life <= 0) { trail.splice(i, 1); continue; }
    ctx.globalAlpha = t.life / 10 * .45;
    ctx.drawImage(t.img, Math.round(t.x - cam) - 1, Math.round(t.y) - 2);
  }
  ctx.globalAlpha = 1;

  // 거대한 검 차지 완료: 머리 위 큰 검
  if (p.charge >= FULL_CHARGE && !(p.giant > 0)) {
    const bob = Math.round(Math.sin(tick * .2) * 1.5);
    const gx = Math.round(p.x + p.w / 2 - cam) - 6, gy = Math.round(p.y) - 46 + bob;
    ctx.globalAlpha = .9;
    ctx.drawImage((tick >> 2) & 1 ? GIANT.wr : GIANT.r, gx, gy);
    ctx.globalAlpha = 1;
  }

  // 무적 깜빡임 (대쉬 중에는 깜빡이지 않음)
  const blink = p.inv > 0 && !(p.dash > 0) && (tick >> 2) & 1;
  const hurtFlash = p.inv > 64 && !(p.dash > 0);
  if (!blink) ctx.drawImage(hurtFlash ? (left ? set.wl : set.wr) : (left ? set.l : set.r), px, py);

  // 활: 막 쏜 직후 손에
  if (p.shootCD > PHYS.shootCD - 8) {
    const bx = left ? px - 3 : px + 9;
    ctx.drawImage(left ? BOW.l : BOW.r, bx, py + 3);
  }

  // 광차 앞면을 플레이어 위에
  if (p.riding && S.cart) cartBody(Math.round(S.cart.x - cam), Math.round(S.cart.y));

  // 일반 베기
  if (p.slash > 0) drawSlash(p, cam);
  // 거대한 검 휘두르기
  if (p.giant > 0) drawGiant(p, cam);
}

function drawSlash(p, cam) {
  const left = p.face < 0;
  const k = p.slash / 14; // 1 → 0
  const hx = Math.round(p.x + p.w / 2 - cam + p.face * 3), hy = Math.round(p.y + 7);
  // 칼날: 위에서 아래로 휘두름
  const a = -1.9 + (1 - k) * 2.8; // 오른쪽 기준 각도
  const ang = left ? Math.PI - a : a;
  line(hx, hy, hx + Math.cos(ang) * 10, hy + Math.sin(ang) * 10, '#e8f4ff');
  R('#c79a2a', hx - 1, hy - 1, 2, 2);
  // 호 이펙트 (판정 구간 무렵 가장 진하게)
  if (p.slash <= 12 && p.slash >= 3) {
    ctx.globalAlpha = Math.min(1, p.slash / 8);
    const img = left ? SLASH.l : SLASH.r;
    const sx = left ? Math.round(p.x - cam) - 12 : Math.round(p.x + p.w - cam) - 2;
    ctx.drawImage(img, sx, Math.round(p.y + p.h / 2) - 11);
    ctx.globalAlpha = 1;
  }
}

function drawGiant(p, cam) {
  const left = p.face < 0;
  const k = 1 - p.giant / 22; // 0 → 1
  const hx = p.x + p.w / 2 - cam + p.face * 3, hy = p.y + 8;
  // 머리 위(0) → 앞으로 내려침(약 2.2rad)
  const swing = Math.min(1, k * 1.6);
  const rot = (-.35 + swing * 2.5) * (left ? -1 : 1);
  ctx.save();
  ctx.translate(Math.round(hx), Math.round(hy));
  ctx.rotate(rot);
  ctx.drawImage(left ? GIANT.l : GIANT.r, -6, -31);
  ctx.restore();
  // 초승달 픽셀 이펙트 (판정 구간 18~8 근처)
  if (p.giant <= 20 && p.giant >= 5) {
    const alpha = p.giant > 8 ? 1 : (p.giant - 4) / 4;
    const cx = p.x + p.w / 2 - cam, cy = p.y + p.h / 2 - 6;
    const span = Math.min(1, (20 - p.giant) / 8); // 퍼져 나가는 정도
    const a0 = -1.7, a1 = a0 + span * 2.6;
    ctx.globalAlpha = alpha;
    for (let a = a0; a <= a1; a += .045) {
      const tt = (a - a0) / 2.6; // 0~1, 가운데가 가장 두꺼움
      const thick = Math.max(1, Math.round(Math.sin(tt * Math.PI) * 7));
      const ca = left ? Math.PI - a : a;
      for (let r = 0; r < thick; r++) {
        const rr = 44 - r * 1.6;
        R(r < 2 ? '#ffffff' : r < 4 ? '#bfe8ff' : '#6ab8ff',
          Math.round(cx + Math.cos(ca) * rr), Math.round(cy + Math.sin(ca) * rr), 2, 2);
      }
    }
    ctx.globalAlpha = 1;
  }
}

// ───────── 화살 ─────────
function drawArrow(a, cam) {
  const x = a.x - cam, y = a.y;
  if (x < -12 || x > VW + 12) return;
  if (a.stuck > 0 && a.stuck < 12 && (tick >> 1) & 1) return; // 사라지기 전 깜빡임
  const ang = Math.atan2(a.vy || 0, a.vx || 1);
  const c = Math.cos(ang), s = Math.sin(ang);
  const col = elemCol(a.elem);
  // 화살대(촉 끝 x,y에서 뒤로 9px)
  line(x - c * 9, y - s * 9, x - c * 2, y - s * 2, '#b08a5a');
  // 깃
  R('#e8e2d0', Math.round(x - c * 9 - s), Math.round(y - s * 9 + c), 1, 1);
  R('#e8e2d0', Math.round(x - c * 9 + s), Math.round(y - s * 9 - c), 1, 1);
  // 촉 (속성 색)
  line(x - c * 2, y - s * 2, x, y, col);
  if (a.elem > 0 && !a.stuck) {
    ctx.fillStyle = col;
    ctx.globalAlpha = .4;
    ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4);
    ctx.globalAlpha = 1;
  }
}

// ───────── 파티클 ─────────
function drawParticles(cam) {
  for (const p of S.particles) {
    if (p.life <= 0) continue;
    const x = Math.round(p.x - cam);
    if (x < -4 || x > VW + 4) continue;
    ctx.globalAlpha = Math.max(0, Math.min(1, p.max ? p.life / p.max : 1));
    ctx.fillStyle = p.col || '#ffffff';
    const sz = p.size || 1;
    ctx.fillRect(x, Math.round(p.y), sz, sz);
  }
  ctx.globalAlpha = 1;
}

// ───────── [E] 키캡 ─────────
function cellAt(tx, ty) {
  if (ty < 0 || ty >= S.grid.length || tx < 0 || tx >= S.W) return '#';
  return S.grid[ty][tx];
}

/** 상호작용 대상 위치(월드 좌표, 키캡을 띄울 아래 기준점) 찾기 */
function interactTarget(p) {
  const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
  for (const it of S.items) {
    if (!it.dead && Math.hypot(it.x + 4 - cx, it.y + 4 - cy) <= 18) return { x: it.x + 4, y: it.y - 4 };
  }
  if (p.riding) return null;
  const y0 = Math.floor(p.y / TS), y1 = Math.floor((p.y + p.h - .01) / TS);
  for (const tx of [Math.floor((p.x - 4) / TS), Math.floor((p.x + p.w + 4) / TS)]) {
    for (let ty = y0; ty <= y1; ty++) {
      if (cellAt(tx, ty) === 'D') {
        let top = ty;
        while (cellAt(tx, top - 1) === 'D') top--;
        return { x: tx * TS + 8, y: top * TS - 3 };
      }
    }
  }
  const x0 = Math.floor(p.x / TS), x1 = Math.floor((p.x + p.w - .01) / TS);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (cellAt(tx, ty) === 'X') {
        let top = ty;
        while (cellAt(tx, top - 1) === 'X') top--;
        return { x: tx * TS + 8, y: top * TS - 3 };
      }
    }
  }
  const c = S.cart;
  if (c && !(p.dismountT > 0)) {
    const near = p.x + p.w > c.x - 6 && p.x < c.x + c.w + 6 && p.y + p.h > c.y - 6 && p.y < c.y + c.h + 6;
    if (near) return { x: c.x + c.w / 2, y: c.y - 18 };
  }
  return null;
}

function drawKeycap(cam) {
  const p = S.player;
  if (!p || S.mode !== 'play') return;
  const t = interactTarget(p);
  if (!t) return;
  const bob = Math.round(Math.sin(tick * .15) * 1.5);
  const x = Math.round(t.x - cam) - 5, y = Math.round(t.y) - 11 + bob;
  R('#14121c', x, y, 11, 11);
  R('#e8e2d0', x + 1, y + 1, 9, 8);
  R('#9a948a', x + 1, y + 8, 9, 2);
  G.font.drawText(ctx, 'E', x + 4, y + 2, '#14121c');
}

// ───────── 차지 게이지 ─────────
function drawCharge(cam) {
  const p = S.player;
  if (!p || !(p.charge > CHARGE_SHOW)) return;
  const full = p.charge >= FULL_CHARGE;
  const w = 16, x = Math.round(p.x + p.w / 2 - cam) - w / 2, y = Math.round(p.y) - 7;
  R('#14121c', x - 1, y - 1, w + 2, 5);
  R('#3a3446', x, y, w, 3);
  const k = Math.min(1, (p.charge - CHARGE_SHOW) / (FULL_CHARGE - CHARGE_SHOW));
  const col = full ? ((tick >> 2) & 1 ? '#ffffff' : '#ffe14d') : k > .66 ? '#ffb84a' : '#8fd0ff';
  R(col, x, y, Math.round(w * k), 3);
  if (!full) R('rgba(255,255,255,.5)', x, y, Math.round(w * k), 1);
}

// ───────── 활 조준 점선 (터치 드래그) ─────────
function drawAim(cam) {
  const p = S.player;
  if (!p || !G.input.aim.active || !G.input.aim.dragged || S.mode !== 'play') return;
  const c = Math.cos(G.input.aim.ang), s = Math.sin(G.input.aim.ang);
  let x = p.x + p.w / 2 + c * 4, y = p.y + p.h / 2 - 2 + s * 4;
  const [sp, g] = G.arrows.speedOf(S.elem);
  let vx = c * sp, vy = s * sp;
  const col = elemCol(S.elem);
  ctx.fillStyle = col;
  for (let f = 0; f < 60; f++) {
    x += vx; y += vy; vy += g;
    if (y > VH || y < -40) break;
    if (G.physics.solid(Math.floor(x / TS), Math.floor(y / TS))) break;
    if (f % 3 === 1) {
      ctx.globalAlpha = Math.max(.2, 1 - f / 60);
      ctx.fillRect(Math.round(x - cam) - 1, Math.round(y) - 1, 2, 2);
    }
  }
  ctx.globalAlpha = 1;
}

// ───────── HUD ─────────
function drawHUD() {
  const p = S.player;
  if (p) {
    // 하트 5칸
    for (let i = 0; i < (p.maxHp || 5); i++) {
      ctx.drawImage(i < p.hp ? HEART.r : HEART_E.r, 4 + i * 8, 4);
    }
    // 동전 ×N, 열쇠 ×N
    ctx.drawImage(COIN.r, 4, 13);
    G.font.drawText(ctx, 'x' + (p.coins | 0), 14, 15, '#ffe27a', 1, '#14121c');
    const kx = 14 + G.font.textWidth('x' + (p.coins | 0)) + 6;
    ctx.drawImage(KEY.r, kx, 14);
    G.font.drawText(ctx, 'x' + (p.keys | 0), kx + 12, 15, p.keys > 0 ? '#ffd84a' : '#9a948a', 1, '#14121c');
  }
  // 오른쪽 위: 스테이지 코드
  if (S.lvl && S.lvl.code) {
    const code = String(S.lvl.code);
    G.font.drawText(ctx, code, VW - 4 - G.font.textWidth(code), 5, '#e8e2d0', 1, '#14121c');
  }
  // 위 가운데: 8속성 화살 아이콘
  const n = ELEM.length || 6, cw = 12, x0 = Math.round(VW / 2 - n * cw / 2);
  R('rgba(10,8,16,.55)', x0 - 2, 2, n * cw + 3, 14);
  for (let i = 0; i < n; i++) {
    const x = x0 + i * cw, y = 4;
    const col = elemCol(i);
    // 대각선 화살 (왼쪽 아래 → 오른쪽 위)
    for (let k = 0; k < 6; k++) R('#b08a5a', x + 2 + k, y + 8 - k, 1, 1);
    R(col, x + 7, y + 1, 2, 2); R(col, x + 8, y, 1, 1); R(col, x + 6, y + 1, 1, 1); R(col, x + 8, y + 2, 1, 1);
    R('#e8e2d0', x + 1, y + 8, 1, 1); R('#e8e2d0', x + 2, y + 9, 1, 1);
    // 숫자 키 표시
    if (i === S.elem) {
      R('#ffffff', x - 1, y - 1, 11, 1); R('#ffffff', x - 1, y + 10, 11, 1);
      R('#ffffff', x - 1, y - 1, 1, 12); R('#ffffff', x + 9, y - 1, 1, 12);
    } else {
      ctx.globalAlpha = .28;
      R('#000000', x, y, 9, 10);
      ctx.globalAlpha = 1;
    }
  }
}

function drawFade() {
  if (S.fade > 0) {
    ctx.fillStyle = `rgba(0,0,0,${Math.min(1, S.fade)})`;
    ctx.fillRect(0, 0, VW, VH);
  }
}

// ───────── 공개 ─────────
G.renderer = { draw };
})(window.G = window.G || {});
