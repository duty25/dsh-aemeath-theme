"use strict";
// Global skin: Aemeath token layer, background layer (pixel night sky +
// twinkling pixel stars + scanlines), pixel-font face, 9-slice pixel buttons
// and the component skin (composer, sidebar, header tabs, capsule, mobile-nav
// controls). Everything is scoped under html[data-aemeath] so turning the
// skin off is a single attribute flip.
const store = require('./store.js');
const { tokens, cssVars } = require('./palette.js');
const extra = require('./skin-extra.js');
const chrome = require('./chrome.js');
const { asset } = require("./assets.js");

const A = (name) => `url("${asset(name)}")`;
const S = 'html[data-aemeath]';

function buildCss() {
  const nine = (img) => `border-style:solid !important;border-width:4px !important;border-color:transparent !important;border-image:${A(img)} 4 fill / 8px / 0 stretch !important;image-rendering:pixelated;border-radius:0 !important;background:transparent !important;`;
  const brackets = (c, len = 10, w = 2) => [
    `linear-gradient(${c},${c}) top left/${len}px ${w}px no-repeat`, `linear-gradient(${c},${c}) top left/${w}px ${len}px no-repeat`,
    `linear-gradient(${c},${c}) top right/${len}px ${w}px no-repeat`, `linear-gradient(${c},${c}) top right/${w}px ${len}px no-repeat`,
    `linear-gradient(${c},${c}) bottom left/${len}px ${w}px no-repeat`, `linear-gradient(${c},${c}) bottom left/${w}px ${len}px no-repeat`,
    `linear-gradient(${c},${c}) bottom right/${len}px ${w}px no-repeat`, `linear-gradient(${c},${c}) bottom right/${w}px ${len}px no-repeat`,
  ].join(',');
  return `
@font-face{font-family:"AemeathPixel";src:${A('pixel-font.woff2')} format("woff2");font-display:swap}
${S}{
  --ae-font-px:"AemeathPixel","Fusion Pixel 10px Proportional zh_hans",ui-monospace,monospace;
  --ae-glow:0 0 0 1px rgba(var(--ae-pink-rgb),.35),0 0 14px rgba(var(--ae-pink-rgb),.28);
  background:var(--ae-plum) !important;
}
${S}[style*="color-scheme: light"]{background:#fff2f8 !important;--ae-ink:#2b1838}
${S} body{background:transparent !important}
${S} ::selection{background:rgba(var(--ae-pink-rgb),.45);color:#fff}
${S} *{scrollbar-color:rgba(var(--ae-pink-rgb),.45) transparent;scrollbar-width:thin}
${S} ::-webkit-scrollbar{width:6px;height:6px}
${S} ::-webkit-scrollbar-thumb{background:rgba(var(--ae-pink-rgb),.45);border-radius:0}
${S} :focus-visible{outline-color:var(--ae-pink) !important}

/* ---------- background layer ---------- */
#aemeath-bg{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;background:#0d091b}
#aemeath-bg[hidden]{display:none}
#aemeath-bg .ae-bg-img{position:absolute;inset:calc(var(--ae-bg-blur,0px) * -2);background-image:var(--ae-bg-url);background-size:cover;background-position:center 70%;image-rendering:pixelated;filter:blur(var(--ae-bg-blur,0px)) saturate(1.05)}
#aemeath-bg .ae-bg-veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(var(--ae-plum-rgb),calc(var(--ae-bg-dim) + .12)) 0%,rgba(var(--ae-plum-rgb),var(--ae-bg-dim)) 38%,rgba(var(--ae-plum-rgb),calc(var(--ae-bg-dim) + .18)) 100%)}
html[style*="color-scheme: light"] #aemeath-bg{background:#ffe8f3}
html[style*="color-scheme: light"] #aemeath-bg .ae-bg-veil{background:linear-gradient(180deg,rgba(255,240,248,calc(var(--ae-bg-dim) + .25)),rgba(255,240,248,calc(var(--ae-bg-dim) + .1)))}
#aemeath-bg .ae-bg-scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.16) 0 1px,transparent 1px 3px);mix-blend-mode:multiply;opacity:.55}
#aemeath-bg .ae-bg-stars{position:absolute;inset:0}
#aemeath-bg .ae-star{position:absolute;width:2px;height:2px;background:#fff;box-shadow:0 0 4px #fff;animation:ae-twinkle var(--d,3s) steps(3) infinite;animation-delay:var(--dl,0s);opacity:.2}
#aemeath-bg .ae-star.ae-star-big{width:6px;height:6px;background:none;box-shadow:none}
#aemeath-bg .ae-star.ae-star-big::before,#aemeath-bg .ae-star.ae-star-big::after{content:"";position:absolute;background:var(--c,#ffb3da)}
#aemeath-bg .ae-star.ae-star-big::before{left:2px;top:0;width:2px;height:6px}
#aemeath-bg .ae-star.ae-star-big::after{left:0;top:2px;width:6px;height:2px}
@keyframes ae-twinkle{0%,100%{opacity:.15}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){#aemeath-bg .ae-star{animation:none;opacity:.6}}

/* ---------- surfaces ---------- */
${S}[data-ae-skin] [data-composer-card]{
  border:1px solid rgba(var(--ae-pink-rgb),.38) !important;
  box-shadow:0 0 0 1px rgba(var(--ae-plum-rgb),.55),0 0 22px rgba(var(--ae-pink-rgb),.16),inset 0 0 28px rgba(var(--ae-violet-rgb),.08) !important;
  -webkit-backdrop-filter:blur(12px) saturate(1.2);backdrop-filter:blur(12px) saturate(1.2);
}
${S}[data-ae-skin][data-ae-corners] [data-composer-card]{border-radius:6px !important;background:${brackets('var(--ae-cyan)')},var(--dsw-alias-bg-layer-1) !important}
${S}[data-ae-skin] [data-composer-card]:focus-within{border-color:rgba(var(--ae-pink-rgb),.7) !important;box-shadow:0 0 0 1px rgba(var(--ae-plum-rgb),.55),0 0 26px rgba(var(--ae-pink-rgb),.32) !important}

/* send button: pink 9-slice; add button: plum 9-slice */
${S}[data-ae-skin][data-ae-corners] [data-composer-card] button[class*="_primary"]{${nine('btn-pink.png')}color:#3a0f2a !important;min-width:36px;min-height:36px}
${S}[data-ae-skin][data-ae-corners] [data-composer-card] button[class*="_primary"]:active:not(:disabled){border-image-source:${A('btn-pink-pressed.png')} !important}
${S}[data-ae-skin][data-ae-corners] [data-composer-card] button[class*="_primary"]:disabled{filter:grayscale(.7) brightness(.8)}
${S}[data-ae-skin][data-ae-corners] [data-composer-card] button[class*="_add"]{${nine('btn-plum.png')}color:var(--ae-pink-soft) !important;min-width:34px;min-height:34px}
${S}[data-ae-skin][data-ae-corners] [data-composer-card] button[class*="_add"]:active{border-image-source:${A('btn-plum-pressed.png')} !important}
${S}[data-ae-skin] [data-composer-card] button[class*="_trigger"][aria-label*="访问模式"],
${S}[data-ae-skin] [data-composer-card] button[class*="_trigger"][aria-label*="ccess"]{border-radius:3px !important;border:1px solid rgba(var(--ae-cyan-rgb),.35) !important}

/* sidebar */
${S}[data-ae-skin][data-ae-corners] button[class*="_newSession"]{${nine('btn-pink.png')}color:#3a0f2a !important;font-family:var(--ae-font-px) !important;font-size:20px !important;letter-spacing:0}
${S}[data-ae-skin][data-ae-corners] button[class*="_newSession"]:active{border-image-source:${A('btn-pink-pressed.png')} !important}
${S}[data-ae-skin] [class*="_sessionRow"]{border-radius:3px !important}
${S}[data-ae-skin] [class*="_sessionRow"][aria-current],
${S}[data-ae-skin] [class*="_sessionRow"][data-active="true"],
${S}[data-ae-skin] [class*="_sessionRow"][data-selected="true"]{background:linear-gradient(90deg,rgba(var(--ae-pink-rgb),.28),rgba(var(--ae-violet-rgb),.1)) !important;box-shadow:inset 3px 0 0 var(--ae-pink) !important}
${S}[data-ae-skin] button[class*="_brand"]{filter:hue-rotate(290deg) saturate(1.4)}

/* header tabs */
${S}[data-ae-skin] [data-phase] header [class*="_tab"]{border-radius:2px !important}
${S}[data-ae-skin] [data-phase] header [class*="_tab"][data-active="true"]{background:rgba(var(--ae-pink-rgb),.18) !important;color:var(--ae-pink-soft) !important;box-shadow:inset 0 -2px 0 var(--ae-pink) !important}

/* hero headline */
${S}[data-ae-skin] [class*="_headline"]{font-family:var(--ae-font-px) !important;letter-spacing:1px;background:linear-gradient(90deg,var(--ae-pink-soft),var(--ae-pink) 45%,var(--ae-cyan));-webkit-background-clip:text;background-clip:text;color:transparent !important;text-shadow:none}

/* dialogs and menus */
${S}[data-ae-skin] [role="dialog"],${S}[data-ae-skin] [role="menu"],${S}[data-ae-skin] [role="listbox"]{border-color:rgba(var(--ae-pink-rgb),.35) !important}

/* mobile-nav controls */
${S}[data-ae-skin][data-ae-corners] [data-mobile-nav="fab"]{${nine('btn-pink.png')}color:#3a0f2a !important;width:46px !important;height:46px !important;box-shadow:none !important}
${S}[data-ae-skin] [data-mobile-nav="composer-toggle"]{color:var(--ae-pink) !important}

/* ---------- session header: pixel icon buttons + tabs ---------- */
${S}[data-ae-skin] [data-phase] header{border-bottom:1px solid rgba(var(--ae-pink-rgb),.22) !important;background:linear-gradient(180deg,rgba(var(--ae-plum-rgb),.72),rgba(var(--ae-plum-rgb),.38)) !important;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
html[style*="color-scheme: light"][data-ae-skin] [data-phase] header{background:linear-gradient(180deg,rgba(255,244,250,.85),rgba(255,244,250,.55)) !important}
${S}[data-ae-skin] [data-phase] header [class*="_crumbs"] *{font-weight:600}
${S}[data-ae-skin] [data-phase] header :is([data-conversation-header-leading],[class*="_headerActions"],[class*="_headerUtilities"],[data-conversation-header-corner]) button:not([class*="_tab"]):not([role="menuitem"]):not([class*="QsffPG_trigger"]),
${S}[data-ae-skin] [data-phase] header [data-mobile-nav="toggle"],${S}[data-ae-skin] [data-phase] header [data-mobile-nav="files"]{
  min-width:36px;min-height:36px;border-radius:12px !important;border:0 !important;background:rgba(var(--ae-plum3-rgb),.5) !important;color:var(--ae-pink-soft) !important;box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.22),0 2px 6px rgba(0,0,0,.25) !important}
${S}[data-ae-skin] [data-phase] header :is([data-conversation-header-leading],[class*="_headerActions"],[class*="_headerUtilities"],[data-conversation-header-corner]) button:not([class*="_tab"]):active,
${S}[data-ae-skin] [data-phase] header [data-mobile-nav]:active{background:var(--ae-pink) !important;color:#2a0b20 !important;box-shadow:none !important;transform:translate(1px,1px)}
${S}[data-ae-skin] [data-phase] header [data-conversation-tabs]{gap:4px;scrollbar-width:none}
${S}[data-ae-skin] [data-phase] header [data-conversation-tabs] button{border-radius:3px 3px 0 0 !important;padding-left:10px;padding-right:10px}
${S}[data-ae-skin] [data-phase] header [data-conversation-tabs] button[class*="Active"],${S}[data-ae-skin] [data-phase] header [data-conversation-tabs] button[aria-selected="true"]{color:var(--ae-pink-soft) !important;background:linear-gradient(180deg,rgba(var(--ae-pink-rgb),.06),rgba(var(--ae-pink-rgb),.22)) !important;box-shadow:inset 0 -3px 0 var(--ae-pink) !important}
${S}[data-ae-skin] [data-phase] header [data-conversation-tabs] button[class*="Active"]::after{display:none}

/* ---------- chat messages ---------- */
${S}[data-ae-skin] [class*="_userRow"] [class*="_bubble"]{
  background:linear-gradient(135deg,rgba(var(--ae-pink-rgb),.30),rgba(var(--ae-violet-rgb),.24)) !important;border:1px solid rgba(var(--ae-pink-rgb),.5) !important;border-radius:14px 14px 3px 14px !important;
  color:var(--dsw-alias-label-primary) !important;box-shadow:3px 3px 0 rgba(var(--ae-plum-rgb),.55),0 0 14px rgba(var(--ae-pink-rgb),.16) !important}
html[style*="color-scheme: light"][data-ae-skin] [class*="_userRow"] [class*="_bubble"]{background:linear-gradient(135deg,#ffd5ea,#e7dcff) !important;box-shadow:3px 3px 0 rgba(242,76,158,.25) !important}
${S}[data-ae-skin] [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"]{
  position:relative;padding:10px 12px 10px 14px !important;margin:2px 0;border-radius:4px;background:rgba(var(--ae-surface-rgb),.62);border:1px solid rgba(var(--ae-cyan-rgb),.16);box-shadow:inset 3px 0 0 var(--ae-cyan)}
html[style*="color-scheme: light"][data-ae-skin] [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"]{background:rgba(255,255,255,.72);box-shadow:inset 3px 0 0 var(--ae-pink2)}
${S}[data-ae-skin] [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"]::before{content:"";position:absolute;right:6px;top:6px;width:6px;height:6px;background:var(--ae-pink);clip-path:polygon(33% 0,67% 0,67% 33%,100% 33%,100% 67%,67% 67%,67% 100%,33% 100%,33% 67%,0 67%,0 33%,33% 33%);opacity:.7}
${S}[data-ae-skin] [class*="_markdown"] :is(h1,h2){font-family:var(--ae-font-px);font-weight:400;font-size:20px;line-height:1.3;color:var(--ae-pink-soft);letter-spacing:.5px}
${S}[data-ae-skin] [class*="_markdown"] h3{color:var(--ae-pink-soft)}
${S}[data-ae-skin] [class*="_markdown"] a{color:var(--ae-cyan) !important;text-decoration-color:rgba(var(--ae-cyan-rgb),.45)}
${S}[data-ae-skin] [class*="_markdown"] :not(pre)>code{color:#ffc2e2 !important;background:rgba(var(--ae-pink-rgb),.14) !important;border-radius:3px;padding:.05em .35em}
${S}[data-ae-skin] [class*="_markdown"] pre{border:1px solid rgba(var(--ae-pink-rgb),.28) !important;border-radius:4px !important;background:rgba(10,8,22,.85) !important;box-shadow:3px 3px 0 rgba(var(--ae-plum-rgb),.6)}
${S}[data-ae-skin] [class*="_markdown"] blockquote{border-left:3px solid var(--ae-pink) !important;background:rgba(var(--ae-pink-rgb),.08);padding:4px 10px}
${S}[data-ae-skin] [class*="_markdown"] :is(th,td){border-color:rgba(var(--ae-pink-rgb),.25) !important}
${S}[data-ae-skin] [class*="_markdown"] th{background:rgba(var(--ae-pink-rgb),.12)}
${S}[data-ae-skin] [class*="_markdown"] li::marker{color:var(--ae-pink)}
${S}[data-ae-skin] [class*="_markdown"] hr{border:0;height:2px;background:repeating-linear-gradient(90deg,var(--ae-pink) 0 4px,transparent 4px 8px);opacity:.5}
${S}[data-ae-skin] [data-turn-process],${S}[data-ae-skin] [data-step-process] > button{border-radius:3px !important}
${S}[data-ae-skin] [data-step-process-icon]{color:var(--ae-cyan)}
${S}[data-ae-skin] [data-disclosure-row]{border-radius:3px !important}
${S}[data-ae-skin] [data-turn-trigger] > button{border-radius:3px !important;border:1px solid rgba(var(--ae-pink-rgb),.3) !important;background:rgba(var(--ae-plum3-rgb),.5) !important}
${S}[data-ae-skin] [data-turn-tail] button,${S}[data-ae-skin] [data-chat-flow-kind="user"] [data-clock] button{border-radius:3px !important;color:var(--ae-pink-soft)}
@media (max-width:760px){
  ${S}[data-ae-skin] [class*="_userRow"] [class*="_bubble"]{max-width:88% !important}
  ${S}[data-ae-skin] [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"]{padding:9px 10px 9px 12px !important}
}

/* ---------- stats strip under the composer (rounds / tokens / subscription / context) ---------- */
${S}[data-ae-skin] [data-composer-card] ~ [class$="_dock"]{gap:6px !important;padding-top:6px !important;align-items:stretch !important}
${S}[data-ae-skin] [data-slot="conversation.composer.dock"] > [data-composer-stats]{
  display:flex !important;flex-wrap:nowrap !important;overflow-x:auto !important;scrollbar-width:none;gap:5px !important;padding:4px !important;justify-content:flex-start !important;
  border-radius:4px !important;border:1px solid rgba(var(--ae-pink-rgb),.3) !important;background:rgba(var(--ae-surface-rgb),.72) !important;box-shadow:2px 2px 0 rgba(var(--ae-plum-rgb),.6) !important;
  -webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 18px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 18px),transparent)}
${S}[data-ae-skin] [data-slot="conversation.composer.dock"] > [data-composer-stats]::-webkit-scrollbar{display:none}
${S}[data-ae-skin] [data-slot="conversation.composer.dock"] > [data-composer-stats] > span{flex:0 0 auto !important;min-width:0 !important;display:flex !important}
${S}[data-ae-skin] [data-slot="conversation.composer.dock"] > [data-composer-stats] > span:last-child{padding-right:14px}
${S}[data-ae-skin] [data-slot="conversation.composer.dock"] > [data-composer-stats] > span > button{
  flex:0 0 auto !important;height:30px !important;padding:0 9px !important;gap:5px !important;max-width:none !important;
  border-radius:3px !important;border:1px solid rgba(var(--ae-cyan-rgb),.22) !important;background:rgba(var(--ae-plum3-rgb),.55) !important;color:var(--dsw-alias-label-primary) !important;
  font-size:12px !important;font-variant-numeric:tabular-nums}
${S}[data-ae-skin] [data-slot="conversation.composer.dock"] > [data-composer-stats] > span > button > span{overflow:visible !important;text-overflow:clip !important;max-width:none !important}
${S}[data-ae-skin] [data-slot="conversation.composer.dock"] > [data-composer-stats] > span > button.dsh-subscription-usage-pill > span{max-width:46vw !important;overflow:hidden !important;text-overflow:ellipsis !important}
${S}[data-ae-skin] [data-slot="conversation.composer.dock"] > [data-composer-stats] > span > button svg{width:14px !important;height:14px !important;color:var(--ae-pink)}
${S}[data-ae-skin] [data-composer-card] ~ [class$="_dock"] > span:last-child > button[aria-haspopup="dialog"]{
  height:auto !important;min-height:38px !important;padding:0 10px 0 8px !important;border-radius:4px !important;border:1px solid rgba(var(--ae-pink-rgb),.45) !important;
  background:rgba(var(--ae-surface-rgb),.78) !important;box-shadow:2px 2px 0 rgba(var(--ae-plum-rgb),.6) !important;font-size:12px !important;font-variant-numeric:tabular-nums;color:var(--ae-pink-soft) !important}
${S}[data-ae-skin] [data-composer-card] ~ [class$="_dock"] > span:last-child > button[aria-haspopup="dialog"] svg circle:last-child{stroke:var(--ae-pink) !important}
${S}[data-ae-skin] [data-mobile-nav="composer-toggle"]{width:auto !important;min-width:0 !important;height:26px !important;min-height:26px !important;margin:4px auto 0 !important;padding:0 14px !important;
  display:flex !important;align-items:center;justify-content:center;border-radius:3px !important;border:1px solid rgba(var(--ae-pink-rgb),.32) !important;background:rgba(var(--ae-surface-rgb),.6) !important;font-size:12px !important;box-shadow:none !important}

/* ---------- model capsule (dsh-thinking-effort + shipped selector) ---------- */
${S}[data-ae-capsule] .dsh-reasoning-model__trigger{height:32px;border:1px solid rgba(var(--ae-pink-rgb),.45) !important;border-radius:3px !important;background:linear-gradient(180deg,rgba(var(--ae-pink-rgb),.16),rgba(var(--ae-violet-rgb),.1)) !important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 0 10px rgba(var(--ae-pink-rgb),.18);color:var(--dsw-alias-label-primary) !important}
${S}[data-ae-capsule] .dsh-reasoning-model__trigger:hover:not(:disabled){border-color:var(--ae-pink) !important}
${S}[data-ae-capsule] .dsh-reasoning-model__model{font-weight:600;letter-spacing:.2px}
${S}[data-ae-capsule] .dsh-reasoning-model__bolt{color:var(--ae-pink) !important;filter:drop-shadow(0 0 3px rgba(var(--ae-pink-rgb),.6))}
${S}[data-ae-capsule] .dsh-reasoning-model__chevron{color:var(--ae-pink-soft) !important}
${S}[data-ae-capsule] .dsh-reasoning-model__popover{border:1px solid rgba(var(--ae-pink-rgb),.5) !important;border-radius:4px !important;background:${brackets('var(--ae-cyan)', 12, 2)},rgba(20,16,40,.97) !important;box-shadow:0 0 0 1px #0d091b,0 14px 34px rgba(0,0,0,.55),0 0 24px rgba(var(--ae-pink-rgb),.22) !important}
html[style*="color-scheme: light"][data-ae-capsule] .dsh-reasoning-model__popover{background:${brackets('var(--ae-pink)', 12, 2)},rgba(255,250,253,.98) !important}
${S}[data-ae-capsule] .dsh-reasoning-model__section-label{font-family:var(--ae-font-px);font-size:20px;line-height:20px;font-weight:400;color:var(--ae-pink-soft) !important}
${S}[data-ae-capsule] .dsh-reasoning-model__option,${S}[data-ae-capsule] .dsh-reasoning-model__provider-toggle{border-radius:3px !important}
${S}[data-ae-capsule] .dsh-reasoning-model__option[aria-selected="true"]{background:linear-gradient(90deg,rgba(var(--ae-pink-rgb),.3),rgba(var(--ae-violet-rgb),.12)) !important;box-shadow:inset 3px 0 0 var(--ae-pink)}
${S}[data-ae-capsule] .dsh-reasoning-model__check{color:var(--ae-pink) !important}
${S}[data-ae-capsule] [data-slot="conversation.input.model"] button[aria-haspopup]{border-radius:3px !important;border:1px solid rgba(var(--ae-pink-rgb),.4) !important}
@media (max-width:760px){
  ${S}[data-ae-capsule] .dsh-reasoning-model__trigger{height:34px;padding:0 6px 0 8px;max-width:min(52vw,230px) !important}
  ${S}[data-ae-capsule] .dsh-reasoning-model__effort>span:last-child{min-width:0 !important}
}
@media (max-width:760px){
  ${S}[data-ae-clamp] .dsh-reasoning-model--portal .dsh-reasoning-model__popover{left:8px !important;right:8px !important;width:auto !important;max-width:none !important;max-height:min(70dvh,560px) !important}
  ${S}[data-ae-clamp] .dsh-reasoning-model__models{max-height:min(42dvh,320px) !important}
  ${S}[data-ae-clamp] .dsh-reasoning-model__option,${S}[data-ae-clamp] .dsh-reasoning-model__provider-toggle{min-height:44px !important}
  ${S}[data-ae-clamp] .dsh-reasoning-model__option-name{font-size:13px !important;line-height:18px !important}
  ${S}[data-ae-clamp] .dsh-reasoning-model__option-description{font-size:11px !important}
  ${S}[data-ae-clamp] .dsh-reasoning-model__provider-toggle{font-size:13px !important}
}
`;
}

