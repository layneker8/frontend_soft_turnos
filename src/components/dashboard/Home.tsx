import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
// import { useAppStore } from '@/stores/appStore';
import { useToastStore } from "@/stores/toastStore";
import { useDarkMode } from "@/hooks/useDarkMode";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import Footer from "./Footer";
import DashboardMain from "./DashboardMain";
import ViewTurnos from "../turnos/viewTurnos";
import ViewAsignacionTurnos from "../turnos/viewAsignacionTurnos";
import NotFound404 from "../common/NotFound404";
import ViewUsers from "../users/viewUsers";
import ViewCubiculo from "../cubiculos/ViewCubiculo";
import ViewSedes from "../sedes/ViewSedes";
import ViewPrioridades from "../prioridades/ViewPrioridades";
import ViewRoles from "../roles/ViewRoles";

const Home: React.FC = () => {
	const navigate = useNavigate();

	// Zustand stores
	const { user, logout } = useAuthStore();
	// const { turnos } = useAppStore();
	const { addToast } = useToastStore();
	// Custom hooks
	const { darkMode, toggleDarkMode } = useDarkMode();

	const handleLogout = async () => {
		try {
			await logout();
			addToast({
				type: "info",
				title: "Sesión cerrada",
				message: "Has cerrado sesión correctamente",
			});
			navigate("/login", { replace: true });
		} catch (error) {
			console.error("Error al cerrar sesión:", error);
			addToast({
				type: "error",
				title: "Error",
				message: "Hubo un problema al cerrar sesión",
			});
		}
	};

	return (
		<div className="grid grid-cols-12 min-h-screen overflow-hidden relative ease-in bg-background-light dark:bg-background-dark font-display">
			{/* Sidebar */}
			<Sidebar />
			<div className="flex flex-col h-screen col-span-12 sm:col-span-10 md:col-span-9 xl:col-span-10">
				{/* Header */}
				<Header
					user={user}
					darkMode={darkMode}
					toggleDarkMode={toggleDarkMode}
					handleLogout={handleLogout}
				/>
				{/* Main Content con rutas anidadas */}
				<MainContent>
					<Routes>
						{/* Ruta por defecto del dashboard */}
						<Route index element={<DashboardMain />} />
						{/* Rutas específicas */}
						<Route path="turnos" element={<ViewTurnos />} />
						<Route
							path="asignacion-turnos"
							element={<ViewAsignacionTurnos />}
						/>
						{/* Puedes agregar más rutas aquí */}
						<Route path="usuarios" element={<ViewUsers />} />
						<Route
							path="servicios"
							element={<div>Vista de Servicios - Próximamente</div>}
						/>
						<Route
							path="pacientes"
							element={<div>Vista de Pacientes - Próximamente</div>}
						/>
						<Route
							path="configuracion"
							element={<div>Vista de Configuración - Próximamente</div>}
						/>
						<Route path="cubiculos" element={<ViewCubiculo />} />
						<Route path="sedes" element={<ViewSedes />} />
						<Route path="roles" element={<ViewRoles />} />
						<Route path="prioridades" element={<ViewPrioridades />} />

						{/* Ruta catch-all para páginas no encontradas - DEBE IR AL FINAL */}
						<Route path="*" element={<NotFound404 />} />
					</Routes>
				</MainContent>

				{/* Footer */}
				<Footer />
			</div>
		</div>
	);
};

export default Home;
