import { AskChat } from "@/components/app/ask/ask-chat";

export default function AskPage() {
  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <AskChat initialThreads={[]} />
    </main>
  );
}
