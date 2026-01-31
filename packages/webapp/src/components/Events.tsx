import {
	Anchor,
	Avatar,
	Box,
	Button,
	Container,
	LoadingOverlay,
	SimpleGrid,
	Text,
	Timeline,
	Title,
} from "@mantine/core";
import { useDocumentTitle, useSessionStorage } from "@mantine/hooks";
import { formatDistance } from "date-fns";
import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { GeneralAppShell } from "./GeneralAppShell";
import { GitHubAvatar } from "./GitHubAvatar";
import { ServerError } from "./ServerError";
import { UserSelection } from "./UserSelection";
import { type PRSummary, type PRsType, useMultiplePRs } from "./usePRs";
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
const SLICE_INCREMENT = 10;

function ByUsers() {
	const [searchParams] = useSearchParams();
	// const query = usePRCounts();
	const selectedUsers = searchParams.getAll("users");
	const users = useUsers();
	// const possibleUsernames = Object.values(query.data || {});
	// console.log({ possibleUsernames });
	const possibleUsernames = users.data ? Object.keys(users.data.users) : [];

	const usernames =
		selectedUsers.length > 0 ? selectedUsers : possibleUsernames;
	// console.log({ possibleUsernames, selectedUsers });
	const queries = useMultiplePRs(usernames);
	const queriesLoading = queries.some((q) => q.isPending);
	const queriesError = queries.find((q) => q.error);
	// const flatten = queries.map((q) => q.data)
	// console.log("QUERIES:", queries);
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
		queries.forEach((query, index) => {
			const username = usernames[index];
			const data = query.data as PRsType | undefined;
			for (const pr of data?.prs || []) {
				for (const key of ["created_prs", "reviewed_prs"] as const) {
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
	}, [queries, usernames]);

	const userMap: Record<string, UserType> = {};
	Object.entries(users.data?.users || {}).forEach(([username, user]) => {
		userMap[username] = user;
	});

	return (
		<Box pos="relative">
			<Title mb={20}>Recent Events</Title>
			<LoadingOverlay visible={queriesLoading} />
			<ServerError error={users.error || queriesError?.error || null} />
			<Timeline bulletSize={38} mb={40}>
				{records.slice(0, slice).map((record, index) => {
					const user = userMap[record.username];

					if (record.prType === "reviewed") {
						console.log(record.summary);
					}
					const title = (
						<>
							<Anchor href={user.html_url} target="_blank">
								{record.username}
							</Anchor>{" "}
							{record.prType === "created" ? "created" : "reviewed"}{" "}
							<Anchor
								href={record.summary.html_url}
								target="_blank"
								title={record.summary.title}
							>
								{truncate(record.summary.title, 50)}
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
							key={`${record.username}${record.prType}${record.summary.number}${index}`}
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
