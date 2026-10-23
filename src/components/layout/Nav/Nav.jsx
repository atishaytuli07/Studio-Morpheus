"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";

import { loaderDone } from "@/lib/loaderGate";
import { BrandMark } from "@/components/ui/Icons";
import Button from "@/components/ui/Button";
import { MAILTO, EMAIL, PHONE, SOCIALS, NAV_LINKS } from "@/content/site";
import "./Nav.css";

/* the scroll at which the bar takes its glass and gathers into the pill */
const COMPACT_AT = 24;
/* an open menu closes once the page has been scrolled this far under it */
const CLOSE_ON_SCROLL = 80;

/* The site's one navigation, in three shapes (data-state on .gn):

     · top      — the original nav: no background, bone links over the hero,
                  the white "Start a project" chip;
     · compact  — on scroll it takes on frosted glass, then gathers into a
                  small pill: the mark and the menu icon, nothing else;
     · open     — the pill grows down into a glass card: the links large,
                  the contact lines and the CTA under them.

   How it moves, cheaply: the glass is ONE layer, always the full width of
   the bar and the full height of the card. Nothing about it is resized;
   only its clip-path changes — full bar, pill, card — and the mark and the
   icon ride the pill's edges on transforms. So the shape change costs no
   layout at all: clip-path, transform and opacity, nothing else. */
export default function Nav() {
  const ref = useRef(null);
  const burgerRef = useRef(null);
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const lenis = useLenis();
  const lenisRef = useRef(null);
  // set when a menu link was chosen: focus goes to its section, not back
  // to the menu icon
  const jumpedRef = useRef(false);

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  // arrives with the hero, once the loader has lifted
  useEffect(() => {
    let cancelled = false;
    loaderDone().then(() => !cancelled && setShown(true));
    return () => {
      cancelled = true;
    };
  }, []);

  // the original bar at the very top, the pill everywhere else
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      setCompact(window.scrollY > COMPACT_AT);
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

  /* The open card behaves like a popover: Escape, a press outside it or
     scrolling the page away all close it, and focus goes in on open and
     back to the menu icon on close. */
  useEffect(() => {
    if (!open) return;
    const root = ref.current;
    const burger = burgerRef.current;
    const from = window.scrollY;
    root?.querySelector(".gn-menu-links a")?.focus({ preventScroll: true });

    const close = () => setOpen(false);
    const onKey = (e) => e.key === "Escape" && close();
    const onDown = (e) => root && !root.contains(e.target) && close();
    const onScroll = () => Math.abs(window.scrollY - from) > CLOSE_ON_SCROLL && close();
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onScroll);
      if (!jumpedRef.current) burger?.focus({ preventScroll: true });
      jumpedRef.current = false;
    };
  }, [open]);

  /* Smooth scroll to a section, then hand it keyboard focus: the default
     jump is prevented, so without this the next Tab would start from the
     nav again instead of inside the section just reached. */
  const goTo = (e, href) => {
    const target = href === "#top" ? 0 : document.querySelector(href);
    if (target === null) return;
    e.preventDefault();
    if (open) jumpedRef.current = true;
    setOpen(false);
    const settle = () => {
      if (target === 0) return;
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };
    const l = lenisRef.current;
    if (l) l.scrollTo(target, { duration: 1.4, onComplete: settle });
    else {
      if (target === 0) window.scrollTo(0, 0);
      else target.scrollIntoView();
      settle();
    }
  };

  const state = open ? "open" : compact ? "compact" : "top";
  const tab = (on) => (on ? 0 : -1);

  return (
    <>
      {/* the page dims behind the open card; a press on it closes the menu
          (it is outside the header, so the outside-press handler catches it) */}
      <div className={`gn-scrim${open ? " is-open" : ""}`} aria-hidden="true" />
      <header
        className={`gn${shown ? " is-shown" : ""}`}
        data-state={state}
        ref={ref}
      >
        {/* the glass and the card's contents: one layer, clipped to the shape */}
        <div className="gn-glass" id="gn-menu" aria-hidden={!open}>
          <div className="gn-card">
            <p className="gn-label">Menu</p>
            <nav className="gn-menu-links" aria-label="Menu">
              {NAV_LINKS.map((l, i) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => goTo(e, l.href)}
                  tabIndex={tab(open)}
                  style={{ "--i": i }}
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="gn-foot">
              <div>
                <p className="gn-label">Work with us</p>
                <a href={MAILTO} tabIndex={tab(open)}>
                  {EMAIL}
                </a>
                <a href={PHONE.href} tabIndex={tab(open)}>
                  {PHONE.label}
                </a>
              </div>
              <div>
                <p className="gn-label">Follow</p>
                {SOCIALS.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    tabIndex={tab(open)}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {/* the CTA leaves the bar when it becomes the pill; it lives here */}
            <Button href={MAILTO} variant="dark" className="gn-menu-cta" tabIndex={tab(open)}>
              Start a project
            </Button>
          </div>
        </div>

        <div className="gn-bar">
          <a
            className="gn-brand"
            href="#top"
            onClick={(e) => goTo(e, "#top")}
            aria-label="studio morpheus. Back to top"
          >
            <BrandMark className="gn-mark" />
            <span>morpheus</span>
          </a>

          <nav className="gn-links" aria-label="Site" aria-hidden={state !== "top"}>
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => goTo(e, l.href)}
                tabIndex={tab(state === "top")}
              >
                {l.label.toLowerCase()}
              </a>
            ))}
          </nav>

          <Button
            href={MAILTO}
            className="gn-cta"
            aria-hidden={state !== "top"}
            tabIndex={tab(state === "top")}
          >
            Start a project
          </Button>

          <button
            type="button"
            className="gn-burger"
            ref={burgerRef}
            aria-expanded={open}
            aria-controls="gn-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {/* two lines that cross into an X while the card is open */}
            <span className="burger" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>
    </>
  );
}
