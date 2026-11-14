// ending.js — 시즌 1 엔딩 연출 (풀밭에 누운 기사 → 암전 → "끝인 줄 알았다" → 마왕 → The End)
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ================= ending ================= */
// 장면 시간표 (프레임, 60fps)
const END_T={fadeIn:90,caption1:150,caption2:330,toBlack:560,black:620,line:680,demon:900,eyes:900,demonFull:1080,theEnd:1260,hint:1400};
const END_LINE='끝인 줄 알았다…';
const END_THE='The End';
let ending=null;

// 마왕 스프라이트: 왼쪽 절반(12칸)만 적고 좌우 대칭으로 펼친다
const DEMON=(()=>{
  const half=[
    ".h..........",
    ".hh.........",
    "..hh........",
    "..Hhh....g.g",
    "...Hhh.kgggg",
    "....Hhkkkkkk",
    ".....Hksssss",
    "......ksEess",
    "......kseess",
    "......kssswk",
    ".......kkkkk",
    "...ccckaAAAa",
    "..cCckaAAaaa",
    ".cCcckaAaaar",
    ".cCcckaAaaaa",
    "cCCcckkaAaaa",
    "cCCcksskaaak",
    "cCCcksskkkkk",
    "cCCcckkkgggg",
    "cCCccckaaaak",
    "cCCccckaAaak",
    "cCCcccckaAak",
    "cCCcccckaAak",
    "cCCccccckaak",
    "cCCcCcccckak",
    "cCcCcCcccckk",
    "kcCcCcCcccck",
    ".kkcCkcCkcck",
    "...kk.kk.kkk"];
  const rows=half.map(r=>r+r.split('').reverse().join(''));
  return sprite(rows,{k:'#07040c',c:'#2a1238',C:'#4a1f5e',h:'#d8d0c0',H:'#8a8070',s:'#3a2a4a',E:'#ffd0d0',e:'#ff2a2a',w:'#ece7f5',a:'#3b3550',A:'#6a648a',g:'#c9a24a',r:'#ff2a2a'});
})();
// 마왕 실루엣(검은색) — 처음엔 그림자만 보이게
const DEMON_SIL=tinted(DEMON,'#000000');

