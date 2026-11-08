// physics.js — 타일 충돌, 이동 판정
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ================= physics ================= */
const SOLID=new Set(['#','B','D','o','T','b','i','R','Z','z','G','|','g','A','%','t','*','k','O']);
const SAFE=new Set(['#','o','=','f','Z','z','g']);
function blockAt(tx,ty){for(const b of blocks)if(b.ox===tx&&b.oy===ty)return b;return null;}
function solid(tx,ty){if(tx<0||tx>=W)return true;if(ty<0||ty>=ROWS)return false;return SOLID.has(grid[ty][tx])||!!blockAt(tx,ty);}
function oneway(tx,ty){if(ty<0||ty>=ROWS||tx<0||tx>=W)return false;const c=grid[ty][tx];return c==='='||c==='f';}
function cell(tx,ty){return(ty<0||ty>=ROWS||tx<0||tx>=W)?'#':grid[ty][tx];}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function cellRect(tx,ty){return {x:tx*TS,y:ty*TS,w:TS,h:TS};}
function moveBody(b,dx,dy){
  let hitX=false,ground=false,hitY=false;
  b.x+=dx;
  if(dx!==0){const y0=Math.floor(b.y/TS),y1=Math.floor((b.y+b.h-.01)/TS);
    if(dx>0){const tx=Math.floor((b.x+b.w-.01)/TS);for(let ty=y0;ty<=y1;ty++)if(solid(tx,ty)){b.x=tx*TS-b.w;hitX=true;break;}}
    else{const tx=Math.floor(b.x/TS);for(let ty=y0;ty<=y1;ty++)if(solid(tx,ty)){b.x=(tx+1)*TS;hitX=true;break;}}}
  const prevBottom=b.y+b.h;b.y+=dy;
  const x0=Math.floor(b.x/TS),x1=Math.floor((b.x+b.w-.01)/TS);
  if(dy>0){const ty=Math.floor((b.y+b.h-.01)/TS);for(let tx=x0;tx<=x1;tx++)if(solid(tx,ty)||(oneway(tx,ty)&&prevBottom<=ty*TS+.01)){b.y=ty*TS-b.h;ground=hitY=true;break;}}
  else if(dy<0){const ty=Math.floor(b.y/TS);for(let tx=x0;tx<=x1;tx++)if(solid(tx,ty)){b.y=(ty+1)*TS;hitY=true;break;}}
  return {hitX,ground,hitY};
}
