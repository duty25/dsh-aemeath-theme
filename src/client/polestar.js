"use strict";
// 思考强度滑块：保留 @hytime/dsh-thinking-effort 原版「药丸轨道 + 像素光柱辐射 + 刃尖光晕」的结构，
// 只换成「永远的启明星」配色（深空蓝 → 星辉粉，青蓝光柱、粉白刃尖），再加一层像素星屑粒子；
// 旋钮换成像素爱弥斯（待机呼吸，拖动时朝拖动方向奔跑）。
// 原版画布的配色写死在它的 drawRadiation 里，所以这里隐藏原画布，用同一算法重绘一份
// （算法移植自 HanaAyane/dsh-reasoning-effort → hytime/dsh-thinking-effort，MIT）。
const store = require('./store.js');
const { asset } = require('./assets.js');

const S = 'html[data-aemeath][data-ae-polestar]';
const css = () => `
${S} .re-effort-canvas{display:none !important}
${S} .re-effort,${S} .re-effort.is-chibi{height:54px !important}
${S} .re-effort-slider{height:30px !important;border-radius:999px !important;contain:layout style !important;overflow:visible !important}
${S} .re-effort-track{border-radius:999px !important;
  background:linear-gradient(100deg,#04030b 0%,#0a1230 22%,#13285c 45%,#3b2a70 68%,#9a4192 100%) !important;
  box-shadow:inset 0 1px 0 rgba(191,246,255,.18),inset 0 -1px 0 rgba(0,0,0,.55),0 0 0 1px rgba(255,124,196,.22),0 3px 10px rgba(30,12,55,.4) !important}
${S} .re-effort-track::after{background:
    radial-gradient(circle at 18% 45%,rgba(127,233,255,.14),transparent 26%),
    linear-gradient(90deg,rgba(0,0,0,.28),transparent 42%,rgba(255,124,196,.16)) !important}
${S} .re-effort-slider[data-top] .re-effort-track{animation:ae-ps-breathe 1.9s ease-in-out infinite !important}
@keyframes ae-ps-breathe{
  0%,100%{box-shadow:inset 0 1px 0 rgba(191,246,255,.18),0 0 0 1px rgba(255,124,196,.3),0 3px 10px rgba(30,12,55,.4)}
  50%{box-shadow:inset 0 1px 0 rgba(220,250,255,.28),0 0 0 1px rgba(127,233,255,.55),0 0 22px rgba(255,124,196,.55)}}
${S} .ae-ps-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none}
/* 刃尖光晕：白 → 星辉粉 → 青 */
${S} .re-effort-flare{background:radial-gradient(ellipse at 100% 50%,rgba(255,255,255,.96) 0 4%,rgba(255,196,232,.84) 11%,rgba(255,124,196,.5) 28%,rgba(127,233,255,.2) 49%,transparent 74%) !important}
${S} .re-effort-flare::before{background:linear-gradient(90deg,transparent,rgba(127,233,255,.5),#fff,rgba(255,124,196,.75),transparent) !important;
  box-shadow:0 0 7px #ff7cc4,0 0 13px rgba(127,233,255,.7) !important}
${S} .re-effort-flare::after{background:linear-gradient(180deg,transparent,rgba(200,248,255,.9),transparent) !important;box-shadow:0 0 7px #7fe9ff !important}
/* 旋钮：像素爱弥斯 */
${S} .re-effort-knob-rail{--re-knob-edge:20px !important}
${S} .re-effort-knob,${S} .re-effort.is-chibi .re-effort-knob{
  width:48px !important;height:51px !important;border:0 !important;border-radius:0 !important;box-shadow:none !important;outline:0;
  background:url("${asset('doll-pet.webp')}") 0 100%/288px 44px no-repeat !important;
  transform:translate(-50%,-66%) !important;transition:none !important;
  animation:ae-ps-idle 1.1s steps(6) infinite !important;
  filter:drop-shadow(0 1px 1px rgba(0,0,0,.4)) drop-shadow(0 0 5px rgba(255,124,196,.6)) !important}
@keyframes ae-ps-idle{to{background-position-x:-288px}}
${S} .re-effort.is-dragging .re-effort-knob{
  background-image:url("${asset('pet-run-r.webp')}") !important;background-size:384px 51px !important;background-position:0 100% !important;
  animation:ae-ps-run .6s steps(8) infinite !important;
  filter:drop-shadow(0 1px 1px rgba(0,0,0,.4)) drop-shadow(0 0 8px rgba(127,233,255,.85)) !important}
${S} .re-effort-slider[data-ae-dir="l"] .re-effort-knob{background-image:url("${asset('pet-run-l.webp')}") !important}
@keyframes ae-ps-run{to{background-position-x:-384px}}
${S} .re-effort-slider[data-top] .re-effort-knob{filter:drop-shadow(0 1px 1px rgba(0,0,0,.4)) drop-shadow(0 0 7px rgba(255,124,196,.8)) drop-shadow(0 0 12px rgba(127,233,255,.5)) !important}
${S} .re-effort-input:focus-visible + .re-effort-knob-rail .re-effort-knob{outline:1px dashed #7fe9ff !important;outline-offset:1px}
/* 档位文字与闪电图标：低档青、中档淡紫、高档星辉粉（原版是蓝→紫） */
${S} .dsh-reasoning-effort:is([data-level='off'],[data-level='none']) .dsh-reasoning-effort__header strong{color:#8f8aa6 !important}
${S} .dsh-reasoning-effort:is([data-level='minimal'],[data-level='low']) .dsh-reasoning-effort__header strong{color:#7fe9ff !important}
${S} .dsh-reasoning-effort:is([data-level='medium'],[data-level='high']) .dsh-reasoning-effort__header strong{color:#c9a7ff !important}
${S} .dsh-reasoning-effort:is([data-level='xhigh'],[data-level='max']) .dsh-reasoning-effort__header strong{color:#ff7cc4 !important;text-shadow:0 0 8px rgba(255,124,196,.55),0 0 2px #fff}
${S} .dsh-reasoning-model:is([data-level='minimal'],[data-level='low']) .dsh-reasoning-model__bolt{color:#7fe9ff !important}
${S} .dsh-reasoning-model:is([data-level='medium'],[data-level='high']) .dsh-reasoning-model__bolt{color:#c9a7ff !important}
${S} .dsh-reasoning-model:is([data-level='xhigh'],[data-level='max']) .dsh-reasoning-model__bolt{color:#ff7cc4 !important;filter:drop-shadow(0 0 4px rgba(255,124,196,.8)) drop-shadow(0 0 2px rgba(127,233,255,.6)) !important}
${S} .dsh-reasoning-model:is([data-level='xhigh'],[data-level='max']) .dsh-reasoning-model__effort{color:#ff9bd2 !important}
@media (prefers-reduced-motion:reduce){${S} .re-effort-knob{animation:none !important}}
`;

