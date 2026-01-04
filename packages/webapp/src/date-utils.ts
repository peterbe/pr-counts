export function getMonday(dateString: string): string {
	const date = new Date(dateString);
	const day = date.getDay();
	const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
	const monday = new Date(date.setDate(diff));
	// return monday.toISOString().split("T")[0];
	return new Intl.DateTimeFormat(undefined, {
		month: "short",
		day: "numeric",
	}).format(monday);
}

export function getFirstDayOfMonth(dateString: string): string {
	const date = new Date(dateString);
	const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
	return new Intl.DateTimeFormat(undefined, {
		month: "short",
		year: "numeric",
		// day: "numeric",
	}).format(firstDay);
	// return `${firstDay.getMonth() + 1} ${firstDay.getDate()}`;
	// return firstDay.toISOString().split("T")[0];
}
