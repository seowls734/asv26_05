// background.js — 스테이지별 배경 (숲·호수·동굴·유적·협곡·하늘·용암·정원·신전·심장)
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

const BGS={
 canyon:{sky:['#3a1e2e','#5e2a34','#8a3a36','#b8523a','#d8743e','#eea05a','#f6c27a','#f8d89a'],sun:[232,62,15,'#fff0c0','#ffd88a'],far:{col:'#8a3e2e',par:.15,base:154,lo:18,hi:62,mode:'mesa'},near:{col:'#5a2a24',par:.4,base:180,lo:10,hi:20}},
 sky:{sky:['#3a6aa8','#4a7ab8','#5a8ac8','#6a9ad4','#80aedf','#98c2e8','#b0d4ef','#c8e2f4'],clouds:true,far:{col:'#8aa8c8',par:.12,base:168,lo:20,hi:60,mode:'peak'},near:{col:'#5a7a8a',par:.35,base:186,lo:8,hi:18}},
 lava:{sky:['#1a0a0c','#220d0f','#2a1012','#341414','#401818','#4e1c18'],cave:'#2a1414',embers:true,far:{col:'#3a1a18',par:.22,base:176,lo:14,hi:30},glow:'#ff6a1a'},
 garden:{sky:['#5a98d0','#6aa8d8','#80b8e0','#98c8e8','#b0d6ee','#c8e4f2','#dcf0f6'],sun:[60,40,12,'#fffbe0','#fff0b0'],clouds:true,far:{col:'#8ab890',par:.15,base:164,lo:16,hi:36},near:{col:'#5a9a6a',par:.4,base:182,lo:8,hi:18},flowers:true},
 temple:{sky:['#0c0a12','#100d18','#14101e','#181424','#1c172a'],cave:'#221c30',cryst:['#ffd37a','#6a4a2a'],pillars:'#1a1626'},
 core:{sky:['#08100a','#0a140e','#0e1a12','#102016','#12261a'],cave:'#18281e',cryst:['#9affb0','#2a6a3a'],pillars:'#142018'}
};
function drawRidge(r,camR){
  if(!r)return;ctx.fillStyle=r.col;
  for(let sx=0;sx<VW;sx++){const wx=sx+camR*r.par;let h;
    if(r.mode==='mesa'){const m=((wx%90)+90)%90,idx=Math.floor(wx/90),hi=r.hi-((idx*37)%22);h=m<8?r.lo+(hi-r.lo)*m/8:m<44?hi:m<52?hi-(hi-r.lo)*(m-44)/8:r.lo+4*Math.sin(wx*.05);}
    else if(r.mode==='peak'){const m=((wx%70)+70)%70,idx=Math.floor(wx/70),hi=r.hi-((idx*29)%24);h=r.lo+Math.max(0,hi-r.lo-Math.abs(m-35)*1.6);}
    else h=r.lo+(r.hi-r.lo)*(.5+.3*Math.sin(wx*.013)+.2*Math.sin(wx*.041+2));
    ctx.fillRect(sx,Math.round(r.base-h),1,VH);}
}
function drawGenBG(cfg,camR){
  const n=cfg.sky.length,bh=Math.ceil(VH/n);cfg.sky.forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(0,i*bh,VW,bh);});
  if(cfg.sun){const [sx,sy,r,c1,c2]=cfg.sun,x=Math.round(sx-camR*.03);ctx.fillStyle=c2;for(let y=-r-4;y<=r+4;y++){const w=Math.round(Math.sqrt(Math.max(0,(r+4)*(r+4)-y*y)));ctx.fillRect(x-w,sy+y,w*2,1);}
    ctx.fillStyle=c1;for(let y=-r;y<=r;y++){const w=Math.round(Math.sqrt(r*r-y*y));ctx.fillRect(x-w,sy+y,w*2,1);}}
  if(cfg.clouds){for(let i=0;i<6;i++){const span=VW+120,x=((i*113-camR*.08+frame*.06)%span+span)%span-60,y=18+(i*41)%70,w=26+(i*17)%22;
    ctx.fillStyle='rgba(255,255,255,.85)';ctx.fillRect(Math.round(x),y,w,6);ctx.fillRect(Math.round(x)+5,y-4,w-12,5);ctx.fillRect(Math.round(x)+10,y-7,w-24,4);ctx.fillStyle='rgba(200,220,240,.7)';ctx.fillRect(Math.round(x)+2,y+5,w-4,2);}}
  drawRidge(cfg.far,camR);
  if(cfg.cave){ctx.fillStyle=cfg.cave;for(let sx=0;sx<VW;sx++){const wx=sx+camR*.25;const ce=14+12*Math.abs(Math.sin(wx*.03))+7*Math.sin(wx*.11);ctx.fillRect(sx,0,1,Math.round(ce));}}
  if(cfg.pillars){ctx.fillStyle=cfg.pillars;for(let i=0;i<5;i++){const span=VW+80,x=Math.round(((i*90-camR*.3)%span+span)%span-40);ctx.fillRect(x,20,14,VH);ctx.fillRect(x-3,20,20,5);ctx.fillRect(x-3,150,20,6);}}
  if(cfg.cryst)for(const c of CRYST){const sx=Math.round(((c.x-camR*.3)%900+900)%900);if(sx>VW)continue;const a=.5+.5*Math.sin(frame*.04+c.ph);ctx.fillStyle=a>.6?cfg.cryst[0]:cfg.cryst[1];ctx.fillRect(sx,c.y|0,c.s,c.s*2);ctx.fillRect(sx-1,(c.y|0)+c.s,c.s+2,1);}
  drawRidge(cfg.near,camR);
  if(cfg.flowers){for(let i=0;i<40;i++){const x=Math.round(((i*37-camR*.4)%VW+VW)%VW),y=176+(i*7)%10;ctx.fillStyle=['#ff9ac8','#fff6a0','#ffffff'][i%3];ctx.fillRect(x,y,1,1);}}
  if(cfg.glow){for(let i=0;i<6;i++){ctx.fillStyle=`rgba(255,106,26,${.05*(6-i)})`;ctx.fillRect(0,VH-12-i*6,VW,6);}}
  if(cfg.embers){for(let i=0;i<34;i++){const x=Math.round(((i*53-camR*.35+Math.sin(frame*.02+i)*8)%VW+VW)%VW),y=Math.round(VH-((frame*.4+i*37)%VH));ctx.fillStyle=i%3?'#ff8a2a':'#ffd34d';ctx.fillRect(x,y,1,1);}}
}
function drawBG(camR){
  if(BGS[lvl.bg]){drawGenBG(BGS[lvl.bg],camR);return;}
  if(lvl.bg==='forest'){
    const bands=['#0f1a26','#112030','#13263a','#162d42','#18344a','#1b3a50'];
    bands.forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(0,i*20,VW,20);});ctx.fillStyle=bands[5];ctx.fillRect(0,120,VW,VH-120);
    for(const s of STARS){const sx=((s.x-camR*.05)%640+640)%640;if(sx<VW){ctx.fillStyle=(s.b>.75&&(frame+s.x*7|0)%120<60)?'#fff6d8':'#6f86a8';ctx.fillRect(sx|0,s.y|0,1,1);}}
    ctx.drawImage(MOON,Math.round(236-camR*.02),18);
    ctx.fillStyle='#173246';for(let sx=0;sx<VW;sx++){const wx=sx+camR*.15,h=40+16*Math.sin(wx*.012)+9*Math.sin(wx*.037+2);ctx.fillRect(sx,Math.round(150-h),1,VH);}
    ctx.fillStyle='#0f2432';for(let sx=0;sx<VW;sx++){const wx=sx+camR*.4,m=((wx%18)+18)%18,d=Math.abs(m-9);const h=18+8*Math.sin(wx*.013)+Math.max(0,32-d*3.6);ctx.fillRect(sx,Math.round((176-h)/2)*2,1,VH);}
  }else if(lvl.bg==='ice'){
    const bands=['#0a1420','#0c1828','#0f1d30','#112236','#13263c'];bands.forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(0,i*40,VW,40);});
    ctx.fillStyle='#16304a';for(let sx=0;sx<VW;sx++){const wx=sx+camR*.25;const ce=16+14*Math.abs(Math.sin(wx*.03))+8*Math.sin(wx*.11);const fl=26+16*Math.abs(Math.sin(wx*.02+1));ctx.fillRect(sx,0,1,Math.round(ce));ctx.fillRect(sx,Math.round(VH-fl),1,VH);}
    for(const c of CRYST){const sx=Math.round(((c.x-camR*.3)%900+900)%900);if(sx>VW)continue;const a=.5+.5*Math.sin(frame*.04+c.ph);ctx.fillStyle=a>.6?'#e6fbff':'#5aa8c8';ctx.fillRect(sx,c.y|0,c.s,c.s*2);ctx.fillRect(sx-1,(c.y|0)+c.s,c.s+2,1);}
    ctx.fillStyle='#1c3a52';for(let sx=0;sx<VW;sx++){const wx=sx+camR*.55;const h=Math.max(0,30*Math.sin(wx*.045)*Math.sin(wx*.013+.5));if(h>1)ctx.fillRect(sx,0,1,Math.round(h));}
  }else if(lvl.bg==='ruin'){
    const bands=['#2a1a3a','#3e2046','#5e2a4c','#86364e','#b04a4a','#d8684a','#ec8c50','#f4ac62'];
    bands.forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(0,i*18,VW,18);});ctx.fillStyle=bands[7];ctx.fillRect(0,144,VW,48);
    const sx0=Math.round(210-camR*.03);ctx.fillStyle='#ffd37a';for(let y=-22;y<=22;y++){const w=Math.round(Math.sqrt(484-y*y));ctx.fillRect(sx0-w,118+y,w*2,1);}
    ctx.fillStyle='#ffe9a8';for(let y=-14;y<=14;y++){const w=Math.round(Math.sqrt(196-y*y));ctx.fillRect(sx0-w,118+y,w*2,1);}
    ctx.fillStyle='#4a2440';for(let sx=0;sx<VW;sx++){const wx=sx+camR*.2,m=((wx%46)+46)%46;let h=20+6*Math.sin(wx*.02);if(m>8&&m<20)h+=40+((Math.floor(wx/46)*37)%30)-(m>15&&m<20?((Math.floor(wx/46)*13)%18):0);ctx.fillRect(sx,Math.round(170-h),1,VH);}
    ctx.fillStyle='#2e1630';for(let sx=0;sx<VW;sx++){const wx=sx+camR*.45;const h=14+8*Math.sin(wx*.017+1)+5*Math.sin(wx*.05);ctx.fillRect(sx,Math.round(178-h),1,VH);}
  }else{
    const bands=['#0b0913','#0e0b18','#110e1e','#141124','#16132a'];bands.forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(0,i*40,VW,40);});
    ctx.fillStyle='#1a1630';for(let sx=0;sx<VW;sx++){const wx=sx+camR*.25;const ce=16+14*Math.abs(Math.sin(wx*.03))+8*Math.sin(wx*.11);const fl=26+16*Math.abs(Math.sin(wx*.02+1));ctx.fillRect(sx,0,1,Math.round(ce));ctx.fillRect(sx,Math.round(VH-fl),1,VH);}
    for(const c of CRYST){const sx=Math.round(((c.x-camR*.3)%900+900)%900);if(sx>VW)continue;const a=.5+.5*Math.sin(frame*.04+c.ph);ctx.fillStyle=a>.6?'#b48cff':'#4a3a7a';ctx.fillRect(sx,c.y|0,c.s,c.s*2);}
  }
}
