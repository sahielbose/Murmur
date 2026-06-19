import {
  and,
  count,
  desc,
  eq,
  isNull,
  getDb,
  recordings,
  recordingSpeakers,
} from "@murmur/db";

export type SpeakerSummary = { name: string; recordingCount: number };

/** Distinct speakers across the user's recordings, by display name. */
export async function listSpeakerSummary(
  userId: string,
): Promise<SpeakerSummary[]> {
  const db = getDb();
  const rows = await db
    .select({
      name: recordingSpeakers.displayName,
      n: count(recordingSpeakers.recordingId),
    })
    .from(recordingSpeakers)
    .innerJoin(recordings, eq(recordingSpeakers.recordingId, recordings.id))
    .where(and(eq(recordings.userId, userId), isNull(recordings.deletedAt)))
    .groupBy(recordingSpeakers.displayName)
    .orderBy(desc(count(recordingSpeakers.recordingId)));
  return rows.map((r) => ({ name: r.name, recordingCount: r.n }));
}
