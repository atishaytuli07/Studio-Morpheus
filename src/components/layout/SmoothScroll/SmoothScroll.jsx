"use client";

import { useEffect, useState } from "react";
import { ReactLenis } from "lenis/react";

import ScrollSync from "./ScrollSync";

const MOBILE_BREAKPOINT = 1000;

const EASING = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

const SHARED = {
  easing: EASING,
  orientation: "vertical",
  smoothWheel: true,
  syncTouch: true,
  infinite: false,
  wheelMultiplier: 1,
};

const MOBILE = { ...SHARED, duration: 0.8, touchMultiplier: 1.5, lerp: 0.09 };
const DESKTOP = { ...SHARED, duration: 1.2, touchMultiplier: 2, lerp: 0.1 };

/* Lenis smooth scrolling for the whole site, with a lighter feel on
   phones and tablets, and ScrollTrigger kept in step with it. */
export default function SmoothScroll({ children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <ReactLenis root options={isMobile ? MOBILE : DESKTOP}>
      <ScrollSync />
      {children}
    </ReactLenis>
  );
}
