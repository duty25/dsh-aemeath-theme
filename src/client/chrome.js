"use strict";
// Chat page "bridge" look on phones: two-row header (navigation left, actions right,
// view tabs sharing a row with the mode/jobs/team chips), soft glass key buttons,
// the composer card (+ key, tool pills, model capsule, send gem), the stats rail
// (rounds / tokens / subscription / context) and the collapse handle.
// Active only with html[data-ae-chrome] in the dark scheme. Selectors carry
// :not(#ae-x) so they outrank the stock, plugin and older skin rules for the same nodes.
const { svgUrl } = require('./skin-extra.js');

function buildCss() {
  const C = 'html[data-aemeath][data-ae-skin][data-ae-chrome]:not([style*="color-scheme: light"])';
  const X = ':not(#ae-x)';
  const H = `${C} [data-mobile-nav="frame"] [data-phase] header`;
  const HT = `${H}:has([class*="_tabs"])`;
  const ICONBTN = ':is([data-mobile-nav="toggle"],[data-mobile-nav="files"],button[aria-label="更多操作"],button[class*="_moreButton"],button[data-sidebar-right-expand])';
  const icon = (name) => `-webkit-mask:${svgUrl(name)} center/contain no-repeat;mask:${svgUrl(name)} center/contain no-repeat`;
  const CARD = `${C} [data-composer-card]`;
  const DOCK = `${C} [data-composer-card] ~ [class$="_dock"]`;
  const TOOL = ':is(button[class*="iWlSmW_trigger"],.dsh-ppb-btn,.ghc-trigger)';
  return `
/* ================= header ================= */
${H}${X}{padding-top:8px !important;border-bottom:0 !important;
  background:linear-gradient(180deg,rgba(var(--ae-plum-rgb),.94),rgba(var(--ae-plum-rgb),.66)) !important;
  box-shadow:0 8px 18px -14px rgba(0,0,0,.8) !important}
${H}${X}::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(var(--ae-pink-rgb),.55) 22%,rgba(var(--ae-cyan-rgb),.5) 72%,transparent)}

/* row-1 keys: soft glass squares with a cyan status pixel */
${H} ${ICONBTN}${X}{width:34px !important;height:34px !important;min-width:34px !important;min-height:34px !important;padding:0 !important;margin:0 !important;
  border:0 !important;border-radius:11px !important;clip-path:none !important;color:var(--ae-pink-soft) !important;
  background:linear-gradient(160deg,rgba(var(--ae-pink-rgb),.24),rgba(var(--ae-plum3-rgb),.74) 50%,rgba(var(--ae-plum-rgb),.86)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.34),inset 0 1px 0 rgba(255,255,255,.14),0 3px 8px rgba(0,0,0,.35) !important}
${H} ${ICONBTN}${X}::after{content:"" !important;display:block !important;position:absolute !important;inset:auto !important;right:4px !important;top:4px !important;
  width:3px !important;height:3px !important;background:var(--ae-cyan) !important;box-shadow:0 0 4px var(--ae-cyan);opacity:.8;-webkit-mask:none !important;mask:none !important;z-index:1}
${H} ${ICONBTN}${X}:active{background:linear-gradient(160deg,var(--ae-pink),rgba(var(--ae-violet-rgb),.9)) !important;color:#2a0b22 !important;transform:translateY(1px)}
${C}[data-ae-pixel-icons] [data-phase] header button[aria-label="更多操作"]${X}{position:relative !important}
${C}[data-ae-pixel-icons] [data-phase] header button[aria-label="更多操作"] > svg{opacity:0 !important}
${C}[data-ae-pixel-icons] [data-phase] header button[aria-label="更多操作"]${X}::before{content:"";position:absolute;left:50%;top:50%;width:20px;height:20px;margin:-10px 0 0 -10px;background:currentColor;${icon('more')};pointer-events:none}
${H} .dsh-ling-btn${X}{height:34px !important;min-height:34px !important;padding:0 10px !important;border:0 !important;border-radius:11px !important;white-space:nowrap;
  font-size:12.5px !important;font-weight:600;color:var(--ae-cyan) !important;
  background:linear-gradient(160deg,rgba(var(--ae-cyan-rgb),.18),rgba(var(--ae-plum3-rgb),.74) 55%) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-cyan-rgb),.34),0 3px 8px rgba(0,0,0,.3) !important}
${H} [class$="_titleRow"]${X}{column-gap:6px !important}
${H} nav[class*="_crumbs"] [class*="crumbCurrent"]{text-shadow:0 0 10px rgba(var(--ae-pink-rgb),.45),1px 1px 0 rgba(0,0,0,.5)}

/* chips: mode (pink), background jobs (cyan), agent team (round) */
${H} [class*="SVAs4q_label"]${X}{display:inline-flex !important;align-items:center !important;gap:5px !important;height:26px !important;line-height:26px !important;
  padding:0 11px 0 9px !important;margin:0 !important;max-width:none !important;border:0 !important;border-radius:999px !important;
  font-size:12px !important;font-weight:600;color:var(--ae-pink-soft) !important;
  background:linear-gradient(90deg,rgba(var(--ae-pink-rgb),.28),rgba(var(--ae-violet-rgb),.16)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.45),0 0 12px -3px rgba(var(--ae-pink-rgb),.5) !important}
${H} [class*="SVAs4q_label"]${X}::before,${H} [class*="SVAs4q_label"]${X}::after{content:none !important;display:none !important}
${H} button[class*="QsffPG_trigger"]${X}{position:relative !important;height:26px !important;min-height:26px !important;padding:0 11px 0 26px !important;margin:0 !important;
  border:0 !important;border-radius:999px !important;font-size:12px !important;font-weight:600;color:var(--ae-cyan) !important;
  background:linear-gradient(90deg,rgba(var(--ae-cyan-rgb),.18),rgba(var(--ae-violet-rgb),.12)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-cyan-rgb),.42) !important}
${H} button[class*="QsffPG_trigger"]${X}::before{content:"" !important;position:absolute;left:9px;top:50%;width:12px;height:12px;margin-top:-6px;background:currentColor !important;${icon('echo')}}
${H} button[class*="QsffPG_trigger"]${X}::after{content:none !important;display:none !important}
${H} button[class*="QsffPG_trigger"]:is([aria-label*="巡航"],[aria-label*="运行中"])${X}{color:var(--ae-pink-soft) !important;
  background:linear-gradient(90deg,rgba(var(--ae-pink-rgb),.24),rgba(var(--ae-cyan-rgb),.12)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.5),0 0 12px -3px rgba(var(--ae-pink-rgb),.6) !important}
${H} button[class*="QsffPG_trigger"]:is([aria-label*="巡航"],[aria-label*="运行中"])${X}::before{background:var(--ae-pink) !important;animation:ae-twinkle 1.2s steps(2) infinite}
${H} [class*="QsffPG_count"]{font-size:12px !important}
${H} button[aria-label="智能体团队"]${X}{width:32px !important;min-width:32px !important;height:26px !important;min-height:26px !important;padding:0 !important;margin:0 !important;
  border:0 !important;border-radius:999px !important;color:var(--ae-pink-soft) !important;
  background:rgba(var(--ae-plum3-rgb),.72) !important;box-shadow:inset 0 0 0 1px rgba(var(--ae-violet-rgb),.42) !important}
${H} button[aria-label="智能体团队"]${X}::before{width:16px !important;height:16px !important;margin:-8px 0 0 -8px !important}
${H} button[aria-label="智能体团队"]${X}::after{content:none !important;display:none !important}

/* view tabs */
${H} [data-conversation-tabs] button${X}{height:30px !important;padding:0 10px !important;border:0 !important;border-radius:10px 10px 0 0 !important;
  background:transparent !important;box-shadow:none !important;color:var(--dsw-alias-label-tertiary) !important}
${H} [data-conversation-tabs] button:is([class*="Active"],[aria-selected="true"])${X}{color:#fff !important;
  background:linear-gradient(180deg,rgba(var(--ae-pink-rgb),0),rgba(var(--ae-pink-rgb),.22)) !important;
  box-shadow:inset 0 -2px 0 var(--ae-pink),0 8px 12px -10px rgba(var(--ae-pink-rgb),.9) !important;text-shadow:0 0 8px rgba(var(--ae-pink-rgb),.7)}

@media (max-width:760px){
  /* navigation keys pinned left of the title; chips share the tab row on the right */
  ${HT} [class$="_headerActions"]${X}{display:flex !important;position:absolute !important;inset:0 !important;z-index:3;pointer-events:none;margin:0 !important;
    flex-direction:row !important;align-items:flex-end !important;justify-content:flex-end !important;gap:6px !important;padding:0 10px 4px 0 !important}
  ${HT} [class$="_headerActions"] > [data-slot] > *${X}{pointer-events:auto;margin:0 !important;flex:none !important;max-width:none !important;order:20 !important}
  ${HT} [class$="_headerActions"] > [data-slot] > [class*="VoX2oq_root"]${X}{order:30 !important}
  ${HT} [class$="_headerActions"] > [data-slot] > [class*="SVAs4q_label"]${X}{align-self:flex-end !important;max-width:none !important;margin:0 !important}
  ${HT} [data-mobile-nav="toggle"]${X}{position:absolute !important;left:10px !important;top:8px !important}
  ${HT} [data-mobile-nav="files"]${X}{position:absolute !important;left:50px !important;top:8px !important}
  ${HT} [class$="_titleRow"]${X}{padding-left:50px !important;min-height:34px !important}
  ${HT} [class*="_tabs"]${X}{margin-top:8px !important;padding-left:10px !important;padding-right:var(--ae-chip-room,250px) !important;min-width:0;flex-wrap:nowrap !important}
  ${HT} [data-conversation-tabs]${X}{flex:0 1 auto !important;flex-wrap:nowrap !important;min-width:0 !important;overflow-x:auto !important;scrollbar-width:none}
  ${HT} [data-conversation-tabs]${X}{gap:0 !important}
  ${HT} [data-conversation-tabs] button${X}{flex:none !important;white-space:nowrap !important;padding:0 5px !important;min-width:0 !important}
  ${HT} [class*="viewsMoreAnchor"] button${X}{width:22px !important;min-width:22px !important;padding:0 !important}
  ${HT} [class*="viewsMoreAnchor"]${X}{flex:none !important}
  ${HT} [data-conversation-tabs]${X}{flex:none !important;overflow:visible !important}
  ${HT}[data-ae-chips] [class*="SVAs4q_label"]${X}{width:30px !important;padding:0 !important;gap:0 !important;justify-content:center !important;font-size:0 !important}
  ${HT}[data-ae-chips="2"] [class*="QsffPG_count"]${X}{display:inline-block !important;max-width:calc(var(--ae-jobs-digits,1) * 1ch) !important;overflow:hidden !important;white-space:nowrap !important;font-variant-numeric:tabular-nums}
  ${HT} [data-conversation-tabs]::-webkit-scrollbar{display:none}
}

/* ================= composer card ================= */
${CARD}${X}{position:relative;border:0 !important;border-image:none !important;border-radius:20px !important;
  background:
    radial-gradient(120% 70% at 0% 0%,rgba(var(--ae-pink-rgb),.15),transparent 55%),
    radial-gradient(90% 60% at 100% 100%,rgba(var(--ae-cyan-rgb),.10),transparent 60%),
    linear-gradient(180deg,rgba(var(--ae-plum2-rgb),.95),rgba(var(--ae-plum-rgb),.96)) !important;
  box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.30),inset 0 1px 0 rgba(255,255,255,.08),0 10px 28px -10px rgba(0,0,0,.75),0 0 24px -10px rgba(var(--ae-pink-rgb),.4) !important}
${CARD}${X}::before{content:"";position:absolute;left:24px;right:24px;top:0;height:2px;border-radius:2px;pointer-events:none;opacity:.85;
  background:linear-gradient(90deg,transparent,var(--ae-pink) 30%,var(--ae-cyan) 70%,transparent)}
${CARD}${X}:focus-within{box-shadow:inset 0 0 0 1px rgba(var(--ae-pink-rgb),.62),inset 0 1px 0 rgba(255,255,255,.1),0 10px 28px -10px rgba(0,0,0,.75),0 0 30px -6px rgba(var(--ae-pink-rgb),.55) !important}
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
${DOCK}${X}{display:flex !important;flex-wrap:nowrap !important;align-items:center !important;gap:6px !important;margin-top:8px !important;padding:4px !important;min-height:0 !important;
  border-radius:16px !important;background:rgba(var(--ae-plum-rgb),.62) !important;box-shadow:inset 0 0 0 1px rgba(var(--ae-violet-rgb),.26) !important}
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
${C} [data-mobile-nav="composer-toggle"]${X}{position:relative;height:26px !important;min-height:26px !important;width:auto !important;margin:6px auto 2px !important;padding:0 14px 0 28px !important;
  border:0 !important;border-radius:999px !important;font-family:inherit !important;font-size:12px !important;line-height:26px !important;font-weight:600 !important;letter-spacing:2px !important;
  color:var(--dsw-alias-label-secondary) !important;background:rgba(var(--ae-plum2-rgb),.72) !important;box-shadow:inset 0 0 0 1px rgba(var(--ae-violet-rgb),.32) !important}
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
    // Natural (level-0) widths come from the live chips while uncompacted; compact
    // widths are estimated from text. Cache the natural widths per text so a compacted
    // header can still decide whether the full chips would fit again.
    const level0 = !header.hasAttribute('data-ae-chips');
    const w = [0, 0, 0];
    let digits = 1;
    for (const el of items) {
      const jobs = el.matches('[class*="QsffPG_trigger"]') ? el : el.querySelector('[class*="QsffPG_trigger"]');
      const real = el.getBoundingClientRect().width;
      if (el.matches('[class*="SVAs4q_label"]')) {
        const key = 'm:' + el.textContent.trim();
        if (level0) natural.set(key, real);
        const full = natural.get(key) || 37 + textW(el, el.textContent.trim());
        w[0] += full; w[1] += 30; w[2] += 30;
      } else if (jobs) {
        const count = jobs.querySelector('[class*="QsffPG_count"]') || jobs;
        const text = count.textContent.trim();
        const n = (text.match(/\d+/) || ['0'])[0];
        digits = n.length;
        const key = 'j:' + text;
        if (level0) natural.set(key, real);
        const full = natural.get(key) || 37 + textW(count, text);
        w[0] += full; w[1] += full; w[2] += full - textW(count, text) + textW(count, n);
      } else {
        w[0] += real; w[1] += real; w[2] += real;
      }
    }
    const gaps = Math.max(0, items.length - 1) * 6;
    const hr = header.getBoundingClientRect(), tr = tabsRow.getBoundingClientRect();
    const more = header.querySelector('[class*="viewsMoreAnchor"]');
    const need = Math.max(tabs.getBoundingClientRect().right, more ? more.getBoundingClientRect().right : 0) + 8;
    const avail = hr.right - 10 - need;
    let level = 0;
    while (level < 2 && w[level] + gaps > avail - 4) level++;
    const chipsLeft = hr.right - 10 - (w[level] + gaps);
    const room = Math.max(16, Math.ceil(tr.right - chipsLeft + 8)) + 'px';
    if (header.style.getPropertyValue('--ae-chip-room') !== room) header.style.setProperty('--ae-chip-room', room);
    header.style.setProperty('--ae-jobs-digits', String(digits));
    if (level) header.setAttribute('data-ae-chips', String(level)); else header.removeAttribute('data-ae-chips');
  };
  const schedule = () => { if (!q) q = requestAnimationFrame(measure); };
  const mo = new MutationObserver(schedule);
  mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'class'] });
  addEventListener('resize', schedule);
  if (document.fonts) document.fonts.ready.then(schedule);
  schedule();
  return () => {
    mo.disconnect(); removeEventListener('resize', schedule); if (q) cancelAnimationFrame(q);
    const header = document.querySelector('[data-phase] header'); if (header) reset(header);
  };
}

module.exports = { buildCss, install };
