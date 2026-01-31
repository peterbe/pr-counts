import { Anchor, Avatar, Text } from "@mantine/core";
import type { UserType } from "./useUsers";

export function GitHubAvatar({
	user,
	size = 48,
	textSize,
	nameOnly = false,
}: {
	user: UserType;
	size?: number;
	textSize?: "xs" | "sm" | "md" | "lg" | "xl";
	nameOnly?: boolean;
}) {
	const src =
		user.avatar_url ||
		"https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png";
	return (
		<Anchor href={user.html_url} target="_blank">
			{nameOnly ? (
				<Text size={textSize} span>
					{user.login}
				</Text>
			) : (
				<Avatar
					src={src}
					alt={user.login}
					size={size}
					component="span"
					style={{ display: "inline-block" }}
				/>
			)}
		</Anchor>
	);
}
