"use strict";
const store = require('./store.js');
const ICONS = require('./icons.js');

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
const SHORT = {
  account: '账号', general: '通用', models: '模型', plugins: '插件', 'agent-presets': '预设', 'archived-sessions': '归档',
  'aemeath-theme': '爱弥斯', 'thinking-effort': '档位', 'token-usage': '用量', 'prompt-prep': '预处理', 'system-prompt-patch': '提示词',
  'plugin-quarantine': '隔离', 'nai2api-image': '生图', market: '市场', 'super-injector-plugins': '注入', 'dsh-hyperframes': '视频',
  'session-pair': '协作', subscriptions: '订阅', 'claude-code-kernel': '内核', 'codex-subscription': 'Codex', 'cursor-subscription': 'Cursor',
};
const SCENES = {
  official: ['系统设置', 'SYSTEM · 星炬终端'], plugins: ['插件中心', 'MODULES · 声骸工坊'], all: ['设置', 'SETTINGS · 星炬终端'],
};
const pad2 = n => String(n).padStart(2, '0');
const DECK_STYLES = ['resonance', 'starlight'];
function enFor(id) {
  return EN[id] || id.replace(/^dsh-/, '').replace(/[-_.]+/g, ' ').toUpperCase().slice(0, 16) || 'MODULE';
}
function shortFor(id, label) {
  if (SHORT[id]) return SHORT[id];
  if (/^[\u3400-\u9fff]/.test(label)) return label.replace(/\s+/g, '').replace(/(设置|管理|与余额)$/, '').slice(0, 4);
  return (label.split(/\s+/)[0] || label).slice(0, 6);
}
const masks = new Map();
function maskFor(id, label) {
  const key = `${id} ${label}`.toLowerCase();
  const name = ICON_BY_ID[id] || ICON_BY_WORD.find(([re]) => re.test(key))?.[1] || 'echo';
  if (!masks.has(name)) {
    const body = (ICONS[name] || ICONS.echo).replace(/currentColor/g, '#000');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" shape-rendering="crispEdges">${body}</svg>`;
    masks.set(name, `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`);
  }
  return masks.get(name);
}
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
function button(cls, label) {
  const b = el('button', cls);
  b.type = 'button'; b.setAttribute('aria-label', label);
  return b;
}

// ---------------------------------------------------------------- original glitch (intensified + viewport-pruned)
const GLYPHS = '01<>[]{}/\\|_#@*&%$アイミス声骸共鸣频谱░▒█';
const NOISE = [
  'rgba(var(--ae-pink-rgb,255,105,183),.95)',
  'rgba(var(--ae-cyan-rgb,119,232,255),.94)',
  'rgba(255,255,255,.9)',
  'rgba(var(--ae-violet-rgb,142,114,255),.92)',
];
const rnd = (a, b) => a + Math.random() * (b - a);
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function collectTexts(root) {
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const items = [];
  let total = 0, n;
  while ((n = walk.nextNode())) {
    const v = n.nodeValue;
    if (v && v.trim()) {
      const orig = n.__aeOrig !== undefined ? n.__aeOrig : (n.__aeOrig = v);
      items.push({ node: n, orig });
      total += orig.length;
    }
  }
  return { items, total };
}

