import { Badge } from "@mantine/core";
import type { UserType } from "./useUsers";

export function DisabledUserBadge({
	user,
	size,
}: {
	user: UserType;
	size?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
	return (
		<Badge
			variant="filled"
			color="gray"
			size={size}
			title={`User ${user.userdata.login} is disabled`}
		>
			Disabled
		</Badge>
	);
}
