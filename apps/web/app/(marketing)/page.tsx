import { getSession } from "@/lib/auth";
import { Hero } from "@/components/marketing/hero";
import { RoleStrip } from "@/components/marketing/role-strip";
import { InPerson } from "@/components/marketing/in-person";
import { FeatureCarousel } from "@/components/marketing/feature-carousel";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Testimonials } from "@/components/marketing/testimonials";
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
        <Faq />
      </Reveal>
      <ClosingCta isAuthed={isAuthed} />
    </main>
  );
}
