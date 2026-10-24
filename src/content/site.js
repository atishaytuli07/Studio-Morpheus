/* Studio-wide details: contact, social profiles and the in-page sections
   the navigation points at. One place to change them; Sanity will replace
   this file later. */

export const EMAIL = "sakshi@dreamwithmorpheus.com";
export const MAILTO = `mailto:${EMAIL}`;

export const PHONE = { label: "+91 77779 18010", href: "tel:+917777918010" };

export const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/_studiomorpheus" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/morpheusofficial/" },
];

/* In-page for now: the Work, Studio, Services and Contact pages do not
   exist yet. Each points at the section that answers it; swap for routes
   when the pages are built. */
export const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Studio", href: "#what-we-do" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];
