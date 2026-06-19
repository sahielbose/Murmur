import { getDbUser } from "@/lib/current-user";
import {
  countTodaysAskMessages,
  FREE_ASK_DAILY_LIMIT,
  listThreads,
} from "@/lib/ask";
import { listRecordingsForUser } from "@/lib/recordings";
import { AskChat } from "@/components/app/ask/ask-chat";

export default async function AskPage() {
  const user = await getDbUser();
  const threads = user ? await listThreads(user.id) : [];
  const recordings = user ? await listRecordingsForUser(user.id) : [];
  const usedToday = user ? await countTodaysAskMessages(user.id) : 0;

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <AskChat
        initialThreads={threads.map((t) => ({ id: t.id, title: t.title }))}
        recordings={recordings
          .filter((r) => r.status === "done")
          .map((r) => ({ id: r.id, title: r.title }))}
        plan={user?.plan ?? "free"}
        usedToday={usedToday}
        dailyLimit={FREE_ASK_DAILY_LIMIT}
      />
    </main>
  );
}
