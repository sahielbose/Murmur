import { NextResponse, type NextRequest } from "next/server";
import { and, eq, getDb, tags } from "@murmur/db";
import { getDbUser } from "@/lib/current-user";

type PatchBody = { name?: string; color?: string };

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as PatchBody;
  const updates: PatchBody = {};
  if (typeof body.name === "string") updates.name = body.name.trim();
  if (typeof body.color === "string") updates.color = body.color;

  let updated;
  try {
    [updated] = await getDb()
      .update(tags)
      .set(updates)
      .where(and(eq(tags.id, id), eq(tags.userId, user.id)))
      .returning();
  } catch {
    // unique(userId, name) violation when renaming onto an existing tag.
    return NextResponse.json(
      { error: "a tag with that name already exists" },
      { status: 409 },
    );
  }
  if (!updated) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const [t] = await getDb()
    .delete(tags)
    .where(and(eq(tags.id, id), eq(tags.userId, user.id)))
    .returning();
  if (!t) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
