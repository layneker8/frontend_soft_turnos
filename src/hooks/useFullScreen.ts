import { useEffect } from "react";

export const useFullscreen = () => {
	useEffect(() => {
		const requestFullscreen = async () => {
			try {
				if (!document.fullscreenElement) {
					await document.documentElement.requestFullscreen();
				}
			} catch (err) {
				console.log("No se pudo activar pantalla completa:", err);
			}
		};

		// Solicitar pantalla completa al cargar
		requestFullscreen();

		// Si presionan F11 o salen de pantalla completa, volver a entrar
		const handleFullscreenChange = () => {
			if (!document.fullscreenElement) {
				requestFullscreen();
			}
		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);

		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
		};
	}, []);
};
