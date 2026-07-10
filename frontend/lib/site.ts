/**
 * Single source of truth for marketing-site metadata, navigation, and footer.
 * Consumed by the nav, footer, sitemap, and per-page metadata so the IA never drifts.
 */

export const siteConfig = {
  name: "Leadsmith AI",
  shortName: "Leadsmith",
  tagline: "Plain English to pipeline.",
  description:
    "Turn a plain-English ICP into ranked B2B leads. Leadsmith AI discovers companies, scores fit, reviews the evidence, enriches contacts, and drafts outreach with a live trace for every run.",
  url: "https://getleadsmith.ai",
  appUrl: "/app",
  email: "Abhay@getleadsmith.ai",
  social: {
    x: "https://x.com/getleadsmith",
    linkedin: "https://www.linkedin.com/company/getleadsmith",
    github: "https://github.com/getleadsmith",
  },
} as const;

export type NavItem = { label: string; href: string; description?: string };

export const mainNav: NavItem[] = [
  { label: "Product", href: "/product" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Use cases", href: "/use-cases" },
  { label: "Blog", href: "/blog" },
];

export const productMenu: {
  capabilities: NavItem[];
  resources: NavItem[];
} = {
  capabilities: [
    { label: "Discovery", href: "/product#discovery", description: "Find real companies across the open web" },
    { label: "Qualifying & scoring", href: "/product#qualify", description: "Score every lead 0-100 across six dimensions" },
    { label: "Evidence & critic", href: "/product#evidence", description: "Challenge weak matches before they reach your list" },
    { label: "Enrichment", href: "/product#enrich", description: "Find the right person with honest email confidence" },
    { label: "Outreach drafting", href: "/product#outreach", description: "Draft a first message from the evidence" },
    { label: "Live agent trace", href: "/product#trace", description: "Watch every agent step as it happens" },
  ],
  resources: [
    { label: "How it works", href: "/how-it-works", description: "The pipeline, step by step" },
    { label: "Use cases", href: "/use-cases", description: "Built for how teams prospect" },
    { label: "FAQ", href: "/faq", description: "Questions, answered" },
  ],
};

export const footerNav: { title: string; links: NavItem[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/product" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Use cases", href: "/use-cases" },
      { label: "Open the app", href: "/app" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Use cases", href: "/use-cases" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export const marketingRoutes = [
  "/",
  "/product",
  "/how-it-works",
  "/use-cases",
  "/about",
  "/blog",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
] as const;
