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
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token      TEXT      PRIMARY KEY,
    user_id    INTEGER   NOT NULL,
    expires_at TIMESTAMP NOT NULL
  )
`);
console.log("password_reset_tokens table created (or already exists).");
await pool.end();
