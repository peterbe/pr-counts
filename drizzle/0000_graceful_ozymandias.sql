CREATE TABLE "prs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "prs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"org" varchar NOT NULL,
	"repo" varchar NOT NULL,
	"username" varchar NOT NULL,
	"countPRsCreated" integer NOT NULL,
	"countPRsReviewed" integer NOT NULL,
	"createdPRs" jsonb DEFAULT '[]' NOT NULL,
	"reviewedPRs" jsonb DEFAULT '[]' NOT NULL,
	"date" timestamp NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL,
	"updated" timestamp DEFAULT now() NOT NULL
);
