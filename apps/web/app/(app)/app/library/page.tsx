import { getDbUser } from "@/lib/current-user";
import { listLibrary } from "@/lib/recordings";
import { PageHeader } from "@/components/app/page-header";
import { RecordingCard } from "@/components/app/recording-card";

export default async function LibraryPage() {
  const user = await getDbUser();
  const recordings = user ? await listLibrary(user.id) : [];

  return (
    <main className="flex-1 p-6 md:p-8">
      <PageHeader
        title="Library"
        description="Every conversation you've captured."
      />
      {recordings.length === 0 ? (
        <p className="mt-8 text-sm text-fg-muted">
          No recordings yet. Start one, or upload a file.
        </p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recordings.map((r) => (
            <RecordingCard key={r.id} recording={r} />
          ))}
        </div>
      )}
    </main>
  );
}
