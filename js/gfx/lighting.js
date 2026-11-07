// 어둠 조명 (담당: gfx) — renderer.js 안에서만 사용. SPEC 12.
// 오프스크린 캔버스를 rgba(3,2,8,.95)로 채운 뒤 destination-out 원형 그라디언트로 빛을 뚫는다.
(function (G) {
'use strict';

// 상수 데이터는 미리 꺼내 둔다 (먼저 로드되는 파일)
const TS = G.config.TS;
const VW = G.config.VW;
const VH = G.config.VH;
const ROWS = G.config.ROWS;
const FULL_CHARGE = G.config.FULL_CHARGE;

let dark = null, dctx = null;

/** 광원 반경 (SPEC 12) */
const LIGHT_R = {
  player: 30, lanternOn: 88, lanternOff: 10, lightArrow: 40, lightStuck: 60,
  hotArrow: 18, burn: 36, exit: 40, gen: 28, giant: 70,
};

/** 원형 빛 하나 뚫기 */
function hole(x, y, r, a = 1) {
  if (r <= 0) return;
  const g = dctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(0,0,0,${a})`);
  g.addColorStop(.55, `rgba(0,0,0,${a * .75})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  dctx.fillStyle = g;
  dctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/**
 * 어둠 오버레이 그리기 (dark 스테이지에서만 호출)
 * @param {CanvasRenderingContext2D} ctx 화면 ctx
 * @param {object} S 공유 상태
 * @param {number} cam 카메라 x
 * @param {number} t 애니메이션 프레임
 * @param {number} ox 흔들림 가로 오프셋 (광원 좌표에만 더함, 어둠은 항상 화면 전체)
 * @param {number} oy 흔들림 세로 오프셋
 */
function drawLighting(ctx, S, cam, t, ox = 0, oy = 0) {
  if (!dark) {
    dark = document.createElement('canvas');
    dark.width = VW; dark.height = VH;
    dctx = dark.getContext('2d');
  }
  dctx.globalCompositeOperation = 'source-over';
  dctx.clearRect(0, 0, VW, VH);
  dctx.fillStyle = 'rgba(3,2,8,.95)';
  dctx.fillRect(0, 0, VW, VH);
  dctx.globalCompositeOperation = 'destination-out';

  const vis = (x, r) => x + r > 0 && x - r < VW;
  const L = (wx, wy, r, a) => { const x = wx - cam + ox; if (vis(x, r)) hole(x, wy + oy, r, a); };

  // 플레이어 (살짝 흔들림)
  const p = S.player;
  if (p) {
    L(p.x + p.w / 2, p.y + p.h / 2, LIGHT_R.player + Math.sin(t * .15) * 1.5 + Math.sin(t * .37) * 1);
    // 거대한 검 (차지 완료 또는 휘두르는 중)
    if (p.giant > 0 || p.charge >= FULL_CHARGE) L(p.x + p.w / 2, p.y - 10, LIGHT_R.giant, .9);
  }
  // 등불
  for (const l of S.lanterns || []) {
    const fl = l.lit ? Math.sin(t * .1 + l.tx) * 2 : 0;
    L(l.tx * TS + 8, l.ty * TS + 5, l.lit ? LIGHT_R.lanternOn + fl : LIGHT_R.lanternOff, l.lit ? 1 : .5);
  }
  // 화살
  for (const a of S.arrows) {
    if (a.dead || a.stuck) continue;
    if (a.elem === 5) L(a.x, a.y, LIGHT_R.lightArrow);
    else if (a.elem === 2 || a.elem === 3) L(a.x, a.y, LIGHT_R.hotArrow, .8);
  }
  // 효과
  for (const f of S.fx) {
    if (f.type === 'light') L(f.x, f.y, f.r || LIGHT_R.lightStuck);
    else if (f.type === 'burn') L(f.tx * TS + 8, f.ty * TS + 8, LIGHT_R.burn + Math.sin(t * .3 + f.tx) * 2, .9);
    else if (f.type === 'zap') L(f.tx * TS + 8, f.ty * TS + 6, 24, .7);
  }
  // 출구·켜진 발전기·불타는 칸(효과 목록에 없을 때 대비)은 화면 안 타일을 훑어서
  if (S.grid && S.grid.length) {
    const tx0 = Math.max(0, Math.floor(cam / TS) - 6), tx1 = Math.min(S.W - 1, Math.floor((cam + VW) / TS) + 6);
    for (let ty = 0; ty < ROWS; ty++) {
      const row = S.grid[ty];
      if (!row) continue;
      for (let tx = tx0; tx <= tx1; tx++) {
        const c = row[tx];
        if (c === 'X' && (ty === 0 || S.grid[ty - 1][tx] !== 'X')) L(tx * TS + 8, ty * TS + 16, LIGHT_R.exit);
        else if (c === 'z') L(tx * TS + 8, ty * TS + 8, LIGHT_R.gen, .9);
      }
    }
  }
  ctx.drawImage(dark, 0, 0);
}

// ───────── 공개 ─────────
G.lighting = { LIGHT_R, drawLighting };
})(window.G = window.G || {});
