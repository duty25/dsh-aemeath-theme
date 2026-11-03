/*!
 * Bundled into dsh-aemeath-theme unmodified.
 * Original: @dsh-external/dsh-mobile-nav 1.0.0 by mexiaosqwq
 * https://github.com/mexiaosqwq/dsh-web-mobile
 * License: MIT (see vendor/mobile-nav.LICENSE)
 */
window.__ModuleLoader__.load({id: '@dsh-external/dsh-mobile-nav', factory: (require) => {
const modules = Object.create(null);
modules["MobileDrawerFooter.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileDrawerFooter = MobileDrawerFooter;
const jsx_runtime_1 = require("react/jsx-runtime");
const dsh_client_ui_primitives_1 = require("@deepseek-ai/dsh-client-ui-primitives");
/**
 * Mobile-only drawer footer actions, relocated from the session header to the
 * drawer footer (beside Settings):
 * - Files: opens the dsh-web-ui aionui explorer as a floating bottom sheet
 *   (the explorer column is hidden on mobile until this marker is set, so
 *   the suite's own persisted-expanded state can never cover the UI on load).
 * - Session log: the official session-log-export controller, so the
 *   progress/result dialog is shared with the desktop flow.
 * Hidden entirely on wide screens (CSS media query).
 */
function MobileDrawerFooter({ useSessions, downloadSessionLog, toggleSidebar, t }) {
    const sessionId = useSessions((state) => state.current);
    const openExplorer = () => {
        document.querySelector('[data-mobile-nav="frame"]')?.setAttribute('data-aionui-explorer-open', '');
        toggleSidebar();
    };
    return ((0, jsx_runtime_1.jsxs)("div", { "data-mobile-nav": "drawer-actions", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", "data-mobile-nav": "explorer", "aria-label": t('files'), title: t('files'), onClick: openExplorer, children: [(0, jsx_runtime_1.jsx)(dsh_client_ui_primitives_1.IconPanelLeftOutlineRegular, { size: 14 }), (0, jsx_runtime_1.jsx)("span", { children: t('files') })] }), (0, jsx_runtime_1.jsxs)("button", { type: "button", "data-mobile-nav": "session-log", "aria-label": t('sessionLog'), title: t('sessionLog'), disabled: sessionId === undefined, onClick: () => {
                    if (sessionId !== undefined)
                        downloadSessionLog(sessionId);
                }, children: [(0, jsx_runtime_1.jsx)(dsh_client_ui_primitives_1.IconDownloadOutlineRegular, { size: 14 }), (0, jsx_runtime_1.jsx)("span", { children: t('sessionLog') })] })] }));
}

};
modules["MobileNavOverlay.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileNavOverlay = MobileNavOverlay;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_dom_1 = require("react-dom");
const dsh_client_ui_primitives_1 = require("@deepseek-ai/dsh-client-ui-primitives");
const pager_ts_1 = require("./effects/pager.js");
const dom_watch_ts_1 = require("./effects/dom-watch.js");
const MOBILE_QUERY = '(max-width: 1023px)';
const NAVIGATION = 'button[data-dsh-taskboard-entry], button[data-dsh-ssh-entry], [class*="newSession"], [class*="sessionRow"], [class*="searchResultRow"], [class*="searchResultWorkspace"]';
function useMobile() {
    const [mobile, setMobile] = (0, react_1.useState)(() => window.matchMedia(MOBILE_QUERY).matches);
    (0, react_1.useEffect)(() => {
        const query = window.matchMedia(MOBILE_QUERY);
        const onChange = (event) => setMobile(event.matches);
        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, []);
    return mobile;
}
function findFrame() {
    return document.querySelector('[data-shell-overlay]')?.parentElement ?? null;
}
function MobileNavOverlay({ toggleSidebar, t }) {
    const mobile = useMobile();
    const [fabVisible, setFabVisible] = (0, react_1.useState)(false);
    (0, react_1.useLayoutEffect)(() => {
        if (!mobile)
            return;
        const frame = findFrame();
        if (frame === null)
            return;
        frame.setAttribute('data-mobile-nav', 'frame');
        return () => {
            frame.removeAttribute('data-mobile-nav');
            frame.removeAttribute('data-mobile-preview-full');
        };
    }, [mobile]);
    (0, react_1.useEffect)(() => {
        if (!mobile) {
            setFabVisible(false);
            return;
        }
        const sync = () => setFabVisible(document.querySelector('[data-phase="active"]') === null);
        sync();
        return (0, dom_watch_ts_1.observeRelevant)(document.body, '[data-phase]', sync, {
            subtree: true, childList: true, attributes: true, attributeFilter: ['data-phase'],
        });
    }, [mobile]);
    (0, react_1.useEffect)(() => {
        if (!mobile)
            return;
        const onKeyDown = (event) => {
            if (event.key === 'Escape' && document.querySelector('[aria-modal="true"]') === null) {
                (0, pager_ts_1.navigatePager)('chat', toggleSidebar);
            }
        };
        const onDrawerClick = (event) => {
            const target = event.target;
            if (!(target instanceof Element))
                return;
            const drawer = findFrame()?.firstElementChild;
            if (!drawer?.contains(target))
                return;
            // Row actions and portaled dialogs must remain visible in the sidebar.
            if (target.closest('[class*="sessionRow"] button') !== null)
                return;
            const label = target.closest('button')?.getAttribute('aria-label') ?? '';
            const createsSession = /^(?:新建会话|New session(?: in .+)?|在“.+”中新建会话)$/.test(label);
            if (target.closest(NAVIGATION) === null && !createsSession)
                return;
            if (document.querySelector('[aria-modal="true"]') !== null)
                return;
            (0, pager_ts_1.navigatePager)('chat', toggleSidebar, true);
        };
        document.addEventListener('keydown', onKeyDown, true);
        document.addEventListener('click', onDrawerClick, true);
        return () => {
            document.removeEventListener('keydown', onKeyDown, true);
            document.removeEventListener('click', onDrawerClick, true);
        };
    }, [mobile, toggleSidebar]);
    (0, react_1.useEffect)(() => {
        if (!mobile)
            return;
        let button = null;
        const ensure = () => {
            const col = document.querySelector('[data-aionui-preview-col]');
            if (col === null)
                return;
            if (button === null) {
                button = document.createElement('button');
                button.type = 'button';
                button.dataset.mobileNav = 'preview-full-toggle';
                button.setAttribute('aria-label', t('previewFullscreen'));
                button.title = t('previewFullscreen');
                button.innerHTML = [
                    '<svg class="dsh-mobile-nav-full-in" viewBox="0 0 16 16" fill="none" aria-hidden="true">',
                    '<path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
                    '</svg>',
                    '<svg class="dsh-mobile-nav-full-out" viewBox="0 0 16 16" fill="none" aria-hidden="true">',
                    '<path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
                    '</svg>',
                ].join('');
                button.addEventListener('click', () => findFrame()?.toggleAttribute('data-mobile-preview-full'));
            }
            if (button.parentElement !== col)
                col.appendChild(button);
        };
        ensure();
        const cleanup = (0, dom_watch_ts_1.observeRelevant)(document.body, '[data-aionui-preview-col]', ensure);
        return () => {
            cleanup();
            button?.remove();
        };
    }, [mobile, t]);
    (0, react_1.useEffect)(() => {
        if (!mobile)
            return;
        const ensure = () => {
            const chip = document.querySelector('[data-slot="conversation.input.dock"] [data-gitgraph-chip-anchor]');
            if (chip === null)
                return;
            const card = document.querySelector('[data-composer-card]');
            if (card !== null && chip.parentElement !== card)
                card.insertBefore(chip, card.firstChild);
        };
        ensure();
        const cleanup = (0, dom_watch_ts_1.observeRelevant)(document.body, '[data-slot="conversation.input.dock"], [data-composer-card]', ensure);
        return () => {
            cleanup();
            const chip = document.querySelector('[data-gitgraph-chip-anchor]');
            const dock = document.querySelector('[data-slot="conversation.input.dock"]');
            if (chip !== null && dock !== null && chip.parentElement !== dock)
                dock.appendChild(chip);
        };
    }, [mobile]);
    (0, react_1.useEffect)(() => {
        if (!mobile)
            return;
        const ensure = () => {
            const dialog = document.querySelector('[aria-modal="true"]');
            const nav = dialog?.querySelector(':scope > [class$="_nav"]');
            const header = dialog?.querySelector('[class$="_header"]');
            if (nav != null && header != null && header.parentElement !== nav)
                nav.appendChild(header);
        };
        ensure();
        return (0, dom_watch_ts_1.observeRelevant)(document.body, '[aria-modal="true"]', ensure);
    }, [mobile]);
    if (!mobile)
        return null;
    return fabVisible ? (0, react_dom_1.createPortal)((0, jsx_runtime_1.jsx)("button", { type: "button", "data-mobile-nav": "fab", "aria-label": t('open'), title: t('open'), onClick: () => (0, pager_ts_1.navigatePager)('sidebar', toggleSidebar), children: (0, jsx_runtime_1.jsx)(dsh_client_ui_primitives_1.IconPanelLeftOutlineRegular, { size: 18 }) }), document.body) : null;
}

};
modules["MobileNavToggle.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileNavToggle = MobileNavToggle;
const jsx_runtime_1 = require("react/jsx-runtime");
const dsh_client_ui_primitives_1 = require("@deepseek-ai/dsh-client-ui-primitives");
const pager_ts_1 = require("./effects/pager.js");
/** Header actions; the footer keeps Files available on the blank screen. */
function MobileNavToggle({ toggleSidebar, t }) {
    const toggleExplorer = () => {
        document.querySelector('[data-mobile-nav="frame"]')?.toggleAttribute('data-aionui-explorer-open');
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { type: "button", "data-mobile-nav": "toggle", "aria-label": t('open'), title: t('open'), onClick: () => (0, pager_ts_1.togglePager)(toggleSidebar), children: (0, jsx_runtime_1.jsx)(dsh_client_ui_primitives_1.IconPanelLeftOutlineRegular, { size: 16 }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", "data-mobile-nav": "files", "aria-label": t('files'), title: t('files'), onClick: toggleExplorer, children: (0, jsx_runtime_1.jsx)(dsh_client_ui_primitives_1.IconFolderOpenOutlineRegular, { size: 16 }) })] }));
}

};
modules["debug.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installDebugBadge = installDebugBadge;
/**
 * Debug badge — ?mobile-nav-debug=1
 * Renders a live state overlay (URL, viewport, media queries, shell chrome,
 * aionui columns, genui cards, captured errors) so a phone-side repro can be
 * diagnosed without guessing. No-op unless the query param is present.
 */
function installDebugBadge(ctx) {
    ctx.effect(() => {
        if (!new URLSearchParams(location.search).has('mobile-nav-debug'))
            return () => { };
        const errors = [];
        const onError = (event) => errors.push(`ERR ${event.message.slice(0, 120)}`);
        const onRejection = (event) => errors.push(`REJ ${String(event.reason).slice(0, 120)}`);
        window.addEventListener('error', onError);
        window.addEventListener('unhandledrejection', onRejection);
        const badge = document.createElement('div');
        badge.style.cssText = [
            'position:fixed', 'top:40px', 'right:6px', 'z-index:2147483000',
            'background:rgba(0,0,0,.82)', 'color:#fff', 'font:11px/1.5 ui-monospace,monospace',
            'padding:8px 10px', 'border-radius:8px', 'max-width:94vw', 'max-height:70vh',
            'overflow:auto', 'white-space:pre-wrap', 'pointer-events:none',
        ].join(';');
        const read = () => {
            const q = (sel) => !!document.querySelector(sel);
            const vis = (sel) => {
                const el = document.querySelector(sel);
                return el === null ? 'absent' : getComputedStyle(el).visibility;
            };
            const frame = document.querySelector('[data-mobile-nav="frame"]');
            return [
                `URL ${location.pathname}${location.search}`,
                `W ${innerWidth} x ${innerHeight} dpr ${devicePixelRatio}`,
                `mq≤1023 ${matchMedia('(max-width: 1023px)').matches}  mq≥1024 ${matchMedia('(min-width: 1024px)').matches}`,
                `css ${q('style[data-plugin-css*="mobile"]')}  frame ${!!frame}`,
                `previewCol ${vis('[data-aionui-preview-col]')}  explorerCol ${vis('[data-aionui-explorer-col]')}`,
                `previewOpen ${frame?.hasAttribute('data-aionui-preview-open') ?? '?'}  explorerOpen ${frame?.hasAttribute('data-aionui-explorer-open') ?? '?'}  previewFull ${frame?.hasAttribute('data-mobile-preview-full') ?? '?'}`,
                `header ${vis('[data-phase] header')}  composer ${q('textarea')}`,
                `genui cards ${document.querySelectorAll('[data-genui]').length}  panel ${q('[data-genui-panel]')}`,
                `phase ${document.querySelector('[data-phase]')?.getAttribute('data-phase') ?? '?'}`,
                `errs ${errors.slice(-5).join(' | ') || 'none'}`,
            ].join('\n');
        };
        const paint = () => { badge.textContent = read(); };
        paint();
        const observer = new MutationObserver(paint);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
        const timer = setInterval(paint, 1500);
        document.body.appendChild(badge);
        return () => {
            window.removeEventListener('error', onError);
            window.removeEventListener('unhandledrejection', onRejection);
            observer.disconnect();
            clearInterval(timer);
            badge.remove();
        };
    }, 'dsh-mobile-nav: debug badge');
}

};
modules["effects/aionui-compat.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installAionuiCompat = installAionuiCompat;
const dom_watch_ts_1 = require("./dom-watch.js");
const COLUMNS = '[data-aionui-explorer-col], [data-aionui-preview-col]';
const MARKERS = '[data-mobile-nav="frame"]';
function installAionuiCompat(ctx) {
    ctx.effect(() => {
        const narrow = window.matchMedia('(max-width: 1023px)');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let cleanup;
        const install = () => {
            cleanup?.();
            cleanup = undefined;
            if (!narrow.matches)
                return;
            const frame = () => document.querySelector(MARKERS);
            const closePreview = () => {
                frame()?.removeAttribute('data-aionui-preview-open');
                frame()?.removeAttribute('data-mobile-preview-full');
            };
            const onTap = (event) => {
                const target = event.target;
                if (!(target instanceof Element))
                    return;
                if (target.closest('.aionui-collapse-chevron') !== null) {
                    frame()?.removeAttribute('data-aionui-explorer-open');
                }
                if (target.closest('[data-aionui-preview-col] [class$="_panelCollapse"]') !== null) {
                    closePreview();
                    return;
                }
                const row = target.closest('[data-aionui-explorer-col] [class*="_treeRow"]');
                if (row === null)
                    return;
                // Non-empty arrows belong to directories, not previewable files.
                if (row.querySelector('[class*="_treeArrow"]:not([class*="_treeArrowEmpty"])') === null) {
                    frame()?.setAttribute('data-aionui-preview-open', '');
                }
            };
            const visible = new Map();
            const animations = new Map();
            const check = () => {
                const preview = document.querySelector('[data-aionui-preview-col]');
                if (preview?.style.visibility === 'hidden')
                    closePreview();
                const columns = [...document.querySelectorAll(COLUMNS)];
                for (const [el, animation] of animations) {
                    if (!el.isConnected) {
                        animation.cancel();
                        animations.delete(el);
                        visible.delete(el);
                    }
                }
                for (const el of columns) {
                    const shown = getComputedStyle(el).visibility === 'visible';
                    if (!shown || reducedMotion.matches) {
                        animations.get(el)?.cancel();
                        animations.delete(el);
                    }
                    else if (!(visible.get(el) ?? false)) {
                        animations.get(el)?.cancel();
                        animations.set(el, el.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: 'cubic-bezier(.16, 1, .3, 1)' }));
                    }
                    visible.set(el, shown);
                }
            };
            document.addEventListener('click', onTap, true);
            reducedMotion.addEventListener('change', check);
            const unwatch = (0, dom_watch_ts_1.observeRelevant)(document.body, `${COLUMNS}, ${MARKERS}`, check, {
                childList: true, subtree: true, attributes: true,
                attributeFilter: ['style', 'class', 'data-aionui-explorer-open', 'data-aionui-preview-open', 'data-mobile-preview-full'],
            });
            check();
            cleanup = () => {
                unwatch();
                document.removeEventListener('click', onTap, true);
                reducedMotion.removeEventListener('change', check);
                for (const animation of animations.values())
                    animation.cancel();
            };
        };
        install();
        narrow.addEventListener('change', install);
        return () => {
            narrow.removeEventListener('change', install);
            cleanup?.();
        };
    }, 'dsh-mobile-nav: mobile file sheets');
}

};
modules["effects/composer-toggle.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installComposerToggle = installComposerToggle;
const dom_watch_ts_1 = require("./dom-watch.js");
const STORAGE_KEY = 'dshm-composer-collapsed';
const COLLAPSED = 'collapsed';
function label(collapsed) {
    const lang = `${document.documentElement.lang} ${navigator.language}`.toLowerCase();
    const english = lang.includes('en') && !lang.includes('zh');
    if (english)
        return collapsed ? 'Show input' : 'Hide input';
    return collapsed ? '展开输入框' : '收起输入框';
}
function savedCollapsed() {
    try {
        return localStorage.getItem(STORAGE_KEY) === '1';
    }
    catch {
        return false;
    }
}
/** Phone-only control for hiding the bottom composer without focusing it. */
function installComposerToggle(ctx) {
    ctx.effect(() => {
        const narrow = window.matchMedia('(max-width: 1023px)');
        let cleanup;
        let button = null;
        const paint = (collapsed) => {
            const frame = document.querySelector('[data-mobile-nav="frame"]');
            if (frame !== null) {
                if (collapsed)
                    frame.setAttribute('data-dshm-composer', COLLAPSED);
                else
                    frame.removeAttribute('data-dshm-composer');
            }
            if (button === null)
                return;
            const text = label(collapsed);
            button.textContent = text;
            button.setAttribute('aria-label', text);
            button.setAttribute('aria-pressed', collapsed ? 'true' : 'false');
        };
        const ensure = () => {
            if (!narrow.matches)
                return;
            const seat = document.querySelector('[data-composer-seat]');
            if (!(seat instanceof HTMLElement))
                return;
            if (button === null) {
                button = document.createElement('button');
                button.type = 'button';
                button.dataset.mobileNav = 'composer-toggle';
                button.addEventListener('click', () => {
                    const frame = document.querySelector('[data-mobile-nav="frame"]');
                    const next = frame?.getAttribute('data-dshm-composer') !== COLLAPSED;
                    try {
                        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
                    }
                    catch {
                        // Private mode can reject storage; the current page still toggles.
                    }
                    paint(next);
                });
            }
            if (button.parentElement !== seat)
                seat.appendChild(button);
            paint(savedCollapsed());
        };
        const install = () => {
            cleanup?.();
            cleanup = undefined;
            if (!narrow.matches) {
                document.querySelector('[data-mobile-nav="frame"]')?.removeAttribute('data-dshm-composer');
                button?.remove();
                button = null;
                return;
            }
            ensure();
            cleanup = (0, dom_watch_ts_1.observeRelevant)(document.body, '[data-composer-seat]', ensure);
        };
        install();
        narrow.addEventListener('change', install);
        return () => {
            narrow.removeEventListener('change', install);
            cleanup?.();
            button?.remove();
            document.querySelector('[data-mobile-nav="frame"]')?.removeAttribute('data-dshm-composer');
        };
    }, 'dsh-mobile-nav: composer toggle');
}

};
modules["effects/dom-watch.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.observeRelevant = observeRelevant;
const LIVE_CONTENT = '[data-conversation-scroll], [data-composer-input]';
/** Watch shell changes without rescanning streamed messages or the editor. */
function observeRelevant(root, selector, callback, options = { childList: true, subtree: true }) {
    let frame = null;
    const observer = new MutationObserver((records) => {
        const relevant = records.some((record) => {
            const target = record.target instanceof Element ? record.target : record.target.parentElement;
            if (target !== null && target.closest(LIVE_CONTENT) !== null)
                return false;
            if (record.type === 'attributes')
                return target?.matches(selector) ?? false;
            if (target !== null && target.closest(selector) !== null)
                return true;
            return [...record.addedNodes, ...record.removedNodes].some((node) => node instanceof Element && (node.matches(selector) || node.querySelector(selector) !== null));
        });
        if (!relevant || frame !== null)
            return;
        frame = requestAnimationFrame(() => {
            frame = null;
            callback();
        });
    });
    observer.observe(root, options);
    return () => {
        observer.disconnect();
        if (frame !== null)
            cancelAnimationFrame(frame);
    };
}

};
modules["effects/pager.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagerController = exports.PAGE_ATTR = exports.PAGER_BREAKPOINT = void 0;
exports.navigatePager = navigatePager;
exports.togglePager = togglePager;
const dom_watch_ts_1 = require("./dom-watch.js");
exports.PAGER_BREAKPOINT = '(max-width: 1023px)';
exports.PAGE_ATTR = 'data-dshm-page';
const TARGET_ATTR = 'data-dshm-target';
const MOVING_ATTR = 'data-dshm-moving';
const SCROLL_SETTLE_MS = 160;
const SIDEBAR_COLLAPSE_LABELS = new Set(['收起侧边栏', 'Collapse sidebar']);
const MODEL_SLOT = "[data-slot='conversation.input.model']";
const MODEL_LABEL_SELECTOR = `[data-composer-card] ${MODEL_SLOT} button[aria-haspopup='menu'] > span:first-child`;
const MARQUEE_GAP_PX = 32;
const controllers = new WeakMap();
function findFrame() {
    return document.querySelector('[data-mobile-nav="frame"]');
}
function chatPageLeft(frame) {
    const sidebar = frame.firstElementChild;
    return sidebar instanceof HTMLElement && sidebar.offsetWidth > 0 ? sidebar.offsetWidth : frame.clientWidth;
}
/** One navigation owner prevents repeated clicks from restarting a smooth scroll. */
function navigatePager(page, fallback, afterCommit = false) {
    const frame = findFrame();
    if (frame === null) {
        fallback();
        return;
    }
    const controller = controllers.get(frame);
    if (controller !== undefined) {
        controller.navigate(page, afterCommit);
        return;
    }
    frame.scrollTo({
        left: page === 'chat' ? chatPageLeft(frame) : 0,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
}
function togglePager(fallback) {
    const frame = findFrame();
    if (frame === null) {
        fallback();
        return;
    }
    const target = frame.getAttribute(TARGET_ATTR);
    const onChat = target !== null ? target === 'chat' : frame.scrollLeft >= chatPageLeft(frame) / 2;
    navigatePager(onChat ? 'sidebar' : 'chat', fallback);
}
class PagerController {
    #options;
    #frame = null;
    #viewportWidth = 0;
    #mql = null;
    #motion = null;
    #frameObserver = null;
    #composerCleanup = null;
    #marqueeLabel = null;
    #marqueeRO = null;
    #marqueeFrame = null;
    #keyboardFrame = null;
    #mountFrame = null;
    #scrollFrame = null;
    #navigateFrame = null;
    #resizeTimer = null;
    #settleTimer = null;
    #retryTimer = null;
    #target = null;
    #navPending = false;
    #expandPending = false;
    #retryCount = 0;
    #mounted = false;
    #disposed = false;
    constructor(options) {
        this.#options = options;
    }
    returnToChat() {
        this.navigate('chat', true);
    }
    navigate(page, afterCommit = false) {
        const frame = this.#frame;
        if (frame === null || !this.#mql?.matches || this.#disposed)
            return;
        const leftNow = page === 'chat' ? chatPageLeft(frame) : 0;
        const pending = this.#navigateFrame !== null || this.#navPending;
        if (this.#target === page && (pending || Math.abs(frame.scrollLeft - leftNow) > 2))
            return;
        this.#target = page;
        this.#navPending = true;
        frame.setAttribute(TARGET_ATTR, page);
        if (this.#settleTimer !== null)
            window.clearTimeout(this.#settleTimer);
        this.#settleTimer = null;
        this.#cancelDeferred();
        const place = () => {
            this.#navigateFrame = null;
            if (this.#disposed || this.#target !== page) {
                this.#navPending = false;
                return;
            }
            const left = page === 'chat' ? chatPageLeft(frame) : 0;
            if (Math.abs(frame.scrollLeft - left) <= 1) {
                this.#navPending = false;
                frame.scrollTo({ left, behavior: 'instant' });
                this.#settlePager();
                return;
            }
            // The scroll owns the frame now. An older scrollend can no longer cancel it.
            this.#navPending = false;
            frame.scrollTo({ left, behavior: this.#motion?.matches ? 'instant' : 'smooth' });
        };
        // Session mounting paints on the main thread. The first frame lets that
        // paint finish; the second frame starts the slide, so the two do not fight.
        if (afterCommit) {
            this.#navigateFrame = requestAnimationFrame(() => {
                this.#navigateFrame = requestAnimationFrame(place);
            });
        }
        else
            place();
    }
    mount() {
        if (this.#mounted || this.#disposed)
            return;
        const frame = findFrame();
        if (frame === null) {
            if (this.#retryCount++ < 40) {
                this.#retryTimer = window.setTimeout(() => {
                    this.#retryTimer = null;
                    this.mount();
                }, 100);
            }
            return;
        }
        this.#mounted = true;
        this.#frame = frame;
        this.#viewportWidth = frame.clientWidth;
        controllers.set(frame, this);
        this.#mql = window.matchMedia(exports.PAGER_BREAKPOINT);
        this.#motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.#mql.addEventListener('change', this.#onBreakpointChange);
        this.#motion.addEventListener('change', this.#requestMarqueeSync);
        window.visualViewport?.addEventListener('resize', this.#requestKeyboard);
        window.visualViewport?.addEventListener('scroll', this.#requestKeyboard);
        window.addEventListener('resize', this.#onWindowResize);
        document.addEventListener('click', this.#onDocClickCapture, true);
        document.addEventListener('pointerdown', this.#onDocClickCapture, true);
        frame.addEventListener('scroll', this.#onPagerScroll, { passive: true });
        frame.addEventListener('scrollend', this.#settlePager);
        this.#frameObserver = new MutationObserver(() => {
            if (!frame.hasAttribute('data-sidebar-collapsed'))
                this.#expandPending = false;
        });
        this.#frameObserver.observe(frame, { attributes: true, attributeFilter: ['data-sidebar-collapsed'] });
        const root = document.getElementById('root') ?? document.body;
        this.#composerCleanup = (0, dom_watch_ts_1.observeRelevant)(root, MODEL_SLOT, this.#requestMarqueeSync, { childList: true, subtree: true, characterData: true });
        if (typeof ResizeObserver !== 'undefined') {
            this.#marqueeRO = new ResizeObserver(this.#requestMarqueeSync);
        }
        this.#ensureSidebarOpen();
        this.#placeInitialChat();
        this.#mountFrame = requestAnimationFrame(() => {
            this.#mountFrame = null;
            this.#ensureSidebarOpen();
            this.#placeInitialChat();
        });
        this.#requestKeyboard();
        this.#requestMarqueeSync();
    }
    dispose() {
        if (this.#disposed)
            return;
        this.#disposed = true;
        this.#mounted = false;
        this.#navPending = false;
        this.#frameObserver?.disconnect();
        this.#composerCleanup?.();
        this.#marqueeRO?.disconnect();
        this.#restoreMarquee();
        this.#mql?.removeEventListener('change', this.#onBreakpointChange);
        this.#motion?.removeEventListener('change', this.#requestMarqueeSync);
        window.removeEventListener('resize', this.#onWindowResize);
        window.visualViewport?.removeEventListener('resize', this.#requestKeyboard);
        window.visualViewport?.removeEventListener('scroll', this.#requestKeyboard);
        document.removeEventListener('click', this.#onDocClickCapture, true);
        document.removeEventListener('pointerdown', this.#onDocClickCapture, true);
        this.#cancelDeferred();
        for (const id of [this.#keyboardFrame, this.#mountFrame, this.#marqueeFrame, this.#scrollFrame]) {
            if (id !== null)
                cancelAnimationFrame(id);
        }
        for (const id of [this.#resizeTimer, this.#settleTimer, this.#retryTimer]) {
            if (id !== null)
                window.clearTimeout(id);
        }
        const frame = this.#frame;
        if (frame !== null) {
            controllers.delete(frame);
            frame.removeEventListener('scroll', this.#onPagerScroll);
            frame.removeEventListener('scrollend', this.#settlePager);
            frame.removeAttribute(exports.PAGE_ATTR);
            frame.removeAttribute(TARGET_ATTR);
            frame.removeAttribute(MOVING_ATTR);
            frame.style.removeProperty('--dshm-keyboard-inset');
            const card = frame.children[1];
            if (card instanceof HTMLElement)
                card.style.removeProperty('--dshm-card-radius');
        }
        this.#frame = null;
    }
    #cancelDeferred() {
        if (this.#navigateFrame !== null)
            cancelAnimationFrame(this.#navigateFrame);
        this.#navigateFrame = null;
    }
    #ensureSidebarOpen = () => {
        const frame = this.#frame;
        if (!this.#mql?.matches || frame === null)
            return;
        if (!frame.hasAttribute('data-sidebar-collapsed')) {
            this.#expandPending = false;
            return;
        }
        if (this.#expandPending)
            return;
        this.#expandPending = true;
        this.#options.toggleSidebar();
    };
    #placeInitialChat = () => {
        if (this.#frame === null || !this.#mql?.matches)
            return;
        this.#frame.scrollTo({ left: chatPageLeft(this.#frame), behavior: 'instant' });
        this.#syncPage();
    };
    #syncPage = () => {
        const frame = this.#frame;
        if (frame === null || !this.#mql?.matches)
            return;
        const chatLeft = chatPageLeft(frame);
        if (chatLeft <= 0)
            return;
        const page = frame.scrollLeft < chatLeft / 2 ? 'sidebar' : 'chat';
        if (frame.getAttribute(exports.PAGE_ATTR) !== page)
            frame.setAttribute(exports.PAGE_ATTR, page);
    };
    #onBreakpointChange = () => {
        const frame = this.#frame;
        if (frame === null)
            return;
        this.#target = null;
        this.#navPending = false;
        frame.removeAttribute(TARGET_ATTR);
        frame.removeAttribute(MOVING_ATTR);
        this.#cancelDeferred();
        if (!this.#mql?.matches) {
            frame.removeAttribute(exports.PAGE_ATTR);
            const card = frame.children[1];
            if (card instanceof HTMLElement)
                card.style.removeProperty('--dshm-card-radius');
            this.#restoreMarquee();
            return;
        }
        this.#ensureSidebarOpen();
        this.#placeInitialChat();
        this.#requestMarqueeSync();
    };
    #onWindowResize = () => {
        if (this.#resizeTimer !== null)
            window.clearTimeout(this.#resizeTimer);
        this.#resizeTimer = window.setTimeout(() => {
            this.#resizeTimer = null;
            const frame = this.#frame;
            if (frame === null || !this.#mql?.matches)
                return;
            const width = frame.clientWidth;
            if (width === this.#viewportWidth)
                return;
            this.#viewportWidth = width;
            const page = this.#target ?? frame.getAttribute(exports.PAGE_ATTR) ?? 'chat';
            frame.scrollTo({ left: page === 'chat' ? chatPageLeft(frame) : 0, behavior: 'instant' });
            this.#settlePager();
            this.#requestMarqueeSync();
        }, 120);
    };
    #onPagerScroll = () => {
        if (!this.#mql?.matches)
            return;
        const frame = this.#frame;
        if (frame !== null && !frame.hasAttribute(MOVING_ATTR))
            frame.setAttribute(MOVING_ATTR, '');
        if (this.#settleTimer !== null)
            window.clearTimeout(this.#settleTimer);
        this.#settleTimer = window.setTimeout(this.#settlePager, SCROLL_SETTLE_MS);
    };
    #settlePager = () => {
        if (this.#settleTimer !== null)
            window.clearTimeout(this.#settleTimer);
        this.#settleTimer = null;
        if (this.#navigateFrame !== null || this.#navPending)
            return;
        const frame = this.#frame;
        if (frame !== null && this.#target !== null) {
            const left = this.#target === 'chat' ? chatPageLeft(frame) : 0;
            if (Math.abs(frame.scrollLeft - left) > 2)
                return;
        }
        frame?.removeAttribute(MOVING_ATTR);
        this.#syncPage();
        this.#target = null;
        frame?.removeAttribute(TARGET_ATTR);
    };
    #onDocClickCapture = (event) => {
        const target = event.target;
        const frame = this.#frame;
        if (!(target instanceof Element) || frame === null || !this.#mql?.matches)
            return;
        if (event.type === 'pointerdown') {
            if (!frame.contains(target) || target.closest('[data-mobile-nav="toggle"], [data-mobile-nav="fab"]') !== null)
                return;
            this.#navPending = false;
            this.#cancelDeferred();
            this.#target = null;
            frame.removeAttribute(TARGET_ATTR);
            return;
        }
        const sidebar = frame.firstElementChild;
        if (sidebar?.contains(target)) {
            const button = target.closest('button');
            if (button !== null && SIDEBAR_COLLAPSE_LABELS.has(button.getAttribute('aria-label') ?? '')) {
                event.preventDefault();
                event.stopPropagation();
                this.navigate('chat');
            }
            return;
        }
        if (frame.scrollLeft >= chatPageLeft(frame) / 2)
            return;
        if (frame.children[1]?.contains(target)) {
            event.preventDefault();
            event.stopPropagation();
            this.navigate('chat');
        }
    };
    #requestKeyboard = () => {
        if (this.#keyboardFrame !== null || this.#disposed)
            return;
        this.#keyboardFrame = requestAnimationFrame(() => {
            this.#keyboardFrame = null;
            const frame = this.#frame;
            if (frame === null || !this.#mql?.matches || frame.hasAttribute(MOVING_ATTR))
                return;
            const active = document.activeElement;
            const editing = active instanceof HTMLElement && (active.isContentEditable || active.closest('input, textarea, [data-composer-input]') !== null);
            const vv = window.visualViewport;
            const raw = vv !== null ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
            const inset = editing && raw >= 80 ? raw : 0;
            const value = `${inset}px`;
            if (frame.style.getPropertyValue('--dshm-keyboard-inset') !== value)
                frame.style.setProperty('--dshm-keyboard-inset', value);
        });
    };
    #requestMarqueeSync = () => {
        if (this.#marqueeFrame !== null || this.#disposed || !this.#mql?.matches)
            return;
        this.#marqueeFrame = requestAnimationFrame(() => {
            this.#marqueeFrame = null;
            this.#syncMarquee();
        });
    };
    #restoreMarquee() {
        const label = this.#marqueeLabel;
        if (label === null)
            return;
        label.removeAttribute('data-dshm-marquee');
        label.style.removeProperty('--dshm-marquee-duration');
        const runner = label.querySelector('[data-dshm-marquee-runner]');
        if (runner !== null) {
            const original = [...runner.children].slice(0, runner.children.length / 2).flatMap(item => [...item.childNodes]);
            runner.replaceWith(...original);
        }
    }
    #syncMarquee = () => {
        const label = document.querySelector(MODEL_LABEL_SELECTOR);
        if (label !== this.#marqueeLabel) {
            this.#restoreMarquee();
            this.#marqueeRO?.disconnect();
            this.#marqueeLabel = label;
            if (label !== null)
                this.#marqueeRO?.observe(label);
        }
        if (label === null)
            return;
        const runner = label.querySelector('[data-dshm-marquee-runner]');
        const textWidth = runner === null ? label.scrollWidth : runner.scrollWidth / 2 - MARQUEE_GAP_PX;
        if (this.#motion?.matches || textWidth <= label.clientWidth) {
            this.#restoreMarquee();
            return;
        }
        if (runner === null) {
            const nodes = [...label.childNodes];
            const layer = document.createElement('span');
            layer.setAttribute('data-dshm-marquee-runner', '');
            for (const clone of [false, true]) {
                for (const node of nodes) {
                    const item = document.createElement('span');
                    item.setAttribute('data-dshm-marquee-item', '');
                    item.append(clone ? node.cloneNode(true) : node);
                    layer.append(item);
                }
            }
            label.append(layer);
        }
        if (!label.hasAttribute('data-dshm-marquee'))
            label.setAttribute('data-dshm-marquee', '');
        const duration = `${Math.max(5, Math.round((textWidth + MARQUEE_GAP_PX) / 50))}s`;
        if (label.style.getPropertyValue('--dshm-marquee-duration') !== duration)
            label.style.setProperty('--dshm-marquee-duration', duration);
    };
}
exports.PagerController = PagerController;

};
modules["effects/phone-chrome.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installPhoneChrome = installPhoneChrome;
/**
 * Phone chrome: KEEP the system status bar (no fullscreen) and make it
 * blend into the page. On narrow screens:
 * - The viewport meta gains viewport-fit=cover, so env(safe-area-inset-top)
 *   is the real status-bar / notch height and the stylesheet can push every
 *   surface below it (off notched phones, or in a browser tab where the
 *   layout viewport already sits below the status bar, the inset is 0 and
 *   nothing shifts).
 * - A theme-color meta tracks the shell background (the official theme is
 *   toggled by body[data-ds-dark-theme], which flips --dsw-alias-bg-base):
 *   Android then paints the status bar / URL bar with the page's own base
 *   color, so the status bar reads as part of the UI instead of a foreign
 *   strip. The drawer paints the same strip on iOS / notch displays.
 * - gesturestart is suppressed as the legacy-iOS fallback for double-tap
 *   zoom; modern browsers are covered by the stylesheet's
 *   touch-action: manipulation (which keeps pan and pinch zoom).
 */
function installPhoneChrome(ctx) {
    ctx.effect(() => {
        const narrow = window.matchMedia('(max-width: 1023px)');
        const viewport = document.querySelector('meta[name="viewport"]');
        const originalViewport = viewport?.content ?? '';
        const themeMeta = document.createElement('meta');
        themeMeta.name = 'theme-color';
        const bodyBg = () => getComputedStyle(document.body).backgroundColor;
        const sync = () => {
            if (viewport !== null)
                viewport.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
            themeMeta.content = bodyBg();
            if (themeMeta.parentElement === null)
                document.head.appendChild(themeMeta);
        };
        const restore = () => {
            if (viewport !== null)
                viewport.content = originalViewport;
            themeMeta.remove();
        };
        const onGestureStart = (event) => event.preventDefault();
        if (narrow.matches)
            sync();
        const onChange = (event) => (event.matches ? sync() : restore());
        narrow.addEventListener('change', onChange);
        const observer = new MutationObserver(() => {
            if (narrow.matches)
                themeMeta.content = bodyBg();
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] });
        document.addEventListener('gesturestart', onGestureStart);
        return () => {
            narrow.removeEventListener('change', onChange);
            observer.disconnect();
            document.removeEventListener('gesturestart', onGestureStart);
            restore();
        };
    }, 'dsh-mobile-nav: status bar theme + viewport + zoom guard');
}

};
modules["effects/stats-line.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installStatsLine = installStatsLine;
const dom_watch_ts_1 = require("./dom-watch.js");
function installStatsLine(ctx) {
    ctx.effect(() => {
        const narrow = window.matchMedia('(max-width: 1023px)');
        let cleanup;
        const install = () => {
            cleanup?.();
            cleanup = undefined;
            if (!narrow.matches)
                return;
            const moveTps = (stats) => {
                if ([...stats.children].some((c) => /^TPS\s+\d/.test((c.textContent ?? '').trim())))
                    return;
                const stack = stats.closest('[class$="_composerStack"]');
                if (stack === null)
                    return;
                for (const el of stack.querySelectorAll('div')) {
                    if (el.children.length === 0 && /^TPS\s+\d/.test((el.textContent ?? '').trim())) {
                        stats.appendChild(el);
                        return;
                    }
                }
            };
            const mark = () => {
                for (const root of document.querySelectorAll('[class$="_composerStack"] [class$="_root"]')) {
                    if (root.matches('[data-testid="todo-panel"]'))
                        continue;
                    if (root.querySelector('button, textarea, [data-composer-input]') !== null)
                        continue;
                    if (!/(turns|steps|\bLLM\b|轮|步)/.test(root.textContent ?? ''))
                        continue;
                    if (root.getAttribute('data-mobile-nav') !== 'stats')
                        root.setAttribute('data-mobile-nav', 'stats');
                    moveTps(root);
                    return;
                }
            };
            cleanup = (0, dom_watch_ts_1.observeRelevant)(document.body, '[class$="_composerStack"]', mark);
            mark();
        };
        install();
        narrow.addEventListener('change', install);
        return () => {
            narrow.removeEventListener('change', install);
            cleanup?.();
        };
    }, 'dsh-mobile-nav: stats line marker');
}

};
modules["index.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inject = void 0;
exports.apply = apply;
const MobileNavToggle_tsx_1 = require("./MobileNavToggle.js");
const MobileNavOverlay_tsx_1 = require("./MobileNavOverlay.js");
const MobileDrawerFooter_tsx_1 = require("./MobileDrawerFooter.js");
const index_ts_1 = require("./styles/index.js");
const debug_ts_1 = require("./debug.js");
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
const aionui_compat_ts_1 = require("./effects/aionui-compat.js");
const stats_line_ts_1 = require("./effects/stats-line.js");
const composer_toggle_ts_1 = require("./effects/composer-toggle.js");
const pager_ts_1 = require("./effects/pager.js");
const locales_ts_1 = require("./locales.js");
/** Required services (cordis fiber inject — the loader passes all module exports as an object plugin). */
exports.inject = ['slots', 'layout', 'locale', 'sessionLogDownload'];
/**
 * Mobile-adaptive shell, browser half: injects the mobile stylesheet, then
 * contributes the directory toggle to the session header and the backdrop +
 * floating button to the shell overlay.
 * @param ctx - client root context.
 */
function apply(ctx) {
    ctx.effect(() => ctx.locale.register(locales_ts_1.NS, { zh: locales_ts_1.zh, en: locales_ts_1.en }), 'dsh-mobile-nav: dictionaries');
    ctx.effect(() => {
        const tag = document.createElement('style');
        tag.dataset.plugin = '@dsh-external/dsh-mobile-nav';
        tag.dataset.pluginCss = '@dsh-external/dsh-mobile-nav/mobile.css';
        tag.textContent = index_ts_1.MOBILE_CSS;
        document.head.appendChild(tag);
        return () => {
            tag.remove();
        };
    }, 'dsh-mobile-nav: styles');
    // Diagnostic overlay for phone-side repros (?mobile-nav-debug=1).
    (0, debug_ts_1.installDebugBadge)(ctx);
    (0, phone_chrome_ts_1.installPhoneChrome)(ctx);
    (0, aionui_compat_ts_1.installAionuiCompat)(ctx);
    (0, stats_line_ts_1.installStatsLine)(ctx);
    (0, composer_toggle_ts_1.installComposerToggle)(ctx);
    // PiUI pager (ported from @dsh-external/dsh-mobile): turns the AppFrame
    // into a horizontal scroll-snap pager — an always-open sidebar/history
    // page and a full-width chat page. The sidebar is expanded once below the
    // breakpoint; swiping flips between the two pages.
    ctx.effect(() => {
        const controller = new pager_ts_1.PagerController({
            toggleSidebar: () => ctx.layout.toggleSidebar(),
        });
        controller.mount();
        return () => controller.dispose();
    }, 'dsh-mobile-nav: pager');
    ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
        name: 'conversation.session.header.actions',
        id: 'mobile-nav-toggle',
        order: 10,
        locale: locales_ts_1.NS,
        inject: () => ({
            toggleSidebar: () => ctx.layout.toggleSidebar(),
        }),
    }, MobileNavToggle_tsx_1.MobileNavToggle));
    ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'mobile-nav-overlay',
        order: 10,
        locale: locales_ts_1.NS,
        inject: () => ({
            toggleSidebar: () => ctx.layout.toggleSidebar(),
        }),
    }, MobileNavOverlay_tsx_1.MobileNavOverlay));
    // Session log download, relocated from the session header to the drawer
    // footer on mobile (the header capsule is hidden by CSS); the drawer
    // footer also hosts the Files action that opens the dsh-web-ui explorer
    // sheet.
    //
    // Footer stacking relies on the list-slot sort by (priority, order):
    // dsh-remote-web-ui leaves it unset (default 0, its two icon buttons stay
    // on top) and dsh-usage-stats uses 10. Order 5 keeps the Files + Session
    // log pills directly under the icon row with the usage/balance badge
    // below them — instead of a tie at 10 where registration order could
    // wedge the badge between the icons and the pills.
    ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
        name: 'sidebar.footer.action',
        id: 'mobile-nav-session-log',
        order: 5,
        locale: locales_ts_1.NS,
        inject: () => ({
            downloadSessionLog: (sessionId) => ctx.sessionLogDownload.download(sessionId),
            toggleSidebar: () => ctx.layout.toggleSidebar(),
        }),
    }, MobileDrawerFooter_tsx_1.MobileDrawerFooter));
}

};
modules["locales.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.en = exports.zh = exports.NS = void 0;
/** `mobileNav` namespace dictionaries: drawer controls. */
exports.NS = 'mobileNav';
/** Simplified Chinese dictionary (the key-set source of truth). */
exports.zh = {
    'open': '打开目录',
    'close': '收起目录',
    'backdrop': '点击关闭目录',
    'sessionLog': '导出会话日志',
    'files': '文件浏览',
    'previewFullscreen': '全屏预览',
    'previewExitFullscreen': '退出全屏',
};
/** English dictionary, key-identical to the Chinese source of truth. */
exports.en = {
    'open': 'Open directory',
    'close': 'Close directory',
    'backdrop': 'Click to close directory',
    'sessionLog': 'Session log',
    'files': 'Files',
    'previewFullscreen': 'Fullscreen preview',
    'previewExitFullscreen': 'Exit fullscreen',
};

};
modules["styles/base.css.js"] = function(require, module, exports) {
"use strict";
// base — split from src/client/mobile.css.ts (2026-08-16), order preserved.
// Do not reorder: styles/index.ts concatenates in this exact order.
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASE_CSS = void 0;
exports.BASE_CSS = `
/* ---------- base control styles (rendered at any width, hidden where unused) ---------- */

[data-mobile-nav="toggle"],
[data-mobile-nav="files"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: none;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--dsw-alias-label-secondary, inherit);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
[data-mobile-nav="toggle"]:hover,
[data-mobile-nav="files"]:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, .06));
}
[data-mobile-nav="toggle"]:focus-visible,
[data-mobile-nav="files"]:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary, #4f6ef7);
  outline-offset: 1px;
}

/* Drawer footer actions: the relocated Session log download plus the Files
   action that opens the dsh-web-ui explorer sheet. */
[data-mobile-nav="drawer-actions"] {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
[data-mobile-nav="session-log"],
[data-mobile-nav="explorer"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, .12));
  border-radius: 12px;
  background: transparent;
  color: var(--dsw-alias-label-primary, inherit);
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
[data-mobile-nav="session-log"]:hover:not(:disabled),
[data-mobile-nav="explorer"]:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, .06));
}
[data-mobile-nav="session-log"]:disabled {
  color: var(--dsw-alias-label-dimmed, rgba(0, 0, 0, .35));
  cursor: default;
}

/* Floating fallback button (hero / blank phases without a session header).
   The top clears the camera band below the status bar; when the client has
   set viewport-fit=cover the safe-area inset moves it below the notch too. */
[data-mobile-nav="fab"] {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 72px);
  left: 10px;
  z-index: 21;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, .12));
  border-radius: 50%;
  background: var(--dsw-alias-button-floating-fill, #ffffff);
  color: var(--dsw-alias-label-primary, inherit);
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, .18);
  -webkit-tap-highlight-color: transparent;
}
[data-mobile-nav="fab"]:hover {
  background: var(--dsw-alias-button-floating-hover, rgba(0, 0, 0, .08));
}
[data-mobile-nav="fab"]:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary, #4f6ef7);
  outline-offset: 2px;
}

/* Dimmed backdrop under the open drawer; above every column, below the drawer. */
[data-mobile-nav="backdrop"] {
  position: absolute;
  inset: 0;
  z-index: 30;
  background: rgba(0, 0, 0, .45);
  cursor: pointer;
  animation: dsh-mobile-nav-fade .2s var(--ds-ease-in-out, ease-in-out);
  -webkit-tap-highlight-color: transparent;
}
@keyframes dsh-mobile-nav-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* Settings sheet entrance: the official dialog mounts with no animation at
   all, so it snaps in. Fade + slight rise/scale reads as a proper sheet. */
@keyframes dsh-mobile-nav-sheet-in {
  from {
    opacity: 0;
    transform: translateY(14px) scale(.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
/* Preview sheet rise: the aionui preview column opens as a bottom sheet. */
@keyframes dsh-mobile-nav-sheet-up {
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
`;

};
modules["styles/compat.css.js"] = function(require, module, exports) {
"use strict";
// compat — split from src/client/mobile.css.ts (2026-08-16), order preserved.
// Do not reorder: styles/index.ts concatenates in this exact order.
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPAT_CSS = void 0;
exports.COMPAT_CSS = `  /* ---------- dsh-web-ui family compatibility ----------
     The linxin666 plugin suite extends the shell frame directly:
       - aionui-panel appends two trailing grid columns (explorer / preview)
         plus absolute drag handles to [data-dsh-frame]; its 5-track inline
         grid is already overridden above, but the handles and columns would
         still float over the main UI. On mobile the columns leave the grid
         as floating bottom sheets and keep their own visibility state —
         the suite's collapse chevron / preview tabs still work, so no
         feature is lost. The task-board / ssh plugins inject sidebar
         entries and center-column takeover panels; the entries need
         spacing and the kanban needs scrollable columns. */

  /* Touch devices: the drag handles are useless — the floating expand
     button is the opener. */
  .aionui-explorer-handle,
  .aionui-preview-handle {
    display: none !important;
  }

  /* Shared base: both columns leave the grid as floating panels. The
     explorer is gated shut by default (its own persisted expanded state
     must never cover the mobile UI on load); the header Files action opens
     it via the frame marker below, and the sheet's own collapse chevron
     clears it. Preview stays owned by the suite (hidden while no tab is
     open). The per-column rules below override the geometry. */
  [data-aionui-explorer-col],
  [data-aionui-preview-col] {
    position: fixed !important;
    z-index: 55 !important;
    background: var(--aion-bg-base, #ffffff) !important;
    border-left: none !important;
  }
  /* Explorer (file tree) bottom sheet: bottom edge aligned exactly with
     the composer card's bottom line — the card sits 36px above the
     viewport bottom (8px composer padding + the 28px stats strip below
     the card), so the sheet uses the same 36px bottom offset. */
  [data-aionui-explorer-col] {
    visibility: hidden !important;
    left: 8px !important;
    right: 8px !important;
    top: auto !important;
    bottom: 36px !important;
    width: auto !important;
    height: min(55dvh, 460px) !important;
    max-height: calc(100dvh - 44px) !important;
    border-radius: 14px !important;
    overflow: hidden !important;
    box-shadow: 0 -4px 28px rgba(0, 0, 0, .18) !important;
    animation: none !important;
  }
  /* Preview (file content) bottom sheet. Gated shut by default: the suite
     persists open preview tabs in localStorage and restores them on load,
     which would pop the sheet over the fresh UI. The client only sets the
     frame marker after the user taps a file row in the explorer; the
     suite's own collapse chevron clears it via the visibility watcher. */
  [data-aionui-preview-col] {
    visibility: hidden !important;
    position: fixed !important;
    left: 8px !important;
    right: 8px !important;
    top: auto !important;
    bottom: 40px !important;
    width: auto !important;
    height: min(50dvh, 420px) !important;
    max-height: calc(100dvh - 48px) !important;
    border-radius: 14px !important;
    overflow: hidden !important;
    box-shadow: 0 -4px 28px rgba(0, 0, 0, .18) !important;
    z-index: 56 !important;
    animation: none !important;
    /* Fullscreen toggle (issue #8): animate the geometry change instead of
       snapping. visibility is deliberately not listed, so opening/closing
       the sheet stays instant; the open/close keyframes own transform. */
    transition:
      left .24s var(--ds-ease-out, ease-in-out),
      right .24s var(--ds-ease-out, ease-in-out),
      top .24s var(--ds-ease-out, ease-in-out),
      bottom .24s var(--ds-ease-out, ease-in-out),
      width .24s var(--ds-ease-out, ease-in-out),
      height .24s var(--ds-ease-out, ease-in-out),
      border-radius .24s var(--ds-ease-out, ease-in-out),
      box-shadow .24s var(--ds-ease-out, ease-in-out),
      padding-top .24s var(--ds-ease-out, ease-in-out) !important;
  }
  /* User-opened preview sheet (frame marker, set on file-row tap). */
  [data-mobile-nav="frame"][data-aionui-preview-open] [data-aionui-preview-col] {
    visibility: visible !important;
  }
  /* The Files action opens the explorer sheet (frame marker). */
  [data-mobile-nav="frame"][data-aionui-explorer-open] [data-aionui-explorer-col] {
    visibility: visible !important;
  }
  /* While the preview sheet is up, the explorer sheet yields (two stacked
     bottom sheets would read as one broken overlay). Closing the preview
     via its collapse chevron / tab close clears the marker, and the
     explorer sheet returns. Same specificity as the explorer-open rule, so
     this must stay AFTER it. */
  [data-mobile-nav="frame"][data-aionui-preview-open] [data-aionui-explorer-col] {
    visibility: hidden !important;
  }
  /* The open drawer must never sit under a sheet: while the frame is in the
     narrow-expanded state both sheets yield (later in the file than the
     open marker rule, so it wins at equal specificity). The fullscreen
     toggle has its own drawer-open rule at the end of its section. */
  [data-mobile-nav="frame"]:not([data-sidebar-collapsed]) [data-aionui-explorer-col],
  [data-mobile-nav="frame"]:not([data-sidebar-collapsed]) [data-aionui-preview-col] {
    visibility: hidden !important;
    display: none !important;
  }
  /* The suite's own expand button reads the store state we bypass on
     mobile — hide it; the header Files action is the opener. */
  .aionui-floating-expand {
    display: none !important;
  }

  /* Preview sheet fullscreen toggle (issue #8): a fixed button parked in the
     sheet's titlebar row, just left of the suite's collapse chevron (24px at
     right:8px of the sheet, and the sheet spans 8px..(100vw-8px)). The top
     calc mirrors the sheet geometry above (bottom 40px + min(50dvh, 420px));
     when the frame carries "data-mobile-preview-full" the sheet goes
     fullscreen and the button moves to the viewport corner. */
  [data-mobile-nav="preview-full-toggle"] {
    position: absolute !important;
    right: 36px !important;
    top: 8px !important;
    z-index: 57 !important;
    display: none !important;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--aion-text-secondary, var(--dsw-alias-label-secondary, inherit));
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    /* Native look: same size/radius/hover language as the suite's tab-bar
       icon buttons (the 20px panelCollapse next to it). The button lives
       INSIDE the preview column, so it rides the sheet's own open
       animation and geometry transition — no curve matching needed. */
    transition: background-color .15s, top .24s var(--ds-ease-out, ease-in-out);
  }
  [data-mobile-nav="preview-full-toggle"]:hover {
    background: var(--aion-bg-3, rgba(0, 0, 0, .22));
  }
  [data-mobile-nav="preview-full-toggle"]:active {
    background: var(--aion-bg-active, rgba(0, 0, 0, .28));
  }
  [data-mobile-nav="preview-full-toggle"]:focus-visible {
    outline: 2px solid var(--dsw-alias-state-business-primary, #4f6ef7);
    outline-offset: 2px;
  }
  [data-mobile-nav="preview-full-toggle"] svg {
    width: 14px;
    height: 14px;
  }
  /* Keep the last tab (and the "+" URL-tab trigger) from sliding under the
     fullscreen toggle: reserve the right end of the preview tab row. */
  [data-aionui-preview-col] [class$="_tabScroll"] {
    padding-right: 34px !important;
  }
  /* Visible only while the preview sheet is open. Visibility itself is
     inherited from the column, so the sheet's own hide rules (collapse,
     drawer open) cover the button too. */
  [data-mobile-nav="frame"][data-aionui-preview-open] [data-aionui-preview-col] [data-mobile-nav="preview-full-toggle"] {
    display: inline-flex !important;
  }
  /* Icon swap on the frame fullscreen marker. */
  [data-mobile-nav="preview-full-toggle"] .dsh-mobile-nav-full-out {
    display: none !important;
  }
  [data-mobile-nav="frame"][data-mobile-preview-full] [data-aionui-preview-col] [data-mobile-nav="preview-full-toggle"] .dsh-mobile-nav-full-in {
    display: none !important;
  }
  [data-mobile-nav="frame"][data-mobile-preview-full] [data-aionui-preview-col] [data-mobile-nav="preview-full-toggle"] .dsh-mobile-nav-full-out {
    display: inline !important;
  }
  /* Fullscreen preview: the sheet fills the whole viewport (notch included);
     the safe-area padding drops the titlebar row below the status bar, and
     the toggle follows the titlebar into the top corner. */
  [data-mobile-nav="frame"][data-aionui-preview-open][data-mobile-preview-full] [data-aionui-preview-col] {
    inset: 0 !important;
    left: 0 !important;
    right: 0 !important;
    top: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100dvh !important;
    max-height: none !important;
    box-sizing: border-box !important;
    padding-top: env(safe-area-inset-top, 0px) !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    z-index: 57 !important;
    animation: none !important;
  }
  /* Fullscreen: the column fills the viewport, so the button follows the
     titlebar row down below the notch. */
  [data-mobile-nav="frame"][data-mobile-preview-full] [data-aionui-preview-col] [data-mobile-nav="preview-full-toggle"] {
    top: calc(env(safe-area-inset-top, 0px) + 8px) !important;
  }
  @media (prefers-reduced-motion: reduce) {
    [data-aionui-preview-col],
    [data-mobile-nav="preview-full-toggle"] {
      transition: none !important;
      animation: none !important;
    }
  }

  /* dsh-web-ui sidebar entries (task board / ssh) sit flush against each
     other — give the injected rows breathing room. */
  button[data-dsh-taskboard-entry],
  button[data-dsh-ssh-entry] {
    margin-bottom: 8px !important;
  }

  /* Task board: five kanban columns at minmax(0,1fr) crush into ~78px phone
     strips. Give every column a usable minimum and let the row scroll. */
  [data-dsh-taskboard-board] > [class$="_columns"] {
    grid-template-columns: repeat(5, minmax(240px, 1fr)) !important;
    overflow-x: auto !important;
  }
  /* The floating button must not float over a takeover panel (task board /
     ssh own the center column while active). */
  html[data-dsh-taskboard-active] [data-mobile-nav="fab"],
  html[data-dsh-ssh-active] [data-mobile-nav="fab"],
  html[data-dsh-taskboard-active] [data-mobile-nav="backdrop"],
  html[data-dsh-ssh-active] [data-mobile-nav="backdrop"] {
    display: none !important;
  }
  /* Board header: let the search field take the slack instead of squeezing
     the action buttons. */
  [data-dsh-taskboard-board] > [class$="_boardHeader"] [class$="_search"] {
    flex: 1 1 auto !important;
    min-width: 80px !important;
  }

  /* ---------- dsh-web-ui polish: plugin market search ----------
     The market tab row (Discover / Themes / Installed + the plugin search
     box) is a no-wrap flex: at 390px the tabs plus the ~218px search box
     (~475px total) overflow the ~334px sheet and the search box runs off
     the right edge of the screen (it also forces a horizontal scrollbar on
     the sheet's options area). Let the row wrap: the tabs keep the first
     line and the search box gets its own full-width second line. */

  [aria-modal="true"] [class$="_tabs"] {
    flex-wrap: wrap !important;
    row-gap: 8px !important;
  }
  [aria-modal="true"] [class$="_searchInline"] {
    flex: 1 1 100% !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  /* ---------- dsh-usage-stats polish: usage & balance panel ----------
     The panel's stats row shows three token counters side by side
     (today / month / total). The counters use tabular nowrap figures whose
     min-content width overflows the ~336px panel body on a phone: figures
     clip at the row's edges and the panel grows a horizontal scrollbar.
     Stack the three counters vertically — full-width rows, so the figures
     always fit. */

  [class*="usg_"][class$="_statsRow"] {
    flex-direction: column !important;
  }
  [class*="usg_"][class$="_stat"] {
    flex: 0 0 auto !important;
    width: 100% !important;
    min-width: 0 !important;
  }

  /* ---------- dsh-web-ui polish: settings sheet ----------
     The official dialog is a desktop two-column form; on a phone the
     label/control split leaves a huge dead gap and long descriptions wrap
     into tall stacks. Stack each row (text above, control full-width) and
     keep the nav tabs on ONE horizontally scrolling row. */

  /* Nav tabs: single scrolling row instead of the 3-per-row grid — seven
     categories wrap into three rows on a phone (~130px of sheet height);
     one row with a thin scrollbar keeps every tab reachable and returns
     that space to the options area (user feedback 2026-08-16). An earlier
     one-row attempt had no scroll affordance and silently cut the last
     tab off; the thin scrollbar IS the affordance. Scoped to the frame
     marker: the desktop dialog keeps its official vertical nav column. */
  [data-mobile-nav="frame"] [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :first-child [class$="_navList"] {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    gap: 6px !important;
    width: 100% !important;
    scrollbar-width: thin !important;
    -webkit-overflow-scrolling: touch !important;
  }
  /* Hairline scrollbar for the tab row: the default WebKit scrollbar reads
     fat on a phone; 2px keeps the scroll affordance without the bulk. */
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_navList"]::-webkit-scrollbar {
    height: 2px !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_navList"]::-webkit-scrollbar-thumb {
    background: var(--dsw-alias-border-l2, rgba(0, 0, 0, .22)) !important;
    border-radius: 1px !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_navList"]::-webkit-scrollbar-track {
    background: transparent !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_navCell"] {
    flex: 0 0 auto !important;
    white-space: nowrap !important;
    padding: 6px 8px !important;
    gap: 6px !important;
    font-size: 13px !important;
    justify-content: flex-start !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_navCell"] svg {
    width: 14px !important;
    height: 14px !important;
    flex: none !important;
  }
  /* Content toolbar: the "Open configuration file" button is hidden on
     mobile — it is rarely needed on a phone and steals ~180px from the
     tab row's scroll area (user feedback 2026-08-16). Only the close ✕
     stays, flush right in the nav row. Desktop untouched (frame scoped). */
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_header"] [class$="_actions"] {
    display: none !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_header"] [class$="_actions"] [class$="_action"] {
    font-size: 13px !important;
    padding: 6px 12px !important;
    min-height: 0 !important;
  }
  /* Setting rows: text on top, control below at full width. */
  [aria-modal="true"] [class$="_section"] [class$="_row"] {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 8px !important;
  }
  [aria-modal="true"] [class$="_section"] [class$="_row"] > :first-child {
    width: 100% !important;
    max-width: none !important;
  }
  [aria-modal="true"] [class$="_section"] [class$="_row"] > :last-child {
    width: 100% !important;
    max-width: none !important;
  }
  /* Appearance mode group: give the cube row a consistent bordered
     segmented look (the official borders differ per state). */
  [aria-modal="true"] [class$="_cubeRow"] > * {
    border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, .12)) !important;
  }

  /* ---------- dsh-web-ui polish: explorer sheet ----------
     The aionui explorer was designed for a desktop side column: compact the
     header, search box and tree rows so a phone shows more entries, and pad
     the scroll bottom so the last row never sits flush on the edge. */

  [data-aionui-explorer-col] [class$="_tabBar"] {
    height: 36px !important;
  }
  [data-aionui-explorer-col] [class$="_tabBtn"],
  [data-aionui-explorer-col] [class$="_tabBtnActive"] {
    padding: 0 12px !important;
    font-size: 13px !important;
  }
  [data-aionui-explorer-col] [class$="_searchBox"] {
    height: 32px !important;
    font-size: 13px !important;
  }
  [data-aionui-explorer-col] [class*="_treeRow"] {
    height: 30px !important;
    font-size: 13px !important;
  }
  [data-aionui-explorer-col] [class*="_treeRow"] svg {
    width: 14px !important;
    height: 14px !important;
  }
  [data-aionui-explorer-col] [class$="_scrollArea"] {
    padding-bottom: 28px !important;
  }

  /* ---------- dsh-web-ui polish: drawer footer ----------
     The injected footer actions (Files + Session log) become two equal pill
     buttons instead of text-width capsules. */

  /* The official footerActions row also hosts the remote-web-ui entry
     row (two icon buttons); without wrapping the two groups squeeze each
     other on one line. Wrap so each group gets its own full-width row. */
  [data-mobile-nav="frame"] [class$="_footerActions"] {
    flex-wrap: wrap !important;
    gap: 6px !important;
  }
  [data-mobile-nav="drawer-actions"] {
    width: 100% !important;
  }
  [data-mobile-nav="drawer-actions"] > button {
    flex: 1 1 0 !important;
    padding: 0 8px !important;
    white-space: nowrap !important;
  }

  /* ---------- dsh-web-ui polish: floating pet ----------
     The whale-girl pet (dsh-pet) floats at the viewport corner with a
     persisted, draggable position. On phones the pet is scaled down so
     it does not dominate the screen; the plugin's own drag + persist
     still work (the position itself is left alone — the mobile default
     position is seeded via the pet API to just above the composer). */

  body > [class$="_float"]:has([class$="_sprite"][role="button"]) {
    transform: scale(.66);
    transform-origin: bottom right;
  }
  /* While a modal dialog (settings sheet / export) owns the screen the pet
     floats ABOVE it and covers the dialog content; modal semantics say the
     background is inert, so hide the pet for the modal's lifetime. */
  body:has([aria-modal="true"]) > [class$="_float"]:has([class$="_sprite"][role="button"]) {
    display: none !important;
  }

  /* ---------- dsh-web-ui polish: conversation stats line ----------
     The official session-status row (turns / steps / LLM time / TTFT /
     cache) is long. The client marks the exact row with
     [data-mobile-nav="stats"] (text-anchored, hashed classes can't be
     targeted). Layout: ONE fixed-height (28px) flex strip that scrolls
     horizontally — the full metrics stream stays reachable by swiping,
     the row never grows vertically, no ellipsis or fade, 12px gaps
     between metric groups, a 2px scrollbar as the swipe affordance. */

  [data-mobile-nav="stats"] {
    display: flex !important;
    flex-flow: row nowrap !important;
    align-items: center !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: 28px !important;
    min-height: 28px !important;
    max-height: 28px !important;
    box-sizing: border-box !important;
    white-space: nowrap !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    scrollbar-width: thin !important;
    scrollbar-color: var(--dsw-alias-border-l1, rgba(0, 0, 0, .28)) transparent !important;
    padding: 0 0 4px !important;
    line-height: 20px !important;
    font-size: 12px !important;
  }
  [data-mobile-nav="stats"]::-webkit-scrollbar {
    height: 2px !important;
  }
  [data-mobile-nav="stats"]::-webkit-scrollbar-thumb {
    background: var(--dsw-alias-label-tertiary, rgba(0, 0, 0, .3)) !important;
    border-radius: 2px !important;
  }
  [data-mobile-nav="stats"]::-webkit-scrollbar-track {
    background: transparent !important;
  }
  [data-mobile-nav="stats"] > * {
    display: flex !important;
    flex: 0 0 auto !important;
    flex-flow: row nowrap !important;
    align-items: center !important;
    width: max-content !important;
    min-width: max-content !important;
    max-width: none !important;
    white-space: nowrap !important;
    margin-right: 12px !important;
    padding: 0 !important;
  }
  [data-mobile-nav="stats"] > *:last-child {
    margin-right: 0 !important;
  }
  [data-mobile-nav="stats"] * {
    white-space: nowrap !important;
  }

  /* ---------- dsh-genui panel dock ----------
     The genui panel docks above the composer (conversation.input.dock,
     id genui-panel). On a phone its business-blue outline, generous chrome
     and single-line ellipsis read as an unfinished artifact: long titles
     truncate mid-word ("…default b···") with the chevron glued to the
     ellipsis, and the pill crowds the composer. Mobile treatment: neutral
     card border matching the composer, tighter chrome so the full title
     fits, chevron with breathing room. Scoped to the mobile frame marker —
     desktop keeps genui's own styling untouched. */

  [data-mobile-nav="frame"] [data-genui-panel] {
    margin: 6px 12px 4px !important;
    border-color: var(--dsw-alias-border-l1, rgba(0, 0, 0, .12)) !important;
    border-radius: 12px !important;
  }
  [data-mobile-nav="frame"] [data-genui-panel] [class*="_panelToggle"] {
    padding: 7px 12px !important;
    gap: 8px !important;
  }
  [data-mobile-nav="frame"] [data-genui-panel] [class*="_panelBadge"] {
    padding: 0 7px !important;
    border-radius: 5px !important;
    font-size: 10.5px !important;
    line-height: 1.7 !important;
  }
  [data-mobile-nav="frame"] [data-genui-panel] [class*="_panelTitle"] {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    font-size: 12.5px !important;
    line-height: 1.45 !important;
  }
  [data-mobile-nav="frame"] [data-genui-panel] [class*="_panelChevron"] {
    flex: none !important;
    margin-left: 0 !important;
    padding-left: 4px !important;
  }

  /* ---------- git-graph branch chip: inside the composer card ----------
     The branch chip (conversation.input.dock) floats between the dock rows
     and the input card; on a phone it reads as a stray capsule crowding the
     composer. A client effect (MobileNavOverlay) reparents the chip INTO
     the composer card; these rules pin it to the card's top-left and give
     the card a dedicated chip row. The card is position: relative by the
     official stylesheet, so the absolute anchor resolves against it. The
     plugin's own sheet sets all four offsets on the anchor, so right/bottom
     must be neutralized too. Scope is the frame marker + the anchor
     attribute (NOT the dock slot — the reparenting moves the chip out of
     the dock's subtree). Desktop untouched: the frame marker only exists
     below 1024px, and the effect restores the chip to the dock when the
     viewport widens. Chip row geometry (2026-08-16, user feedback): 48px
     padding left a 16px dead gap between the chip and the input line and
     made the composer read too tall; the row is now 40px = chip (24px) at
     top 12px + ~4px to the textarea — the chip sits slightly lower and
     the gap is compressed without touching the official height budget
     further. */

  [data-mobile-nav="frame"] [data-gitgraph-chip-anchor] {
    position: absolute !important;
    top: 12px !important;
    left: 12px !important;
    right: auto !important;
    bottom: auto !important;
    z-index: 1 !important;
  }
  [data-mobile-nav="frame"] [class$="_card"]:has([data-gitgraph-chip-anchor]) {
    padding-top: 40px !important;
  }
`;

};
modules["styles/index.js"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOBILE_CSS = void 0;
const base_css_ts_1 = require("./base.css.js");
const layout_css_ts_1 = require("./layout.css.js");
const compat_css_ts_1 = require("./compat.css.js");
const misc_css_ts_1 = require("./misc.css.js");
/**
 * All mobile styles, concatenated in the exact order of the original
 * single-file stylesheet (base → layout → compat → misc, where misc keeps
 * composer → tablet → desktop). Injected as ONE <style data-plugin> tag —
 * do not reorder.
 */
exports.MOBILE_CSS = [base_css_ts_1.BASE_CSS, layout_css_ts_1.LAYOUT_CSS, compat_css_ts_1.COMPAT_CSS, misc_css_ts_1.MISC_CSS].join('\n');

};
modules["styles/layout.css.js"] = function(require, module, exports) {
"use strict";
// layout — split from src/client/mobile.css.ts (2026-08-16), order preserved.
// PiUI pager structure ported from @dsh-external/dsh-mobile (lehhair/dsh-mobile)
// and adapted to the `[data-mobile-nav="frame"]` marker + 1023px breakpoint.
// Do not reorder: styles/index.ts concatenates in this exact order.
Object.defineProperty(exports, "__esModule", { value: true });
exports.LAYOUT_CSS = void 0;
exports.LAYOUT_CSS = `/* ---------- mobile-only layout ---------- */

/* --- PiUI pager tokens (scoped to the frame) --- */
[data-mobile-nav="frame"] {
  /* Safe-area insets (notched phones, standalone PWA). env() resolves to
     0px in browsers without the concept. */
  --dshm-safe-top: env(safe-area-inset-top, 0px);
  --dshm-safe-right: env(safe-area-inset-right, 0px);
  --dshm-safe-bottom: env(safe-area-inset-bottom, 0px);
  --dshm-safe-left: env(safe-area-inset-left, 0px);
  /* Virtual-keyboard inset, driven by the pager controller (visualViewport). */
  --dshm-keyboard-inset: 0px;
  /* Sidebar page width (phones): at least the sidebar's own 280px content
     width, at most 360px, with ~70vw — the chat card then shows only a
     sliver on the right (PiUI's overlayWidth idea). Wide mobile screens
     (561-1023px) override this token below so the page grows toward half
     the viewport. */
  --dshm-sidebar-width: clamp(280px, 70vw, 360px);
  -webkit-tap-highlight-color: transparent;
}

@media (max-width: 1023px) {
  /* --- Phone chrome ---
     The system status bar stays visible (no fullscreen). Two adjustments
     make it behave:
     - touch-action: manipulation kills double-tap-to-zoom (and the 300ms
       tap delay) while keeping pan and pinch zoom.
     - With the client's viewport-fit=cover, env(safe-area-inset-top) is the
       status bar / notch height; the rules below push the app content below
       it so the status bar never covers anything. */
  html,
  body {
    touch-action: manipulation !important;
  }

  /* --- PiUI pager (sub-desktop viewports) ---
     The AppFrame keeps at least one of its two data attributes in every
     state; the union selects the frame on any viewport. Reflow the grid
     tracks into two snap pages: the sidebar page at the half-open width,
     the chat page full-width (so the chat stays visible beside the
     sidebar), the details track dropped (no phone use). */
  [data-mobile-nav="frame"] {
    position: relative !important;
    grid-template-columns: var(--dshm-sidebar-width) 100% 0 !important;
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    transition: none !important;
    /* The top padding clears the status bar / notch for every in-flow
       surface (session header, messages, composer). */
    padding-top: env(safe-area-inset-top, 0px) !important;
  }

  /* Hide the pager's own horizontal scrollbar on every engine. */
  [data-mobile-nav="frame"]::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }

  /* The two live pages snap to the scrollport start (scroll-snap-stop keeps
     a fast swipe from skipping a page). */
  [data-mobile-nav="frame"] > :nth-child(-n+2) {
    scroll-snap-align: start;
    scroll-snap-stop: normal;
  }

  /* Sidebar page: a plain page sharing the chat background — flat, no card
     treatment and no divider line against the chat — with safe-area top so
     its controls clear the notch. The chat card's radius and shadow are
     what separate the two (PiUI). */
  [data-mobile-nav="frame"] > :first-child {
    position: static !important;
    inset: auto !important;
    background: var(--dsw-alias-bg-base, #ffffff);
    border-right: none !important;
    padding-top: var(--dshm-safe-top);
    z-index: auto !important;
    transform: none !important;
    transition: none !important;
    max-width: none !important;
  }

  /* The sidebar shell's own fill is reset to transparent — across the one or
     two wrapper levels the shell tree may insert between the frame column and
     the sidebar root — so every layer of the sidebar page matches the chat
     background. Deeper elements keep their own states untouched. */
  [data-mobile-nav="frame"] > :first-child > :first-child,
  [data-mobile-nav="frame"] > :first-child > :first-child > :first-child {
    background: transparent;
  }

  /* The sidebar shell freezes its content at the expanded desktop width
     (inline style); the phone layout keeps the sidebar open, so that frozen
     width would leave the right side of the page empty on wide screens.
     Min-width (not width) stretches the shell to fill the page column. */
  [data-mobile-nav="frame"] > :first-child div[style*='width'] {
    min-width: 100%;
  }

  /* The session list's bottom scroll fade is a desktop affordance; on the
     always-open phone sidebar it just dims the tail of the list. */
  [data-mobile-nav="frame"] > :first-child div:has(> [role='tree']) > span {
    display: none;
  }

  /* Keep snap targets untransformed. A live radius would repaint the
     whole chat on every swipe frame, which flashes the messages and input. */
  [data-mobile-nav="frame"] > :nth-child(2) {
    border: none;
    border-radius: 0;
    overflow: clip;
    background: var(--dsw-alias-bg-base, #ffffff);
    box-shadow: none;
  }

  /* Drag handles are desktop-only affordances. */
  [data-side="sidebar"],
  [data-side="details"] {
    display: none !important;
  }

  /* Session header: compact with a safe-area top. */
  [data-mobile-nav="frame"] [data-phase="active"] > header {
    padding: calc(6px + var(--dshm-safe-top)) 8px 0 8px;
  }

  /* Conversation column: snugger side clearance for the composer card.
     Desktop's 680px minimum content width overflows a phone column and the
     clipped overflow flashes while the pager scrolls. */
  [data-mobile-nav="frame"] [data-phase] {
    --dsh-composer-side-clearance: 12px;
    --dsh-chat-user-width: 100% !important;
    --dsh-chat-content-width: 100% !important;
    --dsh-composer-card-max-width: 100% !important;
  }

  /* Sticky composer seat: lift the input card above the home indicator and
     the virtual keyboard. */
  [data-mobile-nav="frame"] [data-composer-seat] {
    padding-bottom: calc(var(--dshm-safe-bottom) + var(--dshm-keyboard-inset));
  }

  [data-mobile-nav="frame"] [data-mobile-nav="composer-toggle"] {
    appearance: none;
    border: 0;
    border-radius: 999px;
    background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, .06));
    color: var(--dsw-alias-label-secondary, #444);
    min-height: 32px;
    margin: 4px 12px 0;
    width: calc(100% - 24px);
    font-size: 12px;
    line-height: 16px;
  }

  [data-mobile-nav="frame"][data-dshm-composer="collapsed"] [data-composer-seat] > :not([data-mobile-nav="composer-toggle"]) {
    display: none !important;
  }

  /* Hidden scrollbars are the norm on phones: no reserved gutter, no bars.
     Clip horizontal overflow so a wide message cannot become a second pager. */
  [data-mobile-nav="frame"] [data-conversation-scroll] {
    scrollbar-gutter: auto;
    overflow-x: clip;
  }

  /* Touch targets in the control regions get a comfortable hit height. */
  [data-mobile-nav="frame"] [data-phase="active"] > header button,
  [data-mobile-nav="frame"] [data-composer-card] button,
  [data-mobile-nav="frame"] [role="treeitem"] button {
    min-height: 36px;
  }

  /* --- Model-name marquee (PiUI) ---
     The model label absorbs the trigger's free width (see the composer
     rules below); when the name overflows its capped width, the controller
     wraps a double copy in a [data-dshm-marquee-runner] layer and tags the
     label with data-dshm-marquee + --dshm-marquee-duration. */
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] button[aria-haspopup="menu"] > span:first-child {
    max-width: 96px;
    min-width: 48px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] button[aria-haspopup="menu"] > span:first-child > [data-dshm-marquee-runner] {
    display: inline-block;
    white-space: nowrap;
  }
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] [data-dshm-marquee-runner] > [data-dshm-marquee-item] {
    display: inline-block;
    white-space: nowrap;
    padding-right: 32px;
  }
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] button[aria-haspopup="menu"] > span:first-child[data-dshm-marquee] > [data-dshm-marquee-runner] {
    animation: dshm-marquee var(--dshm-marquee-duration, 8s) linear infinite;
  }
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] button[aria-haspopup="menu"] > span:first-child[data-dshm-marquee]:hover > [data-dshm-marquee-runner],
  [data-mobile-nav="frame"][data-dshm-moving] [data-dshm-marquee-runner] {
    animation-play-state: paused;
  }
  @keyframes dshm-marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  /* Wide mobile / tablet (561-1023px — landscape phones, large foldables,
     small tablets): the sidebar page grows past the phone cap toward HALF
     the viewport (50vw, capped at 420px). The model-name cap relaxes from
     96px to 160px. */
  @media (min-width: 561px) and (max-width: 1023px) {
    [data-mobile-nav="frame"] {
      --dshm-sidebar-width: clamp(360px, 50vw, 420px);
    }
    [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] button[aria-haspopup="menu"] > span:first-child {
      max-width: 160px;
    }
  }

  /* --- Conversation text on mobile ---
     The official message flow keeps desktop's 32px side gutters and 16px
     type. On a phone: shrink the type a notch and widen the lines by
     trimming the gutters. */
  [data-phase] [class$="_scrollBody"] {
    scrollbar-gutter: auto !important;
    scrollbar-width: none !important;
  }
  [data-phase] [class$="_scrollBody"]::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
  [data-phase] [class$="_actions"] {
    overflow: hidden !important;
  }
  [data-phase] [class$="_actions"] [class$="_timeEnd"] {
    flex: 0 1 auto !important;
    min-width: 0 !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }

  [data-phase] [class$="_scroll"]:has(p) {
    padding-left: 20px !important;
    padding-right: 20px !important;
    font-size: 15px !important;
  }
  [data-phase] [class$="_scroll"]:has(p) p,
  [data-phase] [class$="_scroll"]:has(p) li,
  [data-phase] [class$="_scroll"]:has(p) [class*="_text_"] {
    font-size: 15px !important;
  }

  [data-phase] table {
    width: 100% !important;
    max-width: 100% !important;
  }
  [data-phase] th,
  [data-phase] td {
    max-width: none !important;
    min-width: 0 !important;
  }

  [data-phase] [class$="_userStack"],
  [data-phase] [class$="_userStack"] [class$="_bubble"] {
    box-sizing: border-box !important;
    width: fit-content !important;
    max-width: 100% !important;
  }

  /* --- Composer bottom row on mobile ---
     The editor is a Lexical contenteditable, not a textarea, so the row is
     anchored by [data-composer-card]. Official layout: tools on the left,
     trailing (model pill + send) flex:none on the right, row wraps. A long
     model name made the trailing group as wide as its text and pushed the
     send button against the card edge. Sharing one row with the trailing
     group also squeezed the tool strip until plugin entries in the input
     slots (prompt prep, sketch, ...) were clipped behind the model pill.
     Phone layout: two rows. The tool strip gets the full first row and
     scrolls horizontally when crowded; the second row holds the model pill
     (left, ellipsizes its name) and the send button (right, never shrinks). */
  [data-mobile-nav="frame"] [data-composer-card] [class$="_row"]:has(> [class$="_trailing"]) {
    flex-wrap: wrap !important;
    column-gap: 8px !important;
    row-gap: 4px !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_row"] > [class$="_tools"] {
    flex: 1 1 100% !important;
    min-width: 0 !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scrollbar-width: none !important;
    gap: 8px !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_row"] > [class$="_tools"]::-webkit-scrollbar {
    display: none !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_row"] > [class$="_tools"] > *,
  [data-mobile-nav="frame"] [data-composer-card] [class$="_row"] > [class$="_tools"] [class$="_modes"],
  [data-mobile-nav="frame"] [data-composer-card] [class$="_row"] > [class$="_tools"] [data-slot] > * {
    flex: none !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] {
    flex: 1 1 100% !important;
    min-width: 0 !important;
    justify-content: flex-start !important;
    align-items: center !important;
    gap: 8px !important;
    margin-left: 0 !important;
  }
  /* Model pill stays left; whatever follows it (context ring, send) is
     packed to the right edge as one group. */
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > [data-slot="conversation.input.model"] + * {
    margin-left: auto !important;
  }
  /* 0.1.7 wraps the right-side slots and the model pill in a
     _standardControls group, followed by an activity slot and the send
     button. The group takes the leftover width so the model pill sits on
     the left and the send button is pushed to the right edge. */
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > [class$="_standardControls"] {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    gap: 8px !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > [class$="_standardControls"][hidden] {
    display: none !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > [class$="_activity"]:empty {
    display: none !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > [class$="_primary"],
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > [class$="_activity"] + [class$="_primary"] {
    margin-left: auto !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > [class$="_primary"] {
    flex: none !important;
  }
  /* Any model pill (official or plugin) may shrink; the reasoning-model
     pill keeps room for its effort badge and a few characters of name,
     and leaves room for the context ring and the send button. */
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] > * {
    flex: 0 1 auto !important;
    min-width: 0 !important;
    max-width: 100% !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] .dsh-reasoning-model {
    min-width: 128px !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] .dsh-reasoning-model__trigger {
    min-width: 0 !important;
    max-width: 100% !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] .dsh-reasoning-model__model {
    flex: 1 1 auto !important;
    min-width: 24px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] .dsh-reasoning-model__effort,
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] .dsh-reasoning-model__trigger > svg {
    flex: none !important;
  }

  /* --- Composer controls: one visual system on mobile ---
     The row mixes official controls (round add buttons, a borderless
     permission trigger, the send button) with plugin entries (an outlined
     prompt-prep pill, a rounded-square sketch button, the model pill) and
     the official context-usage ring, each with its own height, radius and
     fill. On a phone they read as scattered, so every control becomes the
     same 36px capsule: icon-only controls are 36px circles, labelled ones
     are pills. They use the same outline look as the drawer actions
     (transparent fill, 1px theme border) so the glass card and wallpaper
     show through. */
  [data-mobile-nav="frame"] [data-composer-card],
  [data-mobile-nav="frame"] [data-slot="conversation.composer.dock"] {
    --dshm-chip-h: 36px;
    --dshm-chip-bg: transparent;
    --dshm-chip-border: var(--dsw-alias-border-l1, rgba(180, 180, 180, .4));
    --dshm-chip-shadow: none;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_row"] > [class$="_tools"] {
    align-items: center !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] > button[class$="_add"],
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] [class$="_modes"] button[class$="_trigger"],
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] [data-slot="conversation.input.left"] > button,
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] [data-slot="conversation.input.left"] > .ghc-trigger {
    box-sizing: border-box !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 4px !important;
    height: var(--dshm-chip-h) !important;
    min-height: var(--dshm-chip-h) !important;
    min-width: var(--dshm-chip-h) !important;
    border: 1px solid var(--dshm-chip-border) !important;
    border-radius: 999px !important;
    background: var(--dshm-chip-bg) !important;
    box-shadow: var(--dshm-chip-shadow) !important;
    font-size: 13px !important;
    line-height: 1 !important;
    transform: none !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] > button[class$="_add"],
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] [data-slot="conversation.input.left"] > button:not(:has(> span + span)) {
    width: var(--dshm-chip-h) !important;
    padding: 0 !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] [class$="_modes"] button[class$="_trigger"] {
    max-width: none !important;
    padding: 0 8px 0 11px !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] [data-slot="conversation.input.left"] > button:has(> span + span) {
    padding: 0 13px !important;
  }
  /* GitHub connect: same capsule; status dot sits after the login name. */
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] [data-slot="conversation.input.left"] > .ghc-trigger {
    gap: 6px !important;
    padding: 0 12px 0 11px !important;
    color: var(--dsw-alias-label-primary, inherit) !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] .ghc-trigger .ghc-trigger-label {
    max-width: 88px !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] .ghc-trigger .ghc-dot {
    width: 7px !important;
    height: 7px !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_tools"] svg {
    width: 16px !important;
    height: 16px !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [data-slot="conversation.input.model"] .dsh-reasoning-model__trigger {
    height: var(--dshm-chip-h) !important;
    padding: 0 10px 0 12px !important;
    border: 1px solid var(--dshm-chip-border) !important;
    background: var(--dshm-chip-bg) !important;
    box-shadow: var(--dshm-chip-shadow) !important;
    font-size: 13px !important;
  }
  /* Context-usage ring: a bare 14px icon read as a loading spinner. Give
     it the same circle as its neighbours and a legible ring size. */
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > span > button[aria-haspopup="dialog"] {
    box-sizing: border-box !important;
    display: grid !important;
    place-items: center !important;
    width: var(--dshm-chip-h) !important;
    height: var(--dshm-chip-h) !important;
    padding: 0 !important;
    border: 1px solid var(--dshm-chip-border) !important;
    border-radius: 999px !important;
    background: var(--dshm-chip-bg) !important;
    box-shadow: var(--dshm-chip-shadow) !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > span > button[aria-haspopup="dialog"] svg {
    width: 22px !important;
    height: 22px !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] [class$="_trailing"] > [class$="_primary"] {
    width: var(--dshm-chip-h) !important;
    height: var(--dshm-chip-h) !important;
    transform: none !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, .35),
      0 4px 14px color-mix(in srgb, var(--dsw-alias-button-info-fill, #679efe) 45%, transparent) !important;
  }

  /* --- Dock row under the card (0.1.7): stats strip + context meter ---
     The official dock now holds the stats slot and, to its right, the
     context meter (ring + percent). Make the dock a full-width row: the
     stats capsule stretches, the meter becomes a matching 42px glass pill. */
  [data-mobile-nav="frame"] [data-composer-card] ~ [class$="_dock"] {
    box-sizing: border-box !important;
    width: 100% !important;
    max-width: var(--dsh-composer-card-max-width, none) !important;
    justify-content: stretch !important;
    align-items: center !important;
    gap: 6px !important;
    padding-top: 6px !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] ~ [class$="_dock"] > [data-slot="conversation.composer.dock"] > [class$="_root"] {
    flex: 1 1 auto !important;
    min-width: 0 !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] ~ [class$="_dock"] > span:last-child > button[aria-haspopup="dialog"] {
    box-sizing: border-box !important;
    height: 42px !important;
    padding: 0 12px 0 10px !important;
    gap: 6px !important;
    border-radius: 999px !important;
    color: var(--dsw-alias-label-primary, inherit) !important;
    font-size: 13px !important;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, .14), rgba(255, 255, 255, .04) 45%, rgba(255, 255, 255, .02)),
      var(--dsw-specific-input-major, rgba(22, 30, 44, .72)) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, .28),
      inset 0 -1px 0 rgba(255, 255, 255, .06),
      inset 0 0 0 .5px rgba(255, 255, 255, .08),
      0 8px 24px rgba(0, 0, 0, .14) !important;
    -webkit-backdrop-filter: blur(var(--we-blur, 40px)) saturate(var(--we-saturate, 1.3)) !important;
    backdrop-filter: blur(var(--we-blur, 40px)) saturate(var(--we-saturate, 1.3)) !important;
  }
  [data-mobile-nav="frame"] [data-composer-card] ~ [class$="_dock"] > span:last-child > button[aria-haspopup="dialog"] svg {
    width: 18px !important;
    height: 18px !important;
  }

  /* --- Stats strip under the composer (rounds / tokens / subscription) ---
     Official pills are 22px tall with 13px text and no fill, too small to
     hit on a touch screen. Spread them across the card width as equal
     32px outlined pills; long labels ellipsize (the popover has the detail).
     The strip sits on a frosted capsule matching the composer card glass so
     the message list scrolling behind it does not show through the text. */
  [data-mobile-nav="frame"] [data-slot="conversation.composer.dock"] > [class$="_root"] {
    box-sizing: border-box !important;
    max-width: none !important;
    margin-top: 0 !important;
    padding: 5px !important;
    gap: 6px !important;
    justify-content: stretch !important;
    border-radius: 999px !important;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, .14), rgba(255, 255, 255, .04) 45%, rgba(255, 255, 255, .02)),
      var(--dsw-specific-input-major, rgba(22, 30, 44, .72)) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, .28),
      inset 0 -1px 0 rgba(255, 255, 255, .06),
      inset 0 0 0 .5px rgba(255, 255, 255, .08),
      0 8px 24px rgba(0, 0, 0, .14) !important;
    -webkit-backdrop-filter: blur(var(--we-blur, 40px)) saturate(var(--we-saturate, 1.3)) !important;
    backdrop-filter: blur(var(--we-blur, 40px)) saturate(var(--we-saturate, 1.3)) !important;
  }
  [data-mobile-nav="frame"] [data-slot="conversation.composer.dock"] > [class$="_root"] > span {
    display: flex !important;
    flex: 1 1 auto !important;
    min-width: 0 !important;
  }
  [data-mobile-nav="frame"] [data-slot="conversation.composer.dock"] > [class$="_root"] > span > button {
    flex: 1 1 auto !important;
    justify-content: center !important;
    gap: 6px !important;
    min-width: 0 !important;
    max-width: none !important;
    height: 32px !important;
    padding: 0 10px !important;
    border: 1px solid var(--dshm-chip-border) !important;
    border-radius: 999px !important;
    background: var(--dshm-chip-bg) !important;
    box-shadow: var(--dshm-chip-shadow) !important;
    font-size: 13px !important;
  }
  [data-mobile-nav="frame"] [data-slot="conversation.composer.dock"] > [class$="_root"] > span > button svg {
    flex: none !important;
    width: 16px !important;
    height: 16px !important;
  }
  [data-mobile-nav="frame"] [data-slot="conversation.composer.dock"] > [class$="_root"] > span > button > span {
    min-width: 0 !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }

  /* --- Session header on mobile ---
     Layout goal: [toggle] [session title] [mode badge] in a row. */
  [data-phase] header {
    padding-right: 12px !important;
  }
  [data-phase] header > :first-child {
    padding-left: 20px !important;
  }
  [data-mobile-nav="toggle"] {
    position: absolute !important;
    left: 8px !important;
    top: 12px !important;
    z-index: 2 !important;
  }
  [data-mobile-nav="files"] {
    position: static !important;
    left: auto !important;
    right: auto !important;
    top: auto !important;
    z-index: auto !important;
  }
  [data-phase] header [class$="_headerActions"] {
    flex: 0 1 auto !important;
    min-width: 0 !important;
    margin-left: auto !important;
    justify-content: flex-end !important;
  }
  [data-phase] header [class$="_crumbs"] {
    flex: 0 1 auto !important;
    min-width: 0 !important;
    max-width: 24vw !important;
  }
  [data-phase] header [class$="_label"]:has(> svg) {
    order: 1 !important;
    flex: 0 1 auto !important;
    min-width: 0 !important;
    max-width: 42vw !important;
    display: block !important;
    position: relative !important;
    box-sizing: border-box !important;
    padding-left: 18px !important;
    padding-right: 2px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }
  [data-phase] header [class$="_label"]:has(> svg) > svg {
    position: absolute !important;
    left: 0 !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
  }
  [data-phase] header [class$="_root"]:has(> button[class$="_trigger"]) {
    order: 2 !important;
    flex: 0 0 auto !important;
    min-width: max-content !important;
    max-width: none !important;
    white-space: nowrap !important;
    position: static !important;
  }
  [data-phase] header [class$="_root"]:has(> button[class$="_trigger"]) > button,
  [data-phase] header [class$="_root"]:has(> button[class$="_trigger"]) > button * {
    white-space: nowrap !important;
  }
  [data-phase] header [data-mobile-nav="files"] {
    order: 3 !important;
    flex: 0 0 auto !important;
  }
  [data-phase] header > :first-child > :last-child {
    display: none !important;
  }

  /* --- Header popovers on mobile --- */
  [data-phase] header [class$="_menu"] {
    left: 8px !important;
    right: auto !important;
    width: min(336px, calc(100vw - 16px)) !important;
    max-width: none !important;
    max-height: min(420px, calc(100dvh - 120px)) !important;
  }

  /* --- Settings dialog on mobile ---
     Desktop: 800px two-column flex (188px nav + content). Mobile: a
     near-full-width sheet — nav tabs wrap into rows on top, option rows
     stay horizontal. Structural selectors are scoped to the unique
     aria-modal dialog; every settings-specific rule is gated with
     :has(> :first-child > :last-child > button). Requires :has() support
     (Chromium 105+, 2022). */
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) {
    position: absolute !important;
    left: 8px !important;
    top: calc(env(safe-area-inset-top, 0px) + 12px) !important;
    width: calc(100vw - 16px) !important;
    max-width: calc(100vw - 16px) !important;
    height: auto !important;
    max-height: min(800px, calc(100vh - 24px - env(safe-area-inset-top, 0px))) !important;
    max-height: min(800px, calc(100dvh - 24px - env(safe-area-inset-top, 0px))) !important;
    flex-direction: column !important;
    border-radius: 14px !important;
    animation: dsh-mobile-nav-sheet-in .22s var(--ds-ease-out, ease-in-out);
  }
  :has(> [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"]))) > :first-child {
    animation: dsh-mobile-nav-fade .18s var(--ds-ease-out, ease-in-out);
  }
  @media (prefers-reduced-motion: reduce) {
    [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])),
    :has(> [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"]))) > :first-child {
      animation: none !important;
    }
  }
  [aria-modal="true"]:not(:has(> :first-child > :last-child > button)) {
    max-width: calc(100vw - 32px) !important;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :first-child {
    width: 100% !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 6px !important;
    padding: 10px 12px 8px !important;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :first-child > :first-child {
    display: none !important;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :first-child [class$="_navList"] {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    gap: 6px !important;
    overflow: visible !important;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) [class$="_header"] {
    flex: 0 0 auto !important;
    justify-content: flex-end !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 0 0 0 4px !important;
    min-height: 40px !important;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) [class$="_header"] > * {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) [class$="_header"] > :last-child {
    width: 32px !important;
    height: 32px !important;
    border-radius: 50% !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, .06)) !important;
  }
  [aria-modal="true"] [class$="_cubeRow"] {
    gap: 6px !important;
  }
  [aria-modal="true"] [class$="_cubeRow"] > * {
    flex: 1 1 0 !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    padding: 10px 8px !important;
    min-height: 0 !important;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :last-child {
    flex: 1 1 auto !important;
    min-height: 0 !important;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :last-child > :last-child {
    padding: 0 12px 24px !important;
  }
`;

};
modules["styles/misc.css.js"] = function(require, module, exports) {
"use strict";
// misc — split from src/client/mobile.css.ts (2026-08-16), order preserved.
// Do not reorder: styles/index.ts concatenates in this exact order.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MISC_CSS = void 0;
exports.MISC_CSS = `  /* ---------- hero composer on mobile ----------
     The official hero card carries a 2-line textarea plus a tall tool row,
     which reads oversized on a phone. Tighten the empty-state rhythm: keep
     the official centered hero, shrink the textarea line box, slim the card
     padding and the tool row, and close the gap under the headline. */

  [data-phase="hero"] [class$="_card"]:has(textarea) {
    padding-top: 14px !important;
    padding-bottom: 10px !important;
    gap: 12px !important;
  }
  /* The official composer autosizes the textarea and writes an inline
     height (2 lines on the hero empty state) on the textarea's scroll/grow
     wrappers. :placeholder-shown lets us collapse the EMPTY state to one
     line with !important; as soon as the user types, the pseudo-class no
     longer matches and the autosizer's inline height takes over again — so
     multi-line growth keeps working. */
  [data-phase="hero"] textarea:placeholder-shown {
    height: 36px !important;
  }
  [data-phase="hero"] [class$="_card"]:has(textarea:placeholder-shown) > [class$="_scroll"],
  [data-phase="hero"] [class$="_card"]:has(textarea:placeholder-shown) [class$="_grow"] {
    height: 36px !important;
  }
  [data-phase="hero"] [class$="_card"]:has(textarea) > [class$="_row"] {
    padding-top: 4px !important;
  }
  [data-phase="hero"] [class$="_headline"] {
    line-height: 1.15 !important;
    margin-bottom: 0 !important;
  }
  [data-phase="hero"] [class$="_stack"] {
    gap: 0 !important;
  }

  /* ---------- composer dock: swap git branch chip with the todo card ----------
     The git-graph branch chip (conversation.input.dock, order 100) floats
     alone at the bottom-left above the input card, with a dead zone to its
     right; the full-width todo card (order 0) sits above it. Swap them so
     the chip reads as the stack's top row and the todo card fills the row
     above the composer. The dock container itself is display:contents
     (inline style) — its children are direct flex items of the composer
     stack, so order on the children is what reorders them. Only the chip
     needs an order change: -1 puts it before the todo card (order 0) and
     before the input card (order 0, later in DOM). The todo card must KEEP
     its order 0 — raising it past the input card's order 0 would drop it
     below the composer entirely (2026-08-16 regression, fixed). The queue
     strip (order 20) keeps hugging the input card. Desktop untouched (this
     block lives inside the max-width: 1023px media query). */
  [data-slot="conversation.input.dock"] [data-gitgraph-chip-anchor] {
    order: -1 !important;
  }
  /* Mobile tap target + feedback for the branch chip (git-graph, 24px
     desktop spec). Two real-world problems: ① the chip is tiny and sits
     right above the expandable todo card — mis-taps land on the todo card;
     ② opening the popover waits for the host's /git/branches round-trip
     (~700ms on device) with zero feedback, so users tap again and toggle
     the popover closed. Enlarge the target, kill double-tap zoom delay,
     and give an instant pressed state so a tap reads as registered. */
  [data-slot="conversation.input.dock"] [data-gitgraph-chip-anchor] [data-gitgraph-chip] {
    touch-action: manipulation !important;
    min-height: 34px !important;
    padding: 0 12px !important;
    font-size: 13px !important;
  }
  [data-slot="conversation.input.dock"] [data-gitgraph-chip-anchor] [data-gitgraph-chip]:active {
    transform: scale(.96) !important;
    transition: transform .12s !important;
  }
}

/* ---------- tablet / wide mobile: keep sheets from becoming full-width ----------
   Below 768px the near-full-width sheets are the right call for a phone.
   On wider but still sub-desktop viewports (foldables, tablet portrait,
   desktop-mode tall windows) the same full-bleed sheet leaves content
   clustered at the left edge with a large dead zone on the right. Cap and
   center the modal sheets and the aionui bottom sheets instead. */
@media (min-width: 768px) and (max-width: 1023px) {
  /* All modal dialogs: centered, never edge-to-edge. The settings sheet has
     a higher-specificity full-width rule above, so repeat its selector here
     to win; the generic export/other-modal rule is covered by the second
     selector. */
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])),
  [aria-modal="true"]:not(:has(> :first-child > :last-child > button)) {
    left: 0 !important;
    right: 0 !important;
    margin-left: auto !important;
    margin-right: auto !important;
    width: min(calc(100vw - 32px), 720px) !important;
    max-width: min(calc(100vw - 32px), 720px) !important;
  }

  /* The dsh-web-ui explorer / preview bottom sheets: same treatment — keep
     the mobile bottom-sheet behavior, but stop them spanning the full width. */
  [data-aionui-explorer-col],
  [data-aionui-preview-col] {
    left: 0 !important;
    right: 0 !important;
    width: min(calc(100vw - 32px), 720px) !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }

  /* Settings sections (e.g. Agent presets) often carry a desktop max-width
     (720px) that leaves a dead strip on the right once the sheet is capped to
     the same width; let them fill the sheet body instead. */
  [aria-modal="true"] [class$="_section"] {
    width: 100% !important;
    max-width: none !important;
  }
}

/* ---------- desktop: the mobile controls must never appear ---------- */

@media (min-width: 1024px) {
  [data-mobile-nav="toggle"],
  [data-mobile-nav="files"],
  [data-mobile-nav="fab"],
  [data-mobile-nav="backdrop"],
  [data-mobile-nav="session-log"],
  [data-mobile-nav="explorer"],
  [data-mobile-nav="drawer-actions"],
  [data-mobile-nav="composer-toggle"] {
    display: none !important;
  }
}
`;

};

const cache = Object.create(null);
function load(key) {
  if (cache[key]) return cache[key].exports;
  if (!modules[key]) throw new Error('Unknown mobile-nav module: ' + key);
  const module = cache[key] = { exports: {} };
  const localRequire = id => {
    if (!id.startsWith('.')) return require(id);
    const parts = key.split('/');
    parts.pop();
    for (const part of id.split('/')) {
      if (part === '..') parts.pop();
      else if (part !== '.') parts.push(part);
    }
    return load(parts.join('/'));
  };
  modules[key](localRequire, module, module.exports);
  return module.exports;
}

return load('index.js');
}});
