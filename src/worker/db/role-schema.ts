import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const roles = sqliteTable("roles", {
  roleId: integer("role_id").primaryKey(),
  name: text("name", { enum: ["owner", "admin", "member"] }).notNull(),
});
