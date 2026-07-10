import type {
  ICP,
  Lead,
  ProductProfile,
  RunMetrics,
  TraceNode,
  DimensionScore,
} from "@/lib/types";

/** Example requests surfaced as chips under the search field. */
export const EXAMPLE_QUERIES = [
  "mid-sized e-commerce brands with weak SEO",
  "B2B SaaS startups in Europe hiring marketers",
  "digital marketing agencies in India with outdated websites",
  "Series A fintechs in the US without a security page",
];

/** Demo product surfaced when the request is a URL (product/reverse-ICP mode). */
export const MOCK_PRODUCT: ProductProfile = {
  product_name: "Rustbox",
  what_it_does:
    "A cloud API that runs untrusted code in kernel-isolated sandboxes and returns a structured verdict with syscall-level evidence — an online-judge / code-execution backend other products embed.",
  category: "Secure code-execution sandbox API",
  key_features: [
    "Kernel isolation (namespaces, seccomp-BPF, cgroups v2)",
    "Judge mode for grading + Agent mode for LLM tool-calling",
    "~36ms median latency, 8 languages",
    "Structured verdicts with syscall evidence",
  ],
  pricing_motion: "self-serve",
  customer_segments: [
    "Competitive-programming & online-judge platforms",
    "Technical-hiring / coding-assessment tools",
    "AI-agent & LLM code-interpreter products",
    "Coding ed-tech & bootcamps",
  ],
  target_customers_description:
    "Engineering-led B2B SaaS that must execute end-user- or LLM-generated untrusted code safely and would rather buy a hardened runtime than build kernel isolation.",
  evidence_quotes: [
    "execute untrusted code with kernel-level isolation",
    "structured verdict with syscall-level evidence",
  ],
};

export const MOCK_ICP: ICP = {
  industry: "Direct-to-consumer e-commerce",
  company_size: "Mid-sized (20–200 employees)",
  geography: "United States",
  pain_points: [
    "Thin organic search presence",
    "Slow, unoptimized storefront",
    "Low content velocity",
  ],
  buying_signals: [
    "Recently hired a growth or SEO lead",
    "Migrated to a modern storefront platform",
    "Running paid acquisition with weak organic backstop",
  ],
  decision_maker_roles: ["Head of Growth", "VP Marketing", "Founder"],
  keywords: ["Shopify", "DTC", "organic growth", "content marketing"],
};

function dims(values: [number, number][]): DimensionScore[] {
  const keys = ["industry_fit", "size_fit", "pain_severity", "buying_intent"] as const;
  const evidence: Record<string, string> = {
    industry_fit: "Storefront, product catalog, and checkout flow indicate a DTC e-commerce brand.",
    size_fit: "Careers page lists ~40 roles; footer cites multiple fulfillment regions.",
    pain_severity: "Homepage copy is thin, no blog in 8 months, Lighthouse SEO flags missing meta.",
    buying_intent: "New 'Head of Growth' role posted; tech headers show a recent Shopify Plus move.",
  };
  return keys.map((k, i) => ({
    dimension: k,
    score: values[i][0],
    confidence: values[i][1],
    evidence: evidence[k],
  }));
}

