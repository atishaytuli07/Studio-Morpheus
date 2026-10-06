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

/* What the studio does — the client asked for this section to say that,
   not tell the founder's story (that moves to the About page).

   NEW COPY, pending client sign-off: the old site has no "what we do"
   paragraph, and every one of its one-liners is already in use in the
   services section below. Written in the old site's own vocabulary
   ("full-service", "imagination into reality", "dream"). */
const WHAT_A =
  "morpheus. is a full-service creative studio. Strategy, design and film live under one roof, so an idea travels from the first conversation to the final frame without changing hands.";
const WHAT_B =
  "Every brief starts with the dream behind it. We find what makes a brand worth talking about, shape it into an identity people remember, then carry it everywhere it needs to live — the feed, the website, the shelf and the screen.";

/* the nine disciplines, by their names on the old site */
const DISCIPLINES = [
  "Branding",
  "Design",
  "Media Production",
  "Social Media",
  "Marketing",
  "Illustrations",
  "Consulting",
  "Web & Digital",
  "Special Projects",
];
/* The column carries ONE idea, not three stacked claims. The quote is the
   most distinctive thing the old site says — and it is where the studio's
   name comes from — so it leads, set as a pull quote. The primary tagline
   becomes its small lead-in rather than a competing headline.
   Both verbatim; the second tagline was cut as a near-duplicate claim. */
const TAGLINE = "Transforming ideas into impactful experiences.";
const QUOTE = "The future belongs to those who believe in the beauty of their dreams.";
const QUOTE_BY = "Eleanor Roosevelt";

/* Facts only — no invented numbers. Eight of them, so the list is longer
   than the six-row window it scrolls through and nothing is ever on screen
   twice. All from the old site: the founding year, the service count, the
   founder, the name's origin and the three crafts the statement leads with. */
const STATS = [
  "est. 2024",
  "nine disciplines",
  "india / worldwide",
  "full-service",
  "founder-led",
  "strategy to screen",
  "brand / design / film",
  "the greek god of dreams",
];

/* rows per second — the speed is stated, so adding a fact later does not
   slow the whole list down */
const TICKER_ROWS_PER_SEC = 0.75;

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
        duration: STATS.length / TICKER_ROWS_PER_SEC,
        ease: "none",
        repeat: -1,
      });

      gsap.fromTo(
        [".m2-label", ".m2-badge", ".m2-disciplines", ".m2-stats"],
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
    <section className="m2 v2-invert" id="what-we-do" ref={ref}>
      {/* top row — three zones: label in the left gutter, the statement as a
          narrower centre-right column, the disc in the right gutter */}
      <div className="m2-top">
        <p className="m2-label">[ 01 — what we do ]</p>

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
            lead (indented, bottom-aligned to the figure) · figure · —
            —                · mid (under the figure)     · quote
            disciplines      · —                          · facts ticker */}
      <div className="m2-body">
        <p className="m2-col m2-lead">{WHAT_A}</p>

        {/* real morpheus work, true colour — not a person any more */}
        <figure className="m2-figure">
          <img
            src="/work/work-2.jpg"
            alt="An office interior designed by studio morpheus."
            data-speed="0.22"
            loading="lazy"
          />
        </figure>

        <p className="m2-col m2-mid">{WHAT_B}</p>

        <div className="m2-right">
          <p className="m2-eyebrow">{TAGLINE}</p>
          <blockquote className="m2-quote">
            <p>{QUOTE}</p>
            <cite>{QUOTE_BY}</cite>
          </blockquote>
        </div>

        {/* the index of what we do — where the small frame used to sit */}
        <ol className="m2-disciplines">
          {DISCIPLINES.map((d, i) => (
            <li key={d}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {d}
            </li>
          ))}
        </ol>

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
