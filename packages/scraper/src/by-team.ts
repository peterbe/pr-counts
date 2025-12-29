import type { Octokit } from "octokit";
import { getOctokit } from "./github-utils";

export async function byTeam({
	teamName,
	org,
	repo,
	users,
	includeDrafts = false,
}: {
	teamName: string;
	org: string;
	repo: string;
	users?: string[];
	includeDrafts?: boolean;
}) {
	const octokit = getOctokit();
	// console.log(`team:${teamName} org:${org}`);
	const members = await getTeamMembers(octokit, org, teamName);
	console.log("members", members);
	const memberMap = new Map(members.map((m) => [m.login, m]));
	// console.log({ users });
	const possibleUsernames = new Set(members.map((m) => m.login));
	if (users) {
		for (const user of users) {
			if (!possibleUsernames.has(user)) {
				throw new Error(`User ${user} is not a member of team ${teamName}`);
			}
		}
	}

	let _md = "";

	for (const login of users?.length ? users : possibleUsernames) {
		const prs = await getPRs(octokit, org, repo, login, { includeDrafts });
		console.log(`\n\n=== PRs by ${login} (${prs.length}) ===`);
		const loginUser = memberMap.get(login);
		for (const pr of prs) {
			console.log(`- ${pr.html_url} (${pr.title})`);
			_md = `| [@${login}](${loginUser}) | [${pr.title}](${pr.html_url}) |`;
			// console.log(pr);
			const reviews = await getReviews(octokit, org, repo, pr.number);
			console.log("REVIEWS...");
			console.log(reviews);
			break;
		}
		break;
	}
}

async function getTeamMembers(octokit: Octokit, org: string, teamSlug: string) {
	const members = await octokit.paginate(octokit.rest.teams.listMembersInOrg, {
		org,
		team_slug: teamSlug,
		per_page: 100,
	});

	return members.map((member) => ({
		login: member.login,
		id: member.id,
		avatarUrl: member.avatar_url,
		profileUrl: member.html_url,
		type: member.type,
	}));
}

async function getPRs(
	octokit: Octokit,
	org: string,
	repo: string,
	login: string,
	{ includeDrafts = false }: { includeDrafts?: boolean } = {},
) {
	let q = `is:pr is:open author:${login} org:${org} repo:${repo}`;
	if (!includeDrafts) {
		q += " draft:false";
	}
	const response = await octokit.request("GET /search/issues", {
		q,
		sort: "updated",
		// order: "desc",
		order: "asc",
		per_page: 100,
		advanced_search: "true",
		// headers: {
		// 	"X-GitHub-Api-Version": "2022-11-28",
		// },
	});
	// const response = await octokit.rest.search({
	//   q: `is:pr is:open repo:${owner}/${repo} author:${authorLogin}`,
	//   per_page: 100, // Adjust as needed for pagination
	// });

	return response.data.items;
}

async function getReviews(
	octokit: Octokit,
	owner: string,
	repo: string,
	pullNumber: number,
) {
	const reviews = await octokit.rest.pulls.listReviews({
		owner,
		repo,
		pull_number: pullNumber,
		per_page: 100, // max per page
	});
	return reviews.data;
}
