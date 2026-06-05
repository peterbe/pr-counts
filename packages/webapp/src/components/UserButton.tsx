import { Avatar, Group, Text, UnstyledButton } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router";
import { TeamBadge } from "./TeamBadge";
import classes from "./UserButton.module.css";
import type { UserType } from "./useUsers";

export type SimplePRCountsType = {
	count_prs_created: number;
	count_prs_reviewed: number;
};

export function UserButton({
	user,
	counts,
}: {
	user: UserType;
	counts?: SimplePRCountsType;
}) {
	const navigate = useNavigate();
	const location = useLocation();
	const isActive =
		location.pathname === `/user/${user.userdata.login}` ||
		location.pathname === `/user/${user.userdata.login}/timeline`;
	return (
		<UnstyledButton
			className={classes.user}
			//   disabled={user.disabled}
			style={
				isActive
					? {
							border: "1px solid var(--mantine-color-gray-3)",
							backgroundColor: "rgb(0, 0, 0, 0.05)",
						}
					: undefined
			}
			onClick={() => {
				navigate(`/user/${user.userdata.login}`);
			}}
		>
			<Group>
				<Avatar
					src={
						user.userdata.avatar_url
							? user.userdata.avatar_url
							: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png"
					}
					radius="xl"
				/>

				<div style={{ flex: 1 }}>
					<Text size="sm" fw={500}>
						{user.userdata.login}
					</Text>
					{counts && (
						<Text c="dimmed" size="xs">
							{counts.count_prs_created} PRs created,{" "}
							{counts.count_prs_reviewed} PRs reviewed in total
						</Text>
					)}
					{user.team && <TeamBadge team={user.team} />}
				</div>

				<IconChevronRight size={14} stroke={1.5} />
			</Group>
		</UnstyledButton>
	);
}
