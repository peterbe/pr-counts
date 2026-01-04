import { useQuery } from "@tanstack/react-query";

export type PRCountsType = {
	[nwo: string]: {
		username: string;
		count_prs_created: number;
		count_prs_reviewed: number;
		date: string;
	}[];
};
export function usePRCounts() {
	return useQuery<PRCountsType>({
		queryKey: ["pr-counts"],
		queryFn: async () => {
			const r = await fetch("/exports/pr-counts.json");
			if (!r.ok) {
				throw new Error(`${r.status} on ${r.url}`);
			}
			return r.json();
		},
	});
}
