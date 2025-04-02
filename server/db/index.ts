import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Create the PostgreSQL client
const client = postgres(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres');

// Create the Drizzle ORM instance
export const db = drizzle(client, { schema });