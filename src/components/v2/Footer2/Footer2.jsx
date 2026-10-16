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

/* --- the O's weight turns while the letter stays still ---------------------

   The O is an oblique oval, and its stroke is already uneven — 7.2 units at
   the thin flanks, 15.5 at the top and bottom. That unevenness is not drawn
   into the contours: both are near-symmetrical, and the weight comes entirely
   from the counter sitting 6.4 units off the centre of the outline. Move that
   offset around a circle and the heavy side travels with it, while the
   outline itself never moves a pixel. No second ring, no overlay, no partial
   opacity — the same two contours as the static mark, one of them gliding.

   Radius is the letter's own 6.4 scaled back to 4.5, which keeps the thinnest
   the stroke ever gets at 4.9 units. At the full 6.4 it drops to 3.0 and the
   ring reads as about to snap. */
const O_INDEX = 1;
const [O_OUTER, O_COUNTER] = WORDMARK_GLYPHS[O_INDEX].d
  .split("Z")
  .filter((sub) => sub.trim())
  .map((sub) => `${sub}Z`);

/* the paths are plain polylines — every number is an x or a y in turn */
const bounds = (d) => {
  const n = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
  const xs = n.filter((_, i) => i % 2 === 0);
  const ys = n.filter((_, i) => i % 2 === 1);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    w: Math.max(...xs) - Math.min(...xs),
    h: Math.max(...ys) - Math.min(...ys),
  };
};
const O_BOX = bounds(O_OUTER);
const C_BOX = bounds(O_COUNTER);
/* the offset that gives the letter its stress, as an angle and a radius */
const O_VX = C_BOX.x + C_BOX.w / 2 - (O_BOX.x + O_BOX.w / 2);
const O_VY = C_BOX.y + C_BOX.h / 2 - (O_BOX.y + O_BOX.h / 2);
const O_PHASE = Math.atan2(O_VY, O_VX);
const O_RADIUS = 4.5;
const O_TURN = 24; // seconds

/* Plain lists, no mono headers — the columns read as one utility bar next to
   the brand and the CTA, rather than three labelled boxes. */
const COLUMNS = [
  [
    { label: "Work", href: "#work" },
    { label: "Studio", href: "#what-we-do" },
    { label: "Services", href: "#services" },
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
  const counterRef = useRef(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    /* The counter's offset walks a circle, so the weight rotates. This is a
       plain translation computed per frame rather than a CSS rotation: a
       rotation about the outline's centre would carry the counter's own
       oblique axis with it and punch straight through the outline, and
       nesting groups to cancel that back out would leave the rotation origin
       at the mercy of transform-box. One attribute on one node is cheaper
       than the mask redraw it triggers anyway. */
    const counter = counterRef.current;
    const spin = gsap.to(
      { t: 0 },
      {
        t: 1,
        duration: O_TURN,
        ease: "none",
        repeat: -1,
        onUpdate() {
          const a = O_PHASE + this.targets()[0].t * Math.PI * 2;
          const dx = Math.cos(a) * O_RADIUS - O_VX;
          const dy = Math.sin(a) * O_RADIUS - O_VY;
          counter.setAttribute("transform", `translate(${dx.toFixed(3)} ${dy.toFixed(3)})`);
        },
      }
    );

    // it is the page's one idle loop — it must not run where nobody sees it
    const seen = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? spin.resume() : spin.pause()),
      { rootMargin: "10%" }
    );
    seen.observe(section);

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

    return () => {
      seen.disconnect();
      spin.kill();
      ctx.revert();
    };
  }, []);

  return (
    <footer className="f2" id="contact" ref={ref}>
      <div className="f2-inner">
        {/* the hero's horizon glow returns behind the wordmark — bookend light */}
        <div className="f2-glow" aria-hidden="true" />

        {/* utility bar: the invitation left (modest, sentence case — the
            wordmark below is the only giant), links centre, the CTA right.
            The small brand mark went: it was redundant under the wordmark. */}
        <div className="f2-row">
          <div className="f2-invite">
            <p className="f2-label">[ 06 — the invitation ]</p>
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
            <defs>
              {/* The O is painted through this instead of as a filled path,
                  so the counter can be moved on its own. userSpaceOnUse keeps
                  these coordinates in the glyph's own space — the same one
                  the path data is written in. */}
              <mask
                id="f2-o-ring"
                maskUnits="userSpaceOnUse"
                x={O_BOX.x - 12}
                y={O_BOX.y - 12}
                width={O_BOX.w + 24}
                height={O_BOX.h + 24}
              >
                <path d={O_OUTER} fill="#fff" />
                <g ref={counterRef}>
                  <path d={O_COUNTER} fill="#000" />
                </g>
              </mask>
            </defs>

            {WORDMARK_GLYPHS.map((glyph, i) =>
              i === O_INDEX ? (
                <g key={i} transform={`translate(${glyph.tx} 0)`}>
                  <rect
                    x={O_BOX.x}
                    y={O_BOX.y}
                    width={O_BOX.w}
                    height={O_BOX.h}
                    fill="currentColor"
                    mask="url(#f2-o-ring)"
                  />
                </g>
              ) : (
                <g key={i} transform={`translate(${glyph.tx} 0)`}>
                  <path
                    d={glyph.d}
                    fill="currentColor"
                    fillRule={glyph.evenodd ? "evenodd" : undefined}
                    clipRule={glyph.evenodd ? "evenodd" : undefined}
                  />
                </g>
              )
            )}
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
