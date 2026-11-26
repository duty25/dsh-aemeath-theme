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
