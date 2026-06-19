import {
  and,
  asc,
  eq,
  isNull,
  getDb,
  combineGroups,
  combineMembers,
  recordings,
  summaries,
  type CombineGroup,
} from "@murmur/db";

export type CombineMemberView = {
  recordingId: string;
  title: string;
  recordedAt: Date | null;
  summaryMd: string | null;
};

export type CombineGroupView = {
  group: CombineGroup;
  members: CombineMemberView[];
};

export async function getCombineGroup(
  userId: string,
  id: string,
): Promise<CombineGroupView | null> {
  const db = getDb();
  const [group] = await db
    .select()
    .from(combineGroups)
    .where(and(eq(combineGroups.id, id), eq(combineGroups.userId, userId)))
    .limit(1);
  if (!group) return null;

  const rows = await db
    .select({
      recordingId: recordings.id,
      title: recordings.title,
      recordedAt: recordings.recordedAt,
      summaryMd: summaries.contentMd,
    })
    .from(combineMembers)
    .innerJoin(recordings, eq(combineMembers.recordingId, recordings.id))
    .leftJoin(
      summaries,
      and(
        eq(summaries.recordingId, recordings.id),
        eq(summaries.isPrimary, true),
      ),
    )
    .where(and(eq(combineMembers.groupId, id), isNull(recordings.deletedAt)))
    .orderBy(asc(combineMembers.order));

  return { group, members: rows };
}
