// lighting.js — 어두운 스테이지 조명
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

const [DK,dg]=mk(VW,VH);
function drawDark(camR){
  dg.globalCompositeOperation='source-over';dg.clearRect(0,0,VW,VH);dg.fillStyle=flash>0?'rgba(3,2,8,.4)':'rgba(3,2,8,.95)';dg.fillRect(0,0,VW,VH);
  dg.globalCompositeOperation='destination-out';
  const L=(x,y,r,a=1)=>{x-=camR;if(x<-r||x>VW+r)return;const gr=dg.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(0,0,0,${a})`);gr.addColorStop(.55,`rgba(0,0,0,${a*.8})`);gr.addColorStop(1,'rgba(0,0,0,0)');dg.fillStyle=gr;dg.fillRect(x-r,y-r,r*2,r*2);};
  L(p.x+p.w/2,p.y+6,30+Math.sin(frame*.2)*1.5,.9);
  if(p.bowCharging&&p.bowChargeT>=BOWFULL)L(p.x+p.w/2,p.y+6,44,.8);
  for(const l of lanterns)l.lit?L(l.tx*TS+8,l.ty*TS+4,88+Math.sin(frame*.1+l.tx)*2):L(l.tx*TS+8,l.ty*TS+4,10,.5);
  for(const a of arrows){const id=ELEM[a.el].id;if(id==='light')L(a.x,a.y,a.stuck?60*Math.min(1,a.stuck/60):40);else if(a.charged)L(a.x,a.y,30,.8);else if(id==='fire'||id==='elec')L(a.x,a.y,18,.7);}
  for(const f of fx)if(f.type==='burn')L(f.tx*TS+8,f.ty*TS+8,36,.9);
  for(const s of summons)if(s.type==='geyser'&&s.t<70)L(s.x,s.gy-40,70,.95);
  if(boss&&!boss.hidden&&boss.state!=='sleep'&&boss.state!=='dead')L(boss.x+boss.w/2,boss.y+boss.h/2,38,.75);
  for(const h of bossHaz)if(h.kind==='proj')L(h.x+h.w/2,h.y+h.h/2,12,.7);else if(h.kind==='spike'&&h.warn<=0)L(h.x+6,h.gy-12,20,.7);
  for(const it of items)if(it.type==='chest')L(it.x+7,it.y+4,30,.8);
  for(const s of summons){if(s.type==='sun')L(s.x,s.y,140*(s.life<120?s.life/120:1));else if(s.type==='burst')L(s.x,s.y,96*s.life/22);else if(s.type==='dragon'){L(s.x,s.y,46,.8);if(s.phase==='breath'){L(s.hx,s.gy-12,84,.95);L(s.x+s.dir*32,s.y-5,30,.9);}}}
  for(const L2 of links)if(L2.type==='crystal'){const [x,y]=L2.at;L(x*TS+8,y*TS+8,L2.open?50:12,L2.open?1:.5);}
  else if(L2.type==='torch'){L2.torches.forEach(([x,y],i)=>{if(L2.lit[i])L(x*TS+8,y*TS+4,46,.9);else L(x*TS+8,y*TS+10,14,.5);});}
  else if(L2.type==='tablet'){L(L2.at[0]*TS+8,L2.at[1]*TS+8,12,.5);}
  for(let y=0;y<ROWS;y++)for(let x=Math.max(0,Math.floor(camR/TS)-2);x<=Math.min(W-1,Math.floor(camR/TS)+22);x++){const c=grid[y][x];if(c==='X'&&(y===0||grid[y-1][x]!=='X'))L(x*TS+8,y*TS+16,40,.9);else if(c==='z')L(x*TS+8,y*TS+8,28,.8);}
  if(p.giantT>0)L(p.x+p.w/2+p.face*24,p.y,70,.8);
  ctx.drawImage(DK,0,0);
  for(const e of enemies){if(e.dead||e.type!=='bat')continue;const ex=Math.round(e.x-camR)-1,ey=Math.round(e.y)-1,f=Math.floor(e.t/7)%2;ctx.fillStyle='#ff5b5b';ctx.fillRect(ex+5,ey+(f?1:2),2,1);}
}
