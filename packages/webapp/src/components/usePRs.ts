import { useQueries, useQuery } from "@tanstack/react-query";

export type PRSummary = {
	state: string;
	title: string;
	number: number;
	html_url: string;
	created_at: string;
	user?: {
		login: string;
		html_url: string;
		avatar_url: string;
	};
};
export type DailyPR = {
	count_prs_created: number;
	count_prs_reviewed: number;
	date: string;
	created_prs: PRSummary[];
	reviewed_prs: PRSummary[];
};
export type PRsType = {
	prs: DailyPR[];
	count: number;
};

async function fetchPRs(username: string) {
	const r = await fetch(`/exports/prs-${username}.json`);
	if (!r.ok) {
		throw new Error(`${r.status} on ${r.url}`);
	}
	return r.json();
}

export function usePRs(username: string) {
	return useQuery<PRsType>({
		queryKey: ["prs", username],
		queryFn: () => fetchPRs(username),
		// refetchOnWindowFocus: false,
	});
}

export function useMultiplePRs(usernames: string[]) {
	return useQueries<PRsType[]>({
		queries: usernames.map((username) => ({
			queryKey: ["prs", username],
			queryFn: () => fetchPRs(username),
		})),
		// combine: (results) => {
		// 	return {
		// 		data: results.map((result) => result.data),
		// 		pending: results.some((result) => result.isPending),
		// 	};
		// },
	});
}