const BG_FILES = { night: 'bg-night.webp', 'night-dim': 'bg-night-dim.webp' };

function makeStars(host) {
  host.textContent = '';
  const colors = ['#ffb3da', '#77e8ff', '#ffd76a', '#ffffff'];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 34; i++) {
    const s = document.createElement('i');
    const big = i % 6 === 0;
    s.className = big ? 'ae-star ae-star-big' : 'ae-star';
    s.style.left = (rnd() * 100).toFixed(2) + '%';
    s.style.top = (rnd() * 62).toFixed(2) + '%';
    s.style.setProperty('--d', (2 + rnd() * 4).toFixed(1) + 's');
    s.style.setProperty('--dl', (-rnd() * 5).toFixed(1) + 's');
    if (big) s.style.setProperty('--c', colors[i % colors.length]);
    host.appendChild(s);
  }
}

function install(ctx) {
  const root = document.documentElement;
  const style = document.createElement('style');
  style.dataset.plugin = 'dsh-aemeath-theme';
  style.dataset.pluginCss = 'dsh-aemeath-theme/skin.css';
  style.textContent = buildCss() + extra.buildCss(A) + chrome.buildCss();
  document.head.appendChild(style);

  const bg = document.createElement('div');
  bg.id = 'aemeath-bg';
  bg.innerHTML = '<div class="ae-bg-img"></div><div class="ae-bg-veil"></div><div class="ae-bg-stars"></div><div class="ae-bg-scan"></div>';
  document.body.prepend(bg);
  makeStars(bg.querySelector('.ae-bg-stars'));

  const theme = ctx.get('theme');
  let disposeTokens = null;
  let lastGlass = null;

  const flag = (name, on) => { if (on) root.setAttribute(name, ''); else root.removeAttribute(name); };

  function apply(p) {
    root.setAttribute('data-aemeath', '');
    flag('data-ae-skin', p.skin);
    flag('data-ae-corners', p.skin && p.pixelCorners);
    flag('data-ae-capsule', p.capsuleSkin);
    flag('data-ae-clamp', p.capsuleClamp);
    flag('data-ae-pixel-icons', p.skin && p.pixelIcons);
    flag('data-ae-compact-sb', p.skin && p.compactSidebar !== false);
    flag('data-ae-chrome', p.skin && p.chatChrome !== false);
    flag('data-ae-brand', p.brand);
    flag('data-ae-hide-bell', p.hideNotifyBell);
    root.setAttribute('data-ae-palette', p.palette || 'aemeath');
    root.setAttribute('data-ae-font', p.uiFont || 'pixel-title');
    for (const [k, v] of Object.entries(cssVars(p.palette))) root.style.setProperty(k, v);
    // background
    const show = p.background !== 'none';
    bg.hidden = !show;
    let url = '';
    if (p.background === 'custom') url = store.getCustomBg();
    if (!url && show) url = asset(BG_FILES[p.background] || BG_FILES.night);
    bg.style.setProperty('--ae-bg-url', url ? `url("${url}")` : 'none');
    bg.style.setProperty('--ae-bg-dim', String(Math.max(0, Math.min(0.9, Number(p.bgDim) || 0))));
    bg.style.setProperty('--ae-bg-blur', `${Math.max(0, Math.min(20, Number(p.bgBlur) || 0))}px`);
    bg.querySelector('.ae-bg-scan').hidden = !p.scanlines;
    bg.querySelector('.ae-bg-stars').hidden = !p.stars;
    // tokens
    if (theme && typeof theme.overrideTokens === 'function') {
      if (p.skin) {
        const sig = `${p.glass}|${p.palette}|${p.textColor}`;
        if (disposeTokens === null || lastGlass !== sig) {
          if (disposeTokens) { try { disposeTokens(); } catch { /* replaced below */ } }
          try { disposeTokens = theme.overrideTokens('dsh-aemeath-theme', tokens(Number(p.glass) || 0.62, p.palette, p.textColor)); lastGlass = sig; }
          catch (e) { console.warn('[aemeath-theme] overrideTokens failed', e); }
        }
      } else if (disposeTokens) {
        disposeTokens(); disposeTokens = null; lastGlass = null;
      }
    }
  }

  apply(store.get());
  const off = store.subscribe(apply);
  return () => {
    off();
    if (disposeTokens) disposeTokens();
    style.remove();
    bg.remove();
    for (const a of ['data-aemeath', 'data-ae-skin', 'data-ae-corners', 'data-ae-capsule', 'data-ae-clamp', 'data-ae-pixel-icons', 'data-ae-compact-sb', 'data-ae-brand', 'data-ae-hide-bell', 'data-ae-palette', 'data-ae-font']) root.removeAttribute(a);
    for (const k of Object.keys(cssVars('aemeath'))) root.style.removeProperty(k);
  };
}

module.exports = { install };