const CELL = 4;
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

function assetsFor(st, ctx, width, height) {
  const cols = Math.max(1, Math.ceil(width / CELL)), rows = Math.max(1, Math.ceil(height / CELL));
  const a = st.assets;
  if (a && a.cols === cols && a.rows === rows && a.height === height) return a;
  const columns = mk(cols, 1), cells = mk(cols, rows), layer = mk(cols * CELL, rows * CELL);
  const columnsContext = columns.getContext('2d'), cellsContext = cells.getContext('2d'), layerContext = layer.getContext('2d');
  layerContext.imageSmoothingEnabled = false;
  const colTile = mk(CELL, CELL); colTile.getContext('2d').fillRect(CELL - 1, 0, 1, CELL);
  const cellTile = mk(CELL, CELL); const ct = cellTile.getContext('2d'); ct.fillRect(CELL - 1, 0, 1, CELL); ct.fillRect(0, CELL - 1, CELL, 1);
  const streak = mk(32, 1); const sc = streak.getContext('2d');
  const sg = sc.createLinearGradient(0, 0, 32, 0);
  sg.addColorStop(0, 'rgba(127,233,255,0)'); sg.addColorStop(.6, 'rgba(127,233,255,.75)'); sg.addColorStop(.86, 'rgba(255,150,210,.92)'); sg.addColorStop(1, 'rgba(255,255,255,1)');
  sc.fillStyle = sg; sc.fillRect(0, 0, 32, 1);
  const glow = ctx.createRadialGradient(0, height / 2, 0, 0, height / 2, 24);
  glow.addColorStop(0, 'rgba(255,255,255,.85)'); glow.addColorStop(.14, 'rgba(255,186,226,.58)');
  glow.addColorStop(.44, 'rgba(255,124,196,.3)'); glow.addColorStop(.72, 'rgba(127,233,255,.12)'); glow.addColorStop(1, 'rgba(127,233,255,0)');
  st.assets = {
    cols, rows, height, columns, cells, layer, columnsContext, cellsContext, layerContext,
    columnImage: columnsContext.createImageData(cols, 1), cellImage: cellsContext.createImageData(cols, rows),
    columnGap: ctx.createPattern(colTile, 'repeat'), cellGap: layerContext.createPattern(cellTile, 'repeat'), streak, glow,
  };
  return st.assets;
}

