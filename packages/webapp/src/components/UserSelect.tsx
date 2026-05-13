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
