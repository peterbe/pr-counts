import {
	AppShell,
	Box,
	Text,
	Burger,
	Group,
	Timeline,
	SegmentedControl,
	LoadingOverlay,
	Select,
	Anchor,
	Avatar,
} from "@mantine/core";
import { useDisclosure, useDocumentTitle } from "@mantine/hooks";
import { useParams } from "react-router";
import { BasicHeader } from "./BasicHeader";
import { HeaderBreadcrumbs } from "./HeaderBreadcrumbs";
import { PRsByUser } from "./PRsByUser";
import { SidebarUsers } from "./SidebarUsers";
import { GeneralAppShell } from "./GeneralAppShell";
import {
	IconEyeCheck,
	IconGitBranch,
	IconGitCommit,
	IconGitPullRequest,
	IconMessageDots,
} from "@tabler/icons-react";
import { useOption } from "./useOption";
import { usePRCounts } from "./usePRCounts";
import { useUsers } from "./useUsers";
import { usePRs, type DailyPR } from "./usePRs";
import { ServerError } from "./ServerError";
import { sub } from "date-fns/sub";
import { isWithinInterval } from "date-fns/isWithinInterval";
import { startOfDay } from "date-fns/startOfDay";
import { da } from "date-fns/locale";
import { format } from "date-fns/format";
import { GitHubAvatar } from "./GitHubAvatar";

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
	const thisUser = Object.values(users.data?.users || {}).find(
		(u) => u.login === username,
	);
	const [daysAgo, setDaysAgo] = useOption<number>(
		1,
		"timeline-days-ago",
		username,
	);
	const daysAgoOptions = [
		{ label: "Yesterday", value: String(1) },
		// { label: "Monday, Jan 10", value: String(2) },
	];
	const date = startOfDay(sub(new Date(), { days: daysAgo }));
	const range = [date, sub(date, { days: 1 })];
	let dayRelevant: DailyPR | null = null;
	let daysAgoPossible = 0;
	if (query.data) {
		// console.log(query.data.prs);
		for (const each of query.data.prs) {
			const eventDate = new Date(each.date);
			if (isWithinInterval(eventDate, { start: range[0], end: range[1] })) {
				dayRelevant = each;
			}
			daysAgoPossible += 1;
			// console.log(
			// 	isWithinInterval(eventDate, { start: range[0], end: range[1] }),
			// 	eventDate,
			// 	range,
			// );
		}
		const { count } = query.data;
		for (let i = 2; i < count; i++) {
			const then = sub(new Date(), { days: i });
			daysAgoOptions.push({
				label: format(then, "ccc, LLL dd"),
				value: String(i),
			});
		}
	}
	// console.log({ daysAgoPossible, dayRelevant });
	// if (dayRelevant) {
	console.log(dayRelevant);
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
	console.log(flat);
	// return (
	// }
	return (
		<Box>
			<ServerError error={users.error || query.error} />
			<LoadingOverlay visible={query.isPending || users.isPending} />
			<Select
				data={daysAgoOptions}
				value={daysAgo.toString()}
				onChange={(value: string | null) => setDaysAgo(Number(value))}
				mb={30}
			/>

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
							<Text c="dimmed" size="sm">
								<Anchor href={event.html_url}>{event.title}</Anchor>{" "}
								{event.type === "pr-reviewed" && event.user ? (
									<Group gap="xs">
										<Text span>by</Text>
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
										<Text>{event.user.login}</Text>
									</Group>
								) : null}
								{/* You&apos;ve created new branch{" "}
								<Text variant="link" component="span" inherit>
									fix-notifications
								</Text>{" "}
								from master */}
							</Text>
							<Text size="xs" mt={4}>
								{format(new Date(event.created_at), "hh:mm a 'on' MMM dd")}
							</Text>
						</Timeline.Item>
					);
				})}
				{/*
				<Timeline.Item bullet={<IconGitCommit size={12} />} title="Commits">
					<Text c="dimmed" size="sm">
						You&apos;ve pushed 23 commits to
						<Text variant="link" component="span" inherit>
							fix-notifications branch
						</Text>
					</Text>
					<Text size="xs" mt={4}>
						52 minutes ago
					</Text>
				</Timeline.Item>

				<Timeline.Item
					title="Pull request"
					bullet={<IconGitPullRequest size={12} />}
					lineVariant="dashed"
				>
					<Text c="dimmed" size="sm">
						You&apos;ve submitted a pull request
						<Text variant="link" component="span" inherit>
							Fix incorrect notification message (#187)
						</Text>
					</Text>
					<Text size="xs" mt={4}>
						34 minutes ago
					</Text>
				</Timeline.Item>

				<Timeline.Item
					title="Code review"
					bullet={<IconMessageDots size={12} />}
				>
					<Text c="dimmed" size="sm">
						<Text variant="link" component="span" inherit>
							Robert Gluesticker
						</Text>{" "}
						left a code review on your pull request
					</Text>
					<Text size="xs" mt={4}>
						12 minutes ago
					</Text>
				</Timeline.Item> */}
			</Timeline>
		</Box>
	);
}
