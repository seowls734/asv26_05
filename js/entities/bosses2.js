// bosses2.js — 시즌 2 보스 12종 AI (초원 멧돼지왕 → 마왕)
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.
// 시즌 2 보스는 공격 간격 쿨다운이 프레임당 0.85씩 줄어든다 (시즌 1은 0.6)

Object.assign(BOSSDEF,{
 boar:{name:'초원 멧돼지왕',w:44,h:30,hp:32,col:'#8a5a3a',weak:{ice:2}},
 toad:{name:'거대 두꺼비',w:40,h:28,hp:34,col:'#5aa83a',weak:{elec:2}},
 turtle:{name:'강철 거북',w:44,h:26,hp:38,col:'#3a8a6a',weak:{grass:2}},
 witch:{name:'늪의 마녀',w:20,h:30,hp:36,col:'#7ad85a',fly:1,weak:{wind:2}},
 treant:{name:'시든 고목',w:44,h:56,hp:42,col:'#6a5232',weak:{fire:2}},
 boneknight:{name:'해골 기사',w:24,h:36,hp:44,col:'#e8e0d0',weak:{light:2}},
 cerberus:{name:'케르베로스',w:52,h:34,hp:48,col:'#d6423a',weak:{earth:2}},
 ifrit:{name:'화염 마인',w:28,h:40,hp:50,col:'#ff8a2a',fly:1,weak:{ice:2}},
 bonedragon:{name:'본 드래곤',w:52,h:30,hp:52,col:'#d8d0c0',fly:1,weak:{light:2}},
 kraken:{name:'심연의 촉수',w:40,h:40,hp:54,col:'#c83a5a',weak:{elec:2}},
 darkknight:{name:'흑기사',w:24,h:38,hp:56,col:'#6a3ab8',weak:{light:2}},
 demonking:{name:'마왕',w:48,h:58,hp:64,col:'#ff2a2a',fly:1,weak:{light:2}}
});
const COOL2=.85;
// 벽에 부딪히거나 착지하는 공용 동작
function hitWall(b){return b.x<=b.minX||b.x>=b.maxX;}
function jumpAt(b,vy,T){faceP(b);b.air=true;b.vy=vy;b.vx=(PX()-(b.x+b.w/2))/T;}
// 사방으로 퍼지는 탄
function ring(x,y,n,spd,look,rot){for(let i=0;i<n;i++){const a=i/n*Math.PI*2+(rot||0);bossHaz.push({kind:'proj',x:x-3,y:y-3,w:6,h:6,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,g:0,t:0,life:200,look});}}
// 일정한 간격으로 텔레포트(사라졌다 나타나기)하는 보스 공용
function blinkTo(b,x,y){b.x=Math.max(b.minX,Math.min(b.maxX,x));if(y!=null)b.y=y;}

