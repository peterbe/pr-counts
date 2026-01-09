import { Box, Group, LoadingOverlay, Text, Title } from "@mantine/core";
import { sub } from "date-fns/sub";
import { GitHubAvatar } from "./GitHubAvatar";
import { NumbersGrid } from "./NumbersGrid";
import { ServerError } from "./ServerError";
import { type PRCountsType, usePRCounts } from "./usePRCounts";
import { useUsers } from "./useUsers";

export function PRNumbersByUser({ username }: { username: string }) {
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
			{query.data && <PRsGrid username={username} data={query.data} />}
		</Box>
	);
}

function PRsGrid({ username, data }: { username: string; data: PRCountsType }) {
	const now = new Date();
	const thisPeriodRange = [sub(now, { months: 1 }), now] as const;
	const previousPeriodRange = [
		sub(now, { months: 2 }),
		sub(now, { months: 1 }),
	] as const;
	const thisPeriod = {
		count_prs_created: 0,
		count_prs_reviewed: 0,
	};
	const previousPeriod = {
		count_prs_created: 0,
		count_prs_reviewed: 0,
	};

	for (const rows of Object.values(data)) {
		for (const row of rows) {
			if (row.username === username) {
				const { date } = row;
				const _date = new Date(date);
				if (inDateRange(_date, thisPeriodRange)) {
					thisPeriod.count_prs_created += row.count_prs_created;
					thisPeriod.count_prs_reviewed += row.count_prs_reviewed;
				} else if (inDateRange(_date, previousPeriodRange)) {
					previousPeriod.count_prs_created += row.count_prs_created;
					previousPeriod.count_prs_reviewed += row.count_prs_reviewed;
				}
			}
		}
	}
	const dataPoints = [
		{
			title: "PRs created",
			icon: "pullrequest",
			value: formatInteger(thisPeriod.count_prs_created),
			diff: thisPeriod.count_prs_created - previousPeriod.count_prs_created,
		},
		{
			title: "PRs reviewed",
			icon: "review",
			value: formatInteger(thisPeriod.count_prs_reviewed),
			diff: thisPeriod.count_prs_reviewed - previousPeriod.count_prs_reviewed,
		},
	] as const;

	return (
		<Box>
			<NumbersGrid dataPoints={dataPoints} />
			<Text c="dimmed" size="sm">
				between {thisPeriodRange[0].toDateString()} and{" "}
				{thisPeriodRange[1].toDateString()}
			</Text>
		</Box>
	);
}

function formatInteger(num: number) {
	return num.toLocaleString(undefined, {
		maximumFractionDigits: 0,
	});
}

function inDateRange(date: Date, range: readonly [Date, Date]) {
	return date >= range[0] && date < range[1];
}
