import { useState, useCallback } from "react";
import { publicApiService } from "@/services/publicApi";
import type { FullSede } from "@/@types/sedes";

/**
 * Hook para obtener sedes desde endpoints públicos
 * No requiere autenticación - Ideal para pantallas públicas
 */
export const usePublicSedes = () => {
	const [sedes, setSedes] = useState<FullSede[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Carga todas las sedes desde el endpoint público
	 */
	const loadSedes = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await publicApiService.getSedes();
			setSedes(data);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Error cargando sedes";
			setError(message);
			console.error("Error cargando sedes públicas:", err);
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Obtiene una sede específica por ID
	 */
	const getSedeById = useCallback(
		async (id: number): Promise<FullSede | null> => {
			setLoading(true);
			setError(null);
			try {
				const sede = await publicApiService.getSedeById(id);
				return sede;
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Error obteniendo sede";
				setError(message);
				console.error("Error obteniendo sede pública:", err);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	return {
		sedes,
		loading,
		error,
		loadSedes,
		getSedeById,
	};
};
