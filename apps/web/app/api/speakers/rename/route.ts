import { NextResponse, type NextRequest } from "next/server";
import {
  and,
  eq,
  inArray,
  getDb,
  recordings,
  recordingSpeakers,
} from "@murmur/db";
import { getDbUser } from "@/lib/current-user";

type Body = { from?: string; to?: string };

/**
 * Rename (or merge) a speaker across all of the user's recordings. Renaming to
 * an existing name merges them (MURMUR_CONTEXT.md §3.2).
 */
export async function POST(req: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as Body;
  const from = body.from?.trim();
  const to = body.to?.trim();
  if (!from || !to) {
    return NextResponse.json(
      { error: "from and to are required" },
      { status: 400 },
    );
  }

  const db = getDb();
  const userRecordings = db
    .select({ id: recordings.id })
    .from(recordings)
    .where(eq(recordings.userId, user.id));

  await db
    .update(recordingSpeakers)
    .set({ displayName: to })
    .where(
      and(
        eq(recordingSpeakers.displayName, from),
        inArray(recordingSpeakers.recordingId, userRecordings),
      ),
    );

  return NextResponse.json({ ok: true });
}
