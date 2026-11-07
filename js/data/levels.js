// 스테이지 데이터 (담당: levels) — CONTRACT levels/levels.js, 좌표는 SPEC 11 그대로
//
// build(L) 약속 (core의 level.js와 합의)
//   level.js가 grid(ROWS × w)를 '.'로 채운 뒤 build(L)을 부른다.
//   L = { fill(x0,x1,y0,y1,ch), set(x,y,ch), w, grid }  — 범위는 양 끝 포함, 맵 밖 좌표는 무시
//   공통 바닥·양 끝 벽·천장은 build 안에서 직접 그린다. P C K H S V는 set으로 넣으면 level.js가 엔티티로 바꾼다.
// bg·pal 약속 (gfx와 합의)
//   bg: 'forest'(밤숲) | 'ice'(차가운 동굴) | 'cave'(보라 동굴)
//   pal: { ground, groundDark, top, topLight } — 모두 선택, 없으면 bg별 기본색

(function (G) {
'use strict';

/** 공통: 10~11줄 바닥, 양 끝 열 전체를 '#' */
function base(L, w) {
  L.fill(0, w - 1, 10, 11, '#');
  L.fill(0, 0, 0, 11, '#');
  L.fill(w - 1, w - 1, 0, 11, '#');
}

/** 가시 구덩이 a~b열 */
function pit(L, a, b) {
  L.fill(a, b, 10, 10, '.');
  L.fill(a, b, 11, 11, '^');
}

/** 같은 줄 y에 x0~x1 열마다 ch를 놓는다 */
function row(L, x0, x1, y, ch) {
  for (let x = x0; x <= x1; x++) L.set(x, y, ch);
}

/** [{code, name, w, bg, dark?, rail?, pal, hints:[[col,key]], build(L)}] */
const LEVELS = [
  {
    code: '1-1',
    name: '엘프의 숲',
    w: 92,
    bg: 'forest',
    pal: { ground: '#5a3b26', groundDark: '#3e2818', top: '#3f9a3a', topLight: '#7fd35a' },
    hints: [[3, 'atk'], [17, 'elem'], [24, 'grass'], [33, 'fire'], [56, 'giant']],
    build(L) {
      base(L, 92);
      // 시작·초반
      L.set(2, 9, 'P');
      row(L, 5, 7, 8, 'C');
      L.set(11, 9, 'S');
      L.set(15, 9, 'B');
      L.set(21, 5, 'V');
      L.set(18, 7, 'C');
      L.set(19, 7, 'C');
      // 흙·절벽
      L.set(27, 10, 'o');
      L.set(28, 10, 'o');
      L.fill(30, 44, 4, 9, '#');
      L.fill(37, 39, 0, 0, '#');
      // 덤불·열쇠
      L.fill(38, 38, 1, 3, 'T');
      row(L, 32, 34, 3, 'C');
      L.set(42, 3, 'K');
      // 중반 적
      L.set(50, 9, 'S');
      L.set(55, 4, 'V');
      // 바위 관문
      L.fill(61, 61, 0, 7, '#');
      L.set(61, 8, 'R');
      L.set(61, 9, 'R');
      row(L, 64, 66, 8, 'C');
      L.set(67, 9, 'S');
      // 철문 관문
      L.fill(72, 72, 0, 7, '#');
      L.set(72, 8, 'D');
      L.set(72, 9, 'D');
      // 후반·출구
      L.set(78, 9, 'B');
      L.set(78, 8, 'B');
      L.set(82, 9, 'S');
      L.set(85, 8, 'C');
      L.set(88, 8, 'X');
      L.set(88, 9, 'X');
    },
  },
  {
    code: '1-2',
    name: '얼어붙은 호수',
    w: 92,
    bg: 'ice',
    rail: { row: 10, x0: 50, x1: 71 },
    pal: { ground: '#3a4a66', groundDark: '#27334a', top: '#cfeeff', topLight: '#ffffff' },
    hints: [[9, 'ice'], [35, 'elec'], [47, 'cart']],
    build(L) {
      base(L, 92);
      // 시작
      L.set(2, 9, 'P');
      row(L, 4, 6, 8, 'C');
      L.set(9, 9, 'S');
      // 호수
      L.fill(13, 26, 10, 11, 'w');
      L.fill(18, 21, 7, 7, '=');
      L.set(19, 6, 'K');
      L.set(18, 6, 'C');
      L.set(21, 6, 'C');
      // 발전기 구간
      L.set(29, 9, 'S');
      L.set(33, 4, 'V');
      L.set(39, 9, 'Z');
      L.fill(43, 43, 0, 9, 'G');
      L.set(41, 8, 'C');
      L.set(47, 9, 'S');
      // 광차 구간
      pit(L, 53, 68);
      for (const x of [56, 58, 62, 64]) L.set(x, 7, 'C');
      L.set(60, 4, 'V');
      // 철문·출구
      L.set(75, 9, 'S');
      L.fill(80, 80, 0, 7, '#');
      L.set(80, 8, 'D');
      L.set(80, 9, 'D');
      L.set(84, 5, 'V');
      L.set(88, 8, 'X');
      L.set(88, 9, 'X');
    },
  },
  {
    code: '1-3',
    name: '어둠의 갱도',
    w: 98,
    bg: 'cave',
    dark: true,
    pal: { ground: '#3b2a4a', groundDark: '#271b33', top: '#6a4f86', topLight: '#9a7fbf' },
    hints: [[3, 'light'], [38, 'mix']],
    build(L) {
      base(L, 98);
      L.fill(0, 97, 0, 0, '#'); // 천장
      // 초반 함정
      L.set(2, 9, 'P');
      L.set(6, 9, 'L');
      L.set(8, 8, 'C');
      L.set(9, 8, 'C');
      pit(L, 12, 14);
      L.set(16, 9, 'L');
      // 두 번째 함정
      L.set(19, 9, 'S');
      L.set(24, 4, 'V');
      L.set(27, 9, 'L');
      pit(L, 30, 33);
      L.set(36, 9, 'S');
      // 덤불 관문
      L.fill(40, 40, 1, 5, '#');
      L.fill(40, 40, 6, 9, 'T');
      L.set(43, 9, 'L');
      // 흙·절벽
      L.set(46, 10, 'o');
      L.set(47, 10, 'o');
      L.fill(49, 58, 4, 9, '#');
      L.set(53, 3, 'L');
      L.set(56, 2, 'V');
      L.set(51, 3, 'C');
      L.set(52, 3, 'C');
      // 호수
      L.fill(60, 68, 10, 11, 'w');
      L.set(70, 9, 'L');
      // 발전기 관문
      L.set(73, 9, 'Z');
      L.fill(76, 76, 1, 9, 'G');
      L.set(79, 9, 'S');
      // 바위 관문
      L.fill(83, 83, 1, 7, '#');
      L.set(83, 8, 'R');
      L.set(83, 9, 'R');
      L.set(86, 9, 'L');
      L.set(87, 9, 'K');
      L.set(89, 4, 'V');
      // 철문·출구
      L.fill(91, 91, 1, 7, '#');
      L.set(91, 8, 'D');
      L.set(91, 9, 'D');
      L.set(95, 8, 'X');
      L.set(95, 9, 'X');
    },
  },
];

// ───────── 공개 ─────────
G.LEVELS = LEVELS;
})(window.G = window.G || {});
