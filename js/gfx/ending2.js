// ending2.js — 시즌 2 엔딩 연출 (무너지는 마왕성 → 성벽 부수고 탈출 → 큰 나무 오르기 → 노을 → 시즌 3 제작중)
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.
// ending.js의 ending 변수·endText·endPixelText·clearEndText를 함께 쓴다 (ending.kind==='s2').

/* ================= ending 2 ================= */
// 장면 시간표 (프레임, 60fps)
const E2_T={
  // 1장: 마왕성
  runToWall:60,charge:150,smash:230,runOut:262,castleOut:420,toForest:480,
  // 2장: 숲과 큰 나무
  forestRun:480,climb:570,branch:880,sit:940,camFrom:600,camTo:1000,
  // 3장: 노을
  sunset:1100,theEnd:1720,season3:1860,hint:2000};
const E2_FLOOR=160,E2_WALL=236,E2_HOLE={x:E2_WALL,y:100,w:VW-E2_WALL,h:E2_FLOOR-100};
const E2_GROUND=390,E2_BRANCH=190,E2_TRUNK=50;
// 나뭇가지에 걸터앉은 기사 (허벅지는 앞으로, 정강이는 아래로)
const E2_SIT=sprite(PTOP.concat(["..kddddddk..","..kkkkkkdk..","........kdk.","........klk.","........kkk."]),PPAL);

function startEnding2(){
  ending={kind:'s2',t:0,parts:[],rocks:[],birds:[],motes:[],smoke:[],
    clouds:Array.from({length:7},(_,i)=>({x:i*56+Math.random()*30,y:34+Math.random()*52,w:30+Math.random()*40,s:.04+Math.random()*.06}))};
  for(let i=0;i<7;i++){const row=Math.abs(i-3);ending.birds.push({dx:-row*9,dy:row*5,ph:Math.random()*6});}
  try{localStorage.setItem('pk_season3_tease','1');}catch(_){}
  state='ending';$('overlay').hidden=true;$('toast').style.opacity=0;$('bossbar').hidden=true;$('badge').hidden=true;screenEl.classList.remove('bossfight');
}
const e2Smooth=k=>{k=Math.max(0,Math.min(1,k));return k*k*(3-2*k);};
const e2Lerp=(a,b,k)=>a+(b-a)*Math.max(0,Math.min(1,k));

// 기사의 위치·모습 (1장은 화면 좌표, 2장은 나무 세계 좌표: 발끝 y)
function e2Knight(t){
  const T=E2_T;
  if(t<T.toForest){
    if(t<T.runToWall)return {x:30,feet:E2_FLOOR,spr:'idle',face:1};
    if(t<T.runToWall+80)return {x:e2Lerp(30,190,(t-T.runToWall)/80),feet:E2_FLOOR,spr:Math.floor(t/5)%2?'run1':'run2',face:1};
    if(t<T.runOut)return {x:190,feet:E2_FLOOR,spr:'idle',face:1};
    return {x:e2Lerp(190,350,(t-T.runOut)/120),feet:E2_FLOOR,spr:Math.floor(t/4)%2?'run1':'run2',face:1};
  }
  if(t<T.climb){const k=(t-T.forestRun)/(T.climb-10-T.forestRun);
    return {x:e2Lerp(-14,E2_TRUNK-2,k),feet:E2_GROUND,spr:k<1?(Math.floor(t/5)%2?'run1':'run2'):'idle',face:1};}
  if(t<T.branch){const k=(t-T.climb)/(T.branch-T.climb);
    // 손발을 번갈아 뻗으며 조금씩 올라간다
    const step=Math.floor(t/9)%2;
    return {x:E2_TRUNK+3,feet:e2Lerp(E2_GROUND,E2_BRANCH,k)-step,spr:step?'jump':'fall',face:1};}
  if(t<T.sit)return {x:e2Lerp(E2_TRUNK+3,92,(t-T.branch)/(T.sit-T.branch)),feet:E2_BRANCH,spr:Math.floor(t/7)%2?'run1':'run2',face:1};
  return {x:92,feet:E2_BRANCH,spr:'sit',face:1};
}

