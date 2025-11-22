import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { workspaces, workspaceMemberships } from "./workspace-schema";

export const boards = sqliteTable("boards", {
  boardId: text("board_id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.workspaceId, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const boardMemberships = sqliteTable("board_memberships", {
  boardMembershipId: text("board_membership_id").primaryKey(),
  boardId: text("board_id")
    .notNull()
    .references(() => boards.boardId, { onDelete: "cascade" }),
  membershipId: text("membership_id")
    .notNull()
    .references(() => workspaceMemberships.membershipId, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});
