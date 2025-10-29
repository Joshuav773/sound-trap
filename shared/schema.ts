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
  // Verification fields
  isVerified: boolean("is_verified").notNull().default(false),
  verificationMethod: text("verification_method"), // 'identity', 'portfolio', 'references', 'ascap', 'bmi', 'sesac'
  verificationDate: timestamp("verification_date"),
  trustScore: integer("trust_score").notNull().default(0), // 0-100
  verificationBadge: text("verification_badge").default("unverified"), // 'unverified', 'verified', 'premium', 'elite'
  // PRO (Performing Rights Organization) membership
  ascapMemberNumber: text("ascap_member_number"), // ASCAP member ID for verification
  bmiMemberNumber: text("bmi_member_number"), // BMI member ID for verification
  sesacMemberNumber: text("sesac_member_number"), // SESAC member ID for verification
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

// Cart abandonment tracking
export const abandonedCarts = pgTable("abandoned_carts", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  customerEmail: text("customer_email"),
  customerName: text("customer_name"),
  cartItems: text("cart_items").notNull(), // JSON array of items
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  abandonedAt: timestamp("abandoned_at").notNull().defaultNow(),
  recoveredAt: timestamp("recovered_at"),
  isRecovered: boolean("is_recovered").notNull().default(false),
  reminderSentCount: integer("reminder_sent_count").notNull().default(0),
  lastReminderSent: timestamp("last_reminder_sent"),
});

// "Try Before You Buy" downloads tracking
export const trialDownloads = pgTable("trial_downloads", {
  id: serial("id").primaryKey(),
  beatId: integer("beat_id").notNull(),
  customerEmail: text("customer_email"),
  customerName: text("customer_name"),
  ipAddress: text("ip_address"),
  downloadedAt: timestamp("downloaded_at").notNull().defaultNow(),
  convertedToPurchase: boolean("converted_to_purchase").notNull().default(false),
});

// Dispute resolution system
export const disputes = pgTable("disputes", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").notNull(),
  complainantId: integer("complainant_id").notNull(), // User who filed dispute
  respondentId: integer("respondent_id").notNull(), // Producer being disputed
  disputeType: text("dispute_type").notNull(), // 'copyright', 'quality', 'delivery', 'refund'
  description: text("description").notNull(),
  evidence: text("evidence"), // JSON array of evidence URLs
  status: text("status").notNull().default("open"), // 'open', 'under_review', 'resolved', 'closed'
  resolution: text("resolution"), // Admin resolution notes
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by"), // Admin user ID
});

// Escrow system for high-value transactions
export const escrowTransactions = pgTable("escrow_transactions", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").notNull(),
  buyerId: integer("buyer_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'held', 'released', 'refunded'
  releaseConditions: text("release_conditions").notNull(), // JSON conditions
  heldAt: timestamp("held_at"),
  releasedAt: timestamp("released_at"),
  refundedAt: timestamp("refunded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// PRO verification requests
export const proVerificationRequests = pgTable("pro_verification_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  proType: text("pro_type").notNull(), // 'ascap', 'bmi', 'sesac'
  memberNumber: text("member_number").notNull(),
  documentUrl: text("document_url").notNull(), // URL to uploaded document
  documentType: text("document_type").notNull(), // 'certificate', 'screenshot', 'email_confirmation'
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected'
  adminNotes: text("admin_notes"), // Admin review notes
  reviewedBy: integer("reviewed_by"), // Admin user ID who reviewed
  reviewedAt: timestamp("reviewed_at"),
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

export const licenseTemplates = pgTable("license_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // 'Basic Lease', 'Premium Lease', 'Exclusive Rights'
  type: text("type").notNull(), // 'lease', 'exclusive', 'free'
  description: text("description").notNull(),
  // Plain language terms
  streamLimit: integer("stream_limit"), // null = unlimited
  musicVideos: integer("music_videos"),
  radioAirplay: boolean("radio_airplay").notNull().default(false),
  commercialUse: boolean("commercial_use").notNull().default(false),
  syncRights: boolean("sync_rights").notNull().default(false),
  // Legal terms
  plainLanguageSummary: text("plain_language_summary").notNull(),
  legalContract: text("legal_contract").notNull(),
  // Pricing
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  // Files included
  includesMp3: boolean("includes_mp3").notNull().default(true),
  includesWav: boolean("includes_wav").notNull().default(false),
  includesStems: boolean("includes_stems").notNull().default(false),
  includesTrackout: boolean("includes_trackout").notNull().default(false),
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

export const insertLicenseTemplateSchema = createInsertSchema(licenseTemplates).omit({
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
export type InsertLicenseTemplate = z.infer<typeof insertLicenseTemplateSchema>;
export type LicenseTemplate = typeof licenseTemplates.$inferSelect;
