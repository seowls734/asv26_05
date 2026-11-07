// 모든 모듈이 공유하는 단 하나의 상태 객체 (리드 완성)
// 이 객체를 새로 만들어 바꿔치기하지 말 것. 필드 값만 바꾼다(다른 모듈이 같은 참조를 들고 있다).
//
// 좌표 규칙: 엔티티의 x, y는 히트박스 왼쪽 위 픽셀 좌표(월드 기준). tx, ty는 타일 좌표.
// 세로는 맵 12줄 = 192px로 화면과 같으므로 카메라는 가로(S.cam)만 움직인다.
//
// ───────── 엔티티 필드 약속 (리드 지정, 모듈 간 공유 형태) ─────────
// player (player.js가 만들고 소유, 렌더러·HUD가 읽음)
//   { x, y, w:10, h:14, vx, vy, face:1|-1, onGround,
//     hp, maxHp:5, coins, keys,
//     inv,            // 남은 무적 프레임 (피격 70, 대쉬 중에도 > 0)
//     coyote, jumpBuf,
//     dash, dashCD, airDash,       // dash: 남은 대쉬 프레임, airDash: 공중 대쉬 사용 여부
//     slash, slashCD,              // slash: 남은 베기 프레임(14→0)
//     giant,                       // 남은 거대한 검 프레임(22→0)
//     charge,                      // 좌클릭 유지 프레임 (FULL_CHARGE 이상이면 차지 완료)
//     shootCD, hitSet:Set,         // hitSet: 이번 공격에 이미 맞은 적
//     riding, dismountT,           // 광차 탑승 여부, 내린 뒤 자동탑승 금지 남은 프레임
//     anim:'idle'|'run1'|'run2'|'jump'|'fall', t }
// enemies[]  (enemies.js 소유)
//   { type:'slime'|'bat', x, y, w, h, vx, vy, hp, dir:1|-1, t,
//     frozen, burn, stun, root,    // 남은 상태이상 프레임 (0이면 없음)
//     flash, dead }
// arrows[]   (arrows.js 소유)  { x, y, vx, vy, elem:0..7, life, stuck, dead, g }
//   stuck: 0이면 날아가는 중, > 0이면 벽에 꽂혀 남은 프레임
// coins[]    (pickups.js 소유)  { x, y, vx, vy, t, dead }   — 맵의 C와 떨어진 동전 모두
// items[]    (pickups.js 소유)  { type:'key'|'heart', x, y, t, dead }
// particles[] (particles.js 소유) { x, y, vx, vy, g, life, max, col, size }
// fx[]       (effects.js 소유, 렌더러·조명이 읽음)
//   { type:'melt', tx, ty, t }          // 얼음 칸, t = 녹기까지 남은 프레임 (≤90이면 깜빡임)
//   { type:'burn', tx, ty, t, crate }   // 불타는 칸 b, t = 사라지기까지 남은 프레임(70→0)
//   { type:'light', x, y, r, t }        // 빛 화살이 남긴 빛, t = 남은 프레임(480→0)
//   { type:'zap', tx, ty, t }           // 발전기 스파크 연출
// trees[]    (effects.js 소유)  { tx, ty, k, t }   — 자라는 중인 나무 (k: 다음에 쌓을 높이)
// ─────────────────────────────────────────────────────────
(function (G) {
'use strict';

const S = {
  /** 'title' | 'play' | 'trans' | 'over' | 'win' */
  mode: 'title',
  /** 누적 step 수 */
  frame: 0,
  /** 카메라 왼쪽 x(px) */
  cam: 0,
  /** 화면 흔들림 세기(프레임마다 감소) */
  shake: 0,
  /** 히트스톱 남은 프레임 (> 0이면 step을 건너뜀) */
  freeze: 0,
  /** 화면 페이드 0~1 (trans 상태에서 사용) */
  fade: 0,

  /** 현재 스테이지 데이터 (LEVELS[i]) */
  lvl: null,
  lvlIndex: 0,
  /** grid[ty][tx] = 타일 문자 */
  grid: [],
  /** 맵 가로 타일 수 */
  W: 0,

  player: null,
  enemies: [],
  arrows: [],
  coins: [],
  items: [],
  particles: [],
  fx: [],
  trees: [],
  /** 줄기 좌표 "tx,ty" */
  trunks: new Set(),
  /** [{tx, ty, lit}] */
  lanterns: [],
  /** null | {x, y, w:22, h:12, vx, min, max} */
  cart: null,
  /** null | {row, x0, x1} (타일 단위) */
  rail: null,

  /** 선택된 화살 속성 0..7 (ELEM 인덱스) */
  elem: 0,
  /** 이미 보여준 힌트 키 */
  hintsDone: new Set(),
  /** 스테이지 시작 시점 동전 수 (다시 시작할 때 되돌림) */
  levelStartCoins: 0,
  /** 마지막 안전 지점(px) */
  lastSafe: { x: 0, y: 0 },
  flags: { cartHint: false, grassHint: false, muted: false },
};

// ───────── 공개 ─────────
G.S = S;
})(window.G = window.G || {});
