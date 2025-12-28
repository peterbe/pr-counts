// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "./src/db";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/schema.ts",
	dbCredentials: {
		url: DATABASE_URL,
	},
});
