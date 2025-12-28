import { Octokit } from "octokit";

export function getOctokit() {
	const token = Bun.env.GITHUB_TOKEN;
	if (!token) {
		throw new Error("$GITHUB_TOKEN is not set");
	}

	const octokit = new Octokit({ auth: token });
	return octokit;
}
