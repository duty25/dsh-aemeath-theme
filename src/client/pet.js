"use strict";
// Pixel Aemeath companion. Two sprite sheets, both 8 cols with 96x104 cells:
//   pet-half.webp  (aemeath-mini-codex-pet, MIT) rows:
//     0 idle(6) 1 run-right(8) 2 run-left(8) 3 eyes-closed(4) 4 jump(5)
//     5 failed(8) 6 waiting(6) 7 work(6) 8 review(6)
//   pet-extra.webp (rebuilt from the same original GIFs by
//     scripts/gen-pet-extra.sh, aligned to pet-half) rows:
//     0 giggle(7) 1 doze(8) 2 shy(8) 3 cheer(8)
// Behaviour: follows the agent (idle / work / waiting + bursts on start,
// done, error); idle life with a weighted repertoire of little acts
// (stretch, sing, stargaze, look around, giggle, cheer, yawn, stroll),
// greets by time of day, dozes off and wakes up when touched. Input: tap =
// quick menu + reaction, rapid taps = poke -> dizzy, double tap = stare,
// rubbing over her head = pat, drag anywhere, long press = theme panel,
// mouse hover = notices you. A small affection counter grows with pats.
const store = require('./store.js');
const quotes = require('./quotes.js');
const { asset } = require('./assets.js');

const CW = 96, CH = 104;
const ANIMS = {
  idle: { sheet: 0, row: 0, frames: 6, fps: 6 },
  right: { sheet: 0, row: 1, frames: 8, fps: 10 },
  left: { sheet: 0, row: 2, frames: 8, fps: 10 },
  calm: { sheet: 0, row: 3, frames: 4, fps: 3 },
  jump: { sheet: 0, row: 4, frames: 5, fps: 9 },
  failed: { sheet: 0, row: 5, frames: 8, fps: 8 },
  waiting: { sheet: 0, row: 6, frames: 6, fps: 5 },
  work: { sheet: 0, row: 7, frames: 6, fps: 8 },
  review: { sheet: 0, row: 8, frames: 6, fps: 7 },
  lookR: { sheet: 0, row: 1, frames: 1, fps: 2 },
  lookL: { sheet: 0, row: 2, frames: 1, fps: 2 },
  giggle: { sheet: 1, row: 0, frames: 7, fps: 8 },
  doze: { sheet: 1, row: 1, frames: 8, fps: 3, seq: [0, 1, 2, 3, 4, 3, 2, 1] },
  shy: { sheet: 1, row: 2, frames: 8, fps: 8 },
  cheer: { sheet: 1, row: 3, frames: 8, fps: 10 },
};
const SHEETS = ['pet-half.webp', 'pet-extra.webp'];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const AFFECTION_KEY = 'dsh-aemeath-theme:affection';
const readAffection = () => { try { return Number(localStorage.getItem(AFFECTION_KEY)) || 0; } catch { return 0; } };
const writeAffection = (n) => { try { localStorage.setItem(AFFECTION_KEY, String(n)); } catch { /* private mode */ } };

