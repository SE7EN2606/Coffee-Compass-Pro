import { pgTable, text, serial, integer, boolean, doublePrecision, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const coffeeShops = pgTable("coffee_shops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  imageUrl: text("image_url").notNull(),
  rating: doublePrecision("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  isOpen: boolean("is_open").notNull().default(false),
  openingTime: text("opening_time").notNull(),
  closingTime: text("closing_time").notNull(),
  weekdayHours: text("weekday_hours").notNull(),
  weekendHours: text("weekend_hours").notNull(),
  phone: text("phone"),
  website: text("website"),
  hasWifi: boolean("has_wifi").notNull().default(false),
  description: text("description").notNull(),
  tags: text("tags").array().notNull(),
  popularItems: text("popular_items").array(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  coffeeShopId: integer("coffee_shop_id").notNull().references(() => coffeeShops.id),
  authorName: text("author_name").notNull(),
  rating: doublePrecision("rating").notNull(),
  comment: text("comment").notNull(),
  date: timestamp("date").notNull().defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  coffeeShopId: integer("coffee_shop_id").notNull().references(() => coffeeShops.id),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCoffeeShopSchema = createInsertSchema(coffeeShops).omit({
  id: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  date: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCoffeeShop = z.infer<typeof insertCoffeeShopSchema>;
export type CoffeeShop = typeof coffeeShops.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
