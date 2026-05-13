import { Box, LoadingOverlay } from "@mantine/core";
import { UserButton } from "./UserButton";
import { useUsers } from "./useUsers";

export function SidebarUsers() {
	const query = useUsers();
	return (
		<Box pos="relative">
			<LoadingOverlay visible={query.isPending} />
			{Object.values(query.data?.users || {})
				.filter((u) => !u.disabled)
				.map((user) => {
					return <UserButton key={user.userdata.login} user={user} />;
				})}
		</Box>
	);
}
