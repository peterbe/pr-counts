import { createBrowserRouter } from "react-router";
import ErrorPage from "./components/error-page";
import { Home } from "./components/home";

export const router = createBrowserRouter([
	{
		path: "/",
		// element: <Root />,
		id: "root",
		errorElement: <ErrorPage />,
		children: [
			{
				errorElement: <ErrorPage />,
				children: [{ index: true, element: <Home /> }],
			},
		],
	},
]);
