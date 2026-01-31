import { AppShell, Burger, Container, Group } from "@mantine/core";
import { useDisclosure, useDocumentTitle } from "@mantine/hooks";
import { BasicHeader } from "./BasicHeader";
import { PRsChart } from "./PRsChart";
import { Sidebar } from "./Sidebar";
import { GeneralAppShell } from "./GeneralAppShell";
import { UserSelection } from "./UserSelection";

export function Home() {
	useDocumentTitle("PR Counts Dashboard");

	return (
		<GeneralAppShell Sidebar={UserSelection}>
			<Container style={{ minWidth: 900 }}>
				<PRsChart />
			</Container>
		</GeneralAppShell>
	);
	// return (
	// 	<AppShell
	// 		header={{ height: 60 }}
	// 		navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
	// 		padding="md"
	// 	>
	// 		<AppShell.Header>
	// 			<Group h="100%" px="md">
	// 				<Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
	// 				<BasicHeader />
	// 			</Group>
	// 		</AppShell.Header>
	// 		<AppShell.Navbar p="md">
	// 			<Sidebar />
	// 		</AppShell.Navbar>
	// 		<AppShell.Main>
	// 			<PRsChart />
	// 		</AppShell.Main>
	// 	</AppShell>
	// );
}
