// ui.js — 토스트, 오버레이, 시작·재시작
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ================= ui ================= */
let toastTimer=null,toastQ=[];
function toast(msg,ms=2000,now=false){if(now){toastQ=[];show(msg,ms);return;}if(toastTimer)toastQ.push([msg,ms]);else show(msg,ms);}
function show(msg,ms){const el=$('toast');el.textContent=msg;el.style.opacity=1;clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{el.style.opacity=0;toastTimer=null;const n=toastQ.shift();if(n)setTimeout(()=>show(n[0],n[1]),200);},ms);}
function overlay(title,text,hint){$('ovTitle').textContent=title;$('ovText').textContent=text;$('ovHint').textContent=hint;$('overlay').hidden=false;}
function startGame(){audioInit();if(ending)endEnding();p.coins=0;p.hp=p.maxHp;loadLevel(0);state='play';$('overlay').hidden=true;}
function restart(){audioInit();if(state==='win'){startGame();return;}p.hp=p.maxHp;p.coins=levelStartCoins;loadLevel(lvlIndex);state='play';$('overlay').hidden=true;}
