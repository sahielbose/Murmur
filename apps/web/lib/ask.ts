import {
  and,
  asc,
  desc,
  eq,
  getDb,
  askThreads,
  askMessages,
  type AskThread,
  type AskMessage,
  type Citation,
} from "@murmur/db";

export async function getOrCreateThread(
  userId: string,
  opts: {
    threadId?: string | null;
    title: string;
    scope?: "library" | "recording";
    scopeRecordingId?: string | null;
  },
): Promise<AskThread> {
  const db = getDb();
  if (opts.threadId) {
    const [t] = await db
      .select()
      .from(askThreads)
      .where(
        and(eq(askThreads.id, opts.threadId), eq(askThreads.userId, userId)),
      )
      .limit(1);
    if (t) return t;
  }
  const [created] = await db
    .insert(askThreads)
    .values({
      userId,
      title: opts.title,
      scope: opts.scope ?? "library",
      scopeRecordingId: opts.scopeRecordingId ?? null,
    })
    .returning();
  return created!;
}

export async function addMessage(
  threadId: string,
  role: "user" | "assistant",
  content: string,
  citations: Citation[] = [],
): Promise<AskMessage> {
  const db = getDb();
  const [m] = await db
    .insert(askMessages)
    .values({ threadId, role, content, citations })
    .returning();
  await db
    .update(askThreads)
    .set({ updatedAt: new Date() })
    .where(eq(askThreads.id, threadId));
  return m!;
}

export async function listThreads(userId: string): Promise<AskThread[]> {
  const db = getDb();
  return db
    .select()
    .from(askThreads)
    .where(eq(askThreads.userId, userId))
    .orderBy(desc(askThreads.updatedAt));
}

export async function getThreadMessages(
  userId: string,
  threadId: string,
): Promise<AskMessage[] | null> {
  const db = getDb();
  const [t] = await db
    .select()
    .from(askThreads)
    .where(and(eq(askThreads.id, threadId), eq(askThreads.userId, userId)))
    .limit(1);
  if (!t) return null;
  return db
    .select()
    .from(askMessages)
    .where(eq(askMessages.threadId, threadId))
    .orderBy(asc(askMessages.createdAt));
}
