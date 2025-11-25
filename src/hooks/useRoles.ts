import { useState, useEffect, useCallback } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useToastStore } from "@/stores/toastStore";
import { ADMIN_PERMISSIONS } from "@/constants/permissions";
import type { FullRoles, CreateRolData, UpdateRolData } from "@/@types/roles";
import { rolesService } from "@/services/rolesService";

export const useRoles = () => {
	const [roles, setRoles] = useState<FullRoles[]>([]);
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
		ADMIN_PERMISSIONS.MANAGE,
		ADMIN_PERMISSIONS.MANAGE_ROLES,
		ADMIN_PERMISSIONS.MANAGE_PERMISSIONS,
	]);
	const canCreate = hasAnyPermission([
		ADMIN_PERMISSIONS.MANAGE,
		ADMIN_PERMISSIONS.MANAGE_ROLES,
		ADMIN_PERMISSIONS.MANAGE_PERMISSIONS,
	]);
	const canUpdate = hasAnyPermission([
		ADMIN_PERMISSIONS.MANAGE,
		ADMIN_PERMISSIONS.MANAGE_ROLES,
		ADMIN_PERMISSIONS.MANAGE_PERMISSIONS,
	]);
	const canDelete = hasAnyPermission([
		ADMIN_PERMISSIONS.MANAGE,
		ADMIN_PERMISSIONS.MANAGE_ROLES,
		ADMIN_PERMISSIONS.MANAGE_PERMISSIONS,
	]);

	const loadRoles = useCallback(async () => {
		if (!canRead) {
			setError("No tienes permisos para ver los roles");
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const data = await rolesService.getAll();
			setRoles(data);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Error al cargar los roles";
			setError(message);
			addToast({ type: "error", title: "Error", message });
		} finally {
			setLoading(false);
		}
	}, [canRead, addToast]);

	const getRoleById = useCallback(
		async (id: number): Promise<FullRoles | null> => {
			if (!canRead) return null;
			try {
				return await rolesService.getById(id);
			} catch (err) {
				console.error("Error obteniendo rol:", err);
				addToast({
					type: "error",
					title: "Error",
					message: "No se pudo obtener el rol",
				});
				return null;
			}
		},
		[canRead, addToast]
	);

	const createRole = useCallback(
		async (
			data: CreateRolData
		): Promise<{
			ok: boolean;
			fieldErrors?: Record<string, string>;
			message?: string;
		}> => {
			if (!canCreate) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No puedes crear roles",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setSaving(true);
			try {
				const created = await rolesService.create(data);
				setRoles((prev) => [...prev, created]);
				addToast({
					type: "success",
					title: "Rol creado",
					message: `El rol ${created.nombre_rol} fue creado`,
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

	const updateRole = useCallback(
		async (
			id: number,
			data: UpdateRolData
		): Promise<{
			ok: boolean;
			fieldErrors?: Record<string, string>;
			message?: string;
		}> => {
			if (!canUpdate) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No puedes actualizar roles",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setSaving(true);
			try {
				const updated = await rolesService.update(id, data);
				setRoles((prev) => prev.map((p) => (p.id === id ? updated : p)));
				addToast({
					type: "success",
					title: "Rol actualizado",
					message: `El rol ${updated.nombre_rol} fue actualizado`,
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

	const deleteRole = useCallback(
		async (id: number): Promise<{ ok: boolean; message?: string }> => {
			if (!canDelete) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No puedes eliminar roles",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setSaving(true);
			try {
				await rolesService.delete(id);
				setRoles((prev) => prev.filter((p) => p.id !== id));
				addToast({
					type: "success",
					title: "Rol eliminado",
					message: "El rol fue eliminado correctamente",
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

	// Traer todos los permisos
	const getAllPermissions = useCallback(async (): Promise<
		{ id: number; nombre: string; descripcion: string; created_at: string }[]
	> => {
		try {
			if (!canRead) {
				return [];
			}
			return await rolesService.getAllPermissions();
		} catch (error) {
			console.error("Error obteniendo permisos:", error);
			addToast({
				type: "error",
				title: "Error",
				message: "No se pudieron obtener los permisos",
			});
			return [];
		}
	}, [canRead, addToast]);

	useEffect(() => {
		if (canRead) loadRoles();
	}, [canRead, loadRoles]);

	return {
		roles,
		loading,
		saving,
		permissionsLoading,
		error,
		canRead,
		canCreate,
		canUpdate,
		canDelete,
		loadRoles,
		createRole,
		updateRole,
		deleteRole,
		getRoleById,
		checkUserPermission,
		getAllPermissions,
	};
};
