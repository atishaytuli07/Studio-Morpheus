"use client";

import { useState } from "react";

import { CLIENTS } from "@/content/testimonials";
import "./ClientMarquee.css";

/* The names the studio has worked with, running right to left at the foot
   of "What we do"'s words column: having said what it does, the section
   ends on who it has done it for. (It used to close "Client love", under a
   row of figures; the figures went, and the names moved here.)

   An endless run: the list four times end to end, slid by exactly half
   (two lists) and repeated, so the seam never shows. Four, not two: one
   list is narrower than the window on a wide screen, and two would run out
   before the loop restarts. The copies are for the eye only.

   Anything that moves for more than five seconds needs a way to stop it
   (WCAG 2.2.2). It stops while a pointer rests on it, while it has keyboard
   focus, and a tap toggles it — no extra control on the page. */
export default function ClientMarquee() {
  const [paused, setPaused] = useState(false);
  return (
    <div className="cl2">
      <p className="label cl2-label">[ trusted by ]</p>
      <div
        className={`cl2-marquee${paused ? " is-paused" : ""}`}
        role="group"
        tabIndex={0}
        aria-label="Clients. Focus or tap to stop the list moving"
        onClick={() => setPaused((p) => !p)}
      >
        <div className="cl2-track">
          {[0, 1, 2, 3].map((copy) => (
            <ul
              className="cl2-names"
              key={copy}
              aria-hidden={copy > 0 ? "true" : undefined}
            >
              {CLIENTS.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
