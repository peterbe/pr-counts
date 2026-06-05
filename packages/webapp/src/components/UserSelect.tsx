import { Box, SimpleGrid, Text, UnstyledButton } from "@mantine/core";
import { ImageCheckbox } from "./ImageCheckbox";
import classes from "./ImageCheckboxes.module.css";
import { TeamBadge } from "./TeamBadge";
import type { UserType } from "./useUsers";

export function UserSelect({
	selected,
	selectable,
	onChange,
}: {
	selected: string[];
	selectable: UserType[];
	onChange: (selected: string[]) => void;
}) {
	const selectableByTeam: Record<string, UserType[]> = {};
	for (const s of selectable) {
		const team = s.team || "";
		if (!selectableByTeam[team]) {
			selectableByTeam[team] = [];
		}
		selectableByTeam[team].push(s);
	}

	function getItems(selectable: UserType[]) {
		return selectable.map((item) => (
			<ImageCheckbox
				key={item.userdata.login}
				checked={selected.includes(item.userdata.login)}
				disabled={item.disabled}
				defaultChecked={false}
				onChange={(checked) => {
					if (checked) {
						onChange([...selected, item.userdata.login]);
					} else {
						onChange(selected.filter((s) => s !== item.userdata.login));
					}
				}}
				title={item.userdata.login}
				image={item.userdata.avatar_url}
			/>
		));
	}

	return (
		<Box>
			<Text fw={500}>Compare with other users</Text>
			{Object.keys(selectableByTeam).length > 1 ? (
				Object.entries(selectableByTeam).map(([team, selectable]) => {
					return (
						<Box key={team} mb={20}>
							<TeamBadge team={team} />
							<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
								{getItems(selectable)}
							</SimpleGrid>
						</Box>
					);
				})
			) : (
				<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
					{getItems(selectableByTeam[""])}
				</SimpleGrid>
			)}
			{selected.length && (
				<UnstyledButton
					key="__clear"
					onClick={() => {
						onChange([]);
					}}
					className={classes.button}
					style={{ justifyContent: "center" }}
					p={8}
				>
					Clear
				</UnstyledButton>
			)}
		</Box>
	);
}
