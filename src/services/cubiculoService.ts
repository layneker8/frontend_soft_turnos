import type { FullSede } from "@/@types/sedes";
import { apiService } from "./apiService";
import { buildResponseError } from "./serviceUtils";
// import type { Sede } from "@/@types";
import type {
	FullCubiculo,
	CreateCubiculoData,
	UpdateCubiculoData,
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
}

export const cubiculoService = new CubiculoService();
