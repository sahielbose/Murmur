import { getDbUser } from "@/lib/current-user";
import { listTagsWithCounts } from "@/lib/tags";
import { PageHeader } from "@/components/app/page-header";
import { TagsManager } from "@/components/app/tags-manager";

export default async function TagsPage() {
  const user = await getDbUser();
  const tags = user ? await listTagsWithCounts(user.id) : [];

  return (
    <main className="flex-1 p-6 md:p-8">
      <PageHeader
        title="Tags"
        description="Organize your recordings with colored tags."
      />
      <div className="mt-6">
        <TagsManager
          tags={tags.map((t) => ({
            id: t.id,
            name: t.name,
            color: t.color,
            recordingCount: t.recordingCount,
          }))}
        />
      </div>
    </main>
  );
}
