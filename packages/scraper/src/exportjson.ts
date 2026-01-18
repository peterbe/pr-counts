import { existsSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { db } from "./db";
import {
	prsTable as prs,
	type SelectPR,
	type SelectUser,
	users,
} from "./schema";

export async function exportJson({ destination }: { destination: string }) {
	if (!destination) {
		destination = "./packages/scraper/public/exports";
	}
	if (!existsSync(destination)) {
		mkdirSync(destination, { recursive: true });
	} else if (!statSync(destination).isDirectory()) {
		throw new Error(`Destination ${destination} is not a directory`);
	}
	console.log(`Exporting JSON data to ${destination}`);
	await exportPRCounts(destination);
	await exportPRs(destination);
	await exportUsers(destination);
}

async function exportPRCounts(destination: string) {
	type Select = Pick<
		SelectPR,
		| "org"
		| "repo"
		| "username"
		| "count_prs_created"
		| "count_prs_reviewed"
		| "date"
	>;
	const results: Select[] = await db
		.select({
			org: prs.org,
			repo: prs.repo,
			username: prs.username,
			count_prs_created: prs.count_prs_created,
			count_prs_reviewed: prs.count_prs_reviewed,
			date: prs.date,
		})
		.from(prs)
		.orderBy(prs.date, prs.username);

	type SubSelect = Pick<
		Select,
		"username" | "count_prs_created" | "count_prs_reviewed"
	>;
	const nwos: Record<string, SubSelect[]> = {};
	for (const result of results) {
		const { org, repo, ...rest } = result;
		const nwo = `${org}/${repo}`;
		if (!nwos[nwo]) {
			nwos[nwo] = [];
		}
		if (nwos[nwo]) {
			nwos[nwo].push(rest);
		}
	}
	const file = join(destination, `pr-counts.json`);
	await Bun.write(file, JSON.stringify(nwos, null, 2));
	console.log(`Exported ${results.length} records to ${file}`);
}

async function exportUsers(destination: string) {
	type Select = Pick<SelectUser, "username" | "userdata">;
	const results: Select[] = await db
		.select({
			username: users.username,
			userdata: users.userdata,
		})
		.from(users)
		.orderBy(users.username);

	type UserData = Record<string, string | number | boolean>;
	const userdatas: Record<string, UserData> = {};
	for (const result of results) {
		const { username, userdata } = result;
		userdatas[username] = userdata as unknown as UserData;
	}
	const file = join(destination, `users.json`);
	await Bun.write(file, JSON.stringify({ users: userdatas }, null, 2));
	console.log(`Exported ${results.length} records to ${file}`);
}

async function exportPRs(destination: string) {
	type Select = Pick<
		SelectPR,
		| "org"
		| "repo"
		| "username"
		| "count_prs_created"
		| "count_prs_reviewed"
		| "created_prs"
		| "reviewed_prs"
		| "date"
	>;
	const results: Select[] = await db
		.select({
			org: prs.org,
			repo: prs.repo,
			username: prs.username,
			count_prs_created: prs.count_prs_created,
			count_prs_reviewed: prs.count_prs_reviewed,
			date: prs.date,
			created_prs: prs.created_prs,
			reviewed_prs: prs.reviewed_prs,
		})
		.from(prs)
		.orderBy(prs.date, prs.username)
		.limit(10_000);

	type SubSelect = Pick<
		Select,
		| "count_prs_created"
		| "count_prs_reviewed"
		| "created_prs"
		| "reviewed_prs"
		| "date"
	>;
	const users: Record<string, SubSelect[]> = {};
	for (const result of results) {
		const { username, ...rest } = result;
		if (!users[username]) {
			users[username] = [];
		}
		users[username].push(rest);
	}
	for (const [username, userRecords] of Object.entries(users)) {
		const file = join(destination, `prs-${username}.json`);
		await Bun.write(
			file,
			JSON.stringify({ count: userRecords.length, prs: userRecords }, null, 2),
		);
		console.log(`Exported ${userRecords.length} records to ${file}`);
	}
}
