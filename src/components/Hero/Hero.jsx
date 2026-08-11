"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Copy from "@/components/Copy/Copy";
import GridFrame from "@/components/GridFrame/GridFrame";

import "./Hero.css";

const SERVICE_LIST = [
  "branding",
  "social media",
  "media production",
  "design",
  "illustration",
  "marketing",
  "consulting",
  "web & digital",
  "special projects",
];

export default function Hero({ introDelay = 0.5 }) {
  const heroRef = useRef(null);

  useGSAP(
    () => {
      // reduced motion: land everything in its final state, no choreography
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set([".hero .grid-v", ".hero .grid-h"], { scale: 1 });
        gsap.set(".hero .grid-sparkle", { opacity: 1, scale: 1 });
        gsap.set(".hero-bloom", { opacity: 0.8 });
        gsap.set(".hero-plate", { opacity: 1, scale: 1 });
        gsap.set([".hero-cta", ".hero-strip", ".hero-meta"], {
          opacity: 1,
          y: 0,
        });
        return;
      }

      const tl = gsap.timeline({ delay: introDelay });

      tl.fromTo(
        ".hero .grid-v",
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1.6,
          ease: "power3.inOut",
          stagger: 0.08,
          transformOrigin: "50% 0%",
        },
        0
      )
        .fromTo(
          ".hero .grid-h",
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.4,
            ease: "power3.inOut",
            transformOrigin: "0% 50%",
          },
          0.3
        )
        .fromTo(
          ".hero .grid-sparkle",
          { opacity: 0, scale: 0.4 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "back.out(2)",
            stagger: 0.06,
          },
          1
        )
        .fromTo(
          ".hero-bloom",
          { opacity: 0 },
          { opacity: 1, duration: 2.6, ease: "power2.out" },
          0
        )
        .fromTo(
          ".hero-plate",
          { opacity: 0, scale: 1.08 },
          { opacity: 1, scale: 1, duration: 2, ease: "power3.out" },
          0.3
        )
        .fromTo(
          [".hero-cta", ".hero-strip"],
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.12,
          },
          1.5
        );

      gsap.to(".hero-bloom", {
        opacity: 0.62,
        duration: 6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: introDelay + 3,
      });
    },
    { scope: heroRef, dependencies: [introDelay] }
  );

  return (
    <section className="hero on-dark" ref={heroRef}>
      {/* atmosphere */}
      <div className="hero-bloom" aria-hidden="true" />
      {/* classical statuary, with the coded light shafts and mist layered
          over it so the image sits inside the atmosphere rather than on top */}
      <div className="hero-plate" aria-hidden="true">
        <img className="hero-figure" src="/hero/hero-new.png" alt="" />
        <div className="hero-shafts">
          <span className="hero-shaft" style={{ "--i": 0 }} />
          <span className="hero-shaft" style={{ "--i": 1 }} />
          <span className="hero-shaft" style={{ "--i": 2 }} />
          <span className="hero-shaft" style={{ "--i": 3 }} />
        </div>
        <div className="hero-mist hero-mist-a" />
        <div className="hero-mist hero-mist-b" />
      </div>

      <GridFrame tone="light" rules="top" />

      <div className="hero-inner">
        <div className="hero-body">
          <Copy
            variant="flicker"
            animateOnScroll={false}
            delay={introDelay + 0.7}
          >
            <p className="mono hero-eyebrow">[ the greek god of dreams ]</p>
          </Copy>

          <h1 className="hero-title">
            <Copy
              variant="mask"
              splitType="lines"
              animateOnScroll={false}
              delay={introDelay + 0.85}
            >
              <span className="hero-title-inner">
                Transforming <em>ideas</em> into impactful experiences.
              </span>
            </Copy>
          </h1>

          <Copy variant="mask" animateOnScroll={false} delay={introDelay + 1.2}>
            <p className="hero-sub">
              Just like the Greek god of dreams, we turn creative visions into
              reality.
            </p>
          </Copy>

          <div className="hero-cta">
            <a className="btn" href="mailto:sakshi@dreamwithmorpheus.com">
              Start a project
              <span className="btn-arrow">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="M4.5 11.5L11.5 4.5M11.5 4.5H6M11.5 4.5V10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.25"
                  />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="hero-strip">
        <div className="hero-marquee">
          <div className="hero-marquee-track">
            {Array.from({ length: 4 }).map((_, i) => (
              <span className="hero-marquee-set mono" key={i} aria-hidden={i > 0}>
                {SERVICE_LIST.map((s) => (
                  <span className="hero-marquee-item" key={s}>
                    {s}
                    <span className="hero-marquee-dot">✦</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
