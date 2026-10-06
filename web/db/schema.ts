import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(), context: text("context").notNull().default("[]"),
  lastProblem: text("last_problem").notNull().default(""), lastTopic: text("last_topic").notNull().default(""),
  attempt: integer("attempt").notNull().default(0), busyUntil: integer("busy_until").notNull().default(0), updatedAt: integer("updated_at").notNull(),
});
export const tickets = sqliteTable("tickets", {
  id: text("id").primaryKey(), tokenHash: text("token_hash").notNull().unique(), details: text("details").notNull(),
  department: text("department").notNull(), score: real("score").notNull(), status: text("status").notNull().default("recorded"), createdAt: text("created_at").notNull(),
});
export const exchanges = sqliteTable("exchanges", {
  id: text("id").primaryKey(), sessionId: text("session_id").notNull(), reply: text("reply").notNull(), createdAt: integer("created_at").notNull(),
});
export const limits = sqliteTable("request_limits", { key: text("key").primaryKey(), count: integer("count").notNull().default(0) });
