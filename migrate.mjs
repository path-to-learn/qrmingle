import { config } from "dotenv";
config();
import { neon } from "@neondatabase/serverless";

const url = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!url) throw new Error("No database URL found");

const sql = neon(url);

const profiles = await sql("SELECT id, user_id, name, slug FROM profiles");
console.log("Profiles in DB:");
console.table(profiles);

const users = await sql("SELECT id, username FROM users");
console.log("Users in DB:");
console.table(users);
