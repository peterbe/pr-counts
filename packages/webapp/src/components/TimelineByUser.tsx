import {
	ActionIcon,
	Anchor,
	Box,
	Flex,
	Group,
	LoadingOverlay,
	Select,
	Text,
	Timeline,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import {
	IconArrowLeft,
	IconArrowRight,
	IconEyeCheck,
	IconGitPullRequest,
} from "@tabler/icons-react";
import { format } from "date-fns/format";
import { startOfDay } from "date-fns/startOfDay";
import { sub } from "date-fns/sub";
import { useParams } from "react-router";
import { GeneralAppShell } from "./GeneralAppShell";
import { GitHubAvatar } from "./GitHubAvatar";
import { ServerError } from "./ServerError";
import { useDaysAgoOptions } from "./useDaysAgoOptions";
import { useOption } from "./useOption";
import { type DailyPR, usePRs } from "./usePRs";
import { useUsers } from "./useUsers";

export function TimelineByUser() {
	const params = useParams();
	useDocumentTitle(
		params.username ? `Timeline for @${params.username}` : "Timeline",
	);
	return (
		<GeneralAppShell>
			{params.username && <ByUser username={params.username} />}
		</GeneralAppShell>
	);
}

function ByUser({ username }: { username: string }) {
	const query = usePRs(username);
	const users = useUsers();
	// const _thisUser = Object.values(users.data?.users || {}).find(
	// 	(u) => u.login === username,
	// );
	const [daysAgo, setDaysAgo] = useOption<number>(
		1,
		"timeline-days-ago",
		username,
	);

	const daysAgoOptions = useDaysAgoOptions(query.data?.prs || []);
	const date = startOfDay(sub(new Date(), { days: daysAgo }));
	const keyMaker = (date: Date | string) => format(date, "yyyy-MM-dd");
	const key = keyMaker(date);
	const dayRelevant: DailyPR | undefined = (query.data?.prs || []).find(
		(each) => {
			return keyMaker(each.date) === key;
		},
	);

	type PREvent = {
		type: "pr-created" | "pr-reviewed";
		user?: {
			login: string;
			html_url: string;
			avatar_url: string;
		};
		state: string;
		title: string;
		number: number;
		html_url: string;
		created_at: string;
	};

	const flat: PREvent[] = [];
	for (const pr of dayRelevant?.created_prs || []) {
		flat.push({
			type: "pr-created",
			state: pr.state,
			title: pr.title,
			number: pr.number,
			html_url: pr.html_url,
			created_at: pr.created_at,
			user: pr.user,
		});
	}
	for (const pr of dayRelevant?.reviewed_prs || []) {
		flat.push({
			type: "pr-reviewed",
			state: pr.state,
			title: pr.title,
			number: pr.number,
			html_url: pr.html_url,
			created_at: pr.created_at,
			user: pr.user,
		});
	}
	flat.sort((a, b) => {
		return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
	});
	return (
		<Box data-testid="timeline-by-user">
			<ServerError error={users.error || query.error} />
			<LoadingOverlay visible={query.isPending || users.isPending} />

			<Flex gap="md">
				<Select
					data={daysAgoOptions}
					value={daysAgo.toString()}
					onChange={(value: string | null) => setDaysAgo(Number(value))}
					mb={30}
					// size="md"
					style={{ width: 400 }}
					// comboboxProps={{ width: 300 }}
				/>
				{/* <Box> */}
				<ActionIcon
					variant="default"
					disabled={daysAgo === 1}
					onClick={() => {
						setDaysAgo((prev) => prev - 1);
					}}
				>
					<IconArrowLeft />
				</ActionIcon>
				<ActionIcon
					variant="default"
					disabled={daysAgo === daysAgoOptions.length}
					onClick={() => {
						setDaysAgo((prev) => prev + 1);
					}}
				>
					<IconArrowRight />
				</ActionIcon>
				{/* </Box> */}
			</Flex>

			{!flat.length && <Text fs="italic">No activity for this day.</Text>}

			<Timeline
				// active={1}
				bulletSize={24}
				lineWidth={2}
			>
				{flat.map((event, index) => {
					let title = "";
					let icon = <IconGitPullRequest size={12} />;
					if (event.type === "pr-created") {
						icon = <IconGitPullRequest size={12} />;
						title = `Created PR`;
					} else if (event.type === "pr-reviewed") {
						icon = <IconEyeCheck size={12} />;
						title = `Reviewed PR`;
					}
					return (
						<Timeline.Item
							key={`${event.number}${index}`}
							bullet={icon}
							title={title}
						>
							<Box c="dimmed">
								<Anchor href={event.html_url} target="_blank">
									{event.title}
								</Anchor>{" "}
								{event.type === "pr-reviewed" && event.user ? (
									<Group gap="xs">
										<Text span size="sm">
											by
										</Text>
										{/* <Anchor href={event.user.html_url}>
												<Avatar
													component="span"
													src={event.user.avatar_url}
													size={14}
													radius="xl"
													mr={4}
												/>
												{event.user.login}
											</Anchor> */}
										<GitHubAvatar user={event.user} size={14} />
										<Text size="sm">{event.user.login}</Text>
									</Group>
								) : null}
								{/* You&apos;ve created new branch{" "}
								<Text variant="link" component="span" inherit>
									fix-notifications
								</Text>{" "}
								from master */}
							</Box>
							<Text size="xs" mt={4}>
								{format(new Date(event.created_at), "hh:mm a 'on' MMM dd")}
							</Text>
						</Timeline.Item>
					);
				})}
			</Timeline>
		</Box>
	);
}
