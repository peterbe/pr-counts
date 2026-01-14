import { useQuery } from "@tanstack/react-query";

export type UserType = {
	login: string;
	html_url: string;
	site_admin?: boolean;
	avatar_url: string;
};
export type UsersType = {
	users: UserType[];
};
export function useUsers() {
	return useQuery<UsersType>({
		queryKey: ["users"],
		queryFn: async () => {
			const r = await fetch("/exports/users.json");
			if (!r.ok) {
				throw new Error(`${r.status} on ${r.url}`);
			}
			return r.json();
		},
	});
}
