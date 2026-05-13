import { Avatar, Checkbox, Text, UnstyledButton } from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";
import classes from "./ImageCheckboxes.module.css";

interface ImageCheckboxProps {
	checked?: boolean;
	defaultChecked?: boolean;
	onChange?: (checked: boolean) => void;
	title: string;
	description?: string;
	image: string;
}

export function ImageCheckbox({
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
				disabled={others.disabled}
				styles={{ input: { cursor: "pointer" } }}
			/>
		</UnstyledButton>
	);
}
