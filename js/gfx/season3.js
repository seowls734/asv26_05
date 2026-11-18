// season3.js — 시즌 3 오프닝 (큰 나무 위 → 바람 화살 차지 + 좌클릭으로 독수리 타기 → 날고 또 날고 → 난파선 → 거석상 아르리스로)
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.
// ending.js의 ending 변수·endText·clearEndText, ending2.js의 노을 장면(e2DrawSunset)을 함께 쓴다 (ending.kind==='s3').

/* ================= season 3 ================= */
// 비행 연출 시간표 (프레임, 60fps, 독수리에 탄 뒤부터)
const S3_T={ride:130,night:260,dawn:520,wreck:780,fight:1010,elec:1150,black:1270,text:1300,go:1420};
const S3_KX=92,S3_FEET=E2_BRANCH-40; // 나무 장면에서 기사 위치 (화면 좌표, 발끝)
const S3_ARRIS='거석상 아르리스.html';

function s3Unlocked(){try{return localStorage.getItem('pk_season3')==='1';}catch(_){return false;}}
function startSeason3(fly){
  audioInit();if(ending)endEnding();
  $('s2btn').hidden=true;$('s3btn').hidden=true;$('overlay').hidden=true;$('toast').style.opacity=0;$('bossbar').hidden=true;screenEl.classList.remove('bossfight');
  try{localStorage.setItem('pk_season3','1');}catch(_){}
  // 모든 화살·강화 활·활 차징을 가진 채로 시작
  gotCount=LEVELS.length-1;applyAbilities();setElem(0);
  ending={kind:'s3',t:0,ph:'tree',ch:0,slash:0,shot:null,ride:0,fly:0,hintT:0,parts:[],motes:[],smoke:[],birds:[],
    clouds:Array.from({length:7},(_,i)=>({x:i*56+Math.random()*30,y:34+Math.random()*52,w:30+Math.random()*40,s:.04+Math.random()*.06})),
    sky:Array.from({length:9},(_,i)=>({x:i*44+Math.random()*30,y:20+Math.random()*120,w:24+Math.random()*44,s:1.5+Math.random()*1.5}))};
  $('stage').textContent='3 · 하늘 길';
  if(fly){ending.ph='fly';ending.fly=typeof fly==='number'?fly:0;state='ending';$('badge').hidden=true;}
  else{state='s3';$('badge').hidden=false;}
}

// 나무 위 조작: 바람 화살을 차지한 채로 좌클릭하면 독수리를 탄다
function s3TreeInput(){
  const E=ending,wind=ELEM[elem].id==='wind';
  if(E.slash>0)E.slash--;
  if(K.bow){E.ch++;
    if(E.ch===BOWFULL){sfx('charged');shake=Math.max(shake,2);s3Puff(S3_KX+12,S3_FEET-10,14,ELEM[elem].col);}
    if(E.ch>=BOWFULL&&frame%3===0){const a=Math.random()*6.28;E.parts.push({x:S3_KX+6+Math.cos(a)*14,y:S3_FEET-8+Math.sin(a)*14,vx:-Math.cos(a)*.6,vy:-Math.sin(a)*.6,g:0,life:14,max:14,c:ELEM[elem].col,s:1});}
    else if(E.ch>20&&frame%5===0){const a=Math.random()*6.28;E.parts.push({x:S3_KX+6+Math.cos(a)*12,y:S3_FEET-8+Math.sin(a)*12,vx:-Math.cos(a)*.8,vy:-Math.sin(a)*.8,g:0,life:12,max:12,c:ELEM[elem].col,s:1});}
  }else if(E.ch>0){
    // 차지한 채로 좌클릭하지 않고 그냥 놓았다
    if(E.ch>=BOWFULL&&wind){E.shot={x:S3_KX+10,y:S3_FEET-9,t:0};sfx('screech');s3Hint('독수리가 혼자 날아가 버렸다… 차지한 채로 '+CT().atk+'!');}
    else{E.shot={x:S3_KX+10,y:S3_FEET-9,t:0,small:1,c:ELEM[elem].col};sfx('bow');}
    E.ch=0;
  }
  if(P.atk){
    if(K.bow&&E.ch>=BOWFULL&&wind){s3StartRide();return;}
    if(K.bow&&E.ch>=BOWFULL)s3Hint('바람 화살이어야 독수리를 부를 수 있어요 ('+(TOUCH?'속성 버튼':'F 또는 8')+')');
    else{E.slash=12;sfx('slash');if(E.hintT<=0)s3Hint('바람 화살을 2초 차지한 채로 '+CT().atk+'!');}
  }
  if(E.hintT>0)E.hintT--;
}
function s3Hint(msg){toast(msg,2200,true);ending.hintT=90;}
function s3Puff(x,y,n,c){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=.5+Math.random()*1.2;ending.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:0,life:20,max:20,c,s:1});}}
function s3StartRide(){
  const E=ending;E.ph='ride';E.ride=0;E.ch=0;state='ending';
  $('badge').hidden=true;$('toast').style.opacity=0;sfx('screech');sfx('bowBig');shake=4;
  s3Puff(S3_KX+12,S3_FEET-10,24,'#b6f05a');
}

