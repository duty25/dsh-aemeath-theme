"use strict";
// Settings dialog skin for DeepSeek Harness 0.2.x.
//
// The current look is the 「频段柱」(resonance) layout — a row of tall pillars
// borrowed from 星落's special page-flip, a scan-beam page transition, and the
// tool-style option rows of 忘却前夜, all tinted with Aemeath pink + star cyan.
// The old starfall/cyber looks were retired; the panel now lets the user pick
// 共鸣·频段柱 (default) or 经典列表 (stock nav, only recoloured by the global
// palette).
const { buildCss } = require('./settings-deck-css.js');

function install(ctx, store) {
  const style = document.createElement('style');
  style.dataset.plugin = 'dsh-aemeath-theme';
  style.dataset.pluginCss = 'dsh-aemeath-theme/settings.css';
  style.textContent = buildCss();
  document.head.appendChild(style);

  const root = document.documentElement;
  const applyPrefs = (p) => {
    if (p.settingsSkin && p.settingsStyle === 'resonance') root.setAttribute('data-ae-set-style', 'resonance');
    else root.removeAttribute('data-ae-set-style');
    style.disabled = !p.settingsSkin;
  };
  applyPrefs(store.get());
  const off = store.subscribe(applyPrefs);

  return () => { off(); style.remove(); root.removeAttribute('data-ae-set-style'); };
}

module.exports = { install, buildCss };
