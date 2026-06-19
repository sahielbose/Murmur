import { getSession } from "@/lib/auth";
import { Hero } from "@/components/marketing/hero";
import { RoleStrip } from "@/components/marketing/role-strip";
import { InPerson } from "@/components/marketing/in-person";
import { FeatureCarousel } from "@/components/marketing/feature-carousel";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Testimonials } from "@/components/marketing/testimonials";
import { PricingTable } from "@/components/marketing/pricing-table";
import { Faq } from "@/components/marketing/faq";
import { Reveal } from "@/components/marketing/reveal";
import { ClosingCta } from "@/components/marketing/closing-cta";

/**
 * Landing page (MURMUR_UI.md §7). Sections compose top-to-bottom with scroll
 * reveals; all copy is original (§13).
 */
export default async function LandingPage() {
  const session = await getSession();
  const isAuthed = Boolean(session);

  return (
    <main className="flex-1">
      <Hero isAuthed={isAuthed} />
      <Reveal>
        <RoleStrip />
      </Reveal>
      <Reveal>
        <InPerson />
      </Reveal>
      <Reveal>
        <FeatureCarousel />
      </Reveal>
      <Reveal>
        <HowItWorks />
      </Reveal>
      <Reveal>
        <Testimonials />
      </Reveal>
      <Reveal>
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
      </Reveal>
      <Reveal>
        <Faq />
      </Reveal>
      <ClosingCta isAuthed={isAuthed} />
    </main>
  );
}
