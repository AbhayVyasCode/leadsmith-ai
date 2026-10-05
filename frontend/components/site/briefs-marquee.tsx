import s from "./briefs-marquee.module.css";

const BRIEFS = [
  "B2B SaaS teams in Europe hiring their first SDR",
  "Shopify brands with strong paid ads and thin organic search",
  "Series A fintechs without a public security page",
  "Logistics companies still running legacy TMS software",
  "Agencies in Texas that use HubSpot but publish no case studies",
  "https://yourproduct.com → the companies that would buy it",
  "Dental groups in Florida with outdated websites",
  "Seed-stage dev-tool startups hiring developer advocates",
];

/** Infinite CSS marquee of example briefs. Pauses on hover/focus; static under reduced motion. */
export function BriefsMarquee() {
  return (
    <section aria-label="Example briefs" className="border-y border-line bg-panel/60">
      <div className="wrapper flex items-center gap-6 py-5">
        <p className="eyebrow hidden shrink-0 text-ink-3 md:block">Try a brief</p>
        <div className={s.viewport} data-loop>
          <ul className={s.track}>
            {[...BRIEFS, ...BRIEFS].map((brief, i) => (
              <li key={i} aria-hidden={i >= BRIEFS.length || undefined} className={s.item}>
                <span aria-hidden className={s.arrow}>
                  ↳
                </span>
                {brief}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
