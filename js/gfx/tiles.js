// tiles.js — 지형 타일 텍스처, 문·출구
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ================= tiles ================= */
function genTiles(P){
  const T={top:[],fill:[]};
  for(let v=0;v<3;v++)for(const top of [true,false]){
    const [c,g]=mk(16,16);const r=rng(v*97+(top?7:3)+P.seed);
    g.fillStyle=P.base;g.fillRect(0,0,16,16);
    for(let i=0;i<22;i++){g.fillStyle=r()<.5?P.d1:P.d2;g.fillRect(r()*16|0,r()*16|0,1,1);}
    for(let i=0;i<2;i++){const x=r()*13|0,y=4+(r()*10|0);g.fillStyle=P.stone;g.fillRect(x,y,3,2);g.fillStyle=P.d1;g.fillRect(x,y+2,3,1);}
    if(top){g.fillStyle=P.top1;g.fillRect(0,0,16,4);g.fillStyle=P.top2;g.fillRect(0,0,16,2);
      g.fillStyle=P.hi;for(let x=0;x<16;x++)if(r()<.35)g.fillRect(x,0,1,1);
      g.fillStyle=P.top1;for(let x=0;x<16;x++)if(r()<.3)g.fillRect(x,4,1,1+(r()*2|0));}
    (top?T.top:T.fill).push(c);
  }
  return T;
}
const TX=(()=>{
  const crate=(()=>{const [c,g]=mk(16,16);g.fillStyle='#4a2c14';g.fillRect(0,0,16,16);g.fillStyle='#a06a35';g.fillRect(1,1,14,14);
    g.fillStyle='#7d5028';g.fillRect(1,5,14,1);g.fillRect(1,10,14,1);g.fillStyle='#c58a4a';for(let i=2;i<14;i++){g.fillRect(i,i,1,1);g.fillRect(15-i,i,1,1);}
    g.fillStyle='#e3cf9e';[[2,2],[13,2],[2,13],[13,13]].forEach(([x,y])=>g.fillRect(x,y,1,1));return c;})();
  const plank=(()=>{const [c,g]=mk(16,16);g.fillStyle='#d39a5a';g.fillRect(0,0,16,1);g.fillStyle='#a8713d';g.fillRect(0,1,16,3);g.fillStyle='#6b4320';g.fillRect(0,4,16,1);g.fillRect(0,1,1,3);g.fillRect(8,1,1,3);
    g.fillStyle='#5a3a1e';g.fillRect(3,5,2,3);g.fillRect(11,5,2,3);return c;})();
  const spike=sprite(["","","","","","",".w...w...w...w..",".wk..wk..wk..wk.","wgk.wgk.wgk.wgk.","wggkwggkwggkwggk","wggkwggkwggkwggk","kkkkkkkkkkkkkkkk","dddddddddddddddd","dDddDddddDddDddd","dddddddDdddddddd","dddddddddddddddd"],
    {w:'#e8ecf4',g:'#9aa1b3',k:'#3a3d4a',d:'#2a2030',D:'#3a2e44'});
  const soil=(()=>{const [c,g]=mk(16,16);g.fillStyle='#4a2e1e';g.fillRect(0,0,16,16);
    for(let y=1;y<16;y+=3){g.fillStyle='#6b4630';g.fillRect(0,y,16,1);g.fillStyle='#3a2216';g.fillRect(0,y+1,16,1);}
    g.fillStyle='#2a180e';g.fillRect(0,0,16,1);g.fillStyle='#6fdc5a';[3,4,10].forEach(x=>g.fillRect(x,0,1,1));g.fillStyle='#3f9a4a';g.fillRect(4,1,1,1);g.fillRect(9,1,1,1);return c;})();
  const brambleOf=(c1,c2,c3,thorn,berry,seed)=>{const [c,g]=mk(16,16);const rr=rng(seed);g.fillStyle=c1;g.fillRect(1,0,14,16);
    for(let i=0;i<26;i++){g.fillStyle=rr()<.5?c2:c3;g.fillRect((rr()*14|0)+1,rr()*15|0,2,2);}
    g.fillStyle=thorn;for(let i=0;i<10;i++)g.fillRect(rr()*16|0,rr()*16|0,1,1);
    g.fillStyle=berry;[[4,4],[11,9],[6,13]].forEach(([x,y])=>g.fillRect(x,y,2,2));return c;};
  const bramble=brambleOf('#132b1a','#1f4a2a','#2e6a3a','#d8e2b0','#b03a5b',11);
  const wet=brambleOf('#10242a','#1b3f48','#275a62','#bfe8f0','#8fd6ff',13);
  const charred=(()=>{const [c,g]=mk(16,16);const rr=rng(12);g.fillStyle='#1e130e';g.fillRect(1,0,14,16);
    for(let i=0;i<20;i++){g.fillStyle=rr()<.5?'#2e1d14':'#4a2a1a';g.fillRect((rr()*14|0)+1,rr()*15|0,2,2);}return c;})();
  const ice=(()=>{const [c,g]=mk(16,16);g.fillStyle='#7fc8f0';g.fillRect(0,0,16,16);g.fillStyle='#bfeeff';g.fillRect(1,1,14,13);
    g.fillStyle='#ffffff';g.fillRect(1,1,14,1);for(let i=0;i<5;i++)g.fillRect(3+i,8-i,1,1);g.fillRect(10,11,3,1);g.fillStyle='#9fdcf6';g.fillRect(1,14,14,1);return c;})();
  const rock=(()=>{const [c,g]=mk(16,16);g.fillStyle='#2e2c38';g.fillRect(0,0,16,16);g.fillStyle='#6d6a7a';g.fillRect(1,1,14,14);g.fillStyle='#8e8a9e';g.fillRect(2,2,8,2);
    g.fillStyle='#2e2c38';[[7,3],[7,4],[8,5],[8,6],[7,7],[6,8],[9,8],[10,9],[11,10],[5,9],[4,10],[8,11],[8,12]].forEach(([x,y])=>g.fillRect(x,y,1,1));return c;})();
  const gen=on=>{const [c,g]=mk(16,16);g.fillStyle='#1a1226';g.fillRect(0,0,16,16);g.fillStyle='#3a3f4f';g.fillRect(1,1,14,14);g.fillStyle='#5b6070';g.fillRect(1,1,14,2);
    g.fillStyle=on?'#ffe14d':'#6b6030';[[8,4],[7,5],[6,6],[6,7],[7,7],[8,7],[9,7],[8,8],[7,9],[6,10]].forEach(([x,y])=>g.fillRect(x,y,2,1));
    g.fillStyle=on?'#8fe36a':'#4a2a2a';g.fillRect(12,12,2,2);return c;};
  const leaves=(()=>{const [c,g]=mk(16,16);const rr=rng(21);g.fillStyle='#2a6a35';g.fillRect(0,1,16,5);g.fillStyle='#3f9a4a';g.fillRect(0,0,16,4);
    g.fillStyle='#6fdc5a';for(let i=0;i<9;i++)g.fillRect(rr()*16|0,rr()*3|0,1,1);g.fillStyle='#2a6a35';g.fillRect(1,6,2,1);g.fillRect(7,6,3,1);g.fillRect(13,6,2,1);return c;})();
  const crown=(()=>{const [c,g]=mk(16,16);g.fillStyle='#2a6a35';g.fillRect(1,4,14,10);g.fillRect(3,2,10,13);g.fillStyle='#3f9a4a';g.fillRect(2,4,12,7);g.fillRect(4,2,8,10);
    g.fillStyle='#6fdc5a';[[5,3],[8,4],[11,6],[4,7],[9,8]].forEach(([x,y])=>g.fillRect(x,y,2,1));g.fillStyle='#e85a8a';g.fillRect(6,9,1,1);g.fillRect(11,10,1,1);return c;})();
  const lamp=lit=>{const [c,g]=mk(16,16);g.fillStyle='#3a2616';g.fillRect(7,7,2,9);g.fillStyle='#1a1226';g.fillRect(4,1,8,7);g.fillRect(5,0,6,1);
    g.fillStyle=lit?'#ffe7a8':'#3a3550';g.fillRect(5,2,6,5);if(lit){g.fillStyle='#ffffff';g.fillRect(7,3,2,2);}g.fillStyle='#5a3a1e';g.fillRect(4,8,8,1);return c;};
  const block=(()=>{const [c,g]=mk(16,16);g.fillStyle='#3a362e';g.fillRect(0,0,16,16);g.fillStyle='#8a8478';g.fillRect(1,1,14,14);g.fillStyle='#b0a898';g.fillRect(1,1,14,2);g.fillRect(1,1,2,14);
    g.fillStyle='#625c50';g.fillRect(1,13,14,2);g.fillRect(13,1,2,14);g.fillStyle='#5a5448';[[6,5],[7,5],[8,5],[9,5],[7,6],[7,7],[8,8],[8,9],[7,10],[6,10],[9,10]].forEach(([x,y])=>g.fillRect(x,y,1,1));return c;})();
  const gate=(()=>{const [c,g]=mk(16,16);g.fillStyle='#2a2630';g.fillRect(2,0,12,16);g.fillStyle='#6e6880';g.fillRect(3,0,10,16);g.fillStyle='#8e88a0';g.fillRect(3,0,2,16);
    g.fillStyle='#4a4458';g.fillRect(3,7,10,2);g.fillStyle='#c9a24a';g.fillRect(7,3,2,2);g.fillRect(7,11,2,2);return c;})();
  const glass=(()=>{const [c,g]=mk(16,16);g.fillStyle='rgba(150,220,255,.28)';g.fillRect(0,0,16,16);g.fillStyle='#d8f4ff';g.fillRect(0,0,16,1);g.fillRect(0,0,1,16);g.fillStyle='#7fb8d0';g.fillRect(0,15,16,1);g.fillRect(15,0,1,16);
    g.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<5;i++)g.fillRect(3+i,9-i,1,1);g.fillRect(9,12,3,1);return c;})();
  const tablet=(()=>{const [c,g]=mk(16,16);g.fillStyle='#2a2630';g.fillRect(3,2,10,14);g.fillStyle='#7a7488';g.fillRect(4,3,8,13);g.fillStyle='#9a94a8';g.fillRect(4,3,8,1);
    g.fillStyle='#4a4458';[[6,6],[7,6],[9,6],[6,9],[8,9],[9,9],[6,12],[7,12],[8,12]].forEach(([x,y])=>g.fillRect(x,y,1,1));return c;})();
  const torchBase=(()=>{const [c,g]=mk(16,16);g.fillStyle='#2a2630';g.fillRect(6,7,4,9);g.fillStyle='#6e6880';g.fillRect(7,7,2,9);g.fillStyle='#4a3424';g.fillRect(4,5,8,3);g.fillStyle='#7a5230';g.fillRect(5,5,6,1);return c;})();
  const cracked=(()=>{const [c,g]=mk(16,16);g.fillStyle='#3a3640';g.fillRect(0,0,16,16);g.fillStyle='#7a7488';g.fillRect(1,1,14,14);g.fillStyle='#9a94a8';g.fillRect(1,1,14,2);
    g.fillStyle='#2a2630';[[3,2],[4,3],[4,4],[5,5],[6,6],[6,7],[7,8],[8,8],[9,9],[10,10],[10,11],[11,12],[12,13],[6,8],[5,9],[4,10],[3,11],[9,4],[10,3],[11,3],[12,4],[9,5]].forEach(([x,y])=>g.fillRect(x,y,1,1));
    g.fillStyle='#c9925a';g.fillRect(7,7,1,1);g.fillRect(10,11,1,1);return c;})();
  const obsid=(()=>{const [c,g]=mk(16,16);g.fillStyle='#16121e';g.fillRect(0,0,16,16);g.fillStyle='#2a2238';g.fillRect(1,1,14,14);g.fillStyle='#4a3e5e';g.fillRect(2,2,5,1);g.fillRect(2,2,1,4);
    g.fillStyle='#1e1828';[[8,6],[9,7],[10,7],[11,8],[5,10],[6,11],[7,11]].forEach(([x,y])=>g.fillRect(x,y,1,1));return c;})();
  return {cracked,obsid,crate,plank,spike,soil,bramble,wet,charred,ice,rock,gen0:gen(false),gen1:gen(true),leaves,crown,lamp0:lamp(false),lamp1:lamp(true),block,gate,glass,tablet,torchBase};
})();
const DOORS=(()=>{
  const lock=(()=>{const [c,g]=mk(16,32);g.fillStyle='#2a1d14';g.fillRect(0,0,16,32);g.fillStyle='#7b4f2b';g.fillRect(2,2,12,30);
    g.fillStyle='#5e3b1f';g.fillRect(5,2,1,30);g.fillRect(10,2,1,30);g.fillStyle='#8a8f9c';g.fillRect(2,6,12,2);g.fillRect(2,24,12,2);
    g.fillStyle='#c9ced8';[3,8,12].forEach(x=>{g.fillRect(x,6,1,1);g.fillRect(x,24,1,1);});
    g.fillStyle='#9a6a10';g.fillRect(8,13,6,7);g.fillStyle='#ffd34d';g.fillRect(9,14,4,5);g.fillStyle='#1a1226';g.fillRect(10,15,2,1);g.fillRect(10,16,1,2);return c;})();
  const open=(()=>{const [c,g]=mk(16,32);g.fillStyle='#2a1d14';g.fillRect(0,0,16,32);g.fillStyle='#0a0810';g.fillRect(2,2,12,30);
    g.fillStyle='#7b4f2b';g.fillRect(2,2,3,30);g.fillStyle='#5e3b1f';g.fillRect(4,2,1,30);g.fillStyle='#8a8f9c';g.fillRect(2,6,3,2);g.fillRect(2,24,3,2);return c;})();
  const exit=(()=>{const [c,g]=mk(16,32);g.fillStyle='#5c5672';g.fillRect(0,2,16,30);g.fillRect(2,1,12,1);g.fillRect(4,0,8,1);
    g.fillStyle='#3e3a52';g.fillRect(0,12,3,1);g.fillRect(13,20,3,1);g.fillRect(0,26,3,1);g.fillRect(13,8,3,1);
    const bands=['#fff3c4','#ffe7a8','#fcd27a','#f7b54a','#ee9a38','#e0782a'];g.fillStyle=bands[0];g.fillRect(5,4,6,1);
    for(let y=5;y<32;y++){g.fillStyle=bands[Math.min(5,Math.floor((y-5)/4.6))];g.fillRect(3,y,10,1);}return c;})();
  return {D:lock,d:open,X:exit};
})();
