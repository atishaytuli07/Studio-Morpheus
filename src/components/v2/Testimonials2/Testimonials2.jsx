"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./Testimonials2.css";

gsap.registerPlugin(ScrollTrigger);

/* PLACEHOLDER COPY — swap for real, permissioned client quotes before launch */
const QUOTES = [
  {
    quote:
      "Sakshi understood the brand before we could explain it ourselves. Every asset since has fallen into place.",
    name: "Placeholder Client",
    role: "brand lead",
  },
  {
    quote:
      "They turned a scattered feed into a voice people actually follow. Engagement doubled inside a quarter.",
    name: "Placeholder Client",
    role: "founder",
  },
  {
    quote:
      "From first concept to final cut the production was calm, fast and precise. The film still opens doors.",
    name: "Placeholder Client",
    role: "marketing director",
  },
  {
    quote:
      "Strategy, design and delivery from one studio — no hand-offs, no excuses. Exactly what they promise.",
    name: "Placeholder Client",
    role: "co-founder",
  },
];

const HOLD = 7; // seconds a quote rests before auto-advancing

export default function Testimonials2() {
  const sectionRef = useRef(null);
  const [index, setIndex] = useState(0);
  // busy starts true: clicks do nothing until the first scroll-in reveal
  const busyRef = useRef(true);
  const revealedRef = useRef(false);
  const reducedRef = useRef(false);
  const timerRef = useRef(null);

  /* one quote dissolves out of a blur, holds, dissolves back — the same
     "thought resolving" language as the manifesto, so the page speaks
     with one voice instead of falling back to a card slider */
  const playIn = () => {
    const section = sectionRef.current;
    if (!section) return;
    const words = section.querySelectorAll(".t2-word");

    gsap.fromTo(
      words,
      { opacity: 0, filter: "blur(26px)" },
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.035,
      }
    );
    gsap.fromTo(
      section.querySelector(".t2-author"),
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.45,
        onComplete: () => {
          busyRef.current = false;
        },
      }
    );

    timerRef.current?.kill();
    timerRef.current = gsap.delayedCall(HOLD, advance);
  };

  const advance = () => {
    if (reducedRef.current) {
      setIndex((i) => (i + 1) % QUOTES.length);
      return;
    }
    if (busyRef.current) return;
    busyRef.current = true;
    timerRef.current?.kill();

    const section = sectionRef.current;
    const words = section.querySelectorAll(".t2-word");

    gsap.to(section.querySelector(".t2-author"), {
      opacity: 0,
      duration: 0.35,
      ease: "power2.in",
    });
    gsap.to(words, {
      opacity: 0,
      filter: "blur(22px)",
      duration: 0.45,
      ease: "power2.in",
      stagger: { each: 0.018, from: "end" },
      onComplete: () => setIndex((i) => (i + 1) % QUOTES.length),
    });
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedRef.current) {
      section.classList.add("is-static");
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 62%",
        once: true,
        onEnter: () => {
          revealedRef.current = true;
          gsap.fromTo(
            [".t2-head p", ".t2-foot p", ".t2-ghost"],
            { opacity: 0 },
            { opacity: 1, duration: 1, ease: "power2.out", stagger: 0.08 }
          );
          playIn();
        },
      });
    }, section);

    return () => {
      timerRef.current?.kill();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // each quote swap: the fresh words (remounted via key) resolve in.
  // Gated on revealedRef so StrictMode's double-mount can't fire it early.
  useEffect(() => {
    if (!revealedRef.current || reducedRef.current) return;
    playIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const q = QUOTES[index];

  return (
    <section className="t2 v2-invert" ref={sectionRef} onClick={advance}>
      {/* the hero's drifting light, quieter — the room stays lit */}
      <div className="t2-atmo" aria-hidden="true" />

      <p className="t2-ghost" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </p>

      <div className="t2-head">
        <p>[ 04 — kind words ]</p>
        <p>people who let us dream for them</p>
      </div>

      <figure className="t2-stage">
        <blockquote className="t2-quote" key={index}>
          {q.quote.split(" ").map((word, i) => (
            // space lives outside the inline-block span, or it collapses
            <span key={i}>
              <span className="t2-word">{word}</span>{" "}
            </span>
          ))}
        </blockquote>
        <figcaption className="t2-author">
          <span className="t2-name">{q.name}</span>
          <span className="t2-role">{q.role}</span>
        </figcaption>
      </figure>

      <div className="t2-foot">
        <p>
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(QUOTES.length).padStart(2, "0")}
        </p>
        <p>[ click to advance ]</p>
      </div>
    </section>
  );
}
