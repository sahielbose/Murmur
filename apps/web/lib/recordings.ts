import {
  and,
  asc,
  desc,
  eq,
  isNull,
  getDb,
  recordings,
  recordingTags,
  recordingSpeakers,
  transcriptSegments,
  summaries,
  mindMaps,
  tags,
  type Recording,
  type Summary,
  type Tag,
  type MindMapGraph,
} from "@murmur/db";

import type { TranscriptResult } from "@murmur/ai";

export type TranscriptRow = {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
  speaker: string | null;
};

/** Fetch a non-deleted recording owned by the user. */
export async function getRecordingForUser(
  userId: string,
  id: string,
): Promise<Recording | undefined> {
  const db = getDb();
  const [rec] = await db
    .select()
    .from(recordings)
    .where(
      and(
        eq(recordings.id, id),
        eq(recordings.userId, userId),
        isNull(recordings.deletedAt),
      ),
    )
    .limit(1);
  return rec;
}

export async function getRecordingTags(recordingId: string): Promise<Tag[]> {
  const db = getDb();
  const rows = await db
    .select({ tag: tags })
    .from(recordingTags)
    .innerJoin(tags, eq(recordingTags.tagId, tags.id))
    .where(eq(recordingTags.recordingId, recordingId))
    .orderBy(asc(tags.name));
  return rows.map((r) => r.tag);
}

export async function getPrimarySummary(
  recordingId: string,
): Promise<Summary | undefined> {
  const db = getDb();
  const [s] = await db
    .select()
    .from(summaries)
    .where(
      and(
        eq(summaries.recordingId, recordingId),
        eq(summaries.isPrimary, true),
      ),
    )
    .limit(1);
  return s;
}

export async function getTranscript(
  recordingId: string,
): Promise<TranscriptRow[]> {
  const db = getDb();
  return db
    .select({
      id: transcriptSegments.id,
      startMs: transcriptSegments.startMs,
      endMs: transcriptSegments.endMs,
      text: transcriptSegments.text,
      speaker: recordingSpeakers.displayName,
    })
    .from(transcriptSegments)
    .leftJoin(
      recordingSpeakers,
      eq(transcriptSegments.recordingSpeakerId, recordingSpeakers.id),
    )
    .where(eq(transcriptSegments.recordingId, recordingId))
    .orderBy(asc(transcriptSegments.startMs));
}

export async function getMindMap(
  recordingId: string,
): Promise<MindMapGraph | null> {
  const db = getDb();
  const [m] = await db
    .select()
    .from(mindMaps)
    .where(eq(mindMaps.recordingId, recordingId))
    .orderBy(desc(mindMaps.createdAt))
    .limit(1);
  return m?.graph ?? null;
}

/** Build a TranscriptResult from the persisted segments (for regeneration). */
export async function buildTranscriptResult(
  recordingId: string,
  meta: { language: string | null; durationSec: number | null },
): Promise<TranscriptResult> {
  const rows = await getTranscript(recordingId);
  const labels = Array.from(new Set(rows.map((r) => r.speaker ?? "Speaker")));
  return {
    language: meta.language ?? "en",
    durationSec: meta.durationSec ?? 0,
    speakers: labels.map((label) => ({ label })),
    segments: rows.map((r) => ({
      speakerLabel: r.speaker ?? "Speaker",
      startMs: r.startMs,
      endMs: r.endMs,
      text: r.text,
      confidence: 0.95,
    })),
  };
}

/** List a user's non-deleted recordings, newest first. */
export async function listRecordingsForUser(
  userId: string,
): Promise<Recording[]> {
  const db = getDb();
  return db
    .select()
    .from(recordings)
    .where(and(eq(recordings.userId, userId), isNull(recordings.deletedAt)))
    .orderBy(desc(recordings.recordedAt), desc(recordings.createdAt));
}
