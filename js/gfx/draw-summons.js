// draw-summons.js — 나무 골렘, 드래곤, 흡혈 나무, 소환수·보상 아이콘
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

function drawGolem(camR){
  const g=golem;if(!g)return;
  const s=GOLEM[Math.abs(g.vx)>.3?Math.floor(g.t/8)%2:0];
  const gx=Math.round(g.x-camR),gy=Math.round(g.y);
  if(g.life<180&&frame%8<4)ctx.globalAlpha=.5;
  ctx.drawImage(g.inv>0&&frame%4<2?(g.face>0?s.wr:s.wl):(g.face>0?s.r:s.l),gx,gy);
  if(g.punch>0){ctx.fillStyle='#7a5230';ctx.fillRect(g.face>0?gx+12:gx-6,gy+9,6,4);ctx.fillStyle='#3f9a4a';ctx.fillRect(g.face>0?gx+16:gx-6,gy+9,2,4);}
  ctx.globalAlpha=1;
  ctx.fillStyle='#120f1c';ctx.fillRect(gx-1,gy-5,14,3);ctx.fillStyle='#6fdc5a';ctx.fillRect(gx,gy-4,Math.round(12*g.life/1200),1);
  if(g.mode==='stay'){ctx.fillStyle='#ffd34d';ctx.fillRect(gx+5,gy-11,2,4);ctx.fillRect(gx+5,gy-6,2,0);ctx.fillStyle='#120f1c';ctx.fillRect(gx+3,gy-12,6,1);ctx.fillStyle='#ffd34d';ctx.fillRect(gx+3,gy-12,6,1);ctx.fillRect(gx+5,gy-12,2,5);}
  else{ctx.fillStyle='#6fdc5a';const ax=gx+6+(g.face>0?1:-1)*2;ctx.fillRect(ax-1,gy-10,3,1);ctx.fillRect(ax+(g.face>0?1:-1),gy-11,1,3);}
}
function drawDragon(s,camR){
  const f=Math.floor(frame/(s.phase==='breath'?9:6))%2,open=s.phase==='breath'?1:0,sp=DRAGON[open][f];
  const x=Math.round(s.x-camR)-36,y=Math.round(s.y)-23+(f?1:0);
  ctx.drawImage(s.dir>0?sp.r:sp.l,x,y);
  if(open){const mx=Math.round(s.x-camR+s.dir*28),my=Math.round(s.y-5);ctx.globalCompositeOperation='lighter';ctx.fillStyle='#ffd34d';ctx.globalAlpha=.6+.3*Math.sin(frame*.6);ctx.fillRect(mx-2,my-2,4,4);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
}
function drawDrainTrees(camR){
  for(const s of summons){
    if(s.type!=='tree')continue;
    const grow=Math.min(1,s.t/24),fade=s.dying?Math.max(0,1-s.dying/50):1;
    ctx.globalAlpha=fade;
    const x=Math.round(s.x-camR),gy=Math.round(s.gy),h=Math.round(46*grow);
    // trunk
    for(let y=0;y<h;y++){const w=8-Math.round(y/h*3);ctx.fillStyle='#3a2616';ctx.fillRect(x-Math.ceil(w/2)-1,gy-y,w+2,1);ctx.fillStyle=y%5===0?'#5a3a22':'#7a5230';ctx.fillRect(x-Math.ceil(w/2),gy-y,w,1);ctx.fillStyle='#9a6a40';ctx.fillRect(x-Math.ceil(w/2)+1,gy-y,1,1);}
    // canopy
    if(grow>.6){const r=Math.round(16*(grow-.6)/.4),cy=gy-h-4;
      for(let yy=-r;yy<=r;yy++){const w=Math.round(Math.sqrt(Math.max(0,r*r-yy*yy))*1.3);ctx.fillStyle='#1f4a2a';ctx.fillRect(x-w-1,cy+yy,w*2+2,1);ctx.fillStyle=yy<-r/3?'#6fdc5a':yy<r/3?'#3f9a4a':'#2a6a35';ctx.fillRect(x-w,cy+yy,w*2,1);}
      ctx.fillStyle='#d6423a';for(let i=0;i<5;i++)ctx.fillRect(x-10+((i*7)%20),cy-4+((i*5)%10),2,2);}
    // eye knot
    if(grow>.5){ctx.fillStyle='#1a1208';ctx.fillRect(x-3,gy-h/2-2,6,3);ctx.fillStyle='#d8ffb0';ctx.fillRect(x-2,gy-h/2-1,1,1);ctx.fillRect(x+1,gy-h/2-1,1,1);}
    // roots to the enemy
    const e=s.e;if(!e.dead&&grow>.3){
      const ex=e.x+e.w/2-camR,ey=e.y+e.h/2;
      for(let r=0;r<3;r++){const bx=x+(r-1)*3,by=gy-2;const n=24;
        for(let i=0;i<=n*Math.min(1,(grow-.3)/.5);i++){const k=i/n;const mx=bx+(ex-bx)*k,my=by+(ey-by)*k-Math.sin(k*Math.PI)*(10+r*4)+Math.sin(k*9+frame*.15+r)*1.5;
          ctx.fillStyle=r===1?'#6fdc5a':'#3f9a4a';ctx.fillRect(Math.round(mx),Math.round(my),2,2);}}
      for(let i=0;i<8;i++){const a=i/8*Math.PI*2+frame*.05;ctx.fillStyle=i%2?'#3f9a4a':'#6fdc5a';ctx.fillRect(Math.round(ex+Math.cos(a)*(e.w/2+2)),Math.round(ey+Math.sin(a)*(e.h/2+2)),2,2);}
    }
    ctx.globalAlpha=1;
  }
}
function drawSummons(camR){
  for(const s of summons){
    if(s.type==='burst'){const k=1-s.life/22,r=Math.round(6+k*40);ctx.globalCompositeOperation='lighter';
      ctx.globalAlpha=1-k;ctx.fillStyle='#fff6c8';for(let i=0;i<48;i++){const a=i/48*Math.PI*2;ctx.fillRect(Math.round(s.x-camR+Math.cos(a)*r),Math.round(s.y+Math.sin(a)*r),2,2);}
      ctx.globalAlpha=(1-k)*.8;ctx.fillStyle='#ffffff';const c=Math.round(10*(1-k));ctx.fillRect(Math.round(s.x-camR-c),Math.round(s.y-c),c*2,c*2);
      ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';continue;}
    if(s.type==='reward'){const x=Math.round(s.x-camR),y=Math.round(s.y),ei=ELEM.findIndex(e=>e.id===s.r),col=ei>=0?ELEM[ei].col:'#ffd34d';
      if(s.life<30&&frame%4<2)continue;circ(x,y,9,'rgba(255,211,77,.25)');
      if(ei>=0){ctx.fillStyle='#120f1c';ctx.fillRect(x-7,y-7,14,14);ctx.fillStyle=col;for(let k=0;k<10;k++)ctx.fillRect(x-5+k,y+4-k,2,2);ctx.fillRect(x+2,y-6,4,2);ctx.fillRect(x+4,y-6,2,4);}
      else{ctx.save();ctx.translate(x,y);ctx.scale(2,2);ctx.drawImage(s.r==='upgrade'?BOW_UP:BIGBOW.light,-3,-6);ctx.restore();}
      continue;}
    if(s.type==='dragon')drawDragon(s,camR);
    else if(s.type==='sun'){const x=Math.round(s.x-camR),y=Math.round(s.y+Math.sin(frame*.05)*2);
      if(s.life<120&&frame%8<4)continue;
      ctx.globalAlpha=.3;ctx.fillStyle='#fff6c8';for(let r=12;r>6;r-=2){ctx.fillRect(x-r,y-r/2,r*2,r);ctx.fillRect(x-r/2,y-r,r,r*2);}ctx.globalAlpha=1;
      for(let i=0;i<8;i++){const a=frame*.03+i*Math.PI/4;for(let k=8;k<13;k++){ctx.fillStyle=k<10?'#ffd34d':'#fff6c8';ctx.fillRect(Math.round(x+Math.cos(a)*k),Math.round(y+Math.sin(a)*k),1,1);}}
      ctx.fillStyle='#ffd34d';for(let yy=-5;yy<=5;yy++){const w=Math.round(Math.sqrt(25-yy*yy));ctx.fillRect(x-w,y+yy,w*2+1,1);}
      ctx.fillStyle='#ffffff';for(let yy=-3;yy<=3;yy++){const w=Math.round(Math.sqrt(9-yy*yy));ctx.fillRect(x-w,y+yy,w*2+1,1);}}
  }
  for(const b of bolts){
    ctx.globalAlpha=Math.min(1,b.life/6);
    for(let i=0;i<b.pts.length-1;i++){const [x0,y0]=b.pts[i],[x1,y1]=b.pts[i+1];const n=Math.max(1,Math.ceil(Math.abs(y1-y0)));
      for(let k=0;k<=n;k++){const xx=Math.round(x0+(x1-x0)*k/n-camR),yy=Math.round(y0+(y1-y0)*k/n);ctx.fillStyle='#ffe14d';ctx.fillRect(xx-2,yy,5,1);ctx.fillStyle='#ffffff';ctx.fillRect(xx-1,yy,2,1);}}
    ctx.globalAlpha=1;
  }
}
