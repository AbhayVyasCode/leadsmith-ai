import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy & terms",
  description: "How Leadsmith handles your data, which services it relies on, and the terms for using it.",
};

const SUMMARY = [
  { k: "No tracking", v: "No analytics, ad pixels or third-party cookies." },
  { k: "No resale", v: "Your briefs and results are never sold or shared." },
  { k: "You can delete", v: "Runs and memory can be cleared from the app at any time." },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 border-t border-line py-14">
      <h2 id={`${id}-title`} className="font-display text-[clamp(2.1rem,4vw,3rem)] leading-none text-ink">
        {title}
      </h2>
      <div className="mt-8 space-y-6 text-[1.05rem] leading-[1.75] text-ink-2 [&_h3]:mt-10 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:text-ink [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
        {children}
      </div>
    </section>
  );
}

export default function LegalPage() {
  return (
    <div className="wrapper max-w-[880px] pb-24 pt-36">
      <p className="eyebrow text-ink-3">Legal · Last updated October 2026</p>
      <h1 className="mt-5 font-display text-[clamp(3rem,7vw,5.5rem)] leading-[0.95] tracking-[-0.025em] text-ink">
        Privacy <em className="text-ember-ink">&amp;</em> terms
      </h1>
      <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-ink-2">
        This page describes plainly what Leadsmith does with data and the terms for using it. It reflects how the
        software works; it is not legal advice.
      </p>

      <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {SUMMARY.map((item) => (
          <li key={item.k} className="card p-5">
            <p className="font-medium text-ink">{item.k}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-2">{item.v}</p>
          </li>
        ))}
      </ul>

      <nav aria-label="On this page" className="mt-10 flex gap-3 text-sm">
        <a href="#privacy" className="link-underline text-ink">
          Privacy
        </a>
        <span aria-hidden className="text-ink-3">
          /
        </span>
        <a href="#terms" className="link-underline text-ink">
          Terms
        </a>
      </nav>

      <div className="mt-12">
        <Section id="privacy" title="Privacy">
          <h3>What Leadsmith processes</h3>
          <ul>
            <li>
              <strong>Your briefs</strong> — the plain-English requests or product URLs you submit.
            </li>
            <li>
              <strong>Research results</strong> — buyer profiles, scored companies, quoted evidence, contacts and drafts.
            </li>
            <li>
              <strong>Public web pages</strong> — the homepage and about, team and contact pages of companies being
              researched, read at the time of the run.
            </li>
          </ul>

          <h3>Services involved in a run</h3>
          <p>To do its work, a run sends only what each step needs to these providers:</p>
          <ul>
            <li>
              <strong>NVIDIA NIM</strong> — the reasoning model. Receives your brief and text from public company pages.
            </li>
            <li>
              <strong>Tavily</strong> — web search. Receives search queries derived from your brief.
            </li>
            <li>
              <strong>Google Gemini</strong> — embeddings for memory. Receives short summaries of qualified leads.
            </li>
            <li>
              <strong>Hunter.io</strong> (optional, only if configured) — receives names and company domains to find or
              verify emails.
            </li>
          </ul>

          <h3>Where data is stored</h3>
          <p>
            Runs, memory and the response cache are stored by the Leadsmith server — in a local database by default, or
            in a Convex deployment if one is configured. Nothing is stored in your browser beyond your theme
            preference.
          </p>

          <h3>Your choices</h3>
          <p>
            Delete individual runs or memories, or clear them all, from the Runs and Memory pages. For anything else,
            email{" "}
            <a className="link-underline text-ink" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            .
          </p>
        </Section>

        <Section id="terms" title="Terms">
          <h3>Using Leadsmith</h3>
          <p>
            Leadsmith is a research tool. Use it lawfully: don’t use it to harass anyone, to send unsolicited bulk
            email, or to collect personal data you have no legitimate reason to process.
          </p>

          <h3>Accuracy</h3>
          <p>
            Results come from AI models reading public web pages. They can be incomplete, out of date or wrong — which
            is why every score shows its evidence and every email shows how it was found. Check before you rely on a
            result. Guessed emails are guesses.
          </p>

          <h3>Your outreach is your responsibility</h3>
          <p>
            Leadsmith drafts messages but never sends them. You are responsible for anything you send and for following
            the laws that apply to you, such as GDPR, PECR and CAN-SPAM.
          </p>

          <h3>No warranty</h3>
          <p>
            The software is provided as is, without warranties of any kind. To the extent the law allows, we are not
            liable for decisions made or losses incurred based on its output.
          </p>

          <h3>Changes</h3>
          <p>We may update this page as the product changes. The date at the top shows the latest revision.</p>
        </Section>
      </div>
    </div>
  );
}
