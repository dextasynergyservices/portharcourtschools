import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // In build time or client bundle evaluation without env, provide a warning rather than crash
  console.warn("DATABASE_URL is not set in environment.");
}

const sql = neon(connectionString || "");
export const db = drizzle({ client: sql, schema });

export * from "./schema";
