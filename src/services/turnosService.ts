import type {
	CambiarEstadoTurnoData,
	CreateTurnoData,
	LlamarTurnoData,
	Turno,
	TurnoLlamado,
} from "@/@types";
import { apiService } from "./apiService";
import { buildResponseError } from "./serviceUtils";

interface ApiResponse<T> {
	success: boolean;
	data: T;
	error?: string;
}
export class TurnoService {
	async create(data: CreateTurnoData): Promise<Turno> {
		try {
			const res = (await apiService.post(
				"/api/turnos",
				data
			)) as ApiResponse<Turno>;
			if ("success" in res && res.success === false) {
				throw buildResponseError(res, "Error creando turno");
			}
			return res.data;
		} catch (err) {
			console.error("Error creando turno:", err);
			throw err;
		}
	}

	// Cambiar estado del turno (atendiendo, finalizado, cancelado)
	async cambiarEstadoTurno(
		data: CambiarEstadoTurnoData
	): Promise<TurnoLlamado> {
		try {
			const response = (await apiService.put(
				"/api/mi-puesto/estado-turno",
				data
			)) as ApiResponse<TurnoLlamado>;

			if ("success" in response && response.success === false) {
				throw buildResponseError(response, "Error cambiando estado del turno");
			}

			return response.data;
		} catch (error) {
			console.error("Error cambiando estado del turno:", error);
			throw error;
		}
	}

	// Llamar el siguiente turno
	async llamarTurno(data: LlamarTurnoData): Promise<TurnoLlamado> {
		try {
			const response = (await apiService.post(
				"/api/turnos/call-next",
				data
			)) as ApiResponse<TurnoLlamado>;

			if ("success" in response && response.success === false) {
				throw buildResponseError(response, "Error llamando turno");
			}
			return response.data;
		} catch (error) {
			console.error("Error llamando turno:", error);
			throw error;
		}
	}

	// Rellamar el mismo turno
	async rellamarTurno(turno_id: string): Promise<TurnoLlamado> {
		try {
			const response = (await apiService.get(
				`/api/turnos/call-current/${turno_id}`
			)) as ApiResponse<TurnoLlamado>;

			if ("success" in response && response.success === false) {
				throw buildResponseError(response, "Error volviendo a llamar turno");
			}

			return response.data;
		} catch (error) {
			console.error("Error volviendo a llamar turno:", error);
			throw error;
		}
	}
}

export const turnoService = new TurnoService();
