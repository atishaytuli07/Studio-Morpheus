"use client";

import { useEffect, useRef } from "react";

import "./Cursor2.css";

/* The page's cursor: a small navy square — the same square that marks the
   current section in the scroll nav — following the pointer on a spring.

   Spring values are Brikken's, measured: stiffness 350, damping 28, mass
   0.5. Half-way to the pointer in ~50ms, settled in ~400ms. Close enough to
   feel attached, loose enough to feel alive.

   It reads its ground from what the pointer is over, not from colour
   sampling: walking up from the event target, the first element that is
   known to be dark or light decides. One `closest()` per move, no layout.

   States:
     · over a link or button  — the square grows a little;
     · over a work card       — a "View" tag joins it;
     · over a testimonial     — a "Drag" tag joins it;
     · pressed                — it gives a little.

   Mouse and trackpad only. On touch there is no pointer to follow, so it
   never mounts its listeners and the native behaviour stands. */

const DARK = [
  ".l2", // loader
  ".h2", // hero
  ".f2", // footer
  ".t2-card.is-navy",
  ".s2-card",
  '.gn[data-state="top"]', // the original bar, over the hero
  ".w2-all",
  ".c2",
  ".r2-frame",
  ".w2-media",
].join(",");

const LIGHT = [
  ".v2-invert",
  ".t2-card.is-paper",
  ".f2-btn",
  '.gn:not([data-state="top"])', // on glass
  ".gn-cta",
  ".r2-mute",
].join(",");

const LABELS = [
  [".w2-link", "View"],
  [".t2-card:not(.is-fixed)", "Drag"],
];

const SPRING = { k: 350, c: 28, m: 0.5 };

export default function Cursor2() {
  const ref = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const labelEl = labelRef.current;
    if (!el || !labelEl) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const root = document.documentElement;
    root.classList.add("v2-has-cursor");

    // position + velocity of the spring, and where it is heading
    const p = { x: -100, y: -100, vx: 0, vy: 0 };
    const target = { x: -100, y: -100 };
    let raf = 0;
    let last = 0;
    let seen = false;

    const draw = () => {
      el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
    };

    const step = (now) => {
      // clamped, so a background tab does not return to a huge jump
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const { k, c, m } = SPRING;
      for (const axis of ["x", "y"]) {
        const v = axis === "x" ? "vx" : "vy";
        const force = -k * (p[axis] - target[axis]) - c * p[v];
        p[v] += (force / m) * dt;
        p[axis] += p[v] * dt;
      }
      draw();
      const settled =
        Math.abs(p.x - target.x) < 0.1 &&
        Math.abs(p.y - target.y) < 0.1 &&
        Math.abs(p.vx) < 0.1 &&
        Math.abs(p.vy) < 0.1;
      if (settled) {
        p.x = target.x;
        p.y = target.y;
        p.vx = p.vy = 0;
        draw();
        raf = 0;
      } else {
        raf = requestAnimationFrame(step);
      }
    };

    let lastTarget = null;
    const classify = (t) => {
      if (t === lastTarget) return;
      lastTarget = t;
      if (!(t instanceof Element)) return;
      const ground = t.closest(`${DARK},${LIGHT}`);
      el.classList.toggle("is-on-dark", !!ground && ground.matches(DARK));
      el.classList.toggle("is-active", !!t.closest("a, button, [role='button']"));
      let text = "";
      for (const [sel, word] of LABELS) {
        if (t.closest(sel)) {
          text = word;
          break;
        }
      }
      if (text) labelEl.textContent = text;
      el.classList.toggle("has-label", !!text);
    };

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      classify(e.target);
      if (!seen) {
        // first sighting: appear where the pointer is, do not fly in
        seen = true;
        p.x = target.x;
        p.y = target.y;
        draw();
        el.classList.add("is-shown");
      }
      if (reduced) {
        p.x = target.x;
        p.y = target.y;
        draw();
        return;
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    };

    /* Things scroll under a still pointer: re-read what it is over. At most
       every 100ms and once more when the scroll stops — elementFromPoint
       forces layout, and Lenis fires a scroll event every frame, right
       after the scrubbed sections have written their transforms. */
    let lastCheck = 0;
    let trailing = 0;
    const check = () => {
      lastCheck = performance.now();
      classify(document.elementFromPoint(target.x, target.y));
    };
    const onScroll = () => {
      if (!seen) return;
      clearTimeout(trailing);
      if (performance.now() - lastCheck > 100) check();
      trailing = setTimeout(check, 120);
    };

    const onDown = () => el.classList.add("is-down");
    const onUp = () => el.classList.remove("is-down");
    const onLeave = () => el.classList.remove("is-shown");
    const onEnter = () => seen && el.classList.add("is-shown");

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(trailing);
      root.classList.remove("v2-has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  return (
    <div className="cur" ref={ref} aria-hidden="true">
      <span className="cur-dot" />
      <span className="cur-label" ref={labelRef} />
    </div>
  );
}
