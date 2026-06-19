import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { recordings } from "./recordings";
import { users } from "./users";
import { timestamps } from "./_helpers";

/** A merge of multiple recordings into one combined view (keeps provenance). */
export const combineGroups = pgTable(
  "combine_groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    ...timestamps,
  },
  (t) => [index("combine_groups_user_idx").on(t.userId)],
);

export const combineMembers = pgTable(
  "combine_members",
  {
    groupId: uuid("group_id")
      .notNull()
      .references(() => combineGroups.id, { onDelete: "cascade" }),
    recordingId: uuid("recording_id")
      .notNull()
      .references(() => recordings.id, { onDelete: "cascade" }),
    order: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.groupId, t.recordingId] })],
);

export type CombineGroup = typeof combineGroups.$inferSelect;
export type NewCombineGroup = typeof combineGroups.$inferInsert;
export type CombineMember = typeof combineMembers.$inferSelect;
