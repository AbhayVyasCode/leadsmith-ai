/** Site-wide metadata and navigation. Single source for header, footer and SEO. */

export const site = {
  name: "Leadsmith",
  url: "https://getleadsmith.ai",
  title: "Leadsmith — Leads, forged from evidence",
  description:
    "Describe who you sell to, or paste your product URL. Leadsmith's agents research the open web, score every company against your buyer profile with quotes from its own site, and hand you the right people with a first draft.",
  email: "Abhay@getleadsmith.ai",
} as const;

export type NavLink = { label: string; href: string };

export const siteNav: NavLink[] = [
  { label: "How it works", href: "/#how" },
  { label: "Features", href: "/#features" },
  { label: "Use cases", href: "/#use-cases" },
  { label: "FAQ", href: "/#faq" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  { title: "Product", links: siteNav },
  {
    title: "Workspace",
    links: [
      { label: "New search", href: "/app" },
      { label: "Runs", href: "/app/runs" },
      { label: "Memory", href: "/app/memory" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: `mailto:${site.email}` },
      { label: "Privacy", href: "/legal#privacy" },
      { label: "Terms", href: "/legal#terms" },
    ],
  },
];
