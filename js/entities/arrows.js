// arrows.js — 화살 발사(일반·강화·차지), 화살 비행과 충돌, 풍차 회전
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ================= arrows ================= */
const CHG={normal:[6.4,.02],ice:[6.2,.04],fire:[4.6,0],elec:[7,.03],grass:[5.6,.05],light:[9,0],earth:[5.6,.07],wind:[6.2,0]};
function normalSG(id){return id==='light'?[7,0]:id==='earth'?[5.2,.1]:id==='wind'?[8,0]:[5.6,.06];}
function shoot(ang,charged){
  if(p.shootCD>0)return false;p.shootCD=(hasUp&&!charged)?9:16;
  const id=ELEM[elem].id;let [s,g]=normalSG(id);if(hasUp)s*=1.2;
  if(charged)[s,g]=CHG[id];
  if(charged&&id==='earth')startQuake();
  if(charged&&id==='wind'){sfx('screech');toast('독수리가 날아간다!',1000,true);}
  const cx=p.x+p.w/2,cy=p.y+6;
  arrows.push({x:cx+Math.cos(ang)*6,y:cy+Math.sin(ang)*6,vx:Math.cos(ang)*s,vy:Math.sin(ang)*s,g,el:elem,charged,life:charged?(id==='wind'?220:160):110,stuck:0,hit:new Set(),mirror:null,up:hasUp&&!charged});
  if(Math.abs(Math.cos(ang))>.05)p.face=Math.cos(ang)>0?1:-1;p.bowT=16;p.bowAng=ang;
  if(charged){sfx('bowBig');shake=Math.max(shake,3);puff(cx+Math.cos(ang)*10,cy+Math.sin(ang)*10,12,ELEM[elem].col,1.8,0,18);if(id==='fire')sfx('roar');}
  else sfx('bow');
  return true;
}
function arrowTile(a,tx,ty,c){
  const id=ELEM[a.el].id,col=ELEM[a.el].col;
  if(id==='grass'&&c==='o'){growTree(tx,ty,false);return true;}
  if(id==='grass'&&!grassHint&&c==='#'){grassHint=true;toast('풀 화살은 갈아놓은 흙에서만 나무를 키워요',2200,true);}
  if(id==='fire'&&c==='t'){sfx('fizz');puff(a.x,a.y,8,'#bfe8f0',1,-.03,20);toast('젖어서 불이 붙지 않아',1500,true);return true;}
  if(id==='fire'&&(c==='T'||c==='B')){ignite(tx,ty);sfx('fire');return true;}
  if(id==='fire'&&(c==='i'||c==='A')){meltAt(tx,ty);return true;}
  if(id==='elec'&&c==='Z'){power(tx,ty);return true;}
  if(id==='light'&&c==='*'){activateCrystal(tx,ty);return true;}
  if(id==='earth'&&c==='B'){breakTile(tx,ty);return true;}
  if(id==='earth'&&c==='k'){grid[ty][tx]='.';sfx('crate');shake=Math.max(shake,3);puff(tx*TS+8,ty*TS+8,12,'#8e8a9e',1.8,.12,30);return true;}
  if(id==='light'&&c==='%'){sfx('fizz');puff(a.x,a.y,8,'#4a2a7a',1,-.02,20);toast('그림자가 빛을 삼켰다… 더 강한 빛이 필요해',1800,true);return true;}
  puff(a.x,a.y,4,col,1,0,12);return false;
}
function activateCrystal(tx,ty){const L=links.find(l=>l.type==='crystal'&&l.at[0]===tx&&l.at[1]===ty);if(!L||L.open)return;L.open=true;puff(tx*TS+8,ty*TS+8,20,'#fff6c8',1.8,0,30);sfx('seal');solved();}
function chargedImpact(a,tx,ty,c,enemy){
  const id=ELEM[a.el].id;
  if(id==='ice'){if(c==='w')freezeWater(tx,ty,5);else iceSpikes(a.x,enemy?Math.floor((enemy.y+enemy.h-1)/TS):(SOLID.has(c)||blockAt(tx,ty)?ty:ty));}
  else if(id==='fire')summonDragon(a.x,a.y);
  else if(id==='elec')summons.push({type:'thunder',cols:[tx,tx-2,tx+2],t:0,i:0});
  else if(id==='grass'){if(c==='o')growTree(tx,ty,true);else rootBurst(a.x,a.y);}
  else if(id==='light'){if(c==='*')activateCrystal(tx,ty);spawnSun(a.x-a.vx*.6,a.y-a.vy*.6);}
  else if(id==='normal'){puff(a.x,a.y,10,'#7dff8a',1.6,0,18);}
  else if(id==='earth'){spawnGeyser(a.x,ty);}
}
function chargedEnemy(a,e){
  const id=ELEM[a.el].id;
  if(id==='ice'){dmgEnemy(e,1,0);if(!e.dead)e.frozen=120;chargedImpact(a,0,0,'.',e);}
  else if(id==='fire'){dmgEnemy(e,1,0);if(!e.dead)e.burn=180;summonDragon(e.x+e.w/2,e.y);}
  else if(id==='elec'){dmgEnemy(e,1,0);const tx=Math.floor((e.x+e.w/2)/TS);summons.push({type:'thunder',cols:[tx,tx-2,tx+2],t:0,i:0});}
  else if(id==='grass'){
    if(e.type!=='boss'&&e.hp<=Math.ceil(e.maxHp/3))spawnGolem(e);
    else spawnDrainTree(e);
  }
  else if(id==='earth'){dmgEnemy(e,1,0);spawnGeyser(e.x+e.w/2,Math.floor((e.y+e.h-1)/TS));}
  else if(id==='light'){if(e.orb>0||(e.type==='boss'&&e.orbImm>0))return;e.orb=96;e.frozen=0;sfx('seal');puff(e.x+e.w/2,e.y+e.h/2,16,'#fff6c8',1.6,0,24);}
}
function lightBurst(e){
  const x=e.x+e.w/2,y=e.y+e.h/2;
  hitElem='light';dmgEnemy(e,5,0,false,true);hitElem=null;if(e.type==='boss')e.orbImm=600;
  for(const o of enemies){if(o===e||o.dead)continue;if(Math.hypot(o.x+o.w/2-x,o.y+o.h/2-y)<44)dmgEnemy(o,2,Math.sign(o.x-x)*3);}
  for(let i=0;i<36;i++){const a=i/36*Math.PI*2;particles.push({x,y,vx:Math.cos(a)*3.2,vy:Math.sin(a)*3.2,life:18,max:18,c:i%2?'#ffffff':'#ffd34d',g:0});}
  puff(x,y,20,'#fff6c8',2.4,0,22);
  summons.push({type:'burst',x,y,life:22});
  flash=6;shake=Math.max(shake,9);freeze=Math.max(freeze,4);sfx('boom');
}
let drainHint=false;
function spawnDrainTree(e){
  if(e.drained)return;
  const cx=e.x+e.w/2,c=Math.floor(cx/TS),gr=surfaceBelow(c,Math.floor((e.y+e.h-1)/TS)),gy=gr<0?VH:gr*TS;
  const side=(p.x+p.w/2<cx)?1:-1;
  e.drained=true;if(e.type!=='boss')e.root=99999;
  summons.push({type:'tree',e,x:cx+side*(e.type==='boss'?30:18),gy,t:0,dying:0,n:0});
  sfx('grow');puff(cx,gy-2,18,'#6fdc5a',1.6,.02,26);
  if(!drainHint){drainHint=true;toast('나무가 뿌리로 적을 붙잡아 피를 빨아들인다! (피 1/3 이하면 골렘)',2600,true);}
}
function updateArrows(){
  for(const a of arrows){
    if(a.dead)continue;
    if(a.stuck){a.stuck--;if(a.stuck<=0)a.dead=true;continue;}
    a.life--;if(a.life<=0){a.dead=true;continue;}
    a.vy+=a.g;
    const id=ELEM[a.el].id,col=ELEM[a.el].col;hitElem=id;
    if(a.charged&&id==='wind'){
      a.x+=a.vx;a.y+=a.vy;
      if(frame%2===0)for(let i=0;i<2;i++)particles.push({x:a.x-a.vx*2+(Math.random()-.5)*14,y:a.y+(Math.random()-.5)*14,vx:-a.vx*.3,vy:(Math.random()-.5)*.4,life:16,max:16,c:Math.random()<.5?'#b6f05a':'#e2ffa8',g:0});
      const hb={x:a.x-14,y:a.y-9,w:28,h:18};
      for(const e of enemies){if(e.dead||e.hidden||a.hit.has(e))continue;if(overlap(hb,e)){a.hit.add(e);dmgEnemy(e,3,Math.sign(a.vx||1)*4);puff(e.x+e.w/2,e.y+e.h/2,10,'#b6f05a',1.8,.02,20);}}
      const tx=Math.floor(a.x/TS),ty=Math.floor(a.y/TS);if(cell(tx,ty)==='W')spinWindmill(tx,ty);
      if(a.x<cam-90||a.x>cam+VW+90||a.y<-60||a.y>VH+60)a.dead=true;
      continue;
    }
    if(a.charged){if(frame%1===0)particles.push({x:a.x+(Math.random()-.5)*4,y:a.y+(Math.random()-.5)*4,vx:-a.vx*.1,vy:-a.vy*.1+(id==='fire'?-.3:0),life:14,max:14,c:id==='normal'?'#7dff8a':id==='fire'?(Math.random()<.5?'#ff7a2a':'#ffd34d'):col,g:0});}
    else if((id!=='normal'||a.up)&&frame%2===0)particles.push({x:a.x,y:a.y,vx:0,vy:0,life:10,max:10,c:a.up&&id==='normal'?'#ffd34d':col,g:0});
    const sp=Math.hypot(a.vx,a.vy),n=Math.max(2,Math.ceil(sp/3));
    outer:for(let s=0;s<n;s++){
      a.x+=a.vx/n;a.y+=a.vy/n;
      if(a.x<0||a.x>W*TS||a.y>VH+10||a.y<-60){a.dead=true;break;}
      for(const e of enemies){
        if(e.dead||e.hidden||a.hit.has(e))continue;
        const pad=a.charged?4:2;
        if(a.x>e.x-pad&&a.x<e.x+e.w+pad&&a.y>e.y-pad&&a.y<e.y+e.h+pad){
          if(a.charged&&id==='normal'){a.hit.add(e);dmgEnemy(e,4,Math.sign(a.vx||1)*5);continue;}
          if(a.charged){chargedEnemy(a,e);a.dead=true;break outer;}
          arrowHitEnemy(e,a);a.dead=true;break outer;
        }
      }
      if(golem&&a.charged&&false)break;
      const tx=Math.floor(a.x/TS),ty=Math.floor(a.y/TS);
      if(ty<0||ty>=ROWS)continue;
      const c=cell(tx,ty);
      if(c==='/'||c==='\\'){
        if(id==='light'){const key=tx+','+ty;if(a.mirror!==key){a.mirror=key;const vx=a.vx,vy=a.vy;if(c==='/'){a.vx=-vy;a.vy=-vx;}else{a.vx=vy;a.vy=vx;}a.x=tx*TS+8;a.y=ty*TS+8;sfx('light');puff(a.x,a.y,6,'#ffffff',1,0,12);}continue;}
        a.stuck=45;a.x-=a.vx/n;a.y-=a.vy/n;puff(a.x,a.y,4,'#c9ced8',1,0,10);break;
      }
      if(c==='I'){const lx=a.x-tx*TS,ly=a.y-ty*TS;if(id==='fire'&&!a.charged&&lx>=2&&lx<=14&&ly>=1&&ly<=11){lightTorch(tx,ty);a.dead=true;break;}continue;}
      if(c==='@'){
        if((a.charged||a.up)&&id==='normal'){cutTarget(tx,ty);continue;}
        if(!hardHint){hardHint=true;toast('너무 단단해. 더 강한 화살이 필요해',1800,true);}
        puff(a.x,a.y,4,'#ffffff',1,0,10);sfx('hit');a.dead=true;break;
      }
      if(c==='L'&&(id==='light'||id==='fire')&&a.y<ty*TS+9&&lightLantern(tx,ty)){if(a.charged)spawnSun(a.x,a.y);a.dead=true;break;}
      if(c==='W'){
        if(id==='wind'){spinWindmill(tx,ty);a.dead=true;break;}
        if(!millHint){millHint=true;toast('풍차는 바람 화살로만 돌아가요',1600,true);}
        continue;
      }
      if(c==='w'||c==='l'){
        if(id==='ice')freezeLiquid(tx,ty,a.charged?5:2,c);
        else if(c==='l'){puff(a.x,ty*TS+2,8,'#ff8a2a',1.2,-.04,18);sfx('fizz');}
        else if(a.charged)chargedImpact(a,tx,ty,c);
        else{puff(a.x,ty*TS+2,6,id==='elec'?'#ffe14d':'#8fd6ff',1.2,.08,18);sfx('splash');}
        a.dead=true;break;
      }
      const blk=blockAt(tx,ty);
      if(SOLID.has(c)||blk){
        if(a.charged&&id==='normal'){
          if(c==='B'||c==='R'){breakTile(tx,ty);continue;}
          if(blk){tryPush(blk,Math.sign(a.vx)||1);a.dead=true;puff(a.x,a.y,10,'#7dff8a',1.6);break;}
          if(c==='i'||c==='A'||c==='T'){breakTile(tx,ty);continue;}
        }
        if(id==='wind'&&blk){tryPush(blk,Math.sign(a.vx)||1);a.dead=true;puff(a.x,a.y,10,'#b6f05a',1.6);break;}
        a.x-=a.vx/n;a.y-=a.vy/n;
        if(a.charged){chargedImpact(a,tx,ty,c);a.dead=id!=='normal';if(id==='normal')a.stuck=45;break;}
        const used=arrowTile(a,tx,ty,c);
        if(used&&id!=='light')a.dead=true;else a.stuck=id==='light'?480:45;
        if(id==='light'&&!used)sfx('light');
        break;
      }
    }
  }
  hitElem=null;
  arrows=arrows.filter(a=>!a.dead);
}
let millHint=false;
function spinWindmill(tx,ty){
  const L=links.find(l=>l.type==='windmill'&&l.at[0]===tx&&l.at[1]===ty);if(!L)return;
  const fresh=!(L.spin>60);L.spin=120;sfx('swap');puff(tx*TS+8,ty*TS+8,10,'#e2ffa8',1.6,0,18);
  if(fresh&&L.mirrors){for(const [x,y] of L.mirrors){grid[y][x]=cell(x,y)==='/'?'\\':'/';puff(x*TS+8,y*TS+8,6,'#ffffff',1,0,12);}sfx('push');toast('풍차가 돌며 거울이 돌아갔다',1400,true);}
  if(L.gates&&!L.open){L.open=true;solved();}
}
function arrowHitEnemy(e,a){
  const id=ELEM[a.el].id,kb=id==='earth'?3.6:id==='wind'?5:id==='ice'?0:1.5;
  dmgEnemy(e,a.up?2:1,Math.sign(a.vx||1)*kb);if(e.dead)return;
  if(id==='earth'&&e.type==='slime'&&!isStuck(e))e.vy=-3.2;
  if(id==='ice'){e.frozen=120;sfx('freeze');}
  else if(id==='fire'){e.burn=180;sfx('fire');}
  else if(id==='elec'){e.shock=180;sfx('zap');}
  else if(id==='grass'){e.root=300;sfx('grow');}
  else if(id==='light'){puff(e.x+e.w/2,e.y+e.h/2,10,'#fff6c8',1.6);}
}
