import { NextResponse, type NextRequest } from "next/server";
import { and, eq, getDb, highlights } from "@murmur/db";
import { getDbUser } from "@/lib/current-user";

/** Dismiss a highlight (resurfacing digest) so it stops surfacing. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await getDb()
    .update(highlights)
    .set({ dismissedAt: new Date() })
    .where(and(eq(highlights.id, id), eq(highlights.userId, user.id)));
  return NextResponse.json({ ok: true });
}
