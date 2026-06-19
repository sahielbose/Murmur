import { getDbUser } from "@/lib/current-user";
import { listTemplatesForUser } from "@/lib/templates";
import { PageHeader } from "@/components/app/page-header";
import { TemplatesManager } from "@/components/app/templates-manager";

export default async function TemplatesPage() {
  const user = await getDbUser();
  const templates = user ? await listTemplatesForUser(user.id) : [];

  return (
    <main className="flex-1 p-6 md:p-8">
      <PageHeader
        title="Templates"
        description="System and custom summary styles — meeting notes, a doctor's visit, a sales call, and more."
      />
      <div className="mt-6">
        <TemplatesManager
          templates={templates.map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            promptBody: t.promptBody,
            isSystem: t.isSystem,
          }))}
        />
      </div>
    </main>
  );
}
