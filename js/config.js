// 게임 전역 상수 (리드 완성) — 수치는 docs/SPEC.md 기준. 바꾸려면 리드에게 제안할 것.

(function (G) {
'use strict';

/** 타일 한 칸 크기(px) */
const TS = 16;
/** 내부 해상도 가로(px) */
const VW = 320;
/** 내부 해상도 세로(px) = ROWS × TS */
const VH = 192;
/** 맵 높이(줄 수) */
const ROWS = 12;
/** 거대한 검 차지에 필요한 프레임 수 (3초) */
const FULL_CHARGE = 180;

/** 플레이어·화살 물리 수치 (단위: px/프레임, 프레임) */
const PHYS = Object.freeze({
  gravity: .36,
  maxFall: 7,
  jump: -6.5,
  speed: 1.7,
  accGround: .35,
  accAir: .2,
  coyote: 6,
  jumpBuf: 7,
  dashT: 10,
  dashSpeed: 4.6,
  dashCD: 36,
  slashCD: 18,
  shootCD: 16,
  arrowSpeed: 5.6,
  arrowGrav: .06,
});

// ───────── 공개 ─────────
G.config = { TS, VW, VH, ROWS, FULL_CHARGE, PHYS };
})(window.G = window.G || {});
