// levels2.js — 시즌 2 스테이지 12개 (2-1 바람의 초원 → 2-12 마왕의 옥좌)
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.
// 시즌 2는 모든 화살·강화 활·활 차징을 가진 채 시작한다 (loadLevel에서 gotCount=lvlIndex라 자동으로 전부 해금)

Object.assign(HINT,{
  s2_1:()=>'시즌 2 — 마왕이 깨어났다. 마왕의 기운이 느껴지는 동쪽으로 가자',
  s2strong:()=>'이 땅의 몬스터는 훨씬 강해. 모든 화살을 써서 싸우자',
  s2_2:()=>'꽃가루 언덕. 독버섯의 보라색 포자를 조심하자',
  s2_3:()=>'황혼의 강. 강을 건너면 땅이 점점 시들어 간다',
  s2_4:()=>'안개 늪. 늪 너머에서 마녀의 웃음소리가 들린다',
  s2_5:()=>'시든 숲… 마왕의 기운에 숲이 말라 버렸다. 불이나 빛으로 등불을 밝히자',
  s2_6:()=>'잿빛 황야. 쓰러진 기사들의 해골이 일어선다',
  s2_7:()=>'마계의 문. 여기서부터 마왕의 땅이다',
  s2_8:()=>'불꽃 협곡. 용암이 흐르는 마계의 골짜기',
  s2_9:()=>'뼈의 다리. 발을 헛디디면 끝이다',
  s2_10:()=>'피의 호수. 붉은 물 아래 무언가가 움직인다',
  s2_11:()=>'마왕성. 어둠 속에 흑기사가 기다린다',
  s2_12:()=>'마왕의 옥좌. 이번에야말로 끝을 내자',
  s2boss:()=>'이 앞에 마왕이 있다. 빛 화살이 약점이다!'
});
// 시작 구간 공통: 왼쪽 벽, 시작 위치, 동전 세 개
const s2start=(L,w)=>{ground(L,w);L.fill(0,0,0,11,'#');L.set(2,9,'P');[5,6,7].forEach(x=>L.set(x,8,'C'));};
const bossNearSeg=(o)=>({w:14,hints:[[6,'bossNear']],build(L){ground(L,14);if(o&&o.ceil)ceil(L,14);L.set(3,9,'S');L.set(7,4,'V');L.set(9,9,'S');L.set(12,9,'H');}});

