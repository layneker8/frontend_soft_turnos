import type { FullSede } from "@/@types/sedes";
import { apiService } from "./apiService";
import { buildResponseError } from "./serviceUtils";
// import type { Sede } from "@/@types";
import type {
	FullCubiculo,
	CreateCubiculoData,
	UpdateCubiculoData,
	AsignacionesCubiculo,
	dataAsignacion,
} from "@/@types/cubiculos";

interface ApiResponse<T> {
	success: boolean;
	total?: number;
	data: T;
	error?: string;
}

export class CubiculoService {
	async getAll(): Promise<FullCubiculo[]> {
		try {
			const response = (await apiService.get("/api/cubiculos")) as ApiResponse<
				FullCubiculo[]
			>;
			return response.data || [];
		} catch (error) {
			console.error("Error obteniendo cubículos:", error);
			throw error;
		}
	}

	async getById(id: number): Promise<FullCubiculo> {
		try {
			const response = (await apiService.get(
				`/api/cubiculos/${id}`
			)) as ApiResponse<FullCubiculo>;

			return response.data;
		} catch (error) {
			console.error(`Error obteniendo cubículo ${id}:`, error);
			throw error;
		}
	}

	async create(data: CreateCubiculoData): Promise<FullCubiculo> {
		try {
			const response = (await apiService.post(
				"/api/cubiculos",
				data
			)) as ApiResponse<FullCubiculo>;
			if ("success" in response && response.success === false) {
				throw buildResponseError(response, "Error creando cubículo");
			}
			return response.data;
		} catch (error) {
			console.error("Error creando cubículo:", error);
			throw error;
		}
	}

	async update(id: number, data: UpdateCubiculoData): Promise<FullCubiculo> {
		try {
			const response = (await apiService.put(
				`/api/cubiculos/${id}`,
				data
			)) as ApiResponse<FullCubiculo>;
			if ("success" in response && response.success === false) {
				throw buildResponseError(response, "Error actualizando cubículo");
			}
			return response.data;
		} catch (error) {
			console.error(`Error actualizando cubículo ${id}:`, error);
			throw error;
		}
	}

	async delete(id: number): Promise<void> {
		try {
			await apiService.delete(`/api/cubiculos/${id}`);
		} catch (error) {
			console.error(`Error eliminando cubículo ${id}:`, error);
			throw error;
		}
	}

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
	 * Obtener cubículos de una sede específica
	 */
	async getCubiculosBySede(sedeId: number): Promise<FullCubiculo[]> {
		try {
			const response = (await apiService.get(
				`/api/cubiculos/bysede/${sedeId}`
			)) as ApiResponse<FullCubiculo[]>;
			return response.data || [];
		} catch (error) {
			console.error(`Error obteniendo cubículos de sede ${sedeId}:`, error);
			throw error;
		}
	}

	async getAllAsignaciones(): Promise<AsignacionesCubiculo[]> {
		try {
			const response = (await apiService.get(
				"/api/cubiculos/assignments"
			)) as ApiResponse<AsignacionesCubiculo[]>;
			return response.data || [];
		} catch (error) {
			console.error("Error obteniendo asignaciones de cubículos:", error);
			throw error;
		}
	}

	async getAsignacionById(id: number): Promise<AsignacionesCubiculo | null> {
		try {
			const response = (await apiService.get(
				`/api/cubiculos/assignments/${id}`
			)) as ApiResponse<AsignacionesCubiculo>;
			return response.data || null;
		} catch (error) {
			console.error(`Error obteniendo asignación ${id}:`, error);
			throw error;
		}
	}

	async createAsignacion(data: dataAsignacion): Promise<AsignacionesCubiculo> {
		try {
			const response = (await apiService.post(
				"/api/cubiculos/assignments",
				data
			)) as ApiResponse<AsignacionesCubiculo>;
			if ("success" in response && response.success === false) {
				throw buildResponseError(response, "Error creando cubículo");
			}
			return response.data;
		} catch (error) {
			console.error("Error creando cubículo:", error);
			throw error;
		}
	}

	async updateAsignacion(
		id: number,
		data: dataAsignacion
	): Promise<AsignacionesCubiculo> {
		try {
			const response = (await apiService.put(
				`/api/cubiculos/assignments/${id}`,
				data
			)) as ApiResponse<AsignacionesCubiculo>;
			if ("success" in response && response.success === false) {
				throw buildResponseError(response, "Error actualizando cubículo");
			}
			return response.data;
		} catch (error) {
			console.error(`Error actualizando cubículo ${id}:`, error);
			throw error;
		}
	}

	async deleteAsignacion(id: number): Promise<void> {
		try {
			await apiService.delete(`/api/cubiculos/assignments/${id}`);
		} catch (error) {
			console.error(`Error eliminando cubículo ${id}:`, error);
			throw error;
		}
	}

	async toggleEstadoAsignacion(id: number): Promise<AsignacionesCubiculo> {
		try {
			const response = (await apiService.patch(
				`/api/cubiculos/assignments/${id}/toggle`
			)) as ApiResponse<AsignacionesCubiculo>;
			if ("success" in response && response.success === false) {
				throw buildResponseError(
					response,
					"Error actualizando estado de asignación"
				);
			}
			return response.data;
		} catch (error) {
			console.error(`Error actualizando estado de asignación ${id}:`, error);
			throw error;
		}
	}
}

export const cubiculoService = new CubiculoService();
