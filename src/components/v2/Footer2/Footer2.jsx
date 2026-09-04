"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { WORDMARK_GLYPHS, WORDMARK_VIEWBOX } from "../Hero2/wordmark";
import "./Footer2.css";

gsap.registerPlugin(ScrollTrigger);

/* The shared viewBox is 83 units tall but the glyphs only ink y 14.58–81.74,
   so ~18% of it is empty space above the caps. The hero wants that padding;
   the footer does not — it pushed the mark down and forced an ugly crop.
   Tightening to the inked bounds makes the element's box equal the letters. */
const INK_TOP = 14.58;
const INK_HEIGHT = 67.16;
const WM_WIDTH = Number(WORDMARK_VIEWBOX.split(" ")[2]);
const TIGHT_VIEWBOX = `0 ${INK_TOP} ${WM_WIDTH} ${INK_HEIGHT}`;

/* Plain lists, no mono headers — the columns read as one utility bar next to
   the brand and the CTA, rather than three labelled boxes. */
const COLUMNS = [
  [
    { label: "Work", href: "/work" },
    { label: "Studio", href: "/studio" },
    { label: "Services", href: "/services" },
  ],
  [
    {
      label: "Instagram",
      href: "https://www.instagram.com/_studiomorpheus",
      external: true,
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/morpheusofficial/",
      external: true,
    },
  ],
  [
    {
      label: "sakshi@dreamwithmorpheus.com",
      href: "mailto:sakshi@dreamwithmorpheus.com",
    },
    { label: "+91 77779 18010", href: "tel:+917777918010" },
  ],
];

const Arrow = () => (
  <span className="f2-btn-arrow">
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M4.5 11.5L11.5 4.5M11.5 4.5H6M11.5 4.5V10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M4.5 11.5L11.5 4.5M11.5 4.5H6M11.5 4.5V10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  </span>
);

export default function Footer2() {
  const ref = useRef(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      // deadspace's parallax reveal: the panel rises from behind the page
      gsap.fromTo(
        ".f2-inner",
        { yPercent: -26 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <footer className="f2" ref={ref}>
      <div className="f2-inner">
        {/* the hero's horizon glow returns behind the wordmark — bookend light */}
        <div className="f2-glow" aria-hidden="true" />

        {/* utility bar: the invitation left (modest, sentence case — the
            wordmark below is the only giant), links centre, the CTA right.
            The small brand mark went: it was redundant under the wordmark. */}
        <div className="f2-row">
          <div className="f2-invite">
            <p className="f2-label">[ 05 — the invitation ]</p>
            <h2 className="f2-line">Have a dream? Let&apos;s build it.</h2>
          </div>

          <nav className="f2-cols">
            {COLUMNS.map((col, i) => (
              <div className="f2-col" key={i}>
                {col.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    {...(item.external
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            ))}
          </nav>

          <a className="f2-btn" href="mailto:sakshi@dreamwithmorpheus.com">
            Start a project
            <Arrow />
          </a>
        </div>

        {/* the wordmark returns to close the loop with the hero */}
        <div className="f2-wordmark" role="img" aria-label="morpheus">
          <svg
            viewBox={TIGHT_VIEWBOX}
            width="100%"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            {WORDMARK_GLYPHS.map((glyph, i) => (
              <g key={i} transform={`translate(${glyph.tx} 0)`}>
                <path
                  d={glyph.d}
                  fill="currentColor"
                  fillRule={glyph.evenodd ? "evenodd" : undefined}
                  clipRule={glyph.evenodd ? "evenodd" : undefined}
                />
              </g>
            ))}
          </svg>
        </div>

        <div className="f2-base">
          <p>© {new Date().getFullYear()} studio morpheus.</p>
          <p>the greek god of dreams</p>
        </div>
      </div>
    </footer>
  );
}
