// mobs2.js — 시즌 2 잡몹 22종 (초원 → 마계). 시즌 1보다 체력이 높고 빠르며, 하늘 몹도 투사체를 쏜다
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ---------- 시즌 2 전용 모양 ---------- */
const WOLFROWS=[["...........kk...","..........kwwk..","k........kwwwwkk","kk......kwwkwwwk",".kkkkkkkkwwwwwk.","..kwwwwwwwwwkk..","..kwwwwwwwwwk...","..kwwWWWWwwwk...","..kwk.kwk.kwk...","..kk..kk..kk...."],
                ["...........kk...","..........kwwk..","k........kwwwwkk","kk......kwwkwwwk",".kkkkkkkkwwwwwk.","..kwwwwwwwwwkk..","..kwwwwwwwwwk...","..kwwWWWWwwwk...",".kwk..kwk..kwk..",".kk...kk...kk..."]];
const IMPROWS=[["k........k","kk.kkkk.kk","kwkrrrrkwk",".kwryyrwk.","..krrrrk..","..krkkrk..","...krrk...","..krrrrk..","...k..k...",".........."],
               ["..........","..kkkkkk..","..krrrrk..",".kkryyrkk.","kwwrrrrwwk","kw.krkk.wk","k...krrk.k","...krrrrk.","....k..k..",".........."]];
const KNIGHTROWS=["...k....k...","...kk..kk...","....kkkk....","...kaaaak...","...kaeeak...","...kaaaak...","..kkkkkkkk..",".kaaAaaAaak.","kaakaaaakaak","kaakaaaakaak",".kkkaaaakkk.","...kkkkkk...","...kaakaak..","...kaakaak..","...kaakaak..","..kkk..kkk.."];
const ENTROWS=["..kk.kk.kk..",".kggkggkggk.","kgggggggggk.",".kgggggggk..","..kbbbbbk...","..kbybybk...","..kbbbbbk...","..kbkkkbk...","kkkbbbbbkkk.","k..kbbbk..k.","...kbbbk....","...kbbbk....","..kbbbbbk...",".kbk.k.kbk..","kbk..k..kbk.","kk...k...kk."];
const MUSHROWS=["...kkkkkk...",".kkrrwwrrkk.","krrwwrrrrwrk","krrrrrrwwrrk","kkkkkkkkkkkk","..kssssssk..","..kskssksk..","..kssssssk..","..kssssssk..","..kssssssk..","..kkk..kkk..","..kfk..kfk.."];
const CRABROWS=["kk..........kk","krk........krk",".kkk.kkkk.kkk.","...krrrrrrk...","..krrwkkwrrk..","..krrrrrrrrk..","...kRRRRRRk...","..k.k.kk.k.k..",".k..k....k..k.",".............."];
const BEEROWS=[[".kk..kk.","kwwkkwwk",".kyykyk.","kykyykyk",".kyykyk.","..k..k.."],["........","kwwkkwwk",".kyykyk.","kykyykyk",".kyykyk.","..k..k.."]];
const GHROWS=[["...kkkk...","..kwwwwk..",".kwwwwwwk.",".kwkwwkwk.",".kwkwwkwk.",".kwwwwwwk.",".kwwkkwwk.",".kwwwwwwk.",".kwwwwwwk.",".kwwwwwwk.",".kwkwwkwk.","..k.kk.k.."],
              ["...kkkk...","..kwwwwk..",".kwwwwwwk.",".kwkwwkwk.",".kwkwwkwk.",".kwwwwwwk.",".kwwkkwwk.",".kwwwwwwk.",".kwwwwwwk.",".kwwwwwwk.",".kkwwkwwk.","...k..k..."]];
const GOLROWS=["....kkkkkk....","...kssssssk...","...ksGssGsk...","...kssssssk...",".kkkkkkkkkkkk.","ksskssssssksk.","ksskssGGssksk.","ksskssGGssksk.","kkkkssssssskk.","...kssssssk...","...kkkkkkkk...","...kss..ssk...","...kss..ssk...","...kkk..kkk..."];

