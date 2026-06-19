import { index, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { askRoleEnum, askScopeEnum } from "./enums";
import { recordings } from "./recordings";
import { users } from "./users";
import { timestamps } from "./_helpers";

/** A grounding citation back to the source recording + moment. */
export type Citation = {
  recordingId: string;
  startMs: number;
  label?: string;
};

export const askThreads = pgTable(
  "ask_threads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    scope: askScopeEnum("scope").notNull().default("library"),
    scopeRecordingId: uuid("scope_recording_id").references(
      () => recordings.id,
      { onDelete: "set null" },
    ),
    ...timestamps,
  },
  (t) => [index("ask_threads_user_idx").on(t.userId)],
);

export const askMessages = pgTable(
  "ask_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    threadId: uuid("thread_id")
      .notNull()
      .references(() => askThreads.id, { onDelete: "cascade" }),
    role: askRoleEnum("role").notNull(),
    content: text("content").notNull(),
    citations: jsonb("citations").$type<Citation[]>().notNull().default([]),
    ...timestamps,
  },
  (t) => [index("ask_messages_thread_idx").on(t.threadId)],
);

export type AskThread = typeof askThreads.$inferSelect;
export type NewAskThread = typeof askThreads.$inferInsert;
export type AskMessage = typeof askMessages.$inferSelect;
export type NewAskMessage = typeof askMessages.$inferInsert;
