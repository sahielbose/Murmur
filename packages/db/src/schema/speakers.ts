import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { recordings } from "./recordings";
import { timestamps } from "./_helpers";

/**
 * A user-level voice identity (a recurring person). Voice prints (Phase 19+)
 * link recurring speakers across recordings.
 */
export const speakers = pgTable(
  "speakers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    voicePrintRef: text("voice_print_ref"),
    ...timestamps,
  },
  (t) => [index("speakers_user_idx").on(t.userId)],
);

/**
 * A diarized speaker within one recording. `localLabel` is the raw diarization
 * label ("Speaker 1"); `displayName` is the editable label that propagates
 * across the recording when renamed; `speakerId` links to a global voice
 * identity once identified.
 */
export const recordingSpeakers = pgTable(
  "recording_speakers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recordingId: uuid("recording_id")
      .notNull()
      .references(() => recordings.id, { onDelete: "cascade" }),
    speakerId: uuid("speaker_id").references(() => speakers.id, {
      onDelete: "set null",
    }),
    localLabel: text("local_label").notNull(),
    displayName: text("display_name").notNull(),
    ...timestamps,
  },
  (t) => [index("recording_speakers_recording_idx").on(t.recordingId)],
);

export type Speaker = typeof speakers.$inferSelect;
export type NewSpeaker = typeof speakers.$inferInsert;
export type RecordingSpeaker = typeof recordingSpeakers.$inferSelect;
export type NewRecordingSpeaker = typeof recordingSpeakers.$inferInsert;
