import { SectionHeading } from "@/components/site/section-heading";
import { site } from "@/lib/site";
import s from "./faq.module.css";

const FAQS = [
  {
    q: "What does Leadsmith actually do?",
    a: "You describe the companies you want to reach — or paste your product’s URL. Leadsmith finds candidates on the open web, reads their sites, scores each one against your buyer profile with quoted evidence, finds likely contacts, and can draft a first email. You get a ranked list you can check line by line.",
  },
  {
    q: "How is the fit score calculated?",
    a: "Four dimensions — industry fit (30%), size fit (20%), pain severity (30%) and buying intent (20%) — are each scored 0–100 with a quote and a confidence. The overall score is computed in code, weighted by confidence, so unsure dimensions pull less weight. If a quote can’t be found on the page, that dimension’s confidence is halved.",
  },
  {
    q: "Where do the leads come from?",
    a: "Live web search and the companies’ own public pages. Directories, news sites, listicles, social networks and job boards are filtered out before they cost a model call. Nothing comes from a bought or resold database.",
  },
  {
    q: "How accurate are the emails?",
    a: "Every email carries a label. Found means it was printed on the company’s site. Guessed means it follows a common name pattern on a domain whose mail server we checked — the mailbox itself isn’t verified. Add a Hunter.io key and addresses can be verified. Unknown means we didn’t find one, and we won’t invent it.",
  },
  {
    q: "What is product mode?",
    a: "Paste your product’s URL instead of describing customers. Leadsmith reads your site, works out which kinds of companies would buy or embed it, and builds that buyer profile before it starts searching.",
  },
  {
    q: "Does it remember past research?",
    a: "Yes. Every qualified company is stored in memory. Later runs skip companies you’ve already researched and use similar past findings to calibrate new scores. You can browse or clear the memory at any time.",
  },
  {
    q: "What does a run cost?",
    a: "Leadsmith runs on the free tiers of NVIDIA NIM (reasoning), Tavily (search) and Google Gemini (embeddings) — you bring your own keys. Runs are capped by default so one search can’t drain a daily quota, and every run reports its model calls, tokens and an estimated cost.",
  },
  {
    q: "Will it send emails for me?",
    a: "No. Leadsmith drafts; you decide. Edit the draft and send it from your own inbox — and follow the outreach rules that apply to you, such as GDPR and CAN-SPAM.",
  },
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t border-line py-28 lg:py-36">
      <div className="wrapper grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="self-start lg:sticky lg:top-28 lg:col-span-4">
          <SectionHeading
            id="faq-title"
            index="05"
            kicker="FAQ"
            title={
              <>
                Questions, <em>answered plainly.</em>
              </>
            }
          />
          <p className="reveal mt-6 text-ink-2">
            Something missing?{" "}
            <a href={`mailto:${site.email}`} className="link-underline text-ink">
              Write to us
            </a>
            .
          </p>
        </div>
        <div className={`${s.list} reveal lg:col-span-8`}>
          {FAQS.map((item, i) => (
            <details key={item.q} className={s.item} name="faq" open={i === 0}>
              <summary className={s.summary}>
                <span className={s.q}>{item.q}</span>
                <span aria-hidden className={s.icon} />
              </summary>
              <p className={s.a}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
