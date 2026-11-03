"use strict";
// Keyboard guard (touch devices only).
// The stock composer hands focus back to its editor whenever a toolbar button
// is pressed ("+" command menu, send / stop) and whenever a session opens.
// On a phone every such programmatic focus pops the on-screen keyboard.
// We keep the editor focusable but mark it inputmode="none" by default, and
// flip it to a real text input only when the user actually taps the text
// area. Focus, caret and the "/" command menu keep working; just the keyboard
// stays down until you tap where you type.
const store = require('./store.js');

const EDITABLE = '[data-composer-card] [contenteditable="true"]';
// Taps on these never mean "I want to type".
const NOT_TEXT = 'button,[role="button"],a,label,select,summary,[aria-haspopup],[role="menuitem"],[role="option"],[class*="_tools"],[class*="_trailing"]';

function isTouch() {
  try { return window.matchMedia('(pointer: coarse)').matches; } catch { return false; }
}

function install() {
  let armedUntil = 0; // a real tap on the text area allows the keyboard until then
  const editors = () => document.querySelectorAll(EDITABLE);
  const enabled = () => store.get().keyboardGuard !== false && isTouch();

  const lock = (el) => { if (el.getAttribute('inputmode') !== 'none') el.setAttribute('inputmode', 'none'); };
  const unlock = (el) => { if (el.getAttribute('inputmode') === 'none') el.removeAttribute('inputmode'); };

  const sync = () => {
    const on = enabled();
    for (const el of editors()) {
      if (!on) { if (el.dataset.aeKb) { unlock(el); delete el.dataset.aeKb; } continue; }
      el.dataset.aeKb = '1';
      if (document.activeElement === el && Date.now() < armedUntil) unlock(el); else if (document.activeElement !== el) lock(el);
    }
  };

  const onDown = (e) => {
    if (!enabled()) return;
    const t = e.target;
    if (!(t instanceof Element)) return;
    const card = t.closest('[data-composer-card]');
    if (!card) return;
    const textTap = !!t.closest('[contenteditable="true"]') || !t.closest(NOT_TEXT);
    if (!textTap) return;
    armedUntil = Date.now() + 1500;
    for (const el of card.querySelectorAll('[contenteditable="true"]')) {
      const wasLocked = el.getAttribute('inputmode') === 'none';
      unlock(el);
      // Already focused with the keyboard down: inputmode changes do not
      // always raise it, so re-focus once if the viewport did not shrink.
      if (wasLocked && document.activeElement === el && window.visualViewport) {
        const h0 = window.visualViewport.height;
        setTimeout(() => {
          if (document.activeElement === el && window.visualViewport.height >= h0 - 40) { el.blur(); el.focus({ preventScroll: true }); }
        }, 380);
      }
    }
  };

  const onFocusIn = (e) => {
    if (!enabled()) return;
    const el = e.target;
    if (!(el instanceof Element) || !el.matches(EDITABLE)) return;
    el.dataset.aeKb = '1';
    if (Date.now() < armedUntil) unlock(el); else lock(el);
  };
  const onFocusOut = (e) => {
    if (!enabled()) return;
    const el = e.target;
    if (el instanceof Element && el.matches(EDITABLE)) { lock(el); armedUntil = 0; }
  };

  document.addEventListener('pointerdown', onDown, true);
  document.addEventListener('focusin', onFocusIn, true);
  document.addEventListener('focusout', onFocusOut, true);
  // New editors appear when a session opens; mark them before they get focus.
  const mo = new MutationObserver(() => { if (enabled()) for (const el of editors()) if (!el.dataset.aeKb && document.activeElement !== el) { el.dataset.aeKb = '1'; lock(el); } });
  mo.observe(document.body, { childList: true, subtree: true });
  sync();
  const off = store.subscribe(sync);
  return () => {
    off(); mo.disconnect();
    document.removeEventListener('pointerdown', onDown, true);
    document.removeEventListener('focusin', onFocusIn, true);
    document.removeEventListener('focusout', onFocusOut, true);
    for (const el of editors()) if (el.dataset.aeKb) { unlock(el); delete el.dataset.aeKb; }
  };
}

module.exports = { install };
