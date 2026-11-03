"use strict";
// Pixel Aemeath companion. Sprite sheet: 8 cols x 9 rows, cell 96x104
// (pet-half.webp, from aemeath-mini-codex-pet, MIT). Rows:
// 0 idle(6) 1 run-right(8) 2 run-left(8) 3 waving(4) 4 jumping(5)
// 5 failed(8) 6 waiting(6) 7 work(6) 8 review(6).
// Behaviour: follows the agent (idle / work / waiting + bursts on start,
// done, error), can be dragged anywhere (position persists), tap = jump +
// line, double tap = review face, long press = theme panel, wanders a little
// when idle and dozes off after a minute without anything happening.
const store = require('./store.js');
const quotes = require('./quotes.js');
const { asset } = require('./assets.js');

const CW = 96, CH = 104;
const ROWS = {
  idle: { row: 0, frames: 6, fps: 6 },
  right: { row: 1, frames: 8, fps: 10 },
  left: { row: 2, frames: 8, fps: 10 },
  wave: { row: 3, frames: 4, fps: 3 },
  jump: { row: 4, frames: 5, fps: 9 },
  failed: { row: 5, frames: 8, fps: 8 },
  waiting: { row: 6, frames: 6, fps: 5 },
  work: { row: 7, frames: 6, fps: 8 },
  review: { row: 8, frames: 6, fps: 7 },
};
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const CSS = `
#aemeath-pet{position:fixed;left:0;top:0;z-index:45;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;cursor:grab;will-change:transform}
#aemeath-pet[hidden]{display:none}
#aemeath-pet .ae-pet-sprite{width:var(--w);height:var(--h);background-image:var(--sheet);background-repeat:no-repeat;background-size:calc(var(--w) * 8) calc(var(--h) * 9);filter:drop-shadow(0 2px 0 rgba(13,9,27,.6)) drop-shadow(0 0 6px rgba(255,105,183,.35))}
#aemeath-pet[data-dragging] {cursor:grabbing}
#aemeath-pet[data-dragging] .ae-pet-sprite{transform:rotate(-6deg) scale(1.04)}
#aemeath-pet .ae-pet-shadow{position:absolute;left:50%;bottom:2px;width:46%;height:6px;transform:translateX(-50%);background:rgba(13,9,27,.45);border-radius:50%;filter:blur(1px);z-index:-1}
#aemeath-pet .ae-pet-bubble{position:absolute;bottom:calc(100% - 4px);left:50%;transform:translateX(-50%);max-width:210px;width:max-content;padding:4px 9px 5px;font:20px/1.1 var(--ae-font-px,"AemeathPixel",monospace);color:#3a0f2a;background:#fff4fa;border:2px solid #ff69b7;box-shadow:2px 2px 0 #0d091b,0 0 10px rgba(255,105,183,.4);pointer-events:none;opacity:0;transition:opacity .15s steps(2);white-space:normal;text-align:center}
#aemeath-pet .ae-pet-bubble::after{content:"";position:absolute;left:calc(50% - 4px);top:100%;width:8px;height:6px;background:#ff69b7;clip-path:polygon(0 0,100% 0,50% 100%)}
#aemeath-pet .ae-pet-bubble[data-show]{opacity:1}
#aemeath-pet[data-edge-left] .ae-pet-bubble{left:0;transform:none}
#aemeath-pet[data-edge-right] .ae-pet-bubble{left:auto;right:0;transform:none}
#aemeath-pet .ae-pet-zzz{position:absolute;right:4px;top:6px;font:20px var(--ae-font-px,monospace);color:#77e8ff;text-shadow:1px 1px 0 #0d091b;animation:ae-zzz 2s steps(4) infinite;pointer-events:none}
@keyframes ae-zzz{0%{transform:translate(0,0);opacity:0}30%{opacity:1}100%{transform:translate(8px,-14px);opacity:0}}
@media (prefers-reduced-motion:reduce){#aemeath-pet .ae-pet-zzz{animation:none}}
`;

