import { getOctokit } from "./github-utils";
import { upsertPR } from "./upsert";

// const DB = Bun.file("past-queries.json");
const _DB_FILE = "past-queries.json";

export async function byUsers({
	usernames,
	org,
	repo,
	includeDrafts = false,
	daysBack = 1,
}: {
	usernames: string[];
	org: string;
	repo: string;
	includeDrafts?: boolean;
	daysBack?: number;
}) {
	// const octokit = getOctokit();

	const since = getPastDate(daysBack ?? 1); // e.g., last 1 days

	for (const username of usernames) {
		for (const created of dateRange(since)) {
			// console.log([username, created]);
			await byUserByDate({
				username,
				created,
				org,
				repo,
				includeDrafts,
			});
		}
	}
}

async function byUserByDate({
	username,
	created,
	org,
	repo,
	includeDrafts = false,
}: {
	username: string;
	created: Date;
	org: string;
	repo: string;
	includeDrafts?: boolean;
}) {
	const octokit = getOctokit();
	// const countPRsCreated = {
	// 	open: 0,
	// 	merged: 0,
	// };
	// for (const state of Object.keys(
	// 	countPRsCreated,
	// ) as (keyof typeof countPRsCreated)[]) {
	// let q = `is:pr is:${state} author:${username} org:${org} repo:${repo}`;
	// let countPRsCreated = 0;
	let q = `is:pr -state:closed author:${username} org:${org} repo:${repo}`;
	if (!includeDrafts) {
		q += " draft:false";
	}
	q += ` ${addCreatedParam(created)}`;
	// console.log("Querying:", q);

	const responseCreated = await octokit.request("GET /search/issues", { q });
	if (responseCreated.data.incomplete_results) {
		console.log(responseCreated.data);
		console.warn("Warning: The search results may be incomplete.");
	}
	const countPRsCreated = responseCreated.data.total_count;
	const createdPRs = simplifyPR(responseCreated.data.items, [
		"html_url",
		"number",
		"title",
		"state",
		"created_at",
	]);

	// countPRsCreated = data.total_count;
	// }
	// console.log("");
	// console.log(
	// 	"On",
	// 	created.toISOString().split("T")[0],
	// 	// `(${daysAgo} days ago)`,
	// );
	// console.log(`Summary for ${username} in ${org}/${repo}:`);
	// // console.log(`- Open PRs: ${countPRsCreated.open}`);
	// console.log(`- Created PRs: ${countPRsCreated}`);

	q = `is:pr -author:${username} org:${org} repo:${repo} reviewed-by:${username}`;
	if (!includeDrafts) {
		q += " draft:false";
	}
	q += ` ${addCreatedParam(created)}`;
	// console.log("Querying:", q);
	const responseReviewed = await octokit.request("GET /search/issues", {
		q,
		// per_page: 30, //XXX
		// per_page: 1,
	});
	if (responseReviewed.data.incomplete_results) {
		console.log(responseReviewed.data);
		console.warn("Warning: The search results may be incomplete.");
	}
	const countPRsReviewed = responseReviewed.data.total_count;
	const reviewedPRs: PR[] = simplifyPR(responseReviewed.data.items, [
		"html_url",
		"number",
		"title",
		"state",
		"created_at",
	]);
	// console.log(`- Reviewed PRs: ${countPRsReviewed}`);

	// console.log("");

	await dumpResults(
		{
			username,
			repo,
			org,
			// includeDrafts,
			created, //since.toISOString().split("T")[0] as string,
			// today: new Date().toISOString().split("T")[0] as string,
		},
		{
			countPRsCreated,
			countPRsReviewed,
			reviewedPRs,
			createdPRs,
		},
	);
}

type PR = Record<string, string | number | boolean>;

function simplifyPR(items: Array<Record<string, unknown>>, keys: string[]) {
	const keeps: PR[] = [];
	for (const item of items) {
		const keep: PR = {};
		for (const [key, value] of Object.entries(item)) {
			if (keys.includes(key)) {
				keep[key] = value as string | number | boolean;
			}
		}
		keeps.push(keep);
	}
	return keeps;
}

function dateRange(startDate: Date): Date[] {
	const dates: Date[] = [];
	const today = new Date();
	today.setSeconds(0);
	const currentDate = new Date(startDate);
	while (currentDate < today) {
		dates.push(new Date(currentDate));
		currentDate.setDate(currentDate.getDate() + 1);
	}
	return dates;
}

function addCreatedParam(since: Date): string {
	const sinceStr = since.toISOString().split("T")[0];
	return `created:${sinceStr}`;
	// const next = new Date(since);
	// next.setDate(next.getDate() + 1);
	// const nextStr = next.toISOString().split("T")[0];
	// return `created:>=${sinceStr} created:<${nextStr}`;
}

function getPastDate(daysAgo: number): Date {
	const date = new Date();
	date.setDate(date.getDate() - daysAgo);
	return date;
}

type Results = {
	countPRsCreated: number;
	countPRsReviewed: number;
	createdPRs: Array<PR>;
	reviewedPRs: Array<PR>;
};

async function dumpResults(
	params: Record<string, string | number | boolean | Date>,
	results: Results,
) {
	await upsertPR({
		org: params.org as string,
		repo: params.repo as string,
		username: params.username as string,
		countPRsCreated: results.countPRsCreated,
		countPRsReviewed: results.countPRsReviewed,
		createdPRs: results.createdPRs,
		reviewedPRs: results.reviewedPRs,
		date: params.created as Date,
	});
	// console.log("---- PARAMS ----");
	// console.log(params);
	// console.log("---- RESULTS ----");
	// console.log(results);
	// // console.log("\n--- DUMP ---");
	// const key = Object.values(params).join("|");
	// // console.log(`KEY: ${key}`);
	// // console.log("PARAMS:", JSON.stringify(params, null, 2));
	// // console.log("RESULTS:", JSON.stringify(results, null, 2));
	// const DB = Bun.file(DB_FILE);
	// const exists = await DB.exists();
	// if (!exists) {
	// 	console.log("Creating new DB file:", DB);
	// }
	// // console.log("DB exists:", exists);
	// const store = exists ? await DB.json() : {};
	// // console.log("STORE:", store);
	// store[key] = { params, results };
	// await Bun.write(DB_FILE, JSON.stringify(store, null, 2));
	// // await DB.write(JSON.stringify(store, null, 2));
}
