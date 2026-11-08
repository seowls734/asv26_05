// summons.js — 드래곤 브레스, 낙뢰, 지진, 용암 분출, 나무 골렘, 흡혈 나무, 작은 태양
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ================= summons ================= */
function summonDragon(hx,hy){
  const dir=p.face,cc=Math.floor(hx/TS),gr=surfaceBelow(cc,Math.max(0,Math.floor(hy/TS))),gy=gr<0?VH-16:gr*TS;
  summons.push({type:'dragon',hx,hy,gy,dir,x:cam+(dir>0?-70:VW+70),y:20,ty:Math.max(30,Math.min(110,gy-86)),phase:'in',t:0});
  sfx('roar');toast('용이 날아온다!',1200,true);
}
function applyBreath(d){
  hitElem='fire';
  const x0=d.hx-56,x1=d.hx+56,top=d.y+10;
  for(const e of enemies){if(e.dead)continue;const ex=e.x+e.w/2;if(ex>=x0&&ex<=x1&&e.y+e.h>top){e.burn=Math.max(e.burn,180);if(d.t%20===0)dmgEnemy(e,1,0,true);}}
  hitElem=null;if(d.t%6!==0)return;
  for(let tx=Math.floor(x0/TS);tx<=Math.floor(x1/TS);tx++)for(let ty=Math.max(0,Math.floor(top/TS));ty<ROWS;ty++){
    const c=cell(tx,ty);
    if(c==='T'||c==='B'||c==='t')ignite(tx,ty,true);
    else if(c==='i'||c==='A')meltAt(tx,ty);
    else if(c==='I')lightTorch(tx,ty);
    if(solid(tx,ty)&&c!=='T'&&c!=='B'&&c!=='t'&&c!=='b'&&c!=='i'&&c!=='A')break;
  }
}
function strike(cx){
  if(cx<0||cx>=W)return;
  let r=0;while(r<ROWS&&solid(cx,r)&&grid[r][cx]!=='g')r++;
  let y=r;while(y<ROWS&&!(solid(cx,y)&&grid[y][cx]!=='g'))y++;
  const x=cx*TS+8,top=r*TS,bot=y>=ROWS?VH:y*TS;
  const pts=[];for(let yy=top;yy<bot;yy+=6)pts.push([x+(Math.random()-.5)*8,yy]);pts.push([x,bot]);
  bolts.push({pts,life:12});
  hitElem='elec';for(const e of enemies){if(e.dead)continue;const ex=e.x+e.w/2,ey=e.y+e.h/2;if(Math.abs(ex-x)<e.w/2+8&&e.y+e.h>top-8&&e.y<bot+8){dmgEnemy(e,3,0);if(!e.dead)e.shock=180;}}hitElem=null;
  if(y<ROWS){const c=grid[y][cx];if(c==='Z')power(cx,y);else if(c==='T'||c==='B')ignite(cx,y);}
  puff(x,bot,14,'#ffe14d',2.2,.05,18);puff(x,bot,6,'#ffffff',1.4,0,10);
  flash=5;shake=Math.max(shake,7);sfx('thunder');
}
function startQuake(){
  summons.push({type:'quake',t:0});sfx('rumble');shake=Math.max(shake,8);toast('쿠르릉… 지진이다!',1200,true);
}
function spawnGeyser(x,fromRow){
  const c=Math.floor(x/TS),sRow=surfaceBelow(c,Math.max(0,fromRow));if(sRow<0)return;
  summons.push({type:'geyser',x:c*TS+8,gy:sRow*TS,t:0});sfx('boom');shake=Math.max(shake,5);
}
function spawnGolem(e){
  e.dead=true;puff(e.x+e.w/2,e.y+e.h/2,20,'#6fdc5a',1.8);sfx('golem');
  golem={x:e.x+e.w/2-6,y:e.y+e.h-18,w:12,h:18,vx:0,vy:0,hp:6,life:1200,mode:'follow',atkCD:0,face:p.face,t:0,inv:0,onGround:false,pushT:0,punch:0};
  toast('나무 골렘이 깨어났다! (E: 따라와 / 여기 있어)',2400,true);
}
function rootBurst(x,y){for(const e of enemies){if(!e.dead&&Math.hypot(e.x+e.w/2-x,e.y+e.h/2-y)<48)e.root=300;}puff(x,y,20,'#6fdc5a',2,.04,24);sfx('grow');}
function spawnSun(x,y){
  summons.push({type:'sun',x,y,life:900});sfx('seal');flash=3;
  for(const l of lanterns)if(!l.lit&&Math.hypot(l.tx*TS+8-x,l.ty*TS+4-y)<=6*TS)lightLantern(l.tx,l.ty);
  dissolveShadow(x,y);
}
function updateSummons(){
  for(const s of summons){
    s.t=(s.t||0)+1;
    if(s.type==='dragon'){
      if(s.phase==='in'){s.x+=s.dir*4.6;s.y+=(s.ty-s.y)*.08;const hover=s.hx-s.dir*64;if(s.dir>0?s.x>=hover:s.x<=hover){s.x=hover;s.phase='breath';s.t=0;sfx('roar');}}
      else if(s.phase==='breath'){
        s.y=s.ty+Math.sin(s.t*.15)*1.5;
        const mx=s.x+s.dir*28,my=s.y-5;
        const aimX=s.hx+Math.sin(s.t*.09)*44,aimY=s.gy;
        const base=Math.atan2(aimY-my,aimX-mx);
        for(let i=0;i<6;i++){const a=base+(Math.random()-.5)*.24,sp=4.2+Math.random()*1.6;
          particles.push({kind:'flame',x:mx+Math.cos(a)*2,y:my+Math.sin(a)*2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:24+Math.random()*12,max:34,size:1.5,grow:.22,g:.03});}
        if(s.t%3===0)particles.push({kind:'flame',x:mx,y:my,vx:s.dir*.6,vy:-.4,life:10,max:34,size:3,grow:.1,g:0});
        if(s.t>10)applyBreath(s);if(s.t%6===0)shake=Math.max(shake,2.5);if(s.t%18===0)sfx('fire');
        if(s.t>=96){s.phase='out';s.t=0;}
      }else{s.x+=s.dir*5;s.y-=1.6;if(s.x<cam-100||s.x>cam+VW+100)s.dead=true;}
    }else if(s.type==='thunder'){
      if(s.t%20===1&&s.i<s.cols.length){strike(s.cols[s.i]);s.i++;}
      if(s.i>=s.cols.length&&s.t>50)s.dead=true;
    }else if(s.type==='sun'){s.life--;if(s.life<=0){s.dead=true;puff(s.x,s.y,12,'#fff6c8',1.2,0,20);}}
    else if(s.type==='burst'){s.life--;if(s.life<=0)s.dead=true;}
    else if(s.type==='reward'){s.life--;s.y-=s.life>100?.5:0;if(frame%3===0)particles.push({x:s.x+(Math.random()-.5)*14,y:s.y+(Math.random()-.5)*14,vx:0,vy:-.4,life:16,max:16,c:'#ffd34d',g:0});if(s.life<=0)s.dead=true;}
    else if(s.type==='quake'){
      if(s.t<70){shake=Math.max(shake,5-s.t/18);if(frame%2===0){const x=cam+Math.random()*VW,c=Math.floor(x/TS),r=surfaceBelow(c,1);if(r>0)particles.push({x,y:r*TS,vx:(Math.random()-.5),vy:-1-Math.random()*1.5,life:22,max:22,c:Math.random()<.5?'#8e8a9e':'#c9925a',g:.08});}}
      if(s.t===8){
        const c0=Math.floor(cam/TS),c1=c0+VW/TS;
        for(let y=0;y<ROWS;y++)for(let x=Math.max(0,c0);x<=Math.min(W-1,c1);x++)if(grid[y][x]==='k')fx.push({type:'crackQ',tx:x,ty:y,t:2+Math.abs(9-y)*3+((x*7)%5)});
        for(const e of enemies){if(e.dead||e.x+e.w<cam||e.x>cam+VW)continue;
          if(e.type==='boss'&&e.kind!=='golem'){if(e.state!=='sleep'&&!e.hidden){hitElem='earth';dmgEnemy(e,2,0);hitElem=null;}}
          else if(e.type==='boss'){if(e.state!=='sleep'&&e.state!=='dying'){e.coreOpen=Math.max(e.coreOpen,150);e.state='stagger';e.t=0;toast('골렘이 휘청인다! 코어가 열렸다',1600,true);}}
          else if(e.type==='slime'&&e.onGround){dmgEnemy(e,1,0,true);e.vy=-3;}}
      }
      if(s.t>75)s.dead=true;
    }
    else if(s.type==='geyser'){
      if(s.t<64){for(let i=0;i<5;i++)particles.push({kind:'flame',pal:'lava',x:s.x+(Math.random()-.5)*10,y:s.gy-2,vx:(Math.random()-.5)*1.4,vy:-4.2-Math.random()*3.2,life:26+Math.random()*10,max:36,size:2,grow:.12,g:.17});
        if(s.t%3===0)particles.push({x:s.x+(Math.random()-.5)*16,y:s.gy,vx:(Math.random()-.5)*2.4,vy:-1.5-Math.random()*1.5,life:30,max:30,c:'#5a4a44',g:.1});}
      if(s.t%12===6&&s.t<64){const R={x:s.x-10,y:s.gy-96,w:20,h:96};
        hitElem='earth';for(const e of enemies){if(!e.dead&&overlap(R,e)){dmgEnemy(e,2,0);if(!e.dead)e.burn=Math.max(e.burn,180);}}hitElem=null;
        const c=Math.floor(s.x/TS);for(let dx=-1;dx<=1;dx++)for(let r=Math.floor(s.gy/TS)-1;r>=Math.max(0,Math.floor(s.gy/TS)-6);r--){const ch=cell(c+dx,r);
          if(ch==='T'||ch==='B'||ch==='t')ignite(c+dx,r,true);else if(ch==='i'||ch==='A')meltAt(c+dx,r);else if(ch==='I'&&dx===0)lightTorch(c,r);}
        shake=Math.max(shake,3);}
      if(s.t>90)s.dead=true;
    }
    else if(s.type==='tree'){
      const e=s.e;
      if(e.dead){s.dying++;if(s.dying===1){puff(s.x,s.gy-30,16,'#9be07a',1.4,.03,30);}if(s.dying>50)s.dead=true;continue;}
      if(e.type!=='boss')e.root=99999;e.kvx=0;
      if(e.type==='boss'&&s.n>=6){s.dying++;if(s.dying>50){s.dead=true;e.drained=false;}continue;}
      if(s.t>24&&s.t%30===0){hitElem='grass';dmgEnemy(e,1,0,true,e.type==='boss');hitElem=null;s.n++;sfx('grow');
        for(let i=0;i<8;i++){const k=i/8;particles.push({x:e.x+e.w/2,y:e.y+e.h/2,vx:(s.x-(e.x+e.w/2))/22*(.8+k*.4),vy:(s.gy-30-(e.y+e.h/2))/22*(.8+k*.4),life:22,max:22,c:i%2?'#d6423a':'#9be07a',g:0});}
        if(e.dead)s.dying=1;}
    }
  }
  summons=summons.filter(s=>!s.dead);
  for(const b of bolts)b.life--;bolts=bolts.filter(b=>b.life>0);
  if(flash>0)flash--;
}
function updateGolem(){
  const g=golem;if(!g)return;
  g.t++;g.life--;if(g.atkCD>0)g.atkCD--;if(g.inv>0)g.inv--;if(g.punch>0)g.punch--;
  let target=null,bd=1e9;
  for(const e of enemies){if(e.dead)continue;const d=Math.abs(e.x+e.w/2-(g.x+g.w/2));if(d<90&&Math.abs(e.y-g.y)<40&&d<bd){bd=d;target=e;}}
  let want=0;
  if(g.mode==='follow'||target){
    const tx=target?target.x+target.w/2:p.x+p.w/2-p.face*24,dx=tx-(g.x+g.w/2);
    if(Math.abs(dx)>(target?12:6))want=Math.sign(dx);
    if(g.mode==='stay'&&!target)want=0;
    if(g.mode==='stay'&&target&&bd>26)want=0;
  }
  if(want)g.face=want;
  g.vx+=(want*1.0-g.vx)*.3;g.vy=Math.min(g.vy+.36,7);
  const r=moveBody(g,g.vx,g.vy);
  if(r.ground){g.vy=0;g.onGround=true;}else g.onGround=false;if(r.hitY&&g.vy<0)g.vy=0;
  if(r.hitX&&g.onGround&&want){
    const tx=want>0?Math.floor((g.x+g.w+1)/TS):Math.floor((g.x-1)/TS),ty=Math.floor((g.y+g.h-1)/TS);
    const b=blockAt(tx,ty);
    if(b){g.pushT++;if(g.pushT>14){tryPush(b,want);g.pushT=0;}}
    else if(!solid(tx,ty-1)){g.vy=-5.2;g.pushT=0;}
  }else g.pushT=0;
  if(target&&g.atkCD<=0){const hb={x:g.face>0?g.x+g.w/2:g.x+g.w/2-22,y:g.y,w:22,h:g.h};if(overlap(hb,target)){meleeEnemy(target,2,g.face*2.4);g.atkCD=40;g.punch=10;}}
  for(const e of enemies){if(!e.dead&&!isStuck(e)&&g.inv<=0&&overlap(e,g)){g.hp--;g.inv=30;puff(g.x+6,g.y+8,6,'#6fdc5a',1.2);}}
  const gc=cell(Math.floor((g.x+g.w/2)/TS),Math.floor((g.y+g.h-1)/TS));
  if(g.hp<=0||g.life<=0||g.y>VH+10||gc==='w'||gc==='^'||gc==='l'){
    puff(g.x+6,g.y+9,28,'#6fdc5a',1.8,.04,40);puff(g.x+6,g.y+9,12,'#c9a24a',1.4,.04,40);sfx('grow');
    toast('골렘이 낙엽이 되어 흩어졌다',1500,true);golem=null;
  }
}
