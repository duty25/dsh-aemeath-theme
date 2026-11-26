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
