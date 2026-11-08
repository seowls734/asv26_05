// characters.js — 엘프 플레이어, 검 이펙트, 활, 기본 슬라임·박쥐 스프라이트
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ================= characters ================= */
const PPAL={k:'#1a1226',h:'#f2d57a',H:'#c9a24a',s:'#f3cfa0',g:'#4fae5a',G:'#2f7a3d',B:'#7a4f2b',d:'#5a4630',l:'#3a2616'};
const PTOP=["....kkkkk...","...khhhhhk..","..khhhhhhhk.","..khHsssssk.","ksshsssksk..",".kkhsssssk..","...kksssk...","..kGgggGk...",".ksgggggggk.",".ksgggggsk..","..kBBBBBk...","..kGgggGk..."];
const LEGS={
 idle:[".kdk..kdk...",".kdk..kdk...",".klk..klk...",".kkk..kkk..."],
 run1:[".kdk...kdk..","kdk.....kdk.","klk.....klk.","kkk.....kkk."],
 run2:["..kdk.kdk...","..kdk.kdk...","..klkklk....","..kkkkkk...."],
 jump:[".kdkkkkdk...",".kdk..kdk...","klk....klk..","kk......kk.."],
 fall:[".kdk..kdk...","kdk....kdk..","kk......kk..","............"]};
const PSPR={};for(const k in LEGS)PSPR[k]=variants(sprite(PTOP.concat(LEGS[k]),PPAL));
const SLASH=variants(sprite(["..........cc........","............ccw.....","..............cww...","...............cww..","................cww.","................cww.",".................ww.","................cww.","................cww.","...............cww..","..............cww...","............ccw.....","..........cc........"],{w:'#ffffff',c:'#8fe3ff'}));
const GIANT=(()=>{const W2=52,H2=80;const [c,g]=mk(W2,H2);
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){const dx=x-2,dy=y-40,r=Math.hypot(dx,dy),a=Math.abs(Math.atan2(dy,dx));if(a>1.3)continue;
    const outer=46-a*4,inner=outer-9+a*6;if(r<outer&&r>inner){const t=(r-inner)/(outer-inner);g.fillStyle=t>.78?'#ffffff':t>.5?'#fff2b0':t>.22?'#ffd34d':'#ff9f2a';g.fillRect(x,y,1,1);}}
  return {r:c,l:flipped(c)};})();
const BOW_UP=sprite(["wkk..","w..k.","w...k","w...l","w...l","w...l","w...l","w...l","w...l","w...k","w..k.","wkk.."],{w:'#fff6c8',k:'#9a6a10',l:'#ffd34d'});
const BOW=sprite(["wkk..","w..k.","w...k","w...l","w...l","w...l","w...l","w...l","w...l","w...k","w..k.","wkk.."],{w:'#e8e2d0',k:'#5a3a1e',l:'#a8713d'});
const BIGBOW_ROWS=["wkkx...","w..kkx.","w...lkx","w....lk","w....lk","w....lx","w....lk","w....lk","w....lx","w....lk","w....lk","w...lkx","w..kkx.","wkkx..."];
const BIGBOW={
 normal:sprite(BIGBOW_ROWS,{w:'#e8e2d0',k:'#4a4656',l:'#8e8a9e',x:'#4fae5a'}),
 ice:sprite(["wkkxx..","w..kkxx","w...lkx","w....lk","w....lk","w....lx","w....lk","w....lk","w....lx","w....lk","w....lk","w...lkx","w..kkxx","wkkxx.."],{w:'#ffffff',k:'#5aa8c8',l:'#bfeeff',x:'#ffffff'}),
 fire:sprite(BIGBOW_ROWS,{w:'#ffd34d',k:'#8f1f24',l:'#ff7a2a',x:'#ffd34d'}),
 elec:sprite(BIGBOW_ROWS,{w:'#ffe14d',k:'#2a2d3a',l:'#5a5f78',x:'#ffe14d'}),
 grass:sprite(BIGBOW_ROWS,{w:'#e8e2d0',k:'#3a2616',l:'#7a5230',x:'#6fdc5a'}),
 light:sprite(BIGBOW_ROWS,{w:'#ffffff',k:'#ffd34d',l:'#fff6c8',x:'#ffffff'}),
 earth:sprite(["wkkxx..","w..kkxx","w...lkx","w....lk","w....lk","w....lx","w....lk","w....lk","w....lx","w....lk","w....lk","w...lkx","w..kkxx","wkkxx.."],{w:'#c9925a',k:'#3a3640',l:'#7a7488',x:'#5a5468'}),
 wind:sprite(BIGBOW_ROWS,{w:'#e8ffc8',k:'#5a9a2a',l:'#b6f05a',x:'#e8ffc8'})};

const SLPAL={k:'#14241a',g:'#62d26f',G:'#3c9a4b',w:'#ffffff'};
const SLIME=[variants(sprite(["....kkkk....","..kkggggkk..",".kggggggggk.",".kgwkgggwkk.","kggkkgggkkgk","kgggggggggGk","kGgggggggGGk",".kkkkkkkkkk."],SLPAL)),
             variants(sprite(["............","...kkkkkk...",".kkggggggkk.","kggwkgggwkgk","kgggkgggkggk","kgggggggggGk","kGGgggggGGGk",".kkkkkkkkkk."],SLPAL))];
const BTPAL={k:'#130d1f',p:'#7a4fb8',P:'#4c2d7c',e:'#ff5b5b'};
const BAT=[variants(sprite(["k....kk....k","kpk.kppk.kpk","kppkpeepkppk",".kppppppppk.","..kPppppPk..","...kPPPPk...","....kkkk...."],BTPAL)),
           variants(sprite(["....kkkk....","...kpeepk...",".kkppppppkk.","kppPppppPppk","kpk.kPPk.kpk","k....kk....k","............"],BTPAL))];