function updateEnding2(){
  const E=ending,t=++E.t,T=E2_T;
  // 1장: 무너지는 천장에서 돌이 떨어진다
  if(t<T.castleOut){
    if(t%(t>T.smash?5:9)===0)E.rocks.push({x:Math.random()*VW,y:-6,vy:.5+Math.random(),s:2+Math.floor(Math.random()*3)});
    if(t%70===20){sfx('rumble');shake=Math.max(shake,4);}
  }
  for(const r of E.rocks){r.vy+=.18;r.y+=r.vy;
    if(r.y>=E2_FLOOR-r.s){r.dead=true;for(let i=0;i<4;i++)E.parts.push({x:r.x,y:E2_FLOOR-1,vx:(Math.random()-.5)*1.6,vy:-Math.random()*1.4,g:.12,life:18,max:18,c:'#6a5a7a',s:1});}}
  E.rocks=E.rocks.filter(r=>!r.dead);
  if(t===T.runToWall)sfx('dash');
  if(t===T.charge)sfx('charged');
  if(t>T.charge&&t<T.smash&&t%3===0){const a=Math.random()*6.28;E.parts.push({x:196+Math.cos(a)*16,y:150+Math.sin(a)*16,vx:-Math.cos(a)*.9,vy:-Math.sin(a)*.9,g:0,life:16,max:16,c:'#ffd34d',s:1});}
  // 성벽이 부서지며 벽돌이 바깥으로 날아간다
  if(t===T.smash){sfx('giant');sfx('boom');shake=12;
    for(let i=0;i<60;i++){const y=E2_HOLE.y+Math.random()*E2_HOLE.h;
      E.parts.push({x:E2_WALL+Math.random()*30,y,vx:1+Math.random()*4,vy:-1-Math.random()*3,g:.2,life:70,max:70,c:Math.random()<.5?'#5a4a6a':'#7a6a8a',s:2+Math.floor(Math.random()*3),brick:1});}
    for(let i=0;i<30;i++)E.parts.push({x:E2_WALL+8,y:E2_HOLE.y+Math.random()*E2_HOLE.h,vx:Math.random()*2.5,vy:(Math.random()-.5)*1.5,g:-.01,life:50,max:50,c:'#c9c2dc',s:2});}
  if(t===T.runOut)sfx('dash');
  if(t===T.castleOut-30){sfx('rumble');shake=8;}
  // 2장: 숨 고르기 — 입김
  if(t>=T.sit&&t<T.sit+330&&t%(t<T.sit+150?18:32)===0){const k=e2Knight(t);E.parts.push({x:k.x+11,y:k.feet-11,vx:.35,vy:-.25,g:-.005,life:40,max:40,c:'#ffffff',s:2,breath:1});}
  if(t===T.sit)sfx('push');
  // 3장: 노을 — 빛 알갱이, 무너진 마왕성의 연기
  if(t>=T.camFrom&&t%7===0)E.motes.push({x:Math.random()*VW,y:VH+4,vy:-.15-Math.random()*.25,ph:Math.random()*6,life:600});
  for(const m of E.motes){m.y+=m.vy;m.life--;}
  E.motes=E.motes.filter(m=>m.life>0&&m.y>-4);
  if(t>=T.camFrom&&t%5===0)E.smoke.push({x:0,y:0,r:1,life:160});
  for(const s of E.smoke){s.x+=.03;s.y-=.06;s.r+=.012;s.life--;}
  E.smoke=E.smoke.filter(s=>s.life>0);
  for(const c of E.clouds){c.x+=c.s;if(c.x>VW+40)c.x=-80;}
  for(const q of E.parts){q.vy+=q.g;q.x+=q.vx;q.y+=q.vy;q.life--;if(q.brick&&q.y>E2_FLOOR+30)q.life=0;}
  E.parts=E.parts.filter(q=>q.life>0);
  if(t===T.theEnd)sfx('seal');
  if(t===T.season3)sfx('solve');
  if(shake>0){shake*=.9;if(shake<.3)shake=0;}
  // 안내가 뜬 뒤엔 'win' 상태로 바꿔 키·화면 누르기로 처음으로 돌아갈 수 있게 한다
  if(t===T.hint)state='win';
}

