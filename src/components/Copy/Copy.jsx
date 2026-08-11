"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import "./Copy.css";

gsap.registerPlugin(SplitText, ScrollTrigger);

const FONT_FAMILIES = ["pangram-sans", "geist-mono"];

export default function Copy({
  children,
  variant = "rotate",
  splitType = "chars",
  animateOnScroll = true,
  delay = 0,
}) {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      let elements = [];
      if (containerRef.current.hasAttribute("data-copy-wrapper")) {
        elements = Array.from(containerRef.current.children);
      } else {
        elements = [containerRef.current];
      }

      const splits = [];
      const triggers = [];
      let cancelled = false;

      const fontsReady = Promise.all([
        document.fonts.ready,
        ...FONT_FAMILIES.map((f) => document.fonts.load(`1rem ${f}`)),
      ]);

      gsap.set(elements, { visibility: "hidden" });

      fontsReady.then(() => {
        if (cancelled || !containerRef.current) return;
        gsap.set(elements, { visibility: "visible" });

        // reduced motion: show text immediately, no splitting or reveals
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          return;
        }

        if (variant === "rotate") {
          const allTargets = [];

          elements.forEach((element) => {
            if (splitType === "lines") {
              const split = SplitText.create(element, {
                type: "lines",
                linesClass: "copy-line",
              });
              splits.push(split);
              allTargets.push(...split.lines);
            } else if (splitType === "words") {
              const split = SplitText.create(element, {
                type: "words",
                wordsClass: "copy-word",
              });
              splits.push(split);
              allTargets.push(...split.words);
            } else {
              const split = SplitText.create(element, {
                type: "words,chars",
                wordsClass: "copy-word",
                charsClass: "copy-char",
              });
              splits.push(split);
              split.words.forEach((word) => {
                allTargets.push(...word.querySelectorAll(".copy-char"));
              });
            }
          });

          gsap.set(elements, {
            perspective: 700,
            transformStyle: "preserve-3d",
          });

          gsap.set(allTargets, {
            opacity: 0,
            rotationX: -90,
            transformOrigin: "50% 50% -50px",
          });

          const playRotateReveal = () => {
            const tl = gsap.timeline();

            if (splitType === "lines") {
              tl.to(allTargets, {
                delay,
                rotationX: 0,
                opacity: 1,
                duration: 0.75,
                ease: "power3.out",
                stagger: 0.05,
              });
            } else if (splitType === "words") {
              tl.to(allTargets, {
                delay,
                rotationX: 0,
                opacity: 1,
                duration: 0.75,
                ease: "power3.out",
                stagger: { each: 0.035, from: "random" },
              });
            } else {
              splits.forEach((split) => {
                split.words.forEach((word) => {
                  const chars = [...word.querySelectorAll(".copy-char")];
                  const wordTl = gsap.timeline().to(chars, {
                    rotationX: 0,
                    opacity: 1,
                    duration: 0.75,
                    ease: "power3.out",
                    stagger: { each: 0.035, from: "random" },
                  });
                  tl.add(wordTl, delay + Math.random() * 0.4);
                });
              });
            }

            return tl;
          };

          if (animateOnScroll) {
            triggers.push(
              ScrollTrigger.create({
                trigger: containerRef.current,
                start: "top 90%",
                once: true,
                onEnter: () => playRotateReveal(),
              })
            );
          } else {
            playRotateReveal();
          }
        }

        if (variant === "flicker") {
          const allChars = [];

          elements.forEach((element) => {
            const split = SplitText.create(element, {
              type: "chars",
              charsClass: "copy-char",
            });
            splits.push(split);
            allChars.push(...split.chars);
          });

          gsap.set(allChars, { opacity: 0 });

          const flickerAnimation = gsap.to(allChars, {
            delay,
            duration: 0.05,
            opacity: 1,
            ease: "power2.inOut",
            stagger: { amount: 0.5, each: 0.1, from: "random" },
            paused: animateOnScroll,
          });

          if (animateOnScroll) {
            triggers.push(
              ScrollTrigger.create({
                trigger: containerRef.current,
                start: "top 85%",
                once: true,
                onEnter: () => flickerAnimation.play(),
              })
            );
          } else {
            flickerAnimation.play();
          }
        }

        if (variant === "mask") {
          const allLines = [];

          elements.forEach((element) => {
            const split = SplitText.create(element, {
              type: "lines",
              mask: "lines",
              linesClass: "copy-line",
            });
            splits.push(split);
            allLines.push(...split.lines);
          });

          gsap.set(allLines, { yPercent: 110 });

          const maskAnimation = gsap.to(allLines, {
            delay,
            yPercent: 0,
            duration: 0.9,
            ease: "power4.out",
            stagger: 0.1,
            paused: animateOnScroll,
          });

          if (animateOnScroll) {
            triggers.push(
              ScrollTrigger.create({
                trigger: containerRef.current,
                start: "top 90%",
                once: true,
                onEnter: () => maskAnimation.play(),
              })
            );
          } else {
            maskAnimation.play();
          }
        }

        if (variant === "slide") {
          gsap.set(elements, { y: 50, opacity: 0 });

          const slideAnimation = gsap.to(elements, {
            delay,
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power3.out",
            stagger: 0.1,
            paused: animateOnScroll,
          });

          if (animateOnScroll) {
            triggers.push(
              ScrollTrigger.create({
                trigger: containerRef.current,
                start: "top 90%",
                once: true,
                onEnter: () => slideAnimation.play(),
              })
            );
          } else {
            slideAnimation.play();
          }
        }
      });

      return () => {
        cancelled = true;
        triggers.forEach((t) => t.kill());
        splits.forEach((split) => split.revert());
      };
    },
    {
      scope: containerRef,
      dependencies: [variant, splitType, animateOnScroll, delay],
    }
  );

  if (React.Children.count(children) === 1) {
    return React.cloneElement(children, { ref: containerRef });
  }

  return (
    <div ref={containerRef} data-copy-wrapper="true">
      {children}
    </div>
  );
}
