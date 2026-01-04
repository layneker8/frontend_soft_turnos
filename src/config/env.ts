// src/config/env.ts
import type { EnvConfig } from "@/@types";

export const env: EnvConfig = {
	NAME_APP: import.meta.env.VITE_NAME_APP || "My App",
	PUBLIC_URL: import.meta.env.VITE_PUBLIC_URL || "",
	API_URL: import.meta.env.VITE_API_URL,
	SOCKET_URL: import.meta.env.VITE_SOCKET_URL || "http://localhost:3000",
	AUTH_TOKEN: import.meta.env.VITE_AUTH_TOKEN,
	isDevelopment: import.meta.env.DEV,
	isProduction: import.meta.env.PROD,
	API_CONEURO_RESULTADOS: import.meta.env.VITE_API_CONEURO_RESULTADOS,
	API_CONEURO_KEY: import.meta.env.VITE_API_CONEURO_KEY || "",
};

// Validación opcional de variables requeridas
if (!env.API_URL) {
	throw new Error("VITE_API_URL es requerida");
}

if (!env.API_CONEURO_RESULTADOS) {
	throw new Error("API_CONEURO_RESULTADOS es requerida");
}

if (!env.API_CONEURO_KEY) {
	throw new Error("API_CONEURO_KEY es requerida");
}

export default env;
