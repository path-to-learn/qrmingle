import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';

// Read DATABASE_URL once — never fall back to PGHOST / PGUSER / etc.
const dbUrl = process.env.DATABASE_URL!;
const isNeon = dbUrl?.includes('neon.tech');

let db: any;

if (isNeon) {
  // Neon HTTP driver makes HTTPS requests directly to neon.tech.
  // It reads only the URL string and completely ignores all PG* env vars.
  const sql = neon(dbUrl);
  db = drizzleNeon(sql);
} else {
  // Local / fallback: pass the URL string so postgres.js uses its parsed
  // values (host, port, user, password, database) and does NOT fall back
  // to PGHOST / PGUSER / PGPASSWORD / etc. from the environment.
  const client = postgres(dbUrl);
  db = drizzlePostgres(client);
}

export { db };
export { eq, and, desc, sql, asc } from 'drizzle-orm';
