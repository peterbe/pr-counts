import { Group } from "@mantine/core";
import { Link, useLocation } from "react-router";
import classes from "./BasicHeader.module.css";

export function BasicHeader() {
	const location = useLocation();
	const links = [
		{ to: "/", label: "Home" },
		{ to: "/user", label: "Users" },
	];

	return (
		<Group gap={5} visibleFrom="xs">
			{links.map((link) => (
				<Link
					key={link.to}
					to={link.to}
					className={classes.link}
					data-active={location.pathname === link.to ? "true" : undefined}
				>
					{link.label}
				</Link>
			))}
		</Group>
	);
}
