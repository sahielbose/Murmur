import { PageHeader } from "@/components/app/page-header";

export default function TasksPage() {
  return (
    <main className="flex-1 p-6 md:p-8">
      <PageHeader
        title="Tasks"
        description="Every action item Murmur found, across all your recordings, with a calendar hub."
      />
    </main>
  );
}
