// draw-bosses.js — 보스 10종 그리기, 보스 공격 이펙트, 보물상자
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

function drawGolemBoss(b,camR){
  if(b.state==='dead')return;
  const f=b.face,X=Math.round(b.x-camR),Y=Math.round(b.y)+(b.state==='sleep'?0:0);
  const jit=(b.state==='dying'||b.state==='slamUp'||b.state==='stagger')?Math.round((Math.random()-.5)*2):0;
  const R=(lx,ly,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect((f>0?X+lx:X+b.w-lx-w)+jit,Y+ly,w,h);};
  const fl=b.flash>0&&frame%4<2,dim=b.state==='sleep';
  const O='#1a1626',S=fl?'#e8e4f0':dim?'#5a5666':'#6e6a7a',SL=fl?'#ffffff':dim?'#6e6a7a':'#8e8a9e',SD=fl?'#b8b4c4':'#4a4656',MS='#4fae5a',MD='#2f7a3d';
  const st=b.state,u=bossBend(b);
  let fists;
  if(st==='slamUp')fists=[[2,-14],[26,-14]];
  else if(st==='slam'||st==='recover')fists=[[40,42],[30,44]];
  else if(st==='throwUp')fists=[[-6,34],[22,-16]];
  else if(st==='beamCharge'||st==='beam')fists=[[-12,26],[40,26]];
  else if(st==='sleep')fists=[[-4,42],[32,42]];
  else{const sw=st==='walk'?Math.round(Math.sin(b.t*.12)*3):0;fists=[[-6,34+sw],[34,34-sw]];}
  const arm=(sx,sy,fx2,fy2)=>{for(let i=0;i<=6;i++){const k=i/6,xx=sx+(fx2-sx)*k,yy=sy+(fy2-sy)*k;R(Math.round(xx)-4,Math.round(yy)-4,9,9,O);}for(let i=0;i<=6;i++){const k=i/6,xx=sx+(fx2-sx)*k,yy=sy+(fy2-sy)*k;R(Math.round(xx)-3,Math.round(yy)-3,7,7,SD);}};
  const fist=(fx2,fy2)=>{R(fx2-1,fy2-1,14,13,O);R(fx2,fy2,12,11,S);R(fx2,fy2,12,3,SL);R(fx2+3,fy2+7,1,3,SD);R(fx2+7,fy2+7,1,3,SD);};
  // back arm
  arm(3,22+u,fists[0][0]+6,fists[0][1]+5);fist(fists[0][0],fists[0][1]);
  // legs
  R(5,40,12,16,O);R(6,41,10,14,S);R(6,41,10,3,SL);R(23,40,12,16,O);R(24,41,10,14,S);R(24,41,10,3,SL);R(3,53,16,3,O);R(21,53,16,3,O);R(8,47,2,4,MS);
  // torso
  R(1,15+u,38,29,O);R(2,16+u,36,27,S);R(2,16+u,36,4,SL);R(2,38+u,36,5,SD);
  R(8,24+u,1,6,SD);R(9,29+u,3,1,SD);R(31,22+u,1,7,SD);R(28,28+u,4,1,SD);R(14,38+u,1,4,O);R(26,37+u,1,5,O);
  R(2,15+u,9,2,MS);R(29,15+u,9,2,MS);R(4,14+u,4,1,MD);R(33,14+u,3,1,MD);R(3,17+u,2,3,MD);
  // head
  R(11,3+u,18,14,O);R(12,4+u,16,12,S);R(12,4+u,16,3,SL);R(13,3+u,7,2,MS);R(22,3+u,3,1,MD);
  const eye=dim?'#1a3a22':b.coreOpen>0?'#c8ffd8':'#3aff7a';R(15,9+u,4,2,eye);R(22,9+u,4,2,eye);R(14,14+u,12,1,SD);
  // core
  const cx=20,cy=30+u,open=b.coreOpen>0||st==='dying';
  R(cx-7,cy-7,14,14,O);
  if(open){R(cx-6,cy-6,12,12,'#0e3a1a');
    for(let yy=-5;yy<=5;yy++){const w=5-Math.abs(yy);R(cx-w,cy+yy,w*2,1,Math.abs(yy)<2?'#c8ffd8':'#3aff7a');}
    R(cx-2,cy-3,1,2,'#ffffff');
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.35+.25*Math.sin(frame*.3);R(cx-11,cy-11,22,22,'#3aff7a');ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
  else{R(cx-6,cy-6,12,12,SD);R(cx-6,cy-6,12,2,SL);R(cx-6,cy,12,1,O);if(!dim&&frame%40<20)R(cx-1,cy-1,2,1,'#3aff7a');}
  if(st==='beamCharge'){const k=b.t/60;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=k*.8;R(cx-4-k*6,cy-4-k*6,8+k*12,8+k*12,'#3aff7a');ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
  // front arm
  arm(37,22+u,fists[1][0]+6,fists[1][1]+5);fist(fists[1][0],fists[1][1]);
  if(st==='throwUp'||(st==='throw'&&b.t<3)){const rx=fists[1][0]+6,ry=fists[1][1]-8;R(rx-7,ry-7,14,14,O);R(rx-6,ry-6,12,12,'#7a7488');R(rx-6,ry-6,12,3,'#9a94a8');}
  if(b.frozen>0){ctx.fillStyle='rgba(191,238,255,.35)';ctx.fillRect(X-2,Y-4,b.w+4,b.h+4);}
  if(b.orb>0){const [ox,oy]=bossCore(b),k=b.orb/96,r=Math.round(30+k*10);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.25+(1-k)*.45;ctx.fillStyle='#fff6c8';ctx.fillRect(ox-camR-r,oy-r,r*2,r*2);ctx.globalAlpha=1;
    for(let i=0;i<16;i++){const a=frame*(.08+(1-k)*.25)+i*Math.PI/8;ctx.fillStyle=i%2?'#ffffff':'#ffd34d';ctx.fillRect(Math.round(ox-camR+Math.cos(a)*r),Math.round(oy+Math.sin(a)*r),2,2);}ctx.globalCompositeOperation='source-over';}
  if(st==='beamCharge'&&b.t<60){const [cx2,cy2]=bossCore(b);if(frame%4<2){ctx.fillStyle='#3aff7a';for(let i=0;i<70;i++){const xx=cx2+Math.cos(b.aim)*i*4,yy=cy2+Math.sin(b.aim)*i*4;if(solid(Math.floor(xx/TS),Math.floor(yy/TS)))break;if(i%2===0)ctx.fillRect(Math.round(xx-camR),Math.round(yy),1,1);}}}
  if(st==='beam'&&b.beamEnd){const [cx2,cy2]=bossCore(b),[ex,ey]=b.beamEnd,n=Math.ceil(Math.hypot(ex-cx2,ey-cy2)/2);ctx.globalCompositeOperation='lighter';
    for(let i=0;i<=n;i++){const k=i/n,xx=Math.round(cx2+(ex-cx2)*k-camR),yy=Math.round(cy2+(ey-cy2)*k),w=3+Math.round(Math.sin(i*.5+frame)*1);ctx.fillStyle='#3aff7a';ctx.fillRect(xx-w,yy-w,w*2,w*2);ctx.fillStyle='#e8ffe8';ctx.fillRect(xx-1,yy-1,2,2);}
    ctx.globalCompositeOperation='source-over';}
}
function fillPoly(pts,col){const ys=pts.map(q=>q[1]);ctx.fillStyle=col;
  for(let y=Math.floor(Math.min(...ys));y<=Math.ceil(Math.max(...ys));y++){const xs=[];
    for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [x1,y1]=pts[i],[x2,y2]=pts[j];if((y1>y+.5)!==(y2>y+.5))xs.push(x1+(y+.5-y1)*(x2-x1)/(y2-y1));}
    xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2){const a=Math.round(xs[k]),b=Math.round(xs[k+1]);if(b>a)ctx.fillRect(a,y,b-a,1);}}}
