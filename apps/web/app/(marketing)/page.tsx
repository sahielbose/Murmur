import { getSession } from "@/lib/auth";
import { Hero } from "@/components/marketing/hero";
import { RoleStrip } from "@/components/marketing/role-strip";
import { InPerson } from "@/components/marketing/in-person";
import { FeatureCarousel } from "@/components/marketing/feature-carousel";

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
    </main>
  );
}
