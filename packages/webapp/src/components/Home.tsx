import { AppShell, Burger, Group } from "@mantine/core";
import { useDisclosure, useDocumentTitle } from "@mantine/hooks";
import { PRsChart } from "./PRsChart";
import { Sidebar } from "./Sidebar";

export function Home() {
	const [opened, { toggle }] = useDisclosure();
	useDocumentTitle("Home");

	return (
		<AppShell
			header={{ height: 60 }}
			navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
			padding="md"
		>
			<AppShell.Header>
				<Group h="100%" px="md">
					<Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
					Header has a burger icon below sm breakpoint
				</Group>
			</AppShell.Header>
			<AppShell.Navbar p="md">
				<Sidebar />
			</AppShell.Navbar>
			<AppShell.Main>
				<PRsChart />
			</AppShell.Main>
		</AppShell>
	);
}
