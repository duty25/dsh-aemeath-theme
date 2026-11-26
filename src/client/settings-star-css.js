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
