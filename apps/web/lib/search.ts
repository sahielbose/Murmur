import {
  and,
  eq,
  ilike,
  isNull,
  getDb,
  recordings,
  transcriptSegments,
  summaries,
} from "@murmur/db";

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
