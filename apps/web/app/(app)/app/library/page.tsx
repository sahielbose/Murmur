import { getDbUser } from "@/lib/current-user";
import { listLibrary } from "@/lib/recordings";
import { PageHeader } from "@/components/app/page-header";
import { LibraryView } from "@/components/app/library-view";
import { BulkExportButton } from "@/components/app/bulk-export-button";

export default async function LibraryPage() {
  const user = await getDbUser();
  const recordings = user ? await listLibrary(user.id) : [];

  return (
    <main className="flex-1 p-6 md:p-8">
      <PageHeader
        title="Library"
        description="Every conversation you've captured."
      >
        {recordings.length > 0 ? <BulkExportButton /> : null}
      </PageHeader>
      <div className="mt-6">
        {recordings.length === 0 ? (
          <p className="text-sm text-fg-muted">
            No recordings yet. Start one, or upload a file.
          </p>
        ) : (
          <LibraryView recordings={recordings} />
        )}
      </div>
    </main>
  );
}