class Pet {
  constructor(opts) {
    this.opts = opts; // { onLongPress, onTap, onDragStart }
    this.base = 'idle';
    this.anim = 'idle';
    this.burstUntil = 0;
    this.frame = 0;
    this.lastTick = 0;
    this.lastActivity = Date.now();
    this.sleeping = false;
    this.walk = null;
    this.raf = 0;
    this.bubbleTimer = 0;
    this.x = 0; this.y = 0;
  }

  mount() {
    const style = document.createElement('style');
    style.dataset.plugin = 'dsh-aemeath-theme';
    style.dataset.pluginCss = 'dsh-aemeath-theme/pet.css';
    style.textContent = CSS;
    document.head.appendChild(style);
    const el = document.createElement('div');
    el.id = 'aemeath-pet';
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', '爱弥斯');
    el.innerHTML = '<div class="ae-pet-bubble"></div><div class="ae-pet-shadow"></div><div class="ae-pet-sprite"></div>';
    document.body.appendChild(el);
    this.el = el; this.style = style;
    this.sprite = el.querySelector('.ae-pet-sprite');
    this.bubble = el.querySelector('.ae-pet-bubble');
    this.sprite.style.setProperty('--sheet', `url("${asset('pet-half.webp')}")`);
    this.bindPointer();
    this.applyPrefs(store.get());
    this.offStore = store.subscribe((p) => this.applyPrefs(p));
    this.onResize = () => this.place(this.x, this.y, false);
    window.addEventListener('resize', this.onResize);
    const loop = (t) => { this.tick(t); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
    setTimeout(() => this.say(pick(quotes.greet), 3200), 900);
    return () => this.unmount();
  }

  unmount() {
    cancelAnimationFrame(this.raf);
    clearTimeout(this.bubbleTimer);
    window.removeEventListener('resize', this.onResize);
    if (this.offStore) this.offStore();
    if (this.el) this.el.remove();
    if (this.style) this.style.remove();
  }

  size() {
    const s = Math.max(0.5, Math.min(1.6, Number(store.get().petScale) || 0.9));
    return { w: Math.round(CW * s), h: Math.round(CH * s) };
  }

  applyPrefs(p) {
    if (!this.el) return;
    this.el.hidden = !p.pet;
    const { w, h } = this.size();
    this.sprite.style.setProperty('--w', w + 'px');
    this.sprite.style.setProperty('--h', h + 'px');
    this.sprite.style.imageRendering = w >= CW ? 'pixelated' : 'auto';
    if (this.dragging) return;
    const pos = p.petPos;
    if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y)) this.place(pos.x * innerWidth, pos.y * innerHeight, false);
    else this.perch();
  }

  /** Default seat: perched on the top edge of the composer card (left side). */
  perch() {
    const { w, h } = this.size();
    const card = document.querySelector('[data-composer-card]');
    const r = card && card.getBoundingClientRect();
    // Sit on whatever stacks above the card (task list, plan bar) so the pet never covers their controls.
    let top = r ? r.top : 0;
    const seat = card && card.closest('[data-composer-seat]');
    if (seat) for (const el of seat.querySelectorAll('[data-slot="conversation.composer.dock"] > *, [class*="_composerStack"] > *')) {
      const b = el.getBoundingClientRect();
      if (b.height > 0 && b.bottom <= (r ? r.top + 2 : innerHeight) && b.top < top) top = b.top;
    }
    if (r && r.width > 0 && top > h + 20) this.place(Math.max(r.left + 8, r.right - w - 64), top - h + 10, false);
    else this.place(12, innerHeight - h - 170, false);
  }

  place(x, y, save) {
    const { w, h } = this.size();
    this.x = Math.max(0, Math.min(innerWidth - w, x));
    this.y = Math.max(0, Math.min(innerHeight - h, y));
    this.el.style.transform = `translate3d(${Math.round(this.x)}px,${Math.round(this.y)}px,0)`;
    this.el.toggleAttribute('data-edge-left', this.x < 70);
    this.el.toggleAttribute('data-edge-right', this.x > innerWidth - w - 70);
    if (save) store.set({ petPos: { x: this.x / innerWidth, y: this.y / innerHeight } });
  }

  // ---------- animation ----------
  setBase(base) {
    if (this.base === base) return;
    this.base = base;
    this.wake();
  }

  burst(anim, ms, line) {
    this.anim = anim;
    this.frame = 0;
    this.burstUntil = performance.now() + ms;
    this.walk = null;
    this.wake();
    if (line) this.say(line);
  }

  wake() {
    this.lastActivity = Date.now();
    if (this.sleeping) { this.sleeping = false; const z = this.el.querySelector('.ae-pet-zzz'); if (z) z.remove(); }
  }

  currentAnim(now) {
    if (this.dragging) return this.dragDir < 0 ? 'left' : 'right';
    if (now < this.burstUntil) return this.anim;
    if (this.walk) return this.walk.dir < 0 ? 'left' : 'right';
    if (this.base === 'work') return 'work';
    if (this.base === 'waiting') return 'waiting';
    if (this.sleeping) return 'wave';
    return 'idle';
  }

  tick(now) {
    if (!this.el || this.el.hidden) return;
    const anim = this.currentAnim(now);
    const spec = ROWS[anim];
    if (anim !== this.lastAnim) { this.frame = 0; this.lastAnim = anim; }
    if (now - this.lastTick >= 1000 / spec.fps) {
      this.lastTick = now;
      this.frame = (this.frame + 1) % spec.frames;
      const { w, h } = this.size();
      this.sprite.style.backgroundPosition = `${-this.frame * w}px ${-spec.row * h}px`;
    }
    // keep the default seat glued to the composer (it moves with the keyboard)
    if (!store.get().petPos && !this.dragging && !this.walk && now - (this.lastPerch || 0) > 700) { this.lastPerch = now; this.perch(); }
    // idle life: doze off, wander
    if (this.base === 'idle' && !this.dragging && now >= this.burstUntil) {
      const idleMs = Date.now() - this.lastActivity;
      if (!this.sleeping && idleMs > 60000) {
        this.sleeping = true; this.walk = null;
        const z = document.createElement('span'); z.className = 'ae-pet-zzz'; z.textContent = 'z';
        this.el.appendChild(z);
      }
      if (store.get().petPos && !this.sleeping && !this.walk && Math.random() < 0.0012) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        this.walk = { dir, left: 40 + Math.random() * 70 };
      }
      if (this.walk) {
        const step = 0.9 * this.walk.dir;
        const before = this.x;
        this.place(this.x + step, this.y, false);
        this.walk.left -= Math.abs(step);
        if (this.walk.left <= 0 || this.x === before) { this.walk = null; if (store.get().petPos) this.place(this.x, this.y, true); }
      }
    }
  }

  say(text, ms = 2600) {
    if (!text || !store.get().petBubbles || !this.bubble) return;
    this.bubble.textContent = text;
    this.bubble.setAttribute('data-show', '');
    clearTimeout(this.bubbleTimer);
    this.bubbleTimer = setTimeout(() => this.bubble.removeAttribute('data-show'), ms);
  }

  // ---------- input ----------
  bindPointer() {
    const el = this.el;
    let start = null, moved = false, pressTimer = 0, lastTap = 0, lastX = 0;
    const down = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      el.setPointerCapture?.(e.pointerId);
      start = { px: e.clientX, py: e.clientY, x: this.x, y: this.y };
      moved = false; lastX = e.clientX;
      this.wake();
      clearTimeout(pressTimer);
      pressTimer = setTimeout(() => {
        if (!moved && start) { start = null; this.opts.onLongPress?.(); }
      }, 600);
    };
    const move = (e) => {
      if (!start) return;
      const dx = e.clientX - start.px, dy = e.clientY - start.py;
      if (!moved && Math.hypot(dx, dy) < 6) return;
      if (!moved) { moved = true; clearTimeout(pressTimer); this.opts.onDragStart?.(); this.dragging = true; el.setAttribute('data-dragging', ''); this.walk = null; this.say(pick(quotes.drag), 1200); }
      this.dragDir = e.clientX - lastX < 0 ? -1 : (e.clientX - lastX > 0 ? 1 : this.dragDir || 1);
      lastX = e.clientX;
      this.place(start.x + dx, start.y + dy, false);
      e.preventDefault();
    };
    const up = () => {
      clearTimeout(pressTimer);
      if (!start) return;
      const wasDrag = moved;
      start = null;
      if (wasDrag) {
        this.dragging = false; el.removeAttribute('data-dragging');
        this.place(this.x, this.y, true);
        this.burst('jump', 560);
        return;
      }
      const now = Date.now();
      if (now - lastTap < 320) { lastTap = 0; this.opts.onTap?.(false); this.burst('review', 1600, '盯——'); return; }
      lastTap = now;
      const opened = this.opts.onTap?.(true);
      if (opened) this.bubble?.removeAttribute('data-show');
      this.burst('jump', 620, opened ? null : pick(quotes.tap));
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }
}

