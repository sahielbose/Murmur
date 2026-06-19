import { getDbUser } from "@/lib/current-user";
import { listTrashedForUser } from "@/lib/recordings";
import { PageHeader } from "@/components/app/page-header";
import { TrashView } from "@/components/app/trash-view";

export default async function TrashPage() {
  const user = await getDbUser();
  const items = user ? await listTrashedForUser(user.id) : [];

  return (
    <main className="flex-1 p-6 md:p-8">
      <PageHeader
        title="Trash"
        description="Recently deleted recordings. Restore them, or remove them for good."
      />
      <div className="mt-6">
        <TrashView
          items={items.map((r) => ({
            id: r.id,
            title: r.title,
            durationSec: r.durationSec,
            deletedAt: r.deletedAt?.toISOString() ?? null,
          }))}
        />
      </div>
    </main>
  );
}
