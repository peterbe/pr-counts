import { createBrowserRouter } from "react-router";
import { AllUsers } from "./components/AllUsers";
import { ByUser } from "./components/ByUser";
import ErrorPage from "./components/error-page";
import { Home } from "./components/Home";

export const router = createBrowserRouter([
	{
		path: "/",
		// element: <Root />,
		id: "root",
		errorElement: <ErrorPage />,
		children: [
			{
				errorElement: <ErrorPage />,
				children: [
					{ index: true, element: <Home /> },
					{ path: "user", element: <AllUsers /> },
					{ path: "user/:username", element: <ByUser /> },
				],
			},
		],
	},
]);
