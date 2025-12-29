import { and, count, eq, gte, lt } from "drizzle-orm";
import { db } from "./db";
import { prsTable } from "./schema";

type Data = {
	org: string;
	repo: string;
	username: string;
	date: Date;
};

export async function hasData(data: Data): Promise<boolean> {
	const startOfDay = new Date(data.date);
	startOfDay.setHours(0, 0, 0, 0);
	const endOfDay = new Date(data.date);
	endOfDay.setHours(23, 59, 59, 999);
	const query = db
		.select({ count: count() })
		.from(prsTable)
		.where(
			and(
				eq(prsTable.org, data.org),
				eq(prsTable.repo, data.repo),
				eq(prsTable.username, data.username),
				gte(prsTable.date, startOfDay),
				lt(prsTable.date, endOfDay),
			),
		);
	for (const row of await query) {
		return row.count > 0;
	}
	return false;
}
