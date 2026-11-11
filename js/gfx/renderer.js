// renderer.js — 조준선, 화면 전체 그리기 순서와 HUD
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

function drawAimPreview(camR){
  if(!(p.bowCharging&&p.bowSrc==='touch'&&aim.dragged))return;
  const id=ELEM[elem].id,ch=p.bowChargeT>=BOWFULL&&p.chargedCD<=0;let [s,g]=ch?CHG[id]:normalSG(id);
  let x=p.x+p.w/2,y=p.y+6,vx=Math.cos(p.bowAng)*s,vy=Math.sin(p.bowAng)*s;ctx.fillStyle=ELEM[elem].col;
  for(let i=0;i<60;i++){vy+=g;x+=vx;y+=vy;if(solid(Math.floor(x/TS),Math.floor(y/TS))||y>VH)break;if(i%3===0)ctx.fillRect(Math.round(x-camR),Math.round(y),1,1);}
}
function draw(){
  if(ending){drawEnding();return;}
  const sx=shake?(Math.random()-.5)*shake:0,sy=shake?(Math.random()-.5)*shake:0;
  const camR=Math.round(cam+sx);
  ctx.setTransform(1,0,0,1,0,0);
  drawBG(Math.round(cam));
  ctx.save();ctx.translate(0,Math.round(sy));
  drawTiles(camR);drawRail(camR);
  for(const it of items){if(it.type==='chest'){drawChest(it,camR);continue;}if(it.taken)continue;const by=Math.round(it.y+Math.sin(it.t*.08)*2);
    ctx.drawImage(it.type==='key'?KEY:HEART,Math.round(it.x-camR),by);if(it.t%40<4){ctx.fillStyle='#fff6d8';ctx.fillRect(Math.round(it.x-camR)+it.w,by-1,1,1);}}
  for(const c of coins){if(c.taken)continue;const w=[6,4,2,4][Math.floor(c.t/8)%4];ctx.drawImage(COIN,Math.round(c.x-camR+(6-w)/2),Math.round(c.y),w,6);}
  for(const a of arrows)drawArrow(a,camR);
  drawDrainTrees(camR);
  drawGolem(camR);drawPlayer(camR);drawCart(camR);
  for(const e of enemies)if(!e.dead&&e.type!=='boss')drawEnemy(e,camR);
  if(boss)drawBoss(boss,camR);
  drawBossHaz(camR);
  for(const q of particles){if(q.kind)continue;ctx.globalAlpha=Math.max(0,Math.min(1,q.life/q.max*1.5));ctx.fillStyle=q.c;ctx.fillRect(Math.round(q.x-camR),Math.round(q.y),1,1);}
  ctx.globalAlpha=1;
  drawSummons(camR);
  // flames: smoke first, then additive fire
  for(const q of particles){if(q.kind!=='flame')continue;const k=q.life/q.max;if(k>.26)continue;const s=Math.round(q.size);ctx.globalAlpha=k*2;ctx.fillStyle='#3a2a2e';ctx.fillRect(Math.round(q.x-camR-s/2),Math.round(q.y-s/2),s,s);}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='lighter';
  for(const q of particles){if(q.kind!=='flame')continue;const k=q.life/q.max,col=flameColor(k,q.pal);if(!col)continue;const s=Math.max(1,Math.round(q.size));
    ctx.globalAlpha=.85;ctx.fillStyle=col;ctx.fillRect(Math.round(q.x-camR-s/2),Math.round(q.y-s/2),s,s);}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  if(lvl.dark)drawDark(camR);
  drawAimPreview(camR);
  if(p.target&&state==='play'){const bx=Math.round(p.target.x-camR-5),by=Math.round(p.target.y-10+Math.sin(frame*.15)*1.5);
    ctx.fillStyle='#120f1c';ctx.fillRect(bx-1,by-1,11,12);ctx.fillStyle='#4a4266';ctx.fillRect(bx,by,9,10);ctx.fillStyle='#2a2440';ctx.fillRect(bx,by,9,8);txt('E',bx+3,by+2,'#ffd34d');}
  if(state==='play'){
    const hx=Math.round(p.x+p.w/2-camR)-8;
    if(p.charging&&p.chargeT>15){const by=Math.round(p.y)-8-(p.chargeT>=FULL?32:0);
      ctx.fillStyle='#120f1c';ctx.fillRect(hx-1,by-1,18,4);ctx.fillStyle='#3b3550';ctx.fillRect(hx,by,16,2);
      ctx.fillStyle=p.chargeT>=FULL?(frame%6<3?'#ffffff':'#ffd34d'):'#ffd34d';ctx.fillRect(hx,by,Math.round(16*Math.min(1,p.chargeT/FULL)),2);}
    if(p.bowCharging&&p.bowChargeT>12){const by=Math.round(p.y)-8,ready=p.chargedCD<=0,colr=ELEM[elem].col;
      ctx.fillStyle='#120f1c';ctx.fillRect(hx-1,by-1,18,4);ctx.fillStyle='#3b3550';ctx.fillRect(hx,by,16,2);
      ctx.fillStyle=!ready?'#6a648a':p.bowChargeT>=BOWFULL?(frame%6<3?'#ffffff':colr):colr;ctx.fillRect(hx,by,Math.round(16*Math.min(1,p.bowChargeT/BOWFULL)),2);}
  }
  ctx.restore();
  if(flash>0&&!lvl.dark){ctx.fillStyle=`rgba(255,250,220,${flash/12})`;ctx.fillRect(0,0,VW,VH);}
  // HUD
  for(let i=0;i<p.maxHp;i++)ctx.drawImage(i<p.hp?HEART:HEART_E,6+i*9,6);
  ctx.drawImage(COIN,6,16);txt('x'+p.coins,14,16,'#ffffff');
  {const c=weaponLv>=10?'#ffd34d':'#c9ced8';ctx.fillStyle='#120f1c';ctx.fillRect(6,26,8,7);ctx.fillStyle=c;for(let i=0;i<5;i++)ctx.fillRect(8+i,31-i,1,1);ctx.fillStyle='#a8713d';ctx.fillRect(7,30,3,1);ctx.fillRect(8,29,1,3);txt(String(weaponLv),16,27,c);}
  if(p.keys>0){ctx.drawImage(KEY,5,36);txt('x'+p.keys,16,36,'#ffffff');}
  txt(lvl.code,VW-6-lvl.code.length*4,6,'#ffd34d');
  const ix=VW/2-unlocked*11/2;
  ELEM.slice(0,unlocked).forEach((el,i)=>{const x=Math.round(ix+i*11),y=4;
    if(i===elem){ctx.fillStyle='#ece7f5';ctx.fillRect(x-1,y-1,11,11);ctx.fillStyle='#120f1c';ctx.fillRect(x,y,9,9);}
    ctx.fillStyle=i===elem?el.col:'#4a4266';for(let k=0;k<5;k++)ctx.fillRect(x+2+k,y+6-k,1,1);ctx.fillRect(x+5,y+1,2,1);ctx.fillRect(x+6,y+2,1,1);});
  if(canCh){const bw=unlocked*11-2,bx=Math.round(ix)-1,by=15;ctx.fillStyle='#120f1c';ctx.fillRect(bx,by,bw+2,3);
   const k=1-p.chargedCD/CHARGED_CD;ctx.fillStyle=p.chargedCD>0?'#4a4266':(frame%30<15?ELEM[elem].col:'#ffffff');ctx.fillRect(bx+1,by+1,Math.round(bw*k),1);}
  if(p.riding){ctx.fillStyle='rgba(18,15,28,.7)';ctx.fillRect(VW-46,15,40,9);txt('E',VW-42,17,'#ffd34d');ctx.fillStyle='#ece7f5';ctx.fillRect(VW-36,19,3,1);ctx.fillRect(VW-30,17,1,5);ctx.fillRect(VW-30,17,5,1);ctx.fillRect(VW-26,17,1,5);ctx.fillRect(VW-30,21,5,1);}
  if(fade>0){ctx.fillStyle='rgba(0,0,0,'+fade+')';ctx.fillRect(0,0,VW,VH);}
  if(boss&&boss.state!=='sleep'&&boss.state!=='dead'){const fl=$('bfill');fl.style.width=(100*boss.hp/boss.maxHp)+'%';fl.classList.toggle('open',boss.coreOpen>0);}
}
