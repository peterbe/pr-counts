import { Box, SimpleGrid, Text, UnstyledButton } from "@mantine/core";
import { ImageCheckbox } from "./ImageCheckbox";
import classes from "./ImageCheckboxes.module.css";
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
	const items = selectable.map((item) => (
		<ImageCheckbox
			key={item.login}
			checked={selected.includes(item.login)}
			defaultChecked={false}
			onChange={(checked) => {
				if (checked) {
					onChange([...selected, item.login]);
				} else {
					onChange(selected.filter((s) => s !== item.login));
				}
			}}
			title={item.login}
			image={item.avatar_url}
		/>
	));
	if (selected.length > 0) {
		items.push(
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
			</UnstyledButton>,
		);
	}

	return (
		<Box>
			<Text fw={500}>Compare with other users</Text>
			<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>{items}</SimpleGrid>
		</Box>
	);
}
