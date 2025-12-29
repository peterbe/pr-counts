import { Checkbox, Group, Stack, Text } from "@mantine/core";
import { useState } from "react";
import classes from "./Sidebar.module.css";

export function Sidebar() {
	const data = [
		{
			name: "@peterbe",
			description: "Core components library: inputs, buttons, overlays, etc.",
		},
		{
			name: "@hasanx",
			description: "Collection of reusable hooks for React applications.",
		},
		{ name: "@0xRahul", description: "Notifications system" },
	];
	const [value, setValue] = useState<string[]>([]);

	const cards = data.map((item) => (
		<Checkbox.Card
			className={classes.root}
			radius="md"
			value={item.name}
			key={item.name}
		>
			<Group wrap="nowrap" align="flex-start">
				<Checkbox.Indicator />
				<div>
					<Text className={classes.label}>{item.name}</Text>
					<Text className={classes.description}>{item.description}</Text>
				</div>
			</Group>
		</Checkbox.Card>
	));

	return (
		<>
			<Checkbox.Group
				value={value}
				onChange={setValue}
				label="Pick packages to install"
				description="Choose all packages that you will need in your application"
			>
				<Stack pt="md" gap="xs">
					{cards}
				</Stack>
			</Checkbox.Group>

			<Text fz="xs" mt="md">
				CurrentValue: {value.join(", ") || "–"}
			</Text>
		</>
	);
}
