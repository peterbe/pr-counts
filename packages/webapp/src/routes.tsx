import { createBrowserRouter } from "react-router";
import { AllUsers } from "./components/AllUsers";
import { ByUser } from "./components/ByUser";
import { ChartByUser } from "./components/ChartByUser";
import ErrorPage from "./components/error-page";
import { Home } from "./components/Home";
import { NumbersByUser } from "./components/NumbersByUser";

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
					{ path: "user/:username/numbers", element: <NumbersByUser /> },
					{ path: "user/:username/chart", element: <ChartByUser /> },
					{ path: "user/:username", element: <ByUser /> },
				],
			},
		],
	},
]);
