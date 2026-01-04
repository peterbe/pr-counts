import { AppShell, Group } from "@mantine/core";
import { useDisclosure, useDocumentTitle } from "@mantine/hooks";
import { AllUsersList } from "./AllUsersList";
import { BasicHeader } from "./BasicHeader";
import { SidebarUsers } from "./SidebarUsers";

export function AllUsers() {
	const [opened] = useDisclosure();

	useDocumentTitle("All users");

	return (
		<AppShell
			header={{ height: 60 }}
			navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
			padding="md"
		>
			<AppShell.Header>
				<Group h="100%" px="md">
					{/* <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" /> */}
					<BasicHeader />
				</Group>
			</AppShell.Header>
			<AppShell.Navbar p="md">
				<SidebarUsers />
			</AppShell.Navbar>
			<AppShell.Main>
				<AllUsersList />
			</AppShell.Main>
		</AppShell>
	);
}
