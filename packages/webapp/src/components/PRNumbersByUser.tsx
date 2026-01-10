import { Box, Group, LoadingOverlay, Title } from "@mantine/core";
import { GitHubAvatar } from "./GitHubAvatar";
import { ServerError } from "./ServerError";
import { usePRCounts } from "./usePRCounts";
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
