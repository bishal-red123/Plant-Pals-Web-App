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
  orderStatusEnum
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

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

  // Create HTTP server
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
