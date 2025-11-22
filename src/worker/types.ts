import { DrizzleD1Database } from "drizzle-orm/d1";
import { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { ExtractTablesWithRelations } from "drizzle-orm";
import * as schema from "./db/schema";

export type DrizzleDb = DrizzleD1Database<typeof schema>;
export type DrizzleTransaction = SQLiteTransaction<
  "async",
  D1Result<unknown>,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