export const MOCK_LEADS: Lead[] = [
  {
    company: {
      name: "Northwind Goods",
      website: "northwindgoods.com",
      reason: "DTC home brand with strong paid presence but almost no organic footprint.",
    },
    qualification: {
      dimensions: dims([
        [88, 0.95],
        [74, 0.8],
        [91, 0.9],
        [82, 0.85],
      ]),
      matched_pain_points: ["Thin organic search presence", "Low content velocity"],
      signals: ["Hiring Head of Growth", "Shopify Plus headers", "No blog since Q3"],
      outreach_angle:
        "They just posted a Head of Growth role while running heavy paid — an organic backstop is the obvious next lever.",
      reasoning:
        "Clear DTC fit, mid-size, and acute organic gap with an active growth hire. High-confidence across the board.",
    },
    overall_score: 86,
    confidence: 0.88,
    contacts: [
      {
        name: "Maya Chen",
        role: "Head of Growth",
        email: "maya.chen@northwindgoods.com",
        email_confidence: "guessed",
        linkedin: null,
        twitter: null,
        source: "web search",
      },
    ],
    outreach: {
      subject: "An organic backstop for Northwind's paid engine",
      body: "Hi Maya,\n\nCongrats on the Head of Growth role — saw Northwind is leaning hard into paid. The gap I noticed: no blog since Q3 and missing meta on key category pages, so none of that demand is compounding organically.\n\nWe help DTC teams turn paid learnings into an organic moat in ~90 days. Worth a 15-minute look?\n\n— Alex",
      channel: "email",
    },
    critique: { verdict: "accept", grounded: true, confidence_penalty: 0, issues: [], missing_evidence: [] },
    flags: [],
    links: [],
    recalled_context: [
      "Brightleaf Supply (brightleaf.co) — score 81. Matched pains: thin organic; Signals: hired SEO lead. Angle: paid-to-organic.",
    ],
  },
  {
    company: {
      name: "Harbor & Hide",
      website: "harborandhide.com",
      reason: "Premium leather DTC brand; beautiful site, almost no indexed content.",
    },
    qualification: {
      dimensions: dims([
        [84, 0.9],
        [68, 0.7],
        [86, 0.85],
        [70, 0.65],
      ]),
      matched_pain_points: ["Thin organic search presence", "Slow, unoptimized storefront"],
      signals: ["Large image payloads", "Recent rebrand", "No category content"],
      outreach_angle:
        "Their rebrand looks gorgeous but ships 4MB hero images — speed + content are leaving qualified traffic on the table.",
      reasoning: "Strong industry and pain fit; buying intent is inferred from the rebrand rather than a hire.",
    },
    overall_score: 79,
    confidence: 0.78,
    contacts: [
      {
        name: "Daniel Roe",
        role: "Founder",
        email: "daniel@harborandhide.com",
        email_confidence: "found",
        linkedin: null,
        twitter: null,
        source: "company website",
      },
    ],
    outreach: {
      subject: "Harbor & Hide's rebrand vs. its load time",
      body: "Hi Daniel,\n\nThe new brand is stunning — but the hero images are ~4MB and the category pages aren't indexed, so the rebrand isn't pulling its weight in search yet.\n\nWe fix exactly this for premium DTC brands. 15 minutes to show you the before/after?\n\n— Alex",
      channel: "email",
    },
    critique: {
      verdict: "weak",
      grounded: true,
      confidence_penalty: 0.12,
      issues: ["Buying intent is inferred from a rebrand, not a direct signal."],
      missing_evidence: ["No active growth/SEO hire found."],
    },
    flags: ["weak-evidence"],
    links: [],
    recalled_context: [],
  },
  {
    company: {
      name: "Cedar Lane Pantry",
      website: "cedarlanepantry.com",
      reason: "Specialty food DTC; strong social, weak owned search.",
    },
    qualification: {
      dimensions: dims([
        [80, 0.85],
        [72, 0.75],
        [78, 0.7],
        [66, 0.6],
      ]),
      matched_pain_points: ["Low content velocity"],
      signals: ["Active on social", "Sparse meta descriptions"],
      outreach_angle:
        "Huge social engagement that dead-ends — none of it is captured by search-friendly content.",
      reasoning: "Good fit; pain is real but moderately evidenced. Buying intent is the softest dimension.",
    },
    overall_score: 73,
    confidence: 0.72,
    contacts: [
      {
        name: "Priya Nair",
        role: "VP Marketing",
        email: null,
        email_confidence: "unknown",
        linkedin: null,
        twitter: null,
        source: "company website",
      },
    ],
    outreach: {
      subject: "Turning Cedar Lane's social into search",
      body: "Hi Priya,\n\nCedar Lane's social numbers are great — but that demand isn't being captured in search, where the meta is sparse and recipes aren't indexed.\n\nWe help food DTC brands convert social momentum into compounding organic traffic. Open to a quick call?\n\n— Alex",
      channel: "email",
    },
    critique: { verdict: "accept", grounded: true, confidence_penalty: 0.05, issues: [], missing_evidence: [] },
    flags: [],
    links: [],
    recalled_context: [],
  },
  {
    company: {
      name: "Vellum Paper Co.",
      website: "vellumpaper.com",
      reason: "Stationery DTC; older storefront, clear technical SEO debt.",
    },
    qualification: {
      dimensions: dims([
        [76, 0.8],
        [64, 0.65],
        [82, 0.8],
        [58, 0.55],
      ]),
      matched_pain_points: ["Slow, unoptimized storefront", "Thin organic search presence"],
      signals: ["Legacy platform headers", "Duplicate title tags"],
      outreach_angle:
        "Their catalog is broad but riddled with duplicate titles — a quick technical pass would unlock a lot of latent traffic.",
      reasoning: "Solid pain fit on technical debt; size and intent are more modest.",
    },
    overall_score: 70,
    confidence: 0.69,
    contacts: [
      {
        name: "Tom Ackerly",
        role: "Founder",
        email: "tom.ackerly@vellumpaper.com",
        email_confidence: "guessed",
        linkedin: null,
        twitter: null,
        source: "web search",
      },
    ],
    outreach: {
      subject: "Duplicate titles are capping Vellum's catalog",
      body: "Hi Tom,\n\nVellum's catalog is broad, but a lot of product pages share duplicate title tags, so they compete with each other in search.\n\nA focused technical pass usually unlocks meaningful traffic fast. Worth 15 minutes?\n\n— Alex",
      channel: "email",
    },
    critique: { verdict: "accept", grounded: true, confidence_penalty: 0.08, issues: [], missing_evidence: [] },
    flags: [],
    links: [],
    recalled_context: [],
  },
  {
    company: {
      name: "Tideline Surf",
      website: "tidelinesurf.com",
      reason: "Surf apparel DTC; mostly inferred fit, thin public evidence.",
    },
    qualification: {
      dimensions: dims([
        [62, 0.55],
        [58, 0.5],
        [60, 0.45],
        [54, 0.4],
      ]),
      matched_pain_points: ["Thin organic search presence"],
      signals: ["Limited site copy"],
      outreach_angle: "Small but growing apparel brand with little indexed content yet.",
      reasoning: "Borderline — evidence is thin across dimensions, confidence is low.",
    },
    overall_score: 58,
    confidence: 0.48,
    contacts: [],
    outreach: null,
    critique: {
      verdict: "weak",
      grounded: false,
      confidence_penalty: 0.2,
      issues: ["Most scores are inferred from a sparse site with little hard evidence."],
      missing_evidence: ["No named decision-maker", "No clear buying signal"],
    },
    flags: ["weak-evidence"],
    links: [],
    recalled_context: [],
  },
  {
    company: {
      name: "Glasshouse Botanicals",
      website: "glasshousebotanicals.com",
      reason: "Plant-care DTC; clear fit and a fresh growth hire.",
    },
    qualification: {
      dimensions: dims([
        [85, 0.9],
        [70, 0.75],
        [80, 0.8],
        [88, 0.9],
      ]),
      matched_pain_points: ["Low content velocity", "Thin organic search presence"],
      signals: ["Hiring 'SEO Manager'", "Care-guide content gap", "Modern storefront"],
      outreach_angle:
        "They're hiring an SEO Manager and sit on a goldmine of care-guide content they haven't published.",
      reasoning: "Excellent intent signal plus an obvious content opportunity. High confidence.",
    },
    overall_score: 82,
    confidence: 0.84,
    contacts: [
      {
        name: "Sofia Marin",
        role: "Head of Growth",
        email: "sofia@glasshousebotanicals.com",
        email_confidence: "found",
        linkedin: null,
        twitter: null,
        source: "company website",
      },
    ],
    outreach: {
      subject: "The care-guide content Glasshouse hasn't published",
      body: "Hi Sofia,\n\nSaw you're hiring an SEO Manager — perfect timing. Glasshouse sits on a goldmine of plant-care expertise that isn't published as search-friendly guides yet.\n\nWe help DTC brands turn that kind of know-how into compounding organic traffic. 15 minutes to map it out?\n\n— Alex",
      channel: "email",
    },
    critique: { verdict: "accept", grounded: true, confidence_penalty: 0, issues: [], missing_evidence: [] },
    flags: [],
    links: [],
    recalled_context: [
      "Fernwell (fernwell.com) — score 84. Matched pains: content gap; Signals: hired SEO mgr. Angle: publish expertise.",
    ],
  },
];

