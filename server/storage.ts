import { 
  users, type User, type InsertUser,
  plants, type Plant, type InsertPlant,
  careGuides, type CareGuide, type InsertCareGuide,
  plantCategories, type PlantCategory, type InsertPlantCategory,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  reviews, type Review, type InsertReview,
  cartItems, type CartItem, type InsertCartItem,
  payments, type Payment, type InsertPayment
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getVendors(): Promise<User[]>;
  getVendorById(id: number): Promise<User | undefined>;

  // Plant operations
  getPlants(): Promise<Plant[]>;
  getPlantById(id: number): Promise<Plant | undefined>;
  getPlantsByVendor(vendorId: number): Promise<Plant[]>;
  createPlant(plant: InsertPlant): Promise<Plant>;
  updatePlant(id: number, plant: Partial<InsertPlant>): Promise<Plant | undefined>;
  
  // Care Guide operations
  getCareGuideByPlantId(plantId: number): Promise<CareGuide | undefined>;
  createCareGuide(careGuide: InsertCareGuide): Promise<CareGuide>;
  
  // Plant Categories operations
  getPlantCategories(plantId: number): Promise<PlantCategory[]>;
  addPlantCategory(plantCategory: InsertPlantCategory): Promise<PlantCategory>;
  
  // Order operations
  getOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrdersByVendor(vendorId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order Item operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Review operations
  getReviews(): Promise<Review[]>;
  getReviewsByPlant(plantId: number): Promise<Review[]>;
  getReviewsByVendor(vendorId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItem(userId: number, plantId: number): Promise<CartItem | undefined>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(userId: number, plantId: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(userId: number, plantId: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentByOrderId(orderId: number): Promise<Payment | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private plants: Map<number, Plant>;
  private careGuides: Map<number, CareGuide>;
  private plantCategories: Map<number, PlantCategory>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private reviews: Map<number, Review>;
  private cartItems: Map<number, CartItem>;
  private payments: Map<number, Payment>;
  
  private userIdCounter: number;
  private plantIdCounter: number;
  private careGuideIdCounter: number;
  private plantCategoryIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;
  private reviewIdCounter: number;
  private cartItemIdCounter: number;
  private paymentIdCounter: number;

  constructor() {
    this.users = new Map();
    this.plants = new Map();
    this.careGuides = new Map();
    this.plantCategories = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.reviews = new Map();
    this.cartItems = new Map();
    this.payments = new Map();
    
    this.userIdCounter = 1;
    this.plantIdCounter = 1;
    this.careGuideIdCounter = 1;
    this.plantCategoryIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    this.reviewIdCounter = 1;
    this.cartItemIdCounter = 1;
    this.paymentIdCounter = 1;
    
    // Seed initial data
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async getVendors(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.userType === 'vendor',
    );
  }

  async getVendorById(id: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    return user?.userType === 'vendor' ? user : undefined;
  }

  // Plant operations
  async getPlants(): Promise<Plant[]> {
    return Array.from(this.plants.values());
  }

  async getPlantById(id: number): Promise<Plant | undefined> {
    return this.plants.get(id);
  }

  async getPlantsByVendor(vendorId: number): Promise<Plant[]> {
    return Array.from(this.plants.values()).filter(
      (plant) => plant.vendorId === vendorId,
    );
  }

  async createPlant(insertPlant: InsertPlant): Promise<Plant> {
    const id = this.plantIdCounter++;
    const now = new Date();
    const plant: Plant = { ...insertPlant, id, createdAt: now };
    this.plants.set(id, plant);
    return plant;
  }

  async updatePlant(id: number, plantUpdate: Partial<InsertPlant>): Promise<Plant | undefined> {
    const plant = this.plants.get(id);
    if (!plant) return undefined;
    
    const updatedPlant: Plant = { ...plant, ...plantUpdate };
    this.plants.set(id, updatedPlant);
    return updatedPlant;
  }

  // Care Guide operations
  async getCareGuideByPlantId(plantId: number): Promise<CareGuide | undefined> {
    return Array.from(this.careGuides.values()).find(
      (guide) => guide.plantId === plantId,
    );
  }

  async createCareGuide(insertCareGuide: InsertCareGuide): Promise<CareGuide> {
    const id = this.careGuideIdCounter++;
    const now = new Date();
    const careGuide: CareGuide = { ...insertCareGuide, id, createdAt: now };
    this.careGuides.set(id, careGuide);
    return careGuide;
  }

  // Plant Categories operations
  async getPlantCategories(plantId: number): Promise<PlantCategory[]> {
    return Array.from(this.plantCategories.values()).filter(
      (category) => category.plantId === plantId,
    );
  }

  async addPlantCategory(insertPlantCategory: InsertPlantCategory): Promise<PlantCategory> {
    const id = this.plantCategoryIdCounter++;
    const plantCategory: PlantCategory = { ...insertPlantCategory, id };
    this.plantCategories.set(id, plantCategory);
    return plantCategory;
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    );
  }

  async getOrdersByVendor(vendorId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.vendorId === vendorId,
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    const order: Order = { ...insertOrder, id, orderDate: now };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder: Order = { ...order, status: status as any };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order Item operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId,
    );
  }

  async addOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemIdCounter++;
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // Review operations
  async getReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values());
  }

  async getReviewsByPlant(plantId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.plantId === plantId,
    );
  }

  async getReviewsByVendor(vendorId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.vendorId === vendorId,
    );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const now = new Date();
    const review: Review = { ...insertReview, id, createdAt: now };
    this.reviews.set(id, review);
    return review;
  }

  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async getCartItem(userId: number, plantId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      (item) => item.userId === userId && item.plantId === plantId
    );
  }

  async addCartItem(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if this user already has this plant in their cart
    const existingItem = await this.getCartItem(insertCartItem.userId, insertCartItem.plantId);
    
    if (existingItem) {
      // Update the quantity of the existing item
      return this.updateCartItemQuantity(
        existingItem.userId, 
        existingItem.plantId, 
        existingItem.quantity + (insertCartItem.quantity || 1)
      ) as Promise<CartItem>;
    }
    
    // Create a new cart item
    const id = this.cartItemIdCounter++;
    const now = new Date();
    const cartItem: CartItem = { ...insertCartItem, id, addedAt: now };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItemQuantity(userId: number, plantId: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = await this.getCartItem(userId, plantId);
    if (!cartItem) return undefined;
    
    const updatedItem: CartItem = { ...cartItem, quantity };
    this.cartItems.set(cartItem.id, updatedItem);
    return updatedItem;
  }

  async removeCartItem(userId: number, plantId: number): Promise<boolean> {
    const cartItem = await this.getCartItem(userId, plantId);
    if (!cartItem) return false;
    
    return this.cartItems.delete(cartItem.id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const cartItems = await this.getCartItems(userId);
    
    for (const item of cartItems) {
      this.cartItems.delete(item.id);
    }
    
    return true;
  }

  // Payment operations
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const now = new Date();
    const payment: Payment = { ...insertPayment, id, paymentDate: now };
    this.payments.set(id, payment);
    return payment;
  }

  async getPaymentByOrderId(orderId: number): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(
      (payment) => payment.orderId === orderId
    );
  }

  // Seed data for initial application state
  private seedData() {
    // Seed vendors
    const vendor1 = this.createUser({
      username: "urbanjungle",
      password: "password123",
      email: "contact@urbanjungle.com",
      fullName: "Urban Jungle Inc.",
      userType: "vendor",
      companyName: "Urban Jungle Inc.",
      location: "New York, NY",
      phoneNumber: "555-123-4567"
    });

    const vendor2 = this.createUser({
      username: "greenthumb",
      password: "password123",
      email: "contact@greenthumb.com",
      fullName: "Green Thumb Co.",
      userType: "vendor",
      companyName: "Green Thumb Co.",
      location: "Chicago, IL",
      phoneNumber: "555-987-6543"
    });

    const vendor3 = this.createUser({
      username: "leafandstem",
      password: "password123",
      email: "contact@leafandstem.com",
      fullName: "Leaf & Stem Nursery",
      userType: "vendor",
      companyName: "Leaf & Stem Nursery",
      location: "San Francisco, CA",
      phoneNumber: "555-555-5555"
    });

    // Seed corporate user
    const corporate1 = this.createUser({
      username: "techcorp",
      password: "password123",
      email: "office@techcorp.com",
      fullName: "TechCorp",
      userType: "corporate",
      companyName: "TechCorp Inc.",
      location: "Austin, TX",
      phoneNumber: "555-789-0123"
    });

    // Start seeding plants and their care guides after user IDs are available
    Promise.all([vendor1, vendor2, vendor3]).then(async ([v1, v2, v3]) => {
      // Seed plants for vendor 1
      const plant1 = await this.createPlant({
        name: "Snake Plant",
        scientificName: "Sansevieria trifasciata",
        description: "Perfect for beginners and low light environments.",
        price: 45.00,
        difficulty: "beginner",
        waterRequirement: "low",
        lightRequirement: "low",
        imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        vendorId: v1.id,
        inStock: true
      });

      // Add care guide for plant 1
      await this.createCareGuide({
        plantId: plant1.id,
        wateringInstructions: "Water once every 2-3 weeks, allowing soil to dry out completely between waterings.",
        lightInstructions: "Tolerates low light but thrives in medium indirect light.",
        temperatureRange: "65-85°F",
        additionalCare: "Wipe leaves occasionally to remove dust.",
        weeklyRoutine: "Check soil moisture, wipe leaves if dusty.",
        troubleshooting: "Yellowing leaves often indicate overwatering."
      });

      // Add categories for plant 1
      await this.addPlantCategory({
        plantId: plant1.id,
        categoryName: "Low Light Plants"
      });
      await this.addPlantCategory({
        plantId: plant1.id,
        categoryName: "Air Purifying"
      });

      // Seed plants for vendor 2
      const plant2 = await this.createPlant({
        name: "Pothos",
        scientificName: "Epipremnum aureum",
        description: "Vining plant that purifies air and grows quickly.",
        price: 38.00,
        difficulty: "beginner",
        waterRequirement: "medium",
        lightRequirement: "low",
        imageUrl: "https://images.unsplash.com/photo-1602923668104-8ba5cb2b0360?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        vendorId: v2.id,
        inStock: true
      });

      // Add care guide for plant 2
      await this.createCareGuide({
        plantId: plant2.id,
        wateringInstructions: "Water when top inch of soil is dry, approximately once a week.",
        lightInstructions: "Thrives in medium to low indirect light.",
        temperatureRange: "65-85°F",
        additionalCare: "Can grow in water or soil. Trim occasionally to promote bushy growth.",
        weeklyRoutine: "Check soil moisture, wipe leaves with damp cloth, rotate for even growth.",
        troubleshooting: "Brown leaf tips can indicate low humidity."
      });

      // Add categories for plant 2
      await this.addPlantCategory({
        plantId: plant2.id,
        categoryName: "Low Light Plants"
      });
      await this.addPlantCategory({
        plantId: plant2.id,
        categoryName: "Air Purifying"
      });
      await this.addPlantCategory({
        plantId: plant2.id,
        categoryName: "Trailing Plants"
      });

      // Seed plants for vendor 3
      const plant3 = await this.createPlant({
        name: "ZZ Plant",
        scientificName: "Zamioculcas zamiifolia",
        description: "Extremely low maintenance plant with waxy leaves.",
        price: 52.00,
        difficulty: "beginner",
        waterRequirement: "low",
        lightRequirement: "low",
        imageUrl: "https://images.unsplash.com/photo-1637967886160-fd78dc3ce3f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        vendorId: v3.id,
        inStock: true
      });

      // Add care guide for plant 3
      await this.createCareGuide({
        plantId: plant3.id,
        wateringInstructions: "Water only when soil is completely dry, approximately every 3-4 weeks.",
        lightInstructions: "Tolerates low light but prefers medium indirect light.",
        temperatureRange: "65-85°F",
        additionalCare: "Extremely drought tolerant. Avoid overwatering.",
        weeklyRoutine: "Check soil moisture, dust leaves if needed.",
        troubleshooting: "Yellowing leaves usually indicate overwatering."
      });

      // Add categories for plant 3
      await this.addPlantCategory({
        plantId: plant3.id,
        categoryName: "Low Light Plants"
      });
      await this.addPlantCategory({
        plantId: plant3.id,
        categoryName: "Air Purifying"
      });
      await this.addPlantCategory({
        plantId: plant3.id,
        categoryName: "Drought Tolerant"
      });

      // Seed more plants
      const plant4 = await this.createPlant({
        name: "Monstera",
        scientificName: "Monstera deliciosa",
        description: "Statement plant with unique split leaves.",
        price: 65.00,
        difficulty: "intermediate",
        waterRequirement: "medium",
        lightRequirement: "medium",
        imageUrl: "https://images.unsplash.com/photo-1632318841793-7df17b3cb71e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        vendorId: v1.id,
        inStock: true
      });

      // Add care guide for plant 4
      await this.createCareGuide({
        plantId: plant4.id,
        wateringInstructions: "Water when top 2 inches of soil dry out, usually once a week.",
        lightInstructions: "Bright indirect light is ideal. Avoid direct sunlight.",
        temperatureRange: "65-85°F",
        additionalCare: "Provide support for climbing. Likes higher humidity.",
        weeklyRoutine: "Check soil moisture, mist leaves, wipe dust if needed.",
        troubleshooting: "Brown edges can indicate low humidity or inconsistent watering."
      });

      // Add categories for plant 4
      await this.addPlantCategory({
        plantId: plant4.id,
        categoryName: "Large Plants"
      });
      await this.addPlantCategory({
        plantId: plant4.id,
        categoryName: "Tropical Plants"
      });

      // Add more Indian tropical flowering plants
      const plant5 = await this.createPlant({
        name: "Hibiscus",
        scientificName: "Hibiscus rosa-sinensis",
        description: "Vibrant tropical flowering plant popular in Indian gardens and homes",
        price: 35.00,
        difficulty: "beginner",
        waterRequirement: "medium",
        lightRequirement: "high",
        imageUrl: "https://images.unsplash.com/photo-1596439757869-7aa082404d53?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        vendorId: v2.id,
        inStock: true
      });

      await this.createCareGuide({
        plantId: plant5.id,
        wateringInstructions: "Keep soil consistently moist but not soggy, water when top inch is dry.",
        lightInstructions: "Needs plenty of bright sunlight for optimal flowering.",
        temperatureRange: "70-90°F",
        additionalCare: "Flourishes in high humidity. Fertilize biweekly during growing season.",
        weeklyRoutine: "Check soil moisture, remove any spent flowers to promote new blooms.",
        troubleshooting: "Yellowing leaves may indicate overwatering, while lack of flowers suggests insufficient light."
      });

      await this.addPlantCategory({
        plantId: plant5.id,
        categoryName: "Flowering Plants"
      });
      await this.addPlantCategory({
        plantId: plant5.id,
        categoryName: "Tropical Plants"
      });
      await this.addPlantCategory({
        plantId: plant5.id,
        categoryName: "Indian Native"
      });

      const plant6 = await this.createPlant({
        name: "Mogra (Arabian Jasmine)",
        scientificName: "Jasminum sambac",
        description: "Intensely fragrant white flowers, culturally significant in Indian homes and gardens",
        price: 40.00,
        difficulty: "beginner",
        waterRequirement: "medium",
        lightRequirement: "medium",
        imageUrl: "https://images.unsplash.com/photo-1591378603223-e15b45a81640?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        vendorId: v1.id,
        inStock: true
      });

      await this.createCareGuide({
        plantId: plant6.id,
        wateringInstructions: "Keep soil evenly moist, especially during flowering.",
        lightInstructions: "Thrives in bright, indirect light. Some morning sun is beneficial.",
        temperatureRange: "65-85°F",
        additionalCare: "Enjoys humidity. Prune after flowering to maintain shape.",
        weeklyRoutine: "Check moisture, mist leaves, and inspect for pests.",
        troubleshooting: "Dropping buds may indicate temperature fluctuations or water stress."
      });

      await this.addPlantCategory({
        plantId: plant6.id,
        categoryName: "Flowering Plants"
      });
      await this.addPlantCategory({
        plantId: plant6.id,
        categoryName: "Fragrant Plants"
      });
      await this.addPlantCategory({
        plantId: plant6.id,
        categoryName: "Indian Native"
      });

      const plant7 = await this.createPlant({
        name: "Plumeria (Champa)",
        scientificName: "Plumeria rubra",
        description: "Beautiful fragrant flowers in white, yellow, and pink, perfect for Indian climate",
        price: 55.00,
        difficulty: "intermediate",
        waterRequirement: "low",
        lightRequirement: "high",
        imageUrl: "https://images.unsplash.com/photo-1570824066858-cf4eeba0e9e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        vendorId: v3.id,
        inStock: true
      });

      await this.createCareGuide({
        plantId: plant7.id,
        wateringInstructions: "Allow soil to dry out between waterings. Reduce during winter.",
        lightInstructions: "Full sun to partial shade. Needs 6+ hours of sunlight for optimal flowering.",
        temperatureRange: "65-90°F",
        additionalCare: "Drought tolerant once established. Protect from frost.",
        weeklyRoutine: "Check soil dryness, inspect for pests, remove dead flowers.",
        troubleshooting: "Yellowing leaves during growing season might indicate overwatering."
      });

      await this.addPlantCategory({
        plantId: plant7.id,
        categoryName: "Flowering Plants"
      });
      await this.addPlantCategory({
        plantId: plant7.id,
        categoryName: "Drought Tolerant"
      });
      await this.addPlantCategory({
        plantId: plant7.id,
        categoryName: "Tropical Plants"
      });

      // Seed reviews
      await this.createReview({
        userId: (await corporate1).id,
        plantId: plant1.id,
        vendorId: v1.id,
        rating: 5,
        comment: "Fantastic plant! Thriving in our office reception area with minimal care."
      });

      await this.createReview({
        userId: (await corporate1).id,
        plantId: plant2.id,
        vendorId: v2.id,
        rating: 4,
        comment: "Growing well and looks great in our meeting room."
      });

      await this.createReview({
        userId: (await corporate1).id,
        plantId: plant3.id,
        vendorId: v3.id,
        rating: 5,
        comment: "Perfect for our low-light office corners. Zero maintenance!"
      });
      
      await this.createReview({
        userId: (await corporate1).id,
        plantId: plant5.id,
        vendorId: v2.id,
        rating: 5,
        comment: "The hibiscus brings a vibrant pop of color to our office. Clients love it!"
      });
      
      await this.createReview({
        userId: (await corporate1).id,
        plantId: plant6.id,
        vendorId: v1.id,
        rating: 5,
        comment: "The fragrance of mogra fills our reception area. Perfect choice for our Mumbai office."
      });
    });
  }
}

export const storage = new MemStorage();
