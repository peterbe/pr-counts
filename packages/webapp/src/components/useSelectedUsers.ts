import { useSessionStorage } from "@mantine/hooks";

export function useSelectedUsers() {
	return useSessionStorage<string[]>({
		key: `pr-counts:user-selection`,
		defaultValue: [],
	});
}
