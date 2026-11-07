// 스테이지 로드·재시작 (담당: core) — CONTRACT core/level.js

(function (G) {
'use strict';

// 상수 데이터는 미리 꺼내 둔다 (먼저 로드되는 파일)
const S = G.S;
const TS = G.config.TS;
const ROWS = G.config.ROWS;
const VW = G.config.VW;
const LEVELS = G.LEVELS;

/** 스테이지 시작 시점 체력 (R로 다시 시작할 때 되돌림) */
let levelStartHp = 5;

/** 배열 참조를 유지한 채 비운다 (다른 모듈이 같은 배열을 들고 있을 수 있음) */
function clear(a) { a.length = 0; }

/** 카메라를 플레이어 중심으로, 맵 범위 안으로 맞춘다 */
function snapCam() {
  const p = S.player;
  const maxCam = Math.max(0, S.W * TS - VW);
  const c = p ? p.x + p.w / 2 - VW / 2 : 0;
  S.cam = Math.round(Math.max(0, Math.min(maxCam, c)));
}

/**
 * 스테이지 i를 불러온다.
 * - 체력·동전은 직전 플레이어에게서 이어받는다(없으면 5 / 0). 열쇠는 0.
 * - S.mode는 바꾸지 않는다(호출한 쪽이 정함).
 * @param {number} i LEVELS 인덱스
 * @param {{hp?:number, coins?:number}} [keep] 이어받을 값을 직접 지정(재시작용)
 */
function loadLevel(i, keep) {
  const lv = LEVELS[i];
  if (!lv) return false;
  const prev = S.player;
  const hp = keep && keep.hp != null ? keep.hp : prev && prev.hp > 0 ? prev.hp : 5;
  const coins = keep && keep.coins != null ? keep.coins : prev ? prev.coins : 0;

  S.lvl = lv;
  S.lvlIndex = i;
  S.W = lv.w;

  // ── grid: ROWS × w를 '.'로 채운 뒤 build ──
  clear(S.grid);
  for (let y = 0; y < ROWS; y++) S.grid.push(new Array(lv.w).fill('.'));
  const inside = (x, y) => x >= 0 && x < lv.w && y >= 0 && y < ROWS;
  const L = {
    w: lv.w,
    grid: S.grid,
    set(x, y, ch) { if (inside(x, y)) S.grid[y][x] = ch; },
    fill(x0, x1, y0, y1, ch) {
      for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
        for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) L.set(x, y, ch);
    },
  };
  lv.build(L);

  // ── 엔티티 배열 비우기 ──
  clear(S.enemies); clear(S.arrows); clear(S.coins); clear(S.items);
  clear(S.particles); clear(S.fx); clear(S.trees); clear(S.lanterns);
  S.trunks.clear();

  // ── 문자 → 엔티티 ──
  let px = 2 * TS + 3, py = 9 * TS + 2;
  for (let ty = 0; ty < ROWS; ty++) {
    const row = S.grid[ty];
    for (let tx = 0; tx < lv.w; tx++) {
      const c = row[tx];
      const x = tx * TS, y = ty * TS;
      switch (c) {
        case 'P': px = x + (TS - 10) / 2; py = y + TS - 14; break;
        case 'C': S.coins.push({ x: x + 4, y: y + 4, vx: 0, vy: 0, t: 0, dead: false, static: true }); break;
        case 'K': S.items.push({ type: 'key', x: x + 4, y: y + 4, t: 0, dead: false }); break;
        case 'H': S.items.push({ type: 'heart', x: x + 4, y: y + 4, t: 0, dead: false }); break;
        case 'S': S.enemies.push(G.enemies.mkEnemy('slime', x, y)); break;
        case 'V': S.enemies.push(G.enemies.mkEnemy('bat', x, y)); break;
        case 'L': S.lanterns.push({ tx, ty, lit: false }); continue; // 등불은 칸에 그대로 둔다
        default: continue;
      }
      row[tx] = '.';
    }
  }

  // ── 플레이어 ──
  G.player.resetPlayer(px, py);
  S.player.hp = Math.min(S.player.maxHp, hp);
  S.player.coins = coins;
  S.player.keys = 0;
  S.player.onGround = true;
  levelStartHp = S.player.hp;
  S.levelStartCoins = coins;
  S.lastSafe = { x: px, y: py };

  // ── 레일·광차 ──
  S.rail = lv.rail ? { row: lv.rail.row, x0: lv.rail.x0, x1: lv.rail.x1 } : null;
  S.cart = S.rail ? G.cart.makeCart(S.rail) || null : null;

  // ── 화면 상태 ──
  S.shake = 0;
  S.freeze = 0;
  snapCam();
  G.ui.clearToasts();
  G.ui.setStage(lv.code, lv.name);
  G.ui.setBadge(S.elem);
  return true;
}

/**
 * 지금 스테이지를 처음부터 다시 시작한다.
 * 동전은 스테이지 시작 시점으로 되돌리고, 체력은 시작 시점 값(full=true면 가득).
 */
function restartLevel(full = false) {
  const hp = full ? 5 : levelStartHp;
  loadLevel(S.lvlIndex, { hp, coins: S.levelStartCoins });
  S.fade = 0;
  S.mode = 'play';
  G.ui.hideOverlay();
}

/** 새 게임: 1-1부터, 체력 5·동전 0·속성 '그냥'·힌트 초기화 */
function startGame(i = 0) {
  S.player = null;
  S.elem = 0;
  S.hintsDone.clear();
  S.flags.cartHint = false;
  S.flags.grassHint = false;
  loadLevel(i, { hp: 5, coins: 0 });
  S.fade = 0;
  S.mode = 'play';
  G.ui.hideOverlay();
}

// ───────── 공개 ─────────
G.level = { loadLevel, restartLevel, startGame };
})(window.G = window.G || {});
