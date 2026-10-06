import "./new.css";
import { BOOT_SCRIPT } from "@/components/v2/Loader2/loaderGate";
import GridLines from "@/components/v2/GridLines/GridLines";

export const metadata = {
  title: "studio morpheus. — v2",
  description:
    "Second design direction for studio morpheus. Transforming ideas into impactful experiences.",
};

/* Isolated from the approved v1 design: its own tokens live in new.css,
   scoped under .v2 so nothing here can leak into the main site. */
export default function NewLayout({ children }) {
  return (
    <div className="v2">
      {/* one continuous light bloom behind every section */}
      <div className="v2-bloom" aria-hidden="true" />
      {/* brikken-style column lines — the quiet structure under everything */}
      <GridLines />
      {/* must run before the loader is painted and before any other
          script: it locks scrolling from the first frame (or, under
          reduced motion, hides the loader) — see loaderGate.js */}
      <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      {children}
      {/* one grain layer over the whole route — texture is the thread that
          ties every section into the same atmosphere, monolog-style */}
      <div className="v2-grain" aria-hidden="true" />
    </div>
  );
}
