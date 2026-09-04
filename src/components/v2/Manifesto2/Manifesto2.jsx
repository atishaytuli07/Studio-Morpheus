"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./Manifesto2.css";

gsap.registerPlugin(ScrollTrigger);

const STATEMENT =
  "A creative studio for brands that dream in bold — strategy, design and film, built end to end.";

const BADGE = "BRANDING · FILM · SPATIAL · SOCIAL · ";

/* Every line of body copy below is verbatim from dreamwithmorpheus.com.
   The founder paragraph is four sentences; it is split 2 + 2 across the
   left column and the column under the portrait. Nothing here is mine. */
const FOUNDER_A =
  "Morpheus began as a dream in the mind of Sakshi, with a passion for creativity and transformation. Inspired by the Greek god of dreams, morpheus reflects the journey of turning imagination into reality — a path our founder knows well.";
const FOUNDER_B =
  "What started as a personal aspiration is now a thriving creative agency, dedicated to helping brands shape their own dreams into impactful experiences. With morpheus, Sakshi aspires to do for businesses, what she did for herself — turn bold ideas into meaningful realities, blending creativity and strategy to craft stories that resonate and inspire.";
/* The site's own two taglines — both verbatim, and both previously homeless
   in this rebuild. The primary one has been unplaced since we started. */
const TAGLINE = "Transforming ideas into impactful experiences.";
const TAGLINE_2 = "Dream bigger. We'll make it happen.";
const QUOTE = "The future belongs to those who believe in the beauty of their dreams.";
const QUOTE_BY = "Eleanor Roosevelt";

/* facts only — no invented numbers */
const STATS = ["est. 2024", "nine disciplines", "india / worldwide", "founder-led"];

export default function Manifesto2() {
  const ref = useRef(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.classList.add("is-static");
      return;
    }

    const ctx = gsap.context(() => {
      /* Constantine's device: each word carries a clipped overlay in the
         full ink over a lighter base, and the clip opens as you scroll.
         Scrubbed — a progress state, not a one-shot reveal. */
      gsap.to(".m2-fill", {
        clipPath: "inset(0 0% 0 0)",
        ease: "none",
        stagger: 0.6,
        scrollTrigger: {
          trigger: ".m2-top",
          start: "top 78%",
          end: "bottom 45%",
          scrub: true,
        },
      });

      /* the ticker: step the track up one line at a time, hold, and at the
         end (on the repeated first item) snap silently back to the top */
      const n = STATS.length;
      const step = 100 / (n + 1);
      const tick = gsap.timeline({ repeat: -1, defaults: { ease: "power3.inOut" } });
      for (let i = 1; i <= n; i++) {
        tick.to(".m2-stats-track", { yPercent: -step * i, duration: 0.55 }, "+=2.1");
      }
      tick.set(".m2-stats-track", { yPercent: 0 });

      gsap.fromTo(
        [".m2-label", ".m2-badge", ".m2-stats"],
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
    }, section);

    return () => ctx.revert();
  }, []);

  const words = STATEMENT.split(" ");

  return (
    <section className="m2 v2-invert" ref={ref}>
      {/* top row — three zones: label in the left gutter, the statement as a
          narrower centre-right column, the disc in the right gutter */}
      <div className="m2-top">
        <p className="m2-label">
          <span aria-hidden="true">↳</span> the studio
        </p>

        <h2 className="m2-statement" aria-label={STATEMENT}>
          {words.map((word, i) => (
            // the space lives OUTSIDE the inline-block, or it collapses
            <span key={i} aria-hidden="true">
              <span className="m2-word">
                <span className="m2-base">{word}</span>
                <span className="m2-fill">{word}</span>
              </span>{" "}
            </span>
          ))}
        </h2>

        <div className="m2-badge" aria-hidden="true">
          <svg viewBox="0 0 200 200">
            <defs>
              <path
                id="m2-ring"
                d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0"
                fill="none"
              />
            </defs>
            <text className="m2-badge-text">
              {/* textLength = the ring's circumference (2π·74), so one repeat
                  is spaced evenly round the full circle — no seam where a
                  clipped tail meets the restart */}
              <textPath href="#m2-ring" textLength="465" lengthAdjust="spacing">
                {BADGE}
              </textPath>
            </text>
          </svg>
          <span className="m2-badge-disc" />
        </div>
      </div>

      {/* body — the staggered editorial grid. Named areas so the stagger is
          declared, not accidental:
            lead (indented, bottom-aligned to the portrait) · portrait · —
            —                · mid (under the portrait)     · quote
            second image     · facts list                   · —           */}
      <div className="m2-body">
        <p className="m2-col m2-lead">{FOUNDER_A}</p>

        <figure className="m2-portrait">
          <img
            src="/founder/portrait.jpg"
            alt="Sakshi Gopal Bhatt, founder of studio morpheus."
            loading="lazy"
          />
        </figure>

        <p className="m2-col m2-mid">{FOUNDER_B}</p>

        <div className="m2-right">
          <p className="m2-col m2-tagline">{TAGLINE}</p>
          <p className="m2-col m2-tagline-2">{TAGLINE_2}</p>
          <blockquote className="m2-col m2-quote">
            <p>{QUOTE}</p>
            <cite>— {QUOTE_BY}</cite>
          </blockquote>
        </div>

        <figure className="m2-img">
          <img src="/work/work-8.jpg" alt="" loading="lazy" />
        </figure>

        {/* the facts as a one-line vertical ticker: fixed height, each item
            rolls up into view, holds, rolls out. The first item is repeated
            at the end so the wrap is seamless. */}
        <div className="m2-stats" aria-label={STATS.join(", ")}>
          <div className="m2-stats-track" aria-hidden="true">
            {[...STATS, STATS[0]].map((s, i) => (
              <p className="m2-stat" key={i}>
                <span>¬</span>
                {s}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
