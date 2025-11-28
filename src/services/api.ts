// Funciones API específicas del dominio usando el servicio base
import { apiService } from "./apiService";
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

// === TURNOS ===

// export const getTurnos = async () => {
// 	return apiService.get("/api/turnos");
// };

// export const createTurno = async (turnoData: unknown) => {
// 	return apiService.post("/api/turnos", turnoData);
// };

// export const updateTurno = async (id: string, turnoData: unknown) => {
// 	return apiService.put(`/api/turnos/${id}`, turnoData);
// };

// export const deleteTurno = async (id: string) => {
// 	return apiService.delete(`/api/turnos/${id}`);
// };
