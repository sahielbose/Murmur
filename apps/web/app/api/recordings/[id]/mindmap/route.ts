import { NextResponse, type NextRequest } from "next/server";
import { eq, getDb, mindMaps } from "@murmur/db";
import { getLlm } from "@murmur/ai";
import { getDbUser } from "@/lib/current-user";
import { buildTranscriptResult, getRecordingForUser } from "@/lib/recordings";

/** Regenerate the mind map for a recording (mock LLM → graph JSON). */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const rec = await getRecordingForUser(user.id, id);
  if (!rec) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const transcript = await buildTranscriptResult(id, {
    language: rec.language,
    durationSec: rec.durationSec,
  });
  if (transcript.segments.length === 0) {
    return NextResponse.json({ error: "no transcript" }, { status: 400 });
  }

  const result = await getLlm().mindMap({ transcript, title: rec.title });
  const graph = { nodes: result.nodes, edges: result.edges };

  const db = getDb();
  await db.delete(mindMaps).where(eq(mindMaps.recordingId, id));
  await db.insert(mindMaps).values({ recordingId: id, graph });

  return NextResponse.json({ graph });
}
