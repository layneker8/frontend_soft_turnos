import { buildResponseError } from "./serviceUtils";
import type { FullCliente } from "@/@types/clientes";
import { getFindClient } from "./api";
import { apiService } from "./apiService";

interface ApiResponse<T> {
	success: boolean;
	data: T;
	total?: number;
	error?: string;
}

interface ApiResponseConeuro<T> {
	status: number;
	data?: T;
	msg: string;
}

export class ClientService {
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

	async findClientByIdentification(
		identification: string
	): Promise<FullCliente> {
		try {
			const res = (await getFindClient(
				identification
			)) as ApiResponseConeuro<FullCliente>;

			if (res.status !== 200 || !res.data) {
				throw buildResponseError(res, "Error buscando cliente");
			}
			return res.data;
		} catch (err) {
			console.error("Error buscando cliente:", err);
			throw err;
		}
	}
	async findClientLocal(identification: string): Promise<FullCliente[]> {
		try {
			const res = (await apiService.get(
				"/api/clientes?documento=" + identification
			)) as ApiResponse<FullCliente[]>;

			if ("success" in res && res.success === false) {
				throw buildResponseError(res, "Error buscando cliente");
			}
			return res.data;
		} catch (err) {
			console.error("Error buscando cliente:", err);
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

export const clientServices = new ClientService();
