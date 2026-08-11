"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Copy from "@/components/Copy/Copy";
import GridFrame from "@/components/GridFrame/GridFrame";

import "./Founder.css";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: "9", label: "services" },
  { value: "2024", label: "founded" },
  { value: "1:1", label: "founder-led" },
];

export default function Founder() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      // reduced motion: everything rests in its final state
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(".founder-rule", { scaleX: 1 });
        gsap.set(".founder-stat", { opacity: 1, y: 0 });
        gsap.set(".founder-portrait", { opacity: 1, scale: 1 });
        return;
      }

      const rules = gsap.utils.toArray(".founder-rule");

      gsap.fromTo(
        rules,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.4,
          ease: "power3.inOut",
          stagger: 0.1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".founder-stat",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: ".founder-stats",
            start: "top 85%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".founder-portrait",
        { opacity: 0, scale: 1.06 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".founder-portrait",
            start: "top 85%",
            once: true,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section className="founder" ref={sectionRef} data-nav-invert>
      <GridFrame tone="dark" rules="none" />

      <div className="founder-inner">
        <div className="founder-head">
          <span className="tag tag-dark">the founder</span>
          <span className="founder-rule" />
          <p className="mono mono-dark">[ 01 ]</p>
        </div>

        <h2 className="founder-title">
          Morpheus began as a <em>dream</em> in the mind of Sakshi.
        </h2>

        <div className="founder-grid">
          <div className="founder-aside">
            <div className="founder-portrait">
              <img
                src="/founder/portrait.jpg"
                alt="Sakshi Gopal Bhatt, founder and CEO of studio morpheus."
                loading="lazy"
              />
              <span className="mono founder-portrait-cap">
                [ sakshi gopal bhatt ]
              </span>
            </div>
          </div>

          <div className="founder-body">
            <Copy variant="mask" splitType="lines">
              <p className="founder-para">
                Inspired by the Greek god of dreams, morpheus reflects the
                journey of turning imagination into reality — a path our founder
                knows well. What started as a personal aspiration is now a
                thriving creative agency, dedicated to helping brands shape
                their own dreams into impactful experiences.
              </p>
            </Copy>

            <Copy variant="mask" splitType="lines">
              <p className="founder-para">
                With morpheus, Sakshi aspires to do for businesses what she did
                for herself — turn bold ideas into meaningful realities,
                blending creativity and strategy to craft stories that resonate
                and inspire.
              </p>
            </Copy>

            <div className="founder-sign">
              <p className="founder-name">Sakshi Gopal Bhatt</p>
              <p className="mono">founder &amp; ceo</p>
            </div>
          </div>
        </div>

        <span className="founder-rule" />

        <div className="founder-stats">
          {STATS.map((s) => (
            <div className="founder-stat" key={s.label}>
              <p className="founder-stat-value">{s.value}</p>
              <p className="mono mono-dark">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
