import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./_helpers";

/** Enterprise "talk to sales" submissions (a real stored lead). */
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  teamSize: text("team_size"),
  message: text("message"),
  ...timestamps,
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
