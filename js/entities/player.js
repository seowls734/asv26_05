// player.js — 플레이어 이동·점프·대쉬·검/활 차지, 적·동전 갱신
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ================= player ================= */
function updateCart(){
  if(!cart)return;
  const ax=(K.d?1:0)-(K.a?1:0);
  if(p.riding)cart.vx+=(ax*2.4-cart.vx)*.1;else cart.vx*=.9;
  cart.x+=cart.vx;
  if(cart.x<cart.min){cart.x=cart.min;cart.vx=0;}if(cart.x>cart.max){cart.x=cart.max;cart.vx=0;}
  if(Math.abs(cart.vx)>1.2&&frame%3===0)particles.push({x:cart.x+(cart.vx>0?4:18),y:cart.y+12,vx:-cart.vx*.4,vy:-Math.random()*1.2,life:12,max:12,c:'#ffd27a',g:.08});
}
function updateAttack(){
  if(P.atk){
    p.bowCharging=false;p.bowChargeT=0;
    if(p.slashCD<=0){p.slashT=14;p.slashCD=18;p.hitSet=new Set();sfx('slash');}
    p.charging=true;p.chargeT=0;
  }
  if(p.charging){
    if(K.atk){
      p.chargeT++;
      if(p.chargeT===FULL){sfx('charged');puff(p.x+5,p.y-4,16,'#ffd34d',1.6,0,20);toast('거대한 검 준비 완료! 떼면 공격',1200,true);}
      if(p.chargeT>30&&p.chargeT<FULL&&frame%4===0){const a=Math.random()*6.28;particles.push({x:p.x+5+Math.cos(a)*14,y:p.y+6+Math.sin(a)*14,vx:-Math.cos(a)*.9,vy:-Math.sin(a)*.9,life:14,max:14,c:'#ffd34d',g:0});}
    }else{
      if(p.chargeT>=FULL){p.giantT=22;p.hitSet=new Set();shake=8;freeze=3;sfx('giant');}
      p.charging=false;p.chargeT=0;
    }
  }
  if(p.giantT>0)p.giantT--;
  // bow
  if(P.bowDown){p.charging=false;p.chargeT=0;p.bowCharging=true;p.bowChargeT=0;}
  if(p.bowCharging){
    p.bowAng=currentAim();if(Math.abs(Math.cos(p.bowAng))>.05)p.face=Math.cos(p.bowAng)>0?1:-1;p.bowT=Math.max(p.bowT,2);
    if(K.bow){
      p.bowChargeT=canCh?p.bowChargeT+1:Math.min(p.bowChargeT+1,12);
      const ready=p.chargedCD<=0;
      if(p.bowChargeT===BOWFULL&&ready){sfx('charged');shake=Math.max(shake,2);puff(p.x+5+Math.cos(p.bowAng)*8,p.y+6+Math.sin(p.bowAng)*8,14,ELEM[elem].col,1.6,0,20);}
      if(p.bowChargeT>=BOWFULL&&ready)bowAura();
      else if(p.bowChargeT>20&&frame%5===0){const a=Math.random()*6.28;particles.push({x:p.x+5+Math.cos(a)*12,y:p.y+6+Math.sin(a)*12,vx:-Math.cos(a)*.8,vy:-Math.sin(a)*.8,life:12,max:12,c:ELEM[elem].col,g:0});}
    }else{
      const charged=p.bowChargeT>=BOWFULL&&p.chargedCD<=0;
      if(shoot(p.bowAng,charged)&&charged)p.chargedCD=CHARGED_CD;
      p.bowCharging=false;p.bowChargeT=0;
    }
  }
  if(p.chargedCD>0){p.chargedCD--;if(p.chargedCD===0)puff(p.x+5,p.y,8,ELEM[elem].col,1,0,14);}
}
function bowAura(){
  const id=ELEM[elem].id,bx=p.x+p.w/2+Math.cos(p.bowAng)*5,by=p.y+6+Math.sin(p.bowAng)*5;
  if(frame%3)return;
  const r=(a,b)=>a+Math.random()*(b-a);
  if(id==='normal')particles.push({x:bx+r(-4,4),y:by+r(-6,6),vx:0,vy:.4,life:20,max:20,c:Math.random()<.6?'#4fae5a':'#9be07a',g:.02});
  else if(id==='ice')particles.push({x:bx+r(-6,6),y:by+r(-8,8),vx:0,vy:0,life:12,max:12,c:'#e6fbff',g:0});
  else if(id==='fire'){particles.push({x:bx+r(-4,4),y:by+r(-7,7),vx:r(-.2,.2),vy:-r(.6,1.4),life:16,max:16,c:Math.random()<.5?'#ff7a2a':'#ffd34d',g:-.01});}
  else if(id==='elec')particles.push({x:bx+r(-8,8),y:by-10+r(-3,3),vx:r(-1,1),vy:r(0,2),life:5,max:5,c:'#ffe14d',g:0});
  else if(id==='grass')particles.push({x:bx+r(-5,5),y:by+r(-7,7),vx:r(-.4,.4),vy:r(-.2,.4),life:24,max:24,c:Math.random()<.2?'#e85a8a':'#6fdc5a',g:.01});
  else if(id==='light')particles.push({x:bx+r(-8,8),y:by+r(-8,8),vx:0,vy:0,life:8,max:8,c:'#ffffff',g:0});
  else if(id==='earth')particles.push({x:bx+r(-5,5),y:by+r(-6,6),vx:r(-.3,.3),vy:r(0,.5),life:18,max:18,c:Math.random()<.5?'#8e8a9e':'#c9925a',g:.08});
  else if(id==='wind'){const a=frame*.25+Math.random()*6.28;particles.push({x:bx+Math.cos(a)*9,y:by+Math.sin(a)*9,vx:-Math.sin(a)*1.2,vy:Math.cos(a)*1.2,life:10,max:10,c:Math.random()<.5?'#b6f05a':'#e2ffa8',g:0});}
}
function updatePlayer(){
  const ax=(K.d?1:0)-(K.a?1:0);
  if(p.inv>0)p.inv--;if(p.dashCD>0)p.dashCD--;if(p.slashCD>0)p.slashCD--;if(p.shootCD>0)p.shootCD--;if(p.bowT>0)p.bowT--;
  if(p.boardCD>0)p.boardCD--;if(p.slashT>0)p.slashT--;if(p.knockT>0)p.knockT--;
  if(P.w)p.jumpBuf=7;else if(p.jumpBuf>0)p.jumpBuf--;
  for(const t of p.trail)t.life--;p.trail=p.trail.filter(t=>t.life>0);
  updateAttack();

  if(p.riding&&cart){
    if(ax&&!p.bowCharging&&p.bowT<=0)p.face=ax;
    p.x=cart.x+(cart.w-p.w)/2;p.y=cart.y-p.h+6;p.vx=cart.vx;p.vy=0;p.onGround=true;
    if(P.w||P.e){p.riding=false;p.y=cart.y-p.h-1;p.vy=P.w?-6.5:-3.2;p.boardCD=20;p.onGround=false;p.coyote=0;p.jumpBuf=0;p.canDash=true;if(P.w)sfx('jump');}
    doSlash();doGiant();p.target=null;return;
  }

  const slow=(p.charging&&p.chargeT>15)?.55:(p.bowCharging&&p.bowChargeT>12)?.6:1;
  if(P.q&&p.dashCD<=0&&p.canDash&&p.knockT<=0){p.dashT=10;p.dashCD=36;if(!p.onGround)p.canDash=false;p.inv=Math.max(p.inv,12);p.vy=0;sfx('dash');puff(p.x+5,p.y+12,6,'#c9c2dc',1,0,14);}
  if(p.dashT>0){p.dashT--;p.vx=p.face*4.6;p.vy=0;if(frame%2===0)p.trail.push({x:p.x,y:p.y,face:p.face,life:10});}
  else{
    if(p.knockT<=0){if(ax&&!p.bowCharging&&p.bowT<=0)p.face=ax;p.vx+=(ax*1.7*slow-p.vx)*(p.onGround?.35:.2);}else p.vx*=.92;
    p.vy=Math.min(p.vy+.36,7);
    p.jumpT=(p.jumpT||0)+1;
    if(!K.w&&p.vy<0&&p.jumpT>10)p.vy+=.35;
  }
  if(p.jumpBuf>0&&p.coyote>0&&p.dashT<=0){p.vy=-6.5;p.jumpT=0;p.jumpBuf=0;p.coyote=0;sfx('jump');puff(p.x+5,p.y+14,5,'#c9c2dc',.8,0,12);}

  const prevBottom=p.y+p.h,fallV=p.vy;
  const r=moveBody(p,p.vx,p.vy);
  if(r.ground){if(!p.onGround&&fallV>3.5)puff(p.x+5,p.y+14,5,'#c9c2dc',.9,0,12);p.vy=0;p.onGround=true;p.coyote=6;p.canDash=true;}
  else{p.onGround=false;if(p.coyote>0)p.coyote--;}
  if(r.hitY&&p.vy<0)p.vy=0;

  // push blocks
  if(r.hitX&&p.onGround&&ax&&p.dashT<=0){
    const tx=ax>0?Math.floor((p.x+p.w+1)/TS):Math.floor((p.x-1)/TS),ty=Math.floor((p.y+p.h-1)/TS);
    const b=blockAt(tx,ty);
    if(b){p.pushT++;if(p.pushT>=12){tryPush(b,ax);p.pushT=0;}}else p.pushT=0;
  }else p.pushT=0;

  if(cart){const cxp=p.x+p.w/2;if(p.vy>.5&&p.boardCD<=0&&cxp>cart.x+2&&cxp<cart.x+cart.w-2&&p.y+p.h>=cart.y&&prevBottom<=cart.y+8){p.riding=true;p.vy=0;sfx('door');}}

  if(p.onGround){const by=Math.floor((p.y+p.h+1)/TS),l=Math.floor((p.x+1)/TS),rr=Math.floor((p.x+p.w-1)/TS);
    const safe=x=>SAFE.has(cell(x,by))||(blockAt(x,by)&&!blockAt(x,by).mode);
    if(safe(l)&&safe(rr))lastSafe={x:p.x,y:p.y};}
  if(touchingHazard()||p.y>VH+8){hazardHit();return;}

  doSlash();doGiant();
  for(const h of levelHints)if(!hintsDone.has(h[0]+h[1])&&p.x>h[0]*TS){hintsDone.add(h[0]+h[1]);toast(HINT[h[1]](CT()),3400);}
  p.target=findInteract();
  if(P.e)interact(p.target);
}
function touchingHazard(){
  const x0=Math.floor(p.x/TS),x1=Math.floor((p.x+p.w-.01)/TS),y0=Math.floor(p.y/TS),y1=Math.floor((p.y+p.h-.01)/TS);
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){
    const c=cell(tx,ty);
    if(c==='^'&&p.y+p.h>ty*TS+7&&p.x+p.w>tx*TS+1&&p.x<tx*TS+15)return true;
    if(c==='w'&&p.y+p.h>ty*TS+6){puff(p.x+5,ty*TS+2,10,'#8fd6ff',1.4,.1,20);sfx('splash');return true;}
    if(c==='l'&&p.y+p.h>ty*TS+5){puff(p.x+5,ty*TS+2,14,'#ff8a2a',1.6,-.04,22);sfx('fizz');return true;}
  }
  return false;
}
function updateEnemies(){
  for(const e of enemies){
    if(e.dead||e.type==='boss')continue;e.t++;if(e.flash>0)e.flash--;
    if(e.frozen>0)e.frozen--;if(e.root>0)e.root--;
    if(e.orb>0){e.orb--;if(e.orb%8===0)particles.push({x:e.x+e.w/2+(Math.random()-.5)*24,y:e.y+e.h/2+(Math.random()-.5)*24,vx:0,vy:0,life:8,max:8,c:'#ffffff',g:0});if(e.orb===0){lightBurst(e);if(e.dead)continue;}}
    if(e.burn>0){e.burn--;if(frame%3===0)particles.push({x:e.x+Math.random()*e.w,y:e.y+Math.random()*e.h,vx:0,vy:-.7,life:14,max:14,c:Math.random()<.5?'#ff7a2a':'#ffd34d',g:-.01});if(e.burn%60===0)dmgEnemy(e,1,0,true);}
    if(e.dead)continue;
    if(e.shock>0){e.shock--;if(frame%5===0)particles.push({x:e.x+Math.random()*e.w,y:e.y+Math.random()*e.h,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2,life:6,max:6,c:'#ffe14d',g:0});if(e.shock%60===0)dmgEnemy(e,1,0,true);}
    if(e.dead)continue;
    const stuck=isStuck(e);
    if(e.type==='slime'){
      e.vy=Math.min(e.vy+.3,6);
      const d=e.def;let spd=d?d.spd:.45;
      if(d&&!stuck){
        if(e.cd>0)e.cd--;
        const dx=PX()-(e.x+e.w/2),dy=PY()-(e.y+e.h/2),dist=Math.hypot(dx,dy);
        if(d.spd===0)e.dir=dx>0?1:-1;
        if(d.hop&&e.onGround&&e.t%d.hop===0)e.vy=-3.2;
        if(d.charge){if(e.dash>0){e.dash--;spd=2.6;if(frame%2===0)puff(e.x+e.w/2-e.dir*6,e.y+e.h,2,'#c9c2dc',.6,0,10);}else if(e.cd<=0&&Math.abs(dy)<14&&Math.abs(dx)<96&&state==='play'){e.dir=dx>0?1:-1;e.dash=36;e.cd=150;sfx('dash');}}
        if(d.shoot&&e.cd<=0&&dist<150&&Math.abs(dy)<90&&state==='play'){e.dir=dx>0?1:-1;e.cd=d.shoot.cd;e.shotT=10;const sx=e.x+e.w/2,sy=e.y+3;
          if(d.shoot.mode==='lob')lob(sx,sy,PX(),38,.18,{look:d.shoot.look,w:7,h:7});else shotAt(sx,sy,d.shoot.spd,0,{look:d.shoot.look,life:160});sfx('bow');}
        if(e.shotT>0)e.shotT--;
        if(d.trail&&frame%4===0)particles.push({x:e.x+Math.random()*e.w,y:e.y+e.h-2,vx:0,vy:-.5,life:14,max:14,c:d.trail,g:-.01});
      }
      const vx=e.kvx!==0?e.kvx:(stuck?0:e.dir*spd);e.kvx*=.85;if(Math.abs(e.kvx)<.15)e.kvx=0;
      const r=moveBody(e,vx,(e.root>0||e.orb>0)?Math.max(0,e.vy):e.vy);
      if(r.ground){e.vy=0;e.onGround=true;}else e.onGround=false;
      if(r.hitY&&e.vy<0)e.vy=0;
      if(r.hitX&&e.kvx===0)e.dir*=-1;
      if(e.onGround&&e.kvx===0&&!stuck){const ahead=e.dir>0?e.x+e.w+1:e.x-1,tx=Math.floor(ahead/TS),ty=Math.floor((e.y+e.h+2)/TS);if(!solid(tx,ty)&&!oneway(tx,ty))e.dir*=-1;}
      const ecx=Math.floor((e.x+e.w/2)/TS),ecy=Math.floor((e.y+e.h-1)/TS);
      if(e.y>VH+20||cell(ecx,ecy)==='w'||cell(ecx,ecy)==='^'||cell(ecx,ecy)==='l'){e.dead=true;puff(e.x+6,e.y+4,10,'#62d26f',1.4);}
    }else if(!stuck){
      let tgtx=p.x+p.w/2,tgty=p.y+3;
      if(golem){const dg=Math.hypot(golem.x-e.x,golem.y-e.y),dp=Math.hypot(p.x-e.x,p.y-e.y);if(dg<dp){tgtx=golem.x+6;tgty=golem.y+4;}}
      const dx=tgtx-(e.x+e.w/2),dy=tgty-e.y;
      const d=e.def,sp=d?d.spd:1;if(d&&e.cd>0)e.cd--;
      if(d&&d.trail&&frame%4===0)particles.push({x:e.x+e.w/2,y:e.y+e.h,vx:0,vy:.3,life:14,max:14,c:d.trail,g:0});
      if(e.diveT>0){e.diveT--;e.x+=e.dvx;e.y+=e.dvy;}
      else if(d&&d.dive&&e.cd<=0&&Math.hypot(dx,dy)<100&&state==='play'){const a=Math.atan2(dy,dx);e.dvx=Math.cos(a)*3;e.dvy=Math.sin(a)*3;e.diveT=26;e.cd=140;sfx('screech');}
      else if(Math.abs(dx)<120&&Math.abs(dy)<100&&state==='play'){e.x+=Math.sign(dx)*.55*sp;e.y+=Math.sign(dy)*.28*sp;}
      else{e.x+=Math.sin(e.t*.02)*.6;e.y+=Math.sin(e.t*.05)*.3;}
      e.x+=e.kvx;e.kvx*=.85;e.y+=Math.sin(e.t*.15)*.5;e.y=Math.max(18,Math.min(150,e.y));
    }else{e.x+=e.kvx;e.kvx*=.8;}
    if(overlap(e,p)&&p.dashT<=0&&!(e.frozen>0)&&!(e.shock>0)&&!(e.orb>0))hurtPlayer(e.x+e.w/2);
  }
}
function updateCoins(){
  for(const c of coins){
    if(c.taken)continue;c.t++;
    if(c.phys){c.vy=Math.min(c.vy+.3,6);const r=moveBody(c,c.vx,c.vy);if(r.ground){c.vy=0;c.vx*=.8;}if(r.hitX)c.vx*=-.5;if(c.y>VH)c.taken=true;}
    if((!c.phys||c.t>14)&&overlap({x:c.x-2,y:c.y-2,w:10,h:10},p)){c.taken=true;p.coins++;sfx('coin');puff(c.x+3,c.y+3,6,'#fff1a8',1,0,14);}
  }
  for(const it of items)it.t++;
}
