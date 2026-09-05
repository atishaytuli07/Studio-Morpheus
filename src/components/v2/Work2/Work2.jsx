"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { mountParallax } from "../parallax";
import "./Work2.css";

gsap.registerPlugin(ScrollTrigger);

/* Two pieces, not four: "selected" work should be a shortlist, and at this
   scale two carry the section better than four half-seen ones.

   PLACEHOLDER FRAMING — the images are real morpheus work, but the client
   has not supplied project names or case-study copy (the old site's project
   pages are image-only). Until then each piece is titled by its discipline
   and described with that service's own words, verbatim from the old site.
   Swap `title` and `body` for real project names and write-ups on delivery. */
const PROJECTS = [
  {
    title: "Branding",
    body: "Your brand isn't just a logo—it's a story. We turn ideas into captivating brands. Through striking visuals and powerful stories, we create identities that leave a lasting impact.",
    src: "/work/work-4.jpg",
  },
  {
    title: "Design",
    body: "Design is where imagination meets purpose. From sleek websites to captivating graphics, every detail is designed to inspire. Let's turn your vision into stunning reality.",
    src: "/work/work-1.jpg",
  },
];

const Card = ({ project, index }) => (
  <article className="w2-item">
    <figure className="w2-media">
      <img src={project.src} alt={project.title} data-speed="0.30" loading="lazy" />
    </figure>
    <h3 className="w2-title">
      {project.title}
      <span className="w2-mark" aria-hidden="true" />
    </h3>
    <p className="w2-body">{project.body}</p>
    <p className="w2-index" aria-hidden="true">
      {String(index + 1).padStart(2, "0")}
    </p>
  </article>
);

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
      // one-shot rise per card as it arrives — no idle loops, no pin
      gsap.utils.toArray(".w2-item").forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 85%", once: true },
          }
        );
      });

    }, section);

    // the images drift slower than the page — depth, not motion
    const stopParallax = mountParallax(section);

    return () => {
      stopParallax();
      ctx.revert();
    };
  }, []);

  // split into two column stacks so the right one can hang lower; a single
  // grid with margins would drag the following row down with it
  const left = PROJECTS.filter((_, i) => i % 2 === 0);
  const right = PROJECTS.filter((_, i) => i % 2 === 1);

  return (
    <section className="w2 v2-invert" ref={ref}>
      <header className="w2-head">
        <p className="w2-label">[ 03 — selected work ]</p>
        <h2 className="w2-heading">Selected Work</h2>
      </header>

      <div className="w2-cols">
        <div className="w2-col">
          {left.map((p, i) => (
            <Card key={p.title} project={p} index={i * 2} />
          ))}
        </div>
        <div className="w2-col w2-col-offset">
          {right.map((p, i) => (
            <Card key={p.title} project={p} index={i * 2 + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
