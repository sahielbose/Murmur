import { NextResponse, type NextRequest } from "next/server";
import { and, eq, getDb, summaries } from "@murmur/db";
import { getLlm } from "@murmur/ai";
import { getDbUser } from "@/lib/current-user";
import { buildTranscriptResult, getRecordingForUser } from "@/lib/recordings";
import { getTemplateForUser } from "@/lib/templates";

type PatchBody = { summaryId?: string; contentMd?: string };
type RegenerateBody = { templateId?: string };

/**
 * (Re)generate a summary with an optional template (MURMUR_CONTEXT.md §8). The
 * new summary becomes primary; previous summaries are kept.
 */
export async function POST(
  req: NextRequest,
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

  const body = (await req.json().catch(() => ({}))) as RegenerateBody;
  let templatePrompt: string | undefined;
  let style = "Summary";
  let templateId: string | null = null;
  if (body.templateId) {
    const tpl = await getTemplateForUser(user.id, body.templateId);
    if (tpl) {
      templatePrompt = tpl.promptBody;
      style = tpl.name;
      templateId = tpl.id;
    }
  }

  const transcript = await buildTranscriptResult(id, {
    language: rec.language,
    durationSec: rec.durationSec,
  });
  if (transcript.segments.length === 0) {
    return NextResponse.json(
      { error: "no transcript to summarize" },
      { status: 400 },
    );
  }

  const result = await getLlm().summarize({
    transcript,
    title: rec.title,
    templatePrompt,
    style,
  });

  const db = getDb();
  await db
    .update(summaries)
    .set({ isPrimary: false })
    .where(eq(summaries.recordingId, id));
  const [s] = await db
    .insert(summaries)
    .values({
      recordingId: id,
      templateId,
      style,
      contentMd: result.contentMd,
      isPrimary: true,
      model: result.model,
    })
    .returning();

  return NextResponse.json({
    id: s!.id,
    contentMd: s!.contentMd,
    style: s!.style,
  });
}

/** Update an edited summary's content (MURMUR_UI.md §10.5). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!(await getRecordingForUser(user.id, id))) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as PatchBody;
  if (!body.summaryId || typeof body.contentMd !== "string") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const [s] = await getDb()
    .update(summaries)
    .set({ contentMd: body.contentMd })
    .where(and(eq(summaries.id, body.summaryId), eq(summaries.recordingId, id)))
    .returning();

  if (!s) {
    return NextResponse.json({ error: "summary not found" }, { status: 404 });
  }
  return NextResponse.json({ id: s.id });
}
