import { LineChart, type LineChartSeries } from "@mantine/charts";
import {
	Alert,
	Anchor,
	Box,
	Container,
	Grid,
	Group,
	LoadingOverlay,
	SegmentedControl,
	Select,
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
		(u) => u.userdata.login === username,
	);

	return (
		<Box pos="relative">
			<LoadingOverlay visible={query.isPending || users.isPending} />
			<ServerError error={users.error || query.error} />
			{thisUser?.disabled && (
				<Alert variant="light" color="orange" title="User disabled" mb={30}>
					Stats is no longer collected for this user.
				</Alert>
			)}
			{thisUser && (
				<Group justify="space-between" mb={20}>
					<Title order={2}>
						PRs by{" "}
						<a href={thisUser.userdata.html_url} target="_blank" rel="noopener">
							@{thisUser.userdata.login}
						</a>
					</Title>
					<Anchor to={`/user/${username}/timeline`} component={Link}>
						Timeline
					</Anchor>
					<GitHubAvatar user={thisUser.userdata} size={48} />
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
		(u) => u.userdata.login !== username && !u.disabled,
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
	const [cummulative, setCummulative] = useLocalStorage<boolean>({
		key: `pr-counts:cummulative:${username}`,
		defaultValue: false,
	});

	const [dateRangeDays, setDateRangeDays] = useLocalStorage<number>({
		key: `pr-counts:date-range:${username}`,
		defaultValue: 30 * 3,
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

	let startDate: null | Date = null;

	for (const rows of Object.values(data)) {
		for (const row of rows) {
			const dateLabel =
				dateInterval === "byweek"
					? getMonday(row.date)
					: getFirstDayOfMonth(row.date);

			if (
				!(
					row.username === username ||
					otherUsers.find((u) => u.userdata.login === row.username)
				)
			) {
				continue;
			}

			if (
				!startDate &&
				row.username === username &&
				(row.count_prs_created > 0 || row.count_prs_reviewed > 0)
			) {
				startDate = new Date(row.date);
			}
			if (!startDate) continue;

			if (getDaysBetweenDates(new Date(row.date), new Date()) > dateRangeDays) {
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

			if (startDate) {
				byDateLabels[dateLabel][row.username].count_prs_created +=
					row.count_prs_created;
				byDateLabels[dateLabel][row.username].count_prs_reviewed +=
					row.count_prs_reviewed;
			}
		}
	}

	if (cummulative) {
		const previousByUser: Record<
			string,
			{
				count_prs_created: number;
				count_prs_reviewed: number;
			}
		> = {};

		for (const record of Object.values(byDateLabels)) {
			console.log(record);
			for (const [user, counts] of Object.entries(record)) {
				if (!(user in previousByUser)) {
					previousByUser[user] = {
						count_prs_created: 0,
						count_prs_reviewed: 0,
					};
				}
				counts.count_prs_created += previousByUser[user].count_prs_created;
				counts.count_prs_reviewed += previousByUser[user].count_prs_reviewed;

				previousByUser[user].count_prs_created = counts.count_prs_created;
				previousByUser[user].count_prs_reviewed = counts.count_prs_reviewed;
			}
		}
	}

	const startDateDays = startDate
		? getDaysBetweenDates(startDate, new Date())
		: 0;

	const dateRangeOptions = [
		{ value: "7", label: "last 1 week" },
		{ value: "14", label: "last 2 weeks" },
		{ value: "30", label: "last 30 days" },
		{ value: "60", label: "last 60 days" },
		{ value: "90", label: "last 90 days" },
		{ value: "120", label: "last 120 days" },
		{ value: "150", label: "last 150 days" },
		{ value: "180", label: "last 180 days" },
		{ value: "365", label: "last year" },
		{ value: String(365 * 2), label: "last 2 years" },
	].filter(({ value }, index) => {
		if (index === 0) return true;
		const days = Number(value);
		return days <= startDateDays;
	});

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

	const range =
		skipLastInterval && Object.entries(byDateLabels).length > 4
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

				<Grid>
					<Grid.Col span={4}>
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
					</Grid.Col>
					<Grid.Col span={4}>
						<OptionSection>
							{dateRangeOptions.length > 0 && (
								<Select
									placeholder="Date range"
									data={dateRangeOptions}
									value={`${dateRangeDays}`}
									onChange={(value: string | null) => {
										if (value && Number(value)) {
											setDateRangeDays(Number(value));
										}
									}}
								/>
							)}
						</OptionSection>
					</Grid.Col>
				</Grid>

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
						disabled={Object.entries(byDateLabels).length <= 4}
					/>
				</OptionSection>
				<OptionSection>
					<Switch
						label="Cummulative numbers"
						checked={cummulative}
						onChange={(event) => setCummulative(event.currentTarget.checked)}
						// disabled={Object.entries(byDateLabels).length <= 4}
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
function getDaysBetweenDates(date1: Date, date2: Date) {
	// The number of milliseconds in one day
	const ONE_DAY_MS = 1000 * 60 * 60 * 24;

	// Convert both dates to UTC timestamps by extracting year, month, and day
	const date1_UTC = Date.UTC(
		date1.getFullYear(),
		date1.getMonth(),
		date1.getDate(),
	);
	const date2_UTC = Date.UTC(
		date2.getFullYear(),
		date2.getMonth(),
		date2.getDate(),
	);

	// Calculate the difference in milliseconds
	const differenceMs = Math.abs(date2_UTC - date1_UTC);

	// Convert the difference back to days and round the result
	return Math.round(differenceMs / ONE_DAY_MS);
}
