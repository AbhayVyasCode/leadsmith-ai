import type { ICP, Lead, ProductProfile, RunMetrics, TraceNode } from "@/lib/types";

/** Example briefs surfaced in the composer, per mode. */
export const EXAMPLE_BRIEFS = {
  customer: [
    "Series A fintechs in the US without a public security page",
    "B2B SaaS teams in Europe hiring their first SDR",
    "Shopify brands with strong paid ads and thin organic search",
    "Logistics companies still running legacy TMS software",
  ],
  product: ["https://rustbox.orkait.com"],
} as const;

/* ------------------------------------------------------------------------
   Demo fixtures (fictional companies — used only when no backend is set).
   ------------------------------------------------------------------------ */

export const MOCK_ICP: ICP = {
  industry: "Fintech (payments & lending)",
  company_size: "Series A · 20–200 employees",
  geography: "United States",
  pain_points: [
    "No public security or trust page",
    "Enterprise deals stalled by security reviews",
    "SOC 2 program not in place yet",
  ],
  buying_signals: ["Hiring security or compliance roles", "Recent Series A announcement", "Moving upmarket to enterprise"],
  decision_maker_roles: ["CTO", "Head of Security", "VP Engineering"],
  keywords: ["fintech startup", "payments API", "lending platform", "neobank"],
};

export const MOCK_PRODUCT: ProductProfile = {
  product_name: "Rustbox",
  what_it_does:
    "A cloud API that runs untrusted code in kernel-isolated sandboxes and returns a structured verdict with syscall-level evidence.",
  category: "Code-execution sandbox API",
  key_features: ["Kernel isolation", "Judge and agent modes", "8 languages", "Structured verdicts"],
  pricing_motion: "self-serve",
  customer_segments: ["Online-judge platforms", "AI agent frameworks", "Technical hiring tools", "Coding education"],
  target_customers_description:
    "Engineering-led products that must run user- or model-generated code safely and would rather buy a hardened runtime than build one.",
  evidence_quotes: ["execute untrusted code with kernel-level isolation", "structured verdict with syscall-level evidence"],
};

const dims = (
  rows: [number, number][],
  evidence: [string, string, string, string],
  quotes: [string, string, string, string],
) =>
  (["industry_fit", "size_fit", "pain_severity", "buying_intent"] as const).map((dimension, i) => ({
    dimension,
    score: rows[i][0],
    confidence: rows[i][1],
    evidence: evidence[i],
    evidence_quote: quotes[i],
  }));

