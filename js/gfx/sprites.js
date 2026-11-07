// 도트 스프라이트 (담당: gfx) — CONTRACT gfx/sprites.js
// 모든 그림은 문자열 행 + 팔레트로 코드에서 만든다(이미지 파일 없음).
// 기본 방향은 오른쪽을 본다.

(function (G) {
'use strict';

/** 빈 캔버스 만들기 */
function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

/**
 * 문자열 행과 팔레트로 스프라이트 캔버스를 만든다.
 * @param {string[]} rows 각 문자 = 한 픽셀. 팔레트에 없는 문자('.' 등)는 투명.
 * @param {Object<string,string>} pal 문자 → 색
 * @returns {HTMLCanvasElement}
 */
function sprite(rows, pal) {
  const h = rows.length;
  const w = rows.reduce((m, r) => Math.max(m, r.length), 0);
  const c = mk(w, h);
  const g = c.getContext('2d');
  for (let y = 0; y < h; y++) {
    const r = rows[y];
    for (let x = 0; x < r.length; x++) {
      const col = pal[r[x]];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  }
  return c;
}

/** 좌우 뒤집기 */
function flip(src) {
  const c = mk(src.width, src.height);
  const g = c.getContext('2d');
  g.translate(src.width, 0);
  g.scale(-1, 1);
  g.drawImage(src, 0, 0);
  return c;
}

/** 실루엣 전체를 한 색으로 */
function solidColor(src, col) {
  const c = mk(src.width, src.height);
  const g = c.getContext('2d');
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = col;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}

/** 원본 위에 반투명 색을 덮기(틴트) */
function tint(src, col) {
  const c = mk(src.width, src.height);
  const g = c.getContext('2d');
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = col;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}

/**
 * 방향·피격·상태이상 변형 세트
 * r/l: 오른쪽/왼쪽, wr/wl: 흰 실루엣(피격 깜빡임), ice: 하늘색 틴트(빙결), yel: 노란 틴트(스턴)
 * (추가) icel/yell: 왼쪽을 보는 틴트 버전
 * @returns {{r, l, wr, wl, ice, yel, icel, yell, w, h}}
 */
function variants(src) {
  const ice = tint(src, 'rgba(143,227,255,.6)');
  const yel = tint(src, 'rgba(255,225,77,.6)');
  return {
    r: src,
    l: flip(src),
    wr: solidColor(src, '#ffffff'),
    wl: flip(solidColor(src, '#ffffff')),
    ice, yel,
    icel: flip(ice),
    yell: flip(yel),
    w: src.width,
    h: src.height,
  };
}

// ───────── 플레이어 (엘프) 12×16 ─────────
const ELF_PAL = {
  h: '#f2d04a', // 금발
  H: '#c4952a', // 머리 그림자
  s: '#f5c89a', // 피부
  S: '#d39a6a', // 피부 그림자
  e: '#1a1a2a', // 눈
  g: '#3fae4a', // 초록 튜닉
  G: '#26773a', // 튜닉 그림자
  b: '#7a4a22', // 갈색 벨트
  y: '#e8c050', // 벨트 버클
  p: '#4a3a2c', // 바지
  k: '#2e1f14', // 장화
};
// 상체 12줄 (모든 프레임 공통)
const ELF_TOP = [
  '....hhhh....',
  '...hhhhhh...',
  '..hhhhhhhh..',
  '..hhhHssss..',
  'sshhHsssess.',
  '.shhHsssss..',
  '..hhSsssS...',
  '...GgggggG..',
  '..gggggggss.',
  '..gGggggggs.',
  '..bbbbbybb..',
  '..gggGgggg..',
];
// 다리 4줄 프레임
const ELF_LEGS = {
  idle: ['...pp..pp...', '...pp..pp...', '...kk..kk...', '...kkk.kkk..'],
  run1: ['..pp....pp..', '.pp......pp.', '.kk......kk.', 'kk.......kkk'],
  run2: ['....ppp.....', '....pp.p....', '....kk.kk...', '....kkk.....'],
  jump: ['..pp...pp...', '..kk..pp....', '......kk....', '............'],
  fall: ['..pp...pp...', '.pp.....pp..', '.kk.....kk..', 'kk.......kk.'],
};

/** 플레이어 프레임: PSPR.idle / run1 / run2 / jump / fall, 각각 variants 세트 */
const PSPR = {};
for (const k of Object.keys(ELF_LEGS)) {
  PSPR[k] = variants(sprite([...ELF_TOP, ...ELF_LEGS[k]], ELF_PAL));
}

// ───────── 검 베기 호 14×20 (오른쪽 방향, 플레이어 앞에 그림) ─────────
const SLASH = variants(sprite([
  '....wW........',
  '......wwW.....',
  '........wwW...',
  '.........wwW..',
  '..........wwW.',
  '...........wwW',
  '...........wwW',
  '............wW',
  '............wW',
  '............wW',
  '............wW',
  '............wW',
  '............wW',
  '...........wwW',
  '...........wwW',
  '..........wwW.',
  '.........wwW..',
  '........wwW...',
  '......wwW.....',
  '....wW........',
], { w: '#ffffff', W: '#9fd8ff' }));

// ───────── 거대한 검 12×36 (칼끝이 위) ─────────
const GIANT = variants(sprite([
  '.....ww.....',
  '....wwwl....',
  '....wwwl....',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  '...wwwwll...',
  'gggggGGggggg',
  'gyyyyggyyyyg',
  '.ggggGGgggg.',
  '.....bb.....',
  '.....bB.....',
  '.....bB.....',
  '.....bB.....',
  '.....bB.....',
  '....gyyg....',
  '.....gg.....',
], { w: '#eaf6ff', l: '#9ec3e0', g: '#c79a2a', G: '#8a6a1a', y: '#ffe27a', b: '#6b3f1f', B: '#4a2a14' }));

// ───────── 활 6×12 (오른쪽을 향함) ─────────
const BOW = variants(sprite([
  '.ww...',
  '..wb..',
  '..w.b.',
  '..w..b',
  '..w..b',
  '..w..b',
  '..w..b',
  '..w..b',
  '..w..b',
  '..w.b.',
  '..wb..',
  '.ww...',
], { w: '#ddd6c0', b: '#8a5a2a' }));

// ───────── 슬라임 12×8 (2프레임) ─────────
const SLIME_PAL = { g: '#5ad06a', G: '#2f8f44', l: '#b8ffb0', e: '#10221a', o: '#1f5a2c' };
const SLIME = variants(sprite([
  '....oooo....',
  '..oogggggo..',
  '.oglggggggo.',
  '.ogleggeggo.',
  'oggggggggggo',
  'oggggggggGGo',
  'oGGgggggGGGo',
  '.oooooooooo.',
], SLIME_PAL));
/** (추가) 슬라임 납작 프레임 */
const SLIME_B = variants(sprite([
  '............',
  '...oooooo...',
  '.oogggggggo.',
  'oglleggeggGo',
  'ogggggggggGo',
  'oggggggggGGo',
  'oGGggggggGGo',
  'oooooooooooo',
], SLIME_PAL));

// ───────── 박쥐 10×6 (2프레임, 눈은 빨강) ─────────
const BAT_PAL = { k: '#3a2850', K: '#22162f', r: '#ff3030', f: '#c9a0d0' };
const BAT = variants(sprite([
  'k...KK...k',
  'kk.KKKK.kk',
  'kkkKrKrkkk',
  '.kkKKKKkk.',
  '..k.ff.k..',
  '..........',
], BAT_PAL));
/** (추가) 날개 내린 프레임 */
const BAT_B = variants(sprite([
  '....KK....',
  '...KKKK...',
  '.kkKrKrkk.',
  'kkkKKKKkkk',
  'kk..ff..kk',
  'k........k',
], BAT_PAL));

// ───────── 동전 8×8 ─────────
const COIN_PAL = { y: '#ffd23f', Y: '#c48a12', w: '#fff6b0', o: '#6a4a08' };
const COIN = variants(sprite([
  '..oooo..',
  '.oyyyyo.',
  'oywyyyYo',
  'oywyYyYo',
  'oyyyYyYo',
  'oyyyyyYo',
  '.oYYYYo.',
  '..oooo..',
], COIN_PAL));
/** (추가) 옆으로 돈 동전 */
const COIN_B = variants(sprite([
  '...oo...',
  '..oyYo..',
  '..owYo..',
  '..owYo..',
  '..oyYo..',
  '..oyYo..',
  '..oYYo..',
  '...oo...',
], COIN_PAL));

// ───────── 열쇠 10×6 ─────────
const KEY = variants(sprite([
  '.yyy......',
  'yY.Yy.....',
  'yY.YyyyyyY',
  'yY.Yy..Y.Y',
  '.yyy...Y..',
  '..........',
], { y: '#ffd84a', Y: '#b08418' }));

// ───────── 하트 7×6 (꽉 참 / 빈 칸) ─────────
const HEART = variants(sprite([
  '.rr.rr.',
  'rwrrrRr',
  'rrrrrRr',
  '.rrrRr.',
  '..rRr..',
  '...r...',
], { r: '#ff4a5a', R: '#b8243a', w: '#ffc0c8' }));
const HEART_E = variants(sprite([
  '.kk.kk.',
  'k..k..k',
  'k.....k',
  '.k...k.',
  '..k.k..',
  '...k...',
], { k: '#6a3a4a' }));

// ───────── 공개 ─────────
G.sprites = { sprite, variants, PSPR, SLASH, GIANT, BOW, SLIME, SLIME_B, BAT, BAT_B, COIN, COIN_B, KEY, HEART, HEART_E };
})(window.G = window.G || {});
