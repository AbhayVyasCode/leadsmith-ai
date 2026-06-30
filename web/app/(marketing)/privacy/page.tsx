import type { Metadata } from "next";
import Link from "next/link";
import { Database, FileText, Lock, Mail, ShieldCheck } from "lucide-react";

import { Prose } from "@/components/marketing/prose";
import { Section } from "@/components/marketing/section";
import { Reveal } from "@/components/motion/reveal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Leadsmith AI handles your data.",
};

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "information-we-collect", label: "Information we collect" },
  { id: "how-we-use-information", label: "How we use information" },
  { id: "processing-and-third-parties", label: "Processing and third parties" },
  { id: "data-retention", label: "Data retention" },
  { id: "we-dont-sell-your-data", label: "We do not sell your data" },
  { id: "your-choices-and-rights", label: "Your choices and rights" },
  { id: "security", label: "Security" },
  { id: "childrens-privacy", label: "Children's privacy" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Contact" },
];

const SUMMARY = [
  { icon: Database, title: "We collect what the product needs", body: "Queries, generated results, basic usage signals, and messages you send us." },
  { icon: ShieldCheck, title: "Your prospecting data is not inventory", body: "We do not sell, rent, or trade your queries, results, or personal information." },
  { icon: Lock, title: "Uncertainty is handled plainly", body: "The product labels confidence and keeps evidence visible instead of hiding weak signals." },
];

function PageNav() {
  return (
    <nav aria-label="Privacy sections" className="premium-panel sticky top-24 hidden rounded-2xl p-5 lg:block">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">On this page</p>
      <ol className="mt-4 grid gap-2">
        {SECTIONS.map((s, i) => (
          <li key={s.id}>
            <Link
              href={`#${s.id}`}
              className="group flex items-baseline gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span className="tnum font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
              {s.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <Section className="surface-grid overflow-hidden pb-12 pt-24 sm:pb-14 sm:pt-28 lg:pb-16 lg:pt-32" py="none">
        <Reveal>
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/85 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm">
              <FileText className="size-4 text-primary" aria-hidden />
              Legal
            </div>
            <h1 className="mt-6 font-display text-balance text-[clamp(2.75rem,6vw,5rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-foreground">
              Privacy policy
            </h1>
            <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-muted-foreground sm:text-xl">
              How Leadsmith AI handles queries, generated lead results, contact messages, and the data needed to operate the product.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5 text-sm text-muted-foreground">
              <span className="rounded-full border border-border bg-background/80 px-3 py-1.5">Last updated: May 31, 2026</span>
              <span className="rounded-full border border-border bg-background/80 px-3 py-1.5">General template, not legal advice</span>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-8 grid gap-4 md:grid-cols-3">
          {SUMMARY.map((item) => (
            <div key={item.title} className="premium-panel rounded-2xl p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary [&_svg]:size-5">
                <item.icon aria-hidden />
              </span>
              <p className="mt-4 text-sm font-semibold text-foreground">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </Reveal>
      </Section>

      <Section py="sm">
        <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
          <PageNav />
          <Reveal>
            <div className="premium-panel rounded-2xl p-6 sm:p-8 lg:p-10">
              <Prose>
                <h2 id="overview">Overview</h2>
                <p>
                  Leadsmith AI is a multi-agent lead-discovery tool. You describe the companies you want in plain English, and AI agents read the open web to find, qualify, and rank real leads. This policy explains what information we collect, how we use it, and the choices you have.
                </p>
                <p>
                  We try to keep this short and honest. If something here is unclear, <Link href="/contact">get in touch</Link> and we will explain it in plain language.
                </p>

                <h2 id="information-we-collect">Information we collect</h2>
                <p>We keep collection to what the tool actually needs:</p>
                <ul>
                  <li><strong>The queries you enter.</strong> The plain-English requests you type to describe the leads you want.</li>
                  <li><strong>The results generated.</strong> The leads, scores, evidence, contacts, and drafts the agents produce.</li>
                  <li><strong>Basic usage analytics.</strong> Aggregate signals, such as feature usage and errors, that help us improve the product.</li>
                  <li><strong>Contact information you give us.</strong> If you email us or fill in a form, we keep what you send so we can reply.</li>
                </ul>

                <h2 id="how-we-use-information">How we use information</h2>
                <p>We use the information above to run the agents, return your results, operate and secure the product, improve quality, and respond to your questions or feedback.</p>
                <p>We do not sell your data, and we do not use your queries or results as inventory to sell to others.</p>

                <h2 id="processing-and-third-parties">Processing and third parties</h2>
                <p>To do its work, the tool relies on outside services such as Google Gemini for agent reasoning and public web sources for discovery. These providers process only what is needed for the product to function.</p>

                <h2 id="data-retention">Data retention</h2>
                <p>We keep queries, results, and contact messages only as long as needed to run the tool, support you, and improve the product. When we no longer need information, we aim to delete or de-identify it.</p>

                <h2 id="we-dont-sell-your-data">We do not sell your data</h2>
                <p>We do not sell, rent, or trade your personal information, queries, or results. The only parties that touch your data are service providers needed to run the tool.</p>

                <h2 id="your-choices-and-rights">Your choices and rights</h2>
                <p>Depending on where you live, you may have rights to access, correct, export, or delete personal information we hold about you, and to object to certain processing. Email us with your request and we will help.</p>

                <h2 id="security">Security</h2>
                <p>We use reasonable technical and organizational measures, including access controls and encryption in transit. No method of transmission or storage is perfectly secure, but we take protection seriously.</p>

                <h2 id="childrens-privacy">Children's privacy</h2>
                <p>Leadsmith AI is a business tool intended for adults. It is not directed to children, and we do not knowingly collect personal information from anyone under 16.</p>

                <h2 id="changes">Changes to this policy</h2>
                <p>We may update this policy as the product changes or as law requires. When we make a material change, we will update the date at the top of this page.</p>

                <h2 id="contact">Contact</h2>
                <p>
                  Questions about privacy, or want to make a request? Email us at{" "}
                  <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
                </p>
              </Prose>

              <div className="mt-8 rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    For privacy requests, include enough context for us to identify the relevant query, message, or account record.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
