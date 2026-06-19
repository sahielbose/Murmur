import {
  and,
  eq,
  isNull,
  getDb,
  highlights,
  recordings,
  users,
} from "@murmur/db";

export type DigestItem = {
  recordingId: string | null;
  recordingTitle: string;
  text: string;
};

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Resurfacing: pick up to `count` past commitments to bring back, deterministic
 * per (user, day), and store them as the user's single active "digest"
 * highlight. Never sends anything - surfacing only (MURMUR_CONTEXT.md §10).
 */
export async function buildDigestForUser(
  userId: string,
  dateKey: string,
  count = 3,
  salt = "",
): Promise<DigestItem[]> {
  const db = getDb();
  const rows = await db
    .select({
      recordingId: highlights.recordingId,
      payload: highlights.payload,
      title: recordings.title,
    })
    .from(highlights)
    .innerJoin(recordings, eq(highlights.recordingId, recordings.id))
    .where(
      and(
        eq(highlights.userId, userId),
        eq(highlights.kind, "commitment"),
        isNull(highlights.dismissedAt),
        isNull(recordings.deletedAt),
      ),
    );

  const rng = mulberry32(hashStr(`${dateKey}:${userId}:${salt}`));
  const items: DigestItem[] = rows
    .map((r) => ({ r, k: rng() }))
    .sort((a, b) => a.k - b.k)
    .slice(0, count)
    .map(({ r }) => ({
      recordingId: r.recordingId,
      recordingTitle: r.title,
      text: String((r.payload as { text?: string }).text ?? ""),
    }));

  // Keep one active digest per user: clear undismissed ones, insert today's.
  await db
    .delete(highlights)
    .where(
      and(
        eq(highlights.userId, userId),
        eq(highlights.kind, "digest"),
        isNull(highlights.dismissedAt),
      ),
    );
  if (items.length > 0) {
    await db.insert(highlights).values({
      userId,
      recordingId: null,
      kind: "digest",
      payload: { date: dateKey, items },
    });
  }
  return items;
}

/** Cron body: build today's resurfacing digest for every user. */
export async function generateDailyDigests(dateKey: string): Promise<number> {
  const db = getDb();
  const allUsers = await db.select({ id: users.id }).from(users);
  let built = 0;
  for (const u of allUsers) {
    const items = await buildDigestForUser(u.id, dateKey);
    if (items.length > 0) built++;
  }
  return built;
}
