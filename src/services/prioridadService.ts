import { apiService } from "./apiService";
import { buildResponseError } from "./serviceUtils";
import type {
	FullPrioridad,
	CreatePrioridadData,
	UpdatePrioridadData,
} from "@/@types/prioridades";

interface ApiResponse<T> {
	success: boolean;
	data: T;
	error?: string;
}

export class PrioridadService {
	async getAll(): Promise<FullPrioridad[]> {
		try {
			const res = (await apiService.get("/api/prioridades")) as ApiResponse<
				FullPrioridad[]
			>;
			return res.data || [];
		} catch (err) {
			console.error("Error obteniendo prioridades:", err);
			throw err;
		}
	}

	async getById(id: number): Promise<FullPrioridad> {
		try {
			const res = (await apiService.get(
				`/api/prioridades/${id}`
			)) as ApiResponse<FullPrioridad>;
			return res.data;
		} catch (err) {
			console.error(`Error obteniendo prioridad ${id}:`, err);
			throw err;
		}
	}

	async create(data: CreatePrioridadData): Promise<FullPrioridad> {
		try {
			const res = (await apiService.post(
				"/api/prioridades",
				data
			)) as ApiResponse<FullPrioridad>;
			if ("success" in res && res.success === false) {
				throw buildResponseError(res, "Error creando prioridad");
			}
			return res.data;
		} catch (err) {
			console.error("Error creando prioridad:", err);
			throw err;
		}
	}

	async update(id: number, data: UpdatePrioridadData): Promise<FullPrioridad> {
		try {
			const res = (await apiService.put(
				`/api/prioridades/${id}`,
				data
			)) as ApiResponse<FullPrioridad>;
			if ("success" in res && res.success === false) {
				throw buildResponseError(res, "Error actualizando prioridad");
			}
			return res.data;
		} catch (err) {
			console.error(`Error actualizando prioridad ${id}:`, err);
			throw err;
		}
	}

	async delete(id: number): Promise<void> {
		try {
			await apiService.delete(`/api/prioridades/${id}`);
		} catch (err) {
			console.error(`Error eliminando prioridad ${id}:`, err);
			throw err;
		}
	}
}

export const prioridadService = new PrioridadService();
