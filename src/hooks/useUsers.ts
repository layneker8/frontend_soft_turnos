import { useState, useEffect, useCallback } from "react";
import { userService } from "@/services/userService";
import { usePermissions } from "@/hooks/usePermissions";
import { useToastStore } from "@/stores/toastStore";
import { USER_PERMISSIONS, SEDE_PERMISSIONS } from "@/constants/permissions";
import type { FullUser, CreateUserData, UpdateUserData } from "@/@types/users";
import type { Sede, Rol } from "@/@types/index";

export const useUsers = () => {
	const [users, setUsers] = useState<FullUser[]>([]);
	const [sedes, setSedes] = useState<Sede[]>([]);
	const [roles, setRoles] = useState<Rol[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const {
		hasAnyPermission,
		checkUserPermission,
		loading: permissionsLoading,
	} = usePermissions();
	const { addToast } = useToastStore();

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

	// /**
	//  * Cargar cubículos de una sede específica
	//  */
	// const loadCubiculosBySede = useCallback(
	// 	async (sedeId: number) => {
	// 		if (!canReadSedes) {
	// 			setCubiculos([]);
	// 			return;
	// 		}

	// 		try {
	// 			const cubiculosData = await userService.getCubiculosBySede(sedeId);
	// 			setCubiculos(cubiculosData);
	// 		} catch (err) {
	// 			console.error("Error cargando cubículos:", err);
	// 			setCubiculos([]);
	// 			addToast({
	// 				type: "error",
	// 				title: "Error",
	// 				message: "No se pudieron cargar los cubículos de la sede",
	// 			});
	// 		}
	// 	},
	// 	[canReadSedes, addToast]
	// );

	/**
	 * Crear un nuevo usuario
	 */
	const createUser = useCallback(
		async (userData: CreateUserData): Promise<boolean> => {
			if (!canCreate) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No tienes permisos para crear usuarios",
				});
				return false;
			}

			setLoading(true);
			try {
				const newUser = await userService.createUser(userData);
				const fullNewUser = await getUserById(newUser.id_usuario);
				setUsers((prev) => [...prev, fullNewUser || newUser]);

				addToast({
					type: "success",
					title: "Usuario creado",
					message: `El usuario ${newUser.nombre_user} fue creado exitosamente`,
				});
				return true;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al crear usuario";
				addToast({
					type: "error",
					title: "Error",
					message: errorMessage,
				});
				return false;
			} finally {
				setLoading(false);
			}
		},
		[canCreate, addToast]
	);

	/**
	 * Actualizar un usuario existente
	 */
	const updateUser = useCallback(
		async (id: number, userData: UpdateUserData): Promise<boolean> => {
			if (!canUpdate) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No tienes permisos para actualizar usuarios",
				});
				return false;
			}

			setLoading(true);
			try {
				const updatedUser = await userService.updateUser(id, userData);
				const fullUpdatedUser = await getUserById(updatedUser.id_usuario);
				setUsers((prev) =>
					prev.map((user) =>
						user.id_usuario === id ? fullUpdatedUser || updatedUser : user
					)
				);

				addToast({
					type: "success",
					title: "Usuario actualizado",
					message: `El usuario ${updatedUser.nombre_user} fue actualizado exitosamente`,
				});
				return true;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al actualizar usuario";
				addToast({
					type: "error",
					title: "Error",
					message: errorMessage,
				});
				return false;
			} finally {
				setLoading(false);
			}
		},
		[canUpdate, addToast]
	);

	/**
	 * Eliminar un usuario
	 */
	const deleteUser = useCallback(
		async (id: number): Promise<boolean> => {
			if (!canDelete) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No tienes permisos para eliminar usuarios",
				});
				return false;
			}

			setLoading(true);
			try {
				await userService.deleteUser(id);
				setUsers((prev) => prev.filter((user) => user.id_usuario !== id));

				addToast({
					type: "success",
					title: "Usuario eliminado",
					message: "El usuario fue eliminado exitosamente",
				});
				return true;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al eliminar usuario";
				addToast({
					type: "error",
					title: "Error",
					message: errorMessage,
				});
				return false;
			} finally {
				setLoading(false);
			}
		},
		[canDelete, addToast]
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
		[canRead, addToast]
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

		// Utilidades
		checkUserPermission,
	};
};
