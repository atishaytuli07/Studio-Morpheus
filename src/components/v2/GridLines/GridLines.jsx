"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import { loaderDone } from "../Loader2/loaderGate";

/* The page's column lines — Brikken's quiet structure under everything.

   They used to be one repeating gradient. They are five real hairlines now,
   so they can draw themselves up from the floor as the hero is revealed:
   the structure of the page arriving with the page. Slow on purpose —
   this is the room settling, not an event. Transform only. */
const LINES = [1, 2, 3, 4, 5];

export default function GridLines() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("is-drawn");
      return;
    }

    let tween;
    let cancelled = false;
    loaderDone().then(() => {
      if (cancelled) return;
      tween = gsap.to(root.children, {
        scaleY: 1,
        duration: 2.6,
        ease: "power3.inOut",
        // from the middle outward: the room opens rather than wipes
        stagger: { each: 0.16, from: "center" },
        onComplete: () => {
          gsap.set(root.children, { clearProps: "transform" });
          root.classList.add("is-drawn");
        },
      });
    });

    return () => {
      cancelled = true;
      tween?.kill();
    };
  }, []);

  return (
    <div className="v2-grid" ref={ref} aria-hidden="true">
      {LINES.map((n) => (
        <span key={n} style={{ left: `${(n / 6) * 100}%` }} />
      ))}
    </div>
  );
}
