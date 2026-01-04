import { Anchor, Avatar } from "@mantine/core";
import type { UserType } from "./useUsers";

export function GitHubAvatar({ user, size }: { user: UserType; size: number }) {
	const src =
		user.avatar_url ||
		"https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png";
	return (
		<Anchor href={user.html_url} target="_blank">
			<Avatar src={src} alt={user.login} size={size} />
		</Anchor>
	);
}
