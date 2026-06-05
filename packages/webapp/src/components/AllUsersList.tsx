import { Box, LoadingOverlay, SegmentedControl } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { type SimplePRCountsType, UserButton } from "./UserButton";
import { usePRCounts } from "./usePRCounts";
import { type UsersType, useUsers } from "./useUsers";

export function AllUsersList() {
	const query = useUsers();

	return (
		<Box pos="relative">
			<LoadingOverlay visible={query.isPending} />
			{query.data && <ListUsers data={query.data} />}
		</Box>
	);
}

function ListUsers({ data }: { data: UsersType }) {
	const prs = usePRCounts();

	const [sortOption, setSortOption] = useLocalStorage<string>({
		key: "all-users-sort-option",
		defaultValue: "name",
	});

	if (Object.keys(data.users).length === 0) {
		return <div>No users found</div>;
	}

	const prCounts = new Map<string, SimplePRCountsType>();
	if (prs.data) {
		if (prs.data) {
			for (const countsArray of Object.values(prs.data)) {
				for (const counts of countsArray) {
					prCounts.set(counts.username, {
						count_prs_created:
							counts.count_prs_created +
							(prCounts.get(counts.username)?.count_prs_created || 0),
						count_prs_reviewed:
							counts.count_prs_reviewed +
							(prCounts.get(counts.username)?.count_prs_reviewed || 0),
					});
				}
			}
		}
	}

	const sortOptions: { label: string; value: string }[] = [
		{ label: "Sort by Name", value: "name" },
	];
	const teams = new Set(
		Object.values(data.users)
			.map((u) => u.team)
			.filter((t): t is string => !!t),
	);
	if (teams.size > 0) {
		sortOptions.push({ label: "Sort by Team", value: "team" });
	}

	const users = Object.values(data.users);

	if (sortOption === "name") {
		users.sort((a, b) => a.userdata.login.localeCompare(b.userdata.login));
	} else if (sortOption === "team") {
		users.sort((a, b) => {
			const teamA = a.team || "";
			const teamB = b.team || "";
			if (teamA === teamB) {
				return a.userdata.login.localeCompare(b.userdata.login);
			}
			if (teamA === "") return 1;
			return teamA.localeCompare(teamB);
		});
	}

	return (
		<Box>
			{users.map((user) => (
				<UserButton
					key={user.userdata.login}
					user={user}
					counts={prCounts.get(user.userdata.login)}
				/>
			))}
			{sortOptions.length > 1 && (
				<SegmentedControl
					value={sortOption}
					onChange={setSortOption}
					data={sortOptions}
				/>
			)}
		</Box>
	);
}
