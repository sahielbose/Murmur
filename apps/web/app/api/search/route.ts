import { NextResponse, type NextRequest } from "next/server";
import { getDbUser } from "@/lib/current-user";
import { hybridSearch } from "@/lib/search";

/** Search across the user's recordings (MURMUR_CONTEXT.md §9). */
export async function POST(req: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { q?: string };
  const q = body.q?.trim();
  if (!q) {
    return NextResponse.json({ results: [] });
  }
  const results = await hybridSearch(user.id, q);
  return NextResponse.json({ results });
}
