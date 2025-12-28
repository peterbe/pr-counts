import { drizzle } from "drizzle-orm/node-postgres";

export const DATABASE_URL =
	process.env.DATABASE_URL || "postgres://localhost:5432/pr-counts";

export const db = drizzle(DATABASE_URL);
