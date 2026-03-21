import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, profiles, socialLinks, scanLogs, reviews } from '@shared/schema';

// Use standard postgres driver (works locally and with any Postgres)
const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client);

// Export for convenience
export { eq, and, desc, sql, asc } from 'drizzle-orm';
