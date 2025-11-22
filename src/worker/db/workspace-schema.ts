import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./auth-schema";
import { roles } from "./role-schema";

export const workspaces = sqliteTable("workspaces", {
  workspaceId: text("workspace_id").primaryKey(),
  name: text("name").notNull(),
  ownerUserId: text("owner_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const workspaceMemberships = sqliteTable("workspace_memberships", {
  membershipId: text("membership_id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.workspaceId, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  roleId: integer("role_id")
    .notNull()
    .references(() => roles.roleId),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

export const workspaceInvitations = sqliteTable("workspace_invitations", {
  invitationId: text("invitation_id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.workspaceId, { onDelete: "cascade" }),
  invitedEmail: text("invited_email").notNull(),
  invitedBy: text("invited_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  roleId: integer("role_id")
    .notNull()
    .references(() => roles.roleId),
  status: text("status", { enum: ["pending", "accepted", "rejected"] })
    .notNull()
    .default("pending"),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});
