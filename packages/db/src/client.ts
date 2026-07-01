import { getDatabaseUrl } from "@ai-comic/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as projectSchema from "./schema/projects";

const globalForDb = globalThis as unknown as {
  aiComicSql?: postgres.Sql;
};

function createSqlClient() {
  return postgres(getDatabaseUrl(), {
    max: 10,
    prepare: false
  });
}

const sql = globalForDb.aiComicSql ?? createSqlClient();

if (process.env.NODE_ENV !== "production") {
  globalForDb.aiComicSql = sql;
}

export const db = drizzle(sql, {
  schema: {
    ...projectSchema
  }
});
