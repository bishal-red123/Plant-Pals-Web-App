import { db } from './index';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';

// Function to set up tables
async function setupTables() {
  console.log('Creating database tables...');
  
  // Create enums
  await db.execute(sql`CREATE TYPE IF NOT EXISTS user_type AS ENUM ('corporate', 'vendor')`);
  await db.execute(sql`CREATE TYPE IF NOT EXISTS difficulty AS ENUM ('beginner', 'intermediate', 'expert')`);
  await db.execute(sql`CREATE TYPE IF NOT EXISTS light_requirement AS ENUM ('low', 'medium', 'high')`);
  await db.execute(sql`CREATE TYPE IF NOT EXISTS water_requirement AS ENUM ('low', 'medium', 'high')`);
  await db.execute(sql`CREATE TYPE IF NOT EXISTS order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'canceled')`);
  await db.execute(sql`CREATE TYPE IF NOT EXISTS payment_method AS ENUM ('credit_card', 'debit_card', 'upi', 'net_banking', 'cash_on_delivery')`);
  
  // Drop tables if they exist (for clean restart)
  await db.execute(sql`DROP TABLE IF EXISTS payments`);
  await db.execute(sql`DROP TABLE IF EXISTS cart_items`);
  await db.execute(sql`DROP TABLE IF EXISTS reviews`);
  await db.execute(sql`DROP TABLE IF EXISTS order_items`);
  await db.execute(sql`DROP TABLE IF EXISTS orders`);
  await db.execute(sql`DROP TABLE IF EXISTS plant_categories`);
  await db.execute(sql`DROP TABLE IF EXISTS care_guides`);
  await db.execute(sql`DROP TABLE IF EXISTS plants`);
  await db.execute(sql`DROP TABLE IF EXISTS users`);
  
  // Create tables
  await db.execute(sql`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      user_type user_type NOT NULL,
      company_name TEXT,
      location TEXT,
      phone_number TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `);
  
  await db.execute(sql`
    CREATE TABLE plants (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      scientific_name TEXT NOT NULL,
      description TEXT NOT NULL,
      price DOUBLE PRECISION NOT NULL,
      difficulty difficulty NOT NULL DEFAULT 'beginner',
      water_requirement water_requirement NOT NULL,
      light_requirement light_requirement NOT NULL,
      image_url TEXT,
      vendor_id INTEGER NOT NULL,
      in_stock BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `);
  
  await db.execute(sql`
    CREATE TABLE care_guides (
      id SERIAL PRIMARY KEY,
      plant_id INTEGER NOT NULL,
      watering_instructions TEXT NOT NULL,
      light_instructions TEXT NOT NULL,
      temperature_range TEXT NOT NULL,
      additional_care TEXT,
      weekly_routine TEXT,
      troubleshooting TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `);
  
  await db.execute(sql`
    CREATE TABLE plant_categories (
      id SERIAL PRIMARY KEY,
      plant_id INTEGER NOT NULL,
      category_name TEXT NOT NULL
    )
  `);
  
  await db.execute(sql`
    CREATE TABLE orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      vendor_id INTEGER NOT NULL,
      status order_status NOT NULL DEFAULT 'pending',
      total_amount DOUBLE PRECISION NOT NULL,
      order_date TIMESTAMP DEFAULT NOW() NOT NULL,
      delivery_date TIMESTAMP,
      tracking_number TEXT,
      notes TEXT
    )
  `);
  
  await db.execute(sql`
    CREATE TABLE order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL,
      plant_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price_per_unit DOUBLE PRECISION NOT NULL
    )
  `);
  
  await db.execute(sql`
    CREATE TABLE reviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      plant_id INTEGER,
      vendor_id INTEGER,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `);
  
  await db.execute(sql`
    CREATE TABLE cart_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      plant_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      added_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `);
  
  await db.execute(sql`
    CREATE TABLE payments (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL,
      payment_method payment_method NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      payment_status TEXT NOT NULL,
      transaction_id TEXT,
      payment_date TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `);
  
  console.log('Database tables created successfully!');
}

