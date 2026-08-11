"use client";

import Link from "next/link";
import GridFrame from "@/components/GridFrame/GridFrame";

import "./Footer.css";

const COLUMNS = [
  {
    title: "studio",
    items: [
      { label: "work", href: "/work" },
      { label: "about", href: "/studio" },
      { label: "contact", href: "/contact" },
    ],
  },
  {
    title: "services",
    items: [
      { label: "branding" },
      { label: "media production" },
      { label: "web & digital" },
    ],
  },
  {
    title: "connect",
    items: [
      {
        label: "instagram",
        href: "https://www.instagram.com/_studiomorpheus",
        external: true,
      },
      {
        label: "linkedin",
        href: "https://www.linkedin.com/company/morpheusofficial/",
        external: true,
      },
      {
        label: "sakshi@dreamwithmorpheus.com",
        href: "mailto:sakshi@dreamwithmorpheus.com",
      },
      { label: "+91 77779 18010", href: "tel:+917777918010" },
    ],
  },
];

/* the brand mark: four triangles converging on a point */
function Mark() {
  return (
    <svg className="footer-logo" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M15 9 L49 9 L32 27 Z" />
      <path d="M15 55 L49 55 L32 37 Z" />
      <path d="M9 15 L9 49 L27 32 Z" />
      <path d="M55 15 L55 49 L37 32 Z" />
    </svg>
  );
}

function Sparkle({ className }) {
  return (
    <svg className={`footer-spark ${className}`} viewBox="0 0 12 12" aria-hidden="true">
      <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="footer on-dark">
      <GridFrame tone="light" rules="none" />

      <div className="footer-main">
        <div className="footer-top">
          <div className="footer-brand">
            <Mark />
            <p className="mono footer-tagline">
              transforming ideas into
              <br />
              impactful experiences
            </p>
          </div>

          <div className="footer-cols">
            {COLUMNS.map((col) => (
              <div className="footer-col" key={col.title}>
                <p className="footer-col-title">{col.title}</p>
                {col.items.map((item) =>
                  item.href ? (
                    item.external ? (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link key={item.label} href={item.href}>
                        {item.label}
                      </Link>
                    )
                  ) : (
                    <span key={item.label}>{item.label}</span>
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="footer-legal">
          <Sparkle className="footer-spark-l" />
          <Sparkle className="footer-spark-r" />
          <p className="mono">© {new Date().getFullYear()} studio morpheus.</p>
          <p className="mono">{"//"}</p>
          <p className="mono">the greek god of dreams</p>
        </div>
      </div>

      {/* giant wordmark, cropped by the bottom edge of the page */}
      <div className="footer-marquee" aria-hidden="true">
        <div className="footer-marquee-track">
          {Array.from({ length: 4 }).map((_, i) => (
            <span className="footer-marquee-item" key={i}>
              <span className="footer-marquee-studio">studio</span>
              <span className="footer-marquee-name">morpheus.</span>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
