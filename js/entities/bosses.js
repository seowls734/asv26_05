// bosses.js — 보스 10종 AI, 보스 공격, 보상 상자와 능력 해금
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ================= bosses ================= */
let boss=null,bossHaz=[],hitElem=null;
const REWARDS=['ice','fire','upgrade','elec','grass','light','earth','wind','charge'];
const REWARDINFO={
 ice:['얼음 화살','맞은 적을 얼리고, 물과 용암을 굳혀요'],
 fire:['불 화살','덤불을 태우고 횃불과 등불을 켜요'],
 upgrade:['강화 활','평타가 더 빠르고 강해지고, 과녁 매듭을 끊어요'],
 elec:['전기 화살','발전기를 켜고 적을 마비시켜요'],
 grass:['풀 화살','흙에서 나무를 키우고 적을 뿌리로 묶어요'],
 light:['빛 화살','거울에 반사되고 수정을 깨워요'],
 earth:['땅 화살','갈라진 바위를 부수고 적을 멀리 날려요'],
 wind:['바람 화살','풍차를 돌리고 돌 블록을 밀어내요'],
 charge:['활 차징','우클릭을 2초 누르면 속성마다 강력한 차지 화살!']};
let gotCount=0,hasUp=false,canCh=false,weaponLv=0;
// 무기 강화: Lv = 쓰러뜨린 보스 수
const swordDmg=()=>Math.round((1+weaponLv*.2)*10)/10, giantDmg=()=>Math.round((3+weaponLv*.4)*10)/10;
function weaponToast(delay){setTimeout(()=>toast('검이 강해졌다! 무기 Lv.'+weaponLv+' (베기 '+swordDmg()+' · 거대한 검 '+giantDmg()+')',3000,true),delay);}
function applyAbilities(){
  const got=REWARDS.slice(0,gotCount);
  unlocked=1+got.filter(r=>ELEM.some(e=>e.id===r)).length;
  hasUp=got.includes('upgrade');canCh=got.includes('charge');weaponLv=gotCount;
  if(elem>=unlocked)setElem(0);else setElem(elem);
}
const BOSSDEF={
 slimeking:{name:'킹 슬라임',w:40,h:30,hp:10,col:'#62d26f'},
 yeti:{name:'서리 예티',w:30,h:40,hp:18,col:'#e8f4ff',immune:{freeze:1}},
 batqueen:{name:'박쥐 여왕',w:40,h:22,hp:16,col:'#9a6ad8',fly:1},
 wyvern:{name:'유적의 와이번',w:52,h:30,hp:20,col:'#3ab08a',fly:1},
 scorpion:{name:'바위 전갈',w:52,h:24,hp:22,col:'#c9784a',weak:{elec:2}},
 griffon:{name:'폭풍 그리폰',w:44,h:30,hp:22,col:'#e8d8b0',fly:1,weak:{grass:2}},
 worm:{name:'용암 웜',w:22,h:22,hp:22,col:'#ff6a1a',weak:{ice:2}},
 flower:{name:'가시꽃 여왕',w:36,h:46,hp:24,col:'#e85a8a',weak:{fire:2}},
 lich:{name:'그림자 리치',w:22,h:32,hp:24,col:'#9a5aff',fly:1,weak:{light:2}},
 golem:{name:'고대 돌골렘',w:40,h:56,hp:28,col:'#8e8a9e',armor:1}
};
function mkBoss(kind,cx,ty){const d=BOSSDEF[kind];
  return {type:'boss',kind,name:d.name,x:cx-d.w/2,y:ty+16-d.h,w:d.w,h:d.h,hp:d.hp,maxHp:d.hp,gy:ty+16,col:d.col,armor:!!d.armor,weak:d.weak||null,immune:d.immune||{},fly:!!d.fly,
    state:'sleep',t:0,coreOpen:0,face:-1,frozen:0,burn:0,shock:0,root:0,orb:0,flash:0,kvx:0,vx:0,vy:0,air:false,phase:1,cool:60,freezeImm:0,shockImm:0,orbImm:0,aim:0,beamEnd:null,
    minX:0,maxX:9999,hidden:kind==='worm',alpha:1,hist:[],hops:0,sink:0,bite:0};}
