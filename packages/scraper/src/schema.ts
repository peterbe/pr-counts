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
	count_prs_created: integer().notNull(),
	count_prs_reviewed: integer().notNull(),
	created_prs: jsonb().notNull().default("[]"),
	reviewed_prs: jsonb().notNull().default("[]"),
	date: timestamp().notNull(),
	created: timestamp().notNull().defaultNow(),
	updated: timestamp().notNull().defaultNow(),
});

export type InsertPR = typeof prsTable.$inferInsert;
export type SelectPR = typeof prsTable.$inferSelect;

export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	username: varchar().notNull(),
	userdata: jsonb().notNull(),
	created: timestamp().notNull().defaultNow(),
	updated: timestamp().notNull().defaultNow(),
});

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
