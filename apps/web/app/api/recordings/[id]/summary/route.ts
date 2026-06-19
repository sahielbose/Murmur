import { NextResponse, type NextRequest } from "next/server";
import { and, eq, getDb, summaries } from "@murmur/db";
import { getDbUser } from "@/lib/current-user";
import { getRecordingForUser } from "@/lib/recordings";

type PatchBody = { summaryId?: string; contentMd?: string };

/** Update an edited summary's content (MURMUR_UI.md §10.5). */
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

  const body = (await req.json().catch(() => ({}))) as PatchBody;
  if (!body.summaryId || typeof body.contentMd !== "string") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const [s] = await getDb()
    .update(summaries)
    .set({ contentMd: body.contentMd })
    .where(and(eq(summaries.id, body.summaryId), eq(summaries.recordingId, id)))
    .returning();

  if (!s) {
    return NextResponse.json({ error: "summary not found" }, { status: 404 });
  }
  return NextResponse.json({ id: s.id });
}
