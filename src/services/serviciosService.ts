import { apiService } from "./apiService";
import { buildResponseError } from "./serviceUtils";
import type {
	FullServicios,
	CreateServiciosData,
	UpdateServiciosData,
} from "@/@types/servicios";

interface ApiResponse<T> {
	success: boolean;
	data: T;
	error?: string;
}

export class ServiciosService {
	async getAll(): Promise<FullServicios[]> {
		try {
			const res = (await apiService.get("/api/servicios")) as ApiResponse<
				FullServicios[]
			>;
			return res.data || [];
		} catch (err) {
			console.error("Error obteniendo servicios:", err);
			throw err;
		}
	}

	async getById(id: number): Promise<FullServicios> {
		try {
			const res = (await apiService.get(
				`/api/servicios/${id}`
			)) as ApiResponse<FullServicios>;
			return res.data;
		} catch (err) {
			console.error(`Error obteniendo servicio ${id}:`, err);
			throw err;
		}
	}

	async create(data: CreateServiciosData): Promise<FullServicios> {
		try {
			const res = (await apiService.post(
				"/api/servicios",
				data
			)) as ApiResponse<FullServicios>;
			if ("success" in res && res.success === false) {
				throw buildResponseError(res, "Error creando servicios");
			}
			return res.data;
		} catch (err) {
			console.error("Error creando servicios:", err);
			throw err;
		}
	}

	async update(id: number, data: UpdateServiciosData): Promise<FullServicios> {
		try {
			const res = (await apiService.put(
				`/api/servicios/${id}`,
				data
			)) as ApiResponse<FullServicios>;
			if ("success" in res && res.success === false) {
				throw buildResponseError(res, "Error actualizando servicios");
			}
			return res.data;
		} catch (err) {
			console.error(`Error actualizando servicios ${id}:`, err);
			throw err;
		}
	}

	async delete(id: number): Promise<void> {
		try {
			await apiService.delete(`/api/servicios/${id}`);
		} catch (err) {
			console.error(`Error eliminando el servicio ${id}:`, err);
			throw err;
		}
	}
}

export const serviciosService = new ServiciosService();
