import { useDocumentTitle } from "@mantine/hooks";
import { Navigate, useParams } from "react-router";

export function ByUser() {
	const params = useParams();

	useDocumentTitle(params.username ? ` @${params.username}` : "By user");

	if (params.username) {
		return <Navigate to={`/user/${params.username}/chart`} />;
	}
	return null;
}
