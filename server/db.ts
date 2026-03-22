import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Initialize database client
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

// Export for convenience
export { eq, and, desc, sql, asc } from 'drizzle-orm';