function bossBend(b){if(b.kind!=='golem')return 0;return (b.state==='recover'||b.state==='stagger'||b.state==='dying')?10:b.state==='slamUp'?-3:0;}
function bossCore(b){return b.kind==='golem'?[b.x+b.w/2,b.y+30+bossBend(b)]:[b.x+b.w/2,b.y+b.h/2];}
function bossGo(b,st){b.state=st;b.t=0;}
function faceP(b){b.face=(p.x+p.w/2)<(b.x+b.w/2)?-1:1;}
function clampB(b){b.x=Math.max(b.minX,Math.min(b.maxX,b.x));}
const PX=()=>p.x+p.w/2,PY=()=>p.y+7;
function shotAt(x,y,spd,spread,o){const a=Math.atan2(PY()-y,PX()-x)+(spread||0);bossHaz.push(Object.assign({kind:'proj',x:x-3,y:y-3,w:6,h:6,vx:Math.cos(a)*spd*.75,vy:Math.sin(a)*spd*.75,g:0,t:0,life:300,look:'orb'},o||{}));}
function lob(x,y,tx,T,g,o){const dx=tx-x,dy=PY()-y;bossHaz.push(Object.assign({kind:'proj',x:x-4,y:y-4,w:8,h:8,vx:dx/T,vy:dy/T-.5*g*T,g,t:0,life:300,look:'glob'},o||{}));}
function spikeAt(x,look,delay){if(boss)x=Math.max(boss.minX+6,Math.min(boss.maxX+boss.w-6,x));bossHaz.push({kind:'spike',x:x-6,gy:boss?boss.gy:160,y:0,w:12,h:0,warn:Math.max(10,48+(delay||0)),up:0,hold:26,look,t:0});}
function fallAt(x,look,warn){if(boss)x=Math.max(boss.minX+6,Math.min(boss.maxX+boss.w-6,x));bossHaz.push({kind:'fall',x:x-6,y:18,w:12,h:12,vy:0,warn:(warn||44)+16,t:0,look:look||'rock'});}
function waveFrom(x,gy,spd){for(const d of [-1,1])bossHaz.push({kind:'wave',x:x-5,y:gy-10,w:10,h:10,dir:d,vx:spd*.75,t:0});}
function spawnMinion(type,x,y){if(enemies.filter(e=>!e.dead&&e.type===type).length>=4)return;const m=lvl.mobs&&lvl.mobs[type==='bat'?'V':'S'];const sub=m?m.find(t=>t!=='slime'&&t!=='bat'&&MOBS[t].spd>0):null;const e=mkEnemy(type,x,y,sub||null);enemies.push(e);puff(x+5,y+4,10,'#c8b8ff',1.4,0,18);}
function landBoss(b){if(!b.air)return false;b.vy+=.35;b.y+=b.vy;b.x+=b.vx;clampB(b);if(b.y>=b.gy-b.h){b.y=b.gy-b.h;b.vy=0;b.vx=0;b.air=false;return true;}return false;}