export const MOCK_METRICS: RunMetrics = {
  llm_calls: 23,
  embed_calls: 7,
  cache_hits: 11,
  cache_misses: 19,
  scrapes: 9,
  errors: 0,
  total_tokens: 48213,
  estimated_cost_usd: 0.0072,
};

/** A trace tree mirroring the orchestrator: run → intent, discovery, recall, per-company. */
export const MOCK_TRACE: TraceNode = {
  name: "run",
  ms: 8420,
  attrs: {},
  children: [
    { name: "intent", ms: 640, attrs: {}, children: [] },
    { name: "discovery", ms: 1980, attrs: { limit: 6 }, children: [] },
    { name: "recall", ms: 410, attrs: {}, children: [] },
    ...MOCK_LEADS.slice(0, 6).map((l) => ({
      name: "company",
      ms: 900 + Math.round(l.overall_score * 4),
      attrs: { name: l.company.name },
      children: [
        { name: "scrape", ms: 320, attrs: {}, children: [] },
        { name: "qualify", ms: 540, attrs: {}, children: [] },
        ...(l.critique ? [{ name: "critic", ms: 380, attrs: {}, children: [] }] : []),
        { name: "enrich", ms: 300, attrs: {}, children: [] },
        ...(l.outreach ? [{ name: "outreach", ms: 360, attrs: {}, children: [] }] : []),
      ],
    })),
  ],
};
