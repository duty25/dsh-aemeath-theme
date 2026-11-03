"use strict";
// Global skin, part 2: everything outside the composer that the first skin
// pass left stock — header pixel icons, AI reply "transmission" cards, the
// ask-user question card, approval card, settings dialog, sidebar, menus,
// brand mark, font presets and the composer/dock spacing fix on phones.
// All selectors are scoped under html[data-aemeath][data-ae-skin].
const ICONS = require('./icons.js');
const { asset } = require('./assets.js');

const svgUrl = (name) => {
  const body = ICONS[name] || '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" shape-rendering="crispEdges">${body.replace(/currentColor/g, '#000')}</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};


// Pixel-rounded frame (stepped corners) painted by a pseudo element through a
// 7x7 nine-slice mask: ring at full alpha, interior at `fill` alpha. Colour
// comes from CSS vars so palettes keep working.
const frameMask = (fill) => {
  const ring = 'M2 0h3v1H2zM1 1h1v1H1zM5 1h1v1H5zM0 2h1v3H0zM6 2h1v3H6zM1 5h1v1H1zM5 5h1v1H5zM2 6h3v1H2z';
  const inner = 'M2 1h3v1H2zM1 2h5v3H1zM2 5h3v1H2z';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 7 7" shape-rendering="crispEdges"><path d="${ring}"/><path fill-opacity="${fill}" d="${inner}"/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};
const pixFrame = (sel, color, fill = 0.16, px = 2, pseudo = 'after') => `
${sel}:not([data-mobile-nav="toggle"]):not(#ae-x){position:relative !important}
${sel}:not(#ae-x){isolation:isolate;border:0 !important;border-radius:0 !important;background:none !important;box-shadow:none !important;clip-path:none !important}
${sel}:not(#ae-x)::${pseudo}{content:"" !important;display:block !important;position:absolute !important;inset:0 !important;z-index:-1;pointer-events:none;background:${color} !important;
  -webkit-mask-box-image:${frameMask(fill)} 3 / ${3 * px}px stretch;mask-border:${frameMask(fill)} 3 fill / ${3 * px}px stretch;
  width:auto !important;height:auto !important;margin:0 !important;animation:none !important;filter:none !important;transform:none !important;opacity:1 !important}`;

function buildCss(A) {
  const K = 'html[data-aemeath][data-ae-skin]';
  const SB = `${K}[data-ae-compact-sb] [class*="hHd-Xa_root"]:has([class*="hHd-Xa_wide"])`;
  const PI = 'html[data-aemeath][data-ae-pixel-icons]';
  // Replace a button's stock icon with a pixel icon drawn by a masked ::before.
  const pix = (sel, icon, size = 20) => `
${PI} ${sel}:not([data-mobile-nav="toggle"]):not([data-mobile-nav="fab"]){position:relative !important}
${PI} ${sel} > svg,${PI} ${sel} > span > svg{opacity:0 !important}
${PI} ${sel}::before{content:"";position:absolute;left:50%;top:50%;width:${size}px;height:${size}px;margin:-${size / 2}px 0 0 -${size / 2}px;background:currentColor;-webkit-mask:${svgUrl(icon)} center/contain no-repeat;mask:${svgUrl(icon)} center/contain no-repeat;pointer-events:none;image-rendering:pixelated}`;

  // Paint a pixel icon onto an <svg> element itself (keeps layout, hides strokes).
  const pixSvg = (sel, icon) => `
${PI} ${sel}{background:currentColor !important;-webkit-mask:${svgUrl(icon)} center/contain no-repeat;mask:${svgUrl(icon)} center/contain no-repeat;opacity:1 !important}
${PI} ${sel} > *{visibility:hidden}`;
  return `
/* ================= fonts ================= */
html[data-aemeath][data-ae-font="pixel-title"] [data-phase] header [class*="_crumbs"],
html[data-aemeath][data-ae-font="pixel-title"] [data-phase] header [data-conversation-tabs] button,
html[data-aemeath][data-ae-font="pixel-title"] [class*="_navLabel"],
html[data-aemeath][data-ae-font="pixel-title"] [class*="_navTitle"],
html[data-aemeath][data-ae-font="pixel-title"] [class*="_panelTitle"],
html[data-aemeath][data-ae-font="pixel-title"] [class*="Mbwy4a_title"],
html[data-aemeath][data-ae-font="pixel-title"] .ae-brand-name b{font-family:var(--ae-font-px) !important;font-weight:400 !important;letter-spacing:.5px}
html[data-aemeath][data-ae-font="pixel-title"] [data-phase] header [class*="_crumbs"]{font-size:20px !important;line-height:22px !important}
html[data-aemeath][data-ae-font="pixel-title"] [data-phase] header [data-conversation-tabs] button{font-size:20px !important;line-height:20px !important}
html[data-aemeath][data-ae-font="mono"] body{font-family:ui-monospace,"JetBrains Mono","Sarasa Mono SC","Noto Sans Mono CJK SC",monospace !important}

/* ================= brand ================= */
${K} .ae-dsu-mark{image-rendering:auto;filter:drop-shadow(0 0 4px rgba(var(--ae-pink-rgb),.55))}
${K} .ae-dsu-hero{display:inline-grid;place-items:center;animation:ae-orbit 9s linear infinite}
@keyframes ae-orbit{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
${K} button[class*="_brand"]{filter:none !important}
.ae-brand-name{display:inline-flex;flex-direction:column;justify-content:center;line-height:1;gap:2px;white-space:nowrap;min-width:0}
.ae-brand-name b{font-size:20px;line-height:20px;font-weight:400;color:var(--ae-pink-soft,#ffb3da);text-shadow:0 0 8px rgba(var(--ae-pink-rgb,255,105,183),.45),1px 1px 0 rgba(var(--ae-plum-rgb,13,9,27),.9)}
.ae-brand-name small{font:600 8px/1 ui-monospace,monospace;letter-spacing:1.6px;color:var(--ae-cyan,#77e8ff);opacity:.85}

/* floating "open directory" button: only meaningful on the chat page */
html[data-aemeath] [data-mobile-nav="frame"][data-dshm-page="sidebar"] [data-mobile-nav="fab"]{opacity:0 !important;pointer-events:none !important}
${pix('[data-mobile-nav="fab"]', 'layout')}

/* ================= session header: pixel icons ================= */
${pix('[data-phase] header [data-mobile-nav="toggle"]', 'layout')}
${pix('[data-phase] header [data-mobile-nav="files"]', 'folder')}
${pix('[data-phase] header button[class*="_moreButton"]', 'more')}
${pix('[data-phase] header button[data-sidebar-right-expand]', 'sidebarRight')}
${pix('[data-phase] header button[aria-label="智能体团队"]', 'users', 18)}
${K} [data-phase] header [data-mobile-nav="toggle"],${K} [data-phase] header [data-mobile-nav="files"],
${K} [data-phase] header button[class*="_moreButton"],${K} [data-phase] header button[data-sidebar-right-expand],
${K} [data-phase] header button[aria-label="智能体团队"]{
  border:0 !important;border-radius:12px !important;
  background:radial-gradient(120% 90% at 30% 20%,rgba(var(--ae-pink-rgb),.16),transparent 60%),rgba(var(--ae-plum3-rgb),.55) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.28),0 2px 8px rgba(0,0,0,.28) !important;
  color:var(--ae-pink-soft) !important;clip-path:none !important}
${K} [data-phase] header button[aria-label="智能体团队"]{min-width:32px;min-height:30px;padding:0 10px 0 28px !important;gap:0 !important}
${PI} [data-phase] header button[aria-label="智能体团队"]::before{left:15px !important}
${K} [data-phase] header [data-mobile-nav="toggle"]:active,${K} [data-phase] header [data-mobile-nav="files"]:active,
${K} [data-phase] header button[class*="_moreButton"]:active,${K} [data-phase] header button[data-sidebar-right-expand]:active{background:rgba(var(--ae-pink-rgb),.35) !important;color:#fff !important;transform:scale(.96)}
/* jobs chip + mode chip */

/* tabs: pixel underline + caret */
${K} [data-phase] header [data-conversation-tabs] button{position:relative}
${K} [data-phase] header [data-conversation-tabs] button[class*="Active"]::before{content:"";position:absolute;left:50%;bottom:3px;width:6px;height:3px;margin-left:-3px;background:var(--ae-cyan);box-shadow:-3px 3px 0 var(--ae-cyan),3px 3px 0 var(--ae-cyan)}

/* ================= AI reply: "transmission" card ================= */
${K} [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"]{
  padding:26px 14px 12px 16px !important;border-radius:0 !important;
  background:
    linear-gradient(90deg,rgba(var(--ae-cyan-rgb),.18),rgba(var(--ae-violet-rgb),.10) 55%,transparent) top left/100% 20px no-repeat,
    repeating-linear-gradient(0deg,rgba(255,255,255,.018) 0 1px,transparent 1px 3px),
    rgba(var(--ae-surface-rgb),.72) !important;
  border:1px solid rgba(var(--ae-cyan-rgb),.28) !important;
  box-shadow:inset 3px 0 0 var(--ae-cyan),3px 3px 0 rgba(var(--ae-plum-rgb),.65),0 0 18px rgba(var(--ae-cyan-rgb),.08) !important;
  clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))}
${K} [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"]::before{
  content:"AEMEATH // 通讯" !important;position:absolute;left:12px;top:4px;right:auto;width:auto !important;height:auto !important;clip-path:none !important;opacity:1 !important;
  padding-left:26px;background:url("${asset('polestar-tag.png')}") 0 50%/20px 20px no-repeat !important;image-rendering:pixelated;
  font:400 10px/12px var(--ae-font-px);font-size:20px;line-height:14px;transform:scale(.6);transform-origin:left top;letter-spacing:1px;color:var(--ae-cyan);text-shadow:0 0 6px rgba(var(--ae-cyan-rgb),.6);white-space:nowrap;pointer-events:none}
${K} [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"]::after{
  content:"";position:absolute;right:8px;top:6px;width:24px;height:6px;pointer-events:none;
  background:linear-gradient(90deg,var(--ae-pink) 0 6px,transparent 6px 9px,var(--ae-violet) 9px 15px,transparent 15px 18px,var(--ae-cyan) 18px 24px);animation:ae-blink 2.4s steps(2) infinite}
@keyframes ae-blink{50%{opacity:.35}}
html[style*="color-scheme: light"][data-aemeath][data-ae-skin] [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"]{background:linear-gradient(90deg,rgba(var(--ae-pink-rgb),.16),transparent) top left/100% 20px no-repeat,rgba(255,255,255,.8) !important}

/* ================= user bubble: pixel tail ================= */
${K} [class*="_userRow"] [class*="_bubble"]{border-radius:0 !important;
  clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)}

/* ================= ask-user question card ================= */
${K} [class*="Mbwy4a_card"],${K} [class*="LVzXQa_card"]{
  border-radius:0 !important;border:2px solid rgba(var(--ae-pink-rgb),.6) !important;
  background:${'linear-gradient(var(--ae-cyan),var(--ae-cyan)) top left/14px 2px no-repeat,linear-gradient(var(--ae-cyan),var(--ae-cyan)) top left/2px 14px no-repeat,linear-gradient(var(--ae-cyan),var(--ae-cyan)) bottom right/14px 2px no-repeat,linear-gradient(var(--ae-cyan),var(--ae-cyan)) bottom right/2px 14px no-repeat'},rgba(var(--ae-surface-rgb),.94) !important;
  box-shadow:4px 4px 0 rgba(var(--ae-plum-rgb),.8),0 0 26px rgba(var(--ae-pink-rgb),.22) !important;
  -webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
${K} [class*="Mbwy4a_eyebrow"]{font-family:var(--ae-font-px) !important;font-size:20px !important;line-height:20px !important;transform:scale(.6);transform-origin:left;color:var(--ae-cyan) !important;letter-spacing:1px}
${K} [class*="Mbwy4a_eyebrow"]::before{content:"爱弥斯想问你 · ";padding-left:18px;background:url("${asset('polestar-tag.png')}") 0 50%/14px 14px no-repeat;image-rendering:pixelated}
${K} [class*="Mbwy4a_title"]{color:var(--ae-pink-soft) !important}
${K} [class*="Mbwy4a_option"]{border-radius:0 !important;border:1px solid rgba(var(--ae-pink-rgb),.22) !important;background:rgba(var(--ae-plum3-rgb),.45) !important;margin-bottom:4px}
${K} [class*="Mbwy4a_option"]:hover{border-color:rgba(var(--ae-pink-rgb),.55) !important}
${K} [class*="Mbwy4a_optionSelected"]{border-color:var(--ae-pink) !important;background:linear-gradient(90deg,rgba(var(--ae-pink-rgb),.30),rgba(var(--ae-violet-rgb),.14)) !important;box-shadow:inset 3px 0 0 var(--ae-pink) !important}
${K} [class*="Mbwy4a_number"]{border-radius:0 !important;background:var(--ae-pink) !important;color:var(--ae-plum) !important;font-family:var(--ae-font-px);font-weight:400 !important}
${K} [class*="Mbwy4a_optionSelected"] [class*="Mbwy4a_number"]{background:var(--ae-cyan) !important}
${K} [class*="Mbwy4a_checkbox"]{border-radius:0 !important}
${K} [class*="Mbwy4a_checkboxChecked"]{background:var(--ae-pink) !important;border-color:var(--ae-pink) !important}
${K} [class*="Mbwy4a_field"],${K} [class*="Mbwy4a_customRow"]{border-radius:0 !important}
${K} [class*="Mbwy4a_footer"] button,${K} [class*="LVzXQa_actions"] button,${K} [class*="mna1RW_actionRow"] button{border-radius:0 !important}
${K} [class*="Mbwy4a_footerActions"] button:last-child,${K} [class*="LVzXQa_actions"] button:last-child{
  border:2px solid var(--ae-pink) !important;background:var(--ae-pink) !important;color:var(--ae-plum) !important;box-shadow:inset -2px -2px 0 rgba(0,0,0,.25),2px 2px 0 rgba(var(--ae-plum-rgb),.8) !important}
${K} [class*="Mbwy4a_progress"]{background:repeating-linear-gradient(90deg,var(--ae-pink) 0 6px,transparent 6px 8px) !important}

/* ================= approval card ================= */
${K} [class*="mna1RW_card"]{border-radius:0 !important;border:2px solid rgba(var(--ae-gold-rgb,255,215,106),.65) !important;box-shadow:4px 4px 0 rgba(var(--ae-plum-rgb),.8) !important}
${K} [class*="mna1RW_strip"]{font-family:var(--ae-font-px);font-size:20px !important;line-height:20px !important;background:repeating-linear-gradient(135deg,rgba(255,215,106,.18) 0 8px,rgba(255,215,106,.08) 8px 16px) !important}
${K} [class*="mna1RW_command"]{border-radius:0 !important;border:1px solid rgba(var(--ae-cyan-rgb),.3) !important;background:rgba(var(--ae-plum-rgb),.75) !important}

/* (settings dialog styles moved to settings-skin.js) */
/* ================= sidebar ================= */
${K} [class*="_sidebarCol"] [class*="hHd-Xa_root"],${K} [class*="hHd-Xa_root"]{background:linear-gradient(180deg,rgba(var(--ae-plum2-rgb,26,25,52),.55),rgba(var(--ae-plum-rgb),.25)) !important}
${K} [class*="hHd-Xa_logoRow"]{border-bottom:1px dashed rgba(var(--ae-pink-rgb),.3);padding-bottom:6px;margin-bottom:4px}
${K} [class*="hHd-Xa_panelRow"]{border-radius:0 !important}
${K} [class*="hHd-Xa_panelRow"][class*="hHd-Xa_panelActive"],${K} [class*="hHd-Xa_panelActive"]{background:rgba(var(--ae-pink-rgb),.2) !important;box-shadow:inset 3px 0 0 var(--ae-pink) !important}
${K} [class*="hHd-Xa_iconButton"],${K} [class*="IW6AQa_iconButton"]{border-radius:0 !important}
${K} [class*="_sessionRow"]{clip-path:polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)}
${K} button[class*="_searchButton"]{border-radius:0 !important;border:1px solid rgba(var(--ae-cyan-rgb),.3) !important}
${pix('button[class*="hHd-Xa_iconButton"][aria-label="收起侧边栏"]', 'layout', 18)}
${pix('button[class*="_searchButton"]', 'search', 18)}

/* ================= menus / popovers / dialogs ================= */
${K} [role="menu"],${K} [role="listbox"],${K} [data-phase] header [class$="_menu"]{
  border-radius:0 !important;border:2px solid rgba(var(--ae-pink-rgb),.45) !important;background:rgba(var(--ae-plum2-rgb,26,25,52),.97) !important;box-shadow:4px 4px 0 rgba(0,0,0,.4) !important}
${K} [role="menuitem"],${K} [role="option"]{border-radius:0 !important}
${K} [role="menuitem"]:hover,${K} [role="option"]:hover,${K} [role="option"][aria-selected="true"]{background:rgba(var(--ae-pink-rgb),.2) !important}
${K} [role="dialog"]:not([class*="_panel"]):not(#aemeath-sheet){border-radius:0 !important}


/* ================= hero: brand headline, no preview badge ================= */
html[data-aemeath][data-ae-brand] [class*="_previewBadge"]{display:none !important}
${K} [class*="_titleGroup"] > span:first-child{font-family:var(--ae-font-px) !important;font-weight:400 !important;font-size:40px !important;line-height:44px !important;letter-spacing:2px;
  background:linear-gradient(90deg,var(--ae-pink-soft),var(--ae-pink) 45%,var(--ae-cyan));-webkit-background-clip:text;background-clip:text;color:transparent !important;filter:drop-shadow(2px 2px 0 rgba(var(--ae-plum-rgb),.9))}
@media (max-width:760px){${K} [class*="_titleGroup"] > span:first-child{font-size:30px !important;line-height:34px !important}}
${pixSvg('[class*="pXSMma_folder"] svg, svg[class*="pXSMma_folder"]', 'folder')}
${K} [class*="pXSMma_workspace"]:not([class*="Label"]):not([class*="Row"]),${K} button[class*="cubgiG_seat"]{border-radius:0 !important;border:1px solid rgba(var(--ae-pink-rgb),.35) !important;background:rgba(var(--ae-plum3-rgb),.5) !important;box-shadow:2px 2px 0 rgba(var(--ae-plum-rgb),.7) !important}

/* ================= mode (agent preset) chip, menu and header label ================= */
${pixSvg('svg[class*="cubgiG_seatIcon"]', 'sparkle')}
${pixSvg('svg[class*="SVAs4q_icon"]', 'sparkle')}
${K} svg[class*="cubgiG_seatIcon"],${K} svg[class*="SVAs4q_icon"]{color:var(--ae-pink) !important;filter:drop-shadow(0 0 3px rgba(var(--ae-pink-rgb),.6))}
${K} [data-phase] header [class*="SVAs4q_label"]{border-radius:999px !important;background:linear-gradient(90deg,rgba(var(--ae-pink-rgb),.16),rgba(var(--ae-violet-rgb),.10)) !important;border:0 !important;box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.22) !important;
  color:var(--ae-pink-soft) !important;padding:0 10px 0 7px !important;gap:5px !important;height:24px !important;line-height:24px !important}
${K} [data-phase] header [class*="SVAs4q_label"]::before,${K} [data-phase] header [class*="SVAs4q_label"]::after{content:none !important;display:none !important}
${K} [data-phase] header svg[class*="SVAs4q_icon"]{width:12px !important;height:12px !important;position:static !important;flex:none}
${K} [class*="cubgiG_itemName"]{font-family:var(--ae-font-px) !important;font-size:20px !important;line-height:22px !important;color:var(--ae-pink-soft) !important;display:flex;align-items:center;gap:6px}
${K} [class*="cubgiG_itemName"]::before{content:"";width:12px;height:12px;flex:none;background:var(--ae-cyan);-webkit-mask:${svgUrl('sparkle')} center/contain no-repeat;mask:${svgUrl('sparkle')} center/contain no-repeat}
${K} [role="menuitem"][aria-checked="true"] [class*="cubgiG_itemName"]::before,${K} [aria-selected="true"] [class*="cubgiG_itemName"]::before,${K} [aria-current="true"] [class*="cubgiG_itemName"]::before{width:16px;height:16px;-webkit-mask:none;mask:none;background:url("${asset('gem-shine.png')}") 0 0/128px 16px no-repeat;image-rendering:pixelated;animation:ae-gem 1s steps(8) infinite}
@keyframes ae-gem{to{background-position:-128px 0}}

/* ================= sidebar: workspace tree, footer ================= */
${K} [class*="bhn1Oq_sectionLabel"]{font-family:var(--ae-font-px) !important;font-size:20px !important;line-height:20px !important;color:var(--ae-cyan) !important;letter-spacing:1px}
${K} [class*="bhn1Oq_sectionLabel"]::before{content:"";display:inline-block;width:15px;height:15px;margin-right:6px;vertical-align:-2px;
  background:url("${asset('polestar-tag-strip.png')}") 0 0/30px 15px no-repeat;image-rendering:pixelated;animation:ae-qms 1.6s steps(1) infinite}
@keyframes ae-qms{50%{background-position:-15px 0}}
${pixSvg('[class*="YDXeBa_folder"] svg', 'folder')}
${K} [class*="YDXeBa_folder"] svg{color:var(--ae-pink-soft) !important}
${K} [class*="YDXeBa_projectRow"][aria-expanded="true"] [class*="YDXeBa_folder"] svg{color:var(--ae-pink) !important;filter:drop-shadow(0 0 3px rgba(var(--ae-pink-rgb),.6))}
${K} [class*="YDXeBa_projectRow"]{border-radius:0 !important}
${K} [class*="YDXeBa_projectRow"] [class*="YDXeBa_title"]{font-weight:600;letter-spacing:.3px}
${K} [class*="YDXeBa_projectRow"][aria-expanded="true"] [class*="YDXeBa_title"]{color:var(--ae-pink-soft) !important}
${K} [class*="YDXeBa_sessionRow"]{position:relative}
${K} [class*="YDXeBa_sessionRow"]::before{content:"";position:absolute;left:14px;top:50%;width:4px;height:4px;margin-top:-2px;background:rgba(var(--ae-cyan-rgb),.45)}
${K} [class*="YDXeBa_sessionRow"][aria-current]::before,${K} [class*="YDXeBa_sessionRow"][aria-selected="true"]::before,${K} [class*="YDXeBa_sessionRow"][data-active="true"]::before{background:var(--ae-pink);box-shadow:0 0 6px var(--ae-pink)}
${K} [class*="hHd-Xa_footArea"]{border-top:1px dashed rgba(var(--ae-pink-rgb),.3);padding-top:6px}
${K} button.us-nav,${K} button[class*="VOzbGW_trigger"],${K} [data-mobile-nav="drawer-actions"] button{
  border-radius:0 !important;border:1px solid rgba(var(--ae-pink-rgb),.35) !important;background:rgba(var(--ae-plum3-rgb),.5) !important;box-shadow:2px 2px 0 rgba(var(--ae-plum-rgb),.7) !important;color:var(--ae-pink-soft) !important}
${K} button.us-nav:active,${K} button[class*="VOzbGW_trigger"]:active,${K} [data-mobile-nav="drawer-actions"] button:active{background:var(--ae-pink) !important;color:var(--ae-plum) !important;transform:translate(1px,1px);box-shadow:none !important}
${K} button[class*="VOzbGW_trigger"] [class*="triggerLabel"],${K} button.us-nav span{font-family:var(--ae-font-px);font-size:20px !important;line-height:20px;font-weight:400 !important}
${pixSvg('button[class*="VOzbGW_trigger"] svg', 'cog')}
${pixSvg('button.us-nav svg', 'chart')}
${pixSvg('[data-mobile-nav="explorer"] svg', 'folder')}
${pixSvg('[data-mobile-nav="session-log"] svg', 'arrow-down')}

/* ================= header: background-jobs chip ================= */
${K} [data-phase] header button[class*="QsffPG_trigger"] > svg:not([class*="QsffPG_chevron"]),${K} [data-phase] header button[class*="QsffPG_trigger"] > span:not([class*="QsffPG_count"]):not([class*="QsffPG_chevron"]):not([class*="QsffPG_label"]),${K} [data-phase] header button[class*="QsffPG_trigger"] [class*="pinner"]{display:none !important}
${K} [data-phase] header button[class*="QsffPG_trigger"]{position:relative;border-radius:999px !important;border:0 !important;box-shadow:inset 0 0 0 1px rgba(var(--ae-cyan-rgb),.25) !important;
  background:linear-gradient(90deg,rgba(var(--ae-cyan-rgb),.13),rgba(var(--ae-violet-rgb),.10)) !important;color:var(--ae-cyan) !important;padding:2px 10px 2px 24px !important;min-height:24px !important;gap:4px !important}
${K} [data-phase] header button[class*="QsffPG_trigger"]::before{content:"";position:absolute;left:8px;top:50%;width:12px;height:12px;margin-top:-6px;background:currentColor;-webkit-mask:${svgUrl('echo')} center/contain no-repeat;mask:${svgUrl('echo')} center/contain no-repeat}
${K} [data-phase] header button[class*="QsffPG_trigger"][aria-label*="运行中"]::before{background:var(--ae-pink);animation:ae-twinkle 1.2s steps(2) infinite}
${K} [data-phase] header button[class*="QsffPG_trigger"][aria-label*="运行中"]{box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.3),0 0 8px rgba(var(--ae-pink-rgb),.18) !important}
${K} [class*="QsffPG_panel"],${K} [class*="QsffPG_menu"]{border-radius:0 !important;border:2px solid rgba(var(--ae-cyan-rgb),.45) !important;background:rgba(var(--ae-plum2-rgb,26,25,52),.97) !important;box-shadow:4px 4px 0 rgba(0,0,0,.4) !important}
${K} [class*="QsffPG_rowDot"]{border-radius:0 !important}

/* ================= turn-process row ("爱弥斯调谐中 · 3秒") ================= */
${K} [data-turn-process]{position:relative;overflow:hidden;height:auto !important;min-height:38px;padding:6px 12px 6px 30px !important;border:2px solid rgba(var(--ae-violet-rgb),.5) !important;border-radius:0 !important;
  background:linear-gradient(90deg,rgba(var(--ae-violet-rgb),.20),rgba(var(--ae-pink-rgb),.08) 60%,transparent),rgba(var(--ae-plum-rgb),.55) !important;
  box-shadow:3px 3px 0 rgba(var(--ae-plum-rgb),.75) !important;color:var(--ae-pink-soft) !important;
  clip-path:polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)}
${K} [data-turn-process]::before{content:"";position:absolute;left:10px;top:50%;width:12px;height:12px;margin-top:-6px;background:var(--ae-pink);-webkit-mask:${svgUrl('heart')} center/contain no-repeat;mask:${svgUrl('heart')} center/contain no-repeat;filter:drop-shadow(0 0 3px rgba(var(--ae-pink-rgb),.8))}
${K} [data-turn-process]:disabled::before{width:16px;height:16px;margin-top:-8px;left:8px;-webkit-mask:none;mask:none;filter:none;background:url("${asset('heart-pulse.png')}") 0 0/96px 16px no-repeat;image-rendering:pixelated;animation:ae-heart .6s steps(6) infinite}
@keyframes ae-heart{to{background-position:-96px 0}}
/* "爱弥斯调谐中" running line: pixel tuning bars instead of the whale tail, pink→cyan text sweep */
${K} [data-chat-running]{--dsw-alias-label-deep-diving:rgb(var(--ae-pink-rgb));--dsw-alias-label-deep-diving-shimmer:rgb(var(--ae-cyan-rgb));--dsw-alias-label-shimmer:rgb(var(--ae-cyan-rgb));color:rgb(var(--ae-pink-rgb)) !important;font-weight:600;letter-spacing:.02em}
${K} [data-chat-running] [class*="_runningContent"]{gap:8px !important}
${K} [data-chat-running] [class*="_runningIcon"]{width:19px !important;height:14px !important;contain:none !important;overflow:visible !important;image-rendering:pixelated;
  background:linear-gradient(rgb(var(--ae-pink-rgb)),rgb(var(--ae-pink-rgb))) 0 100%/3px 6px no-repeat,linear-gradient(rgb(var(--ae-pink-rgb)),rgb(var(--ae-pink-rgb))) 4px 100%/3px 11px no-repeat,linear-gradient(rgb(var(--ae-violet-rgb)),rgb(var(--ae-violet-rgb))) 8px 100%/3px 8px no-repeat,linear-gradient(rgb(var(--ae-cyan-rgb)),rgb(var(--ae-cyan-rgb))) 12px 100%/3px 14px no-repeat,linear-gradient(rgb(var(--ae-cyan-rgb)),rgb(var(--ae-cyan-rgb))) 16px 100%/3px 5px no-repeat;
  filter:drop-shadow(0 0 3px rgba(var(--ae-pink-rgb),.55));animation:ae-tune .96s steps(1) infinite}
${K} [data-chat-running] [class*="_runningIcon"] > *{display:none !important}
@keyframes ae-tune{
  0%{background-size:3px 6px,3px 11px,3px 8px,3px 14px,3px 5px}
  17%{background-size:3px 10px,3px 7px,3px 13px,3px 9px,3px 11px}
  33%{background-size:3px 14px,3px 4px,3px 10px,3px 6px,3px 13px}
  50%{background-size:3px 8px,3px 13px,3px 5px,3px 12px,3px 8px}
  67%{background-size:3px 5px,3px 9px,3px 14px,3px 4px,3px 10px}
  83%{background-size:3px 11px,3px 14px,3px 7px,3px 10px,3px 4px}}
${K} [data-chat-running] [class*="_runningDivider"]{height:1px !important;position:relative;overflow:visible;
  background:linear-gradient(90deg,transparent,rgba(var(--ae-pink-rgb),.55) 18%,rgba(var(--ae-violet-rgb),.45) 50%,rgba(var(--ae-cyan-rgb),.55) 82%,transparent) !important}
${K} [data-chat-running] [class*="_runningDivider"]::after{content:"";position:absolute;top:-7px;left:0;width:15px;height:15px;
  background:url("${asset('polestar-tag-strip.png')}") 0 0/30px 15px no-repeat;image-rendering:pixelated;filter:drop-shadow(0 0 4px rgba(var(--ae-cyan-rgb),.8));
  animation:ae-run-star 3.2s linear infinite,ae-qms 1.6s steps(1) infinite}
@keyframes ae-run-star{from{left:0;opacity:0}8%{opacity:1}92%{opacity:1}to{left:calc(100% - 15px);opacity:0}}
@media (prefers-reduced-motion:reduce){${K} [data-chat-running] [class*="_runningIcon"],${K} [data-chat-running] [class*="_runningDivider"]::after{animation:none !important}}
${K} [data-turn-process]:disabled::after{content:"";position:absolute;left:0;bottom:0;height:2px;width:30%;background:repeating-linear-gradient(90deg,var(--ae-cyan) 0 4px,transparent 4px 6px);animation:ae-scan 1.8s linear infinite}
@keyframes ae-beat{50%{transform:scale(.7)}}
@keyframes ae-scan{from{transform:translateX(-100%)}to{transform:translateX(340%)}}
${K} [data-turn-process] [class*="_label"]{font-family:var(--ae-font-px) !important;font-size:20px !important;line-height:22px !important;letter-spacing:.5px;color:inherit !important}
${K} [data-turn-process]:not(:disabled){color:var(--dsw-alias-label-secondary) !important;border-color:rgba(var(--ae-pink-rgb),.3) !important}
${K} [data-turn-process]:not(:disabled)::before{background:var(--ae-cyan);-webkit-mask-image:${svgUrl('check')};mask-image:${svgUrl('check')};filter:none}

/* ================= composer toggle ("收起输入框") ================= */
${K} [data-mobile-nav="composer-toggle"]{position:relative;padding:0 14px 0 30px !important;font-family:var(--ae-font-px) !important;font-size:20px !important;line-height:20px !important;font-weight:400 !important;letter-spacing:1px;
  border:2px solid rgba(var(--ae-pink-rgb),.5) !important;background:linear-gradient(180deg,rgba(var(--ae-plum3-rgb),.85),rgba(var(--ae-plum-rgb),.85)) !important;box-shadow:2px 2px 0 rgba(var(--ae-plum-rgb),.8) !important;height:30px !important;min-height:30px !important}
${K} [data-mobile-nav="composer-toggle"]::before{content:"";position:absolute;left:10px;top:50%;width:14px;height:14px;margin-top:-7px;background:var(--ae-cyan);-webkit-mask:${svgUrl('chevron-down')} center/contain no-repeat;mask:${svgUrl('chevron-down')} center/contain no-repeat;animation:ae-bob 1.6s steps(2) infinite}
html[data-aemeath] [data-dshm-composer="collapsed"] [data-mobile-nav="composer-toggle"]::before{-webkit-mask-image:${svgUrl('chevron-up')};mask-image:${svgUrl('chevron-up')}}
@keyframes ae-bob{50%{transform:translateY(2px)}}


/* ================= step rows: pixel icons for 救世中 (think) and tool rows ================= */
${pixSvg('[data-disclosure-row] [class*="_iconIdle"] svg', 'wave')}
${K} [data-disclosure-row] [class*="_iconIdle"] svg{color:var(--ae-pink) !important;filter:drop-shadow(0 0 3px rgba(var(--ae-pink-rgb),.7));animation:ae-twinkle 2.4s steps(2) infinite}
@keyframes ae-twinkle{50%{opacity:.55}}
${K} [data-disclosure-row] [class*="lcKema_title"]{color:var(--ae-pink-soft) !important;font-weight:600}
${pixSvg('[data-sample="bash"] [class*="_iconIdle"] svg', 'zap')}
${pixSvg('[data-tool] [class*="_iconIdle"] svg', 'echo')}
${pixSvg(':is([data-tool*="read" i],[data-tool="view"]) [class*="_iconIdle"] svg', 'book')}
${pixSvg(':is([data-tool*="write" i],[data-tool*="edit" i]) [class*="_iconIdle"] svg', 'edit')}
${pixSvg(':is([data-tool*="grep" i],[data-tool*="glob" i],[data-tool*="search" i]) [class*="_iconIdle"] svg', 'search')}
${pixSvg(':is([data-tool*="web" i],[data-tool*="fetch" i],[data-tool*="page" i]) [class*="_iconIdle"] svg', 'cloud')}
${pixSvg(':is([data-tool*="agent" i],[data-tool*="teammate" i],[data-tool*="delegate" i]) [class*="_iconIdle"] svg', 'echo')}
${pixSvg(':is([data-tool="read_image"],[data-tool="view_image"]) [class*="_iconIdle"] svg', 'image')}
${pixSvg(':is([data-tool="todo_write"],[data-tool="skill"]) [class*="_iconIdle"] svg', 'notes')}
${pixSvg(':is([data-tool^="job_"],[data-tool="bash"][data-variant="job"]) [class*="_iconIdle"] svg', 'clock')}

${K} :is([data-sample="bash"],[data-tool]) [class*="_iconIdle"] svg{color:var(--ae-cyan) !important}
${K} :is([data-sample="bash"],[data-tool])[data-state="error"] [class*="_iconIdle"] svg{color:#ff5d7a !important}
${K} :is([data-sample="bash"],[data-tool])[data-state="running"] [class*="_iconIdle"] svg{color:var(--ae-pink) !important;animation:ae-twinkle .8s steps(2) infinite}
${K} :is([data-sample="bash"] [class*="CY-8Ka_title"],[data-tool] [class*="iWrAna_title"]){color:var(--ae-pink-soft) !important}


/* ================= step-process summary rows (已完成调谐 / 正在释放共鸣技能) ================= */
${pixSvg('[data-step-process-icon] svg', 'wave')}
${pixSvg('[data-process-activity="thinking"] [data-step-process-icon] svg', 'wave')}
${pixSvg('[data-process-activity="commands"] [data-step-process-icon] svg', 'zap')}
${pixSvg('[data-process-activity="tools"] [data-step-process-icon] svg', 'echo')}
${pixSvg('[data-process-activity="read"] [data-step-process-icon] svg', 'book')}
${pixSvg('[data-process-activity="readImage"] [data-step-process-icon] svg', 'image')}
${pixSvg('[data-process-activity="write"] [data-step-process-icon] svg', 'edit')}
${pixSvg('[data-process-activity="edit"] [data-step-process-icon] svg', 'edit')}
${pixSvg('[data-process-activity="search"] [data-step-process-icon] svg', 'search')}
${pixSvg('[data-process-activity="web"] [data-step-process-icon] svg', 'cloud')}
${pixSvg('[data-process-activity="webSearch"] [data-step-process-icon] svg', 'cloud')}
${pixSvg('[data-process-activity="webFetch"] [data-step-process-icon] svg', 'cloud')}
${pixSvg('[data-process-activity="subagents"] [data-step-process-icon] svg', 'echo')}
${pixSvg('[data-process-activity="agents"] [data-step-process-icon] svg', 'users')}
${pixSvg('[data-process-activity="files"] [data-step-process-icon] svg', 'folder')}
${pixSvg('[data-process-activity="plan"] [data-step-process-icon] svg', 'list')}
${pixSvg('[data-process-activity="todo"] [data-step-process-icon] svg', 'list')}
${pixSvg('[data-process-activity="memory"] [data-step-process-icon] svg', 'notes')}
${pixSvg('[data-process-activity="skills"] [data-step-process-icon] svg', 'notes')}
${pixSvg('[data-process-activity="jobs"] [data-step-process-icon] svg', 'clock')}
${pixSvg('[data-process-activity="questions"] [data-step-process-icon] svg', 'message')}
${K} [data-step-process-icon] svg{color:var(--ae-cyan) !important}
${K} [data-process-activity="thinking"] [data-step-process-icon] svg{color:var(--ae-pink) !important}
${K} [aria-expanded] > [class*="O_Ebla_leading"] [data-step-process-icon] svg{filter:drop-shadow(0 0 3px rgba(var(--ae-cyan-rgb),.6))}
/* tapping a summary row on a phone leaves it :focus-visible (Chrome Android
   treats tap-then-keyboard-less focus as visible) → a pink rounded ring hung
   around 「已唤醒声骸…」. These rows only toggle, so no ring; keyboard users
   still get a quiet underline instead. */
${K} [data-step-process] :is(button,[role="button"],[aria-expanded]),
${K} [data-turn-process],${K} [data-disclosure-row],
${K} [data-chat-flow-kind] :is(button,[role="button"],[aria-expanded]):not([data-composer-card] *){
  outline:none !important;-webkit-tap-highlight-color:transparent}
${K} [data-step-process] :is(button,[role="button"],[aria-expanded]):focus-visible,
${K} [data-turn-process]:focus-visible,${K} [data-disclosure-row]:focus-visible{
  outline:none !important;box-shadow:none !important;text-decoration:underline dotted rgba(var(--ae-cyan-rgb),.7);text-underline-offset:4px}
@media (pointer:coarse){
  ${K} [data-step-process] :is(button,[role="button"],[aria-expanded]):focus-visible,
  ${K} [data-turn-process]:focus-visible,${K} [data-disclosure-row]:focus-visible{text-decoration:none}
}


/* ================= collapsed / emptied flow items: no empty cards ================= */
${K} [data-chat-flow-kind="assistant-step"]:is(:empty,:not(:has(p,pre,ul,ol,table,img,h1,h2,h3,h4,blockquote,[class*="_markdown"],[class*="_body"] *))){
  padding:0 !important;background:none !important;border:0 !important;box-shadow:none !important;clip-path:none !important;min-height:0 !important}
${K} [data-chat-flow-kind="assistant-step"]:is(:empty,:not(:has(p,pre,ul,ol,table,img,h1,h2,h3,h4,blockquote,[class*="_markdown"],[class*="_body"] *)))::before,
${K} [data-chat-flow-kind="assistant-step"]:is(:empty,:not(:has(p,pre,ul,ol,table,img,h1,h2,h3,h4,blockquote,[class*="_markdown"],[class*="_body"] *)))::after{content:none !important;display:none !important}
${K} [class*="EvIC1a_flowItem"]:empty{display:none !important}

/* 0.2.x: a folded turn keeps its step rows in the DOM under
   [data-turn-process-hidden]; the shipped UI fades them, but our card chrome
   (padding + stripes + border) survived the fade and left a stack of empty
   striped bars under "共鸣用时". Collapse those rows outright. */
${K} [data-chat-flow-kind="assistant-step"][data-turn-process-hidden],
${K} [data-chat-flow-kind="assistant-step"][data-chat-motion="collapse"],
${K} [data-chat-flow-kind="assistant-step"]:not(:has(*)){display:none !important}
${K} [data-chat-flow-kind="assistant-step"][data-turn-process-hidden]::before,
${K} [data-chat-flow-kind="assistant-step"][data-turn-process-hidden]::after{content:none !important}

/* bottom bar action buttons (文件浏览 / 导出会话日志 / 使用统计 / 已登录):
   same 7px pixel frame as our own two entrances so the row reads as one set. */
${K} [class*="hHd-Xa_footerActions"] > button:not(.ae-entrance),${K} [class*="hHd-Xa_footerActions"] > div > button:not(.ae-entrance),
${K} [class*="hHd-Xa_settingsArea"] > button{
  position:relative;min-height:38px;border:0 !important;border-radius:0 !important;
  background:rgba(var(--ae-plum3-rgb),.55) !important;color:var(--ae-pink-soft) !important;
  -webkit-mask-image:none;box-shadow:2px 2px 0 rgba(var(--ae-plum-rgb),.75) !important;
  padding:6px 12px !important;clip-path:none;
  border-image:url("${asset('btn-plum.png')}") 4 fill /6px stretch !important;border-width:6px !important;border-style:solid !important}
${K} [class*="hHd-Xa_footerActions"] > button:not(.ae-entrance):hover,${K} [class*="hHd-Xa_settingsArea"] > button:hover{background:rgba(var(--ae-plum3-rgb),.8) !important}
${K} [class*="hHd-Xa_footerActions"] > button:not(.ae-entrance):active,${K} [class*="hHd-Xa_settingsArea"] > button:active{
  border-image-source:url("${asset('btn-plum-pressed.png')}") !important;color:var(--ae-pink) !important;transform:translate(1px,1px);box-shadow:none !important}
${K} [class*="hHd-Xa_footerActions"] > button:not(.ae-entrance) span,${K} [class*="hHd-Xa_settingsArea"] > button span{font-family:var(--ae-font-px) !important;font-size:20px !important;line-height:22px !important;color:inherit !important}
${K} [class*="hHd-Xa_footerActions"] > button:not(.ae-entrance) svg,${K} [class*="hHd-Xa_settingsArea"] > button svg{color:var(--ae-cyan) !important}

/* our two entrances (系统设置 / 插件中心): pink = system, cyan = modules.
   9-slice pixel frame + glyph chip, so they read as the primary pair of the row. */
${K} button.ae-entrance{
  box-sizing:border-box;position:relative;display:inline-flex;align-items:center;justify-content:center;gap:8px;
  min-height:48px;min-width:44px;margin:0;padding:2px 14px 2px 4px;cursor:pointer;-webkit-tap-highlight-color:transparent;
  font:inherit;color:#fff4fb;border-radius:0;outline:none;
  background:linear-gradient(180deg,rgba(var(--ae-pink-rgb),.34),rgba(var(--ae-violet-rgb),.26)) padding-box;
  border-style:solid;border-width:6px;border-color:transparent;border-image:url("${asset('btn-pink.png')}") 4 fill /6px stretch;
  filter:drop-shadow(2px 2px 0 rgba(var(--ae-plum-rgb),.8));transition:filter .15s, transform .08s}
${K} button.ae-entrance[data-ae-entrance="plugins"]{
  color:#effcff;background:linear-gradient(180deg,rgba(var(--ae-cyan-rgb),.26),rgba(var(--ae-violet-rgb),.22)) padding-box;
  border-image-source:url("${asset('btn-cyan.png')}")}
${K} button.ae-entrance[data-wide="true"]{flex:1 1 0;min-width:0;justify-content:flex-start}
${K} button.ae-entrance[data-wide="false"]{padding:2px}
${K} button.ae-entrance .ae-doll{flex:none;display:block;width:40px;height:40px;margin:-4px 0 -2px -2px;
  background:url("${asset('doll-cat.png')}") 0 0/80px 40px no-repeat;image-rendering:pixelated;
  filter:drop-shadow(1px 2px 0 rgba(var(--ae-plum-rgb),.85));transform-origin:50% 100%;
  animation:ae-doll-blink 4.6s steps(1) infinite}
${K} button.ae-entrance .ae-doll[data-doll="aemeath"],${K} button.ae-entrance[data-wide] .ae-doll[data-doll="aemeath"]{
  width:48px !important;height:44px !important;margin:-2px -2px -2px -4px;background:url("${asset('doll-pet.webp')}") 0 0/288px 44px no-repeat !important;
  image-rendering:auto;animation:ae-doll-pet 1.1s steps(6) infinite !important}
@keyframes ae-doll-pet{to{background-position:-288px 0}}
@keyframes ae-doll-blink{0%,90%{background-position:0 0}91%,95%{background-position:-40px 0}96%,100%{background-position:0 0}}
@keyframes ae-doll-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-4px) rotate(-4deg)}70%{transform:translateY(0) scale(1.06,.94)}}
${K} button.ae-entrance:hover .ae-doll{animation:ae-doll-blink 4.6s steps(1) infinite,ae-doll-hop .5s ease-out}
${K} button.ae-entrance:active .ae-doll{transform:scale(1.1,.86)}
${K} .ae-entrance-text{display:flex;flex-direction:column;align-items:flex-start;min-width:0;gap:0}
${K} .ae-entrance-sub{font-family:var(--ae-font-px);font-size:10px;line-height:11px;letter-spacing:.06em;opacity:.72;white-space:nowrap;
  color:var(--ae-pink-soft)}
${K} button.ae-entrance[data-ae-entrance="plugins"] .ae-entrance-sub{color:var(--ae-cyan)}
${K} .ae-entrance-label{font-family:var(--ae-font-px);font-size:20px;line-height:22px;letter-spacing:.04em;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis;text-shadow:1px 1px 0 rgba(var(--ae-plum-rgb),.9)}
${K} button.ae-entrance[data-wide="true"]::after{content:"";position:absolute;right:3px;top:50%;width:4px;height:4px;margin-top:-2px;
  background:currentColor;opacity:.8;box-shadow:-6px 0 0 rgba(255,255,255,.28)}
${K} button.ae-entrance:hover{filter:drop-shadow(2px 2px 0 rgba(var(--ae-plum-rgb),.8)) brightness(1.12)}
${K} button.ae-entrance:active{transform:translate(1px,1px);filter:none;border-image-source:url("${asset('btn-pink-pressed.png')}")}
${K} button.ae-entrance[data-ae-entrance="plugins"]:active{border-image-source:url("${asset('btn-plum-pressed.png')}")}
${K} button.ae-entrance:focus-visible{outline:2px solid var(--ae-cyan);outline-offset:2px}
/* 玩偶展台：玩偶站在上面，名字在下面（窄侧栏横排放不下像素字） */
${K} button.ae-entrance[data-wide="true"]{flex-direction:column;justify-content:flex-end;align-items:center;gap:2px;
  min-height:84px;padding:4px 4px 5px;overflow:hidden}
${K} button.ae-entrance[data-wide="true"]::after{display:none}
${K} button.ae-entrance[data-wide="true"]::before{content:"";position:absolute;left:18%;right:18%;bottom:26px;height:6px;
  background:radial-gradient(ellipse at 50% 50%,rgba(255,255,255,.35),transparent 70%);pointer-events:none}
${K} button.ae-entrance[data-wide="true"] .ae-doll{width:48px;height:48px;margin:0;background-size:96px 48px}
@keyframes ae-doll-blink48{0%,90%{background-position:0 0}91%,95%{background-position:-48px 0}96%,100%{background-position:0 0}}
${K} button.ae-entrance[data-wide="true"] .ae-doll{animation:ae-doll-blink48 4.6s steps(1) infinite}
${K} button.ae-entrance[data-wide="true"]:hover .ae-doll{animation:ae-doll-blink48 4.6s steps(1) infinite,ae-doll-hop .5s ease-out}
${K} button.ae-entrance[data-wide="true"] .ae-entrance-text{align-items:center;max-width:100%}
${K} button.ae-entrance[data-wide="true"] .ae-entrance-label{font-size:20px;line-height:20px;max-width:100%}
${K} button.ae-entrance[data-wide="true"] .ae-entrance-sub{display:none}

/* account row: one quiet framed strip, not a second settings launcher */
${K} button[class*="yHnPSG_trigger"]{min-height:38px;border-radius:0 !important;background:rgba(var(--ae-plum2-rgb),.42) !important;
  border:1px solid rgba(var(--ae-plum3-rgb),.9) !important;box-shadow:none !important;padding:4px 8px !important}
${K} button[class*="yHnPSG_trigger"]:hover{background:rgba(var(--ae-plum3-rgb),.6) !important}
${K} button[class*="yHnPSG_trigger"] [class*="yHnPSG_label"]{font-family:var(--ae-font-px) !important;font-size:20px !important;line-height:22px !important;color:var(--ae-label-2,var(--dsw-alias-label-secondary)) !important}

/* account menu: 「设置」duplicates the sidebar entries, so it is hidden here
   (the item stays in the DOM — our entrances click it programmatically). */
${K} [role="menuitem"][data-ae-dup="settings"]{display:none !important}

/* (settings dialog styles moved to settings-skin.js) */
/* ================= model picker (thinking-effort capsule): clearer hierarchy ================= */
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__popover{border-radius:18px !important;clip-path:none !important;padding:12px !important}
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__model-head{padding:2px 4px 10px !important;border-bottom:1px dashed rgba(var(--ae-pink-rgb),.25);margin-bottom:8px}
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__model-head-value{border-radius:999px;padding:2px 10px !important;background:linear-gradient(90deg,rgba(var(--ae-pink-rgb),.25),rgba(var(--ae-violet-rgb),.18));color:#fff !important;font-weight:600;max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__models{gap:6px !important;padding:2px 2px 6px !important}
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__provider{flex:none !important;border-radius:14px;background:rgba(var(--ae-plum3-rgb),.35);box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.12);overflow:hidden}
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__provider-toggle{border-radius:14px !important;padding:8px 12px 8px 36px !important;position:relative;min-height:46px !important}
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__provider-toggle::before{content:"";position:absolute;left:12px;top:50%;width:16px;height:16px;margin-top:-8px;background:var(--ae-cyan);-webkit-mask:${svgUrl('cloud')} center/contain no-repeat;mask:${svgUrl('cloud')} center/contain no-repeat}
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__provider-toggle[aria-expanded="true"]{background:linear-gradient(90deg,rgba(var(--ae-cyan-rgb),.16),rgba(var(--ae-violet-rgb),.1)) !important;border-radius:14px 14px 0 0 !important}
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__provider-toggle[aria-expanded="true"]::before{background:var(--ae-pink)}
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__provider-name{font-weight:700;font-size:14px;color:var(--dsw-alias-label-primary)}
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__provider-meta{border-radius:999px;padding:1px 8px;background:rgba(var(--ae-cyan-rgb),.12);color:var(--ae-cyan) !important;font-size:11px}
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__provider-models{padding:4px 8px 8px 8px !important;gap:4px !important;border:0 !important;box-shadow:none !important;background:none !important;outline:0 !important}
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__option{border-radius:12px !important;padding:9px 12px 9px 34px !important;position:relative;min-height:42px !important;background:rgba(var(--ae-plum-rgb),.35) !important;box-shadow:none !important;border:0 !important}
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__option::before{content:"";position:absolute;left:12px;top:50%;width:12px;height:12px;margin-top:-6px;border-radius:50%;box-shadow:inset 0 0 0 2px rgba(var(--ae-pink-rgb),.45)}
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__option:hover{background:rgba(var(--ae-pink-rgb),.12) !important}
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__option[aria-selected="true"]{background:linear-gradient(90deg,rgba(var(--ae-pink-rgb),.34),rgba(var(--ae-violet-rgb),.2)) !important;box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.55),0 0 14px rgba(var(--ae-pink-rgb),.18) !important}
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__option[aria-selected="true"]::before{border-radius:0;box-shadow:none;width:14px;height:14px;margin-top:-7px;background:var(--ae-pink);-webkit-mask:${svgUrl('heart')} center/contain no-repeat;mask:${svgUrl('heart')} center/contain no-repeat;filter:drop-shadow(0 0 4px var(--ae-pink));animation:ae-beat 1.4s steps(2) infinite}
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__option[aria-selected="true"] .dsh-reasoning-model__option-name{color:#fff !important;font-weight:700}
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__check{display:none !important}
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__section-label{display:flex;align-items:center;gap:6px}
html[data-aemeath][data-ae-capsule] .dsh-reasoning-model__section-label::before{content:"";width:14px;height:14px;background:var(--ae-pink);-webkit-mask:${svgUrl('sparkle')} center/contain no-repeat;mask:${svgUrl('sparkle')} center/contain no-repeat}


/* ================= header chips & buttons: pixel-rounded frames ================= */
${pixFrame(`${K} [data-phase] header [class*="SVAs4q_label"]`, 'var(--ae-pink)', 0.16)}
${K} [data-phase] header [class*="SVAs4q_label"]{display:inline-flex !important;align-items:center !important;justify-content:center;vertical-align:middle;padding:0 10px 0 8px !important;height:26px !important;line-height:26px !important}
${K} [data-phase] header [class*="SVAs4q_label"]::before{content:none !important;display:none !important}
${K} [data-phase] header svg[class*="SVAs4q_icon"]{display:block !important;align-self:center;margin:0 !important;transform:none !important;vertical-align:middle}
${pixFrame(`${K} [data-phase] header button[class*="QsffPG_trigger"]`, 'var(--ae-cyan)', 0.14)}
${K} [data-phase] header button[class*="QsffPG_trigger"]{padding:2px 10px 2px 26px !important;min-height:26px !important;align-items:center !important}
${K} [data-phase] header button[class*="QsffPG_trigger"][aria-label*="运行中"]::after{background:var(--ae-pink) !important}
${pixFrame(`${K} [data-phase] header :is([data-mobile-nav="toggle"],[data-mobile-nav="files"],button[class*="_moreButton"],button[data-sidebar-right-expand],button[aria-label="智能体团队"])`, 'var(--ae-pink)', 0.2, 2, 'after')}
${K} [data-phase] header :is([data-mobile-nav="toggle"],[data-mobile-nav="files"],button[class*="_moreButton"],button[data-sidebar-right-expand],button[aria-label="智能体团队"]):active::after{background:var(--ae-cyan) !important}


html[data-aemeath][data-ae-hide-bell] #dsh-notify-bell{display:none !important}
/* opening settings from our sidebar entrances: keep the routed-through account menu and the
   half-ready dialog off screen until the requested page is in place */
html[data-ae-opening] [role="menu"],html[data-ae-opening] :not(body):has(> [role="menu"]),
html[data-ae-opening] [class*="VOzbGW_overlay"]{visibility:hidden !important;animation:none !important;transition:none !important}
/* never let the page itself scroll (no "negative one screen" below the app) */
@media (max-width:1023px){html[data-aemeath],html[data-aemeath] body{height:100%;overflow:hidden !important;overscroll-behavior:none !important}}

/* ================= composer: stop the model row sliding under the dock ================= */
${K} [data-composer-seat]{background:linear-gradient(180deg,rgba(var(--ae-plum-rgb),0) 0,rgba(var(--ae-plum-rgb),.78) 26px,rgba(var(--ae-plum-rgb),.9)) !important;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
html[style*="color-scheme: light"][data-aemeath][data-ae-skin] [data-composer-seat]{background:linear-gradient(180deg,rgba(255,247,251,0),rgba(255,247,251,.85) 26px,rgba(255,247,251,.94)) !important}
${K} [data-composer-card] [class$="_row"]{flex-wrap:wrap !important;row-gap:6px !important}
/* popups rendered inside the composer (e.g. GitHub connect) use position:fixed; a blurred ancestor turns
   them into a containing block, so drop the blur and lift the seat while one is open */
${K} :is([data-composer-seat],[data-composer-card]):has(.ghc-backdrop){-webkit-backdrop-filter:none !important;backdrop-filter:none !important;z-index:300 !important}
${K} [data-composer-seat]:has(.ghc-backdrop) *:has(.ghc-backdrop){-webkit-backdrop-filter:none !important;backdrop-filter:none !important;transform:none !important;filter:none !important}
${K} .ghc-backdrop{background:rgba(var(--ae-plum-rgb),.62) !important;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);padding:16px !important;align-items:center !important}
${K} .ghc-panel{max-height:calc(100dvh - 32px) !important;overflow:auto !important;overscroll-behavior:contain;border:1px solid rgba(var(--ae-pink-rgb),.45) !important;border-radius:14px !important;
  background:linear-gradient(180deg,rgba(var(--ae-plum3-rgb),.98),rgba(var(--ae-plum-rgb),.98)) !important;box-shadow:0 0 0 1px rgba(var(--ae-plum-rgb),.8),0 18px 40px rgba(0,0,0,.55),0 0 24px rgba(var(--ae-pink-rgb),.18) !important}
${K} .ghc-panel .ghc-actions{flex-wrap:wrap;position:sticky;bottom:-1px;margin:12px -4px 0 !important;padding:10px 4px 2px;background:linear-gradient(180deg,rgba(var(--ae-plum-rgb),0),rgba(var(--ae-plum-rgb),.98) 40%)}
${K} .ghc-panel .ghc-btn{min-height:40px;border-radius:10px !important}
${K} .ghc-panel .ghc-tabs .ghc-tab{min-height:38px}
${K} [data-composer-card]{overflow:visible !important}
${K} [data-composer-card] ~ [class$="_dock"]{position:relative !important;z-index:0;margin-top:8px !important;flex-wrap:nowrap !important;min-height:40px}
${K} [data-composer-card] ~ [class$="_dock"] > [data-slot="conversation.composer.dock"]{flex:1 1 auto !important;min-width:0 !important;overflow:hidden}
${K} [data-composer-card] ~ [class$="_dock"] > span:last-child{flex:0 0 auto !important}
@media (max-width:760px){
  /* keyboard up: let the text area shrink instead of pushing the tool rows down */
  ${K} [data-mobile-nav="frame"] [data-composer-card] [class$="_scroll"]{max-height:min(var(--dsh-composer-text-max-height,336px),calc(100dvh - var(--dshm-keyboard-inset,0px) - 330px),34dvh) !important;min-height:28px}
  ${K} [data-mobile-nav="frame"] [data-composer-card] [class$="_row"]{padding-bottom:8px !important}
  ${K} [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"]{flex:1 0 100% !important;justify-content:space-between !important;margin-left:0 !important}
}

/* ===== 轮次导航刻度：星辉粉 / 青 ===== */
${K} [class*="eGxaPq_mark"]::before{background:rgba(var(--ae-pink-rgb),.38) !important;border-radius:0 !important;height:3px !important;
  clip-path:polygon(2px 0,100% 0,100% 100%,0 100%,0 2px)}
${K} [class*="eGxaPq_markPreview"]::before{background:var(--ae-cyan) !important}
${K} [class*="eGxaPq_markActive"]::before{background:var(--ae-pink) !important;box-shadow:0 0 6px rgba(var(--ae-pink-rgb),.8)}
${K} [class*="eGxaPq_preview"]{border-radius:10px !important;background:rgba(var(--ae-plum2-rgb),.94) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.35),0 10px 26px rgba(0,0,0,.45) !important;backdrop-filter:blur(10px)}

/* ===== 紧凑侧栏：顶部入口收成一排图标、底部收成两排卡片，把高度让给会话列表 ===== */
${SB} {display:grid !important;grid-template-columns:repeat(5,minmax(0,1fr));column-gap:4px;
  grid-template-rows:auto auto auto minmax(0,1fr) auto;align-content:stretch}
${SB} > *{grid-column:1/-1}
${SB} > [class*="hHd-Xa_logoRow"]{grid-row:1;min-height:0;padding-top:2px;padding-bottom:2px}
${SB} > [class*="hHd-Xa_newSession"]{grid-row:2;margin-bottom:8px !important}
${SB} > [class*="rwa6qG_entry"],${SB} > [class*="hHd-Xa_panelList"] > *{grid-row:3;grid-column:auto}
${SB} > [class*="hHd-Xa_panelList"]{display:contents !important}
${SB}:has(> [class*="hHd-Xa_panelList"] > :nth-child(5)){grid-template-columns:repeat(6,minmax(0,1fr))}
${SB}:has(> [class*="hHd-Xa_panelList"] > :nth-child(6)){grid-template-columns:repeat(7,minmax(0,1fr))}
${SB} > [class*="hHd-Xa_regionArea"]{grid-row:4;min-height:0}
${SB} > [class*="hHd-Xa_footArea"]{grid-row:5}
/* 顶部图标格 */
${SB} > [class*="rwa6qG_entry"],${SB} [class*="hHd-Xa_panelRow"]{
  box-sizing:border-box;display:flex !important;flex-direction:column !important;align-items:center !important;justify-content:center !important;
  gap:4px !important;width:100% !important;min-width:0 !important;height:50px !important;min-height:0 !important;margin:0 0 6px !important;padding:6px 2px 5px !important;
  border-radius:0 !important;background:rgba(var(--ae-plum2-rgb),.55) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.22),inset 0 -2px 0 rgba(0,0,0,.35) !important;
  clip-path:polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)}
${SB} [class*="hHd-Xa_moreAnchor"]{display:block;min-width:0}
${SB} > [class*="rwa6qG_entry"]:active,${SB} [class*="hHd-Xa_panelRow"]:active{transform:translate(1px,1px)}
${SB} [class*="hHd-Xa_panelRow"][class*="hHd-Xa_panelActive"]{background:rgba(var(--ae-pink-rgb),.28) !important;
  box-shadow:inset 0 0 0 1px var(--ae-pink),inset 0 -2px 0 rgba(0,0,0,.35) !important}
${SB} [class*="rwa6qG_entryIcon"],${SB} [class*="hHd-Xa_panelGlyph"]{flex:none;margin:0 !important;color:var(--ae-cyan) !important;transform:scale(1.15)}
${SB} [class*="rwa6qG_entryLabel"],${SB} [class*="hHd-Xa_panelTitle"]{
  display:block !important;max-width:100%;margin:0 !important;font-family:var(--ae-font-px) !important;font-size:10px !important;line-height:11px !important;
  letter-spacing:0 !important;white-space:nowrap !important;overflow:hidden;text-overflow:clip;color:#f3e9ff !important;text-align:center}
${SB} [class*="hHd-Xa_panelRow"][aria-label="自动化任务"] [class*="hHd-Xa_panelTitle"],
${SB} [class*="hHd-Xa_panelRow"][aria-label="Token 用量"] [class*="hHd-Xa_panelTitle"]{font-size:0 !important}
${SB} [class*="hHd-Xa_panelRow"][aria-label="自动化任务"] [class*="hHd-Xa_panelTitle"]::after{content:"自动化";font-size:10px}
${SB} [class*="hHd-Xa_panelRow"][aria-label="Token 用量"] [class*="hHd-Xa_panelTitle"]::after{content:"用量";font-size:10px}
${SB} [class*="hHd-Xa_panelRow"][aria-label="HyperFrames"] [class*="hHd-Xa_panelTitle"]{font-size:0 !important}
${SB} [class*="hHd-Xa_panelRow"][aria-label="HyperFrames"] [class*="hHd-Xa_panelTitle"]::after{content:"视频";font-size:10px}
/* 底部：玩偶卡一排 + 工具格一排 */
${SB} [class*="hHd-Xa_footArea"]{padding-top:6px !important;gap:6px !important}
${SB} [class*="hHd-Xa_footerActions"]{display:grid !important;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px !important;align-items:stretch}
${SB} [class*="hHd-Xa_footerActions"] [data-slot],${SB} [class*="hHd-Xa_footerActions"] div:not([data-slot]):has(> button){display:contents !important}
${SB} [class*="hHd-Xa_footerActions"] button.ae-entrance[data-wide]{grid-column:span 2;flex-direction:row;justify-content:flex-start;align-items:center;gap:4px;min-width:0;
  min-height:50px;height:50px;padding:2px 6px 2px 4px;overflow:hidden}
${SB} [class*="hHd-Xa_footerActions"] button.ae-entrance[data-wide] .ae-doll{flex:none;width:34px;height:34px;background-size:68px 34px;animation-name:ae-doll-blink}
${SB} [class*="hHd-Xa_footerActions"] button.ae-entrance[data-wide]:hover .ae-doll{animation-name:ae-doll-blink,ae-doll-hop}
${SB} [class*="hHd-Xa_footerActions"] button.ae-entrance[data-wide]::before{display:none}
${SB} [class*="hHd-Xa_footerActions"] button.ae-entrance[data-wide] .ae-entrance-text{flex:1 1 auto;min-width:0;align-items:flex-start;gap:3px}
${SB} [class*="hHd-Xa_footerActions"] button.ae-entrance[data-wide] .ae-entrance-label{font-family:inherit;font-size:13px;font-weight:700;line-height:16px;letter-spacing:0;white-space:nowrap;overflow:visible;text-overflow:clip;max-width:none}
${SB} [class*="hHd-Xa_footerActions"] button.ae-entrance[data-wide] .ae-entrance-sub{display:block;font-size:10px;line-height:10px;opacity:1;
  color:#5a1640 !important;text-shadow:none}
${SB} [class*="hHd-Xa_footerActions"] button.ae-entrance[data-wide][data-ae-entrance="plugins"] .ae-entrance-sub{color:#103a52 !important}
${SB} [class*="hHd-Xa_footerActions"] button:not(.ae-entrance){
  box-sizing:border-box;display:flex !important;flex-direction:column !important;align-items:center !important;justify-content:center !important;gap:3px !important;
  width:100% !important;min-width:0 !important;height:44px !important;min-height:0 !important;margin:0 !important;padding:4px 2px !important;
  border:0 !important;border-image:none !important;border-radius:0 !important;background:rgba(var(--ae-plum2-rgb),.55) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-cyan-rgb),.22),inset 0 -2px 0 rgba(0,0,0,.35) !important;filter:none !important;
  font-family:var(--ae-font-px) !important;font-size:10px !important;line-height:11px !important;color:#f3e9ff !important;white-space:nowrap;overflow:hidden;
  clip-path:polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)}
${SB} [class*="hHd-Xa_footerActions"] button:not(.ae-entrance) span{font-family:var(--ae-font-px) !important;font-size:10px !important;line-height:11px !important;
  margin:0 !important;max-width:100%;overflow:hidden;text-overflow:clip;white-space:nowrap}
${SB} [class*="hHd-Xa_footerActions"] button:not(.ae-entrance) svg{flex:none;width:16px !important;height:16px !important;margin:0 !important;color:var(--ae-cyan) !important}
${SB} [class*="hHd-Xa_footerActions"] button:not(.ae-entrance):active{transform:translate(1px,1px)}
${SB} [class*="hHd-Xa_footerActions"] button[aria-label="导出会话日志"] span{font-size:0 !important}
${SB} [class*="hHd-Xa_footerActions"] button[aria-label="导出会话日志"] span::after{content:"导出日志";font-size:10px}
${SB} [class*="hHd-Xa_footerActions"] button.dsh-ling-btn{font-size:12px !important}
${SB} [class*="hHd-Xa_settingsArea"] button[class*="yHnPSG_trigger"]{min-height:34px !important;height:34px}
`;
}

module.exports = { buildCss, svgUrl, pixFrame };
