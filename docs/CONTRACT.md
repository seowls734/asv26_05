# CONTRACT — 모듈 간 약속

이 문서를 바꿀 권한은 리드에게만 있다. 바꿔야 하면 리드에게 제안한다.

## 공통 방식 — 전역 G 네임스페이스 + 일반 script
- 각 파일은 `(function (G) { 'use strict'; … })(window.G = window.G || {});` 로 감싸고, 공개할 것만 G에 붙인다.
- 다른 파일의 함수는 파일 맨 위에서 미리 꺼내 두지 말고 **쓰는 순간에** `G.xxx.fn()` 으로 부른다(로딩 순서·순환 참조로 undefined가 되지 않게).
  - 예외: 먼저 로드되는 상수 데이터 `G.config`, `G.S`, `G.tiledefs`, `G.sprites`, `G.ELEM`, `G.LEVELS` 는 맨 위에서 `const TS = G.config.TS;` 처럼 미리 꺼내도 된다.
- 파일을 불러오는 순간(최상위)에는 다른 파일의 함수를 부르지 않는다. 게임 시작은 main.js 마지막 줄의 `G.main.boot()` 하나뿐이다.
- 로딩 순서는 index.html의 `<script>` 순서가 기준이다. 새 파일을 추가하면 그 순서에도 넣는다.
- `G.fatal(msg)`: index.html의 인라인 스크립트가 정의. 에러를 오버레이에 빨간 글씨로 보여준다.

```
js/config.js     (리드 완성)  → G.config
  G.config = { TS:16, VW:320, VH:192, ROWS:12, FULL_CHARGE:180,
    PHYS:{gravity:.36,maxFall:7,jump:-6.5,speed:1.7,accGround:.35,accAir:.2,
      coyote:6,jumpBuf:7,dashT:10,dashSpeed:4.6,dashCD:36,slashCD:18,shootCD:16,arrowSpeed:5.6,arrowGrav:.06} }

js/state.js      (리드 완성)  → G.S — 모든 모듈이 공유하는 단 하나의 상태 객체 (바꿔치기 금지, 필드만 변경)
  G.S = { mode:'title'|'play'|'trans'|'over'|'win', frame, cam, shake, freeze, fade,
    lvl, lvlIndex, grid:string[][], W, player, enemies:[], arrows:[], coins:[], items:[], particles:[],
    fx:[], trees:[], trunks:Set<"x,y">, lanterns:[{tx,ty,lit}], cart:null|{x,y,w,h,vx,min,max}, rail:null|{row,x0,x1},
    elem:0..5, hintsDone:Set, levelStartCoins, lastSafe:{x,y}, flags:{cartHint,grassHint,muted} }

js/world/tiledefs.js (리드 완성)  → G.tiledefs
  G.tiledefs = { SOLID:Set('#','B','D','o','T','b','i','R','Z','z','G'), ONEWAY:Set('=','f'),
                 SAFE:Set('#','o','=','f','Z','z'), isGround(c) => c==='#'||c==='o' }

core
  G.physics = { cell(tx,ty), solid(tx,ty), oneway(tx,ty), overlap(a,b), moveBody(b,dx,dy) -> {hitX,ground,hitY} }
  G.input   = { K (누르고 있는 키: a,d,w,q,e,atk), P (이번 step에 눌림: 같은 키 + shoot:number|false),
                aim {active,dragged,ang}, isTouch(), initInput(), clearPressed() }
  G.audio   = { audioInit(), sfx(name), toggleMute() }
  G.ui      = { toast(msg,ms=2000,now=false), showOverlay(title,text,hint), hideOverlay(), setBadge(i), setStage(code,name) }
  G.level   = { loadLevel(i), restartLevel(), startGame() }
  G.main    = { boot() }  고정 60fps 루프와 step 순서
              → updateCart → updatePlayer → updateArrows → updateEnemies → updatePickups → updateEffects → updateParticles → 카메라
              디버그 훅: window.__game = {S, loadLevel}, URL ?level=2 로 바로 시작
gfx
  G.sprites = { sprite(rows,pal), variants(src) -> {r,l,wr,wl,ice,yel},
                PSPR, SLASH, GIANT, BOW, SLIME, BAT, COIN, KEY, HEART, HEART_E }
  G.renderer = { draw() }
  G.tiles, G.font, G.background, G.lighting — renderer 안에서만 사용 (gfx 내부)
player
  G.player    = { resetPlayer(x,y), updatePlayer(), hurtPlayer(srcX), hazardHit() }
  G.cart      = { makeCart(rail), updateCart() }
  G.pickups   = { dropCoin(x,y), updatePickups() }
  G.particles = { puff(x,y,n,col,spd=1.2,g=.05,life=24), addParticle(p), updateParticles() }
elements
  G.ELEM    = [{id,name,col}] × 6
  G.arrows  = { shoot(ang), updateArrows() }
  G.enemies = { mkEnemy(type,x,y), updateEnemies(), dmgEnemy(e,n,kx,dot), meleeEnemy(e,n,kx) }
  G.effects = { ignite, freezeWater, meltAt, power, growTree, lightLantern (모두 (tx,ty)를 받음), updateEffects() }
levels
  G.LEVELS = [{code,name,w,bg,dark?,rail?,pal,hints:[[col,key]],build(L)}]
  G.HINT   = { [key](ctrl) }, G.HINT.ctrlNames(isTouch) -> {atk,bow,el}
```

## 리드 보충 (통합 중 승인한 추가 사항 — 모두 기존 시그니처와 호환)
- `G.input.P` 추가 필드: `atkUp`(검 입력을 뗀 순간, player가 거대한 검 발동에 사용), `f`, `num`(1~6), `r`, `m`, `any`(오버레이 진행) — f/num/r/m/any는 main 전용.
- `G.level` 선택 인자: `loadLevel(i, keep?)` keep={hp,coins}, `restartLevel(full=false)` (게임오버 뒤 true: 체력 가득), `startGame(i=0)`. 인자 없이 부르면 원래 동작.
  - R 다시 시작은 스테이지 시작 시점 체력·동전으로 되돌림. `S.hintsDone`은 새 게임에서만 초기화.
- `G.ui.clearToasts()` — core 내부용.
- `G.physics.moveBody`는 `b.dropThrough===true`면 일방통행 발판을 무시. b.vx/vy는 건드리지 않음.
- level.js가 만드는 맵 동전에는 `static:true`.
- `G.enemies.mkEnemy`는 객체만 반환(push는 level.js). 적 객체 내부 필드 `kb`, `oy` 추가.
- `G.enemies.dmgEnemy(e,n,kx,dot)`: kx는 부호 있는 넉백 속도, dot=true면 넉백·효과음 없음, 이번 피해로 죽으면 true 반환.
- `G.arrows.shoot(ang)`: ang는 라디안, `sfx('bow')`는 shoot 안에서 호출.
- `G.sprites` 추가: `SLIME_B`, `BAT_B`, `COIN_B`(애니 프레임), variants 결과에 `icel`, `yell`, `w`, `h` — gfx 내부용.
- `G.lighting.drawLighting(ctx,S,cam,t,ox=0,oy=0)`: ox/oy는 흔들림 오프셋 — gfx 내부용.
- `G.ELEM` 순서: normal, ice, fire, elec, grass, light. 배지 문구 = name + ' 화살'.
