import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseUrl } from "./env";
import * as schema from "./schema";

let sql: ReturnType<typeof postgres> | undefined;
let database: ReturnType<typeof drizzle<typeof schema>> | undefined;

/** Lazily-created singleton Drizzle client (connects on first use, not import). */
export function getDb() {
  if (!database) {
    sql = postgres(getDatabaseUrl(), { max: 10 });
    database = drizzle(sql, { schema });
  }
  return database;
}

export type Database = ReturnType<typeof getDb>;

/** Ergonomic lazy handle - `db.select()...` initializes the client on first access. */
export const db: Database = new Proxy({} as Database, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
});

/** Closes the underlying connection (used by scripts that should exit cleanly). */
export async function closeDb() {
  if (sql) {
    await sql.end({ timeout: 5 });
    sql = undefined;
    database = undefined;
  }
}
