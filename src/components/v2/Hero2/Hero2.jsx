"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useLenis } from "lenis/react";

import { WORDMARK_GLYPHS, WORDMARK_VIEWBOX } from "./wordmark";
import { mountWordmarkFluid } from "./wordmarkFluid";
import "./Hero2.css";
import { loaderDone, wordmarkLanded } from "../Loader2/loaderGate";

/* In-page for now: the Work, Studio, Services and Contact pages do not
   exist yet, and these all returned 404. Each points at the section that
   answers it; swap for routes when the pages are built. */
const NAV = [
  { label: "work", href: "#work" },
  { label: "studio", href: "#what-we-do" },
  { label: "services", href: "#services" },
  { label: "contact", href: "#contact" },
];

const COPY_LINES = [
  "Just like the Greek god of dreams,",
  "we turn creative visions",
  "into reality.",
];


/* one entrance per session — StrictMode's double-mount and client navs
   must not rebuild competing timelines over the same elements */
let heroPlayed = false;

export default function Hero2() {
  const ref = useRef(null);
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const menuBtnRef = useRef(null);
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const lenis = useLenis();

  // smooth where Lenis is running, native otherwise
  const goTo = (e, href) => {
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    setMenuOpen(false);
    lenis?.start();
    if (lenis) lenis.scrollTo(target, { duration: 1.4 });
    else target.scrollIntoView();
  };

  /* The menu is a modal sheet: the page behind must not scroll, Escape
     closes it, focus moves in on open and back to the button on close. */
  useEffect(() => {
    if (!menuOpen) return;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    menuRef.current?.querySelector("a, button")?.focus();
    const button = menuBtnRef.current;

    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    // rotated or resized past the breakpoint: the sheet has no button to shut it
    const wide = window.matchMedia("(min-width: 821px)");
    const onWide = () => wide.matches && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);

    return () => {
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
      document.documentElement.style.overflow = "";
      lenis?.start();
      button?.focus({ preventScroll: true });
    };
  }, [menuOpen, lenis]);

  useEffect(() => {
    const section = ref.current;
    const wrap = wrapRef.current;
    if (!section || !wrap) return;

    let cancelled = false;
    let disposeFluid = null;
    const ctx = gsap.context(() => {}, section);

    /* The letter-by-letter entrance animates the live SVG, so the liquid
       effect can only take over once the mark has settled into its final
       state — then it snapshots that state and swaps the canvas in. */
    const startFluid = () => {
      if (cancelled) return;
      mountWordmarkFluid({
        container: wrap,
        svg: svgRef.current,
        pointerTarget: section,
      })
        .then((dispose) => {
          if (cancelled) dispose();
          else disposeFluid = dispose;
        })
        .catch(() => {
          /* the plain SVG stays visible — no visual regression */
        });
    };

    // CSS owns every initial (hidden) state; this only drives them to rest.
    /* Pointer parallax: the two masses lean opposite ways, lagged. Only for
       a fine pointer, never under reduced motion. Pauses with the hero. */
    let stopParallax = () => {};
    const startParallax = () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
      const wraps = section.querySelectorAll(".h2-aurora-p");
      if (wraps.length < 2) return;
      const ease = { duration: 1.4, ease: "power2.out" };
      const a = { x: gsap.quickTo(wraps[0], "x", ease), y: gsap.quickTo(wraps[0], "y", ease) };
      const c = { x: gsap.quickTo(wraps[1], "x", ease), y: gsap.quickTo(wraps[1], "y", ease) };
      const onMove = (e) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        a.x(nx * 44); a.y(ny * 30);
        c.x(-nx * 26); c.y(-ny * 18);
      };
      section.addEventListener("mousemove", onMove);
      stopParallax = () => section.removeEventListener("mousemove", onMove);
    };

    // no point animating a hero nobody is looking at
    const io = new IntersectionObserver(
      ([entry]) => section.classList.toggle("is-offscreen", !entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(section);

    const showAll = () => {
      gsap.set(
        [
          ".h2-aurora",
          ".h2-glow",
          ".h2-nav",
          ".h2-line-inner",
          ".h2-letter",
          ".h2-meta > *",
        ],
        { clearProps: "all" }
      );
      section.classList.add("is-settled");
      /* The liquid wordmark imports three.js and compiles shaders — a
         main-thread hit. Deferred to idle time so it cannot land as a
         hitch in the middle of the entrance; the SVG shows until then. */
      const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 200));
      idle(() => startFluid(), { timeout: 1500 });
      startParallax();
    };

    // the entrance waits for the loader's black to start lifting, or it
    // plays unseen behind it
    Promise.all([document.fonts.ready, loaderDone()]).then(([, gate]) => {
      if (cancelled) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (heroPlayed || reduced) {
        ctx.add(showAll);
        return;
      }
      heroPlayed = true;

      /* When the loader delivers the wordmark, it flies its own copy onto
         this one — so these letters must not rise on their own. They switch
         on, fully formed, the instant the loader's copy lands on top. */
      const handoff = Boolean(gate?.handoff);
      if (handoff) {
        wordmarkLanded().then(() => {
          if (!cancelled) ctx.add(() => gsap.set(".h2-letter", { y: 0, opacity: 1 }));
        });
      }

      ctx.add(() => {
        const tl = gsap.timeline({
          defaults: { ease: "expo.out" },
          // settling swaps in the liquid canvas, which snapshots the letters:
          // never before they are on
          onComplete: () =>
            handoff ? wordmarkLanded().then(() => !cancelled && showAll()) : showAll(),
        });

        tl.to(".h2-aurora", { opacity: 0.55, duration: 2.4, ease: "power2.out" }, 0)
          .to(".h2-glow", { opacity: 1, duration: 2.6, ease: "power2.out" }, 0.2)
          .to(".h2-nav", { opacity: 1, y: 0, duration: 1 }, 0.15)
          // copy: masked lines rise, their split-line pattern
          .to(".h2-line-inner", { y: 0, duration: 1.1, stagger: 0.09 }, 0.35)
          .to(".h2-meta > *", { opacity: 1, y: 0, duration: 0.8, stagger: 0.06 }, 1.0);

        // wordmark: each outlined glyph rises and fades in — unless the
        // loader has already carried it here
        if (!handoff) {
          tl.to(".h2-letter", { y: 0, opacity: 1, duration: 1.3, stagger: 0.045 }, 0.5);
        }
      });
    });

    return () => {
      cancelled = true;
      stopParallax();
      io.disconnect();
      disposeFluid?.();
      ctx.revert();
    };
  }, []);

  return (
    <section className="h2" ref={ref}>
      {/* backdrop: heavily blurred artwork at 60%, monolog-style */}
      {/* pure gradient atmosphere — the blurred artwork always read as an
          accidental figure, so the light is now built, not photographed */}
      <div className="h2-bg" aria-hidden="true">
        {/* two light masses on different periods, drifting against each
            other; the wrappers take the pointer parallax */}
        <span className="h2-aurora-p">
          <span className="h2-aurora" />
        </span>
        <span className="h2-aurora-p h2-aurora-p2">
          <span className="h2-aurora h2-aurora-2" />
        </span>
        {/* horizon glow: the light mass anchors low, behind the wordmark */}
        <span className="h2-glow" />
        <span className="h2-bg-gradient" />
      </div>

      {/* full-width bar: wordmark hard left, links centred, CTA hard right */}
      <header className="h2-nav">
        <Link href="/new" className="h2-brand" aria-label="studio morpheus.">
          <svg className="h2-brand-mark" viewBox="0 0 64 64" aria-hidden="true">
            <path d="M15 9 L49 9 L32 27 Z" />
            <path d="M15 55 L49 55 L32 37 Z" />
            <path d="M9 15 L9 49 L27 32 Z" />
            <path d="M55 15 L55 49 L37 32 Z" />
          </svg>
          <span className="h2-brand-name">morpheus</span>
        </Link>

        <nav className="h2-links">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={(e) => goTo(e, n.href)}>
              {n.label}
            </a>
          ))}
        </nav>

        <a className="h2-cta" href="mailto:sakshi@dreamwithmorpheus.com">
          Start a project
          {/* two arrows: on hover the first exits top-right and the second
              flies in from bottom-left — the chip feels alive, not static */}
          <span className="h2-cta-arrow">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M4.5 11.5L11.5 4.5M11.5 4.5H6M11.5 4.5V10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              />
            </svg>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M4.5 11.5L11.5 4.5M11.5 4.5H6M11.5 4.5V10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              />
            </svg>
          </span>
        </a>
        {/* phones and tablets: the links live behind this */}
        <button
          type="button"
          className="h2-menu-btn"
          ref={menuBtnRef}
          aria-expanded={menuOpen}
          aria-controls="h2-menu"
          onClick={() => setMenuOpen(true)}
        >
          Menu
        </button>
      </header>

      <div
        className={`h2-menu${menuOpen ? " is-open" : ""}`}
        id="h2-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="h2-menu-top">
          <span className="h2-brand">
            <svg className="h2-brand-mark" viewBox="0 0 64 64" aria-hidden="true">
              <path d="M15 9 L49 9 L32 27 Z" />
              <path d="M15 55 L49 55 L32 37 Z" />
              <path d="M9 15 L9 49 L27 32 Z" />
              <path d="M55 15 L55 49 L37 32 Z" />
            </svg>
            <span className="h2-brand-name">morpheus</span>
          </span>
          <button
            type="button"
            className="h2-menu-btn"
            onClick={() => setMenuOpen(false)}
          >
            Close
          </button>
        </div>

        <nav className="h2-menu-links">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={(e) => goTo(e, n.href)}>
              {n.label}
            </a>
          ))}
        </nav>

        <div className="h2-menu-foot">
          <p>studio morpheus.</p>
          <a className="h2-cta" href="mailto:sakshi@dreamwithmorpheus.com">
            Start a project
          </a>
        </div>
      </div>

      {/* centred copy — the mark lives in the nav only; twice in one
          viewport was redundant */}
      <div className="h2-content">
        <h1 className="h2-copy" aria-label={COPY_LINES.join(" ")}>
          {COPY_LINES.map((text) => (
            <span className="h2-line" key={text} aria-hidden="true">
              <span className="h2-line-inner">{text}</span>
            </span>
          ))}
        </h1>
      </div>

      <div className="h2-meta">
        <p>est. 2024</p>
        <p>the greek god of dreams</p>
        <p>available for work</p>
      </div>

      {/* wordmark as vector outlines, one path per glyph — the same technique
          monolog uses, so it stays crisp at any size and needs no webfont */}
      <div className="h2-wordmark" ref={wrapRef} role="img" aria-label="morpheus">
        <svg
          className="h2-wordmark-svg"
          ref={svgRef}
          viewBox={WORDMARK_VIEWBOX}
          width="100%"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {WORDMARK_GLYPHS.map((glyph, i) => (
            // outer g owns the static x-offset; inner g is what animates,
            // so GSAP's transform never clobbers the letter's position
            <g key={i} transform={`translate(${glyph.tx} 0)`}>
              <g className="h2-letter">
                <path
                  d={glyph.d}
                  fill="currentColor"
                  // counters in O/R/P are subpaths that only read as holes
                  // under the evenodd rule, exactly as in the source SVG
                  fillRule={glyph.evenodd ? "evenodd" : undefined}
                  clipRule={glyph.evenodd ? "evenodd" : undefined}
                />
              </g>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}
