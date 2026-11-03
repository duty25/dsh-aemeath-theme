"use strict";
// Colour presets and the token layer handed to theme.overrideTokens.
// Every preset defines the same keys; the skin CSS reads them through
// --ae-* custom properties, so switching preset is a pure variable swap.
const PALETTES = {
  aemeath: {   // 粉紫星夜 — Aemeath's pink hair over a plum night
    label: '爱弥斯·粉紫', pink: '#ff69b7', pink2: '#f24c9e', soft: '#ffb3da', accent: '#77e8ff', violet: '#8e72ff', gold: '#ffd76a',
    plum: '#0d091b', plum2: '#1a1934', plum3: '#28234a', surface: '#111326', ink: '#f7f4ff', muted: '#a8a5bc',
    milk: '#fff7fb', blush: '#ffe8f3', lightInk: '#2b1838', lightMuted: '#6c5577',
  },
  starblue: {  // 星辉蓝 — Spacetrek blue with cyan star glints
    label: '星辉·偏蓝', pink: '#5fb8ff', pink2: '#3d8bff', soft: '#b5dcff', accent: '#ff8fcf', violet: '#7c86ff', gold: '#ffe08a',
    plum: '#070c1d', plum2: '#101a36', plum3: '#1a2a52', surface: '#0c1430', ink: '#eef6ff', muted: '#9fb0cc',
    milk: '#f5f9ff', blush: '#e5f0ff', lightInk: '#14233f', lightMuted: '#4f6585',
  },
  ghost: {     // 电子幽灵 — cyan glitch over deep violet
    label: '电子幽灵·青紫', pink: '#5ff3e6', pink2: '#22d3c5', soft: '#b9fff7', accent: '#ff6fb5', violet: '#a479ff', gold: '#fff38a',
    plum: '#0a0717', plum2: '#17112e', plum3: '#251b47', surface: '#100c24', ink: '#f2fffd', muted: '#a0b7b8',
    milk: '#f3fffd', blush: '#e2fbf8', lightInk: '#123236', lightMuted: '#4b6f72',
  },
  sakura: {    // 樱绯 — warm sakura pink, softer contrast
    label: '樱绯·暖粉', pink: '#ff8fab', pink2: '#ff5d8f', soft: '#ffd1dc', accent: '#ffd76a', violet: '#c78bff', gold: '#ffd76a',
    plum: '#140a12', plum2: '#24131f', plum3: '#3a2033', surface: '#1b0e18', ink: '#fff5f8', muted: '#c2a6b2',
    milk: '#fff8fa', blush: '#ffeaf0', lightInk: '#3a1a28', lightMuted: '#7a5866',
  },
};

const TEXT_COLORS = {
  default: { label: '默认', dark: null, light: null },
  white: { label: '月白', dark: '#ffffff', light: '#1b1424' },
  pink: { label: '樱粉', dark: '#ffd6ea', light: '#7a1e52' },
  cyan: { label: '星青', dark: '#d4f6ff', light: '#0e4a63' },
  lilac: { label: '雾紫', dark: '#e4dcff', light: '#3d2a73' },
};

function pal(id) { return PALETTES[id] || PALETTES.aemeath; }

function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** CSS custom properties for the chosen preset (dark values). */
function cssVars(id) {
  const P = pal(id);
  const v = {
    '--ae-pink': P.pink, '--ae-pink2': P.pink2, '--ae-pink-soft': P.soft, '--ae-cyan': P.accent, '--ae-violet': P.violet, '--ae-gold': P.gold,
    '--ae-plum': P.plum, '--ae-plum2': P.plum2, '--ae-plum3': P.plum3, '--ae-ink': P.ink,
  };
  for (const [k, hex] of [['pink', P.pink], ['cyan', P.accent], ['violet', P.violet], ['plum', P.plum], ['plum2', P.plum2], ['plum3', P.plum3], ['surface', P.surface], ['gold', P.gold]]) {
    const n = parseInt(hex.slice(1), 16);
    v[`--ae-${k}-rgb`] = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }
  return v;
}

/** Token layer; `glass` = surface opacity over the background image. */
function tokens(glass, id, textColor) {
  const P = pal(id);
  const T = TEXT_COLORS[textColor] || TEXT_COLORS.default;
  const g = Math.max(0.3, Math.min(0.97, glass));
  return {
    '--dsw-alias-bg-base': { dark: rgba(P.plum, g * 0.55), light: rgba(P.milk, g * 0.6) },
    '--dsw-alias-bg-layer-1': { dark: rgba(P.surface, Math.min(1, g + 0.12)), light: rgba('#ffffff', Math.min(1, g + 0.18)) },
    '--dsw-alias-bg-layer-2': { dark: rgba(P.plum2, Math.min(1, g + 0.2)), light: rgba(P.blush, Math.min(1, g + 0.22)) },
    '--dsw-alias-bg-overlay': { dark: rgba(P.plum2, 0.97), light: 'rgba(255, 250, 253, 0.98)' },
    '--dsw-alias-border-l1': { dark: rgba(P.pink, 0.16), light: rgba(P.pink2, 0.16) },
    '--dsw-alias-border-l2': { dark: rgba(P.pink, 0.32), light: rgba(P.pink2, 0.32) },
    '--dsw-alias-brand-primary': { dark: P.pink, light: P.pink2 },
    '--dsw-alias-label-primary': { dark: T.dark || P.ink, light: T.light || P.lightInk },
    '--dsw-alias-label-secondary': { dark: T.dark ? rgba(T.dark, 0.86) : '#d6d0ea', light: '#4d3a5c' },
    '--dsw-alias-label-tertiary': { dark: P.muted, light: P.lightMuted },
    '--dsw-alias-label-caption': { dark: rgba(P.muted, 0.85), light: rgba(P.lightMuted, 0.85) },
    '--dsw-alias-state-error-primary': { dark: '#ff5d7a', light: '#e0244f' },
    '--dsw-alias-state-idle-primary': { dark: rgba(P.muted, 0.85), light: '#9a88a4' },
    '--dsw-alias-state-success-primary': { dark: '#6ff0c0', light: '#13a37a' },
    '--dsw-alias-state-warn-primary': { dark: P.gold, light: '#c98a00' },
    '--dsw-specific-sidebar-fill': { dark: rgba(P.plum, Math.min(1, g + 0.18)), light: rgba(P.blush, Math.min(1, g + 0.2)) },
  };
}

const P = PALETTES.aemeath;
module.exports = { P, PALETTES, TEXT_COLORS, pal, rgba, cssVars, tokens };
