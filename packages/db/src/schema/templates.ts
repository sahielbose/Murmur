import { boolean, index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { timestamps } from "./_helpers";

/**
 * Summary templates. `userId` null = a system template; user rows are custom.
 * `promptBody` is injected into the summary prompt (MURMUR_CONTEXT.md §8).
 */
export const templates = pgTable(
  "templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    promptBody: text("prompt_body").notNull(),
    isSystem: boolean("is_system").notNull().default(false),
    ...timestamps,
  },
  (t) => [index("templates_user_idx").on(t.userId)],
);

export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
