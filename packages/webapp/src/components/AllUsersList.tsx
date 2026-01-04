import { Box, LoadingOverlay } from "@mantine/core";
import { type SimplePRCountsType, UserButton } from "./UserButton";
import { usePRCounts } from "./usePRCounts";
import { type UsersType, useUsers } from "./useUsers";

export function AllUsersList() {
	const query = useUsers();

	return (
		<Box pos="relative">
			<LoadingOverlay visible={query.isPending} />
			{query.data && <ListUsers data={query.data} />}
		</Box>
	);
}

function ListUsers({ data }: { data: UsersType }) {
	const prs = usePRCounts();

	if (Object.keys(data.users).length === 0) {
		return <div>No users found</div>;
	}
	const prCounts = new Map<string, SimplePRCountsType>();
	if (prs.data) {
		if (prs.data) {
			for (const countsArray of Object.values(prs.data)) {
				for (const counts of countsArray) {
					prCounts.set(counts.username, {
						count_prs_created:
							counts.count_prs_created +
							(prCounts.get(counts.username)?.count_prs_created || 0),
						count_prs_reviewed:
							counts.count_prs_reviewed +
							(prCounts.get(counts.username)?.count_prs_reviewed || 0),
					});
				}
			}
		}
	}
	return Object.values(data.users).map((user) => (
		<UserButton
			key={user.login}
			user={user}
			counts={prCounts.get(user.login)}
		/>
	));
}
