// frontend/src/@types/index.ts

/* Tipos para configuración de entorno */
export interface EnvConfig {
	NAME_APP: string;
	API_URL: string;
	SOCKET_URL: string;
	AUTH_TOKEN?: string;
	isDevelopment: boolean;
	isProduction: boolean;
}

/* Tipos para autenticación */
export interface User {
	id: string;
	username: string;
	nombre: string;
	identificacion: string;
	email: string;
	area?: string;
	id_rol: number;
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

/* Tipos para turnos */
export interface Turno {
	id: string;
	cliente: string;
	servicio: string;
	fecha: string;
	hora: string;
	estado: "pendiente" | "en-progreso" | "completado" | "cancelado";
	observaciones?: string;
	usuarioId?: string;
	createdAt?: string;
	updatedAt?: string;
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

// interface ImportMeta {
//     readonly env: ImportMetaEnv;
// }

// Tipos para eventos de Socket.IO
export interface SocketEvents {
	"turno:actualizado": (turno: Turno) => void;
	"estado:inicial": (data: { turnos: Turno[] }) => void;
	"solicitar:actualizacion": () => void;
}
