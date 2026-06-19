import { NextResponse, type NextRequest } from "next/server";
import {
  and,
  eq,
  inArray,
  isNull,
  getDb,
  recordings,
  combineGroups,
  combineMembers,
} from "@murmur/db";
import { getDbUser } from "@/lib/current-user";

type Body = { recordingIds?: string[]; title?: string };

/** Combine recordings into one group, keeping provenance (MURMUR_CONTEXT.md §3.8). */
export async function POST(req: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as Body;
  const ids = (body.recordingIds ?? []).filter(Boolean);
  if (ids.length < 2) {
    return NextResponse.json(
      { error: "select at least two recordings" },
      { status: 400 },
    );
  }

  const db = getDb();
  const owned = await db
    .select({ id: recordings.id, title: recordings.title })
    .from(recordings)
    .where(
      and(
        eq(recordings.userId, user.id),
        inArray(recordings.id, ids),
        isNull(recordings.deletedAt),
      ),
    );
  if (owned.length < 2) {
    return NextResponse.json(
      { error: "recordings not found" },
      { status: 400 },
    );
  }

  const ownedIds = new Set(owned.map((o) => o.id));
  const orderedIds = ids.filter((id) => ownedIds.has(id));
  const title =
    body.title?.trim() ||
    `Combined: ${owned
      .slice(0, 2)
      .map((o) => o.title)
      .join(" + ")}`;

  const [group] = await db
    .insert(combineGroups)
    .values({ userId: user.id, title })
    .returning();
  await db.insert(combineMembers).values(
    orderedIds.map((rid, i) => ({
      groupId: group!.id,
      recordingId: rid,
      order: i,
    })),
  );

  return NextResponse.json({ id: group!.id });
}
