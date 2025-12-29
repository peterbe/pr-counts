import { formatDate } from "./date-formatter";
import { getOctokit } from "./github-utils";
import { hasData } from "./has-data";
import { upsertPR } from "./upsert";

type UserConfig = {
	username: string;
	startDate?: string;
};

export async function byUsers({
	users,
	org,
	repo,
	includeDrafts = false,
	daysBack = 1,
	forceRefresh = false,
	sleepSeconds = 0,
	date,
}: {
	users: (string | UserConfig)[];
	org: string;
	repo: string;
	includeDrafts?: boolean;
	daysBack?: number | string;
	forceRefresh?: boolean;
	sleepSeconds?: number | string;
	date?: string;
}) {
	sleepSeconds = Number(sleepSeconds);
	daysBack = Number(daysBack);

	const since = getPastDate(daysBack ?? 1); // e.g., last 1 days
	type Task = {
		username: string;
		created: Date;
	};
	const tasks: Task[] = [];
	const skips: Task[] = [];

	const createdDates = date ? [new Date(date)] : dateRange(since);

	for (const created of createdDates) {
		for (const usernameOrConfig of users) {
			const username =
				typeof usernameOrConfig === "string"
					? usernameOrConfig
					: usernameOrConfig.username;
			const startDate =
				typeof usernameOrConfig === "string"
					? undefined
					: usernameOrConfig.startDate;
			if (startDate) {
				const startDateObj = new Date(startDate);
				if (created < startDateObj) {
					continue;
				}
			}
			let has = false;
			if (!forceRefresh) {
				has = await hasData({
					date: created,
					org,
					repo,
					username,
				});
			}
			if (has) {
				skips.push({ username, created });
				continue;
			}

			tasks.push({
				username,
				created,
			});
		}
	}
	if (skips.length > 0) {
		console.log("Skipped tasks:", skips.length);
	}
	console.log("Total tasks to process:", tasks.length);
	for (const { created, username } of tasks) {
		console.log("Fetching data for", [created, formatDate(created), username]);
		await byUserByDate({
			username,
			created,
			org,
			repo,
			includeDrafts,
		});
		if (sleepSeconds > 0) {
			console.log("Sleeping for", sleepSeconds, "seconds...");
			await new Promise((resolve) => setTimeout(resolve, sleepSeconds * 1000));
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

	let q = `is:pr author:${username} org:${org} repo:${repo}`;
	if (!includeDrafts) {
		q += " draft:false";
	}
	q += ` ${addCreatedParam(created)}`;
	console.log("Querying:", q);

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

	q = `is:pr -author:${username} org:${org} repo:${repo} reviewed-by:${username}`;
	if (!includeDrafts) {
		q += " draft:false";
	}
	q += ` ${addCreatedParam(created)}`;
	// console.log("Querying:", q);
	const responseReviewed = await octokit.request("GET /search/issues", {
		q,
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

	console.log({
		countPRsCreated,
		countPRsReviewed,
		// reviewedPRs,
		// createdPRs,
	});

	await dumpResults(
		{
			username,
			repo,
			org,
			created,
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
		count_prs_created: results.countPRsCreated,
		count_prs_reviewed: results.countPRsReviewed,
		created_prs: results.createdPRs,
		reviewed_prs: results.reviewedPRs,
		date: params.created as Date,
	});
}
