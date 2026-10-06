"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLenis } from "lenis/react";

import { WORDMARK_GLYPHS, WORDMARK_VIEWBOX } from "../Hero2/wordmark";
import { openLoaderLanded, openLoaderReveal } from "./loaderGate";
import "./Loader2.css";

/* Performance is the design constraint here — the loader is the first thing
   anyone sees, and every refresh plays it. So nothing in it repaints:

   · the fill is one small layer per letter, revealed by two opposing
     transforms (the window slides up, the letter inside slides down by the
     same amount, so it stays put). The previous version moved SVG clip
     rects, which repainted the whole wordmark every frame — measured at one
     full paint per frame.
   · the mark is laid out at the hero's size and starts scaled DOWN, so it is
     rasterised once at full resolution and never blurs or re-rasters.
   · the glide and the fade run on the compositor (Web Animations), so the
     hydration and hero start-up happening underneath cannot stall them. */

const [, , WM_W, WM_H] = WORDMARK_VIEWBOX.split(" ").map(Number);
const INK_TOP = 14.58;
const INK_BOTTOM = 81.74;
const INK_H = INK_BOTTOM - INK_TOP;
const pct = (n, of) => `${(n / of) * 100}%`;

/* each letter's column: from its own origin to the next letter's */
const CELLS = WORDMARK_GLYPHS.map((g, i) => ({
  glyph: g,
  x: g.tx,
  w: (WORDMARK_GLYPHS[i + 1]?.tx ?? WM_W) - g.tx,
}));

/* timing */
const MIN_COUNT = 1.6; // s — the count never finishes faster than this
const MAX_WAIT = 4; // s — and never waits on the network longer than this
const TRAVEL = 1250; // ms — centre → the hero's wordmark
const EXPO_IN_OUT = "cubic-bezier(0.87, 0, 0.13, 1)";
const SMOOTH = "cubic-bezier(0.45, 0, 0.55, 1)";

/* how wide the mark reads while centred: the page's side padding
   (--v2-pad, clamp(1.25rem, 4vw, 4rem)) either side, capped at 72rem */
const centredWidth = () => {
  const vw = window.innerWidth;
  const pad = Math.min(64, Math.max(20, vw * 0.04));
  return Math.min(vw - pad * 2, 1152);
};

let played = false; // once per page load; a client-side return skips it

const Glyph = ({ glyph }) => (
  <path
    d={glyph.d}
    transform={`translate(${glyph.tx} 0)`}
    fillRule={glyph.evenodd ? "evenodd" : undefined}
  />
);

