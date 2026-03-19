import {
	Anchor,
	Avatar,
	Box,
	Button,
	Container,
	Grid,
	LoadingOverlay,
	SegmentedControl,
	SimpleGrid,
	Text,
	Timeline,
	Title,
} from "@mantine/core";
import { useDocumentTitle, useSessionStorage } from "@mantine/hooks";
import { formatDistance } from "date-fns";
import { useMemo } from "react";
import { Link } from "react-router";
import { GeneralAppShell } from "./GeneralAppShell";
import { GitHubAvatar } from "./GitHubAvatar";
import { ServerError } from "./ServerError";
import { UserSelection } from "./UserSelection";
import { type PRSummary, type PRsType, useMultiplePRs } from "./usePRs";
import { useSelectedUsers } from "./useSelectedUsers";
import { type UserType, useUsers } from "./useUsers";

export function Events() {
	useDocumentTitle("Events");
	return (
		<GeneralAppShell Sidebar={UserSelection}>
			<Container style={{ minWidth: 900 }}>
				<ByUsers />
			</Container>
		</GeneralAppShell>
	);
}

const DEFAULT_SLICE = 50;
const SLICE_INCREMENT = 50;

function ByUsers() {
	const [selectedUsers] = useSelectedUsers();
	const users = useUsers();
	const possibleUsernames = users.data ? Object.keys(users.data.users) : [];

	const [eventTypeFilter, setEventTypeFilter] = useSessionStorage<
		"both" | "created" | "reviewed"
	>({
		// key: `pr-counts:events-type-filter:${usernames.join("")}`,
		key: `pr-counts:events-type-filter`,
		defaultValue: "both",
	});

	const usernames =
		selectedUsers.length > 0 ? selectedUsers : possibleUsernames;
	const queries = useMultiplePRs(usernames);
	const queriesLoading = queries.some((q) => q.isPending);
	const queriesError = queries.find((q) => q.error);
	const [slice, setSlice, resetSlice] = useSessionStorage<number>({
		key: `pr-counts:events-slice:${usernames.join("")}`,
		defaultValue: DEFAULT_SLICE,
	});
	type FlatRecord = {
		username: string;
		date: Date;
		prType: "created" | "reviewed";
		summary: PRSummary;
	};
	const records = useMemo(() => {
		const flat: FlatRecord[] = [];
		let keys: ("created_prs" | "reviewed_prs")[] = [
			"created_prs",
			"reviewed_prs",
		];
		if (eventTypeFilter === "created") {
			keys = ["created_prs"];
		} else if (eventTypeFilter === "reviewed") {
			keys = ["reviewed_prs"];
		}
		queries.forEach((query, index) => {
			const username = usernames[index];
			if (selectedUsers.length > 0 && !selectedUsers.includes(username)) {
				return;
			}
			const data = query.data as PRsType | undefined;
			for (const pr of data?.prs || []) {
				for (const key of keys) {
					for (const prSummary of pr[key]) {
						flat.push({
							username,
							date: new Date(prSummary.created_at),
							prType: key === "created_prs" ? "created" : "reviewed",
							summary: prSummary,
						});
					}
				}
			}
		});
		return flat.sort((a, b) => b.date.getTime() - a.date.getTime());
	}, [queries, usernames, selectedUsers, eventTypeFilter]);

	const userMap: Record<string, UserType> = {};
	Object.entries(users.data?.users || {}).forEach(([username, user]) => {
		userMap[username] = user;
	});

	return (
		<Box pos="relative">
			<Grid mb={30}>
				<Grid.Col span={8}>
					<Title order={2}>Recent Events</Title>
				</Grid.Col>
				<Grid.Col
					span={4}
					style={{ display: "flex", justifyContent: "flex-end" }}
				>
					<SegmentedControl
						value={eventTypeFilter}
						onChange={(val: string) => {
							if (["both", "created", "reviewed"].includes(val)) {
								setEventTypeFilter(val as "both" | "created" | "reviewed");
							}
						}}
						data={[
							{ label: "Both", value: "both" },
							{ label: "Created PRs", value: "created" },
							{ label: "Reviewed PRs", value: "reviewed" },
						]}
					/>
				</Grid.Col>
			</Grid>
			<LoadingOverlay visible={queriesLoading} />
			<ServerError error={users.error || queriesError?.error || null} />
			<Timeline bulletSize={38} mb={40}>
				{records.slice(0, slice).map((record) => {
					const user = userMap[record.username];
					const title = (
						<>
							<Link to={`/user/${record.username}`}>{record.username}</Link>{" "}
							{record.prType === "created" ? "created" : "reviewed"}{" "}
							<Anchor
								href={record.summary.html_url}
								target="_blank"
								title={record.summary.title}
							>
								{truncate(record.summary.title, 90)}
							</Anchor>
							{record.prType === "reviewed" ? (
								<Text size="sm" span>
									{" "}
									by{" "}
								</Text>
							) : null}
							{/* {record.prType === "reviewed" && record.summary.user ? (
								<GitHubAvatar user={record.summary.user} size={24} />
							) : null} */}
							{record.prType === "reviewed" && record.summary.user ? (
								<GitHubAvatar
									user={record.summary.user}
									nameOnly
									textSize="sm"
								/>
							) : null}
						</>
					);

					const avatarUrl =
						user.avatar_url ||
						"https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png";
					return (
						<Timeline.Item
							key={`${record.username}${record.prType}${record.summary.number}`}
							title={title}
							bullet={<Avatar size={36} radius="xl" src={avatarUrl} />}
						>
							<Text c="dimmed" size="sm">
								{formatDistance(record.date, new Date(), {
									addSuffix: true,
								})}
							</Text>
						</Timeline.Item>
					);
				})}
			</Timeline>

			{!queriesLoading && !queriesError && records.length && (
				<SimpleGrid cols={slice > DEFAULT_SLICE ? 3 : 1} spacing="xs">
					<Button
						fullWidth
						variant="default"
						onClick={() => setSlice((p) => p + SLICE_INCREMENT)}
					>
						Load More
					</Button>
					{slice > DEFAULT_SLICE && (
						<Button
							fullWidth
							variant="default"
							onClick={() => {
								window.scrollTo(0, 0);
							}}
						>
							To the top
						</Button>
					)}
					{slice > DEFAULT_SLICE && (
						<Button
							fullWidth
							variant="default"
							onClick={() => {
								resetSlice();
							}}
						>
							Reset
						</Button>
					)}
				</SimpleGrid>
			)}
		</Box>
	);
}

function truncate(str: string, n: number) {
	return str.length > n ? `${str.slice(0, n - 1)}…` : str;
}
