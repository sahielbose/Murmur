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
  // Manual refresh reshuffles (a salt) so the user sees fresh suggestions; the
  // daily cron stays deterministic (no salt).
  const items = await buildDigestForUser(
    user.id,
    dateKey,
    3,
    String(Date.now()),
  );
  return NextResponse.json({ items });
}
