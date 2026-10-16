"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";

import "./ScrollNav.css";

/* The same four destinations as the hero nav. Each maps to the section that
   answers it; "studio" is the "what we do" section. */
const LINKS = [
  { label: "work", href: "#work" },
  { label: "studio", href: "#what-we-do" },
  { label: "services", href: "#services" },
  { label: "contact", href: "#contact" },
];

/* A slim pill that takes over once the hero's own nav has scrolled away
   (Brikken's floating nav). It hands over exactly where the hero nav leaves
   — an observer on that nav, not a scroll threshold — so there is never a
   moment with no navigation, and never two at once.

   The link for the section you are in carries a small navy square: the page
   tells you where you are without a second colour. */
export default function ScrollNav() {
  const [shown, setShown] = useState(false);
  const [current, setCurrent] = useState(null);
  const lenis = useLenis();
  const lenisRef = useRef(null);

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  // shown once the hero's nav is fully off screen
  useEffect(() => {
    const heroNav = document.querySelector(".h2-nav");
    if (!heroNav) return;
    const io = new IntersectionObserver(([e]) => setShown(!e.isIntersecting), {
      threshold: 0,
    });
    io.observe(heroNav);
    return () => io.disconnect();
  }, []);

  /* The section in charge is the one whose top passed 40% of the viewport
     most recently — the nearest above that line, judged by position, not by
     the order of the links (studio comes second in the nav but first on the
     page). Read once per frame at most, on the native scroll event; Lenis
     drives native scroll, so this fires for it too. */
  useEffect(() => {
    const sections = LINKS.map((l) => document.querySelector(l.href));
    let raf = 0;
    const read = () => {
      raf = 0;
      const line = window.innerHeight * 0.4;
      let active = null;
      let best = -Infinity;
      sections.forEach((s, i) => {
        if (!s) return;
        const top = s.getBoundingClientRect().top;
        if (top <= line && top > best) {
          best = top;
          active = LINKS[i].href;
        }
      });
      setCurrent(active);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const goTo = (e, href) => {
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const l = lenisRef.current;
    if (l) l.scrollTo(target, { duration: 1.4 });
    else target.scrollIntoView();
  };

  return (
    <nav
      className={`sn${shown ? " is-shown" : ""}`}
      aria-label="Site"
      // hidden from the tab order and screen readers while it is not shown
      aria-hidden={!shown}
    >
      <a
        className="sn-brand"
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          const l = lenisRef.current;
          if (l) l.scrollTo(0, { duration: 1.4 });
          else window.scrollTo(0, 0);
        }}
        tabIndex={shown ? 0 : -1}
        aria-label="studio morpheus. — back to top"
      >
        <svg className="sn-mark" viewBox="0 0 64 64" aria-hidden="true">
          <path d="M15 9 L49 9 L32 27 Z" />
          <path d="M15 55 L49 55 L32 37 Z" />
          <path d="M9 15 L9 49 L27 32 Z" />
          <path d="M55 15 L55 49 L37 32 Z" />
        </svg>
        <span>morpheus</span>
      </a>

      <ul className="sn-links">
        {LINKS.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              className={current === l.href ? "is-current" : undefined}
              aria-current={current === l.href ? "location" : undefined}
              onClick={(e) => goTo(e, l.href)}
              tabIndex={shown ? 0 : -1}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>

      <a
        className="sn-cta"
        href="mailto:sakshi@dreamwithmorpheus.com"
        tabIndex={shown ? 0 : -1}
      >
        Start a project
        <span className="sn-cta-arrow" aria-hidden="true">
          <svg viewBox="0 0 16 16">
            <path
              d="M4.5 11.5L11.5 4.5M11.5 4.5H6M11.5 4.5V10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            />
          </svg>
          <svg viewBox="0 0 16 16">
            <path
              d="M4.5 11.5L11.5 4.5M11.5 4.5H6M11.5 4.5V10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            />
          </svg>
        </span>
      </a>

      {/* phones and tablets: the hero's menu sheet, opened from here */}
      <button
        type="button"
        className="sn-menu"
        aria-label="Open menu"
        onClick={() => window.dispatchEvent(new Event("v2:open-menu"))}
        tabIndex={shown ? 0 : -1}
      >
        <span className="v2-burger" aria-hidden="true">
          <span />
          <span />
        </span>
      </button>
    </nav>
  );
}
