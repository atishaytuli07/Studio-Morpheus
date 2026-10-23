"use client";

import { useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Lenis moves the page inside its own animation frame; ScrollTrigger heard
   about it only from the native scroll event, which the browser delivers in
   the NEXT frame. Every scrubbed thing — the service cards, the reel's
   window, the statement's fill, the close — trailed the page by a frame,
   and that one-frame lag reads as a wobble. Telling ScrollTrigger in the
   same frame Lenis scrolls keeps them locked to the page. */
export default function ScrollSync() {
  useLenis(ScrollTrigger.update);
  return null;
}
