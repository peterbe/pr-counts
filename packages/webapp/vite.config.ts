import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const API_TARGET = process.env.VITE_API_TARGET ?? "http://localhost:3000";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		// port: 4001,
		proxy: {
			"/api": {
				target: API_TARGET,
				changeOrigin: true,
				secure: false,
				ws: true,
			},
		},
	},
});
