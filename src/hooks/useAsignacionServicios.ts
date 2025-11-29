import { useState, useEffect, useCallback } from "react";
import { asignacionServicioService } from "@/services/asignacionServicioService";
import { cubiculoService } from "@/services/cubiculoService";
import { serviciosService } from "@/services/serviciosService";
import { usePermissions } from "@/hooks/usePermissions";
import { useToastStore } from "@/stores/toastStore";
import { SERVICE_PERMISSIONS } from "@/constants/permissions";
import type {
	AsignacionServicio,
	CreateAsignacionServicioData,
} from "@/@types/asignacionServicios";
import type { FullCubiculo } from "@/@types/cubiculos";
import type { FullServicios } from "@/@types/servicios";
import type { FullSede } from "@/@types/sedes";
import { useRef } from "react";

export const useAsignacionServicios = () => {
	const [asignaciones, setAsignaciones] = useState<AsignacionServicio[]>([]);
	const [cubiculos, setCubiculos] = useState<FullCubiculo[]>([]);
	const [cubiculosSedes, setCubiculosSedes] = useState<FullCubiculo[]>([]);
	const cubiculosSedesCache = useRef<Record<number, FullCubiculo[]>>({});
	const [sedes, setSedes] = useState<FullSede[]>([]);
	const [servicios, setServicios] = useState<FullServicios[]>([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { hasAnyPermission, loading: permissionsLoading } = usePermissions();
	const { addToast } = useToastStore();

	// Helpers para extraer errores del backend
	const isRecord = (val: unknown): val is Record<string, unknown> =>
		val !== null && typeof val === "object";

	const parseBackendError = useCallback(
		(
			err: unknown
		): {
			message: string;
			fieldErrors?: Record<string, string>;
		} => {
			let message = "Error en la operación";
			if (err instanceof Error && err.message) message = err.message;
			let fieldErrors: Record<string, string> | undefined;
			let payload: Record<string, unknown> | undefined;
			if (isRecord(err) && "payload" in err) {
				const maybePayload = (err as Record<string, unknown>)["payload"];
				if (isRecord(maybePayload)) {
					payload = maybePayload as Record<string, unknown>;
				}
			}
			if (payload) {
				if (Array.isArray(payload.details)) {
					for (const d of payload.details) {
						if (isRecord(d)) {
							const field = typeof d.field === "string" ? d.field : undefined;
							const msg = typeof d.message === "string" ? d.message : undefined;
							if (field && msg) {
								fieldErrors = fieldErrors || {};
								fieldErrors[field] = msg;
							}
						}
					}
				}
				if (isRecord(payload.errors)) {
					fieldErrors = fieldErrors || {};
					Object.entries(payload.errors as Record<string, unknown>).forEach(
						([k, v]) => {
							if (typeof v === "string") fieldErrors![k] = v;
						}
					);
				}
			}
			return { message, fieldErrors };
		},
		[]
	);

	const canRead = hasAnyPermission([
		SERVICE_PERMISSIONS.ASSIGN,
		SERVICE_PERMISSIONS.MANAGE,
	]);
	const canCreate = hasAnyPermission([
		SERVICE_PERMISSIONS.ASSIGN,
		SERVICE_PERMISSIONS.MANAGE,
	]);
	const canUpdate = hasAnyPermission([
		SERVICE_PERMISSIONS.ASSIGN,
		SERVICE_PERMISSIONS.MANAGE,
	]);
	const canDelete = hasAnyPermission([
		SERVICE_PERMISSIONS.ASSIGN,
		SERVICE_PERMISSIONS.MANAGE,
	]);

	const loadAsignaciones = useCallback(async () => {
		if (!canRead) {
			setError("No tienes permisos para ver las asignaciones de servicios");
			return;
		}

		setLoading(true);
		setError(null);
		try {
			const data = await asignacionServicioService.getAll();
			setAsignaciones(data);
		} catch (err) {
			const message =
				err instanceof Error
					? err.message
					: "Error al cargar asignaciones de servicios";
			setError(message);
			addToast({ type: "error", title: "Error", message });
		} finally {
			setLoading(false);
		}
	}, [canRead, addToast]);

	const loadAuxiliaryData = useCallback(async () => {
		try {
			const [cubiculosData, serviciosData, sedesData] = await Promise.all([
				cubiculoService.getAll(),
				serviciosService.getAll(),
				cubiculoService.getAllSedes(),
			]);
			setCubiculos(cubiculosData);
			setServicios(serviciosData);
			setSedes(sedesData);
		} catch (err) {
			console.error("Error cargando datos auxiliares:", err);
			addToast({
				type: "warning",
				title: "Advertencia",
				message: "No se pudieron cargar los datos auxiliares",
			});
		}
	}, [addToast]);

	const loadCubiculosBySede = useCallback(
		async (id_sede: number): Promise<void> => {
			if (cubiculosSedesCache.current[id_sede]) {
				setCubiculosSedes(cubiculosSedesCache.current[id_sede]);
				return;
			}

			try {
				const data = await cubiculoService.getCubiculosBySede(id_sede);
				cubiculosSedesCache.current[id_sede] = data;
				setCubiculosSedes(data);
			} catch (err) {
				console.error("Error cargando cubículos de la sede:", err);
				addToast({
					type: "error",
					title: "Error",
					message: "Error al cargar cubículos de la sede",
				});
			}
		},
		[addToast]
	);

	const getAsignacionById = useCallback(
		async (id: number): Promise<AsignacionServicio | null> => {
			if (!canRead) return null;

			try {
				const data = await asignacionServicioService.getById(id);
				return data;
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Error al cargar la asignación";
				addToast({ type: "error", title: "Error", message });
				return null;
			}
		},
		[canRead, addToast]
	);

	const createAsignacion = useCallback(
		async (
			data: CreateAsignacionServicioData
		): Promise<{
			success: boolean;
			fieldErrors?: Record<string, string>;
		}> => {
			if (!canCreate) {
				addToast({
					type: "error",
					title: "Error",
					message: "No tienes permisos para crear asignaciones de servicios",
				});
				return { success: false };
			}

			setSaving(true);
			try {
				await asignacionServicioService.create(data);
				await loadAsignaciones();
				addToast({
					type: "success",
					title: "Éxito",
					message: "Asignación de servicios creada correctamente",
				});
				return { success: true };
			} catch (err) {
				const { message, fieldErrors } = parseBackendError(err);
				addToast({ type: "error", title: "Error", message });
				return { success: false, fieldErrors };
			} finally {
				setSaving(false);
			}
		},
		[canCreate, addToast, loadAsignaciones, parseBackendError]
	);

	const toggleEstadoAsignacion = useCallback(
		async (id: number): Promise<void> => {
			if (!canUpdate) {
				addToast({
					type: "error",
					title: "Error",
					message: "No tienes permisos para cambiar el estado",
				});
				return;
			}

			setSaving(true);
			try {
				const updatedAsignacion = await asignacionServicioService.toggleEstado(
					id
				);
				setAsignaciones((prev) =>
					prev.map((asignacion) =>
						asignacion.id === updatedAsignacion.id
							? updatedAsignacion
							: asignacion
					)
				);

				addToast({
					type: "success",
					title: "Éxito",
					message: "Estado actualizado correctamente",
				});
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Error al cambiar el estado";
				addToast({ type: "error", title: "Error", message });
			} finally {
				setSaving(false);
			}
		},
		[canUpdate, addToast]
	);

	const deleteAsignacion = useCallback(
		async (id: number): Promise<boolean> => {
			if (!canDelete) {
				addToast({
					type: "error",
					title: "Error",
					message: "No tienes permisos para eliminar asignaciones de servicios",
				});
				return false;
			}

			setSaving(true);
			try {
				await asignacionServicioService.delete(id);
				await loadAsignaciones();
				addToast({
					type: "success",
					title: "Éxito",
					message: "Asignación de servicios eliminada correctamente",
				});
				return true;
			} catch (err) {
				const message =
					err instanceof Error
						? err.message
						: "Error al eliminar la asignación";
				addToast({ type: "error", title: "Error", message });
				return false;
			} finally {
				setSaving(false);
			}
		},
		[canDelete, addToast, loadAsignaciones]
	);

	useEffect(() => {
		if (canRead) {
			loadAsignaciones();
			loadAuxiliaryData();
		}
	}, [canRead, loadAsignaciones, loadAuxiliaryData]);

	return {
		asignaciones,
		cubiculos,
		cubiculosSedes,
		sedes,
		servicios,
		loading,
		saving,
		permissionsLoading,
		error,
		canRead,
		canCreate,
		canUpdate,
		canDelete,
		createAsignacion,
		toggleEstadoAsignacion,
		deleteAsignacion,
		getAsignacionById,
		loadAsignaciones,
		loadCubiculosBySede,
	};
};