LEVELS.push(
 {code:'2-1',season:2,mobs:{S:['wolf'],V:['hawk']},name:'바람의 초원',bg:'plain',boss:'boar',
  pal:{seed:61,base:'#5a4030',d1:'#4a3424',d2:'#6a4a38',stone:'#7a6a5a',top1:'#4aa84a',top2:'#7ad86a',hi:'#b8f08a'},
  segs:[
   {w:36,hints:[[1,'s2_1'],[12,'s2strong']],build(L){s2start(L,36);L.set(11,9,'S');L.set(14,4,'V');pitS(L,17,19);L.set(18,7,'C');L.set(23,9,'S');
     L.fill(26,27,8,9,'#');L.fill(28,29,6,9,'#');L.fill(30,35,6,9,'#');[31,32,33].forEach(x=>L.set(x,5,'C'));L.set(33,2,'V');}},
   {w:22,hints:[[1,'treeClimb']],build(L){ground(L,22);L.set(4,10,'o');L.set(5,10,'o');L.fill(8,21,5,9,'#');[10,11,12].forEach(x=>L.set(x,4,'C'));L.set(15,4,'S');L.set(18,1,'V');}},
   {w:26,hints:[[1,'ice']],build(L){ground(L,26);L.fill(5,18,10,11,'w');L.fill(8,9,7,7,'=');L.fill(13,14,7,7,'=');[8,9,13,14].forEach(x=>L.set(x,6,'C'));L.set(11,3,'V');L.set(22,9,'S');}},
   {w:16,hints:[[8,'bossNear']],build(L){ground(L,16);L.set(4,9,'S');L.set(8,4,'V');L.set(11,9,'B');L.set(13,9,'H');}},
   arenaSeg({ceil:false})
  ]},
 {code:'2-2',season:2,mobs:{S:['toxshroom','wolf'],V:['hornet']},name:'꽃가루 언덕',bg:'meadow',boss:'toad',
  pal:{seed:67,base:'#6a5040',d1:'#5a4030',d2:'#7a5a48',stone:'#9a8070',top1:'#5ab85a',top2:'#8ae07a',hi:'#ffd0f0'},
  segs:[
   {w:30,hints:[[1,'s2_2'],[11,'fire']],build(L){s2start(L,30);L.set(9,9,'S');L.fill(14,14,0,5,'#');L.fill(14,14,6,9,'T');L.set(18,3,'V');L.set(21,9,'S');pitS(L,24,26);L.set(25,7,'C');}},
   ROOM.r1,
   {w:24,build(L){ground(L,24);pitS(L,4,6);L.set(9,9,'S');L.fill(12,13,8,9,'#');L.fill(14,23,6,9,'#');[15,16,17].forEach(x=>L.set(x,5,'C'));L.set(16,2,'V');L.set(19,5,'S');L.set(22,5,'B');}},
   {w:16,hints:[[6,'bossNear']],build(L){ground(L,16);L.set(3,9,'S');L.set(7,4,'V');L.set(10,9,'S');L.set(13,9,'H');}},
   arenaSeg({ceil:false})
  ]},
 {code:'2-3',season:2,mobs:{S:['rivercrab'],V:['dragonfly']},name:'황혼의 강',bg:'dusk',boss:'turtle',
  pal:{seed:73,base:'#4a3a4a',d1:'#3a2e3a',d2:'#5a465a',stone:'#7a6a7a',top1:'#8a6a4a',top2:'#c9925a',hi:'#ffd08a'},
  segs:[
   {w:30,hints:[[1,'s2_3'],[9,'ice']],build(L){s2start(L,30);L.set(8,9,'S');L.fill(12,24,10,11,'w');L.fill(17,18,7,7,'=');L.set(17,6,'C');L.set(18,6,'C');L.set(16,3,'V');L.set(27,9,'S');}},
   {w:28,hints:[[1,'cart']],rail:{row:10,x0:4,x1:25},build(L){ground(L,28);L.set(1,9,'S');L.fill(7,22,10,10,'.');L.fill(7,22,11,11,'^');[10,12,16,18].forEach(x=>L.set(x,7,'C'));L.set(14,4,'V');}},
   {w:20,build(L){ground(L,20);L.fill(3,4,7,7,'=');L.set(4,6,'K');L.set(3,6,'C');L.set(8,9,'S');L.fill(12,12,0,7,'#');L.set(12,8,'D');L.set(12,9,'D');L.set(15,4,'V');L.set(17,9,'S');}},
   bossNearSeg(),
   arenaSeg({ceil:false})
  ]},
 {code:'2-4',season:2,mobs:{S:['bogslime'],V:['mosquito']},name:'안개 늪',bg:'swamp',boss:'witch',water:['rgba(60,90,40,.88)','#9ab86a'],
  pal:{seed:79,base:'#3a3a2a',d1:'#2a2a1e',d2:'#4a4a36',stone:'#5a5a46',top1:'#4a6a3a',top2:'#6a8a4a',hi:'#9ab86a'},
  segs:[
   {w:32,hints:[[1,'s2_4']],build(L){s2start(L,32);L.set(8,9,'S');L.fill(11,13,10,11,'w');L.set(17,9,'S');L.set(18,4,'V');L.fill(20,23,10,11,'w');L.fill(21,22,7,7,'f');L.set(21,6,'C');L.set(22,6,'C');L.set(28,9,'S');}},
   ROOM.r5,
   {w:22,hints:[[1,'treeClimb']],build(L){ground(L,22);L.set(3,10,'o');L.set(4,10,'o');L.fill(7,21,4,9,'#');[9,10,11].forEach(x=>L.set(x,3,'C'));L.set(12,3,'S');L.set(16,1,'V');L.set(19,3,'S');}},
   bossNearSeg(),
   arenaSeg()
  ]},
 {code:'2-5',season:2,mobs:{S:['rotent','bogslime'],V:['crow']},name:'시든 숲',bg:'wither',dark:true,boss:'treant',
  pal:{seed:85,base:'#3a2e2a',d1:'#2a201e',d2:'#4a3a34',stone:'#5a4a44',top1:'#4a3a3a',top2:'#6a5248',hi:'#8a7060'},
  segs:[
   {w:34,hints:[[1,'s2_5'],[15,'fire']],build(L){s2start(L,34);L.set(5,9,'L');L.set(10,9,'S');L.set(14,9,'L');L.fill(18,18,0,5,'#');L.fill(18,18,6,9,'T');L.set(21,9,'L');L.set(24,4,'V');pitS(L,26,28);L.set(31,9,'L');L.set(32,9,'S');}},
   ROOM.r3,
   {w:20,hints:[[1,'giant']],build(L){ground(L,20);L.set(2,9,'L');L.set(6,9,'S');L.fill(9,9,0,7,'#');L.set(9,8,'R');L.set(9,9,'R');L.set(12,9,'L');L.set(14,4,'V');L.set(16,9,'S');L.set(18,9,'H');}},
   arenaSeg({ceil:false,extra(L){L.set(2,9,'L');L.set(21,9,'L');L.set(8,9,'L');}})
  ]},
 {code:'2-6',season:2,mobs:{S:['skelwarrior'],V:['vulture2']},name:'잿빛 황야',bg:'waste',boss:'boneknight',
  pal:{seed:91,base:'#5a524a',d1:'#4a443e',d2:'#6a625a',stone:'#8a8278',top1:'#7a726a',top2:'#9a9288',hi:'#c8c0b0'},
  segs:[
   {w:30,hints:[[1,'s2_6'],[22,'crackWall']],build(L){s2start(L,30);L.set(9,9,'S');pitS(L,13,15);L.set(14,4,'V');L.fill(18,19,8,9,'#');L.set(22,9,'S');L.fill(25,25,0,9,'k');L.set(27,8,'C');}},
   ROOM.r2,
   {w:22,build(L){ground(L,22);L.set(4,9,'B');L.set(4,8,'B');L.set(8,9,'S');pitS(L,11,13);L.fill(15,16,7,7,'=');L.set(15,6,'C');L.set(15,3,'V');L.set(19,9,'S');}},
   bossNearSeg(),
   arenaSeg({ceil:false})
  ]},
 {code:'2-7',season:2,mobs:{S:['hellhound'],V:['imp']},name:'마계의 문',bg:'hellgate',boss:'cerberus',
  pal:{seed:97,base:'#3a1a1e',d1:'#2a1014',d2:'#4a2228',stone:'#6a3038',top1:'#5a1a1a',top2:'#8a2a22',hi:'#ff6a3a'},
  segs:[
   {w:30,hints:[[1,'s2_7'],[6,'lava']],build(L){s2start(L,30);lavaP(L,9,10);L.set(13,9,'S');lavaP(L,16,18);L.set(17,7,'C');L.set(20,4,'V');L.set(23,9,'S');lavaP(L,26,27);}},
   {w:14,hints:[[0,'windmill']],links:[{type:'windmill',at:[5,3],gates:col(9,1,9),latch:true}],build(L){ground(L,14);L.set(9,0,'#');L.fill(9,9,1,9,'|');L.set(5,3,'W');L.set(12,8,'C');}},
   {w:22,build(L){ground(L,22);L.set(4,9,'S');L.fill(7,8,8,9,'#');L.fill(9,10,6,9,'#');lavaP(L,11,14);L.set(13,3,'V');L.set(18,9,'S');}},
   bossNearSeg(),
   arenaSeg({ceil:false})
  ]},
 {code:'2-8',season:2,mobs:{S:['magmagolem'],V:['fireimp']},name:'불꽃 협곡',bg:'hellfire',boss:'ifrit',exitCol:13,
  pal:{seed:103,base:'#3a2422',d1:'#2a1a18',d2:'#4a2e2a',stone:'#6a3e38',top1:'#5a2a22',top2:'#8a3a2a',hi:'#ffb03a'},
  segs:[
   {w:24,hints:[[1,'s2_8']],build(L){ground(L,24);ceil(L,24);L.fill(0,0,0,11,'#');L.set(2,9,'P');[4,5].forEach(x=>L.set(x,8,'C'));lavaP(L,7,8);L.set(11,9,'S');lavaP(L,14,16);L.set(15,7,'C');L.set(19,4,'V');}},
   {w:20,hints:[[0,'lavaRiver']],build(L){ground(L,20);ceil(L,20);lavaP(L,3,16);L.set(10,5,'V');[8,9,10].forEach(x=>L.set(x,7,'C'));}},
   ROOM.r6,
   {w:14,hints:[[6,'bossNear']],build(L){ground(L,14);ceil(L,14);L.set(3,9,'S');lavaP(L,6,7);L.set(10,4,'V');L.set(12,9,'H');}},
   arenaSeg({plat:[[6,8,6],[15,17,6]],q:11,extra(L){lavaP(L,2,4);lavaP(L,19,21);}})
  ]},
 {code:'2-9',season:2,mobs:{S:['skelsniper'],V:['wraith']},name:'뼈의 다리',bg:'bones',boss:'bonedragon',
  pal:{seed:109,base:'#2a2030',d1:'#1e1826',d2:'#3a2e40',stone:'#5a5068',top1:'#c8c0b0',top2:'#e8e0d0',hi:'#ffffff'},
  segs:[
   {w:34,hints:[[1,'s2_9']],build(L){s2start(L,34);L.set(7,9,'S');pitS(L,10,25);L.fill(12,13,8,8,'=');L.fill(16,17,7,7,'=');L.fill(20,21,8,8,'=');L.fill(23,24,8,8,'=');
     L.set(16,6,'C');L.set(17,6,'C');L.set(15,3,'V');L.set(22,2,'V');L.set(30,9,'S');}},
   ROOM.r8,
   {w:22,hints:[[7,'crackWall']],build(L){ground(L,22);L.set(4,9,'S');L.fill(10,10,0,9,'k');L.set(13,4,'V');L.set(16,9,'S');pitS(L,18,19);}},
   bossNearSeg(),
   arenaSeg({ceil:false})
  ]},
 {code:'2-10',season:2,mobs:{S:['bloodslime'],V:['demonbat']},name:'피의 호수',bg:'bloodlake',boss:'kraken',water:['rgba(140,14,30,.86)','#ff6a7a'],
  pal:{seed:115,base:'#3a1a22',d1:'#2a1018',d2:'#4a222c',stone:'#6a3040',top1:'#5a2a3a',top2:'#8a3a4a',hi:'#ff8a9a'},
  segs:[
   {w:32,hints:[[1,'s2_10']],build(L){s2start(L,32);L.set(8,9,'S');L.fill(11,26,10,11,'w');L.fill(14,15,7,7,'=');L.fill(19,20,7,7,'=');L.fill(23,24,7,7,'=');[14,19,24].forEach(x=>L.set(x,6,'C'));L.set(17,3,'V');L.set(29,9,'S');}},
   {w:18,hints:[[0,'gen3']],links:[{type:'gens',gens:[[3,9],[8,6],[13,4]],gates:col(16,1,9),latch:true}],build(L){ground(L,18);L.set(16,0,'#');L.fill(16,16,1,9,'|');L.set(3,9,'Z');L.fill(7,9,7,9,'#');L.set(8,6,'Z');L.fill(13,13,0,3,'#');L.set(13,4,'Z');}},
   {w:20,build(L){ground(L,20);L.set(4,9,'S');pitS(L,7,9);L.set(10,4,'V');L.fill(12,13,8,9,'#');L.set(16,9,'S');L.set(18,9,'B');}},
   bossNearSeg(),
   arenaSeg({ceil:false})
  ]},
 {code:'2-11',season:2,mobs:{S:['demonknight'],V:['gargoyle']},name:'마왕성',bg:'castle',dark:true,boss:'darkknight',
  pal:{seed:121,base:'#2a2434',d1:'#1e1a28',d2:'#3a3246',stone:'#5a5068',top1:'#4a3a5a',top2:'#6a5a7a',hi:'#9a8aaa'},
  segs:[
   {w:22,hints:[[1,'s2_11']],build(L){ground(L,22);ceil(L,22);L.fill(0,0,0,11,'#');L.set(2,9,'P');L.set(5,9,'L');L.set(9,9,'S');L.set(12,9,'L');L.set(15,4,'V');pitS(L,16,17);L.set(20,9,'L');}},
   ROOM.r9,
   {w:19,hints:[[0,'torch4']],links:[{type:'torch',torches:[[4,5],[7,2],[10,4],[13,6]],symbols:['sun','leaf','moon','star'],order:[1,3,2,0],gates:col(17,1,9),latch:true},{type:'tablet',at:[1,9],text:'석판: "잎이 돋고, 별이 지고, 달이 차오르면, 해가 뜬다"'}],
    build(L){ground(L,19);ceil(L,19);L.set(1,9,'r');L.set(3,9,'L');[[4,5],[7,2],[10,4],[13,6]].forEach(([x,y])=>L.set(x,y,'I'));L.fill(17,17,1,9,'|');}},
   {w:16,hints:[[0,'crackWall'],[10,'bossNear']],build(L){ground(L,16);ceil(L,16);L.set(4,9,'L');L.fill(8,8,1,9,'k');L.set(11,9,'S');L.set(13,9,'L');L.set(12,4,'V');L.set(14,9,'H');}},
   arenaSeg({extra(L){L.set(2,9,'L');L.set(21,9,'L');L.set(8,9,'L');}})
  ]},
 {code:'2-12',season:2,mobs:{S:['demonknight','hellhound'],V:['imp','gargoyle']},name:'마왕의 옥좌',bg:'throne',boss:'demonking',
  pal:{seed:127,base:'#2a1018',d1:'#1e0a10',d2:'#3a1620',stone:'#5a2030',top1:'#5a1a2a',top2:'#8a2a3a',hi:'#ffd34d'},
  segs:[
   {w:20,hints:[[1,'s2_12']],build(L){ground(L,20);ceil(L,20);L.fill(0,0,0,11,'#');L.set(2,9,'P');L.set(5,9,'H');L.set(9,9,'S');L.set(12,4,'V');L.set(15,9,'S');[17,18].forEach(x=>L.set(x,8,'C'));}},
   ROOM.r4,
   {w:20,build(L){ground(L,20);ceil(L,20);lavaP(L,3,5);L.set(8,9,'S');L.set(10,4,'V');lavaP(L,12,14);L.set(17,9,'S');}},
   {w:16,hints:[[1,'s2boss']],build(L){ground(L,16);ceil(L,16);L.set(4,9,'H');L.set(8,9,'H');L.set(6,9,'S');L.set(10,4,'V');L.set(12,9,'S');[11,12,13].forEach(x=>L.set(x,8,'C'));}},
   arenaSeg()
  ]}
);
