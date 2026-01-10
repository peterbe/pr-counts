import { Anchor, Breadcrumbs } from "@mantine/core";
import { Link, useLocation, useParams } from "react-router";

export function HeaderBreadcrumbs() {
	const { pathname } = useLocation();
	const params = useParams();

	console.log("PATHNAME", pathname);
	if (/\/user\/[^/]+\/(numbers|chart)/.test(pathname)) {
		const username = params.username as string;
		const items = [
			<Anchor component={Link} to="/user" key="users">
				Users
			</Anchor>,
			<Anchor component={Link} to={`/user/${username}`} key="users-user">
				@{username}
			</Anchor>,
			// <Anchor
			// 	component={Link}
			// 	to={`/user/${username}/numbers`}
			// 	key="users-user-numbers"
			// >
			// 	Numbers
			// </Anchor>,
		];
		if (pathname.endsWith("/numbers")) {
			items.push(<span key="users-user-numbers-current">Numbers</span>);
		} else if (pathname.endsWith("/chart")) {
			items.push(<span key="users-user-chart-current">Chart</span>);
		}
		return <Breadcrumbs>{items}</Breadcrumbs>;
	}
	return null;
}
