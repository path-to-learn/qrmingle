import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';
import * as schema from '@shared/schema';

const isNeon = process.env.DATABASE_URL?.includes('neon.tech');

let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePostgres>;

if (isNeon) {
  // Production — Neon cloud database
  const sql = neon(process.env.DATABASE_URL!);
  db = drizzleNeon(sql);
} else {
  // Local — standard Postgres (Docker)
  const client = postgres(process.env.DATABASE_URL!);
  db = drizzlePostgres(client);
}

export { db };
export { eq, and, desc, sql, asc } from 'drizzle-orm';