const CSS = `
#aemeath-pet{position:fixed;left:0;top:0;z-index:45;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;cursor:grab;will-change:transform}
#aemeath-pet[hidden]{display:none}
#aemeath-pet .ae-pet-body{position:relative;transform-origin:50% 100%}
#aemeath-pet .ae-pet-sprite{width:var(--w);height:var(--h);background-image:var(--sheet);background-repeat:no-repeat;background-size:calc(var(--w) * 8) calc(var(--h) * var(--rows,9));filter:drop-shadow(0 2px 0 rgba(13,9,27,.6)) drop-shadow(0 0 6px rgba(255,105,183,.35))}
#aemeath-pet[data-dragging]{cursor:grabbing}
#aemeath-pet[data-dragging] .ae-pet-body{transform:rotate(-6deg) scale(1.04)}
#aemeath-pet[data-fx="squish"] .ae-pet-body{animation:ae-pet-squish .32s steps(4)}
#aemeath-pet[data-fx="wobble"] .ae-pet-body{animation:ae-pet-wobble .5s steps(6)}
#aemeath-pet[data-fx="dizzy"] .ae-pet-body{animation:ae-pet-dizzy 1.2s steps(12) 2}
#aemeath-pet[data-fx="bob"] .ae-pet-body{animation:ae-pet-bob .5s steps(4) infinite}
#aemeath-pet[data-fx="stretch"] .ae-pet-body{animation:ae-pet-stretch 1.6s steps(8)}
#aemeath-pet[data-fx="startle"] .ae-pet-body{animation:ae-pet-startle .45s steps(5)}
@keyframes ae-pet-squish{0%{transform:scale(1,1)}35%{transform:scale(1.12,.86)}70%{transform:scale(.95,1.06)}100%{transform:scale(1,1)}}
@keyframes ae-pet-wobble{0%,100%{transform:rotate(0)}25%{transform:rotate(-5deg)}75%{transform:rotate(5deg)}}
@keyframes ae-pet-dizzy{0%,100%{transform:rotate(0) translateX(0)}25%{transform:rotate(-8deg) translateX(-3px)}75%{transform:rotate(8deg) translateX(3px)}}
@keyframes ae-pet-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes ae-pet-stretch{0%,100%{transform:scale(1,1)}30%,60%{transform:scale(.94,1.1)}75%{transform:scale(1.06,.94)}}
@keyframes ae-pet-startle{0%,100%{transform:translateY(0)}40%{transform:translateY(-10px) scale(1.04)}}
#aemeath-pet .ae-pet-shadow{position:absolute;left:50%;bottom:2px;width:46%;height:6px;transform:translateX(-50%);background:rgba(13,9,27,.45);border-radius:50%;filter:blur(1px);z-index:-1}
#aemeath-pet .ae-pet-bubble{position:absolute;bottom:calc(100% - 4px);left:50%;transform:translateX(-50%);max-width:210px;width:max-content;padding:4px 9px 5px;font:20px/1.1 var(--ae-font-px,"AemeathPixel",monospace);color:#3a0f2a;background:#fff4fa;border:2px solid #ff69b7;box-shadow:2px 2px 0 #0d091b,0 0 10px rgba(255,105,183,.4);pointer-events:none;opacity:0;transition:opacity .15s steps(2);white-space:normal;text-align:center;z-index:2}
#aemeath-pet .ae-pet-bubble::after{content:"";position:absolute;left:calc(50% - 4px);top:100%;width:8px;height:6px;background:#ff69b7;clip-path:polygon(0 0,100% 0,50% 100%)}
#aemeath-pet .ae-pet-bubble[data-show]{opacity:1}
#aemeath-pet[data-edge-left] .ae-pet-bubble{left:0;transform:none}
#aemeath-pet[data-edge-right] .ae-pet-bubble{left:auto;right:0;transform:none}
#aemeath-pet .ae-pet-zzz{position:absolute;right:4px;top:6px;font:20px var(--ae-font-px,monospace);color:#77e8ff;text-shadow:1px 1px 0 #0d091b;animation:ae-zzz 2s steps(4) infinite;pointer-events:none}
#aemeath-pet .ae-pet-zzz:nth-of-type(2){animation-delay:1s;font-size:14px;right:14px;top:14px}
@keyframes ae-zzz{0%{transform:translate(0,0);opacity:0}30%{opacity:1}100%{transform:translate(8px,-14px);opacity:0}}
#aemeath-pet .ae-pet-fx{position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;z-index:1}
#aemeath-pet .ae-p{position:absolute;left:0;top:0;width:var(--s,12px);height:var(--s,12px);margin:calc(var(--s,12px) / -2) 0 0 calc(var(--s,12px) / -2);background:currentColor;-webkit-mask:var(--m) center/contain no-repeat;mask:var(--m) center/contain no-repeat;animation:ae-p-float var(--d,1.1s) steps(var(--st,8)) forwards;opacity:0}
#aemeath-pet .ae-p[data-k="note"]{-webkit-mask:none;mask:none;background:none;width:auto;height:auto;margin:0;font:18px/1 var(--ae-font-px,monospace);text-shadow:1px 1px 0 #0d091b}
#aemeath-pet .ae-p[data-k="star"]{background:var(--star) center/contain no-repeat;-webkit-mask:none;mask:none;image-rendering:pixelated}
@keyframes ae-p-float{0%{opacity:0;transform:translate(0,0) scale(.6)}15%{opacity:1}100%{opacity:0;transform:translate(var(--dx,0),var(--dy,-36px)) scale(1)}}
#aemeath-pet .ae-pet-orbit{position:absolute;left:50%;top:18%;width:0;height:0;pointer-events:none}
#aemeath-pet .ae-pet-orbit i{position:absolute;left:-6px;top:-6px;width:12px;height:12px;background:var(--star) center/contain no-repeat;image-rendering:pixelated;animation:ae-orbit 1.2s steps(12) infinite}
#aemeath-pet .ae-pet-orbit i:nth-child(2){animation-delay:-.4s}
#aemeath-pet .ae-pet-orbit i:nth-child(3){animation-delay:-.8s}
@keyframes ae-orbit{0%{transform:translate(0,-6px) translate(22px,0)}25%{transform:translate(0,-6px) translate(0,5px)}50%{transform:translate(0,-6px) translate(-22px,0)}75%{transform:translate(0,-6px) translate(0,-5px)}100%{transform:translate(0,-6px) translate(22px,0)}}
@media (prefers-reduced-motion:reduce){#aemeath-pet .ae-pet-zzz,#aemeath-pet .ae-p,#aemeath-pet .ae-pet-orbit i,#aemeath-pet[data-fx] .ae-pet-body{animation:none}#aemeath-pet .ae-p{opacity:0}}
`;

