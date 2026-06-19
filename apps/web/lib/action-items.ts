import {
  and,
  asc,
  desc,
  eq,
  getDb,
  isNull,
  actionItems,
  recordings,
  type ActionItem,
} from "@murmur/db";

export async function getActionItemsForRecording(
  recordingId: string,
): Promise<ActionItem[]> {
  const db = getDb();
  return db
    .select()
    .from(actionItems)
    .where(eq(actionItems.recordingId, recordingId))
    .orderBy(asc(actionItems.createdAt));
}

export type TaskRow = ActionItem & {
  recordingTitle: string;
};

/** All of a user's action items with their recording title (global Tasks view). */
export async function listTasksForUser(userId: string): Promise<TaskRow[]> {
  const db = getDb();
  const rows = await db
    .select({
      item: actionItems,
      recordingTitle: recordings.title,
    })
    .from(actionItems)
    .innerJoin(recordings, eq(actionItems.recordingId, recordings.id))
    .where(and(eq(actionItems.userId, userId), isNull(recordings.deletedAt)))
    .orderBy(asc(actionItems.status), desc(actionItems.createdAt));
  return rows.map((r) => ({ ...r.item, recordingTitle: r.recordingTitle }));
}
