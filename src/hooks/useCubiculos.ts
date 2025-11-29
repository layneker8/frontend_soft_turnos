import { useState, useEffect, useCallback, useRef } from "react";
import { cubiculoService } from "@/services/cubiculoService";
import { usePermissions } from "@/hooks/usePermissions";
import { useToastStore } from "@/stores/toastStore";
import {
	CUBICULO_PERMISSIONS,
	SEDE_PERMISSIONS,
} from "@/constants/permissions";
import type {
	FullCubiculo,
	CreateCubiculoData,
	UpdateCubiculoData,
	AsignacionesCubiculo,
	dataAsignacion,
} from "@/@types/cubiculos";
import type { FullSede } from "@/@types/sedes";
import { userService } from "@/services/userService";
import type { FullUser } from "@/@types/users";

export const useCubiculos = () => {
	const [cubiculos, setCubiculos] = useState<FullCubiculo[]>([]);
	const [asignaciones, setAsignaciones] = useState<AsignacionesCubiculo[]>([]);
	const [cubiculosSedes, setCubiculosSedes] = useState<FullCubiculo[]>([]);
	const [usuariosSedes, setUsuariosSedes] = useState<FullUser[]>([]);
	const cubiculosSedesCache = useRef<Record<number, FullCubiculo[]>>({});
	const usuariosSedesCache = useRef<Record<number, FullUser[]>>({});
	const [sedes, setSedes] = useState<FullSede[]>([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const {
		hasAnyPermission,
		checkUserPermission,
		loading: permissionsLoading,
	} = usePermissions();
	const { addToast } = useToastStore();

	// Helpers para extraer errores del backend sin usar any
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
		CUBICULO_PERMISSIONS.READ,
		CUBICULO_PERMISSIONS.MANAGE,
	]);
	const canCreate = hasAnyPermission([
		CUBICULO_PERMISSIONS.CREATE,
		CUBICULO_PERMISSIONS.MANAGE,
	]);
	const canUpdate = hasAnyPermission([
		CUBICULO_PERMISSIONS.UPDATE,
		CUBICULO_PERMISSIONS.MANAGE,
	]);
	const canDelete = hasAnyPermission([
		CUBICULO_PERMISSIONS.DELETE,
		CUBICULO_PERMISSIONS.MANAGE,
	]);
	const canReadSedes = hasAnyPermission([
		SEDE_PERMISSIONS.READ,
		SEDE_PERMISSIONS.MANAGE,
	]);

	const canAsign = hasAnyPermission([
		CUBICULO_PERMISSIONS.ASSIGN,
		CUBICULO_PERMISSIONS.MANAGE,
	]);

	const loadCubiculos = useCallback(async () => {
		if (!canRead) {
			setError("No tienes permisos para ver los cubículos");
			return;
		}

		setLoading(true);
		setError(null);
		try {
			const data = await cubiculoService.getAll();
			setCubiculos(data);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Error al cargar cubículos";
			setError(message);
			addToast({ type: "error", title: "Error", message });
		} finally {
			setLoading(false);
		}
	}, [canRead, addToast]);

	const loadAuxiliaryData = useCallback(async () => {
		try {
			const sedesData = canReadSedes ? await cubiculoService.getAllSedes() : [];
			setSedes(sedesData);
		} catch (err) {
			console.error("Error cargando sedes:", err);
			addToast({
				type: "warning",
				title: "Advertencia",
				message: "No se pudieron cargar las sedes",
			});
		}
	}, [canReadSedes, addToast]);

	const getCubiculoById = useCallback(
		async (id: number): Promise<FullCubiculo | null> => {
			if (!canRead) return null;
			try {
				return await cubiculoService.getById(id);
			} catch (err) {
				console.error("Error obteniendo cubículo:", err);
				addToast({
					type: "error",
					title: "Error",
					message: "No se pudo obtener el cubículo",
				});
				return null;
			}
		},
		[canRead, addToast]
	);

	const createCubiculo = useCallback(
		async (
			data: CreateCubiculoData
		): Promise<{
			ok: boolean;
			fieldErrors?: Record<string, string>;
			message?: string;
		}> => {
			if (!canCreate) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No puedes crear cubículos",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setSaving(true);
			try {
				const created = await cubiculoService.create(data);
				setCubiculos((prev) => [...prev, created]);
				addToast({
					type: "success",
					title: "Cubículo creado",
					message: `El cubículo ${created.nombre} fue creado`,
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

	const updateCubiculo = useCallback(
		async (
			id: number,
			data: UpdateCubiculoData
		): Promise<{
			ok: boolean;
			fieldErrors?: Record<string, string>;
			message?: string;
		}> => {
			if (!canUpdate) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No puedes actualizar cubículos",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setSaving(true);
			try {
				const updated = await cubiculoService.update(id, data);
				setCubiculos((prev) => prev.map((c) => (c.id === id ? updated : c)));
				addToast({
					type: "success",
					title: "Cubículo actualizado",
					message: `El cubículo ${updated.nombre} fue actualizado`,
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

	const deleteCubiculo = useCallback(
		async (id: number): Promise<{ ok: boolean; message?: string }> => {
			if (!canDelete) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No puedes eliminar cubículos",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setSaving(true);
			try {
				await cubiculoService.delete(id);
				setCubiculos((prev) => prev.filter((c) => c.id !== id));
				addToast({
					type: "success",
					title: "Cubículo eliminado",
					message: "El cubículo fue eliminado",
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

	// ---------- Asignaciones cubículos -------------

	const loadAsignacionesCubiculos = useCallback(async () => {
		if (!canAsign) {
			setError("No tienes permisos para asignar cubículos");
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const data = await cubiculoService.getAllAsignaciones();
			setAsignaciones(data);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Error al cargar cubículos";
			setError(message);
			addToast({ type: "error", title: "Error", message });
		} finally {
			setLoading(false);
		}
	}, [canAsign, addToast]);

	//  * Cargar cubículos de una sede específica
	const loadCubiculosBySede = useCallback(
		async (sedeId: number) => {
			if (!canReadSedes && !canAsign) {
				setCubiculosSedes([]);
				setUsuariosSedes([]);
				return;
			}
			if (
				cubiculosSedesCache.current[sedeId] &&
				usuariosSedesCache.current[sedeId]
			) {
				setCubiculosSedes(cubiculosSedesCache.current[sedeId]);
				setUsuariosSedes(usuariosSedesCache.current[sedeId]);
				return;
			}
			setSaving(true);
			try {
				const [sedesData, usuariosData] = await Promise.all([
					canAsign
						? cubiculoService.getCubiculosBySede(sedeId)
						: Promise.resolve([]),
					canAsign ? userService.getUsersBySede(sedeId) : Promise.resolve([]),
				]);
				cubiculosSedesCache.current[sedeId] = sedesData;
				usuariosSedesCache.current[sedeId] = usuariosData;
				setCubiculosSedes(sedesData);
				setUsuariosSedes(usuariosData);
			} catch (err) {
				const { message } = parseBackendError(err);
				addToast({ type: "error", title: "Error", message });
				setCubiculosSedes([]);
			} finally {
				setSaving(false);
			}
		},
		[canReadSedes, addToast, canAsign, parseBackendError]
	);

	// obtener una asignación por ID (para editar)
	const getAsignacionById = useCallback(
		async (id: number): Promise<AsignacionesCubiculo | null> => {
			if (!canRead) return null;
			try {
				return await cubiculoService.getAsignacionById(id);
			} catch (err) {
				console.error("Error obteniendo asignación:", err);
				addToast({
					type: "error",
					title: "Error",
					message: "No se pudo obtener la asignación",
				});
				return null;
			}
		},
		[canRead, addToast]
	);

	const createAsignacion = useCallback(
		async (
			data: dataAsignacion
		): Promise<{
			ok: boolean;
			fieldErrors?: Record<string, string>;
			message?: string;
		}> => {
			if (!canAsign) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No puedes asignar cubículos",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setSaving(true);
			try {
				const created = await cubiculoService.createAsignacion(data);
				setAsignaciones((prev) => [...prev, created]);
				addToast({
					type: "success",
					title: "Asignación creada",
					message: `La asignación fue creada exitosamente`,
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
		[canAsign, addToast, parseBackendError]
	);

	const toggleEstadoAsignacion = useCallback(
		async (id: number): Promise<{ ok: boolean; message?: string }> => {
			if (!canAsign) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No puedes actualizar asignaciones de cubículos",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setSaving(true);
			try {
				const asignacion = await cubiculoService.getAsignacionById(id);
				if (!asignacion) {
					throw new Error("Asignación no encontrada");
				}
				const updated = await cubiculoService.toggleEstadoAsignacion(id);
				setAsignaciones((prev) => prev.map((c) => (c.id === id ? updated : c)));
				addToast({
					type: "success",
					title: "Asignación actualizada",
					message: `La asignación fue actualizada exitosamente`,
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
		[canAsign, addToast, parseBackendError]
	);

	const deleteAsignacion = useCallback(
		async (id: number): Promise<{ ok: boolean; message?: string }> => {
			if (!canDelete) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No puedes eliminar asignaciones de cubículos",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setSaving(true);
			try {
				await cubiculoService.deleteAsignacion(id);
				setAsignaciones((prev) => prev.filter((c) => c.id !== id));
				addToast({
					type: "success",
					title: "Asignación eliminada",
					message: "La asignación fue eliminada exitosamente",
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
		if (canRead) {
			loadCubiculos();
		}
		if (canAsign) {
			loadAsignacionesCubiculos();
		}
		loadAuxiliaryData();
	}, [
		canRead,
		canAsign,
		loadCubiculos,
		loadAsignacionesCubiculos,
		loadAuxiliaryData,
	]);

	return {
		cubiculos,
		cubiculosSedes,
		usuariosSedes,
		loadCubiculosBySede,
		sedes,
		asignaciones,
		loading,
		saving,
		permissionsLoading,
		error,
		canRead,
		canCreate,
		canUpdate,
		canDelete,
		canAsign,
		loadCubiculos,
		createCubiculo,
		updateCubiculo,
		deleteCubiculo,
		createAsignacion,
		toggleEstadoAsignacion,
		deleteAsignacion,
		getCubiculoById,
		getAsignacionById,
		checkUserPermission,
	};
};
