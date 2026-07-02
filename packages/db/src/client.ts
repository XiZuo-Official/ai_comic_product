import { getDatabaseUrl } from "@ai-comic/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as aiSchema from "./schema/ai";
import * as assetSchema from "./schema/assets";
import * as creditSchema from "./schema/credits";
import * as projectSchema from "./schema/projects";
import * as subscriptionSchema from "./schema/subscriptions";
import * as userProfileSchema from "./schema/user-profiles";

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
    ...aiSchema,
    ...assetSchema,
    ...creditSchema,
    ...projectSchema,
    ...subscriptionSchema,
    ...userProfileSchema
  }
});
