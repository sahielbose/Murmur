import "./src/load-env";
import { defineConfig } from "drizzle-kit";
import { getDatabaseUrl } from "./src/env";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: getDatabaseUrl() },
  strict: true,
  verbose: true,
});
