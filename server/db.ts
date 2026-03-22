import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';

// Prefer NEON_DATABASE_URL (external Neon endpoint, works in production).
// DATABASE_URL is runtime-managed by Replit and points to the internal
// helium host which is only reachable from the dev container, not from
// the production deployment.
const dbUrl = (process.env.NEON_DATABASE_URL || process.env.DATABASE_URL)!;
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
