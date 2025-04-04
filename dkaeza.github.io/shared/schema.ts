import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  response: text("response").notNull(),
  type: text("type").notNull(), // 'message', 'emoji', 'command'
  lastTriggered: timestamp("last_triggered"),
});

export const insertReactionSchema = createInsertSchema(reactions).pick({
  keyword: true,
  response: true,
  type: true,
});

export const botSettings = pgTable("bot_settings", {
  id: serial("id").primaryKey(),
  activityPrefix: text("activity_prefix").notNull().default("Regarde"),
  activitySuffix: text("activity_suffix").notNull().default("sur"),
  isOnline: boolean("is_online").notNull().default(true),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'bot_start', 'reaction_triggered', 'member_join', etc.
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).pick({
  type: true,
  message: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type Reaction = typeof reactions.$inferSelect;

export type BotSettings = typeof botSettings.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
