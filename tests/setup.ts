import { config } from "dotenv";

// Load the repo-root .env so integration tests see DATABASE_URL etc.
config({ path: ".env" });
