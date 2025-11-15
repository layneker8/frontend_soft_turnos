// Servicio API con soporte para cookies JWT + CSRF
import { env } from "@/config/env";

export class ApiService {
	private baseURL: string;
	private csrfToken: string | null = null;

	constructor() {
		this.baseURL = env.API_URL;
	}

	// Obtener token CSRF del servidor
	async getCSRFToken(): Promise<string | null> {
		try {
			const response = await fetch(`${this.baseURL}/api/auth/csrf-token`, {
				credentials: "include",
			});

			if (response.ok) {
				const data = await response.json();
				this.csrfToken = data.csrfToken;
				return data.csrfToken;
			}
		} catch (error) {
			console.error("Error obteniendo CSRF token:", error);
		}
		return null;
	}

	// Request genérico para operaciones de lectura (solo JWT via cookies)
	async get(endpoint: string) {
		try {
			const response = await fetch(`${this.baseURL}${endpoint}`, {
				method: "GET",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				if (response.status === 401) {
					throw new Error("No autorizado");
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error(`Error en GET ${endpoint}:`, error);
			throw error;
		}
	}

	// Request genérico para operaciones de modificación (JWT + CSRF)
	async requestWithCSRF(
		endpoint: string,
		method: "POST" | "PUT" | "DELETE" | "PATCH",
		data?: unknown
	): Promise<unknown> {
		try {
			// Asegurar que tenemos CSRF token
			if (!this.csrfToken) {
				await this.getCSRFToken();
			}

			const response = await fetch(`${this.baseURL}${endpoint}`, {
				method,
				credentials: "include", // Incluir cookies JWT
				headers: {
					"Content-Type": "application/json",
					"X-CSRF-Token": this.csrfToken!, // Header CSRF requerido
				},
				body: data ? JSON.stringify(data) : undefined,
			});

			const value = await response.json();

			if (!response.ok) {
				if (response.status === 401) {
					throw new Error("No autorizado");
				}
				if (response.status === 403) {
					// Posible CSRF token inválido, obtener nuevo
					await this.getCSRFToken();
					// Reintentar una vez
					return this.requestWithCSRF(endpoint, method, data);
				}
				if (response.status === 400) {
					if (value && typeof value === "object" && "details" in value) {
						const errores = value.details
							.map((error: { message: string }) => error.message)
							.join(", ");
						throw new Error(`${value.error}: ${errores}`);
					}
					throw new Error(value.error || "Error en la solicitud");
				}
				throw new Error(`HTTP error!!! status: ${response.status}`);
			}

			return value;
		} catch (error) {
			console.error(`Error en ${method} ${endpoint}:`, error);
			throw error;
		}
	}

	// Métodos de conveniencia
	async post(endpoint: string, data: unknown) {
		return this.requestWithCSRF(endpoint, "POST", data);
	}

	async put(endpoint: string, data: unknown) {
		return this.requestWithCSRF(endpoint, "PUT", data);
	}

	async delete(endpoint: string) {
		return this.requestWithCSRF(endpoint, "DELETE");
	}

	async patch(endpoint: string, data?: unknown) {
		return this.requestWithCSRF(endpoint, "PATCH", data);
	}

	// Verificar si el usuario está autenticado
	async checkAuth() {
		try {
			const response = await this.get("/api/auth/me");
			return response;
		} catch {
			return false;
		}
	}

	// Verificar permisos específicos
	async checkPermission(
		permission: string
	): Promise<{ hasPermission: boolean }> {
		try {
			const response = await this.get(
				`/api/permissions/check?permission=${encodeURIComponent(permission)}`
			);
			return { hasPermission: response.hasPermission || false };
		} catch (error) {
			console.error("Error verificando permiso:", error);
			return { hasPermission: false };
		}
	}

	// Obtener permisos completos del usuario (solo cuando sea necesario)
	async getUserPermissions(roleId: number): Promise<string[]> {
		try {
			const response = await this.get(`/api/permissions/by-role/${roleId}`);
			const permissions = response.data.map(
				(perm: { nombre: string }) => perm.nombre
			);
			return permissions || [];
		} catch (error) {
			console.error("Error obteniendo permisos:", error);
			return [];
		}
	}

	// Limpiar token CSRF (para logout)
	clearCSRFToken() {
		this.csrfToken = null;
	}
}

// Instancia singleton del servicio
export const apiService = new ApiService();
