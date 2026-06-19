import {
  and,
  asc,
  desc,
  eq,
  isNull,
  getDb,
  recordings,
  recordingTags,
  summaries,
  tags,
  type Recording,
  type Summary,
  type Tag,
} from "@murmur/db";

/** Fetch a non-deleted recording owned by the user. */
export async function getRecordingForUser(
  userId: string,
  id: string,
): Promise<Recording | undefined> {
  const db = getDb();
  const [rec] = await db
    .select()
    .from(recordings)
    .where(
      and(
        eq(recordings.id, id),
        eq(recordings.userId, userId),
        isNull(recordings.deletedAt),
      ),
    )
    .limit(1);
  return rec;
}

export async function getRecordingTags(recordingId: string): Promise<Tag[]> {
  const db = getDb();
  const rows = await db
    .select({ tag: tags })
    .from(recordingTags)
    .innerJoin(tags, eq(recordingTags.tagId, tags.id))
    .where(eq(recordingTags.recordingId, recordingId))
    .orderBy(asc(tags.name));
  return rows.map((r) => r.tag);
}

export async function getPrimarySummary(
  recordingId: string,
): Promise<Summary | undefined> {
  const db = getDb();
  const [s] = await db
    .select()
    .from(summaries)
    .where(
      and(
        eq(summaries.recordingId, recordingId),
        eq(summaries.isPrimary, true),
      ),
    )
    .limit(1);
  return s;
}

/** List a user's non-deleted recordings, newest first. */
export async function listRecordingsForUser(
  userId: string,
): Promise<Recording[]> {
  const db = getDb();
  return db
    .select()
    .from(recordings)
    .where(and(eq(recordings.userId, userId), isNull(recordings.deletedAt)))
    .orderBy(desc(recordings.recordedAt), desc(recordings.createdAt));
}