const BOSSAI={
 slimeking(b){
  const P2=b.phase===2;
  if(!b.split1&&b.hp<=b.maxHp*.66){b.split1=true;spawnMinion('slime',b.x-4,b.gy-8);spawnMinion('slime',b.x+b.w-8,b.gy-8);toast('킹 슬라임이 분열했다!',1400,true);}
  if(!b.split2&&b.hp<=b.maxHp*.33){b.split2=true;spawnMinion('slime',b.x-4,b.gy-8);spawnMinion('slime',b.x+b.w-8,b.gy-8);}
  const landed=landBoss(b);
  if(b.state==='walk'){
    if(landed){shake=Math.max(shake,2);sfx('push');if(b.hops>=(P2?2:3)){b.hops=0;bossGo(b,'crouch');}}
    else if(!b.air&&b.t>=(P2?22:32)){faceP(b);b.air=true;b.vy=-4.6;b.vx=b.face*(P2?2.2:1.7);b.hops++;b.t=0;}
  }else if(b.state==='crouch'){if(b.t>=24){faceP(b);b.air=true;b.vy=-8.6;b.vx=(PX()-(b.x+b.w/2))/49;bossGo(b,'air');sfx('jump');}}
  else if(b.state==='air'){if(landed){waveFrom(b.x+b.w/2,b.gy,P2?3.3:2.6);shake=10;sfx('boom');puff(b.x+b.w/2,b.gy,24,'#62d26f',2,.08,26);bossGo(b,'rest');}}
  else if(b.state==='rest'){if(b.t>=(P2?36:56))bossGo(b,'walk');}
 },
 yeti(b){
  const P2=b.phase===2,bc=b.x+b.w/2;
  if(b.state==='walk'){faceP(b);if(Math.abs(PX()-bc)>24)b.x+=b.face*(P2?1:.7);clampB(b);if((b.cool-=.6)<=0){const r=Math.random();bossGo(b,r<.38?'throwUp':r<.7?'chargeUp':'breathUp');}}
  else if(b.state==='throwUp'){if(b.t>=24){const sx=bc,sy=b.y+4;for(const o of P2?[-40,-20,0,20,40]:[-28,0,28])lob(sx,sy,PX()+o,42,.18,{look:'snow'});sfx('push');bossGo(b,'recover');}}
  else if(b.state==='chargeUp'){if(b.t===1)faceP(b);if(b.t>=30){bossGo(b,'dash');sfx('roar');}}
  else if(b.state==='dash'){b.x+=b.face*(P2?5:4.2);if(frame%2===0)puff(bc-b.face*14,b.gy-2,3,'#e8f4ff',1,.05,14);
    if(b.x<=b.minX||b.x>=b.maxX){clampB(b);shake=10;sfx('boom');for(let i=0;i<(P2?6:4);i++)fallAt(b.minX+30+Math.random()*(b.maxX-b.minX),'ice',36+i*8);bossGo(b,'stun');}}
  else if(b.state==='stun'){if(b.t>=50){bossGo(b,'walk');b.cool=50;}}
  else if(b.state==='breathUp'){if(b.t===1)faceP(b);if(b.t>=22){for(let i=0;i<(P2?9:7);i++)spikeAt(bc+b.face*(26+i*17),'ice',i*5-26);sfx('freeze');bossGo(b,'recover');}}
  else if(b.state==='recover'){if(b.t>=(P2?30:46)){bossGo(b,'walk');b.cool=P2?40:70;}}
 },
 batqueen(b){
  const P2=b.phase===2,bc=b.x+b.w/2,hy=40+Math.sin(frame*.05)*10;
  if(b.state==='walk'||b.state==='hover'){b.state='hover';const tx=PX()-b.w/2+Math.sin(frame*.02)*60;b.x+=(tx-b.x)*.02;clampB(b);b.y+=(hy-b.y)*.08;b.face=PX()<bc?-1:1;
    if((b.cool-=.6)<=0){const r=Math.random(),bats=enemies.filter(e=>!e.dead&&e.type==='bat').length;bossGo(b,r<.4?'swoopUp':(r<.75||bats>=3)?'sonicUp':'summon');}}
  else if(b.state==='swoopUp'){b.x+=Math.sin(b.t*.8)*1.2;if(b.t>=30){b.sx=b.x;b.sy=b.y;b.tx=PX()-b.w/2;b.ty=PY()-b.h/2;bossGo(b,'swoop');sfx('screech');}}
  else if(b.state==='swoop'){const s=Math.min(1,b.t/50);b.x=b.sx+(b.tx-b.sx)*2*s;b.y=b.sy+(b.ty-b.sy)*Math.sin(Math.PI*s);clampB(b);if(s>=1){bossGo(b,'hover');b.cool=P2?40:70;}}
  else if(b.state==='sonicUp'){if(b.t>=18){const n=P2?5:3;for(let i=0;i<n;i++)shotAt(bc,b.y+b.h/2,2.6,(i-(n-1)/2)*.22,{look:'sonic',w:8,h:8,life:200});sfx('screech');bossGo(b,'recover');}}
  else if(b.state==='summon'){if(b.t>=24){spawnMinion('bat',b.x-6,b.y+6);spawnMinion('bat',b.x+b.w-4,b.y+6);sfx('screech');bossGo(b,'recover');}}
  else if(b.state==='recover'){b.y+=(hy-b.y)*.08;if(b.t>=30){bossGo(b,'hover');b.cool=P2?40:70;}}
 },
 wyvern(b){
  const P2=b.phase===2,bc=b.x+b.w/2,mid=(b.minX+b.maxX)/2,hoverY=34+Math.sin(frame*.05)*6,nf=P2?4:2;
  if(b.state==='walk'||b.state==='hover'){b.state='hover';const tx=PX()<mid+b.w/2?b.maxX:b.minX;b.x+=(tx-b.x)*.015;b.y+=(hoverY-b.y)*.06;b.face=PX()<bc?-1:1;
    if((b.cool-=.6)<=0){const r=Math.random();bossGo(b,r<.45?'fireUp':r<.8?'diveUp':'landDown');}}
  else if(b.state==='fireUp'){b.face=PX()<bc?-1:1;b.y+=(hoverY-b.y)*.06;
    if(b.t>=26&&(b.t-26)%10===0&&b.t<=26+10*nf){lob(bc+b.face*28,b.y+10,PX()+(Math.random()-.5)*30,40,.12,{look:'fire'});sfx('fire');}
    if(b.t>=46+10*nf){bossGo(b,'hover');b.cool=P2?50:80;}}
  else if(b.state==='diveUp'){const side=b.x<mid?b.minX:b.maxX;b.x+=(side-b.x)*.08;b.y+=(30-b.y)*.08;b.face=side===b.minX?1:-1;if(b.t>=40){b.y=b.gy-b.h-2;bossGo(b,'dive');sfx('roar');}}
  else if(b.state==='dive'){b.x+=b.face*(P2?6:5);if(frame%2===0)puff(bc-b.face*20,b.y+b.h,4,'#c9a86a',1.2,.05,14);if((b.face>0&&b.x>=b.maxX)||(b.face<0&&b.x<=b.minX)){clampB(b);bossGo(b,'hover');b.cool=P2?40:70;}}
  else if(b.state==='landDown'){b.y+=(b.gy-b.h-b.y)*.1;if(b.t>=30){b.y=b.gy-b.h;shake=9;sfx('boom');for(let i=0;i<(P2?5:3);i++)fallAt(PX()+(Math.random()-.5)*120,'rock',40+i*10);bossGo(b,'landed');}}
  else if(b.state==='landed'){faceP(b);if(b.t>=70){bossGo(b,'hover');b.cool=60;}}
 },
 scorpion(b){
  const P2=b.phase===2,bc=b.x+b.w/2;
  if(b.state==='walk'){faceP(b);if(Math.abs(PX()-bc)>30)b.x+=b.face*(P2?.9:.6);clampB(b);if((b.cool-=.6)<=0){const r=Math.random();bossGo(b,r<.42?'stingUp':r<.75?'burrow':'rushUp');}}
  else if(b.state==='stingUp'){faceP(b);if(b.t>=26){const tx=b.face>0?b.x+26:b.x+b.w-26,ty=b.y-4,n=P2?3:1;for(let i=0;i<n;i++)shotAt(tx,ty,4.6,(i-(n-1)/2)*.2,{look:'sting',life:160});sfx('zap');bossGo(b,'recover');}}
  else if(b.state==='burrow'){b.sink=Math.min(1,b.t/26);if(b.t>=26){b.hidden=true;b.tx=bc;bossGo(b,'tunnel');sfx('rumble');}}
  else if(b.state==='tunnel'){b.tx+=(PX()-b.tx)*.06;if(frame%3===0)particles.push({x:b.tx+(Math.random()-.5)*20,y:b.gy,vx:(Math.random()-.5),vy:-1.5-Math.random(),life:20,max:20,c:'#c9925a',g:.1});
    if(b.t>=(P2?44:60)){spikeAt(b.tx,'sand',-18);b.x=b.tx-b.w/2;clampB(b);bossGo(b,'emerge');}}
  else if(b.state==='emerge'){if(b.t===16){b.hidden=false;shake=8;sfx('boom');puff(b.x+b.w/2,b.gy,20,'#c9925a',2,.1,26);}b.sink=b.t<16?1:Math.max(0,1-(b.t-16)/14);if(b.t>=40){b.sink=0;bossGo(b,'recover');}}
  else if(b.state==='rushUp'){faceP(b);if(b.t>=20){bossGo(b,'rush');sfx('roar');}}
  else if(b.state==='rush'){b.x+=b.face*(P2?4.6:3.8);if(frame%2===0)puff(bc-b.face*20,b.gy-2,3,'#c9925a',1,.05,14);if(b.t>=50||b.x<=b.minX||b.x>=b.maxX){clampB(b);bossGo(b,'recover');}}
  else if(b.state==='recover'){if(b.t>=(P2?30:44)){bossGo(b,'walk');b.cool=P2?40:70;}}
 },
 griffon(b){
  const P2=b.phase===2,bc=b.x+b.w/2,hy=44+Math.sin(frame*.06)*8;
  if(b.state==='walk'||b.state==='hover'){b.state='hover';const tx=PX()-b.w/2+(bc<PX()?-50:50);b.x+=(tx-b.x)*.02;clampB(b);b.y+=(hy-b.y)*.07;b.face=PX()<bc?-1:1;
    if((b.cool-=.6)<=0){const r=Math.random();bossGo(b,r<.42?'featherUp':r<.7?'gustGo':'diveUp');}}
  else if(b.state==='featherUp'){b.face=PX()<bc?-1:1;if(b.t>=20){const n=P2?7:5;for(let i=0;i<n;i++)shotAt(bc,b.y+b.h/2,4,(i-(n-1)/2)*.16,{look:'feather',life:160});sfx('screech');bossGo(b,'recover');}}
  else if(b.state==='gustGo'){const side=PX()<(b.minX+b.maxX)/2+b.w/2?b.maxX:b.minX;b.x+=(side-b.x)*.08;b.y+=(hy+20-b.y)*.08;b.face=side===b.maxX?-1:1;
    const L=P2?120:90;
    if(b.t===30){bossHaz.push({kind:'gust',dir:b.face,life:L,t:0,x:0,y:0,w:0,h:0,nodmg:1});sfx('screech');toast('돌풍이다! 버텨!',1000,true);}
    if(b.t>30&&b.t%30===0)shotAt(bc,b.y+b.h/2,3.6,0,{look:'feather',life:160});
    if(b.t>=30+L)bossGo(b,'recover');}
  else if(b.state==='diveUp'){b.y+=(20-b.y)*.08;if(b.t>=24){b.sx=b.x;b.sy=b.y;b.tx=PX()-b.w/2;bossGo(b,'dive');sfx('roar');}}
  else if(b.state==='dive'){const s=Math.min(1,b.t/56);b.x=b.sx+(b.tx-b.sx)*2*s;b.y=b.sy+((b.gy-b.h)-b.sy)*Math.sin(Math.PI*s);clampB(b);if(s>=1)bossGo(b,'recover');}
  else if(b.state==='recover'){b.y+=(hy-b.y)*.07;if(b.t>=30){bossGo(b,'hover');b.cool=P2?40:70;}}
 },
 worm(b){
  const P2=b.phase===2,pools=b.pools;
  if(b.state==='walk'){b.hidden=true;bossGo(b,'under');}
  if(b.state==='under'){b.hidden=true;b.hist.length=0;
    if(b.t===1){b.mode=Math.random()<.55?'leap':'spit';const near=Math.abs(pools[0]-PX())<Math.abs(pools[1]-PX())?0:1;b.from=b.mode==='spit'?near:1-near;}
    const T=P2?36:52;if(b.t>T-22&&frame%3===0)particles.push({kind:'flame',pal:'lava',x:pools[b.from]+(Math.random()-.5)*30,y:b.gy,vx:0,vy:-1.6-Math.random(),life:18,max:36,size:2,grow:.05,g:.06});
    if(b.t>=T){b.hidden=false;bossGo(b,b.mode);sfx('roar');}}
  else if(b.state==='leap'){const D=P2?64:80,s=Math.min(1,b.t/D),ax=pools[b.from],bx=pools[1-b.from];const hx=ax+(bx-ax)*s,hy=b.gy+12-Math.sin(Math.PI*s)*100;b.x=hx-11;b.y=hy-11;b.face=bx>ax?1:-1;
    if(s>=1){bossGo(b,'under');puff(bx,b.gy,20,'#ff6a1a',2,.1,24);sfx('fizz');}}
  else if(b.state==='spit'){const px0=pools[b.from],rise=Math.min(1,b.t/20),dur=P2?90:72;b.x=px0-11;b.y=b.gy+12-rise*76-11+Math.sin(b.t*.1)*3;b.face=PX()<px0?-1:1;
    if(b.t>20&&b.t%(P2?18:24)===0&&b.t<20+dur){lob(px0,b.y+11,PX()+(Math.random()-.5)*24,40,.18,{look:'glob'});lob(px0,b.y+11,PX()+(Math.random()-.5)*60,48,.18,{look:'glob'});sfx('fizz');}
    if(b.t>=30+dur)bossGo(b,'sink');}
  else if(b.state==='sink'){b.y+=4;if(b.t>=22)bossGo(b,'under');}
  if(!b.hidden){b.hist.push([b.x+11,b.y+11]);if(b.hist.length>60)b.hist.shift();
    for(let k=1;k<=7;k++){const h=b.hist[b.hist.length-1-k*5];if(!h)break;const r=9-k*.6;if(h[1]<b.gy+6&&overlap({x:h[0]-r,y:h[1]-r,w:r*2,h:r*2},p))hurtPlayer(h[0]);}}
 },
 flower(b){
  const P2=b.phase===2,bc=b.x+b.w/2,d=Math.abs(PX()-bc);faceP(b);
  if(b.state==='walk'){if((b.cool-=.6)<=0){const r=Math.random();bossGo(b,d<56&&r<.5?'biteUp':r<.4?'vineUp':r<.72?'seedUp':'sporeUp');}}
  else if(b.state==='vineUp'){if(b.t>=18){const xs=P2?[0,-28,28,-56,56]:[0,-30,30];xs.forEach((o,i)=>spikeAt(PX()+o,'thorn',i===0?0:10*Math.ceil(i/2)));sfx('grow');bossGo(b,'recover');}}
  else if(b.state==='seedUp'){if(b.t>=16){const n=P2?9:7;for(let i=0;i<n;i++)bossHaz.push({kind:'proj',x:bc-3,y:b.y+6,w:6,h:6,vx:(PX()-bc)/62+(i-(n-1)/2)*.55,vy:-5.2-Math.random()*1.2,g:.16,t:0,life:240,look:'seed'});sfx('push');bossGo(b,'recover');}}
  else if(b.state==='sporeUp'){if(b.t>=20){const n=P2?3:2;for(let i=0;i<n;i++)shotAt(bc,b.y+10,1.2,(i-(n-1)/2)*.8,{look:'spore',w:8,h:8,home:.03,life:220});sfx('grow');bossGo(b,'recover');}}
  else if(b.state==='biteUp'){if(b.t>=14){bossGo(b,'bite');sfx('roar');}}
  else if(b.state==='bite'){const reach=Math.min(1,b.t/6)*34;b.bite=reach;const hb={x:b.face>0?b.x+b.w:b.x-reach,y:b.y+4,w:reach,h:18};if(reach>8&&overlap(hb,p))hurtPlayer(bc);if(b.t>=18){b.bite=0;bossGo(b,'recover');}}
  else if(b.state==='recover'){if(b.t>=(P2?28:44)){bossGo(b,'walk');b.cool=P2?24:44;}}
 },
 lich(b){
  const P2=b.phase===2,bc=b.x+b.w/2,hy=b.hy||60,fy=hy+Math.sin(frame*.05)*6;
  if(b.state==='walk'||b.state==='float'){b.state='float';b.y+=(fy-b.y)*.08;b.face=PX()<bc?-1:1;
    if((b.cool-=.6)<=0){const r=Math.random(),bats=enemies.filter(e=>!e.dead&&e.type==='bat').length;bossGo(b,r<.38?'orbUp':r<.68?'pulseUp':(r<.85||bats>=2)?'fadeOut':'summon');}}
  else if(b.state==='orbUp'){if(b.t>=24){const n=P2?4:3;for(let i=0;i<n;i++)shotAt(bc,b.y+8,1.7,(i-(n-1)/2)*.6,{look:'shadow',w:8,h:8,home:.025,life:230});sfx('seal');bossGo(b,Math.random()<.5?'fadeOut':'recover');}}
  else if(b.state==='pulseUp'){if(b.t>=28){const n=P2?6:4;for(let i=0;i<n;i++)spikeAt(PX()+(i-(n-1)/2)*34,'shadow',i*4);sfx('zap');bossGo(b,'recover');}}
  else if(b.state==='summon'){if(b.t>=24){spawnMinion('bat',b.x-8,b.y+8);spawnMinion('bat',b.x+b.w,b.y+8);bossGo(b,'recover');}}
  else if(b.state==='fadeOut'){b.alpha=Math.max(0,1-b.t/20);if(b.t>=20){b.hidden=true;b.x=b.minX+Math.random()*(b.maxX-b.minX);b.hy=34+Math.random()*60;b.y=b.hy;bossGo(b,'fadeIn');sfx('seal');}}
  else if(b.state==='fadeIn'){b.alpha=Math.min(1,b.t/20);if(b.t>=6)b.hidden=false;if(b.t>=20){b.alpha=1;bossGo(b,'float');b.cool=P2?30:50;}}
  else if(b.state==='recover'){b.y+=(fy-b.y)*.08;if(b.t>=30){bossGo(b,'float');b.cool=P2?40:65;}}
 },
 golem(b){
  const P2=b.phase===2,pc=PX(),bc=b.x+b.w/2,st=b.state;
  if(st==='walk'){b.face=pc<bc?-1:1;if(Math.abs(pc-bc)>30)b.x+=b.face*(P2?.65:.4);clampB(b);if(b.t%24===0)shake=Math.max(shake,1.5);
    if((b.cool-=.6)<=0){const d=Math.abs(pc-bc),r=Math.random();if(!P2)bossGo(b,d<96?'slamUp':'throwUp');else bossGo(b,d<96&&r<.45?'slamUp':r<.6?'throwUp':r<.8?'rainUp':'beamCharge');}}
  else if(st==='slamUp'){if(b.t===1)sfx('rumble');if(b.t>=(P2?28:40)){bossGo(b,'slam');const fx0=b.face>0?b.x+b.w+6:b.x-6;waveFrom(fx0,b.gy,P2?3.4:2.7);shake=10;sfx('boom');puff(fx0,b.gy,22,'#8e8a9e',2.2,.1,28);if(Math.abs(pc-fx0)<26&&p.y+p.h>b.gy-24)hurtPlayer(fx0);}}
  else if(st==='slam'){if(b.t>=10){bossGo(b,'recover');b.coreOpen=P2?170:210;}}
  else if(st==='recover'){if(b.t>=(P2?170:210)){bossGo(b,'walk');b.cool=P2?40:70;}}
  else if(st==='stagger'){if(b.t>=60){bossGo(b,'walk');b.cool=50;}}
  else if(st==='throwUp'){b.face=pc<bc?-1:1;if(b.t>=34){bossGo(b,'throw');const sx=bc+b.face*6,sy=b.y-14,T=48,dx=pc-sx,dy=PY()-sy;bossHaz.push({kind:'rock',x:sx-6,y:sy-6,w:12,h:12,vx:dx/T,vy:dy/T-.5*.22*T,t:0});sfx('push');}}
  else if(st==='throw'){if(b.t>=22){bossGo(b,'walk');b.cool=P2?45:80;}}
  else if(st==='rainUp'){if(b.t===12||b.t===34){shake=8;sfx('boom');for(let i=0;i<3;i++)fallAt(pc+(Math.random()-.5)*110,'rock',44);}if(b.t>=56){bossGo(b,'recover');b.coreOpen=170;}}
  else if(st==='beamCharge'){const [cx,cy]=bossCore(b);if(b.t<46)b.aim=Math.atan2(PY()-cy,pc-cx);b.face=Math.cos(b.aim)<0?-1:1;
    if(b.t%3===0)particles.push({x:cx+(Math.random()-.5)*30,y:cy+(Math.random()-.5)*30,vx:0,vy:0,life:10,max:10,c:'#3aff7a',g:0});if(b.t===1)sfx('charged');
    if(b.t>=60){bossGo(b,'beam');let ex=cx,ey=cy;for(let i=0;i<110;i++){ex+=Math.cos(b.aim)*4;ey+=Math.sin(b.aim)*4;if(solid(Math.floor(ex/TS),Math.floor(ey/TS)))break;}b.beamEnd=[ex,ey];sfx('zap');shake=6;}}
  else if(st==='beam'){const [cx,cy]=bossCore(b),[ex,ey]=b.beamEnd,px2=PX(),py2=PY();const vx=ex-cx,vy=ey-cy,L2=vx*vx+vy*vy||1,k=Math.max(0,Math.min(1,((px2-cx)*vx+(py2-cy)*vy)/L2));
    if(Math.hypot(cx+vx*k-px2,cy+vy*k-py2)<9)hurtPlayer(cx);if(b.t%2===0)puff(ex,ey,4,'#3aff7a',1.6,0,12);if(b.t>=32){bossGo(b,'recover');b.coreOpen=170;b.beamEnd=null;}}
 }
};

