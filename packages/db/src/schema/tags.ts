import {
  index,
  pgTable,
  primaryKey,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { recordings } from "./recordings";
import { users } from "./users";
import { timestamps } from "./_helpers";

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").notNull().default("#71717A"),
    ...timestamps,
  },
  (t) => [
    index("tags_user_idx").on(t.userId),
    unique("tags_user_name_unique").on(t.userId, t.name),
  ],
);

export const recordingTags = pgTable(
  "recording_tags",
  {
    recordingId: uuid("recording_id")
      .notNull()
      .references(() => recordings.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.recordingId, t.tagId] })],
);

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type RecordingTag = typeof recordingTags.$inferSelect;
