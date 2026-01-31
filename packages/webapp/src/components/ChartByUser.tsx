import { LineChart, type LineChartSeries } from "@mantine/charts";
import {
	Anchor,
	Box,
	Container,
	Group,
	LoadingOverlay,
	SegmentedControl,
	Switch,
	Title,
} from "@mantine/core";
import { useDocumentTitle, useLocalStorage } from "@mantine/hooks";
import { Link, useParams } from "react-router";
import { getFirstDayOfMonth, getMonday } from "../date-utils";
import { GeneralAppShell } from "./GeneralAppShell";
import { GitHubAvatar } from "./GitHubAvatar";
import { PRsGrid } from "./PRsGrid";
import { ServerError } from "./ServerError";
import { UserSelect } from "./UserSelect";
import { useOption } from "./useOption";
import { type PRCountsType, usePRCounts } from "./usePRCounts";
import { useUsers } from "./useUsers";

export function ChartByUser() {
	const params = useParams();

	useDocumentTitle(params.username ? `PRs by @${params.username}` : "By user");

	return (
		<GeneralAppShell>
			<Container style={{ minWidth: 900 }}>
				{params.username && <PRsByUser username={params.username} />}
			</Container>
		</GeneralAppShell>
	);
}

function PRsByUser({ username }: { username: string }) {
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
				<Group justify="space-between" mb={20}>
					<Title order={2}>
						PRs by{" "}
						<a href={thisUser.html_url} target="_blank">
							@{thisUser.login}
						</a>
					</Title>
					<Anchor to={`/user/${username}/timeline`} component={Link}>
						Timeline
					</Anchor>
					<GitHubAvatar user={thisUser} size={48} />
				</Group>
			)}

			{query.data && <PRsGrid username={username} data={query.data} />}
			{query.data && <PRsChart username={username} data={query.data} />}
		</Box>
	);
}

const CURVE_TYPES = ["natural", "monotone", "linear", "bump"] as const;
type CurveType = (typeof CURVE_TYPES)[number];

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

	const [includeAverage, setIncludeAverage] = useOption<boolean>(
		false,
		"include-average",
		username,
	);
	const [curveType, setCurveType] = useOption<CurveType>(
		CURVE_TYPES[0],
		"curve-type",
		username,
	);

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
			const dateLabel =
				dateInterval === "byweek"
					? getMonday(row.date)
					: getFirstDayOfMonth(row.date);

			if (
				!(
					row.username === username ||
					otherUsers.find((u) => u.login === row.username)
				)
			) {
				continue;
			}

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

	if (includeAverage && compareUsers.length > 0) {
		for (const [dateLabel, record] of Object.entries(byDateLabels)) {
			const created: number[] = Object.entries(record)
				.filter(([name]) => {
					return name === username || compareUsers.includes(name);
				})
				.map(([, r]) => r.count_prs_created);
			const reviewed: number[] = Object.entries(record)
				.filter(([name]) => {
					return name === username || compareUsers.includes(name);
				})
				.map(([, r]) => r.count_prs_reviewed);

			byDateLabels[dateLabel].AVERAGE = {
				count_prs_created: Math.round(
					created.reduce((a, b) => a + b, 0) / created.length,
				),
				count_prs_reviewed: Math.round(
					reviewed.reduce((a, b) => a + b, 0) / reviewed.length,
				),
			};
		}
	}

	const series: LineChartSeries[] = [
		{ name: username, color: "blue.6" },
		...compareUsers.map((u, index) => ({
			name: u,
			color: COLORS[index % COLORS.length],
		})),
	];
	if (includeAverage && compareUsers.length > 0) {
		series.push({ name: "AVERAGE", color: "red.6", strokeDasharray: "5 5" });
	}

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
					curveType={curveType}
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
					curveType={curveType}
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
					<UserSelect
						selected={compareUsers}
						selectable={otherUsers}
						onChange={setCompareUsers}
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

				<OptionSection>
					<Switch
						label="Include average line"
						checked={includeAverage}
						disabled={compareUsers.length === 0}
						onChange={(event) => setIncludeAverage(event.currentTarget.checked)}
					/>
				</OptionSection>

				<OptionSection>
					<SegmentedControl
						withItemsBorders={false}
						size="xs"
						value={curveType}
						onChange={(value: string) => {
							setCurveType(value as typeof curveType);
						}}
						data={CURVE_TYPES.map((type) => ({ label: type, value: type }))}
					/>
				</OptionSection>
			</Box>
		</Box>
	);
}

function OptionSection({ children }: { children: React.ReactNode }) {
	return <Box mb={20}>{children}</Box>;
}

// function computeRollingAverageArray(
// 	data: number[],
// 	period: number,
// ): (number | undefined)[] {
// 	const movingAverages: (number | undefined)[] = [];

// 	for (let i = 0; i < data.length; i++) {
// 		// Check if we have enough data points for the current period
// 		if (i < period - 1) {
// 			movingAverages.push(undefined);
// 			continue;
// 		}

// 		// Slice the window and calculate the average
// 		const windowSlice = data.slice(i - period + 1, i + 1);
// 		const sum = windowSlice.reduce((acc, curr) => acc + curr, 0);
// 		const average = sum / period;
// 		movingAverages.push(average);
// 	}

// 	return movingAverages;
// }
