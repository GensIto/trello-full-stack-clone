import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import { DrizzleDb } from "../types";
import { env } from "cloudflare:workers";

// Drizzleインスタンスのキャッシュ
// WeakMapを使用することで、D1Databaseが不要になれば自動的にGCされる
const dbCache = new WeakMap<typeof env.DB, DrizzleDb>();

export const createDb = (database: typeof env.DB) => {
  // キャッシュから取得を試みる
  const cached = dbCache.get(database);
  if (cached) {
    return cached;
  }

  // 新しいインスタンスを作成してキャッシュに保存
  const db = drizzle(database, { schema });
  dbCache.set(database, db);
  return db;
};
