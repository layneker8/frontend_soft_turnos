import { apiService } from "./apiService";
import { buildResponseError } from "./serviceUtils";
import type {
	AsignacionServicio,
	CreateAsignacionServicioData,
} from "@/@types/asignacionServicios";

interface ApiResponse<T> {
	success: boolean;
	total?: number;
	data: T;
	error?: string;
}

export class AsignacionServicioService {
	async getAll(): Promise<AsignacionServicio[]> {
		try {
			const response = (await apiService.get(
				"/api/assignment-services"
			)) as ApiResponse<AsignacionServicio[]>;
			return response.data || [];
		} catch (error) {
			console.error("Error obteniendo asignaciones de servicios:", error);
			throw error;
		}
	}

	async getById(id: number): Promise<AsignacionServicio> {
		try {
			const response = (await apiService.get(
				`/api/assignment-services/${id}`
			)) as ApiResponse<AsignacionServicio>;
			return response.data;
		} catch (error) {
			console.error(`Error obteniendo asignación de servicio ${id}:`, error);
			throw error;
		}
	}

	async create(
		data: CreateAsignacionServicioData
	): Promise<AsignacionServicio> {
		try {
			const response = (await apiService.post(
				"/api/assignment-services",
				data
			)) as ApiResponse<AsignacionServicio>;
			if ("success" in response && response.success === false) {
				throw buildResponseError(
					response,
					"Error creando asignación de servicios"
				);
			}
			return response.data;
		} catch (error) {
			console.error("Error creando asignación de servicios:", error);
			throw error;
		}
	}

	async delete(id: number): Promise<void> {
		try {
			await apiService.delete(`/api/assignment-services/${id}`);
		} catch (error) {
			console.error(`Error eliminando asignación de servicios ${id}:`, error);
			throw error;
		}
	}

	async toggleEstado(id: number): Promise<AsignacionServicio> {
		try {
			const response = (await apiService.patch(
				`/api/assignment-services/${id}/toggle`
			)) as ApiResponse<AsignacionServicio>;
			if ("success" in response && response.success === false) {
				throw buildResponseError(
					response,
					"Error actualizando estado de asignación"
				);
			}
			return response.data;
		} catch (error) {
			console.error(
				`Error toggling estado de asignación de servicios ${id}:`,
				error
			);
			throw error;
		}
	}
}

export const asignacionServicioService = new AsignacionServicioService();
