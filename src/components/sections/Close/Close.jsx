"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { CLOSE_LINES as LINES } from "@/content/copy";
import "./Close.css";

gsap.registerPlugin(ScrollTrigger);

/* The Special Projects landscape, pre-rendered: tinted to the brand blue
   and darkened into the night once, ahead of time, plus a pre-blurred
   copy. (It was tinted live with a colour blend and a night overlay, and
   blurred with a filter — all recomposited on every frame of the scroll.) */
const DREAM = "/services/dream-close.webp";
const DREAM_SOFT = "/services/dream-close-soft.webp";

/* The close: the line the loader opened with, said once more at full size
   just before the footer — from a dream into focus.

   The section is taller than the screen and its stage is sticky, so the
   words hold still while the scroll runs through them. Each word starts
   out of focus (blurred, faint, a touch large, as if seen half-asleep) and
   sharpens into place in reading order as you scroll: dream to reality,
   which is what the studio says it does. The last full stop lands in the
   accent blue.

   Not a sideways run (DZ!NR's close): nothing travels. The type stays
   where it is and comes into focus. Without motion, the line is simply
   there.

   Performance: nothing is blurred while it moves. Each word is two copies
   — a soft one (its glyphs drawn as a blurred text-shadow, painted once)
   and the sharp one — and they cross-fade. It used to animate a 16px blur
   filter on all six words, at 10vw, on every frame of the scroll: the
   heaviest thing on the page. */
export default function Close() {
  const ref = useRef(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.classList.add("is-static");
      return;
    }

    /* the words and the picture are their own layers only while the
       section is near the screen, not for the whole visit */
    const near = new IntersectionObserver(
      ([entry]) => section.classList.toggle("is-live", entry.isIntersecting),
      { rootMargin: "50% 0px" }
    );
    near.observe(section);

    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray(".c2-word");
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            // the first word begins to wake as the line rises into view,
            // and the last lands before the stage lets go
            start: "top 55%",
            end: "bottom bottom",
            // tied to the scroll, not trailing it: Lenis already smooths
            // the scroll, and a second 0.6s of lag made it feel stuck
            scrub: true,
          },
        })
        .fromTo(words, { scale: 1.06 }, { scale: 1, duration: 1, stagger: 0.55 }, 0)
        /* The haze holds for most of each word's turn and the sharp copy
           takes over late and quickly (ease-in on both). Linear, the middle
           of the hand-over was a crisp word at half strength — a grey word,
           not a blurred one. */
        .fromTo(
          section.querySelectorAll(".c2-word-sharp"),
          { opacity: 0 },
          { opacity: 1, duration: 1, stagger: 0.55, ease: "power3.in" },
          0
        )
        .fromTo(
          section.querySelectorAll(".c2-word-soft"),
          { opacity: 0.75 },
          { opacity: 0, duration: 1, stagger: 0.55, ease: "power2.in" },
          0
        )
        // the landscape sharpens across the whole of the words' waking
        .fromTo(
          ".c2-dream-sharp",
          { opacity: 0, scale: 1.06 },
          { opacity: 1, scale: 1, duration: 1 + 0.55 * (words.length - 1) },
          0
        )
        // hold the finished line for the last stretch of the stage
        .to({}, { duration: 0.8 });
    }, section);

    return () => {
      near.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section className="c2" ref={ref} aria-label="Dream bigger. We'll make it happen.">
      {/* The page's grid lines, run up into the foot of the close. The
          page-wide lines (GridLines) sit behind every section, and this one's
          solid night hides them, so they used to begin abruptly at the
          footer's edge. These five are drawn at the same sixths, in the same
          tone, and fade in from nothing — the footer's lines grow out of the
          night instead of starting at a seam. */}
      <div className="c2-grid" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} style={{ left: `${(n / 6) * 100}%` }} />
        ))}
      </div>

      <div className="c2-stage">
        {/* The dream behind the words: the services' floating islands,
            darkened into the night. A soft (blurred) copy is there from the
            start; the sharp copy fades in over it as the words wake, so the
            picture comes into focus with them. Opacity and transform only —
            the blur is a still filter on the soft copy, never animated. The
            source is 760px wide, so even "sharp" it stays atmosphere. */}
        <div className="c2-dream" aria-hidden="true">
          <img className="c2-dream-soft" src={DREAM_SOFT} alt="" loading="lazy" />
          <img className="c2-dream-sharp" src={DREAM} alt="" loading="lazy" />
        </div>

        <p className="c2-line" aria-hidden="true">
          {LINES.map((line, l) => (
            <span className="c2-row" key={l}>
              {line.map((word, w) => {
                const last = l === LINES.length - 1 && w === line.length - 1;
                const text = last ? (
                  <>
                    {word.slice(0, -1)}
                    <span className="c2-dot">.</span>
                  </>
                ) : (
                  word
                );
                return (
                  <span className="c2-word" key={w}>
                    <span className="c2-word-sharp">{text}</span>
                    <span className="c2-word-soft">{text}</span>
                  </span>
                );
              })}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
