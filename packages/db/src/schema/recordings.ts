import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { recordingSourceEnum, recordingStatusEnum } from "./enums";
import { users } from "./users";
import { timestamps } from "./_helpers";

export const recordings = pgTable(
  "recordings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    status: recordingStatusEnum("status").notNull().default("uploaded"),
    source: recordingSourceEnum("source").notNull(),
    language: text("language"),
    durationSec: integer("duration_sec"),
    // Object-storage key for the audio (R2 / local filesystem).
    audioKey: text("audio_key"),
    error: text("error"),
    recordedAt: timestamp("recorded_at", { withTimezone: true }),
    // Soft delete → recycle bin.
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("recordings_user_idx").on(t.userId),
    index("recordings_status_idx").on(t.status),
  ],
);

export type Recording = typeof recordings.$inferSelect;
export type NewRecording = typeof recordings.$inferInsert;
