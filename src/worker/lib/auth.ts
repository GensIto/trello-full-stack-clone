import { betterAuth, env } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { DrizzleDb } from "../types";
import * as schema from "../db/schema";

// Better Authインスタンスのキャッシュ
// WeakMapを使用することで、D1Databaseが不要になれば自動的にGCされる
const authCache = new WeakMap<DrizzleDb, ReturnType<typeof betterAuth>>();

export const createAuth = (db: DrizzleDb) => {
  // キャッシュから取得を試みる
  const cached = authCache.get(db);
  if (cached) {
    return cached;
  }

  // 新しいインスタンスを作成してキャッシュに保存
  const auth = betterAuth({
    emailAndPassword: {
      enabled: true,
    },
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        ...schema,
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      database: {
        generateId: () => crypto.randomUUID(),
      },
    },
  });
  authCache.set(db, auth);
  return auth;
};
