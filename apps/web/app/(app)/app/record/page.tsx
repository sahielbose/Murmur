import { RecordScreen } from "@/components/app/record/record-screen";
import { getDbUser } from "@/lib/current-user";

export default async function RecordPage() {
  const user = await getDbUser();
  const consented = Boolean(user?.settings.consentAcknowledgedAt);

  return (
    <main className="flex flex-1 flex-col">
      <RecordScreen consented={consented} />
    </main>
  );
}
