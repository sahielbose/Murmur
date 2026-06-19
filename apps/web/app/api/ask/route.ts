import { NextResponse, type NextRequest } from "next/server";
import { getDbUser } from "@/lib/current-user";
import { addMessage, getOrCreateThread, retrieveContext } from "@/lib/ask";

type AskBody = {
  threadId?: string | null;
  question?: string;
  scope?: "library" | "recording";
  scopeRecordingId?: string | null;
};

/**
 * Ask Murmur (MURMUR_CONTEXT.md §8). Persists the turn; RAG retrieval and the
 * grounded answer are layered on in the next commits.
 */
export async function POST(req: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as AskBody;
  const question = body.question?.trim();
  if (!question) {
    return NextResponse.json(
      { error: "question is required" },
      { status: 400 },
    );
  }

  const thread = await getOrCreateThread(user.id, {
    threadId: body.threadId,
    title: question.slice(0, 60),
    scope: body.scope,
    scopeRecordingId: body.scopeRecordingId,
  });
  await addMessage(thread.id, "user", question);

  const context = await retrieveContext(user.id, question, {
    recordingId: body.scope === "recording" ? body.scopeRecordingId : null,
  });
  const citations = context.slice(0, 3).map((c) => ({
    recordingId: c.recordingId,
    startMs: c.startMs,
    label: c.recordingTitle,
  }));

  const answer = context.length
    ? `From your recordings: ${context[0]!.text}`
    : "I don't see that in your recordings.";
  await addMessage(thread.id, "assistant", answer, citations);

  return NextResponse.json({
    threadId: thread.id,
    threadTitle: thread.title,
    message: { content: answer, citations },
  });
}
