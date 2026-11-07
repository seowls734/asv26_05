// 6속성 정의 (담당: elements) — CONTRACT elements/elements.js
// 인덱스 0..5가 S.elem 값과 같다. name은 짧은 이름(배지에는 name + ' 화살').

(function (G) {
'use strict';

/** [{id, name, col}] × 6 */
const ELEM = [
  { id: 'normal', name: '그냥', col: '#e8e2d0' },
  { id: 'ice',    name: '얼음', col: '#8fe3ff' },
  { id: 'fire',   name: '불',   col: '#ff7a2a' },
  { id: 'elec',   name: '전기', col: '#ffe14d' },
  { id: 'grass',  name: '풀',   col: '#6fdc5a' },
  { id: 'light',  name: '빛',   col: '#fff6c8' },
];

// ───────── 공개 ─────────
G.ELEM = ELEM;
})(window.G = window.G || {});
