import {
  Brain,
  Search,
  Target,
  ShieldCheck,
  Sparkles,
  Mail,
  Network,
  Rocket,
  Users,
  Building2,
  UserSearch,
  LineChart,
  Handshake,
  Eye,
  Gauge,
  Lock,
  MessagesSquare,
  Database,
  type LucideIcon,
} from "lucide-react";

export const EXAMPLE_QUERIES = [
  "B2B SaaS teams in Europe hiring their first SDR",
  "DTC brands with strong paid ads and weak organic search",
  "agencies in Texas using HubSpot but missing case studies",
  "Series A fintechs without a public security page",
];

export const HERO = {
  eyebrow: "",
  headline: ["Know", "who", "to", "sell", "to", "before", "you", "reach", "out."],
  sub: "Tell Leadsmith AI about your product. It finds companies that match your best buyers, scores each one with evidence, enriches contacts, and writes the first draft.",
  primary: { label: "Open the app", href: "/app" },
  secondary: { label: "Watch the pipeline", href: "/how-it-works" },
  trust: "Free to use. No paid data APIs. No credit card.",
} as const;

export type Agent = {
  key: string;
  label: string;
  anchor: string;
  icon: LucideIcon;
  oneLiner: string;
  detail: string;
  bullets: string[];
};

export const AGENTS: Agent[] = [
  {
    key: "intent",
    label: "Intent",
    anchor: "discovery",
    icon: Brain,
    oneLiner: "Turns your request into a precise ideal-customer profile.",
    detail:
      "The intent agent reads your sentence and extracts the market, geography, company size, pain points, buying signals, and decision-maker roles that define a good lead.",
    bullets: [
      "No boolean syntax or rigid filter forms",
      "Converts vague requests into structured ICP criteria",
      "Creates the brief every downstream agent works from",
    ],
  },
  {
    key: "discovery",
    label: "Discovery",
    anchor: "discovery",
    icon: Search,
    oneLiner: "Finds candidate companies from the open web.",
    detail:
      "The discovery agent searches public sources for companies that match the structured profile. It favors current, explainable evidence over stale broker lists.",
    bullets: [
      "Reads public web signals instead of resold lists",
      "Keeps each candidate tied to where it was found",
      "Surfaces companies that match the actual buying context",
    ],
  },
  {
    key: "qualify",
    label: "Qualify",
    anchor: "qualify",
    icon: Target,
    oneLiner: "Scores every lead across confidence-weighted dimensions.",
    detail:
      "The qualifier turns raw candidates into a ranked list. Each lead gets dimension scores, evidence, and confidence so a high score never hides weak support.",
    bullets: [
      "Scores fit, pain, size, intent, and evidence quality",
      "Separates score from confidence",
      "Ranks the list so the strongest opportunities rise first",
    ],
  },
  {
    key: "critic",
    label: "Critic",
    anchor: "evidence",
    icon: ShieldCheck,
    oneLiner: "Argues against each lead before it reaches you.",
    detail:
      "The critic reviews the evidence like a skeptical analyst. It rejects bad matches, flags thin evidence, and keeps the system from optimizing for volume alone.",
    bullets: [
      "Challenges unsupported claims",
      "Flags weak matches instead of hiding caveats",
      "Improves trust by making the list shorter and sharper",
    ],
  },
  {
    key: "enrich",
    label: "Enrich",
    anchor: "enrich",
    icon: Sparkles,
    oneLiner: "Finds the right person and labels email confidence honestly.",
    detail:
      "The enrichment agent looks for a relevant contact, role, and email. Every email is marked found, guessed, or unknown so a guess never looks like verification.",
    bullets: [
      "Targets the person most likely to own the problem",
      "Labels email confidence visibly",
      "Keeps unknowns honest instead of fabricating contact data",
    ],
  },
  {
    key: "outreach",
    label: "Outreach",
    anchor: "outreach",
    icon: Mail,
    oneLiner: "Drafts a first message from the evidence that qualified the lead.",
    detail:
      "The outreach agent uses the same evidence behind the score to write a specific opener. You get a draft to copy, edit, and send in your own voice.",
    bullets: [
      "Grounds personalization in real signals",
      "Explains why this company is worth contacting",
      "Removes the blank page without sending anything for you",
    ],
  },
];

