import { config } from "dotenv";
config();
import pg from "pg";
import { parse as parsePgUrl } from "pg-connection-string";

const dbUrl = (process.env.NEON_DATABASE_URL || process.env.DATABASE_URL)!;
const parsed = parsePgUrl(dbUrl);
const pool = new pg.Pool({
  host:     parsed.host     ?? undefined,
  port:     parsed.port     ? Number(parsed.port) : 5432,
  user:     parsed.user     ?? undefined,
  password: parsed.password ?? undefined,
  database: parsed.database ?? undefined,
  ssl: dbUrl.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

await pool.query(`
  ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS theme_id TEXT,
    ADD COLUMN IF NOT EXISTS team_id  TEXT
`);
console.log("theme_id and team_id columns added to profiles (or already exist).");
await pool.end();
