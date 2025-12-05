import type { User } from "@/stores";
import { useAppStore } from "@/stores/appStore";
import React from "react";
import { useLocation } from "react-router-dom";

interface HeaderProps {
	user: User | null;
	darkMode: boolean;
	toggleDarkMode: () => void;
	handleLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
	user,
	darkMode,
	toggleDarkMode,
	handleLogout,
}) => {
	const { sidebarOpen, toggleSidebar } = useAppStore();
	const { pathname } = useLocation();

	return (
		<>
			{/* Header */}
			<header className="flex items-center bg-white h-[70px] dark:bg-gray-800 shadow sticky top-0 z-30 w-full">
				<div className="w-full px-3 md:px-6">
					<div className="flex justify-between items-center h-[70px]">
						{/* Botón menú solo en móvil */}

						<button
							className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${
								pathname === "/create-turnos"
									? "opacity-0 pointer-events-none"
									: ""
							}`}
							onClick={toggleSidebar}
							aria-label="Abrir menú"
						>
							<span className="material-symbols-rounded">
								{sidebarOpen ? "left_panel_close" : "left_panel_open"}
							</span>
						</button>
						<div className="flex items-center gap-2 md:gap-4">
							<div className="hidden sm:flex flex-col">
								<span className="text-secondary text-sm truncate max-w-[150px] md:max-w-none">
									Bienvenido, {user?.nombre || user?.username || "Usuario"}
								</span>
								<p className="text-xs text-secondary/50 flex items-center gap-1">
									<span className="material-symbols-rounded text-sm">
										location_on
									</span>
									<span className="truncate max-w-[120px] md:max-w-none">
										{user?.sede || "-"}
									</span>
								</p>
							</div>
							<button
								onClick={toggleDarkMode}
								className="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md text-background-dark dark:text-background-light bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
								title={
									darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
								}
							>
								<span className="material-symbols-rounded text-xl">
									{darkMode ? "light_mode" : "dark_mode"}
								</span>
							</button>
							<button
								onClick={handleLogout}
								className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 border border-transparent rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
								title="Cerrar Sesión"
							>
								<span className="material-symbols-rounded text-xl">logout</span>
								<span className="hidden md:inline text-sm">Cerrar Sesión</span>
							</button>
						</div>
					</div>
				</div>
			</header>
		</>
	);
};

export default Header;