export const MOCK_LEADS: Lead[] = [
  {
    company: { name: "Woodgrove Pay", website: "https://woodgrove.example", reason: "Payments API selling into mid-market banks." },
    qualification: {
      dimensions: dims(
        [
          [94, 0.95],
          [78, 0.8],
          [88, 0.7],
          [81, 0.9],
        ],
        [
          "Builds a payments API for banks and credit unions — squarely fintech.",
          "Careers page lists 34 open roles; About page says “a team of 120”.",
          "No trust or security page anywhere on the site; enterprise logos on the homepage.",
          "Actively hiring a Head of Security & Compliance to lead SOC 2.",
        ],
        [
          "the payments API built for community banks",
          "a team of 120 across New York and Austin",
          "",
          "We’re hiring a Head of Security & Compliance to lead our SOC 2 program",
        ],
      ),
      matched_pain_points: ["No public security or trust page", "SOC 2 program not in place yet"],
      signals: ["Hiring Head of Security & Compliance", "Enterprise logos on homepage", "Series A in March"],
      outreach_angle: "They’re hiring their first security lead to run SOC 2 — a public trust page is the fastest visible win.",
      reasoning: "Clear fintech fit, right size, a visible gap, and an active security hire. Strong, well-evidenced lead.",
    },
    overall_score: 87,
    confidence: 0.86,
    contacts: [
      { name: "Dana Whitfield", role: "CTO", email: "dana@woodgrove.example", email_confidence: "found", linkedin: null, twitter: null, source: "company website" },
      { name: "Luis Ortega", role: "Head of Platform", email: "luis.ortega@woodgrove.example", email_confidence: "guessed", linkedin: null, twitter: null, source: "linkedin (web search)" },
    ],
    outreach: {
      subject: "The page your next enterprise buyer will ask for",
      body: "Hi Dana,\n\nSaw you’re hiring a Head of Security & Compliance to lead SOC 2 — congrats on the Series A.\n\nBuyers at your stage usually ask for a public trust page before the first call. We help fintech teams ship one in about a week, with the controls you already have.\n\nWorth a 15-minute look?",
      channel: "email",
    },
    critique: { verdict: "accept", grounded: true, confidence_penalty: 0.04, issues: [], missing_evidence: [] },
    flags: [],
    links: ["https://www.linkedin.com/company/woodgrove-example"],
    recalled_context: ["Northwind Lending (northwind.example) — score 71. Matched pains: no trust page. Signals: SOC 2 hire. Angle: trust page before enterprise push."],
  },
  {
    company: { name: "Fabrikam Ledger", website: "https://fabrikam.example", reason: "Accounting ledger API for fintech apps." },
    qualification: {
      dimensions: dims(
        [
          [90, 0.9],
          [72, 0.75],
          [80, 0.65],
          [77, 0.7],
        ],
        [
          "Ledger infrastructure for fintech apps.",
          "Team page shows ~45 people.",
          "Security questions are answered in a PDF on request, not on the site.",
          "Announced a $14M Series A and an enterprise tier.",
        ],
        ["ledger infrastructure for modern fintech", "", "security documentation available on request", "Backed by a $14M Series A"],
      ),
      matched_pain_points: ["No public security or trust page", "Enterprise deals stalled by security reviews"],
      signals: ["New enterprise tier", "Series A announcement"],
      outreach_angle: "Their new enterprise tier will hit security reviews — security docs are still “on request”.",
      reasoning: "Good fit with a concrete gap; size is inferred from the team page.",
    },
    overall_score: 81,
    confidence: 0.74,
    contacts: [
      { name: "Arjun Mehta", role: "VP Engineering", email: "arjun.mehta@fabrikam.example", email_confidence: "guessed", linkedin: null, twitter: null, source: "linkedin (web search)" },
    ],
    outreach: {
      subject: "Security docs “on request” vs. your enterprise tier",
      body: "Hi Arjun,\n\nCongrats on the Series A and the new enterprise tier. One thing that tends to slow those deals: security answers that live in a PDF on request.\n\nA public trust page usually shortens the first review by weeks. Open to a quick call?",
      channel: "email",
    },
    critique: { verdict: "accept", grounded: true, confidence_penalty: 0.08, issues: [], missing_evidence: ["Exact headcount"] },
    flags: [],
    links: [],
    recalled_context: [],
  },
  {
    company: { name: "Contoso Treasury", website: "https://contoso.example", reason: "Treasury tools for startups." },
    qualification: {
      dimensions: dims(
        [
          [86, 0.85],
          [70, 0.7],
          [72, 0.6],
          [66, 0.6],
        ],
        [
          "Treasury management for venture-backed startups.",
          "About page cites 60 employees.",
          "A security FAQ exists but no trust centre or reports.",
          "Expanding to the EU; hiring a compliance analyst.",
        ],
        ["treasury management for venture-backed startups", "60 people", "", "Now live in the EU"],
      ),
      matched_pain_points: ["Enterprise deals stalled by security reviews"],
      signals: ["EU expansion", "Compliance analyst opening"],
      outreach_angle: "EU expansion brings new security questionnaires — their FAQ won’t cover them.",
      reasoning: "Solid fit; pain is moderate and partly inferred.",
    },
    overall_score: 74,
    confidence: 0.69,
    contacts: [
      { name: "Lena Ortiz", role: "Co-founder & CEO", email: "lena@contoso.example", email_confidence: "verify", linkedin: null, twitter: null, source: "hunter.io" },
    ],
    outreach: null,
    critique: { verdict: "accept", grounded: true, confidence_penalty: 0.06, issues: [], missing_evidence: [] },
    flags: [],
    links: [],
    recalled_context: [],
  },
  {
    company: { name: "Tailspin Credit", website: "https://tailspin.example", reason: "Lending software for credit unions." },
    qualification: {
      dimensions: dims(
        [
          [78, 0.7],
          [58, 0.5],
          [60, 0.45],
          [52, 0.4],
        ],
        [
          "Lending platform for credit unions.",
          "Size unclear — no team or careers page.",
          "No security page, but the site is thin overall.",
          "No visible buying signal.",
        ],
        ["Trusted by 400+ credit unions", "", "", ""],
      ),
      matched_pain_points: ["No public security or trust page"],
      signals: ["Thin public footprint"],
      outreach_angle: "Credit-union buyers ask security questions early — nothing on the site answers them.",
      reasoning: "Plausible but thinly evidenced.",
    },
    overall_score: 62,
    confidence: 0.48,
    contacts: [
      { name: "Mara Koenig", role: "Founder", email: null, email_confidence: "unknown", linkedin: null, twitter: null, source: "company website" },
    ],
    outreach: null,
    critique: {
      verdict: "weak",
      grounded: true,
      confidence_penalty: 0.18,
      issues: ["Buying intent is inferred; there is no hiring or funding signal."],
      missing_evidence: ["Headcount or team page", "Any recent buying signal"],
    },
    flags: ["weak-evidence"],
    links: [],
    recalled_context: [],
  },
  {
    company: { name: "Northwind Lending", website: "https://northwind-lending.example", reason: "Consumer lending app." },
    qualification: {
      dimensions: dims(
        [
          [70, 0.6],
          [55, 0.4],
          [58, 0.5],
          [40, 0.3],
        ],
        [
          "Consumer lending app — fintech, but B2C.",
          "No size information.",
          "Security page exists but is outdated.",
          "No buying signal found.",
        ],
        ["", "", "", ""],
      ),
      matched_pain_points: [],
      signals: [],
      outreach_angle: "Outdated security page could be refreshed.",
      reasoning: "Weak match: B2C focus and little evidence.",
    },
    overall_score: 56,
    confidence: 0.41,
    contacts: [],
    outreach: null,
    critique: {
      verdict: "reject",
      grounded: false,
      confidence_penalty: 0.3,
      issues: ["The company already has a security page, which contradicts the main pain point."],
      missing_evidence: ["A B2B or enterprise motion"],
    },
    flags: ["rejected-by-critic"],
    links: [],
    recalled_context: [],
  },
];

