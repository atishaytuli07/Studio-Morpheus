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

/* The dial under the arc: tick marks on the same wheel the cards ride, a
   little inside them, turning with them. Two copies of the ticks — muted,
   and lit-and-longer — with the lit copy masked to the centre, so ticks
   brighten as they pass under the middle of the screen (the duplicate-and-
   clip trick; one attribute per copy per frame, nothing per tick). */
const DIAL_GAP = 22; // px between the card bottoms and the ticks
const DIAL_STEP = 22; // px between ticks, along the arc
const DIAL_LEN = 10; // px, a muted tick
const DIAL_LIT = 15; // px, a lit tick
const DIAL_BAND = 120; // px, the height of the strip the ticks are drawn in

/* where the pin opens and closes: one card whole and the next showing by
   this much of its width, at the right edge first and the left edge last */
const PEEK = 0.3;

export default function Services2() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const dialRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const cards = cardsRef.current.filter(Boolean);
    const dial = dialRef.current;
    if (!section || !cards.length || !dial) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.classList.add("is-static");
      return;
    }

    const totalCards = cards.length;
    /* 0.8/card meant 9 cards pinned the page for 7.2 viewports (8.2 with the
       section itself) — far too long a toll for the payoff. 0.4 halves it. */
    /* 0.35 a card — 3.15 screens for the nine. Tried at 0.26 and reverted:
       the cards crossed too fast to read and the section felt cut short. */
    const stickyHeight = window.innerHeight * (totalCards * 0.35);

    const arcAngle = Math.PI * 0.4;
    const startAngle = Math.PI / 2 - arcAngle / 2;

    /* phone: a near-flat arc, one card at a time. Tablet: tighter, so two
       or three share the screen — on the phone curve a single small card
       sat alone in the middle of a very tall screen. */
    const getRadius = () => {
      const w = window.innerWidth;
      if (w < 600) return w * 7.5;
      if (w < 1025) return w * 3.2;
      return w * 2.5;
    };

    const ticks = [...dial.querySelectorAll("svg")];
    const wheels = ticks.map((svg) => svg.querySelector("g"));
    let geo = null;

    /* Everything that depends on the screen: the arc, the sweep, the dial.
       Rebuilt on resize, not per frame. */
    function layout() {
      const vw = window.innerWidth;
      const radius = getRadius();
      const cardW = cards[0].offsetWidth || 300;
      const cardH = cards[0].offsetHeight || 400;

      /* The gap between neighbours is set as a DISTANCE, not an angle. As a
         fixed angle (0.105) the gap came out at ~145px at 1440 and changed
         with every screen size and card size; this keeps it at CARD_GAP
         along the arc, whatever the card's size, so bigger cards do not
         drift apart and smaller ones do not crowd. */
      const CARD_GAP = 56;
      const cardSpacing = (cardW + CARD_GAP) / (radius * arcAngle);

      /* The sweep opens with card 01 whole and card 02 peeking in from the
         right edge, and closes with the last card whole and the one before
         it peeking out at the left. It used to run from an empty arc to an
         empty arc (cards eased in from off screen), so the pin opened and
         closed on one half-card, or on nothing.
         Where a whole card and a peek do not both fit (a phone, where the
         card is most of the screen), the card is simply centred. */
      const gutter = Math.min(vw * 0.05, 80);
      const peekX = vw / 2 - (1 - PEEK) * cardW - CARD_GAP;
      const firstX = peekX - cardW / 2 >= gutter - vw / 2 ? peekX : 0;
      // the progress that puts a card's centre at x (from the screen centre)
      const at = (x) => (Math.acos(x / radius) - startAngle) / arcAngle;
      const from = at(firstX) - cardSpacing * (totalCards - 1);
      const to = at(-firstX);

      /* The dial: concentric with the cards' wheel, its top just under the
         bottom of the centred card. Positioned in px because the cards'
         line is (s2-cards' top is the heading stack). */
      const top = cards[0].offsetParent.offsetTop + cardH + DIAL_GAP;
      const r = radius - cardH / 2 - DIAL_GAP;
      // the strip is the section wide, which excludes any scrollbar
      const sw = section.clientWidth;
      const cx = sw / 2;
      const cy = r;
      const step = DIAL_STEP / r;
      dial.style.top = `${top}px`;
      // enough ticks to run past both edges, whatever the turn
      const reach = Math.asin(Math.min(1, (sw / 2 + DIAL_STEP * 2) / r));
      const n = Math.ceil(reach / step) + 1;
      ticks.forEach((svg, k) => {
        const len = k === 0 ? DIAL_LEN : DIAL_LIT;
        svg.setAttribute("viewBox", `0 0 ${sw} ${DIAL_BAND}`);
        let d = "";
        for (let i = -n; i <= n; i++) {
          const sin = Math.sin(i * step);
          const cos = Math.cos(i * step);
          const y1 = cy - r * cos;
          if (y1 > DIAL_BAND) continue;
          const x1 = cx + r * sin;
          const x2 = cx + (r - len) * sin;
          const y2 = cy - (r - len) * cos;
          d += `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
        }
        svg.querySelector("path").setAttribute("d", d);
      });

      geo = { radius, cardSpacing, from, to, cx, cy, step };
    }

    function positionCards(progress = 0) {
      const { radius, cardSpacing, from, to, cx, cy, step } = geo;
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

      /* The wheel turns by exactly the cards' angle, so the ticks travel
         with them. They are evenly spaced, so the turn is only needed
         modulo one step: the strip never runs out. */
      const turn = (arcAngle * arcProgress) % step;
      const deg = (-(turn < 0 ? turn + step : turn) * 180) / Math.PI;
      const t = `rotate(${deg.toFixed(3)} ${cx.toFixed(1)} ${cy.toFixed(1)})`;
      wheels.forEach((g) => g.setAttribute("transform", t));
    }

    layout();
    positionCards(0);

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${stickyHeight}px`,
      pin: true,
      pinSpacing: true,
      scrub: true,
      invalidateOnRefresh: true,
      /* pinned sections must refresh in document order, earlier = higher.
         The reel pins before this one and is set to 3; leaving this at the
         default 0 worked by luck, not by declaration. */
      refreshPriority: 2,
      onUpdate: (self) => positionCards(self.progress),
    });

    const handleResize = () => {
      layout();
      positionCards(trigger.progress);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      trigger.kill();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section className="s2" id="services" ref={sectionRef}>
      <div className="s2-header">
        <p className="s2-label">[ 04 — services ]</p>
        <h2 className="s2-title">Services</h2>
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
            {/* the card is the approved v1 card (src/components/Services),
                element for element: duotone picture with its index on it,
                then the name and the line */}
            <div className="s2-card-media duotone">
              <img src={`/services/service-${i + 1}.jpg`} alt="" loading="lazy" />
              <p className="mono s2-card-index">
                {String(i + 1).padStart(2, "0")}
              </p>
            </div>
            <div className="s2-card-body">
              <h3 className="s2-card-name">{service.name}</h3>
              <p className="s2-card-line">{service.line}</p>
            </div>
          </article>
        ))}
      </div>

      {/* the dial: drawn in layout(), turned in positionCards() */}
      <div className="s2-dial" ref={dialRef} aria-hidden="true">
        <svg className="s2-dial-ticks" preserveAspectRatio="none">
          <g>
            <path />
          </g>
        </svg>
        <svg className="s2-dial-ticks is-lit" preserveAspectRatio="none">
          <g>
            <path />
          </g>
        </svg>
        <p className="s2-dial-label">scroll to turn</p>
      </div>

      <div className="s2-meta">
        <p>nine disciplines</p>
        <p>one studio</p>
      </div>
    </section>
  );
}
