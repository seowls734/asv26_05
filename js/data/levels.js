// levels.js — 스테이지 10개 구성, 보스 아레나, 스테이지별 잡몹 목록
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

function arenaSeg(o){o=o||{};return {w:24,links:[{type:'bossgate',gates:col(0,1,9)}],build(L){ground(L,24);if(o.ceil!==false)ceil(L,24);L.fill(0,0,1,9,':');L.fill(23,23,0,11,'#');
  (o.plat||[[4,6,6],[17,19,6]]).forEach(([a,b,r])=>L.fill(a,b,r,r,'='));if(o.extra)o.extra(L);L.set(o.q||15,9,'Q');}};}
const LEVELS=[
 {code:'1-1',mobs:{S:['slime','mushroom'],V:['bat']},name:'엘프의 숲',bg:'forest',boss:'slimeking',
  pal:{seed:1,base:'#5a3b2c',d1:'#47301f',d2:'#6d4a35',stone:'#7a6657',top1:'#3f8a46',top2:'#68c25a',hi:'#9be07a'},
  segs:[
   {w:40,hints:[[3,'atk'],[22,'climb']],build(L){ground(L,40);L.fill(0,0,0,11,'#');L.set(2,9,'P');[5,6,7].forEach(x=>L.set(x,8,'C'));L.set(11,9,'S');L.set(15,9,'B');L.set(14,4,'V');
     pitS(L,18,20);L.set(19,7,'C');L.fill(22,23,9,9,'#');L.fill(24,25,8,9,'#');L.fill(26,27,7,9,'#');L.fill(28,29,6,9,'#');L.fill(30,31,5,9,'#');L.fill(32,39,4,9,'#');[24,28].forEach(x=>L.set(x,x===24?7:5,'C'));L.set(34,3,'S');L.set(37,3,'K');[32,33].forEach(x=>L.set(x,3,'C'));}},
   ROOM.r1,
   {w:23,hints:[[11,'giant']],build(L){ground(L,23);L.set(5,9,'S');L.set(10,4,'V');L.fill(16,16,0,7,'#');L.set(16,8,'R');L.set(16,9,'R');[19,20,21].forEach(x=>L.set(x,8,'C'));L.set(21,9,'S');}},
   {w:20,hints:[[10,'bossNear']],build(L){ground(L,20);L.fill(4,4,0,7,'#');L.set(4,8,'D');L.set(4,9,'D');L.set(9,9,'B');L.set(9,8,'B');L.set(13,9,'S');L.set(16,4,'V');L.set(11,8,'C');L.set(17,9,'H');}},
   arenaSeg()
  ]},
 {code:'1-2',mobs:{S:['iceslime'],V:['icebat']},name:'얼어붙은 호수',bg:'ice',boss:'yeti',
  pal:{seed:5,base:'#3a4a63',d1:'#2c3a50',d2:'#4a5c78',stone:'#6a7d99',top1:'#a8d8ef',top2:'#ffffff',hi:'#cfe8f5'},
  segs:[
   {w:28,hints:[[2,'elem'],[9,'ice']],build(L){ground(L,28);L.fill(0,0,0,11,'#');L.set(2,9,'P');[4,5,6].forEach(x=>L.set(x,8,'C'));L.set(9,9,'S');
     L.fill(13,26,10,11,'w');L.fill(18,21,7,7,'=');L.set(19,6,'K');L.set(18,6,'C');L.set(21,6,'C');}},
   {w:16,hints:[[1,'iceWeight']],links:[{type:'plate',plates:[[5,9]],gates:col(9,1,9),latch:false}],build(L){ground(L,16);L.set(0,9,'#');L.set(9,0,'#');L.fill(9,9,1,9,'|');L.set(3,9,'S');L.set(5,9,'_');L.set(12,8,'C');L.set(13,8,'C');}},
   {w:28,hints:[[1,'cart']],rail:{row:10,x0:4,x1:25},build(L){ground(L,28);L.set(1,9,'S');L.fill(7,22,10,10,'.');L.fill(7,22,11,11,'^');[10,12,16,18].forEach(x=>L.set(x,7,'C'));L.set(14,4,'V');}},
   {w:18,hints:[[12,'bossNear']],build(L){ground(L,18);L.set(1,9,'S');L.fill(6,6,0,7,'#');L.set(6,8,'D');L.set(6,9,'D');L.set(10,5,'V');L.set(13,9,'S');L.set(16,9,'H');}},
   arenaSeg()
  ]},
 {code:'1-3',mobs:{S:['miner','slime'],V:['bat']},name:'어둠의 갱도',bg:'dark',dark:true,boss:'batqueen',
  pal:{seed:9,base:'#3b3450',d1:'#2c2640',d2:'#4a4263',stone:'#5f577d',top1:'#4f4a6a',top2:'#6e6890',hi:'#8f88b0'},
  segs:[
   {w:70,hints:[[3,'darkFire'],[37,'fire']],build(L){ground(L,70);ceil(L,70);L.fill(0,0,0,11,'#');
     L.set(2,9,'P');L.set(6,9,'L');L.set(8,8,'C');L.set(9,8,'C');pitS(L,12,14);L.set(16,9,'L');
     L.set(19,9,'S');L.set(24,4,'V');L.set(27,9,'L');pitS(L,30,33);L.set(36,9,'S');
     L.fill(40,40,1,5,'#');L.fill(40,40,6,9,'T');L.set(43,9,'L');L.fill(44,45,7,7,'=');L.fill(46,47,5,5,'=');
     L.fill(49,58,4,9,'#');L.set(53,3,'L');L.set(56,2,'V');L.set(51,3,'C');L.set(52,3,'C');L.fill(60,68,10,11,'w');}},
   ROOM.r3,
   {w:19,hints:[[14,'bossNear']],build(L){ground(L,19);ceil(L,19);L.set(0,9,'S');L.fill(4,4,1,7,'#');L.set(4,8,'R');L.set(4,9,'R');L.set(7,9,'L');L.set(8,9,'K');L.set(10,4,'V');
     L.fill(12,12,1,7,'#');L.set(12,8,'D');L.set(12,9,'D');L.set(15,9,'L');L.set(17,9,'H');}},
   arenaSeg({extra(L){L.set(2,9,'L');L.set(21,9,'L');L.set(8,9,'L');}})
  ]},
 {code:'1-4',mobs:{S:['lizard'],V:['vulture']},name:'용의 유적',bg:'ruin',boss:'wyvern',
  pal:{seed:14,base:'#8a7258',d1:'#6e5a44',d2:'#a08668',stone:'#b8a07e',top1:'#c9a86a',top2:'#e8cf8e',hi:'#fff0c0'},
  segs:[
   {w:12,hints:[[2,'ruin']],build(L){ground(L,12);L.fill(0,0,0,11,'#');L.set(2,9,'P');L.set(5,8,'C');L.set(6,8,'C');L.set(8,9,'S');}},
   ROOM.r2,
   {w:20,build(L){ground(L,20);L.set(3,9,'S');L.set(7,4,'V');L.set(11,0,'#');L.fill(11,11,1,9,'T');L.set(15,9,'S');L.set(17,8,'C');}},
   {w:12,hints:[[0,'iceWall']],build(L){ground(L,12);L.fill(6,6,0,9,'i');L.set(9,9,'B');L.set(10,8,'C');}},
   {w:14,hints:[[6,'bossNear']],build(L){ground(L,14);L.set(3,9,'S');L.set(6,4,'V');L.set(9,9,'S');L.set(12,9,'H');}},
   arenaSeg({ceil:false})
  ]},
 {code:'1-5',mobs:{S:['crab','lizard'],V:['vulture']},name:'바위 협곡',bg:'canyon',boss:'scorpion',
  pal:{seed:21,base:'#8a4a32',d1:'#6e3a26',d2:'#a05a3e',stone:'#c07a52',top1:'#c9925a',top2:'#e8b47a',hi:'#ffd8a0'},
  segs:[
   {w:30,build(L){ground(L,30);L.fill(0,0,0,11,'#');L.set(2,9,'P');[5,6,7].forEach(x=>L.set(x,8,'C'));L.set(9,9,'S');L.set(12,9,'B');L.set(12,8,'B');L.set(16,9,'S');pitS(L,19,21);L.set(20,7,'C');L.set(24,4,'V');L.set(27,9,'S');}},
   {w:18,hints:[[5,'elec']],build(L){ground(L,18);L.set(1,9,'S');L.set(5,4,'V');L.set(11,9,'Z');L.fill(15,15,0,9,'G');L.set(13,8,'C');}},
   {w:22,build(L){ground(L,22);L.fill(4,6,10,11,'.');L.fill(9,11,7,7,'=');L.fill(13,15,10,11,'.');L.set(17,9,'S');L.set(19,4,'V');L.set(10,6,'C');}},
   {w:18,hints:[[0,'gen3']],links:[{type:'gens',gens:[[3,9],[8,6],[13,4]],gates:col(16,1,9),latch:true}],build(L){ground(L,18);L.set(16,0,'#');L.fill(16,16,1,9,'|');L.set(3,9,'Z');L.fill(7,9,7,9,'#');L.set(8,6,'Z');L.fill(13,13,0,3,'#');L.set(13,4,'Z');}},
   {w:16,hints:[[8,'bossNear']],build(L){ground(L,16);L.set(3,9,'S');L.set(7,4,'V');L.set(10,9,'B');L.set(13,9,'H');}},
   arenaSeg({ceil:false})
  ]},
 {code:'1-6',mobs:{S:['goat'],V:['harpy']},name:'바람의 절벽',bg:'sky',boss:'griffon',
  pal:{seed:27,base:'#5a6a7a',d1:'#4a5868',d2:'#6a7a8a',stone:'#8a9aaa',top1:'#7ac25a',top2:'#a8e07a',hi:'#d8ffb0'},
  segs:[
   {w:26,build(L){ground(L,26);L.fill(0,0,0,11,'#');L.set(2,9,'P');[4,5,6].forEach(x=>L.set(x,8,'C'));L.set(10,4,'V');L.set(13,9,'S');L.set(16,3,'V');pitS(L,18,20);L.set(23,9,'S');}},
   {w:22,hints:[[1,'treeClimb']],build(L){ground(L,22);L.set(4,10,'o');L.set(5,10,'o');L.fill(8,21,5,9,'#');[10,11,12].forEach(x=>L.set(x,4,'C'));L.set(15,4,'S');L.set(18,1,'V');}},
   {w:24,build(L){ground(L,24);L.fill(4,9,10,11,'.');L.fill(6,7,7,7,'=');[6,7].forEach(x=>L.set(x,6,'C'));L.set(12,9,'S');pitS(L,15,17);L.set(20,4,'V');}},
   {w:20,hints:[[0,'treeHigh']],build(L){ground(L,20);L.set(7,10,'o');L.fill(10,19,3,9,'#');L.set(14,2,'S');L.set(17,2,'C');L.set(18,2,'C');}},
   {w:14,hints:[[6,'bossNear']],build(L){ground(L,14);L.set(3,9,'S');L.set(6,4,'V');L.set(11,9,'H');}},
   arenaSeg({ceil:false})
  ]},
 {code:'1-7',mobs:{S:['fireslime'],V:['magmabat']},name:'용암 동굴',bg:'lava',boss:'worm',exitCol:13,
  pal:{seed:33,base:'#3a2a2e',d1:'#2a1e22',d2:'#4a3438',stone:'#6a4a48',top1:'#5a3a34',top2:'#8a4a3a',hi:'#ff8a3a'},
  segs:[
   {w:24,hints:[[1,'lava']],build(L){ground(L,24);ceil(L,24);L.fill(0,0,0,11,'#');L.set(2,9,'P');[4,5].forEach(x=>L.set(x,8,'C'));lavaP(L,8,9);L.set(12,9,'S');lavaP(L,15,17);L.set(16,7,'C');L.set(20,4,'V');}},
   {w:20,hints:[[0,'lavaRiver']],build(L){ground(L,20);ceil(L,20);lavaP(L,3,16);L.set(10,5,'V');[8,9,10].forEach(x=>L.set(x,7,'C'));}},
   {w:22,hints:[[1,'treeClimb']],build(L){ground(L,22);ceil(L,22);L.set(3,10,'o');L.set(4,10,'o');L.fill(7,21,4,9,'#');[9,10].forEach(x=>L.set(x,3,'C'));L.set(13,3,'S');L.set(17,3,'S');}},
   ROOM.r6,
   {w:18,hints:[[0,'twoMirror']],links:[{type:'lever',at:[2,9],mirrors:[[8,3]],on:false},{type:'crystal',at:[14,3],gates:col(17,1,9),latch:true}],
    build(L){ground(L,18);ceil(L,18);L.set(2,9,'v');L.set(8,9,'/');L.set(8,3,'\\');L.fill(12,16,2,2,'#');L.fill(12,16,4,4,'#');L.set(16,3,'#');L.set(14,3,'*');L.fill(17,17,1,9,'|');}},
   {w:14,hints:[[6,'bossNear']],build(L){ground(L,14);ceil(L,14);L.set(3,9,'S');lavaP(L,6,7);L.set(10,4,'V');L.set(12,9,'H');}},
   arenaSeg({plat:[[6,8,6],[15,17,6]],q:11,extra(L){lavaP(L,2,4);lavaP(L,19,21);}})
  ]},
 {code:'1-8',mobs:{S:['thorn','mushroom'],V:['bee']},name:'하늘 정원',bg:'garden',boss:'flower',
  pal:{seed:39,base:'#6a5a4a',d1:'#5a4a3a',d2:'#7a6a5a',stone:'#9a8a7a',top1:'#4fae5a',top2:'#7fd06a',hi:'#e8ffb0'},
  segs:[
   {w:24,hints:[[1,'garden']],build(L){ground(L,24);L.fill(0,0,0,11,'#');L.set(2,9,'P');[5,6,7].forEach(x=>L.set(x,8,'C'));L.set(8,9,'S');L.set(12,3,'V');L.fill(14,16,10,11,'.');L.set(20,9,'S');}},
   {w:14,hints:[[0,'crackWall']],build(L){ground(L,14);L.fill(9,9,0,9,'k');L.set(4,9,'S');L.set(12,8,'C');}},
   {w:22,build(L){ground(L,22);L.set(4,10,'o');L.fill(7,21,4,9,'#');[9,10,11].forEach(x=>L.set(x,3,'C'));L.set(12,3,'S');L.set(16,1,'V');L.set(19,3,'B');}},
   {w:14,hints:[[0,'quakePlate']],links:[{type:'plate',plates:[[5,9]],gates:col(11,1,9),latch:true}],build(L){ground(L,14);L.set(11,0,'#');L.fill(11,11,1,9,'|');L.set(5,5,'M');L.fill(4,6,6,6,'k');L.set(5,9,'_');}},
   {w:14,hints:[[6,'bossNear']],build(L){ground(L,14);L.set(3,9,'S');L.set(6,4,'V');L.set(9,9,'B');L.set(11,9,'H');}},
   arenaSeg({ceil:false,q:17,plat:[[4,6,6],[10,12,4]]})
  ]},
 {code:'1-9',mobs:{S:['archer'],V:['ghost']},name:'고대 신전',bg:'temple',dark:true,boss:'lich',
  pal:{seed:45,base:'#4a4258',d1:'#3a3448',d2:'#5a5268',stone:'#7a7290',top1:'#8a7a5a',top2:'#c9a86a',hi:'#ffe7a8'},
  segs:[
   {w:20,hints:[[1,'temple']],build(L){ground(L,20);ceil(L,20);L.fill(0,0,0,11,'#');L.set(2,9,'P');L.set(5,9,'L');L.set(9,9,'S');L.set(12,9,'L');L.set(15,4,'V');pitS(L,16,17);L.set(19,9,'L');}},
   {w:14,hints:[[0,'windmill']],links:[{type:'windmill',at:[5,3],gates:col(9,1,9),latch:true}],build(L){ground(L,14);L.set(9,0,'#');L.fill(9,9,1,9,'|');L.set(5,3,'W');L.set(2,9,'L');L.set(12,9,'L');}},
   {w:19,hints:[[0,'torch4']],links:[{type:'torch',torches:[[4,5],[7,2],[10,4],[13,6]],symbols:['sun','leaf','moon','star'],order:[1,3,2,0],gates:col(17,1,9),latch:true},{type:'tablet',at:[1,9],text:'석판: "잎이 돋고, 별이 지고, 달이 차오르면, 해가 뜬다"'}],
    build(L){ground(L,19);ceil(L,19);L.set(1,9,'r');L.set(3,9,'L');[[4,5],[7,2],[10,4],[13,6]].forEach(([x,y])=>L.set(x,y,'I'));L.fill(17,17,1,9,'|');}},
   {w:16,hints:[[0,'windPush']],links:[{type:'plate',plates:[[9,9]],gates:col(12,1,9),latch:true}],build(L){ground(L,16);L.set(0,9,'L');L.fill(1,2,7,7,'=');L.fill(3,4,5,5,'=');L.fill(6,8,5,9,'#');L.set(6,4,'^');L.set(7,4,'^');L.set(8,4,'M');L.set(9,9,'_');L.set(12,0,'#');L.fill(12,12,1,9,'|');L.set(14,9,'L');}},
   {w:16,hints:[[0,'windMirror']],links:[{type:'windmill',at:[6,1],mirrors:[[13,6]]},{type:'crystal',at:[13,1],gates:col(15,1,9),latch:true}],rows:[
    "################","......W.....#*#|","............#.#|","............#.#|","............#.#|","............#.#|",".............\\.|","...====......#.|","...............|","L..............|","################","################"]},
   {w:16,hints:[[0,'crackWall'],[10,'bossNear']],build(L){ground(L,16);ceil(L,16);L.set(4,9,'L');L.fill(8,8,1,9,'k');L.set(11,9,'S');L.set(13,9,'L');L.set(12,4,'V');L.set(14,9,'H');}},
   arenaSeg({extra(L){L.set(2,9,'L');L.set(21,9,'L');L.set(8,9,'L');}})
  ]},
 {code:'1-10',mobs:{S:['minigolem'],V:['crystalbat']},name:'골렘의 심장',bg:'core',boss:'golem',exitCol:21,
  pal:{seed:51,base:'#3a3a44',d1:'#2a2a34',d2:'#4a4a56',stone:'#5a5a6a',top1:'#4a6a4a',top2:'#6aa86a',hi:'#9affb0'},
  segs:[
   {w:16,hints:[[1,'charge'],[9,'trial']],build(L){ground(L,16);ceil(L,16);L.fill(0,0,0,11,'#');L.set(2,9,'P');L.set(6,9,'H');[9,10,11].forEach(x=>L.set(x,8,'C'));L.set(13,9,'S');L.set(10,4,'V');}},
   ROOM.r4,ROOM.r8,ROOM.r5,ROOM.r9,
   {w:16,hints:[[1,'boss']],build(L){ground(L,16);L.set(4,9,'H');L.set(8,9,'H');L.set(6,9,'S');L.set(10,4,'V');L.set(12,9,'S');[11,12,13].forEach(x=>L.set(x,8,'C'));}},
   arenaSeg()
  ]}
];