Object.assign(MOBS,{
 // 2-1 바람의 초원
 wolf:{base:'slime',w:16,h:10,hp:5,spd:.8,charge:1,col:'#9a96a8',name:'들늑대',fr:WOLFROWS.map(r=>vs(r,{k:'#1a1626',w:'#9a96a8',W:'#d8d4e0'}))},
 hawk:{base:'bat',w:14,h:8,hp:4,spd:1.3,dive:1,col:'#a0703a',fr:VULROWS.map(r=>vs(r,{k:'#1a1008',b:'#a0703a',w:'#f4ecd8',y:'#ffd34d'}))},
 // 2-2 꽃가루 언덕
 toxshroom:{base:'slime',w:12,h:12,hp:5,spd:.55,hop:70,shoot:{mode:'lob',cd:120,look:'poison'},col:'#a85ad8',fr:[vs(MUSHROWS,{k:'#1a0a20',r:'#a85ad8',w:'#e8ff7a',s:'#e0d0f0',f:'#5a3a6a'})]},
 hornet:{base:'bat',w:8,h:6,hp:3,spd:2,col:'#ff8a2a',fr:BEEROWS.map(r=>vs(r,{k:'#1a0806',w:'#ffe8d8',y:'#ff8a2a'}))},
 // 2-3 황혼의 강
 rivercrab:{base:'slime',w:14,h:10,hp:8,spd:.7,col:'#3a8ad8',fr:[vs(CRABROWS,{k:'#06142a',r:'#3a8ad8',R:'#1a5aa0',w:'#ffffff'})]},
 dragonfly:{base:'bat',w:10,h:6,hp:4,spd:1.5,dive:1,col:'#3ad8b0',fr:BTROWS.map(r=>vs(r,{k:'#062a20',p:'#3ad8b0',P:'#1a8a6a',e:'#ffd34d'}))},
 // 2-4 안개 늪
 bogslime:{base:'slime',w:12,h:8,hp:6,spd:.6,shoot:{mode:'lob',cd:130,look:'poison'},col:'#6a8a3a',fr:SLROWS.map(r=>vs(r,{k:'#141a06',g:'#6a8a3a',G:'#4a5a2a',w:'#e8ff7a'}))},
 mosquito:{base:'bat',w:10,h:6,hp:3,spd:1.4,dive:1,col:'#8a8a9a',fr:BTROWS.map(r=>vs(r,{k:'#14141a',p:'#8a8a9a',P:'#5a5a6a',e:'#ff3b3b'}))},
 // 2-5 시든 숲
 rotent:{base:'slime',w:12,h:16,hp:9,spd:.3,shoot:{mode:'shot',cd:100,look:'seed',spd:2.8},col:'#7a6a4a',fr:[vs(ENTROWS,{k:'#140e06',g:'#5a6a2a',b:'#6a5232',y:'#ff5a3a'})]},
 crow:{base:'bat',w:14,h:8,hp:4,spd:1.3,dive:1,col:'#3a3448',fr:VULROWS.map(r=>vs(r,{k:'#06040a',b:'#3a3448',w:'#5a5468',y:'#ffd34d'}))},
 // 2-6 잿빛 황야
 skelwarrior:{base:'slime',w:10,h:16,hp:8,spd:.6,charge:1,col:'#e8e0d0',fr:[vs(SKROWS,{k:'#2a2420',w:'#e8e0d0'})]},
 vulture2:{base:'bat',w:14,h:8,hp:5,spd:1.2,dive:1,col:'#6a5a4a',fr:VULROWS.map(r=>vs(r,{k:'#140e08',b:'#6a5a4a',w:'#d8c8b0',y:'#c9a24a'}))},
 // 2-7 마계의 문
 hellhound:{base:'slime',w:16,h:10,hp:8,spd:.8,charge:1,trail:'#ff6a1a',col:'#4a1a1a',fr:WOLFROWS.map(r=>vs(r,{k:'#0a0204',w:'#7a3a3a',W:'#ffb03a'}))},
 imp:{base:'bat',w:10,h:10,hp:5,spd:1.1,shoot:{mode:'shot',cd:130,look:'fire',spd:2.6},col:'#d6423a',fr:IMPROWS.map(r=>vs(r,{k:'#1a0406',r:'#d6423a',y:'#ffd34d',w:'#7a2a3a'}))},
 // 2-8 불꽃 협곡
 magmagolem:{base:'slime',w:14,h:14,hp:11,spd:.4,shoot:{mode:'lob',cd:140,look:'glob'},trail:'#ff8a2a',col:'#5a3028',fr:[vs(GOLROWS,{k:'#1a0806',s:'#5a3028',G:'#ff8a2a'})]},
 fireimp:{base:'bat',w:10,h:10,hp:5,spd:1.3,shoot:{mode:'shot',cd:110,look:'fire',spd:2.8},trail:'#ff8a2a',col:'#ff8a2a',fr:IMPROWS.map(r=>vs(r,{k:'#2a0a04',r:'#ff8a2a',y:'#fff0a0',w:'#d6423a'}))},
 // 2-9 뼈의 다리
 skelsniper:{base:'slime',w:10,h:16,hp:7,spd:.45,shoot:{mode:'shot',cd:100,look:'bone',spd:3.8},col:'#d8c8ff',fr:[vs(SKROWS,{k:'#1a0a2a',w:'#d8c8ff'})]},
 wraith:{base:'bat',w:10,h:12,hp:6,spd:.9,ghost:1,shoot:{mode:'shot',cd:150,look:'shadow',spd:1.8},col:'#c83a5a',fr:GHROWS.map(r=>vs(r,{k:'#2a0614',w:'#c83a5a'}))},
 // 2-10 피의 호수
 bloodslime:{base:'slime',w:12,h:8,hp:8,spd:.65,shoot:{mode:'lob',cd:120,look:'blood'},col:'#b81a2a',fr:SLROWS.map(r=>vs(r,{k:'#1a0204',g:'#b81a2a',G:'#6a0a14',w:'#ffb0b8'}))},
 demonbat:{base:'bat',w:10,h:6,hp:5,spd:1.6,col:'#5a1a5a',fr:BTROWS.map(r=>vs(r,{k:'#0a020a',p:'#5a1a5a',P:'#2a0a2a',e:'#ff2a2a'}))},
 // 2-11 마왕성
 demonknight:{base:'slime',w:12,h:16,hp:14,spd:.6,charge:1,col:'#3b3550',fr:[vs(KNIGHTROWS,{k:'#07040c',a:'#3b3550',A:'#6a648a',e:'#ff2a2a'})]},
 gargoyle:{base:'bat',w:14,h:8,hp:8,spd:1.2,dive:1,col:'#6e6a7a',fr:VULROWS.map(r=>vs(r,{k:'#120f1c',b:'#6e6a7a',w:'#9a94a8',y:'#ff2a2a'}))}
});
