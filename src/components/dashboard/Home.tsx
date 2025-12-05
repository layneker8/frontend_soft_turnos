import React, { Suspense } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useAppStore } from "@/stores/appStore";
import { useToastStore } from "@/stores/toastStore";
import { useDarkMode } from "@/hooks/useDarkMode";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import Footer from "./Footer";
import DashboardMain from "./DashboardMain";
import ViewTurnos from "../turnos/ViewTurnos";
import NotFound404 from "../common/NotFound404";
import ViewUsers from "../users/viewUsers";
import ViewCubiculo from "../cubiculos/ViewCubiculo";
import ViewSedes from "../sedes/ViewSedes";
import ViewPrioridades from "../prioridades/ViewPrioridades";
import ViewRoles from "../roles/ViewRoles";
import Loading from "../common/Loading";
import ViewServicios from "@/components/servicios/ViewServicios";
import ViewAsignar from "../asignacionCubiculos/ViewAsignar";
import ViewAsignacionServicios from "../asignacionServicios/ViewAsignacionServicios";

const Home: React.FC = () => {
	const navigate = useNavigate();

	// Zustand stores
	const { user, logout } = useAuthStore();
	const { sidebarOpen } = useAppStore();
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
		<div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
			{/* Sidebar */}
			<Sidebar />
			{/* Main container - En móvil ocupa 100%, en desktop se ajusta al sidebar */}
			<div
				className={`flex flex-col min-h-screen transition-all duration-300 ${
					sidebarOpen ? "md:ml-64" : "md:ml-20"
				}`}
			>
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

						{/* Puedes agregar más rutas aquí */}
						<Route
							path="usuarios"
							element={
								<Suspense fallback={<Loading />}>
									<ViewUsers />
								</Suspense>
							}
						/>
						<Route
							path="servicios"
							element={
								<Suspense fallback={<Loading />}>
									<ViewServicios />
								</Suspense>
							}
						/>
						<Route
							path="pacientes"
							element={<div>Vista de Pacientes - Próximamente</div>}
						/>
						<Route path="cubiculos" element={<ViewCubiculo />} />
						<Route path="sedes" element={<ViewSedes />} />
						<Route path="roles" element={<ViewRoles />} />
						<Route path="prioridades" element={<ViewPrioridades />} />
						<Route path="asignacion-cubiculos" element={<ViewAsignar />} />
						<Route
							path="asignacion-servicios"
							element={
								<Suspense fallback={<Loading />}>
									<ViewAsignacionServicios />
								</Suspense>
							}
						/>

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
