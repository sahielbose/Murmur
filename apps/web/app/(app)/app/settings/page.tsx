import { PageHeader } from "@/components/app/page-header";

export default function SettingsPage() {
  return (
    <main className="flex-1 p-6 md:p-8">
      <PageHeader
        title="Settings"
        description="Profile, default template and language, AI model, integrations, plan, and theme."
      />
    </main>
  );
}
