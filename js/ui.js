// DOM UI: 토스트·오버레이·배지·스테이지 표시 (담당: core) — CONTRACT core/ui.js
(function (G) {
'use strict';

// 상수 데이터는 미리 꺼내 둔다 (먼저 로드되는 파일)
const ELEM = G.ELEM;

const $ = (id) => document.getElementById(id);

// ── 토스트 큐 ──
const queue = [];      // [{msg, ms}]
let timer = 0;         // 현재 표시 중인 토스트 타이머 id (0이면 표시 없음)

function showNext() {
  const el = $('toast');
  timer = 0;
  if (!el) { queue.length = 0; return; }
  const t = queue.shift();
  if (!t) { el.hidden = true; return; }
  el.textContent = t.msg;
  el.hidden = false;
  timer = setTimeout(showNext, t.ms);
}

/**
 * 하단 토스트. now=true면 큐를 무시하고 즉시 표시(지금 것을 밀어냄), 아니면 큐 뒤에 붙인다.
 * 같은 문구가 이미 대기 중이면 다시 넣지 않는다.
 */
function toast(msg, ms = 2000, now = false) {
  if (!msg) return;
  if (now) {
    if (timer) clearTimeout(timer);
    queue.unshift({ msg, ms });
    showNext();
    return;
  }
  if (queue.some((t) => t.msg === msg)) return;
  queue.push({ msg, ms });
  if (!timer) showNext();
}

/** 대기 중인 토스트를 모두 지우고 숨긴다 (스테이지 이동·다시 시작 때) */
function clearToasts() {
  queue.length = 0;
  if (timer) clearTimeout(timer);
  timer = 0;
  const el = $('toast');
  if (el) el.hidden = true;
}

/** 시작·게임오버·클리어 오버레이 표시 */
function showOverlay(title, text, hint) {
  const ov = $('overlay');
  if (!ov) return;
  const t = $('ov-title'), x = $('ov-text'), h = $('ov-hint');
  if (t) t.textContent = title || '';
  if (x) x.textContent = text || '';
  if (h) { h.textContent = hint || ''; h.hidden = !hint; }
  ov.hidden = false;
}

function hideOverlay() {
  const ov = $('overlay');
  if (ov) ov.hidden = true;
}

/** 속성 배지: "불 화살" + 속성 색 */
function setBadge(i) {
  const el = $('badge');
  const e = ELEM[i];
  if (!el || !e) return;
  el.textContent = e.name + ' 화살';
  el.style.setProperty('--c', e.col);
  el.style.color = e.col;
}

/** 스테이지 표시: "1-1 엘프의 숲" */
function setStage(code, name) {
  const el = $('stage');
  if (el) el.textContent = name ? `${code} ${name}` : String(code ?? '');
}

// ───────── 공개 ─────────
G.ui = { toast, clearToasts, showOverlay, hideOverlay, setBadge, setStage };
})(window.G = window.G || {});
