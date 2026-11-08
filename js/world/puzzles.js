// puzzles.js — 압력판, 돌 문, 풍차, 적 처치 문, 돌 블록
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ================= puzzles ================= */
function bodiesOnPlate(tx,ty){
  const x0=tx*TS+1,x1=tx*TS+15,floor=ty*TS+16;
  const on=b=>b.x<x1&&b.x+b.w>x0&&Math.abs(b.y+b.h-floor)<3;
  if(!p.riding&&p.onGround&&on(p))return true;
  if(golem&&golem.onGround&&on(golem))return true;
  for(const e of enemies)if(!e.dead&&(e.frozen>0||e.root>0)&&e.type==='slime'&&on(e))return true;
  if(blockAt(tx,ty))return true;
  return false;
}
function cellOccupied(tx,ty){const R=cellRect(tx,ty);if(overlap(R,p))return true;if(golem&&overlap(R,golem))return true;
  for(const e of enemies)if(!e.dead&&overlap(R,e))return true;return !!blockAt(tx,ty);}
function updatePuzzles(){
  for(const L of links){
    if(L.type==='plate'){
      L.pressed=L.plates.map(([x,y])=>bodiesOnPlate(x,y));
      const ok=L.pressed.every(Boolean);
      if(L.latch){if(ok&&!L.open){L.open=true;solved();}}
      else if(ok!==L.open){L.open=ok;sfx(ok?'door':'push');}
    }else if(L.type==='windmill'){
      L.ang=(L.ang||0)+(L.spin>0?.05+.35*L.spin/120:.008);if(L.spin>0)L.spin--;
    }else if(L.type==='clear'){
      if(!L.open){const [x0]=L.area[0],[x1]=L.area[1];
        if(!enemies.some(e=>{if(e.dead)return false;const c=Math.floor((e.x+e.w/2)/TS);return c>=x0&&c<=x1;})){L.open=true;solved();}}
    }else if(L.type==='gens'){
      if(!L.open&&L.gens.every(([x,y])=>cell(x,y)==='z')){L.open=true;solved();}
    }else if(L.type==='torch'){
      if(L.resetT>0){L.resetT--;if(L.resetT===0){L.lit=L.lit.map(()=>false);L.progress=0;L.torches.forEach(([x,y])=>puff(x*TS+8,y*TS+4,6,'#5a5468',.8,-.02,20));}}
    }
    if(L.gates){
      L.anim+=((L.open?1:0)-L.anim)*.12;
      for(const [x,y] of L.gates){
        if(L.open){if(cell(x,y)==='|')grid[y][x]=':';}
        else if(cell(x,y)===':'&&!cellOccupied(x,y))grid[y][x]='|';
      }
    }
  }
}
function tryPush(b,dir){
  if(!b||b.mode)return false;
  if(blockAt(b.ox,b.oy-1))return false;
  const nx=b.ox+dir;if(solid(nx,b.oy))return false;
  const R=cellRect(nx,b.oy);for(const e of enemies)if(!e.dead&&overlap(R,e))return false;
  b.nx=nx;b.ny=b.oy;b.mode='slide';b.t=0;sfx('push');puff(b.ox*TS+(dir>0?0:16),b.oy*TS+15,4,'#b0a898',.6,0,12);return true;
}
function updateBlocks(){
  for(const b of blocks){
    if(b.mode){b.t++;const dur=b.mode==='slide'?14:5;if(b.t>=dur){b.ox=b.nx;b.oy=b.ny;b.mode=null;b.t=0;}}
    if(!b.mode){const by=b.oy+1;if(by<ROWS&&!solid(b.ox,by)&&!oneway(b.ox,by)){b.nx=b.ox;b.ny=by;b.mode='fall';b.t=0;}}
  }
}
function blockDrawPos(b){if(!b.mode)return [b.ox*TS,b.oy*TS];const dur=b.mode==='slide'?14:5,k=b.t/dur;return [(b.ox+(b.nx-b.ox)*k)*TS,(b.oy+(b.ny-b.oy)*k)*TS];}
