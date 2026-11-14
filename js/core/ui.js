// ui.js — 토스트, 오버레이, 시작·재시작
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ================= ui ================= */
let toastTimer=null,toastQ=[];
function toast(msg,ms=2000,now=false){if(now){toastQ=[];show(msg,ms);return;}if(toastTimer)toastQ.push([msg,ms]);else show(msg,ms);}
function show(msg,ms){const el=$('toast');el.textContent=msg;el.style.opacity=1;clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{el.style.opacity=0;toastTimer=null;const n=toastQ.shift();if(n)setTimeout(()=>show(n[0],n[1]),200);},ms);}
function overlay(title,text,hint){$('ovTitle').textContent=title;$('ovText').textContent=text;$('ovHint').textContent=hint;$('overlay').hidden=false;}
function startGame(){audioInit();if(ending)endEnding();$('s2btn').hidden=true;p.coins=0;p.hp=p.maxHp;loadLevel(0);state='play';$('overlay').hidden=true;}
// 시즌 2는 LEVELS의 11번째(2-1)부터
const S2_START=10;
function s2Unlocked(){try{return localStorage.getItem('pk_season2')==='1';}catch(_){return false;}}
function startSeason2(){audioInit();if(ending)endEnding();if(state==='title')p.coins=0;p.hp=p.maxHp;loadLevel(S2_START);state='play';$('overlay').hidden=true;$('s2btn').hidden=true;}
function restart(){audioInit();if(state==='win'){
  // 시즌 2 엔딩 뒤에는 제목 화면으로 (새로 불러오기)
  if(ending&&ending.kind==='s2'){location.reload();return;}
  if(ending)startSeason2();else startGame();return;}p.hp=p.maxHp;p.coins=levelStartCoins;loadLevel(lvlIndex);state='play';$('overlay').hidden=true;}
