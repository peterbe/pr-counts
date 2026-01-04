import { BarChart } from "@mantine/charts";
import { Box, LoadingOverlay, Title } from "@mantine/core";
import { useSearchParams } from "react-router";
import { getFirstDayOfMonth } from "../date-utils";
import { type PRCountsType, usePRCounts } from "./usePRCounts";

export function PRsChart() {
	const query = usePRCounts();
	const [searchParams] = useSearchParams();
	const selectedUsers = searchParams.getAll("users");

	return (
		<Box pos="relative">
			{query.data && (
				<PRsChartByDateLabelByUsers
					title="PRs Created by Month"
					data={query.data}
					users={selectedUsers}
					isLoading={query.isPending}
					sumKey="count_prs_created"
				/>
			)}
		</Box>
	);
}

export function PRsChartByDateLabelByUsers({
	title,
	data,
	users,
	isLoading,
	sumKey,
}: {
	title: string;
	data: PRCountsType;
	users: string[];
	isLoading: boolean;
	sumKey: "count_prs_created" | "count_prs_reviewed";
}) {
	// const query = usePRCounts();
	// const [searchParams] = useSearchParams();
	// const selectedUsers = searchParams.getAll("users");

	type DataPoint = {
		dateLabel: string;
	} & Record<string, number>;

	const series: { name: string; color: string }[] = [];
	const dataPoints: DataPoint[] = [
		// { month: "January", Smartphones: 1200, Laptops: 900, Tablets: 200 },
		// { month: "February", Smartphones: 1900, Laptops: 1200, Tablets: 400 },
		// { month: "March", Smartphones: 400, Laptops: 1000, Tablets: 200 },
		// { month: "April", Smartphones: 1000, Laptops: 200, Tablets: 800 },
		// { month: "May", Smartphones: 800, Laptops: 1400, Tablets: 1200 },
		// { month: "June", Smartphones: 750, Laptops: 600, Tablets: 1000 },
	];
	const namesSet = new Set<string>();
	const byDateLabels: Record<string, Record<string, number>> = {};
	if (data) {
		for (const rows of Object.values(data)) {
			for (const row of rows) {
				if (users.length > 0 && !users.includes(row.username)) {
					continue;
				}
				namesSet.add(row.username);
				const dateLabel = getFirstDayOfMonth(row.date);
				if (!byDateLabels[dateLabel]) {
					byDateLabels[dateLabel] = {};
				}
				if (!byDateLabels[dateLabel][row.username]) {
					byDateLabels[dateLabel][row.username] = 0;
				}
				byDateLabels[dateLabel][row.username] += row[sumKey];
			}
		}
	}
	for (const [dateLabel, userCounts] of Object.entries(byDateLabels)) {
		// @ts-expect-error: it works, and I don't know how to fix it
		const point: DataPoint = { dateLabel };
		for (const [username, count] of Object.entries(userCounts)) {
			point[username] = count;
		}
		dataPoints.push(point);
	}
	const COLORS = [
		"violet.6",
		"blue.6",
		"teal.6",
		"green.6",
		"yellow.6",
		"orange.6",
		"red.6",
		"pink.6",
	];
	for (const [index, name] of Array.from(namesSet).sort().entries()) {
		series.push({ name, color: COLORS[index % COLORS.length] });
	}

	return (
		<Box pos="relative">
			<Title order={2} mb="md">
				{isLoading ? "Loading..." : title}
			</Title>
			<LoadingOverlay visible={isLoading} />
			<BarChart
				h={500}
				w={1000}
				data={dataPoints}
				dataKey="dateLabel"
				valueFormatter={(value) => new Intl.NumberFormat("en-US").format(value)}
				withBarValueLabel
				series={series}
			/>
		</Box>
	);
}
