import "./load-env";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { getDatabaseUrl } from "./env";

async function main() {
  const sql = postgres(getDatabaseUrl(), { max: 1 });
  const db = drizzle(sql);
  const migrationsFolder = fileURLToPath(
    new URL("../drizzle", import.meta.url),
  );

  console.log("Applying migrations…");
  await migrate(db, { migrationsFolder });
  console.log("Migrations applied.");

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
