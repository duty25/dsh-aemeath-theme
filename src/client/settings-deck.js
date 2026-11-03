"use strict";
// 「频段柱」settings navigation for the shipped DSH 0.2.x Settings dialog.
//
// Interaction borrowed from 星落 (a row of tall pillars; the chosen one widens
// and lights up, the rest stay narrow with an icon + vertical title; a bottom
// tab strip swaps the whole scene) and the tool-style layout of 忘却前夜
// (centred title, close at top-right, low-contrast option bars). Dressed in
// Aemeath / 鸣潮 language: frequency pillars, a resonance scan beam that wipes
// the page in, an electronic-ghost glitch on the lit pillar.
//
// We never fork the official dialog. Our chrome (head / pillars / foot / beam)
// is added next to the shell-owned nav + content; the original nav stays in the
// DOM (hidden by CSS) and every pillar press is forwarded as a click on the real
// nav cell, so the shell keeps owning which section is open.
const store = require('./store.js');
const ICONS = require('./icons.js');

const PANEL_SEL = '[data-shortcut-modal="settings"]';
const CELL_SEL = '[class*="VOzbGW_navCell"]';

const EN = {
  account: 'ACCOUNT', general: 'GENERAL', models: 'MODELS', plugins: 'BUILT-IN',
  'agent-presets': 'PRESETS', 'archived-sessions': 'ARCHIVE', 'aemeath-theme': 'AEMEATH',
};
const ICON_BY_ID = {
  account: 'user', general: 'sliders', models: 'robot', plugins: 'androids', 'agent-presets': 'users',
  'archived-sessions': 'book', 'aemeath-theme': 'heart',
};
const ICON_BY_WORD = [
  [/thinking|effort|reason/, 'sparkle'], [/subscri|codex|cursor|account|usage-pill/, 'cloud'],
  [/token|usage|stats/, 'chart'], [/prompt|system-prompt|prep/, 'notes'], [/quarant|guard|shield/, 'shield'],
  [/image|nai|draw|wallpaper/, 'image'], [/market|store|shop/, 'home'], [/inject|plugin|module/, 'zap'],
  [/frame|video|hyper/, 'image'], [/pair|team|collab|session/, 'users'], [/kernel|claude|agent/, 'robot'],
  [/audio|voice|music/, 'wave'],
];

