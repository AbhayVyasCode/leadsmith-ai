import { Hero } from "@/components/landing/hero";
import {
  ProofStrip,
  ProblemSection,
  FeaturesBento,
  HowItWorksCondensed,
  UseCasesTeaser,
  Transparency,
  FaqPreview,
} from "@/components/landing/home-sections";
import { FinalCta } from "@/components/marketing/final-cta";
import { siteConfig } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      sameAs: [siteConfig.social.x, siteConfig.social.linkedin, siteConfig.social.github],
    },
    {
      "@type": "SoftwareApplication",
      name: siteConfig.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: siteConfig.description,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <ProofStrip />
      <ProblemSection />
      <FeaturesBento />
      <HowItWorksCondensed />
      <UseCasesTeaser />
      <Transparency />
      <FaqPreview />
      <FinalCta />
    </>
  );
}
