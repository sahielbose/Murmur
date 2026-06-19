import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { actionItemStatusEnum } from "./enums";
import { recordings } from "./recordings";
import { users } from "./users";
import { timestamps } from "./_helpers";

/**
 * An extracted next-step. `userId` is denormalized for the global Tasks view;
 * `calendarEventId` links to a pushed Google Calendar event (approval-gated,
 * Phase 20).
 */
export const actionItems = pgTable(
  "action_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recordingId: uuid("recording_id")
      .notNull()
      .references(() => recordings.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    status: actionItemStatusEnum("status").notNull().default("open"),
    owner: text("owner"),
    dueAt: timestamp("due_at", { withTimezone: true }),
    calendarEventId: text("calendar_event_id"),
    ...timestamps,
  },
  (t) => [
    index("action_items_recording_idx").on(t.recordingId),
    index("action_items_user_idx").on(t.userId),
    index("action_items_status_idx").on(t.status),
  ],
);

export type ActionItem = typeof actionItems.$inferSelect;
export type NewActionItem = typeof actionItems.$inferInsert;
