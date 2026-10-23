"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { REEL } from "@/content/copy";
import "./Showreel.css";

const REEL_SRC = REEL.src;
const POSTER = REEL.poster;

gsap.registerPlugin(ScrollTrigger);

export default function Showreel() {
  const sectionRef = useRef(null);
  const frameRef = useRef(null);
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!section || !frame) return;

    /* The hold is for wide screens with motion allowed, re-decided when the
       window crosses 1000px. The layout for each case is CSS's (media
       queries in Showreel.css), so it is right from the first paint; this only
       drives the frame's opening.

       Held with position: sticky, not a ScrollTrigger pin. Pinning switches
       the section to position: fixed and back, and Chrome counted each
       switch as a full-screen layout shift (CLS ~1 a time, nothing visibly
       moving) — a "poor" Core Web Vitals score from two pins. Sticky
       never shifts. */
    const mm = gsap.matchMedia(section);
    mm.add("(min-width: 1000px) and (prefers-reduced-motion: no-preference)", () => {
      /* The window's insets, read once per refresh. The progress is then
         written straight onto the two things that move — the frame's clip
         and the label's fade — not as a --p variable on the section, which
         every element inside inherited and re-styled on every frame. */
      const head = section.querySelector(".r2-head");
      let box = null;
      const measure = () => {
        const cs = getComputedStyle(section);
        const px = (v) => parseFloat(v) || 0;
        const probe = (name) => {
          const el = document.createElement("div");
          el.style.cssText = `position:absolute;visibility:hidden;width:var(${name})`;
          section.appendChild(el);
          const w = el.getBoundingClientRect().width;
          el.remove();
          return w;
        };
        box = {
          top: probe("--r2-top"),
          bottom: probe("--r2-bottom"),
          side: probe("--gutter"),
          radius: px(cs.getPropertyValue("--radius")) || 8,
        };
      };
      const paint = (p) => {
        if (!box) measure();
        const o = 1 - p;
        frame.style.clipPath = `inset(${(box.top * o).toFixed(1)}px ${(box.side * o).toFixed(1)}px ${(box.bottom * o).toFixed(1)}px ${(box.side * o).toFixed(1)}px round ${(box.radius * o).toFixed(1)}px)`;
        if (head) head.style.opacity = Math.max(0, 1 - p * 3).toFixed(3);
      };

      /* polite-chaos' Showreel: the frame grows from 0.75 to full-bleed while
         the section is pinned. Held to 1.0 viewport, not their 2 — the
         page has a length budget. Square-cornered, to match the chips. */
      ScrollTrigger.create({
        trigger: section,
        // the section is 1.7 screens tall; its stage holds for the extra 0.7
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          measure();
          paint(self.progress);
        },
        onUpdate: (self) => paint(self.progress),
      });
      return () => {
        frame.style.clipPath = "";
        if (head) head.style.opacity = "";
      };
    });

    return () => mm.revert();
  }, []);

  /* Playback is deliberately separate from the pin above: the pin is a
     desktop-only flourish, but the video must behave everywhere.
     preload="none" means nothing is fetched until the section is near, so
     6.3MB never competes with first paint. */
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    // reduced motion: never autoplay a looping video — hand over the controls
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.controls = true;
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.preload !== "auto") video.preload = "auto";
          video.play().catch(() => {
            /* autoplay refused (e.g. unmuted by the user) — poster stands */
          });
        } else {
          video.pause();
        }
      },
      // start fetching a little before it arrives, so it is running on entry
      { rootMargin: "300px 0px", threshold: 0.01 }
    );
    io.observe(section);

    return () => {
      io.disconnect();
      video.pause();
    };
  }, []);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted && v.paused) v.play().catch(() => {});
  };

  return (
    <section className="r2 theme-paper" ref={sectionRef}>
      <div className="r2-stage">
        <div className="r2-head">
          <p className="label">[ 02 · showreel ]</p>
          <p className="label">{REEL_SRC ? REEL.duration : "footage pending"}</p>
        </div>

        <div className="r2-frame" ref={frameRef}>
          {REEL_SRC ? (
            <video
              ref={videoRef}
              src={REEL_SRC}
              poster={POSTER}
              muted
              loop
              playsInline
              preload="none"
            />
          ) : (
            <div className="r2-poster">
              <img src={POSTER} alt="" />
              <p className="r2-poster-note">
                reel · awaiting footage from the studio
              </p>
            </div>
          )}
        </div>

        {REEL_SRC && (
          <button
            type="button"
            className="r2-mute"
            onClick={toggleMute}
          >
            {/* the visible words are the name (WCAG 2.5.3): what it says is
                what it does, so no separate label or pressed state */}
            {muted ? "sound on" : "sound off"}
          </button>
        )}
      </div>
    </section>
  );
}
