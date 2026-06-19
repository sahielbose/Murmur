import { NextResponse, type NextRequest } from "next/server";
import { and, eq, getDb, recordingSpeakers } from "@murmur/db";
import { getDbUser } from "@/lib/current-user";
import { getRecordingForUser } from "@/lib/recordings";

type Body = { from?: string; to?: string };

/**
 * Rename a speaker within one recording; the new name propagates across all of
 * that speaker's turns (MURMUR_CONTEXT.md §3.2).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!(await getRecordingForUser(user.id, id))) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
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

  await getDb()
    .update(recordingSpeakers)
    .set({ displayName: to })
    .where(
      and(
        eq(recordingSpeakers.recordingId, id),
        eq(recordingSpeakers.displayName, from),
      ),
    );

  return NextResponse.json({ ok: true });
}
