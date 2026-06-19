import { NextResponse, type NextRequest } from "next/server";
import { getLlm } from "@murmur/ai";
import { getDbUser } from "@/lib/current-user";
import {
  addMessage,
  countTodaysAskMessages,
  FREE_ASK_DAILY_LIMIT,
  getOrCreateThread,
  retrieveContext,
} from "@/lib/ask";

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

  if (user.plan === "free") {
    const used = await countTodaysAskMessages(user.id);
    if (used >= FREE_ASK_DAILY_LIMIT) {
      return NextResponse.json(
        { error: "daily_limit", limit: FREE_ASK_DAILY_LIMIT },
        { status: 429 },
      );
    }
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

  const titleByRecording = new Map(
    context.map((c) => [c.recordingId, c.recordingTitle]),
  );
  const result = await getLlm().ask({
    question,
    context: context.map((c) => ({
      recordingId: c.recordingId,
      startMs: c.startMs,
      text: c.text,
    })),
  });
  const citations = result.citations.map((c) => ({
    recordingId: c.recordingId,
    startMs: c.startMs,
    label: titleByRecording.get(c.recordingId),
  }));

  await addMessage(thread.id, "assistant", result.answer, citations);

  return NextResponse.json({
    threadId: thread.id,
    threadTitle: thread.title,
    message: { content: result.answer, citations },
  });
}
