import { Group, Paper, SimpleGrid, Text } from "@mantine/core";
import {
	IconArrowDownRight,
	IconArrowUpRight,
	IconCoin,
	IconEyeCheck,
	IconGitPullRequest,
	IconReceipt2,
} from "@tabler/icons-react";
import classes from "./StatsGrid.module.css";

const icons = {
	pullrequest: IconGitPullRequest,
	review: IconEyeCheck,
	receipt: IconReceipt2,
	coin: IconCoin,
};

export function NumbersGrid({
	dataPoints,
}: {
	dataPoints: readonly {
		title: string;
		icon: keyof typeof icons;
		value: string;
		diff: number;
	}[];
}) {
	const stats = dataPoints.map((stat) => {
		const Icon = icons[stat.icon];
		const DiffIcon =
			stat.diff === 0
				? null
				: stat.diff > 0
					? IconArrowUpRight
					: IconArrowDownRight;

		return (
			<Paper withBorder p="md" radius="md" key={stat.title}>
				<Group justify="space-between">
					<Text size="xs" c="dimmed" className={classes.title}>
						{stat.title}
					</Text>
					<Icon className={classes.icon} size={22} stroke={1.5} />
				</Group>

				<Group align="flex-end" gap="xs" mt={25}>
					<Text className={classes.value}>{stat.value}</Text>
					<Text
						c={stat.diff === 0 ? "grey" : stat.diff > 0 ? "teal" : "red"}
						fz="sm"
						fw={500}
						className={classes.diff}
					>
						<span>{stat.diff}</span>
						{DiffIcon && <DiffIcon size={16} stroke={1.5} />}
					</Text>
				</Group>

				<Text fz="xs" c="dimmed" mt={7}>
					Compared to previous month
				</Text>
			</Paper>
		);
	});
	return (
		<div>
			<SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>{stats}</SimpleGrid>
		</div>
	);
}