Object.assign(BOSSAI,{
 // 2-1 초원 멧돼지왕: 벽까지 돌진, 뛰어올라 내려찍기, 새끼 부르기
 boar(b){
  const P2=b.phase===2,bc=b.x+b.w/2,landed=landBoss(b);
  if(b.state==='walk'){faceP(b);if(Math.abs(PX()-bc)>28)b.x+=b.face*(P2?1.2:.9);clampB(b);
    if((b.cool-=COOL2)<=0){const r=Math.random(),n=enemies.filter(e=>!e.dead&&e.type==='slime').length;bossGo(b,r<.45?'chargeUp':(r<.78||n>=2)?'jumpUp':'callUp');}}
  else if(b.state==='chargeUp'){if(b.t===1)faceP(b);if(b.t%6===0)puff(bc-b.face*16,b.gy-2,3,'#c9b890',1,.05,12);if(b.t>=(P2?20:28)){bossGo(b,'charge');sfx('roar');}}
  else if(b.state==='charge'){b.x+=b.face*(P2?5.4:4.6);if(frame%2===0)puff(bc-b.face*18,b.gy-2,3,'#c9b890',1,.05,14);
    if(hitWall(b)){clampB(b);shake=10;sfx('boom');for(let i=0;i<(P2?6:4);i++)fallAt(b.minX+20+Math.random()*(b.maxX-b.minX),'rock',30+i*8);bossGo(b,'stun');}}
  else if(b.state==='stun'){if(b.t>=(P2?36:50)){bossGo(b,'walk');b.cool=40;}}
  else if(b.state==='jumpUp'){if(b.t>=16){jumpAt(b,-8,46);bossGo(b,'air');sfx('jump');}}
  else if(b.state==='air'){if(landed){waveFrom(bc,b.gy,P2?3.8:3.2);shake=10;sfx('boom');puff(bc,b.gy,22,'#8a5a3a',2,.08,24);
    if(P2&&!b.again){b.again=true;bossGo(b,'jumpUp');}else{b.again=false;bossGo(b,'rest');}}}
  else if(b.state==='callUp'){if(b.t>=24){spawnMinion('slime',b.x-6,b.gy-10);spawnMinion('slime',b.x+b.w-6,b.gy-10);sfx('roar');bossGo(b,'rest');}}
  else if(b.state==='rest'){if(b.t>=(P2?24:40)){bossGo(b,'walk');b.cool=P2?30:50;}}
 },
 // 2-2 거대 두꺼비: 긴 혀, 높이 뛰기, 독 방울
 toad(b){
  const P2=b.phase===2,bc=b.x+b.w/2,d=Math.abs(PX()-bc),landed=landBoss(b);
  if(b.state==='walk'){faceP(b);if((b.cool-=COOL2)<=0){const r=Math.random();bossGo(b,d<110&&r<.45?'tongueUp':r<.72?'leapUp':'spitUp');}}
  else if(b.state==='tongueUp'){faceP(b);if(b.t>=16){bossGo(b,'tongue');sfx('dash');}}
  else if(b.state==='tongue'){const L=b.t<8?b.t/8:b.t<16?1:Math.max(0,1-(b.t-16)/8);b.tongue=L*(P2?96:80);
    const hb={x:b.face>0?b.x+b.w-4:b.x+4-b.tongue,y:b.y+12,w:b.tongue,h:6};if(b.tongue>8&&overlap(hb,p))hurtPlayer(bc);
    if(b.t>=24){b.tongue=0;bossGo(b,'recover');}}
  else if(b.state==='leapUp'){if(b.t>=14){jumpAt(b,-9.2,51);bossGo(b,'air');sfx('jump');}}
  else if(b.state==='air'){if(landed){waveFrom(bc,b.gy,P2?3.6:3);shake=10;sfx('boom');puff(bc,b.gy,20,'#5aa83a',2,.08,24);if(P2)for(let i=0;i<3;i++)fallAt(PX()+(i-1)*44,'rock',40+i*8);bossGo(b,'recover');}}
  else if(b.state==='spitUp'){if(b.t>=16){const n=P2?7:5;for(let i=0;i<n;i++)lob(bc+b.face*14,b.y+10,PX()+(i-(n-1)/2)*26,44,.18,{look:'poison'});sfx('fizz');bossGo(b,'recover');}}
  else if(b.state==='recover'){if(b.t>=(P2?24:38)){bossGo(b,'walk');b.cool=P2?24:44;}}
 },
 // 2-3 강철 거북: 등껍질 회전 돌진, 물대포, 낙석
 turtle(b){
  const P2=b.phase===2,bc=b.x+b.w/2;
  if(b.state==='walk'){faceP(b);if(Math.abs(PX()-bc)>30)b.x+=b.face*(P2?.7:.5);clampB(b);if((b.cool-=COOL2)<=0){const r=Math.random();bossGo(b,r<.4?'spinUp':r<.75?'waterUp':'rockUp');}}
  else if(b.state==='spinUp'){if(b.t===1)faceP(b);if(b.t>=24){b.vx=b.face*(P2?4.8:4);b.bounce=0;bossGo(b,'spin');sfx('roar');}}
  else if(b.state==='spin'){b.x+=b.vx;if(frame%2===0)puff(bc,b.gy-2,2,'#8fd6ff',1,.05,12);
    if(hitWall(b)){clampB(b);b.vx=-b.vx;b.bounce++;shake=7;sfx('crate');if(b.bounce>=(P2?4:2)){bossGo(b,'recover');}}}
  else if(b.state==='waterUp'){faceP(b);if(b.t===20||(P2&&b.t===44)){const n=P2?5:3;for(let i=0;i<n;i++)shotAt(bc+b.face*20,b.y+12,4,(i-(n-1)/2)*.18,{look:'water',life:160});sfx('fizz');}
    if(b.t>=(P2?56:32))bossGo(b,'recover');}
  else if(b.state==='rockUp'){if(b.t===10||b.t===34){shake=7;sfx('boom');for(let i=0;i<(P2?4:3);i++)fallAt(PX()+(Math.random()-.5)*120,'rock',36);}if(b.t>=50)bossGo(b,'recover');}
  else if(b.state==='recover'){if(b.t>=(P2?26:40)){bossGo(b,'walk');b.cool=P2?28:48;}}
 },
 // 2-4 늪의 마녀: 순간이동, 추적 저주 구슬, 독 가시, 늪 슬라임 소환
 witch(b){
  const P2=b.phase===2,bc=b.x+b.w/2,hy=b.hy||56,fy=hy+Math.sin(frame*.06)*6;
  if(b.state==='walk'||b.state==='float'){b.state='float';b.y+=(fy-b.y)*.08;b.x+=(PX()-bc>0?1:-1)*.3;clampB(b);b.face=PX()<bc?-1:1;
    if((b.cool-=COOL2)<=0){const r=Math.random(),n=enemies.filter(e=>!e.dead&&e.type==='slime').length;bossGo(b,r<.35?'curseUp':r<.62?'thornUp':(r<.82||n>=2)?'fadeOut':'summon');}}
  else if(b.state==='curseUp'){if(b.t>=22){const n=P2?4:3;for(let i=0;i<n;i++)shotAt(bc,b.y+10,1.9,(i-(n-1)/2)*.7,{look:'curse',w:8,h:8,home:.03,life:230});sfx('seal');bossGo(b,'recover');}}
  else if(b.state==='thornUp'){if(b.t>=24){const n=P2?6:4;for(let i=0;i<n;i++)spikeAt(PX()+(i-(n-1)/2)*30,'poison',i*4);sfx('grow');bossGo(b,'recover');}}
  else if(b.state==='summon'){if(b.t>=24){spawnMinion('slime',b.x-10,b.gy-10);spawnMinion('slime',b.x+b.w+2,b.gy-10);sfx('seal');bossGo(b,'recover');}}
  else if(b.state==='fadeOut'){b.alpha=Math.max(0,1-b.t/16);if(b.t>=16){b.hidden=true;blinkTo(b,b.minX+Math.random()*(b.maxX-b.minX));b.hy=30+Math.random()*60;b.y=b.hy;bossGo(b,'fadeIn');sfx('seal');}}
  else if(b.state==='fadeIn'){b.alpha=Math.min(1,b.t/16);if(b.t>=5)b.hidden=false;if(b.t>=16){b.alpha=1;bossGo(b,P2?'curseUp':'float');b.cool=P2?20:40;}}
  else if(b.state==='recover'){b.y+=(fy-b.y)*.08;if(b.t>=(P2?22:34)){bossGo(b,'float');b.cool=P2?28:50;}}
 },
 // 2-5 시든 고목: 다가오는 뿌리 가시 줄, 가지 낙하, 씨앗
 treant(b){
  const P2=b.phase===2,bc=b.x+b.w/2;
  if(b.state==='walk'){faceP(b);if(Math.abs(PX()-bc)>40)b.x+=b.face*(P2?.4:.25);clampB(b);if(b.t%30===0)shake=Math.max(shake,1);
    if((b.cool-=COOL2)<=0){const r=Math.random();bossGo(b,r<.4?'rootUp':r<.7?'branchUp':'seedUp');}}
  else if(b.state==='rootUp'){if(b.t===1)faceP(b);if(b.t>=20){const n=P2?11:8;for(let i=0;i<n;i++)spikeAt(bc+b.face*(30+i*18),'thorn',i*6-28);if(P2)for(let i=0;i<5;i++)spikeAt(bc-b.face*(30+i*18),'thorn',i*6-10);sfx('grow');bossGo(b,'recover');}}
  else if(b.state==='branchUp'){if(b.t===10||(P2&&b.t===32)){shake=8;sfx('boom');for(let i=0;i<(P2?5:4);i++)fallAt(PX()+(i-(P2?2:1.5))*36+(Math.random()-.5)*12,'branch',30+i*6);}if(b.t>=(P2?52:36))bossGo(b,'recover');}
  else if(b.state==='seedUp'){if(b.t>=16){const n=P2?10:7;for(let i=0;i<n;i++)bossHaz.push({kind:'proj',x:bc-3,y:b.y+12,w:6,h:6,vx:(PX()-bc)/62+(i-(n-1)/2)*.55,vy:-5.4-Math.random()*1.2,g:.16,t:0,life:240,look:'seed'});sfx('push');bossGo(b,'recover');}}
  else if(b.state==='recover'){if(b.t>=(P2?26:42)){bossGo(b,'walk');b.cool=P2?26:46;}}
 },
 // 2-6 해골 기사: 돌진 베기, 뛰어 내려찍기, 뼈 던지기
 boneknight(b){
  const P2=b.phase===2,bc=b.x+b.w/2,d=Math.abs(PX()-bc),landed=landBoss(b);
  if(b.state==='walk'){faceP(b);if(d>26)b.x+=b.face*(P2?1.2:.85);clampB(b);if((b.cool-=COOL2)<=0){const r=Math.random();bossGo(b,d<100&&r<.45?'slashUp':r<.7?'leapUp':'boneUp');}}
  else if(b.state==='slashUp'){if(b.t===1)faceP(b);if(b.t>=(P2?12:18)){bossGo(b,'slash');sfx('cut');}}
  else if(b.state==='slash'){b.x+=b.face*(b.t<14?5:0);clampB(b);b.slash=b.t<16;
    const hb={x:b.face>0?b.x+b.w:b.x-26,y:b.y+6,w:26,h:24};if(b.slash&&overlap(hb,p))hurtPlayer(bc);
    if(b.t>=22){b.slash=false;if(P2&&!b.again){b.again=true;bossGo(b,'slashUp');}else{b.again=false;bossGo(b,'recover');}}}
  else if(b.state==='leapUp'){if(b.t>=14){jumpAt(b,-8.4,48);bossGo(b,'air');sfx('jump');}}
  else if(b.state==='air'){if(landed){waveFrom(bc,b.gy,P2?3.8:3.2);shake=10;sfx('boom');puff(bc,b.gy,18,'#e8e0d0',2,.08,24);bossGo(b,'recover');}}
  else if(b.state==='boneUp'){faceP(b);if(b.t===18||b.t===30||(P2&&b.t===42)){for(const o of P2?[-30,0,30]:[-20,20])lob(bc,b.y+4,PX()+o,40,.2,{look:'bone'});sfx('push');}if(b.t>=(P2?50:38))bossGo(b,'recover');}
  else if(b.state==='recover'){if(b.t>=(P2?22:36)){bossGo(b,'walk');b.cool=P2?24:42;}}
 },
 // 2-7 케르베로스: 세 머리 불덩이, 덮치기, 돌진
 cerberus(b){
  const P2=b.phase===2,bc=b.x+b.w/2,landed=landBoss(b);
  if(b.state==='walk'){faceP(b);if(Math.abs(PX()-bc)>36)b.x+=b.face*(P2?1.1:.8);clampB(b);if((b.cool-=COOL2)<=0){const r=Math.random();bossGo(b,r<.4?'fireUp':r<.72?'pounceUp':'chargeUp');}}
  else if(b.state==='fireUp'){faceP(b);const heads=[[44,8],[50,16],[40,22]];
    for(let k=0;k<3;k++)if(b.t===18+k*10||(P2&&b.t===48+k*8)){const [hx,hy]=heads[k],x=b.face>0?b.x+hx:b.x+b.w-hx;lob(x,b.y+hy,PX()+(Math.random()-.5)*40,40,.14,{look:'fire'});sfx('fire');}
    if(b.t>=(P2?80:54))bossGo(b,'recover');}
  else if(b.state==='pounceUp'){if(b.t>=14){jumpAt(b,-6.8,38);bossGo(b,'air');sfx('roar');}}
  else if(b.state==='air'){if(landed){shake=9;sfx('boom');puff(bc,b.gy,18,'#d6423a',2,.08,24);if(P2)waveFrom(bc,b.gy,3.4);bossGo(b,P2&&!b.again?'pounceUp':'recover');b.again=!b.again&&P2;}}
  else if(b.state==='chargeUp'){if(b.t===1)faceP(b);if(b.t>=22){bossGo(b,'charge');sfx('roar');}}
  else if(b.state==='charge'){b.x+=b.face*(P2?5.6:4.8);if(frame%2===0)particles.push({kind:'flame',pal:'lava',x:bc-b.face*20,y:b.gy-4,vx:0,vy:-1,life:20,max:36,size:2,grow:.05,g:-.02});
    if(hitWall(b)){clampB(b);shake=9;sfx('boom');if(P2)for(let i=0;i<4;i++)spikeAt(b.minX+30+Math.random()*(b.maxX-b.minX),'fire',i*8);bossGo(b,'recover');}}
  else if(b.state==='recover'){if(b.t>=(P2?22:38)){bossGo(b,'walk');b.cool=P2?24:44;}}
 },
 // 2-8 화염 마인: 불기둥 줄, 사방 화염구, 화염 급강하
 ifrit(b){
  const P2=b.phase===2,bc=b.x+b.w/2,hy=50+Math.sin(frame*.07)*8;
  if(frame%3===0&&!b.hidden)particles.push({kind:'flame',pal:'fire',x:b.x+6+Math.random()*(b.w-12),y:b.y+b.h-6,vx:0,vy:.6,life:14,max:28,size:2,grow:.06,g:0});
  if(b.state==='walk'||b.state==='hover'){b.state='hover';const tx=PX()-b.w/2+(bc<PX()?-40:40);b.x+=(tx-b.x)*.025;clampB(b);b.y+=(hy-b.y)*.07;b.face=PX()<bc?-1:1;
    if((b.cool-=COOL2)<=0){const r=Math.random();bossGo(b,r<.36?'pillarUp':r<.68?'ringUp':'diveUp');}}
  else if(b.state==='pillarUp'){if(b.t>=22){const n=P2?4:3;for(let i=-n;i<=n;i++)spikeAt(PX()+i*30,'fire',Math.abs(i)*7);sfx('fire');bossGo(b,'recover');}}
  else if(b.state==='ringUp'){if(b.t===20||(P2&&b.t===40)){ring(bc,b.y+b.h/2,P2?12:8,1.9,'fire',b.t===40?Math.PI/12:0);sfx('fire');}if(b.t>=(P2?52:34))bossGo(b,'recover');}
  else if(b.state==='diveUp'){b.y+=(18-b.y)*.08;if(b.t>=24){b.sx=b.x;b.sy=b.y;b.tx=PX()-b.w/2;bossGo(b,'dive');sfx('roar');}}
  else if(b.state==='dive'){const s=Math.min(1,b.t/(P2?44:54));b.x=b.sx+(b.tx-b.sx)*2*s;b.y=b.sy+((b.gy-b.h)-b.sy)*Math.sin(Math.PI*s);clampB(b);
    if(frame%2===0)particles.push({kind:'flame',pal:'fire',x:bc,y:b.y+b.h/2,vx:0,vy:-.5,life:18,max:36,size:3,grow:.05,g:0});if(s>=1)bossGo(b,'recover');}
  else if(b.state==='recover'){b.y+=(hy-b.y)*.07;if(b.t>=(P2?22:34)){bossGo(b,'hover');b.cool=P2?26:46;}}
 },
 // 2-9 본 드래곤: 뼈 파편 부채꼴, 땅 스치기 돌진, 뼈 비
 bonedragon(b){
  const P2=b.phase===2,bc=b.x+b.w/2,mid=(b.minX+b.maxX)/2,hoverY=34+Math.sin(frame*.05)*6;
  if(b.state==='walk'||b.state==='hover'){b.state='hover';const tx=PX()<mid+b.w/2?b.maxX:b.minX;b.x+=(tx-b.x)*.018;b.y+=(hoverY-b.y)*.06;b.face=PX()<bc?-1:1;
    if((b.cool-=COOL2)<=0){const r=Math.random();bossGo(b,r<.4?'shardUp':r<.72?'diveUp':'rainUp');}}
  else if(b.state==='shardUp'){b.face=PX()<bc?-1:1;b.y+=(hoverY-b.y)*.06;if(b.t===22||(P2&&b.t===40)){const n=P2?9:7;for(let i=0;i<n;i++)shotAt(bc+b.face*24,b.y+12,4.2,(i-(n-1)/2)*.14,{look:'bone',life:160});sfx('screech');}if(b.t>=(P2?54:36)){bossGo(b,'hover');b.cool=P2?30:52;}}
  else if(b.state==='diveUp'){const side=b.x<mid?b.minX:b.maxX;b.x+=(side-b.x)*.08;b.y+=(30-b.y)*.08;b.face=side===b.minX?1:-1;if(b.t>=36){b.y=b.gy-b.h-2;bossGo(b,'dive');sfx('roar');}}
  else if(b.state==='dive'){b.x+=b.face*(P2?6.4:5.4);if(frame%2===0)puff(bc-b.face*20,b.y+b.h,4,'#d8d0c0',1.2,.05,14);
    if((b.face>0&&b.x>=b.maxX)||(b.face<0&&b.x<=b.minX)){clampB(b);if(P2&&!b.again){b.again=true;b.face=-b.face;b.t=0;}else{b.again=false;bossGo(b,'hover');b.cool=P2?28:48;}}}
  else if(b.state==='rainUp'){b.y+=(hoverY-b.y)*.06;if(b.t===16){shake=6;sfx('screech');const n=P2?8:6;for(let i=0;i<n;i++)fallAt(b.minX+10+(b.maxX-b.minX+b.w-20)*i/(n-1)+(Math.random()-.5)*10,'bone',20+(i%3)*14);}if(b.t>=70){bossGo(b,'hover');b.cool=P2?30:50;}}
 },
 // 2-10 심연의 촉수: 촉수 솟기, 추적 먹물, 피의 파도
 kraken(b){
  const P2=b.phase===2,bc=b.x+b.w/2;
  if(b.state==='walk'){faceP(b);if(Math.abs(PX()-bc)>30)b.x+=b.face*(P2?.5:.3);clampB(b);if((b.cool-=COOL2)<=0){const r=Math.random();bossGo(b,r<.4?'tentUp':r<.7?'inkUp':'waveUp');}}
  else if(b.state==='tentUp'){if(b.t>=18){const xs=P2?[0,-36,36,-72,72]:[0,-40,40];xs.forEach((o,i)=>spikeAt(PX()+o,'tentacle',i===0?-6:8*Math.ceil(i/2)));sfx('grow');bossGo(b,'recover');}}
  else if(b.state==='inkUp'){if(b.t>=20){const n=P2?4:3;for(let i=0;i<n;i++)shotAt(bc,b.y+14,1.8,(i-(n-1)/2)*.7,{look:'ink',w:8,h:8,home:.032,life:230});sfx('seal');bossGo(b,'recover');}}
  else if(b.state==='waveUp'){if(b.t===20||(P2&&b.t===48)){waveFrom(bc,b.gy,P2?3.8:3.2);shake=8;sfx('boom');}if(b.t>=(P2?60:36))bossGo(b,'recover');}
  else if(b.state==='recover'){if(b.t>=(P2?22:36)){bossGo(b,'walk');b.cool=P2?24:42;}}
 },
 // 2-11 흑기사: 순간이동 베기, 검기 충격파, 그림자 가시, 연속 돌진
 darkknight(b){
  const P2=b.phase===2,bc=b.x+b.w/2;
  if(b.state==='walk'){faceP(b);if(Math.abs(PX()-bc)>26)b.x+=b.face*(P2?1.3:1);clampB(b);if((b.cool-=COOL2)<=0){const r=Math.random();bossGo(b,r<.3?'warpOut':r<.52?'waveUp':r<.76?'spikeUp':'rushUp');}}
  else if(b.state==='warpOut'){b.alpha=Math.max(0,1-b.t/14);if(b.t>=14){b.hidden=true;const side=Math.random()<.5?-1:1;blinkTo(b,PX()+side*44-b.w/2);bossGo(b,'warpIn');sfx('seal');}}
  else if(b.state==='warpIn'){b.alpha=Math.min(1,b.t/10);if(b.t>=4)b.hidden=false;faceP(b);if(b.t>=(P2?12:18)){b.alpha=1;bossGo(b,'slash');sfx('cut');}}
  else if(b.state==='slash'){b.x+=b.face*(b.t<10?4:0);clampB(b);b.slash=b.t<14;
    const hb={x:b.face>0?b.x+b.w:b.x-30,y:b.y+4,w:30,h:28};if(b.slash&&overlap(hb,p))hurtPlayer(bc);if(b.t>=22){b.slash=false;bossGo(b,'recover');}}
  else if(b.state==='waveUp'){faceP(b);if(b.t===18||(P2&&b.t===40)){waveFrom(bc+b.face*16,b.gy,P2?4:3.4);shake=6;sfx('cut');}if(b.t>=(P2?52:32))bossGo(b,'recover');}
  else if(b.state==='spikeUp'){if(b.t>=20){const n=P2?7:5;for(let i=0;i<n;i++)spikeAt(PX()+(i-(n-1)/2)*30,'shadow',i*5);sfx('zap');bossGo(b,'recover');}}
  else if(b.state==='rushUp'){if(b.t===1){faceP(b);b.rushN=b.rushN||0;}if(b.t>=(P2?14:22)){bossGo(b,'rush');sfx('roar');}}
  else if(b.state==='rush'){b.x+=b.face*(P2?6:5);if(frame%2===0)puff(bc-b.face*12,b.y+b.h/2,3,'#6a3ab8',1,0,12);
    if(hitWall(b)||b.t>=60){clampB(b);b.rushN=(b.rushN||0)+1;if(b.rushN<(P2?3:1))bossGo(b,'rushUp');else{b.rushN=0;bossGo(b,'recover');}}}
  else if(b.state==='recover'){if(b.t>=(P2?20:34)){bossGo(b,'walk');b.cool=P2?22:40;}}
 },
 // 2-12 마왕: 유성 비, 어둠 구슬, 그림자 가시 파도, 임프 소환, 마왕 빔
 demonking(b){
  const P2=b.phase===2,bc=b.x+b.w/2,fy=b.gy-b.h-14+Math.sin(frame*.04)*6;
  if(b.state!=='beam'&&b.state!=='beamCharge'){b.y+=(fy-b.y)*.06;}
  if(b.state==='walk'||b.state==='float'){b.state='float';b.x+=((PX()-b.w/2)-b.x)*.008;clampB(b);b.face=PX()<bc?-1:1;
    if((b.cool-=COOL2)<=0){const r=Math.random(),n=enemies.filter(e=>!e.dead&&e.type==='bat').length;
      bossGo(b,r<.22?'meteorUp':r<.42?'orbUp':r<.62?'spikeUp':r<.82?'beamCharge':n>=2?'orbUp':'summon');}}
  else if(b.state==='meteorUp'){if(b.t===12||b.t===32||(P2&&b.t===52)){shake=6;sfx('boom');for(let i=0;i<(P2?4:3);i++)fallAt(PX()+(Math.random()-.5)*130,'fire',30+i*6);}if(b.t>=(P2?72:52))bossGo(b,'recover');}
  else if(b.state==='orbUp'){if(b.t>=22){const n=P2?6:4;for(let i=0;i<n;i++)shotAt(bc,b.y+24,1.8,(i-(n-1)/2)*.55,{look:'shadow',w:8,h:8,home:.028,life:240});sfx('seal');bossGo(b,'recover');}}
  else if(b.state==='spikeUp'){if(b.t>=20){const n=12,fromL=PX()>bc;for(let i=0;i<n;i++){const x=fromL?b.minX+8+i*30:b.maxX+b.w-8-i*30;spikeAt(x,'shadow',i*(P2?5:7)-24);}sfx('zap');bossGo(b,'recover');}}
  else if(b.state==='summon'){if(b.t>=24){spawnMinion('bat',b.x-8,b.y+10);spawnMinion('bat',b.x+b.w,b.y+10);sfx('roar');bossGo(b,'recover');}}
  else if(b.state==='beamCharge'){const cx=bc,cy=b.y+22;if(b.t<44)b.aim=Math.atan2(PY()-cy,PX()-cx);b.face=Math.cos(b.aim)<0?-1:1;
    if(b.t%3===0)particles.push({x:cx+(Math.random()-.5)*34,y:cy+(Math.random()-.5)*34,vx:0,vy:0,life:10,max:10,c:'#ff2a2a',g:0});if(b.t===1)sfx('charged');
    if(b.t>=56){bossGo(b,'beam');let ex=cx,ey=cy;for(let i=0;i<110;i++){ex+=Math.cos(b.aim)*4;ey+=Math.sin(b.aim)*4;if(solid(Math.floor(ex/TS),Math.floor(ey/TS)))break;}b.beamEnd=[ex,ey];sfx('zap');shake=7;}}
  else if(b.state==='beam'){const cx=bc,cy=b.y+22,[ex,ey]=b.beamEnd,vx=ex-cx,vy=ey-cy,L2=vx*vx+vy*vy||1,k=Math.max(0,Math.min(1,((PX()-cx)*vx+(PY()-cy)*vy)/L2));
    if(Math.hypot(cx+vx*k-PX(),cy+vy*k-PY())<10)hurtPlayer(cx);if(b.t%2===0)puff(ex,ey,4,'#ff2a2a',1.6,0,12);
    if(P2&&b.t<30){b.aim+=(Math.atan2(PY()-cy,PX()-cx)>b.aim?1:-1)*.006;let x2=cx,y2=cy;for(let i=0;i<110;i++){x2+=Math.cos(b.aim)*4;y2+=Math.sin(b.aim)*4;if(solid(Math.floor(x2/TS),Math.floor(y2/TS)))break;}b.beamEnd=[x2,y2];}
    if(b.t>=34){b.beamEnd=null;bossGo(b,'recover');}}
  else if(b.state==='recover'){if(b.t>=(P2?22:36)){bossGo(b,'float');b.cool=P2?22:40;}}
 }
});