function iconFor(id, label) {
  if (ICON_BY_ID[id]) return ICON_BY_ID[id];
  const key = `${id} ${label}`.toLowerCase();
  for (const [re, name] of ICON_BY_WORD) if (re.test(key)) return name;
  return 'echo';
}
function enFor(id) {
  if (EN[id]) return EN[id];
  if (!id) return 'MODULE';
  return id.replace(/^dsh-/, '').replace(/[-_.]+/g, ' ').toUpperCase().slice(0, 16);
}
const svgUrl = (name) => {
  const body = (ICONS[name] || ICONS.echo || '').replace(/currentColor/g, '#000');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" shape-rendering="crispEdges">${body}</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};
const SHORT = {
  account: '账号', general: '通用', models: '模型', plugins: '插件', 'agent-presets': '预设', 'archived-sessions': '归档',
  'aemeath-theme': '爱弥斯', 'thinking-effort': '档位', 'token-usage': '用量', 'prompt-prep': '预处理', 'system-prompt-patch': '提示词',
  'plugin-quarantine': '隔离', 'nai2api-image': '生图', market: '市场', 'super-injector-plugins': '注入', 'dsh-hyperframes': '视频',
  'session-pair': '协作', subscriptions: '订阅', 'claude-code-kernel': '内核', 'codex-subscription': 'Codex', 'cursor-subscription': 'Cursor',
};
/** Short vertical name for an idle pillar (≤4 CJK chars or one short word). */
function shortFor(id, label) {
  if (SHORT[id]) return SHORT[id];
  const t = String(label || '').trim();
  if (/^[\u3400-\u9fff]/.test(t)) return t.replace(/\s+/g, '').replace(/(设置|管理|与余额)$/, '').slice(0, 4);
  return (t.split(/\s+/)[0] || t).slice(0, 6);
}
const pad2 = (n) => String(n).padStart(2, '0');

const SCENES = {
  official: { zh: '系统设置', en: 'SYSTEM · 星炬终端' },
  plugins: { zh: '插件中心', en: 'MODULES · 声骸工坊' },
  all: { zh: '设置', en: 'SETTINGS · 星炬终端' },
};

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

/** Visible nav cells for the current group, in DOM order. */
function liveCells(panel) {
  const mode = panel.getAttribute('data-ae-settings');
  return [...panel.querySelectorAll(CELL_SEL)].filter((c) => !mode || c.getAttribute('data-ae-group') === mode);
}
function cellLabel(c) {
  return (c.querySelector('[class*="VOzbGW_navLabel"]')?.textContent || c.textContent || '').trim();
}

function install(ctx, deps) {
  const { openSettings } = deps;
  const disposers = [];
  let state = null; // per-panel state

  const enabled = () => {
    const p = store.get();
    return p.settingsSkin && p.settingsStyle === 'resonance';
  };

  function build(panel) {
    const head = el('div', 'ae-st-head');
    const mark = el('span', 'ae-st-mark');
    const title = el('div', 'ae-st-title');
    const zh = el('b'); const en = el('small');
    title.append(zh, en);
    head.append(mark, title);

    const strip = el('div', 'ae-st-pillars');
    strip.setAttribute('role', 'tablist');

    const foot = el('div', 'ae-st-foot');
    const bar = el('div', 'ae-st-progress');
    const prev = el('button', 'ae-st-arrow'); prev.type = 'button'; prev.dataset.dir = '-1'; prev.setAttribute('aria-label', '上一页');
    const next = el('button', 'ae-st-arrow'); next.type = 'button'; next.dataset.dir = '1'; next.setAttribute('aria-label', '下一页');
    const tabs = el('div', 'ae-st-tabs');
    const mkTab = (mode, zhT, enT) => {
      const b = el('button', 'ae-st-tab'); b.type = 'button'; b.dataset.mode = mode;
      b.append(el('b', '', zhT), el('small', '', enT));
      b.addEventListener('click', () => {
        if (panel.getAttribute('data-ae-settings') === mode) return;
        flip(panel, 'scene');
        openSettings(mode);
      });
      return b;
    };
    tabs.append(mkTab('official', '系统', 'SYSTEM'), mkTab('plugins', '模组', 'MODULES'));
    const count = el('span', 'ae-st-count');
    foot.append(bar, prev, tabs, count, next);
    for (const b of [prev, next]) b.addEventListener('click', () => step(panel, Number(b.dataset.dir)));

    const beam = el('div', 'ae-st-beam');

    panel.insertBefore(strip, panel.firstChild);
    panel.insertBefore(head, strip);
    panel.appendChild(foot);
    panel.appendChild(beam);
    panel.setAttribute('data-ae-deck', '');
    attachSwipe(panel);
    return { panel, head, zh, en, strip, foot, bar, tabs, count, prev, next, beam, sig: '', active: -1, mode: '' };
  }

  function teardown(s) {
    if (!s) return;
    if (s.panel.__aeGlStop) { try { s.panel.__aeGlStop(); } catch (e) { /* ignore */ } s.panel.__aeGlStop = null; }
    for (const n of [s.head, s.strip, s.foot, s.beam]) n.remove();
    s.panel.removeAttribute('data-ae-deck');
    s.panel.removeAttribute('data-ae-flip');
  }

  // ---------------------------------------------------------------- glitch
  // A short "decrypt" transition: a copy of the incoming page is drawn on top
  // of the real one, torn into RGB-split slices, and its text is replaced by
  // random glyphs that resolve left-to-right. The React tree is never touched,
  // so nothing can desync from the store; the overlay is purely visual.
  const GLYPHS = '01<>[]{}/\\|_#@*&%$アイミス声骸共鸣频谱░▒█';

  function contentNode(panel) {
    return panel.querySelector('[class*="VOzbGW_options"]');
  }

  function scramble(el, progress) {
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    let n;
    while ((n = walk.nextNode())) if (n.nodeValue && n.nodeValue.trim()) nodes.push(n);
    if (!nodes.length) return;
    const total = nodes.reduce((a, x) => a + x.nodeValue.length, 0);
    let budget = Math.floor(total * progress);
    for (const node of nodes) {
      const value = node.__aeOrig || (node.__aeOrig = node.nodeValue);
      if (budget >= value.length) { budget -= value.length; node.nodeValue = value; continue; }
      let out = value.slice(0, Math.max(0, budget));
      for (let i = Math.max(0, budget); i < value.length; i += 1) {
        out += value[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      budget = 0;
      node.nodeValue = out;
    }
  }

  function glitch(panel, kind) {
    const target = contentNode(panel);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    // keep it cheap on huge pages: cap the cloned subtree
    if (target.querySelectorAll('*').length > 900) return;

    const host = el('div', 'ae-gl');
    host.setAttribute('data-dir', kind === 'prev' ? 'prev' : 'next');
    host.style.cssText = `left:${rect.left - panel.getBoundingClientRect().left}px;top:${rect.top - panel.getBoundingClientRect().top}px;width:${rect.width}px;height:${rect.height}px`;

    const make = (variant) => {
      const copy = target.cloneNode(true);
      // keep the shipped classes so the clone keeps its layout; ae-gl-inner
      // only turns it into an overlay layer.
      copy.classList.add('ae-gl-inner');
      copy.setAttribute('data-gl', variant);
      for (const f of copy.querySelectorAll('input,button,textarea,select,a')) {
        f.tabIndex = -1;
        f.setAttribute('aria-hidden', 'true');
      }
      return copy;
    };

    const base = make('base');
    const ghostA = make('split-a');
    const ghostB = make('split-b');
    host.append(base, ghostA, ghostB);
    const tear = el('div', 'ae-gl-tear');
    host.append(tear);
    panel.appendChild(host);
    panel.setAttribute('data-ae-flip', kind);
    panel.setAttribute('data-ae-fx', 'glitch');

    const start = performance.now();
    const DURATION = 460;
    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / DURATION);
      const eased = 1 - Math.pow(1 - p, 2.4);
      scramble(base, Math.min(1, p * 1.35));
      scramble(ghostA, Math.min(1, p * 0.8));
      scramble(ghostB, Math.min(1, p * 0.6));
      if (p < 1) panel.__aeGlRaf = requestAnimationFrame(tick);
      else finish();
    };
    const finish = () => {
      cancelAnimationFrame(panel.__aeGlRaf);
      host.remove();
      panel.removeAttribute('data-ae-flip');
      panel.removeAttribute('data-ae-fx');
    };
    panel.__aeGlStop = finish;
    tick();
  }

  function flip(panel, kind) {
    const fx = store.get().settingsFlip || 'glitch';
    if (fx === 'none') return;
    if (panel.__aeGlStop) { try { panel.__aeGlStop(); } catch (e) { /* ignore */ } panel.__aeGlStop = null; }
    if (fx === 'glitch') { glitch(panel, kind); return; }
    panel.removeAttribute('data-ae-flip');
    void panel.offsetWidth; // restart the CSS animations
    panel.setAttribute('data-ae-flip', kind);
    panel.setAttribute('data-ae-fx', fx);
    clearTimeout(panel.__aeFlipT);
    panel.__aeFlipT = setTimeout(() => panel.removeAttribute('data-ae-flip'), 700);
  }

  function step(panel, dir) {
    const cells = liveCells(panel);
    const i = cells.findIndex((c) => c.getAttribute('aria-current') === 'true');
    const j = i + dir;
    if (j < 0 || j >= cells.length) {
      panel.removeAttribute('data-ae-bump');
      void panel.offsetWidth;
      panel.setAttribute('data-ae-bump', dir > 0 ? 'end' : 'start');
      setTimeout(() => panel.removeAttribute('data-ae-bump'), 400);
      return;
    }
    cells[j].click();
  }

  function attachSwipe(panel) {
    if (panel.__aeSwipe) return;
    panel.__aeSwipe = true;
    let sx = 0, sy = 0, st = 0, ok = false;
    const scrollsX = (node, stop) => {
      for (let n = node; n && n !== stop; n = n.parentElement) {
        if (n.matches?.('input,textarea,select,[contenteditable="true"],[role="slider"]')) return true;
        if (n.scrollWidth > n.clientWidth + 4) {
          const ox = getComputedStyle(n).overflowX;
          if (ox === 'auto' || ox === 'scroll') return true;
        }
      }
      return false;
    };
    panel.addEventListener('touchstart', (e) => {
      ok = false;
      if (!store.get().settingsSwipe || e.touches.length !== 1) return;
      const opts = e.target.closest?.('[class*="VOzbGW_options"]');
      if (!opts || scrollsX(e.target, opts)) return;
      ok = true; sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now();
    }, { passive: true });
    panel.addEventListener('touchend', (e) => {
      if (!ok) return;
      ok = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - sx, dy = t.clientY - sy;
      if (Date.now() - st > 700 || Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
      step(panel, dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  function renderPillars(s, cells) {
    s.strip.textContent = '';
    cells.forEach((c, i) => {
      const id = c.getAttribute('data-ae-section') || '';
      const label = cellLabel(c);
      const b = el('button', 'ae-pl');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.dataset.idx = String(i);
      b.style.setProperty('--ico', svgUrl(iconFor(id, label)));
      b.style.setProperty('--i', String(i));
      b.title = label;
      const short = shortFor(id, label);
      const vt = el('span', 'ae-pl-zh', short);
      if (!/[\u3400-\u9fff]/.test(short)) vt.setAttribute('data-latin', '');
      b.setAttribute('aria-label', label);
      b.append(el('span', 'ae-pl-no', pad2(i + 1)), el('span', 'ae-pl-ico'), vt, el('span', 'ae-pl-full', label), el('span', 'ae-pl-en', enFor(id)));
      b.addEventListener('click', () => {
        const live = liveCells(s.panel);
        const target = live[i];
        if (target && target.getAttribute('aria-current') !== 'true') target.click();
      });
      s.strip.appendChild(b);
    });
  }

  function mark(s, cells, active, mode) {
    s.active = active;
    s.mode = mode;
    [...s.strip.children].forEach((b, i) => {
      b.toggleAttribute('data-active', i === active);
      b.setAttribute('aria-selected', i === active ? 'true' : 'false');
    });
    s.count.innerHTML = `<b>${pad2(Math.max(0, active) + 1)}</b><i>/ ${pad2(cells.length)}</i>`;
    s.bar.style.setProperty('--a', String(Math.max(0, active)));
    s.prev.disabled = active <= 0;
    s.next.disabled = active >= cells.length - 1;
  }

  function sync() {
    const panel = document.querySelector(PANEL_SEL);
    if (!panel || !enabled()) {
      if (state && (!panel || state.panel !== panel || !enabled())) { teardown(state); state = null; }
      return;
    }
    if (!state || state.panel !== panel || !panel.contains(state.strip)) {
      if (state) teardown(state);
      state = build(panel);
    }
    const s = state;
    const mode = panel.getAttribute('data-ae-settings') || 'all';
    const cells = liveCells(panel);
    const sig = mode + '|' + cells.map(cellLabel).join('\u0001');
    if (sig !== s.sig) {
      s.sig = sig;
      renderPillars(s, cells);
      const sc = SCENES[mode] || SCENES.all;
      s.zh.textContent = sc.zh;
      s.en.textContent = sc.en;
      s.bar.style.setProperty('--n', String(Math.max(1, cells.length)));
      s.active = -1;
    }
    for (const t of s.tabs.children) t.toggleAttribute('data-active', t.dataset.mode === mode);
    s.foot.toggleAttribute('data-split', mode !== 'all');

    const active = cells.findIndex((c) => c.getAttribute('aria-current') === 'true');
    const root = document.documentElement;
    const opening = root.getAttribute('data-ae-opening');
    if (opening) {
      // entrance in progress: track silently until the requested group is showing
      if (active !== s.active || mode !== s.mode) mark(s, cells, active, mode);
      if (mode === opening && active >= 0) {
        root.removeAttribute('data-ae-opening');
        flip(panel, 'scene');
      }
      return;
    }
    if (active !== s.active || mode !== s.mode) {
      const prevIdx = s.active;
      const modeChanged = s.mode && mode !== s.mode;
      s.active = active;
      s.mode = mode;
      [...s.strip.children].forEach((b, i) => {
        b.toggleAttribute('data-active', i === active);
        b.setAttribute('aria-selected', i === active ? 'true' : 'false');
      });
      s.count.innerHTML = `<b>${pad2(Math.max(0, active) + 1)}</b><i>/ ${pad2(cells.length)}</i>`;
      s.bar.style.setProperty('--a', String(Math.max(0, active)));
      s.prev.disabled = active <= 0;
      s.next.disabled = active >= cells.length - 1;
      if (modeChanged) flip(panel, 'scene');
      else if (prevIdx >= 0 && active >= 0) flip(panel, active > prevIdx ? 'next' : 'prev');
      const pill = s.strip.children[active];
      if (pill) {
        // keep the lit pillar in view (centre it) once the width transition settles
        setTimeout(() => {
          const left = pill.offsetLeft - (s.strip.clientWidth - pill.offsetWidth) / 2;
          s.strip.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
        }, 60);
      }
    }
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; try { sync(); } catch (e) { console.warn('[aemeath-theme] deck', e); } });
  };
  // Run in the observer callback while the dialog is open: a page switch is then
  // answered before the browser paints the new page, so the transition never lags.
  const mo = new MutationObserver(() => {
    if (document.querySelector(PANEL_SEL)) { try { sync(); } catch (e) { console.warn('[aemeath-theme] deck', e); } } else schedule();
  });
  mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-current', 'data-ae-settings', 'data-ae-group'] });
  disposers.push(() => mo.disconnect());
  disposers.push(store.subscribe(schedule));
  schedule();

  return () => {
    for (const d of disposers.reverse()) { try { d(); } catch (e) { console.warn(e); } }
    teardown(state);
    state = null;
  };
}

module.exports = { install };
