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
