import { describe, it, expect, afterAll } from "vitest";
import {
  getDb,
  closeDb,
  eq,
  users,
  recordings,
  transcriptSegments,
  summaries,
  actionItems,
  mindMaps,
  embeddings,
} from "@murmur/db";
import { localFileStorage } from "@murmur/ai";
import { runPipeline } from "@murmur/jobs";

const hasDb = Boolean(process.env.DATABASE_URL);

/**
 * End-to-end on mock providers: an uploaded object → recording row → pipeline →
 * `done`, with a transcript, summary, action items, mind map, and embeddings.
 * Skipped when no DATABASE_URL is configured (so CI without a DB stays green).
 */
describe.skipIf(!hasDb)("upload → pipeline → done (mock providers)", () => {
  afterAll(async () => {
    await closeDb();
  });

  it("processes an uploaded recording end to end", async () => {
    const db = getDb();

    let [user] = await db.select().from(users).limit(1);
    if (!user) {
      [user] = await db
        .insert(users)
        .values({ email: "e2e@murmur.app", name: "E2E" })
        .returning();
    }

    const key = "audio/e2e/upload-test.webm";
    await localFileStorage.put(key, new Uint8Array([0, 1, 2, 3]), "audio/webm");

    const [rec] = await db
      .insert(recordings)
      .values({
        userId: user!.id,
        title: "E2E upload",
        status: "uploaded",
        source: "upload",
        audioKey: key,
      })
      .returning();

    try {
      await runPipeline(rec!.id);

      const [after] = await db
        .select()
        .from(recordings)
        .where(eq(recordings.id, rec!.id));
      expect(after!.status).toBe("done");
      expect(after!.durationSec).toBeGreaterThan(0);

      const segs = await db
        .select()
        .from(transcriptSegments)
        .where(eq(transcriptSegments.recordingId, rec!.id));
      const sums = await db
        .select()
        .from(summaries)
        .where(eq(summaries.recordingId, rec!.id));
      const acts = await db
        .select()
        .from(actionItems)
        .where(eq(actionItems.recordingId, rec!.id));
      const mms = await db
        .select()
        .from(mindMaps)
        .where(eq(mindMaps.recordingId, rec!.id));
      const embs = await db
        .select()
        .from(embeddings)
        .where(eq(embeddings.recordingId, rec!.id));

      expect(segs.length).toBeGreaterThan(0);
      expect(sums.length).toBe(1);
      expect(sums[0]!.isPrimary).toBe(true);
      expect(acts.length).toBeGreaterThan(0);
      expect(mms.length).toBe(1);
      expect(embs.length).toBe(segs.length);
    } finally {
      await db.delete(recordings).where(eq(recordings.id, rec!.id));
      await localFileStorage.remove(key);
    }
  });
});
