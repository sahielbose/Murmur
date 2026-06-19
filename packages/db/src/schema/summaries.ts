import { boolean, index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { recordings } from "./recordings";
import { templates } from "./templates";
import { timestamps } from "./_helpers";

/**
 * A generated summary. Multiple summaries can exist per recording; one is the
 * primary. `style` records the template/style label and `model` the LLM used.
 */
export const summaries = pgTable(
  "summaries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recordingId: uuid("recording_id")
      .notNull()
      .references(() => recordings.id, { onDelete: "cascade" }),
    templateId: uuid("template_id").references(() => templates.id, {
      onDelete: "set null",
    }),
    style: text("style").notNull(),
    contentMd: text("content_md").notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    model: text("model"),
    ...timestamps,
  },
  (t) => [index("summaries_recording_idx").on(t.recordingId)],
);

export type Summary = typeof summaries.$inferSelect;
export type NewSummary = typeof summaries.$inferInsert;