export const TRACE = {
  key: "trace",
  label: "Live agent trace",
  anchor: "trace",
  icon: Network,
  oneLiner: "Shows every agent step while the run is happening.",
  detail:
    "Leadsmith AI exposes the supervisor, each agent branch, timings, warnings, and run metrics. You can see where every result came from instead of trusting a black box.",
} as const;

export const DIFFERENTIATORS = [
  "Specialized agents, not one giant prompt.",
  "Evidence attached to every score.",
  "A critic that is allowed to say no.",
  "Open-web discovery instead of broker-list resale.",
  "Free, with limits stated plainly.",
];

export const PROBLEMS = [
  {
    icon: Search,
    title: "You know the product, not the buyer list",
    body: "Most founders can explain what they sell faster than they can name the companies most likely to buy it. That gap becomes hours of manual research.",
  },
  {
    icon: Database,
    title: "Static databases miss the context",
    body: "A generic contact database can tell you who exists. It usually cannot explain why a company has the pain, timing, or buying signal your product needs.",
  },
  {
    icon: Eye,
    title: "Scores are useless without evidence",
    body: "A lead score only helps if you can inspect the reasoning. Leadsmith AI keeps the score, evidence, critic verdict, and contact confidence together.",
  },
];

export const FEATURES = [
  {
    icon: MessagesSquare,
    title: "Plain English input",
    body: "Describe the companies you want like you would brief a researcher. The system turns it into structured search criteria.",
  },
  {
    icon: Network,
    title: "Agent pipeline",
    body: "Intent, discovery, qualify, critic, enrich, and outreach agents each own one job and pass clean context forward.",
  },
  {
    icon: Gauge,
    title: "Inspectible lead scores",
    body: "Every lead includes a score, confidence, dimension evidence, and the reason it made the list.",
  },
  {
    icon: ShieldCheck,
    title: "Adversarial review",
    body: "A critic agent challenges weak evidence so you spend less time manually disqualifying bad fits.",
  },
  {
    icon: Mail,
    title: "Evidence-based outreach",
    body: "Drafts are based on the signal that qualified the lead, not generic personalization tokens.",
  },
  {
    icon: Eye,
    title: "Live trace",
    body: "Watch the run unfold with timings, warnings, metrics, and agent state changes.",
  },
];

export const TRANSPARENCY = [
  { icon: Sparkles, title: "Free on Gemini", body: "The product runs on Google Gemini and does not require a credit card to try." },
  { icon: Search, title: "No paid data APIs", body: "Discovery uses open-web evidence rather than reselling a third-party contact database." },
  { icon: Eye, title: "Evidence first", body: "Scores, confidence, critique, and run metrics are visible so you can judge the results yourself." },
  { icon: Lock, title: "Your research stays yours", body: "Queries and results are treated as your prospecting work, not as inventory to resell." },
];

export type UseCase = {
  key: string;
  persona: string;
  icon: LucideIcon;
  jtbd: string;
  query: string;
  returns: string;
  outcome: string;
};

