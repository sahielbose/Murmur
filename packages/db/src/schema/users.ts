import { jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { planEnum } from "./enums";
import { timestamps } from "./_helpers";

export type UserSettings = {
  defaultTemplateId?: string;
  language?: string;
  model?: string;
  integrations?: Record<string, unknown>;
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  plan: planEnum("plan").notNull().default("free"),
  settings: jsonb("settings").$type<UserSettings>().notNull().default({}),
  ...timestamps,
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
