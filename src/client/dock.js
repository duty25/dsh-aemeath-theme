"use strict";
// Aemeath quick menu: a column of pixel 9-slice buttons that pops up next to
// the pixel Aemeath ONLY when she is tapped. It never appears on its own:
// tapping her again, tapping anywhere else, pressing Escape or running one of
// its actions closes it. Move it by dragging Aemeath herself (the menu always
// opens beside her, on the side with more room). Buttons and their order are
// edited in the theme panel.
const store = require('./store.js');
const icons = require('./icons.js');
const { asset } = require('./assets.js');

const svg = (name) => `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">${icons[name] || icons.star}</svg>`;

const CSS = `
#aemeath-dock{position:fixed;left:0;top:0;z-index:46;display:flex;flex-direction:column;align-items:stretch;gap:6px;padding:7px 6px;
  --b:44px;background:rgba(13,9,27,.88);border:2px solid #ff69b7;box-shadow:3px 3px 0 #0d091b,0 0 16px rgba(255,105,183,.4);
  -webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);transform-origin:var(--ox,0%) 50%;
  animation:ae-dock-pop .16s steps(4) both}
html[style*="color-scheme: light"] #aemeath-dock{background:rgba(255,244,250,.94)}
#aemeath-dock[hidden]{display:none}
#aemeath-dock[data-size="s"]{--b:38px}
#aemeath-dock[data-size="l"]{--b:50px}
@keyframes ae-dock-pop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}
#aemeath-dock .ae-dock-btn{position:relative;height:var(--b);min-width:var(--b);display:flex;align-items:center;gap:8px;padding:0 10px 0 6px;cursor:pointer;color:#ffd5ea;
  border-style:solid;border-width:4px;border-color:transparent;border-image:url("${asset('btn-plum.png')}") 4 fill / 8px / 0 stretch;image-rendering:pixelated;
  background:none;font:inherit;font-size:13px;font-weight:600;white-space:nowrap;text-align:left}
#aemeath-dock .ae-dock-btn[data-on]{border-image-source:url("${asset('btn-pink.png')}");color:#3a0f2a}
#aemeath-dock .ae-dock-btn:active{border-image-source:url("${asset('btn-pink-pressed.png')}");color:#3a0f2a}
#aemeath-dock .ae-dock-btn svg{flex:none;width:calc(var(--b) * .46);height:calc(var(--b) * .46);filter:drop-shadow(1px 1px 0 rgba(13,9,27,.7))}
#aemeath-dock[data-compact] .ae-dock-btn{padding:0;justify-content:center}
#aemeath-dock[data-compact] .ae-dock-btn span{display:none}
#aemeath-dock .ae-dock-btn:focus-visible{outline:2px solid #77e8ff;outline-offset:1px}
`;

/** Action table. `run()` performs, `on()` (optional) reports a toggle state. */
function actions(ctx, hooks) {
  const q = (s) => document.querySelector(s);
  const clickFirst = (...sels) => { for (const s of sels) { const e = q(s); if (e) { e.click(); return true; } } return false; };
  const scroller = () => q('[data-conversation-scroll]') || q('[data-conversation-content]');
  const pager = hooks.pager || {};
  return {
    newSession: {
      label: '新会话', icon: 'plus',
      run() {
        if (clickFirst('button[class*="_newSession"]')) { pager.navigatePager?.('chat', () => {}); return; }
        try { ctx.get('uiWorkspace')?.startSession?.(); } catch { /* ignore */ }
      },
    },
    sidebar: {
      label: '会话列表', icon: 'menu',
      run() {
        const toggle = () => { try { ctx.get('layout').toggleSidebar(); } catch { /* ignore */ } };
        if (pager.togglePager && window.matchMedia('(max-width: 1023px)').matches) pager.togglePager(toggle); else toggle();
      },
    },
    composer: {
      label: '收起/展开输入框', icon: 'message',
      run() {
        if (clickFirst('[data-mobile-nav="composer-toggle"]')) return;
        const seat = q('[data-composer-seat]');
        if (seat) seat.style.display = seat.style.display === 'none' ? '' : 'none';
      },
      on: () => !!q('[data-dshm-composer="collapsed"]'),
    },
    scrollBottom: {
      label: '回到最新', icon: 'bar-down',
      run() { const s = scroller(); if (s) s.scrollTo({ top: s.scrollHeight, behavior: 'smooth' }); },
    },
    scrollTop: {
      label: '回到顶部', icon: 'bar-up',
      run() { const s = scroller(); if (s) s.scrollTo({ top: 0, behavior: 'smooth' }); },
    },
    rightbar: {
      label: '右侧面板', icon: 'layout',
      run() {
        if (clickFirst('button[data-sidebar-right-expand]')) return;
        const open = q('[class*="_rightbarCol"]')?.offsetWidth > 0;
        try { const l = ctx.get('layout'); if (open) l.closeRightbar(); else l.openRightbar(); } catch { /* ignore */ }
      },
    },
    pet: {
      label: '隐藏爱弥斯', icon: 'eye-closed',
      run() { store.set({ pet: false }); },
    },
    scheme: {
      label: '深色/浅色', icon: 'moon',
      run() {
        const dark = document.documentElement.style.colorScheme !== 'light';
        try { ctx.get('theme').setTheme(dark ? 'light' : 'dark'); } catch { /* ignore */ }
      },
    },
    settings: {
      label: '主题设置', icon: 'sliders',
      run() { hooks.openPanel?.(); },
    },
  };
}

