// 타일 성질 정의 (리드 완성) — 문자 범례는 docs/SPEC.md 8번.

(function (G) {
'use strict';

/** 사방에서 막히는 고체 타일 */
const SOLID = new Set(['#', 'B', 'D', 'o', 'T', 'b', 'i', 'R', 'Z', 'z', 'G']);

/** 위에서만 밟히는 일방통행 발판 (나무 발판, 잎 발판) */
const ONEWAY = new Set(['=', 'f']);

/**
 * 부활 지점(lastSafe)을 저장해도 되는 바닥.
 * 얼음(i)·상자(B)·덤불(T)은 사라질 수 있으므로 넣지 않는다.
 */
const SAFE = new Set(['#', 'o', '=', 'f', 'Z', 'z']);

/** 풀 덮인 일반 땅 또는 갈아놓은 흙인지 */
const isGround = (c) => c === '#' || c === 'o';

// ───────── 공개 ─────────
G.tiledefs = { SOLID, ONEWAY, SAFE, isGround };
})(window.G = window.G || {});