function circ(x,y,r,col){ctx.fillStyle=col;for(let yy=-r;yy<=r;yy++){const w=Math.round(Math.sqrt(Math.max(0,r*r-yy*yy)));ctx.fillRect(x-w,y+yy,w*2+1,1);}}
function bdraw(b,camR){const X=Math.round(b.x-camR),Y=Math.round(b.y),f=b.face,W2=b.w;
  return {X,Y,
    R:(lx,ly,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(f>0?X+lx:X+W2-lx-w),Math.round(Y+ly),w,h);},
    E:(cx,cy,rx,ry,c)=>{ctx.fillStyle=c;const ccx=f>0?cx:W2-cx;const R2=Math.max(1,Math.floor(ry));for(let yy=-R2;yy<=R2;yy++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(yy*yy)/(ry*ry))));if(w>0)ctx.fillRect(Math.round(X+ccx-w),Math.round(Y+cy+yy),w*2,1);}},
    PX2:(lx)=>f>0?X+lx:X+W2-lx};}
const bfl=b=>b.flash>0&&frame%4<2;
const WYVERN=[[makeDragon(0,false,WYV_PAL),makeDragon(1,false,WYV_PAL)],[makeDragon(0,true,WYV_PAL),makeDragon(1,true,WYV_PAL)]];
const BOSSDRAW={
 slimeking(b,camR){const {E,R}=bdraw(b,camR);const F=bfl(b);
  let sq=0;if(b.state==='crouch')sq=Math.min(1,b.t/12);else if(b.air)sq=b.vy<0?-.5:-.2;
  const w=20*(1+sq*.25),h=15*(1-sq*.3),cy=b.h-h;
  E(20,cy,w+1,h+1,'#14241a');E(20,cy,w,h,F?'#ffffff':'#4fbf5c');E(20,cy+h*.4,w*.88,h*.5,F?'#ffffff':'#3c9a4b');E(12,cy-h*.45,4,2,'#c8ffd0');
  const ey=Math.round(cy-3);R(12,ey,4,5,'#14241a');R(24,ey,4,5,'#14241a');R(13,ey+1,1,1,'#ffffff');R(25,ey+1,1,1,'#ffffff');R(16,ey+7,8,2,'#14241a');
  const ct=Math.round(cy-h-5);R(12,ct+2,16,5,'#1a1226');R(13,ct+3,14,3,'#ffd34d');[13,19,25].forEach(x=>{R(x,ct-1,2,4,'#1a1226');R(x,ct,2,3,'#ffd34d');});R(19,ct+4,2,1,'#e8413b');
  if(frame%30<15)R(29,Math.round(cy+3),2,2,'#9be07a');
 },
 yeti(b,camR){const {R,E}=bdraw(b,camR);const F=bfl(b),W=F?'#ffffff':'#e8f4ff',WD='#b8cce0',S='#8fb8e0',K='#1a2030';
  const c=(b.state==='chargeUp'||b.state==='stun')?4:0,dash=b.state==='dash',walk=b.state==='walk'?Math.round(Math.sin(b.t*.25)*2):0;
  R(6,30+walk,8,10-walk,K);R(7,31+walk,6,9-walk,WD);R(17,30-walk,8,10+walk,K);R(18,31-walk,6,9+walk,WD);
  E(15,20+c,14,13,K);E(15,20+c,13,12,W);E(15,25+c,10,6,WD);
  const ay=b.state==='throwUp'?-6:dash?12:15;
  R(-4,ay+c,8,16,K);R(-3,ay+1+c,6,14,W);R(26,ay+c,8,16,K);R(27,ay+1+c,6,14,W);R(-3,ay+13+c,6,2,S);R(27,ay+13+c,6,2,S);
  if(b.state==='throwUp')E(30,ay-3,5,5,'#ffffff');
  E(19,10+c,7,6,K);E(19,10+c,6,5,F?'#ffffff':S);R(16,8+c,2,2,K);R(22,8+c,2,2,K);
  const mo=b.state==='breathUp'||dash;R(16,12+c,7,mo?3:1,K);if(mo){R(17,12+c,1,1,'#fff');R(21,12+c,1,1,'#fff');}
  R(9,0+c,3,4,'#c9b890');R(8,-1+c,2,2,'#c9b890');R(24,0+c,3,4,'#c9b890');R(26,-1+c,2,2,'#c9b890');
  if(b.state==='breathUp'&&frame%3===0)puff(b.x+b.w/2+b.face*12,b.y+12,2,'#e8f4ff',1,0,10);
  if(b.state==='stun'&&frame%10<5){R(10,-6,2,2,'#ffd34d');R(20,-8,2,2,'#ffd34d');}
 },
 batqueen(b,camR){const {R,E,X,Y}=bdraw(b,camR);const F=bfl(b),P=F?'#ffffff':'#7a4fb8',PD='#4c2d7c',K='#130d1f';
  const fu=Math.floor(frame/(b.state==='swoop'?3:6))%2,wy=fu?-10:6,bx=X+20,by=Y+10;
  for(const s of [-1,1]){const pts=[[bx+s*8,by-2],[bx+s*30,by+wy-6],[bx+s*37,by+wy+4],[bx+s*29,by+wy+2],[bx+s*25,by+wy+10],[bx+s*17,by+wy+4],[bx+s*10,by+8]];
    fillPoly(pts,K);fillPoly(pts.map(([x,y])=>[x-s*1.5,y+(y<by+wy?1.5:-1)]),F?'#fff':PD);}
  E(20,12,10,9,K);E(20,12,9,8,P);E(20,15,6,5,PD);
  R(11,-2,4,8,K);R(12,-1,2,6,P);R(25,-2,4,8,K);R(26,-1,2,6,P);
  R(15,0,10,3,'#1a1226');R(15,0,10,2,'#ffd34d');R(16,-2,2,2,'#ffd34d');R(19,-3,2,3,'#ffd34d');R(22,-2,2,2,'#ffd34d');R(19,0,2,1,'#e8413b');
  const ec=(b.state==='swoopUp'&&frame%4<2)?'#ffffff':'#ff3b3b';R(14,8,4,3,ec);R(22,8,4,3,ec);R(17,16,2,3,'#ffffff');R(21,16,2,3,'#ffffff');
 },
 wyvern(b,camR){const open=b.state==='fireUp'&&b.t>18?1:0,f=Math.floor(frame/(b.state==='dive'?3:6))%2,sp=WYVERN[open][f];
  const x=Math.round(b.x+b.w/2-camR)-36,y=Math.round(b.y+b.h/2)-24;
  if(b.flash>0&&frame%4<2)ctx.globalAlpha=.55;ctx.drawImage(b.face>0?sp.r:sp.l,x,y);ctx.globalAlpha=b.alpha??1;
  if(b.state==='diveUp'&&b.t>14&&frame%6<3){ctx.fillStyle='rgba(214,66,58,.8)';for(let xx=b.minX;xx<b.maxX+b.w;xx+=8)ctx.fillRect(Math.round(xx-camR),b.gy-16,4,1);}
  if(b.state==='landed'&&b.t<70&&frame%20<10){ctx.fillStyle='#ffd34d';ctx.fillRect(Math.round(b.x+b.w/2-camR)-1,Math.round(b.y)-6,2,2);}
 },
 scorpion(b,camR){const {R,E}=bdraw(b,camR);const F=bfl(b),C=F?'#ffffff':'#c9784a',CD='#8a4a2a',CL='#e8a070',K='#1a0e08';
  ctx.save();ctx.beginPath();ctx.rect(Math.round(b.x-camR)-40,0,b.w+80,b.gy);ctx.clip();ctx.translate(0,Math.round((b.sink||0)*28));
  for(let i=0;i<3;i++){const lx=14+i*9,w=b.state==='walk'||b.state==='rush'?Math.round(Math.sin(frame*.4+i)*1.5):0;R(lx-3,18,2,6,K);R(lx-2,22,2,2,CD);R(lx+3+w,18,2,6,K);R(lx+4+w,22,2,2,CD);}
  [[17,16,8,6],[27,15,9,7],[37,16,8,6]].forEach(([x,y,rx,ry])=>{E(x,y,rx+1,ry+1,K);E(x,y,rx,ry,C);E(x,y-2,rx-2,2,CL);});
  const cl=(b.state==='rushUp'||b.state==='rush')?4:0;
  R(43,10-cl,10,4,K);R(44,11-cl,8,2,C);E(56,10-cl,6,4,K);E(56,10-cl,5,3,F?'#fff':CD);R(58,7-cl,5,1,K);R(58,13-cl,5,1,K);
  E(46,16,5,4,K);E(46,16,4,3,C);R(47,13,1,1,'#ffd34d');R(49,13,1,1,'#ffd34d');
  const glow=b.state==='stingUp';const pts=[[9,15],[4,9],[4,2],[9,-4],[17,-7],[24,-4]];
  pts.forEach(([x,y],i)=>{const r=4-i*.35;E(x,y,r+1,r+1,K);E(x,y,r,r,i%2?C:F?'#fff':CD);});
  R(25,-6,5,4,K);R(26,-5,3,2,glow&&frame%4<2?'#ffe14d':'#e8d8a0');R(29,-4,2,1,glow?'#ffe14d':'#e8d8a0');
  ctx.restore();
 },
 griffon(b,camR){const {R,E,X,Y}=bdraw(b,camR);const F=bfl(b),T=F?'#ffffff':'#c9a46a',TD='#8a6a3a',Wh=F?'#ffffff':'#f4f0e8',Br='#7a5230',K='#1a1208';
  const fu=Math.floor(frame/(b.state==='dive'?3:6))%2,fx=x=>b.face>0?X+x:X+b.w-x;
  const back=fu?[[22,10],[12,-10],[6,-8],[10,-2],[14,10]]:[[22,14],[12,28],[6,26],[10,20],[14,14]];
  fillPoly(back.map(([x,y])=>[fx(x+4),Y+y-2]),K);
  E(20,18,14,8,K);E(20,18,13,7,T);E(20,22,10,3,TD);
  R(10,22,4,8,K);R(11,23,2,6,TD);R(26,22,4,8,K);R(27,23,2,6,Wh);R(25,29,6,2,'#ffd34d');
  R(1,14,9,2,K);R(-1,12,4,5,K);R(0,13,2,3,TD);
  E(34,10,7,6,K);E(34,10,6,5,Wh);R(38,9,7,4,K);R(38,10,6,2,'#ffd34d');R(44,11,1,3,'#c98a1a');R(34,7,2,2,K);R(34,7,1,1,'#ffffff');R(29,3,4,3,Wh);R(31,2,2,2,Wh);
  const pts=fu?[[18,12],[8,-12],[1,-10],[6,-4],[-1,-1],[10,7]]:[[18,14],[6,31],[-1,29],[6,23],[-1,19],[10,14]];
  fillPoly(pts.map(([x,y])=>[fx(x),Y+y]),K);fillPoly(pts.map(([x,y])=>[fx(x+1),Y+y+(y<12?1:-1)]),F?'#ffffff':Br);
  [[8,-6],[4,-2],[6,26],[3,22]].forEach(([x,y],i)=>{if((fu&&y<0)||(!fu&&y>0)){ctx.fillStyle='#e8d8b0';ctx.fillRect(fx(x),Y+y,1,1);}});
 },
 worm(b,camR){if(b.hidden)return;const F=bfl(b);
  for(let k=7;k>=1;k--){const h=b.hist[b.hist.length-1-k*5];if(!h)continue;const r=Math.round(9-k*.6),x=Math.round(h[0]-camR),y=Math.round(h[1]);
    circ(x,y,r+1,'#1a0a08');circ(x,y,r,F?'#ffffff':'#4a2a26');circ(x-1,y-1,Math.max(1,r-3),'#6a3a30');if(((k+(frame>>3))&1)===0){ctx.fillStyle='#ff8a2a';ctx.fillRect(x-2,y,4,1);ctx.fillRect(x,y-2,1,4);}}
  const x=Math.round(b.x+11-camR),y=Math.round(b.y+11),f=b.face;
  circ(x,y,12,'#1a0a08');circ(x,y,11,F?'#ffffff':'#5a3028');circ(x-2*f,y-3,6,'#7a4434');
  const op=b.state==='spit'&&b.t%24<10?4:1;ctx.fillStyle='#1a0a08';ctx.fillRect(f>0?x+5:x-13,y-1,8,op+2);ctx.fillStyle='#ff6a1a';ctx.fillRect(f>0?x+6:x-12,y,6,op);
  ctx.fillStyle='#fff6e0';ctx.fillRect(f>0?x+7:x-11,y-1,1,1);ctx.fillRect(f>0?x+10:x-8,y-1,1,1);
  ctx.fillStyle='#ffd34d';ctx.fillRect(x+f*3-1,y-6,3,2);ctx.fillRect(x-f*3-1,y-6,2,2);
  ctx.fillStyle='#ff8a2a';ctx.fillRect(x-6,y+4,5,1);ctx.fillRect(x-3,y+6,1,3);ctx.fillRect(x+3,y+2,3,1);
 },
 flower(b,camR){const {R,E}=bdraw(b,camR);const F=bfl(b),G=F?'#ffffff':'#3f9a4a',GD='#2a6a35',P=F?'#ffffff':'#e85a8a',PD='#b03a5b',K='#1a0a10';
  const bite=b.bite||0,sway=Math.round(Math.sin(frame*.05)*2);
  for(let y=22;y<46;y++){const xx=18+Math.round(Math.sin(y*.2+frame*.05)*2);R(xx-3,y,7,1,K);R(xx-2,y,5,1,G);}
  E(8,38,8,3,K);E(8,38,7,2,GD);E(30,34,8,3,K);E(30,34,7,2,G);
  for(let i=0;i<5;i++){R(1+i*8,44,7,2,GD);R(3+i*8,43,1,1,'#d8e2b0');R(6+i*8,43,1,1,'#d8e2b0');}
  const hx=18+sway+bite*.7,hy=14;
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2+frame*.01;E(hx+Math.cos(a)*11,hy+Math.sin(a)*10,6,5,K);}
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2+frame*.01;E(hx+Math.cos(a)*11,hy+Math.sin(a)*10,5,4,i%2?P:F?'#fff':PD);}
  E(hx,hy,9,8,K);E(hx,hy,8,7,'#ffd34d');
  const mo=(b.state==='biteUp'||b.state==='bite'||b.state==='seedUp'||b.state==='sporeUp')?5:2;
  E(hx,hy+1,6,mo,K);for(let i=-4;i<=4;i+=2){R(Math.round(hx+i),Math.round(hy+1-mo),1,2,'#ffffff');R(Math.round(hx+i+1),Math.round(hy+mo-1),1,2,'#ffffff');}
  R(Math.round(hx-5),hy-6,2,2,K);R(Math.round(hx+3),hy-6,2,2,K);
 },
 lich(b,camR){const {R,E,X,Y}=bdraw(b,camR);const F=bfl(b),Rb=F?'#ffffff':'#2a1a3e',RbL='#4a2e6a',K='#0a0612';
  const bob=Math.round(Math.sin(frame*.08));
  fillPoly([[X+3,Y+8+bob],[X+19,Y+8+bob],[X+22,Y+31],[X+18,Y+27],[X+14,Y+33],[X+11,Y+27],[X+8,Y+33],[X+4,Y+27],[X,Y+31]],K);
  fillPoly([[X+4,Y+9+bob],[X+18,Y+9+bob],[X+21,Y+30],[X+18,Y+26],[X+14,Y+32],[X+11,Y+26],[X+8,Y+32],[X+4,Y+26],[X+1,Y+30]],Rb);
  R(9,10+bob,4,16,RbL);
  E(11,6+bob,7,7,K);E(11,6+bob,6,6,F?'#fff':RbL);E(11,7+bob,4,4,'#e8e0d0');R(8,6+bob,2,2,K);R(12,6+bob,2,2,K);
  const ec=(b.state==='orbUp'||b.state==='pulseUp')?'#ff5bff':'#c88aff';R(8,6+bob,1,1,ec);R(12,6+bob,1,1,ec);R(9,10+bob,4,1,K);
  R(22,4+bob,2,27,'#5a3a22');E(23,2+bob,4,4,K);E(23,2+bob,3,3,b.state==='orbUp'?'#ff5bff':'#9a5aff');R(22,1+bob,1,1,'#ffffff');R(18,14+bob,5,3,'#e8e0d0');
 },
 golem:drawGolemBoss
};
function drawBoss(b,camR){
  if(b.state==='dead')return;
  if(b.hidden&&b.kind!=='scorpion')return;
  if(b.hidden&&b.kind==='scorpion'&&b.sink>=1)return;
  ctx.globalAlpha=b.alpha??1;BOSSDRAW[b.kind](b,camR);ctx.globalAlpha=1;
  if(b.kind!=='golem'){
    const X=Math.round(b.x-camR),Y=Math.round(b.y);
    if(b.frozen>0){ctx.fillStyle='rgba(191,238,255,.38)';ctx.fillRect(X-3,Y-3,b.w+6,b.h+6);ctx.fillStyle='#ffffff';ctx.fillRect(X-2,Y-2,3,1);}
    if(b.shock>0&&frame%6<3){ctx.fillStyle='rgba(255,225,77,.3)';ctx.fillRect(X,Y,b.w,b.h);}
    if(b.orb>0){const k=b.orb/96,r=Math.round(Math.max(b.w,b.h)/2+6+k*8),cx=X+b.w/2,cy=Y+b.h/2;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.25+(1-k)*.45;ctx.fillStyle='#fff6c8';ctx.fillRect(cx-r,cy-r,r*2,r*2);ctx.globalAlpha=1;
      for(let i=0;i<16;i++){const a=frame*(.08+(1-k)*.25)+i*Math.PI/8;ctx.fillStyle=i%2?'#ffffff':'#ffd34d';ctx.fillRect(Math.round(cx+Math.cos(a)*r),Math.round(cy+Math.sin(a)*r),2,2);}ctx.globalCompositeOperation='source-over';}
  }
}
function drawBossHaz(camR){
  for(const h of bossHaz){
    const x=Math.round(h.x-camR),y=Math.round(h.y);
    if(h.kind==='wave'){for(let i=0;i<3;i++){const hh=10-i*3,xx=x+(h.dir>0?i*3:6-i*3);ctx.fillStyle='#1a1626';ctx.fillRect(xx,y+10-hh,4,hh);ctx.fillStyle=i===0?'#9a94a8':'#7a7488';ctx.fillRect(xx+1,y+11-hh,2,hh-1);}}
    else if(h.kind==='rock'||h.kind==='pebble'){const r=h.w/2;for(let yy=-r;yy<r;yy++){const w=Math.round(Math.sqrt(r*r-yy*yy));ctx.fillStyle='#1a1626';ctx.fillRect(x+r-w-1,y+r+yy,w*2+2,1);ctx.fillStyle=yy<-r/3?'#9a94a8':'#6e6a7a';ctx.fillRect(x+r-w,y+r+yy,w*2,1);}}
    else if(h.kind==='fall'){
      const c=Math.floor((h.x+6)/TS),gr=surfaceBelow(c,Math.max(0,Math.floor(h.y/TS)));
      if(gr>0&&(h.warn>0?frame%8<5:true)){ctx.fillStyle='rgba(214,66,58,.7)';ctx.fillRect(x-1,gr*TS-2,14,2);}
      if(h.warn<20){if(h.look==='fire'){circ(x+6,y+6,7,'#8a2a10');circ(x+6,y+6,6,'#ff6a1a');circ(x+5,y+5,3,'#ffd34d');ctx.fillStyle='#ff8a2a';ctx.fillRect(x+4,y-6,4,6);ctx.fillStyle='#ffd34d';ctx.fillRect(x+5,y-9,2,4);}
        else if(h.look==='bone'){ctx.fillStyle='#3b3550';ctx.fillRect(x+4,y-1,4,14);ctx.fillStyle='#f4f0e8';ctx.fillRect(x+5,y,2,12);ctx.fillRect(x+3,y,6,2);ctx.fillRect(x+3,y+10,6,2);}
        else if(h.look==='branch'){ctx.fillStyle='#0e0804';ctx.fillRect(x-2,y+3,16,6);ctx.fillStyle='#5a4228';ctx.fillRect(x-1,y+4,14,4);ctx.fillStyle='#4a3a4a';ctx.fillRect(x+8,y,5,4);ctx.fillRect(x,y+8,4,3);}
        else if(h.look==='ice'){fillPoly([[x,y],[x+12,y],[x+6,y+14]],'#5aa8c8');fillPoly([[x+2,y+1],[x+10,y+1],[x+6,y+11]],'#e6fbff');}
        else{ctx.fillStyle='#1a1626';ctx.fillRect(x,y,12,12);ctx.fillStyle='#7a7488';ctx.fillRect(x+1,y+1,10,10);ctx.fillStyle='#9a94a8';ctx.fillRect(x+1,y+1,10,3);}}}
    else if(h.kind==='spike'){
      const pal={ice:['#5aa8c8','#e6fbff'],thorn:['#1f4a2a','#6fdc5a'],sand:['#6e4a2a','#c9925a'],shadow:['#2a1240','#9a5aff'],fire:['#8a2a10','#ff8a2a'],poison:['#3a1a4a','#a85ad8'],tentacle:['#3a0a1a','#c83a5a']}[h.look]||['#333','#999'];
      if(h.warn>0){if(frame%6<4){ctx.fillStyle=pal[1];ctx.fillRect(x,h.gy-2,12,2);}}
      else if(h.up>0){const top=h.gy-h.up;for(const [ox,hw,hh] of [[0,4,.7],[4,4,1],[8,4,.8]]){const t2=h.gy-h.up*hh;fillPoly([[x+ox,h.gy],[x+ox+hw,h.gy],[x+ox+hw/2,t2]],pal[0]);fillPoly([[x+ox+1,h.gy],[x+ox+hw-1,h.gy],[x+ox+hw/2,t2+2]],pal[1]);}
        if(h.look==='thorn'){ctx.fillStyle='#d8e2b0';ctx.fillRect(x+2,top+10,1,1);ctx.fillRect(x+9,top+14,1,1);}}}
    else if(h.kind==='proj'){const cx=Math.round(h.x+h.w/2-camR),cy=Math.round(h.y+h.h/2);
      if(h.look==='snow'){circ(cx,cy,4,'#5a7a9a');circ(cx,cy,3,'#ffffff');ctx.fillStyle='#cfe8f5';ctx.fillRect(cx,cy+1,2,1);}
      else if(h.look==='sonic'){const r=3+(frame>>2)%3;ctx.fillStyle='#c88aff';for(let i=0;i<10;i++){const a=i/10*Math.PI*2;ctx.fillRect(Math.round(cx+Math.cos(a)*r),Math.round(cy+Math.sin(a)*r),1,1);}ctx.fillStyle='#ffffff';ctx.fillRect(cx,cy,1,1);}
      else if(h.look==='fire'||h.look==='glob'){circ(cx,cy,4,h.look==='fire'?'#d6423a':'#8a2a10');circ(cx,cy,3,'#ff8a2a');circ(cx,cy,1,frame%4<2?'#fff0a0':'#ffd34d');}
      else if(h.look==='sting'||h.look==='feather'){const a=Math.atan2(h.vy,h.vx),dx=Math.cos(a),dy=Math.sin(a);for(let i=0;i<7;i++){ctx.fillStyle=h.look==='sting'?(i<2?'#ffe14d':'#8a4a2a'):(i<3?'#ffffff':'#c9a46a');ctx.fillRect(Math.round(cx-dx*i),Math.round(cy-dy*i),i<4&&h.look==='feather'?2:1,1);}}
      else if(h.look==='pick'){const a=h.t*.4;ctx.fillStyle='#7a5230';for(let i=-3;i<=3;i++)ctx.fillRect(Math.round(cx+Math.cos(a)*i),Math.round(cy+Math.sin(a)*i),1,1);ctx.fillStyle='#c9ced8';for(let i=-3;i<=3;i++)ctx.fillRect(Math.round(cx+Math.cos(a)*3+Math.cos(a+1.57)*i),Math.round(cy+Math.sin(a)*3+Math.sin(a+1.57)*i),1,1);}
      else if(h.look==='seed'){circ(cx,cy,3,'#3a2616');circ(cx,cy,2,'#7a5230');ctx.fillStyle='#6fdc5a';ctx.fillRect(cx,cy-3,1,2);}
      else if(h.look==='spore'){const r=4+((frame>>3)&1);circ(cx,cy,r,'#2a6a35');circ(cx,cy,r-1,'#9be07a');ctx.fillStyle='#e8ffb0';ctx.fillRect(cx-1,cy-1,2,2);}
      else if(h.look==='poison'||h.look==='blood'){const c=h.look==='poison'?['#2a0a3a','#a85ad8','#e8ff7a']:['#2a0206','#b81a2a','#ffb0b8'];circ(cx,cy,4,c[0]);circ(cx,cy,3,c[1]);ctx.fillStyle=c[2];ctx.fillRect(cx-1,cy-2,2,1);}
      else if(h.look==='water'){circ(cx,cy,3,'#1a5aa0');circ(cx,cy,2,'#8fd6ff');ctx.fillStyle='#ffffff';ctx.fillRect(cx-1,cy-1,1,1);}
      else if(h.look==='bone'){const a=h.t*.35,dx=Math.cos(a),dy=Math.sin(a);for(let i=-3;i<=3;i++){ctx.fillStyle=Math.abs(i)===3?'#f4f0e8':'#d8d0c0';ctx.fillRect(Math.round(cx+dx*i),Math.round(cy+dy*i),Math.abs(i)===3?2:1,Math.abs(i)===3?2:1);}}
      else if(h.look==='curse'){circ(cx,cy,5,'#0a1a06');circ(cx,cy,4,'#3a6a2a');circ(cx,cy,2,frame%6<3?'#d8ff9a':'#7ad85a');}
      else if(h.look==='ink'){circ(cx,cy,5,'#06020a');circ(cx,cy,4,'#3a0a2a');circ(cx,cy,2,frame%6<3?'#ff5a8a':'#c83a5a');}
      else if(h.look==='shadow'){circ(cx,cy,5,'#120a1e');circ(cx,cy,4,'#4a2a7a');circ(cx,cy,2,frame%6<3?'#ff5bff':'#9a5aff');}
      else{circ(cx,cy,3,'#ffffff');}}
  }
}
function drawChest(it,camR){
  const x=Math.round(it.x-camR),y=Math.round(it.y),o=it.opened;
  if(!o){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.25+.15*Math.sin(frame*.1);ctx.fillStyle='#ffd34d';ctx.fillRect(x-4,y-4,22,20);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
  ctx.fillStyle='#1a1226';ctx.fillRect(x-1,y+3,16,10);ctx.fillStyle='#8a5a2a';ctx.fillRect(x,y+4,14,8);ctx.fillStyle='#6a4220';ctx.fillRect(x,y+8,14,1);
  ctx.fillStyle='#ffd34d';ctx.fillRect(x,y+4,1,8);ctx.fillRect(x+13,y+4,1,8);
  if(o){ctx.fillStyle='#1a1226';ctx.fillRect(x-1,y-6,16,7);ctx.fillStyle='#a06a35';ctx.fillRect(x,y-5,14,5);ctx.fillStyle='#ffd34d';ctx.fillRect(x,y-5,14,1);ctx.fillStyle='#2a1a10';ctx.fillRect(x+1,y+3,12,2);}
  else{ctx.fillStyle='#1a1226';ctx.fillRect(x-1,y-1,16,5);ctx.fillStyle='#a06a35';ctx.fillRect(x,y,14,3);ctx.fillStyle='#ffd34d';ctx.fillRect(x,y,14,1);ctx.fillRect(x+6,y+2,2,4);ctx.fillStyle='#1a1226';ctx.fillRect(x+6,y+4,2,1);
    if(frame%40<4){ctx.fillStyle='#ffffff';ctx.fillRect(x+12,y-2,1,1);}}
}
