"use client";

import "./Testimonials.css";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import Copy from "@/components/Copy/Copy";
import GridFrame from "@/components/GridFrame/GridFrame";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_MIN = 1000;

/* fanned resting poses — cards overlap like dealt cards */
const REST = [
  { x: -260, y: 16, r: -8 },
  { x: -90, y: -12, r: 5 },
  { x: 95, y: 10, r: -4 },
  { x: 265, y: -8, r: 9 },
];

/* per-card bias so the scatter never looks mechanical */
const BIAS = [
  { x: 1.05, y: 6, r: -2 },
  { x: 0.9, y: -5, r: 3 },
  { x: 1.1, y: 7, r: -3 },
  { x: 0.95, y: -4, r: 2 },
];

/* PLACEHOLDER COPY — swap for real, permissioned client quotes before launch */
const TESTIMONIALS = [
  {
    quote:
      "Sakshi understood the brand before we could explain it ourselves. We came in with a folder of half-ideas and left with an identity that finally looked like the company we thought we were. Every asset since has fallen into place.",
    name: "Placeholder Client",
    role: "Brand Lead",
    company: "Client Name",
    initials: "PC",
    tone: "navy",
  },
  {
    quote:
      "They turned a scattered feed into a voice people actually follow. Strategy, shooting, captions — handled. Engagement doubled inside a quarter and, more importantly, the comments started sounding like our audience.",
    name: "Placeholder Client",
    role: "Founder",
    company: "Client Name",
    initials: "PC",
    tone: "paper",
  },
  {
    quote:
      "From first concept to final cut the production was calm, fast and precise. No chasing, no surprises on delivery day. The film is two years old and still opens doors for us in every pitch meeting.",
    name: "Placeholder Client",
    role: "Marketing Director",
    company: "Client Name",
    initials: "PC",
    tone: "navy",
  },
  {
    quote:
      "Strategy, design and delivery from one studio — no hand-offs, no finger-pointing, no excuses. That's rare. It's exactly what they promise on the tin, and the only agency we've stopped shopping around for.",
    name: "Placeholder Client",
    role: "Co-Founder",
    company: "Client Name",
    initials: "PC",
    tone: "paper",
  },
];

function Stars() {
  return (
    <div className="testimonial-stars" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 16 16" className="testimonial-star">
          <path d="M8 0.8 L10.1 5.6 L15.2 6.1 L11.3 9.5 L12.5 14.6 L8 11.9 L3.5 14.6 L4.7 9.5 L0.8 6.1 L5.9 5.6 Z" />
        </svg>
      ))}
    </div>
  );
}

function getPoses(activeIndex) {
  if (activeIndex === null) return REST;

  return REST.map((pose, i) => {
    if (i === activeIndex) {
      return { x: pose.x, y: pose.y, r: pose.r * 0.35 };
    }
    const dir = i < activeIndex ? -1 : 1;
    const dist = Math.abs(i - activeIndex);
    const bias = BIAS[i];
    const push = (38 + dist * 28) * bias.x;
    return {
      x: pose.x + dir * push,
      y: pose.y + bias.y * dist * 0.55,
      r: pose.r + bias.r * dist * 1.15,
    };
  });
}

const isDesktop = () => window.innerWidth >= DESKTOP_MIN;