function startEnding(){
  ending={t:0,clouds:Array.from({length:6},(_,i)=>({x:i*64+Math.random()*30,y:12+Math.random()*50,w:20+Math.random()*26,s:.08+Math.random()*.12})),
    leaves:[],shook:false};
  try{localStorage.setItem('pk_season2','1');}catch(_){}
  state='ending';$('overlay').hidden=true;$('toast').style.opacity=0;$('bossbar').hidden=true;$('badge').hidden=true;screenEl.classList.remove('bossfight');
}
function endEnding(){ending=null;clearEndText();$('badge').hidden=false;}
function updateEnding(){
  if(ending.kind==='s2'){updateEnding2();return;}   // 시즌 2 엔딩은 ending2.js
  const E=ending;E.t++;
  for(const c of E.clouds){c.x+=c.s;if(c.x>VW+40)c.x=-60;}
  if(E.t<END_T.black&&E.t%14===0)E.leaves.push({x:-6,y:20+Math.random()*90,vx:.5+Math.random()*.5,ph:Math.random()*6});
  for(const l of E.leaves){l.x+=l.vx;l.y+=Math.sin(l.ph+E.t*.05)*.3+.12;}
  E.leaves=E.leaves.filter(l=>l.x<VW+8);
  if(E.t===END_T.line)sfx('wrong');
  if(E.t===END_T.eyes)sfx('screech');
  if(E.t===END_T.eyes+100){sfx('rumble');shake=6;}
  if(E.t===END_T.demonFull){sfx('roar');shake=8;}
  if(E.t===END_T.theEnd)sfx('seal');
  if(shake>0){shake*=.92;if(shake<.3)shake=0;}
  // The End가 뜬 뒤엔 'win' 상태로 바꿔 키·화면 누르기로 처음부터 다시 할 수 있게 한다
  if(E.t===END_T.hint)state='win';
}
// 한글은 320×192 캔버스에서 뭉개지므로 화면 위에 HTML 글자로 띄운다
const endSlots={};
function endText(slot,s,y,size,col,alpha){
  let el=endSlots[slot];
  if(!el){el=endSlots[slot]=document.createElement('div');el.className='endtxt';screenEl.appendChild(el);}
  const a=Math.max(0,Math.min(1,alpha));el.hidden=a<=0;if(a<=0)return;
  if(el.textContent!==s)el.textContent=s;
  el.style.top=(y/VH*100)+'%';el.style.color=col;el.style.opacity=a;
  el.style.fontSize=(size*cv.clientWidth/VW)+'px';
}
function clearEndText(){for(const k in endSlots){endSlots[k].remove();delete endSlots[k];}}
// 캔버스에 직접 그리는 글자 (픽셀 글꼴용)
function endPixelText(s,x,y,size,col,font,alpha){
  ctx.globalAlpha=Math.max(0,Math.min(1,alpha));ctx.font=size+'px '+font;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle='#120f1c';ctx.fillText(s,x+1,y+1);ctx.fillStyle=col;ctx.fillText(s,x,y);
  ctx.globalAlpha=1;ctx.textAlign='left';ctx.textBaseline='alphabetic';
}
function drawEndingField(t){
  // 하늘
  const g=ctx.createLinearGradient(0,0,0,140);g.addColorStop(0,'#4a8fd8');g.addColorStop(1,'#bfe4ff');
  ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  // 해
  ctx.fillStyle='#fff6c8';ctx.beginPath();ctx.arc(256,34,13,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=.25;ctx.beginPath();ctx.arc(256,34,19+Math.sin(t*.03)*2,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  // 구름
  ctx.fillStyle='#ffffff';
  for(const c of ending.clouds){const x=Math.round(c.x),y=Math.round(c.y),w=Math.round(c.w);
    ctx.fillRect(x,y+4,w,5);ctx.fillRect(x+4,y+1,w-10,4);ctx.fillRect(x+w*.3|0,y-2,w*.35|0,4);}
  // 먼 언덕
  ctx.fillStyle='#7cc46a';ctx.beginPath();ctx.moveTo(0,130);
  for(let x=0;x<=VW;x+=8)ctx.lineTo(x,118+Math.sin(x*.025)*8+Math.sin(x*.07)*3);ctx.lineTo(VW,VH);ctx.lineTo(0,VH);ctx.fill();
  // 풀밭
  ctx.fillStyle='#4fae5a';ctx.fillRect(0,140,VW,VH-140);
  ctx.fillStyle='#3f9a4c';ctx.fillRect(0,166,VW,VH-166);
  // 흔들리는 풀잎과 꽃
  const r=rng(9);
  for(let i=0;i<90;i++){const x=Math.round(r()*VW),y=138+Math.round(r()*50),h=2+Math.round(r()*3),sw=Math.round(Math.sin(t*.04+x*.1)*1);
    ctx.fillStyle=r()<.5?'#6fdc5a':'#2f7a3d';ctx.fillRect(x,y-h,1,h);ctx.fillRect(x+sw,y-h-1,1,1);
    if(r()<.12){ctx.fillStyle=r()<.5?'#ffd34d':'#ff9ac8';ctx.fillRect(x+1,y-h-2,2,2);}}
  // 날리는 나뭇잎
  ctx.fillStyle='#6fdc5a';for(const l of ending.leaves)ctx.fillRect(Math.round(l.x),Math.round(l.y),2,1);
  // 풀밭에 누워 하늘을 보는 기사 (스프라이트를 반시계로 90도 눕힘: 머리는 왼쪽, 얼굴은 하늘)
  // 2배 크기로 그리고, 숨 쉴 때 몸이 한 칸씩 들썩인다
  const px=150,py=150,breath=Math.sin(t*.05)>0?1:0;
  ctx.save();ctx.translate(px,py-breath);ctx.scale(2,2);ctx.rotate(-Math.PI/2);ctx.drawImage(PSPR.idle.r,-6,-8);ctx.restore();
  // 곁에 놓인 초록 코어
  const gl=.5+Math.sin(t*.08)*.3,cx=px+22,cy=py+4;
  ctx.globalAlpha=gl*.5;ctx.fillStyle='#3aff7a';ctx.fillRect(cx-1,cy-1,9,9);ctx.globalAlpha=1;
  ctx.fillStyle='#1a1626';ctx.fillRect(cx,cy,7,7);ctx.fillStyle='#3aff7a';ctx.fillRect(cx+1,cy+1,5,5);ctx.fillStyle='#d8ffe0';ctx.fillRect(cx+1,cy+1,2,1);
}
function drawEndingDemon(t){
  const s=3,dw=DEMON.width*s,dh=DEMON.height*s,dx=Math.round(VW/2-dw/2),dy=44;
  const sx=shake?Math.round((Math.random()-.5)*shake):0,sy=shake?Math.round((Math.random()-.5)*shake):0;
  // 붉은 기운
  const k=Math.min(1,(t-END_T.demon)/(END_T.demonFull-END_T.demon));
  if(t>END_T.eyes+100){const rg=ctx.createRadialGradient(VW/2,dy+dh/2,8,VW/2,dy+dh/2,120);
    rg.addColorStop(0,'rgba(120,10,30,'+(.55*k)+')');rg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,VW,VH);}
  ctx.save();ctx.imageSmoothingEnabled=false;
  // 그림자 → 서서히 모습이 드러남
  if(t>END_T.eyes+100){
    ctx.globalAlpha=Math.min(1,(t-END_T.eyes-100)/60);ctx.drawImage(DEMON_SIL,dx+sx,dy+sy,dw,dh);
    ctx.globalAlpha=Math.max(0,(t-END_T.eyes-160)/(END_T.demonFull-END_T.eyes-160));ctx.drawImage(DEMON,dx+sx,dy+sy,dw,dh);}
  ctx.restore();ctx.globalAlpha=1;
  // 어둠 속에서 먼저 빛나는 두 눈
  const ea=Math.min(1,(t-END_T.eyes)/40)*(t<END_T.demonFull?1:Math.max(0,1-(t-END_T.demonFull)/40));
  if(ea>0){const blink=(t-END_T.eyes)%150<6;if(!blink){ctx.globalAlpha=ea;ctx.fillStyle='#ff2a2a';
    for(const ex of [8,14]){ctx.fillRect(dx+sx+ex*s+(ex===8?0:s),dy+sy+7*s,s*2,s*2);}
    ctx.globalAlpha=ea*.35;for(const ex of [8,14])ctx.fillRect(dx+sx+ex*s+(ex===8?0:s)-2,dy+sy+7*s-2,s*2+4,s*2+4);ctx.globalAlpha=1;}}
}
function drawEnding(){
  if(ending.kind==='s2'){drawEnding2();return;}
  const E=ending,t=E.t;
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  if(t<END_T.black){
    drawEndingField(t);
    endText('a','고대 돌골렘이 쓰러지고, 숲에 평화가 찾아왔다.',20,11,'#ffffff',Math.min((t-END_T.caption1)/40,(END_T.toBlack-t)/30));
    endText('b','기사는 풀밭에 누워 오랜만에 하늘을 올려다보았다.',36,11,'#ffffff',Math.min((t-END_T.caption2)/40,(END_T.toBlack-t)/30));
    // 처음엔 검은 화면에서 밝아지고, 끝에 다시 어두워진다
    const dark=t<END_T.fadeIn?1-t/END_T.fadeIn:t>END_T.toBlack?(t-END_T.toBlack)/(END_T.black-END_T.toBlack):0;
    if(dark>0){ctx.fillStyle='rgba(0,0,0,'+Math.min(1,dark)+')';ctx.fillRect(0,0,VW,VH);}
    return;
  }
  endText('a','',0,11,'#fff',0);endText('b','',0,11,'#fff',0);
  ctx.fillStyle='#000000';ctx.fillRect(0,0,VW,VH);
  if(t>=END_T.eyes)drawEndingDemon(t);
  // "끝인 줄 알았다…" 한 글자씩
  if(t>=END_T.line){const n=Math.min(END_LINE.length,Math.floor((t-END_T.line)/9)+1);
    const a=t<END_T.theEnd?1:Math.max(0,1-(t-END_T.theEnd)/40);
    // 아직 안 나온 글자는 투명하게 두어 가운데 위치가 흔들리지 않게 한다
    endText('line','',t<END_T.eyes?VH/2:22,16,'#ece7f5',a);
    endSlots.line.innerHTML=END_LINE.slice(0,n)+'<span style="opacity:0">'+END_LINE.slice(n)+'</span>';}
  if(t>=END_T.theEnd){
    endPixelText(END_THE,VW/2,152,20,'#ffd34d','Silkscreen, monospace',(t-END_T.theEnd)/50);
    endText('coins','모은 동전 '+p.coins+'개',168,10,'#bdb6d0',(t-END_T.theEnd-40)/50);}
  endText('hint',(TOUCH?'화면을 눌러':'R 키를 누르거나 화면을 눌러')+' 시즌 2로',182,9,'#8e8a9e',t>=END_T.hint&&Math.floor((t-END_T.hint)/30)%2===0?1:0);
}
