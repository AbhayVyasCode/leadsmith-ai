const LIMITS = [
  {
    t: "It won’t send email for you.",
    d: "Drafts are a starting point. You review, edit and send from your own inbox.",
  },
  {
    t: "It won’t dress up a guess.",
    d: "Guessed emails are labeled Guessed. We check the domain’s mail server — not the mailbox — and say so.",
  },
  {
    t: "It won’t hide weak evidence.",
    d: "The critic flags thin scores and lowers their confidence. It never deletes a lead behind your back.",
  },
  {
    t: "It won’t go behind logins.",
    d: "Only public pages: each company’s own site and open search results. No scraped social profiles.",
  },
  {
    t: "It won’t burn your free tier.",
    d: "Runs are capped by default — up to 16 companies over 4 search waves — and every run shows its model calls and tokens.",
  },
];

/** Inverse band (ink on canvas, flipped) — a deliberate rhythm break in both themes. */
export function Principles() {
  return (
    <section aria-labelledby="limits-title" className="bg-ink text-canvas">
      <div className="wrapper grid grid-cols-1 gap-14 py-28 lg:grid-cols-12 lg:gap-10 lg:py-36">
        <div className="reveal lg:col-span-5">
          <p className="eyebrow flex items-center gap-3 text-canvas/70">
            <span className="text-ember">06</span>
            <span aria-hidden className="h-px w-8 bg-canvas/30" />
            Honest limits
          </p>
          <h2 id="limits-title" className="mt-5 font-display text-[clamp(2.5rem,5.4vw,4.6rem)] leading-[0.98] tracking-[-0.022em]">
            What Leadsmith <em className="text-ember">won’t</em> pretend.
          </h2>
          <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-canvas/75">
            Research tools earn trust by being clear about their edges. Here are ours.
          </p>
        </div>
        <ol className="lg:col-span-7">
          {LIMITS.map((item, i) => (
            <li key={item.t} className="reveal grid grid-cols-[3.5rem_1fr] gap-4 border-t border-canvas/15 py-7 first:border-t-0 first:pt-0 sm:grid-cols-[4.5rem_1fr]">
              <span aria-hidden className="font-display text-[2.6rem] leading-none text-ember">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="font-display text-[1.9rem] leading-[1.1]">{item.t}</p>
                <p className="mt-2 max-w-[52ch] text-[1.02rem] leading-relaxed text-canvas/75">{item.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
