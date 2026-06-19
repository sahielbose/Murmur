import { NextResponse, type NextRequest } from "next/server";
import { and, eq, getDb, templates } from "@murmur/db";
import { getDbUser } from "@/lib/current-user";

type PatchBody = { name?: string; description?: string; promptBody?: string };

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
  if ("description" in body)
    updates.description = body.description?.trim() || undefined;
  if (typeof body.promptBody === "string")
    updates.promptBody = body.promptBody.trim();

  const [t] = await getDb()
    .update(templates)
    .set(updates)
    .where(
      and(
        eq(templates.id, id),
        eq(templates.userId, user.id),
        eq(templates.isSystem, false),
      ),
    )
    .returning();
  if (!t) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ id: t.id });
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
    .delete(templates)
    .where(
      and(
        eq(templates.id, id),
        eq(templates.userId, user.id),
        eq(templates.isSystem, false),
      ),
    )
    .returning();
  if (!t) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
