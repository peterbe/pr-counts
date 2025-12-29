import { expect, test } from "bun:test";
import { formatDate } from "./date-formatter";

test("formatting date ignores zulu time", () => {
	const date = new Date("2025-12-04T02:38:59.052Z");
	console.log([date, formatDate(date)]);
	expect(formatDate(date)).toBe("Dec 4, 2025");
});
