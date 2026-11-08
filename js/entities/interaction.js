// interaction.js — E키 상호작용 (줍기·문·광차·레버·석판·골렘·상자)
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ================= interaction ================= */
function findInteract(){
  if(p.riding)return null;
  const cx=p.x+p.w/2,cy=p.y+p.h/2;let best=null,bd=1e9;
  const take=(o,d)=>{if(d<bd){bd=d;best=o;}};
  for(const it of items){if(it.taken||it.opened)continue;const d=Math.hypot(it.x+it.w/2-cx,it.y+it.h/2-cy);if(d<22)take({kind:'item',it,x:it.x+it.w/2,y:it.y-6},d);}
  if(cart){const ccx=cart.x+cart.w/2;if(Math.abs(ccx-cx)<22&&Math.abs((p.y+p.h)-(cart.y+cart.h))<10)take({kind:'cart',x:ccx,y:cart.y-6},Math.abs(ccx-cx));}
  if(golem){const d=Math.hypot(golem.x+6-cx,golem.y+9-cy);if(d<26)take({kind:'golem',x:golem.x+6,y:golem.y-10},d);}
  for(const L of links){if(L.type!=='lever'&&L.type!=='tablet')continue;const [x,y]=L.at;const d=Math.hypot(x*TS+8-cx,y*TS+8-cy);if(d<20)take({kind:L.type,L,x:x*TS+8,y:y*TS-4},d);}
  const t0=Math.max(0,Math.floor(cx/TS)-2),t1=Math.min(W-1,Math.floor(cx/TS)+2);
  for(let tx=t0;tx<=t1;tx++)for(let ty=0;ty<ROWS-1;ty++){
    const c=grid[ty][tx];
    if((c==='D'||c==='X')&&(ty===0||grid[ty-1][tx]!==c)){
      const dcx=tx*TS+8,top=ty*TS,bot=top+32;
      if(p.y+p.h>top&&p.y<bot){const d=Math.abs(dcx-cx);
        if(c==='D'&&d<22)take({kind:'door',tx,ty,x:dcx,y:top-6},d);
        if(c==='X'&&d<12)take({kind:'exit',x:dcx,y:top-6},d);}
    }
  }
  return best;
}
function interact(t){
  if(!t)return;
  if(t.kind==='item'&&t.it.type==='chest'){openChest(t.it);return;}
  if(t.kind==='item'){t.it.taken=true;sfx('pick');puff(t.x,t.it.y+3,12,'#ffd34d',1.4);
    if(t.it.type==='key'){p.keys++;toast('녹슨 열쇠를 주웠다',1600,true);}else{p.hp=Math.min(p.maxHp,p.hp+2);toast('체력을 회복했다 (+2)',1600,true);}}
  else if(t.kind==='cart'){p.riding=true;p.dashT=0;sfx('door');
    if(!cartHintShown){cartHintShown=true;toast('광차 탑승 — 좌우 이동 · E 내리기 · 점프로 뛰어내리기',2800,true);}}
  else if(t.kind==='golem'){golem.mode=golem.mode==='follow'?'stay':'follow';sfx('golem');toast(golem.mode==='stay'?'골렘: 여기 있을게':'골렘: 따라갈게',1300,true);}
  else if(t.kind==='lever'){const L=t.L;L.on=!L.on;sfx('push');shake=2;
    for(const [x,y] of L.mirrors){const c=cell(x,y);grid[y][x]=c==='/'?'\\':'/';puff(x*TS+8,y*TS+8,6,'#ffffff',1,0,12);}
    toast('철컥 — 거울이 돌아갔다',1300,true);}
  else if(t.kind==='tablet'){toast(t.L.text,3600,true);sfx('pick');}
  else if(t.kind==='door'){
    if(p.keys>0){p.keys--;grid[t.ty][t.tx]='d';grid[t.ty+1][t.tx]='d';sfx('door');shake=4;puff(t.x,t.ty*TS+16,16,'#8a8f9c',1.6);toast('철문이 열렸다',1500,true);}
    else toast('잠겨 있다. 열쇠가 필요해',1600,true);}
  else if(t.kind==='exit'){state='trans';p.charging=false;p.bowCharging=false;sfx('pick');}
}
