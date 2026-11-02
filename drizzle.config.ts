import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: [".env.local", ".env"], quiet: true });

const url = process.env.DATABASE_URL ?? "file:./local.db";
const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/migrations",
  dialect: "turso",
  dbCredentials: { url, authToken },
  strict: true,
  verbose: true,
});
