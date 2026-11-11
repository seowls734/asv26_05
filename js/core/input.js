// input.js — 키보드·마우스·터치 입력, 속성 전환, 조준
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ================= input ================= */
const K={},P={};
// 방향키·스페이스도 같은 동작 (e.code 기준이라 한글 입력 상태에서도 작동)
const MAP={KeyA:'a',KeyD:'d',KeyW:'w',KeyQ:'q',KeyE:'e',ArrowLeft:'a',ArrowRight:'d',ArrowUp:'w',Space:'w'};
const mouse={x:240,y:96};
function setElem(i){elem=((i%unlocked)+unlocked)%unlocked;const e=ELEM[elem];$('badge').textContent=e.name+' 화살';$('badge').style.color=e.col;$('bElem').style.color=e.col;$('bElem').textContent=e.name;
  if(p.bowCharging)p.bowChargeT=Math.min(p.bowChargeT,BOWFULL-1);}
addEventListener('keydown',e=>{
  const k=MAP[e.code];
  if(k||e.code==='KeyF'||e.code==='ArrowDown')e.preventDefault();
  if(e.code==='KeyM'&&!e.repeat){muted=!muted;toast(muted?'소리 끔':'소리 켬',1200,true);return;}
  if(state==='title'){if(!e.repeat)startGame();return;}
  if(state==='ending')return; // 엔딩 연출 중에는 키 입력을 받지 않는다
  if(e.code==='KeyR'&&!e.repeat){restart();return;}
  if(e.code==='KeyF'&&!e.repeat){setElem(elem+1);sfx('swap');return;}
  const dg=/^Digit([1-8])$/.exec(e.code);if(dg){if(+dg[1]<=unlocked){setElem(+dg[1]-1);sfx('swap');}return;}
  if(k){if(!K[k]&&!e.repeat)P[k]=true;K[k]=true;}
});
addEventListener('keyup',e=>{const k=MAP[e.code];if(k)K[k]=false;});
function releaseAll(){for(const k in K)K[k]=false;moveFingers.clear();document.querySelectorAll('#touch button.on').forEach(b=>b.classList.remove('on'));aim.active=false;}
addEventListener('blur',releaseAll);
// 탭을 바꾸거나 전화가 와서 화면이 가려지면 누르고 있던 키를 모두 뗀다 (돌아왔을 때 혼자 걸어가지 않게)
document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseAll();});
// iOS 사파리는 손을 뗄 때(touchend)만 소리를 허용하는 경우가 있어 여기서도 깨운다
addEventListener('touchend',()=>audioInit(),{passive:true}); // audio.js는 이 파일보다 뒤에 로드되므로 쓰는 순간에 찾는다
const screenEl=$('screen');
function toGame(e){const r=cv.getBoundingClientRect();mouse.x=(e.clientX-r.left)/r.width*VW;mouse.y=(e.clientY-r.top)/r.height*VH;}
screenEl.addEventListener('contextmenu',e=>e.preventDefault());
screenEl.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='touch')return;
  e.preventDefault();TOUCH=true;lastTouchTime=performance.now();audioInit();
  if(state==='title')startGame();else if(state==='over'||state==='win')restart();
});
screenEl.addEventListener('mousedown',e=>{
  if(performance.now()-lastTouchTime<800)return;
  e.preventDefault();screenEl.focus();audioInit();TOUCH=false;
  if(state==='title'){startGame();return;}
  if(state==='over'||state==='win'){restart();return;}
  toGame(e);
  if(e.button===0){P.atk=true;K.atk=true;}
  else if(e.button===2){P.bowDown=true;K.bow=true;p.bowSrc='mouse';}
});
screenEl.addEventListener('mousemove',toGame);
addEventListener('mousemove',e=>{if(e.buttons)toGame(e);});
addEventListener('mouseup',e=>{if(e.button===0)K.atk=false;if(e.button===2)K.bow=false;});

