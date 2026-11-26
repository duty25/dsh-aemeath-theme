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

// High-DPI Wuthering Waves x Aemeath vector icons for chat process & tool rows.
const TOOL_ICONS = {
  // Wuthering Waves Data Bank Calabash (声骸葫芦) + 4-point Polestar core
  echo: '<path d="M10.2 3h3.6M12 3v1.6M9.3 7.6a2.85 2.85 0 0 1 5.4 0c.28.92.08 1.9-.62 2.52 2.02.92 3.42 2.9 3.42 5.23a5.5 5.5 0 0 1-11 0c0-2.33 1.4-4.31 3.42-5.23-.7-.62-.9-1.6-.62-2.52Z" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12.1l.68 2.12 2.12.68-2.12.68L12 17.7l-.68-2.12-2.12-.68 2.12-.68L12 12.1Z" fill="#000"/>',
  // Holographic terminal prompt >_ with resonance spark (bash / pwsh)
  bash: '<rect x="2.5" y="4" width="19" height="16" rx="3.4" fill="none" stroke="#000" stroke-width="1.8"/><path d="M7.2 9.4l3.3 2.7-3.3 2.7M12.4 15h4.3" fill="none" stroke="#000" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="17.8" cy="7.4" r="1.15" fill="#000"/>',
  // Starlight code matrix </> (run_code / 终端运算)
  code: '<path d="M8.4 7.2L3.6 12l4.8 4.8M15.6 7.2L20.4 12l-4.8 4.8M13.6 5.6l-3.2 12.8" fill="none" stroke="#000" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  // Aemeath resonance frequency bars (救世中 / 调谐频率)
  wave: '<path d="M3.5 10.5v3M7.75 7.2v9.6M12 4.2v15.6M16.25 7.2v9.6M20.5 10.5v3" fill="none" stroke="#000" stroke-width="2.15" stroke-linecap="round"/>',
  // Holographic data slate (声痕解读 / read)
  read: '<path d="M6.4 3.2h7.4L18.6 8v12.6a1.6 1.6 0 0 1-1.6 1.6H6.4a1.6 1.6 0 0 1-1.6-1.6V4.8a1.6 1.6 0 0 1 1.6-1.6Z" fill="none" stroke="#000" stroke-width="1.8" stroke-linejoin="round"/><path d="M13.6 3.4V8h4.8M8.2 12.2h7.2M8.2 15.8h5" fill="none" stroke="#000" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>',
  // Holo aperture frame + polestar sun (残像凝视 / read_image)
  image: '<rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="#000" stroke-width="1.8"/><path d="M4.2 17.2l4.8-5 3.2 3.1 2.6-2.5 4.8 4.4" fill="none" stroke="#000" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.8 7l.45 1.35 1.35.45-1.35.45-.45 1.35-.45-1.35-1.35-.45 1.35-.45L15.8 7Z" fill="#000"/>',
  // Starlight quill pen (谱写乐章 / write)
  write: '<path d="M18.8 4.4a2.3 2.3 0 0 1 0 3.25L9.4 17.05 5 18.2l1.15-4.4L15.55 4.4a2.3 2.3 0 0 1 3.25 0Z" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.8 6.2l3.2 3.2M5 20.8h14" fill="none" stroke="#000" stroke-width="1.75" stroke-linecap="round"/>',
  // Precision resonance edit stylus (变奏修订 / edit)
  edit: '<path d="M11.5 4.5H6A2.5 2.5 0 0 0 3.5 7v11A2.5 2.5 0 0 0 6 20.5h11a2.5 2.5 0 0 0 2.5-2.5v-5.5" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round"/><path d="M17.8 3.8a1.9 1.9 0 0 1 2.7 2.7l-7.6 7.6-3.4.8.8-3.4 7.5-7.7Z" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  // Polestar radar magnifier (频率追踪 / grep / glob / search)
  search: '<circle cx="10.6" cy="10.6" r="6.4" fill="none" stroke="#000" stroke-width="1.85"/><path d="M15.4 15.4l4.8 4.8" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/><path d="M10.6 7.5l.56 2.54 2.54.56-2.54.56-.56 2.54-.56-2.54-2.54-.56 2.54-.56.56-2.54Z" fill="#000"/>',
  // Solaris orbital globe (索拉里斯搜寻 / web)
  web: '<circle cx="12" cy="12" r="7.5" fill="none" stroke="#000" stroke-width="1.75"/><ellipse cx="12" cy="12" rx="3.4" ry="7.5" fill="none" stroke="#000" stroke-width="1.45"/><path d="M4.8 12h14.4" fill="none" stroke="#000" stroke-width="1.5"/><path d="M3 15.6c3.6 1.7 14.4-3.2 18-7" fill="none" stroke="#000" stroke-width="1.55" stroke-linecap="round"/>',
  // Hex starlight module core (dev_* / client_guard_* / cordis_*)
  module: '<path d="M12 2.8l7.6 4.4v9.6L12 21.2l-7.6-4.4V7.2L12 2.8Z" fill="none" stroke="#000" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 8.1l.95 2.95L15.9 12l-2.95.95L12 15.9l-.95-2.95L8.1 12l2.95-.95L12 8.1Z" fill="#000"/>',
  // Twin resonance stars (召唤共鸣者 / subagent)
  subagent: '<path d="M9.5 4.2l1.25 4.05L14.8 9.5l-4.05 1.25L9.5 14.8l-1.25-4.05L4.2 9.5l4.05-1.25L9.5 4.2Z" fill="#000"/><path d="M17.2 12.2l.75 2.25 2.25.75-2.25.75-.75 2.25-.75-2.25-2.25-.75 2.25-.75.75-2.25Z" fill="#000"/><path d="M5.5 17.5a8.5 8.5 0 0 0 9.5 1.8" fill="none" stroke="#000" stroke-width="1.65" stroke-linecap="round"/>',
  // Starlight checklist / scroll (plan / todo / skill / memory)
  plan: '<rect x="4" y="3.5" width="16" height="17" rx="2.8" fill="none" stroke="#000" stroke-width="1.8"/><path d="M7.8 9l1.3 1.3 2.3-2.3M13.5 9.2h3M7.8 14.2l1.3 1.3 2.3-2.3M13.5 14.4h3" fill="none" stroke="#000" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>',
  // Orbital chronometer (job / schedule)
  clock: '<circle cx="12" cy="12" r="8.2" fill="none" stroke="#000" stroke-width="1.8"/><path d="M12 7.4V12l3.4 2.1" fill="none" stroke="#000" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"/>',
  // Starlight transmission bubble (questions)
  question: '<path d="M5 5h14a2.2 2.2 0 0 1 2.2 2.2v8.2A2.2 2.2 0 0 1 19 17.6h-7.8l-4.6 3.2v-3.2H5A2.2 2.2 0 0 1 2.8 15.4V7.2A2.2 2.2 0 0 1 5 5Z" fill="none" stroke="#000" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 8.2l.65 2.05 2.05.65-2.05.65L12 13.6l-.65-2.05-2.05-.65 2.05-.65L12 8.2Z" fill="#000"/>',
  // Sleek workspace folder
  folder: '<path d="M3.2 7.5a2 2 0 0 1 2-2h4.2l1.8 2h7.6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5.2a2 2 0 0 1-2-2v-10Z" fill="none" stroke="#000" stroke-width="1.8" stroke-linejoin="round"/>',
};
const vecSvgUrl = (name) => {
  const body = TOOL_ICONS[name] || TOOL_ICONS.echo;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" shape-rendering="geometricPrecision">${body}</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

// Holographic Aemeath Polestar + Orbital Ring + Paper-Plane watermark for the transmission card.
const CARD_CREST_DARK = (() => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">'
    + '<defs>'
    + '<linearGradient id="g" x1="12" y1="12" x2="108" y2="108" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#77e8ff"/><stop offset=".55" stop-color="#c89bff"/><stop offset="1" stop-color="#ff69b7"/></linearGradient>'
    + '</defs>'
    + '<circle cx="66" cy="66" r="46" stroke="url(#g)" stroke-width=".9" stroke-dasharray="3 5" opacity=".26"/>'
    + '<circle cx="66" cy="66" r="34" stroke="#ff85c8" stroke-width=".85" opacity=".18"/>'
    + '<ellipse cx="66" cy="66" rx="50" ry="18" transform="rotate(-26 66 66)" stroke="url(#g)" stroke-width="1" opacity=".28"/>'
    + '<path d="M66 36l4.8 25.2L96 66l-25.2 4.8L66 96l-4.8-25.2L36 66l25.2-4.8L66 36Z" fill="url(#g)" opacity=".18"/>'
    + '<path d="M66 47l2.5 16.5L85 66l-16.5 2.5L66 85l-2.5-16.5L47 66l16.5-2.5L66 47Z" fill="#ffffff" opacity=".22"/>'
    + '<path d="M29 37l17-7-7 16-3-5.5L29 37Z" stroke="#77e8ff" stroke-width="1.15" stroke-linejoin="round" fill="#77e8ff" fill-opacity=".14" opacity=".42"/>'
    + '<circle cx="101" cy="48" r="2.1" fill="#77e8ff" opacity=".38"/>'
    + '<circle cx="42" cy="96" r="1.6" fill="#ff85c8" opacity=".36"/>'
    + '</svg>';
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
})();

