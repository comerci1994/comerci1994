import "server-only";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

export type Db = LibSQLDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  __libsql?: Client;
  __db?: Db;
};

function createDb(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL non configurata. Copia .env.example in .env.local.",
    );
  }
  const client =
    globalForDb.__libsql ??
    createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });
  const db = drizzle(client, { schema });
  // Reuse across HMR reloads in dev.
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__libsql = client;
    globalForDb.__db = db;
  }
  return db;
}

let instance: Db | undefined;

/** Lazily created so that `next build` does not need DB env vars. */
export function getDb(): Db {
  instance ??= globalForDb.__db ?? createDb();
  return instance;
}

export { schema };
