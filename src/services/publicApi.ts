import { env } from "@/config/env";
import type { FullSede } from "@/@types/sedes";

/**
 * Servicio para endpoints públicos que NO requieren autenticación
 * Usado para pantallas públicas como el monitor de turnos
 */
class PublicApiService {
	private baseURL: string;

	constructor() {
		this.baseURL = env.API_URL;
	}

	/**
	 * Realiza una petición GET pública (sin autenticación)
	 */
	private async publicGet<T>(endpoint: string): Promise<T> {
		try {
			const response = await fetch(`${this.baseURL}${endpoint}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`Error HTTP: ${response.status}`);
			}

			const data = await response.json();
			return data;
		} catch (error) {
			console.error(`Error en GET público ${endpoint}:`, error);
			throw error;
		}
	}

	/**
	 * Obtiene todas las sedes (endpoint público)
	 * Backend debe exponer: GET /api/public/sedes
	 */
	async getSedes(): Promise<FullSede[]> {
		try {
			const response = await this.publicGet<{
				success: boolean;
				data: FullSede[];
			}>("/api/public/sedes");
			return response.data || [];
		} catch (error) {
			console.error("Error obteniendo sedes públicas:", error);
			throw error;
		}
	}

	/**
	 * Obtiene una sede por ID (endpoint público)
	 * Backend debe exponer: GET /api/public/sedes/:id
	 */
	async getSedeById(id: number): Promise<FullSede> {
		try {
			const response = await this.publicGet<{
				success: boolean;
				data: FullSede;
			}>(`/api/public/sedes/${id}`);
			return response.data;
		} catch (error) {
			console.error(`Error obteniendo sede pública ${id}:`, error);
			throw error;
		}
	}
}

export const publicApiService = new PublicApiService();
