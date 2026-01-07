import { LineChart } from "@mantine/charts";
import {
	Anchor,
	Box,
	Group,
	LoadingOverlay,
	MultiSelect,
	SegmentedControl,
	Switch,
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

	return (
		<Box pos="relative">
			<LoadingOverlay visible={query.isPending || users.isPending} />
			<ServerError error={users.error || query.error} />

			{thisUser && (
				<Group justify="space-between">
					<Title order={2}>
						PRs by{" "}
						<a href={thisUser.html_url} target="_blank">
							@{thisUser.login}
						</a>
					</Title>
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
	const users = useUsers();
	const otherUsers = Object.values(users.data?.users || {}).filter(
		(u) => u.login !== username,
	);

	const [dateInterval, setDateInterval] = useLocalStorage<"byweek" | "bymonth">(
		{
			key: `pr-counts:date-interval:${username}`,
			defaultValue: "byweek",
		},
	);

	const [compareUsers, setCompareUsers] = useLocalStorage<string[]>({
		key: `pr-counts:compare-users:${username}`,
		defaultValue: [],
	});
	const [skipLastInterval, setSkipLastInterval] = useLocalStorage<boolean>({
		key: `pr-counts:skip-last-interval:${username}`,
		defaultValue: false,
	});

	const byDateLabels: Record<
		string,
		{
			[username: string]: {
				count_prs_created: number;
				count_prs_reviewed: number;
			};
		}
	> = {};

	for (const rows of Object.values(data)) {
		for (const row of rows) {
			if (
				!(
					row.username === username ||
					otherUsers.find((u) => u.login === row.username)
				)
			) {
				continue;
			}
			const dateLabel =
				dateInterval === "byweek"
					? getMonday(row.date)
					: getFirstDayOfMonth(row.date);
			if (!byDateLabels[dateLabel]) {
				byDateLabels[dateLabel] = {
					[row.username]: {
						count_prs_created: 0,
						count_prs_reviewed: 0,
					},
				};
			}
			if (!byDateLabels[dateLabel][row.username]) {
				byDateLabels[dateLabel][row.username] = {
					count_prs_created: 0,
					count_prs_reviewed: 0,
				};
			}
			byDateLabels[dateLabel][row.username].count_prs_created +=
				row.count_prs_created;
			byDateLabels[dateLabel][row.username].count_prs_reviewed +=
				row.count_prs_reviewed;
		}
	}

	const COLORS = [
		"#7b594e",
		"#a17f74",
		"#d2c9c6",
		"#896459",
		"#bdaaa4",
		"#9d766a",
		"#ab9087",
		"#e8e6e5",
	];
	const series = [
		{ name: username, color: "blue.6" },
		...compareUsers.map((u, index) => ({
			name: u,
			color: COLORS[index % COLORS.length],
		})),
	];

	const range = skipLastInterval
		? Object.entries(byDateLabels).slice(1, -1)
		: Object.entries(byDateLabels);

	// count_prs_created
	const lineDataCreated = range.map(([dateLabel, record]) => {
		const records: Record<string, number | string> = {
			date: dateLabel,
		};
		for (const [user, counts] of Object.entries(record)) {
			records[user] = counts.count_prs_created;
		}
		return records;
	});
	// count_prs_reviewed
	const lineDataReviewed = range.map(([dateLabel, record]) => {
		const records: Record<string, number | string> = {
			date: dateLabel,
		};
		for (const [user, counts] of Object.entries(record)) {
			records[user] = counts.count_prs_reviewed;
		}
		return records;
	});

	const gradientStops = [
		{ offset: 0, color: "red.6" },
		{ offset: 20, color: "orange.6" },
		{ offset: 40, color: "yellow.5" },
		{ offset: 70, color: "lime.5" },
		{ offset: 80, color: "cyan.5" },
		{ offset: 100, color: "blue.5" },
	];

	const height = 400;
	const width = 900;

	return (
		<Box>
			<Box mb={40}>
				<Title order={4}>PRs Created</Title>

				<LineChart
					h={height}
					w={width}
					data={lineDataCreated}
					dataKey="date"
					lineChartProps={{ syncId: "byUser" }}
					series={series}
					curveType="monotone"
					tooltipAnimationDuration={100}
					withPointLabels
					type={compareUsers.length === 0 ? "gradient" : undefined}
					gradientStops={compareUsers.length === 0 ? gradientStops : undefined}
					withLegend={compareUsers.length > 0}
				/>
			</Box>
			<Box mb={40}>
				<Title order={4}>PRs Reviewed</Title>
				<LineChart
					h={height}
					w={width}
					data={lineDataReviewed}
					dataKey="date"
					lineChartProps={{ syncId: "byUser" }}
					series={series}
					curveType="monotone"
					tooltipAnimationDuration={100}
					withPointLabels
					type={compareUsers.length === 0 ? "gradient" : undefined}
					gradientStops={compareUsers.length === 0 ? gradientStops : undefined}
					withLegend={compareUsers.length > 0}
				/>
			</Box>

			<Box>
				<Title order={4} mb={20}>
					Options
				</Title>

				<OptionSection>
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
				</OptionSection>

				<OptionSection>
					<MultiSelect
						label="Compare with other users"
						placeholder="Pick other users"
						data={otherUsers ? otherUsers.map((u) => u.login) : []}
						value={compareUsers}
						onChange={setCompareUsers}
						searchable
					/>
				</OptionSection>

				<OptionSection>
					<Switch
						label="Skip first and last date interval (incomplete data)"
						checked={skipLastInterval}
						onChange={(event) =>
							setSkipLastInterval(event.currentTarget.checked)
						}
					/>
				</OptionSection>
			</Box>
		</Box>
	);
}

function OptionSection({ children }: { children: React.ReactNode }) {
	return <Box mb={20}>{children}</Box>;
}
