# studio morpheus.

Website for **studio morpheus.**, the creative studio named after the Greek god of dreams.

Built with Next.js 16 (App Router), React 19, GSAP and Lenis.

## Run locally

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm lint
```

## Structure

```
src/
  app/
    layout.js          root layout: fonts, smooth scroll, background layers, loader boot script
    page.js            the home page, section by section
    globals.css        fonts, base styles, design tokens, shared classes
  components/
    layout/            pieces around the content
      Nav/             glass nav: full bar at the top, pill on scroll, menu card
      Footer/
      Loader/          intro count and wordmark hand-off to the hero
      Cursor/          custom cursor (mouse and trackpad only)
      GridLines/       the column lines behind every section
      SmoothScroll/    Lenis, kept in step with GSAP ScrollTrigger
    sections/          the home page, top to bottom
      Hero/  WhatWeDo/  Showreel/  SelectedWork/  Services/  ClientLove/  Close/
    ui/                small shared pieces
      Button.jsx       the one button (light / dark), with the arrow swap
      SectionHeading.jsx  the numbered label + section title
      Icons.jsx        ArrowIcon, ArrowSwap, BrandMark
      ClientMarquee/   the running "trusted by" names
  content/             all copy and data, one place to edit (and later, Sanity)
    site.js            email, phone, socials, nav links
    copy.js            section text, the showreel file
    projects.js        selected work
    services.js        the nine services
    testimonials.js    quotes and client names
  lib/                 non-visual helpers
    loaderGate.js      loader / hero hand-off and the first-frame scroll lock
    parallax.js        image parallax on scroll
    wordmark.js        the wordmark as vector outlines (generated)
```

Each component keeps its CSS next to it (`Nav/Nav.jsx` + `Nav/Nav.css`).

## Design tokens

Defined once on `.site` in `globals.css`: colours (`--fg`, `--muted`, `--paper`, `--navy`, `--accent2` …), spacing (`--gutter`, `--section-y`, `--head-gap`), type (`--h-size`, `--t-sm` … `--t-xl`, `--label-size`) and radii. A section with `className="theme-paper"` switches to bone ground and navy ink without any change to its own CSS.

Shared classes, also in `globals.css`: `.label` (the mono section label), `.section-title`, `.button` / `.button--light` / `.button--dark` and `.arrow-swap`. A component's own CSS only adds its position and spacing on top.

## Content

Placeholder content still to be replaced before launch:

- `content/testimonials.js`: testimonials and client names are invented for review
- `content/projects.js`: project titles are disciplines, not real project names
- `content/copy.js`: the showreel is placeholder footage
- `public/services/`: service images are placeholders

## Scripts

- `node scripts/build-wordmark.mjs`: regenerate `src/lib/wordmark.js` from the font
- `node scripts/optimize-images.mjs`: resize and re-encode images dropped into `public/services` or `public/work`
