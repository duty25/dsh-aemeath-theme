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

