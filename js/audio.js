// WebAudio 효과음 (담당: core) — CONTRACT core/audio.js
// 첫 사용자 입력(input.js)에서 audioInit()이 불린 뒤에만 소리가 난다.
(function (G) {
'use strict';

// 상수 데이터는 미리 꺼내 둔다 (먼저 로드되는 파일)
const S = G.S;

let AC = null;
let master = null;
let noiseBuf = null;

/** 오디오 컨텍스트 생성(처음 한 번) 또는 일시정지 해제. 사용자 입력 핸들러 안에서 부를 것. */
function audioInit() {
  try {
    if (!AC) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      AC = new Ctx();
      master = AC.createGain();
      master.gain.value = S.flags.muted ? 0 : 0.6;
      master.connect(AC.destination);
      // 효과음용 백색 소음 0.5초
      noiseBuf = AC.createBuffer(1, Math.floor(AC.sampleRate * 0.5), AC.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      // iOS: 사용자 입력 안에서 무음을 한 번 재생해야 소리가 풀린다
      const s = AC.createBufferSource();
      s.buffer = AC.createBuffer(1, 1, AC.sampleRate);
      s.connect(AC.destination);
      s.start(0);
    }
    // suspended(자동재생 정책)·interrupted(iOS 전화·백그라운드 뒤) 모두 다시 켠다
    if (AC.state !== 'running' && AC.resume) AC.resume().catch(() => {});
  } catch (_) { AC = null; }
}

/** 소리 끄기·켜기. 새 음소거 상태(true = 꺼짐)를 반환 */
function toggleMute() {
  S.flags.muted = !S.flags.muted;
  if (master && AC) master.gain.setValueAtTime(S.flags.muted ? 0 : 0.6, AC.currentTime);
  return S.flags.muted;
}

/** 주파수 f1→f2로 미끄러지는 오실레이터 한 음 */
function tone(f1, f2, dur, type = 'square', vol = 0.06, delay = 0) {
  const t = AC.currentTime + delay;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f1, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

/** 필터 거친 소음 한 번 (물보라·부서짐·불) */
function noise(dur, freq, vol = 0.08, delay = 0, q = 1, type = 'bandpass') {
  const t = AC.currentTime + delay;
  const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  s.buffer = noiseBuf;
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(master);
  s.start(t);
  s.stop(t + dur + 0.02);
}

/** 효과음 20종 */
const SFX = {
  jump: () => tone(300, 620, 0.11, 'square', 0.04),
  slash: () => { noise(0.09, 2400, 0.07, 0, 0.8, 'highpass'); tone(700, 200, 0.08, 'triangle', 0.04); },
  bow: () => { tone(900, 260, 0.09, 'triangle', 0.06); noise(0.05, 3000, 0.03); },
  coin: () => { tone(988, 988, 0.06, 'square', 0.04); tone(1319, 1319, 0.12, 'square', 0.04, 0.06); },
  hurt: () => { tone(260, 70, 0.26, 'sawtooth', 0.07); noise(0.12, 600, 0.05); },
  dash: () => noise(0.16, 1400, 0.08, 0, 0.6),
  door: () => { tone(110, 90, 0.25, 'square', 0.05); tone(220, 330, 0.18, 'triangle', 0.04, 0.12); },
  hit: () => tone(320, 150, 0.07, 'square', 0.05),
  pick: () => [660, 880, 1175].forEach((f, i) => tone(f, f, 0.08, 'triangle', 0.06, i * 0.06)),
  crate: () => { noise(0.18, 500, 0.12, 0, 0.7); tone(180, 80, 0.12, 'square', 0.04); },
  kill: () => { tone(500, 80, 0.22, 'square', 0.05); noise(0.15, 900, 0.04); },
  swap: () => tone(520, 780, 0.06, 'triangle', 0.05),
  giant: () => { noise(0.35, 300, 0.14, 0, 0.5, 'lowpass'); tone(160, 40, 0.35, 'sawtooth', 0.07); },
  charged: () => [523, 784, 1046].forEach((f, i) => tone(f, f, 0.1, 'square', 0.04, i * 0.05)),
  freeze: () => { tone(1800, 2600, 0.15, 'sine', 0.05); tone(2400, 1600, 0.2, 'triangle', 0.03, 0.05); },
  fire: () => { noise(0.3, 700, 0.1, 0, 0.6, 'lowpass'); tone(200, 120, 0.2, 'sawtooth', 0.03); },
  zap: () => { tone(1200, 200, 0.12, 'sawtooth', 0.05); tone(900, 1500, 0.08, 'square', 0.03, 0.06); },
  grow: () => [392, 494, 587, 784].forEach((f, i) => tone(f, f * 1.05, 0.09, 'triangle', 0.05, i * 0.07)),
  light: () => { tone(1046, 1568, 0.25, 'sine', 0.05); tone(1568, 2093, 0.3, 'sine', 0.03, 0.08); },
  splash: () => noise(0.28, 1100, 0.1, 0, 0.5),
};

/** 효과음 재생. 오디오가 아직 꺼져 있거나 음소거면 무시 */
function sfx(name) {
  if (!AC || S.flags.muted) return;
  const f = SFX[name];
  if (!f) return;
  try { f(); } catch (_) { /* 소리 실패는 게임을 멈추지 않는다 */ }
}

// ───────── 공개 ─────────
G.audio = { audioInit, toggleMute, sfx };
})(window.G = window.G || {});
