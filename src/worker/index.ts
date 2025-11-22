import { Hono } from "hono";
import { workspaceRouter } from "./controllers/WorkspaceController";
import { DependencyTypes } from "./container";
import { DIContainer } from "./di-container";
import { injectDiContainer } from "./middleware";
import { createAuth } from "./lib/auth";
import { createDb } from "./db";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: {
    diContainer: DIContainer<DependencyTypes>;
  };
}>()
  .basePath("/api")
  .use("*", injectDiContainer)
  .on(["POST", "GET"], "/auth/*", (c) => {
    // Better Auth
    const db = createDb(c.env.DB);
    const betterAuth = createAuth(db);
    return betterAuth.handler(c.req.raw);
  })
  .get("/", (c) => {
    return c.text("Hello Hono!");
  })
  .route("/workspaces", workspaceRouter);

export type AppType = typeof app;

export default app;
