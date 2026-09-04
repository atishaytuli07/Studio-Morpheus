"use client";

import "./Services2.css";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* the arc carousel the client explicitly kept, restyled for the dark
   monumental world — service one-liners are theirs, verbatim */
const SERVICES = [
  { name: "Branding", line: "Unleash your brand's potential — let's make it extraordinary." },
  { name: "Social Media", line: "Turn your scroll into a stop — let's spark conversations." },
  { name: "Media Production", line: "From concept to screen — we make your vision unforgettable." },
  { name: "Design", line: "Good design isn't seen — it's felt. Let's make 'em feel." },
  { name: "Illustration", line: "Doodles to masterpieces — impossible to ignore." },
  { name: "Marketing", line: "Strategy into success — where your story drives results." },
  { name: "Consulting", line: "You've got the vision, we've got the strategy — no excuses." },
  { name: "Web & Digital", line: "Websites that work harder than you — experiences that deliver." },
  { name: "Special Projects", line: "Got a vision that doesn't fit the box? We got you." },
];

export default function Services2() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const cards = cardsRef.current.filter(Boolean);
    if (!section || !cards.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.classList.add("is-static");
      return;
    }

    const totalCards = cards.length;
    /* 0.8/card meant 9 cards pinned the page for 7.2 viewports (8.2 with the
       section itself) — far too long a toll for the payoff. 0.4 halves it. */
    const stickyHeight = window.innerHeight * (totalCards * 0.35);

    const arcAngle = Math.PI * 0.4;
    const startAngle = Math.PI / 2 - arcAngle / 2;

    const getRadius = () =>
      window.innerWidth < 900
        ? window.innerWidth * 7.5
        : window.innerWidth * 2.5;

    function positionCards(progress = 0) {
      const radius = getRadius();
      const cardSpacing = 0.085;

      /* Only part of the arc is ever on screen: a card is visible while
         |cos(angle)| * radius stays within half the viewport. Solving that
         gives the progress window the sweep should actually cover.
         Driving 0 -> 1 blindly (as this did) spent ~37% of the pin on an
         empty arc — scroll, nothing, cards, nothing. */
      const cardW = cards[0].offsetWidth || 300;
      const limit = Math.min(
        0.999,
        (window.innerWidth / 2 + cardW / 2) / radius
      );
      const spread = (Math.PI / 2 - Math.acos(limit)) / arcAngle;

      // a little runway so the first and last card ease in rather than pop
      const margin = 0.05;
      const lead = cardSpacing * (totalCards - 1);
      const from = 0.5 - spread - lead - margin;
      const to = 0.5 + spread + margin;
      const arcProgress = from + progress * (to - from);

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
    <section className="s2" ref={sectionRef}>
      <div className="s2-header">
        <p className="s2-label">[ 02 — what we do ]</p>
        <h2 className="s2-title">Nine ways to build the dream</h2>
      </div>

      <div className="s2-cards">
        {SERVICES.map((service, i) => (
          <article
            key={service.name}
            className="s2-card"
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
          >
            <div className="s2-card-media">
              <img src={`/services/service-${i + 1}.jpg`} alt="" loading="lazy" />
              <p className="s2-card-index">{String(i + 1).padStart(2, "0")}</p>
            </div>
            <div className="s2-card-body">
              <h3 className="s2-card-name">{service.name}</h3>
              <p className="s2-card-line">{service.line}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="s2-meta">
        <p>nine disciplines</p>
        <p>one studio</p>
      </div>
    </section>
  );
}
