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

   Five on the home page — a pair, one full width, a pair — then the way on
   to the full archive. The full-width slot takes the image that holds up
   best large, the camera. Every source is 1100px wide, so at full width it
   is upscaled and a little soft on a sharp screen: replace it with an
   original of 2600px or more when the client sends one. */
const PROJECTS = [
  { title: "Branding", tags: "Identity, Packaging", src: "/work/work-4.jpg" },
  { title: "Design", tags: "Brand Guidelines, Print", src: "/work/work-guidelines.jpg" },
  { title: "Media Production", tags: "Photo, Film", src: "/work/work-8.jpg", full: true },
  { title: "Social Media", tags: "Content, Illustration", src: "/work/work-social.jpg" },
  { title: "Illustrations", tags: "Editorial, Print", src: "/work/work-illustration.jpg" },
];

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
          <p className="w2-label">[ 03 · selected work ]</p>
          <h2 className="w2-heading">Selected Work</h2>
        </div>
        <p className="w2-count" aria-hidden="true">
          ({String(PROJECTS.length).padStart(2, "0")})
        </p>
      </header>

      <div className="w2-grid">
        {PROJECTS.map((p) => {
          return (
          <article className={`w2-card${p.full ? " is-full" : ""}`} key={p.title}>
            {/* the whole card is the link, as on the reference: frame,
                title and tags are one target */}
            <a className="w2-link" href="/work">
              <figure className="w2-media">
                <div className="w2-zoom">
                  <img src={p.src} alt="" data-speed="0.30" loading="lazy" />
                </div>
              </figure>
              <h3 className="w2-title">
                {p.title}
                {/* says "this opens" on hover; hidden from screen readers */}
                <svg className="w2-arrow" viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="M4.5 11.5L11.5 4.5M11.5 4.5H6M11.5 4.5V10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              </h3>
              <p className="w2-tags">{p.tags}</p>
            </a>
          </article>
          );
        })}
      </div>

      <a className="w2-all" href="/work">
        View all work
        <span className="w2-all-arrow" aria-hidden="true">
          <svg viewBox="0 0 16 16">
              <path
                d="M4.5 11.5L11.5 4.5M11.5 4.5H6M11.5 4.5V10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              />
          </svg>
          <svg viewBox="0 0 16 16">
              <path
                d="M4.5 11.5L11.5 4.5M11.5 4.5H6M11.5 4.5V10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              />
          </svg>
        </span>
      </a>
    </section>
  );
}