export default function Testimonials() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const cards = cardsRef.current.filter(Boolean);
      if (!section || !cards.length) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      let activeIndex = null;
      let introDone = false;
      let bound = false;
      const enterHandlers = [];
      let leaveHandler = null;

      const setRest = (el, i) => {
        if (isDesktop()) {
          gsap.set(el, {
            x: REST[i].x,
            y: REST[i].y,
            rotation: REST[i].r,
            zIndex: i + 1,
            xPercent: -50,
            yPercent: -50,
            force3D: true,
          });
        } else {
          gsap.set(el, {
            x: 0,
            y: 0,
            rotation: 0,
            xPercent: 0,
            yPercent: 0,
            clearProps: "zIndex",
          });
        }
      };

      if (reduced) {
        cards.forEach(setRest);
        return;
      }

      const moveTo = (poses) => {
        if (!introDone) return;
        cards.forEach((el, i) => {
          gsap.to(el, {
            x: poses[i].x,
            y: poses[i].y,
            rotation: poses[i].r,
            duration: 0.4,
            ease: "power3.out",
            overwrite: "auto",
            force3D: true,
          });
        });
      };

      // hovering a card straightens it and pushes its neighbours outward
      const scatter = (index) => {
        if (!bound || !introDone || index === activeIndex) return;
        activeIndex = index;
        moveTo(getPoses(index));
      };

      const bindHover = () => {
        if (bound || !introDone || !isDesktop()) return;

        const isOverCard = (node) =>
          node instanceof Element &&
          cards.some((card) => card === node || card.contains(node));

        leaveHandler = (e) => {
          if (isOverCard(e.relatedTarget)) return;
          scatter(null);
        };

        cards.forEach((el, i) => {
          enterHandlers[i] = () => scatter(i);
          el.addEventListener("mouseenter", enterHandlers[i]);
          el.addEventListener("mouseleave", leaveHandler);
        });
        bound = true;
      };

      const INTRO_Y = Math.max(window.innerHeight * 0.75, 600);

      cards.forEach((el, i) => {
        if (isDesktop()) {
          gsap.set(el, {
            x: REST[i].x,
            y: REST[i].y + INTRO_Y,
            rotation: REST[i].r,
            zIndex: i + 1,
            xPercent: -50,
            yPercent: -50,
            force3D: true,
          });
        } else {
          gsap.set(el, { x: 0, y: INTRO_Y, rotation: 0 });
        }
      });

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top 75%",
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({
            onComplete: () => {
              introDone = true;
              bindHover();
            },
          });
          cards.forEach((el, i) => {
            tl.to(
              el,
              {
                y: isDesktop() ? REST[i].y : 0,
                duration: 0.9,
                ease: "power3.out",
                overwrite: "auto",
              },
              i * 0.1
            );
          });
        },
      });

      const onResize = () => {
        cards.forEach((el, i) => {
          if (enterHandlers[i]) el.removeEventListener("mouseenter", enterHandlers[i]);
          if (leaveHandler) el.removeEventListener("mouseleave", leaveHandler);
        });
        enterHandlers.length = 0;
        leaveHandler = null;
        bound = false;
        activeIndex = null;
        if (introDone) {
          cards.forEach(setRest);
          bindHover();
        }
      };
      window.addEventListener("resize", onResize);

      return () => {
        trigger.kill();
        window.removeEventListener("resize", onResize);
        cards.forEach((el, i) => {
          if (enterHandlers[i]) el.removeEventListener("mouseenter", enterHandlers[i]);
          if (leaveHandler) el.removeEventListener("mouseleave", leaveHandler);
        });
      };
    },
    { scope: sectionRef }
  );

  return (
    <section className="testimonials" ref={sectionRef} data-nav-invert>
      <GridFrame tone="dark" rules="none" />

      <div className="testimonials-head">
        <span className="tag tag-dark">kind words</span>
        <span className="testimonials-rule" />
        <p className="mono">[ 04 ]</p>
      </div>

      <div className="testimonials-intro">
        <Copy variant="mask" splitType="lines">
          <h2 className="testimonials-title">
            People who let us <em>dream</em> on their behalf.
          </h2>
        </Copy>
      </div>

      <div className="testimonial-stage">
        {TESTIMONIALS.map((t, i) => (
          <figure
            key={i}
            className={`testimonial-card tone-${t.tone}`}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
          >
            <Stars />

            <blockquote className="testimonial-quote">
              <span className="testimonial-quotemark" aria-hidden="true">
                &ldquo;
              </span>
              {t.quote}
            </blockquote>

            <figcaption className="testimonial-author">
              <span className="testimonial-avatar" aria-hidden="true">
                {t.initials}
              </span>
              <span className="testimonial-meta">
                <span className="testimonial-name">{t.name}</span>
                <span className="mono testimonial-role">
                  {t.role} · {t.company}
                </span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
