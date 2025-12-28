import {
	integer,
	jsonb,
	pgTable,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export const prsTable = pgTable("prs", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	org: varchar().notNull(),
	repo: varchar().notNull(),
	username: varchar().notNull(),
	countPRsCreated: integer().notNull(),
	countPRsReviewed: integer().notNull(),
	createdPRs: jsonb().notNull().default("[]"),
	reviewedPRs: jsonb().notNull().default("[]"),
	date: timestamp().notNull(),
	created: timestamp().notNull().defaultNow(),
	updated: timestamp().notNull().defaultNow(),
});

export type InsertPR = typeof prsTable.$inferInsert;
export type SelectPR = typeof prsTable.$inferSelect;

// import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// export const movies = sqliteTable("pr-counts", {
// 	  id: integer("id").primaryKey(),
// 	//   title: text("name"),
// 	//   releaseYear: integer("release_year"),
// 	// id: integer().primaryKey().generatedAlwaysAsIdentity(),
// 	org: text().notNull(),
// 	repo: text().notNull(),
// 	username: text().notNull(),
// 	countPRsCreated: integer().notNull(),
// 	countPRsReviewed: integer().notNull(),
// 	createdPRs: text({ mode: 'json' }).notNull(),
// 	reviewedPRs: text({ mode: 'json' }).notNull(),
// 	date: text('date', { mode: 'timestamp' }).notNull(),
// 	created: text('updated_at', { mode: 'timestamp' }).notNull(),
// 	updated: timestamp().notNull().defaultNow(),
// });
