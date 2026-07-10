import type { Metadata } from "next";
import { Clock, Github, Linkedin, Mail } from "lucide-react";

import { Section } from "@/components/marketing/section";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { siteConfig } from "@/lib/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions, demos, feedback, or partnerships — get in touch with the Leadsmith AI team.",
};

/** Minimal X (Twitter) glyph — lucide has no maintained X mark. */
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      {...props}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

const SOCIAL = [
  { label: "X (Twitter)", Icon: XIcon },
  { label: "LinkedIn", Icon: Linkedin },
  { label: "GitHub", Icon: Github },
] as const;

export default function ContactPage() {
  return (
    <Section className="pt-28 sm:pt-32" py="default">
      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
        {/* LEFT — copy, direct email, response time, social */}
        <Reveal>
          <div className="flex flex-col">
            <SectionHeading
              as="h1"
              align="left"
              eyebrow="Contact"
              title="Talk to us."
              lead="Questions, a demo, feedback, or a partnership idea — we'd love to hear from you."
            />

            <dl className="mt-10 flex flex-col gap-8">
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary [&_svg]:size-5">
                  <Mail aria-hidden />
                </span>
                <div>
                  <dt className="text-sm font-medium text-foreground">
                    Email us directly
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="font-mono text-base text-link underline-offset-4 hover:underline"
                    >
                      {siteConfig.email}
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary [&_svg]:size-5">
                  <Clock aria-hidden />
                </span>
                <div>
                  <dt className="text-sm font-medium text-foreground">
                    Response time
                  </dt>
                  <dd className="mt-1 text-base leading-relaxed text-muted-foreground">
                    We usually reply within 1&ndash;2 business days.
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-10 border-t border-border pt-8">
              <p className="text-sm font-medium text-foreground">
                Find us elsewhere
              </p>
              <ul className="mt-4 flex items-center gap-3">
                {SOCIAL.map(({ label, Icon }) => (
                  <li key={label}>
                    <span
                      aria-label={label}
                      className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground [&_svg]:size-5"
                    >
                      <Icon />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        {/* RIGHT — interactive form (client component) */}
        <Reveal delay={0.05} className="h-full">
          <ContactForm />
        </Reveal>
      </div>
    </Section>
  );
}
