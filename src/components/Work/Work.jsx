"use client";

import "./Work.css";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import Copy from "@/components/Copy/Copy";
import GridFrame from "@/components/GridFrame/GridFrame";

gsap.registerPlugin(ScrollTrigger);

const CARD_Y_OFFSET = 5;
const CARD_SCALE_STEP = 0.075;

/* real work from dreamwithmorpheus.com — titles are descriptive of the
   discipline shown; swap for actual project names when the client supplies them */
const PROJECTS = [
  {
    name: "Brand Identity",
    description:
      "A complete visual identity — mark, palette and applications carried across kit, packaging and merchandise.",
    tags: ["Branding", "Art Direction"],
    image: "/work/work-4.jpg",
  },
  {
    name: "Spatial & Interior",
    description:
      "Environment design and visualisation, translating a brand's mood into a physical space you can walk through.",
    tags: ["Design", "Visualisation"],
    image: "/work/work-1.jpg",
  },
  {
    name: "Film & Photography",
    description:
      "Concept to final cut — direction, production and post for work built to stop the scroll.",
    tags: ["Media Production", "Campaign"],
    image: "/work/work-8.jpg",
  },
  {
    name: "Workspace Identity",
    description:
      "Brand carried into the room itself — interiors, signage and detail where the identity has to hold up in person.",
    tags: ["Spatial", "Art Direction"],
    image: "/work/work-2.jpg",
  },
];

export default function Work() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const cards = cardsRef.current.filter(Boolean);
      if (!section || !cards.length) return;

      const totalCards = cards.length;
      const segmentSize = 1 / totalCards;

      cards.forEach((card, i) => {
        gsap.set(card, {
          xPercent: -50,
          yPercent: -50 + i * CARD_Y_OFFSET,
          scale: 1 - i * CARD_SCALE_STEP,
        });
      });

      // reduced motion: cards stack statically, no pin
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        section.classList.add("is-static");
        cards.forEach((card) =>
          gsap.set(card, { xPercent: 0, yPercent: 0, scale: 1, clearProps: "transform" })
        );
        return;
      }

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * 4}`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        invalidateOnRefresh: true,
        // refreshes after Services (priority 2), so its start accounts
        // for the pin spacing that section adds above it
        refreshPriority: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const activeIndex = Math.min(
            Math.floor(progress / segmentSize),
            totalCards - 1
          );
          const segProgress =
            (progress - activeIndex * segmentSize) / segmentSize;

          cards.forEach((card, i) => {
            if (i < activeIndex) {
              gsap.set(card, { yPercent: -250, rotationX: 35 });
            } else if (i === activeIndex) {
              gsap.set(card, {
                yPercent: gsap.utils.interpolate(-50, -200, segProgress),
                rotationX: gsap.utils.interpolate(0, 35, segProgress),
                scale: 1,
              });
            } else {
              const behindIndex = i - activeIndex;
              gsap.set(card, {
                yPercent: -50 + (behindIndex - segProgress) * CARD_Y_OFFSET,
                rotationX: 0,
                scale: 1 - (behindIndex - segProgress) * CARD_SCALE_STEP,
              });
            }
          });
        },
      });

      return () => trigger.kill();
    },
    { scope: sectionRef }
  );

  return (
    <section className="work" ref={sectionRef} data-nav-invert>
      <GridFrame tone="dark" rules="none" />

      <div className="work-head">
        <span className="tag tag-dark">selected work</span>
        <span className="work-rule" />
        <p className="mono">[ 03 ]</p>
      </div>

      <div className="work-intro">
        <Copy variant="mask" splitType="lines">
          <h2 className="work-title">
            Proof, not <em>promises</em>.
          </h2>
        </Copy>
      </div>

      {PROJECTS.map((project, i) => (
        <article
          className="work-card"
          key={project.name}
          /* first card sits on top; the rest stack behind it */
          style={{ zIndex: PROJECTS.length - i + 1 }}
          ref={(el) => {
            cardsRef.current[i] = el;
          }}
        >
          <div className="work-card-col">
            <div className="work-card-top">
              <p className="mono work-card-tags">{project.tags.join(" / ")}</p>
              <h3 className="work-card-name">{project.name}</h3>
            </div>
            <p className="work-card-desc">{project.description}</p>
          </div>
          <div className="work-card-media duotone">
            <img src={project.image} alt={project.name} loading="lazy" />
          </div>
        </article>
      ))}

      <div className="work-meta">
        <p className="mono">morpheus. archive</p>
        <p className="mono">four of nine disciplines</p>
      </div>
    </section>
  );
}
