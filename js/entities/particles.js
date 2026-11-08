// particles.js — 파티클 생성·갱신, 불꽃 색
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ================= particles ================= */
function puff(x,y,n,col,spd=1.2,g=.05,life=24){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=Math.random()*spd;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.3,life:life*(.5+Math.random()*.5),max:life,c:col,g});}}
function dropCoin(x,y){coins.push({x,y,w:6,h:6,t:0,phys:true,vx:(Math.random()-.5)*2.4,vy:-3-Math.random()*1.5});}
function updateParticles(){
  for(const q of particles){
    q.x+=q.vx;q.y+=q.vy;q.vy+=q.g;q.life--;
    if(q.kind==='flame'){q.size+=q.grow;q.vx*=.985;
      if(!q.hitG&&solid(Math.floor(q.x/TS),Math.floor(q.y/TS))){q.hitG=true;q.y-=q.vy;q.vx=(q.vx>=0?1:-1)*(1+Math.random()*2.2);q.vy=-.3-Math.random()*.6;q.g=-.02;}
    }else q.vx*=.96;
  }
  particles=particles.filter(q=>q.life>0);if(particles.length>1400)particles.splice(0,particles.length-1400);
}
function flameColor(k,pal){if(pal==='lava')return k>.8?'#fff0a0':k>.6?'#ffb03a':k>.4?'#ff6a1a':k>.22?'#c8301a':null;return k>.82?'#fff7d0':k>.64?'#ffd34d':k>.44?'#ff8a2a':k>.26?'#d6423a':null;}
