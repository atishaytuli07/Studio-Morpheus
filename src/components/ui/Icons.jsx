/* Shared icons. */

const ARROW_PATH = "M4.5 11.5L11.5 4.5M11.5 4.5H6M11.5 4.5V10";

/* the up-right arrow */
export function ArrowIcon({ className, strokeWidth = 1.7, hidden = false }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden={hidden ? "true" : undefined}>
      <path d={ARROW_PATH} fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
    </svg>
  );
}

/* The chip arrow: two arrows in a small square. On hover the first leaves
   up-right as the second arrives from below-left (.arrow-swap in
   globals.css). */
export function ArrowSwap({ className = "arrow-swap" }) {
  return (
    <span className={className} aria-hidden="true">
      <ArrowIcon />
      <ArrowIcon />
    </span>
  );
}

/* the morpheus mark: four triangles meeting at the centre */
export function BrandMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M15 9 L49 9 L32 27 Z" />
      <path d="M15 55 L49 55 L32 37 Z" />
      <path d="M9 15 L9 49 L27 32 Z" />
      <path d="M55 15 L55 49 L37 32 Z" />
    </svg>
  );
}
