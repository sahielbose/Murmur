import { index, jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { highlightKindEnum } from "./enums";
import { recordings } from "./recordings";
import { users } from "./users";
import { timestamps } from "./_helpers";

/**
 * Resurfacing feed: daily digests, commitments ("you said you'd…"), and
 * follow-ups. `payload` carries the rendered card data (MURMUR_CONTEXT.md §10).
 */
export const highlights = pgTable(
  "highlights",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recordingId: uuid("recording_id").references(() => recordings.id, {
      onDelete: "cascade",
    }),
    kind: highlightKindEnum("kind").notNull(),
    payload: jsonb("payload")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    surfacedAt: timestamp("surfaced_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    dismissedAt: timestamp("dismissed_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("highlights_user_idx").on(t.userId)],
);

export type Highlight = typeof highlights.$inferSelect;
export type NewHighlight = typeof highlights.$inferInsert;
