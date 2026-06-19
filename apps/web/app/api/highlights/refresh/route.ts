import { NextResponse } from "next/server";
import { buildDigestForUser } from "@murmur/jobs";
import { getDbUser } from "@/lib/current-user";

/** Rebuild today's resurfacing digest for the current user. */
export async function POST() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const dateKey = new Date().toISOString().slice(0, 10);
  const items = await buildDigestForUser(user.id, dateKey);
  return NextResponse.json({ items });
}
