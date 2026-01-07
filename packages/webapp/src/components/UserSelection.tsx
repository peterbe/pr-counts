import { Box, Checkbox, LoadingOverlay, Stack } from "@mantine/core";
import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { usePRCounts } from "./usePRCounts";

export function UserSelection() {
	const [searchParams, setSearchParams] = useSearchParams();
	const selectedUsers = searchParams.getAll("users");

	const query = usePRCounts();
	const data: {
		name: string;
		description: string;
	}[] = [];

	type UserData = {
		firstDate: string;
		sumPRsCreated: number;
		sumPRsReviewed: number;
	};

	const byUser: Record<string, UserData> = {};
	if (query.data) {
		for (const rows of Object.values(query.data)) {
			for (const row of rows) {
				if (!byUser[row.username]) {
					byUser[row.username] = {
						firstDate: row.date,
						sumPRsCreated: 0,
						sumPRsReviewed: 0,
					};
				}
				byUser[row.username].sumPRsCreated += row.count_prs_created;
				byUser[row.username].sumPRsReviewed += row.count_prs_reviewed;
			}
		}
		for (const [username, stats] of Object.entries(byUser)) {
			data.push({
				name: username,
				description: `created ${stats.sumPRsCreated} PRs, reviewed ${stats.sumPRsReviewed} PRs`,
			});
		}
	}

	// const possibleUsers = Object.keys(byUser);

	const setSelectedUsers = useCallback(
		(users: string[]) => {
			const params = new URLSearchParams(searchParams);
			params.delete("users");
			for (const v of users) {
				params.append("users", v);
			}
			setSearchParams(params);
		},
		[searchParams, setSearchParams],
	);

	// useEffect(() => {
	// 	// setValue(selectedUsers);
	// 	if (possibleUsers.length === 0) return;
	// 	if (selectedUsers.length) {
	// 		if (!equalArrays(selectedUsers, rememberedUsers)) {
	// 			console.log("HERE", [selectedUsers, rememberedUsers]);

	// 			setRememberedUsers(selectedUsers);
	// 		}
	// 	} else if (rememberedUsers.length) {
	// 		setSelectedUsers(rememberedUsers);
	// 		// console.log(
	// 		// 	"selectedUsers changed:",
	// 		// 	selectedUsers,
	// 		// 	"possibleUsers",
	// 		// 	possibleUsers,
	// 		// 	"rememberedUsers",
	// 		// 	rememberedUsers,
	// 		// );
	// 	}
	// }, [
	// 	selectedUsers,
	// 	possibleUsers,
	// 	rememberedUsers,
	// 	setRememberedUsers,
	// 	setSelectedUsers,
	// ]);

	return (
		<Box pos="relative">
			<LoadingOverlay visible={query.isPending} />
			<Checkbox.Group
				value={selectedUsers}
				onChange={(value) => {
					setSelectedUsers(value);
				}}
				// label="Pick packages to install"
				label="Select users"
				// description="Choose all packages that you will need in your application"
			>
				<Stack pt="md" gap="xs">
					{data.map((item) => (
						<Checkbox value={item.name} label={item.name} key={item.name} />
					))}
				</Stack>
			</Checkbox.Group>
		</Box>
	);
}

function _equalArrays(a: string[], b: string[]) {
	if (a.length !== b.length) return false;
	return a.every((value, index) => value === b[index]);
}
