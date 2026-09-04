"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { useLenis } from "lenis/react";

import "./Preloader.css";

gsap.registerPlugin(SplitText, CustomEase);

let hopEase = null;

/* Module-level so React StrictMode's double-invocation in dev can't build a
   second SplitText + timeline over the same wordmark (two timelines fighting
   left the overlay stranded on screen). `started` means an intro is in flight;
   `done` means it already finished this session. */
let started = false;
let done = false;

export let isInitialLoad = true;

export default function Preloader({ onComplete }) {
  const preloaderRef = useRef(null);
  const lenis = useLenis();
  const lenisRef = useRef(null);

  // keep the ref current without writing it during render (React 19 rule);
  // the intro effect below runs once but must reach the live Lenis instance
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  // plain useEffect, not useGSAP: useGSAP reverts everything it created when
  // StrictMode tears the first pass down, which killed the intro mid-flight
  useEffect(() => {
    const el = preloaderRef.current;
    if (!el) return;

    const unlock = () => {
      document.documentElement.classList.remove("is-loading");
      lenisRef.current?.start();
    };

    const hideNow = () => {
      gsap.set(el, { display: "none", autoAlpha: 0 });
      isInitialLoad = false;
      unlock();
    };

    // already finished this session (client nav, fast refresh)
    if (done) {
      hideNow();
      return;
    }

    // an intro is already running from StrictMode's first pass — let it finish
    if (started) return;
    started = true;

    if (!hopEase) {
      hopEase = CustomEase.create("hop", "0.8, 0, 0.3, 1");
    }

    // reduced motion: skip the intro entirely
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      done = true;
      hideNow();
      onComplete?.();
      return;
    }

    // lenis.stop() alone doesn't hold on touch devices — lock the document
    // too, or the page scrolls under the preloader on mobile
    lenisRef.current?.stop();
    document.documentElement.classList.add("is-loading");

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      done = true;
      isInitialLoad = false;
      unlock();
      onComplete?.();
    };

    // hard backstop: the page is never left locked behind the overlay
    const failsafe = setTimeout(() => {
      if (settled) return;
      gsap.set(el, { display: "none" });
      finish();
    }, 9000);

    const wordmark = el.querySelector(".preloader-wordmark");
    const studio = el.querySelector(".preloader-studio");
    const progress = el.querySelector(".preloader-progress-bar");

    document.fonts.ready.then(() => {
      if (settled || !preloaderRef.current) return;

      const split = SplitText.create(wordmark, {
        type: "chars",
        mask: "chars",
        charsClass: "preloader-char",
      });

      const tl = gsap.timeline({
        onComplete: () => {
          clearTimeout(failsafe);
          finish();
        },
      });

      gsap.set(el, { autoAlpha: 1 });

      split.chars.forEach((char, i) => {
        gsap.set(char, { yPercent: i % 2 === 0 ? 120 : -120 });
      });

      tl.to(progress, { scaleX: 1, duration: 2.4, ease: "hop" })
        .to(
          split.chars,
          { yPercent: 0, duration: 1, ease: "hop", stagger: 0.045 },
          0.3
        )
        .to(studio, { opacity: 1, duration: 0.6, ease: "power2.out" }, 1.1)
        .to(
          [studio, wordmark],
          { yPercent: -140, duration: 0.9, ease: "hop", stagger: 0.06 },
          "+=0.45"
        )
        .to(
          el,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 1,
            ease: "hop",
          },
          "-=0.35"
        )
        .set(el, { display: "none" });
    });
  }, [onComplete]);

  return (
    <div className="preloader" ref={preloaderRef}>
      <div className="preloader-block">
        <p className="preloader-studio mono">studio</p>
        <h1 className="preloader-wordmark">morpheus.</h1>
      </div>
      <div className="preloader-progress">
        <div className="preloader-progress-bar" />
      </div>
    </div>
  );
}
