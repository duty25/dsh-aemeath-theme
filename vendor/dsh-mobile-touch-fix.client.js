/*!
 * Bundled into dsh-aemeath-theme unmodified.
 * Original: dsh-mobile-touch-fix 1.0.0 (DeepSeek Harness community plugin; author not stated)
 * License: MIT
 */
window.__ModuleLoader__.load({
	id: "dsh-mobile-touch-fix",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		/**
		 * The session header's subagent lineage chip is the only way to open the
		 * subagent tree, and on a phone it is too small to hit.
		 *
		 * The chip is the "/ <n> subagent <chevron>" control contributed by
		 * @deepseek-ai/dsh-client-ui-subagent into
		 * `conversation.session.header.lineage`. Measured at a 412px viewport on
		 * 0.1.5-rc.2 it laid out at 34x36 CSS px, with the label ellipsized into a
		 * 21px span and a 5px chevron beside it — well under the 44px minimum a
		 * thumb needs, and the label is short enough that the tap is easy to miss
		 * entirely.
		 *
		 * Two things keep it small, and both are already `!important` upstream:
		 *
		 * 1. @dsh-external/dsh-mobile-nav's header rule pins `min-height: 28px`
		 *    on the chip's trigger.
		 * 2. dsh-mobile-header-fix's rule
		 *      [data-mobile-nav="frame"][data-mobile-nav] [data-phase] header [class$="_trigger"]
		 *    pins `min-width: 0`, which is deliberate — it stops the chip painting
		 *    over the buttons beside it — but it also means the chip can never
		 *    claim a usable width. (Its companion rule meant to move this chip into
		 *    the Chat/Trajectory row matches `div[class*="_switcherRoot"]`, while
		 *    the chip's own root carries `ZKlsPq_root ` — with a trailing space —
		 *    so that rule has never applied and the chip is still in the title row.)
		 *
		 * Both are beaten here on specificity, not on importance: this selector
		 * carries one attribute more than the second rule and two more than the
		 * first, so the floor holds whichever of the three stylesheets loads last.
		 *
		 * Scope is deliberately narrow. `header nav` is the breadcrumb nav, which
		 * holds exactly the session crumb and this chip; the `_trigger` class gate
		 * keeps plain header icon buttons (28px icons in 28px boxes) out of it, and
		 * their layout is left alone.
		 *
		 * A 44x44 chip is still unreadable, though: at that width the label has
		 * 24px of box to live in and "2 subagents" ellipsizes to "2 s". So the chip
		 * claims width as well — 88px, which is the widest that fits before the job
		 * chip's left edge at x=199.
		 *
		 * Widening the chip alone does nothing, and finding out why took longer than
		 * it should have. The chain that holds the breadcrumb opens with
		 * `span.wSkVaW_crumbSeg > div[data-slot="conversation.session.header.lineage"]`
		 * (display: contents), and somewhere above it sits a `max-width: 98.88px`
		 * with `overflow: hidden`. The chip's own box grows to 88px, but everything
		 * past x=139 — the chevron, the tail of the label — is clipped away by a
		 * container that never grew with it. That is also why the chevron measured
		 * 5px wide in the original report: it was not being squeezed, it was being
		 * cut off. So this stylesheet releases that cap and pins the crumb instead,
		 * which puts the row at crumb + chip = 152px, ending at x=192.
		 *
		 * Inside the chip the width goes to the label first and the chevron last,
		 * because a chip that drops its chevron reads as a static count rather than
		 * a control.
		 */
		const css = `/* dsh-mobile-touch-fix
 *
 * Gated to the same width range as the stylesheet it repairs
 * (dsh-mobile-nav's layout.css.ts opens @media (max-width: 1023px)), so the
 * desktop layout is untouched even while the frame attribute is present.
 */
@media (max-width: 1023px) {

/* The chip gets a real touch target, and enough width to read: 34x36 measured
   becomes 88x44, against a 44px floor for a thumb. At a 412px viewport the
   title row has the room — the job chip does not start until x=199. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav button[class*="_trigger"] {
  flex: 0 0 auto !important;
  min-width: 88px !important;
  max-width: 88px !important;
  min-height: 44px !important;
  padding-top: 6px !important;
  padding-bottom: 6px !important;
  padding-left: 10px !important;
  padding-right: 10px !important;
}

/* The crumbs row carries max-width: 98.88px upstream and clips. Give the chip
   the width above and everything past x=139 is cut — which is precisely where
   the chevron and the tail of the label were going, and why widening the chip
   alone changed nothing. Release the cap and pin the crumb, so the row is
   exactly as wide as crumb + chip: at 412px, 46 + 18 + 88 = 152px, ending at
   x=192, still clear of the job chip at x=199. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav {
  flex: 0 0 auto !important;
  max-width: none !important;
  min-width: 0 !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav > span {
  flex: 0 0 auto !important;
  min-width: 0 !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav > span > button:first-child {
  flex: 0 1 auto !important;
  min-width: 0 !important;
  max-width: 46px !important;
}

/* Spend the width on the label, never on the chevron: the chevron is the only
   cue that the chip opens anything, so it keeps its intrinsic box while the
   label yields first. */
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav button[class*="_trigger"] svg {
  flex: 0 0 auto !important;
}
[data-mobile-nav="frame"][data-mobile-nav] [data-phase] header nav button[class*="_trigger"] > span {
  min-width: 0 !important;
}

}
`;
		const tagId = "dsh-mobile-touch-fix/touch-fix.css";
		/** Client plugin body: own the stylesheet for as long as this plugin is mounted. */
		function apply(ctx) {
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-mobile-touch-fix";
				tag.dataset.pluginCss = tagId;
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => {
					tag.remove();
				};
			}, "dsh-mobile-touch-fix: touch stylesheet");
		}
		exports.apply = apply;
		exports.inject = [];
		return module.exports;
	}
});
