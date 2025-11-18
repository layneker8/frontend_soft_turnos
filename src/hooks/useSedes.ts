import { useState, useEffect, useCallback } from "react";
import { sedeService } from "@/services/sedeService";
import { usePermissions } from "@/hooks/usePermissions";
import { useToastStore } from "@/stores/toastStore";
import { SEDE_PERMISSIONS } from "@/constants/permissions";
import type { FullSede, CreateSedeData, UpdateSedeData } from "@/@types/sedes";

export const useSedes = () => {
	const [sedes, setSedes] = useState<FullSede[]>([]);
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
		SEDE_PERMISSIONS.READ,
		SEDE_PERMISSIONS.MANAGE,
	]);
	const canCreate = hasAnyPermission([
		SEDE_PERMISSIONS.CREATE,
		SEDE_PERMISSIONS.MANAGE,
	]);
	const canUpdate = hasAnyPermission([
		SEDE_PERMISSIONS.UPDATE,
		SEDE_PERMISSIONS.MANAGE,
	]);
	const canDelete = hasAnyPermission([
		SEDE_PERMISSIONS.DELETE,
		SEDE_PERMISSIONS.MANAGE,
	]);

	const loadSedes = useCallback(async () => {
		if (!canRead) {
			setError("No tienes permisos para ver las sedes");
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const data = await sedeService.getAll();
			setSedes(data);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Error al cargar sedes";
			setError(message);
			addToast({ type: "error", title: "Error", message });
		} finally {
			setLoading(false);
		}
	}, [canRead, addToast]);

	const getSedeById = useCallback(
		async (id: number): Promise<FullSede | null> => {
			if (!canRead) return null;
			try {
				return await sedeService.getById(id);
			} catch (err) {
				console.error("Error obteniendo sede:", err);
				addToast({
					type: "error",
					title: "Error",
					message: "No se pudo obtener la sede",
				});
				return null;
			}
		},
		[canRead, addToast]
	);

	const createSede = useCallback(
		async (
			data: CreateSedeData
		): Promise<{
			ok: boolean;
			fieldErrors?: Record<string, string>;
			message?: string;
		}> => {
			if (!canCreate) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No puedes crear sedes",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setSaving(true);
			try {
				const created = await sedeService.create(data);
				setSedes((prev) => [...prev, created]);
				addToast({
					type: "success",
					title: "Sede creada",
					message: `La sede ${created.nombre_sede} fue creada`,
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

	const updateSede = useCallback(
		async (
			id: number,
			data: UpdateSedeData
		): Promise<{
			ok: boolean;
			fieldErrors?: Record<string, string>;
			message?: string;
		}> => {
			if (!canUpdate) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No puedes actualizar sedes",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setSaving(true);
			try {
				const updated = await sedeService.update(id, data);
				setSedes((prev) => prev.map((s) => (s.id_sede === id ? updated : s)));
				addToast({
					type: "success",
					title: "Sede actualizada",
					message: `La sede ${updated.nombre_sede} fue actualizada`,
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

	const deleteSede = useCallback(
		async (id: number): Promise<{ ok: boolean; message?: string }> => {
			if (!canDelete) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No puedes eliminar sedes",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setSaving(true);
			try {
				await sedeService.delete(id);
				setSedes((prev) => prev.filter((s) => s.id_sede !== id));
				addToast({
					type: "success",
					title: "Sede eliminada",
					message: "La sede fue eliminada",
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
		if (canRead) loadSedes();
	}, [canRead, loadSedes]);

	return {
		sedes,
		loading,
		saving,
		permissionsLoading,
		error,
		canRead,
		canCreate,
		canUpdate,
		canDelete,
		loadSedes,
		createSede,
		updateSede,
		deleteSede,
		getSedeById,
		checkUserPermission,
	};
};
