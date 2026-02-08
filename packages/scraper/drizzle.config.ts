// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "./src/db";

console.log("HERE IN DRIZZLE CONFIG", { DATABASE_URL });
export default defineConfig({
	dialect: "postgresql",
	schema: "./src/schema.ts",
	dbCredentials: {
		url: DATABASE_URL,
	},
});
