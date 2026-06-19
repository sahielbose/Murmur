import { NextResponse, type NextRequest } from "next/server";
import { and, eq, getDb, tags, recordingTags } from "@murmur/db";
import { getDbUser } from "@/lib/current-user";
import { getRecordingForUser } from "@/lib/recordings";
import { getTagForUser } from "@/lib/tags";

type Body = { tagId?: string; name?: string; color?: string };

/** Assign a tag to a recording (creating it from `name` if needed). */
export async function POST(
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
  const db = getDb();

  let tagId = body.tagId ?? null;
  if (!tagId && body.name?.trim()) {
    const name = body.name.trim();
    const [created] = await db
      .insert(tags)
      .values({ userId: user.id, name, color: body.color ?? "#71717A" })
      .onConflictDoNothing()
      .returning();
    if (created) {
      tagId = created.id;
    } else {
      const [existing] = await db
        .select()
        .from(tags)
        .where(and(eq(tags.userId, user.id), eq(tags.name, name)))
        .limit(1);
      tagId = existing?.id ?? null;
    }
  }
  if (!tagId) {
    return NextResponse.json(
      { error: "tagId or name required" },
      {
        status: 400,
      },
    );
  }

  await db
    .insert(recordingTags)
    .values({ recordingId: id, tagId })
    .onConflictDoNothing();

  return NextResponse.json(await getTagForUser(user.id, tagId));
}

export async function DELETE(
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
  if (!body.tagId) {
    return NextResponse.json({ error: "tagId required" }, { status: 400 });
  }
  await getDb()
    .delete(recordingTags)
    .where(
      and(
        eq(recordingTags.recordingId, id),
        eq(recordingTags.tagId, body.tagId),
      ),
    );
  return NextResponse.json({ ok: true });
}
