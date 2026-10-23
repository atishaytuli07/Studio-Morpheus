"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { mountParallax } from "@/lib/parallax";
import ClientMarquee from "@/components/ui/ClientMarquee/ClientMarquee";
import { BADGE, PROCESS, STATEMENT, STATEMENT_HIGHLIGHTS, WHAT_WE_DO } from "@/content/copy";
import { STUDIO_IMAGE } from "@/content/projects";
import "./WhatWeDo.css";

gsap.registerPlugin(ScrollTrigger);

/* Real service names only. Each character is placed on its own angular
   step: even spacing regardless of glyph width, which a textPath cannot
   guarantee. */
const HIGHLIGHT = new Set(STATEMENT_HIGHLIGHTS);
const BADGE_CHARS = [...BADGE];
const BADGE_STEP = 360 / BADGE_CHARS.length;

/* What we do, said once and in order: the statement, then the three
   columns that back it — how we work, the work, the words.

   It used to carry ten things (label, justified caps statement, disc, two
   justified paragraphs, figure, tagline, borrowed quote, facts ticker, the
   index) in a staggered grid, in seven type styles. The ticker repeated the
   hero's own facts and the quote was someone else's line; both went. The
   statement is now the site's heading voice — Medium, sentence case, left
   set — rather than the one bold, justified, all-caps block on the page. */
export default function WhatWeDo() {
  const ref = useRef(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.classList.add("is-static");
      return;
    }

    // the badge's spin and the client names' run pause off screen
    const seen = new IntersectionObserver(
      ([entry]) => section.classList.toggle("is-idle", !entry.isIntersecting),
      { rootMargin: "10% 0px" }
    );
    seen.observe(section);

    const ctx = gsap.context(() => {
      /* each word carries a clipped overlay in the full ink over a lighter
         base, and the clip opens as you scroll — a progress state, not a
         one-shot reveal. Highlight words: a navy bar sweeps across the word,
         then slides off to the right while the blue fill opens behind it,
         in the same slot length as every other word. */
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ".m2-statement",
          start: "top 80%",
          end: "bottom 45%",
          scrub: true,
        },
      });
      gsap.utils.toArray(".m2-word", section).forEach((word, i) => {
        const at = i * 0.6;
        const fill = word.querySelector(".m2-fill");
        const bar = word.querySelector(".hl-bar");
        if (!bar) {
          tl.to(fill, { clipPath: "inset(0 0% 0 0)", duration: 1 }, at);
          return;
        }
        tl.to(bar, { clipPath: "inset(0 0% 0 0%)", duration: 0.45 }, at)
          .to(bar, { clipPath: "inset(0 0% 0 100%)", duration: 0.55 }, at + 0.45)
          .to(fill, { clipPath: "inset(0 0% 0 0)", duration: 0.55 }, at + 0.45);
      });

      // the columns rise in together, a beat apart, as they arrive
      gsap.fromTo(
        [".m2-label", ".m2-badge"],
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: { trigger: section, start: "top 70%", once: true },
        }
      );
      gsap.fromTo(
        ".m2-body > *",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ".m2-body", start: "top 80%", once: true },
        }
      );
    }, section);

    const stopParallax = mountParallax(section);

    return () => {
      seen.disconnect();
      stopParallax();
      ctx.revert();
    };
  }, []);

  const words = STATEMENT.split(" ");

  return (
    <section className="m2 theme-paper" id="what-we-do" ref={ref}>
      {/* the head: label and disc on one line, the statement under them */}
      <div className="m2-head">
        <p className="label m2-label">[ 01 · what we do ]</p>

        <div className="m2-badge" aria-hidden="true">
          {/* the ring spins; each letter sits at its own angle, pushed out to
              38% of the badge */}
          <div className="m2-badge-ring">
            {BADGE_CHARS.map((ch, i) => (
              <span
                key={i}
                style={{ transform: `rotate(${i * BADGE_STEP}deg) translateY(-38%)` }}
              >
                {ch === " " ? " " : ch}
              </span>
            ))}
          </div>
          <span className="m2-badge-disc" />
        </div>

        <h2 className="m2-statement" aria-label={STATEMENT}>
          {words.map((word, i) => (
            // the space lives OUTSIDE the inline-block, or it collapses
            <span key={i} aria-hidden="true">
              <span className={HIGHLIGHT.has(word) ? "m2-word is-hl" : "m2-word"}>
                <span className="m2-base">{word}</span>
                <span className="m2-fill">{word}</span>
                {HIGHLIGHT.has(word) && <span className="hl-bar" />}
              </span>{" "}
            </span>
          ))}
        </h2>
      </div>

      {/* three columns on the work grid's tracks, all hung from one line */}
      <div className="m2-body">
        {/* how we work: four steps, in the index's numbered rows */}
        <ol className="m2-process" aria-label="How we work">
          {PROCESS.map((step, i) => (
            <li key={step.title}>
              <span className="m2-process-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="m2-process-text">
                <span className="m2-process-title">{step.title}</span>
                <span className="m2-process-line">{step.line}</span>
              </span>
            </li>
          ))}
        </ol>

        {/* real morpheus work, true colour */}
        <figure className="m2-figure">
          <img
            src={STUDIO_IMAGE.src}
            alt={STUDIO_IMAGE.alt}
            data-speed="0.22"
            loading="lazy"
          />
        </figure>

        <div className="m2-text">
          {WHAT_WE_DO.map((text) => (
            <p key={text}>{text}</p>
          ))}
          {/* and who it has done it for: the column's last line, level
              with the foot of the picture beside it */}
          <ClientMarquee />
        </div>
      </div>
    </section>
  );
}
