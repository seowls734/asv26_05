# 작업 목록 (리드 관리)

상태는 리드만 고친다. 작업을 끝내면 리드에게 "완료: C1" 처럼 보고한다.
`←` 뒤는 먼저 끝나야 하는 작업(의존). 의존 작업이 덜 끝났어도 CONTRACT 시그니처를 믿고 먼저 작성해도 된다.

## 리드가 정한 추가 약속 (CONTRACT 보충)
- **상태 전환 책임**
  - player.js: 체력이 0이 되면 `S.mode='over'`, 출구(X)에서 E를 누르면 `S.mode='trans'` 로만 바꾼다.
  - main.js: `trans`면 페이드 후 다음 스테이지 `loadLevel(i+1)`, 마지막이면 `win`. `over`/`win`/`title`은 오버레이를 띄우고 입력을 받으면 진행한다.
- **속성 전환(F, 1~6)·R·M 키 처리**는 main.js(core). `S.elem` 변경 + `setBadge(i)` + `sfx('swap')`.
- **힌트 표시**는 main.js(core): 플레이어 열이 `S.lvl.hints`의 col을 넘으면 `toast(HINT[key](ctrlNames(isTouch())), 3400)` 한 번.
- **E 상호작용**(열쇠·하트 줍기, 철문, 출구)은 player.js, 광차 타기/내리기는 cart.js.
- **활 발사**: player.js가 `P.shoot`(마우스 각도 number) 또는 터치 조준 결과를 보고 쿨다운 확인 후 `shoot(ang)` 호출.
- **DOM id** (levels가 index.html에 만들고, core가 사용)
  - `#game` 캔버스, `#overlay` 안에 `#ov-title` `#ov-text` `#ov-hint`, `#toast`, `#badge`, `#stage`
  - 터치 버튼: `#pad-move`, `#pad-act` 안에 `button[data-btn="left|right|jump|dash|e|elem|bow|atk"]`
  - 터치 패드 전체 래퍼 `#touch` (모바일에서만 보임)

## core
- [x] C1 physics.js 완성 (cell/solid/oneway/overlap/moveBody)
- [x] C2 input.js 키보드·마우스 (e.code, 좌·우클릭, 우클릭 메뉴 막기, P 플래그)
- [x] C3 input.js 터치 (버튼, 검 길게 누르기, 활 드래그 조준 14px, setPointerCapture) ← L3
- [x] C4 audio.js 20종 효과음 + ui.js (토스트 큐, 오버레이, 배지, 스테이지 표시) ← L3
- [x] C5 level.js (grid 빌드, P C K H S V 변환, 등불·레일·광차) ← C1, L1, E2, PL2, PL6
- [x] C6 main.js (고정 60fps, step 순서, 히트스톱, 카메라, 상태 흐름, 힌트, ?level=) ← C2, C5, G6

## gfx
- [x] G1 font.js 3x5 비트맵 숫자·영문
- [x] G2 sprites.js sprite()/variants() + 모든 스프라이트 (엘프 다리 5프레임)
- [x] G3 tiles.js 모든 타일 문자 그림 (풀 윗면, G 애니메이션, 얼음 깜빡임, 줄기)
- [x] G4 background.js 배경 3종 (밤숲·차가운 동굴·보라 동굴)
- [x] G5 lighting.js 어둠 조명 (SPEC 12 반경)
- [x] G6 renderer.js 연결 + HUD + 검 이펙트 + 상태이상 표시 + 조준 점선 ← G1, G2, G3, G4, G5

## player
- [x] PL1 particles.js
- [x] PL2 player.js 이동 (가속, 코요테, 점프 버퍼, 가변 점프, 대쉬) ← C1
- [x] PL3 player.js 검 (베기, 거대한 검 차지, hitSet, 타일 파괴) + 활 발사 호출 ← PL2, E2, E3
- [x] PL4 player.js 피격·위험·lastSafe·물, E 상호작용(열쇠·하트·철문·출구) ← PL2
- [x] PL5 pickups.js ← PL1
- [x] PL6 cart.js 광차 탑승 ← C1, PL2

## elements
- [x] E1 elements.js ELEM 6종
- [x] E2 enemies.js 슬라임·박쥐·상태이상·dmgEnemy/meleeEnemy ← C1, PL5
- [x] E3 arrows.js 비행·서브스텝·꽂힘·꼬리·적중 ← E1, E2
- [x] E4 effects.js 불(ignite)·얼음(freezeWater/meltAt) ← E3
- [x] E5 effects.js 전기(power)·나무(growTree)·빛(lightLantern) + updateEffects ← E4

## levels
- [x] L1 levels.js 스테이지 3개 (SPEC 11 좌표 그대로)
- [x] L2 hints.js
- [x] L3 index.html (위 DOM id 그대로, 조작표·속성표 포함) — 먼저 끝내고 core·gfx에 알릴 것
- [x] L4 css/style.css (세로·가로 모바일 레이아웃, pixelated)
- [x] L5 README.md
