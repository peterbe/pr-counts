import { useLocalStorage } from "@mantine/hooks";

const PREFIX = "pr-counts";

export function useOption<T>(defaultValue: T, ...keys: string[]) {
	if (!keys.length) {
		throw new Error("At least one key must be provided");
	}
	const key = `${PREFIX}:${keys.join(":")}`;
	return useLocalStorage<T>({
		key,
		defaultValue,
	});
}
