"use client";

import "./Services2.css";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* the arc carousel the client explicitly kept — service one-liners are
   theirs, verbatim. On bone since the colour pass: navy cards on navy read
   as more of the same blue; on the light ground they are the colour. */
const SERVICES = [
  { name: "Branding", line: "Unleash your brand's potential. Let's make it extraordinary." },
  { name: "Social Media", line: "Turn your scroll into a stop. Let's spark conversations." },
  { name: "Media Production", line: "From concept to screen, we make your vision unforgettable." },
  { name: "Design", line: "Good design isn't seen, it's felt. Let's make 'em feel." },
  { name: "Illustration", line: "Doodles to masterpieces, impossible to ignore." },
  { name: "Marketing", line: "Strategy into success, where your story drives results." },
  { name: "Consulting", line: "You've got the vision, we've got the strategy. No excuses." },
  { name: "Web & Digital", line: "Websites that work harder than you. Experiences that deliver." },
  { name: "Special Projects", line: "Got a vision that doesn't fit the box? We got you." },
];

/* The dial under the arc: tick marks on the same wheel the cards ride, a
   little inside them, turning with them. Two copies of the ticks — muted,
   and lit-and-longer — with the lit copy masked to the centre, so ticks
   brighten as they pass under the middle of the screen (the duplicate-and-
   clip trick; one attribute per copy per frame, nothing per tick). */
const DIAL_GAP = 16; // px between the card bottoms and the ticks
const DIAL_STEP = 22; // px between ticks, along the arc
const DIAL_LEN = 10; // px, a muted tick
const DIAL_LIT = 15; // px, a lit tick
const DIAL_BAND = 120; // px, the height of the strip the ticks are drawn in

/* where the pin opens and closes: one card whole and the next showing by
   this much of its width, at the right edge first and the left edge last */
const PEEK = 0.3;

/* screens of scroll each card's turn takes — 0.28, 2.5 screens for the
   nine (it was 0.35, 3.15: the section was 29% of the whole page) */
const HOLD_PER_CARD = 0.28;

/* the card in focus at full size and lifted; the rest a step back */
const FOCUS_REST = 0.9;
const FOCUS_LIFT = 14; // px

