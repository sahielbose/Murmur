import { PageHeader } from "@/components/app/page-header";

export default function UploadPage() {
  return (
    <main className="flex-1 p-6 md:p-8">
      <PageHeader
        title="Upload"
        description="Drop in an audio file and Murmur will transcribe, label speakers, and summarize it."
      />
    </main>
  );
}
