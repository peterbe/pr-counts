// import { db } from "../index";
import { and, eq, gte, lt } from "drizzle-orm";
import { db } from "./db";
import { type InsertPR, prsTable, type SelectPR } from "./schema";

// export async function createUser(data: InsertUser) {
//   await db.insert(usersTable).values(data);
// }
export async function upsertPR(data: InsertPR) {
	console.log("UPSERT", [data.date, data.org, data.repo, data.username]);
	const startOfDay = new Date(data.date);
	startOfDay.setHours(0, 0, 0, 0);
	const endOfDay = new Date(data.date);
	endOfDay.setHours(23, 59, 59, 999);
	// await db.update(prsTable).set(data).where(eq(prsTable.id, id));
	const query = db
		.select()
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
		// throw new Error("Not implemented yet");
		const { id } = row;
		console.log("UPDATING...", id);
		await updatePR(id, {
			...data,
			updated: new Date(),
		});
		return;
	}

	console.log("INSERTING...");
	// data.updated = new Date();
	// data.created = new Date();
	await insertPR({
		...data,
		updated: new Date(),
		created: new Date(),
	});
}

async function updatePR(
	id: SelectPR["id"],
	data: Partial<Omit<SelectPR, "id">>,
) {
	await db.update(prsTable).set(data).where(eq(prsTable.id, id));
}

async function insertPR(data: InsertPR) {
	await db.insert(prsTable).values(data);
}
