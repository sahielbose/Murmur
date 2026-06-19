import { NextResponse, type NextRequest } from "next/server";
import { and, eq, getDb, recordings } from "@murmur/db";
import { getDbUser } from "@/lib/current-user";

/** Restore a recording from the recycle bin. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const [rec] = await getDb()
    .update(recordings)
    .set({ deletedAt: null })
    .where(and(eq(recordings.id, id), eq(recordings.userId, user.id)))
    .returning();
  if (!rec) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
