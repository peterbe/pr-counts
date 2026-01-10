import {
	Avatar,
	Box,
	Checkbox,
	SimpleGrid,
	Text,
	UnstyledButton,
} from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";
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

interface ImageCheckboxProps {
	checked?: boolean;
	defaultChecked?: boolean;
	onChange?: (checked: boolean) => void;
	title: string;
	description?: string;
	image: string;
}

function ImageCheckbox({
	checked,
	defaultChecked,
	onChange,
	title,
	description,
	className,
	image,
	...others
}: ImageCheckboxProps &
	Omit<React.ComponentPropsWithoutRef<"button">, keyof ImageCheckboxProps>) {
	const [value, handleChange] = useUncontrolled({
		value: checked,
		defaultValue: defaultChecked,
		finalValue: false,
		onChange,
	});

	return (
		<UnstyledButton
			{...others}
			onClick={() => handleChange(!value)}
			data-checked={value || undefined}
			className={classes.button}
			p={8}
		>
			{/* <Image src={image} alt={title} w={30} h={30} /> */}
			<Avatar src={image} alt={title} size={30} radius="xl" />

			<div className={classes.body}>
				{description !== undefined && (
					<Text c="dimmed" size="xs" lh={1} mb={5}>
						{description}
					</Text>
				)}
				<Text fw={500} size="sm" lh={1}>
					{title}
				</Text>
			</div>

			<Checkbox
				checked={value}
				onChange={() => {}}
				tabIndex={-1}
				styles={{ input: { cursor: "pointer" } }}
			/>
		</UnstyledButton>
	);
}
