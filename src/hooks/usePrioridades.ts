import { useState, useEffect, useCallback } from "react";
import { prioridadService } from "@/services/prioridadService";
import { usePermissions } from "@/hooks/usePermissions";
import { useToastStore } from "@/stores/toastStore";
import {
	PRIORIDADES_PERMISSIONS,
	TURNO_PERMISSIONS,
} from "@/constants/permissions";
import type {
	FullPrioridad,
	CreatePrioridadData,
	UpdatePrioridadData,
} from "@/@types/prioridades";

export const usePrioridades = () => {
	const [prioridades, setPrioridades] = useState<FullPrioridad[]>([]);
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
		PRIORIDADES_PERMISSIONS.READ,
		PRIORIDADES_PERMISSIONS.MANAGE,
	]);
	const canCreate = hasAnyPermission([
		PRIORIDADES_PERMISSIONS.CREATE,
		PRIORIDADES_PERMISSIONS.MANAGE,
	]);
	const canUpdate = hasAnyPermission([
		PRIORIDADES_PERMISSIONS.UPDATE,
		PRIORIDADES_PERMISSIONS.MANAGE,
	]);
	const canDelete = hasAnyPermission([
		PRIORIDADES_PERMISSIONS.DELETE,
		PRIORIDADES_PERMISSIONS.MANAGE,
	]);

	const canCreateTurno = hasAnyPermission([
		TURNO_PERMISSIONS.CREATE,
		PRIORIDADES_PERMISSIONS.MANAGE,
	]);

	const loadPrioridades = useCallback(async () => {
		if (!canRead && !canCreateTurno) {
			setError("No tienes permisos para ver prioridades");
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const data = await prioridadService.getAll();
			setPrioridades(data);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Error al cargar prioridades";
			setError(message);
			addToast({ type: "error", title: "Error", message });
		} finally {
			setLoading(false);
		}
	}, [canRead, addToast, canCreateTurno]);

	const getPrioridadById = useCallback(
		async (id: number): Promise<FullPrioridad | null> => {
			if (!canRead) return null;
			try {
				return await prioridadService.getById(id);
			} catch (err) {
				console.error("Error obteniendo prioridad:", err);
				addToast({
					type: "error",
					title: "Error",
					message: "No se pudo obtener la prioridad",
				});
				return null;
			}
		},
		[canRead, addToast]
	);

	const createPrioridad = useCallback(
		async (
			data: CreatePrioridadData
		): Promise<{
			ok: boolean;
			fieldErrors?: Record<string, string>;
			message?: string;
		}> => {
			if (!canCreate) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No puedes crear prioridades",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setSaving(true);
			try {
				const created = await prioridadService.create(data);
				setPrioridades((prev) => [...prev, created]);
				addToast({
					type: "success",
					title: "Prioridad creada",
					message: `La prioridad ${created.nombre_prioridad} fue creada`,
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

	const updatePrioridad = useCallback(
		async (
			id: number,
			data: UpdatePrioridadData
		): Promise<{
			ok: boolean;
			fieldErrors?: Record<string, string>;
			message?: string;
		}> => {
			if (!canUpdate) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No puedes actualizar prioridades",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setSaving(true);
			try {
				const updated = await prioridadService.update(id, data);
				setPrioridades((prev) => prev.map((p) => (p.id === id ? updated : p)));
				addToast({
					type: "success",
					title: "Prioridad actualizada",
					message: `La prioridad ${updated.nombre_prioridad} fue actualizada`,
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

	const deletePrioridad = useCallback(
		async (id: number): Promise<{ ok: boolean; message?: string }> => {
			if (!canDelete) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No puedes eliminar prioridades",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setSaving(true);
			try {
				await prioridadService.delete(id);
				setPrioridades((prev) => prev.filter((p) => p.id !== id));
				addToast({
					type: "success",
					title: "Prioridad eliminada",
					message: "La prioridad fue eliminada",
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

	// devolver los niveles disponibles: opciones definidas que NO estén ya usadas
	const handleNiveles = useCallback((): number[] => {
		const nivelOptions = [0, 1, 2, 3, 5, 10, 20, 30, 40, 50, 60, 70, 80, 99];
		// niveles usados actualmente (únicos)
		const usados = Array.from(
			new Set(prioridades.map((p) => p.nivel_prioridad))
		);
		// las opciones que aún no están usadas
		const disponibles = nivelOptions.filter((opt) => !usados.includes(opt));
		// devolver ordenados (asc)
		return disponibles.sort((a, b) => a - b);
	}, [prioridades]);

	useEffect(() => {
		if (canRead) loadPrioridades();
	}, [canRead, loadPrioridades]);

	return {
		prioridades,
		loading,
		saving,
		permissionsLoading,
		error,
		canRead,
		canCreate,
		canUpdate,
		canDelete,
		loadPrioridades,
		createPrioridad,
		updatePrioridad,
		deletePrioridad,
		getPrioridadById,
		checkUserPermission,
		handleNiveles,
	};
};