function updateSeason3(){
  const E=ending;E.t++;
  for(const c of E.clouds){c.x+=c.s;if(c.x>VW+40)c.x=-80;}
  if(E.t%7===0)E.motes.push({x:Math.random()*VW,y:VH+4,vy:-.15-Math.random()*.25,ph:Math.random()*6,life:600});
  for(const m of E.motes){m.y+=m.vy;m.life--;}
  E.motes=E.motes.filter(m=>m.life>0&&m.y>-4);
  for(const q of E.parts){q.vy+=q.g;q.x+=q.vx;q.y+=q.vy;q.life--;}
  E.parts=E.parts.filter(q=>q.life>0);
  if(E.shot){const s=E.shot;s.t++;s.x+=s.small?5:4;s.y-=s.small?0:1.2;if(s.x>VW+60)E.shot=null;}
  if(shake>0){shake*=.9;if(shake<.3)shake=0;}
  if(E.ph==='tree'){s3TreeInput();return;}
  if(E.ph==='ride'){E.ride++;
    if(E.ride===40){sfx('dash');s3Puff(S3_KX+6,S3_FEET-4,10,'#e2ffa8');}
    if(E.ride>40&&E.ride%14===0)sfx('dash');
    if(E.ride>=S3_T.ride){E.ph='fly';E.fly=0;}
    return;}
  // 비행
  const f=++E.fly,T=S3_T;
  for(const c of E.sky){c.x-=c.s*(f>T.wreck?Math.max(.15,1-(f-T.wreck)/120):1);if(c.x<-c.w-10){c.x=VW+Math.random()*40;c.y=20+Math.random()*120;}}
  if(f%40===0&&f<T.wreck)sfx('dash');
  if(f===T.night||f===T.dawn)sfx('screech');
  if(f===T.wreck)sfx('rumble');
  if(f>T.wreck&&f<T.black&&f%55===20){sfx('thunder');E.flashAt=f;E.flashX=170+Math.random()*120;}
  if(f===T.elec)sfx('zap');
  if(f>=T.elec&&f<T.black&&f%4===0){const a=Math.random()*6.28,k=s3EaglePos(f);E.parts.push({x:k.x+Math.cos(a)*10-6,y:k.y-14+Math.sin(a)*8,vx:Math.cos(a)*.4,vy:Math.sin(a)*.4,g:0,life:10,max:10,c:Math.random()<.5?'#ffe14d':'#ffffff',s:1});}
  if(f===T.go){
    try{localStorage.setItem('pk_season3','1');}catch(_){}
    location.href=encodeURI(S3_ARRIS)+'?s3=1';
  }
}

