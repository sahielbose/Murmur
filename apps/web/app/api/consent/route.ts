import { NextResponse, type NextRequest } from "next/server";
import { eq, getDb, users } from "@murmur/db";
import { getDbUser } from "@/lib/current-user";

/**
 * Log the user's acknowledgment of the recording-consent notice
 * (MURMUR_CONTEXT.md §13). Stored on the user so the banner shows only once;
 * the "everyone here knows" toggle is persisted alongside it.
 */
export async function POST(req: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    othersInformed?: boolean;
  };
  const acknowledgedAt = new Date().toISOString();
  await getDb()
    .update(users)
    .set({
      settings: {
        ...user.settings,
        consentAcknowledgedAt: acknowledgedAt,
        consentOthersInformed: Boolean(body.othersInformed),
      },
    })
    .where(eq(users.id, user.id));

  return NextResponse.json({ acknowledgedAt });
}
