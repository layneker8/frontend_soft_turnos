import { apiService } from "./apiService";
import type { Sede, Cubiculo, Rol } from "@/@types";
import type { FullUser, CreateUserData, UpdateUserData } from "@/@types/users";

interface ApiResponse<T> {
	success: boolean;
	total?: number;
	users: T;
	error?: string;
}

interface ApiResponseSede<T> {
	success: boolean;
	total?: number;
	sedes: T;
	error?: string;
}

interface ApiResponseRoles<T> {
	success: boolean;
	message?: string;
	count?: number;
	data: T;
	error?: string;
}

interface ApiResponseCubiculo<T> {
	success: boolean;
	total?: number;
	cubiculos: T;
	error?: string;
}

export class UserService {
	/**
	 * Obtener todos los usuarios
	 * Requiere permisos: usuarios.read o usuarios.manage
	 */
	async getAllUsers(): Promise<FullUser[]> {
		try {
			const response = (await apiService.get("/api/users")) as ApiResponse<
				FullUser[]
			>;
			return response.users || [];
		} catch (error) {
			console.error("Error obteniendo usuarios:", error);
			throw error;
		}
	}

	/**
	 * Obtener un usuario específico por ID
	 * Requiere permisos: usuarios.read o usuarios.manage
	 */
	async getUserById(id: number): Promise<FullUser> {
		try {
			const response = (await apiService.get(
				`/api/users/${id}`
			)) as ApiResponse<FullUser>;
			return response.users;
		} catch (error) {
			console.error(`Error obteniendo usuario ${id}:`, error);
			throw error;
		}
	}

	/**
	 * Crear un nuevo usuario
	 * Requiere permisos: usuarios.manage o usuarios.create
	 */
	async createUser(userData: CreateUserData): Promise<FullUser> {
		try {
			const response = (await apiService.post(
				"/api/users/register",
				userData
			)) as ApiResponse<FullUser>;
			if (!response.success) {
				throw new Error(response.error || "Error creando usuario");
			}
			return response.users;
		} catch (error) {
			console.error("Error creando usuario:", error);
			throw error;
		}
	}

	/**
	 * Actualizar un usuario existente
	 * Requiere permisos: usuarios.manage o usuarios.update
	 */
	async updateUser(id: number, userData: UpdateUserData): Promise<FullUser> {
		try {
			const response = (await apiService.put(
				`/api/users/${id}`,
				userData
			)) as ApiResponse<FullUser>;
			return response.users;
		} catch (error) {
			console.error(`Error actualizando usuario ${id}:`, error);
			throw error;
		}
	}

	/**
	 * Eliminar un usuario
	 * Requiere permisos: usuarios.manage o usuarios.delete
	 */
	async deleteUser(id: number): Promise<void> {
		try {
			await apiService.delete(`/api/users/${id}`);
		} catch (error) {
			console.error(`Error eliminando usuario ${id}:`, error);
			throw error;
		}
	}

	/**
	 * Obtener todas las sedes
	 * Requiere permisos: sedes.read o sedes.manage
	 */
	async getAllSedes(): Promise<Sede[]> {
		try {
			const response = (await apiService.get("/api/sedes")) as ApiResponseSede<
				Sede[]
			>;
			return response.sedes || [];
		} catch (error) {
			console.error("Error obteniendo sedes:", error);
			throw error;
		}
	}

	/**
	 * Obtener cubículos de una sede específica
	 * Requiere permisos: sedes.read o sedes.manage
	 */
	async getCubiculosBySede(sedeId: number): Promise<Cubiculo[]> {
		try {
			const response = (await apiService.get(
				`/api/cubiculos/bysede/${sedeId}`
			)) as ApiResponseCubiculo<Cubiculo[]>;

			return response.cubiculos || [];
		} catch (error) {
			console.error(`Error obteniendo cubículos de sede ${sedeId}:`, error);
			throw error;
		}
	}

	/**
	 * Obtener todos los roles disponibles
	 */
	async getAllRoles(): Promise<Rol[]> {
		try {
			const response = (await apiService.get("/api/roles")) as ApiResponseRoles<
				Rol[]
			>;
			return response.data || [];
		} catch (error) {
			console.error("Error obteniendo roles:", error);
			throw error;
		}
	}
}

// Instancia singleton del servicio
export const userService = new UserService();
