// sw.js — 오프라인 캐시 (웹에서 설치형 앱으로 쓸 때). 파일이 바뀌면 VER을 올린다.
const VER='pk-v3';
const FILES=['./','index.html','거석상 아르리스.html','manifest.webmanifest','css/style.css',
 'js/core/config.js','js/gfx/sprite-helpers.js','js/data/elements.js','js/gfx/characters.js','js/data/mobs.js','js/data/mobs2.js','js/gfx/creatures.js','js/gfx/tiles.js',
 'js/data/map-helpers.js','js/data/hints.js','js/data/rooms.js','js/data/levels.js','js/data/levels2.js','js/core/state.js','js/core/input.js','js/core/audio.js','js/core/ui.js',
 'js/world/physics.js','js/entities/particles.js','js/world/effects.js','js/world/puzzles.js','js/entities/combat.js','js/entities/arrows.js','js/entities/summons.js',
 'js/entities/bosses.js','js/entities/bosses2.js','js/entities/interaction.js','js/entities/player.js','js/gfx/font.js','js/gfx/background.js','js/gfx/draw-world.js',
 'js/gfx/draw-actors.js','js/gfx/draw-bosses.js','js/gfx/draw-bosses2.js','js/gfx/draw-summons.js','js/gfx/lighting.js','js/gfx/renderer.js','js/gfx/ending.js','js/gfx/ending2.js',
 'js/gfx/season3.js','js/main.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VER).then(c=>c.addAll(FILES.map(f=>encodeURI(f)))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
// 먼저 네트워크(최신), 안 되면 캐시 — 글꼴 등 다른 사이트 파일도 한 번 받으면 저장
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok){const cp=r.clone();caches.open(VER).then(c=>c.put(e.request,cp));}return r;})
    .catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
