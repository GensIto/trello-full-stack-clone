import { Next, Context } from "hono";
import { createContainer } from "../container";
import { createDb } from "../db";
import { createAuth } from "../lib/auth";

export const injectDiContainer = async (c: Context, next: Next) => {
  const db = createDb(c.env.DB);
  const di = createContainer(db);
  c.set("diContainer", di);
  // Workspace
  c.set("workspaceService", di.get("WorkspaceService"));
  c.set("workspaceMembershipsService", di.get("WorkspaceMembershipsService"));
  // Board
  c.set("boardService", di.get("BoardService"));
  c.set("boardMembershipsService", di.get("BoardMembershipsService"));
  // Card
  c.set("cardService", di.get("CardService"));
  // WorkspaceInvitations
  c.set("workspaceInvitationsService", di.get("WorkspaceInvitationsService"));
  return next();
};

export const injectAuth = async (c: Context, next: Next) => {
  const db = createDb(c.env.DB);
  const betterAuth = createAuth(db);
  const session = await betterAuth.api.getSession({
    headers: c.req.raw.headers,
  });
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  c.set("user", session.user);
  c.set("session", session.session);
  return next();
};

export const injectAdmin = async (c: Context, next: Next) => {
  const db = createDb(c.env.DB);
  const betterAuth = createAuth(db);
  const session = await betterAuth.api.getSession({
    headers: c.req.raw.headers,
  });
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  c.set("user", session.user);
  c.set("session", session.session);
  return next();
};
