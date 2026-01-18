import { format } from "date-fns/format";
import { sub } from "date-fns/sub";
import type { DailyPR } from "./usePRs";

export const useDaysAgoOptions = (
	dailyPRs: DailyPR[],
): { label: string; value: string }[] => {
	const keyMaker = (date: Date | string) => format(date, "yyyy-MM-dd");
	const options: { label: string; value: string }[] = [];
	const byDate: Record<
		string,
		{
			count_prs_created: number;
			count_prs_reviewed: number;
		}
	> = {};
	for (const dailyPR of dailyPRs) {
		byDate[keyMaker(dailyPR.date)] = {
			count_prs_created: dailyPR.created_prs.length,
			count_prs_reviewed: dailyPR.reviewed_prs.length,
		};
	}
	const currentYear = new Date().getFullYear();
	for (let i = 1; i < 30; i++) {
		const then = sub(new Date(), { days: i });
		const key = keyMaker(then);
		let label = "";
		if (i === 1) {
			label = "Yesterday, ";
		}
		label += format(then, "cccc, LLL dd");
		if (currentYear !== then.getFullYear()) {
			label += `, ${then.getFullYear()}`;
		}
		if (byDate[key]) {
			const counts = byDate[key];
			if (counts.count_prs_created > 0 && counts.count_prs_reviewed > 0) {
				label += ` (created ${counts.count_prs_created}, reviewed ${counts.count_prs_reviewed})`;
			} else if (counts.count_prs_created > 0) {
				label += ` (created ${counts.count_prs_created})`;
			} else if (counts.count_prs_reviewed > 0) {
				label += ` (reviewed ${counts.count_prs_reviewed})`;
			}
		}
		options.push({
			label,
			value: String(i),
		});
	}
	return options;
};