function updateBoss(){
  const b=boss;if(!b||b.state==='dead')return;
  if(b.state==='sleep'){
    if(p.x>(b.gx+3)*TS&&state==='play'){bossGo(b,'wake');const L=links.find(l=>l.type==='bossgate');if(L)L.open=false;sfx('gate');sfx('roar');shake=10;
      toast(b.name+' 등장!',2200,true);screenEl.classList.add('bossfight');$('bossbar').hidden=false;$('bname').textContent=b.name;}
    return;
  }
  b.t++;if(b.flash>0)b.flash--;b.root=0;b.kvx=0;
  if(b.state==='dying'){
    shake=Math.max(shake,4);b.hidden=false;b.alpha=1;b.sink=0;
    if(b.t%5===0)puff(b.x+Math.random()*b.w,b.y+Math.random()*b.h,10,Math.random()<.4?b.col:'#ffffff',1.8,.1,30);
    if(b.fly&&b.y<b.gy-b.h)b.y+=1.5;
    if(b.t===60){flash=8;sfx('boom');}
    if(b.t>=120){b.state='dead';b.dead=true;const [cx,cy]=bossCore(b);puff(cx,cy,40,b.col,2.6,0,40);sfx('solve');flash=10;bossHaz=[];
      screenEl.classList.remove('bossfight');$('bossbar').hidden=true;
      for(const e of enemies)if(!e.dead&&e.type!=='boss'){e.dead=true;puff(e.x+e.w/2,e.y+e.h/2,8,'#ffffff',1.2);}
      if(b.kind==='golem'||b.kind==='demonking'){grid[8][b.exitCol]='X';grid[9][b.exitCol]='X';setTimeout(()=>toast(b.kind==='golem'?'돌골렘을 쓰러뜨렸다! 빛나는 출구로 가자':'마왕을 쓰러뜨렸다! 빛나는 출구로 가자',3000,true),400);}
      else{items.push({type:'chest',x:b.chestCol*TS+1,y:b.gy-12,w:14,h:12,t:0});setTimeout(()=>toast(b.name+' 처치! 보물상자를 열어 보자 (E)',2800,true),400);}
    }
    return;
  }
  // status effects, with resistances so they can't be chained forever
  if(b.immune.freeze)b.frozen=0;
  if(b.freezeImm>0){b.freezeImm--;b.frozen=0;}else if(b.frozen>0){if(b.frozen>60)b.frozen=60;b.frozen--;if(b.frozen===0)b.freezeImm=240;}
  if(b.shockImm>0){b.shockImm--;b.shock=0;}else if(b.shock>0){if(b.shock>75)b.shock=75;b.shock--;if(b.armor)b.coreOpen=Math.max(b.coreOpen,b.shock);
    if(frame%4===0)particles.push({x:b.x+Math.random()*b.w,y:b.y+Math.random()*b.h,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2,life:6,max:6,c:'#ffe14d',g:0});
    if(b.shock%60===0){hitElem='elec';dmgEnemy(b,1,0,true);hitElem=null;}
    if(b.shock===0)b.shockImm=300;}
  if(b.orbImm>0)b.orbImm--;
  if(b.orb>0){b.orb--;if(b.orb===0)lightBurst(b);}
  if(b.burn>0){b.burn--;if(frame%3===0)particles.push({x:b.x+Math.random()*b.w,y:b.y+Math.random()*b.h,vx:0,vy:-.8,life:14,max:14,c:Math.random()<.5?'#ff7a2a':'#ffd34d',g:-.01});if(b.burn%60===0){hitElem='fire';dmgEnemy(b,1,0,true);hitElem=null;}}
  if(b.coreOpen>0)b.coreOpen--;
  if(b.state==='dying'||b.state==='dead')return;
  const paused=b.frozen>0||b.shock>0||b.orb>0;
  b.heartT=(b.heartT||0)+1;if(b.heartT>=720&&p.hp<=3){b.heartT=0;dropHeart(b);}
  if(b.state==='wake'){if(b.fly)b.y+=(44-b.y)*.04;if(b.t>70){bossGo(b,'walk');b.cool=40;}}
  else if(!paused)BOSSAI[b.kind](b);
  if(!paused&&!b.hidden&&b.state!=='wake'&&overlap(b,p))hurtPlayer(b.x+b.w/2);
}
function updateBossHaz(){
  for(const h of bossHaz){
    h.t++;
    if(h.kind==='wave'){h.x+=h.dir*h.vx;const fx=h.dir>0?h.x+h.w:h.x;if(solid(Math.floor(fx/TS),Math.floor((h.y+h.h-1)/TS))||h.t>150)h.dead=true;
      if(frame%2===0)particles.push({x:h.x+h.w/2,y:h.y+h.h,vx:-h.dir*.6,vy:-1-Math.random(),life:16,max:16,c:'#8e8a9e',g:.1});}
    else if(h.kind==='rock'||h.kind==='pebble'){h.vy+=.22;h.x+=h.vx;h.y+=h.vy;
      if(solid(Math.floor((h.x+h.w/2)/TS),Math.floor((h.y+h.h)/TS))||h.t>200){h.dead=true;shake=Math.max(shake,h.kind==='rock'?5:1);puff(h.x+h.w/2,h.y+h.h,h.kind==='rock'?14:5,'#8e8a9e',1.6,.1,22);
        if(h.kind==='rock'){sfx('crate');for(const v of [-1.8,0,1.8])bossHaz.push({kind:'pebble',x:h.x+3,y:h.y-4,w:6,h:6,vx:v,vy:-2.6,t:0});}}}
    else if(h.kind==='fall'){if(h.warn>0)h.warn--;else{h.vy+=.32;h.y+=h.vy;if(solid(Math.floor((h.x+h.w/2)/TS),Math.floor((h.y+h.h)/TS))){h.dead=true;shake=Math.max(shake,4);sfx('crate');puff(h.x+6,h.y+12,14,{ice:'#e8f4ff',fire:'#ff8a2a',bone:'#e8e0d0',branch:'#6a5232'}[h.look]||'#8e8a9e',1.8,.1,24);}}}
    else if(h.kind==='spike'){
      if(h.warn>0){h.warn--;if(h.warn<14&&frame%3===0)particles.push({x:h.x+Math.random()*12,y:h.gy,vx:0,vy:-1,life:12,max:12,c:{ice:'#e8f4ff',thorn:'#6fdc5a',shadow:'#9a5aff',fire:'#ff8a2a',poison:'#a85ad8',tentacle:'#c83a5a'}[h.look]||'#c9925a',g:.05});}
      else{h.t2=(h.t2||0)+1;const H=26;h.up=h.t2<6?H*h.t2/6:h.t2<6+h.hold?H:h.t2<12+h.hold?H*(12+h.hold-h.t2)/6:0;if(h.t2===1)sfx('crate');if(h.t2>=12+h.hold)h.dead=true;h.y=h.gy-h.up;h.h=h.up;}}
    else if(h.kind==='proj'){
      if(h.home){const a=Math.atan2(PY()-(h.y+h.h/2),PX()-(h.x+h.w/2)),sp=Math.hypot(h.vx,h.vy)||1;h.vx+=(Math.cos(a)*sp-h.vx)*h.home;h.vy+=(Math.sin(a)*sp-h.vy)*h.home;}
      h.vy+=h.g;h.x+=h.vx;h.y+=h.vy;h.life--;
      if(frame%2===0){const c={fire:'#ff8a2a',glob:'#ff6a1a',snow:'#ffffff',sonic:'#c88aff',spore:'#9be07a',shadow:'#7a3ab8',feather:'#e8d8b0',sting:'#ffe14d',seed:'#7a5230',poison:'#a85ad8',bone:'#e8e0d0',blood:'#b81a2a',water:'#8fd6ff',curse:'#7ad85a',ink:'#3a0a2a'}[h.look]||'#ffffff';particles.push({x:h.x+h.w/2,y:h.y+h.h/2,vx:0,vy:0,life:10,max:10,c,g:0});}
      if(h.life<=0||h.y>VH||solid(Math.floor((h.x+h.w/2)/TS),Math.floor((h.y+h.h/2)/TS))){h.dead=true;
        const c={fire:'#ff8a2a',glob:'#ff6a1a',snow:'#e8f4ff',spore:'#9be07a',shadow:'#9a5aff',poison:'#a85ad8',blood:'#b81a2a',water:'#8fd6ff',curse:'#7ad85a',ink:'#6a1a3a',bone:'#e8e0d0'}[h.look]||'#c9c2dc';puff(h.x+h.w/2,h.y+h.h/2,h.look==='fire'||h.look==='glob'?12:6,c,1.4,.04,18);}}
    else if(h.kind==='gust'){h.life--;if(!p.riding)p.vx+=h.dir*.42;
      for(let i=0;i<2;i++)particles.push({x:cam+(h.dir>0?0:VW)+(Math.random()-.5)*10,y:20+Math.random()*150,vx:h.dir*(5+Math.random()*3),vy:0,life:50,max:50,c:'rgba(232,248,255,.8)',g:0});
      if(h.life<=0)h.dead=true;}
    if(!h.dead&&!h.nodmg&&!(h.kind==='fall'&&h.warn>0)&&!(h.kind==='spike'&&(h.warn>0||h.up<6))&&overlap(h,p))hurtPlayer(h.x+h.w/2);
  }
  bossHaz=bossHaz.filter(h=>!h.dead);
}
function dropHeart(b){
  const x=b.minX+16+Math.random()*(b.maxX-b.minX);
  items.push({type:'heart',x,y:b.gy-14,w:7,h:6,t:0});puff(x+3,b.gy-10,14,'#ff9a8f',1.4,0,24);sfx('pick');
  toast('하트가 떨어졌다! 다가가서 E로 줍자',1800,true);
}
function openChest(it){
  it.opened=true;const r=REWARDS[lvlIndex];
  // 시즌 2 상자: 하트를 모두 채우고 동전 10개
  if(lvl.season===2){gotCount=Math.max(gotCount,lvlIndex+1);applyAbilities();weaponToast(3200);p.hp=p.maxHp;p.coins+=10;flash=8;shake=4;sfx('solve');puff(it.x+7,it.y,30,'#ff9a8f',2,.02,40);
    toast('하트를 모두 채웠다! 동전 +10',3000,true);if(boss){grid[8][boss.exitCol]='X';grid[9][boss.exitCol]='X';}return;}
  if(!r)return;
  gotCount=Math.max(gotCount,lvlIndex+1);applyAbilities();
  const ei=ELEM.findIndex(e=>e.id===r);if(ei>=0)setElem(ei);
  const [nm,desc]=REWARDINFO[r];
  flash=8;shake=4;sfx('solve');puff(it.x+7,it.y,30,'#ffd34d',2,.02,40);
  summons.push({type:'reward',x:it.x+7,y:it.y-8,life:160,r,t:0});
  toast(nm+' 획득! '+desc,4200,true);
  if(ei>=0)setTimeout(()=>toast((TOUCH?'속성 버튼':'F 키나 '+(ei+1)+'번 키')+'로 '+nm+'을 고를 수 있어요',3000),4400);
  weaponToast(ei>=0?7600:4400);
  if(boss){grid[8][boss.exitCol]='X';grid[9][boss.exitCol]='X';}
}