function install(ctx, hooks) {
  const style = document.createElement('style');
  style.dataset.plugin = 'dsh-aemeath-theme';
  style.dataset.pluginCss = 'dsh-aemeath-theme/dock.css';
  style.textContent = CSS;
  document.head.appendChild(style);

  const el = document.createElement('div');
  el.id = 'aemeath-dock';
  el.setAttribute('role', 'menu');
  el.setAttribute('aria-label', '爱弥斯快捷按键');
  el.hidden = true;
  document.body.appendChild(el);
  const table = actions(ctx, hooks);
  let open = false;

  function render() {
    const p = store.get();
    el.dataset.size = p.dockSize;
    el.toggleAttribute('data-compact', p.dockLabels === false);
    el.innerHTML = '';
    for (const a of p.dockActions) {
      if (!a.on || !table[a.id]) continue;
      const def = table[a.id];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ae-dock-btn';
      b.setAttribute('role', 'menuitem');
      b.dataset.action = a.id;
      b.setAttribute('aria-label', def.label);
      b.innerHTML = `${svg(def.icon)}<span>${def.label}</span>`;
      if (def.on && def.on()) b.setAttribute('data-on', '');
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        close();
        try { def.run(); } catch (err) { console.warn('[aemeath-theme] menu action failed', a.id, err); }
      });
      el.appendChild(b);
    }
  }

  /** Open beside the pet, on whichever side has more room. */
  function place() {
    const anchor = hooks.petRect?.();
    const w = el.offsetWidth, h = el.offsetHeight;
    let x, y, ox = '0%';
    if (anchor) {
      const roomRight = innerWidth - anchor.right, roomLeft = anchor.left;
      if (roomRight >= w + 6 || roomLeft >= w + 6) {
        const right = roomRight >= w + 6 && (roomRight >= roomLeft || roomLeft < w + 6);
        x = right ? anchor.right + 2 : anchor.left - w - 2;
        ox = right ? '0%' : '100%';
        y = anchor.top + anchor.height / 2 - h / 2;
      } else {
        // Not enough room on either side: stack above / below the pet instead.
        x = anchor.left + anchor.width / 2 - w / 2;
        y = anchor.top - h - 6 >= 4 ? anchor.top - h - 6 : anchor.bottom + 6;
      }
    } else {
      x = innerWidth - w - 8; y = innerHeight / 2 - h / 2;
    }
    x = Math.max(4, Math.min(innerWidth - w - 4, x));
    y = Math.max(4, Math.min(innerHeight - h - 4, y));
    el.style.setProperty('--ox', ox);
    el.style.left = `${Math.round(x)}px`;
    el.style.top = `${Math.round(y)}px`;
  }

  function show() {
    if (!store.get().dock) return false;
    open = true;
    render();
    el.hidden = false;
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    place();
    return true;
  }
  function close() {
    if (!open) return;
    open = false;
    el.hidden = true;
  }
  function toggle() { return open ? (close(), false) : show(); }

  // Outside tap / Escape / resize close the menu. Taps on the pet are handled
  // by the pet itself (it calls toggle()).
  const onDown = (e) => {
    if (!open) return;
    const t = e.target;
    if (el.contains(t) || (t && t.closest && t.closest('#aemeath-pet'))) return;
    close();
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const onResize = () => close();
  document.addEventListener('pointerdown', onDown, true);
  document.addEventListener('keydown', onKey);
  window.addEventListener('resize', onResize);

  const off = store.subscribe(() => { if (!store.get().dock || !store.get().pet) close(); else if (open) { render(); place(); } });
  return {
    toggle, show, close, isOpen: () => open,
    dispose() {
      off();
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      el.remove(); style.remove();
    },
  };
}

module.exports = { install, actions, svg };
