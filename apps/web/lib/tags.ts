import {
  and,
  asc,
  count,
  eq,
  getDb,
  tags,
  recordingTags,
  type Tag,
} from "@murmur/db";

export async function listTagsForUser(userId: string): Promise<Tag[]> {
  const db = getDb();
  return db
    .select()
    .from(tags)
    .where(eq(tags.userId, userId))
    .orderBy(asc(tags.name));
}

export type TagWithCount = Tag & { recordingCount: number };

/** Tags with how many recordings each is on (for the tags manager). */
export async function listTagsWithCounts(
  userId: string,
): Promise<TagWithCount[]> {
  const db = getDb();
  const rows = await db
    .select({ tag: tags, n: count(recordingTags.recordingId) })
    .from(tags)
    .leftJoin(recordingTags, eq(recordingTags.tagId, tags.id))
    .where(eq(tags.userId, userId))
    .groupBy(tags.id)
    .orderBy(asc(tags.name));
  return rows.map((r) => ({ ...r.tag, recordingCount: r.n }));
}

export async function getTagForUser(
  userId: string,
  id: string,
): Promise<Tag | undefined> {
  const db = getDb();
  const [t] = await db
    .select()
    .from(tags)
    .where(and(eq(tags.id, id), eq(tags.userId, userId)))
    .limit(1);
  return t;
}
