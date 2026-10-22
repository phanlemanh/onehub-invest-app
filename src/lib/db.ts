import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}
const connectionString = process.env.DATABASE_URL;

// Remote (Supabase pooler qua Vercel): Node ≥20 coi sslmode=require là
// định cấu hình không được hỗ trợ — strip về ssl không điều kiện.
const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");

export const pool = new Pool({
  connectionString,
  max: 5,
  ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
});
