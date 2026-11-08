// draw-world.js — 타일·레일·광차·화살·독수리·활 그리기
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

function linkAt(type,tx,ty){return links.find(l=>l.type===type&&l.at&&l.at[0]===tx&&l.at[1]===ty);}
function gateLink(tx,ty){return links.find(l=>l.gates&&l.gates.some(([x,y])=>x===tx&&y===ty));}
function plateState(tx,ty){for(const l of links)if(l.type==='plate'){const i=l.plates.findIndex(([x,y])=>x===tx&&y===ty);if(i>=0)return l.pressed?l.pressed[i]:false;}return false;}
function drawTiles(camR){
  const tx0=Math.max(0,Math.floor(camR/TS)),tx1=Math.min(W-1,tx0+VW/TS+1);
  for(let ty=0;ty<ROWS;ty++)for(let tx=tx0;tx<=tx1;tx++){
    const c=grid[ty][tx];if(c==='.')continue;const sx=tx*TS-camR,sy=ty*TS,h=(tx*31+ty*17)%3;
    if(c==='#'){const up=ty>0?grid[ty-1][tx]:'#';const top=ty>0&&up!=='#'&&up!=='o';ctx.drawImage(top?T.top[h]:T.fill[h],sx,sy);
      ctx.fillStyle='rgba(10,6,16,.45)';if(tx>0&&!'#o'.includes(grid[ty][tx-1]))ctx.fillRect(sx,sy,1,16);if(tx<W-1&&!'#o'.includes(grid[ty][tx+1]))ctx.fillRect(sx+15,sy,1,16);}
    else if(c==='o')ctx.drawImage(TX.soil,sx,sy);
    else if(c==='B')ctx.drawImage(TX.crate,sx,sy);
    else if(c==='=')ctx.drawImage(TX.plank,sx,sy);
    else if(c==='^')ctx.drawImage(TX.spike,sx,sy);
    else if(c==='T')ctx.drawImage(TX.bramble,sx,sy);
    else if(c==='t'){ctx.drawImage(TX.wet,sx,sy);if((frame+tx*7+ty*13)%40<4){ctx.fillStyle='#bfe8f0';ctx.fillRect(sx+((tx*5+ty)%12)+2,sy+((frame>>2)%14),1,2);}}
    else if(c==='b'){ctx.drawImage(TX.charred,sx,sy);ctx.fillStyle=frame%6<3?'#ff7a2a':'#ffd34d';for(let i=0;i<4;i++)ctx.fillRect(sx+2+((tx*7+i*5+frame)%12),sy+4+((ty*3+i*7)%10),1,2);}
    else if(c==='i'){const f=fx.find(f=>f.type==='ice'&&f.tx===tx&&f.ty===ty);if(f&&f.t<90&&frame%8<4)ctx.globalAlpha=.55;ctx.drawImage(TX.ice,sx,sy);ctx.globalAlpha=1;}
    else if(c==='A'){const f=fx.find(f=>f.type==='spike'&&f.tx===tx&&f.ty===ty);if(f&&f.t<60&&frame%8<4)ctx.globalAlpha=.5;
      const tip=cell(tx,ty-1)!=='A';ctx.fillStyle='#5aa8c8';
      if(tip){for(let y=0;y<16;y++){const w=Math.max(1,Math.round(y*0.9));ctx.fillStyle='#5aa8c8';ctx.fillRect(sx+8-Math.ceil(w/2)-1,sy+y,w+2,1);ctx.fillStyle=y<3?'#ffffff':'#bfeeff';ctx.fillRect(sx+8-Math.ceil(w/2),sy+y,w,1);ctx.fillStyle='#ffffff';ctx.fillRect(sx+8-Math.ceil(w/2),sy+y,1,1);}}
      else{ctx.fillRect(sx+1,sy,14,16);ctx.fillStyle='#bfeeff';ctx.fillRect(sx+2,sy,12,16);ctx.fillStyle='#ffffff';ctx.fillRect(sx+3,sy,2,16);ctx.fillStyle='#9fdcf6';ctx.fillRect(sx+11,sy,2,16);}
      ctx.globalAlpha=1;}
    else if(c==='w'){const top=ty===0||grid[ty-1][tx]!=='w';ctx.fillStyle='rgba(30,95,165,.82)';ctx.fillRect(sx,sy,16,16);
      if(top){ctx.fillStyle='#8fd6ff';for(let x=0;x<16;x++){const yy=Math.round(Math.sin((tx*16+x)*.35+frame*.08));ctx.fillRect(sx+x,sy+1+yy,1,1);}ctx.fillStyle='rgba(143,214,255,.35)';ctx.fillRect(sx,sy+3,16,2);}}
    else if(c==='R')ctx.drawImage(TX.rock,sx,sy);
    else if(c==='Z'||c==='z'){ctx.drawImage(c==='z'?TX.gen1:TX.gen0,sx,sy);if(c==='z'&&frame%10<2){ctx.fillStyle='#ffe14d';ctx.fillRect(sx+3+(frame%9),sy-1,1,1);}}
    else if(c==='G'){ctx.fillStyle='rgba(143,227,255,.12)';ctx.fillRect(sx+2,sy,12,16);
      for(const lx of [3,8,12]){ctx.fillStyle=((frame>>2)+lx+ty)%3===0?'#ffe14d':'#8fe3ff';for(let y=0;y<16;y+=2)ctx.fillRect(sx+lx+(((y+frame+lx)>>2)%2),sy+y,1,2);}}
    else if(c==='|'||c===':'){const L=gateLink(tx,ty),a=L?L.anim:0;const off=Math.round(a*15);
      ctx.save();ctx.beginPath();ctx.rect(sx,sy,16,16);ctx.clip();ctx.drawImage(TX.gate,sx,sy-off);ctx.restore();
      if(c===':'){ctx.fillStyle='#2a2630';ctx.fillRect(sx+2,sy,12,1);}}
    else if(c==='g')ctx.drawImage(TX.glass,sx,sy);
    else if(c==='%'){ctx.fillStyle='#120a1e';ctx.fillRect(sx,sy,16,16);
      for(let i=0;i<10;i++){const a=frame*.05+i*.7+tx+ty*1.3,r=3+((i*5)%6);ctx.fillStyle=i%3?'#3a1f5e':'#6a3fa8';ctx.fillRect(sx+8+Math.round(Math.cos(a)*r)-1,sy+8+Math.round(Math.sin(a)*r)-1,2,2);}
      ctx.fillStyle='#ff5bff';if(frame%50<3)ctx.fillRect(sx+7,sy+7,2,1);}
    else if(c==='_'){const pr=plateState(tx,ty);ctx.fillStyle='#2a2630';ctx.fillRect(sx+1,sy+(pr?14:12),14,pr?2:4);ctx.fillStyle=pr?'#ffd34d':'#c9a24a';ctx.fillRect(sx+2,sy+(pr?14:12),12,1);}
    else if(c==='/'||c==='\\'){ctx.fillStyle='#2a2630';ctx.fillRect(sx+1,sy+1,14,14);ctx.fillStyle='#4a4458';ctx.fillRect(sx+2,sy+2,12,12);
      for(let i=0;i<12;i++){const y=c==='/'?13-i:2+i;ctx.fillStyle='#e8ecf4';ctx.fillRect(sx+2+i,y,1,1);ctx.fillStyle='#9aa1b3';ctx.fillRect(sx+2+i,y+(c==='/'?1:-1),1,1);}
      if(frame%60<6){ctx.fillStyle='#ffffff';ctx.fillRect(sx+7,sy+(c==='/'?7:7),2,2);}}
    else if(c==='v'){const L=linkAt('lever',tx,ty),on=L&&L.on;ctx.fillStyle='#2a2630';ctx.fillRect(sx+3,sy+12,10,4);ctx.fillStyle='#6e6880';ctx.fillRect(sx+4,sy+12,8,2);
      ctx.fillStyle='#7a5230';for(let i=0;i<8;i++)ctx.fillRect(sx+8+(on?i/2:-i/2)|0,sy+12-i,1,1);ctx.fillStyle='#d6423a';ctx.fillRect(sx+(on?11:3),sy+3,3,3);}
    else if(c==='*'){const L=linkAt('crystal',tx,ty),on=L&&L.open;ctx.fillStyle='#1a1226';ctx.fillRect(sx+4,sy+2,8,13);ctx.fillStyle=on?'#fff6c8':'#5a4a8a';ctx.fillRect(sx+5,sy+3,6,11);
      ctx.fillStyle=on?'#ffffff':'#8a7ac8';ctx.fillRect(sx+6,sy+4,2,6);if(!on&&frame%70<8){ctx.fillStyle='#c8b8ff';ctx.fillRect(sx+7,sy+5,1,1);}}
    else if(c==='I'){
      ctx.fillStyle='#5b606c';for(let y=0;y<sy+5;y+=3)ctx.fillRect(sx+7,y,2,2);
      ctx.fillStyle='#1a1226';ctx.fillRect(sx+3,sy+5,10,5);ctx.fillStyle='#7a5230';ctx.fillRect(sx+4,sy+5,8,3);ctx.fillStyle='#a8713d';ctx.fillRect(sx+4,sy+5,8,1);
      for(const L of links)if(L.type==='torch'){const i=L.torches.findIndex(([x,y])=>x===tx&&y===ty);if(i<0)continue;
        const sym=SYM[L.symbols[i]];ctx.fillStyle='#2a2630';ctx.fillRect(sx+3,sy+10,9,8);ctx.fillStyle='#4a4458';ctx.fillRect(sx+4,sy+11,7,6);ctx.drawImage(sym,sx+5,sy+11);
        if(L.lit[i]){for(let k=0;k<7;k++){ctx.fillStyle=k%3?'#ffd34d':'#ff7a2a';ctx.fillRect(sx+5+((k*3+frame)%5),sy+4-((k*2+frame)%5),2,2);}}
        else if(frame%50<4){ctx.fillStyle='#5a5468';ctx.fillRect(sx+7,sy+3,1,1);}}}
    else if(c==='r')ctx.drawImage(TX.tablet,sx,sy);
    else if(c==='k'){ctx.drawImage(TX.cracked,sx,sy);}
    else if(c==='l'){const top=ty===0||grid[ty-1][tx]!=='l';
      ctx.fillStyle='#c8301a';ctx.fillRect(sx,sy,16,16);ctx.fillStyle='#ff6a1a';for(let i=0;i<5;i++){const xx=(tx*13+i*7+(frame>>3))%16,yy=(ty*5+i*11+(frame>>2))%16;ctx.fillRect(sx+xx,sy+yy,3,2);}
      if(top){for(let x=0;x<16;x++){const yy=Math.round(Math.sin((tx*16+x)*.3+frame*.06)*1.2);ctx.fillStyle='#ffb03a';ctx.fillRect(sx+x,sy+1+yy,1,2);ctx.fillStyle='#fff0a0';if((x+tx*3+(frame>>3))%7===0)ctx.fillRect(sx+x,sy+yy,1,1);}
        if((frame+tx*17)%50===0)particles.push({kind:'flame',pal:'lava',x:sx+camR+4+Math.random()*8,y:sy,vx:(Math.random()-.5)*.6,vy:-1.6,life:20,max:36,size:1.5,grow:.05,g:.08});}}
    else if(c==='O'){const f=fx.find(f=>f.type==='obsid'&&f.tx===tx&&f.ty===ty);ctx.drawImage(TX.obsid,sx,sy);
      if(f&&f.t<150&&frame%10<5){ctx.fillStyle='#ff6a1a';ctx.fillRect(sx+3,sy+5,6,1);ctx.fillRect(sx+8,sy+9,5,1);}}
    else if(c==='W'){const L=links.find(l=>l.type==='windmill'&&l.at[0]===tx&&l.at[1]===ty),ang=L?L.ang||0:0,cx=sx+8,cy=sy+8;
      ctx.fillStyle='#4a3424';ctx.fillRect(cx-1,cy,3,10);
      for(let b2=0;b2<4;b2++){const a=ang+b2*Math.PI/2;for(let k=2;k<10;k++){const xx=Math.round(cx+Math.cos(a)*k),yy=Math.round(cy+Math.sin(a)*k);ctx.fillStyle=k<4?'#7a5230':'#e8e2d0';ctx.fillRect(xx,yy,2,2);
        const ox=Math.round(Math.cos(a+1.57)*2),oy=Math.round(Math.sin(a+1.57)*2);if(k>3){ctx.fillStyle=L&&L.spin>0?'#b6f05a':'#c9a24a';ctx.fillRect(xx+ox,yy+oy,1,1);}}}
      ctx.fillStyle='#1a1226';ctx.fillRect(cx-1,cy-1,3,3);ctx.fillStyle='#c9a24a';ctx.fillRect(cx,cy,1,1);}
    else if(c==='@'){ctx.fillStyle='#c9a24a';ctx.fillRect(sx+8,sy+6,8,1);ctx.fillStyle='#1a1226';ctx.fillRect(sx+3,sy+3,8,8);ctx.fillStyle='#e85a5a';ctx.fillRect(sx+4,sy+4,6,6);
      ctx.fillStyle='#ffffff';ctx.fillRect(sx+5,sy+5,4,4);ctx.fillStyle='#e85a5a';ctx.fillRect(sx+6,sy+6,2,2);}
    else if(c==='y'||c==='f'||c==='c'){
      if(trunks.has(tx+','+ty)&&c!=='c'){ctx.fillStyle='#4a2e1a';ctx.fillRect(sx+5,sy,6,16);ctx.fillStyle='#6b4429';ctx.fillRect(sx+6,sy,4,16);ctx.fillStyle='#8a5a36';ctx.fillRect(sx+7,sy+(tx*5+ty*3)%12,1,3);}
      if(c==='f')ctx.drawImage(TX.leaves,sx,sy);else if(c==='c')ctx.drawImage(TX.crown,sx,sy);}
    else if(c==='L'){const l=lanterns.find(l=>l.tx===tx&&l.ty===ty);ctx.drawImage(l&&l.lit?TX.lamp1:TX.lamp0,sx,sy);
      if(l&&!l.lit&&frame%60<30){ctx.fillStyle='#6a648a';ctx.fillRect(sx+7,sy+3,2,2);}}
    else if(c==='D'||c==='d'||c==='X'){const isTop=ty===0||grid[ty-1][tx]!==c;ctx.drawImage(DOORS[c],0,isTop?0:16,16,16,sx,sy,16,16);
      if(c==='X'&&frame%5===0&&Math.random()<.5)particles.push({x:tx*TS+4+Math.random()*8,y:sy+Math.random()*16,vx:0,vy:-.3,life:30,max:30,c:'#fff3c4',g:0});}
  }
  for(const b of blocks){const [bx,by]=blockDrawPos(b);ctx.drawImage(TX.block,Math.round(bx-camR),Math.round(by));}
}
function drawRail(camR){
  if(!rail)return;
  const y=rail.row*TS,xa=rail.x0*TS-camR,xb=(rail.x1+1)*TS-camR;
  ctx.fillStyle='#4a2f1c';for(let x=xa;x<xb;x+=6)ctx.fillRect(x,y-1,4,3);
  ctx.fillStyle='#b9bfcc';ctx.fillRect(xa,y-2,xb-xa,1);ctx.fillStyle='#5b606c';ctx.fillRect(xa,y-1,xb-xa,1);
  ctx.fillStyle='#1a1226';ctx.fillRect(xa-3,y-9,5,8);ctx.fillRect(xb-2,y-9,5,8);
  ctx.fillStyle='#d6423a';ctx.fillRect(xa-2,y-8,3,6);ctx.fillRect(xb-1,y-8,3,6);
}
function drawCart(camR){
  if(!cart)return;
  const x=Math.round(cart.x-camR),y=Math.round(cart.y)-(Math.abs(cart.vx)>.6&&frame%6<3?1:0);
  ctx.fillStyle='#1a1226';ctx.fillRect(x,y,22,10);ctx.fillStyle='#7a5230';ctx.fillRect(x+1,y+1,20,8);
  ctx.fillStyle='#b9bfcc';ctx.fillRect(x,y,22,2);ctx.fillStyle='#5b606c';ctx.fillRect(x+1,y+5,20,1);
  ctx.fillStyle='#e3e6ee';ctx.fillRect(x+3,y+3,1,1);ctx.fillRect(x+18,y+3,1,1);
  const spin=Math.floor(cart.x/3)%2;
  for(const wx of [x+3,x+14]){ctx.fillStyle='#1a1226';ctx.fillRect(wx,y+8,5,5);ctx.fillStyle='#3a3a46';ctx.fillRect(wx+1,y+9,3,3);ctx.fillStyle='#c9ced8';ctx.fillRect(wx+1+spin*2,y+10,1,1);}
}
function drawArrow(a,camR){
  const sp=Math.hypot(a.vx,a.vy)||1,dx=a.vx/sp,dy=a.vy/sp,col=ELEM[a.el].col,id=ELEM[a.el].id;
  if(a.stuck&&a.stuck<15&&frame%4<2)return;
  if(a.charged&&id==='wind'){drawEagle(a,camR);return;}
  if(!a.charged){
    if(id==='earth'){for(let i=0;i<9;i++){ctx.fillStyle=i<3?'#8e8a9e':i>6?'#c9925a':'#7a5230';ctx.fillRect(Math.round(a.x-dx*i-camR),Math.round(a.y-dy*i),i<3?2:1,i<3?2:1);}return;}
    if(id==='wind'){for(let i=0;i<8;i++){ctx.fillStyle=i<2?'#e2ffa8':i>5?'#b6f05a':'#9acf4a';ctx.fillRect(Math.round(a.x-dx*i-camR),Math.round(a.y-dy*i),1,1);}
      ctx.fillStyle='rgba(226,255,168,.6)';for(let i=10;i<22;i+=3){ctx.fillRect(Math.round(a.x-dx*i-dy*3-camR),Math.round(a.y-dy*i+dx*3),1,1);ctx.fillRect(Math.round(a.x-dx*i+dy*3-camR),Math.round(a.y-dy*i-dx*3),1,1);}return;}
    for(let i=0;i<8;i++){ctx.fillStyle=i<2?col:i>5?'#f4efe2':'#b98a55';ctx.fillRect(Math.round(a.x-dx*i-camR),Math.round(a.y-dy*i),1,1);}return;}
  const P=(i,o,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(a.x-dx*i-dy*o-camR),Math.round(a.y-dy*i+dx*o),1,1);};
  const P2=(i,o,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(a.x-dx*i-dy*o-camR),Math.round(a.y-dy*i+dx*o),2,2);};
  if(id==='normal'){
    ctx.globalAlpha=.35;for(let i=0;i<24;i+=2)P2(i,-1,'#7dff8a');ctx.globalAlpha=1;
    for(let i=0;i<24;i++){P(i,0,i<4?'#e8ffe0':'#3fbf5a');P(i,1,'#2f9a4a');}
    for(let o=-3;o<=3;o++)P(4-Math.abs(o),o,'#7dff8a');for(let o=-2;o<=2;o++)P(5-Math.abs(o),o,'#c8ffd0');
    for(let o=-3;o<=3;o++){P(22,o,'#2f7a3d');P(23,o,'#4fae5a');}
  }else if(id==='ice'){
    for(let i=0;i<16;i++){const w=i<3?0:i<8?1:2;for(let o=-w;o<=w;o++)P(i,o,o===-w&&w>0?'#ffffff':i<3?'#ffffff':'#bfeeff');}
    for(let i=4;i<16;i+=4){P(i,-3,'#e6fbff');P(i,3,'#e6fbff');}
  }else if(id==='fire'){
    const wig=Math.sin(frame*.5)*1.5;
    for(let i=6;i<16;i++)P2(i,Math.sin(i*.6+frame*.4)*2+wig*.3,i%2?'#ff7a2a':'#ffd34d');
    for(let i=0;i<7;i++)for(let o=-3;o<=3;o++)if(Math.abs(o)<=3-Math.floor(i/3))P(i,o,Math.abs(o)<2&&i>1?'#ffd34d':'#ff7a2a');
    P(-1,-1,'#ff9a3a');P(-1,0,'#ff9a3a');P(-2,0,'#ffd34d');P(2,-2,'#1a0c10');P(4,-4,'#ffd34d');P(5,-5,'#ffe7a8');P(2,2,'#d6423a');P(1,3,'#d6423a');
  }else if(id==='elec'){
    let o=0;for(let i=0;i<18;i++){if(i%3===0)o=(Math.random()-.5)*5;P(i,o,'#ffe14d');P(i,o*.4,'#ffffff');}
    P2(0,-1,'#ffffff');
  }else if(id==='grass'){
    for(let i=0;i<14;i++)P(i,Math.sin(i*.9+frame*.2)*2,'#3f9a4a');
    for(let i=0;i<5;i++)for(let o=-2;o<=2;o++)P(i,o,Math.abs(o)===2?'#3a2616':'#7a5230');P(1,-1,'#a8713d');
    P(-1,0,'#6fdc5a');P(-2,0,'#6fdc5a');P(-2,1,'#9be07a');P(12,2,'#e85a8a');
  }else if(id==='earth'){
    for(let i=0;i<18;i++){const w=i<4?Math.floor(i/2):i<14?2:1;for(let o=-w;o<=w;o++)P(i,o,o===-w?'#a8a2b8':((i*3+o*5)%7===0)?'#ff7a2a':'#6e6a7a');}
    for(let o=-3;o<=3;o++)P(16,o,'#4a4656');P(1,0,'#d8d4e4');if(frame%4<2)P(8,1,'#ffd34d');
  }else if(id==='light'){
    ctx.globalAlpha=.4;for(let i=0;i<18;i+=2)P2(i,-1,'#fff6c8');ctx.globalAlpha=1;
    for(let i=0;i<18;i++){P(i,0,'#ffffff');if(i<10)P(i,1,'#fff6c8');}
    if(frame%4<2){P(0,-3,'#ffffff');P(0,3,'#ffffff');P(-3,0,'#ffffff');P(3,0,'#ffffff');}
  }
}
function drawEagle(a,camR){
  const sp=EAGLE[Math.floor(frame/5)%2];
  ctx.save();ctx.translate(Math.round(a.x-camR),Math.round(a.y));
  if(a.vx<0){ctx.scale(-1,1);ctx.rotate(Math.atan2(a.vy,-a.vx));}else ctx.rotate(Math.atan2(a.vy,a.vx));
  ctx.drawImage(sp,-28,-15);ctx.restore();
}
function drawBowFX(camR){
  const cx=p.x+p.w/2,full=p.bowCharging&&p.bowChargeT>=BOWFULL&&p.chargedCD<=0,id=ELEM[elem].id;
  const bx=Math.round(cx-camR+Math.cos(p.bowAng)*4),by=Math.round(p.y+6+Math.sin(p.bowAng)*4);
  if(full&&id==='elec'){for(let i=0;i<4;i++){ctx.fillStyle=i%2?'#3a3d4c':'#5a5f78';const ox=Math.round(Math.cos(frame*.1+i)*2);ctx.fillRect(bx-7+i*4+ox,by-16+(i%2),6,4);}
    if(frame%6<2){ctx.fillStyle='#ffe14d';ctx.fillRect(bx-3+((frame*7)%7),by-12,1,3);ctx.fillRect(bx-2+((frame*7)%7),by-10,1,2);}}
  ctx.save();ctx.translate(bx,by);ctx.rotate(p.bowAng);
  if(full){const s=BIGBOW[id];
    if(id==='light'&&frame%6<3)ctx.globalAlpha=.6;
    ctx.drawImage(s,-1,-7);ctx.globalAlpha=1;
    // nocked charged arrow preview
    ctx.fillStyle=id==='normal'?'#7dff8a':ELEM[elem].col;ctx.fillRect(-6,0,12,1);
  }else{ctx.drawImage(hasUp?BOW_UP:BOW,-1,-6);if(p.bowCharging){ctx.fillStyle='#b98a55';ctx.fillRect(-4+Math.min(3,p.bowChargeT/30)|0,0,8,1);}}
  ctx.restore();
  if(full&&id==='light'&&frame%8<3){ctx.fillStyle='#ffffff';ctx.fillRect(bx-8,by,17,1);ctx.fillRect(bx,by-8,1,17);}
}
