"use strict";
// Home (hero) page polish and the themed notification banner (toast).
// Hero rules are scoped by [data-phase="hero"] so the chat phase keeps its own
// composer scrim. The toast is the core primitive portalled to <body>
// (div[role="alert"] with CSS-module classes _toast_/_icon_/_text_/_action_);
// it is restyled only, never restructured, because React owns its children.
// Selectors carry two :not(#id) guards so they outrank chrome.js.

const svgUrl = (body) => 'url("data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' + body + '</svg>') + '")';
const SEND = svgUrl('<path fill="#000" d="M12 2.6 20.6 11.4H15.2V21.4H8.8V11.4H3.4z"/>');

const K = 'html[data-aemeath][data-ae-skin]';
const C = 'html[data-aemeath][data-ae-skin][data-ae-chrome]:not([style*="color-scheme: light"])';
const X = ':not(#ae-h1):not(#ae-h2)';
const HERO = C + ' [data-phase="hero"]';
const CARD = C + ' [data-composer-card]';
const T = K + ' body > div[role="alert"][class*="_toast_"]' + X;
const TL = 'html[data-aemeath][data-ae-skin][style*="color-scheme: light"] body > div[role="alert"][class*="_toast_"]' + X;

function buildHeroCss() {
  return `
/* ================= hero: open stage instead of the chat scrim ================= */
${HERO} [data-composer-seat]${X}{background:none !important;-webkit-backdrop-filter:none !important;backdrop-filter:none !important}

/* empty stats rail renders as a hollow bar: hide it until it has content */
${C} [data-composer-card] ~ [data-composer-dock]:not(:has(*))${X}{display:none !important}

/* input: no permanent scrollbar on touch; thin rail on hover for mouse users */
${CARD} [data-input-scroll]${X}{scrollbar-width:none !important}
${CARD} [data-input-scroll]${X}::-webkit-scrollbar{display:none}
@media (hover:hover) and (pointer:fine){${CARD} [data-input-scroll]:hover${X}{scrollbar-width:thin !important;scrollbar-color:rgba(var(--ae-pink-rgb),.4) transparent !important}}

/* tool strip clips overflow: give the + gem's glow room instead of a square halo */
${CARD} [class*="_tools"]${X}{padding:6px !important;margin:-6px !important}

/* send: solid block arrow (reads at a glance), clear idle state */
${CARD} button[class*="_primary"]:not([aria-label*="停止"])${X}::before{width:18px !important;height:18px !important;margin:-9px 0 0 -9px !important;
  -webkit-mask:${SEND} center/contain no-repeat !important;mask:${SEND} center/contain no-repeat !important}
${CARD} button[class*="_primary"]${X}{corner-shape:round}
${CARD} button[class*="_primary"]:disabled${X}{color:rgba(255,214,236,.55) !important;
  background:linear-gradient(160deg,rgba(255,255,255,.10),rgba(var(--ae-violet-rgb),.12)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.30),inset 0 1px 0 rgba(255,255,255,.10) !important}

/* workspace + mode chips: rounded glass plates matching the composer */
${HERO} [class*="wSkVaW_heroWorkspaceRow"]${X}{gap:0 !important;margin-bottom:4px !important}
${HERO} [class*="wSkVaW_heroWorkspaceRow"] button[class*="pXSMma_workspace"]${X}{margin-right:8px !important}
${HERO} :is(button[class*="pXSMma_workspace"],button[class*="cubgiG_seat"])${X}{height:32px !important;min-height:32px !important;padding:0 12px 0 10px !important;gap:6px !important;
  border:0 !important;border-radius:12px !important;font-size:13px !important;font-weight:600 !important;letter-spacing:.3px;color:#f3e9fb !important;
  background:linear-gradient(125deg,rgba(var(--ae-pink-rgb),.16),rgba(var(--ae-plum2-rgb),.74) 55%,rgba(var(--ae-cyan-rgb),.08)) !important;
  -webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.32),inset 0 1px 0 rgba(255,255,255,.10),0 4px 12px -6px rgba(0,0,0,.6) !important}
${HERO} button[class*="pXSMma_workspace"]${X} svg{color:var(--ae-cyan) !important}
${HERO} :is(button[class*="pXSMma_workspace"],button[class*="cubgiG_seat"])${X}:active{transform:scale(.97);background:rgba(var(--ae-pink-rgb),.22) !important}

/* collapse handle on the home stage: quiet ghost, not a second call to action */
${HERO} [data-mobile-nav="composer-toggle"]${X}{height:26px !important;min-height:26px !important;line-height:26px !important;margin-top:2px !important;
  font-size:11.5px !important;font-weight:500 !important;color:rgba(240,221,248,.66) !important;
  background:rgba(var(--ae-plum2-rgb),.32) !important;box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.16) !important}

/* ================= toast: starlight glass banner ================= */
${T}{z-index:9000 !important;gap:10px !important;padding:9px 14px 11px 9px !important;max-width:min(460px,calc(100vw - 24px)) !important;
  border-radius:16px !important;overflow:hidden;color:#f7f0ff !important;font-size:14px !important;line-height:22px !important;letter-spacing:.2px;
  background:radial-gradient(120% 160% at 0% 0%,rgba(var(--ae-pink-rgb),.24),transparent 56%),radial-gradient(120% 160% at 100% 100%,rgba(var(--ae-cyan-rgb),.16),transparent 60%),
    linear-gradient(170deg,rgba(var(--ae-plum2-rgb),.95),rgba(var(--ae-plum-rgb),.97)) !important;
  -webkit-backdrop-filter:blur(16px) saturate(1.3);backdrop-filter:blur(16px) saturate(1.3);
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.44),inset 0 1px 0 rgba(255,255,255,.14),0 14px 34px -12px rgba(0,0,0,.85),0 0 28px -10px rgba(var(--ae-pink-rgb),.6) !important;
  animation:ae-toast-in .34s cubic-bezier(.2,.9,.25,1.12) both,ae-toast-out .42s ease-in var(--dsh-toast-hold,3s) forwards !important}
${T}::before{content:"";position:absolute;left:18px;right:18px;top:0;height:1.5px;border-radius:2px;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(var(--ae-pink-rgb),.9) 26%,rgba(255,255,255,.75) 50%,rgba(var(--ae-cyan-rgb),.9) 74%,transparent)}
${T}::after{content:"";position:absolute;left:16px;right:16px;bottom:4px;height:2px;border-radius:2px;pointer-events:none;opacity:.8;transform-origin:left center;
  background:linear-gradient(90deg,var(--ae-pink),rgba(255,255,255,.8),var(--ae-cyan));animation:ae-toast-count var(--dsh-toast-hold,3s) linear forwards}
${T} > [class*="_icon_"]{width:28px !important;height:28px !important;border-radius:50% !important;corner-shape:round;overflow:hidden;flex:none;color:rgb(var(--ae-gold-rgb,255,203,107)) !important;
  background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.24),rgba(var(--ae-gold-rgb,255,203,107),.14) 62%);
  box-shadow:inset 0 0 0 1px rgba(var(--ae-gold-rgb,255,203,107),.5),0 0 12px -3px rgba(var(--ae-gold-rgb,255,203,107),.6)}
${T} > [class*="_icon_"][class*="_success_"]{color:var(--ae-cyan) !important;
  background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.26),rgba(var(--ae-cyan-rgb),.16) 62%);
  box-shadow:inset 0 0 0 1px rgba(var(--ae-cyan-rgb),.55),0 0 12px -3px rgba(var(--ae-cyan-rgb),.7)}
${T} > [class*="_icon_"] svg{width:16px !important;height:16px !important}
${T} > [class*="_text_"]{min-width:0}
${T} [class*="_action_"]{position:relative;display:inline-block !important;vertical-align:baseline;margin:0 4px !important;padding:0 11px !important;
  border-radius:999px !important;corner-shape:round;line-height:24px !important;font-size:13px !important;font-weight:700 !important;letter-spacing:.5px;color:#fff !important;
  background:linear-gradient(135deg,rgba(255,255,255,.3),rgba(255,255,255,0) 45%),linear-gradient(135deg,var(--ae-pink),rgba(var(--ae-violet-rgb),1)) !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 0 10px -2px rgba(var(--ae-pink-rgb),.75) !important;-webkit-tap-highlight-color:transparent}
${T} [class*="_action_"]::before{content:"";position:absolute;inset:-10px -4px}
${T} [class*="_action_"] ~ [class*="_action_"]{padding:0 2px !important;font-weight:600 !important;letter-spacing:.2px;color:var(--ae-cyan) !important;
  background:none !important;box-shadow:none !important;text-decoration:underline;text-decoration-color:rgba(var(--ae-cyan-rgb),.5);text-underline-offset:4px}
${T} [class*="_action_"]:active{transform:scale(.95);opacity:1 !important}
${T} [class*="_action_"]:focus-visible{outline:2px solid var(--ae-cyan) !important;outline-offset:2px}
@media (max-width:760px){
  ${T}{top:auto !important;bottom:calc(env(safe-area-inset-bottom,0px) + 20px) !important;
    animation:ae-toast-in-b .34s cubic-bezier(.2,.9,.25,1.12) both,ae-toast-out-b .42s ease-in var(--dsh-toast-hold,3s) forwards !important}
}
@media (prefers-reduced-motion:reduce){
  ${T}{animation:ae-toast-fade .42s ease var(--dsh-toast-hold,3s) forwards !important}
}
${TL}{color:#3a1d3f !important;background:linear-gradient(170deg,rgba(255,250,253,.96),rgba(255,239,248,.96)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.4),0 12px 30px -12px rgba(120,40,90,.45) !important}
${TL} [class*="_action_"] ~ [class*="_action_"]{color:#b0337a !important}
@keyframes ae-toast-in{from{opacity:0;transform:translate(-50%,-10px) scale(.96)}to{opacity:1;transform:translate(-50%,0)}}
@keyframes ae-toast-out{to{opacity:0;visibility:hidden;transform:translate(-50%,-8px) scale(.98)}}
@keyframes ae-toast-in-b{from{opacity:0;transform:translate(-50%,14px) scale(.96)}to{opacity:1;transform:translate(-50%,0)}}
@keyframes ae-toast-out-b{to{opacity:0;visibility:hidden;transform:translate(-50%,10px) scale(.98)}}
@keyframes ae-toast-fade{to{opacity:0;visibility:hidden}}
@keyframes ae-toast-count{from{transform:scaleX(1)}to{transform:scaleX(0)}}
`;
}

module.exports = { buildHeroCss };
