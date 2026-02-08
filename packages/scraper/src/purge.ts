import { eq } from "drizzle-orm";
import type { PR } from "./by-user";
import { db } from "./db";
import { prsTable as prs, type SelectPR } from "./schema";

export async function purgeDupes() {
	const keys = new Map<string, PR>();

	const results: SelectPR[] = await db
		.select()

		.from(prs)
		.orderBy(prs.date, prs.username);

	for (const result of results) {
		const { username } = result;
		const createdPrs = result.created_prs as unknown as Array<PR>;
		for (const pr of createdPrs) {
			const key = `${username}:created:${pr.number}`;
			if (keys.has(key)) {
				console.warn(`Duplicate key found: ${key}`, keys.get(key));
				await db.delete(prs).where(eq(prs.id, result.id));
				console.log("RECOMPUTE", username, "DATE", result.date.toISOString());
			}
			keys.set(key, pr);
		}
	}
}
