"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { mountParallax } from "../parallax";
import "./Manifesto2.css";

gsap.registerPlugin(ScrollTrigger);

const STATEMENT =
  "A creative studio for brands that dream in bold strategy, design and film, built end to end.";

/* Real service names only — "SPATIAL" was mine and isn't one of the nine.
   Each character is placed on its own angular step, the way the reference
   does it: even spacing regardless of glyph width, which a textPath cannot
   guarantee. */
const BADGE = "BRANDING, DESIGN, ILLUSTRATION, MARKETING, ";
const BADGE_CHARS = [...BADGE];
const BADGE_STEP = 360 / BADGE_CHARS.length;

/* Every line of body copy below is verbatim from dreamwithmorpheus.com.
   The founder paragraph is four sentences; it is split 2 + 2 across the
   left column and the column under the portrait. Nothing here is mine. */
const FOUNDER_A =
  "Morpheus began as a dream in the mind of Sakshi, with a passion for creativity and transformation. Inspired by the Greek god of dreams, morpheus reflects the journey of turning imagination into reality — a path our founder knows well.";
const FOUNDER_B =
  "What started as a personal aspiration is now a thriving creative agency, dedicated to helping brands shape their own dreams into impactful experiences. With morpheus, Sakshi aspires to do for businesses, what she did for herself — turn bold ideas into meaningful realities, blending creativity and strategy to craft stories that resonate and inspire.";
/* The column carries ONE idea, not three stacked claims. The quote is the
   most distinctive thing the old site says — and it is where the studio's
   name comes from — so it leads, set as a pull quote. The primary tagline
   becomes its small lead-in rather than a competing headline.
   Both verbatim; the second tagline was cut as a near-duplicate claim. */
const TAGLINE = "Transforming ideas into impactful experiences.";
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

      /* the ticker: one continuous drift, no steps and no holds. The list is
         rendered twice, so -50% lands exactly on the identical second set
         and the loop is seamless. */
      gsap.to(".m2-stats-track", {
        yPercent: -50,
        duration: 14,
        ease: "none",
        repeat: -1,
      });

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

    const stopParallax = mountParallax(section);

    return () => {
      stopParallax();
      ctx.revert();
    };
  }, []);

  const words = STATEMENT.split(" ");

  return (
    <section className="m2 v2-invert" ref={ref}>
      {/* top row — three zones: label in the left gutter, the statement as a
          narrower centre-right column, the disc in the right gutter */}
      <div className="m2-top">
        {/* the corner arrow is drawn, not typed: Neue Montreal has no glyph
            for U+21B3, so the character fell back and rendered as "l," */}
        <p className="m2-label">
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path
              d="M1.5 1v6.5h7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path d="M6.5 5.2 9.8 7.5 6.5 9.8z" fill="currentColor" />
          </svg>
          the studio
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
          {/* the ring spins; each letter sits at its own angle, pushed out to
              38% of the badge (the reference: 75px on a 198px circle) */}
          <div className="m2-badge-ring">
            {BADGE_CHARS.map((ch, i) => (
              <span
                key={i}
                style={{ transform: `rotate(${i * BADGE_STEP}deg) translateY(-38%)` }}
              >
                {ch === " " ? " " : ch}
              </span>
            ))}
          </div>
          <span className="m2-badge-disc" />
        </div>
      </div>

      {/* body — the staggered editorial grid. Named areas so the stagger is
          declared, not accidental:
            lead (indented, bottom-aligned to the portrait) · portrait · —
            —              · mid (under the portrait) · quote
            second image   · —                        · facts ticker      */}
      <div className="m2-body">
        <p className="m2-col m2-lead">{FOUNDER_A}</p>

        <figure className="m2-portrait">
          <img
            src="/founder/portrait.jpg"
            alt="Sakshi Gopal Bhatt, founder of studio morpheus."
            data-speed="0.22"
            loading="lazy"
          />
        </figure>

        <p className="m2-col m2-mid">{FOUNDER_B}</p>

        <div className="m2-right">
          <p className="m2-eyebrow">{TAGLINE}</p>
          <blockquote className="m2-quote">
            <p>{QUOTE}</p>
            <cite>{QUOTE_BY}</cite>
          </blockquote>
        </div>

        <figure className="m2-img">
          <img src="/work/work-8.jpg" alt="" data-speed="0.32" loading="lazy" />
        </figure>

        {/* the facts drifting through a fixed window. The list is rendered
            twice so the -50% loop is seamless; the second set is marked as a
            clone so reduced motion can drop it. */}
        <div className="m2-stats" aria-label={STATS.join(", ")}>
          <div className="m2-stats-track" aria-hidden="true">
            {[...STATS, ...STATS].map((s, i) => (
              <p
                className={i >= STATS.length ? "m2-stat is-clone" : "m2-stat"}
                key={i}
              >
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
