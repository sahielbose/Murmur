import { NextResponse } from "next/server";
import { eq, getDb, users } from "@murmur/db";
import { getDbUser } from "@/lib/current-user";

/**
 * Log the user's acknowledgment of the recording-consent notice
 * (MURMUR_CONTEXT.md §13). Stored on the user so the banner shows only once.
 */
export async function POST() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const acknowledgedAt = new Date().toISOString();
  await getDb()
    .update(users)
    .set({
      settings: { ...user.settings, consentAcknowledgedAt: acknowledgedAt },
    })
    .where(eq(users.id, user.id));

  return NextResponse.json({ acknowledgedAt });
}
