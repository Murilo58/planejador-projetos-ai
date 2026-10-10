import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { FrameworksSection } from "@/components/marketing/frameworks-section";
import { PrivacyNotice } from "@/components/marketing/privacy-notice";
import { FinalCta } from "@/components/marketing/final-cta";

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <FrameworksSection />
        <PrivacyNotice />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