const CARD_CREST_LIGHT = (() => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">'
    + '<circle cx="66" cy="66" r="46" stroke="#d94695" stroke-width=".9" stroke-dasharray="3 5" opacity=".18"/>'
    + '<circle cx="66" cy="66" r="34" stroke="#6366f1" stroke-width=".85" opacity=".14"/>'
    + '<ellipse cx="66" cy="66" rx="50" ry="18" transform="rotate(-26 66 66)" stroke="#d94695" stroke-width="1" opacity=".2"/>'
    + '<path d="M66 38l4.5 23.5L94 66l-23.5 4.5L66 94l-4.5-23.5L38 66l23.5-4.5L66 38Z" fill="#d94695" opacity=".12"/>'
    + '<path d="M29 37l17-7-7 16-3-5.5L29 37Z" stroke="#0891b2" stroke-width="1.15" stroke-linejoin="round" fill="#0891b2" fill-opacity=".1" opacity=".3"/>'
    + '</svg>';
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
})();

const CARD_STAR_SVG = (() => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">'
    + '<defs><linearGradient id="s" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#77e8ff"/><stop offset=".52" stop-color="#ffffff"/><stop offset="1" stop-color="#ff69b7"/></linearGradient></defs>'
    + '<path d="M12 2.2l2.1 7.7 7.7 2.1-7.7 2.1L12 21.8l-2.1-7.7L2.2 12l7.7-2.1L12 2.2Z" fill="url(#s)"/>'
    + '<circle cx="18.6" cy="5.4" r="1.4" fill="#ffd98a"/>'
    + '<circle cx="5.4" cy="18.6" r="1.1" fill="#77e8ff"/>'
    + '</svg>';
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
})();

// Subtle starlight corner motif for User (Rover) bubble
const USER_CREST_DARK = (() => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88" fill="none">'
    + '<circle cx="24" cy="64" r="28" stroke="#ffb3da" stroke-width=".9" stroke-dasharray="2.5 4.5" opacity=".24"/>'
    + '<path d="M24 46l2.4 15.6L42 64l-15.6 2.4L24 82l-2.4-15.6L6 64l15.6-2.4L24 46Z" fill="#ffffff" opacity=".16"/>'
    + '<circle cx="48" cy="46" r="1.6" fill="#77e8ff" opacity=".35"/>'
    + '</svg>';
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
})();

