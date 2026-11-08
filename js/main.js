// main.js — 게임 한 프레임(step), 시작, 고정 60fps 루프, 디버그 훅
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

function step(){
  frame++;
  if(state==='trans'){fade+=.05;if(fade>=1){fade=1;if(lvlIndex+1<LEVELS.length){loadLevel(lvlIndex+1);state='play';}
    else{state='win';overlay('시즌 1 클리어!','엘프 기사는 고대 돌골렘을 쓰러뜨리고 초록 코어를 손에 넣었습니다. 모은 동전 '+p.coins+'개.','R 키를 누르거나 화면을 눌러 처음부터');}}return;}
  if(fade>0)fade=Math.max(0,fade-.05);
  if(state!=='play'){updateParticles();if(shake>0)shake*=.85;return;}
  if(freeze>0){freeze--;return;}
  updateCart();updatePlayer();updateArrows();updateEnemies();updateBoss();updateBossHaz();updateGolem();updateSummons();updateBlocks();updatePuzzles();updateCoins();updateWorld();updateParticles();
  const target=p.x+p.w/2-VW/2+p.face*24;cam+=(target-cam)*.1;cam=Math.max(0,Math.min(W*TS-VW,cam));
  if(shake>0){shake*=.85;if(shake<.3)shake=0;}
}

/* ================= loop ================= */
setElem(0);loadLevel(0);$('toast').style.opacity=0;clearTimeout(toastTimer);toastTimer=null;
window.__dbg={hitBoss(n){if(boss)dmgEnemy(boss,n,0,false,true);},get lvl(){return lvlIndex},get hasUp(){return hasUp},get canCh(){return canCh},get gotCount(){return gotCount},setGot(n){gotCount=n;applyAbilities();},get boss(){return boss},get bossHaz(){return bossHaz},get unlocked(){return unlocked},loadLevel:i=>{loadLevel(i);state='play';$('overlay').hidden=true;},p,get grid(){return grid},get links(){return links},get blocks(){return blocks},get enemies(){return enemies},get summons(){return summons},get golem(){return golem},
  setElem,shoot:(ang,ch)=>{p.shootCD=0;return shoot(ang,ch);},K,P,warp:(col,row)=>{p.x=col*TS+3;p.y=(row??9)*TS+2;p.vx=p.vy=0;cam=Math.max(0,Math.min(W*TS-VW,p.x-VW/2));},cell:(x,y)=>cell(x,y),get state(){return state}};
// 검수용: index.html?level=3 처럼 붙이면 그 스테이지에서 바로 시작 (능력은 그 스테이지에 처음 들어갈 때와 같음)
{const n=parseInt(new URLSearchParams(location.search).get("level"),10);
 if(n>=1&&n<=LEVELS.length){loadLevel(n-1);state="play";$("overlay").hidden=true;}}
let acc=0,last=performance.now(),lastErr="";
// 한 프레임에서 에러가 나도 루프가 멈추지 않게 하고, 같은 에러는 한 번만 화면에 보여준다
function reportError(err){console.error(err);const m=(err&&err.message)||String(err);if(m!==lastErr){lastErr=m;if(typeof showFatal==="function")showFatal(m);}}
function loop(now){
  acc+=Math.min(100,now-last);last=now;
  while(acc>=1000/60){try{step();}catch(err){reportError(err);}for(const k in P)P[k]=false;acc-=1000/60;}
  try{draw();}catch(err){reportError(err);}
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
