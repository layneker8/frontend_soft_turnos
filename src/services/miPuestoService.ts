import type {
	MiPuesto,
	CubiculoDisponible,
	pausasAtencion,
} from "@/@types/miPuesto";
import { apiService } from "./apiService";
import { buildResponseError } from "./serviceUtils";

interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
	error?: string;
}

export class MiPuestoService {
	// Obtener cubículos disponibles para el usuario en una sede
	async getCubiculosDisponibles(
		usuario_id: number,
		sede_id: number
	): Promise<CubiculoDisponible[]> {
		try {
			const response = (await apiService.get(
				`/api/cubiculos/disponibles?usuario_id=${usuario_id}&sede_id=${sede_id}`
			)) as ApiResponse<CubiculoDisponible[]>;
			return response.data || [];
		} catch (error) {
			console.error("Error obteniendo cubículos disponibles:", error);
			throw error;
		}
	}

	// Seleccionar/asignar un cubículo al usuario
	async seleccionarCubiculo(
		cubiculo_id: number,
		usuario_id: number
	): Promise<MiPuesto> {
		try {
			const response = (await apiService.post("/api/mi-puesto/seleccionar", {
				cubiculo_id,
				usuario_id,
			})) as ApiResponse<MiPuesto>;

			if ("success" in response && response.success === false) {
				throw buildResponseError(response, "Error seleccionando cubículo");
			}

			return response.data;
		} catch (error) {
			console.error("Error seleccionando cubículo:", error);
			throw error;
		}
	}

	// Obtener el puesto actual del usuario
	async getMiPuestoActual(usuario_id: number): Promise<MiPuesto | null> {
		try {
			const response = (await apiService.get(
				`/api/mi-puesto/actual?usuario_id=${usuario_id}`
			)) as ApiResponse<MiPuesto>;
			return response.data || null;
		} catch (error) {
			console.error("Error obteniendo puesto actual:", error);
			return null;
		}
	}

	// Pausar/reanudar el cubículo
	async cambiarEstadoCubiculo(
		cubiculo_id: number,
		estado: "disponible" | "pausado"
	): Promise<MiPuesto> {
		try {
			const response = (await apiService.put(
				`/api/mi-puesto/estado-cubiculo/${cubiculo_id}`,
				{ estado }
			)) as ApiResponse<MiPuesto>;

			if ("success" in response && response.success === false) {
				throw buildResponseError(
					response,
					"Error cambiando estado del cubículo"
				);
			}

			return response.data;
		} catch (error) {
			console.error("Error cambiando estado del cubículo:", error);
			throw error;
		}
	}

	// Liberar cubículo (cerrar sesión del puesto)
	async liberarCubiculo(cubiculo_id: number): Promise<void> {
		try {
			await apiService.put(`/api/mi-puesto/liberar/${cubiculo_id}`, {});
		} catch (error) {
			console.error("Error liberando cubículo:", error);
			throw error;
		}
	}

	// Obtener pausas actuales del puesto
	async getPausasActual(id_atencion: number): Promise<pausasAtencion[]> {
		try {
			const response = (await apiService.get(
				`/api/mi-puesto/pausas/${id_atencion}`
			)) as ApiResponse<pausasAtencion[]>;
			return response.data || [];
		} catch (error) {
			console.error("Error obteniendo pausas actuales:", error);
			throw error;
		}
	}
}

export const miPuestoService = new MiPuestoService();
