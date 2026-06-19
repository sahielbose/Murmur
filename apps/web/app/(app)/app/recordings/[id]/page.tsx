import { PageHeader } from "@/components/app/page-header";

export default async function RecordingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="flex-1 p-6 md:p-8">
      <PageHeader
        title="Recording"
        description="Summary, transcript, action items, and a mind map for this conversation."
      />
      <p className="mt-4 text-sm text-fg-subtle">Recording ID: {id}</p>
    </main>
  );
}
