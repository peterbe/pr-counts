import type { Octokit } from "octokit";

const MAX_TIMEOUT_MS = 5000;

export class TimeoutError extends Error {}

export async function searchIssues(octokit: Octokit, q: string) {
	const controller = new AbortController();
	const signal = controller.signal;
	const timeoutId = setTimeout(() => {
		controller.abort();
	}, MAX_TIMEOUT_MS);
	try {
		const response = await octokit.request("GET /search/issues", {
			q,
			request: {
				signal,
			},
		});
		clearTimeout(timeoutId);
		return response;
	} catch (error) {
		if (error instanceof Error && error.name === "AbortError") {
			throw new TimeoutError(`Timed out after ${MAX_TIMEOUT_MS}ms`);
		}
		throw error;
	}
}
