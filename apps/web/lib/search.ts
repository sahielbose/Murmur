import {
  and,
  eq,
  ilike,
  isNull,
  sql,
  cosineDistance,
  getDb,
  recordings,
  transcriptSegments,
  summaries,
  embeddings,
} from "@murmur/db";
import { getEmbeddings } from "@murmur/ai";

export type SearchKind = "title" | "transcript" | "summary" | "semantic";

export type SearchResult = {
  recordingId: string;
  recordingTitle: string;
  kind: SearchKind;
  snippet: string;
  startMs: number | null;
  score: number;
};

function cleanSnippet(s: string, max = 160): string {
  return s
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_>`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** Keyword search over titles, transcript segments, and summaries (ILIKE). */
export async function keywordSearch(
  userId: string,
  q: string,
): Promise<SearchResult[]> {
  const db = getDb();
  const like = `%${q}%`;
  const results: SearchResult[] = [];

  const titleRows = await db
    .select({ id: recordings.id, title: recordings.title })
    .from(recordings)
    .where(
      and(
        eq(recordings.userId, userId),
        isNull(recordings.deletedAt),
        ilike(recordings.title, like),
      ),
    )
    .limit(10);
  for (const r of titleRows) {
    results.push({
      recordingId: r.id,
      recordingTitle: r.title,
      kind: "title",
      snippet: r.title,
      startMs: null,
      score: 1,
    });
  }

  const segRows = await db
    .select({
      recordingId: transcriptSegments.recordingId,
      title: recordings.title,
      text: transcriptSegments.text,
      startMs: transcriptSegments.startMs,
    })
    .from(transcriptSegments)
    .innerJoin(recordings, eq(transcriptSegments.recordingId, recordings.id))
    .where(
      and(
        eq(recordings.userId, userId),
        isNull(recordings.deletedAt),
        ilike(transcriptSegments.text, like),
      ),
    )
    .limit(20);
  for (const r of segRows) {
    results.push({
      recordingId: r.recordingId,
      recordingTitle: r.title,
      kind: "transcript",
      snippet: cleanSnippet(r.text),
      startMs: r.startMs,
      score: 0.9,
    });
  }

  const sumRows = await db
    .select({
      recordingId: summaries.recordingId,
      title: recordings.title,
      content: summaries.contentMd,
    })
    .from(summaries)
    .innerJoin(recordings, eq(summaries.recordingId, recordings.id))
    .where(
      and(
        eq(recordings.userId, userId),
        isNull(recordings.deletedAt),
        eq(summaries.isPrimary, true),
        ilike(summaries.contentMd, like),
      ),
    )
    .limit(10);
  for (const r of sumRows) {
    results.push({
      recordingId: r.recordingId,
      recordingTitle: r.title,
      kind: "summary",
      snippet: cleanSnippet(r.content),
      startMs: null,
      score: 0.8,
    });
  }

  return results;
}

/** Hybrid search: keyword + semantic, deduped and ranked by score. */
export async function hybridSearch(
  userId: string,
  q: string,
): Promise<SearchResult[]> {
  const [keyword, semantic] = await Promise.all([
    keywordSearch(userId, q),
    semanticSearch(userId, q),
  ]);

  const byKey = new Map<string, SearchResult>();
  for (const r of [...keyword, ...semantic]) {
    const key = `${r.recordingId}:${r.startMs ?? "x"}:${r.snippet.slice(0, 48)}`;
    const existing = byKey.get(key);
    if (!existing || r.score > existing.score) byKey.set(key, r);
  }

  return Array.from(byKey.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

/** Semantic search via pgvector cosine similarity over the chunk embeddings. */
export async function semanticSearch(
  userId: string,
  q: string,
  limit = 8,
): Promise<SearchResult[]> {
  const db = getDb();
  const queryVec = await getEmbeddings().embedOne(q);
  // An all-zero query vector yields NaN distances / arbitrary rows — bail out.
  if (queryVec.every((v) => v === 0)) return [];
  const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, queryVec)})`;

  const rows = await db
    .select({
      recordingId: embeddings.recordingId,
      title: recordings.title,
      chunkText: embeddings.chunkText,
      startMs: transcriptSegments.startMs,
      similarity,
    })
    .from(embeddings)
    .innerJoin(recordings, eq(embeddings.recordingId, recordings.id))
    .leftJoin(
      transcriptSegments,
      eq(embeddings.segmentId, transcriptSegments.id),
    )
    .where(and(eq(embeddings.userId, userId), isNull(recordings.deletedAt)))
    .orderBy(cosineDistance(embeddings.embedding, queryVec))
    .limit(limit);

  return rows
    .filter((r) => r.similarity > 0.12)
    .map((r) => ({
      recordingId: r.recordingId,
      recordingTitle: r.title,
      kind: "semantic" as const,
      snippet: cleanSnippet(r.chunkText),
      startMs: r.startMs ?? null,
      score: Number(r.similarity),
    }));
}