export default function Services2() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const dialRef = useRef(null);
  const stageRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const cards = cardsRef.current.filter(Boolean);
    const dial = dialRef.current;
    const stage = stageRef.current;
    if (!section || !cards.length || !dial || !stage) return;

    // reduced motion: the static grid is CSS's (a media query), from the
    // first paint; nothing to drive
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const totalCards = cards.length;

    /* the nine cards are their own layers only while the section is near
       the screen — nine large shadowed layers for the whole visit cost the
       compositor on every other section too */
    const near = new IntersectionObserver(
      ([entry]) => section.classList.toggle("is-live", entry.isIntersecting),
      { rootMargin: "50% 0px" }
    );
    near.observe(section);

    const arcAngle = Math.PI * 0.4;
    const startAngle = Math.PI / 2 - arcAngle / 2;

    /* phone: a near-flat arc, one card at a time. Tablet: tighter, so two
       or three share the screen — on the phone curve a single small card
       sat alone in the middle of a very tall screen. */
    const getRadius = () => {
      const w = window.innerWidth;
      if (w < 600) return w * 7.5;
      /* flatter than it was (3.2 / 2.5): the outer cards ride higher and
         the arc reads as a gentle sweep, not a bowl dropping off the page */
      if (w < 1025) return w * 3.6;
      return w * 3.2;
    };

    const ticks = [...dial.querySelectorAll("svg")];
    const label = dial.querySelector(".s2-dial-label");
    let active = -2;
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
      // each tick strip turns about the wheel's centre, far below it
      ticks.forEach((svg) => {
        svg.style.transformOrigin = `${cx}px ${cy}px`;
      });
      const step = DIAL_STEP / r;
      dial.style.top = `${top}px`;
      // enough ticks to run past both edges, whatever the turn
      const reach = Math.asin(Math.min(1, (sw / 2 + DIAL_STEP * 2) / r));
      const n = Math.ceil(reach / step) + 1;
      /* and none that would reach the section's bottom edge: the arc drops
         toward the sides, and a tick drawn past the edge was cut in half
         as the section scrolled away. They stop short instead. */
      const floor = Math.min(DIAL_BAND, stage.clientHeight - top - 10);
      ticks.forEach((svg, k) => {
        const len = k === 0 ? DIAL_LEN : DIAL_LIT;
        svg.setAttribute("viewBox", `0 0 ${sw} ${DIAL_BAND}`);
        let d = "";
        for (let i = -n; i <= n; i++) {
          const sin = Math.sin(i * step);
          const cos = Math.cos(i * step);
          const y1 = cy - r * cos;
          // y2 is the tick's lower end (the centre of the wheel is below)
          const y2 = cy - (r - len) * cos;
          if (y2 > floor) continue;
          const x1 = cx + r * sin;
          const x2 = cx + (r - len) * sin;
          d += `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
        }
        svg.querySelector("path").setAttribute("d", d);
      });

      geo = { radius, cardSpacing, from, to, cx, cy, step };
    }

    function positionCards(progress = 0) {
      const { radius, cardSpacing, from, to, cx, cy, step } = geo;
      const arcProgress = from + progress * (to - from);

      let nearest = -1;
      let nearestD = Infinity;
      cards.forEach((card, i) => {
        const cardOffset = (totalCards - 1 - i) * cardSpacing;
        const cardProgress = cardOffset + arcProgress;
        const angle = startAngle + arcAngle * cardProgress;

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const rotation = (angle - Math.PI / 2) * (180 / Math.PI);

        /* Focus: how close this card is to the centre, in card-widths —
           1 when it sits dead centre, 0 one card away. The card in focus
           comes forward to full size and lifts a little; its neighbours sit
           a step back, so there is always one card the eye lands on. */
        const d = Math.abs(cardProgress - 0.5) / cardSpacing;
        const f = Math.max(0, 1 - d);
        const focus = f * f * (3 - 2 * f); // smoothstep: settles, never snaps
        if (d < nearestD) {
          nearestD = d;
          nearest = i;
        }

        gsap.set(card, {
          x,
          y: -y + radius - FOCUS_LIFT * focus,
          rotation: -rotation,
          scale: FOCUS_REST + (1 - FOCUS_REST) * focus,
          transformOrigin: "center center",
        });
      });

      /* The dial's label says where you are: "scroll to turn" until the
         first card has reached the middle, then the card in focus. Between
         cards, and once the last has passed the middle at the very end, it
         keeps the one it last showed. Written only when it changes. */
      const firstAt = (totalCards - 1) * cardSpacing + arcProgress;
      const now =
        firstAt < 0.5 - cardSpacing / 2 ? -1 : nearestD < 0.5 ? nearest : active;
      if (now !== active) {
        active = now;
        label.textContent =
          now < 0
            ? "scroll to turn"
            : `${String(now + 1).padStart(2, "0")} / ${String(totalCards).padStart(2, "0")} · ${SERVICES[now].name}`;
      }

      /* The wheel turns by exactly the cards' angle, so the ticks travel
         with them. They are evenly spaced, so the turn is only needed
         modulo one step: the strip never runs out.
         Turned as a CSS transform on the drawn strip (one composited layer,
         moved), not an SVG transform attribute — that redrew every tick of
         both strips, through their masks, on every frame. */
      const turn = (arcAngle * arcProgress) % step;
      const deg = (-(turn < 0 ? turn + step : turn) * 180) / Math.PI;
      const t = `rotate(${deg.toFixed(3)}deg)`;
      ticks.forEach((svg) => {
        svg.style.transform = t;
      });
    }

    layout();
    positionCards(0);

    /* The section is the track and its stage holds the screen (sticky):
       the turn runs from the section's top reaching the top of the screen
       to its bottom reaching the bottom. Not a ScrollTrigger pin — pinning
       flips the section to position: fixed and back, and each flip counted
       as a full-screen layout shift (CLS ~1, with nothing visibly moving). */
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => positionCards(self.progress),
    });

    const handleResize = () => {
      layout();
      positionCards(trigger.progress);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      near.disconnect();
      trigger.kill();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section
      className="s2 v2-invert"
      id="services"
      ref={sectionRef}
      /* how long the stage is held, in screens (HOLD_PER_CARD a card).
         0.26 was tried and reverted: the cards crossed too fast to read. */
      style={{ "--s2-hold": SERVICES.length * HOLD_PER_CARD }}
    >
      <div className="s2-stage" ref={stageRef}>
        {/* the heading, and a line beside it that says what the nine are —
            it took over from the two corner notes ("nine disciplines", "one
            studio"), which said the same thing in the least read place */}
        <div className="s2-header">
          <div>
            <p className="s2-label">[ 04 · services ]</p>
            <h2 className="s2-title">Services</h2>
          </div>
          <p className="s2-intro">
            Nine disciplines, one studio. From the first idea to the final frame.
          </p>
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
          {/* the wrappers hold the fades (still); the strips inside turn */}
          <div className="s2-dial-ticks">
            <svg preserveAspectRatio="none">
              <path />
            </svg>
          </div>
          <div className="s2-dial-ticks is-lit">
            <svg preserveAspectRatio="none">
              <path />
            </svg>
          </div>
          <p className="s2-dial-label">scroll to turn</p>
        </div>
      </div>
    </section>
  );
}
