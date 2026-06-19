import { eq } from "drizzle-orm";
import {
  getDb,
  recordings,
  recordingSpeakers,
  transcriptSegments,
  type Recording,
} from "@murmur/db";
import { getStt, type TranscriptResult } from "@murmur/ai";

export type RecordingStatus = Recording["status"];

export async function getRecording(id: string): Promise<Recording | undefined> {
  const db = getDb();
  const [rec] = await db
    .select()
    .from(recordings)
    .where(eq(recordings.id, id))
    .limit(1);
  return rec;
}

export async function setStatus(
  id: string,
  status: RecordingStatus,
): Promise<void> {
  const db = getDb();
  await db
    .update(recordings)
    .set({ status, error: null })
    .where(eq(recordings.id, id));
}

/** Mark a recording failed with a user-visible reason. */
export async function failRecording(id: string, reason: string): Promise<void> {
  const db = getDb();
  await db
    .update(recordings)
    .set({ status: "failed", error: reason })
    .where(eq(recordings.id, id));
}

/** Batch transcription (mock STT, seeded by the recording id). */
export async function transcribeRecording(
  id: string,
): Promise<TranscriptResult> {
  const rec = await getRecording(id);
  if (!rec) throw new Error(`recording ${id} not found`);
  const stt = getStt();
  return stt.transcribe({
    audioKey: rec.audioKey ?? id,
    seed: id,
    language: rec.language ?? undefined,
  });
}

/**
 * Persist diarized speakers + transcript segments, then backfill the recording's
 * language and duration. Idempotent: clears prior speakers/segments first.
 */
export async function persistTranscript(
  id: string,
  transcript: TranscriptResult,
): Promise<void> {
  const db = getDb();

  await db
    .delete(transcriptSegments)
    .where(eq(transcriptSegments.recordingId, id));
  await db
    .delete(recordingSpeakers)
    .where(eq(recordingSpeakers.recordingId, id));

  const speakerRows = await db
    .insert(recordingSpeakers)
    .values(
      transcript.speakers.map((s) => ({
        recordingId: id,
        localLabel: s.label,
        displayName: s.label,
      })),
    )
    .returning();
  const idByLabel = new Map(speakerRows.map((r) => [r.localLabel, r.id]));

  if (transcript.segments.length > 0) {
    await db.insert(transcriptSegments).values(
      transcript.segments.map((seg) => ({
        recordingId: id,
        recordingSpeakerId: idByLabel.get(seg.speakerLabel) ?? null,
        startMs: seg.startMs,
        endMs: seg.endMs,
        text: seg.text,
        confidence: seg.confidence,
      })),
    );
  }

  await db
    .update(recordings)
    .set({ language: transcript.language, durationSec: transcript.durationSec })
    .where(eq(recordings.id, id));
}
