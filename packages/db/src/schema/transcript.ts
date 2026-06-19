import { index, integer, pgTable, real, text, uuid } from "drizzle-orm/pg-core";
import { recordings } from "./recordings";
import { recordingSpeakers } from "./speakers";
import { timestamps } from "./_helpers";

export const transcriptSegments = pgTable(
  "transcript_segments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recordingId: uuid("recording_id")
      .notNull()
      .references(() => recordings.id, { onDelete: "cascade" }),
    recordingSpeakerId: uuid("recording_speaker_id").references(
      () => recordingSpeakers.id,
      { onDelete: "set null" },
    ),
    startMs: integer("start_ms").notNull(),
    endMs: integer("end_ms").notNull(),
    text: text("text").notNull(),
    confidence: real("confidence"),
    ...timestamps,
  },
  (t) => [
    index("segments_recording_idx").on(t.recordingId),
    index("segments_start_idx").on(t.recordingId, t.startMs),
  ],
);

export type TranscriptSegment = typeof transcriptSegments.$inferSelect;
export type NewTranscriptSegment = typeof transcriptSegments.$inferInsert;
