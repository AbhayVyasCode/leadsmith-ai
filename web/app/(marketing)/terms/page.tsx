import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Mail, Scale, ShieldCheck, Workflow } from "lucide-react";

import { Prose } from "@/components/marketing/prose";
import { Section } from "@/components/marketing/section";
import { Reveal } from "@/components/motion/reveal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms for using Leadsmith AI.",
};

const SECTIONS = [
  { id: "acceptance", label: "Acceptance of terms" },
  { id: "the-service", label: "The service" },
  { id: "acceptable-use", label: "Acceptable use" },
  { id: "your-responsibilities", label: "Your responsibilities" },
  { id: "no-warranties", label: "No warranties and accuracy disclaimer" },
  { id: "limitation-of-liability", label: "Limitation of liability" },
  { id: "intellectual-property", label: "Intellectual property" },
  { id: "changes", label: "Changes to the service and terms" },
  { id: "termination", label: "Termination" },
  { id: "governing-law", label: "Governing law" },
  { id: "contact", label: "Contact" },
];

const SUMMARY = [
  { icon: Workflow, title: "Discovery workspace", body: "Leadsmith AI helps find, qualify, rank, and draft outreach for leads." },
  { icon: ShieldCheck, title: "You stay responsible", body: "You decide what to trust, edit, export, send, and how to comply with outreach laws." },
  { icon: Scale, title: "Provided as-is", body: "AI and public web sources can be incomplete, stale, or wrong. Verify before relying on results." },
];

function PageNav() {
  return (
    <nav aria-label="Terms sections" className="premium-panel sticky top-24 hidden rounded-2xl p-5 lg:block">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">On this page</p>
      <ol className="mt-4 grid gap-2">
        {SECTIONS.map((s, i) => (
          <li key={s.id}>
            <Link
              href={`#${s.id}`}
              className="flex items-baseline gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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

export default function TermsPage() {
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
              Terms of service
            </h1>
            <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-muted-foreground sm:text-xl">
              The practical rules for using Leadsmith AI, reviewing generated results, and staying responsible for your outreach.
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
                <h2 id="acceptance">Acceptance of terms</h2>
                <p>These terms are an agreement between you and Leadsmith AI. By using the tool, you agree to them. If you use Leadsmith AI on behalf of an organization, you confirm you have authority to accept these terms for that organization.</p>

                <h2 id="the-service">The service</h2>
                <p>Leadsmith AI is a multi-agent lead-discovery and qualification engine. You describe the companies you want in plain English, and AI agents read the open web to find, qualify, rank, and draft outreach for real leads.</p>
                <p>The service is provided as-is. It is a discovery and qualification engine, not a guarantee of accuracy, email deliverability, or sales outcomes. It is not a sending platform.</p>

                <h2 id="acceptable-use">Acceptable use</h2>
                <p>When you use Leadsmith AI, you agree not to use the tool for anything illegal, harmful, deceptive, abusive, discriminatory, or designed to overload, disrupt, scrape, or reverse-engineer the service.</p>
                <p>You are responsible for complying with anti-spam, privacy, and outreach laws that apply to you and your recipients.</p>

                <h2 id="your-responsibilities">Your responsibilities</h2>
                <p>You are responsible for how you use the leads, scores, contacts, and drafts the tool produces. Verify contact details before relying on them, review outreach drafts before sending, and make sure your outreach is accurate and lawful.</p>

                <h2 id="no-warranties">No warranties and accuracy disclaimer</h2>
                <p>The tool draws on AI models and publicly available web sources, which can be incomplete, out of date, or wrong. We provide the service without warranties of any kind, express or implied.</p>
                <p>Emails may be labeled verified, guessed, or unknown. A guess is not verification, and you should confirm any contact detail before relying on it.</p>

                <h2 id="limitation-of-liability">Limitation of liability</h2>
                <p>To the maximum extent allowed by law, Leadsmith AI and its team will not be liable for indirect, incidental, special, consequential, or exemplary damages, or for lost profits, data, or goodwill arising from your use of the tool.</p>

                <h2 id="intellectual-property">Intellectual property</h2>
                <p>Leadsmith AI, including the name, logo, software, and design, belongs to us and is protected by intellectual-property laws. The leads and drafts generated for you are yours to use for your own outreach, subject to these terms and the law.</p>

                <h2 id="changes">Changes to the service and terms</h2>
                <p>We may add, remove, or modify features, and we may update these terms over time. When we make a material change, we will update the date at the top of this page.</p>

                <h2 id="termination">Termination</h2>
                <p>You can stop using Leadsmith AI at any time. We may suspend or end access if the service is misused, these terms are broken, or we need to protect the product.</p>

                <h2 id="governing-law">Governing law</h2>
                <p>These terms are governed by the laws that apply where Leadsmith AI is operated, without regard to conflict-of-laws rules. If a dispute comes up, please reach out so we can try to resolve it directly first.</p>

                <h2 id="contact">Contact</h2>
                <p>
                  Questions about these terms? Email us at{" "}
                  <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
                </p>
              </Prose>

              <div className="mt-8 rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    For legal questions, include the page, section, or product behavior you are asking about so we can respond clearly.
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
