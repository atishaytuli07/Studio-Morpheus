"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import "./Proof2.css";

/* PLACEHOLDER DATA — every number and every client name below is invented
   for review. Replace with the studio's real, checkable figures and with
   clients who have agreed to be named before this goes live. */
const STATS = [
  { value: 120, suffix: "+", label: "projects delivered" },
  { value: 48, label: "brands built" },
  { value: 6, label: "countries served" },
  { value: 92, suffix: "%", label: "clients who return" },
];

const CLIENTS = [
  "Northwind",
  "Halcyon & Co",
  "Atlas Foods",
  "Kiro Studio",
  "Verde Living",
  "Monsoon Records",
  "Plinth",
  "Aurum Hotels",
];

/* The proof, in the "Client love" heading row: the quotes say it, the
   numbers back it. Four figures beside the heading, the names on one quiet
   line beneath. It lives in the heading so the section still ends on the
   cards and hands straight over to the footer (as a band under the cards
   it stacked two blocks of text on top of the footer's own row).

   The figures count up once, the first time they are on screen, on the
   loader's count curve (fast, then settling), each rising in a beat after
   the one before. The real values are in the markup, so without JS, or
   with reduced motion, the numbers are simply there. */
export default function Proof2() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("is-in");
      return;
    }

    const nums = [...root.querySelectorAll("[data-count]")];
    // far below the fold at mount, so zeroing them is never seen
    nums.forEach((el) => (el.textContent = "0"));

    let tweens = [];
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        root.classList.add("is-in");
        tweens = nums.map((el, i) => {
          const end = Number(el.dataset.count);
          const box = { n: 0 };
          return gsap.to(box, {
            n: end,
            duration: 1.6,
            delay: i * 0.08,
            ease: "power3.out",
            onUpdate: () => (el.textContent = String(Math.round(box.n))),
          });
        });
      },
      { threshold: 0.4 }
    );
    // .p2 is display: contents (no box of its own), so watch the figures
    io.observe(root.querySelector(".p2-stats"));

    return () => {
      io.disconnect();
      tweens.forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="p2" ref={ref}>
      <div className="p2-stats">
        {STATS.map((s, i) => (
          <div className="p2-stat" key={s.label} style={{ "--i": i }}>
            <p className="p2-num">
              <span data-count={s.value}>{s.value}</span>
              {s.suffix ? <span className="p2-suffix">{s.suffix}</span> : null}
            </p>
            <p className="p2-label">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="p2-clients">
        <p className="p2-label">[ trusted by ]</p>
        {/* An endless right-to-left run: the list four times, end to end,
            slid by exactly half (two lists) and repeated, so the seam never
            shows. Four, not two: one list is narrower than the window on a
            wide screen, and two would run out before the loop restarts.
            The copies are for the eye only. */}
        <div className="p2-marquee">
          <div className="p2-track">
            {[0, 1, 2, 3].map((copy) => (
              <ul
                className="p2-names"
                key={copy}
                aria-hidden={copy > 0 ? "true" : undefined}
              >
                {CLIENTS.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