const aim={active:false,dragged:false,ang:0,sx:0,sy:0};
document.querySelectorAll('#touch button').forEach(b=>{
  const k=b.dataset.k;
  if(k==='a'||k==='d')return; // ◀ ▶ 는 아래 이동 패드에서 한꺼번에 처리
  b.addEventListener('contextmenu',e=>e.preventDefault());
  b.addEventListener('pointerdown',e=>{
    e.preventDefault();TOUCH=true;lastTouchTime=performance.now();audioInit();
    if(state==='title'){startGame();return;}
    if(state==='over'||state==='win'){restart();return;}
    b.classList.add('on');
    if(k==='f'){setElem(elem+1);sfx('swap');return;}
    if(k==='bow'){try{b.setPointerCapture(e.pointerId);}catch(_){}aim.active=true;aim.dragged=false;aim.sx=e.clientX;aim.sy=e.clientY;P.bowDown=true;K.bow=true;p.bowSrc='touch';return;}
    if(!K[k])P[k]=true;K[k]=true;
  });
  b.addEventListener('pointermove',e=>{
    if(k!=='bow'||!aim.active)return;const dx=e.clientX-aim.sx,dy=e.clientY-aim.sy;
    if(Math.hypot(dx,dy)>14){aim.dragged=true;aim.ang=Math.atan2(dy,dx);}
  });
  const up=()=>{
    b.classList.remove('on');
    if(k==='bow'){aim.active=false;K.bow=false;return;}
    if(k!=='f')K[k]=false;
  };
  b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);
  if(k!=='bow')b.addEventListener('pointerleave',up);
});
// ── 이동 패드: 손가락을 떼지 않고 ◀ ▶ 사이를 미끄러뜨려도 방향이 바뀐다 ──
const moveFingers=new Map(); // pointerId → 'a' | 'd'
(function initMovePad(){
  const pad=document.querySelector('#touch .pad.move');if(!pad)return;
  const L=pad.querySelector('[data-k=a]'),R=pad.querySelector('[data-k=d]');if(!L||!R)return;
  pad.style.touchAction='none';
  // 두 버튼 사이 가운데선 왼쪽이면 ◀, 오른쪽이면 ▶
  const dirAt=x=>{const l=L.getBoundingClientRect(),r=R.getBoundingClientRect();return x<(l.right+r.left)/2?'a':'d';};
  const sync=()=>{const v=[...moveFingers.values()];
    for(const k of ['a','d']){const on=v.includes(k);if(on&&!K[k])P[k]=true;K[k]=on;}
    L.classList.toggle('on',v.includes('a'));R.classList.toggle('on',v.includes('d'));};
  pad.addEventListener('contextmenu',e=>e.preventDefault());
  pad.addEventListener('pointerdown',e=>{
    e.preventDefault();TOUCH=true;lastTouchTime=performance.now();audioInit();
    if(state==='title'){startGame();return;}
    if(state==='over'||state==='win'){restart();return;}
    try{pad.setPointerCapture(e.pointerId);}catch(_){}
    moveFingers.set(e.pointerId,dirAt(e.clientX));sync();
  });
  pad.addEventListener('pointermove',e=>{if(!moveFingers.has(e.pointerId))return;e.preventDefault();moveFingers.set(e.pointerId,dirAt(e.clientX));sync();});
  const up=e=>{if(moveFingers.delete(e.pointerId))sync();};
  pad.addEventListener('pointerup',up);pad.addEventListener('pointercancel',up);pad.addEventListener('lostpointercapture',up);
})();
const CT=()=>TOUCH?{atk:'검 버튼',bow:'활 버튼(끌어서 조준)',el:'속성 버튼',bowHold:'활 버튼을'}:{atk:'좌클릭',bow:'우클릭(마우스 조준)',el:'F 키',bowHold:'우클릭을'};
function currentAim(){
  const cx=p.x+p.w/2,cy=p.y+6;
  if(p.bowSrc==='touch')return aim.dragged?aim.ang:(p.face>0?0:Math.PI);
  return Math.atan2(mouse.y-cy,mouse.x+cam-cx);
}
