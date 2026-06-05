import { Badge } from "@mantine/core";

const TEAM_COLORS = [
	"grape",
	"indigo",
	"cyan",
	"teal",
	"green",
	"orange",
] as const;

export function hashStringToInt(input: string): number {
	let hash = 5381;
	for (let i = 0; i < input.length; i++) {
		hash = (hash * 33) ^ input.charCodeAt(i);
	}
	return hash >>> 0;
}

function getTeamColor(team: string): string {
	return TEAM_COLORS[hashStringToInt(team) % TEAM_COLORS.length];
}

export function TeamBadge({
	team,
	size,
}: {
	team: string;
	size?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
	const color = getTeamColor(team);

	return (
		<Badge variant="white" color={color} size={size}>
			{team}
		</Badge>
	);
}
