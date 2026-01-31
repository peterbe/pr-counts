import { createBrowserRouter } from "react-router";
import { AllUsers } from "./components/AllUsers";
import { ChartByUser } from "./components/ChartByUser";
import ErrorPage from "./components/error-page";
import { Home } from "./components/Home";
import { TimelineByUser } from "./components/TimelineByUser";
import { Events } from "./components/Events";

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
					{ path: "user/:username/timeline", element: <TimelineByUser /> },
					{ path: "user/:username", element: <ChartByUser /> },
					{ path: "events", element: <Events /> },
				],
			},
		],
	},
]);
