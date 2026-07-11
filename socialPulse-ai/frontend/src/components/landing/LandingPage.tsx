/**
 * src/components/landing/LandingPage.tsx
 * Root orchestrator for all landing page sections.
 */
'use client';

import { LandingNav }        from './LandingNav';
import { HeroSection }       from './HeroSection';
import { StatsSection }      from './StatsSection';
import { FeaturesSection }   from './FeaturesSection';
import { IBMStackSection }   from './IBMStackSection';
import { ArchSection }       from './ArchSection';
import { PricingSection }    from './PricingSection';
import { TestimonialsSection } from './TestimonialsSection';
import { FAQSection }        from './FAQSection';
import { CTASection }        from './CTASection';
import { LandingFooter }     from './LandingFooter';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-base text-text-primary antialiased">
      <LandingNav />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <IBMStackSection />
        <ArchSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
