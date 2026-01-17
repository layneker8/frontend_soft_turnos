import { useState, useEffect, useCallback } from "react";
import { userService } from "@/services/userService";
import { usePermissions } from "@/hooks/usePermissions";
import { useToastStore } from "@/stores/toastStore";
import { USER_PERMISSIONS, SEDE_PERMISSIONS } from "@/constants/permissions";
import type { FullUser, CreateUserData, UpdateUserData } from "@/@types/users";
import type { FullRoles } from "@/@types/roles";
import type { FullSede } from "@/@types/sedes";

export const useUsers = () => {
	const [users, setUsers] = useState<FullUser[]>([]);
	const [sedes, setSedes] = useState<FullSede[]>([]);
	const [roles, setRoles] = useState<FullRoles[]>([]);
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
			err: unknown,
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
						},
					);
				}
			}
			return { message, fieldErrors };
		},
		[],
	);

	// Permisos necesarios
	const canRead = hasAnyPermission([
		USER_PERMISSIONS.READ,
		USER_PERMISSIONS.MANAGE,
	]);
	const canCreate = hasAnyPermission([
		USER_PERMISSIONS.CREATE,
		USER_PERMISSIONS.MANAGE,
	]);
	const canUpdate = hasAnyPermission([
		USER_PERMISSIONS.UPDATE,
		USER_PERMISSIONS.MANAGE,
	]);
	const canDelete = hasAnyPermission([
		USER_PERMISSIONS.DELETE,
		USER_PERMISSIONS.MANAGE,
	]);
	const canReadSedes = hasAnyPermission([
		SEDE_PERMISSIONS.READ,
		SEDE_PERMISSIONS.MANAGE,
	]);

	/**
	 * Cargar todos los usuarios
	 */
	const loadUsers = useCallback(async () => {
		if (!canRead) {
			setError("No tienes permisos para ver los usuarios");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const usersData = await userService.getAllUsers();
			setUsers(usersData);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Error al cargar usuarios";
			setError(errorMessage);
			addToast({
				type: "error",
				title: "Error",
				message: errorMessage,
			});
		} finally {
			setLoading(false);
		}
	}, [canRead, addToast]);

	/**
	 * Cargar datos auxiliares (sedes y roles)
	 */
	const loadAuxiliaryData = useCallback(async () => {
		try {
			const [sedesData, rolesData] = await Promise.all([
				canReadSedes ? userService.getAllSedes() : Promise.resolve([]),
				userService.getAllRoles(),
			]);

			setSedes(sedesData);
			setRoles(rolesData);
		} catch (err) {
			console.error("Error cargando datos auxiliares:", err);
			addToast({
				type: "warning",
				title: "Advertencia",
				message: "No se pudieron cargar algunos datos",
			});
		}
	}, [canReadSedes, addToast]);

	/**
	 * Crear un nuevo usuario
	 */
	const createUser = useCallback(
		async (
			userData: CreateUserData,
		): Promise<{
			ok: boolean;
			fieldErrors?: Record<string, string>;
			message?: string;
		}> => {
			if (!canCreate) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No tienes permisos para crear usuarios",
				});
				return { ok: false, message: "Sin permisos" };
			}

			setSaving(true);
			try {
				const newUser = await userService.createUser(userData);
				setUsers((prev) => [...prev, newUser]);

				addToast({
					type: "success",
					title: "Usuario creado",
					message: `El usuario ${newUser.nombre_user} fue creado exitosamente`,
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
		[canCreate, addToast, parseBackendError],
	);

	/**
	 * Actualizar un usuario existente
	 */
	const updateUser = useCallback(
		async (
			id: number,
			userData: UpdateUserData,
		): Promise<{
			ok: boolean;
			fieldErrors?: Record<string, string>;
			message?: string;
		}> => {
			if (!canUpdate) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No tienes permisos para actualizar usuarios",
				});
				return { ok: false, message: "Sin permisos" };
			}

			setSaving(true);
			try {
				const updatedUser = await userService.updateUser(id, userData);
				setUsers((prev) =>
					prev.map((user) => (user.id_usuario === id ? updatedUser : user)),
				);

				addToast({
					type: "success",
					title: "Usuario actualizado",
					message: `El usuario ${updatedUser.nombre_user} fue actualizado exitosamente`,
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
		[canUpdate, addToast, parseBackendError],
	);

	/**
	 * Eliminar un usuario
	 */
	const deleteUser = useCallback(
		async (id: number): Promise<{ ok: boolean; message?: string }> => {
			if (!canDelete) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No tienes permisos para eliminar usuarios",
				});
				return { ok: false, message: "Sin permisos" };
			}

			setSaving(true);
			try {
				await userService.deleteUser(id);
				setUsers((prev) => prev.filter((user) => user.id_usuario !== id));

				addToast({
					type: "success",
					title: "Usuario eliminado",
					message: "El usuario fue eliminado exitosamente",
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
		[canDelete, addToast, parseBackendError],
	);

	/**
	 * Obtener un usuario específico
	 */
	const getUserById = useCallback(
		async (id: number): Promise<FullUser | null> => {
			if (!canRead) {
				return null;
			}

			try {
				return await userService.getUserById(id);
			} catch (err) {
				console.error("Error obteniendo usuario:", err);
				addToast({
					type: "error",
					title: "Error",
					message: "No se pudo obtener la información del usuario",
				});
				return null;
			}
		},
		[canRead, addToast],
	);

	// enviar correo para restablecimiento de contraseña o verificación
	const sendEmailToUser = useCallback(
		async (
			username: string,
			mode: "reset_password" | "verify_account" = "reset_password",
		): Promise<{ ok: boolean; message?: string }> => {
			if (!canUpdate) {
				return { ok: false, message: "Sin permisos" };
			}
			try {
				let sendMail = null;
				if (mode === "verify_account") {
					sendMail = await userService.sendEmailToUser(username);
				}
				if (mode === "reset_password") {
					sendMail = await userService.sendPasswordResetEmail(username);
				}
				return sendMail || { ok: false, message: "Error enviando correo" };
			} catch (err) {
				const { message } = parseBackendError(err);
				return { ok: false, message };
			}
		},
		[canUpdate, parseBackendError],
	);

	// Cargar datos iniciales
	useEffect(() => {
		if (canRead) {
			loadUsers();
		}
		loadAuxiliaryData();
	}, [canRead, loadUsers, loadAuxiliaryData]);

	return {
		// Estado
		users,
		sedes,
		roles,
		loading,
		saving,
		permissionsLoading,
		error,

		// Permisos
		canRead,
		canCreate,
		canUpdate,
		canDelete,

		// Acciones
		loadUsers,
		createUser,
		updateUser,
		deleteUser,
		getUserById,
		sendEmailToUser,

		// Utilidades
		checkUserPermission,
	};
};
