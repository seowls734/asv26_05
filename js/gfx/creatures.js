// creatures.js — 나무 골렘, 동전·열쇠·하트, 레드 드래곤·와이번, 독수리, 횃불 문양
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

const GOPAL={k:'#1a1208',g:'#3f9a4a',G:'#6fdc5a',b:'#7a5230',B:'#5a3a1e',e:'#d8ffb0'};
const GTOP=["...kkkkkk...","..kgGgGgGk..",".kgGgGgGgGk.",".kGgGgGgGgk.","..kbbbbbbk..","..kbebbebk..","..kbbbbbbk..",".kkbBbbBbkk.","kbkbbbbbbkbk","kbkbBbbBbkbk","kbkbbbbbbkbk","kgkbbbbbbkgk",".k.kbBBbk.k.","...kbbbbk..."];
const GOLEM=[variants(sprite(GTOP.concat(["..kbbkkbbk..","..kbbk.kbbk.","..kBBk.kBBk.","..kkk...kkk."]),GOPAL)),
             variants(sprite(GTOP.concat(["...kbbbbk...","..kbbk.kbk..",".kBBk..kBBk.",".kkk....kkk."]),GOPAL))];
const COIN=sprite([".kkkk.","kyYyyk","kYyyyk","kYyyyk","kyyyYk",".kkkk."],{k:'#7a4a10',y:'#ffd34d',Y:'#fff1a8'});
const KEY=sprite([".kkk.....","kyyykkkkk","ky.yyyyyk","kyyykkyky",".kkk..k.k"],{k:'#6a3f08',y:'#ffd34d'});
const HROWS=[".kk.kk.","kRrkrrk","krrrrrk",".krrrk.","..krk..","...k..."];
const HEART=sprite(HROWS,{k:'#2a0d12',r:'#e8413b',R:'#ff9a8f'});
const HEART_E=sprite(HROWS,{k:'#120f1c',r:'#3b3550',R:'#4f4866'});
const MOON=(()=>{const [c,g]=mk(25,25);for(let y=0;y<25;y++)for(let x=0;x<25;x++){const dx=x-12,dy=y-12;if(dx*dx+dy*dy<=144){g.fillStyle=(dx*dx+dy*dy>110)?'#d9c58e':'#f1e2b3';g.fillRect(x,y,1,1);}}
  g.fillStyle='#d9c58e';g.fillRect(7,8,3,3);g.fillRect(14,14,4,3);g.fillRect(15,6,2,2);return c;})();
