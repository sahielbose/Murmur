import { NextResponse, type NextRequest } from "next/server";
import { getDb, actionItems } from "@murmur/db";
import { getDbUser } from "@/lib/current-user";
import { listTasksForUser } from "@/lib/action-items";
import { getRecordingForUser } from "@/lib/recordings";

export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await listTasksForUser(user.id));
}

type CreateBody = {
  recordingId?: string;
  text?: string;
  owner?: string;
  dueAt?: string;
};

export async function POST(req: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as CreateBody;
  if (!body.recordingId || !body.text?.trim()) {
    return NextResponse.json(
      { error: "recordingId and text are required" },
      { status: 400 },
    );
  }
  if (!(await getRecordingForUser(user.id, body.recordingId))) {
    return NextResponse.json({ error: "recording not found" }, { status: 404 });
  }

  const [it] = await getDb()
    .insert(actionItems)
    .values({
      recordingId: body.recordingId,
      userId: user.id,
      text: body.text.trim(),
      owner: body.owner?.trim() || null,
      dueAt: body.dueAt ? new Date(body.dueAt) : null,
      status: "open",
    })
    .returning();
  return NextResponse.json({ id: it!.id });
}
