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
  ctx.effect(() => settingsDeck.install(ctx, { openSettings: settingsSplit.openSettings }), `${NAME}: settings deck`);
  ctx.effect(() => settingsSplit.install(ctx), `${NAME}: settings split`);
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
