import { PageHeader } from "@/components/app/page-header";

export default function TrashPage() {
  return (
    <main className="flex-1 p-6 md:p-8">
      <PageHeader
        title="Trash"
        description="Recently deleted recordings. Restore them, or remove them for good."
      />
    </main>
  );
}
