import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const beats = pgTable("beats", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  producer: text("producer").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  duration: integer("duration").notNull(), // in seconds
  bpm: integer("bpm").notNull(),
  key: text("key").notNull(),
  tags: text("tags").array().notNull().default([]),
  leasePrice: decimal("lease_price", { precision: 10, scale: 2 }).notNull(),
  exclusivePrice: decimal("exclusive_price", { precision: 10, scale: 2 }).notNull(),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  beatId: integer("beat_id").notNull(),
  type: text("type").notNull(), // 'lease' or 'exclusive'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBeatSchema = createInsertSchema(beats).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
});

export type InsertBeat = z.infer<typeof insertBeatSchema>;
export type Beat = typeof beats.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchases.$inferSelect;
