import { getDbUser } from "@/lib/current-user";
import { listSpeakerSummary } from "@/lib/speakers";
import { PageHeader } from "@/components/app/page-header";
import { SpeakersManager } from "@/components/app/speakers-manager";

export default async function SpeakersPage() {
  const user = await getDbUser();
  const speakers = user ? await listSpeakerSummary(user.id) : [];

  return (
    <main className="flex-1 p-6 md:p-8">
      <PageHeader
        title="Speakers"
        description="Manage who said what - rename or merge speakers across your recordings."
      />
      <div className="mt-6">
        <SpeakersManager speakers={speakers} />
      </div>
    </main>
  );
}
