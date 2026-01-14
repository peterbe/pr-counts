import { AppShell, Group, Burger } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { BasicHeader } from "./BasicHeader";
import { HeaderBreadcrumbs } from "./HeaderBreadcrumbs";
import { SidebarUsers } from "./SidebarUsers";

export function GeneralAppShell({ children }: { children: React.ReactNode }) {
	const [opened, { toggle }] = useDisclosure();

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
			<AppShell.Main>{children}</AppShell.Main>
		</AppShell>
	);
}
