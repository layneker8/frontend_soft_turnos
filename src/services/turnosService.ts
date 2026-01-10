import type {
	CambiarEstadoTurnoData,
	CancelarTurno,
	CreateTurnoData,
	FinalizarData,
	LlamarTurnoData,
	Turno,
	DataTurnoCompleto,
} from "@/@types";
import { apiService } from "./apiService";
import { buildResponseError } from "./serviceUtils";

interface ApiResponse<T> {
	success: boolean;
	data: T;
	error?: string;
	total?: number;
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
		id_turno: number,
		data: CambiarEstadoTurnoData
	): Promise<DataTurnoCompleto> {
		try {
			const response = (await apiService.patch(
				`/api/turnos/${id_turno}/estado`,
				data
			)) as ApiResponse<DataTurnoCompleto>;

			if ("success" in response && response.success === false) {
				throw buildResponseError(response, "Error cambiando estado del turno");
			}

			return response.data;
		} catch (error) {
			console.error("Error cambiando estado del turno:", error);
			throw error;
		}
	}

	// finalizar turno
	async finalizarTurno(data: FinalizarData): Promise<DataTurnoCompleto> {
		try {
			const response = (await apiService.post(
				`/api/turnos/${data.turno_id}/finalizar`,
				{
					observaciones: data.observaciones,
				}
			)) as ApiResponse<DataTurnoCompleto>;
			if ("success" in response && response.success === false) {
				throw buildResponseError(response, "Error finalizando el turno");
			}

			return response.data;
		} catch (error) {
			console.error("Error finalizando el turno:", error);
			throw error;
		}
	}

	async cancelarTurno(data: CancelarTurno): Promise<boolean> {
		try {
			const response = (await apiService.post(
				`/api/turnos/${data.turno_id}/cancelar`,
				{
					motivo_id: data.motivo_id,
					observaciones: data.observaciones,
				}
			)) as ApiResponse<null>;

			if ("success" in response && response.success === false) {
				throw buildResponseError(response, "Error cancelando turno");
			}
			return true;
		} catch (error) {
			console.error("Error cancelando turno:", error);
			throw error;
		}
	}

	// Llamar el siguiente turno
	async llamarTurno(data: LlamarTurnoData): Promise<DataTurnoCompleto> {
		try {
			const response = (await apiService.post(
				"/api/turnos/call-next",
				data
			)) as ApiResponse<DataTurnoCompleto>;

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
	async rellamarTurno(turno_id: string): Promise<DataTurnoCompleto> {
		try {
			const response = (await apiService.get(
				`/api/turnos/call-current/${turno_id}`
			)) as ApiResponse<DataTurnoCompleto>;

			if ("success" in response && response.success === false) {
				throw buildResponseError(response, "Error volviendo a llamar turno");
			}

			return response.data;
		} catch (error) {
			console.error("Error volviendo a llamar turno:", error);
			throw error;
		}
	}

	// Traer los turnos en cola para una sede
	async getTurnosEnCola(
		sede_id: number
	): Promise<{ data: DataTurnoCompleto[]; total: number }> {
		try {
			const response = (await apiService.get(
				`/api/turnos/queue?sede_id=${sede_id}`
			)) as ApiResponse<DataTurnoCompleto[]>;
			return {
				data: response.data,
				total: response.total || 0,
			};
		} catch (error) {
			console.error("Error obteniendo turnos en cola:", error);
			throw error;
		}
	}
}

export const turnoService = new TurnoService();
