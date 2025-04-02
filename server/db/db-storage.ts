import { db } from './index';
import { 
  InsertUser, User,
  InsertPlant, Plant,
  InsertCareGuide, CareGuide,
  InsertPlantCategory, PlantCategory,
  InsertOrder, Order,
  InsertOrderItem, OrderItem,
  InsertReview, Review,
  InsertCartItem, CartItem,
  InsertPayment, Payment,
  users, plants, careGuides, plantCategories, orders, orderItems, reviews, cartItems, payments
} from '@shared/schema';
import { IStorage } from '../storage';
import { and, eq, or } from 'drizzle-orm';

export class PgStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.email, email));
    return results[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const results = await db.insert(users).values(user).returning();
    return results[0];
  }

  async getVendors(): Promise<User[]> {
    return db.select().from(users).where(eq(users.userType, 'vendor'));
  }

  async getVendorById(id: number): Promise<User | undefined> {
    const results = await db.select().from(users)
      .where(and(eq(users.id, id), eq(users.userType, 'vendor')));
    return results[0];
  }

  // Plant operations
  async getPlants(): Promise<Plant[]> {
    return db.select().from(plants);
  }

  async getPlantById(id: number): Promise<Plant | undefined> {
    const results = await db.select().from(plants).where(eq(plants.id, id));
    return results[0];
  }

  async getPlantsByVendor(vendorId: number): Promise<Plant[]> {
    return db.select().from(plants).where(eq(plants.vendorId, vendorId));
  }

  async createPlant(plant: InsertPlant): Promise<Plant> {
    const results = await db.insert(plants).values(plant).returning();
    return results[0];
  }

  async updatePlant(id: number, plant: Partial<InsertPlant>): Promise<Plant | undefined> {
    const results = await db.update(plants)
      .set(plant)
      .where(eq(plants.id, id))
      .returning();
    return results[0];
  }
  
  // Care Guide operations
  async getCareGuideByPlantId(plantId: number): Promise<CareGuide | undefined> {
    const results = await db.select().from(careGuides).where(eq(careGuides.plantId, plantId));
    return results[0];
  }

  async createCareGuide(careGuide: InsertCareGuide): Promise<CareGuide> {
    const results = await db.insert(careGuides).values(careGuide).returning();
    return results[0];
  }
  
  // Plant Categories operations
  async getPlantCategories(plantId: number): Promise<PlantCategory[]> {
    return db.select().from(plantCategories).where(eq(plantCategories.plantId, plantId));
  }

  async addPlantCategory(plantCategory: InsertPlantCategory): Promise<PlantCategory> {
    const results = await db.insert(plantCategories).values(plantCategory).returning();
    return results[0];
  }
  
  // Order operations
  async getOrders(): Promise<Order[]> {
    return db.select().from(orders);
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const results = await db.select().from(orders).where(eq(orders.id, id));
    return results[0];
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getOrdersByVendor(vendorId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.vendorId, vendorId));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const results = await db.insert(orders).values(order).returning();
    return results[0];
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const results = await db.update(orders)
      .set({ status: status as any })
      .where(eq(orders.id, id))
      .returning();
    return results[0];
  }
  
  // Order Item operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const results = await db.insert(orderItems).values(orderItem).returning();
    return results[0];
  }
  
  // Review operations
  async getReviews(): Promise<Review[]> {
    return db.select().from(reviews);
  }

  async getReviewsByPlant(plantId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.plantId, plantId));
  }

  async getReviewsByVendor(vendorId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.vendorId, vendorId));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const results = await db.insert(reviews).values(review).returning();
    return results[0];
  }

  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async getCartItem(userId: number, plantId: number): Promise<CartItem | undefined> {
    const results = await db.select().from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.plantId, plantId)));
    return results[0];
  }

  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if this user already has this plant in their cart
    const existingItem = await this.getCartItem(cartItem.userId, cartItem.plantId);
    
    if (existingItem) {
      // Update the quantity of the existing item
      return this.updateCartItemQuantity(
        existingItem.userId, 
        existingItem.plantId, 
        existingItem.quantity + cartItem.quantity
      ) as Promise<CartItem>;
    }
    
    // Create a new cart item
    const results = await db.insert(cartItems).values(cartItem).returning();
    return results[0];
  }

  async updateCartItemQuantity(userId: number, plantId: number, quantity: number): Promise<CartItem | undefined> {
    const results = await db.update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.userId, userId), eq(cartItems.plantId, plantId)))
      .returning();
    return results[0];
  }

  async removeCartItem(userId: number, plantId: number): Promise<boolean> {
    const results = await db.delete(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.plantId, plantId)))
      .returning();
    return results.length > 0;
  }

  async clearCart(userId: number): Promise<boolean> {
    const results = await db.delete(cartItems)
      .where(eq(cartItems.userId, userId))
      .returning();
    return results.length > 0;
  }
  
  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const results = await db.insert(payments).values(payment).returning();
    return results[0];
  }

  async getPaymentByOrderId(orderId: number): Promise<Payment | undefined> {
    const results = await db.select().from(payments).where(eq(payments.orderId, orderId));
    return results[0];
  }
}