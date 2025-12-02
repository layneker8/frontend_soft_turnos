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

// === TURNOS ===
export const getFindClient = async (
	identification: string
): Promise<unknown> => {
	try {
		const response = await fetch(
			`${env.API_CONEURO_RESULTADOS}/pacientes/${identification}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-Key-App": env.API_CONEURO_KEY,
				},
			}
		);
		const value = await response.json();
		if (!response.ok) {
			throw new Error(value.msg || "Error buscando paciente");
		}
		return value;
	} catch (error) {
		console.error(`Error en GET /pacientes/${identification}:`, error);
		throw error;
	}
};
