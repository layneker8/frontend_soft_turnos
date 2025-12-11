import env from "@/config/env";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AppState {
	// Estado de la UI
	darkMode: boolean;
	sidebarOpen: boolean;
	// Acciones de UI
	toggleDarkMode: () => void;
	toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
	devtools(
		(set) => ({
			// Estado inicial
			darkMode: false,
			sidebarOpen: true,
			// Acciones de UI
			toggleDarkMode: () => {
				set(
					(state) => ({ darkMode: !state.darkMode }),
					false,
					"toggleDarkMode"
				);
			},

			toggleSidebar: () => {
				set(
					(state) => ({ sidebarOpen: !state.sidebarOpen }),
					false,
					"toggleSidebar"
				);
			},
		}),
		{
			name: "app-store", // nombre para las DevTools
			enabled: env.isDevelopment, // habilitar solo en desarrollo
		}
	)
);
