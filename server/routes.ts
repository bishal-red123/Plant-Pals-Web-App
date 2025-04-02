import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertPlantSchema, 
  insertCareGuideSchema, 
  insertOrderSchema, 
  insertOrderItemSchema, 
  insertReviewSchema,
  insertCartItemSchema,
  insertPaymentSchema,
  orderStatusEnum,
  type InsertPlant
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";
import Stripe from "stripe";

// Check for required environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not set. Stripe payment features will not work.');
  console.error('Set this value in your environment variables');
}

if (!process.env.VITE_STRIPE_PUBLIC_KEY) {
  console.error('VITE_STRIPE_PUBLIC_KEY is not set. Client-side Stripe integration will not work.');
  console.error('Set this value in your environment variables');
}

let stripe: Stripe | null = null;

// Initialize Stripe with better error handling
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16" as any,
    });
    console.log('Stripe initialized successfully');
  }
} catch (error: any) {
  console.error('Failed to initialize Stripe:', error.message);
  // Don't throw error here - we'll handle this gracefully at the API level
}

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session handling
  app.use(
    session({
      cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "greenspace-secret",
      store: new SessionStore({
        checkPeriod: 24 * 60 * 60 * 1000, // 24 hours
      }),
    })
  );

  // Setup passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByEmail(username);
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Serialize and deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth routes
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json({ user: req.user });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {});
    res.json({ success: true });
  });

  app.get("/api/auth/current-user", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ user: req.user });
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user with email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Check if username is taken
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const newUser = await storage.createUser(userData);
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after registration" });
        }
        return res.status(201).json({ user: newUser });
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Plant routes
  app.get("/api/plants", async (req, res) => {
    try {
      const plants = await storage.getPlants();
      res.json(plants);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get plants for a specific vendor
  app.get("/api/plants/vendor/:id", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const plants = await storage.getPlantsByVendor(vendorId);
      res.json(plants);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/plants/:id", async (req, res) => {
    try {
      const plantId = parseInt(req.params.id);
      const plant = await storage.getPlantById(plantId);
      
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      
      // Get plant care guide
      const careGuide = await storage.getCareGuideByPlantId(plantId);
      
      // Get plant categories
      const categories = await storage.getPlantCategories(plantId);
      
      // Get vendor details
      const vendor = await storage.getVendorById(plant.vendorId);
      
      // Get plant reviews
      const reviews = await storage.getReviewsByPlant(plantId);
      
      res.json({
        plant,
        careGuide,
        categories: categories.map(c => c.categoryName),
        vendor,
        reviews
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/plants", isAuthenticated, isVendor, async (req, res) => {
    try {
      const user = req.user as any;
      const plantData = insertPlantSchema.parse(req.body);
      
      // Ensure vendorId is set to the current user's id
      plantData.vendorId = user.id;
      
      const newPlant = await storage.createPlant(plantData);
      res.status(201).json(newPlant);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/plants/:id/care-guide", isAuthenticated, isVendor, async (req, res) => {
    try {
      const plantId = parseInt(req.params.id);
      const plant = await storage.getPlantById(plantId);
      
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      
      // Check if plant belongs to vendor
      const user = req.user as any;
      if (plant.vendorId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to add care guide to this plant" });
      }
      
      const careGuideData = insertCareGuideSchema.parse(req.body);
      careGuideData.plantId = plantId;
      
      const existingGuide = await storage.getCareGuideByPlantId(plantId);
      if (existingGuide) {
        return res.status(400).json({ message: "Care guide already exists for this plant" });
      }
      
      const newCareGuide = await storage.createCareGuide(careGuideData);
      res.status(201).json(newCareGuide);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.patch("/api/plants/:id", isAuthenticated, isVendor, async (req, res) => {
    try {
      const plantId = parseInt(req.params.id);
      const plant = await storage.getPlantById(plantId);
      
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      
      // Check if plant belongs to vendor
      const user = req.user as any;
      if (plant.vendorId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to update this plant" });
      }
      
      // Only allow updating certain fields
      const allowedUpdates = ['name', 'scientificName', 'description', 'price', 'inStock', 'imageUrl', 'waterRequirement', 'lightRequirement', 'difficulty'];
      const updateData: Partial<InsertPlant> = {};
      
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updateData[key as keyof InsertPlant] = req.body[key];
        }
      });
      
      const updatedPlant = await storage.updatePlant(plantId, updateData);
      res.json(updatedPlant);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Vendor routes
  app.get("/api/vendors", async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/vendors/:id", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const vendor = await storage.getVendorById(vendorId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      // Get vendor's plants
      const plants = await storage.getPlantsByVendor(vendorId);
      
      // Get vendor reviews
      const reviews = await storage.getReviewsByVendor(vendorId);
      
      res.json({
        vendor,
        plants,
        reviews
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Order routes
  app.post("/api/orders", isAuthenticated, isCorporate, async (req, res) => {
    try {
      const user = req.user as any;
      const orderData = insertOrderSchema.parse(req.body);
      
      // Ensure userId is set to the current user's id
      orderData.userId = user.id;
      
      const newOrder = await storage.createOrder(orderData);
      res.status(201).json(newOrder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/orders/:id/items", isAuthenticated, isCorporate, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if order belongs to user
      const user = req.user as any;
      if (order.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to add items to this order" });
      }
      
      const orderItemData = insertOrderItemSchema.parse(req.body);
      orderItemData.orderId = orderId;
      
      const newOrderItem = await storage.addOrderItem(orderItemData);
      res.status(201).json(newOrderItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      let orders;
      
      if (user.userType === 'corporate') {
        orders = await storage.getOrdersByUser(user.id);
      } else if (user.userType === 'vendor') {
        orders = await storage.getOrdersByVendor(user.id);
      } else {
        return res.status(403).json({ message: "Invalid user type" });
      }
      
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user has access to order
      const user = req.user as any;
      if (user.userType === 'corporate' && order.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to view this order" });
      }
      
      if (user.userType === 'vendor' && order.vendorId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to view this order" });
      }
      
      // Get order items
      const orderItems = await storage.getOrderItems(orderId);
      
      res.json({
        order,
        items: orderItems
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/orders/:id/status", isAuthenticated, isVendor, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if order belongs to vendor
      const user = req.user as any;
      if (order.vendorId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to update this order" });
      }
      
      const { status } = req.body;
      
      // Validate status
      if (!orderStatusEnum.enumValues.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      res.json(updatedOrder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Review routes
  app.post("/api/reviews", isAuthenticated, isCorporate, async (req, res) => {
    try {
      const user = req.user as any;
      const reviewData = insertReviewSchema.parse(req.body);
      
      // Ensure userId is set to the current user's id
      reviewData.userId = user.id;
      
      // Validate that either plantId or vendorId is provided
      if (!reviewData.plantId && !reviewData.vendorId) {
        return res.status(400).json({ message: "Either plantId or vendorId must be provided" });
      }
      
      const newReview = await storage.createReview(reviewData);
      res.status(201).json(newReview);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Cart routes
  app.get("/api/cart", isAuthenticated, isCorporate, async (req, res) => {
    try {
      const user = req.user as any;
      const cartItems = await storage.getCartItems(user.id);
      
      // Get full details for each plant in the cart
      const cartItemsWithDetails = await Promise.all(
        cartItems.map(async (item) => {
          const plant = await storage.getPlantById(item.plantId);
          return {
            ...item,
            plant
          };
        })
      );
      
      res.json(cartItemsWithDetails);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/cart", isAuthenticated, isCorporate, async (req, res) => {
    try {
      console.log("Cart POST request body:", JSON.stringify(req.body));
      const user = req.user as any;
      
      // Manually create cart item data with proper types
      const cartItemData = {
        userId: user.id,
        plantId: parseInt(req.body.plantId),
        quantity: parseInt(req.body.quantity) || 1
      };
      
      console.log("Processed cart item data:", JSON.stringify(cartItemData));
      
      // Check if the plant exists
      const plant = await storage.getPlantById(cartItemData.plantId);
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      
      // Check if plant is in stock
      if (!plant.inStock) {
        return res.status(400).json({ message: "Plant is out of stock" });
      }
      
      const cartItem = await storage.addCartItem(cartItemData);
      res.status(201).json(cartItem);
    } catch (error: any) {
      console.error("Cart error:", error.message);
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/cart/:plantId", isAuthenticated, isCorporate, async (req, res) => {
    try {
      const user = req.user as any;
      const plantId = parseInt(req.params.plantId);
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const updatedItem = await storage.updateCartItemQuantity(user.id, plantId, quantity);
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(updatedItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/cart/:plantId", isAuthenticated, isCorporate, async (req, res) => {
    try {
      const user = req.user as any;
      const plantId = parseInt(req.params.plantId);
      
      const removed = await storage.removeCartItem(user.id, plantId);
      if (!removed) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/cart", isAuthenticated, isCorporate, async (req, res) => {
    try {
      const user = req.user as any;
      await storage.clearCart(user.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Checkout and payment routes
  app.post("/api/checkout", isAuthenticated, isCorporate, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable." });
      }

      const user = req.user as any;
      
      // Get cart items
      const cartItems = await storage.getCartItems(user.id);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total amount
      let totalAmount = 0;
      const items = await Promise.all(
        cartItems.map(async (item) => {
          const plant = await storage.getPlantById(item.plantId);
          if (!plant) {
            throw new Error(`Plant with id ${item.plantId} not found`);
          }
          
          if (!plant.inStock) {
            throw new Error(`Plant "${plant.name}" is out of stock`);
          }
          
          const itemTotal = plant.price * item.quantity;
          totalAmount += itemTotal;
          
          return {
            id: item.id,
            plantId: item.plantId,
            name: plant.name,
            price: plant.price,
            quantity: item.quantity,
            total: itemTotal
          };
        })
      );

      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // convert to cents
        currency: "usd",
        metadata: {
          userId: user.id.toString(),
          userEmail: user.email
        }
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        totalAmount,
        items
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/payment/success", isAuthenticated, isCorporate, async (req, res) => {
    try {
      const user = req.user as any;
      const { paymentIntentId, vendorId } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({ message: "paymentIntentId is required" });
      }
      
      if (!vendorId) {
        return res.status(400).json({ message: "vendorId is required" });
      }
      
      // Verify that vendor exists
      const vendor = await storage.getVendorById(vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      // Get cart items
      const cartItems = await storage.getCartItems(user.id);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total amount
      let totalAmount = 0;
      const items = await Promise.all(
        cartItems.map(async (item) => {
          const plant = await storage.getPlantById(item.plantId);
          if (!plant) {
            throw new Error(`Plant with id ${item.plantId} not found`);
          }
          
          const itemTotal = plant.price * item.quantity;
          totalAmount += itemTotal;
          
          return {
            plantId: item.plantId,
            quantity: item.quantity,
            pricePerUnit: plant.price
          };
        })
      );
      
      // Create order
      const order = await storage.createOrder({
        vendorId,
        userId: user.id,
        totalAmount,
        status: "pending",
        deliveryDate: null,
        trackingNumber: null,
        notes: null
      });
      
      // Add order items
      for (const item of items) {
        await storage.addOrderItem({
          orderId: order.id,
          plantId: item.plantId,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit
        });
      }
      
      // Record payment
      const payment = await storage.createPayment({
        orderId: order.id,
        paymentMethod: "credit_card",
        amount: totalAmount,
        paymentStatus: "completed",
        transactionId: paymentIntentId
      });
      
      // Clear the cart
      await storage.clearCart(user.id);
      
      res.json({
        success: true,
        order,
        payment
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Create HTTP server
  // Stripe payment processing
  app.post("/api/create-payment-intent", isAuthenticated, isCorporate, async (req, res) => {
    try {
      console.log("Creating payment intent with Stripe"); 
      
      if (!stripe) {
        console.error("Stripe is not configured");
        return res.status(500).json({ message: "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable." });
      }

      // Get cart items to calculate the payment amount
      const user = req.user as any;
      const cartItems = await storage.getCartItems(user.id);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Your cart is empty" });
      }
      
      // Calculate total amount from cart items
      let totalAmount = 0;
      const items = await Promise.all(
        cartItems.map(async (item) => {
          const plant = await storage.getPlantById(item.plantId);
          if (!plant) {
            throw new Error(`Plant with id ${item.plantId} not found`);
          }
          const itemTotal = plant.price * item.quantity;
          totalAmount += itemTotal;
          return { name: plant.name, price: plant.price, quantity: item.quantity };
        })
      );
      
      console.log(`Creating payment intent for total amount: ${totalAmount}`);
      
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: "usd", // Changed from INR to USD for broader compatibility
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          userId: user.id.toString(),
          email: user.email || 'unknown',
          items: JSON.stringify(items.map(i => `${i.name} x${i.quantity}`))
        }
      });

      console.log("Successfully created payment intent");
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        amount: totalAmount,
        items: items
      });
    } catch (error: any) {
      console.error("Stripe payment intent error:", error.message);
      res.status(500).json({ message: error.message || "Failed to create payment intent" });
    }
  });

  // Handle webhook events from Stripe (for production)
  app.post('/api/webhook', async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }

    const payload = req.body;
    
    try {
      // In production, this should verify the webhook signature
      // const event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
      const event = payload;

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
          // Process fulfillment here
          break;
        case 'payment_intent.payment_failed':
          const failedIntent = event.data.object;
          console.log(`Payment failed: ${failedIntent.last_payment_error?.message}`);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (err: any) {
      res.status(400).json({ message: `Webhook Error: ${err.message}` });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

// Middleware to check if user is a vendor
function isVendor(req: Request, res: Response, next: Function) {
  const user = req.user as any;
  if (user && user.userType === 'vendor') {
    return next();
  }
  res.status(403).json({ message: "Vendor access required" });
}

// Middleware to check if user is a corporate client
function isCorporate(req: Request, res: Response, next: Function) {
  const user = req.user as any;
  if (user && user.userType === 'corporate') {
    return next();
  }
  res.status(403).json({ message: "Corporate access required" });
}
