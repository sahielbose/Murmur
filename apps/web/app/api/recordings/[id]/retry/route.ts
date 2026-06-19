import { NextResponse, type NextRequest } from "next/server";
import { and, eq, getDb, recordings } from "@murmur/db";
import { enqueueProcessing } from "@murmur/jobs";
import { getDbUser } from "@/lib/current-user";
import { getRecordingForUser } from "@/lib/recordings";

/** Re-run the processing pipeline for a failed recording (MURMUR_UI.md §10.5). */
export async function POST(
  _req: NextRequest,
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

  await getDb()
    .update(recordings)
    .set({ status: "uploaded", error: null })
    .where(and(eq(recordings.id, id), eq(recordings.userId, user.id)));
  await enqueueProcessing(id);

  return NextResponse.json({ ok: true });
}
