// 튜토리얼 문구 (담당: levels) — CONTRACT levels/hints.js, 문구는 SPEC 13 그대로
// 사용: toast(HINT[key](ctrlNames(isTouch())), 3400)

(function (G) {
'use strict';

/** 문자열의 마지막 한글 글자의 받침 번호 (0이면 받침 없음, 한글이 없으면 0) */
function jong(word) {
  for (let i = word.length - 1; i >= 0; i--) {
    const c = word.charCodeAt(i);
    if (c >= 0xac00 && c <= 0xd7a3) return (c - 0xac00) % 28;
  }
  return 0;
}

/** 로/으로: 받침 없음 또는 ㄹ 받침(8) → 로, 그 외 → 으로 */
const ro = (w) => { const j = jong(w); return w + (j === 0 || j === 8 ? '로' : '으로'); };
/** 을/를: 받침 있음 → 을, 없음 → 를 */
const eul = (w) => w + (jong(w) ? '을' : '를');

/** 힌트 키 → (ctrl) => 문구. ctrl = {atk, bow, el} */
const HINT = {
  atk: (c) => `${ro(c.atk)} 베기 · ${ro(c.bow)} 활 쏘기`,
  elem: (c) => `${ro(c.el)} 화살 속성을 바꿀 수 있어요`,
  grass: () => '갈아놓은 흙에 풀 화살을 쏘면 나무가 자라요',
  fire: () => '가시덤불은 불 화살로 태우세요',
  giant: (c) => `${eul(c.atk)} 3초 누르고 떼면 거대한 검! 금 간 바위를 부숴요`,
  ice: () => '얼음 화살로 호수를 얼려 건너세요 (10초 뒤 녹아요)',
  elec: () => '전기 화살로 발전기를 켜면 방벽이 열려요',
  cart: () => '광차에 다가가 E로 타세요',
  light: () => '빛 화살로 등불을 밝히세요. 어둠 속엔 함정이 있어요',
  mix: () => '이제 배운 속성을 모두 써야 해요',
};

/** 마지막 입력이 터치였는지에 따라 조작 이름을 고른다. @returns {{atk, bow, el}} */
function ctrlNames(isTouch) {
  return isTouch
    ? { atk: '검 버튼', bow: '활 버튼(끌어서 조준)', el: '속성 버튼' }
    : { atk: '좌클릭', bow: '우클릭(마우스 조준)', el: 'F 키' };
}

// ───────── 공개 ─────────
HINT.ctrlNames = ctrlNames; // G.HINT.ctrlNames(isTouch)
G.HINT = HINT;
})(window.G = window.G || {});
