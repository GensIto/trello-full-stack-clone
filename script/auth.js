import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(
    {},
    {
      provider: "sqlite",
      usePlural: true,
    }
  ),
  emailAndPassword: {
    enabled: true,
  },
});

export default auth;

// npx @better-auth/cli@latest generate --config src/script/auth.js --output src/db/auth-schema.ts