// 像素光柱辐射（原算法，配色改为：远处青蓝光柱 → 靠近刃尖转星辉粉，热区粉白）
function drawRadiation(ctx, width, height, time, st) {
  const origin = st.progress * width;
  const speed = st.dragging ? 2.8 : 1;
  ctx.clearRect(0, 0, width, height);
  if (origin <= 0) return;
  const A = assetsFor(st, ctx, width, height);
  const { cols, rows } = A;
  const cd = A.columnImage.data, ed = A.cellImage.data;
  cd.fill(0); ed.fill(0);
  const activeCols = Math.min(cols, Math.ceil(origin / CELL));
  const trailSpan = Math.max(55, width * .72), nearSpan = Math.max(1, width * .78);
  const sA = time * .0074 * speed, sB = time * .0041 * speed - 1.7, sC = time * .0022 * speed - 3.4;
  const pillarShift = time * .0016, grainShift = time * .006;
  for (let col = 0; col < activeCols; col++) {
    const x = col * CELL, delta = x + CELL * .5 - origin, distance = Math.abs(delta);
    const a1 = Math.max(0, Math.sin(distance / 10 - sA)), b1 = Math.max(0, Math.sin(distance / 23 - sB)), c1 = Math.max(0, Math.sin(distance / 40 - sC));
    const crest = Math.pow(a1, 15) + Math.pow(b1, 18) * .78;
    const wave = Math.min(1, Math.pow(a1, 2.6) * .76 + Math.pow(b1, 3.2) * .58 + c1 * c1 * c1 * c1 * .32);
    const trail = .38 + .62 * Math.exp(-distance / trailSpan);
    const pb = Math.max(0, Math.sin(x / 20 + pillarShift));
    const energy = trail * (wave * 1.04 + pb * pb * pb * .27 + crest * .32);
    if (energy > .012) {
      const n = Math.max(0, 1 - distance / nearSpan), o = col * 4;
      cd[o] = 50 + 195 * n * n + 20 * wave;
      cd[o + 1] = 160 - 50 * n + 40 * crest;
      cd[o + 2] = 235 - 30 * n;
      cd[o + 3] = Math.min(.88, energy * .72) * 255;
    }
    const dx = delta / 38, eb = energy * .88 + crest * .19;
    for (let row = 0; row < rows; row++) {
      const y = row * CELL, dY = y + CELL * .5 - height * .5, dy = dY / 11;
      const radial = Math.sqrt(dx * dx + dy * dy);
      const halo = Math.exp(-radial * .96) * 1.08;
      const vs = .58 + .42 * Math.cos(dY / height * Math.PI);
      const grain = .72 + .28 * Math.sin(x * .73 + y * 1.31 + grainShift);
      const alpha = Math.min(.96, (eb + halo) * vs * grain);
      if (alpha < .035) continue;
      const hot = Math.max(0, 1 - radial / 2.4), o = (row * cols + col) * 4;
      // 冷端青蓝 (70,190,255) → 中段星辉粉 (255,130,205) → 刃心白
      const t1 = Math.min(1, hot * 1.7), t2 = Math.max(0, hot * 2 - 1);
      ed[o] = 70 + 185 * t1 + 30 * crest;
      ed[o + 1] = 190 - 60 * t1 + 125 * t2 + 30 * crest;
      ed[o + 2] = 255 - 50 * t1 + 50 * t2;
      ed[o + 3] = alpha * 255;
    }
  }
  const lw = cols * CELL, lh = rows * CELL;
  A.columnsContext.putImageData(A.columnImage, 0, 0);
  A.cellsContext.putImageData(A.cellImage, 0, 0);
  const lc = A.layerContext;
  lc.clearRect(0, 0, lw, lh);
  lc.drawImage(A.cells, 0, 0, cols, rows, 0, 0, lw, lh);
  lc.globalCompositeOperation = 'destination-out'; lc.fillStyle = A.cellGap; lc.fillRect(0, 0, lw, lh); lc.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, origin, height); ctx.clip();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(A.columns, 0, 0, cols, 1, 0, 0, lw, height);
  ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = A.columnGap; ctx.fillRect(0, 0, lw, height);
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(A.layer, 0, 0);
  ctx.imageSmoothingEnabled = true;
  const ps = st.dragging ? .16 : .065, loop = Math.max(30, origin + 64), pr = Math.max(7, height - 6);
  for (let i = 0; i < 14; i++) {
    const px = origin - (time * ps * (.78 + i % 5 * .09) + i * 23) % loop;
    if (px < -24 || px > width + 16) continue;
    const py = 3 + (i * 13 + Math.sin(time * .003 + i) * 5) % pr;
    ctx.globalAlpha = Math.min(1, .54 + i % 5 * .1);
    ctx.drawImage(A.streak, px, py, 4 + i % 4 * 4 + (st.dragging ? 6 : 0), i % 3 === 0 ? 2 : 1);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.translate(origin, 0); ctx.fillStyle = A.glow; ctx.fillRect(-26, 0, 52, height);
  ctx.restore();
}