function scrambleCached(pack, progress) {
  const { items, total } = pack;
  if (!total) return;
  let budget = Math.floor(total * progress);
  for (let k = 0; k < items.length; k += 1) {
    const { node, orig } = items[k];
    if (budget >= orig.length) {
      budget -= orig.length;
      if (node.nodeValue !== orig) node.nodeValue = orig;
      continue;
    }
    let out = orig.slice(0, Math.max(0, budget));
    for (let i = Math.max(0, budget); i < orig.length; i += 1) {
      const ch = orig[i];
      out += (ch === ' ' || ch === '\n' || ch === '\t') ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    budget = 0;
    node.nodeValue = out;
  }
}

function restorePacks(packs) {
  for (const pack of packs) {
    for (const { node, orig } of pack.items) {
      node.nodeValue = orig;
      delete node.__aeOrig;
    }
  }
}

// Trim descendants strictly below the visible viewport bottom in the clone so
// off-screen rows never add layout/paint cost while visible layout stays 100% identical.
function cloneVisibleTarget(target, viewHeight) {
  const cutoff = target.scrollTop + viewHeight + 56;
  let liveContainer = target;
  let depth = 0;
  while (liveContainer.children.length === 1 && depth < 5) {
    liveContainer = liveContainer.children[0];
    depth += 1;
  }
  const liveKids = liveContainer.children;
  let pruneFrom = -1;
  for (let i = 0; i < liveKids.length; i += 1) {
    if (liveKids[i].offsetTop > cutoff) { pruneFrom = i; break; }
  }
  const copy = target.cloneNode(true);
  if (pruneFrom >= 0) {
    let copyContainer = copy;
    for (let d = 0; d < depth; d += 1) copyContainer = copyContainer.children[0];
    while (copyContainer.children.length > pruneFrom) {
      copyContainer.lastElementChild.remove();
    }
  }
  copy.classList.add('ae-gl-inner');
  for (const f of copy.querySelectorAll('input,button,textarea,select,a')) {
    f.tabIndex = -1;
    f.setAttribute('aria-hidden', 'true');
  }
  return copy;
}

function glitch(panel, kind) {
  if (reduced()) return true;
  const target = panel.querySelector('[class*="VOzbGW_options"]');
  if (!target) return false;
  const rect = target.getBoundingClientRect();
  if (!rect.width || !rect.height) return false;

  const base = cloneVisibleTarget(target, rect.height);
  if (base.querySelectorAll('*').length > 1100) return false;

  const boot = kind === 'scene';
  const DURATION = boot ? 700 : 580;
  const prect = panel.getBoundingClientRect();

  const host = el('div', 'ae-gl');
  host.setAttribute('data-dir', kind === 'prev' ? 'prev' : 'next');
  host.toggleAttribute('data-boot', boot);
  host.style.cssText = `left:${rect.left - prect.left}px;top:${rect.top - prect.top}px;width:${rect.width}px;height:${rect.height}px`;

  base.setAttribute('data-gl', 'base');
  const ghostA = base.cloneNode(true); ghostA.setAttribute('data-gl', 'split-a');
  const ghostB = base.cloneNode(true); ghostB.setAttribute('data-gl', 'split-b');

  const noise = el('div', 'ae-gl-noise');
  const blocks = [];
  const blockCount = boot ? 24 : 20;
  for (let i = 0; i < blockCount; i += 1) { const b = el('i'); noise.appendChild(b); blocks.push(b); }
  host.append(base, ghostA, ghostB, noise, el('div', 'ae-gl-tear'), el('div', 'ae-gl-beam'));
  panel.appendChild(host);
  for (const c of [base, ghostA, ghostB]) c.scrollTop = target.scrollTop;

  const basePack = collectTexts(base);
  const ghostAPack = collectTexts(ghostA);
  const ghostBPack = collectTexts(ghostB);
  // Pre-scramble the RGB split ghosts once with authentic GLYPHS; during the
  // 580ms tear they jump bands & offsets every step without 2x extra text shaping/reflow per frame.
  scrambleCached(ghostAPack, 0.18);
  scrambleCached(ghostBPack, 0.08);
  const chromeEls = boot
    ? [...panel.querySelectorAll('.ae-st-title, .ae-pl, .ae-st-count, .ae-st-crumb')]
    : [...panel.querySelectorAll('.ae-st-title, .ae-pl[data-active], .ae-st-count, .ae-st-crumb')];
  const chromePacks = chromeEls.map(collectTexts);

  panel.style.setProperty('--ae-gl-dur', `${DURATION}ms`);
  panel.setAttribute('data-ae-flip', kind);
  panel.setAttribute('data-ae-fx', 'glitch');

  const band = (node, sign, heat) => {
    const top = rnd(0, 76);
    const h = rnd(14, boot ? 52 : 46);
    node.style.clipPath = `inset(${top.toFixed(1)}% 0 ${Math.max(0, 100 - top - h).toFixed(1)}% 0)`;
    node.style.translate = `${(sign * rnd(10, boot ? 28 : 24) * heat).toFixed(1)}px ${(rnd(-4.5, 4.5) * heat).toFixed(1)}px`;
    node.style.opacity = String((0.72 + 0.28 * heat).toFixed(2));
  };

  const start = performance.now();
  let frame = -1;
  const finish = () => {
    cancelAnimationFrame(panel.__aeGlRaf);
    panel.__aeGlStop = null;
    restorePacks(chromePacks);
    host.remove();
    panel.removeAttribute('data-ae-flip');
    panel.removeAttribute('data-ae-fx');
    panel.style.removeProperty('--ae-gl-dur');
  };
  const tick = () => {
    const t = performance.now() - start;
    const p = Math.min(1, t / DURATION);
    const f = Math.floor(t / 50);
    if (f !== frame) {
      frame = f;
      const heat = Math.pow(1 - p, 1.15);
      const reveal = Math.max(0, Math.min(1, (p - (boot ? 0.26 : 0.24)) / 0.64));
      scrambleCached(basePack, reveal);
      const chromeReveal = Math.max(0, Math.min(1, (p - 0.16) / 0.68));
      for (const cp of chromePacks) scrambleCached(cp, chromeReveal);
      band(ghostA, -1, heat);
      band(ghostB, 1, heat);
      base.style.translate = Math.random() < 0.65 * heat
        ? `${(rnd(-14, 14) * heat).toFixed(1)}px ${(rnd(-2.5, 2.5) * heat).toFixed(1)}px`
        : '0 0';
      for (const b of blocks) {
        if (Math.random() < 0.78 * heat + 0.08) {
          b.style.cssText = `top:${rnd(0, 97).toFixed(1)}%;left:${rnd(-10, 88).toFixed(1)}%;width:${rnd(8, boot ? 68 : 62).toFixed(1)}%;`
            + `height:${rnd(2, boot ? 18 : 15).toFixed(1)}px;opacity:${(rnd(0.5, 1) * Math.max(heat, 0.2)).toFixed(2)};`
            + `--c:${NOISE[(Math.random() * NOISE.length) | 0]}`;
        } else b.style.opacity = '0';
      }
    }
    if (p < 1) panel.__aeGlRaf = requestAnimationFrame(tick);
    else finish();
  };
  panel.__aeGlStop = finish;
  tick();
  return true;
}

function flip(panel, kind) {
  const fx = store.get().settingsFlip || 'glitch';
  if (fx === 'none' || reduced()) return;
  if (panel.__aeGlStop) { try { panel.__aeGlStop(); } catch (e) { /* ignore */ } panel.__aeGlStop = null; }
  clearTimeout(panel.__aeFlipT);
  // Keep initial modal opening light so cold mount never stutters
  if (kind === 'open') {
    panel.removeAttribute('data-ae-fx');
    panel.removeAttribute('data-ae-flip');
    void panel.offsetWidth;
    panel.setAttribute('data-ae-flip', 'open');
    panel.__aeFlipT = setTimeout(() => panel.removeAttribute('data-ae-flip'), 240);
    return;
  }
  if (fx === 'glitch' && glitch(panel, kind)) return;
  panel.removeAttribute('data-ae-flip');
  void panel.offsetWidth;
  panel.setAttribute('data-ae-flip', kind);
  panel.setAttribute('data-ae-fx', fx === 'glitch' ? 'glitch-lite' : fx);
  panel.__aeFlipT = setTimeout(() => {
    panel.removeAttribute('data-ae-flip');
    panel.removeAttribute('data-ae-fx');
  }, 560);
}

function build(panel, openSettings) {
  const head = el('div', 'ae-st-head'), title = el('div', 'ae-st-title');
  const zh = el('b'), en = el('small');
  title.append(zh, en); head.append(el('span', 'ae-st-mark'), title);
  const strip = el('div', 'ae-st-pillars'); strip.setAttribute('role', 'tablist');
  const foot = el('div', 'ae-st-foot'), bar = el('div', 'ae-st-progress'), tabs = el('div', 'ae-st-tabs');
  const prev = button('ae-st-arrow', '上一页'), next = button('ae-st-arrow', '下一页');
  prev.dataset.dir = '-1'; next.dataset.dir = '1';
  for (const [mode, label, sub] of [['official', '系统', 'SYSTEM'], ['plugins', '模组', 'MODULES']]) {
    const b = button('ae-st-tab', label); b.dataset.mode = mode;
    b.append(el('b', '', label), el('small', '', sub));
    b.onclick = () => {
      if (panel.dataset.aeSettings === mode) return;
      openSettings(mode);
    };
    tabs.append(b);
  }
  const count = el('span', 'ae-st-count'), page = el('b'), total = el('i'); count.append(page, total);
  foot.append(bar, prev, tabs, count, next);
  const beam = el('div', 'ae-st-beam');
  const crumb = el('div', 'ae-st-crumb'), crIco = el('span', 'ae-cr-ico'), crText = el('div', 'ae-cr-text');
  const crName = el('b'), crSub = el('small');
  crText.append(crName, crSub); crumb.append(crIco, crText);
  panel.prepend(head, strip, crumb); panel.append(foot, beam); panel.setAttribute('data-ae-deck', '');
  const events = new AbortController();
  const s = {
    panel, head, strip, crumb, crIco, crName, crSub, foot, count, page, total, bar, tabs, prev, next, zh, en, beam,
    events, cells: [], active: -1, mode: '', sig: '', scrollFrame: 0, entered: false, modeFlip: false,
  };
  const step = dir => {
    const active = s.cells.findIndex(c => c.getAttribute('aria-current') === 'true');
    const dest = s.cells[active + dir];
    if (dest) dest.click();
    else if (!reduced()) {
      panel.removeAttribute('data-ae-bump');
      void panel.offsetWidth;
      panel.setAttribute('data-ae-bump', dir > 0 ? 'end' : 'start');
      clearTimeout(panel.__aeBumpT);
      panel.__aeBumpT = setTimeout(() => panel.removeAttribute('data-ae-bump'), 340);
    }
  };
  prev.onclick = () => step(-1); next.onclick = () => step(1);
  const optSel = '[class*="VOzbGW_options"]';
  let start = null;
  const opts = {passive: true, signal: events.signal};
  panel.addEventListener('touchstart', e => {
    start = null;
    if (!store.get().settingsSwipe || e.touches.length !== 1 || !e.target.closest(optSel) || e.target.closest('input,textarea,select,[contenteditable="true"],[role="slider"]')) return;
    start = {x:e.touches[0].clientX, y:e.touches[0].clientY, at:e.timeStamp, target:e.target};
  }, opts);
  panel.addEventListener('touchcancel', () => { start = null; }, opts);
  panel.addEventListener('touchend', e => {
    const from = start; start = null;
    if (!from || e.touches.length || e.timeStamp - from.at > 700) return;
    const t = e.changedTouches[0], dx = t.clientX - from.x, dy = t.clientY - from.y;
    if (Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    for (let n = from.target; n && !n.matches(optSel); n = n.parentElement) {
      if (n.scrollWidth > n.clientWidth + 4 && /^(auto|scroll)$/.test(getComputedStyle(n).overflowX)) return;
    }
    step(dx < 0 ? 1 : -1);
  }, opts);
  return s;
}

function create(openSettings) {
  let s = null;
  function clear() {
    if (!s) return;
    s.events.abort();
    if (s.panel.__aeGlStop) { try { s.panel.__aeGlStop(); } catch (e) { /* ignore */ } s.panel.__aeGlStop = null; }
    clearTimeout(s.panel.__aeFlipT); clearTimeout(s.panel.__aeBumpT); cancelAnimationFrame(s.scrollFrame);
    for (const n of [s.head, s.strip, s.crumb, s.foot, s.beam]) n.remove();
    s.panel.removeAttribute('data-ae-deck');
    s.panel.removeAttribute('data-ae-flip');
    s.panel.removeAttribute('data-ae-fx');
    s = null;
  }
  return function sync(panel) {
    const p = store.get();
    if (!panel || !p.settingsSkin || !DECK_STYLES.includes(p.settingsStyle)) { clear(); return; }
    if (s?.panel !== panel) { clear(); s = build(panel, openSettings); }
    const mode = panel.dataset.aeSettings || 'all';
    const cells = [...panel.querySelectorAll(CELL_SEL)].filter(c => mode === 'all' || c.dataset.aeGroup === mode);
    const labels = cells.map(c => (c.querySelector('[class*="VOzbGW_navLabel"]')?.textContent || c.textContent).trim());
    const sig = JSON.stringify(cells.map((c,i) => [c.dataset.aeSection, labels[i]]));
    const active = cells.findIndex(c => c.getAttribute('aria-current') === 'true');
    const modeChanged = s.mode !== mode, changed = modeChanged || sig !== s.sig;
    const previous = s.active;
    s.cells = cells; s.labels = labels;
    if (changed) {
      if (s.entered && modeChanged) s.modeFlip = true;
      s.sig = sig; s.mode = mode;
      s.strip.replaceChildren(...cells.map((c, i) => {
        const id = c.dataset.aeSection || '', label = labels[i], short = shortFor(id, label);
        const b = button('ae-pl', label); b.setAttribute('role', 'tab'); b.title = label;
        b.style.setProperty('--ico', maskFor(id,label)); b.style.setProperty('--i', String(i)); b.dataset.idx = String(i);
        const vt = el('span','ae-pl-zh', short); vt.toggleAttribute('data-latin', !/[\u3400-\u9fff]/.test(short));
        const en = enFor(id);
        b.append(el('span','ae-pl-no',pad2(i+1)), el('span','ae-pl-ico'), vt, el('span','ae-pl-full',label), el('span','ae-pl-en',en));
        b.onclick = () => { const cell = s?.cells?.[i]; if (cell && cell.getAttribute('aria-current') !== 'true') cell.click(); };
        return b;
      }));
      [s.zh.textContent, s.en.textContent] = SCENES[mode] || SCENES.all;
      s.bar.style.setProperty('--n', String(cells.length || 1)); s.total.textContent = `/ ${pad2(cells.length)}`;
      for (const t of s.tabs.children) t.toggleAttribute('data-active', t.dataset.mode === mode);
      s.foot.toggleAttribute('data-split', mode !== 'all');
    }
    const opening = document.documentElement.dataset.aeOpening;
    if (!changed && previous === active && !opening) return;
    s.active = active;
    const mark = i => { const b = s.strip.children[i]; if (b) { b.toggleAttribute('data-active', i === active); b.setAttribute('aria-selected', String(i === active)); } };
    if (changed) cells.forEach((_,i) => mark(i)); else { mark(previous); mark(active); }
    s.page.textContent = pad2(Math.max(0, active) + 1); s.bar.style.setProperty('--a', String(Math.max(0,active)));
    if (cells.length) {
      const ci = Math.max(0, active), cid = cells[ci].dataset.aeSection || '', clabel = labels[ci] || '';
      s.crName.textContent = clabel;
      s.crSub.replaceChildren(document.createTextNode(enFor(cid) + ' · '), el('i', '', pad2(ci + 1) + ' / ' + pad2(cells.length)));
      s.crIco.style.setProperty('--ico', maskFor(cid, clabel));
    }
    s.prev.disabled = active <= 0; s.next.disabled = active < 0 || active >= cells.length-1;
    if (opening && (opening !== mode || active < 0)) return;
    if (opening) document.documentElement.removeAttribute('data-ae-opening');
    if (active >= 0) {
      if (!s.entered) {
        s.entered = true;
        flip(panel, 'open');
      } else if (s.modeFlip || modeChanged) {
        s.modeFlip = false;
        flip(panel, 'scene');
      } else {
        flip(panel, active < previous ? 'prev' : 'next');
      }
      cancelAnimationFrame(s.scrollFrame);
      s.scrollFrame = requestAnimationFrame(() => {
        const pill = s.strip.children[active];
        if (pill && s.strip.scrollWidth > s.strip.clientWidth) {
          s.strip.scrollLeft = Math.max(0, pill.offsetLeft - (s.strip.clientWidth - pill.offsetWidth) / 2);
        }
        if (pill && s.strip.scrollHeight > s.strip.clientHeight + 2) {
          const top = pill.offsetTop, bottom = top + pill.offsetHeight, view = s.strip.scrollTop;
          if (top < view || bottom > view + s.strip.clientHeight) s.strip.scrollTop = Math.max(0, top - (s.strip.clientHeight - pill.offsetHeight) / 2);
        }
      });
    }
  };
}
module.exports = { create };

