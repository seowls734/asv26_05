// state.js — 게임 상태 변수, 레벨 빌드·로드, 적 생성
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ================= state ================= */
let grid,W,lvl,lvlIndex=0,T,cart,rail,coins,items,enemies,particles,arrows,fx,trees,lanterns,trunks,hintsDone,levelHints,links,blocks,summons,bolts,golem;
let cam=0,shake=0,freeze=0,frame=0,fade=0,flash=0,state='title',levelStartCoins=0,cartHintShown=false,muted=false,grassHint=false,hardHint=false;
const p={w:10,h:14,maxHp:5,hp:5,coins:0};
let lastSafe={x:0,y:0};
const STARS=(()=>{const r=rng(42);return Array.from({length:70},()=>({x:r()*640,y:r()*120,b:r()}));})();
const CRYST=(()=>{const r=rng(77);return Array.from({length:26},()=>({x:r()*900,y:20+r()*150,s:1+(r()*2|0),ph:r()*6}));})();

function buildLevel(def){
  const Wt=def.segs.reduce((s,g)=>s+g.w,0);
  const g=[];for(let y=0;y<ROWS;y++)g.push(Array(Wt).fill('.'));
  const out={grid:g,W:Wt,rail:null,links:[],hints:[]};
  let ox=0;
  for(const seg of def.segs){
    const o=ox;
    const L={set(x,y,c){x+=o;if(x>=0&&x<Wt&&y>=0&&y<ROWS)g[y][x]=c;},fill(x0,x1,y0,y1,c){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)this.set(x,y,c);}};
    if(seg.rows)seg.rows.forEach((r,y)=>{for(let x=0;x<seg.w;x++)g[y][o+x]=r[x]||'.';});
    if(seg.build)seg.build(L);
    if(seg.rail)out.rail={row:seg.rail.row,x0:seg.rail.x0+o,x1:seg.rail.x1+o};
    (seg.hints||[]).forEach(([c,k])=>out.hints.push([c+o,k]));
    (seg.links||[]).forEach(l=>{const n=JSON.parse(JSON.stringify(l));
      for(const k in n){const v=n[k];if(k==='at')n[k]=[v[0]+o,v[1]];else if(Array.isArray(v)&&Array.isArray(v[0]))n[k]=v.map(([x,y])=>[x+o,y]);}
      out.links.push(n);});
    ox+=seg.w;
  }
  return out;
}
function loadLevel(i){
  lvlIndex=i;lvl=LEVELS[i];const B=buildLevel(lvl);grid=B.grid;W=B.W;T=genTiles(lvl.pal);levelHints=B.hints;links=B.links;
  boss=null;bossHaz=[];
  links.forEach(l=>{l.open=l.type==='bossgate';l.anim=l.open?1:0;if(l.type==='torch'){l.lit=l.torches.map(()=>false);l.progress=0;l.resetT=0;}});
  mobPick={S:0,V:0};coins=[];items=[];enemies=[];particles=[];arrows=[];fx=[];trees=[];lanterns=[];trunks=new Set();hintsDone=new Set();blocks=[];summons=[];bolts=[];golem=null;flash=0;
  let sx=40,sy=144;
  for(let y=0;y<ROWS;y++)for(let x=0;x<W;x++){
    const c=grid[y][x],px=x*TS,py=y*TS;
    if(c==='P'){sx=px+3;sy=py+2;grid[y][x]='.';}
    else if(c==='C'){coins.push({x:px+5,y:py+5,w:6,h:6,t:Math.random()*40|0});grid[y][x]='.';}
    else if(c==='K'){items.push({type:'key',x:px+3,y:py+8,w:9,h:5,t:0});grid[y][x]='.';}
    else if(c==='H'){items.push({type:'heart',x:px+4,y:py+8,w:7,h:6,t:0});grid[y][x]='.';}
    else if(c==='S'){enemies.push(mkEnemy('slime',px+2,py+8,pickMob('S')));grid[y][x]='.';}
    else if(c==='V'){enemies.push(mkEnemy('bat',px+3,py+4,pickMob('V')));grid[y][x]='.';}
    else if(c==='M'){blocks.push({ox:x,oy:y,nx:x,ny:y,t:0,mode:null});grid[y][x]='.';}
    else if(c==='L')lanterns.push({tx:x,ty:y,lit:false});
    else if(c==='Q'){boss=mkBoss(lvl.boss,px+8,py);enemies.push(boss);grid[y][x]='.';}
  }
  rail=B.rail;
  cart=rail?{x:rail.x0*TS,y:rail.row*TS-12,w:22,h:12,vx:0,min:rail.x0*TS,max:(rail.x1+1)*TS-22}:null;
  Object.assign(p,{x:sx,y:sy,vx:0,vy:0,face:1,onGround:false,coyote:0,jumpBuf:0,dashT:0,dashCD:0,canDash:true,slashT:0,slashCD:0,shootCD:0,bowT:0,bowAng:0,
    charging:false,chargeT:0,giantT:0,bowCharging:false,bowChargeT:0,chargedCD:0,pushT:0,inv:0,knockT:0,boardCD:0,riding:false,keys:0,hitSet:new Set(),trail:[],target:null});
  lastSafe={x:sx,y:sy};levelStartCoins=p.coins;
  gotCount=lvlIndex;applyAbilities();
  if(boss){const gl=links.find(l=>l.type==='bossgate');const gx=gl?gl.gates[0][0]:0;boss.gx=gx;boss.minX=(gx+1)*TS+4;boss.maxX=(gx+23)*TS-boss.w-4;boss.exitCol=gx+(lvl.exitCol||20);boss.chestCol=gx+11;boss.pools=[(gx+3)*TS+8,(gx+20)*TS+8];}
  screenEl.classList.remove('bossfight');$('bossbar').hidden=true;
  cam=Math.max(0,Math.min(W*TS-VW,p.x-VW/2));
  $('stage').textContent=lvl.code+' · '+lvl.name;
  toast(lvl.code+' '+lvl.name,1800,true);
}
function mkEnemy(type,x,y,sub){const d=sub&&MOBS[sub];const e=mkEnemyBase(d?d.base:type,x,y);
  if(d){e.sub=sub;e.def=d;e.w=d.w;e.h=d.h;e.hp=e.maxHp=d.hp;e.cd=60+(Math.random()*60|0);e.x=x+(e.type==='slime'?6:5)-d.w/2;if(e.type==='slime')e.y=y+8-d.h;}
  return e;}
function mkEnemyBase(type,x,y){return type==='slime'?{type,x,y,w:12,h:8,vy:0,dir:-1,hp:3,maxHp:3,kvx:0,t:0,flash:0,frozen:0,burn:0,shock:0,root:0,orb:0}
  :{type,x,y,w:10,h:6,hp:2,maxHp:2,kvx:0,t:Math.random()*200|0,flash:0,frozen:0,burn:0,shock:0,root:0,orb:0};}
