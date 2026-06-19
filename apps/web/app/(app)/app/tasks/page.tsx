import { getDbUser } from "@/lib/current-user";
import { listTasksForUser } from "@/lib/action-items";
import { PageHeader } from "@/components/app/page-header";
import { TasksHub } from "@/components/app/tasks-hub";

export default async function TasksPage() {
  const user = await getDbUser();
  const tasks = user ? await listTasksForUser(user.id) : [];

  return (
    <main className="flex-1 p-6 md:p-8">
      <PageHeader
        title="Tasks"
        description="Every action item Murmur found, across all your recordings."
      />
      <div className="mt-6">
        <TasksHub
          tasks={tasks.map((t) => ({
            id: t.id,
            text: t.text,
            status: t.status,
            owner: t.owner,
            dueAt: t.dueAt?.toISOString() ?? null,
            recording: { id: t.recordingId, title: t.recordingTitle },
          }))}
        />
      </div>
    </main>
  );
}