// Crisp Polestar check-seal icon for settled TurnProcess ("乐章完成")
const TURN_CHECK_SVG = (() => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">'
    + '<circle cx="12" cy="12" r="9.2" stroke="#000" stroke-width="1.8" stroke-dasharray="42 10" stroke-linecap="round"/>'
    + '<path d="M8.1 12.2l2.7 2.7 5.4-5.6" stroke="#000" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>'
    + '</svg>';
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
})();


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
  // Paint a crisp high-DPI Wuthering Waves x Aemeath vector icon onto an <svg>.
  const vecSvg = (sel, icon) => `
${PI} ${sel}{background:currentColor !important;-webkit-mask:${vecSvgUrl(icon)} center/contain no-repeat;mask:${vecSvgUrl(icon)} center/contain no-repeat;opacity:1 !important;image-rendering:auto !important}
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
${K} .ae-dsu-hero{display:inline-grid;place-items:center;animation:ae-hero-float 4.8s ease-in-out infinite}
@keyframes ae-hero-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
${K} button[class*="_brand"]{filter:none !important}
.ae-brand-name{display:inline-flex;flex-direction:column;justify-content:center;line-height:1;gap:2px;white-space:nowrap;min-width:0}
.ae-brand-name b{font-size:20px;line-height:20px;font-weight:400;color:var(--ae-pink-soft,#ffb3da);text-shadow:0 0 8px rgba(var(--ae-pink-rgb,255,105,183),.45),1px 1px 0 rgba(var(--ae-plum-rgb,13,9,27),.9)}
.ae-brand-name small{font:600 8px/1 ui-monospace,monospace;letter-spacing:1.6px;color:var(--ae-cyan,#77e8ff);opacity:.85}

/* floating "open directory" button: only meaningful on the chat page */
html[data-aemeath]:has([data-mobile-nav="frame"][data-dshm-page="sidebar"]) [data-mobile-nav="fab"]{opacity:0 !important;pointer-events:none !important}
/* a draft session's header already carries the same "open directory" key; drop the duplicate */
html[data-aemeath]:has([data-mobile-nav="frame"] [data-phase] header [data-mobile-nav="toggle"]) [data-mobile-nav="fab"]{display:none !important}
${pix('[data-mobile-nav="fab"]', 'sidebarLeft')}

/* ================= session header: pixel icons ================= */
${pix('[data-phase] header [data-mobile-nav="toggle"]', 'sidebarLeft')}
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

/* ================= AI reply: "transmission" card (Holographic Starlight Terminal) ================= */
${K} [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"]:not(#ae-x){
  position:relative !important;
  padding:40px 15px 16px 18px !important;
  border-radius:0 !important;
  background:
    /* top-right 14px chamfer neon edge */
    linear-gradient(225deg,transparent 8.8px,rgba(var(--ae-cyan-rgb),.88) 9.1px,rgba(var(--ae-pink-rgb),.78) 10.6px,transparent 11px) top right/16px 16px no-repeat,
    /* bottom-left 12px chamfer neon edge */
    linear-gradient(45deg,transparent 7.4px,rgba(var(--ae-pink-rgb),.82) 7.7px,rgba(var(--ae-violet-rgb),.7) 9.1px,transparent 9.5px) bottom left/14px 14px no-repeat,
    /* top-left corner precision highlight */
    linear-gradient(90deg,var(--ae-cyan),transparent) 3px 0/44px 1.5px no-repeat,
    /* bottom-right Aemeath Polestar & Paper-Plane holographic watermark */
    ${CARD_CREST_DARK} right 6px bottom 6px/114px 114px no-repeat,
    /* header luminous hairline divider at y=30px */
    linear-gradient(90deg,rgba(var(--ae-cyan-rgb),.82) 0%,rgba(var(--ae-pink-rgb),.58) 46%,rgba(var(--ae-violet-rgb),.22) 82%,transparent 100%) 0 30px/100% 1px no-repeat,
    /* header iridescent frosted strip (0..30px) */
    linear-gradient(90deg,rgba(var(--ae-cyan-rgb),.22) 0%,rgba(var(--ae-pink-rgb),.14) 48%,rgba(var(--ae-violet-rgb),.09) 80%,rgba(var(--ae-cyan-rgb),.03) 100%) 0 0/100% 30px no-repeat,
    /* left cyan -> violet -> pink energy rail */
    linear-gradient(180deg,var(--ae-cyan) 0%,rgba(var(--ae-violet-rgb),.95) 52%,var(--ae-pink) 100%) 0 0/3px 100% no-repeat,
    /* bottom luminous rose-cyan rim highlight */
    linear-gradient(90deg,transparent 10%,rgba(var(--ae-pink-rgb),.52) 48%,rgba(var(--ae-cyan-rgb),.44) 86%,transparent 100%) 0 100%/100% 1px no-repeat,
    /* ambient corner starlight blooms */
    radial-gradient(240px 130px at 0% 0%,rgba(var(--ae-cyan-rgb),.15),transparent 72%),
    radial-gradient(260px 150px at 100% 100%,rgba(var(--ae-pink-rgb),.15),transparent 72%),
    /* ultra-fine holographic scanlines */
    repeating-linear-gradient(0deg,rgba(255,255,255,.016) 0 1px,transparent 1px 4px),
    /* translucent cosmic glass body */
    linear-gradient(165deg,rgba(var(--ae-plum2-rgb),.82) 0%,rgba(var(--ae-surface-rgb),.76) 54%,rgba(var(--ae-plum-rgb),.86) 100%) !important;
  -webkit-backdrop-filter:blur(12px) saturate(1.24);
  backdrop-filter:blur(12px) saturate(1.24);
  border:1px solid rgba(var(--ae-cyan-rgb),.32) !important;
  border-right-color:rgba(var(--ae-pink-rgb),.24) !important;
  border-bottom-color:rgba(var(--ae-pink-rgb),.28) !important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.14),
    inset 5px 0 16px -8px rgba(var(--ae-cyan-rgb),.55),
    inset -1px -1px 0 rgba(var(--ae-pink-rgb),.18),
    0 10px 26px -12px rgba(var(--ae-plum-rgb),.88),
    0 0 22px -6px rgba(var(--ae-cyan-rgb),.18) !important;
  clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,12px 100%,0 calc(100% - 12px))}
${K} [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"]:not(#ae-x)::before{
  content:"AEMEATH // 通讯" !important;
  position:absolute;left:12px;top:6px;right:auto;width:auto !important;height:18px !important;clip-path:none !important;opacity:1 !important;
  padding-left:23px;
  background:${CARD_STAR_SVG} 0 50%/16px 16px no-repeat !important;
  image-rendering:auto !important;
  animation:ae-card-star-glow 2.8s ease-in-out infinite;
  font:400 20px/18px var(--ae-font-px);
  transform:scale(.62);transform-origin:left center;
  letter-spacing:1.3px;
  color:#dcf8ff;
  text-shadow:0 0 8px rgba(var(--ae-cyan-rgb),.75),0 0 14px rgba(var(--ae-pink-rgb),.38);
  white-space:nowrap;pointer-events:none}
@keyframes ae-card-star-glow{0%,100%{filter:drop-shadow(0 0 3px rgba(var(--ae-cyan-rgb),.55))}50%{filter:drop-shadow(0 0 6px rgba(var(--ae-pink-rgb),.85))}}
/* Top-right animated 5-bar Aemeath resonance frequency meter */
${K} [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"]:not(#ae-x)::after{
  content:"";position:absolute;right:18px;top:9px;width:30px;height:12px;pointer-events:none;
  background:
    linear-gradient(180deg,#ff9ed3,var(--ae-pink)) 0 100%/3px 5px no-repeat,
    linear-gradient(180deg,#f0a4ff,var(--ae-violet)) 6px 100%/3px 10px no-repeat,
    linear-gradient(180deg,#c4f4ff,var(--ae-cyan)) 12px 100%/3px 7px no-repeat,
    linear-gradient(180deg,#ffb8e0,var(--ae-pink)) 18px 100%/3px 11px no-repeat,
    linear-gradient(180deg,#9ef3ff,var(--ae-cyan)) 24px 100%/3px 6px no-repeat;
  filter:drop-shadow(0 0 4px rgba(var(--ae-pink-rgb),.55));
  animation:ae-card-eq 2.2s ease-in-out infinite}
@keyframes ae-card-eq{
  0%,100%{background-size:3px 5px,3px 10px,3px 7px,3px 11px,3px 6px;opacity:.92}
  25%{background-size:3px 9px,3px 6px,3px 11px,3px 7px,3px 10px;opacity:1}
  50%{background-size:3px 11px,3px 12px,3px 5px,3px 9px,3px 5px;opacity:.85}
  75%{background-size:3px 6px,3px 8px,3px 10px,3px 5px,3px 11px;opacity:.98}}
@media (prefers-reduced-motion:reduce){
  ${K} [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"]:not(#ae-x)::before,
  ${K} [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"]:not(#ae-x)::after{animation:none !important}}
/* Richer jewel-glass inner markdown accents inside transmission cards */
${K} [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"] [class*="_markdown"] :not(pre) > code{
  background:linear-gradient(135deg,rgba(var(--ae-pink-rgb),.18),rgba(var(--ae-violet-rgb),.16)) !important;
  border:1px solid rgba(var(--ae-pink-rgb),.30) !important;
  border-radius:5px !important;
  padding:.08em .42em !important;
  color:#ffd6ee !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.10)}
${K} [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"] [class*="_markdown"] strong{
  color:#fff5fb;text-shadow:0 0 10px rgba(var(--ae-pink-rgb),.22)}
${K} [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"] [class*="_markdown"] pre{
  border-radius:8px !important;
  border:1px solid rgba(var(--ae-cyan-rgb),.28) !important;
  background:linear-gradient(90deg,rgba(var(--ae-cyan-rgb),.22),rgba(var(--ae-pink-rgb),.14),transparent) 0 0/100% 2px no-repeat,rgba(9,7,22,.82) !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 6px 18px -8px rgba(0,0,0,.6) !important}
${K} [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"] [class*="_markdown"] blockquote{
  border-left:2.5px solid var(--ae-pink) !important;
  border-radius:0 8px 8px 0;
  background:linear-gradient(90deg,rgba(var(--ae-pink-rgb),.12),rgba(var(--ae-cyan-rgb),.04)) !important;
  padding:6px 12px !important}
${K} [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"] [class*="_markdown"] hr{
  height:1px !important;opacity:.75 !important;
  background:linear-gradient(90deg,transparent,rgba(var(--ae-pink-rgb),.65) 30%,rgba(var(--ae-cyan-rgb),.65) 70%,transparent) !important}
/* Light mode: Sakura Crystal Transmission Card */
html[style*="color-scheme: light"][data-aemeath][data-ae-skin] [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"]:not(#ae-x){
  background:
    linear-gradient(225deg,transparent 8.8px,rgba(var(--ae-pink-rgb),.7) 9.1px,rgba(var(--ae-cyan-rgb),.6) 10.6px,transparent 11px) top right/16px 16px no-repeat,
    linear-gradient(45deg,transparent 7.4px,rgba(var(--ae-pink-rgb),.65) 7.7px,transparent 9.4px) bottom left/14px 14px no-repeat,
    ${CARD_CREST_LIGHT} right 6px bottom 6px/114px 114px no-repeat,
    linear-gradient(90deg,rgba(var(--ae-pink-rgb),.55),rgba(var(--ae-cyan-rgb),.38) 55%,transparent) 0 30px/100% 1px no-repeat,
    linear-gradient(90deg,rgba(var(--ae-pink-rgb),.16),rgba(var(--ae-cyan-rgb),.09) 55%,transparent) 0 0/100% 30px no-repeat,
    linear-gradient(180deg,var(--ae-pink) 0%,var(--ae-violet) 55%,var(--ae-cyan) 100%) 0 0/3px 100% no-repeat,
    linear-gradient(165deg,rgba(255,250,253,.90),rgba(250,245,255,.86)) !important;
  border-color:rgba(var(--ae-pink-rgb),.34) !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 8px 22px -12px rgba(96,32,82,.22) !important}
html[style*="color-scheme: light"][data-aemeath][data-ae-skin] [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"]:not(#ae-x)::before{
  color:#b02472 !important;text-shadow:0 0 6px rgba(var(--ae-pink-rgb),.28)}
html[style*="color-scheme: light"][data-aemeath][data-ae-skin] [data-chat-flow-kind="assistant-step"][data-chat-group-part="response"] [class*="_markdown"] :not(pre) > code{
  background:rgba(var(--ae-pink-rgb),.11) !important;border-color:rgba(var(--ae-pink-rgb),.28) !important;color:#9d1e65 !important}

/* ================= user bubble: Aemeath x Rover Starlight Glass ================= */
${K} [class*="_userRow"] [class*="_bubble"]:not(#ae-x){
  position:relative !important;
  padding:12px 17px 12px 15px !important;
  border-radius:18px 6px 18px 18px !important;
  clip-path:none !important;
  background:
    /* right pink -> violet luminous energy rail (mirrors AI card left rail) */
    linear-gradient(180deg,var(--ae-pink) 0%,var(--ae-violet) 100%) right 0 top 0/3px 100% no-repeat,
    /* bottom-left subtle starlight ring watermark */
    ${USER_CREST_DARK} left 2px bottom 2px/82px 82px no-repeat,
    /* top-right rose starlight bloom */
    radial-gradient(190px 100px at 100% 0%,rgba(var(--ae-pink-rgb),.26),transparent 72%),
    /* translucent sakura-violet cosmic glass */
    linear-gradient(135deg,rgba(var(--ae-pink-rgb),.32) 0%,rgba(var(--ae-violet-rgb),.26) 52%,rgba(var(--ae-plum2-rgb),.80) 100%) !important;
  -webkit-backdrop-filter:blur(12px) saturate(1.28);
  backdrop-filter:blur(12px) saturate(1.28);
  border:1px solid rgba(var(--ae-pink-rgb),.46) !important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.22),
    inset -4px 0 14px -6px rgba(var(--ae-pink-rgb),.65),
    0 10px 24px -12px rgba(var(--ae-pink-rgb),.46),
    0 4px 12px -4px rgba(0,0,0,.45) !important;
  color:#fff7fc !important;
  overflow:hidden}
${K} [class*="_userRow"] [class*="_bubble"]:not(#ae-x)::after{
  content:"";position:absolute;right:8px;top:6px;width:11px;height:11px;pointer-events:none;opacity:.82;
  background:${CARD_STAR_SVG} center/contain no-repeat;
  filter:drop-shadow(0 0 4px rgba(var(--ae-pink-rgb),.75))}
html[style*="color-scheme: light"][data-aemeath][data-ae-skin] [class*="_userRow"] [class*="_bubble"]:not(#ae-x){
  background:
    linear-gradient(180deg,var(--ae-pink) 0%,var(--ae-violet) 100%) right 0 top 0/3px 100% no-repeat,
    linear-gradient(135deg,rgba(255,222,240,.92),rgba(238,228,255,.88)) !important;
  border-color:rgba(var(--ae-pink-rgb),.42) !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 6px 18px -10px rgba(200,50,130,.28) !important;
  color:#381632 !important}
/* user attached image thumbnails */
${K} [class*="_userRow"] [class*="_attachmentRow"] :is(button,a,img){
  border-radius:12px !important}
${K} [class*="_userRow"] [class*="_attachmentRow"] > *{
  border:1px solid rgba(var(--ae-pink-rgb),.36) !important;
  border-radius:12px !important;
  box-shadow:0 6px 16px -6px rgba(0,0,0,.55),0 0 10px -4px rgba(var(--ae-pink-rgb),.35) !important;
  overflow:hidden}

/* ================= chat page polish: message actions, scroll-to-bottom orb, composer attachments & process rail ================= */
/* message action bar (copy / feedback / share / timestamp) */
${K} [class*="_actions"][data-clock] button[class*="_action"],
${K} [data-turn-tail] button,
${K} [data-chat-flow-kind="user"] [data-clock] button{
  border-radius:9px !important;
  color:rgba(232,216,255,.72) !important;
  transition:background .15s ease,color .15s ease,transform .12s ease !important}
${K} [class*="_actions"][data-clock] button[class*="_action"]:hover,
${K} [data-turn-tail] button:hover,
${K} [data-chat-flow-kind="user"] [data-clock] button:hover{
  background:rgba(var(--ae-pink-rgb),.18) !important;
  color:#ffe6f4 !important}
${K} [class*="_actions"][data-clock] button[class*="_action"]:active,
${K} [data-turn-tail] button:active{transform:scale(.92)}
${K} [class*="_actions"][data-clock] :is([class*="_timeStart"],[class*="_timeEnd"]){
  font-family:ui-monospace,"SFMono-Regular",Menlo,monospace !important;
  font-size:11.5px !important;letter-spacing:.3px;
  color:rgba(218,206,246,.62) !important}
html[style*="color-scheme: light"][data-aemeath][data-ae-skin] [class*="_actions"][data-clock] button[class*="_action"],
html[style*="color-scheme: light"][data-aemeath][data-ae-skin] [data-turn-tail] button{color:rgba(98,42,84,.7) !important}
html[style*="color-scheme: light"][data-aemeath][data-ae-skin] [class*="_actions"][data-clock] :is([class*="_timeStart"],[class*="_timeEnd"]){color:rgba(110,56,96,.62) !important}

/* floating scroll-to-bottom orb (回到底部) */
${K} button[class*="_toBottom"]:not(#ae-x){
  width:36px !important;height:36px !important;min-width:36px !important;min-height:36px !important;
  border-radius:50% !important;border:0 !important;
  color:#ffe4f4 !important;
  background:
    radial-gradient(circle at 30% 25%,rgba(var(--ae-pink-rgb),.34),transparent 62%),
    linear-gradient(160deg,rgba(var(--ae-plum2-rgb),.92),rgba(var(--ae-plum-rgb),.96)) !important;
  -webkit-backdrop-filter:blur(12px) saturate(1.3);backdrop-filter:blur(12px) saturate(1.3);
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.48),inset 0 1px 0 rgba(255,255,255,.22),0 6px 18px -4px rgba(0,0,0,.72),0 0 16px -4px rgba(var(--ae-pink-rgb),.55) !important;
  transition:transform .14s ease,box-shadow .16s ease,background .16s ease !important}
${K} button[class*="_toBottom"]:not(#ae-x):active{transform:scale(.92)}
html[style*="color-scheme: light"][data-aemeath][data-ae-skin] button[class*="_toBottom"]:not(#ae-x){
  color:#8f1e5d !important;
  background:linear-gradient(160deg,rgba(255,250,253,.96),rgba(255,232,244,.92)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.38),0 6px 16px -6px rgba(160,40,105,.25) !important}

/* fix stretched oval X remove button on composer image thumbnails */
${K} [data-composer-card] [class*="_imageItem"] [class*="_thumbnail"]:not(#ae-x){
  border-radius:12px !important;
  border:1px solid rgba(var(--ae-pink-rgb),.42) !important;
  box-shadow:0 4px 12px -4px rgba(0,0,0,.55) !important}
${K} [data-composer-card] [class*="_imageItem"] button[class*="_remove"]:not(#ae-x){
  top:4px !important;right:4px !important;
  width:20px !important;height:20px !important;min-width:20px !important;min-height:20px !important;
  padding:0 !important;margin:0 !important;border-radius:50% !important;
  display:grid !important;place-items:center !important;
  background:rgba(var(--ae-plum-rgb),.88) !important;
  color:#ffe4f4 !important;
  border:1px solid rgba(var(--ae-pink-rgb),.58) !important;
  box-shadow:0 2px 8px rgba(0,0,0,.55),0 0 6px rgba(var(--ae-pink-rgb),.35) !important}
${K} [data-composer-card] [class*="_imageItem"] button[class*="_remove"]:not(#ae-x) svg{
  width:11px !important;height:11px !important}

/* subtle vertical starlight thread inside expanded step-process rows */
${K} [data-step-process] > button{
  border-radius:10px !important;
  padding:3px 8px 3px 4px !important;
  transition:background .15s ease !important}
${K} [data-step-process] > button:hover{background:rgba(var(--ae-pink-rgb),.09) !important}
${K} [data-step-process-content]{
  position:relative;
  border-left:1px solid rgba(var(--ae-cyan-rgb),.18);
  margin-left:9px;padding-left:10px}

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
${K} [class*="hHd-Xa_panelRow"][class*="hHd-Xa_panelActive"],${K} [class*="hHd-Xa_panelActive"],${K} [class*="hHd-Xa_panelEntryActive"] [class*="hHd-Xa_panelRow"]{background:rgba(var(--ae-pink-rgb),.2) !important;box-shadow:inset 3px 0 0 var(--ae-pink) !important}
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

/* ================= turn-process row ("乐章完成 · 用时 ...") ================= */
${K} [data-turn-process]:not(#ae-x){
  position:relative !important;overflow:hidden !important;
  height:auto !important;min-height:36px !important;
  padding:6px 12px 6px 36px !important;margin:4px 0 6px !important;
  border:1px solid rgba(var(--ae-cyan-rgb),.32) !important;
  border-right-color:rgba(var(--ae-pink-rgb),.26) !important;
  border-radius:12px !important;clip-path:none !important;
  background:
    linear-gradient(90deg,var(--ae-cyan),var(--ae-violet) 55%,var(--ae-pink)) 0 100%/100% 1.5px no-repeat,
    linear-gradient(95deg,rgba(var(--ae-cyan-rgb),.15) 0%,rgba(var(--ae-violet-rgb),.14) 52%,rgba(var(--ae-pink-rgb),.11) 100%),
    rgba(var(--ae-plum2-rgb),.72) !important;
  -webkit-backdrop-filter:blur(10px) saturate(1.22);backdrop-filter:blur(10px) saturate(1.22);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 6px 18px -10px rgba(0,0,0,.65),0 0 14px -6px rgba(var(--ae-cyan-rgb),.26) !important;
  color:#f5e6ff !important;
  transition:border-color .16s ease,box-shadow .16s ease,background .16s ease !important}
${K} [data-turn-process]:not(#ae-x):hover:not(:disabled){
  border-color:rgba(var(--ae-pink-rgb),.46) !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 6px 18px -10px rgba(0,0,0,.7),0 0 16px -5px rgba(var(--ae-pink-rgb),.38) !important}
${K} [data-turn-process]:not(#ae-x)::before{
  content:"" !important;position:absolute;left:11px;top:50%;width:16px;height:16px;margin-top:-8px;
  background:linear-gradient(135deg,#9ff6ff,var(--ae-cyan) 55%,var(--ae-pink)) !important;
  -webkit-mask:${TURN_CHECK_SVG} center/contain no-repeat !important;
  mask:${TURN_CHECK_SVG} center/contain no-repeat !important;
  filter:drop-shadow(0 0 4px rgba(var(--ae-cyan-rgb),.72));animation:none !important}
${K} [data-turn-process]:not(#ae-x)::after{content:none !important;display:none !important}
${K} [data-turn-process] [class*="_label"]:not(#ae-x){
  font-family:inherit !important;font-size:13px !important;line-height:20px !important;
  font-weight:600 !important;letter-spacing:.35px !important;
  color:#f5e4ff !important;
  display:inline-flex !important;align-items:baseline !important;gap:1px !important;
  flex:1 1 auto !important;min-width:0 !important;overflow:hidden !important;text-overflow:ellipsis !important}
${K} [data-turn-process] [class*="_durationNumber"]{
  font-family:ui-monospace,"SFMono-Regular",Menlo,monospace !important;
  font-size:13px !important;font-weight:700 !important;
  color:#90f3ff !important;text-shadow:0 0 8px rgba(var(--ae-cyan-rgb),.48);
  margin:0 2px}
${K} [data-turn-process] svg[class*="_chevron"]{
  margin-left:auto !important;width:15px !important;height:15px !important;
  color:rgba(255,204,234,.82) !important}
html[style*="color-scheme: light"][data-aemeath][data-ae-skin] [data-turn-process]:not(#ae-x){
  background:
    linear-gradient(90deg,var(--ae-pink),var(--ae-violet) 55%,var(--ae-cyan)) 0 100%/100% 1.5px no-repeat,
    linear-gradient(95deg,rgba(var(--ae-pink-rgb),.12),rgba(var(--ae-cyan-rgb),.09)),
    rgba(255,250,253,.88) !important;
  border-color:rgba(var(--ae-pink-rgb),.3) !important;
  color:#481c3e !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 4px 12px -8px rgba(140,40,95,.2) !important}
html[style*="color-scheme: light"][data-aemeath][data-ae-skin] [data-turn-process] [class*="_label"]:not(#ae-x){color:#481c3e !important}
html[style*="color-scheme: light"][data-aemeath][data-ae-skin] [data-turn-process] [class*="_durationNumber"]{color:#b02472 !important;text-shadow:none}
/* "爱弥斯调谐中" running line: sleek starlight equalizer bars + pink→cyan sweep */
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
  background:${CARD_STAR_SVG} center/contain no-repeat;filter:drop-shadow(0 0 4px rgba(var(--ae-cyan-rgb),.8));
  animation:ae-run-star 3.2s linear infinite}
@keyframes ae-run-star{from{left:0;opacity:0}8%{opacity:1}92%{opacity:1}to{left:calc(100% - 15px);opacity:0}}
@media (prefers-reduced-motion:reduce){${K} [data-chat-running] [class*="_runningIcon"],${K} [data-chat-running] [class*="_runningDivider"]::after{animation:none !important}}
@keyframes ae-beat{50%{transform:scale(.7)}}
@keyframes ae-scan{from{transform:translateX(-100%)}to{transform:translateX(340%)}}

/* ================= composer toggle ("收起输入框") ================= */
${K} [data-mobile-nav="composer-toggle"]{position:relative;padding:0 14px 0 30px !important;font-family:var(--ae-font-px) !important;font-size:20px !important;line-height:20px !important;font-weight:400 !important;letter-spacing:1px;
  border:2px solid rgba(var(--ae-pink-rgb),.5) !important;background:linear-gradient(180deg,rgba(var(--ae-plum3-rgb),.85),rgba(var(--ae-plum-rgb),.85)) !important;box-shadow:2px 2px 0 rgba(var(--ae-plum-rgb),.8) !important;height:30px !important;min-height:30px !important}
${K} [data-mobile-nav="composer-toggle"]::before{content:"";position:absolute;left:10px;top:50%;width:14px;height:14px;margin-top:-7px;background:var(--ae-cyan);-webkit-mask:${svgUrl('chevron-down')} center/contain no-repeat;mask:${svgUrl('chevron-down')} center/contain no-repeat;animation:ae-bob 1.6s steps(2) infinite}
html[data-aemeath] [data-dshm-composer="collapsed"] [data-mobile-nav="composer-toggle"]::before{-webkit-mask-image:${svgUrl('chevron-up')};mask-image:${svgUrl('chevron-up')}}
@keyframes ae-bob{50%{transform:translateY(2px)}}


/* ================= step rows: high-DPI Wuthering Waves x Aemeath vector icons ================= */
${vecSvg('[data-disclosure-row] [class*="_iconIdle"] svg', 'wave')}
${K} [data-disclosure-row] [class*="_iconIdle"] svg{
  width:15px !important;height:15px !important;
  color:var(--ae-pink) !important;
  filter:drop-shadow(0 0 4px rgba(var(--ae-pink-rgb),.65));
  animation:ae-breathe 2.6s ease-in-out infinite}
@keyframes ae-breathe{0%,100%{opacity:1}50%{opacity:.62}}
@keyframes ae-twinkle{50%{opacity:.55}}
${K} [data-disclosure-row] [class*="lcKema_title"]{color:var(--ae-pink-soft) !important;font-weight:600}

/* Tool rows: ordered from generic fallback -> semantic categories -> specific tools */
${vecSvg('[data-tool] [class*="_iconIdle"] svg', 'echo')}
${vecSvg(':is([data-variant="code"],[data-tool="run_code"]) [class*="_iconIdle"] svg', 'code')}
${vecSvg(':is([data-sample="bash"],[data-variant="bash"],[data-tool="bash"],[data-tool="pwsh"]) [class*="_iconIdle"] svg', 'bash')}
${vecSvg(':is([data-variant="read"],[data-tool*="read" i],[data-tool="view"]) [class*="_iconIdle"] svg', 'read')}
${vecSvg(':is([data-variant="write"],[data-tool*="write" i]) [class*="_iconIdle"] svg', 'write')}
${vecSvg(':is([data-variant="edit"],[data-tool*="edit" i],[data-tool="apply_patch"]) [class*="_iconIdle"] svg', 'edit')}
${vecSvg(':is([data-variant="search"],[data-tool*="grep" i],[data-tool*="glob" i],[data-tool*="search" i]) [class*="_iconIdle"] svg', 'search')}
${vecSvg(':is([data-tool*="web" i],[data-tool*="fetch" i],[data-tool*="page" i]) [class*="_iconIdle"] svg', 'web')}
${vecSvg(':is([data-tool="read_image"],[data-tool="view_image"],[data-tool*="image_gen" i],[data-tool*="nai_" i]) [class*="_iconIdle"] svg', 'image')}
${vecSvg(':is([data-tool^="dev_"],[data-tool^="client_guard_"],[data-tool^="cordis_"]) [class*="_iconIdle"] svg', 'module')}
${vecSvg(':is([data-tool*="agent" i],[data-tool*="teammate" i],[data-tool*="delegate" i]) [class*="_iconIdle"] svg', 'subagent')}
${vecSvg(':is([data-tool="todo_write"],[data-tool="skill"],[data-tool="compress"],[data-tool="recall"],[data-tool*="goal" i]) [class*="_iconIdle"] svg', 'plan')}
${vecSvg(':is([data-tool^="job_"],[data-tool^="schedule_"],[data-tool="bash"][data-variant="job"]) [class*="_iconIdle"] svg', 'clock')}
${vecSvg('[data-tool="ask_user_question"] [class*="_iconIdle"] svg', 'question')}

/* Semantic Aemeath starlight tints per tool family */
${K} :is([data-sample="bash"],[data-tool]) [class*="_iconIdle"] svg{
  width:15px !important;height:15px !important;
  color:var(--ae-cyan) !important;
  filter:drop-shadow(0 0 4px rgba(var(--ae-cyan-rgb),.55));
  animation:none}
${K} :is([data-variant="code"],[data-tool="run_code"]) [class*="_iconIdle"] svg{
  color:#c8a4ff !important;filter:drop-shadow(0 0 4px rgba(var(--ae-violet-rgb),.65))}
${K} :is([data-sample="bash"],[data-variant="bash"],[data-tool="bash"],[data-tool="pwsh"]) [class*="_iconIdle"] svg{
  color:#6af2ff !important;filter:drop-shadow(0 0 4px rgba(var(--ae-cyan-rgb),.68))}
${K} :is([data-variant="write"],[data-tool="write"]) [class*="_iconIdle"] svg{
  color:var(--ae-pink) !important;filter:drop-shadow(0 0 4px rgba(var(--ae-pink-rgb),.62))}
${K} :is([data-variant="edit"],[data-tool="edit"],[data-tool="apply_patch"]) [class*="_iconIdle"] svg{
  color:#f0a4ff !important;filter:drop-shadow(0 0 4px rgba(240,164,255,.55))}
${K} :is([data-tool="read_image"],[data-tool="view_image"],[data-tool*="image_gen" i],[data-tool*="nai_" i]) [class*="_iconIdle"] svg{
  color:var(--ae-pink-soft) !important;filter:drop-shadow(0 0 4px rgba(var(--ae-pink-rgb),.55))}
${K} :is([data-tool*="web" i],[data-tool*="fetch" i],[data-tool*="page" i]) [class*="_iconIdle"] svg{
  color:#6cf5e8 !important;filter:drop-shadow(0 0 4px rgba(108,245,232,.55))}
${K} :is([data-tool^="dev_"],[data-tool^="client_guard_"],[data-tool^="cordis_"]) [class*="_iconIdle"] svg{
  color:#9ce4ff !important;filter:drop-shadow(0 0 4px rgba(156,228,255,.6))}
${K} :is([data-tool*="agent" i],[data-tool*="teammate" i],[data-tool*="delegate" i]) [class*="_iconIdle"] svg{
  color:#d3a6ff !important;filter:drop-shadow(0 0 4px rgba(var(--ae-violet-rgb),.65))}
${K} :is([data-tool^="job_"],[data-tool^="schedule_"],[data-tool="bash"][data-variant="job"]) [class*="_iconIdle"] svg{
  color:#ffd98a !important;filter:drop-shadow(0 0 4px rgba(255,217,138,.55))}
${K} [data-tool="ask_user_question"] [class*="_iconIdle"] svg{
  color:var(--ae-pink-soft) !important;filter:drop-shadow(0 0 4px rgba(var(--ae-pink-rgb),.6))}
${K} :is([data-sample="bash"],[data-tool])[data-state="error"] [class*="_iconIdle"] svg{
  color:#ff5d7a !important;filter:drop-shadow(0 0 5px rgba(255,93,122,.72))}
${K} :is([data-sample="bash"],[data-tool])[data-state="running"] [class*="_iconIdle"] svg{
  color:var(--ae-pink) !important;filter:drop-shadow(0 0 5px rgba(var(--ae-pink-rgb),.78));animation:ae-breathe 1.1s ease-in-out infinite}
${K} :is([data-sample="bash"] [class*="CY-8Ka_title"],[data-tool] [class*="iWrAna_title"]){color:var(--ae-pink-soft) !important}


/* ================= step-process summary rows (已完成调谐 / 正在释放共鸣技能) ================= */
${vecSvg('[data-step-process-icon] svg', 'wave')}
${vecSvg('[data-process-activity="thinking"] [data-step-process-icon] svg', 'wave')}
${vecSvg('[data-process-activity="commands"] [data-step-process-icon] svg', 'bash')}
${vecSvg('[data-process-activity="code"] [data-step-process-icon] svg', 'code')}
${vecSvg('[data-process-activity="tools"] [data-step-process-icon] svg', 'echo')}
${vecSvg('[data-process-activity="read"] [data-step-process-icon] svg', 'read')}
${vecSvg('[data-process-activity="readImage"] [data-step-process-icon] svg', 'image')}
${vecSvg('[data-process-activity="write"] [data-step-process-icon] svg', 'write')}
${vecSvg('[data-process-activity="edit"] [data-step-process-icon] svg', 'edit')}
${vecSvg('[data-process-activity="search"] [data-step-process-icon] svg', 'search')}
${vecSvg('[data-process-activity="web"] [data-step-process-icon] svg', 'web')}
${vecSvg('[data-process-activity="webSearch"] [data-step-process-icon] svg', 'web')}
${vecSvg('[data-process-activity="webFetch"] [data-step-process-icon] svg', 'web')}
${vecSvg('[data-process-activity="subagents"] [data-step-process-icon] svg', 'subagent')}
${vecSvg('[data-process-activity="agents"] [data-step-process-icon] svg', 'subagent')}
${vecSvg('[data-process-activity="files"] [data-step-process-icon] svg', 'folder')}
${vecSvg('[data-process-activity="plan"] [data-step-process-icon] svg', 'plan')}
${vecSvg('[data-process-activity="todo"] [data-step-process-icon] svg', 'plan')}
${vecSvg('[data-process-activity="memory"] [data-step-process-icon] svg', 'plan')}
${vecSvg('[data-process-activity="skills"] [data-step-process-icon] svg', 'plan')}
${vecSvg('[data-process-activity="context"] [data-step-process-icon] svg', 'plan')}
${vecSvg('[data-process-activity="jobs"] [data-step-process-icon] svg', 'clock')}
${vecSvg('[data-process-activity="questions"] [data-step-process-icon] svg', 'question')}
${K} [data-step-process-icon] svg{width:15px !important;height:15px !important;color:var(--ae-cyan) !important;filter:drop-shadow(0 0 4px rgba(var(--ae-cyan-rgb),.55))}
${K} [data-process-activity="thinking"] [data-step-process-icon] svg{color:var(--ae-pink) !important;filter:drop-shadow(0 0 4px rgba(var(--ae-pink-rgb),.6))}
${K} [data-process-activity="code"] [data-step-process-icon] svg{color:#c8a4ff !important;filter:drop-shadow(0 0 4px rgba(var(--ae-violet-rgb),.6))}
${K} [data-process-activity="write"] [data-step-process-icon] svg,${K} [data-process-activity="edit"] [data-step-process-icon] svg{color:var(--ae-pink-soft) !important}
${K} [aria-expanded] > [class*="O_Ebla_leading"] [data-step-process-icon] svg{filter:drop-shadow(0 0 4px rgba(var(--ae-cyan-rgb),.65))}
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
${K} [data-phase] header [class*="ZKlsPq_root"]:has(> button[class*="ZKlsPq_trigger"]){align-items:center !important}
${pixFrame(`${K} [data-phase] header button[class*="ZKlsPq_trigger"]`, 'var(--ae-violet)', 0.16)}
${K} [data-phase] header button[class*="ZKlsPq_trigger"]{display:inline-flex !important;align-items:center !important;gap:3px !important;height:26px !important;min-height:26px !important;
  padding:2px 8px 2px 25px !important;font-size:12px !important;font-weight:600;line-height:22px !important;white-space:nowrap;color:#d9ccff !important}
${K} [data-phase] header button[class*="ZKlsPq_trigger"]::before{content:"";position:absolute;left:8px;top:50%;width:13px;height:13px;margin-top:-6.5px;background:currentColor;-webkit-mask:${svgUrl('androids')} center/contain no-repeat;mask:${svgUrl('androids')} center/contain no-repeat}
${K} [data-phase] header button[class*="ZKlsPq_trigger"]:is([aria-label*="正在"],[aria-label*="running"]):not(#ae-x){color:var(--ae-pink-soft) !important}
${K} [data-phase] header button[class*="ZKlsPq_trigger"]:is([aria-label*="正在"],[aria-label*="running"]):not(#ae-x)::before{background:var(--ae-pink);animation:ae-twinkle 1.2s steps(2) infinite}
${K} [data-phase] header button[class*="ZKlsPq_trigger"]:is([aria-label*="正在"],[aria-label*="running"]):not(#ae-x)::after{background:var(--ae-pink) !important}
${K} [data-phase] header button[class*="ZKlsPq_trigger"] [class*="ZKlsPq_activitySlot"]{display:none !important}
${K} [data-phase] header button[class*="ZKlsPq_trigger"] > svg{width:12px !important;height:12px !important;flex:none;opacity:.75}
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
  ${K} [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"]{flex:1 0 100% !important;justify-content:flex-start !important;margin-left:0 !important}
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
${SB} > [class*="hHd-Xa_regionArea"],${SB} > [class*="hHd-Xa_scrollRegion"]{grid-row:4;min-height:0}
${SB} > [class*="hHd-Xa_footArea"]{grid-row:5}
/* 0.2.2 侧栏把 panelList 移进了 scrollRegion > scrollArea，这里还原 0.2.1 单排紧凑像素图标格 */
${SB} [class*="hHd-Xa_scrollArea"]{display:flex !important;flex-direction:column !important;margin:0 !important;padding:0 !important;gap:4px !important;overflow:hidden auto !important}
${SB} [class*="hHd-Xa_scrollArea"]::before,${SB} [class*="hHd-Xa_scrollArea"]::after{display:none !important}
${SB} [class*="hHd-Xa_scrollFade"]{display:none !important}
${SB} [class*="hHd-Xa_panelList"]{display:grid !important;grid-template-columns:repeat(auto-fit,minmax(0,1fr)) !important;gap:4px !important;width:100% !important;margin:0 0 4px !important;padding:0 !important;flex:none !important}
${SB} [class*="hHd-Xa_panelEntry"]{display:block !important;border:0 !important;margin:0 !important;padding:0 !important;min-width:0 !important;background:transparent !important;box-shadow:none !important}
${SB} [class*="hHd-Xa_panelEntryWide"] [class*="hHd-Xa_panelRow"]{padding:6px 2px 5px !important;margin:0 !important;width:100% !important}
${SB} [class*="hHd-Xa_panelUnpin"]{display:none !important}
/* 顶部图标格 */
${SB} > [class*="rwa6qG_entry"],${SB} [class*="hHd-Xa_panelRow"]{
  box-sizing:border-box;display:flex !important;flex-direction:column !important;align-items:center !important;justify-content:center !important;
  gap:4px !important;width:100% !important;min-width:0 !important;height:50px !important;min-height:0 !important;margin:0 0 6px !important;padding:6px 2px 5px !important;
  border-radius:0 !important;background:rgba(var(--ae-plum2-rgb),.55) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.22),inset 0 -2px 0 rgba(0,0,0,.35) !important;
  clip-path:polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)}
${SB} > [class*="rwa6qG_entry"]{grid-row:3;grid-column:1 / -1 !important;flex-direction:row !important;justify-content:center !important;height:32px !important;gap:6px !important;margin:0 0 4px !important;padding:0 10px !important}
${SB} [class*="hHd-Xa_moreAnchor"]{display:block;min-width:0}
${SB} > [class*="rwa6qG_entry"]:active,${SB} [class*="hHd-Xa_panelRow"]:active{transform:translate(1px,1px)}
${SB} [class*="hHd-Xa_panelRow"][class*="hHd-Xa_panelActive"],${SB} [class*="hHd-Xa_panelEntryActive"] [class*="hHd-Xa_panelRow"]{background:rgba(var(--ae-pink-rgb),.28) !important;
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

