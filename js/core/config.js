// config.js — 화면 크기·타일·차지 시간 등 기본 상수, 캔버스, $() 헬퍼
// 모든 파일은 index.html의 <script> 순서대로 같은 전역 범위에서 실행됩니다.

const TS=16,VW=320,VH=192,ROWS=12,FULL=180,BOWFULL=120,CHARGED_CD=240;
const cv=document.getElementById('game'),ctx=cv.getContext('2d');
ctx.imageSmoothingEnabled=false;
const $=id=>document.getElementById(id);
let TOUCH=matchMedia('(hover:none) and (pointer:coarse)').matches,lastTouchTime=0;
