import { getDbUser } from "@/lib/current-user";
import { listThreads } from "@/lib/ask";
import { AskChat } from "@/components/app/ask/ask-chat";

export default async function AskPage() {
  const user = await getDbUser();
  const threads = user ? await listThreads(user.id) : [];

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <AskChat
        initialThreads={threads.map((t) => ({ id: t.id, title: t.title }))}
      />
    </main>
  );
}
