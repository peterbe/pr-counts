// import { db } from "../index";
import { db } from "./db";
import { type InsertPR, prsTable } from "./schema";

// export async function createUser(data: InsertUser) {
//   await db.insert(usersTable).values(data);
// }
export async function insertPR(data: InsertPR) {
	await db.insert(prsTable).values(data);
}
