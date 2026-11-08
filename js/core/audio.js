// audio.js — WebAudio 효과음
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

/* ================= audio ================= */
let AC=null;
function audioInit(){
  if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();
    // iOS: 사용자 입력 안에서 무음을 한 번 재생해야 소리가 풀린다
    const s=AC.createBufferSource();s.buffer=AC.createBuffer(1,1,AC.sampleRate);s.connect(AC.destination);s.start(0);}catch(e){}}
  // suspended(자동재생 정책)·interrupted(iOS 전화·백그라운드 뒤) 모두 다시 켠다
  if(AC&&AC.state!=='running'&&AC.resume)AC.resume().catch(()=>{});
}
const SFX={jump:['square',320,640,.08],slash:['sawtooth',900,180,.09],coin:['square',990,1560,.09],hurt:['square',240,70,.2],
  dash:['triangle',180,520,.12],door:['square',140,330,.25],hit:['square',520,110,.08],pick:['triangle',660,1320,.18],crate:['sawtooth',300,80,.12],kill:['square',400,60,.18],
  bow:['triangle',700,300,.08],bowBig:['sawtooth',300,1200,.3],swap:['square',600,900,.05],giant:['sawtooth',120,40,.45],charged:['triangle',500,1500,.25],freeze:['sine',1800,900,.2],
  fire:['sawtooth',200,600,.2],zap:['square',1400,200,.15],grow:['triangle',220,880,.35],light:['sine',880,1760,.3],splash:['sine',400,120,.15],
  push:['triangle',90,70,.12],thunder:['sawtooth',90,30,.5],roar:['sawtooth',160,70,.6],solve:['triangle',523,1046,.4],wrong:['square',200,100,.3],fizz:['sawtooth',2000,600,.2],cut:['square',900,300,.12],seal:['sine',600,1400,.4],clank:['square',1500,900,.08],screech:['sawtooth',1900,700,.35],rumble:['sawtooth',60,30,.7],gate:['square',90,60,.4],boom:['sawtooth',180,40,.4],golem:['triangle',110,220,.3]};
function sfx(n){if(!AC||muted)return;try{const s=SFX[n],t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=s[0];o.connect(g);g.connect(AC.destination);
  o.frequency.setValueAtTime(s[1],t);o.frequency.exponentialRampToValueAtTime(s[2],t+s[3]);g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.001,t+s[3]);o.start(t);o.stop(t+s[3]+.03);}catch(e){}}
