// 배경 3종 (담당: gfx) — renderer.js 안에서만 사용.
// 'forest' 밤숲(달, 소나무 실루엣) / 'ice' 차가운 동굴과 흰 결정 / 'cave' 보라 동굴
// 레이어는 처음 한 번 오프스크린 캔버스에 그려 두고, 카메라에 따라 시차 스크롤한다.
(function (G) {
'use strict';

// 상수 데이터는 미리 꺼내 둔다 (먼저 로드되는 파일)
const VW = G.config.VW;
const VH = G.config.VH;

const LW = 640; // 레이어 가로(반복 단위)

function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function rnd(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/** 하늘/벽 그라디언트 + 고정 장식 */
function skyLayer(top, bottom, deco) {
  const c = mk(VW, VH);
  const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, VH);
  gr.addColorStop(0, top); gr.addColorStop(1, bottom);
  g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
  if (deco) deco(g);
  return c;
}

/** 소나무 하나 (실루엣) */
function pine(g, x, base, h, col) {
  g.fillStyle = col;
  g.fillRect(x - 1, base - Math.floor(h * .2), 2, Math.floor(h * .2) + 2);
  const tiers = 4;
  for (let i = 0; i < tiers; i++) {
    const ty = base - h * .15 - i * h * .21;
    const w = (tiers - i) * h * .13 + 2;
    for (let r = 0; r < h * .28; r++) {
      const ww = Math.floor(w * (r / (h * .28)));
      g.fillRect(Math.round(x - ww), Math.round(ty - h * .28 + r), ww * 2 + 1, 1);
    }
  }
}

/** 반복 가능한 소나무 실루엣 레이어 */
function pineLayer(seed, base, hMin, hMax, gap, col, ground) {
  const c = mk(LW, VH);
  const g = c.getContext('2d');
  const r = rnd(seed);
  for (let x = -20; x < LW + 20; x += gap * (.6 + r() * .8)) {
    const h = hMin + r() * (hMax - hMin);
    pine(g, Math.round(x), base, h, col);
  }
  g.fillStyle = col;
  g.fillRect(0, base, LW, VH - base);
  if (ground) {
    // 굴곡진 언덕선
    for (let x = 0; x < LW; x++) {
      const hh = Math.round(3 + Math.sin(x / LW * Math.PI * 4) * 3 + Math.sin(x / LW * Math.PI * 10) * 2);
      g.fillRect(x, base - hh, 1, hh);
    }
  }
  // 양 끝을 이어 붙일 때 틈이 없도록 왼쪽 끝을 오른쪽에 복사
  g.drawImage(c, 0, 0, 24, VH, LW - 24, 0, 24, VH);
  return c;
}

/** 위아래 종유석·석순이 있는 동굴 벽 레이어 */
function caveLayer(seed, col, depth, crystal) {
  const c = mk(LW, VH);
  const g = c.getContext('2d');
  const r = rnd(seed);
  g.fillStyle = col;
  // 천장
  for (let x = 0; x < LW; x++) {
    const h = depth + Math.sin(x * .05 + seed) * 5 + Math.sin(x * .013) * 8;
    g.fillRect(x, 0, 1, Math.max(0, Math.round(h)));
  }
  // 종유석
  for (let x = 0; x < LW; x += 10 + r() * 24) {
    const len = 8 + r() * 30, w = 3 + r() * 5;
    for (let i = 0; i < len; i++) {
      const ww = Math.max(1, Math.round(w * (1 - i / len)));
      g.fillRect(Math.round(x - ww / 2), Math.round(depth + i - 4), ww, 1);
    }
  }
  // 바닥 석순
  for (let x = 0; x < LW; x++) {
    const h = depth * 1.4 + Math.sin(x * .03 + seed * 2) * 8 + Math.sin(x * .11) * 3;
    g.fillRect(x, VH - Math.round(h), 1, Math.round(h));
  }
  for (let x = 0; x < LW; x += 14 + r() * 30) {
    const len = 6 + r() * 22, w = 4 + r() * 5;
    for (let i = 0; i < len; i++) {
      const ww = Math.max(1, Math.round(w * (1 - i / len)));
      g.fillRect(Math.round(x - ww / 2), Math.round(VH - depth * 1.4 - i + 4), ww, 1);
    }
  }
  // 결정
  if (crystal) {
    for (let k = 0; k < 18; k++) {
      const x = r() * LW, onTop = r() < .5;
      const y = onTop ? depth + r() * 6 : VH - depth * 1.4 - r() * 4;
      const h = 4 + r() * 9, dir = onTop ? 1 : -1;
      for (let i = 0; i < h; i++) {
        const ww = Math.max(1, Math.round(3 * (1 - i / h)));
        g.fillStyle = i < 2 ? crystal[1] : crystal[0];
        g.fillRect(Math.round(x - ww / 2), Math.round(y + i * dir), ww, 1);
      }
    }
  }
  g.drawImage(c, 0, 0, 24, VH, LW - 24, 0, 24, VH);
  return c;
}

const cache = {};

function build(bg) {
  if (bg === 'ice') {
    return {
      sky: skyLayer('#0b1a2a', '#16314a', (g) => {
        const r = rnd(11);
        for (let i = 0; i < 40; i++) {
          g.fillStyle = r() < .5 ? 'rgba(200,240,255,.35)' : 'rgba(255,255,255,.18)';
          g.fillRect(Math.floor(r() * VW), Math.floor(r() * VH), 1, 1);
        }
      }),
      layers: [
        { c: caveLayer(5, '#14283c', 18, ['#5a8aa8', '#cfeeff']), par: .2 },
        { c: caveLayer(9, '#0e1d2c', 30, ['#bfe8ff', '#ffffff']), par: .45 },
      ],
      flake: '#e8f8ff',
    };
  }
  if (bg === 'cave') {
    return {
      sky: skyLayer('#120a1c', '#24143a', (g) => {
        const r = rnd(23);
        for (let i = 0; i < 24; i++) {
          g.fillStyle = 'rgba(180,120,255,.25)';
          g.fillRect(Math.floor(r() * VW), Math.floor(r() * VH), 1, 1);
        }
      }),
      layers: [
        { c: caveLayer(13, '#1e1230', 16, ['#6a3a9a', '#b07aff']), par: .2 },
        { c: caveLayer(17, '#150c22', 28, ['#8a4ad0', '#e0b0ff']), par: .45 },
      ],
      flake: null,
    };
  }
  // 기본: 밤숲
  return {
    sky: skyLayer('#070b1e', '#1c2a4a', (g) => {
      const r = rnd(7);
      for (let i = 0; i < 70; i++) {
        const b = r();
        g.fillStyle = b > .85 ? '#ffffff' : b > .5 ? '#b8c4e8' : '#5a6890';
        g.fillRect(Math.floor(r() * VW), Math.floor(r() * VH * .6), 1, 1);
      }
      // 달
      g.fillStyle = 'rgba(255,248,210,.12)';
      g.beginPath(); g.arc(250, 38, 22, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#fff4c8';
      g.beginPath(); g.arc(250, 38, 13, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#e8d8a0';
      g.fillRect(244, 34, 3, 2); g.fillRect(253, 42, 4, 3); g.fillRect(251, 31, 2, 2);
    }),
    layers: [
      { c: pineLayer(3, 150, 40, 70, 22, '#121c34', true), par: .15 },
      { c: pineLayer(8, 166, 55, 95, 30, '#0b1324', true), par: .35 },
    ],
    flake: null,
  };
}

/**
 * 배경 그리기
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} bg 'forest' | 'ice' | 'cave'
 * @param {number} cam 카메라 x
 * @param {number} t 애니메이션 프레임
 */
function drawBackground(ctx, bg, cam, t) {
  const key = bg || 'forest';
  if (!cache[key]) cache[key] = build(key);
  const B = cache[key];
  ctx.drawImage(B.sky, 0, 0);
  for (const L of B.layers) {
    const off = Math.floor((cam * L.par) % LW);
    ctx.drawImage(L.c, -off, 0);
    if (LW - off < VW) ctx.drawImage(L.c, LW - off, 0);
  }
  // 차가운 동굴: 천천히 떨어지는 결정 가루
  if (B.flake) {
    ctx.fillStyle = B.flake;
    for (let i = 0; i < 18; i++) {
      const x = ((i * 53 + t * .3 - cam * .5) % VW + VW) % VW;
      const y = ((i * 37 + t * (.25 + (i % 3) * .1)) % VH);
      ctx.fillRect(Math.floor(x + Math.sin(t * .02 + i) * 3), Math.floor(y), 1, 1);
    }
  }
  // 밤숲: 반딧불
  if (key === 'forest') {
    for (let i = 0; i < 6; i++) {
      const x = ((i * 97 - cam * .6) % VW + VW) % VW + Math.sin(t * .015 + i * 2) * 10;
      const y = 90 + i * 11 + Math.sin(t * .02 + i) * 8;
      if (((t >> 4) + i) % 3) {
        ctx.fillStyle = 'rgba(200,255,120,.8)';
        ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
      }
    }
  }
}

// ───────── 공개 ─────────
G.background = { drawBackground };
})(window.G = window.G || {});
