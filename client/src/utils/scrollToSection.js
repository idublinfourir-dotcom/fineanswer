/**
 * Smooth-scroll the window to a section, leaving room for the fixed navbar.
 *
 * Uses the element's layout position (offsetTop) rather than scrollIntoView,
 * because landing sections fade in with a translateY: scrollIntoView aims at the
 * translated box and lands too high once the animation finishes.
 * The gap comes from the element's CSS scroll-margin-top.
 */
export const scrollToSection = (element) => {
  if (!element) return;

  let top = 0;
  for (let node = element; node; node = node.offsetParent) {
    top += node.offsetTop;
  }

  const margin = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
  window.scrollTo({ top: top - margin, behavior: "smooth" });
};
