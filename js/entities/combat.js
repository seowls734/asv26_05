// combat.js — 플레이어 피격, 적 대미지(보스 갑옷·약점), 검 공격
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ================= combat ================= */
function hurtPlayer(srcX){
  if(p.inv>0||state!=='play')return;
  p.hp--;p.inv=(boss&&boss.state!=='sleep'&&boss.state!=='dead')?110:70;shake=7;freeze=4;sfx('hurt');puff(p.x+5,p.y+7,10,'#ff7b6b',1.6);
  if(!p.riding){p.vx=(p.x+p.w/2<srcX?-1:1)*2.6;p.vy=-3.4;p.dashT=0;p.knockT=12;}
  if(p.hp<=0)die();
}
function die(){state='over';shake=10;p.charging=false;p.bowCharging=false;puff(p.x+5,p.y+7,24,'#d6423a',2.2);
  setTimeout(()=>overlay('쓰러졌다…','어둠이 엘프 기사를 삼켰습니다.','R 키를 누르거나 화면을 눌러 다시 도전'),500);}
function hazardHit(){
  p.hp--;sfx('hurt');shake=8;puff(p.x+5,p.y+10,12,'#e8ecf4',1.5);
  if(p.hp<=0){die();return;}
  p.x=lastSafe.x;p.y=lastSafe.y;p.vx=p.vy=0;p.inv=70;p.dashT=0;p.riding=false;
}
function isStuck(e){return e.frozen>0||e.shock>0||e.root>0||e.orb>0;}
let bossHint=false;
function dmgEnemy(e,n,kx,dot,pierce){
  if(e.dead)return;
  if(e.type==='boss'){
    if(e.state==='sleep'||e.state==='dying'||e.state==='dead'||e.hidden)return;
    const [cx,cy]=bossCore(e);
    if(e.armor&&!pierce&&!(e.coreOpen>0)){
      if(!dot){sfx('clank');puff(cx+(Math.random()-.5)*20,cy+(Math.random()-.5)*20,6,'#e8ecf4',1.6,0,10);
        if(!bossHint){bossHint=true;toast('코어가 닫혀 있어! 공격 뒤 열리는 초록 코어를 노려',2400,true);}}
      return;
    }
    if(e.weak&&hitElem&&e.weak[hitElem]){n=Math.ceil(n*e.weak[hitElem]);if(!dot){puff(cx,cy,12,'#ffd34d',2.2,0,16);if(!e.weakHint){e.weakHint=true;toast('약점 공격! 대미지 2배',1500,true);}}}
    e.hp-=n;e.flash=dot?4:8;
    if(!dot){freeze=Math.max(freeze,2);shake=Math.max(shake,3);sfx('hit');puff(cx,cy,10,e.col,1.8,0,16);}
    if(e.phase===1&&e.hp<=e.maxHp*.35){e.phase=2;dropHeart(e);flash=6;shake=10;sfx('roar');toast(e.name+'이(가) 분노했다! 공격이 거세진다',2000,true);}
    if(e.hp<=0){e.hp=0;e.state='dying';e.t=0;e.coreOpen=0;sfx('roar');}
    return;
  }
  e.hp-=n;e.flash=dot?4:8;
  if(kx&&!(e.frozen>0||e.root>0||e.orb>0)){e.kvx=kx;if(e.type==='slime')e.vy=-2;}
  if(!dot){freeze=Math.max(freeze,3);shake=Math.max(shake,3);sfx('hit');puff(e.x+e.w/2,e.y+e.h/2,6,'#ffffff',1.8,0,12);}
  if(e.hp<=0){e.dead=true;sfx('kill');puff(e.x+e.w/2,e.y+e.h/2,16,e.def?e.def.col:e.type==='slime'?'#62d26f':'#7a4fb8',1.8);if(Math.random()<.6)dropCoin(e.x+e.w/2-3,e.y);}
}
function meleeEnemy(e,n,kx){if(e.frozen>0){n+=1;e.frozen=0;puff(e.x+e.w/2,e.y+e.h/2,10,'#bfeeff',1.8);}dmgEnemy(e,n,kx);}
function doSlash(){
  if(p.slashT<5||p.slashT>12)return;
  const cx=p.x+p.w/2,hb={x:p.face>0?cx:cx-22,y:p.y-4,w:22,h:p.h+6};
  for(const e of enemies){if(e.dead||p.hitSet.has(e))continue;if(overlap(hb,e)){p.hitSet.add(e);meleeEnemy(e,swordDmg(),p.face*2.6);}}
  breakTiles(hb,['B']);
}
function doGiant(){
  if(p.giantT<8||p.giantT>18)return;
  const cx=p.x+p.w/2,hb={x:p.face>0?cx:cx-52,y:p.y-26,w:52,h:p.h+32};
  for(const e of enemies){if(e.dead||p.hitSet.has(e))continue;if(overlap(hb,e)){p.hitSet.add(e);meleeEnemy(e,giantDmg(),p.face*4);}}
  breakTiles(hb,['B','R','T','b']);
}
function breakTile(tx,ty){
  const c=cell(tx,ty);grid[ty][tx]='.';fx=fx.filter(f=>!(f.tx===tx&&f.ty===ty&&f.type==='burn'));sfx('crate');shake=Math.max(shake,4);
  puff(tx*TS+8,ty*TS+8,14,c==='R'?'#8e8a9e':c==='B'?'#a06a35':'#2e6a3a',1.8,.12,30);
  if(c==='B'&&Math.random()<.7)dropCoin(tx*TS+5,ty*TS+5);
}
function breakTiles(hb,kinds){
  const tx0=Math.floor(hb.x/TS),tx1=Math.floor((hb.x+hb.w)/TS),ty0=Math.max(0,Math.floor(hb.y/TS)),ty1=Math.min(ROWS-1,Math.floor((hb.y+hb.h)/TS));
  for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++)if(kinds.includes(cell(tx,ty)))breakTile(tx,ty);
}
