/**
 * Blog metadata — single source of truth for the index, article routes, and sitemap.
 * Article bodies are rendered in app/(marketing)/blog/[slug] from the matching
 * `content/posts.tsx` entry. Keep slugs in sync.
 */

export type PostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Product" | "Playbooks" | "Engineering" | "Company";
  date: string; // ISO
  readingTime: string;
  author: { name: string; role: string };
  featured?: boolean;
};

const TEAM = { name: "The Leadsmith AI team", role: "Building Leadsmith AI" };

export const posts: PostMeta[] = [
  {
    slug: "team-of-agents-not-one-prompt",
    title: "Why we built lead discovery as a team of agents, not one prompt",
    excerpt:
      "A single mega-prompt can sound confident and still be wrong. Here's why we split discovery, qualifying, criticism, and outreach into specialized agents — and what that buys you.",
    category: "Engineering",
    date: "2026-05-20",
    readingTime: "7 min read",
    author: TEAM,
    featured: true,
  },
  {
    slug: "plain-english-beats-boolean-icp",
    title: "Plain English beats boolean: a better way to define your ICP",
    excerpt:
      "Boolean filters force you to know the answer before you ask the question. Describing your ideal customer in a sentence is faster, clearer, and surprisingly more precise.",
    category: "Playbooks",
    date: "2026-05-12",
    readingTime: "6 min read",
    author: TEAM,
  },
  {
    slug: "demand-the-evidence-behind-lead-scores",
    title: "Stop trusting black-box lead scores. Demand the evidence.",
    excerpt:
      "A number from 0–100 means nothing if you can't see why. We show the evidence, the confidence, and the critic's verdict behind every score — and you should expect that from any tool.",
    category: "Playbooks",
    date: "2026-04-28",
    readingTime: "5 min read",
    author: TEAM,
  },
  {
    slug: "how-the-critic-agent-kills-bad-leads",
    title: "How the critic agent kills bad leads before they reach you",
    excerpt:
      "Most tools optimize for volume. We added an adversarial critic whose only job is to argue against weak matches — so the leads you see are the ones that survived scrutiny.",
    category: "Product",
    date: "2026-04-15",
    readingTime: "6 min read",
    author: TEAM,
  },
  {
    slug: "cold-outreach-from-real-evidence",
    title: "Cold outreach that doesn't feel cold: drafting from real evidence",
    excerpt:
      "Personalization at scale fails when the 'personal' part is fake. Drafting from the same evidence that qualified the lead makes a first message that's actually worth reading.",
    category: "Playbooks",
    date: "2026-03-30",
    readingTime: "5 min read",
    author: TEAM,
  },
];

export function getAllPosts(): PostMeta[] {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getFeaturedPost(): PostMeta {
  return getAllPosts().find((p) => p.featured) ?? getAllPosts()[0];
}

export function getPostBySlug(slug: string): PostMeta | undefined {
  return posts.find((p) => p.slug === slug);
}

export const blogCategories = ["All", "Product", "Playbooks", "Engineering", "Company"] as const;
