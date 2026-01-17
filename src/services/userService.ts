import type { FullSede } from "@/@types/sedes";
import { apiService } from "./apiService";
import { buildResponseError } from "./serviceUtils";
import type { FullUser, CreateUserData, UpdateUserData } from "@/@types/users";
import type { FullRoles } from "@/@types/roles";

interface ApiResponse<T> {
	success: boolean;
	total?: number;
	data: T;
	error?: string;
}

interface ApiResponseRoles<T> {
	success: boolean;
	message?: string;
	count?: number;
	data: T;
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
			return response.data || [];
		} catch (error) {
			console.error("Error obteniendo usuarios:", error);
			throw error;
		}
	}

	/**
	 * Obtener todos los usuarios por sede
	 */
	async getUsersBySede(id_sede: number): Promise<FullUser[]> {
		try {
			const response = (await apiService.get(
				`/api/users/sede/${id_sede}`
			)) as ApiResponse<FullUser[]>;
			return response.data || [];
		} catch (error) {
			console.error(`Error obteniendo usuarios de la sede ${id_sede}:`, error);
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
			return response.data;
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
			if ("success" in response && response.success === false) {
				throw buildResponseError(response, "Error creando usuario");
			}
			return response.data;
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
			if ("success" in response && response.success === false) {
				throw buildResponseError(response, "Error actualizando usuario");
			}
			return response.data;
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
	async getAllSedes(): Promise<FullSede[]> {
		try {
			const response = (await apiService.get(
				"/api/sedes/available"
			)) as ApiResponse<FullSede[]>;
			return response.data || [];
		} catch (error) {
			console.error("Error obteniendo sedes:", error);
			throw error;
		}
	}

	/**
	 * Obtener todos los roles disponibles
	 */
	async getAllRoles(): Promise<FullRoles[]> {
		try {
			const response = (await apiService.get("/api/roles")) as ApiResponseRoles<
				FullRoles[]
			>;
			return response.data || [];
		} catch (error) {
			console.error("Error obteniendo roles:", error);
			throw error;
		}
	}

	/**
	 * Enviar correo de restablecimiento de contraseña al usuario
	 */
	async sendEmailToUser(
		id: number,
		mode: "reset_password" | "verify_account" = "reset_password"
	): Promise<{ ok: boolean; message?: string }> {
		try {
			const response = (await apiService.post(`/api/users/send-email`, {
				id_usuario: id,
				mode,
			})) as { success: boolean; message: string };

			return {
				ok: true,
				message: response.message,
			};
		} catch (error) {
			console.error(`Error enviando correo al usuario ${id}:`, error);
			return { ok: false, message: "Error enviando correo" };
		}
	}
}

// Instancia singleton del servicio
export const userService = new UserService();
