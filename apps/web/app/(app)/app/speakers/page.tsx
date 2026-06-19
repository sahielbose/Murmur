import { PageHeader } from "@/components/app/page-header";

export default function SpeakersPage() {
  return (
    <main className="flex-1 p-6 md:p-8">
      <PageHeader
        title="Speakers"
        description="Manage who said what — rename or merge speakers across your recordings."
      />
    </main>
  );
}
