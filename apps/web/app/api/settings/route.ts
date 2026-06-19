import { NextResponse, type NextRequest } from "next/server";
import { eq, getDb, users, type UserSettings } from "@murmur/db";
import { getDbUser } from "@/lib/current-user";

type Body = { name?: string; consentAcknowledged?: boolean };

export async function PATCH(req: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as Body;

  const updates: { name?: string; settings?: UserSettings } = {};
  if (typeof body.name === "string" && body.name.trim()) {
    updates.name = body.name.trim();
  }
  if (typeof body.consentAcknowledged === "boolean") {
    const settings: UserSettings = { ...(user.settings ?? {}) };
    if (body.consentAcknowledged) {
      settings.consentAcknowledgedAt = new Date().toISOString();
    } else {
      delete settings.consentAcknowledgedAt;
    }
    updates.settings = settings;
  }

  if (Object.keys(updates).length > 0) {
    await getDb().update(users).set(updates).where(eq(users.id, user.id));
  }
  return NextResponse.json({ ok: true });
}
