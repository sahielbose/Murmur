import { getSession } from "@/lib/auth";
import { Hero } from "@/components/marketing/hero";
import { RoleStrip } from "@/components/marketing/role-strip";
import { InPerson } from "@/components/marketing/in-person";
import { FeatureCarousel } from "@/components/marketing/feature-carousel";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Testimonials } from "@/components/marketing/testimonials";
import { PricingTable } from "@/components/marketing/pricing-table";
import { Faq } from "@/components/marketing/faq";

/**
 * Landing page (MURMUR_UI.md §7). Sections are composed top-to-bottom; all copy
 * is original (§13). Built across Phase 17.
 */
export default async function LandingPage() {
  const session = await getSession();
  const isAuthed = Boolean(session);

  return (
    <main className="flex-1">
      <Hero isAuthed={isAuthed} />
      <RoleStrip />
      <InPerson />
      <FeatureCarousel />
      <HowItWorks />
      <Testimonials />
      <section id="pricing" className="border-t border-border bg-bg py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="font-serif text-3xl leading-tight tracking-tight text-fg-strong sm:text-4xl">
              Simple pricing.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-fg-muted">
              Start free. Upgrade when conversations become your job.
            </p>
          </div>
          <div className="mt-12">
            <PricingTable />
          </div>
        </div>
      </section>
      <Faq />
    </main>
  );
}
