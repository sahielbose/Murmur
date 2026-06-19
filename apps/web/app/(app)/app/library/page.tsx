import { PageHeader } from "@/components/app/page-header";

export default function LibraryPage() {
  return (
    <main className="flex-1 p-6 md:p-8">
      <PageHeader
        title="Library"
        description="Every conversation you've captured — searchable and filterable by tag, date, and status."
      />
    </main>
  );
}