export const MOCK_METRICS: RunMetrics = {
  llm_calls: 42,
  embed_calls: 9,
  cache_hits: 18,
  cache_misses: 33,
  scrapes: 11,
  errors: 0,
  total_tokens: 61240,
  estimated_cost_usd: 0.0092,
  total_scanned: 11,
  waves: 2,
};

export const MOCK_TRACE: TraceNode = {
  name: "run",
  ms: 134200,
  attrs: {},
  children: [
    { name: "intent", ms: 6400, attrs: {}, children: [] },
    { name: "recall", ms: 2100, attrs: {}, children: [] },
    { name: "discovery", ms: 9800, attrs: { wave: 1, limit: 8 }, children: [] },
    ...MOCK_LEADS.map((lead, i) => ({
      name: "company",
      ms: 18000 + i * 4200,
      attrs: { name: lead.company.name },
      children: [
        { name: "scrape", ms: 3100 + i * 300, attrs: {}, children: [] },
        { name: "qualify", ms: 7200 + i * 500, attrs: {}, children: [] },
        ...(lead.critique ? [{ name: "critic", ms: 4100, attrs: {}, children: [] }] : []),
        { name: "enrich", ms: 3600, attrs: {}, children: [] },
        ...(lead.outreach ? [{ name: "outreach", ms: 2900, attrs: {}, children: [] }] : []),
      ],
    })),
    { name: "discovery", ms: 7600, attrs: { wave: 2, limit: 4 }, children: [] },
  ],
};
