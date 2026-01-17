// Funciones API específicas del dominio usando el servicio base
import { apiService } from "./apiService";
import { env } from "@/config/env";
import type { User, LoginCredentials, AuthResponse } from "@/@types";

// === AUTENTICACIÓN ===

export const login = async (
	credentials: LoginCredentials
): Promise<AuthResponse> => {
	try {
		const response = await fetch(`${apiService["baseURL"]}/api/auth/login`, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(credentials),
		});

		const status = response.status;
		const data = await response.json();
		// Guardar CSRF token en el servicio para futuras peticiones
		if (data.success && data.csrfToken) {
			apiService["csrfToken"] = data.csrfToken;
		}
		return {
			status,
			...data,
		};
	} catch (error) {
		console.error("Error en login:", error);
		throw error;
	}
};

export const logout = async (): Promise<void> => {
	try {
		await fetch(`${apiService["baseURL"]}/api/auth/logout`, {
			method: "POST",
			credentials: "include",
		});

		// Limpiar token CSRF
		apiService.clearCSRFToken();
	} catch (error) {
		console.error("Error en logout:", error);
		// No throw error para permitir logout local
	}
};

export const getCurrentUser = async (): Promise<User> => {
	return apiService.get("/api/auth/me");
};

export const setPasswordForUnverifiedUser = async (
	username: string,
	newPassword: string
): Promise<{ success: boolean; message: string }> => {
	try {
		const response = (await apiService.post(`/api/auth/set-initial-password`, {
			username,
			newPassword,
		})) as { success: boolean; message: string };

		if (!response.success) {
			throw new Error(response.message || "Error al establecer la contraseña");
		}

		return {
			success: true,
			message: response.message || "Contraseña establecida correctamente",
		};
	} catch (error) {
		console.error("Error estableciendo contraseña:", error);
		throw error;
	}
};

// === TURNOS ===
export const getApiCone = async (endpoint: string): Promise<unknown> => {
	try {
		const response = await fetch(`${env.API_CONEURO_RESULTADOS}${endpoint}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"X-Key-App": env.API_CONEURO_KEY,
			},
		});
		const value = await response.json();
		if (!response.ok) {
			throw new Error(value.msg || "Error desconocido");
		}
		return value;
	} catch (error) {
		console.error(`Error en GET ${endpoint}:`, error);
		throw error;
	}
};

export const postApiCone = async (
	endpoint: string,
	data: {
		servicio: string;
		estado: string;
		documento_especialista: string;
		id_paciente: number;
		fecha_cita: string;
		id_cita: number;
		cantidad_citas: number;
		old_estado?: string;
	}
): Promise<unknown> => {
	try {
		const response = await fetch(`${env.API_CONEURO_RESULTADOS}${endpoint}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Key-App": env.API_CONEURO_KEY,
			},
			body: data ? JSON.stringify(data) : undefined,
		});
		const value = await response.json();
		if (!response.ok) {
			throw new Error(value.msg || "Error desconocido");
		}
		return value;
	} catch (error) {
		console.error(`Error en POST ${endpoint}:`, error);
		throw error;
	}
};
