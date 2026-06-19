import { getSession } from "@/lib/auth";
import { Hero } from "@/components/marketing/hero";

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
    </main>
  );
}
