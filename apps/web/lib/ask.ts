import {
  and,
  asc,
  desc,
  eq,
  gte,
  isNull,
  count,
  cosineDistance,
  getDb,
  askThreads,
  askMessages,
  embeddings,
  recordings,
  transcriptSegments,
  type AskThread,
  type AskMessage,
  type Citation,
} from "@murmur/db";
import { getEmbeddings } from "@murmur/ai";

/** Free-tier daily Ask message cap (Pro is unlimited; MURMUR_CONTEXT.md §3.6). */
export const FREE_ASK_DAILY_LIMIT = 10;

/** Count a user's Ask questions sent today (for the free-tier limit). */
export async function countTodaysAskMessages(userId: string): Promise<number> {
  const db = getDb();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const [row] = await db
    .select({ n: count() })
    .from(askMessages)
    .innerJoin(askThreads, eq(askMessages.threadId, askThreads.id))
    .where(
      and(
        eq(askThreads.userId, userId),
        eq(askMessages.role, "user"),
        gte(askMessages.createdAt, start),
      ),
    );
  return row?.n ?? 0;
}

export type RetrievedChunk = {
  recordingId: string;
  recordingTitle: string;
  startMs: number;
  text: string;
};

/** Scoped semantic retrieval over pgvector (library-wide or one recording). */
export async function retrieveContext(
  userId: string,
  question: string,
  opts: { recordingId?: string | null } = {},
  limit = 6,
): Promise<RetrievedChunk[]> {
  const db = getDb();
  const queryVec = await getEmbeddings().embedOne(question);
  // An all-zero query vector (e.g. an all-stopword question) makes
  // cosineDistance NaN and returns arbitrary chunks — skip retrieval instead.
  if (queryVec.every((v) => v === 0)) return [];

  const filters = [eq(embeddings.userId, userId), isNull(recordings.deletedAt)];
  if (opts.recordingId) {
    filters.push(eq(embeddings.recordingId, opts.recordingId));
  }

  const rows = await db
    .select({
      recordingId: embeddings.recordingId,
      title: recordings.title,
      chunkText: embeddings.chunkText,
      startMs: transcriptSegments.startMs,
    })
    .from(embeddings)
    .innerJoin(recordings, eq(embeddings.recordingId, recordings.id))
    .leftJoin(
      transcriptSegments,
      eq(embeddings.segmentId, transcriptSegments.id),
    )
    .where(and(...filters))
    .orderBy(cosineDistance(embeddings.embedding, queryVec))
    .limit(limit);

  return rows.map((r) => ({
    recordingId: r.recordingId,
    recordingTitle: r.title,
    startMs: r.startMs ?? 0,
    text: r.chunkText,
  }));
}

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