export const USE_CASES: UseCase[] = [
  {
    key: "founders",
    persona: "Founders and first GTM hires",
    icon: Rocket,
    jtbd: "Find early customers before there is a dedicated sales team.",
    query: "seed-stage workflow tools selling to finance teams",
    returns: "A ranked list with the company, buying signal, best contact, confidence, and a draft opener.",
    outcome: "Move from a broad market guess to specific conversations.",
  },
  {
    key: "sales",
    persona: "Sales and SDR teams",
    icon: Users,
    jtbd: "Build targeted account lists without losing the morning to research.",
    query: "EU logistics companies using legacy TMS software",
    returns: "Qualified accounts with fit score, evidence, contact confidence, and outreach angle.",
    outcome: "Spend time selling to accounts that already match the thesis.",
  },
  {
    key: "agencies",
    persona: "Agencies and lead-gen teams",
    icon: Building2,
    jtbd: "Create niche lists for clients without buying stale databases.",
    query: "dental practices in Florida with outdated websites",
    returns: "Prospects with the exact evidence that makes the pitch relevant.",
    outcome: "Show clients why every lead belongs on the list.",
  },
  {
    key: "recruiters",
    persona: "Recruiters and talent partners",
    icon: UserSearch,
    jtbd: "Map companies with hiring momentum and a reason to talk.",
    query: "Series B companies hiring multiple senior engineers",
    returns: "Companies with hiring signals, fit notes, and the likely person to contact.",
    outcome: "Target the teams that are actively growing.",
  },
  {
    key: "investors",
    persona: "Investors and researchers",
    icon: LineChart,
    jtbd: "Turn a thesis into a sourced market map.",
    query: "bootstrapped vertical SaaS companies in healthcare",
    returns: "A structured list with evidence, confidence, and repeatable qualification logic.",
    outcome: "Get from vague segment to concrete targets faster.",
  },
  {
    key: "partnerships",
    persona: "Partnerships and BD",
    icon: Handshake,
    jtbd: "Find companies with a clear reason to collaborate.",
    query: "Shopify app developers that complement email marketing",
    returns: "Potential partners with the reason the fit makes sense.",
    outcome: "Start the conversation with a specific partnership angle.",
  },
];

export const PRINCIPLES = [
  { icon: Eye, title: "Show the work", body: "Every important claim should be inspectable: source, score, confidence, critique, or trace." },
  { icon: ShieldCheck, title: "Quality beats volume", body: "A shorter list that survived criticism is better than a large list you must verify from scratch." },
  { icon: MessagesSquare, title: "Plain English should be enough", body: "Users should describe a buyer, not learn another search language." },
  { icon: Sparkles, title: "Be honest about limits", body: "The product should label uncertainty instead of hiding it behind polished copy." },
  { icon: Lock, title: "Respect prospecting data", body: "Your searches and results are business context. They should be treated that way." },
];

export const PROOF_PILLS = [
  "Product-to-buyer discovery",
  "6-agent qualification pipeline",
  "Evidence-backed scoring",
  "Critic review before output",
  "Contact confidence labels",
  "Draft outreach included",
];

export type FaqItem = { q: string; a: string };
export type FaqGroup = { group: string; items: FaqItem[] };

export const FAQ_GROUPS: FaqGroup[] = [
  {
    group: "Getting started",
    items: [
      { q: "Is Leadsmith AI really free?", a: "Yes. It runs on Google Gemini and uses no paid data APIs, so you can try it without a credit card." },
      { q: "Do I need boolean search skills?", a: "No. Describe the companies you want in plain English. The intent agent turns your sentence into structured criteria." },
      { q: "Can I export leads?", a: "Yes. Qualified results can be exported from the app for use in your CRM, spreadsheet, or outreach workflow." },
    ],
  },
  {
    group: "How it works",
    items: [
      { q: "Where do leads come from?", a: "The discovery agent searches and reads open-web sources. Leadsmith AI is not a broker-list reseller." },
      { q: "What does the live trace show?", a: "It shows the supervisor, agent steps, timings, warnings, and branch-level progress so you can see how a run unfolded." },
      { q: "What can it not do yet?", a: "It does not send emails, guarantee deliverability, or fabricate missing contact data. It is a discovery and qualification workspace." },
    ],
  },
  {
    group: "Accuracy and trust",
    items: [
      { q: "How should I read the score?", a: "Treat the score as a summary of dimensions, evidence, and confidence. The evidence is visible so you can decide whether the ranking is useful." },
      { q: "Are emails verified?", a: "Some are found, some are guessed, and some are unknown. The app labels the confidence clearly instead of presenting guesses as facts." },
      { q: "Why include a critic agent?", a: "The critic challenges weak matches before they reach the final list. It improves trust by reducing false positives." },
    ],
  },
  {
    group: "Data and privacy",
    items: [
      { q: "Is my research private?", a: "Your queries and results are your prospecting data. We do not position them as data inventory to resell." },
      { q: "Do I still need to follow outreach laws?", a: "Yes. Leadsmith AI helps with discovery and drafting. You remain responsible for GDPR, CAN-SPAM, and other rules that apply to your outreach." },
    ],
  },
];

export const FAQ_HOME = FAQ_GROUPS.flatMap((g) => g.items).slice(0, 5);
