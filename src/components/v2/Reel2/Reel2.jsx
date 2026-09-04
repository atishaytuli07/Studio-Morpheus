"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./Reel2.css";

gsap.registerPlugin(ScrollTrigger);

/* Served from our own /public, not hotlinked — a client site must not depend
   on a third-party file host at load time. Source is 1600x1200 (4:3) h264;
   this is a 1280-wide CRF27 re-encode with faststart: 13.7MB -> 6.3MB.
   It never touches first paint: preload="none" until the section is near. */
const REEL_SRC = "/reel/reel-web.mp4";
const POSTER = "/reel/poster.jpg";

export default function Reel2() {
  const sectionRef = useRef(null);
  const frameRef = useRef(null);
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!section || !frame) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || window.innerWidth < 1000) {
      section.classList.add("is-static");
      return;
    }

    const ctx = gsap.context(() => {
      /* polite-chaos' Showreel: the frame grows from 0.75 to full-bleed while
         the section is pinned. Held to 1.0 viewport, not their 2 — the
         page has a length budget. Square-cornered, to match the chips. */
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * 1.0}px`,
        pin: true,
        pinSpacing: true,
        // earliest pin on the page must refresh first
        refreshPriority: 3,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(frame, {
            scale: gsap.utils.mapRange(0, 1, 0.76, 1, p),
            borderRadius: `${gsap.utils.mapRange(0, 0.5, 6, 0, Math.min(p, 0.5))}px`,
          });
        },
      });
    }, section);

    return () => ctx.revert();
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
    <section className="r2 v2-invert" ref={sectionRef}>
      <div className="r2-head">
        <p>
          <span aria-hidden="true">↳</span> play reel
        </p>
        <p>{REEL_SRC ? "00:34" : "footage pending"}</p>
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
          aria-pressed={!muted}
          aria-label={muted ? "Unmute reel" : "Mute reel"}
        >
          {muted ? "sound on" : "sound off"}
        </button>
      )}
    </section>
  );
}
