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

export const getTurnos = async () => {
	return apiService.get("/api/turnos");
};

export const createTurno = async (turnoData: unknown) => {
	return apiService.post("/api/turnos", turnoData);
};

export const updateTurno = async (id: string, turnoData: unknown) => {
	return apiService.put(`/api/turnos/${id}`, turnoData);
};

export const deleteTurno = async (id: string) => {
	return apiService.delete(`/api/turnos/${id}`);
};

// === USUARIOS ===

export const getUsers = async () => {
	return apiService.get("/api/users");
};

export const createUser = async (userData: unknown) => {
	return apiService.post("/api/users", userData);
};

export const updateUser = async (id: string, userData: unknown) => {
	return apiService.put(`/api/users/${id}`, userData);
};

export const deleteUser = async (id: string) => {
	return apiService.delete(`/api/users/${id}`);
};

// === CLIENTES ===

export const getClientes = async () => {
	return apiService.get("/api/clientes");
};

export const createCliente = async (clienteData: unknown) => {
	return apiService.post("/api/clientes", clienteData);
};

export const updateCliente = async (id: string, clienteData: unknown) => {
	return apiService.put(`/api/clientes/${id}`, clienteData);
};

export const deleteCliente = async (id: string) => {
	return apiService.delete(`/api/clientes/${id}`);
};

// === SEDES ===

export const getSedes = async () => {
	return apiService.get("/api/sedes");
};

export const createSede = async (sedeData: unknown) => {
	return apiService.post("/api/sedes", sedeData);
};

export const updateSede = async (id: string, sedeData: unknown) => {
	return apiService.put(`/api/sedes/${id}`, sedeData);
};

export const deleteSede = async (id: string) => {
	return apiService.delete(`/api/sedes/${id}`);
};

// === SERVICIOS ===

export const getServicios = async () => {
	return apiService.get("/api/servicios");
};

export const createServicio = async (servicioData: unknown) => {
	return apiService.post("/api/servicios", servicioData);
};

export const updateServicio = async (id: string, servicioData: unknown) => {
	return apiService.put(`/api/servicios/${id}`, servicioData);
};

export const deleteServicio = async (id: string) => {
	return apiService.delete(`/api/servicios/${id}`);
};

// === CUBÍCULOS ===

export const getCubiculos = async () => {
	return apiService.get("/api/cubiculos");
};

export const createCubiculo = async (cubiculoData: unknown) => {
	return apiService.post("/api/cubiculos", cubiculoData);
};

export const updateCubiculo = async (id: string, cubiculoData: unknown) => {
	return apiService.put(`/api/cubiculos/${id}`, cubiculoData);
};

export const deleteCubiculo = async (id: string) => {
	return apiService.delete(`/api/cubiculos/${id}`);
};

// Función helper para verificar autenticación
export const checkAuthStatus = async (): Promise<boolean> => {
	return apiService.checkAuth();
};
