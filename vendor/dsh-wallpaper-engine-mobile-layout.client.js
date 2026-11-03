/*!
 * Bundled into dsh-aemeath-theme unmodified.
 * Original: dsh-wallpaper-engine-mobile-layout (mobile layout patch for dsh-plugin-wallpaper-engine; author not stated)
 * License: MIT
 */
window.__ModuleLoader__.load({
  id: 'dsh-wallpaper-engine-mobile-layout',
  factory: () => ({
    inject: [],
    apply(ctx) {
      ctx.effect(() => {
        const style = document.createElement('style');
        style.dataset.plugin = 'dsh-wallpaper-engine-mobile-layout';
        style.dataset.pluginCss = 'dsh-wallpaper-engine-mobile-layout/styles-v1';
        style.textContent = `
@media (max-width: 768px) {
  body .we-repo-panel,
  body .we-picker__modal--panel {
    right: 8px;
    width: calc(100vw - 16px);
    max-width: calc(100vw - 16px);
    min-width: 0;
  }
  /* dsh-mobile-nav also applies an !important cap to every modal. */
  body .we-picker__modal.we-picker__modal--panel[role="dialog"][aria-modal="true"] {
    max-width: calc(100vw - 16px) !important;
  }
  body .we-repo-panel__body {
    min-width: 0;
    overflow-x: hidden;
  }
  body .we-repo-panel .we-picker,
  body .we-repo-panel .we-tabs,
  body .we-picker__modal--panel .we-tabs {
    min-width: 0;
    max-width: 100%;
  }
  body .we-repo-panel .we-tabs__tab {
    min-width: 0;
    white-space: nowrap;
  }
  body .we-repo-panel .we-vinyl {
    width: clamp(88px, 28vw, 120px);
    height: clamp(88px, 28vw, 120px);
  }
  body[data-we-glass-fallback] .we-repo-panel.we-repo-panel--open,
  body[data-we-glass-fallback] .we-picker__modal.we-picker__modal--panel {
    background-color: var(--dsw-alias-bg-layer-1, #ffffff);
    background-image: none;
  }
}
`;
        document.head.appendChild(style);
        return () => style.remove();
      });
    },
  }),
});
