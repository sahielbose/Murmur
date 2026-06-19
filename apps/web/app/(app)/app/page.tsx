import { getDbUser } from "@/lib/current-user";
import { getActiveDigest } from "@/lib/resurfacing";
import { PageHeader } from "@/components/app/page-header";
import { HighlightsCard } from "@/components/app/home/highlights-card";

export default async function AppHome() {
  const user = await getDbUser();
  const digest = user ? await getActiveDigest(user.id) : null;

  return (
    <main className="flex-1 p-6 md:p-8">
      <PageHeader
        title="Home"
        description="Commitments worth revisiting, surfaced from your past conversations."
      />
      <div className="mt-6 max-w-2xl">
        <HighlightsCard digest={digest} />
      </div>
    </main>
  );
}
