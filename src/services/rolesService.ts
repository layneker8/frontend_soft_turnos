import { apiService } from "./apiService";
import { buildResponseError } from "./serviceUtils";
import type { FullRoles, CreateRolData, UpdateRolData } from "@/@types/roles";

interface ApiResponse<T> {
	success: boolean;
	data: T;
	error?: string;
}

export class RolesService {
	async getAll(): Promise<FullRoles[]> {
		try {
			const res = (await apiService.get("/api/roles")) as ApiResponse<
				FullRoles[]
			>;
			return res.data || [];
		} catch (err) {
			console.error("Error obteniendo roles:", err);
			throw err;
		}
	}

	async getById(id: number): Promise<FullRoles> {
		try {
			const res = (await apiService.get(
				`/api/roles/${id}`
			)) as ApiResponse<FullRoles>;
			return res.data;
		} catch (err) {
			console.error(`Error obteniendo rol ${id}:`, err);
			throw err;
		}
	}

	async create(data: CreateRolData): Promise<FullRoles> {
		try {
			const res = (await apiService.post(
				"/api/roles",
				data
			)) as ApiResponse<FullRoles>;
			if ("success" in res && res.success === false) {
				throw buildResponseError(res, "Error creando rol");
			}
			return res.data;
		} catch (err) {
			console.error("Error creando rol:", err);
			throw err;
		}
	}

	async update(id: number, data: UpdateRolData): Promise<FullRoles> {
		try {
			const res = (await apiService.put(
				`/api/roles/${id}`,
				data
			)) as ApiResponse<FullRoles>;
			if ("success" in res && res.success === false) {
				throw buildResponseError(res, "Error actualizando rol");
			}
			return res.data;
		} catch (err) {
			console.error(`Error actualizando rol ${id}:`, err);
			throw err;
		}
	}

	async delete(id: number): Promise<void> {
		try {
			await apiService.delete(`/api/roles/${id}`);
		} catch (err) {
			console.error(`Error eliminando rol ${id}:`, err);
			throw err;
		}
	}

	async getAllPermissions(): Promise<
		{ id: number; nombre: string; descripcion: string; created_at: string }[]
	> {
		try {
			const res = (await apiService.get("/api/permissions")) as ApiResponse<
				{
					id: number;
					nombre: string;
					descripcion: string;
					created_at: string;
				}[]
			>;
			return res.data || [];
		} catch (err) {
			console.error("Error obteniendo permisos:", err);
			throw err;
		}
	}
}

export const rolesService = new RolesService();
