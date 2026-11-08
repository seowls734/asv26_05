// effects.js — 불 번짐, 얼음·용암 굳히기, 발전기, 나무 성장, 얼음 가시, 횃불, 과녁, 그림자 벽
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ================= world effects ================= */
function ignite(tx,ty,strong){const c=cell(tx,ty);
  if(c==='t'&&!strong)return false;
  if(c!=='T'&&c!=='B'&&c!=='t')return false;grid[ty][tx]='b';fx.push({type:'burn',tx,ty,t:70,crate:c==='B',strong});return true;}
function freezeWater(tx,ty,r=2){freezeLiquid(tx,ty,r,cell(tx,ty)==='l'?'l':'w');}
function freezeLiquid(tx,ty,r,liq){
  const into=liq==='w'?'i':'O',dur=liq==='w'?600:900;
  let y=ty;while(y>0&&grid[y-1][tx]===liq)y--;
  let n=0;for(let dx=-r;dx<=r;dx++){const x=tx+dx;if(cell(x,y)===liq&&cell(x,y-1)!==liq){grid[y][x]=into;fx.push({type:into==='i'?'ice':'obsid',tx:x,ty:y,t:dur});n++;puff(x*TS+8,y*TS+4,5,into==='i'?'#bfeeff':'#8a8a9a',1,0,18);}}
  if(n){sfx(into==='i'?'freeze':'fizz');if(into==='O')puff(tx*TS+8,y*TS,14,'#e8e4f0',1.2,-.05,30);}
}
function meltAt(tx,ty){const c=cell(tx,ty);
  if(c==='i'){const lake=fx.some(f=>f.type==='ice'&&f.tx===tx&&f.ty===ty);grid[ty][tx]=lake?'w':'.';fx=fx.filter(f=>!(f.type==='ice'&&f.tx===tx&&f.ty===ty));puff(tx*TS+8,ty*TS+4,8,'#cfefff',1.2);sfx('splash');}
  else if(c==='A'){grid[ty][tx]='.';fx=fx.filter(f=>!(f.type==='spike'&&f.tx===tx&&f.ty===ty));puff(tx*TS+8,ty*TS+8,6,'#cfefff',1.2);}}
function power(tx,ty){
  if(cell(tx,ty)!=='Z')return;grid[ty][tx]='z';sfx('zap');shake=Math.max(shake,5);puff(tx*TS+8,ty*TS+8,16,'#ffe14d',2,0,20);
  let opened=0;for(let y=0;y<ROWS;y++)for(let x=Math.max(0,tx-18);x<=Math.min(W-1,tx+18);x++)if(grid[y][x]==='G'){grid[y][x]='.';opened++;puff(x*TS+8,y*TS+8,4,'#8fe3ff',1.4,0,20);}
  if(opened)toast('방벽이 열렸다',1600,true);
}
function growTree(tx,ty,big){
  if(cell(tx,ty-1)!=='.')return false;
  const H=big?9:7,hw=big?2:1,cells=[];
  for(let k=0;k<H;k++){const row=ty-1-k;if(row<0||solid(tx,row))break;
    trunks.add(tx+','+row);
    if(k===H-1){cells.push([tx,row,'c']);break;}
    if(k%2===1){for(let d=-hw;d<=hw;d++)cells.push([tx+d,row,'f']);}
    else cells.push([tx,row,'y']);}
  trees.push({cells,i:0,t:0});sfx('grow');puff(tx*TS+8,ty*TS,big?24:14,'#6fdc5a',1.6);return true;
}
function lightLantern(tx,ty){const l=lanterns.find(l=>l.tx===tx&&l.ty===ty);if(!l||l.lit)return false;l.lit=true;sfx('light');puff(tx*TS+8,ty*TS+4,14,'#fff6c8',1.4,0,26);return true;}
function surfaceBelow(c,r){if(c<0||c>=W)return -1;for(let y=Math.max(0,r);y<ROWS;y++)if(solid(c,y))return y;return -1;}
function iceSpikes(hx,fromRow){
  const c=Math.floor(hx/TS);
  for(const [d,h,delay] of [[0,3,0],[-1,2,4],[1,2,4],[-2,1,8],[2,1,8]]){
    const x=c+d,s=surfaceBelow(x,fromRow);if(s<0)continue;
    for(let k=1;k<=h;k++){const y=s-k;if(y<0)break;fx.push({type:'spikeQ',tx:x,ty:y,t:delay+(k-1)*3+1});}
  }
  sfx('freeze');shake=Math.max(shake,4);
}
function raiseSpike(tx,ty){
  if(cell(tx,ty)!=='.'||blockAt(tx,ty))return;
  grid[ty][tx]='A';fx.push({type:'spike',tx,ty,t:300});puff(tx*TS+8,ty*TS+12,5,'#e6fbff',1.4,0,16);
  const R=cellRect(tx,ty);
  for(const e of enemies){if(!e.dead&&overlap(R,e)){dmgEnemy(e,2,0);e.frozen=120;if(e.type!=='boss')e.y=ty*TS-e.h;}}
  for(const e of enemies){if(!e.dead&&e.type==='slime'&&Math.abs((e.y+e.h)-(ty*TS+16))<2&&e.x<R.x+R.w&&e.x+e.w>R.x){dmgEnemy(e,2,0);e.frozen=120;}}
  if(overlap(R,p)){p.y=ty*TS-p.h;p.vy=0;}
  if(golem&&overlap(R,golem)){golem.y=ty*TS-golem.h;golem.vy=0;}
}
function lightTorch(tx,ty){
  for(const L of links){if(L.type!=='torch'||L.open)continue;
    const idx=L.torches.findIndex(([x,y])=>x===tx&&y===ty);if(idx<0||L.lit[idx]||L.resetT>0)continue;
    L.lit[idx]=true;sfx('fire');puff(tx*TS+8,ty*TS+4,10,'#ff9a3a',1.2,-.02,20);
    if(L.order[L.progress]===idx){L.progress++;if(L.progress===L.order.length){L.open=true;solved();}}
    else{L.resetT=40;sfx('wrong');toast('횃불이 꺼졌다… 석판을 다시 보자',2000,true);}
    return true;}
  return false;
}
function cutTarget(tx,ty){
  const L=links.find(l=>l.type==='target'&&!l.open&&l.at[0]===tx&&l.at[1]===ty);if(!L)return false;
  L.open=true;grid[ty][tx]='.';sfx('cut');puff(tx*TS+8,ty*TS+8,12,'#e85a5a',1.6);
  L.bridge.forEach(([x,y],i)=>fx.push({type:'bridgeQ',tx:x,ty:y,t:10+i*4}));
  setTimeout(()=>toast('도개교가 내려왔다!',1600,true),300);return true;
}
function dissolveShadow(cx,cy){
  const seeds=[];for(let y=0;y<ROWS;y++)for(let x=Math.max(0,Math.floor(cx/TS)-5);x<=Math.min(W-1,Math.floor(cx/TS)+5);x++)
    if(grid[y][x]==='%'&&Math.hypot(x*TS+8-cx,y*TS+8-cy)<=4*TS+8)seeds.push([x,y]);
  if(!seeds.length)return;
  const st=[...seeds],seen=new Set();let n=0;
  while(st.length){const [x,y]=st.pop(),k=x+','+y;if(seen.has(k)||cell(x,y)!=='%')continue;seen.add(k);
    fx.push({type:'shadowQ',tx:x,ty:y,t:2+Math.abs(y-seeds[0][1])*3});n++;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>st.push([x+dx,y+dy]));}
  if(n){sfx('seal');setTimeout(()=>toast('그림자 벽이 빛에 녹아내렸다',1600,true),200);}
}
function solved(){sfx('solve');shake=Math.max(shake,3);toast('철컥 — 문이 열렸다!',1600,true);}