// 像素星屑：从光柱里浮起、闪一下就灭；换档时刃尖炸开一小团
const COLS = [[255, 124, 196], [127, 233, 255], [255, 255, 255], [215, 139, 255], [255, 200, 235]];
function spawn(st, origin, height, burst) {
  const near = burst || Math.random() < .55;
  const ang = Math.random() * Math.PI * 2, sp = .5 + Math.random() * 1.6;
  st.parts.push({
    x: near ? origin - Math.random() * 14 : Math.random() * origin,
    y: 4 + Math.random() * (height - 8),
    vx: burst ? Math.cos(ang) * sp : -(.1 + Math.random() * (st.dragging ? 1.1 : .35)),
    vy: burst ? Math.sin(ang) * sp * .6 : -(.05 + Math.random() * .25),
    life: 0, max: (burst ? 16 : 22) + Math.random() * 30,
    col: COLS[Math.floor(Math.random() * COLS.length)], star: Math.random() < (burst ? .5 : .28),
  });
}
function drawSparkles(ctx, origin, height, dt, st) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const keep = [];
  for (const p of st.parts) {
    p.life += dt; if (p.life > p.max) continue;
    p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .985;
    const a = Math.sin(Math.PI * p.life / p.max);
    const X = Math.round(p.x / 2) * 2, Y = Math.round(p.y / 2) * 2;
    ctx.fillStyle = `rgba(${p.col[0]},${p.col[1]},${p.col[2]},${(a * .95).toFixed(3)})`;
    ctx.fillRect(X, Y, 2, 2);
    if (p.star && a > .4) {
      ctx.globalAlpha = a * .6;
      ctx.fillRect(X - 2, Y, 2, 2); ctx.fillRect(X + 2, Y, 2, 2); ctx.fillRect(X, Y - 2, 2, 2); ctx.fillRect(X, Y + 2, 2, 2);
      ctx.globalAlpha = 1;
    }
    keep.push(p);
  }
  st.parts = keep.length > 120 ? keep.slice(-120) : keep;
  ctx.restore();
}

