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

/** Ordered settings sections from the live slot ledger. */
function sections(ctx) {
  try {
    return ctx.slots.entries('settings.section')
      .map((e) => ({ id: e.options.id || '', order: e.options.order || 0, label: labelOf(e.options.label) }))
      .sort((a, b) => a.order - b.order);
  } catch (err) {
    console.warn('[aemeath-theme] settings sections unavailable', err);
    return [];
  }
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
  panel.setAttribute('data-ae-count', String(shown));
}

/** Click the first nav cell of `mode` unless the active one already belongs to it. */
function focusGroup(panel, mode) {
  const active = panel.querySelector('[class*="VOzbGW_navCell"][aria-current="true"]');
  if (active && active.getAttribute('data-ae-group') === mode) return;
  const first = panel.querySelector(`[class*="VOzbGW_navCell"][data-ae-group="${mode}"]`);
  if (first) first.click();
}

function install(ctx) {
  const disposers = [];
  let lastPanel = null;

  const sync = () => {
    const panel = document.querySelector(PANEL_SEL);
    if (!panel) { lastPanel = null; return; }
    const fresh = panel !== lastPanel;
    lastPanel = panel;
    if (fresh) {
      currentMode = pendingMode || 'official';
      pendingMode = null;
    }
    if (!store.get().settingsSplit) { panel.removeAttribute('data-ae-settings'); setOpening(null); return; }
    if (panel.getAttribute('data-ae-settings') !== currentMode) panel.setAttribute('data-ae-settings', currentMode);
    tagCells(ctx, panel);
    if (fresh) focusGroup(panel, currentMode);
    // the resonance deck releases the opening gate itself (with its transition);
    // other styles release it as soon as the requested group is active
    const p = store.get();
    if (!(p.settingsSkin && p.settingsStyle === 'resonance') && document.documentElement.hasAttribute('data-ae-opening')) {
      const active = panel.querySelector('[class*="VOzbGW_navCell"][aria-current="true"]');
      if (active && active.getAttribute('data-ae-group') === currentMode) setOpening(null);
    }
  };

  // The account menu's 「设置」item duplicates our sidebar entrances; tag it so
  // the skin can hide it. It stays clickable programmatically (openSettings
  // routes through it), which is why it is hidden with CSS, not removed.
  const tagDuplicates = () => {
    for (const item of document.querySelectorAll('[role="menuitem"]:not([data-ae-dup])')) {
      if ((item.textContent || '').trim() === '设置') item.setAttribute('data-ae-dup', 'settings');
    }
  };

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; sync(); tagDuplicates(); });
  };
  // With the dialog open, react inside the observer callback (before paint) so the
  // group switch lands in the same frame the dialog first appears in.
  const mo = new MutationObserver(() => {
    if (document.querySelector(PANEL_SEL)) { sync(); tagDuplicates(); } else schedule();
  });
  mo.observe(document.body, { childList: true, subtree: true });
  disposers.push(() => mo.disconnect());
  disposers.push(store.subscribe(schedule));
  schedule();

  return () => { for (const d of disposers.reverse()) { try { d(); } catch (e) { console.warn(e); } } };
}

/**
 * Open the settings dialog in `mode`. The shell owns the open state; the only
 * public opener it exposes to a footer action is the account launcher's menu,
 * so we press that launcher and pick its Settings row, or reuse an open dialog.
 */
// While our entrance is opening the dialog, html[data-ae-opening] hides the account
// menu we route through and the dialog body; the deck clears it on the frame the
// requested group is in place and plays its entry transition right there.
let openingTimer = 0;
function setOpening(mode) {
  const root = document.documentElement;
  clearTimeout(openingTimer);
  if (!mode) { root.removeAttribute('data-ae-opening'); return; }
  root.setAttribute('data-ae-opening', mode);
  openingTimer = setTimeout(() => root.removeAttribute('data-ae-opening'), 1800);
}

function openSettings(mode) {
  const panel = document.querySelector(PANEL_SEL);
  if (panel) {
    currentMode = mode;
    panel.setAttribute('data-ae-settings', mode);
    focusGroup(panel, mode);
    return;
  }
  pendingMode = mode;
  const launcher = document.querySelector('button[aria-haspopup="menu"][class*="yHnPSG_trigger"]')
    || document.querySelector('button[aria-haspopup="dialog"][class*="VOzbGW_trigger"]');
  if (!launcher) { pendingMode = null; return; }
  setOpening(mode);
  if (launcher.getAttribute('aria-haspopup') === 'dialog') { launcher.click(); return; }
  launcher.click();
  let tries = 0;
  const pick = () => {
    const item = [...document.querySelectorAll('[role="menuitem"]')]
      .find((el) => /设置|Settings/i.test(el.textContent || ''));
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
