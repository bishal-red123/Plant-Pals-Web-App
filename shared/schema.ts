import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Types Enum
export const userTypeEnum = pgEnum('user_type', ['corporate', 'vendor']);

// Difficulty Enum for Plants
export const difficultyEnum = pgEnum('difficulty', ['beginner', 'intermediate', 'expert']);

// Light Requirements Enum
export const lightRequirementEnum = pgEnum('light_requirement', ['low', 'medium', 'high']);

// Water Requirements Enum
export const waterRequirementEnum = pgEnum('water_requirement', ['low', 'medium', 'high']);

// Order Status Enum
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'shipped', 'delivered', 'canceled']);

// Payment Method Enum
export const paymentMethodEnum = pgEnum('payment_method', ['credit_card', 'debit_card', 'upi', 'net_banking', 'cash_on_delivery']);

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  userType: userTypeEnum("user_type").notNull(),
  companyName: text("company_name"),
  location: text("location"),
  phoneNumber: text("phone_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Plants Table
export const plants = pgTable("plants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  scientificName: text("scientific_name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  difficulty: difficultyEnum("difficulty").notNull().default('beginner'),
  waterRequirement: waterRequirementEnum("water_requirement").notNull(),
  lightRequirement: lightRequirementEnum("light_requirement").notNull(),
  imageUrl: text("image_url"),
  vendorId: integer("vendor_id").notNull(),
  inStock: boolean("in_stock").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Care Guide Table
export const careGuides = pgTable("care_guides", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id").notNull(),
  wateringInstructions: text("watering_instructions").notNull(),
  lightInstructions: text("light_instructions").notNull(),
  temperatureRange: text("temperature_range").notNull(),
  additionalCare: text("additional_care"),
  weeklyRoutine: text("weekly_routine"),
  troubleshooting: text("troubleshooting"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Plant Categories Junction Table
export const plantCategories = pgTable("plant_categories", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id").notNull(),
  categoryName: text("category_name").notNull(),
});

// Orders Table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  status: orderStatusEnum("status").notNull().default('pending'),
  totalAmount: doublePrecision("total_amount").notNull(),
  orderDate: timestamp("order_date").defaultNow().notNull(),
  deliveryDate: timestamp("delivery_date"),
  trackingNumber: text("tracking_number"),
  notes: text("notes"),
});

// Order Items Table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  plantId: integer("plant_id").notNull(),
  quantity: integer("quantity").notNull(),
  pricePerUnit: doublePrecision("price_per_unit").notNull(),
});

// Reviews Table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  plantId: integer("plant_id"),
  vendorId: integer("vendor_id"),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Cart Items Table
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  plantId: integer("plant_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

// Payment Information Table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  amount: doublePrecision("amount").notNull(),
  paymentStatus: text("payment_status").notNull(),
  transactionId: text("transaction_id"),
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
});

// Define insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPlantSchema = createInsertSchema(plants).omit({ id: true, createdAt: true });
export const insertCareGuideSchema = createInsertSchema(careGuides).omit({ id: true, createdAt: true });
export const insertPlantCategorySchema = createInsertSchema(plantCategories).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, orderDate: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, addedAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, paymentDate: true });

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPlant = z.infer<typeof insertPlantSchema>;
export type Plant = typeof plants.$inferSelect;

export type InsertCareGuide = z.infer<typeof insertCareGuideSchema>;
export type CareGuide = typeof careGuides.$inferSelect;

export type InsertPlantCategory = z.infer<typeof insertPlantCategorySchema>;
export type PlantCategory = typeof plantCategories.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
