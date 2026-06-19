import { config } from "dotenv";
import { resolve } from "node:path";

/**
 * Loads env for standalone db scripts (drizzle-kit, migrate, seed). The Next
 * app already has process.env populated, so importing this there is a no-op for
 * already-set vars. Reads the repo-root `.env` then a package-local `.env`.
 */
config({ path: resolve(process.cwd(), "../../.env") });
config({ path: resolve(process.cwd(), ".env") });