/* red dragon: shaded body, membrane wings with finger bones, auto outline */
const WYV_PAL={base:'#2a8a6a',dark:'#1a5a46',hi:'#4ac08a',belly:'#d8c890',bellyD:'#a89860',mem:'#2a6a5a',memFar:'#1a4a3e',bone:'#5ad09a',horn:'#e8e0c8',spike:'#0e3a2e'};
function makeDragon(wing,open,pal){
  const Wd=72,Hd=46;const [c,g]=mk(Wd,Hd);
  const px=(x,y,col)=>{if(x<0||y<0||x>=Wd||y>=Hd)return;g.fillStyle=col;g.fillRect(x|0,y|0,1,1);};
  const ell=(cx,cy,rx,ry,col)=>{for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy<=1)px(x,y,col);}};
  const inPoly=(x,y,pts)=>{let ins=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,yi]=pts[i],[xj,yj]=pts[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))ins=!ins;}return ins;};
  const poly=(pts,col)=>{const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);for(let y=Math.floor(Math.min(...ys));y<=Math.ceil(Math.max(...ys));y++)for(let x=Math.floor(Math.min(...xs));x<=Math.ceil(Math.max(...xs));x++)if(inPoly(x+.5,y+.5,pts))px(x,y,col);};
  const line=(x0,y0,x1,y1,col)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let i=0;i<=n;i++)px(Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n),col);};
  const C=Object.assign({base:'#b3242a',dark:'#741520',hi:'#e0503e',belly:'#e8a24a',bellyD:'#b86a2a',mem:'#8f1f24',memFar:'#5e1219',bone:'#d0503e',horn:'#e8d8b0',spike:'#4a0a10'},pal||{});
  const {base,dark,hi,belly,bellyD,mem,memFar,bone,horn,spike}=C;
  const wingPts=up=>up?[[36,20],[28,6],[12,1],[17,8],[7,10],[16,14],[11,19],[22,20]]:[[36,20],[28,32],[14,44],[19,37],[9,36],[18,31],[13,26],[24,24]];
  const up=wing===0;
  // far wing
  const fw=wingPts(up).map(([x,y])=>[x+6,y-2]);poly(fw,memFar);line(fw[0][0],fw[0][1],fw[1][0],fw[1][1],dark);[2,4,6].forEach(i=>line(fw[1][0],fw[1][1],fw[i][0],fw[i][1],dark));
  // tail
  [[17,29,5],[12,28.5,4.2],[8,27,3.4],[5,24.5,2.7],[3,22,2.2]].forEach(([x,y,r])=>ell(x,y,r,r*.9,base));
  [[17,31,4],[12,30.5,3.2],[8,29,2.4]].forEach(([x,y,r])=>ell(x,y,r,1.2,dark));
  poly([[0,16],[6,19],[1,24],[3,20]],spike);
  // legs (back)
  ell(22,33,4.5,4,base);ell(21,38,2.2,3,dark);ell(22.5,41,3.2,1.5,dark);px(25,42,horn);px(24,42,horn);
  // body
  ell(30,27,15,7.5,base);ell(31,30.5,12.5,3.6,belly);ell(29,23,11,3,hi);
  for(let x=21;x<=41;x+=3){px(x,30,bellyD);px(x,31,bellyD);px(x,32,bellyD);}
  ell(30,33,12,1.2,dark);
  // front leg
  ell(39,33,3.4,3.2,base);ell(40,37.5,2,3,dark);ell(41.5,41,2.8,1.4,dark);px(43,42,horn);px(44,41,horn);
  // neck
  [[42,23,6,5.5],[46,19,5.2,5],[50,16,4.6,4.4]].forEach(([x,y,rx,ry])=>ell(x,y,rx,ry,base));
  [[43,26,4,2],[47,22,3,1.8],[51,19,2.5,1.4]].forEach(([x,y,rx,ry])=>ell(x,y,rx,ry,belly));
  [[41,20,4,2],[45,16,3,1.6],[49,13,2.4,1.2]].forEach(([x,y,rx,ry])=>ell(x,y,rx,ry,hi));
  // back + neck spikes
  for(let x=18;x<=40;x+=4){const t=(x-30)/15,top=Math.round(27-7.5*Math.sqrt(Math.max(0,1-t*t)));px(x,top-1,spike);px(x,top-2,spike);px(x-1,top-1,spike);}
  [[41,17],[45,13],[49,10]].forEach(([x,y])=>{px(x,y,spike);px(x,y-1,spike);px(x-1,y,spike);});
  // head: cranium + upper jaw, lower jaw hinged at the cheek
  ell(55.5,12,6,4.6,base);
  poly([[57,8.5],[66,10],[70,12],[70,14.5],[57,15.5]],base);
  ell(56,9.6,4.4,1.6,hi);line(59,9,66,10.5,hi);
  if(open){
    poly([[55,14.5],[70,14.5],[67.5,22.5],[55,18]],'#3a0a0c');
    line(57,18,64,20.5,'#c8445a');line(57,17,63,19.5,'#a83048');
    poly([[51,14],[56,15],[68,21.5],[68,24],[56,20.5],[51,18]],base);
    line(56,20.5,67,23.5,dark);line(57,16,66,21,hi);
    [60,63,66,69].forEach(x=>{px(x,15,'#fff6e0');px(x,16,'#fff6e0');});
    [59,62,65].forEach(x=>{const y=Math.round(15+(x-56)*0.54);px(x,y-1,'#fff6e0');px(x,y-2,'#fff6e0');});
    px(64,18,'#ffd34d');px(65,19,'#ff8a2a');px(62,17,'#ff8a2a');
  }else{
    poly([[51,14],[56,15],[69,15],[68.5,17.5],[56,18.5],[51,17.5]],base);
    line(55,16,68,16,dark);px(61,15,'#fff6e0');px(65,15,'#fff6e0');px(63,17,'#fff6e0');
  }
  ell(53.5,15.5,3.2,2.8,base);ell(53.5,16.8,2.2,1.1,dark);
  line(53,8,58,9,spike);px(55,10,'#ffd34d');px(57,10,'#ffd34d');px(56,10,'#2a0608');
  px(68,11,'#2a0608');
  line(52,8,47,4,horn);line(47,4,44,3,horn);line(55,8,52,3,horn);line(52,3,51,1,horn);
  // near wing
  const nw=wingPts(up);poly(nw,mem);
  line(nw[0][0],nw[0][1],nw[1][0],nw[1][1],bone);[2,4,6].forEach(i=>line(nw[1][0],nw[1][1],nw[i][0],nw[i][1],bone));
  px(nw[1][0],nw[1][1],horn);px(nw[1][0]-1,nw[1][1]-1,horn);
  // auto outline
  const id=g.getImageData(0,0,Wd,Hd),d=id.data,o=new Uint8ClampedArray(d);
  for(let y=0;y<Hd;y++)for(let x=0;x<Wd;x++){const i=(y*Wd+x)*4;if(d[i+3])continue;
    if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>{const xx=x+dx,yy=y+dy;return xx>=0&&yy>=0&&xx<Wd&&yy<Hd&&d[((yy*Wd+xx)*4)+3];})){o[i]=26;o[i+1]=6;o[i+2]=8;o[i+3]=255;}}
  g.putImageData(new ImageData(o,Wd,Hd),0,0);
  return {r:c,l:flipped(c)};
}
const DRAGON=[[makeDragon(0,false),makeDragon(1,false)],[makeDragon(0,true),makeDragon(1,true)]];
function makeEagle(up){
  const Wd=46,Hd=30;const [c,g]=mk(Wd,Hd);
  const px=(x,y,col)=>{if(x<0||y<0||x>=Wd||y>=Hd)return;g.fillStyle=col;g.fillRect(x|0,y|0,1,1);};
  const ell=(cx,cy,rx,ry,col)=>{for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy<=1)px(x,y,col);}};
  const inPoly=(x,y,pts)=>{let ins=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,yi]=pts[i],[xj,yj]=pts[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))ins=!ins;}return ins;};
  const poly=(pts,col)=>{const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);for(let y=Math.floor(Math.min(...ys));y<=Math.ceil(Math.max(...ys));y++)for(let x=Math.floor(Math.min(...xs));x<=Math.ceil(Math.max(...xs));x++)if(inPoly(x+.5,y+.5,pts))px(x,y,col);};
  const line=(x0,y0,x1,y1,col)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let i=0;i<=n;i++)px(Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n),col);};
  const L='#b6f05a',LL='#e2ffa8',LD='#6aaa2a',LDD='#3e7a1a',Y='#ffd34d',YD='#c98a1a';
  const far=up?[[24,13],[19,2],[10,1],[13,5],[5,6],[13,9],[7,12],[17,13]]:[[24,17],[20,28],[12,28],[15,24],[7,23],[15,20],[9,18],[18,17]];
  poly(far.map(([x,y])=>[x+4,y-1]),LDD);
  poly([[13,14],[2,10],[4,14],[1,18],[5,19],[13,18]],LD);line(4,12,12,15,LDD);line(3,17,12,17,LDD);
  ell(22,15.5,10,5,L);ell(22,18,8,2.6,LL);for(let x=15;x<=28;x+=3)px(x,13,LD);
  if(!up){line(21,20,20,24,YD);line(25,20,25,24,YD);px(19,25,Y);px(21,25,Y);px(24,25,Y);px(26,25,Y);}
  else{line(22,20,23,22,YD);line(25,20,26,22,YD);}
  ell(34,12,5,4.3,L);ell(33,10.5,3.5,1.6,LL);
  poly([[37,10],[43,11.5],[42,14],[38,14]],Y);px(42,14,YD);px(43,12,YD);line(38,13,41,13,YD);
  px(35,11,'#1a2a08');px(36,11,'#1a2a08');px(35,10,'#ffffff');line(33,9.5,37,10,LDD);
  const near=up?[[24,13],[19,1],[9,0],[13,4],[4,5],[13,8],[6,11],[17,12]]:[[24,17],[20,29],[11,29],[15,25],[6,24],[15,21],[8,19],[18,18]];
  poly(near,L);[2,4,6].forEach(i=>line(near[1][0],near[1][1],near[i][0],near[i][1],LD));line(near[0][0],near[0][1],near[1][0],near[1][1],LL);
  const id=g.getImageData(0,0,Wd,Hd),d=id.data,o=new Uint8ClampedArray(d);
  for(let y=0;y<Hd;y++)for(let x=0;x<Wd;x++){const i=(y*Wd+x)*4;if(d[i+3])continue;
    if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>{const xx=x+dx,yy=y+dy;return xx>=0&&yy>=0&&xx<Wd&&yy<Hd&&d[((yy*Wd+xx)*4)+3];})){o[i]=22;o[i+1]=40;o[i+2]=8;o[i+3]=255;}}
  g.putImageData(new ImageData(o,Wd,Hd),0,0);return c;
}
const EAGLE=[makeEagle(true),makeEagle(false)];
const SYM={
 sun:sprite([".y.y.","..y..","yyYyy","..y..",".y.y."],{y:'#ffd34d',Y:'#fff6c8'}),
 star:sprite(["..w..",".www.","wwwww",".w.w.","w...w"],{w:'#e8ecf4'}),
 moon:sprite([".mm..","m....","m....","m....",".mm.."],{m:'#bfd6ff'}),
 leaf:sprite(["..gg.",".ggg.","gggg.",".gg..","g...."],{g:'#6fdc5a'})};
