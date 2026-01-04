// frontend/src/@types/index.ts

/* Tipos para configuración de entorno */
export interface EnvConfig {
	NAME_APP: string;
	PUBLIC_URL: string;
	API_URL: string;
	SOCKET_URL: string;
	AUTH_TOKEN?: string;
	isDevelopment: boolean;
	isProduction: boolean;
	API_CONEURO_RESULTADOS: string;
	API_CONEURO_KEY: string;
}

export * from "./miPuesto";
export * from "./cubiculos";
export * from "./turnos";
/* Tipos para autenticación */
export interface User {
	id: number;
	username: string;
	nombre: string;
	identificacion: string;
	email: string;
	area?: string;
	id_rol: number;
	rol?: string;
	id_sede: number;
	sede?: string;
}

export interface LoginCredentials {
	username: string;
	password: string;
}

export interface AuthResponse {
	status?: number;
	success: boolean;
	user?: User;
	message?: string;
	csrfToken?: string;
	error?: string;
}

/* Tipos para notificaciones */
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
	id: string;
	type: ToastType;
	title: string;
	message?: string;
	duration?: number;
}
