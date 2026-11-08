// sprite-helpers.js — 픽셀 문자열 → 캔버스 스프라이트, 좌우 반전, 색 틴트
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ================= sprite helpers ================= */
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;return [c,g];}
function sprite(rows,pal){const w=Math.max(...rows.map(r=>r.length)),h=rows.length;const [c,g]=mk(w,h);
  rows.forEach((r,y)=>{for(let x=0;x<r.length;x++){const col=pal[r[x]];if(col){g.fillStyle=col;g.fillRect(x,y,1,1);}}});return c;}
function flipped(src){const [c,g]=mk(src.width,src.height);g.translate(src.width,0);g.scale(-1,1);g.drawImage(src,0,0);return c;}
function tinted(src,col){const [c,g]=mk(src.width,src.height);g.drawImage(src,0,0);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,c.width,c.height);return c;}
function variants(src){const w=tinted(src,'#ffffff');return {r:src,l:flipped(src),wr:w,wl:flipped(w),ice:tinted(src,'#a8ecff'),yel:tinted(src,'#fff27a')};}
function rng(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