// Function to seed initial data
async function seedData() {
  console.log('Seeding database...');
  
  // Seed vendors
  const [vendor1] = await db.insert(schema.users).values({
    username: "urbanjungle",
    password: "password123",
    email: "contact@urbanjungle.com",
    fullName: "Urban Jungle Inc.",
    userType: "vendor",
    companyName: "Urban Jungle Inc.",
    location: "New York, NY",
    phoneNumber: "555-123-4567"
  }).returning();
  
  const [vendor2] = await db.insert(schema.users).values({
    username: "greenthumb",
    password: "password123",
    email: "contact@greenthumb.com",
    fullName: "Green Thumb Co.",
    userType: "vendor",
    companyName: "Green Thumb Co.",
    location: "Chicago, IL",
    phoneNumber: "555-987-6543"
  }).returning();
  
  const [vendor3] = await db.insert(schema.users).values({
    username: "leafandstem",
    password: "password123",
    email: "contact@leafandstem.com",
    fullName: "Leaf & Stem Nursery",
    userType: "vendor",
    companyName: "Leaf & Stem Nursery",
    location: "San Francisco, CA",
    phoneNumber: "555-555-5555"
  }).returning();
  
  // Seed corporate user
  const [corporate1] = await db.insert(schema.users).values({
    username: "techcorp",
    password: "password123",
    email: "office@techcorp.com",
    fullName: "TechCorp",
    userType: "corporate",
    companyName: "TechCorp Inc.",
    location: "Austin, TX",
    phoneNumber: "555-789-0123"
  }).returning();
  
  // Seed plants
  const [plant1] = await db.insert(schema.plants).values({
    name: "Snake Plant",
    scientificName: "Sansevieria trifasciata",
    description: "Perfect for beginners and low light environments.",
    price: 45.00,
    difficulty: "beginner",
    waterRequirement: "low",
    lightRequirement: "low",
    imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    vendorId: vendor1.id,
    inStock: true
  }).returning();
  
  // Add care guide for plant 1
  await db.insert(schema.careGuides).values({
    plantId: plant1.id,
    wateringInstructions: "Water once every 2-3 weeks, allowing soil to dry out completely between waterings.",
    lightInstructions: "Tolerates low light but thrives in medium indirect light.",
    temperatureRange: "65-85°F",
    additionalCare: "Wipe leaves occasionally to remove dust.",
    weeklyRoutine: "Check soil moisture, wipe leaves if dusty.",
    troubleshooting: "Yellowing leaves often indicate overwatering."
  });
  
  // Add categories for plant 1
  await db.insert(schema.plantCategories).values({
    plantId: plant1.id,
    categoryName: "Low Light Plants"
  });
  
  await db.insert(schema.plantCategories).values({
    plantId: plant1.id,
    categoryName: "Air Purifying"
  });
  
  // Seed more plants
  const [plant2] = await db.insert(schema.plants).values({
    name: "Pothos",
    scientificName: "Epipremnum aureum",
    description: "Vining plant that purifies air and grows quickly.",
    price: 38.00,
    difficulty: "beginner",
    waterRequirement: "medium",
    lightRequirement: "low",
    imageUrl: "https://images.unsplash.com/photo-1602923668104-8ba5cb2b0360?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    vendorId: vendor2.id,
    inStock: true
  }).returning();
  
  // Add care guide for plant 2
  await db.insert(schema.careGuides).values({
    plantId: plant2.id,
    wateringInstructions: "Water when top inch of soil is dry, approximately once a week.",
    lightInstructions: "Thrives in medium to low indirect light.",
    temperatureRange: "65-85°F",
    additionalCare: "Can grow in water or soil. Trim occasionally to promote bushy growth.",
    weeklyRoutine: "Check soil moisture, wipe leaves with damp cloth, rotate for even growth.",
    troubleshooting: "Brown leaf tips can indicate low humidity."
  });
  
  // Add categories for plant 2
  await db.insert(schema.plantCategories).values({
    plantId: plant2.id,
    categoryName: "Low Light Plants"
  });
  
  await db.insert(schema.plantCategories).values({
    plantId: plant2.id,
    categoryName: "Air Purifying"
  });
  
  await db.insert(schema.plantCategories).values({
    plantId: plant2.id,
    categoryName: "Trailing Plants"
  });
  
  // Add more plants
  const [plant3] = await db.insert(schema.plants).values({
    name: "ZZ Plant",
    scientificName: "Zamioculcas zamiifolia",
    description: "Extremely low maintenance plant with waxy leaves.",
    price: 52.00,
    difficulty: "beginner",
    waterRequirement: "low",
    lightRequirement: "low",
    imageUrl: "https://images.unsplash.com/photo-1637967886160-fd78dc3ce3f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    vendorId: vendor3.id,
    inStock: true
  }).returning();
  
  // Add care guide for plant 3
  await db.insert(schema.careGuides).values({
    plantId: plant3.id,
    wateringInstructions: "Water only when soil is completely dry, approximately every 3-4 weeks.",
    lightInstructions: "Tolerates low light but prefers medium indirect light.",
    temperatureRange: "65-85°F",
    additionalCare: "Extremely drought tolerant. Avoid overwatering.",
    weeklyRoutine: "Check soil moisture, dust leaves if needed.",
    troubleshooting: "Yellowing leaves usually indicate overwatering."
  });
  
  // Add categories for plant 3
  await db.insert(schema.plantCategories).values({
    plantId: plant3.id,
    categoryName: "Low Light Plants"
  });
  
  await db.insert(schema.plantCategories).values({
    plantId: plant3.id,
    categoryName: "Air Purifying"
  });
  
  await db.insert(schema.plantCategories).values({
    plantId: plant3.id,
    categoryName: "Drought Tolerant"
  });
  
  // Add Indian tropical flowering plants
  const [plant4] = await db.insert(schema.plants).values({
    name: "Hibiscus",
    scientificName: "Hibiscus rosa-sinensis",
    description: "Vibrant tropical flowering plant popular in Indian gardens and homes",
    price: 35.00,
    difficulty: "beginner",
    waterRequirement: "medium",
    lightRequirement: "high",
    imageUrl: "https://images.unsplash.com/photo-1596439757869-7aa082404d53?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    vendorId: vendor2.id,
    inStock: true
  }).returning();
  
  await db.insert(schema.careGuides).values({
    plantId: plant4.id,
    wateringInstructions: "Keep soil consistently moist but not soggy, water when top inch is dry.",
    lightInstructions: "Needs plenty of bright sunlight for optimal flowering.",
    temperatureRange: "70-90°F",
    additionalCare: "Flourishes in high humidity. Fertilize biweekly during growing season.",
    weeklyRoutine: "Check soil moisture, remove any spent flowers to promote new blooms.",
    troubleshooting: "Yellowing leaves may indicate overwatering, while lack of flowers suggests insufficient light."
  });
  
  await db.insert(schema.plantCategories).values({
    plantId: plant4.id,
    categoryName: "Flowering Plants"
  });
  
  await db.insert(schema.plantCategories).values({
    plantId: plant4.id,
    categoryName: "Tropical Plants"
  });
  
  await db.insert(schema.plantCategories).values({
    plantId: plant4.id,
    categoryName: "Indian Native"
  });
  
  // Add reviews
  await db.insert(schema.reviews).values({
    userId: corporate1.id,
    plantId: plant1.id,
    vendorId: vendor1.id,
    rating: 5,
    comment: "Fantastic plant! Thriving in our office reception area with minimal care."
  });
  
  await db.insert(schema.reviews).values({
    userId: corporate1.id,
    plantId: plant2.id,
    vendorId: vendor2.id,
    rating: 4,
    comment: "Growing well and looks great in our meeting room."
  });
  
  console.log('Database seeded successfully!');
}

// Main function to run the migration
export async function migrate() {
  try {
    await setupTables();
    await seedData();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration if this file is executed directly
// Note: We're using ESM modules, so we don't need to check if this is the main module
// The migrate function will be called from server/index.ts