/** Follow the agent: running -> work, error -> failed burst, done -> jump. */
function wireAgent(ctx, pet) {
  let sessions;
  try { sessions = ctx.get('sessions'); } catch { sessions = null; }
  if (!sessions) return () => {};
  let last = null, watchedId, unwatch = () => {};
  const runningId = (list) => {
    for (const id of list?.ids ?? []) if (list.byId?.[id]?.running === true) return id;
    return undefined;
  };
  const read = () => {
    let list;
    try { list = sessions.list?.getSnapshot?.(); } catch { list = undefined; }
    const rid = runningId(list);
    if (rid !== undefined) watchedId = rid;
    let snap;
    try { snap = watchedId === undefined ? undefined : sessions.binding(watchedId)?.session.getSnapshot(); } catch { snap = undefined; }
    const pending = snap && (Array.isArray(snap.pendingQuestions) ? snap.pendingQuestions.length : 0) + (Array.isArray(snap.pendingApprovals) ? snap.pendingApprovals.length : 0);
    return { running: rid !== undefined || snap?.running === true, error: snap?.lastAgentError ?? null, pending: pending || 0 };
  };
  const rewatch = () => {
    if (watchedId === undefined) return;
    const b = sessions.binding?.(watchedId);
    if (!b) return;
    unwatch();
    unwatch = b.session.subscribe(() => sync());
  };
  let watchedNow;
  const sync = () => {
    if (!store.get().petFollowAgent) { pet.setBase('idle'); return; }
    const f = read();
    if (watchedId !== watchedNow) { watchedNow = watchedId; rewatch(); }
    if (last) {
      const errMsg = (e) => (e && typeof e === 'object' ? e.message || JSON.stringify(e) : e);
      if (f.error && errMsg(f.error) !== errMsg(last.error)) pet.burst('failed', 2400, pick(quotes.error));
      else if (!last.running && f.running) pet.burst('jump', 700, pick(quotes.work));
      else if (last.running && !f.running) pet.burst('jump', 900, pick(quotes.done));
    }
    pet.setBase(f.running ? 'work' : f.pending > 0 ? 'waiting' : 'idle');
    last = f;
  };
  let offList = () => {};
  if (sessions.list?.subscribe) offList = sessions.list.subscribe(sync);
  else {
    const id = setInterval(sync, 1500);
    offList = () => clearInterval(id);
  }
  sync();
  const offStore = store.subscribe(sync);
  return () => { offList(); offStore(); unwatch(); };
}

function install(ctx, opts) {
  const pet = new Pet(opts || {});
  pet.rect = () => (pet.el && !pet.el.hidden ? pet.sprite.getBoundingClientRect() : null);
  const off = pet.mount();
  const offAgent = wireAgent(ctx, pet);
  install.pet = pet;
  return () => { offAgent(); off(); install.pet = null; };
}

module.exports = { install };
