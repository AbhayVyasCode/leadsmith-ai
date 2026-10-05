import { BriefsMarquee } from "@/components/site/briefs-marquee";
import { Comparison } from "@/components/site/comparison";
import { Faq } from "@/components/site/faq";
import { Features } from "@/components/site/features";
import { FinalCta } from "@/components/site/final-cta";
import { Hero } from "@/components/site/hero";
import { HowItWorks } from "@/components/site/how-it-works";
import { Principles } from "@/components/site/principles";
import { Showcase } from "@/components/site/showcase";
import { UseCases } from "@/components/site/use-cases";
import { site } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: site.name,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: site.description,
  url: site.url,
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <BriefsMarquee />
      <Comparison />
      <HowItWorks />
      <Features />
      <Showcase />
      <UseCases />
      <Principles />
      <Faq />
      <FinalCta />
    </>
  );
}
