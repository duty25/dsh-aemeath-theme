"use strict";
// Preference store: one localStorage JSON blob + subscribe. Every surface
// (skin, pet, dock, settings page) reads and writes through here, so a change
// in the settings page applies live without a reload.
const KEY = 'dsh-aemeath-theme:prefs';
const BG_KEY = 'dsh-aemeath-theme:custom-bg';

const DOCK_ACTIONS = ['newSession', 'sidebar', 'composer', 'scrollBottom', 'scrollTop', 'rightbar', 'pet', 'scheme', 'settings'];

const DEFAULTS = {
  version: 1,
  // appearance
  skin: true,               // pink/plum token layer + component skin
  scheme: 'dark',           // 'dark' | 'light' | 'follow'
  background: 'night',      // 'night' | 'night-dim' | 'custom' | 'none'
  bgDim: 0.45,              // 0..0.9 veil over the background image
  bgBlur: 0,                // px
  scanlines: true,
  stars: true,
  pixelCorners: true,       // cut-corner (chamfer) buttons and cards
  glass: 0.62,              // surface opacity over the background (0.3..0.95)
  // pet
  pet: true,
  petScale: 0.75,           // 0.5 .. 1.5 (of a 96x104 cell)
  petBubbles: true,
  petFollowAgent: true,
  petPos: null,             // {x, y} in px from the left/top, null = default
  // dock
  dock: true,               // tap Aemeath to open the quick menu
  dockSize: 'm',            // 's' | 'm' | 'l'
  dockLabels: true,         // show text next to the icons in the quick menu
  dockActions: DOCK_ACTIONS.map(id => ({ id, on: ['newSession', 'sidebar', 'composer', 'scrollBottom', 'pet', 'settings'].includes(id) })),
  // capsule
  wwLingo: true,
  keyboardGuard: true,
  hideNotifyBell: true,     // hide memory-evolve's floating in-app notification bell
  // settings dialog (DSH 0.2.x)
  settingsSkin: true,       // 星落/赛博 control-room skin for the official settings dialog
  settingsStyle: 'resonance', // 'resonance' 频段柱(爱弥斯) | 'starfall' 暗金 | 'cyber' 电黄 | 'classic' 仅换色不改导航
  settingsFlip: 'glitch',   // 翻页效果：'glitch' 电子幽灵乱码 | 'scan' 共鸣扫描 | 'slide' 平移 | 'none'
  settingsSwipe: true,      // 设置内容区左右滑动翻页
  settingsSplit: true,      // two entrances: 系统设置 (official) / 插件中心 (plugin pages)
  brand: true,              // 深空联合 emblem + renamed brand
  brandName: 'spacetrek',   // 'spacetrek' | 'aemeath' | 'ghost'
  palette: 'aemeath',       // colour scheme preset (see palette.js PALETTES)
  textColor: 'default',     // body text tint: default | pink | cyan | lilac | white
  uiFont: 'pixel-title',    // 'pixel-title' | 'system' | 'mono'
  pixelIcons: true,         // swap header / sidebar icons for pixel icons            // 鸣潮-style names for process / tool rows (zh UI)
  capsuleSkin: true,
  polestarSlider: true,
  chatChrome: true,         // 聊天页顶栏/输入框/状态条的「舰桥」样式
  compactSidebar: true,     // 侧栏紧凑布局：顶部入口一排图标、底部两排卡片     // 思考强度滑块：永远的启明星光刃 + 粒子
  capsuleClamp: true,       // keep the model panel inside the viewport on phones
  // layout
  mobileNav: true,          // bundled dsh-mobile-nav layout (needs a reload to flip)
  mobileFixes: true,        // bundled header/touch/wallpaper-layout fixes
};

function clone(v) { return JSON.parse(JSON.stringify(v)); }

function load() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { saved = {}; }
  const merged = Object.assign(clone(DEFAULTS), saved);
  if (!Array.isArray(merged.dockActions)) merged.dockActions = clone(DEFAULTS.dockActions);
  merged.dockActions = merged.dockActions.filter(a => a && DOCK_ACTIONS.includes(a.id));
  const known = new Set(merged.dockActions.map(a => a.id));
  for (const id of DOCK_ACTIONS) if (!known.has(id)) merged.dockActions.push({ id, on: false });
  // v2: the settings dialog got the 频段柱 (resonance) layout; move earlier
  // saves off the old default once, keep any later explicit choice.
  if (merged.settingsStyle !== 'resonance' && merged.settingsStyle !== 'classic') merged.settingsStyle = 'resonance';
  if ((saved.settingsRev || 0) < 2) {
    if (!saved.settingsStyle || saved.settingsStyle === 'starfall' || saved.settingsStyle === 'cyber') merged.settingsStyle = 'resonance';
    merged.settingsRev = 2;
  }
  // v3: page flips default to the 2077-style garble (电子幽灵·乱码); a save that
  // only carried the old 'scan' default moves over once.
  if ((merged.settingsRev || 0) < 3) {
    if (!saved.settingsFlip || saved.settingsFlip === 'scan') merged.settingsFlip = 'glitch';
    merged.settingsRev = 3;
  }
  return merged;
}

let state = load();
const listeners = new Set();

function get() { return state; }
function set(patch) {
  state = Object.assign({}, state, typeof patch === 'function' ? patch(state) : patch);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota */ }
  for (const fn of [...listeners]) { try { fn(state); } catch (e) { console.error('[aemeath-theme]', e); } }
}
function reset(keys) {
  if (!keys) { set(clone(DEFAULTS)); return; }
  const patch = {};
  for (const k of keys) patch[k] = clone(DEFAULTS[k]);
  set(patch);
}
function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

function getCustomBg() { try { return localStorage.getItem(BG_KEY) || ''; } catch { return ''; } }
function setCustomBg(dataUrl) {
  try {
    if (dataUrl) localStorage.setItem(BG_KEY, dataUrl); else localStorage.removeItem(BG_KEY);
  } catch (e) { throw new Error('图片太大，浏览器存不下（请换一张小一点的图）'); }
  set({});
}

module.exports = { get, set, reset, subscribe, DEFAULTS, DOCK_ACTIONS, getCustomBg, setCustomBg };
