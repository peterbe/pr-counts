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
}: {
	users: (string | UserConfig)[];
	org: string;
	repo: string;
	includeDrafts?: boolean;
	daysBack?: number | string;
	forceRefresh?: boolean;
	sleepSeconds?: number | string;
}) {
	sleepSeconds = Number(sleepSeconds);
	daysBack = Number(daysBack);

	const since = getPastDate(daysBack ?? 1); // e.g., last 1 days

	for (const created of dateRange(since)) {
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
					console.log("Skipping date before start date for", username);
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
				console.log("Skipping, already have data for", [
					formatDate(created),
					username,
				]);
				continue;
			}

			console.log("Fetching data for", [formatDate(created), username]);
			await byUserByDate({
				username,
				created,
				org,
				repo,
				includeDrafts,
			});
			if (sleepSeconds > 0) {
				console.log("Sleeping for", sleepSeconds, "seconds...");
				await new Promise((resolve) =>
					setTimeout(resolve, sleepSeconds * 1000),
				);
			}
		}
	}
}

function formatDate(date: Date): string {
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
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
