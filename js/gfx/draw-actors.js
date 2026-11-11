// draw-actors.js — 플레이어·잡몹 그리기 (HP 바 포함)
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

function drawPlayer(camR){
  let key='idle';
  if(!p.riding){if(!p.onGround)key=p.vy<0?'jump':'fall';else if(Math.abs(p.vx)>.4)key=Math.floor(frame/6)%2?'run1':'run2';}
  if(p.dashT>0)key='run1';
  for(const t of p.trail){ctx.globalAlpha=t.life/10*.35;ctx.drawImage(t.face>0?PSPR.run1.wr:PSPR.run1.wl,Math.round(t.x-1-camR),Math.round(t.y-2));}
  ctx.globalAlpha=1;
  if(state==='over')return;
  const cx=p.x+p.w/2,px=Math.round(p.x-1-camR),py=Math.round(p.y-2);
  const full=p.charging&&p.chargeT>=FULL;
  if(full||p.giantT>14){const bx=Math.round(cx-camR)-2,by=py-30;
    ctx.fillStyle='#1a1226';ctx.fillRect(bx-1,by-1,6,31);ctx.fillStyle=frame%8<4?'#fff7d6':'#ffd34d';ctx.fillRect(bx,by,4,28);ctx.fillStyle='#ffffff';ctx.fillRect(bx+1,by+1,1,25);
    ctx.fillStyle='#7a4f2b';ctx.fillRect(bx-4,by+27,12,2);}
  if(!(p.inv>0&&p.dashT<=0&&frame%8<4)){
    const s=PSPR[key];ctx.drawImage(p.face>0?s.r:s.l,px,py);
    if(p.charging&&p.chargeT>30&&frame%6<3){ctx.globalAlpha=.35;ctx.drawImage(p.face>0?s.wr:s.wl,px,py);ctx.globalAlpha=1;}
  }
  if(p.bowT>0||p.bowCharging)drawBowFX(camR);
  if(p.slashT>0){ctx.globalAlpha=Math.min(1,p.slashT/8);ctx.drawImage(weaponLv>=10?(p.face>0?SLASH_GOLD.r:SLASH_GOLD.l):(p.face>0?SLASH.r:SLASH.l),Math.round((p.face>0?cx-3:cx-17)-camR),Math.round(p.y-1));ctx.globalAlpha=1;}
  if(p.giantT>0&&p.giantT<=18){ctx.globalAlpha=Math.min(1,p.giantT/10);ctx.drawImage(p.face>0?GIANT.r:GIANT.l,Math.round((p.face>0?cx-2:cx+2-52)-camR),Math.round(p.y+7-40));ctx.globalAlpha=1;}
}
function drawEnemy(e,camR){
  const ex=Math.round(e.x-camR),ey=Math.round(e.y);
  const st=isStuck(e);
  let s,ox,oy,right=true;
  if(e.def){const fr=e.def.fr;s=fr[(st?0:Math.floor(e.t/(e.type==='bat'?7:14)))%fr.length];const sw=s.r.width,sh=s.r.height;
    ox=Math.round((e.w-sw)/2);oy=e.type==='slime'?e.h-sh:Math.round((e.h-sh)/2);
    right=e.type==='slime'?e.dir>0:(p.x+p.w/2>e.x+e.w/2);
    if(e.type==='slime'&&fr.length===1&&!st&&e.def.spd>0&&(e.t>>3)%2)oy-=1;
    if(e.shotT>0)ox+=right?-1:1;
    if(e.def.ghost)ctx.globalAlpha=.55+.3*Math.sin(frame*.1+e.x);}
  else{s=e.type==='slime'?SLIME[st?0:Math.floor(e.t/14)%2]:BAT[(e.frozen>0||e.root>0||e.orb>0)?0:Math.floor(e.t/7)%2];ox=e.type==='slime'?0:-1;oy=e.type==='slime'?0:-1;}
  ctx.drawImage(e.flash?(right?s.wr:s.wl):(right?s.r:s.l),ex+ox,ey+oy);ctx.globalAlpha=1;
  if(e.frozen>0){ctx.globalAlpha=.7;ctx.drawImage(s.ice,ex+ox,ey+oy);ctx.globalAlpha=1;ctx.fillStyle='rgba(191,238,255,.3)';ctx.fillRect(ex-2,ey-3,e.w+4,e.h+5);ctx.fillStyle='#ffffff';ctx.fillRect(ex-1,ey-2,2,1);}
  if(e.shock>0&&frame%6<3){ctx.globalAlpha=.6;ctx.drawImage(s.yel,ex+ox,ey+oy);ctx.globalAlpha=1;}
  if(e.burn>0&&frame%8<4){ctx.globalAlpha=.25;ctx.fillStyle='#ff7a2a';ctx.fillRect(ex,ey,e.w,e.h);ctx.globalAlpha=1;}
  if(e.root>0){for(let i=0;i<=e.w;i+=3){ctx.fillStyle=i%2?'#3f9a4a':'#6fdc5a';ctx.fillRect(ex+i-1,ey+e.h-3-(i%6===0?2:0),2,4+(i%6===0?2:0));}}
  if(e.orb>0){const cxx=ex+e.w/2,cyy=ey+e.h/2,k=e.orb/96,r=Math.round((Math.max(e.w,e.h)/2+3)+k*8);
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.25+(1-k)*.5+.1*Math.sin(frame*.6);ctx.fillStyle='#fff6c8';ctx.fillRect(cxx-r,cyy-r,r*2,r*2);ctx.globalAlpha=1;
    for(let i=0;i<12;i++){const a=frame*(.08+(1-k)*.25)+i*Math.PI/6;ctx.fillStyle=i%2?'#ffffff':'#ffd34d';ctx.fillRect(Math.round(cxx+Math.cos(a)*r),Math.round(cyy+Math.sin(a)*r),1,1);}
    for(let i=0;i<4;i++){const a=i*Math.PI/2+frame*.03;ctx.fillStyle='#ffffff';for(let q=r;q<r+6;q+=2)ctx.fillRect(Math.round(cxx+Math.cos(a)*q),Math.round(cyy+Math.sin(a)*q),1,1);}
    ctx.globalCompositeOperation='source-over';}
  // hp bar
  {const bw=e.w,by=ey-(e.type==='bat'?6:5),fill=Math.max(0,Math.round(bw*e.hp/e.maxHp));
    ctx.fillStyle='#120f1c';ctx.fillRect(ex-1,by-1,bw+2,4);ctx.fillStyle='#3b3550';ctx.fillRect(ex,by,bw,2);
    ctx.fillStyle=e.drained?'#9be07a':e.hp<=Math.ceil(e.maxHp/3)?'#ff9a3a':'#e8413b';ctx.fillRect(ex,by,fill,2);
    ctx.fillStyle='#120f1c';for(let i=1;i<e.maxHp;i++)ctx.fillRect(ex+Math.round(bw*i/e.maxHp),by,1,2);}
}
