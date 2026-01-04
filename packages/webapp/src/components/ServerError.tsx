import { Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

export function ServerError({ error }: { error: Error | null }) {
	const icon = <IconInfoCircle />;

	if (!error) return null;

	return (
		<Alert variant="light" color="red" title="Server Error" icon={icon}>
			{error.toString()}
		</Alert>
	);
}
