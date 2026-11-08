// mobs.js — 스테이지별 잡몹 17종 (스프라이트·체력·속도·공격 방식)
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ---------- themed mobs (base: 'slime' = walker, 'bat' = flyer) ---------- */
const SLROWS=[["....kkkk....","..kkggggkk..",".kggggggggk.",".kgwkgggwkk.","kggkkgggkkgk","kgggggggggGk","kGgggggggGGk",".kkkkkkkkkk."],["............","...kkkkkk...",".kkggggggkk.","kggwkgggwkgk","kgggkgggkggk","kgggggggggGk","kGGgggggGGGk",".kkkkkkkkkk."]];
const BTROWS=[["k....kk....k","kpk.kppk.kpk","kppkpeepkppk",".kppppppppk.","..kPppppPk..","...kPPPPk...","....kkkk...."],["....kkkk....","...kpeepk...",".kkppppppkk.","kppPppppPppk","kpk.kPPk.kpk","k....kk....k","............"]];
const vs=(rows,pal)=>variants(sprite(rows,pal));
const VULROWS=[["k............k","kbk...kk...kbk","kbbk.kwwk.kbbk",".kbbkkwkkkbbk.","..kbbbbbbbbk..","...kbbbbbbk...","....kyykk.....","....k..k......"],["......kk......",".....kwwk.....","..kkkkwkkkkk..",".kbbbbbbbbbbk.","kbbkbbbbbbkbbk","kbk.kbbbbk.kbk","k...kyykk...k.","....k..k......"]];
const SKROWS=["...kkkk...","..kwwwwk..","..kwkwkk..","..kwwwwk..","...kwkk...","..kkwwkk..",".kwkwwkwk.",".k.kwwk.k.","...kwwk...","...kkkk...","...kwwk...","..kw..wk..","..kw..wk..","..kw..wk..",".kkw..wkk.",".kkk..kkk."];
const MOBS={
 mushroom:{base:'slime',w:12,h:12,hp:3,spd:.5,hop:90,col:'#e8413b',name:'버섯',fr:[vs(["...kkkkkk...",".kkrrwwrrkk.","krrwwrrrrwrk","krrrrrrwwrrk","kkkkkkkkkkkk","..kssssssk..","..kskssksk..","..kssssssk..","..kssssssk..","..kssssssk..","..kkk..kkk..","..kfk..kfk.."],{k:'#2a1010',r:'#e8413b',w:'#fff6e0',s:'#f3e0c0',f:'#7a4f2b'})]},
 iceslime:{base:'slime',w:12,h:8,hp:3,spd:.65,col:'#9fe0ff',fr:SLROWS.map(r=>vs(r,{k:'#14243a',g:'#9fe0ff',G:'#5aa8c8',w:'#ffffff'}))},
 miner:{base:'slime',w:10,h:16,hp:3,spd:.55,shoot:{mode:'lob',cd:130,look:'pick'},col:'#e8e0d0',fr:[vs(["..kkkkkk..",".kyyLyyyk."].concat(SKROWS.slice(2)),{k:'#2a2420',w:'#e8e0d0',y:'#ffd34d',L:'#fff6c8'})]},
 lizard:{base:'slime',w:16,h:8,hp:3,spd:.75,shoot:{mode:'shot',cd:140,look:'fire',spd:2.6},col:'#e8783a',fr:[vs(["..........kkk...",".........kgggk..","kk......kggkgkk.","kgkkkkkkggggggk.",".kggggggggggkk..",".kgggGGGGgggk...","..kgk.kgk.kgk...","..kk..kk..kk...."],{k:'#2a1008',g:'#e8783a',G:'#ffd38a'})]},
 crab:{base:'slime',w:14,h:10,hp:5,spd:.6,col:'#d65a3a',fr:[vs(["kk..........kk","krk........krk",".kkk.kkkk.kkk.","...krrrrrrk...","..krrwkkwrrk..","..krrrrrrrrk..","...kRRRRRRk...","..k.k.kk.k.k..",".k..k....k..k.",".............."],{k:'#2a0a06',r:'#d65a3a',R:'#a03a20',w:'#ffffff'})]},
 goat:{base:'slime',w:14,h:11,hp:4,spd:.45,charge:1,col:'#e8e2d0',fr:[vs(["..........k.k.",".........kwkwk","........kwwwwk","........kwkwwk","kk......kwwww.","kwkkkkkkwwwk..",".kwwwwwwwwwk..",".kwwwwwwwwk...","..kwk..kwk....","..kwk..kwk....","..kkk..kkk...."],{k:'#2a2420',w:'#e8e2d0'})]},
 fireslime:{base:'slime',w:12,h:8,hp:3,spd:.5,shoot:{mode:'lob',cd:160,look:'glob'},trail:'#ff8a2a',col:'#ff8a2a',fr:SLROWS.map(r=>vs(r,{k:'#2a0a08',g:'#ff8a2a',G:'#d6423a',w:'#fff0a0'}))},
 thorn:{base:'slime',w:12,h:14,hp:3,spd:0,shoot:{mode:'shot',cd:110,look:'seed',spd:2.4},col:'#e85a8a',fr:[vs(["...kk..kk...","..kppkkppk..",".kppppppppk.",".kpykkkkypk.",".kppkwwkppk.","..kppkkppk..","...kkggkk...","....kgk.....","..kkkgkkk...",".kgggggggk..","..kk.gk.kk..",".....gk.....","....kggk....","...kkkkkk..."],{k:'#1a0a10',p:'#e85a8a',y:'#ffd34d',w:'#ffffff',g:'#3f9a4a'})]},
 archer:{base:'slime',w:10,h:16,hp:4,spd:.4,shoot:{mode:'shot',cd:120,look:'sting',spd:3.4},col:'#c8b8ff',fr:[vs(SKROWS,{k:'#1a1226',w:'#c8b8ff'})]},
 minigolem:{base:'slime',w:14,h:14,hp:6,spd:.35,col:'#8e8a9e',fr:[vs(["....kkkkkk....","...kssssssk...","...ksGssGsk...","...kssssssk...",".kkkkkkkkkkkk.","ksskssssssksk.","ksskssGGssksk.","ksskssGGssksk.","kkkkssssssskk.","...kssssssk...","...kkkkkkkk...","...kss..ssk...","...kss..ssk...","...kkk..kkk..."],{k:'#1a1626',s:'#7a7488',G:'#3aff7a'})]},
 icebat:{base:'bat',w:10,h:6,hp:2,spd:1,col:'#9fe0ff',fr:BTROWS.map(r=>vs(r,{k:'#0a1a2a',p:'#9fe0ff',P:'#5aa8c8',e:'#ffffff'}))},
 vulture:{base:'bat',w:14,h:8,hp:3,spd:.9,col:'#8a6a3a',fr:VULROWS.map(r=>vs(r,{k:'#1a1208',b:'#8a6a3a',w:'#e8d8c0',y:'#ffd34d'}))},
 harpy:{base:'bat',w:14,h:8,hp:3,spd:1,dive:1,col:'#7a8aba',fr:VULROWS.map(r=>vs(r,{k:'#121a2a',b:'#7a8aba',w:'#f3cfa0',y:'#ffd34d'}))},
 magmabat:{base:'bat',w:10,h:6,hp:2,spd:1.1,trail:'#ff8a2a',col:'#d6423a',fr:BTROWS.map(r=>vs(r,{k:'#1a0806',p:'#d6423a',P:'#8a2a10',e:'#ffd34d'}))},
 bee:{base:'bat',w:8,h:6,hp:1,spd:1.6,col:'#ffd34d',fr:[vs([".kk..kk.","kwwkkwwk",".kyykyk.","kykyykyk",".kyykyk.","..k..k.."],{k:'#1a1208',w:'#e8f8ff',y:'#ffd34d'}),vs(["........","kwwkkwwk",".kyykyk.","kykyykyk",".kyykyk.","..k..k.."],{k:'#1a1208',w:'#e8f8ff',y:'#ffd34d'})]},
 ghost:{base:'bat',w:10,h:12,hp:3,spd:.8,ghost:1,col:'#e8f0ff',fr:[vs(["...kkkk...","..kwwwwk..",".kwwwwwwk.",".kwkwwkwk.",".kwkwwkwk.",".kwwwwwwk.",".kwwkkwwk.",".kwwwwwwk.",".kwwwwwwk.",".kwwwwwwk.",".kwkwwkwk.","..k.kk.k.."],{k:'#3a3a6a',w:'#e8f0ff'}),vs(["...kkkk...","..kwwwwk..",".kwwwwwwk.",".kwkwwkwk.",".kwkwwkwk.",".kwwwwwwk.",".kwwkkwwk.",".kwwwwwwk.",".kwwwwwwk.",".kwwwwwwk.",".kkwwkwwk.","...k..k..."],{k:'#3a3a6a',w:'#e8f0ff'})]},
 crystalbat:{base:'bat',w:10,h:6,hp:3,spd:1.1,col:'#3ab07a',fr:BTROWS.map(r=>vs(r,{k:'#0a1a10',p:'#3ab07a',P:'#1a6a4a',e:'#9affb0'}))}
};
let mobPick={S:0,V:0};
function pickMob(ch){const m=lvl&&lvl.mobs&&lvl.mobs[ch];if(!m)return null;const s=m[mobPick[ch]%m.length];mobPick[ch]++;return s==='slime'||s==='bat'?null:s;}
