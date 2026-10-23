"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { mountParallax } from "@/lib/parallax";
import { ArrowIcon } from "@/components/ui/Icons";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import { PROJECTS } from "@/content/projects";
import "./SelectedWork.css";

gsap.registerPlugin(ScrollTrigger);

export default function SelectedWork() {
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
    <section className="w2 theme-paper" id="work" ref={ref}>
      <header className="w2-head">
        <div>
          <SectionHeading label="[ 03 · selected work ]" title="Selected Work" className="w2-label" />
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
                <ArrowIcon className="w2-arrow" strokeWidth={1.6} hidden />
              </h3>
              <p className="w2-tags">{p.tags}</p>
            </a>
          </article>
          );
        })}
      </div>

      <Button href="/work" variant="dark" className="w2-all">
        View all work
      </Button>
    </section>
  );
}
