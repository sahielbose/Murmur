import { eq } from "drizzle-orm";
import { getDb, recordings, type Recording } from "@murmur/db";

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
