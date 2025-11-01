// AUTH SERVICE EXAMPLE - Frontend con JWT Cookies + CSRF

class AuthService {
	private csrfToken: string | null = null;
	private baseURL = "http://localhost:4000/api";

	// Login - establecer cookies de autenticación
	async login(username: string, password: string) {
		try {
			const response = await fetch(`${this.baseURL}/auth/login`, {
				method: "POST",
				credentials: "include", // IMPORTANTE: incluir cookies
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			});

			if (!response.ok) {
				throw new Error("Login failed");
			}

			const data = await response.json();

			// Guardar CSRF token para usar en requests de modificación
			this.csrfToken = data.csrfToken;

			return data;
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		}
	}

	// Logout - limpiar cookies
	async logout() {
		try {
			const response = await fetch(`${this.baseURL}/auth/logout`, {
				method: "POST",
				credentials: "include",
			});

			if (response.ok) {
				this.csrfToken = null;
			}

			return response.ok;
		} catch (error) {
			console.error("Logout error:", error);
			return false;
		}
	}

	// Obtener nuevo CSRF token
	async getCSRFToken() {
		try {
			const response = await fetch(`${this.baseURL}/auth/csrf-token`, {
				credentials: "include",
			});

			if (response.ok) {
				const data = await response.json();
				this.csrfToken = data.csrfToken;
				return data.csrfToken;
			}
		} catch (error) {
			console.error("CSRF token error:", error);
		}
		return null;
	}

	// Request genérico para operaciones de lectura (solo JWT)
	async get(endpoint: string) {
		try {
			const response = await fetch(`${this.baseURL}${endpoint}`, {
				method: "GET",
				credentials: "include", // Cookies automáticas
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				if (response.status === 401) {
					// Token expirado, redirigir a login
					this.handleAuthError();
					return null;
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error("GET request error:", error);
			throw error;
		}
	}

	// Request genérico para operaciones de modificación (JWT + CSRF)
	async requestWithCSRF(
		endpoint: string,
		method: "POST" | "PUT" | "DELETE",
		data?: any
	) {
		try {
			// Asegurar que tenemos CSRF token
			if (!this.csrfToken) {
				await this.getCSRFToken();
			}

			const response = await fetch(`${this.baseURL}${endpoint}`, {
				method,
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					"X-CSRF-Token": this.csrfToken!, // Header CSRF requerido
				},
				body: data ? JSON.stringify(data) : undefined,
			});

			if (!response.ok) {
				if (response.status === 401) {
					this.handleAuthError();
					return null;
				}
				if (response.status === 403) {
					// Posible CSRF token inválido, obtener nuevo
					await this.getCSRFToken();
					throw new Error("CSRF token expired, please retry");
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error(`${method} request error:`, error);
			throw error;
		}
	}

	// Shortcuts para métodos comunes
	async post(endpoint: string, data: any) {
		return this.requestWithCSRF(endpoint, "POST", data);
	}

	async put(endpoint: string, data: any) {
		return this.requestWithCSRF(endpoint, "PUT", data);
	}

	async delete(endpoint: string) {
		return this.requestWithCSRF(endpoint, "DELETE");
	}

	// Verificar si el usuario está autenticado
	async checkAuth() {
		try {
			const response = await this.get("/auth/me");
			return response !== null;
		} catch {
			return false;
		}
	}

	// Manejar errores de autenticación
	private handleAuthError() {
		this.csrfToken = null;
		// Redirigir a login o mostrar modal
		console.log("Authentication required");
		// window.location.href = '/login';
	}
}

// EJEMPLO DE USO EN COMPONENTES

// Instancia del servicio
const authService = new AuthService();

// Componente de Login
const handleLogin = async (username: string, password: string) => {
	try {
		const result = await authService.login(username, password);
		console.log("Login successful:", result.user);
		// Redirigir al dashboard
	} catch (error) {
		console.error("Login failed:", error);
		// Mostrar error al usuario
	}
};

// Componente de Turnos - Listar (solo lectura)
const loadTurnos = async () => {
	try {
		const turnos = await authService.get("/turnos");
		setTurnos(turnos);
	} catch (error) {
		console.error("Error loading turnos:", error);
	}
};

// Componente de Turnos - Crear (modificación con CSRF)
const createTurno = async (turnoData: any) => {
	try {
		const newTurno = await authService.post("/turnos", turnoData);
		console.log("Turno created:", newTurno);
		// Actualizar lista
		await loadTurnos();
	} catch (error) {
		if (error.message.includes("CSRF token expired")) {
			// Reintentar automáticamente
			try {
				const newTurno = await authService.post("/turnos", turnoData);
				console.log("Turno created (retry):", newTurno);
			} catch (retryError) {
				console.error("Retry failed:", retryError);
			}
		} else {
			console.error("Error creating turno:", error);
		}
	}
};

// Interceptor para React Query o SWR
const fetchWithAuth = async (url: string, options?: RequestInit) => {
	const fullUrl = `http://localhost:4000/api${url}`;

	const config: RequestInit = {
		...options,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
	};

	// Agregar CSRF token para métodos de modificación
	if (["POST", "PUT", "DELETE", "PATCH"].includes(config.method || "GET")) {
		if (!authService.csrfToken) {
			await authService.getCSRFToken();
		}
		(config.headers as Record<string, string>)["X-CSRF-Token"] =
			authService.csrfToken!;
	}

	const response = await fetch(fullUrl, config);

	if (!response.ok) {
		if (response.status === 401) {
			// Manejar logout automático
			authService.handleAuthError();
		}
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
};

export { AuthService, authService, fetchWithAuth };
