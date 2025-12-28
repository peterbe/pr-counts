// import { SQL } from "bun";
// import { drizzle } from "drizzle-orm/bun-sql";
import { drizzle } from "drizzle-orm/node-postgres";

export const DATABASE_URL =
	process.env.DATABASE_URL || "postgres://localhost:5432/pr-counts";
// export const sql = new SQL(DATABASE_URL);
// export const db = drizzle(DATABASE_URL);

// export const client = new SQL(DATABASE_URL);
// export const db = drizzle({ client });

export const db = drizzle(DATABASE_URL);

// import { drizzle } from "drizzle-orm/bun-sqlite";
// import { Database } from "bun:sqlite";

// const sqlite = new Database("sqlite.db");
// export const db = drizzle(sqlite);
