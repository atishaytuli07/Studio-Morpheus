import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll/SmoothScroll";
import GridLines from "@/components/layout/GridLines/GridLines";
import { BOOT_SCRIPT } from "@/lib/loaderGate";

export const metadata = {
  title: "studio morpheus.",
  description:
    "Just like the Greek god of dreams, we turn creative visions into reality. Branding, social media, media production, design and more by studio morpheus.",
  openGraph: {
    title: "studio morpheus.",
    description:
      "Transforming ideas into impactful experiences. The creative studio named after the Greek god of dreams.",
    siteName: "studio morpheus.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#002459",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SmoothScroll>
          <div className="site">
            {/* one continuous light bloom behind every section */}
            <div className="site-bloom" aria-hidden="true" />
            {/* the column lines: the quiet structure under everything */}
            <GridLines />
            {/* must run before the loader is painted and before any other
                script: it locks scrolling from the first frame (or, under
                reduced motion, hides the loader). See lib/loaderGate.js */}
            <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
            {children}
            {/* one grain layer over the whole site */}
            <div className="site-grain" aria-hidden="true" />
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}
