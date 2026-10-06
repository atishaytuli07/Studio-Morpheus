"use client";

import { useEffect, useRef } from "react";

import "./Testimonials2.css";

/* PLACEHOLDER COPY — the old site has no testimonials (brand brief §9).
   Swap for real, permissioned client quotes before launch. */
const QUOTES = [
  {
    quote:
      "Sakshi understood the brand before we could explain it ourselves. Every asset since has fallen into place.",
    name: "Placeholder Client",
    role: "Brand lead",
  },
  {
    quote:
      "They turned a scattered feed into a voice people actually follow. Engagement doubled inside a quarter.",
    name: "Placeholder Client",
    role: "Founder",
  },
  {
    quote:
      "From first concept to final cut the production was calm, fast and precise. The film still opens doors.",
    name: "Placeholder Client",
    role: "Marketing director",
  },
  {
    quote:
      "Strategy, design and delivery from one studio — no hand-offs, no excuses. Exactly what they promise.",
    name: "Placeholder Client",
    role: "Co-founder",
  },
  {
    quote:
      "They asked better questions than we did. The brand finally sounds like us, only clearer.",
    name: "Placeholder Client",
    role: "Managing partner",
  },
];

/* the feel of the table: how quickly a thrown card slows, how much of its
   speed it keeps when it meets an edge, how far it leans into its motion */
const FRICTION = 3.2; // per second — higher stops sooner
const BOUNCE = 0.35;
const LEAN = 0.012; // degrees per px/s
const MAX_LEAN = 7;
const EDGE = 12; // px kept clear of the screen edge

/* the others: while one card is dragged, the rest are tugged a little the
   same way — less the further away they sit — and spring back home */
const TUG = 0.24; // share of the drag a touching neighbour follows
const TUG_REACH = 420; // px — the distance at which the tug has halved
const TUG_MAX = 80; // px — never further than this from home
const SPRING = 110; // pull toward home
const DAMPING = 13; // a little under critical: one soft overshoot

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/* A pair of drawn quote marks: the display face is not guaranteed to carry
   the curly glyphs at this weight, and a fallback would show. */
const Marks = ({ className }) => (
  <svg className={className} viewBox="0 0 28 22" aria-hidden="true">
    <path d="M0 22V12.5C0 5.6 3.6 1.4 10.8 0l1.2 3.6C8.6 4.6 6.9 6.7 6.8 10H12v12H0Zm16 0V12.5C16 5.6 19.6 1.4 26.8 0L28 3.6c-3.4 1-5.1 3.1-5.2 6.4H28v12H16Z" />
  </svg>
);

/* Scattered cards, as if dropped on a table — Griflan's "Client
   Confessions". No pin, no carousel, no scroll animation, nothing on hover.
   The one interaction is physical: take a card and slide or throw it along
   the table, left or right, as far as either edge. It keeps its momentum,
   leans into the motion, slows by friction and knocks softly off the edge.
   The other cards feel it: they are tugged a little the same way and then
   spring back to where they were. Sideways only, and it never changes
   which card is on top. */
