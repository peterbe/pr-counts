import { AppShell, Burger, Group } from "@mantine/core";
import { useDisclosure, useDocumentTitle } from "@mantine/hooks";
import { useParams } from "react-router";
import { BasicHeader } from "./BasicHeader";
import { HeaderBreadcrumbs } from "./HeaderBreadcrumbs";
import { PRsByUser } from "./PRsByUser";
import { SidebarUsers } from "./SidebarUsers";

export function ChartByUser() {
	const [opened, { toggle }] = useDisclosure();
	// const users = useUsers();
	const params = useParams();

	useDocumentTitle(params.username ? `PRs by @${params.username}` : "By user");

	return (
		<AppShell
			header={{ height: 60 }}
			navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
			padding="md"
		>
			<AppShell.Header>
				<Group h="100%" px="md">
					<Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
					<BasicHeader />
					<HeaderBreadcrumbs />
				</Group>
			</AppShell.Header>
			<AppShell.Navbar p="md">
				<SidebarUsers />
			</AppShell.Navbar>
			<AppShell.Main>
				{params.username && <PRsByUser username={params.username} />}
			</AppShell.Main>
		</AppShell>
	);
}
