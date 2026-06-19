import { NextResponse, type NextRequest } from "next/server";
import { and, eq, getDb, actionItems } from "@murmur/db";
import { getDbUser } from "@/lib/current-user";

type PatchBody = {
  status?: "open" | "done";
  owner?: string | null;
  dueAt?: string | null;
  text?: string;
};

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

  const updates: {
    status?: "open" | "done";
    owner?: string | null;
    dueAt?: Date | null;
    text?: string;
  } = {};
  if (body.status === "open" || body.status === "done") {
    updates.status = body.status;
  }
  if ("owner" in body) updates.owner = body.owner?.trim() || null;
  if ("dueAt" in body) updates.dueAt = body.dueAt ? new Date(body.dueAt) : null;
  if (typeof body.text === "string") updates.text = body.text.trim();

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const [it] = await getDb()
    .update(actionItems)
    .set(updates)
    .where(and(eq(actionItems.id, id), eq(actionItems.userId, user.id)))
    .returning();
  if (!it) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ id: it.id, status: it.status });
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
  const [it] = await getDb()
    .delete(actionItems)
    .where(and(eq(actionItems.id, id), eq(actionItems.userId, user.id)))
    .returning();
  if (!it) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
