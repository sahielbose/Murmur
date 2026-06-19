import { PageHeader } from "@/components/app/page-header";

export default function AskPage() {
  return (
    <main className="flex-1 p-6 md:p-8">
      <PageHeader
        title="Ask Murmur"
        description="Ask questions across your recordings and get answers that link straight to the moment."
      />
    </main>
  );
}