function updateWorld(){
  for(const f of fx){
    f.t--;
    if(f.type==='burn'){
      if(frame%3===0)particles.push({x:f.tx*TS+2+Math.random()*12,y:f.ty*TS+4+Math.random()*12,vx:(Math.random()-.5)*.4,vy:-.6-Math.random()*.8,life:18,max:18,c:Math.random()<.5?'#ff7a2a':'#ffd34d',g:-.01});
      if(f.t===40)[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>ignite(f.tx+dx,f.ty+dy,f.strong));
      if(f.t<=0){grid[f.ty][f.tx]='.';puff(f.tx*TS+8,f.ty*TS+8,8,'#5a4a44',1,-.02,30);if(f.crate&&Math.random()<.7)dropCoin(f.tx*TS+5,f.ty*TS+5);}
    }else if(f.type==='ice'&&f.t<=0&&cell(f.tx,f.ty)==='i'){grid[f.ty][f.tx]='w';puff(f.tx*TS+8,f.ty*TS+4,4,'#cfefff',.8);}
    else if(f.type==='obsid'&&f.t<=0&&cell(f.tx,f.ty)==='O'){grid[f.ty][f.tx]='l';puff(f.tx*TS+8,f.ty*TS+4,6,'#ff8a2a',1,-.02,18);}
    else if(f.type==='crackQ'&&f.t<=0&&cell(f.tx,f.ty)==='k'){grid[f.ty][f.tx]='.';puff(f.tx*TS+8,f.ty*TS+8,12,'#8e8a9e',1.8,.12,30);puff(f.tx*TS+8,f.ty*TS+8,6,'#c9925a',1.2,.1,26);}
    else if(f.type==='spikeQ'&&f.t<=0)raiseSpike(f.tx,f.ty);
    else if(f.type==='spike'&&f.t<=0&&cell(f.tx,f.ty)==='A'){grid[f.ty][f.tx]='.';puff(f.tx*TS+8,f.ty*TS+8,6,'#e6fbff',1.4,.08,18);}
    else if(f.type==='bridgeQ'&&f.t<=0&&cell(f.tx,f.ty)==='.'){grid[f.ty][f.tx]='=';puff(f.tx*TS+8,f.ty*TS+2,5,'#d39a5a',1,.05,16);sfx('push');}
    else if(f.type==='shadowQ'&&f.t<=0&&cell(f.tx,f.ty)==='%'){grid[f.ty][f.tx]='.';puff(f.tx*TS+8,f.ty*TS+8,8,'#7a4ab8',1.2,-.03,26);}
  }
  fx=fx.filter(f=>f.t>0||(f.type==='spike'&&false));
  for(const t of trees){t.t++;if(t.t%4===0&&t.i<t.cells.length){const [x,y,c]=t.cells[t.i++];if(cell(x,y)==='.'||(c==='f'&&cell(x,y)==='y')){grid[y][x]=c;puff(x*TS+8,y*TS+8,3,'#6fdc5a',.8,0,14);}}}
  trees=trees.filter(t=>t.i<t.cells.length);
}