export default function Testimonials2() {
  const ref = useRef(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = [...section.querySelectorAll(".t2-card")].map((el) => ({
      el,
      x: 0,
      v: 0, // px per second
      home: 0, // where it rests; moves when the card itself is dragged
      cx: 0, // resting centre, for distance to the dragged card
      thrown: false, // coasting after a release, not yet settled
      held: false,
      fixed: false,
      min: 0,
      max: 0,
    }));

    const draw = (c) => {
      const lean = clamp(c.v * LEAN, -MAX_LEAN, MAX_LEAN);
      c.el.style.setProperty("--x", `${c.x.toFixed(1)}px`);
      c.el.style.setProperty("--lean", `${lean.toFixed(2)}deg`);
    };

    /* how far each card may travel: from the screen's left edge to its
       right. offsetLeft ignores transforms, so it is the resting place. */
    const measure = () => {
      cards.forEach((c) => {
        // offsetLeft is measured from the offset parent (the section), not
        // from the table — adding the table's inset would count it twice
        const left = c.el.offsetParent.getBoundingClientRect().left + c.el.offsetLeft;
        c.min = EDGE - left;
        c.max = window.innerWidth - EDGE - left - c.el.offsetWidth;
        // nowhere to go (a full-width card on a phone): leave it be
        c.fixed = c.max - c.min < 24;
        c.x = c.fixed ? 0 : clamp(c.x, c.min, c.max);
        c.home = c.x;
        c.cx = left + c.el.offsetWidth / 2;
        c.el.classList.toggle("is-fixed", c.fixed);
        draw(c);
      });
    };

    // one loop for every card, running only while something is moving
    let raf = 0;
    let last = 0;
    const step = (now) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      let alive = false;
      const held = cards.find((c) => c.held);
      cards.forEach((c) => {
        if (c.fixed) return;
        if (c.held) {
          alive = true;
          // the lean relaxes while the card is held still
          c.v *= Math.exp(-12 * dt);
          draw(c);
          return;
        }

        if (!c.thrown) {
          // a card at rest: sprung to its home, tugged by whatever is held
          let target = c.home;
          if (held) {
            const reach = Math.abs(held.cx + held.x - (c.cx + c.home));
            const pull = (held.x - held.grabX) * TUG * (1 / (1 + reach / TUG_REACH));
            target = clamp(c.home + clamp(pull, -TUG_MAX, TUG_MAX), c.min, c.max);
          }
          const off = c.x - target;
          if (!held && Math.abs(off) < 0.3 && Math.abs(c.v) < 4) {
            if (off !== 0 || c.v !== 0) {
              c.x = target;
              c.v = 0;
              draw(c);
            }
            return;
          }
          alive = true;
          c.v += (-SPRING * off - DAMPING * c.v) * dt;
          c.x += c.v * dt;
          draw(c);
          return;
        }

        // thrown: coast on friction, and make wherever it stops its home
        if (Math.abs(c.v) < 4) {
          c.v = 0;
          c.thrown = false;
          c.home = c.x;
          draw(c);
          return;
        }
        alive = true;
        c.x += c.v * dt;
        c.v *= Math.exp(-FRICTION * dt);
        if (c.x < c.min) {
          c.x = c.min;
          c.v = Math.abs(c.v) * BOUNCE;
        } else if (c.x > c.max) {
          c.x = c.max;
          c.v = -Math.abs(c.v) * BOUNCE;
        }
        draw(c);
      });
      raf = alive ? requestAnimationFrame(step) : 0;
    };
    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(step);
    };

    const stops = cards.map((c) => {
      let px = 0;
      let pt = 0;
      const down = (e) => {
        if (c.fixed || (e.pointerType === "mouse" && e.button !== 0)) return;
        // one card at a time: a second finger does not start a second drag
        if (cards.some((o) => o.held)) return;
        c.held = true;
        c.thrown = false;
        c.grabX = c.x;
        c.v = 0;
        px = e.clientX;
        pt = e.timeStamp;
        c.el.setPointerCapture(e.pointerId);
        c.el.classList.add("is-held");
        wake();
      };
      const move = (e) => {
        if (!c.held) return;
        const dx = e.clientX - px;
        const dt = Math.max(1, e.timeStamp - pt) / 1000;
        px = e.clientX;
        pt = e.timeStamp;
        // past an edge the card resists instead of stopping dead
        const next = c.x + dx;
        if (next < c.min) c.x = c.min + (next - c.min) * 0.3;
        else if (next > c.max) c.x = c.max + (next - c.max) * 0.3;
        else c.x = next;
        // smoothed, so one jittery sample cannot become the throw
        c.v = c.v * 0.6 + (dx / dt) * 0.4;
      };
      const up = () => {
        if (!c.held) return;
        c.held = false;
        c.el.classList.remove("is-held");
        if (reduced) c.v = 0;
        c.thrown = true;
        // let go beyond an edge: come back to it
        c.x = clamp(c.x, c.min, c.max);
        draw(c);
        wake();
      };
      c.el.addEventListener("pointerdown", down);
      c.el.addEventListener("pointermove", move);
      c.el.addEventListener("pointerup", up);
      c.el.addEventListener("pointercancel", up);
      return () => {
        c.el.removeEventListener("pointerdown", down);
        c.el.removeEventListener("pointermove", move);
        c.el.removeEventListener("pointerup", up);
        c.el.removeEventListener("pointercancel", up);
      };
    });

    measure();
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      stops.forEach((stop) => stop());
    };
  }, []);

  return (
    <section className="t2 v2-invert" ref={ref}>
      <header className="t2-head">
        <p className="t2-label">[ 05 — kind words ]</p>
        <h2 className="t2-heading">Kind words</h2>
      </header>

      <div className="t2-table">
        {QUOTES.map((q, i) => (
          <figure
            className={`t2-card ${i % 2 === 0 ? "is-navy" : "is-paper"}`}
            key={i}
          >
            <Marks className="t2-marks t2-marks-open" />
            <blockquote className="t2-quote">
              <p>{q.quote}</p>
            </blockquote>
            <figcaption className="t2-author">
              <span className="t2-name">{q.name}</span>
              <span className="t2-role">{q.role}</span>
            </figcaption>
            <Marks className="t2-marks t2-marks-close" />
          </figure>
        ))}
      </div>
    </section>
  );
}
