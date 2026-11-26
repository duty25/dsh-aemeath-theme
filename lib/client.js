/* dsh-aemeath-theme 1.1.0 — built 2026-11-26T19:00:52.027Z */
window.__ModuleLoader__.load({id: "dsh-aemeath-theme", factory: (require) => {
const modules = Object.create(null);
modules["assets.js"] = function(require, module, exports) {
"use strict";
// Assets are served by this package's host half (lib/index.js) under one
// prefix route. Bump ASSET_REV when an asset changes to bust caches.
const ASSET_REV = '5';
const ASSET_BASE = '/aemeath-theme/assets/';
const asset = (name) => `${ASSET_BASE}${name}?v=${ASSET_REV}`;
module.exports = { ASSET_BASE, ASSET_REV, asset };

};
modules["brand.js"] = function(require, module, exports) {
"use strict";
// Brand layer: the 深空联合 (Spacetrek Collective) emblem replaces the whale
// mark in the sidebar and on the hero, the sidebar word-mark becomes a pixel
// "星炬终端 · SPACETREK" title, and the tab title / favicon follow. All of it
// rides the official single slots (sidebar.brand.mark / sidebar.brand.name /
// conversation.hero.brand.mark) at a higher priority, so turning the option
// off simply unregisters and the shipped whale comes back.
const store = require('./store.js');
const { asset } = require('./assets.js');

const NAMES = {
  spacetrek: { title: '星炬终端', sub: 'SPACETREK · HARNESS', tab: '星炬终端 · 爱弥斯' },
  aemeath: { title: '爱弥斯终端', sub: 'AEMEATH · ONLINE', tab: '爱弥斯终端' },
  ghost: { title: '电子幽灵', sub: 'GHOST IN THE HARNESS', tab: '电子幽灵 · 爱弥斯' },
};

function brandName(p) { return NAMES[p.brandName] || NAMES.spacetrek; }

function install(ctx) {
  let React;
  try { React = require('react'); } catch { return () => {}; }
  const h = React.createElement;
  const slots = ctx.slots;
  if (!slots) return () => {};

  const usePrefs = () => React.useSyncExternalStore(store.subscribe, store.get);

  function Mark({ size }) {
    return h('img', {
      src: asset('dsu-emblem.webp'), alt: '深空联合', width: size, height: size, draggable: false,
      className: 'ae-dsu-mark', style: { width: size, height: size, display: 'block' },
    });
  }
  function SidebarMark() { return h(Mark, { size: 24 }); }
  function HeroMark() { return h('span', { className: 'ae-dsu-hero' }, h(Mark, { size: 40 })); }
  function SidebarName() {
    const n = brandName(usePrefs());
    return h('span', { className: 'ae-brand-name' },
      h('b', null, n.title),
      h('small', null, n.sub));
  }

  // slots.inject(name, cb) runs cb once the slot is declared (and again after
  // redeclaration); cb returns the register() disposer.
  const regs = [];
  let registered = false;
  const reg = () => {
    if (registered) return;
    registered = true;
    const add = (name, C) => {
      try { regs.push(slots.inject(name, () => slots.register({ name, priority: -20 }, C))); }
      catch (e) { console.warn('[aemeath-theme] brand slot', name, e); }
    };
    add('sidebar.brand.mark', SidebarMark);
    add('sidebar.brand.name', SidebarName);
    add('conversation.hero.brand.mark', HeroMark);
  };
  const unreg = () => {
    registered = false;
    for (const d of regs.splice(0)) { try { typeof d === 'function' ? d() : d?.dispose?.(); } catch { /* ignore */ } }
  };

  // document title + favicon
  const origTitle = document.title;
  let icon = null;
  let titleObs = null;
  const applyTitle = (p) => {
    if (!p.brand) { if (titleObs) { titleObs.disconnect(); titleObs = null; } if (document.title !== origTitle && /星炬|爱弥斯|电子幽灵/.test(document.title)) document.title = origTitle; return; }
    const want = brandName(p).tab;
    const fix = () => { if (/DeepSeek Harness/.test(document.title)) document.title = document.title.replace(/DeepSeek Harness/g, want); else if (!document.title) document.title = want; };
    fix();
    if (!titleObs) {
      const t = document.querySelector('title');
      if (t) { titleObs = new MutationObserver(fix); titleObs.observe(t, { childList: true, characterData: true, subtree: true }); }
    }
  };
  const applyIcon = (p) => {
    if (p.brand && !icon) {
      icon = document.createElement('link');
      icon.rel = 'icon'; icon.type = 'image/png'; icon.href = asset('favicon.png'); icon.dataset.aemeath = '';
      document.head.appendChild(icon);
    } else if (!p.brand && icon) { icon.remove(); icon = null; }
  };

  const sync = (p) => {
    if (p.brand) reg(); else unreg();
    applyTitle(p); applyIcon(p);
  };
  sync(store.get());
  let last = store.get().brand;
  const off = store.subscribe((p) => { if (p.brand !== last) { last = p.brand; sync(p); } else applyTitle(p); });
  return () => {
    off(); unreg();
    if (titleObs) titleObs.disconnect();
    if (icon) icon.remove();
    if (/星炬|爱弥斯终端|电子幽灵/.test(document.title)) document.title = origTitle;
  };
}

module.exports = { install, NAMES };

};
modules["chrome.js"] = function(require, module, exports) {
"use strict";
// Chat page "bridge" look on phones & desktop:
// - starlight (default): frosted twin-capsule navigation & utility docks,
//   Aemeath polestar title accent, harmonized status pill, segmented pill tabs,
//   crisp vector icons, holographic starlight horizon line.
// - ribbon: ultra-clean borderless translucent starlight rail.
// - classic: original square glass buttons + cyan status pixel.
// Active only with html[data-ae-chrome]. Selectors carry :not(#ae-x) so they
// outrank stock, plugin and older skin rules for the same nodes.
const { svgUrl } = require('./skin-extra.js');
const { asset } = require('./assets.js');

const HDR_ICONS = {
  'nav-left': '<rect x="3.25" y="4.25" width="17.5" height="15.5" rx="4" fill="none" stroke="#000" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.25 4.5v15M5.75 9.25h1.2M5.75 12.75h1.2" fill="none" stroke="#000" stroke-width="1.85" stroke-linecap="round"/>',
  'nav-folder': '<path d="M3.5 7.5a2.5 2.5 0 0 1 2.5-2.5h3.3c.72 0 1.38.34 1.8.92l.9 1.16c.42.58 1.08.92 1.8.92h4.2a2.5 2.5 0 0 1 2.5 2.5v6.5a2.5 2.5 0 0 1-2.5 2.5H6a2.5 2.5 0 0 1-2.5-2.5v-9.5Z" fill="none" stroke="#000" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"/>',
  'nav-more': '<circle cx="5.2" cy="12" r="1.65" fill="#000"/><path d="M12 7.2l1.12 3.68L16.8 12l-3.68 1.12L12 16.8l-1.12-3.68L7.2 12l3.68-1.12L12 7.2Z" fill="#000"/><circle cx="18.8" cy="12" r="1.65" fill="#000"/>',
  'nav-right': '<rect x="3.25" y="4.25" width="17.5" height="15.5" rx="4" fill="none" stroke="#000" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.75 4.5v15M17.05 9.25h1.2M17.05 12.75h1.2" fill="none" stroke="#000" stroke-width="1.85" stroke-linecap="round"/>',
  'nav-star': '<path d="M12 2.2l2.15 6.65 6.65 2.15-6.65 2.15L12 19.8l-2.15-6.65L3.2 11l6.65-2.15L12 2.2Z" fill="#000"/><circle cx="18.9" cy="5.1" r="1.35" fill="#000"/>',
  'nav-pulse': '<path d="M3 12h3.5l2.2-5.8 3.6 11.6 2.4-5.8H21" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  'nav-subagent': '<circle cx="12" cy="5.8" r="2.5" fill="none" stroke="#000" stroke-width="1.85"/><circle cx="6.2" cy="17.2" r="2.3" fill="none" stroke="#000" stroke-width="1.85"/><circle cx="17.8" cy="17.2" r="2.3" fill="none" stroke="#000" stroke-width="1.85"/><path d="M10.7 8.1L7.4 15M13.3 8.1l3.3 6.9" fill="none" stroke="#000" stroke-width="1.85" stroke-linecap="round"/>',
  'nav-team': '<circle cx="9.2" cy="8.2" r="2.9" fill="none" stroke="#000" stroke-width="1.85"/><path d="M3.8 18.8a5.5 5.5 0 0 1 10.8 0" fill="none" stroke="#000" stroke-width="1.85" stroke-linecap="round"/><circle cx="16.4" cy="9.4" r="2.1" fill="none" stroke="#000" stroke-width="1.85"/><path d="M16.2 14.3a4.3 4.3 0 0 1 4.1 4.5" fill="none" stroke="#000" stroke-width="1.85" stroke-linecap="round"/>',
};

const vecUrl = (name) => {
  const body = HDR_ICONS[name] || '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${body}</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

function buildCss() {
  const C = 'html[data-aemeath][data-ae-skin][data-ae-chrome]:not([style*="color-scheme: light"])';
  const CL = 'html[data-aemeath][data-ae-skin][data-ae-chrome][style*="color-scheme: light"]';
  const X = ':not(#ae-x)';
  const H = `${C} [data-mobile-nav="frame"] [data-phase] header`;
  const HT = `${H}:has([class*="_tabs"])`;
  const HC = `${C}[data-ae-header-style="classic"] [data-mobile-nav="frame"] [data-phase] header`;
  const HCT = `${HC}:has([class*="_tabs"])`;
  // Modern header selectors (starlight & ribbon) apply on dark & light, mobile & desktop
  const SM = 'html[data-aemeath][data-ae-skin][data-ae-chrome]:not([data-ae-header-style="classic"])';
  const SML = `${SM}[style*="color-scheme: light"]`;
  const SMD = `${SM}:not([style*="color-scheme: light"])`;
  const HM = `${SM} [data-phase] header`;
  const HMD = `${SMD} [data-phase] header`;
  const HML = `${SML} [data-phase] header`;
  const HMT = `${SM} [data-mobile-nav="frame"] [data-phase] header:has([class*="_tabs"])`;
  const RB = 'html[data-aemeath][data-ae-skin][data-ae-chrome][data-ae-header-style="ribbon"]';
  const HRB = `${RB} [data-phase] header`;

  const ICONBTN = ':is([data-mobile-nav="toggle"],[data-mobile-nav="files"],button[aria-label="更多操作"],button[class*="_moreButton"],button[data-sidebar-right-expand])';
  const icon = (name) => `-webkit-mask:${svgUrl(name)} center/contain no-repeat;mask:${svgUrl(name)} center/contain no-repeat`;
  const vicon = (name) => `-webkit-mask:${vecUrl(name)} center/contain no-repeat;mask:${vecUrl(name)} center/contain no-repeat`;
  const CARD = `${C} [data-composer-card]`;
  const DOCK = `${C} [data-composer-card] ~ [class$="_dock"]`;
  const TOOL = ':is(button[class*="iWlSmW_trigger"],.dsh-ppb-btn,.ghc-trigger)';

  return `
/* ================= header: Starlight & Ribbon (modern Aemeath HUD) ================= */
${HMD}${X}{position:relative !important;padding-top:8px !important;padding-bottom:8px !important;border-bottom:0 !important;
  background:
    radial-gradient(65% 130% at 14% -25%,rgba(var(--ae-pink-rgb),.18),transparent 65%),
    radial-gradient(58% 120% at 88% -20%,rgba(var(--ae-cyan-rgb),.14),transparent 64%),
    linear-gradient(180deg,rgba(var(--ae-plum-rgb),.92) 0%,rgba(var(--ae-plum2-rgb),.78) 65%,rgba(var(--ae-plum-rgb),.58) 100%) !important;
  -webkit-backdrop-filter:blur(18px) saturate(1.35) !important;backdrop-filter:blur(18px) saturate(1.35) !important;
  box-shadow:0 10px 24px -16px rgba(0,0,0,.85) !important}
${HML}${X}{position:relative !important;padding-top:8px !important;padding-bottom:8px !important;border-bottom:0 !important;
  background:
    radial-gradient(65% 130% at 14% -25%,rgba(var(--ae-pink-rgb),.14),transparent 65%),
    radial-gradient(58% 120% at 88% -20%,rgba(var(--ae-cyan-rgb),.12),transparent 64%),
    linear-gradient(180deg,rgba(255,248,252,.92) 0%,rgba(255,242,249,.82) 100%) !important;
  -webkit-backdrop-filter:blur(18px) saturate(1.25) !important;backdrop-filter:blur(18px) saturate(1.25) !important;
  box-shadow:0 8px 20px -14px rgba(120,40,90,.2) !important}
${HM}${X}::after{content:"";position:absolute;left:12px;right:12px;bottom:0;height:1px;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(var(--ae-pink-rgb),.48) 24%,rgba(255,255,255,.45) 50%,rgba(var(--ae-cyan-rgb),.48) 76%,transparent)}
${HML}${X}::after{background:linear-gradient(90deg,transparent,rgba(var(--ae-pink-rgb),.36) 24%,rgba(var(--ae-violet-rgb),.32) 50%,rgba(var(--ae-cyan-rgb),.36) 76%,transparent)}

/* row-1 icon buttons: frosted starlight glass, zero noisy corner pixel dot */
${HM} ${ICONBTN}${X}{position:relative !important;width:32px !important;height:32px !important;min-width:32px !important;min-height:32px !important;
  padding:0 !important;margin:0 !important;border:0 !important;border-image:none !important;clip-path:none !important;border-radius:999px !important;
  display:inline-flex !important;align-items:center !important;justify-content:center !important;
  color:#ffe2f2 !important;transition:background .16s ease,box-shadow .16s ease,transform .12s ease,color .16s ease !important;
  background:linear-gradient(180deg,rgba(255,255,255,.10),rgba(var(--ae-plum3-rgb),.54)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.26),inset 0 1px 0 rgba(255,255,255,.16),0 4px 12px -4px rgba(0,0,0,.48) !important}
${HML} ${ICONBTN}${X}{color:#6d2854 !important;
  background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(255,232,244,.78)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.26),0 3px 10px -4px rgba(150,40,100,.18) !important}
${HM} ${ICONBTN}${X}::after{content:none !important;display:none !important}
${HM} ${ICONBTN}${X}:hover{color:#fff !important;
  background:linear-gradient(150deg,rgba(var(--ae-pink-rgb),.30),rgba(var(--ae-violet-rgb),.28)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.48),inset 0 1px 0 rgba(255,255,255,.22),0 0 14px -4px rgba(var(--ae-pink-rgb),.55) !important}
${HML} ${ICONBTN}${X}:hover{color:#9e1f68 !important;background:rgba(var(--ae-pink-rgb),.18) !important}
${HM} ${ICONBTN}${X}:active{transform:scale(.93) !important;color:#fff !important;
  background:linear-gradient(135deg,rgba(var(--ae-pink-rgb),.65),rgba(var(--ae-violet-rgb),.62)) !important;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.35),0 0 14px -2px rgba(var(--ae-pink-rgb),.7) !important}

/* custom crisp starlight vector icons (replace chunky retro icons cleanly) */
${HM} ${ICONBTN}${X} > svg,${HM} ${ICONBTN}${X} > span > svg{opacity:0 !important}
${HM} ${ICONBTN}${X}::before{content:"" !important;position:absolute !important;left:50% !important;top:50% !important;
  width:17px !important;height:17px !important;margin:-8.5px 0 0 -8.5px !important;
  background:currentColor !important;pointer-events:none !important;image-rendering:auto !important;
  filter:drop-shadow(0 0 4px rgba(var(--ae-pink-rgb),.35))}
${HM} [data-mobile-nav="toggle"]${X}::before{${vicon('nav-left')}}
${HM} [data-mobile-nav="files"]${X}::before{${vicon('nav-folder')}}
${HM} :is(button[aria-label="更多操作"],button[class*="_moreButton"])${X}::before{${vicon('nav-more')};width:18px !important;height:18px !important;margin:-9px 0 0 -9px !important}
${HM} button[data-sidebar-right-expand]${X}::before{${vicon('nav-right')}}

/* paired right twin-capsule (more + rightbar) when both are present */
${HM} [class$="_headerUtilities"]:has(:is(button[aria-label="更多操作"],button[class*="_moreButton"])):has(+ [class$="_headerCorner"] button[data-sidebar-right-expand]) :is(button[aria-label="更多操作"],button[class*="_moreButton"])${X}{
  border-radius:16px 5px 5px 16px !important}
${HM} [class$="_headerUtilities"]:has(:is(button[aria-label="更多操作"],button[class*="_moreButton"])) + [class$="_headerCorner"] button[data-sidebar-right-expand]${X}{
  border-radius:5px 16px 16px 5px !important}
${HM} [class$="_headerUtilities"]:has(:is(button[aria-label="更多操作"],button[class*="_moreButton"])) + [class$="_headerCorner"]${X}{
  margin-left:-4px !important}

/* harmonized dsh-ling status pill ("⚙ 工作") — soft rose-violet-cyan iridescent glass */
${HM} .dsh-ling-btn${X}{height:30px !important;min-height:30px !important;padding:0 11px !important;margin:0 !important;
  border:0 !important;border-radius:999px !important;white-space:nowrap !important;
  display:inline-flex !important;align-items:center !important;gap:4px !important;
  font-size:12px !important;font-weight:600 !important;letter-spacing:.2px !important;color:#ffe6f4 !important;
  background:linear-gradient(125deg,rgba(var(--ae-pink-rgb),.20) 0%,rgba(var(--ae-plum3-rgb),.66) 52%,rgba(var(--ae-cyan-rgb),.18) 100%) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.32),inset 0 1px 0 rgba(255,255,255,.16),0 4px 12px -4px rgba(0,0,0,.42) !important;
  transition:background .16s ease,box-shadow .16s ease,transform .12s ease !important}
${HML} .dsh-ling-btn${X}{color:#6d2854 !important;
  background:linear-gradient(125deg,rgba(var(--ae-pink-rgb),.14),rgba(255,255,255,.88) 52%,rgba(var(--ae-cyan-rgb),.14)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.28),0 3px 10px -4px rgba(150,40,100,.14) !important}
${HM} .dsh-ling-btn${X}::before{content:"";width:6px;height:6px;border-radius:50%;flex:none;margin-right:1px;
  background:var(--ae-cyan);box-shadow:0 0 6px var(--ae-cyan)}
${HM} .dsh-ling-btn${X}:hover{color:#fff !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-cyan-rgb),.5),0 0 14px -4px rgba(var(--ae-pink-rgb),.55) !important}
${HM} .dsh-ling-btn${X}:active{transform:scale(.95) !important}

/* title row & Aemeath polestar emblem beside session title */
${HM} [class$="_titleRow"]${X}{column-gap:6px !important;min-height:32px !important;align-items:center !important}
${HM} [class$="_headerUtilities"]${X}{gap:6px !important;margin-left:4px !important}
${HM} [class$="_headerCorner"]${X}{margin-left:6px !important;margin-right:0 !important}
${HM} nav[class*="_crumbs"]${X}{font-size:16px !important;line-height:22px !important}
${HM} nav[class*="_crumbs"] [class*="_crumbCurrent"]${X}{position:relative;display:inline-flex !important;align-items:center !important;gap:6px !important;
  padding:3px 6px !important;font-size:15.5px !important;line-height:22px !important;font-weight:600 !important;
  color:#fff6fc !important;text-shadow:0 0 12px rgba(var(--ae-pink-rgb),.42),0 1px 2px rgba(10,4,22,.6) !important}
${HML} nav[class*="_crumbs"] [class*="_crumbCurrent"]${X}{color:#381632 !important;text-shadow:none !important}
${SM}[data-ae-font="pixel-title"] [data-phase] header nav[class*="_crumbs"] [class*="_crumbCurrent"]${X}{
  font-size:17px !important;line-height:22px !important;letter-spacing:.6px !important}
${HM} nav[class*="_crumbs"] > span[class*="_crumbSeg"]:first-child [class*="_crumbCurrent"]${X}::before{
  content:"";width:14px;height:14px;flex:none;display:inline-block;
  background:url("${asset('polestar-tag-strip.png')}") 0 0/28px 14px no-repeat;image-rendering:pixelated;
  filter:drop-shadow(0 0 5px rgba(var(--ae-pink-rgb),.65));animation:ae-qms-hdr 2.2s steps(1) infinite}
@keyframes ae-qms-hdr{50%{background-position:-14px 0}}

/* row-2 segmented starlight pill track & active rose-violet capsule */
${HM} [data-conversation-tabs]${X}{display:inline-flex !important;align-items:center !important;gap:2px !important;
  height:30px !important;padding:3px !important;box-sizing:border-box !important;border-radius:999px !important;
  background:rgba(var(--ae-plum-rgb),.56) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.22),inset 0 1px 3px rgba(0,0,0,.38) !important}
${HML} [data-conversation-tabs]${X}{background:rgba(255,232,245,.72) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.22) !important}
${HM} [data-conversation-tabs] button${X}{position:relative !important;height:24px !important;min-height:24px !important;
  padding:0 12px !important;margin:0 !important;border:0 !important;border-radius:999px !important;
  background:transparent !important;box-shadow:none !important;
  font-family:inherit !important;font-size:12.5px !important;line-height:24px !important;font-weight:600 !important;letter-spacing:.35px !important;
  color:rgba(226,214,248,.66) !important;transition:background .18s ease,color .18s ease,box-shadow .18s ease !important}
${HML} [data-conversation-tabs] button${X}{color:rgba(95,46,82,.68) !important}
${HM} [data-conversation-tabs] button:is([class*="Active"],[aria-selected="true"])${X}{
  color:#ffffff !important;
  background:linear-gradient(135deg,rgba(var(--ae-pink-rgb),.78) 0%,rgba(var(--ae-violet-rgb),.68) 100%) !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.35),inset 0 0 0 1px rgba(255,214,238,.36),0 2px 10px -2px rgba(var(--ae-pink-rgb),.72) !important;
  text-shadow:0 1px 3px rgba(38,6,30,.55) !important}
/* remove the protruding cyan pixel caret from skin-extra */
${HM} [data-conversation-tabs] button${X}::before,${HM} [data-conversation-tabs] button${X}::after{content:none !important;display:none !important}
/* views more ("...") button cleanly framed beside the tab capsule */
${HM} [class*="viewsMoreAnchor"]${X}{display:inline-flex !important;align-items:center !important;margin-left:5px !important}
${HM} [class*="viewsMoreAnchor"] button${X}{width:26px !important;min-width:26px !important;height:26px !important;min-height:26px !important;
  padding:0 !important;border:0 !important;border-radius:50% !important;
  background:rgba(var(--ae-plum2-rgb),.54) !important;color:rgba(235,222,255,.78) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.20) !important}
${HML} [class*="viewsMoreAnchor"] button${X}{background:rgba(255,236,246,.85) !important;color:#7a3060 !important}

/* row-2 right chips: mode (starlight pink), jobs (cyan), subagents (violet), team (blush) — all 30px pills */
${HM} [class*="SVAs4q_label"]${X}{display:inline-flex !important;align-items:center !important;gap:5px !important;
  height:30px !important;line-height:30px !important;padding:0 12px 0 9px !important;margin:0 !important;max-width:none !important;
  border:0 !important;border-radius:999px !important;font-size:12px !important;font-weight:600 !important;letter-spacing:.3px !important;
  color:#ffe3f2 !important;
  background:linear-gradient(125deg,rgba(var(--ae-pink-rgb),.25) 0%,rgba(var(--ae-plum2-rgb),.74) 54%,rgba(var(--ae-cyan-rgb),.16) 100%) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.40),inset 0 1px 0 rgba(255,255,255,.18),0 4px 14px -5px rgba(var(--ae-pink-rgb),.62) !important}
${HML} [class*="SVAs4q_label"]${X}{color:#7a1f56 !important;
  background:linear-gradient(125deg,rgba(var(--ae-pink-rgb),.18),rgba(255,255,255,.88) 54%,rgba(var(--ae-cyan-rgb),.14)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.34),0 3px 10px -4px rgba(180,50,120,.18) !important}
${HM} [class*="SVAs4q_label"]${X}::before,${HM} [class*="SVAs4q_label"]${X}::after{content:none !important;display:none !important}
${HM} svg[class*="SVAs4q_icon"]${X}{width:13px !important;height:13px !important;flex:none !important;
  background:linear-gradient(135deg,#fff 0%,var(--ae-pink) 52%,var(--ae-cyan) 100%) !important;
  ${vicon('nav-star')};filter:drop-shadow(0 0 4px rgba(var(--ae-pink-rgb),.75)) !important}
${HM} svg[class*="SVAs4q_icon"]${X} > *{visibility:hidden !important}

${HM} button[class*="QsffPG_trigger"]${X}{position:relative !important;height:30px !important;min-height:30px !important;
  padding:0 11px 0 26px !important;margin:0 !important;border:0 !important;border-radius:999px !important;
  font-size:12px !important;font-weight:600 !important;color:#aeefff !important;
  background:linear-gradient(125deg,rgba(var(--ae-cyan-rgb),.18),rgba(var(--ae-plum2-rgb),.74) 55%,rgba(var(--ae-pink-rgb),.12)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-cyan-rgb),.34),inset 0 1px 0 rgba(255,255,255,.16),0 4px 12px -4px rgba(0,0,0,.4) !important}
${HM} button[class*="QsffPG_trigger"]${X}::before{content:"" !important;position:absolute;left:9px;top:50%;width:13px;height:13px;margin-top:-6.5px;background:currentColor !important;${vicon('nav-pulse')}}
${HM} button[class*="QsffPG_trigger"]:not(:has([class*="QsffPG_count"]:not(:empty)))${X}{
  width:30px !important;min-width:30px !important;padding:0 !important}
${HM} button[class*="QsffPG_trigger"]:not(:has([class*="QsffPG_count"]:not(:empty)))${X}::before{
  left:50% !important;margin-left:-6.5px !important}
${HM} button[class*="QsffPG_trigger"]${X}::after{content:none !important;display:none !important}
${HM} button[class*="QsffPG_trigger"]:is([aria-label*="巡航"],[aria-label*="运行中"])${X}{color:#ffe3f2 !important;
  background:linear-gradient(125deg,rgba(var(--ae-pink-rgb),.26),rgba(var(--ae-cyan-rgb),.16)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.48),0 0 14px -4px rgba(var(--ae-pink-rgb),.65) !important}
${HM} button[class*="QsffPG_trigger"]:is([aria-label*="巡航"],[aria-label*="运行中"])${X}::before{background:var(--ae-pink) !important;animation:ae-twinkle 1.2s ease-in-out infinite}
${HM} [class*="QsffPG_count"]{font-size:12px !important}

${HM} [class*="ZKlsPq_root"]:has(> button[class*="ZKlsPq_trigger"])${X}{display:inline-flex !important;align-items:center !important;align-self:flex-end !important;height:30px !important;margin:0 !important;gap:0 !important}
${HM} button[class*="ZKlsPq_trigger"]${X}{position:relative !important;display:inline-flex !important;align-items:center !important;gap:3px !important;
  width:auto !important;height:30px !important;min-height:30px !important;padding:0 10px 0 26px !important;margin:0 !important;
  border:0 !important;border-image:none !important;border-radius:999px !important;clip-path:none !important;white-space:nowrap !important;
  font-size:12px !important;font-weight:600 !important;line-height:30px !important;color:#e3d7ff !important;
  background:linear-gradient(125deg,rgba(var(--ae-violet-rgb),.26),rgba(var(--ae-plum2-rgb),.74)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-violet-rgb),.46),inset 0 1px 0 rgba(255,255,255,.14) !important}
${HM} button[class*="ZKlsPq_trigger"]${X}::before{content:"" !important;position:absolute;left:8px;top:50%;width:14px;height:14px;margin-top:-7px;background:currentColor !important;${vicon('nav-subagent')}}
${HM} button[class*="ZKlsPq_trigger"]${X}::after{content:none !important;display:none !important}
${HM} button[class*="ZKlsPq_trigger"]:is([aria-label*="正在"],[aria-label*="running"])${X}{color:#ffe3f2 !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.52),0 0 14px -4px rgba(var(--ae-pink-rgb),.65) !important}
${HM} button[class*="ZKlsPq_trigger"]:is([aria-label*="正在"],[aria-label*="running"])${X}::before{background:var(--ae-pink) !important;animation:ae-twinkle 1.2s ease-in-out infinite}
${HM} button[class*="ZKlsPq_trigger"] [class*="ZKlsPq_activitySlot"]${X}{display:none !important}
${HM} button[class*="ZKlsPq_trigger"] > svg${X}{width:12px !important;height:12px !important;flex:none !important;opacity:.75}

${HM} button[aria-label="智能体团队"]${X}{position:relative !important;width:30px !important;min-width:30px !important;height:30px !important;min-height:30px !important;
  padding:0 !important;margin:0 !important;border:0 !important;border-radius:999px !important;color:#ffe2f2 !important;
  background:rgba(var(--ae-plum3-rgb),.66) !important;box-shadow:inset 0 0 0 1px rgba(var(--ae-violet-rgb),.40),inset 0 1px 0 rgba(255,255,255,.12) !important}
${HM} button[aria-label="智能体团队"]${X} > svg{opacity:0 !important}
${HM} button[aria-label="智能体团队"]${X}::before{content:"" !important;position:absolute !important;left:50% !important;top:50% !important;
  width:15px !important;height:15px !important;margin:-7.5px 0 0 -7.5px !important;background:currentColor !important;${vicon('nav-team')}}
${HM} button[aria-label="智能体团队"]${X}::after{content:none !important;display:none !important}

/* ================= header: Ribbon variant (ultra-clean minimal glass) ================= */
${HRB} ${ICONBTN}${X}{background:transparent !important;box-shadow:none !important;border-radius:999px !important}
${HRB} ${ICONBTN}${X}:hover{background:rgba(var(--ae-pink-rgb),.16) !important;box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.26) !important}
${HRB} [class$="_headerUtilities"] + [class$="_headerCorner"]${X}{margin-left:2px !important}
${HRB} .dsh-ling-btn${X}{background:rgba(var(--ae-plum3-rgb),.34) !important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12) !important}
${HRB} [data-conversation-tabs]${X}{background:transparent !important;box-shadow:none !important;padding:0 !important;gap:4px !important}
${HRB} [data-conversation-tabs] button${X}{padding:0 10px !important;height:28px !important;line-height:28px !important;border-radius:8px !important}
${HRB} [data-conversation-tabs] button:is([class*="Active"],[aria-selected="true"])${X}{
  background:rgba(var(--ae-pink-rgb),.14) !important;
  box-shadow:inset 0 -2px 0 var(--ae-pink) !important;border-radius:8px 8px 2px 2px !important}
${HRB} [class*="SVAs4q_label"]${X}{background:rgba(var(--ae-pink-rgb),.12) !important;box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.28) !important}

/* ================= header: mobile layout (Starlight & Ribbon) ================= */
@media (max-width:760px){
  ${SM} [data-mobile-nav="frame"] [data-phase] header${X}{padding-left:12px !important;padding-right:12px !important}
  ${SM} [data-mobile-nav="frame"] [data-phase] header > [data-conversation-header-leading]:empty${X}{padding-left:0 !important;width:0 !important;overflow:hidden !important}
  ${HMT} [class$="_headerActions"]${X}{display:flex !important;position:absolute !important;inset:0 !important;z-index:3;pointer-events:none;margin:0 !important;
    flex-direction:row !important;align-items:flex-end !important;justify-content:flex-end !important;gap:6px !important;padding:0 12px 10px 0 !important}
  ${HMT} [class$="_headerActions"] > [data-slot] > *${X}{pointer-events:auto;margin:0 !important;flex:none !important;max-width:none !important;order:20 !important}
  ${HMT} [class$="_headerActions"] > [data-slot] > [class*="VoX2oq_root"]${X}{order:30 !important}
  ${HMT} [class$="_headerActions"] > [data-slot] > [class*="SVAs4q_label"]${X}{align-self:flex-end !important;max-width:none !important;margin:0 !important}

  /* left twin-capsule navigation dock */
  ${HMT} [data-mobile-nav="toggle"]${X}{position:absolute !important;left:12px !important;top:8px !important;width:33px !important;min-width:33px !important}
  ${HMT} [data-mobile-nav="files"]${X}{position:absolute !important;left:46px !important;top:8px !important;width:33px !important;min-width:33px !important}
  ${HMT}:has([data-mobile-nav="files"]) [data-mobile-nav="toggle"]${X}{border-radius:16px 5px 5px 16px !important}
  ${HMT}:has([data-mobile-nav="toggle"]) [data-mobile-nav="files"]${X}{border-radius:5px 16px 16px 5px !important}
  ${RB} [data-mobile-nav="frame"] [data-phase] header:has([class*="_tabs"]) :is([data-mobile-nav="toggle"],[data-mobile-nav="files"])${X}{border-radius:999px !important}
  ${HMT} [class$="_titleRow"]${X}{padding-left:74px !important;min-height:32px !important}
  ${HMT}:not(:has([data-mobile-nav="files"])) [class$="_titleRow"]${X}{padding-left:40px !important}

  /* row-2 tabs align flush with left 12px & right chips */
  ${HMT} [class*="_tabs"]${X}{display:flex !important;align-items:center !important;margin:9px 0 0 0 !important;
    padding:0 var(--ae-chip-room,220px) 2px 0 !important;min-width:0;flex-wrap:nowrap !important;gap:0 !important;overflow:visible !important}
  ${HMT} [data-conversation-tabs]${X}{flex:none !important;flex-wrap:nowrap !important;min-width:0 !important;overflow:visible !important;scrollbar-width:none}
  ${HMT} [data-conversation-tabs] button${X}{flex:none !important;white-space:nowrap !important;min-width:0 !important;padding:0 11px !important}
  ${HMT} [class*="viewsMoreAnchor"]${X}{flex:none !important}
  ${HMT}[data-ae-chips] [class*="SVAs4q_label"]${X}{width:30px !important;padding:0 !important;gap:0 !important;justify-content:center !important;font-size:0 !important}
  ${HMT}[data-ae-chips="2"] [class*="QsffPG_count"]${X}{display:inline-block !important;max-width:calc(var(--ae-jobs-digits,1) * 1ch) !important;overflow:hidden !important;white-space:nowrap !important;font-variant-numeric:tabular-nums}
  ${HMT}[data-ae-chips="2"] button[class*="ZKlsPq_trigger"] > span:not([class])${X}{display:inline-block !important;max-width:calc(var(--ae-sub-digits,1) * 1ch) !important;overflow:hidden !important;white-space:nowrap !important;font-variant-numeric:tabular-nums}
  ${HMT}[data-ae-chips="2"] button[class*="ZKlsPq_trigger"]${X}{padding-right:8px !important}
  ${HMT} [data-conversation-tabs]::-webkit-scrollbar{display:none}

  /* blank / hero chat: floating directory key matches the circular starlight glass button */
  ${SM}:has([data-mobile-nav="frame"] [data-phase="hero"]) [data-mobile-nav="fab"]${X}{
    top:calc(env(safe-area-inset-top,0px) + 8px) !important;left:12px !important;
    width:32px !important;height:32px !important;min-width:32px !important;min-height:32px !important;padding:0 !important;
    border:0 !important;border-image:none !important;border-radius:999px !important;color:#ffe2f2 !important;
    background:linear-gradient(180deg,rgba(255,255,255,.10),rgba(var(--ae-plum3-rgb),.54)) !important;
    box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.26),inset 0 1px 0 rgba(255,255,255,.16),0 4px 12px -4px rgba(0,0,0,.48) !important}
  ${SM}:has([data-mobile-nav="frame"] [data-phase="hero"]) [data-mobile-nav="fab"]${X} > svg{opacity:0 !important}
  ${SM}:has([data-mobile-nav="frame"] [data-phase="hero"]) [data-mobile-nav="fab"]${X}::before{
    content:"" !important;position:absolute !important;left:50% !important;top:50% !important;
    width:17px !important;height:17px !important;margin:-8.5px 0 0 -8.5px !important;background:currentColor !important;${vicon('nav-left')}}
  ${SM}:has([data-mobile-nav="frame"] [data-phase="hero"]) [data-mobile-nav="fab"]${X}:active{
    background:linear-gradient(135deg,rgba(var(--ae-pink-rgb),.65),rgba(var(--ae-violet-rgb),.62)) !important;color:#fff !important;transform:scale(.93) !important}
  ${HM}[class*="headerBlank"] [class*="_headerCorner"]${X}{margin-left:auto !important;margin-right:0 !important}
}

/* ================= header: Classic bridge fallback ================= */
${HC}${X}{padding-top:8px !important;border-bottom:0 !important;
  background:linear-gradient(180deg,rgba(var(--ae-plum-rgb),.94),rgba(var(--ae-plum-rgb),.66)) !important;
  box-shadow:0 8px 18px -14px rgba(0,0,0,.8) !important}
${HC}${X}::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(var(--ae-pink-rgb),.55) 22%,rgba(var(--ae-cyan-rgb),.5) 72%,transparent)}
${HC} ${ICONBTN}${X}{width:34px !important;height:34px !important;min-width:34px !important;min-height:34px !important;padding:0 !important;margin:0 !important;
  border:0 !important;border-radius:11px !important;clip-path:none !important;color:var(--ae-pink-soft) !important;
  background:linear-gradient(160deg,rgba(var(--ae-pink-rgb),.24),rgba(var(--ae-plum3-rgb),.74) 50%,rgba(var(--ae-plum-rgb),.86)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.34),inset 0 1px 0 rgba(255,255,255,.14),0 3px 8px rgba(0,0,0,.35) !important}
${HC} ${ICONBTN}${X}::after{content:"" !important;display:block !important;position:absolute !important;inset:auto !important;right:4px !important;top:4px !important;
  width:3px !important;height:3px !important;background:var(--ae-cyan) !important;box-shadow:0 0 4px var(--ae-cyan);opacity:.8;-webkit-mask:none !important;mask:none !important;z-index:1}
${HC} ${ICONBTN}${X}:active{background:linear-gradient(160deg,var(--ae-pink),rgba(var(--ae-violet-rgb),.9)) !important;color:#2a0b22 !important;transform:translateY(1px)}
${C}[data-ae-header-style="classic"][data-ae-pixel-icons] [data-phase] header button[aria-label="更多操作"]${X}{position:relative !important}
${C}[data-ae-header-style="classic"][data-ae-pixel-icons] [data-phase] header button[aria-label="更多操作"] > svg{opacity:0 !important}
${C}[data-ae-header-style="classic"][data-ae-pixel-icons] [data-phase] header button[aria-label="更多操作"]${X}::before{content:"";position:absolute;left:50%;top:50%;width:20px;height:20px;margin:-10px 0 0 -10px;background:currentColor;${icon('more')};pointer-events:none}
${HC} .dsh-ling-btn${X}{height:34px !important;min-height:34px !important;padding:0 10px !important;border:0 !important;border-radius:11px !important;white-space:nowrap;
  font-size:12.5px !important;font-weight:600;color:var(--ae-cyan) !important;
  background:linear-gradient(160deg,rgba(var(--ae-cyan-rgb),.18),rgba(var(--ae-plum3-rgb),.74) 55%) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-cyan-rgb),.34),0 3px 8px rgba(0,0,0,.3) !important}
${HC} [class$="_titleRow"]${X}{column-gap:6px !important}
${HC} nav[class*="_crumbs"] [class*="crumbCurrent"]{text-shadow:0 0 10px rgba(var(--ae-pink-rgb),.45),1px 1px 0 rgba(0,0,0,.5)}
${HC} [class*="SVAs4q_label"]${X}{display:inline-flex !important;align-items:center !important;gap:5px !important;height:26px !important;line-height:26px !important;
  padding:0 11px 0 9px !important;margin:0 !important;max-width:none !important;border:0 !important;border-radius:999px !important;
  font-size:12px !important;font-weight:600;color:var(--ae-pink-soft) !important;
  background:linear-gradient(90deg,rgba(var(--ae-pink-rgb),.28),rgba(var(--ae-violet-rgb),.16)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.45),0 0 12px -3px rgba(var(--ae-pink-rgb),.5) !important}
${HC} [class*="SVAs4q_label"]${X}::before,${HC} [class*="SVAs4q_label"]${X}::after{content:none !important;display:none !important}
${HC} button[class*="QsffPG_trigger"]${X}{position:relative !important;height:26px !important;min-height:26px !important;padding:0 11px 0 26px !important;margin:0 !important;
  border:0 !important;border-radius:999px !important;font-size:12px !important;font-weight:600;color:var(--ae-cyan) !important;
  background:linear-gradient(90deg,rgba(var(--ae-cyan-rgb),.18),rgba(var(--ae-violet-rgb),.12)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-cyan-rgb),.42) !important}
${HC} button[class*="QsffPG_trigger"]${X}::before{content:"" !important;position:absolute;left:9px;top:50%;width:12px;height:12px;margin-top:-6px;background:currentColor !important;${icon('echo')}}
${HC} button[class*="QsffPG_trigger"]${X}::after{content:none !important;display:none !important}
${HC} [class*="ZKlsPq_root"]:has(> button[class*="ZKlsPq_trigger"])${X}{display:inline-flex !important;align-items:center !important;align-self:flex-end !important;height:26px !important;margin:0 !important;gap:0 !important}
${HC} button[class*="ZKlsPq_trigger"]${X}{position:relative !important;display:inline-flex !important;align-items:center !important;gap:3px !important;
  width:auto !important;height:26px !important;min-height:26px !important;padding:0 8px 0 25px !important;margin:0 !important;
  border:0 !important;border-image:none !important;border-radius:999px !important;clip-path:none !important;white-space:nowrap !important;
  font-size:12px !important;font-weight:600;line-height:26px !important;color:#d9ccff !important;
  background:linear-gradient(90deg,rgba(var(--ae-violet-rgb),.26),rgba(var(--ae-pink-rgb),.10)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-violet-rgb),.55) !important}
${HC} button[class*="ZKlsPq_trigger"]${X}::before{content:"" !important;position:absolute;left:8px;top:50%;width:13px;height:13px;margin-top:-6.5px;background:currentColor !important;${icon('androids')}}
${HC} button[class*="ZKlsPq_trigger"]${X}::after{content:none !important;display:none !important}
${HC} button[class*="ZKlsPq_trigger"][aria-label*="正在"]${X},${HC} button[class*="ZKlsPq_trigger"][aria-label*="running"]${X}{color:var(--ae-pink-soft) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.55),0 0 12px -3px rgba(var(--ae-pink-rgb),.6) !important}
${HC} button[class*="ZKlsPq_trigger"]:is([aria-label*="正在"],[aria-label*="running"])${X}::before{background:var(--ae-pink) !important;animation:ae-twinkle 1.2s steps(2) infinite}
${HC} button[class*="ZKlsPq_trigger"] [class*="ZKlsPq_activitySlot"]${X}{display:none !important}
${HC} button[class*="ZKlsPq_trigger"] > svg${X}{width:12px !important;height:12px !important;flex:none !important;opacity:.75}
${HC} button[class*="QsffPG_trigger"]:is([aria-label*="巡航"],[aria-label*="运行中"])${X}{color:var(--ae-pink-soft) !important;
  background:linear-gradient(90deg,rgba(var(--ae-pink-rgb),.24),rgba(var(--ae-cyan-rgb),.12)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.5),0 0 12px -3px rgba(var(--ae-pink-rgb),.6) !important}
${HC} button[class*="QsffPG_trigger"]:is([aria-label*="巡航"],[aria-label*="运行中"])${X}::before{background:var(--ae-pink) !important;animation:ae-twinkle 1.2s steps(2) infinite}
${HC} [class*="QsffPG_count"]{font-size:12px !important}
${HC} button[aria-label="智能体团队"]${X}{width:32px !important;min-width:32px !important;height:26px !important;min-height:26px !important;padding:0 !important;margin:0 !important;
  border:0 !important;border-radius:999px !important;color:var(--ae-pink-soft) !important;
  background:rgba(var(--ae-plum3-rgb),.72) !important;box-shadow:inset 0 0 0 1px rgba(var(--ae-violet-rgb),.42) !important}
${HC} button[aria-label="智能体团队"]${X}::before{width:16px !important;height:16px !important;margin:-8px 0 0 -8px !important}
${HC} button[aria-label="智能体团队"]${X}::after{content:none !important;display:none !important}
${HC} [data-conversation-tabs] button${X}{height:30px !important;padding:0 10px !important;border:0 !important;border-radius:10px 10px 0 0 !important;
  background:transparent !important;box-shadow:none !important;color:var(--dsw-alias-label-tertiary) !important}
${HC} [data-conversation-tabs] button:is([class*="Active"],[aria-selected="true"])${X}{color:#fff !important;
  background:linear-gradient(180deg,rgba(var(--ae-pink-rgb),0),rgba(var(--ae-pink-rgb),.22)) !important;
  box-shadow:inset 0 -2px 0 var(--ae-pink),0 8px 12px -10px rgba(var(--ae-pink-rgb),.9) !important;text-shadow:0 0 8px rgba(var(--ae-pink-rgb),.7)}
@media (max-width:760px){
  ${HCT} [class$="_headerActions"]${X}{display:flex !important;position:absolute !important;inset:0 !important;z-index:3;pointer-events:none;margin:0 !important;
    flex-direction:row !important;align-items:flex-end !important;justify-content:flex-end !important;gap:6px !important;padding:0 10px 4px 0 !important}
  ${HCT} [class$="_headerActions"] > [data-slot] > *${X}{pointer-events:auto;margin:0 !important;flex:none !important;max-width:none !important;order:20 !important}
  ${HCT} [class$="_headerActions"] > [data-slot] > [class*="VoX2oq_root"]${X}{order:30 !important}
  ${HCT} [class$="_headerActions"] > [data-slot] > [class*="SVAs4q_label"]${X}{align-self:flex-end !important;max-width:none !important;margin:0 !important}
  ${HCT} [data-mobile-nav="toggle"]${X}{position:absolute !important;left:10px !important;top:8px !important}
  ${HCT} [data-mobile-nav="files"]${X}{position:absolute !important;left:50px !important;top:8px !important}
  ${HCT} [class$="_titleRow"]${X}{padding-left:50px !important;min-height:34px !important}
  ${HCT} [class*="_tabs"]${X}{margin-top:8px !important;padding-left:10px !important;padding-right:var(--ae-chip-room,250px) !important;min-width:0;flex-wrap:nowrap !important}
  ${HCT} [data-conversation-tabs]${X}{flex:none !important;flex-wrap:nowrap !important;min-width:0 !important;overflow:visible !important;scrollbar-width:none;gap:6px !important}
  ${HCT} [data-conversation-tabs] button${X}{flex:none !important;white-space:nowrap !important;margin:0 !important;padding:0 6px !important;min-width:0 !important}
  ${HCT} [class*="viewsMoreAnchor"] button${X}{width:22px !important;min-width:22px !important;padding:0 !important}
  ${HCT} [class*="viewsMoreAnchor"]${X}{flex:none !important}
  ${HCT}[data-ae-chips] [class*="SVAs4q_label"]${X}{width:30px !important;padding:0 !important;gap:0 !important;justify-content:center !important;font-size:0 !important}
  ${HCT}[data-ae-chips="2"] [class*="QsffPG_count"]${X}{display:inline-block !important;max-width:calc(var(--ae-jobs-digits,1) * 1ch) !important;overflow:hidden !important;white-space:nowrap !important;font-variant-numeric:tabular-nums}
  ${HCT}[data-ae-chips="2"] button[class*="ZKlsPq_trigger"] > span:not([class])${X}{display:inline-block !important;max-width:calc(var(--ae-sub-digits,1) * 1ch) !important;overflow:hidden !important;white-space:nowrap !important;font-variant-numeric:tabular-nums}
  ${HCT}[data-ae-chips="2"] button[class*="ZKlsPq_trigger"]${X}{padding-right:6px !important}
  ${HCT} [data-conversation-tabs]::-webkit-scrollbar{display:none}
  ${C}[data-ae-header-style="classic"]:has([data-mobile-nav="frame"] [data-phase="hero"]) [data-mobile-nav="fab"]${X}{top:calc(env(safe-area-inset-top,0px) + 8px) !important;left:10px !important;
    width:34px !important;height:34px !important;min-width:34px !important;padding:0 !important;border:0 !important;border-image:none !important;border-radius:11px !important;
    color:var(--ae-pink-soft) !important;
    background:linear-gradient(160deg,rgba(var(--ae-pink-rgb),.24),rgba(var(--ae-plum3-rgb),.74) 50%,rgba(var(--ae-plum-rgb),.86)) !important;
    box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.34),inset 0 1px 0 rgba(255,255,255,.14),0 3px 8px rgba(0,0,0,.35) !important}
  ${C}[data-ae-header-style="classic"]:has([data-mobile-nav="frame"] [data-phase="hero"]) [data-mobile-nav="fab"]${X}:active{background:linear-gradient(160deg,var(--ae-pink),rgba(var(--ae-violet-rgb),.9)) !important;color:#2a0b22 !important}
  ${HC}[class*="headerBlank"] [class*="_headerCorner"]${X}{margin-left:auto !important;margin-right:0 !important}
}

/* ================= composer card ================= */
${CARD}${X}{position:relative;border:0 !important;border-image:none !important;border-radius:20px !important;
  background:
    radial-gradient(110% 75% at 8% 0%,rgba(var(--ae-pink-rgb),.18),transparent 58%),
    radial-gradient(95% 70% at 96% 100%,rgba(var(--ae-cyan-rgb),.14),transparent 62%),
    linear-gradient(175deg,rgba(var(--ae-plum2-rgb),.88),rgba(var(--ae-plum-rgb),.94)) !important;
  -webkit-backdrop-filter:blur(18px) saturate(1.3);backdrop-filter:blur(18px) saturate(1.3);
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.34),inset 0 1px 0 rgba(255,255,255,.14),0 12px 30px -10px rgba(0,0,0,.8),0 0 26px -10px rgba(var(--ae-pink-rgb),.44) !important;
  transition:box-shadow .18s ease !important}
${CARD}${X}::before{content:"";position:absolute;left:22px;right:22px;top:0;height:1.5px;border-radius:2px;pointer-events:none;opacity:.92;
  background:linear-gradient(90deg,transparent,rgba(var(--ae-pink-rgb),.85) 26%,rgba(255,255,255,.72) 50%,rgba(var(--ae-cyan-rgb),.85) 74%,transparent)}
${CARD}${X}:focus-within{box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.65),inset 0 1px 0 rgba(255,255,255,.18),0 12px 32px -10px rgba(0,0,0,.82),0 0 32px -6px rgba(var(--ae-pink-rgb),.58) !important}
${CARD} [data-composer-placeholder]{color:rgba(var(--ae-violet-rgb),.0);color:rgba(214,204,240,.5) !important}
${CARD} [class*="_tools"]${X}{gap:6px !important}

/* + key: pink gem square */
${CARD} button[class*="_add"]${X}{position:relative;width:34px !important;height:34px !important;min-width:34px !important;min-height:34px !important;padding:0 !important;
  border:0 !important;border-image:none !important;border-radius:12px !important;color:#fff !important;
  background:linear-gradient(135deg,rgba(255,255,255,.35),rgba(255,255,255,0) 40%),linear-gradient(135deg,var(--ae-pink),rgba(var(--ae-violet-rgb),1)) !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.45),inset 0 -2px 0 rgba(40,0,40,.35),0 0 12px -2px rgba(var(--ae-pink-rgb),.75) !important}
${CARD} button[class*="_add"]${X} > svg{opacity:0 !important}
${CARD} button[class*="_add"]${X}::before{content:"";position:absolute;left:50%;top:50%;width:18px;height:18px;margin:-9px 0 0 -9px;background:currentColor;${icon('plus')};pointer-events:none}
${CARD} button[class*="_add"]${X}:active{transform:translateY(1px) scale(.96)}

/* tool pills: access mode, prompt prep, GitHub */
${CARD} ${TOOL}${X}{height:34px !important;min-height:34px !important;padding:0 10px !important;border:0 !important;border-radius:12px !important;
  font-size:12.5px !important;color:var(--dsw-alias-label-secondary) !important;
  background:rgba(var(--ae-plum3-rgb),.62) !important;box-shadow:inset 0 0 0 1px rgba(var(--ae-violet-rgb),.32),inset 0 1px 0 rgba(255,255,255,.06) !important}
${CARD} ${TOOL}${X}:active{background:rgba(var(--ae-pink-rgb),.22) !important}
${CARD} button[class*="iWlSmW_trigger"] svg{color:var(--ae-cyan) !important}
${CARD} .dsh-ppb-glyph{color:var(--ae-pink) !important}

/* model capsule */
${C}[data-ae-capsule] .dsh-reasoning-model__trigger${X}{height:36px !important;padding:0 10px 0 9px !important;gap:6px !important;border:0 !important;border-radius:999px !important;
  max-width:min(66vw,260px) !important;
  background:linear-gradient(90deg,rgba(var(--ae-pink-rgb),.22),rgba(var(--ae-violet-rgb),.14) 60%,rgba(var(--ae-cyan-rgb),.10)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.45),inset 0 1px 0 rgba(255,255,255,.08) !important}
${C}[data-ae-capsule] .dsh-reasoning-model__model{font-size:13px !important;font-weight:650 !important;color:#fff !important}
${C}[data-ae-capsule] .dsh-reasoning-model__effort${X}{padding:1px 7px !important;border-radius:999px !important;font-size:11.5px !important;font-weight:700 !important;
  background:rgba(var(--ae-pink-rgb),.2) !important;box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.38)}

/* send: star gem; disabled: dim; running: cyan stop ring */
${CARD} button[class*="_primary"]${X}{position:relative;width:40px !important;height:40px !important;min-width:40px !important;min-height:40px !important;padding:0 !important;
  border:0 !important;border-image:none !important;border-radius:50% !important;color:#2a0b22 !important;filter:none !important;
  background:radial-gradient(circle at 35% 30%,#fff 0 7%,#ffd2ec 20%,var(--ae-pink) 55%,rgba(var(--ae-violet-rgb),1) 100%) !important;
  box-shadow:0 0 0 2px rgba(var(--ae-plum-rgb),.9),0 0 0 3px rgba(var(--ae-pink-rgb),.6),0 0 16px rgba(var(--ae-pink-rgb),.7) !important}
${CARD} button[class*="_primary"]${X} > svg{opacity:0 !important}
${CARD} button[class*="_primary"]${X}::before{content:"";position:absolute;left:50%;top:50%;width:18px;height:18px;margin:-9px 0 0 -9px;background:currentColor;${icon('arrow-up')};pointer-events:none}
${CARD} button[class*="_primary"]${X}:active:not(:disabled){transform:scale(.94)}
${CARD} button[class*="_primary"]${X}:disabled{color:rgba(214,204,240,.45) !important;
  background:rgba(var(--ae-plum3-rgb),.8) !important;box-shadow:inset 0 0 0 1px rgba(var(--ae-violet-rgb),.35) !important}
${CARD} button[class*="_primary"][aria-label*="停止"]${X}{color:#06222b !important;
  background:radial-gradient(circle at 35% 30%,#fff 0 7%,#c9f7ff 22%,var(--ae-cyan) 60%,rgba(var(--ae-violet-rgb),.9) 100%) !important;
  box-shadow:0 0 0 2px rgba(var(--ae-plum-rgb),.9),0 0 14px rgba(var(--ae-cyan-rgb),.7) !important}
${CARD} button[class*="_primary"][aria-label*="停止"]${X}::before{width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:2px;-webkit-mask:none;mask:none}
${CARD} button[class*="_primary"][aria-label*="停止"]${X}::after{content:"";position:absolute;inset:-5px;border-radius:50%;pointer-events:none;
  border:2px dashed rgba(var(--ae-cyan-rgb),.75);animation:ae-ring-spin 3s linear infinite}
@keyframes ae-ring-spin{to{transform:rotate(360deg)}}

/* ================= stats rail ================= */
${DOCK}${X}{display:flex !important;flex-wrap:nowrap !important;align-items:center !important;gap:5px !important;margin-top:8px !important;padding:4px !important;min-height:0 !important;
  border-radius:15px !important;
  background:linear-gradient(180deg,rgba(var(--ae-plum2-rgb),.72),rgba(var(--ae-plum-rgb),.78)) !important;
  -webkit-backdrop-filter:blur(14px) saturate(1.22);backdrop-filter:blur(14px) saturate(1.22);
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.24),inset 0 1px 0 rgba(255,255,255,.10),0 6px 18px -10px rgba(0,0,0,.65) !important}
${DOCK} > [data-slot="conversation.composer.dock"]${X}{display:flex !important;flex:1 1 auto !important;min-width:0 !important;gap:4px !important;
  overflow-x:auto !important;overflow-y:hidden !important;scrollbar-width:none;
  -webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 16px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 16px),transparent)}
${DOCK} > [data-slot="conversation.composer.dock"]::-webkit-scrollbar{display:none}
${DOCK} > [data-slot="conversation.composer.dock"] > *${X}{flex:none !important;min-width:0 !important;max-width:none !important}
${DOCK} > [data-slot="conversation.composer.dock"] > *:last-child{margin-right:12px}
${DOCK} :is(button[class*="_pill"],.dsh-subscription-usage-pill)${X}{height:30px !important;padding:0 10px !important;gap:6px !important;max-width:none !important;
  border:0 !important;border-radius:11px !important;font-size:12px !important;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary) !important;
  background:rgba(var(--ae-plum3-rgb),.62) !important;box-shadow:inset 0 0 0 1px rgba(var(--ae-violet-rgb),.28) !important}
${DOCK} :is(button[class*="_pill"],.dsh-subscription-usage-pill) > span${X}{overflow:visible !important;text-overflow:clip !important;max-width:none !important}
${DOCK} [class*="_sep"]{color:rgba(var(--ae-pink-rgb),.6) !important;margin:0 5px !important}
${DOCK} > [data-slot] > :nth-child(1) svg{color:var(--ae-pink) !important}
${DOCK} > [data-slot] > :nth-child(2) svg{color:var(--ae-cyan) !important}
${DOCK} > [data-slot] > :nth-child(n+3) svg{color:#c9a7ff !important}
${DOCK} :is(button[class*="_pill"],.dsh-subscription-usage-pill)${X}:active{background:rgba(var(--ae-pink-rgb),.22) !important}
${DOCK} > [class*="JObwrW_root"]${X}{flex:none !important}
${DOCK} button[class*="JObwrW_trigger"]${X}{height:30px !important;min-height:30px !important;padding:0 10px 0 7px !important;gap:5px !important;
  border:0 !important;border-radius:11px !important;font-size:12px !important;font-weight:700 !important;color:var(--ae-pink-soft) !important;
  background:linear-gradient(90deg,rgba(var(--ae-pink-rgb),.24),rgba(var(--ae-violet-rgb),.14)) !important;box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.45) !important}
${DOCK} button[class*="JObwrW_trigger"] svg{width:16px !important;height:16px !important}
${DOCK} button[class*="JObwrW_trigger"] [class*="JObwrW_track"]{stroke:rgba(255,255,255,.14) !important}
${DOCK} button[class*="JObwrW_trigger"] [class*="JObwrW_fill"]{stroke:var(--ae-pink) !important;filter:drop-shadow(0 0 2px var(--ae-pink))}

/* ================= collapse handle ================= */
${C} [data-mobile-nav="composer-toggle"]${X}{position:relative;height:28px !important;min-height:28px !important;width:auto !important;margin:6px auto 2px !important;padding:0 15px 0 28px !important;
  border:0 !important;border-radius:999px !important;font-family:inherit !important;font-size:12px !important;line-height:28px !important;font-weight:600 !important;letter-spacing:1.2px !important;
  color:#f0ddf8 !important;
  background:linear-gradient(125deg,rgba(var(--ae-pink-rgb),.14),rgba(var(--ae-plum2-rgb),.78) 55%,rgba(var(--ae-cyan-rgb),.10)) !important;
  -webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.30),inset 0 1px 0 rgba(255,255,255,.12),0 4px 12px -6px rgba(0,0,0,.55) !important}
${C} [data-mobile-nav="composer-toggle"]${X}::before{left:10px !important;width:12px !important;height:12px !important;margin-top:-6px !important}
${C} [data-mobile-nav="frame"][data-dshm-composer="collapsed"] [data-mobile-nav="composer-toggle"]${X}{height:32px !important;line-height:32px !important;color:#fff !important;
  background:linear-gradient(90deg,var(--ae-pink),rgba(var(--ae-violet-rgb),1)) !important;box-shadow:0 0 16px -2px rgba(var(--ae-pink-rgb),.7) !important}
${C} [data-mobile-nav="frame"][data-dshm-composer="collapsed"] [data-mobile-nav="composer-toggle"]${X}::before{background:#fff !important}
`;
}

// The tab row shares its line with the mode / jobs / team chips, whose text varies.
// Measure what the view tabs need first, then pick how compact the chips must be
// (1 = mode chip icon-only, 2 = jobs chip shows only its number) and reserve exactly
// the chips' width on the right of the tab strip. Widths are computed from text, not
// from the live (already compacted) chips, so the choice cannot oscillate.
function install() {
  const root = document.documentElement;
  const cv = document.createElement('canvas').getContext('2d');
  const textW = (el, text) => {
    const cs = getComputedStyle(el);
    cv.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    return Math.ceil(cv.measureText(text).width);
  };
  const natural = new Map();
  let q = 0;
  const reset = (header) => {
    header.style.removeProperty('--ae-chip-room');
    header.style.removeProperty('--ae-jobs-digits');
    header.style.removeProperty('--ae-sub-digits');
    header.removeAttribute('data-ae-chips');
  };
  const measure = () => {
    q = 0;
    const header = document.querySelector('[data-mobile-nav="frame"] [data-phase] header');
    if (!header) return;
    const tabsRow = header.querySelector('[class*="_tabs"]');
    const tabs = header.querySelector('[data-conversation-tabs]');
    const acts = header.querySelector('[class$="_headerActions"]');
    if (!root.hasAttribute('data-ae-chrome') || innerWidth > 760 || !tabsRow || !tabs || !acts) { reset(header); return; }
    const items = [...acts.querySelectorAll(':scope > [data-slot] > *:not([data-mobile-nav])')].filter((el) => el.getClientRects().length);
    const level0 = !header.hasAttribute('data-ae-chips');
    const w = [0, 0, 0];
    let digits = 1;
    let subDigits = 1;
    for (const el of items) {
      const jobs = el.matches('[class*="QsffPG_trigger"]') ? el : el.querySelector('[class*="QsffPG_trigger"]');
      const sub = el.querySelector('button[class*="ZKlsPq_trigger"]');
      const real = el.getBoundingClientRect().width;
      if (sub) {
        const count = sub.querySelector(':scope > span:not([class])') || sub;
        const text = count.textContent.trim();
        const n = (text.match(/\d+/) || ['0'])[0];
        subDigits = n.length;
        const key = 's:' + text;
        if (level0) natural.set(key, real);
        const full = natural.get(key) || 47 + textW(count, text);
        w[0] += full; w[1] += full; w[2] += full - textW(count, text) + textW(count, n) - 2;
      } else if (el.matches('[class*="SVAs4q_label"]')) {
        const key = 'm:' + el.textContent.trim();
        if (level0) natural.set(key, real);
        const full = natural.get(key) || 38 + textW(el, el.textContent.trim());
        w[0] += full; w[1] += 30; w[2] += 30;
      } else if (jobs) {
        const count = jobs.querySelector('[class*="QsffPG_count"]') || jobs;
        const text = count.textContent.trim();
        const n = (text.match(/\d+/) || ['0'])[0];
        digits = n.length;
        const key = 'j:' + text;
        if (level0) natural.set(key, real);
        const full = natural.get(key) || 38 + textW(count, text);
        w[0] += full; w[1] += full; w[2] += full - textW(count, text) + textW(count, n);
      } else {
        w[0] += real; w[1] += real; w[2] += real;
      }
    }
    const gaps = Math.max(0, items.length - 1) * 6;
    const hr = header.getBoundingClientRect(), tr = tabsRow.getBoundingClientRect();
    const more = header.querySelector('[class*="viewsMoreAnchor"]');
    const need = Math.max(tabs.getBoundingClientRect().right, more ? more.getBoundingClientRect().right : 0) + 8;
    const edgePad = root.getAttribute('data-ae-header-style') === 'classic' ? 10 : 12;
    const avail = hr.right - edgePad - need;
    let level = 0;
    while (level < 2 && w[level] + gaps > avail - 4) level++;
    const chipsLeft = hr.right - edgePad - (w[level] + gaps);
    const room = Math.max(16, Math.ceil(tr.right - chipsLeft + 8)) + 'px';
    if (header.style.getPropertyValue('--ae-chip-room') !== room) header.style.setProperty('--ae-chip-room', room);
    header.style.setProperty('--ae-jobs-digits', String(digits));
    header.style.setProperty('--ae-sub-digits', String(subDigits));
    if (level) header.setAttribute('data-ae-chips', String(level)); else header.removeAttribute('data-ae-chips');
  };
  const schedule = () => { if (!q) q = requestAnimationFrame(measure); };
  let watched = null;
  const headerChanges = new MutationObserver(schedule);
  const bind = () => {
    const next = document.querySelector('[data-mobile-nav="frame"] [data-phase] header');
    if (next === watched) return;
    headerChanges.disconnect(); watched = next;
    if (next) headerChanges.observe(next, { childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:['aria-label', 'class'] });
    schedule();
  };
  const mo = new MutationObserver(records => {
    if (watched) { if (!watched.isConnected) bind(); return; }
    for (const r of records) for (const n of r.addedNodes) {
      if (n.nodeType === 1 && (n.matches('header') || n.querySelector('header'))) { bind(); return; }
    }
  });
  const rootChanges = new MutationObserver(() => { natural.clear(); bind(); schedule(); });
  mo.observe(document.getElementById('root'), { childList:true, subtree:true });
  rootChanges.observe(root, { attributes:true, attributeFilter:['data-ae-chrome', 'data-ae-header-style'] });
  bind();
  addEventListener('resize', schedule);
  if (document.fonts) document.fonts.ready.then(schedule);
  schedule();
  return () => {
    mo.disconnect(); headerChanges.disconnect(); rootChanges.disconnect(); removeEventListener('resize', schedule); if (q) cancelAnimationFrame(q);
    const header = document.querySelector('[data-phase] header'); if (header) reset(header);
  };
}

module.exports = { buildCss, install };

};
modules["dock.js"] = function(require, module, exports) {
"use strict";
// Aemeath quick menu: a column of pixel 9-slice buttons that pops up next to
// the pixel Aemeath ONLY when she is tapped. It never appears on its own:
// tapping her again, tapping anywhere else, pressing Escape or running one of
// its actions closes it. Move it by dragging Aemeath herself (the menu always
// opens beside her, on the side with more room). Buttons and their order are
// edited in the theme panel.
const store = require('./store.js');
const icons = require('./icons.js');
const { asset } = require('./assets.js');

const svg = (name) => `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">${icons[name] || icons.star}</svg>`;

const CSS = `
#aemeath-dock{position:fixed;left:0;top:0;z-index:46;display:flex;flex-direction:column;align-items:stretch;gap:6px;padding:7px 6px;
  --b:44px;background:rgba(13,9,27,.88);border:2px solid #ff69b7;box-shadow:3px 3px 0 #0d091b,0 0 16px rgba(255,105,183,.4);
  -webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);transform-origin:var(--ox,0%) 50%;
  animation:ae-dock-pop .16s steps(4) both}
html[style*="color-scheme: light"] #aemeath-dock{background:rgba(255,244,250,.94)}
#aemeath-dock[hidden]{display:none}
#aemeath-dock[data-size="s"]{--b:38px}
#aemeath-dock[data-size="l"]{--b:50px}
@keyframes ae-dock-pop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}
#aemeath-dock .ae-dock-btn{position:relative;height:var(--b);min-width:var(--b);display:flex;align-items:center;gap:8px;padding:0 10px 0 6px;cursor:pointer;color:#ffd5ea;
  border-style:solid;border-width:4px;border-color:transparent;border-image:url("${asset('btn-plum.png')}") 4 fill / 8px / 0 stretch;image-rendering:pixelated;
  background:none;font:inherit;font-size:13px;font-weight:600;white-space:nowrap;text-align:left}
#aemeath-dock .ae-dock-btn[data-on]{border-image-source:url("${asset('btn-pink.png')}");color:#3a0f2a}
#aemeath-dock .ae-dock-btn:active{border-image-source:url("${asset('btn-pink-pressed.png')}");color:#3a0f2a}
#aemeath-dock .ae-dock-btn svg{flex:none;width:calc(var(--b) * .46);height:calc(var(--b) * .46);filter:drop-shadow(1px 1px 0 rgba(13,9,27,.7))}
#aemeath-dock[data-compact] .ae-dock-btn{padding:0;justify-content:center}
#aemeath-dock[data-compact] .ae-dock-btn span{display:none}
#aemeath-dock .ae-dock-btn:focus-visible{outline:2px solid #77e8ff;outline-offset:1px}
`;

/** Action table. `run()` performs, `on()` (optional) reports a toggle state. */
function actions(ctx, hooks) {
  const q = (s) => document.querySelector(s);
  const clickFirst = (...sels) => { for (const s of sels) { const e = q(s); if (e) { e.click(); return true; } } return false; };
  const scroller = () => q('[data-conversation-scroll]') || q('[data-conversation-content]');
  const pager = hooks.pager || {};
  return {
    newSession: {
      label: '新会话', icon: 'plus',
      run() {
        if (clickFirst('button[class*="_newSession"]')) { pager.navigatePager?.('chat', () => {}); return; }
        try { ctx.get('uiWorkspace')?.startSession?.(); } catch { /* ignore */ }
      },
    },
    sidebar: {
      label: '会话列表', icon: 'menu',
      run() {
        const toggle = () => { try { ctx.get('layout').toggleSidebar(); } catch { /* ignore */ } };
        if (pager.togglePager && window.matchMedia('(max-width: 1023px)').matches) pager.togglePager(toggle); else toggle();
      },
    },
    composer: {
      label: '收起/展开输入框', icon: 'message',
      run() {
        if (clickFirst('[data-mobile-nav="composer-toggle"]')) return;
        const seat = q('[data-composer-seat]');
        if (seat) seat.style.display = seat.style.display === 'none' ? '' : 'none';
      },
      on: () => !!q('[data-dshm-composer="collapsed"]'),
    },
    scrollBottom: {
      label: '回到最新', icon: 'bar-down',
      run() { const s = scroller(); if (s) s.scrollTo({ top: s.scrollHeight, behavior: 'smooth' }); },
    },
    scrollTop: {
      label: '回到顶部', icon: 'bar-up',
      run() { const s = scroller(); if (s) s.scrollTo({ top: 0, behavior: 'smooth' }); },
    },
    rightbar: {
      label: '右侧面板', icon: 'layout',
      run() {
        if (clickFirst('button[data-sidebar-right-expand]')) return;
        const open = q('[class*="_rightbarCol"]')?.offsetWidth > 0;
        try { const l = ctx.get('layout'); if (open) l.closeRightbar(); else l.openRightbar(); } catch { /* ignore */ }
      },
    },
    pet: {
      label: '隐藏爱弥斯', icon: 'eye-closed',
      run() { store.set({ pet: false }); },
    },
    scheme: {
      label: '深色/浅色', icon: 'moon',
      run() {
        const dark = document.documentElement.style.colorScheme !== 'light';
        try { ctx.get('theme').setTheme(dark ? 'light' : 'dark'); } catch { /* ignore */ }
      },
    },
    settings: {
      label: '主题设置', icon: 'sliders',
      run() { hooks.openPanel?.(); },
    },
  };
}

function install(ctx, hooks) {
  const style = document.createElement('style');
  style.dataset.plugin = 'dsh-aemeath-theme';
  style.dataset.pluginCss = 'dsh-aemeath-theme/dock.css';
  style.textContent = CSS;
  document.head.appendChild(style);

  const el = document.createElement('div');
  el.id = 'aemeath-dock';
  el.setAttribute('role', 'menu');
  el.setAttribute('aria-label', '爱弥斯快捷按键');
  el.hidden = true;
  document.body.appendChild(el);
  const table = actions(ctx, hooks);
  let open = false;

  function render() {
    const p = store.get();
    el.dataset.size = p.dockSize;
    el.toggleAttribute('data-compact', p.dockLabels === false);
    el.innerHTML = '';
    for (const a of p.dockActions) {
      if (!a.on || !table[a.id]) continue;
      const def = table[a.id];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ae-dock-btn';
      b.setAttribute('role', 'menuitem');
      b.dataset.action = a.id;
      b.setAttribute('aria-label', def.label);
      b.innerHTML = `${svg(def.icon)}<span>${def.label}</span>`;
      if (def.on && def.on()) b.setAttribute('data-on', '');
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        close();
        try { def.run(); } catch (err) { console.warn('[aemeath-theme] menu action failed', a.id, err); }
      });
      el.appendChild(b);
    }
  }

  /** Open beside the pet, on whichever side has more room. */
  function place() {
    const anchor = hooks.petRect?.();
    const w = el.offsetWidth, h = el.offsetHeight;
    let x, y, ox = '0%';
    if (anchor) {
      const roomRight = innerWidth - anchor.right, roomLeft = anchor.left;
      if (roomRight >= w + 6 || roomLeft >= w + 6) {
        const right = roomRight >= w + 6 && (roomRight >= roomLeft || roomLeft < w + 6);
        x = right ? anchor.right + 2 : anchor.left - w - 2;
        ox = right ? '0%' : '100%';
        y = anchor.top + anchor.height / 2 - h / 2;
      } else {
        // Not enough room on either side: stack above / below the pet instead.
        x = anchor.left + anchor.width / 2 - w / 2;
        y = anchor.top - h - 6 >= 4 ? anchor.top - h - 6 : anchor.bottom + 6;
      }
    } else {
      x = innerWidth - w - 8; y = innerHeight / 2 - h / 2;
    }
    x = Math.max(4, Math.min(innerWidth - w - 4, x));
    y = Math.max(4, Math.min(innerHeight - h - 4, y));
    el.style.setProperty('--ox', ox);
    el.style.left = `${Math.round(x)}px`;
    el.style.top = `${Math.round(y)}px`;
  }

  function show() {
    if (!store.get().dock) return false;
    open = true;
    render();
    el.hidden = false;
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    place();
    return true;
  }
  function close() {
    if (!open) return;
    open = false;
    el.hidden = true;
  }
  function toggle() { return open ? (close(), false) : show(); }

  // Outside tap / Escape / resize close the menu. Taps on the pet are handled
  // by the pet itself (it calls toggle()).
  const onDown = (e) => {
    if (!open) return;
    const t = e.target;
    if (el.contains(t) || (t && t.closest && t.closest('#aemeath-pet'))) return;
    close();
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const onResize = () => close();
  document.addEventListener('pointerdown', onDown, true);
  document.addEventListener('keydown', onKey);
  window.addEventListener('resize', onResize);

  const off = store.subscribe(() => { if (!store.get().dock || !store.get().pet) close(); else if (open) { render(); place(); } });
  return {
    toggle, show, close, isOpen: () => open,
    dispose() {
      off();
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      el.remove(); style.remove();
    },
  };
}

module.exports = { install, actions, svg };

};
modules["hero-css.js"] = function(require, module, exports) {
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

};
modules["icons.js"] = function(require, module, exports) {
"use strict";
// pixelarticons (MIT, Gerrit Halfmann) path data, viewBox 0 0 24 24.
module.exports = {
"plus": "<path fill=\"currentColor\" d=\"M13 11h7v2h-7v7h-2v-7H4v-2h7V4h2v7Z\"/>",
"menu": "<path fill=\"currentColor\" d=\"M20 18H4v-2h16v2Zm0-5H4v-2h16v2Zm0-5H4V6h16v2Z\"/>",
"arrow-down": "<path fill=\"currentColor\" d=\"M13 12h6v2h-2v2h-2v2h-2v2h-2v-2H9v-2H7v-2H5v-2h6V4h2v8Z\"/>",
"chevron-up": "<path fill=\"currentColor\" d=\"M13 8h-2v2h2V8Zm-2 2H9v2h2v-2Zm4 0h-2v2h2v-2Zm-6 2H7v2h2v-2Zm8 0h-2v2h2v-2ZM7 14H5v2h2v-2Zm12 0h-2v2h2v-2Z\"/>",
"chevron-down": "<path fill=\"currentColor\" d=\"M13 16h-2v-2h2v2Zm-2-2H9v-2h2v2Zm4 0h-2v-2h2v2Zm-6-2H7v-2h2v2Zm8 0h-2v-2h2v2ZM7 10H5V8h2v2Zm12 0h-2V8h2v2Z\"/>",
"heart": "<path fill=\"currentColor\" d=\"M13 22h-2v-2h2v2Zm-2-2H9v-2h2v2Zm4 0h-2v-2h2v2Zm-6-2H7v-2h2v2Zm8 0h-2v-2h2v2ZM7 16H5v-2h2v2Zm12 0h-2v-2h2v2ZM5 14H3v-2h2v2Zm16 0h-2v-2h2v2ZM3 12H1V6h2v6Zm20 0h-2V6h2v6ZM13 8h-2V6h2v2ZM5 6H3V4h2v2Zm6 0H9V4h2v2Zm4 0h-2V4h2v2Zm6 0h-2V4h2v2ZM9 4H5V2h4v2Zm10 0h-4V2h4v2Z\"/>",
"sliders": "<path fill=\"currentColor\" d=\"M8 14H7v6H5v-6H2v-2h6v2Zm5 6h-2V10h2v10Zm9-2h-3v2h-2v-2h-1v-2h6v2Zm-3-4h-2V4h2v10ZM7 10H5V4h2v6Zm6-4h2v2H9V6h2V4h2v2Z\"/>",
"settings": "<path fill=\"currentColor\" d=\"M4 20h3v-2h4v4h2v-4h4v2h-2v4H9v-4H7v2H2v-5h2v3Zm18 2h-5v-2h3v-3h2v5ZM6 11H2v2h4v4H4v-2H0V9h4V7h2v4Zm14-2h4v6h-4v2h-2v-4h4v-2h-4V7h2v2Zm-6 7h-4v-2h4v2Zm-4-2H8v-4h2v4Zm6 0h-2v-4h2v4Zm-2-4h-4V8h4v2ZM7 4H4v3H2V2h5v2Zm8 0h2V2h5v5h-2V4h-3v2h-4V2h-2v4H7V4h2V0h6v4Z\"/>",
"eye": "<path fill=\"currentColor\" d=\"M16 20H8v-2h8v2Zm-8-2H4v-2h4v2Zm12 0h-4v-2h4v2ZM4 16H2v-2h2v2Zm10-6h-2v2h2v-2h2v4h-2v2h-4v-2H8v-4h2V8h4v2Zm8 6h-2v-2h2v2ZM2 14H0v-4h2v4Zm22 0h-2v-4h2v4ZM4 10H2V8h2v2Zm18 0h-2V8h2v2ZM8 8H4V6h4v2Zm12 0h-4V6h4v2Zm-4-2H8V4h8v2Z\"/>",
"eye-closed": "<path fill=\"currentColor\" d=\"M0 10h2v4H0zm24 0h-2v4h2zm-8 0h-2v2h2zm-6 0H8v4h2zM2 8h2v2H2zm0 8h2v-2H2zm20-8h-2v2h2zm0 8h-2v-2h2zM4 6h4v2H4zm0 12h4v-2H4zM20 6h-4v2h4zM10 4h6v2h-6zM8 20h8v-2H8zm4-12h2v2h-2zm-2 6h4v2h-4zM8 8h2v2H8zm2 2h2v4h-2zm2 2h2v2h-2z\"/><path fill=\"currentColor\" d=\"M6 6h2v2H6zM4 4h2v2H4zM2 2h2v2H2zm12 12h2v2h-2zm2 2h2v2h-2zm2 2h2v2h-2zm2 2h2v2h-2z\"/>",
"move": "<path fill=\"currentColor\" d=\"M13 2h2v2h2v2h-4v5h5V7h2v2h2v2h2v2h-2v2h-2v2h-2v-4h-5v5h4v2h-2v2h-2v2h-2v-2H9v-2H7v-2h4v-5H6v4H4v-2H2v-2H0v-2h2V9h2V7h2v4h5V6H7V4h2V2h2V0h2v2Z\"/>",
"reload": "<path fill=\"currentColor\" d=\"M16 4h2v6h-2zm-2-2h2v2h-2zm0 2h2v8h-2zM4 8H2v5h2z\"/><path fill=\"currentColor\" d=\"M4 6h16v2H4zm4 14H6v-6h2zm2 2H8v-2h2zm0-2H8v-8h2zm10-4h2v-5h-2z\"/><path fill=\"currentColor\" d=\"M20 18H4v-2h16z\"/>",
"close": "<path fill=\"currentColor\" d=\"M7 19H5V17H7V19ZM19 19H17V17H19V19ZM9 15V17H7V15H9ZM17 17H15V15H17V17ZM11 15H9V13H11V15ZM15 15H13V13H15V15ZM13 13H11V11H13V13ZM11 11H9V9H11V11ZM15 11H13V9H15V11ZM9 9H7V7H9V9ZM17 9H15V7H17V9ZM7 7H5V5H7V7ZM19 7H17V5H19V7Z\"/>",
"message": "<path fill=\"currentColor\" d=\"M20 2H4v2h16zm0 14H6v2h14zm2-12h-2v12h2zM4 4H2v18h2zm2 14H4v2h2z\"/>",
"zap": "<path fill=\"currentColor\" d=\"M4 13h8v6h2v2h-2v2h-2v-8H2v-4h2v2Zm12 6h-2v-2h2v2Zm2-2h-2v-2h2v2Zm2-2h-2v-2h2v2Zm-6-6h8v4h-2v-2h-8V5h-2V3h2V1h2v8Zm-8 2H4V9h2v2Zm2-2H6V7h2v2Zm2-2H8V5h2v2Z\"/>",
"moon": "<path fill=\"currentColor\" d=\"M18 22H8v-2h10v2ZM8 20H6v-2h2v2Zm12 0h-2v-2h2v2ZM6 18H4v-2h2v2Zm16 0h-2v-4h-2v-2h2v-2h2v8ZM4 16H2V6h2v10Zm14 0h-6v-2h6v2Zm-6-2h-2v-2h2v2Zm-2-2H8V6h2v6ZM6 6H4V4h2v2Zm8-2h-2v2h-2V4H6V2h8v2Z\"/>",
"image": "<path fill=\"currentColor\" d=\"M4 2h16v2H4zm0 18h16v2H4zM2 4h2v16H2zm18 0h2v16h-2zm-4 8h2v2h-2zm-2 2h2v2h-2zm4 0h2v2h-2zm-8 0h2v2h-2zm2 2h2v2h-2zm2 2h2v2h-2z\"/><path fill=\"currentColor\" d=\"M20 16h2v2h-2zM8 16h2v2H8zm-2 2h2v2H6zM8 6h2v2H8zM6 8h2v2H6zm2 2h2v2H8zm2-2h2v2h-2z\"/>",
"drag-and-drop": "<path fill=\"currentColor\" d=\"M11 21H9v-2h2v2Zm10 0h-2v-2h2v2ZM9 19H7V9h2v10Zm10-4h-2v2h-2v2h-2v-6h6v2Zm0 4h-2v-2h2v2ZM5 17H3v-2h2v2Zm0-4H3v-2h2v2Zm16-2h-2V9h2v2ZM5 9H3V7h2v2Zm14 0H9V7h10v2ZM5 5H3V3h2v2Zm4 0H7V3h2v2Zm4 0h-2V3h2v2Zm4 0h-2V3h2v2Z\"/>",
"grip": "<path fill=\"currentColor\" d=\"M21 11H11v10H7V7h14v4Zm0 10h-2v-2h2v2Zm-2-6h-2v2h-2v2h-2v-6h6v2Zm0 4h-2v-2h2v2ZM5 17H3v-2h2v2Zm0-4H3v-2h2v2Zm0-4H3V7h2v2Zm0-4H3V3h2v2Zm4 0H7V3h2v2Zm4 0h-2V3h2v2Zm4 0h-2V3h2v2Z\"/>",
"arrow-up": "<path fill=\"currentColor\" d=\"M11 20h2V4h-2zm2-12h2V6h-2zm2 2h2V8h-2zm2 2h2v-2h-2zm-6-4H9V6h2z\"/><path fill=\"currentColor\" d=\"M15 10H7V8h8zm2 2H5v-2h12z\"/>",
"sun": "<path fill=\"currentColor\" d=\"M13 22h-2v-3h2v3Zm-6-3H5v-2h2v2Zm12 0h-2v-2h2v2Zm-4-2H9v-2h6v2Zm-6-2H7V9h2v6Zm8 0h-2V9h2v6ZM5 13H2v-2h3v2Zm17 0h-3v-2h3v2Zm-7-4H9V7h6v2ZM7 7H5V5h2v2Zm12 0h-2V5h2v2Zm-6-2h-2V2h2v3Z\"/>",
"pet": "<path fill=\"currentColor\" d=\"M10 2h4v4h-4zM7 7h10v2H7zm2 2h2v7H9zm4 0h2v7h-2zm-4 7h2v6H9zm4 0h2v6h-2zm-2-2h2v2h-2zM5 5h2v2H5zM3 3h2v2H3zm14 2h2v2h-2zm2-2h2v2h-2z\"/>",
"sparkle": "<path fill=\"currentColor\" d=\"M11 1h2v4h-2zm0 22h2v-4h-2zM9 5h2v4H9zm0 14h2v-4H9zm4-14h2v4h-2zm0 14h2v-4h-2zM5 9h4v2H5zm14 0h-4v2h4zM1 11h4v2H1zm22 0h-4v2h4zM5 13h4v2H5zm14 0h-4v2h4z\"/>",
"bar-down": "<path fill=\"currentColor\" d=\"M4 20h16v2H4zm7-18h2v16h-2zm2 12h2v2h-2zm2-2h2v2h-2zm2-2h2v2h-2zm-8 4h2v2H9zm-2-2h2v2H7zm-2-2h2v2H5z\"/>",
"bar-up": "<path fill=\"currentColor\" d=\"M4 4h16V2H4zm7 18h2V6h-2zm2-12h2V8h-2zm2 2h2v-2h-2zm2 2h2v-2h-2zm-8-4h2V8H9zm-2 2h2v-2H7zm-2 2h2v-2H5z\"/>",
"layout": "<path fill=\"currentColor\" d=\"M20 20H4v-2h4v-8H4v8H2V6h2v2h16V6h2v12h-2v-8H10v8h10v2Zm0-14H4V4h16v2Z\"/>",
"star": "<path fill=\"currentColor\" d=\"M5 20H8V22H3V16H5V20ZM21 22H16V20H19V16H21V22ZM10 20H8V18H10V20ZM16 20H14V18H16V20ZM14 18H10V16H14V18ZM7 16H5V13H7V16ZM19 16H17V13H19V16ZM5 13H3V11H5V13ZM21 13H19V11H21V13ZM9 9H3V11H1V7H9V9ZM23 11H21V9H15V7H23V11ZM11 7H9V3H11V7ZM15 7H13V3H15V7ZM13 3H11V1H13V3Z\"/>",
  "folder": "<path fill=\"currentColor\" d=\"M4 4h6v2H4zm0 14h16v2H4zM20 8h2v10h-2zM2 6h2v12H2zm8 0h10v2H10z\"/>",
  "more": "<path fill=\"currentColor\" d=\"M3 9h2v2H3zm8 0h2v2h-2zm8 0h2v2h-2zM1 11h2v2H1zm8 0h2v2H9zm8 0h2v2h-2zM3 13h2v2H3zm8 0h2v2h-2zm8 0h2v2h-2zM5 11h2v2H5zm8 0h2v2h-2zm8 0h2v2h-2z\"/>",
  "users": "<path fill=\"currentColor\" d=\"M5 2h6v2H5zm10 0h4v2h-4zM5 10h6v2H5zm10 0h4v2h-4zm4-6h2v6h-2zm-8 0h2v6h-2zM3 4h2v6H3zM0 18h2v4H0zm14 0h2v4h-2zm8 0h2v4h-2zM4 14h8v2H4zm12 0h4v2h-4zM2 16h2v2H2zm10 0h2v2h-2zm8 0h2v2h-2z\"/>",
  "sidebarRight": "<path fill=\"currentColor\" fill-rule=\"evenodd\" d=\"M2 4h20v16H2zM4 6v12h10V6zM16 6v12h4V6zM17 8h2v2h-2zM17 12h2v2h-2z\"/>",
  "sidebarLeft": "<path fill=\"currentColor\" fill-rule=\"evenodd\" d=\"M2 4h20v16H2zM4 6v12h4V6zM10 6v12h10V6zM5 8h2v2H5zM5 12h2v2H5z\"/>",
  "search": "<path fill=\"currentColor\" d=\"M22 22h-2v-2h2v2Zm-2-2h-2v-2h2v2Zm-6-2H6v-2h8v2Zm4 0h-2v-2h2v2ZM6 16H4v-2h2v2Zm10 0h-2v-2h2v2ZM4 14H2V6h2v8Zm14 0h-2V6h2v8ZM6 6H4V4h2v2Zm10 0h-2V4h2v2Zm-2-2H6V2h8v2Z\"/>",
  "plusBox": "<path fill=\"currentColor\" d=\"M4 2h16v2H4zm0 18h16v2H4zM2 4h2v16H2zm18 0h2v16h-2zM7 11h10v2H7z\"/><path fill=\"currentColor\" d=\"M11 17V7h2v10z\"/>",
  "shield": "<path fill=\"currentColor\" d=\"M4 2h16v2H4zM2 4h2v10H2zm18 0h2v10h-2zM4 14h2v2H4zm2 2h2v2H6zm4 4h4v2h-4zm10-6h-2v2h2zm-2 2h-2v2h2zm-2 2h-2v2h2zm-6 0H8v2h2z\"/>",
  "send": "<path fill=\"currentColor\" d=\"M4 19h4v2H2v-8h2v6Zm8 0H8v-2h4v2Zm4-2h-4v-2h4v2Zm4-2h-4v-2h4v2Zm-10-2H4v-2h6v2Zm12 0h-2v-2h2v2ZM8 5H4v6H2V3h6v2Zm12 6h-4V9h4v2Zm-4-2h-4V7h4v2Zm-4-2H8V5h4v2Z\"/>",
  "chart": "<path fill=\"currentColor\" d=\"M4 20h18v2H4zM2 2h2v18H2zm16 11v3h-2v-3zM8 13v3H6v-3zm8-2v2H8v-2zm0 5v2H8v-2zm4-12v3h-2V4zM8 4v3H6V4zm10-2v2H8V2zm0 5v2H8V7z\"/>",
  "robot": "<path fill=\"currentColor\" d=\"M4 6h16v2H4zm0 14h16v2H4zM2 8h2v12H2zm18 0h2v12h-2z\"/><path fill=\"currentColor\" d=\"M11 4h2v4h-2zm-3 6h2v2H8zm6 0h2v2h-2zm-1-8h4v2h-4zM0 12h2v2H0zm22 0h2v2h-2zM7 14h10v2H7zm2 2h6v2H9z\"/>",
  "home": "<path fill=\"currentColor\" d=\"M4 20h16v2H4zm16-10h2v10h-2zM2 10h2v10H2zm2-2h2v2H4zm2-2h2v2H6zm2-2h2v2H8zm2-2h4v2h-4zm4 2h2v2h-2zm2 2h2v2h-2zm2 2h2v2h-2zM8 14h2v6H8zm2-2h4v2h-4zm4 2h2v6h-2z\"/>",
  "book": "<path fill=\"currentColor\" d=\"M2 3h9v2H2zM0 19h11v2H0zM13 3h9v2h-9zm0 16h11v2H13zM11 5h2v18h-2zM0 5h2v14H0zm22 0h2v14h-2zm-7 2h5v2h-5zm0 4h5v2h-5zm0 4h2v2h-2z\"/>",
  "notes": "<path fill=\"currentColor\" d=\"M6 8h2v12H6zM2 4h2v12H2zm18 4h2v8h-2zM8 6h12v2H8zM4 2h12v2H4zm14 14h2v2h-2zm-2 2h2v2h-2zm-8 2h8v2H8zm6-6h6v2h-6z\"/><path fill=\"currentColor\" d=\"M14 14h2v6h-2zm2-10h2v2h-2zM4 16h2v2H4z\"/>",
  "check": "<path fill=\"currentColor\" d=\"M10 18H8v-2h2v2Zm-2-2H6v-2h2v2Zm4-2v2h-2v-2h2Zm-6 0H4v-2h2v2Zm8 0h-2v-2h2v2Zm2-2h-2v-2h2v2Zm2-2h-2V8h2v2Zm2-2h-2V6h2v2Z\"/>",
  "clock": "<path fill=\"currentColor\" d=\"M6 2h12v2H6zM2 6h2v12H2zm18 0h2v12h-2zm-2-2h2v2h-2zM4 4h2v2H4zm2 18h12v-2H6zm12-2h2v-2h-2zM4 20h2v-2H4zm7-14h2v7h-2zm2 7h2v2h-2zm2 2h2v2h-2z\"/>",
  "user": "<path fill=\"currentColor\" d=\"M9 2h6v2H9zm0 8h6v2H9zm6-6h2v6h-2zM7 4h2v6H7zM4 18h2v4H4zm14 0h2v4h-2zM8 14h8v2H8zm-2 2h2v2H6zm10 0h2v2h-2z\"/>",
  "list": "<path fill=\"currentColor\" d=\"M4 2h16v2H4zm2 5h2v2H6zm4 0h8v2h-8zm-4 4h2v2H6zm4 0h8v2h-8zm-4 4h2v2H6zm4 0h8v2h-8zm-6 5h16v2H4zM2 4h2v16H2zm18 0h2v16h-2z\"/>",
  "cog": "<path fill=\"currentColor\" d=\"M4 20h3v-2h4v4h2v-4h4v2h-2v4H9v-4H7v2H2v-5h2v3Zm18 2h-5v-2h3v-3h2v5ZM6 11H2v2h4v4H4v-2H0V9h4V7h2v4Zm14-2h4v6h-4v2h-2v-4h4v-2h-4V7h2v2Zm-6 7h-4v-2h4v2Zm-4-2H8v-4h2v4Zm6 0h-2v-4h2v4Zm-2-4h-4V8h4v2ZM7 4H4v3H2V2h5v2Zm8 0h2V2h5v5h-2V4h-3v2h-4V2h-2v4H7V4h2V0h6v4Z\"/>",
  "cloud": "<path fill=\"currentColor\" d=\"M14 22H4v-2h10v2ZM4 20H2v-4h2v4Zm12 0h-2v-4h2v4Zm-6-2H8v-2h2v2Zm-2-2H4v-2h4v2Zm6 0h-2v-2h2v2Zm6 0h-2v-2h2v2Zm-8-2H8v-2h4v2Zm10 0h-2v-4h-2V8h2V6h2v8Zm-4-2h-4v-2h4v2ZM8 10H6V6h2v4Zm6 0h-2V6h2v4Zm-4-4H8V4h2v2Zm8-2h-2v2h-2V4h-4V2h8v2Z\"/>",
  "androids": "<path fill=\"currentColor\" d=\"M2 12h2v6H2zm18 0h2v6h-2zM4 10h2v2H4zm4 2h2v4H8zm6 0h2v4h-2zm6-2h-2v2h2zM6 8h2v2H6zM4 6h2v2H4zM2 4h2v2H2zm16 4h-2v2h2zm2-2h-2v2h2zm2-2h-2v2h2zM8 6h8v2H8zM2 18h20v2H2z\"/>",
  "edit": "<path fill=\"currentColor\" d=\"M2 4h2v16H2zm18 0h2v12h-2zM4 2h16v2H4zm14 14h2v2h-2zm-2 2h2v2h-2zM4 20h12v2H4zm10-8h6v2h-6zm-2 2h2v6h-2z\"/>",
  "wave": "<path fill=\"currentColor\" d=\"M3 7h2v5H3zm4 0h2v13H7zm4-3h2v16h-2zm4 0h2v13h-2zM5 5h2v2H5zm4 15h2v2H9zm4-18h2v2h-2zm4 15h2v2h-2zm2-5h2v5h-2zm2-2h2v2h-2zM1 12h2v2H1z\"/>",
  "echo": "<path fill=\"currentColor\" d=\"M14 22H10V20H14V22ZM10 20H8V18H10V20ZM16 20H14V18H16V20ZM8 18H6V16H8V18ZM18 18H16V16H18V18ZM13 17H11V15H13V17ZM6 16H4V14H6V16ZM20 16H18V14H20V16ZM4 14H2V6H4V14ZM22 14H20V6H22V14ZM10 10H11V13H8V12H6V8H10V10ZM18 12H16V13H13V10H14V8H18V12ZM6 6H4V4H6V6ZM20 6H18V4H20V6ZM18 4H6V2H18V4Z\"/>",
};

};
modules["index.js"] = function(require, module, exports) {
"use strict";
// dsh-aemeath-theme, browser half.
//  - skin: Aemeath token layer + background + pixel buttons + capsule skin
//  - pet: draggable pixel Aemeath that follows the agent
//  - dock: movable quick-action bar
//  - panel: Settings → 爱弥斯主题 section + floating sheet
//  - bundled layout: dsh-mobile-nav (MIT) + header/touch/wallpaper-layout
//    fixes, each mounted as its own sub-fiber so they can be switched off.
const store = require('./store.js');
const skin = require('./skin.js');
const pet = require('./pet.js');
const dock = require('./dock.js');
const panel = require('./panel.js');
const lingo = require('./lingo.js');
const brand = require('./brand.js');
const keyboard = require('./keyboard.js');
const settingsSkin = require('./settings-skin.js');
const settingsSplit = require('./settings-split.js');
const settingsDeck = require('./settings-deck.js');
const polestar = require('./polestar.js');
const chrome = require('./chrome.js');
const ICONS = require('./icons.js');

const NAME = 'dsh-aemeath-theme';

exports.inject = ['slots', 'layout', 'locale', 'theme', 'sessions'];

/** Instantiate a vendored `__ModuleLoader__.load({id, factory})` bundle. */
function vendorPlugin(spec, require_) {
  const mod = spec.factory(require_);
  return { id: spec.id, inject: mod.inject || [], apply: mod.apply };
}

function standaloneActive(pkg) {
  return !!document.querySelector(`style[data-plugin="${pkg}"]`);
}

/** Mount `plugin` as a child fiber; returns a disposer. */
function subFiber(ctx, plugin, label) {
  if (typeof plugin.apply !== 'function') return () => {};
  let fiber = null;
  try {
    fiber = ctx.plugin({ name: `${NAME}:${label}`, inject: plugin.inject, apply: plugin.apply });
  } catch (e) {
    console.warn(`[${NAME}] sub-plugin ${label} failed`, e);
    return () => {};
  }
  return () => { try { fiber?.dispose?.(); } catch (e) { console.warn(e); } };
}

function apply(ctx) {
  const req = apply.require;

  // ---------- bundled layout plugins ----------
  const layoutSpecs = {
    mobileNav: [['mobile-nav', require('./vendor/mobile-nav.js'), '@dsh-external/dsh-mobile-nav']],
    mobileFixes: [
      ['header-fix', require('./vendor/header-fix.js'), 'dsh-mobile-header-fix'],
      ['touch-fix', require('./vendor/touch-fix.js'), 'dsh-mobile-touch-fix'],
      ['wallpaper-layout', require('./vendor/wallpaper-layout.js'), 'dsh-wallpaper-engine-mobile-layout'],
    ],
  };
  // label -> disposer of the bundled copy we mounted. Whether a standalone
  // copy is installed is decided ONCE at boot (before we mount anything, so
  // every matching style tag belongs to the standalone copy). Re-checking at
  // runtime used to flap: our own copy's late style tags looked "standalone",
  // the bundled pager got torn down and the chat column collapsed.
  const mounted = {};
  let standaloneAtBoot = null;
  const syncLayout = () => {
    const p = store.get();
    if (standaloneAtBoot === null) {
      standaloneAtBoot = {};
      for (const list of Object.values(layoutSpecs)) for (const [, , pkg] of list) standaloneAtBoot[pkg] = standaloneActive(pkg);
    }
    for (const [key, list] of Object.entries(layoutSpecs)) {
      for (const [label, spec, pkg] of list) {
        const want = !!p[key] && !standaloneAtBoot[pkg];
        if (want && !mounted[label]) mounted[label] = subFiber(ctx, vendorPlugin(spec, req), label);
        else if (!want && mounted[label]) { mounted[label](); delete mounted[label]; }
      }
    }
  };
  ctx.effect(() => {
    syncLayout();
    const off = store.subscribe(syncLayout);
    return () => { off(); for (const k of Object.keys(mounted)) { mounted[k](); delete mounted[k]; } };
  }, `${NAME}: bundled layout`);

  // Boot splash hand-off (the host injects the splash into index.html): reveal
  // the app once the layout has had two frames to settle.
  ctx.effect(() => {
    let id = requestAnimationFrame(() => { id = requestAnimationFrame(() => document.documentElement.setAttribute('data-aemeath-ready', '')); });
    return () => cancelAnimationFrame(id);
  }, `${NAME}: boot reveal`);

  // ---------- skin / pet / dock ----------
  const openPanel = () => panel.openSheet(ctx);
  ctx.effect(() => skin.install(ctx), `${NAME}: skin`);
  ctx.effect(() => lingo.install(ctx), `${NAME}: wuthering lingo`);
  ctx.effect(() => brand.install(ctx), `${NAME}: brand`);
  ctx.effect(() => keyboard.install(ctx), `${NAME}: keyboard guard`);
  ctx.effect(() => polestar.install(), `${NAME}: polestar slider`);
  ctx.effect(() => chrome.install(), `${NAME}: chat chrome`);
  // The quick menu opens only from a tap on the pixel Aemeath.
  let menu = null;
  ctx.effect(() => {
    menu = dock.install(ctx, { openPanel, pager: pagerApi(), petRect: () => pet.install.pet?.rect() });
    return () => { menu.dispose(); menu = null; };
  }, `${NAME}: quick menu`);
  ctx.effect(() => pet.install(ctx, {
    onLongPress: () => { menu?.close(); openPanel(); },
    onTap: (single) => (single ? !!menu?.toggle() : (menu?.close(), false)),
    onDragStart: () => menu?.close(),
  }), `${NAME}: pet`);

  // ---------- settings section ----------
  const React = req('react');
  function AemeathSection() {
    const ref = React.useRef(null);
    React.useEffect(() => (ref.current ? panel.mountPanel(ref.current, ctx) : undefined), []);
    return React.createElement('div', { ref, style: { padding: '4px 0 24px' } });
  }
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section', id: 'aemeath-theme', order: 5, label: '爱弥斯主题',
  }, AemeathSection));

  // ---------- settings dialog: new skin + two entrances ----------
  ctx.effect(() => settingsSkin.install(ctx, store), `${NAME}: settings skin`);
  ctx.effect(() => settingsSplit.install(ctx, settingsDeck.create(settingsSplit.openSettings)), `${NAME}: settings navigation`);
  settingsSplit.registerEntrances(ctx, React, ICONS);

  // debug hook for verification from devtools
  ctx.effect(() => {
    window.__aemeathTheme = { store, openPanel, pet: () => pet.install.pet, openSettings: settingsSplit.openSettings };
    return () => { delete window.__aemeathTheme; };
  }, `${NAME}: debug hook`);
}

/** Pager helpers from the bundled mobile-nav (horizontal pager on phones). */
function pagerApi() {
  const frame = () => document.querySelector('[data-mobile-nav="frame"]');
  const left = (f) => { const s = f.firstElementChild; return s && s.offsetWidth > 0 ? s.offsetWidth : f.clientWidth; };
  const navigatePager = (page, fallback) => {
    const f = frame();
    if (!f || f.scrollWidth <= f.clientWidth + 4) { fallback(); return; }
    f.scrollTo({ left: page === 'chat' ? left(f) : 0, behavior: 'smooth' });
  };
  const togglePager = (fallback) => {
    const f = frame();
    if (!f || f.scrollWidth <= f.clientWidth + 4) { fallback(); return; }
    const t = f.getAttribute('data-dshm-target');
    const onChat = t !== null ? t === 'chat' : f.scrollLeft >= left(f) / 2;
    navigatePager(onChat ? 'sidebar' : 'chat', fallback);
  };
  return { navigatePager, togglePager };
}

exports.apply = apply;

};
modules["keyboard.js"] = function(require, module, exports) {
"use strict";
// Keyboard guard (touch devices only).
// The stock composer hands focus back to its editor whenever a toolbar button
// is pressed ("+" command menu, send / stop) and whenever a session opens.
// On a phone every such programmatic focus pops the on-screen keyboard.
// We keep the editor focusable but mark it inputmode="none" by default, and
// flip it to a real text input only when the user actually taps the text
// area. Focus, caret and the "/" command menu keep working; just the keyboard
// stays down until you tap where you type.
const store = require('./store.js');

const EDITABLE = '[data-composer-card] [contenteditable="true"]';
// Taps on these never mean "I want to type".
const NOT_TEXT = 'button,[role="button"],a,label,select,summary,[aria-haspopup],[role="menuitem"],[role="option"],[class*="_tools"],[class*="_trailing"]';

function isTouch() {
  try { return window.matchMedia('(pointer: coarse)').matches; } catch { return false; }
}

function install() {
  let armedUntil = 0; // a real tap on the text area allows the keyboard until then
  const editors = () => document.querySelectorAll(EDITABLE);
  const enabled = () => store.get().keyboardGuard !== false && isTouch();

  const lock = (el) => { if (el.getAttribute('inputmode') !== 'none') el.setAttribute('inputmode', 'none'); };
  const unlock = (el) => { if (el.getAttribute('inputmode') === 'none') el.removeAttribute('inputmode'); };

  const sync = () => {
    const on = enabled();
    for (const el of editors()) {
      if (!on) { if (el.dataset.aeKb) { unlock(el); delete el.dataset.aeKb; } continue; }
      el.dataset.aeKb = '1';
      if (document.activeElement === el && Date.now() < armedUntil) unlock(el); else if (document.activeElement !== el) lock(el);
    }
  };

  const onDown = (e) => {
    if (!enabled()) return;
    const t = e.target;
    if (!(t instanceof Element)) return;
    const card = t.closest('[data-composer-card]');
    if (!card) return;
    const textTap = !!t.closest('[contenteditable="true"]') || !t.closest(NOT_TEXT);
    if (!textTap) return;
    armedUntil = Date.now() + 1500;
    for (const el of card.querySelectorAll('[contenteditable="true"]')) {
      const wasLocked = el.getAttribute('inputmode') === 'none';
      unlock(el);
      // Already focused with the keyboard down: inputmode changes do not
      // always raise it, so re-focus once if the viewport did not shrink.
      if (wasLocked && document.activeElement === el && window.visualViewport) {
        const h0 = window.visualViewport.height;
        setTimeout(() => {
          if (document.activeElement === el && window.visualViewport.height >= h0 - 40) { el.blur(); el.focus({ preventScroll: true }); }
        }, 380);
      }
    }
  };

  const onFocusIn = (e) => {
    if (!enabled()) return;
    const el = e.target;
    if (!(el instanceof Element) || !el.matches(EDITABLE)) return;
    el.dataset.aeKb = '1';
    if (Date.now() < armedUntil) unlock(el); else lock(el);
  };
  const onFocusOut = (e) => {
    if (!enabled()) return;
    const el = e.target;
    if (el instanceof Element && el.matches(EDITABLE)) { lock(el); armedUntil = 0; }
  };

  document.addEventListener('pointerdown', onDown, true);
  document.addEventListener('focusin', onFocusIn, true);
  document.addEventListener('focusout', onFocusOut, true);
  // New editors appear when a session opens; mark them before they get focus.
  const mo = new MutationObserver(() => { if (enabled()) for (const el of editors()) if (!el.dataset.aeKb && document.activeElement !== el) { el.dataset.aeKb = '1'; lock(el); } });
  mo.observe(document.body, { childList: true, subtree: true });
  sync();
  const off = store.subscribe(sync);
  return () => {
    off(); mo.disconnect();
    document.removeEventListener('pointerdown', onDown, true);
    document.removeEventListener('focusin', onFocusIn, true);
    document.removeEventListener('focusout', onFocusOut, true);
    for (const el of editors()) if (el.dataset.aeKb) { unlock(el); delete el.dataset.aeKb; }
  };
}

module.exports = { install };

};
modules["lingo.js"] = function(require, module, exports) {
"use strict";
// 鸣潮 / 爱弥斯 flavoured display names for the chat's process rows and tool
// rows (Chinese UI only). Only the shown text changes: tool names, events and
// behaviour stay untouched. Implemented as an in-place overlay on the shipped
// `conversation` / `chat` zh dictionaries; every replaced value is restored
// when the option is turned off or the plugin unloads.
const store = require('./store.js');

// Done-state labels keep the "已" prefix so the shipped "A并B" joiner still
// drops the repeated prefix ("已解读声痕并唤醒声骸").
const CHAT = {
  'message.stepProcess.thinking': '正在调谐频率',
  'message.stepProcess.read': '正在解读声痕',
  'message.stepProcess.readImage': '正在凝视残像',
  'message.stepProcess.write': '正在谱写乐章',
  'message.stepProcess.search': '正在追踪频率',
  'message.stepProcess.edit': '正在变奏修订',
  'message.stepProcess.commands': '正在释放共鸣技能',
  'message.stepProcess.code': '正在运转终端',
  'message.stepProcess.webSearch': '正在扫描索拉里斯',
  'message.stepProcess.webFetch': '正在接收远方回响',
  'message.stepProcess.subagents': '正在召集共鸣者',
  'message.stepProcess.plan': '正在规划航线',
  'message.stepProcess.questions': '等待漂泊者回应',
  'message.stepProcess.tools': '正在唤醒声骸',
  'message.stepProcess.prepare.read': '准备解读声痕',
  'message.stepProcess.prepare.readImage': '准备凝视残像',
  'message.stepProcess.prepare.write': '准备谱写乐章',
  'message.stepProcess.prepare.search': '准备追踪频率',
  'message.stepProcess.prepare.edit': '准备变奏修订',
  'message.stepProcess.prepare.commands': '准备释放共鸣技能',
  'message.stepProcess.prepare.code': '准备运转终端',
  'message.stepProcess.prepare.webSearch': '准备扫描索拉里斯',
  'message.stepProcess.prepare.webFetch': '准备接收远方回响',
  'message.stepProcess.prepare.subagents': '准备召集共鸣者',
  'message.stepProcess.prepare.plan': '准备规划航线',
  'message.stepProcess.prepare.questions': '准备向漂泊者发问',
  'message.stepProcess.prepare.tools': '准备唤醒声骸',
  'message.stepProcess.done.thinking': '已完成调谐',
  'message.stepProcess.done.read': '已解读声痕',
  'message.stepProcess.done.readImage': '已凝视残像',
  'message.stepProcess.done.write': '已谱写乐章',
  'message.stepProcess.done.search': '已追踪频率',
  'message.stepProcess.done.edit': '已完成变奏',
  'message.stepProcess.done.commands': '已释放共鸣技能',
  'message.stepProcess.done.code': '已运转终端',
  'message.stepProcess.done.webSearch': '已扫描索拉里斯',
  'message.stepProcess.done.webFetch': '已接收远方回响',
  'message.stepProcess.done.subagents': '已召集共鸣者',
  'message.stepProcess.done.plan': '已规划航线',
  'message.stepProcess.done.questions': '已向漂泊者发问',
  'message.stepProcess.done.tools': '已唤醒声骸',
};

const CONVERSATION = {
  'tool.title.bash': '共鸣技能',
  'tool.title.pwsh': '共鸣技能',
  'tool.title.generic': '声骸技能',
  'tool.title.search': '频率追踪',
  'tool.title.read': '声痕解读',
  'tool.title.write': '谱写乐章',
  'tool.title.edit': '变奏修订',
  'tool.title.code': '终端运算',
  'tool.title.readImage': '残像凝视',
  'tool.title.grep': '声纹检索',
  'tool.title.glob': '坐标搜寻',
  'tool.title.webSearch': '索拉里斯搜寻',
  'tool.title.webFetch': '远方回响',
  'tool.title.subagent': '召唤共鸣者',
  'tool.title.waitAgent': '等待共鸣者',
  'tool.title.workflow': '协奏编排',
  'tool.title.listJobs': '查看后台声骸',
  'tool.title.readJob': '读取声骸回响',
  'tool.title.killJob': '收回声骸',
};

// Mode (agent preset) names — descriptions stay stock on purpose.
const PRESETS = {
  presetStandardName: '共鸣模式',
  presetPtcName: '协奏模式',
  presetMinimalName: '独奏模式',
  presetCordisName: '幽灵工坊',
};
// Background-job chip in the session header.
const JOBS = {
  'count.live.one': '{count} 声骸巡航',
  'count.live.other': '{count} 声骸巡航',
  'count.idle.one': '{count} 声骸待命',
  'count.idle.other': '{count} 声骸待命',
};
// Subagent-count chip in the session header (dsh-client-ui-subagent).
const SUBAGENTS = {
  'count.total.one': '{count} 个声骸',
  'count.total.other': '{count} 个声骸',
  'count.running.one': '{count} 个声骸，正在共鸣',
  'count.running.other': '{count} 个声骸，正在共鸣',
};
// "深度求索中，用时 N 秒" row above the composer.
Object.assign(CHAT, {
  'message.think': '救世中',
  'chat.deepDiving': '爱弥斯调谐中',
  // 0.2.x: "chat.deepDivingFor" carries {duration}; "turnProcess.took" is a
  // bare prefix the duration is appended to (no placeholder), so keep ours a
  // prefix too or "{duration}" leaks into the row.
  'chat.deepDivingFor': '爱弥斯调谐中 · {duration} ···',
  'message.turnProcess.deepDivingFor': '爱弥斯调谐中 · {duration}',
  'message.turnProcess.took': '乐章完成 · 用时 ',
  'message.turnProcess.worked': '乐章已完成',
  'message.turnProcess.failed': '共鸣中断',
  'message.turnProcess.thoughtForAWhile': '已调谐频率',
  'message.turnProcess.toolCalls.one': '{count} 次共鸣技能',
  'message.turnProcess.toolCalls.other': '{count} 次共鸣技能',
  'message.turnProcess.subagents.one': '{count} 个声骸',
  'message.turnProcess.subagents.other': '{count} 个声骸',
});

/** Tables to overlay for the current prefs: ns -> {key: value}. */
function tables(p) {
  const t = {};
  const add = (ns, obj) => { t[ns] = Object.assign(t[ns] || {}, obj); };
  if (p.wwLingo) { add('chat', CHAT); add('conversation', CONVERSATION); add('settings.agentPreset', PRESETS); add('job', JOBS); add('subagent', SUBAGENTS); }
  if (p.brand) {
    const { NAMES } = require('./brand.js');
    add('conversation', { 'hero.headline': (NAMES[p.brandName] || NAMES.spacetrek).title });
  }
  return t;
}

function install(ctx) {
  let locale;
  try { locale = ctx.get('locale'); } catch { locale = null; }
  if (!locale) return () => {};
  const saved = []; // [dict, key, original]

  const bump = () => {
    try { locale.publish(locale.getLocale().active, false); } catch { /* revision bump is best effort */ }
  };
  const restore = () => {
    for (const [dict, key, orig] of saved.splice(0).reverse()) if (dict[key] !== undefined) dict[key] = orig;
  };
  const applyOverlay = () => {
    restore();
    const dicts = locale.dicts;
    if (!(dicts instanceof Map)) { bump(); return; }
    for (const [ns, table] of Object.entries(tables(store.get()))) {
      const perLocale = dicts.get(ns);
      if (!(perLocale instanceof Map)) continue;
      for (const [loc, dict] of perLocale) {
        if (!/^zh/.test(loc) || !dict) continue;
        for (const [key, value] of Object.entries(table)) {
          if (typeof dict[key] !== 'string') continue;
          saved.push([dict, key, dict[key]]);
          dict[key] = value;
        }
      }
    }
    bump();
  };

  // Dictionaries register lazily (job / agent-preset come late); re-apply
  // whenever a namespace we care about shows up, for the first 30 s.
  const WANT = ['chat', 'conversation', 'settings.agentPreset', 'job', 'subagent'];
  let seen = '';
  let tries = 0;
  const timer = setInterval(() => {
    const d = locale.dicts;
    const now = d instanceof Map ? WANT.filter((n) => d.has(n)).join(',') : '';
    if (now !== seen) { seen = now; applyOverlay(); }
    if (++tries > 60) clearInterval(timer);
  }, 500);
  const sig = (p) => `${p.wwLingo}|${p.brand}|${p.brandName}`;
  let last = sig(store.get());
  const off = store.subscribe((p) => { const k = sig(p); if (k !== last) { last = k; applyOverlay(); } });
  return () => { clearInterval(timer); off(); restore(); bump(); };
}

module.exports = { install, CHAT, CONVERSATION, PRESETS, JOBS, SUBAGENTS };

};
modules["palette.js"] = function(require, module, exports) {
"use strict";
// Colour presets and the token layer handed to theme.overrideTokens.
// Every preset defines the same keys; the skin CSS reads them through
// --ae-* custom properties, so switching preset is a pure variable swap.
const PALETTES = {
  aemeath: {   // 粉紫星夜 — Aemeath's pink hair over a plum night
    label: '爱弥斯·粉紫', pink: '#ff69b7', pink2: '#f24c9e', soft: '#ffb3da', accent: '#77e8ff', violet: '#8e72ff', gold: '#ffd76a',
    plum: '#0d091b', plum2: '#1a1934', plum3: '#28234a', surface: '#111326', ink: '#f7f4ff', muted: '#a8a5bc',
    milk: '#fff7fb', blush: '#ffe8f3', lightInk: '#2b1838', lightMuted: '#6c5577',
  },
  starblue: {  // 星辉蓝 — Spacetrek blue with cyan star glints
    label: '星辉·偏蓝', pink: '#5fb8ff', pink2: '#3d8bff', soft: '#b5dcff', accent: '#ff8fcf', violet: '#7c86ff', gold: '#ffe08a',
    plum: '#070c1d', plum2: '#101a36', plum3: '#1a2a52', surface: '#0c1430', ink: '#eef6ff', muted: '#9fb0cc',
    milk: '#f5f9ff', blush: '#e5f0ff', lightInk: '#14233f', lightMuted: '#4f6585',
  },
  ghost: {     // 电子幽灵 — cyan glitch over deep violet
    label: '电子幽灵·青紫', pink: '#5ff3e6', pink2: '#22d3c5', soft: '#b9fff7', accent: '#ff6fb5', violet: '#a479ff', gold: '#fff38a',
    plum: '#0a0717', plum2: '#17112e', plum3: '#251b47', surface: '#100c24', ink: '#f2fffd', muted: '#a0b7b8',
    milk: '#f3fffd', blush: '#e2fbf8', lightInk: '#123236', lightMuted: '#4b6f72',
  },
  sakura: {    // 樱绯 — warm sakura pink, softer contrast
    label: '樱绯·暖粉', pink: '#ff8fab', pink2: '#ff5d8f', soft: '#ffd1dc', accent: '#ffd76a', violet: '#c78bff', gold: '#ffd76a',
    plum: '#140a12', plum2: '#24131f', plum3: '#3a2033', surface: '#1b0e18', ink: '#fff5f8', muted: '#c2a6b2',
    milk: '#fff8fa', blush: '#ffeaf0', lightInk: '#3a1a28', lightMuted: '#7a5866',
  },
};

const TEXT_COLORS = {
  default: { label: '默认', dark: null, light: null },
  white: { label: '月白', dark: '#ffffff', light: '#1b1424' },
  pink: { label: '樱粉', dark: '#ffd6ea', light: '#7a1e52' },
  cyan: { label: '星青', dark: '#d4f6ff', light: '#0e4a63' },
  lilac: { label: '雾紫', dark: '#e4dcff', light: '#3d2a73' },
};

function pal(id) { return PALETTES[id] || PALETTES.aemeath; }

function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** CSS custom properties for the chosen preset (dark values). */
function cssVars(id) {
  const P = pal(id);
  const v = {
    '--ae-pink': P.pink, '--ae-pink2': P.pink2, '--ae-pink-soft': P.soft, '--ae-cyan': P.accent, '--ae-violet': P.violet, '--ae-gold': P.gold,
    '--ae-plum': P.plum, '--ae-plum2': P.plum2, '--ae-plum3': P.plum3, '--ae-ink': P.ink,
  };
  for (const [k, hex] of [['pink', P.pink], ['cyan', P.accent], ['violet', P.violet], ['plum', P.plum], ['plum2', P.plum2], ['plum3', P.plum3], ['surface', P.surface], ['gold', P.gold]]) {
    const n = parseInt(hex.slice(1), 16);
    v[`--ae-${k}-rgb`] = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }
  return v;
}

/** Token layer; `glass` = surface opacity over the background image. */
function tokens(glass, id, textColor) {
  const P = pal(id);
  const T = TEXT_COLORS[textColor] || TEXT_COLORS.default;
  const g = Math.max(0.3, Math.min(0.97, glass));
  return {
    '--dsw-alias-bg-base': { dark: rgba(P.plum, g * 0.55), light: rgba(P.milk, g * 0.6) },
    '--dsw-alias-bg-layer-1': { dark: rgba(P.surface, Math.min(1, g + 0.12)), light: rgba('#ffffff', Math.min(1, g + 0.18)) },
    '--dsw-alias-bg-layer-2': { dark: rgba(P.plum2, Math.min(1, g + 0.2)), light: rgba(P.blush, Math.min(1, g + 0.22)) },
    '--dsw-alias-bg-overlay': { dark: rgba(P.plum2, 0.97), light: 'rgba(255, 250, 253, 0.98)' },
    '--dsw-alias-border-l1': { dark: rgba(P.pink, 0.16), light: rgba(P.pink2, 0.16) },
    '--dsw-alias-border-l2': { dark: rgba(P.pink, 0.32), light: rgba(P.pink2, 0.32) },
    '--dsw-alias-brand-primary': { dark: P.pink, light: P.pink2 },
    '--dsw-alias-label-primary': { dark: T.dark || P.ink, light: T.light || P.lightInk },
    '--dsw-alias-label-secondary': { dark: T.dark ? rgba(T.dark, 0.86) : '#d6d0ea', light: '#4d3a5c' },
    '--dsw-alias-label-tertiary': { dark: P.muted, light: P.lightMuted },
    '--dsw-alias-label-caption': { dark: rgba(P.muted, 0.85), light: rgba(P.lightMuted, 0.85) },
    '--dsw-alias-state-error-primary': { dark: '#ff5d7a', light: '#e0244f' },
    '--dsw-alias-state-idle-primary': { dark: rgba(P.muted, 0.85), light: '#9a88a4' },
    '--dsw-alias-state-success-primary': { dark: '#6ff0c0', light: '#13a37a' },
    '--dsw-alias-state-warn-primary': { dark: P.gold, light: '#c98a00' },
    '--dsw-specific-sidebar-fill': { dark: rgba(P.plum, Math.min(1, g + 0.18)), light: rgba(P.blush, Math.min(1, g + 0.2)) },
  };
}

const P = PALETTES.aemeath;
module.exports = { P, PALETTES, TEXT_COLORS, pal, rgba, cssVars, tokens };

};
modules["panel.js"] = function(require, module, exports) {
"use strict";
// Theme control panel (vanilla DOM so the same panel mounts in the Settings
// section and in the floating sheet opened from the dock / by long-pressing
// the pet). Every control writes through the store and applies live.
const store = require('./store.js');
const { PALETTES, TEXT_COLORS } = require('./palette.js');
const { NAMES } = require('./brand.js');
const icons = require('./icons.js');
const { asset } = require('./assets.js');

const ACTION_LABELS = {
  newSession: '新会话', sidebar: '会话列表', composer: '收起/展开输入框', scrollBottom: '回到最新',
  scrollTop: '回到顶部', rightbar: '右侧面板', pet: '隐藏爱弥斯', scheme: '深色/浅色', settings: '主题设置',
};
const ACTION_ICONS = {
  newSession: 'plus', sidebar: 'menu', composer: 'message', scrollBottom: 'bar-down', scrollTop: 'bar-up',
  rightbar: 'layout', pet: 'eye-closed', scheme: 'moon', settings: 'sliders',
};
const ico = (n, s = 16) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${icons[n] || ''}</svg>`;

const CSS = `
.ae-panel{--pk:var(--ae-pink,#ff69b7);--cy:var(--ae-cyan,#77e8ff);color:var(--dsw-alias-label-primary,#f7f4ff);font-size:14px;line-height:1.45;display:flex;flex-direction:column;gap:14px}
.ae-panel *{box-sizing:border-box}
.ae-panel .ae-hero{display:flex;align-items:center;gap:12px;padding:10px 12px;border:2px solid var(--pk);background:linear-gradient(135deg,rgba(var(--ae-pink-rgb,255,105,183),.22),rgba(var(--ae-violet-rgb,142,114,255),.14));box-shadow:3px 3px 0 rgba(13,9,27,.8)}
.ae-panel .ae-hero-pet{width:58px;height:63px;flex:none;background-image:url("${asset('pet-half.webp')}");background-size:464px 567px;background-position:0 -63px;image-rendering:auto;animation:ae-hero-wave .9s steps(1) infinite}
@keyframes ae-hero-wave{0%{background-position:0 -189px}25%{background-position:-58px -189px}50%{background-position:-116px -189px}75%{background-position:-174px -189px}}
.ae-panel .ae-hero h3{margin:0;font:20px/1.2 var(--ae-font-px,monospace);color:var(--ae-pink-soft,#ffb3da);letter-spacing:1px}
.ae-panel .ae-hero p{margin:2px 0 0;font-size:12px;color:var(--dsw-alias-label-tertiary,#a8a5bc)}
.ae-panel .ae-sec{border:1px solid rgba(var(--ae-pink-rgb,255,105,183),.32);background:rgba(13,9,27,.28);padding:4px 12px 8px}
html[style*="color-scheme: light"] .ae-panel .ae-sec{background:rgba(255,255,255,.55)}
.ae-panel .ae-sec h4{margin:6px 0 2px;font:20px var(--ae-font-px,monospace);color:var(--pk);display:flex;align-items:center;gap:6px;letter-spacing:.5px}
.ae-panel .ae-row{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px;padding:4px 0;border-top:1px dashed rgba(var(--ae-pink-rgb,255,105,183),.16)}
.ae-panel .ae-sec h4 + .ae-row{border-top:0}
.ae-panel .ae-row > span{min-width:0;flex:1}
.ae-panel .ae-row small{display:block;font-size:11.5px;color:var(--dsw-alias-label-tertiary,#a8a5bc)}
.ae-panel button.ae-sw.ae-sw{position:relative !important;min-width:46px;min-height:24px;border-radius:0 !important;overflow:hidden;width:46px;height:24px;flex:none;border:2px solid var(--pk);background:rgba(13,9,27,.5);cursor:pointer;padding:0;touch-action:manipulation}
.ae-panel button.ae-sw.ae-sw::after{display:block !important;opacity:1 !important;content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;background:#a8a5bc;transform:translate3d(0,0,0);transition:transform .14s steps(3),background-color .14s}
.ae-panel button.ae-sw.ae-sw[aria-checked="true"]{background:rgba(var(--ae-pink-rgb,255,105,183),.35)}
.ae-panel button.ae-sw.ae-sw[aria-checked="true"]::after{transform:translate3d(22px,0,0);background:var(--pk);box-shadow:0 0 6px var(--pk)}
.ae-panel .ae-row:has(.ae-seg){flex-wrap:wrap}
.ae-panel .ae-seg{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;flex:none;max-width:100%;border:2px solid var(--pk);gap:0}
.ae-panel .ae-row:has(.ae-seg > :nth-child(4)) .ae-seg{flex:1 0 100%;grid-auto-flow:row;grid-template-columns:repeat(auto-fit,minmax(64px,1fr))}
.ae-panel .ae-row:has(.ae-seg > :nth-child(4)) .ae-seg button{border-left:0;border-top:0;box-shadow:inset -2px 0 0 var(--pk)}
.ae-panel .ae-swatches{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:2px 0 8px}
.ae-panel .ae-swatch{display:flex;align-items:center;gap:8px;min-height:44px;padding:4px 8px;border:2px solid rgba(255,255,255,.12);background:rgba(13,9,27,.35);color:inherit;font:inherit;font-size:13px;cursor:pointer;text-align:left}
.ae-panel .ae-swatch i{width:26px;height:26px;flex:none;box-shadow:inset 0 0 0 2px rgba(0,0,0,.35)}
.ae-panel .ae-swatch[aria-checked="true"]{border-color:var(--pk);background:rgba(var(--ae-pink-rgb,255,105,183),.18);box-shadow:2px 2px 0 rgba(0,0,0,.4)}
.ae-panel .ae-seg button{min-width:44px;min-height:32px;padding:0 9px;border:0;border-left:2px solid var(--pk);background:transparent;color:inherit;font:inherit;font-size:13px;cursor:pointer}
.ae-panel .ae-seg button:first-child{border-left:0}
.ae-panel .ae-seg button[aria-pressed="true"]{background:var(--pk);color:#2a0b20}
.ae-panel input[type=range]{flex:none;width:min(46%,180px);accent-color:var(--pk);height:28px}
.ae-panel .ae-btn{min-height:36px;padding:0 12px;border-style:solid;border-width:4px;border-color:transparent;border-image:url("${asset('btn-plum.png')}") 4 fill / 8px / 0 stretch;image-rendering:pixelated;background:none;color:#ffd5ea;font:inherit;font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.ae-panel .ae-btn.ae-pink{border-image-source:url("${asset('btn-pink.png')}");color:#3a0f2a}
.ae-panel .ae-btn:active{border-image-source:url("${asset('btn-pink-pressed.png')}");color:#3a0f2a}
.ae-panel .ae-btns{display:flex;flex-wrap:wrap;gap:8px;padding:8px 0 4px}
.ae-panel .ae-list{display:flex;flex-direction:column;gap:4px;padding:6px 0}
.ae-panel .ae-item{display:flex;align-items:center;gap:8px;min-height:44px;padding:2px 6px;border:1px solid rgba(var(--ae-pink-rgb,255,105,183),.25);background:rgba(13,9,27,.25)}
.ae-panel .ae-item[data-off]{opacity:.55}
.ae-panel .ae-item .ae-name{flex:1;display:flex;align-items:center;gap:8px;min-width:0}
.ae-panel .ae-item .ae-mini{width:36px;height:36px;border:2px solid rgba(var(--ae-pink-rgb,255,105,183),.5);background:transparent;color:inherit;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}
.ae-panel .ae-item .ae-mini:disabled{opacity:.3}
.ae-panel .ae-note{font-size:11.5px;color:var(--dsw-alias-label-tertiary,#a8a5bc);margin:4px 0}
.ae-panel .ae-credit{font-size:11px;color:var(--dsw-alias-label-tertiary,#a8a5bc);line-height:1.5}
#aemeath-sheet{position:fixed;inset:0;z-index:2147483100;display:flex;align-items:flex-end;justify-content:center;background:rgba(5,3,12,.55)}
#aemeath-sheet .ae-sheet-card{--ae-x:1;width:min(560px,100vw);max-height:min(86dvh,860px);overflow:auto;overscroll-behavior:contain;padding:12px 14px calc(16px + env(safe-area-inset-bottom));background:rgba(17,19,38,.97);border:2px solid var(--ae-pink,#ff69b7);border-bottom:0;box-shadow:0 -6px 30px rgba(var(--ae-pink-rgb,255,105,183),.25)}
html[style*="color-scheme: light"] #aemeath-sheet .ae-sheet-card{background:rgba(255,248,252,.98)}
#aemeath-sheet .ae-sheet-top{position:sticky;top:-12px;z-index:1;display:flex;justify-content:space-between;align-items:center;margin:-12px -14px 8px;padding:10px 14px;background:inherit;border-bottom:2px dashed rgba(var(--ae-pink-rgb,255,105,183),.4);font:20px var(--ae-font-px,monospace);color:var(--ae-pink-soft,#ffb3da)}
#aemeath-sheet .ae-sheet-top button{width:40px;height:40px;border:2px solid var(--ae-pink,#ff69b7);background:transparent;color:var(--ae-pink-soft,#ffb3da);display:flex;align-items:center;justify-content:center;cursor:pointer}
@media (min-width:760px){#aemeath-sheet{align-items:center}#aemeath-sheet .ae-sheet-card{border-bottom:2px solid #ff69b7}}
`;

function ensureStyle() {
  if (document.querySelector('style[data-plugin-css="dsh-aemeath-theme/panel.css"]')) return () => {};
  const s = document.createElement('style');
  s.dataset.plugin = 'dsh-aemeath-theme';
  s.dataset.pluginCss = 'dsh-aemeath-theme/panel.css';
  s.textContent = CSS;
  document.head.appendChild(s);
  return () => s.remove();
}

function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat()) if (k !== null && k !== undefined && k !== false) e.append(k.nodeType ? k : document.createTextNode(String(k)));
  return e;
}

/** Downscale an image file to a JPEG data URL that fits localStorage. */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 1440;
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      let q = 0.86, out = c.toDataURL('image/jpeg', q);
      while (out.length > 2400000 && q > 0.4) { q -= 0.12; out = c.toDataURL('image/jpeg', q); }
      resolve(out);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片读取失败')); };
    img.src = url;
  });
}

/**
 * Mount the panel into `host`.
 * @param host - container element.
 * @param ctx - client context (theme service for scheme / font size).
 */
const settingsSplit = () => require('./settings-split.js');

function mountPanel(host, ctx) {
  const offStyle = ensureStyle();
  let theme = null;
  try { theme = ctx.get('theme'); } catch { theme = null; }
  const root = h('div', { class: 'ae-panel' });
  host.appendChild(root);

  const switches = new Map();
  const sw = (key, label, note) => {
    const b = h('button', { type: 'button', class: 'ae-sw', role: 'switch', 'aria-checked': String(!!store.get()[key]), 'aria-label': label, onclick: () => store.set({ [key]: !store.get()[key] }) });
    switches.set(key, b);
    return h('div', { class: 'ae-row' }, h('span', null, label, note ? h('small', null, note) : null), b);
  };
  const seg = (label, opts, cur, onPick, note) => h('div', { class: 'ae-row' },
    h('span', null, label, note ? h('small', null, note) : null),
    h('div', { class: 'ae-seg', role: 'group', 'aria-label': label },
      opts.map(([v, t]) => h('button', { type: 'button', 'aria-pressed': String(cur === v), onclick: () => onPick(v) }, t))));
  const range = (key, label, min, max, step, fmt) => {
    const out = h('small', null, fmt(store.get()[key]));
    const inp = h('input', { type: 'range', min, max, step, value: store.get()[key], 'aria-label': label });
    inp.addEventListener('input', () => { out.textContent = fmt(Number(inp.value)); });
    inp.addEventListener('change', () => store.set({ [key]: Number(inp.value) }));
    return h('div', { class: 'ae-row' }, h('span', null, label, out), inp);
  };
  const sec = (icon, title, ...rows) => h('section', { class: 'ae-sec' }, h('h4', { html: `${ico(icon, 16)}<span>${title}</span>` }), ...rows);

  function render() {
    const p = store.get();
    const snap = theme?.getTheme?.();
    const pref = snap?.preference || 'dark';
    const fs = snap?.fontSize || 15;
    root.innerHTML = '';

    root.append(h('div', { class: 'ae-hero' },
      h('div', { class: 'ae-hero-pet', 'aria-hidden': 'true' }),
      h('div', null, h('h3', null, '爱弥斯 · 星夜主题'), h('p', null, '像素小爱弥斯、星空背景、像素按键与可移动快捷键。所有改动即时生效。'))));

    root.append(sec('sparkle', '外观',
      sw('skin', '爱弥斯配色', '粉紫夜色 + 青色星芒，覆盖全局配色'),
      sw('pixelCorners', '像素按键', '发送 / 新会话 / 添加 等改成像素九宫格按键'),
      seg('明暗', [['dark', '深色'], ['light', '浅色'], ['system', '跟随']], pref, (v) => { try { theme?.setTheme(v); } catch (e) { console.warn(e); } render(); }),
      seg('字号', [[14, '小'], [15, '中'], [16, '大'], [17, '特大']], fs, (v) => { try { theme?.setFontSize(v); } catch (e) { console.warn(e); } render(); }),
      range('glass', '面板不透明度', 0.3, 0.95, 0.05, (v) => `${Math.round(v * 100)}%`)));

    // colour presets as swatches
    const sw4 = h('div', { class: 'ae-swatches', role: 'radiogroup', 'aria-label': '配色方案' },
      Object.entries(PALETTES).map(([id, P]) => h('button', {
        type: 'button', role: 'radio', 'aria-checked': String(p.palette === id), class: 'ae-swatch', onclick: () => store.set({ palette: id }),
        html: `<i style="background:linear-gradient(135deg,${P.pink},${P.violet} 60%,${P.accent})"></i><span>${P.label}</span>`,
      })));
    root.append(sec('heart', '配色与字体',
      h('p', { class: 'ae-note' }, '配色方案（整套强调色 / 背景色同步切换）：'), sw4,
      seg('文字颜色', Object.entries(TEXT_COLORS).map(([k, v]) => [k, v.label]), p.textColor, (v) => store.set({ textColor: v }), '正文与标题的主色'),
      seg('字体样式', [['pixel-title', '像素标题'], ['system', '系统字体'], ['mono', '等宽']], p.uiFont, (v) => store.set({ uiFont: v }), '像素标题 = 标题/标签用像素字，正文保持清晰'),
      sw('pixelIcons', '像素图标', '顶部按钮、侧栏按钮换成像素图标')));

    root.append(sec('star', '品牌与标识',
      sw('brand', '深空联合标识', '左上角虎鲸 → 深空联合徽记，名称、浏览器标签页标题与图标同步'),
      seg('显示名称', Object.entries(NAMES).map(([k, v]) => [k, v.title]), p.brandName, (v) => store.set({ brandName: v }))));

    const bgFile = h('input', { type: 'file', accept: 'image/*', hidden: true });
    bgFile.addEventListener('change', async () => {
      const f = bgFile.files && bgFile.files[0];
      if (!f) return;
      try { store.setCustomBg(await fileToDataUrl(f)); store.set({ background: 'custom' }); }
      catch (e) { alert(e.message || String(e)); }
    });
    root.append(sec('image', '背景',
      seg('背景图', [['night', '星夜'], ['night-dim', '暗夜'], ['custom', '自定义'], ['none', '无']], p.background, (v) => {
        if (v === 'custom' && !store.getCustomBg()) { bgFile.click(); return; }
        store.set({ background: v });
      }),
      range('bgDim', '背景暗化', 0, 0.85, 0.05, (v) => `${Math.round(v * 100)}%`),
      range('bgBlur', '背景模糊', 0, 16, 1, (v) => `${v}px`),
      sw('stars', '闪烁星星'),
      sw('scanlines', '扫描线', 'CRT 复古扫描线'),
      h('div', { class: 'ae-btns' },
        h('button', { type: 'button', class: 'ae-btn', onclick: () => bgFile.click(), html: `${ico('image')}<span>上传背景</span>` }),
        store.getCustomBg() ? h('button', { type: 'button', class: 'ae-btn', onclick: () => { store.setCustomBg(''); if (store.get().background === 'custom') store.set({ background: 'night' }); }, html: `${ico('close')}<span>删除自定义</span>` }) : null,
        bgFile)));

    root.append(sec('pet', '像素爱弥斯',
      sw('pet', '显示爱弥斯', '可拖到任意位置；点一下弹出快捷菜单，双击盯着你，连点会晕，在她头上左右来回摸摸她会开心，长按打开本面板'),
      range('petScale', '大小', 0.5, 1.5, 0.05, (v) => `${Math.round(v * 100)}%`),
      sw('petBubbles', '台词气泡'),
      sw('petFollowAgent', '跟随 Agent 状态', '工作时戴墨镜忙碌，出错会懵，完成会欢呼'),
      sw('petIdle', '空闲小动作', '没事时会伸懒腰、哼歌、看星星、东张西望、偷笑、散步，久了会打瞌睡（点她会醒）'),
      h('div', { class: 'ae-row' }, h('span', null, '好感度', h('small', null, '摸头会增加')), h('small', null, `${(() => { try { return Number(localStorage.getItem('dsh-aemeath-theme:affection')) || 0; } catch { return 0; } })()} ♥`)),
      h('div', { class: 'ae-btns' },
        h('button', { type: 'button', class: 'ae-btn', onclick: () => store.set({ petPos: null }), html: `${ico('reload')}<span>放回默认位置</span>` }))));

    const list = h('div', { class: 'ae-list' });
    p.dockActions.forEach((a, i) => {
      const move = (d) => {
        const arr = store.get().dockActions.slice();
        const j = i + d;
        if (j < 0 || j >= arr.length) return;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        store.set({ dockActions: arr });
      };
      list.append(h('div', { class: 'ae-item', 'data-off': !a.on },
        h('span', { class: 'ae-name', html: `${ico(ACTION_ICONS[a.id], 18)}<span>${ACTION_LABELS[a.id] || a.id}</span>` }),
        h('button', { type: 'button', class: 'ae-mini', 'aria-label': '上移', disabled: i === 0, onclick: () => move(-1), html: ico('chevron-up', 18) }),
        h('button', { type: 'button', class: 'ae-mini', 'aria-label': '下移', disabled: i === p.dockActions.length - 1, onclick: () => move(1), html: ico('chevron-down', 18) }),
        h('button', { type: 'button', class: 'ae-sw', role: 'switch', 'aria-checked': String(!!a.on), 'aria-label': `显示 ${ACTION_LABELS[a.id]}`, onclick: () => {
          const arr = store.get().dockActions.map((x) => (x.id === a.id ? { id: x.id, on: !x.on } : x));
          store.set({ dockActions: arr });
        } })));
    });
    root.append(sec('grip', '快捷菜单',
      sw('dock', '点按爱弥斯弹出快捷菜单', '菜单只在点爱弥斯时出现，点空白处 / 再点她 / 执行操作后自动收起；拖动爱弥斯即可改变菜单位置'),
      sw('dockLabels', '按键显示文字'),
      seg('按键大小', [['s', '小'], ['m', '中'], ['l', '大']], p.dockSize, (v) => store.set({ dockSize: v })),
      h('p', { class: 'ae-note' }, '按键与顺序（上下箭头调整顺序，开关决定是否显示）：'),
      list,
      h('div', { class: 'ae-btns' },
        h('button', { type: 'button', class: 'ae-btn', onclick: () => store.reset(['dockActions', 'dockLabels', 'dockSize']), html: `${ico('reload')}<span>恢复默认按键</span>` }))));

    root.append(sec('message', '对话页',
      sw('keyboardGuard', '只在点输入框时弹键盘', '点「+」、发送、切换会话等按钮不再弹出手机键盘（仅触屏生效）'),
      sw('hideNotifyBell', '隐藏右上角通知铃铛', '记忆插件的站内通知小铃铛（关闭后恢复显示）'),
      sw('wwLingo', '鸣潮风格的过程名称', '「运行命令」→「共鸣技能」、「已调用工具」→「已唤醒声骸」、「执行了命令」→「已释放共鸣技能」等，仅改显示文字')));

    root.append(sec('cog', '设置页（0.2 新版）',
      sw('settingsSplit', '拆成两个入口', '侧栏底部出现「系统设置」和「插件中心」：前者只显示 DeepSeek Harness 自带的设置，后者只显示第三方插件加的设置页'),
      sw('settingsSkin', '设置页新皮肤', '官方设置弹窗换成爱弥斯「频段柱」布局'),
      seg('设置页风格', [['starlight', '星辉·侧栏'], ['resonance', '共鸣·频段柱'], ['classic', '经典列表']], p.settingsStyle, (v) => store.set({ settingsStyle: v }), '星辉：左侧图标导航 + 右侧卡片，手机上为顶部滑动标签与底部翻页，系统设置粉色、插件中心紫色；共鸣：一排频段竖柱，选中项展开点亮，底部切换 系统/模组，可左右滑动翻页；经典：保留官方侧边导航'),
      seg('翻页效果', [['glitch', '电子幽灵'], ['scan', '共鸣扫描'], ['slide', '平移'], ['none', '关闭']], p.settingsFlip, (v) => store.set({ settingsFlip: v })),
      sw('settingsSwipe', '左右滑动翻页', '在设置内容区左右轻扫可切换上/下一页'),
      h('div', { class: 'ae-btns' },
        h('button', { type: 'button', class: 'ae-btn', onclick: () => settingsSplit().openSettings('official'), html: `${ico('cog')}<span>打开系统设置</span>` }),
        h('button', { type: 'button', class: 'ae-btn', onclick: () => settingsSplit().openSettings('plugins'), html: `${ico('androids')}<span>打开插件中心</span>` }))));

    root.append(sec('zap', '模型选择胶囊',
      sw('capsuleSkin', '爱弥斯胶囊皮肤', '像素字体 + 粉色发光边框，思考强度颜色保留'),
      sw('chatChrome', '舰桥式聊天界面', '顶栏两行重排、输入框宝石按键、底部状态条与收起把手统一样式'),
      seg('顶栏样式', [['starlight', '星辉胶囊'], ['ribbon', '轻透星轨'], ['classic', '原版舰桥']], p.headerStyle || 'starlight', (v) => store.set({ headerStyle: v }), '星辉胶囊：联体琉璃双键 + 悬浮分段标签；轻透星轨：无框极简风；原版舰桥：复古方块按键'),
      sw('compactSidebar', '紧凑侧栏', '顶部入口收成一排图标、底部按钮收成两排，会话列表更长'),
      seg('侧栏风格', [['starlight', '星辉玻璃'], ['pixel', '像素舰桥']], p.sidebarStyle || 'starlight', (v) => store.set({ sidebarStyle: v }), '星辉：圆角玻璃图块、渐变新会话按钮、角色卡入口；像素：原版九宫格像素框'),
      sw('polestarSlider', '启明星光刃滑块', '思考强度滑块换成「永远的启明星」粉青光刃与像素星屑粒子'),
      sw('capsuleClamp', '手机面板防溢出', '窄屏下模型面板左右贴边、加大点按行高')));

    root.append(sec('layout', '手机布局',
      sw('mobileNav', '移动端抽屉布局', '内置 dsh-mobile-nav：左右滑动切换会话列表/聊天、头部重排、输入框折叠'),
      sw('mobileFixes', '头部与触控修复', '内置 header-fix / touch-fix / 壁纸面板适配')));

    root.append(h('div', { class: 'ae-btns' },
      h('button', { type: 'button', class: 'ae-btn ae-pink', onclick: () => { if (confirm('把爱弥斯主题的全部设置恢复默认？')) store.reset(); }, html: `${ico('reload')}<span>全部恢复默认</span>` })));

    root.append(h('p', { class: 'ae-credit' },
      '爱弥斯是《鸣潮》（库洛游戏）角色，本主题为同人非商用。像素小人：aemeath-mini-codex-pet（MIT）；像素字体：缝合像素 Fusion Pixel（OFL）；图标：pixelarticons（MIT）；按键底图：Kenney Pixel UI（CC0）；手机布局：dsh-mobile-nav（MIT）。'));
  }

  render();
  let lastPrefs = store.get();
  const off = store.subscribe(p => {
    const changed = Object.keys(p).filter(k => p[k] !== lastPrefs[k]);
    lastPrefs = p;
    if (!changed.length || changed.some(k => !switches.has(k))) { render(); return; }
    for (const key of changed) switches.get(key).setAttribute('aria-checked', String(!!p[key]));
  });
  let lastThemeKey;
  const onTheme = setInterval(() => {
    const snap = theme?.getTheme?.();
    const key = snap ? `${snap.preference}|${snap.fontSize}` : '';
    if (key !== lastThemeKey) { if (lastThemeKey !== undefined) render(); lastThemeKey = key; }
  }, 1000);
  return () => { off(); clearInterval(onTheme); root.remove(); offStyle(); };
}

/** Floating sheet hosting the panel (dock settings button / pet long press). */
function openSheet(ctx) {
  if (document.getElementById('aemeath-sheet')) return;
  const sheet = h('div', { id: 'aemeath-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': '爱弥斯主题设置' });
  const card = h('div', { class: 'ae-sheet-card' });
  const close = () => { unmount(); sheet.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  card.append(h('div', { class: 'ae-sheet-top' }, h('span', null, '✦ 爱弥斯主题'),
    h('button', { type: 'button', 'aria-label': '关闭', onclick: close, html: ico('close', 20) })));
  sheet.append(card);
  sheet.addEventListener('click', (e) => { if (e.target === sheet) close(); });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(sheet);
  const unmount = mountPanel(card, ctx);
  openSheet.close = close;
}

module.exports = { mountPanel, openSheet };


};
modules["pet.js"] = function(require, module, exports) {
"use strict";
// Pixel Aemeath companion. Two sprite sheets, both 8 cols with 96x104 cells:
//   pet-half.webp  (aemeath-mini-codex-pet, MIT) rows:
//     0 idle(6) 1 run-right(8) 2 run-left(8) 3 eyes-closed(4) 4 jump(5)
//     5 failed(8) 6 waiting(6) 7 work(6) 8 review(6)
//   pet-extra.webp (rebuilt from the same original GIFs by
//     scripts/gen-pet-extra.sh, aligned to pet-half) rows:
//     0 giggle(7) 1 doze(8) 2 shy(8) 3 cheer(8)
// Behaviour: follows the agent (idle / work / waiting + bursts on start,
// done, error); idle life with a weighted repertoire of little acts
// (stretch, sing, stargaze, look around, giggle, cheer, yawn, stroll),
// greets by time of day, dozes off and wakes up when touched. Input: tap =
// quick menu + reaction, rapid taps = poke -> dizzy, double tap = stare,
// rubbing over her head = pat, drag anywhere, long press = theme panel,
// mouse hover = notices you. A small affection counter grows with pats.
const store = require('./store.js');
const quotes = require('./quotes.js');
const { asset } = require('./assets.js');

const CW = 96, CH = 104;
const ANIMS = {
  idle: { sheet: 0, row: 0, frames: 6, fps: 6 },
  right: { sheet: 0, row: 1, frames: 8, fps: 10 },
  left: { sheet: 0, row: 2, frames: 8, fps: 10 },
  calm: { sheet: 0, row: 3, frames: 4, fps: 3 },
  jump: { sheet: 0, row: 4, frames: 5, fps: 9 },
  failed: { sheet: 0, row: 5, frames: 8, fps: 8 },
  waiting: { sheet: 0, row: 6, frames: 6, fps: 5 },
  work: { sheet: 0, row: 7, frames: 6, fps: 8 },
  review: { sheet: 0, row: 8, frames: 6, fps: 7 },
  lookR: { sheet: 0, row: 1, frames: 1, fps: 2 },
  lookL: { sheet: 0, row: 2, frames: 1, fps: 2 },
  giggle: { sheet: 1, row: 0, frames: 7, fps: 8 },
  doze: { sheet: 1, row: 1, frames: 8, fps: 3, seq: [0, 1, 2, 3, 4, 3, 2, 1] },
  shy: { sheet: 1, row: 2, frames: 8, fps: 8 },
  cheer: { sheet: 1, row: 3, frames: 8, fps: 10 },
};
const SHEETS = ['pet-half.webp', 'pet-extra.webp'];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const AFFECTION_KEY = 'dsh-aemeath-theme:affection';
const readAffection = () => { try { return Number(localStorage.getItem(AFFECTION_KEY)) || 0; } catch { return 0; } };
const writeAffection = (n) => { try { localStorage.setItem(AFFECTION_KEY, String(n)); } catch { /* private mode */ } };

const CSS = `
#aemeath-pet{position:fixed;left:0;top:0;z-index:45;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;cursor:grab;will-change:transform}
#aemeath-pet[hidden]{display:none}
#aemeath-pet .ae-pet-body{position:relative;transform-origin:50% 100%}
#aemeath-pet .ae-pet-sprite{width:var(--w);height:var(--h);background-image:var(--sheet);background-repeat:no-repeat;background-size:calc(var(--w) * 8) calc(var(--h) * var(--rows,9));filter:drop-shadow(0 2px 0 rgba(13,9,27,.6)) drop-shadow(0 0 6px rgba(255,105,183,.35))}
#aemeath-pet[data-dragging]{cursor:grabbing}
#aemeath-pet[data-dragging] .ae-pet-body{transform:rotate(-6deg) scale(1.04)}
#aemeath-pet[data-fx="squish"] .ae-pet-body{animation:ae-pet-squish .32s steps(4)}
#aemeath-pet[data-fx="wobble"] .ae-pet-body{animation:ae-pet-wobble .5s steps(6)}
#aemeath-pet[data-fx="dizzy"] .ae-pet-body{animation:ae-pet-dizzy 1.2s steps(12) 2}
#aemeath-pet[data-fx="bob"] .ae-pet-body{animation:ae-pet-bob .5s steps(4) infinite}
#aemeath-pet[data-fx="stretch"] .ae-pet-body{animation:ae-pet-stretch 1.6s steps(8)}
#aemeath-pet[data-fx="startle"] .ae-pet-body{animation:ae-pet-startle .45s steps(5)}
@keyframes ae-pet-squish{0%{transform:scale(1,1)}35%{transform:scale(1.12,.86)}70%{transform:scale(.95,1.06)}100%{transform:scale(1,1)}}
@keyframes ae-pet-wobble{0%,100%{transform:rotate(0)}25%{transform:rotate(-5deg)}75%{transform:rotate(5deg)}}
@keyframes ae-pet-dizzy{0%,100%{transform:rotate(0) translateX(0)}25%{transform:rotate(-8deg) translateX(-3px)}75%{transform:rotate(8deg) translateX(3px)}}
@keyframes ae-pet-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes ae-pet-stretch{0%,100%{transform:scale(1,1)}30%,60%{transform:scale(.94,1.1)}75%{transform:scale(1.06,.94)}}
@keyframes ae-pet-startle{0%,100%{transform:translateY(0)}40%{transform:translateY(-10px) scale(1.04)}}
#aemeath-pet .ae-pet-shadow{position:absolute;left:50%;bottom:2px;width:46%;height:6px;transform:translateX(-50%);background:rgba(13,9,27,.45);border-radius:50%;filter:blur(1px);z-index:-1}
#aemeath-pet .ae-pet-bubble{position:absolute;bottom:calc(100% - 4px);left:50%;transform:translateX(-50%);max-width:210px;width:max-content;padding:4px 9px 5px;font:20px/1.1 var(--ae-font-px,"AemeathPixel",monospace);color:#3a0f2a;background:#fff4fa;border:2px solid #ff69b7;box-shadow:2px 2px 0 #0d091b,0 0 10px rgba(255,105,183,.4);pointer-events:none;opacity:0;transition:opacity .15s steps(2);white-space:normal;text-align:center;z-index:2}
#aemeath-pet .ae-pet-bubble::after{content:"";position:absolute;left:calc(50% - 4px);top:100%;width:8px;height:6px;background:#ff69b7;clip-path:polygon(0 0,100% 0,50% 100%)}
#aemeath-pet .ae-pet-bubble[data-show]{opacity:1}
#aemeath-pet[data-edge-left] .ae-pet-bubble{left:0;transform:none}
#aemeath-pet[data-edge-right] .ae-pet-bubble{left:auto;right:0;transform:none}
#aemeath-pet .ae-pet-zzz{position:absolute;right:4px;top:6px;font:20px var(--ae-font-px,monospace);color:#77e8ff;text-shadow:1px 1px 0 #0d091b;animation:ae-zzz 2s steps(4) infinite;pointer-events:none}
#aemeath-pet .ae-pet-zzz:nth-of-type(2){animation-delay:1s;font-size:14px;right:14px;top:14px}
@keyframes ae-zzz{0%{transform:translate(0,0);opacity:0}30%{opacity:1}100%{transform:translate(8px,-14px);opacity:0}}
#aemeath-pet .ae-pet-fx{position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;z-index:1}
#aemeath-pet .ae-p{position:absolute;left:0;top:0;width:var(--s,12px);height:var(--s,12px);margin:calc(var(--s,12px) / -2) 0 0 calc(var(--s,12px) / -2);background:currentColor;-webkit-mask:var(--m) center/contain no-repeat;mask:var(--m) center/contain no-repeat;animation:ae-p-float var(--d,1.1s) steps(var(--st,8)) forwards;opacity:0}
#aemeath-pet .ae-p[data-k="note"]{-webkit-mask:none;mask:none;background:none;width:auto;height:auto;margin:0;font:18px/1 var(--ae-font-px,monospace);text-shadow:1px 1px 0 #0d091b}
#aemeath-pet .ae-p[data-k="star"]{background:var(--star) center/contain no-repeat;-webkit-mask:none;mask:none;image-rendering:pixelated}
@keyframes ae-p-float{0%{opacity:0;transform:translate(0,0) scale(.6)}15%{opacity:1}100%{opacity:0;transform:translate(var(--dx,0),var(--dy,-36px)) scale(1)}}
#aemeath-pet .ae-pet-orbit{position:absolute;left:50%;top:18%;width:0;height:0;pointer-events:none}
#aemeath-pet .ae-pet-orbit i{position:absolute;left:-6px;top:-6px;width:12px;height:12px;background:var(--star) center/contain no-repeat;image-rendering:pixelated;animation:ae-orbit 1.2s steps(12) infinite}
#aemeath-pet .ae-pet-orbit i:nth-child(2){animation-delay:-.4s}
#aemeath-pet .ae-pet-orbit i:nth-child(3){animation-delay:-.8s}
@keyframes ae-orbit{0%{transform:translate(0,-6px) translate(22px,0)}25%{transform:translate(0,-6px) translate(0,5px)}50%{transform:translate(0,-6px) translate(-22px,0)}75%{transform:translate(0,-6px) translate(0,-5px)}100%{transform:translate(0,-6px) translate(22px,0)}}
@media (prefers-reduced-motion:reduce){#aemeath-pet .ae-pet-zzz,#aemeath-pet .ae-p,#aemeath-pet .ae-pet-orbit i,#aemeath-pet[data-fx] .ae-pet-body{animation:none}#aemeath-pet .ae-p{opacity:0}}
`;

const IDLE_ACTS = [
  { id: 'stretch', w: 3 }, { id: 'sing', w: 3 }, { id: 'stars', w: 2 }, { id: 'look', w: 2 },
  { id: 'giggle', w: 2 }, { id: 'cheer', w: 2 }, { id: 'yawn', w: 2 }, { id: 'stroll', w: 3 },
];

class Pet {
  constructor(opts) {
    this.opts = opts; // { onLongPress, onTap, onDragStart }
    this.base = 'idle';
    this.anim = 'idle';
    this.burstUntil = 0;
    this.frame = 0;
    this.lastTick = 0;
    this.lastActivity = Date.now();
    this.nextIdleAct = Date.now() + 9000 + Math.random() * 8000;
    this.sleeping = false;
    this.walk = null;
    this.raf = 0;
    this.bubbleTimer = 0;
    this.fxTimer = 0;
    this.taps = [];
    this.affection = readAffection();
    this.x = 0; this.y = 0;
  }

  mount() {
    const style = document.createElement('style');
    style.dataset.plugin = 'dsh-aemeath-theme';
    style.dataset.pluginCss = 'dsh-aemeath-theme/pet.css';
    style.textContent = CSS;
    document.head.appendChild(style);
    const el = document.createElement('div');
    el.id = 'aemeath-pet';
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', '爱弥斯');
    el.innerHTML = '<div class="ae-pet-bubble"></div><div class="ae-pet-shadow"></div><div class="ae-pet-body"><div class="ae-pet-sprite"></div></div><div class="ae-pet-fx"></div>';
    document.body.appendChild(el);
    this.el = el; this.style = style;
    this.body = el.querySelector('.ae-pet-body');
    this.sprite = el.querySelector('.ae-pet-sprite');
    this.bubble = el.querySelector('.ae-pet-bubble');
    this.fxLayer = el.querySelector('.ae-pet-fx');
    el.style.setProperty('--star', `url("${asset('polestar-tag.png')}")`);
    this.sheetUrls = SHEETS.map((n) => `url("${asset(n)}")`);
    // warm the second sheet so the first idle act does not flash empty
    const img = new Image(); img.src = asset(SHEETS[1]);
    this.sheet = -1;
    this.bindPointer();
    this.applyPrefs(store.get());
    this.offStore = store.subscribe((p) => this.applyPrefs(p));
    this.onResize = () => this.place(this.x, this.y, false);
    window.addEventListener('resize', this.onResize);
    const shouldPause = () => !this.el || this.el.hidden || document.hidden
      || (document.body.hasAttribute('data-ae-settings-open') && innerWidth <= 760 && !!document.documentElement.dataset.aeSetStyle);
    const loop = (t) => {
      this.raf = 0;
      if (shouldPause()) return;
      this.tick(t);
      if (!shouldPause()) this.raf = requestAnimationFrame(loop);
    };
    this.syncLoop = () => {
      if (shouldPause()) { if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; } }
      else if (!this.raf) { this.lastTick = 0; this.raf = requestAnimationFrame(loop); }
    };
    this.bodyMo = new MutationObserver(this.syncLoop);
    this.bodyMo.observe(document.body, { attributes: true, attributeFilter: ['data-ae-settings-open'] });
    document.addEventListener('visibilitychange', this.syncLoop);
    this.syncLoop();
    setTimeout(() => this.greet(), 900);
    return () => this.unmount();
  }

  unmount() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    clearTimeout(this.bubbleTimer);
    clearTimeout(this.fxTimer);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.syncLoop);
    this.bodyMo?.disconnect();
    if (this.offStore) this.offStore();
    if (this.el) this.el.remove();
    if (this.style) this.style.remove();
  }

  size() {
    const s = Math.max(0.5, Math.min(1.6, Number(store.get().petScale) || 0.9));
    return { w: Math.round(CW * s), h: Math.round(CH * s) };
  }

  applyPrefs(p) {
    if (!this.el) return;
    this.el.hidden = !p.pet;
    const { w, h } = this.size();
    this.sprite.style.setProperty('--w', w + 'px');
    this.sprite.style.setProperty('--h', h + 'px');
    this.sprite.style.imageRendering = w >= CW ? 'pixelated' : 'auto';
    this.lastTick = 0;
    this.syncLoop?.();
    if (this.dragging) return;
    const pos = p.petPos;
    if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y)) this.place(pos.x * innerWidth, pos.y * innerHeight, false);
    else this.perch();
  }

  /** Default seat: perched on the top edge of the composer card (right side). */
  perch() {
    const { w, h } = this.size();
    const card = document.querySelector('[data-composer-card]');
    const r = card && card.getBoundingClientRect();
    // Sit on whatever stacks above the card (task list, plan bar) so the pet never covers their controls.
    let top = r ? r.top : 0;
    const seat = card && card.closest('[data-composer-seat]');
    if (seat) for (const el of seat.querySelectorAll('[data-slot="conversation.composer.dock"] > *, [class*="_composerStack"] > *')) {
      const b = el.getBoundingClientRect();
      if (b.height > 0 && b.bottom <= (r ? r.top + 2 : innerHeight) && b.top < top) top = b.top;
    }
    if (r && r.width > 0 && top > h + 20) this.place(Math.max(r.left + 8, r.right - w - 64), top - h + 10, false);
    else this.place(12, innerHeight - h - 170, false);
  }

  place(x, y, save) {
    const { w, h } = this.size();
    const nx = Math.max(0, Math.min(innerWidth - w, x));
    const ny = Math.max(0, Math.min(innerHeight - h, y));
    const rx = Math.round(nx), ry = Math.round(ny);
    this.x = nx; this.y = ny;
    if (this._rx !== rx || this._ry !== ry) {
      this._rx = rx; this._ry = ry;
      this.el.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      this.el.toggleAttribute('data-edge-left', nx < 70);
      this.el.toggleAttribute('data-edge-right', nx > innerWidth - w - 70);
    }
    if (save) store.set({ petPos: { x: nx / innerWidth, y: ny / innerHeight } });
  }

  // ---------- animation ----------
  setBase(base) {
    if (this.base === base) return;
    this.base = base;
    this.wake(false);
  }

  burst(anim, ms, line) {
    this.anim = anim;
    this.frame = 0;
    this.lastAnim = null;
    this.burstUntil = performance.now() + ms;
    this.walk = null;
    this.wake(false);
    if (line) this.say(line);
  }

  /** Body tween on top of the sprite (squish, wobble, dizzy...). */
  fx(name, ms) {
    if (!this.el) return;
    clearTimeout(this.fxTimer);
    this.el.removeAttribute('data-fx');
    void this.body.offsetWidth; // restart the animation when the same fx repeats
    this.el.setAttribute('data-fx', name);
    if (ms) this.fxTimer = setTimeout(() => this.el?.removeAttribute('data-fx'), ms);
  }

  /** Small pixel particles rising from the pet. kind: heart | star | note | spark. */
  emit(kind, n = 5, opts = {}) {
    if (!this.fxLayer || reduced()) return;
    const { w, h } = this.size();
    const colors = { heart: ['#ff69b7', '#ffb3da'], spark: ['#77e8ff', '#ffffff', '#ffd27a'], note: ['#ff69b7', '#77e8ff', '#c9b6ff'], star: ['#fff'] };
    const masks = { heart: 'heart', spark: 'sparkle' };
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      p.className = 'ae-p';
      p.dataset.k = kind;
      const cx = (opts.x ?? w / 2) + (Math.random() - 0.5) * (opts.spread ?? w * 0.6);
      const cy = (opts.y ?? h * 0.3) + (Math.random() - 0.5) * 10;
      p.style.left = `${cx}px`;
      p.style.top = `${cy}px`;
      p.style.color = pick(colors[kind] || colors.spark);
      p.style.setProperty('--s', `${kind === 'star' ? 12 : 10 + Math.round(Math.random() * 6)}px`);
      p.style.setProperty('--dx', `${Math.round((Math.random() - 0.5) * 40)}px`);
      p.style.setProperty('--dy', `${-24 - Math.round(Math.random() * 30)}px`);
      p.style.setProperty('--d', `${0.9 + Math.random() * 0.6}s`);
      p.style.animationDelay = `${i * (opts.stagger ?? 0.08)}s`;
      if (kind === 'note') p.textContent = pick(['♪', '♫']);
      else if (masks[kind]) p.style.setProperty('--m', ICON_MASKS[masks[kind]]);
      this.fxLayer.appendChild(p);
      setTimeout(() => p.remove(), 2600 + i * 120);
    }
  }

  orbit(ms) {
    if (!this.el || reduced()) return;
    this.el.querySelector('.ae-pet-orbit')?.remove();
    const o = document.createElement('div');
    o.className = 'ae-pet-orbit';
    o.innerHTML = '<i></i><i></i><i></i>';
    this.el.appendChild(o);
    setTimeout(() => o.remove(), ms);
  }

  wake(fromTouch) {
    this.lastActivity = Date.now();
    if (!this.sleeping) return;
    this.sleeping = false;
    this.el.querySelectorAll('.ae-pet-zzz').forEach((z) => z.remove());
    if (fromTouch) {
      this.anim = 'jump'; this.frame = 0; this.lastAnim = null;
      this.burstUntil = performance.now() + 560;
      this.fx('startle', 450);
      this.say(pick(quotes.wake), 2200);
    }
  }

  sleep() {
    this.sleeping = true; this.walk = null;
    for (const t of ['z', 'z']) {
      const z = document.createElement('span'); z.className = 'ae-pet-zzz'; z.textContent = t;
      this.el.appendChild(z);
    }
    if (Math.random() < 0.5) this.say(pick(quotes.sleep), 2000);
  }

  greet() {
    const hr = new Date().getHours();
    const pool = hr >= 5 && hr < 11 ? quotes.morning : hr >= 11 && hr < 14 ? quotes.noon : hr >= 18 && hr < 23 ? quotes.evening : hr >= 23 || hr < 5 ? quotes.night : null;
    this.burst('cheer', 1400);
    this.emit('spark', 4);
    this.say(pick(pool && Math.random() < 0.7 ? pool : quotes.greet), 3200);
  }

  /** One of the little things she does when nobody needs her. */
  idleAct() {
    const sitting = !store.get().petPos;
    const idleMs = Date.now() - this.lastActivity;
    const pool = IDLE_ACTS.filter((a) => !(a.id === 'stroll' && sitting));
    let r = Math.random() * pool.reduce((s, a) => s + a.w, 0);
    let act = pool[0];
    for (const a of pool) { r -= a.w; if (r <= 0) { act = a; break; } }
    // the longer nobody is around, the sleepier she gets
    if (idleMs > 55000 && Math.random() < 0.6) act = { id: 'yawn' };
    const chatty = Math.random() < 0.55;
    const keep = this.lastActivity;
    this.doAct(act.id, chatty, idleMs);
    this.lastActivity = keep;
  }

  doAct(id, chatty, idleMs = 0) {
    switch (id) {
      case 'stretch':
        this.burst('jump', 1500); this.fx('stretch', 1600);
        if (chatty) this.say('伸个懒腰~', 1800);
        break;
      case 'sing':
        this.burst('calm', 3200); this.fx('bob', 3200);
        this.emit('note', 5, { stagger: 0.5, spread: 50 });
        if (chatty) this.say(pick(quotes.sing), 2400);
        break;
      case 'stars':
        this.burst('idle', 2600);
        this.emit('star', 4, { stagger: 0.4, y: 0, spread: 80 });
        if (chatty) this.say(pick(quotes.stars), 2400);
        break;
      case 'look': {
        const first = Math.random() < 0.5 ? 'lookR' : 'lookL';
        this.burst(first, 1100);
        setTimeout(() => {
          if (this.lastAnim !== first || this.base !== 'idle') return;
          const keep = this.lastActivity;
          this.burst(first === 'lookR' ? 'lookL' : 'lookR', 1100);
          this.lastActivity = keep;
        }, 1150);
        if (chatty && idleMs > 30000) this.say(pick(quotes.bored), 2200);
        break;
      }
      case 'giggle':
        this.burst('giggle', 1800); this.emit('heart', 2);
        if (chatty) this.say('嘿嘿~', 1500);
        break;
      case 'cheer':
        this.burst('cheer', 1600); this.emit('spark', 4);
        if (chatty) this.say(pick(quotes.cheer), 2400);
        break;
      case 'yawn':
        this.burst('doze', 2600); this.fx('stretch', 1600);
        if (chatty) this.say(pick(quotes.yawn), 2000);
        break;
      case 'stroll': {
        const dir = this.x < innerWidth / 3 ? 1 : this.x > innerWidth * 2 / 3 ? -1 : (Math.random() < 0.5 ? -1 : 1);
        this.walk = { dir, left: 40 + Math.random() * 90 };
        break;
      }
    }
  }

  currentAnim(now) {
    if (this.dragging) return this.dragDir < 0 ? 'left' : 'right';
    if (now < this.burstUntil) return this.anim;
    if (this.walk) return this.walk.dir < 0 ? 'left' : 'right';
    if (this.base === 'work') return 'work';
    if (this.base === 'waiting') return 'waiting';
    if (this.sleeping) return 'doze';
    return 'idle';
  }

  draw(anim) {
    const spec = ANIMS[anim];
    const { w, h } = this.size();
    if (spec.sheet !== this.sheet) {
      this.sheet = spec.sheet;
      this.sprite.style.setProperty('--sheet', this.sheetUrls[spec.sheet]);
      this.sprite.style.setProperty('--rows', spec.sheet === 0 ? '9' : '4');
    }
    const col = spec.seq ? spec.seq[this.frame % spec.seq.length] : this.frame;
    this.sprite.style.backgroundPosition = `${-col * w}px ${-spec.row * h}px`;
  }

  tick(now) {
    if (!this.el || this.el.hidden || document.body.hasAttribute('data-ae-settings-open') && innerWidth <= 760 && !!document.documentElement.dataset.aeSetStyle) return;
    const anim = this.currentAnim(now);
    const spec = ANIMS[anim];
    const len = spec.seq ? spec.seq.length : spec.frames;
    if (anim !== this.lastAnim) { this.frame = 0; this.lastAnim = anim; this.lastTick = now; this.draw(anim); }
    else if (now - this.lastTick >= 1000 / spec.fps) {
      this.lastTick = now;
      this.frame = (this.frame + 1) % len;
      this.draw(anim);
    }
    // keep the default seat glued to the composer (it moves with the keyboard)
    if (!store.get().petPos && !this.dragging && !this.walk && now - (this.lastPerch || 0) > 700) { this.lastPerch = now; this.perch(); }
    if (this.base !== 'idle' || this.dragging || now < this.burstUntil) return;
    // idle life: little acts, dozing off, strolling
    const wall = Date.now();
    const idleMs = wall - this.lastActivity;
    if (!this.sleeping && idleMs > 90000) { this.sleep(); return; }
    if (!this.sleeping && !this.walk && !reduced() && store.get().petIdle !== false && wall >= this.nextIdleAct) {
      this.nextIdleAct = wall + 14000 + Math.random() * 16000;
      if (document.visibilityState === 'visible') this.idleAct();
    }
    if (this.walk) {
      const step = 0.9 * this.walk.dir;
      const before = this.x;
      this.place(this.x + step, this.y, false);
      this.walk.left -= Math.abs(step);
      if (this.walk.left <= 0 || this.x === before) { this.walk = null; if (store.get().petPos) this.place(this.x, this.y, true); }
    }
  }

  say(text, ms = 2600) {
    if (!text || !store.get().petBubbles || !this.bubble) return;
    this.bubble.textContent = text;
    this.bubble.setAttribute('data-show', '');
    clearTimeout(this.bubbleTimer);
    this.bubbleTimer = setTimeout(() => this.bubble.removeAttribute('data-show'), ms);
  }

  addAffection(n) {
    const before = this.affection;
    this.affection += n;
    writeAffection(this.affection);
    for (const k of Object.keys(quotes.affection).map(Number)) {
      if (before < k && this.affection >= k) { this.say(quotes.affection[k], 3200); this.emit('heart', 8, { stagger: 0.06 }); return true; }
    }
    return false;
  }

  // ---------- reactions ----------
  /** Single tap that did not open the quick menu (menu disabled). */
  reactTap(local) {
    const head = local.y < this.size().h * 0.45;
    const roll = Math.random();
    if (head && roll < 0.5) { this.burst('shy', 1300, pick(quotes.tap)); this.emit('heart', 2); return; }
    if (roll < 0.35) { this.burst('giggle', 1200, pick(quotes.tap)); return; }
    this.burst('jump', 620, pick(quotes.tap));
    this.fx('squish', 320);
  }

  /** Rapid taps: poke -> grumpy -> dizzy. */
  reactPoke(count) {
    if (count >= 6) {
      this.taps = [];
      this.burst('failed', 2400, pick(quotes.dizzy));
      this.fx('dizzy', 2400); this.orbit(2400);
      return;
    }
    this.burst(count >= 4 ? 'review' : 'shy', 900, count === 3 || count === 5 ? pick(quotes.poke) : null);
    this.fx(count >= 4 ? 'wobble' : 'squish', count >= 4 ? 500 : 320);
  }

  reactPat() {
    this.burst('giggle', 1600);
    this.emit('heart', 3, { y: 4 });
    if (!this.addAffection(1)) this.say(pick(quotes.pat), 1800);
  }

  // ---------- input ----------
  bindPointer() {
    const el = this.el;
    let start = null, moved = false, pressTimer = 0, lastTap = 0, lastX = 0;
    let rub = null;
    const localOf = (e) => { const r = this.sprite.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const down = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      el.setPointerCapture?.(e.pointerId);
      start = { px: e.clientX, py: e.clientY, x: this.x, y: this.y, local: localOf(e), woke: this.sleeping };
      moved = false; lastX = e.clientX;
      const head = start.local.y < this.size().h * 0.45;
      rub = head ? { turns: 0, dir: 0, lastX: e.clientX, patted: false } : null;
      this.wake(true);
      clearTimeout(pressTimer);
      pressTimer = setTimeout(() => {
        if (!moved && start && !(rub && rub.turns > 0)) { start = null; this.opts.onLongPress?.(); }
      }, 600);
    };
    const move = (e) => {
      if (!start) return;
      const dx = e.clientX - start.px, dy = e.clientY - start.py;
      // rubbing side to side over her head = head pat, not a drag
      if (rub && !moved && Math.abs(dy) < 18) {
        const ddx = e.clientX - rub.lastX;
        if (Math.abs(ddx) >= 3) {
          const dir = Math.sign(ddx);
          if (rub.dir && dir !== rub.dir) rub.turns++;
          rub.dir = dir; rub.lastX = e.clientX;
          if (rub.turns >= 2) clearTimeout(pressTimer);
          if (rub.turns >= 3 && !rub.patted) { rub.patted = true; this.reactPat(); }
          else if (rub.patted && rub.turns % 4 === 0) this.emit('heart', 1, { y: 4 });
        }
        if (Math.abs(dx) < 34) { e.preventDefault(); return; }
        if (rub.turns >= 2) { e.preventDefault(); return; }
      }
      if (!moved && Math.hypot(dx, dy) < 6) return;
      if (!moved) { moved = true; clearTimeout(pressTimer); this.opts.onDragStart?.(); this.dragging = true; el.setAttribute('data-dragging', ''); this.walk = null; this.say(pick(quotes.drag), 1200); }
      this.dragDir = e.clientX - lastX < 0 ? -1 : (e.clientX - lastX > 0 ? 1 : this.dragDir || 1);
      lastX = e.clientX;
      this.place(start.x + dx, start.y + dy, false);
      e.preventDefault();
    };
    const up = () => {
      clearTimeout(pressTimer);
      if (!start) return;
      const wasDrag = moved;
      const start0 = start;
      const local = start.local;
      const patted = rub && rub.turns >= 2;
      start = null; rub = null;
      if (wasDrag) {
        this.dragging = false; el.removeAttribute('data-dragging');
        this.place(this.x, this.y, true);
        this.burst('jump', 560);
        this.fx('squish', 320);
        return;
      }
      if (patted || start0.woke) return;
      const now = Date.now();
      this.taps = this.taps.filter((t) => now - t < 1400);
      this.taps.push(now);
      if (this.taps.length >= 3) { this.opts.onTap?.(false); this.reactPoke(this.taps.length); lastTap = 0; return; }
      if (now - lastTap < 320) { lastTap = 0; this.opts.onTap?.(false); this.burst('review', 1600, '盯——'); return; }
      lastTap = now;
      const opened = this.opts.onTap?.(true);
      if (opened) {
        this.bubble?.removeAttribute('data-show');
        const a = pick(['jump', 'jump', 'giggle', 'shy']);
        this.burst(a, a === 'jump' ? 620 : 900);
        if (a === 'jump') this.fx('squish', 320); else this.emit('heart', 1);
      }
      else this.reactTap(local);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    // mouse users: she notices the cursor now and then
    let lastHover = 0;
    el.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || this.dragging) return;
      const now = Date.now();
      if (this.sleeping) { this.wake(true); return; }
      if (now - lastHover < 20000 || this.base !== 'idle' || performance.now() < this.burstUntil) return;
      lastHover = now;
      this.lastActivity = now;
      if (Math.random() < 0.6) { this.burst('shy', 1100, pick(quotes.hover)); }
    });
  }
}

let ICON_MASKS = {};

/** Follow the agent: running -> work, error -> failed burst, done -> cheer. */
function wireAgent(ctx, pet) {
  let sessions;
  try { sessions = ctx.get('sessions'); } catch { sessions = null; }
  if (!sessions) return () => {};
  let last = null, watchedId, unwatch = () => {};
  const runningId = (list) => {
    for (const id of list?.ids ?? []) if (list.byId?.[id]?.running === true) return id;
    return undefined;
  };
  const read = () => {
    let list;
    try { list = sessions.list?.getSnapshot?.(); } catch { list = undefined; }
    const rid = runningId(list);
    if (rid !== undefined) watchedId = rid;
    let snap;
    try { snap = watchedId === undefined ? undefined : sessions.binding(watchedId)?.session.getSnapshot(); } catch { snap = undefined; }
    const pending = snap && (Array.isArray(snap.pendingQuestions) ? snap.pendingQuestions.length : 0) + (Array.isArray(snap.pendingApprovals) ? snap.pendingApprovals.length : 0);
    return { running: rid !== undefined || snap?.running === true, error: snap?.lastAgentError ?? null, pending: pending || 0 };
  };
  const rewatch = () => {
    if (watchedId === undefined) return;
    const b = sessions.binding?.(watchedId);
    if (!b) return;
    unwatch();
    unwatch = b.session.subscribe(() => sync());
  };
  let watchedNow;
  const sync = () => {
    if (!store.get().petFollowAgent) { pet.setBase('idle'); return; }
    const f = read();
    if (watchedId !== watchedNow) { watchedNow = watchedId; rewatch(); }
    if (last) {
      const errMsg = (e) => (e && typeof e === 'object' ? e.message || JSON.stringify(e) : e);
      if (f.error && errMsg(f.error) !== errMsg(last.error)) pet.burst('failed', 2400, pick(quotes.error));
      else if (!last.running && f.running) { pet.burst('jump', 700, pick(quotes.work)); pet.emit('spark', 3); }
      else if (last.running && !f.running) { pet.burst('cheer', 1600, pick(quotes.done)); pet.emit('spark', 6); }
    }
    pet.setBase(f.running ? 'work' : f.pending > 0 ? 'waiting' : 'idle');
    last = f;
  };
  let offList = () => {};
  if (sessions.list?.subscribe) offList = sessions.list.subscribe(sync);
  else {
    const id = setInterval(sync, 1500);
    offList = () => clearInterval(id);
  }
  sync();
  const offStore = store.subscribe(sync);
  return () => { offList(); offStore(); unwatch(); };
}

function install(ctx, opts) {
  const { svgUrl } = require('./skin-extra.js');
  ICON_MASKS = { heart: svgUrl('heart'), sparkle: svgUrl('sparkle') };
  const pet = new Pet(opts || {});
  pet.rect = () => (pet.el && !pet.el.hidden ? pet.sprite.getBoundingClientRect() : null);
  const off = pet.mount();
  const offAgent = wireAgent(ctx, pet);
  install.pet = pet;
  return () => { offAgent(); off(); install.pet = null; };
}

module.exports = { install };


};
modules["polestar.js"] = function(require, module, exports) {
"use strict";
// 思考强度滑块：保留 @hytime/dsh-thinking-effort 原版「药丸轨道 + 像素光柱辐射 + 刃尖光晕」的结构，
// 只换成「永远的启明星」配色（深空蓝 → 星辉粉，青蓝光柱、粉白刃尖），再加一层像素星屑粒子；
// 旋钮换成像素爱弥斯（待机呼吸，拖动时朝拖动方向奔跑）。
// 原版画布的配色写死在它的 drawRadiation 里，所以这里隐藏原画布，用同一算法重绘一份
// （算法移植自 HanaAyane/dsh-reasoning-effort → hytime/dsh-thinking-effort，MIT）。
const store = require('./store.js');
const { asset } = require('./assets.js');

const S = 'html[data-aemeath][data-ae-polestar]';
const css = () => `
${S} .re-effort-canvas{display:none !important}
${S} .re-effort,${S} .re-effort.is-chibi{height:54px !important}
${S} .re-effort-slider{height:30px !important;border-radius:999px !important;contain:layout style !important;overflow:visible !important}
${S} .re-effort-track{border-radius:999px !important;
  background:linear-gradient(100deg,#04030b 0%,#0a1230 22%,#13285c 45%,#3b2a70 68%,#9a4192 100%) !important;
  box-shadow:inset 0 1px 0 rgba(191,246,255,.18),inset 0 -1px 0 rgba(0,0,0,.55),0 0 0 1px rgba(255,124,196,.22),0 3px 10px rgba(30,12,55,.4) !important}
${S} .re-effort-track::after{background:
    radial-gradient(circle at 18% 45%,rgba(127,233,255,.14),transparent 26%),
    linear-gradient(90deg,rgba(0,0,0,.28),transparent 42%,rgba(255,124,196,.16)) !important}
${S} .re-effort-slider[data-top] .re-effort-track{animation:ae-ps-breathe 1.9s ease-in-out infinite !important}
@keyframes ae-ps-breathe{
  0%,100%{box-shadow:inset 0 1px 0 rgba(191,246,255,.18),0 0 0 1px rgba(255,124,196,.3),0 3px 10px rgba(30,12,55,.4)}
  50%{box-shadow:inset 0 1px 0 rgba(220,250,255,.28),0 0 0 1px rgba(127,233,255,.55),0 0 22px rgba(255,124,196,.55)}}
${S} .ae-ps-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none}
/* 刃尖光晕：白 → 星辉粉 → 青 */
${S} .re-effort-flare{background:radial-gradient(ellipse at 100% 50%,rgba(255,255,255,.96) 0 4%,rgba(255,196,232,.84) 11%,rgba(255,124,196,.5) 28%,rgba(127,233,255,.2) 49%,transparent 74%) !important}
${S} .re-effort-flare::before{background:linear-gradient(90deg,transparent,rgba(127,233,255,.5),#fff,rgba(255,124,196,.75),transparent) !important;
  box-shadow:0 0 7px #ff7cc4,0 0 13px rgba(127,233,255,.7) !important}
${S} .re-effort-flare::after{background:linear-gradient(180deg,transparent,rgba(200,248,255,.9),transparent) !important;box-shadow:0 0 7px #7fe9ff !important}
/* 旋钮：像素爱弥斯 */
${S} .re-effort-knob-rail{--re-knob-edge:20px !important}
${S} .re-effort-knob,${S} .re-effort.is-chibi .re-effort-knob{
  width:48px !important;height:51px !important;border:0 !important;border-radius:0 !important;box-shadow:none !important;outline:0;
  background:url("${asset('doll-pet.webp')}") 0 100%/288px 44px no-repeat !important;
  transform:translate(-50%,-66%) !important;transition:none !important;
  animation:ae-ps-idle 1.1s steps(6) infinite !important;
  filter:drop-shadow(0 1px 1px rgba(0,0,0,.4)) drop-shadow(0 0 5px rgba(255,124,196,.6)) !important}
@keyframes ae-ps-idle{to{background-position-x:-288px}}
${S} .re-effort.is-dragging .re-effort-knob{
  background-image:url("${asset('pet-run-r.webp')}") !important;background-size:384px 51px !important;background-position:0 100% !important;
  animation:ae-ps-run .6s steps(8) infinite !important;
  filter:drop-shadow(0 1px 1px rgba(0,0,0,.4)) drop-shadow(0 0 8px rgba(127,233,255,.85)) !important}
${S} .re-effort-slider[data-ae-dir="l"] .re-effort-knob{background-image:url("${asset('pet-run-l.webp')}") !important}
@keyframes ae-ps-run{to{background-position-x:-384px}}
${S} .re-effort-slider[data-top] .re-effort-knob{filter:drop-shadow(0 1px 1px rgba(0,0,0,.4)) drop-shadow(0 0 7px rgba(255,124,196,.8)) drop-shadow(0 0 12px rgba(127,233,255,.5)) !important}
${S} .re-effort-input:focus-visible + .re-effort-knob-rail .re-effort-knob{outline:1px dashed #7fe9ff !important;outline-offset:1px}
/* 档位文字与闪电图标：低档青、中档淡紫、高档星辉粉（原版是蓝→紫） */
${S} .dsh-reasoning-effort:is([data-level='off'],[data-level='none']) .dsh-reasoning-effort__header strong{color:#8f8aa6 !important}
${S} .dsh-reasoning-effort:is([data-level='minimal'],[data-level='low']) .dsh-reasoning-effort__header strong{color:#7fe9ff !important}
${S} .dsh-reasoning-effort:is([data-level='medium'],[data-level='high']) .dsh-reasoning-effort__header strong{color:#c9a7ff !important}
${S} .dsh-reasoning-effort:is([data-level='xhigh'],[data-level='max']) .dsh-reasoning-effort__header strong{color:#ff7cc4 !important;text-shadow:0 0 8px rgba(255,124,196,.55),0 0 2px #fff}
${S} .dsh-reasoning-model:is([data-level='minimal'],[data-level='low']) .dsh-reasoning-model__bolt{color:#7fe9ff !important}
${S} .dsh-reasoning-model:is([data-level='medium'],[data-level='high']) .dsh-reasoning-model__bolt{color:#c9a7ff !important}
${S} .dsh-reasoning-model:is([data-level='xhigh'],[data-level='max']) .dsh-reasoning-model__bolt{color:#ff7cc4 !important;filter:drop-shadow(0 0 4px rgba(255,124,196,.8)) drop-shadow(0 0 2px rgba(127,233,255,.6)) !important}
${S} .dsh-reasoning-model:is([data-level='xhigh'],[data-level='max']) .dsh-reasoning-model__effort{color:#ff9bd2 !important}
@media (prefers-reduced-motion:reduce){${S} .re-effort-knob{animation:none !important}}
`;

const CELL = 4;
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

function assetsFor(st, ctx, width, height) {
  const cols = Math.max(1, Math.ceil(width / CELL)), rows = Math.max(1, Math.ceil(height / CELL));
  const a = st.assets;
  if (a && a.cols === cols && a.rows === rows && a.height === height) return a;
  const columns = mk(cols, 1), cells = mk(cols, rows), layer = mk(cols * CELL, rows * CELL);
  const columnsContext = columns.getContext('2d'), cellsContext = cells.getContext('2d'), layerContext = layer.getContext('2d');
  layerContext.imageSmoothingEnabled = false;
  const colTile = mk(CELL, CELL); colTile.getContext('2d').fillRect(CELL - 1, 0, 1, CELL);
  const cellTile = mk(CELL, CELL); const ct = cellTile.getContext('2d'); ct.fillRect(CELL - 1, 0, 1, CELL); ct.fillRect(0, CELL - 1, CELL, 1);
  const streak = mk(32, 1); const sc = streak.getContext('2d');
  const sg = sc.createLinearGradient(0, 0, 32, 0);
  sg.addColorStop(0, 'rgba(127,233,255,0)'); sg.addColorStop(.6, 'rgba(127,233,255,.75)'); sg.addColorStop(.86, 'rgba(255,150,210,.92)'); sg.addColorStop(1, 'rgba(255,255,255,1)');
  sc.fillStyle = sg; sc.fillRect(0, 0, 32, 1);
  const glow = ctx.createRadialGradient(0, height / 2, 0, 0, height / 2, 24);
  glow.addColorStop(0, 'rgba(255,255,255,.85)'); glow.addColorStop(.14, 'rgba(255,186,226,.58)');
  glow.addColorStop(.44, 'rgba(255,124,196,.3)'); glow.addColorStop(.72, 'rgba(127,233,255,.12)'); glow.addColorStop(1, 'rgba(127,233,255,0)');
  st.assets = {
    cols, rows, height, columns, cells, layer, columnsContext, cellsContext, layerContext,
    columnImage: columnsContext.createImageData(cols, 1), cellImage: cellsContext.createImageData(cols, rows),
    columnGap: ctx.createPattern(colTile, 'repeat'), cellGap: layerContext.createPattern(cellTile, 'repeat'), streak, glow,
  };
  return st.assets;
}

// 像素光柱辐射（原算法，配色改为：远处青蓝光柱 → 靠近刃尖转星辉粉，热区粉白）
function drawRadiation(ctx, width, height, time, st) {
  const origin = st.progress * width;
  const speed = st.dragging ? 2.8 : 1;
  ctx.clearRect(0, 0, width, height);
  if (origin <= 0) return;
  const A = assetsFor(st, ctx, width, height);
  const { cols, rows } = A;
  const cd = A.columnImage.data, ed = A.cellImage.data;
  cd.fill(0); ed.fill(0);
  const activeCols = Math.min(cols, Math.ceil(origin / CELL));
  const trailSpan = Math.max(55, width * .72), nearSpan = Math.max(1, width * .78);
  const sA = time * .0074 * speed, sB = time * .0041 * speed - 1.7, sC = time * .0022 * speed - 3.4;
  const pillarShift = time * .0016, grainShift = time * .006;
  for (let col = 0; col < activeCols; col++) {
    const x = col * CELL, delta = x + CELL * .5 - origin, distance = Math.abs(delta);
    const a1 = Math.max(0, Math.sin(distance / 10 - sA)), b1 = Math.max(0, Math.sin(distance / 23 - sB)), c1 = Math.max(0, Math.sin(distance / 40 - sC));
    const crest = Math.pow(a1, 15) + Math.pow(b1, 18) * .78;
    const wave = Math.min(1, Math.pow(a1, 2.6) * .76 + Math.pow(b1, 3.2) * .58 + c1 * c1 * c1 * c1 * .32);
    const trail = .38 + .62 * Math.exp(-distance / trailSpan);
    const pb = Math.max(0, Math.sin(x / 20 + pillarShift));
    const energy = trail * (wave * 1.04 + pb * pb * pb * .27 + crest * .32);
    if (energy > .012) {
      const n = Math.max(0, 1 - distance / nearSpan), o = col * 4;
      cd[o] = 50 + 195 * n * n + 20 * wave;
      cd[o + 1] = 160 - 50 * n + 40 * crest;
      cd[o + 2] = 235 - 30 * n;
      cd[o + 3] = Math.min(.88, energy * .72) * 255;
    }
    const dx = delta / 38, eb = energy * .88 + crest * .19;
    for (let row = 0; row < rows; row++) {
      const y = row * CELL, dY = y + CELL * .5 - height * .5, dy = dY / 11;
      const radial = Math.sqrt(dx * dx + dy * dy);
      const halo = Math.exp(-radial * .96) * 1.08;
      const vs = .58 + .42 * Math.cos(dY / height * Math.PI);
      const grain = .72 + .28 * Math.sin(x * .73 + y * 1.31 + grainShift);
      const alpha = Math.min(.96, (eb + halo) * vs * grain);
      if (alpha < .035) continue;
      const hot = Math.max(0, 1 - radial / 2.4), o = (row * cols + col) * 4;
      // 冷端青蓝 (70,190,255) → 中段星辉粉 (255,130,205) → 刃心白
      const t1 = Math.min(1, hot * 1.7), t2 = Math.max(0, hot * 2 - 1);
      ed[o] = 70 + 185 * t1 + 30 * crest;
      ed[o + 1] = 190 - 60 * t1 + 125 * t2 + 30 * crest;
      ed[o + 2] = 255 - 50 * t1 + 50 * t2;
      ed[o + 3] = alpha * 255;
    }
  }
  const lw = cols * CELL, lh = rows * CELL;
  A.columnsContext.putImageData(A.columnImage, 0, 0);
  A.cellsContext.putImageData(A.cellImage, 0, 0);
  const lc = A.layerContext;
  lc.clearRect(0, 0, lw, lh);
  lc.drawImage(A.cells, 0, 0, cols, rows, 0, 0, lw, lh);
  lc.globalCompositeOperation = 'destination-out'; lc.fillStyle = A.cellGap; lc.fillRect(0, 0, lw, lh); lc.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, origin, height); ctx.clip();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(A.columns, 0, 0, cols, 1, 0, 0, lw, height);
  ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = A.columnGap; ctx.fillRect(0, 0, lw, height);
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(A.layer, 0, 0);
  ctx.imageSmoothingEnabled = true;
  const ps = st.dragging ? .16 : .065, loop = Math.max(30, origin + 64), pr = Math.max(7, height - 6);
  for (let i = 0; i < 14; i++) {
    const px = origin - (time * ps * (.78 + i % 5 * .09) + i * 23) % loop;
    if (px < -24 || px > width + 16) continue;
    const py = 3 + (i * 13 + Math.sin(time * .003 + i) * 5) % pr;
    ctx.globalAlpha = Math.min(1, .54 + i % 5 * .1);
    ctx.drawImage(A.streak, px, py, 4 + i % 4 * 4 + (st.dragging ? 6 : 0), i % 3 === 0 ? 2 : 1);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.translate(origin, 0); ctx.fillStyle = A.glow; ctx.fillRect(-26, 0, 52, height);
  ctx.restore();
}

// 像素星屑：从光柱里浮起、闪一下就灭；换档时刃尖炸开一小团
const COLS = [[255, 124, 196], [127, 233, 255], [255, 255, 255], [215, 139, 255], [255, 200, 235]];
function spawn(st, origin, height, burst) {
  const near = burst || Math.random() < .55;
  const ang = Math.random() * Math.PI * 2, sp = .5 + Math.random() * 1.6;
  st.parts.push({
    x: near ? origin - Math.random() * 14 : Math.random() * origin,
    y: 4 + Math.random() * (height - 8),
    vx: burst ? Math.cos(ang) * sp : -(.1 + Math.random() * (st.dragging ? 1.1 : .35)),
    vy: burst ? Math.sin(ang) * sp * .6 : -(.05 + Math.random() * .25),
    life: 0, max: (burst ? 16 : 22) + Math.random() * 30,
    col: COLS[Math.floor(Math.random() * COLS.length)], star: Math.random() < (burst ? .5 : .28),
  });
}
function drawSparkles(ctx, origin, height, dt, st) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const keep = [];
  for (const p of st.parts) {
    p.life += dt; if (p.life > p.max) continue;
    p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .985;
    const a = Math.sin(Math.PI * p.life / p.max);
    const X = Math.round(p.x / 2) * 2, Y = Math.round(p.y / 2) * 2;
    ctx.fillStyle = `rgba(${p.col[0]},${p.col[1]},${p.col[2]},${(a * .95).toFixed(3)})`;
    ctx.fillRect(X, Y, 2, 2);
    if (p.star && a > .4) {
      ctx.globalAlpha = a * .6;
      ctx.fillRect(X - 2, Y, 2, 2); ctx.fillRect(X + 2, Y, 2, 2); ctx.fillRect(X, Y - 2, 2, 2); ctx.fillRect(X, Y + 2, 2, 2);
      ctx.globalAlpha = 1;
    }
    keep.push(p);
  }
  st.parts = keep.length > 120 ? keep.slice(-120) : keep;
  ctx.restore();
}

function install() {
  let style = null, raf = 0, mo = null, bodyMo = null;
  const sliders = new Map();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  const isCovered = () => document.hidden
    || reduced.matches
    || (document.body.hasAttribute('data-ae-settings-open') && innerWidth <= 760);

  const progressOf = (el) => {
    const host = el.style.getPropertyValue('--re-progress')
      || el.closest('.re-effort')?.style.getPropertyValue('--re-progress')
      || getComputedStyle(el).getPropertyValue('--re-progress');
    const n = parseFloat(host);
    return isFinite(n) ? Math.max(0, Math.min(100, n)) / 100 : .5;
  };
  const wake = () => {
    if (isCovered()) { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    else if (sliders.size && !raf) raf = requestAnimationFrame(tick);
  };
  const attach = (el) => {
    if (sliders.has(el)) return;
    const fx = el.querySelector('.re-effort-fx'); if (!fx) return;
    const cv = document.createElement('canvas'); cv.className = 'ae-ps-canvas'; cv.setAttribute('aria-hidden', 'true');
    fx.insertBefore(cv, fx.firstChild);
    sliders.set(el, { cv, ctx: cv.getContext('2d'), parts: [], w: 0, h: 0, prev: -1, drawn: 0, progress: .5, dragging: false, assets: null });
  };
  const detach = (el, s) => { s.cv.remove(); el.removeAttribute('data-ae-dir'); sliders.delete(el); };
  const scan = () => {
    for (const el of document.querySelectorAll('.re-effort-slider')) attach(el);
    for (const [el, s] of sliders) if (!el.isConnected) detach(el, s);
    wake();
  };

  const tick = (t) => {
    raf = 0;
    if (!sliders.size || isCovered()) return;
    for (const [el, s] of sliders) {
      const r = el.getBoundingClientRect();
      if (!r.width || r.bottom < 0 || r.top > innerHeight || r.right <= 0 || r.left >= innerWidth) continue;
      const dragging = !!el.closest('.re-effort.is-dragging');
      if (!dragging && t - s.drawn < 33) continue;
      const step = Math.min(3, (t - (s.drawn || t)) / 16.7 || 1);
      s.drawn = t;
      const ratio = Math.min(devicePixelRatio || 1, 2), W = r.width, H = r.height;
      const pw = Math.round(W * ratio), ph = Math.round(H * ratio);
      if (s.cv.width !== pw || s.cv.height !== ph) { s.cv.width = pw; s.cv.height = ph; }
      s.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const p = progressOf(el);
      if (dragging && s.prev >= 0 && Math.abs(p - s.prev) > .001) el.setAttribute('data-ae-dir', p < s.prev ? 'l' : 'r');
      if (!dragging) el.removeAttribute('data-ae-dir');
      if (!dragging && s.prev >= 0 && Math.abs(p - s.prev) > .02) for (let i = 0; i < 16; i++) spawn(s, p * W, H, true);
      s.prev = p; s.progress = p; s.dragging = dragging;
      const rate = (dragging ? 1.6 : el.hasAttribute('data-top') ? .7 : .4) * step;
      for (let i = 0; i < 6 && (i < Math.floor(rate) || Math.random() < rate - i); i++) spawn(s, p * W, H, false);
      drawRadiation(s.ctx, W, H, t, s);
      drawSparkles(s.ctx, p * W, H, step, s);
    }
    if (sliders.size && !isCovered()) raf = requestAnimationFrame(tick);
  };

  const apply = (prefs) => {
    const on = prefs.polestarSlider !== false;
    const root = document.documentElement;
    if (on) {
      root.setAttribute('data-ae-polestar', '');
      if (!style) { style = document.createElement('style'); style.setAttribute('data-plugin-css', 'dsh-aemeath-theme/polestar.css'); style.textContent = css(); document.head.appendChild(style); }
      if (!mo) { let q = 0; mo = new MutationObserver(() => { if (!q) q = requestAnimationFrame(() => { q = 0; scan(); }); }); mo.observe(document.body, { childList: true, subtree: true }); }
      if (!bodyMo) {
        bodyMo = new MutationObserver(wake);
        bodyMo.observe(document.body, { attributes: true, attributeFilter: ['data-ae-settings-open'] });
        document.addEventListener('visibilitychange', wake);
      }
      scan();
    } else {
      root.removeAttribute('data-ae-polestar');
      if (style) { style.remove(); style = null; }
      if (mo) { mo.disconnect(); mo = null; }
      if (bodyMo) {
        bodyMo.disconnect(); bodyMo = null;
        document.removeEventListener('visibilitychange', wake);
      }
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      for (const [el, s] of sliders) detach(el, s);
    }
  };
  apply(store.get());
  const unsub = store.subscribe(apply);
  return () => { unsub(); apply({ polestarSlider: false }); };
}

module.exports = { install };

};
modules["quotes.js"] = function(require, module, exports) {
"use strict";
// Bubble lines. Short in-game lines (Chinese voicelines, see NOTICE) plus a
// few plain lines of our own. Grouped by moment.
module.exports = {
  greet: ['你，看见我了？', '幽灵来到你，身，边~', '一起去拯救世界吧！', '为你而动。'],
  morning: ['早上好！新的一天，启航！', '早安~今天也一起加油吧'],
  noon: ['午安~记得吃饭哦', '中午啦，休息一下？'],
  evening: ['晚上好~星星出来了', '今天辛苦啦'],
  night: ['夜深了，早点休息哦', '星星都睡了…你还不睡吗？'],
  tap: ['你，看见我了？', '别想做坏事~', '为你而动。', '一起去拯救世界吧！', '爱弥斯，变身~', '嘿嘿，星辉在闪~', '要抱抱吗？不行哦~'],
  poke: ['别、别戳啦…', '呜…好痒', '再戳就不理你了！'],
  dizzy: ['头晕晕…', '星星在转圈圈…'],
  pat: ['嘿嘿~', '再摸摸也可以哦…', '头发会乱掉的啦！', '好舒服~'],
  hover: ['被发现了…', '嗯？在看我吗？'],
  wake: ['唔…被吵醒了', '嗯…？天亮了吗', '我没睡！真的！'],
  sing: ['♪ 啦啦啦~', '♪ 星星在唱歌~', '♪ 哼哼~'],
  stars: ['星辉…在闪烁呢', '那颗是启明星吗？'],
  cheer: ['今天也要加油哦！', '深空联合，随时待命！'],
  yawn: ['哈啊——', '有点困了…'],
  bored: ['无聊…陪我玩嘛', '要不要休息一下？'],
  work: ['幽灵登台！', '启航之时。', '责任所在。', '随声而来。'],
  done: ['英雄的舞台，开幕！', '世界，由我守护！', '搞定啦~', '任务完成！'],
  error: ['唔…出错了', '别想做坏事~', '再来一次吧！'],
  sleep: ['Zzz…', '星星好安静…'],
  drag: ['哇——', '要去哪里？'],
  affection: { 10: '我们是好朋友了！', 50: '最喜欢你了~', 100: '要一直在一起哦！' },
};

};
modules["settings-deck-css.js"] = function(require, module, exports) {
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
  // shared by both deck layouts (palette vars + page-flip effects)
  const RA = 'html[data-aemeath]:is([data-ae-set-style="resonance"],[data-ae-set-style="starlight"])';
  const DA = `${RA} [data-shortcut-modal="settings"]`;
  const OA = `${RA} [class*="VOzbGW_overlay"]:has([data-shortcut-modal="settings"])`;
  const CUT = (n) => `polygon(${n}px 0,100% 0,100% calc(100% - ${n}px),calc(100% - ${n}px) 100%,0 100%,0 ${n}px)`;
  const OPT = `${D}[data-ae-deck] [class*="VOzbGW_options"]`;
  const GEN = `${OPT} [class*="_WvWnq_section"]`;
  const ROW = ':is([class$="_row"],[class*="_row "],[class$="_group"]:not(:has([class$="_row"])),[class$="_setting"],.re-setting-row)';
  const BR = (c, l, w) => ['left top', 'right top', 'left bottom', 'right bottom']
    .map((pos) => `linear-gradient(${c},${c}) ${pos}/${l}px ${w} no-repeat,linear-gradient(${c},${c}) ${pos}/${w} ${l}px no-repeat`).join(',');
  const ROWS = ':is([class*="Pt1bsG_row"],[class*="hVGvvW_row"],[class*="oY77xG_row"],[class*="T1PP_q_row"],[class*="bVCLcG_row"],[class*="_8HJdBW_group"],[class*="yIbyla_row"])';
  const TITLES = ':is([class*="Pt1bsG_title"],[class*="hVGvvW_title"],[class*="oY77xG_title"],[class*="T1PP_q_title"],[class*="bVCLcG_title"],[class*="_8HJdBW_title"],[class*="yIbyla_title"],[class*="iVn_pq_title"])';

  return `
${RA}{
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
  display:grid !important;grid-template-areas:none !important;grid-template-columns:minmax(0,1fr) !important;grid-template-rows:auto auto minmax(0,1fr) auto !important;
  width:min(880px,calc(100vw - 48px)) !important;max-width:none !important;height:min(720px,calc(100dvh - 48px)) !important;max-height:none !important;
  padding:0 !important;overflow:hidden !important;position:relative;isolation:isolate;color:var(--rs-text) !important;
  border-radius:6px !important;border:1px solid var(--rs-line2) !important;clip-path:none !important;
  background:
    radial-gradient(120% 50% at 50% -10%,rgba(var(--rs-pink-rgb),.10),transparent 60%),
    repeating-linear-gradient(90deg,rgba(255,255,255,.018) 0 1px,transparent 1px 72px),
    linear-gradient(180deg,var(--rs-ink2),var(--rs-ink)) !important;
  box-shadow:0 0 0 1px rgba(0,0,0,.6),0 0 0 5px rgba(var(--rs-gold-rgb),.06),0 32px 90px rgba(0,0,0,.7) !important;
  animation:ae-rs-open .18s cubic-bezier(.2,.8,.2,1) both}
@keyframes ae-rs-open{from{opacity:0;transform:translate3d(0,6px,0)}to{opacity:1;transform:none}}
/* star-gold hairline corners */
${D}[data-ae-deck]::before,${D}[data-ae-deck]::after{content:"";position:absolute;width:18px;height:18px;pointer-events:none;z-index:6;border:1px solid var(--rs-gold);opacity:.7}
${D}[data-ae-deck]::before{left:6px;top:6px;border-right:0;border-bottom:0}
${D}[data-ae-deck]::after{right:6px;bottom:6px;border-left:0;border-top:0}

/* the shipped nav stays mounted (we forward clicks to it). Its list/title are
   hidden; on 0.2.1 the content header (close + actions) can live inside the nav,
   so the nav itself is pinned into the head row's right corner. */
${D}[data-ae-deck] > [class*="VOzbGW_navTitle"]{display:none !important}
${D}[data-ae-deck] > nav[class*="VOzbGW_nav"]{grid-area:auto !important;position:absolute !important;top:0 !important;right:10px !important;left:auto !important;bottom:auto !important;
  width:auto !important;height:58px !important;min-height:0 !important;padding:0 !important;margin:0 !important;border:0 !important;background:none !important;pointer-events:none !important;
  display:flex !important;flex-direction:row !important;align-items:center !important;z-index:7;overflow:visible !important;box-shadow:none !important}
${D}[data-ae-deck] > nav[class*="VOzbGW_nav"] > [class*="VOzbGW_header"]{pointer-events:auto !important}
${D}[data-ae-deck] > nav[class*="VOzbGW_nav"] > :not([class*="VOzbGW_header"]){display:none !important}
${D}[data-ae-deck] > [class*="VOzbGW_content"]{grid-area:3 / 1 !important;grid-column:1 !important;grid-row:3 !important;min-width:0 !important;min-height:0 !important;display:flex !important;flex-direction:column !important;position:static !important;overflow:hidden}
${D}[data-ae-deck] > [class*="VOzbGW_options"]{grid-area:3 / 1 !important;grid-column:1 !important;grid-row:3 !important;width:100% !important;min-width:0 !important;min-height:0 !important;box-sizing:border-box !important;position:static !important}

/* ---------- head: centred title, close top-right (忘却前夜 工具式设置) ---------- */
${D} .ae-st-head{grid-column:1;grid-row:1;position:relative;display:flex;align-items:center;justify-content:center;gap:10px;height:58px;padding:0 64px;
  border-bottom:1px solid var(--rs-line)}
${D} .ae-st-mark{width:26px;height:26px;flex:none;background:url("${asset('dsu-emblem.webp')}") center/contain no-repeat;filter:drop-shadow(0 0 6px rgba(var(--rs-pink-rgb),.5))}
${D} .ae-st-title{display:flex;flex-direction:column;align-items:center;line-height:1}
${D} .ae-st-title b{font:400 20px/1 var(--rs-px);letter-spacing:4px;color:var(--rs-text);text-shadow:0 0 10px rgba(var(--rs-pink-rgb),.45)}
${D} .ae-st-title small{margin-top:5px;font:600 9px/1 var(--rs-data);letter-spacing:3px;color:var(--rs-gold);opacity:.8}
/* content header: only the close button (and plugin actions), floated up into the head row */
${D}[data-ae-deck] [class*="VOzbGW_header"]{position:static !important;width:auto !important;height:auto !important;min-height:0 !important;padding:0 !important;border:0 !important;
  display:flex !important;align-items:center !important;gap:8px;background:none !important}
/* if the header stays inside the content column or is a direct child (0.2.2), lift it into the head row */
${D}[data-ae-deck] > [class*="VOzbGW_header"],
${D}[data-ae-deck] > [class*="VOzbGW_content"] > [class*="VOzbGW_header"]{grid-area:auto !important;position:absolute !important;top:0 !important;right:10px !important;height:58px !important;z-index:7 !important}
${D}[data-ae-deck] [class*="VOzbGW_header"]::before{content:none !important}
${D}[data-ae-deck] [class*="VOzbGW_close"]{width:36px !important;min-width:36px !important;height:36px !important;flex:none !important;display:flex !important;align-items:center;justify-content:center;border-radius:50% !important;border:1px solid var(--rs-line2) !important;
  background:rgba(0,0,0,.25) !important;color:var(--rs-text) !important;clip-path:none !important}
${D}[data-ae-deck] [class*="VOzbGW_close"]:hover{border-color:var(--rs-pink) !important;color:var(--rs-pink) !important;box-shadow:0 0 12px rgba(var(--rs-pink-rgb),.35)}
${D}[data-ae-deck] [class*="VOzbGW_actions"] button{border-radius:999px !important;border:1px solid var(--rs-line2) !important;background:rgba(0,0,0,.2) !important;
  color:var(--rs-mute) !important;font:600 11px/1 var(--rs-data) !important;clip-path:none !important;height:30px}

${D} .ae-st-crumb{display:none !important}
/* ---------- pillars (星落 竖柱：选中项变宽、点亮、两侧光边) ---------- */
${D} .ae-st-pillars{grid-column:1;grid-row:2;display:flex;align-items:stretch;gap:0;height:150px;padding:0 10px;overflow-x:auto;overflow-y:hidden;
  scrollbar-width:none;border-bottom:1px solid var(--rs-line);position:relative;
  background:linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,0) 70%),
    repeating-linear-gradient(0deg,rgba(var(--rs-cyan-rgb),.035) 0 1px,transparent 1px 6px)}
${D} .ae-st-pillars::-webkit-scrollbar{display:none}
${D} .ae-pl{--w:64px;position:relative;flex:0 0 var(--w);width:var(--w);min-width:0;margin:0;padding:12px 0 10px;border:0;border-radius:0;
  background:transparent;color:var(--rs-mute);cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px;overflow:hidden;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation}
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
    linear-gradient(90deg,rgba(var(--rs-pink-rgb),.30),transparent 16%,transparent 84%,rgba(var(--rs-pink-rgb),.30)),
    linear-gradient(180deg,rgba(var(--rs-pink-rgb),.26),rgba(var(--rs-pink-rgb),.06) 55%,rgba(var(--rs-cyan-rgb),.10)),
    repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 1px,transparent 1px 4px);
  box-shadow:inset 1px 0 0 var(--rs-pink),inset -1px 0 0 var(--rs-pink),inset 0 2px 0 rgba(var(--rs-pink-rgb),.9);
  animation:ae-rs-lit .36s ease-out}
${D} .ae-pl[data-active] .ae-pl-no{color:var(--rs-gold)}
${D} .ae-pl[data-active] .ae-pl-ico{width:26px;height:26px;transform:translateY(2px);filter:drop-shadow(0 0 5px rgba(var(--rs-pink-rgb),.85))}
/* desktop: pillars share the full width (few pillars no longer leave an empty right half) */
@media (min-width:761px){
  ${D} .ae-pl{flex:1 1 var(--w);max-width:150px}
  ${D} .ae-pl[data-active]{flex:2.6 1 var(--w);max-width:300px}
  ${D} .ae-st-pillars{justify-content:center}
  ${D} .ae-pl-zh{font-size:15px}
}

${D} .ae-pl[data-active] .ae-pl-en{opacity:.9;transform:none}
@keyframes ae-rs-lit{0%{opacity:.58}32%{opacity:1}56%{opacity:.82}100%{opacity:1}}

/* ---------- page: 鸣潮 data bars — name left, control right ---------- */
${OPT}{flex:1;min-height:0;overflow:auto !important;overscroll-behavior:contain;contain:content;padding:18px 22px 28px !important;scrollbar-width:thin;scrollbar-color:rgba(var(--rs-pink-rgb),.35) transparent}
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
  background:rgba(0,0,0,.4) !important;box-shadow:inset 0 0 8px rgba(0,0,0,.6) !important;touch-action:manipulation}
${OPT} button:is(.re-setting-switch).is-on{border-color:var(--rs-pink) !important;background:linear-gradient(90deg,rgba(var(--rs-pink-rgb),.95),#ffb0dc) !important;box-shadow:0 0 12px rgba(var(--rs-pink-rgb),.5) !important}
${OPT} button:is(.re-setting-switch)::after{content:"" !important;position:absolute !important;top:50% !important;left:8px !important;width:10px !important;height:10px !important;margin-top:-5px;
  transform:translate3d(0,0,0) rotate(45deg) !important;border-radius:1px !important;background:var(--rs-mute) !important;box-shadow:none !important;transition:transform .18s cubic-bezier(.2,.8,.2,1),background-color .18s}
${OPT} button:is(.re-setting-switch).is-on::after{transform:translate3d(28px,0,0) rotate(45deg) !important;background:#fff !important;box-shadow:0 0 6px #fff !important}
${OPT} button:is(.re-setting-switch) > *{display:none !important}
${OPT} .re-setting-state{font:700 9px/1 var(--rs-data) !important;letter-spacing:1px;color:var(--rs-gold) !important}

/* ---------- controls ---------- */
${OPT} :is(button,select,input,a,[role="button"],[role="switch"],[role="tab"]){touch-action:manipulation;-webkit-tap-highlight-color:transparent}
/* dropdown: a value plate with a pink diamond and an under-glow (鸣潮 设置下拉) */
${OPT} button:is([class*="_selector"],[aria-haspopup="listbox"],[aria-haspopup="menu"]){position:relative;height:36px !important;min-height:36px;padding:0 12px 0 24px !important;gap:8px;
  border-radius:3px !important;clip-path:none !important;border:1px solid rgba(170,160,255,.24) !important;
  background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(0,0,0,.30)) !important;
  box-shadow:inset 0 -2px 0 rgba(var(--rs-pink-rgb),.6),0 2px 10px rgba(0,0,0,.35) !important;color:var(--rs-text) !important;font-weight:600 !important;letter-spacing:.5px}
${OPT} button:is([class*="_selector"],[aria-haspopup="listbox"],[aria-haspopup="menu"])::before{content:"";position:absolute;left:10px;top:50%;width:5px;height:5px;margin-top:-2.5px;transform:rotate(45deg);background:var(--rs-pink);box-shadow:0 0 6px var(--rs-pink)}
${OPT} button:is([class*="_selector"],[aria-haspopup="listbox"],[aria-haspopup="menu"]) svg{color:var(--rs-pink) !important}
${OPT} button:is([class*="_selector"],[aria-haspopup="listbox"],[aria-haspopup="menu"]):is(:hover,[aria-expanded="true"]){border-color:rgba(var(--rs-pink-rgb),.7) !important;
  box-shadow:inset 0 -2px 0 var(--rs-pink),0 0 14px rgba(var(--rs-pink-rgb),.3) !important}
/* switch: OFF / ON track with a diamond thumb (GPU-composited transform) */
${OPT} button[role="switch"][class*="_switch_"]{position:relative;flex:none !important;justify-self:end;width:56px !important;min-width:56px !important;max-width:56px !important;height:26px !important;padding:0 !important;
  border-radius:3px !important;border:1px solid rgba(170,160,255,.32) !important;overflow:hidden;cursor:pointer;
  background:repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 2px,transparent 2px 5px),rgba(0,0,0,.4) !important;box-shadow:inset 0 0 8px rgba(0,0,0,.6) !important;transition:background-color .18s,border-color .18s}
${OPT} button[role="switch"][class*="_switch_"]::after{content:"OFF";position:absolute;right:7px;top:50%;transform:translateY(-50%);font:700 8px/1 var(--rs-data);letter-spacing:1px;color:var(--rs-dim)}
${OPT} button[role="switch"][class*="_switch_"] > *{position:absolute !important;left:7px !important;top:50% !important;width:10px !important;height:10px !important;margin:-5px 0 0 !important;
  rotate:none !important;transform:translate3d(0,0,0) rotate(45deg) !important;border-radius:1px !important;background:var(--rs-mute) !important;box-shadow:none !important;
  transition:transform .18s cubic-bezier(.2,.8,.2,1),background-color .18s;will-change:transform}
${OPT} button[role="switch"][class*="_switch_"][aria-checked="true"]{border-color:var(--rs-pink) !important;
  background:linear-gradient(90deg,rgba(var(--rs-pink-rgb),.95),#ffb0dc) !important;box-shadow:0 0 12px rgba(var(--rs-pink-rgb),.5),inset 0 1px 0 rgba(255,255,255,.5) !important}
${OPT} button[role="switch"][class*="_switch_"][aria-checked="true"]::after{content:"ON";right:auto;left:8px;color:#3a0c26}
${OPT} button[role="switch"][class*="_switch_"][aria-checked="true"] > *{left:7px !important;transform:translate3d(30px,0,0) rotate(45deg) !important;background:#fff !important;box-shadow:0 0 6px #fff !important}
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
${D} .ae-st-foot{grid-column:1;grid-row:4;position:relative;display:flex;align-items:center;gap:10px;height:60px;padding:0 14px calc(env(safe-area-inset-bottom,0px));
  border-top:1px solid var(--rs-line);background:linear-gradient(0deg,rgba(0,0,0,.30),rgba(0,0,0,.08))}
${D} .ae-st-progress{position:absolute;left:0;right:0;top:-1px;height:2px;overflow:hidden;background:rgba(255,255,255,.04);pointer-events:none}
${D} .ae-st-progress::after{content:"";position:absolute;top:0;left:0;height:2px;width:calc(100% / var(--n,1));transform:translateX(calc(100% * var(--a,0)));
  background:linear-gradient(90deg,transparent,var(--rs-pink),transparent);box-shadow:0 0 8px var(--rs-pink);transition:transform .18s ease-out}
${D} .ae-st-tabs{flex:1;display:flex;justify-content:center;gap:6px;min-width:0}
${D} .ae-st-foot:not([data-split]) .ae-st-tabs{visibility:hidden}
${D} .ae-st-tab{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:84px;height:44px;padding:6px 14px 0;border:0;background:transparent;cursor:pointer;
  color:var(--rs-dim);transition:color .2s,transform .2s;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
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
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:border-color .2s,color .2s,opacity .2s}
${D} .ae-st-arrow::before{content:"";position:absolute;left:50%;top:50%;width:8px;height:8px;border:solid currentColor;border-width:0 0 2px 2px;transform:translate(-30%,-50%) rotate(45deg)}
${D} .ae-st-arrow[data-dir="1"]::before{transform:translate(-70%,-50%) rotate(-135deg)}
${D} .ae-st-arrow:hover:not(:disabled){border-color:var(--rs-pink);color:var(--rs-pink)}
${D} .ae-st-arrow:disabled{opacity:.3;cursor:default}

/* ---------- page flips (original resonance scan / slide / bump + intensified original .ae-gl decrypt) ---------- */
${DA} .ae-st-beam{position:absolute;left:0;right:0;top:208px;bottom:60px;pointer-events:none;z-index:8;opacity:0}
/* lightweight open: crisp quick beam sweep without heavy boot clone */
${DA}[data-ae-flip="open"] .ae-st-beam{opacity:1;animation:ae-rs-open-beam .22s ease-out both;
  background:linear-gradient(180deg,transparent,rgba(var(--rs-cyan-rgb),.45) 35%,#fff 50%,rgba(var(--rs-pink-rgb),.55) 65%,transparent) 0 0/100% 36px no-repeat}
@keyframes ae-rs-open-beam{from{transform:translate3d(0,0,0);opacity:.9}to{transform:translate3d(0,100%,0);opacity:0}}
/* scan: a resonance beam sweeps across, the page wipes in behind it */
${DA}[data-ae-flip][data-ae-fx="scan"] [class*="VOzbGW_options"]{animation:ae-rs-wipe-n .44s cubic-bezier(.3,.7,.2,1) both}
${DA}[data-ae-flip="prev"][data-ae-fx="scan"] [class*="VOzbGW_options"]{animation-name:ae-rs-wipe-p}
${DA}[data-ae-flip][data-ae-fx="scan"] .ae-st-beam{opacity:1;animation:ae-rs-beam-n .44s cubic-bezier(.3,.7,.2,1) both;
  background:linear-gradient(90deg,transparent calc(var(--x) - 70px),rgba(var(--rs-pink-rgb),.0) calc(var(--x) - 70px),rgba(var(--rs-pink-rgb),.24) calc(var(--x) - 6px),#fff var(--x),rgba(var(--rs-cyan-rgb),.55) calc(var(--x) + 2px),transparent calc(var(--x) + 18px))}
${DA}[data-ae-flip="prev"][data-ae-fx="scan"] .ae-st-beam{animation-name:ae-rs-beam-p;
  background:linear-gradient(270deg,transparent calc(var(--x) - 70px),rgba(var(--rs-pink-rgb),.24) calc(var(--x) - 6px),#fff var(--x),rgba(var(--rs-cyan-rgb),.55) calc(var(--x) + 2px),transparent calc(var(--x) + 18px))}
@property --x{syntax:"<length-percentage>";inherits:false;initial-value:0%}
@keyframes ae-rs-beam-n{from{--x:0%}to{--x:calc(100% + 80px)}}
@keyframes ae-rs-beam-p{from{--x:0%}to{--x:calc(100% + 80px)}}
@keyframes ae-rs-wipe-n{from{clip-path:inset(0 100% 0 0);transform:translateX(18px);opacity:.4}to{clip-path:inset(0 0 0 0);transform:none;opacity:1}}
@keyframes ae-rs-wipe-p{from{clip-path:inset(0 0 0 100%);transform:translateX(-18px);opacity:.4}to{clip-path:inset(0 0 0 0);transform:none;opacity:1}}
/* scene change (系统 ↔ 模组): pillars drop in staggered */
${DA}[data-ae-flip="scene"] .ae-pl{animation:ae-rs-drop .42s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--i,0) * 32ms)}
@keyframes ae-rs-drop{from{transform:translateY(-26px);opacity:0}to{transform:none;opacity:1}}
/* glitch-lite fallback */
${DA}[data-ae-flip][data-ae-fx="glitch-lite"] [class*="VOzbGW_options"]{animation:ae-rs-glitch .5s steps(1) both}
@keyframes ae-rs-glitch{
  0%{opacity:0;clip-path:inset(0 0 100% 0)}
  12%{opacity:1;clip-path:inset(10% 0 62% 0);transform:translateX(-18px);filter:drop-shadow(4px 0 rgba(var(--rs-pink-rgb),.95)) drop-shadow(-4px 0 rgba(var(--rs-cyan-rgb),.95))}
  28%{clip-path:inset(48% 0 20% 0);transform:translateX(14px)}
  44%{clip-path:inset(0 0 40% 0);transform:translateX(-9px)}
  60%{clip-path:inset(30% 0 0 0);transform:translateX(6px);filter:drop-shadow(3px 0 rgba(var(--rs-pink-rgb),.75))}
  76%{clip-path:inset(0);transform:none;filter:none}
  100%{clip-path:inset(0);transform:none;filter:none;opacity:1}}
/* slide: plain page slide */
${DA}[data-ae-flip="next"][data-ae-fx="slide"] [class*="VOzbGW_options"]{animation:ae-rs-slide-n .28s cubic-bezier(.2,.8,.2,1) both}
${DA}[data-ae-flip="prev"][data-ae-fx="slide"] [class*="VOzbGW_options"]{animation:ae-rs-slide-p .28s cubic-bezier(.2,.8,.2,1) both}
@keyframes ae-rs-slide-n{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}
@keyframes ae-rs-slide-p{from{transform:translateX(-40px);opacity:0}to{transform:none;opacity:1}}
/* edge bump when there is no further page */
${DA}[data-ae-bump="end"] [class*="VOzbGW_options"]{animation:ae-rs-bump-e .32s ease-out}
${DA}[data-ae-bump="start"] [class*="VOzbGW_options"]{animation:ae-rs-bump-s .32s ease-out}
@keyframes ae-rs-bump-e{40%{transform:translateX(-10px)}}
@keyframes ae-rs-bump-s{40%{transform:translateX(10px)}}
/* ---------- original glitch / decrypt page turn (intensified) ---------- */
${DA} .ae-gl{position:absolute;z-index:30;pointer-events:none;overflow:hidden;contain:strict;
  background:rgba(var(--rs-ink-rgb,10,11,26),.95);animation:ae-gl-host var(--ae-gl-dur,.58s) linear both}
${DA} .ae-gl-inner{position:absolute;inset:0;margin:0 !important;overflow:hidden !important;pointer-events:none !important;
  animation:none !important;transform:none !important}
${DA} .ae-gl-inner[data-gl="base"]{opacity:1;filter:contrast(1.18) saturate(1.3);
  text-shadow:3px 0 rgba(var(--ae-pink-rgb),.88),-3px 0 rgba(var(--ae-cyan-rgb),.88),0 0 8px rgba(var(--ae-cyan-rgb),.45)}
${DA} .ae-gl-inner[data-gl="split-a"]{opacity:1;mix-blend-mode:screen;color:#ff4fbf !important;
  background:rgba(var(--ae-pink-rgb),.20) !important;text-shadow:0 0 7px #ff4fbf}
${DA} .ae-gl-inner[data-gl="split-b"]{opacity:1;mix-blend-mode:screen;color:#4fe6ff !important;
  background:rgba(var(--ae-cyan-rgb),.20) !important;text-shadow:0 0 7px #4fe6ff}
${DA} .ae-gl-inner *{color:inherit !important;border-color:currentColor !important;background-image:none !important}
${DA} .ae-gl-noise{position:absolute;inset:0;mix-blend-mode:screen}
${DA} .ae-gl-noise i{position:absolute;display:block;opacity:0;background:var(--c);
  box-shadow:0 0 8px var(--c);image-rendering:pixelated}
${DA} .ae-gl-tear{position:absolute;inset:0;
  background:repeating-linear-gradient(0deg,rgba(0,0,0,0) 0 2px,rgba(var(--ae-pink-rgb),.46) 2px 3px,rgba(0,0,0,0) 3px 7px,rgba(var(--ae-cyan-rgb),.24) 7px 8px);
  mix-blend-mode:screen;animation:ae-gl-tear var(--ae-gl-dur,.58s) steps(8) both}
${DA} .ae-gl[data-dir="prev"] .ae-gl-tear{animation-name:ae-gl-tear-p}
${DA} .ae-gl-beam{position:absolute;left:0;right:0;height:4px;top:0;
  background:linear-gradient(90deg,transparent,rgba(var(--ae-cyan-rgb),.98) 18%,#fff 50%,rgba(var(--ae-pink-rgb),.98) 82%,transparent);
  box-shadow:0 0 16px 3px rgba(var(--ae-pink-rgb),.8),0 0 5px #fff;animation:ae-gl-beam var(--ae-gl-dur,.58s) cubic-bezier(.5,0,.3,1) both}
${DA} .ae-gl[data-dir="prev"] .ae-gl-beam{animation-name:ae-gl-beam-p}
${DA} .ae-gl[data-boot]{animation-name:ae-gl-boot}
${DA} .ae-gl[data-boot] .ae-gl-beam{height:5px;animation-name:ae-gl-boot-beam}
${DA}[data-ae-flip][data-ae-fx="glitch"] [class*="VOzbGW_options"]:not(.ae-gl-inner){animation:ae-gl-in var(--ae-gl-dur,.66s) steps(1) both}
${DA}[data-ae-flip][data-ae-fx="glitch"] .ae-pl[data-active],
${DA}[data-ae-flip][data-ae-fx="glitch"] .ae-st-title,
${DA}[data-ae-flip][data-ae-fx="glitch"] .ae-st-count{animation:ae-gl-chrome var(--ae-gl-dur,.66s) steps(1) both}
${DA}[data-ae-flip="scene"][data-ae-fx="glitch"] .ae-st-head,
${DA}[data-ae-flip="scene"][data-ae-fx="glitch"] .ae-st-foot{animation:ae-gl-chrome var(--ae-gl-dur,.78s) steps(1) both}
${DA}[data-ae-flip="scene"][data-ae-fx="glitch"] .ae-pl{animation:ae-gl-pill var(--ae-gl-dur,.78s) steps(1) both;animation-delay:calc(var(--i,0) * 24ms)}
@keyframes ae-gl-host{0%,84%{opacity:1}100%{opacity:0}}
@keyframes ae-gl-boot{0%{opacity:1;clip-path:inset(49.2% 0 49.2% 0)}9%{clip-path:inset(49.2% 0 49.2% 0);filter:brightness(3)}
  18%{clip-path:inset(0 0 0 0);filter:brightness(1.85)}26%{filter:none}86%{opacity:1}100%{opacity:0;clip-path:inset(0)}}
@keyframes ae-gl-tear{0%{opacity:.95;translate:0 -20px}30%{opacity:1;translate:0 12px}60%{opacity:.72;translate:0 -8px}100%{opacity:0;translate:0 0}}
@keyframes ae-gl-tear-p{0%{opacity:.95;translate:0 20px}30%{opacity:1;translate:0 -12px}60%{opacity:.72;translate:0 8px}100%{opacity:0;translate:0 0}}
@keyframes ae-gl-beam{0%{top:0;opacity:1}82%{opacity:1}100%{top:100%;opacity:0}}
@keyframes ae-gl-beam-p{0%{top:100%;opacity:1}82%{opacity:1}100%{top:0;opacity:0}}
@keyframes ae-gl-boot-beam{0%,8%{top:50%;opacity:1;transform:scaleX(.05)}16%{transform:scaleX(1)}22%{top:0}82%{opacity:1}100%{top:100%;opacity:0}}
@keyframes ae-gl-in{0%,80%{opacity:0}81%{opacity:1;translate:-6px 0}88%{translate:4px 0}94%{translate:-2px 0}100%{opacity:1;translate:0 0}}
@keyframes ae-gl-chrome{0%{opacity:.32;translate:-7px 0}14%{opacity:1;translate:6px 0}28%{opacity:.45;translate:-4px 0}42%{opacity:1;translate:2px 0}
  56%{opacity:.72}68%,100%{opacity:1;translate:0 0}}
@keyframes ae-gl-pill{0%{opacity:0;translate:0 -12px}20%{opacity:1;translate:4px 0}35%{opacity:.4;translate:-4px 0}52%,100%{opacity:1;translate:0 0}}
@media (prefers-reduced-motion:reduce){
  ${DA}[data-ae-flip] *,${DA} .ae-pl,${DA} .ae-pl *,${DA} .ae-st-progress::after,${OA} [class*="VOzbGW_mask"]{animation:none !important;transition:none !important}
  ${DA} .ae-gl{display:none !important}
}

/* pause background infinite animations whenever settings modal covers the app */
body[data-ae-settings-open] #aemeath-bg .ae-star,
body[data-ae-settings-open] .ae-doll,
body[data-ae-settings-open] .re-effort-knob,
body[data-ae-settings-open] .re-effort-track,
body[data-ae-settings-open] [data-chat-running] *,
body[data-ae-settings-open] [data-disclosure-row] *,
body[data-ae-settings-open] [data-chat-flow-kind="assistant-step"]::after{animation-play-state:paused !important}

/* ---------- phone: full-screen deck ---------- */
@media (max-width:760px){
  ${O} [class*="VOzbGW_mask"]{background:#0a0b1a !important;-webkit-backdrop-filter:none !important;backdrop-filter:none !important;animation:none}
  ${D}[data-ae-deck]{width:100vw !important;height:100dvh !important;border:0 !important;border-radius:0 !important;box-shadow:none !important;
    padding-top:env(safe-area-inset-top,0px) !important}
  ${D}[data-ae-deck]::before{top:calc(env(safe-area-inset-top,0px) + 6px)}
  ${D} .ae-st-head{height:52px;padding:0 56px}
  ${D}[data-ae-deck] > nav[class*="VOzbGW_nav"]{top:env(safe-area-inset-top,0px) !important;height:52px !important;right:8px !important}
  ${D}[data-ae-deck] > [class*="VOzbGW_header"],
  ${D}[data-ae-deck] > [class*="VOzbGW_content"] > [class*="VOzbGW_header"]{top:env(safe-area-inset-top,0px) !important;height:52px !important;right:8px !important}
  ${D}[data-ae-deck] [class*="VOzbGW_close"]{width:40px !important;min-width:40px !important;height:40px !important}
  ${D}[data-ae-deck] [class*="VOzbGW_actions"]{display:none !important}
  ${D} .ae-st-title b{font-size:18px;letter-spacing:3px}
  ${D} .ae-st-pillars{height:128px;padding:0 4px;scroll-snap-type:x proximity}
  ${D} .ae-pl{--w:52px;gap:6px;padding-top:10px;scroll-snap-align:center}
  ${D} .ae-pl-zh{font-size:13px;max-height:62px}
  ${D} .ae-pl[data-active]{--w:132px}
  ${D} .ae-pl[data-active] .ae-pl-full{font-size:18px}
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


};
modules["settings-deck.js"] = function(require, module, exports) {
"use strict";
const store = require('./store.js');
const ICONS = require('./icons.js');

const CELL_SEL = '[class*="VOzbGW_navCell"]';
const EN = {
  account: 'ACCOUNT', general: 'GENERAL', models: 'MODELS', plugins: 'BUILT-IN',
  'agent-presets': 'PRESETS', 'archived-sessions': 'ARCHIVE', 'aemeath-theme': 'AEMEATH',
};
const ICON_BY_ID = {
  account: 'user', general: 'sliders', models: 'robot', plugins: 'androids', 'agent-presets': 'users',
  'archived-sessions': 'book', 'aemeath-theme': 'heart',
};
const ICON_BY_WORD = [
  [/thinking|effort|reason/, 'sparkle'], [/subscri|codex|cursor|account|usage-pill/, 'cloud'],
  [/token|usage|stats/, 'chart'], [/prompt|system-prompt|prep/, 'notes'], [/quarant|guard|shield/, 'shield'],
  [/image|nai|draw|wallpaper/, 'image'], [/market|store|shop/, 'home'], [/inject|plugin|module/, 'zap'],
  [/frame|video|hyper/, 'image'], [/pair|team|collab|session/, 'users'], [/kernel|claude|agent/, 'robot'],
  [/audio|voice|music/, 'wave'],
];
const SHORT = {
  account: '账号', general: '通用', models: '模型', plugins: '插件', 'agent-presets': '预设', 'archived-sessions': '归档',
  'aemeath-theme': '爱弥斯', 'thinking-effort': '档位', 'token-usage': '用量', 'prompt-prep': '预处理', 'system-prompt-patch': '提示词',
  'plugin-quarantine': '隔离', 'nai2api-image': '生图', market: '市场', 'super-injector-plugins': '注入', 'dsh-hyperframes': '视频',
  'session-pair': '协作', subscriptions: '订阅', 'claude-code-kernel': '内核', 'codex-subscription': 'Codex', 'cursor-subscription': 'Cursor',
};
const SCENES = {
  official: ['系统设置', 'SYSTEM · 星炬终端'], plugins: ['插件中心', 'MODULES · 声骸工坊'], all: ['设置', 'SETTINGS · 星炬终端'],
};
const pad2 = n => String(n).padStart(2, '0');
const DECK_STYLES = ['resonance', 'starlight'];
function enFor(id) {
  return EN[id] || id.replace(/^dsh-/, '').replace(/[-_.]+/g, ' ').toUpperCase().slice(0, 16) || 'MODULE';
}
function shortFor(id, label) {
  if (SHORT[id]) return SHORT[id];
  if (/^[\u3400-\u9fff]/.test(label)) return label.replace(/\s+/g, '').replace(/(设置|管理|与余额)$/, '').slice(0, 4);
  return (label.split(/\s+/)[0] || label).slice(0, 6);
}
const masks = new Map();
function maskFor(id, label) {
  const key = `${id} ${label}`.toLowerCase();
  const name = ICON_BY_ID[id] || ICON_BY_WORD.find(([re]) => re.test(key))?.[1] || 'echo';
  if (!masks.has(name)) {
    const body = (ICONS[name] || ICONS.echo).replace(/currentColor/g, '#000');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" shape-rendering="crispEdges">${body}</svg>`;
    masks.set(name, `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`);
  }
  return masks.get(name);
}
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
function button(cls, label) {
  const b = el('button', cls);
  b.type = 'button'; b.setAttribute('aria-label', label);
  return b;
}

// ---------------------------------------------------------------- original glitch (intensified + viewport-pruned)
const GLYPHS = '01<>[]{}/\\|_#@*&%$アイミス声骸共鸣频谱░▒█';
const NOISE = [
  'rgba(var(--ae-pink-rgb,255,105,183),.95)',
  'rgba(var(--ae-cyan-rgb,119,232,255),.94)',
  'rgba(255,255,255,.9)',
  'rgba(var(--ae-violet-rgb,142,114,255),.92)',
];
const rnd = (a, b) => a + Math.random() * (b - a);
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function collectTexts(root) {
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const items = [];
  let total = 0, n;
  while ((n = walk.nextNode())) {
    const v = n.nodeValue;
    if (v && v.trim()) {
      const orig = n.__aeOrig !== undefined ? n.__aeOrig : (n.__aeOrig = v);
      items.push({ node: n, orig });
      total += orig.length;
    }
  }
  return { items, total };
}

function scrambleCached(pack, progress) {
  const { items, total } = pack;
  if (!total) return;
  let budget = Math.floor(total * progress);
  for (let k = 0; k < items.length; k += 1) {
    const { node, orig } = items[k];
    if (budget >= orig.length) {
      budget -= orig.length;
      if (node.nodeValue !== orig) node.nodeValue = orig;
      continue;
    }
    let out = orig.slice(0, Math.max(0, budget));
    for (let i = Math.max(0, budget); i < orig.length; i += 1) {
      const ch = orig[i];
      out += (ch === ' ' || ch === '\n' || ch === '\t') ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    budget = 0;
    node.nodeValue = out;
  }
}

function restorePacks(packs) {
  for (const pack of packs) {
    for (const { node, orig } of pack.items) {
      node.nodeValue = orig;
      delete node.__aeOrig;
    }
  }
}

// Trim descendants strictly below the visible viewport bottom in the clone so
// off-screen rows never add layout/paint cost while visible layout stays 100% identical.
function cloneVisibleTarget(target, viewHeight) {
  const cutoff = target.scrollTop + viewHeight + 56;
  let liveContainer = target;
  let depth = 0;
  while (liveContainer.children.length === 1 && depth < 5) {
    liveContainer = liveContainer.children[0];
    depth += 1;
  }
  const liveKids = liveContainer.children;
  let pruneFrom = -1;
  for (let i = 0; i < liveKids.length; i += 1) {
    if (liveKids[i].offsetTop > cutoff) { pruneFrom = i; break; }
  }
  const copy = target.cloneNode(true);
  if (pruneFrom >= 0) {
    let copyContainer = copy;
    for (let d = 0; d < depth; d += 1) copyContainer = copyContainer.children[0];
    while (copyContainer.children.length > pruneFrom) {
      copyContainer.lastElementChild.remove();
    }
  }
  copy.classList.add('ae-gl-inner');
  for (const f of copy.querySelectorAll('input,button,textarea,select,a')) {
    f.tabIndex = -1;
    f.setAttribute('aria-hidden', 'true');
  }
  return copy;
}

function glitch(panel, kind) {
  if (reduced()) return true;
  const target = panel.querySelector('[class*="VOzbGW_options"]');
  if (!target) return false;
  const rect = target.getBoundingClientRect();
  if (!rect.width || !rect.height) return false;

  const base = cloneVisibleTarget(target, rect.height);
  if (base.querySelectorAll('*').length > 1100) return false;

  const boot = kind === 'scene';
  const DURATION = boot ? 700 : 580;
  const prect = panel.getBoundingClientRect();

  const host = el('div', 'ae-gl');
  host.setAttribute('data-dir', kind === 'prev' ? 'prev' : 'next');
  host.toggleAttribute('data-boot', boot);
  host.style.cssText = `left:${rect.left - prect.left}px;top:${rect.top - prect.top}px;width:${rect.width}px;height:${rect.height}px`;

  base.setAttribute('data-gl', 'base');
  const ghostA = base.cloneNode(true); ghostA.setAttribute('data-gl', 'split-a');
  const ghostB = base.cloneNode(true); ghostB.setAttribute('data-gl', 'split-b');

  const noise = el('div', 'ae-gl-noise');
  const blocks = [];
  const blockCount = boot ? 24 : 20;
  for (let i = 0; i < blockCount; i += 1) { const b = el('i'); noise.appendChild(b); blocks.push(b); }
  host.append(base, ghostA, ghostB, noise, el('div', 'ae-gl-tear'), el('div', 'ae-gl-beam'));
  panel.appendChild(host);
  for (const c of [base, ghostA, ghostB]) c.scrollTop = target.scrollTop;

  const basePack = collectTexts(base);
  const ghostAPack = collectTexts(ghostA);
  const ghostBPack = collectTexts(ghostB);
  // Pre-scramble the RGB split ghosts once with authentic GLYPHS; during the
  // 580ms tear they jump bands & offsets every step without 2x extra text shaping/reflow per frame.
  scrambleCached(ghostAPack, 0.18);
  scrambleCached(ghostBPack, 0.08);
  const chromeEls = boot
    ? [...panel.querySelectorAll('.ae-st-title, .ae-pl, .ae-st-count, .ae-st-crumb')]
    : [...panel.querySelectorAll('.ae-st-title, .ae-pl[data-active], .ae-st-count, .ae-st-crumb')];
  const chromePacks = chromeEls.map(collectTexts);

  panel.style.setProperty('--ae-gl-dur', `${DURATION}ms`);
  panel.setAttribute('data-ae-flip', kind);
  panel.setAttribute('data-ae-fx', 'glitch');

  const band = (node, sign, heat) => {
    const top = rnd(0, 76);
    const h = rnd(14, boot ? 52 : 46);
    node.style.clipPath = `inset(${top.toFixed(1)}% 0 ${Math.max(0, 100 - top - h).toFixed(1)}% 0)`;
    node.style.translate = `${(sign * rnd(10, boot ? 28 : 24) * heat).toFixed(1)}px ${(rnd(-4.5, 4.5) * heat).toFixed(1)}px`;
    node.style.opacity = String((0.72 + 0.28 * heat).toFixed(2));
  };

  const start = performance.now();
  let frame = -1;
  const finish = () => {
    cancelAnimationFrame(panel.__aeGlRaf);
    panel.__aeGlStop = null;
    restorePacks(chromePacks);
    host.remove();
    panel.removeAttribute('data-ae-flip');
    panel.removeAttribute('data-ae-fx');
    panel.style.removeProperty('--ae-gl-dur');
  };
  const tick = () => {
    const t = performance.now() - start;
    const p = Math.min(1, t / DURATION);
    const f = Math.floor(t / 50);
    if (f !== frame) {
      frame = f;
      const heat = Math.pow(1 - p, 1.15);
      const reveal = Math.max(0, Math.min(1, (p - (boot ? 0.26 : 0.24)) / 0.64));
      scrambleCached(basePack, reveal);
      const chromeReveal = Math.max(0, Math.min(1, (p - 0.16) / 0.68));
      for (const cp of chromePacks) scrambleCached(cp, chromeReveal);
      band(ghostA, -1, heat);
      band(ghostB, 1, heat);
      base.style.translate = Math.random() < 0.65 * heat
        ? `${(rnd(-14, 14) * heat).toFixed(1)}px ${(rnd(-2.5, 2.5) * heat).toFixed(1)}px`
        : '0 0';
      for (const b of blocks) {
        if (Math.random() < 0.78 * heat + 0.08) {
          b.style.cssText = `top:${rnd(0, 97).toFixed(1)}%;left:${rnd(-10, 88).toFixed(1)}%;width:${rnd(8, boot ? 68 : 62).toFixed(1)}%;`
            + `height:${rnd(2, boot ? 18 : 15).toFixed(1)}px;opacity:${(rnd(0.5, 1) * Math.max(heat, 0.2)).toFixed(2)};`
            + `--c:${NOISE[(Math.random() * NOISE.length) | 0]}`;
        } else b.style.opacity = '0';
      }
    }
    if (p < 1) panel.__aeGlRaf = requestAnimationFrame(tick);
    else finish();
  };
  panel.__aeGlStop = finish;
  tick();
  return true;
}

function flip(panel, kind) {
  const fx = store.get().settingsFlip || 'glitch';
  if (fx === 'none' || reduced()) return;
  if (panel.__aeGlStop) { try { panel.__aeGlStop(); } catch (e) { /* ignore */ } panel.__aeGlStop = null; }
  clearTimeout(panel.__aeFlipT);
  // Keep initial modal opening light so cold mount never stutters
  if (kind === 'open') {
    panel.removeAttribute('data-ae-fx');
    panel.removeAttribute('data-ae-flip');
    void panel.offsetWidth;
    panel.setAttribute('data-ae-flip', 'open');
    panel.__aeFlipT = setTimeout(() => panel.removeAttribute('data-ae-flip'), 240);
    return;
  }
  if (fx === 'glitch' && glitch(panel, kind)) return;
  panel.removeAttribute('data-ae-flip');
  void panel.offsetWidth;
  panel.setAttribute('data-ae-flip', kind);
  panel.setAttribute('data-ae-fx', fx === 'glitch' ? 'glitch-lite' : fx);
  panel.__aeFlipT = setTimeout(() => {
    panel.removeAttribute('data-ae-flip');
    panel.removeAttribute('data-ae-fx');
  }, 560);
}

function build(panel, openSettings) {
  const head = el('div', 'ae-st-head'), title = el('div', 'ae-st-title');
  const zh = el('b'), en = el('small');
  title.append(zh, en); head.append(el('span', 'ae-st-mark'), title);
  const strip = el('div', 'ae-st-pillars'); strip.setAttribute('role', 'tablist');
  const foot = el('div', 'ae-st-foot'), bar = el('div', 'ae-st-progress'), tabs = el('div', 'ae-st-tabs');
  const prev = button('ae-st-arrow', '上一页'), next = button('ae-st-arrow', '下一页');
  prev.dataset.dir = '-1'; next.dataset.dir = '1';
  for (const [mode, label, sub] of [['official', '系统', 'SYSTEM'], ['plugins', '模组', 'MODULES']]) {
    const b = button('ae-st-tab', label); b.dataset.mode = mode;
    b.append(el('b', '', label), el('small', '', sub));
    b.onclick = () => {
      if (panel.dataset.aeSettings === mode) return;
      openSettings(mode);
    };
    tabs.append(b);
  }
  const count = el('span', 'ae-st-count'), page = el('b'), total = el('i'); count.append(page, total);
  foot.append(bar, prev, tabs, count, next);
  const beam = el('div', 'ae-st-beam');
  const crumb = el('div', 'ae-st-crumb'), crIco = el('span', 'ae-cr-ico'), crText = el('div', 'ae-cr-text');
  const crName = el('b'), crSub = el('small');
  crText.append(crName, crSub); crumb.append(crIco, crText);
  panel.prepend(head, strip, crumb); panel.append(foot, beam); panel.setAttribute('data-ae-deck', '');
  const events = new AbortController();
  const s = {
    panel, head, strip, crumb, crIco, crName, crSub, foot, count, page, total, bar, tabs, prev, next, zh, en, beam,
    events, cells: [], active: -1, mode: '', sig: '', scrollFrame: 0, entered: false, modeFlip: false,
  };
  const step = dir => {
    const active = s.cells.findIndex(c => c.getAttribute('aria-current') === 'true');
    const dest = s.cells[active + dir];
    if (dest) dest.click();
    else if (!reduced()) {
      panel.removeAttribute('data-ae-bump');
      void panel.offsetWidth;
      panel.setAttribute('data-ae-bump', dir > 0 ? 'end' : 'start');
      clearTimeout(panel.__aeBumpT);
      panel.__aeBumpT = setTimeout(() => panel.removeAttribute('data-ae-bump'), 340);
    }
  };
  prev.onclick = () => step(-1); next.onclick = () => step(1);
  const optSel = '[class*="VOzbGW_options"]';
  let start = null;
  const opts = {passive: true, signal: events.signal};
  panel.addEventListener('touchstart', e => {
    start = null;
    if (!store.get().settingsSwipe || e.touches.length !== 1 || !e.target.closest(optSel) || e.target.closest('input,textarea,select,[contenteditable="true"],[role="slider"]')) return;
    start = {x:e.touches[0].clientX, y:e.touches[0].clientY, at:e.timeStamp, target:e.target};
  }, opts);
  panel.addEventListener('touchcancel', () => { start = null; }, opts);
  panel.addEventListener('touchend', e => {
    const from = start; start = null;
    if (!from || e.touches.length || e.timeStamp - from.at > 700) return;
    const t = e.changedTouches[0], dx = t.clientX - from.x, dy = t.clientY - from.y;
    if (Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    for (let n = from.target; n && !n.matches(optSel); n = n.parentElement) {
      if (n.scrollWidth > n.clientWidth + 4 && /^(auto|scroll)$/.test(getComputedStyle(n).overflowX)) return;
    }
    step(dx < 0 ? 1 : -1);
  }, opts);
  return s;
}

function create(openSettings) {
  let s = null;
  function clear() {
    if (!s) return;
    s.events.abort();
    if (s.panel.__aeGlStop) { try { s.panel.__aeGlStop(); } catch (e) { /* ignore */ } s.panel.__aeGlStop = null; }
    clearTimeout(s.panel.__aeFlipT); clearTimeout(s.panel.__aeBumpT); cancelAnimationFrame(s.scrollFrame);
    for (const n of [s.head, s.strip, s.crumb, s.foot, s.beam]) n.remove();
    s.panel.removeAttribute('data-ae-deck');
    s.panel.removeAttribute('data-ae-flip');
    s.panel.removeAttribute('data-ae-fx');
    s = null;
  }
  return function sync(panel) {
    const p = store.get();
    if (!panel || !p.settingsSkin || !DECK_STYLES.includes(p.settingsStyle)) { clear(); return; }
    if (s?.panel !== panel) { clear(); s = build(panel, openSettings); }
    const mode = panel.dataset.aeSettings || 'all';
    const cells = [...panel.querySelectorAll(CELL_SEL)].filter(c => mode === 'all' || c.dataset.aeGroup === mode);
    const labels = cells.map(c => (c.querySelector('[class*="VOzbGW_navLabel"]')?.textContent || c.textContent).trim());
    const sig = JSON.stringify(cells.map((c,i) => [c.dataset.aeSection, labels[i]]));
    const active = cells.findIndex(c => c.getAttribute('aria-current') === 'true');
    const modeChanged = s.mode !== mode, changed = modeChanged || sig !== s.sig;
    const previous = s.active;
    s.cells = cells; s.labels = labels;
    if (changed) {
      if (s.entered && modeChanged) s.modeFlip = true;
      s.sig = sig; s.mode = mode;
      s.strip.replaceChildren(...cells.map((c, i) => {
        const id = c.dataset.aeSection || '', label = labels[i], short = shortFor(id, label);
        const b = button('ae-pl', label); b.setAttribute('role', 'tab'); b.title = label;
        b.style.setProperty('--ico', maskFor(id,label)); b.style.setProperty('--i', String(i)); b.dataset.idx = String(i);
        const vt = el('span','ae-pl-zh', short); vt.toggleAttribute('data-latin', !/[\u3400-\u9fff]/.test(short));
        const en = enFor(id);
        b.append(el('span','ae-pl-no',pad2(i+1)), el('span','ae-pl-ico'), vt, el('span','ae-pl-full',label), el('span','ae-pl-en',en));
        b.onclick = () => { const cell = s?.cells?.[i]; if (cell && cell.getAttribute('aria-current') !== 'true') cell.click(); };
        return b;
      }));
      [s.zh.textContent, s.en.textContent] = SCENES[mode] || SCENES.all;
      s.bar.style.setProperty('--n', String(cells.length || 1)); s.total.textContent = `/ ${pad2(cells.length)}`;
      for (const t of s.tabs.children) t.toggleAttribute('data-active', t.dataset.mode === mode);
      s.foot.toggleAttribute('data-split', mode !== 'all');
    }
    const opening = document.documentElement.dataset.aeOpening;
    if (!changed && previous === active && !opening) return;
    s.active = active;
    const mark = i => { const b = s.strip.children[i]; if (b) { b.toggleAttribute('data-active', i === active); b.setAttribute('aria-selected', String(i === active)); } };
    if (changed) cells.forEach((_,i) => mark(i)); else { mark(previous); mark(active); }
    s.page.textContent = pad2(Math.max(0, active) + 1); s.bar.style.setProperty('--a', String(Math.max(0,active)));
    if (cells.length) {
      const ci = Math.max(0, active), cid = cells[ci].dataset.aeSection || '', clabel = labels[ci] || '';
      s.crName.textContent = clabel;
      s.crSub.replaceChildren(document.createTextNode(enFor(cid) + ' · '), el('i', '', pad2(ci + 1) + ' / ' + pad2(cells.length)));
      s.crIco.style.setProperty('--ico', maskFor(cid, clabel));
    }
    s.prev.disabled = active <= 0; s.next.disabled = active < 0 || active >= cells.length-1;
    if (opening && (opening !== mode || active < 0)) return;
    if (opening) document.documentElement.removeAttribute('data-ae-opening');
    if (active >= 0) {
      if (!s.entered) {
        s.entered = true;
        flip(panel, 'open');
      } else if (s.modeFlip || modeChanged) {
        s.modeFlip = false;
        flip(panel, 'scene');
      } else {
        flip(panel, active < previous ? 'prev' : 'next');
      }
      cancelAnimationFrame(s.scrollFrame);
      s.scrollFrame = requestAnimationFrame(() => {
        const pill = s.strip.children[active];
        if (pill && s.strip.scrollWidth > s.strip.clientWidth) {
          s.strip.scrollLeft = Math.max(0, pill.offsetLeft - (s.strip.clientWidth - pill.offsetWidth) / 2);
        }
        if (pill && s.strip.scrollHeight > s.strip.clientHeight + 2) {
          const top = pill.offsetTop, bottom = top + pill.offsetHeight, view = s.strip.scrollTop;
          if (top < view || bottom > view + s.strip.clientHeight) s.strip.scrollTop = Math.max(0, top - (s.strip.clientHeight - pill.offsetHeight) / 2);
        }
      });
    }
  };
}
module.exports = { create };


};
modules["settings-skin.js"] = function(require, module, exports) {
"use strict";
// Settings dialog skin for DeepSeek Harness 0.2.x.
//
// Two deck layouts share the DOM built by settings-deck.js:
//   - starlight 星辉·侧栏 (default): left icon rail + right glass cards on
//     desktop, a swipeable chip row + bottom pager on phones; 系统设置 is lit
//     pink, 插件中心 lilac.
//   - resonance 共鸣·频段柱: the row of tall pillars with scan-beam flips.
// 经典列表 (classic) keeps the stock nav, only recoloured by the global palette.
const { buildCss } = require('./settings-deck-css.js');
const { buildStarCss } = require('./settings-star-css.js');
const DECK_STYLES = ['resonance', 'starlight'];

function install(ctx, store) {
  const style = document.createElement('style');
  style.dataset.plugin = 'dsh-aemeath-theme';
  style.dataset.pluginCss = 'dsh-aemeath-theme/settings.css';
  style.textContent = buildCss() + buildStarCss();
  document.head.appendChild(style);

  const root = document.documentElement;
  const applyPrefs = (p) => {
    if (p.settingsSkin && DECK_STYLES.includes(p.settingsStyle)) root.setAttribute('data-ae-set-style', p.settingsStyle);
    else root.removeAttribute('data-ae-set-style');
    style.disabled = !p.settingsSkin;
  };
  applyPrefs(store.get());
  const off = store.subscribe(applyPrefs);

  return () => { off(); style.remove(); root.removeAttribute('data-ae-set-style'); };
}

module.exports = { install, buildCss, DECK_STYLES };

};
modules["settings-split.js"] = function(require, module, exports) {
"use strict";
// Split the one shipped Settings dialog into two entrances:
//   - 系统设置 (official): sections shipped by DeepSeek Harness itself
//   - 插件中心 (plugins):  every section a third-party plugin registered
// Both open the SAME shell-owned dialog (no forked copy of official UI). When
// it opens we stamp `data-ae-settings="official|plugins"` on the panel; CSS
// then hides the other group's nav cells, and we jump to the first section of
// the requested group so the right page is showing.
//
// Classification is by section id. The official ids are the ones the shipped
// 0.2.x client packages register (settings-account / -general / -models /
// -plugins / agent-preset); everything else is a plugin page.
const store = require('./store.js');

const OFFICIAL_IDS = ['account', 'general', 'models', 'plugins', 'agent-presets', 'archived-sessions'];
const PANEL_SEL = '[data-shortcut-modal="settings"]';

let pendingMode = null;      // mode requested by our own buttons
let currentMode = 'official';
let liveCtx = null;

/** Ordered settings sections from the live slot ledger. */
function sections(ctx) {
  try {
    return ctx.slots.entries('settings.section')
      .map((e) => ({ id: e.options.id || '', order: e.options.order ?? 0, label: labelOf(e.options.label) }))
      .sort((a, b) => a.order - b.order);
  } catch (err) {
    console.warn('[aemeath-theme] settings sections unavailable', err);
    return [];
  }
}
function shellActions(ctx) {
  try {
    const entry = ctx?.slots?.entries?.('sidebar.settings')?.[0];
    return entry?.options?.store?.create?.()?.actions || null;
  } catch {
    return null;
  }
}
function firstSectionId(ctx, mode) {
  const list = sections(ctx).filter((s) => s.id);
  if (!list.length) return '';
  if (mode === 'all') return list[0].id;
  const wantOfficial = mode !== 'plugins';
  return (list.find((s) => isOfficial(s.id) === wantOfficial) || list[0]).id;
}
function labelOf(l) {
  try { return typeof l === 'function' ? String(l() || '') : String(l || ''); } catch { return ''; }
}
function isOfficial(id) { return OFFICIAL_IDS.includes(id); }

/** Mark each nav cell with its group, from the label -> id mapping. */
function tagCells(ctx, panel) {
  const byLabel = new Map();
  for (const s of sections(ctx)) if (s.label) byLabel.set(s.label.trim(), s.id);
  const cells = panel.querySelectorAll('[class*="VOzbGW_navCell"]');
  let shown = 0;
  for (const cell of cells) {
    const label = (cell.querySelector('[class*="VOzbGW_navLabel"]')?.textContent || cell.textContent || '').trim();
    const id = byLabel.get(label);
    const group = id !== undefined && isOfficial(id) ? 'official' : 'plugins';
    if (cell.getAttribute('data-ae-group') !== group) cell.setAttribute('data-ae-group', group);
    if (id && cell.getAttribute('data-ae-section') !== id) cell.setAttribute('data-ae-section', id);
    if (group === currentMode) shown++;
  }
  if (panel.dataset.aeCount !== String(shown)) panel.dataset.aeCount = String(shown);
}

/** Click the first nav cell of `mode` unless the active one already belongs to it. */
function focusGroup(panel, mode) {
  const active = panel.querySelector('[class*="VOzbGW_navCell"][aria-current="true"]');
  if (active && active.getAttribute('data-ae-group') === mode) return;
  const first = panel.querySelector(`[class*="VOzbGW_navCell"][data-ae-group="${mode}"]`);
  if (first) first.click();
}

function install(ctx, syncDeck) {
  liveCtx = ctx;
  let panel = null;
  const sync = (tag, focus) => {
    const p = store.get();
    if (panel) {
      if (p.settingsSplit) {
        if (panel.dataset.aeSettings !== currentMode) panel.dataset.aeSettings = currentMode;
        if (tag) tagCells(ctx, panel);
        if (focus) focusGroup(panel, currentMode);
      } else {
        panel.removeAttribute('data-ae-settings');
        setOpening(null);
      }
      if (!p.settingsSkin || !['resonance', 'starlight'].includes(p.settingsStyle)) setOpening(null);
    }
    syncDeck(panel);
  };
  const navChanges = new MutationObserver(records => {
    const regroup = records.some(r => r.type !== 'attributes' || r.attributeName === 'data-ae-settings');
    sync(regroup, regroup);
  });
  const bind = next => {
    if (next === panel) return;
    navChanges.disconnect();
    panel = next;
    document.body.toggleAttribute('data-ae-settings-open', !!panel);
    if (panel) {
      currentMode = pendingMode || 'official'; pendingMode = null;
      const nav = panel.querySelector('nav');
      if (nav) navChanges.observe(nav, {childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:['aria-current']});
      navChanges.observe(panel, {attributes:true, attributeFilter:['data-ae-settings']});
    } else setOpening(null);
    sync(true, true);
  };
  const menu = node => {
    if (store.get().settingsSplit) for (const item of node.querySelectorAll('[role="menuitem"]')) {
      if (/^(设置|Settings)$/i.test(item.textContent.trim())) item.dataset.aeDup = 'settings';
    }
  };
  // The shell portals both the settings overlay and account menu directly into body.
  const portals = new MutationObserver(records => {
    if (panel && !panel.isConnected) bind(null);
    for (const r of records) for (const n of r.addedNodes) if (n.nodeType === 1 && n.isConnected) {
      if (n.matches('[class*="VOzbGW_overlay"]')) bind(n.querySelector(PANEL_SEL));
      else menu(n);
    }
  });
  portals.observe(document.body, {childList:true});
  bind(document.querySelector(PANEL_SEL));
  const prefsKey = p => `${p.settingsSplit}|${p.settingsSkin}|${p.settingsStyle}`;
  let last = prefsKey(store.get());
  const off = store.subscribe(p => {
    const key = prefsKey(p);
    if (key === last) return;
    last = key; sync(true, true);
    for (const item of document.querySelectorAll('[data-ae-dup="settings"]')) item.removeAttribute('data-ae-dup');
    for (const m of document.querySelectorAll('[role="menu"]')) menu(m);
  });
  return () => {
    if (liveCtx === ctx) liveCtx = null;
    off(); portals.disconnect(); navChanges.disconnect(); syncDeck(null); setOpening(null);
    panel?.removeAttribute('data-ae-settings');
    document.body.removeAttribute('data-ae-settings-open');
    for (const item of document.querySelectorAll('[data-ae-dup="settings"]')) item.removeAttribute('data-ae-dup');
  };
}

/**
 * Open the settings dialog in `mode`. Prefer the official sidebar.settings
 * shell store (`openSection` / `open`) so opening never mounts the account
 * dropdown menu or renders a throwaway default section first; fall back to the
 * launcher DOM route only if the store handle is absent.
 */
let openingTimer = 0;
function setOpening(mode) {
  const root = document.documentElement;
  clearTimeout(openingTimer);
  if (!mode) { root.removeAttribute('data-ae-opening'); return; }
  root.setAttribute('data-ae-opening', mode);
  openingTimer = setTimeout(() => root.removeAttribute('data-ae-opening'), 1800);
}

function openSettings(mode) {
  const split = !!store.get().settingsSplit;
  const actions = shellActions(liveCtx);
  const panel = document.querySelector(PANEL_SEL);
  if (panel) {
    currentMode = mode;
    if (split) panel.setAttribute('data-ae-settings', mode);
    const active = panel.querySelector('[class*="VOzbGW_navCell"][aria-current="true"]');
    if (!split || (active && active.getAttribute('data-ae-group') === mode)) return;
    const targetId = firstSectionId(liveCtx, mode);
    if (actions?.select && targetId) { actions.select(targetId); return; }
    focusGroup(panel, mode);
    return;
  }
  pendingMode = mode;
  if (actions) {
    const targetId = split ? firstSectionId(liveCtx, mode) : '';
    if (targetId && typeof actions.openSection === 'function') {
      actions.openSection(targetId);
      return;
    }
    if (typeof actions.open === 'function') {
      if (split && mode === 'plugins') setOpening(mode);
      actions.open();
      return;
    }
  }
  const launcher = document.querySelector('button[aria-haspopup="menu"][class*="yHnPSG_trigger"]')
    || document.querySelector('button[aria-haspopup="dialog"][class*="VOzbGW_trigger"]');
  if (!launcher) { pendingMode = null; return; }
  setOpening(mode);
  if (launcher.getAttribute('aria-haspopup') === 'dialog') { launcher.click(); return; }
  launcher.click();
  let tries = 0;
  // Only the account menu's own row counts: the pet quick menu (#aemeath-dock) also
  // holds a 「主题设置」menuitem and stays in the DOM after its first use.
  const pick = () => {
    const items = [...document.querySelectorAll('[role="menuitem"]')]
      .filter((el) => !el.closest('#aemeath-dock'));
    const text = (el) => (el.textContent || '').trim();
    const item = items.find((el) => el.getAttribute('data-ae-dup') === 'settings' || /^(设置|Settings)$/i.test(text(el)))
      || items.find((el) => /^(设置|Settings)\b/i.test(text(el)));
    if (item) { item.click(); return; }
    if (++tries < 40) requestAnimationFrame(pick);
    else { pendingMode = null; setOpening(null); }
  };
  pick();
}

/** Two sidebar footer buttons: 系统设置 / 插件中心. */
function registerEntrances(ctx, React, ICONS) {
  const h = React.createElement;
  const icon = (name) => h('svg', {
    width: 18, height: 18, viewBox: '0 0 24 24', 'aria-hidden': 'true', shapeRendering: 'crispEdges',
    dangerouslySetInnerHTML: { __html: ICONS[name] || '' },
  });
  const make = (mode, label, glyph, sub) => function AeSettingsEntrance({ wide }) {
    const [on, setOn] = React.useState(!!store.get().settingsSplit);
    React.useEffect(() => store.subscribe((p) => setOn(!!p.settingsSplit)), []);
    if (!on) return null;
    return h('button', {
      type: 'button',
      className: 'ae-entrance',
      'data-ae-entrance': mode,
      'data-wide': wide ? 'true' : 'false',
      'aria-label': label,
      title: label,
      onClick: () => openSettings(mode),
    }, h('span', { className: 'ae-doll', 'data-doll': glyph, 'aria-hidden': 'true' }),
      wide ? h('span', { className: 'ae-entrance-text' },
        h('span', { className: 'ae-entrance-label' }, label),
        h('small', { className: 'ae-entrance-sub' }, sub)) : null);
  };
  const Official = make('official', '系统设置', 'cat', '黑猫管家');
  const Plugins = make('plugins', '插件中心', 'aemeath', '像素爱弥斯');
  ctx.slots.inject('sidebar.footer.action', () => [
    ctx.slots.register({ name: 'sidebar.footer.action', id: 'aemeath-settings-official', order: -20, label: '系统设置' }, Official),
    ctx.slots.register({ name: 'sidebar.footer.action', id: 'aemeath-settings-plugins', order: -19, label: '插件中心' }, Plugins),
  ]);
}

module.exports = { setOpening, install, openSettings, registerEntrances, OFFICIAL_IDS };


};
modules["settings-star-css.js"] = function(require, module, exports) {
"use strict";
// CSS for the 「星辉·侧栏」 settings layout (html[data-ae-set-style="starlight"]).
// It dresses the same DOM as the resonance deck (settings-deck.js inserts
// .ae-st-head / .ae-st-pillars / .ae-st-crumb / .ae-st-foot / .ae-st-beam):
// desktop = left icon rail + right content column of rounded glass cards;
// phone = swipeable chip row on top, 系统/模组 switch and pager at the thumb.
// 系统设置 is lit Aemeath pink, 插件中心 lilac, so the two entrances read as
// two rooms of the same terminal. Selectors are written with @TOKEN@ slots so
// the long sheet stays readable; buildStarCss() fills them in.
const { asset } = require('./assets.js');

const ROW = ':is([class$="_row"],[class*="_row "],[class$="_group"]:not(:has([class$="_row"])),[class$="_setting"],.re-setting-row)';
const TITLES = ':is([class*="Pt1bsG_title"],[class*="hVGvvW_title"],[class*="oY77xG_title"],[class*="T1PP_q_title"],[class*="bVCLcG_title"],[class*="_8HJdBW_title"],[class*="yIbyla_title"],[class*="iVn_pq_title"])';
const HEAD = ':is(h2,h3,[class$="_heading"],[class$="_groupHead"],[class$="_sectionTitle"])';
const SEL = 'button:is([class*="_selector"],[aria-haspopup="listbox"],[aria-haspopup="menu"])';
const SW = 'button[role="switch"][class*="_switch_"]';
const BTN2 = ':is(a,button):is([class*="secondary" i],[class*="linkButton"],[class*="addButton"],[class*="addModelButton"],[class*="nhfO0a_button"]):not([class*="primary" i])';
const CARDS = ':is([class*="LcmJYa_card"],[class*="LcmJYa_balanceCard"],[class*="zGbnIq_rowCard"],[class*="zGbnIq_setupCard"],[class*="zGbnIq_addPanel"],[class~="qSYn7G_card"],[class*="pbvGtq_cards"] > *)';
const RT = '[class*="rtSEdW_card"]:not([class*="rtSEdW_cardH"]):not([class*="rtSEdW_cardD"]):not([class*="rtSEdW_cardF"]):not([class*="rtSEdW_cardI"]):not([class*="rtSEdW_cardM"]):not([class*="rtSEdW_cardN"]):not([class*="rtSEdW_cardB"])';

const CSS = `
@RS@{
  --sl-ink:#0c0d20;--sl-ink2:#15162f;--sl-rail:248px;
  --sl-line:rgba(200,184,255,.11);--sl-line2:rgba(200,184,255,.22);
  --sl-text:#f2f0ff;--sl-mute:#a9abcf;--sl-dim:#6e7199;
  --sl-pink:#ff7cc4;--sl-pink-rgb:255,124,196;--sl-violet:#a98bff;--sl-violet-rgb:169,139,255;--sl-cyan:#7fe9ff;--sl-cyan-rgb:127,233,255;--sl-gold:#f3d9a4;
  --sl-acc:var(--sl-pink);--sl-acc-rgb:var(--sl-pink-rgb);--sl-acc2:var(--sl-violet);--sl-acc2-rgb:var(--sl-violet-rgb);
  --sl-r:14px;
  --sl-px:var(--ae-font-px,"AemeathPixel",ui-monospace,monospace);
  --sl-data:ui-monospace,"JetBrains Mono","SFMono-Regular",Menlo,monospace;
}
/* 插件中心 is lit lilac + cyan, 系统设置 keeps Aemeath pink + lilac */
@D@[data-ae-settings="plugins"]{--sl-acc:var(--sl-violet);--sl-acc-rgb:var(--sl-violet-rgb);--sl-acc2:var(--sl-cyan);--sl-acc2-rgb:var(--sl-cyan-rgb)}
@media (max-width:960px){@RS@{--sl-rail:220px}}

/* ========== backdrop ========== */
@O@ [class*="VOzbGW_mask"]{background:
  radial-gradient(70% 55% at 15% 0%,rgba(var(--sl-pink-rgb),.16),transparent 62%),
  radial-gradient(60% 50% at 100% 100%,rgba(var(--sl-violet-rgb),.14),transparent 66%),
  rgba(6,6,18,.74) !important;-webkit-backdrop-filter:blur(10px) saturate(.85) !important;backdrop-filter:blur(10px) saturate(.85) !important;animation:ae-sl-fade .24s ease-out both}
@keyframes ae-sl-fade{from{opacity:0}to{opacity:1}}

/* ========== panel: rail | crumb + content ========== */
@D@[data-ae-deck]{
  --dsw-alias-label-primary:var(--sl-text);--dsw-alias-label-secondary:var(--sl-mute);--dsw-alias-label-tertiary:var(--sl-dim);
  --dsw-alias-border-l1:var(--sl-line);--dsw-alias-border-l2:var(--sl-line);--dsw-alias-border-l3:var(--sl-line);--dsw-alias-border-l4:var(--sl-line2);
  --dsw-alias-interactive-bg-hover:rgba(var(--sl-acc-rgb),.08);--dsw-alias-brand-primary:var(--sl-acc);
  --dsw-alias-bg-layer-1:var(--sl-ink2);--dsw-alias-bg-layer-2:var(--sl-ink);--dsw-alias-bg-module-platform:rgba(var(--sl-acc-rgb),.12);
  display:grid !important;
  grid-template-areas:"head crumb hdr" "tabs opts opts" "rail opts opts" "pager opts opts" !important;
  grid-template-columns:var(--sl-rail) minmax(0,1fr) auto !important;
  grid-template-rows:68px auto minmax(0,1fr) 58px !important;
  width:min(1000px,calc(100vw - 48px)) !important;max-width:none !important;height:min(740px,calc(100dvh - 48px)) !important;max-height:none !important;
  padding:0 !important;overflow:hidden !important;position:relative;isolation:isolate;color:var(--sl-text) !important;
  border-radius:22px !important;border:1px solid var(--sl-line2) !important;clip-path:none !important;
  background:
    radial-gradient(1.5px 1.5px at 62% 18%,rgba(255,255,255,.55),transparent 70%),
    radial-gradient(1.5px 1.5px at 84% 46%,rgba(255,255,255,.38),transparent 70%),
    radial-gradient(2px 2px at 93% 12%,rgba(var(--sl-acc-rgb),.75),transparent 70%),
    radial-gradient(1.5px 1.5px at 72% 82%,rgba(255,255,255,.32),transparent 70%),
    radial-gradient(55% 42% at 0% 0%,rgba(var(--sl-acc-rgb),.18),transparent 70%),
    radial-gradient(50% 45% at 100% 100%,rgba(var(--sl-acc2-rgb),.12),transparent 70%),
    linear-gradient(90deg,rgba(5,5,18,.42) 0 var(--sl-rail),transparent var(--sl-rail)),
    linear-gradient(180deg,var(--sl-ink2),var(--sl-ink)) !important;
  box-shadow:0 0 0 1px rgba(0,0,0,.45),0 30px 90px rgba(0,0,0,.62),0 0 60px rgba(var(--sl-acc-rgb),.08),inset 0 1px 0 rgba(255,255,255,.07) !important;
  animation:ae-sl-open .26s cubic-bezier(.2,.8,.2,1) both}
@keyframes ae-sl-open{from{opacity:0;transform:translate3d(0,10px,0) scale(.985)}to{opacity:1;transform:none}}
@D@[data-ae-deck]::before{content:"";position:absolute;left:var(--sl-rail);top:0;bottom:0;width:1px;pointer-events:none;z-index:3;
  background:linear-gradient(180deg,transparent,var(--sl-line2) 14%,var(--sl-line2) 86%,transparent)}
@D@[data-ae-deck]::after{content:"";position:absolute;left:8%;right:8%;top:0;height:1px;pointer-events:none;z-index:3;
  background:linear-gradient(90deg,transparent,rgba(var(--sl-acc-rgb),.8),rgba(var(--sl-acc2-rgb),.6),transparent)}

/* host pieces: the shipped nav stays mounted (clicks are forwarded to it) */
@D@[data-ae-deck] > [class*="VOzbGW_navTitle"]{display:none !important}
@D@[data-ae-deck] > nav[class*="VOzbGW_nav"]{grid-area:auto !important;position:absolute !important;top:0 !important;right:14px !important;left:auto !important;bottom:auto !important;
  width:auto !important;height:68px !important;min-height:0 !important;padding:0 !important;margin:0 !important;border:0 !important;background:none !important;
  display:flex !important;flex-direction:row !important;align-items:center !important;z-index:7;overflow:visible !important;box-shadow:none !important;pointer-events:none !important}
@D@[data-ae-deck] > nav[class*="VOzbGW_nav"] > :not([class*="VOzbGW_header"]){display:none !important}
@D@[data-ae-deck] > nav[class*="VOzbGW_nav"] > [class*="VOzbGW_header"]{pointer-events:auto !important}
@D@[data-ae-deck] > [class*="VOzbGW_content"]{grid-area:opts !important;min-width:0 !important;min-height:0 !important;display:flex !important;flex-direction:column !important;position:static !important;overflow:hidden}
@D@[data-ae-deck] > [class*="VOzbGW_options"]{grid-area:opts !important;width:100% !important;min-width:0 !important;min-height:0 !important;box-sizing:border-box !important;position:static !important}
@D@[data-ae-deck] [class*="VOzbGW_header"]{width:auto !important;min-height:0 !important;padding:0 !important;border:0 !important;display:flex !important;align-items:center !important;gap:8px;background:none !important}
@D@[data-ae-deck] [class*="VOzbGW_header"]::before{content:none !important}
@D@[data-ae-deck] > [class*="VOzbGW_header"]{grid-area:hdr !important;position:relative !important;top:auto !important;right:auto !important;height:68px !important;
  padding:0 16px 0 6px !important;border-bottom:1px solid var(--sl-line) !important;z-index:7 !important}
@D@[data-ae-deck] > [class*="VOzbGW_content"] > [class*="VOzbGW_header"]{position:absolute !important;top:0 !important;right:14px !important;height:68px !important;z-index:7 !important}
@D@[data-ae-deck] [class*="VOzbGW_close"]{width:38px !important;min-width:38px !important;height:38px !important;flex:none !important;display:flex !important;align-items:center;justify-content:center;
  border-radius:50% !important;border:1px solid var(--sl-line2) !important;background:rgba(255,255,255,.05) !important;color:var(--sl-text) !important;clip-path:none !important;
  transition:border-color .2s,color .2s,box-shadow .2s,transform .25s}
@D@[data-ae-deck] [class*="VOzbGW_close"]:hover{border-color:var(--sl-acc) !important;color:var(--sl-acc) !important;box-shadow:0 0 14px rgba(var(--sl-acc-rgb),.35);transform:rotate(90deg)}
@D@[data-ae-deck] [class*="VOzbGW_actions"] button{border-radius:999px !important;border:1px solid var(--sl-line2) !important;background:rgba(255,255,255,.05) !important;
  color:var(--sl-mute) !important;font-size:12px !important;font-weight:600 !important;clip-path:none !important;height:32px;padding:0 12px !important}
@D@[data-ae-deck] [class*="VOzbGW_actions"] button:hover{border-color:rgba(var(--sl-acc-rgb),.6) !important;color:var(--sl-acc) !important}

/* ---------- head: emblem + scene title ---------- */
@D@ .ae-st-head{grid-area:head;position:relative;z-index:2;display:flex;align-items:center;gap:12px;min-width:0;height:68px;padding:0 18px;border-bottom:1px solid var(--sl-line)}
@D@ .ae-st-mark{width:34px;height:34px;flex:none;background:url("@EMBLEM@") center/contain no-repeat;filter:drop-shadow(0 0 8px rgba(var(--sl-acc-rgb),.55))}
@D@ .ae-st-title{display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-width:0;line-height:1}
@D@ .ae-st-title b{font:400 18px/1 var(--sl-px);letter-spacing:3px;color:var(--sl-text);text-shadow:0 0 12px rgba(var(--sl-acc-rgb),.45);white-space:nowrap}
@D@ .ae-st-title small{max-width:100%;font:600 9px/1 var(--sl-data);letter-spacing:1.5px;color:var(--sl-acc);opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* ---------- crumb: current page title + number ---------- */
@D@ .ae-st-crumb{grid-area:crumb;display:flex;align-items:center;gap:12px;min-width:0;height:68px;padding:0 8px 0 26px;border-bottom:1px solid var(--sl-line)}
@D@ .ae-cr-ico{position:relative;width:36px;height:36px;flex:none;border-radius:11px;
  background:linear-gradient(135deg,rgba(var(--sl-acc-rgb),.30),rgba(var(--sl-acc2-rgb),.18));box-shadow:inset 0 0 0 1px rgba(var(--sl-acc-rgb),.45),0 0 16px rgba(var(--sl-acc-rgb),.22)}
@D@ .ae-cr-ico::before{content:"";position:absolute;inset:8px;background:#fff;-webkit-mask:var(--ico) center/contain no-repeat;mask:var(--ico) center/contain no-repeat}
@D@ .ae-cr-text{display:flex;flex-direction:column;gap:6px;min-width:0}
@D@ .ae-cr-text b{font:400 19px/1.1 var(--sl-px);letter-spacing:2px;color:var(--sl-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@D@ .ae-cr-text small{font:600 9.5px/1 var(--sl-data);letter-spacing:1.5px;color:var(--sl-mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@D@ .ae-cr-text small i{font-style:normal;color:var(--sl-acc)}

/* ---------- scene switch: 系统 / 模组 segmented ---------- */
@D@ .ae-st-foot{display:contents}
@D@ .ae-st-tabs{grid-area:tabs;display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:14px 14px 8px;padding:4px;border-radius:14px;background:rgba(0,0,0,.28);box-shadow:inset 0 0 0 1px var(--sl-line)}
@D@ .ae-st-foot:not([data-split]) .ae-st-tabs{display:none}
@D@ .ae-st-tab{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-width:0;height:42px;margin:0;padding:0 6px;border:0;border-radius:10px;
  background:transparent;color:var(--sl-dim);font:inherit;cursor:pointer;transition:color .2s,background .2s,box-shadow .2s;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
@D@ .ae-st-tab b{font:400 14px/1 var(--sl-px);letter-spacing:2px}
@D@ .ae-st-tab small{font:600 7.5px/1 var(--sl-data);letter-spacing:1.5px;opacity:.75}
@D@ .ae-st-tab:hover{color:var(--sl-text)}
@D@ .ae-st-tab[data-active]{color:#fff;background:linear-gradient(135deg,rgba(var(--sl-acc-rgb),.45),rgba(var(--sl-acc2-rgb),.30));
  box-shadow:inset 0 0 0 1px rgba(var(--sl-acc-rgb),.6),0 4px 14px rgba(var(--sl-acc-rgb),.22)}
@D@ .ae-st-tab[data-active] small{opacity:1;color:#fff}

/* ---------- rail: icon + name + english tag ---------- */
@D@ .ae-st-pillars{grid-area:rail;position:relative;display:flex;flex-direction:column;gap:3px;min-height:0;height:auto;padding:6px 10px 12px;
  overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(var(--sl-acc-rgb),.3) transparent;
  border:0;border-bottom:1px solid var(--sl-line);background:none}
@D@ .ae-pl{position:relative;display:grid;grid-template-columns:30px minmax(0,1fr) auto;align-items:center;column-gap:10px;flex:none;width:100%;min-height:48px;margin:0;
  padding:6px 10px 6px 8px;border:0;border-radius:12px;background:transparent;color:var(--sl-mute);font:inherit;text-align:left;cursor:pointer;overflow:hidden;
  transition:background .18s,color .18s,box-shadow .18s;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
@D@ .ae-pl::before{content:"";position:absolute;left:0;top:50%;width:3px;height:0;border-radius:0 3px 3px 0;background:var(--sl-acc);box-shadow:0 0 10px var(--sl-acc);transform:translateY(-50%);transition:height .2s}
@D@ .ae-pl:hover{background:rgba(255,255,255,.045);color:var(--sl-text)}
@D@ .ae-pl-ico{grid-column:1;grid-row:1 / span 2;justify-self:center;position:relative;width:30px;height:30px;border-radius:9px;background:rgba(255,255,255,.05);box-shadow:inset 0 0 0 1px var(--sl-line)}
@D@ .ae-pl-ico::before{content:"";position:absolute;inset:7px;background:currentColor;-webkit-mask:var(--ico) center/contain no-repeat;mask:var(--ico) center/contain no-repeat}
@D@ .ae-pl-zh{display:none}
@D@ .ae-pl-full{grid-column:2;grid-row:1;align-self:end;display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13.5px;font-weight:600;letter-spacing:.3px;line-height:1.3}
@D@ .ae-pl-en{grid-column:2;grid-row:2;align-self:start;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:600 8.5px/1.4 var(--sl-data);letter-spacing:1.5px;color:var(--sl-dim)}
@D@ .ae-pl-no{grid-column:3;grid-row:1 / span 2;font:600 9px/1 var(--sl-data);letter-spacing:1px;color:var(--sl-dim);opacity:.7}
@D@ .ae-pl[data-active]{color:#fff;background:linear-gradient(90deg,rgba(var(--sl-acc-rgb),.24),rgba(var(--sl-acc2-rgb),.10) 70%,transparent);box-shadow:inset 0 0 0 1px rgba(var(--sl-acc-rgb),.28)}
@D@ .ae-pl[data-active]::before{height:58%}
@D@ .ae-pl[data-active] .ae-pl-ico{color:#fff;background:linear-gradient(135deg,var(--sl-acc),var(--sl-acc2));box-shadow:0 0 14px rgba(var(--sl-acc-rgb),.45)}
@D@ .ae-pl[data-active] .ae-pl-en{color:var(--sl-acc)}
@D@ .ae-pl[data-active] .ae-pl-no{color:var(--sl-acc);opacity:1}

/* ---------- pager: prev / counter / next under the rail ---------- */
@D@ .ae-st-progress{display:none}
@D@ .ae-st-arrow{grid-area:pager;align-self:center;position:relative;flex:none;width:34px;height:34px;margin:0;padding:0;border-radius:50%;border:1px solid var(--sl-line2);
  background:rgba(255,255,255,.04);color:var(--sl-text);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:border-color .2s,color .2s,opacity .2s,background .2s}
@D@ .ae-st-arrow[data-dir="-1"]{justify-self:start;margin-left:16px}
@D@ .ae-st-arrow[data-dir="1"]{justify-self:end;margin-right:16px}
@D@ .ae-st-arrow::before{content:"";position:absolute;left:50%;top:50%;width:7px;height:7px;border:solid currentColor;border-width:0 0 2px 2px;transform:translate(-30%,-50%) rotate(45deg)}
@D@ .ae-st-arrow[data-dir="1"]::before{transform:translate(-70%,-50%) rotate(-135deg)}
@D@ .ae-st-arrow:hover:not(:disabled){border-color:var(--sl-acc);color:var(--sl-acc);background:rgba(var(--sl-acc-rgb),.08)}
@D@ .ae-st-arrow:disabled{opacity:.28;cursor:default}
@D@ .ae-st-count{grid-area:pager;align-self:center;justify-self:center;font:600 10px/1 var(--sl-data);letter-spacing:1px;color:var(--sl-dim);white-space:nowrap}
@D@ .ae-st-count b{font:400 18px/1 var(--sl-px);color:var(--sl-text);margin-right:4px}
@D@ .ae-st-beam{grid-area:opts;position:absolute;left:0;right:0;top:0;bottom:0;pointer-events:none;z-index:8;opacity:0}

/* ---------- page: grouped glass cards ---------- */
@OPT@{flex:1;min-height:0;overflow:auto !important;overscroll-behavior:contain;contain:content;padding:22px 28px 34px !important;color:var(--sl-text);
  scrollbar-width:thin;scrollbar-color:rgba(var(--sl-acc-rgb),.35) transparent}
@GEN@ @ROW@{display:grid !important;grid-template-columns:minmax(0,1fr) auto !important;align-items:center !important;column-gap:16px !important;row-gap:12px !important;
  position:relative;margin:0 0 8px !important;padding:14px 16px 14px 18px !important;min-height:60px;width:auto !important;
  border:1px solid var(--sl-line) !important;border-radius:var(--sl-r) !important;clip-path:none !important;
  background:linear-gradient(135deg,rgba(255,255,255,.05),rgba(255,255,255,.015)) !important;box-shadow:inset 0 1px 0 rgba(255,255,255,.04) !important;
  transition:border-color .2s,background .2s,box-shadow .2s}
@GEN@ @ROW@::before{content:none !important}
@GEN@ @ROW@:is(:hover,:focus-within){border-color:rgba(var(--sl-acc-rgb),.38) !important;background:linear-gradient(135deg,rgba(var(--sl-acc-rgb),.10),rgba(255,255,255,.02)) !important;
  box-shadow:0 6px 22px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.06) !important}
@GEN@ @ROW@ > :not([role="switch"]){min-width:0 !important}
@GEN@ @ROW@ > :first-child{grid-column:1 !important;width:auto !important;max-width:none !important;margin:0 !important;padding:0 !important;
  background:none !important;box-shadow:none !important;border:0 !important;display:flex !important;flex-direction:column !important;gap:4px !important}
@GEN@ @ROW@ > :not(:first-child){grid-column:2 !important;justify-self:end !important;margin:0 !important}
@GEN@ @ROW@ > :not(:first-child):not([role="switch"]){width:auto !important}
@GEN@ @ROW@ > [class*="_cubeRow"]{grid-column:1 / -1 !important;justify-self:stretch !important;width:100% !important}
@GEN@ @ROW@ [class*="_chevron"]{display:none !important}
@OPT@ @TITLES@,@GEN@ @ROW@ :is([class$="_title"],[class*="Title"],.re-setting-title){color:var(--sl-text) !important;font-size:14.5px !important;font-weight:600 !important;letter-spacing:.3px;line-height:1.4 !important;margin:0 !important}
@OPT@ @TITLES@::before{content:none !important}
@OPT@ :is([class$="_desc"],[class$="_description"],[class*="Description"],.re-setting-description){color:var(--sl-mute) !important;font-size:12.5px !important;line-height:1.55 !important;margin:0 !important}
@OPT@ @HEAD@{display:flex !important;align-items:center;gap:10px;justify-content:flex-start;text-align:left;color:var(--sl-text) !important;font:400 16px/1.3 var(--sl-px) !important;letter-spacing:2px;margin:20px 0 10px !important}
@OPT@ @HEAD@:first-child{margin-top:2px !important}
@OPT@ @HEAD@::before{content:"\\2726";flex:none;font:400 12px/1 system-ui,sans-serif;color:var(--sl-acc);text-shadow:0 0 8px var(--sl-acc)}
@OPT@ @HEAD@::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,rgba(var(--sl-acc-rgb),.45),transparent)}
@OPT@ [class$="_intro"]{color:var(--sl-mute) !important;font-size:12.5px !important;margin:0 0 14px !important}
/* unclassed rows from other plugins (label + control + hint) */
@GEN@ > div > div:not([class]):has(> label),@GEN@ > div:not([class]):has(> label){position:relative;margin:0 0 8px !important;padding:14px 16px !important;border-radius:var(--sl-r);
  border:1px solid var(--sl-line);background:linear-gradient(135deg,rgba(255,255,255,.05),rgba(255,255,255,.015))}
@GEN@ div:not([class]) > label{display:flex !important;align-items:center;justify-content:space-between;gap:12px;color:var(--sl-text);font-weight:600;font-size:14.5px}
@GEN@ div:not([class]) > label + p{margin:6px 0 0 !important;color:var(--sl-mute) !important;font-size:12.5px !important;padding:0 !important}

/* ---------- controls ---------- */
@OPT@ :is(button,select,input,a,[role="button"],[role="switch"],[role="tab"]){touch-action:manipulation;-webkit-tap-highlight-color:transparent}
@OPT@ @SEL@{position:relative;height:36px !important;min-height:36px;padding:0 12px 0 14px !important;gap:8px;border-radius:11px !important;clip-path:none !important;
  border:1px solid var(--sl-line2) !important;background:rgba(255,255,255,.05) !important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05) !important;color:var(--sl-text) !important;font-weight:600 !important}
@OPT@ @SEL@::before{content:none !important}
@OPT@ @SEL@ svg{color:var(--sl-acc) !important}
@OPT@ @SEL@:is(:hover,[aria-expanded="true"]){border-color:rgba(var(--sl-acc-rgb),.6) !important;background:rgba(var(--sl-acc-rgb),.10) !important;box-shadow:0 0 0 3px rgba(var(--sl-acc-rgb),.12) !important}
@OPT@ :is(input:not([type="range"]):not([type="checkbox"]):not([type="radio"]),textarea){border-radius:11px !important;border:1px solid var(--sl-line2) !important;
  background:rgba(0,0,0,.28) !important;color:var(--sl-text) !important;box-shadow:none !important}
@OPT@ select{appearance:none;-webkit-appearance:none;height:36px;padding:0 30px 0 12px !important;font-weight:600;color:var(--sl-text) !important;border-radius:11px !important;
  border:1px solid var(--sl-line2) !important;box-shadow:none !important;
  background:linear-gradient(45deg,transparent 50%,var(--sl-acc) 50%) calc(100% - 15px) 52%/5px 5px no-repeat,
    linear-gradient(135deg,var(--sl-acc) 50%,transparent 50%) calc(100% - 10px) 52%/5px 5px no-repeat,rgba(255,255,255,.05) !important}
@OPT@ select option{background:#16172f;color:var(--sl-text)}
@OPT@ :is(input,textarea,select):focus{border-color:rgba(var(--sl-acc-rgb),.8) !important;box-shadow:0 0 0 3px rgba(var(--sl-acc-rgb),.18) !important;outline:0 !important}
@OPT@ :is(input[type="range"],input[type="checkbox"],input[type="radio"]){accent-color:var(--sl-acc)}
@OPT@ [role="switch"]:not([class*="_switch_"]):not(.ae-sw)[aria-checked="true"]{accent-color:var(--sl-acc)}
/* switch: rounded track, white thumb, lit gradient when on */
@OPT@ @SW@{position:relative;flex:none !important;justify-self:end;width:46px !important;min-width:46px !important;max-width:46px !important;height:26px !important;padding:0 !important;
  border-radius:999px !important;border:1px solid var(--sl-line2) !important;overflow:hidden;cursor:pointer;background:rgba(0,0,0,.35) !important;
  box-shadow:inset 0 1px 3px rgba(0,0,0,.5) !important;transition:background-color .2s,border-color .2s,box-shadow .2s}
@OPT@ @SW@::after{content:none !important}
@OPT@ @SW@ > *{position:absolute !important;left:3px !important;top:50% !important;width:18px !important;height:18px !important;margin:-9px 0 0 !important;rotate:none !important;
  transform:translate3d(0,0,0) !important;border-radius:50% !important;background:#c9c8e6 !important;box-shadow:0 1px 3px rgba(0,0,0,.5) !important;
  transition:transform .2s cubic-bezier(.2,.8,.2,1),background-color .2s;will-change:transform}
@OPT@ @SW@[aria-checked="true"]{border-color:transparent !important;background:linear-gradient(135deg,var(--sl-acc),var(--sl-acc2)) !important;
  box-shadow:0 0 14px rgba(var(--sl-acc-rgb),.45),inset 0 1px 0 rgba(255,255,255,.35) !important}
@OPT@ @SW@[aria-checked="true"] > *{transform:translate3d(20px,0,0) !important;background:#fff !important;box-shadow:0 0 8px rgba(255,255,255,.8),0 1px 3px rgba(0,0,0,.4) !important}
@OPT@ button.re-setting-switch{position:relative;width:46px !important;height:26px !important;border-radius:999px !important;border:1px solid var(--sl-line2) !important;
  background:rgba(0,0,0,.35) !important;box-shadow:inset 0 1px 3px rgba(0,0,0,.5) !important;touch-action:manipulation}
@OPT@ button.re-setting-switch.is-on{border-color:transparent !important;background:linear-gradient(135deg,var(--sl-acc),var(--sl-acc2)) !important;box-shadow:0 0 14px rgba(var(--sl-acc-rgb),.45) !important}
@OPT@ button.re-setting-switch::after{content:"" !important;position:absolute !important;top:50% !important;left:3px !important;width:18px !important;height:18px !important;margin-top:-9px;
  transform:translate3d(0,0,0) !important;border-radius:50% !important;background:#c9c8e6 !important;box-shadow:0 1px 3px rgba(0,0,0,.5) !important;transition:transform .2s cubic-bezier(.2,.8,.2,1),background-color .2s}
@OPT@ button.re-setting-switch.is-on::after{transform:translate3d(20px,0,0) !important;background:#fff !important}
@OPT@ button.re-setting-switch > *{display:none !important}
@OPT@ .re-setting-state{font:700 9px/1 var(--sl-data) !important;letter-spacing:1px;color:var(--sl-acc) !important}
/* theme cubes */
@OPT@ button[class*="_8HJdBW_themeCube"]{position:relative;border-radius:14px !important;clip-path:none !important;border:1px solid var(--sl-line2) !important;
  background:rgba(255,255,255,.04) !important;color:var(--sl-mute) !important;box-shadow:none !important;transition:border-color .2s,background .2s,box-shadow .2s}
@OPT@ button[class*="_8HJdBW_themeCube"]:hover{border-color:rgba(var(--sl-acc-rgb),.45) !important}
@OPT@ button[class*="_8HJdBW_themeCube"]:is([aria-pressed="true"],[class*="_8HJdBW_selected"]){color:#fff !important;border-color:var(--sl-acc) !important;
  background:linear-gradient(160deg,rgba(var(--sl-acc-rgb),.22),rgba(var(--sl-acc2-rgb),.08)) !important;box-shadow:0 0 0 3px rgba(var(--sl-acc-rgb),.15),0 0 18px rgba(var(--sl-acc-rgb),.25) !important}
@OPT@ button[class*="_8HJdBW_themeCube"]:is([aria-pressed="true"],[class*="_8HJdBW_selected"])::after{content:"\\2726";position:absolute;top:5px;right:8px;font-size:11px;color:var(--sl-acc);text-shadow:0 0 6px var(--sl-acc)}
/* number stepper */
@OPT@ :is([class*="bVCLcG_stepper"],[class*="bVCLcG_value"]){border-radius:11px !important;background:rgba(0,0,0,.3) !important;border:1px solid var(--sl-line2) !important;box-shadow:none !important}
@OPT@ [class*="bVCLcG_value"],@OPT@ [class*="bVCLcG_stepper"] input{font:400 18px/1 var(--sl-px) !important;color:var(--sl-text) !important;text-align:center;border:0 !important;background:transparent !important}
@OPT@ [class*="bVCLcG_unit"]{color:var(--sl-dim) !important;font:600 11px/1 var(--sl-data) !important}
/* buttons */
@OPT@ :is(a,button):is([class*="primary" i]):not([role="switch"]){border-radius:11px !important;border:0 !important;color:#fff !important;font-weight:700 !important;letter-spacing:.5px;clip-path:none !important;
  background:linear-gradient(135deg,var(--sl-acc),var(--sl-acc2)) !important;box-shadow:0 6px 18px rgba(var(--sl-acc-rgb),.32),inset 0 1px 0 rgba(255,255,255,.35) !important;
  filter:none;text-shadow:0 1px 2px rgba(0,0,0,.28);padding-left:16px !important;padding-right:16px !important}
@OPT@ :is(a,button):is([class*="primary" i]):not([role="switch"]):hover{filter:brightness(1.08)}
@OPT@ @BTN2@{border-radius:11px !important;clip-path:none !important;border:1px solid var(--sl-line2) !important;color:var(--sl-text) !important;background:rgba(255,255,255,.05) !important;box-shadow:none !important}
@OPT@ @BTN2@:hover{border-color:rgba(var(--sl-acc-rgb),.6) !important;color:var(--sl-acc) !important;background:rgba(var(--sl-acc-rgb),.08) !important}
@OPT@ button[class*="iconButton"]{border-radius:10px !important;border:1px solid var(--sl-line2) !important;background:rgba(255,255,255,.04) !important;color:var(--sl-acc) !important;clip-path:none !important}
@OPT@ :is(a,button):is([class*="danger" i]){border-radius:11px !important;clip-path:none !important;border:1px solid rgba(255,120,140,.45) !important;color:#ff9fb0 !important;background:rgba(255,107,129,.08) !important}

/* ---------- cards ---------- */
@D@[data-ae-deck] @CARDS@{position:relative;border-radius:16px !important;clip-path:none !important;border:1px solid var(--sl-line) !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 8px 24px rgba(0,0,0,.18) !important;background:linear-gradient(160deg,rgba(255,255,255,.065),rgba(255,255,255,.015)) !important}
@D@[data-ae-deck] :is([class*="LcmJYa_card"],[class*="LcmJYa_balanceCard"]){margin-top:16px !important}
@D@[data-ae-deck] :is([class~="LcmJYa_card"],[class~="LcmJYa_balanceCard"])::before{position:absolute;top:-10px;left:16px;padding:0 10px;font:700 9px/19px var(--sl-data);letter-spacing:1.5px;color:#fff;
  white-space:nowrap;border-radius:999px;background:linear-gradient(135deg,var(--sl-acc),var(--sl-acc2));box-shadow:0 3px 12px rgba(var(--sl-acc-rgb),.35)}
@D@[data-ae-deck] [class~="LcmJYa_card"]::before{content:"\\2726  RESONATOR \\00B7  \\5171\\9E23\\8005\\6863\\6848"}
@D@[data-ae-deck] [class~="LcmJYa_balanceCard"]::before{content:"\\2726  CREDIT \\00B7  \\661F\\58F0\\4F59\\989D"}
@D@[data-ae-deck] [class~="qSYn7G_card"]{margin-bottom:10px;transition:border-color .2s,box-shadow .2s,transform .2s}
@D@[data-ae-deck] [class~="qSYn7G_card"]:hover{border-color:rgba(var(--sl-acc-rgb),.45) !important;box-shadow:0 10px 28px rgba(0,0,0,.28),0 0 0 3px rgba(var(--sl-acc-rgb),.08) !important;transform:translateY(-1px)}
@D@[data-ae-deck] [class~="qSYn7G_skeletonCard"]{border-radius:16px !important;background:linear-gradient(90deg,rgba(255,255,255,.03),rgba(var(--sl-acc-rgb),.10),rgba(255,255,255,.03)) 0 0/200% 100% !important;animation:ae-sl-skel 1.2s linear infinite}
@keyframes ae-sl-skel{to{background-position:-200% 0}}
@D@[data-ae-deck] @RT@{border-radius:16px !important;clip-path:none !important;border:1px solid var(--sl-line) !important;background:linear-gradient(160deg,rgba(255,255,255,.06),rgba(255,255,255,.015)) !important}
@D@[data-ae-deck] [class*="rtSEdW_cardActive"]{border-color:rgba(var(--sl-acc-rgb),.75) !important;background:linear-gradient(160deg,rgba(var(--sl-acc-rgb),.16),rgba(var(--sl-acc2-rgb),.05)) !important;
  box-shadow:0 0 0 3px rgba(var(--sl-acc-rgb),.12),0 0 20px rgba(var(--sl-acc-rgb),.18) !important}
@D@[data-ae-deck] :is([class*="LcmJYa_name"],[class*="zGbnIq_rowName"],[class*="rtSEdW_cardName"],[class*="qSYn7G_cardTitle"]){color:var(--sl-text) !important;font-family:inherit !important;letter-spacing:.3px}
@D@[data-ae-deck] [class*="LcmJYa_amount"]{color:var(--sl-gold) !important;font:400 26px/1 var(--sl-px) !important;text-shadow:0 0 14px rgba(243,217,164,.4)}
@D@[data-ae-deck] [class*="LcmJYa_amount"] *{font:inherit !important;color:inherit !important}
@D@[data-ae-deck] [class*="LcmJYa_avatar"]{transform:none !important;width:40px !important;height:40px !important;border-radius:50% !important;overflow:hidden;
  background:url("@PET@") -7px -369px/430px auto no-repeat,radial-gradient(circle at 50% 40%,#3a2a5c,#15122a) !important;
  box-shadow:0 0 0 2px var(--sl-acc),0 0 0 5px rgba(var(--sl-acc-rgb),.16),0 0 16px rgba(var(--sl-acc-rgb),.4) !important;image-rendering:pixelated}
@D@[data-ae-deck] [class*="LcmJYa_avatar"] > *{display:none !important}
@D@[data-ae-deck] [class*="zGbnIq_rowTag"]{border-radius:999px !important;border:1px solid rgba(var(--sl-cyan-rgb),.4);color:var(--sl-cyan) !important;background:rgba(var(--sl-cyan-rgb),.07) !important;
  font-family:var(--sl-data) !important;letter-spacing:.5px;padding-left:8px !important;padding-right:8px !important}
@D@[data-ae-deck] [class*="zGbnIq_credentialDotConfigured"]{background:#6ff0c4 !important;box-shadow:0 0 8px #6ff0c4 !important;border-radius:50% !important}
@D@[data-ae-deck] [class*="zGbnIq_credentialDotMissing"]{background:#ff8a9a !important;box-shadow:0 0 8px rgba(255,138,154,.6) !important;border-radius:50% !important}
@D@[data-ae-deck] [class*="pbvGtq_tab"]{border-radius:999px !important}
@D@[data-ae-deck] [class*="pbvGtq_tab"][aria-selected="true"]{color:#fff !important;background:rgba(var(--sl-acc-rgb),.22) !important;box-shadow:inset 0 0 0 1px rgba(var(--sl-acc-rgb),.6) !important}
@D@[data-ae-deck] code{border-radius:6px !important;font-family:var(--sl-data) !important}

/* ---------- the theme's own page follows the same glass language ---------- */
@OPT@ .ae-panel{gap:12px}
@OPT@ .ae-panel .ae-hero{border:1px solid rgba(var(--sl-acc-rgb),.45);border-radius:18px;background:linear-gradient(135deg,rgba(var(--sl-acc-rgb),.22),rgba(var(--sl-acc2-rgb),.12));
  box-shadow:0 10px 30px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.08)}
@OPT@ .ae-panel .ae-hero h3{display:block !important;margin:0 !important;color:var(--sl-text) !important}
@OPT@ .ae-panel .ae-hero h3::before,@OPT@ .ae-panel .ae-hero h3::after{content:none !important}
@OPT@ .ae-panel .ae-sec{border:1px solid var(--sl-line);border-radius:16px;padding:6px 16px 10px;background:linear-gradient(160deg,rgba(255,255,255,.05),rgba(255,255,255,.012))}
@OPT@ .ae-panel .ae-sec h4{margin:10px 0 4px;font-size:16px;color:var(--sl-text);letter-spacing:1.5px}
@OPT@ .ae-panel .ae-sec h4 svg{color:var(--sl-acc)}
@OPT@ .ae-panel .ae-row{border-top:1px solid rgba(255,255,255,.05)}
@OPT@ .ae-panel button.ae-sw.ae-sw{width:46px;min-width:46px;height:26px;min-height:26px;border-radius:999px !important;border:1px solid var(--sl-line2);background:rgba(0,0,0,.35)}
@OPT@ .ae-panel button.ae-sw.ae-sw::after{top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#c9c8e6;transition:transform .2s cubic-bezier(.2,.8,.2,1),background-color .2s}
@OPT@ .ae-panel button.ae-sw.ae-sw[aria-checked="true"]{border-color:transparent;background:linear-gradient(135deg,var(--sl-acc),var(--sl-acc2));box-shadow:0 0 12px rgba(var(--sl-acc-rgb),.4)}
@OPT@ .ae-panel button.ae-sw.ae-sw[aria-checked="true"]::after{transform:translate3d(20px,0,0);background:#fff;box-shadow:0 0 6px rgba(255,255,255,.8)}
@OPT@ .ae-panel .ae-seg{gap:3px;padding:3px;border:1px solid var(--sl-line2);border-radius:11px;overflow:hidden;background:rgba(0,0,0,.25)}
@OPT@ .ae-panel .ae-seg button{min-height:30px;border:0 !important;border-radius:8px;box-shadow:none !important;color:var(--sl-mute)}
@OPT@ .ae-panel .ae-seg button[aria-pressed="true"]{color:#fff;background:linear-gradient(135deg,var(--sl-acc),var(--sl-acc2))}
@OPT@ .ae-panel .ae-swatch{border:1px solid var(--sl-line);border-radius:12px;background:rgba(255,255,255,.03)}
@OPT@ .ae-panel .ae-swatch i{border-radius:8px}
@OPT@ .ae-panel .ae-swatch[aria-checked="true"]{border-color:var(--sl-acc);background:rgba(var(--sl-acc-rgb),.14);box-shadow:0 0 0 3px rgba(var(--sl-acc-rgb),.12)}
@OPT@ .ae-panel .ae-btn{min-height:36px;padding:0 14px;border:1px solid var(--sl-line2);border-image:none;border-radius:11px;background:rgba(255,255,255,.05);color:var(--sl-text);image-rendering:auto}
@OPT@ .ae-panel .ae-btn:hover{border-color:rgba(var(--sl-acc-rgb),.6);color:var(--sl-acc)}
@OPT@ .ae-panel .ae-btn.ae-pink{border-color:transparent;color:#fff;background:linear-gradient(135deg,var(--sl-acc),var(--sl-acc2))}
@OPT@ .ae-panel .ae-btn:active{border-image:none;filter:brightness(.92)}
@OPT@ .ae-panel .ae-item{border:1px solid var(--sl-line);border-radius:12px;background:rgba(255,255,255,.03)}
@OPT@ .ae-panel .ae-item .ae-mini{border:1px solid var(--sl-line2);border-radius:9px}
@OPT@ .ae-panel input[type=range]{accent-color:var(--sl-acc)}

/* ---------- phone: chip row on top, pager at the thumb ---------- */
@media (max-width:760px){
  @O@ [class*="VOzbGW_mask"]{background:#0b0c1e !important;-webkit-backdrop-filter:none !important;backdrop-filter:none !important;animation:none}
  @D@[data-ae-deck]{grid-template-areas:"head hdr" "rail rail" "crumb crumb" "opts opts" "foot foot" !important;grid-template-columns:minmax(0,1fr) auto !important;
    grid-template-rows:56px auto auto minmax(0,1fr) auto !important;width:100vw !important;height:100dvh !important;border:0 !important;border-radius:0 !important;
    box-shadow:none !important;padding-top:env(safe-area-inset-top,0px) !important;
    background:radial-gradient(90% 32% at 0% 0%,rgba(var(--sl-acc-rgb),.18),transparent 70%),radial-gradient(80% 36% at 100% 100%,rgba(var(--sl-acc2-rgb),.12),transparent 70%),
      linear-gradient(180deg,var(--sl-ink2),var(--sl-ink)) !important}
  @D@[data-ae-deck]::before{display:none}
  @D@[data-ae-deck]::after{left:0;right:0;top:env(safe-area-inset-top,0px)}
  @D@ .ae-st-head{height:56px;gap:10px;padding:0 4px 0 16px;border-bottom:0}
  @D@ .ae-st-mark{width:30px;height:30px}
  @D@ .ae-st-title b{font-size:17px;letter-spacing:2px}
  @D@[data-ae-deck] > nav[class*="VOzbGW_nav"]{top:env(safe-area-inset-top,0px) !important;height:56px !important;right:8px !important}
  @D@[data-ae-deck] > [class*="VOzbGW_header"]{height:56px !important;padding:0 10px 0 4px !important;border-bottom:0 !important}
  @D@[data-ae-deck] > [class*="VOzbGW_content"] > [class*="VOzbGW_header"]{top:env(safe-area-inset-top,0px) !important;height:56px !important;right:8px !important}
  @D@[data-ae-deck] [class*="VOzbGW_close"]{width:40px !important;min-width:40px !important;height:40px !important}
  @D@[data-ae-deck] [class*="VOzbGW_actions"]{display:none !important}
  @D@ .ae-st-pillars{flex-direction:row;gap:8px;padding:4px 16px 12px;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x proximity;scrollbar-width:none;
    -webkit-mask:linear-gradient(90deg,transparent,#000 16px,#000 calc(100% - 16px),transparent);mask:linear-gradient(90deg,transparent,#000 16px,#000 calc(100% - 16px),transparent)}
  @D@ .ae-st-pillars::-webkit-scrollbar{display:none}
  @D@ .ae-pl{display:flex;align-items:center;gap:7px;width:auto;height:38px;min-height:38px;padding:0 14px 0 6px;border-radius:999px;
    background:rgba(255,255,255,.05);box-shadow:inset 0 0 0 1px var(--sl-line);scroll-snap-align:center}
  @D@ .ae-pl::before{display:none}
  @D@ .ae-pl-ico{width:26px;height:26px;border-radius:50%;flex:none}
  @D@ .ae-pl-ico::before{inset:6px}
  @D@ .ae-pl-full{align-self:center;font-size:13px;line-height:1}
  @D@ .ae-pl-en,@D@ .ae-pl-no{display:none}
  @D@ .ae-pl[data-active]{background:linear-gradient(135deg,rgba(var(--sl-acc-rgb),.40),rgba(var(--sl-acc2-rgb),.26));
    box-shadow:inset 0 0 0 1px rgba(var(--sl-acc-rgb),.65),0 4px 14px rgba(var(--sl-acc-rgb),.25)}
  @D@ .ae-st-crumb{height:auto;gap:11px;padding:14px 18px 2px;border-bottom:0}
  @D@ .ae-cr-ico{width:32px;height:32px;border-radius:10px}
  @D@ .ae-cr-text b{font-size:17px}
  @OPT@{padding:12px 14px 26px !important}
  @GEN@ @ROW@{padding:13px 14px !important;column-gap:12px !important;min-height:56px}
  @D@ .ae-st-foot{grid-area:foot;position:relative;display:flex;align-items:center;gap:10px;padding:10px 14px calc(10px + env(safe-area-inset-bottom,0px));
    border-top:1px solid var(--sl-line);background:rgba(8,8,22,.72)}
  @D@ .ae-st-progress{display:block;position:absolute;left:0;right:0;top:-1px;height:2px;overflow:hidden;pointer-events:none}
  @D@ .ae-st-progress::after{content:"";position:absolute;top:0;left:0;height:2px;width:calc(100% / var(--n,1));transform:translateX(calc(100% * var(--a,0)));
    background:linear-gradient(90deg,transparent,var(--sl-acc),transparent);box-shadow:0 0 8px var(--sl-acc);transition:transform .2s ease-out}
  @D@ .ae-st-tabs{flex:1;min-width:0;margin:0}
  @D@ .ae-st-tab{height:40px}
  @D@ .ae-st-arrow{width:42px;height:42px;margin:0 !important}
  @D@ .ae-st-count{display:none}
  @D@ .ae-st-foot:not([data-split]) .ae-st-count{display:block;flex:1;text-align:center}
}
@media (prefers-reduced-motion:reduce){
  @D@[data-ae-deck],@O@ [class*="VOzbGW_mask"],@D@ .ae-pl,@D@ .ae-st-tab,@D@ .ae-st-progress::after{animation:none !important;transition:none !important}
}
`;

function buildStarCss() {
  const RS = 'html[data-aemeath][data-ae-set-style="starlight"]';
  const D = RS + ' [data-shortcut-modal="settings"]';
  const OPT = D + '[data-ae-deck] [class*="VOzbGW_options"]';
  const map = {
    RS, D, OPT,
    O: RS + ' [class*="VOzbGW_overlay"]:has([data-shortcut-modal="settings"])',
    GEN: OPT + ' [class*="_WvWnq_section"]',
    ROW, TITLES, HEAD, SEL, SW, BTN2, CARDS, RT,
    EMBLEM: asset('dsu-emblem.webp'), PET: asset('pet-half.webp'),
  };
  return CSS.replace(/@([A-Z0-9]+)@/g, (m, k) => (Object.prototype.hasOwnProperty.call(map, k) ? map[k] : m));
}

module.exports = { buildStarCss };

};
modules["sidebar-css.js"] = function(require, module, exports) {
"use strict";
// Starlight sidebar, frosted-glass edition: the column is a blurred pane over
// the wallpaper; every control is a thin glass plate (top-left specular rim,
// soft glare, faint tint) instead of a solid fill. Scoped by
// html[data-ae-sb="starlight"]; the tile grid additionally needs
// data-ae-compact-sb. Selectors carry :not(#ae-sb) so they outrank the
// pixel-frame skin without touching it (switching back restores it as is).
// Blur lives on the column's ::before only: a backdrop-filter on the column
// itself would turn it into the containing block of fixed-position popups.

const svgUrl = (body) => 'url("data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' + body + '</svg>') + '")';
const STAR = svgUrl('<path fill="#000" d="M12 1.5c.55 5.3 2.9 8.1 10.5 10.5C14.9 14.4 12.55 17.2 12 22.5 11.45 17.2 9.1 14.4 1.5 12 9.1 9.6 11.45 6.8 12 1.5z"/>');
const CHEV = svgUrl('<path fill="none" stroke="#000" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>');
const SYS = 'system-ui,-apple-system,"PingFang SC","HarmonyOS Sans SC","Noto Sans CJK SC","Microsoft YaHei",sans-serif';

// One glass plate, driven by --g-* custom properties so tinted variants only
// swap the variables.
const GLASS = 'background:radial-gradient(130% 100% at 0% 0%,var(--g-hl),rgba(255,255,255,0) 48%),linear-gradient(160deg,var(--g-fill1),var(--g-fill2)) !important;'
  + 'box-shadow:inset 1px 1px 0 var(--g-rim-hi),inset -1px -1px 0 var(--g-rim-lo),inset 0 0 0 1px var(--g-edge),var(--g-drop) !important;';
const TINT = (rgb, a1, a2, edge) => '--g-fill1:rgba(' + rgb + ',' + a1 + ');--g-fill2:rgba(' + rgb + ',' + a2 + ');--g-edge:rgba(' + rgb + ',' + edge + ');';

function buildSidebarCss() {
  const H = 'html[data-aemeath][data-ae-skin][data-ae-sb="starlight"]';
  const HL = H + '[style*="color-scheme: light"]';
  const ROOT = ' [class*="hHd-Xa_root"]:not([class*="hHd-Xa_collapsed"]):not(#ae-sb)';
  const R = H + ROOT;
  const RL = HL + ROOT;
  const C = H + '[data-ae-compact-sb]' + ROOT;
  const BRAND = ':is(button,span)[class*="hHd-Xa_brand"]:has(> [class*="hHd-Xa_brandIdentity"])';
  const TILE = 'button[class*="hHd-Xa_panelRow"]';
  const TOOL = '[class*="hHd-Xa_footerActions"] button:not(.ae-entrance)';
  const ENT = 'button.ae-entrance[data-wide="true"]';
  const HDRBTN = '[class*="bhn1Oq_sectionHeader"] button:is([class*="bhn1Oq_searchButton"],[class*="bhn1Oq_iconButton"])';
  const PLATES = [
    'button[class*="hHd-Xa_toggle"]', 'button[class*="rwa6qG_entry"]', TILE, HDRBTN, TOOL, 'button[class*="yHnPSG_trigger"]',
  ].map((s) => R + ' ' + s).join(',');
  const RENAMED = [['自动化任务', '自动化'], ['Token 用量', '用量'], ['HyperFrames', '视频']];
  return `
/* ================= starlight sidebar · frosted glass ================= */
/* the layout's floating "open sidebar" key sits on top of the open drawer's emblem */
html[data-aemeath]:has([data-mobile-nav="frame"][data-dshm-page="sidebar"]) [class*="pI_x6G_leadingSeat"] [class*="IW6AQa_controls"]{opacity:0 !important;pointer-events:none !important}

${R}{
  --g-hl:rgba(255,255,255,.17);--g-fill1:rgba(255,255,255,.085);--g-fill2:rgba(255,255,255,.018);
  --g-rim-hi:rgba(255,255,255,.3);--g-rim-lo:rgba(255,255,255,.05);--g-edge:rgba(255,255,255,.08);--g-drop:0 0 0 0 transparent;
  --sb-ink:#f7f0ff;--sb-ink2:rgba(236,228,255,.72);--sb-hover:rgba(255,255,255,.05);
  isolation:isolate;
  background:
    radial-gradient(120% 30% at 0% 0%,rgba(var(--ae-pink-rgb),.16),transparent 64%),
    radial-gradient(110% 26% at 100% 100%,rgba(var(--ae-cyan-rgb),.1),transparent 62%),
    linear-gradient(180deg,rgba(var(--ae-plum2-rgb),.3),rgba(var(--ae-plum-rgb),.26)) !important;
  box-shadow:inset -1px 0 0 rgba(255,255,255,.09),inset 1px 0 0 rgba(255,255,255,.03) !important}
${R}::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;
  -webkit-backdrop-filter:blur(16px) saturate(1.8);backdrop-filter:blur(16px) saturate(1.8)}
${R}:not([style*="position"]){position:relative}
${RL}{
  --g-hl:rgba(255,255,255,.75);--g-fill1:rgba(255,255,255,.58);--g-fill2:rgba(255,255,255,.26);
  --g-rim-hi:rgba(255,255,255,.95);--g-rim-lo:rgba(var(--ae-pink-rgb),.08);--g-edge:rgba(var(--ae-pink-rgb),.14);--g-drop:0 8px 18px -12px rgba(120,50,110,.35);
  --sb-ink:var(--dsw-alias-label-primary);--sb-ink2:var(--dsw-alias-label-secondary);--sb-hover:rgba(var(--ae-pink-rgb),.06);
  background:radial-gradient(120% 30% at 0% 0%,rgba(var(--ae-pink-rgb),.14),transparent 64%),linear-gradient(180deg,rgba(255,250,253,.52),rgba(252,244,255,.46)) !important;
  box-shadow:inset -1px 0 0 rgba(255,255,255,.7) !important}
${R} [class*="hHd-Xa_scrollFade"]{display:none !important}

/* ---- glass plates ---- */
${PLATES}{border:0 !important;border-image:none !important;clip-path:none !important;filter:none !important;${GLASS}
  transition:background .2s,box-shadow .2s,transform .12s}
@media (hover:hover){
  ${PLATES.split(',').map((s) => s + ':hover').join(',')}{--g-fill1:rgba(255,255,255,.13);--g-edge:rgba(255,255,255,.16);--g-rim-hi:rgba(255,255,255,.34)}
}
${RL} :is(${TILE},${TOOL},button[class*="yHnPSG_trigger"],button[class*="rwa6qG_entry"]):hover{--g-fill1:rgba(255,255,255,.8);--g-edge:rgba(var(--ae-pink-rgb),.26)}

/* ---- brand row ---- */
${R} [class*="hHd-Xa_logoRow"]{position:relative;height:auto !important;min-height:62px;padding:10px 2px 10px 6px !important;margin:0 0 6px !important;border-bottom:0 !important;overflow:visible !important}
${R} [class*="hHd-Xa_logoRow"]::after{content:"";position:absolute;left:4px;right:4px;bottom:0;height:1px;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.22) 20%,rgba(var(--ae-pink-rgb),.35) 50%,rgba(255,255,255,.18) 80%,transparent)}
${R} ${BRAND}{overflow:visible !important;padding:0 !important}
${R} [class*="hHd-Xa_brandIdentity"],${R} [class*="hHd-Xa_brandName"]{height:auto !important;overflow:visible !important}
${R} [class*="hHd-Xa_brandIdentity"]{gap:10px !important;transform:none !important}
${R} [class*="hHd-Xa_brandMark"]{width:40px;height:40px;border-radius:50%;transform:none !important;${GLASS}}
${R} .ae-dsu-mark{width:32px !important;height:32px !important;filter:drop-shadow(0 0 6px rgba(var(--ae-pink-rgb),.45)) !important}
${R} .ae-brand-name{gap:5px}
${R} .ae-brand-name b{font-size:22px;line-height:22px;color:transparent;text-shadow:none;
  background:linear-gradient(90deg,#ffe0f0,#ff9fd0 50%,#a9ecff);-webkit-background-clip:text;background-clip:text;
  filter:drop-shadow(0 0 8px rgba(var(--ae-pink-rgb),.35))}
${R} .ae-brand-name small{font:700 8.5px/10px ui-monospace,"JetBrains Mono",monospace;letter-spacing:2.2px;color:rgba(190,240,255,.85)}
${RL} .ae-brand-name b{background:linear-gradient(90deg,var(--ae-pink),var(--ae-violet));-webkit-background-clip:text;background-clip:text;filter:none}
${RL} .ae-brand-name small{color:var(--ae-violet)}
${R} button[class*="hHd-Xa_toggle"]{width:34px !important;height:34px !important;border-radius:12px !important;color:var(--sb-ink2) !important}

/* ---- new session: tinted glass bar with a soft glint ---- */
${R} [class*="hHd-Xa_newSessionRow"]{margin:2px 0 10px !important;gap:8px !important}
${R} button[class*="hHd-Xa_newSession"]{position:relative;height:46px !important;padding:0 14px !important;overflow:hidden;
  border:0 !important;border-image:none !important;border-radius:16px !important;background-clip:border-box !important;color:#fff !important;
  background:radial-gradient(120% 120% at 0% 0%,rgba(255,255,255,.28),rgba(255,255,255,0) 50%),
    linear-gradient(115deg,rgba(255,122,192,.42) 0%,rgba(226,124,255,.3) 52%,rgba(143,168,255,.3) 100%) !important;
  box-shadow:inset 1px 1px 0 rgba(255,255,255,.42),inset -1px -1px 0 rgba(255,255,255,.08),inset 0 0 0 1px rgba(255,200,235,.3),0 10px 26px -12px rgba(var(--ae-pink-rgb),.7) !important;
  -webkit-backdrop-filter:blur(10px) saturate(1.4);backdrop-filter:blur(10px) saturate(1.4);
  font-family:var(--ae-font-px) !important;font-size:20px !important;letter-spacing:1px !important;text-shadow:0 0 10px rgba(var(--ae-pink-rgb),.6),0 1px 0 rgba(80,20,70,.35);
  transition:transform .12s,filter .15s,box-shadow .2s}
${R} button[class*="hHd-Xa_newSession"]::after{content:"";position:absolute;top:-10%;bottom:-10%;left:-45%;width:24%;pointer-events:none;
  background:linear-gradient(100deg,transparent,rgba(255,255,255,.32),transparent);transform:skewX(-18deg);animation:ae-sb-sheen 7s ease-in-out infinite}
@keyframes ae-sb-sheen{0%,76%{left:-45%}100%{left:130%}}
@media (hover:hover){${R} button[class*="hHd-Xa_newSession"]:hover{filter:brightness(1.1)}}
${R} button[class*="hHd-Xa_newSession"]:active{transform:scale(.975)}
${R} button[class*="hHd-Xa_newSession"] svg{width:17px !important;height:17px !important;color:#fff !important;filter:drop-shadow(0 0 6px rgba(var(--ae-pink-rgb),.7))}
${RL} button[class*="hHd-Xa_newSession"]{color:#fff !important;background:radial-gradient(120% 120% at 0% 0%,rgba(255,255,255,.45),rgba(255,255,255,0) 50%),linear-gradient(115deg,rgba(255,105,183,.72),rgba(200,110,255,.6) 52%,rgba(120,150,255,.6)) !important}

/* ---- compact layout: [new session][audio] share one row ---- */
${C}{display:grid !important;grid-template-columns:minmax(0,1fr) 46px !important;column-gap:8px !important;
  grid-template-rows:auto auto minmax(0,1fr) auto !important;align-content:stretch !important}
${C} > *{grid-column:1/-1 !important}
${C} > [class*="hHd-Xa_logoRow"]{grid-row:1 !important}
${C} > [class*="hHd-Xa_newSessionRow"]{grid-row:2 !important;grid-column:1 !important}
${C}:not(:has(> [class*="rwa6qG_entry"])) > [class*="hHd-Xa_newSessionRow"]{grid-column:1/-1 !important}
${C} > [class*="hHd-Xa_scrollRegion"]{grid-row:3 !important;min-height:0 !important}
${C} > [class*="hHd-Xa_footArea"]{grid-row:4 !important}
${C} > button[class*="rwa6qG_entry"]{grid-row:2 !important;grid-column:2 !important;align-self:start}
${R} button[class*="rwa6qG_entry"]{box-sizing:border-box;display:flex !important;align-items:center !important;justify-content:center !important;gap:6px !important;
  min-height:0 !important;margin:2px 0 10px !important;padding:0 10px !important;height:40px !important;border-radius:14px !important;color:var(--ae-cyan) !important}
${C} > button[class*="rwa6qG_entry"]{flex-direction:column !important;gap:2px !important;width:46px !important;height:46px !important;padding:0 !important;border-radius:16px !important}
${R} button[class*="rwa6qG_entry"] [class*="rwa6qG_entryIcon"]{transform:none !important;margin:0 !important;color:var(--ae-cyan) !important;filter:drop-shadow(0 0 5px rgba(var(--ae-cyan-rgb),.45))}
${R} button[class*="rwa6qG_entry"] [class*="rwa6qG_entryLabel"]{font:600 12px/14px ${SYS} !important;letter-spacing:0 !important;color:var(--sb-ink2) !important}
${C} > button[class*="rwa6qG_entry"] [class*="rwa6qG_entryLabel"]{font-size:9px !important;line-height:10px !important}
${R} button[class*="rwa6qG_entry"]:active{transform:scale(.95)}

/* ---- global panels: one row of glass tiles ---- */
${R} nav[class*="hHd-Xa_panelList"]{display:grid !important;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:6px !important;margin:2px 0 14px !important}
${R} [class*="hHd-Xa_panelEntry"]{min-width:0;border-inline:0 !important;border-radius:14px !important;background:none !important}
${R} [class*="hHd-Xa_moreAnchor"]{display:block !important;min-width:0}
${R} ${TILE}{box-sizing:border-box;display:flex !important;flex-direction:column !important;align-items:center !important;justify-content:center !important;
  gap:5px !important;width:100% !important;height:58px !important;min-height:0 !important;margin:0 !important;padding:7px 2px 6px !important;border-radius:15px !important}
${R} ${TILE} [class*="hHd-Xa_panelGlyph"]{transform:none !important;margin:0 !important;color:var(--ae-cyan) !important;filter:drop-shadow(0 0 6px rgba(var(--ae-cyan-rgb),.45))}
${R} ${TILE} [class*="hHd-Xa_panelGlyph"] svg{width:20px !important;height:20px !important}
${R} ${TILE} [class*="hHd-Xa_panelTitle"]{display:block !important;max-width:100%;margin:0 !important;font:600 11px/13px ${SYS} !important;letter-spacing:0 !important;
  color:var(--sb-ink2) !important;white-space:nowrap !important;overflow:hidden;text-overflow:clip;text-align:center}
${RENAMED.map(([label, short]) => `${R} ${TILE}[aria-label="${label}"] [class*="hHd-Xa_panelTitle"]{font-size:0 !important}
${R} ${TILE}[aria-label="${label}"] [class*="hHd-Xa_panelTitle"]::after{content:"${short}";font-size:11px}`).join('\n')}
@media (hover:hover){${R} ${TILE}:hover{transform:translateY(-1px)}}
${R} ${TILE}:active{transform:scale(.95) !important}
${R} [class*="hHd-Xa_panelEntryActive"] ${TILE},${R} ${TILE}[aria-expanded="true"]{${TINT('var(--ae-pink-rgb)', .26, .07, .36)}--g-rim-hi:rgba(255,255,255,.36)}
${R} [class*="hHd-Xa_panelEntryActive"] ${TILE} [class*="hHd-Xa_panelGlyph"]{color:var(--ae-pink-soft) !important;filter:drop-shadow(0 0 6px rgba(var(--ae-pink-rgb),.7))}
${R} [class*="hHd-Xa_panelEntryActive"] ${TILE} [class*="hHd-Xa_panelTitle"]{color:#fff !important}
${RL} ${TILE} [class*="hHd-Xa_panelGlyph"]{color:var(--ae-violet) !important;filter:none}

/* ---- workspace tree ---- */
${R} [class*="bhn1Oq_sectionHeader"]{padding-top:2px !important}
${R} [class*="bhn1Oq_sectionLabel"]{color:transparent !important;background:linear-gradient(90deg,#a9ecff 0%,#d6e8ff 45%,#ffb6dc 100%);
  -webkit-background-clip:text;background-clip:text;filter:drop-shadow(0 0 7px rgba(var(--ae-cyan-rgb),.3))}
${R} [class*="bhn1Oq_sectionLabel"]::before{width:14px !important;height:14px !important;margin-right:7px !important;vertical-align:-1px !important;
  background:linear-gradient(135deg,#ffc2e2,#a9ecff) !important;-webkit-mask:${STAR} center/contain no-repeat;mask:${STAR} center/contain no-repeat;
  image-rendering:auto !important;animation:ae-sb-twinkle 2.8s ease-in-out infinite !important}
@keyframes ae-sb-twinkle{0%,100%{transform:scale(1) rotate(0);opacity:1}50%{transform:scale(.78) rotate(45deg);opacity:.7}}
${RL} [class*="bhn1Oq_sectionLabel"]{background:linear-gradient(90deg,var(--ae-violet),var(--ae-pink));-webkit-background-clip:text;background-clip:text;filter:none}
${R} ${HDRBTN}{width:28px !important;height:28px !important;border-radius:10px !important;color:var(--sb-ink2) !important}
${R} [class*="YDXeBa_projectRow"]{border-radius:12px !important;transition:background .15s}
${R} [class*="YDXeBa_projectRow"] [class*="YDXeBa_title"]{color:var(--sb-ink) !important}
${R} [class*="YDXeBa_projectRow"][aria-expanded="true"]{background:linear-gradient(90deg,rgba(255,255,255,.07),rgba(255,255,255,0) 85%) !important;box-shadow:inset 1px 1px 0 rgba(255,255,255,.08) !important}
${R} [class*="YDXeBa_projectRow"] button[class*="YDXeBa_iconButton"],${R} [class*="YDXeBa_sessionRow"] button[class*="YDXeBa_iconButton"]{border-radius:8px !important;color:var(--sb-ink2) !important}
${R} [class*="YDXeBa_sessionRow"]{border-radius:11px !important;clip-path:none !important;transition:background .15s}
${R} [class*="YDXeBa_sessionRow"] [class*="YDXeBa_title"]{color:var(--sb-ink2) !important}
${R} [class*="YDXeBa_sessionRow"]::before{left:18px !important;width:5px !important;height:5px !important;margin-top:-2.5px !important;border-radius:50% !important;
  background:rgba(190,240,255,.45) !important;box-shadow:none !important;-webkit-mask:none;mask:none}
${R} [class*="YDXeBa_sessionRow"]:has(svg[data-state])::before{display:none !important}
@media (hover:hover){
  ${R} [class*="YDXeBa_projectRow"]:hover,${R} [class*="YDXeBa_sessionRow"]:not([aria-selected="true"]):hover{background:var(--sb-hover) !important}
  ${R} [class*="YDXeBa_sessionRow"]:hover [class*="YDXeBa_title"]{color:var(--sb-ink) !important}
}
${R} [class*="YDXeBa_sessionRow"][aria-selected="true"]{${TINT('var(--ae-pink-rgb)', .2, .04, .24)}${GLASS}}
${R} [class*="YDXeBa_sessionRow"][aria-selected="true"] [class*="YDXeBa_title"]{color:var(--sb-ink) !important;font-weight:600}
${R} [class*="YDXeBa_sessionRow"][aria-selected="true"]::before{left:15px !important;width:11px !important;height:11px !important;margin-top:-5.5px !important;border-radius:0 !important;
  background:linear-gradient(135deg,#ffc2e2,var(--ae-pink)) !important;-webkit-mask:${STAR} center/contain no-repeat;mask:${STAR} center/contain no-repeat}
${R} button[class*="bhn1Oq_sessionOverflowButton"]{border-radius:10px !important;color:rgba(169,236,255,.85) !important;font-size:12px !important}
${RL} button[class*="bhn1Oq_sessionOverflowButton"]{color:var(--ae-violet) !important}

/* ---- footer: glass character cards + glass tool tiles + account plate ---- */
${R} [class*="hHd-Xa_footArea"]{position:relative;border-top:0 !important;padding-top:12px !important;gap:8px !important}
${R} [class*="hHd-Xa_footArea"]::before{content:"";position:absolute;left:4px;right:4px;top:0;height:1px;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.2) 20%,rgba(var(--ae-cyan-rgb),.3) 50%,rgba(255,255,255,.16) 80%,transparent)}
${C} [class*="hHd-Xa_footerActions"]{gap:6px !important}
${R} ${ENT}{${TINT('var(--ae-pink-rgb)', .24, .05, .3)}--g-rim-hi:rgba(255,255,255,.34);--g-hl:rgba(255,255,255,.16);
  isolation:isolate;overflow:hidden;height:58px !important;min-height:58px !important;padding:0 22px 0 6px !important;gap:6px !important;
  border:0 !important;border-image:none !important;border-radius:17px !important;filter:none !important;color:#fff !important;${GLASS}
  -webkit-backdrop-filter:blur(8px) saturate(1.3);backdrop-filter:blur(8px) saturate(1.3);transition:transform .12s,filter .15s}
${R} ${ENT}[data-ae-entrance="plugins"]{${TINT('var(--ae-cyan-rgb)', .2, .04, .3)}}
${R} ${ENT}::before{content:"" !important;display:block !important;position:absolute !important;left:2px !important;right:auto !important;top:50% !important;bottom:auto !important;
  width:52px !important;height:52px !important;margin-top:-26px;border-radius:50%;z-index:-1;pointer-events:none;box-shadow:none !important;
  background:radial-gradient(circle at 50% 50%,rgba(var(--ae-pink-rgb),.4),rgba(var(--ae-pink-rgb),0) 68%) !important;filter:blur(2px)}
${R} ${ENT}[data-ae-entrance="plugins"]::before{background:radial-gradient(circle at 50% 50%,rgba(var(--ae-cyan-rgb),.38),rgba(var(--ae-cyan-rgb),0) 68%) !important}
${R} ${ENT}::after{content:"" !important;display:block !important;position:absolute !important;right:9px !important;top:50% !important;width:10px !important;height:10px !important;margin-top:-5px !important;
  background:currentColor !important;opacity:.5 !important;box-shadow:none !important;-webkit-mask:${CHEV} center/contain no-repeat;mask:${CHEV} center/contain no-repeat}
${R} ${ENT} .ae-doll[data-doll="cat"]{width:38px !important;height:38px !important;margin:0 0 0 4px !important;background-size:76px 38px !important}
${R} ${ENT} .ae-doll[data-doll="aemeath"]{margin:0 -2px 0 -1px !important}
${R} ${ENT} .ae-entrance-text{gap:3px !important;align-items:flex-start !important}
${R} ${ENT} .ae-entrance-label{font:700 14px/17px ${SYS} !important;letter-spacing:.5px !important;color:#fff !important;text-shadow:0 0 10px rgba(var(--ae-plum-rgb),.6) !important}
${R} ${ENT} .ae-entrance-sub{display:block !important;font:600 10px/12px ${SYS} !important;letter-spacing:.5px !important;opacity:.95 !important;color:#ffc2e2 !important;text-shadow:none !important}
${R} ${ENT}[data-ae-entrance="plugins"] .ae-entrance-sub{color:#a9ecff !important}
@media (hover:hover){${R} ${ENT}:hover{filter:brightness(1.1) !important;transform:translateY(-1px)}}
${R} ${ENT}:active{transform:scale(.97) !important;filter:none !important}
${RL} ${ENT}{color:var(--sb-ink) !important}
${RL} ${ENT} .ae-entrance-label{color:var(--sb-ink) !important;text-shadow:none !important}
${RL} ${ENT} .ae-entrance-sub{color:var(--ae-pink) !important}
${RL} ${ENT}[data-ae-entrance="plugins"] .ae-entrance-sub{color:var(--ae-violet) !important}

${R} ${TOOL}{box-sizing:border-box;display:flex !important;flex-direction:column !important;align-items:center !important;justify-content:center !important;gap:4px !important;
  height:50px !important;min-height:0 !important;margin:0 !important;padding:4px 2px !important;border-radius:14px !important;
  font:600 11px/13px ${SYS} !important;letter-spacing:0 !important;color:var(--sb-ink2) !important}
${R} ${TOOL} span{font:600 11px/13px ${SYS} !important;letter-spacing:0 !important;color:inherit !important}
${R} ${TOOL} svg{width:18px !important;height:18px !important;color:var(--ae-cyan) !important;filter:drop-shadow(0 0 5px rgba(var(--ae-cyan-rgb),.4))}
${C} ${TOOL}[aria-label="导出会话日志"] span{font-size:0 !important}
${C} ${TOOL}[aria-label="导出会话日志"] span::after{content:"导出日志";font-size:11px}
${R} ${TOOL}.dsh-ling-btn{font-size:12px !important}
${R} ${TOOL}.dsh-ling-btn:not([style*="color"]){color:#ffc2e2 !important}
@media (hover:hover){${R} ${TOOL}:hover{color:var(--sb-ink) !important}}
${R} ${TOOL}:active{transform:scale(.95) !important}
${RL} ${TOOL} svg{color:var(--ae-violet) !important;filter:none}
${RL} ${TOOL}.dsh-ling-btn:not([style*="color"]){color:var(--ae-pink) !important}

${R} button[class*="yHnPSG_trigger"]{position:relative;height:44px !important;min-height:44px !important;padding:4px 30px 4px 8px !important;gap:10px !important;border-radius:16px !important}
${R} button[class*="yHnPSG_trigger"]::after{content:"";position:absolute;right:12px;top:50%;width:10px;height:10px;margin-top:-5px;background:var(--sb-ink2);opacity:.55;
  -webkit-mask:${CHEV} center/contain no-repeat;mask:${CHEV} center/contain no-repeat;transform:rotate(-90deg)}
${R} button[class*="yHnPSG_trigger"] [class*="yHnPSG_avatar"]{width:28px !important;height:28px !important;border-radius:50% !important;color:#fff !important;
  background:radial-gradient(circle at 30% 25%,rgba(255,255,255,.35),rgba(255,255,255,0) 55%),linear-gradient(135deg,rgba(var(--ae-pink-rgb),.45),rgba(var(--ae-violet-rgb),.4)) !important;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.3),0 0 10px rgba(var(--ae-pink-rgb),.35) !important}
${R} button[class*="yHnPSG_trigger"] [class*="yHnPSG_label"]{font:600 14px/20px ${SYS} !important;letter-spacing:.6px !important;color:var(--sb-ink) !important}

@media (prefers-reduced-motion:reduce){
  ${R} button[class*="hHd-Xa_newSession"]::after,${R} [class*="bhn1Oq_sectionLabel"]::before{animation:none !important}
}
`;
}

module.exports = { buildSidebarCss };

};
modules["skin-extra.js"] = function(require, module, exports) {
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


};
modules["skin.js"] = function(require, module, exports) {
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
const sidebar = require('./sidebar-css.js');
const hero = require('./hero-css.js');
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
  style.textContent = buildCss() + extra.buildCss(A) + chrome.buildCss() + sidebar.buildSidebarCss() + hero.buildHeroCss();
  document.head.appendChild(style);

  const bg = document.createElement('div');
  bg.id = 'aemeath-bg';
  bg.innerHTML = '<div class="ae-bg-img"></div><div class="ae-bg-veil"></div><div class="ae-bg-stars"></div><div class="ae-bg-scan"></div>';
  document.body.prepend(bg);
  makeStars(bg.querySelector('.ae-bg-stars'));

  const theme = ctx.get('theme');
  let disposeTokens = null;
  let lastGlass = null;

  const flag = (name, on) => root.toggleAttribute(name, !!on);

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
    root.setAttribute('data-ae-header-style', p.headerStyle || 'starlight');
    root.setAttribute('data-ae-sb', p.sidebarStyle === 'pixel' ? 'pixel' : 'starlight');
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
    for (const a of ['data-aemeath', 'data-ae-skin', 'data-ae-corners', 'data-ae-capsule', 'data-ae-clamp', 'data-ae-pixel-icons', 'data-ae-compact-sb', 'data-ae-brand', 'data-ae-hide-bell', 'data-ae-palette', 'data-ae-font', 'data-ae-header-style', 'data-ae-sb']) root.removeAttribute(a);
    for (const k of Object.keys(cssVars('aemeath'))) root.style.removeProperty(k);
  };
}

module.exports = { install };


};
modules["store.js"] = function(require, module, exports) {
"use strict";
// Preference store: one localStorage JSON blob + subscribe. Every surface
// (skin, pet, dock, settings page) reads and writes through here, so a change
// in the settings page applies live without a reload.
const KEY = 'dsh-aemeath-theme:prefs';
const BG_KEY = 'dsh-aemeath-theme:custom-bg';

const DOCK_ACTIONS = ['newSession', 'sidebar', 'composer', 'scrollBottom', 'scrollTop', 'rightbar', 'pet', 'scheme', 'settings'];

const DEFAULTS = {
  version: 1,
  // appearance
  skin: true,               // pink/plum token layer + component skin
  scheme: 'dark',           // 'dark' | 'light' | 'follow'
  background: 'night',      // 'night' | 'night-dim' | 'custom' | 'none'
  bgDim: 0.45,              // 0..0.9 veil over the background image
  bgBlur: 0,                // px
  scanlines: true,
  stars: true,
  pixelCorners: true,       // cut-corner (chamfer) buttons and cards
  glass: 0.62,              // surface opacity over the background (0.3..0.95)
  // pet
  pet: true,
  petScale: 0.75,           // 0.5 .. 1.5 (of a 96x104 cell)
  petBubbles: true,
  petFollowAgent: true,
  petIdle: true,            // little acts when idle (sing, stretch, stroll...)
  petPos: null,             // {x, y} in px from the left/top, null = default
  // dock
  dock: true,               // tap Aemeath to open the quick menu
  dockSize: 'm',            // 's' | 'm' | 'l'
  dockLabels: true,         // show text next to the icons in the quick menu
  dockActions: DOCK_ACTIONS.map(id => ({ id, on: ['newSession', 'sidebar', 'composer', 'scrollBottom', 'pet', 'settings'].includes(id) })),
  // capsule
  wwLingo: true,
  keyboardGuard: true,
  hideNotifyBell: true,     // hide memory-evolve's floating in-app notification bell
  // settings dialog (DSH 0.2.x)
  settingsSkin: true,       // 星落/赛博 control-room skin for the official settings dialog
  settingsStyle: 'starlight', // 'starlight' 星辉侧栏(默认) | 'resonance' 频段柱 | 'classic' 仅换色不改导航
  settingsFlip: 'glitch',   // 翻页效果：'glitch' 电子幽灵乱码 | 'scan' 共鸣扫描 | 'slide' 平移 | 'none'
  settingsSwipe: true,      // 设置内容区左右滑动翻页
  settingsSplit: true,      // two entrances: 系统设置 (official) / 插件中心 (plugin pages)
  brand: true,              // 深空联合 emblem + renamed brand
  brandName: 'spacetrek',   // 'spacetrek' | 'aemeath' | 'ghost'
  palette: 'aemeath',       // colour scheme preset (see palette.js PALETTES)
  textColor: 'default',     // body text tint: default | pink | cyan | lilac | white
  uiFont: 'pixel-title',    // 'pixel-title' | 'system' | 'mono'
  pixelIcons: true,         // swap header / sidebar icons for pixel icons            // 鸣潮-style names for process / tool rows (zh UI)
  capsuleSkin: true,
  polestarSlider: true,
  chatChrome: true,         // 聊天页顶栏/输入框/状态条的「舰桥」样式
  headerStyle: 'starlight', // 'starlight' 星辉胶囊 | 'ribbon' 轻透星轨 | 'classic' 原版舰桥
  sidebarStyle: 'starlight', // 侧栏风格：'starlight' 星辉玻璃 | 'pixel' 像素舰桥
  compactSidebar: true,     // 侧栏紧凑布局：顶部入口一排图标、底部两排卡片     // 思考强度滑块：永远的启明星光刃 + 粒子
  capsuleClamp: true,       // keep the model panel inside the viewport on phones
  // layout
  mobileNav: true,          // bundled dsh-mobile-nav layout (needs a reload to flip)
  mobileFixes: true,        // bundled header/touch/wallpaper-layout fixes
};

function clone(v) { return JSON.parse(JSON.stringify(v)); }

function load() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { saved = {}; }
  const merged = Object.assign(clone(DEFAULTS), saved);
  if (!Array.isArray(merged.dockActions)) merged.dockActions = clone(DEFAULTS.dockActions);
  merged.dockActions = merged.dockActions.filter(a => a && DOCK_ACTIONS.includes(a.id));
  const known = new Set(merged.dockActions.map(a => a.id));
  for (const id of DOCK_ACTIONS) if (!known.has(id)) merged.dockActions.push({ id, on: false });
  // v2: the settings dialog got the 频段柱 (resonance) layout; move earlier
  // saves off the old default once, keep any later explicit choice.
  if (!['starlight', 'resonance', 'classic'].includes(merged.settingsStyle)) merged.settingsStyle = 'starlight';
  if ((saved.settingsRev || 0) < 2) {
    if (!saved.settingsStyle || saved.settingsStyle === 'starfall' || saved.settingsStyle === 'cyber') merged.settingsStyle = 'resonance';
    merged.settingsRev = 2;
  }
  // v3: page flips default to the 2077-style garble (电子幽灵·乱码); a save that
  // only carried the old 'scan' default moves over once.
  if ((merged.settingsRev || 0) < 3) {
    if (!saved.settingsFlip || saved.settingsFlip === 'scan') merged.settingsFlip = 'glitch';
    merged.settingsRev = 3;
  }
  // v4: the 星辉·侧栏 (starlight) layout becomes the default; a save that still
  // carried the old resonance default moves over once, later choices stick.
  if ((merged.settingsRev || 0) < 4) {
    if (merged.settingsStyle === 'resonance') merged.settingsStyle = 'starlight';
    merged.settingsRev = 4;
  }
  return merged;
}

let state = load();
const listeners = new Set();

function get() { return state; }
function set(patch) {
  state = Object.assign({}, state, typeof patch === 'function' ? patch(state) : patch);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota */ }
  for (const fn of [...listeners]) { try { fn(state); } catch (e) { console.error('[aemeath-theme]', e); } }
}
function reset(keys) {
  if (!keys) { set(clone(DEFAULTS)); return; }
  const patch = {};
  for (const k of keys) patch[k] = clone(DEFAULTS[k]);
  set(patch);
}
function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

function getCustomBg() { try { return localStorage.getItem(BG_KEY) || ''; } catch { return ''; } }
function setCustomBg(dataUrl) {
  try {
    if (dataUrl) localStorage.setItem(BG_KEY, dataUrl); else localStorage.removeItem(BG_KEY);
  } catch (e) { throw new Error('图片太大，浏览器存不下（请换一张小一点的图）'); }
  set({});
}

module.exports = { get, set, reset, subscribe, DEFAULTS, DOCK_ACTIONS, getCustomBg, setCustomBg };


};
modules["vendor/mobile-nav.js"] = function(require, module, exports) {
/*!
 * Bundled into dsh-aemeath-theme unmodified.
 * Original: @dsh-external/dsh-mobile-nav 1.0.0 by mexiaosqwq
 * https://github.com/mexiaosqwq/dsh-web-mobile
 * License: MIT (see vendor/mobile-nav.LICENSE)
 */
module.exports = ({id: '@dsh-external/dsh-mobile-nav', factory: (require) => {
const modules = Object.create(null);
modules["MobileDrawerFooter.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileDrawerFooter = MobileDrawerFooter;
const jsx_runtime_1 = require("react/jsx-runtime");
const dsh_client_ui_primitives_1 = require("@deepseek-ai/dsh-client-ui-primitives");
/**
 * Mobile-only drawer footer actions, relocated from the session header to the
 * drawer footer (beside Settings):
 * - Files: opens the dsh-web-ui aionui explorer as a floating bottom sheet
 *   (the explorer column is hidden on mobile until this marker is set, so
 *   the suite's own persisted-expanded state can never cover the UI on load).
 * - Session log: the official session-log-export controller, so the
 *   progress/result dialog is shared with the desktop flow.
 * Hidden entirely on wide screens (CSS media query).
 */
function MobileDrawerFooter({ useSessions, downloadSessionLog, toggleSidebar, t }) {
    const sessionId = useSessions((state) => state.current);
    const openExplorer = () => {
        document.querySelector('[data-mobile-nav="frame"]')?.setAttribute('data-aionui-explorer-open', '');
        toggleSidebar();
    };
    return ((0, jsx_runtime_1.jsxs)("div", { "data-mobile-nav": "drawer-actions", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", "data-mobile-nav": "explorer", "aria-label": t('files'), title: t('files'), onClick: openExplorer, children: [(0, jsx_runtime_1.jsx)(dsh_client_ui_primitives_1.IconPanelLeftOutlineRegular, { size: 14 }), (0, jsx_runtime_1.jsx)("span", { children: t('files') })] }), (0, jsx_runtime_1.jsxs)("button", { type: "button", "data-mobile-nav": "session-log", "aria-label": t('sessionLog'), title: t('sessionLog'), disabled: sessionId === undefined, onClick: () => {
                    if (sessionId !== undefined)
                        downloadSessionLog(sessionId);
                }, children: [(0, jsx_runtime_1.jsx)(dsh_client_ui_primitives_1.IconDownloadOutlineRegular, { size: 14 }), (0, jsx_runtime_1.jsx)("span", { children: t('sessionLog') })] })] }));
}

};
modules["MobileNavOverlay.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileNavOverlay = MobileNavOverlay;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_dom_1 = require("react-dom");
const dsh_client_ui_primitives_1 = require("@deepseek-ai/dsh-client-ui-primitives");
const pager_ts_1 = require("./effects/pager.js");
const dom_watch_ts_1 = require("./effects/dom-watch.js");
const MOBILE_QUERY = '(max-width: 1023px)';
const NAVIGATION = 'button[data-dsh-taskboard-entry], button[data-dsh-ssh-entry], [class*="newSession"], [class*="sessionRow"], [class*="searchResultRow"], [class*="searchResultWorkspace"]';
function useMobile() {
    const [mobile, setMobile] = (0, react_1.useState)(() => window.matchMedia(MOBILE_QUERY).matches);
    (0, react_1.useEffect)(() => {
        const query = window.matchMedia(MOBILE_QUERY);
        const onChange = (event) => setMobile(event.matches);
        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, []);
    return mobile;
}
function findFrame() {
    return document.querySelector('[data-shell-overlay]')?.parentElement ?? null;
}
function MobileNavOverlay({ toggleSidebar, t }) {
    const mobile = useMobile();
    const [fabVisible, setFabVisible] = (0, react_1.useState)(false);
    (0, react_1.useLayoutEffect)(() => {
        if (!mobile)
            return;
        const frame = findFrame();
        if (frame === null)
            return;
        frame.setAttribute('data-mobile-nav', 'frame');
        return () => {
            frame.removeAttribute('data-mobile-nav');
            frame.removeAttribute('data-mobile-preview-full');
        };
    }, [mobile]);
    (0, react_1.useEffect)(() => {
        if (!mobile) {
            setFabVisible(false);
            return;
        }
        const sync = () => setFabVisible(document.querySelector('[data-phase="active"]') === null);
        sync();
        return (0, dom_watch_ts_1.observeRelevant)(document.body, '[data-phase]', sync, {
            subtree: true, childList: true, attributes: true, attributeFilter: ['data-phase'],
        });
    }, [mobile]);
    (0, react_1.useEffect)(() => {
        if (!mobile)
            return;
        const onKeyDown = (event) => {
            if (event.key === 'Escape' && document.querySelector('[aria-modal="true"]') === null) {
                (0, pager_ts_1.navigatePager)('chat', toggleSidebar);
            }
        };
        const onDrawerClick = (event) => {
            const target = event.target;
            if (!(target instanceof Element))
                return;
            const _f = findFrame(); const drawer = _f?.querySelector(':scope > [class*="_sidebarCol"]') || _f?.firstElementChild;
            if (!drawer?.contains(target))
                return;
            // Row actions and portaled dialogs must remain visible in the sidebar.
            if (target.closest('[class*="sessionRow"] button') !== null)
                return;
            const label = target.closest('button')?.getAttribute('aria-label') ?? '';
            const createsSession = /^(?:新建会话|New session(?: in .+)?|在“.+”中新建会话)$/.test(label);
            if (target.closest(NAVIGATION) === null && !createsSession)
                return;
            if (document.querySelector('[aria-modal="true"]') !== null)
                return;
            (0, pager_ts_1.navigatePager)('chat', toggleSidebar, true);
        };
        document.addEventListener('keydown', onKeyDown, true);
        document.addEventListener('click', onDrawerClick, true);
        return () => {
            document.removeEventListener('keydown', onKeyDown, true);
            document.removeEventListener('click', onDrawerClick, true);
        };
    }, [mobile, toggleSidebar]);
    (0, react_1.useEffect)(() => {
        if (!mobile)
            return;
        let button = null;
        const ensure = () => {
            const col = document.querySelector('[data-aionui-preview-col]');
            if (col === null)
                return;
            if (button === null) {
                button = document.createElement('button');
                button.type = 'button';
                button.dataset.mobileNav = 'preview-full-toggle';
                button.setAttribute('aria-label', t('previewFullscreen'));
                button.title = t('previewFullscreen');
                button.innerHTML = [
                    '<svg class="dsh-mobile-nav-full-in" viewBox="0 0 16 16" fill="none" aria-hidden="true">',
                    '<path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
                    '</svg>',
                    '<svg class="dsh-mobile-nav-full-out" viewBox="0 0 16 16" fill="none" aria-hidden="true">',
                    '<path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
                    '</svg>',
                ].join('');
                button.addEventListener('click', () => findFrame()?.toggleAttribute('data-mobile-preview-full'));
            }
            if (button.parentElement !== col)
                col.appendChild(button);
        };
        ensure();
        const cleanup = (0, dom_watch_ts_1.observeRelevant)(document.body, '[data-aionui-preview-col]', ensure);
        return () => {
            cleanup();
            button?.remove();
        };
    }, [mobile, t]);
    (0, react_1.useEffect)(() => {
        if (!mobile)
            return;
        const ensure = () => {
            const chip = document.querySelector('[data-slot="conversation.input.dock"] [data-gitgraph-chip-anchor]');
            if (chip === null)
                return;
            const card = document.querySelector('[data-composer-card]');
            if (card !== null && chip.parentElement !== card)
                card.insertBefore(chip, card.firstChild);
        };
        ensure();
        const cleanup = (0, dom_watch_ts_1.observeRelevant)(document.body, '[data-slot="conversation.input.dock"], [data-composer-card]', ensure);
        return () => {
            cleanup();
            const chip = document.querySelector('[data-gitgraph-chip-anchor]');
            const dock = document.querySelector('[data-slot="conversation.input.dock"]');
            if (chip !== null && dock !== null && chip.parentElement !== dock)
                dock.appendChild(chip);
        };
    }, [mobile]);
    (0, react_1.useEffect)(() => {
        if (!mobile)
            return;
        const ensure = () => {
            const dialog = document.querySelector('[aria-modal="true"]');
            const nav = dialog?.querySelector(':scope > [class$="_nav"]');
            const header = dialog?.querySelector('[class$="_header"]');
            if (nav != null && header != null && header.parentElement !== nav)
                nav.appendChild(header);
        };
        ensure();
        return (0, dom_watch_ts_1.observeRelevant)(document.body, '[aria-modal="true"]', ensure);
    }, [mobile]);
    if (!mobile)
        return null;
    return fabVisible ? (0, react_dom_1.createPortal)((0, jsx_runtime_1.jsx)("button", { type: "button", "data-mobile-nav": "fab", "aria-label": t('open'), title: t('open'), onClick: () => (0, pager_ts_1.navigatePager)('sidebar', toggleSidebar), children: (0, jsx_runtime_1.jsx)(dsh_client_ui_primitives_1.IconPanelLeftOutlineRegular, { size: 18 }) }), document.body) : null;
}

};
modules["MobileNavToggle.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileNavToggle = MobileNavToggle;
const jsx_runtime_1 = require("react/jsx-runtime");
const dsh_client_ui_primitives_1 = require("@deepseek-ai/dsh-client-ui-primitives");
const pager_ts_1 = require("./effects/pager.js");
/** Header actions; the footer keeps Files available on the blank screen. */
function MobileNavToggle({ toggleSidebar, t }) {
    const toggleExplorer = () => {
        document.querySelector('[data-mobile-nav="frame"]')?.toggleAttribute('data-aionui-explorer-open');
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { type: "button", "data-mobile-nav": "toggle", "aria-label": t('open'), title: t('open'), onClick: () => (0, pager_ts_1.togglePager)(toggleSidebar), children: (0, jsx_runtime_1.jsx)(dsh_client_ui_primitives_1.IconPanelLeftOutlineRegular, { size: 16 }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", "data-mobile-nav": "files", "aria-label": t('files'), title: t('files'), onClick: toggleExplorer, children: (0, jsx_runtime_1.jsx)(dsh_client_ui_primitives_1.IconFolderOpenOutlineRegular, { size: 16 }) })] }));
}

};
modules["debug.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installDebugBadge = installDebugBadge;
/**
 * Debug badge — ?mobile-nav-debug=1
 * Renders a live state overlay (URL, viewport, media queries, shell chrome,
 * aionui columns, genui cards, captured errors) so a phone-side repro can be
 * diagnosed without guessing. No-op unless the query param is present.
 */
function installDebugBadge(ctx) {
    ctx.effect(() => {
        if (!new URLSearchParams(location.search).has('mobile-nav-debug'))
            return () => { };
        const errors = [];
        const onError = (event) => errors.push(`ERR ${event.message.slice(0, 120)}`);
        const onRejection = (event) => errors.push(`REJ ${String(event.reason).slice(0, 120)}`);
        window.addEventListener('error', onError);
        window.addEventListener('unhandledrejection', onRejection);
        const badge = document.createElement('div');
        badge.style.cssText = [
            'position:fixed', 'top:40px', 'right:6px', 'z-index:2147483000',
            'background:rgba(0,0,0,.82)', 'color:#fff', 'font:11px/1.5 ui-monospace,monospace',
            'padding:8px 10px', 'border-radius:8px', 'max-width:94vw', 'max-height:70vh',
            'overflow:auto', 'white-space:pre-wrap', 'pointer-events:none',
        ].join(';');
        const read = () => {
            const q = (sel) => !!document.querySelector(sel);
            const vis = (sel) => {
                const el = document.querySelector(sel);
                return el === null ? 'absent' : getComputedStyle(el).visibility;
            };
            const frame = document.querySelector('[data-mobile-nav="frame"]');
            return [
                `URL ${location.pathname}${location.search}`,
                `W ${innerWidth} x ${innerHeight} dpr ${devicePixelRatio}`,
                `mq≤1023 ${matchMedia('(max-width: 1023px)').matches}  mq≥1024 ${matchMedia('(min-width: 1024px)').matches}`,
                `css ${q('style[data-plugin-css*="mobile"]')}  frame ${!!frame}`,
                `previewCol ${vis('[data-aionui-preview-col]')}  explorerCol ${vis('[data-aionui-explorer-col]')}`,
                `previewOpen ${frame?.hasAttribute('data-aionui-preview-open') ?? '?'}  explorerOpen ${frame?.hasAttribute('data-aionui-explorer-open') ?? '?'}  previewFull ${frame?.hasAttribute('data-mobile-preview-full') ?? '?'}`,
                `header ${vis('[data-phase] header')}  composer ${q('textarea')}`,
                `genui cards ${document.querySelectorAll('[data-genui]').length}  panel ${q('[data-genui-panel]')}`,
                `phase ${document.querySelector('[data-phase]')?.getAttribute('data-phase') ?? '?'}`,
                `errs ${errors.slice(-5).join(' | ') || 'none'}`,
            ].join('\n');
        };
        const paint = () => { badge.textContent = read(); };
        paint();
        const observer = new MutationObserver(paint);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
        const timer = setInterval(paint, 1500);
        document.body.appendChild(badge);
        return () => {
            window.removeEventListener('error', onError);
            window.removeEventListener('unhandledrejection', onRejection);
            observer.disconnect();
            clearInterval(timer);
            badge.remove();
        };
    }, 'dsh-mobile-nav: debug badge');
}

};
modules["effects/aionui-compat.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installAionuiCompat = installAionuiCompat;
const dom_watch_ts_1 = require("./dom-watch.js");
const COLUMNS = '[data-aionui-explorer-col], [data-aionui-preview-col]';
const MARKERS = '[data-mobile-nav="frame"]';
function installAionuiCompat(ctx) {
    ctx.effect(() => {
        const narrow = window.matchMedia('(max-width: 1023px)');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let cleanup;
        const install = () => {
            cleanup?.();
            cleanup = undefined;
            if (!narrow.matches)
                return;
            const frame = () => document.querySelector(MARKERS);
            const closePreview = () => {
                frame()?.removeAttribute('data-aionui-preview-open');
                frame()?.removeAttribute('data-mobile-preview-full');
            };
            const onTap = (event) => {
                const target = event.target;
                if (!(target instanceof Element))
                    return;
                if (target.closest('.aionui-collapse-chevron') !== null) {
                    frame()?.removeAttribute('data-aionui-explorer-open');
                }
                if (target.closest('[data-aionui-preview-col] [class$="_panelCollapse"]') !== null) {
                    closePreview();
                    return;
                }
                const row = target.closest('[data-aionui-explorer-col] [class*="_treeRow"]');
                if (row === null)
                    return;
                // Non-empty arrows belong to directories, not previewable files.
                if (row.querySelector('[class*="_treeArrow"]:not([class*="_treeArrowEmpty"])') === null) {
                    frame()?.setAttribute('data-aionui-preview-open', '');
                }
            };
            const visible = new Map();
            const animations = new Map();
            const check = () => {
                const preview = document.querySelector('[data-aionui-preview-col]');
                if (preview?.style.visibility === 'hidden')
                    closePreview();
                const columns = [...document.querySelectorAll(COLUMNS)];
                for (const [el, animation] of animations) {
                    if (!el.isConnected) {
                        animation.cancel();
                        animations.delete(el);
                        visible.delete(el);
                    }
                }
                for (const el of columns) {
                    const shown = getComputedStyle(el).visibility === 'visible';
                    if (!shown || reducedMotion.matches) {
                        animations.get(el)?.cancel();
                        animations.delete(el);
                    }
                    else if (!(visible.get(el) ?? false)) {
                        animations.get(el)?.cancel();
                        animations.set(el, el.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: 'cubic-bezier(.16, 1, .3, 1)' }));
                    }
                    visible.set(el, shown);
                }
            };
            document.addEventListener('click', onTap, true);
            reducedMotion.addEventListener('change', check);
            const unwatch = (0, dom_watch_ts_1.observeRelevant)(document.body, `${COLUMNS}, ${MARKERS}`, check, {
                childList: true, subtree: true, attributes: true,
                attributeFilter: ['style', 'class', 'data-aionui-explorer-open', 'data-aionui-preview-open', 'data-mobile-preview-full'],
            });
            check();
            cleanup = () => {
                unwatch();
                document.removeEventListener('click', onTap, true);
                reducedMotion.removeEventListener('change', check);
                for (const animation of animations.values())
                    animation.cancel();
            };
        };
        install();
        narrow.addEventListener('change', install);
        return () => {
            narrow.removeEventListener('change', install);
            cleanup?.();
        };
    }, 'dsh-mobile-nav: mobile file sheets');
}

};
modules["effects/composer-toggle.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installComposerToggle = installComposerToggle;
const dom_watch_ts_1 = require("./dom-watch.js");
const STORAGE_KEY = 'dshm-composer-collapsed';
const COLLAPSED = 'collapsed';
function label(collapsed) {
    const lang = `${document.documentElement.lang} ${navigator.language}`.toLowerCase();
    const english = lang.includes('en') && !lang.includes('zh');
    if (english)
        return collapsed ? 'Show input' : 'Hide input';
    return collapsed ? '展开输入框' : '收起输入框';
}
function savedCollapsed() {
    try {
        return localStorage.getItem(STORAGE_KEY) === '1';
    }
    catch {
        return false;
    }
}
/** Phone-only control for hiding the bottom composer without focusing it. */
function installComposerToggle(ctx) {
    ctx.effect(() => {
        const narrow = window.matchMedia('(max-width: 1023px)');
        let cleanup;
        let button = null;
        const paint = (collapsed) => {
            const frame = document.querySelector('[data-mobile-nav="frame"]');
            if (frame !== null) {
                if (collapsed)
                    frame.setAttribute('data-dshm-composer', COLLAPSED);
                else
                    frame.removeAttribute('data-dshm-composer');
            }
            if (button === null)
                return;
            const text = label(collapsed);
            button.textContent = text;
            button.setAttribute('aria-label', text);
            button.setAttribute('aria-pressed', collapsed ? 'true' : 'false');
        };
        const ensure = () => {
            if (!narrow.matches)
                return;
            const seat = document.querySelector('[data-composer-seat]');
            if (!(seat instanceof HTMLElement))
                return;
            if (button === null) {
                button = document.createElement('button');
                button.type = 'button';
                button.dataset.mobileNav = 'composer-toggle';
                button.addEventListener('click', () => {
                    const frame = document.querySelector('[data-mobile-nav="frame"]');
                    const next = frame?.getAttribute('data-dshm-composer') !== COLLAPSED;
                    try {
                        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
                    }
                    catch {
                        // Private mode can reject storage; the current page still toggles.
                    }
                    paint(next);
                });
            }
            if (button.parentElement !== seat)
                seat.appendChild(button);
            paint(savedCollapsed());
        };
        const install = () => {
            cleanup?.();
            cleanup = undefined;
            if (!narrow.matches) {
                document.querySelector('[data-mobile-nav="frame"]')?.removeAttribute('data-dshm-composer');
                button?.remove();
                button = null;
                return;
            }
            ensure();
            cleanup = (0, dom_watch_ts_1.observeRelevant)(document.body, '[data-composer-seat]', ensure);
        };
        install();
        narrow.addEventListener('change', install);
        return () => {
            narrow.removeEventListener('change', install);
            cleanup?.();
            button?.remove();
            document.querySelector('[data-mobile-nav="frame"]')?.removeAttribute('data-dshm-composer');
        };
    }, 'dsh-mobile-nav: composer toggle');
}

};
modules["effects/dom-watch.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.observeRelevant = observeRelevant;
const LIVE_CONTENT = '[data-conversation-scroll], [data-composer-input]';
/** Watch shell changes without rescanning streamed messages or the editor. */
function observeRelevant(root, selector, callback, options = { childList: true, subtree: true }) {
    let frame = null;
    const observer = new MutationObserver((records) => {
        const relevant = records.some((record) => {
            const target = record.target instanceof Element ? record.target : record.target.parentElement;
            if (target !== null && target.closest(LIVE_CONTENT) !== null)
                return false;
            if (record.type === 'attributes')
                return target?.matches(selector) ?? false;
            if (target !== null && target.closest(selector) !== null)
                return true;
            return [...record.addedNodes, ...record.removedNodes].some((node) => node instanceof Element && (node.matches(selector) || node.querySelector(selector) !== null));
        });
        if (!relevant || frame !== null)
            return;
        frame = requestAnimationFrame(() => {
            frame = null;
            callback();
        });
    });
    observer.observe(root, options);
    return () => {
        observer.disconnect();
        if (frame !== null)
            cancelAnimationFrame(frame);
    };
}

};
modules["effects/pager.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagerController = exports.PAGE_ATTR = exports.PAGER_BREAKPOINT = void 0;
exports.navigatePager = navigatePager;
exports.togglePager = togglePager;
const dom_watch_ts_1 = require("./dom-watch.js");
exports.PAGER_BREAKPOINT = '(max-width: 1023px)';
exports.PAGE_ATTR = 'data-dshm-page';
const TARGET_ATTR = 'data-dshm-target';
const MOVING_ATTR = 'data-dshm-moving';
const SCROLL_SETTLE_MS = 160;
const SIDEBAR_COLLAPSE_LABELS = new Set(['收起侧边栏', 'Collapse sidebar']);
const MODEL_SLOT = "[data-slot='conversation.input.model']";
const MODEL_LABEL_SELECTOR = `[data-composer-card] ${MODEL_SLOT} button[aria-haspopup='menu'] > span:first-child`;
const MARQUEE_GAP_PX = 32;
const controllers = new WeakMap();
function findFrame() {
    return document.querySelector('[data-mobile-nav="frame"]');
}
function findSidebarCol(frame) {
    return frame?.querySelector(':scope > [class*="_sidebarCol"]') || frame?.firstElementChild || null;
}
function findCenterCol(frame) {
    return frame?.querySelector(':scope > [class*="_centerCol"]') || frame?.children[1] || null;
}
function chatPageLeft(frame) {
    const sidebar = findSidebarCol(frame);
    return sidebar instanceof HTMLElement && sidebar.offsetWidth > 0 ? sidebar.offsetWidth : frame.clientWidth;
}
/** One navigation owner prevents repeated clicks from restarting a smooth scroll. */
function navigatePager(page, fallback, afterCommit = false) {
    const frame = findFrame();
    if (frame === null) {
        fallback();
        return;
    }
    const controller = controllers.get(frame);
    if (controller !== undefined) {
        controller.navigate(page, afterCommit);
        return;
    }
    frame.scrollTo({
        left: page === 'chat' ? chatPageLeft(frame) : 0,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
}
function togglePager(fallback) {
    const frame = findFrame();
    if (frame === null) {
        fallback();
        return;
    }
    const target = frame.getAttribute(TARGET_ATTR);
    const onChat = target !== null ? target === 'chat' : frame.scrollLeft >= chatPageLeft(frame) / 2;
    navigatePager(onChat ? 'sidebar' : 'chat', fallback);
}
class PagerController {
    #options;
    #frame = null;
    #viewportWidth = 0;
    #mql = null;
    #motion = null;
    #frameObserver = null;
    #composerCleanup = null;
    #marqueeLabel = null;
    #marqueeRO = null;
    #marqueeFrame = null;
    #keyboardFrame = null;
    #mountFrame = null;
    #scrollFrame = null;
    #navigateFrame = null;
    #resizeTimer = null;
    #settleTimer = null;
    #retryTimer = null;
    #target = null;
    #navPending = false;
    #expandPending = false;
    #retryCount = 0;
    #mounted = false;
    #disposed = false;
    constructor(options) {
        this.#options = options;
    }
    returnToChat() {
        this.navigate('chat', true);
    }
    navigate(page, afterCommit = false) {
        const frame = this.#frame;
        if (frame === null || !this.#mql?.matches || this.#disposed)
            return;
        const leftNow = page === 'chat' ? chatPageLeft(frame) : 0;
        const pending = this.#navigateFrame !== null || this.#navPending;
        if (this.#target === page && (pending || Math.abs(frame.scrollLeft - leftNow) > 2))
            return;
        this.#target = page;
        this.#navPending = true;
        frame.setAttribute(TARGET_ATTR, page);
        if (this.#settleTimer !== null)
            window.clearTimeout(this.#settleTimer);
        this.#settleTimer = null;
        this.#cancelDeferred();
        const place = () => {
            this.#navigateFrame = null;
            if (this.#disposed || this.#target !== page) {
                this.#navPending = false;
                return;
            }
            const left = page === 'chat' ? chatPageLeft(frame) : 0;
            if (Math.abs(frame.scrollLeft - left) <= 1) {
                this.#navPending = false;
                frame.scrollTo({ left, behavior: 'instant' });
                this.#settlePager();
                return;
            }
            // The scroll owns the frame now. An older scrollend can no longer cancel it.
            this.#navPending = false;
            frame.scrollTo({ left, behavior: this.#motion?.matches ? 'instant' : 'smooth' });
        };
        // Session mounting paints on the main thread. The first frame lets that
        // paint finish; the second frame starts the slide, so the two do not fight.
        if (afterCommit) {
            this.#navigateFrame = requestAnimationFrame(() => {
                this.#navigateFrame = requestAnimationFrame(place);
            });
        }
        else
            place();
    }
    mount() {
        if (this.#mounted || this.#disposed)
            return;
        const frame = findFrame();
        if (frame === null) {
            if (this.#retryCount++ < 40) {
                this.#retryTimer = window.setTimeout(() => {
                    this.#retryTimer = null;
                    this.mount();
                }, 100);
            }
            return;
        }
        this.#mounted = true;
        this.#frame = frame;
        this.#viewportWidth = frame.clientWidth;
        controllers.set(frame, this);
        this.#mql = window.matchMedia(exports.PAGER_BREAKPOINT);
        this.#motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.#mql.addEventListener('change', this.#onBreakpointChange);
        this.#motion.addEventListener('change', this.#requestMarqueeSync);
        window.visualViewport?.addEventListener('resize', this.#requestKeyboard);
        window.visualViewport?.addEventListener('scroll', this.#requestKeyboard);
        window.addEventListener('resize', this.#onWindowResize);
        document.addEventListener('click', this.#onDocClickCapture, true);
        document.addEventListener('pointerdown', this.#onDocClickCapture, true);
        frame.addEventListener('scroll', this.#onPagerScroll, { passive: true });
        frame.addEventListener('scrollend', this.#settlePager);
        const clearDrawerInert = () => {
            if (!this.#mql?.matches) return;
            for (const child of frame.children) {
                if (child.hasAttribute('inert')) child.removeAttribute('inert');
            }
        };
        this.#frameObserver = new MutationObserver(() => {
            if (!frame.hasAttribute('data-sidebar-collapsed'))
                this.#expandPending = false;
            clearDrawerInert();
        });
        this.#frameObserver.observe(frame, { attributes: true, subtree: true, childList: true, attributeFilter: ['data-sidebar-collapsed', 'inert'] });
        clearDrawerInert();
        const root = document.getElementById('root') ?? document.body;
        this.#composerCleanup = (0, dom_watch_ts_1.observeRelevant)(root, MODEL_SLOT, this.#requestMarqueeSync, { childList: true, subtree: true, characterData: true });
        if (typeof ResizeObserver !== 'undefined') {
            this.#marqueeRO = new ResizeObserver(this.#requestMarqueeSync);
        }
        this.#ensureSidebarOpen();
        this.#placeInitialChat();
        this.#mountFrame = requestAnimationFrame(() => {
            this.#mountFrame = null;
            this.#ensureSidebarOpen();
            this.#placeInitialChat();
        });
        this.#requestKeyboard();
        this.#requestMarqueeSync();
    }
    dispose() {
        if (this.#disposed)
            return;
        this.#disposed = true;
        this.#mounted = false;
        this.#navPending = false;
        this.#frameObserver?.disconnect();
        this.#composerCleanup?.();
        this.#marqueeRO?.disconnect();
        this.#restoreMarquee();
        this.#mql?.removeEventListener('change', this.#onBreakpointChange);
        this.#motion?.removeEventListener('change', this.#requestMarqueeSync);
        window.removeEventListener('resize', this.#onWindowResize);
        window.visualViewport?.removeEventListener('resize', this.#requestKeyboard);
        window.visualViewport?.removeEventListener('scroll', this.#requestKeyboard);
        document.removeEventListener('click', this.#onDocClickCapture, true);
        document.removeEventListener('pointerdown', this.#onDocClickCapture, true);
        this.#cancelDeferred();
        for (const id of [this.#keyboardFrame, this.#mountFrame, this.#marqueeFrame, this.#scrollFrame]) {
            if (id !== null)
                cancelAnimationFrame(id);
        }
        for (const id of [this.#resizeTimer, this.#settleTimer, this.#retryTimer]) {
            if (id !== null)
                window.clearTimeout(id);
        }
        const frame = this.#frame;
        if (frame !== null) {
            controllers.delete(frame);
            frame.removeEventListener('scroll', this.#onPagerScroll);
            frame.removeEventListener('scrollend', this.#settlePager);
            frame.removeAttribute(exports.PAGE_ATTR);
            frame.removeAttribute(TARGET_ATTR);
            frame.removeAttribute(MOVING_ATTR);
            frame.style.removeProperty('--dshm-keyboard-inset');
            const card = findCenterCol(frame);
            if (card instanceof HTMLElement)
                card.style.removeProperty('--dshm-card-radius');
        }
        this.#frame = null;
    }
    #cancelDeferred() {
        if (this.#navigateFrame !== null)
            cancelAnimationFrame(this.#navigateFrame);
        this.#navigateFrame = null;
    }
    #ensureSidebarOpen = () => {
        const frame = this.#frame;
        if (!this.#mql?.matches || frame === null)
            return;
        if (!frame.hasAttribute('data-sidebar-collapsed')) {
            this.#expandPending = false;
            return;
        }
        if (this.#expandPending)
            return;
        this.#expandPending = true;
        this.#options.toggleSidebar();
    };
    #placeInitialChat = () => {
        if (this.#frame === null || !this.#mql?.matches)
            return;
        this.#frame.scrollTo({ left: chatPageLeft(this.#frame), behavior: 'instant' });
        this.#syncPage();
    };
    #syncPage = () => {
        const frame = this.#frame;
        if (frame === null || !this.#mql?.matches)
            return;
        const chatLeft = chatPageLeft(frame);
        if (chatLeft <= 0)
            return;
        const page = frame.scrollLeft < chatLeft / 2 ? 'sidebar' : 'chat';
        if (frame.getAttribute(exports.PAGE_ATTR) !== page)
            frame.setAttribute(exports.PAGE_ATTR, page);
    };
    #onBreakpointChange = () => {
        const frame = this.#frame;
        if (frame === null)
            return;
        this.#target = null;
        this.#navPending = false;
        frame.removeAttribute(TARGET_ATTR);
        frame.removeAttribute(MOVING_ATTR);
        this.#cancelDeferred();
        if (!this.#mql?.matches) {
            frame.removeAttribute(exports.PAGE_ATTR);
            const card = findCenterCol(frame);
            if (card instanceof HTMLElement)
                card.style.removeProperty('--dshm-card-radius');
            this.#restoreMarquee();
            return;
        }
        this.#ensureSidebarOpen();
        this.#placeInitialChat();
        this.#requestMarqueeSync();
    };
    #onWindowResize = () => {
        if (this.#resizeTimer !== null)
            window.clearTimeout(this.#resizeTimer);
        this.#resizeTimer = window.setTimeout(() => {
            this.#resizeTimer = null;
            const frame = this.#frame;
            if (frame === null || !this.#mql?.matches)
                return;
            const width = frame.clientWidth;
            if (width === this.#viewportWidth)
                return;
            this.#viewportWidth = width;
            const page = this.#target ?? frame.getAttribute(exports.PAGE_ATTR) ?? 'chat';
            frame.scrollTo({ left: page === 'chat' ? chatPageLeft(frame) : 0, behavior: 'instant' });
            this.#settlePager();
            this.#requestMarqueeSync();
        }, 120);
    };
    #onPagerScroll = () => {
        if (!this.#mql?.matches)
            return;
        const frame = this.#frame;
        if (frame !== null && !frame.hasAttribute(MOVING_ATTR))
            frame.setAttribute(MOVING_ATTR, '');
        if (this.#settleTimer !== null)
            window.clearTimeout(this.#settleTimer);
        this.#settleTimer = window.setTimeout(this.#settlePager, SCROLL_SETTLE_MS);
    };
    #settlePager = () => {
        if (this.#settleTimer !== null)
            window.clearTimeout(this.#settleTimer);
        this.#settleTimer = null;
        if (this.#navigateFrame !== null || this.#navPending)
            return;
        const frame = this.#frame;
        if (frame !== null && this.#target !== null) {
            const left = this.#target === 'chat' ? chatPageLeft(frame) : 0;
            if (Math.abs(frame.scrollLeft - left) > 2)
                return;
        }
        frame?.removeAttribute(MOVING_ATTR);
        this.#syncPage();
        this.#target = null;
        frame?.removeAttribute(TARGET_ATTR);
    };
    #onDocClickCapture = (event) => {
        const target = event.target;
        const frame = this.#frame;
        if (!(target instanceof Element) || frame === null || !this.#mql?.matches)
            return;
        if (event.type === 'pointerdown') {
            if (!frame.contains(target) || target.closest('[data-mobile-nav="toggle"], [data-mobile-nav="fab"]') !== null)
                return;
            this.#navPending = false;
            this.#cancelDeferred();
            this.#target = null;
            frame.removeAttribute(TARGET_ATTR);
            return;
        }
        const sidebar = findSidebarCol(frame);
        if (sidebar?.contains(target)) {
            const button = target.closest('button');
            if (button !== null && SIDEBAR_COLLAPSE_LABELS.has(button.getAttribute('aria-label') ?? '')) {
                event.preventDefault();
                event.stopPropagation();
                this.navigate('chat');
            }
            return;
        }
        if (frame.scrollLeft >= chatPageLeft(frame) / 2)
            return;
        if (findCenterCol(frame)?.contains(target)) {
            event.preventDefault();
            event.stopPropagation();
            this.navigate('chat');
        }
    };
    #requestKeyboard = () => {
        if (this.#keyboardFrame !== null || this.#disposed)
            return;
        this.#keyboardFrame = requestAnimationFrame(() => {
            this.#keyboardFrame = null;
            const frame = this.#frame;
            if (frame === null || !this.#mql?.matches || frame.hasAttribute(MOVING_ATTR))
                return;
            const active = document.activeElement;
            const editing = active instanceof HTMLElement && (active.isContentEditable || active.closest('input, textarea, [data-composer-input]') !== null);
            const vv = window.visualViewport;
            const raw = vv !== null ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
            const inset = editing && raw >= 80 ? raw : 0;
            const value = `${inset}px`;
            if (frame.style.getPropertyValue('--dshm-keyboard-inset') !== value)
                frame.style.setProperty('--dshm-keyboard-inset', value);
        });
    };
    #requestMarqueeSync = () => {
        if (this.#marqueeFrame !== null || this.#disposed || !this.#mql?.matches)
            return;
        this.#marqueeFrame = requestAnimationFrame(() => {
            this.#marqueeFrame = null;
            this.#syncMarquee();
        });
    };
    #restoreMarquee() {
        const label = this.#marqueeLabel;
        if (label === null)
            return;
        label.removeAttribute('data-dshm-marquee');
        label.style.removeProperty('--dshm-marquee-duration');
        const runner = label.querySelector('[data-dshm-marquee-runner]');
        if (runner !== null) {
            const original = [...runner.children].slice(0, runner.children.length / 2).flatMap(item => [...item.childNodes]);
            runner.replaceWith(...original);
        }
    }
    #syncMarquee = () => {
        const label = document.querySelector(MODEL_LABEL_SELECTOR);
        if (label !== this.#marqueeLabel) {
            this.#restoreMarquee();
            this.#marqueeRO?.disconnect();
            this.#marqueeLabel = label;
            if (label !== null)
                this.#marqueeRO?.observe(label);
        }
        if (label === null)
            return;
        const runner = label.querySelector('[data-dshm-marquee-runner]');
        const textWidth = runner === null ? label.scrollWidth : runner.scrollWidth / 2 - MARQUEE_GAP_PX;
        if (this.#motion?.matches || textWidth <= label.clientWidth) {
            this.#restoreMarquee();
            return;
        }
        if (runner === null) {
            const nodes = [...label.childNodes];
            const layer = document.createElement('span');
            layer.setAttribute('data-dshm-marquee-runner', '');
            for (const clone of [false, true]) {
                for (const node of nodes) {
                    const item = document.createElement('span');
                    item.setAttribute('data-dshm-marquee-item', '');
                    item.append(clone ? node.cloneNode(true) : node);
                    layer.append(item);
                }
            }
            label.append(layer);
        }
        if (!label.hasAttribute('data-dshm-marquee'))
            label.setAttribute('data-dshm-marquee', '');
        const duration = `${Math.max(5, Math.round((textWidth + MARQUEE_GAP_PX) / 50))}s`;
        if (label.style.getPropertyValue('--dshm-marquee-duration') !== duration)
            label.style.setProperty('--dshm-marquee-duration', duration);
    };
}
exports.PagerController = PagerController;

};
modules["effects/phone-chrome.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installPhoneChrome = installPhoneChrome;
/**
 * Phone chrome: KEEP the system status bar (no fullscreen) and make it
 * blend into the page. On narrow screens:
 * - The viewport meta gains viewport-fit=cover, so env(safe-area-inset-top)
 *   is the real status-bar / notch height and the stylesheet can push every
 *   surface below it (off notched phones, or in a browser tab where the
 *   layout viewport already sits below the status bar, the inset is 0 and
 *   nothing shifts).
 * - A theme-color meta tracks the shell background (the official theme is
 *   toggled by body[data-ds-dark-theme], which flips --dsw-alias-bg-base):
 *   Android then paints the status bar / URL bar with the page's own base
 *   color, so the status bar reads as part of the UI instead of a foreign
 *   strip. The drawer paints the same strip on iOS / notch displays.
 * - gesturestart is suppressed as the legacy-iOS fallback for double-tap
 *   zoom; modern browsers are covered by the stylesheet's
 *   touch-action: manipulation (which keeps pan and pinch zoom).
 */
function installPhoneChrome(ctx) {
    ctx.effect(() => {
        const narrow = window.matchMedia('(max-width: 1023px)');
        const viewport = document.querySelector('meta[name="viewport"]');
        const originalViewport = viewport?.content ?? '';
        const themeMeta = document.createElement('meta');
        themeMeta.name = 'theme-color';
        const bodyBg = () => getComputedStyle(document.body).backgroundColor;
        const sync = () => {
            if (viewport !== null)
                viewport.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
            themeMeta.content = bodyBg();
            if (themeMeta.parentElement === null)
                document.head.appendChild(themeMeta);
        };
        const restore = () => {
            if (viewport !== null)
                viewport.content = originalViewport;
            themeMeta.remove();
        };
        const onGestureStart = (event) => event.preventDefault();
        if (narrow.matches)
            sync();
        const onChange = (event) => (event.matches ? sync() : restore());
        narrow.addEventListener('change', onChange);
        const observer = new MutationObserver(() => {
            if (narrow.matches)
                themeMeta.content = bodyBg();
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] });
        document.addEventListener('gesturestart', onGestureStart);
        return () => {
            narrow.removeEventListener('change', onChange);
            observer.disconnect();
            document.removeEventListener('gesturestart', onGestureStart);
            restore();
        };
    }, 'dsh-mobile-nav: status bar theme + viewport + zoom guard');
}

};
modules["effects/stats-line.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installStatsLine = installStatsLine;
const dom_watch_ts_1 = require("./dom-watch.js");
function installStatsLine(ctx) {
    ctx.effect(() => {
        const narrow = window.matchMedia('(max-width: 1023px)');
        let cleanup;
        const install = () => {
            cleanup?.();
            cleanup = undefined;
            if (!narrow.matches)
                return;
            const moveTps = (stats) => {
                if ([...stats.children].some((c) => /^TPS\s+\d/.test((c.textContent ?? '').trim())))
                    return;
                const stack = stats.closest('[class$="_composerStack"]');
                if (stack === null)
                    return;
                for (const el of stack.querySelectorAll('div')) {
                    if (el.children.length === 0 && /^TPS\s+\d/.test((el.textContent ?? '').trim())) {
                        stats.appendChild(el);
                        return;
                    }
                }
            };
            const mark = () => {
                for (const root of document.querySelectorAll('[class$="_composerStack"] [class$="_root"]')) {
                    if (root.matches('[data-testid="todo-panel"]'))
                        continue;
                    if (root.querySelector('button, textarea, [data-composer-input]') !== null)
                        continue;
                    if (!/(turns|steps|\bLLM\b|轮|步)/.test(root.textContent ?? ''))
                        continue;
                    if (root.getAttribute('data-mobile-nav') !== 'stats')
                        root.setAttribute('data-mobile-nav', 'stats');
                    moveTps(root);
                    return;
                }
            };
            cleanup = (0, dom_watch_ts_1.observeRelevant)(document.body, '[class$="_composerStack"]', mark);
            mark();
        };
        install();
        narrow.addEventListener('change', install);
        return () => {
            narrow.removeEventListener('change', install);
            cleanup?.();
        };
    }, 'dsh-mobile-nav: stats line marker');
}

};
modules["index.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inject = void 0;
exports.apply = apply;
const MobileNavToggle_tsx_1 = require("./MobileNavToggle.js");
const MobileNavOverlay_tsx_1 = require("./MobileNavOverlay.js");
const MobileDrawerFooter_tsx_1 = require("./MobileDrawerFooter.js");
const index_ts_1 = require("./styles/index.js");
const debug_ts_1 = require("./debug.js");
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
const aionui_compat_ts_1 = require("./effects/aionui-compat.js");
const stats_line_ts_1 = require("./effects/stats-line.js");
const composer_toggle_ts_1 = require("./effects/composer-toggle.js");
const pager_ts_1 = require("./effects/pager.js");
const locales_ts_1 = require("./locales.js");
/** Required services (cordis fiber inject — the loader passes all module exports as an object plugin). */
exports.inject = ['slots', 'layout', 'locale', 'sessionLogDownload'];
/**
 * Mobile-adaptive shell, browser half: injects the mobile stylesheet, then
 * contributes the directory toggle to the session header and the backdrop +
 * floating button to the shell overlay.
 * @param ctx - client root context.
 */
function apply(ctx) {
    ctx.effect(() => ctx.locale.register(locales_ts_1.NS, { zh: locales_ts_1.zh, en: locales_ts_1.en }), 'dsh-mobile-nav: dictionaries');
    ctx.effect(() => {
        const tag = document.createElement('style');
        tag.dataset.plugin = '@dsh-external/dsh-mobile-nav';
        tag.dataset.pluginCss = '@dsh-external/dsh-mobile-nav/mobile.css';
        tag.textContent = index_ts_1.MOBILE_CSS;
        document.head.appendChild(tag);
        return () => {
            tag.remove();
        };
    }, 'dsh-mobile-nav: styles');
    // Diagnostic overlay for phone-side repros (?mobile-nav-debug=1).
    (0, debug_ts_1.installDebugBadge)(ctx);
    (0, phone_chrome_ts_1.installPhoneChrome)(ctx);
    (0, aionui_compat_ts_1.installAionuiCompat)(ctx);
    (0, stats_line_ts_1.installStatsLine)(ctx);
    (0, composer_toggle_ts_1.installComposerToggle)(ctx);
    // PiUI pager (ported from @dsh-external/dsh-mobile): turns the AppFrame
    // into a horizontal scroll-snap pager — an always-open sidebar/history
    // page and a full-width chat page. The sidebar is expanded once below the
    // breakpoint; swiping flips between the two pages.
    ctx.effect(() => {
        const controller = new pager_ts_1.PagerController({
            toggleSidebar: () => ctx.layout.toggleSidebar(),
        });
        controller.mount();
        return () => controller.dispose();
    }, 'dsh-mobile-nav: pager');
    ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
        name: 'conversation.session.header.actions',
        id: 'mobile-nav-toggle',
        order: 10,
        locale: locales_ts_1.NS,
        inject: () => ({
            toggleSidebar: () => ctx.layout.toggleSidebar(),
        }),
    }, MobileNavToggle_tsx_1.MobileNavToggle));
    ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'mobile-nav-overlay',
        order: 10,
        locale: locales_ts_1.NS,
        inject: () => ({
            toggleSidebar: () => ctx.layout.toggleSidebar(),
        }),
    }, MobileNavOverlay_tsx_1.MobileNavOverlay));
    // Session log download, relocated from the session header to the drawer
    // footer on mobile (the header capsule is hidden by CSS); the drawer
    // footer also hosts the Files action that opens the dsh-web-ui explorer
    // sheet.
    //
    // Footer stacking relies on the list-slot sort by (priority, order):
    // dsh-remote-web-ui leaves it unset (default 0, its two icon buttons stay
    // on top) and dsh-usage-stats uses 10. Order 5 keeps the Files + Session
    // log pills directly under the icon row with the usage/balance badge
    // below them — instead of a tie at 10 where registration order could
    // wedge the badge between the icons and the pills.
    ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
        name: 'sidebar.footer.action',
        id: 'mobile-nav-session-log',
        order: 5,
        locale: locales_ts_1.NS,
        inject: () => ({
            downloadSessionLog: (sessionId) => ctx.sessionLogDownload.download(sessionId),
            toggleSidebar: () => ctx.layout.toggleSidebar(),
        }),
    }, MobileDrawerFooter_tsx_1.MobileDrawerFooter));
}

};
modules["locales.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.en = exports.zh = exports.NS = void 0;
/** `mobileNav` namespace dictionaries: drawer controls. */
exports.NS = 'mobileNav';
/** Simplified Chinese dictionary (the key-set source of truth). */
exports.zh = {
    'open': '打开目录',
    'close': '收起目录',
    'backdrop': '点击关闭目录',
    'sessionLog': '导出会话日志',
    'files': '文件浏览',
    'previewFullscreen': '全屏预览',
    'previewExitFullscreen': '退出全屏',
};
/** English dictionary, key-identical to the Chinese source of truth. */
exports.en = {
    'open': 'Open directory',
    'close': 'Close directory',
    'backdrop': 'Click to close directory',
    'sessionLog': 'Session log',
    'files': 'Files',
    'previewFullscreen': 'Fullscreen preview',
    'previewExitFullscreen': 'Exit fullscreen',
};

};
modules["styles/base.css.js"] = function(require, module, exports) {
"use strict";
// base — split from src/client/mobile.css.ts (2026-08-16), order preserved.
// Do not reorder: styles/index.ts concatenates in this exact order.
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASE_CSS = void 0;
exports.BASE_CSS = `
/* ---------- base control styles (rendered at any width, hidden where unused) ---------- */

[data-mobile-nav="toggle"],
[data-mobile-nav="files"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: none;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--dsw-alias-label-secondary, inherit);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
[data-mobile-nav="toggle"]:hover,
[data-mobile-nav="files"]:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, .06));
}
[data-mobile-nav="toggle"]:focus-visible,
[data-mobile-nav="files"]:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary, #4f6ef7);
  outline-offset: 1px;
}

/* Drawer footer actions: the relocated Session log download plus the Files
   action that opens the dsh-web-ui explorer sheet. */
[data-mobile-nav="drawer-actions"] {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
[data-mobile-nav="session-log"],
[data-mobile-nav="explorer"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, .12));
  border-radius: 12px;
  background: transparent;
  color: var(--dsw-alias-label-primary, inherit);
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
[data-mobile-nav="session-log"]:hover:not(:disabled),
[data-mobile-nav="explorer"]:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, .06));
}
[data-mobile-nav="session-log"]:disabled {
  color: var(--dsw-alias-label-dimmed, rgba(0, 0, 0, .35));
  cursor: default;
}

/* Floating fallback button (hero / blank phases without a session header).
   The top clears the camera band below the status bar; when the client has
   set viewport-fit=cover the safe-area inset moves it below the notch too. */
[data-mobile-nav="fab"] {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 72px);
  left: 10px;
  z-index: 21;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, .12));
  border-radius: 50%;
  background: var(--dsw-alias-button-floating-fill, #ffffff);
  color: var(--dsw-alias-label-primary, inherit);
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, .18);
  -webkit-tap-highlight-color: transparent;
}
[data-mobile-nav="fab"]:hover {
  background: var(--dsw-alias-button-floating-hover, rgba(0, 0, 0, .08));
}
[data-mobile-nav="fab"]:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary, #4f6ef7);
  outline-offset: 2px;
}

/* Dimmed backdrop under the open drawer; above every column, below the drawer. */
[data-mobile-nav="backdrop"] {
  position: absolute;
  inset: 0;
  z-index: 30;
  background: rgba(0, 0, 0, .45);
  cursor: pointer;
  animation: dsh-mobile-nav-fade .2s var(--ds-ease-in-out, ease-in-out);
  -webkit-tap-highlight-color: transparent;
}
@keyframes dsh-mobile-nav-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* Settings sheet entrance: the official dialog mounts with no animation at
   all, so it snaps in. Fade + slight rise/scale reads as a proper sheet. */
@keyframes dsh-mobile-nav-sheet-in {
  from {
    opacity: 0;
    transform: translateY(14px) scale(.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
/* Preview sheet rise: the aionui preview column opens as a bottom sheet. */
@keyframes dsh-mobile-nav-sheet-up {
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
`;

};
modules["styles/compat.css.js"] = function(require, module, exports) {
"use strict";
// compat — split from src/client/mobile.css.ts (2026-08-16), order preserved.
// Do not reorder: styles/index.ts concatenates in this exact order.
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPAT_CSS = void 0;
exports.COMPAT_CSS = `  /* ---------- dsh-web-ui family compatibility ----------
     The linxin666 plugin suite extends the shell frame directly:
       - aionui-panel appends two trailing grid columns (explorer / preview)
         plus absolute drag handles to [data-dsh-frame]; its 5-track inline
         grid is already overridden above, but the handles and columns would
         still float over the main UI. On mobile the columns leave the grid
         as floating bottom sheets and keep their own visibility state —
         the suite's collapse chevron / preview tabs still work, so no
         feature is lost. The task-board / ssh plugins inject sidebar
         entries and center-column takeover panels; the entries need
         spacing and the kanban needs scrollable columns. */

  /* Touch devices: the drag handles are useless — the floating expand
     button is the opener. */
  .aionui-explorer-handle,
  .aionui-preview-handle {
    display: none !important;
  }

  /* Shared base: both columns leave the grid as floating panels. The
     explorer is gated shut by default (its own persisted expanded state
     must never cover the mobile UI on load); the header Files action opens
     it via the frame marker below, and the sheet's own collapse chevron
     clears it. Preview stays owned by the suite (hidden while no tab is
     open). The per-column rules below override the geometry. */
  [data-aionui-explorer-col],
  [data-aionui-preview-col] {
    position: fixed !important;
    z-index: 55 !important;
    background: var(--aion-bg-base, #ffffff) !important;
    border-left: none !important;
  }
  /* Explorer (file tree) bottom sheet: bottom edge aligned exactly with
     the composer card's bottom line — the card sits 36px above the
     viewport bottom (8px composer padding + the 28px stats strip below
     the card), so the sheet uses the same 36px bottom offset. */
  [data-aionui-explorer-col] {
    visibility: hidden !important;
    left: 8px !important;
    right: 8px !important;
    top: auto !important;
    bottom: 36px !important;
    width: auto !important;
    height: min(55dvh, 460px) !important;
    max-height: calc(100dvh - 44px) !important;
    border-radius: 14px !important;
    overflow: hidden !important;
    box-shadow: 0 -4px 28px rgba(0, 0, 0, .18) !important;
    animation: none !important;
  }
  /* Preview (file content) bottom sheet. Gated shut by default: the suite
     persists open preview tabs in localStorage and restores them on load,
     which would pop the sheet over the fresh UI. The client only sets the
     frame marker after the user taps a file row in the explorer; the
     suite's own collapse chevron clears it via the visibility watcher. */
  [data-aionui-preview-col] {
    visibility: hidden !important;
    position: fixed !important;
    left: 8px !important;
    right: 8px !important;
    top: auto !important;
    bottom: 40px !important;
    width: auto !important;
    height: min(50dvh, 420px) !important;
    max-height: calc(100dvh - 48px) !important;
    border-radius: 14px !important;
    overflow: hidden !important;
    box-shadow: 0 -4px 28px rgba(0, 0, 0, .18) !important;
    z-index: 56 !important;
    animation: none !important;
    /* Fullscreen toggle (issue #8): animate the geometry change instead of
       snapping. visibility is deliberately not listed, so opening/closing
       the sheet stays instant; the open/close keyframes own transform. */
    transition:
      left .24s var(--ds-ease-out, ease-in-out),
      right .24s var(--ds-ease-out, ease-in-out),
      top .24s var(--ds-ease-out, ease-in-out),
      bottom .24s var(--ds-ease-out, ease-in-out),
      width .24s var(--ds-ease-out, ease-in-out),
      height .24s var(--ds-ease-out, ease-in-out),
      border-radius .24s var(--ds-ease-out, ease-in-out),
      box-shadow .24s var(--ds-ease-out, ease-in-out),
      padding-top .24s var(--ds-ease-out, ease-in-out) !important;
  }
  /* User-opened preview sheet (frame marker, set on file-row tap). */
  [data-mobile-nav="frame"][data-aionui-preview-open] [data-aionui-preview-col] {
    visibility: visible !important;
  }
  /* The Files action opens the explorer sheet (frame marker). */
  [data-mobile-nav="frame"][data-aionui-explorer-open] [data-aionui-explorer-col] {
    visibility: visible !important;
  }
  /* While the preview sheet is up, the explorer sheet yields (two stacked
     bottom sheets would read as one broken overlay). Closing the preview
     via its collapse chevron / tab close clears the marker, and the
     explorer sheet returns. Same specificity as the explorer-open rule, so
     this must stay AFTER it. */
  [data-mobile-nav="frame"][data-aionui-preview-open] [data-aionui-explorer-col] {
    visibility: hidden !important;
  }
  /* The open drawer must never sit under a sheet: while the frame is in the
     narrow-expanded state both sheets yield (later in the file than the
     open marker rule, so it wins at equal specificity). The fullscreen
     toggle has its own drawer-open rule at the end of its section. */
  [data-mobile-nav="frame"]:not([data-sidebar-collapsed]) [data-aionui-explorer-col],
  [data-mobile-nav="frame"]:not([data-sidebar-collapsed]) [data-aionui-preview-col] {
    visibility: hidden !important;
    display: none !important;
  }
  /* The suite's own expand button reads the store state we bypass on
     mobile — hide it; the header Files action is the opener. */
  .aionui-floating-expand {
    display: none !important;
  }

  /* Preview sheet fullscreen toggle (issue #8): a fixed button parked in the
     sheet's titlebar row, just left of the suite's collapse chevron (24px at
     right:8px of the sheet, and the sheet spans 8px..(100vw-8px)). The top
     calc mirrors the sheet geometry above (bottom 40px + min(50dvh, 420px));
     when the frame carries "data-mobile-preview-full" the sheet goes
     fullscreen and the button moves to the viewport corner. */
  [data-mobile-nav="preview-full-toggle"] {
    position: absolute !important;
    right: 36px !important;
    top: 8px !important;
    z-index: 57 !important;
    display: none !important;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--aion-text-secondary, var(--dsw-alias-label-secondary, inherit));
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    /* Native look: same size/radius/hover language as the suite's tab-bar
       icon buttons (the 20px panelCollapse next to it). The button lives
       INSIDE the preview column, so it rides the sheet's own open
       animation and geometry transition — no curve matching needed. */
    transition: background-color .15s, top .24s var(--ds-ease-out, ease-in-out);
  }
  [data-mobile-nav="preview-full-toggle"]:hover {
    background: var(--aion-bg-3, rgba(0, 0, 0, .22));
  }
  [data-mobile-nav="preview-full-toggle"]:active {
    background: var(--aion-bg-active, rgba(0, 0, 0, .28));
  }
  [data-mobile-nav="preview-full-toggle"]:focus-visible {
    outline: 2px solid var(--dsw-alias-state-business-primary, #4f6ef7);
    outline-offset: 2px;
  }
  [data-mobile-nav="preview-full-toggle"] svg {
    width: 14px;
    height: 14px;
  }
  /* Keep the last tab (and the "+" URL-tab trigger) from sliding under the
     fullscreen toggle: reserve the right end of the preview tab row. */
  [data-aionui-preview-col] [class$="_tabScroll"] {
    padding-right: 34px !important;
  }
  /* Visible only while the preview sheet is open. Visibility itself is
     inherited from the column, so the sheet's own hide rules (collapse,
     drawer open) cover the button too. */
  [data-mobile-nav="frame"][data-aionui-preview-open] [data-aionui-preview-col] [data-mobile-nav="preview-full-toggle"] {
    display: inline-flex !important;
  }
  /* Icon swap on the frame fullscreen marker. */
  [data-mobile-nav="preview-full-toggle"] .dsh-mobile-nav-full-out {
    display: none !important;
  }
  [data-mobile-nav="frame"][data-mobile-preview-full] [data-aionui-preview-col] [data-mobile-nav="preview-full-toggle"] .dsh-mobile-nav-full-in {
    display: none !important;
  }
  [data-mobile-nav="frame"][data-mobile-preview-full] [data-aionui-preview-col] [data-mobile-nav="preview-full-toggle"] .dsh-mobile-nav-full-out {
    display: inline !important;
  }
  /* Fullscreen preview: the sheet fills the whole viewport (notch included);
     the safe-area padding drops the titlebar row below the status bar, and
     the toggle follows the titlebar into the top corner. */
  [data-mobile-nav="frame"][data-aionui-preview-open][data-mobile-preview-full] [data-aionui-preview-col] {
    inset: 0 !important;
    left: 0 !important;
    right: 0 !important;
    top: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100dvh !important;
    max-height: none !important;
    box-sizing: border-box !important;
    padding-top: env(safe-area-inset-top, 0px) !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    z-index: 57 !important;
    animation: none !important;
  }
  /* Fullscreen: the column fills the viewport, so the button follows the
     titlebar row down below the notch. */
  [data-mobile-nav="frame"][data-mobile-preview-full] [data-aionui-preview-col] [data-mobile-nav="preview-full-toggle"] {
    top: calc(env(safe-area-inset-top, 0px) + 8px) !important;
  }
  @media (prefers-reduced-motion: reduce) {
    [data-aionui-preview-col],
    [data-mobile-nav="preview-full-toggle"] {
      transition: none !important;
      animation: none !important;
    }
  }

  /* dsh-web-ui sidebar entries (task board / ssh) sit flush against each
     other — give the injected rows breathing room. */
  button[data-dsh-taskboard-entry],
  button[data-dsh-ssh-entry] {
    margin-bottom: 8px !important;
  }

  /* Task board: five kanban columns at minmax(0,1fr) crush into ~78px phone
     strips. Give every column a usable minimum and let the row scroll. */
  [data-dsh-taskboard-board] > [class$="_columns"] {
    grid-template-columns: repeat(5, minmax(240px, 1fr)) !important;
    overflow-x: auto !important;
  }
  /* The floating button must not float over a takeover panel (task board /
     ssh own the center column while active). */
  html[data-dsh-taskboard-active] [data-mobile-nav="fab"],
  html[data-dsh-ssh-active] [data-mobile-nav="fab"],
  html[data-dsh-taskboard-active] [data-mobile-nav="backdrop"],
  html[data-dsh-ssh-active] [data-mobile-nav="backdrop"] {
    display: none !important;
  }
  /* Board header: let the search field take the slack instead of squeezing
     the action buttons. */
  [data-dsh-taskboard-board] > [class$="_boardHeader"] [class$="_search"] {
    flex: 1 1 auto !important;
    min-width: 80px !important;
  }

  /* ---------- dsh-web-ui polish: plugin market search ----------
     The market tab row (Discover / Themes / Installed + the plugin search
     box) is a no-wrap flex: at 390px the tabs plus the ~218px search box
     (~475px total) overflow the ~334px sheet and the search box runs off
     the right edge of the screen (it also forces a horizontal scrollbar on
     the sheet's options area). Let the row wrap: the tabs keep the first
     line and the search box gets its own full-width second line. */

  [aria-modal="true"] [class$="_tabs"] {
    flex-wrap: wrap !important;
    row-gap: 8px !important;
  }
  [aria-modal="true"] [class$="_searchInline"] {
    flex: 1 1 100% !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  /* ---------- dsh-usage-stats polish: usage & balance panel ----------
     The panel's stats row shows three token counters side by side
     (today / month / total). The counters use tabular nowrap figures whose
     min-content width overflows the ~336px panel body on a phone: figures
     clip at the row's edges and the panel grows a horizontal scrollbar.
     Stack the three counters vertically — full-width rows, so the figures
     always fit. */

  [class*="usg_"][class$="_statsRow"] {
    flex-direction: column !important;
  }
  [class*="usg_"][class$="_stat"] {
    flex: 0 0 auto !important;
    width: 100% !important;
    min-width: 0 !important;
  }

  /* ---------- dsh-web-ui polish: settings sheet ----------
     The official dialog is a desktop two-column form; on a phone the
     label/control split leaves a huge dead gap and long descriptions wrap
     into tall stacks. Stack each row (text above, control full-width) and
     keep the nav tabs on ONE horizontally scrolling row. */

  /* Nav tabs: single scrolling row instead of the 3-per-row grid — seven
     categories wrap into three rows on a phone (~130px of sheet height);
     one row with a thin scrollbar keeps every tab reachable and returns
     that space to the options area (user feedback 2026-08-16). An earlier
     one-row attempt had no scroll affordance and silently cut the last
     tab off; the thin scrollbar IS the affordance. Scoped to the frame
     marker: the desktop dialog keeps its official vertical nav column. */
  [data-mobile-nav="frame"] [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :first-child [class$="_navList"] {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    gap: 6px !important;
    width: 100% !important;
    scrollbar-width: thin !important;
    -webkit-overflow-scrolling: touch !important;
  }
  /* Hairline scrollbar for the tab row: the default WebKit scrollbar reads
     fat on a phone; 2px keeps the scroll affordance without the bulk. */
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_navList"]::-webkit-scrollbar {
    height: 2px !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_navList"]::-webkit-scrollbar-thumb {
    background: var(--dsw-alias-border-l2, rgba(0, 0, 0, .22)) !important;
    border-radius: 1px !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_navList"]::-webkit-scrollbar-track {
    background: transparent !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_navCell"] {
    flex: 0 0 auto !important;
    white-space: nowrap !important;
    padding: 6px 8px !important;
    gap: 6px !important;
    font-size: 13px !important;
    justify-content: flex-start !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_navCell"] svg {
    width: 14px !important;
    height: 14px !important;
    flex: none !important;
  }
  /* Content toolbar: the "Open configuration file" button is hidden on
     mobile — it is rarely needed on a phone and steals ~180px from the
     tab row's scroll area (user feedback 2026-08-16). Only the close ✕
     stays, flush right in the nav row. Desktop untouched (frame scoped). */
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_header"] [class$="_actions"] {
    display: none !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_header"] [class$="_actions"] [class$="_action"] {
    font-size: 13px !important;
    padding: 6px 12px !important;
    min-height: 0 !important;
  }
  /* Setting rows: text on top, control below at full width. */
  [aria-modal="true"] [class$="_section"] [class$="_row"] {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 8px !important;
  }
  [aria-modal="true"] [class$="_section"] [class$="_row"] > :first-child {
    width: 100% !important;
    max-width: none !important;
  }
  [aria-modal="true"] [class$="_section"] [class$="_row"] > :last-child {
    width: 100% !important;
    max-width: none !important;
  }
  /* Appearance mode group: give the cube row a consistent bordered
     segmented look (the official borders differ per state). */
  [aria-modal="true"] [class$="_cubeRow"] > * {
    border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, .12)) !important;
  }

  /* ---------- dsh-web-ui polish: explorer sheet ----------
     The aionui explorer was designed for a desktop side column: compact the
     header, search box and tree rows so a phone shows more entries, and pad
     the scroll bottom so the last row never sits flush on the edge. */

  [data-aionui-explorer-col] [class$="_tabBar"] {
    height: 36px !important;
  }
  [data-aionui-explorer-col] [class$="_tabBtn"],
  [data-aionui-explorer-col] [class$="_tabBtnActive"] {
    padding: 0 12px !important;
    font-size: 13px !important;
  }
  [data-aionui-explorer-col] [class$="_searchBox"] {
    height: 32px !important;
    font-size: 13px !important;
  }
  [data-aionui-explorer-col] [class*="_treeRow"] {
    height: 30px !important;
    font-size: 13px !important;
  }
  [data-aionui-explorer-col] [class*="_treeRow"] svg {
    width: 14px !important;
    height: 14px !important;
  }
  [data-aionui-explorer-col] [class$="_scrollArea"] {
    padding-bottom: 28px !important;
  }

  /* ---------- dsh-web-ui polish: drawer footer ----------
     The injected footer actions (Files + Session log) become two equal pill
     buttons instead of text-width capsules. */

  /* The official footerActions row also hosts the remote-web-ui entry
     row (two icon buttons); without wrapping the two groups squeeze each
     other on one line. Wrap so each group gets its own full-width row. */
  [data-mobile-nav="frame"] [class$="_footerActions"] {
    flex-wrap: wrap !important;
    gap: 6px !important;
  }
  [data-mobile-nav="drawer-actions"] {
    width: 100% !important;
  }
  [data-mobile-nav="drawer-actions"] > button {
    flex: 1 1 0 !important;
    padding: 0 8px !important;
    white-space: nowrap !important;
  }

  /* ---------- dsh-web-ui polish: floating pet ----------
     The whale-girl pet (dsh-pet) floats at the viewport corner with a
     persisted, draggable position. On phones the pet is scaled down so
     it does not dominate the screen; the plugin's own drag + persist
     still work (the position itself is left alone — the mobile default
     position is seeded via the pet API to just above the composer). */

  body > [class$="_float"]:has([class$="_sprite"][role="button"]) {
    transform: scale(.66);
    transform-origin: bottom right;
  }
  /* While a modal dialog (settings sheet / export) owns the screen the pet
     floats ABOVE it and covers the dialog content; modal semantics say the
     background is inert, so hide the pet for the modal's lifetime. */
  body:has([aria-modal="true"]) > [class$="_float"]:has([class$="_sprite"][role="button"]) {
    display: none !important;
  }

  /* ---------- dsh-web-ui polish: conversation stats line ----------
     The official session-status row (turns / steps / LLM time / TTFT /
     cache) is long. The client marks the exact row with
     [data-mobile-nav="stats"] (text-anchored, hashed classes can't be
     targeted). Layout: ONE fixed-height (28px) flex strip that scrolls
     horizontally — the full metrics stream stays reachable by swiping,
     the row never grows vertically, no ellipsis or fade, 12px gaps
     between metric groups, a 2px scrollbar as the swipe affordance. */

  [data-mobile-nav="stats"] {
    display: flex !important;
    flex-flow: row nowrap !important;
    align-items: center !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: 28px !important;
    min-height: 28px !important;
    max-height: 28px !important;
    box-sizing: border-box !important;
    white-space: nowrap !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    scrollbar-width: thin !important;
    scrollbar-color: var(--dsw-alias-border-l1, rgba(0, 0, 0, .28)) transparent !important;
    padding: 0 0 4px !important;
    line-height: 20px !important;
    font-size: 12px !important;
  }
  [data-mobile-nav="stats"]::-webkit-scrollbar {
    height: 2px !important;
  }
  [data-mobile-nav="stats"]::-webkit-scrollbar-thumb {
    background: var(--dsw-alias-label-tertiary, rgba(0, 0, 0, .3)) !important;
    border-radius: 2px !important;
  }
  [data-mobile-nav="stats"]::-webkit-scrollbar-track {
    background: transparent !important;
  }
  [data-mobile-nav="stats"] > * {
    display: flex !important;
    flex: 0 0 auto !important;
    flex-flow: row nowrap !important;
    align-items: center !important;
    width: max-content !important;
    min-width: max-content !important;
    max-width: none !important;
    white-space: nowrap !important;
    margin-right: 12px !important;
    padding: 0 !important;
  }
  [data-mobile-nav="stats"] > *:last-child {
    margin-right: 0 !important;
  }
  [data-mobile-nav="stats"] * {
    white-space: nowrap !important;
  }

  /* ---------- dsh-genui panel dock ----------
     The genui panel docks above the composer (conversation.input.dock,
     id genui-panel). On a phone its business-blue outline, generous chrome
     and single-line ellipsis read as an unfinished artifact: long titles
     truncate mid-word ("…default b···") with the chevron glued to the
     ellipsis, and the pill crowds the composer. Mobile treatment: neutral
     card border matching the composer, tighter chrome so the full title
     fits, chevron with breathing room. Scoped to the mobile frame marker —
     desktop keeps genui's own styling untouched. */

  [data-mobile-nav="frame"] [data-genui-panel] {
    margin: 6px 12px 4px !important;
    border-color: var(--dsw-alias-border-l1, rgba(0, 0, 0, .12)) !important;
    border-radius: 12px !important;
  }
  [data-mobile-nav="frame"] [data-genui-panel] [class*="_panelToggle"] {
    padding: 7px 12px !important;
    gap: 8px !important;
  }
  [data-mobile-nav="frame"] [data-genui-panel] [class*="_panelBadge"] {
    padding: 0 7px !important;
    border-radius: 5px !important;
    font-size: 10.5px !important;
    line-height: 1.7 !important;
  }
  [data-mobile-nav="frame"] [data-genui-panel] [class*="_panelTitle"] {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    font-size: 12.5px !important;
    line-height: 1.45 !important;
  }
  [data-mobile-nav="frame"] [data-genui-panel] [class*="_panelChevron"] {
    flex: none !important;
    margin-left: 0 !important;
    padding-left: 4px !important;
  }

  /* ---------- git-graph branch chip: inside the composer card ----------
     The branch chip (conversation.input.dock) floats between the dock rows
     and the input card; on a phone it reads as a stray capsule crowding the
     composer. A client effect (MobileNavOverlay) reparents the chip INTO
     the composer card; these rules pin it to the card's top-left and give
     the card a dedicated chip row. The card is position: relative by the
     official stylesheet, so the absolute anchor resolves against it. The
     plugin's own sheet sets all four offsets on the anchor, so right/bottom
     must be neutralized too. Scope is the frame marker + the anchor
     attribute (NOT the dock slot — the reparenting moves the chip out of
     the dock's subtree). Desktop untouched: the frame marker only exists
     below 1024px, and the effect restores the chip to the dock when the
     viewport widens. Chip row geometry (2026-08-16, user feedback): 48px
     padding left a 16px dead gap between the chip and the input line and
     made the composer read too tall; the row is now 40px = chip (24px) at
     top 12px + ~4px to the textarea — the chip sits slightly lower and
     the gap is compressed without touching the official height budget
     further. */

  [data-mobile-nav="frame"] [data-gitgraph-chip-anchor] {
    position: absolute !important;
    top: 12px !important;
    left: 12px !important;
    right: auto !important;
    bottom: auto !important;
    z-index: 1 !important;
  }
  [data-mobile-nav="frame"] [class$="_card"]:has([data-gitgraph-chip-anchor]) {
    padding-top: 40px !important;
  }
`;

};
modules["styles/index.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOBILE_CSS = void 0;
const base_css_ts_1 = require("./base.css.js");
const layout_css_ts_1 = require("./layout.css.js");
const compat_css_ts_1 = require("./compat.css.js");
const misc_css_ts_1 = require("./misc.css.js");
/**
 * All mobile styles, concatenated in the exact order of the original
 * single-file stylesheet (base → layout → compat → misc, where misc keeps
 * composer → tablet → desktop). Injected as ONE <style data-plugin> tag —
 * do not reorder.
 */
exports.MOBILE_CSS = [base_css_ts_1.BASE_CSS, layout_css_ts_1.LAYOUT_CSS, compat_css_ts_1.COMPAT_CSS, misc_css_ts_1.MISC_CSS].join('\n');

};
modules["styles/layout.css.js"] = function(require, module, exports) {
"use strict";
// layout — split from src/client/mobile.css.ts (2026-08-16), order preserved.
// PiUI pager structure ported from @dsh-external/dsh-mobile (lehhair/dsh-mobile)
// and adapted to the `[data-mobile-nav="frame"]` marker + 1023px breakpoint.
// Do not reorder: styles/index.ts concatenates in this exact order.
Object.defineProperty(exports, "__esModule", { value: true });
exports.LAYOUT_CSS = void 0;
exports.LAYOUT_CSS = `/* ---------- mobile-only layout ---------- */

/* --- PiUI pager tokens (scoped to the frame) --- */
[data-mobile-nav="frame"] {
  /* Safe-area insets (notched phones, standalone PWA). env() resolves to
     0px in browsers without the concept. */
  --dshm-safe-top: env(safe-area-inset-top, 0px);
  --dshm-safe-right: env(safe-area-inset-right, 0px);
  --dshm-safe-bottom: env(safe-area-inset-bottom, 0px);
  --dshm-safe-left: env(safe-area-inset-left, 0px);
  /* Virtual-keyboard inset, driven by the pager controller (visualViewport). */
  --dshm-keyboard-inset: 0px;
  /* Sidebar page width (phones): at least the sidebar's own 280px content
     width, at most 360px, with ~70vw — the chat card then shows only a
     sliver on the right (PiUI's overlayWidth idea). Wide mobile screens
     (561-1023px) override this token below so the page grows toward half
     the viewport. */
  --dshm-sidebar-width: clamp(280px, 70vw, 360px);
  -webkit-tap-highlight-color: transparent;
}

@media (max-width: 1023px) {
  /* --- Phone chrome ---
     The system status bar stays visible (no fullscreen). Two adjustments
     make it behave:
     - touch-action: manipulation kills double-tap-to-zoom (and the 300ms
       tap delay) while keeping pan and pinch zoom.
     - With the client's viewport-fit=cover, env(safe-area-inset-top) is the
       status bar / notch height; the rules below push the app content below
       it so the status bar never covers anything. */
  html,
  body {
    touch-action: manipulation !important;
  }

  /* --- PiUI pager (sub-desktop viewports) ---
     The AppFrame keeps at least one of its two data attributes in every
     state; the union selects the frame on any viewport. Reflow the grid
     tracks into two snap pages: the sidebar page at the half-open width,
     the chat page full-width (so the chat stays visible beside the
     sidebar), the details track dropped (no phone use). */
  [data-mobile-nav="frame"] {
    position: relative !important;
    grid-template-columns: var(--dshm-sidebar-width) 100% 0 !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    transition: none !important;
    /* The top padding clears the status bar / notch for every in-flow
       surface (session header, messages, composer). */
    padding-top: env(safe-area-inset-top, 0px) !important;
  }

  /* DSH 0.2.2+ native drawer mask collides with the PiUI horizontal pager; hide it on mobile pager. */
  [data-mobile-nav="frame"] > [data-sidebar-mask] {
    display: none !important;
    pointer-events: none !important;
  }

  /* DSH 0.2.2+ keepAboveClosing() expands [data-chat-turn-spacer] to ~50vh when collapsing tool steps, leaving running indicator floating above a huge void on phones. */
  [data-mobile-nav="frame"] [data-chat-turn-spacer] {
    height: 0 !important;
    min-height: 0 !important;
  }

  /* Hide the pager's own horizontal scrollbar on every engine. */
  [data-mobile-nav="frame"]::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }

  /* The two live pages snap to the scrollport start (scroll-snap-stop keeps
     a fast swipe from skipping a page). */
  [data-mobile-nav="frame"] > [class*="_sidebarCol"],
  [data-mobile-nav="frame"] > [class*="_centerCol"] {
    scroll-snap-align: start;
    scroll-snap-stop: normal;
  }

  /* Sidebar page: a plain page sharing the chat background — flat, no card
     treatment and no divider line against the chat — with safe-area top so
     its controls clear the notch. The chat card's radius and shadow are
     what separate the two (PiUI). */
  [data-mobile-nav="frame"] > [class*="_sidebarCol"] {
    grid-area: 1 / 1 !important;
    position: static !important;
    inset: auto !important;
    width: 100% !important;
    visibility: visible !important;
    background: var(--dsw-alias-bg-base, #ffffff);
    border-right: none !important;
    padding-top: var(--dshm-safe-top);
    z-index: auto !important;
    transform: none !important;
    transition: none !important;
    max-width: none !important;
  }

  /* The sidebar shell's own fill is reset to transparent — across the one or
     two wrapper levels the shell tree may insert between the frame column and
     the sidebar root — so every layer of the sidebar page matches the chat
     background. Deeper elements keep their own states untouched. */
  [data-mobile-nav="frame"] > [class*="_sidebarCol"] > :first-child,
  [data-mobile-nav="frame"] > [class*="_sidebarCol"] > :first-child > :first-child {
    background: transparent;
  }

  /* The sidebar shell freezes its content at the expanded desktop width
     (inline style); the phone layout keeps the sidebar open, so that frozen
     width would leave the right side of the page empty on wide screens.
     Min-width (not width) stretches the shell to fill the page column. */
  [data-mobile-nav="frame"] > [class*="_sidebarCol"] div[style*='width'] {
    min-width: 100%;
  }

  /* The session list's bottom scroll fade is a desktop affordance; on the
     always-open phone sidebar it just dims the tail of the list. */
  [data-mobile-nav="frame"] > [class*="_sidebarCol"] div:has(> [role='tree']) > span {
    display: none;
  }

  /* Keep snap targets untransformed. A live radius would repaint the
     whole chat on every swipe frame, which flashes the messages and input. */
  [data-mobile-nav="frame"] > [class*="_centerCol"] {
    grid-area: 1 / 2 !important;
    border: none;
    border-radius: 0;
    overflow: clip;
    background: var(--dsw-alias-bg-base, #ffffff);
    box-shadow: none;
  }

  /* Drag handles are desktop-only affordances. */
  [data-side="sidebar"],
  [data-side="details"] {
    display: none !important;
  }

  /* Session header: compact with a safe-area top. */
  [data-mobile-nav="frame"] [data-phase="active"] > header {
    padding: calc(6px + var(--dshm-safe-top)) 8px 0 8px;
  }

  /* Conversation column: snugger side clearance for the composer card.
     Desktop's 680px minimum content width overflows a phone column and the
     clipped overflow flashes while the pager scrolls. */
  [data-mobile-nav="frame"] [data-phase] {
    --dsh-composer-side-clearance: 12px;
    --dsh-chat-user-width: 100% !important;
    --dsh-chat-content-width: 100% !important;
    --dsh-composer-card-max-width: 100% !important;
  }

  /* Sticky composer seat: lift the input card above the home indicator and
     the virtual keyboard. */
  [data-mobile-nav="frame"] [data-composer-seat] {
    padding-bottom: calc(var(--dshm-safe-bottom) + var(--dshm-keyboard-inset));
  }

  [data-mobile-nav="frame"] [data-mobile-nav="composer-toggle"] {
    appearance: none;
    border: 0;
    border-radius: 999px;
    background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, .06));
    color: var(--dsw-alias-label-secondary, #444);
    min-height: 32px;
    margin: 4px 12px 0;
    width: calc(100% - 24px);
    font-size: 12px;
    line-height: 16px;
  }

  [data-mobile-nav="frame"][data-dshm-composer="collapsed"] [data-composer-seat] > :not([data-mobile-nav="composer-toggle"]) {
    display: none !important;
  }

  /* Hidden scrollbars are the norm on phones: no reserved gutter, no bars.
     Clip horizontal overflow so a wide message cannot become a second pager. */
  [data-mobile-nav="frame"] [data-conversation-scroll] {
    scrollbar-gutter: auto;
    overflow-x: clip;
  }

  /* Touch targets in the control regions get a comfortable hit height. */
  [data-mobile-nav="frame"] [data-phase="active"] > header button,
  [data-mobile-nav="frame"] [data-composer-card] button,
  [data-mobile-nav="frame"] [role="treeitem"] button {
    min-height: 36px;
  }

  /* --- Model-name marquee (PiUI) ---
     The model label absorbs the trigger's free width (see the composer
     rules below); when the name overflows its capped width, the controller
     wraps a double copy in a [data-dshm-marquee-runner] layer and tags the
     label with data-dshm-marquee + --dshm-marquee-duration. */
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] button[aria-haspopup="menu"] > span:first-child {
    max-width: 96px;
    min-width: 48px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] button[aria-haspopup="menu"] > span:first-child > [data-dshm-marquee-runner] {
    display: inline-block;
    white-space: nowrap;
  }
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] [data-dshm-marquee-runner] > [data-dshm-marquee-item] {
    display: inline-block;
    white-space: nowrap;
    padding-right: 32px;
  }
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] button[aria-haspopup="menu"] > span:first-child[data-dshm-marquee] > [data-dshm-marquee-runner] {
    animation: dshm-marquee var(--dshm-marquee-duration, 8s) linear infinite;
  }
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] button[aria-haspopup="menu"] > span:first-child[data-dshm-marquee]:hover > [data-dshm-marquee-runner],
  [data-mobile-nav="frame"][data-dshm-moving] [data-dshm-marquee-runner] {
    animation-play-state: paused;
  }
  @keyframes dshm-marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  /* Wide mobile / tablet (561-1023px — landscape phones, large foldables,
     small tablets): the sidebar page grows past the phone cap toward HALF
     the viewport (50vw, capped at 420px). The model-name cap relaxes from
     96px to 160px. */
  @media (min-width: 561px) and (max-width: 1023px) {
    [data-mobile-nav="frame"] {
      --dshm-sidebar-width: clamp(360px, 50vw, 420px);
    }
    [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] button[aria-haspopup="menu"] > span:first-child {
      max-width: 160px;
    }
  }

  /* --- Conversation text on mobile ---
     The official message flow keeps desktop's 32px side gutters and 16px
     type. On a phone: shrink the type a notch and widen the lines by
     trimming the gutters. */
  [data-phase] [class$="_scrollBody"] {
    scrollbar-gutter: auto !important;
    scrollbar-width: none !important;
  }
  [data-phase] [class$="_scrollBody"]::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
  [data-phase] [class$="_actions"] {
    overflow: hidden !important;
  }
  [data-phase] [class$="_actions"] [class$="_timeEnd"] {
    flex: 0 1 auto !important;
    min-width: 0 !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }

  [data-phase] [class$="_scroll"]:has(p) {
    padding-left: 20px !important;
    padding-right: 20px !important;
    font-size: 15px !important;
  }
  [data-phase] [class$="_scroll"]:has(p) p,
  [data-phase] [class$="_scroll"]:has(p) li,
  [data-phase] [class$="_scroll"]:has(p) [class*="_text_"] {
    font-size: 15px !important;
  }

  [data-phase] table {
    width: 100% !important;
    max-width: 100% !important;
  }
  [data-phase] th,
  [data-phase] td {
    max-width: none !important;
    min-width: 0 !important;
  }

  [data-phase] [class$="_userStack"],
  [data-phase] [class$="_userStack"] [class$="_bubble"] {
    box-sizing: border-box !important;
    width: fit-content !important;
    max-width: 100% !important;
  }

  /* --- Composer bottom row on mobile ---
     The editor is a Lexical contenteditable, not a textarea, so the row is
     anchored by [data-composer-card]. Official layout: tools on the left,
     trailing (model pill + send) flex:none on the right, row wraps. A long
     model name made the trailing group as wide as its text and pushed the
     send button against the card edge. Sharing one row with the trailing
     group also squeezed the tool strip until plugin entries in the input
     slots (prompt prep, sketch, ...) were clipped behind the model pill.
     Phone layout: two rows. The tool strip gets the full first row and
     scrolls horizontally when crowded; the second row holds the model pill
     (left, ellipsizes its name) and the send button (right, never shrinks). */
  [data-mobile-nav="frame"] [data-composer-card] [class$="_row"]:has(> [class$="_trailing"]) {
    flex-wrap: wrap !important;
    column-gap: 8px !important;
    row-gap: 4px !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_row"] > [class$="_tools"] {
    flex: 1 1 100% !important;
    min-width: 0 !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scrollbar-width: none !important;
    gap: 8px !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_row"] > [class$="_tools"]::-webkit-scrollbar {
    display: none !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_row"] > [class$="_tools"] > *,
  [data-mobile-nav="frame"] [data-composer-card] [class$="_row"] > [class$="_tools"] [class$="_modes"],
  [data-mobile-nav="frame"] [data-composer-card] [class$="_row"] > [class$="_tools"] [data-slot] > * {
    flex: none !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] {
    flex: 1 1 100% !important;
    min-width: 0 !important;
    justify-content: flex-start !important;
    align-items: center !important;
    gap: 8px !important;
    margin-left: 0 !important;
  }
  /* Model pill stays left; whatever follows it (context ring, send) is
     packed to the right edge as one group. */
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > [data-slot="conversation.input.model"] + * {
    margin-left: auto !important;
  }
  /* 0.1.7 wraps the right-side slots and the model pill in a
     _standardControls group, followed by an activity slot and the send
     button. The group takes the leftover width so the model pill sits on
     the left and the send button is pushed to the right edge. */
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > [class$="_standardControls"] {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    gap: 8px !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > [class$="_standardControls"][hidden] {
    display: none !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > [class$="_activity"]:empty {
    display: none !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > [class$="_primary"],
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > [class$="_activity"] + [class$="_primary"] {
    margin-left: auto !important;
    flex: none !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > [class$="_primary"] + [class$="_primary"] {
    margin-left: 0 !important;
    flex: none !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > [class$="_primary"] {
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > [class$="_primary"] {
    flex: none !important;
  }
  /* Any model pill (official or plugin) may shrink; the reasoning-model
     pill keeps room for its effort badge and a few characters of name,
     and leaves room for the context ring and the send button. */
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] > * {
    flex: 0 1 auto !important;
    min-width: 0 !important;
    max-width: 100% !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] .dsh-reasoning-model {
    min-width: 128px !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] .dsh-reasoning-model__trigger {
    min-width: 0 !important;
    max-width: 100% !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] .dsh-reasoning-model__model {
    flex: 1 1 auto !important;
    min-width: 24px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] .dsh-reasoning-model__effort,
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] .dsh-reasoning-model__trigger > svg {
    flex: none !important;
  }

  /* --- Composer controls: one visual system on mobile ---
     The row mixes official controls (round add buttons, a borderless
     permission trigger, the send button) with plugin entries (an outlined
     prompt-prep pill, a rounded-square sketch button, the model pill) and
     the official context-usage ring, each with its own height, radius and
     fill. On a phone they read as scattered, so every control becomes the
     same 36px capsule: icon-only controls are 36px circles, labelled ones
     are pills. They use the same outline look as the drawer actions
     (transparent fill, 1px theme border) so the glass card and wallpaper
     show through. */
  [data-mobile-nav="frame"] [data-composer-card],
  [data-mobile-nav="frame"] [data-slot="conversation.composer.dock"] {
    --dshm-chip-h: 36px;
    --dshm-chip-bg: transparent;
    --dshm-chip-border: var(--dsw-alias-border-l1, rgba(180, 180, 180, .4));
    --dshm-chip-shadow: none;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_row"] > [class$="_tools"] {
    align-items: center !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] > button[class$="_add"],
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] [class$="_modes"] button[class$="_trigger"],
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] [data-slot="conversation.input.left"] > button,
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] [data-slot="conversation.input.left"] > .ghc-trigger {
    box-sizing: border-box !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 4px !important;
    height: var(--dshm-chip-h) !important;
    min-height: var(--dshm-chip-h) !important;
    min-width: var(--dshm-chip-h) !important;
    border: 1px solid var(--dshm-chip-border) !important;
    border-radius: 999px !important;
    background: var(--dshm-chip-bg) !important;
    box-shadow: var(--dshm-chip-shadow) !important;
    font-size: 13px !important;
    line-height: 1 !important;
    transform: none !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] > button[class$="_add"],
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] [data-slot="conversation.input.left"] > button:not(:has(> span + span)) {
    width: var(--dshm-chip-h) !important;
    padding: 0 !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] [class$="_modes"] button[class$="_trigger"] {
    max-width: none !important;
    padding: 0 8px 0 11px !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] [data-slot="conversation.input.left"] > button:has(> span + span) {
    padding: 0 13px !important;
  }
  /* GitHub connect: same capsule; status dot sits after the login name. */
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] [data-slot="conversation.input.left"] > .ghc-trigger {
    gap: 6px !important;
    padding: 0 12px 0 11px !important;
    color: var(--dsw-alias-label-primary, inherit) !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] .ghc-trigger .ghc-trigger-label {
    max-width: 88px !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] .ghc-trigger .ghc-dot {
    width: 7px !important;
    height: 7px !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] svg {
    width: 16px !important;
    height: 16px !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] .dsh-reasoning-model__trigger {
    height: var(--dshm-chip-h) !important;
    padding: 0 10px 0 12px !important;
    border: 1px solid var(--dshm-chip-border) !important;
    background: var(--dshm-chip-bg) !important;
    box-shadow: var(--dshm-chip-shadow) !important;
    font-size: 13px !important;
  }
  /* Context-usage ring: a bare 14px icon read as a loading spinner. Give
     it the same circle as its neighbours and a legible ring size. */
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > span > button[aria-haspopup="dialog"] {
    box-sizing: border-box !important;
    display: grid !important;
    place-items: center !important;
    width: var(--dshm-chip-h) !important;
    height: var(--dshm-chip-h) !important;
    padding: 0 !important;
    border: 1px solid var(--dshm-chip-border) !important;
    border-radius: 999px !important;
    background: var(--dshm-chip-bg) !important;
    box-shadow: var(--dshm-chip-shadow) !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > span > button[aria-haspopup="dialog"] svg {
    width: 22px !important;
    height: 22px !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > [class$="_primary"] {
    width: var(--dshm-chip-h) !important;
    height: var(--dshm-chip-h) !important;
    transform: none !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, .35),
      0 4px 14px color-mix(in srgb, var(--dsw-alias-button-info-fill, #679efe) 45%, transparent) !important;
  }

  /* --- Dock row under the card (0.1.7): stats strip + context meter ---
     The official dock now holds the stats slot and, to its right, the
     context meter (ring + percent). Make the dock a full-width row: the
     stats capsule stretches, the meter becomes a matching 42px glass pill. */
  [data-mobile-nav="frame"] [data-composer-card] ~ [class$="_dock"] {
    box-sizing: border-box !important;
    width: 100% !important;
    max-width: var(--dsh-composer-card-max-width, none) !important;
    justify-content: stretch !important;
    align-items: center !important;
    gap: 6px !important;
    padding-top: 6px !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] ~ [class$="_dock"] > [data-slot="conversation.composer.dock"] > [class$="_root"] {
    flex: 1 1 auto !important;
    min-width: 0 !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] ~ [class$="_dock"] > span:last-child > button[aria-haspopup="dialog"] {
    box-sizing: border-box !important;
    height: 42px !important;
    padding: 0 12px 0 10px !important;
    gap: 6px !important;
    border-radius: 999px !important;
    color: var(--dsw-alias-label-primary, inherit) !important;
    font-size: 13px !important;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, .14), rgba(255, 255, 255, .04) 45%, rgba(255, 255, 255, .02)),
      var(--dsw-specific-input-major, rgba(22, 30, 44, .72)) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, .28),
      inset 0 -1px 0 rgba(255, 255, 255, .06),
      inset 0 0 0 .5px rgba(255, 255, 255, .08),
      0 8px 24px rgba(0, 0, 0, .14) !important;
    -webkit-backdrop-filter: blur(var(--we-blur, 40px)) saturate(var(--we-saturate, 1.3)) !important;
    backdrop-filter: blur(var(--we-blur, 40px)) saturate(var(--we-saturate, 1.3)) !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] ~ [class$="_dock"] > span:last-child > button[aria-haspopup="dialog"] svg {
    width: 18px !important;
    height: 18px !important;
  }

  /* --- Stats strip under the composer (rounds / tokens / subscription) ---
     Official pills are 22px tall with 13px text and no fill, too small to
     hit on a touch screen. Spread them across the card width as equal
     32px outlined pills; long labels ellipsize (the popover has the detail).
     The strip sits on a frosted capsule matching the composer card glass so
     the message list scrolling behind it does not show through the text. */
  [data-mobile-nav="frame"] [data-slot="conversation.composer.dock"] > [class$="_root"] {
    box-sizing: border-box !important;
    max-width: none !important;
    margin-top: 0 !important;
    padding: 5px !important;
    gap: 6px !important;
    justify-content: stretch !important;
    border-radius: 999px !important;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, .14), rgba(255, 255, 255, .04) 45%, rgba(255, 255, 255, .02)),
      var(--dsw-specific-input-major, rgba(22, 30, 44, .72)) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, .28),
      inset 0 -1px 0 rgba(255, 255, 255, .06),
      inset 0 0 0 .5px rgba(255, 255, 255, .08),
      0 8px 24px rgba(0, 0, 0, .14) !important;
    -webkit-backdrop-filter: blur(var(--we-blur, 40px)) saturate(var(--we-saturate, 1.3)) !important;
    backdrop-filter: blur(var(--we-blur, 40px)) saturate(var(--we-saturate, 1.3)) !important;
  }
  [data-mobile-nav="frame"] [data-slot="conversation.composer.dock"] > [class$="_root"] > span {
    display: flex !important;
    flex: 1 1 auto !important;
    min-width: 0 !important;
  }
  [data-mobile-nav="frame"] [data-slot="conversation.composer.dock"] > [class$="_root"] > span > button {
    flex: 1 1 auto !important;
    justify-content: center !important;
    gap: 6px !important;
    min-width: 0 !important;
    max-width: none !important;
    height: 32px !important;
    padding: 0 10px !important;
    border: 1px solid var(--dshm-chip-border) !important;
    border-radius: 999px !important;
    background: var(--dshm-chip-bg) !important;
    box-shadow: var(--dshm-chip-shadow) !important;
    font-size: 13px !important;
  }
  [data-mobile-nav="frame"] [data-slot="conversation.composer.dock"] > [class$="_root"] > span > button svg {
    flex: none !important;
    width: 16px !important;
    height: 16px !important;
  }
  [data-mobile-nav="frame"] [data-slot="conversation.composer.dock"] > [class$="_root"] > span > button > span {
    min-width: 0 !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }

  /* --- Session header on mobile ---
     Layout goal: [toggle] [session title] [mode badge] in a row. */
  [data-phase] header {
    padding-right: 12px !important;
  }
  [data-phase] header > :first-child {
    padding-left: 20px !important;
  }
  [data-mobile-nav="toggle"] {
    position: absolute !important;
    left: 8px !important;
    top: 12px !important;
    z-index: 2 !important;
  }
  [data-mobile-nav="files"] {
    position: static !important;
    left: auto !important;
    right: auto !important;
    top: auto !important;
    z-index: auto !important;
  }
  [data-phase] header [class$="_headerActions"] {
    flex: 0 1 auto !important;
    min-width: 0 !important;
    margin-left: auto !important;
    justify-content: flex-end !important;
  }
  [data-phase] header [class$="_crumbs"] {
    flex: 0 1 auto !important;
    min-width: 0 !important;
    max-width: 24vw !important;
  }
  [data-phase] header [class$="_label"]:has(> svg) {
    order: 1 !important;
    flex: 0 1 auto !important;
    min-width: 0 !important;
    max-width: 42vw !important;
    display: block !important;
    position: relative !important;
    box-sizing: border-box !important;
    padding-left: 18px !important;
    padding-right: 2px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }
  [data-phase] header [class$="_label"]:has(> svg) > svg {
    position: absolute !important;
    left: 0 !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
  }
  [data-phase] header [class$="_root"]:has(> button[class$="_trigger"]) {
    order: 2 !important;
    flex: 0 0 auto !important;
    min-width: max-content !important;
    max-width: none !important;
    white-space: nowrap !important;
    position: static !important;
  }
  [data-phase] header [class$="_root"]:has(> button[class$="_trigger"]) > button,
  [data-phase] header [class$="_root"]:has(> button[class$="_trigger"]) > button * {
    white-space: nowrap !important;
  }
  [data-phase] header [data-mobile-nav="files"] {
    order: 3 !important;
    flex: 0 0 auto !important;
  }
  [data-phase] header > :first-child > :last-child {
    display: none !important;
  }

  /* --- Header popovers on mobile --- */
  [data-phase] header [class$="_menu"] {
    left: 8px !important;
    right: auto !important;
    width: min(336px, calc(100vw - 16px)) !important;
    max-width: none !important;
    max-height: min(420px, calc(100dvh - 120px)) !important;
  }

  /* --- Settings dialog on mobile ---
     Desktop: 800px two-column flex (188px nav + content). Mobile: a
     near-full-width sheet — nav tabs wrap into rows on top, option rows
     stay horizontal. Structural selectors are scoped to the unique
     aria-modal dialog; every settings-specific rule is gated with
     :has(> :first-child > :last-child > button). Requires :has() support
     (Chromium 105+, 2022). */
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) {
    position: absolute !important;
    left: 8px !important;
    top: calc(env(safe-area-inset-top, 0px) + 12px) !important;
    width: calc(100vw - 16px) !important;
    max-width: calc(100vw - 16px) !important;
    height: auto !important;
    max-height: min(800px, calc(100vh - 24px - env(safe-area-inset-top, 0px))) !important;
    max-height: min(800px, calc(100dvh - 24px - env(safe-area-inset-top, 0px))) !important;
    flex-direction: column !important;
    border-radius: 14px !important;
    animation: dsh-mobile-nav-sheet-in .22s var(--ds-ease-out, ease-in-out);
  }
  :has(> [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"]))) > :first-child {
    animation: dsh-mobile-nav-fade .18s var(--ds-ease-out, ease-in-out);
  }
  @media (prefers-reduced-motion: reduce) {
    [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])),
    :has(> [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"]))) > :first-child {
      animation: none !important;
    }
  }
  [aria-modal="true"]:not(:has(> :first-child > :last-child > button)) {
    max-width: calc(100vw - 32px) !important;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :first-child {
    width: 100% !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 6px !important;
    padding: 10px 12px 8px !important;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :first-child > :first-child {
    display: none !important;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :first-child [class$="_navList"] {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    gap: 6px !important;
    overflow: visible !important;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) [class$="_header"] {
    flex: 0 0 auto !important;
    justify-content: flex-end !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 0 0 0 4px !important;
    min-height: 40px !important;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) [class$="_header"] > * {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) [class$="_header"] > :last-child {
    width: 32px !important;
    height: 32px !important;
    border-radius: 50% !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, .06)) !important;
  }
  [aria-modal="true"] [class$="_cubeRow"] {
    gap: 6px !important;
  }
  [aria-modal="true"] [class$="_cubeRow"] > * {
    flex: 1 1 0 !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    padding: 10px 8px !important;
    min-height: 0 !important;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :last-child {
    flex: 1 1 auto !important;
    min-height: 0 !important;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :last-child > :last-child {
    padding: 0 12px 24px !important;
  }
`;

};
modules["styles/misc.css.js"] = function(require, module, exports) {
"use strict";
// misc — split from src/client/mobile.css.ts (2026-08-16), order preserved.
// Do not reorder: styles/index.ts concatenates in this exact order.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MISC_CSS = void 0;
exports.MISC_CSS = `  /* ---------- hero composer on mobile ----------
     The official hero card carries a 2-line textarea plus a tall tool row,
     which reads oversized on a phone. Tighten the empty-state rhythm: keep
     the official centered hero, shrink the textarea line box, slim the card
     padding and the tool row, and close the gap under the headline. */

  [data-phase="hero"] [class$="_card"]:has(textarea) {
    padding-top: 14px !important;
    padding-bottom: 10px !important;
    gap: 12px !important;
  }
  /* The official composer autosizes the textarea and writes an inline
     height (2 lines on the hero empty state) on the textarea's scroll/grow
     wrappers. :placeholder-shown lets us collapse the EMPTY state to one
     line with !important; as soon as the user types, the pseudo-class no
     longer matches and the autosizer's inline height takes over again — so
     multi-line growth keeps working. */
  [data-phase="hero"] textarea:placeholder-shown {
    height: 36px !important;
  }
  [data-phase="hero"] [class$="_card"]:has(textarea:placeholder-shown) > [class$="_scroll"],
  [data-phase="hero"] [class$="_card"]:has(textarea:placeholder-shown) [class$="_grow"] {
    height: 36px !important;
  }
  [data-phase="hero"] [class$="_card"]:has(textarea) > [class$="_row"] {
    padding-top: 4px !important;
  }
  [data-phase="hero"] [class$="_headline"] {
    line-height: 1.15 !important;
    margin-bottom: 0 !important;
  }
  [data-phase="hero"] [class$="_stack"] {
    gap: 0 !important;
  }

  /* ---------- composer dock: swap git branch chip with the todo card ----------
     The git-graph branch chip (conversation.input.dock, order 100) floats
     alone at the bottom-left above the input card, with a dead zone to its
     right; the full-width todo card (order 0) sits above it. Swap them so
     the chip reads as the stack's top row and the todo card fills the row
     above the composer. The dock container itself is display:contents
     (inline style) — its children are direct flex items of the composer
     stack, so order on the children is what reorders them. Only the chip
     needs an order change: -1 puts it before the todo card (order 0) and
     before the input card (order 0, later in DOM). The todo card must KEEP
     its order 0 — raising it past the input card's order 0 would drop it
     below the composer entirely (2026-08-16 regression, fixed). The queue
     strip (order 20) keeps hugging the input card. Desktop untouched (this
     block lives inside the max-width: 1023px media query). */
  [data-slot="conversation.input.dock"] [data-gitgraph-chip-anchor] {
    order: -1 !important;
  }
  /* Mobile tap target + feedback for the branch chip (git-graph, 24px
     desktop spec). Two real-world problems: ① the chip is tiny and sits
     right above the expandable todo card — mis-taps land on the todo card;
     ② opening the popover waits for the host's /git/branches round-trip
     (~700ms on device) with zero feedback, so users tap again and toggle
     the popover closed. Enlarge the target, kill double-tap zoom delay,
     and give an instant pressed state so a tap reads as registered. */
  [data-slot="conversation.input.dock"] [data-gitgraph-chip-anchor] [data-gitgraph-chip] {
    touch-action: manipulation !important;
    min-height: 34px !important;
    padding: 0 12px !important;
    font-size: 13px !important;
  }
  [data-slot="conversation.input.dock"] [data-gitgraph-chip-anchor] [data-gitgraph-chip]:active {
    transform: scale(.96) !important;
    transition: transform .12s !important;
  }
}

/* ---------- tablet / wide mobile: keep sheets from becoming full-width ----------
   Below 768px the near-full-width sheets are the right call for a phone.
   On wider but still sub-desktop viewports (foldables, tablet portrait,
   desktop-mode tall windows) the same full-bleed sheet leaves content
   clustered at the left edge with a large dead zone on the right. Cap and
   center the modal sheets and the aionui bottom sheets instead. */
@media (min-width: 768px) and (max-width: 1023px) {
  /* All modal dialogs: centered, never edge-to-edge. The settings sheet has
     a higher-specificity full-width rule above, so repeat its selector here
     to win; the generic export/other-modal rule is covered by the second
     selector. */
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])),
  [aria-modal="true"]:not(:has(> :first-child > :last-child > button)) {
    left: 0 !important;
    right: 0 !important;
    margin-left: auto !important;
    margin-right: auto !important;
    width: min(calc(100vw - 32px), 720px) !important;
    max-width: min(calc(100vw - 32px), 720px) !important;
  }

  /* The dsh-web-ui explorer / preview bottom sheets: same treatment — keep
     the mobile bottom-sheet behavior, but stop them spanning the full width. */
  [data-aionui-explorer-col],
  [data-aionui-preview-col] {
    left: 0 !important;
    right: 0 !important;
    width: min(calc(100vw - 32px), 720px) !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }

  /* Settings sections (e.g. Agent presets) often carry a desktop max-width
     (720px) that leaves a dead strip on the right once the sheet is capped to
     the same width; let them fill the sheet body instead. */
  [aria-modal="true"] [class$="_section"] {
    width: 100% !important;
    max-width: none !important;
  }
}

/* ---------- desktop: the mobile controls must never appear ---------- */

@media (min-width: 1024px) {
  [data-mobile-nav="toggle"],
  [data-mobile-nav="files"],
  [data-mobile-nav="fab"],
  [data-mobile-nav="backdrop"],
  [data-mobile-nav="session-log"],
  [data-mobile-nav="explorer"],
  [data-mobile-nav="drawer-actions"],
  [data-mobile-nav="composer-toggle"] {
    display: none !important;
  }
}
`;

};

const cache = Object.create(null);
function load(key) {
  if (cache[key]) return cache[key].exports;
  if (!modules[key]) throw new Error('Unknown mobile-nav module: ' + key);
  const module = cache[key] = { exports: {} };
  const localRequire = id => {
    if (!id.startsWith('.')) return require(id);
    const parts = key.split('/');
    parts.pop();
    for (const part of id.split('/')) {
      if (part === '..') parts.pop();
      else if (part !== '.') parts.push(part);
    }
    return load(parts.join('/'));
  };
  modules[key](localRequire, module, module.exports);
  return module.exports;
}

return load('index.js');
}});

};
modules["vendor/header-fix.js"] = function(require, module, exports) {
/*!
 * Bundled into dsh-aemeath-theme unmodified.
 * Original: dsh-mobile-header-fix 1.3.0 (DeepSeek Harness community plugin; author not stated)
 * License: MIT
 */
module.exports = ({
	id: "dsh-mobile-header-fix",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		/**
		 * Defects in the phone session header, all of them downstream of the
		 * shipped stylesheet in @dsh-external/dsh-mobile-nav, plus one layout
		 * change requested on top.
		 *
		 * 1. Its rule
		 *      [data-phase] header [class$="_root"]:has(> button[class$="_trigger"])
		 *    was written for the agent-preset selector, but that selector's root
		 *    class does not end in "_root" — the background-jobs chip's does. So
		 *    the chip received `position: static`, which deleted the containing
		 *    block its absolutely positioned menu measures `top: calc(100% + 5px)`
		 *    against: the menu was placed against the conversation column instead
		 *    (y = column height + 5px, i.e. below the fold), and the chip looked
		 *    like it could not be opened at all. The same rule's
		 *    `min-width: max-content` made the chip unshrinkable, so the header's
		 *    right-aligned action cluster overflowed its own box leftwards, across
		 *    the session title.
		 *
		 * 2. The touch-target rule
		 *      [data-mobile-nav="frame"] [data-phase="active"] > header button
		 *    uses a child combinator, but the header sits one level deeper inside
		 *    a `display: contents` wrapper, so it matched nothing and every header
		 *    control stayed 28px tall.
		 *
		 * 3. Once the menu did open, it opened off the right edge: the jobs menu
		 *    is `position: absolute; left: 0; width: 336px` against the chip, and
		 *    the chip sits ~222px from the left on a 412px screen, so the panel's
		 *    right edge landed 154px past the viewport. Its own
		 *    `max-width: min(400px, 100vw - 32px)` clamps the width but cannot
		 *    pull a left-anchored box back on screen. Fix: anchor the menu to the
		 *    header instead of the chip and pin it to the header's right edge —
		 *    the plugin's own max-width then always fits, at any viewport.
		 *
		 * 4. Requested change: the agent-preset badge ("Standard mode") moves out
		 *    of the crowded title row and into the Chat/Trajectory row. In the
		 *    title row it had ~75px and rendered as "标…"; the tab row has ~250px
		 *    of free space to its right, and vacating the slot lets the title and
		 *    the jobs chip keep more of their text.
		 *
		 * 5. Requested change: in a subagent conversation the crumb that names it
		 *    is not the plain title button but the lineage chip contributed by
		 *    @deepseek-ai/dsh-client-ui-subagent — "/ <subagent title> <icon>".
		 *    Every level of it is min-width:0 with no floor, so it absorbed the
		 *    title row's shortfall instead of merely shrinking: measured at 412px
		 *    with a background-jobs chip present, the crumbs box got 99px and the
		 *    chip's title span came out 10px wide. It now moves to the tab row,
		 *    which has room, and is placed in the band between the tabs and the
		 *    preset badge. Ancestor subagent chips (a subagent that spawned one)
		 *    keep a floor in the title row, so they cannot collapse the same way.
		 *
		 * Every selector below carries one attribute more specificity than the
		 * rule it overrides, so this stylesheet wins whichever of the two loads
		 * first.
		 */
		const css = `/* dsh-mobile-header-fix
 *
 * Gated to the same width range as the stylesheet it repairs
 * (dsh-mobile-nav's layout.css.ts opens @media (max-width: 1023px)), so the
 * desktop layout is untouched even while the frame attribute is present.
 */
@media (max-width: 1023px) {

/* 1 — the header is the containing block for header popovers. It is the
   smallest positioned ancestor that actually sits at the top of the screen:
   without it, a chip whose root is static hands its menu to the conversation
   column (412x915), which puts the menu below the fold. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header {
  position: relative !important;
}

/* 2 — the chip root is deliberately static, so its menu anchors to the header
   above rather than to the chip's own box. Stated here rather than inherited
   from mobile-nav, so this fix does not depend on that rule staying. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_root"]:has(> button[class$="_trigger"]) {
  position: static !important;
  min-width: 0 !important;
  flex: 0 1 auto !important;
}

/* 3 — a text chip ellipsizes inside its box instead of painting over the
   buttons beside it. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_trigger"] {
  min-width: 0 !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_trigger"] > span {
  flex: 0 1 auto !important;
  min-width: 0 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

/* 4 — header controls get a comfortable hit height. The Chat/Trajectory tabs
   keep theirs, so the header itself does not grow. */
[data-mobile-nav="frame"] [data-phase="active"] header button:not([class*="_tab"]) {
  min-height: 36px;
}

/* 5 — header popovers open against the header's right edge instead of the
   chip's left edge, so they can never run past the right of the screen. The
   panel keeps its own 336px width and its own
   max-width: min(400px, 100vw - 32px); right-alignment is what makes that
   clamp sufficient at every width. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_root"] > [class$="_menu"] {
  left: auto !important;
  right: 12px !important;
}

/* 6 — (v1.3) the header is laid out as three rows instead of two:
     row 1  [session title ……………] [files] [more] [corner]
     row 2  [preset badge] [background jobs] [subagents]
     row 3  [tabs, one line, scrolls sideways]
   Previously the badge sat absolutely in the tab row, which only works with
   the two stock tabs; plugins now add up to eight, and the badge landed on
   them. The status chips (jobs, subagents) shared the title row with the
   title, which mobile-nav capped at 24vw, so a subagent chip had no room at
   all. The title cluster and the actions cluster dissolve (display:contents)
   into the title row, which wraps; a zero-height flex-basis:100% pseudo item
   forces the break, and "order" sorts each control onto its row. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_titleRow"] {
  flex-wrap: wrap !important;
  column-gap: 6px !important;
  row-gap: 0 !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_titleRow"]::after {
  content: "" !important;
  order: 10 !important;
  flex: 0 0 100% !important;
  height: 0 !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_titleCluster"],
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_headerActions"] {
  display: contents !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav[class$="_crumbs"] {
  order: 0 !important;
  flex: 1 1 0 !important;
  min-width: 0 !important;
  max-width: none !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_headerActions"] > [data-slot] > * {
  order: 20 !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_headerActions"] [data-mobile-nav="files"] {
  order: 1 !important;
  flex: 0 0 auto !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_headerUtilities"] {
  order: 2 !important;
  margin-left: 0 !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_headerCorner"] {
  order: 3 !important;
  margin-left: 0 !important;
  margin-right: -4px !important;
}
/* row 2: the badge goes back into normal flow */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_headerActions"] > div[data-slot] > span[class$="_label"] {
  position: relative !important;
  top: auto !important;
  bottom: auto !important;
  right: auto !important;
  left: auto !important;
  flex: 0 1 auto !important;
  max-width: 40% !important;
  align-self: center !important;
  margin: 2px 6px 4px 0 !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_headerActions"] > div[data-slot] > [class$="_root"]:has(> button[class$="_trigger"]) {
  flex: 0 1 auto !important;
  min-width: 0 !important;
  margin-bottom: 2px !important;
}
/* row-2 chips stay compact; the 36px touch floor is for row-1 icon buttons */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_headerActions"] > div[data-slot] > [class$="_root"] > button[class$="_trigger"] {
  min-height: 28px !important;
}

/* 7 — (folded into 6) */

/* 8 — (v1.3) subagent conversations: the lineage chip stays in the title row,
   which now has the whole width minus three icons (~250px at 412px). The
   parent crumb yields first (capped at 45%), the current subagent's chip
   keeps the rest and only ellipsizes its own title. A nested "N subagents"
   count inside the crumbs keeps a floor so it cannot collapse to a sliver. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav[class$="_crumbs"] > span[class$="_crumbSeg"]:not(:last-child) {
  flex: 0 1 auto !important;
  min-width: 0 !important;
  max-width: 45% !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav[class$="_crumbs"] > span[class$="_crumbSeg"]:last-child {
  flex: 1 1 auto !important;
  min-width: 0 !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav[class$="_crumbs"] [class*="_switcherTrigger"] {
  max-width: 100% !important;
  min-height: 30px !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav[class$="_crumbs"] [class$="_root"]:has(> button[class$="_trigger"]) {
  flex: 0 0 auto !important;
}

/* 9 — an ancestor subagent chip (a subagent that spawned a subagent) stays in
   the title row but keeps a floor, so it is not the thing that collapses. The
   plain ancestor title beside it yields first. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav[class$="_crumbs"] > span[class$="_crumbSeg"]:has(> div[class*="_switcherRoot"]):not(:last-child) {
  min-width: 88px !important;
}

/* 10 — a subagent opened from the catalog's trailing arrow ("open in sidebar")
   lands in the right Sidebar, which below 768px is forced fullscreen. Its glass
   panel (wallpaper engine: translucent fill + backdrop blur) sits over the
   still-painted parent conversation, so the parent's header tabs, todo/goal
   cards, composer and stats dock showed through and stacked under the child's
   own composer — two composers, two stats rows, overlapping controls. While
   the frame reports a fullscreen right bar, the parent column is not visible
   anyway: stop painting it (visibility keeps its layout/scroll state, so
   closing the panel restores it exactly where it was). */
[data-mobile-nav="frame"][data-rightbar-fullscreen] > [class$="_centerCol"] {
  visibility: hidden !important;
}


/* 11 — (v1.3) tabs: one line, scroll sideways. Eight tabs at 36px gaps
   cannot fit 380px, so each was squeezed to 8px and wrapped one character
   per line ("对/话"). The strip bleeds to both screen edges so scrolled
   content is not cut 20px short of the edge. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_tabs"] {
  flex-wrap: nowrap !important;
  gap: 22px !important;
  margin-left: -20px !important;
  margin-right: -12px !important;
  padding-left: 26px !important;
  padding-right: 16px !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_tabs"]::-webkit-scrollbar {
  display: none;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_tabs"] > button {
  flex: 0 0 auto !important;
  white-space: nowrap !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_tabs"] > button::after {
  bottom: 0 !important;
}

/* 12 — (v1.3) image-gen gallery toolbar. Its left group (provider, ratio,
   search with min-width 190px, workspace filter) shares a wrapping row with
   the right group (import / sort / batch), and on a phone the left group was
   given 107px: the selects and the search box overflowed it and painted over
   the right group's buttons. Stack the two groups instead. */
html body .dsh-ig-studio-toolbar {
  flex-direction: column !important;
  align-items: stretch !important;
  gap: 8px !important;
  padding: 10px 12px !important;
}
html body .dsh-ig-studio-toolbar-left {
  flex: none !important;
  width: 100% !important;
  gap: 8px !important;
}
html body .dsh-ig-studio-toolbar-left > .dsh-ig-studio-select {
  flex: 1 1 0 !important;
  min-width: 0 !important;
}
html body .dsh-ig-studio-search-wrap {
  flex: 1 1 100% !important;
  min-width: 0 !important;
  max-width: none !important;
}
html body .dsh-ig-studio-toolbar-right {
  width: 100% !important;
  flex-wrap: wrap !important;
  gap: 8px !important;
}
html body .dsh-ig-studio-toolbar-right > * {
  flex: 1 1 0 !important;
  min-width: 0 !important;
  justify-content: center !important;
}

}
`;
		const tagId = "dsh-mobile-header-fix/header-fix.css";
		/** Client plugin body: own the stylesheet for as long as this plugin is mounted. */
		function apply(ctx) {
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-mobile-header-fix";
				tag.dataset.pluginCss = tagId;
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => {
					tag.remove();
				};
			}, "dsh-mobile-header-fix: header stylesheet");
		}
		exports.apply = apply;
		exports.inject = [];
		return module.exports;
	}
});

};
modules["vendor/touch-fix.js"] = function(require, module, exports) {
/*!
 * Bundled into dsh-aemeath-theme unmodified.
 * Original: dsh-mobile-touch-fix 1.0.0 (DeepSeek Harness community plugin; author not stated)
 * License: MIT
 */
module.exports = ({
	id: "dsh-mobile-touch-fix",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		/**
		 * The session header's subagent lineage chip is the only way to open the
		 * subagent tree, and on a phone it is too small to hit.
		 *
		 * The chip is the "/ <n> subagent <chevron>" control contributed by
		 * @deepseek-ai/dsh-client-ui-subagent into
		 * `conversation.session.header.lineage`. Measured at a 412px viewport on
		 * 0.1.5-rc.2 it laid out at 34x36 CSS px, with the label ellipsized into a
		 * 21px span and a 5px chevron beside it — well under the 44px minimum a
		 * thumb needs, and the label is short enough that the tap is easy to miss
		 * entirely.
		 *
		 * Two things keep it small, and both are already `!important` upstream:
		 *
		 * 1. @dsh-external/dsh-mobile-nav's header rule pins `min-height: 28px`
		 *    on the chip's trigger.
		 * 2. dsh-mobile-header-fix's rule
		 *      [data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_trigger"]
		 *    pins `min-width: 0`, which is deliberate — it stops the chip painting
		 *    over the buttons beside it — but it also means the chip can never
		 *    claim a usable width. (Its companion rule meant to move this chip into
		 *    the Chat/Trajectory row matches `div[class*="_switcherRoot"]`, while
		 *    the chip's own root carries `ZKlsPq_root ` — with a trailing space —
		 *    so that rule has never applied and the chip is still in the title row.)
		 *
		 * Both are beaten here on specificity, not on importance: this selector
		 * carries one attribute more than the second rule and two more than the
		 * first, so the floor holds whichever of the three stylesheets loads last.
		 *
		 * Scope is deliberately narrow. `header nav` is the breadcrumb nav, which
		 * holds exactly the session crumb and this chip; the `_trigger` class gate
		 * keeps plain header icon buttons (28px icons in 28px boxes) out of it, and
		 * their layout is left alone.
		 *
		 * A 44x44 chip is still unreadable, though: at that width the label has
		 * 24px of box to live in and "2 subagents" ellipsizes to "2 s". So the chip
		 * claims width as well — 88px, which is the widest that fits before the job
		 * chip's left edge at x=199.
		 *
		 * Widening the chip alone does nothing, and finding out why took longer than
		 * it should have. The chain that holds the breadcrumb opens with
		 * `span.wSkVaW_crumbSeg > div[data-slot="conversation.session.header.lineage"]`
		 * (display: contents), and somewhere above it sits a `max-width: 98.88px`
		 * with `overflow: hidden`. The chip's own box grows to 88px, but everything
		 * past x=139 — the chevron, the tail of the label — is clipped away by a
		 * container that never grew with it. That is also why the chevron measured
		 * 5px wide in the original report: it was not being squeezed, it was being
		 * cut off. So this stylesheet releases that cap and pins the crumb instead,
		 * which puts the row at crumb + chip = 152px, ending at x=192.
		 *
		 * Inside the chip the width goes to the label first and the chevron last,
		 * because a chip that drops its chevron reads as a static count rather than
		 * a control.
		 */
		const css = `/* dsh-mobile-touch-fix
 *
 * Gated to the same width range as the stylesheet it repairs
 * (dsh-mobile-nav's layout.css.ts opens @media (max-width: 1023px)), so the
 * desktop layout is untouched even while the frame attribute is present.
 */
@media (max-width: 1023px) {

/* The chip gets a real touch target, and enough width to read: 34x36 measured
   becomes 88x44, against a 44px floor for a thumb. At a 412px viewport the
   title row has the room — the job chip does not start until x=199. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav button[class*="_trigger"] {
  flex: 0 0 auto !important;
  min-width: 88px !important;
  max-width: 88px !important;
  min-height: 44px !important;
  padding-top: 6px !important;
  padding-bottom: 6px !important;
  padding-left: 10px !important;
  padding-right: 10px !important;
}

/* The crumbs row carries max-width: 98.88px upstream and clips. Give the chip
   the width above and everything past x=139 is cut — which is precisely where
   the chevron and the tail of the label were going, and why widening the chip
   alone changed nothing. Release the cap and pin the crumb, so the row is
   exactly as wide as crumb + chip: at 412px, 46 + 18 + 88 = 152px, ending at
   x=192, still clear of the job chip at x=199. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav {
  flex: 0 0 auto !important;
  max-width: none !important;
  min-width: 0 !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav > span {
  flex: 0 0 auto !important;
  min-width: 0 !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav > span > button:first-child {
  flex: 0 1 auto !important;
  min-width: 0 !important;
  max-width: 46px !important;
}

/* Spend the width on the label, never on the chevron: the chevron is the only
   cue that the chip opens anything, so it keeps its intrinsic box while the
   label yields first. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav button[class*="_trigger"] svg {
  flex: 0 0 auto !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav button[class*="_trigger"] > span {
  min-width: 0 !important;
}

}
`;
		const tagId = "dsh-mobile-touch-fix/touch-fix.css";
		/** Client plugin body: own the stylesheet for as long as this plugin is mounted. */
		function apply(ctx) {
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-mobile-touch-fix";
				tag.dataset.pluginCss = tagId;
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => {
					tag.remove();
				};
			}, "dsh-mobile-touch-fix: touch stylesheet");
		}
		exports.apply = apply;
		exports.inject = [];
		return module.exports;
	}
});

};
modules["vendor/wallpaper-layout.js"] = function(require, module, exports) {
/*!
 * Bundled into dsh-aemeath-theme unmodified.
 * Original: dsh-wallpaper-engine-mobile-layout (mobile layout patch for dsh-plugin-wallpaper-engine; author not stated)
 * License: MIT
 */
module.exports = ({
  id: 'dsh-wallpaper-engine-mobile-layout',
  factory: () => ({
    inject: [],
    apply(ctx) {
      ctx.effect(() => {
        const style = document.createElement('style');
        style.dataset.plugin = 'dsh-wallpaper-engine-mobile-layout';
        style.dataset.pluginCss = 'dsh-wallpaper-engine-mobile-layout/styles-v1';
        style.textContent = `
@media (max-width: 768px) {
  body .we-repo-panel,
  body .we-picker__modal--panel {
    right: 8px;
    width: calc(100vw - 16px);
    max-width: calc(100vw - 16px);
    min-width: 0;
  }
  /* dsh-mobile-nav also applies an !important cap to every modal. */
  body .we-picker__modal.we-picker__modal--panel[role="dialog"][aria-modal="true"] {
    max-width: calc(100vw - 16px) !important;
  }
  body .we-repo-panel__body {
    min-width: 0;
    overflow-x: hidden;
  }
  body .we-repo-panel .we-picker,
  body .we-repo-panel .we-tabs,
  body .we-picker__modal--panel .we-tabs {
    min-width: 0;
    max-width: 100%;
  }
  body .we-repo-panel .we-tabs__tab {
    min-width: 0;
    white-space: nowrap;
  }
  body .we-repo-panel .we-vinyl {
    width: clamp(88px, 28vw, 120px);
    height: clamp(88px, 28vw, 120px);
  }
  body[data-we-glass-fallback] .we-repo-panel.we-repo-panel--open,
  body[data-we-glass-fallback] .we-picker__modal.we-picker__modal--panel {
    background-color: var(--dsw-alias-bg-layer-1, #ffffff);
    background-image: none;
  }
}
`;
        document.head.appendChild(style);
        return () => style.remove();
      });
    },
  }),
});

};

const cache = Object.create(null);
function load(key) {
  if (cache[key]) return cache[key].exports;
  if (!modules[key]) throw new Error('Unknown aemeath-theme module: ' + key);
  const module = cache[key] = { exports: {} };
  const localRequire = id => {
    if (!id.startsWith('.')) return require(id);
    const parts = key.split('/');
    parts.pop();
    for (const part of id.split('/')) {
      if (part === '..') parts.pop();
      else if (part !== '.') parts.push(part);
    }
    return load(parts.join('/'));
  };
  modules[key](localRequire, module, module.exports);
  return module.exports;
}
const entry = load('index.js');
entry.apply.require = require;
return entry;
}});