export default function Loader2() {
  const ref = useRef(null);
  const markRef = useRef(null);
  const lenis = useLenis();
  const lenisRef = useRef(null);
  const lockedRef = useRef(false);

  /* Lenis can arrive after this component's first effect: keep the latest
     instance, and stop it on arrival if the loader is still up. */
  useEffect(() => {
    lenisRef.current = lenis;
    if (lockedRef.current) lenis?.stop();
  }, [lenis]);

  useEffect(() => {
    const root = ref.current;
    const mark = markRef.current;
    if (!root || !mark) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // hidden, never removed: the node is React's, and React removes it
    if (reduced || played) {
      root.style.display = "none";
      window.__l2Unlock?.();
      openLoaderReveal(false);
      openLoaderLanded(false);
      return;
    }
    played = true;

    // the boot script already swallows input; this keeps Lenis quiet too
    window.scrollTo(0, 0);
    lockedRef.current = true;
    lenisRef.current?.stop();

    const unlock = () => {
      lockedRef.current = false;
      window.__l2Unlock?.();
      lenisRef.current?.start();
    };

    /* Lay the mark out exactly on the hero's wordmark, then park it in the
       centre with a transform. Landing is then just "transform: none". */
    const target = document.querySelector(".h2-wordmark-svg");
    let centred = "none";
    const place = () => {
      const r = target?.getBoundingClientRect();
      if (!r) return;
      Object.assign(mark.style, {
        left: `${r.left}px`,
        top: `${r.top}px`,
        width: `${r.width}px`,
        height: `${r.height}px`,
      });
      // centre the INK, not the box — the viewBox carries air above the caps
      const s = centredWidth() / r.width;
      const inkMid = ((INK_TOP + INK_BOTTOM) / 2 / WM_H) * r.height;
      const tx = window.innerWidth / 2 - r.left - (s * r.width) / 2;
      const ty = window.innerHeight / 2 - r.top - s * inkMid;
      centred = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`;
      mark.style.transform = centred;
    };
    place();
    window.addEventListener("resize", place);

    const num = root.querySelector(".l2-num");
    const cells = [...root.querySelectorAll(".l2-cell")].map((cell) => ({
      cell,
      inner: cell.firstElementChild,
    }));

    const state = { p: 0 };
    let lastLabel = "";
    const paint = () => {
      const label = String(Math.round(state.p)).padStart(3, "0");
      if (label !== lastLabel) num.textContent = lastLabel = label;
      // letter i fills across its own slice of the count, bottom to top
      cells.forEach(({ cell, inner }, i) => {
        const hidden = 1 - gsap.utils.clamp(0, 1, (state.p / 100) * cells.length - i);
        cell.style.transform = `translate3d(0, ${hidden * 100}%, 0)`;
        inner.style.transform = `translate3d(0, ${-hidden * 100}%, 0)`;
      });
    };
    paint();

    // the page is "ready" when it has loaded — or when we stop waiting
    const ready = new Promise((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", resolve, { once: true });
      setTimeout(resolve, MAX_WAIT * 1000);
    });

    // in: the mark and the notes surface out of the black
    const intro = gsap.to([mark, ...root.querySelectorAll(".l2-meta")], {
      opacity: 1,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.1,
      delay: 0.1,
    });

    // most of the count runs on its own clock, easing into a hold at 86
    const lead = gsap.to(state, {
      p: 86,
      duration: MIN_COUNT,
      ease: "power2.inOut",
      onUpdate: paint,
    });

    let finished = false;
    let tail = null;
    const running = [];

    const land = () => {
      openLoaderLanded(Boolean(target));
      unlock();
      running.push(
        mark.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, fill: "forwards" })
      );
      running[running.length - 1].onfinish = () => {
        root.style.display = "none";
      };
    };

    const glide = () => {
      window.removeEventListener("resize", place);
      place(); // layout has settled by now — re-aim before leaving

      // the letters are full: their layers can go before the mark moves
      cells.forEach(({ cell, inner }) => {
        cell.style.willChange = inner.style.willChange = "auto";
      });

      const move = mark.animate([{ transform: centred }, { transform: "none" }], {
        duration: TRAVEL,
        easing: EXPO_IN_OUT,
        fill: "forwards",
      });
      // the black lifts under the moving mark; the hero comes up beneath
      const lift = root.querySelector(".l2-ground").animate([{ opacity: 1 }, { opacity: 0 }], {
        delay: TRAVEL * 0.45,
        duration: TRAVEL * 0.75,
        easing: SMOOTH,
        fill: "forwards",
      });
      running.push(move, lift);
      setTimeout(() => openLoaderReveal(Boolean(target)), TRAVEL * 0.45);
      move.onfinish = land;
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      tail = gsap
        .timeline()
        .to(state, { p: 100, duration: 0.4, ease: "power2.out", onUpdate: paint })
        // the notes step aside before the mark moves
        .to(root.querySelectorAll(".l2-meta"), { opacity: 0, y: 8, duration: 0.4, ease: "power2.in" }, "+=0.1")
        .add(glide, "-=0.15");
    };

    Promise.all([ready, new Promise((r) => lead.eventCallback("onComplete", r))]).then(finish);

    return () => {
      // StrictMode's rehearsal unmount lands here mid-count: let the real
      // mount play it rather than treating it as already seen
      if (!finished) played = false;
      window.removeEventListener("resize", place);
      intro.kill();
      lead.kill();
      tail?.kill();
      running.forEach((a) => a.cancel());
      lockedRef.current = false;
      lenisRef.current?.start();
    };
  }, []);

  return (
    <div className="l2" ref={ref} aria-hidden="true">
      {/* the ground: black, lifted at the centre — faded, not flat */}
      <div className="l2-ground" />

      <div className="l2-mark" ref={markRef}>
        {/* the ghost: the whole word, waiting */}
        <svg className="l2-ghost" viewBox={WORDMARK_VIEWBOX} preserveAspectRatio="none">
          {WORDMARK_GLYPHS.map((g, i) => (
            <Glyph key={i} glyph={g} />
          ))}
        </svg>

        {/* the fill: one window per letter over its ink band. The window
            slides up out of the floor while its content slides down by the
            same amount, so the letter stays still and fills from below. */}
        {CELLS.map((c, i) => (
          <span
            className="l2-cell"
            key={i}
            style={{
              left: pct(c.x, WM_W),
              width: pct(c.w, WM_W),
              top: pct(INK_TOP, WM_H),
              height: pct(INK_H, WM_H),
            }}
          >
            <span className="l2-cell-in">
              <svg
                viewBox={`${c.x} ${INK_TOP} ${c.w} ${INK_H}`}
                preserveAspectRatio="none"
              >
                <Glyph glyph={c.glyph} />
              </svg>
            </span>
          </span>
        ))}
      </div>

      {/* the studio's own secondary tagline, verbatim from the old site.
          It replaced "studio morpheus. loading": the wordmark already says
          the name and the count already says loading. */}
      <p className="l2-meta l2-status">Dream bigger. We&apos;ll make it happen.</p>
      <p className="l2-meta l2-count">
        <span className="l2-num">000</span>
      </p>
    </div>
  );
}