/* ---------- 그리기 ---------- */
// 독수리(46×30, EAGLE)와 그 등에 앉은 기사. (x,y)는 독수리 몸 가운데
function s3DrawRider(x,y,flap,noKnight){
  const sp=EAGLE[flap?0:1];x=Math.round(x);y=Math.round(y);
  ctx.drawImage(sp,x-28,y-15);
  if(!noKnight)ctx.drawImage(E2_SIT,x-12,y-17);
}
function s3DrawTreeKnight(){
  const E=ending,x=S3_KX,y=S3_FEET;
  ctx.drawImage(PSPR.idle.r,x,y-16);
  // 활 (차지 중에는 시위가 당겨진다)
  const pull=E.ch>0?Math.min(4,Math.floor(E.ch/10)):0,bx=x+10,by=y-15;
  ctx.drawImage(E.ch>=BOWFULL?BOW_UP_BODY:BOW_BODY,bx,by);
  ctx.fillStyle=E.ch>=BOWFULL?'#ffffff':'#e8e2d0';
  ctx.fillRect(bx+1-pull,by+1,1,5);ctx.fillRect(bx+1-pull,by+6,1,5);ctx.fillRect(bx+1,by,1,1);ctx.fillRect(bx+1,by+11,1,1);
  if(E.ch>0){ctx.fillStyle=ELEM[elem].col;ctx.fillRect(bx+1-pull,by+6,9+pull,1);}
  if(E.ch>=BOWFULL){ctx.globalAlpha=.25+.15*Math.sin(frame*.3);ctx.fillStyle=ELEM[elem].col;ctx.beginPath();ctx.arc(x+7,y-8,13,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
  if(E.slash>0){const s=SLASH.r;ctx.globalAlpha=E.slash/12;ctx.drawImage(s,x+6,y-17);ctx.globalAlpha=1;}
}
function s3DrawShot(){
  const s=ending.shot;if(!s)return;
  if(s.small){ctx.fillStyle=s.c;ctx.fillRect(Math.round(s.x),Math.round(s.y),8,1);ctx.fillStyle='#ffffff';ctx.fillRect(Math.round(s.x)+7,Math.round(s.y),1,1);return;}
  ctx.globalAlpha=Math.max(0,1-s.t/80);s3DrawRider(s.x,s.y,Math.floor(s.t/5)%2,true);ctx.globalAlpha=1;
}
function s3DrawParts(){
  for(const q of ending.parts){ctx.globalAlpha=Math.min(1,q.life/q.max*2);ctx.fillStyle=q.c;ctx.fillRect(Math.round(q.x),Math.round(q.y),q.s,q.s);}
  ctx.globalAlpha=1;
}
// 나무 장면에서 독수리가 솟아오르고, 기사가 뛰어올라 탄 뒤 오른쪽 위로 날아간다
function s3DrawRide(r){
  const sx=S3_KX+12,sy=S3_FEET+2; // 기사가 앉을 독수리 위치
  let ex,ey,kx,ky,sit=false;
  if(r<40){const k=e2Smooth(r/40);ex=e2Lerp(-40,sx,k);ey=e2Lerp(VH+30,sy,k)-Math.sin(k*Math.PI)*40;
    // 기사는 무릎을 굽혔다가 뛰어오른다
    kx=S3_KX;ky=r<24?S3_FEET:S3_FEET-Math.sin((r-24)/16*Math.PI)*14;}
  else{const k=Math.max(0,r-40)/(S3_T.ride-40),e=k*k;ex=sx+e*320;ey=sy-e*190-Math.sin(k*Math.PI)*10;sit=true;}
  const flap=Math.floor(r/(r<40?4:5))%2;
  if(sit)s3DrawRider(ex,ey,flap);
  else{s3DrawRider(ex,ey,flap,true);ctx.drawImage((r<24?PSPR.idle:PSPR.jump).r,Math.round(kx),Math.round(ky-16));}
  // 날갯짓 바람
  if(r>=40&&r%6===0)ending.parts.push({x:ex-20,y:ey+4,vx:-1.5,vy:.3,g:0,life:16,max:16,c:'#e2ffa8',s:1});
}
function s3DrawTree(){
  const E=ending;
  e2DrawSunset(E2_T.hint+E.t,true);
  if(E.ph==='tree')s3DrawTreeKnight();else s3DrawRide(E.ride);
  s3DrawShot();s3DrawParts();
  if(E.ph==='tree'){
    endText('a','큰 나무 위에서 숨을 고른 기사는 바다 너머를 바라보았다.',40,10,'#ffffff',Math.min(1,E.t/40));
    const w=ELEM[elem].id==='wind',ok=w&&E.ch>=BOWFULL;
    endText('b',ok?'지금! '+CT().atk+'으로 독수리를 타자!':w?CT().bowHold+' 2초 눌러 바람 화살을 차지하고, 누른 채로 '+CT().atk:'먼저 '+(TOUCH?'속성 버튼':'F 키(또는 8)')+'로 바람 화살을 고르자',54,9,ok?'#e2ffa8':'#ffe2b0',E.t>60?1:(E.t-20)/40);
  }else{endText('a','',0,10,'#fff',0);endText('b','',0,9,'#fff',0);}
  const dark=E.t<30?1-E.t/30:E.ph==='ride'&&E.ride>S3_T.ride-20?(E.ride-(S3_T.ride-20))/20:0;
  if(dark>0){ctx.fillStyle='rgba(0,0,0,'+Math.min(1,dark)+')';ctx.fillRect(0,0,VW,VH);}
}

// 비행 중 독수리 위치 (화면 좌표)
function s3EaglePos(f){
  const T=S3_T;let x=128+Math.sin(f*.03)*10,y=88+Math.sin(f*.07)*5;
  if(f>T.wreck){const k=e2Smooth((f-T.wreck)/160);x=e2Lerp(x,74,k);y=e2Lerp(y,44,k);}
  if(f<30){const k=e2Smooth(f/30);x=e2Lerp(-30,x,k);y=e2Lerp(140,y,k);}
  return {x,y};
}
function s3Grad(stops,y0,y1){const g=ctx.createLinearGradient(0,y0,0,y1);stops.forEach((c,i)=>g.addColorStop(i/(stops.length-1),c));return g;}
// 1장: 노을 진 숲 위
function s3SceneSunset(f){
  ctx.fillStyle=s3Grad(['#241a4a','#6a3a78','#e8665a','#ffc46a'],0,130);ctx.fillRect(0,0,VW,VH);
  ctx.fillStyle='#fff2c0';ctx.beginPath();ctx.arc(250,112,14,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#8a4a72';ctx.beginPath();ctx.moveTo(0,VH);for(let x=0;x<=VW;x+=4){const w=x+f*.5;ctx.lineTo(x,128-Math.abs(Math.sin(w*.017))*22-Math.sin(w*.06)*3);}ctx.lineTo(VW,VH);ctx.fill();
  ctx.fillStyle='#5a2a5a';ctx.beginPath();ctx.moveTo(0,VH);for(let x=0;x<=VW;x+=4){const w=x+f*1.2;ctx.lineTo(x,146-Math.abs(Math.sin(w*.029+1))*12);}ctx.lineTo(VW,VH);ctx.fill();
  // 빠르게 지나가는 숲 꼭대기
  ctx.fillStyle='#2e1a3a';for(let i=-1;i<12;i++){const x=((i*34-f*3)%374+374)%374-30;ctx.beginPath();ctx.arc(x,170,16+(i*7)%6,0,Math.PI*2);ctx.fill();}
  ctx.fillRect(0,170,VW,VH-170);
}
// 2장: 별과 달, 밤 구름
function s3SceneNight(f){
  ctx.fillStyle=s3Grad(['#04051a','#141c48','#2a3468'],0,VH);ctx.fillRect(0,0,VW,VH);
  const r=rng(9);for(let i=0;i<60;i++){const x=((r()*VW-f*.15)%VW+VW)%VW,y=r()*VH;ctx.globalAlpha=.35+.5*Math.abs(Math.sin(f*.05+i));ctx.fillStyle='#fff6e8';ctx.fillRect(Math.round(x),Math.round(y),1,1);}
  ctx.globalAlpha=1;
  ctx.fillStyle='rgba(232,236,255,.18)';ctx.beginPath();ctx.arc(270,36,20,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#e8ecff';ctx.beginPath();ctx.arc(270,36,11,0,Math.PI*2);ctx.fill();ctx.fillStyle='#141c48';ctx.beginPath();ctx.arc(275,33,10,0,Math.PI*2);ctx.fill();
  // 아래쪽 구름 바다
  ctx.fillStyle='#3a4478';for(let i=-1;i<14;i++){const x=((i*28-f*2)%392+392)%392-36;ctx.beginPath();ctx.arc(x,176+(i%3)*4,18,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#5a66a0';for(let i=-1;i<14;i++){const x=((i*28-f*2)%392+392)%392-36;ctx.fillRect(Math.round(x)-10,160+(i%3)*4,18,1);}
}
// 3·4장: 새벽 바다 (wreck>0이면 난파선 장면)
function s3SceneSea(f,wreck){
  const hz=wreck?104:120,storm=wreck?Math.min(1,wreck/80):0;
  ctx.fillStyle=s3Grad(storm?['#1a2048','#4a3a6a','#c07a6a','#f0b07a']:['#2a3a7a','#8a5a8a','#f0a070','#ffd8a0'],0,hz);ctx.fillRect(0,0,VW,hz);
  // 떠오르는 해
  ctx.save();ctx.beginPath();ctx.rect(0,0,VW,hz);ctx.clip();ctx.fillStyle='#fff2c0';ctx.beginPath();ctx.arc(268,hz+4-Math.min(12,f*.02),16,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.fillStyle=s3Grad(['#5a6a9a','#2a3a6a','#0e1a3a'],hz,VH);ctx.fillRect(0,hz,VW,VH-hz);
  const sp=wreck?Math.max(.2,1-wreck/120):1;
  ctx.fillStyle='#ffd8a0';for(let i=0;i<26;i++){const y=hz+3+(i*11)%(VH-hz-4),x=((i*61-f*(2+(y-hz)*.04)*sp)%VW+VW)%VW;if((f+i*7)%40<26)ctx.fillRect(Math.round(x),y,2+(i%3),1);}
  for(let i=0;i<9;i++){const w=Math.max(2,18-i*2);ctx.fillStyle=i<3?'#fff2c0':'#ffc88a';ctx.fillRect(Math.round(268-w/2+Math.sin(f*.05+i)*2),hz+2+i*3,w,1);}
  if(storm>0){ctx.globalAlpha=storm*.35;ctx.fillStyle='#2a2440';for(let i=0;i<8;i++){const x=((i*52-f*.4)%420+420)%420-50;ctx.beginPath();ctx.arc(x,18+(i%3)*8,22,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
}
// 난파선: 부러진 돛대, 반쯤 잠긴 선체, 휘감는 촉수, 물속의 번쩍임
function s3DrawWreck(f,w){
  const E=ending,x0=Math.round(e2Lerp(VW+90,214,e2Smooth(w/150))),hz=104,y0=hz+30;
  // 물속 번쩍임 (싸움의 빛)
  if(E.flashAt&&f-E.flashAt<14){const a=1-(f-E.flashAt)/14;ctx.globalCompositeOperation='lighter';
    ctx.globalAlpha=a*.6;ctx.fillStyle='#8fe3ff';ctx.beginPath();ctx.ellipse(E.flashX,y0+26,44,12,0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=a;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(E.flashX,y0+26,14,4,0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
  // 물에 잠긴 선체 그림자
  ctx.fillStyle='rgba(10,20,40,.55)';ctx.beginPath();ctx.ellipse(x0+4,y0+18,56,10,0,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.translate(x0,y0);ctx.rotate(-.18);
  // 선체 (뒤쪽이 물에 잠김)
  ctx.fillStyle='#3a2416';ctx.beginPath();ctx.moveTo(-50,-4);ctx.lineTo(44,-14);ctx.lineTo(36,6);ctx.lineTo(-40,10);ctx.closePath();ctx.fill();
  ctx.fillStyle='#5a3a24';ctx.fillRect(-48,-6,92,2);ctx.fillStyle='#c9a24a';ctx.fillRect(-36,0,60,1);
  // 부서진 구멍
  ctx.fillStyle='#120a08';ctx.fillRect(4,-6,8,6);ctx.fillRect(14,-4,3,3);
  // 부러진 돛대와 찢어진 돛
  ctx.fillStyle='#2a1a10';ctx.fillRect(-14,-46,3,42);ctx.save();ctx.translate(12,-10);ctx.rotate(.9);ctx.fillRect(0,-26,3,26);ctx.restore();
  const sw=Math.sin(f*.12)*2;ctx.fillStyle='#d8ccb0';ctx.beginPath();ctx.moveTo(-11,-44);ctx.lineTo(4+sw,-36);ctx.lineTo(-2,-26);ctx.lineTo(6+sw,-20);ctx.lineTo(-11,-14);ctx.closePath();ctx.fill();
  ctx.fillStyle='#8a2a24';ctx.fillRect(-13,-50,8,3);
  ctx.restore();
  // 물결이 선체를 덮는다
  ctx.fillStyle='#2a3a6a';for(let i=-4;i<5;i++){const x=x0+i*14+Math.sin(f*.08+i)*2;ctx.fillRect(Math.round(x)-6,y0+8+Math.round(Math.sin(f*.1+i)*1.5),12,2);}
  ctx.fillStyle='#bfd6ff';for(let i=-3;i<4;i++)if((f+i*9)%30<18)ctx.fillRect(Math.round(x0+i*16),y0+7,4,1);
  // 거대한 촉수 세 개가 솟아 배를 휘감는다
  const rise=e2Smooth((w-60)/90);
  for(let k=0;k<3;k++){const bx=x0-44+k*40,h=(36+k*8)*rise,ph=f*.06+k*2;if(h<2)continue;
    for(let s=0;s<16;s++){const u=s/15,x=bx+Math.sin(ph+u*3.2)*10*u+(k-1)*u*8,y=y0+14-u*h,r=Math.max(1,5-u*4);
      ctx.fillStyle=s%3===0?'#c46a7a':'#9c3a5a';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
      if(s%3===1){ctx.fillStyle='#f0c0c8';ctx.fillRect(Math.round(x-r*.6),Math.round(y),1,1);}}}
  // 물보라
  if(f%9===0)ending.parts.push({x:x0-50+Math.random()*100,y:y0+8,vx:(Math.random()-.5)*.8,vy:-1-Math.random(),g:.06,life:24,max:24,c:'#e8f4ff',s:1});
}
function s3DrawSpeed(f,amt){
  ctx.fillStyle='rgba(255,255,255,.55)';
  for(let i=0;i<10;i++){const y=(i*37)%VH,x=((VW-(f*9+i*71))%(VW+60)+VW+60)%(VW+60)-30;ctx.globalAlpha=amt*(.25+(i%3)*.15);ctx.fillRect(Math.round(x),y,14+(i%4)*6,1);}
  ctx.globalAlpha=1;
}
function s3DrawFly(){
  const E=ending,f=E.fly,T=S3_T,wreck=f>=T.wreck?f-T.wreck:0;
  if(f<T.night)s3SceneSunset(f);else if(f<T.dawn)s3SceneNight(f);else s3SceneSea(f,wreck);
  // 지나가는 구름
  const cc=f<T.night?['#8a4a7a','#ff9a6a']:f<T.dawn?['#2a3468','#6a78b8']:['#c08a9a','#ffe2c0'];
  for(const c of E.sky){const x=Math.round(c.x),y=Math.round(c.y),w=Math.round(c.w);if(wreck&&y>90)continue;
    ctx.fillStyle=cc[0];ctx.fillRect(x,y,w,4);ctx.fillRect(x+5,y-2,w-12,2);ctx.fillStyle=cc[1];ctx.fillRect(x+2,y,w-6,1);}
  if(wreck)s3DrawWreck(f,wreck);
  s3DrawSpeed(f,wreck?Math.max(0,1-wreck/90):1);
  const k=s3EaglePos(f);s3DrawRider(k.x,k.y,Math.floor(f/(wreck>120?9:5))%2);
  // 전기 화살을 꺼내 든 기사
  if(f>=T.elec&&f<T.black){ctx.drawImage(BIGBOW.elec,Math.round(k.x)+2,Math.round(k.y)-24);if(frame%6<3){ctx.fillStyle='#ffe14d';ctx.fillRect(Math.round(k.x)+9,Math.round(k.y)-18,8,1);}}
  for(const q of E.parts){ctx.globalAlpha=Math.min(1,q.life/q.max*2);ctx.fillStyle=q.c;ctx.fillRect(Math.round(q.x),Math.round(q.y),q.s,q.s);}
  ctx.globalAlpha=1;
  // 장면이 바뀔 때 잠깐 어두워진다
  let dark=f<20?1-f/20:0;for(const b of [T.night,T.dawn,T.wreck])dark=Math.max(dark,1-Math.abs(f-b)/18);
  if(f>=T.black)dark=Math.min(1,(f-T.black)/30);
  if(dark>0){ctx.fillStyle='rgba(0,0,0,'+Math.min(1,dark)+')';ctx.fillRect(0,0,VW,VH);}
  const cap=(slot,s,a,b,y,col)=>endText(slot,s,y||20,11,col||'#ffffff',Math.min((f-a)/30,(b-f)/30));
  cap('a','날고',30,T.night-20,24);
  cap('b','또 날고',T.night+30,T.dawn-20,24,'#d8e0ff');
  cap('c','날아서 가니…',T.dawn+30,T.wreck-10,24,'#ffe2b0');
  cap('d','난파선이 보였다.',T.wreck+50,T.fight,170);
  cap('e','저 아래에서 누군가 거대한 문어와 싸우고 있다!',T.fight+10,T.elec+10,170,'#ffd0dc');
  cap('f','기사는 전기 화살을 꺼내 들었다.',T.elec+20,T.black,170,'#ffe14d');
  cap('g','— 거석상 아르리스로 이어집니다 —',T.text,T.go+60,96,'#e8e2d0');
}
function drawSeason3(){
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  const sx=shake?Math.round((Math.random()-.5)*shake):0,sy=shake?Math.round((Math.random()-.5)*shake):0;
  ctx.save();ctx.translate(sx,sy);
  if(ending.ph==='fly')s3DrawFly();else s3DrawTree();
  ctx.restore();
}
