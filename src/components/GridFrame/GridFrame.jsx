"use client";

import "./GridFrame.css";

function Sparkle({ className }) {
  return (
    <svg
      className={`grid-sparkle ${className}`}
      viewBox="0 0 12 12"
      aria-hidden="true"
    >
      <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" />
    </svg>
  );
}

/**
 * Drafted page grid. Each section renders its own copy so the two vertical
 * rules chain into one continuous line down the whole page, while horizontal
 * rules + ✦ markers only appear at the boundaries that need them.
 *
 * tone   — "light" on dark sections, "dark" on parchment
 * rules  — which horizontal rules to draw: "top" | "bottom" | "both" | "none"
 */
export default function GridFrame({ tone = "light", rules = "none" }) {
  const showTop = rules === "top" || rules === "both";
  const showBottom = rules === "bottom" || rules === "both";

  return (
    <div className={`grid-frame grid-frame-${tone}`} aria-hidden="true">
      <span className="grid-v grid-v-left" />
      <span className="grid-v grid-v-right" />

      {showTop && (
        <>
          <span className="grid-h grid-h-top" />
          <Sparkle className="grid-sparkle-tl" />
          <Sparkle className="grid-sparkle-tr" />
        </>
      )}

      {showBottom && (
        <>
          <span className="grid-h grid-h-bottom" />
          <Sparkle className="grid-sparkle-bl" />
          <Sparkle className="grid-sparkle-br" />
        </>
      )}
    </div>
  );
}
