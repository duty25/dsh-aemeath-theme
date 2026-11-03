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
