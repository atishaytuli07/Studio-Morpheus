"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { mountParallax } from "../parallax";
import "./Work2.css";

gsap.registerPlugin(ScrollTrigger);

/* PLACEHOLDER FRAMING — the images are real morpheus work, but the client
   has not supplied project names (the old site's project pages are
   image-only). Each piece is titled by its discipline, with the tags
   describing what is in the frame. Swap `title` and `tags` for the client
   name and categories on delivery.

   Every image is the studio's own work for one service, taken from the old
   site's hero slider, and each is titled by the service its slide carried:
   the brand-guideline booklets sat on Design, the arched interior on
   Marketing. Six, so the grid closes as two full rows — the second
   mirroring the first's heights. */
const PROJECTS = [
  { title: "Branding", tags: "Identity, Packaging", src: "/work/work-4.jpg" },
  { title: "Media Production", tags: "Photo, Film", src: "/work/work-8.jpg" },
  { title: "Design", tags: "Brand Guidelines, Print", src: "/work/work-guidelines.jpg" },
  { title: "Social Media", tags: "Content, Illustration", src: "/work/work-social.jpg" },
  { title: "Illustrations", tags: "Editorial, Print", src: "/work/work-illustration.jpg" },
  { title: "Marketing", tags: "Campaign Visuals, 3D", src: "/work/work-1.jpg" },
];

/* Frame heights cycle tall → square → wide across a row and run the other
   way on the next, so no two neighbours share a bottom edge and the grid
   never settles into a table. Titles sit under their own frame, so the
   captions step too. */
const SHAPES = ["tall", "square", "wide"];

/* A short last row must not leave a hole in the grid. Two left over share
   the row, a column and a half each; one left over takes it whole. Wider
   frames need shallower shapes or they tower over the row above. */
const layoutFor = (i, total) => {
  const row = Math.floor(i / 3);
  const col = i % 3;
  const inRow = Math.min(3, total - row * 3);
  if (inRow === 2) return { shape: col === 0 ? "wide" : "pano", span: "is-half" };
  if (inRow === 1) return { shape: "pano", span: "is-full" };
  return { shape: SHAPES[row % 2 === 0 ? col : 2 - col], span: "" };
};

export default function Work2() {
  const ref = useRef(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.classList.add("is-static");
      return;
    }

    const ctx = gsap.context(() => {
      // one-shot rise per row as it arrives, the cards a beat apart
      gsap.fromTo(
        ".w2-card",
        { opacity: 0, y: 48 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: ".w2-grid", start: "top 82%", once: true },
        }
      );
    }, section);

    // the images drift slower than the page — depth, not motion
    const stopParallax = mountParallax(section);

    return () => {
      stopParallax();
      ctx.revert();
    };
  }, []);

  return (
    <section className="w2 v2-invert" id="work" ref={ref}>
      <header className="w2-head">
        <div>
          <p className="w2-label">[ 03 — selected work ]</p>
          <h2 className="w2-heading">Selected Work</h2>
        </div>
        <p className="w2-count" aria-hidden="true">
          ({String(PROJECTS.length).padStart(2, "0")})
        </p>
      </header>

      <div className="w2-grid">
        {PROJECTS.map((p, i) => {
          const { shape, span } = layoutFor(i, PROJECTS.length);
          return (
          <article className={`w2-card is-${shape} ${span}`} key={p.title}>
            {/* the whole card is the link, as on the reference: frame,
                title and tags are one target */}
            <a className="w2-link" href="/work">
              <figure className="w2-media">
                <div className="w2-zoom">
                  <img src={p.src} alt={p.title} data-speed="0.30" loading="lazy" />
                </div>
              </figure>
              <h3 className="w2-title">{p.title}</h3>
              <p className="w2-tags">{p.tags}</p>
            </a>
          </article>
          );
        })}
      </div>

      <a className="w2-all" href="/work">
        View all work
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M4.5 11.5L11.5 4.5M11.5 4.5H6M11.5 4.5V10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </a>
    </section>
  );
}
