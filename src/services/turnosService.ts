import type { CreateTurnoData, Turno } from "@/@types/turnos";
import { apiService } from "./apiService";
import { buildResponseError } from "./serviceUtils";

interface ApiResponse<T> {
	success: boolean;
	data: T;
	error?: string;
}
export class TurnoService {
	// async getAll(): Promise<FullSede[]> {
	// 	try {
	// 		const res = (await apiService.get("/api/sedes")) as ApiResponse<
	// 			FullSede[]
	// 		>;
	// 		return res.data || [];
	// 	} catch (err) {
	// 		console.error("Error obteniendo sedes:", err);
	// 		throw err;
	// 	}
	// }

	// async getById(id: number): Promise<FullSede> {
	// 	try {
	// 		const res = (await apiService.get(
	// 			`/api/sedes/${id}`
	// 		)) as ApiResponse<FullSede>;
	// 		return res.data;
	// 	} catch (err) {
	// 		console.error(`Error obteniendo sede ${id}:`, err);
	// 		throw err;
	// 	}
	// }

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
	// async update(id: number, data: UpdateSedeData): Promise<FullSede> {
	//     try {
	//         const res = (await apiService.put(
	//             `/api/sedes/${id}`,
	//             data
	//         )) as ApiResponse<FullSede>;
	//         if ("success" in res && res.success === false) {
	//             throw buildResponseError(res, "Error actualizando sede");
	//         }
	//         return res.data;
	//     } catch (err) {
	//         console.error(`Error actualizando sede ${id}:`, err);
	//         throw err;
	//     }
	// }

	// async delete(id: number): Promise<void> {
	//     try {
	//         await apiService.delete(`/api/sedes/${id}`);
	//     } catch (err) {
	//         console.error(`Error eliminando sede ${id}:`, err);
	//         throw err;
	//     }
	// }
}

export const turnoService = new TurnoService();
