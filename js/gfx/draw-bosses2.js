// draw-bosses2.js — 시즌 2 보스 12종 그리기
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

const BONE_PAL={base:'#d8d0c0',dark:'#8a8070',hi:'#f4f0e8',belly:'#5a5468',bellyD:'#3b3550',mem:'#4a2a5a',memFar:'#2a1a3a',bone:'#f4f0e8',horn:'#ffffff',spike:'#3b3550'};
const BONEDRAGON=[[makeDragon(0,false,BONE_PAL),makeDragon(1,false,BONE_PAL)],[makeDragon(0,true,BONE_PAL),makeDragon(1,true,BONE_PAL)]];
// 마왕 스프라이트(DEMON)는 ending.js에 있다. 그리는 순간에만 쓰므로 로드 순서와 상관없음
let DEMON_FLASH=null;

Object.assign(BOSSDRAW,{
 boar(b,camR){const {R,E}=bdraw(b,camR);const F=bfl(b),K='#1a0e08',B=F?'#ffffff':'#8a5a3a',BD='#5a3a22',M='#3a2416';
  const run=(b.state==='charge'||b.state==='walk')?Math.round(Math.sin(b.t*.5)*2):0,lean=b.state==='chargeUp'?2:0;
  R(8,22,5,8,K);R(9,23-run,3,7+run,BD);R(30,22,5,8,K);R(31,23+run,3,7-run,BD);R(14,22,5,8,K);R(36,22,5,8,K);R(37,23,3,7,BD);
  E(20,15+lean,18,11,K);E(20,15+lean,17,10,B);E(20,20+lean,13,4,BD);
  for(let i=0;i<6;i++)R(8+i*4,3+lean+(i%2),3,5,M);
  E(36,17+lean,9,8,K);E(36,17+lean,8,7,B);R(42,15+lean,6,7,K);R(43,16+lean,4,5,F?'#fff':'#d89a8a');R(44,17+lean,1,1,K);R(46,17+lean,1,1,K);
  R(42,21+lean,2,5,'#fff6e0');R(40,24+lean,2,2,'#fff6e0');R(37,12+lean,2,2,'#ff3b3b');R(31,7+lean,3,5,K);R(32,8+lean,1,3,BD);
  R(33,5+lean,7,3,'#1a1226');R(34,5+lean,5,2,'#ffd34d');R(34,3+lean,1,2,'#ffd34d');R(36,2+lean,1,3,'#ffd34d');R(38,3+lean,1,2,'#ffd34d');
  R(-2,10+lean,4,2,K);R(-3,8+lean,2,3,K);
  if(b.state==='stun'&&frame%10<5){R(30,-4,2,2,'#ffd34d');R(40,-6,2,2,'#ffd34d');}
 },
 toad(b,camR){const {R,E}=bdraw(b,camR);const F=bfl(b),K='#0e1a06',G=F?'#ffffff':'#5aa83a',GD='#3a7a2a',Y='#e8e08a';
  let sq=0;if(b.state==='leapUp')sq=Math.min(1,b.t/10);else if(b.air)sq=-.3;
  const h=10*(1-sq*.25),cy=b.h-h-2;
  E(6,26,7,3,K);E(6,26,6,2,GD);E(34,26,7,3,K);E(34,26,6,2,GD);
  E(20,cy,19,h+1,K);E(20,cy,18,h,G);E(20,cy+h*.45,13,h*.5,Y);
  for(const [x,y] of [[10,cy-4],[26,cy-6],[18,cy-2],[30,cy-1]])R(x,Math.round(y),3,2,GD);
  const ey=Math.round(cy-h);E(12,ey,5,5,K);E(28,ey,5,5,K);E(12,ey,4,4,'#ffd34d');E(28,ey,4,4,'#ffd34d');R(12,ey-2,2,4,K);R(29,ey-2,2,4,K);
  R(4,Math.round(cy+1),34,1,K);
  if(b.tongue>0){R(36,Math.round(cy),Math.round(b.tongue),4,K);R(36,Math.round(cy)+1,Math.round(b.tongue)-1,2,'#e85a8a');R(34+Math.round(b.tongue),Math.round(cy)-1,5,6,K);R(35+Math.round(b.tongue),Math.round(cy),3,4,'#ff8ab0');}
 },
 turtle(b,camR){const {R,E,X,Y}=bdraw(b,camR);const F=bfl(b),K='#06140e',S=F?'#ffffff':'#3a7a5a',SD='#1f4a36',SL='#6ab08a',L='#c9b88a';
  const spin=b.state==='spin'||b.state==='spinUp';
  if(!spin){const w=b.state==='walk'?Math.round(Math.sin(b.t*.2)*2):0;R(6+w,20,7,6,K);R(7+w,21,5,4,L);R(28-w,20,7,6,K);R(29-w,21,5,4,L);
    E(41,16,7,6,K);E(41,16,6,5,L);R(43,13,2,2,K);R(44,13,1,1,'#ffffff');R(42,18,5,1,K);R(-2,16,5,3,K);}
  const sy=spin?4:0;E(20,12+sy,19,12,K);E(20,12+sy,18,11,S);E(20,20+sy,16,3,SD);
  const rot=spin?b.t*.4*Math.sign(b.vx||1):0;
  for(let i=0;i<5;i++){const a=rot+i*Math.PI*2/5,cx=20+Math.cos(a)*9,cy=11+sy+Math.sin(a)*5;E(cx,cy,3,2,SL);}
  E(20,11+sy,4,3,SL);R(4,20+sy,32,2,'#9aa1b3');R(6,20+sy,28,1,'#e8ecf4');
  if(b.state==='waterUp'&&b.t<20&&frame%4<2)E(46,16,3,3,'#8fd6ff');
 },
 witch(b,camR){const {R,E,X,Y}=bdraw(b,camR);const F=bfl(b),Rb=F?'#ffffff':'#3a4a2a',RbL='#5a6a3a',K='#06080a',Sk='#9ad86a';
  const bob=Math.round(Math.sin(frame*.08));
  fillPoly([[X+4,Y+12+bob],[X+16,Y+12+bob],[X+21,Y+30],[X+16,Y+27],[X+12,Y+31],[X+8,Y+27],[X+4,Y+31],[X-1,Y+30]],K);
  fillPoly([[X+5,Y+13+bob],[X+15,Y+13+bob],[X+20,Y+29],[X+16,Y+26],[X+12,Y+30],[X+8,Y+26],[X+4,Y+30],[X,Y+29]],Rb);
  R(8,14+bob,4,12,RbL);
  E(10,10+bob,5,5,K);E(10,10+bob,4,4,F?'#fff':Sk);R(8,9+bob,1,1,'#ff3bff');R(11,9+bob,1,1,'#ff3bff');R(8,12+bob,4,1,K);R(13,10+bob,2,2,Sk);
  fillPoly([[X+2,Y+7+bob],[X+18,Y+7+bob],[X+13,Y+4+bob],[X+11,Y-8+bob],[X+7,Y+4+bob]],K);
  fillPoly([[X+3,Y+6+bob],[X+17,Y+6+bob],[X+12,Y+4+bob],[X+11,Y-6+bob],[X+8,Y+4+bob]],'#2a1a3e');R(7,4+bob,6,1,'#7ad85a');
  R(-4,22+bob,26,2,'#5a3a22');for(let i=0;i<4;i++)R(-6,20+bob+i,3,1,'#c9a86a');
  if(b.state==='curseUp'||b.state==='thornUp'){const g=b.t%8<4?'#7ad85a':'#d8ff9a';E(16,16+bob,3,3,g);}
 },
 treant(b,camR){const {R,E}=bdraw(b,camR);const F=bfl(b),K='#0e0804',Bk=F?'#ffffff':'#5a4228',BkD='#3a2a18',Lf='#4a3a4a',LfD='#2a2030';
  const sway=Math.round(Math.sin(frame*.03)*2),arm=b.state==='branchUp'||b.state==='rootUp'?-6:0;
  for(const [x,w] of [[6,6],[30,6],[18,8]]){R(x-1,50,w+2,6,K);R(x,51,w,5,BkD);}
  R(11,14,22,40,K);R(12,15,20,39,Bk);for(let y=18;y<52;y+=5)R(14+(y%3),y,2,3,BkD);R(26,20,2,10,BkD);
  R(-2,26+arm,15,4,K);R(-1,27+arm,13,2,Bk);R(-4,22+arm,4,6,K);R(31,24+arm,15,4,K);R(32,25+arm,13,2,Bk);R(44,20+arm,4,6,K);
  E(22+sway,10,22,13,K);E(22+sway,10,21,12,LfD);for(let i=0;i<9;i++)E(6+i*4+sway,6+(i*7)%9,4,3,i%2?Lf:'#5a4a5a');
  const eye=b.state==='walk'?'#ff5a3a':'#ffd34d';R(16,26,4,3,K);R(25,26,4,3,K);R(17,27,2,1,eye);R(26,27,2,1,eye);
  R(17,33,11,4,K);for(let i=0;i<5;i++)R(18+i*2,33,1,1,'#c9b890');
 },
 boneknight(b,camR){const {R,E}=bdraw(b,camR);const F=bfl(b),K='#1a1410',Bn=F?'#ffffff':'#e8e0d0',BnD='#a89880',A='#5a5468',AL='#8e8a9e';
  const w=b.state==='walk'?Math.round(Math.sin(b.t*.25)*2):0;
  R(6+w,26,4,10,K);R(7+w,27,2,9,Bn);R(14-w,26,4,10,K);R(15-w,27,2,9,Bn);
  R(4,12,16,15,K);R(5,13,14,13,A);R(5,13,14,3,AL);for(let i=0;i<3;i++)R(7,17+i*3,10,1,Bn);
  R(-3,12,8,14,K);R(-2,13,6,12,'#4a3a2a');R(-1,15,4,8,'#c9a24a');
  E(12,6,7,7,K);E(12,6,6,6,Bn);R(8,7,9,3,K);R(10,8,2,1,'#ff3b3b');R(14,8,2,1,'#ff3b3b');R(9,1,6,2,A);R(11,-3,2,4,'#d6423a');
  if(b.slash){const a0=b.t/14;ctx.globalAlpha=Math.max(0,1-a0);for(let i=0;i<14;i++){const ang=-1.2+i*.18,r=24;R(22+Math.round(Math.cos(ang)*r*.8),18+Math.round(Math.sin(ang)*r),3,2,i%2?'#ffffff':'#c9ced8');}ctx.globalAlpha=b.alpha??1;
    R(20,18,22,2,K);R(20,18,20,1,'#c9ced8');}
  else{R(20,2,3,22,K);R(21,3,1,20,'#c9ced8');R(18,22,7,2,'#c9a24a');}
 },
 cerberus(b,camR){const {R,E}=bdraw(b,camR);const F=bfl(b),K='#0a0204',Bd=F?'#ffffff':'#3a1416',BdL='#5a2024',Fi='#ff6a1a';
  const run=(b.state==='charge'||b.state==='walk')?Math.round(Math.sin(b.t*.4)*2):0;
  for(const [x,o] of [[8,run],[16,-run],[30,run],[38,-run]]){R(x,24,5,10,K);R(x+1,25+o,3,9-o,BdL);}
  E(22,20,20,10,K);E(22,20,19,9,Bd);for(let i=0;i<5;i++)R(12+i*5,11+(i%2),2,4,Fi);
  R(-2,14,6,3,K);R(-6,10,5,5,K);R(-5,11,3,3,Fi);
  const fire=b.state==='fireUp';
  for(const [hx,hy,k] of [[38,8,0],[46,16,1],[36,22,2]]){E(hx,hy,7,6,K);E(hx,hy,6,5,Bd);R(hx+4,hy-1,5,4,K);R(hx+5,hy,3,2,BdL);R(hx,hy-3,2,2,'#ffd34d');R(hx-3,hy-8,3,4,K);
    if(fire&&(b.t-18-k*10)>=-6&&(b.t-18-k*10)<6){R(hx+8,hy,3,3,Fi);R(hx+10,hy+1,2,1,'#ffd34d');}else R(hx+7,hy+2,2,1,Fi);}
 },
 ifrit(b,camR){const {R,E,X,Y}=bdraw(b,camR);const F=bfl(b),K='#2a0604',Bd=F?'#ffffff':'#d6423a',Fl='#ff8a2a',Y2='#ffd34d';
  const fl=frame%6<3?1:0;
  fillPoly([[X+6,Y+22],[X+22,Y+22],[X+18+fl,Y+34],[X+14,Y+40],[X+10-fl,Y+34]],K);fillPoly([[X+8,Y+23],[X+20,Y+23],[X+17,Y+33],[X+14,Y+38],[X+11,Y+33]],Fl);
  E(14,16,10,9,K);E(14,16,9,8,Bd);E(14,18,6,5,Fl);
  R(1,12,6,4,K);R(2,13,4,2,Bd);R(-2,10,4,4,Y2);R(21,12,6,4,K);R(22,13,4,2,Bd);R(26,10,4,4,Y2);
  E(14,6,6,6,K);E(14,6,5,5,Bd);R(11,5,2,2,'#ffffff');R(16,5,2,2,'#ffffff');R(12,8,4,1,K);
  R(8,-1,2,4,K);R(7,-3,2,2,K);R(18,-1,2,4,K);R(19,-3,2,2,K);
  for(let i=0;i<5;i++){const h=3+((frame>>2)+i*3)%4;R(9+i*2,-1-h+3,1,h,i%2?Fl:Y2);}
  if(b.state==='ringUp'&&b.t<20){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=b.t/20*.5;circ(X+14,Y+18,12+Math.round(b.t/4),'#ff8a2a');ctx.globalAlpha=b.alpha??1;ctx.globalCompositeOperation='source-over';}
 },
 bonedragon(b,camR){const open=b.state==='shardUp'&&b.t>14?1:0,f=Math.floor(frame/(b.state==='dive'?3:6))%2,sp=BONEDRAGON[open][f];
  const x=Math.round(b.x+b.w/2-camR)-36,y=Math.round(b.y+b.h/2)-24;
  if(b.flash>0&&frame%4<2)ctx.globalAlpha=.55;ctx.drawImage(b.face>0?sp.r:sp.l,x,y);ctx.globalAlpha=b.alpha??1;
  if(frame%20<10){ctx.fillStyle='#9a5aff';ctx.fillRect(Math.round(b.x+b.w/2-camR)+(b.face>0?14:-16),Math.round(b.y)+4,2,2);}
  if(b.state==='diveUp'&&b.t>12&&frame%6<3){ctx.fillStyle='rgba(214,66,58,.8)';for(let xx=b.minX;xx<b.maxX+b.w;xx+=8)ctx.fillRect(Math.round(xx-camR),b.gy-16,4,1);}
 },
 kraken(b,camR){const {R,E,X,Y}=bdraw(b,camR);const F=bfl(b),K='#14020a',Bd=F?'#ffffff':'#6a1a3a',BdL='#9a2a5a',Su='#e8a0b0';
  for(let i=0;i<6;i++){const bx=4+i*6.5,ph=frame*.08+i;for(let k=0;k<6;k++){const xx=bx+Math.sin(ph+k*.6)*3*(k/6)+(i<3?-k:k),yy=30+k*1.6;E(xx,yy,3.2-k*.3,2,K);E(xx,yy,2.4-k*.3,1.4,i%2?Bd:BdL);}}
  E(20,16,18,16,K);E(20,16,17,15,Bd);E(20,10,12,7,BdL);for(let i=0;i<4;i++)R(8+i*7,22,2,2,Su);
  const ey=b.state==='inkUp'||b.state==='tentUp'?'#ffffff':'#ffd34d';E(13,15,4,4,K);E(27,15,4,4,K);E(13,15,3,3,ey);E(27,15,3,3,ey);R(13,13,1,5,K);R(27,13,1,5,K);
  R(14,24,12,2,K);
 },
 darkknight(b,camR){const {R,E,X,Y}=bdraw(b,camR);const F=bfl(b),K='#06040c',A=F?'#ffffff':'#2a2440',AL='#4a3a6a',C='#5a1a3a';
  const w=b.state==='walk'?Math.round(Math.sin(b.t*.25)*2):0,cape=Math.round(Math.sin(frame*.1)*2);
  fillPoly([[(b.face>0?X+6:X+b.w-6),Y+12],[(b.face>0?X-6+cape:X+b.w+6-cape),Y+36],[(b.face>0?X+12:X+b.w-12),Y+34]],C);
  R(6+w,26,5,12,K);R(7+w,27,3,11,A);R(13-w,26,5,12,K);R(14-w,27,3,11,A);
  R(4,12,16,16,K);R(5,13,14,14,A);R(5,13,14,3,AL);R(11,17,2,6,'#ff2a2a');
  R(2,10,6,6,K);R(3,11,4,4,AL);R(16,10,6,6,K);R(17,11,4,4,AL);
  E(12,6,6,6,K);E(12,6,5,5,A);R(8,6,9,2,K);R(9,6,7,1,'#ff2a2a');R(7,0,2,4,AL);R(15,0,2,4,AL);R(6,-2,2,2,AL);R(16,-2,2,2,AL);
  if(b.slash){const a0=b.t/14;ctx.globalAlpha=Math.max(0,1-a0);for(let i=0;i<16;i++){const ang=-1.3+i*.17,r=28;R(22+Math.round(Math.cos(ang)*r*.9),18+Math.round(Math.sin(ang)*r),3,2,i%2?'#c88aff':'#ffffff');}ctx.globalAlpha=b.alpha??1;
    R(20,18,26,3,K);R(20,19,24,1,'#9a5aff');}
  else{R(20,0,4,26,K);R(21,1,2,24,'#4a3a6a');R(21,1,1,24,'#9a5aff');R(18,24,8,2,'#c9a24a');}
 },
 demonking(b,camR){
  const s=2,X=Math.round(b.x-camR),Y=Math.round(b.y);
  if(!DEMON_FLASH)DEMON_FLASH=tinted(DEMON,'#ffffff');
  // 붉은 기운
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(.18+.08*Math.sin(frame*.08))*(b.alpha??1);circ(X+b.w/2,Y+b.h/2,34,'#7a0a1a');ctx.globalAlpha=b.alpha??1;ctx.globalCompositeOperation='source-over';
  ctx.drawImage(bfl(b)?DEMON_FLASH:DEMON,X,Y,DEMON.width*s,DEMON.height*s);
  if(b.state==='beamCharge'){const k=b.t/56;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=k*.8;circ(X+b.w/2,Y+22,3+Math.round(k*8),'#ff2a2a');ctx.globalAlpha=b.alpha??1;ctx.globalCompositeOperation='source-over';
    if(b.t<56&&frame%4<2){ctx.fillStyle='#ff2a2a';const cx=b.x+b.w/2,cy=b.y+22;for(let i=0;i<70;i++){const xx=cx+Math.cos(b.aim)*i*4,yy=cy+Math.sin(b.aim)*i*4;if(solid(Math.floor(xx/TS),Math.floor(yy/TS)))break;if(i%2===0)ctx.fillRect(Math.round(xx-camR),Math.round(yy),1,1);}}}
  if(b.state==='beam'&&b.beamEnd){const cx=b.x+b.w/2,cy=b.y+22,[ex,ey]=b.beamEnd,n=Math.ceil(Math.hypot(ex-cx,ey-cy)/2);ctx.globalCompositeOperation='lighter';
    for(let i=0;i<=n;i++){const k=i/n,xx=Math.round(cx+(ex-cx)*k-camR),yy=Math.round(cy+(ey-cy)*k),w=3+Math.round(Math.sin(i*.5+frame)*1);ctx.fillStyle='#ff2a2a';ctx.fillRect(xx-w,yy-w,w*2,w*2);ctx.fillStyle='#ffe0e0';ctx.fillRect(xx-1,yy-1,2,2);}
    ctx.globalCompositeOperation='source-over';}
 }
});
