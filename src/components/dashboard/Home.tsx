import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
// import { useAppStore } from '@/stores/appStore';
import { useToastStore } from "@/stores/toastStore";
import { useDarkMode } from "@/hooks/useDarkMode";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import Footer from "./Footer";

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
				{/* Main Content */}
				<MainContent />
				{/* Footer */}
				<Footer />
			</div>
		</div>
	);
};

export default Home;
