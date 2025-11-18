import { apiService } from "./apiService";
import type { Sede } from "@/@types";
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

interface ApiResponseSede<T> {
	success: boolean;
	total?: number;
	sedes: T;
	error?: string;
}

export class CubiculoService {
	private getErrorString(body: unknown): string | undefined {
		if (
			body &&
			typeof body === "object" &&
			"error" in (body as Record<string, unknown>)
		) {
			const e = (body as Record<string, unknown>)["error"];
			if (typeof e === "string") return e;
		}
		if (
			body &&
			typeof body === "object" &&
			"message" in (body as Record<string, unknown>)
		) {
			const m = (body as Record<string, unknown>)["message"];
			if (typeof m === "string") return m;
		}
		return undefined;
	}

	private buildResponseError(body: unknown, fallback: string): Error {
		const msg = this.getErrorString(body) || fallback;
		const err = new Error(msg) as Error & { payload?: unknown };
		err.payload = body;
		return err;
	}
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
				throw this.buildResponseError(response, "Error creando cubículo");
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
				throw this.buildResponseError(response, "Error actualizando cubículo");
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
}

export const cubiculoService = new CubiculoService();
