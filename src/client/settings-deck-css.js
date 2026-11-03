"use strict";
// CSS for the 「频段柱」 settings layout (html[data-ae-set-style="resonance"]).
// Paired with settings-deck.js which inserts .ae-st-head / .ae-st-pillars /
// .ae-st-foot / .ae-st-beam into the shipped dialog panel.
//
// Palette: deep blue-violet info base (忘却前夜「明暗分工」), Aemeath pink as
// the lit/active colour, cyan for secondary state, a warm star-gold hairline as
// the frame ornament. Bright colours are reserved for state.
const { asset } = require('./assets.js');

function buildCss() {
  const R = 'html[data-aemeath][data-ae-set-style="resonance"]';
  const D = `${R} [data-shortcut-modal="settings"]`;
  const O = `${R} [class*="VOzbGW_overlay"]:has([data-shortcut-modal="settings"])`;
  const CUT = (n) => `polygon(${n}px 0,100% 0,100% calc(100% - ${n}px),calc(100% - ${n}px) 100%,0 100%,0 ${n}px)`;
  const OPT = `${D}[data-ae-deck] [class*="VOzbGW_options"]`;
  const GEN = `${OPT} [class*="_WvWnq_section"]`;
  const ROW = ':is([class$="_row"],[class*="_row "],[class$="_group"]:not(:has([class$="_row"])),[class$="_setting"],.re-setting-row)';
  const BR = (c, l, w) => ['left top', 'right top', 'left bottom', 'right bottom']
    .map((pos) => `linear-gradient(${c},${c}) ${pos}/${l}px ${w} no-repeat,linear-gradient(${c},${c}) ${pos}/${w} ${l}px no-repeat`).join(',');
  const ROWS = ':is([class*="Pt1bsG_row"],[class*="hVGvvW_row"],[class*="oY77xG_row"],[class*="T1PP_q_row"],[class*="bVCLcG_row"],[class*="_8HJdBW_group"],[class*="yIbyla_row"])';
  const TITLES = ':is([class*="Pt1bsG_title"],[class*="hVGvvW_title"],[class*="oY77xG_title"],[class*="T1PP_q_title"],[class*="bVCLcG_title"],[class*="_8HJdBW_title"],[class*="yIbyla_title"])';

  return `
${R}{
  --rs-ink:#0a0b1a; --rs-ink2:#11132a; --rs-ink3:#1a1c3a; --rs-glass:rgba(17,19,42,.78);
  --rs-line:rgba(170,160,255,.16); --rs-line2:rgba(170,160,255,.30);
  --rs-pink:#ff7cc4; --rs-pink-rgb:255,124,196; --rs-cyan:#7fe9ff; --rs-cyan-rgb:127,233,255;
  --rs-gold:#f3d9a4; --rs-gold-rgb:243,217,164; --rs-violet:#9d86ff;
  --rs-text:#eef0ff; --rs-mute:#9da3c7; --rs-dim:#666c94;
  --rs-px:var(--ae-font-px,"AemeathPixel",ui-monospace,monospace);
  --rs-data:ui-monospace,"JetBrains Mono","SFMono-Regular",Menlo,monospace;
}

/* ========== backdrop: dim the world first (星落: 主页先暗化再出设置) ========== */
${O} [class*="VOzbGW_mask"]{background:
  radial-gradient(90% 60% at 50% 0%,rgba(var(--rs-pink-rgb),.10),transparent 60%),
  radial-gradient(70% 50% at 50% 100%,rgba(var(--rs-cyan-rgb),.08),transparent 70%),
  rgba(5,6,16,.80) !important;backdrop-filter:blur(8px) saturate(.7) !important;animation:ae-rs-dim .28s ease-out both}
@keyframes ae-rs-dim{from{opacity:0}to{opacity:1}}

/* ========== panel: one column — head / pillars / page / foot ========== */
${D}[data-ae-deck]{
  --dsw-alias-label-primary:var(--rs-text); --dsw-alias-label-secondary:var(--rs-mute); --dsw-alias-label-tertiary:var(--rs-dim);
  --dsw-alias-border-l1:var(--rs-line); --dsw-alias-border-l2:var(--rs-line); --dsw-alias-border-l3:var(--rs-line); --dsw-alias-border-l4:var(--rs-line2);
  --dsw-alias-interactive-bg-hover:rgba(var(--rs-pink-rgb),.08); --dsw-alias-brand-primary:var(--rs-pink);
  --dsw-alias-bg-layer-1:var(--rs-ink2); --dsw-alias-bg-layer-2:var(--rs-ink); --dsw-alias-bg-module-platform:rgba(var(--rs-pink-rgb),.12);
  display:grid !important;grid-template-columns:minmax(0,1fr) !important;grid-template-rows:auto auto minmax(0,1fr) auto !important;
  width:min(880px,calc(100vw - 48px)) !important;max-width:none !important;height:min(720px,calc(100dvh - 48px)) !important;max-height:none !important;
  padding:0 !important;overflow:hidden !important;position:relative;isolation:isolate;color:var(--rs-text) !important;
  border-radius:6px !important;border:1px solid var(--rs-line2) !important;clip-path:none !important;
  background:
    radial-gradient(120% 50% at 50% -10%,rgba(var(--rs-pink-rgb),.10),transparent 60%),
    repeating-linear-gradient(90deg,rgba(255,255,255,.018) 0 1px,transparent 1px 72px),
    linear-gradient(180deg,var(--rs-ink2),var(--rs-ink)) !important;
  box-shadow:0 0 0 1px rgba(0,0,0,.6),0 0 0 5px rgba(var(--rs-gold-rgb),.06),0 32px 90px rgba(0,0,0,.7) !important;
  animation:ae-rs-open .32s cubic-bezier(.2,.8,.2,1) .06s both}
@keyframes ae-rs-open{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}
/* star-gold hairline corners */
${D}[data-ae-deck]::before,${D}[data-ae-deck]::after{content:"";position:absolute;width:18px;height:18px;pointer-events:none;z-index:6;border:1px solid var(--rs-gold);opacity:.7}
${D}[data-ae-deck]::before{left:6px;top:6px;border-right:0;border-bottom:0}
${D}[data-ae-deck]::after{right:6px;bottom:6px;border-left:0;border-top:0}

/* the shipped nav stays mounted (we forward clicks to it). Its list/title are
   hidden; on 0.2.1 the content header (close + actions) can live inside the nav,
   so the nav itself is pinned into the head row's right corner. */
${D}[data-ae-deck] > nav[class*="VOzbGW_nav"]{position:absolute !important;top:0 !important;right:10px !important;left:auto !important;bottom:auto !important;
  width:auto !important;height:58px !important;min-height:0 !important;padding:0 !important;margin:0 !important;border:0 !important;background:none !important;
  display:flex !important;flex-direction:row !important;align-items:center !important;z-index:7;overflow:visible !important;box-shadow:none !important}
${D}[data-ae-deck] > nav[class*="VOzbGW_nav"] > :not([class*="VOzbGW_header"]){display:none !important}
${D}[data-ae-deck] > [class*="VOzbGW_content"]{grid-row:3;min-height:0 !important;display:flex !important;flex-direction:column !important;position:static !important;overflow:hidden}

/* ---------- head: centred title, close top-right (忘却前夜 工具式设置) ---------- */
${D} .ae-st-head{grid-row:1;position:relative;display:flex;align-items:center;justify-content:center;gap:10px;height:58px;padding:0 64px;
  border-bottom:1px solid var(--rs-line)}
${D} .ae-st-mark{width:26px;height:26px;flex:none;background:url("${asset('dsu-emblem.webp')}") center/contain no-repeat;filter:drop-shadow(0 0 6px rgba(var(--rs-pink-rgb),.5))}
${D} .ae-st-title{display:flex;flex-direction:column;align-items:center;line-height:1}
${D} .ae-st-title b{font:400 20px/1 var(--rs-px);letter-spacing:4px;color:var(--rs-text);text-shadow:0 0 10px rgba(var(--rs-pink-rgb),.45)}
${D} .ae-st-title small{margin-top:5px;font:600 9px/1 var(--rs-data);letter-spacing:3px;color:var(--rs-gold);opacity:.8}
/* content header: only the close button (and plugin actions), floated up into the head row */
${D}[data-ae-deck] [class*="VOzbGW_header"]{position:static !important;width:auto !important;height:auto !important;min-height:0 !important;padding:0 !important;border:0 !important;
  display:flex !important;align-items:center !important;gap:8px;background:none !important}
/* if the header stays inside the content column instead, lift it into the head row */
${D}[data-ae-deck] > [class*="VOzbGW_content"] > [class*="VOzbGW_header"]{position:absolute !important;top:0;right:10px;height:58px;z-index:7}
${D}[data-ae-deck] [class*="VOzbGW_header"]::before{content:none !important}
${D}[data-ae-deck] [class*="VOzbGW_close"]{width:36px !important;min-width:36px !important;height:36px !important;flex:none !important;display:flex !important;align-items:center;justify-content:center;border-radius:50% !important;border:1px solid var(--rs-line2) !important;
  background:rgba(0,0,0,.25) !important;color:var(--rs-text) !important;clip-path:none !important}
${D}[data-ae-deck] [class*="VOzbGW_close"]:hover{border-color:var(--rs-pink) !important;color:var(--rs-pink) !important;box-shadow:0 0 12px rgba(var(--rs-pink-rgb),.35)}
${D}[data-ae-deck] [class*="VOzbGW_actions"] button{border-radius:999px !important;border:1px solid var(--rs-line2) !important;background:rgba(0,0,0,.2) !important;
  color:var(--rs-mute) !important;font:600 11px/1 var(--rs-data) !important;clip-path:none !important;height:30px}

/* ---------- pillars (星落 竖柱：选中项变宽、点亮、两侧光边) ---------- */
${D} .ae-st-pillars{grid-row:2;display:flex;align-items:stretch;gap:0;height:150px;padding:0 10px;overflow-x:auto;overflow-y:hidden;
  scrollbar-width:none;border-bottom:1px solid var(--rs-line);position:relative;
  background:linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,0) 70%),
    repeating-linear-gradient(0deg,rgba(var(--rs-cyan-rgb),.035) 0 1px,transparent 1px 6px)}
${D} .ae-st-pillars::-webkit-scrollbar{display:none}
${D} .ae-pl{--w:64px;position:relative;flex:0 0 var(--w);width:var(--w);min-width:0;margin:0;padding:12px 0 10px;border:0;border-radius:0;
  background:transparent;color:var(--rs-mute);cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px;overflow:hidden;
  transition:flex-basis .34s cubic-bezier(.2,.8,.2,1),width .34s cubic-bezier(.2,.8,.2,1),color .2s,background .3s;-webkit-tap-highlight-color:transparent}
/* thin vertical separators */
${D} .ae-pl + .ae-pl::before{content:"";position:absolute;left:0;top:18%;bottom:18%;width:1px;background:linear-gradient(180deg,transparent,var(--rs-line2),transparent)}
${D} .ae-pl:hover{color:var(--rs-text);background:linear-gradient(180deg,rgba(255,255,255,.03),transparent)}
${D} .ae-pl-no{font:600 9px/1 var(--rs-data);letter-spacing:1px;color:var(--rs-dim)}
${D} .ae-pl-ico{width:20px;height:20px;flex:none;background:currentColor;-webkit-mask:var(--ico) center/contain no-repeat;mask:var(--ico) center/contain no-repeat;transition:transform .3s}
${D} .ae-pl-zh{writing-mode:vertical-rl;text-orientation:mixed;font:400 14px/1 var(--rs-px);letter-spacing:2px;max-height:78px;overflow:hidden;white-space:nowrap}
${D} .ae-pl-zh[data-latin]{text-orientation:upright;letter-spacing:-1px;font-size:11px}
${D} .ae-pl-full{display:none}
${D} .ae-pl[data-active] .ae-pl-zh{display:none}
${D} .ae-pl[data-active] .ae-pl-full{display:block;margin-top:6px;max-width:92%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font:400 20px/1.1 var(--rs-px);letter-spacing:2px;text-shadow:0 0 10px rgba(var(--rs-pink-rgb),.8)}
${D} .ae-pl-en{position:absolute;left:0;right:0;bottom:10px;text-align:center;font:600 9px/1 var(--rs-data);letter-spacing:2px;color:var(--rs-gold);opacity:0;transform:translateY(6px);transition:opacity .25s,transform .25s;white-space:nowrap}
/* the lit pillar */
${D} .ae-pl[data-active]{--w:clamp(132px,22%,190px);color:#fff;
  background:
    linear-gradient(180deg,rgba(var(--rs-pink-rgb),.26),rgba(var(--rs-pink-rgb),.06) 55%,rgba(var(--rs-cyan-rgb),.10)),
    repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 1px,transparent 1px 4px);
  box-shadow:inset 1px 0 0 var(--rs-pink),inset -1px 0 0 var(--rs-pink),inset 0 2px 0 rgba(var(--rs-pink-rgb),.9);
  animation:ae-rs-lit .5s ease-out}
${D} .ae-pl[data-active]::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(90deg,rgba(var(--rs-pink-rgb),.35),transparent 14%,transparent 86%,rgba(var(--rs-pink-rgb),.35));filter:blur(4px);opacity:.8}
${D} .ae-pl[data-active] .ae-pl-no{color:var(--rs-gold)}
${D} .ae-pl[data-active] .ae-pl-ico{width:26px;height:26px;transform:translateY(2px);filter:drop-shadow(0 0 6px rgba(var(--rs-pink-rgb),.9))}
/* desktop: pillars share the full width (few pillars no longer leave an empty right half) */
@media (min-width:761px){
  ${D} .ae-pl{flex:1 1 var(--w);max-width:150px}
  ${D} .ae-pl[data-active]{flex:2.6 1 var(--w);max-width:300px}
  ${D} .ae-st-pillars{justify-content:center}
  ${D} .ae-pl-zh{font-size:15px}
}

${D} .ae-pl[data-active] .ae-pl-en{opacity:.9;transform:none}
@keyframes ae-rs-lit{0%{filter:brightness(1.8) saturate(1.4)}30%{filter:brightness(.8)}45%{filter:brightness(1.5)}100%{filter:none}}

/* ---------- page: 鸣潮 data bars — name left, control right ---------- */
${OPT}{flex:1;min-height:0;overflow:auto !important;padding:18px 22px 28px !important;scrollbar-width:thin;scrollbar-color:rgba(var(--rs-pink-rgb),.35) transparent}
/* every setting row of the general page (the shipped classes end in _row / _setting;
   *_rowText must NOT match — that was the card-in-card overflow) */
${GEN} ${ROW}{display:grid !important;grid-template-columns:minmax(0,1fr) auto !important;align-items:center !important;column-gap:14px !important;row-gap:12px !important;
  position:relative;margin:0 0 6px !important;padding:13px 14px 13px 26px !important;min-height:58px;width:auto !important;border:0 !important;border-radius:3px !important;clip-path:none !important;
  background:linear-gradient(90deg,rgba(255,255,255,.06),rgba(255,255,255,.02) 55%,rgba(255,255,255,.008)) !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.05),inset 0 -1px 0 rgba(0,0,0,.4) !important;transition:background .2s,box-shadow .2s}
${GEN} ${ROW}::before{content:"" !important;position:absolute !important;left:10px;top:24px;width:6px;height:6px;transform:rotate(45deg);border:1px solid rgba(var(--rs-gold-rgb),.6);background:transparent;transition:background .2s,border-color .2s,box-shadow .2s}
${GEN} ${ROW}:is(:hover,:focus-within){background:linear-gradient(90deg,rgba(var(--rs-pink-rgb),.13),rgba(var(--rs-pink-rgb),.03) 60%,transparent) !important;
  box-shadow:inset 2px 0 0 var(--rs-pink),inset 0 1px 0 rgba(var(--rs-pink-rgb),.18),inset 0 -1px 0 rgba(0,0,0,.4) !important}
${GEN} ${ROW}:is(:hover,:focus-within)::before{background:var(--rs-pink);border-color:var(--rs-pink);box-shadow:0 0 8px var(--rs-pink)}
${GEN} ${ROW} > :not([role="switch"]){min-width:0 !important}
${GEN} ${ROW} > :first-child{grid-column:1 !important;width:auto !important;max-width:none !important;margin:0 !important;padding:0 !important;
  background:none !important;box-shadow:none !important;border:0 !important;display:flex !important;flex-direction:column !important;gap:4px !important}
${GEN} ${ROW} > :not(:first-child){grid-column:2 !important;justify-self:end !important;margin:0 !important}
${GEN} ${ROW} > :not(:first-child):not([role="switch"]){width:auto !important}
${GEN} ${ROW} > [class*="_cubeRow"]{grid-column:1 / -1 !important;justify-self:stretch !important;width:100% !important}
${GEN} ${ROW} [class*="_chevron"]{display:none !important}
${OPT} ${TITLES},${GEN} ${ROW} :is([class$="_title"],[class*="Title"],.re-setting-title){color:var(--rs-text) !important;font-size:15px !important;font-weight:600 !important;letter-spacing:.4px;line-height:1.35 !important;margin:0 !important}
${OPT} ${TITLES}::before{content:none !important}
${OPT} :is([class$="_desc"],[class$="_description"],[class*="Description"],.re-setting-description){color:var(--rs-mute) !important;font-size:12.5px !important;line-height:1.5 !important;margin:0 !important}
/* page headings: left-aligned banner with a pink diamond + gold hairline */
${OPT} :is(h2,h3,[class$="_heading"],[class$="_groupHead"],[class$="_sectionTitle"]){display:flex !important;align-items:center;gap:10px;justify-content:flex-start;text-align:left;
  color:var(--rs-text) !important;font:400 18px/1.2 var(--rs-px) !important;letter-spacing:3px;margin:2px 0 6px !important}
${OPT} :is(h2,h3,[class$="_heading"],[class$="_groupHead"],[class$="_sectionTitle"])::before{content:"";flex:none;width:8px;height:8px;transform:rotate(45deg);background:var(--rs-pink);box-shadow:0 0 8px var(--rs-pink)}
${OPT} :is(h2,h3,[class$="_heading"],[class$="_groupHead"],[class$="_sectionTitle"])::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,rgba(var(--rs-gold-rgb),.45),transparent)}
${OPT} :is([class$="_intro"]){color:var(--rs-mute) !important;font-size:12.5px !important;margin:0 0 12px !important;padding-left:18px}

/* unclassed rows from other plugins (e.g. 子代理派遣: label + select + hint) */
${GEN} > div > div:not([class]):has(> label),${GEN} > div:not([class]):has(> label){position:relative;margin:0 0 6px !important;padding:13px 14px 13px 26px !important;border-radius:3px;
  background:linear-gradient(90deg,rgba(255,255,255,.06),rgba(255,255,255,.02) 55%,rgba(255,255,255,.008));box-shadow:inset 0 1px 0 rgba(255,255,255,.05),inset 0 -1px 0 rgba(0,0,0,.4)}
${GEN} > div > div:not([class]):has(> label)::before,${GEN} > div:not([class]):has(> label)::before{content:"";position:absolute;left:10px;top:22px;width:6px;height:6px;transform:rotate(45deg);border:1px solid rgba(var(--rs-gold-rgb),.6)}
${GEN} div:not([class]) > label{display:flex !important;align-items:center;justify-content:space-between;gap:12px;color:var(--rs-text);font-weight:600;font-size:15px}
${GEN} div:not([class]) > label + p{margin:6px 0 0 !important;color:var(--rs-mute) !important;font-size:12.5px !important;padding:0 !important}
${OPT} select{appearance:none;-webkit-appearance:none;height:34px;padding:0 28px 0 12px !important;font-weight:600;color:var(--rs-text) !important;
  background:linear-gradient(45deg,transparent 50%,var(--rs-pink) 50%) calc(100% - 14px) 50%/5px 5px no-repeat,
    linear-gradient(135deg,var(--rs-pink) 50%,transparent 50%) calc(100% - 9px) 50%/5px 5px no-repeat,
    linear-gradient(180deg,rgba(255,255,255,.08),rgba(0,0,0,.3)) !important;box-shadow:inset 0 -2px 0 rgba(var(--rs-pink-rgb),.6) !important}
${OPT} select option{background:#15172e;color:var(--rs-text)}
/* third-party switches (e.g. 大肥鱼 .re-setting-switch) take the same OFF/ON plate */
${OPT} button:is(.re-setting-switch){position:relative;width:56px !important;height:26px !important;border-radius:3px !important;border:1px solid rgba(170,160,255,.32) !important;
  background:rgba(0,0,0,.4) !important;box-shadow:inset 0 0 8px rgba(0,0,0,.6) !important}
${OPT} button:is(.re-setting-switch).is-on{border-color:var(--rs-pink) !important;background:linear-gradient(90deg,rgba(var(--rs-pink-rgb),.95),#ffb0dc) !important;box-shadow:0 0 12px rgba(var(--rs-pink-rgb),.5) !important}
${OPT} button:is(.re-setting-switch)::after{content:"" !important;position:absolute !important;top:50% !important;left:8px !important;width:10px !important;height:10px !important;margin-top:-5px;
  transform:rotate(45deg) !important;border-radius:1px !important;background:var(--rs-mute) !important;box-shadow:none !important;transition:left .2s}
${OPT} button:is(.re-setting-switch).is-on::after{left:calc(100% - 18px) !important;background:#fff !important;box-shadow:0 0 6px #fff !important}
${OPT} button:is(.re-setting-switch) > *{display:none !important}
${OPT} .re-setting-state{font:700 9px/1 var(--rs-data) !important;letter-spacing:1px;color:var(--rs-gold) !important}

/* ---------- controls ---------- */
/* dropdown: a value plate with a pink diamond and an under-glow (鸣潮 设置下拉) */
${OPT} button:is([class*="_selector"],[aria-haspopup="listbox"],[aria-haspopup="menu"]){position:relative;height:36px !important;min-height:36px;padding:0 12px 0 24px !important;gap:8px;
  border-radius:3px !important;clip-path:none !important;border:1px solid rgba(170,160,255,.24) !important;
  background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(0,0,0,.30)) !important;
  box-shadow:inset 0 -2px 0 rgba(var(--rs-pink-rgb),.6),0 2px 10px rgba(0,0,0,.35) !important;color:var(--rs-text) !important;font-weight:600 !important;letter-spacing:.5px}
${OPT} button:is([class*="_selector"],[aria-haspopup="listbox"],[aria-haspopup="menu"])::before{content:"";position:absolute;left:10px;top:50%;width:5px;height:5px;margin-top:-2.5px;transform:rotate(45deg);background:var(--rs-pink);box-shadow:0 0 6px var(--rs-pink)}
${OPT} button:is([class*="_selector"],[aria-haspopup="listbox"],[aria-haspopup="menu"]) svg{color:var(--rs-pink) !important}
${OPT} button:is([class*="_selector"],[aria-haspopup="listbox"],[aria-haspopup="menu"]):is(:hover,[aria-expanded="true"]){border-color:rgba(var(--rs-pink-rgb),.7) !important;
  box-shadow:inset 0 -2px 0 var(--rs-pink),0 0 14px rgba(var(--rs-pink-rgb),.3) !important}
/* switch: OFF / ON track with a diamond thumb */
${OPT} button[role="switch"][class*="_switch_"]{position:relative;flex:none !important;justify-self:end;width:56px !important;min-width:56px !important;max-width:56px !important;height:26px !important;padding:0 !important;
  border-radius:3px !important;border:1px solid rgba(170,160,255,.32) !important;overflow:hidden;cursor:pointer;
  background:repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 2px,transparent 2px 5px),rgba(0,0,0,.4) !important;box-shadow:inset 0 0 8px rgba(0,0,0,.6) !important;transition:background .2s,box-shadow .2s}
${OPT} button[role="switch"][class*="_switch_"]::after{content:"OFF";position:absolute;right:7px;top:50%;transform:translateY(-50%);font:700 8px/1 var(--rs-data);letter-spacing:1px;color:var(--rs-dim)}
${OPT} button[role="switch"][class*="_switch_"] > *{position:absolute !important;left:7px !important;top:50% !important;width:10px !important;height:10px !important;margin:-5px 0 0 !important;
  transform:none !important;rotate:45deg;border-radius:1px !important;background:var(--rs-mute) !important;box-shadow:none !important;transition:left .22s cubic-bezier(.2,.8,.2,1),background .2s}
${OPT} button[role="switch"][class*="_switch_"][aria-checked="true"]{border-color:var(--rs-pink) !important;
  background:linear-gradient(90deg,rgba(var(--rs-pink-rgb),.95),#ffb0dc) !important;box-shadow:0 0 12px rgba(var(--rs-pink-rgb),.5),inset 0 1px 0 rgba(255,255,255,.5) !important}
${OPT} button[role="switch"][class*="_switch_"][aria-checked="true"]::after{content:"ON";right:auto;left:8px;color:#3a0c26}
${OPT} button[role="switch"][class*="_switch_"][aria-checked="true"] > *{left:calc(100% - 17px) !important;background:#fff !important;box-shadow:0 0 6px #fff !important}
/* theme cubes: tiles with corner brackets, lit one gets a ✦ */
${OPT} button[class*="_8HJdBW_themeCube"]{position:relative;border-radius:3px !important;clip-path:none !important;border:1px solid rgba(170,160,255,.2) !important;
  background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(0,0,0,.28)) !important;color:var(--rs-mute) !important;box-shadow:none !important}
${OPT} button[class*="_8HJdBW_themeCube"]:is([aria-pressed="true"],[class*="_8HJdBW_selected"]){color:#fff !important;border-color:rgba(var(--rs-pink-rgb),.85) !important;
  background:${BR('var(--rs-pink)', 8, '2px')},linear-gradient(180deg,rgba(var(--rs-pink-rgb),.26),rgba(var(--rs-pink-rgb),.05)) !important;box-shadow:0 0 16px rgba(var(--rs-pink-rgb),.28) !important}
${OPT} button[class*="_8HJdBW_themeCube"]:is([aria-pressed="true"],[class*="_8HJdBW_selected"])::after{content:"✦";position:absolute;top:3px;right:6px;font-size:10px;color:var(--rs-gold);text-shadow:0 0 6px var(--rs-gold)}
/* number stepper (字号): a digital readout */
${OPT} [class*="bVCLcG_value"],${OPT} [class*="bVCLcG_stepper"] input{font:400 20px/1 var(--rs-px) !important;color:var(--rs-gold) !important;text-align:center}
${OPT} :is([class*="bVCLcG_stepper"],[class*="bVCLcG_value"]){border-radius:3px !important;background:rgba(0,0,0,.4) !important;border:1px solid rgba(var(--rs-gold-rgb),.3) !important;box-shadow:inset 0 0 10px rgba(0,0,0,.6) !important}
${OPT} [class*="bVCLcG_unit"]{color:var(--rs-dim) !important;font:600 11px/1 var(--rs-data) !important}
/* text inputs */
${OPT} :is(input:not([type="range"]):not([type="checkbox"]):not([type="radio"]),textarea,select){border-radius:3px !important;border:1px solid rgba(170,160,255,.24) !important;
  background:rgba(0,0,0,.35) !important;color:var(--rs-text) !important;box-shadow:inset 0 -2px 0 rgba(var(--rs-cyan-rgb),.35) !important}
${OPT} :is(input,textarea,select):focus{border-color:var(--rs-pink) !important;box-shadow:inset 0 -2px 0 var(--rs-pink),0 0 0 2px rgba(var(--rs-pink-rgb),.18) !important;outline:0 !important}
/* plain role=switch from other plugins keeps its own shape, only recoloured */
${OPT} [role="switch"]:not([class*="_switch_"]):not(.ae-sw)[aria-checked="true"]{accent-color:var(--rs-pink)}
/* buttons: primary = 星辉 chamfered plate, secondary = dark plate with cyan brackets */
${OPT} :is(a,button):is([class*="primary" i]):not([role="switch"]){border-radius:0 !important;border:0 !important;color:#2a0b1d !important;font-weight:800 !important;letter-spacing:2px;
  clip-path:${CUT(8)} !important;background:linear-gradient(180deg,#ffe3f2,#ff9bd3 50%,#ff6fbf) !important;box-shadow:inset 0 1px 0 #fff,inset 0 -2px 0 rgba(120,20,80,.35) !important;
  filter:drop-shadow(0 0 8px rgba(var(--rs-pink-rgb),.45));padding-left:18px !important;padding-right:18px !important}
${OPT} :is(a,button):is([class*="secondary" i],[class*="linkButton"],[class*="addButton"],[class*="addModelButton"],[class*="nhfO0a_button"]):not([class*="primary" i]){border-radius:2px !important;clip-path:none !important;
  border:1px solid rgba(170,160,255,.24) !important;color:var(--rs-text) !important;letter-spacing:1px;
  background:${BR('var(--rs-cyan)', 6, '1.5px')},linear-gradient(180deg,rgba(255,255,255,.07),rgba(0,0,0,.3)) !important;box-shadow:none !important}
${OPT} :is(a,button):is([class*="secondary" i],[class*="linkButton"],[class*="addButton"],[class*="addModelButton"],[class*="nhfO0a_button"]):not([class*="primary" i]):hover{border-color:var(--rs-cyan) !important;color:var(--rs-cyan) !important}
${OPT} button[class*="iconButton"]{border-radius:3px !important;border:1px solid rgba(170,160,255,.22) !important;background:rgba(0,0,0,.25) !important;color:var(--rs-cyan) !important;clip-path:none !important}
${OPT} :is(a,button):is([class*="danger" i]){border-radius:2px !important;clip-path:none !important;border:1px solid rgba(255,107,107,.5) !important;color:#ff9a9a !important;
  background:${BR('#ff8a8a', 6, '1.5px')},rgba(255,107,107,.07) !important}

/* ---------- cards: data panels with gold brackets + a tag strip ---------- */
${D}[data-ae-deck] :is([class*="LcmJYa_card"],[class*="LcmJYa_balanceCard"],[class*="zGbnIq_rowCard"],[class*="zGbnIq_setupCard"],[class*="zGbnIq_addPanel"],[class~="qSYn7G_card"],[class*="pbvGtq_cards"] > *){
  position:relative;border-radius:3px !important;clip-path:none !important;border:1px solid rgba(170,160,255,.16) !important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05) !important;
  background:${BR('rgba(var(--rs-gold-rgb),.6)', 10, '1px')},linear-gradient(160deg,rgba(255,255,255,.06),rgba(0,0,0,.22)) !important}
${D}[data-ae-deck] :is([class*="LcmJYa_card"],[class*="LcmJYa_balanceCard"]){margin-top:14px !important}
${D}[data-ae-deck] :is([class*="LcmJYa_card"],[class*="LcmJYa_balanceCard"])::before{position:absolute;top:-8px;left:14px;padding:0 8px;line-height:15px;
  font:700 9px/15px var(--rs-data);letter-spacing:2px;color:var(--rs-gold);background:var(--rs-ink2);border:1px solid rgba(var(--rs-gold-rgb),.35);border-radius:2px}
${D}[data-ae-deck] [class~="LcmJYa_card"]::before{content:"RESONATOR · 共鸣者档案";padding-left:18px;background:url("${asset('polestar-tag.png')}") 4px 50%/13px 13px no-repeat,var(--rs-ink2);padding-left:22px;image-rendering:pixelated}
${D}[data-ae-deck] [class~="LcmJYa_balanceCard"]::before{content:"CREDIT · 星声余额";padding-left:18px;background:url("${asset('polestar-tag.png')}") 4px 50%/13px 13px no-repeat,var(--rs-ink2);padding-left:22px;image-rendering:pixelated}
${D}[data-ae-deck] [class~="qSYn7G_card"]{box-shadow:inset 2px 0 0 rgba(var(--rs-cyan-rgb),.55),inset 0 1px 0 rgba(255,255,255,.05) !important;margin-bottom:8px}
${D}[data-ae-deck] [class~="qSYn7G_card"]:hover{box-shadow:inset 2px 0 0 var(--rs-pink),0 0 14px rgba(var(--rs-pink-rgb),.15) !important}
${D}[data-ae-deck] [class~="qSYn7G_skeletonCard"]{border-radius:3px !important;background:linear-gradient(90deg,rgba(255,255,255,.03),rgba(var(--rs-pink-rgb),.08),rgba(255,255,255,.03)) 0 0/200% 100% !important;animation:ae-rs-skel 1.2s linear infinite}
@keyframes ae-rs-skel{to{background-position:-200% 0}}
${D}[data-ae-deck] [class*="rtSEdW_card"]:not([class*="rtSEdW_cardH"]):not([class*="rtSEdW_cardD"]):not([class*="rtSEdW_cardF"]):not([class*="rtSEdW_cardI"]):not([class*="rtSEdW_cardM"]):not([class*="rtSEdW_cardN"]):not([class*="rtSEdW_cardB"]){
  border-radius:3px !important;clip-path:none !important;border:1px solid rgba(170,160,255,.16) !important;background:linear-gradient(160deg,rgba(255,255,255,.05),rgba(0,0,0,.22)) !important}
${D}[data-ae-deck] [class*="rtSEdW_cardActive"]{border-color:var(--rs-pink) !important;background:${BR('var(--rs-pink)', 10, '2px')},linear-gradient(160deg,rgba(var(--rs-pink-rgb),.14),rgba(0,0,0,.22)) !important;box-shadow:0 0 16px rgba(var(--rs-pink-rgb),.2) !important}
${D}[data-ae-deck] :is([class*="LcmJYa_name"],[class*="zGbnIq_rowName"],[class*="rtSEdW_cardName"],[class*="qSYn7G_cardTitle"]){color:var(--rs-text) !important;font-family:inherit !important;letter-spacing:.5px}
${D}[data-ae-deck] [class*="LcmJYa_amount"]{color:var(--rs-gold) !important;font:400 26px/1 var(--rs-px) !important;text-shadow:0 0 12px rgba(var(--rs-gold-rgb),.45)}
${D}[data-ae-deck] [class*="LcmJYa_amount"] *{font:inherit !important;color:inherit !important}
/* avatar: Aemeath's pixel head instead of the generic person glyph */
${D}[data-ae-deck] [class*="LcmJYa_avatar"]{transform:none !important;width:40px !important;height:40px !important;border-radius:50% !important;overflow:hidden;
  background:url("${asset('pet-half.webp')}") -7px -369px/430px auto no-repeat,radial-gradient(circle at 50% 40%,#3a2a5c,#15122a) !important;
  box-shadow:0 0 0 2px var(--rs-pink),0 0 0 4px rgba(var(--rs-pink-rgb),.18),0 0 14px rgba(var(--rs-pink-rgb),.45) !important;image-rendering:pixelated}
${D}[data-ae-deck] [class*="LcmJYa_avatar"] > *{display:none !important}
${D}[data-ae-deck] [class*="zGbnIq_rowTag"]{border-radius:2px !important;border:1px solid rgba(var(--rs-cyan-rgb),.4);color:var(--rs-cyan) !important;background:rgba(var(--rs-cyan-rgb),.06) !important;font-family:var(--rs-data) !important;letter-spacing:1px}
${D}[data-ae-deck] [class*="zGbnIq_credentialDotConfigured"]{background:var(--rs-cyan) !important;box-shadow:0 0 8px var(--rs-cyan) !important;border-radius:1px !important;transform:rotate(45deg) !important}
${D}[data-ae-deck] [class*="zGbnIq_credentialDotMissing"]{background:#ff8a8a !important;border-radius:1px !important;transform:rotate(45deg) !important}
${D}[data-ae-deck] [class*="pbvGtq_tab"]{border-radius:2px !important}
${D}[data-ae-deck] [class*="pbvGtq_tab"][aria-selected="true"]{color:#fff !important;background:rgba(var(--rs-pink-rgb),.18) !important;box-shadow:inset 0 -2px 0 var(--rs-pink) !important}
${D}[data-ae-deck] code,${D}[data-ae-deck] [class*="qSYn7G_cardMeta"] > *{border-radius:2px !important;font-family:var(--rs-data) !important}

/* ---------- foot: scene tabs + page counter + arrows ---------- */
${D} .ae-st-foot{grid-row:4;position:relative;display:flex;align-items:center;gap:10px;height:60px;padding:0 14px calc(env(safe-area-inset-bottom,0px));
  border-top:1px solid var(--rs-line);background:linear-gradient(0deg,rgba(0,0,0,.30),rgba(0,0,0,.08))}
${D} .ae-st-progress{position:absolute;left:0;right:0;top:-1px;height:2px;overflow:hidden;background:rgba(255,255,255,.04);pointer-events:none}
${D} .ae-st-progress::after{content:"";position:absolute;top:0;height:2px;width:calc(100% / var(--n,1));left:calc(100% / var(--n,1) * var(--a,0));
  background:linear-gradient(90deg,transparent,var(--rs-pink),transparent);box-shadow:0 0 8px var(--rs-pink);transition:left .34s cubic-bezier(.2,.8,.2,1),width .34s}
${D} .ae-st-tabs{flex:1;display:flex;justify-content:center;gap:6px;min-width:0}
${D} .ae-st-foot:not([data-split]) .ae-st-tabs{visibility:hidden}
${D} .ae-st-tab{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:84px;height:44px;padding:6px 14px 0;border:0;background:transparent;cursor:pointer;
  color:var(--rs-dim);transition:color .2s,transform .2s;-webkit-tap-highlight-color:transparent}
${D} .ae-st-tab b{font:400 15px/1 var(--rs-px);letter-spacing:3px}
${D} .ae-st-tab small{font:600 8px/1 var(--rs-data);letter-spacing:2px;opacity:.75}
${D} .ae-st-tab:hover{color:var(--rs-mute)}
${D} .ae-st-tab[data-active]{color:#fff;transform:scale(1.08)}
${D} .ae-st-tab[data-active] b{text-shadow:0 0 10px rgba(var(--rs-pink-rgb),.9)}
${D} .ae-st-tab[data-active] small{color:var(--rs-gold);opacity:1}
${D} .ae-st-tab[data-active]::after{content:"";position:absolute;left:18%;right:18%;bottom:-6px;height:2px;background:var(--rs-pink);box-shadow:0 0 10px var(--rs-pink),0 0 2px #fff}
${D} .ae-st-count{flex:none;min-width:58px;text-align:right;font:600 11px/1 var(--rs-data);color:var(--rs-dim);letter-spacing:1px}
${D} .ae-st-count b{font:400 20px/1 var(--rs-px);color:var(--rs-text);margin-right:3px}
${D} .ae-st-arrow{flex:none;width:36px;height:36px;border-radius:50%;border:1px solid var(--rs-line2);background:rgba(0,0,0,.2);color:var(--rs-text);cursor:pointer;position:relative;
  -webkit-tap-highlight-color:transparent;transition:border-color .2s,color .2s,opacity .2s}
${D} .ae-st-arrow::before{content:"";position:absolute;left:50%;top:50%;width:8px;height:8px;border:solid currentColor;border-width:0 0 2px 2px;transform:translate(-30%,-50%) rotate(45deg)}
${D} .ae-st-arrow[data-dir="1"]::before{transform:translate(-70%,-50%) rotate(-135deg)}
${D} .ae-st-arrow:hover:not(:disabled){border-color:var(--rs-pink);color:var(--rs-pink)}
${D} .ae-st-arrow:disabled{opacity:.3;cursor:default}

/* ---------- page flips ---------- */
${D} .ae-st-beam{position:absolute;left:0;right:0;top:208px;bottom:60px;pointer-events:none;z-index:8;opacity:0}
/* scan (default): a resonance beam sweeps across, the page wipes in behind it */
${D}[data-ae-flip][data-ae-fx="scan"] [class*="VOzbGW_options"]{animation:ae-rs-wipe-n .52s cubic-bezier(.3,.7,.2,1) both}
${D}[data-ae-flip="prev"][data-ae-fx="scan"] [class*="VOzbGW_options"]{animation-name:ae-rs-wipe-p}
${D}[data-ae-flip][data-ae-fx="scan"] .ae-st-beam{opacity:1;animation:ae-rs-beam-n .52s cubic-bezier(.3,.7,.2,1) both;
  background:linear-gradient(90deg,transparent calc(var(--x) - 70px),rgba(var(--rs-pink-rgb),.0) calc(var(--x) - 70px),rgba(var(--rs-pink-rgb),.20) calc(var(--x) - 6px),#fff var(--x),rgba(var(--rs-cyan-rgb),.5) calc(var(--x) + 2px),transparent calc(var(--x) + 18px))}
${D}[data-ae-flip="prev"][data-ae-fx="scan"] .ae-st-beam{animation-name:ae-rs-beam-p;
  background:linear-gradient(270deg,transparent calc(var(--x) - 70px),rgba(var(--rs-pink-rgb),.20) calc(var(--x) - 6px),#fff var(--x),rgba(var(--rs-cyan-rgb),.5) calc(var(--x) + 2px),transparent calc(var(--x) + 18px))}
@property --x{syntax:"<length-percentage>";inherits:false;initial-value:0%}
@keyframes ae-rs-beam-n{from{--x:0%}to{--x:calc(100% + 80px)}}
@keyframes ae-rs-beam-p{from{--x:0%}to{--x:calc(100% + 80px)}}
@keyframes ae-rs-wipe-n{from{clip-path:inset(0 100% 0 0);transform:translateX(18px);opacity:.4}to{clip-path:inset(0 0 0 0);transform:none;opacity:1}}
@keyframes ae-rs-wipe-p{from{clip-path:inset(0 0 0 100%);transform:translateX(-18px);opacity:.4}to{clip-path:inset(0 0 0 0);transform:none;opacity:1}}
/* scene change (系统 ↔ 模组): whole deck re-tunes — pillars drop in staggered */
${D}[data-ae-flip="scene"] .ae-pl{animation:ae-rs-drop .42s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--i,0) * 32ms)}
${D}[data-ae-flip="scene"] [class*="VOzbGW_options"]{animation:ae-rs-tune .5s ease-out both}
@keyframes ae-rs-drop{from{transform:translateY(-26px);opacity:0}to{transform:none;opacity:1}}
@keyframes ae-rs-tune{0%{opacity:0;filter:blur(6px) hue-rotate(40deg)}60%{opacity:1;filter:blur(0)}100%{filter:none}}
/* glitch: electronic-ghost tear */
${D}[data-ae-flip][data-ae-fx="glitch-lite"] [class*="VOzbGW_options"]{animation:ae-rs-glitch .5s steps(1) both}
@keyframes ae-rs-glitch{
  0%{opacity:0;clip-path:inset(0 0 100% 0)}
  12%{opacity:1;clip-path:inset(10% 0 62% 0);transform:translateX(-14px);filter:drop-shadow(3px 0 rgba(var(--rs-pink-rgb),.9)) drop-shadow(-3px 0 rgba(var(--rs-cyan-rgb),.9))}
  28%{clip-path:inset(48% 0 20% 0);transform:translateX(10px)}
  44%{clip-path:inset(0 0 40% 0);transform:translateX(-6px)}
  60%{clip-path:inset(30% 0 0 0);transform:translateX(4px);filter:drop-shadow(2px 0 rgba(var(--rs-pink-rgb),.6))}
  76%{clip-path:inset(0);transform:none;filter:none}
  100%{clip-path:inset(0);transform:none;filter:none;opacity:1}}
/* slide: plain page slide */
${D}[data-ae-flip="next"][data-ae-fx="slide"] [class*="VOzbGW_options"]{animation:ae-rs-slide-n .3s cubic-bezier(.2,.8,.2,1) both}
${D}[data-ae-flip="prev"][data-ae-fx="slide"] [class*="VOzbGW_options"]{animation:ae-rs-slide-p .3s cubic-bezier(.2,.8,.2,1) both}
@keyframes ae-rs-slide-n{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}
@keyframes ae-rs-slide-p{from{transform:translateX(-40px);opacity:0}to{transform:none;opacity:1}}
/* edge bump when there is no further page */
${D}[data-ae-bump="end"] [class*="VOzbGW_options"]{animation:ae-rs-bump-e .35s ease-out}
${D}[data-ae-bump="start"] [class*="VOzbGW_options"]{animation:ae-rs-bump-s .35s ease-out}
@keyframes ae-rs-bump-e{40%{transform:translateX(-10px)}}
@keyframes ae-rs-bump-s{40%{transform:translateX(10px)}}
@media (prefers-reduced-motion:reduce){
  ${D}[data-ae-flip] *,${D} .ae-pl{animation:none !important;transition:none !important}
}
/* ---------- glitch / decrypt page turn ---------- */
/* The overlay owns the whole transition: the real page stays hidden until the
   copy above it has decrypted, so the two never blend into a washed-out mix. */
${D} .ae-gl{position:absolute;z-index:30;pointer-events:none;overflow:hidden;contain:strict;
  background:rgba(var(--rs-ink-rgb,10,11,26),.94);animation:ae-gl-host var(--ae-gl-dur,.64s) linear both}
${D} .ae-gl-inner{position:absolute;inset:0;margin:0 !important;overflow:hidden !important;pointer-events:none !important;
  animation:none !important;transform:none !important}
${D} .ae-gl-inner[data-gl="base"]{opacity:1;filter:contrast(1.15) saturate(1.25);
  text-shadow:2px 0 rgba(var(--ae-pink-rgb),.75),-2px 0 rgba(var(--ae-cyan-rgb),.75),0 0 8px rgba(var(--ae-cyan-rgb),.45)}
${D} .ae-gl-inner[data-gl="split-a"]{opacity:1;mix-blend-mode:screen;color:#ff4fbf !important;
  background:rgba(var(--ae-pink-rgb),.14) !important;text-shadow:0 0 6px #ff4fbf}
${D} .ae-gl-inner[data-gl="split-b"]{opacity:1;mix-blend-mode:screen;color:#4fe6ff !important;
  background:rgba(var(--ae-cyan-rgb),.14) !important;text-shadow:0 0 6px #4fe6ff}
${D} .ae-gl-inner *{color:inherit !important;border-color:currentColor !important;background-image:none !important}
${D} .ae-gl-noise{position:absolute;inset:0;mix-blend-mode:screen}
${D} .ae-gl-noise i{position:absolute;display:block;opacity:0;background:var(--c);
  box-shadow:0 0 8px var(--c);image-rendering:pixelated}
${D} .ae-gl-tear{position:absolute;inset:0;
  background:repeating-linear-gradient(0deg,rgba(0,0,0,0) 0 2px,rgba(var(--ae-pink-rgb),.38) 2px 3px,rgba(0,0,0,0) 3px 7px,rgba(var(--ae-cyan-rgb),.18) 7px 8px);
  mix-blend-mode:screen;animation:ae-gl-tear var(--ae-gl-dur,.64s) steps(8) both}
${D} .ae-gl[data-dir="prev"] .ae-gl-tear{animation-name:ae-gl-tear-p}
${D} .ae-gl-beam{position:absolute;left:0;right:0;height:3px;top:0;
  background:linear-gradient(90deg,transparent,rgba(var(--ae-cyan-rgb),.95) 20%,#fff 50%,rgba(var(--ae-pink-rgb),.95) 80%,transparent);
  box-shadow:0 0 14px 3px rgba(var(--ae-pink-rgb),.7),0 0 4px #fff;animation:ae-gl-beam var(--ae-gl-dur,.64s) cubic-bezier(.5,0,.3,1) both}
${D} .ae-gl[data-dir="prev"] .ae-gl-beam{animation-name:ae-gl-beam-p}
${D} .ae-gl[data-boot]{animation-name:ae-gl-boot}
${D} .ae-gl[data-boot] .ae-gl-beam{height:4px;animation-name:ae-gl-boot-beam}
${D}[data-ae-flip][data-ae-fx="glitch"] [class*="VOzbGW_options"]:not(.ae-gl-inner){animation:ae-gl-in var(--ae-gl-dur,.64s) steps(1) both}
/* lit pillar / counter flicker along with the page */
${D}[data-ae-flip][data-ae-fx="glitch"] .ae-pl[data-active],
${D}[data-ae-flip][data-ae-fx="glitch"] .ae-st-count{animation:ae-gl-chrome var(--ae-gl-dur,.64s) steps(1) both}
${D}[data-ae-flip="scene"][data-ae-fx="glitch"] .ae-st-head,
${D}[data-ae-flip="scene"][data-ae-fx="glitch"] .ae-st-foot{animation:ae-gl-chrome var(--ae-gl-dur,.9s) steps(1) both}
${D}[data-ae-flip="scene"][data-ae-fx="glitch"] .ae-pl{animation:ae-gl-pill var(--ae-gl-dur,.9s) steps(1) both;animation-delay:calc(var(--i,0) * 28ms)}
@keyframes ae-gl-host{0%,82%{opacity:1}100%{opacity:0}}
@keyframes ae-gl-boot{0%{opacity:1;clip-path:inset(49.6% 0 49.6% 0)}9%{clip-path:inset(49.6% 0 49.6% 0);filter:brightness(3)}
  18%{clip-path:inset(0 0 0 0);filter:brightness(1.8)}26%{filter:none}84%{opacity:1}100%{opacity:0;clip-path:inset(0)}}
@keyframes ae-gl-tear{0%{opacity:.9;translate:0 -16px}30%{opacity:1;translate:0 8px}60%{opacity:.6;translate:0 -6px}100%{opacity:0;translate:0 0}}
@keyframes ae-gl-tear-p{0%{opacity:.9;translate:0 16px}30%{opacity:1;translate:0 -8px}60%{opacity:.6;translate:0 6px}100%{opacity:0;translate:0 0}}
@keyframes ae-gl-beam{0%{top:0;opacity:1}80%{opacity:1}100%{top:100%;opacity:0}}
@keyframes ae-gl-beam-p{0%{top:100%;opacity:1}80%{opacity:1}100%{top:0;opacity:0}}
@keyframes ae-gl-boot-beam{0%,8%{top:50%;opacity:1;transform:scaleX(.05)}16%{transform:scaleX(1)}22%{top:0}80%{opacity:1}100%{top:100%;opacity:0}}
@keyframes ae-gl-in{0%,78%{opacity:0}79%{opacity:1;translate:-4px 0}86%{translate:3px 0}92%{translate:0 0}100%{opacity:1;translate:0 0}}
@keyframes ae-gl-chrome{0%{opacity:.35;translate:-5px 0}12%{opacity:1;translate:4px 0}24%{opacity:.5;translate:-2px 0}36%{opacity:1;translate:0 0}
  48%{opacity:.75}60%,100%{opacity:1;translate:0 0}}
@keyframes ae-gl-pill{0%{opacity:0;translate:0 -10px}20%{opacity:1;translate:3px 0}35%{opacity:.4;translate:-3px 0}50%,100%{opacity:1;translate:0 0}}
@media (prefers-reduced-motion:reduce){${D} .ae-gl{display:none}}

/* ---------- phone: full-screen deck ---------- */
@media (max-width:760px){
  ${D}[data-ae-deck]{width:100vw !important;height:100dvh !important;border:0 !important;border-radius:0 !important;box-shadow:none !important;
    padding-top:env(safe-area-inset-top,0px) !important}
  ${D}[data-ae-deck]::before{top:calc(env(safe-area-inset-top,0px) + 6px)}
  ${D} .ae-st-head{height:52px;padding:0 56px}
  ${D}[data-ae-deck] > nav[class*="VOzbGW_nav"]{top:env(safe-area-inset-top,0px) !important;height:52px !important;right:8px !important}
  ${D}[data-ae-deck] > [class*="VOzbGW_content"] > [class*="VOzbGW_header"]{top:env(safe-area-inset-top,0px);height:52px;right:8px}
  ${D}[data-ae-deck] [class*="VOzbGW_close"]{width:40px !important;min-width:40px !important;height:40px !important}
  ${D}[data-ae-deck] [class*="VOzbGW_actions"]{display:none !important}
  ${D} .ae-st-title b{font-size:18px;letter-spacing:3px}
  ${D} .ae-st-pillars{height:128px;padding:0 4px;scroll-snap-type:x proximity}
  ${D} .ae-pl{--w:52px;gap:6px;padding-top:10px;scroll-snap-align:center}
  ${D} .ae-pl-zh{font-size:13px;max-height:62px}
  ${D} .ae-pl[data-active]{--w:132px}
  ${D} .ae-pl[data-active] .ae-pl-full{font-size:18px}
  ${D} .ae-st-beam{top:180px}
  ${D}[data-ae-deck] [class*="VOzbGW_options"]{padding:14px 18px 22px !important}
  ${GEN} ${ROW}{padding:12px 12px 12px 24px !important;column-gap:10px !important}
  ${GEN} ${ROW}::before{left:9px}
  ${D} .ae-st-foot{height:calc(58px + env(safe-area-inset-bottom,0px));gap:6px;padding:0 8px env(safe-area-inset-bottom,0px)}
  ${D} .ae-st-tab{min-width:72px;padding:6px 8px 0}
  ${D} .ae-st-count{min-width:48px}
  ${D} .ae-st-arrow{width:40px;height:40px}
}
`;
}

module.exports = { buildCss };