const IDLE_ACTS = [
  { id: 'stretch', w: 3 }, { id: 'sing', w: 3 }, { id: 'stars', w: 2 }, { id: 'look', w: 2 },
  { id: 'giggle', w: 2 }, { id: 'cheer', w: 2 }, { id: 'yawn', w: 2 }, { id: 'stroll', w: 3 },
];

class Pet {
  constructor(opts) {
    this.opts = opts; // { onLongPress, onTap, onDragStart }
    this.base = 'idle';
    this.anim = 'idle';
    this.burstUntil = 0;
    this.frame = 0;
    this.lastTick = 0;
    this.lastActivity = Date.now();
    this.nextIdleAct = Date.now() + 9000 + Math.random() * 8000;
    this.sleeping = false;
    this.walk = null;
    this.raf = 0;
    this.bubbleTimer = 0;
    this.fxTimer = 0;
    this.taps = [];
    this.affection = readAffection();
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
    el.innerHTML = '<div class="ae-pet-bubble"></div><div class="ae-pet-shadow"></div><div class="ae-pet-body"><div class="ae-pet-sprite"></div></div><div class="ae-pet-fx"></div>';
    document.body.appendChild(el);
    this.el = el; this.style = style;
    this.body = el.querySelector('.ae-pet-body');
    this.sprite = el.querySelector('.ae-pet-sprite');
    this.bubble = el.querySelector('.ae-pet-bubble');
    this.fxLayer = el.querySelector('.ae-pet-fx');
    el.style.setProperty('--star', `url("${asset('polestar-tag.png')}")`);
    this.sheetUrls = SHEETS.map((n) => `url("${asset(n)}")`);
    // warm the second sheet so the first idle act does not flash empty
    const img = new Image(); img.src = asset(SHEETS[1]);
    this.sheet = -1;
    this.bindPointer();
    this.applyPrefs(store.get());
    this.offStore = store.subscribe((p) => this.applyPrefs(p));
    this.onResize = () => this.place(this.x, this.y, false);
    window.addEventListener('resize', this.onResize);
    const loop = (t) => { this.tick(t); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
    setTimeout(() => this.greet(), 900);
    return () => this.unmount();
  }

  unmount() {
    cancelAnimationFrame(this.raf);
    clearTimeout(this.bubbleTimer);
    clearTimeout(this.fxTimer);
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
    this.lastTick = 0;
    if (this.dragging) return;
    const pos = p.petPos;
    if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y)) this.place(pos.x * innerWidth, pos.y * innerHeight, false);
    else this.perch();
  }

  /** Default seat: perched on the top edge of the composer card (right side). */
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
    this.wake(false);
  }

  burst(anim, ms, line) {
    this.anim = anim;
    this.frame = 0;
    this.lastAnim = null;
    this.burstUntil = performance.now() + ms;
    this.walk = null;
    this.wake(false);
    if (line) this.say(line);
  }

  /** Body tween on top of the sprite (squish, wobble, dizzy...). */
  fx(name, ms) {
    if (!this.el) return;
    clearTimeout(this.fxTimer);
    this.el.removeAttribute('data-fx');
    void this.body.offsetWidth; // restart the animation when the same fx repeats
    this.el.setAttribute('data-fx', name);
    if (ms) this.fxTimer = setTimeout(() => this.el?.removeAttribute('data-fx'), ms);
  }

  /** Small pixel particles rising from the pet. kind: heart | star | note | spark. */
  emit(kind, n = 5, opts = {}) {
    if (!this.fxLayer || reduced()) return;
    const { w, h } = this.size();
    const colors = { heart: ['#ff69b7', '#ffb3da'], spark: ['#77e8ff', '#ffffff', '#ffd27a'], note: ['#ff69b7', '#77e8ff', '#c9b6ff'], star: ['#fff'] };
    const masks = { heart: 'heart', spark: 'sparkle' };
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      p.className = 'ae-p';
      p.dataset.k = kind;
      const cx = (opts.x ?? w / 2) + (Math.random() - 0.5) * (opts.spread ?? w * 0.6);
      const cy = (opts.y ?? h * 0.3) + (Math.random() - 0.5) * 10;
      p.style.left = `${cx}px`;
      p.style.top = `${cy}px`;
      p.style.color = pick(colors[kind] || colors.spark);
      p.style.setProperty('--s', `${kind === 'star' ? 12 : 10 + Math.round(Math.random() * 6)}px`);
      p.style.setProperty('--dx', `${Math.round((Math.random() - 0.5) * 40)}px`);
      p.style.setProperty('--dy', `${-24 - Math.round(Math.random() * 30)}px`);
      p.style.setProperty('--d', `${0.9 + Math.random() * 0.6}s`);
      p.style.animationDelay = `${i * (opts.stagger ?? 0.08)}s`;
      if (kind === 'note') p.textContent = pick(['♪', '♫']);
      else if (masks[kind]) p.style.setProperty('--m', ICON_MASKS[masks[kind]]);
      this.fxLayer.appendChild(p);
      setTimeout(() => p.remove(), 2600 + i * 120);
    }
  }

  orbit(ms) {
    if (!this.el || reduced()) return;
    this.el.querySelector('.ae-pet-orbit')?.remove();
    const o = document.createElement('div');
    o.className = 'ae-pet-orbit';
    o.innerHTML = '<i></i><i></i><i></i>';
    this.el.appendChild(o);
    setTimeout(() => o.remove(), ms);
  }

  wake(fromTouch) {
    this.lastActivity = Date.now();
    if (!this.sleeping) return;
    this.sleeping = false;
    this.el.querySelectorAll('.ae-pet-zzz').forEach((z) => z.remove());
    if (fromTouch) {
      this.anim = 'jump'; this.frame = 0; this.lastAnim = null;
      this.burstUntil = performance.now() + 560;
      this.fx('startle', 450);
      this.say(pick(quotes.wake), 2200);
    }
  }

  sleep() {
    this.sleeping = true; this.walk = null;
    for (const t of ['z', 'z']) {
      const z = document.createElement('span'); z.className = 'ae-pet-zzz'; z.textContent = t;
      this.el.appendChild(z);
    }
    if (Math.random() < 0.5) this.say(pick(quotes.sleep), 2000);
  }

  greet() {
    const hr = new Date().getHours();
    const pool = hr >= 5 && hr < 11 ? quotes.morning : hr >= 11 && hr < 14 ? quotes.noon : hr >= 18 && hr < 23 ? quotes.evening : hr >= 23 || hr < 5 ? quotes.night : null;
    this.burst('cheer', 1400);
    this.emit('spark', 4);
    this.say(pick(pool && Math.random() < 0.7 ? pool : quotes.greet), 3200);
  }

  /** One of the little things she does when nobody needs her. */
  idleAct() {
    const sitting = !store.get().petPos;
    const idleMs = Date.now() - this.lastActivity;
    const pool = IDLE_ACTS.filter((a) => !(a.id === 'stroll' && sitting));
    let r = Math.random() * pool.reduce((s, a) => s + a.w, 0);
    let act = pool[0];
    for (const a of pool) { r -= a.w; if (r <= 0) { act = a; break; } }
    // the longer nobody is around, the sleepier she gets
    if (idleMs > 55000 && Math.random() < 0.6) act = { id: 'yawn' };
    const chatty = Math.random() < 0.55;
    const keep = this.lastActivity;
    this.doAct(act.id, chatty, idleMs);
    this.lastActivity = keep;
  }

  doAct(id, chatty, idleMs = 0) {
    switch (id) {
      case 'stretch':
        this.burst('jump', 1500); this.fx('stretch', 1600);
        if (chatty) this.say('伸个懒腰~', 1800);
        break;
      case 'sing':
        this.burst('calm', 3200); this.fx('bob', 3200);
        this.emit('note', 5, { stagger: 0.5, spread: 50 });
        if (chatty) this.say(pick(quotes.sing), 2400);
        break;
      case 'stars':
        this.burst('idle', 2600);
        this.emit('star', 4, { stagger: 0.4, y: 0, spread: 80 });
        if (chatty) this.say(pick(quotes.stars), 2400);
        break;
      case 'look': {
        const first = Math.random() < 0.5 ? 'lookR' : 'lookL';
        this.burst(first, 1100);
        setTimeout(() => {
          if (this.lastAnim !== first || this.base !== 'idle') return;
          const keep = this.lastActivity;
          this.burst(first === 'lookR' ? 'lookL' : 'lookR', 1100);
          this.lastActivity = keep;
        }, 1150);
        if (chatty && idleMs > 30000) this.say(pick(quotes.bored), 2200);
        break;
      }
      case 'giggle':
        this.burst('giggle', 1800); this.emit('heart', 2);
        if (chatty) this.say('嘿嘿~', 1500);
        break;
      case 'cheer':
        this.burst('cheer', 1600); this.emit('spark', 4);
        if (chatty) this.say(pick(quotes.cheer), 2400);
        break;
      case 'yawn':
        this.burst('doze', 2600); this.fx('stretch', 1600);
        if (chatty) this.say(pick(quotes.yawn), 2000);
        break;
      case 'stroll': {
        const dir = this.x < innerWidth / 3 ? 1 : this.x > innerWidth * 2 / 3 ? -1 : (Math.random() < 0.5 ? -1 : 1);
        this.walk = { dir, left: 40 + Math.random() * 90 };
        break;
      }
    }
  }

  currentAnim(now) {
    if (this.dragging) return this.dragDir < 0 ? 'left' : 'right';
    if (now < this.burstUntil) return this.anim;
    if (this.walk) return this.walk.dir < 0 ? 'left' : 'right';
    if (this.base === 'work') return 'work';
    if (this.base === 'waiting') return 'waiting';
    if (this.sleeping) return 'doze';
    return 'idle';
  }

  draw(anim) {
    const spec = ANIMS[anim];
    const { w, h } = this.size();
    if (spec.sheet !== this.sheet) {
      this.sheet = spec.sheet;
      this.sprite.style.setProperty('--sheet', this.sheetUrls[spec.sheet]);
      this.sprite.style.setProperty('--rows', spec.sheet === 0 ? '9' : '4');
    }
    const col = spec.seq ? spec.seq[this.frame % spec.seq.length] : this.frame;
    this.sprite.style.backgroundPosition = `${-col * w}px ${-spec.row * h}px`;
  }

  tick(now) {
    if (!this.el || this.el.hidden) return;
    const anim = this.currentAnim(now);
    const spec = ANIMS[anim];
    const len = spec.seq ? spec.seq.length : spec.frames;
    if (anim !== this.lastAnim) { this.frame = 0; this.lastAnim = anim; this.lastTick = now; this.draw(anim); }
    else if (now - this.lastTick >= 1000 / spec.fps) {
      this.lastTick = now;
      this.frame = (this.frame + 1) % len;
      this.draw(anim);
    }
    // keep the default seat glued to the composer (it moves with the keyboard)
    if (!store.get().petPos && !this.dragging && !this.walk && now - (this.lastPerch || 0) > 700) { this.lastPerch = now; this.perch(); }
    if (this.base !== 'idle' || this.dragging || now < this.burstUntil) return;
    // idle life: little acts, dozing off, strolling
    const wall = Date.now();
    const idleMs = wall - this.lastActivity;
    if (!this.sleeping && idleMs > 90000) { this.sleep(); return; }
    if (!this.sleeping && !this.walk && !reduced() && store.get().petIdle !== false && wall >= this.nextIdleAct) {
      this.nextIdleAct = wall + 14000 + Math.random() * 16000;
      if (document.visibilityState === 'visible') this.idleAct();
    }
    if (this.walk) {
      const step = 0.9 * this.walk.dir;
      const before = this.x;
      this.place(this.x + step, this.y, false);
      this.walk.left -= Math.abs(step);
      if (this.walk.left <= 0 || this.x === before) { this.walk = null; if (store.get().petPos) this.place(this.x, this.y, true); }
    }
  }

  say(text, ms = 2600) {
    if (!text || !store.get().petBubbles || !this.bubble) return;
    this.bubble.textContent = text;
    this.bubble.setAttribute('data-show', '');
    clearTimeout(this.bubbleTimer);
    this.bubbleTimer = setTimeout(() => this.bubble.removeAttribute('data-show'), ms);
  }

  addAffection(n) {
    const before = this.affection;
    this.affection += n;
    writeAffection(this.affection);
    for (const k of Object.keys(quotes.affection).map(Number)) {
      if (before < k && this.affection >= k) { this.say(quotes.affection[k], 3200); this.emit('heart', 8, { stagger: 0.06 }); return true; }
    }
    return false;
  }

  // ---------- reactions ----------
  /** Single tap that did not open the quick menu (menu disabled). */
  reactTap(local) {
    const head = local.y < this.size().h * 0.45;
    const roll = Math.random();
    if (head && roll < 0.5) { this.burst('shy', 1300, pick(quotes.tap)); this.emit('heart', 2); return; }
    if (roll < 0.35) { this.burst('giggle', 1200, pick(quotes.tap)); return; }
    this.burst('jump', 620, pick(quotes.tap));
    this.fx('squish', 320);
  }

  /** Rapid taps: poke -> grumpy -> dizzy. */
  reactPoke(count) {
    if (count >= 6) {
      this.taps = [];
      this.burst('failed', 2400, pick(quotes.dizzy));
      this.fx('dizzy', 2400); this.orbit(2400);
      return;
    }
    this.burst(count >= 4 ? 'review' : 'shy', 900, count === 3 || count === 5 ? pick(quotes.poke) : null);
    this.fx(count >= 4 ? 'wobble' : 'squish', count >= 4 ? 500 : 320);
  }

  reactPat() {
    this.burst('giggle', 1600);
    this.emit('heart', 3, { y: 4 });
    if (!this.addAffection(1)) this.say(pick(quotes.pat), 1800);
  }

  // ---------- input ----------
  bindPointer() {
    const el = this.el;
    let start = null, moved = false, pressTimer = 0, lastTap = 0, lastX = 0;
    let rub = null;
    const localOf = (e) => { const r = this.sprite.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const down = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      el.setPointerCapture?.(e.pointerId);
      start = { px: e.clientX, py: e.clientY, x: this.x, y: this.y, local: localOf(e), woke: this.sleeping };
      moved = false; lastX = e.clientX;
      const head = start.local.y < this.size().h * 0.45;
      rub = head ? { turns: 0, dir: 0, lastX: e.clientX, patted: false } : null;
      this.wake(true);
      clearTimeout(pressTimer);
      pressTimer = setTimeout(() => {
        if (!moved && start && !(rub && rub.turns > 0)) { start = null; this.opts.onLongPress?.(); }
      }, 600);
    };
    const move = (e) => {
      if (!start) return;
      const dx = e.clientX - start.px, dy = e.clientY - start.py;
      // rubbing side to side over her head = head pat, not a drag
      if (rub && !moved && Math.abs(dy) < 18) {
        const ddx = e.clientX - rub.lastX;
        if (Math.abs(ddx) >= 3) {
          const dir = Math.sign(ddx);
          if (rub.dir && dir !== rub.dir) rub.turns++;
          rub.dir = dir; rub.lastX = e.clientX;
          if (rub.turns >= 2) clearTimeout(pressTimer);
          if (rub.turns >= 3 && !rub.patted) { rub.patted = true; this.reactPat(); }
          else if (rub.patted && rub.turns % 4 === 0) this.emit('heart', 1, { y: 4 });
        }
        if (Math.abs(dx) < 34) { e.preventDefault(); return; }
        if (rub.turns >= 2) { e.preventDefault(); return; }
      }
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
      const start0 = start;
      const local = start.local;
      const patted = rub && rub.turns >= 2;
      start = null; rub = null;
      if (wasDrag) {
        this.dragging = false; el.removeAttribute('data-dragging');
        this.place(this.x, this.y, true);
        this.burst('jump', 560);
        this.fx('squish', 320);
        return;
      }
      if (patted || start0.woke) return;
      const now = Date.now();
      this.taps = this.taps.filter((t) => now - t < 1400);
      this.taps.push(now);
      if (this.taps.length >= 3) { this.opts.onTap?.(false); this.reactPoke(this.taps.length); lastTap = 0; return; }
      if (now - lastTap < 320) { lastTap = 0; this.opts.onTap?.(false); this.burst('review', 1600, '盯——'); return; }
      lastTap = now;
      const opened = this.opts.onTap?.(true);
      if (opened) {
        this.bubble?.removeAttribute('data-show');
        const a = pick(['jump', 'jump', 'giggle', 'shy']);
        this.burst(a, a === 'jump' ? 620 : 900);
        if (a === 'jump') this.fx('squish', 320); else this.emit('heart', 1);
      }
      else this.reactTap(local);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    // mouse users: she notices the cursor now and then
    let lastHover = 0;
    el.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || this.dragging) return;
      const now = Date.now();
      if (this.sleeping) { this.wake(true); return; }
      if (now - lastHover < 20000 || this.base !== 'idle' || performance.now() < this.burstUntil) return;
      lastHover = now;
      this.lastActivity = now;
      if (Math.random() < 0.6) { this.burst('shy', 1100, pick(quotes.hover)); }
    });
  }
}

let ICON_MASKS = {};

/** Follow the agent: running -> work, error -> failed burst, done -> cheer. */
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
      else if (!last.running && f.running) { pet.burst('jump', 700, pick(quotes.work)); pet.emit('spark', 3); }
      else if (last.running && !f.running) { pet.burst('cheer', 1600, pick(quotes.done)); pet.emit('spark', 6); }
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
  const { svgUrl } = require('./skin-extra.js');
  ICON_MASKS = { heart: svgUrl('heart'), sparkle: svgUrl('sparkle') };
  const pet = new Pet(opts || {});
  pet.rect = () => (pet.el && !pet.el.hidden ? pet.sprite.getBoundingClientRect() : null);
  const off = pet.mount();
  const offAgent = wireAgent(ctx, pet);
  install.pet = pet;
  return () => { offAgent(); off(); install.pet = null; };
}

module.exports = { install };
