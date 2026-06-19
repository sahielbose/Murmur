import { and, desc, eq, isNull, getDb, highlights } from "@murmur/db";

export type DigestItem = {
  recordingId: string | null;
  recordingTitle: string;
  text: string;
};

export type DigestView = {
  id: string;
  date: string;
  items: DigestItem[];
};

/** The user's current (undismissed) resurfacing digest, if any. */
export async function getActiveDigest(
  userId: string,
): Promise<DigestView | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(highlights)
    .where(
      and(
        eq(highlights.userId, userId),
        eq(highlights.kind, "digest"),
        isNull(highlights.dismissedAt),
      ),
    )
    .orderBy(desc(highlights.surfacedAt))
    .limit(1);
  if (!row) return null;
  const payload = row.payload as { date?: string; items?: DigestItem[] };
  return { id: row.id, date: payload.date ?? "", items: payload.items ?? [] };
}
