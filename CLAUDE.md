# 폐광의 기사 — 팀 규칙

2D 횡스크롤 도트 웹게임. 리드 1명 + 팀원(core, gfx, player, elements, levels, qa).

## 기준 문서
- 명세는 `docs/SPEC.md`, 모듈 간 약속은 `docs/CONTRACT.md`가 기준이다. **작업 전에 반드시 둘 다 읽는다.**
- 엔티티 필드 형태(player, enemies, arrows, coins, items, particles, fx, trees)는 `js/state.js` 맨 위 주석에 리드가 정해 두었다. 그대로 따른다.
- `js/config.js`, `js/state.js`, `js/world/tiledefs.js`는 리드가 완성한 공용 기준이다. 수정하지 않는다.

## 작성 규칙
- 빌드 도구 없이 **전역 G 네임스페이스 + 일반 script**로 작성한다. `import`/`export`는 쓰지 않는다(`index.html`을 더블클릭해 file://로 열어도 돌아가야 한다).
  - 각 파일은 `(function (G) { 'use strict'; … })(window.G = window.G || {});` 로 감싸고, 공개할 것만 G에 붙인다. 파일 안에서 `G`라는 이름의 지역 변수를 만들지 않는다.
  - 다른 파일의 함수는 쓰는 순간에 `G.xxx.fn()`으로 부른다. 상수 데이터(`G.config`, `G.S`, `G.tiledefs`, `G.sprites`, `G.ELEM`, `G.LEVELS`)만 맨 위에서 미리 꺼내도 된다.
  - **새 파일을 추가하면 `index.html`의 `<script>` 순서에도 추가한다.** 순서가 곧 로딩 순서다.
- 외부 라이브러리 금지 (Google Fonts만 허용). 이미지 파일 금지 — 도트는 코드로 그린다.
- 주석과 UI 문구는 한국어로 쓴다.

## 협업 규칙
- **자기가 맡은 파일만 수정한다.** 다른 파일을 바꿔야 하면 그 파일 담당자에게 SendMessage로 요청한다.
- CONTRACT를 바꿀 권한은 리드에게만 있다. 바꿔야 하면 리드에게 제안한다.
- 남의 모듈은 CONTRACT에 적힌 G 공개 항목만 쓴다. 아직 미완성이어도 시그니처를 믿고 작성한다.
- CONTRACT에 없는 세부(인자 의미, 반환값, 호출 시점)가 애매하면 담당자와 SendMessage로 직접 맞춘다.

## 담당 파일
| 팀원 | 파일 |
|---|---|
| core | js/main.js, js/input.js, js/audio.js, js/ui.js, js/world/physics.js, js/world/level.js |
| gfx | js/gfx/sprites.js, tiles.js, font.js, background.js, lighting.js, renderer.js |
| player | js/entities/player.js, cart.js, pickups.js, particles.js |
| elements | js/entities/arrows.js, js/entities/enemies.js, js/world/effects.js, js/data/elements.js |
| levels | js/data/levels.js, js/data/hints.js, index.html, css/style.css, README.md |
| qa | 수정 권한 없음 (읽기·검사만) |

## 검사
- 파일을 끝낼 때마다 `node --check 파일경로`로 문법을 검사한다.
  - Node.js는 방금 설치되어 PATH에 없을 수 있다. `node`를 못 찾으면 Bash에서 `"/c/Program Files/nodejs/node" --check 파일경로`를 쓴다.
- 실행 확인: `index.html` 더블클릭(file://). 로컬 서버(`npx serve .`)는 선택 사항이다.
