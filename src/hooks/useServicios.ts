import { useState, useEffect, useCallback } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useToastStore } from "@/stores/toastStore";
import type {
	FullServicios,
	CreateServiciosData,
	UpdateServiciosData,
} from "@/@types/servicios";
import {
	SERVICE_PERMISSIONS,
	TURNO_PERMISSIONS,
} from "@/constants/permissions";
import { serviciosService } from "@/services/serviciosService";

export const useServicios = () => {
	const [servicios, setServicios] = useState<FullServicios[]>([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const {
		hasAnyPermission,
		loading: permissionsLoading,
		checkUserPermission,
	} = usePermissions();
	const { addToast } = useToastStore();

	const isRecord = (val: unknown): val is Record<string, unknown> =>
		val !== null && typeof val === "object";

	const parseBackendError = useCallback(
		(
			err: unknown
		): { message: string; fieldErrors?: Record<string, string> } => {
			let message = "Error en la operación";
			if (err instanceof Error && err.message) message = err.message;
			let fieldErrors: Record<string, string> | undefined;
			let payload: Record<string, unknown> | undefined;
			if (isRecord(err) && "payload" in err) {
				const maybePayload = (err as Record<string, unknown>)["payload"];
				if (isRecord(maybePayload))
					payload = maybePayload as Record<string, unknown>;
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
		SERVICE_PERMISSIONS.READ,
		SERVICE_PERMISSIONS.MANAGE,
	]);
	const canCreate = hasAnyPermission([
		SERVICE_PERMISSIONS.CREATE,
		SERVICE_PERMISSIONS.MANAGE,
	]);
	const canUpdate = hasAnyPermission([
		SERVICE_PERMISSIONS.UPDATE,
		SERVICE_PERMISSIONS.MANAGE,
	]);
	const canDelete = hasAnyPermission([
		SERVICE_PERMISSIONS.DELETE,
		SERVICE_PERMISSIONS.MANAGE,
	]);

	const canCreateTurno = hasAnyPermission([
		TURNO_PERMISSIONS.CREATE,
		SERVICE_PERMISSIONS.MANAGE,
	]);

	const loadservicios = useCallback(async () => {
		if (!canRead) {
			setError("No tienes permisos para ver servicios");
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const data = await serviciosService.getAll();
			setServicios(data);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Error al cargar servicios";
			setError(message);
			addToast({ type: "error", title: "Error", message });
		} finally {
			setLoading(false);
		}
	}, [canRead, addToast]);

	const getServicesActive = useCallback(
		async (id_sede: number): Promise<FullServicios[]> => {
			if (!canCreateTurno && !canRead) {
				setError("No tienes permisos para ver servicios");
				return [];
			}
			setLoading(true);
			setError(null);
			try {
				if (!id_sede) throw new Error("ID de sede inválido");
				const activeServices = await serviciosService.getActiveServices(
					id_sede
				);
				return activeServices;
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Error al cargar servicios";
				setError(message);
				addToast({ type: "error", title: "Error", message });
				return [];
			} finally {
				setLoading(false);
			}
		},
		[canCreateTurno, addToast, canRead]
	);

	const getServicioById = useCallback(
		async (id: number): Promise<FullServicios | null> => {
			if (!canRead) return null;
			try {
				return await serviciosService.getById(id);
			} catch (err) {
				console.error("Error obteniendo servicio:", err);
				addToast({
					type: "error",
					title: "Error",
					message: "No se pudo obtener el servicio",
				});
				return null;
			}
		},
		[canRead, addToast]
	);

	const createServicio = useCallback(
		async (
			data: CreateServiciosData
		): Promise<{
			ok: boolean;
			fieldErrors?: Record<string, string>;
			message?: string;
		}> => {
			if (!canCreate) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No puedes crear el servicio",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setSaving(true);
			try {
				const created = await serviciosService.create(data);
				setServicios((prev) => [...prev, created]);
				addToast({
					type: "success",
					title: "Servicio creado",
					message: `El servicio ${created.nombre} fue creado`,
				});
				return { ok: true };
			} catch (err) {
				const { message, fieldErrors } = parseBackendError(err);
				addToast({ type: "error", title: "Error", message });
				return { ok: false, message, fieldErrors };
			} finally {
				setSaving(false);
			}
		},
		[canCreate, addToast, parseBackendError]
	);

	const updateServicio = useCallback(
		async (
			id: number,
			data: UpdateServiciosData
		): Promise<{
			ok: boolean;
			fieldErrors?: Record<string, string>;
			message?: string;
		}> => {
			if (!canUpdate) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No puedes actualizar servicios",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setSaving(true);
			try {
				const updated = await serviciosService.update(id, data);
				setServicios((prev) => prev.map((p) => (p.id === id ? updated : p)));
				addToast({
					type: "success",
					title: "Servicio actualizado",
					message: `El servicio ${updated.nombre} fue actualizado`,
				});
				return { ok: true };
			} catch (err) {
				const { message, fieldErrors } = parseBackendError(err);
				addToast({ type: "error", title: "Error", message });
				return { ok: false, message, fieldErrors };
			} finally {
				setSaving(false);
			}
		},
		[canUpdate, addToast, parseBackendError]
	);

	const deleteServicio = useCallback(
		async (id: number): Promise<{ ok: boolean; message?: string }> => {
			if (!canDelete) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No puedes eliminar servicios",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setSaving(true);
			try {
				await serviciosService.delete(id);
				setServicios((prev) => prev.filter((p) => p.id !== id));
				addToast({
					type: "success",
					title: "Servicio eliminado",
					message: "El servicio fue eliminado correctamente",
				});
				return { ok: true };
			} catch (err) {
				const { message } = parseBackendError(err);
				addToast({ type: "error", title: "Error", message });
				return { ok: false, message };
			} finally {
				setSaving(false);
			}
		},
		[canDelete, addToast, parseBackendError]
	);

	useEffect(() => {
		if (canRead) loadservicios();
	}, [canRead, loadservicios]);

	return {
		servicios,
		loading,
		saving,
		permissionsLoading,
		error,
		canRead,
		canCreate,
		canUpdate,
		canDelete,
		loadservicios,
		createServicio,
		updateServicio,
		deleteServicio,
		getServicioById,
		checkUserPermission,
		getServicesActive,
	};
};
