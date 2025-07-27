import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["vendor", "buyer", "supplier"]);
export const groupBuyStatusEnum = pgEnum("group_buy_status", ["active", "completed", "cancelled"]);
export const rescueItemTypeEnum = pgEnum("rescue_item_type", ["prepared", "raw"]);
export const rescueItemStatusEnum = pgEnum("rescue_item_status", ["available", "claimed", "completed"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("vendor"),
  city: text("city").notNull(),
  profileImage: text("profile_image"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vendorProfiles = pgTable("vendor_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  businessName: text("business_name").notNull(),
  sourcingMethod: text("sourcing_method"),
  trustScore: integer("trust_score").default(0),
  hasTrustBadge: boolean("has_trust_badge").default(false),
  usedAiPrediction: boolean("used_ai_prediction").default(false),
  participatedGroupBuy: boolean("participated_group_buy").default(false),
  postedRescueItem: boolean("posted_rescue_item").default(false),
  lastActivityDate: timestamp("last_activity_date").defaultNow(),
});

export const predictions = pgTable("predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => users.id).notNull(),
  date: timestamp("date").defaultNow(),
  city: text("city").notNull(),
  weather: text("weather"),
  temperature: decimal("temperature", { precision: 4, scale: 1 }),
  predictions: text("predictions").notNull(), // JSON string of ingredient predictions
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
});

export const groupBuys = pgTable("group_buys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizerId: varchar("organizer_id").references(() => users.id).notNull(),
  ingredient: text("ingredient").notNull(),
  targetQuantity: decimal("target_quantity", { precision: 8, scale: 2 }).notNull(),
  currentQuantity: decimal("current_quantity", { precision: 8, scale: 2 }).default("0"),
  pricePerKg: decimal("price_per_kg", { precision: 8, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 8, scale: 2 }).notNull(),
  city: text("city").notNull(),
  deadline: timestamp("deadline").notNull(),
  status: groupBuyStatusEnum("status").default("active"),
  participantCount: integer("participant_count").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupBuyParticipants = pgTable("group_buy_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupBuyId: varchar("group_buy_id").references(() => groupBuys.id).notNull(),
  vendorId: varchar("vendor_id").references(() => users.id).notNull(),
  quantity: decimal("quantity", { precision: 8, scale: 2 }).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const rescueItems = pgTable("rescue_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: rescueItemTypeEnum("type").notNull(),
  quantity: text("quantity").notNull(),
  originalPrice: decimal("original_price", { precision: 8, scale: 2 }).notNull(),
  rescuePrice: decimal("rescue_price", { precision: 8, scale: 2 }).notNull(),
  city: text("city").notNull(),
  status: rescueItemStatusEnum("status").default("available"),
  isHot: boolean("is_hot").default(false),
  claimedBy: varchar("claimed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => users.id).notNull(),
  buyerId: varchar("buyer_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  rescueItemId: varchar("rescue_item_id").references(() => rescueItems.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertVendorProfileSchema = createInsertSchema(vendorProfiles).omit({ id: true });
export const insertPredictionSchema = createInsertSchema(predictions).omit({ id: true, date: true });
export const insertGroupBuySchema = createInsertSchema(groupBuys).omit({ id: true, createdAt: true, currentQuantity: true, participantCount: true });
export const insertGroupBuyParticipantSchema = createInsertSchema(groupBuyParticipants).omit({ id: true, joinedAt: true });
export const insertRescueItemSchema = createInsertSchema(rescueItems).omit({ id: true, createdAt: true, claimedBy: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type VendorProfile = typeof vendorProfiles.$inferSelect;
export type InsertVendorProfile = z.infer<typeof insertVendorProfileSchema>;
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type GroupBuy = typeof groupBuys.$inferSelect;
export type InsertGroupBuy = z.infer<typeof insertGroupBuySchema>;
export type GroupBuyParticipant = typeof groupBuyParticipants.$inferSelect;
export type InsertGroupBuyParticipant = z.infer<typeof insertGroupBuyParticipantSchema>;
export type RescueItem = typeof rescueItems.$inferSelect;
export type InsertRescueItem = z.infer<typeof insertRescueItemSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
