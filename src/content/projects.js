/* Selected work on the home page, in layout order: a pair, one full width,
   a pair (`full` takes the whole row).

   PLACEHOLDER FRAMING: the images are real morpheus work, but the client
   has not supplied project names yet, so each piece is titled by its
   discipline. Every source is 1100px wide; the full-width slot needs an
   original of 2600px or more to stay sharp. */
export const PROJECTS = [
  { title: "Branding", tags: "Identity, Packaging", src: "/work/work-4.jpg" },
  { title: "Design", tags: "Brand Guidelines, Print", src: "/work/work-guidelines.jpg" },
  { title: "Media Production", tags: "Photo, Film", src: "/work/work-8.jpg", full: true },
  { title: "Social Media", tags: "Content, Illustration", src: "/work/work-social.jpg" },
  { title: "Illustrations", tags: "Editorial, Print", src: "/work/work-illustration.jpg" },
];

/* the studio's picture beside the "what we do" words */
export const STUDIO_IMAGE = {
  src: "/work/work-2.jpg",
  alt: "An office interior designed by studio morpheus.",
};
