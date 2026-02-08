import { Box, Button, LoadingOverlay } from "@mantine/core";
import { ImageCheckbox } from "./ImageCheckbox";
import { usePRCounts } from "./usePRCounts";
import { useSelectedUsers } from "./useSelectedUsers";
import { useUsers } from "./useUsers";

export function UserSelection() {
	const [selectedUsers, setSelectedUsers, resetSelectedUsers] =
		useSelectedUsers();

	const users = useUsers();
	const query = usePRCounts();
	const data: {
		name: string;
		description: string;
	}[] = [];

	type UserData = {
		firstDate: string;
		sumPRsCreated: number;
		sumPRsReviewed: number;
	};

	const byUser: Record<string, UserData> = {};
	if (query.data) {
		for (const rows of Object.values(query.data)) {
			for (const row of rows) {
				if (!byUser[row.username]) {
					byUser[row.username] = {
						firstDate: row.date,
						sumPRsCreated: 0,
						sumPRsReviewed: 0,
					};
				}
				byUser[row.username].sumPRsCreated += row.count_prs_created;
				byUser[row.username].sumPRsReviewed += row.count_prs_reviewed;
			}
		}
		for (const [username, stats] of Object.entries(byUser)) {
			data.push({
				name: username,
				description: `created ${stats.sumPRsCreated} PRs, reviewed ${stats.sumPRsReviewed} PRs`,
			});
		}
	}

	const allUsers = Object.values(users.data?.users || {});

	return (
		<Box pos="relative">
			<LoadingOverlay visible={query.isPending || users.isPending} />
			{allUsers.map((user) => {
				return (
					<Box mb={20} key={user.login}>
						<ImageCheckbox
							checked={selectedUsers.includes(user.login)}
							defaultChecked={false}
							onChange={(checked) => {
								if (checked) {
									setSelectedUsers([...selectedUsers, user.login]);
								} else {
									setSelectedUsers(
										selectedUsers.filter((s) => s !== user.login),
									);
								}
							}}
							title={user.login}
							image={user.avatar_url}
						/>
					</Box>
				);
			})}
			{selectedUsers.length > 0 && (
				<Box>
					<Button
						variant="default"
						onClick={() => {
							resetSelectedUsers();
						}}
						fullWidth
					>
						Clear
					</Button>
				</Box>
			)}
		</Box>
	);
}
