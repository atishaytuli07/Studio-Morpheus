"use client";

import "./Services.css";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Copy from "@/components/Copy/Copy";
import GridFrame from "@/components/GridFrame/GridFrame";

gsap.registerPlugin(ScrollTrigger);

/* verbatim service one-liners from the brand brief */
const SERVICES = [
  {
    name: "Branding",
    line: "Unleash your brand's potential — let's make it extraordinary.",
  },
  {
    name: "Social Media",
    line: "Turn your scroll into a stop — let's spark conversations with your socials.",
  },
  {
    name: "Media Production",
    line: "From concept to screen — we can make your vision unforgettable.",
  },
  {
    name: "Design",
    line: "Good design isn't seen — it's felt. Let's make 'em feel.",
  },
  {
    name: "Illustration",
    line: "Doodles to masterpieces — let's make your brand impossible to ignore.",
  },
  {
    name: "Marketing",
    line: "Let's turn strategy into success — where your story drives results.",
  },
  {
    name: "Consulting",
    line: "You've got the vision, we've got the strategy — no excuses.",
  },
  {
    name: "Web & Digital",
    line: "Websites that work harder than you — experiences that deliver.",
  },
  {
    name: "Special Projects",
    line: "Got a vision that doesn't fit the box? We got you.",
  },
];

export default function Services() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const cards = cardsRef.current.filter(Boolean);
    if (!section || !cards.length) return;

    // reduced motion: cards fall back to a static grid, no pin
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.classList.add("is-static");
      return;
    }

    const totalCards = cards.length;
    const stickyHeight = window.innerHeight * (totalCards * 0.85);

    const arcAngle = Math.PI * 0.4;
    const startAngle = Math.PI / 2 - arcAngle / 2;

    const getRadius = () =>
      window.innerWidth < 900
        ? window.innerWidth * 7.5
        : window.innerWidth * 2.5;

    // place every card along the arc for a given scroll progress
    function positionCards(progress = 0) {
      const radius = getRadius();
      const cardSpacing = 0.11;
      const initialOffset = -cardSpacing * (totalCards - 1);
      const totalTravel = 1 - initialOffset;
      const arcProgress = initialOffset + progress * totalTravel;

      cards.forEach((card, i) => {
        const cardOffset = (totalCards - 1 - i) * cardSpacing;
        const cardProgress = cardOffset + arcProgress;
        const angle = startAngle + arcAngle * cardProgress;

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const rotation = (angle - Math.PI / 2) * (180 / Math.PI);

        gsap.set(card, {
          x,
          y: -y + radius,
          rotation: -rotation,
          transformOrigin: "center center",
        });
      });
    }

    positionCards(0);

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${stickyHeight}px`,
      pin: true,
      pinSpacing: true,
      scrub: true,
      invalidateOnRefresh: true,
      // pinned sections must refresh in document order: earlier = higher
      refreshPriority: 2,
      onUpdate: (self) => positionCards(self.progress),
    });

    const handleResize = () => positionCards(0);
    window.addEventListener("resize", handleResize);

    return () => {
      trigger.kill();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section className="services" ref={sectionRef} data-nav-invert>
      <GridFrame tone="dark" rules="none" />

      <div className="services-header">
        <Copy variant="flicker">
          <p className="mono">[ what we do ]</p>
        </Copy>
        <Copy variant="mask" splitType="lines">
          <h2 className="services-title">
            Nine ways to build the <em>dream</em>.
          </h2>
        </Copy>
      </div>

      <div className="services-meta">
        <p className="mono">[ 02 ]</p>
        <p className="mono">nine disciplines · one studio</p>
      </div>

      <div className="service-cards">
        {SERVICES.map((service, i) => (
          <article
            key={service.name}
            className="service-card"
            ref={(el) => (cardsRef.current[i] = el)}
          >
            <div className="service-card-media duotone">
              <img src={`/services/service-${i + 1}.jpg`} alt="" loading="lazy" />
              <p className="mono service-card-index">
                {String(i + 1).padStart(2, "0")}
              </p>
            </div>
            <div className="service-card-body">
              <h3 className="service-card-name">{service.name}</h3>
              <p className="service-card-line">{service.line}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
