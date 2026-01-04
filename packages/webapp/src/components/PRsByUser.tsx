import { LineChart } from "@mantine/charts";
import {
	Box,
	Group,
	LoadingOverlay,
	SegmentedControl,
	Title,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { getFirstDayOfMonth, getMonday } from "../date-utils";
import { GitHubAvatar } from "./GitHubAvatar";
import { ServerError } from "./ServerError";
import { type PRCountsType, usePRCounts } from "./usePRCounts";
import { useUsers } from "./useUsers";

export function PRsByUser({ username }: { username: string }) {
	const query = usePRCounts();
	const users = useUsers();
	const thisUser = Object.values(users.data?.users || {}).find(
		(u) => u.login === username,
	);

	// if (!thisUser) {
	//     return <div>User @{username} not found</div>;
	// }

	return (
		<Box pos="relative">
			<LoadingOverlay visible={query.isPending || users.isPending} />
			<ServerError error={users.error || query.error} />
			{/* {thisUser && (
				<SimpleGrid cols={2}>
					<Title order={2}>PRs by @{thisUser.login}</Title>
					<GitHubAvatar user={thisUser} size={64} />
				</SimpleGrid>
			)} */}
			{thisUser && (
				<Group justify="space-between">
					<Title order={2}>PRs by @{thisUser.login}</Title>
					<GitHubAvatar user={thisUser} size={48} />
				</Group>
			)}
			{query.data && <PRsChart username={username} data={query.data} />}
		</Box>
	);
}

function PRsChart({
	username,
	data,
}: {
	username: string;
	data: PRCountsType;
}) {
	const [dateInterval, setDateInterval] = useLocalStorage<"byweek" | "bymonth">(
		{
			key: "date-interval",
			defaultValue: "byweek",
		},
	);

	const byDateLabels: Record<
		string,
		{
			count_prs_created: number;
			count_prs_reviewed: number;
		}
	> = {};

	for (const rows of Object.values(data)) {
		for (const row of rows) {
			if (row.username !== username) {
				continue;
			}
			const dateLabel =
				dateInterval === "byweek"
					? getMonday(row.date)
					: getFirstDayOfMonth(row.date);
			if (!byDateLabels[dateLabel]) {
				byDateLabels[dateLabel] = {
					count_prs_created: 0,
					count_prs_reviewed: 0,
				};
			}
			byDateLabels[dateLabel].count_prs_created += row.count_prs_created;
			byDateLabels[dateLabel].count_prs_reviewed += row.count_prs_reviewed;
		}
	}
	const lineDataCreated = Object.entries(byDateLabels).map(
		([dateLabel, counts]) => ({
			date: dateLabel,
			[username]: counts.count_prs_created,
		}),
	);
	const lineDataReviewed = Object.entries(byDateLabels).map(
		([dateLabel, counts]) => ({
			date: dateLabel,
			[username]: counts.count_prs_reviewed,
		}),
	);

	return (
		<Box>
			<Box mb={40}>
				<Title order={4}>PRs Created</Title>

				<LineChart
					h={250}
					w={800}
					data={lineDataCreated}
					dataKey="date"
					lineChartProps={{ syncId: "byUser" }}
					series={[{ name: username, color: "indigo.6" }]}
					curveType="monotone"
					tooltipAnimationDuration={100}
					withPointLabels
					type="gradient"
					gradientStops={[
						{ offset: 0, color: "red.6" },
						{ offset: 20, color: "orange.6" },
						{ offset: 40, color: "yellow.5" },
						{ offset: 70, color: "lime.5" },
						{ offset: 80, color: "cyan.5" },
						{ offset: 100, color: "blue.5" },
					]}
				/>
			</Box>
			<Box mb={40}>
				<Title order={4}>PRs Reviewed</Title>
				<LineChart
					h={250}
					w={800}
					data={lineDataReviewed}
					dataKey="date"
					lineChartProps={{ syncId: "byUser" }}
					series={[
						{ name: username, color: "teal.6" },
						// { name: "Oranges", color: "blue.6" },
						// { name: "Tomatoes", color: "teal.6" },
					]}
					curveType="monotone"
					tooltipAnimationDuration={100}
					withPointLabels
					type="gradient"
					gradientStops={[
						{ offset: 0, color: "red.6" },
						{ offset: 20, color: "orange.6" },
						{ offset: 40, color: "yellow.5" },
						{ offset: 70, color: "lime.5" },
						{ offset: 80, color: "cyan.5" },
						{ offset: 100, color: "blue.5" },
					]}
				/>
			</Box>

			<Box>
				<Title order={4}>Options</Title>

				<SegmentedControl
					value={dateInterval}
					onChange={(value) => {
						setDateInterval(value as "byweek" | "bymonth");
					}}
					data={[
						{ label: "By week", value: "byweek" },
						{ label: "By month", value: "bymonth" },
					]}
				/>
			</Box>
		</Box>
	);
}
