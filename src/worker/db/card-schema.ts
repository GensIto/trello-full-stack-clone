import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { boards } from "./board-schema";
import { workspaceMemberships } from "./workspace-schema";

export const cards = sqliteTable("cards", {
  cardId: text("card_id").primaryKey(),
  boardId: text("board_id")
    .notNull()
    .references(() => boards.boardId, { onDelete: "cascade" }),
  assigneeMembershipId: text("assignee_membership_id").references(
    () => workspaceMemberships.membershipId
  ),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", {
    enum: ["todo", "in_progress", "done"],
  })
    .notNull()
    .default("todo"),
  dueDate: integer("due_date", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const cardHistories = sqliteTable("card_histories", {
  historyId: text("history_id").primaryKey(),
  cardId: text("card_id")
    .notNull()
    .references(() => cards.cardId, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  boardId: text("board_id")
    .notNull()
    .references(() => boards.boardId),
  assigneeMembershipId: text("assignee_membership_id").references(
    () => workspaceMemberships.membershipId
  ),
  actorMembershipId: text("actor_membership_id")
    .notNull()
    .references(() => workspaceMemberships.membershipId),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", {
    enum: ["todo", "in_progress", "done"],
  }).notNull(),
  dueDate: integer("due_date", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

export const cardActivities = sqliteTable("card_activities", {
  activityId: text("activity_id").primaryKey(),
  cardId: text("card_id")
    .notNull()
    .references(() => cards.cardId, { onDelete: "cascade" }),
  historyId: text("history_id")
    .notNull()
    .references(() => cardHistories.historyId, { onDelete: "cascade" }),
  actorMembershipId: text("actor_membership_id")
    .notNull()
    .references(() => workspaceMemberships.membershipId),
  action: text("action").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});