function install() {
  let style = null, raf = 0, mo = null, last = 0;
  const sliders = new Map();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  const progressOf = (el) => {
    const n = parseFloat(el.style.getPropertyValue('--re-progress') || getComputedStyle(el).getPropertyValue('--re-progress'));
    return isFinite(n) ? Math.max(0, Math.min(100, n)) / 100 : .5;
  };
  const attach = (el) => {
    if (sliders.has(el)) return;
    const fx = el.querySelector('.re-effort-fx'); if (!fx) return;
    const cv = document.createElement('canvas'); cv.className = 'ae-ps-canvas'; cv.setAttribute('aria-hidden', 'true');
    fx.insertBefore(cv, fx.firstChild);
    sliders.set(el, { cv, ctx: cv.getContext('2d'), parts: [], w: 0, h: 0, prev: -1, drawn: 0, progress: .5, dragging: false, assets: null });
  };
  const detach = (el, s) => { s.cv.remove(); el.removeAttribute('data-ae-dir'); sliders.delete(el); };
  const scan = () => {
    for (const el of document.querySelectorAll('.re-effort-slider')) attach(el);
    for (const [el, s] of sliders) if (!el.isConnected) detach(el, s);
    if (sliders.size && !raf) raf = requestAnimationFrame(tick);
  };

  const tick = (t) => {
    raf = 0;
    if (!sliders.size) return;
    const dt = Math.min(3, (t - (last || t)) / 16.7 || 1); last = t;
    for (const [el, s] of sliders) {
      const r = el.getBoundingClientRect();
      if (!r.width || r.bottom < 0 || r.top > innerHeight) continue;
      const dragging = !!el.closest('.re-effort.is-dragging');
      if (!dragging && t - s.drawn < 33) continue;
      const step = Math.min(3, (t - (s.drawn || t)) / 16.7 || 1);
      s.drawn = t;
      const ratio = Math.min(devicePixelRatio || 1, 2), W = r.width, H = r.height;
      const pw = Math.round(W * ratio), ph = Math.round(H * ratio);
      if (s.cv.width !== pw || s.cv.height !== ph) { s.cv.width = pw; s.cv.height = ph; }
      s.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const p = progressOf(el);
      if (dragging && s.prev >= 0 && Math.abs(p - s.prev) > .001) el.setAttribute('data-ae-dir', p < s.prev ? 'l' : 'r');
      if (!dragging) el.removeAttribute('data-ae-dir');
      if (!dragging && s.prev >= 0 && Math.abs(p - s.prev) > .02) for (let i = 0; i < 16; i++) spawn(s, p * W, H, true);
      s.prev = p; s.progress = p; s.dragging = dragging;
      const rate = (dragging ? 1.6 : el.hasAttribute('data-top') ? .7 : .4) * step;
      for (let i = 0; i < 6 && (i < Math.floor(rate) || Math.random() < rate - i); i++) spawn(s, p * W, H, false);
      drawRadiation(s.ctx, W, H, t, s);
      drawSparkles(s.ctx, p * W, H, step, s);
    }
    if (sliders.size && !reduced.matches) raf = requestAnimationFrame(tick);
  };

  const apply = (prefs) => {
    const on = prefs.polestarSlider !== false;
    const root = document.documentElement;
    if (on) {
      root.setAttribute('data-ae-polestar', '');
      if (!style) { style = document.createElement('style'); style.setAttribute('data-plugin-css', 'dsh-aemeath-theme/polestar.css'); style.textContent = css(); document.head.appendChild(style); }
      if (!mo) { let q = 0; mo = new MutationObserver(() => { if (!q) q = requestAnimationFrame(() => { q = 0; scan(); }); }); mo.observe(document.body, { childList: true, subtree: true }); }
      scan();
    } else {
      root.removeAttribute('data-ae-polestar');
      if (style) { style.remove(); style = null; }
      if (mo) { mo.disconnect(); mo = null; }
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      for (const [el, s] of sliders) detach(el, s);
    }
  };
  apply(store.get());
  const unsub = store.subscribe(apply);
  return () => { unsub(); apply({ polestarSlider: false }); };
}

module.exports = { install };
