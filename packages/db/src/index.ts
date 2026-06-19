/**
 * @murmur/db — Drizzle schema, migrations, seed, and the database client
 * (MURMUR_CONTEXT.md §6).
 */
export * from "./client";
export * from "./schema";
export { getDatabaseUrl } from "./env";

// Re-export the common Drizzle operators so app/jobs code can build queries
// without importing drizzle-orm directly.
export {
  eq,
  ne,
  and,
  or,
  not,
  desc,
  asc,
  sql,
  like,
  ilike,
  inArray,
  gt,
  gte,
  lt,
  lte,
  isNull,
  isNotNull,
  count,
} from "drizzle-orm";
