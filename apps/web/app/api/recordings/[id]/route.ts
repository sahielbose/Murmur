import { NextResponse, type NextRequest } from "next/server";
import { and, eq, getDb, recordings } from "@murmur/db";
import { getDbUser } from "@/lib/current-user";

type PatchBody = { title?: string };

/**
 * Update a recording (MURMUR_CONTEXT.md §9). Rename now; retag and set-primary
 * land in later phases.
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
  const body = (await req.json().catch(() => ({}))) as PatchBody;

  const updates: { title?: string } = {};
  if (typeof body.title === "string") {
    updates.title = body.title.trim() || "Untitled recording";
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const [rec] = await getDb()
    .update(recordings)
    .set(updates)
    .where(and(eq(recordings.id, id), eq(recordings.userId, user.id)))
    .returning();

  if (!rec) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ id: rec.id, title: rec.title });
}