function e2DrawKnight(k,sx,sy){
  const x=Math.round(k.x+sx),y=Math.round(k.feet+sy);
  if(k.spr==='sit'){const bob=ending.t<E2_T.sit+200?(Math.floor(ending.t/14)%2):(Math.floor(ending.t/40)%2);
    ctx.drawImage(E2_SIT,x,y-13+bob,E2_SIT.width,E2_SIT.height-bob);return;}
  const s=PSPR[k.spr];ctx.drawImage(k.face>0?s.r:s.l,x,y-16);
}
function e2DrawParts(sx,sy,filter){
  for(const q of ending.parts){if(filter&&!filter(q))continue;
    ctx.globalAlpha=q.breath?q.life/q.max*.7:Math.min(1,q.life/q.max*2);ctx.fillStyle=q.c;ctx.fillRect(Math.round(q.x+sx),Math.round(q.y+sy),q.s,q.s);}
  ctx.globalAlpha=1;
}

/* ---------- 1장: 무너지는 마왕성 ---------- */
function e2DrawCastle(t){
  const T=E2_T,sx=shake?Math.round((Math.random()-.5)*shake):0,sy=shake?Math.round((Math.random()-.5)*shake):0;
  // 구멍 너머 바깥: 붉은 밤하늘, 달, 먼 산
  const g=ctx.createLinearGradient(0,0,0,VH);g.addColorStop(0,'#14060e');g.addColorStop(.6,'#5a0f1e');g.addColorStop(1,'#a8321e');
  ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  ctx.fillStyle='#ffd0b0';ctx.beginPath();ctx.arc(292,72,9,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#2a0a14';ctx.beginPath();ctx.moveTo(E2_WALL,VH);
  for(let x=E2_WALL;x<=VW;x+=6)ctx.lineTo(x,136+Math.sin(x*.08)*6+Math.sin(x*.21)*3);ctx.lineTo(VW,VH);ctx.fill();
  ctx.fillStyle='#14060e';ctx.fillRect(E2_WALL,E2_FLOOR,VW-E2_WALL,VH-E2_FLOOR);
  // 성 안: 부서진 뒤에는 벽에 구멍을 낸다
  ctx.save();ctx.translate(sx,sy);
  const broken=t>=T.smash;
  if(broken){ctx.beginPath();ctx.rect(-20,-20,VW+40,VH+40);
    // 들쭉날쭉한 구멍
    const h=E2_HOLE;ctx.moveTo(h.x,h.y+6);for(let i=0;i<=8;i++){const x=h.x+i*h.w/8;ctx.lineTo(x,h.y+((i*7)%3)*4);}
    ctx.lineTo(VW+20,h.y);ctx.lineTo(VW+20,h.y+h.h);ctx.lineTo(h.x,h.y+h.h);ctx.closePath();ctx.clip('evenodd');}
  // 안쪽 벽
  ctx.fillStyle='#1f1428';ctx.fillRect(-20,-20,VW+40,VH+40);
  const r=rng(31);
  for(let y=0;y<E2_FLOOR;y+=8)for(let x=((y/8)%2)*8-16;x<E2_WALL;x+=16){ctx.fillStyle=r()<.5?'#2a1c36':'#251830';ctx.fillRect(x+1,y+1,14,6);}
  // 기둥과 횃불
  for(const px of [70,150]){ctx.fillStyle='#120c1a';ctx.fillRect(px,0,12,E2_FLOOR);ctx.fillStyle='#3a2a4a';ctx.fillRect(px+1,0,1,E2_FLOOR);
    const fl=Math.sin(t*.4+px)*1.5;ctx.fillStyle='#7a4f2b';ctx.fillRect(px+4,80,4,6);
    ctx.globalAlpha=.18;ctx.fillStyle='#ff9a3a';ctx.beginPath();ctx.arc(px+6,76,18+fl,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle='#ff7a2a';ctx.fillRect(px+3,74-fl,6,6+fl);ctx.fillStyle='#ffd34d';ctx.fillRect(px+5,76-fl,2,4);}
  // 바깥 성벽 (더 밝은 돌)
  for(let y=0;y<E2_FLOOR;y+=8)for(let x=E2_WALL+((y/8)%2)*8-8;x<VW;x+=16){ctx.fillStyle=r()<.5?'#5a4a6a':'#4f4060';ctx.fillRect(x+1,y+1,14,6);}
  ctx.fillStyle='#120c1a';ctx.fillRect(E2_WALL-2,0,2,E2_FLOOR);
  // 부수기 직전 금이 간다
  if(t>=T.smash-30&&!broken){ctx.fillStyle='#120c1a';const k=(t-T.smash+30)/30;
    for(let i=0;i<14*k;i++)ctx.fillRect(E2_WALL+4+((i*13)%60),110+((i*29)%46),1+((i*5)%3),1);}
  // 바닥
  ctx.fillStyle='#120c1a';ctx.fillRect(-20,E2_FLOOR,E2_WALL+20,VH);ctx.fillStyle='#4a3a5a';ctx.fillRect(-20,E2_FLOOR,E2_WALL+20,1);
  ctx.restore();
  ctx.save();ctx.translate(sx,sy);
  // 떨어지는 돌
  for(const q of ending.rocks){ctx.fillStyle='#4a3e58';ctx.fillRect(Math.round(q.x),Math.round(q.y),q.s+1,q.s+1);ctx.fillStyle='#7a6a8a';ctx.fillRect(Math.round(q.x),Math.round(q.y),q.s,1);}
  // 기사
  const k=e2Knight(t),cx=k.x+6;
  if(t>=T.charge&&t<T.smash){const bx=Math.round(cx)-2,by=k.feet-16-30;
    ctx.fillStyle='#1a1226';ctx.fillRect(bx-1,by-1,6,31);ctx.fillStyle=t%8<4?'#fff7d6':'#ffd34d';ctx.fillRect(bx,by,4,28);ctx.fillStyle='#ffffff';ctx.fillRect(bx+1,by+1,1,25);
    ctx.fillStyle='#7a4f2b';ctx.fillRect(bx-4,by+27,12,2);}
  if(k.x<VW+4)e2DrawKnight(k,0,0);
  if(t>=T.smash&&t<T.smash+18){ctx.globalAlpha=Math.min(1,(T.smash+18-t)/10);ctx.drawImage(GIANT.r,Math.round(cx-2),Math.round(k.feet-9-40));ctx.globalAlpha=1;}
  e2DrawParts(0,0);
  ctx.restore();
  if(t>=T.smash&&t<T.smash+6){ctx.fillStyle='rgba(255,246,200,'+(1-(t-T.smash)/6)*.7+')';ctx.fillRect(0,0,VW,VH);}
}

/* ---------- 2·3장: 저녁 숲, 큰 나무, 노을 ---------- */
function e2DrawSunset(t){
  const T=E2_T,c=e2Smooth((t-T.camFrom)/(T.camTo-T.camFrom));
  const off=Math.round((1-c)*90);        // 먼 풍경은 천천히 (시차)
  const scr=Math.round(e2Lerp(208,40,c)); // 가까운 풍경(큰 나무)은 빠르게
  const hz=120+off;                       // 수평선
  // 하늘
  const g=ctx.createLinearGradient(0,0,0,hz);
  g.addColorStop(0,'#241a4a');g.addColorStop(.35,'#6a3a78');g.addColorStop(.7,'#e8665a');g.addColorStop(1,'#ffc46a');
  ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  // 첫 별
  const st=rng(77);for(let i=0;i<26;i++){const x=st()*VW,y=st()*48;ctx.globalAlpha=(.3+.4*Math.sin(t*.04+i))*(1-Math.min(1,y/50));ctx.fillStyle='#fff6e8';ctx.fillRect(Math.round(x),Math.round(y),1,1);}
  ctx.globalAlpha=1;
  // 해 (천천히 진다)
  const sunX=206,sunY=e2Lerp(96,128,(t-T.sunset)/(T.hint-T.sunset))+off;
  const rg=ctx.createRadialGradient(sunX,sunY,4,sunX,sunY,90);rg.addColorStop(0,'rgba(255,240,180,.75)');rg.addColorStop(1,'rgba(255,140,90,0)');
  ctx.fillStyle=rg;ctx.fillRect(0,0,VW,hz);
  ctx.save();ctx.beginPath();ctx.rect(0,0,VW,hz);ctx.clip();
  ctx.fillStyle='#fff2c0';ctx.beginPath();ctx.arc(sunX,sunY,15,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffe28a';ctx.beginPath();ctx.arc(sunX,sunY,15,0,Math.PI);ctx.fill();
  ctx.restore();
  // 노을 구름 (아랫면이 해에 물든다)
  for(const cl of ending.clouds){const x=Math.round(cl.x),y=Math.round(cl.y+off*.6),w=Math.round(cl.w);
    ctx.fillStyle='#8a4a7a';ctx.fillRect(x,y,w,3);ctx.fillRect(x+6,y-2,w-14,2);
    ctx.fillStyle='#ff9a6a';ctx.fillRect(x+2,y+3,w-4,1);ctx.fillStyle='#ffd08a';ctx.fillRect(x+8,y+3,w-20,1);}
  // 먼 산 두 겹
  ctx.fillStyle='#8a4a72';ctx.beginPath();ctx.moveTo(0,hz);
  for(let x=0;x<=VW;x+=4)ctx.lineTo(x,hz-10-Math.abs(Math.sin(x*.018))*16-Math.sin(x*.07)*2);ctx.lineTo(VW,hz);ctx.fill();
  // 무너진 마왕성 (먼 산 위 실루엣과 연기)
  const kx=268,ky=hz-22;ctx.fillStyle='#5a2a52';
  ctx.fillRect(kx,ky,18,10);ctx.fillRect(kx+2,ky-6,4,6);ctx.fillRect(kx+12,ky-3,4,3);ctx.fillRect(kx+7,ky-2,2,2);
  for(const s of ending.smoke){ctx.globalAlpha=s.life/160*.18;ctx.fillStyle='#4a2a4a';ctx.beginPath();ctx.arc(kx+4+s.x*4,ky-6+s.y*4,s.r*2,0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=1;
  ctx.fillStyle='#5a2a5a';ctx.beginPath();ctx.moveTo(0,hz);
  for(let x=0;x<=VW;x+=4)ctx.lineTo(x,hz-4-Math.abs(Math.sin(x*.031+1))*9);ctx.lineTo(VW,hz);ctx.fill();
  // 호수와 해 그림자
  const lg=ctx.createLinearGradient(0,hz,0,hz+34);lg.addColorStop(0,'#f0a070');lg.addColorStop(1,'#6a3a68');
  ctx.fillStyle=lg;ctx.fillRect(0,hz,VW,34);
  for(let i=0;i<9;i++){const y=hz+2+i*3.5,w=Math.max(2,(26-i*2.2)*(.75+.25*Math.sin(t*.07+i*1.7))),dx=Math.sin(t*.05+i)*2;
    ctx.fillStyle=i<3?'#fff2c0':'#ffc88a';ctx.fillRect(Math.round(sunX-w/2+dx),Math.round(y),Math.round(w),1);}
  ctx.fillStyle='#ffd8a0';for(let i=0;i<14;i++){const x=(i*53+t*.2)%VW,y=hz+6+(i*7)%26;if((t+i*11)%60<30)ctx.fillRect(Math.round(x),Math.round(y),3,1);}
  // 먼 숲 (들쭉날쭉한 나무 꼭대기)
  ctx.fillStyle='#2e1a3a';ctx.beginPath();ctx.moveTo(0,VH+100);
  for(let x=0;x<=VW;x+=3)ctx.lineTo(x,hz+28-((x*7)%11<5?((x*13)%7):0)-Math.sin(x*.05)*4);ctx.lineTo(VW,VH+100);ctx.fill();
  ctx.fillStyle='#24142e';ctx.fillRect(0,hz+40,VW,VH);
  // 새 떼 (V자, 날갯짓)
  if(t>=T.sunset+60&&t<T.sunset+660){const bx=e2Lerp(-60,VW+70,(t-T.sunset-60)/600),by=70+Math.sin(t*.02)*6;
    ctx.fillStyle='#3a1a3a';for(const b of ending.birds){const x=Math.round(bx+b.dx),y=Math.round(by+b.dy+off),up=Math.sin(t*.25+b.ph)>0;
      ctx.fillRect(x,y,1,1);ctx.fillRect(x-2,y+(up?-1:1),2,1);ctx.fillRect(x+1,y+(up?-1:1),2,1);}}
  // 가까운 숲 (세계 좌표 → 화면 y = wy - scr)
  for(const tr of [{x:150,w:10,top:250},{x:214,w:12,top:236},{x:292,w:9,top:258}]){
    ctx.fillStyle='#150b1c';ctx.fillRect(tr.x,tr.top-scr,tr.w,E2_GROUND-tr.top);
    for(const [ox,oy,rr] of [[-14,-6,16],[tr.w+12,-2,15],[tr.w/2,-18,18]]){ctx.beginPath();ctx.arc(tr.x+ox,tr.top+oy-scr,rr,0,Math.PI*2);ctx.fill();}}
  ctx.fillStyle='#120818';ctx.fillRect(0,E2_GROUND-scr,VW,VH);
  const gr=rng(5);ctx.fillStyle='#24142e';for(let i=0;i<60;i++){const x=Math.round(gr()*VW);ctx.fillRect(x,E2_GROUND-scr-1-Math.round(gr()*3),1,3);}
  // 큰 나무: 줄기, 가지, 역광에 물든 잎
  const ty=y=>y-scr;
  ctx.fillStyle='#1c0f22';ctx.fillRect(E2_TRUNK-4,ty(140),22,E2_GROUND-140);
  ctx.fillRect(E2_TRUNK-12,ty(E2_GROUND-8),38,8);
  ctx.fillStyle='#3a2232';for(let y=150;y<E2_GROUND;y+=11)ctx.fillRect(E2_TRUNK+((y*3)%9),ty(y),2,5);
  ctx.fillStyle='#ff8a5a';ctx.fillRect(E2_TRUNK+17,ty(140),1,E2_GROUND-140);   // 해 쪽 줄기 가장자리
  ctx.fillStyle='#1c0f22';ctx.fillRect(E2_TRUNK+10,ty(E2_BRANCH),120,6);ctx.fillRect(E2_TRUNK+128,ty(E2_BRANCH+1),10,4);ctx.fillRect(E2_TRUNK+96,ty(E2_BRANCH-6),3,6);
  ctx.fillStyle='#ff9a6a';ctx.fillRect(E2_TRUNK+18,ty(E2_BRANCH),118,1);
  const blobs=[[30,120,40],[76,102,34],[8,160,26],[112,124,22],[-6,104,30],[140,150,12]];
  ctx.fillStyle='#ff9a6a';for(const [x,y,rr] of blobs){ctx.beginPath();ctx.arc(x+2,ty(y)-1,rr,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#24122a';for(const [x,y,rr] of blobs){ctx.beginPath();ctx.arc(x,ty(y),rr,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#3a1e38';const lr=rng(12);for(let i=0;i<70;i++){const b=blobs[i%blobs.length],a=lr()*6.28,d=lr()*b[2]*.9;
    ctx.fillRect(Math.round(b[0]+Math.cos(a)*d),Math.round(ty(b[1])+Math.sin(a)*d),2,1);}
  // 기사
  if(t>=T.forestRun)e2DrawKnight(e2Knight(t),0,-scr);
  e2DrawParts(0,-scr,q=>q.breath);
  // 떠다니는 빛 알갱이
  ctx.globalCompositeOperation='lighter';
  for(const m of ending.motes){const a=Math.min(1,m.life/120)*(.5+.5*Math.sin(t*.08+m.ph));ctx.globalAlpha=a*.8;ctx.fillStyle='#ffd88a';
    ctx.fillRect(Math.round(m.x+Math.sin(t*.03+m.ph)*4),Math.round(m.y),1,1);ctx.globalAlpha=a*.25;ctx.fillRect(Math.round(m.x+Math.sin(t*.03+m.ph)*4)-1,Math.round(m.y)-1,3,3);}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}

function drawEnding2(){
  const E=ending,t=E.t,T=E2_T;
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  if(t<T.toForest){
    e2DrawCastle(t);
    endText('a','마왕이 쓰러지자 마왕성이 무너지기 시작했다.',20,11,'#ffffff',Math.min((t-30)/40,(T.smash-t)/20));
    endText('b','기사는 성벽을 부수고 밖으로 뛰쳐나갔다!',20,11,'#ffd9a0',Math.min((t-T.smash-10)/30,(T.castleOut+30-t)/30));
    const dark=t<40?1-t/40:t>T.castleOut?(t-T.castleOut)/(T.toForest-T.castleOut):0;
    if(dark>0){ctx.fillStyle='rgba(0,0,0,'+Math.min(1,dark)+')';ctx.fillRect(0,0,VW,VH);}
    return;
  }
  endText('a','',0,11,'#fff',0);
  e2DrawSunset(t);
  endText('b','숲까지 쉬지 않고 달린 기사는 커다란 나무 위로 기어올랐다.',20,11,'#ffffff',Math.min((t-520)/40,(T.branch+20-t)/30));
  endText('c','후우… 겨우 숨을 돌렸다.',20,11,'#ffffff',Math.min((t-T.sit+10)/30,(T.sit+250-t)/30));
  endText('d','노을이 온 세상을 붉게 물들였다.',20,11,'#ffe2b0',Math.min((t-T.sunset-120)/50,(T.theEnd-60-t)/40));
  endText('e','기사는 그 풍경을 오래도록 바라보았다.',36,11,'#ffe2b0',Math.min((t-T.sunset-300)/50,(T.theEnd-60-t)/40));
  if(t>=T.theEnd){
    endPixelText('The End',VW/2,40,20,'#ffd34d','Silkscreen, monospace',(t-T.theEnd)/50);
    endText('coins','모은 동전 '+p.coins+'개',58,10,'#ffe2c8',(t-T.theEnd-40)/50);}
  endText('s3','시즌 3 제작중…',80,15,'#fff2c0',(t-T.season3)/60);
  endText('hint',(TOUCH?'화면을 눌러':'R 키를 누르거나 화면을 눌러')+' 처음으로',182,9,'#e8c8d8',t>=T.hint&&Math.floor((t-T.hint)/30)%2===0?1:0);
  const dark=t<T.toForest+40?1-(t-T.toForest)/40:0;
  if(dark>0){ctx.fillStyle='rgba(0,0,0,'+Math.min(1,dark)+')';ctx.fillRect(0,0,VW,VH);}
}
