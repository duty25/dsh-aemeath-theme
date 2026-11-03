window.__ModuleLoader__.load({
	id: "dsh-mobile-header-fix",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		/**
		 * Defects in the phone session header, all of them downstream of the
		 * shipped stylesheet in @dsh-external/dsh-mobile-nav, plus one layout
		 * change requested on top.
		 *
		 * 1. Its rule
		 *      [data-phase] header [class$="_root"]:has(> button[class$="_trigger"])
		 *    was written for the agent-preset selector, but that selector's root
		 *    class does not end in "_root" — the background-jobs chip's does. So
		 *    the chip received `position: static`, which deleted the containing
		 *    block its absolutely positioned menu measures `top: calc(100% + 5px)`
		 *    against: the menu was placed against the conversation column instead
		 *    (y = column height + 5px, i.e. below the fold), and the chip looked
		 *    like it could not be opened at all. The same rule's
		 *    `min-width: max-content` made the chip unshrinkable, so the header's
		 *    right-aligned action cluster overflowed its own box leftwards, across
		 *    the session title.
		 *
		 * 2. The touch-target rule
		 *      [data-mobile-nav="frame"] [data-phase="active"] > header button
		 *    uses a child combinator, but the header sits one level deeper inside
		 *    a `display: contents` wrapper, so it matched nothing and every header
		 *    control stayed 28px tall.
		 *
		 * 3. Once the menu did open, it opened off the right edge: the jobs menu
		 *    is `position: absolute; left: 0; width: 336px` against the chip, and
		 *    the chip sits ~222px from the left on a 412px screen, so the panel's
		 *    right edge landed 154px past the viewport. Its own
		 *    `max-width: min(400px, 100vw - 32px)` clamps the width but cannot
		 *    pull a left-anchored box back on screen. Fix: anchor the menu to the
		 *    header instead of the chip and pin it to the header's right edge —
		 *    the plugin's own max-width then always fits, at any viewport.
		 *
		 * 4. Requested change: the agent-preset badge ("Standard mode") moves out
		 *    of the crowded title row and into the Chat/Trajectory row. In the
		 *    title row it had ~75px and rendered as "标…"; the tab row has ~250px
		 *    of free space to its right, and vacating the slot lets the title and
		 *    the jobs chip keep more of their text.
		 *
		 * 5. Requested change: in a subagent conversation the crumb that names it
		 *    is not the plain title button but the lineage chip contributed by
		 *    @deepseek-ai/dsh-client-ui-subagent — "/ <subagent title> <icon>".
		 *    Every level of it is min-width:0 with no floor, so it absorbed the
		 *    title row's shortfall instead of merely shrinking: measured at 412px
		 *    with a background-jobs chip present, the crumbs box got 99px and the
		 *    chip's title span came out 10px wide. It now moves to the tab row,
		 *    which has room, and is placed in the band between the tabs and the
		 *    preset badge. Ancestor subagent chips (a subagent that spawned one)
		 *    keep a floor in the title row, so they cannot collapse the same way.
		 *
		 * Every selector below carries one attribute more specificity than the
		 * rule it overrides, so this stylesheet wins whichever of the two loads
		 * first.
		 */
		const css = `/* dsh-mobile-header-fix
 *
 * Gated to the same width range as the stylesheet it repairs
 * (dsh-mobile-nav's layout.css.ts opens @media (max-width: 1023px)), so the
 * desktop layout is untouched even while the frame attribute is present.
 */
@media (max-width: 1023px) {

/* 1 — the header is the containing block for header popovers. It is the
   smallest positioned ancestor that actually sits at the top of the screen:
   without it, a chip whose root is static hands its menu to the conversation
   column (412x915), which puts the menu below the fold. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header {
  position: relative !important;
}

/* 2 — the chip root is deliberately static, so its menu anchors to the header
   above rather than to the chip's own box. Stated here rather than inherited
   from mobile-nav, so this fix does not depend on that rule staying. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_root"]:has(> button[class$="_trigger"]) {
  position: static !important;
  min-width: 0 !important;
  flex: 0 1 auto !important;
}

/* 3 — a text chip ellipsizes inside its box instead of painting over the
   buttons beside it. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_trigger"] {
  min-width: 0 !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_trigger"] > span {
  flex: 0 1 auto !important;
  min-width: 0 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

/* 4 — header controls get a comfortable hit height. The Chat/Trajectory tabs
   keep theirs, so the header itself does not grow. */
[data-mobile-nav="frame"] [data-phase="active"] header button:not([class*="_tab"]) {
  min-height: 36px;
}

/* 5 — header popovers open against the header's right edge instead of the
   chip's left edge, so they can never run past the right of the screen. The
   panel keeps its own 336px width and its own
   max-width: min(400px, 100vw - 32px); right-alignment is what makes that
   clamp sufficient at every width. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_root"] > [class$="_menu"] {
  left: auto !important;
  right: 12px !important;
}

/* 6 — (v1.3) the header is laid out as three rows instead of two:
     row 1  [session title ……………] [files] [more] [corner]
     row 2  [preset badge] [background jobs] [subagents]
     row 3  [tabs, one line, scrolls sideways]
   Previously the badge sat absolutely in the tab row, which only works with
   the two stock tabs; plugins now add up to eight, and the badge landed on
   them. The status chips (jobs, subagents) shared the title row with the
   title, which mobile-nav capped at 24vw, so a subagent chip had no room at
   all. The title cluster and the actions cluster dissolve (display:contents)
   into the title row, which wraps; a zero-height flex-basis:100% pseudo item
   forces the break, and "order" sorts each control onto its row. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_titleRow"] {
  flex-wrap: wrap !important;
  column-gap: 6px !important;
  row-gap: 0 !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_titleRow"]::after {
  content: "" !important;
  order: 10 !important;
  flex: 0 0 100% !important;
  height: 0 !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_titleCluster"],
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_headerActions"] {
  display: contents !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav[class$="_crumbs"] {
  order: 0 !important;
  flex: 1 1 0 !important;
  min-width: 0 !important;
  max-width: none !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_headerActions"] > [data-slot] > * {
  order: 20 !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_headerActions"] [data-mobile-nav="files"] {
  order: 1 !important;
  flex: 0 0 auto !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_headerUtilities"] {
  order: 2 !important;
  margin-left: 0 !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_headerCorner"] {
  order: 3 !important;
  margin-left: 0 !important;
  margin-right: -4px !important;
}
/* row 2: the badge goes back into normal flow */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_headerActions"] > div[data-slot] > span[class$="_label"] {
  position: relative !important;
  top: auto !important;
  bottom: auto !important;
  right: auto !important;
  left: auto !important;
  flex: 0 1 auto !important;
  max-width: 40% !important;
  align-self: center !important;
  margin: 2px 6px 4px 0 !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_headerActions"] > div[data-slot] > [class$="_root"]:has(> button[class$="_trigger"]) {
  flex: 0 1 auto !important;
  min-width: 0 !important;
  margin-bottom: 2px !important;
}
/* row-2 chips stay compact; the 36px touch floor is for row-1 icon buttons */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_headerActions"] > div[data-slot] > [class$="_root"] > button[class$="_trigger"] {
  min-height: 28px !important;
}

/* 7 — (folded into 6) */

/* 8 — (v1.3) subagent conversations: the lineage chip stays in the title row,
   which now has the whole width minus three icons (~250px at 412px). The
   parent crumb yields first (capped at 45%), the current subagent's chip
   keeps the rest and only ellipsizes its own title. A nested "N subagents"
   count inside the crumbs keeps a floor so it cannot collapse to a sliver. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav[class$="_crumbs"] > span[class$="_crumbSeg"]:not(:last-child) {
  flex: 0 1 auto !important;
  min-width: 0 !important;
  max-width: 45% !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav[class$="_crumbs"] > span[class$="_crumbSeg"]:last-child {
  flex: 1 1 auto !important;
  min-width: 0 !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav[class$="_crumbs"] [class*="_switcherTrigger"] {
  max-width: 100% !important;
  min-height: 30px !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav[class$="_crumbs"] [class$="_root"]:has(> button[class$="_trigger"]) {
  flex: 0 0 auto !important;
}

/* 9 — an ancestor subagent chip (a subagent that spawned a subagent) stays in
   the title row but keeps a floor, so it is not the thing that collapses. The
   plain ancestor title beside it yields first. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav[class$="_crumbs"] > span[class$="_crumbSeg"]:has(> div[class*="_switcherRoot"]):not(:last-child) {
  min-width: 88px !important;
}

/* 10 — a subagent opened from the catalog's trailing arrow ("open in sidebar")
   lands in the right Sidebar, which below 768px is forced fullscreen. Its glass
   panel (wallpaper engine: translucent fill + backdrop blur) sits over the
   still-painted parent conversation, so the parent's header tabs, todo/goal
   cards, composer and stats dock showed through and stacked under the child's
   own composer — two composers, two stats rows, overlapping controls. While
   the frame reports a fullscreen right bar, the parent column is not visible
   anyway: stop painting it (visibility keeps its layout/scroll state, so
   closing the panel restores it exactly where it was). */
[data-mobile-nav="frame"][data-rightbar-fullscreen] > [class$="_centerCol"] {
  visibility: hidden !important;
}


/* 11 — (v1.3) tabs: one line, scroll sideways. Eight tabs at 36px gaps
   cannot fit 380px, so each was squeezed to 8px and wrapped one character
   per line ("对/话"). The strip bleeds to both screen edges so scrolled
   content is not cut 20px short of the edge. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_tabs"] {
  flex-wrap: nowrap !important;
  gap: 22px !important;
  margin-left: -20px !important;
  margin-right: -12px !important;
  padding-left: 26px !important;
  padding-right: 16px !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_tabs"]::-webkit-scrollbar {
  display: none;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_tabs"] > button {
  flex: 0 0 auto !important;
  white-space: nowrap !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_tabs"] > button::after {
  bottom: 0 !important;
}

/* 12 — (v1.3) image-gen gallery toolbar. Its left group (provider, ratio,
   search with min-width 190px, workspace filter) shares a wrapping row with
   the right group (import / sort / batch), and on a phone the left group was
   given 107px: the selects and the search box overflowed it and painted over
   the right group's buttons. Stack the two groups instead. */
html body .dsh-ig-studio-toolbar {
  flex-direction: column !important;
  align-items: stretch !important;
  gap: 8px !important;
  padding: 10px 12px !important;
}
html body .dsh-ig-studio-toolbar-left {
  flex: none !important;
  width: 100% !important;
  gap: 8px !important;
}
html body .dsh-ig-studio-toolbar-left > .dsh-ig-studio-select {
  flex: 1 1 0 !important;
  min-width: 0 !important;
}
html body .dsh-ig-studio-search-wrap {
  flex: 1 1 100% !important;
  min-width: 0 !important;
  max-width: none !important;
}
html body .dsh-ig-studio-toolbar-right {
  width: 100% !important;
  flex-wrap: wrap !important;
  gap: 8px !important;
}
html body .dsh-ig-studio-toolbar-right > * {
  flex: 1 1 0 !important;
  min-width: 0 !important;
  justify-content: center !important;
}

}
`;
		const tagId = "dsh-mobile-header-fix/header-fix.css";
		/** Client plugin body: own the stylesheet for as long as this plugin is mounted. */
		function apply(ctx) {
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-mobile-header-fix";
				tag.dataset.pluginCss = tagId;
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => {
					tag.remove();
				};
			}, "dsh-mobile-header-fix: header stylesheet");
		}
		exports.apply = apply;
		exports.inject = [];
		return module.exports;
	}
});
