import { PageHeader } from "@/components/app/page-header";

export default function RecordPage() {
  return (
    <main className="flex-1 p-6 md:p-8">
      <PageHeader
        title="Record"
        description="Start a live recording — Murmur captures, transcribes, and summarizes as you speak."
      />
    </main>
  );
}
