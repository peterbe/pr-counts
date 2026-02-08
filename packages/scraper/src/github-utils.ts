import { Octokit } from "octokit";

const isCI = Boolean(JSON.parse(process.env.CI ?? "false"));

export function getOctokit() {
	const token = Bun.env.GITHUB_TOKEN;
	if (!token) {
		if (isCI) {
			console.warn(
				`
		in CI mode, it's OK to not have a GITHUB_TOKEN as long as you're not
		trying to access private repos. Proceeding with unauthenticated Octokit client.
				`
					.trim()
					.replaceAll("\n", " "),
			);
			return new Octokit();
		}
		throw new Error("$GITHUB_TOKEN is not set");
	}

	const octokit = new Octokit({ auth: token });
	return octokit;
}
