import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Locomotive's `data-scroll-speed` effect, on the stack we already have.
 *
 * Lenis does not do this — Lenis only smooths the native scroll. The
 * "image travels faster/slower than the page" effect is a scrubbed
 * transform, which is GSAP's job. Locomotive v5 is itself a wrapper around
 * Lenis (its package.json depends on lenis 1.3.17; we run 1.3.26), so
 * adding it would buy this API and nothing else.
 *
 * Usage:  <figure class="frame"><img data-speed="0.18" /></figure>
 * The frame must clip (overflow: hidden). Speed is the fraction of the
 * frame's height the image travels across a full pass of the viewport;
 * positive = drifts against the scroll (the usual "slower" look).
 *
 * The element's height is set here rather than in CSS, so the travel and
 * the overscan can never drift apart and expose a gap at the edges.
 */
export function mountParallax(root) {
  if (!root) return () => {};

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  const ctx = gsap.context(() => {
    gsap.utils.toArray("[data-speed]", root).forEach((el) => {
      const speed = parseFloat(el.dataset.speed);
      if (!speed) return;

      /* Overscan: the image is `speed` taller than its frame (+1% for
         sub-pixel rounding), so there is slack to move into at both ends.

         It must also be CENTRED in that slack. Left in normal flow the image
         sits at the frame's top and the whole overscan hangs off the bottom,
         so the first upward move tears a gap along the top edge.

         And the travel is converted into the element's own coordinate space:
         yPercent is a percentage of the ELEMENT, not the frame, and the
         element is the taller of the two. Using frame units here overshoots
         the slack and re-opens the gap it was meant to prevent. */
      const overscan = speed + 0.01;
      const travel = ((speed / 2) / (1 + overscan)) * 100;

      el.style.position = "absolute";
      el.style.top = "50%";
      el.style.left = "0";
      el.style.width = "100%";
      el.style.height = `${(1 + overscan) * 100}%`;

      gsap.fromTo(
        el,
        { yPercent: -50 - travel },
        {
          yPercent: -50 + travel,
          ease: "none",
          scrollTrigger: {
            // the clipping frame is the reference, not the image itself:
            // the image is taller than the frame, so using it would start
            // the effect early and end it late
            trigger: el.parentElement || el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    });
  }, root);

  return () => ctx.revert();
}
