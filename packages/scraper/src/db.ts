import { drizzle } from "drizzle-orm/node-postgres";

export const DATABASE_URL =
	process.env.DATABASE_URL || "postgres://localhost:5432/pr-counts";

console.log("HERE IN DB.ts", { DATABASE_URL });

export const db = drizzle(DATABASE_URL);
