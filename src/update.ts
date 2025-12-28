// import { db } from "../index";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { prsTable, type SelectPR } from "./schema";

// export async function createUser(data: InsertUser) {
//   await db.insert(usersTable).values(data);
// }
export async function updatePR(
	id: SelectPR["id"],
	data: Partial<Omit<SelectPR, "id">>,
) {
	await db.update(prsTable).set(data).where(eq(prsTable.id, id));
}
