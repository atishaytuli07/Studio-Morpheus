"use client";

import { useEffect, useState } from "react";
import { ReactLenis } from "lenis/react";
import Nav from "@/components/Nav/Nav";

const MOBILE_BREAKPOINT = 1000;

const LENIS_EASING = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

const LENIS_SHARED = {
  easing: LENIS_EASING,
  orientation: "vertical",
  smoothWheel: true,
  syncTouch: true,
  infinite: false,
  wheelMultiplier: 1,
};

const LENIS_MOBILE = {
  ...LENIS_SHARED,
  duration: 0.8,
  touchMultiplier: 1.5,
  lerp: 0.09,
};

const LENIS_DESKTOP = {
  ...LENIS_SHARED,
  duration: 1.2,
  touchMultiplier: 2,
  lerp: 0.1,
};

export default function ClientLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () =>
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ReactLenis root options={isMobile ? LENIS_MOBILE : LENIS_DESKTOP}>
      <div className="grain" aria-hidden="true" />
      <Nav />
      <div className="page">{children}</div>
    </ReactLenis>
  );
}
