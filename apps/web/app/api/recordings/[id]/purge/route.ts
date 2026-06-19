import { NextResponse, type NextRequest } from "next/server";
import { and, eq, getDb, recordings } from "@murmur/db";
import { getStorage } from "@murmur/ai";
import { getDbUser } from "@/lib/current-user";

/** Permanently delete a recording (and its audio) from the recycle bin. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const db = getDb();
  const [rec] = await db
    .delete(recordings)
    .where(and(eq(recordings.id, id), eq(recordings.userId, user.id)))
    .returning();
  if (!rec) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (rec.audioKey) {
    await getStorage()
      .remove(rec.audioKey)
      .catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
