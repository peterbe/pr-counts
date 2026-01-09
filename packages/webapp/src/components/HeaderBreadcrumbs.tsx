import { Anchor, Breadcrumbs } from "@mantine/core";
import { Link, useLocation, useParams } from "react-router";

export function HeaderBreadcrumbs() {
	const { pathname } = useLocation();
	const params = useParams();

	if (/\/user\/[^/]+\/numbers/.test(pathname)) {
		const username = params.username as string;
		const items = [
			<Anchor component={Link} to="/user" key="users">
				Users
			</Anchor>,
			<Anchor component={Link} to={`/user/${username}`} key="users-user">
				@{username}
			</Anchor>,
			<Anchor
				component={Link}
				to={`/user/${username}/numbers`}
				key="users-user-numbers"
			>
				Numbers
			</Anchor>,
		];
		return <Breadcrumbs>{items}</Breadcrumbs>;
	}
	return null;
}
