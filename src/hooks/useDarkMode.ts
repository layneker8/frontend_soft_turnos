import { useEffect } from "react";
import { useAppStore } from "@/stores/appStore";

export const useDarkMode = () => {
	const { darkMode, toggleDarkMode } = useAppStore();

	useEffect(() => {
		// Aplicar el tema al documento
		if (darkMode) {
			document.documentElement.setAttribute("data-theme", "dark");
		} else {
			document.documentElement.removeAttribute("data-theme");
		}
	}, [darkMode]);

	return { darkMode, toggleDarkMode };
};
