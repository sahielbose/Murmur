import {
  and,
  asc,
  desc,
  eq,
  isNull,
  getDb,
  recordings,
  recordingTags,
  tags,
  type Recording,
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
