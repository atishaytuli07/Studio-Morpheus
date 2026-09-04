"use client";

import "./Nav.css";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";

import GridFrame from "@/components/GridFrame/GridFrame";
import { scrambleIn, scrambleVisible } from "./scramble";

const NAV_LINKS = [
  { href: "/", label: "home" },
  { href: "/work", label: "work" },
  { href: "/studio", label: "studio" },
  { href: "/contact", label: "contact" },
];

gsap.registerPlugin(ScrollTrigger);

const normalizePath = (path) => {
  const normalized = (path.split("?")[0].split("#")[0] || "/").replace(
    /\/$/,
    ""
  );
  return normalized || "/";
};

export default function Nav() {
  const pathname = usePathname();
  const lenis = useLenis();
  const navRef = useRef(null);
  const overlayRef = useRef(null);
  const hamburgerTl = useRef(null);
  const isMenuOpen = useRef(false);
  const hoverCleanups = useRef([]);

  const clearScrambleTimers = () => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    overlay.querySelectorAll("*").forEach((el) => {
      if (el.scrambleInterval) {
        clearInterval(el.scrambleInterval);
        el.scrambleInterval = null;
      }
      if (el.scrambleTimeout) {
        clearTimeout(el.scrambleTimeout);
        el.scrambleTimeout = null;
      }
      if (el.staggerTimeout) {
        clearTimeout(el.staggerTimeout);
        el.staggerTimeout = null;
      }
    });
  };

  const revertText = () => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    overlay
      .querySelectorAll(".nav-item a, .nav-footer-item a")
      .forEach((link) => {
        link.style.color = "";
        delete link.dataset.originalColor;
        link.innerHTML = link.textContent;
      });
  };

  const removeHoverListeners = () => {
    hoverCleanups.current.forEach((cleanup) => cleanup());
    hoverCleanups.current = [];
  };

  const addHoverEffects = () => {
    if (window.innerWidth < 1000) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    removeHoverListeners();

    const allLinks = [
      ...overlay.querySelectorAll(".nav-item a"),
      ...overlay.querySelectorAll(".nav-footer-item a"),
    ];

    allLinks.forEach((link) => {
      let hovering = false;

      const onEnter = () => {
        if (hovering || !isMenuOpen.current) return;
        hovering = true;

        if (!link.dataset.originalColor) {
          link.dataset.originalColor = getComputedStyle(link).color;
        }
        link.style.color = "var(--mist)";

        scrambleVisible(link, 0, {
          duration: 0.2,
          charDelay: 50,
          stagger: 25,
          maxIterations: 10,
        });

        setTimeout(() => {
          hovering = false;
        }, 250);
      };

      const onLeave = () => {
        link.style.color = link.dataset.originalColor || "";
      };

      link.addEventListener("mouseenter", onEnter);
      link.addEventListener("mouseleave", onLeave);

      hoverCleanups.current.push(() => {
        link.removeEventListener("mouseenter", onEnter);
        link.removeEventListener("mouseleave", onLeave);
      });
    });
  };

  const closeMenu = useCallback(
    (immediate = false) => {
      if (!isMenuOpen.current) return;

      const tl = hamburgerTl.current;
      const overlay = overlayRef.current;
      if (!tl || !overlay) return;

      isMenuOpen.current = false;
      lenis?.start();
      tl.reverse();
      removeHoverListeners();
      clearScrambleTimers();

      if (immediate) {
        overlay.style.transition = "none";
        overlay.style.opacity = "0";
        overlay.style.pointerEvents = "none";
        overlay.style.visibility = "hidden";
        revertText();
        return;
      }

      overlay.style.transition = "opacity 0.4s ease";
      overlay.style.opacity = "0";
    },
    [lenis]
  );

  const handleLinkClick = useCallback(
    (e, href) => {
      if (normalizePath(pathname) !== normalizePath(href)) return;
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      closeMenu();
    },
    [pathname, closeMenu]
  );

  useEffect(() => {
    closeMenu(true);
  }, [pathname, closeMenu]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const updateNavTopClass = () => {
      const scrollY = lenis?.scroll ?? window.scrollY;
      const threshold = window.innerHeight * 0.5;
      if (scrollY < threshold) {
        nav.classList.add("top");
      } else {
        nav.classList.remove("top");
      }
    };

    lenis?.on("scroll", updateNavTopClass);
    updateNavTopClass();

    const spans = nav.querySelectorAll(".nav-toggler-hamburger span");
    const tl = gsap.timeline({ paused: true });

    tl.to(
      spans[0],
      {
        y: "0.19rem",
        rotation: 45,
        width: "1.1rem",
        duration: 0.3,
        ease: "power2.inOut",
      },
      0
    ).to(
      spans[1],
      {
        y: "-0.19rem",
        rotation: -45,
        width: "1.1rem",
        duration: 0.3,
        ease: "power2.inOut",
      },
      0
    );

    hamburgerTl.current = tl;

    const overlay = overlayRef.current;
    const onTransitionEnd = (e) => {
      if (e.target !== overlay || e.propertyName !== "opacity") return;
      if (!isMenuOpen.current) {
        overlay.style.pointerEvents = "none";
        overlay.style.visibility = "hidden";
        revertText();
      }
    };
    overlay?.addEventListener("transitionend", onTransitionEnd);

    // invert nav colours while a light section sits under it
    const invertTriggers = gsap.utils
      .toArray("[data-nav-invert]")
      .map((section) =>
        ScrollTrigger.create({
          trigger: section,
          start: "top top+=56",
          end: "bottom top+=56",
          onToggle: ({ isActive }) =>
            nav.classList.toggle("nav-invert", isActive),
        })
      );

    return () => {
      lenis?.off("scroll", updateNavTopClass);
      tl.kill();
      removeHoverListeners();
      overlay?.removeEventListener("transitionend", onTransitionEnd);
      invertTriggers.forEach((t) => t.kill());
    };
  }, [lenis, pathname]);

  const handleToggle = () => {
    const tl = hamburgerTl.current;
    const overlay = overlayRef.current;
    if (!tl || !overlay) return;

    if (!isMenuOpen.current) {
      tl.play();
      revertText();

      overlay.style.visibility = "visible";
      overlay.style.pointerEvents = "all";
      overlay.style.transition = "none";
      overlay.style.opacity = "0";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.style.transition = "opacity 0.4s ease";
          overlay.style.opacity = "1";
        });
      });

      const navItems = overlay.querySelectorAll(".nav-item");
      navItems.forEach((item, index) => {
        const link = item.querySelector("a");
        if (link) {
          scrambleIn(link, index * 0.1, {
            duration: 0.15,
            charDelay: 50,
            stagger: 25,
            maxIterations: 5,
          });
        }
      });

      const footerItems = overlay.querySelectorAll(".nav-footer-item");
      let footerLinkIndex = 0;
      footerItems.forEach((footerItem) => {
        footerItem.querySelectorAll("a").forEach((link) => {
          scrambleIn(link, navItems.length * 0.1 + footerLinkIndex * 0.1, {
            duration: 0.15,
            charDelay: 50,
            stagger: 25,
            maxIterations: 5,
          });
          footerLinkIndex++;
        });
      });

      addHoverEffects();
      isMenuOpen.current = true;
      lenis?.stop();
    } else {
      closeMenu();
    }
  };

  return (
    <>
      <nav ref={navRef} className="site-nav top">
        <div className="nav-container">
          <div className="nav-logo">
            <Link href="/" onClickCapture={(e) => handleLinkClick(e, "/")}>
              <span className="nav-logo-studio">studio</span>
              <span className="nav-logo-name">morpheus.</span>
            </Link>
          </div>

          <div className="nav-mid">
            <Link href="/work" className="mono nav-inline">
              work
            </Link>
            <Link href="/studio" className="mono nav-inline">
              studio
            </Link>
          </div>

          <div className="nav-right">
            <Link
              href="/contact"
              className="btn nav-btn-cta"
              onClickCapture={(e) => handleLinkClick(e, "/contact")}
            >
              Let&apos;s talk
              <span className="btn-arrow">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="M4.5 11.5L11.5 4.5M11.5 4.5H6M11.5 4.5V10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.25"
                  />
                </svg>
              </span>
            </Link>
            <button type="button" className="nav-toggler" onClick={handleToggle}>
              <span className="mono">menu</span>
              <span className="nav-toggler-hamburger">
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>
      </nav>

      <div className="nav-overlay on-dark" ref={overlayRef}>
        <GridFrame tone="light" rules="none" />

        <div className="nav-overlay-inner">
          <p className="mono nav-overlay-label">[ index ]</p>

          <div className="nav-items">
            {NAV_LINKS.map(({ href, label }, i) => {
              const isActive =
                normalizePath(pathname) === normalizePath(href);
              return (
                <div
                  key={href}
                  className={`nav-item${isActive ? " active" : ""}`}
                >
                  <span className="mono nav-item-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Link
                    href={href}
                    onClickCapture={(e) => handleLinkClick(e, href)}
                  >
                    {label}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        <div className="nav-footer">
          <div className="nav-footer-container">
            <div className="nav-footer-item">
              <a
                className="mono"
                href="https://www.instagram.com/_studiomorpheus"
                target="_blank"
                rel="noreferrer"
              >
                instagram
              </a>
              <a
                className="mono"
                href="https://www.linkedin.com/company/morpheusofficial/"
                target="_blank"
                rel="noreferrer"
              >
                linkedin
              </a>
            </div>
            <div className="nav-footer-item">
              <a className="mono" href="mailto:sakshi@dreamwithmorpheus.com">
                sakshi@dreamwithmorpheus.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
