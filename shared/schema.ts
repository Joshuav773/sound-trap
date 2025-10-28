import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(), // In production, hash this!
  role: text("role").notNull().default("client"), // admin, artist, client
  leasingTerms: text("leasing_terms"), // Artist licensing/leasing terms
  publishingTerms: text("publishing_terms"), // Publishing terms
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

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
  artistId: integer("artist_id"), // Links to user who owns the beat
  isPendingStore: boolean("is_pending_store").notNull().default(false),
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

export const storeProducts = pgTable("store_products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'loop-pack', 'drum-kit', 'course'
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  fileCount: integer("file_count").notNull(), // number of files/loops/drums
  fileName: text("file_name"),
  filePath: text("file_path"),
  coverImagePath: text("cover_image_path"),
  isFeatured: boolean("is_featured").notNull().default(false),
  artistId: integer("artist_id"), // Links to user who owns the product
  isPendingStore: boolean("is_pending_store").notNull().default(false), // true for prodbypending products
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

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStoreProductSchema = createInsertSchema(storeProducts).omit({
  id: true,
  createdAt: true,
});

export type InsertBeat = z.infer<typeof insertBeatSchema>;
export type Beat = typeof beats.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchases.$inferSelect;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertStoreProduct = z.infer<typeof insertStoreProductSchema>;
export type StoreProduct = typeof storeProducts.$inferSelect;
