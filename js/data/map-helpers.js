// map-helpers.js — 맵 제작 도우미 (col, ground, pitS, lavaP, ceil)
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ================= levels (segments) ================= */
const col=(x,y0,y1)=>{const a=[];for(let y=y0;y<=y1;y++)a.push([x,y]);return a;};
const ground=(L,w)=>L.fill(0,w-1,10,11,'#');
const pitS=(L,a,b)=>{L.fill(a,b,10,10,'.');L.fill(a,b,11,11,'^');};
const lavaP=(L,a,b)=>L.fill(a,b,10,11,'l');
const ceil=(L,w)=>L.fill(0,w-1,0,0,'#');
