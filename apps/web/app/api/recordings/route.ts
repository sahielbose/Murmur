import { NextResponse, type NextRequest } from "next/server";
import { getDb, recordings } from "@murmur/db";
import { getStorage } from "@murmur/ai";
import { enqueueProcessing } from "@murmur/jobs";
import { getDbUser } from "@/lib/current-user";
import { isAcceptedAudio } from "@/lib/audio";

type FinalizeBody = {
  key?: string;
  title?: string;
  source?: string;
  durationSec?: number;
};

/**
 * Finalize an upload (MURMUR_CONTEXT.md §9): create the recording row and
 * enqueue the processing pipeline. Returns the new recording id.
 */
export async function POST(req: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as FinalizeBody;
  if (!body.key) {
    return NextResponse.json({ error: "key is required" }, { status: 400 });
  }
  if (!isAcceptedAudio(body.key)) {
    return NextResponse.json(
      { error: "unsupported file type" },
      { status: 400 },
    );
  }
  if (!(await getStorage().exists(body.key))) {
    return NextResponse.json(
      { error: "uploaded object not found" },
      { status: 404 },
    );
  }

  const source =
    body.source === "mic" || body.source === "system" ? body.source : "upload";

  const [rec] = await getDb()
    .insert(recordings)
    .values({
      userId: user.id,
      title: body.title?.trim() || "Untitled recording",
      status: "uploaded",
      source,
      audioKey: body.key,
      durationSec:
        typeof body.durationSec === "number"
          ? Math.round(body.durationSec)
          : null,
      recordedAt: new Date(),
    })
    .returning();

  if (!rec) {
    return NextResponse.json(
      { error: "could not create recording" },
      { status: 500 },
    );
  }

  await enqueueProcessing(rec.id);

  return NextResponse.json({ id: rec.id, status: rec.status });
}
